import type { SourceDoc, SourceDocProvenanceType } from '../types'
import {
  canonicalizeReviewedProvenanceJson,
  sha256ReviewedProvenanceJson,
} from './reviewed-provenance-batch'
import { SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS } from './source-doc-bibliographic-repair'
import { SOURCE_DOC_METADATA_REPAIR_IDS } from './source-doc-metadata-repair'

export const REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION =
  '2026-07-20-v1' as const
export const REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE =
  '2026-07-20' as const
export const REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS = [
  'src-16',
  'src-24',
  'src-143',
] as const

export const REVIEWED_SOURCE_DOC_IDENTITY_ALLOWED_FIELDS = [
  'title',
  'author',
  'year',
  'url',
  'publisher',
  'accessedAt',
] as const

export type ReviewedSourceDocIdentityRepairId =
  (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number]
export type ReviewedSourceDocIdentityMutableField =
  (typeof REVIEWED_SOURCE_DOC_IDENTITY_ALLOWED_FIELDS)[number]

export type PortableSourceDocIdentitySnapshot = Readonly<{
  id: string
  filename: string
  title: string | null
  author: string | null
  year: number | string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  doi: string | null
  publisher: string | null
  provenanceType: SourceDocProvenanceType
  accessedAt: string | null
  archivedUrl: string | null
}>

export type ReviewedSourceDocIdentityEvidence = Readonly<{
  locator: string
  reviewBasis: string
  artifactPath: string | null
  artifactSha256: string | null
  artifactAvailability: 'not_applicable' | 'canonical_checkout_only'
}>

export type ReviewedSourceDocIdentityRepair = Readonly<{
  id: ReviewedSourceDocIdentityRepairId
  mutatedFields: readonly ReviewedSourceDocIdentityMutableField[]
  before: PortableSourceDocIdentitySnapshot
  after: PortableSourceDocIdentitySnapshot
  evidence: ReviewedSourceDocIdentityEvidence
}>

