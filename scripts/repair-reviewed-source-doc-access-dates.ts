import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'
import {
  PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  type PortableSourceDocIdentitySnapshot,
  type ReviewedSourceDocIdentityRepairId,
} from '../src/lib/citations/reviewed-source-doc-identity-repair'

const APPLY_ACK = 'APPLY_REVIEWED_SOURCE_DOC_ACCESS_DATES_2026_07_20'
const ADVISORY_LOCK_KEY =
  'foodsystems:reviewed-source-doc-access-dates:2026-07-20:v1'
const MANIFEST_PATH = fileURLToPath(
  new URL(
    '../research/_status/source-doc-access-date-review-manifest-2026-07-20.json',
    import.meta.url,
  ),
)
const QUEUE_PATH = fileURLToPath(
  new URL(
    '../research/_status/academic-source-quality-repair-queue.json',
    import.meta.url,
  ),
)

export const REVIEWED_SOURCE_DOC_ACCESS_DATE = '2026-07-20'
export const PINNED_SOURCE_DOC_ORIGINAL_QUEUE_GENERATED_AT =
  '2026-07-19T23:10:41.682Z'
export const PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256 =
  'e4182127bcc225e0baf2f40a705cf9ad66880df92f2e3ce87704942189d4c89b'
export const PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT =
  '2026-07-20T01:07:08.914Z'
export const PINNED_PRE_RECONCILIATION_ACCESS_ROWS_SHA256 =
  'b1b819e56c2dc2e8a7fbdcbba137a313cc773d9366a42085afa6f516629563e5'
export const PINNED_CURRENT_RECONCILED_ACCESS_ROWS_SHA256 =
  'edf8fad9d36a6f9f87609c8f19e468d472ba21d6f5376432166a94ef4c3f35e7'

export type SourceDocAccessReviewClassification =
  | 'exact_verified'
  | 'locator_repair_verified'
  | 'generic_or_misbound_unresolved'
  | 'bot_only_unverified'
  | 'dead_unresolved'

export type SourceDocAccessReviewRow = {
  id: string
  title: string
  urlBefore: string
  urlAfter: string
  classification: SourceDocAccessReviewClassification
  accessDate: string | null
  evidenceKind: string
  evidenceLocator: string
  evidenceSha256: string | null
  evidenceNote: string
  bibliographicCaveat: string | null
  unresolvedReason: string | null
  queueRowSha256: string
  seedRowSha256: string
}

export type LinkedSourceDocDocumentDisposition = {
  sourceDocId: string
  urlBefore: string
  urlAfter: string
  accessDate: string
  reason: string
}

type SourceDocAccessReviewManifest = {
  version: 1
  reviewedAt: string
  timezone: string
  queuePath: string
  queueGeneratedAt: string
  scopeCount: number
  mutationTargetCount: number
  classificationCounts: Record<SourceDocAccessReviewClassification, number>
  mutationScope: string
  proofBoundary: string
  linkedDocumentUpdates: LinkedSourceDocDocumentDisposition[]
  rows: SourceDocAccessReviewRow[]
}

export type QueueSourceDocRow = {
  set: 'SourceDoc'
  id: string
  title: string
  url: string
  nextAction: string
}

export type QueueAccessDateRow = {
  set: string
  id: string
  title: string
  url: string
  nextAction: string
}

export type SourceDocAccessReviewQueue = {
  generatedAt: string
  accessDateReviewRows: Array<QueueAccessDateRow | { set: string }>
}

export type SourceDocAccessReviewQueueState = {
  mode:
    | 'original_scope'
    | 'pre_reconciliation_residual'
    | 'current_reconciled_residual'
  rows: QueueSourceDocRow[]
  accessDateRowsSha256: string
}

export type SourceDocSeedSnapshot = {
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
  accessedAt: string | null
  archivedUrl: string | null
}

export type SourceDocDatabaseSnapshot = Omit<
  SourceDocSeedSnapshot,
  'accessedAt'
> & {
  accessedAt: string | null
  documentId: string | null
}

export type SourceDocAccessDateConflict = {
  id: string
  detail: string
}

export type SourceDocAccessDateUpdate = {
  target: SourceDocAccessReviewRow
  beforeSnapshot: SourceDocDatabaseSnapshot
  beforeSha256: string
  afterSha256: string
}

export type LinkedSourceDocDocumentSnapshot = {
  sourceDocId: string
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
  accessedAt: string | null
  archivedUrl: string | null
  wordCount: number
  tags: string[]
  metadata: unknown | null
  createdAt: string
  updatedAt: string
}

export type LinkedSourceDocDocumentUpdate = {
  sourceDocId: string
  beforeSnapshot: LinkedSourceDocDocumentSnapshot
  beforeSha256: string
  urlAfter: string
  accessDate: string
}

export type LinkedSourceDocDocumentAlreadyApplied = {
  sourceDocId: string
  snapshot: LinkedSourceDocDocumentSnapshot
  snapshotSha256: string
}

export type SourceDocAccessDateRepairPlan = {
  version: 1
  manifestSha256: string
  identityManifestSha256: string
  updates: SourceDocAccessDateUpdate[]
  alreadyAppliedIds: string[]
  identityStates: SourceDocIdentityCompatibilityState[]
  linkedDocumentUpdates: LinkedSourceDocDocumentUpdate[]
  linkedDocumentsAlreadyApplied: LinkedSourceDocDocumentAlreadyApplied[]
  conflicts: SourceDocAccessDateConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    identityCompatible: number
    linkedDocumentPending: number
    linkedDocumentAlreadyApplied: number
    conflicts: number
  }
}

