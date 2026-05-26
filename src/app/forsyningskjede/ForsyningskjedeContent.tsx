'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { SupplyChainGraph } from '@/components/charts/SupplyChainGraph'
import { EvidenceStatusBadge } from '@/components/visualization/EvidenceStatusBadge'
import { ResearchEvidenceBadge } from '@/components/visualization/ResearchEvidenceBadge'
import { ChartFrame } from '@/components/visualization/ChartFrame'
import { DataQualityStrip } from '@/components/visualization/DataQualityStrip'
import { getResearchEvidenceStatusConfig } from '@/lib/visualization/status'
import type { ResearchEvidenceStatus } from '@/lib/visualization/types'
import { valueChainFieldGapLabel } from '@/lib/supply-chain-status'
import { networkEndpointId } from '@/lib/network-map'
import type {
  SupplyChainGraphData,
  PrimaryDeliveriesData,
  SupplyChainDataQuality,
  ImportVulnerabilityData,
  CircularReturnFlowData,
  InfrastructureData,
} from '@/lib/queries/supply-chain'

const FeedCompositionTimeseries = dynamic(
  () => import('@/components/charts/FeedCompositionTimeseries').then(mod => mod.FeedCompositionTimeseries),
  {
    ssr: false,
    loading: () => <div className="h-[360px]" aria-hidden="true" />,
  }
)

const NutrientFlowsView = dynamic(
  () => import('@/components/charts/NutrientFlowsView').then(mod => mod.NutrientFlowsView),
  {
    ssr: false,
    loading: () => <div className="h-[420px]" aria-hidden="true" />,
  }
)

const COMMODITY_LABELS: Record<string, string> = {
  'melk-ku': 'Kumelk',
  'melk-geit': 'Geitemelk',
  egg: 'Egg',
  'korn-bygg': 'Bygg',
  'korn-havre': 'Havre',
  'korn-hvete': 'Hvete',
  'korn-rug': 'Rug',
  'korn-erter': 'Erter',
  oljefro: 'Oljefrø',
  'slakt-storfe': 'Storfeslakt',
  'slakt-svin': 'Svineslakt',
  'slakt-sau': 'Sau/lam',
  'slakt-fjorfe': 'Fjørfeslakt',
  ull: 'Ull',
}

function formatQuantity(q: number, unit: string): string {
  if (unit === 'liter' && q >= 1e9) return `${(q / 1e9).toFixed(2)} mrd L`
  if (unit === 'liter' && q >= 1e6) return `${(q / 1e6).toFixed(1)} mill L`
  if (unit === 'kg' && q >= 1e9) return `${(q / 1e9).toFixed(2)} mrd kg`
  if (unit === 'kg' && q >= 1e6) return `${(q / 1e6).toFixed(1)} mill kg`
  if (q >= 1e3) return `${Math.round(q / 1e3).toLocaleString('no')}k ${unit}`
  return `${Math.round(q).toLocaleString('no')} ${unit}`
}

const STAGE_COLORS: Record<string, string> = {
  retail: '#e11d48',
  processing: '#ea580c',
  seafood: '#0891b2',
  inputs: '#65a30d',
  logistics: '#7c3aed',
  circular: '#0d9488',
  research: '#6d28d9',
}

const STAGE_LABELS: Record<string, string> = {
  retail: 'Dagligvare',
  processing: 'Foredling',
  seafood: 'Sjømat',
  inputs: 'Innsatsmidler',
  logistics: 'Logistikk',
  circular: 'Sirkulær',
  research: 'Forskning',
}

const RELATIONSHIP_COLORS: Record<string, string> = {
  supplier: '#16a34a',
  buyer: '#dc2626',
  distributor: '#2563eb',
  franchisor: '#7c3aed',
  'self-dealing': '#f59e0b',
  'joint-venture': '#0891b2',
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  supplier: 'Leverandør',
  buyer: 'Kjøper',
  distributor: 'Distributør',
  franchisor: 'Franchisegiver',
  'self-dealing': 'Egenhandel',
  'joint-venture': 'Joint venture',
}

const IMPORT_GROUP_LABELS: Record<string, string> = {
  cereals: 'Korn',
  dairy_eggs: 'Meieri/egg',
  fats_oils: 'Fett/oljer',
  fish_seafood: 'Fisk/sjømat',
  fruit_veg: 'Frukt/grønt',
  meat: 'Kjøtt',
}

const IMPORT_GROUP_COLORS: Record<string, string> = {
  cereals: '#ca8a04',
  dairy_eggs: '#2563eb',
  fats_oils: '#7c3aed',
  fish_seafood: '#0891b2',
  fruit_veg: '#16a34a',
  meat: '#dc2626',
}

const COUNTRY_LABELS: Record<string, string> = {
  NO: 'Norge',
  SE: 'Sverige',
  DK: 'Danmark',
  FI: 'Finland',
  IS: 'Island',
}

