import type { NetworkEdge, NetworkNode } from '../network-map'
import type { LoopFlows } from './types'

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
