'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Card } from '@/components/ui/Card'
import { SupplyChainGraph } from '@/components/charts/SupplyChainGraph'
import type {
  SupplyChainGraphData,
  PrimaryDeliveriesData,
} from '@/lib/queries/supply-chain'

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

export function ForsyningskjedeContent({
  data,
  deliveries,
}: {
  data: SupplyChainGraphData
  deliveries: PrimaryDeliveriesData
}) {
  const [activeStages, setActiveStages] = useState<Set<string>>(() => {
    const stages = new Set<string>()
    for (const n of data.nodes) {
      if (n.valueChainStage) stages.add(n.valueChainStage)
    }
    return stages
  })

  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    () => new Set(Object.keys(data.stats.byType))
  )

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const toggleStage = (stage: string) => {
    setActiveStages(prev => {
      const next = new Set(prev)
      if (next.has(stage)) next.delete(stage)
      else next.add(stage)
      return next
    })
  }

  const toggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filteredNodes = useMemo(
    () => data.nodes.filter(n => !n.valueChainStage || activeStages.has(n.valueChainStage)),
    [data.nodes, activeStages]
  )

  const filteredNodeIds = useMemo(
    () => new Set(filteredNodes.map(n => n.id)),
    [filteredNodes]
  )

  const filteredEdges = useMemo(
    () => data.edges.filter(e =>
      activeTypes.has(e.relationshipType) &&
      filteredNodeIds.has(e.source) &&
      filteredNodeIds.has(e.target)
    ),
    [data.edges, activeTypes, filteredNodeIds]
  )

  const selectedNode = selectedNodeId
    ? data.nodes.find(n => n.id === selectedNodeId) ?? null
    : null

  const selectedInbound = useMemo(
    () => selectedNodeId
      ? data.edges.filter(e => e.target === selectedNodeId)
      : [],
    [data.edges, selectedNodeId]
  )

  const selectedOutbound = useMemo(
    () => selectedNodeId
      ? data.edges.filter(e => e.source === selectedNodeId)
      : [],
    [data.edges, selectedNodeId]
  )

  const nodeById = useMemo(() => {
    const map = new Map<string, SupplyChainGraphData['nodes'][0]>()
    for (const n of data.nodes) map.set(n.id, n)
    return map
  }, [data.nodes])

  const valueChainStages = useMemo(() => {
    const stages = new Set<string>()
    for (const n of data.nodes) {
      if (n.valueChainStage) stages.add(n.valueChainStage)
    }
    return [...stages].sort()
  }, [data.nodes])

  const relationshipTypes = useMemo(
    () => Object.keys(data.stats.byType).sort(),
    [data.stats.byType]
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Forsyningskjede</h1>
        <p className="text-sm text-stone-500 mt-1">
          Leverandørkjeder, primærleveranser og forretningsrelasjoner
        </p>
      </div>

      {deliveries.totalDeliveryRows > 0 && (
        <Card title={`Primærleveranser — ${deliveries.totalSuppliers.toLocaleString('no')} bønder leverer til ${deliveries.byCommodity.reduce((acc, c) => acc + c.buyers.length, 0)} avtagere`}>
          <p className="text-xs text-stone-500 mb-4">
            Aggregert levering fra jordbruksforetak til grossister og foredlingsbedrifter
            for melk, egg, korn, slakt og ull (Landbruksdirektoratet, siste
            tilgjengelige år per varekategori).
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

      <div className="flex flex-wrap gap-2">
        {valueChainStages.map(stage => (
          <button
            key={stage}
            onClick={() => toggleStage(stage)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              activeStages.has(stage)
                ? 'bg-white border-stone-300 text-stone-700'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: activeStages.has(stage) ? STAGE_COLORS[stage] ?? '#78716c' : '#d6d3d1' }}
            />
            {STAGE_LABELS[stage] ?? stage}
          </button>
        ))}

        <div className="w-px bg-stone-200 mx-1" />

        {relationshipTypes.map(type => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              activeTypes.has(type)
                ? 'bg-white border-stone-300 text-stone-700'
                : 'bg-stone-100 border-stone-200 text-stone-400'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: activeTypes.has(type) ? RELATIONSHIP_COLORS[type] ?? '#78716c' : '#d6d3d1' }}
            />
            {RELATIONSHIP_LABELS[type] ?? type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <SupplyChainGraph
          nodes={filteredNodes}
          edges={filteredEdges}
          stageColors={STAGE_COLORS}
          relationshipColors={RELATIONSHIP_COLORS}
          selectedNodeId={selectedNodeId}
          onNodeClick={setSelectedNodeId}
        />

        {selectedNode && (
          <Card>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">{selectedNode.label}</h3>
                <div className="flex items-center gap-2 mt-1">
                  {selectedNode.valueChainStage && (
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${STAGE_COLORS[selectedNode.valueChainStage] ?? '#78716c'}10`,
                        borderColor: `${STAGE_COLORS[selectedNode.valueChainStage] ?? '#78716c'}40`,
                        color: STAGE_COLORS[selectedNode.valueChainStage] ?? '#78716c',
                      }}
                    >
                      {STAGE_LABELS[selectedNode.valueChainStage] ?? selectedNode.valueChainStage}
                    </span>
                  )}
                  <span className="text-[10px] text-stone-400">{selectedNode.country}</span>
                </div>
              </div>

              {selectedInbound.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1.5">
                    Innkommende ({selectedInbound.length})
                  </p>
                  <ul className="space-y-1.5">
                    {selectedInbound.map((e, i) => {
                      const from = nodeById.get(e.source)
                      return (
                        <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: RELATIONSHIP_COLORS[e.relationshipType] ?? '#78716c' }}
                          />
                          <span>
                            <span className="font-medium">{from?.label ?? e.source}</span>
                            <span className="text-stone-400">
                              {' '}{RELATIONSHIP_LABELS[e.relationshipType] ?? e.relationshipType}
                            </span>
                            {e.sector && (
                              <span className="text-stone-300"> ({e.sector})</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {selectedOutbound.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-stone-500 mb-1.5">
                    Utgående ({selectedOutbound.length})
                  </p>
                  <ul className="space-y-1.5">
                    {selectedOutbound.map((e, i) => {
                      const to = nodeById.get(e.target)
                      return (
                        <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                            style={{ backgroundColor: RELATIONSHIP_COLORS[e.relationshipType] ?? '#78716c' }}
                          />
                          <span>
                            <span className="font-medium">{to?.label ?? e.target}</span>
                            <span className="text-stone-400">
                              {' '}{RELATIONSHIP_LABELS[e.relationshipType] ?? e.relationshipType}
                            </span>
                            {e.sector && (
                              <span className="text-stone-300"> ({e.sector})</span>
                            )}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {selectedInbound.length === 0 && selectedOutbound.length === 0 && (
                <p className="text-xs text-stone-400">Ingen synlige relasjoner med aktive filtre</p>
              )}
            </div>
          </Card>
        )}
      </div>

      <div className="flex gap-4 text-xs text-stone-400 px-1">
        <span>{filteredNodes.length} selskaper</span>
        <span>{filteredEdges.length} relasjoner</span>
      </div>
    </div>
  )
}
