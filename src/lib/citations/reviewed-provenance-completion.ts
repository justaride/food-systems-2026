import type {
  Report,
  ReportProvenanceType,
  SourceDoc,
  SourceDocProvenanceType,
} from '../types'
import {
  REVIEWED_PROVENANCE_MANIFEST,
  canonicalizeReviewedProvenanceJson,
  sha256ReviewedProvenanceJson,
} from './reviewed-provenance-batch'
import type { CanonicalJsonValue } from './reviewed-provenance-batch'

export const REVIEWED_PROVENANCE_COMPLETION_VERSION = '2026-07-20-v1' as const
export const REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT = 14 as const
export const REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT = 25 as const
export const REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT = 39 as const

type SourceDocCompletionTargetType = Exclude<
  SourceDocProvenanceType,
  'unknown'
>

export type ReviewedProvenanceCompletionCanonicalJsonValue =
  CanonicalJsonValue

export type ReviewedProvenanceCompletionManifestEntry =
  | Readonly<{
      entity: 'Report'
      id: string
      targetType: ReportProvenanceType
      reviewBasis: string
    }>
  | Readonly<{
      entity: 'SourceDoc'
      id: string
      targetType: SourceDocCompletionTargetType
      reviewBasis: string
    }>

const RAW_REVIEWED_PROVENANCE_COMPLETION_MANIFEST = [
  {
    entity: 'Report',
    id: 'akademia-nhh-butikkstruktur-2024',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The record is a repo-authored topical synthesis; no exact external publication matching the stored report identity was found.',
  },
  {
    entity: 'Report',
    id: 'akademia-nhh-foros-media-2025',
    targetType: 'blocked_source',
    reviewBasis:
      'The bound local PDF is Oystein Foros curriculum vitae, not the named media-and-price-competition publication.',
  },
  {
    entity: 'Report',
    id: 'akademia-nhh-matbors-historie',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The record is a repo-authored historical synthesis backed only by a generic NHH landing page, not one exact report.',
  },
  {
    entity: 'Report',
    id: 'akademia-sifo-kundeprogram-2026',
    targetType: 'external_report',
    reviewBasis:
      'Exact SIFO Report 1-2026 identity was verified against the complete OsloMet report and repository record.',
  },
  {
    entity: 'Report',
    id: 'akademia-sifo-retail-media-2025',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The stored title is a repo-authored topical synthesis and could not be resolved to an exact SIFO publication.',
  },
  {
    entity: 'Report',
    id: 'akademia-uib-kjopermakt',
    targetType: 'blocked_source',
    reviewBasis:
      'The current person-page locator does not establish the identity of the claimed buyer-power publication.',
  },
  {
    entity: 'Report',
    id: 'coop-2024',
    targetType: 'external_report',
    reviewBasis:
      'The canonical Coop annual and sustainability report for 2024 was verified against the complete 103-page report.',
  },
  {
    entity: 'Report',
    id: 'coop-norge-2024',
    targetType: 'blocked_source',
    reviewBasis:
      'This is an alias of the canonical coop-2024 record and must not independently represent the same external report.',
  },
  {
    entity: 'Report',
    id: 'dk-salling-coop-decision-2025',
    targetType: 'external_report',
    reviewBasis:
      'The canonical Danish Competition and Consumer Authority decision was verified against the complete 76-page decision.',
  },
  {
    entity: 'Report',
    id: 'emv-kartlegging-2023',
    targetType: 'external_report',
    reviewBasis:
      'The canonical private-label mapping report was verified against Konkurransetilsynet Report 15-2023.',
  },
  {
    entity: 'Report',
    id: 'fivh-etikk-2025',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The record is a repo-authored synthesis whose currently bound external PDF does not establish the stored identity.',
  },
  {
    entity: 'Report',
    id: 'kfst-salling-coop-2025',
    targetType: 'blocked_source',
    reviewBasis:
      'This is an alias of dk-salling-coop-decision-2025; its full-text binding belongs to the canonical record.',
  },
  {
    entity: 'Report',
    id: 'nbs-systemkritikk',
    targetType: 'composite_source',
    reviewBasis:
      'The synthesis combines material from NBS, Ruralis, and event sources rather than one independently identifiable publication.',
  },
  {
    entity: 'Report',
    id: 'soa-emv-2023',
    targetType: 'blocked_source',
    reviewBasis:
      'This is an alias of emv-kartlegging-2023; its full-text and citation bindings require transfer to the canonical record.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-7',
    targetType: 'internal_primary',
    reviewBasis:
      'The reviewed file is the original internal Barth transition-group strategy document.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-20',
    targetType: 'external_publication',
    reviewBasis:
      'The named NHH and CEPR working paper is an external publication; the separately misbound Foros CV does not change that source nature.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-21',
    targetType: 'commissioned_report',
    reviewBasis:
      'SIFO prepared the customer-programme knowledge base through Ramboll for the responsible Norwegian ministries.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-23',
    targetType: 'external_publication',
    reviewBasis:
      'The record resolves to the independently published Stockholm Resilience Centre Nordic food-systems report.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-34',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The reviewed record is an internally authored synthesis rather than an external source artifact.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-51',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The reviewed record is an internally authored synthesis rather than an external source artifact.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-52',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The reviewed record is an internally authored synthesis rather than an external source artifact.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-79',
    targetType: 'official_primary',
    reviewBasis:
      'The source is the Danish Competition and Consumer Authority final merger decision issued in 2025.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-81',
    targetType: 'official_primary',
    reviewBasis:
      'The source is an official Statistics Finland publication based on the 2012 Household Budget Survey.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-82',
    targetType: 'advocacy_position',
    reviewBasis:
      'The market map is published by DLF and Delfi, an industry-association source with an interested-sector perspective.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-83',
    targetType: 'advocacy_position',
    reviewBasis:
      'The grocery-trade publication is issued by the Finnish Grocery Trade Association and is treated conservatively as an industry position source.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-86',
    targetType: 'external_publication',
    reviewBasis:
      'The source is an externally published NHH news and interview article authored by Reidar Molthe.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-90',
    targetType: 'external_publication',
    reviewBasis:
      'The source resolves to an independently published Tampere University dissertation in the Trepo repository.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-91',
    targetType: 'commissioned_report',
    reviewBasis:
      'The source is a report prepared for a Norwegian government-appointed committee and published in 2023.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-98',
    targetType: 'official_primary',
    reviewBasis:
      'The record is an official primary project record from the responsible public programme.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-99',
    targetType: 'official_primary',
    reviewBasis:
      'The record is the official 2021 AlgOpti public-project record, not a later secondary analysis.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-107',
    targetType: 'internal_primary',
    reviewBasis:
      'The reviewed Notion artifact is a first-party internal working record.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-108',
    targetType: 'internal_primary',
    reviewBasis:
      'The reviewed Notion artifact is a first-party internal working record.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-136',
    targetType: 'internal_synthesis',
    reviewBasis:
      'The reviewed record is an internal synthesis; a misbound Document does not establish an external publication identity.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-147',
    targetType: 'commissioned_report',
    reviewBasis:
      'The reviewed publication was produced under an external commissioning relationship rather than as official primary material.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-150',
    targetType: 'commissioned_report',
    reviewBasis:
      'The reviewed publication was produced under an external commissioning relationship rather than as official primary material.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-158',
    targetType: 'advocacy_position',
    reviewBasis:
      'The reviewed publication communicates the position of an interested advocacy or sector organization.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-163',
    targetType: 'advocacy_position',
    reviewBasis:
      'The reviewed publication communicates the position of an interested advocacy or sector organization.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-170',
    targetType: 'commissioned_report',
    reviewBasis:
      'The reviewed publication was produced under an external commissioning relationship rather than as official primary material.',
  },
  {
    entity: 'SourceDoc',
    id: 'src-182',
    targetType: 'commissioned_report',
    reviewBasis:
      'The reviewed publication was produced under an external commissioning relationship; its absent Document binding is a separate repair concern.',
  },
] as const satisfies readonly ReviewedProvenanceCompletionManifestEntry[]

