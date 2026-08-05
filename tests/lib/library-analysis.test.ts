import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  LIBRARY_ANALYSIS_STATUSES,
  LIBRARY_ANALYSIS_USAGE_RULES,
  assessLibraryAnalysisExternalApproval,
  buildLibraryAnalysisSourceKey,
  classifyLibraryAnalysisRecord,
  summarizeLibraryAnalysisRecords,
  validateLibraryAiCard,
  type LibraryAiCard,
  type LibraryAnalysisClassificationInput,
  type LibraryAnalysisSummaryInput,
} from '../../src/lib/library-analysis'

function classify(overrides: Partial<LibraryAnalysisClassificationInput> = {}) {
  return classifyLibraryAnalysisRecord({
    wordCount: 1200,
    hasLocalFile: true,
    hasDbLink: true,
    citationReadiness: 'citable_external',
    claimCandidateCount: 0,
    riskFlags: [],
    gapKinds: [],
    isSuperseded: false,
    ...overrides,
  })
}

const validCard: LibraryAiCard = {
  shortSummary: 'Kort triage av kilden for intern bruk.',
  keyFindings: ['Relevant for markedsstruktur.'],
  claimCandidates: [],
  projectImplication: 'Kan brukes som bakgrunn før claim-review.',
  gaps: [],
  citationStatus: 'citable_external',
  recommendedUsageRule: 'safe_for_ai_context',
  status: 'ai_draft',
  controlLinks: [{ label: 'Bibliotek', href: '/bibliotek/sample' }],
  riskFlags: [],
}

