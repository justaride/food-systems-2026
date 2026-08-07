import {
  assessLibraryAnalysisExternalApproval,
  validateLibraryAiCard,
  type LibraryAiCard,
} from './library-analysis'
import type { LibraryAnalysisInventoryRow } from './library-analysis-inventory'
import { readLibraryAnalysisExternalCitationPolicyHash } from './library-analysis-external-citations'

export type LibraryAnalysisUpsertPayload = {
  where: {
    sourceKind_sourceKey: {
      sourceKind: string
      sourceKey: string
    }
  }
  create: LibraryAnalysisMutationPayload
  update: LibraryAnalysisUpdatePayload
}

export type LibraryAnalysisUpdatePayload = Partial<LibraryAnalysisMutationPayload> & {
  reviewedAt?: Date | null
  reviewer?: string | null
}

export type LibraryAnalysisMutationPayload = {
  sourceKind: string
  sourceKey: string
  documentId: string | null
  sourceDocId: string | null
  canonicalPath: string | null
  title: string
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  analysisTier: string
  aiCard: LibraryAiCard
  aiSummary: string
  keyFindings: string[]
  claimCandidates: LibraryAiCard['claimCandidates']
  projectImplications: string[]
  gaps: LibraryAiCard['gaps']
  controlLinks: LibraryAiCard['controlLinks']
  riskFlags: string[]
  contentHash: string
  wordCount: number
  processedAt: Date
}

export type LibraryAnalysisRecordIdentity = {
  sourceKind: string
  sourceKey: string
}

export type ExistingLibraryAnalysisApproval = LibraryAnalysisRecordIdentity & {
  documentId: string | null
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  aiCard: unknown
  contentHash: string | null
  riskFlags: string[]
  claimCandidates: unknown
  reviewedAt: Date | string | null
  reviewer: string | null
}

export type ExistingLibraryAnalysisRecord = ExistingLibraryAnalysisApproval & {
  sourceDocId: string | null
  canonicalPath: string | null
  title: string
  analysisTier: string
  aiSummary: string | null
  keyFindings: string[]
  projectImplications: string[]
  gaps: unknown
  controlLinks: unknown
  wordCount: number
  updatedAt: Date | string
}

export type LibraryAnalysisApprovalReconciliation = {
  payload: LibraryAnalysisUpsertPayload
  approvalAction: 'none' | 'preserved' | 'revoked'
  reasons: string[]
}

export type LibraryAnalysisSyncClassification =
  | 'create'
  | 'material_update'
  | 'noop'
  | 'stale'

export type LibraryAnalysisSyncPlanItem = {
  classification: LibraryAnalysisSyncClassification
  key: string
  identity: LibraryAnalysisRecordIdentity
  row: LibraryAnalysisInventoryRow | null
  existing: ExistingLibraryAnalysisRecord | null
  changedFields: string[]
  approvalAction: LibraryAnalysisApprovalReconciliation['approvalAction']
  approvalReasons: string[]
  expectedSnapshot: LibraryAnalysisCasSnapshot | null
}

export type LibraryAnalysisCasSnapshot = LibraryAnalysisRecordIdentity & {
  updatedAt: string
  documentId: string | null
  sourceDocId: string | null
  canonicalPath: string | null
  title: string
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  contentHash: string | null
  wordCount: number
  reviewedAt: string | null
  reviewer: string | null
}

export type LibraryAnalysisCasWhere = Omit<LibraryAnalysisCasSnapshot, 'updatedAt' | 'reviewedAt'> & {
  updatedAt: Date
  reviewedAt: Date | null
}

export type LibraryAnalysisSyncPlan = {
  actions: LibraryAnalysisSyncPlanItem[]
  counts: Record<LibraryAnalysisSyncClassification, number>
  keys: Record<LibraryAnalysisSyncClassification, string[]>
  stalePolicy: 'retain'
}

export type LibraryAnalysisLedgerLiveParity = {
  failures: string[]
  ledgerKeys: string[]
  liveInventoryKeys: string[]
}

