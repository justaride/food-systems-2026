import { prisma } from '@/lib/db'

export type SubsidyTypeAggregate = {
  subsidyType: string
  totalAmountNok: number
  count: number
}

export type SubsidyTopRecipient = {
  companyId: string
  companyName: string
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

  const byCompanyRaw = await prisma.subsidy.groupBy({
    by: ['companyId'],
    _sum: { amountNok: true },
    _count: { _all: true },
    orderBy: { _sum: { amountNok: 'desc' } },
    take: 10,
  })

  const companyIds = byCompanyRaw.map(r => r.companyId)
  const companies = companyIds.length
    ? await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      })
    : []
  const nameById = new Map(companies.map(c => [c.id, c.name]))

  const topRecipients: SubsidyTopRecipient[] = byCompanyRaw.map(r => ({
    companyId: r.companyId,
    companyName: nameById.get(r.companyId) ?? r.companyId,
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
