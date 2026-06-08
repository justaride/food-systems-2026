import type { GraphNode, GraphEdge } from '@/lib/queries/graph'

export type GraphPresetId = 'sentrale' | 'evidensgap'

export type GraphPreset = { id: GraphPresetId; label: string; hint: string }

export const GRAPH_PRESETS: GraphPreset[] = [
  { id: 'sentrale', label: 'Mest sentrale', hint: 'De mest tilkoblede nodene — start her for å unngå hele nettverket på én gang.' },
  { id: 'evidensgap', label: 'Evidensgap', hint: 'Koblinger som mangler eller har lav kildekonfidens (< 0.5).' },
]

export const DEFAULT_GRAPH_PRESET: GraphPresetId = 'sentrale'

const EVIDENCE_THRESHOLD = 0.5

function keepConnected(nodes: GraphNode[], edges: GraphEdge[]): GraphNode[] {
  const withEdge = new Set<string>()
  for (const edge of edges) {
    withEdge.add(edge.source)
    withEdge.add(edge.target)
  }
  return nodes.filter((node) => withEdge.has(node.id))
}

export function deriveGraphPreset(
  nodes: GraphNode[],
  edges: GraphEdge[],
  presetId: GraphPresetId,
  topN = 80,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (presetId === 'sentrale') {
    const degree = new Map<string, number>()
    for (const edge of edges) {
      degree.set(edge.source, (degree.get(edge.source) ?? 0) + 1)
      degree.set(edge.target, (degree.get(edge.target) ?? 0) + 1)
    }
    const topIds = new Set(
      [...nodes]
        .sort((a, b) => (degree.get(b.id) ?? 0) - (degree.get(a.id) ?? 0))
        .slice(0, topN)
        .map((node) => node.id),
    )
    const keptEdges = edges.filter((edge) => topIds.has(edge.source) && topIds.has(edge.target))
    const keptNodes = nodes.filter((node) => topIds.has(node.id))
    return { nodes: keepConnected(keptNodes, keptEdges), edges: keptEdges }
  }

  if (presetId === 'evidensgap') {
    const keptEdges = edges.filter((edge) => edge.confidence === undefined || edge.confidence < EVIDENCE_THRESHOLD)
    const endpoints = new Set<string>()
    for (const edge of keptEdges) {
      endpoints.add(edge.source)
      endpoints.add(edge.target)
    }
    // endpoints er bygd fra keptEdges, så hver node her har ≥1 kant per konstruksjon
    return { nodes: nodes.filter((node) => endpoints.has(node.id)), edges: keptEdges }
  }

  // Unknown preset → return input unchanged.
  return { nodes, edges }
}
