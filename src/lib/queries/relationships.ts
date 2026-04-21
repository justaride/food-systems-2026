import { prisma } from '@/lib/db'

/**
 * Hent alle forretningsrelasjoner (leverandør, kjøper, distributor, franchise,
 * self-dealing, joint-venture). Filtrerer eventuelt på et enkelt selskap — da
 * returneres både utgående (from) og inngående (to) relasjoner for det
 * selskapet.
 */
export async function getBusinessRelationships(companyId?: string) {
  return prisma.businessRelationship.findMany({
    where: companyId
      ? {
          OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
        }
      : undefined,
    include: {
      fromCompany: { select: { id: true, name: true } },
      toCompany: { select: { id: true, name: true } },
    },
    orderBy: [{ relationshipType: 'asc' }, { estimatedValue: 'desc' }],
  })
}

export type BusinessRelationshipRow = Awaited<
  ReturnType<typeof getBusinessRelationships>
>[number]

/**
 * Aggregert statistikk per relasjonstype — brukes til stats-kort på /relasjoner.
 */
export async function getBusinessRelationshipStats() {
  const grouped = await prisma.businessRelationship.groupBy({
    by: ['relationshipType'],
    _count: { _all: true },
    _sum: { estimatedValue: true },
  })

  const total = grouped.reduce((acc, row) => acc + row._count._all, 0)
  const totalValue = grouped.reduce(
    (acc, row) => acc + (row._sum.estimatedValue ?? 0),
    0
  )

  const byType = grouped
    .map(row => ({
      type: row.relationshipType,
      count: row._count._all,
      totalValue: row._sum.estimatedValue ?? 0,
    }))
    .sort((a, b) => b.count - a.count)

  // self-dealing fanges både via relationshipType og via
  // fromCompanyId === toCompanyId. Prisma støtter ikke felt-mot-felt i where,
  // så vi gjør det i to steg.
  const selfDealingByType = await prisma.businessRelationship.count({
    where: { relationshipType: 'self-dealing' },
  })
  const sameIdRows = await prisma.businessRelationship.findMany({
    where: { NOT: { relationshipType: 'self-dealing' } },
    select: { fromCompanyId: true, toCompanyId: true },
  })
  const selfDealingBySameId = sameIdRows.filter(
    r => r.fromCompanyId === r.toCompanyId
  ).length
  const selfDealingCount = selfDealingByType + selfDealingBySameId

  return {
    total,
    totalValue,
    byType,
    selfDealingCount,
  }
}

export type BusinessRelationshipStats = Awaited<
  ReturnType<typeof getBusinessRelationshipStats>
>