export type LibraryAnalysisLiveLedgerPartition<T extends LibraryAnalysisRecordIdentity> = {
  liveRecords: T[]
  staleRetainedRecords: T[]
}

export function findStaleLibraryAnalysisRecordIdentities(
  currentRows: LibraryAnalysisInventoryRow[],
  existingRecords: LibraryAnalysisRecordIdentity[],
): LibraryAnalysisRecordIdentity[] {
  const currentKeys = new Set(currentRows.map(row => libraryAnalysisIdentityKey(row)))
  return existingRecords
    .filter(record => !currentKeys.has(libraryAnalysisIdentityKey(record)))
    .sort((a, b) => libraryAnalysisIdentityKey(a).localeCompare(libraryAnalysisIdentityKey(b)))
}

export function partitionLibraryAnalysisRecordsForLiveLedger<
  T extends LibraryAnalysisRecordIdentity,
>(
  currentRows: LibraryAnalysisRecordIdentity[],
  existingRecords: T[],
): LibraryAnalysisLiveLedgerPartition<T> {
  const currentKeys = new Set(currentRows.map(row => libraryAnalysisIdentityKey(row)))
  const liveRecords: T[] = []
  const staleRetainedRecords: T[] = []

  for (const record of existingRecords) {
    if (currentKeys.has(libraryAnalysisIdentityKey(record))) {
      liveRecords.push(record)
    } else {
      staleRetainedRecords.push(record)
    }
  }

  return { liveRecords, staleRetainedRecords }
}

export function buildDraftLibraryAiCard(row: LibraryAnalysisInventoryRow): LibraryAiCard {
  const card: LibraryAiCard = {
    shortSummary: `${row.title} er triagert som ${row.sourceKind} med ${row.wordCount} ord i lokalt grunnlag.`,
    keyFindings: buildKeyFindings(row),
    claimCandidates: [],
    projectImplication: buildProjectImplication(row),
    gaps: row.classification.reasons.map(reason => ({
      kind: gapKindFromReason(reason),
      note: reason,
    })),
    citationStatus: row.citationReadiness ?? 'not_citation_checked',
    recommendedUsageRule: row.classification.usageRule,
    status: row.classification.status,
    controlLinks: buildControlLinks(row),
    riskFlags: [...row.riskFlags, ...row.classification.reasons].filter((value, index, values) => values.indexOf(value) === index),
  }

  const validation = validateLibraryAiCard(card)
  if (!validation.ok) {
    throw new Error(`Invalid library AI card for ${row.sourceKey}: ${validation.issues.join(', ')}`)
  }

  return card
}

export function libraryAnalysisIdentityKey(identity: LibraryAnalysisRecordIdentity): string {
  return `${identity.sourceKind}:${identity.sourceKey}`
}

export function toLibraryAnalysisUpsertPayload(
  row: LibraryAnalysisInventoryRow,
  options?: { processedAt?: Date },
): LibraryAnalysisUpsertPayload {
  const card = buildDraftLibraryAiCard(row)
  const payload: LibraryAnalysisMutationPayload = {
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.linkedDocumentId,
    sourceDocId: row.linkedSourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.classification.status,
    usageRule: row.classification.usageRule,
    reviewStatus: row.classification.reviewRequired ? 'queued' : 'not_required',
    citationReadiness: row.citationReadiness,
    analysisTier: 'triage_card',
    aiCard: card,
    aiSummary: card.shortSummary,
    keyFindings: card.keyFindings,
    claimCandidates: card.claimCandidates,
    projectImplications: [card.projectImplication],
    gaps: card.gaps,
    controlLinks: card.controlLinks,
    riskFlags: card.riskFlags,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: options?.processedAt ?? new Date(),
  }

  return {
    where: {
      sourceKind_sourceKey: {
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
      },
    },
    create: payload,
    update: payload,
  }
}

