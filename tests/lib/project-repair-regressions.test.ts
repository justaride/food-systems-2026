import assert from 'node:assert/strict'
import test from 'node:test'
import { parentConcentration } from '../../src/lib/parent-concentration'
import { boardInterlockTags, currentBoardCompanyCount } from '../../src/lib/board-interlocks'
import { isQuarantinedSource, quarantineDocument, quarantineLibraryRecord, SYNTHETIC_MATSVINN_DOCUMENT_ID } from '../../src/lib/source-quarantine'
import { generateBibtexFile, thesisToBibtex } from '../../src/lib/bibtex'
import { buildLibraryAnalysisStatusPayload, toLibraryAnalysisBadge } from '../../src/lib/queries/library-analysis'
import { projectLegacyLibraryAnalysisRecord } from '../../src/lib/knowledge/library-analysis-candidate-compat'
import { parsePage, pageUrl } from '../../src/lib/pagination'
import { resolvedCompanyOrgNr } from '../../src/lib/company-identities'
import { parseGapWorkQueue } from '../../src/lib/queries/work-queue'

test('unknown owners suppress HHI and CR3 instead of inventing one concentrated owner', () => {
  assert.deepEqual(parentConcentration([{ parent: 'Known', count: 49 }, { parent: 'Unknown', count: 51 }]), { hhi: null, cr3: null, knownSharePct: 49 })
  assert.deepEqual(parentConcentration([]), { hhi: null, cr3: null, knownSharePct: 0 })
  assert.deepEqual(parentConcentration([{ parent: 'A', count: 2 }, { parent: 'B', count: 1 }]), { hhi: 5556, cr3: 100, knownSharePct: 100 })
})

test('interlocks count distinct dated board companies, not role count or executive jobs', () => {
  const a = { companyId: 'a', companyName: 'A', role: 'Styreleder', fromYear: 2020, toYear: null }
  assert.equal(currentBoardCompanyCount([a, { ...a, role: 'Styremedlem' }, { ...a, companyId: 'b', companyName: 'B', role: 'CEO' }], 2026), 1)
  assert.equal(currentBoardCompanyCount([a, { ...a, companyId: 'b', companyName: 'B', toYear: 2024 }], 2026), 1)
  assert.equal(currentBoardCompanyCount([a, { ...a, companyId: 'b', companyName: 'B', fromYear: 2027 }], 2026), 1)
  assert.equal(currentBoardCompanyCount([a, { ...a, companyId: 'b', companyName: 'B' }], 2026), 2)
  assert.equal(currentBoardCompanyCount([a, { ...a, companyId: null }], 2026), 1)
  assert.deepEqual(boardInterlockTags(['interlocking-director', 'board-member'], [a, { ...a, role: 'Styremedlem' }]), ['board-member'])
  assert.ok(boardInterlockTags([], [a, { ...a, companyId: 'b', companyName: 'B' }]).includes('interlocking-director'))
})

test('synthetic identity overrides permissive legacy badges and AI use without changing review history', () => {
  const stored = { sourceKind: 'document', sourceKey: `document:${SYNTHETIC_MATSVINN_DOCUMENT_ID}`, documentId: SYNTHETIC_MATSVINN_DOCUMENT_ID, status: 'approved_internal', usageRule: 'safe_for_ai_context', riskFlags: [], reviewStatus: 'not_required', reviewer: 'Historical', claimCandidates: [], aiCard: {}, contentHash: 'a'.repeat(64) }
  const guarded = quarantineLibraryRecord(stored)
  assert.equal(guarded.status, 'blocked')
  assert.equal(guarded.reviewer, 'Historical')
  assert.equal(stored.status, 'approved_internal')
  assert.equal(toLibraryAnalysisBadge(stored)?.usageRule, 'do_not_use_for_claims')
  assert.equal(buildLibraryAnalysisStatusPayload([stored]).approvedForAi, 0)
  const candidate = projectLegacyLibraryAnalysisRecord(stored)
  assert.equal(candidate.machineUse, 'quarantined')
  assert.equal(candidate.humanReviewState, 'not_requested')
  assert.equal(isQuarantinedSource({ canonicalPath: 'research/thesis-matsvinnloven-2025.md' }), true)
  assert.equal(isQuarantinedSource({ id: 'legitimate-source' }), false)
  const document = { id: SYNTHETIC_MATSVINN_DOCUMENT_ID, author: 'Synthetic author', year: 2025, sourceCitations: [{ title: 'Synthetic' }] }
  const projected = quarantineDocument(document)
  assert.equal(projected.author, null)
  assert.deepEqual(projected.sourceCitations, [])
  assert.equal(document.author, 'Synthetic author')
  const syntheticThesis = { id: 'matsvinnloven-2025' } as Parameters<typeof thesisToBibtex>[0]
  assert.equal(thesisToBibtex(syntheticThesis), '')
  assert.match(generateBibtexFile([syntheticThesis], []), /Entries: 0 theses, 0 reports/)
})

test('pagination retains filters and rejects malformed page coordinates', () => {
  for (const input of ['-1', 'NaN', '1.5', 'Infinity', '100000000000000000']) assert.equal(parsePage(input), 1)
  assert.equal(parsePage('501'), 501)
  assert.equal(pageUrl('/ai-kunnskap', 2, { q: 'fôr & fisk', status: 'blocked' }), '/ai-kunnskap?q=f%C3%B4r+%26+fisk&status=blocked&page=2')
})

test('identity aliases resolve known placeholders without merging same-name legal branches', () => {
  assert.equal(resolvedCompanyOrgNr('919998919'), '986228608')
  assert.equal(resolvedCompanyOrgNr('NO-REITAN-EIE'), '915994415')
  assert.equal(resolvedCompanyOrgNr('986619968'), '986619968')
  assert.equal(resolvedCompanyOrgNr('SE-556021-0261'), 'SE-556021-0261')
})

test('work queue preserves source owners, dates and closed gates', () => {
  const item = { id: 'IG-004', title: 'Migration', priority: 'P0', status: 'closed', lastVerifiedAt: '2026-08-11', nextAction: 'Keep proof', currentState: 'Verified', evidenceRefs: ['receipt.md'], closureProcess: { ownerRole: 'Database owner', exitCriteria: ['Evidence'] } }
  const parsed = parseGapWorkQueue(JSON.stringify(item))[0]
  assert.equal(parsed.status, 'closed')
  assert.equal(parsed.checkedAt, '2026-08-11')
  assert.equal(parsed.owner, 'Database owner')
  assert.throws(() => parseGapWorkQueue('{}'))
})
