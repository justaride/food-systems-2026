import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  projectLegacyLibraryAnalysisRecord,
  summarizeLegacyLibraryCandidateProjection,
  type LegacyLibraryAnalysisRecordInput,
} from '../../src/lib/knowledge/library-analysis-candidate-compat'

const validHash = 'a'.repeat(64)

const legacyFixture: LegacyLibraryAnalysisRecordInput = {
  sourceKind: 'document',
  sourceKey: 'document:doc-1',
  documentId: 'doc-1',
  sourceDocId: null,
  status: 'approved_internal',
  usageRule: 'safe_for_ai_context',
  reviewStatus: 'not_required',
  aiCard: { shortSummary: 'Machine-generated legacy summary.' },
  claimCandidates: [],
  contentHash: validHash,
  reviewedAt: null,
  reviewer: null,
}

describe('legacy library analysis candidate compatibility', () => {
  it('maps approved_internal to reusable machine context without human acceptance', () => {
    const projected = projectLegacyLibraryAnalysisRecord(legacyFixture)

    assert.equal(projected.hasCandidate, true)
    assert.equal(projected.reason, 'projected')
    assert.equal(projected.machineState, 'candidate_complete')
    assert.equal(projected.machineUse, 'reusable_for_ai_context')
    assert.equal(projected.humanReviewState, 'not_requested')
    assert.equal(projected.legacyAuthorityState, 'unclassified')
    assert.deepEqual(projected.promotionByTarget, {
      internal: 'candidate',
      external: 'candidate',
    })
    assert.ok(
      projected.limitations.includes(
        'legacy_review_requires_authority_classification',
      ),
    )
  })

  it('keeps named, dated and approved legacy review signals unclassified', () => {
    for (const override of [
      { reviewer: 'Named person' },
      { reviewedAt: '2026-08-18T08:00:00.000Z' },
      { reviewStatus: 'approved' },
      { status: 'validated' },
    ]) {
      const projected = projectLegacyLibraryAnalysisRecord({
        ...legacyFixture,
        status: 'ai_draft',
        reviewStatus: 'not_required',
        reviewer: null,
        reviewedAt: null,
        ...override,
      })

      assert.equal(projected.humanReviewState, 'not_requested')
      assert.equal(projected.legacyAuthorityState, 'unclassified')
      assert.ok(
        projected.limitations.includes(
          'legacy_review_requires_authority_classification',
        ),
      )
      assert.deepEqual(projected.promotionByTarget, {
        internal: 'candidate',
        external: 'candidate',
      })
    }
  })

  it('does not fabricate candidate runs for untouched inventory rows', () => {
    for (const status of ['not_started', 'inventory_only']) {
      const projected = projectLegacyLibraryAnalysisRecord({
        ...legacyFixture,
        status,
        aiCard: null,
      })

      assert.equal(projected.hasCandidate, false)
      assert.equal(projected.reason, 'legacy_analysis_absent')
      assert.equal(projected.machineState, null)
      assert.equal(projected.machineUse, null)
    }
  })

  it('requires both a valid hash and an AI card for legacy completion', () => {
    for (const status of ['approved_internal', 'validated']) {
      assert.equal(
        projectLegacyLibraryAnalysisRecord({ ...legacyFixture, status })
          .machineState,
        'candidate_complete',
      )
      assert.equal(
        projectLegacyLibraryAnalysisRecord({
          ...legacyFixture,
          status,
          contentHash: null,
        }).machineState,
        'partial',
      )
      assert.equal(
        projectLegacyLibraryAnalysisRecord({
          ...legacyFixture,
          status,
          aiCard: null,
        }).machineState,
        'partial',
      )
    }
  })

  it('maps draft and review-required analyses to partial candidates', () => {
    for (const status of ['ai_draft', 'review_required']) {
      const projected = projectLegacyLibraryAnalysisRecord({
        ...legacyFixture,
        status,
      })
      assert.equal(projected.hasCandidate, true)
      assert.equal(projected.machineState, 'partial')
    }
  })

  it('quarantines blocked and superseded legacy candidates with explicit limitations', () => {
    const blocked = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      status: 'blocked',
      usageRule: 'safe_for_ai_context',
    })
    assert.equal(blocked.machineState, 'failed')
    assert.equal(blocked.machineUse, 'quarantined')
    assert.ok(blocked.limitations.includes('legacy_analysis_blocked'))

    const superseded = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      status: 'superseded',
      usageRule: 'safe_for_ai_context',
    })
    assert.equal(superseded.hasCandidate, true)
    assert.equal(superseded.machineState, 'superseded')
    assert.equal(superseded.machineUse, 'quarantined')
    assert.ok(superseded.limitations.includes('legacy_candidate_superseded'))
  })

  it('does not turn external or other legacy usage rules into authority', () => {
    for (const usageRule of [
      'internal_background',
      'safe_for_external_claims',
      'claim_candidate_review',
      'do_not_use_for_claims',
      'requires_actor_gate',
      'type_c_gap',
      'unknown_future_rule',
    ]) {
      const projected = projectLegacyLibraryAnalysisRecord({
        ...legacyFixture,
        status: 'ai_draft',
        usageRule,
      })
      assert.equal(projected.machineUse, 'candidate_only')
      assert.deepEqual(projected.promotionByTarget, {
        internal: 'candidate',
        external: 'candidate',
      })
    }
  })

  it('requires a valid hash and consistent source binding for exact identity', () => {
    const exactDocument = projectLegacyLibraryAnalysisRecord(legacyFixture)
    assert.equal(exactDocument.identityConfidence, 'exact')

    const exactSourceDoc = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:source-1',
      documentId: null,
      sourceDocId: 'source-1',
    })
    assert.equal(exactSourceDoc.identityConfidence, 'exact')

    for (const record of [
      { ...legacyFixture, sourceKey: 'document:other' },
      { ...legacyFixture, sourceKind: 'report' },
      { ...legacyFixture, documentId: null },
    ]) {
      assert.equal(
        projectLegacyLibraryAnalysisRecord(record).identityConfidence,
        'provisional',
      )
    }

    for (const contentHash of [null, '', 'A'.repeat(64), 'a'.repeat(63)]) {
      assert.equal(
        projectLegacyLibraryAnalysisRecord({
          ...legacyFixture,
          contentHash,
        }).identityConfidence,
        'unresolved',
      )
    }
  })

  it('distinguishes exact claim locators, partial grounding and no grounding', () => {
    const exact = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      claimCandidates: [
        { text: 'Page-bound claim', pageRef: 'PDF p. 4' },
        { text: 'Record-bound claim', recordRef: 'row:17' },
      ],
    })
    assert.equal(exact.evidenceLevel, 'exact_locator')

    const partial = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      claimCandidates: [
        { text: 'Page-bound claim', pageRef: 'PDF p. 4' },
        { text: 'Only excerpt grounding', evidence: 'Quoted evidence' },
      ],
    })
    assert.equal(partial.evidenceLevel, 'partial_locator')

    const sourceGrounded = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      claimCandidates: [
        { text: 'Document-level claim', sourcePath: 'research/source.pdf' },
      ],
    })
    assert.equal(sourceGrounded.evidenceLevel, 'partial_locator')

    for (const claimCandidates of [[], [{ text: 'Ungrounded claim' }], null]) {
      assert.equal(
        projectLegacyLibraryAnalysisRecord({
          ...legacyFixture,
          claimCandidates,
        }).evidenceLevel,
        'no_locator',
      )
    }
  })

  it('does not discard malformed claim entries when assessing locator completeness', () => {
    const projected = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      claimCandidates: [
        { text: 'Page-bound claim', pageRef: 'PDF p. 4' },
        'malformed legacy claim',
      ],
    })

    assert.equal(projected.evidenceLevel, 'partial_locator')
    assert.ok(projected.limitations.includes('legacy_claim_locator_partial'))
  })

  it('falls back to AI-card claims and preserves source identity fields', () => {
    const projected = projectLegacyLibraryAnalysisRecord({
      ...legacyFixture,
      sourceKind: 'library_file',
      sourceKey: 'library_file:research/source.md',
      documentId: null,
      claimCandidates: undefined,
      aiCard: {
        claimCandidates: [{ text: 'Located claim', pageRef: 'p. 2' }],
      },
    })

    assert.equal(projected.sourceKind, 'library_file')
    assert.equal(projected.sourceKey, 'library_file:research/source.md')
    assert.equal(projected.evidenceLevel, 'exact_locator')
  })

  it('summarizes projected, absent and unclassified legacy records', () => {
    const summary = summarizeLegacyLibraryCandidateProjection([
      legacyFixture,
      {
        ...legacyFixture,
        sourceKey: 'document:doc-2',
        documentId: 'doc-2',
        status: 'ai_draft',
        reviewer: 'Named reviewer',
      },
      {
        ...legacyFixture,
        sourceKey: 'document:doc-3',
        documentId: 'doc-3',
        status: 'inventory_only',
        aiCard: null,
      },
      {
        ...legacyFixture,
        sourceKey: 'document:doc-4',
        documentId: 'doc-4',
        status: 'blocked',
        reviewStatus: 'not_required',
      },
    ])

    assert.deepEqual(summary, {
      recordsTotal: 4,
      projectedCandidates: 3,
      analysisAbsent: 1,
      unclassifiedHumanSignals: 2,
    })
  })
})
