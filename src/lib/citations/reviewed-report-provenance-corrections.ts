import type { Report, ReportProvenanceType } from '../types'
import {
  REVIEWED_PROVENANCE_MANIFEST,
  sha256ReviewedProvenanceJson,
} from './reviewed-provenance-batch'
import { REVIEWED_PROVENANCE_COMPLETION_MANIFEST } from './reviewed-provenance-completion'

export const REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION =
  '2026-07-20-v1' as const
export const REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT = 7 as const
export const REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT =
  '2026-07-20' as const

export type ReviewedReportProvenanceCorrectionManifestEntry = Readonly<{
  entity: 'Report'
  id: string
  expectedCurrentType: ReportProvenanceType
  targetType: ReportProvenanceType
  reviewedAt: string
  reviewBasis: string
  evidenceRefs: readonly string[]
}>

const RAW_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST = [
  {
    entity: 'Report',
    id: 'beredskap-finsk-modell-hvk',
    expectedCurrentType: 'external_report',
    targetType: 'composite_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The stored row is a synthesis of the HVK model and operational claims. Its generic security-of-supply locator does not identify one named 2024 report matching that record.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/bibliotek/beredskap/finsk-modell-hvk.md',
    ],
  },
  {
    entity: 'Report',
    id: 'is-markedsstruktur-2024',
    expectedCurrentType: 'external_report',
    targetType: 'composite_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The stored row combines an annual report, the Festi-Lyfja decision, and earlier market studies. The locator is a report index, not one work matching the synthetic title.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md',
    ],
  },
  {
    entity: 'Report',
    id: 'kbh-food-strategy-madhus',
    expectedCurrentType: 'external_report',
    targetType: 'composite_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The stored 2025 row combines a municipal strategy, implementation status, and metrics from multiple periods. Its hub links a separate 2021 status publication rather than one matching work.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/evidence-pack/bransje/kbh-food-strategy-madhus.md',
      'research/evidence-pack/source-notes/kbh-food-strategy-madhus.md',
    ],
  },
  {
    entity: 'Report',
    id: 'kt-markedsundersokelser-2026',
    expectedCurrentType: 'external_report',
    targetType: 'external_article',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The authoritative locator is a government press release dated 2025-07-01 about the new market-investigation tool, not a named 2026 report.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/bibliotek/konkurransetilsynet/markedsundersokelser-status.md',
    ],
  },
  {
    entity: 'Report',
    id: 'plantefonden-projects-2023-2025',
    expectedCurrentType: 'external_report',
    targetType: 'composite_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The row aggregates a homepage, project bank, grant catalogues, and annual reporting across 2023-2025; no single named publication carries the stored identity.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/evidence-pack/bransje/plantefonden-projects-2023-2025.md',
      'research/evidence-pack/source-notes/plantefonden-projects-2023-2025.md',
    ],
  },
  {
    entity: 'Report',
    id: 'reitan-2024-25',
    expectedCurrentType: 'external_report',
    targetType: 'blocked_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The row combines a 2024 annual report with preliminary 2025 figures, while the archive contains separate works and the local factsheet supplies no claim-level citations to resolve the mixture.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/bibliotek/bransje/arsrapporter/reitan-2024-25.md',
    ],
  },
  {
    entity: 'Report',
    id: 'sodertaelje-diet-green-planet',
    expectedCurrentType: 'external_report',
    targetType: 'composite_source',
    reviewedAt: REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT,
    reviewBasis:
      'The row aggregates municipal programme claims, while the current DiVA locator resolves to a different 2024 bachelor thesis and cannot establish one matching 2023 publication.',
    evidenceRefs: [
      'research/_status/reviewed-report-access-date-repair-receipt-2026-07-20.md',
      'research/evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md',
    ],
  },
] as const satisfies readonly ReviewedReportProvenanceCorrectionManifestEntry[]

export const REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST = Object.freeze(
  RAW_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) =>
    Object.freeze({
      ...entry,
      evidenceRefs: Object.freeze([...entry.evidenceRefs]),
    }),
  ),
) as readonly ReviewedReportProvenanceCorrectionManifestEntry[]

const ALLOWED_REPORT_PROVENANCE_TYPES = new Set<ReportProvenanceType>([
  'external_report',
  'external_article',
  'internal_synthesis',
  'internal_register',
  'composite_source',
  'blocked_source',
])

const EXPECTED_CORRECTION_IDS = new Set([
  'beredskap-finsk-modell-hvk',
  'is-markedsstruktur-2024',
  'kbh-food-strategy-madhus',
  'kt-markedsundersokelser-2026',
  'plantefonden-projects-2023-2025',
  'reitan-2024-25',
  'sodertaelje-diet-green-planet',
])

