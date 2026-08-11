import { createHash } from 'node:crypto'

export const SYNTHETIC_MATSVINNLOVEN_THESIS_ID = 'matsvinnloven-2025' as const
export const SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID = 'cmppas6oi00003evmux65v0s6' as const
export const SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID = 'cmqjoewzd00vbzpvmkzfba3bw' as const
export const OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID = 'src-lov-2025-06-20-103' as const
export const OFFICIAL_MATSVINNLOVEN_URL = 'https://lovdata.no/dokument/NL/lov/2025-06-20-103' as const
export const MATSVINNLOVEN_QUARANTINE_FILE = 'research/thesis-matsvinnloven-2025.md' as const
export const CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY = 78 as const
export const CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY = 200 as const
export const CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY = 139 as const
export const CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY = 417 as const
export const MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE =
  'canonical-local-db-snapshot-2026-07-19' as const
export const MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION =
  'quarantine-synthetic-matsvinnloven-thesis-identity' as const

// These pins are filled from one reviewed database snapshot and the checked-in
// seed/tombstone artifacts. Any drift must produce a new dry run and review.
export const PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256 =
  '494c96c4e5e997c4dfbbd8e208c1ab116165ec232b32fac19543c218ec2e3795'
export const PINNED_MATSVINNLOVEN_SOURCE_SEEDED_SNAPSHOT_SHA256 =
  'b1e6b0e2b486fced01b8656d1010db1d8bc1f7679bfd168a13f4439ca99600e6'
export const PINNED_MATSVINNLOVEN_SOURCE_TARGET_SHA256 =
  '1d5bd1aaf9cc527091e8ad57f92546a69c4fb70100d2792f35001f82e3ed8e7f'
export const PINNED_MATSVINNLOVEN_QUARANTINE_FILE_SHA256 =
  'e3635b63b78c4e97d6b1281482af243d89100728105f48dbaca26fa439605280'
export const PINNED_MATSVINNLOVEN_IDENTITY_CONTRACT_SHA256 =
  '59ec7679986028ef27ad595a7d2fb644996ad49c97f9e8433a4f22ab191c9fed'

export const MATSVINNLOVEN_QUARANTINE_TITLE =
  'Karantene: syntetisk oppgaveplassholder matsvinnloven-2025'
export const MATSVINNLOVEN_QUARANTINE_SUMMARY =
  'Blokkert historisk plassholder. Ingen verifiserbar oppgave finnes, og raden kan ikke brukes som akademisk eller ekstern kilde.'

export const MATSVINNLOVEN_QUARANTINE_RISK_FLAGS = [
  'synthetic_identity',
  'wrong_work_type',
  'wrong_lovdata_locator',
  'not_citable',
] as const

export type MatsvinnlovenThesisRow = {
  id: string
  authors: string
  institution: string
  year: number
  title: string
  titleNo: string | null
  url: string
  synthesis: string
  keyFindings: string[]
  tags: string[]
  takeaways: string[]
  method: string | null
  awardWinning: boolean
  degree: string
  doi: string | null
  isbn: string | null
  publisher: string | null
  accessDate: string | null
  documentId: string | null
}

export type MatsvinnlovenDocumentRow = {
  id: string
  slug: string
  filePath: string | null
  title: string
  author: string | null
  year: number | null
  documentType: string | null
  category: string | null
  subcategory: string | null
  country: string | null
  content: string
  summary: string | null
  url: string | null
  accessedAt: Date | string | null
  archivedUrl: string | null
  wordCount: number
  tags: string[]
  metadata: unknown
  createdAt: Date | string
  updatedAt: Date | string
}

