'use client'

import Link from 'next/link'
import { Fragment, useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  PROPERTY_COMPANY_KJEDE_LABELS,
  PROPERTY_COMPANY_TYPE_LABELS,
  equityRatioPct,
  type PropertyCompanyKjede,
} from '@/lib/data/property-companies'
import type { PropertyCompanyRow } from '@/lib/queries/property-companies'

const PropertiesMap = dynamic(
  () => import('@/components/map/PropertiesMap').then((m) => m.PropertiesMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] w-full rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-sm text-stone-400">
        Laster kart…
      </div>
    ),
  }
)

type PropertyRow = {
  id: string
  propertyType: string
  address: string | null
  municipality: string | null
  county: string | null
  country: string
  sqMeters: number | null
  selfLeased: boolean
  acquiredYear: number | null
  source: string | null
  company: {
    id: string
    name: string
  }
  tenantCompany: {
    id: string
    name: string
  } | null
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  warehouse: 'Lager',
  retail: 'Butikk',
  office: 'Kontor',
  production: 'Produksjon',
  logistics: 'Logistikk',
}

const PROPERTY_TYPE_STYLES: Record<string, string> = {
  warehouse: 'bg-orange-50 text-orange-700 border-orange-200',
  retail: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  office: 'bg-stone-100 text-stone-600 border-stone-200',
  production: 'bg-blue-50 text-blue-700 border-blue-200',
  logistics: 'bg-purple-50 text-purple-700 border-purple-200',
}

function formatSqm(sqm: number | null) {
  if (sqm == null) return '—'
  return `${sqm.toLocaleString('no')} m²`
}

const KJEDE_ACCENT: Record<PropertyCompanyKjede, string> = {
  norgesgruppen: 'bg-emerald-500',
  reitan: 'bg-rose-500',
  coop: 'bg-sky-500',
}

function formatMrd(nok: number) {
  return `${(nok / 1e9).toFixed(2)} mrd.`
}

function formatMnok(nok: number) {
  if (nok === 0) return '—'
  const mnok = nok / 1e6
  if (Math.abs(mnok) >= 1000) return `${(mnok / 1000).toFixed(1)} mrd.`
  return `${Math.round(mnok).toLocaleString('no')} mill.`
}

