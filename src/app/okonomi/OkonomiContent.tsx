'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { RevenueTrendChart } from '@/components/charts/RevenueTrendChart'
import { MarginTrendChart } from '@/components/charts/MarginTrendChart'
import { EmployeeTrendChart } from '@/components/charts/EmployeeTrendChart'
import { EbitdaTrendChart } from '@/components/charts/EbitdaTrendChart'
import { EquityRatioTrendChart } from '@/components/charts/EquityRatioTrendChart'
import type { CompanyWithFinancials } from '@/lib/queries/financials'
import type { SubsidyAggregates } from '@/lib/queries/subsidies'

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
  field: 'revenueNok' | 'operatingMargin' | 'ebitda' | 'equityRatio' | 'groupEmployees',
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

export function OkonomiContent({
  companies,
  subsidyAggregates,
}: {
  companies: CompanyWithFinancials[]
  subsidyAggregates: SubsidyAggregates
}) {
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
  const ebitdaData = buildChartData(selectedCompanies, 'ebitda', v => v / 1e9)
  const equityRatioData = buildChartData(selectedCompanies, 'equityRatio')
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
          <EbitdaTrendChart data={ebitdaData} companies={companyMeta} />
          <EquityRatioTrendChart data={equityRatioData} companies={companyMeta} />
          <div className="lg:col-span-2">
            <EmployeeTrendChart data={employeeData} companies={companyMeta} />
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-stone-900">Tilskudd</h2>
        <p className="text-sm text-stone-500 mt-1">Aggregerte offentlige tilskudd per type og mottaker</p>
      </div>

      {subsidyAggregates.totalCount === 0 ? (
        <EmptyState message="Ingen tilskuddsdata tilgjengelig" />
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-stone-400">Tilskuddstyper</div>
              <div className="text-2xl font-bold text-stone-900">{subsidyAggregates.byType.length}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-stone-400">Tilskudd registrert</div>
              <div className="text-2xl font-bold text-stone-900">{subsidyAggregates.totalCount}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-stone-400">Mottakere (topp 10)</div>
              <div className="text-2xl font-bold text-stone-900">{subsidyAggregates.topRecipients.length}</div>
            </div>
            <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
              <div className="text-xs uppercase tracking-wider text-stone-400">Samlet belop</div>
              <div className="text-2xl font-bold text-stone-900">
                {subsidyAggregates.totalAmountNok > 0
                  ? `${(subsidyAggregates.totalAmountNok / 1e6).toFixed(0)} MNOK`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Tilskudd per type">
              <p className="text-xs text-stone-500 mb-3">Samlet belop fordelt pa tilskuddstype</p>
              <div className="space-y-2">
                {subsidyAggregates.byType.map(t => {
                  const maxAmount = subsidyAggregates.byType[0]?.totalAmountNok || 1
                  const pct = (t.totalAmountNok / maxAmount) * 100
                  return (
                    <div key={t.subsidyType}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-stone-700">{t.subsidyType}</span>
                        <span className="text-stone-500 tabular-nums">
                          {t.totalAmountNok > 0 ? `${(t.totalAmountNok / 1e6).toFixed(1)} MNOK` : '—'} ({t.count})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card title="Topp-mottakere">
              <p className="text-xs text-stone-500 mb-3">De 10 selskapene med hoyest samlet tilskuddsbelop</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200">
                      <th className="text-left py-2 text-stone-400">Selskap</th>
                      <th className="text-right py-2 text-stone-400">Antall</th>
                      <th className="text-right py-2 text-stone-400">Belop</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subsidyAggregates.topRecipients.map(r => (
                      <tr key={r.companyId} className="border-b border-stone-100">
                        <td className="py-2 text-stone-700">
                          <a href={`/selskap/${r.companyId}`} className="hover:underline">
                            {r.companyName}
                          </a>
                        </td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">{r.count}</td>
                        <td className="text-right py-2 text-stone-700 tabular-nums">
                          {r.totalAmountNok > 0 ? `${(r.totalAmountNok / 1e6).toFixed(1)} MNOK` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
