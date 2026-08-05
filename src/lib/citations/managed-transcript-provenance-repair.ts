import { createHash } from 'node:crypto'

export const MANAGED_TRANSCRIPT_PROVENANCE_TARGET = 'internal_primary' as const
export const MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT = 17
export const PINNED_MANAGED_TRANSCRIPT_SOURCE_DOC_IDS_SHA256 =
  'bcb97409c2cd2946b59401a92067bdf14da9647b331b1431c3957e22cae0cc76'

export type ManagedTranscriptSourceDocRow = {
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

export type ManagedTranscriptDocumentRow = {
  id: string
  filePath: string | null
  title: string
  author: string | null
  documentType: string | null
  category: string | null
  url: string | null
  metadata: unknown
  createdAt: Date | string
  updatedAt: Date | string
}

export type ManagedTranscriptSourceCitationRow = {
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
}

export type ManagedTranscriptFieldCitationRow = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
  createdAt: Date | string
}

export type ManagedTranscriptLibraryAnalysisRow = {
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

export type ManagedTranscriptProvenanceSnapshot = Omit<
  ManagedTranscriptSourceDocRow,
  'accessedAt'
> & {
  accessedAt: string | null
}

export type ManagedTranscriptProvenanceRepairInput = {
  sourceDocs: ManagedTranscriptSourceDocRow[]
  documents: ManagedTranscriptDocumentRow[]
  sourceCitations: ManagedTranscriptSourceCitationRow[]
  fieldCitations: ManagedTranscriptFieldCitationRow[]
  libraryAnalysisRecords: ManagedTranscriptLibraryAnalysisRow[]
}

export type ManagedTranscriptProvenanceConflictCode =
  | 'managed_source_doc_set_mismatch'
  | 'source_doc_identity_invalid'
  | 'source_doc_provenance_conflict'
  | 'document_binding_invalid'
  | 'source_citation_binding_invalid'
  | 'field_citation_binding_invalid'
  | 'library_analysis_binding_invalid'
  | 'library_analysis_batch_invalid'

export type ManagedTranscriptProvenanceConflict = {
  id: string
  code: ManagedTranscriptProvenanceConflictCode
  detail: string
}

export type ManagedTranscriptProvenanceUpdate = {
  id: string
  expectedSourceDoc: ManagedTranscriptProvenanceSnapshot
  targetProvenanceType: typeof MANAGED_TRANSCRIPT_PROVENANCE_TARGET
}

export type ManagedTranscriptProvenanceLockSet = {
  sourceDocIds: string[]
  documentIds: string[]
  sourceCitationIds: string[]
  fieldCitationIds: string[]
  libraryAnalysisRecordIds: string[]
}

export type ManagedTranscriptProvenanceRepairPlan = {
  version: 1
  targetManifestSha256: string
  targetProvenanceType: typeof MANAGED_TRANSCRIPT_PROVENANCE_TARGET
  preservedDependencyStateSha256: string
  updates: ManagedTranscriptProvenanceUpdate[]
  alreadyAppliedIds: string[]
  lockSet: ManagedTranscriptProvenanceLockSet
  conflicts: ManagedTranscriptProvenanceConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
    citationGateChanges: 0
    libraryPolicyChanges: 0
  }
}

type CanonicalValue = null | boolean | number | string | CanonicalValue[] | {
  [key: string]: CanonicalValue
}

function canonicalize(value: unknown): CanonicalValue {
  if (value === null) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Managed transcript state contains a non-finite number')
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
  throw new Error(`Managed transcript state contains unsupported value type: ${typeof value}`)
}

export function sha256ManagedTranscriptJson(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')
}

function compareIds(left: { id: string }, right: { id: string }) {
  return left.id.localeCompare(right.id)
}

function isoDate(value: Date | string | null) {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error('Managed transcript row contains an invalid date')
  }
  return parsed.toISOString()
}

export function normalizeManagedTranscriptSourceDoc(
  row: ManagedTranscriptSourceDocRow,
): ManagedTranscriptProvenanceSnapshot {
  return {
    ...row,
    accessedAt: isoDate(row.accessedAt),
  }
}

