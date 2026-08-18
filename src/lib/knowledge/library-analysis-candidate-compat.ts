import type {
  CandidateAnalysisMachineState,
  CandidateEvidenceLevel,
  CandidateIdentityConfidence,
  CandidateMachineUse,
} from './candidate-analysis-contract'

export type LegacyLibraryAnalysisRecordInput = {
  sourceKind: string
  sourceKey: string
  documentId?: string | null
  sourceDocId?: string | null
  status: string
  usageRule: string
  reviewStatus?: string | null
  aiCard: unknown
  claimCandidates?: unknown
  contentHash?: string | null
  reviewedAt?: Date | string | null
  reviewer?: string | null
}

export type LegacyLibraryCandidateProjection = {
  sourceKind: string
  sourceKey: string
  hasCandidate: boolean
  reason: 'projected' | 'legacy_analysis_absent'
  machineState: CandidateAnalysisMachineState | null
  machineUse: CandidateMachineUse | null
  humanReviewState: 'not_requested'
  legacyAuthorityState: 'none' | 'unclassified'
  promotionByTarget: { internal: 'candidate'; external: 'candidate' }
  identityConfidence: CandidateIdentityConfidence
  evidenceLevel: CandidateEvidenceLevel
  limitations: string[]
}

export type LegacyLibraryCandidateSummary = {
  recordsTotal: number
  projectedCandidates: number
  analysisAbsent: number
  unclassifiedHumanSignals: number
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const COMPLETE_STATUSES = new Set(['approved_internal', 'validated'])
const PARTIAL_STATUSES = new Set([
  'not_started',
  'inventory_only',
  'ai_draft',
  'review_required',
])

export function projectLegacyLibraryAnalysisRecord(
  record: LegacyLibraryAnalysisRecordInput,
): LegacyLibraryCandidateProjection {
  const aiCardExists = isRecord(record.aiCard)
  const hasCandidate = !(
    !aiCardExists &&
    (record.status === 'not_started' || record.status === 'inventory_only')
  )
  const identityConfidence = projectIdentityConfidence(record)
  const claims = readClaimCandidates(record)
  const evidenceLevel = projectEvidenceLevel(claims)
  const legacyAuthorityState = hasLegacyAuthoritySignal(record)
    ? 'unclassified'
    : 'none'

  const limitations: string[] = []
  if (legacyAuthorityState === 'unclassified') {
    limitations.push('legacy_review_requires_authority_classification')
  }

  if (!hasCandidate) {
    return {
      sourceKind: record.sourceKind,
      sourceKey: record.sourceKey,
      hasCandidate: false,
      reason: 'legacy_analysis_absent',
      machineState: null,
      machineUse: null,
      humanReviewState: 'not_requested',
      legacyAuthorityState,
      promotionByTarget: candidatePromotionByTarget(),
      identityConfidence,
      evidenceLevel,
      limitations,
    }
  }

  const machineState = projectMachineState(record, aiCardExists)
  const machineUse = projectMachineUse(record, machineState)

  if (machineState === 'failed') {
    limitations.push('legacy_analysis_blocked')
  } else if (machineState === 'superseded') {
    limitations.push('legacy_candidate_superseded')
  } else if (COMPLETE_STATUSES.has(record.status) && machineState === 'partial') {
    limitations.push('legacy_completion_evidence_incomplete')
  } else if (!COMPLETE_STATUSES.has(record.status) && !PARTIAL_STATUSES.has(record.status)) {
    limitations.push('legacy_status_unmapped')
  }

  if (identityConfidence === 'provisional') {
    limitations.push('legacy_source_binding_not_exact')
  } else if (identityConfidence === 'unresolved') {
    limitations.push('legacy_content_hash_missing_or_invalid')
  }

  if (claims.length > 0 && evidenceLevel === 'partial_locator') {
    limitations.push('legacy_claim_locator_partial')
  } else if (claims.length > 0 && evidenceLevel === 'no_locator') {
    limitations.push('legacy_claim_locator_missing')
  }

  return {
    sourceKind: record.sourceKind,
    sourceKey: record.sourceKey,
    hasCandidate: true,
    reason: 'projected',
    machineState,
    machineUse,
    humanReviewState: 'not_requested',
    legacyAuthorityState,
    promotionByTarget: candidatePromotionByTarget(),
    identityConfidence,
    evidenceLevel,
    limitations,
  }
}

export function summarizeLegacyLibraryCandidateProjection(
  records: readonly LegacyLibraryAnalysisRecordInput[],
): LegacyLibraryCandidateSummary {
  const summary: LegacyLibraryCandidateSummary = {
    recordsTotal: 0,
    projectedCandidates: 0,
    analysisAbsent: 0,
    unclassifiedHumanSignals: 0,
  }

  for (const record of records) {
    const projected = projectLegacyLibraryAnalysisRecord(record)
    summary.recordsTotal += 1
    if (projected.hasCandidate) summary.projectedCandidates += 1
    else summary.analysisAbsent += 1
    if (projected.legacyAuthorityState === 'unclassified') {
      summary.unclassifiedHumanSignals += 1
    }
  }

  return summary
}

function projectMachineState(
  record: LegacyLibraryAnalysisRecordInput,
  aiCardExists: boolean,
): CandidateAnalysisMachineState {
  if (record.status === 'blocked') return 'failed'
  if (record.status === 'superseded') return 'superseded'
  if (COMPLETE_STATUSES.has(record.status)) {
    return aiCardExists && isSha256(record.contentHash)
      ? 'candidate_complete'
      : 'partial'
  }
  return 'partial'
}

function projectMachineUse(
  record: LegacyLibraryAnalysisRecordInput,
  machineState: CandidateAnalysisMachineState,
): CandidateMachineUse {
  if (machineState === 'failed' || machineState === 'superseded') {
    return 'quarantined'
  }
  return record.usageRule === 'safe_for_ai_context'
    ? 'reusable_for_ai_context'
    : 'candidate_only'
}

function projectIdentityConfidence(
  record: LegacyLibraryAnalysisRecordInput,
): CandidateIdentityConfidence {
  if (!isSha256(record.contentHash)) return 'unresolved'

  const exactDocumentBinding =
    record.sourceKind === 'document' &&
    hasText(record.documentId) &&
    record.sourceKey === `document:${record.documentId}`
  const exactSourceDocBinding =
    record.sourceKind === 'source_doc' &&
    hasText(record.sourceDocId) &&
    record.sourceKey === `source_doc:${record.sourceDocId}`

  return exactDocumentBinding || exactSourceDocBinding ? 'exact' : 'provisional'
}

function projectEvidenceLevel(
  claims: readonly unknown[],
): CandidateEvidenceLevel {
  if (claims.length === 0) return 'no_locator'

  let anyGrounding = false
  let everyClaimHasExactLocator = true

  for (const claim of claims) {
    if (!isValidLegacyClaim(claim)) {
      everyClaimHasExactLocator = false
      continue
    }
    const exactLocator =
      hasOwnText(claim, 'pageRef') ||
      hasOwnText(claim, 'recordRef') ||
      hasOwnText(claim, 'recordLocator')
    const grounded =
      exactLocator ||
      hasOwnText(claim, 'evidence') ||
      hasOwnText(claim, 'sourcePath')

    everyClaimHasExactLocator &&= exactLocator
    anyGrounding ||= grounded
  }

  if (everyClaimHasExactLocator) return 'exact_locator'
  return anyGrounding ? 'partial_locator' : 'no_locator'
}

function readClaimCandidates(
  record: LegacyLibraryAnalysisRecordInput,
): unknown[] {
  if (
    isPlainRecord(record) &&
    Object.prototype.hasOwnProperty.call(record, 'claimCandidates') &&
    Array.isArray(record.claimCandidates)
  ) {
    return [...record.claimCandidates]
  }
  if (
    isPlainRecord(record.aiCard) &&
    Object.prototype.hasOwnProperty.call(record.aiCard, 'claimCandidates') &&
    Array.isArray(record.aiCard.claimCandidates)
  ) {
    return [...record.aiCard.claimCandidates]
  }
  return []
}

function hasLegacyAuthoritySignal(
  record: LegacyLibraryAnalysisRecordInput,
): boolean {
  const reviewStatus = record.reviewStatus?.trim().toLowerCase() ?? ''
  return (
    hasText(record.reviewer) ||
    record.reviewedAt !== null && record.reviewedAt !== undefined ||
    record.status === 'approved_internal' ||
    record.status === 'validated' ||
    reviewStatus.includes('approved') ||
    reviewStatus.includes('accepted')
  )
}

function candidatePromotionByTarget(): {
  internal: 'candidate'
  external: 'candidate'
} {
  return { internal: 'candidate', external: 'candidate' }
}

function isSha256(value: string | null | undefined): value is string {
  return typeof value === 'string' && SHA256_PATTERN.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function isValidLegacyClaim(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return (
    (prototype === Object.prototype || prototype === null) &&
    hasOwnText(value, 'text')
  )
}

function hasOwnText(record: Record<string, unknown>, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(record, key) && hasText(record[key])
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}