describe('library analysis contract', () => {
  it('exports the fixed status and usage-rule vocabularies in workflow order', () => {
    assert.deepEqual(LIBRARY_ANALYSIS_STATUSES, [
      'not_started',
      'inventory_only',
      'ai_draft',
      'validated',
      'review_required',
      'approved_internal',
      'blocked',
      'superseded',
    ])
    assert.deepEqual(LIBRARY_ANALYSIS_USAGE_RULES, [
      'internal_background',
      'safe_for_ai_context',
      'safe_for_external_claims',
      'claim_candidate_review',
      'do_not_use_for_claims',
      'requires_actor_gate',
      'type_c_gap',
    ])
  })

  it('builds stable source keys from DB ids and research paths', () => {
    assert.equal(buildLibraryAnalysisSourceKey({ sourceKind: 'document', id: 'doc-123' }), 'document:doc-123')
    assert.equal(
      buildLibraryAnalysisSourceKey({ sourceKind: 'library_file', path: 'research/bibliotek/a/b.md' }),
      'library_file:research/bibliotek/a/b.md',
    )
    assert.throws(
      () => buildLibraryAnalysisSourceKey({ sourceKind: 'library_file' }),
      /requires id or path/,
    )
  })

  it('classifies citable low-risk sources as approved internal AI context', () => {
    assert.deepEqual(classify(), {
      status: 'approved_internal',
      usageRule: 'safe_for_ai_context',
      reviewRequired: false,
      reasons: [],
    })
  })

  it('routes claim candidates to review instead of opening claims', () => {
    assert.deepEqual(classify({ claimCandidateCount: 2 }), {
      status: 'review_required',
      usageRule: 'claim_candidate_review',
      reviewRequired: true,
      reasons: ['claim_candidate_review'],
    })
  })

  it('flags short, low-text, and orphan sources for review', () => {
    assert.deepEqual(classify({ wordCount: 80 }).status, 'review_required')
    assert.deepEqual(classify({ wordCount: 80 }).usageRule, 'internal_background')
    assert.ok(classify({ wordCount: 80 }).reasons.includes('low_text_quality'))

    assert.ok(classify({ hasLocalFile: false }).reasons.includes('missing_file_path'))
    assert.ok(classify({ hasDbLink: false }).reasons.includes('orphan_source'))
  })

  it('keeps substantial URL-backed DB text as internal background without requiring a local file', () => {
    assert.deepEqual(classify({
      hasLocalFile: false,
      hasExternalLocator: true,
      wordCount: 750,
    }), {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['url_backed_internal_context'],
    })
  })

  it('keeps substantial loose library files as internal background without requiring a DB row', () => {
    assert.deepEqual(classify({
      hasDbLink: false,
      isLooseLibraryFile: true,
      wordCount: 750,
    }), {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['loose_library_file'],
    })
  })

  it('separates type-B actor gates and type-C desk-research gaps', () => {
    assert.deepEqual(classify({ gapKinds: ['type_b_actor_gate'] }), {
      status: 'review_required',
      usageRule: 'requires_actor_gate',
      reviewRequired: true,
      reasons: ['type_b_actor_gate'],
    })
    assert.deepEqual(classify({ gapKinds: ['type_c_not_desk_research'] }), {
      status: 'blocked',
      usageRule: 'type_c_gap',
      reviewRequired: true,
      reasons: ['type_c_not_desk_research'],
    })
  })

  it('keeps superseded sources searchable but blocks claim use', () => {
    assert.deepEqual(classify({ isSuperseded: true }), {
      status: 'superseded',
      usageRule: 'do_not_use_for_claims',
      reviewRequired: false,
      reasons: ['superseded'],
    })
  })

  it('keeps intentionally blocked sources out of repair review queues', () => {
    assert.deepEqual(classify({
      wordCount: 80,
      hasLocalFile: false,
      isBlockedSource: true,
    }), {
      status: 'blocked',
      usageRule: 'do_not_use_for_claims',
      reviewRequired: false,
      reasons: ['blocked_source'],
    })
  })

  it('keeps reviewed short summaries as internal background without reopening repair review', () => {
    assert.deepEqual(classify({
      wordCount: 80,
      isCuratedShortSummary: true,
    }), {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['curated_short_summary'],
    })
  })

  it('validates AI source cards and rejects unsafe claim candidates', () => {
    assert.deepEqual(validateLibraryAiCard(validCard), { ok: true, issues: [] })

    const invalid = validateLibraryAiCard({
      ...validCard,
      status: 'done',
      recommendedUsageRule: 'publish',
      claimCandidates: [{ text: 'A claim with no locator.' }],
      controlLinks: [],
    })

    assert.equal(invalid.ok, false)
    assert.ok(invalid.issues.includes('unknown_status'))
    assert.ok(invalid.issues.includes('unknown_usage_rule'))
    assert.ok(invalid.issues.includes('claim_candidate_missing_source_grounding'))
    assert.ok(invalid.issues.includes('missing_control_links'))

    const externalRecommendation = validateLibraryAiCard({
      ...validCard,
      recommendedUsageRule: 'safe_for_external_claims',
    })
    assert.equal(externalRecommendation.ok, false)
    assert.ok(externalRecommendation.issues.includes('external_usage_requires_human_approval'))
  })

  it('requires the complete human external-approval contract', () => {
    const approved = assessLibraryAnalysisExternalApproval({
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidateCount: 0,
    })
    assert.deepEqual(approved, { eligible: true, blockers: [] })

    const incomplete = assessLibraryAnalysisExternalApproval({
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'not_reviewed',
      reviewedAt: null,
      reviewer: null,
      citationReadiness: 'citable_with_note',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: ['needs_review'],
      claimCandidateCount: 1,
    })
    assert.equal(incomplete.eligible, false)
    assert.deepEqual(incomplete.blockers, [
      'review_status_not_approved',
      'review_provenance_missing',
      'citation_not_citable_external',
      'risk_flags_present',
      'claim_candidates_present',
    ])

    const changedAfterReview = assessLibraryAnalysisExternalApproval({
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'b'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'c'.repeat(64),
      riskFlags: [],
      claimCandidateCount: 0,
    })
    assert.deepEqual(changedAfterReview, {
      eligible: false,
      blockers: ['content_hash_mismatch'],
    })

    const locatorChangedAfterReview = assessLibraryAnalysisExternalApproval({
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: 'a'.repeat(64),
      currentContentHash: 'a'.repeat(64),
      externalCitationPolicyHash: 'c'.repeat(64),
      currentExternalCitationPolicyHash: 'd'.repeat(64),
      riskFlags: [],
      claimCandidateCount: 0,
    })
    assert.deepEqual(locatorChangedAfterReview, {
      eligible: false,
      blockers: ['external_citation_policy_hash_mismatch'],
    })
  })

  it('summarizes cockpit readiness counts from records', () => {
    const records: LibraryAnalysisSummaryInput[] = [
      { status: 'approved_internal', usageRule: 'safe_for_ai_context', claimCandidateCount: 0, riskFlags: [] },
      { status: 'review_required', usageRule: 'claim_candidate_review', claimCandidateCount: 2, riskFlags: [] },
      { status: 'blocked', usageRule: 'type_c_gap', claimCandidateCount: 0, riskFlags: ['type_c_not_desk_research'] },
      { status: 'review_required', usageRule: 'requires_actor_gate', claimCandidateCount: 0, riskFlags: ['type_b_actor_gate'] },
      { status: 'inventory_only', usageRule: 'internal_background', claimCandidateCount: 0, riskFlags: ['missing_text'] },
    ]

    assert.deepEqual(summarizeLibraryAnalysisRecords(records), {
      total: 5,
      finished: 1,
      reviewRequired: 2,
      blocked: 1,
      typeB: 1,
      typeC: 1,
      claimCandidates: 2,
      missingText: 1,
    })
  })
})
