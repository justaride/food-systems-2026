'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

type GraphNode = {
  id: string
  label: string
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source'
  tags?: string[]
}

type GraphEdge = {
  source: string
  target: string
  type: string
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
}

const NODE_SIZES: Record<string, number> = {
  document: 6,
  insight: 5,
  thesis: 5,
  company: 7,
  source: 4,
}

export function KnowledgeGraph({ nodes, edges }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
  const [activeTypes, setActiveTypes] = useState<Set<string>>(
    new Set(['document', 'insight', 'thesis', 'company', 'source'])
  )

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

  const filteredNodes = nodes.filter(n => activeTypes.has(n.type))
  const filteredNodeIds = new Set(filteredNodes.map(n => n.id))
  const filteredEdges = edges.filter(e =>
    filteredNodeIds.has(typeof e.source === 'string' ? e.source : (e.source as any).id) &&
    filteredNodeIds.has(typeof e.target === 'string' ? e.target : (e.target as any).id)
  )

  const graphData = {
    nodes: filteredNodes.map(n => ({ ...n, val: NODE_SIZES[n.type] ?? 5 })),
    links: filteredEdges.map(e => ({ ...e })),
  }

  return (
    <div className="space-y-3">
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

      <div ref={containerRef} className="rounded-xl border border-stone-200 bg-white overflow-hidden" style={{ height: 500 }}>
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node: any) => node.label}
          nodeColor={(node: any) => NODE_COLORS[node.type] ?? '#78716c'}
          nodeVal={(node: any) => node.val}
          linkColor={() => '#e7e5e4'}
          linkWidth={1}
          linkDirectionalArrowLength={3}
          linkDirectionalArrowRelPos={1}
          backgroundColor="#fafaf9"
          cooldownTicks={100}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx) => {
            const label = node.label?.length > 20 ? node.label.slice(0, 20) + '...' : node.label
            ctx.font = '3px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillStyle = '#57534e'
            ctx.fillText(label, node.x, node.y + 6)
          }}
        />
      </div>

      <div className="flex gap-4 text-xs text-stone-400 px-1">
        <span>{filteredNodes.length} noder</span>
        <span>{filteredEdges.length} kanter</span>
      </div>
    </div>
  )
}
