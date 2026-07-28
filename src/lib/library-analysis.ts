export const LIBRARY_ANALYSIS_STATUSES = [
  'not_started',
  'inventory_only',
  'ai_draft',
  'validated',
  'review_required',
  'approved_internal',
  'blocked',
  'superseded',
] as const

export type LibraryAnalysisStatus = (typeof LIBRARY_ANALYSIS_STATUSES)[number]

export const LIBRARY_ANALYSIS_USAGE_RULES = [
  'internal_background',
  'safe_for_ai_context',
  'safe_for_external_claims',
  'claim_candidate_review',
  'do_not_use_for_claims',
  'requires_actor_gate',
  'type_c_gap',
] as const

export type LibraryAnalysisUsageRule = (typeof LIBRARY_ANALYSIS_USAGE_RULES)[number]

export const LIBRARY_ANALYSIS_SOURCE_KINDS = [
  'document',
  'source_doc',
  'report',
  'thesis',
  'library_file',
] as const

export type LibraryAnalysisSourceKind = (typeof LIBRARY_ANALYSIS_SOURCE_KINDS)[number]

export const LIBRARY_ANALYSIS_GAP_KINDS = [
  'type_b_actor_gate',
  'type_c_not_desk_research',
  'needs_text_extraction',
  'unclear_source',
] as const

export type LibraryAnalysisGapKind = (typeof LIBRARY_ANALYSIS_GAP_KINDS)[number]

const STATUS_SET = new Set<string>(LIBRARY_ANALYSIS_STATUSES)
const USAGE_RULE_SET = new Set<string>(LIBRARY_ANALYSIS_USAGE_RULES)

export type LibraryAnalysisSourceKeyInput = {
  sourceKind: LibraryAnalysisSourceKind
  id?: string | null
  path?: string | null
}

export type LibraryAnalysisClassificationInput = {
  wordCount: number
  hasLocalFile: boolean
  hasDbLink: boolean
  citationReadiness?: string | null
  claimCandidateCount: number
  riskFlags: string[]
  gapKinds: LibraryAnalysisGapKind[]
  isSuperseded: boolean
  isBlockedSource?: boolean
  isCuratedShortSummary?: boolean
  hasExternalLocator?: boolean
  isLooseLibraryFile?: boolean
}

export type LibraryAnalysisClassification = {
  status: LibraryAnalysisStatus
  usageRule: LibraryAnalysisUsageRule
  reviewRequired: boolean
  reasons: string[]
}

export type LibraryAiCardClaimCandidate = {
  text: string
  evidence?: string
  sourcePath?: string
  pageRef?: string
}

export type LibraryAiCardGap = {
  kind: 'none' | LibraryAnalysisGapKind
  note: string
}

export type LibraryAiCardControlLink = {
  label: string
  href: string
}

export type LibraryAiCard = {
  shortSummary: string
  keyFindings: string[]
  claimCandidates: LibraryAiCardClaimCandidate[]
  projectImplication: string
  gaps: LibraryAiCardGap[]
  citationStatus: string
  recommendedUsageRule: LibraryAnalysisUsageRule | string
  status: LibraryAnalysisStatus | string
  controlLinks: LibraryAiCardControlLink[]
  riskFlags: string[]
  externalApprovalEvidence?: {
    citationPolicyHash: string
    eligibleCitationIds: string[]
  }
}

export type LibraryAiCardValidation = {
  ok: boolean
  issues: string[]
}

export type LibraryAnalysisExternalApprovalInput = {
  sourceKind?: string | null
  sourceKey?: string | null
  documentId?: string | null
  status: string
  usageRule: string
  reviewStatus?: string | null
  reviewedAt?: Date | string | null
  reviewer?: string | null
  citationReadiness?: string | null
  contentHash?: string | null
  currentContentHash?: string | null
  externalCitationPolicyHash?: string | null
  currentExternalCitationPolicyHash?: string | null
  riskFlags: string[]
  claimCandidateCount?: number
}

export type LibraryAnalysisExternalApproval = {
  eligible: boolean
  blockers: string[]
}

export type LibraryAnalysisSummaryInput = {
  status: LibraryAnalysisStatus | string
  usageRule: LibraryAnalysisUsageRule | string
  claimCandidateCount: number
  riskFlags: string[]
}

