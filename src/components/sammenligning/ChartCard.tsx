'use client'

import { useState } from 'react'
import { ComparisonBarChart } from '@/components/charts/ComparisonBarChart'
import { Card } from '@/components/ui/Card'
import { DataGapBadge } from './DataGapBadge'
import { InfoPopover } from './InfoPopover'
import { PerCapitaToggle } from './PerCapitaToggle'

type CountryRow = {
  country: string
  flag: string
  value: number | null
  population?: number
  label?: string
}

type ChartCardProps = {
  title: string
  description?: string
  unit?: string
  rows: CountryRow[]
  year?: number | string | null
  source?: string | null
  perCapitaEnabled?: boolean
  perCapitaUnit?: string
  defaultMode?: 'absolute' | 'per_capita'
}

export function ChartCard({
  title, description, unit, rows, year, source,
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

  return (
    <Card>
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-700">{title}</h3>
            <InfoPopover year={year} source={source} />
          </div>
          {description && <p className="text-xs text-stone-400">{description}</p>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {perCapitaEnabled && <PerCapitaToggle value={mode} onChange={setMode} />}
          <DataGapBadge missing={missing} total={rows.length} />
        </div>
      </div>
      <ComparisonBarChart title="" data={data} unit={activeUnit} bare />
    </Card>
  )
}
