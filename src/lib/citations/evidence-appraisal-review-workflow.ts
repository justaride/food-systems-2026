import { createHash } from 'node:crypto'
import { assessEvidenceAppraisal } from './evidence-appraisal'

export const EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS = ['src-30', 'src-32', 'src-45'] as const

export const EVIDENCE_APPRAISAL_BASES = [
  'peer_reviewed',
  'formally_examined_thesis',
  'official_primary',
  'grey_literature',
  'internal_material',
  'other',
  'unclear',
] as const

export const EVIDENCE_STUDY_DESIGNS = [
  'experimental',
  'quasi_experimental',
  'observational',
  'qualitative',
  'mixed_methods',
  'evidence_synthesis',
  'modelling',
  'economic_analysis',
  'legal_policy_analysis',
  'descriptive_document',
  'other',
  'unclear',
  'not_applicable',
] as const

export const EVIDENCE_APPLICABILITIES = [
  'direct',
  'indirect',
  'limited',
  'unclear',
  'not_applicable',
] as const

export const EVIDENCE_LIMITATIONS_STATUSES = [
  'identified',
  'none_identified',
  'unclear',
  'not_applicable',
] as const

export const EVIDENCE_RISK_OF_BIAS_VALUES = [
  'low',
  'some_concerns',
  'high',
  'critical',
  'unclear',
  'not_applicable',
] as const

export const EVIDENCE_REVIEW_METHODS = ['full_text', 'partial_text', 'metadata_only'] as const

export const REVIEWED_APPRAISAL_ATTESTATION =
  'I_HAVE_READ_THE_FULL_SOURCE_AND_COMPLETED_THIS_APPRAISAL'
export const EXCLUDED_APPRAISAL_ATTESTATION =
  'I_HAVE_REVIEWED_THE_SOURCE_AND_CONFIRMED_IT_IS_NOT_APPLICABLE'

export const PINNED_EVIDENCE_APPRAISAL_REVIEW_TARGETS_SHA256 =
  'b7fe6a8a5bf471b33e51551ab32e876a1d1ba07e5420123802b538db951327ee'

export type EvidenceAppraisalReviewTargetId = (typeof EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS)[number]
export type EvidenceAppraisalBasisValue = (typeof EVIDENCE_APPRAISAL_BASES)[number]
export type EvidenceStudyDesignValue = (typeof EVIDENCE_STUDY_DESIGNS)[number]
export type EvidenceApplicabilityValue = (typeof EVIDENCE_APPLICABILITIES)[number]
export type EvidenceLimitationsStatusValue = (typeof EVIDENCE_LIMITATIONS_STATUSES)[number]
export type EvidenceRiskOfBiasValue = (typeof EVIDENCE_RISK_OF_BIAS_VALUES)[number]
export type EvidenceReviewMethodValue = (typeof EVIDENCE_REVIEW_METHODS)[number]

type ReviewFields = {
  status: 'reviewed' | 'excluded_not_applicable' | null
  basis: EvidenceAppraisalBasisValue | null
  studyDesign: EvidenceStudyDesignValue | null
  studyDesignDetails: string | null
  methodologySummary: string | null
  sampleOrCoverage: string | null
  applicability: EvidenceApplicabilityValue | null
  applicabilityContext: string | null
  applicabilityNotes: string | null
  limitationsStatus: EvidenceLimitationsStatusValue | null
  limitations: readonly string[]
  limitationsNotes: string | null
  riskOfBias: EvidenceRiskOfBiasValue | null
  riskOfBiasNotes: string | null
  framework: string | null
  frameworkVersion: string | null
  reviewMethod: EvidenceReviewMethodValue | null
  reviewedSourceHash: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  notApplicableReason: string | null
  notes: string | null
}

export type PendingEvidenceAppraisalReview = ReviewFields & {
  reviewState: 'pending_human_review'
  attestation: null
  status: null
  basis: null
  studyDesign: null
  studyDesignDetails: null
  methodologySummary: null
  sampleOrCoverage: null
  applicability: null
  applicabilityContext: null
  applicabilityNotes: null
  limitationsStatus: null
  limitations: readonly []
  limitationsNotes: null
  riskOfBias: null
  riskOfBiasNotes: null
  framework: null
  frameworkVersion: null
  reviewMethod: null
  reviewedSourceHash: null
  reviewedBy: null
  reviewedAt: null
  notApplicableReason: null
  notes: null
}

