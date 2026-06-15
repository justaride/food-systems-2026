'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatAquacultureCapacity } from '@/lib/aquaculture-capacity'

type SiteRow = {
  id: string
  localityNumber: string
  siteName: string | null
  municipality: string | null
  municipalityNo: string | null
  county: string | null
  lat: number | null
  lng: number | null
  licenseStatus: string | null
  placement: string | null
  capacityTonnes: number | null
  capacityUnit: string | null
  species: string[]
  company: { id: string; name: string; orgNr: string; valueChainStage: string | null }
}

type AppRow = {
  id: string
  applicationNo: string
  applicantName: string | null
  applicantOrgNr: string
  applicationType: string | null
  title: string | null
  status: string | null
  result: string | null
  createdAt: string | null
  evaluationFinishedAt: string | null
  company: { id: string; name: string; orgNr: string } | null
}

type CompanyStat = {
  companyId: string
  siteCount: number
  capacityTonnes: number
}

type Props = {
  sites: SiteRow[]
  applications: AppRow[]
  totalSites: number
  totalCapacityTonnes: number
  totalApplications: number
  companyStats: CompanyStat[]
}

function formatStatusBadge(status: string | null) {
  if (!status) return { label: '—', className: 'bg-stone-100 text-stone-500 border-stone-200' }
  const s = status.toLowerCase()
  if (s.includes('aktiv') || s === 'active')
    return { label: 'Aktiv', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (s.includes('paus') || s.includes('inaktiv'))
    return { label: 'Pauset', className: 'bg-amber-50 text-amber-700 border-amber-200' }
  if (s.includes('revok') || s.includes('avviklet'))
    return { label: 'Avviklet', className: 'bg-rose-50 text-rose-700 border-rose-200' }
  return { label: status, className: 'bg-stone-100 text-stone-600 border-stone-200' }
}

function formatResultBadge(result: string | null) {
  if (!result) return { label: 'Pågår', className: 'bg-stone-100 text-stone-500 border-stone-200' }
  if (result === 'GRANTED')
    return { label: 'Innvilget', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  if (result === 'DENIED')
    return { label: 'Avslått', className: 'bg-rose-50 text-rose-700 border-rose-200' }
  if (result === 'FOLLOWS_REGULATIONS')
    return { label: 'Innenfor regelverk', className: 'bg-sky-50 text-sky-700 border-sky-200' }
  return { label: result, className: 'bg-stone-100 text-stone-600 border-stone-200' }
}

export function HavbrukContent({
  sites,
  applications,
  totalSites,
  totalCapacityTonnes,
  totalApplications,
  companyStats,
}: Props) {
  const [companyFilter, setCompanyFilter] = useState('alle')
  const [countyFilter, setCountyFilter] = useState('alle')
  const [tab, setTab] = useState<'sites' | 'applications' | 'operators'>('sites')

  const companies = useMemo(() => {
    const map = new Map<string, string>()
    for (const s of sites) map.set(s.company.id, s.company.name)
    return Array.from(map.entries()).sort((a, b) => a[1].localeCompare(b[1], 'no'))
  }, [sites])

  const counties = useMemo(
    () =>
      Array.from(new Set(sites.map(s => s.county).filter((c): c is string => Boolean(c)))).sort(
        (a, b) => a.localeCompare(b, 'no')
      ),
    [sites]
  )

  const filteredSites = useMemo(
    () =>
      sites.filter(s => {
        if (companyFilter !== 'alle' && s.company.id !== companyFilter) return false
        if (countyFilter !== 'alle' && s.county !== countyFilter) return false
        return true
      }),
    [sites, companyFilter, countyFilter]
  )

  const filteredApps = useMemo(
    () =>
      applications.filter(a => {
        if (companyFilter !== 'alle' && a.company?.id !== companyFilter) return false
        return true
      }),
    [applications, companyFilter]
  )

  const operatorRows = useMemo(() => {
    const byId = new Map(sites.map(s => [s.company.id, s.company]))
    return companyStats.map(st => ({
      ...st,
      company: byId.get(st.companyId),
    }))
  }, [companyStats, sites])

  const mowiSiteCount = companyStats
    .filter(c => operatorRows.find(r => r.companyId === c.companyId)?.company?.name.toLowerCase().includes('mowi'))
    .reduce((acc, c) => acc + c.siteCount, 0)

  const topOperator = operatorRows[0]

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Havbruk</h1>
          <p className="text-stone-500 mt-2 max-w-3xl">
            Havbrukslokaliteter og søknader fra Fiskeridirektoratets åpne API-er
            (NLOD). Inkluderer laks, ørret, rensefisk og skalldyr. Data oppdateres
            løpende når lokaliteter endrer status eller selskaper søker om nye
            konsesjoner.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/kart/no"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Se på kart
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Lokaliteter</div>
          <div className="text-2xl font-bold text-stone-900">
            {totalSites.toLocaleString('no')}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">MTB (maks tillatt biomasse)</div>
          <div className="text-2xl font-bold text-stone-900">
            {Math.round(totalCapacityTonnes / 1000).toLocaleString('no')}k tonn
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Operatører</div>
          <div className="text-2xl font-bold text-stone-900">{companyStats.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Søknader</div>
          <div className="text-2xl font-bold text-stone-900">
            {totalApplications.toLocaleString('no')}
          </div>
        </div>
      </div>

      {topOperator && (
        <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <strong>Konsentrasjon:</strong> {mowiSiteCount > 0 ? `Mowi-konsernet driver ${mowiSiteCount} lokaliteter av totalt ${totalSites} (${Math.round((mowiSiteCount / totalSites) * 100)}%).` : 'Topp-operatør har flest lokaliteter.'}{' '}
          Konsernstrukturen hos de 8 operative selskapene (Mowi, SalMar, Lerøy, Cermaq, Nova Sea m.fl.) gir få beslutningspunkter over norsk havbruk.
        </div>
      )}

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
            {(['sites', 'applications', 'operators'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium ${
                  tab === t
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {t === 'sites'
                  ? `Lokaliteter (${filteredSites.length})`
                  : t === 'applications'
                    ? `Søknader (${filteredApps.length})`
                    : `Operatører (${companyStats.length})`}
              </button>
            ))}
          </div>
          <select
            value={companyFilter}
            onChange={e => setCompanyFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Selskap: Alle</option>
            {companies.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          {tab === 'sites' && (
            <select
              value={countyFilter}
              onChange={e => setCountyFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
            >
              <option value="alle">Fylke: Alle</option>
              {counties.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
      </Card>

      {tab === 'sites' &&
        (filteredSites.length === 0 ? (
          <EmptyState message="Ingen lokaliteter matcher filteret" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left">
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Lokalitet
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Operatør
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Kommune
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                      Kapasitet
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Art
                    </th>
                    <th className="py-2 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSites.slice(0, 500).map(s => {
                    const badge = formatStatusBadge(s.licenseStatus)
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-stone-100 hover:bg-stone-50/60"
                      >
                        <td className="py-2.5 pr-4">
                          <div className="font-medium text-stone-800">
                            {s.siteName ?? `Lokalitet ${s.localityNumber}`}
                          </div>
                          <div className="text-[11px] text-stone-400">
                            #{s.localityNumber}
                            {s.placement ? ` · ${s.placement}` : ''}
                          </div>
                        </td>
                        <td className="py-2.5 pr-4">
                          <Link
                            href={`/selskap/${s.company.id}`}
                            className="text-stone-700 hover:text-emerald-700"
                          >
                            {s.company.name}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-stone-600">
                          {s.municipality ?? '—'}
                          {s.county ? (
                            <span className="text-stone-400 ml-1">({s.county})</span>
                          ) : null}
                        </td>
                        <td className="py-2.5 pr-4 text-right tabular-nums text-stone-700">
                          {formatAquacultureCapacity(s.capacityTonnes, s.capacityUnit)}
                        </td>
                        <td className="py-2.5 pr-4 text-stone-600 text-xs">
                          {s.species.length > 0 ? s.species.join(', ') : '—'}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredSites.length > 500 && (
                <div className="pt-3 text-xs text-stone-400">
                  Viser første 500 av {filteredSites.length} lokaliteter — bruk filter
                  for å snevre inn.
                </div>
              )}
            </div>
          </Card>
        ))}

      {tab === 'applications' &&
        (filteredApps.length === 0 ? (
          <EmptyState message="Ingen søknader matcher filteret" />
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-left">
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Søknad
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Søker
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Type
                    </th>
                    <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Opprettet
                    </th>
                    <th className="py-2 text-xs uppercase tracking-wider text-stone-400 font-medium">
                      Resultat
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.slice(0, 200).map(a => {
                    const badge = formatResultBadge(a.result)
                    return (
                      <tr
                        key={a.id}
                        className="border-b border-stone-100 hover:bg-stone-50/60"
                      >
                        <td className="py-2.5 pr-4">
                          <div className="font-medium text-stone-800">
                            {a.title ?? `Søknad ${a.applicationNo}`}
                          </div>
                          <div className="text-[11px] text-stone-400">#{a.applicationNo}</div>
                        </td>
                        <td className="py-2.5 pr-4">
                          {a.company ? (
                            <Link
                              href={`/selskap/${a.company.id}`}
                              className="text-stone-700 hover:text-emerald-700"
                            >
                              {a.company.name}
                            </Link>
                          ) : (
                            <span className="text-stone-600">{a.applicantName ?? a.applicantOrgNr}</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-stone-600 text-xs">
                          {a.applicationType ?? '—'}
                        </td>
                        <td className="py-2.5 pr-4 text-stone-600 text-xs">
                          {a.createdAt
                            ? new Date(a.createdAt).toLocaleDateString('no-NO')
                            : '—'}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`text-[11px] px-1.5 py-0.5 rounded border ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        ))}

      {tab === 'operators' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Operatør
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Lokaliteter
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    MTB (tonn)
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Andel lok.
                  </th>
                </tr>
              </thead>
              <tbody>
                {operatorRows.map(op => (
                  <tr
                    key={op.companyId}
                    className="border-b border-stone-100 hover:bg-stone-50/60"
                  >
                    <td className="py-2.5 pr-4">
                      {op.company ? (
                        <Link
                          href={`/selskap/${op.company.id}`}
                          className="font-medium text-stone-800 hover:text-emerald-700"
                        >
                          {op.company.name}
                        </Link>
                      ) : (
                        <span className="text-stone-600">Ukjent</span>
                      )}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-700">
                      {op.siteCount.toLocaleString('no')}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-700">
                      {formatAquacultureCapacity(op.capacityTonnes, 'TN')}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-500">
                      {totalSites > 0
                        ? `${((op.siteCount / totalSites) * 100).toFixed(1)}%`
                        : '—'}
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
