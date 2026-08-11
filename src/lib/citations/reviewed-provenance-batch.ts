import { createHash } from 'node:crypto'
import type {
  Report,
  ReportProvenanceType,
  SourceDoc,
  SourceDocProvenanceType,
} from '../types'

export const REVIEWED_PROVENANCE_BATCH_VERSION = '2026-07-20-v1' as const
export const REVIEWED_REPORT_TARGET_COUNT = 79 as const
export const REVIEWED_SOURCE_DOC_TARGET_COUNT = 111 as const
export const REVIEWED_PROVENANCE_TARGET_COUNT = 190 as const

export const REVIEWED_REPORT_PROVENANCE_IDS = {
  external_report: [
    'arla-farmahead-check-2024',
    'asko-barekraft-2024',
    'axfood-annual-report-2024',
    'beredskap-finsk-modell-hvk',
    'beredskap-nibio-selvforsyning-2026',
    'beredskap-nibio-selvforsyning-metode',
    'coop-danmark-2024',
    'dagligvarerapporten-2025',
    'dagligvaretilsynet-aarsrapport-2021',
    'dagligvaretilsynet-aarsrapport-2022',
    'dagligvaretilsynet-aarsrapport-2023',
    'dagligvaretilsynet-aarsrapport-2024',
    'dt-samarbeidsklima-2023',
    'dt-samarbeidsklima-2025',
    'etmv-toimintakertomus-2024',
    'eu-utp-report-2024',
    'eu-utp-staff-working-doc-2024',
    'finland-food-market-ombudsman-2023',
    'finland-food2030',
    'hagar-2024-25',
    'ica-gruppen-annual-report-2024',
    'is-markedsstruktur-2024',
    'is-samkeppni-annual-report-2024',
    'karlstad-declaration-2024',
    'kbh-food-strategy-madhus',
    'kesko-annual-report-2024',
    'kfst-foedevarehandelslov-evaluering-2024',
    'kkv-fi-4a-dominans',
    'konkurrensverket-2025-5-livsmedelsutredning',
    'konkurrensverket-summary-2024',
    'kt-dagligvarerapport-2024',
    'kt-innkjopspriser-2017-2023',
    'kt-marginstudie-2024-del1',
    'kt-marginstudie-2025-del2',
    'kt-markedsundersokelser-2026',
    'kt-prisjeger-saken-2024',
    'kt-prisjusteringsvinduer-2023',
    'matsvinnutvalget-2024',
    'meld-st-11-selvforsyning',
    'meld-st-4-dagligvare',
    'menon-emv-innovasjon',
    'menon-funksjonelt-skille-2026',
    'motiva-food-procurement-2026',
    'nordic-food-alert-2025',
    'nordisk-food-markets-2005',
    'norgesgruppen-2024-25',
    'norgesgruppen-halvarsrapport-h1-2025',
    'nou-2011-4',
    'nou-2013-6-god-handelsskikk',
    'nou-2022-14',
    'oslo-economics-forsvar-2024',
    'plantefonden-projects-2023-2025',
    'pty-finnish-grocery-trade-2024',
    'reitan-2024-25',
    'riksrevisjonen-matsikkerhet-2023',
    'salling-coop-danmark-2025',
    'salling-group-2024',
    'se-konkurrensverket-2024-5',
    'sodertaelje-diet-green-planet',
    'sou-2024-8-svensk-beredskap',
    'stockholm-resilience-2019',
  ],
  external_article: [
    'pubmed-hiis-2024',
    'pubmed-javourez-2021',
    'pubmed-recanati-2019',
    'pubmed-sigala-2025',
    'pubmed-szulecka-2024',
    'pubmed-van-der-fels-klerx-2024',
    'pubmed-van-leeuwen-2024',
    'pubmed-wohner-2020',
    'pubmed-zamanzadeh-2017',
    'van-zanten-circularity-2023',
  ],
  internal_synthesis: [
    'asko-infrastruktur-2025',
    'juridisk-eiendomsmakt-lokal-konkurranse',
    'juridisk-eudr-norge-2025',
    'oversikt-akademia-dyp-research',
  ],
  composite_source: [
    'civita-manifest-debatt',
    'oversikt-bransje-statistikk-beredskap',
    'sirkularitet-definisjoner-wur-emf',
  ],
  blocked_source: ['matsystemutvalget-2026'],
} as const satisfies Readonly<
  Record<Exclude<ReportProvenanceType, 'internal_register'>, readonly string[]>
