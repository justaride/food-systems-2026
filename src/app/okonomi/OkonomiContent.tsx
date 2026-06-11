'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { MissingValue, formatCoverageFootnote, sortNullableNumberDesc } from '@/components/ui/MissingValue'
import type {
  CompanyWithFinancials,
  SubsidySumByCompany,
  SubsidySumsByCompanyYear,
} from '@/lib/queries/financials'
import { formatAmountWithYear, formatYearRange, type FinancialYearLabel } from '@/lib/financial-year-labels'
import type { SubsidyAggregates } from '@/lib/queries/subsidies'

const RevenueTrendChart = dynamic(
  () => import('@/components/charts/RevenueTrendChart').then(mod => mod.RevenueTrendChart),
  { ssr: false, loading: () => <div className="h-[280px]" aria-hidden="true" /> }
)
const MarginTrendChart = dynamic(
  () => import('@/components/charts/MarginTrendChart').then(mod => mod.MarginTrendChart),
  { ssr: false, loading: () => <div className="h-[280px]" aria-hidden="true" /> }
)
const EmployeeTrendChart = dynamic(
  () => import('@/components/charts/EmployeeTrendChart').then(mod => mod.EmployeeTrendChart),
  { ssr: false, loading: () => <div className="h-[320px]" aria-hidden="true" /> }
)
const EbitdaTrendChart = dynamic(
  () => import('@/components/charts/EbitdaTrendChart').then(mod => mod.EbitdaTrendChart),
  { ssr: false, loading: () => <div className="h-[280px]" aria-hidden="true" /> }
)
const EquityRatioTrendChart = dynamic(
  () => import('@/components/charts/EquityRatioTrendChart').then(mod => mod.EquityRatioTrendChart),
  { ssr: false, loading: () => <div className="h-[280px]" aria-hidden="true" /> }
)

const COMPANY_COLORS = [
  '#e11d48', '#2563eb', '#16a34a', '#ea580c', '#7c3aed', '#0891b2',
  '#c026d3', '#65a30d', '#dc2626', '#0d9488', '#d97706', '#4f46e5',
]

const STAGE_LABELS: Record<string, string> = {
  production: 'Primærproduksjon',
  processing: 'Foredling',
  retail: 'Handel',
  seafood: 'Sjømat',
  inputs: 'Innsatsfaktorer',
  logistics: 'Logistikk',
  unknown: 'Uklassifisert',
}

type LatestFinancialPoint = {
  id: string
  name: string
  stage: string
  year: number
  revenueNok: number
  marginPct: number
  operatingResultNok: number | null
  subsidyNok: number
}

type StageFinancialSummary = {
  stage: string
  companyCount: number
  totalRevenueNok: number
  yearLabel: string | null
  weightedMarginPct: number | null
  totalSubsidyNok: number
  subsidySharePct: number | null
}

type ConcentrationMetric = 'revenue' | 'operatingResult'

type MatchedSubsidyMarginPoint = {
  id: string
  companyId: string
  name: string
  stage: string
  year: number
  revenueNok: number
  marginPct: number
  subsidyNok: number
  subsidySharePct: number
  subsidyCount: number
}

type MatchedSubsidyCoverage = {
  financialCompanyYearsWithRevenueMargin: number
  trackedSubsidyCompanyYears: number
  trackedCompaniesWithYearSubsidies: number
  allSubsidyCompanyYears: number
  allCompaniesWithYearSubsidies: number
}

function getLatestRevenue(c: CompanyWithFinancials): number | null {
  for (let i = c.financials.length - 1; i >= 0; i--) {
    if (c.financials[i].revenueNok !== null) return c.financials[i].revenueNok!
  }
  return null
}

function getLatestField(
  c: CompanyWithFinancials,
  field: 'operatingResult' | 'operatingMargin' | 'ebitda' | 'equityRatio' | 'groupEmployees'
): number | null {
  for (let i = c.financials.length - 1; i >= 0; i--) {
    const v = c.financials[i][field]
    if (v !== null && v !== undefined) return v
  }
  return null
}

function getLatestYear(c: CompanyWithFinancials): number | null {
  for (let i = c.financials.length - 1; i >= 0; i--) {
    if (c.financials[i].revenueNok !== null) return c.financials[i].year
  }
  return null
}

function getRevenueYoY(c: CompanyWithFinancials): number | null {
  const sortedDesc = [...c.financials]
    .filter(f => f.revenueNok !== null)
    .sort((a, b) => b.year - a.year)
  if (sortedDesc.length < 2) return null
  const [latest, prev] = sortedDesc
  if (!prev.revenueNok || prev.revenueNok === 0) return null
  return ((latest.revenueNok! - prev.revenueNok) / prev.revenueNok) * 100
}

function formatNokMillions(value: number): string {
  if (value === 0) return '0'
  const sign = value < 0 ? '-' : ''
  const absolute = Math.abs(value)
  if (absolute >= 1e9) return `${sign}${(absolute / 1e9).toFixed(1)} mrd`
  if (absolute >= 1e6) return `${sign}${(absolute / 1e6).toFixed(0)} MNOK`
  if (absolute < 1e3) return `${sign}${absolute.toLocaleString('nb-NO')} NOK`
  return `${sign}${(absolute / 1e3).toFixed(0)} TNOK`
}

function formatNokMillionsWithYear(value: number, yearLabel: FinancialYearLabel): string {
  return formatAmountWithYear(formatNokMillions(value), yearLabel)
}