const RAW_REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS = [
  {
    id: 'src-16',
    mutatedFields: ['title', 'url', 'accessedAt'],
    before: {
      id: 'src-16',
      filename: 'beredskap-2023.md',
      title:
        'Riksrevisjonens undersøkelse av matsikkerhet og beredskap på jordbruksområdet',
      author: 'Riksrevisjonen',
      year: 2023,
      sourceType: 'rapport',
      description:
        'Kritisk analyse av systemets sårbarhet og manglende kriseplanlegging.',
      relevance: 'Vurdering av nasjonal beredskap og importavhengighet.',
      url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/',
      isDuplicate: false,
      doi: null,
      publisher: null,
      provenanceType: 'official_primary',
      accessedAt: null,
      archivedUrl: null,
    },
    after: {
      id: 'src-16',
      filename: 'beredskap-2023.md',
      title: 'Matsikkerhet og beredskap på landbruksområdet',
      author: 'Riksrevisjonen',
      year: 2023,
      sourceType: 'rapport',
      description:
        'Kritisk analyse av systemets sårbarhet og manglende kriseplanlegging.',
      relevance: 'Vurdering av nasjonal beredskap og importavhengighet.',
      url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/',
      isDuplicate: false,
      doi: null,
      publisher: null,
      provenanceType: 'official_primary',
      accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      archivedUrl: null,
    },
    evidence: {
      locator:
        'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/',
      reviewBasis:
        'The official Riksrevisjonen work page identifies the title as Matsikkerhet og beredskap på landbruksområdet and records publication in 2023.',
      artifactPath: null,
      artifactSha256: null,
      artifactAvailability: 'not_applicable',
    },
  },
  {
    id: 'src-24',
    mutatedFields: [
      'title',
      'author',
      'year',
      'url',
      'publisher',
      'accessedAt',
    ],
    before: {
      id: 'src-24',
      filename: 'kkv-4a-dominans.md',
      title: 'Kilpailulaki (Competition Act) Section 4a',
      author: 'KKV (Finland)',
      year: 2014,
      sourceType: 'lovverk',
      description:
        'Regulering av markedsmakt med automatisk dominans-presumsjon over 30%.',
      relevance: 'Finsk benchmark for tøyling av markedsmakt.',
      url: 'https://www.kkv.fi/en/',
      isDuplicate: false,
      doi: null,
      publisher: null,
      provenanceType: 'official_primary',
      accessedAt: null,
      archivedUrl: null,
    },
    after: {
      id: 'src-24',
      filename: 'kkv-4a-dominans.md',
      title: 'Competition Act 948/2011, Section 4a',
      author: 'Finland',
      year: 2013,
      sourceType: 'lovverk',
      description:
        'Regulering av markedsmakt med automatisk dominans-presumsjon over 30%.',
      relevance: 'Finsk benchmark for tøyling av markedsmakt.',
      url: 'https://www.finlex.fi/en/legislation/2011/948',
      isDuplicate: false,
      doi: null,
      publisher: 'Finlex',
      provenanceType: 'official_primary',
      accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      archivedUrl: null,
    },
    evidence: {
      locator: 'https://www.finlex.fi/en/legislation/2011/948',
      reviewBasis:
        'The official Finlex consolidated-legislation record identifies Competition Act 948/2011; the reviewed repair pins Section 4a to its 2013 amendment year.',
      artifactPath: null,
      artifactSha256: null,
      artifactAvailability: 'not_applicable',
    },
  },
  {
    id: 'src-143',
    mutatedFields: ['title', 'url', 'accessedAt'],
    before: {
      id: 'src-143',
      filename: 'etmv-toimintakertomus-2024.pdf',
      title: 'Elintarvikemarkkinavaltuutettu toimintakertomus 2024',
      author: 'Ruokavirasto / Finnish Food Market Ombudsman',
      year: 2024,
      sourceType: 'årsrapport',
      description:
        '40% av frukt/baer-respondenter peker paa ensidige kontraktsendringer som stoerste problem. Drikkevare: betalingstid.',
      relevance:
        'Finsk nordisk komparativ. Status: url_only (2023-versjon er nedlastet).',
      url: 'https://www.ruokavirasto.fi/globalassets/etmv/',
      isDuplicate: false,
      doi: null,
      publisher: 'Ruokavirasto',
      provenanceType: 'official_primary',
      accessedAt: null,
      archivedUrl: null,
    },
    after: {
      id: 'src-143',
      filename: 'etmv-toimintakertomus-2024.pdf',
      title: 'Elintarvikemarkkinavaltuutetun toimintakertomus 2024',
      author: 'Ruokavirasto / Finnish Food Market Ombudsman',
      year: 2024,
      sourceType: 'årsrapport',
      description:
        '40% av frukt/baer-respondenter peker paa ensidige kontraktsendringer som stoerste problem. Drikkevare: betalingstid.',
      relevance:
        'Finsk nordisk komparativ. Status: url_only (2023-versjon er nedlastet).',
      url: 'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
      isDuplicate: false,
      doi: null,
      publisher: 'Ruokavirasto',
      provenanceType: 'official_primary',
      accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      archivedUrl: null,
    },
    evidence: {
      locator:
        'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
      reviewBasis:
        'The official download and the canonical local archive are byte-identical; first-page visual inspection confirms the exact 2024 title.',
      artifactPath:
        'research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Ruokavirasto - etmv toimintakertomus 2024 (2024).pdf',
      artifactSha256:
        '136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761',
      artifactAvailability: 'canonical_checkout_only',
    },
  },
] as const satisfies readonly ReviewedSourceDocIdentityRepair[]

function freezeRepair(
  repair: ReviewedSourceDocIdentityRepair,
): ReviewedSourceDocIdentityRepair {
  return Object.freeze({
    ...repair,
    mutatedFields: Object.freeze([...repair.mutatedFields]),
    before: Object.freeze({ ...repair.before }),
    after: Object.freeze({ ...repair.after }),
    evidence: Object.freeze({ ...repair.evidence }),
  })
}

