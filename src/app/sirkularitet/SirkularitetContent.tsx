'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type Loop = {
  id: string
  name: string
  country: string
  maturity: string
  trl: number
  volume: string
  value_chain_step: string[]
  flow: string
  actors: string[]
  policy_support: string
  theme: string
  sources: string[]
}

type Gap = {
  id: string
  name: string
  country: string
  potential_volume: string
  barrier: string
  policy_lever: string
  comparable_solution: string
  theme: string
  sources: string[]
}

type ActorCase = {
  name: string
  country: string
  concept: string
  founded?: number | null
  status?: string
  bankrupt?: string
  cause?: string
  lesson: string
  invested_eur_m?: number
  business_model?: string
  investment_eur_m?: number
}

type CircularityData = {
  existing_loops: Loop[]
  gaps: Gap[]
  actor_cases: {
    success: ActorCase[]
    failure: ActorCase[]
    pattern: string
  }
  additional_success: ActorCase[]
  additional_failure: ActorCase[]
  industry_context: Record<string, unknown>
}

const THEME_LABELS: Record<string, string> = {
  matsvinn: 'Matsvinn',
  fiskeslam: 'Fiskeavfall',
  alternativt_for: 'Alternativt for',
  direktehandel: 'Direktehandel',
  alger_spillvarme: 'Alger/spillvarme',
  importavhengighet: 'Importavhengighet',
  regenerativt_landbruk: 'Regenerativt',
  akademia_skala: 'Akademia-skala',
}

const MATURITY_COLORS: Record<string, string> = {
  scaled: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  mature: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  industrial: 'bg-blue-100 text-blue-800 border-blue-200',
  commercial: 'bg-blue-100 text-blue-800 border-blue-200',
  operational: 'bg-sky-100 text-sky-800 border-sky-200',
  institutional: 'bg-violet-100 text-violet-800 border-violet-200',
  growing: 'bg-amber-100 text-amber-800 border-amber-200',
}

const COUNTRY_FLAGS: Record<string, string> = {
  NO: 'NO',
  SE: 'SE',
  DK: 'DK',
  FI: 'FI',
  IS: 'IS',
  FR: 'FR',
  nordic: 'Norden',
}

type Tab = 'loops' | 'gaps' | 'actors'

