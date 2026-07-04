import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisStatusPayload,
  toLibraryAnalysisBadge,
  type LibraryAnalysisStatusRecord,
} from '../../src/lib/queries/library-analysis'

const records: LibraryAnalysisStatusRecord[] = [
  { status: 'approved_internal', usageRule: 'safe_for_ai_context', reviewStatus: 'not_required', riskFlags: [], claimCandidates: [] },
  { status: 'review_required', usageRule: 'claim_candidate_review', reviewStatus: 'queued', riskFlags: [], claimCandidates: [{ text: 'candidate' }] },
  { status: 'review_required', usageRule: 'requires_actor_gate', reviewStatus: 'queued', riskFlags: ['type_b_actor_gate'], claimCandidates: [] },
  { status: 'blocked', usageRule: 'type_c_gap', reviewStatus: 'queued', riskFlags: ['type_c_not_desk_research'], claimCandidates: [] },
  { status: 'inventory_only', usageRule: 'internal_background', reviewStatus: 'not_reviewed', riskFlags: ['missing_text'], claimCandidates: [] },
]

describe('library analysis status query helpers', () => {
  it('builds the cockpit/API readiness counts', () => {
    assert.deepEqual(buildLibraryAnalysisStatusPayload(records), {
      ok: false,
      total: 5,
      finished: 1,
      readinessPct: 20,
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
    })
    assert.equal(toLibraryAnalysisBadge(null), null)
  })
})