export type LibraryAnalysisSummary = {
  total: number
  finished: number
  reviewRequired: number
  blocked: number
  typeB: number
  typeC: number
  claimCandidates: number
  missingText: number
}

export function buildLibraryAnalysisSourceKey(input: LibraryAnalysisSourceKeyInput): string {
  const key = input.id ?? input.path
  if (!key) {
    throw new Error(`Library analysis source ${input.sourceKind} requires id or path`)
  }

  return `${input.sourceKind}:${key}`
}

export function classifyLibraryAnalysisRecord(
  input: LibraryAnalysisClassificationInput,
): LibraryAnalysisClassification {
  if (input.isSuperseded) {
    return {
      status: 'superseded',
      usageRule: 'do_not_use_for_claims',
      reviewRequired: false,
      reasons: ['superseded'],
    }
  }

  if (input.isBlockedSource) {
    return {
      status: 'blocked',
      usageRule: 'do_not_use_for_claims',
      reviewRequired: false,
      reasons: ['blocked_source'],
    }
  }

  if (input.gapKinds.includes('type_c_not_desk_research')) {
    return {
      status: 'blocked',
      usageRule: 'type_c_gap',
      reviewRequired: true,
      reasons: ['type_c_not_desk_research'],
    }
  }

  if (input.gapKinds.includes('type_b_actor_gate')) {
    return {
      status: 'review_required',
      usageRule: 'requires_actor_gate',
      reviewRequired: true,
      reasons: ['type_b_actor_gate'],
    }
  }

  if (input.claimCandidateCount > 0) {
    return {
      status: 'review_required',
      usageRule: 'claim_candidate_review',
      reviewRequired: true,
      reasons: ['claim_candidate_review'],
    }
  }

  if (input.isCuratedShortSummary && input.hasLocalFile && input.hasDbLink) {
    return {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['curated_short_summary'],
    }
  }

  if (!input.hasLocalFile && input.hasDbLink && input.hasExternalLocator && input.wordCount >= 150) {
    return {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['url_backed_internal_context'],
    }
  }

  if (!input.hasDbLink && input.hasLocalFile && input.isLooseLibraryFile && input.wordCount >= 150) {
    return {
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewRequired: false,
      reasons: ['loose_library_file'],
    }
  }

  const reasons: string[] = []
  if (input.wordCount < 150) reasons.push('low_text_quality')
  if (!input.hasLocalFile) reasons.push('missing_file_path')
  if (!input.hasDbLink) reasons.push('orphan_source')

  for (const riskFlag of input.riskFlags) {
    if (!reasons.includes(riskFlag)) reasons.push(riskFlag)
  }

  if (reasons.length > 0) {
    return {
      status: 'review_required',
      usageRule: 'internal_background',
      reviewRequired: true,
      reasons,
    }
  }

  const citationReadiness = input.citationReadiness ?? 'blocked_unsourced'
  const citable = citationReadiness === 'citable_external' || citationReadiness === 'citable_with_note'

  return {
    status: citable ? 'approved_internal' : 'ai_draft',
    usageRule: citable ? 'safe_for_ai_context' : 'internal_background',
    reviewRequired: false,
    reasons: [],
  }
}

export function validateLibraryAiCard(card: Partial<LibraryAiCard>): LibraryAiCardValidation {
  const issues: string[] = []

  if (!card.shortSummary?.trim()) issues.push('missing_short_summary')
  if (!Array.isArray(card.keyFindings)) issues.push('missing_key_findings')
  if (!card.projectImplication?.trim()) issues.push('missing_project_implication')
  if (!card.citationStatus?.trim()) issues.push('missing_citation_status')
  if (!card.status || !STATUS_SET.has(card.status)) issues.push('unknown_status')
  if (!card.recommendedUsageRule || !USAGE_RULE_SET.has(card.recommendedUsageRule)) issues.push('unknown_usage_rule')
  if (card.recommendedUsageRule === 'safe_for_external_claims') {
    issues.push('external_usage_requires_human_approval')
  }
  if (!Array.isArray(card.controlLinks) || card.controlLinks.length === 0) issues.push('missing_control_links')

  if (!Array.isArray(card.claimCandidates)) {
    issues.push('missing_claim_candidates')
  } else if (card.claimCandidates.some(candidate => !hasClaimGrounding(candidate))) {
    issues.push('claim_candidate_missing_source_grounding')
  }

  return { ok: issues.length === 0, issues }
}

