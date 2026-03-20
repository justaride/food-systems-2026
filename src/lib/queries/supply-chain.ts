import { prisma } from '@/lib/db'

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

type SupplyChainStats = {
  totalRelationships: number
  companiesInvolved: number
  byType: Record<string, number>
}

export type SupplyChainGraphData = {
  nodes: SupplyChainNode[]
  edges: SupplyChainEdge[]
  stats: SupplyChainStats
}

export async function getSupplyChainGraph(): Promise<SupplyChainGraphData> {
  const relationships = await prisma.businessRelationship.findMany({
    include: {
      fromCompany: { select: { id: true, name: true, valueChainStage: true, country: true } },
      toCompany: { select: { id: true, name: true, valueChainStage: true, country: true } },
    },
  })

  const companyMap = new Map<string, SupplyChainNode>()

  for (const rel of relationships) {
    if (!companyMap.has(rel.fromCompany.id)) {
      companyMap.set(rel.fromCompany.id, {
        id: rel.fromCompany.id,
        label: rel.fromCompany.name,
        valueChainStage: rel.fromCompany.valueChainStage,
        country: rel.fromCompany.country,
      })
    }
    if (!companyMap.has(rel.toCompany.id)) {
      companyMap.set(rel.toCompany.id, {
        id: rel.toCompany.id,
        label: rel.toCompany.name,
        valueChainStage: rel.toCompany.valueChainStage,
        country: rel.toCompany.country,
      })
    }
  }

  const byType: Record<string, number> = {}
  const edges: SupplyChainEdge[] = relationships.map(r => {
    byType[r.relationshipType] = (byType[r.relationshipType] ?? 0) + 1
    return {
      source: r.fromCompanyId,
      target: r.toCompanyId,
      relationshipType: r.relationshipType,
      description: r.description,
      sector: r.sector,
      estimatedValue: r.estimatedValue,
    }
  })

  return {
    nodes: [...companyMap.values()],
    edges,
    stats: {
      totalRelationships: relationships.length,
      companiesInvolved: companyMap.size,
      byType,
    },
  }
}