export function EiendommerContent({
  properties,
  propertyCompanies,
  konsernFilter,
  konsernNotFound,
}: {
  properties: PropertyRow[]
  propertyCompanies: PropertyCompanyRow[]
  konsernFilter?: { slug: string; name: string } | null
  konsernNotFound?: boolean
}) {
  const [typeFilter, setTypeFilter] = useState('alle')
  const [companyFilter, setCompanyFilter] = useState('alle')
  const [selfLeasedFilter, setSelfLeasedFilter] = useState<'alle' | 'ja' | 'nei'>('alle')

  const propertyTypes = useMemo(
    () => Array.from(new Set(properties.map(p => p.propertyType))).sort(),
    [properties]
  )

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of properties) map.set(p.company.id, p.company.name)
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'no'))
  }, [properties])

  const filtered = useMemo(() => {
    return properties
      .filter((p) => {
        if (typeFilter !== 'alle' && p.propertyType !== typeFilter) return false
        if (companyFilter !== 'alle' && p.company.id !== companyFilter) return false
        if (selfLeasedFilter === 'ja' && !p.selfLeased) return false
        if (selfLeasedFilter === 'nei' && p.selfLeased) return false
        return true
      })
      .sort((a, b) => {
        // acquiredYear DESC, nulls last
        const ay = a.acquiredYear ?? -Infinity
        const by = b.acquiredYear ?? -Infinity
        if (by !== ay) return by - ay
        return a.company.name.localeCompare(b.company.name, 'no')
      })
  }, [properties, typeFilter, companyFilter, selfLeasedFilter])

  // Stable filter callback for the map — mirrors list filters so the two views stay in sync.
  const mapFilter = useCallback(
    (f: { propertyType: string; companyId: string; selfLeased: boolean }) => {
      if (typeFilter !== 'alle' && f.propertyType !== typeFilter) return false
      if (companyFilter !== 'alle' && f.companyId !== companyFilter) return false
      if (selfLeasedFilter === 'ja' && !f.selfLeased) return false
      if (selfLeasedFilter === 'nei' && f.selfLeased) return false
      return true
    },
    [typeFilter, companyFilter, selfLeasedFilter]
  )

  const stats = useMemo(() => {
    const total = filtered.length
    const totalSqm = filtered.reduce((acc, p) => acc + (p.sqMeters ?? 0), 0)
    const selfLeasedCount = filtered.filter(p => p.selfLeased).length
    const selfLeasedPct = total > 0 ? (selfLeasedCount / total) * 100 : 0
    return { total, totalSqm, selfLeasedCount, selfLeasedPct }
  }, [filtered])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {konsernNotFound && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ukjent konsern — viser alle eiendommer.
        </div>
      )}
      {konsernFilter && (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900">
          <span>
            Filtrert på konsern:{' '}
            <strong>{konsernFilter.name}</strong>
          </span>
          <Link
            href="/eiendommer"
            className="ml-auto shrink-0 rounded border border-emerald-300 bg-white px-2 py-0.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
          >
            Fjern filter ×
          </Link>
        </div>
      )}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700 font-semibold mb-2">
              Eiendomsmakt
            </p>
            <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
              Det største maktinstrumentet i norsk dagligvare
            </h1>
            <p className="text-stone-600 mt-3 leading-relaxed">
              De tre store dagligvarekjedene driver milliardstore eiendomsporteføljer som låser
              markedet for nye aktører og forskyver overskudd ut av synlig dagligvaremargin.
              Strukturen — separate eiendomsselskaper som leier butikklokaler tilbake til konsernets
              egne driftsselskaper — er kjernen i den dobbelte innlåsingen av norsk dagligvare.
            </p>
          </div>
          <Link
            href="/kart/no"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50 self-start whitespace-nowrap"
          >
            Se på kart
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white px-4 py-3">
            <p className="text-2xl font-bold text-stone-900 tabular-nums">35 mrd.</p>
            <p className="text-xs text-stone-500 leading-snug mt-1">
              NOK i samlede eiendomseiendeler hos NorgesGruppen, Reitan og Coop (2024)
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white px-4 py-3">
            <p className="text-2xl font-bold text-stone-900 tabular-nums">2,5–4,6 mrd.</p>
            <p className="text-xs text-stone-500 leading-snug mt-1">
              NOK estimert årlig internleie mellom konsernselskaper
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white px-4 py-3">
            <p className="text-2xl font-bold text-stone-900 tabular-nums">3–8 %</p>
            <p className="text-xs text-stone-500 leading-snug mt-1">
              Strukturell kostnadsfordel mot nye aktører i en bransje med &lt;3 % netto driftsmargin
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-gradient-to-br from-stone-50 to-white px-4 py-3">
            <p className="text-2xl font-bold text-stone-900 tabular-nums">~99 %</p>
            <p className="text-xs text-stone-500 leading-snug mt-1">
              Markedsandel for de tre kjedene som kontrollerer både butikker og tomter
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">
              Lidl-exit · 2008
            </p>
            <p className="text-sm font-semibold text-stone-800 mt-1.5">
              Trakk seg ut etter sju år
            </p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Lidl klarte aldri å sikre nok lokasjoner i prime-områder. Eierskapet til
              butikklokalene hos de etablerte kjedene var en tyngre barriere enn pris.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">
              Negative servitutter · forbudt 2024
            </p>
            <p className="text-sm font-semibold text-stone-800 mt-1.5">
              Tinglyste konkurranse-klausuler
            </p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              I tiår solgte kjedene eiendommer med kraven om at det &laquo;aldri kan drives
              dagligvarehandel&raquo; der. Konkurransetilsynet fikk endelig praksisen forbudt.
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold">
              Bergen-saken · 2020
            </p>
            <p className="text-sm font-semibold text-stone-800 mt-1.5">
              20 mill. i gebyr til NorgesGruppen
            </p>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Konkurransetilsynet ga gebyr for ikke å ha meldt fra om overtakelse av et lokale der
              Coop holdt til — under den særskilte opplysningsplikten fra 2016.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-stone-400 leading-relaxed">
          Tall hentet fra Brønnøysundregistrene (regnskapsåret 2024) via offentlige registre.
          Dokumentert selskap-for-selskap i prosjektets kildenotater.
        </p>
      </section>

      <PropertyCompaniesSection rows={propertyCompanies} />

      <div className="border-t border-stone-200 pt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          Kartlagte eiendommer i registeret
        </h2>
        <p className="text-sm text-stone-500">
          Lagre, butikklokaler og logistikkhuber registrert i datasettet. Selvleie-flagget markerer
          konsernintern utleie.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Eiendommer</div>
          <div className="text-2xl font-bold text-stone-900">{stats.total.toLocaleString('no')}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Totalt areal</div>
          <div className="text-2xl font-bold text-stone-900">
            {stats.totalSqm > 0 ? `${Math.round(stats.totalSqm).toLocaleString('no')} m²` : '—'}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Selvleie</div>
          <div className="text-2xl font-bold text-stone-900">{stats.selfLeasedCount}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Selvleie-andel</div>
          <div className="text-2xl font-bold text-stone-900">
            {stats.total > 0 ? `${stats.selfLeasedPct.toFixed(0)}%` : '—'}
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            Geografisk fordeling
          </h2>
          <span className="text-xs text-stone-400">
            Filtre nedenfor gjelder både kart og liste
          </span>
        </div>
        <PropertiesMap filter={mapFilter} />
      </Card>

      <Card>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Type: Alle</option>
            {propertyTypes.map(type => (
              <option key={type} value={type}>
                {PROPERTY_TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </select>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Selskap: Alle</option>
            {companies.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={selfLeasedFilter}
            onChange={(e) => setSelfLeasedFilter(e.target.value as 'alle' | 'ja' | 'nei')}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Selvleie: Alle</option>
            <option value="ja">Kun selvleie</option>
            <option value="nei">Kun ekstern</option>
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen eiendommer matcher filteret" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Selskap</th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Type</th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Adresse</th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Kommune</th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">Areal</th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Leietaker</th>
                  <th className="py-2 text-xs uppercase tracking-wider text-stone-400 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50/60">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/selskap/${p.company.id}`}
                        className="font-medium text-stone-800 hover:text-emerald-700"
                      >
                        {p.company.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded border ${
                          PROPERTY_TYPE_STYLES[p.propertyType] ?? PROPERTY_TYPE_STYLES.office
                        }`}
                      >
                        {PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-stone-600">{p.address ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-stone-600">
                      {p.municipality ?? '—'}
                      {p.county ? <span className="text-stone-400 ml-1">({p.county})</span> : null}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-700">
                      {formatSqm(p.sqMeters)}
                    </td>
                    <td className="py-2.5 pr-4">
                      {p.tenantCompany ? (
                        <Link
                          href={`/selskap/${p.tenantCompany.id}`}
                          className="text-rose-700 hover:underline"
                        >
                          {p.tenantCompany.name}
                        </Link>
                      ) : (
                        <span className="text-stone-400">—</span>
                      )}
                    </td>
                    <td className="py-2.5">
                      {p.selfLeased ? (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          Selvleie
                        </span>
                      ) : (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                          Ekstern
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}

const KJEDE_ORDER: PropertyCompanyKjede[] = ['norgesgruppen', 'reitan', 'coop']

function PropertyCompaniesSection({ rows }: { rows: PropertyCompanyRow[] }) {
  const summaries = useMemo(() => {
    return KJEDE_ORDER.map(kjede => {
      const items = rows.filter(r => r.kjede === kjede)
      const totalAssetsNok = items.reduce((s, r) => s + r.totalAssetsNok, 0)
      const equityNok = items.reduce((s, r) => s + r.equityNok, 0)
      const equityPct = totalAssetsNok > 0 ? (equityNok / totalAssetsNok) * 100 : 0
      return { kjede, count: items.length, totalAssetsNok, equityPct }
    })
  }, [rows])

  const grouped = useMemo(() => {
    return KJEDE_ORDER.map(kjede => ({
      kjede,
      items: rows
        .filter(r => r.kjede === kjede)
        .sort((a, b) => b.totalAssetsNok - a.totalAssetsNok),
    }))
  }, [rows])

  const grandTotal = rows.reduce((s, r) => s + r.totalAssetsNok, 0)

  return (
    <section className="space-y-4 border-t border-stone-200 pt-8">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
          Konsernenes eiendomsselskaper
        </h2>
        <p className="text-sm text-stone-500 max-w-3xl">
          Separate juridiske enheter som eier butikklokalene og leier dem tilbake til driftsselskapene.
          Høy egenkapitalandel og lav driftsinntekt på selskapsnivå er kjennetegn på rene eiervehikler;
          regionale selskaper har leiestrømmer fra dagligvaredrift.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaries.map(s => (
          <div key={s.kjede} className="rounded-lg border border-stone-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${KJEDE_ACCENT[s.kjede]}`} />
              <p className="text-xs font-semibold text-stone-700">
                {PROPERTY_COMPANY_KJEDE_LABELS[s.kjede]}
              </p>
              <span className="text-xs text-stone-400 ml-auto">{s.count} selskaper</span>
            </div>
            <p className="text-2xl font-bold text-stone-900 tabular-nums">
              {formatMrd(s.totalAssetsNok)}
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              i sum eiendeler · EK-andel {s.equityPct.toFixed(0)}%
            </p>
          </div>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Selskap</th>
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">Type</th>
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">Sum eiendeler</th>
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">EK-andel</th>
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">Driftsinntekter</th>
                <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">Driftsresultat</th>
                <th className="py-2 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">År</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map(group => (
                <Fragment key={group.kjede}>
                  <tr className="bg-stone-50/60">
                    <td colSpan={7} className="py-1.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${KJEDE_ACCENT[group.kjede]}`} />
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-600">
                          {PROPERTY_COMPANY_KJEDE_LABELS[group.kjede]}
                        </span>
                      </div>
                    </td>
                  </tr>
                  {group.items.map(p => {
                    const ekPct = equityRatioPct(p)
                    const isOperatingLoss = p.operatingResultNok < 0
                    return (
                      <tr key={p.orgNr} className="border-b border-stone-100 hover:bg-stone-50/60">
                        <td className="py-2 pr-4">
                          {p.companyId ? (
                            <Link
                              href={`/selskap/${p.companyId}`}
                              className="font-medium text-stone-800 hover:text-emerald-700"
                            >
                              {p.name}
                            </Link>
                          ) : (
                            <span className="font-medium text-stone-700">{p.name}</span>
                          )}
                          <div className="text-[10px] text-stone-400 tabular-nums">{p.orgNr}</div>
                        </td>
                        <td className="py-2 pr-4">
                          <span className="text-[10px] px-1.5 py-0.5 rounded border bg-stone-50 text-stone-600 border-stone-200">
                            {PROPERTY_COMPANY_TYPE_LABELS[p.type]}
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums text-stone-800 font-medium">
                          {formatMrd(p.totalAssetsNok)}
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                          {ekPct.toFixed(0)}%
                        </td>
                        <td className="py-2 pr-4 text-right tabular-nums text-stone-700">
                          {formatMnok(p.revenueNok)}
                        </td>
                        <td className={`py-2 pr-4 text-right tabular-nums ${isOperatingLoss ? 'text-rose-700' : 'text-stone-700'}`}>
                          {p.operatingResultNok === 0 ? '—' : formatMnok(p.operatingResultNok)}
                        </td>
                        <td className="py-2 text-right text-stone-500 tabular-nums">{p.year}</td>
                      </tr>
                    )
                  })}
                </Fragment>
              ))}
              <tr className="border-t-2 border-stone-300">
                <td className="py-2 pr-4 text-xs font-semibold uppercase tracking-wider text-stone-600">
                  Sum
                </td>
                <td className="py-2 pr-4 text-xs text-stone-400">{rows.length} selskaper</td>
                <td className="py-2 pr-4 text-right tabular-nums font-semibold text-stone-900">
                  {formatMrd(grandTotal)}
                </td>
                <td colSpan={4} />
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-[11px] text-stone-400 leading-relaxed">
        Coop-utvalget er ikke uttømmende — ytterligere eiendom kan ligge i lokale samvirkelag.
        Reitan Eiendom AS rapporterer svært lave driftsinntekter på selskapsnivå; de faktiske leiestrømmene
        bokføres trolig i underliggende datterselskaper. Markedsverdier er typisk 2-5x høyere enn bokført verdi.
      </p>
    </section>
  )
}
