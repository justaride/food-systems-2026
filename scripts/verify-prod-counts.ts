import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { knowledgeBaseMinimums } from '../src/lib/data-status'
import {
  CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
  CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
  OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
  OFFICIAL_MATSVINNLOVEN_URL,
  SYNTHETIC_MATSVINNLOVEN_THESIS_ID,
  classifyMatsvinnlovenAcademicIdentityCounts,
} from '../src/lib/citations/matsvinnloven-identity-migration'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const INNHENTING_2026_08_05_SOURCE_DOC_COUNT = 55

type Expectation = {
  label: string
  count: () => Promise<number>
  minimum: number
  seedEmpty?: boolean
}

const expectations: Expectation[] = [
  { label: 'Document', count: () => prisma.document.count(), minimum: knowledgeBaseMinimums.documents },
  { label: 'SourceDoc', count: () => prisma.sourceDoc.count(), minimum: 199 },
  { label: 'Report', count: () => prisma.report.count(), minimum: 137 },
  { label: 'Insight', count: () => prisma.insight.count(), minimum: 132 },
  {
    label: 'Thesis',
    count: () => prisma.thesis.count(),
    minimum: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
  },
  { label: 'SourceCitation', count: () => prisma.sourceCitation.count(), minimum: knowledgeBaseMinimums.sourceCitations },
  { label: 'FieldCitation', count: () => prisma.fieldCitation.count(), minimum: knowledgeBaseMinimums.fieldCitations },
  { label: 'LibraryAnalysisRecord', count: () => prisma.libraryAnalysisRecord.count(), minimum: knowledgeBaseMinimums.libraryAnalysisRecords },
  { label: 'Company', count: () => prisma.company.count(), minimum: knowledgeBaseMinimums.companies },
  { label: 'CompanyDocumentRef', count: () => prisma.companyDocumentRef.count(), minimum: 1271 },
  { label: 'BoardMember', count: () => prisma.boardMember.count(), minimum: 1800 },
  { label: 'PersonProfile', count: () => prisma.personProfile.count(), minimum: knowledgeBaseMinimums.personProfiles },
  { label: 'CompanyOwnership', count: () => prisma.companyOwnership.count(), minimum: 160 },
  { label: 'BusinessRelationship', count: () => prisma.businessRelationship.count(), minimum: 105 },
  { label: 'CompanyProperty', count: () => prisma.companyProperty.count(), minimum: 104 },
  { label: 'Meeting', count: () => prisma.meeting.count(), minimum: 9 },
  { label: 'Communication', count: () => prisma.communication.count(), minimum: 0, seedEmpty: true },
  { label: 'MediaTheme', count: () => prisma.mediaTheme.count(), minimum: 6 },
  { label: 'MediaOutlet', count: () => prisma.mediaOutlet.count(), minimum: 8 },
  { label: 'MediaEntry', count: () => prisma.mediaEntry.count(), minimum: 10 },
  { label: 'TeamMember', count: () => prisma.teamMember.count(), minimum: 9 },
  { label: 'Deliverable', count: () => prisma.deliverable.count(), minimum: 6 },
  { label: 'Actor', count: () => prisma.actor.count(), minimum: knowledgeBaseMinimums.actors },
]

type Severity = 'ok' | 'fail'

function evaluate(actual: number, minimum: number, seedEmpty: boolean): Severity {
  if (seedEmpty) return actual >= 0 ? 'ok' : 'fail'
  return actual >= minimum ? 'ok' : 'fail'
}

function icon(sev: Severity): string {
  if (sev === 'ok') return '  OK  '
  return ' FAIL '
}

