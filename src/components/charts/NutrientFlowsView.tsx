'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'

type Nutrient = 'n' | 'p' | 'k'
type CountryCode = 'NO' | 'SE' | 'DK' | 'FI' | 'IS'

type LossEntry = {
  n_kt_yr: number | null
  p_kt_yr: number | null
  k_kt_yr: number | null
  note?: string
}

type CountryData = {
  population_m: number
  imports?: {
    mineral_n_kt_yr?: number | null
    mineral_p_kt_yr?: number | null
    mineral_k_kt_yr?: number | null
    soya_protein_n_kt_yr?: number | null
    fishmeal_n_kt_yr?: number | null
    soya_protein_p_kt_yr?: number | null
    fishmeal_p_kt_yr?: number | null
    total_imported_n_kt_yr?: number | null
    total_imported_p_kt_yr?: number | null
    note?: string
  }
  losses?: {
    aquaculture_to_fjord?: LossEntry
    svartvann_to_sea?: LossEntry
    husdyr_to_environment?: LossEntry
    matavfall_to_incineration?: LossEntry
  }
  loss_summary?: {
    total_n_loss_kt_yr?: number | null
    total_p_loss_kt_yr?: number | null
  }
  recovery_potential?: {
    svartvann_n_low_kt_yr?: number | null
    svartvann_n_high_kt_yr?: number | null
    svartvann_p_low_kt_yr?: number | null
    svartvann_p_high_kt_yr?: number | null
    svartvann_k_low_kt_yr?: number | null
    svartvann_k_high_kt_yr?: number | null
    all_streams_n_recoverable_kt_yr?: number | null
    all_streams_p_recoverable_kt_yr?: number | null
    total_recoverable_pct_of_import_n?: string | null
    total_recoverable_pct_of_import_p?: string | null
    svartvann_pct_of_mineral_n?: string | null
    svartvann_pct_of_mineral_p?: string | null
    note?: string
  }
  sources?: string[]
}

type NutrientFlowsData = {
  generated: string
  description: string
  methodology: string
  countries: Partial<Record<CountryCode, CountryData>>
  nordic_summary?: unknown
  technologies?: unknown
}

type Row = {
  label: string
  kind: 'import' | 'loss' | 'recovery'
  value: number | null
}

const COUNTRY_LABELS: Record<CountryCode, string> = {
  NO: 'Norge',
  SE: 'Sverige',
  DK: 'Danmark',
  FI: 'Finland',
  IS: 'Island',
}

const NUTRIENT_LABELS: Record<Nutrient, { short: string; long: string }> = {
  n: { short: 'N', long: 'Nitrogen (N)' },
  p: { short: 'P', long: 'Fosfor (P)' },
  k: { short: 'K', long: 'Kalium (K)' },
}

const KIND_COLORS: Record<Row['kind'], string> = {
  import: '#57534e',
  loss: '#b45309',
  recovery: '#10b981',
}

const KIND_LABELS: Record<Row['kind'], string> = {
  import: 'Import',
  loss: 'Tap',
  recovery: 'Gjenvinningspotensial',
}

function pickNutrient<T extends Record<string, unknown>>(
  obj: T | undefined,
  suffix: Nutrient,
): number | null {
  if (!obj) return null
  const key = Object.keys(obj).find((k) => k.includes(`_${suffix}_`))
  if (!key) return null
  const v = obj[key]
  return typeof v === 'number' ? v : null
}

