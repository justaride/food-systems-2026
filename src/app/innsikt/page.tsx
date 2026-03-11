'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { SourceChip } from '@/components/ui/SourceChip'
import { insights } from '@/lib/data/insights'
import { SelfSufficiencyChart } from '@/components/charts/SelfSufficiencyChart'
import { MarginsChart } from '@/components/charts/MarginsChart'
import { MarketShareChart } from '@/components/charts/MarketShareChart'
import { LorenzCurveChart } from '@/components/charts/LorenzCurveChart'
import { ZipfDistributionChart } from '@/components/charts/ZipfDistributionChart'
import { FoodFlowSankey } from '@/components/charts/FoodFlowSankey'
import { ParentCompanyChart } from '@/components/charts/ParentCompanyChart'

const typeFilters = [
  { label: 'Alle', value: 'alle' },
  { label: 'Notat', value: 'notat' },
  { label: 'Kartlegging', value: 'kartlegging' },
  { label: 'Analyse', value: 'analyse' },
  { label: 'Funn', value: 'funn' },
  { label: 'Lenke', value: 'lenke' },
]

export default function InnsiktPage() {
  const [typeFilter, setTypeFilter] = useState('alle')

  const filtered = insights.filter(i =>
    typeFilter === 'alle' || i.type === typeFilter
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Innsikt</h1>
        <p className="text-sm text-stone-400 mt-1">Forskning, kartlegging og analyse</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelfSufficiencyChart />
        <MarginsChart />
        <MarketShareChart />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LorenzCurveChart />
        <ZipfDistributionChart />
        <ParentCompanyChart />
        <FoodFlowSankey />
      </div>

      <FilterChips items={typeFilters} defaultValue="alle" onChange={setTypeFilter} />

      {filtered.length === 0 ? (
        <EmptyState message="Ingen innsikt enna" />
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <Card key={item.id} className="!p-4">
              <div className="flex items-center gap-2 mb-1.5">
                <h3 className="text-sm font-semibold text-stone-800">{item.title}</h3>
                <StatusBadge status={item.type} />
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-stone-400">
                {item.sources?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.sources.map(s => (
                      <SourceChip key={s.label} source={s} />
                    ))}
                  </div>
                ) : (
                  <span>Kilde: {item.source}</span>
                )}
                {item.phase && (
                  <>
                    <span>·</span>
                    <span>Fase {item.phase.replace('fase-', '')}</span>
                  </>
                )}
                {item.tags?.map(tag => (
                  <span key={tag}>· {tag}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
