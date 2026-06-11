'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { ColumnHelp } from '@/components/ui/ColumnHelp'
import { EmptyState } from '@/components/ui/EmptyState'
import { Glossary } from '@/components/ui/Glossary'
import { MissingValue, formatCoverageFootnote } from '@/components/ui/MissingValue'
import { formatEmployeeDisplay, formatRevenueDisplay } from '@/lib/company-card-metrics'
import { LIST_SURFACE_GLOSSARY_TERMS } from '@/lib/glossary/terms'

type CompanyRow = {
  id: string
  name: string
  orgNr: string
  legalForm: string | null
  founded: number | null
  naceDescription: string | null
  hqCity: string | null
  country: string
  ownershipType: string | null
  valueChainStage: string | null
  revenueNok: number | null
  employees: number | null
  hasFinancialRow: boolean
  controllingOwner: string | null
  boardCount: number
  subsidyCount: number
  propertyCount: number
  relationshipCount: number
}

const STAGE_LABELS: Record<string, string> = {
  retail: 'Dagligvare',
  processing: 'Foredling',
  seafood: 'Sjømat',
  inputs: 'Innsatsmidler',
  logistics: 'Logistikk',
  circular: 'Sirkulær',
  research: 'Forskning',
  production: 'Produksjon',
}

const OWNERSHIP_LABELS: Record<string, string> = {
  family: 'Familie',
  cooperative: 'Samvirke',
  state: 'Stat',
  foreign: 'Utenlandsk',
  listed: 'Børsnotert',
  private: 'Privat',
}

