import { createHash } from 'node:crypto'

export const SOURCE_DOC_METADATA_REPAIR_IDS = [
  'src-29',
  'src-30',
  'src-31',
  'src-32',
  'src-33',
  'src-35',
  'src-37',
  'src-38',
  'src-39',
  'src-40',
  'src-43',
  'src-45',
  'src-48',
  'src-49',
] as const

export const SOURCE_DOC_METADATA_FIELDS = [
  'author',
  'year',
  'sourceType',
  'description',
  'relevance',
  'publisher',
] as const

export type SourceDocMetadataField = (typeof SOURCE_DOC_METADATA_FIELDS)[number]

export const PINNED_SOURCE_DOC_METADATA_BEFORE_BATCH_SHA256 =
  '1600e9a41ad35134486b504bd5eaede3d908d4dc68b472757a8c270bc1dedb2c'

export const PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256 =
  '01ffbd3b3d0dc828d15b532240d57f8a7d68a79aba2a07f2204432827ab9346b'

export const PINNED_SOURCE_DOC_METADATA_IDENTITY_SHA256 =
  '8fcc105da42d3fcb03be0569878d6e0808242ea4ab9c1a80287041869c4b05ca'

export const PINNED_SOURCE_DOC_METADATA_BEFORE_ROW_SHA256: Readonly<Record<string, string>> = {
  'src-29': '0c2c437915c42edc9586c931aa1dd09347aadf6bc077e3dc9c4b4bbdc276db4c',
  'src-30': 'a9e5764b6d3e279e2f4c3201e303968b2a392a9a9ee0a0b1c95d48209c50f894',
  'src-31': '2dc603d2f7d92dd3eaf41f08b5f9ae90d00c41d5a9c95f8c97fab6fd678e7100',
  'src-32': 'db8a476f6ae4e6a0a3459ce8f2ac23fdb5fb8a61cd840a260e23735777e31b00',
  'src-33': '1e28dd5f7c0bd3d727c99f789db0bf6b8cc09f64d2d4f4d224e4c3a4eeccf239',
  'src-35': '54146d5cf5ac6f6c5d986f76c48e834007eca283927d92f0339fdfcf2a85cd5f',
  'src-37': 'df25e9f6edd7f945f8383d9691012c55fc1f43f4b56e2fd65f4cb226097ec490',
  'src-38': '6e09f4991104d9451942f9cbff27dfe83f7b4b05045e994926f7e99907ebf00d',
  'src-39': '8d22e300abbef71e678a158f3589e0daaa9a648b6cbe11d6f6f5c1428382e9e6',
  'src-40': '51af7a4dec073ba4d53162a4aa6bdc5e10510cef101efb412d0b45f132296c0b',
  'src-43': '9f2abe785d0530b23c8657be4977efc26160b481335686ef46206fa3bdae1cbf',
  'src-45': '047f0cd1e5b4ae0dccea33d9fb750ff974d1ed9d29964ce620f2bd72d12129fe',
  'src-48': '8fba7d15510d30ce90c37873e5020bcbaf1aea922f04b872c57c0f30cc1c9efa',
  'src-49': '695b2a424b9208da300e8cf616589efe5bede1cafec2d68d9f3c61596b8648bf',
}

export type SourceDocMetadataValues = {
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  publisher: string | null
}

export type SourceDocProtectedIdentity = {
  filename: string
  title: string | null
  url: string | null
  doi: string | null
  accessedAt: string | null
  archivedUrl: string | null
  provenanceType: string
  isDuplicate: boolean
}

export type SourceDocMetadataSeedInput = {
  id: string
  filename: string
  title?: string | null
  author?: string | null
  year?: string | number | null
  type: string
  description: string
  relevance: string
  url?: string | null
  doi?: string | null
  publisher?: string | null
  provenanceType?: string | null
  accessedAt?: Date | string | null
  archivedUrl?: string | null
  isDuplicate?: boolean
}