const CIRCULAR_THEME_LABELS: Record<string, string> = {
  akademia_skala: 'Akademia-skala',
  alger_spillvarme: 'Alger/spillvarme',
  alt_protein: 'Alt. protein',
  alternativt_for: 'Alternativt fôr',
  biogass: 'Biogass',
  biorest: 'Biorest',
  direktehandel: 'Direktehandel',
  feed: 'Fôr',
  fiskeslam: 'Fiskeslam',
  importavhengighet: 'Importavhengighet',
  insekt_protein: 'Insektprotein',
  matsvinn: 'Matsvinn',
  measurement: 'Måling',
  nutrient_loop: 'Næringsloop',
  regenerativt_landbruk: 'Regenerativt',
  sidestream: 'Sidestrøm',
}

const SECTION_LINKS = [
  { href: '#nettverkskart', label: 'Nettverkskart' },
  { href: '#primaerflyt', label: 'Primærflyt' },
  { href: '#maktrelasjoner', label: 'Maktrelasjoner' },
  { href: '#import-saarbarhet', label: 'Import og sårbarhet' },
  { href: '#infrastruktur', label: 'Infrastruktur' },
  { href: '#returstrommer', label: 'Returstrømmer' },
]

const QUALITY_STATUS_CLASSES: Record<string, string> = {
  ok: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  warn: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
}

const READINESS_LABELS: Record<string, string> = {
  'klar-na': 'Klar nå',
  'klar-med-forbehold': 'Klar med forbehold',
  staging: 'Staging',
}

const QUALITY_LABELS: Record<string, string> = {
  high: 'høy',
  medium: 'middels',
  low: 'lav',
}

function getLaneConfig(lane: string) {
  const fallback = getResearchEvidenceStatusConfig('missing')
  const valid: ResearchEvidenceStatus[] = [
    'validated',
    'primary_snapshot',
    'proxy_model',
    'local_research_needs_primary_check',
    'missing',
  ]
  return valid.includes(lane as ResearchEvidenceStatus)
    ? getResearchEvidenceStatusConfig(lane as ResearchEvidenceStatus)
    : fallback
}

function formatCount(n: number): string {
  return Math.round(n).toLocaleString('no')
}

function formatPercent(n: number): string {
  return `${n.toLocaleString('no', { maximumFractionDigits: 1 })}%`
}

function formatDeltaPctPoints(n: number | null): string {
  if (n == null || !Number.isFinite(n)) return 'ny'
  return `${n >= 0 ? '+' : ''}${n.toLocaleString('no', { maximumFractionDigits: 1 })} pp`
}

function getBuyerKey(buyer: { buyerId: string | null; buyerName: string | null }): string {
  return buyer.buyerId ?? buyer.buyerName ?? 'ukjent'
}

