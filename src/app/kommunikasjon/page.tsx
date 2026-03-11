'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { communications } from '@/lib/data/communications'

const typeFilters = [
  { label: 'Alle', value: 'alle' },
  { label: 'E-post', value: 'epost' },
  { label: 'Melding', value: 'melding' },
  { label: 'Brev', value: 'brev' },
]

export default function KommunikasjonPage() {
  const [typeFilter, setTypeFilter] = useState('alle')

  const filtered = communications.filter(c =>
    typeFilter === 'alle' || c.type === typeFilter
  )

  const formatTo = (to: string | string[]): string =>
    Array.isArray(to) ? to.join(', ') : to

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Kommunikasjon</h1>
        <p className="text-sm text-stone-400 mt-1">E-post og korrespondanse</p>
      </div>

      <FilterChips items={typeFilters} defaultValue="alle" onChange={setTypeFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Kommunikasjon legges til etterhvert som korrespondanse skjer" />
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id} className="!p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-stone-800">{item.title}</h3>
                <StatusBadge status={item.type} />
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{item.summary}</p>
              <div className="flex gap-3 mt-2.5 text-xs text-stone-400">
                <span>Fra: {item.from}</span>
                <span>·</span>
                <span>Til: {formatTo(item.to)}</span>
                <span>·</span>
                <span>{item.date}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
