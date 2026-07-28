import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT,
  PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  inspectLibraryAnalysisRetainedHistory,
  validateLibraryAnalysisRetainedHistoryContract,
  type LibraryAnalysisRetainedHistoryDatabaseRow,
} from '../../src/lib/library-analysis-retained-history-contract'

function databaseRow(
  entry: (typeof LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES)[number],
): LibraryAnalysisRetainedHistoryDatabaseRow {
  return {
    id: entry.retainedRecordId,
    sourceKind: entry.sourceKind,
    sourceKey: entry.sourceKey,
    documentId: entry.expectedDocumentId,
    sourceDocId: entry.expectedSourceDocId,
    title: entry.expectedTitle,
    status: entry.expectedStatus,
    usageRule: entry.expectedUsageRule,
    reviewStatus: entry.expectedReviewStatus,
    contentHash: entry.expectedContentHashSha256,
    reviewedAt: entry.expectedReviewedAt,
    reviewer: entry.expectedReviewer,
    claimCandidates: [],
  }
}

function validFixture() {
  const currentInventory = LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.map(
    (entry) => ({
      sourceKind: entry.liveCounterpart.sourceKind,
      sourceKey: entry.liveCounterpart.sourceKey,
    }),
  )
  const liveRows: LibraryAnalysisRetainedHistoryDatabaseRow[] =
    currentInventory.map((identity, index) => ({
      id: `live-${index}`,
      ...identity,
      documentId: null,
      sourceDocId: null,
      title: `Live ${index}`,
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewStatus: 'not_required',
      contentHash: 'a'.repeat(64),
      reviewedAt: null,
      reviewer: null,
      claimCandidates: [],
    }))
  return {
    currentInventory,
    databaseRows: [
      ...liveRows,
      ...LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.map(databaseRow),
    ],
  }
}

describe('library analysis retained-history source contract', () => {
  it('pins the reviewed exact 17-row boundary and keeps adjacent drift separate', () => {
    assert.deepEqual(validateLibraryAnalysisRetainedHistoryContract(), [])
    assert.equal(LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length, 17)
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
      PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
    )
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.filter(
        (entry) => entry.sourceKind === 'document',
      ).length,
      15,
    )
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.filter(
        (entry) => entry.sourceKind === 'library_file',
      ).length,
      2,
    )
    assert.ok(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.every(
        (entry) =>
          entry.externalUse === false &&
          entry.expectedStatus === 'ai_draft' &&
          entry.expectedUsageRule === 'internal_background' &&
          !entry.expectedSourceDocId?.startsWith('src-yt-'),
      ),
    )
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT
        .projectionFreshnessMaterialUpdates,
      15,
    )
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT
        .projectionFreshnessIncludedInThisContract,
      false,
    )
    assert.equal(
      LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT.boundary
        .managedRuntimeSourceDocsSeparate,
      true,
    )
  })

  it('preserves the existing src-143 immutable retained dependency', () => {
    const entry = LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.find(
      (candidate) => candidate.expectedSourceDocId === 'src-143',
    )
    assert.deepEqual(entry && {
      retainedRecordId: entry.retainedRecordId,
      retainedIdentityKey: entry.retainedIdentityKey,
      expectedTitle: entry.expectedTitle,
      counterpart: entry.liveCounterpart.identityKey,
      protectedByContract: entry.protectedByContract,
    }, {
      retainedRecordId: 'cmqjoex2v00wvzpvmi24d0g5n',
      retainedIdentityKey: 'document:document:cmq8rsnhl000mekvmou6qjq2j',
      expectedTitle: 'Elintarvikemarkkinavaltuutettu toimintakertomus 2024',
      counterpart: 'source_doc:source_doc:src-143',
      protectedByContract:
        'reviewed-source-doc-identity-mirrors:2026-07-20-v1:stale-retained-immutable',
    })
  })

  it('accepts exact live plus retained partition and fails closed on drift', () => {
    const fixture = validFixture()
    const inspection = inspectLibraryAnalysisRetainedHistory(fixture)
    assert.deepEqual(inspection.issues, [])
    assert.deepEqual(inspection.summary, {
      contractRows: 17,
      currentInventoryRows: 17,
      persistedRows: 34,
      livePersistedRows: 17,
      retainedHistoryRows: 17,
      inventoryOnlyRows: 0,
      missingCounterpartRows: 0,
    })

    const driftedRows = fixture.databaseRows.map((row) =>
      row.id === LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES[0]!.retainedRecordId
        ? { ...row, contentHash: 'b'.repeat(64) }
        : row,
    )
    driftedRows.push({
      ...databaseRow(LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES[1]!),
      id: 'unreviewed-retained-row',
      sourceKey: 'document:unreviewed-retained-row',
    })
    const drifted = inspectLibraryAnalysisRetainedHistory({
      currentInventory: fixture.currentInventory.slice(1),
      databaseRows: driftedRows,
    })
    assert.ok(drifted.issues.some((issue) => /contentHash mismatch/.test(issue)))
    assert.ok(drifted.issues.some((issue) => /unreviewed retained database row/.test(issue)))
    assert.ok(drifted.issues.some((issue) => /live counterpart missing from current inventory/.test(issue)))
  })

  it('keeps the live checker structurally read-only', () => {
    const source = readFileSync(
      join(process.cwd(), 'scripts/check-library-analysis-retained-history.ts'),
      'utf8',
    )
    assert.match(source, /SET TRANSACTION READ ONLY/)
    assert.match(source, /projectionFreshness/)
    assert.doesNotMatch(
      source,
      /libraryAnalysisRecord\.(?:create|update|upsert|delete|deleteMany|updateMany)\s*\(/,
    )
  })
})
