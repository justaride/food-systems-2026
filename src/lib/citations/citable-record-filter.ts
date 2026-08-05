import {
  normalizeCitationReadiness,
  type CitationReadinessLevel,
} from './citation-status'
import {
  applyReportProvenanceCitationCeiling,
  reportProvenanceCitationCeiling,
} from './report-provenance'

export type ExternalUseCitation = {
  citationReadiness?: unknown
  citationText?: string | null
  note?: string | null
  notes?: string | null
}

export type ExternalUseRecord = {
  id?: string | number | null
  provenanceType?: unknown
  citations?: ExternalUseCitation[] | null
}

export type ExternalUseExclusionReason =
  | 'missing_citations'
  | 'blocked_unsourced'
  | 'internal_context'
  | 'citable_with_note_missing_note'

export type ExternalUseEvaluation = {
  usable: boolean
  readiness?: CitationReadinessLevel
  reason?: ExternalUseExclusionReason
}

export type ExternalUseSummary = {
  total: number
  usable: number
  excluded: number
  byReason: Partial<Record<ExternalUseExclusionReason, number>>
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasRequiredNote(record: ExternalUseRecord, citation: ExternalUseCitation) {
  return hasText(citation.note) || hasText(citation.notes) || hasText((record as { citationNote?: unknown }).citationNote)
}

function recordLabel(record: ExternalUseRecord, index: number) {
  const id = record.id
  if (id === undefined || id === null || id === '') return `record[${index}]`
  return String(id)
}

function readableReason(reason: ExternalUseExclusionReason | undefined) {
  return (reason ?? 'blocked_unsourced').replaceAll('_', ' ')
}

export function evaluateExternalCitationReadiness(record: ExternalUseRecord): ExternalUseEvaluation {
  const provenanceCeiling = reportProvenanceCitationCeiling(record)
  if (!Array.isArray(record.citations) || record.citations.length === 0) {
    if (provenanceCeiling) {
      return {
        usable: false,
        readiness: provenanceCeiling,
        reason: provenanceCeiling,
      }
    }
    return { usable: false, reason: 'missing_citations' }
  }

  let strongest: CitationReadinessLevel = 'citable_external'

  for (const citation of record.citations) {
    const readiness = provenanceCeiling
      ? applyReportProvenanceCitationCeiling(record, citation.citationReadiness)
      : normalizeCitationReadiness(citation.citationReadiness)

    if (readiness === 'blocked_unsourced') {
      return { usable: false, readiness, reason: 'blocked_unsourced' }
    }
    if (readiness === 'internal_context') {
      return { usable: false, readiness, reason: 'internal_context' }
    }
    if (readiness === 'citable_with_note') {
      if (!hasRequiredNote(record, citation)) {
        return { usable: false, readiness, reason: 'citable_with_note_missing_note' }
      }
      strongest = 'citable_with_note'
    }
  }

  return { usable: true, readiness: strongest }
}

export function canUseExternally(record: ExternalUseRecord) {
  return evaluateExternalCitationReadiness(record).usable
}

export function filterExternalRecords<T extends ExternalUseRecord>(records: T[]) {
  return records.filter(canUseExternally)
}

export function summarizeExternalExclusions(records: ExternalUseRecord[]): ExternalUseSummary {
  const summary: ExternalUseSummary = {
    total: records.length,
    usable: 0,
    excluded: 0,
    byReason: {},
  }

  for (const record of records) {
    const evaluation = evaluateExternalCitationReadiness(record)
    if (evaluation.usable) {
      summary.usable += 1
      continue
    }

    summary.excluded += 1
    const reason = evaluation.reason ?? 'blocked_unsourced'
    summary.byReason[reason] = (summary.byReason[reason] ?? 0) + 1
  }

  return summary
}

export function assertExternalCitationReadiness(
  records: ExternalUseRecord[],
  context: string,
): asserts records is Array<ExternalUseRecord & { citations: ExternalUseCitation[] }> {
  const failures = records.flatMap((record, index) => {
    const evaluation = evaluateExternalCitationReadiness(record)
    if (evaluation.usable) return []

    return `${recordLabel(record, index)}: ${readableReason(evaluation.reason)}`
  })

  if (failures.length > 0) {
    throw new Error(`${context} has records that are not externally citable: ${failures.join('; ')}`)
  }
}
