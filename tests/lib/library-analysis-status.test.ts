import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisStatusPayload,
  hasExternalAnswerEligibleCitation,
  LIBRARY_ANALYSIS_CALIBRATION,
  toLibraryAnalysisBadge,
  type LibraryAnalysisStatusRecord,
} from '../../src/lib/queries/library-analysis'
import type { CitationPolicyInput } from '../../src/lib/citations/external-citation-policy'

const records: LibraryAnalysisStatusRecord[] = [
  { status: 'approved_internal', usageRule: 'safe_for_ai_context', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
  { status: 'review_required', usageRule: 'claim_candidate_review', reviewStatus: 'queued', riskFlags: [], claimCandidates: [{ text: 'candidate' }] },
  { status: 'review_required', usageRule: 'requires_actor_gate', reviewStatus: 'queued', riskFlags: ['type_b_actor_gate'], claimCandidates: [] },
  { status: 'blocked', usageRule: 'type_c_gap', reviewStatus: 'queued', riskFlags: ['type_c_not_desk_research'], claimCandidates: [] },
  { status: 'inventory_only', usageRule: 'internal_background', reviewStatus: 'not_reviewed', riskFlags: ['missing_text'], claimCandidates: [] },
]

describe('library analysis status query helpers', () => {
  it('publishes automated-only calibration rates without accuracy claims', () => {
    assert.equal(LIBRARY_ANALYSIS_CALIBRATION.schemaVersion, '2.0')
    assert.equal(LIBRARY_ANALYSIS_CALIBRATION.mode, 'automated_only')
    assert.equal(LIBRARY_ANALYSIS_CALIBRATION.automatedRounds.length, 1)
    assert.deepEqual(LIBRARY_ANALYSIS_CALIBRATION.humanReferenceRounds, [])
    assert.equal(
      JSON.stringify(LIBRARY_ANALYSIS_CALIBRATION).toLowerCase().includes('accuracy'),
      false,
    )
  })

  it('builds the cockpit/API readiness counts', () => {
    assert.deepEqual(buildLibraryAnalysisStatusPayload(records), {
      operational: true,
      reviewComplete: false,
      ok: false,
      total: 5,
      processed: 1,
      classificationPct: 20,
      finished: 1,
      readinessPct: 20,
      approvedForAi: 1,
      pendingReview: 4,
      pendingReviewHighRisk: 2,
      pendingReviewStandard: 2,
      safelyBlocked: 0,
      classificationConflicts: 0,
      humanReviewed: 0,
      aiDraft: 0,
      externalUsageContractAvailable: true,
      externalClaimEligible: 0,
      invalidExternalApprovals: 0,
      externalCitationBlocked: 0,
      externalReady: false,
      externalBlockers: [
        'no_named_dated_human_review',
        '1_blocked_records',
        'no_external_claim_eligible_records',
      ],
      reviewRequired: 2,
      blocked: 1,
      typeB: 1,
      typeC: 1,
      claimCandidates: 1,
      missingText: 1,
      byStatus: {
        approved_internal: 1,
        blocked: 1,
        inventory_only: 1,
        review_required: 2,
      },
      byUsageRule: {
        claim_candidate_review: 1,
        internal_background: 1,
        requires_actor_gate: 1,
        safe_for_ai_context: 1,
        type_c_gap: 1,
      },
    })
  })

  it('maps records into compact badges for library and search surfaces', () => {
    assert.deepEqual(toLibraryAnalysisBadge(records[1]!), {
      status: 'review_required',
      usageRule: 'claim_candidate_review',
      reviewRequired: true,
      claimCandidateCount: 1,
      riskFlags: [],
      externalClaimEligible: false,
    })
    assert.equal(toLibraryAnalysisBadge(null), null)
  })

  it('treats terminal internal and do-not-use classifications as operationally complete', () => {
    const terminal: LibraryAnalysisStatusRecord[] = [
      { status: 'approved_internal', usageRule: 'safe_for_ai_context', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
      { status: 'ai_draft', usageRule: 'internal_background', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
      { status: 'blocked', usageRule: 'do_not_use_for_claims', reviewStatus: 'not_required', riskFlags: ['blocked_source'], claimCandidates: [] },
    ]

    const status = buildLibraryAnalysisStatusPayload(terminal)
    assert.equal(status.operational, true)
    assert.equal(status.reviewComplete, true)
    assert.equal(status.ok, true)
    assert.equal(status.processed, 3)
    assert.equal(status.classificationPct, 100)
    assert.equal(status.approvedForAi, 1)
    assert.equal(status.pendingReview, 0)
    assert.equal(status.safelyBlocked, 1)
    assert.equal(status.classificationConflicts, 0)
    assert.equal(status.externalReady, false)
    assert.deepEqual(status.externalBlockers, [
      'no_named_dated_human_review',
      '1_ai_drafts',
      '1_blocked_records',
      'no_external_claim_eligible_records',
    ])
    assert.equal(toLibraryAnalysisBadge(terminal[2])?.reviewRequired, false)
  })

  it('fails health on contradictory approved and blocked classifications', () => {
    const contradictory: LibraryAnalysisStatusRecord[] = [
      { status: 'approved_internal', usageRule: 'internal_background', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
      { status: 'blocked', usageRule: 'safe_for_ai_context', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
    ]

    const status = buildLibraryAnalysisStatusPayload(contradictory)
    assert.equal(status.operational, false)
    assert.equal(status.reviewComplete, true)
    assert.equal(status.ok, false)
    assert.equal(status.classificationConflicts, 2)
  })

  it('requires explicit external usage, validation, and named review provenance', () => {
    const reviewed: LibraryAnalysisStatusRecord[] = [{
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: new Date('2026-07-19T10:00:00.000Z'),
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationEligible: true,
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidates: [],
    }]

    const status = buildLibraryAnalysisStatusPayload(reviewed)
    assert.equal(status.operational, true)
    assert.equal(status.reviewComplete, true)
    assert.equal(status.humanReviewed, 1)
    assert.equal(status.externalClaimEligible, 1)
    assert.equal(status.invalidExternalApprovals, 0)
    assert.equal(status.externalCitationBlocked, 0)
    assert.equal(status.externalUsageContractAvailable, true)
    assert.equal(status.externalReady, true)
    assert.deepEqual(status.externalBlockers, [])
  })

  it('keeps incomplete external markers in the review queue', () => {
    const incomplete: LibraryAnalysisStatusRecord[] = [{
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'not_required',
      reviewedAt: null,
      reviewer: null,
      citationReadiness: 'citable_with_note',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidates: [],
    }]

    const status = buildLibraryAnalysisStatusPayload(incomplete)
    assert.equal(status.operational, true)
    assert.equal(status.reviewComplete, false)
    assert.equal(status.ok, false)
    assert.equal(status.pendingReview, 1)
    assert.equal(status.processed, 0)
    assert.equal(status.externalClaimEligible, 0)
  })

  it('cannot report external ready while any approval hash is stale', () => {
    const base: LibraryAnalysisStatusRecord = {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: new Date('2026-07-19T10:00:00.000Z'),
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationEligible: true,
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidates: [],
    }
    const status = buildLibraryAnalysisStatusPayload([
      base,
      {
        ...base,
        sourceKey: 'document:doc-2',
        documentId: 'doc-2',
        currentContentHash: 'b'.repeat(64),
      },
    ])

    assert.equal(status.externalClaimEligible, 1)
    assert.equal(status.invalidExternalApprovals, 1)
    assert.equal(status.externalCitationBlocked, 0)
    assert.equal(status.externalReady, false)
    assert.ok(status.externalBlockers.includes('1_invalid_external_approvals'))
  })

  it('fails closed when a valid approval has no current external citation', () => {
    const record: LibraryAnalysisStatusRecord = {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: new Date('2026-07-19T10:00:00.000Z'),
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationEligible: false,
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: null,
      riskFlags: [],
      claimCandidates: [],
    }

    const status = buildLibraryAnalysisStatusPayload([record])
    assert.equal(status.externalClaimEligible, 0)
    assert.equal(status.invalidExternalApprovals, 1)
    assert.equal(status.externalCitationBlocked, 1)
    assert.equal(status.externalReady, false)
    assert.deepEqual(status.externalBlockers, [
      '1_invalid_external_approvals',
      '1_external_citation_policy_blocked',
      'no_external_claim_eligible_records',
    ])
    assert.equal(toLibraryAnalysisBadge(record)?.externalClaimEligible, false)
  })

  it('reuses the MCP answer-time citation policy for current document locators', () => {
    const citation: CitationPolicyInput = {
      sourceClass: 'primary',
      citationReadiness: 'citable_external',
      verificationStatus: 'verified',
      url: 'https://www.oecd.org/research/report.pdf',
      archivedUrl: null,
      accessedAt: new Date('2026-07-19T10:00:00.000Z'),
    }

    assert.equal(hasExternalAnswerEligibleCitation([citation]), true)
    assert.equal(hasExternalAnswerEligibleCitation([{
      ...citation,
      url: null,
    }]), false)
    assert.equal(hasExternalAnswerEligibleCitation([{
      ...citation,
      url: 'http://127.0.0.1/report.pdf',
    }]), false)
  })
})
