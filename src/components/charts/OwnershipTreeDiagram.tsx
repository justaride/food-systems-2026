'use client'

import Link from 'next/link'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { OwnershipTree } from '@/lib/queries/ownership'

type Props = {
  tree: OwnershipTree
}

type LayoutNode = {
  id: string
  name: string
  orgNr: string
  ownershipType: string | null
  valueChainStage: string | null
  isSynthetic?: boolean
  x: number
  y: number
  children: string[]
}

const NODE_WIDTH = 180
const NODE_HEIGHT = 45
const NODE_GAP_X = 10
const LEVEL_GAP_Y = 80

function buildAdjacency(tree: OwnershipTree): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const node of tree.nodes) {
    adj.set(node.id, [])
  }
  for (const edge of tree.edges) {
    const children = adj.get(edge.parentId) ?? []
    children.push(edge.childId)
    adj.set(edge.parentId, children)
  }
  return adj
}

function computeSubtreeWidth(nodeId: string, adj: Map<string, string[]>, path = new Set<string>()): number {
  if (path.has(nodeId)) return 0
  const nextPath = new Set(path)
  nextPath.add(nodeId)

  const children = adj.get(nodeId) ?? []
  if (children.length === 0) return NODE_WIDTH + NODE_GAP_X
  let total = 0
  for (const child of children) {
    total += computeSubtreeWidth(child, adj, nextPath)
  }
  return Math.max(total, NODE_WIDTH + NODE_GAP_X)
}

function layoutTree(tree: OwnershipTree): LayoutNode[] {
  const adj = buildAdjacency(tree)
  const nodeMap = new Map(tree.nodes.map(n => [n.id, n]))
  const layoutNodes: LayoutNode[] = []
  const placed = new Set<string>()

  function layout(nodeId: string, x: number, y: number) {
    // Ownership imports can form DAGs; render shared companies once and keep all parent edges.
    if (placed.has(nodeId)) return
    const node = nodeMap.get(nodeId)
    if (!node) return
    placed.add(nodeId)

    const children = adj.get(nodeId) ?? []
    const subtreeWidth = computeSubtreeWidth(nodeId, adj)
    const nodeX = x + subtreeWidth / 2 - NODE_WIDTH / 2

    layoutNodes.push({
      ...node,
      x: nodeX,
      y,
      children,
    })

    let childX = x
    for (const childId of children) {
      const childWidth = computeSubtreeWidth(childId, adj)
      layout(childId, childX, y + LEVEL_GAP_Y)
      childX += childWidth
    }
  }

  layout(tree.rootId, 0, 0)
  return layoutNodes
}

function edgeStrokeDasharray(ownershipType: string): string | undefined {
  switch (ownershipType) {
    case 'divestment': return '8 4'
    case 'joint-venture': return '6 3'
    case 'minority-stake': return '2 3'
    default: return undefined
  }
}

function nodeStrokeClass(ownershipType: string | null, isSynthetic?: boolean): string {
  if (isSynthetic) return 'stroke-stone-300'
  switch (ownershipType) {
    case 'divestment': return 'stroke-rose-300'
    case 'joint-venture': return 'stroke-amber-300'
    case 'minority-stake': return 'stroke-sky-300'
    default: return 'stroke-stone-200'
  }
}

function edgeLabel(edge: { ownershipPct: number | null; ownershipType: string }): string | null {
  if (edge.ownershipPct == null) return null
  switch (edge.ownershipType) {
    case 'divestment': return `${edge.ownershipPct}% frasalg`
    case 'joint-venture': return `${edge.ownershipPct}% fellesforetak`
    case 'minority-stake': return `${edge.ownershipPct}% minoritet`
    default: return `${edge.ownershipPct}%`
  }
}

function nodeFillClass(isSynthetic?: boolean): string {
  return isSynthetic ? 'fill-stone-100' : 'fill-white'
}

