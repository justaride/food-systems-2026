'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart'
import { MarginTrendChart } from '@/components/charts/MarginTrendChart'
import { EmployeeTrendChart } from '@/components/charts/EmployeeTrendChart'
import type { CompanyWithFinancials } from '@/lib/queries/financials'

const COMPANY_COLORS = [
  '#e11d48', '#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2',
  '#c026d3', '#65a30d', '#dc2626', '#0d9488', '#d97706', '#4f46e5',
]

function getLatestRevenue(c: CompanyWithFinancials): number {
  for (let i = c.financials.length - 1; i >= 0; i--) {
    if (c.financials[i].revenueNok !== null) return c.financials[i].revenueNok!
  }
  return 0
}

function buildChartData(
  companies: CompanyWithFinancials[],
  field: 'revenueNok' | 'operatingMargin' | 'groupEmployees',
  transform?: (v: number) => number
): Record<string, number | null>[] {
  const yearSet = new Set<number>()
  for (const c of companies) {
    for (const f of c.financials) yearSet.add(f.year)
  }
  const years = [...yearSet].sort()

  return years.map(year => {
    const row: Record<string, number | null> = { year }
    for (const c of companies) {
      const rec = c.financials.find(f => f.year === year)
      const val = rec ? rec[field] : null
      row[c.name] = val !== null && val !== undefined
        ? (transform ? transform(val) : val)
        : null
    }
    return row
  })
}

export function OkonomiContent({ companies }: { companies: CompanyWithFinancials[] }) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const defaultSelected = useMemo(() => {
    const sorted = [...companies].sort((a, b) => getLatestRevenue(b) - getLatestRevenue(a))
    return new Set(sorted.slice(0, 5).map(c => c.id))
  }, [companies])

  const [selected, setSelected] = useState<Set<string>>(defaultSelected)

  const filteredCompanies = useMemo(() => {
    if (!deferredQuery.trim()) return companies
    const q = deferredQuery.toLowerCase()
    return companies.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.valueChainStage ?? '').toLowerCase().includes(q) ||
      (c.ownershipType ?? '').toLowerCase().includes(q)
    )
  }, [companies, deferredQuery])

  const selectedCompanies = companies.filter(c => selected.has(c.id))

  const companyMeta = selectedCompanies.map((c, i) => ({
    name: c.name,
    color: COMPANY_COLORS[i % COMPANY_COLORS.length],
  }))

  const revenueData = buildChartData(selectedCompanies, 'revenueNok', v => v / 1e9)
  const marginData = buildChartData(selectedCompanies, 'operatingMargin')
  const employeeData = buildChartData(selectedCompanies, 'groupEmployees')

  const totalRecords = companies.reduce((sum, c) => sum + c.financials.length, 0)
  const allYears = companies.flatMap(c => c.financials.map(f => f.year))
  const minYear = allYears.length > 0 ? Math.min(...allYears) : 0
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 0
  const latestTotalRevenue = companies.reduce((sum, c) => sum + getLatestRevenue(c), 0)

  function toggleCompany(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(new Set(filteredCompanies.map(c => c.id)))
  }

  function selectNone() {
    setSelected(new Set())
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Finansielle trender</h1>
        <p className="text-sm text-stone-500 mt-1">Omsetning, marginer og ansatte over tid</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Selskaper</div>
          <div className="text-2xl font-bold text-stone-900">{companies.length}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Datapunkter</div>
          <div className="text-2xl font-bold text-stone-900">{totalRecords}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Tidsrom</div>
          <div className="text-2xl font-bold text-stone-900">
            {minYear > 0 ? `${minYear}–${maxYear}` : '—'}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Samlet omsetning</div>
          <div className="text-2xl font-bold text-stone-900">
            {(latestTotalRevenue / 1e9).toFixed(0)} mrd
          </div>
        </div>
      </div>

      <Card title="Velg selskaper">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Sok etter selskap..."
            className="flex-1 px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            onClick={selectAll}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          >
            Alle
          </button>
          <button
            onClick={selectNone}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
          >
            Ingen
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {filteredCompanies.map(c => {
            const isSelected = selected.has(c.id)
            const idx = selectedCompanies.findIndex(s => s.id === c.id)
            const color = idx >= 0 ? COMPANY_COLORS[idx % COMPANY_COLORS.length] : '#d6d3d1'
            return (
              <label
                key={c.id}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-stone-300 text-stone-800'
                    : 'bg-stone-50 border-stone-200 text-stone-500'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCompany(c.id)}
                  className="sr-only"
                />
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="truncate">{c.name}</span>
              </label>
            )
          })}
        </div>
      </Card>

      {selectedCompanies.length === 0 ? (
        <EmptyState message="Velg minst ett selskap for a vise grafer" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueTrendChart data={revenueData} companies={companyMeta} />
          <MarginTrendChart data={marginData} companies={companyMeta} />
          <div className="lg:col-span-2">
            <EmployeeTrendChart data={employeeData} companies={companyMeta} />
          </div>
        </div>
      )}
    </div>
  )
}