export type SourceDocIdentityCompatibilityState = {
  id: ReviewedSourceDocIdentityRepairId
  state: 'historical_post_access_pre_identity' | 'post_identity'
  snapshotSha256: string
}

const CLASSIFICATIONS: readonly SourceDocAccessReviewClassification[] = [
  'exact_verified',
  'locator_repair_verified',
  'generic_or_misbound_unresolved',
  'bot_only_unverified',
  'dead_unresolved',
]

const EXPECTED_CLASSIFICATION_COUNTS: Record<
  SourceDocAccessReviewClassification,
  number
> = {
  exact_verified: 37,
  locator_repair_verified: 11,
  generic_or_misbound_unresolved: 7,
  bot_only_unverified: 0,
  dead_unresolved: 2,
}

const EXPECTED_REPAIR_IDS = [
  'src-137',
  'src-142',
  'src-148',
  'src-149',
  'src-15',
  'src-151',
  'src-164',
  'src-173',
  'src-26',
  'src-80',
  'src-94',
] as const

const EXPECTED_UNRESOLVED_IDS = [
  'src-143',
  'src-152',
  'src-16',
  'src-17',
  'src-18',
  'src-24',
  'src-54',
  'src-74',
  'src-97',
] as const

const EXPECTED_LINKED_DOCUMENT_UPDATE_IDS = [
  'src-137',
  'src-148',
  'src-149',
  'src-173',
  'src-80',
] as const

const SOURCE_DOC_SNAPSHOT_FIELDS = [
  'id',
  'filename',
  'title',
  'author',
  'year',
  'sourceType',
  'description',
  'relevance',
  'url',
  'isDuplicate',
  'doi',
  'publisher',
  'provenanceType',
  'accessedAt',
  'archivedUrl',
  'documentId',
] as const

function sha256(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex')
}

function sha256Json(value: unknown) {
  return sha256(JSON.stringify(value))
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort()
        .map((key) => [
          key,
          canonicalize((value as Record<string, unknown>)[key]),
        ]),
    )
  }
  return value
}

function canonicalSha256Json(value: unknown) {
  return sha256(JSON.stringify(canonicalize(value)))
}

function absoluteHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function sorted(values: readonly string[]) {
  return [...values].sort()
}

function exactStrings(actual: readonly string[], expected: readonly string[]) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected))
}

export function validateSourceDocAccessReviewQueue(
  queue: SourceDocAccessReviewQueue,
  expectedOriginalIds: readonly string[],
  expectedGeneratedAt = PINNED_SOURCE_DOC_ORIGINAL_QUEUE_GENERATED_AT,
): SourceDocAccessReviewQueueState {
  const accessDateRows = queue.accessDateReviewRows
    .filter(
      (row): row is QueueAccessDateRow =>
        typeof row.set === 'string' &&
        typeof (row as QueueAccessDateRow).id === 'string' &&
        typeof (row as QueueAccessDateRow).title === 'string' &&
        typeof (row as QueueAccessDateRow).url === 'string' &&
        typeof (row as QueueAccessDateRow).nextAction === 'string',
    )
    .sort(
      (left, right) =>
        left.set.localeCompare(right.set) || left.id.localeCompare(right.id),
    )
  const rows = accessDateRows.filter(
    (row): row is QueueSourceDocRow => row.set === 'SourceDoc',
  )
  const ids = rows.map(row => row.id)
  const keys = accessDateRows.map(row => `${row.set}:${row.id}`)
  const structurallyComplete =
    accessDateRows.length === queue.accessDateReviewRows.length
  const unique = new Set(keys).size === keys.length
  const accessDateRowsSha256 = canonicalSha256Json(accessDateRows)
  const original =
    queue.generatedAt === expectedGeneratedAt &&
    structurallyComplete &&
    accessDateRows.length === 57 &&
    rows.length === 57 &&
    unique &&
    exactStrings(ids, expectedOriginalIds)
  const preReconciliationResidual =
    queue.generatedAt === PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT &&
    structurallyComplete &&
    accessDateRows.length === 38 &&
    rows.length === 23 &&
    unique &&
    accessDateRowsSha256 ===
      PINNED_PRE_RECONCILIATION_ACCESS_ROWS_SHA256
  const currentReconciledResidual =
    queue.generatedAt !== expectedGeneratedAt &&
    queue.generatedAt !== PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT &&
    structurallyComplete &&
    Number.isFinite(Date.parse(queue.generatedAt)) &&
    Date.parse(queue.generatedAt) >
      Date.parse(PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT) &&
    accessDateRows.length === 29 &&
    rows.length === 20 &&
    unique &&
    accessDateRowsSha256 ===
      PINNED_CURRENT_RECONCILED_ACCESS_ROWS_SHA256

  if (
    !original &&
    !preReconciliationResidual &&
    !currentReconciledResidual
  ) {
    throw new Error(
      'Academic source-quality queue must match the exact pinned original, pre-reconciliation, or current reconciled residual contract',
    )
  }
  const mode = original
    ? 'original_scope'
    : preReconciliationResidual
      ? 'pre_reconciliation_residual'
      : 'current_reconciled_residual'
  return {
    mode,
    rows,
    accessDateRowsSha256,
  }
}

