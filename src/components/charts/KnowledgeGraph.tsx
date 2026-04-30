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
  href?: string
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

const NODE_LABELS: Record<string, string> = {
  document: 'Dokument',
  insight: 'Innsikt',
  thesis: 'Akademia',
  company: 'Selskap',
  source: 'Kilde',
  actor: 'Aktør',
  person: 'Person',
  property: 'Eiendom',
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
  description: string
  nodeTypes: string[]
  edgeTypes?: string[]
  showIsolated: boolean
  matchRules?: GraphPresetMatchRule[]
  includeMatchedNeighbors?: boolean
}

type GraphPresetMatchRule = {
  field: 'label' | 'tag' | 'href'
  mode: 'exact' | 'includes'
  values: string[]
}

const FOOD_TG_MATCH_RULES: GraphPresetMatchRule[] = [
  {
    field: 'tag',
    mode: 'exact',
    values: [
      'food-tg',
      'food tg',
      'nch',
      'nch-contract',
      'mandat',
      'mandate',
      'transition-group',
      'transition-groups',
    ],
  },
  {
    field: 'href',
    mode: 'includes',
    values: [
      'food-tg',
      'nch-contract',
      'transition-group',
      'transition-groups',
      'root-9-mars-2026-food',
      'root-2026-transition-group',
      'mandate-for-transition-group-food',
    ],
  },
  {
    field: 'label',
    mode: 'includes',
    values: [
      'food tg',
      'food systems transition group',
      'circular food transition group',
      'transition group food',
      'transition group overview',
      'transition groups',
      'nch transition',
    ],
  },
]

const GRAPH_PRESETS: GraphPreset[] = [
  { id: 'connected', label: 'Koblet', description: 'Alt som faktisk har minst én synlig relasjon.', nodeTypes: DEFAULT_NODE_TYPES, showIsolated: false },
  { id: 'evidence', label: 'Dokument/innsikt', description: 'Kilde-, dokument- og innsiktsnabolag.', nodeTypes: ['document', 'insight', 'thesis', 'source'], showIsolated: false },
  { id: 'company', label: 'Selskap/eierskap', description: 'Selskap, personer, aktører og eiendommer.', nodeTypes: ['company', 'person', 'property', 'actor'], showIsolated: false },
  { id: 'actors', label: 'Aktør', description: 'Aktører, selskapskoblinger og dokumentgrunnlag.', nodeTypes: ['actor', 'company', 'document'], showIsolated: false },
  {
    id: 'supply',
    label: 'Forsyning',
    description: 'Forretningsrelasjoner, eiendom og forsyningsroller.',
    nodeTypes: ['company', 'property'],
    edgeTypes: ['supplier', 'buyer', 'distributor', 'franchisor', 'self-dealing', 'joint-venture', 'owns-property', 'leases-property'],
    showIsolated: false,
  },
  {
    id: 'food-tg',
    label: 'Food TG',
    description: 'Regelbasert Food TG-nabolag: eksplisitte tag-, rute- og tittelsignaler pluss direkte naboer.',
    nodeTypes: DEFAULT_NODE_TYPES,
    edgeTypes: ['insight-ref', 'actor-ref', 'company-ref', 'supports', 'references', 'cites'],
    showIsolated: false,
    matchRules: FOOD_TG_MATCH_RULES,
    includeMatchedNeighbors: true,
  },
  { id: 'all', label: 'Alle koblede', description: 'Alle nodetyper som har minst én relasjon i grafdatasettet.', nodeTypes: DEFAULT_NODE_TYPES, showIsolated: true },
]

