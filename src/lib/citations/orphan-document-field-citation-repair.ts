import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_PATH =
  'research/_status/orphan-document-field-citation-repair-manifest-2026-07-20.json'

export const PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256 =
  'ae8740e68d2cd2c9c88483af01b8e3c9407c956b7bd6dc94e7eed90c88dabd49'

export const ORPHAN_DOCUMENT_FIELD_CITATION_SCOPE =
  'orphan-document-field-citation-id-churn-2026-07-20'

export type SerializedFieldCitationSnapshot = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
  createdAt: string
}

export type SerializedSourceCitationSnapshot = {
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
  accessedAt: string | null
  captureMethod: string
  verifiedAt: string | null
  verifiedBy: string | null
  confidence: number | null
  notes: string | null
  documentId: string | null
  sourceDocId: string | null
  createdAt: string
  updatedAt: string
}

export type SerializedDocumentIdentity = {
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
  url: string | null
  accessedAt: string | null
  archivedUrl: string | null
  wordCount: number
  tags: string[]
  metadata: unknown
  createdAt: string
  updatedAt: string
}

export type SafeOrphanDocumentFieldCitationTarget = {
  proofKind:
    | 'source_citation_document_binding'
    | 'exact_local_path_and_title'
    | 'derived_download_path_and_title'
  proofStatement: string
  oldDocumentIdMustBeMissing: string
  targetDocumentId: string
  expectedFieldCitation: SerializedFieldCitationSnapshot
  expectedSourceCitation: SerializedSourceCitationSnapshot
  expectedTargetDocumentIdentity: SerializedDocumentIdentity
}

export type UnresolvedOrphanDocumentFieldCitationTarget = {
  reasonCode:
    | 'path_title_disagree'
    | 'duplicate_path_title_identity'
    | 'url_duplicate_without_path'
    | 'derived_path_title_disagree'
  reason: string
  oldDocumentIdMustBeMissing: string
  expectedFieldCitation: SerializedFieldCitationSnapshot
  expectedSourceCitation: SerializedSourceCitationSnapshot
  candidateDocuments: Array<{
    id: string
    filePath: string | null
    title: string
    url: string | null
    signals: string[]
  }>
}

export type OrphanDocumentFieldCitationManifest = {
  version: 1
  scope: string
  snapshotSource: string
  expectedOrphanInventoryCount: number
  safeTargets: SafeOrphanDocumentFieldCitationTarget[]
  unresolvedTargets: UnresolvedOrphanDocumentFieldCitationTarget[]
}

export type OrphanDocumentFieldCitationInspection = {
  orphanFieldCitationIds: string[]
  fieldCitations: SerializedFieldCitationSnapshot[]
  sourceCitations: SerializedSourceCitationSnapshot[]
  targetDocuments: SerializedDocumentIdentity[]
  presentOldDocumentIds: string[]
  targetTupleFieldCitations: Array<{
    id: string
    citationId: string
    entityType: string
    entityId: string
    fieldPath: string | null
  }>
}

export type OrphanDocumentFieldCitationConflict = {
  id: string
  code:
    | 'field_citation_missing_or_duplicate'
    | 'field_citation_snapshot_drift'
    | 'source_citation_missing_or_duplicate'
    | 'source_citation_snapshot_drift'
    | 'old_document_present'
    | 'target_document_missing_or_duplicate'
    | 'target_document_identity_drift'
    | 'target_tuple_collision'
    | 'orphan_inventory_drift'
  detail: string
}

export type OrphanDocumentFieldCitationRepairPlan = {
  version: 1
  manifestSha256: string
  updates: SafeOrphanDocumentFieldCitationTarget[]
  alreadyAppliedIds: string[]
  unresolved: Array<{
    fieldCitationId: string
    oldDocumentId: string
    reasonCode: UnresolvedOrphanDocumentFieldCitationTarget['reasonCode']
    reason: string
  }>
  conflicts: OrphanDocumentFieldCitationConflict[]
  observedOrphanFieldCitationIds: string[]
  summary: {
    inventory: number
    safe: number
    pending: number
    alreadyApplied: number
    unresolved: number
    conflicts: number
  }
}

