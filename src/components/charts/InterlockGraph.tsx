'use client'

import { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

type InterlockNode = {
  id: string
  label: string
  type: 'company' | 'person'
  val: number
}

type InterlockEdge = {
  source: string
  target: string
  role: string
}

type Props = {
  nodes: InterlockNode[]
  edges: InterlockEdge[]
  selectedNodeId: string | null
  onNodeClick: (nodeId: string | null) => void
}

const NODE_COLORS = {
  company: '#e11d48',
  person: '#2563eb',
} as const

export function InterlockGraph({ nodes, edges, selectedNodeId, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

  const highlightNodes = useMemo(() => {
    if (!selectedNodeId) return new Set<string>()
    const connected = new Set<string>([selectedNodeId])
    for (const edge of edges) {
      const src = typeof edge.source === 'string' ? edge.source : (edge.source as any).id
      const tgt = typeof edge.target === 'string' ? edge.target : (edge.target as any).id
      if (src === selectedNodeId) connected.add(tgt)
      if (tgt === selectedNodeId) connected.add(src)
    }
    return connected
  }, [selectedNodeId, edges])

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

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node.id === selectedNodeId ? null : node.id)
  }, [onNodeClick, selectedNodeId])

  const graphData = {
    nodes: nodes.map(n => ({ ...n })),
    links: edges.map(e => ({ ...e })),
  }

  const hasSelection = highlightNodes.size > 0

  return (
    <div ref={containerRef} className="rounded-xl border border-stone-200 bg-white overflow-hidden" style={{ height: 500 }}>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.label} (${node.type === 'company' ? 'selskap' : 'person'})`}
        nodeVal={(node: any) => node.val}
        nodeColor={(node: any) => {
          if (hasSelection && !highlightNodes.has(node.id)) return '#d6d3d1'
          return NODE_COLORS[node.type as keyof typeof NODE_COLORS] ?? '#78716c'
        }}
        linkColor={() => '#e7e5e4'}
        linkWidth={(link: any) => {
          if (!hasSelection) return 1
          const src = typeof link.source === 'string' ? link.source : link.source.id
          const tgt = typeof link.target === 'string' ? link.target : link.target.id
          return highlightNodes.has(src) && highlightNodes.has(tgt) ? 2 : 0.3
        }}
        backgroundColor="#fafaf9"
        cooldownTicks={100}
        onNodeClick={handleNodeClick}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx) => {
          const isHighlighted = !hasSelection || highlightNodes.has(node.id)
          const alpha = isHighlighted ? 1 : 0.2

          const label = node.label?.length > 20 ? node.label.slice(0, 20) + '...' : node.label
          const fontSize = node.type === 'company' ? 3.5 : 3
          ctx.font = `${fontSize}px sans-serif`
          ctx.textAlign = 'center'
          ctx.globalAlpha = alpha
          ctx.fillStyle = '#57534e'
          ctx.fillText(label, node.x, node.y + (node.type === 'company' ? 8 : 6))
          ctx.globalAlpha = 1
        }}
      />
    </div>
  )
}
