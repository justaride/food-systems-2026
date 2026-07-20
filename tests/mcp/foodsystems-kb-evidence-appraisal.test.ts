import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  assessMcpEvidenceAppraisal,
  formatEvidenceAppraisalForAudience,
  type McpEvidenceAppraisalRecord,
} from '../../mcp/foodsystems-kb/evidence-appraisal'
import type { CitationLike } from '../../mcp/foodsystems-kb/formatters'

const HASH = 'a'.repeat(64)

const reviewBasisCitation: CitationLike = {
  id: 'citation-review-basis',
  sourceClass: 'primary',
  citationReadiness: 'citable_external',
  verificationStatus: 'human_verified',
  citationText: 'Reviewed source',
  title: 'Reviewed source',
  publisher: 'Example University',
  author: 'Researcher',
  year: 2026,
  url: 'https://www.example.edu/source.pdf',
  archivedUrl: null,
  localPath: '/Users/reviewer/source.pdf',
  fileHash: HASH,
  contentHash: null,
  hashAlgorithm: 'sha256',
  pageRef: '1-20',
  quote: null,
  accessedAt: '2026-07-19T00:00:00.000Z',
  captureMethod: 'manual_review',
  verifiedAt: '2026-07-19T01:00:00.000Z',
  verifiedBy: 'citation-reviewer',
  confidence: 95,
  notes: 'Internal citation note',
  documentId: 'document-reviewed',
  sourceDocId: 'source-reviewed',
}

function reviewedAppraisal(
  overrides: Partial<McpEvidenceAppraisalRecord> = {},
): McpEvidenceAppraisalRecord {
  return {
    id: 'appraisal-reviewed',
    reportId: null,
    thesisId: null,
    sourceDocId: 'source-reviewed',
    status: 'reviewed',
    basis: 'peer_reviewed',
    studyDesign: 'observational',
    methodologySummary: 'Full-text review',
    sampleOrCoverage: 'Six supermarkets',
    applicability: 'direct',
    applicabilityContext: 'Nordic retail',
    limitationsStatus: 'identified',
    limitations: ['Limited geography'],
    riskOfBias: 'low',
    riskOfBiasNotes: 'Low risk after review of sampling, measurement, and reporting choices',
    framework: 'FS2026 evidence appraisal',
    frameworkVersion: '1',
    reviewMethod: 'full_text',
    reviewBasisCitationId: reviewBasisCitation.id,
    reviewedSourceHash: HASH,
    hashAlgorithm: 'sha256',
    reviewedBy: 'Named reviewer',
    reviewedAt: '2026-07-19T02:00:00.000Z',
    notes: 'Private /Users/reviewer/appraisal.md',
    reviewBasisCitation,
    ...overrides,
  }
}

describe('Food Systems KB MCP evidence appraisal boundary', () => {
  it('fails closed when appraisal is missing or the reviewed source hash is stale', () => {
    assert.deepEqual(
      assessMcpEvidenceAppraisal(null).blockingReasons,
      ['appraisal_missing'],
    )
    const stale = assessMcpEvidenceAppraisal(reviewedAppraisal({
      reviewedSourceHash: 'b'.repeat(64),
    }))
    assert.equal(stale.externalGateSatisfied, false)
    assert.ok(stale.blockingReasons.includes('appraisal_source_hash_stale'))
  })

  it('opens only for a complete review with an externally eligible basis citation', () => {
    assert.deepEqual(assessMcpEvidenceAppraisal(reviewedAppraisal()), {
      required: true,
      structurallyComplete: true,
      current: true,
      externalGateSatisfied: true,
      blockingReasons: [],
    })

    const invalidBasis = reviewedAppraisal({
      reviewBasisCitation: {
        ...reviewBasisCitation,
        citationReadiness: 'citable_with_note',
      },
    })
    assert.ok(
      assessMcpEvidenceAppraisal(invalidBasis)
        .blockingReasons.includes('review_basis_citation_invalid'),
    )
  })

  it('withholds reviewer identity, notes, and hashes from the external view', () => {
    const appraisal = reviewedAppraisal()
    const external = formatEvidenceAppraisalForAudience(appraisal, 'external')
    const internal = formatEvidenceAppraisalForAudience(appraisal, 'internal')
    const externalJson = JSON.stringify(external)

    assert.equal(external.assessment.externalGateSatisfied, true)
    assert.doesNotMatch(externalJson, /Named reviewer|Private|Users\/reviewer|reviewedSourceHash/)
    assert.ok('reviewBasisCitation' in external)
    assert.ok('reviewedBy' in internal)
    assert.deepEqual(external.reviewBasisCitation, {
      id: reviewBasisCitation.id,
      usePolicy: {
        audience: 'external',
        allowedForAnswer: true,
        externalCitable: true,
        blockingReasons: [],
      },
    })
    assert.equal(internal.reviewedBy, 'Named reviewer')
    assert.equal(internal.reviewedSourceHash, HASH)
    assert.equal(internal.notes, appraisal.notes)
  })
})