export const REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS = Object.freeze(
  RAW_REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map(freezeRepair),
) as readonly ReviewedSourceDocIdentityRepair[]

export const canonicalizeReviewedSourceDocIdentityJson =
  canonicalizeReviewedProvenanceJson

export function sha256ReviewedSourceDocIdentityJson(value: unknown) {
  return sha256ReviewedProvenanceJson(value)
}

export const REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256 =
  sha256ReviewedSourceDocIdentityJson(
    REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  )

export const PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256 =
  '1396f3ad134459afa40076556d24c466c8b90e9c40017c1ba3a74ae998e6ae7c' as const

const SNAPSHOT_FIELDS = [
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
] as const satisfies readonly (keyof PortableSourceDocIdentitySnapshot)[]

function nullableText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function requiredText(value: unknown, field: string, id: string) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`SourceDoc ${id} is missing required ${field}`)
  }
  return value
}

function dateOnly(value: Date | string | null | undefined) {
  if (value == null) return null
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.valueOf())) return null
  return parsed.toISOString().slice(0, 10)
}

export function normalizePortableSourceDocIdentitySnapshot(
  row: SourceDoc,
): PortableSourceDocIdentitySnapshot {
  return {
    id: requiredText(row.id, 'id', row.id),
    filename: requiredText(row.filename, 'filename', row.id),
    title: nullableText(row.title),
    author: nullableText(row.author),
    year: row.year ?? null,
    sourceType: requiredText(row.type, 'type', row.id),
    description: requiredText(row.description, 'description', row.id),
    relevance: requiredText(row.relevance, 'relevance', row.id),
    url: nullableText(row.url),
    isDuplicate: row.isDuplicate ?? false,
    doi: nullableText(row.doi),
    publisher: nullableText(row.publisher),
    provenanceType: row.provenanceType ?? 'unknown',
    accessedAt: dateOnly(row.accessedAt),
    archivedUrl: nullableText(row.archivedUrl),
  }
}

function snapshotsEqual(
  left: PortableSourceDocIdentitySnapshot,
  right: PortableSourceDocIdentitySnapshot,
) {
  return (
    sha256ReviewedSourceDocIdentityJson(left) ===
    sha256ReviewedSourceDocIdentityJson(right)
  )
}

function actualChangedFields(repair: ReviewedSourceDocIdentityRepair) {
  return SNAPSHOT_FIELDS.filter(
    (field) => repair.before[field] !== repair.after[field],
  )
}

const DEFAULT_EXCLUSIVE_REPAIR_IDS = [
  ...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS,
  ...SOURCE_DOC_METADATA_REPAIR_IDS,
] as const