export function validateReviewedReportProvenanceCorrectionManifest(
  manifest: readonly ReviewedReportProvenanceCorrectionManifestEntry[] =
    REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
) {
  const ids = manifest.map((entry) => entry.id)
  const uniqueIds = new Set(ids)
  const missingIds = [...EXPECTED_CORRECTION_IDS].filter(
    (id) => !uniqueIds.has(id),
  )
  const unexpectedIds = [...uniqueIds].filter(
    (id) => !EXPECTED_CORRECTION_IDS.has(id),
  )
  if (
    manifest.length !== REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT ||
    uniqueIds.size !== manifest.length ||
    missingIds.length > 0 ||
    unexpectedIds.length > 0
  ) {
    throw new Error(
      `Reviewed Report provenance correction manifest must contain the exact 7 approved ids; missing=${missingIds.join(',') || 'none'} unexpected=${unexpectedIds.join(',') || 'none'}`,
    )
  }

  const historicalReportTargets = new Map(
    REVIEWED_PROVENANCE_MANIFEST.filter(
      (entry) => entry.entity === 'Report',
    ).map((entry) => [entry.id, entry.targetType]),
  )
  const completionIds = new Set(
    REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      (entry) => entry.entity === 'Report',
    ).map((entry) => entry.id),
  )

  for (const entry of manifest) {
    if (entry.entity !== 'Report') {
      throw new Error(
        `Reviewed Report provenance correction entity is invalid: ${entry.id}`,
      )
    }
    if (
      entry.id.trim().length === 0 ||
      entry.reviewBasis.trim().length === 0 ||
      entry.reviewedAt !== REVIEWED_REPORT_PROVENANCE_CORRECTION_REVIEWED_AT ||
      entry.evidenceRefs.length === 0 ||
      entry.evidenceRefs.some(
        (ref) =>
          ref.trim().length === 0 ||
          ref !== ref.trim() ||
          !ref.startsWith('research/'),
      ) ||
      new Set(entry.evidenceRefs).size !== entry.evidenceRefs.length
    ) {
      throw new Error(
        `Reviewed Report provenance correction evidence contract is invalid: ${entry.id}`,
      )
    }
    if (
      !ALLOWED_REPORT_PROVENANCE_TYPES.has(entry.expectedCurrentType) ||
      !ALLOWED_REPORT_PROVENANCE_TYPES.has(entry.targetType) ||
      entry.expectedCurrentType === entry.targetType
    ) {
      throw new Error(
        `Reviewed Report provenance correction type transition is invalid: ${entry.id}`,
      )
    }
    if (completionIds.has(entry.id)) {
      throw new Error(
        `Reviewed Report provenance correction overlaps the completion manifest: ${entry.id}`,
      )
    }
    const historicalTarget = historicalReportTargets.get(entry.id)
    if (historicalTarget !== entry.expectedCurrentType) {
      throw new Error(
        `Reviewed Report provenance correction historical contract drifted: ${entry.id}; expected=${entry.expectedCurrentType} actual=${historicalTarget ?? 'missing'}`,
      )
    }
  }

  return manifest
}

export const REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256 =
  sha256ReviewedProvenanceJson(
    validateReviewedReportProvenanceCorrectionManifest(),
  )

export const PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256 =
  '50439ce9a76fbcbd842abd7a8d101c509ad5eb1fc9a20b8ac12075b8f7326d8d' as const

if (
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256 !==
  PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256
) {
  throw new Error(
    'Reviewed Report provenance correction manifest SHA-256 drifted from the approved 7-row contract',
  )
}

export function applyReviewedReportProvenanceCorrectionsToSeed(
  rows: readonly Report[],
): Report[] {
  const corrections = new Map(
    validateReviewedReportProvenanceCorrectionManifest().map((entry) => [
      entry.id,
      entry,
    ]),
  )
  const seen = new Set<string>()
  const result = rows.map((row) => {
    const correction = corrections.get(row.id)
    if (!correction) return row
    if (seen.has(row.id)) {
      throw new Error(
        `Duplicate reviewed Report provenance correction seed id: ${row.id}`,
      )
    }
    seen.add(row.id)
    if (
      row.provenanceType !== correction.expectedCurrentType &&
      row.provenanceType !== correction.targetType
    ) {
      throw new Error(
        `Reviewed Report provenance correction seed conflict: ${row.id}; expected=${correction.expectedCurrentType}|${correction.targetType} actual=${row.provenanceType ?? 'missing'}`,
      )
    }
    return row.provenanceType === correction.targetType
      ? row
      : { ...row, provenanceType: correction.targetType }
  })

  const missing = [...corrections.keys()].filter((id) => !seen.has(id))
  if (missing.length > 0) {
    throw new Error(
      `Reviewed Report provenance correction seed rows are missing: ${missing.join(', ')}`,
    )
  }
  return result
}