function labelStage(stage: string | null | undefined) {
  return STAGE_LABELS[stage ?? 'unknown'] ?? stage ?? 'Uklassifisert'
}

function getLatestFinancialPoint(
  c: CompanyWithFinancials,
  subsidySumsByCompany: SubsidySumByCompany
): LatestFinancialPoint | null {
  const latest = [...c.financials]
    .filter(f => f.revenueNok !== null && f.operatingMargin !== null)
    .sort((a, b) => b.year - a.year)[0]
  if (!latest?.revenueNok || latest.operatingMargin === null) return null

  return {
    id: c.id,
    name: c.name,
    stage: c.valueChainStage ?? 'unknown',
    year: latest.year,
    revenueNok: latest.revenueNok,
    marginPct: latest.operatingMargin,
    operatingResultNok: latest.operatingResult ?? latest.revenueNok * (latest.operatingMargin / 100),
    subsidyNok: subsidySumsByCompany[c.id]?.totalAmountNok ?? 0,
  }
}

function getMatchedSubsidyMarginPoints(
  companies: CompanyWithFinancials[],
  subsidySumsByCompanyYear: SubsidySumsByCompanyYear
): MatchedSubsidyMarginPoint[] {
  const points: MatchedSubsidyMarginPoint[] = []

  for (const company of companies) {
    const subsidyByYear = subsidySumsByCompanyYear[company.id] ?? {}
    for (const financial of company.financials) {
      const subsidy = subsidyByYear[financial.year]
      if (
        !subsidy ||
        subsidy.totalAmountNok <= 0 ||
        !financial.revenueNok ||
        financial.revenueNok <= 0 ||
        financial.operatingMargin === null
      ) {
        continue
      }

      points.push({
        id: `${company.id}-${financial.year}`,
        companyId: company.id,
        name: company.name,
        stage: company.valueChainStage ?? 'unknown',
        year: financial.year,
        revenueNok: financial.revenueNok,
        marginPct: financial.operatingMargin,
        subsidyNok: subsidy.totalAmountNok,
        subsidySharePct: (subsidy.totalAmountNok / financial.revenueNok) * 100,
        subsidyCount: subsidy.count,
      })
    }
  }

  return points.sort((a, b) => b.subsidySharePct - a.subsidySharePct)
}

function buildChartData(
  companies: CompanyWithFinancials[],
  field: 'revenueNok' | 'operatingMargin' | 'ebitda' | 'equityRatio' | 'groupEmployees',
  companyLabelById: Map<string, string>,
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
      row[companyLabelById.get(c.id) ?? c.name] = val !== null && val !== undefined
        ? (transform ? transform(val) : val)
        : null
    }
    return row
  })
}

