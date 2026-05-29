'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { rLadderById, type RLevel } from '@/lib/data/r-ladder'

type DataAvailability = 'good' | 'partial' | 'poor' | 'none'

type R9Kpi = {
  id: string
  name: string
  r_level: RLevel | 'cross-cutting'
  unit: string
  data_availability: DataAvailability
  nordic_sources: string[]
  description: string
}

type LinkCheckSummary = {
  total: number
  ok: number
  redirect: number
  blocked: number
  dead: number
}

type Citation = {
  id: number
  url: string
  status: string
  http_status: number
}

type PrimarySources = {
  perplexity_prompt: string
  verification_status: string
  citations: Citation[]
  last_checked: string
  link_check_summary: LinkCheckSummary
}

type R9KpiCatalogData = {
  generated: string
  source: string
  description: string
  kpis: R9Kpi[]
  primary_sources: PrimarySources
}

type RFilter = 'all' | RLevel | 'cross-cutting'

const R_FILTER_ORDER: RFilter[] = [
  'all',
  'R0',
  'R1',
  'R2',
  'R3',
  'R4',
  'R5',
  'R6',
  'R7',
  'R8',
  'R9',
  'cross-cutting',
]

const AVAILABILITY_ORDER: ('all' | DataAvailability)[] = ['all', 'good', 'partial', 'poor', 'none']

const AVAILABILITY_LABEL: Record<DataAvailability, string> = {
  good: 'god',
  partial: 'delvis',
  poor: 'svak',
  none: 'mangler',
}

const AVAILABILITY_COLOR: Record<DataAvailability, string> = {
  good: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-700 border-amber-200',
  poor: 'bg-orange-50 text-orange-700 border-orange-200',
  none: 'bg-stone-100 text-stone-600 border-stone-200',
}

const CROSS_CUTTING_COLOR = 'bg-violet-50 text-violet-700'
const CROSS_CUTTING_BORDER = 'border-violet-200'

function rLevelBadgeClasses(level: RLevel | 'cross-cutting'): string {
  if (level === 'cross-cutting') {
    return `${CROSS_CUTTING_COLOR} ${CROSS_CUTTING_BORDER}`
  }
  const step = rLadderById[level]
  return `${step.color} ${step.border}`
}

function rLevelLabel(level: RLevel | 'cross-cutting'): string {
  if (level === 'cross-cutting') return 'Tversgaende'
  return level
}

