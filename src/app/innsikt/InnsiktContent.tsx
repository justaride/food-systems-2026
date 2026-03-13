'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { SourceChip } from '@/components/ui/SourceChip'
import { SelfSufficiencyChart } from '@/components/charts/SelfSufficiencyChart'
import { MarginsChart } from '@/components/charts/MarginsChart'
import { MarketShareChart } from '@/components/charts/MarketShareChart'
import { LorenzCurveChart } from '@/components/charts/LorenzCurveChart'
import { ZipfDistributionChart } from '@/components/charts/ZipfDistributionChart'
import { FoodFlowSankey } from '@/components/charts/FoodFlowSankey'
import { ParentCompanyChart } from '@/components/charts/ParentCompanyChart'
import { COUNTRY_LIST, type CountryCode } from '@/lib/config/countries'

type InsightRow = {
  id: string
  title: string
  description: string
  insightType: string
  source: string
  phaseId: string | null
  tags: string[]
  url: string | null
  date: string
  sourceRefs: Array<{
    id: string
    label: string
    url: string | null
    note: string | null
    sourceDocId: string | null
  }>
}

const typeFilters = [
  { label: 'Alle', value: 'alle' },
  { label: 'Notat', value: 'notat' },
  { label: 'Kartlegging', value: 'kartlegging' },
  { label: 'Analyse', value: 'analyse' },
  { label: 'Funn', value: 'funn' },
  { label: 'Lenke', value: 'lenke' },
]

export function InnsiktContent({ insights }: { insights: InsightRow[] }) {
  const [typeFilter, setTypeFilter] = useState('alle')
  const [country, setCountry] = useState<CountryCode>('no')

  const filtered = insights.filter(i =>
    typeFilter === 'alle' || i.insightType === typeFilter
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Innsikt</h1>
          <p className="text-sm text-stone-400 mt-1">Forskning, kartlegging og analyse</p>
        </div>
        <div className="flex gap-1 bg-white rounded-lg border border-stone-200 p-1">
          {COUNTRY_LIST.map(({ code, name, flag }) => (
            <button
              key={code}
              onClick={() => setCountry(code)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-sm transition-colors ${
                code === country
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
              }`}
              title={name}
            >
              <span>{flag}</span>
              <span className="hidden md:inline">{name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelfSufficiencyChart country={country} />
        <MarginsChart country={country} />
        <MarketShareChart country={country} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <LorenzCurveChart country={country} />
        <ZipfDistributionChart country={country} />
        <ParentCompanyChart country={country} />
        <FoodFlowSankey country={country} />
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
                <StatusBadge status={item.insightType} />
              </div>
              <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-stone-400">
                {item.sourceRefs?.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {item.sourceRefs.map(s => (
                      <SourceChip key={s.label} source={{ label: s.label, url: s.url ?? undefined, note: s.note ?? undefined }} />
                    ))}
                  </div>
                ) : (
                  <span>Kilde: {item.source}</span>
                )}
                {item.phaseId && (
                  <>
                    <span>·</span>
                    <span>Fase {item.phaseId.replace('fase-', '')}</span>
                  </>
                )}
                {item.tags.map(tag => (
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
