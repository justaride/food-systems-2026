'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

type GraphNode = {
  id: string
  label: string
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source' | 'actor' | 'person' | 'property'
  tags?: string[]
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
    new Set(['document', 'insight', 'thesis', 'company', 'source', 'actor', 'person', 'property'])
  )
  const [search, setSearch] = useState('')

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
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const toggleEdgeType = useCallback((type: string) => {
    setActiveEdgeTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }, [])

  const filteredNodes = nodes.filter(n => activeTypes.has(n.type))
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
  const filteredEdges = edges.filter((e) => {
    const src = edgeEndpointId(e.source)
    const tgt = edgeEndpointId(e.target)
    return filteredNodeIds.has(src) && filteredNodeIds.has(tgt) && activeEdgeTypes.has(e.type)
  })

  const normalizedSearch = search.trim().toLowerCase()
  const searchMatches = useMemo(() => {
    if (!normalizedSearch) return null
    const ids = new Set<string>()
    for (const n of filteredNodes) {
      if (n.label.toLowerCase().includes(normalizedSearch)) ids.add(n.id)
    }
    return ids
  }, [filteredNodes, normalizedSearch])

  const graphData = {
    nodes: filteredNodes.map(n => ({ ...n, val: NODE_SIZES[n.type] ?? 5 })),
    links: filteredEdges.map(e => ({ ...e })),
  }

  const edgeTypeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const e of edges) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
    return counts
  }, [edges])

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
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
              const count = nodes.filter(n => n.type === type).length
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
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx) => {
            const rawLabel = (node.label ?? '') as string
            const label = rawLabel.length > 20 ? rawLabel.slice(0, 20) + '...' : rawLabel
            const isHit = !!searchMatches && searchMatches.has(node.id)
            ctx.font = isHit ? 'bold 3.4px sans-serif' : '3px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = isHit ? '#b45309' : '#57534e'
            ctx.fillText(label, node.x, node.y + 6)
          }}
        />
      </div>

      <div className="flex gap-4 text-xs text-stone-400 px-1">
        <span>{filteredNodes.length} noder</span>
        <span>{filteredEdges.length} kanter</span>
        {searchMatches && <span>{searchMatches.size} søketreff</span>}
      </div>
    </div>
  )
}