function loadQueueSourceDocRows(
  expectedGeneratedAt: string,
  expectedOriginalIds: readonly string[],
): SourceDocAccessReviewQueueState {
  const queue = JSON.parse(
    readFileSync(QUEUE_PATH, 'utf8'),
  ) as SourceDocAccessReviewQueue
  return validateSourceDocAccessReviewQueue(
    queue,
    expectedOriginalIds,
    expectedGeneratedAt,
  )
}

function loadReviewedManifest(): SourceDocAccessReviewManifest {
  const raw = readFileSync(MANIFEST_PATH)
  if (sha256(raw) !== PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256) {
    throw new Error(
      'Reviewed SourceDoc access-date manifest drifted from its pinned SHA-256',
    )
  }
  const manifest = JSON.parse(
    raw.toString('utf8'),
  ) as SourceDocAccessReviewManifest
  if (
    manifest.version !== 1 ||
    manifest.reviewedAt !== REVIEWED_SOURCE_DOC_ACCESS_DATE ||
    manifest.timezone !== 'Europe/Oslo' ||
    manifest.queuePath !==
      'research/_status/academic-source-quality-repair-queue.json' ||
    manifest.queueGeneratedAt !==
      PINNED_SOURCE_DOC_ORIGINAL_QUEUE_GENERATED_AT ||
    manifest.scopeCount !== 57 ||
    manifest.mutationTargetCount !== 48 ||
    !manifest.mutationScope ||
    !manifest.proofBoundary ||
    !Array.isArray(manifest.linkedDocumentUpdates) ||
    manifest.linkedDocumentUpdates.length !== 5 ||
    manifest.rows.length !== manifest.scopeCount
  ) {
    throw new Error('Reviewed SourceDoc access-date manifest header is invalid')
  }
  for (const classification of CLASSIFICATIONS) {
    if (
      manifest.classificationCounts[classification] !==
      EXPECTED_CLASSIFICATION_COUNTS[classification]
    ) {
      throw new Error(
        `Reviewed manifest classification count drifted: ${classification}`,
      )
    }
  }
  if (
    new Set(manifest.rows.map((row) => row.id)).size !== manifest.rows.length
  ) {
    throw new Error(
      'Reviewed SourceDoc access-date manifest contains duplicate ids',
    )
  }

  if (
    !exactStrings(
      manifest.linkedDocumentUpdates.map((row) => row.sourceDocId),
      EXPECTED_LINKED_DOCUMENT_UPDATE_IDS,
    ) ||
    new Set(manifest.linkedDocumentUpdates.map((row) => row.sourceDocId))
      .size !== 5
  ) {
    throw new Error('Reviewed linked Document update ids drifted')
  }

  for (const disposition of manifest.linkedDocumentUpdates) {
    const review = manifest.rows.find(
      (row) => row.id === disposition.sourceDocId,
    )
    if (
      !review ||
      review.classification !== 'locator_repair_verified' ||
      disposition.urlBefore !== review.urlBefore ||
      disposition.urlAfter !== review.urlAfter ||
      disposition.accessDate !== REVIEWED_SOURCE_DOC_ACCESS_DATE ||
      !disposition.reason
    ) {
      throw new Error(
        `Reviewed linked Document disposition drifted: ${disposition.sourceDocId}`,
      )
    }
  }

  const queueState = loadQueueSourceDocRows(
    manifest.queueGeneratedAt,
    manifest.rows.map(row => row.id),
  )
  for (const row of manifest.rows) {
    const queueMatches = queueState.rows.filter(
      (candidate) => candidate.id === row.id,
    )
    const verified =
      row.classification === 'exact_verified' ||
      row.classification === 'locator_repair_verified'
    const completedByIdentityRepair =
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
        row.id as ReviewedSourceDocIdentityRepairId,
      )
    const queueRowMustBePresent =
      queueState.mode === 'original_scope' ||
      (!verified &&
        !(
          queueState.mode === 'current_reconciled_residual' &&
          completedByIdentityRepair
        ))
    const queueIdentityMatches = queueRowMustBePresent
      ? queueMatches.length === 1 &&
        sha256Json(queueMatches[0]) === row.queueRowSha256 &&
        queueMatches[0]!.title === row.title &&
        queueMatches[0]!.url === row.urlBefore
      : queueMatches.length === 0
    if (
      !row.id ||
      !row.title ||
      !CLASSIFICATIONS.includes(row.classification) ||
      !absoluteHttpUrl(row.urlBefore) ||
      !absoluteHttpUrl(row.urlAfter) ||
      !row.evidenceKind ||
      !row.evidenceLocator.startsWith('https://') ||
      !row.evidenceNote ||
      !/^[a-f0-9]{64}$/u.test(row.queueRowSha256) ||
      !/^[a-f0-9]{64}$/u.test(row.seedRowSha256) ||
      (row.evidenceSha256 !== null &&
        !/^[a-f0-9]{64}$/u.test(row.evidenceSha256)) ||
      !queueIdentityMatches
    ) {
      throw new Error(
        `Reviewed SourceDoc access-date row is invalid: ${row.id || '<missing id>'}`,
      )
    }
    if (verified) {
      if (
        row.accessDate !== REVIEWED_SOURCE_DOC_ACCESS_DATE ||
        row.unresolvedReason !== null
      ) {
        throw new Error(
          `Verified SourceDoc row has an invalid mutation target: ${row.id}`,
        )
      }
    } else if (
      row.accessDate !== null ||
      row.urlAfter !== row.urlBefore ||
      !row.unresolvedReason
    ) {
      throw new Error(
        `Unresolved SourceDoc row must remain unchanged with a reason: ${row.id}`,
      )
    }
    if (
      row.classification === 'exact_verified' &&
      row.urlAfter !== row.urlBefore
    ) {
      throw new Error(
        `Exact SourceDoc row unexpectedly repairs a locator: ${row.id}`,
      )
    }
    if (
      row.classification === 'locator_repair_verified' &&
      row.urlAfter === row.urlBefore
    ) {
      throw new Error(
        `Locator-repair SourceDoc row has no locator change: ${row.id}`,
      )
    }
  }

  const repairIds = manifest.rows
    .filter((row) => row.urlAfter !== row.urlBefore)
    .map((row) => row.id)
  const unresolvedIds = manifest.rows
    .filter((row) => row.accessDate === null)
    .map((row) => row.id)
  if (!exactStrings(repairIds, EXPECTED_REPAIR_IDS)) {
    throw new Error('Reviewed SourceDoc locator-repair ids drifted')
  }
  if (!exactStrings(unresolvedIds, EXPECTED_UNRESOLVED_IDS)) {
    throw new Error('Reviewed unresolved SourceDoc ids drifted')
  }
  return manifest
}

