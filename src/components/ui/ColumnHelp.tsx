import type { ReactNode } from 'react'
import { getGlossaryTerm, type GlossaryCategory } from '@/lib/glossary/terms'

type ColumnHelpProps = {
  term: string
  label?: ReactNode
  category?: GlossaryCategory
  align?: 'left' | 'right'
  className?: string
}

export function ColumnHelp({
  term,
  label,
  category = 'kolonner',
  align = 'left',
  className = '',
}: ColumnHelpProps) {
  const entry = getGlossaryTerm(term, category)
  if (!entry) return <>{label ?? term}</>

  const tooltip = entry.reading ? `${entry.definition} ${entry.reading}` : entry.definition

  return (
    <span
      className={`group relative inline-flex items-center gap-1 align-middle ${
        align === 'right' ? 'justify-end' : ''
      } ${className}`}
    >
      <span>{label ?? entry.term}</span>
      <span
        tabIndex={0}
        aria-label={`Forklaring: ${entry.term}`}
        title={tooltip}
        className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-[9px] font-bold leading-none text-stone-500 normal-case tracking-normal"
      >
        i
      </span>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-full z-50 mt-1 hidden w-64 rounded-md border border-stone-200 bg-white p-2 text-left text-[11px] font-normal leading-snug text-stone-600 shadow-lg normal-case tracking-normal group-hover:block group-focus-within:block ${
          align === 'right' ? 'right-0' : 'left-0'
        }`}
      >
        <span className="block font-semibold text-stone-800">{entry.term}</span>
        <span className="mt-0.5 block">{entry.definition}</span>
        {entry.reading && <span className="mt-1 block text-stone-400">{entry.reading}</span>}
      </span>
    </span>
  )
}
