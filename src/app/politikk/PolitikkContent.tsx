'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'
import type { PolicyDocumentsByCountry } from '@/lib/queries/documents'
import type { BacklogRowWithRound } from '@/lib/queries/download-backlog'

const MatsvinnProgressChart = dynamic(
  () => import('@/components/charts/MatsvinnProgressChart').then(mod => mod.MatsvinnProgressChart),
  {
    ssr: false,
    loading: () => <div className="h-[720px]" aria-hidden="true" />,
  }
)

type CountryPolicy = {
  status?: string
  year?: number | string
  details?: string
  source?: string
  notes?: string
  last_verified?: string
  documentSlug?: string
  in_force?: boolean
  in_force_status?: string
  target_pct?: number | string | null
  baseline?: number
  progress?: string
  scope?: string
  rate_dkk_per_tonne?: number
  rate_2035_dkk?: number
  effective_rate_2030_dkk?: number
  effective_rate_2035_dkk?: number
  green_area_fund_dkk_bn?: number
  green_area_targets?: string
  instrument?: string
  predictability?: string
  production_gwh?: number | null
  target_gwh?: number
  target_year?: number
  gap_vs_dk?: string
  share_of_gas_pct?: number
  target?: string
  investment_planned_eur_bn?: number
  caloric_pct?: number | null
  gap_pp?: number
  strategic_reserve?: string
  strategic_reserve_months?: number
  strategic_reserve_months_current?: number
  strategic_reserve_months_target?: number
  strategic_reserve_target_tonnes?: number
  strategic_reserve_target_year?: number
  kornax_mill_status?: string
  model?: string
  pant_return_pct?: number
  epr_system?: string
  pfas_ban_date?: string
  regulation?: string
  reuse_targets?: { takeaway_2030_pct?: number; transport_2030_pct?: number }
  efsa_approved_insect_species?: number
  pending_decisions?: string
  key_applications?: string[]
  parties?: string
  reporting?: string
}

type PolicyEntry = {
  label: string
  NO?: CountryPolicy
  SE?: CountryPolicy
  DK?: CountryPolicy
  FI?: CountryPolicy
  IS?: CountryPolicy
  EU?: CountryPolicy
}

type EuFramework = {
  waste_framework_directive_2025?: {
    in_force?: string
    binding_targets?: string
    baseline?: string
    authority_deadline?: string
    programme_adaptation?: string
    donation_obligation?: string
  }
  ppwr?: {
    reuse_takeaway_2030_pct?: number
    reuse_transport_2030_pct?: number
    notes?: string
  }
  pfas_restriction?: {
    date?: string
    impact?: string
    notes?: string
  }
  horizon_europe_cluster_6?: {
    budget_2026_eur_m?: number
    budget_2027_eur_m?: number
    focus?: string
    deadlines?: string
  }
}

export type PolicyLandscape = {
  generated: string
  last_verified?: string
  description: string
  policies: Record<string, PolicyEntry>
  eu_framework: EuFramework
}

export type PolicyTimeseries = {
  generated: string
  description: string
  food_waste_per_capita_kg: {
    label: string
    unit: string
    source: string
    series: Array<{ country: string; data: Array<{ year: number; value: number }> }>
  }
  food_waste_norway_total_tonnes: {
    label: string
    unit: string
    source: string
    target_2030_baseline_2015_pct: number
    data: Array<{
      year: number
      total: number
      household: number
      industry: number
      retail: number
      horeca: number
      agriculture: number
    }>
  }
  food_waste_norway_reduction_pct: {
    label: string
    unit: string
    source: string
    target_2030_pct: number
    interim_2025_pct_industry_horeca: number
    data: Array<{
      sector: string
      y2020: number
      y2022: number
      y2024: number
      y2025_target: number | null
    }>
  }
  biogas_production_gwh: {
    label: string
    unit: string
    source: string
    data: Array<{
      country: string
      current: number
      target: number | null
      target_year: number | null
      share_of_gas_pct?: number
    }>
  }
  self_sufficiency_caloric_pct: {
    label: string
    unit: string
    source: string
    data: Array<{
      country: string
      current: number
      target: number | null
      target_year: number | null
      gap_pp: number | null
      note?: string
    }>
  }
}

