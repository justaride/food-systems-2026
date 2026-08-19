import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  auditLibraryAnalysisLedgerLiveParity,
  buildDraftLibraryAiCard,
  buildLibraryAnalysisSyncPlan,
  findStaleLibraryAnalysisRecordIdentities,
  partitionLibraryAnalysisRecordsForLiveLedger,
  libraryAnalysisPayloadHash,
  reconcileLibraryAnalysisUpsertPayload,
  toLibraryAnalysisCasWhere,
  toLibraryAnalysisRunCreatePayload,
  toLibraryAnalysisUpsertPayload,
  type ExistingLibraryAnalysisRecord,
} from '../../src/lib/library-analysis-processing'
import type { LibraryAnalysisInventoryRow } from '../../src/lib/library-analysis-inventory'

const citationPolicyHash = 'c'.repeat(64)

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
  externalCitationEligible: true,
  currentExternalCitationPolicyHash: citationPolicyHash,
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

function existingRecord(
  source: LibraryAnalysisInventoryRow = row,
  overrides: Partial<ExistingLibraryAnalysisRecord> = {},
): ExistingLibraryAnalysisRecord {
  const payload = toLibraryAnalysisUpsertPayload(source, {
    processedAt: new Date('2026-07-19T10:00:00.000Z'),
  }).create
  return {
    ...payload,
    reviewedAt: null,
    reviewer: null,
    updatedAt: '2026-07-19T10:05:00.000Z',
    ...overrides,
  }
}