export type SourceDocMetadataDatabaseSnapshot = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  doi: string | null
  publisher: string | null
  provenanceType: string
  accessedAt: Date | string | null
  archivedUrl: string | null
  isDuplicate: boolean
  documentId: string | null
}

export type ReviewedSourceDocMetadataTarget = {
  id: string
  metadata: SourceDocMetadataValues
  identity: SourceDocProtectedIdentity
}

export type SourceDocMetadataRepairConflict = {
  id: string
  code: 'missing_row' | 'duplicate_row' | 'protected_identity_drift' | 'metadata_snapshot_drift'
  detail: string
}

export type SourceDocMetadataRepairUpdate = {
  id: string
  changedFields: SourceDocMetadataField[]
  expected: SourceDocMetadataValues
  target: SourceDocMetadataValues
  protectedIdentity: SourceDocProtectedIdentity
  expectedDocumentId: string | null
  beforeRowSha256: string
  afterRowSha256: string
}

export type SourceDocMetadataRepairPlan = {
  version: 1
  pinnedBeforeBatchSha256: string
  targetAfterBatchSha256: string
  protectedIdentitySha256: string
  currentMetadataBatchSha256: string | null
  updates: SourceDocMetadataRepairUpdate[]
  alreadyAppliedIds: string[]
  observedDocumentIds: Record<string, string | null>
  conflicts: SourceDocMetadataRepairConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
    changedFieldCounts: Record<SourceDocMetadataField, number>
  }
}

function compareIds(left: { id: string }, right: { id: string }) {
  return left.id.localeCompare(right.id, undefined, { numeric: true })
}