export function OwnershipTreeDiagram({ tree }: Props) {
  const [focusId, setFocusId] = useState(tree.rootId)
  const [zoom, setZoom] = useState(1)
  const viewport = useRef<HTMLDivElement>(null)
  const nodes = useMemo(() => layoutTree({ ...tree, rootId: focusId }), [tree, focusId])
  const focusX = nodes.find(n => n.id === focusId)?.x ?? 0
  useLayoutEffect(() => {
    const pane = viewport.current
    if (pane) { pane.scrollLeft = (focusX + NODE_WIDTH / 2 + 10) * zoom - pane.clientWidth / 2; pane.scrollTop = 0 }
  }, [focusX, focusId, zoom])
  const nodeById = new Map(nodes.map(n => [n.id, n]))

  if (nodes.length === 0) return null

  const maxX = Math.max(...nodes.map(n => n.x + NODE_WIDTH))
  const maxY = Math.max(...nodes.map(n => n.y + NODE_HEIGHT))
  const svgWidth = maxX + 20
  const svgHeight = maxY + 20

  const edgeElements: React.ReactNode[] = []
  for (const [edgeIndex, edge] of tree.edges.entries()) {
    const parent = nodeById.get(edge.parentId)
    const child = nodeById.get(edge.childId)
    if (!parent || !child) continue

    const parentCx = parent.x + NODE_WIDTH / 2
    const parentBy = parent.y + NODE_HEIGHT
    const childCx = child.x + NODE_WIDTH / 2
    const childTy = child.y

    const midY = parentBy + (childTy - parentBy) / 2
    const dasharray = edgeStrokeDasharray(edge.ownershipType)
    const label = edgeLabel(edge)

    edgeElements.push(
      <g key={`${edge.parentId}-${edge.childId}-${edgeIndex}`}>
        <path
          d={`M ${parentCx} ${parentBy} V ${midY} H ${childCx} V ${childTy}`}
          fill="none"
          className="stroke-stone-300"
          strokeWidth={1.5}
          strokeDasharray={dasharray}
        />
        {label && (
          <text
            x={childCx + (parentCx === childCx ? 8 : 0)}
            y={midY - 4}
            className="fill-stone-400"
            fontSize={9}
            textAnchor={parentCx === childCx ? 'start' : 'middle'}
          >
            {label}
          </text>
        )}
      </g>
    )
  }

  const nodeElements = nodes.map(node => {
    const strokeClass = nodeStrokeClass(node.ownershipType, node.isSynthetic)
    const fillClass = nodeFillClass(node.isSynthetic)

    const label = node.name.length > 22 ? node.name.slice(0, 20) + '...' : node.name

    const inner = (
      <g>
        <title>{`${node.name} · ${node.orgNr}`}</title>
        <rect
          x={node.x}
          y={node.y}
          width={NODE_WIDTH}
          height={NODE_HEIGHT}
          rx={8}
          className={`${fillClass} ${strokeClass}`}
          strokeWidth={1.5}
        />
        <text
          x={node.x + NODE_WIDTH / 2}
          y={node.y + 18}
          textAnchor="middle"
          className={`fill-stone-800 ${node.isSynthetic ? 'italic' : ''}`}
          fontSize={11}
          fontWeight={node.isSynthetic ? 400 : 600}
        >
          {label}
        </text>
        {node.valueChainStage && (
          <text
            x={node.x + NODE_WIDTH / 2}
            y={node.y + 33}
            textAnchor="middle"
            className="fill-stone-400"
            fontSize={9}
          >
            {node.valueChainStage}
          </text>
        )}
        {node.isSynthetic && !node.valueChainStage && (
          <text
            x={node.x + NODE_WIDTH / 2}
            y={node.y + 33}
            textAnchor="middle"
            className="fill-stone-300"
            fontSize={9}
            fontStyle="italic"
          >
            kontrollerende eier
          </text>
        )}
      </g>
    )

    if (node.isSynthetic) {
      return <g key={node.id}>{inner}</g>
    }

    return (
      <Link key={node.id} href={`/selskap/${node.id}`}>
        {inner}
      </Link>
    )
  })

  return (
    <div className="min-w-0 space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1 text-xs text-stone-600">Utforsk del av konsernet
          <select aria-label="Utforsk del av konsernet" value={focusId} onChange={e => setFocusId(e.target.value)} className="mt-1 block w-full min-w-0 rounded border bg-white px-3 py-2 text-sm text-stone-900">
            {tree.nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
          </select>
        </label>
        <button aria-label="Zoom ut i konserntre" disabled={zoom <= 0.75} onClick={() => setZoom(z => Math.max(.75, z - .25))} className="rounded border px-3 py-2 disabled:opacity-40">−</button>
        <span className="py-2 text-sm tabular-nums">{Math.round(zoom * 100)}%</span>
        <button aria-label="Zoom inn i konserntre" disabled={zoom >= 2} onClick={() => setZoom(z => Math.min(2, z + .25))} className="rounded border px-3 py-2 disabled:opacity-40">+</button>
        <button onClick={() => { setFocusId(tree.rootId); setZoom(1) }} className="rounded border px-3 py-2 text-sm">Hele konsernet</button>
      </div>
      <p className="text-xs text-stone-500">{nodes.length} av {tree.nodes.length} enheter. Rull i treet for å se mer, eller velg en gren. Klikk et selskap for detaljer.</p>
      <div ref={viewport} tabIndex={0} role="region" aria-label="Konserntre, rull for å utforske" className="max-w-full overflow-auto rounded-lg border border-stone-100 bg-stone-50/50" style={{ height: Math.min(460, (svgHeight + 40) * zoom) }}>
      <svg
        viewBox={`-10 -10 ${svgWidth + 20} ${svgHeight + 20}`}
        width={(svgWidth + 20) * zoom}
        height={(svgHeight + 20) * zoom}
        style={{ maxWidth: 'none' }}
        className="block"
      >
        {edgeElements}
        {nodeElements}
      </svg>
      </div>
    </div>
  )
}
