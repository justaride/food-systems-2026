import {
  LIBRARY_ANALYSIS_USAGE_RULES,
  assessLibraryAnalysisExternalApproval,
  requiresLibraryAnalysisReview,
  summarizeLibraryAnalysisRecords,
} from '@/lib/library-analysis'
import { computeLibraryContentHash } from '@/lib/library-analysis-inventory'
import {
  assessCitationUse,
  type CitationPolicyInput,
} from '@/lib/citations/external-citation-policy'
import {
  assessLibraryAnalysisExternalCitationPolicy,
  readLibraryAnalysisExternalCitationPolicyHash,
} from '@/lib/library-analysis-external-citations'
import {
  buildAutomatedLibraryAnalysisStatusFromRunConfigs,
  type AutomatedLibraryAnalysisStatus,
} from '@/lib/knowledge/library-analysis-automated-status'
import libraryAnalysisCalibration from '../../../knowledge/calibration/library-analysis-calibration.v2.json'

export const LIBRARY_ANALYSIS_CALIBRATION = libraryAnalysisCalibration

export type LibraryAnalysisStatusRecord = {
  sourceKind?: string | null
  sourceKey?: string | null
  documentId?: string | null
  status: string
  usageRule: string
  reviewStatus: string | null
  reviewedAt?: Date | string | null
  reviewer?: string | null
  citationReadiness?: string | null
  contentHash?: string | null
  currentContentHash?: string | null
  externalCitationEligible?: boolean
  externalCitationPolicyHash?: string | null
  currentExternalCitationPolicyHash?: string | null
  riskFlags: string[]
  claimCandidates: unknown
}

export type LibraryAnalysisBadge = {
  status: string
  usageRule: string
  reviewRequired: boolean
  claimCandidateCount: number
  riskFlags: string[]
  externalClaimEligible: boolean
}

export type LibraryAnalysisStatusPayload = ReturnType<typeof buildLibraryAnalysisStatusPayload> & {
  automated: AutomatedLibraryAnalysisStatus
  calibration: typeof libraryAnalysisCalibration
}

export type LibraryAnalysisRecordRow = {
  id: string
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  aiSummary: string | null
  keyFindings: string[]
  projectImplications: string[]
  riskFlags: string[]
  claimCandidateCount: number
  externalClaimEligible: boolean
  wordCount: number
  updatedAt: Date
}

export function buildLibraryAnalysisStatusPayload(records: LibraryAnalysisStatusRecord[]) {
  const summary = summarizeLibraryAnalysisRecords(records.map(record => ({
    status: record.status,
    usageRule: record.usageRule,
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
    riskFlags: record.riskFlags,
  })))

  const pendingReviewRecords = records.filter(record => requiresLibraryReview(record))
  const pendingReview = pendingReviewRecords.length
  const pendingReviewHighRisk = pendingReviewRecords.filter(isHighRiskReviewRecord).length
  const processed = records.filter(record => isTerminalClassification(record) && !requiresLibraryReview(record)).length
  const approvedForAi = records.filter(record =>
    (record.status === 'approved_internal' || record.status === 'validated') &&
    record.usageRule === 'safe_for_ai_context'
  ).length
  const safelyBlocked = records.filter(record =>
    (record.status === 'blocked' || record.status === 'superseded') &&
    record.usageRule === 'do_not_use_for_claims' &&
    !requiresLibraryReview(record)
  ).length
  const classificationConflicts = records.filter(hasClassificationConflict).length
  const humanReviewed = records.filter(hasNamedHumanReview).length
  const externalUsageContractAvailable = LIBRARY_ANALYSIS_USAGE_RULES.some(isExternalUsageRule)
  const externalClaimEligible = records.filter(isExternalClaimEligible).length
  const invalidExternalApprovals = records.filter(record => (
    isExternalUsageRule(record.usageRule) && !isExternalApprovalEligible(record)
  )).length
  const externalCitationBlocked = records.filter(record => (
    isExternalUsageRule(record.usageRule) &&
    assessExternalApproval(record).blockers.some(isExternalCitationPolicyBlocker)
  )).length
  const aiDraft = records.filter(record => record.status === 'ai_draft').length
  const externalBlockers = [
    ...(!externalUsageContractAvailable ? ['no_external_usage_rule'] : []),
    ...(humanReviewed === 0 ? ['no_named_dated_human_review'] : []),
    ...(aiDraft > 0 ? [`${aiDraft}_ai_drafts`] : []),
    ...(summary.blocked > 0 ? [`${summary.blocked}_blocked_records`] : []),
    ...(invalidExternalApprovals > 0
      ? [`${invalidExternalApprovals}_invalid_external_approvals`]
      : []),
    ...(externalCitationBlocked > 0
      ? [`${externalCitationBlocked}_external_citation_policy_blocked`]
      : []),
    ...(externalClaimEligible === 0 ? ['no_external_claim_eligible_records'] : []),
  ]
  const operational = summary.total > 0 && classificationConflicts === 0
  const reviewComplete = pendingReview === 0

  return {
    // `operational` is the runtime/service gate. `ok` remains the stricter
    // corpus-completion gate for callers that require the whole review queue
    // to be resolved. Neither field opens the independent external gate.
    operational,
    reviewComplete,
    ok: operational && reviewComplete,
    total: summary.total,
    processed,
    classificationPct: summary.total === 0 ? 0 : Math.round((processed / summary.total) * 100),
    finished: summary.finished,
    readinessPct: summary.total === 0 ? 0 : Math.round((summary.finished / summary.total) * 100),
    approvedForAi,
    pendingReview,
    pendingReviewHighRisk,
    pendingReviewStandard: pendingReview - pendingReviewHighRisk,
    safelyBlocked,
    classificationConflicts,
    humanReviewed,
    aiDraft,
    externalUsageContractAvailable,
    externalClaimEligible,
    invalidExternalApprovals,
    externalCitationBlocked,
    externalReady: externalBlockers.length === 0,
    externalBlockers,
    reviewRequired: summary.reviewRequired,
    blocked: summary.blocked,
    typeB: summary.typeB,
    typeC: summary.typeC,
    claimCandidates: summary.claimCandidates,
    missingText: summary.missingText,
    byStatus: countBy(records, record => record.status),
    byUsageRule: countBy(records, record => record.usageRule),
  }
}