type StatusTone = 'vedtatt' | 'frivillig' | 'bindende' | 'minimal' | 'ingen' | 'aktiv' | 'ingen-data' | 'ikke-eu'

type StatusStyle = {
  tone: StatusTone
  bg: string
  text: string
  border: string
  label: string
}

const STATUS_STYLES: Record<StatusTone, StatusStyle> = {
  'ikke-eu': {
    tone: 'ikke-eu',
    bg: 'bg-stone-50',
    text: 'text-stone-500',
    border: 'border-stone-200',
    label: 'Ikke EU-regulert',
  },
  vedtatt: {
    tone: 'vedtatt',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    label: 'Vedtatt',
  },
  bindende: {
    tone: 'bindende',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    label: 'Bindende',
  },
  aktiv: {
    tone: 'aktiv',
    bg: 'bg-sky-50',
    text: 'text-sky-800',
    border: 'border-sky-200',
    label: 'Aktiv',
  },
  frivillig: {
    tone: 'frivillig',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    label: 'Frivillig',
  },
  minimal: {
    tone: 'minimal',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    label: 'Minimal',
  },
  ingen: {
    tone: 'ingen',
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-200',
    label: 'Ingen',
  },
  'ingen-data': {
    tone: 'ingen-data',
    bg: 'bg-white',
    text: 'text-stone-400',
    border: 'border-stone-200',
    label: '—',
  },
}

const COUNTRY_CODES: Array<{ code: CountryCode; key: 'NO' | 'SE' | 'DK' | 'FI' | 'IS' }> = [
  { code: 'no', key: 'NO' },
  { code: 'se', key: 'SE' },
  { code: 'dk', key: 'DK' },
  { code: 'fi', key: 'FI' },
  { code: 'is', key: 'IS' },
]

function countryMeta(code: CountryCode) {
  return COUNTRY_LIST.find(c => c.code === code)!
}

function deriveStatus(entry: CountryPolicy | undefined): StatusTone {
  if (!entry) return 'ingen-data'
  const status = (entry.status ?? '').toLowerCase()
  if (status === 'enacted') return 'vedtatt'
  if (status === 'binding') return 'bindende'
  if (status === 'voluntary') return 'frivillig'
  if (status === 'minimal') return 'minimal'
  if (status === 'none') return 'ingen'
  // No explicit status: decide from data presence
  if (entry.year != null) return 'vedtatt'
  if (entry.target_pct != null || entry.production_gwh != null || entry.instrument) return 'aktiv'
  if (Object.keys(entry).length === 0) return 'ingen-data'
  return 'aktiv'
}

function summarizeCell(entry: CountryPolicy | undefined): string {
  if (!entry) return '—'
  const parts: string[] = []
  if (entry.year != null) {
    parts.push(entry.in_force === false ? `${entry.year} (ikke i kraft)` : `${entry.year}`)
  }
  if (entry.target_pct != null) parts.push(`Mal: ${entry.target_pct}%`)
  if (entry.production_gwh != null) parts.push(`${entry.production_gwh} GWh`)
  if (entry.target_gwh != null) parts.push(`Mal: ${entry.target_gwh} GWh`)
  if (entry.caloric_pct != null) parts.push(`${entry.caloric_pct}%`)
  if (entry.rate_dkk_per_tonne != null) {
    const eff = entry.effective_rate_2030_dkk
    parts.push(eff != null ? `${entry.rate_dkk_per_tonne} DKK/t (eff. ${eff})` : `${entry.rate_dkk_per_tonne} DKK/t`)
  }
  if (entry.strategic_reserve_months_current != null) {
    const tgt = entry.strategic_reserve_months_target
    parts.push(tgt != null ? `${entry.strategic_reserve_months_current}→${tgt} mnd` : `${entry.strategic_reserve_months_current} mnd lager`)
  }
  if (entry.pant_return_pct != null) parts.push(`Pant ${entry.pant_return_pct}%`)
  if (entry.scope) parts.push(entry.scope)
  if (entry.instrument && parts.length < 2) parts.push(entry.instrument)
  if (entry.epr_system && parts.length === 0) parts.push(entry.epr_system)
  if (parts.length === 0) {
    if (entry.details) return entry.details.slice(0, 80) + (entry.details.length > 80 ? '…' : '')
    if (entry.notes) return entry.notes.slice(0, 80) + (entry.notes.length > 80 ? '…' : '')
  }
  return parts.join(' · ')
}

