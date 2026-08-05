import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  assessEvidenceAppraisal,
  type EvidenceAppraisalSnapshot,
} from '../../src/lib/citations/evidence-appraisal'

const HASH = 'a'.repeat(64)

function reviewed(overrides: Partial<EvidenceAppraisalSnapshot> = {}): EvidenceAppraisalSnapshot {
  return {
    status: 'reviewed',
    basis: 'peer_reviewed',
    studyDesign: 'observational',
    methodologySummary: 'Reviewed method summary',
    sampleOrCoverage: 'Six supermarkets',
    applicability: 'direct',
    applicabilityContext: 'Nordic retail food waste',
    limitationsStatus: 'identified',
    limitations: ['Limited sample and geography'],
    riskOfBias: 'low',
    riskOfBiasNotes: 'Low risk after review of sampling, measurement, and reporting choices',
    framework: 'FS2026 evidence appraisal',
    frameworkVersion: '1',
    reviewMethod: 'full_text',
    reviewBasisCitationId: 'citation-reviewed',
    reviewedSourceHash: HASH,
    hashAlgorithm: 'sha256',
    reviewedBy: 'Named reviewer',
    reviewedAt: '2026-07-19T20:00:00.000Z',
    ...overrides,
  }
}

describe('evidence appraisal gate', () => {
  it('fails closed for missing, draft, and excluded appraisals', () => {
    assert.deepEqual(assessEvidenceAppraisal({ appraisal: null }).blockingReasons, ['appraisal_missing'])
    assert.deepEqual(
      assessEvidenceAppraisal({ appraisal: { status: 'draft' } }).blockingReasons,
      ['appraisal_draft'],
    )
    const excluded = assessEvidenceAppraisal({
      appraisal: {
        status: 'excluded_not_applicable',
        reviewMethod: 'metadata_only',
        reviewBasisCitationId: 'citation-excluded',
        reviewedSourceHash: HASH,
        hashAlgorithm: 'sha256',
        reviewedBy: 'Named reviewer',
        reviewedAt: '2026-07-19',
        notApplicableReason: 'Duplicate navigation record',
      },
      currentSourceHash: HASH,
      reviewBasisCitationPolicySatisfied: true,
      reviewBasisCitationTargetSatisfied: true,
    })
    assert.equal(excluded.structurallyComplete, true)
    assert.equal(excluded.current, true)
    assert.equal(excluded.externalGateSatisfied, false)
    assert.ok(excluded.blockingReasons.includes('appraisal_excluded_not_applicable'))
  })

  it('allows only a complete, current, direct, low-risk review with a valid basis citation', () => {
    const assessment = assessEvidenceAppraisal({
      appraisal: reviewed(),
      currentSourceHash: HASH,
      reviewBasisCitationPolicySatisfied: true,
      reviewBasisCitationTargetSatisfied: true,
    })
    assert.deepEqual(assessment, {
      required: true,
      structurallyComplete: true,
      current: true,
      externalGateSatisfied: true,
      blockingReasons: [],
    })

    const mismatchedTarget = assessEvidenceAppraisal({
      appraisal: reviewed(),
      currentSourceHash: HASH,
      reviewBasisCitationPolicySatisfied: true,
      reviewBasisCitationTargetSatisfied: false,
    })
    assert.equal(mismatchedTarget.externalGateSatisfied, false)
    assert.ok(
      mismatchedTarget.blockingReasons.includes('review_basis_citation_target_mismatch'),
    )
  })

  it('keeps stale, unclear, indirect, and non-low-risk reviews blocked', () => {
    const assessment = assessEvidenceAppraisal({
      appraisal: reviewed({
        basis: 'unclear',
        studyDesign: 'unclear',
        studyDesignDetails: 'The publication does not state a recognizable design',
        applicability: 'indirect',
        applicabilityNotes: 'The evidence population differs from the target decision context',
        riskOfBias: 'some_concerns',
      }),
      currentSourceHash: 'b'.repeat(64),
      reviewBasisCitationPolicySatisfied: false,
      reviewBasisCitationTargetSatisfied: true,
    })
    assert.equal(assessment.structurallyComplete, true)
    assert.equal(assessment.current, false)
    assert.deepEqual(assessment.blockingReasons, [
      'appraisal_source_hash_stale',
      'appraisal_basis_unclear',
      'study_design_unclear',
      'applicability_not_direct',
      'risk_of_bias_some_concerns',
      'review_basis_citation_invalid',
    ])
  })

  it('requires explanations for explicit not-applicable dimensions', () => {
    const incomplete = assessEvidenceAppraisal({
      appraisal: reviewed({
        studyDesign: 'not_applicable',
        studyDesignDetails: null,
        applicability: 'not_applicable',
        applicabilityNotes: null,
        riskOfBias: 'not_applicable',
        riskOfBiasNotes: null,
        limitationsStatus: 'not_applicable',
        limitations: [],
        limitationsNotes: 'Not an empirical study',
      }),
      currentSourceHash: HASH,
      reviewBasisCitationPolicySatisfied: true,
      reviewBasisCitationTargetSatisfied: true,
    })
    assert.equal(incomplete.structurallyComplete, false)
    assert.ok(incomplete.blockingReasons.includes('appraisal_incomplete'))
  })

  it('requires substantive method, coverage, context, and risk-of-bias reasoning', () => {
    for (const overrides of [
      { methodologySummary: null },
      { sampleOrCoverage: null },
      { applicabilityContext: null },
      { riskOfBiasNotes: null },
      { limitations: [''] },
    ] satisfies Array<Partial<EvidenceAppraisalSnapshot>>) {
      const assessment = assessEvidenceAppraisal({
        appraisal: reviewed(overrides),
        currentSourceHash: HASH,
        reviewBasisCitationPolicySatisfied: true,
        reviewBasisCitationTargetSatisfied: true,
      })
      assert.equal(assessment.structurallyComplete, false)
      assert.ok(assessment.blockingReasons.includes('appraisal_incomplete'))
    }

    const unexplainedLimited = assessEvidenceAppraisal({
      appraisal: reviewed({ applicability: 'limited', applicabilityNotes: null }),
      currentSourceHash: HASH,
      reviewBasisCitationPolicySatisfied: true,
      reviewBasisCitationTargetSatisfied: true,
    })
    assert.equal(unexplainedLimited.structurallyComplete, false)
  })

  it('pins relational targets and fail-closed database constraints', () => {
    const schema = readFileSync('prisma/schema.prisma', 'utf8')
    const migration = readFileSync(
      'prisma/migrations/20260719_zz_evidence_appraisal/migration.sql',
      'utf8',
    )
    const qualityMigration = readFileSync(
      'prisma/migrations/20260719_zzz_evidence_appraisal_quality_contract/migration.sql',
      'utf8',
    )
    assert.match(schema, /model EvidenceAppraisal \{/)
    assert.match(schema, /reviewBasisCitation SourceCitation\? @relation\("EvidenceAppraisalReviewBasis"/)
    assert.match(migration, /num_nonnulls\("reportId", "thesisId", "sourceDocId"\) = 1/)
    assert.match(migration, /EvidenceAppraisal_status_contract_check/)
    assert.match(migration, /"reviewedSourceHash" ~ '\^\[0-9a-f\]\{64\}\$'/)
    assert.match(migration, /"reviewMethod" = 'full_text'/)
    assert.match(migration, /cardinality\("limitations"\) > 0/)
    assert.doesNotMatch(migration, /INSERT INTO "EvidenceAppraisal"/)
    assert.match(qualityMigration, /EvidenceAppraisal_reviewed_quality_contract_check/)
    assert.match(qualityMigration, /BTRIM\("methodologySummary"\)/)
    assert.match(qualityMigration, /BTRIM\("sampleOrCoverage"\)/)
    assert.match(qualityMigration, /BTRIM\("applicabilityContext"\)/)
    assert.match(qualityMigration, /BTRIM\("riskOfBiasNotes"\)/)
    assert.doesNotMatch(qualityMigration, /INSERT INTO "EvidenceAppraisal"/)
  })
})
