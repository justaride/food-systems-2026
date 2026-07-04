import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildDraftLibraryAiCard,
  findStaleLibraryAnalysisRecordIdentities,
  toLibraryAnalysisUpsertPayload,
} from '../../src/lib/library-analysis-processing'
import type { LibraryAnalysisInventoryRow } from '../../src/lib/library-analysis-inventory'

const row: LibraryAnalysisInventoryRow = {
  sourceKind: 'document',
  sourceKey: 'document:doc-1',
  title: 'Matmakt report',
  canonicalPath: 'research/bibliotek/matmakt.md',
  linkedDocumentId: 'doc-1',
  linkedSourceDocId: 'src-1',
  linkedReportId: null,
  linkedThesisId: null,
  citationReadiness: 'citable_external',
  hasLocalFile: true,
  hasDbLink: true,
  wordCount: 1200,
  contentHash: 'a'.repeat(64),
  riskFlags: [],
  claimCandidateCount: 0,
  classification: {
    status: 'approved_internal',
    usageRule: 'safe_for_ai_context',
    reviewRequired: false,
    reasons: [],
  },
}

describe('library analysis processing', () => {
  it('builds a complete draft AI card from an inventory row', () => {
    const card = buildDraftLibraryAiCard(row)

    assert.equal(card.status, 'approved_internal')
    assert.equal(card.recommendedUsageRule, 'safe_for_ai_context')
    assert.equal(card.citationStatus, 'citable_external')
    assert.match(card.shortSummary, /Matmakt report/)
    assert.deepEqual(card.claimCandidates, [])
    assert.ok(card.controlLinks.some(link => link.href === '/bibliotek/doc-1'))
  })

  it('maps inventory rows into deterministic Prisma upsert payloads', () => {
    const payload = toLibraryAnalysisUpsertPayload(row)

    assert.equal(payload.where.sourceKind_sourceKey.sourceKind, 'document')
    assert.equal(payload.where.sourceKind_sourceKey.sourceKey, 'document:doc-1')
    assert.equal(payload.create.status, 'approved_internal')
    assert.equal(payload.create.usageRule, 'safe_for_ai_context')
    assert.equal(payload.create.documentId, 'doc-1')
    assert.equal(payload.update.contentHash, 'a'.repeat(64))
    assert.deepEqual(payload.create.claimCandidates, [])
  })

  it('identifies stale analysis records that disappeared from the current inventory', () => {
    const stale = findStaleLibraryAnalysisRecordIdentities(
      [row],
      [
        { sourceKind: 'document', sourceKey: 'document:doc-1' },
        {
          sourceKind: 'library_file',
          sourceKey: 'library_file:research/bibliotek/duplicate.md',
        },
      ],
    )

    assert.deepEqual(stale, [
      {
        sourceKind: 'library_file',
        sourceKey: 'library_file:research/bibliotek/duplicate.md',
      },
    ])
  })
})
