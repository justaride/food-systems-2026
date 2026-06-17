'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'

type TimeseriesRow = {
  year: number
  soya_import_brasil_share_kg_pct: number | null
  klippfisk_export_brasil_share_kg_pct: number | null
  soya_import_brasil_kg: number | null
  klippfisk_export_brasil_kg: number | null
  data_quality: string
}

type HandelsakseData = {
  generated: string
  source: string
  description: string
  methodology: string
  primary_sources: string[]
  control: string
  caveats: string[]
  timeseries: TimeseriesRow[]
}

const SERIES: { key: 'soya_import_brasil_share_kg_pct' | 'klippfisk_export_brasil_share_kg_pct'; label: string; color: string; kgKey: 'soya_import_brasil_kg' | 'klippfisk_export_brasil_kg' }[] = [
  { key: 'soya_import_brasil_share_kg_pct', label: 'Soyaimport fra Brasil (andel av norsk import)', color: '#ca8a04', kgKey: 'soya_import_brasil_kg' },
  { key: 'klippfisk_export_brasil_share_kg_pct', label: 'Klippfisk-eksport til Brasil (andel av norsk eksport)', color: '#0284c7', kgKey: 'klippfisk_export_brasil_kg' },
]

function formatKg(value: number | null | undefined): string {
  if (value == null) return '—'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mill. kg`
  if (value >= 1_000) return `${Math.round(value / 1_000)} 000 kg`
  return `${value} kg`
}

export function HandelsakseNorgeBrasil() {
  const [data, setData] = useState<HandelsakseData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/data/food-systems/handelsakse-norge-brasil.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<HandelsakseData>
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
    return data.timeseries.map((row) => ({
      year: row.year,
      soya_import_brasil_share_kg_pct: row.soya_import_brasil_share_kg_pct ?? null,
      klippfisk_export_brasil_share_kg_pct: row.klippfisk_export_brasil_share_kg_pct ?? null,
      soya_import_brasil_kg: row.soya_import_brasil_kg,
      klippfisk_export_brasil_kg: row.klippfisk_export_brasil_kg,
    }))
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Handelsakse Norge–Brasil (2015–2025)</h3>
        <div className="h-[280px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    )
  }

  if (hasError || !data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Handelsakse Norge–Brasil</h3>
        <EmptyState message="Klarte ikke å laste handelsakse-data" />
      </Card>
    )
  }

  const latestFinal = [...data.timeseries].reverse().find((r) => r.data_quality !== 'foreløpig')

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div>
          <h3 className="text-sm font-semibold text-stone-700">Handelsakse Norge–Brasil (2015–2025)</h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <EvidenceStatusBadge
              status="observed"
              prefix="Datastatus"
              detail="SSB tabell 08801 (tolldata). 2024 matcher Comtrade-speil til ±0,0001 %. 2025 er foreløpig."
            />
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-400 mb-3">
        To motstrømmer i samme akse: importert fôrprotein (soya) inn, høyverdi marint protein (klippfisk) ut. Andel = Brasil av norsk total (mengde, kg).
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 320 }}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis dataKey="year" fontSize={11} tick={{ fill: '#57534e' }} tickFormatter={(v) => String(v)} />
            <YAxis unit="%" fontSize={11} tick={{ fill: '#78716c' }} domain={[0, 100]} />
            <Tooltip
              formatter={(value, name, item) => {
                const row = item?.payload as (typeof chartData)[number] | undefined
                const serie = SERIES.find((s) => s.label === name)
                const kg = row && serie ? formatKg(row[serie.kgKey]) : null
                return [`${Number(value).toFixed(1)} %${kg ? ` (${kg})` : ''}`, String(name)]
              }}
              labelFormatter={(label) => `År ${label}`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconSize={8} />
            {SERIES.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={{ r: 2 }}
                connectNulls
              />
            ))}
            <ReferenceLine
              x={2025}
              stroke="#a8a29e"
              strokeDasharray="4 4"
              label={{ value: '2025 foreløpig', fontSize: 9, fill: '#a8a29e', position: 'insideTopRight' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {latestFinal && (
        <p className="text-[10px] text-stone-400 mt-2">
          Siste reviderte år ({latestFinal.year}): Brasil {latestFinal.soya_import_brasil_share_kg_pct}% av norsk soyaimport
          ({formatKg(latestFinal.soya_import_brasil_kg)}); klippfisk til Brasil {latestFinal.klippfisk_export_brasil_share_kg_pct}%
          av norsk eksport ({formatKg(latestFinal.klippfisk_export_brasil_kg)}).
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

      <ChartSource source={`Kilder: ${data.primary_sources.slice(0, 2).join('; ')}. Kontroll: ${data.control} Arbeidsdatasett: handelsakse-norge-brasil.json.`} />
    </Card>
  )
}