type FieldCitationInput = Omit<SerializedFieldCitationSnapshot, 'createdAt'> & {
  createdAt: Date | string
}

type SourceCitationInput = Omit<
  SerializedSourceCitationSnapshot,
  'createdAt' | 'updatedAt' | 'accessedAt' | 'verifiedAt'
> & {
  createdAt: Date | string
  updatedAt: Date | string
  accessedAt: Date | string | null
  verifiedAt: Date | string | null
}

type DocumentIdentityInput = Omit<
  SerializedDocumentIdentity,
  'createdAt' | 'updatedAt' | 'accessedAt'
> & {
  createdAt: Date | string
  updatedAt: Date | string
  accessedAt: Date | string | null
}

function normalizeTimestamp(value: Date | string | null) {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString().replace(/Z$/, '')
  if (/Z$|[+-]\d\d:\d\d$/.test(value)) {
    return new Date(value).toISOString().replace(/Z$/, '')
  }
  return value
}

export function serializeFieldCitationSnapshot(
  row: FieldCitationInput,
): SerializedFieldCitationSnapshot {
  return {
    id: row.id,
    citationId: row.citationId,
    entityType: row.entityType,
    entityId: row.entityId,
    fieldPath: row.fieldPath,
    claimText: row.claimText,
    confidence: row.confidence,
    createdAt: normalizeTimestamp(row.createdAt)!,
  }
}

export function serializeSourceCitationSnapshot(
  row: SourceCitationInput,
): SerializedSourceCitationSnapshot {
  return {
    id: row.id,
    sourceClass: row.sourceClass,
    citationReadiness: row.citationReadiness,
    verificationStatus: row.verificationStatus,
    citationText: row.citationText,
    title: row.title,
    publisher: row.publisher,
    author: row.author,
    year: row.year,
    url: row.url,
    archivedUrl: row.archivedUrl,
    localPath: row.localPath,
    fileHash: row.fileHash,
    contentHash: row.contentHash,
    hashAlgorithm: row.hashAlgorithm,
    pageRef: row.pageRef,
    quote: row.quote,
    accessedAt: normalizeTimestamp(row.accessedAt),
    captureMethod: row.captureMethod,
    verifiedAt: normalizeTimestamp(row.verifiedAt),
    verifiedBy: row.verifiedBy,
    confidence: row.confidence,
    notes: row.notes,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    createdAt: normalizeTimestamp(row.createdAt)!,
    updatedAt: normalizeTimestamp(row.updatedAt)!,
  }
}

export function serializeDocumentIdentity(
  row: DocumentIdentityInput,
): SerializedDocumentIdentity {
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    url: row.url,
    accessedAt: normalizeTimestamp(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: row.tags,
    metadata: row.metadata,
    createdAt: normalizeTimestamp(row.createdAt)!,
    updatedAt: normalizeTimestamp(row.updatedAt)!,
  }
}

function sortCanonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortCanonical)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortCanonical(child)]),
    )
  }
  return value
}

export function canonicalJson(value: unknown) {
  return JSON.stringify(sortCanonical(value))
}

export function orphanDocumentFieldCitationSha256(value: unknown) {
  return createHash('sha256').update(canonicalJson(value)).digest('hex')
}

export function loadOrphanDocumentFieldCitationManifest(
  root = process.cwd(),
): OrphanDocumentFieldCitationManifest {
  return JSON.parse(
    readFileSync(join(root, ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_PATH), 'utf8'),
  ) as OrphanDocumentFieldCitationManifest
}

function exactPath(path: string | null, expected: string | null) {
  return path != null && expected != null && (path === expected || path === `research/${expected}`)
}

function derivedDownloadPath(path: string | null) {
  if (!path || !path.includes('/text/') || !path.endsWith('.txt')) return null
  return path.replace('/text/', '/downloads/').replace(/\.txt$/, '.md')
}