export type MatsvinnlovenLibraryRow = {
  id: string
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
  aiCard: unknown
  aiSummary: string | null
  keyFindings: string[]
  claimCandidates: unknown
  projectImplications: string[]
  gaps: unknown
  controlLinks: unknown
  riskFlags: string[]
  contentHash: string | null
  wordCount: number
  processedAt: Date | string | null
  reviewedAt: Date | string | null
  reviewer: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type MatsvinnlovenSourceDocRow = {
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

export type MatsvinnlovenSourceSeed = {
  id: string
  filename: string
  title?: string | null
  author?: string | null
  year?: string | number | null
  type: string
  description: string
  relevance: string
  url?: string | null
  isDuplicate?: boolean
  doi?: string | null
  publisher?: string | null
  provenanceType?: string | null
  accessedAt?: Date | string | null
  archivedUrl?: string | null
}

export type MatsvinnlovenDependencyRow = { id: string }

export type MatsvinnlovenIdentitySnapshot = {
  theses: MatsvinnlovenThesisRow[]
  documents: MatsvinnlovenDocumentRow[]
  libraryAnalysisRecords: MatsvinnlovenLibraryRow[]
  sourceDocCandidates: MatsvinnlovenSourceDocRow[]
  corpusCounts: {
    theses: number
    sourceDocs: number
    reports: number
    totalEvidence: number
  }
  dependencies: {
    documentRefsFrom: MatsvinnlovenDependencyRow[]
    documentRefsTo: MatsvinnlovenDependencyRow[]
    reportBindings: MatsvinnlovenDependencyRow[]
    insightDocumentRefs: MatsvinnlovenDependencyRow[]
    companyDocumentRefs: MatsvinnlovenDependencyRow[]
    actorDocumentRefs: MatsvinnlovenDependencyRow[]
    quarantineSourceCitations: MatsvinnlovenDependencyRow[]
    quarantineFieldCitations: MatsvinnlovenDependencyRow[]
    quarantineEvidenceAppraisals: MatsvinnlovenDependencyRow[]
    officialSourceCitations: MatsvinnlovenDependencyRow[]
    officialFieldCitations: MatsvinnlovenDependencyRow[]
    officialEvidenceAppraisals: MatsvinnlovenDependencyRow[]
    officialLibraryAnalysisRecords: MatsvinnlovenDependencyRow[]
    sourceRefs: MatsvinnlovenDependencyRow[]
    insightSourceLinks: MatsvinnlovenDependencyRow[]
    mediaEntries: MatsvinnlovenDependencyRow[]
  }
}

export type MatsvinnlovenDocumentTarget = Omit<
  MatsvinnlovenDocumentRow,
  'createdAt' | 'updatedAt' | 'accessedAt'
> & { accessedAt: string | null }

export type MatsvinnlovenLibraryTarget = Omit<
  MatsvinnlovenLibraryRow,
  'createdAt' | 'updatedAt' | 'processedAt' | 'reviewedAt'
> & {
  processedAt: string | null
  reviewedAt: string | null
}

export type MatsvinnlovenIdentityConflict = {
  code:
    | 'snapshot_shape_invalid'
    | 'before_snapshot_drift'
    | 'mixed_or_partial_state'
    | 'dependency_present'
    | 'after_state_drift'
  detail: string
}

export type MatsvinnlovenIdentityMigrationPlan = {
  version: 1
  contractScope: typeof MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE
  state: 'pending' | 'already_applied' | 'conflict'
  pendingState: 'source_absent' | 'source_seeded' | null
  beforeSnapshotSha256: string
  pinnedBeforeSnapshotSha256: string
  sourceTargetSha256: string
  quarantineFileSha256: string
  documentTargetSha256: string | null
  libraryTargetSha256: string | null
  officialDependencyStateSha256: string
  sourceTarget: MatsvinnlovenSourceDocRow
  documentTarget: MatsvinnlovenDocumentTarget | null
  libraryTarget: MatsvinnlovenLibraryTarget | null
  conflicts: MatsvinnlovenIdentityConflict[]
  summary: {
    thesisDeletes: 0 | 1
    sourceDocCreates: 0 | 1
    documentQuarantines: 0 | 1
    libraryBlocks: 0 | 1
    citationCreates: 0
    appraisalCreates: 0
    sourceDocumentLinks: 0
  }
}

export type MatsvinnlovenAcademicIdentityCounts = {
  reports: number
  theses: number
  sourceDocs: number
  totalEvidence: number
}

export type MatsvinnlovenReleaseEvidence = {
  backupSha256: string
  backupBytes: number
  backupMetadataSha256: string
  restoreReceiptSha256: string
  databaseIdentityUuid: string
  completedMigrationCount: number
  completedMigrationLedgerSha256: string
  targetFingerprintSha256: string
  backupCreatedAtUtc: string
  restoreCompletedAtUtc: string
}

export type MatsvinnlovenOperatorAuthority = {
  operatorId: string
  authorizationRef: string
  databaseRole: string
}

export type MatsvinnlovenControlledMutationAuditInput = {
  operationKey: string
  contractScope: typeof MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE
  contractSha256: string
  planSha256: string
  beforeSnapshotSha256: string
  afterSnapshotSha256: string
  dependencyStateSha256: string
  databaseIdentityUuid: string
  targetFingerprintSha256: string
  backupSha256: string
  backupMetadataSha256: string
  restoreReceiptSha256: string
  operatorId: string
  authorizationRef: string
  databaseRole: string
  mutationSummary: Record<string, unknown>
}

export type MatsvinnlovenAlreadyAppliedAuditClassification =
  | { state: 'receipted_noop'; operationKey: string }
  | { state: 'unreceipted_after_state'; conflicts: string[] }

const SHA256_PATTERN = /^[0-9a-f]{64}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function requiredSafeControlText(value: unknown, field: string) {
  if (
    typeof value !== 'string' || !value.trim() || value !== value.trim() ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new Error(`${field} must be non-empty, trimmed text without control characters`)
  }
  return value
}

function requiredSha256(value: unknown, field: string) {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) {
    throw new Error(`${field} must be an exact lowercase SHA-256`)
  }
  return value
}

function requiredUuid(value: unknown, field: string) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) {
    throw new Error(`${field} must be an exact UUID`)
  }
  return value.toLowerCase()
}

export function matsvinnlovenIdentityContractManifest() {
  return {
    version: 1,
    contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
    operation: MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION,
    destructiveBoundary: {
      deleteThesisId: SYNTHETIC_MATSVINNLOVEN_THESIS_ID,
      quarantineDocumentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
      blockLibraryAnalysisRecordId: SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID,
      officialSourceDocId: OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
    },
    pinnedInputs: {
      beforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
      sourceSeededSnapshotSha256: PINNED_MATSVINNLOVEN_SOURCE_SEEDED_SNAPSHOT_SHA256,
      sourceTargetSha256: PINNED_MATSVINNLOVEN_SOURCE_TARGET_SHA256,
      quarantineFileSha256: PINNED_MATSVINNLOVEN_QUARANTINE_FILE_SHA256,
    },
    canonicalPostCounts: {
      reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
      theses: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
      sourceDocs: CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
      totalEvidence: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
    },
    mutationPolicy: {
      citationCreates: 0,
      appraisalCreates: 0,
      sourceDocumentLinks: 0,
      quarantineDependenciesRequired: 0,
      transactionIsolation: 'Serializable',
    },
    releaseEvidence: {
      backupMetadataVersion: 2,
      restoreReceiptVersion: 1,
      databaseIdentityKey: 'primary',
      targetFingerprintCanonicalJsonFormat: 'sorted-keys-v1',
    },
    audit: {
      model: 'ControlledMutationAudit',
      appendOnly: true,
      atomicWithMutation: true,
      requiredBindings: [
        'beforeSnapshotSha256',
        'afterSnapshotSha256',
        'dependencyStateSha256',
        'backupSha256',
        'backupMetadataSha256',
        'restoreReceiptSha256',
        'operationKey',
      ],
    },
  }
}

export function matsvinnlovenIdentityContractSha256() {
  const observed = sha256MatsvinnlovenJson(matsvinnlovenIdentityContractManifest())
  if (observed !== PINNED_MATSVINNLOVEN_IDENTITY_CONTRACT_SHA256) {
    throw new Error(
      `Matsvinnloven identity contract drifted: observed ${observed}; ` +
      `expected ${PINNED_MATSVINNLOVEN_IDENTITY_CONTRACT_SHA256}`,
    )
  }
  return observed
}

