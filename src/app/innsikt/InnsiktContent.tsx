'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'
import { SourceChip } from '@/components/ui/SourceChip'
import { InsightGlossary } from '@/components/ui/InsightGlossary'
import { ParentCompanyChart } from '@/components/charts/ParentCompanyChart'
import { InsightTypeDonut } from '@/components/charts/InsightTypeDonut'
import { InsightTagBar } from '@/components/charts/InsightTagBar'
import { COUNTRY_LIST, type CountryCode } from '@/lib/config/countries'

const InsightTimeline = dynamic(
  () => import('@/components/charts/InsightTimeline').then((mod) => mod.InsightTimeline),
  { ssr: false },
)
const SelfSufficiencyChart = dynamic(
  () => import('@/components/charts/SelfSufficiencyChart').then((mod) => mod.SelfSufficiencyChart),
  { ssr: false },
)
const MarginsChart = dynamic(
  () => import('@/components/charts/MarginsChart').then((mod) => mod.MarginsChart),
  { ssr: false },
)
const MarketShareChart = dynamic(
  () => import('@/components/charts/MarketShareChart').then((mod) => mod.MarketShareChart),
  { ssr: false },
)
const LorenzCurveChart = dynamic(
  () => import('@/components/charts/LorenzCurveChart').then((mod) => mod.LorenzCurveChart),
  { ssr: false },
)
const ZipfDistributionChart = dynamic(
  () => import('@/components/charts/ZipfDistributionChart').then((mod) => mod.ZipfDistributionChart),
  { ssr: false },
)
const FoodFlowSankey = dynamic(
  () => import('@/components/charts/FoodFlowSankey').then((mod) => mod.FoodFlowSankey),
  { ssr: false },
)

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
  documentSlug: string | null
  origin: 'structured' | 'document'
}

const typeFilters = [
  { label: 'Alle', value: 'alle' },
  { label: 'Notat', value: 'notat' },
  { label: 'Kartlegging', value: 'kartlegging' },
  { label: 'Analyse', value: 'analyse' },
  { label: 'Funn', value: 'funn' },
  { label: 'Lenke', value: 'lenke' },
]

const COUNTRY_TAG_MATCH: Record<CountryCode, string[]> = {
  no: ['norge', 'norsk'],
  se: ['sverige', 'svensk'],
  dk: ['danmark', 'dansk'],
  fi: ['finland', 'finsk'],
  is: ['island', 'islandsk'],
}

const NORDIC_TAGS = new Set(['nordisk', 'norden', 'nordics'])

const NORMALIZE_TAG: Record<string, string> = {
  norge: 'Norge',
  sverige: 'Sverige',
  danmark: 'Danmark',
  finland: 'Finland',
  island: 'Island',
  sirkulaer: 'sirkulær',
  oekologisk: 'økologisk',
  sjoemat: 'sjømat',
  sjomatfor: 'sjømatfôr',
}

function normalizeTag(tag: string) {
  const lower = tag.toLowerCase()
  return NORMALIZE_TAG[lower] ?? tag
}

function insightMatchesCountry(insight: InsightRow, country: CountryCode) {
  const targets = COUNTRY_TAG_MATCH[country]
  for (const tag of insight.tags) {
    const lower = tag.toLowerCase()
    if (targets.includes(lower)) return true
    if (NORDIC_TAGS.has(lower)) return true
  }
  if (insight.tags.length === 0) return true
  return false
}

function SectionHeader({ id, title, description }: { id: string; title: string; description: string }) {
  return (
    <div id={id} className="scroll-mt-20">
      <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
      <p className="text-xs text-stone-500 mt-0.5">{description}</p>
    </div>
  )
}

