import type { EvidenceStatus, ResearchEvidenceStatus } from '@/lib/visualization/types'
import type { CitationReadinessLevel } from '@/lib/citations/citation-status'

export type NetworkEvidenceStatus = ResearchEvidenceStatus | EvidenceStatus | CitationReadinessLevel

export type NetworkMetric = {
  label: string
  value: string | number
  tone?: 'ok' | 'warn' | 'error' | 'info'
}

export type NetworkNode = {
  id: string
  label: string
  type: string
  href?: string
  country?: string | null
  stage?: string | null
  valueChainStage?: string | null
  tags?: string[]
  metrics?: NetworkMetric[]
  evidenceStatus?: NetworkEvidenceStatus
}

export type NetworkEdge = {
  id?: string
  source: string | { id?: string }
  target: string | { id?: string }
  type: string
  label?: string
  href?: string
  confidence?: number
  sourceLabel?: string
  evidenceStatus?: NetworkEvidenceStatus
  relationshipType?: string
  description?: string | null
  sector?: string | null
  estimatedValue?: number | null
}

export type NetworkPresetMatchRule = {
  field: 'label' | 'tag' | 'href' | 'type' | 'country' | 'stage'
  mode: 'exact' | 'includes'
  values: string[]
}

export type NetworkPreset = {
  id: string
  label: string
  description?: string
  nodeTypes?: string[]
  edgeTypes?: string[]
  showIsolated?: boolean
  matchRules?: NetworkPresetMatchRule[]
  includeMatchedNeighbors?: boolean
}

export type NetworkMapViewInput = {
  nodes: NetworkNode[]
  edges: NetworkEdge[]
  preset?: NetworkPreset | null
  activeNodeTypes?: Set<string>
  activeEdgeTypes?: Set<string>
  showIsolated?: boolean
  search?: string
  selectedNodeId?: string | null
  maxNodes?: number
}

export type NetworkMapView = {
  nodes: Array<NetworkNode & { degree: number; val: number }>
  edges: NetworkEdge[]
  candidateNodeCount: number
  limitedFromCount: number
  hiddenIsolatedCount: number
  degreeById: Map<string, number>
  searchMatchIds: Set<string> | null
  selectedConnectedIds: Set<string> | null
  topConnectedNodes: NetworkNode[]
}

export function getNetworkPresetTypeSets({
  preset,
  allNodeTypes,
  allEdgeTypes,
}: {
  preset: NetworkPreset
  allNodeTypes: string[]
  allEdgeTypes: string[]
}) {
  return {
    nodeTypes: new Set(preset.nodeTypes ?? allNodeTypes),
    edgeTypes: new Set(preset.edgeTypes ?? allEdgeTypes),
  }
}