export function matsvinnlovenIdentityPlanSha256(plan: MatsvinnlovenIdentityMigrationPlan) {
  return sha256MatsvinnlovenJson(matsvinnlovenIdentityMigrationPlanContract(plan))
}

export function matsvinnlovenTargetFingerprintSha256(input: {
  completedPrismaMigrationLedger: { completedCount: number; sha256: string }
  coreCounts: Record<string, number>
  databaseIdentity: { key: 'primary'; uuid: string }
}) {
  if (!Number.isSafeInteger(input.completedPrismaMigrationLedger.completedCount) ||
      input.completedPrismaMigrationLedger.completedCount <= 0) {
    throw new Error('completed migration count must be a positive safe integer')
  }
  requiredSha256(input.completedPrismaMigrationLedger.sha256, 'completed migration ledger SHA-256')
  requiredUuid(input.databaseIdentity.uuid, 'primary DatabaseIdentity UUID')
  if (input.databaseIdentity.key !== 'primary') throw new Error('DatabaseIdentity key must be primary')
  for (const [key, value] of Object.entries(input.coreCounts)) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`core count ${key} is invalid`)
  }
  return sha256MatsvinnlovenJson(input)
}

export function validateMatsvinnlovenReleaseEvidence(
  evidence: MatsvinnlovenReleaseEvidence,
): MatsvinnlovenReleaseEvidence {
  requiredSha256(evidence.backupSha256, 'backup SHA-256')
  requiredSha256(evidence.backupMetadataSha256, 'backup metadata SHA-256')
  requiredSha256(evidence.restoreReceiptSha256, 'restore receipt SHA-256')
  requiredSha256(evidence.completedMigrationLedgerSha256, 'completed migration ledger SHA-256')
  requiredSha256(evidence.targetFingerprintSha256, 'target fingerprint SHA-256')
  requiredUuid(evidence.databaseIdentityUuid, 'primary DatabaseIdentity UUID')
  if (!Number.isSafeInteger(evidence.backupBytes) || evidence.backupBytes <= 0) {
    throw new Error('backup byte count must be a positive safe integer')
  }
  if (!Number.isSafeInteger(evidence.completedMigrationCount) || evidence.completedMigrationCount <= 0) {
    throw new Error('completed migration count must be a positive safe integer')
  }
  for (const [field, value] of [
    ['backupCreatedAtUtc', evidence.backupCreatedAtUtc],
    ['restoreCompletedAtUtc', evidence.restoreCompletedAtUtc],
  ] as const) {
    const parsed = new Date(value)
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || Number.isNaN(parsed.valueOf())) {
      throw new Error(`${field} must be a UTC ISO-8601 timestamp`)
    }
  }
  return { ...evidence, databaseIdentityUuid: evidence.databaseIdentityUuid.toLowerCase() }
}

export function validateMatsvinnlovenOperatorAuthority(
  authority: MatsvinnlovenOperatorAuthority,
): MatsvinnlovenOperatorAuthority {
  const operatorId = requiredSafeControlText(authority.operatorId, 'operatorId')
  const authorizationRef = requiredSafeControlText(authority.authorizationRef, 'authorizationRef')
  const databaseRole = requiredSafeControlText(authority.databaseRole, 'databaseRole')
  const normalizedRole = databaseRole.toLowerCase()
  if (
    normalizedRole.includes('mcp') ||
    normalizedRole.includes('readonly') ||
    normalizedRole.includes('read_only') ||
    normalizedRole.includes('read-only') ||
    /(?:^|[_-])ro(?:$|[_-])/.test(normalizedRole)
  ) {
    throw new Error('databaseRole must not be an MCP or read-only role')
  }
  return { operatorId, authorizationRef, databaseRole }
}

export function matsvinnlovenControlledMutationOperationKey(input: {
  contractSha256: string
  planSha256: string
  databaseIdentityUuid: string
  beforeSnapshotSha256: string
}) {
  const digest = sha256MatsvinnlovenJson({
    operation: MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION,
    contractSha256: requiredSha256(input.contractSha256, 'contract SHA-256'),
    planSha256: requiredSha256(input.planSha256, 'plan SHA-256'),
    databaseIdentityUuid: requiredUuid(input.databaseIdentityUuid, 'primary DatabaseIdentity UUID'),
    beforeSnapshotSha256: requiredSha256(input.beforeSnapshotSha256, 'before snapshot SHA-256'),
  })
  return `${MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION}:${digest}`
}