export function R9KpiCatalog() {
  const [data, setData] = useState<R9KpiCatalogData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rFilter, setRFilter] = useState<RFilter>('all')
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | DataAvailability>('all')
  const [query, setQuery] = useState('')

  useEffect(() => {
    let cancelled = false
    fetch('/data/food-systems/r9-kpi-catalog.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<R9KpiCatalogData>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Kunne ikke laste katalog')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const availableRLevels = useMemo(() => {
    if (!data) return new Set<RFilter>()
    const set = new Set<RFilter>()
    data.kpis.forEach((k) => set.add(k.r_level))
    return set
  }, [data])

  const filteredKpis = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.kpis.filter((k) => {
      if (rFilter !== 'all' && k.r_level !== rFilter) return false
      if (availabilityFilter !== 'all' && k.data_availability !== availabilityFilter) return false
      if (q.length > 0) {
        const haystack = `${k.name} ${k.description} ${k.nordic_sources.join(' ')}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [data, rFilter, availabilityFilter, query])

  if (error) {
    return <EmptyState message={`Kunne ikke laste KPI-katalog (${error})`} />
  }

  if (!data) {
    return <EmptyState message="Laster KPI-katalog..." />
  }

  const linkSummary = data.primary_sources.link_check_summary

  return (
    <div className="space-y-4">
      <Card className="bg-stone-50 border-stone-200">
        <p className="text-xs text-stone-600 leading-relaxed">
          Katalog over {data.kpis.length} operative KPI-er for måling av nordisk matsystem-sirkularitet
          per R-nivå (Potting et al. 2017). Søk etter KPI-navn, eller filtrer på R-nivå og
          datatilgjengelighet for å finne relevante indikatorer.
          <span className="font-medium text-stone-800"> Kilde:</span> {data.source}.
        </p>
      </Card>

      <Card>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5 block">
              Søk
            </label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Søk KPI-navn, beskrivelse eller kilde..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-200 bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400"
            />
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5 block">
              R-nivå
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {R_FILTER_ORDER.map((r) => {
                const isActive = rFilter === r
                const isAvailable = r === 'all' || availableRLevels.has(r)
                const colorClasses =
                  r === 'all'
                    ? isActive
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    : isActive
                      ? `${rLevelBadgeClasses(r as RLevel | 'cross-cutting')} ring-2 ring-stone-400 ring-offset-1`
                      : `${rLevelBadgeClasses(r as RLevel | 'cross-cutting')} opacity-70 hover:opacity-100`
                return (
                  <button
                    key={r}
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => setRFilter(r)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${colorClasses} ${
                      !isAvailable ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  >
                    {r === 'all' ? 'Alle' : rLevelLabel(r as RLevel | 'cross-cutting')}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5 block">
              Datatilgjengelighet
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {AVAILABILITY_ORDER.map((a) => {
                const isActive = availabilityFilter === a
                const colorClasses =
                  a === 'all'
                    ? isActive
                      ? 'bg-stone-800 text-white border-stone-800'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    : isActive
                      ? `${AVAILABILITY_COLOR[a]} ring-2 ring-stone-400 ring-offset-1`
                      : `${AVAILABILITY_COLOR[a]} opacity-70 hover:opacity-100`
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvailabilityFilter(a)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${colorClasses}`}
                  >
                    {a === 'all' ? 'Alle' : AVAILABILITY_LABEL[a]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-stone-500">
          Viser <span className="font-medium text-stone-700">{filteredKpis.length}</span> av{' '}
          {data.kpis.length} KPI-er
        </p>
        {(rFilter !== 'all' || availabilityFilter !== 'all' || query.length > 0) && (
          <button
            type="button"
            onClick={() => {
              setRFilter('all')
              setAvailabilityFilter('all')
              setQuery('')
            }}
            className="text-xs text-stone-500 hover:text-stone-800 underline"
          >
            Nullstill filtre
          </button>
        )}
      </div>

      {filteredKpis.length === 0 ? (
        <EmptyState message="Ingen KPI-er matcher filtrene." />
      ) : (
        <div className="space-y-2">
          {filteredKpis.map((kpi) => (
            <Card key={kpi.id} className="!p-0">
              <div className="px-4 py-3">
                <div className="flex items-start gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-semibold text-stone-400">
                        #{kpi.id.replace('kpi-', '')}
                      </span>
                      <h3 className="text-sm font-semibold text-stone-800">{kpi.name}</h3>
                    </div>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{kpi.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${rLevelBadgeClasses(
                        kpi.r_level,
                      )}`}
                    >
                      {rLevelLabel(kpi.r_level)}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded border ${
                        AVAILABILITY_COLOR[kpi.data_availability]
                      }`}
                    >
                      {AVAILABILITY_LABEL[kpi.data_availability]}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 grid grid-cols-1 md:grid-cols-[140px_1fr] gap-1.5 text-xs">
                  <span className="text-stone-500 font-medium">Enhet</span>
                  <span className="text-stone-700 font-mono text-[11px]">{kpi.unit}</span>

                  <span className="text-stone-500 font-medium">Nordiske kilder</span>
                  <div className="flex flex-wrap gap-1">
                    {kpi.nordic_sources.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-stone-50 border-stone-200">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="text-[11px] text-stone-600 space-y-1">
            <p className="font-medium text-stone-700">Lenke-status for primærkilder</p>
            <p className="text-stone-500">
              Sist sjekket {data.primary_sources.last_checked}. {data.primary_sources.verification_status}
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap items-center">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
              total {linkSummary.total}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700">
              ok {linkSummary.ok}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700">
              redirect {linkSummary.redirect}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700">
              blokkert {linkSummary.blocked}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-700">
              dod {linkSummary.dead}
            </span>
          </div>
        </div>
      </Card>
    </div>
  )
}