function longText(entry: CountryPolicy | undefined): string | null {
  if (!entry) return null
  if (entry.details) return entry.details
  if (entry.notes) return entry.notes
  return null
}

type Props = {
  data: PolicyLandscape
  timeseries: PolicyTimeseries
  docsByCountry: PolicyDocumentsByCountry
  backlogByCountry: Record<string, BacklogRowWithRound[]>
}

const COUNTRY_DOC_KEYS: Array<{ code: CountryCode; key: 'no' | 'se' | 'dk' | 'fi' | 'is' }> = [
  { code: 'no', key: 'no' },
  { code: 'se', key: 'se' },
  { code: 'dk', key: 'dk' },
  { code: 'fi', key: 'fi' },
  { code: 'is', key: 'is' },
]

export function PolitikkContent({ data, timeseries, docsByCountry, backlogByCountry }: Props) {
  const policyEntries = Object.entries(data.policies)
  const eu = data.eu_framework

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Nordisk matpolitikk</h1>
        <p className="text-stone-500 mt-2 max-w-3xl">
          Sammenligning av sirkularitet-, matsvinn- og selvforsyningspolitikk på tvers av de
          nordiske landene og EU-rammeverket. Fargekode per celle viser status: grønt for vedtatt
          eller bindende, blått for aktive virkemidler, gult for frivillige avtaler og rødt for
          minimal eller manglende politikk.
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Datasett: <span className="font-mono">policy-landscape.json</span> · Generert{' '}
          {data.generated}
          {data.last_verified && <> · Verifisert {data.last_verified}</>}
        </p>
      </div>

      {/* Dynamic document coverage from the DB */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h2 className="text-sm font-semibold text-stone-700">
            Dokumentdekning i databasen
          </h2>
          <div className="flex gap-2 text-xs">
            <Link
              href="/bibliotek"
              className="px-2 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
            >
              Utforsk /bibliotek →
            </Link>
            <Link
              href="/kilder"
              className="px-2 py-1 rounded border border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
            >
              Utforsk /kilder →
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {[
            ...COUNTRY_DOC_KEYS.map(({ code, key }) => ({
              code: code as string,
              flag: countryMeta(code).flag,
              name: countryMeta(code).name,
              data: docsByCountry[key],
            })),
            {
              code: 'nordic',
              flag: '🌍',
              name: 'Nordisk',
              data: docsByCountry.nordic,
            },
            {
              code: 'eu',
              flag: '🇪🇺',
              name: 'EU',
              data: docsByCountry.eu,
            },
          ].map(({ code, flag, name, data: d }) => (
            <div
              key={code}
              className="border border-stone-200 rounded-lg p-3 bg-white"
            >
              <div className="text-xs font-semibold text-stone-800 mb-1">
                {flag} {name}
              </div>
              <div className="text-2xl font-bold text-stone-900 leading-none">
                {d.total}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                totalt i DB
              </div>
              <div className="text-[11px] text-emerald-700 mt-0.5">
                {d.policyRelevant} policy-relevante
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-stone-400 mt-3">
          Tall hentet direkte fra <span className="font-mono">Document</span>-tabellen
          (felt <span className="font-mono">country</span>). &ldquo;Policy-relevante&rdquo;
          filtrerer på <span className="font-mono">documentType</span> (policy,
          policy_report, legal, regulatory, decision, strategy, think-tank) eller
          policy-tags (beredskap, selvforsyning, matsvinn, CO2, UTP, sirkulær, PFAS, biogass m.m.).
        </p>
      </Card>

      {/* Legend */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Forklaring</h2>
        <div className="flex flex-wrap gap-2">
          {(
            ['vedtatt', 'bindende', 'aktiv', 'frivillig', 'minimal', 'ingen', 'ikke-eu', 'ingen-data'] as StatusTone[]
          ).map(tone => {
            const s = STATUS_STYLES[tone]
            return (
              <span
                key={tone}
                className={`text-xs px-2 py-1 rounded border ${s.bg} ${s.text} ${s.border}`}
              >
                {s.label}
              </span>
            )
          })}
        </div>
      </Card>

      {/* EU framework summary */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">EU-rammeverk</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eu.waste_framework_directive_2025 && (
            <div className="border border-emerald-200 bg-emerald-50/60 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wider text-emerald-700 font-semibold mb-1">
                Waste Framework Directive 2025
              </div>
              <div className="text-sm text-stone-800 font-medium">
                {eu.waste_framework_directive_2025.binding_targets}
              </div>
              <div className="text-xs text-stone-500 mt-1 space-y-0.5">
                {eu.waste_framework_directive_2025.in_force && (
                  <div>I kraft: {eu.waste_framework_directive_2025.in_force}</div>
                )}
                {eu.waste_framework_directive_2025.baseline && (
                  <div>Baseline: {eu.waste_framework_directive_2025.baseline}</div>
                )}
                {eu.waste_framework_directive_2025.authority_deadline && (
                  <div>Frist myndighet: {eu.waste_framework_directive_2025.authority_deadline}</div>
                )}
                {eu.waste_framework_directive_2025.donation_obligation && (
                  <div className="mt-1 italic">
                    {eu.waste_framework_directive_2025.donation_obligation}
                  </div>
                )}
              </div>
            </div>
          )}

          {eu.ppwr && (
            <div className="border border-sky-200 bg-sky-50/60 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wider text-sky-700 font-semibold mb-1">
                PPWR (emballasje)
              </div>
              <div className="text-sm text-stone-800">
                Gjenbruksmal 2030: {eu.ppwr.reuse_takeaway_2030_pct}% takeaway ·{' '}
                {eu.ppwr.reuse_transport_2030_pct}% transport
              </div>
              {eu.ppwr.notes && (
                <div className="text-xs text-stone-500 mt-1">{eu.ppwr.notes}</div>
              )}
            </div>
          )}

          {eu.pfas_restriction && (
            <div className="border border-amber-200 bg-amber-50/60 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wider text-amber-700 font-semibold mb-1">
                PFAS-restriksjon
              </div>
              <div className="text-sm text-stone-800 font-medium">
                Ikrafttredelse: {eu.pfas_restriction.date}
              </div>
              {eu.pfas_restriction.impact && (
                <div className="text-xs text-stone-600 mt-1">{eu.pfas_restriction.impact}</div>
              )}
              {eu.pfas_restriction.notes && (
                <div className="text-xs text-stone-500 mt-1 italic">{eu.pfas_restriction.notes}</div>
              )}
            </div>
          )}

          {eu.horizon_europe_cluster_6 && (
            <div className="border border-violet-200 bg-violet-50/60 rounded-lg p-4">
              <div className="text-xs uppercase tracking-wider text-violet-700 font-semibold mb-1">
                Horizon Europe Cluster 6
              </div>
              <div className="text-sm text-stone-800">
                Budsjett 2026: {eu.horizon_europe_cluster_6.budget_2026_eur_m} MEUR · 2027:{' '}
                {eu.horizon_europe_cluster_6.budget_2027_eur_m} MEUR
              </div>
              {eu.horizon_europe_cluster_6.focus && (
                <div className="text-xs text-stone-500 mt-1">
                  {eu.horizon_europe_cluster_6.focus}
                </div>
              )}
              {eu.horizon_europe_cluster_6.deadlines && (
                <div className="text-xs text-stone-500 mt-0.5">
                  Soknadsfrister: {eu.horizon_europe_cluster_6.deadlines}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Policy comparison matrix */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">Politikk-matrise</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 pr-3 text-stone-500 font-medium align-bottom w-1/4">
                  Omrade
                </th>
                {COUNTRY_CODES.map(({ code }) => {
                  const m = countryMeta(code)
                  return (
                    <th
                      key={code}
                      className="text-left py-2 px-2 text-stone-700 font-semibold align-bottom"
                    >
                      {m.flag} {m.name}
                    </th>
                  )
                })}
                <th className="text-left py-2 px-2 text-stone-700 font-semibold align-bottom">
                  🇪🇺 EU
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {policyEntries.map(([slug, entry]) => (
                <tr key={slug} className="align-top">
                  <td className="py-3 pr-3 text-stone-700 font-medium">{entry.label}</td>
                  {COUNTRY_CODES.map(({ code, key }) => {
                    const cell = entry[key]
                    const status = deriveStatus(cell)
                    const style = STATUS_STYLES[status]
                    const summary = summarizeCell(cell)
                    const long = longText(cell)
                    return (
                      <td key={code} className="py-2 px-1">
                        <div
                          className={`rounded border px-2 py-1.5 ${style.bg} ${style.text} ${style.border}`}
                          title={long ?? undefined}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                            {style.label}
                          </div>
                          {summary && summary !== '—' && (
                            <div className="text-[11px] leading-tight mt-0.5">{summary}</div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td className="py-2 px-1">
                    {(() => {
                      const cell = entry.EU
                      const status: StatusTone = cell ? deriveStatus(cell) : 'ikke-eu'
                      const style = STATUS_STYLES[status]
                      const summary = cell ? summarizeCell(cell) : ''
                      const long = cell ? longText(cell) : null
                      return (
                        <div
                          className={`rounded border px-2 py-1.5 ${style.bg} ${style.text} ${style.border}`}
                          title={long ?? undefined}
                        >
                          <div className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                            {style.label}
                          </div>
                          {summary && summary !== '—' && (
                            <div className="text-[11px] leading-tight mt-0.5">{summary}</div>
                          )}
                        </div>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Matsvinn time series + progress vs target */}
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
          <h2 className="text-sm font-semibold text-stone-700">
            Matsvinn-progresjon — Norge mot 2030-mål
          </h2>
          <span className="text-[11px] text-stone-400">
            Bransjeavtalen 2017 · Mål 50% reduksjon (2015–2030)
          </span>
        </div>
        <MatsvinnProgressChart
          norwayTotal={timeseries.food_waste_norway_total_tonnes}
          reductions={timeseries.food_waste_norway_reduction_pct}
        />
        <p className="text-[11px] text-stone-500 mt-3">
          Kilde: {timeseries.food_waste_norway_total_tonnes.source}.
          Per-capita-utviklingen viser 24% reduksjon, men totalvolumet har økt grunnet
          befolkningsvekst. Industri/dagligvare/storhusholdning har nådd interim-målet
          for 2025 (-30% per capita); husholdning og jordbruk ligger langt etter.
        </p>
      </Card>

      {/* Biogas + selvforsyning summary */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-700 mb-3">
          Biogass-produksjon og selvforsyning — gap til mål
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-stone-700 mb-2">
              Biogass (GWh/år) — nåværende vs. 2030-mål
            </div>
            <div className="space-y-2">
              {timeseries.biogas_production_gwh.data.map(d => {
                const meta = COUNTRY_LIST.find(c => c.code === d.country.toLowerCase())
                if (!meta) return null
                const pct = d.target ? Math.min(100, Math.round((d.current / d.target) * 100)) : null
                return (
                  <div key={d.country}>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="font-medium text-stone-700">
                        {meta.flag} {meta.name}
                      </span>
                      <span className="text-stone-500 tabular-nums">
                        {d.current.toLocaleString('no-NO')}
                        {d.target ? ` / ${d.target.toLocaleString('no-NO')} GWh` : ' GWh'}
                        {pct != null ? ` (${pct}%)` : ''}
                      </span>
                    </div>
                    {d.target && (
                      <div className="h-1.5 bg-stone-100 rounded mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            pct! >= 80 ? 'bg-emerald-500' : pct! >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-700 mb-2">
              Kalorisk selvforsyning (%) — gap til mål eller status
            </div>
            <div className="space-y-2">
              {timeseries.self_sufficiency_caloric_pct.data.map(d => {
                const meta = COUNTRY_LIST.find(c => c.code === d.country.toLowerCase())
                if (!meta) return null
                const display = d.current
                const pct = d.target ? Math.min(100, Math.round((display / d.target) * 100)) : null
                return (
                  <div key={d.country}>
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="font-medium text-stone-700">
                        {meta.flag} {meta.name}
                      </span>
                      <span className="text-stone-500 tabular-nums">
                        {display}%
                        {d.target ? ` / mål ${d.target}% (${d.target_year})` : ''}
                        {d.gap_pp != null ? ` · gap ${d.gap_pp} pp` : ''}
                      </span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          (pct ?? display) >= 80
                            ? 'bg-emerald-500'
                            : (pct ?? display) >= 50
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, pct ?? display)}%` }}
                      />
                    </div>
                    {d.note && <div className="text-[10px] text-stone-400 mt-0.5 italic">{d.note}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 mt-3">
          Kilder: {timeseries.biogas_production_gwh.source} ·{' '}
          {timeseries.self_sufficiency_caloric_pct.source}
        </p>
      </Card>

      {/* Per-policy detail blocks */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-800">Detaljer per omrade</h2>
        {policyEntries.map(([slug, entry]) => (
          <Card key={slug}>
            <h3 className="text-sm font-semibold text-stone-800 mb-3">{entry.label}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {COUNTRY_CODES.map(({ code, key }) => {
                const cell = entry[key]
                const status = deriveStatus(cell)
                const style = STATUS_STYLES[status]
                const meta = countryMeta(code)
                return (
                  <div
                    key={code}
                    className={`rounded-lg border p-3 ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-stone-800">
                        {meta.flag} {meta.name}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${style.text} bg-white/60 border ${style.border}`}
                      >
                        {style.label}
                      </span>
                    </div>
                    {cell ? (
                      <div className="text-[11px] text-stone-700 space-y-1 leading-snug">
                        {cell.year != null && (
                          <div>
                            <span className="text-stone-500">Ar: </span>
                            {cell.year}
                            {cell.in_force === false && (
                              <span className="ml-1 text-amber-700 font-semibold">(ikke i kraft)</span>
                            )}
                          </div>
                        )}
                        {cell.in_force_status && (
                          <div className="text-amber-800 text-[10.5px] font-medium">
                            {cell.in_force_status}
                          </div>
                        )}
                        {cell.target_pct != null && (
                          <div>
                            <span className="text-stone-500">Mal: </span>
                            {cell.target_pct}%
                            {cell.target_year ? ` innen ${cell.target_year}` : ''}
                          </div>
                        )}
                        {cell.production_gwh != null && (
                          <div>
                            <span className="text-stone-500">Produksjon: </span>
                            {cell.production_gwh} GWh
                          </div>
                        )}
                        {cell.target_gwh != null && (
                          <div>
                            <span className="text-stone-500">Mal: </span>
                            {cell.target_gwh} GWh
                          </div>
                        )}
                        {cell.caloric_pct != null && (
                          <div>
                            <span className="text-stone-500">Selvforsyning: </span>
                            {cell.caloric_pct}%
                          </div>
                        )}
                        {cell.rate_dkk_per_tonne != null && (
                          <div>
                            <span className="text-stone-500">Sats: </span>
                            {cell.rate_dkk_per_tonne} DKK/tonn
                            {cell.rate_2035_dkk ? ` (${cell.rate_2035_dkk} i 2035)` : ''}
                          </div>
                        )}
                        {cell.effective_rate_2030_dkk != null && (
                          <div>
                            <span className="text-stone-500">Effektiv (etter fradrag): </span>
                            {cell.effective_rate_2030_dkk} DKK/tonn
                            {cell.effective_rate_2035_dkk
                              ? ` (${cell.effective_rate_2035_dkk} i 2035)`
                              : ''}
                          </div>
                        )}
                        {cell.strategic_reserve_months_current != null && (
                          <div>
                            <span className="text-stone-500">Kornlager: </span>
                            {cell.strategic_reserve_months_current} mnd
                            {cell.strategic_reserve_months_target
                              ? ` → mål ${cell.strategic_reserve_months_target} mnd`
                              : ''}
                          </div>
                        )}
                        {cell.strategic_reserve_target_tonnes != null && (
                          <div>
                            <span className="text-stone-500">Beredskapslager: </span>
                            {cell.strategic_reserve_target_tonnes.toLocaleString('no-NO')} t mathvete
                            {cell.strategic_reserve_target_year
                              ? ` innen ${cell.strategic_reserve_target_year}`
                              : ''}
                          </div>
                        )}
                        {cell.instrument && (
                          <div>
                            <span className="text-stone-500">Virkemiddel: </span>
                            {cell.instrument}
                          </div>
                        )}
                        {cell.scope && (
                          <div>
                            <span className="text-stone-500">Omfang: </span>
                            {cell.scope}
                          </div>
                        )}
                        {cell.pant_return_pct != null && (
                          <div>
                            <span className="text-stone-500">Pantretur: </span>
                            {cell.pant_return_pct}%
                          </div>
                        )}
                        {cell.epr_system && (
                          <div>
                            <span className="text-stone-500">EPR: </span>
                            {cell.epr_system}
                          </div>
                        )}
                        {cell.details && (
                          <div className="text-stone-600 pt-1 border-t border-white/40 italic">
                            {cell.details}
                          </div>
                        )}
                        {!cell.details && cell.notes && (
                          <div className="text-stone-600 pt-1 border-t border-white/40 italic">
                            {cell.notes}
                          </div>
                        )}
                        {cell.documentSlug && (
                          <div className="text-[10px] pt-1">
                            <Link
                              href={`/bibliotek/${cell.documentSlug}`}
                              className="text-emerald-700 hover:underline"
                            >
                              Se i /bibliotek →
                            </Link>
                          </div>
                        )}
                        {cell.source && (
                          <div className="text-[10px] text-stone-400 pt-1 break-all">
                            Kilde:{' '}
                            {cell.source.startsWith('http') ? (
                              <a
                                href={cell.source}
                                target="_blank"
                                rel="noreferrer"
                                className="text-stone-500 hover:text-emerald-800 hover:underline"
                              >
                                {new URL(cell.source).hostname.replace('www.', '')}
                              </a>
                            ) : (
                              cell.source
                            )}
                            {cell.last_verified && (
                              <span className="text-stone-400 ml-1">· verif. {cell.last_verified}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-stone-400 italic">Ingen data</div>
                    )}
                  </div>
                )
              })}
              {entry.EU && (
                <div
                  className={`rounded-lg border p-3 ${STATUS_STYLES[deriveStatus(entry.EU)].bg} ${STATUS_STYLES[deriveStatus(entry.EU)].border}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-stone-800">🇪🇺 EU</span>
                    <span
                      className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${STATUS_STYLES[deriveStatus(entry.EU)].text} bg-white/60 border ${STATUS_STYLES[deriveStatus(entry.EU)].border}`}
                    >
                      {STATUS_STYLES[deriveStatus(entry.EU)].label}
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-700 space-y-1 leading-snug">
                    {entry.EU.year != null && (
                      <div>
                        <span className="text-stone-500">Ar: </span>
                        {entry.EU.year}
                      </div>
                    )}
                    {entry.EU.target_pct != null && (
                      <div>
                        <span className="text-stone-500">Mal: </span>
                        {String(entry.EU.target_pct)}%
                      </div>
                    )}
                    {entry.EU.regulation && (
                      <div>
                        <span className="text-stone-500">Regulering: </span>
                        {entry.EU.regulation}
                      </div>
                    )}
                    {entry.EU.details && (
                      <div className="text-stone-600 pt-1 border-t border-white/40 italic">
                        {entry.EU.details}
                      </div>
                    )}
                    {entry.EU.notes && !entry.EU.details && (
                      <div className="text-stone-600 pt-1 border-t border-white/40 italic">
                        {entry.EU.notes}
                      </div>
                    )}
                    {entry.EU.documentSlug && (
                      <div className="text-[10px] pt-1">
                        <Link
                          href={`/bibliotek/${entry.EU.documentSlug}`}
                          className="text-emerald-700 hover:underline"
                        >
                          Se i /bibliotek →
                        </Link>
                      </div>
                    )}
                    {entry.EU.source && (
                      <div className="text-[10px] text-stone-400 pt-1 break-all">
                        Kilde:{' '}
                        {entry.EU.source.startsWith('http') ? (
                          <a
                            href={entry.EU.source}
                            target="_blank"
                            rel="noreferrer"
                            className="text-stone-500 hover:text-emerald-800 hover:underline"
                          >
                            {new URL(entry.EU.source).hostname.replace('www.', '')}
                          </a>
                        ) : (
                          entry.EU.source
                        )}
                        {entry.EU.last_verified && (
                          <span className="text-stone-400 ml-1">· verif. {entry.EU.last_verified}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Per-country related documents (DB + backlog) */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <h2 className="text-xl font-semibold text-stone-800">Relaterte dokumenter per land</h2>
          <p className="text-xs text-stone-500 max-w-xl">
            Policy-relevante dokumenter i databasen og uutnyttede P1/P2-kilder fra
            forskningsbacklogen. Klikk tittel for å åpne dokumentet i{' '}
            <Link href="/bibliotek" className="underline decoration-stone-300">
              /bibliotek
            </Link>
            .
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COUNTRY_DOC_KEYS.map(({ code, key }) => {
            const meta = countryMeta(code)
            const dbDocs = docsByCountry[key]
            const backlogRows = backlogByCountry[key.toUpperCase()] ?? []
            const backlogTop = backlogRows.slice(0, 8)
            return (
              <Card key={code}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-800">
                    {meta.flag} {meta.name}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    {dbDocs.total} i DB · {dbDocs.policyRelevant} policy-relevante
                    {backlogRows.length > 0 ? ` · ${backlogRows.length} i backlog` : ''}
                  </span>
                </div>

                <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1">
                  Fra databasen
                </div>
                {dbDocs.samples.length === 0 ? (
                  <p className="text-[12px] text-stone-400 italic mb-3">
                    Ingen policy-merkede dokumenter for {meta.name} enda.
                  </p>
                ) : (
                  <ul className="space-y-1.5 mb-3">
                    {dbDocs.samples.map((doc) => (
                      <li key={doc.id} className="text-[12px] leading-snug">
                        <Link
                          href={`/bibliotek/${doc.slug}`}
                          className="text-stone-800 hover:text-emerald-800 hover:underline"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-stone-400">
                          {doc.year != null ? ` · ${doc.year}` : ''}
                          {doc.documentType ? ` · ${doc.documentType}` : ''}
                          {doc.author ? ` · ${doc.author}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {dbDocs.policyRelevant > dbDocs.samples.length && (
                  <div className="mb-3">
                    <Link
                      href={`/bibliotek?country=${key}`}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Se alle {dbDocs.policyRelevant} policy-relevante {meta.name}-dokumenter →
                    </Link>
                  </div>
                )}

                {backlogTop.length > 0 && (
                  <>
                    <div className="text-[11px] uppercase tracking-wider font-semibold text-stone-500 mb-1 mt-2">
                      P1/P2 fra backlog
                    </div>
                    <ul className="space-y-1.5">
                      {backlogTop.map((row, idx) => (
                        <li key={`${row.round}-${idx}`} className="text-[12px] leading-snug">
                          {row.url ? (
                            <a
                              href={row.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-stone-800 hover:text-emerald-800 hover:underline"
                            >
                              {row.title || '(uten tittel)'}
                            </a>
                          ) : (
                            <span className="text-stone-800">{row.title || '(uten tittel)'}</span>
                          )}
                          <span className="text-stone-400">
                            {row.year ? ` · ${row.year}` : ''}
                            {` · ${row.priority}`}
                            {row.theme ? ` · ${row.theme}` : ''}
                            {row.institution ? ` · ${row.institution}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {backlogRows.length > backlogTop.length && (
                      <div className="mt-2">
                        <Link
                          href="/kilder"
                          className="text-[11px] text-emerald-700 hover:underline"
                        >
                          +{backlogRows.length - backlogTop.length} flere i backlog · Se /kilder →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