export type CompletedEvidenceAppraisalReview = ReviewFields & {
  reviewState: 'human_review_complete'
  attestation: typeof REVIEWED_APPRAISAL_ATTESTATION | typeof EXCLUDED_APPRAISAL_ATTESTATION
  status: 'reviewed' | 'excluded_not_applicable'
  reviewMethod: EvidenceReviewMethodValue
  reviewedSourceHash: string
  reviewedBy: string
  reviewedAt: string
}

export type EvidenceAppraisalReviewEntry = {
  appraisalId: string
  targetKind: 'SourceDoc'
  targetId: EvidenceAppraisalReviewTargetId
  reviewBasisCitationId: string
  reviewLocator: string
  reviewArtifactPath: string
  expectedSourceHash: string
  hashAlgorithm: 'sha256'
} & (PendingEvidenceAppraisalReview | CompletedEvidenceAppraisalReview)

export type EvidenceAppraisalReviewManifest = {
  manifestVersion: 1
  workflowId: 'evidence-appraisal-pilot-v1'
  entries: readonly EvidenceAppraisalReviewEntry[]
}

export type CompletedEvidenceAppraisalReviewManifest = Omit<
  EvidenceAppraisalReviewManifest,
  'entries'
> & { entries: readonly (EvidenceAppraisalReviewEntry & CompletedEvidenceAppraisalReview)[] }

export type EvidenceAppraisalSourceDocSnapshot = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  doi: string | null
  publisher: string | null
  provenanceType: string
  accessedAt: Date | string | null
  archivedUrl: string | null
  documentId: string | null
}

export type EvidenceAppraisalFieldCitationSnapshot = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
  createdAt: Date | string
}

export type EvidenceAppraisalCitationSnapshot = {
  id: string
  sourceClass: string
  citationReadiness: string
  verificationStatus: string
  citationText: string
  title: string | null
  publisher: string | null
  author: string | null
  year: number | null
  url: string | null
  archivedUrl: string | null
  localPath: string | null
  fileHash: string | null
  contentHash: string | null
  hashAlgorithm: string
  pageRef: string | null
  quote: string | null
  accessedAt: Date | string | null
  captureMethod: string
  verifiedAt: Date | string | null
  verifiedBy: string | null
  confidence: number | null
  notes: string | null
  documentId: string | null
  sourceDocId: string | null
  createdAt: Date | string
  updatedAt: Date | string
  fieldCitations: EvidenceAppraisalFieldCitationSnapshot[]
}