async function main() {
  console.log('\nFood Systems 2026 — prod count verification')
  console.log('Minimums reflect the verified local canonical corpus on 2026-07-19.\n')

  const results: Array<{ label: string; actual: number; minimum: number; sev: Severity; note?: string }> = []

  for (const exp of expectations) {
    try {
      const actual = await exp.count()
      const sev = evaluate(actual, exp.minimum, exp.seedEmpty ?? false)
      const note = exp.seedEmpty ? 'tom i seed per design' : undefined
      results.push({ label: exp.label, actual, minimum: exp.minimum, sev, note })
    } catch (err) {
      results.push({
        label: exp.label,
        actual: -1,
        minimum: exp.minimum,
        sev: 'fail',
        note: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const countFor = (label: string) => results.find(result => result.label === label)?.actual ?? -1
  const academicIdentityCounts = {
    reports: countFor('Report'),
    theses: countFor('Thesis'),
    sourceDocs: countFor('SourceDoc'),
    totalEvidence: countFor('Report') + countFor('Thesis') + countFor('SourceDoc'),
  }
  const matsvinnlovenIdentityCounts = {
    ...academicIdentityCounts,
    sourceDocs:
      academicIdentityCounts.sourceDocs - INNHENTING_2026_08_05_SOURCE_DOC_COUNT,
    totalEvidence:
      academicIdentityCounts.totalEvidence - INNHENTING_2026_08_05_SOURCE_DOC_COUNT,
  }
  const academicIdentityState = classifyMatsvinnlovenAcademicIdentityCounts(
    matsvinnlovenIdentityCounts,
  )
  results.push({
    label: 'AcademicIdentity',
    actual: matsvinnlovenIdentityCounts.totalEvidence,
    minimum: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
    sev: academicIdentityState === 'invalid' ? 'fail' : 'ok',
    note: academicIdentityState === 'invalid'
      ? `invalid exact report/thesis/source pair after the exact 55-row 2026-08-05 intake boundary ${JSON.stringify({ academicIdentityCounts, matsvinnlovenIdentityCounts })}`
      : `exact ${academicIdentityState} identity pair after excluding the separately controlled 55-row 2026-08-05 intake`,
  })

  try {
    const [syntheticTheses, lawCandidates] = await Promise.all([
      prisma.thesis.count({ where: { id: SYNTHETIC_MATSVINNLOVEN_THESIS_ID } }),
      prisma.sourceDoc.findMany({
        where: {
          OR: [
            { id: OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID },
            { url: { contains: '2025-06-20-103' } },
          ],
        },
        select: { id: true, url: true, provenanceType: true, documentId: true },
      }),
    ])
    const exactOfficialSource = lawCandidates.length === 1 &&
      lawCandidates[0].id === OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID &&
      lawCandidates[0].url === OFFICIAL_MATSVINNLOVEN_URL &&
      lawCandidates[0].provenanceType === 'official_primary' &&
      lawCandidates[0].documentId === null
    const rowsMatchState = academicIdentityState === 'pre_migration'
      ? syntheticTheses === 1 && lawCandidates.length === 0
      : academicIdentityState === 'post_migration'
        ? syntheticTheses === 0 && exactOfficialSource
        : false
    results.push({
      label: 'IdentityRows',
      actual: rowsMatchState ? 1 : 0,
      minimum: 1,
      sev: rowsMatchState ? 'ok' : 'fail',
      note: rowsMatchState
        ? `${academicIdentityState}: synthetic Thesis and official SourceDoc IDs match`
        : `row mismatch: synthetic Thesis=${syntheticTheses}, law candidates=${lawCandidates.length}`,
    })
  } catch (err) {
    results.push({
      label: 'IdentityRows',
      actual: -1,
      minimum: 1,
      sev: 'fail',
      note: err instanceof Error ? err.message : String(err),
    })
  }

  const pad = (s: string, n: number) => s.padEnd(n)
  const rpad = (s: string, n: number) => s.padStart(n)

  console.log(`${pad('Status', 7)}${pad('Tabell', 24)}${rpad('Actual', 10)}${rpad('Minimum', 12)}  Merknad`)
  console.log('-'.repeat(80))

  for (const r of results) {
    const line = `[${icon(r.sev)}]${pad('', 1)}${pad(r.label, 24)}${rpad(String(r.actual), 10)}${rpad(String(r.minimum), 12)}  ${r.note ?? ''}`
    console.log(line)
  }

  const failures = results.filter((r) => r.sev === 'fail').length
  console.log('')
  if (failures > 0) {
    console.log(`Result: ${failures} FAIL`)
    process.exitCode = 1
  } else {
    console.log('Result: OK — alle tabeller møter kanonisk minimum')
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
