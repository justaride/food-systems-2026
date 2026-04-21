'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

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

export function EiendommerContent({ properties }: { properties: PropertyRow[] }) {
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

  const filtered = properties.filter(p => {
    if (typeFilter !== 'alle' && p.propertyType !== typeFilter) return false
    if (companyFilter !== 'alle' && p.company.id !== companyFilter) return false
    if (selfLeasedFilter === 'ja' && !p.selfLeased) return false
    if (selfLeasedFilter === 'nei' && p.selfLeased) return false
    return true
  })

  const stats = useMemo(() => {
    const total = filtered.length
    const totalSqm = filtered.reduce((acc, p) => acc + (p.sqMeters ?? 0), 0)
    const selfLeasedCount = filtered.filter(p => p.selfLeased).length
    const selfLeasedPct = total > 0 ? (selfLeasedCount / total) * 100 : 0
    return { total, totalSqm, selfLeasedCount, selfLeasedPct }
  }, [filtered])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Eiendommer</h1>
          <p className="text-stone-500 mt-2 max-w-3xl">
            Oversikt over lagre, butikklokaler, kontorer og produksjonsanlegg som er eid eller leid
            ut av kartlagte selskaper. Flagger selvleie (eid og utleid internt i konsernet) som
            indikator på konserninterne transaksjoner.
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
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
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