>

export const REVIEWED_SOURCE_DOC_PROVENANCE_IDS = {
  internal_synthesis: [
    'src-41',
    'src-46',
    'src-50',
    'src-53',
    'src-55',
    'src-56',
    'src-57',
    'src-58',
    'src-59',
    'src-60',
    'src-61',
    'src-62',
    'src-63',
    'src-64',
    'src-65',
    'src-66',
    'src-67',
    'src-68',
    'src-69',
    'src-70',
    'src-71',
    'src-102',
    'src-110',
    'src-111',
    'src-112',
    'src-113',
    'src-114',
    'src-115',
    'src-116',
    'src-117',
    'src-118',
    'src-119',
    'src-120',
    'src-121',
    'src-122',
    'src-123',
    'src-124',
    'src-125',
    'src-126',
    'src-127',
    'src-128',
    'src-129',
    'src-130',
    'src-131',
    'src-132',
    'src-133',
    'src-134',
    'src-135',
    'src-153',
  ],
  internal_primary: ['src-3', 'src-104', 'src-105', 'src-106', 'src-181'],
  official_primary: [
    'src-12',
    'src-13',
    'src-14',
    'src-15',
    'src-16',
    'src-24',
    'src-26',
    'src-75',
    'src-84',
    'src-85',
    'src-92',
    'src-93',
    'src-139',
    'src-140',
    'src-142',
    'src-143',
    'src-144',
    'src-145',
    'src-146',
    'src-149',
    'src-151',
    'src-159',
    'src-161',
    'src-162',
    'src-164',
    'src-165',
    'src-166',
    'src-167',
    'src-168',
    'src-169',
    'src-171',
    'src-172',
    'src-173',
    'src-174',
    'src-176',
  ],
  corporate_self_report: [
    'src-17',
    'src-18',
    'src-54',
    'src-97',
    'src-137',
    'src-138',
    'src-148',
    'src-152',
  ],
  peer_reviewed: [
    'src-73',
    'src-154',
    'src-155',
    'src-156',
    'src-157',
    'src-175',
  ],
  external_publication: ['src-72', 'src-74', 'src-76', 'src-80', 'src-160'],
  advocacy_position: ['src-94', 'src-95', 'src-96'],
} as const satisfies Readonly<
  Partial<
    Record<Exclude<SourceDocProvenanceType, 'unknown'>, readonly string[]>
  >
>

export const REVIEWED_REPORT_PROVENANCE_EXCLUSIONS = [
  'akademia-nhh-butikkstruktur-2024',
  'akademia-nhh-foros-media-2025',
  'akademia-nhh-matbors-historie',
  'akademia-sifo-kundeprogram-2026',
  'akademia-sifo-retail-media-2025',
  'akademia-uib-kjopermakt',
  'coop-2024',
  'coop-norge-2024',
  'dk-salling-coop-decision-2025',
  'kfst-salling-coop-2025',
  'emv-kartlegging-2023',
  'soa-emv-2023',
  'fivh-etikk-2025',
  'nbs-systemkritikk',
] as const

export const REVIEWED_SOURCE_DOC_PROVENANCE_EXCLUSIONS = [
  'src-7',
  'src-20',
  'src-21',
  'src-23',
  'src-34',
  'src-51',
  'src-52',
  'src-77',
  'src-79',
  'src-81',
  'src-82',
  'src-83',
  'src-86',
  'src-87',
  'src-90',
  'src-91',
  'src-98',
  'src-99',
  'src-107',
  'src-108',
  'src-136',
  'src-147',
  'src-150',
  'src-158',
  'src-163',
  'src-170',
  'src-182',
] as const

