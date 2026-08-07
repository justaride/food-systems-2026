import { createHash } from 'node:crypto'

export const SEED_ONLY_REPORT_SYNC_IDS = [
  'food-systems-2026-pilot-funding-dossiers',
  'food-systems-2026-internal-artifact-register',
] as const

export const SEED_ONLY_REPORT_MANAGED_FIELDS = [
  'title',
  'fullTitle',
  'author',
  'institution',
  'date',
  'year',
  'sourceUrl',
  'reportCategory',
  'country',
  'keyFindings',
  'recommendations',
  'relevance',
  'tags',
  'doi',
  'isbn',
  'issn',
  'publisher',
  'provenanceType',
  'supportingSources',
  'accessedAt',
] as const

export const PINNED_SEED_ONLY_REPORT_TARGET_SHA256 =
  'bdfbde7eee91a28fc826ed54e2af6c53c4f91aac3b49a0933612a8306ef509b6'

export type SeedOnlyReportId = (typeof SEED_ONLY_REPORT_SYNC_IDS)[number]
export type SeedOnlyReportManagedField = (typeof SEED_ONLY_REPORT_MANAGED_FIELDS)[number]

export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue }

export type SeedOnlyReportSupportingSource = {
  label: string
  url?: string
  reportId?: string
  documentPath?: string
  note?: string
}

export type SeedOnlyReportSeedInput = {
  id: string
  title: string
  fullTitle?: string | null
  author?: string | null
  institution?: string | null
  date?: string | null
  year?: number | null
  sourceUrl?: string | null
  reportCategory: string
  country?: string | null
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi?: string | null
  isbn?: string | null
  issn?: string | null
  publisher?: string | null
  provenanceType?: string | null
  supportingSources?: SeedOnlyReportSupportingSource[]
  accessedAt?: Date | string | null
}

export type SeedOnlyReportTarget = {
  id: SeedOnlyReportId
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi: string | null
  isbn: string | null
  issn: string | null
  publisher: string | null
  provenanceType: string | null
  supportingSources: CanonicalJsonValue
  accessedAt: string | null
}

export type SeedOnlyReportDatabaseSnapshot = Omit<
  SeedOnlyReportTarget,
  'id' | 'supportingSources' | 'accessedAt'
> & {
  id: string
  supportingSources: unknown
  accessedAt: Date | string | null
  documentId: string | null
}

export type SeedOnlyReportCreate = {
  id: SeedOnlyReportId
  target: SeedOnlyReportTarget
  expectedAbsent: true
  targetRowSha256: string
}

export type SeedOnlyReportSyncConflict = {
  id: SeedOnlyReportId
  code: 'duplicate_snapshot' | 'existing_row_drift'
  changedFields: SeedOnlyReportManagedField[]
  detail: string
  currentRowSha256: string | null
}

export type SeedOnlyReportObservedState = {
  id: SeedOnlyReportId
  state: 'missing' | 'already_applied' | 'conflict'
  documentId: string | null
  currentRowSha256: string | null
}

export type SeedOnlyReportSyncPlan = {
  version: 1
  targetManifestSha256: string
  creates: SeedOnlyReportCreate[]
  alreadyAppliedIds: SeedOnlyReportId[]
  observed: SeedOnlyReportObservedState[]
  conflicts: SeedOnlyReportSyncConflict[]
  summary: {
    total: number
    pendingCreates: number
    alreadyApplied: number
    conflicts: number
  }
}

function compareIds(left: { id: string }, right: { id: string }) {
  return left.id.localeCompare(right.id)
}

function nullableText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function requiredText(value: unknown, field: string, id: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Seed-only Report ${id} is missing ${field}`)
  }
  return value
}

function stringArray(value: unknown, field: string, id: string) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`Seed-only Report ${id} has invalid ${field}`)
  }
  return [...value] as string[]
}

function optionalYear(value: unknown, id: string) {
  if (value == null) return null
  if (!Number.isInteger(value)) throw new Error(`Seed-only Report ${id} has invalid year`)
  return value as number
}

function isoDate(value: Date | string | null | undefined, field: string, id: string) {
  if (value == null) return null
  const parsed = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(value)
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Seed-only Report ${id} has invalid ${field}`)
  }
  return parsed.toISOString()
}

export function canonicalizeSeedOnlyReportJson(value: unknown): CanonicalJsonValue {
  if (value === null) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Report JSON contains a non-finite number')
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalizeSeedOnlyReportJson)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map(key => [key, canonicalizeSeedOnlyReportJson(record[key])]),
    )
  }
  throw new Error(`Report JSON contains unsupported value type: ${typeof value}`)
}