const reviewedManifest = loadReviewedManifest()

export const REVIEWED_SOURCE_DOC_ACCESS_ROWS: readonly SourceDocAccessReviewRow[] =
  reviewedManifest.rows.map((row) => ({ ...row }))

export const REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS: readonly SourceDocAccessReviewRow[] =
  REVIEWED_SOURCE_DOC_ACCESS_ROWS.filter((row) => row.accessDate !== null)

export const UNRESOLVED_SOURCE_DOC_ACCESS_ROWS: readonly SourceDocAccessReviewRow[] =
  REVIEWED_SOURCE_DOC_ACCESS_ROWS.filter((row) => row.accessDate === null)

export const REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES: readonly LinkedSourceDocDocumentDisposition[] =
  reviewedManifest.linkedDocumentUpdates.map((row) => ({ ...row }))

export const REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS = Object.freeze([
  ...REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.map((target) => target.id),
  ...REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
]) as readonly string[]

if (
  REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS.length !== 51 ||
  new Set(REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS).size !== 51 ||
  !REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.every((id) =>
    UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.some((row) => row.id === id),
  )
) {
  throw new Error(
    'Reviewed SourceDoc access-date and identity inspection scopes overlap or drifted',
  )
}

export function normalizeSourceDocSeedSnapshot(
  row: (typeof sources)[number],
): SourceDocSeedSnapshot {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title ?? null,
    author: row.author ?? null,
    year: row.year == null ? null : String(row.year),
    sourceType: row.type,
    description: row.description,
    relevance: row.relevance,
    url: row.url ?? null,
    isDuplicate: row.isDuplicate ?? false,
    doi: row.doi ?? null,
    publisher: row.publisher ?? null,
    provenanceType: row.provenanceType ?? 'unknown',
    accessedAt: row.accessedAt ?? null,
    archivedUrl: row.archivedUrl ?? null,
  }
}

function sourceDocSeedSnapshotSha256(snapshot: SourceDocSeedSnapshot) {
  return sha256Json(snapshot)
}

function sourceDocDatabaseSnapshotSha256(snapshot: SourceDocDatabaseSnapshot) {
  return sha256Json(snapshot)
}

function accessDateIso(accessDate: string) {
  return new Date(`${accessDate}T00:00:00.000Z`).toISOString()
}

function identitySnapshotAsSeedSnapshot(
  snapshot: PortableSourceDocIdentitySnapshot,
): SourceDocSeedSnapshot {
  return {
    id: snapshot.id,
    filename: snapshot.filename,
    title: snapshot.title,
    author: snapshot.author,
    year: snapshot.year == null ? null : String(snapshot.year),
    sourceType: snapshot.sourceType,
    description: snapshot.description,
    relevance: snapshot.relevance,
    url: snapshot.url,
    isDuplicate: snapshot.isDuplicate,
    doi: snapshot.doi,
    publisher: snapshot.publisher,
    provenanceType: snapshot.provenanceType,
    accessedAt: snapshot.accessedAt,
    archivedUrl: snapshot.archivedUrl,
  }
}

const reviewedIdentityRepairs = new Map(
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => [repair.id, repair]),
)

export function validateSourceDocAccessDateManifest() {
  loadReviewedManifest()
}

