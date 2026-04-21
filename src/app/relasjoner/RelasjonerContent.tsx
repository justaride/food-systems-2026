'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type RelationshipRow = {
  id: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: number | null
  source: string | null
  fromCompany: {
    id: string
    name: string
  }
  toCompany: {
    id: string
    name: string
  }
  selfDealing: boolean
}

type StatsByType = {
  type: string
  count: number
  totalValue: number
}

type Props = {
  relationships: RelationshipRow[]
  stats: {
    total: number
    totalValue: number
    byType: StatsByType[]
    selfDealingCount: number
  }
}

const TYPE_LABELS: Record<string, string> = {
  supplier: 'Leverandør',
  buyer: 'Kjøper',
  distributor: 'Distributør',
  franchisor: 'Franchise',
  'self-dealing': 'Selvhandel',
  'joint-venture': 'Joint venture',
}

const TYPE_STYLES: Record<string, string> = {
  supplier: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  buyer: 'bg-blue-50 text-blue-700 border-blue-200',
  distributor: 'bg-purple-50 text-purple-700 border-purple-200',
  franchisor: 'bg-amber-50 text-amber-700 border-amber-200',
  'self-dealing': 'bg-rose-50 text-rose-700 border-rose-200',
  'joint-venture': 'bg-orange-50 text-orange-700 border-orange-200',
}

function formatNOK(value: number | null) {
  if (value == null || value === 0) return '—'
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} mrd NOK`
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} MNOK`
  return `${Math.round(value).toLocaleString('no')} NOK`
}

export function RelasjonerContent({ relationships, stats }: Props) {
  const [typeFilter, setTypeFilter] = useState('alle')
  const [search, setSearch] = useState('')

  const relationshipTypes = useMemo(
    () => Array.from(new Set(relationships.map(r => r.relationshipType))).sort(),
    [relationships]
  )

  const filtered = relationships.filter(r => {
    if (typeFilter !== 'alle' && r.relationshipType !== typeFilter) return false
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      const match =
        r.fromCompany.name.toLowerCase().includes(q) ||
        r.toCompany.name.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q) ||
        (r.sector ?? '').toLowerCase().includes(q)
      if (!match) return false
    }
    return true
  })

  const maxCount = Math.max(1, ...stats.byType.map(t => t.count))

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">
            Forretningsrelasjoner
          </h1>
          <p className="text-stone-500 mt-2 max-w-3xl">
            Leverandør- og kjøpsforhold, distribusjonsavtaler, joint ventures og
            konserninterne transaksjoner. Selvhandel (selskaper som handler med
            egne datterselskaper eller søsterselskaper) flagges som indikator på
            intern markedsmakt.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/forsyningskjede"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Se forsyningskjede
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Relasjoner</div>
          <div className="text-2xl font-bold text-stone-900">
            {stats.total.toLocaleString('no')}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Typer</div>
          <div className="text-2xl font-bold text-stone-900">{stats.byType.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Selvhandel</div>
          <div className="text-2xl font-bold text-stone-900">{stats.selfDealingCount}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Estimert verdi</div>
          <div className="text-2xl font-bold text-stone-900">{formatNOK(stats.totalValue)}</div>
        </div>
      </div>

      {stats.byType.length > 0 && (
        <Card title="Fordeling per type">
          <div className="space-y-2">
            {stats.byType.map(row => (
              <div key={row.type} className="flex items-center gap-3 text-sm">
                <span className="w-32 shrink-0 text-stone-600">
                  {TYPE_LABELS[row.type] ?? row.type}
                </span>
                <div className="flex-1 bg-stone-100 rounded h-4 overflow-hidden">
                  <div
                    className="h-full bg-emerald-400"
                    style={{ width: `${(row.count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right tabular-nums text-stone-700 font-medium">
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Type: Alle</option>
            {relationshipTypes.map(type => (
              <option key={type} value={type}>
                {TYPE_LABELS[type] ?? type}
              </option>
            ))}
          </select>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Søk selskap, sektor, beskrivelse..."
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 min-w-[220px]"
          />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen relasjoner matcher filteret" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Fra
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Type
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Til
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Sektor
                  </th>
                  <th className="py-2 pr-4 text-xs uppercase tracking-wider text-stone-400 font-medium text-right">
                    Estimert verdi
                  </th>
                  <th className="py-2 text-xs uppercase tracking-wider text-stone-400 font-medium">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id} className="border-b border-stone-100 hover:bg-stone-50/60">
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/selskap/${r.fromCompany.id}`}
                        className="font-medium text-stone-800 hover:text-emerald-700"
                      >
                        {r.fromCompany.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded border ${
                          TYPE_STYLES[r.relationshipType] ?? TYPE_STYLES.supplier
                        }`}
                      >
                        {TYPE_LABELS[r.relationshipType] ?? r.relationshipType}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/selskap/${r.toCompany.id}`}
                        className="font-medium text-stone-800 hover:text-emerald-700"
                      >
                        {r.toCompany.name}
                      </Link>
                    </td>
                    <td className="py-2.5 pr-4 text-stone-600">{r.sector ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-stone-700">
                      {formatNOK(r.estimatedValue)}
                    </td>
                    <td className="py-2.5">
                      {r.selfDealing ? (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          Selvhandel
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