export function networkEndpointId(endpoint: unknown): string {
  if (typeof endpoint === 'string') return endpoint
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) {
    const id = (endpoint as { id?: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

export function networkEdgeKey(edge: NetworkEdge, index: number): string {
  return edge.id ?? `${networkEndpointId(edge.source)}-${networkEndpointId(edge.target)}-${edge.type}-${index}`
}

export function resolveNetworkEdgeSelection(
  edges: NetworkEdge[],
  selectedEdgeId: string | null | undefined,
): string | null {
  if (!selectedEdgeId) return null

  for (let index = 0; index < edges.length; index += 1) {
    if (networkEdgeKey(edges[index], index) === selectedEdgeId) return selectedEdgeId
  }

  return null
}

export function normalizeNetworkSignal(value: string): string {
  return value.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function valuesForRule(node: NetworkNode, rule: NetworkPresetMatchRule): string[] {
  if (rule.field === 'tag') return node.tags ?? []
  if (rule.field === 'href') return [node.href ?? '']
  if (rule.field === 'type') return [node.type]
  if (rule.field === 'country') return [node.country ?? '']
  if (rule.field === 'stage') return [node.stage ?? node.valueChainStage ?? '']
  return [node.label]
}

export function networkNodeMatchesRule(node: NetworkNode, rule: NetworkPresetMatchRule): boolean {
  const needles = rule.values.map(normalizeNetworkSignal)
  return valuesForRule(node, rule).some((value) => {
    const normalizedValue = normalizeNetworkSignal(value)
    if (!normalizedValue) return false
    if (rule.mode === 'exact') return needles.includes(normalizedValue)
    return needles.some((needle) => normalizedValue.includes(needle))
  })
}

function networkNodeMatchesPresetRules(node: NetworkNode, rules: NetworkPresetMatchRule[]): boolean {
  return rules.some((rule) => networkNodeMatchesRule(node, rule))
}

function searchMatchesNode(node: NetworkNode, search: string): boolean {
  const fields = [
    node.label,
    node.type,
    node.country ?? '',
    node.stage ?? node.valueChainStage ?? '',
    ...(node.tags ?? []),
  ]
  return fields.some((value) => normalizeNetworkSignal(value).includes(search))
}

function buildDegree(edges: NetworkEdge[]): Map<string, number> {
  const degree = new Map<string, number>()
  for (const edge of edges) {
    const src = networkEndpointId(edge.source)
    const tgt = networkEndpointId(edge.target)
    degree.set(src, (degree.get(src) ?? 0) + 1)
    degree.set(tgt, (degree.get(tgt) ?? 0) + 1)
  }
  return degree
}

export function getNetworkMapView({
  nodes,
  edges,
  preset = null,
  activeNodeTypes,
  activeEdgeTypes,
  showIsolated = false,
  search = '',
  selectedNodeId = null,
  maxNodes = 2000,
}: NetworkMapViewInput): NetworkMapView {
  const nodeTypes = new Set(preset?.nodeTypes ?? activeNodeTypes ?? nodes.map((node) => node.type))
  const edgeTypes = new Set(preset?.edgeTypes ?? activeEdgeTypes ?? edges.map((edge) => edge.type))
  const includeIsolated = preset?.showIsolated ?? showIsolated

  const typeFilteredNodes = nodes.filter((node) => nodeTypes.has(node.type))
  const typeFilteredNodeIds = new Set(typeFilteredNodes.map((node) => node.id))
  const typeFilteredEdges = edges.filter((edge) => {
    const src = networkEndpointId(edge.source)
    const tgt = networkEndpointId(edge.target)
    return typeFilteredNodeIds.has(src) && typeFilteredNodeIds.has(tgt) && edgeTypes.has(edge.type)
  })

  const presetNodeIds = (() => {
    const rules = preset?.matchRules
    if (!rules || rules.length === 0) return null

    const ids = new Set<string>()
    for (const node of typeFilteredNodes) {
      if (networkNodeMatchesPresetRules(node, rules)) ids.add(node.id)
    }

    if (preset?.includeMatchedNeighbors) {
      const matchedIds = new Set(ids)
      for (const edge of typeFilteredEdges) {
        const src = networkEndpointId(edge.source)
        const tgt = networkEndpointId(edge.target)
        if (matchedIds.has(src)) ids.add(tgt)
        if (matchedIds.has(tgt)) ids.add(src)
      }
    }

    return ids
  })()

  const presetFilteredNodes = presetNodeIds
    ? typeFilteredNodes.filter((node) => presetNodeIds.has(node.id))
    : typeFilteredNodes
  const presetFilteredNodeIds = new Set(presetFilteredNodes.map((node) => node.id))
  const presetFilteredEdges = typeFilteredEdges.filter((edge) => {
    const src = networkEndpointId(edge.source)
    const tgt = networkEndpointId(edge.target)
    return presetFilteredNodeIds.has(src) && presetFilteredNodeIds.has(tgt)
  })

  const degreeById = buildDegree(presetFilteredEdges)
  const candidateNodes = includeIsolated
    ? presetFilteredNodes
    : presetFilteredNodes.filter((node) => (degreeById.get(node.id) ?? 0) > 0)
  const candidateNodeIds = new Set(candidateNodes.map((node) => node.id))
  const candidateEdges = presetFilteredEdges.filter((edge) => {
    const src = networkEndpointId(edge.source)
    const tgt = networkEndpointId(edge.target)
    return candidateNodeIds.has(src) && candidateNodeIds.has(tgt)
  })

  const normalizedSearch = normalizeNetworkSignal(search.trim())
  const searchMatchIds = normalizedSearch
    ? new Set(candidateNodes.filter((node) => searchMatchesNode(node, normalizedSearch)).map((node) => node.id))
    : null

  const keep = new Map<string, NetworkNode>()
  const add = (node: NetworkNode | undefined) => {
    if (!node || keep.size >= maxNodes) return
    keep.set(node.id, node)
  }

  add(selectedNodeId ? candidateNodes.find((node) => node.id === selectedNodeId) : undefined)
  if (searchMatchIds) {
    for (const node of candidateNodes) {
      if (searchMatchIds.has(node.id)) add(node)
    }
  }

  const rankedNodes = [...candidateNodes].sort((a, b) => {
    const degreeDiff = (degreeById.get(b.id) ?? 0) - (degreeById.get(a.id) ?? 0)
    if (degreeDiff !== 0) return degreeDiff
    return a.label.localeCompare(b.label, 'no')
  })

  for (const node of rankedNodes) add(node)

  const limitedNodes = candidateNodes.length > maxNodes ? [...keep.values()] : candidateNodes
  const limitedNodeIds = new Set(limitedNodes.map((node) => node.id))
  const limitedEdges = candidateEdges.filter((edge) => {
    const src = networkEndpointId(edge.source)
    const tgt = networkEndpointId(edge.target)
    return limitedNodeIds.has(src) && limitedNodeIds.has(tgt)
  })

  const selectedConnectedIds = selectedNodeId
    ? (() => {
        const ids = new Set<string>([selectedNodeId])
        for (const edge of candidateEdges) {
          const src = networkEndpointId(edge.source)
          const tgt = networkEndpointId(edge.target)
          if (src === selectedNodeId) ids.add(tgt)
          if (tgt === selectedNodeId) ids.add(src)
        }
        return ids
      })()
    : null

  return {
    nodes: limitedNodes.map((node) => {
      const degree = degreeById.get(node.id) ?? 0
      return { ...node, degree, val: Math.max(4, Math.min(18, degree + 4)) }
    }),
    edges: limitedEdges,
    candidateNodeCount: candidateNodes.length,
    limitedFromCount: candidateNodes.length > maxNodes ? candidateNodes.length : 0,
    hiddenIsolatedCount: presetFilteredNodes.length - candidateNodes.length,
    degreeById,
    searchMatchIds,
    selectedConnectedIds,
    topConnectedNodes: rankedNodes.slice(0, 10),
  }
}