export function validateSourceDocAccessDateSeedRows(
  rows: typeof sources = sources,
) {
  validateSourceDocAccessDateManifest()
  for (const target of REVIEWED_SOURCE_DOC_ACCESS_ROWS) {
    const matches = rows.filter((row) => row.id === target.id)
    if (matches.length !== 1) {
      throw new Error(
        `Expected exactly one seed SourceDoc for ${target.id}; found ${matches.length}`,
      )
    }
    const snapshot = normalizeSourceDocSeedSnapshot(matches[0]!)
    const digest = sourceDocSeedSnapshotSha256(snapshot)
    const identityRepair = reviewedIdentityRepairs.get(
      target.id as ReviewedSourceDocIdentityRepairId,
    )
    if (identityRepair) {
      const historicalSnapshot = identitySnapshotAsSeedSnapshot(
        identityRepair.before,
      )
      const postIdentitySnapshot = identitySnapshotAsSeedSnapshot(
        identityRepair.after,
      )
      if (
        sourceDocSeedSnapshotSha256(historicalSnapshot) !==
          target.seedRowSha256 ||
        target.accessDate !== null ||
        historicalSnapshot.url !== target.urlBefore ||
        historicalSnapshot.accessedAt !== null
      ) {
        throw new Error(
          `Historical SourceDoc identity evidence contract drifted: ${target.id}`,
        )
      }
      if (
        digest !== sourceDocSeedSnapshotSha256(historicalSnapshot) &&
        digest !== sourceDocSeedSnapshotSha256(postIdentitySnapshot)
      ) {
        throw new Error(
          `SourceDoc identity seed matches neither exact historical nor post-identity snapshot: ${target.id}`,
        )
      }
      continue
    }
    if (digest !== target.seedRowSha256) {
      throw new Error(
        `Full seed SourceDoc snapshot drifted for ${target.id}: ${digest}`,
      )
    }
    if (target.accessDate === null) {
      if (snapshot.accessedAt !== null || snapshot.url !== target.urlBefore) {
        throw new Error(`Unresolved seed SourceDoc changed: ${target.id}`)
      }
    } else if (
      snapshot.accessedAt !== target.accessDate ||
      snapshot.url !== target.urlAfter
    ) {
      throw new Error(
        `Reviewed seed SourceDoc target is not applied exactly: ${target.id}`,
      )
    }
  }
}

function snapshotsEqual(
  left: SourceDocDatabaseSnapshot,
  right: SourceDocDatabaseSnapshot,
) {
  return SOURCE_DOC_SNAPSHOT_FIELDS.every(
    (field) => JSON.stringify(left[field]) === JSON.stringify(right[field]),
  )
}

function snapshotDiff(
  actual: SourceDocDatabaseSnapshot,
  expected: SourceDocDatabaseSnapshot,
) {
  return SOURCE_DOC_SNAPSHOT_FIELDS.filter(
    (field) =>
      JSON.stringify(actual[field]) !== JSON.stringify(expected[field]),
  )
}

function seedAsDatabaseSnapshot(
  seed: SourceDocSeedSnapshot,
  target: SourceDocAccessReviewRow,
  state: 'before' | 'after',
  documentId: string | null,
): SourceDocDatabaseSnapshot {
  const { accessedAt: _seedAccessedAt, ...metadata } = seed
  return {
    ...metadata,
    url: state === 'before' ? target.urlBefore : target.urlAfter,
    accessedAt: state === 'before' ? null : accessDateIso(target.accessDate!),
    documentId,
  }
}

function identitySnapshotAsDatabaseSnapshot(
  snapshot: PortableSourceDocIdentitySnapshot,
  documentId: string | null,
): SourceDocDatabaseSnapshot {
  return {
    ...identitySnapshotAsSeedSnapshot(snapshot),
    accessedAt:
      snapshot.accessedAt === null ? null : accessDateIso(snapshot.accessedAt),
    documentId,
  }
}