function CoveragePill({
  label,
  ok,
  missingReason = 'not_collected',
}: {
  label: string
  ok: boolean
  missingReason?: 'not_collected' | 'no_matching_record' | 'no_financial_row'
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 ${
        ok
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-stone-200 bg-stone-50 text-stone-500'
      }`}
    >
      <span>{label}</span>
      {ok ? <span>OK</span> : <MissingValue reason={missingReason} label="mangler" className="text-stone-500" />}
    </span>
  )
}

export function SelskaperContent({
  companies,
  initialStages = [],
}: {
  companies: CompanyRow[]
  initialStages?: string[]
}) {
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState(initialStages[0] ?? 'alle')
  const [ownershipFilter, setOwnershipFilter] = useState('alle')
  const deferredQuery = useDeferredValue(query)

  const stages = useMemo(
    () => Array.from(new Set(companies.map(c => c.valueChainStage).filter((v): v is string => Boolean(v)))).sort(),
    [companies]
  )
  const ownershipTypes = useMemo(
    () => Array.from(new Set(companies.map(c => c.ownershipType).filter((v): v is string => Boolean(v)))).sort(),
    [companies]
  )

  const filtered = useMemo(() => {
    return companies.filter(c => {
      if (stageFilter !== 'alle' && c.valueChainStage !== stageFilter) return false
      if (ownershipFilter !== 'alle' && c.ownershipType !== ownershipFilter) return false
      if (!deferredQuery.trim()) return true
      const q = deferredQuery.toLowerCase()
      return (
        c.name.toLowerCase().includes(q) ||
        c.orgNr.includes(q) ||
        (c.naceDescription ?? '').toLowerCase().includes(q) ||
        (c.hqCity ?? '').toLowerCase().includes(q)
      )
    })
  }, [companies, deferredQuery, stageFilter, ownershipFilter])

  const coverage = useMemo(() => ({
    revenue: companies.filter(c => c.revenueNok != null).length,
    financialRows: companies.filter(c => c.hasFinancialRow).length,
    employees: companies.filter(c => c.employees != null).length,
    boards: companies.filter(c => c.boardCount > 0).length,
    ownership: companies.filter(c => c.controllingOwner != null).length,
  }), [companies])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Selskaper</h1>
        <p className="text-sm text-stone-500 mt-1 max-w-3xl">
          {`${companies.length} kartlagte selskaper med regnskap, styre, eierskap og relasjoner.`}
        </p>
        <p className="mt-2 text-xs leading-5 text-stone-500">
          {formatCoverageFootnote('Omsetningsvisning', coverage.revenue, companies.length, 'selskaper')}{' '}
          Regnskapsrad finnes for {coverage.financialRows.toLocaleString('nb-NO')}; ansatte for{' '}
          {coverage.employees.toLocaleString('nb-NO')}; styre for {coverage.boards.toLocaleString('nb-NO')}; kontrollerende eier for{' '}
          {coverage.ownership.toLocaleString('nb-NO')}.
        </p>
      </div>

      <Glossary
        category="kolonner"
        terms={LIST_SURFACE_GLOSSARY_TERMS.selskap}
        title="Kolonneforklaringer"
      />
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-stone-400">
        <ColumnHelp term="Verdikjedetrinn" />
        <ColumnHelp term="Eierskapstype" />
        <ColumnHelp term="NACE" />
        <ColumnHelp term="Organisasjonsnummer" label="Orgnr" />
        <ColumnHelp term="Dekningsstatus" />
      </div>

      <Card>
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Søk etter navn, orgnr, NACE eller by..."
            className="flex-1 min-w-[220px] px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Ledd: Alle</option>
            {stages.map(s => (
              <option key={s} value={s}>
                {STAGE_LABELS[s] ?? s}
              </option>
            ))}
          </select>
          <select
            value={ownershipFilter}
            onChange={e => setOwnershipFilter(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <option value="alle">Eierskap: Alle</option>
            {ownershipTypes.map(o => (
              <option key={o} value={o}>
                {OWNERSHIP_LABELS[o] ?? o}
              </option>
            ))}
          </select>
          <span className="text-xs text-stone-400">{filtered.length} treff</span>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen selskaper matcher filteret" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.slice(0, 300).map(c => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/selskap/${c.id}`}
                    className="text-lg font-semibold text-stone-900 hover:text-emerald-700 break-words"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mt-1">
                    {c.valueChainStage ? (STAGE_LABELS[c.valueChainStage] ?? c.valueChainStage) : 'ukjent ledd'}
                    {c.ownershipType ? ` · ${OWNERSHIP_LABELS[c.ownershipType] ?? c.ownershipType}` : ''}
                  </p>
                </div>
                <div className="text-right text-xs text-stone-500 shrink-0">
                  <div className="font-mono">{c.orgNr}</div>
                  <div>
                    {c.hqCity ? c.hqCity : <MissingValue reason="not_collected" />}
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-stone-700 leading-snug line-clamp-2">
                {c.naceDescription ?? <MissingValue reason="not_collected" label="NACE ikke innhentet" />}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Form</div>
                  <div className="text-stone-700 font-medium">
                    {c.legalForm ?? <MissingValue reason="not_collected" />}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Stiftet</div>
                  <div className="text-stone-700 font-medium">
                    {c.founded ?? <MissingValue reason="not_reported" />}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Land</div>
                  <div className="text-stone-700 font-medium">{c.country}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Omsetning</div>
                  <div className="mt-0.5 font-semibold text-stone-900">
                    {c.revenueNok == null ? (
                      <MissingValue
                        reason={c.hasFinancialRow ? 'not_reported' : 'no_financial_row'}
                        label={formatRevenueDisplay(c.revenueNok, c.hasFinancialRow)}
                        className="font-semibold"
                      />
                    ) : (
                      formatRevenueDisplay(c.revenueNok, c.hasFinancialRow)
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Ansatte</div>
                  <div className="mt-0.5 font-semibold text-stone-900">
                    {c.employees == null ? (
                      <MissingValue reason="not_reported" label={formatEmployeeDisplay(c.employees)} className="font-semibold" />
                    ) : (
                      formatEmployeeDisplay(c.employees)
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-stone-500">
                Kontrollerende eier:{' '}
                {c.controllingOwner ?? <MissingValue reason="no_matching_record" label="mangler" />}
              </div>

              <div className="mt-3 flex flex-wrap gap-1 text-[11px]">
                <CoveragePill label="Finans" ok={c.hasFinancialRow} missingReason="no_financial_row" />
                <CoveragePill label="Styre" ok={c.boardCount > 0} />
                <CoveragePill label="Eierskap" ok={c.controllingOwner != null} missingReason="no_matching_record" />
              </div>

              <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-stone-500">
                {c.boardCount > 0 && <span>{c.boardCount} styremedlemmer</span>}
                {c.subsidyCount > 0 && <span>· {c.subsidyCount} tilskudd</span>}
                {c.propertyCount > 0 && <span>· {c.propertyCount} eiendommer</span>}
                {c.relationshipCount > 0 && <span>· {c.relationshipCount} relasjoner</span>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 300 && (
        <p className="text-xs text-stone-400 text-center">
          Viser første 300 av {filtered.length} treff — snevre inn med søk eller filter.
        </p>
      )}
    </div>
  )
}
