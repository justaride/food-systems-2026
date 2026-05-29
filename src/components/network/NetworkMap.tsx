'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  getNetworkMapView,
  getNetworkPresetTypeSets,
  networkEdgeKey,
  networkEndpointId,
  resolveNetworkEdgeSelection,
  type NetworkEdge,
  type NetworkEvidenceStatus,
  type NetworkNode,
  type NetworkPreset,
} from '@/lib/network-map'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

export type NetworkTypeConfig = {
  label: string
  color: string
  size?: number
}

export type NetworkMapProps = {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  presets: NetworkPreset[]
  defaultPresetId?: string
  typeConfig: Record<string, NetworkTypeConfig>
  edgeLabels?: Record<string, string>
  edgeColors?: Record<string, string>
  maxRenderNodes?: number
  selectedNodeId?: string | null
  selectedEdgeId?: string | null
  initialSelectedEdgeId?: string | null
  onNodeSelect?: (nodeId: string | null) => void
  onEdgeSelect?: (edgeId: string | null) => void
  inspectorLinkLabel?: string
  emptyTitle?: string
  emptyMessage?: string
}

const HIGHLIGHT_COLOR = '#f59e0b'
const DIM_NODE_COLOR = '#e7e5e4'
const DIM_EDGE_COLOR = '#f5f5f4'
const BASE_EDGE_COLOR = '#d6d3d1'

const EVIDENCE_LABELS: Record<string, string> = {
  validated: 'Validert',
  primary_snapshot: 'Primær',
  proxy_model: 'Proxy',
  local_research_needs_primary_check: 'Må sjekkes',
  missing: 'Mangler',
  observed: 'Observert',
  estimated: 'Estimert',
  proxy: 'Proxy',
  illustrative: 'Illustrativ',
  citable_external: 'Citable',
  citable_with_note: 'Forbehold',
  internal_context: 'Intern',
  blocked_unsourced: 'Blokkert',
}

const EVIDENCE_CLASSES: Record<string, string> = {
  validated: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  primary_snapshot: 'border-sky-200 bg-sky-50 text-sky-800',
  proxy_model: 'border-amber-200 bg-amber-50 text-amber-800',
  local_research_needs_primary_check: 'border-orange-200 bg-orange-50 text-orange-800',
  missing: 'border-rose-200 bg-rose-50 text-rose-800',
  observed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  estimated: 'border-sky-200 bg-sky-50 text-sky-700',
  proxy: 'border-amber-200 bg-amber-50 text-amber-800',
  illustrative: 'border-rose-200 bg-rose-50 text-rose-700',
  citable_external: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  citable_with_note: 'border-amber-200 bg-amber-50 text-amber-800',
  internal_context: 'border-stone-200 bg-stone-50 text-stone-600',
  blocked_unsourced: 'border-rose-200 bg-rose-50 text-rose-800',
}

function evidenceClass(status: NetworkEvidenceStatus | undefined) {
  if (!status) return 'border-stone-200 bg-stone-50 text-stone-500'
  return EVIDENCE_CLASSES[status] ?? 'border-stone-200 bg-stone-50 text-stone-500'
}

function evidenceLabel(status: NetworkEvidenceStatus | undefined) {
  if (!status) return 'Umerket'
  return EVIDENCE_LABELS[status] ?? status
}

function confidenceLabel(confidence: number | undefined) {
  if (typeof confidence !== 'number') return 'Ukjent'
  return `${Math.round(confidence * 100)}%`
}

function edgeTone(edge: NetworkEdge) {
  if (edge.evidenceStatus) return evidenceClass(edge.evidenceStatus)
  if (typeof edge.confidence !== 'number') return 'border-stone-200 bg-stone-50 text-stone-500'
  if (edge.confidence >= 0.9) return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (edge.confidence >= 0.6) return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-orange-200 bg-orange-50 text-orange-800'
}