export function reconcileLibraryAnalysisUpsertPayload(
  row: LibraryAnalysisInventoryRow,
  existing?: ExistingLibraryAnalysisApproval,
  options?: { processedAt?: Date },
): LibraryAnalysisApprovalReconciliation {
  const payload = toLibraryAnalysisUpsertPayload(row, options)
  if (!existing || (
    existing.usageRule !== 'safe_for_external_claims' &&
    existing.reviewStatus !== 'approved'
  )) {
    return { payload, approvalAction: 'none', reasons: [] }
  }

  const existingClaimCandidateCount = Array.isArray(existing.claimCandidates)
    ? existing.claimCandidates.length
    : 0
  const approval = assessLibraryAnalysisExternalApproval({
    ...existing,
    sourceKind: existing.sourceKind,
    sourceKey: existing.sourceKey,
    currentContentHash: row.contentHash,
    externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(existing.aiCard),
    currentExternalCitationPolicyHash: row.currentExternalCitationPolicyHash,
    claimCandidateCount: existingClaimCandidateCount,
  })
  const incomingReasons = [
    ...(row.sourceKind !== 'document' ? ['incoming_source_kind_not_document'] : []),
    ...(row.linkedDocumentId === null || row.sourceKey !== `document:${row.linkedDocumentId}`
      ? ['incoming_source_binding_invalid']
      : []),
    ...(row.citationReadiness !== 'citable_external'
      ? ['incoming_citation_not_citable_external']
      : []),
    ...(row.riskFlags.length > 0 ? ['incoming_risk_flags_present'] : []),
    ...(row.claimCandidateCount > 0 ? ['incoming_claim_candidates_present'] : []),
  ]

  if (approval.eligible && incomingReasons.length === 0) {
    return {
      payload: {
        ...payload,
        update: {
          sourceKind: row.sourceKind,
          sourceKey: row.sourceKey,
          documentId: row.linkedDocumentId,
          sourceDocId: row.linkedSourceDocId,
          canonicalPath: row.canonicalPath,
          title: row.title,
          wordCount: row.wordCount,
          processedAt: options?.processedAt ?? new Date(),
        },
      },
      approvalAction: 'preserved',
      reasons: [],
    }
  }

  return {
    payload: {
      ...payload,
      update: {
        ...payload.update,
        reviewStatus: 'queued',
        reviewedAt: null,
        reviewer: null,
      },
    },
    approvalAction: 'revoked',
    reasons: [...approval.blockers, ...incomingReasons],
  }
}

export function buildLibraryAnalysisSyncPlan(
  currentRows: LibraryAnalysisInventoryRow[],
  existingRecords: ExistingLibraryAnalysisRecord[],
): LibraryAnalysisSyncPlan {
  const currentByKey = uniqueByIdentity(currentRows, 'live inventory')
  const existingByKey = uniqueByIdentity(existingRecords, 'existing records')
  const keys = [...new Set([...currentByKey.keys(), ...existingByKey.keys()])].sort()
  const actions: LibraryAnalysisSyncPlanItem[] = []

  for (const key of keys) {
    const row = currentByKey.get(key) ?? null
    const existing = existingByKey.get(key) ?? null
    if (!row) {
      actions.push({
        classification: 'stale',
        key,
        identity: existing!,
        row: null,
        existing,
        changedFields: [],
        approvalAction: 'none',
        approvalReasons: [],
        expectedSnapshot: toLibraryAnalysisCasSnapshot(existing!),
      })
      continue
    }

    const reconciliation = reconcileLibraryAnalysisUpsertPayload(
      row,
      existing ?? undefined,
      { processedAt: new Date(0) },
    )
    if (!existing) {
      actions.push({
        classification: 'create',
        key,
        identity: row,
        row,
        existing: null,
        changedFields: [],
        approvalAction: reconciliation.approvalAction,
        approvalReasons: reconciliation.reasons,
        expectedSnapshot: null,
      })
      continue
    }

    const changedFields = changedMaterialFields(existing, reconciliation.payload.update)
    actions.push({
      classification: changedFields.length > 0 ? 'material_update' : 'noop',
      key,
      identity: row,
      row,
      existing,
      changedFields,
      approvalAction: reconciliation.approvalAction,
      approvalReasons: reconciliation.reasons,
      expectedSnapshot: toLibraryAnalysisCasSnapshot(existing),
    })
  }

  const classifications: LibraryAnalysisSyncClassification[] = [
    'create',
    'material_update',
    'noop',
    'stale',
  ]
  const counts = Object.fromEntries(classifications.map(classification => [
    classification,
    actions.filter(action => action.classification === classification).length,
  ])) as Record<LibraryAnalysisSyncClassification, number>
  const planKeys = Object.fromEntries(classifications.map(classification => [
    classification,
    actions
      .filter(action => action.classification === classification)
      .map(action => action.key),
  ])) as Record<LibraryAnalysisSyncClassification, string[]>

  return {
    actions,
    counts,
    keys: planKeys,
    stalePolicy: 'retain',
  }
}