function edgeEndpointId(endpoint: unknown): string {
  if (typeof endpoint === 'string') return endpoint
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) {
    const id = (endpoint as { id: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

function normalizeSignal(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function nodeMatchesRule(node: GraphNode, rule: GraphPresetMatchRule): boolean {
  const values =
    rule.field === 'tag'
      ? (node.tags ?? [])
      : rule.field === 'href'
        ? [node.href ?? '']
        : [node.label]

  const normalizedNeedles = rule.values.map(normalizeSignal)
  return values.some((value) => {
    const normalizedValue = normalizeSignal(value)
    if (!normalizedValue) return false
    if (rule.mode === 'exact') return normalizedNeedles.includes(normalizedValue)
    return normalizedNeedles.some((needle) => normalizedValue.includes(needle))
  })
}

function nodeMatchesPresetRules(node: GraphNode, rules: GraphPresetMatchRule[]): boolean {
  return rules.some((rule) => nodeMatchesRule(node, rule))
}

export function KnowledgeGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<any>(null)
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

  const activePresetDetails = GRAPH_PRESETS.find((preset) => preset.id === activePreset)

  const presetFilteredNodeIds = useMemo(() => {
    const rules = activePresetDetails?.matchRules
    if (!rules || rules.length === 0) return null

    const ids = new Set<string>()
    for (const node of typeFilteredNodes) {
      if (nodeMatchesPresetRules(node, rules)) ids.add(node.id)
    }

    if (activePresetDetails?.includeMatchedNeighbors) {
      for (const edge of typeAndEdgeFilteredEdges) {
        const src = edgeEndpointId(edge.source)
        const tgt = edgeEndpointId(edge.target)
        if (ids.has(src)) ids.add(tgt)
        if (ids.has(tgt)) ids.add(src)
      }
    }

    return ids
  }, [activePresetDetails, typeFilteredNodes, typeAndEdgeFilteredEdges])

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

  const candidateNodes = useMemo(() => {
    const presetNodes = presetFilteredNodeIds
      ? typeFilteredNodes.filter(n => presetFilteredNodeIds.has(n.id))
      : typeFilteredNodes

    return showIsolated ? presetNodes : presetNodes.filter(n => (degreeById.get(n.id) ?? 0) > 0)
  }, [showIsolated, typeFilteredNodes, degreeById, presetFilteredNodeIds])

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
      degree: degreeById.get(n.id) ?? 0,
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

  const searchResults = useMemo(() => {
    if (!searchMatches) return []
    return candidateNodes
      .filter((node) => searchMatches.has(node.id))
      .sort((a, b) => {
        const degreeDiff = (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0)
        if (degreeDiff !== 0) return degreeDiff
        return a.label.localeCompare(b.label, 'no')
      })
      .slice(0, 12)
  }, [candidateNodes, degreeById, searchMatches])

  const topConnectedNodes = useMemo(
    () =>
      [...candidateNodes]
        .sort((a, b) => (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0))
        .slice(0, 8),
    [candidateNodes, degreeById],
  )

  const focusNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId)
    window.setTimeout(() => {
      const node = graphData.nodes.find((n) => n.id === nodeId) as { x?: number; y?: number } | undefined
      if (
        node &&
        typeof node.x === 'number' &&
        typeof node.y === 'number' &&
        graphRef.current
      ) {
        graphRef.current.centerAt(node.x, node.y, 650)
        graphRef.current.zoom(2.4, 650)
      }
    }, 80)
  }, [graphData.nodes])

  const zoomToFit = useCallback(() => {
    graphRef.current?.zoomToFit?.(650, 40)
  }, [])

  const renderEdgeRow = (edge: GraphEdge, direction: 'in' | 'out', index: number) => {
    const otherId = direction === 'in' ? edgeEndpointId(edge.source) : edgeEndpointId(edge.target)
    const other = nodeById.get(otherId)
    return (
      <li key={`${direction}-${edge.type}-${otherId}-${index}`} className="rounded-md border border-stone-100 bg-stone-50/70 p-2 text-xs text-stone-600">
        <div className="flex items-start justify-between gap-2">
          <button
            type="button"
            onClick={() => focusNode(otherId)}
            className="min-w-0 text-left hover:text-stone-950"
          >
            <span className="font-medium text-stone-800">{other?.label ?? otherId}</span>
            <span className="text-stone-400"> · {edge.type}</span>
          </button>
          {typeof edge.confidence === 'number' && (
            <span className="text-[10px] text-stone-400 tabular-nums shrink-0">
              {Math.round(edge.confidence * 100)}%
            </span>
          )}
        </div>
        {edge.sourceLabel && <div className="text-[10px] text-stone-400 truncate">{edge.sourceLabel}</div>}
        {edge.href && (
          <a href={edge.href} className="mt-1 inline-block text-[11px] font-medium text-emerald-700 hover:text-emerald-800">
            Åpne relasjon i forsyningskjeden
          </a>
        )}
      </li>
    )
  }

  return (
    <div className="grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)_340px]">
      <aside className="min-w-0 space-y-4 rounded-lg border border-stone-200 bg-stone-50/70 p-3 xl:max-h-[calc(100vh-11rem)] xl:overflow-y-auto">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Visning</p>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {GRAPH_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset)}
                className={`rounded-md border px-2.5 py-2 text-left text-[11px] font-medium transition-colors ${
                  activePreset === preset.id
                    ? 'bg-stone-900 border-stone-900 text-white'
                    : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-stone-500">
            {activePreset === 'custom' ? 'Egendefinert filter.' : activePresetDetails?.description}
          </p>
        </div>

        <div>
          <label htmlFor="knowledge-graph-search" className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            Søk
          </label>
          <input
            id="knowledge-graph-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Søk i noder (navn, tittel)…"
            className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-500"
          />
          {searchMatches && searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => focusNode(node.id)}
                  className="flex w-full items-start justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-stone-600 hover:bg-white hover:text-stone-950"
                >
                  <span className="min-w-0 truncate">{node.label}</span>
                  <span className="shrink-0 text-[10px] text-stone-400">{degreeById.get(node.id) ?? 0}</span>
                </button>
              ))}
              {searchMatches.size > searchResults.length && (
                <p className="px-2 text-[11px] text-stone-400">
                  {searchMatches.size - searchResults.length} flere treff i grafen.
                </p>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Nodetyper</p>
            <button
              type="button"
              onClick={toggleShowIsolated}
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
            {Object.entries(NODE_COLORS).map(([type, color]) => {
              const count = typeCounts.get(type) ?? 0
              if (count === 0) return null
              return (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`flex w-full items-center justify-between gap-2 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-all ${
                    activeTypes.has(type)
                      ? 'bg-white border-stone-300 text-stone-700'
                      : 'bg-stone-100 border-stone-200 text-stone-400'
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: activeTypes.has(type) ? color : '#d6d3d1' }}
                    />
                    <span>{NODE_LABELS[type] ?? type}</span>
                  </span>
                  <span className="tabular-nums text-stone-400">{count.toLocaleString('no')}</span>
                </button>
              )
            })}
          </div>
        </div>

        {allEdgeTypes.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Kanttyper</p>
            <div className="mt-2 flex max-h-56 flex-wrap gap-1.5 overflow-y-auto pr-1">
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

        <div className="rounded-md border border-stone-200 bg-white p-3 text-[11px] text-stone-500">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-stone-400">Konfidens</p>
          <div className="space-y-1.5">
            <span className="flex items-center gap-2">
              <span className="inline-block h-[3px] w-7 rounded bg-stone-600" />
              primær (≥ 0.9)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-[2px] w-7 rounded bg-stone-500 opacity-70" />
              sekundær (0.6–0.9)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-[1px] w-7 rounded bg-stone-400 opacity-40" />
              utledet (&lt; 0.6)
            </span>
            <span className="flex items-center gap-2">
              <span className="inline-block h-[1px] w-7 rounded border-t border-dashed border-stone-400 bg-stone-300" />
              ukjent
            </span>
          </div>
        </div>
      </aside>

      <section className="min-w-0 rounded-lg border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 px-3 py-2">
          <div className="flex flex-wrap gap-3 text-xs text-stone-500">
            <span><strong className="text-stone-900">{limitedNodes.length.toLocaleString('no')}</strong> noder</span>
            {candidateNodes.length !== limitedNodes.length && <span>av {candidateNodes.length.toLocaleString('no')} etter filter</span>}
            <span><strong className="text-stone-900">{filteredEdges.length.toLocaleString('no')}</strong> kanter</span>
            {!showIsolated && (
              <span>{(typeFilteredNodes.length - candidateNodes.length).toLocaleString('no')} isolerte skjult</span>
            )}
            {searchMatches && <span>{searchMatches.size.toLocaleString('no')} søketreff</span>}
          </div>
          <button
            type="button"
            onClick={zoomToFit}
            className="rounded-md border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-medium text-stone-600 hover:bg-stone-100"
          >
            Tilpass
          </button>
        </div>

        <div ref={containerRef} className="h-[620px] overflow-hidden bg-stone-50 xl:h-[calc(100vh-14rem)] xl:min-h-[640px] xl:max-h-[900px]">
        <ForceGraph2D
          ref={graphRef}
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
          backgroundColor="#f7f7f4"
          cooldownTicks={100}
          onNodeClick={(node: any) => {
            if (node.id === selectedNodeId) setSelectedNodeId(null)
            else focusNode(node.id)
          }}
          onBackgroundClick={() => setSelectedNodeId(null)}
          minZoom={0.35}
          maxZoom={6}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const rawLabel = (node.label ?? '') as string
            const degree = node.degree ?? 0
            const isHit = !!searchMatches && searchMatches.has(node.id)
            const isSelected = node.id === selectedNodeId
            const isNeighbor = !!selectedConnectedIds && selectedConnectedIds.has(node.id)
            const shouldLabel = isHit || isSelected || (selectedConnectedIds ? isNeighbor : degree >= 8 || globalScale > 1.35)
            if (!shouldLabel) return
            const labelMax = isSelected || isHit ? 34 : 22
            const label = rawLabel.length > labelMax ? rawLabel.slice(0, labelMax) + '...' : rawLabel
            const dimmed = selectedConnectedIds && !selectedConnectedIds.has(node.id)
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
        {selectedNode ? (
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
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedInbound.slice(0, 30).map((edge, index) => renderEdgeRow(edge, 'in', index))}
                </ul>
              ) : (
                <p className="text-xs text-stone-400">Ingen synlige innkommende kanter.</p>
              )}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2">Utgående ({selectedOutbound.length})</p>
              {selectedOutbound.length > 0 ? (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedOutbound.slice(0, 30).map((edge, index) => renderEdgeRow(edge, 'out', index))}
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
              <h3 className="mt-2 text-sm font-semibold text-stone-900">Velg en node i grafen</h3>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                Klikk på en node for innkommende/utgående relasjoner, konfidens og direkte lenke til riktig side.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-white p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">Mest koblet i visningen</p>
              <div className="mt-2 space-y-1">
                {topConnectedNodes.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => focusNode(node.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-xs text-stone-600 hover:bg-stone-50 hover:text-stone-950"
                  >
                    <span className="min-w-0 truncate">{node.label}</span>
                    <span className="shrink-0 text-[10px] text-stone-400">{degreeById.get(node.id) ?? 0}</span>
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
