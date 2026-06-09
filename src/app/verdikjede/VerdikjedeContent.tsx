'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import type { StageEnrichment, VerdikjedeOverview } from '@/lib/queries/verdikjede'

const FeedCompositionTimeseries = dynamic(
  () => import('@/components/charts/FeedCompositionTimeseries').then(mod => mod.FeedCompositionTimeseries),
  {
    ssr: false,
    loading: () => <div className="h-[360px]" aria-hidden="true" />,
  }
)

const FoodFlowSankey = dynamic(
  () => import('@/components/charts/FoodFlowSankey').then((mod) => mod.FoodFlowSankey),
  {
    ssr: false,
    loading: () => (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Matflyt</h3>
        <div className="h-[320px] flex items-center justify-center text-xs text-stone-400">Laster...</div>
      </Card>
    ),
  }
)

type VerdikjedeStage = {
  id: string
  step: number
  title: string
  subtitle: string
  summary: string
  keyPoints: string[]
  countries: string[]
  keyActors: string[]
  tags: string[]
}

export function VerdikjedeContent({
  stages,
  enrichment,
  overview,
}: {
  stages: VerdikjedeStage[]
  enrichment: StageEnrichment[]
  overview: VerdikjedeOverview
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [flowCountry, setFlowCountry] = useState(
    () => overview.countries.find(country => country.flowSketchReady)?.code ?? 'no'
  )

  const enrichmentByStage = useMemo(() => {
    const map = new Map<string, StageEnrichment>()
    for (const e of enrichment) map.set(e.stageId, e)
    return map
  }, [enrichment])

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Verdikjede</h1>
        <p className="text-sm text-stone-400 mt-1">
          {stages.length} ledd i den nordiske matverdikjeden — fra jord til bord
        </p>
      </div>

      <VerdikjedeOverviewPanel
        overview={overview}
        flowCountry={flowCountry}
        onFlowCountryChange={setFlowCountry}
      />

      {stages.length === 0 ? (
        <EmptyState message="Ingen verdikjedeledd funnet" />
      ) : (
        <div className="space-y-3">
          {stages.map(stage => {
            const isExpanded = expandedIds.has(stage.id)
            const stepLabel = String(stage.step).padStart(2, '0')
            const stageEnrichment = enrichmentByStage.get(stage.id)
            const actorMatches = stageEnrichment?.actorMatches ?? []
            const actorById = new Map(actorMatches.map(m => [m.name, m.companyId]))
            const companyCount = stageEnrichment?.companyCount ?? 0
            const primaryDbStage = stageEnrichment?.dbStages[0]

            return (
              <Card key={stage.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(stage.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 mt-0.5">
                    {stepLabel}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800">
                      {stage.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      {stage.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[240px]">
                    {companyCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                        {companyCount} selskaper
                      </span>
                    )}
                    {stage.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded border bg-stone-50 text-stone-500 border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Sammendrag</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{stage.summary}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1.5">Nøkkelfunn</p>
                        <ul className="space-y-1">
                          {stage.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm text-stone-600 flex gap-2">
                              <span className="text-stone-300 shrink-0">{'—'}</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-6">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Land</p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.countries.map(country => (
                              <span
                                key={country}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200"
                              >
                                {country}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex-1">
                          <p className="text-xs font-medium text-stone-500 mb-1.5">Nøkkelaktører</p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.keyActors.map(actor => {
                              const companyId = actorById.get(actor) ?? null
                              const baseClasses =
                                'text-[10px] px-1.5 py-0.5 rounded border'
                              if (companyId) {
                                return (
                                  <Link
                                    key={actor}
                                    href={`/selskap/${companyId}`}
                                    className={`${baseClasses} bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400 transition-colors`}
                                  >
                                    {actor}
                                  </Link>
                                )
                              }
                              return (
                                <span
                                  key={actor}
                                  className={`${baseClasses} bg-stone-50 text-stone-500 border-stone-200`}
                                  title="Ikke koblet til selskap i registeret"
                                >
                                  {actor}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5">Temaer</p>
                        <div className="flex flex-wrap gap-1.5">
                          {stage.tags.map(tag => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {(companyCount > 0 || primaryDbStage) && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {primaryDbStage && companyCount > 0 && (
                            <Link
                              href={`/selskap?stage=${encodeURIComponent(primaryDbStage)}`}
                              className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                            >
                              Se {companyCount} selskaper i dette leddet {'→'}
                            </Link>
                          )}
                          <Link
                            href="/forsyningskjede"
                            className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                          >
                            Se i Forsyningskjede {'→'}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      <div className="space-y-3 pt-4 border-t border-stone-200">
        <div>
          <h2 className="text-base font-semibold text-stone-800">Fôrkomposisjon i norsk lakseoppdrett</h2>
          <p className="text-xs text-stone-500 mt-1">
            Tidsserie over fordelingen av fôrråstoffer (marint, vegetabilsk, novel proteiner) basert på Nofima/FHF
            ressursregnskap. Viser retning mot 25 % norske råvarer-målet 2034.
          </p>
        </div>
        <FeedCompositionTimeseries />
      </div>
    </div>
  )
}

const READINESS_LABELS: Record<VerdikjedeOverview['opportunities'][number]['readiness'], string> = {
  'klar-na': 'Klar nå',
  'klar-med-forbehold': 'Klar med forbehold',
  staging: 'Staging',
}

const READINESS_CLASSES: Record<VerdikjedeOverview['opportunities'][number]['readiness'], string> = {
  'klar-na': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'klar-med-forbehold': 'border-amber-200 bg-amber-50 text-amber-800',
  staging: 'border-stone-200 bg-stone-50 text-stone-600',
}

function formatPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString('no', { maximumFractionDigits: 1 })}%`
}

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('no')
}

function formatTonnes(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toLocaleString('no', { maximumFractionDigits: 1 })} mill. tonn`
  if (value >= 1_000) return `${Math.round(value / 1_000).toLocaleString('no')}k tonn`
  return `${Math.round(value).toLocaleString('no')} tonn`
}

function formatMissing(items: string[]): string {
  if (items.length === 0) return '—'
  if (items.length <= 2) return items.join(', ')
  return `${items.slice(0, 2).join(', ')} +${items.length - 2}`
}

function CoverageBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 rounded bg-stone-100 overflow-hidden">
      <div
        className="h-full bg-emerald-500"
        style={{ width: `${Math.max(2, Math.min(100, value))}%` }}
      />
    </div>
  )
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <Card>
      <p className="text-[10px] uppercase tracking-wider text-stone-400">{label}</p>
      <p className="text-xl font-bold text-stone-900 mt-1">{value}</p>
      <p className="text-[11px] text-stone-500 mt-1">{detail}</p>
    </Card>
  )
}

function VerdikjedeOverviewPanel({
  overview,
  flowCountry,
  onFlowCountryChange,
}: {
  overview: VerdikjedeOverview
  flowCountry: string
  onFlowCountryChange: (country: string) => void
}) {
  const flowCountries = overview.countries.filter(country => country.flowSketchReady)
  const activeFlowCountry = flowCountries.some(country => country.code === flowCountry)
    ? flowCountry
    : flowCountries[0]?.code ?? 'no'

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          label="Nordisk dekning"
          value={`${overview.totals.coveredTargetSteps}/${overview.totals.targetStepCount}`}
          detail={`${formatPercent(overview.totals.averageCoveragePct)} av mål-ledd i value-chain`}
        />
        <MetricCard
          label="Selvforsyning"
          value={formatPercent(overview.totals.averageSelfSufficiencyPct)}
          detail={`Snitt for ${overview.totals.countryCount} land, kaloribasert der registrert`}
        />
        <MetricCard
          label="Kildereferanser"
          value={formatNumber(overview.totals.sourceRefs)}
          detail="Registrert i landenes value-chain-filer"
        />
        <MetricCard
          label="Kjent matsvinn"
          value={formatTonnes(overview.totals.knownWasteTonnes)}
          detail="Sum av waste-felt som finnes, ikke full nordisk total"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4">
        <Card title="Datadekning per land">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-left text-stone-400">
                  <th className="py-2 pr-3 font-medium">Land</th>
                  <th className="py-2 pr-3 font-medium text-right">År</th>
                  <th className="py-2 pr-3 font-medium text-right">Dekning</th>
                  <th className="py-2 pr-3 font-medium text-right">Selvforsyning</th>
                  <th className="py-2 pr-3 font-medium text-right">Volumledd</th>
                  <th className="py-2 pr-3 font-medium text-right">Wasteledd</th>
                  <th className="py-2 font-medium">Mangler mål-ledd</th>
                </tr>
              </thead>
              <tbody>
                {overview.countries.map(country => (
                  <tr key={country.code} className="border-b border-stone-100 align-top">
                    <td className="py-2 pr-3 font-medium text-stone-800">{country.label}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-stone-500">
                      {country.year ?? '—'}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <div className="min-w-20">
                        <div className="tabular-nums text-stone-700 mb-1">{formatPercent(country.targetStepCoveragePct)}</div>
                        <CoverageBar value={country.targetStepCoveragePct} />
                      </div>
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-stone-600">
                      {formatPercent(country.selfSufficiencyPct)}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-stone-600">
                      {country.knownVolumeSteps}/{country.stepCount}
                    </td>
                    <td className="py-2 pr-3 text-right tabular-nums text-stone-600">
                      {country.knownWasteSteps}/{country.stepCount}
                    </td>
                    <td className="py-2 text-stone-500">
                      {formatMissing(country.missingTargetSteps)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Leddsignaler">
          <div className="space-y-2">
            {overview.stageSignals.map(signal => (
              <div key={signal.id} className="grid grid-cols-[110px_1fr] gap-3 items-center text-xs">
                <div className="truncate font-medium text-stone-700">{signal.label}</div>
                <div>
                  <div className="flex items-center justify-between gap-2 text-[11px] text-stone-500 mb-1">
                    <span>{signal.countriesWithStep}/5 land</span>
                    <span>{signal.countriesWithVolume}/5 volum · {signal.countriesWithWaste}/5 svinn</span>
                  </div>
                  <CoverageBar value={(signal.countriesWithStep / overview.totals.countryCount) * 100} />
                  {(signal.totalKnownVolumeTonnes > 0 || signal.totalKnownWasteTonnes > 0) && (
                    <div className="mt-1 text-[10px] text-stone-400">
                      {signal.totalKnownVolumeTonnes > 0 && `${formatTonnes(signal.totalKnownVolumeTonnes)} volum`}
                      {signal.totalKnownVolumeTonnes > 0 && signal.totalKnownWasteTonnes > 0 && ' · '}
                      {signal.totalKnownWasteTonnes > 0 && `${formatTonnes(signal.totalKnownWasteTonnes)} svinn`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-stone-800">Matflyt som grafisk uttak</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Første operative flytvisning basert på value-chain-filene. Bruk den som arbeidsflate for Sankey/flow-redesign.
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {flowCountries.map(country => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => onFlowCountryChange(country.code)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    activeFlowCountry === country.code
                      ? 'bg-stone-900 border-stone-900 text-white'
                      : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  {country.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <FoodFlowSankey country={activeFlowCountry} />
        </div>

        <Card title="Interessante uttak">
          <div className="space-y-3">
            {overview.opportunities.map(opportunity => (
              <div key={opportunity.id} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{opportunity.title}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{opportunity.skill}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${READINESS_CLASSES[opportunity.readiness]}`}>
                    {READINESS_LABELS[opportunity.readiness]}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-2">{opportunity.why}</p>
                <p className="text-xs text-stone-500 mt-1">
                  <span className="font-medium text-stone-600">Neste:</span> {opportunity.nextStep}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {opportunity.dataSources.slice(0, 3).map(source => (
                    <span key={source} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-50 text-stone-500 border border-stone-200">
                      {source}
                    </span>
                  ))}
                </div>
                {opportunity.route && (
                  <Link href={opportunity.route} className="inline-block mt-2 text-xs text-emerald-700 hover:text-emerald-800">
                    Åpne flate {'→'}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
