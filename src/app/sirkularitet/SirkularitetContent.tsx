'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Citation } from '@/components/citations/Citation'
import { RLadderMatrix } from '@/components/charts/RLadderMatrix'
import { RLadderMaturityOverview } from '@/components/charts/RLadderMaturityOverview'
import { R9KpiCatalog } from '@/components/charts/R9KpiCatalog'
import { EffektTab } from '@/components/charts/EffektTab'
import { circularityQuestions, type CircularityQuestion, type QuestionStatus } from '@/lib/data/circularity-questions'
import { CIRCULARITY_ACTOR_MAP } from '@/lib/data/circularity-actor-map'
import { rLadderById } from '@/lib/data/r-ladder'
import { MaterialFlowTab } from '@/components/charts/MaterialFlowTab'

const NutrientFlowsView = dynamic(
  () => import('@/components/charts/NutrientFlowsView').then(mod => mod.NutrientFlowsView),
  {
    ssr: false,
    loading: () => <div className="h-[420px]" aria-hidden="true" />,
  }
)

type Loop = {
  id: string
  name: string
  country: string
  maturity: string
  trl: number
  rLevel?: string
  volume: string
  value_chain_step: string[]
  flow: string
  actors: string[]
  policy_support: string
  theme: string
  sources: string[]
  nordic_transferable?: boolean
}

type Gap = {
  id: string
  name: string
  country: string
  rLevel?: string
  potential_volume: string
  barrier: string
  policy_lever: string
  comparable_solution: string
  theme: string
  sources: string[]
  value_chain_step?: string[]
}

type ActorCase = {
  name: string
  country: string
  concept: string
  founded?: number | null
  rLevel?: string
  status?: string
  bankrupt?: string
  cause?: string
  lesson: string
  invested_eur_m?: number | null
  business_model?: string
  ownership?: string
  value_chain_step?: string[]
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

type Tab = 'matrix' | 'effekt' | 'maturity' | 'kpi' | 'questions' | 'loops' | 'gaps' | 'actors' | 'naeringsflyt' | 'flyt'

const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  open: 'apen',
  'in-research': 'under utredning',
  answered: 'besvart',
  parked: 'parkert',
}

const QUESTION_STATUS_COLOR: Record<QuestionStatus, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  'in-research': 'bg-blue-50 text-blue-700 border-blue-200',
  answered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  parked: 'bg-stone-100 text-stone-600 border-stone-200',
}

const GAP_REAL_LABEL: Record<CircularityQuestion['isRealGap'], string> = {
  yes: 'reelt hull',
  no: 'ikke hull',
  unclear: 'usikkert',
}

