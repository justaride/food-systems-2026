'use client'

import { useState } from 'react'

type GlossaryEntry = {
  term: string
  definition: string
  reading?: string
}

const ENTRIES: GlossaryEntry[] = [
  {
    term: 'HHI',
    definition:
      'Herfindahl-Hirschman Index — sum av kvadrerte markedsandeler. Viser konsentrasjon i markedet.',
    reading: '< 1500 lavt · 1500–2500 moderat · > 2500 høyt konsentrert',
  },
  {
    term: 'Gini',
    definition:
      'Gini-koeffisient — mål på ulikhet i fordeling. Her brukt på butikktilgang per innbygger.',
    reading: '0 = perfekt likhet · 1 = maksimal ulikhet',
  },
  {
    term: 'CR3',
    definition: 'Concentration Ratio 3 — samlet markedsandel for de tre største aktørene.',
    reading: '> 70% indikerer oligopol',
  },
  {
    term: 'Zipf',
    definition:
      'Zipfs lov — empirisk fordeling der antall ≈ konstant / rang. Brukes til å sjekke om butikknettverket følger naturlig urban-fordeling.',
    reading: 'R² nær 1 og helling ≈ −1 = følger Zipf',
  },
  {
    term: 'Lorenz-kurve',
    definition:
      'Visuell fremstilling av ulikhet. Diagonalen = perfekt likhet; jo lengre kurven bøyer ut, jo større ulikhet.',
  },
]

export function InsightGlossary() {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            Begrepsforklaringer
          </span>
          <span className="text-[10px] text-stone-400">HHI · Gini · CR3 · Zipf · Lorenz</span>
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
          {ENTRIES.map((entry) => (
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