export function toLibraryAnalysisBadge(record: LibraryAnalysisStatusRecord | null | undefined): LibraryAnalysisBadge | null {
  if (!record) return null

  return {
    status: record.status,
    usageRule: record.usageRule,
    reviewRequired: requiresLibraryReview(record),
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
    riskFlags: record.riskFlags,
    externalClaimEligible: isExternalClaimEligible(record),
  }
}

function requiresLibraryReview(record: LibraryAnalysisStatusRecord): boolean {
  return requiresLibraryAnalysisReview({
    ...record,
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
  })
}

// Tier-3 triage per the 2026-08-20 trust model: external candidates,
// actor-gated/person material and claim-bearing records require per-item
// review; the rest of the queue rides on sample-based calibration.
function isHighRiskReviewRecord(record: LibraryAnalysisStatusRecord): boolean {
  return record.usageRule === 'safe_for_external_claims' ||
    record.usageRule === 'requires_actor_gate' ||
    record.usageRule === 'claim_candidate_review' ||
    record.riskFlags.includes('type_b_actor_gate') ||
    claimCandidateCount(record.claimCandidates) > 0
}

function isTerminalClassification(record: LibraryAnalysisStatusRecord): boolean {
  return record.status === 'ai_draft' ||
    record.status === 'validated' ||
    record.status === 'approved_internal' ||
    record.status === 'blocked' ||
    record.status === 'superseded'
}

function hasClassificationConflict(record: LibraryAnalysisStatusRecord): boolean {
  const internallyApproved = record.status === 'approved_internal'
  const validated = record.status === 'validated'
  const blocked = record.status === 'blocked' || record.status === 'superseded'

  if (internallyApproved && record.usageRule !== 'safe_for_ai_context') return true
  if (validated && record.usageRule !== 'safe_for_ai_context' && !isExternalUsageRule(record.usageRule)) return true
  if (!internallyApproved && !validated && (
    record.usageRule === 'safe_for_ai_context' || isExternalUsageRule(record.usageRule)
  )) return true
  if (blocked && record.usageRule !== 'do_not_use_for_claims' && record.usageRule !== 'type_c_gap') return true
  return false
}

function hasNamedHumanReview(record: LibraryAnalysisStatusRecord): boolean {
  return Boolean(record.reviewedAt && record.reviewer?.trim())
}

function isExternalUsageRule(usageRule: string): boolean {
  return usageRule === 'safe_for_external_claims'
}