function humanExternalApproval(
  source: LibraryAnalysisInventoryRow = row,
  overrides: Partial<ExistingLibraryAnalysisRecord> = {},
): ExistingLibraryAnalysisRecord {
  return existingRecord(source, {
    status: 'validated',
    usageRule: 'safe_for_external_claims',
    reviewStatus: 'approved',
    aiCard: {
      externalApprovalEvidence: {
        citationPolicyHash,
        eligibleCitationIds: ['citation-1'],
      },
    },
    reviewedAt: '2026-07-19T10:00:00.000Z',
    reviewer: 'Fagansvarlig',
    ...overrides,
  })
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

  it('partitions retained history away from the current live ledger', () => {
    const current = [row]
    const live = existingRecord(row)
    const stale = existingRecord({
      ...row,
      sourceKey: 'document:stale',
      linkedDocumentId: 'stale',
    })

    const partition = partitionLibraryAnalysisRecordsForLiveLedger(
      current,
      [stale, live],
    )

    assert.deepEqual(partition.liveRecords, [live])
    assert.deepEqual(partition.staleRetainedRecords, [stale])
  })

  it('builds a pure sync plan with explicit create, material_update, noop, and stale classes', () => {
    const noopRow = { ...row, sourceKey: 'document:noop', linkedDocumentId: 'noop' }
    const changedBefore = {
      ...row,
      sourceKey: 'document:changed',
      linkedDocumentId: 'changed',
    }
    const changedAfter = { ...changedBefore, contentHash: 'b'.repeat(64) }
    const createRow = { ...row, sourceKey: 'document:create', linkedDocumentId: 'create' }
    const staleRow = {
      ...row,
      sourceKey: 'document:stale',
      linkedDocumentId: 'stale',
    }

    const plan = buildLibraryAnalysisSyncPlan(
      [createRow, changedAfter, noopRow],
      [existingRecord(noopRow), existingRecord(changedBefore), existingRecord(staleRow)],
    )

    assert.deepEqual(plan.counts, {
      create: 1,
      material_update: 1,
      noop: 1,
      stale: 1,
    })
    assert.deepEqual(plan.keys.create, ['document:document:create'])
    assert.deepEqual(plan.keys.material_update, ['document:document:changed'])
    assert.deepEqual(plan.keys.noop, ['document:document:noop'])
    assert.deepEqual(plan.keys.stale, ['document:document:stale'])
    assert.equal(plan.stalePolicy, 'retain')
    const changedAction = plan.actions.find(action => action.key === 'document:document:changed')
    assert.ok(changedAction?.changedFields.includes('contentHash'))
    assert.deepEqual(changedAction?.expectedSnapshot, {
      sourceKind: 'document',
      sourceKey: 'document:changed',
      updatedAt: '2026-07-19T10:05:00.000Z',
      documentId: 'changed',
      sourceDocId: 'src-1',
      canonicalPath: 'research/bibliotek/matmakt.md',
      title: 'Matmakt report',
      status: 'approved_internal',
      usageRule: 'safe_for_ai_context',
      reviewStatus: 'not_required',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      wordCount: 1200,
      reviewedAt: null,
      reviewer: null,
    })
    const casWhere = toLibraryAnalysisCasWhere(changedAction!.expectedSnapshot!)
    assert.equal(casWhere.updatedAt.toISOString(), '2026-07-19T10:05:00.000Z')
    assert.equal(casWhere.contentHash, 'a'.repeat(64))
    assert.equal(casWhere.reviewStatus, 'not_required')
    assert.equal(casWhere.reviewer, null)
  })

  it('preserves an exact human external approval as a no-op', () => {
    const plan = buildLibraryAnalysisSyncPlan([row], [humanExternalApproval()])
    const action = plan.actions[0]!

    assert.equal(action.classification, 'noop')
    assert.equal(action.approvalAction, 'preserved')
    assert.deepEqual(action.changedFields, [])
  })

  it('preserves human approval fields while applying a material metadata update', () => {
    const changed = { ...row, title: 'Updated title' }
    const plan = buildLibraryAnalysisSyncPlan([changed], [humanExternalApproval()])
    const action = plan.actions[0]!

    assert.equal(action.classification, 'material_update')
    assert.equal(action.approvalAction, 'preserved')
    assert.deepEqual(action.changedFields, ['title'])
  })

  it('fails closed by revoking an approval marker without human provenance after content changes', () => {
    const machineApproval = humanExternalApproval(row, {
      reviewedAt: null,
      reviewer: null,
    })
    const changed = { ...row, contentHash: 'b'.repeat(64) }
    const plan = buildLibraryAnalysisSyncPlan([changed], [machineApproval])
    const action = plan.actions[0]!

    assert.equal(action.classification, 'material_update')
    assert.equal(action.approvalAction, 'revoked')
    assert.ok(action.approvalReasons.includes('review_provenance_missing'))
    assert.ok(action.approvalReasons.includes('content_hash_mismatch'))
  })

  it('audits ledger keys and hashes against live inventory without database IDs', () => {
    const exactLedger = `${JSON.stringify({
      sourceKind: row.sourceKind,
      sourceKey: row.sourceKey,
      contentHash: row.contentHash,
    })}\n`
    assert.deepEqual(
      auditLibraryAnalysisLedgerLiveParity(exactLedger, [row]).failures,
      [],
    )

    const mismatchedLedger = [
      JSON.stringify({
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
        contentHash: 'b'.repeat(64),
      }),
      JSON.stringify({
        sourceKind: 'library_file',
        sourceKey: 'library_file:stale.md',
        contentHash: 'c'.repeat(64),
      }),
    ].join('\n')
    const failures = auditLibraryAnalysisLedgerLiveParity(mismatchedLedger, [
      row,
      { ...row, sourceKey: 'document:missing', linkedDocumentId: 'missing' },
    ]).failures

    assert.ok(failures.includes('ledger/live-inventory contentHash mismatch: document:document:doc-1'))
    assert.ok(failures.includes('ledger/live-inventory key mismatch: missing ledger key document:document:missing'))
    assert.ok(failures.includes('ledger/live-inventory key mismatch: stale ledger key library_file:library_file:stale.md'))
  })

  it('preserves an unchanged exact human approval during routine processing', () => {
    const reconciliation = reconcileLibraryAnalysisUpsertPayload(row, {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      citationReadiness: 'citable_external',
      aiCard: {
        externalApprovalEvidence: {
          citationPolicyHash,
          eligibleCitationIds: ['citation-1'],
        },
      },
      contentHash: row.contentHash,
      riskFlags: [],
      claimCandidates: [],
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
    })

    assert.equal(reconciliation.approvalAction, 'preserved')
    assert.equal('status' in reconciliation.payload.update, false)
    assert.equal('usageRule' in reconciliation.payload.update, false)
    assert.equal('contentHash' in reconciliation.payload.update, false)
  })

  it('revokes and clears approval provenance when reviewed content changes', () => {
    const reconciliation = reconcileLibraryAnalysisUpsertPayload(
      { ...row, contentHash: 'b'.repeat(64) },
      {
        sourceKind: 'document',
        sourceKey: 'document:doc-1',
        documentId: 'doc-1',
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewStatus: 'approved',
        citationReadiness: 'citable_external',
        aiCard: {
          externalApprovalEvidence: {
            citationPolicyHash,
            eligibleCitationIds: ['citation-1'],
          },
        },
        contentHash: row.contentHash,
        riskFlags: [],
        claimCandidates: [],
        reviewedAt: '2026-07-19T10:00:00.000Z',
        reviewer: 'Fagansvarlig',
      },
    )

    assert.equal(reconciliation.approvalAction, 'revoked')
    assert.ok(reconciliation.reasons.includes('content_hash_mismatch'))
    assert.equal(reconciliation.payload.update.reviewStatus, 'queued')
    assert.equal(reconciliation.payload.update.reviewedAt, null)
    assert.equal(reconciliation.payload.update.reviewer, null)
  })

  it('revokes approval when the last answer-eligible external citation degrades', () => {
    const reconciliation = reconcileLibraryAnalysisUpsertPayload(
      {
        ...row,
        externalCitationEligible: false,
        currentExternalCitationPolicyHash: null,
      },
      {
        sourceKind: 'document',
        sourceKey: 'document:doc-1',
        documentId: 'doc-1',
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewStatus: 'approved',
        citationReadiness: 'citable_external',
        aiCard: {
          externalApprovalEvidence: {
            citationPolicyHash,
            eligibleCitationIds: ['citation-1'],
          },
        },
        contentHash: row.contentHash,
        riskFlags: [],
        claimCandidates: [],
        reviewedAt: '2026-07-19T10:00:00.000Z',
        reviewer: 'Fagansvarlig',
      },
    )

    assert.equal(reconciliation.approvalAction, 'revoked')
    assert.ok(reconciliation.reasons.includes('current_external_citation_policy_ineligible'))
    assert.equal(reconciliation.payload.update.reviewStatus, 'queued')
    assert.equal(reconciliation.payload.update.reviewedAt, null)
    assert.equal(reconciliation.payload.update.reviewer, null)
  })

  it('requires new human review when a different eligible locator appears', () => {
    const reconciliation = reconcileLibraryAnalysisUpsertPayload(
      {
        ...row,
        currentExternalCitationPolicyHash: 'd'.repeat(64),
      },
      {
        sourceKind: 'document',
        sourceKey: 'document:doc-1',
        documentId: 'doc-1',
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewStatus: 'approved',
        citationReadiness: 'citable_external',
        aiCard: {
          externalApprovalEvidence: {
            citationPolicyHash,
            eligibleCitationIds: ['citation-1'],
          },
        },
        contentHash: row.contentHash,
        riskFlags: [],
        claimCandidates: [],
        reviewedAt: '2026-07-19T10:00:00.000Z',
        reviewer: 'Fagansvarlig',
      },
    )

    assert.equal(reconciliation.approvalAction, 'revoked')
    assert.ok(reconciliation.reasons.includes('external_citation_policy_hash_mismatch'))
    assert.equal(reconciliation.payload.update.usageRule, 'safe_for_ai_context')
    assert.equal(reconciliation.payload.update.reviewStatus, 'queued')
  })
})