function normalizeSupportingSources(
  sources: SeedOnlyReportSupportingSource[] | undefined,
  id: string,
): CanonicalJsonValue {
  if (!sources || sources.length === 0) return null
  return canonicalizeSeedOnlyReportJson(sources.map(source => ({
    label: requiredText(source.label, 'supportingSources.label', id),
    ...(source.url ? { url: source.url } : {}),
    ...(source.reportId ? { reportId: source.reportId } : {}),
    ...(source.documentPath ? { documentPath: source.documentPath } : {}),
    ...(source.note ? { note: source.note } : {}),
  })))
}

function normalizeSeedReport(seed: SeedOnlyReportSeedInput): SeedOnlyReportTarget {
  if (!SEED_ONLY_REPORT_SYNC_IDS.includes(seed.id as SeedOnlyReportId)) {
    throw new Error(`Unexpected seed-only Report id: ${seed.id}`)
  }
  return {
    id: seed.id as SeedOnlyReportId,
    title: requiredText(seed.title, 'title', seed.id),
    fullTitle: nullableText(seed.fullTitle),
    author: nullableText(seed.author),
    institution: nullableText(seed.institution),
    date: nullableText(seed.date),
    year: optionalYear(seed.year, seed.id),
    sourceUrl: nullableText(seed.sourceUrl),
    reportCategory: requiredText(seed.reportCategory, 'reportCategory', seed.id),
    country: nullableText(seed.country) ?? 'NO',
    keyFindings: stringArray(seed.keyFindings, 'keyFindings', seed.id),
    recommendations: stringArray(seed.recommendations, 'recommendations', seed.id),
    relevance: requiredText(seed.relevance, 'relevance', seed.id),
    tags: stringArray(seed.tags, 'tags', seed.id),
    doi: nullableText(seed.doi),
    isbn: nullableText(seed.isbn),
    issn: nullableText(seed.issn),
    publisher: nullableText(seed.publisher),
    provenanceType: nullableText(seed.provenanceType),
    supportingSources: normalizeSupportingSources(seed.supportingSources, seed.id),
    accessedAt: isoDate(seed.accessedAt, 'accessedAt', seed.id),
  }
}

export function sha256SeedOnlyReportJson(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex')
}

export function seedOnlyReportTargetManifestContract(
  seedReports: readonly SeedOnlyReportSeedInput[],
) {
  const expectedIds = new Set<string>(SEED_ONLY_REPORT_SYNC_IDS)
  const matching = seedReports.filter(report => expectedIds.has(report.id))
  if (
    matching.length !== SEED_ONLY_REPORT_SYNC_IDS.length ||
    new Set(matching.map(report => report.id)).size !== SEED_ONLY_REPORT_SYNC_IDS.length
  ) {
    throw new Error('Seed-only Report sync requires exactly two unique reviewed seed rows')
  }
  const targets = matching.map(normalizeSeedReport).sort(compareIds)
  if (JSON.stringify(targets.map(target => target.id)) !== JSON.stringify([...SEED_ONLY_REPORT_SYNC_IDS].sort())) {
    throw new Error('Seed-only Report ids drifted from the reviewed sync contract')
  }
  return targets
}

export function buildReviewedSeedOnlyReportTargets(
  seedReports: readonly SeedOnlyReportSeedInput[],
) {
  const targets = seedOnlyReportTargetManifestContract(seedReports)
  const targetHash = sha256SeedOnlyReportJson(targets)
  if (targetHash !== PINNED_SEED_ONLY_REPORT_TARGET_SHA256) {
    throw new Error('Seed-only Report target values drifted from the pinned manifest')
  }
  return targets
}

function databaseManagedSnapshot(row: SeedOnlyReportDatabaseSnapshot): SeedOnlyReportTarget {
  if (!SEED_ONLY_REPORT_SYNC_IDS.includes(row.id as SeedOnlyReportId)) {
    throw new Error(`Unexpected database Report id: ${row.id}`)
  }
  return {
    id: row.id as SeedOnlyReportId,
    title: requiredText(row.title, 'title', row.id),
    fullTitle: nullableText(row.fullTitle),
    author: nullableText(row.author),
    institution: nullableText(row.institution),
    date: nullableText(row.date),
    year: optionalYear(row.year, row.id),
    sourceUrl: nullableText(row.sourceUrl),
    reportCategory: requiredText(row.reportCategory, 'reportCategory', row.id),
    country: requiredText(row.country, 'country', row.id),
    keyFindings: stringArray(row.keyFindings, 'keyFindings', row.id),
    recommendations: stringArray(row.recommendations, 'recommendations', row.id),
    relevance: requiredText(row.relevance, 'relevance', row.id),
    tags: stringArray(row.tags, 'tags', row.id),
    doi: nullableText(row.doi),
    isbn: nullableText(row.isbn),
    issn: nullableText(row.issn),
    publisher: nullableText(row.publisher),
    provenanceType: nullableText(row.provenanceType),
    supportingSources: canonicalizeSeedOnlyReportJson(row.supportingSources),
    accessedAt: isoDate(row.accessedAt, 'accessedAt', row.id),
  }
}

