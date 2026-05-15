'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Area,
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
  fishmeal_pct: number | null
  fish_oil_pct: number | null
  soy_protein_concentrate_pct: number | null
  rapeseed_oil_pct: number | null
  sunflower_pct: number | null
  novel_ingredients_pct: number | null
  carbohydrate_pct?: number | null
  micro_ingredients_pct?: number | null
  other_veg_protein_pct?: number | null
  total_feed_raw_materials_tonnes: number | null
  domestic_share_pct: number | null
  data_quality: string
  note?: string
}

type OriginCountries = {
  fishmeal?: {
    main_producers?: string[]
    species?: string
    peru_global_share_pct?: number
  }
  soy_protein_concentrate?: {
    main_suppliers?: string[]
    certification?: string
    key_supplier?: string
  }
  rapeseed_oil?: {
    origin?: string
    trend?: string
  }
}

type PolicyTargets = {
  domestic_share_target_pct: number
  target_year: number
  baseline_pct: number
  baseline_year: number
  source: string
}

type MarketStructure = {
  oligopoly_since?: number
  dominant_actors?: { name: string; parent?: string; formerly?: string }[]
  combined_share_pct?: number
  note?: string
}

type FeedCompositionData = {
  generated: string
  source: string
  description: string
  methodology: string
  primary_sources: string[]
  market_structure?: MarketStructure
  timeseries: TimeseriesRow[]
  origin_countries?: OriginCountries
  policy_targets?: PolicyTargets
}

type StackKey =
  | 'fishmeal_pct'
  | 'fish_oil_pct'
  | 'soy_protein_concentrate_pct'
  | 'rapeseed_oil_pct'
  | 'sunflower_pct'
  | 'other_veg_protein_pct'
  | 'carbohydrate_pct'
  | 'micro_ingredients_pct'
  | 'novel_ingredients_pct'

const STACK_SERIES: { key: StackKey; label: string; color: string }[] = [
  { key: 'fishmeal_pct', label: 'Fiskemel', color: '#0284c7' },
  { key: 'fish_oil_pct', label: 'Fiskeolje', color: '#38bdf8' },
  { key: 'soy_protein_concentrate_pct', label: 'Soyaproteinkonsentrat', color: '#ca8a04' },
  { key: 'rapeseed_oil_pct', label: 'Rapsolje', color: '#eab308' },
  { key: 'sunflower_pct', label: 'Solsikke', color: '#f59e0b' },
  { key: 'other_veg_protein_pct', label: 'Andre vegetabilske proteiner', color: '#84cc16' },
  { key: 'carbohydrate_pct', label: 'Karbohydrater', color: '#a3a3a3' },
  { key: 'micro_ingredients_pct', label: 'Mikroingredienser', color: '#78716c' },
  { key: 'novel_ingredients_pct', label: 'Nye råvarer (insekt/alger m.m.)', color: '#10b981' },
]