export function ForsyningskjedeContent({
  data,
  deliveries,
  quality,
  importVulnerability,
  circularReturnFlows,
  infrastructure,
}: {
  data: SupplyChainGraphData
  deliveries: PrimaryDeliveriesData
  quality: SupplyChainDataQuality
  importVulnerability: ImportVulnerabilityData
  circularReturnFlows: CircularReturnFlowData
  infrastructure: InfrastructureData
}) {
  const searchParams = useSearchParams()
  const selectedRelationshipId = searchParams.get('relationship')

  const nodeById = useMemo(() => {
    const map = new Map<string, SupplyChainGraphData['nodes'][0]>()
    for (const n of data.nodes) map.set(n.id, n)
    return map
  }, [data.nodes])

  const selfDealingEdges = useMemo(
    () =>
      data.edges.filter(
        e => e.relationshipType === 'self-dealing' || e.source === e.target
      ),
    [data.edges]
  )

  const concentrationRows = useMemo(
    () =>
      deliveries.byCommodity
        .map(commodity => {
          const topBuyer = commodity.buyers[0]
          const topThreeQuantity = commodity.buyers
            .slice(0, 3)
            .reduce((sum, buyer) => sum + buyer.quantity, 0)

          return {
            commodity: commodity.commodity,
            label: COMMODITY_LABELS[commodity.commodity] ?? commodity.commodity,
            unit: commodity.unit,
            totalQuantity: commodity.totalQuantity,
            supplierCount: commodity.supplierCount,
            topBuyerName: topBuyer?.buyerName ?? 'Ukjent avtager',
            topBuyerShare: commodity.totalQuantity > 0 && topBuyer
              ? (topBuyer.quantity / commodity.totalQuantity) * 100
              : 0,
            topThreeShare: commodity.totalQuantity > 0
              ? (topThreeQuantity / commodity.totalQuantity) * 100
              : 0,
          }
        })
        .sort((a, b) => b.topBuyerShare - a.topBuyerShare),
    [deliveries.byCommodity]
  )

  const heatmap = useMemo(() => {
    const buyerScores = new Map<string, { label: string; score: number }>()

    for (const commodity of deliveries.byCommodity) {
      for (const buyer of commodity.buyers.slice(0, 6)) {
        const key = getBuyerKey(buyer)
        const current = buyerScores.get(key) ?? { label: buyer.buyerName ?? 'Ukjent avtager', score: 0 }
        current.score += commodity.totalQuantity > 0 ? buyer.quantity / commodity.totalQuantity : 0
        buyerScores.set(key, current)
      }
    }

    const columns = Array.from(buyerScores.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 7)

    const rows = deliveries.byCommodity.slice(0, 12).map(commodity => {
      const buyerShares = new Map(
        commodity.buyers.map(buyer => [
          getBuyerKey(buyer),
          commodity.totalQuantity > 0 ? (buyer.quantity / commodity.totalQuantity) * 100 : 0,
        ])
      )

      return {
        commodity: commodity.commodity,
        label: COMMODITY_LABELS[commodity.commodity] ?? commodity.commodity,
        cells: columns.map(column => buyerShares.get(column.key) ?? 0),
      }
    })

    return { columns, rows }
  }, [deliveries.byCommodity])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Forsyningskjede</h1>
        <p className="text-sm text-stone-500 mt-1">
          Leverandørkjeder, primærleveranser og forretningsrelasjoner
        </p>
      </div>

      <DataQualityStrip
        items={[
          {
            label: 'Leveranser (NO)',
            value: formatCount(deliveries.totalDeliveryRows),
            status: 'observed',
            detail: 'Norge-observert lag fra Landbruksdirektoratet. Skal ikke generaliseres til SE/DK/FI/IS.',
            description: `rader fra ${formatCount(deliveries.totalSuppliers)} produsent-orgnr`,
            citationReadiness: 'citable_with_note',
            citationNote: 'Primarkilde med geografisk dekningsforbehold.',
          },
          {
            label: 'Relasjoner',
            value: formatCount(data.stats.totalRelationships),
            status: 'proxy',
            detail: 'Kuraterte og kildebelagte relasjoner, ikke en komplett måling av vareflyt.',
            description: `relasjoner mellom ${formatCount(data.stats.companiesInvolved)} selskaper`,
            citationReadiness: 'citable_with_note',
            citationNote: 'Kuraterte relasjoner; bruk med metodeforbehold.',
          },
          {
            label: 'Kandidater',
            value: formatCount(quality.projectDataCandidates.length),
            status: 'illustrative',
            detail: 'Import, infrastruktur og returstrømmer holdes adskilt til metode og dekning er ferdig merket.',
            description: 'datasett vurderes for neste seksjoner',
            citationReadiness: 'internal_context',
            citationNote: 'Intern kandidatko, ikke ekstern sitatkilde.',
          },
        ]}
      />

      <SupplyChainQualityPanel quality={quality} />

      <nav className="flex flex-wrap gap-2 border-y border-stone-200 py-3" aria-label="Forsyningskjede-seksjoner">
        {SECTION_LINKS.map(link => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 hover:border-emerald-300 hover:text-emerald-700"
          >
            {link.label}
          </a>
        ))}
      </nav>

      <section id="nettverkskart" className="scroll-mt-6 space-y-4">
        <SectionHeader
          title="Nettverkskart"
          description="Felles analyse- og QA-kart for relasjoner, dokumentkoblinger, konfidens og kildegrunnlag. Brukes som locator, ikke som selvstendig effektbevis."
          researchStatus="proxy_model"
          researchStatusDetail="BusinessRelationship-grafen er kuratert og kildebelagt, men ikke en komplett måling av nordisk vareflyt. Dokumentnoder er valgfrie beviskoblinger."
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Relasjoner</p>
            <p className="text-xl font-bold text-stone-900 mt-1">{data.stats.totalRelationships}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">Selskaper</p>
            <p className="text-xl font-bold text-stone-900 mt-1">{data.stats.companiesInvolved}</p>
          </Card>
          {Object.entries(data.stats.byType).slice(0, 2).map(([type, count]) => (
            <Card key={type}>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">
                {RELATIONSHIP_LABELS[type] ?? type}
              </p>
              <p className="text-xl font-bold text-stone-900 mt-1">{count}</p>
            </Card>
          ))}
        </div>

      <SupplyChainGraph
        nodes={data.nodes}
        edges={data.edges}
        stageColors={STAGE_COLORS}
        relationshipColors={RELATIONSHIP_COLORS}
        selectedRelationshipId={selectedRelationshipId}
      />

        <div className="flex flex-wrap gap-4 px-1 text-xs text-stone-400">
          <span>{data.stats.companiesInvolved} selskaper</span>
          <span>{data.stats.totalRelationships} kuraterte relasjoner</span>
          <span>{(data.stats.byType['company-ref'] ?? 0).toLocaleString('no')} dokumentkoblinger</span>
        </div>
      </section>

      <section id="primaerflyt" className="scroll-mt-6 space-y-4">
        <SectionHeader
          title="Primærflyt (Norge)"
          description="Observerte leveranser fra norske primærprodusenter via Landbruksdirektoratet — ikke et nordisk lag. Lest per varegruppe og avtakertype."
          researchStatus="validated"
          researchStatusDetail="DeliveryVolume er Norge-observert register-data (Landbruksdirektoratet); SE/DK/FI/IS har ingen ekvivalent serie."
        />

        {concentrationRows.length > 0 && (
          <Card title="Kjøperkonsentrasjon per varegruppe">
            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)] gap-5">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-stone-400">
                      <th className="py-2 pr-3 font-medium">Vare</th>
                      <th className="py-2 pr-3 font-medium">Største avtager</th>
                      <th className="py-2 pr-3 font-medium text-right">Topp 1</th>
                      <th className="py-2 pr-3 font-medium text-right">Topp 3</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concentrationRows.slice(0, 10).map(row => (
                      <tr key={row.commodity} className="border-b border-stone-100">
                        <td className="py-2 pr-3 font-medium text-stone-800">{row.label}</td>
                        <td className="py-2 pr-3 text-stone-600">{row.topBuyerName}</td>
                        <td className="py-2 pr-3 text-right tabular-nums text-stone-700">
                          {formatPercent(row.topBuyerShare)}
                        </td>
                        <td className="py-2 pr-3 text-right tabular-nums text-stone-700">
                          {formatPercent(row.topThreeShare)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-xs">
                  <thead>
                    <tr className="border-b border-stone-200 text-left text-stone-400">
                      <th className="py-2 pr-2 font-medium">Vare</th>
                      {heatmap.columns.map(column => (
                        <th key={column.key} className="py-2 px-1 font-medium">
                          <span className="block max-w-24 truncate" title={column.label}>
                            {column.label}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.rows.map(row => (
                      <tr key={row.commodity} className="border-b border-stone-100">
                        <td className="py-1.5 pr-2 font-medium text-stone-700">{row.label}</td>
                        {row.cells.map((share, index) => {
                          const intensity = Math.min(0.85, Math.max(0.06, share / 70))
                          return (
                            <td key={`${row.commodity}-${heatmap.columns[index]?.key}`} className="py-1.5 px-1">
                              <div
                                className="h-7 rounded border border-white text-center text-[11px] leading-7 tabular-nums"
                                style={{
                                  backgroundColor: `rgba(14, 165, 233, ${intensity})`,
                                  color: share >= 35 ? '#ffffff' : '#1c1917',
                                }}
                                title={`${row.label} til ${heatmap.columns[index]?.label}: ${formatPercent(share)}`}
                              >
                                {share > 0 ? formatPercent(share) : '0%'}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
              Cellene viser andel av total mengde innen hver varegruppe. Andeler summeres ikke på tvers av liter og kg.
            </div>
          </Card>
        )}

        {deliveries.totalDeliveryRows > 0 && (
        <Card title={`Primærleveranser — ${deliveries.totalSuppliers.toLocaleString('no')} bønder leverer til ${deliveries.byCommodity.reduce((acc, c) => acc + c.buyers.length, 0)} avtagere`}>
          <p className="text-xs text-stone-500 mb-4">
            Norge-observert: aggregert levering fra norske jordbruksforetak til grossister og foredlingsbedrifter
            for melk, egg, korn, slakt og ull (Landbruksdirektoratet, siste
            tilgjengelige år per varekategori). Tabellen har ikke ekvivalente serier for SE/DK/FI/IS og skal ikke leses som nordisk paritet.
          </p>
          <div className="space-y-4">
            {deliveries.byCommodity.map(c => {
              const maxQty = c.buyers[0]?.quantity ?? 1
              const labels = COMMODITY_LABELS[c.commodity] ?? c.commodity
              return (
                <div key={c.commodity}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div className="text-sm font-medium text-stone-800">{labels}</div>
                    <div className="text-xs text-stone-500">
                      {formatQuantity(c.totalQuantity, c.unit)} · {c.supplierCount.toLocaleString('no')} leverandør-relasjoner
                    </div>
                  </div>
                  <div className="space-y-1">
                    {c.buyers.slice(0, 5).map(b => {
                      const pct = (b.quantity / maxQty) * 100
                      return (
                        <div key={`${c.commodity}-${b.buyerId ?? b.buyerName}`} className="flex items-center gap-2 text-xs">
                          <div className="w-40 truncate text-stone-600">
                            {b.buyerId ? (
                              <Link href={`/selskap/${b.buyerId}`} className="hover:text-emerald-700">
                                {b.buyerName ?? 'Ukjent'}
                              </Link>
                            ) : (
                              b.buyerName ?? 'Ukjent avtager'
                            )}
                          </div>
                          <div className="flex-1 relative h-5 bg-stone-50 rounded border border-stone-100">
                            <div
                              className="absolute inset-y-0 left-0 bg-sky-100 border-r border-sky-400 rounded"
                              style={{ width: `${pct}%` }}
                            />
                            <div className="absolute inset-0 flex items-center px-2 text-[11px] text-stone-700">
                              <span className="tabular-nums">{formatQuantity(b.quantity, c.unit)}</span>
                              <span className="text-stone-400 ml-2">
                                · {b.supplierCount.toLocaleString('no')} leverandører
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 text-xs text-stone-400">
            Kilde: Landbruksdirektoratet leveransedata (NLOD). Merk at «leverandør-relasjoner»
            teller foretak-år-par — ett foretak som leverer fem forskjellige korntyper
            telles fem ganger innen korn.
          </div>
        </Card>
        )}
      </section>

      <section id="import-saarbarhet" className="scroll-mt-6 space-y-4">
        <SectionHeader
          title="Import og sårbarhet"
          description="Bred nordisk importproxy per matvaregruppe og fôrråvarer som sårbarhetslag, ikke observert totalflyt."
          researchStatus="proxy_model"
          researchStatusDetail="Annual import panel finnes for alle nordiske land; monthly NO er documented gap. Brukes som sårbarhetslag, ikke totalflyt."
        />
        <ImportVulnerabilityPanel importVulnerability={importVulnerability} />
        <FeedCompositionTimeseries />
      </section>

      <section id="maktrelasjoner" className="scroll-mt-6 space-y-4">
        <SectionHeader
          title="Maktrelasjoner"
          description="Kuraterte forretningsrelasjoner som peker på eierskap, selvhandel, distribusjon og leverandørmakt."
          researchStatus="proxy_model"
          researchStatusDetail="BusinessRelationship-grafen er kuratert og kildebelagt, men ikke en komplett måling av nordisk vareflyt. NO har dypest dekning."
        />

      {selfDealingEdges.length > 0 && (
        <Card title={`Selvhandel — ${selfDealingEdges.length} interne handelsrelasjoner`}>
          <p className="text-xs text-stone-500 mb-3">
            Selskaper som handler med egne datter- eller søsterselskaper. Indikator
            på intern markedsmakt og potensiell profittforskyvning innen konsernet.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-left">
                  <th className="py-2 pr-3 text-stone-400 font-medium">Fra</th>
                  <th className="py-2 pr-3 text-stone-400 font-medium">Til</th>
                  <th className="py-2 pr-3 text-stone-400 font-medium">Type</th>
                  <th className="py-2 pr-3 text-stone-400 font-medium">Sektor</th>
                  <th className="py-2 text-stone-400 font-medium">Beskrivelse</th>
                </tr>
              </thead>
              <tbody>
                    {selfDealingEdges.map((e) => {
                      const sourceId = networkEndpointId(e.source)
                      const targetId = networkEndpointId(e.target)
                      const from = nodeById.get(sourceId)
                      const to = nodeById.get(targetId)
                      return (
                    <tr
                      key={e.id}
                      id={`relationship-${e.id}`}
                      className={`border-b border-stone-100 align-top ${
                        selectedRelationshipId === e.id ? 'bg-amber-50' : ''
                      }`}
                    >
                      <td className="py-2 pr-3">
                        <Link
                          href={`/selskap/${sourceId}`}
                          className="font-medium text-stone-800 hover:text-emerald-700"
                        >
                          {from?.label ?? sourceId}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">
                        <Link
                          href={`/selskap/${targetId}`}
                          className="font-medium text-stone-800 hover:text-emerald-700"
                        >
                          {to?.label ?? targetId}
                        </Link>
                      </td>
                      <td className="py-2 pr-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                          {RELATIONSHIP_LABELS[e.relationshipType] ?? e.relationshipType}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-stone-600">{e.sector ?? '—'}</td>
                      <td className="py-2 text-stone-600">{e.description ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      </section>

      <section id="infrastruktur" className="scroll-mt-6">
        <div className="space-y-4">
          <SectionHeader
            title="Infrastruktur"
            description="Romlige arbeidslag for hubber, anlegg, havner, gårder og akvakultur. Brukes til flaskehals- og kartanalyse, ikke som komplett prod-paritet."
            researchStatus="primary_snapshot"
            researchStatusDetail="NO har dedikerte geo-filer for farms/aquaculture/plants/ports/hubs; SE/DK/FI/IS har kun municipalities + stores. Per-land nodemerking trengs for full nordisk paritet."
          />
          <InfrastructurePanel infrastructure={infrastructure} />
        </div>
      </section>

      <section id="returstrommer" className="scroll-mt-6">
        <div className="space-y-4">
          <SectionHeader
            title="Returstrømmer"
            description="Sirkulære looper, gap og næringsstrømmer som viser hvor sidestrømmer kan kobles tilbake i systemet."
            researchStatus="proxy_model"
            researchStatusDetail="circularity-loops og nutrient-flows er modellert per MS-004. Skal ikke promoteres som validert primaerstatistikk uten metodenotat."
          />
          <CircularReturnFlowPanel circularReturnFlows={circularReturnFlows} />
          <NutrientFlowsView />
        </div>
      </section>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  researchStatus,
  researchStatusDetail,
}: {
  title: string
  description: string
  researchStatus?: ResearchEvidenceStatus
  researchStatusDetail?: string
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
        {researchStatus && (
          <ResearchEvidenceBadge
            status={researchStatus}
            prefix="Researchstatus"
            detail={researchStatusDetail}
          />
        )}
      </div>
      <p className="mt-1 text-sm text-stone-500">{description}</p>
    </div>
  )
}

function InfrastructurePanel({ infrastructure }: { infrastructure: InfrastructureData }) {
  return (
    <ChartFrame
      title="Infrastruktur og romlige noder"
      contract={{
        question: 'Hvor ligger de romlige flaskehals- og koblingspunktene i forsyningskjeden?',
        unit: 'GeoJSON-punkter per arbeidslag',
        period: 'arbeidsdatasett 2026-04-29',
        evidenceStatus: 'illustrative',
        sourceRefs: infrastructure.layers.map(layer => ({
          label: layer.label,
          path: layer.path,
        })),
        coverageNote: 'Romlige arbeidslag med ulik koblingsgrad. Akvakultur-GeoJSON er ikke samme paritetsgrunnlag som prod-tabellen i Gate C.',
      }}
    >
      <div className="space-y-5">
        <div className="text-xs text-stone-500">
          {formatCount(infrastructure.layers.reduce((sum, layer) => sum + layer.count, 0))} punkter på tvers av lag.
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {infrastructure.layers.map(layer => (
            <div key={layer.id} className="rounded-md border border-stone-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-stone-900">{layer.label}</p>
                  <p className="mt-0.5 text-[11px] text-stone-400">{layer.path}</p>
                </div>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] ${
                  layer.status === 'ready'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {layer.status === 'ready' ? 'klar' : 'staging'}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-stone-900">
                {formatCount(layer.count)}
              </p>
              <div className="mt-3 space-y-1.5">
                {layer.groups.slice(0, 4).map(group => (
                  <div key={`${layer.id}-${group.label}`} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="truncate text-stone-500">{group.label}</span>
                    <span className="tabular-nums text-stone-700">{formatCount(group.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {infrastructure.layers.slice(0, 4).map(layer => (
            <div key={`${layer.id}-examples`} className="rounded-md border border-stone-200 bg-stone-50 p-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-600">{layer.label}: eksempler</h4>
              <div className="mt-2 space-y-2">
                {layer.examples.slice(0, 3).map(example => (
                  <div key={`${layer.id}-${example.name}`} className="rounded border border-stone-200 bg-white p-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-stone-800">{example.name}</p>
                      {example.metric && (
                        <span className="shrink-0 text-[11px] tabular-nums text-stone-500">{example.metric}</span>
                      )}
                    </div>
                    {example.detail && <p className="mt-0.5 text-xs text-stone-500">{example.detail}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-stone-100 pt-3">
          {infrastructure.notes.map(note => (
            <p key={note} className="text-xs text-stone-500">{note}</p>
          ))}
        </div>
      </div>
    </ChartFrame>
  )
}

function ImportVulnerabilityPanel({ importVulnerability }: { importVulnerability: ImportVulnerabilityData }) {
  return (
    <ChartFrame
      title={`Importproxy — ${importVulnerability.countries.length} land / ${formatCount(importVulnerability.rowCount)} rader`}
      contract={{
        question: 'Hvilke brede matvaregrupper dominerer importkurven i hvert nordisk land?',
        unit: 'andel av valgt food-basket',
        period: 'siste tilgjengelige år per land',
        evidenceStatus: 'proxy',
        sourceRefs: [{ label: 'Nordic trade groups annual panel', path: importVulnerability.sourcePath }],
        coverageNote: 'Bred importproxy per matvaregruppe; egnet for andeler innen land, ikke absolutte landrangeringer.',
      }}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
          {importVulnerability.countries.map(country => {
            const topGroup = country.groups[0]
            return (
              <div key={country.country} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900">
                      {COUNTRY_LABELS[country.country] ?? country.country}
                    </p>
                    <p className="text-[11px] text-stone-400">
                      {country.latestYear} · {country.sourceName}
                    </p>
                  </div>
                  <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-500">
                    {country.country}
                  </span>
                </div>

                {topGroup && (
                  <div className="mt-3 rounded-md bg-stone-50 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">Største importgruppe</p>
                    <p className="mt-1 text-sm font-semibold text-stone-800">
                      {IMPORT_GROUP_LABELS[topGroup.groupCode] ?? topGroup.groupLabel}
                    </p>
                    <p className="text-xl font-bold text-stone-900 tabular-nums">
                      {formatPercent(topGroup.sharePct)}
                    </p>
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  {country.groups.map(group => {
                    const color = IMPORT_GROUP_COLORS[group.groupCode] ?? '#78716c'
                    return (
                      <div key={group.groupCode}>
                        <div className="mb-1 flex items-center justify-between gap-2 text-[11px]">
                          <span className="truncate text-stone-600">
                            {IMPORT_GROUP_LABELS[group.groupCode] ?? group.groupLabel}
                          </span>
                          <span className="shrink-0 tabular-nums text-stone-500">
                            {formatPercent(group.sharePct)}
                          </span>
                        </div>
                        <div className="h-2 rounded bg-stone-100">
                          <div
                            className="h-2 rounded"
                            style={{ width: `${Math.min(100, group.sharePct)}%`, backgroundColor: color }}
                          />
                        </div>
                        <p className="mt-0.5 text-[10px] text-stone-400">
                          {formatDeltaPctPoints(group.deltaPctPoints)} fra forrige år
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-t border-stone-100 pt-3">
          {importVulnerability.notes.map(note => (
            <p key={note} className="text-xs text-stone-500">{note}</p>
          ))}
        </div>
      </div>
    </ChartFrame>
  )
}

function CircularReturnFlowPanel({ circularReturnFlows }: { circularReturnFlows: CircularReturnFlowData }) {
  const maxThemeCount = Math.max(
    1,
    ...circularReturnFlows.themes.map(theme => theme.loopCount + theme.gapCount)
  )

  return (
    <ChartFrame
      title="Returstrømmer og sirkulære gap"
      contract={{
        question: 'Hvor finnes etablerte sirkulære looper, åpne gap og læringscase i matsystemet?',
        unit: 'kuraterte looper, gap og case',
        period: circularReturnFlows.generated ?? 'arbeidsdatasett',
        evidenceStatus: 'proxy',
        sourceRefs: circularReturnFlows.sourcePaths.map(path => ({ label: path.split('/').at(-1) ?? path, path })),
        coverageNote: 'Kuraterte case-, gap- og størrelsesordensdata. Ikke komplett observasjon av alle sidestrømmer.',
      }}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <ReturnFlowStat label="Looptabell" value={circularReturnFlows.counts.loops} />
          <ReturnFlowStat label="Gap" value={circularReturnFlows.counts.gaps} />
          <ReturnFlowStat label="Suksesscase" value={circularReturnFlows.counts.successCases} />
          <ReturnFlowStat label="Feilcase" value={circularReturnFlows.counts.failureCases} />
          <ReturnFlowStat label="N/P/K-land" value={circularReturnFlows.counts.nutrientCountries} />
          <ReturnFlowStat label="Teknologier" value={circularReturnFlows.counts.nutrientTechnologies} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Temadekning
            </h4>
            <div className="space-y-2">
              {circularReturnFlows.themes.map(theme => {
                const total = theme.loopCount + theme.gapCount
                return (
                  <div key={theme.theme}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-stone-700">
                        {CIRCULAR_THEME_LABELS[theme.theme] ?? theme.theme}
                      </span>
                      <span className="tabular-nums text-stone-500">
                        {theme.loopCount} looper / {theme.gapCount} gap
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded bg-stone-100">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${(theme.loopCount / maxThemeCount) * 100}%` }}
                      />
                      <div
                        className="bg-amber-500"
                        style={{ width: `${(theme.gapCount / maxThemeCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex gap-4 text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> eksisterende loop
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-amber-500" /> åpent gap
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ReturnFlowList title="Skalerbare looper" items={circularReturnFlows.priorityLoops} tone="loop" />
            <ReturnFlowList title="Åpne gap" items={circularReturnFlows.priorityGaps} tone="gap" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-stone-100 pt-4">
          <ReturnFlowList title="Suksesscase" items={circularReturnFlows.actorCases.success} tone="loop" compact />
          <ReturnFlowList title="Feilcase" items={circularReturnFlows.actorCases.failure} tone="gap" compact />
        </div>
      </div>
    </ChartFrame>
  )
}

function ReturnFlowStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
      <p className="text-[10px] uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-stone-900">{formatCount(value)}</p>
    </div>
  )
}

function ReturnFlowList({
  title,
  items,
  tone,
  compact = false,
}: {
  title: string
  items: CircularReturnFlowData['priorityLoops']
  tone: 'loop' | 'gap'
  compact?: boolean
}) {
  const toneClass = tone === 'loop'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : 'border-amber-200 bg-amber-50 text-amber-800'

  return (
    <div>
      <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map(item => (
          <div key={`${title}-${item.id}`} className="rounded-md border border-stone-200 bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold text-stone-800">{item.name}</p>
              <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[10px] ${toneClass}`}>
                {item.country}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-500">
                {CIRCULAR_THEME_LABELS[item.theme] ?? item.theme}
              </span>
              {item.rLevel && (
                <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-500">
                  {item.rLevel}
                </span>
              )}
            </div>
            {item.detail && !compact && (
              <p className="mt-2 text-xs text-stone-600">{item.detail}</p>
            )}
            {item.status && (
              <p className="mt-1 text-[11px] text-stone-400">{item.status}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function SupplyChainQualityPanel({ quality }: { quality: SupplyChainDataQuality }) {
  const topStageRows = quality.stageCoverage.slice(0, 8)
  const linkedDeliveryRows = quality.deliveryCommodities.filter(
    row => row.missingBuyerRows > 0 || row.missingKommuneRows > 0
  )

  return (
    <Card title={`Datakvalitet og neste datainntak — score ${quality.qualityScore}/100`}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quality.metrics.slice(0, 4).map(metric => (
            <QualityMetricBox key={metric.id} metric={metric} />
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2">
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Auditfunn
            </h4>
            <ul className="space-y-1.5">
              {quality.findings.map(finding => (
                <li key={finding} className="text-xs text-stone-600 flex gap-2">
                  <span className="text-stone-300 shrink-0">{'—'}</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Kartlagte selskaper per ledd
            </h4>
            <div className="space-y-1.5">
              {topStageRows.map(row => (
                <div key={row.stage} className="flex items-center gap-2 text-xs">
                  <span className="w-24 truncate text-stone-500">
                    {STAGE_LABELS[row.stage] ?? row.stage}
                  </span>
                  <div className="flex-1 h-1.5 rounded bg-stone-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.max(
                          2,
                          (row.count / Math.max(1, quality.stageCoverage[0]?.count ?? 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="w-14 text-right tabular-nums text-stone-600">
                    {formatCount(row.count)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Leveransedata: feltkvalitet
            </h4>
            {linkedDeliveryRows.length > 0 ? (
              <div className="overflow-x-auto rounded-md border border-stone-200">
                <table className="w-full text-xs">
                  <thead className="bg-stone-50">
                    <tr className="text-left text-stone-400">
                      <th className="py-2 px-2 font-medium">Vare</th>
                      <th className="py-2 px-2 font-medium">År</th>
                      <th className="py-2 px-2 font-medium text-right">Rader</th>
                      <th className="py-2 px-2 font-medium text-right">Mangler buyerId</th>
                      <th className="py-2 px-2 font-medium text-right">Mangler kommune</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkedDeliveryRows.map(row => (
                      <tr key={`${row.commodity}-${row.year}`} className="border-t border-stone-100">
                        <td className="py-2 px-2 text-stone-700">
                          {COMMODITY_LABELS[row.commodity] ?? row.commodity}
                        </td>
                        <td className="py-2 px-2 text-stone-500">{row.year}</td>
                        <td className="py-2 px-2 text-right tabular-nums text-stone-600">
                          {formatCount(row.rows)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-stone-600">
                          {formatCount(row.missingBuyerRows)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-stone-600">
                          {formatCount(row.missingKommuneRows)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-stone-500">Ingen feltgap i leveransedata oppdaget.</p>
            )}
          </div>

          <div>
            <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
              Nordisk value-chain-dekning
            </h4>
            <div className="overflow-x-auto rounded-md border border-stone-200">
              <table className="w-full text-xs">
                <thead className="bg-stone-50">
                  <tr className="text-left text-stone-400">
                    <th className="py-2 px-2 font-medium">Land</th>
                    <th className="py-2 px-2 font-medium text-right">Ledd</th>
                    <th className="py-2 px-2 font-medium text-right">Dekning</th>
                    <th className="py-2 px-2 font-medium">Status</th>
                    <th className="py-2 px-2 font-medium">Feltgap</th>
                    <th className="py-2 px-2 font-medium">Mangler</th>
                  </tr>
                </thead>
                <tbody>
                  {quality.valueChainInventory.map(row => (
                    <tr key={row.country} className="border-t border-stone-100 align-top">
                      <td className="py-2 px-2 font-medium text-stone-700">{row.country}</td>
                      <td className="py-2 px-2 text-right tabular-nums text-stone-600">
                        {row.stepCount}
                      </td>
                      <td className="py-2 px-2 text-right tabular-nums text-stone-600">
                        {formatPercent(row.targetStepCoveragePct)}
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`inline-flex rounded border px-1.5 py-0.5 text-[10px] font-medium ${getLaneConfig(row.displayLane).className}`}
                          title={[row.reviewStatus, row.statusNote].filter(Boolean).join(' — ') || getLaneConfig(row.displayLane).description}
                        >
                          {getLaneConfig(row.displayLane).label}
                        </span>
                      </td>
                      <td
                        className="py-2 px-2 text-stone-500"
                        title={[
                          row.missingVolumeSteps.length > 0
                            ? `Volum: ${row.missingVolumeSteps.join(', ')}`
                            : null,
                          row.missingWasteSteps.length > 0
                            ? `Avfall: ${row.missingWasteSteps.join(', ')}`
                            : null,
                        ].filter(Boolean).join(' — ')}
                      >
                        {valueChainFieldGapLabel(row.missingVolumeSteps, row.missingWasteSteps)}
                      </td>
                      <td className="py-2 px-2 text-stone-500">
                        {row.missingTargetSteps.length > 0
                          ? row.missingTargetSteps.join(', ')
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
            Prosjektdata som bør inn her
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {quality.projectDataCandidates.map(candidate => (
              <div
                key={candidate.id}
                className="rounded-md border border-stone-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">{candidate.title}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                      {candidate.path}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] px-1.5 py-0.5 rounded border bg-stone-50 text-stone-600 border-stone-200">
                      {READINESS_LABELS[candidate.readiness] ?? candidate.readiness}
                    </span>
                    <span className="text-[10px] text-stone-400">
                      kvalitet: {QUALITY_LABELS[candidate.quality] ?? candidate.quality}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-2">{candidate.why}</p>
                <p className="text-xs text-stone-500 mt-1">
                  <span className="font-medium text-stone-600">Bruk:</span> {candidate.integration}
                </p>
                <p className="text-[11px] text-stone-400 mt-2">{candidate.records}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-stone-100 flex flex-wrap gap-2">
          {quality.metrics.slice(4).map(metric => (
            <span
              key={metric.id}
              className={`text-[10px] px-2 py-1 rounded border ${QUALITY_STATUS_CLASSES[metric.status]}`}
            >
              {metric.label}: {metric.percent != null ? formatPercent(metric.percent) : formatCount(metric.value)}
            </span>
          ))}
          {quality.relationshipTypes.map(row => (
            <span
              key={row.type}
              className="text-[10px] px-2 py-1 rounded border border-stone-200 bg-stone-50 text-stone-600"
            >
              {RELATIONSHIP_LABELS[row.type] ?? row.type}: {formatCount(row.count)}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

function QualityMetricBox({ metric }: { metric: SupplyChainDataQuality['metrics'][0] }) {
  return (
    <div className={`rounded-md border p-3 ${QUALITY_STATUS_CLASSES[metric.status]}`}>
      <p className="text-[10px] uppercase tracking-wider opacity-80">{metric.label}</p>
      <p className="text-xl font-bold mt-1">
        {metric.percent != null ? formatPercent(metric.percent) : formatCount(metric.value)}
      </p>
      <p className="text-[10px] mt-0.5 opacity-75">{metric.detail}</p>
    </div>
  )
}
