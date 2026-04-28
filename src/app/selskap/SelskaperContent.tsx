'use client'

import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

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

function formatRevenue(n: number | null) {
  if (n == null) return '—'
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)} mrd`
  if (n >= 1e6) return `${(n / 1e6).toFixed(0)} mill`
  return `${Math.round(n / 1e3).toLocaleString('no')}k`
}

export function SelskaperContent({
  companies,
  includeAll,
  initialStages = [],
}: {
  companies: CompanyRow[]
  includeAll: boolean
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Selskaper</h1>
          <p className="text-sm text-stone-500 mt-1 max-w-3xl">
            {includeAll
              ? `Viser alle ${companies.length.toLocaleString('no')} registrerte selskaper (inkl. jordbruksforetak fra subsidieregisteret).`
              : `Viser ${companies.length} kartlagte selskaper med regnskap, styre, eierskap, underlagskobling, eiendom, relasjoner eller aktørkobling.`}
          </p>
        </div>
        <div className="flex gap-2">
          {includeAll ? (
            <Link
              href="/selskap"
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              Vis kun kartlagte
            </Link>
          ) : (
            <Link
              href="/selskap?all=1"
              className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50"
            >
              Vis alle {' '}55 000+ selskaper
            </Link>
          )}
        </div>
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
                  {c.hqCity && <div>{c.hqCity}</div>}
                </div>
              </div>

              {c.naceDescription && (
                <p className="mt-3 text-sm text-stone-700 leading-snug line-clamp-2">
                  {c.naceDescription}
                </p>
              )}

              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {c.legalForm && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">Form</div>
                    <div className="text-stone-700 font-medium">{c.legalForm}</div>
                  </div>
                )}
                {c.founded && (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-stone-400">Stiftet</div>
                    <div className="text-stone-700 font-medium">{c.founded}</div>
                  </div>
                )}
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Land</div>
                  <div className="text-stone-700 font-medium">{c.country}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Omsetning</div>
                  <div className="mt-0.5 font-semibold text-stone-900">
                    {formatRevenue(c.revenueNok)}
                  </div>
                </div>
                <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2">
                  <div className="text-[10px] uppercase tracking-wider text-stone-400">Ansatte</div>
                  <div className="mt-0.5 font-semibold text-stone-900">
                    {c.employees?.toLocaleString('no') ?? '—'}
                  </div>
                </div>
              </div>

              {c.controllingOwner && (
                <div className="mt-3 text-xs text-stone-500">
                  Kontrollerende eier: {c.controllingOwner}
                </div>
              )}

              <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-stone-500">
                {c.boardCount > 0 && <span>{c.boardCount} styre</span>}
                {c.subsidyCount > 0 && <span>· {c.subsidyCount} tilskudd</span>}
                {c.propertyCount > 0 && <span>· {c.propertyCount} eiendom</span>}
                {c.relationshipCount > 0 && <span>· {c.relationshipCount} rel.</span>}
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