function formatTonnes(value: number | null | undefined): string | null {
  if (value == null) return null
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} mill. tonn`
  if (value >= 1_000) return `${Math.round(value / 1_000)} 000 tonn`
  return `${value} tonn`
}

export function FeedCompositionTimeseries() {
  const [data, setData] = useState<FeedCompositionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    let active = true
    fetch('/data/food-systems/feed-composition-timeseries.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<FeedCompositionData>
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
    // Keep only rows with at least one numeric composition value
    return data.timeseries
      .filter((row) =>
        STACK_SERIES.some((s) => {
          const v = row[s.key]
          return typeof v === 'number' && v > 0
        }),
      )
      .map((row) => {
        const entry: Record<string, number | string> = { year: row.year }
        STACK_SERIES.forEach((s) => {
          const v = row[s.key]
          entry[s.key] = typeof v === 'number' ? v : 0
        })
        if (row.domestic_share_pct != null) entry.domestic_share_pct = row.domestic_share_pct
        return entry
      })
  }, [data])

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Fôrsammensetning norsk laks (2010–2025)</h3>
        <div className="h-[260px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    )
  }

  if (hasError || !data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Fôrsammensetning norsk laks</h3>
        <EmptyState message="Klarte ikke å laste fôrsammensetningsdata" />
      </Card>
    )
  }

  const { policy_targets, origin_countries, primary_sources, market_structure } = data

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 mb-0.5">
        <div>
          <h3 className="text-sm font-semibold text-stone-700">
            Fôrsammensetning norsk laks (2010–2025)
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <EvidenceStatusBadge
              status="estimated"
              prefix="Datastatus"
              detail="Tidsserien blander dokumenterte år, interpolerte mellomår og post-2020-estimat."
            />
            {market_structure?.combined_share_pct != null && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 whitespace-nowrap">
                {market_structure.combined_share_pct}% oligopol
              </span>
            )}
          </div>
        </div>
      </div>
      <p className="text-xs text-stone-400 mb-3">
        Andel av totalvolum råvarer (tørrstoff), dokumenterte år
      </p>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 720, height: 320 }}>
          <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
            <XAxis
              dataKey="year"
              fontSize={11}
              tick={{ fill: '#57534e' }}
              tickFormatter={(v) => String(v)}
            />
            <YAxis
              unit="%"
              fontSize={11}
              tick={{ fill: '#78716c' }}
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toFixed(1)}%`,
                String(name),
              ]}
              labelFormatter={(label) => `År ${label}`}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
              iconSize={8}
            />
            {STACK_SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stackId="feed"
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.8}
                strokeWidth={0.5}
              />
            ))}
            {policy_targets && (
              <ReferenceLine
                y={policy_targets.domestic_share_target_pct}
                stroke="#be185d"
                strokeDasharray="4 4"
                label={{
                  value: `Mål: ${policy_targets.domestic_share_target_pct}% norske råvarer (${policy_targets.target_year})`,
                  fontSize: 9,
                  fill: '#be185d',
                  position: 'insideTopRight',
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {policy_targets && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
              Politisk mål — norske råvarer
            </h4>
            <p className="text-sm text-stone-700 leading-snug">
              <span className="font-semibold">{policy_targets.domestic_share_target_pct}%</span> innen{' '}
              <span className="font-semibold">{policy_targets.target_year}</span>{' '}
              <span className="text-stone-500">
                (fra {policy_targets.baseline_pct}% i {policy_targets.baseline_year})
              </span>
            </p>
            <p className="text-[10px] text-stone-400 mt-1">Kilde: {policy_targets.source}</p>
          </div>
        )}

        {origin_countries && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <h4 className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 mb-1.5">
              Opprinnelse — hovedråvarer
            </h4>
            <ul className="space-y-1 text-xs text-stone-700">
              {origin_countries.fishmeal?.main_producers && (
                <li>
                  <span className="font-semibold text-stone-600">Fiskemel:</span>{' '}
                  {origin_countries.fishmeal.main_producers.slice(0, 4).join(', ')}
                  {origin_countries.fishmeal.peru_global_share_pct != null && (
                    <span className="text-stone-400">
                      {' '}
                      (Peru ~{origin_countries.fishmeal.peru_global_share_pct}% globalt)
                    </span>
                  )}
                </li>
              )}
              {origin_countries.soy_protein_concentrate?.main_suppliers && (
                <li>
                  <span className="font-semibold text-stone-600">Soyaproteinkonsentrat:</span>{' '}
                  {origin_countries.soy_protein_concentrate.main_suppliers.join(', ')}
                </li>
              )}
              {origin_countries.rapeseed_oil?.origin && (
                <li>
                  <span className="font-semibold text-stone-600">Rapsolje:</span>{' '}
                  {origin_countries.rapeseed_oil.origin}
                  {origin_countries.rapeseed_oil.trend && (
                    <span className="text-stone-400"> — {origin_countries.rapeseed_oil.trend}</span>
                  )}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {chartData.some((d) => typeof d.total_feed_raw_materials_tonnes === 'number') && (
        <p className="text-[10px] text-stone-400 mt-2">
          Siste dokumenterte totalvolum (2020):{' '}
          {formatTonnes(
            data.timeseries.find((r) => r.year === 2020)?.total_feed_raw_materials_tonnes ?? null,
          )}{' '}
          · {data.timeseries.find((r) => r.year === 2020)?.domestic_share_pct}% norsk andel
        </p>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          {primary_sources.length} primærkilder registrert
        </span>
        {market_structure?.oligopoly_since != null && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            Oligopol siden {market_structure.oligopoly_since}
          </span>
        )}
      </div>

      <ChartSource source={`Kilder: ${primary_sources.slice(0, 3).join('; ')}. Arbeidsdatasett: feed-composition-timeseries.json.`} />
    </Card>
  )
}