function assertExactKeys(value: object, keys: readonly string[], label: string) {
  const actual = Object.keys(value).sort()
  const expected = [...keys].sort()
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(`${label} keys drifted: ${actual.join(', ')}`)
  }
}

const FIELD_CITATION_KEYS = [
  'id', 'citationId', 'entityType', 'entityId', 'fieldPath', 'claimText',
  'confidence', 'createdAt',
] as const

const SOURCE_CITATION_KEYS = [
  'id', 'sourceClass', 'citationReadiness', 'verificationStatus', 'citationText',
  'title', 'publisher', 'author', 'year', 'url', 'archivedUrl', 'localPath',
  'fileHash', 'contentHash', 'hashAlgorithm', 'pageRef', 'quote', 'accessedAt',
  'captureMethod', 'verifiedAt', 'verifiedBy', 'confidence', 'notes', 'documentId',
  'sourceDocId', 'createdAt', 'updatedAt',
] as const

export function validateOrphanDocumentFieldCitationManifest(
  manifest: OrphanDocumentFieldCitationManifest,
) {
  if (manifest.version !== 1 || manifest.scope !== ORPHAN_DOCUMENT_FIELD_CITATION_SCOPE) {
    throw new Error('Orphan Document FieldCitation manifest version/scope drifted')
  }
  if (
    manifest.expectedOrphanInventoryCount !== 32 ||
    manifest.safeTargets.length !== 27 ||
    manifest.unresolvedTargets.length !== 5
  ) {
    throw new Error('Orphan Document FieldCitation manifest cardinality drifted')
  }
  if (
    orphanDocumentFieldCitationSha256(manifest) !==
    PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256
  ) {
    throw new Error('Orphan Document FieldCitation manifest drifted from pinned SHA-256')
  }

  const rows = [...manifest.safeTargets, ...manifest.unresolvedTargets]
  const fieldIds = rows.map(row => row.expectedFieldCitation.id)
  const citationIds = rows.map(row => row.expectedSourceCitation.id)
  if (new Set(fieldIds).size !== 32 || new Set(citationIds).size !== 32) {
    throw new Error('Orphan Document FieldCitation manifest IDs must be unique')
  }

  for (const row of rows) {
    assertExactKeys(row.expectedFieldCitation, FIELD_CITATION_KEYS, `${row.expectedFieldCitation.id} FieldCitation`)
    assertExactKeys(row.expectedSourceCitation, SOURCE_CITATION_KEYS, `${row.expectedFieldCitation.id} SourceCitation`)
    if (
      row.expectedFieldCitation.entityType !== 'Document' ||
      row.expectedFieldCitation.entityId !== row.oldDocumentIdMustBeMissing ||
      row.expectedFieldCitation.citationId !== row.expectedSourceCitation.id
    ) {
      throw new Error(`Pinned orphan binding drifted for ${row.expectedFieldCitation.id}`)
    }
  }

  for (const row of manifest.safeTargets) {
    const citation = row.expectedSourceCitation
    const document = row.expectedTargetDocumentIdentity
    if (row.targetDocumentId !== document.id) {
      throw new Error(`Target Document identity drifted for ${row.expectedFieldCitation.id}`)
    }
    if (row.proofKind === 'source_citation_document_binding') {
      if (
        citation.documentId !== document.id ||
        !exactPath(document.filePath, citation.localPath) ||
        citation.title?.toLowerCase() !== document.title.toLowerCase() ||
        citation.url !== document.url
      ) {
        throw new Error(`Direct SourceCitation binding proof drifted for ${row.expectedFieldCitation.id}`)
      }
    } else if (row.proofKind === 'exact_local_path_and_title') {
      if (
        !exactPath(document.filePath, citation.localPath) ||
        citation.title?.toLowerCase() !== document.title.toLowerCase()
      ) {
        throw new Error(`Exact path/title proof drifted for ${row.expectedFieldCitation.id}`)
      }
    } else {
      const derived = derivedDownloadPath(citation.localPath)
      if (
        !exactPath(document.filePath, derived) ||
        citation.title?.toLowerCase() !== document.title.toLowerCase()
      ) {
        throw new Error(`Derived download path/title proof drifted for ${row.expectedFieldCitation.id}`)
      }
    }
  }
  return manifest
}