export function buildMatsvinnlovenControlledMutationAudit(input: {
  pendingPlan: MatsvinnlovenIdentityMigrationPlan
  afterPlan: MatsvinnlovenIdentityMigrationPlan
  contractSha256: string
  planSha256: string
  releaseEvidence: MatsvinnlovenReleaseEvidence
  authority: MatsvinnlovenOperatorAuthority
}): MatsvinnlovenControlledMutationAuditInput {
  if (input.pendingPlan.state !== 'pending') throw new Error('audit requires an exact pending plan')
  if (input.afterPlan.state !== 'already_applied') throw new Error('audit requires an exact verified after state')
  if (input.pendingPlan.officialDependencyStateSha256 !== input.afterPlan.officialDependencyStateSha256) {
    throw new Error('official dependency state changed during the controlled mutation')
  }
  const expectedContractSha256 = matsvinnlovenIdentityContractSha256()
  if (input.contractSha256 !== expectedContractSha256) throw new Error('contract SHA-256 differs from the exact current contract')
  const expectedPlanSha256 = matsvinnlovenIdentityPlanSha256(input.pendingPlan)
  if (input.planSha256 !== expectedPlanSha256) throw new Error('plan SHA-256 differs from the exact pending plan')
  if (input.afterPlan.conflicts.length > 0) throw new Error('audit cannot bind a conflicting after state')
  const releaseEvidence = validateMatsvinnlovenReleaseEvidence(input.releaseEvidence)
  const authority = validateMatsvinnlovenOperatorAuthority(input.authority)
  const operationKey = matsvinnlovenControlledMutationOperationKey({
    contractSha256: input.contractSha256,
    planSha256: input.planSha256,
    databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
    beforeSnapshotSha256: input.pendingPlan.beforeSnapshotSha256,
  })
  return {
    operationKey,
    contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
    contractSha256: input.contractSha256,
    planSha256: input.planSha256,
    beforeSnapshotSha256: input.pendingPlan.beforeSnapshotSha256,
    afterSnapshotSha256: input.afterPlan.beforeSnapshotSha256,
    dependencyStateSha256: input.pendingPlan.officialDependencyStateSha256,
    databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
    targetFingerprintSha256: releaseEvidence.targetFingerprintSha256,
    backupSha256: releaseEvidence.backupSha256,
    backupMetadataSha256: releaseEvidence.backupMetadataSha256,
    restoreReceiptSha256: releaseEvidence.restoreReceiptSha256,
    operatorId: authority.operatorId,
    authorizationRef: authority.authorizationRef,
    databaseRole: authority.databaseRole,
    mutationSummary: {
      operation: MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION,
      pendingState: input.pendingPlan.pendingState,
      rows: input.pendingPlan.summary,
      sourceTargetSha256: input.pendingPlan.sourceTargetSha256,
      documentTargetSha256: input.pendingPlan.documentTargetSha256,
      libraryTargetSha256: input.pendingPlan.libraryTargetSha256,
      quarantineFileSha256: input.pendingPlan.quarantineFileSha256,
      completedMigrationCount: releaseEvidence.completedMigrationCount,
      completedMigrationLedgerSha256: releaseEvidence.completedMigrationLedgerSha256,
    },
  }
}

export function classifyMatsvinnlovenAlreadyAppliedAudit(input: {
  afterPlan: MatsvinnlovenIdentityMigrationPlan
  expectedContractSha256: string
  expectedPlanSha256: string
  databaseIdentityUuid: string
  candidates: readonly MatsvinnlovenControlledMutationAuditInput[]
}): MatsvinnlovenAlreadyAppliedAuditClassification {
  const conflicts: string[] = []
  if (input.afterPlan.state !== 'already_applied' || input.afterPlan.conflicts.length > 0) {
    conflicts.push('current identity state is not the exact non-conflicting after state')
  }
  let contractSha256 = ''
  let planSha256 = ''
  let databaseIdentityUuid = ''
  try {
    contractSha256 = requiredSha256(input.expectedContractSha256, 'expected contract SHA-256')
    planSha256 = requiredSha256(input.expectedPlanSha256, 'expected plan SHA-256')
    databaseIdentityUuid = requiredUuid(input.databaseIdentityUuid, 'current primary DatabaseIdentity UUID')
    if (contractSha256 !== matsvinnlovenIdentityContractSha256()) {
      conflicts.push('expected contract SHA-256 is not the pinned current contract')
    }
  } catch (error) {
    conflicts.push(error instanceof Error ? error.message : 'invalid expected audit identity')
  }
  if (input.candidates.length !== 1) {
    conflicts.push(`expected exactly one matching audit candidate, observed ${input.candidates.length}`)
    return { state: 'unreceipted_after_state', conflicts }
  }

  const audit = input.candidates[0]
  try {
    requiredSafeControlText(audit.operationKey, 'audit operationKey')
    requiredSha256(audit.contractSha256, 'audit contract SHA-256')
    requiredSha256(audit.planSha256, 'audit plan SHA-256')
    requiredSha256(audit.beforeSnapshotSha256, 'audit before snapshot SHA-256')
    requiredSha256(audit.afterSnapshotSha256, 'audit after snapshot SHA-256')
    requiredSha256(audit.dependencyStateSha256, 'audit dependency state SHA-256')
    requiredSha256(audit.targetFingerprintSha256, 'audit target fingerprint SHA-256')
    requiredSha256(audit.backupSha256, 'audit backup SHA-256')
    requiredSha256(audit.backupMetadataSha256, 'audit backup metadata SHA-256')
    requiredSha256(audit.restoreReceiptSha256, 'audit restore receipt SHA-256')
    requiredUuid(audit.databaseIdentityUuid, 'audit DatabaseIdentity UUID')
    validateMatsvinnlovenOperatorAuthority({
      operatorId: audit.operatorId,
      authorizationRef: audit.authorizationRef,
      databaseRole: audit.databaseRole,
    })
  } catch (error) {
    conflicts.push(error instanceof Error ? error.message : 'audit row has invalid control fields')
  }
  if (audit.contractScope !== MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE) conflicts.push('audit contract scope differs')
  if (audit.contractSha256 !== contractSha256) conflicts.push('audit contract SHA-256 differs')
  if (audit.planSha256 !== planSha256) conflicts.push('audit plan SHA-256 differs')
  if (audit.afterSnapshotSha256 !== input.afterPlan.beforeSnapshotSha256) conflicts.push('audit after snapshot SHA-256 differs')
  if (audit.dependencyStateSha256 !== input.afterPlan.officialDependencyStateSha256) conflicts.push('audit dependency state SHA-256 differs')
  if (audit.databaseIdentityUuid.toLowerCase() !== databaseIdentityUuid) conflicts.push('audit DatabaseIdentity UUID differs')

  try {
    const expectedOperationKey = matsvinnlovenControlledMutationOperationKey({
      contractSha256,
      planSha256,
      databaseIdentityUuid,
      beforeSnapshotSha256: audit.beforeSnapshotSha256,
    })
    if (audit.operationKey !== expectedOperationKey) conflicts.push('audit operationKey differs from its exact bindings')
  } catch (error) {
    conflicts.push(error instanceof Error ? error.message : 'audit operationKey cannot be recomputed')
  }

  const summary = audit.mutationSummary
  const expectedSummaryKeys = [
    'completedMigrationCount', 'completedMigrationLedgerSha256', 'documentTargetSha256',
    'libraryTargetSha256', 'operation', 'pendingState', 'quarantineFileSha256', 'rows',
    'sourceTargetSha256',
  ].sort()
  if (
    !summary || typeof summary !== 'object' || Array.isArray(summary) ||
    JSON.stringify(Object.keys(summary).sort()) !== JSON.stringify(expectedSummaryKeys)
  ) {
    conflicts.push('audit mutationSummary schema differs')
  } else {
    if (summary.operation !== MATSVINNLOVEN_CONTROLLED_MUTATION_OPERATION) conflicts.push('audit mutation operation differs')
    if (!['source_absent', 'source_seeded'].includes(String(summary.pendingState))) conflicts.push('audit pending state differs')
    if (summary.sourceTargetSha256 !== input.afterPlan.sourceTargetSha256) conflicts.push('audit source target SHA-256 differs')
    if (summary.documentTargetSha256 !== input.afterPlan.documentTargetSha256) conflicts.push('audit document target SHA-256 differs')
    if (summary.libraryTargetSha256 !== input.afterPlan.libraryTargetSha256) conflicts.push('audit library target SHA-256 differs')
    if (summary.quarantineFileSha256 !== input.afterPlan.quarantineFileSha256) conflicts.push('audit quarantine file SHA-256 differs')
    if (
      typeof summary.completedMigrationCount !== 'number' ||
      !Number.isSafeInteger(summary.completedMigrationCount) ||
      summary.completedMigrationCount <= 0
    ) {
      conflicts.push('audit completed migration count is invalid')
    }
    try {
      requiredSha256(summary.completedMigrationLedgerSha256, 'audit completed migration ledger SHA-256')
    } catch (error) {
      conflicts.push(error instanceof Error ? error.message : 'audit completed migration ledger SHA-256 is invalid')
    }
    const rows = summary.rows
    const pendingState = summary.pendingState
    const expectedRows = {
      thesisDeletes: 1,
      sourceDocCreates: pendingState === 'source_absent' ? 1 : 0,
      documentQuarantines: 1,
      libraryBlocks: 1,
      citationCreates: 0,
      appraisalCreates: 0,
      sourceDocumentLinks: 0,
    }
    if (sha256MatsvinnlovenJson(rows) !== sha256MatsvinnlovenJson(expectedRows)) {
      conflicts.push('audit mutation row summary differs')
    }
  }

  return conflicts.length > 0
    ? { state: 'unreceipted_after_state', conflicts }
    : { state: 'receipted_noop', operationKey: audit.operationKey }
}

