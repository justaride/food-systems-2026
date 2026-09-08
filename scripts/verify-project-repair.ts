// Read-only acceptance probes for the September app repair. Run against the
// isolated rehearsal database before running against any release target.
import 'dotenv/config'
import assert from 'node:assert/strict'
import { prisma } from '../src/lib/db'
import { getProducers, getProducerCount } from '../src/lib/queries/producers'
import { getLibraryAnalysisRecordCount, getLibraryAnalysisRecords } from '../src/lib/queries/library-analysis'
import { getPrimaryProducerDeliveries } from '../src/lib/queries/supply-chain'
import { getKonsernIndex, getKonsernDossier } from '../src/lib/queries/ownership'
import { getFinancialTrends } from '../src/lib/queries/financials'
import { LEGACY_COMPANY_ORGNRS } from '../src/lib/company-identities'
import { getDocumentById, getDocumentsList } from '../src/lib/queries/documents'
import { getPersonProfiles } from '../src/lib/queries/persons'
import { currentBoardCompanyCount } from '../src/lib/board-interlocks'
import { getWorkQueue } from '../src/lib/queries/work-queue'
import { generateBibtexFile } from '../src/lib/bibtex'
import { isQuarantinedSource, SYNTHETIC_MATSVINN_DOCUMENT_ID, SOURCE_QUARANTINE_MESSAGE } from '../src/lib/source-quarantine'

async function main() {
  const producerCount = await getProducerCount()
  assert.ok(producerCount > 100, 'Needs a populated producer register')
  const target = (await getProducers({ take: 1, skip: Math.min(50100, producerCount - 1) }))[0]
  const matches = await getProducers({ search: target.orgNr })
  assert.ok(matches.some(p => p.id === target.id), 'Search must reach outside the first page')
  assert.equal(await getProducerCount(target.orgNr), matches.length)
  // The production library also contains the real law as a separate source.
  // Scope this acceptance probe to the synthetic document's canonical path.
  const quarantineQuery = 'thesis-matsvinnloven-2025'
  const blocked = await getLibraryAnalysisRecords({ query: quarantineQuery })
  assert.ok(blocked.length > 0)
  assert.ok(blocked.every(isQuarantinedSource))
  assert.ok(blocked.every(r => r.status === 'blocked' && r.usageRule === 'do_not_use_for_claims' && !r.externalClaimEligible))
  assert.equal(await getLibraryAnalysisRecordCount({ query: quarantineQuery, usage: 'safe_for_ai_context' }), 0)
  const document = await getDocumentById(SYNTHETIC_MATSVINN_DOCUMENT_ID)
  assert.equal(document?.content, SOURCE_QUARANTINE_MESSAGE)
  assert.equal(document?.author, null)
  const listedDocument = (await getDocumentsList()).find(row => row.id === SYNTHETIC_MATSVINN_DOCUMENT_ID)
  assert.equal(listedDocument?.author, null)
  assert.equal(listedDocument?.wordCount, 0)
  assert.ok(!generateBibtexFile(await prisma.thesis.findMany(), []).includes('@mastersthesis{matsvinnloven-2025,'))
  const flows = await prisma.flowCell.findMany({ where: { cellId: 'food-waste-digestate' } })
  assert.equal(flows.length, 20)
  assert.ok(flows.every(f => f.quantity === null && f.quality === 'unknown' && f.holeReason))
  assert.equal(await prisma.deliveryVolume.count({ where: { source: 'Landbruksdirektoratet', OR: [{ buyerId: { not: null } }, { buyerName: { not: null } }] } }), 0)
  const deliveries = await getPrimaryProducerDeliveries()
  const companies = await getFinancialTrends()
  assert.ok(companies.every(c => !LEGACY_COMPANY_ORGNRS.includes(c.orgNr)))
  const index = await getKonsernIndex()
  assert.ok(index.length > 0)
  for (const group of index) {
    assert.ok(await prisma.company.findUnique({ where: { id: group.rootCompanyId } }), 'Index root must resolve in this database')
    const dossier = await getKonsernDossier(group.slug)
    assert.equal(dossier?.root.id, group.rootCompanyId)
    assert.equal(dossier?.metrics.totalRevenue, group.totalRevenue)
    assert.equal(dossier?.metrics.treeSize, group.treeSize)
    assert.equal(dossier?.metrics.daysSinceBrregRefresh, group.daysSinceBrregRefresh)
  }
  const persons = await getPersonProfiles()
  assert.ok(persons.length > 0)
  assert.ok(persons.every(person => person.tags.includes('interlocking-director') === (currentBoardCompanyCount(person.roles) > 1)))
  const queue = await getWorkQueue()
  const actorQueue = queue.filter(item => item.kind === 'actor')
  const actorRows = (await prisma.actor.findMany({ where: { OR: [{ priorityTier: 'p1' }, { specificAsk: { not: null } }] } })).filter(actor => actor.priorityTier === 'p1' || actor.specificAsk?.trim())
  assert.equal(actorQueue.length, actorRows.length)
  for (const actor of actorRows) {
    const item = actorQueue.find(row => row.id === `actor-${actor.id}`)
    assert.ok(item)
    if (actor.owner?.trim()) assert.equal(item.owner, actor.owner.trim())
    if (actor.nextStep?.trim()) assert.equal(item.nextAction, actor.nextStep.trim())
  }
  console.log(JSON.stringify({ producerCount, producerBeyondFirstPage: true, quarantineReadProjection: true, quarantineBibtexExport: true, quarantinedRows: blocked.length, c3Holes: flows.length, legacyBuyersRemoved: true, deliveryCommodityCount: deliveries.byCommodity.length, financialCompanies: companies.length, validKonsernRoots: index.length, consistentInterlockProfiles: persons.length, actorFollowups: actorQueue.length, totalWorkItems: queue.length }, null, 2))
}
main().catch(error => { console.error(error); process.exitCode = 1 }).finally(() => prisma.$disconnect())