export function toLibraryAnalysisCasSnapshot(
  existing: ExistingLibraryAnalysisRecord,
): LibraryAnalysisCasSnapshot {
  return {
    sourceKind: existing.sourceKind,
    sourceKey: existing.sourceKey,
    updatedAt: requiredIsoDate(existing.updatedAt, 'updatedAt'),
    documentId: existing.documentId,
    sourceDocId: existing.sourceDocId,
    canonicalPath: existing.canonicalPath,
    title: existing.title,
    status: existing.status,
    usageRule: existing.usageRule,
    reviewStatus: existing.reviewStatus,
    citationReadiness: existing.citationReadiness,
    contentHash: existing.contentHash,
    wordCount: existing.wordCount,
    reviewedAt: existing.reviewedAt === null
      ? null
      : requiredIsoDate(existing.reviewedAt, 'reviewedAt'),
    reviewer: existing.reviewer,
  }
}

export function toLibraryAnalysisCasWhere(
  snapshot: LibraryAnalysisCasSnapshot,
): LibraryAnalysisCasWhere {
  return {
    ...snapshot,
    updatedAt: new Date(snapshot.updatedAt),
    reviewedAt: snapshot.reviewedAt ? new Date(snapshot.reviewedAt) : null,
  }
}

export function auditLibraryAnalysisLedgerLiveParity(
  ledgerContent: string,
  liveInventory: LibraryAnalysisInventoryRow[],
): LibraryAnalysisLedgerLiveParity {
  const failures: string[] = []
  const ledgerByKey = new Map<string, string>()

  for (const [index, line] of ledgerContent.split('\n').filter(Boolean).entries()) {
    const lineNumber = index + 1
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch {
      failures.push(`ledger line ${lineNumber}: invalid JSON for live parity`)
      continue
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      failures.push(`ledger line ${lineNumber}: row must be an object for live parity`)
      continue
    }
    const row = parsed as Record<string, unknown>
    const sourceKind = typeof row.sourceKind === 'string' ? row.sourceKind : ''
    const sourceKey = typeof row.sourceKey === 'string' ? row.sourceKey : ''
    const contentHash = typeof row.contentHash === 'string' ? row.contentHash : ''
    if (!sourceKind || !sourceKey) {
      failures.push(`ledger line ${lineNumber}: missing identity for live parity`)
      continue
    }
    const key = libraryAnalysisIdentityKey({ sourceKind, sourceKey })
    if (ledgerByKey.has(key)) {
      failures.push(`ledger/live-inventory duplicate key: ${key}`)
      continue
    }
    ledgerByKey.set(key, contentHash)
  }

  const liveByKey = uniqueByIdentity(liveInventory, 'live inventory')
  const ledgerKeys = [...ledgerByKey.keys()].sort()
  const liveInventoryKeys = [...liveByKey.keys()].sort()

  for (const key of liveInventoryKeys) {
    const liveRow = liveByKey.get(key)!
    if (!ledgerByKey.has(key)) {
      failures.push(`ledger/live-inventory key mismatch: missing ledger key ${key}`)
      continue
    }
    if (ledgerByKey.get(key) !== liveRow.contentHash) {
      failures.push(`ledger/live-inventory contentHash mismatch: ${key}`)
    }
  }
  for (const key of ledgerKeys) {
    if (!liveByKey.has(key)) {
      failures.push(`ledger/live-inventory key mismatch: stale ledger key ${key}`)
    }
  }

  return { failures, ledgerKeys, liveInventoryKeys }
}

