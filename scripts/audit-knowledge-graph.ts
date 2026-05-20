import { getFullGraph, type GraphNode } from '@/lib/queries/graph'
import { prisma } from '@/lib/db'

function endpointId(endpoint: unknown): string {
  if (typeof endpoint === 'string') return endpoint
  if (endpoint && typeof endpoint === 'object' && 'id' in endpoint) {
    const id = (endpoint as { id?: unknown }).id
    return typeof id === 'string' ? id : ''
  }
  return ''
}

function increment(map: Map<string, number>, key: string, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

function sortedObject(map: Map<string, number>) {
  return Object.fromEntries([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'no')))
}

function duplicateIds(nodes: GraphNode[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()
  for (const node of nodes) {
    if (seen.has(node.id)) duplicates.add(node.id)
    seen.add(node.id)
  }
  return [...duplicates].sort()
}

async function main() {
  const graph = await getFullGraph()
  const nodeIds = new Set(graph.nodes.map((node) => node.id))
  const degreeById = new Map<string, number>()
  const nodesByType = new Map<string, number>()
  const isolatedByType = new Map<string, number>()
  const edgesByType = new Map<string, number>()
  const missingHrefByType = new Map<string, number>()

  for (const edge of graph.edges) {
    const source = endpointId(edge.source)
    const target = endpointId(edge.target)
    increment(degreeById, source)
    increment(degreeById, target)
    increment(edgesByType, edge.type)
  }

  for (const node of graph.nodes) {
    increment(nodesByType, node.type)
    if ((degreeById.get(node.id) ?? 0) === 0) increment(isolatedByType, node.type)
    if (!node.href) increment(missingHrefByType, node.type)
  }

  const missingEdges = graph.edges.filter((edge) => {
    const source = endpointId(edge.source)
    const target = endpointId(edge.target)
    return !nodeIds.has(source) || !nodeIds.has(target)
  })
  const isolatedNodes = graph.nodes.filter((node) => (degreeById.get(node.id) ?? 0) === 0)
  const duplicateNodeIds = duplicateIds(graph.nodes)
  const edgesWithConfidence = graph.edges.filter((edge) => typeof edge.confidence === 'number').length

  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      nodes: graph.nodes.length,
      edges: graph.edges.length,
      connectedNodes: graph.nodes.length - isolatedNodes.length,
      isolatedNodes: isolatedNodes.length,
    },
    integrity: {
      duplicateNodeIds: duplicateNodeIds.length,
      missingEndpointEdges: missingEdges.length,
      missingHrefNodes: [...missingHrefByType.values()].reduce((sum, value) => sum + value, 0),
    },
    coverage: {
      edgesWithConfidence,
      edgesWithoutConfidence: graph.edges.length - edgesWithConfidence,
      confidencePercent: graph.edges.length > 0 ? Math.round((edgesWithConfidence / graph.edges.length) * 1000) / 10 : 0,
    },
    nodesByType: sortedObject(nodesByType),
    isolatedByType: sortedObject(isolatedByType),
    edgesByType: sortedObject(edgesByType),
    quality: graph.quality
      ? {
          companyNameDuplicateGroups: graph.quality.companyNameDuplicates.length,
          companyOrgNrDuplicateGroups: graph.quality.companyOrgNrDuplicates.length,
          personNameDuplicateGroups: graph.quality.personNameDuplicates.length,
          personKeyDuplicateGroups: graph.quality.personKeyDuplicates.length,
          businessRelationshipDuplicateGroups: graph.quality.businessRelationshipDuplicates.length,
          orphanBoardMembers: graph.quality.orphanBoardMembers.length,
          boardMemberProfileGaps: graph.quality.boardMemberProfileGaps.length,
          edgeConfidenceCoverage: graph.quality.edgeConfidenceCoverage,
        }
      : undefined,
    samples: {
      duplicateNodeIds: duplicateNodeIds.slice(0, 20),
      missingEndpointEdges: missingEdges.slice(0, 20),
      companyNameDuplicates: graph.quality?.companyNameDuplicates.slice(0, 10) ?? [],
      orphanBoardMembers: graph.quality?.orphanBoardMembers.slice(0, 10) ?? [],
      boardMemberProfileGaps: graph.quality?.boardMemberProfileGaps.slice(0, 10) ?? [],
    },
  }

  console.log(JSON.stringify(report, null, 2))

  if (duplicateNodeIds.length > 0 || missingEdges.length > 0) {
    process.exitCode = 1
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
