import type { ReportProvenanceType } from '../types'
import { compareCitationReadiness, normalizeCitationReadiness, type CitationReadinessLevel } from './citation-status'

export const EXTERNAL_REPORT_PROVENANCE = new Set<ReportProvenanceType>(['external_report', 'external_article'])

export const INTERNAL_REPORT_PROVENANCE = new Set<ReportProvenanceType>([
  'internal_synthesis',
  'internal_register',
  'composite_source',
  'blocked_source',
])

export function normalizedReportProvenance(value: unknown): ReportProvenanceType | 'unknown' {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (EXTERNAL_REPORT_PROVENANCE.has(normalized as ReportProvenanceType)) {
    return normalized as ReportProvenanceType
  }
  if (INTERNAL_REPORT_PROVENANCE.has(normalized as ReportProvenanceType)) {
    return normalized as ReportProvenanceType
  }
  return 'unknown'
}

export function knownReportProvenance(value: unknown): string | null {
  const provenance = normalizedReportProvenance(value)
  return provenance === 'unknown' ? null : provenance
}

export function reportNeedsPublicLocator(row: { provenanceType?: unknown }): boolean {
  return EXTERNAL_REPORT_PROVENANCE.has(normalizedReportProvenance(row.provenanceType) as ReportProvenanceType)
}

export function reportIsInternalEvidence(row: { provenanceType?: unknown }): boolean {
  return INTERNAL_REPORT_PROVENANCE.has(normalizedReportProvenance(row.provenanceType) as ReportProvenanceType)
}

export type ReportProvenanceCitationCeiling = Extract<CitationReadinessLevel, 'blocked_unsourced' | 'internal_context'>

/**
 * Row-level Report provenance is an upper bound on citation readiness.
 * Composite records stay internal here because this surface has no explicit
 * claim-/FieldCitation authorization contract for individual claims.
 */
export function reportProvenanceCitationCeiling(row: {
  provenanceType?: unknown
}): ReportProvenanceCitationCeiling | null {
  const provenance = normalizedReportProvenance(row.provenanceType)
  // Generic citation-filter callers may omit provenance entirely. When a
  // Report surface explicitly supplies the field, however, an unknown or
  // drifted value must fail closed just like a blocked Report.
  if (
    provenance === 'unknown'
    && Object.prototype.hasOwnProperty.call(row, 'provenanceType')
  ) {
    return 'blocked_unsourced'
  }
  if (provenance === 'blocked_source') return 'blocked_unsourced'
  if (provenance === 'internal_synthesis' || provenance === 'internal_register' || provenance === 'composite_source') {
    return 'internal_context'
  }
  return null
}

export function applyReportProvenanceCitationCeiling(
  row: { provenanceType?: unknown },
  readiness: unknown,
): CitationReadinessLevel {
  const normalized = normalizeCitationReadiness(readiness)
  const ceiling = reportProvenanceCitationCeiling(row)
  if (!ceiling) return normalized
  return compareCitationReadiness(normalized, ceiling) > 0 ? ceiling : normalized
}
