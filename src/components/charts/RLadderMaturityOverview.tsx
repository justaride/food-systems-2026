'use client'

import { useEffect, useState } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { rLadderById, type RLevel } from '@/lib/data/r-ladder'

type MaturityLevel = {
  id: string
  name: string
  definition_food: string
  examples_nordic: string[]
  volume_estimate: string
  maturity: number
  data_gaps: string
}

type Citation = {
  id: number
  url: string
  status: 'ok' | 'dead' | 'blocked' | 'redirect' | string
  http_status: number | null
}

type LinkCheckSummary = {
  total: number
  ok: number
  redirect: number
  blocked: number
  dead: number
}

type PrimarySources = {
  perplexity_prompt?: string
  verification_status?: string
  citations?: Citation[]
  last_checked?: string
  link_check_summary?: LinkCheckSummary
}

type R9MatrixData = {
  generated?: string
  source?: string
  description?: string
  levels: MaturityLevel[]
  priority_gaps?: string[]
  primary_sources?: PrimarySources
}

const MATURITY_MAX = 5

function MaturityDots({ score }: { score: number }) {
  const filled = Math.round(score)
  const halfway = Math.abs(score - Math.floor(score) - 0.5) < 0.01
  return (
    <div className="flex items-center gap-1" aria-label={`Modenhet ${score} av ${MATURITY_MAX}`}>
      {Array.from({ length: MATURITY_MAX }).map((_, idx) => {
        const isFilled = idx < Math.floor(score)
        const isHalf = halfway && idx === Math.floor(score)
        return (
          <span
            key={idx}
            className={`w-2.5 h-2.5 rounded-full border ${
              isFilled
                ? 'bg-stone-800 border-stone-800'
                : isHalf
                  ? 'bg-stone-400 border-stone-400'
                  : 'bg-white border-stone-300'
            }`}
          />
        )
      })}
      <span className="ml-1 text-[10px] font-medium text-stone-500 tabular-nums">
        {score.toFixed(1).replace(/\.0$/, '')}/{MATURITY_MAX}
      </span>
      <span className="sr-only">{filled} av {MATURITY_MAX}</span>
    </div>
  )
}

function isRLevel(id: string): id is RLevel {
  return id in rLadderById
}

export function RLadderMaturityOverview() {
  const [data, setData] = useState<R9MatrixData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    fetch('/data/food-systems/r9-matrix.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<R9MatrixData>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Ukjent feil')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (error) {
    return <EmptyState message={`Kunne ikke laste R-stige-data: ${error}`} />
  }

  if (!data) {
    return <EmptyState message="Laster R-stige-modenhetsdata..." />
  }

  const summary = data.primary_sources?.link_check_summary
  const verificationNote = data.primary_sources?.verification_status
  const priorityGaps = data.priority_gaps ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-800">R-stige modenhet per niva</h2>
          <p className="text-xs text-stone-500 mt-0.5 max-w-2xl leading-relaxed">
            {data.description ??
              'Operasjonalisert R9-sirkulaeritetsstige for nordiske matsystemer med modenhetsscore, eksempler og datahull per niva.'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-stone-500">
          <span className="font-medium text-stone-600">Modenhet</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-800" />
            etablert
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-stone-400" />
            delvis
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-white border border-stone-300" />
            umoden
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {data.levels.map((level) => {
          const ladderStep = isRLevel(level.id) ? rLadderById[level.id] : null
          const isExpanded = expandedIds.has(level.id)
          const badgeColor = ladderStep?.color ?? 'bg-stone-100 text-stone-700'
          const badgeBorder = ladderStep?.border ?? 'border-stone-300'
          return (
            <div
              key={level.id}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(level.id)}
                aria-expanded={isExpanded}
                className="w-full flex items-center gap-3 p-4 hover:bg-stone-50 transition-colors text-left"
              >
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeColor} ${badgeBorder} shrink-0`}
                >
                  {level.id}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-stone-800">{level.name}</span>
                    {ladderStep && (
                      <span className="text-xs text-stone-500">{ladderStep.nameNo}</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5 leading-snug line-clamp-2">
                    {level.definition_food}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <MaturityDots score={level.maturity} />
                  <span
                    className={`text-stone-400 text-xs transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                    aria-hidden
                  >
                    {'>'}
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-stone-100 bg-stone-50/50 space-y-3">
                  <div>
                    <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">
                      Definisjon i matsystemet
                    </h4>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      {level.definition_food}
                    </p>
                  </div>

                  {level.examples_nordic.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">
                        Nordiske eksempler
                      </h4>
                      <ul className="space-y-1">
                        {level.examples_nordic.map((example, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-stone-700 leading-relaxed flex gap-2"
                          >
                            <span className="text-stone-400 shrink-0" aria-hidden>
                              {'-'}
                            </span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">
                        Volumestimat
                      </h4>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {level.volume_estimate}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide mb-1">
                        Datahull
                      </h4>
                      <p className="text-xs text-stone-700 leading-relaxed">{level.data_gaps}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {priorityGaps.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-amber-900 mb-2">Prioriterte datahull</h3>
          <ul className="space-y-1">
            {priorityGaps.map((gap, idx) => (
              <li key={idx} className="text-xs text-amber-900/90 leading-relaxed flex gap-2">
                <span className="text-amber-700 shrink-0" aria-hidden>
                  {'-'}
                </span>
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {summary && (
        <div className="flex items-start justify-between gap-3 flex-wrap text-[11px] text-stone-500 border-t border-stone-200 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-stone-600">Kildeintegritet:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 border border-stone-200">
              {summary.total} kilder
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800">
              {summary.ok} OK
            </span>
            {summary.blocked > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800">
                {summary.blocked} bot-blokkert
              </span>
            )}
            {summary.redirect > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800">
                {summary.redirect} redirect
              </span>
            )}
            {summary.dead > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800">
                {summary.dead} dode
              </span>
            )}
          </div>
          {data.primary_sources?.last_checked && (
            <span className="text-stone-400">Sjekket {data.primary_sources.last_checked}</span>
          )}
        </div>
      )}

      {verificationNote && (
        <p className="text-[11px] text-stone-400 italic leading-relaxed">{verificationNote}</p>
      )}
    </div>
  )
}