export function assessLibraryAnalysisExternalApproval(
  record: LibraryAnalysisExternalApprovalInput,
): LibraryAnalysisExternalApproval {
  const blockers: string[] = []

  if (record.status !== 'validated') blockers.push('status_not_validated')
  if (record.usageRule !== 'safe_for_external_claims') blockers.push('usage_rule_not_external')
  if (record.reviewStatus !== 'approved') blockers.push('review_status_not_approved')
  if (!hasValidReviewTimestamp(record.reviewedAt) || !record.reviewer?.trim()) {
    blockers.push('review_provenance_missing')
  }
  if (record.citationReadiness !== 'citable_external') {
    blockers.push('citation_not_citable_external')
  }
  if (record.sourceKind !== 'document') blockers.push('source_kind_not_document')
  if (!record.documentId || record.sourceKey !== `document:${record.documentId}`) {
    blockers.push('source_binding_invalid')
  }
  if (!isSha256(record.contentHash)) blockers.push('content_hash_missing_or_invalid')
  if (!isSha256(record.currentContentHash)) {
    blockers.push('current_content_hash_missing_or_invalid')
  } else if (record.contentHash !== record.currentContentHash) {
    blockers.push('content_hash_mismatch')
  }
  if (!isSha256(record.externalCitationPolicyHash)) {
    blockers.push('external_citation_policy_hash_missing_or_invalid')
  }
  if (!isSha256(record.currentExternalCitationPolicyHash)) {
    blockers.push('current_external_citation_policy_ineligible')
  } else if (record.externalCitationPolicyHash !== record.currentExternalCitationPolicyHash) {
    blockers.push('external_citation_policy_hash_mismatch')
  }
  if (record.riskFlags.length > 0) blockers.push('risk_flags_present')
  if ((record.claimCandidateCount ?? 0) > 0) blockers.push('claim_candidates_present')

  return { eligible: blockers.length === 0, blockers }
}

export function requiresLibraryAnalysisReview(
  record: LibraryAnalysisExternalApprovalInput,
): boolean {
  return record.reviewStatus === 'queued' ||
    record.reviewStatus === 'not_reviewed' ||
    (record.usageRule === 'safe_for_external_claims' && !assessLibraryAnalysisExternalApproval(record).eligible) ||
    record.status === 'not_started' ||
    record.status === 'inventory_only' ||
    record.status === 'review_required'
}

function hasValidReviewTimestamp(value: Date | string | null | undefined): boolean {
  if (!value) return false
  const timestamp = value instanceof Date ? value : new Date(value)
  return !Number.isNaN(timestamp.getTime())
}

function isSha256(value: string | null | undefined): boolean {
  return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value)
}

export function summarizeLibraryAnalysisRecords(records: LibraryAnalysisSummaryInput[]): LibraryAnalysisSummary {
  return records.reduce<LibraryAnalysisSummary>(
    (summary, record) => {
      summary.total += 1
      if (record.status === 'approved_internal' || record.status === 'validated') summary.finished += 1
      if (record.status === 'review_required') summary.reviewRequired += 1
      if (record.status === 'blocked') summary.blocked += 1
      if (record.usageRule === 'requires_actor_gate' || record.riskFlags.includes('type_b_actor_gate')) summary.typeB += 1
      if (record.usageRule === 'type_c_gap' || record.riskFlags.includes('type_c_not_desk_research')) summary.typeC += 1
      summary.claimCandidates += record.claimCandidateCount
      if (record.riskFlags.includes('missing_text') || record.riskFlags.includes('low_text_quality')) summary.missingText += 1
      return summary
    },
    {
      total: 0,
      finished: 0,
      reviewRequired: 0,
      blocked: 0,
      typeB: 0,
      typeC: 0,
      claimCandidates: 0,
      missingText: 0,
    },
  )
}

function hasClaimGrounding(candidate: LibraryAiCardClaimCandidate): boolean {
  return Boolean(candidate.evidence?.trim() || candidate.sourcePath?.trim() || candidate.pageRef?.trim())
}
