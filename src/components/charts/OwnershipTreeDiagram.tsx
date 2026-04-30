'use client'

import Link from 'next/link'
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
    case 'joint-venture': return '6 3'
    case 'minority-stake': return '2 3'
    default: return undefined
  }
}

function nodeStrokeClass(ownershipType: string | null, isSynthetic?: boolean): string {
  if (isSynthetic) return 'stroke-stone-300'
  switch (ownershipType) {
    case 'joint-venture': return 'stroke-amber-300'
    case 'minority-stake': return 'stroke-sky-300'
    default: return 'stroke-stone-200'
  }
}

function nodeFillClass(isSynthetic?: boolean): string {
  return isSynthetic ? 'fill-stone-100' : 'fill-white'
}

export function OwnershipTreeDiagram({ tree }: Props) {
  const nodes = layoutTree(tree)
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

    edgeElements.push(
      <g key={`${edge.parentId}-${edge.childId}-${edgeIndex}`}>
        <path
          d={`M ${parentCx} ${parentBy} V ${midY} H ${childCx} V ${childTy}`}
          fill="none"
          className="stroke-stone-300"
          strokeWidth={1.5}
          strokeDasharray={dasharray}
        />
        {edge.ownershipPct != null && (
          <text
            x={childCx + (parentCx === childCx ? 8 : 0)}
            y={midY - 4}
            className="fill-stone-400"
            fontSize={9}
            textAnchor={parentCx === childCx ? 'start' : 'middle'}
          >
            {edge.ownershipPct}%
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
    <div className="overflow-x-auto">
      <svg
        viewBox={`-10 -10 ${svgWidth + 20} ${svgHeight + 20}`}
        width="100%"
        style={{ minWidth: Math.min(svgWidth, 400), maxHeight: 500 }}
        className="block"
      >
        {edgeElements}
        {nodeElements}
      </svg>
    </div>
  )
}
