'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ColumnHelp } from '@/components/ui/ColumnHelp'
import { DataReadinessNotice } from '@/components/ui/DataReadinessNotice'
import { EmptyState } from '@/components/ui/EmptyState'
import { Glossary } from '@/components/ui/Glossary'
import { MissingValue } from '@/components/ui/MissingValue'
import { LIST_SURFACE_GLOSSARY_TERMS } from '@/lib/glossary/terms'
import type { ProducerListRow } from '@/lib/queries/producers'

function formatTableCount(count: number | null): string {
  return count == null ? 'ukjent antall rader' : `${count.toLocaleString('no')} rader`
}

export function ProdusenterContent({
  producers,
  total,
  landbruksregisterCompanyCount,
}: {
  producers: ProducerListRow[]
  total: number
  landbruksregisterCompanyCount: number | null
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
  const landbruksregisterCompanyIsNarrow =
    landbruksregisterCompanyCount == null || landbruksregisterCompanyCount < 100

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
        <Link href="/selskap" className="underline text-emerald-700 hover:text-emerald-800">
          /selskap
        </Link>
        .
      </div>

      {landbruksregisterCompanyIsNarrow && (
        <DataReadinessNotice title="Smal Company-kobling mot Landbruksregisteret">
          <p>
            Company-rader merket Landbruksregisteret: {formatTableCount(landbruksregisterCompanyCount)}.
            Denne flaten bruker Producer/Subsidy/DeliveryVolume som registergrunnlag; Company-importen
            er dokumentert smal og skal ikke leses som full selskapskartlegging av landbruksregisteret.
          </p>
        </DataReadinessNotice>
      )}

      <Glossary
        category="kolonner"
        terms={LIST_SURFACE_GLOSSARY_TERMS.produsenter}
        title="Kolonneforklaringer"
      />

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter navn eller orgnr..."
            aria-label="Søk etter navn eller orgnr"
            className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <span className="text-xs text-stone-400">
            {filtered.length} treff · søket filtrerer de {producers.length} viste av{' '}
            {total.toLocaleString('no')}
          </span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          message={
            query.trim() === ''
              ? 'Ingen produsenter i registeret'
              : 'Ingen produsenter matcher søket'
          }
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-left text-[11px] uppercase tracking-wider text-stone-400">
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    <ColumnHelp term="Produsentnavn" label="Navn" />
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    <ColumnHelp term="Organisasjonsnummer" label="Orgnr" />
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium">
                    <ColumnHelp term="Kommune" />
                  </th>
                  <th scope="col" className="pb-2 pr-4 font-medium text-right">
                    <ColumnHelp term="Tilskudd" align="right" />
                  </th>
                  <th scope="col" className="pb-2 font-medium text-right">
                    <ColumnHelp term="Leveranser" align="right" />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-stone-50">
                    <td className="py-2 pr-4 text-stone-900 font-medium">{p.name}</td>
                    <td className="py-2 pr-4 font-mono text-xs text-stone-500">{p.orgNr}</td>
                    <td className="py-2 pr-4 text-stone-600">
                      {p.municipality ?? <MissingValue reason="not_collected" />}
                    </td>
                    <td className="py-2 pr-4 text-right text-stone-600">
                      {p.subsidyCount.toLocaleString('no')}
                    </td>
                    <td className="py-2 text-right text-stone-600">
                      {p.deliveryCount.toLocaleString('no')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {producers.length < total && query.trim() === '' && (
        <p className="text-xs text-stone-400 text-center">
          Viser de første {producers.length.toLocaleString('no')} av{' '}
          {total.toLocaleString('no')} produsenter i registeret.
        </p>
      )}
    </div>
  )
}