export type EvidenceAppraisalDatabaseSnapshot = {
  id: string
  reportId: string | null
  thesisId: string | null
  sourceDocId: string | null
  status: string
  basis: string | null
  studyDesign: string | null
  studyDesignDetails: string | null
  methodologySummary: string | null
  sampleOrCoverage: string | null
  applicability: string | null
  applicabilityContext: string | null
  applicabilityNotes: string | null
  limitationsStatus: string | null
  limitations: string[]
  limitationsNotes: string | null
  riskOfBias: string | null
  riskOfBiasNotes: string | null
  framework: string | null
  frameworkVersion: string | null
  reviewMethod: string | null
  reviewBasisCitationId: string | null
  reviewedSourceHash: string | null
  hashAlgorithm: string
  reviewedBy: string | null
  reviewedAt: Date | string | null
  notApplicableReason: string | null
  notes: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type EvidenceAppraisalCreateTarget = {
  id: string
  reportId: null
  thesisId: null
  sourceDocId: EvidenceAppraisalReviewTargetId
  status: 'reviewed' | 'excluded_not_applicable'
  basis: EvidenceAppraisalBasisValue | null
  studyDesign: EvidenceStudyDesignValue | null
  studyDesignDetails: string | null
  methodologySummary: string | null
  sampleOrCoverage: string | null
  applicability: EvidenceApplicabilityValue | null
  applicabilityContext: string | null
  applicabilityNotes: string | null
  limitationsStatus: EvidenceLimitationsStatusValue | null
  limitations: string[]
  limitationsNotes: string | null
  riskOfBias: EvidenceRiskOfBiasValue | null
  riskOfBiasNotes: string | null
  framework: string | null
  frameworkVersion: string | null
  reviewMethod: EvidenceReviewMethodValue
  reviewBasisCitationId: string
  reviewedSourceHash: string
  hashAlgorithm: 'sha256'
  reviewedBy: string
  reviewedAt: string
  notApplicableReason: string | null
  notes: string | null
}

type NormalizedSourceDocSnapshot = Omit<EvidenceAppraisalSourceDocSnapshot, 'accessedAt'> & {
  accessedAt: string | null
}

type NormalizedFieldCitationSnapshot = Omit<EvidenceAppraisalFieldCitationSnapshot, 'createdAt'> & {
  createdAt: string
}

type NormalizedCitationSnapshot = Omit<
  EvidenceAppraisalCitationSnapshot,
  'accessedAt' | 'verifiedAt' | 'createdAt' | 'updatedAt' | 'fieldCitations'
> & {
  accessedAt: string | null
  verifiedAt: string | null
  createdAt: string
  updatedAt: string
  fieldCitations: NormalizedFieldCitationSnapshot[]
}

type NormalizedDatabaseAppraisalSnapshot = Omit<
  EvidenceAppraisalDatabaseSnapshot,
  'reviewedAt' | 'createdAt' | 'updatedAt'
> & {
  reviewedAt: string | null
  createdAt: string
  updatedAt: string
}

export type EvidenceAppraisalReviewPlanRow = {
  targetId: EvidenceAppraisalReviewTargetId
  appraisalId: string
  state: 'pending_create' | 'already_applied' | 'conflict'
  target: EvidenceAppraisalCreateTarget
  sourceSnapshot: NormalizedSourceDocSnapshot | null
  sourceSnapshotSha256: string | null
  citationSnapshot: NormalizedCitationSnapshot | null
  citationSnapshotSha256: string | null
  currentAppraisalSnapshot: NormalizedDatabaseAppraisalSnapshot | null
  currentAppraisalSnapshotSha256: string | null
  targetRowSha256: string
  conflicts: string[]
}

export type EvidenceAppraisalReviewPlan = {
  version: 1
  manifestSha256: string
  targetContractSha256: string
  rows: EvidenceAppraisalReviewPlanRow[]
  creates: EvidenceAppraisalReviewPlanRow[]
  alreadyAppliedIds: string[]
  conflicts: Array<{ targetId: EvidenceAppraisalReviewTargetId; reasons: string[] }>
  summary: {
    total: number
    pendingCreates: number
    alreadyApplied: number
    conflicts: number
  }
}

function compareIds(left: { id?: string; targetId?: string }, right: { id?: string; targetId?: string }) {
  return (left.id ?? left.targetId ?? '').localeCompare(right.id ?? right.targetId ?? '')
}

export function sha256EvidenceAppraisalReviewJson(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

function normalizedDate(value: Date | string | null | undefined, field: string) {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Invalid ${field}`)
  return parsed.toISOString()
}

function exactIsoDate(value: string | null, field: string) {
  if (!value) throw new Error(`${field} is required`)
  const parsed = new Date(value)
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString() !== value) {
    throw new Error(`${field} must be an exact ISO-8601 UTC timestamp`)
  }
  return value
}

function cleanText(value: string | null, field: string, minimumLength = 1) {
  if (!value || value !== value.trim() || value.length < minimumLength) {
    throw new Error(`${field} must contain reviewed text without surrounding whitespace`)
  }
  if (/^(?:tbd|todo|pending|unknown|n\/a|placeholder|fill me)$/iu.test(value)) {
    throw new Error(`${field} still contains a placeholder`)
  }
  return value
}

function optionalCleanText(value: string | null, field: string) {
  return value == null ? null : cleanText(value, field)
}

function namedHumanReviewer(value: string | null) {
  const reviewer = cleanText(value, 'reviewedBy', 5)
  if (reviewer.split(/\s+/u).length < 2) {
    throw new Error('reviewedBy must name a human reviewer with at least two name parts')
  }
  if (/\b(?:codex|openai|chatgpt|claude|gemini|machine|automation|bot|reviewer)\b/iu.test(reviewer)) {
    throw new Error('reviewedBy must identify a named human, not a model, role, or automation')
  }
  return reviewer
}

function targetContract(entry: EvidenceAppraisalReviewEntry) {
  return {
    appraisalId: entry.appraisalId,
    targetKind: entry.targetKind,
    targetId: entry.targetId,
    reviewBasisCitationId: entry.reviewBasisCitationId,
    reviewLocator: entry.reviewLocator,
    reviewArtifactPath: entry.reviewArtifactPath,
    expectedSourceHash: entry.expectedSourceHash,
    hashAlgorithm: entry.hashAlgorithm,
  }
}

export function evidenceAppraisalReviewTargetContract(
  manifest: EvidenceAppraisalReviewManifest,
) {
  return {
    manifestVersion: manifest.manifestVersion,
    workflowId: manifest.workflowId,
    entries: manifest.entries.map(targetContract).sort((left, right) => left.targetId.localeCompare(right.targetId)),
  }
}

function validateTargetContract(manifest: EvidenceAppraisalReviewManifest) {
  if (manifest.manifestVersion !== 1 || manifest.workflowId !== 'evidence-appraisal-pilot-v1') {
    throw new Error('EvidenceAppraisal review manifest version/workflow is unsupported')
  }
  if (
    manifest.entries.length !== EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS.length ||
    new Set(manifest.entries.map(entry => entry.targetId)).size !== EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS.length
  ) {
    throw new Error('EvidenceAppraisal review manifest requires exactly three unique pilot targets')
  }
  for (const entry of manifest.entries) {
    if (!EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS.includes(entry.targetId)) {
      throw new Error(`Unexpected EvidenceAppraisal review target: ${entry.targetId}`)
    }
    if (entry.targetKind !== 'SourceDoc') throw new Error(`Only SourceDoc targets are allowed: ${entry.targetId}`)
    if (!/^[a-z0-9_]+$/u.test(entry.appraisalId)) {
      throw new Error(`Deterministic appraisalId is invalid: ${entry.appraisalId}`)
    }
    if (!entry.reviewBasisCitationId || !entry.reviewLocator.startsWith('https://')) {
      throw new Error(`Review basis citation/locator is incomplete: ${entry.targetId}`)
    }
    if (
      !entry.reviewArtifactPath.startsWith('research/evidence-pack/') ||
      !entry.reviewArtifactPath.endsWith('.pdf') ||
      entry.reviewArtifactPath.includes('..')
    ) {
      throw new Error(`Review artifact must use a durable repository evidence-pack path: ${entry.targetId}`)
    }
    if (!/^[a-f0-9]{64}$/u.test(entry.expectedSourceHash) || entry.hashAlgorithm !== 'sha256') {
      throw new Error(`Expected source SHA-256 is invalid: ${entry.targetId}`)
    }
  }
  const targetHash = sha256EvidenceAppraisalReviewJson(evidenceAppraisalReviewTargetContract(manifest))
  if (targetHash !== PINNED_EVIDENCE_APPRAISAL_REVIEW_TARGETS_SHA256) {
    throw new Error('EvidenceAppraisal review target contract drifted from the pinned pilot')
  }
  return targetHash
}

function completedTarget(entry: EvidenceAppraisalReviewEntry): EvidenceAppraisalCreateTarget {
  if (entry.reviewState !== 'human_review_complete') {
    throw new Error(`Human review remains pending for SourceDoc:${entry.targetId}`)
  }
  if (entry.status !== 'reviewed' && entry.status !== 'excluded_not_applicable') {
    throw new Error(`Completed review has no final disposition for SourceDoc:${entry.targetId}`)
  }
  if (!entry.reviewMethod || !EVIDENCE_REVIEW_METHODS.includes(entry.reviewMethod)) {
    throw new Error(`reviewMethod is required for SourceDoc:${entry.targetId}`)
  }
  const reviewedSourceHash = entry.reviewedSourceHash
  if (!/^[a-f0-9]{64}$/u.test(reviewedSourceHash) || reviewedSourceHash !== entry.expectedSourceHash) {
    throw new Error(`Reviewed source hash does not match the pinned source for SourceDoc:${entry.targetId}`)
  }
  const reviewedBy = namedHumanReviewer(entry.reviewedBy)
  const reviewedAt = exactIsoDate(entry.reviewedAt, `reviewedAt for SourceDoc:${entry.targetId}`)
  if (new Date(reviewedAt).valueOf() > Date.now() + 5 * 60 * 1000) {
    throw new Error(`reviewedAt cannot be in the future for SourceDoc:${entry.targetId}`)
  }

  if (entry.status === 'reviewed') {
    if (entry.attestation !== REVIEWED_APPRAISAL_ATTESTATION) {
      throw new Error(`Reviewed attestation is missing for SourceDoc:${entry.targetId}`)
    }
    if (!entry.basis || !EVIDENCE_APPRAISAL_BASES.includes(entry.basis)) {
      throw new Error(`basis is required for SourceDoc:${entry.targetId}`)
    }
    if (!entry.studyDesign || !EVIDENCE_STUDY_DESIGNS.includes(entry.studyDesign)) {
      throw new Error(`studyDesign is required for SourceDoc:${entry.targetId}`)
    }
    if (!entry.applicability || !EVIDENCE_APPLICABILITIES.includes(entry.applicability)) {
      throw new Error(`applicability is required for SourceDoc:${entry.targetId}`)
    }
    if (!entry.limitationsStatus || !EVIDENCE_LIMITATIONS_STATUSES.includes(entry.limitationsStatus)) {
      throw new Error(`limitationsStatus is required for SourceDoc:${entry.targetId}`)
    }
    if (!entry.riskOfBias || !EVIDENCE_RISK_OF_BIAS_VALUES.includes(entry.riskOfBias)) {
      throw new Error(`riskOfBias is required for SourceDoc:${entry.targetId}`)
    }
    if (entry.reviewMethod !== 'full_text') {
      throw new Error(`Reviewed appraisal requires full_text review for SourceDoc:${entry.targetId}`)
    }
    cleanText(entry.methodologySummary, `methodologySummary for SourceDoc:${entry.targetId}`, 12)
    cleanText(entry.sampleOrCoverage, `sampleOrCoverage for SourceDoc:${entry.targetId}`, 8)
    cleanText(entry.applicabilityContext, `applicabilityContext for SourceDoc:${entry.targetId}`, 8)
    cleanText(entry.framework, `framework for SourceDoc:${entry.targetId}`)
    cleanText(entry.frameworkVersion, `frameworkVersion for SourceDoc:${entry.targetId}`)
    if (entry.limitationsStatus === 'identified') {
      if (entry.limitations.length === 0) {
        throw new Error(`At least one limitation is required for SourceDoc:${entry.targetId}`)
      }
      for (const limitation of entry.limitations) {
        cleanText(limitation, `limitation for SourceDoc:${entry.targetId}`, 8)
      }
      if (new Set(entry.limitations).size !== entry.limitations.length) {
        throw new Error(`Limitations must be unique for SourceDoc:${entry.targetId}`)
      }
    } else {
      if (entry.limitations.length !== 0) {
        throw new Error(`limitations must be empty for ${entry.limitationsStatus}: SourceDoc:${entry.targetId}`)
      }
      cleanText(entry.limitationsNotes, `limitationsNotes for SourceDoc:${entry.targetId}`, 8)
    }
    if (['other', 'unclear', 'not_applicable'].includes(entry.studyDesign)) {
      cleanText(entry.studyDesignDetails, `studyDesignDetails for SourceDoc:${entry.targetId}`, 8)
    } else {
      optionalCleanText(entry.studyDesignDetails, `studyDesignDetails for SourceDoc:${entry.targetId}`)
    }
    if (entry.applicability !== 'direct') {
      cleanText(entry.applicabilityNotes, `applicabilityNotes for SourceDoc:${entry.targetId}`, 8)
    } else {
      optionalCleanText(entry.applicabilityNotes, `applicabilityNotes for SourceDoc:${entry.targetId}`)
    }
    cleanText(entry.riskOfBiasNotes, `riskOfBiasNotes for SourceDoc:${entry.targetId}`, 8)
    if (entry.notApplicableReason !== null) {
      throw new Error(`Reviewed appraisal cannot set notApplicableReason: SourceDoc:${entry.targetId}`)
    }
  } else {
    if (entry.attestation !== EXCLUDED_APPRAISAL_ATTESTATION) {
      throw new Error(`Excluded attestation is missing for SourceDoc:${entry.targetId}`)
    }
    cleanText(entry.notApplicableReason, `notApplicableReason for SourceDoc:${entry.targetId}`, 12)
    const mustBeNull: Array<[string, unknown]> = [
      ['basis', entry.basis],
      ['studyDesign', entry.studyDesign],
      ['studyDesignDetails', entry.studyDesignDetails],
      ['methodologySummary', entry.methodologySummary],
      ['sampleOrCoverage', entry.sampleOrCoverage],
      ['applicability', entry.applicability],
      ['applicabilityContext', entry.applicabilityContext],
      ['applicabilityNotes', entry.applicabilityNotes],
      ['limitationsStatus', entry.limitationsStatus],
      ['limitationsNotes', entry.limitationsNotes],
      ['riskOfBias', entry.riskOfBias],
      ['riskOfBiasNotes', entry.riskOfBiasNotes],
      ['framework', entry.framework],
      ['frameworkVersion', entry.frameworkVersion],
    ]
    const unexpected = mustBeNull.filter(([, value]) => value !== null).map(([field]) => field)
    if (unexpected.length > 0 || entry.limitations.length > 0) {
      throw new Error(`Excluded appraisal contains substantive fields: SourceDoc:${entry.targetId}: ${unexpected.join(', ')}`)
    }
  }
  optionalCleanText(entry.notes, `notes for SourceDoc:${entry.targetId}`)

  const target: EvidenceAppraisalCreateTarget = {
    id: entry.appraisalId,
    reportId: null,
    thesisId: null,
    sourceDocId: entry.targetId,
    status: entry.status,
    basis: entry.basis,
    studyDesign: entry.studyDesign,
    studyDesignDetails: entry.studyDesignDetails,
    methodologySummary: entry.methodologySummary,
    sampleOrCoverage: entry.sampleOrCoverage,
    applicability: entry.applicability,
    applicabilityContext: entry.applicabilityContext,
    applicabilityNotes: entry.applicabilityNotes,
    limitationsStatus: entry.limitationsStatus,
    limitations: [...entry.limitations],
    limitationsNotes: entry.limitationsNotes,
    riskOfBias: entry.riskOfBias,
    riskOfBiasNotes: entry.riskOfBiasNotes,
    framework: entry.framework,
    frameworkVersion: entry.frameworkVersion,
    reviewMethod: entry.reviewMethod,
    reviewBasisCitationId: entry.reviewBasisCitationId,
    reviewedSourceHash,
    hashAlgorithm: 'sha256',
    reviewedBy,
    reviewedAt,
    notApplicableReason: entry.notApplicableReason,
    notes: entry.notes,
  }
  const assessment = assessEvidenceAppraisal({
    appraisal: target,
    currentSourceHash: target.reviewedSourceHash,
    reviewBasisCitationPolicySatisfied: true,
    reviewBasisCitationTargetSatisfied: true,
  })
  if (!assessment.structurallyComplete) {
    throw new Error(`EvidenceAppraisal structural contract failed for SourceDoc:${entry.targetId}`)
  }
  return target
}

export function validateEvidenceAppraisalReviewTemplate(manifest: EvidenceAppraisalReviewManifest) {
  validateTargetContract(manifest)
  return manifest
}

export function validateCompletedEvidenceAppraisalReviewManifest(
  manifest: EvidenceAppraisalReviewManifest,
): CompletedEvidenceAppraisalReviewManifest {
  validateTargetContract(manifest)
  for (const entry of manifest.entries) completedTarget(entry)
  return manifest as CompletedEvidenceAppraisalReviewManifest
}

export function evidenceAppraisalCreateTargets(manifest: EvidenceAppraisalReviewManifest) {
  validateCompletedEvidenceAppraisalReviewManifest(manifest)
  return manifest.entries.map(completedTarget).sort(compareIds)
}

function normalizeSourceDoc(row: EvidenceAppraisalSourceDocSnapshot): NormalizedSourceDocSnapshot {
  return { ...row, accessedAt: normalizedDate(row.accessedAt, `SourceDoc.accessedAt:${row.id}`) }
}

function normalizeFieldCitation(row: EvidenceAppraisalFieldCitationSnapshot): NormalizedFieldCitationSnapshot {
  return { ...row, createdAt: normalizedDate(row.createdAt, `FieldCitation.createdAt:${row.id}`)! }
}

function normalizeCitation(row: EvidenceAppraisalCitationSnapshot): NormalizedCitationSnapshot {
  return {
    ...row,
    accessedAt: normalizedDate(row.accessedAt, `SourceCitation.accessedAt:${row.id}`),
    verifiedAt: normalizedDate(row.verifiedAt, `SourceCitation.verifiedAt:${row.id}`),
    createdAt: normalizedDate(row.createdAt, `SourceCitation.createdAt:${row.id}`)!,
    updatedAt: normalizedDate(row.updatedAt, `SourceCitation.updatedAt:${row.id}`)!,
    fieldCitations: row.fieldCitations.map(normalizeFieldCitation).sort(compareIds),
  }
}

function normalizeDatabaseAppraisal(
  row: EvidenceAppraisalDatabaseSnapshot,
): NormalizedDatabaseAppraisalSnapshot {
  return {
    ...row,
    limitations: [...row.limitations],
    reviewedAt: normalizedDate(row.reviewedAt, `EvidenceAppraisal.reviewedAt:${row.id}`),
    createdAt: normalizedDate(row.createdAt, `EvidenceAppraisal.createdAt:${row.id}`)!,
    updatedAt: normalizedDate(row.updatedAt, `EvidenceAppraisal.updatedAt:${row.id}`)!,
  }
}

function existingAppraisalTarget(row: NormalizedDatabaseAppraisalSnapshot): EvidenceAppraisalCreateTarget {
  return {
    id: row.id,
    reportId: row.reportId as null,
    thesisId: row.thesisId as null,
    sourceDocId: row.sourceDocId as EvidenceAppraisalReviewTargetId,
    status: row.status as EvidenceAppraisalCreateTarget['status'],
    basis: row.basis as EvidenceAppraisalBasisValue | null,
    studyDesign: row.studyDesign as EvidenceStudyDesignValue | null,
    studyDesignDetails: row.studyDesignDetails,
    methodologySummary: row.methodologySummary,
    sampleOrCoverage: row.sampleOrCoverage,
    applicability: row.applicability as EvidenceApplicabilityValue | null,
    applicabilityContext: row.applicabilityContext,
    applicabilityNotes: row.applicabilityNotes,
    limitationsStatus: row.limitationsStatus as EvidenceLimitationsStatusValue | null,
    limitations: [...row.limitations],
    limitationsNotes: row.limitationsNotes,
    riskOfBias: row.riskOfBias as EvidenceRiskOfBiasValue | null,
    riskOfBiasNotes: row.riskOfBiasNotes,
    framework: row.framework,
    frameworkVersion: row.frameworkVersion,
    reviewMethod: row.reviewMethod as EvidenceReviewMethodValue,
    reviewBasisCitationId: row.reviewBasisCitationId ?? '',
    reviewedSourceHash: row.reviewedSourceHash ?? '',
    hashAlgorithm: row.hashAlgorithm as 'sha256',
    reviewedBy: row.reviewedBy ?? '',
    reviewedAt: row.reviewedAt ?? '',
    notApplicableReason: row.notApplicableReason,
    notes: row.notes,
  }
}

export function evidenceAppraisalReviewManifestContract(manifest: EvidenceAppraisalReviewManifest) {
  return {
    ...manifest,
    entries: [...manifest.entries]
      .sort((left, right) => left.targetId.localeCompare(right.targetId))
      .map(entry => ({ ...entry, limitations: [...entry.limitations] })),
  }
}

export function buildEvidenceAppraisalReviewPlan(
  manifest: EvidenceAppraisalReviewManifest,
  sourceDocs: readonly EvidenceAppraisalSourceDocSnapshot[],
  citations: readonly EvidenceAppraisalCitationSnapshot[],
  appraisals: readonly EvidenceAppraisalDatabaseSnapshot[],
): EvidenceAppraisalReviewPlan {
  const completed = validateCompletedEvidenceAppraisalReviewManifest(manifest)
  const targets = new Map(evidenceAppraisalCreateTargets(completed).map(target => [target.sourceDocId, target]))
  const rows: EvidenceAppraisalReviewPlanRow[] = []

  for (const entry of [...completed.entries].sort((left, right) => left.targetId.localeCompare(right.targetId))) {
    const target = targets.get(entry.targetId)!
    const matchingSources = sourceDocs.filter(row => row.id === entry.targetId)
    const matchingCitations = citations.filter(row => row.id === entry.reviewBasisCitationId)
    const matchingAppraisals = appraisals.filter(row =>
      row.id === entry.appraisalId || row.sourceDocId === entry.targetId,
    )
    const conflicts: string[] = []
    if (matchingSources.length !== 1) {
      conflicts.push(`expected one SourceDoc snapshot, found ${matchingSources.length}`)
    }
    if (matchingCitations.length !== 1) {
      conflicts.push(`expected one review-basis SourceCitation snapshot, found ${matchingCitations.length}`)
    }
    if (matchingAppraisals.length > 1) {
      conflicts.push(`multiple EvidenceAppraisal rows occupy id/target scope: ${matchingAppraisals.map(row => row.id).join(', ')}`)
    }

    const sourceSnapshot = matchingSources[0] ? normalizeSourceDoc(matchingSources[0]) : null
    const citationSnapshot = matchingCitations[0] ? normalizeCitation(matchingCitations[0]) : null
    const currentAppraisalSnapshot = matchingAppraisals[0]
      ? normalizeDatabaseAppraisal(matchingAppraisals[0])
      : null

    if (citationSnapshot) {
      if (citationSnapshot.sourceDocId !== entry.targetId) {
        conflicts.push(`review-basis citation is linked to ${citationSnapshot.sourceDocId ?? 'no SourceDoc'}`)
      }
      const targetFieldCitation = citationSnapshot.fieldCitations.some(field =>
        field.entityType === 'SourceDoc' && field.entityId === entry.targetId,
      )
      if (!targetFieldCitation) conflicts.push('review-basis citation has no same-target SourceDoc FieldCitation')
      if (citationSnapshot.hashAlgorithm !== 'sha256') conflicts.push('review-basis citation hash algorithm is not sha256')
      const citationHashes = [citationSnapshot.fileHash, citationSnapshot.contentHash]
        .filter((value): value is string => Boolean(value))
      if (!citationHashes.includes(entry.expectedSourceHash)) {
        conflicts.push('review-basis citation does not carry the reviewed source hash')
      }
      if (new Set(citationHashes).size > 1) {
        conflicts.push('review-basis citation carries conflicting file/content hashes')
      }
      if (['blocked_unsourced', 'internal_context'].includes(citationSnapshot.citationReadiness)) {
        conflicts.push(`review-basis citation readiness is ${citationSnapshot.citationReadiness}`)
      }
      if (['needs_review', 'failed', 'rejected', 'disputed'].includes(citationSnapshot.verificationStatus)) {
        conflicts.push(`review-basis citation verification is ${citationSnapshot.verificationStatus}`)
      }
    }
    if (sourceSnapshot && sourceSnapshot.id !== target.sourceDocId) {
      conflicts.push(`SourceDoc target mismatch: ${sourceSnapshot.id}`)
    }

    let state: EvidenceAppraisalReviewPlanRow['state'] = 'pending_create'
    if (currentAppraisalSnapshot) {
      const existingTarget = existingAppraisalTarget(currentAppraisalSnapshot)
      if (JSON.stringify(existingTarget) === JSON.stringify(target)) {
        state = 'already_applied'
      } else {
        state = 'conflict'
        conflicts.push('existing EvidenceAppraisal differs from the reviewed create target')
      }
    }
    if (conflicts.length > 0) state = 'conflict'

    rows.push({
      targetId: entry.targetId,
      appraisalId: entry.appraisalId,
      state,
      target,
      sourceSnapshot,
      sourceSnapshotSha256: sourceSnapshot ? sha256EvidenceAppraisalReviewJson(sourceSnapshot) : null,
      citationSnapshot,
      citationSnapshotSha256: citationSnapshot ? sha256EvidenceAppraisalReviewJson(citationSnapshot) : null,
      currentAppraisalSnapshot,
      currentAppraisalSnapshotSha256: currentAppraisalSnapshot
        ? sha256EvidenceAppraisalReviewJson(currentAppraisalSnapshot)
        : null,
      targetRowSha256: sha256EvidenceAppraisalReviewJson(target),
      conflicts,
    })
  }

  const creates = rows.filter(row => row.state === 'pending_create')
  const alreadyAppliedIds = rows.filter(row => row.state === 'already_applied').map(row => row.appraisalId)
  const conflicts = rows
    .filter(row => row.state === 'conflict')
    .map(row => ({ targetId: row.targetId, reasons: [...row.conflicts] }))
  return {
    version: 1,
    manifestSha256: sha256EvidenceAppraisalReviewJson(evidenceAppraisalReviewManifestContract(completed)),
    targetContractSha256: sha256EvidenceAppraisalReviewJson(evidenceAppraisalReviewTargetContract(completed)),
    rows,
    creates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: rows.length,
      pendingCreates: creates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function evidenceAppraisalReviewPlanContract(plan: EvidenceAppraisalReviewPlan) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    targetContractSha256: plan.targetContractSha256,
    rows: plan.rows,
    creates: plan.creates.map(row => row.appraisalId),
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
  }
}
