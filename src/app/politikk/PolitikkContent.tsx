'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { COUNTRY_LIST } from '@/lib/config/countries'
import type { CountryCode } from '@/lib/config/countries'
import type { PolicyDocumentsByCountry } from '@/lib/queries/documents'
import type { BacklogRowWithRound } from '@/lib/queries/download-backlog'

type CountryPolicy = {
  status?: string
  year?: number | string
  details?: string
  source?: string
  notes?: string
  target_pct?: number | string | null
  baseline?: number
  progress?: string
  scope?: string
  rate_dkk_per_tonne?: number
  rate_2035_dkk?: number
  green_area_fund_dkk_m?: number
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
  description: string
  policies: Record<string, PolicyEntry>
  eu_framework: EuFramework
}

type StatusTone = 'vedtatt' | 'frivillig' | 'bindende' | 'minimal' | 'ingen' | 'aktiv' | 'ingen-data'

type StatusStyle = {
  tone: StatusTone
  bg: string
  text: string
  border: string
  label: string
}

const STATUS_STYLES: Record<StatusTone, StatusStyle> = {
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
  if (entry.year != null) parts.push(`${entry.year}`)
  if (entry.target_pct != null) parts.push(`Mal: ${entry.target_pct}%`)
  if (entry.production_gwh != null) parts.push(`${entry.production_gwh} GWh`)
  if (entry.target_gwh != null) parts.push(`Mal: ${entry.target_gwh} GWh`)
  if (entry.caloric_pct != null) parts.push(`${entry.caloric_pct}%`)
  if (entry.rate_dkk_per_tonne != null) parts.push(`${entry.rate_dkk_per_tonne} DKK/t`)
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

export function PolitikkContent({ data, docsByCountry, backlogByCountry }: Props) {
  const policyEntries = Object.entries(data.policies)
  const eu = data.eu_framework

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Nordisk matpolitikk</h1>
        <p className="text-stone-500 mt-2 max-w-3xl">
          Sammenligning av sirkularitet-, matsvinn- og selvforsyningspolitikk pa tvers av de
          nordiske landene og EU-rammeverket. Fargekode per celle viser status: grønt for vedtatt
          eller bindende, blått for aktive virkemidler, gult for frivillige avtaler og rødt for
          minimal eller manglende politikk.
        </p>
        <p className="text-xs text-stone-400 mt-2">
          Datasett: <span className="font-mono">policy-landscape.json</span> · Generert{' '}
          {data.generated}
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
            ['vedtatt', 'bindende', 'aktiv', 'frivillig', 'minimal', 'ingen', 'ingen-data'] as StatusTone[]
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
                      const status = deriveStatus(cell)
                      const style = STATUS_STYLES[status]
                      const summary = summarizeCell(cell)
                      const long = longText(cell)
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
                        {cell.source && (
                          <div className="text-[10px] text-stone-400 pt-1">
                            Kilde: {cell.source}
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
                    {entry.EU.source && (
                      <div className="text-[10px] text-stone-400 pt-1">
                        Kilde: {entry.EU.source}
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
