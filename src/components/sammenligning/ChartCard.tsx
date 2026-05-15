'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { DataGapBadge } from './DataGapBadge'
import { InfoPopover, type CountryMetaInfo } from './InfoPopover'
import { PerCapitaToggle } from './PerCapitaToggle'
import type { DataPointMeta } from '@/lib/queries/sammenligning'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'

const ComparisonBarChart = dynamic(
  () => import('@/components/charts/ComparisonBarChart').then(mod => mod.ComparisonBarChart),
  {
    ssr: false,
    loading: () => <div className="h-[200px]" aria-hidden="true" />,
  }
)

export type ChartCardCountryRow = {
  country: string
  flag: string
  value: number | null
  population?: number
  label?: string
  code?: string
  meta?: DataPointMeta
}

type ChartCardProps = {
  title: string
  description?: string
  unit?: string
  rows: ChartCardCountryRow[]
  year?: number | string | null
  source?: string | null
  sources?: string[]
  perCapitaEnabled?: boolean
  perCapitaUnit?: string
  defaultMode?: 'absolute' | 'per_capita'
}

function statusDotClass(status: ResearchEvidenceStatus | null | undefined): string {
  if (!status) return 'bg-stone-300'
  switch (status) {
    case 'validated':
      return 'bg-emerald-500'
    case 'primary_snapshot':
      return 'bg-sky-500'
    case 'proxy_model':
      return 'bg-amber-500'
    case 'local_research_needs_primary_check':
      return 'bg-orange-500'
    case 'missing':
      return 'bg-rose-500'
  }
}

export function ChartCard({
  title, description, unit, rows, year, source, sources,
  perCapitaEnabled = false, perCapitaUnit, defaultMode = 'absolute',
}: ChartCardProps) {
  const [mode, setMode] = useState<'absolute' | 'per_capita'>(defaultMode)
  const isPerCap = perCapitaEnabled && mode === 'per_capita'

  const data = rows.map(r => {
    const raw = r.value
    const v = raw === null
      ? 0
      : isPerCap && r.population
        ? Number((raw / r.population).toFixed(2))
        : raw
    return {
      country: r.country,
      flag: r.flag,
      value: v,
      label: raw === null ? '—' : r.label,
    }
  })

  const missing = rows.filter(r => r.value === null).length
  const activeUnit = isPerCap ? (perCapitaUnit ?? unit) : unit

  const countryMeta: CountryMetaInfo[] = rows.map(r => ({
    code: r.code ?? r.country,
    country: r.country,
    flag: r.flag,
    status: r.meta?.status ?? (r.value === null ? 'missing' : null),
    sources: r.meta?.sources ?? [],
    methodNote: r.meta?.methodNote,
    lastVerified: r.meta?.lastVerified,
  }))

  const hasAnyMeta = countryMeta.some(m => m.status !== null || m.sources.length > 0)

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
            <InfoPopover
              year={year}
              source={source}
              sources={sources}
              countryMeta={hasAnyMeta ? countryMeta : undefined}
            />
          </div>
          {description && <p className="text-xs text-stone-400">{description}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {perCapitaEnabled && <PerCapitaToggle value={mode} onChange={setMode} />}
          <DataGapBadge missing={missing} total={rows.length} />
        </div>
      </div>
      {hasAnyMeta && (
        <div className="flex items-center gap-2 mb-2 text-[10px] text-stone-400" aria-label="Kvalitetsindikatorer per land">
          {countryMeta.map(m => (
            <span key={m.code} className="inline-flex items-center gap-0.5" title={`${m.country}: ${m.status ?? 'ingen data'}`}>
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${statusDotClass(m.status)}`} aria-hidden="true" />
              <span className="opacity-70">{m.flag}</span>
            </span>
          ))}
        </div>
      )}
      <ComparisonBarChart title="" data={data} unit={activeUnit} bare />
    </Card>
  )
}