function isExternalApprovalEligible(record: LibraryAnalysisStatusRecord): boolean {
  return assessExternalApproval(record).eligible
}

function assessExternalApproval(record: LibraryAnalysisStatusRecord) {
  return assessLibraryAnalysisExternalApproval({
    ...record,
    claimCandidateCount: claimCandidateCount(record.claimCandidates),
  })
}

function isExternalClaimEligible(record: LibraryAnalysisStatusRecord): boolean {
  return isExternalApprovalEligible(record) && record.externalCitationEligible === true
}

export function hasExternalAnswerEligibleCitation(
  citations: CitationPolicyInput[],
): boolean {
  return citations.some(citation => assessCitationUse(citation, 'external').allowedForAnswer)
}

function isExternalCitationPolicyBlocker(blocker: string): boolean {
  return blocker === 'external_citation_policy_hash_missing_or_invalid' ||
    blocker === 'current_external_citation_policy_ineligible' ||
    blocker === 'external_citation_policy_hash_mismatch'
}

export async function getLibraryAnalysisStatus() {
  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    select: {
      sourceKind: true,
      sourceKey: true,
      documentId: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      reviewedAt: true,
      reviewer: true,
      citationReadiness: true,
      contentHash: true,
      aiCard: true,
      riskFlags: true,
      claimCandidates: true,
    },
  })
  const externalDocumentIds = [...new Set(records
    .filter(record => record.usageRule === 'safe_for_external_claims')
    .map(record => record.documentId)
    .filter((id): id is string => Boolean(id)))]
  const externalDocuments = externalDocumentIds.length === 0
    ? []
    : await prisma.document.findMany({
        where: { id: { in: externalDocumentIds } },
        select: {
          id: true,
          summary: true,
          content: true,
          sourceCitations: {
            select: {
              id: true,
              sourceClass: true,
              citationReadiness: true,
              verificationStatus: true,
              url: true,
              archivedUrl: true,
              accessedAt: true,
            },
          },
        },
      })
  const externalDocumentById = new Map(externalDocuments.map(document => (
    [document.id, document] as const
  )))

  const payload = buildLibraryAnalysisStatusPayload(records.map(record => {
    const document = record.documentId
      ? externalDocumentById.get(record.documentId)
      : undefined
    const externalCitationPolicy = assessLibraryAnalysisExternalCitationPolicy(
      document?.sourceCitations ?? [],
    )
    return {
      ...record,
      currentContentHash: document &&
        record.sourceKind === 'document' &&
        record.documentId === document.id &&
        record.sourceKey === `document:${document.id}`
        ? computeDocumentContentHash(document)
        : null,
      externalCitationEligible: Boolean(
        document &&
        record.sourceKind === 'document' &&
        record.documentId === document.id &&
        record.sourceKey === `document:${document.id}` &&
        externalCitationPolicy.policyHash,
      ),
      externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(record.aiCard),
      currentExternalCitationPolicyHash: externalCitationPolicy.policyHash,
    }
  }))
  let validationConfigs: unknown[] = []
  const automatedQueryErrors: string[] = []
  try {
    const validationRuns = await prisma.candidateAnalysisRun.findMany({
      where: { outputProfile: 'library_validation_v1' },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: { config: true },
    })
    validationConfigs = validationRuns.map(run => run.config)
  } catch {
    // Candidate tables may be intentionally absent before the migration is
    // applied. Keep the established library status available, but make the
    // automated-only subsection fail closed.
    automatedQueryErrors.push('candidate_validation_query_failed')
  }
  const automated = buildAutomatedLibraryAnalysisStatusFromRunConfigs({
    populationTotal: records.length,
    configs: validationConfigs,
    queryErrors: automatedQueryErrors,
  })
  // Calibration state is governed repository data (trust-model tier 2), not a
  // database readout; `not_yet_run` is a valid, honest state.
  return {
    ...payload,
    automated,
    calibration: libraryAnalysisCalibration,
  }
}

