export type EvidenceAppraisalSnapshot = {
  status: 'draft' | 'reviewed' | 'excluded_not_applicable'
  basis?: string | null
  studyDesign?: string | null
  studyDesignDetails?: string | null
  methodologySummary?: string | null
  sampleOrCoverage?: string | null
  applicability?: string | null
  applicabilityContext?: string | null
  applicabilityNotes?: string | null
  limitationsStatus?: string | null
  limitations?: readonly string[] | null
  limitationsNotes?: string | null
  riskOfBias?: string | null
  riskOfBiasNotes?: string | null
  framework?: string | null
  frameworkVersion?: string | null
  reviewMethod?: string | null
  reviewBasisCitationId?: string | null
  reviewedSourceHash?: string | null
  hashAlgorithm?: string | null
  reviewedBy?: string | null
  reviewedAt?: Date | string | null
  notApplicableReason?: string | null
  notes?: string | null
}

export type EvidenceAppraisalAssessment = {
  required: boolean
  structurallyComplete: boolean
  current: boolean
  externalGateSatisfied: boolean
  blockingReasons: string[]
}

export type EvidenceAppraisalAssessmentInput = {
  appraisal?: EvidenceAppraisalSnapshot | null
  currentSourceHash?: string | null
  reviewBasisCitationPolicySatisfied?: boolean
  reviewBasisCitationTargetSatisfied?: boolean
  required?: boolean
}

const SHA256_PATTERN = /^[0-9a-f]{64}$/

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function validDate(value: Date | string | null | undefined) {
  if (!value) return false
  const parsed = value instanceof Date ? value : new Date(value)
  return !Number.isNaN(parsed.valueOf())
}

function validHash(value: unknown) {
  return typeof value === 'string' && SHA256_PATTERN.test(value)
}

function completeReviewedAppraisal(appraisal: EvidenceAppraisalSnapshot) {
  const limitations = appraisal.limitations ?? []
  const limitationsComplete = appraisal.limitationsStatus === 'identified'
    ? limitations.length > 0 && limitations.every(limitation => Boolean(text(limitation)))
    : ['none_identified', 'unclear', 'not_applicable'].includes(appraisal.limitationsStatus ?? '') &&
      limitations.length === 0 && Boolean(text(appraisal.limitationsNotes))
  const studyDesignExplanation =
    !['other', 'unclear', 'not_applicable'].includes(appraisal.studyDesign ?? '') ||
    Boolean(text(appraisal.studyDesignDetails))
  const applicabilityExplanation = appraisal.applicability === 'direct' ||
    Boolean(text(appraisal.applicabilityNotes))

  return Boolean(
    appraisal.basis &&
    appraisal.studyDesign &&
    text(appraisal.methodologySummary) &&
    text(appraisal.sampleOrCoverage) &&
    appraisal.applicability &&
    text(appraisal.applicabilityContext) &&
    appraisal.limitationsStatus &&
    appraisal.riskOfBias &&
    text(appraisal.riskOfBiasNotes) &&
    appraisal.reviewMethod === 'full_text' &&
    text(appraisal.framework) &&
    text(appraisal.frameworkVersion) &&
    text(appraisal.reviewBasisCitationId) &&
    validHash(appraisal.reviewedSourceHash) &&
    appraisal.hashAlgorithm === 'sha256' &&
    text(appraisal.reviewedBy) &&
    validDate(appraisal.reviewedAt) &&
    limitationsComplete &&
    studyDesignExplanation &&
    applicabilityExplanation
  )
}

function completeExcludedAppraisal(appraisal: EvidenceAppraisalSnapshot) {
  return Boolean(
    appraisal.reviewMethod &&
    text(appraisal.reviewBasisCitationId) &&
    validHash(appraisal.reviewedSourceHash) &&
    appraisal.hashAlgorithm === 'sha256' &&
    text(appraisal.reviewedBy) &&
    validDate(appraisal.reviewedAt) &&
    text(appraisal.notApplicableReason)
  )
}

export function assessEvidenceAppraisal(
  input: EvidenceAppraisalAssessmentInput,
): EvidenceAppraisalAssessment {
  const required = input.required ?? true
  if (!required) {
    return {
      required: false,
      structurallyComplete: true,
      current: true,
      externalGateSatisfied: true,
      blockingReasons: [],
    }
  }

  const appraisal = input.appraisal
  if (!appraisal) {
    return {
      required,
      structurallyComplete: false,
      current: false,
      externalGateSatisfied: false,
      blockingReasons: ['appraisal_missing'],
    }
  }

  if (appraisal.status === 'draft') {
    return {
      required,
      structurallyComplete: false,
      current: false,
      externalGateSatisfied: false,
      blockingReasons: ['appraisal_draft'],
    }
  }

  const structurallyComplete = appraisal.status === 'reviewed'
    ? completeReviewedAppraisal(appraisal)
    : completeExcludedAppraisal(appraisal)
  const current = structurallyComplete &&
    validHash(input.currentSourceHash) &&
    appraisal.reviewedSourceHash === input.currentSourceHash
  const blockingReasons: string[] = []

  if (appraisal.status === 'excluded_not_applicable') {
    blockingReasons.push('appraisal_excluded_not_applicable')
  }
  if (!structurallyComplete) blockingReasons.push('appraisal_incomplete')
  if (structurallyComplete && !current) blockingReasons.push('appraisal_source_hash_stale')

  if (appraisal.status === 'reviewed') {
    if (appraisal.basis === 'unclear') blockingReasons.push('appraisal_basis_unclear')
    if (['internal_material', 'other'].includes(appraisal.basis ?? '')) {
      blockingReasons.push('appraisal_basis_not_external')
    }
    if (appraisal.studyDesign === 'unclear') blockingReasons.push('study_design_unclear')
    if (appraisal.studyDesign === 'not_applicable') blockingReasons.push('study_design_not_applicable')
    if (appraisal.applicability === 'unclear') blockingReasons.push('applicability_unclear')
    if (appraisal.applicability && appraisal.applicability !== 'direct' && appraisal.applicability !== 'unclear') {
      blockingReasons.push('applicability_not_direct')
    }
    if (appraisal.riskOfBias === 'unclear') blockingReasons.push('risk_of_bias_unclear')
    if (['high', 'critical'].includes(appraisal.riskOfBias ?? '')) blockingReasons.push('risk_of_bias_high')
    if (appraisal.riskOfBias === 'some_concerns') blockingReasons.push('risk_of_bias_some_concerns')
    if (appraisal.riskOfBias === 'not_applicable') blockingReasons.push('risk_of_bias_not_applicable')
  }

  if (!input.reviewBasisCitationPolicySatisfied) {
    blockingReasons.push('review_basis_citation_invalid')
  }
  if (!input.reviewBasisCitationTargetSatisfied) {
    blockingReasons.push('review_basis_citation_target_mismatch')
  }

  return {
    required,
    structurallyComplete,
    current,
    externalGateSatisfied: blockingReasons.length === 0,
    blockingReasons: [...new Set(blockingReasons)],
  }
}
