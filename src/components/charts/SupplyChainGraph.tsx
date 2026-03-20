'use client'

import { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

type SupplyChainNode = {
  id: string
  label: string
  valueChainStage: string | null
  country: string
}

type SupplyChainEdge = {
  source: string
  target: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: number | null
}

type Props = {
  nodes: SupplyChainNode[]
  edges: SupplyChainEdge[]
  stageColors: Record<string, string>
  relationshipColors: Record<string, string>
  selectedNodeId: string | null
  onNodeClick: (nodeId: string | null) => void
}

export function SupplyChainGraph({
  nodes,
  edges,
  stageColors,
  relationshipColors,
  selectedNodeId,
  onNodeClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

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

  const connectionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const e of edges) {
      const src = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tgt = typeof e.target === 'string' ? e.target : (e.target as any).id
      counts[src] = (counts[src] ?? 0) + 1
      counts[tgt] = (counts[tgt] ?? 0) + 1
    }
    return counts
  }, [edges])

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return null
    const ids = new Set<string>([selectedNodeId])
    for (const e of edges) {
      const src = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tgt = typeof e.target === 'string' ? e.target : (e.target as any).id
      if (src === selectedNodeId) ids.add(tgt)
      if (tgt === selectedNodeId) ids.add(src)
    }
    return ids
  }, [selectedNodeId, edges])

  const graphData = useMemo(() => ({
    nodes: nodes.map(n => ({
      ...n,
      val: Math.max(3, (connectionCounts[n.id] ?? 1) * 2),
    })),
    links: edges.map(e => ({ ...e })),
  }), [nodes, edges, connectionCounts])

  const handleNodeClick = useCallback((node: any) => {
    onNodeClick(node.id === selectedNodeId ? null : node.id)
  }, [onNodeClick, selectedNodeId])

  const handleBackgroundClick = useCallback(() => {
    onNodeClick(null)
  }, [onNodeClick])

  return (
    <div
      ref={containerRef}
      className="rounded-xl border border-stone-200 bg-white overflow-hidden"
      style={{ height: 500 }}
    >
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => node.label}
        nodeColor={(node: any) => {
          const color = stageColors[node.valueChainStage ?? ''] ?? '#78716c'
          if (!connectedNodeIds) return color
          return connectedNodeIds.has(node.id) ? color : '#d6d3d1'
        }}
        nodeVal={(node: any) => node.val}
        linkColor={(link: any) => {
          const color = relationshipColors[link.relationshipType] ?? '#e7e5e4'
          if (!connectedNodeIds) return color
          const src = typeof link.source === 'string' ? link.source : link.source?.id
          const tgt = typeof link.target === 'string' ? link.target : link.target?.id
          return (connectedNodeIds.has(src) && connectedNodeIds.has(tgt)) ? color : '#f5f5f4'
        }}
        linkWidth={(link: any) => {
          if (!connectedNodeIds) return 1.5
          const src = typeof link.source === 'string' ? link.source : link.source?.id
          const tgt = typeof link.target === 'string' ? link.target : link.target?.id
          return (connectedNodeIds.has(src) && connectedNodeIds.has(tgt)) ? 2.5 : 0.5
        }}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        backgroundColor="#fafaf9"
        cooldownTicks={100}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        nodeCanvasObjectMode={() => 'after'}
        nodeCanvasObject={(node: any, ctx) => {
          const label = node.label?.length > 20 ? node.label.slice(0, 20) + '...' : node.label
          const dimmed = connectedNodeIds && !connectedNodeIds.has(node.id)
          ctx.font = '3px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillStyle = dimmed ? '#d6d3d1' : '#57534e'
          ctx.fillText(label, node.x, node.y + 6)
        }}
      />
    </div>
  )
}