export function buildSourceDocAccessDateRepairPlan(
  rows: readonly SourceDocDatabaseSnapshot[],
  documents: readonly LinkedSourceDocDocumentSnapshot[] = [],
): SourceDocAccessDateRepairPlan {
  validateSourceDocAccessDateSeedRows()
  const updates: SourceDocAccessDateUpdate[] = []
  const alreadyAppliedIds: string[] = []
  const identityStates: SourceDocIdentityCompatibilityState[] = []
  const linkedDocumentUpdates: LinkedSourceDocDocumentUpdate[] = []
  const linkedDocumentsAlreadyApplied: LinkedSourceDocDocumentAlreadyApplied[] =
    []
  const conflicts: SourceDocAccessDateConflict[] = []

  for (const target of REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS) {
    const matches = rows.filter((row) => row.id === target.id)
    if (matches.length !== 1) {
      conflicts.push({
        id: target.id,
        detail: `Expected exactly one database row; found ${matches.length}.`,
      })
      continue
    }
    const row = matches[0]!
    const seedRow = sources.find((candidate) => candidate.id === target.id)!
    const reviewedSeed = normalizeSourceDocSeedSnapshot(seedRow)
    const beforeSnapshot = seedAsDatabaseSnapshot(
      reviewedSeed,
      target,
      'before',
      row.documentId,
    )
    const afterSnapshot = seedAsDatabaseSnapshot(
      reviewedSeed,
      target,
      'after',
      row.documentId,
    )

    if (snapshotsEqual(row, afterSnapshot)) {
      alreadyAppliedIds.push(target.id)
    } else if (snapshotsEqual(row, beforeSnapshot)) {
      updates.push({
        target,
        beforeSnapshot,
        beforeSha256: sourceDocDatabaseSnapshotSha256(beforeSnapshot),
        afterSha256: sourceDocDatabaseSnapshotSha256(afterSnapshot),
      })
    } else {
      conflicts.push({
        id: target.id,
        detail: `Full reviewed database snapshot drifted: ${snapshotDiff(row, beforeSnapshot).join(', ')}.`,
      })
    }
  }

  for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
    const matches = rows.filter((row) => row.id === repair.id)
    if (matches.length !== 1) {
      conflicts.push({
        id: repair.id,
        detail: `Expected exactly one identity-reconciled database row; found ${matches.length}.`,
      })
      continue
    }
    const row = matches[0]!
    const historicalSnapshot = identitySnapshotAsDatabaseSnapshot(
      repair.before,
      row.documentId,
    )
    const postIdentitySnapshot = identitySnapshotAsDatabaseSnapshot(
      repair.after,
      row.documentId,
    )
    if (snapshotsEqual(row, historicalSnapshot)) {
      identityStates.push({
        id: repair.id,
        state: 'historical_post_access_pre_identity',
        snapshotSha256: sourceDocDatabaseSnapshotSha256(historicalSnapshot),
      })
    } else if (snapshotsEqual(row, postIdentitySnapshot)) {
      identityStates.push({
        id: repair.id,
        state: 'post_identity',
        snapshotSha256: sourceDocDatabaseSnapshotSha256(postIdentitySnapshot),
      })
    } else {
      conflicts.push({
        id: repair.id,
        detail:
          'Identity-reconciled SourceDoc matches neither exact historical nor post-identity snapshot; ' +
          `historical diff: ${snapshotDiff(row, historicalSnapshot).join(', ')}; ` +
          `post-identity diff: ${snapshotDiff(row, postIdentitySnapshot).join(', ')}.`,
      })
    }
  }

  for (const disposition of REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES) {
    const sourceDoc = rows.find((row) => row.id === disposition.sourceDocId)
    const matchingDocuments = documents.filter(
      (document) => document.sourceDocId === disposition.sourceDocId,
    )
    const document = matchingDocuments[0]
    if (
      !sourceDoc ||
      sourceDoc.documentId === null ||
      matchingDocuments.length !== 1 ||
      !document ||
      document.id !== sourceDoc.documentId
    ) {
      conflicts.push({
        id: `Document:${disposition.sourceDocId}`,
        detail:
          'Expected exactly one directly linked Document whose id matches SourceDoc.documentId.',
      })
      continue
    }

    const reviewedAccessDate = accessDateIso(disposition.accessDate)
    if (
      document.url === disposition.urlAfter &&
      document.accessedAt === reviewedAccessDate
    ) {
      linkedDocumentsAlreadyApplied.push({
        sourceDocId: disposition.sourceDocId,
        snapshot: document,
        snapshotSha256: canonicalSha256Json(document),
      })
    } else if (
      document.url === disposition.urlBefore &&
      document.accessedAt === null
    ) {
      linkedDocumentUpdates.push({
        sourceDocId: disposition.sourceDocId,
        beforeSnapshot: document,
        beforeSha256: canonicalSha256Json(document),
        urlAfter: disposition.urlAfter,
        accessDate: disposition.accessDate,
      })
    } else {
      conflicts.push({
        id: `Document:${disposition.sourceDocId}`,
        detail:
          'Linked Document URL/accessedAt matches neither the exact reviewed before state nor the reviewed after state; null and unrelated URLs are never filled or changed.',
      })
    }
  }

  return {
    version: 1,
    manifestSha256: PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256,
    identityManifestSha256:
      PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    identityStates,
    linkedDocumentUpdates,
    linkedDocumentsAlreadyApplied,
    conflicts,
    summary: {
      total: REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      identityCompatible: identityStates.length,
      linkedDocumentPending: linkedDocumentUpdates.length,
      linkedDocumentAlreadyApplied: linkedDocumentsAlreadyApplied.length,
      conflicts: conflicts.length,
    },
  }
}

