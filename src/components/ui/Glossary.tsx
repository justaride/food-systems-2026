'use client'

import { useState } from 'react'
import { GLOSSARY_TERMS, type GlossaryCategory } from '@/lib/glossary/terms'

export function Glossary({
  category,
  title = 'Begrepsforklaringer',
  defaultOpen = false,
}: {
  category: GlossaryCategory
  title?: string
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const entries = GLOSSARY_TERMS.filter((t) => t.category === category)
  if (entries.length === 0) return null
  const summary = entries.map((e) => e.term).join(' · ')

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">{title}</span>
          <span className="text-[10px] text-stone-400">{summary}</span>
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
