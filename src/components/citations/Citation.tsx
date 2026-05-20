import type { CitationReadinessLevel } from '@/lib/citations/citation-status'
import { normalizeCitationReadiness } from '@/lib/citations/citation-status'

export type CitationViewModel = {
  citationText?: string | null
  title?: string | null
  label?: string | null
  url?: string | null
  localPath?: string | null
  pageRef?: string | null
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
  citationReadiness?: CitationReadinessLevel | string | null
  note?: string | null
  notes?: string | null
}

type CitationProps = {
  citation: CitationViewModel
  compact?: boolean
  className?: string
}

const READINESS_LABELS: Record<CitationReadinessLevel, string> = {
  citable_external: 'Eksternt siterbar',
  citable_with_note: 'Siterbar med forbehold',
  internal_context: 'Intern kontekst',
  blocked_unsourced: 'Blokkert',
}

const READINESS_CLASSES: Record<CitationReadinessLevel, string> = {
  citable_external: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  citable_with_note: 'border-amber-200 bg-amber-50 text-amber-800',
  internal_context: 'border-stone-200 bg-stone-50 text-stone-600',
  blocked_unsourced: 'border-rose-200 bg-rose-50 text-rose-700',
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

export function Citation({ citation, compact = false, className = '' }: CitationProps) {
  const readiness = normalizeCitationReadiness(citation.citationReadiness)
  const label = citation.label ?? citation.title ?? citation.citationText ?? citation.url ?? citation.localPath ?? 'Kilde'
  const note = citation.note ?? citation.notes ?? null
  const date = formatDate(citation.verifiedAt) ?? formatDate(citation.accessedAt)
  const readinessLabel = READINESS_LABELS[readiness]

  return (
    <span className={`inline-flex max-w-full flex-wrap items-center gap-1.5 text-xs ${className}`}>
      <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${READINESS_CLASSES[readiness]}`}>
        {readinessLabel}
      </span>
      {citation.url ? (
        <a
          href={citation.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 break-words text-stone-600 underline underline-offset-2 hover:text-stone-900"
        >
          {label}
        </a>
      ) : (
        <span className="min-w-0 break-words text-stone-600">{label}</span>
      )}
      {citation.pageRef && <span className="text-stone-400">s. {citation.pageRef}</span>}
      {!compact && date && <span className="text-stone-400">verifisert {date}</span>}
      {!compact && note && <span className="text-stone-400">({note})</span>}
      {!compact && citation.localPath && !citation.url && (
        <span className="break-all font-mono text-[10px] text-stone-400">{citation.localPath}</span>
      )}
    </span>
  )
}
