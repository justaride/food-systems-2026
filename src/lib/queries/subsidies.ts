import { prisma } from '@/lib/db'

export type SubsidyTypeAggregate = {
  subsidyType: string
  totalAmountNok: number
  count: number
}

export type SubsidyTopRecipient = {
  producerId: string
  producerName: string
  totalAmountNok: number
  count: number
}

export type SubsidyYearTrend = {
  year: number
  totalAmountNok: number
  count: number
}

export type SubsidyAggregates = {
  byType: SubsidyTypeAggregate[]
  topRecipients: SubsidyTopRecipient[]
  yearTrends: SubsidyYearTrend[]
  totalAmountNok: number
  totalCount: number
}

export async function getSubsidyAggregates(): Promise<SubsidyAggregates> {
  const byTypeRaw = await prisma.subsidy.groupBy({
    by: ['subsidyType'],
    _sum: { amountNok: true },
    _count: { _all: true },
    orderBy: { _sum: { amountNok: 'desc' } },
  })

  const byType: SubsidyTypeAggregate[] = byTypeRaw.map(r => ({
    subsidyType: r.subsidyType,
    totalAmountNok: r._sum.amountNok ? Number(r._sum.amountNok) : 0,
    count: r._count._all,
  }))

  const byProducerRaw = await prisma.subsidy.groupBy({
    by: ['producerId'],
    where: { producerId: { not: null } },
    _sum: { amountNok: true },
    _count: { _all: true },
    orderBy: { _sum: { amountNok: 'desc' } },
    take: 10,
  })

  const producerIds = byProducerRaw.map(r => r.producerId).filter((x): x is string => x !== null)
  const producers = producerIds.length
    ? await prisma.producer.findMany({
        where: { id: { in: producerIds } },
        select: { id: true, name: true },
      })
    : []
  const nameById = new Map(producers.map(p => [p.id, p.name]))

  const topRecipients: SubsidyTopRecipient[] = byProducerRaw.map(r => ({
    producerId: r.producerId ?? '',
    producerName: nameById.get(r.producerId ?? '') ?? r.producerId ?? '',
    totalAmountNok: r._sum.amountNok ? Number(r._sum.amountNok) : 0,
    count: r._count._all,
  }))

  const byYearRaw = await prisma.subsidy.groupBy({
    by: ['year'],
    _sum: { amountNok: true },
    _count: { _all: true },
    where: { year: { not: null } },
    orderBy: { year: 'asc' },
  })

  const yearTrends: SubsidyYearTrend[] = byYearRaw
    .filter(r => r.year !== null)
    .map(r => ({
      year: r.year as number,
      totalAmountNok: r._sum.amountNok ? Number(r._sum.amountNok) : 0,
      count: r._count._all,
    }))

  const totalAmountNok = byType.reduce((sum, t) => sum + t.totalAmountNok, 0)
  const totalCount = byType.reduce((sum, t) => sum + t.count, 0)

  return {
    byType,
    topRecipients,
    yearTrends,
    totalAmountNok,
    totalCount,
  }
}