export function OkonomiContent({
  companies,
  subsidyAggregates,
  subsidySumsByCompany,
  subsidySumsByCompanyYear,
  totalCompanyCount,
}: {
  companies: CompanyWithFinancials[]
  subsidyAggregates: SubsidyAggregates
  subsidySumsByCompany: SubsidySumByCompany
  subsidySumsByCompanyYear: SubsidySumsByCompanyYear
  totalCompanyCount: number
}) {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [concentrationMetric, setConcentrationMetric] = useState<ConcentrationMetric>('revenue')

  const defaultSelected = useMemo(() => {
    const sorted = [...companies].sort((a, b) => sortNullableNumberDesc(getLatestRevenue(a), getLatestRevenue(b)))
    return new Set(sorted.slice(0, 5).map(c => c.id))
  }, [companies])

  const [selected, setSelected] = useState<Set<string>>(defaultSelected)

  const companyLabelById = useMemo(() => {
    const nameCounts = new Map<string, number>()
    for (const company of companies) {
      nameCounts.set(company.name, (nameCounts.get(company.name) ?? 0) + 1)
    }
    return new Map(
      companies.map(company => [
        company.id,
        (nameCounts.get(company.name) ?? 0) > 1
          ? `${company.name} (${company.orgNr})`
          : company.name,
      ])
    )
  }, [companies])

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
    name: companyLabelById.get(c.id) ?? c.name,
    color: COMPANY_COLORS[i % COMPANY_COLORS.length],
  }))

  const revenueData = buildChartData(selectedCompanies, 'revenueNok', companyLabelById, v => v / 1e9)
  const marginData = buildChartData(selectedCompanies, 'operatingMargin', companyLabelById)
  const ebitdaData = buildChartData(selectedCompanies, 'ebitda', companyLabelById, v => v / 1e9)
  const equityRatioData = buildChartData(selectedCompanies, 'equityRatio', companyLabelById)
  const employeeData = buildChartData(selectedCompanies, 'groupEmployees', companyLabelById)

  const totalRecords = companies.reduce((sum, c) => sum + c.financials.length, 0)
  const allYears = companies.flatMap(c => c.financials.map(f => f.year))
  const minYear = allYears.length > 0 ? Math.min(...allYears) : 0
  const maxYear = allYears.length > 0 ? Math.max(...allYears) : 0
  const companiesWithLatestRevenue = companies.filter(c => getLatestRevenue(c) != null).length
  const latestTotalRevenue = companies.reduce((sum, c) => sum + (getLatestRevenue(c) ?? 0), 0)
  const latestRevenueYearLabel = formatYearRange(
    companies.map(c => (getLatestRevenue(c) != null ? getLatestYear(c) : null))
  )
  const companiesWithSubsidy = companies.filter(
    c => (subsidySumsByCompany[c.id]?.totalAmountNok ?? 0) > 0
  ).length
  const totalSubsidySumForTrackedCompanies = companies.reduce(
    (sum, c) => sum + (subsidySumsByCompany[c.id]?.totalAmountNok ?? 0),
    0
  )
  const latestFinancialPoints = useMemo(
    () => companies
      .map(c => getLatestFinancialPoint(c, subsidySumsByCompany))
      .filter((point): point is LatestFinancialPoint => point !== null),
    [companies, subsidySumsByCompany]
  )
  const stageFinancialSummaries = useMemo(() => {
    const byStage = new Map<string, {
      companyIds: Set<string>
      revenue: number
      years: Set<number>
      weightedOperatingResult: number
      subsidy: number
    }>()

    for (const point of latestFinancialPoints) {
      const row = byStage.get(point.stage) ?? {
        companyIds: new Set<string>(),
        revenue: 0,
        years: new Set<number>(),
        weightedOperatingResult: 0,
        subsidy: 0,
      }
      row.companyIds.add(point.id)
      row.revenue += point.revenueNok
      row.years.add(point.year)
      row.weightedOperatingResult += point.revenueNok * (point.marginPct / 100)
      row.subsidy += point.subsidyNok
      byStage.set(point.stage, row)
    }

    return Array.from(byStage.entries())
      .map(([stage, row]): StageFinancialSummary => ({
        stage,
        companyCount: row.companyIds.size,
        totalRevenueNok: row.revenue,
        yearLabel: formatYearRange(row.years),
        weightedMarginPct: row.revenue > 0 ? (row.weightedOperatingResult / row.revenue) * 100 : null,
        totalSubsidyNok: row.subsidy,
        subsidySharePct: row.revenue > 0 ? (row.subsidy / row.revenue) * 100 : null,
      }))
      .sort((a, b) => b.totalRevenueNok - a.totalRevenueNok)
  }, [latestFinancialPoints])
  const matchedSubsidyMarginPoints = useMemo(
    () => getMatchedSubsidyMarginPoints(companies, subsidySumsByCompanyYear),
    [companies, subsidySumsByCompanyYear]
  )
  const matchedSubsidyCoverage = useMemo((): MatchedSubsidyCoverage => {
    const financialCompanyYearsWithRevenueMargin = companies.reduce(
      (sum, company) => sum + company.financials.filter(financial =>
        financial.revenueNok != null &&
        financial.revenueNok > 0 &&
        financial.operatingMargin != null
      ).length,
      0
    )
    const trackedSubsidyEntries = companies
      .map(company => subsidySumsByCompanyYear[company.id])
      .filter((years): years is Record<number, { totalAmountNok: number; count: number }> => years != null)
    const trackedSubsidyCompanyYears = trackedSubsidyEntries.reduce(
      (sum, years) => sum + Object.keys(years).length,
      0
    )
    const allSubsidyEntries = Object.values(subsidySumsByCompanyYear)

    return {
      financialCompanyYearsWithRevenueMargin,
      trackedSubsidyCompanyYears,
      trackedCompaniesWithYearSubsidies: trackedSubsidyEntries.length,
      allSubsidyCompanyYears: allSubsidyEntries.reduce(
        (sum, years) => sum + Object.keys(years).length,
        0
      ),
      allCompaniesWithYearSubsidies: allSubsidyEntries.length,
    }
  }, [companies, subsidySumsByCompanyYear])

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

      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>{companies.length} selskaper</strong> har regnskapsdata i databasen
        {totalCompanyCount > 0 ? (
          <>
            {' '}(av {totalCompanyCount.toLocaleString('nb-NO')} totalt registrert).{' '}
          </>
        ) : (
          '. '
        )}
        Se{' '}
        <Link href="/selskap" className="underline font-medium hover:text-amber-950">
          /selskap
        </Link>{' '}
        for full liste,{' '}
        <Link href="/selskap?all=1" className="underline font-medium hover:text-amber-950">
          /selskap?all=1
        </Link>{' '}
        for alle {totalCompanyCount > 0 ? totalCompanyCount.toLocaleString('nb-NO') : ''} foretak,
        eller{' '}
        <Link href="/eierskap" className="underline font-medium hover:text-amber-950">
          /eierskap
        </Link>{' '}
        for konsernstrukturer.
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
            {minYear > 0 ? `${minYear}–${maxYear}` : <MissingValue reason="not_collected" />}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Samlet omsetning</div>
          <div className="text-2xl font-bold text-stone-900">
            {formatNokMillionsWithYear(latestTotalRevenue, latestRevenueYearLabel)}
          </div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Med tilskudd</div>
          <div className="text-2xl font-bold text-stone-900">{companiesWithSubsidy}</div>
        </div>
        <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
          <div className="text-xs uppercase tracking-wider text-stone-400">Tilskudd (sum)</div>
          <div className="text-2xl font-bold text-stone-900">
            {totalSubsidySumForTrackedCompanies > 0
              ? `${(totalSubsidySumForTrackedCompanies / 1e6).toFixed(0)} MNOK`
              : '0'}
          </div>
        </div>
      </div>
      <p className="text-xs leading-5 text-stone-500">
        {formatCoverageFootnote(
          'Samlet omsetning',
          companiesWithLatestRevenue,
          totalCompanyCount > 0 ? totalCompanyCount : companies.length,
          'selskaper',
        )}{' '}
        Marginplot og verdikjedeledd bruker {latestFinancialPoints.length.toLocaleString('nb-NO')} selskaper med både omsetning og margin.
      </p>

      <Card title="Margin vs omsetning">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <MarginRevenueScatter points={latestFinancialPoints} />
          <div className="space-y-3 text-xs text-stone-500">
            <div>
              <p className="font-semibold uppercase tracking-wider text-stone-400">
                Siste regnskapsår per selskap
              </p>
              <p className="mt-1 leading-5">
                Hvert punkt bruker siste år der både omsetning og driftsmargin finnes.
                X-aksen er log-skalert omsetning; Y-aksen er driftsmargin.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
              <p className="font-medium text-stone-700">
                {latestFinancialPoints.length.toLocaleString('nb-NO')} selskaper med komplett punktgrunnlag
              </p>
              <p className="mt-1 leading-5">
                Tilskudd vises i punkt-tooltip og stage-oppsummering, men summeres over alle
                registrerte år. Andel av omsetning er derfor indikativ, ikke et regnskapsårsnøkkeltall.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-3">
          <h2 className="text-xl font-bold text-stone-900">Økonomi per verdikjedeledd</h2>
          <p className="text-sm text-stone-500 mt-1">
            Siste omsetning, vektet driftsmargin og akkumulert tilskudd for selskaper med komplett regnskapspunkt.
            {' '}
            {formatCoverageFootnote('Verdikjede-oppsummeringen', latestFinancialPoints.length, companies.length, 'regnskapsselskaper')}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stageFinancialSummaries.map(summary => (
            <StageFinancialTile key={summary.stage} summary={summary} />
          ))}
        </div>
      </div>

      <Card title="Konsentrasjon i omsetning/resultat">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <p className="max-w-3xl text-xs leading-5 text-stone-500">
            Treemapet viser de største selskapene etter valgt mål, pluss en samlet
            øvrig-kategori. Driftsresultat bruker siste registrerte driftsresultat når
            det finnes, ellers omsetning multiplisert med driftsmargin.
          </p>
          <div className="inline-flex w-fit rounded-lg border border-stone-200 bg-white p-0.5">
            {([
              ['revenue', 'Omsetning'],
              ['operatingResult', 'Resultat'],
            ] as const).map(([metric, label]) => (
              <button
                key={metric}
                onClick={() => setConcentrationMetric(metric)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                  concentrationMetric === metric
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <ConcentrationTreemap points={latestFinancialPoints} metric={concentrationMetric} />
      </Card>

      <Card title="Subsidieandel vs margin (årsmatchet)">
        <SubsidyMarginMatchedView
          points={matchedSubsidyMarginPoints}
          coverage={matchedSubsidyCoverage}
        />
      </Card>

      <Card title="Velg selskaper">
        <div className="flex items-center gap-3 mb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter selskap..."
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
        <EmptyState message="Velg minst ett selskap for å vise grafer" />
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

      <Card title="Selskaper med finansielle data">
        <p className="text-xs text-stone-500 mb-3">
          Siste tilgjengelige årstall per selskap. Klikk for å se full selskapsprofil. Tilskudd
          aggregerer alle år i databasen.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-2 font-medium text-stone-400">Selskap</th>
                <th className="text-left py-2 font-medium text-stone-400">Verdikjede</th>
                <th className="text-right py-2 font-medium text-stone-400">Siste år</th>
                <th className="text-right py-2 font-medium text-stone-400">Omsetning</th>
                <th className="text-right py-2 font-medium text-stone-400">YoY</th>
                <th className="text-right py-2 font-medium text-stone-400">Driftsmargin</th>
                <th className="text-right py-2 font-medium text-stone-400">Driftsresultat</th>
                <th className="text-right py-2 font-medium text-stone-400">Ansatte</th>
                <th className="text-right py-2 font-medium text-stone-400">Tilskudd (sum)</th>
                <th className="text-right py-2 font-medium text-stone-400">Detaljer</th>
              </tr>
            </thead>
            <tbody>
              {[...companies]
                .sort((a, b) => sortNullableNumberDesc(getLatestRevenue(a), getLatestRevenue(b)))
                .map(c => {
                  const rev = getLatestRevenue(c)
                  const year = getLatestYear(c)
                  const yoy = getRevenueYoY(c)
                  const margin = getLatestField(c, 'operatingMargin')
                  const opRes = getLatestField(c, 'operatingResult')
                  const emp = getLatestField(c, 'groupEmployees')
                  const sub = subsidySumsByCompany[c.id]
                  return (
                    <tr key={c.id} className="border-b border-stone-100 hover:bg-stone-50">
                      <td className="py-2 text-stone-700">
                        <Link href={`/selskap/${c.id}`} className="hover:underline font-medium">
                          {c.name}
                        </Link>
                      </td>
                      <td className="py-2 text-stone-500">
                        {c.valueChainStage ?? <MissingValue reason="not_collected" />}
                      </td>
                      <td className="text-right py-2 text-stone-500 tabular-nums">
                        {year ?? <MissingValue reason="not_reported" />}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {rev != null ? formatNokMillionsWithYear(rev, year) : <MissingValue reason="not_reported" />}
                      </td>
                      <td
                        className={`text-right py-2 tabular-nums ${
                          yoy === null
                            ? 'text-stone-400'
                            : yoy >= 0
                              ? 'text-emerald-700'
                              : 'text-rose-700'
                        }`}
                      >
                        {yoy === null ? <MissingValue reason="not_applicable" /> : `${yoy >= 0 ? '+' : ''}${yoy.toFixed(1)}%`}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {margin !== null ? `${margin.toFixed(1)}%` : <MissingValue reason="not_reported" />}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {opRes !== null ? formatNokMillionsWithYear(opRes, year) : <MissingValue reason="not_reported" />}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {emp !== null ? emp.toLocaleString('nb-NO') : <MissingValue reason="not_reported" />}
                      </td>
                      <td className="text-right py-2 text-stone-700 tabular-nums">
                        {sub && sub.totalAmountNok > 0 ? (
                          <span title={`${sub.count} tilskudd`}>
                            {formatNokMillions(sub.totalAmountNok)}
                          </span>
                        ) : (
                          <span className="text-stone-500">0</span>
                        )}
                      </td>
                      <td className="text-right py-2">
                        <Link
                          href={`/selskap/${c.id}`}
                          className="text-emerald-700 hover:underline font-medium"
                        >
                          profil &rarr;
                        </Link>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-stone-400 mt-3">
          YoY = prosentvis endring i omsetning mellom siste og nest siste år med registrert
          omsetning. Driftsresultat (Brønnøysund årsrapport). Tilskudd-sum
          henter fra Subsidy-tabellen og dekker samtlige registrerte år.{' '}
          {formatCoverageFootnote('Finanstabellen', companiesWithLatestRevenue, companies.length, 'regnskapsselskaper')}
        </p>
      </Card>

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
              <div className="text-xs uppercase tracking-wider text-stone-400">Samlet beløp</div>
              <div className="text-2xl font-bold text-stone-900">
                {subsidyAggregates.totalAmountNok > 0
                  ? `${(subsidyAggregates.totalAmountNok / 1e6).toFixed(0)} MNOK`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Tilskudd per type">
              <p className="text-xs text-stone-500 mb-3">Samlet beløp fordelt på tilskuddstype</p>
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
              <p className="text-xs text-stone-500 mb-3">De 10 selskapene med høyest samlet tilskuddsbeløp</p>
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
                      <tr key={r.producerId} className="border-b border-stone-100">
                        <td className="py-2 text-stone-700">
                          {r.producerName}
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

function MarginRevenueScatter({ points }: { points: LatestFinancialPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-400">
        Ingen selskaper har både omsetning og driftsmargin.
      </div>
    )
  }

  const width = 640
  const height = 320
  const padding = { top: 18, right: 22, bottom: 42, left: 54 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const revenues = points.map(point => point.revenueNok).filter(value => value > 0)
  const margins = points.map(point => point.marginPct)
  const minRevenue = Math.min(...revenues)
  const maxRevenue = Math.max(...revenues)
  const minMargin = Math.min(0, Math.floor(Math.min(...margins)))
  const maxMargin = Math.max(1, Math.ceil(Math.max(...margins)))
  const logMin = Math.log10(minRevenue)
  const logMax = Math.log10(maxRevenue)
  const revenueRange = logMax - logMin || 1
  const marginRange = maxMargin - minMargin || 1
  const stageColor = new Map<string, string>()
  const stagePalette = ['#047857', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#78716c']

  for (const point of points) {
    if (!stageColor.has(point.stage)) {
      stageColor.set(point.stage, stagePalette[stageColor.size % stagePalette.length])
    }
  }

  const xFor = (revenue: number) =>
    padding.left + ((Math.log10(revenue) - logMin) / revenueRange) * plotWidth
  const yFor = (margin: number) =>
    padding.top + (1 - ((margin - minMargin) / marginRange)) * plotHeight
  const zeroY = yFor(0)

  return (
    <div className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Scatterplot av driftsmargin mot omsetning"
        className="h-80 w-full overflow-visible"
      >
        <rect
          x={padding.left}
          y={padding.top}
          width={plotWidth}
          height={plotHeight}
          rx="6"
          fill="#fafaf9"
          stroke="#e7e5e4"
        />
        {minMargin < 0 && maxMargin > 0 && (
          <line
            x1={padding.left}
            x2={padding.left + plotWidth}
            y1={zeroY}
            y2={zeroY}
            stroke="#a8a29e"
            strokeDasharray="4 4"
          />
        )}
        {points.map(point => {
          const x = xFor(point.revenueNok)
          const y = yFor(point.marginPct)
          const radius = Math.max(4, Math.min(12, Math.sqrt(point.revenueNok / maxRevenue) * 14))
          const color = stageColor.get(point.stage) ?? '#78716c'

          return (
            <circle
              key={point.id}
              cx={x}
              cy={y}
              r={radius}
              fill={color}
              fillOpacity="0.72"
              stroke="#ffffff"
              strokeWidth="1.5"
            >
              <title>
                {`${point.name} (${point.year}): ${formatNokMillions(point.revenueNok)}, margin ${point.marginPct.toFixed(1)}%, tilskudd ${formatNokMillions(point.subsidyNok)}`}
              </title>
            </circle>
          )
        })}
        <line x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#a8a29e" />
        <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#a8a29e" />
        <text x={padding.left} y={height - 10} className="fill-stone-400 text-[11px]">
          Lavere omsetning
        </text>
        <text x={width - 132} y={height - 10} className="fill-stone-400 text-[11px]">
          Høyere omsetning
        </text>
        <text x="4" y={padding.top + 12} className="fill-stone-400 text-[11px]">
          {maxMargin.toFixed(0)}% margin
        </text>
        <text x="4" y={padding.top + plotHeight} className="fill-stone-400 text-[11px]">
          {minMargin.toFixed(0)}%
        </text>
      </svg>
      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-stone-500">
        {Array.from(stageColor.entries()).map(([stage, color]) => (
          <span key={stage} className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            {labelStage(stage)}
          </span>
        ))}
      </div>
    </div>
  )
}

function StageFinancialTile({ summary }: { summary: StageFinancialSummary }) {
  const subsidyShare = summary.subsidySharePct ?? 0
  const subsidyWidth = Math.max(2, Math.min(100, subsidyShare * 10))

  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{labelStage(summary.stage)}</p>
          <p className="text-xs text-stone-400">
            {summary.companyCount.toLocaleString('nb-NO')} selskaper
          </p>
        </div>
        <p className="text-right text-xs font-medium text-stone-500">
          {summary.weightedMarginPct === null ? <MissingValue reason="not_reported" /> : `${summary.weightedMarginPct.toFixed(1)}% margin`}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-stone-400">Omsetning</p>
          <p className="mt-1 font-semibold tabular-nums text-stone-900">
            {formatNokMillionsWithYear(summary.totalRevenueNok, summary.yearLabel)}
          </p>
        </div>
        <div>
          <p className="text-stone-400">Tilskudd</p>
          <p className="mt-1 font-semibold tabular-nums text-stone-900">
            {summary.totalSubsidyNok > 0 ? formatNokMillions(summary.totalSubsidyNok) : '0'}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] text-stone-400">
          <span>Tilskudd / siste omsetning</span>
          <span>{summary.subsidySharePct === null ? <MissingValue reason="not_applicable" /> : `${summary.subsidySharePct.toFixed(2)}%`}</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${subsidyWidth}%` }} />
        </div>
      </div>
    </div>
  )
}

type TreemapItem = {
  id: string
  label: string
  value: number
  year: number | null
  yearLabel: string | null
  stage: string
}

type TreemapRect = TreemapItem & {
  x: number
  y: number
  width: number
  height: number
}

function splitTreemap(
  items: TreemapItem[],
  x: number,
  y: number,
  width: number,
  height: number,
  vertical: boolean
): TreemapRect[] {
  if (items.length === 0) return []
  if (items.length === 1) return [{ ...items[0], x, y, width, height }]

  const total = items.reduce((sum, item) => sum + item.value, 0)
  let running = 0
  let splitIndex = 1
  let bestDiff = Number.POSITIVE_INFINITY

  for (let i = 1; i < items.length; i++) {
    running += items[i - 1].value
    const diff = Math.abs(total / 2 - running)
    if (diff < bestDiff) {
      bestDiff = diff
      splitIndex = i
    }
  }

  const first = items.slice(0, splitIndex)
  const second = items.slice(splitIndex)
  const firstTotal = first.reduce((sum, item) => sum + item.value, 0)
  const ratio = total > 0 ? firstTotal / total : 0.5

  if (vertical) {
    const firstWidth = width * ratio
    return [
      ...splitTreemap(first, x, y, firstWidth, height, !vertical),
      ...splitTreemap(second, x + firstWidth, y, width - firstWidth, height, !vertical),
    ]
  }

  const firstHeight = height * ratio
  return [
    ...splitTreemap(first, x, y, width, firstHeight, !vertical),
    ...splitTreemap(second, x, y + firstHeight, width, height - firstHeight, !vertical),
  ]
}

function ConcentrationTreemap({
  points,
  metric,
}: {
  points: LatestFinancialPoint[]
  metric: ConcentrationMetric
}) {
  const metricLabel = metric === 'revenue' ? 'omsetning' : 'driftsresultat'
  const ranked = points
    .map(point => ({
      id: point.id,
      label: point.name,
      stage: point.stage,
      value: metric === 'revenue' ? point.revenueNok : Math.max(0, point.operatingResultNok ?? 0),
      year: point.year,
      yearLabel: String(point.year),
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  if (ranked.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-sm text-stone-400">
        Ingen positive verdier for valgt konsentrasjonsmål.
      </div>
    )
  }

  const visible = ranked.slice(0, 18)
  const rest = ranked.slice(18)
  const restValue = rest.reduce((sum, item) => sum + item.value, 0)
  const items = restValue > 0
    ? [
        ...visible,
        {
          id: 'other',
          label: 'Øvrige selskaper',
          stage: 'unknown',
          value: restValue,
          year: null,
          yearLabel: formatYearRange(rest.map(item => item.year)),
        },
      ]
    : visible
  const total = items.reduce((sum, item) => sum + item.value, 0)
  const rects = splitTreemap(items, 0, 0, 100, 100, true)
  const stagePalette = ['#047857', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#78716c']
  const stageColor = new Map<string, string>()

  for (const item of items) {
    if (!stageColor.has(item.stage)) {
      stageColor.set(item.stage, stagePalette[stageColor.size % stagePalette.length])
    }
  }

  return (
    <div className="min-w-0">
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={`Treemap for konsentrasjon i ${metricLabel}`}
        className="h-96 w-full rounded-lg border border-stone-200 bg-stone-50"
        preserveAspectRatio="none"
      >
        {rects.map(rect => {
          const share = total > 0 ? (rect.value / total) * 100 : 0
          const showLabel = rect.width > 13 && rect.height > 9
          const fill = stageColor.get(rect.stage) ?? '#78716c'

          return (
            <g key={rect.id}>
              <rect
                x={rect.x}
                y={rect.y}
                width={Math.max(0, rect.width)}
                height={Math.max(0, rect.height)}
                fill={fill}
                fillOpacity={rect.id === 'other' ? 0.35 : 0.76}
                stroke="#ffffff"
                strokeWidth="0.45"
              >
                <title>
                  {`${rect.label}: ${formatNokMillionsWithYear(rect.value, rect.yearLabel)} (${share.toFixed(1)}% av ${metricLabel})`}
                </title>
              </rect>
              {showLabel && (
                <>
                  <text x={rect.x + 1.4} y={rect.y + 4.4} className="fill-white text-[2.8px] font-semibold">
                    {rect.label.slice(0, 28)}
                  </text>
                  <text x={rect.x + 1.4} y={rect.y + 8.4} className="fill-white/85 text-[2.5px]">
                    {share.toFixed(1)}% · {formatNokMillionsWithYear(rect.value, rect.yearLabel)}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>
      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map(item => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded border border-stone-200 bg-white px-3 py-2">
            <span className="min-w-0 truncate text-stone-700">{item.label}</span>
            <span className="shrink-0 tabular-nums text-stone-500">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
      {metric === 'operatingResult' && (
        <p className="mt-3 text-xs leading-5 text-stone-400">
          Selskaper med null eller negativt driftsresultat vises ikke i resultat-treemapet.
        </p>
      )}
    </div>
  )
}

function SubsidyMarginMatchedView({
  points,
  coverage,
}: {
  points: MatchedSubsidyMarginPoint[]
  coverage: MatchedSubsidyCoverage
}) {
  const coverageStrip = (
    <div className="grid gap-2 sm:grid-cols-2">
      <CoverageChip
        label="Regnskap"
        value={coverage.financialCompanyYearsWithRevenueMargin.toLocaleString('nb-NO')}
        sub="selskap-år med omsetning + margin"
      />
      <CoverageChip
        label="Tilskudd i regnskapsselskaper"
        value={coverage.trackedSubsidyCompanyYears.toLocaleString('nb-NO')}
        sub={`${coverage.trackedCompaniesWithYearSubsidies.toLocaleString('nb-NO')} selskaper`}
      />
      <CoverageChip
        label="Årsmatch"
        value={points.length.toLocaleString('nb-NO')}
        sub="samme companyId og år"
      />
      <CoverageChip
        label="Alle subsidie-år"
        value={coverage.allSubsidyCompanyYears.toLocaleString('nb-NO')}
        sub={`${coverage.allCompaniesWithYearSubsidies.toLocaleString('nb-NO')} mottakere`}
      />
    </div>
  )

  if (points.length === 0) {
    return (
      <div className="space-y-3">
        {coverageStrip}
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Ingen selskap-år har både regnskapsår med omsetning/driftsmargin og tilskudd med samme årstall.
        </div>
      </div>
    )
  }

  const auditThresholdPct = 100
  const analysisPoints = points.filter(point => point.subsidySharePct <= auditThresholdPct)
  const flaggedPoints = points.filter(point => point.subsidySharePct > auditThresholdPct)

  if (analysisPoints.length === 0) {
    return (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          {coverageStrip}
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p className="font-semibold">Årsmatchet analyse er blokkert av datakvalitet.</p>
            <p className="mt-2 leading-6">
              Streng match fant {points.length.toLocaleString('nb-NO')} selskap-år, men alle
              ligger over {auditThresholdPct}% tilskudd/omsetning. Disse punktene er derfor
              holdt utenfor scatterplotet og bør revideres for enhetsfeil, mottakerkobling
              eller feil årskobling før de brukes i maktanalyse.
            </p>
          </div>
        </div>
        <MatchedSubsidyMarginTable points={flaggedPoints} title="Flagget for audit" />
      </div>
    )
  }

  const width = 640
  const height = 300
  const padding = { top: 18, right: 24, bottom: 44, left: 54 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom
  const maxShare = Math.max(1, Math.ceil(Math.max(...analysisPoints.map(point => point.subsidySharePct))))
  const minMargin = Math.min(0, Math.floor(Math.min(...analysisPoints.map(point => point.marginPct))))
  const maxMargin = Math.max(1, Math.ceil(Math.max(...analysisPoints.map(point => point.marginPct))))
  const marginRange = maxMargin - minMargin || 1
  const years = Array.from(new Set(points.map(point => point.year))).sort()
  const companyCount = new Set(points.map(point => point.name)).size
  const duplicateGroups = Array.from(
    points.reduce((map, point) => {
      const key = `${point.name}-${point.year}-${point.subsidyNok}`
      map.set(key, (map.get(key) ?? 0) + 1)
      return map
    }, new Map<string, number>())
  ).filter(([, count]) => count > 1)
  const stagePalette = ['#047857', '#2563eb', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#78716c']
  const stageColor = new Map<string, string>()

  for (const point of analysisPoints) {
    if (!stageColor.has(point.stage)) {
      stageColor.set(point.stage, stagePalette[stageColor.size % stagePalette.length])
    }
  }

  const xFor = (share: number) => padding.left + (share / maxShare) * plotWidth
  const yFor = (margin: number) =>
    padding.top + (1 - ((margin - minMargin) / marginRange)) * plotHeight
  const zeroY = yFor(0)

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Scatterplot av årsmatchet subsidieandel mot driftsmargin"
          className="h-72 w-full overflow-visible"
        >
          <rect
            x={padding.left}
            y={padding.top}
            width={plotWidth}
            height={plotHeight}
            rx="6"
            fill="#fafaf9"
            stroke="#e7e5e4"
          />
          {minMargin < 0 && maxMargin > 0 && (
            <line
              x1={padding.left}
              x2={padding.left + plotWidth}
              y1={zeroY}
              y2={zeroY}
              stroke="#a8a29e"
              strokeDasharray="4 4"
            />
          )}
          {analysisPoints.map(point => {
            const color = stageColor.get(point.stage) ?? '#78716c'
            return (
              <circle
                key={point.id}
                cx={xFor(point.subsidySharePct)}
                cy={yFor(point.marginPct)}
                r="7"
                fill={color}
                fillOpacity="0.78"
                stroke="#ffffff"
                strokeWidth="1.5"
              >
                <title>
                  {`${point.name} ${point.year}: subsidieandel ${point.subsidySharePct.toFixed(2)}%, margin ${point.marginPct.toFixed(1)}%, tilskudd ${formatNokMillions(point.subsidyNok)}`}
                </title>
              </circle>
            )
          })}
          <line x1={padding.left} x2={padding.left + plotWidth} y1={padding.top + plotHeight} y2={padding.top + plotHeight} stroke="#a8a29e" />
          <line x1={padding.left} x2={padding.left} y1={padding.top} y2={padding.top + plotHeight} stroke="#a8a29e" />
          <text x={padding.left} y={height - 10} className="fill-stone-400 text-[11px]">
            0% subsidieandel
          </text>
          <text x={width - 145} y={height - 10} className="fill-stone-400 text-[11px]">
            {maxShare.toFixed(0)}% subsidieandel
          </text>
          <text x="4" y={padding.top + 12} className="fill-stone-400 text-[11px]">
            {maxMargin.toFixed(0)}% margin
          </text>
          <text x="4" y={padding.top + plotHeight} className="fill-stone-400 text-[11px]">
            {minMargin.toFixed(0)}%
          </text>
        </svg>
        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-stone-500">
          {Array.from(stageColor.entries()).map(([stage, color]) => (
            <span key={stage} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              {labelStage(stage)}
            </span>
          ))}
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        {coverageStrip}
        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
          <p className="font-semibold text-stone-900">
            {analysisPoints.length.toLocaleString('nb-NO')} analyseklare selskap-år
          </p>
          <p className="mt-1 leading-5">
            Streng match fant {points.length.toLocaleString('nb-NO')} selskap-år totalt,
            dekker {companyCount.toLocaleString('nb-NO')} selskaper og år {years.join(', ')}.
            Dette er streng match på <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">CompanyFinancial.year</code>
            {' '}og <code className="rounded bg-white px-1 py-0.5 font-mono text-[11px]">Subsidy.year</code>.
            {flaggedPoints.length > 0 && (
              <>
                {' '}Flagget: {flaggedPoints.length.toLocaleString('nb-NO')} selskap-år over {auditThresholdPct}% tilskudd/omsetning.
              </>
            )}
          </p>
          {duplicateGroups.length > 0 && (
            <p className="mt-2 rounded border border-amber-200 bg-amber-50 px-2 py-1.5 text-amber-900">
              Datavarsel: {duplicateGroups.length.toLocaleString('nb-NO')} navn-år/tilskudd-kombinasjon finnes på flere
              selskapsidentiteter. Beholdt i visningen, men bør ryddes i Company/old-orgnr-laget før ekstern bruk.
            </p>
          )}
        </div>
        <MatchedSubsidyMarginTable points={analysisPoints} />
      </div>
    </div>
  )
}

function CoverageChip({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-base font-bold tabular-nums text-stone-900">{value}</p>
      <p className="mt-1 text-[11px] leading-4 text-stone-500">{sub}</p>
    </div>
  )
}

function MatchedSubsidyMarginTable({
  points,
  title,
}: {
  points: MatchedSubsidyMarginPoint[]
  title?: string
}) {
  return (
    <div className="overflow-x-auto">
      {title && <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{title}</p>}
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-stone-200 text-left">
            <th className="py-2 pr-3 font-medium text-stone-400">Selskap-år</th>
            <th className="py-2 pr-3 text-right font-medium text-stone-400">Andel</th>
            <th className="py-2 pr-3 text-right font-medium text-stone-400">Margin</th>
          </tr>
        </thead>
        <tbody>
          {points.slice(0, 8).map(point => (
            <tr key={point.id} className="border-b border-stone-100">
              <td className="py-2 pr-3">
                <Link href={`/selskap/${point.companyId}`} className="font-medium text-stone-700 hover:text-emerald-700">
                  {point.name}
                </Link>
                <div className="text-[10px] text-stone-400">
                  {point.year} · {point.subsidyCount} tilskudd · {formatNokMillions(point.subsidyNok)}
                </div>
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-stone-700">
                {point.subsidySharePct.toFixed(2)}%
              </td>
              <td className="py-2 pr-3 text-right tabular-nums text-stone-700">
                {point.marginPct.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