export function changedSeedOnlyReportFields(
  current: SeedOnlyReportTarget,
  target: SeedOnlyReportTarget,
) {
  return SEED_ONLY_REPORT_MANAGED_FIELDS.filter(field =>
    JSON.stringify(current[field]) !== JSON.stringify(target[field]),
  )
}

export function buildSeedOnlyReportSyncPlan(
  databaseRows: readonly SeedOnlyReportDatabaseSnapshot[],
  targets: readonly SeedOnlyReportTarget[],
): SeedOnlyReportSyncPlan {
  const targetById = new Map(targets.map(target => [target.id, target]))
  if (
    targets.length !== SEED_ONLY_REPORT_SYNC_IDS.length ||
    targetById.size !== SEED_ONLY_REPORT_SYNC_IDS.length ||
    SEED_ONLY_REPORT_SYNC_IDS.some(id => !targetById.has(id))
  ) {
    throw new Error('Seed-only Report plan requires the exact two reviewed targets')
  }
  const targetManifestSha256 = sha256SeedOnlyReportJson([...targets].sort(compareIds))
  if (targetManifestSha256 !== PINNED_SEED_ONLY_REPORT_TARGET_SHA256) {
    throw new Error('Seed-only Report plan targets drifted from the pinned manifest')
  }

  const rowsById = new Map<SeedOnlyReportId, SeedOnlyReportDatabaseSnapshot>()
  const duplicateIds = new Set<SeedOnlyReportId>()
  for (const row of databaseRows) {
    if (!SEED_ONLY_REPORT_SYNC_IDS.includes(row.id as SeedOnlyReportId)) continue
    const id = row.id as SeedOnlyReportId
    if (rowsById.has(id)) duplicateIds.add(id)
    else rowsById.set(id, row)
  }

  const creates: SeedOnlyReportCreate[] = []
  const alreadyAppliedIds: SeedOnlyReportId[] = []
  const conflicts: SeedOnlyReportSyncConflict[] = []
  const observed: SeedOnlyReportObservedState[] = []

  for (const id of [...SEED_ONLY_REPORT_SYNC_IDS].sort()) {
    const target = targetById.get(id)!
    const currentRow = rowsById.get(id)
    if (!currentRow) {
      creates.push({
        id,
        target,
        expectedAbsent: true,
        targetRowSha256: sha256SeedOnlyReportJson(target),
      })
      observed.push({ id, state: 'missing', documentId: null, currentRowSha256: null })
      continue
    }

    const current = databaseManagedSnapshot(currentRow)
    const currentRowSha256 = sha256SeedOnlyReportJson(current)
    if (duplicateIds.has(id)) {
      conflicts.push({
        id,
        code: 'duplicate_snapshot',
        changedFields: [],
        detail: `Database inspection returned duplicate snapshots for Report ${id}`,
        currentRowSha256,
      })
      observed.push({
        id,
        state: 'conflict',
        documentId: currentRow.documentId,
        currentRowSha256,
      })
      continue
    }

    const changedFields = changedSeedOnlyReportFields(current, target)
    if (changedFields.length === 0) {
      alreadyAppliedIds.push(id)
      observed.push({
        id,
        state: 'already_applied',
        documentId: currentRow.documentId,
        currentRowSha256,
      })
      continue
    }

    conflicts.push({
      id,
      code: 'existing_row_drift',
      changedFields,
      detail: `Existing Report ${id} differs from the reviewed seed target: ${changedFields.join(', ')}`,
      currentRowSha256,
    })
    observed.push({
      id,
      state: 'conflict',
      documentId: currentRow.documentId,
      currentRowSha256,
    })
  }

  return {
    version: 1,
    targetManifestSha256,
    creates: creates.sort(compareIds),
    alreadyAppliedIds: alreadyAppliedIds.sort(),
    observed: observed.sort(compareIds),
    conflicts: conflicts.sort(compareIds),
    summary: {
      total: SEED_ONLY_REPORT_SYNC_IDS.length,
      pendingCreates: creates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function seedOnlyReportSyncPlanContract(plan: SeedOnlyReportSyncPlan) {
  return {
    version: plan.version,
    targetManifestSha256: plan.targetManifestSha256,
    creates: plan.creates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    observed: plan.observed,
    conflicts: plan.conflicts,
  }
}
