import type { SourceDocProvenanceType } from '../types'

export const EXTERNAL_SOURCE_DOC_PROVENANCE = new Set<SourceDocProvenanceType>([
  'official_primary',
  'peer_reviewed',
  'corporate_self_report',
  'commissioned_report',
  'external_publication',
  'advocacy_position',
])

export const INTERNAL_SOURCE_DOC_PROVENANCE = new Set<SourceDocProvenanceType>([
  'internal_primary',
  'internal_synthesis',
  'duplicate',
])

export function normalizedSourceDocProvenance(value: unknown): SourceDocProvenanceType {
  const normalized = typeof value === 'string' ? value.trim() : ''
  if (EXTERNAL_SOURCE_DOC_PROVENANCE.has(normalized as SourceDocProvenanceType)) {
    return normalized as SourceDocProvenanceType
  }
  if (INTERNAL_SOURCE_DOC_PROVENANCE.has(normalized as SourceDocProvenanceType)) {
    return normalized as SourceDocProvenanceType
  }
  return 'unknown'
}

export function knownSourceDocProvenance(value: unknown): string | null {
  const provenance = normalizedSourceDocProvenance(value)
  return provenance === 'unknown' ? null : provenance
}

export function sourceDocNeedsPublicLocator(row: { provenanceType?: unknown }): boolean {
  return EXTERNAL_SOURCE_DOC_PROVENANCE.has(normalizedSourceDocProvenance(row.provenanceType))
}

export function sourceDocIsInternalEvidence(row: { provenanceType?: unknown }): boolean {
  return INTERNAL_SOURCE_DOC_PROVENANCE.has(normalizedSourceDocProvenance(row.provenanceType))
}

export function sourceClassForSourceDocProvenance(value: unknown):
  | 'primary'
  | 'secondary'
  | 'internal_primary'
  | 'internal_synthesis'
  | 'legacy_unsourced'
  | 'unknown' {
  const provenance = normalizedSourceDocProvenance(value)
  if (['official_primary', 'corporate_self_report'].includes(provenance)) return 'primary'
  if (['peer_reviewed', 'commissioned_report', 'external_publication', 'advocacy_position'].includes(provenance)) return 'secondary'
  if (provenance === 'internal_primary') return 'internal_primary'
  if (provenance === 'internal_synthesis') return 'internal_synthesis'
  if (provenance === 'duplicate') return 'legacy_unsourced'
  return 'unknown'
}