export const REVIEWED_PROVENANCE_COMPLETION_MANIFEST = Object.freeze(
  RAW_REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map((entry) =>
    Object.freeze(entry),
  ),
) as readonly ReviewedProvenanceCompletionManifestEntry[]

const ALLOWED_REPORT_TARGET_TYPES = new Set<ReportProvenanceType>([
  'external_report',
  'external_article',
  'internal_synthesis',
  'internal_register',
  'composite_source',
  'blocked_source',
])

const ALLOWED_SOURCE_DOC_TARGET_TYPES = new Set<SourceDocCompletionTargetType>([
  'official_primary',
  'peer_reviewed',
  'corporate_self_report',
  'commissioned_report',
  'external_publication',
  'advocacy_position',
  'internal_primary',
  'internal_synthesis',
  'duplicate',
])

export const canonicalizeReviewedProvenanceCompletionJson =
  canonicalizeReviewedProvenanceJson

export function sha256ReviewedProvenanceCompletionJson(value: unknown) {
  return sha256ReviewedProvenanceJson(value)
}

export function validateReviewedProvenanceCompletionManifest(
  manifest: readonly ReviewedProvenanceCompletionManifestEntry[] =
    REVIEWED_PROVENANCE_COMPLETION_MANIFEST,
) {
  const reportRows = manifest.filter((row) => row.entity === 'Report')
  const sourceDocRows = manifest.filter((row) => row.entity === 'SourceDoc')
  const keys = manifest.map((row) => `${row.entity}:${row.id}`)
  if (
    manifest.length !== REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT ||
    reportRows.length !==
      REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT ||
    sourceDocRows.length !==
      REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT ||
    new Set(keys).size !== manifest.length
  ) {
    throw new Error(
      'Reviewed provenance completion manifest must contain exactly 14 Report and 25 SourceDoc rows',
    )
  }

  const historicalKeys = new Set(
    REVIEWED_PROVENANCE_MANIFEST.map((row) => `${row.entity}:${row.id}`),
  )
  const overlap = keys.filter((key) => historicalKeys.has(key))
  if (overlap.length > 0) {
    throw new Error(
      `Reviewed provenance completion overlaps the historical manifest: ${overlap.join(', ')}`,
    )
  }

  for (const row of manifest) {
    if (row.id.trim().length === 0 || row.reviewBasis.trim().length === 0) {
      throw new Error(
        `Reviewed provenance completion requires nonempty id and reviewBasis: ${row.entity}:${row.id}`,
      )
    }
    if (
      (row.entity === 'Report' &&
        !ALLOWED_REPORT_TARGET_TYPES.has(row.targetType)) ||
      (row.entity === 'SourceDoc' &&
        !ALLOWED_SOURCE_DOC_TARGET_TYPES.has(row.targetType))
    ) {
      throw new Error(
        `Reviewed provenance completion target type is invalid for ${row.entity}:${row.id}`,
      )
    }
  }

  const unresolvedKeys = new Set(['SourceDoc:src-77', 'SourceDoc:src-87'])
  if (keys.some((key) => unresolvedKeys.has(key))) {
    throw new Error(
      'Reviewed provenance completion contains a deliberately unresolved SourceDoc',
    )
  }

  return manifest
}

