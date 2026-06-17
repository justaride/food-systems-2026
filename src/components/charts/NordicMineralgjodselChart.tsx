'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'

type CountryRow = {
  code: string
  name: string
  n_t: number | null
  p_t: number | null
  k_t: number | null
  year: string
  source: string
  data_quality: string
}

type GjodselData = {
  generated: string
  description: string
  methodology: string
  basis: string
  primary_sources: string[]
  caveats: string[]
  countries: CountryRow[]
}

const NUTRIENTS: { key: 'n_t' | 'p_t' | 'k_t'; label: string; color: string }[] = [
  { key: 'n_t', label: 'Nitrogen (N)', color: '#0284c7' },
  { key: 'p_t', label: 'Fosfor (P)', color: '#ca8a04' },
  { key: 'k_t', label: 'Kalium (K)', color: '#10b981' },
]

function formatTonnes(value: number | null | undefined): string {
  if (value == null) return 'ikke hentet'
  return `${value.toLocaleString('nb-NO')} t`
}

export function NordicMineralgjodselChart() {
  const [data, setData] = useState<GjodselData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/data/food-systems/nordic-mineralgjodsel.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<GjodselData>
      })
      .then((payload) => {
        if (!active) return
        setData(payload)
        setIsLoading(false)
      })
      .catch(() => {
        if (!active) return
        setHasError(true)
        setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const chartData = useMemo(() => {
    if (!data) return []
    return data.countries.map((c) => ({
      name: c.name,
      n_t: c.n_t,
      p_t: c.p_t,
      k_t: c.k_t,
      year: c.year,
    }))
  }, [data])

  const missing = useMemo(
    () => (data?.countries ?? []).filter((c) => c.n_t == null && c.p_t == null && c.k_t == null),
    [data],
  )

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Mineralgjødselforbruk i Norden (N, P, K)</h3>
        <div className="h-[280px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    )
  }

  if (hasError || !data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Mineralgjødselforbruk i Norden (N, P, K)</h3>
        <EmptyState message="Klarte ikke å laste gjødseldata" />
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div>
          <h3 className="text-sm font-semibold text-stone-700">Mineralgjødselforbruk i Norden (N, P, K)</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <EvidenceStatusBadge
              status="observed"
              prefix="Datastatus"
              detail="Nasjonal gjødselstatistikk (NIBIO/SCB/DST), element-basis. Gjødselår varierer. Island ikke hentet."
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-400 mb-3">
        Tonn per år, element-basis. Referansegrunnlag for hvor mye gjenvunnet næring måtte erstatte.
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 320 }}>
          <BarChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis dataKey="name" fontSize={11} tick={{ fill: '#57534e' }} />
            <YAxis
              fontSize={11}
              tick={{ fill: '#78716c' }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(Number(v) / 1000)}k` : String(v))}
              label={{ value: 'tonn/år', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#a8a29e' }}
            />
            <Tooltip
              formatter={(value, name) => [value == null ? 'ikke hentet' : `${Number(value).toLocaleString('nb-NO')} t`, String(name)]}
              labelFormatter={(label) => {
                const row = chartData.find((d) => d.name === label)
                return row ? `${label} (${row.year})` : String(label)
              }}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconSize={8} />
            {NUTRIENTS.map((n) => (
              <Bar key={n.key} dataKey={n.key} name={n.label} fill={n.color} radius={[3, 3, 0, 0]} maxBarSize={36} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {missing.length > 0 && (
        <p className="text-[10px] text-stone-400 mt-2">
          Ikke hentet: {missing.map((c) => `${c.name} (${c.source})`).join(', ')}.
        </p>
      )}

      <div className="mt-3 rounded-lg border border-stone-200 bg-stone-50 p-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1">Forbehold</h4>
        <ul className="space-y-0.5 text-[11px] text-stone-600">
          {data.caveats.map((c) => (
            <li key={c}>· {c}</li>
          ))}
        </ul>
      </div>

      <ChartSource source={`Kilder: ${data.primary_sources.join('; ')}. ${data.basis} Arbeidsdatasett: nordic-mineralgjodsel.json.`} />
    </Card>
  )
}