export function validateManagedTranscriptSourceDocIds(ids: readonly string[]) {
  const sorted = [...ids].sort()
  if (
    sorted.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT ||
    new Set(sorted).size !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT
  ) {
    throw new Error(
      `Managed transcript provenance contract requires exactly ${MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT} unique SourceDoc ids`,
    )
  }
  if (sorted.some(id => !/^src-yt-[A-Za-z0-9_-]+$/.test(id))) {
    throw new Error('Managed transcript provenance contract contains an invalid SourceDoc id')
  }
  const digest = sha256ManagedTranscriptJson(sorted)
  if (digest !== PINNED_MANAGED_TRANSCRIPT_SOURCE_DOC_IDS_SHA256) {
    throw new Error('Managed transcript SourceDoc ids drifted from the reviewed manifest contract')
  }
  return sorted
}

function metadataRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function expectedVideoId(sourceDocId: string) {
  return sourceDocId.slice('src-yt-'.length)
}

function sourceDocIdentityErrors(row: ManagedTranscriptSourceDocRow) {
  const videoId = expectedVideoId(row.id)
  const expectedUrl = `https://www.youtube.com/watch?v=${videoId}`
  const errors: string[] = []
  if (!row.filename.endsWith('.txt')) errors.push('filename')
  if (!row.title?.trim()) errors.push('title')
  if (row.author !== 'Landbruk Arena') errors.push('author')
  if (row.year !== null) errors.push('year')
  if (row.sourceType !== 'transkripsjon') errors.push('sourceType')
  if (row.description !== `YouTube video transcript from Landbruk Arena: ${row.title ?? ''}`) {
    errors.push('description')
  }
  if (row.relevance !== 'Primary source - video transcript of Norwegian agricultural content') {
    errors.push('relevance')
  }
  if (row.url !== expectedUrl) errors.push('url')
  if (row.isDuplicate) errors.push('isDuplicate')
  if (row.doi !== null) errors.push('doi')
  if (row.publisher !== null) errors.push('publisher')
  if (row.accessedAt !== null) errors.push('accessedAt')
  if (row.archivedUrl !== null) errors.push('archivedUrl')
  if (!row.documentId) errors.push('documentId')
  return errors
}

function documentBindingErrors(
  sourceDoc: ManagedTranscriptSourceDocRow,
  document: ManagedTranscriptDocumentRow,
) {
  const metadata = metadataRecord(document.metadata)
  const videoId = expectedVideoId(sourceDoc.id)
  const allowedPaths = [
    `landbrukarena_transcripts/${sourceDoc.filename}`,
    `landbrukarena_transcripts/local_asr_missing/${sourceDoc.filename}`,
  ]
  const errors: string[] = []
  if (document.id !== sourceDoc.documentId) errors.push('id')
  if (!document.filePath || !allowedPaths.includes(document.filePath)) errors.push('filePath')
  if (document.title !== sourceDoc.title) errors.push('title')
  if (document.author !== sourceDoc.author) errors.push('author')
  if (document.documentType !== 'transcript') errors.push('documentType')
  if (document.category !== 'landbrukarena-transcripts') errors.push('category')
  if (document.url !== sourceDoc.url) errors.push('url')
  if (metadata?.videoId !== videoId) errors.push('metadata.videoId')
  if (metadata?.sourceScript !== 'import-transcripts.ts') errors.push('metadata.sourceScript')
  if (!['fulltext', 'transcript_fragment_unusable'].includes(String(metadata?.availabilityStatus))) {
    errors.push('metadata.availabilityStatus')
  }
  return errors
}

function libraryStateIsAllowed(row: ManagedTranscriptLibraryAnalysisRow) {
  const allowedUsageState =
    (row.status === 'ai_draft' && row.usageRule === 'internal_background') ||
    (row.status === 'blocked' && row.usageRule === 'do_not_use_for_claims')
  return allowedUsageState &&
    row.reviewStatus === 'not_required' &&
    row.citationReadiness === 'blocked_unsourced'
}