export function validateReviewedSourceDocIdentityRepairManifest(
  manifest: readonly ReviewedSourceDocIdentityRepair[] =
    REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  exclusiveRepairIds: readonly string[] = DEFAULT_EXCLUSIVE_REPAIR_IDS,
) {
  const ids = manifest.map((repair) => repair.id)
  if (
    manifest.length !== REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length ||
    new Set(ids).size !== manifest.length ||
    JSON.stringify(ids) !==
      JSON.stringify(REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)
  ) {
    throw new Error(
      'Reviewed SourceDoc identity manifest must contain exactly src-16, src-24, and src-143 in pinned order',
    )
  }

  const exclusiveIds = new Set(exclusiveRepairIds)
  const overlaps = ids.filter((id) => exclusiveIds.has(id))
  if (overlaps.length > 0) {
    throw new Error(
      `Reviewed SourceDoc identity manifest overlaps another identity or metadata repair: ${overlaps.join(', ')}`,
    )
  }

  const allowedFields = new Set<string>(
    REVIEWED_SOURCE_DOC_IDENTITY_ALLOWED_FIELDS,
  )
  for (const repair of manifest) {
    if (repair.before.id !== repair.id || repair.after.id !== repair.id) {
      throw new Error(`Reviewed SourceDoc identity id drift: ${repair.id}`)
    }
    if (
      repair.before.provenanceType !== 'official_primary' ||
      repair.after.provenanceType !== 'official_primary'
    ) {
      throw new Error(
        `Reviewed SourceDoc identity provenance must remain official_primary: ${repair.id}`,
      )
    }
    if (
      repair.after.accessedAt !==
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE
    ) {
      throw new Error(
        `Reviewed SourceDoc identity access date drift: ${repair.id}`,
      )
    }
    if (
      new Set(repair.mutatedFields).size !== repair.mutatedFields.length ||
      repair.mutatedFields.some((field) => !allowedFields.has(field))
    ) {
      throw new Error(
        `Reviewed SourceDoc identity mutable-field contract is invalid: ${repair.id}`,
      )
    }
    if (
      JSON.stringify(actualChangedFields(repair)) !==
      JSON.stringify(repair.mutatedFields)
    ) {
      throw new Error(
        `Reviewed SourceDoc identity before/after diff does not match mutatedFields: ${repair.id}`,
      )
    }
    let locator: URL
    try {
      locator = new URL(repair.evidence.locator)
    } catch {
      throw new Error(
        `Reviewed SourceDoc identity evidence locator is invalid: ${repair.id}`,
      )
    }
    if (
      locator.protocol !== 'https:' ||
      repair.evidence.reviewBasis.trim().length === 0
    ) {
      throw new Error(
        `Reviewed SourceDoc identity evidence is incomplete: ${repair.id}`,
      )
    }
    if (repair.id === 'src-143') {
      if (
        repair.evidence.artifactSha256 !==
          '136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761' ||
        !repair.evidence.artifactPath ||
        repair.evidence.artifactAvailability !== 'canonical_checkout_only'
      ) {
        throw new Error(
          'Reviewed SourceDoc identity artifact evidence is incomplete: src-143',
        )
      }
    } else if (
      repair.evidence.artifactSha256 !== null ||
      repair.evidence.artifactPath !== null ||
      repair.evidence.artifactAvailability !== 'not_applicable'
    ) {
      throw new Error(
        `Reviewed SourceDoc identity has unreviewed artifact evidence: ${repair.id}`,
      )
    }
  }
  return manifest
}

validateReviewedSourceDocIdentityRepairManifest()
if (
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256 !==
  PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256
) {
  throw new Error(
    'Reviewed SourceDoc identity repair manifest SHA-256 drifted from the pinned contract',
  )
}

export type ReviewedSourceDocIdentityRepairConflictCode =
  | 'missing_row'
  | 'duplicate_row'
  | 'hybrid_snapshot'
  | 'protected_field_drift'
  | 'identity_snapshot_drift'

export type ReviewedSourceDocIdentityRepairConflict = Readonly<{
  id: string
  code: ReviewedSourceDocIdentityRepairConflictCode
  detail: string
}>

export type ReviewedSourceDocIdentityRepairPlan = Readonly<{
  version: typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION
  manifestSha256: string
  pendingIds: readonly ReviewedSourceDocIdentityRepairId[]
  alreadyAppliedIds: readonly ReviewedSourceDocIdentityRepairId[]
  conflicts: readonly ReviewedSourceDocIdentityRepairConflict[]
  summary: Readonly<{
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
  }>
}>

function classifyUnexpectedSnapshot(
  current: PortableSourceDocIdentitySnapshot,
  repair: ReviewedSourceDocIdentityRepair,
): ReviewedSourceDocIdentityRepairConflictCode {
  const mutableFields = new Set<string>(repair.mutatedFields)
  const protectedDrift = SNAPSHOT_FIELDS.some(
    (field) =>
      !mutableFields.has(field) && current[field] !== repair.before[field],
  )
  if (protectedDrift) return 'protected_field_drift'

  const changedFields = repair.mutatedFields.filter(
    (field) => repair.before[field] !== repair.after[field],
  )
  const everyValueIsReviewed = changedFields.every(
    (field) =>
      current[field] === repair.before[field] ||
      current[field] === repair.after[field],
  )
  const hasBefore = changedFields.some(
    (field) => current[field] === repair.before[field],
  )
  const hasAfter = changedFields.some(
    (field) => current[field] === repair.after[field],
  )
  if (everyValueIsReviewed && hasBefore && hasAfter) {
    return 'hybrid_snapshot'
  }
  return 'identity_snapshot_drift'
}