export function NetworkMap({
  nodes,
  edges,
  presets,
  defaultPresetId = presets[0]?.id ?? 'custom',
  typeConfig,
  edgeLabels = {},
  edgeColors = {},
  maxRenderNodes = 2000,
  selectedNodeId: selectedNodeIdProp,
  selectedEdgeId,
  initialSelectedEdgeId = null,
  onNodeSelect,
  onEdgeSelect,
  inspectorLinkLabel = 'Åpne side',
  emptyTitle = 'Ingen nettverksdata',
  emptyMessage = 'Ingen noder eller relasjoner matcher filtrene.',
}: NetworkMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 620 })
  const [activePresetId, setActivePresetId] = useState(defaultPresetId)
  const [search, setSearch] = useState('')
  const [showIsolated, setShowIsolated] = useState(false)
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(selectedNodeIdProp ?? null)
  const selectedEdgeInput = selectedEdgeId === undefined ? initialSelectedEdgeId : selectedEdgeId
  const [selectedEdgeKey, setSelectedEdgeKey] = useState<string | null>(() =>
    resolveNetworkEdgeSelection(edges, selectedEdgeInput),
  )
  const selectedNodeId = selectedNodeIdProp === undefined ? internalSelectedNodeId : selectedNodeIdProp

  const updateSelectedNode = useCallback((nodeId: string | null) => {
    if (selectedNodeIdProp === undefined) setInternalSelectedNodeId(nodeId)
    onNodeSelect?.(nodeId)
    if (nodeId !== null) {
      setSelectedEdgeKey(null)
      onEdgeSelect?.(null)
    }
  }, [selectedNodeIdProp, onNodeSelect, onEdgeSelect])

  const updateSelectedEdge = useCallback((edgeId: string | null) => {
    setSelectedEdgeKey(edgeId)
    onEdgeSelect?.(edgeId)
    if (edgeId !== null) {
      if (selectedNodeIdProp === undefined) setInternalSelectedNodeId(null)
      onNodeSelect?.(null)
    }
  }, [selectedNodeIdProp, onEdgeSelect, onNodeSelect])

  const clearSelection = useCallback(() => {
    if (selectedNodeIdProp === undefined) setInternalSelectedNodeId(null)
    setSelectedEdgeKey(null)
    onNodeSelect?.(null)
    onEdgeSelect?.(null)
  }, [selectedNodeIdProp, onNodeSelect, onEdgeSelect])

  const allNodeTypes = useMemo(() => [...new Set(nodes.map((node) => node.type))].sort(), [nodes])
  const allEdgeTypes = useMemo(() => [...new Set(edges.map((edge) => edge.type))].sort(), [edges])
  const [activeNodeTypes, setActiveNodeTypes] = useState<Set<string>>(() => new Set(nodes.map((node) => node.type)))
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<string>>(() => new Set(edges.map((edge) => edge.type)))

  const activePreset = activePresetId === 'custom'
    ? null
    : presets.find((preset) => preset.id === activePresetId) ?? null

  const view = useMemo(
    () =>
      getNetworkMapView({
        nodes,
        edges,
        preset: activePreset,
        activeNodeTypes,
        activeEdgeTypes,
        showIsolated,
        search,
        selectedNodeId,
        maxNodes: maxRenderNodes,
      }),
    [nodes, edges, activePreset, activeNodeTypes, activeEdgeTypes, showIsolated, search, selectedNodeId, maxRenderNodes],
  )

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: Math.max(620, entry.contentRect.height),
      })
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (selectedEdgeId === undefined) return
    const nextSelection = resolveNetworkEdgeSelection(edges, selectedEdgeId)
    setSelectedEdgeKey(nextSelection)
    if (nextSelection && selectedNodeIdProp === undefined) setInternalSelectedNodeId(null)
  }, [edges, selectedEdgeId, selectedNodeIdProp])

  const graphData = useMemo(() => ({
    nodes: view.nodes.map((node) => ({
      ...node,
      val: typeConfig[node.type]?.size ?? node.val,
    })),
    links: view.edges.map((edge, index) => ({ ...edge, __key: networkEdgeKey(edge, index) })),
  }), [view.nodes, view.edges, typeConfig])

  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) ?? null : null
  const selectedEdge = selectedEdgeKey
    ? graphData.links.find((edge: NetworkEdge & { __key?: string }) => edge.__key === selectedEdgeKey) ?? null
    : null

  const nodeTypeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const node of nodes) counts.set(node.type, (counts.get(node.type) ?? 0) + 1)
    return counts
  }, [nodes])

  const edgeTypeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const edge of edges) counts.set(edge.type, (counts.get(edge.type) ?? 0) + 1)
    return counts
  }, [edges])

  const selectedInbound = useMemo(
    () => selectedNodeId ? view.edges.filter((edge) => networkEndpointId(edge.target) === selectedNodeId) : [],
    [selectedNodeId, view.edges],
  )
  const selectedOutbound = useMemo(
    () => selectedNodeId ? view.edges.filter((edge) => networkEndpointId(edge.source) === selectedNodeId) : [],
    [selectedNodeId, view.edges],
  )

  const setCustomNodeTypes = useCallback((type: string) => {
    setActivePresetId('custom')
    setActiveNodeTypes((previous) => {
      const next = new Set(previous)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const setCustomEdgeTypes = useCallback((type: string) => {
    setActivePresetId('custom')
    setActiveEdgeTypes((previous) => {
      const next = new Set(previous)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const applyPreset = useCallback((preset: NetworkPreset) => {
    setActivePresetId(preset.id)
    clearSelection()
    const { nodeTypes, edgeTypes } = getNetworkPresetTypeSets({ preset, allNodeTypes, allEdgeTypes })
    setActiveNodeTypes(nodeTypes)
    setActiveEdgeTypes(edgeTypes)
    if (typeof preset.showIsolated === 'boolean') setShowIsolated(preset.showIsolated)
  }, [allEdgeTypes, allNodeTypes, clearSelection])

  const focusNode = useCallback((nodeId: string) => {
    updateSelectedNode(nodeId)
    window.setTimeout(() => {
      const node = graphData.nodes.find((item) => item.id === nodeId) as { x?: number; y?: number } | undefined
      if (
        node &&
        typeof node.x === 'number' &&
        typeof node.y === 'number' &&
        graphRef.current
      ) {
        graphRef.current.centerAt(node.x, node.y, 650)
        graphRef.current.zoom(2.35, 650)
      }
    }, 80)
  }, [graphData.nodes, updateSelectedNode])

  const zoomToFit = useCallback(() => {
    graphRef.current?.zoomToFit?.(650, 44)
  }, [])

  const renderEdgeRow = (edge: NetworkEdge, direction: 'in' | 'out', index: number) => {
    const otherId = direction === 'in' ? networkEndpointId(edge.source) : networkEndpointId(edge.target)
    const other = nodeById.get(otherId)
    return (
      <li key={`${direction}-${edge.type}-${otherId}-${index}`} className="rounded-md border border-stone-100 bg-stone-50/70 p-2 text-xs text-stone-600">
        <button
          type="button"
          onClick={() => focusNode(otherId)}
          className="block min-w-0 text-left hover:text-stone-950"
        >
          <span className="font-medium text-stone-800">{other?.label ?? otherId}</span>
          <span className="text-stone-400"> · {edgeLabels[edge.type] ?? edge.label ?? edge.type}</span>
        </button>
        <div className="mt-1 flex flex-wrap gap-1.5">
          <span className={`rounded border px-1.5 py-0.5 text-[10px] ${edgeTone(edge)}`}>
            {edge.evidenceStatus ? evidenceLabel(edge.evidenceStatus) : confidenceLabel(edge.confidence)}
          </span>
          {edge.sourceLabel && (
            <span className="rounded border border-stone-200 bg-white px-1.5 py-0.5 text-[10px] text-stone-500">
              {edge.sourceLabel}
            </span>
          )}
        </div>
      </li>
    )
  }

  if (nodes.length === 0 || edges.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-stone-50 p-6 text-sm text-stone-500">
        <h3 className="font-semibold text-stone-900">{emptyTitle}</h3>
        <p className="mt-1">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
      <aside className="min-w-0 space-y-4 rounded-lg border border-stone-200 bg-stone-50/70 p-3 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Visning</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-md border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                  activePresetId === preset.id
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-300 bg-white text-stone-600 hover:bg-stone-50'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            {activePresetId === 'custom'
              ? 'Egendefinert filter.'
              : activePreset?.description ?? 'Forhåndsdefinert nettverksutsnitt.'}
          </p>
        </div>

        <div>
          <label htmlFor="network-map-search" className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Søk
          </label>
          <input
            id="network-map-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Søk i navn, tag, land eller ledd..."
            className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          {view.searchMatchIds && view.searchMatchIds.size > 0 && (
            <div className="mt-2 space-y-1">
              {view.nodes
                .filter((node) => view.searchMatchIds?.has(node.id))
                .slice(0, 12)
                .map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => focusNode(node.id)}
                    className="flex w-full items-start justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-stone-600 hover:bg-white hover:text-stone-950"
                  >
                    <span className="min-w-0 truncate">{node.label}</span>
                    <span className="shrink-0 text-[10px] text-stone-400">{view.degreeById.get(node.id) ?? 0}</span>
                  </button>
                ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Nodetyper</p>
            <button
              type="button"
              onClick={() => {
                setActivePresetId('custom')
                setShowIsolated((previous) => !previous)
              }}
              className={`rounded border px-2 py-0.5 text-[10px] font-medium transition-colors ${
                showIsolated
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-stone-200 bg-white text-stone-500'
              }`}
            >
              {showIsolated ? 'Med isolerte' : 'Skjuler isolerte'}
            </button>
          </div>
          <div className="mt-2 space-y-1">
            {allNodeTypes.map((type) => {
              const config = typeConfig[type] ?? { label: type, color: '#78716c' }
              const active = activeNodeTypes.has(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCustomNodeTypes(type)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'border-stone-300 bg-white text-stone-700'
                      : 'border-stone-200 bg-stone-100 text-stone-400'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: active ? config.color : '#d6d3d1' }}
                    />
                    <span>{config.label}</span>
                  </span>
                  <span className="tabular-nums text-stone-400">{(nodeTypeCounts.get(type) ?? 0).toLocaleString('no')}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Kanttyper</p>
          <div className="mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
            {allEdgeTypes.map((type) => {
              const active = activeEdgeTypes.has(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCustomEdgeTypes(type)}
                  className={`rounded border px-2 py-0.5 text-[11px] font-medium transition-all ${
                    active
                      ? 'border-stone-300 bg-white text-stone-600'
                      : 'border-stone-200 bg-stone-100 text-stone-400 line-through'
                  }`}
                  title={`${edgeTypeCounts.get(type) ?? 0} kanter`}
                >
                  {edgeLabels[type] ?? type} ({edgeTypeCounts.get(type) ?? 0})
                </button>
              )
            })}
          </div>
        </div>
      </aside>

      <section className="min-w-0 rounded-lg border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-3 py-2">
          <div className="flex flex-wrap gap-3 text-xs text-stone-500">
            <span><strong className="text-stone-900">{view.nodes.length.toLocaleString('no')}</strong> noder</span>
            {view.limitedFromCount > 0 && <span>av {view.limitedFromCount.toLocaleString('no')} etter filter</span>}
            <span><strong className="text-stone-900">{view.edges.length.toLocaleString('no')}</strong> kanter</span>
            {view.hiddenIsolatedCount > 0 && <span>{view.hiddenIsolatedCount.toLocaleString('no')} isolerte skjult</span>}
            {view.searchMatchIds && <span>{view.searchMatchIds.size.toLocaleString('no')} søketreff</span>}
          </div>
          <button
            type="button"
            onClick={zoomToFit}
            className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            Tilpass
          </button>
        </div>

        <div
          ref={containerRef}
          className="h-[620px] overflow-hidden bg-stone-50 xl:h-[calc(100vh-14rem)] xl:min-h-[640px] xl:max-h-[900px]"
        >
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeLabel={(node: any) => node.label}
            linkLabel={(link: any) => link.label ?? edgeLabels[link.type] ?? link.type}
            nodeColor={(node: any) => {
              if (view.searchMatchIds) return view.searchMatchIds.has(node.id) ? HIGHLIGHT_COLOR : DIM_NODE_COLOR
              if (view.selectedConnectedIds && !view.selectedConnectedIds.has(node.id)) return DIM_NODE_COLOR
              return typeConfig[node.type]?.color ?? '#78716c'
            }}
            nodeVal={(node: any) => node.val}
            linkColor={(link: any) => {
              if (selectedEdgeKey && link.__key === selectedEdgeKey) return HIGHLIGHT_COLOR
              if (view.searchMatchIds) {
                const src = networkEndpointId(link.source)
                const tgt = networkEndpointId(link.target)
                if (!view.searchMatchIds.has(src) && !view.searchMatchIds.has(tgt)) return DIM_EDGE_COLOR
              }
              if (view.selectedConnectedIds) {
                const src = networkEndpointId(link.source)
                const tgt = networkEndpointId(link.target)
                if (!view.selectedConnectedIds.has(src) || !view.selectedConnectedIds.has(tgt)) return DIM_EDGE_COLOR
              }
              if (edgeColors[link.type]) return edgeColors[link.type]
              if (typeof link.confidence !== 'number') return BASE_EDGE_COLOR
              if (link.confidence >= 0.9) return '#57534e'
              if (link.confidence >= 0.6) return '#78716c'
              return '#a8a29e'
            }}
            linkWidth={(link: any) => {
              if (selectedEdgeKey && link.__key === selectedEdgeKey) return 3
              if (typeof link.confidence !== 'number') return 0.8
              if (link.confidence >= 0.9) return 2.2
              if (link.confidence >= 0.6) return 1.4
              return 0.9
            }}
            linkDirectionalArrowLength={3}
            linkDirectionalArrowRelPos={1}
            linkLineDash={(link: any) =>
              typeof link.confidence === 'number' ? null : [2, 2]
            }
            backgroundColor="#f7f7f4"
            cooldownTicks={100}
            onNodeClick={(node: any) => {
              if (node.id === selectedNodeId) updateSelectedNode(null)
              else focusNode(node.id)
            }}
            onLinkClick={(link: any) => {
              updateSelectedEdge(link.__key)
            }}
            onBackgroundClick={() => {
              clearSelection()
            }}
            minZoom={0.35}
            maxZoom={6}
            nodeCanvasObjectMode={() => 'after'}
            nodeCanvasObject={(node: any, ctx, globalScale) => {
              const rawLabel = (node.label ?? '') as string
              const degree = node.degree ?? 0
              const isHit = !!view.searchMatchIds && view.searchMatchIds.has(node.id)
              const isSelected = node.id === selectedNodeId
              const isNeighbor = !!view.selectedConnectedIds && view.selectedConnectedIds.has(node.id)
              const shouldLabel = isHit || isSelected || (view.selectedConnectedIds ? isNeighbor : degree >= 4 || globalScale > 1.35)
              if (!shouldLabel) return
              const labelMax = isSelected || isHit ? 34 : 22
              const label = rawLabel.length > labelMax ? `${rawLabel.slice(0, labelMax)}...` : rawLabel
              const dimmed = view.selectedConnectedIds && !view.selectedConnectedIds.has(node.id)
              const fontSize = Math.max(2.7, 4 / globalScale)
              ctx.font = `${isHit || isSelected ? 'bold ' : ''}${fontSize}px sans-serif`
              ctx.textAlign = 'center'
              ctx.fillStyle = dimmed ? '#d6d3d1' : isHit ? '#b45309' : '#57534e'
              ctx.fillText(label, node.x, node.y + 6)
            }}
          />
        </div>
      </section>

      <aside className="min-w-0 rounded-lg border border-stone-200 bg-stone-50/70 p-3 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
        {selectedEdge ? (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Kant</p>
            <h3 className="mt-2 text-sm font-semibold text-stone-900">
              {edgeLabels[selectedEdge.type] ?? selectedEdge.label ?? selectedEdge.type}
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className={`rounded border px-1.5 py-0.5 text-[10px] ${edgeTone(selectedEdge)}`}>
                {selectedEdge.evidenceStatus ? evidenceLabel(selectedEdge.evidenceStatus) : confidenceLabel(selectedEdge.confidence)}
              </span>
              {selectedEdge.sourceLabel && (
                <span className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] text-stone-500">
                  {selectedEdge.sourceLabel}
                </span>
              )}
            </div>
            {selectedEdge.description && <p className="mt-3 text-xs leading-5 text-stone-600">{selectedEdge.description}</p>}
            {selectedEdge.href && (
              <a href={selectedEdge.href} className="mt-3 inline-block text-xs font-medium text-emerald-700 hover:text-emerald-800">
                Åpne relasjon
              </a>
            )}
          </div>
        ) : selectedNode ? (
          <div className="rounded-lg border border-stone-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: typeConfig[selectedNode.type]?.color ?? '#78716c' }}
                  />
                  <h3 className="truncate text-sm font-semibold text-stone-900">{selectedNode.label}</h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                  <span>{typeConfig[selectedNode.type]?.label ?? selectedNode.type}</span>
                  <span>{(view.degreeById.get(selectedNode.id) ?? 0).toLocaleString('no')} koblinger</span>
                  {selectedNode.country && <span>{selectedNode.country}</span>}
                  {(selectedNode.stage ?? selectedNode.valueChainStage) && <span>{selectedNode.stage ?? selectedNode.valueChainStage}</span>}
                </div>
              </div>
              {selectedNode.href && (
                <a href={selectedNode.href} className="text-xs font-medium text-stone-700 hover:text-emerald-700">
                  {inspectorLinkLabel}
                </a>
              )}
            </div>

            {selectedNode.tags && selectedNode.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {selectedNode.tags.slice(0, 6).map((tag) => (
                  <span key={tag} className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">{tag}</span>
                ))}
              </div>
            )}

            {selectedNode.metrics && selectedNode.metrics.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {selectedNode.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-md border border-stone-200 bg-stone-50 p-2">
                    <p className="text-[10px] uppercase tracking-wider text-stone-400">{metric.label}</p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900">{metric.value}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-stone-400">Innkommende ({selectedInbound.length})</p>
                {selectedInbound.length > 0 ? (
                  <ul className="max-h-56 space-y-2 overflow-y-auto">
                    {selectedInbound.slice(0, 24).map((edge, index) => renderEdgeRow(edge, 'in', index))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400">Ingen synlige innkommende kanter.</p>
                )}
              </div>
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-wider text-stone-400">Utgående ({selectedOutbound.length})</p>
                {selectedOutbound.length > 0 ? (
                  <ul className="max-h-56 space-y-2 overflow-y-auto">
                    {selectedOutbound.slice(0, 24).map((edge, index) => renderEdgeRow(edge, 'out', index))}
                  </ul>
                ) : (
                  <p className="text-xs text-stone-400">Ingen synlige utgående kanter.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Inspektør</p>
              <h3 className="mt-2 text-sm font-semibold text-stone-900">Velg en node eller kant</h3>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                Klikk i kartet for nabolag, kilde, konfidens og lenke til riktig side.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Mest koblet</p>
              <div className="mt-2 space-y-1">
                {view.topConnectedNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => focusNode(node.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  >
                    <span className="min-w-0 truncate">{node.label}</span>
                    <span className="shrink-0 text-[10px] text-stone-400">{view.degreeById.get(node.id) ?? 0}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  )
}