export const PINNED_REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256 =
  'de6a42f76e16615808d93888b611199d4de22afd37c9a0d0ceee9cae332a043b' as const

export const REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256 =
  sha256ReviewedProvenanceCompletionJson(
    validateReviewedProvenanceCompletionManifest(),
  )

if (
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256 !==
  PINNED_REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256
) {
  throw new Error(
    'Reviewed provenance completion manifest SHA-256 drifted from the approved 39-row contract',
  )
}

function completionTargetMap(entity: 'Report' | 'SourceDoc') {
  return new Map(
    REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      (row) => row.entity === entity,
    ).map((row) => [row.id, row.targetType]),
  )
}

function assertCompletionSeedCoverage(
  entity: 'Report' | 'SourceDoc',
  seen: ReadonlySet<string>,
  expected: ReadonlyMap<string, ReportProvenanceType | SourceDocCompletionTargetType>,
) {
  const missing = [...expected.keys()].filter((id) => !seen.has(id))
  if (missing.length > 0) {
    throw new Error(
      `Reviewed provenance completion ${entity} seed rows are missing: ${missing.join(', ')}`,
    )
  }
}

export function applyReviewedReportProvenanceCompletionToSeed(
  rows: readonly Report[],
): Report[] {
  const targets = completionTargetMap('Report')
  const seen = new Set<string>()
  const result = rows.map((row) => {
    const target = targets.get(row.id) as ReportProvenanceType | undefined
    if (!target) return row
    if (seen.has(row.id)) {
      throw new Error(
        `Duplicate reviewed provenance completion Report seed id: ${row.id}`,
      )
    }
    seen.add(row.id)
    if (row.provenanceType !== undefined && row.provenanceType !== target) {
      throw new Error(
        `Reviewed provenance completion Report seed conflict: ${row.id}`,
      )
    }
    return { ...row, provenanceType: target }
  })
  assertCompletionSeedCoverage('Report', seen, targets)
  return result
}