export function SirkularitetContent() {
  const [data, setData] = useState<CircularityData | null>(null)
  const [tab, setTab] = useState<Tab>('matrix')
  const [themeFilter, setThemeFilter] = useState<string | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/food-systems/circularity-loops.json')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  useEffect(() => {
    if (!pendingScrollId) return
    const handle = requestAnimationFrame(() => {
      const el = document.getElementById(pendingScrollId)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setPendingScrollId(null)
    })
    return () => cancelAnimationFrame(handle)
  }, [pendingScrollId, tab])

  const toggle = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const navigateToRelatedItem = (targetTab: Tab, itemId: string) => {
    // Gap IDs already include `gap-` prefix in the data file; loops do not.
    let domId: string
    if (targetTab === 'loops') domId = `loop-${itemId}`
    else domId = itemId
    setTab(targetTab)
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.add(itemId)
      if (targetTab === 'actors') {
        next.add(`s-${itemId}`)
        next.add(`f-${itemId}`)
      }
      return next
    })
    if (targetTab !== 'actors') setPendingScrollId(domId)
  }

  const matrixItems = useMemo(() => {
    if (!data) return []
    const items: {
      id: string
      name: string
      country: string
      kind: 'loop' | 'gap' | 'success' | 'failure'
      rLevel?: string
      valueChainSteps: string[]
      detail?: string
    }[] = []
    for (const l of data.existing_loops) {
      items.push({
        id: l.id,
        name: l.name,
        country: l.country,
        kind: 'loop',
        rLevel: l.rLevel,
        valueChainSteps: l.value_chain_step,
        detail: l.volume,
      })
    }
    for (const g of data.gaps) {
      items.push({
        id: g.id,
        name: g.name,
        country: g.country,
        kind: 'gap',
        rLevel: g.rLevel,
        valueChainSteps: g.value_chain_step ?? [],
        detail: g.potential_volume,
      })
    }
    const addCase = (c: ActorCase, kind: 'success' | 'failure') => {
      items.push({
        id: c.name,
        name: c.name,
        country: c.country,
        kind,
        rLevel: c.rLevel,
        valueChainSteps: c.value_chain_step ?? [],
        detail: c.status ?? c.cause,
      })
    }
    data.actor_cases.success.forEach((c) => addCase(c, 'success'))
    data.additional_success.forEach((c) => addCase(c, 'success'))
    data.actor_cases.failure.forEach((c) => addCase(c, 'failure'))
    data.additional_failure.forEach((c) => addCase(c, 'failure'))
    return items
  }, [data])

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

      <NordicCircularityBenchmark />

      <div className="flex gap-2 flex-wrap">
        {(['matrix', 'effekt', 'maturity', 'kpi', 'questions', 'loops', 'gaps', 'actors', 'naeringsflyt', 'flyt'] as Tab[]).map((t) => (
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
            {t === 'matrix' && `R-stige x verdikjede`}
            {t === 'effekt' && `Effekt (10)`}
            {t === 'maturity' && `R-stige modenhet`}
            {t === 'kpi' && `KPI-katalog`}
            {t === 'questions' && `10 sirkularitetsspørsmål (${circularityQuestions.length})`}
            {t === 'loops' && `Eksisterende looper (${data.existing_loops.length})`}
            {t === 'gaps' && `Gap og muligheter (${data.gaps.length})`}
            {t === 'actors' && `Aktørcaser (${allSuccess.length + allFailure.length})`}
            {t === 'naeringsflyt' && `Næringsflyt N/P/K`}
            {t === 'flyt' && `Materialflyt`}
          </button>
        ))}
      </div>

      {tab === 'matrix' && (
        <div className="space-y-4">
          <Card className="bg-stone-50 border-stone-200">
            <p className="text-xs text-stone-600 leading-relaxed">
              R-stigen (Potting et al. 2017) rangerer sirkulære strategier fra mest til minst sirkulær.
              Matrisen viser hvor nordiske initiativer sitter per verdikjedeledd.
              <span className="font-medium text-stone-800"> Tomme celler = uutnyttede muligheter.</span>
              Klikk en celle for å se hvilke initiativer som er plassert der.
            </p>
          </Card>
          <RLadderMatrix items={matrixItems} />
        </div>
      )}

      {tab === 'effekt' && (
        <EffektTab
          expandedIds={expandedIds}
          onToggleRow={toggle}
          onNavigateToTab={(t, id) => navigateToRelatedItem(t as Tab, id)}
        />
      )}

      {tab === 'maturity' && <RLadderMaturityOverview />}

      {tab === 'kpi' && <R9KpiCatalog />}

      {tab === 'naeringsflyt' && <NutrientFlowsView />}

      {tab === 'flyt' && <MaterialFlowTab />}

      {tab === 'questions' && (
        <div className="space-y-4">
          <Card className="bg-stone-50 border-stone-200">
            <p className="text-xs text-stone-600 leading-relaxed">
              10 ankerspørsmål for sirkulær omstilling i nordisk matsystem. Hvert spørsmål kobler R-nivåer,
              verdikjedeledd og konkrete suksess-/fiasko-caser. Rammeverk etablert i møte JT-Gabriel 20.04.26.
              <span className="font-medium text-stone-800"> Disse er utkast</span> — skal fylles ut løpende og oppdateres etter JTs bidrag.
            </p>
          </Card>
          <div className="space-y-2">
            {circularityQuestions.map((q) => (
              <Card key={q.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggle(`q-${q.id}`)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${
                      expandedIds.has(`q-${q.id}`) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-stone-400">#{q.number}</span>
                      <h3 className="text-sm font-semibold text-stone-800">{q.question}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${QUESTION_STATUS_COLOR[q.status]}`}>
                        {QUESTION_STATUS_LABEL[q.status]}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded border bg-white text-stone-600 border-stone-200">
                        {GAP_REAL_LABEL[q.isRealGap]}
                      </span>
                      {q.rLevels.map((r) => (
                        <span
                          key={r}
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${rLadderById[r].color} ${rLadderById[r].border}`}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
                {expandedIds.has(`q-${q.id}`) && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Kontekst</p>
                        <p className="text-sm text-stone-700">{q.context}</p>
                      </div>
                      {q.note && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                          <p className="text-xs text-amber-800">{q.note}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Forsøkte løsninger</p>
                          <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                            {q.attemptedSolutions.map((s) => (
                              <li key={s}>{s}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Barrierer</p>
                          <ul className="text-xs text-stone-700 space-y-0.5 list-disc list-inside">
                            {q.barriers.map((b) => (
                              <li key={b}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-medium text-emerald-700 mb-1">Suksess-caser</p>
                          <div className="flex flex-wrap gap-1.5">
                            {q.successCases.length === 0 ? (
                              <span className="text-xs text-stone-400">Ingen registrert</span>
                            ) : (
                              q.successCases.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  {c}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-rose-700 mb-1">Fiasko-caser</p>
                          <div className="flex flex-wrap gap-1.5">
                            {q.failureCases.length === 0 ? (
                              <span className="text-xs text-stone-400">Ingen registrert</span>
                            ) : (
                              q.failureCases.map((c) => (
                                <span
                                  key={c}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200"
                                >
                                  {c}
                                </span>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Evidensreferanser</p>
                        <div className="flex flex-wrap gap-1.5">
                          {q.evidenceRefs.map((r) => (
                            <span
                              key={r}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 font-mono"
                            >
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {(tab === 'loops' || tab === 'gaps') && (
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
              <Card key={loop.id} id={`loop-${loop.id}`} className="!p-0">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-stone-800">{loop.name}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${MATURITY_COLORS[loop.maturity] ?? 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                        {loop.maturity}
                      </span>
                      {loop.rLevel && rLadderById[loop.rLevel as keyof typeof rLadderById] && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${rLadderById[loop.rLevel as keyof typeof rLadderById].color} ${rLadderById[loop.rLevel as keyof typeof rLadderById].border}`}
                        >
                          {loop.rLevel} {rLadderById[loop.rLevel as keyof typeof rLadderById].nameNo}
                        </span>
                      )}
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
                          <p className="text-xs font-medium text-stone-500 mb-1">Aktører</p>
                          <div className="flex flex-wrap gap-1.5">
                            {loop.actors.map((a) => {
                              const mapping = CIRCULARITY_ACTOR_MAP[a]
                              if (mapping) {
                                return (
                                  <Link
                                    key={a}
                                    href={mapping.href}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 hover:underline cursor-pointer"
                                  >
                                    {a}
                                  </Link>
                                )
                              }
                              return (
                                <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  {a}
                                </span>
                              )
                            })}
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
              <Card key={gap.id} id={gap.id} className="!p-0">
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-stone-800">{gap.name}</h3>
                      {gap.rLevel && rLadderById[gap.rLevel as keyof typeof rLadderById] && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded border ${rLadderById[gap.rLevel as keyof typeof rLadderById].color} ${rLadderById[gap.rLevel as keyof typeof rLadderById].border}`}
                        >
                          {gap.rLevel}
                        </span>
                      )}
                    </div>
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
                        <p className="text-xs font-medium text-stone-500 mb-1">Sammenlignbar løsning</p>
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {CIRCULARITY_ACTOR_MAP[actor.name] ? (
                          <Link
                            href={CIRCULARITY_ACTOR_MAP[actor.name].href}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-semibold text-stone-800 hover:underline cursor-pointer"
                          >
                            {actor.name}
                          </Link>
                        ) : (
                          <h3 className="text-sm font-semibold text-stone-800">{actor.name}</h3>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
                          {COUNTRY_FLAGS[actor.country] ?? actor.country}
                        </span>
                        {actor.rLevel && rLadderById[actor.rLevel as keyof typeof rLadderById] && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${rLadderById[actor.rLevel as keyof typeof rLadderById].color} ${rLadderById[actor.rLevel as keyof typeof rLadderById].border}`}
                          >
                            {actor.rLevel}
                          </span>
                        )}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        {CIRCULARITY_ACTOR_MAP[actor.name] ? (
                          <Link
                            href={CIRCULARITY_ACTOR_MAP[actor.name].href}
                            onClick={(e) => e.stopPropagation()}
                            className="text-sm font-semibold text-stone-800 hover:underline cursor-pointer"
                          >
                            {actor.name}
                          </Link>
                        ) : (
                          <h3 className="text-sm font-semibold text-stone-800">{actor.name}</h3>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded border bg-rose-50 text-rose-700 border-rose-200">
                          {COUNTRY_FLAGS[actor.country] ?? actor.country}
                        </span>
                        {actor.rLevel && rLadderById[actor.rLevel as keyof typeof rLadderById] && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded border ${rLadderById[actor.rLevel as keyof typeof rLadderById].color} ${rLadderById[actor.rLevel as keyof typeof rLadderById].border}`}
                          >
                            {actor.rLevel}
                          </span>
                        )}
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

type CountryBenchmark = {
  code: string
  name: string
  rate: string
  rateNumeric: number | null
  source: string
  sourceUrl: string
}

const CIRCULARITY_BENCHMARKS: CountryBenchmark[] = [
  {
    code: 'NO',
    name: 'Norge',
    rate: '2.4 %',
    rateNumeric: 2.4,
    source: 'Circularity Gap Report Norway (2024)',
    sourceUrl: 'https://www.circularity-gap.world/norway',
  },
  {
    code: 'SE',
    name: 'Sverige',
    rate: '3.4 %',
    rateNumeric: 3.4,
    source: 'Circularity Gap Report Sweden (2024)',
    sourceUrl: 'https://www.circularity-gap.world/sweden',
  },
  {
    code: 'DK',
    name: 'Danmark',
    rate: 'n/a',
    rateNumeric: null,
    source: 'Ingen nasjonal CGR publisert — referanse: Ellen MacArthur DK 2015',
    sourceUrl: 'https://mst.dk/media/sexld3zc/potential-for-denmark-as-a-circular-economy-2015.pdf',
  },
  {
    code: 'FI',
    name: 'Finland',
    rate: 'n/a',
    rateNumeric: null,
    source: 'Ingen nasjonal CGR publisert',
    sourceUrl: '',
  },
  {
    code: 'IS',
    name: 'Island',
    rate: 'n/a',
    rateNumeric: null,
    source: 'Ingen nasjonal CGR publisert',
    sourceUrl: '',
  },
  {
    code: 'Nordic',
    name: 'Nordisk snitt',
    rate: '~6 %',
    rateNumeric: 6,
    source: 'Nordic Circular Hotspot — Beyond the Bean (2023)',
    sourceUrl: 'https://nordiccircularhotspot.org/news/beyond-the-bean-a-nordic-perspective-on-circular-food-systems',
  },
]

function NordicCircularityBenchmark() {
  return (
    <Card className="bg-white border-stone-200">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">Nordisk benchmark</p>
          <h2 className="text-sm font-semibold text-stone-800">Sirkularitetsrate per land</h2>
        </div>
        <p className="text-[10px] text-stone-400">Andel materialer som returneres til okonomien</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {CIRCULARITY_BENCHMARKS.map((b) => {
          const isMeasured = b.rateNumeric !== null
          return (
            <div
              key={b.code}
              className={`rounded-lg border p-3 ${
                isMeasured ? 'bg-stone-50 border-stone-200' : 'bg-stone-50/50 border-stone-100'
              }`}
            >
              <p className="text-[10px] font-medium text-stone-500">{b.code} — {b.name}</p>
              <p className={`text-xl font-bold mt-0.5 ${isMeasured ? 'text-stone-900' : 'text-stone-400'}`}>
                {b.rate}
              </p>
              <Citation
                compact
                className="mt-1"
                citation={{
                  label: b.sourceUrl ? 'Kilde' : b.source,
                  title: b.source,
                  url: b.sourceUrl || null,
                  citationReadiness: b.sourceUrl ? 'citable_with_note' : 'blocked_unsourced',
                  note: b.sourceUrl
                    ? 'Benchmark-kilde; kontroller metodegrunnlag for direkte sitatbruk.'
                    : 'Ingen nasjonal benchmark-kilde registrert.',
                }}
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
