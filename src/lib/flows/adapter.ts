import type { NetworkEdge, NetworkNode } from '../network-map'
import type { LoopFlows } from './types'

export type SankeyData = { nodes: { name: string }[]; links: { source: number; target: number; value: number }[] }

function reaches(adj: Map<number, number[]>, from: number, to: number): boolean {
  const stack = [from]
  const visited = new Set<number>()
  while (stack.length) {
    const cur = stack.pop()!
    if (cur === to) return true
    if (visited.has(cur)) continue
    visited.add(cur)
    for (const next of adj.get(cur) ?? []) stack.push(next)
  }
  return false
}

export function toSankey(loops: LoopFlows[]): SankeyData {
  const nodes: { name: string }[] = []
  const idx = new Map<string, number>()
  const adj = new Map<number, number[]>()
  const links: { source: number; target: number; value: number }[] = []

  const addNode = (name: string): number => {
    const existing = idx.get(name)
    if (existing !== undefined) return existing
    nodes.push({ name })
    idx.set(name, nodes.length - 1)
    return nodes.length - 1
  }

  for (const loop of loops) {
    const labelById = new Map(loop.nodes.map((n) => [n.id, n.label]))
    for (const e of loop.edges) {
      if (!e.quantity) continue
      const s = addNode(labelById.get(e.fromId) ?? e.fromId)
      const t = addNode(labelById.get(e.toId) ?? e.toId)
      if (s === t) continue
      if (reaches(adj, t, s)) continue
      links.push({ source: s, target: t, value: e.quantity.value })
      adj.set(s, [...(adj.get(s) ?? []), t])
    }
  }
  return { nodes, links }
}

export function toNetwork(loops: LoopFlows[]): { nodes: NetworkNode[]; edges: NetworkEdge[] } {
  const nodes: NetworkNode[] = []
  const edges: NetworkEdge[] = []
  const seen = new Set<string>()

  for (const loop of loops) {
    for (const n of loop.nodes) {
      const gid = `${loop.loopId}:${n.id}`
      if (seen.has(gid)) continue
      seen.add(gid)
      nodes.push({
        id: gid,
        label: n.label,
        type: n.type,
        stage: 'circular',
        valueChainStage: n.valueChainStep ?? null,
        ...(n.ref ? { href: n.ref } : {}),
      })
    }
    for (const e of loop.edges) {
      edges.push({
        id: e.id,
        source: `${loop.loopId}:${e.fromId}`,
        target: `${loop.loopId}:${e.toId}`,
        type: e.evidenceStatus,
        label: e.rLevel ? `${e.material} · ${e.rLevel}` : e.material,
        evidenceStatus: e.evidenceStatus,
        ...(e.quantity ? { estimatedValue: e.quantity.value } : {}),
      })
    }
  }
  return { nodes, edges }
}