export function applyReviewedSourceDocProvenanceCompletionToSeed(
  rows: readonly SourceDoc[],
): SourceDoc[] {
  const targets = completionTargetMap('SourceDoc')
  const seen = new Set<string>()
  const result = rows.map((row) => {
    const target = targets.get(row.id) as
      | SourceDocCompletionTargetType
      | undefined
    if (!target) return row
    if (seen.has(row.id)) {
      throw new Error(
        `Duplicate reviewed provenance completion SourceDoc seed id: ${row.id}`,
      )
    }
    seen.add(row.id)
    if (
      row.provenanceType !== undefined &&
      row.provenanceType !== 'unknown' &&
      row.provenanceType !== target
    ) {
      throw new Error(
        `Reviewed provenance completion SourceDoc seed conflict: ${row.id}`,
      )
    }
    return { ...row, provenanceType: target }
  })
  assertCompletionSeedCoverage('SourceDoc', seen, targets)
  return result
}

export type ReviewedProvenanceCompletionRowStatus =
  | 'pending'
  | 'applied'
  | 'conflict'

export function classifyReviewedProvenanceCompletionCurrent(
  entry: ReviewedProvenanceCompletionManifestEntry,
  current: string | null | undefined,
): ReviewedProvenanceCompletionRowStatus {
  if (current === entry.targetType) return 'applied'
  if (entry.entity === 'Report' && current === null) return 'pending'
  if (entry.entity === 'SourceDoc' && current === 'unknown') return 'pending'
  return 'conflict'
}

export function assertReviewedProvenanceCompletionStateIsAtomic(
  statuses: readonly ReviewedProvenanceCompletionRowStatus[],
) {
  if (statuses.length !== REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT) {
    throw new Error(
      `Reviewed provenance completion state must contain ${REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT} rows`,
    )
  }
  if (statuses.includes('conflict')) {
    throw new Error('Reviewed provenance completion state contains conflicts')
  }
  const pending = statuses.filter((status) => status === 'pending').length
  const applied = statuses.filter((status) => status === 'applied').length
  if (pending > 0 && applied > 0) {
    throw new Error(
      'Reviewed provenance completion state is mixed/partially applied',
    )
  }
  return { pending, applied }
}
