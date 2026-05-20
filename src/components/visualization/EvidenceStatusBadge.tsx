import { getEvidenceStatusConfig } from '@/lib/visualization/status'
import type { EvidenceStatus } from '@/lib/visualization/types'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import { normalizeCitationReadiness } from '@/lib/citations/citation-status'

type EvidenceStatusBadgeProps = {
  status: EvidenceStatus
  prefix?: string
  detail?: string
  className?: string
  citationReadiness?: CitationReadinessLevel | string
  citationNote?: string
}

const CITATION_LABELS: Record<CitationReadinessLevel, string> = {
  citable_external: 'citable',
  citable_with_note: 'forbehold',
  internal_context: 'intern',
  blocked_unsourced: 'blokkert',
}

export function EvidenceStatusBadge({
  status,
  prefix = 'Datastatus',
  detail,
  className = '',
  citationReadiness,
  citationNote,
}: EvidenceStatusBadgeProps) {
  const config = getEvidenceStatusConfig(status)
  const readiness = citationReadiness ? normalizeCitationReadiness(citationReadiness) : null
  const citationText = readiness ? ` Ekstern bruk: ${CITATION_LABELS[readiness]}. ${citationNote ?? ''}` : ''
  const accessibleText = `${prefix}: ${config.label}. ${detail ?? config.description}${citationText}`

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${config.className} ${className}`}
      aria-label={accessibleText}
      title={detail ?? config.description}
    >
      <span className="text-[10px] uppercase tracking-wide opacity-75">{prefix}</span>
      <span>{config.label}</span>
      {readiness && (
        <span className="border-l border-current/20 pl-1 text-[10px] uppercase tracking-wide opacity-75">
          {CITATION_LABELS[readiness]}
        </span>
      )}
    </span>
  )
}