export function SirkularitetContent() {
  const [data, setData] = useState<CircularityData | null>(null)
  const [tab, setTab] = useState<Tab>('loops')
  const [themeFilter, setThemeFilter] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/data/food-systems/circularity-loops.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Sirkularitet</h1>
        <EmptyState message="Laster sirkularitetsdata..." />
      </div>
    )
  }

  const allThemes = [...new Set([
    ...data.existing_loops.map((l) => l.theme),
    ...data.gaps.map((g) => g.theme),
  ])].sort()

  const filteredLoops = themeFilter
    ? data.existing_loops.filter((l) => l.theme === themeFilter)
    : data.existing_loops

  const filteredGaps = themeFilter
    ? data.gaps.filter((g) => g.theme === themeFilter)
    : data.gaps

  const allSuccess = [...data.actor_cases.success, ...data.additional_success]
  const allFailure = [...data.actor_cases.failure, ...data.additional_failure]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Sirkularitet</h1>
        <p className="text-sm text-stone-400 mt-1">
          {data.existing_loops.length} eksisterende looper, {data.gaps.length} gap, {allSuccess.length + allFailure.length} aktorcaser
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {(['loops', 'gaps', 'actors'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              tab === t
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {t === 'loops' && `Eksisterende looper (${data.existing_loops.length})`}
            {t === 'gaps' && `Gap og muligheter (${data.gaps.length})`}
            {t === 'actors' && `Aktorcaser (${allSuccess.length + allFailure.length})`}
          </button>
        ))}
      </div>

      {tab !== 'actors' && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setThemeFilter(null)}
            className={`px-2 py-1 text-[10px] rounded border transition-colors ${
              !themeFilter
                ? 'bg-stone-700 text-white border-stone-700'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
            }`}
          >
            Alle
          </button>
          {allThemes.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setThemeFilter(theme === themeFilter ? null : theme)}
              className={`px-2 py-1 text-[10px] rounded border transition-colors ${
                themeFilter === theme
                  ? 'bg-stone-700 text-white border-stone-700'
                  : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
              }`}
            >
              {THEME_LABELS[theme] ?? theme}
            </button>
          ))}
        </div>
      )}

      {tab === 'loops' && (
        <div className="space-y-2">
          {filteredLoops.length === 0 ? (
            <EmptyState message="Ingen looper for dette temaet" />
          ) : (
            filteredLoops.map((loop) => (
              <Card key={loop.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggle(loop.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${
                      expandedIds.has(loop.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-800">{loop.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${MATURITY_COLORS[loop.maturity] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                        {loop.maturity}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {COUNTRY_FLAGS[loop.country] ?? loop.country} &middot; {loop.volume}
                    </p>
                  </div>

                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0">
                    TRL {loop.trl}
                  </span>
                </button>

                {expandedIds.has(loop.id) && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Flyt</p>
                        <p className="text-sm text-stone-700">{loop.flow}</p>
                      </div>
                      <div className="flex gap-6">
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Aktorer</p>
                          <div className="flex flex-wrap gap-1.5">
                            {loop.actors.map((a) => (
                              <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Verdikjedeledd</p>
                          <div className="flex flex-wrap gap-1.5">
                            {loop.value_chain_step.map((s) => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Policystotte</p>
                        <p className="text-xs text-stone-600">{loop.policy_support}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'gaps' && (
        <div className="space-y-2">
          {filteredGaps.length === 0 ? (
            <EmptyState message="Ingen gap for dette temaet" />
          ) : (
            filteredGaps.map((gap) => (
              <Card key={gap.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggle(gap.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${
                      expandedIds.has(gap.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800">{gap.name}</h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {COUNTRY_FLAGS[gap.country] ?? gap.country} &middot; {gap.potential_volume}
                    </p>
                  </div>

                  <span className="text-[10px] px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200 shrink-0">
                    gap
                  </span>
                </button>

                {expandedIds.has(gap.id) && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Barriere</p>
                        <p className="text-sm text-stone-700">{gap.barrier}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Policygrep</p>
                        <p className="text-sm text-stone-700">{gap.policy_lever}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Sammenlignbar losning</p>
                        <p className="text-sm text-stone-700">{gap.comparable_solution}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'actors' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-stone-700 mb-2">Suksesser ({allSuccess.length})</h2>
            <div className="space-y-2">
              {allSuccess.map((actor) => (
                <Card key={actor.name} className="!p-0">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-start gap-3"
                    onClick={() => toggle(`s-${actor.name}`)}
                  >
                    <svg
                      className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${
                        expandedIds.has(`s-${actor.name}`) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-stone-800">{actor.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {COUNTRY_FLAGS[actor.country] ?? actor.country}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{actor.concept}</p>
                    </div>
                  </button>
                  {expandedIds.has(`s-${actor.name}`) && (
                    <div className="px-4 pb-4 border-t border-stone-100">
                      <div className="mt-3 space-y-2">
                        {actor.status && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 mb-0.5">Status</p>
                            <p className="text-sm text-stone-700">{actor.status}</p>
                          </div>
                        )}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                          <p className="text-xs font-medium text-emerald-700 mb-0.5">Laerdom</p>
                          <p className="text-xs text-emerald-800">{actor.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-stone-700 mb-2">Feilede ({allFailure.length})</h2>
            <div className="space-y-2">
              {allFailure.map((actor) => (
                <Card key={actor.name} className="!p-0">
                  <button
                    type="button"
                    className="w-full text-left px-4 py-3 flex items-start gap-3"
                    onClick={() => toggle(`f-${actor.name}`)}
                  >
                    <svg
                      className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${
                        expandedIds.has(`f-${actor.name}`) ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-stone-800">{actor.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
                          {COUNTRY_FLAGS[actor.country] ?? actor.country}
                        </span>
                        {actor.bankrupt && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
                            konkurs {actor.bankrupt}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{actor.concept}</p>
                    </div>
                  </button>
                  {expandedIds.has(`f-${actor.name}`) && (
                    <div className="px-4 pb-4 border-t border-stone-100">
                      <div className="mt-3 space-y-2">
                        {actor.cause && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 mb-0.5">Arsak</p>
                            <p className="text-sm text-stone-700">{actor.cause}</p>
                          </div>
                        )}
                        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2">
                          <p className="text-xs font-medium text-rose-700 mb-0.5">Laerdom</p>
                          <p className="text-xs text-rose-800">{actor.lesson}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>

          <Card className="bg-stone-50">
            <p className="text-xs font-medium text-stone-500 mb-1">Monster</p>
            <p className="text-sm text-stone-700 leading-relaxed">{data.actor_cases.pattern}</p>
          </Card>
        </div>
      )}
    </div>
  )
}