export function sourceDocAccessDateRepairPlanSha256(
  plan: SourceDocAccessDateRepairPlan,
) {
  return canonicalSha256Json(plan)
}

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run'])
  for (const argument of argv) {
    if (
      !allowedFlags.has(argument) &&
      !argument.startsWith('--ack=') &&
      !argument.startsWith('--plan-sha256=')
    ) {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }
  const apply = argv.includes('--apply')
  if (apply && argv.includes('--dry-run')) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  return {
    apply,
    ack: argv
      .find((argument) => argument.startsWith('--ack='))
      ?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find((argument) => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

const sourceDocSelect = {
  id: true,
  filename: true,
  title: true,
  author: true,
  year: true,
  sourceType: true,
  description: true,
  relevance: true,
  url: true,
  isDuplicate: true,
  doi: true,
  publisher: true,
  provenanceType: true,
  accessedAt: true,
  archivedUrl: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect

const documentSelect = {
  id: true,
  slug: true,
  filePath: true,
  title: true,
  author: true,
  year: true,
  documentType: true,
  category: true,
  subcategory: true,
  country: true,
  content: true,
  summary: true,
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect

type SelectedSourceDoc = Prisma.SourceDocGetPayload<{
  select: typeof sourceDocSelect
}>
type SourceDocAccessDateClient = Pick<PrismaClient, 'sourceDoc' | 'document'>

function normalizeSelectedSourceDoc(
  row: SelectedSourceDoc,
): SourceDocDatabaseSnapshot {
  return {
    ...row,
    accessedAt: row.accessedAt?.toISOString() ?? null,
  }
}

async function inspectSourceDocAccessDates(client: SourceDocAccessDateClient) {
  const rows = await client.sourceDoc.findMany({
    where: {
      id: {
        in: [...REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS],
      },
    },
    select: sourceDocSelect,
    orderBy: { id: 'asc' },
  })
  const sourceDocIdByDocumentId = new Map(
    rows
      .filter(
        (row) =>
          REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.some(
            (disposition) => disposition.sourceDocId === row.id,
          ) && row.documentId !== null,
      )
      .map((row) => [row.documentId!, row.id]),
  )
  const documents = await client.document.findMany({
    where: { id: { in: [...sourceDocIdByDocumentId.keys()] } },
    select: documentSelect,
    orderBy: { id: 'asc' },
  })
  return buildSourceDocAccessDateRepairPlan(
    rows.map(normalizeSelectedSourceDoc),
    documents.map((document) => ({
      ...document,
      sourceDocId: sourceDocIdByDocumentId.get(document.id) ?? '',
      metadata: document.metadata,
      accessedAt: document.accessedAt?.toISOString() ?? null,
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString(),
    })),
  )
}

function printPlan(plan: SourceDocAccessDateRepairPlan, digest: string) {
  console.log('Reviewed SourceDoc access-date repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Reviewed manifest SHA-256: ${plan.manifestSha256}`)
  console.log(
    `Reviewed identity manifest SHA-256: ${plan.identityManifestSha256}`,
  )
  console.log(
    'Historical scope: 57; exact verified: 37; locator repairs: 11; unresolved: 9',
  )
  console.log(
    'Identity overlay: 3 read-only reconciliations; effective unresolved: 6',
  )
  console.log(
    `Mutation targets: ${plan.summary.total}; pending: ${plan.summary.pending}; ` +
      `already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  )
  console.log(
    `Linked Document mirrors: pending ${plan.summary.linkedDocumentPending}; ` +
      `already applied ${plan.summary.linkedDocumentAlreadyApplied}`,
  )
  for (const update of plan.updates) {
    const locator =
      update.target.urlBefore === update.target.urlAfter
        ? ''
        : `; locator ${update.target.urlBefore} -> ${update.target.urlAfter}`
    console.log(
      `Pending SourceDoc:${update.target.id} accessedAt null -> ${update.target.accessDate}${locator}; ` +
        `before ${update.beforeSha256}; after ${update.afterSha256}`,
    )
  }
  for (const id of plan.alreadyAppliedIds)
    console.log(`Already applied SourceDoc:${id}`)
  for (const identityState of plan.identityStates) {
    console.log(
      `Identity compatibility state SourceDoc:${identityState.id}; state ${identityState.state}; ` +
        `snapshot ${identityState.snapshotSha256}`,
    )
  }
  for (const update of plan.linkedDocumentUpdates) {
    console.log(
      `Pending linked Document:${update.sourceDocId} ${update.beforeSnapshot.url} -> ` +
        `${update.urlAfter}; accessedAt null -> ${update.accessDate}; before ${update.beforeSha256}`,
    )
  }
  for (const applied of plan.linkedDocumentsAlreadyApplied) {
    console.log(
      `Already applied linked Document:${applied.sourceDocId}; snapshot ${applied.snapshotSha256}`,
    )
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict SourceDoc:${conflict.id}: ${conflict.detail}`)
  }
  for (const unresolved of UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.filter(
    (row) =>
      !REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
        row.id as ReviewedSourceDocIdentityRepairId,
      ),
  )) {
    console.log(
      `Unresolved unchanged SourceDoc:${unresolved.id}: ${unresolved.unresolvedReason}`,
    )
  }
}

function fullSnapshotWhere(
  row: SourceDocDatabaseSnapshot,
): Prisma.SourceDocWhereInput {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    author: row.author,
    year: row.year,
    sourceType: row.sourceType,
    description: row.description,
    relevance: row.relevance,
    url: row.url,
    isDuplicate: row.isDuplicate,
    doi: row.doi,
    publisher: row.publisher,
    provenanceType: row.provenanceType,
    accessedAt: row.accessedAt === null ? null : new Date(row.accessedAt),
    archivedUrl: row.archivedUrl,
    documentId: row.documentId,
  }
}

function fullDocumentSnapshotWhere(
  row: LinkedSourceDocDocumentSnapshot,
): Prisma.DocumentWhereInput {
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
    content: row.content,
    summary: row.summary,
    url: row.url,
    accessedAt: row.accessedAt === null ? null : new Date(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: { equals: row.tags },
    metadata:
      row.metadata === null
        ? { equals: Prisma.DbNull }
        : { equals: row.metadata as Prisma.InputJsonValue },
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

async function findCasPreflightMismatches(
  client: SourceDocAccessDateClient,
  plan: SourceDocAccessDateRepairPlan,
) {
  const checks = await Promise.all(
    plan.updates.map(async (update) => ({
      id: update.target.id,
      count: await client.sourceDoc.count({
        where: fullSnapshotWhere(update.beforeSnapshot),
      }),
    })),
  )
  const documentChecks = await Promise.all(
    plan.linkedDocumentUpdates.map(async (update) => ({
      id: `Document:${update.sourceDocId}`,
      count: await client.document.count({
        where: fullDocumentSnapshotWhere(update.beforeSnapshot),
      }),
    })),
  )
  return [...checks, ...documentChecks].filter((check) => check.count !== 1)
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const ids = [...REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS]
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `)
  if (
    !exactStrings(
      locked.map((row) => row.id),
      ids,
    )
  ) {
    throw new Error(
      'Reviewed SourceDoc rows changed after planning; no rows updated',
    )
  }

  const linkedSourceDocIds = REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.map(
    (disposition) => disposition.sourceDocId,
  )
  const lockedDocuments = await transaction.$queryRaw<
    Array<{ sourceDocId: string; id: string }>
  >(Prisma.sql`
    SELECT s."id" AS "sourceDocId", d."id"
    FROM "SourceDoc" AS s
    JOIN "Document" AS d ON d."id" = s."documentId"
    WHERE s."id" IN (${Prisma.join(linkedSourceDocIds)})
    ORDER BY s."id"
    FOR UPDATE OF d
  `)
  if (
    !exactStrings(
      lockedDocuments.map((row) => row.sourceDocId),
      linkedSourceDocIds,
    )
  ) {
    throw new Error(
      'Reviewed linked Document rows changed after planning; no rows updated',
    )
  }
}

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  update: SourceDocAccessDateUpdate,
) {
  const result = await transaction.sourceDoc.updateMany({
    where: fullSnapshotWhere(update.beforeSnapshot),
    data: {
      url: update.target.urlAfter,
      accessedAt: new Date(accessDateIso(update.target.accessDate!)),
    },
  })
  if (result.count !== 1) {
    throw new Error(
      `Concurrent reviewed SourceDoc access-date CAS conflict: ${update.target.id}; no rows updated`,
    )
  }
}

async function applyLinkedDocumentUpdate(
  transaction: Prisma.TransactionClient,
  update: LinkedSourceDocDocumentUpdate,
) {
  const result = await transaction.document.updateMany({
    where: fullDocumentSnapshotWhere(update.beforeSnapshot),
    data: {
      url: update.urlAfter,
      accessedAt: new Date(accessDateIso(update.accessDate)),
    },
  })
  if (result.count !== 1) {
    throw new Error(
      `Concurrent linked Document mirror CAS conflict: ${update.sourceDocId}; no rows updated`,
    )
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/iu.test(
    message,
  )
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/u.test(args.expectedPlanSha256 ?? '')) {
    throw new Error(
      '--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run',
    )
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  validateSourceDocAccessDateSeedRows()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectSourceDocAccessDates(prisma)
    const digest = sourceDocAccessDateRepairPlanSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error(
        'Reviewed SourceDoc access-date conflicts detected; refusing mutation',
      )
    }
    const preflightMismatches = await findCasPreflightMismatches(prisma, plan)
    if (preflightMismatches.length > 0) {
      throw new Error(
        `SourceDoc access-date full-row CAS preflight mismatch: ${preflightMismatches.map((row) => row.id).join(', ')}`,
      )
    }
    console.log(
      `Full-row CAS preflight: ${plan.updates.length}/${plan.updates.length} SourceDoc and ` +
        `${plan.linkedDocumentUpdates.length}/${plan.linkedDocumentUpdates.length} linked Document ` +
        'exact pending snapshots matched',
    )

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} ` +
          `--plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        'Current plan differs from --plan-sha256; rerun dry-run and review the new plan',
      )
    }

    const applied = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `
        await lockReviewedRows(transaction)
        const lockedPlan = await inspectSourceDocAccessDates(transaction)
        if (
          lockedPlan.conflicts.length > 0 ||
          sourceDocAccessDateRepairPlanSha256(lockedPlan) !==
            args.expectedPlanSha256
        ) {
          throw new Error(
            'Concurrent reviewed SourceDoc snapshot drift detected; no rows updated',
          )
        }
        for (const update of lockedPlan.updates)
          await applyUpdate(transaction, update)
        for (const update of lockedPlan.linkedDocumentUpdates) {
          await applyLinkedDocumentUpdate(transaction, update)
        }
        const afterPlan = await inspectSourceDocAccessDates(transaction)
        if (
          afterPlan.conflicts.length > 0 ||
          afterPlan.updates.length > 0 ||
          afterPlan.alreadyAppliedIds.length !==
            REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.length ||
          afterPlan.identityStates.length !==
            REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length ||
          afterPlan.linkedDocumentUpdates.length > 0 ||
          afterPlan.linkedDocumentsAlreadyApplied.length !==
            REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.length
        ) {
          throw new Error(
            'Post-apply SourceDoc state did not match the reviewed target; no rows updated',
          )
        }
        return {
          sourceDocs: lockedPlan.updates.length,
          linkedDocuments: lockedPlan.linkedDocumentUpdates.length,
        }
      },
      { isolationLevel: 'Serializable' },
    )
    console.log(
      `Reviewed SourceDoc access-date repair applied: ${applied.sourceDocs} SourceDoc row(s), ` +
        `${applied.linkedDocuments} linked Document row(s)`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        'Reviewed SourceDoc access-date repair conflicted with a concurrent write; ' +
          `the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
        { cause: error },
      )
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : 'Reviewed SourceDoc access-date repair failed',
    )
    process.exitCode = 1
  })
}