export function classifyMatsvinnlovenAcademicIdentityCounts(
  counts: MatsvinnlovenAcademicIdentityCounts,
): 'pre_migration' | 'post_migration' | 'invalid' {
  if (
    counts.reports === CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY &&
    counts.theses === CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY + 1 &&
    counts.sourceDocs === CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY - 1 &&
    counts.totalEvidence === CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY
  ) return 'pre_migration'
  if (
    counts.reports === CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY &&
    counts.theses === CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY &&
    counts.sourceDocs === CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY &&
    counts.totalEvidence === CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY
  ) return 'post_migration'
  return 'invalid'
}

type CanonicalValue = null | boolean | number | string | CanonicalValue[] | {
  [key: string]: CanonicalValue
}

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || value === undefined) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Matsvinnloven identity state contains a non-finite number')
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalize)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map(key => [key, canonicalize(record[key])]),
    )
  }
  throw new Error(`Matsvinnloven identity state contains unsupported value type: ${typeof value}`)
}

export function sha256MatsvinnlovenJson(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')
}

export function sha256MatsvinnlovenText(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function isoDate(value: Date | string | null | undefined, field: string) {
  if (value == null) return null
  const date = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(value)
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid ${field} in Matsvinnloven identity contract`)
  return date.toISOString()
}

function sortById<T extends { id: string }>(rows: readonly T[]) {
  return [...rows].sort((left, right) => left.id.localeCompare(right.id))
}

export function normalizeMatsvinnlovenIdentitySnapshot(
  snapshot: MatsvinnlovenIdentitySnapshot,
) {
  return {
    theses: sortById(snapshot.theses),
    documents: sortById(snapshot.documents),
    libraryAnalysisRecords: sortById(snapshot.libraryAnalysisRecords),
    sourceDocCandidates: sortById(snapshot.sourceDocCandidates),
    corpusCounts: snapshot.corpusCounts,
    dependencies: Object.fromEntries(
      Object.entries(snapshot.dependencies)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, rows]) => [key, sortById(rows)]),
    ),
  }
}

export function matsvinnlovenIdentitySnapshotSha256(
  snapshot: MatsvinnlovenIdentitySnapshot,
) {
  return sha256MatsvinnlovenJson(normalizeMatsvinnlovenIdentitySnapshot(snapshot))
}

function requiredText(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Official Matsvinnloven SourceDoc seed is missing ${field}`)
  }
  return value
}