function rowsByKey<T>(rows: readonly T[], key: (row: T) => string | null) {
  const result = new Map<string, T[]>()
  for (const row of rows) {
    const value = key(row)
    if (!value) continue
    result.set(value, [...(result.get(value) ?? []), row])
  }
  return result
}

function pushConflict(
  conflicts: ManagedTranscriptProvenanceConflict[],
  id: string,
  code: ManagedTranscriptProvenanceConflictCode,
  detail: string,
) {
  conflicts.push({ id, code, detail })
}

function dependencyStateSha256(input: ManagedTranscriptProvenanceRepairInput) {
  return sha256ManagedTranscriptJson({
    documents: [...input.documents].sort(compareIds),
    sourceCitations: [...input.sourceCitations].sort(compareIds),
    fieldCitations: [...input.fieldCitations].sort(compareIds),
    libraryAnalysisRecords: [...input.libraryAnalysisRecords].sort(compareIds),
  })
}

export function buildManagedTranscriptProvenanceRepairPlan(
  managedSourceDocIds: readonly string[],
  input: ManagedTranscriptProvenanceRepairInput,
): ManagedTranscriptProvenanceRepairPlan {
  const expectedIds = validateManagedTranscriptSourceDocIds(managedSourceDocIds)
  const conflicts: ManagedTranscriptProvenanceConflict[] = []
  const updates: ManagedTranscriptProvenanceUpdate[] = []
  const alreadyAppliedIds: string[] = []
  const sourceDocsById = rowsByKey(input.sourceDocs, row => row.id)
  const documentsById = rowsByKey(input.documents, row => row.id)
  const citationsById = rowsByKey(input.sourceCitations, row => row.id)
  const citationsBySourceDocId = rowsByKey(input.sourceCitations, row => row.sourceDocId)
  const fieldsByCitationId = rowsByKey(input.fieldCitations, row => row.citationId)
  const fieldsBySourceDocId = rowsByKey(
    input.fieldCitations,
    row => row.entityType === 'SourceDoc' ? row.entityId : null,
  )
  const librariesBySourceDocId = rowsByKey(input.libraryAnalysisRecords, row => row.sourceDocId)
  const actualSourceDocIds = [...sourceDocsById.keys()].sort()

  if (JSON.stringify(actualSourceDocIds) !== JSON.stringify(expectedIds)) {
    pushConflict(
      conflicts,
      'managed-transcript-batch',
      'managed_source_doc_set_mismatch',
      `Expected ${expectedIds.length} exact managed SourceDocs; observed ${actualSourceDocIds.length}`,
    )
  }

  if (
    input.documents.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT ||
    new Set(input.documents.map(row => row.id)).size !== input.documents.length
  ) {
    pushConflict(
      conflicts,
      'managed-transcript-batch',
      'document_binding_invalid',
      `Expected ${MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT} unique linked Documents; observed ${input.documents.length}`,
    )
  }
  if (
    input.sourceCitations.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT * 2 ||
    new Set(input.sourceCitations.map(row => row.id)).size !== input.sourceCitations.length
  ) {
    pushConflict(
      conflicts,
      'managed-transcript-batch',
      'source_citation_binding_invalid',
      `Expected ${MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT * 2} exact direct-document and URL SourceCitations; observed ${input.sourceCitations.length}`,
    )
  }
  const observedCitationIds = new Set(input.sourceCitations.map(row => row.id))
  if (
    input.fieldCitations.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT * 2 ||
    input.fieldCitations.some(row => !observedCitationIds.has(row.citationId))
  ) {
    pushConflict(
      conflicts,
      'managed-transcript-batch',
      'field_citation_binding_invalid',
      `Expected ${MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT * 2} exact dependent FieldCitations; observed ${input.fieldCitations.length}`,
    )
  }

  for (const id of expectedIds) {
    const sourceRows = sourceDocsById.get(id) ?? []
    if (sourceRows.length !== 1) {
      pushConflict(
        conflicts,
        id,
        'managed_source_doc_set_mismatch',
        `Expected one SourceDoc row; observed ${sourceRows.length}`,
      )
      continue
    }
    const sourceDoc = sourceRows[0]!
    const identityErrors = sourceDocIdentityErrors(sourceDoc)
    if (identityErrors.length > 0) {
      pushConflict(
        conflicts,
        id,
        'source_doc_identity_invalid',
        `Managed SourceDoc identity drift: ${identityErrors.join(', ')}`,
      )
    }

    if (
      sourceDoc.provenanceType !== 'unknown' &&
      sourceDoc.provenanceType !== MANAGED_TRANSCRIPT_PROVENANCE_TARGET
    ) {
      pushConflict(
        conflicts,
        id,
        'source_doc_provenance_conflict',
        `Expected unknown or ${MANAGED_TRANSCRIPT_PROVENANCE_TARGET}; observed ${sourceDoc.provenanceType}`,
      )
    }

    const documentRows = sourceDoc.documentId
      ? documentsById.get(sourceDoc.documentId) ?? []
      : []
    if (documentRows.length !== 1) {
      pushConflict(
        conflicts,
        id,
        'document_binding_invalid',
        `Expected one linked Document; observed ${documentRows.length}`,
      )
    } else {
      const errors = documentBindingErrors(sourceDoc, documentRows[0]!)
      if (errors.length > 0) {
        pushConflict(
          conflicts,
          id,
          'document_binding_invalid',
          `Managed Document identity drift: ${errors.join(', ')}`,
        )
      }
    }

    const directCitationRows = citationsBySourceDocId.get(id) ?? []
    if (directCitationRows.length !== 1) {
      pushConflict(
        conflicts,
        id,
        'source_citation_binding_invalid',
        `Expected one direct document SourceCitation; observed ${directCitationRows.length}`,
      )
    } else {
      const citation = directCitationRows[0]!
      const citationErrors: string[] = []
      if (citation.sourceDocId !== id) citationErrors.push('sourceDocId')
      if (citation.documentId !== sourceDoc.documentId) citationErrors.push('documentId')
      if (citation.sourceClass !== 'unknown') citationErrors.push('sourceClass')
      if (citation.citationReadiness !== 'blocked_unsourced') citationErrors.push('citationReadiness')
      if (citation.verificationStatus !== 'needs_review') citationErrors.push('verificationStatus')
      if (citationErrors.length > 0) {
        pushConflict(
          conflicts,
          id,
          'source_citation_binding_invalid',
          `Fail-closed SourceCitation drift: ${citationErrors.join(', ')}`,
        )
      }

      const directFieldRows = fieldsByCitationId.get(citation.id) ?? []
      const directField = directFieldRows[0]
      if (
        directFieldRows.length !== 1 ||
        !directField ||
        directField.entityType !== 'SourceDoc' ||
        directField.entityId !== id ||
        directField.fieldPath !== 'documentId' ||
        directField.claimText !== null ||
        directField.confidence !== null
      ) {
        pushConflict(
          conflicts,
          id,
          'field_citation_binding_invalid',
          `Expected one preserved SourceDoc.documentId FieldCitation; observed ${directFieldRows.length}`,
        )
      }
    }

    const targetFieldRows = fieldsBySourceDocId.get(id) ?? []
    const urlFieldRows = targetFieldRows.filter(row => row.fieldPath === 'url')
    const urlField = urlFieldRows[0]
    const urlCitationRows = urlField
      ? citationsById.get(urlField.citationId) ?? []
      : []
    const urlCitation = urlCitationRows[0]
    const urlCitationFieldRows = urlCitation
      ? fieldsByCitationId.get(urlCitation.id) ?? []
      : []
    if (
      targetFieldRows.length !== 2 ||
      urlFieldRows.length !== 1 ||
      !urlField ||
      urlField.claimText !== null ||
      urlField.confidence !== null ||
      urlCitationRows.length !== 1 ||
      !urlCitation ||
      urlCitationFieldRows.length !== 1 ||
      urlCitation.sourceDocId !== null ||
      urlCitation.documentId !== null ||
      urlCitation.sourceClass !== 'unknown' ||
      urlCitation.citationReadiness !== 'blocked_unsourced' ||
      urlCitation.verificationStatus !== 'machine_verified' ||
      urlCitation.url !== sourceDoc.url
    ) {
      pushConflict(
        conflicts,
        id,
        'source_citation_binding_invalid',
        `Expected one preserved fail-closed URL SourceCitation and two exact SourceDoc fields; observed ${urlCitationRows.length} URL citation(s) and ${targetFieldRows.length} fields`,
      )
    }

    const libraryRows = librariesBySourceDocId.get(id) ?? []
    const library = libraryRows[0]
    if (
      libraryRows.length !== 1 ||
      !library ||
      library.sourceKind !== 'document' ||
      library.sourceKey !== `document:${sourceDoc.documentId}` ||
      library.documentId !== sourceDoc.documentId ||
      !libraryStateIsAllowed(library)
    ) {
      pushConflict(
        conflicts,
        id,
        'library_analysis_binding_invalid',
        `Expected one preserved fail-closed LibraryAnalysisRecord; observed ${libraryRows.length}`,
      )
    }

    if (
      identityErrors.length === 0 &&
      ['unknown', MANAGED_TRANSCRIPT_PROVENANCE_TARGET].includes(sourceDoc.provenanceType)
    ) {
      if (sourceDoc.provenanceType === MANAGED_TRANSCRIPT_PROVENANCE_TARGET) {
        alreadyAppliedIds.push(id)
      } else {
        updates.push({
          id,
          expectedSourceDoc: normalizeManagedTranscriptSourceDoc(sourceDoc),
          targetProvenanceType: MANAGED_TRANSCRIPT_PROVENANCE_TARGET,
        })
      }
    }
  }

  const libraryStatusCounts = input.libraryAnalysisRecords.reduce(
    (counts, row) => {
      if (row.status === 'ai_draft' && row.usageRule === 'internal_background') counts.aiDraft += 1
      if (row.status === 'blocked' && row.usageRule === 'do_not_use_for_claims') counts.blocked += 1
      return counts
    },
    { aiDraft: 0, blocked: 0 },
  )
  if (
    input.libraryAnalysisRecords.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT ||
    libraryStatusCounts.aiDraft !== 14 ||
    libraryStatusCounts.blocked !== 3
  ) {
    pushConflict(
      conflicts,
      'managed-transcript-batch',
      'library_analysis_batch_invalid',
      `Expected 14 ai_draft/internal_background and 3 blocked/do_not_use_for_claims rows; observed ${libraryStatusCounts.aiDraft} and ${libraryStatusCounts.blocked}`,
    )
  }

  const lockSet: ManagedTranscriptProvenanceLockSet = {
    sourceDocIds: input.sourceDocs.map(row => row.id).sort(),
    documentIds: input.documents.map(row => row.id).sort(),
    sourceCitationIds: input.sourceCitations.map(row => row.id).sort(),
    fieldCitationIds: input.fieldCitations.map(row => row.id).sort(),
    libraryAnalysisRecordIds: input.libraryAnalysisRecords.map(row => row.id).sort(),
  }

  return {
    version: 1,
    targetManifestSha256: PINNED_MANAGED_TRANSCRIPT_SOURCE_DOC_IDS_SHA256,
    targetProvenanceType: MANAGED_TRANSCRIPT_PROVENANCE_TARGET,
    preservedDependencyStateSha256: dependencyStateSha256(input),
    updates: updates.sort(compareIds),
    alreadyAppliedIds: alreadyAppliedIds.sort(),
    lockSet,
    conflicts: conflicts.sort((left, right) =>
      left.id.localeCompare(right.id) || left.code.localeCompare(right.code),
    ),
    summary: {
      total: expectedIds.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
      citationGateChanges: 0,
      libraryPolicyChanges: 0,
    },
  }
}

export function managedTranscriptProvenanceRepairPlanContract(
  plan: ManagedTranscriptProvenanceRepairPlan,
) {
  return {
    version: plan.version,
    targetManifestSha256: plan.targetManifestSha256,
    targetProvenanceType: plan.targetProvenanceType,
    preservedDependencyStateSha256: plan.preservedDependencyStateSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    lockSet: plan.lockSet,
    conflicts: plan.conflicts,
  }
}
