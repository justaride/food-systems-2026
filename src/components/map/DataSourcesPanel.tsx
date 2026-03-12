'use client'

import { useState } from 'react'
import { useMapContext } from '@/lib/map/MapContext'

export default function DataSourcesPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)
  const { countryConfig } = useMapContext()

  const dataSources = countryConfig?.dataSources ?? []

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-stone-200/80 shadow-sm hover:bg-stone-50 transition-colors text-sm text-stone-600"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        Datakilder
      </button>

      {isOpen && (
        <div className="absolute bottom-0 left-0 right-0 z-[1001] bg-white border-t border-stone-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] max-h-[50vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100 shrink-0">
            <div>
              <h3 className="text-sm font-semibold text-stone-800">Datakilder og sporbarhet</h3>
              <p className="text-xs text-stone-400 mt-0.5">Oversikt over datagrunnlag for alle kartlag og analyser</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-md hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 p-5">
            <div className="grid gap-2">
              {dataSources.map((ds, idx) => {
                const isExpanded = expandedIdx === idx
                const isComputed = ds.file === 'Beregnet'
                return (
                  <div
                    key={idx}
                    className="border border-stone-150 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isComputed ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        <span className="text-sm font-medium text-stone-700">{ds.layer}</span>
                        <span className="text-xs text-stone-400 truncate">{ds.records}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">{ds.updated}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-3 pt-1 border-t border-stone-100 bg-stone-50/50">
                        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs">
                          <span className="text-stone-400">Kilde</span>
                          <span className="text-stone-600">
                            {ds.sourceUrl ? (
                              <a href={ds.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                                {ds.source}
                              </a>
                            ) : (
                              ds.source
                            )}
                          </span>

                          {!isComputed && (
                            <>
                              <span className="text-stone-400">Fil</span>
                              <span className="text-stone-600 font-mono text-[11px]">{ds.file}</span>
                            </>
                          )}

                          {ds.reproduce && (
                            <>
                              <span className="text-stone-400">Reproduser</span>
                              <span className="text-stone-600">{ds.reproduce}</span>
                            </>
                          )}

                          <span className="text-stone-400">Begrensninger</span>
                          <span className="text-stone-500">{ds.limitations}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mt-0.5 shrink-0">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <p className="text-xs text-amber-700">
                All data er samlet fra offentlige kilder og årsrapporter. Beregninger (matørken, sårbarhet) er modellbaserte og skal tolkes som indikatorer, ikke absolutte verdier. Se <span className="font-mono">DATA-SOURCES.md</span> for fullstendig dokumentasjon.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
