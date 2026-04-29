'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

type GraphNode = {
  id: string
  label: string
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source' | 'actor' | 'person' | 'property'
  tags?: string[]
  href?: string
}

type GraphEdge = {
  source: string
  target: string
  type: string
  confidence?: number
  sourceLabel?: string
}

type Props = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const NODE_COLORS: Record<string, string> = {
  document: '#059669',
  insight: '#2563eb',
  thesis: '#7c3aed',
  company: '#e11d48',
  source: '#d97706',
  actor: '#0f766e',
  person: '#6d28d9',
  property: '#ca8a04',
}

const NODE_SIZES: Record<string, number> = {
  document: 6,
  insight: 5,
  thesis: 5,
  company: 7,
  source: 4,
  actor: 6,
  person: 6,
  property: 4,
}

const HIGHLIGHT_COLOR = '#f59e0b'
const DIM_NODE_COLOR = '#e7e5e4'
const DIM_EDGE_COLOR = '#f5f5f4'
const BASE_EDGE_COLOR = '#e7e5e4'
const MAX_RENDER_NODES = 2000
const DEFAULT_NODE_TYPES = ['document', 'insight', 'thesis', 'company', 'source', 'actor', 'person', 'property']

type GraphPreset = {
  id: string
  label: string
  nodeTypes: string[]
  edgeTypes?: string[]
  showIsolated: boolean
}

const GRAPH_PRESETS: GraphPreset[] = [
  { id: 'connected', label: 'Koblet', nodeTypes: DEFAULT_NODE_TYPES, showIsolated: false },
  { id: 'evidence', label: 'Dokument/innsikt', nodeTypes: ['document', 'insight', 'thesis', 'source'], showIsolated: false },
  { id: 'company', label: 'Selskap/eierskap', nodeTypes: ['company', 'person', 'property', 'actor'], showIsolated: false },
  { id: 'actors', label: 'Aktør', nodeTypes: ['actor', 'company', 'document'], showIsolated: false },
  {
    id: 'supply',
    label: 'Forsyning',
    nodeTypes: ['company', 'property'],
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture', 'owns-property', 'leases-property'],
    showIsolated: false,
  },
  { id: 'all', label: 'Alle', nodeTypes: DEFAULT_NODE_TYPES, showIsolated: true },
]