export function InnsiktContent({ insights }: { insights: InsightRow[] }) {
  const [typeFilter, setTypeFilter] = useState('alle')
  const [country, setCountry] = useState<CountryCode>('no')
  const [filterByCountry, setFilterByCountry] = useState(false)
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set())

  const structuredCount = insights.filter((item) => item.origin === 'structured').length
  const documentFallbackCount = insights.length - structuredCount
  const lastUpdated = useMemo(() => {
    const dates = insights.map((i) => i.date).filter(Boolean).sort()
    return dates.length ? dates[dates.length - 1] : null
  }, [insights])

  const filtered = useMemo(() => {
    return insights.filter((i) => {
      if (typeFilter !== 'alle' && i.insightType !== typeFilter) return false
      if (filterByCountry && !insightMatchesCountry(i, country)) return false
      if (activeTags.size > 0) {
        const tagSet = new Set(i.tags.map((t) => normalizeTag(t)))
        for (const t of activeTags) if (!tagSet.has(t)) return false
      }
      return true
    })
  }, [insights, typeFilter, filterByCountry, country, activeTags])

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev)
      if (next.has(tag)) next.delete(tag)
      else next.add(tag)
      return next
    })
  }

  function clearAllFilters() {
    setTypeFilter('alle')
    setActiveTags(new Set())
    setFilterByCountry(false)
  }

  const hasActiveFilters = typeFilter !== 'alle' || activeTags.size > 0 || filterByCountry
  const activeCountryName = COUNTRY_LIST.find((c) => c.code === country)?.name ?? country

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Innsikt</h1>
            <p className="text-xs uppercase tracking-wider text-stone-500 mt-0.5 font-medium">
              Datadrevet status på markedsstruktur, selvforsyning og kunnskapsfunn
            </p>
            <p className="text-sm text-stone-500 mt-2 max-w-2xl leading-relaxed">
              Visualiseringene under aggregerer kartlagte butikker, kjeder og verdikjededata for de fem nordiske
              landene. Lengre ned ligger {structuredCount} strukturerte funn og analyser
              {documentFallbackCount > 0 ? ` + ${documentFallbackCount} dokumentbaserte` : ''}, som kan
              filtreres etter type, land og tema.
            </p>
            <p className="text-[11px] text-stone-400 mt-2">
              Sist oppdatert: {lastUpdated ?? '—'} ·{' '}
              <Link href="/sammenligning" className="text-emerald-700 hover:underline">
                Nordisk sammenligning →
              </Link>{' '}
              ·{' '}
              <Link href="/bibliotek" className="text-emerald-700 hover:underline">
                Dokumentbibliotek →
              </Link>{' '}
              ·{' '}
              <Link href="/kilder" className="text-emerald-700 hover:underline">
                Kilderegister →
              </Link>
            </p>
          </div>
          <div className="flex gap-1 bg-white rounded-lg border border-stone-200 p-1 self-start">
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

        <nav className="flex flex-wrap gap-3 text-xs text-stone-500">
          <a href="#marked" className="hover:text-stone-800 hover:underline">
            ↓ Markedsstruktur
          </a>
          <a href="#selvforsyning" className="hover:text-stone-800 hover:underline">
            ↓ Selvforsyning og flyt
          </a>
          <a href="#mix" className="hover:text-stone-800 hover:underline">
            ↓ Markedsmix
          </a>
          <a href="#kunnskapsbase" className="hover:text-stone-800 hover:underline">
            ↓ Kunnskapsbase
          </a>
        </nav>

        <InsightGlossary />
      </header>

      <section className="space-y-3">
        <SectionHeader
          id="marked"
          title="Markedsstruktur"
          description={`Konsentrasjon, eierskap og butikkfordeling for ${activeCountryName}`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ParentCompanyChart country={country} />
          <LorenzCurveChart country={country} />
          <ZipfDistributionChart country={country} />
          <Card>
            <h3 className="text-sm font-semibold text-stone-700 mb-1">Sammenlign med Norden →</h3>
            <p className="text-xs text-stone-500 leading-relaxed mb-3">
              HHI, CR3 og Gini er beregnet for alle fem land. Se dem side-om-side med samme målestokk
              på sammenligningssiden.
            </p>
            <Link
              href="/sammenligning"
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
            >
              Åpne nordisk sammenligning →
            </Link>
          </Card>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          id="selvforsyning"
          title="Selvforsyning og matflyt"
          description={`Andel innenlandsk produksjon og hovedstrømmene i verdikjeden for ${activeCountryName}`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelfSufficiencyChart country={country} />
          <FoodFlowSankey country={country} />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader
          id="mix"
          title="Markedsmix og marginer"
          description={`Konsepttype-fordeling og fortjeneste i dagligvareleddet for ${activeCountryName}`}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarketShareChart country={country} />
          <MarginsChart country={country} />
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          id="kunnskapsbase"
          title="Kunnskapsbase"
          description={`${insights.length} insights samlet fra forskning, møter, kartlegging og dokumenter`}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InsightTypeDonut
            insights={insights}
            activeType={typeFilter}
            onSelect={(type) => setTypeFilter(typeFilter === type ? 'alle' : type)}
          />
          <InsightTimeline insights={insights} />
          <InsightTagBar insights={insights} activeTags={activeTags} onToggle={toggleTag} />
        </div>

        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-500">Type</span>
                <FilterChips
                  items={typeFilters}
                  defaultValue={typeFilter}
                  onChange={setTypeFilter}
                />
              </div>
              <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterByCountry}
                  onChange={(e) => setFilterByCountry(e.target.checked)}
                  className="accent-emerald-600"
                />
                Begrens til {activeCountryName} + nordisk
              </label>
            </div>

            {activeTags.size > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  Aktive tagger
                </span>
                {[...activeTags].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  >
                    {tag}
                    <span className="text-emerald-500">×</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="text-xs text-stone-500">
                Viser <span className="font-semibold text-stone-700">{filtered.length}</span> av{' '}
                {insights.length} insights
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-stone-500 hover:text-stone-800 underline underline-offset-2"
                >
                  Nullstill alle filtre
                </button>
              )}
            </div>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <EmptyState message="Ingen innsikt matcher de valgte filtrene" />
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <Card key={item.id} className="!p-4">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="text-sm font-semibold text-stone-800">{item.title}</h3>
                  <StatusBadge status={item.insightType} />
                  {item.origin === 'document' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded border font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                      Dokument
                    </span>
                  )}
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-stone-400">
                  {item.sourceRefs?.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {item.sourceRefs.map((s) => (
                        <SourceChip
                          key={s.label}
                          source={{
                            label: s.label,
                            url: s.url ?? undefined,
                            note: s.note ?? undefined,
                          }}
                        />
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
                  {item.tags.map((tag) => {
                    const normalized = normalizeTag(tag)
                    const isActive = activeTags.has(normalized)
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(normalized)}
                        className={`text-xs hover:underline ${
                          isActive ? 'text-emerald-700 font-medium' : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        · {normalized}
                      </button>
                    )
                  })}
                  {item.documentSlug && (
                    <Link
                      href={`/bibliotek/${item.documentSlug}`}
                      className="text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
                    >
                      Bibliotek
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
