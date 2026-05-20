'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { ProducerListRow } from '@/lib/queries/producers'

export function ProdusenterContent({
  producers,
  total,
}: {
  producers: ProducerListRow[]
  total: number
}) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    if (!deferredQuery.trim()) return producers
    const q = deferredQuery.toLowerCase()
    return producers.filter(
      p => p.name.toLowerCase().includes(q) || p.orgNr.includes(q)
    )
  }, [producers, deferredQuery])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Produsentregister</h1>
        <p className="text-sm text-stone-500 mt-1">
          {total.toLocaleString('no')} produsenter i registeret
        </p>
      </div>

      <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
        <span className="font-medium text-stone-700">Rådata — ikke det samme som selskapsoversikten.</span>{' '}
        Dette er det rå landbruksregisteret: jordbruksforetak og enkeltpersonforetak fra Landbruksdirektoratet,
        hentet fra tilskuddsregisteret og leverandørregisteret. Disse produsentene er{' '}
        <span className="font-medium">ikke kartlagte selskaper</span> — for kuraterte virksomheter med regnskap,
        styre og eierskapsstruktur, se{' '}
        <a href="/selskap" className="underline text-emerald-700 hover:text-emerald-800">
          /selskap
        </a>
        .
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter navn eller orgnr..."
            className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-xs text-stone-400">
            {filtered.length} treff · søket filtrerer de {producers.length} viste av{' '}
            {total.toLocaleString('no')}
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen produsenter matcher søket" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-wider text-stone-400">
                  <th className="pb-2 pr-4 font-medium">Navn</th>
                  <th className="pb-2 pr-4 font-medium">Orgnr</th>
                  <th className="pb-2 pr-4 font-medium">Kommune</th>
                  <th className="pb-2 pr-4 font-medium text-right">Tilskudd</th>
                  <th className="pb-2 font-medium text-right">Leveranser</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-2 pr-4 text-stone-900 font-medium">{p.name}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-stone-500">{p.orgNr}</td>
                    <td className="py-2 pr-4 text-stone-600">{p.municipality ?? '—'}</td>
                    <td className="py-2 pr-4 text-right text-stone-600">
                      {p.subsidyCount > 0 ? p.subsidyCount.toLocaleString('no') : '—'}
                    </td>
                    <td className="py-2 text-right text-stone-600">
                      {p.deliveryCount > 0 ? p.deliveryCount.toLocaleString('no') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {producers.length < total && (
        <p className="text-xs text-stone-400 text-center">
          Viser de første {producers.length.toLocaleString('no')} av{' '}
          {total.toLocaleString('no')} produsenter i registeret.
        </p>
      )}
    </div>
  )
}