export async function getLibraryAnalysisRecords(opts?: {
  limit?: number
  status?: string
}): Promise<LibraryAnalysisRecordRow[]> {
  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    where: opts?.status ? { status: opts.status } : undefined,
    select: {
      id: true,
      sourceKind: true,
      sourceKey: true,
      documentId: true,
      title: true,
      canonicalPath: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      citationReadiness: true,
      aiSummary: true,
      keyFindings: true,
      projectImplications: true,
      riskFlags: true,
      claimCandidates: true,
      reviewedAt: true,
      reviewer: true,
      contentHash: true,
      aiCard: true,
      document: {
        select: {
          id: true,
          summary: true,
          content: true,
          sourceCitations: {
            select: {
              id: true,
              sourceClass: true,
              citationReadiness: true,
              verificationStatus: true,
              url: true,
              archivedUrl: true,
              accessedAt: true,
            },
          },
        },
      },
      wordCount: true,
      updatedAt: true,
    },
    orderBy: [
      { status: 'asc' },
      { usageRule: 'asc' },
      { title: 'asc' },
    ],
    take: opts?.limit ?? 200,
  })

  return records.map(record => {
    const {
      claimCandidates,
      reviewedAt,
      reviewer,
      contentHash,
      aiCard,
      documentId,
      document,
      ...publicRecord
    } = record
    const currentContentHash = document &&
      record.sourceKind === 'document' &&
      record.sourceKey === `document:${document.id}`
      ? computeDocumentContentHash(document)
      : undefined

    const externalCitationPolicy = assessLibraryAnalysisExternalCitationPolicy(
      document?.sourceCitations ?? [],
    )
    return {
      ...publicRecord,
      claimCandidateCount: claimCandidateCount(claimCandidates),
      externalClaimEligible: isExternalClaimEligible({
        status: record.status,
        sourceKind: record.sourceKind,
        sourceKey: record.sourceKey,
        documentId,
        usageRule: record.usageRule,
        reviewStatus: record.reviewStatus,
        reviewedAt,
        reviewer,
        citationReadiness: record.citationReadiness,
        contentHash,
        currentContentHash,
        externalCitationEligible: Boolean(
          document &&
          record.sourceKind === 'document' &&
          record.documentId === document.id &&
          record.sourceKey === `document:${document.id}` &&
          externalCitationPolicy.policyHash,
        ),
        externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(aiCard),
        currentExternalCitationPolicyHash: externalCitationPolicy.policyHash,
        riskFlags: record.riskFlags,
        claimCandidates,
      }),
    }
  })
}

export async function getLibraryAnalysisBadgesByDocumentIds(documentIds: string[]) {
  const ids = [...new Set(documentIds)].filter(Boolean)
  if (ids.length === 0) return new Map<string, LibraryAnalysisBadge>()

  const prisma = await getPrisma()
  const records = await prisma.libraryAnalysisRecord.findMany({
    where: {
      documentId: { in: ids },
      sourceKind: 'document',
      sourceKey: { in: ids.map(id => `document:${id}`) },
    },
    select: {
      documentId: true,
      sourceKey: true,
      sourceKind: true,
      status: true,
      usageRule: true,
      reviewStatus: true,
      reviewedAt: true,
      reviewer: true,
      citationReadiness: true,
      contentHash: true,
      aiCard: true,
      riskFlags: true,
      claimCandidates: true,
      document: {
        select: {
          id: true,
          summary: true,
          content: true,
          sourceCitations: {
            select: {
              id: true,
              sourceClass: true,
              citationReadiness: true,
              verificationStatus: true,
              url: true,
              archivedUrl: true,
              accessedAt: true,
            },
          },
        },
      },
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  })

  const badges = new Map<string, LibraryAnalysisBadge>()
  for (const record of records) {
    if (
      !record.documentId ||
      !record.document ||
      record.sourceKey !== `document:${record.documentId}` ||
      badges.has(record.documentId)
    ) continue
    const externalCitationPolicy = assessLibraryAnalysisExternalCitationPolicy(
      record.document.sourceCitations,
    )
    badges.set(record.documentId, toLibraryAnalysisBadge({
      ...record,
      documentId: record.documentId,
      currentContentHash: computeDocumentContentHash(record.document),
      externalCitationEligible: Boolean(externalCitationPolicy.policyHash),
      externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(record.aiCard),
      currentExternalCitationPolicyHash: externalCitationPolicy.policyHash,
    })!)
  }
  return badges
}

function claimCandidateCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function computeDocumentContentHash(document: { summary: string | null; content: string }): string {
  return computeLibraryContentHash(
    [document.summary, document.content].filter(Boolean).join('\n\n'),
  )
}

function countBy<T>(records: T[], keyFn: (record: T) => string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const record of records) {
    const key = keyFn(record)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }

  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

async function getPrisma() {
  return (await import('@/lib/db')).prisma
}