export function buildOfficialMatsvinnlovenSourceTarget(
  seedSources: readonly MatsvinnlovenSourceSeed[],
): MatsvinnlovenSourceDocRow {
  const matches = seedSources.filter(source => source.id === OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID)
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID} seed row`)
  }
  const source = matches[0]
  const target: MatsvinnlovenSourceDocRow = {
    id: OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
    filename: requiredText(source.filename, 'filename'),
    title: requiredText(source.title, 'title'),
    author: requiredText(source.author, 'author'),
    year: source.year == null ? null : String(source.year),
    sourceType: requiredText(source.type, 'type'),
    description: requiredText(source.description, 'description'),
    relevance: requiredText(source.relevance, 'relevance'),
    url: requiredText(source.url, 'url'),
    isDuplicate: source.isDuplicate ?? false,
    doi: source.doi ?? null,
    publisher: source.publisher ?? null,
    provenanceType: requiredText(source.provenanceType, 'provenanceType'),
    accessedAt: isoDate(source.accessedAt, 'accessedAt'),
    archivedUrl: source.archivedUrl ?? null,
    documentId: null,
  }
  const digest = sha256MatsvinnlovenJson(target)
  if (digest !== PINNED_MATSVINNLOVEN_SOURCE_TARGET_SHA256) {
    throw new Error(
      `Official Matsvinnloven SourceDoc seed drifted: observed ${digest}; ` +
      `expected ${PINNED_MATSVINNLOVEN_SOURCE_TARGET_SHA256}`,
    )
  }
  if (
    target.url !== OFFICIAL_MATSVINNLOVEN_URL ||
    target.provenanceType !== 'official_primary' ||
    target.documentId !== null
  ) {
    throw new Error('Official Matsvinnloven SourceDoc must stay official_primary and unlinked')
  }
  return target
}

function dependencyCount(snapshot: MatsvinnlovenIdentitySnapshot) {
  const quarantineDependencyKeys = [
    'documentRefsFrom',
    'documentRefsTo',
    'reportBindings',
    'insightDocumentRefs',
    'companyDocumentRefs',
    'actorDocumentRefs',
    'quarantineSourceCitations',
    'quarantineFieldCitations',
    'quarantineEvidenceAppraisals',
  ] as const
  return quarantineDependencyKeys.reduce(
    (total, key) => total + snapshot.dependencies[key].length,
    0,
  )
}

function officialDependencyState(snapshot: MatsvinnlovenIdentitySnapshot) {
  return {
    officialSourceCitations: snapshot.dependencies.officialSourceCitations,
    officialFieldCitations: snapshot.dependencies.officialFieldCitations,
    officialEvidenceAppraisals: snapshot.dependencies.officialEvidenceAppraisals,
    officialLibraryAnalysisRecords: snapshot.dependencies.officialLibraryAnalysisRecords,
    sourceRefs: snapshot.dependencies.sourceRefs,
    insightSourceLinks: snapshot.dependencies.insightSourceLinks,
    mediaEntries: snapshot.dependencies.mediaEntries,
  }
}

function clearOfficialDependencyState(snapshot: MatsvinnlovenIdentitySnapshot) {
  return {
    ...snapshot,
    dependencies: {
      ...snapshot.dependencies,
      officialSourceCitations: [],
      officialFieldCitations: [],
      officialEvidenceAppraisals: [],
      officialLibraryAnalysisRecords: [],
      sourceRefs: [],
      insightSourceLinks: [],
      mediaEntries: [],
    },
  }
}

function buildDocumentTarget(
  quarantineContent: string,
): MatsvinnlovenDocumentTarget {
  return {
    id: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
    slug: 'thesis-matsvinnloven-2025',
    filePath: MATSVINNLOVEN_QUARANTINE_FILE,
    title: MATSVINNLOVEN_QUARANTINE_TITLE,
    author: null,
    year: null,
    documentType: 'quarantined_synthetic',
    category: 'arkiv',
    subcategory: 'identity-quarantine',
    country: 'NO',
    content: quarantineContent,
    summary: MATSVINNLOVEN_QUARANTINE_SUMMARY,
    url: null,
    accessedAt: null,
    archivedUrl: null,
    wordCount: quarantineContent.split(/\s+/).filter(Boolean).length,
    tags: ['identity-quarantine', 'synthetic-placeholder', 'not-citable', 'matsvinnloven'],
    metadata: {
      identityQuarantine: {
        version: 1,
        status: 'blocked_synthetic_identity',
        contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
        reason: 'No verifiable thesis exists; the stored work type and Lovdata locator were false.',
        originalThesisId: SYNTHETIC_MATSVINNLOVEN_THESIS_ID,
        originalDocumentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
        originalLibraryAnalysisRecordId: SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID,
        originalTitle: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare',
        originalUrl: 'https://lovdata.no/dokument/NL/lov/2025-06-20-42',
        replacementSourceDocId: OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
        replacementUrl: OFFICIAL_MATSVINNLOVEN_URL,
        beforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
      },
    },
  }
}

function buildLibraryTarget(
  quarantineContent: string,
): MatsvinnlovenLibraryTarget {
  const riskFlags = [...MATSVINNLOVEN_QUARANTINE_RISK_FLAGS]
  return {
    id: SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID,
    sourceKind: 'document',
    sourceKey: `document:${SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID}`,
    documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
    sourceDocId: null,
    canonicalPath: MATSVINNLOVEN_QUARANTINE_FILE,
    title: MATSVINNLOVEN_QUARANTINE_TITLE,
    status: 'blocked',
    usageRule: 'do_not_use_for_claims',
    reviewStatus: 'not_required',
    citationReadiness: 'blocked_unsourced',
    analysisTier: 'triage_card',
    aiCard: {
      status: 'blocked',
      citationStatus: 'blocked_unsourced',
      shortSummary: MATSVINNLOVEN_QUARANTINE_SUMMARY,
      recommendedUsageRule: 'do_not_use_for_claims',
      riskFlags,
      keyFindings: [],
      claimCandidates: [],
      projectImplication: 'Do not use this historical placeholder for claims or AI context.',
      gaps: ['No verifiable thesis exists.'],
      controlLinks: [
        { href: OFFICIAL_MATSVINNLOVEN_URL, label: 'Official law text' },
        { href: `/${MATSVINNLOVEN_QUARANTINE_FILE}`, label: 'Quarantine artifact' },
      ],
    },
    aiSummary: MATSVINNLOVEN_QUARANTINE_SUMMARY,
    keyFindings: [],
    claimCandidates: [],
    projectImplications: ['Do not use this historical placeholder for claims or AI context.'],
    gaps: ['No verifiable thesis exists.'],
    controlLinks: [
      { href: OFFICIAL_MATSVINNLOVEN_URL, label: 'Official law text' },
      { href: `/${MATSVINNLOVEN_QUARANTINE_FILE}`, label: 'Quarantine artifact' },
    ],
    riskFlags,
    contentHash: sha256MatsvinnlovenText(quarantineContent),
    wordCount: quarantineContent.split(/\s+/).filter(Boolean).length,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
  }
}

function targetComparableDocument(row: MatsvinnlovenDocumentRow) {
  const { createdAt: _createdAt, updatedAt: _updatedAt, accessedAt, ...rest } = row
  return { ...rest, accessedAt: isoDate(accessedAt, 'Document.accessedAt') }
}

function targetComparableLibrary(row: MatsvinnlovenLibraryRow) {
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    processedAt,
    reviewedAt,
    ...rest
  } = row
  return {
    ...rest,
    processedAt: isoDate(processedAt, 'LibraryAnalysisRecord.processedAt'),
    reviewedAt: isoDate(reviewedAt, 'LibraryAnalysisRecord.reviewedAt'),
  }
}

function validCompactTombstone(document: MatsvinnlovenDocumentRow) {
  if (!document.metadata || typeof document.metadata !== 'object' || Array.isArray(document.metadata)) {
    return false
  }
  const quarantine = (document.metadata as Record<string, unknown>).identityQuarantine
  if (!quarantine || typeof quarantine !== 'object' || Array.isArray(quarantine)) return false
  const record = quarantine as Record<string, unknown>
  return record.status === 'blocked_synthetic_identity' &&
    record.contractScope === MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE &&
    record.beforeSnapshotSha256 === PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256
}

function pendingShape(snapshot: MatsvinnlovenIdentitySnapshot) {
  return snapshot.theses.length === 1 &&
    snapshot.theses[0].id === SYNTHETIC_MATSVINNLOVEN_THESIS_ID &&
    snapshot.theses[0].documentId === SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID &&
    snapshot.documents.length === 1 &&
    snapshot.documents[0].id === SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID &&
    snapshot.documents[0].filePath === MATSVINNLOVEN_QUARANTINE_FILE &&
    snapshot.libraryAnalysisRecords.length === 1 &&
    snapshot.libraryAnalysisRecords[0].id === SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID &&
    snapshot.libraryAnalysisRecords[0].documentId === SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID &&
    snapshot.libraryAnalysisRecords[0].sourceDocId === null
}

function comparableSourceDoc(row: MatsvinnlovenSourceDocRow) {
  return {
    ...row,
    accessedAt: isoDate(row.accessedAt, 'SourceDoc.accessedAt'),
  }
}

function exactSourceTarget(
  row: MatsvinnlovenSourceDocRow,
  sourceTarget: MatsvinnlovenSourceDocRow,
) {
  return sha256MatsvinnlovenJson(comparableSourceDoc(row)) ===
    sha256MatsvinnlovenJson(sourceTarget)
}

function appliedShape(
  snapshot: MatsvinnlovenIdentitySnapshot,
  sourceTarget: MatsvinnlovenSourceDocRow,
  quarantineContent: string,
) {
  if (
    snapshot.theses.length !== 0 ||
    snapshot.documents.length !== 1 ||
    snapshot.libraryAnalysisRecords.length !== 1 ||
    snapshot.sourceDocCandidates.length !== 1 ||
    dependencyCount(snapshot) !== 0
  ) return false
  if (
    snapshot.corpusCounts.reports !== CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY ||
    snapshot.corpusCounts.theses !== CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY ||
    snapshot.corpusCounts.sourceDocs !== CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY ||
    snapshot.corpusCounts.totalEvidence !== CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY
  ) return false

  if (!validCompactTombstone(snapshot.documents[0])) return false
  const documentTarget = buildDocumentTarget(quarantineContent)
  const libraryTarget = buildLibraryTarget(quarantineContent)
  return sha256MatsvinnlovenJson(targetComparableDocument(snapshot.documents[0])) ===
      sha256MatsvinnlovenJson(documentTarget) &&
    sha256MatsvinnlovenJson(targetComparableLibrary(snapshot.libraryAnalysisRecords[0])) ===
      sha256MatsvinnlovenJson(libraryTarget) &&
    exactSourceTarget(snapshot.sourceDocCandidates[0], sourceTarget)
}

export function buildMatsvinnlovenIdentityMigrationPlan(
  snapshot: MatsvinnlovenIdentitySnapshot,
  sourceTarget: MatsvinnlovenSourceDocRow,
  quarantineContent: string,
): MatsvinnlovenIdentityMigrationPlan {
  const quarantineFileSha256 = sha256MatsvinnlovenText(quarantineContent)
  if (quarantineFileSha256 !== PINNED_MATSVINNLOVEN_QUARANTINE_FILE_SHA256) {
    throw new Error(
      `Matsvinnloven quarantine file drifted: observed ${quarantineFileSha256}; ` +
      `expected ${PINNED_MATSVINNLOVEN_QUARANTINE_FILE_SHA256}`,
    )
  }
  const sourceTargetSha256 = sha256MatsvinnlovenJson(sourceTarget)
  if (sourceTargetSha256 !== PINNED_MATSVINNLOVEN_SOURCE_TARGET_SHA256) {
    throw new Error('Official Matsvinnloven SourceDoc target differs from the pinned seed contract')
  }

  const beforeSnapshotSha256 = matsvinnlovenIdentitySnapshotSha256(snapshot)
  const pendingCoreSnapshotSha256 = matsvinnlovenIdentitySnapshotSha256(
    clearOfficialDependencyState(snapshot),
  )
  const officialDependencyStateSha256 = sha256MatsvinnlovenJson(
    officialDependencyState(snapshot),
  )
  const conflicts: MatsvinnlovenIdentityConflict[] = []
  const dependencies = dependencyCount(snapshot)
  if (dependencies > 0) {
    conflicts.push({
      code: 'dependency_present',
      detail: `${dependencies} citation/appraisal/reference dependency row(s) would be affected; refusing migration`,
    })
  }

  if (pendingShape(snapshot)) {
    const sourceAbsent = snapshot.sourceDocCandidates.length === 0
    const sourceSeeded = snapshot.sourceDocCandidates.length === 1 &&
      exactSourceTarget(snapshot.sourceDocCandidates[0], sourceTarget)
    const expectedSnapshotSha256 = sourceAbsent
      ? PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256
      : sourceSeeded
        ? PINNED_MATSVINNLOVEN_SOURCE_SEEDED_SNAPSHOT_SHA256
        : null
    const expectedCounts = sourceAbsent
      ? {
          reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
          theses: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY + 1,
          sourceDocs: CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY - 1,
          totalEvidence: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
        }
      : sourceSeeded
        ? {
            reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
            theses: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY + 1,
            sourceDocs: CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
            totalEvidence: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY + 1,
          }
        : null
    if (expectedSnapshotSha256 === null) {
      conflicts.push({
        code: 'mixed_or_partial_state',
        detail: 'Pending identity has an unexpected SourceDoc candidate; only exact absence or the exact unlinked seeded target is accepted',
      })
    } else if (pendingCoreSnapshotSha256 !== expectedSnapshotSha256) {
      conflicts.push({
        code: 'before_snapshot_drift',
        detail: `Pending database core snapshot ${pendingCoreSnapshotSha256} differs from reviewed pin ${expectedSnapshotSha256}`,
      })
    }
    if (
      expectedCounts &&
      sha256MatsvinnlovenJson(snapshot.corpusCounts) !== sha256MatsvinnlovenJson(expectedCounts)
    ) {
      conflicts.push({
        code: 'snapshot_shape_invalid',
        detail: `Pending corpus counts ${JSON.stringify(snapshot.corpusCounts)} differ from exact reviewed ${JSON.stringify(expectedCounts)}`,
      })
    }
    if (conflicts.length > 0) {
      return {
        version: 1,
        contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
        state: 'conflict',
        pendingState: null,
        beforeSnapshotSha256,
        pinnedBeforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
        sourceTargetSha256,
        quarantineFileSha256,
        documentTargetSha256: null,
        libraryTargetSha256: null,
        officialDependencyStateSha256,
        sourceTarget,
        documentTarget: null,
        libraryTarget: null,
        conflicts,
        summary: {
          thesisDeletes: 0,
          sourceDocCreates: 0,
          documentQuarantines: 0,
          libraryBlocks: 0,
          citationCreates: 0,
          appraisalCreates: 0,
          sourceDocumentLinks: 0,
        },
      }
    }
    const documentTarget = buildDocumentTarget(quarantineContent)
    const libraryTarget = buildLibraryTarget(quarantineContent)
    return {
      version: 1,
      contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
      state: 'pending',
      pendingState: sourceSeeded ? 'source_seeded' : 'source_absent',
      beforeSnapshotSha256,
      pinnedBeforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
      sourceTargetSha256,
      quarantineFileSha256,
      documentTargetSha256: sha256MatsvinnlovenJson(documentTarget),
      libraryTargetSha256: sha256MatsvinnlovenJson(libraryTarget),
      officialDependencyStateSha256,
      sourceTarget,
      documentTarget,
      libraryTarget,
      conflicts: [],
      summary: {
        thesisDeletes: 1,
        sourceDocCreates: sourceSeeded ? 0 : 1,
        documentQuarantines: 1,
        libraryBlocks: 1,
        citationCreates: 0,
        appraisalCreates: 0,
        sourceDocumentLinks: 0,
      },
    }
  }

  if (appliedShape(snapshot, sourceTarget, quarantineContent)) {
    return {
      version: 1,
      contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
      state: 'already_applied',
      pendingState: null,
      beforeSnapshotSha256,
      pinnedBeforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
      sourceTargetSha256,
      quarantineFileSha256,
      documentTargetSha256: sha256MatsvinnlovenJson(targetComparableDocument(snapshot.documents[0])),
      libraryTargetSha256: sha256MatsvinnlovenJson(targetComparableLibrary(snapshot.libraryAnalysisRecords[0])),
      officialDependencyStateSha256,
      sourceTarget,
      documentTarget: null,
      libraryTarget: null,
      conflicts: [],
      summary: {
        thesisDeletes: 0,
        sourceDocCreates: 0,
        documentQuarantines: 0,
        libraryBlocks: 0,
        citationCreates: 0,
        appraisalCreates: 0,
        sourceDocumentLinks: 0,
      },
    }
  }

  conflicts.push({
    code: 'mixed_or_partial_state',
    detail: 'Observed state is neither the exact reviewed before snapshot nor the exact idempotent after state',
  })
  return {
    version: 1,
    contractScope: MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
    state: 'conflict',
    pendingState: null,
    beforeSnapshotSha256,
    pinnedBeforeSnapshotSha256: PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
    sourceTargetSha256,
    quarantineFileSha256,
    documentTargetSha256: null,
    libraryTargetSha256: null,
    officialDependencyStateSha256,
    sourceTarget,
    documentTarget: null,
    libraryTarget: null,
    conflicts,
    summary: {
      thesisDeletes: 0,
      sourceDocCreates: 0,
      documentQuarantines: 0,
      libraryBlocks: 0,
      citationCreates: 0,
      appraisalCreates: 0,
      sourceDocumentLinks: 0,
    },
  }
}

export function matsvinnlovenIdentityMigrationPlanContract(
  plan: MatsvinnlovenIdentityMigrationPlan,
) {
  return {
    version: plan.version,
    contractScope: plan.contractScope,
    state: plan.state,
    pendingState: plan.pendingState,
    beforeSnapshotSha256: plan.beforeSnapshotSha256,
    pinnedBeforeSnapshotSha256: plan.pinnedBeforeSnapshotSha256,
    sourceTargetSha256: plan.sourceTargetSha256,
    quarantineFileSha256: plan.quarantineFileSha256,
    documentTargetSha256: plan.documentTargetSha256,
    libraryTargetSha256: plan.libraryTargetSha256,
    officialDependencyStateSha256: plan.officialDependencyStateSha256,
    conflicts: plan.conflicts,
    summary: plan.summary,
  }
}