export function buildReviewedSourceDocIdentityRepairPlan(
  rows: readonly SourceDoc[],
): ReviewedSourceDocIdentityRepairPlan {
  validateReviewedSourceDocIdentityRepairManifest()
  const rowsById = new Map<string, SourceDoc[]>()
  for (const row of rows) {
    if (!REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
      row.id as ReviewedSourceDocIdentityRepairId,
    )) {
      continue
    }
    const matches = rowsById.get(row.id) ?? []
    matches.push(row)
    rowsById.set(row.id, matches)
  }

  const pendingIds: ReviewedSourceDocIdentityRepairId[] = []
  const alreadyAppliedIds: ReviewedSourceDocIdentityRepairId[] = []
  const conflicts: ReviewedSourceDocIdentityRepairConflict[] = []
  for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
    const matches = rowsById.get(repair.id) ?? []
    if (matches.length === 0) {
      conflicts.push({
        id: repair.id,
        code: 'missing_row',
        detail: `SourceDoc seed row is missing: ${repair.id}`,
      })
      continue
    }
    if (matches.length > 1) {
      conflicts.push({
        id: repair.id,
        code: 'duplicate_row',
        detail: `SourceDoc seed row is duplicated: ${repair.id}`,
      })
      continue
    }
    const current = normalizePortableSourceDocIdentitySnapshot(matches[0]!)
    if (snapshotsEqual(current, repair.after)) {
      alreadyAppliedIds.push(repair.id)
      continue
    }
    if (snapshotsEqual(current, repair.before)) {
      pendingIds.push(repair.id)
      continue
    }
    const code = classifyUnexpectedSnapshot(current, repair)
    conflicts.push({
      id: repair.id,
      code,
      detail: `SourceDoc ${repair.id} matches neither the exact before nor after snapshot`,
    })
  }

  return {
    version: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION,
    manifestSha256: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    pendingIds,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length,
      pending: pendingIds.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

function applyIdentityRepairToRow(
  row: SourceDoc,
  repair: ReviewedSourceDocIdentityRepair,
) {
  const result: SourceDoc = { ...row }
  const resultRecord = result as unknown as Record<string, unknown>
  for (const field of repair.mutatedFields) {
    const value = repair.after[field]
    if (value === null) delete resultRecord[field]
    else resultRecord[field] = value
  }
  const actual = normalizePortableSourceDocIdentitySnapshot(result)
  if (!snapshotsEqual(actual, repair.after)) {
    throw new Error(
      `Reviewed SourceDoc identity repair produced unexpected state: ${repair.id}`,
    )
  }
  return result
}

export function applyReviewedSourceDocIdentityRepairsToSeed(
  rows: readonly SourceDoc[],
): SourceDoc[] {
  const plan = buildReviewedSourceDocIdentityRepairPlan(rows)
  if (plan.conflicts.length > 0) {
    throw new Error(
      `Reviewed SourceDoc identity seed conflict: ${plan.conflicts
        .map((conflict) => `${conflict.id}:${conflict.code}`)
        .join(', ')}`,
    )
  }
  const pendingIds = new Set<string>(plan.pendingIds)
  const repairs = new Map<string, ReviewedSourceDocIdentityRepair>(
    REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => [repair.id, repair]),
  )
  return rows.map((row) => {
    if (!pendingIds.has(row.id)) return row
    return applyIdentityRepairToRow(row, repairs.get(row.id)!)
  })
}