const runOptions = {
  runId: '2026-08-19T18:00:00.000Z-abcd1234',
  aiModel: 'deterministic-triage',
  promptVersion: 'triage-card-v1',
}

describe('library analysis run payloads', () => {
  it('carries the analysis and the run identity', () => {
    const payload = toLibraryAnalysisUpsertPayload(row).create
    const run = toLibraryAnalysisRunCreatePayload(payload, runOptions)

    assert.equal(run.sourceKind, payload.sourceKind)
    assert.equal(run.sourceKey, payload.sourceKey)
    assert.equal(run.title, payload.title)
    assert.equal(run.contentHash, payload.contentHash)
    assert.deepEqual(run.aiCard, payload.aiCard)
    assert.deepEqual(run.keyFindings, payload.keyFindings)
    assert.equal(run.runId, runOptions.runId)
    assert.equal(run.aiModel, runOptions.aiModel)
    assert.equal(run.promptVersion, runOptions.promptVersion)
    assert.match(run.payloadHash, /^[0-9a-f]{64}$/)
  })

  it('never carries review or publication authority', () => {
    const run = toLibraryAnalysisRunCreatePayload(toLibraryAnalysisUpsertPayload(row).create, runOptions)

    for (const authorityField of ['usageRule', 'reviewStatus', 'reviewer', 'reviewedAt', 'citationReadiness']) {
      assert.equal(
        Object.hasOwn(run, authorityField),
        false,
        `a run row must not carry ${authorityField}; authority lives on LibraryAnalysisRecord`,
      )
    }
  })

  it('gives two runs of the same analysis the same payload hash', () => {
    const payload = toLibraryAnalysisUpsertPayload(row, {
      processedAt: new Date('2026-08-19T09:00:00.000Z'),
    }).create
    const laterPayload = toLibraryAnalysisUpsertPayload(row, {
      processedAt: new Date('2026-08-19T21:00:00.000Z'),
    }).create

    const first = toLibraryAnalysisRunCreatePayload(payload, runOptions)
    const second = toLibraryAnalysisRunCreatePayload(laterPayload, {
      ...runOptions,
      runId: '2026-08-19T21:00:00.000Z-efgh5678',
      aiModel: 'claude-opus-5',
    })

    assert.notEqual(first.runId, second.runId)
    assert.equal(
      first.payloadHash,
      second.payloadHash,
      'processing time and model must not change the content address of an identical analysis',
    )
  })

  it('changes the payload hash when the analysis changes', () => {
    const base = toLibraryAnalysisUpsertPayload(row).create
    const changed = toLibraryAnalysisUpsertPayload({ ...row, wordCount: 9999 }).create

    assert.notEqual(libraryAnalysisPayloadHash(base), libraryAnalysisPayloadHash(changed))
  })

  it('ignores object key order when hashing', () => {
    const base = toLibraryAnalysisUpsertPayload(row).create
    const reordered = {
      ...base,
      aiCard: Object.fromEntries(
        Object.entries(base.aiCard as Record<string, unknown>).reverse(),
      ) as typeof base.aiCard,
    }

    assert.equal(libraryAnalysisPayloadHash(base), libraryAnalysisPayloadHash(reordered))
  })

  it('records the fresh analysis even when a human approval is preserved', () => {
    const reconciliation = reconcileLibraryAnalysisUpsertPayload(row, humanExternalApproval())
    assert.equal(reconciliation.approvalAction, 'preserved')

    // The record deliberately keeps the approved analysis, so the update is
    // narrow. The run row still holds the analysis this pass produced, which
    // was discarded before the run table existed.
    assert.equal(Object.hasOwn(reconciliation.payload.update, 'aiCard'), false)

    const run = toLibraryAnalysisRunCreatePayload(reconciliation.payload.create, runOptions)
    assert.deepEqual(run.aiCard, reconciliation.payload.create.aiCard)
    assert.match(run.payloadHash, /^[0-9a-f]{64}$/)
  })
})