function buildRows(country: CountryData, nutrient: Nutrient): Row[] {
  const rows: Row[] = []
  const imports = country.imports
  if (imports) {
    if (nutrient === 'n') {
      if (typeof imports.mineral_n_kt_yr === 'number')
        rows.push({ label: 'Mineralgjødsel', kind: 'import', value: imports.mineral_n_kt_yr })
      if (typeof imports.soya_protein_n_kt_yr === 'number')
        rows.push({ label: 'Soya-protein', kind: 'import', value: imports.soya_protein_n_kt_yr })
      if (typeof imports.fishmeal_n_kt_yr === 'number')
        rows.push({ label: 'Fiskemel', kind: 'import', value: imports.fishmeal_n_kt_yr })
    } else if (nutrient === 'p') {
      if (typeof imports.mineral_p_kt_yr === 'number')
        rows.push({ label: 'Mineralgjødsel', kind: 'import', value: imports.mineral_p_kt_yr })
      if (typeof imports.soya_protein_p_kt_yr === 'number')
        rows.push({ label: 'Soya-protein', kind: 'import', value: imports.soya_protein_p_kt_yr })
      if (typeof imports.fishmeal_p_kt_yr === 'number')
        rows.push({ label: 'Fiskemel', kind: 'import', value: imports.fishmeal_p_kt_yr })
    } else if (nutrient === 'k') {
      if (typeof imports.mineral_k_kt_yr === 'number')
        rows.push({ label: 'Mineralgjødsel', kind: 'import', value: imports.mineral_k_kt_yr })
    }
  }

  const losses = country.losses
  if (losses) {
    const order: Array<[keyof NonNullable<CountryData['losses']>, string]> = [
      ['aquaculture_to_fjord', 'Havbruk til fjord'],
      ['svartvann_to_sea', 'Svartvann til sjø'],
      ['husdyr_to_environment', 'Husdyr til miljø'],
      ['matavfall_to_incineration', 'Matavfall til forbrenning'],
    ]
    for (const [key, label] of order) {
      const entry = losses[key]
      if (!entry) continue
      const v = entry[`${nutrient}_kt_yr` as const]
      if (typeof v === 'number') rows.push({ label, kind: 'loss', value: v })
    }
  }

  const recovery = country.recovery_potential
  if (recovery) {
    const highKey = `svartvann_${nutrient}_high_kt_yr` as const
    const highVal = recovery[highKey]
    if (typeof highVal === 'number' && highVal > 0) {
      rows.push({ label: 'Svartvann (øvre est.)', kind: 'recovery', value: highVal })
    }
    if (nutrient === 'n' && typeof recovery.all_streams_n_recoverable_kt_yr === 'number') {
      rows.push({
        label: 'Alle strømmer (70 %)',
        kind: 'recovery',
        value: recovery.all_streams_n_recoverable_kt_yr,
      })
    }
    if (nutrient === 'p' && typeof recovery.all_streams_p_recoverable_kt_yr === 'number') {
      rows.push({
        label: 'Alle strømmer (70 %)',
        kind: 'recovery',
        value: recovery.all_streams_p_recoverable_kt_yr,
      })
    }
  }

  return rows
}

