import {
  assessEvidenceAppraisal,
  type EvidenceAppraisalAssessment,
  type EvidenceAppraisalSnapshot,
} from '../../src/lib/citations/evidence-appraisal'
import {
  assessCitationUse,
  formatCitation,
  redactExternalText,
  type Audience,
  type CitationLike,
} from './formatters'

export type McpEvidenceReviewBasisCitation = CitationLike & {
  document?: {
    report?: { id: string } | null
    thesis?: { id: string } | null
    sourceDoc?: { id: string } | null
  } | null
}

export type McpEvidenceAppraisalRecord = EvidenceAppraisalSnapshot & {
  id: string
  reportId: string | null
  thesisId: string | null
  sourceDocId: string | null
  reviewBasisCitation: McpEvidenceReviewBasisCitation | null
}

export type McpEvidenceAppraisalTarget = {
  type: 'report' | 'thesis' | 'source_doc'
  id: string
  title: string | null
}

export function currentAppraisalSourceHash(
  appraisal: McpEvidenceAppraisalRecord | null | undefined,
): string | null {
  return appraisal?.reviewBasisCitation?.fileHash
    ?? appraisal?.reviewBasisCitation?.contentHash
    ?? null
}

export function assessMcpEvidenceAppraisal(
  appraisal: McpEvidenceAppraisalRecord | null | undefined,
): EvidenceAppraisalAssessment {
  const reviewBasisCitationPolicySatisfied = appraisal?.reviewBasisCitation
    ? assessCitationUse(appraisal.reviewBasisCitation, 'external').allowedForAnswer
    : false

  return assessEvidenceAppraisal({
    appraisal,
    currentSourceHash: currentAppraisalSourceHash(appraisal),
    reviewBasisCitationPolicySatisfied,
    reviewBasisCitationTargetSatisfied: reviewBasisCitationTargetsAppraisal(appraisal),
  })
}

export function reviewBasisCitationTargetsAppraisal(
  appraisal: McpEvidenceAppraisalRecord | null | undefined,
): boolean {
  const citation = appraisal?.reviewBasisCitation
  if (!appraisal || !citation) return false
  if (appraisal.sourceDocId) {
    return citation.sourceDocId === appraisal.sourceDocId
      || citation.document?.sourceDoc?.id === appraisal.sourceDocId
  }
  if (appraisal.reportId) return citation.document?.report?.id === appraisal.reportId
  if (appraisal.thesisId) return citation.document?.thesis?.id === appraisal.thesisId
  return false
}

export function formatEvidenceAppraisalForAudience(
  appraisal: McpEvidenceAppraisalRecord | null | undefined,
  audience: Audience,
  target?: McpEvidenceAppraisalTarget | null,
) {
  const assessment = assessMcpEvidenceAppraisal(appraisal)
  if (!appraisal) {
    return {
      present: false,
      assessment,
      ...(target ? { target: formatTarget(target, audience) } : {}),
    }
  }

  const reviewBasisCitation = appraisal.reviewBasisCitation
    ? formatCitation(appraisal.reviewBasisCitation, audience)
    : null

  return {
    present: true,
    id: appraisal.id,
    target: formatTarget(target ?? appraisalTarget(appraisal), audience),
    status: appraisal.status,
    basis: appraisal.basis ?? null,
    studyDesign: appraisal.studyDesign ?? null,
    studyDesignDetails: audience === 'external'
      ? redactNullable(appraisal.studyDesignDetails)
      : appraisal.studyDesignDetails ?? null,
    methodologySummary: audience === 'external'
      ? redactNullable(appraisal.methodologySummary)
      : appraisal.methodologySummary ?? null,
    sampleOrCoverage: audience === 'external'
      ? redactNullable(appraisal.sampleOrCoverage)
      : appraisal.sampleOrCoverage ?? null,
    applicability: appraisal.applicability ?? null,
    applicabilityContext: audience === 'external'
      ? redactNullable(appraisal.applicabilityContext)
      : appraisal.applicabilityContext ?? null,
    applicabilityNotes: audience === 'external'
      ? redactNullable(appraisal.applicabilityNotes)
      : appraisal.applicabilityNotes ?? null,
    limitationsStatus: appraisal.limitationsStatus ?? null,
    limitations: (appraisal.limitations ?? []).map(value => (
      audience === 'external' ? redactExternalText(value) : value
    )),
    limitationsNotes: audience === 'external'
      ? redactNullable(appraisal.limitationsNotes)
      : appraisal.limitationsNotes ?? null,
    riskOfBias: appraisal.riskOfBias ?? null,
    riskOfBiasNotes: audience === 'external'
      ? redactNullable(appraisal.riskOfBiasNotes)
      : appraisal.riskOfBiasNotes ?? null,
    framework: audience === 'external'
      ? redactNullable(appraisal.framework)
      : appraisal.framework ?? null,
    frameworkVersion: audience === 'external'
      ? redactNullable(appraisal.frameworkVersion)
      : appraisal.frameworkVersion ?? null,
    reviewMethod: appraisal.reviewMethod ?? null,
    reviewedAt: formatDate(appraisal.reviewedAt),
    notApplicableReason: audience === 'external'
      ? redactNullable(appraisal.notApplicableReason)
      : appraisal.notApplicableReason ?? null,
    reviewBasisCitation: audience === 'external' && reviewBasisCitation
      ? {
          id: reviewBasisCitation.id,
          usePolicy: reviewBasisCitation.usePolicy,
        }
      : reviewBasisCitation,
    assessment,
    ...(audience === 'internal'
      ? {
          reviewedBy: appraisal.reviewedBy ?? null,
          reviewedSourceHash: appraisal.reviewedSourceHash ?? null,
          currentSourceHash: currentAppraisalSourceHash(appraisal),
          notes: appraisal.notes ?? null,
        }
      : {}),
  }
}

function appraisalTarget(appraisal: McpEvidenceAppraisalRecord): McpEvidenceAppraisalTarget {
  if (appraisal.reportId) return { type: 'report', id: appraisal.reportId, title: null }
  if (appraisal.thesisId) return { type: 'thesis', id: appraisal.thesisId, title: null }
  return { type: 'source_doc', id: appraisal.sourceDocId ?? 'missing-target', title: null }
}

function formatTarget(target: McpEvidenceAppraisalTarget, audience: Audience) {
  return {
    ...target,
    title: audience === 'external' ? redactNullable(target.title) : target.title,
  }
}

function redactNullable(value: string | null | undefined) {
  return value ? redactExternalText(value) : null
}

function formatDate(value: Date | string | null | undefined): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date.toISOString()
}
