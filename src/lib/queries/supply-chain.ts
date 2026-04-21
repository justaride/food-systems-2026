import { prisma } from '@/lib/db'

type DeliveryBuyerRow = {
  buyerId: string | null
  buyerName: string | null
  commodity: string
  supplierCount: number
  totalQuantity: number
  unit: string
}

type DeliveryCommoditySummary = {
  commodity: string
  unit: string
  totalQuantity: number
  supplierCount: number
  buyers: { buyerId: string | null; buyerName: string | null; quantity: number; supplierCount: number }[]
}

export type PrimaryDeliveriesData = {
  byBuyer: DeliveryBuyerRow[]
  byCommodity: DeliveryCommoditySummary[]
  totalSuppliers: number
  totalDeliveryRows: number
}

export async function getPrimaryProducerDeliveries(): Promise<PrimaryDeliveriesData> {
  const [buyerRows, totals] = await Promise.all([
    prisma.deliveryVolume.groupBy({
      by: ['buyerId', 'buyerName', 'commodity', 'unit'],
      _sum: { quantity: true },
      _count: true,
    }),
    prisma.deliveryVolume.aggregate({ _count: true }),
  ])

  const distinctSuppliers = await prisma.deliveryVolume.groupBy({
    by: ['supplierOrgNr'],
    _count: true,
  })

  const byBuyer: DeliveryBuyerRow[] = buyerRows
    .map(r => ({
      buyerId: r.buyerId,
      buyerName: r.buyerName,
      commodity: r.commodity,
      supplierCount: r._count,
      totalQuantity: Number(r._sum.quantity ?? 0),
      unit: r.unit,
    }))
    .filter(r => r.totalQuantity > 0)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)

  const commodityMap = new Map<string, DeliveryCommoditySummary>()
  for (const row of byBuyer) {
    const existing = commodityMap.get(row.commodity) ?? {
      commodity: row.commodity,
      unit: row.unit,
      totalQuantity: 0,
      supplierCount: 0,
      buyers: [],
    }
    existing.totalQuantity += row.totalQuantity
    existing.supplierCount += row.supplierCount
    existing.buyers.push({
      buyerId: row.buyerId,
      buyerName: row.buyerName,
      quantity: row.totalQuantity,
      supplierCount: row.supplierCount,
    })
    commodityMap.set(row.commodity, existing)
  }

  const byCommodity = Array.from(commodityMap.values())
    .map(c => ({ ...c, buyers: c.buyers.sort((a, b) => b.quantity - a.quantity) }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)

  return {
    byBuyer,
    byCommodity,
    totalSuppliers: distinctSuppliers.length,
    totalDeliveryRows: totals._count,
  }
}

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