function nullableText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function requiredText(value: unknown, field: string, id: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Reviewed seed ${id} is missing ${field}`)
  }
  return value
}

function dateOnly(value: Date | string | null | undefined) {
  if (!value) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.valueOf())) return null
  return parsed.toISOString().slice(0, 10)
}

export function sha256Json(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function sourceDocMetadataRow(
  id: string,
  values: SourceDocMetadataValues,
) {
  return {
    id,
    author: values.author,
    year: values.year,
    sourceType: values.sourceType,
    description: values.description,
    relevance: values.relevance,
    publisher: values.publisher,
  }
}

export function sourceDocIdentityRow(
  id: string,
  identity: SourceDocProtectedIdentity,
) {
  return {
    id,
    filename: identity.filename,
    title: identity.title,
    url: identity.url,
    doi: identity.doi,
    accessedAt: identity.accessedAt,
    archivedUrl: identity.archivedUrl,
    provenanceType: identity.provenanceType,
    isDuplicate: identity.isDuplicate,
  }
}

function seedTarget(seed: SourceDocMetadataSeedInput): ReviewedSourceDocMetadataTarget {
  return {
    id: seed.id,
    metadata: {
      author: nullableText(seed.author),
      year: seed.year == null ? null : String(seed.year),
      sourceType: requiredText(seed.type, 'type', seed.id),
      description: requiredText(seed.description, 'description', seed.id),
      relevance: requiredText(seed.relevance, 'relevance', seed.id),
      publisher: nullableText(seed.publisher),
    },
    identity: {
      filename: requiredText(seed.filename, 'filename', seed.id),
      title: nullableText(seed.title),
      url: nullableText(seed.url),
      doi: nullableText(seed.doi),
      accessedAt: dateOnly(seed.accessedAt),
      archivedUrl: nullableText(seed.archivedUrl),
      provenanceType: nullableText(seed.provenanceType) ?? 'unknown',
      isDuplicate: seed.isDuplicate ?? false,
    },
  }
}

export function buildReviewedSourceDocMetadataTargets(
  seedSources: SourceDocMetadataSeedInput[],
) {
  const expectedIds = new Set<string>(SOURCE_DOC_METADATA_REPAIR_IDS)
  const targets = seedSources
    .filter(source => expectedIds.has(source.id))
    .map(seedTarget)
    .sort(compareIds)

  if (
    targets.length !== SOURCE_DOC_METADATA_REPAIR_IDS.length ||
    new Set(targets.map(target => target.id)).size !== SOURCE_DOC_METADATA_REPAIR_IDS.length
  ) {
    throw new Error('Reviewed SourceDoc metadata seed contract must contain 14 unique rows')
  }
  const actualIds = targets.map(target => target.id)
  const pinnedIds = [...SOURCE_DOC_METADATA_REPAIR_IDS].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  )
  if (JSON.stringify(actualIds) !== JSON.stringify(pinnedIds)) {
    throw new Error('Reviewed SourceDoc metadata seed ids drifted from the pinned contract')
  }

  const afterHash = sha256Json(targets.map(target => sourceDocMetadataRow(target.id, target.metadata)))
  if (afterHash !== PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256) {
    throw new Error('Reviewed SourceDoc metadata seed values drifted from the pinned after-snapshot')
  }
  const identityHash = sha256Json(targets.map(target => sourceDocIdentityRow(target.id, target.identity)))
  if (identityHash !== PINNED_SOURCE_DOC_METADATA_IDENTITY_SHA256) {
    throw new Error('Reviewed SourceDoc protected identity drifted from the pinned seed contract')
  }
  return targets
}

function databaseMetadata(row: SourceDocMetadataDatabaseSnapshot): SourceDocMetadataValues {
  return {
    author: nullableText(row.author),
    year: row.year == null ? null : String(row.year),
    sourceType: requiredText(row.sourceType, 'sourceType', row.id),
    description: requiredText(row.description, 'description', row.id),
    relevance: requiredText(row.relevance, 'relevance', row.id),
    publisher: nullableText(row.publisher),
  }
}

function databaseIdentity(row: SourceDocMetadataDatabaseSnapshot): SourceDocProtectedIdentity {
  return {
    filename: requiredText(row.filename, 'filename', row.id),
    title: nullableText(row.title),
    url: nullableText(row.url),
    doi: nullableText(row.doi),
    accessedAt: dateOnly(row.accessedAt),
    archivedUrl: nullableText(row.archivedUrl),
    provenanceType: requiredText(row.provenanceType, 'provenanceType', row.id),
    isDuplicate: row.isDuplicate,
  }
}

export function changedSourceDocMetadataFields(
  current: SourceDocMetadataValues,
  target: SourceDocMetadataValues,
) {
  return SOURCE_DOC_METADATA_FIELDS.filter(field => current[field] !== target[field])
}

export function classifySourceDocMetadataSnapshot(
  id: string,
  current: SourceDocMetadataValues,
  target: SourceDocMetadataValues,
  pinnedBeforeRowSha256: string,
): 'pending' | 'applied' | 'conflict' {
  const currentHash = sha256Json(sourceDocMetadataRow(id, current))
  const afterHash = sha256Json(sourceDocMetadataRow(id, target))
  if (currentHash === afterHash) return 'applied'
  if (currentHash === pinnedBeforeRowSha256) return 'pending'
  return 'conflict'
}

export function buildSourceDocMetadataRepairPlan(
  databaseRows: SourceDocMetadataDatabaseSnapshot[],
  targets: ReviewedSourceDocMetadataTarget[],
): SourceDocMetadataRepairPlan {
  const conflicts: SourceDocMetadataRepairConflict[] = []
  const databaseById = new Map<string, SourceDocMetadataDatabaseSnapshot>()
  for (const row of [...databaseRows].sort(compareIds)) {
    if (databaseById.has(row.id)) {
      conflicts.push({ id: row.id, code: 'duplicate_row', detail: `Database snapshot repeats ${row.id}` })
      continue
    }
    databaseById.set(row.id, row)
  }

  const updates: SourceDocMetadataRepairUpdate[] = []
  const alreadyAppliedIds: string[] = []
  const observedDocumentIds: Record<string, string | null> = {}
  const currentRowsForHash: ReturnType<typeof sourceDocMetadataRow>[] = []
  const changedFieldCounts = Object.fromEntries(
    SOURCE_DOC_METADATA_FIELDS.map(field => [field, 0]),
  ) as Record<SourceDocMetadataField, number>

  for (const target of [...targets].sort(compareIds)) {
    const currentRow = databaseById.get(target.id)
    if (!currentRow) {
      conflicts.push({ id: target.id, code: 'missing_row', detail: `SourceDoc is missing: ${target.id}` })
      continue
    }
    observedDocumentIds[target.id] = currentRow.documentId
    const currentMetadata = databaseMetadata(currentRow)
    const currentIdentity = databaseIdentity(currentRow)
    currentRowsForHash.push(sourceDocMetadataRow(target.id, currentMetadata))

    if (JSON.stringify(currentIdentity) !== JSON.stringify(target.identity)) {
      const identityFields = Object.keys(target.identity).filter(key =>
        currentIdentity[key as keyof SourceDocProtectedIdentity] !==
          target.identity[key as keyof SourceDocProtectedIdentity],
      )
      conflicts.push({
        id: target.id,
        code: 'protected_identity_drift',
        detail: `Protected SourceDoc fields drifted for ${target.id}: ${identityFields.join(', ')}`,
      })
      continue
    }

    const beforeRowSha256 = PINNED_SOURCE_DOC_METADATA_BEFORE_ROW_SHA256[target.id]
    if (!beforeRowSha256) {
      conflicts.push({
        id: target.id,
        code: 'metadata_snapshot_drift',
        detail: `Pinned before-row hash is missing for ${target.id}`,
      })
      continue
    }
    const status = classifySourceDocMetadataSnapshot(
      target.id,
      currentMetadata,
      target.metadata,
      beforeRowSha256,
    )
    if (status === 'applied') {
      alreadyAppliedIds.push(target.id)
      continue
    }
    if (status === 'conflict') {
      conflicts.push({
        id: target.id,
        code: 'metadata_snapshot_drift',
        detail: `Metadata for ${target.id} matches neither pinned before nor reviewed after snapshot`,
      })
      continue
    }

    const changedFields = changedSourceDocMetadataFields(currentMetadata, target.metadata)
    for (const field of changedFields) changedFieldCounts[field] += 1
    updates.push({
      id: target.id,
      changedFields,
      expected: currentMetadata,
      target: target.metadata,
      protectedIdentity: target.identity,
      expectedDocumentId: currentRow.documentId,
      beforeRowSha256,
      afterRowSha256: sha256Json(sourceDocMetadataRow(target.id, target.metadata)),
    })
  }

  const currentMetadataBatchSha256 = currentRowsForHash.length === targets.length
    ? sha256Json(currentRowsForHash.sort(compareIds))
    : null

  return {
    version: 1,
    pinnedBeforeBatchSha256: PINNED_SOURCE_DOC_METADATA_BEFORE_BATCH_SHA256,
    targetAfterBatchSha256: PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256,
    protectedIdentitySha256: PINNED_SOURCE_DOC_METADATA_IDENTITY_SHA256,
    currentMetadataBatchSha256,
    updates: updates.sort(compareIds),
    alreadyAppliedIds: alreadyAppliedIds.sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    ),
    observedDocumentIds: Object.fromEntries(Object.entries(observedDocumentIds).sort()),
    conflicts: conflicts.sort((left, right) => compareIds(left, right) || left.code.localeCompare(right.code)),
    summary: {
      total: targets.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
      changedFieldCounts,
    },
  }
}

export function sourceDocMetadataRepairPlanContract(plan: SourceDocMetadataRepairPlan) {
  return {
    version: plan.version,
    pinnedBeforeBatchSha256: plan.pinnedBeforeBatchSha256,
    targetAfterBatchSha256: plan.targetAfterBatchSha256,
    protectedIdentitySha256: plan.protectedIdentitySha256,
    currentMetadataBatchSha256: plan.currentMetadataBatchSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    observedDocumentIds: plan.observedDocumentIds,
    conflicts: plan.conflicts,
  }
}