function NutrientBarChart({
  nutrient,
  rows,
}: {
  nutrient: Nutrient
  rows: Row[]
}) {
  const label = NUTRIENT_LABELS[nutrient]
  if (rows.length === 0) {
    return (
      <div className="flex flex-col">
        <h4 className="text-xs font-semibold text-stone-700 mb-1">{label.long}</h4>
        <EmptyState message="Ikke kvantifisert i kildemateriale" />
      </div>
    )
  }

  const chartData = rows.map((r) => ({
    name: r.label,
    value: r.value ?? 0,
    kind: r.kind,
    displayValue: r.value !== null ? `${r.value.toLocaleString('nb-NO')} kt` : '–',
  }))

  return (
    <div className="flex flex-col">
      <h4 className="text-xs font-semibold text-stone-700 mb-1">{label.long}</h4>
      <p className="text-[10px] text-stone-400 mb-2">Strømmer i kt per år</p>
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 56, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 10, fill: '#57534e' }}
              width={150}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f5f5f4' }}
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }}
              formatter={(value) => {
                const n = typeof value === 'number' ? value : Number(value)
                return [`${n.toLocaleString('nb-NO')} kt ${label.short}/år`, label.long]
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={KIND_COLORS[d.kind]} />
              ))}
              <LabelList
                dataKey="displayValue"
                position="right"
                style={{ fontSize: 10, fill: '#57534e' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export function NutrientFlowsView({ defaultCountry = 'NO' }: { defaultCountry?: CountryCode }) {
  const [data, setData] = useState<NutrientFlowsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [country, setCountry] = useState<CountryCode>(defaultCountry)

  useEffect(() => {
    setLoading(true)
    fetch('/data/food-systems/nutrient-flows.json')
      .then((r) => {
        if (!r.ok) throw new Error('fetch failed')
        return r.json()
      })
      .then((json: NutrientFlowsData) => {
        setData(json)
        setError(false)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const availableCountries = useMemo<CountryCode[]>(() => {
    if (!data) return []
    return (Object.keys(data.countries) as CountryCode[]).filter(
      (c) => data.countries[c] !== undefined,
    )
  }, [data])

  const countryData = data?.countries[country]

  const rowsByNutrient = useMemo(() => {
    if (!countryData) return null
    return {
      n: buildRows(countryData, 'n'),
      p: buildRows(countryData, 'p'),
      k: buildRows(countryData, 'k'),
    }
  }, [countryData])

  if (loading) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Næringsstoff-flyt (N, P, K)</h3>
        <div className="py-8 text-center text-sm text-stone-400">Laster…</div>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Næringsstoff-flyt (N, P, K)</h3>
        <EmptyState message="Kunne ikke laste data om næringsstoff-flyt" />
      </Card>
    )
  }

  const countrySources = countryData?.sources ?? []
  const combinedSources = countrySources.slice(0, 4).join(', ')

  return (
    <Card>
      <div className="flex flex-col gap-2 mb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-700 mb-0.5">
            Næringsstoff-flyt (N, P, K) – {COUNTRY_LABELS[country]}
          </h3>
          <p className="text-xs text-stone-500">
            Import, tap til miljø og teknisk gjenvinningspotensial. Kt per år (kilotonn).
          </p>
        </div>
        <div
          role="tablist"
          aria-label="Velg land"
          className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 self-start"
        >
          {availableCountries.map((c) => {
            const active = c === country
            return (
              <button
                key={c}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setCountry(c)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  active
                    ? 'bg-white text-stone-800 shadow-sm border border-stone-200'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {COUNTRY_LABELS[c]}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-[11px] text-stone-500">
        {(['import', 'loss', 'recovery'] as Row['kind'][]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: KIND_COLORS[k] }}
            />
            {KIND_LABELS[k]}
          </span>
        ))}
        {countryData?.population_m !== undefined && (
          <span className="text-stone-400">
            Befolkning: {countryData.population_m.toLocaleString('nb-NO')} mill.
          </span>
        )}
      </div>

      {rowsByNutrient ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NutrientBarChart nutrient="n" rows={rowsByNutrient.n} />
          <NutrientBarChart nutrient="p" rows={rowsByNutrient.p} />
          <NutrientBarChart nutrient="k" rows={rowsByNutrient.k} />
        </div>
      ) : (
        <EmptyState message={`Ingen data for ${COUNTRY_LABELS[country]}`} />
      )}

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-[11px] leading-relaxed text-amber-900">
        <strong className="font-semibold">Metodikk:</strong>{' '}
        Material Flow Analysis (MFA) basert på NIBIO, SSB, Norsk Vann, Hamilton et al. (2023), HSY Finland,
        Svenskt Vatten og DTU Environment. Kryssvalidert mot P27 (avløpsanlegg) og P29 (gjødselimport) fra Perplexity Runde 2 (20.04.26).{' '}
        <em>Tall er størrelsesordensestimater (order-of-magnitude), ikke offisiell statistikk.</em>
      </div>

      {combinedSources && (
        <ChartSource source={`Kilder (${COUNTRY_LABELS[country]}): ${combinedSources}`} />
      )}
    </Card>
  )
}

export default NutrientFlowsView
