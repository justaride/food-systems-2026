'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { FeedCompositionTimeseries } from '@/components/charts/FeedCompositionTimeseries'
import type { StageEnrichment } from '@/lib/queries/verdikjede'

type VerdikjedeStage = {
  id: string
  step: number
  title: string
  subtitle: string
  summary: string
  keyPoints: string[]
  countries: string[]
  keyActors: string[]
  tags: string[]
}

export function VerdikjedeContent({
  stages,
  enrichment,
}: {
  stages: VerdikjedeStage[]
  enrichment: StageEnrichment[]
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const enrichmentByStage = useMemo(() => {
    const map = new Map<string, StageEnrichment>()
    for (const e of enrichment) map.set(e.stageId, e)
    return map
  }, [enrichment])

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
        <h1 className="text-2xl font-bold text-stone-900">Verdikjede</h1>
        <p className="text-sm text-stone-400 mt-1">
          {stages.length} ledd i den nordiske matverdikjeden — fra jord til bord
        </p>
      </div>

      {stages.length === 0 ? (
        <EmptyState message="Ingen verdikjedeledd funnet" />
      ) : (
        <div className="space-y-3">
          {stages.map(stage => {
            const isExpanded = expandedIds.has(stage.id)
            const stepLabel = String(stage.step).padStart(2, '0')
            const stageEnrichment = enrichmentByStage.get(stage.id)
            const actorMatches = stageEnrichment?.actorMatches ?? []
            const actorById = new Map(actorMatches.map(m => [m.name, m.companyId]))
            const companyCount = stageEnrichment?.companyCount ?? 0
            const primaryDbStage = stageEnrichment?.dbStages[0]

            return (
              <Card key={stage.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(stage.id)}
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

                  <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                    {stepLabel}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[240px]">
                    {companyCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {companyCount} selskaper
                      </span>
                    )}
                    {stage.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded border bg-stone-50 text-stone-500 border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Sammendrag</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{stage.summary}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1.5">Nokkelfunn</p>
                        <ul className="space-y-1">
                          {stage.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm text-stone-600 flex gap-2">
                              <span className="text-stone-300 shrink-0">{'—'}</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-6">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Land</p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.countries.map(country => (
                              <span
                                key={country}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200"
                              >
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Nokkelaktorer</p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.keyActors.map(actor => {
                              const companyId = actorById.get(actor) ?? null
                              const baseClasses =
                                'text-[10px] px-1.5 py-0.5 rounded border'
                              if (companyId) {
                                return (
                                  <Link
                                    key={actor}
                                    href={`/selskap/${companyId}`}
                                    className={`${baseClasses} bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors`}
                                  >
                                    {actor}
                                  </Link>
                                )
                              }
                              return (
                                <span
                                  key={actor}
                                  className={`${baseClasses} bg-stone-50 text-stone-500 border-stone-200`}
                                  title="Ikke koblet til selskap i registeret"
                                >
                                  {actor}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5">Temaer</p>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {(companyCount > 0 || primaryDbStage) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {primaryDbStage && companyCount > 0 && (
                            <Link
                              href={`/selskap?stage=${encodeURIComponent(primaryDbStage)}`}
                              className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                            >
                              Se {companyCount} selskaper i dette leddet {'→'}
                            </Link>
                          )}
                          <Link
                            href="/forsyningskjede"
                            className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                          >
                            Se i Forsyningskjede {'→'}
                          </Link>
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

      <div className="space-y-3 pt-4 border-t border-stone-200">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Forkomposisjon i norsk lakseoppdrett</h2>
          <p className="text-xs text-stone-500 mt-1">
            Tidsserie over fordelingen av forrastoffer (marint, vegetabilsk, novel proteiner) basert pa Nofima/FHF
            ressursregnskap. Viser retning mot 25 % norske ravarer-malet 2034.
          </p>
        </div>
        <FeedCompositionTimeseries />
      </div>
    </div>
  )
}