function uniqueByIdentity<T extends LibraryAnalysisRecordIdentity>(
  rows: T[],
  label: string,
): Map<string, T> {
  const result = new Map<string, T>()
  for (const row of rows) {
    const key = libraryAnalysisIdentityKey(row)
    if (result.has(key)) throw new Error(`${label} contains duplicate key ${key}`)
    result.set(key, row)
  }
  return result
}

function changedMaterialFields(
  existing: ExistingLibraryAnalysisRecord,
  update: LibraryAnalysisUpdatePayload,
): string[] {
  return Object.entries(update)
    .filter(([field]) => field !== 'processedAt')
    .filter(([field, value]) => !materialValuesEqual(existing[field as keyof ExistingLibraryAnalysisRecord], value))
    .map(([field]) => field)
    .sort()
}

function materialValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(normalizeMaterialValue(left)) === JSON.stringify(normalizeMaterialValue(right))
}

function normalizeMaterialValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(normalizeMaterialValue)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, normalizeMaterialValue(nested)]),
    )
  }
  return value
}

function requiredIsoDate(value: Date | string, field: string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`existing library analysis ${field} is not a valid timestamp`)
  }
  return date.toISOString()
}

function buildKeyFindings(row: LibraryAnalysisInventoryRow): string[] {
  if (row.classification.reasons.length > 0) {
    return row.classification.reasons.map(reason => `Triage flag: ${reason}`)
  }

  return [
    'Kilden er klar for intern AI-kontekst etter eksisterende claim/citation-gater.',
  ]
}

function buildProjectImplication(row: LibraryAnalysisInventoryRow): string {
  if (row.classification.usageRule === 'claim_candidate_review') {
    return 'Mulige claims maa rutes via PCQ/claim-lock og eksisterende overclaim/citable-gater.'
  }
  if (row.classification.usageRule === 'requires_actor_gate') {
    return 'Type-B hull krever aktoravklaring for videre prosjektbruk.'
  }
  if (row.classification.usageRule === 'type_c_gap') {
    return 'Type-C hull skal markeres som ikke-lukkbart med desk research alene.'
  }
  if (row.classification.usageRule === 'do_not_use_for_claims') {
    return 'Kilden kan beholdes sokbar, men skal ikke brukes som claim-grunnlag.'
  }
  if (row.classification.usageRule === 'safe_for_ai_context') {
    return 'Kilden kan brukes som intern AI-kontekst, men ikke som ekstern claim uten ordinær gate.'
  }

  return 'Kilden kan brukes som intern bakgrunn etter review av status og lokator.'
}

function buildControlLinks(row: LibraryAnalysisInventoryRow): LibraryAiCard['controlLinks'] {
  const links: LibraryAiCard['controlLinks'] = []
  if (row.linkedDocumentId) {
    links.push({ label: 'Bibliotek', href: `/bibliotek/${row.linkedDocumentId}` })
  }
  if (row.linkedSourceDocId) {
    links.push({ label: 'Kilde', href: `/kilder#${row.linkedSourceDocId}` })
  }
  if (row.canonicalPath) {
    links.push({ label: 'Repo', href: `/${row.canonicalPath}` })
  }
  if (links.length === 0) {
    links.push({ label: 'AI-kunnskap', href: '/ai-kunnskap' })
  }
  return links
}

function gapKindFromReason(reason: string): LibraryAiCard['gaps'][number]['kind'] {
  if (reason === 'type_b_actor_gate') return 'type_b_actor_gate'
  if (reason === 'type_c_not_desk_research') return 'type_c_not_desk_research'
  if (reason === 'missing_text' || reason === 'low_text_quality') return 'needs_text_extraction'
  if (reason === 'orphan_source' || reason === 'missing_file_path') return 'unclear_source'
  return 'unclear_source'
}