export type ReviewedProvenanceEntity = 'Report' | 'SourceDoc'
export type ReviewedProvenanceTargetType =
  ReportProvenanceType | Exclude<SourceDocProvenanceType, 'unknown'>

export type ReviewedProvenanceManifestEntry = {
  entity: ReviewedProvenanceEntity
  id: string
  targetType: ReviewedProvenanceTargetType
}

function manifestEntries<T extends ReviewedProvenanceTargetType>(
  entity: ReviewedProvenanceEntity,
  groups: Readonly<Partial<Record<T, readonly string[]>>>,
): ReviewedProvenanceManifestEntry[] {
  return (
    Object.entries(groups) as Array<[T, readonly string[] | undefined]>
  ).flatMap(([targetType, ids]) =>
    (ids ?? []).map((id) => ({
      entity,
      id,
      targetType: targetType as ReviewedProvenanceTargetType,
    })),
  )
}

export const REVIEWED_PROVENANCE_MANIFEST = [
  ...manifestEntries('Report', REVIEWED_REPORT_PROVENANCE_IDS),
  ...manifestEntries('SourceDoc', REVIEWED_SOURCE_DOC_PROVENANCE_IDS),
].sort(
  (left, right) =>
    left.entity.localeCompare(right.entity) ||
    left.id.localeCompare(right.id, undefined, { numeric: true }),
) as readonly ReviewedProvenanceManifestEntry[]

export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue }

export function canonicalizeReviewedProvenanceJson(
  value: unknown,
): CanonicalJsonValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value))
      throw new Error('Reviewed provenance JSON contains a non-finite number')
    return value
  }
  if (typeof value === 'bigint') return value.toString()
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalizeReviewedProvenanceJson)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    if (typeof record.toJSON === 'function') {
      return canonicalizeReviewedProvenanceJson(record.toJSON())
    }
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, canonicalizeReviewedProvenanceJson(record[key])]),
    )
  }
  throw new Error(
    `Reviewed provenance JSON contains unsupported value type: ${typeof value}`,
  )
}

export function sha256ReviewedProvenanceJson(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalizeReviewedProvenanceJson(value)))
    .digest('hex')
}

export function validateReviewedProvenanceManifest(
  manifest: readonly ReviewedProvenanceManifestEntry[] = REVIEWED_PROVENANCE_MANIFEST,
) {
  const reportRows = manifest.filter((row) => row.entity === 'Report')
  const sourceDocRows = manifest.filter((row) => row.entity === 'SourceDoc')
  const keys = manifest.map((row) => `${row.entity}:${row.id}`)
  if (
    manifest.length !== REVIEWED_PROVENANCE_TARGET_COUNT ||
    reportRows.length !== REVIEWED_REPORT_TARGET_COUNT ||
    sourceDocRows.length !== REVIEWED_SOURCE_DOC_TARGET_COUNT ||
    new Set(keys).size !== manifest.length
  ) {
    throw new Error(
      'Reviewed provenance manifest must contain exactly 79 Report and 111 SourceDoc rows',
    )
  }
  if (
    REVIEWED_REPORT_PROVENANCE_EXCLUSIONS.some((id) =>
      keys.includes(`Report:${id}`),
    ) ||
    REVIEWED_SOURCE_DOC_PROVENANCE_EXCLUSIONS.some((id) =>
      keys.includes(`SourceDoc:${id}`),
    )
  ) {
    throw new Error(
      'Reviewed provenance manifest contains a fail-closed exclusion',
    )
  }
  return manifest
}

export const PINNED_REVIEWED_PROVENANCE_MANIFEST_SHA256 =
  '8b831cd30d226ff5e68d25243cb3df3bd2ae48e848c80f7d884e04624a7ba8b5' as const