function matches(left: unknown, right: unknown) {
  return canonicalJson(left) === canonicalJson(right)
}

function compareIds(left: readonly string[], right: readonly string[]) {
  return matches([...left].sort(), [...right].sort())
}

function fieldAfterTarget(target: SafeOrphanDocumentFieldCitationTarget) {
  return {
    ...target.expectedFieldCitation,
    entityId: target.targetDocumentId,
  }
}

export function buildOrphanDocumentFieldCitationRepairPlan(
  inspection: OrphanDocumentFieldCitationInspection,
  manifestInput: OrphanDocumentFieldCitationManifest,
): OrphanDocumentFieldCitationRepairPlan {
  const manifest = validateOrphanDocumentFieldCitationManifest(manifestInput)
  const updates: SafeOrphanDocumentFieldCitationTarget[] = []
  const alreadyAppliedIds: string[] = []
  const conflicts: OrphanDocumentFieldCitationConflict[] = []
  const fieldMap = new Map<string, SerializedFieldCitationSnapshot[]>()
  const citationMap = new Map<string, SerializedSourceCitationSnapshot[]>()
  const documentMap = new Map<string, SerializedDocumentIdentity[]>()

  for (const row of inspection.fieldCitations) {
    fieldMap.set(row.id, [...(fieldMap.get(row.id) ?? []), row])
  }
  for (const row of inspection.sourceCitations) {
    citationMap.set(row.id, [...(citationMap.get(row.id) ?? []), row])
  }
  for (const row of inspection.targetDocuments) {
    documentMap.set(row.id, [...(documentMap.get(row.id) ?? []), row])
  }

  const inspectPinnedDependencies = (
    target: SafeOrphanDocumentFieldCitationTarget | UnresolvedOrphanDocumentFieldCitationTarget,
  ) => {
    const id = target.expectedFieldCitation.id
    const citations = citationMap.get(target.expectedSourceCitation.id) ?? []
    if (citations.length !== 1) {
      conflicts.push({
        id,
        code: 'source_citation_missing_or_duplicate',
        detail: `Expected one pinned SourceCitation; found ${citations.length}.`,
      })
    } else if (!matches(citations[0], target.expectedSourceCitation)) {
      conflicts.push({
        id,
        code: 'source_citation_snapshot_drift',
        detail: 'Pinned full SourceCitation snapshot drifted.',
      })
    }
    if (inspection.presentOldDocumentIds.includes(target.oldDocumentIdMustBeMissing)) {
      conflicts.push({
        id,
        code: 'old_document_present',
        detail: `Old Document ${target.oldDocumentIdMustBeMissing} unexpectedly exists.`,
      })
    }
  }

  for (const target of manifest.safeTargets) {
    const id = target.expectedFieldCitation.id
    const fields = fieldMap.get(id) ?? []
    if (fields.length !== 1) {
      conflicts.push({
        id,
        code: 'field_citation_missing_or_duplicate',
        detail: `Expected one pinned FieldCitation; found ${fields.length}.`,
      })
    } else if (matches(fields[0], target.expectedFieldCitation)) {
      updates.push(target)
    } else if (matches(fields[0], fieldAfterTarget(target))) {
      alreadyAppliedIds.push(id)
    } else {
      conflicts.push({
        id,
        code: 'field_citation_snapshot_drift',
        detail: 'FieldCitation is neither the exact pinned before-state nor the exact target state.',
      })
    }
    inspectPinnedDependencies(target)

    const documents = documentMap.get(target.targetDocumentId) ?? []
    if (documents.length !== 1) {
      conflicts.push({
        id,
        code: 'target_document_missing_or_duplicate',
        detail: `Expected one target Document; found ${documents.length}.`,
      })
    } else if (!matches(documents[0], target.expectedTargetDocumentIdentity)) {
      conflicts.push({
        id,
        code: 'target_document_identity_drift',
        detail: 'Pinned target Document identity snapshot drifted.',
      })
    }

    const tupleRows = inspection.targetTupleFieldCitations.filter(row =>
      row.citationId === target.expectedFieldCitation.citationId &&
      row.entityType === 'Document' &&
      row.entityId === target.targetDocumentId &&
      row.fieldPath === target.expectedFieldCitation.fieldPath,
    )
    const expectedTupleIds = alreadyAppliedIds.includes(id) ? [id] : []
    if (!compareIds(tupleRows.map(row => row.id), expectedTupleIds)) {
      conflicts.push({
        id,
        code: 'target_tuple_collision',
        detail: `Target unique tuple is occupied by: ${tupleRows.map(row => row.id).join(', ') || 'unexpected state'}.`,
      })
    }
  }

  for (const target of manifest.unresolvedTargets) {
    const id = target.expectedFieldCitation.id
    const fields = fieldMap.get(id) ?? []
    if (fields.length !== 1) {
      conflicts.push({
        id,
        code: 'field_citation_missing_or_duplicate',
        detail: `Expected one unresolved FieldCitation; found ${fields.length}.`,
      })
    } else if (!matches(fields[0], target.expectedFieldCitation)) {
      conflicts.push({
        id,
        code: 'field_citation_snapshot_drift',
        detail: 'Unresolved FieldCitation moved or drifted without reviewed identity evidence.',
      })
    }
    inspectPinnedDependencies(target)
  }

  const expectedOrphanIds = [
    ...updates.map(target => target.expectedFieldCitation.id),
    ...manifest.unresolvedTargets.map(target => target.expectedFieldCitation.id),
  ].sort()
  const observedOrphanFieldCitationIds = [...inspection.orphanFieldCitationIds].sort()
  if (!compareIds(observedOrphanFieldCitationIds, expectedOrphanIds)) {
    conflicts.push({
      id: 'inventory',
      code: 'orphan_inventory_drift',
      detail: `Expected orphan IDs ${expectedOrphanIds.join(', ')}; observed ${observedOrphanFieldCitationIds.join(', ')}.`,
    })
  }

  const unresolved = manifest.unresolvedTargets.map(target => ({
    fieldCitationId: target.expectedFieldCitation.id,
    oldDocumentId: target.oldDocumentIdMustBeMissing,
    reasonCode: target.reasonCode,
    reason: target.reason,
  }))

  return {
    version: 1,
    manifestSha256: PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds: alreadyAppliedIds.sort(),
    unresolved,
    conflicts,
    observedOrphanFieldCitationIds,
    summary: {
      inventory: manifest.expectedOrphanInventoryCount,
      safe: manifest.safeTargets.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      unresolved: unresolved.length,
      conflicts: conflicts.length,
    },
  }
}

export function orphanDocumentFieldCitationPlanContract(
  plan: OrphanDocumentFieldCitationRepairPlan,
) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    updates: plan.updates.map(target => ({
      fieldCitationId: target.expectedFieldCitation.id,
      citationId: target.expectedFieldCitation.citationId,
      oldDocumentId: target.oldDocumentIdMustBeMissing,
      targetDocumentId: target.targetDocumentId,
      proofKind: target.proofKind,
    })),
    alreadyAppliedIds: plan.alreadyAppliedIds,
    unresolved: plan.unresolved,
    conflicts: plan.conflicts,
    observedOrphanFieldCitationIds: plan.observedOrphanFieldCitationIds,
    summary: plan.summary,
  }
}

export function orphanDocumentFieldCitationPlanSha256(
  plan: OrphanDocumentFieldCitationRepairPlan,
) {
  return orphanDocumentFieldCitationSha256(
    orphanDocumentFieldCitationPlanContract(plan),
  )
}
