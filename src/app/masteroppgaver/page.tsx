'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { theses, themeLabels } from '@/lib/data/theses'
import type { ThesisTheme } from '@/lib/types'

const THEME_COLORS: Record<ThesisTheme, string> = {
  konsentrasjon: 'bg-red-50 text-red-700 border-red-200',
  makt: 'bg-orange-50 text-orange-700 border-orange-200',
  etableringshindringer: 'bg-amber-50 text-amber-700 border-amber-200',
  regulering: 'bg-violet-50 text-violet-700 border-violet-200',
  verdikjede: 'bg-blue-50 text-blue-700 border-blue-200',
  prising: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  emv: 'bg-pink-50 text-pink-700 border-pink-200',
  nordisk: 'bg-sky-50 text-sky-700 border-sky-200',
}

const themeFilters = [
  { label: 'Alle', value: 'alle' },
  ...Object.entries(themeLabels).map(([value, label]) => {
    const count = theses.filter(t => t.tags.includes(value as ThesisTheme)).length
    return { label: `${label} (${count})`, value }
  }),
]

export default function MasteroppgaverPage() {
  const [themeFilter, setThemeFilter] = useState('alle')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const filtered = theses.filter(t =>
    themeFilter === 'alle' || t.tags.includes(themeFilter as ThesisTheme)
  )

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Masteroppgaver</h1>
        <p className="text-sm text-stone-400 mt-1">
          Syntese og stikkord fra {theses.length} analyserte masteroppgaver om norsk dagligvare
        </p>
      </div>

      <FilterChips items={themeFilters} defaultValue="alle" onChange={setThemeFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Ingen oppgaver med dette temaet" />
      ) : (
        <div className="space-y-3">
          {filtered.map(thesis => {
            const isExpanded = expandedIds.has(thesis.id)

            return (
              <Card key={thesis.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(thesis.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-800 truncate">
                        {thesis.titleNo || thesis.title}
                      </h3>
                      {thesis.awardWinning && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                          Prisvinnende
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                      <span>{thesis.authors}</span>
                      <span>·</span>
                      <span>{thesis.institution}</span>
                      <span>·</span>
                      <span>{thesis.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[200px]">
                    {thesis.tags.map(tag => (
                      <span
                        key={tag}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${THEME_COLORS[tag]}`}
                      >
                        {themeLabels[tag]}
                      </span>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Syntese</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{thesis.synthesis}</p>
                      </div>

                      {thesis.method && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Metode</p>
                          <p className="text-sm text-stone-600">{thesis.method}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1.5">Nokkelfunn</p>
                        <ul className="space-y-1">
                          {thesis.keyFindings.map((finding, i) => (
                            <li key={i} className="text-sm text-stone-600 flex gap-2">
                              <span className="text-stone-300 shrink-0">—</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5">Uttak for videre prosesser</p>
                        <ul className="space-y-1">
                          {thesis.takeaways.map((takeaway, i) => (
                            <li key={i} className="text-sm text-emerald-800 flex gap-2">
                              <span className="text-emerald-400 shrink-0">→</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {thesis.url && (
                        <div className="pt-1">
                          <a
                            href={thesis.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
                          >
                            Les fulltext →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
