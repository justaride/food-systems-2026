'use client'

import { useState } from 'react'
import { GLOSSARY_TERMS, getGlossaryTerm, type GlossaryCategory, type GlossaryTerm } from '@/lib/glossary/terms'

export function Glossary({
  category,
  terms,
  title = 'Begrepsforklaringer',
  defaultOpen = false,
}: {
  category: GlossaryCategory
  terms?: readonly string[]
  title?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const entries = terms
    ? terms
        .map((term) => getGlossaryTerm(term, category))
        .filter((entry): entry is GlossaryTerm => Boolean(entry))
    : GLOSSARY_TERMS.filter((t) => t.category === category)
  if (entries.length === 0) return null
  const summary = entries.map((e) => e.term).join(' · ')

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors rounded-lg"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</span>
          <span className="min-w-0 truncate text-[10px] text-stone-400">{summary}</span>
        </div>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <dl className="px-4 pb-4 pt-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 border-t border-stone-100">
          {entries.map((entry) => (
            <div key={entry.term} className="text-xs">
              <dt className="font-semibold text-stone-800 mb-0.5">{entry.term}</dt>
              <dd className="text-stone-600 leading-relaxed">{entry.definition}</dd>
              {entry.reading && (
                <dd className="text-[10px] text-stone-400 mt-1 font-mono">{entry.reading}</dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