function edgeEndpointId(endpoint: unknown): string {
  if (typeof endpoint === 'string') return endpoint
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) {
    const id = (endpoint as { id: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

export function KnowledgeGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(DEFAULT_NODE_TYPES)
  )
  const [search, setSearch] = useState('')
  const [showIsolated, setShowIsolated] = useState(false)
  const [activePreset, setActivePreset] = useState('connected')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  const allEdgeTypes = useMemo(() => {
    const set = new Set<string>()
    for (const e of edges) set.add(e.type)
    return [...set].sort()
  }, [edges])

  // Lazy init so we don't need a setState-in-effect. Edges are server-rendered
  // and stable per page load, so this is sufficient.
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<Set<string>>(() => {
    const set = new Set<string>()
    for (const e of edges) set.add(e.type)
    return set
  })

  const nodeById = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])

  useEffect(() => {
    if (!containerRef.current) return
    const obs = new ResizeObserver(([entry]) => {
      setDimensions({
        width: entry.contentRect.width,
        height: Math.max(500, entry.contentRect.height),
      })
    })
    obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  const toggleType = useCallback((type: string) => {
    setActivePreset('custom')
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleEdgeType = useCallback((type: string) => {
    setActivePreset('custom')
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const applyPreset = useCallback((preset: GraphPreset) => {
    setActivePreset(preset.id)
    setShowIsolated(preset.showIsolated)
    setActiveTypes(new Set(preset.nodeTypes))
    setActiveEdgeTypes(new Set(preset.edgeTypes ?? allEdgeTypes))
    setSelectedNodeId(null)
  }, [allEdgeTypes])

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const n of nodes) counts.set(n.type, (counts.get(n.type) ?? 0) + 1)
    return counts
  }, [nodes])

  const edgeTypeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of edges) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
    return counts
  }, [edges])

  const typeFilteredNodes = useMemo(
    () => nodes.filter(n => activeTypes.has(n.type)),
    [nodes, activeTypes]
  )

  const typeFilteredNodeIds = useMemo(
    () => new Set(typeFilteredNodes.map(n => n.id)),
    [typeFilteredNodes]
  )

  const typeAndEdgeFilteredEdges = useMemo(() => edges.filter((e) => {
    const src = edgeEndpointId(e.source)
    const tgt = edgeEndpointId(e.target)
    return typeFilteredNodeIds.has(src) && typeFilteredNodeIds.has(tgt) && activeEdgeTypes.has(e.type)
  }), [edges, typeFilteredNodeIds, activeEdgeTypes])

  const degreeById = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of typeAndEdgeFilteredEdges) {
      const src = edgeEndpointId(e.source)
      const tgt = edgeEndpointId(e.target)
      counts.set(src, (counts.get(src) ?? 0) + 1)
      counts.set(tgt, (counts.get(tgt) ?? 0) + 1)
    }
    return counts
  }, [typeAndEdgeFilteredEdges])

  const candidateNodes = useMemo(
    () => showIsolated ? typeFilteredNodes : typeFilteredNodes.filter(n => (degreeById.get(n.id) ?? 0) > 0),
    [showIsolated, typeFilteredNodes, degreeById]
  )

  const normalizedSearch = search.trim().toLowerCase()
  const searchMatches = useMemo(() => {
    if (!normalizedSearch) return null
    const ids = new Set<string>()
    for (const n of candidateNodes) {
      if (n.label.toLowerCase().includes(normalizedSearch)) ids.add(n.id)
    }
    return ids
  }, [candidateNodes, normalizedSearch])

  const limitedNodes = useMemo(() => {
    if (candidateNodes.length <= MAX_RENDER_NODES) return candidateNodes

    const keep = new Map<string, GraphNode>()
    const add = (node: GraphNode | undefined) => {
      if (!node || keep.size >= MAX_RENDER_NODES) return
      keep.set(node.id, node)
    }

    add(selectedNodeId ? candidateNodes.find(n => n.id === selectedNodeId) : undefined)
    if (searchMatches) {
      for (const node of candidateNodes) {
        if (searchMatches.has(node.id)) add(node)
      }
    }

    const ranked = [...candidateNodes].sort((a, b) => {
      const degreeDiff = (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0)
      if (degreeDiff !== 0) return degreeDiff
      return a.label.localeCompare(b.label, 'no')
    })

    for (const node of ranked) add(node)
    return [...keep.values()]
  }, [candidateNodes, degreeById, searchMatches, selectedNodeId])

  const limitedNodeIds = useMemo(
    () => new Set(limitedNodes.map(n => n.id)),
    [limitedNodes]
  )

  const filteredEdges = useMemo(() => typeAndEdgeFilteredEdges.filter((e) => {
    const src = edgeEndpointId(e.source)
    const tgt = edgeEndpointId(e.target)
    return limitedNodeIds.has(src) && limitedNodeIds.has(tgt)
  }), [typeAndEdgeFilteredEdges, limitedNodeIds])

  const graphData = useMemo(() => ({
    nodes: limitedNodes.map(n => ({
      ...n,
      val: Math.max(NODE_SIZES[n.type] ?? 5, Math.min(16, (degreeById.get(n.id) ?? 1) + 3)),
    })),
    links: filteredEdges.map(e => ({ ...e })),
  }), [limitedNodes, filteredEdges, degreeById])

  const selectedNode = selectedNodeId ? nodeById.get(selectedNodeId) ?? null : null
  const selectedInbound = useMemo(
    () => selectedNodeId ? typeAndEdgeFilteredEdges.filter(e => edgeEndpointId(e.target) === selectedNodeId) : [],
    [selectedNodeId, typeAndEdgeFilteredEdges]
  )
  const selectedOutbound = useMemo(
    () => selectedNodeId ? typeAndEdgeFilteredEdges.filter(e => edgeEndpointId(e.source) === selectedNodeId) : [],
    [selectedNodeId, typeAndEdgeFilteredEdges]
  )
  const selectedConnectedIds = useMemo(() => {
    if (!selectedNodeId) return null
    const ids = new Set<string>([selectedNodeId])
    for (const e of typeAndEdgeFilteredEdges) {
      const src = edgeEndpointId(e.source)
      const tgt = edgeEndpointId(e.target)
      if (src === selectedNodeId) ids.add(tgt)
      if (tgt === selectedNodeId) ids.add(src)
    }
    return ids
  }, [selectedNodeId, typeAndEdgeFilteredEdges])

  const toggleShowIsolated = useCallback(() => {
    setActivePreset('custom')
    setShowIsolated(prev => !prev)
  }, [])

  const renderEdgeRow = (edge: GraphEdge, direction: 'in' | 'out', index: number) => {
    const otherId = direction === 'in' ? edgeEndpointId(edge.source) : edgeEndpointId(edge.target)
    const other = nodeById.get(otherId)
    return (
      <li key={`${direction}-${edge.type}-${otherId}-${index}`} className="text-xs text-stone-600">
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0">
            <span className="font-medium text-stone-800">{other?.label ?? otherId}</span>
            <span className="text-stone-400"> · {edge.type}</span>
          </span>
          {typeof edge.confidence === 'number' && (
            <span className="text-[10px] text-stone-400 tabular-nums shrink-0">
              {Math.round(edge.confidence * 100)}%
            </span>
          )}
        </div>
        {edge.sourceLabel && <div className="text-[10px] text-stone-400 truncate">{edge.sourceLabel}</div>}
      </li>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Visning</p>
          <div className="flex flex-wrap gap-1.5">
            {GRAPH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                  activePreset === preset.id
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {preset.label}
              </button>
            ))}
            {activePreset === 'custom' && (
              <span className="px-2.5 py-1 rounded text-[11px] font-medium border border-amber-200 bg-amber-50 text-amber-700">
                Egendefinert
              </span>
            )}
            <button
              onClick={toggleShowIsolated}
              className={`px-2.5 py-1 rounded text-[11px] font-medium border transition-colors ${
                showIsolated
                  ? 'bg-white border-stone-300 text-stone-600'
                  : 'bg-stone-100 border-stone-200 text-stone-400 line-through'
              }`}
            >
              Isolerte noder
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i noder (navn, tittel)…"
            className="flex-1 min-w-[220px] max-w-md px-3 py-1.5 text-sm border border-stone-300 rounded-md bg-white text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          {searchMatches && (
            <span className="text-xs text-stone-500">
              {searchMatches.size} treff
            </span>
          )}
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Nodetyper</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(NODE_COLORS).map(([type, color]) => {
              const count = typeCounts.get(type) ?? 0
              if (count === 0) return null
              return (
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
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: activeTypes.has(type) ? color : '#d6d3d1' }}
                  />
                  {type} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {allEdgeTypes.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-1">Kanttyper</p>
            <div className="flex flex-wrap gap-1.5">
              {allEdgeTypes.map((type) => {
                const active = activeEdgeTypes.has(type)
                const count = edgeTypeCounts.get(type) ?? 0
                return (
                  <button
                    key={type}
                    onClick={() => toggleEdgeType(type)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-all ${
                      active
                        ? 'bg-white border-stone-300 text-stone-600'
                        : 'bg-stone-100 border-stone-200 text-stone-400 line-through'
                    }`}
                    title={`${count} kanter av typen ${type}`}
                  >
                    {type} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500">
          <span className="uppercase tracking-wider text-stone-400 text-[10px]">Konfidens</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[3px] w-6 bg-stone-600 rounded" />
            primær (≥ 0.9)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[2px] w-6 bg-stone-500 rounded opacity-70" />
            sekundær (0.6–0.9)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[1px] w-6 bg-stone-400 rounded opacity-40" />
            utledet (&lt; 0.6)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-[1px] w-6 bg-stone-300 rounded border-t border-dashed border-stone-400" />
            ukjent
          </span>
        </div>
      </div>

      <div ref={containerRef} className="rounded-xl border border-stone-200 bg-white overflow-hidden" style={{ height: 500 }}>
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => node.label}
          nodeColor={(node: any) => {
            if (searchMatches) {
              return searchMatches.has(node.id)
                ? HIGHLIGHT_COLOR
                : DIM_NODE_COLOR
            }
            if (selectedConnectedIds && !selectedConnectedIds.has(node.id)) return DIM_NODE_COLOR
            return NODE_COLORS[node.type] ?? '#78716c'
          }}
          nodeVal={(node: any) => node.val}
          linkColor={(link: any) => {
            if (searchMatches) {
              const src = edgeEndpointId(link.source)
              const tgt = edgeEndpointId(link.target)
              const touches = searchMatches.has(src) || searchMatches.has(tgt)
              if (!touches) return DIM_EDGE_COLOR
            }
            if (selectedConnectedIds) {
              const src = edgeEndpointId(link.source)
              const tgt = edgeEndpointId(link.target)
              const touches = selectedConnectedIds.has(src) && selectedConnectedIds.has(tgt)
              if (!touches) return DIM_EDGE_COLOR
            }
            if (typeof link.confidence !== 'number') return BASE_EDGE_COLOR
            if (link.confidence >= 0.9) return '#57534e'
            if (link.confidence >= 0.6) return '#78716c'
            return '#a8a29e'
          }}
          linkWidth={(link: any) => {
            if (typeof link.confidence !== 'number') return 0.6
            if (link.confidence >= 0.9) return 2.2
            if (link.confidence >= 0.6) return 1.4
            return 0.9
          }}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          linkLineDash={(link: any) =>
            typeof link.confidence === 'number' ? null : [2, 2]
          }
          backgroundColor="#fafaf9"
          cooldownTicks={100}
          onNodeClick={(node: any) => setSelectedNodeId(node.id === selectedNodeId ? null : node.id)}
          onBackgroundClick={() => setSelectedNodeId(null)}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx) => {
            const rawLabel = (node.label ?? '') as string
            const label = rawLabel.length > 20 ? rawLabel.slice(0, 20) + '...' : rawLabel
            const isHit = !!searchMatches && searchMatches.has(node.id)
            const dimmed = selectedConnectedIds && !selectedConnectedIds.has(node.id)
            ctx.font = isHit ? 'bold 3.4px sans-serif' : '3px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = dimmed ? '#d6d3d1' : isHit ? '#b45309' : '#57534e'
            ctx.fillText(label, node.x, node.y + 6)
          }}
        />
      </div>

      {selectedNode && (
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: NODE_COLORS[selectedNode.type] ?? '#78716c' }}
                />
                <h3 className="text-sm font-semibold text-stone-900 truncate">{selectedNode.label}</h3>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-stone-400">
                <span>{selectedNode.type}</span>
                <span>{(degreeById.get(selectedNode.id) ?? 0).toLocaleString('no')} koblinger</span>
                {selectedNode.tags?.slice(0, 4).map(tag => (
                  <span key={tag} className="rounded bg-stone-100 px-1.5 py-0.5 text-stone-500">{tag}</span>
                ))}
              </div>
            </div>
            {selectedNode.href && (
              <a
                href={selectedNode.href}
                className="text-xs font-medium text-stone-700 hover:text-emerald-700"
              >
                Åpne side
              </a>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Innkommende ({selectedInbound.length})</p>
              {selectedInbound.length > 0 ? (
                <ul className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedInbound.slice(0, 30).map((edge, index) => renderEdgeRow(edge, 'in', index))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400">Ingen synlige innkommende kanter.</p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Utgående ({selectedOutbound.length})</p>
              {selectedOutbound.length > 0 ? (
                <ul className="space-y-2 max-h-44 overflow-y-auto">
                  {selectedOutbound.slice(0, 30).map((edge, index) => renderEdgeRow(edge, 'out', index))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400">Ingen synlige utgående kanter.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-xs text-stone-400 px-1">
        <span>{limitedNodes.length} noder</span>
        {candidateNodes.length !== limitedNodes.length && <span>av {candidateNodes.length} etter filter</span>}
        <span>{filteredEdges.length} kanter</span>
        {searchMatches && <span>{searchMatches.size} søketreff</span>}
      </div>
    </div>
  )
}