export const REVIEWED_PROVENANCE_MANIFEST_SHA256 = sha256ReviewedProvenanceJson(
  validateReviewedProvenanceManifest(),
)

if (
  REVIEWED_PROVENANCE_MANIFEST_SHA256 !==
  PINNED_REVIEWED_PROVENANCE_MANIFEST_SHA256
) {
  throw new Error(
    'Reviewed provenance manifest SHA-256 drifted from the approved 190-row contract',
  )
}

function targetMap(entity: ReviewedProvenanceEntity) {
  return new Map(
    REVIEWED_PROVENANCE_MANIFEST.filter((row) => row.entity === entity).map(
      (row) => [row.id, row.targetType],
    ),
  )
}

function assertSeedCoverage(
  entity: ReviewedProvenanceEntity,
  seen: ReadonlySet<string>,
  expected: ReadonlyMap<string, ReviewedProvenanceTargetType>,
) {
  const missing = [...expected.keys()].filter((id) => !seen.has(id))
  if (missing.length > 0) {
    throw new Error(
      `Reviewed provenance ${entity} seed rows are missing: ${missing.join(', ')}`,
    )
  }
}

export function applyReviewedReportProvenanceToSeed(
  rows: readonly Report[],
): Report[] {
  const targets = targetMap('Report')
  const seen = new Set<string>()
  const result = rows.map((row) => {
    const target = targets.get(row.id) as ReportProvenanceType | undefined
    if (!target) return row
    if (seen.has(row.id))
      throw new Error(`Duplicate reviewed Report seed id: ${row.id}`)
    seen.add(row.id)
    if (row.provenanceType !== undefined && row.provenanceType !== target) {
      throw new Error(`Reviewed Report seed provenance conflict: ${row.id}`)
    }
    return { ...row, provenanceType: target }
  })
  assertSeedCoverage('Report', seen, targets)
  return result
}

export function applyReviewedSourceDocProvenanceToSeed(
  rows: readonly SourceDoc[],
): SourceDoc[] {
  const targets = targetMap('SourceDoc')
  const seen = new Set<string>()
  const result = rows.map((row) => {
    const target = targets.get(row.id) as
      Exclude<SourceDocProvenanceType, 'unknown'> | undefined
    if (!target) return row
    if (seen.has(row.id))
      throw new Error(`Duplicate reviewed SourceDoc seed id: ${row.id}`)
    seen.add(row.id)
    if (
      row.provenanceType !== undefined &&
      row.provenanceType !== 'unknown' &&
      row.provenanceType !== target
    ) {
      throw new Error(`Reviewed SourceDoc seed provenance conflict: ${row.id}`)
    }
    return { ...row, provenanceType: target }
  })
  assertSeedCoverage('SourceDoc', seen, targets)
  return result
}

export type ReviewedProvenanceRowStatus = 'pending' | 'applied' | 'conflict'

export function classifyReviewedProvenanceCurrent(
  entry: ReviewedProvenanceManifestEntry,
  current: string | null | undefined,
): ReviewedProvenanceRowStatus {
  if (current === entry.targetType) return 'applied'
  if (entry.entity === 'Report' && current === null) return 'pending'
  if (entry.entity === 'SourceDoc' && current === 'unknown') return 'pending'
  return 'conflict'
}

export function assertReviewedProvenanceStateIsAtomic(
  statuses: readonly ReviewedProvenanceRowStatus[],
) {
  if (statuses.length !== REVIEWED_PROVENANCE_TARGET_COUNT) {
    throw new Error(
      `Reviewed provenance state must contain ${REVIEWED_PROVENANCE_TARGET_COUNT} rows`,
    )
  }
  if (statuses.includes('conflict')) {
    throw new Error('Reviewed provenance state contains conflicts')
  }
  const pending = statuses.filter((status) => status === 'pending').length
  const applied = statuses.filter((status) => status === 'applied').length
  if (pending > 0 && applied > 0) {
    throw new Error('Reviewed provenance state is mixed/partially applied')
  }
  return { pending, applied }
}
