import { prisma } from '@/lib/db'

export async function getAquacultureSites() {
  return prisma.aquacultureSite.findMany({
    include: {
      company: { select: { id: true, name: true, orgNr: true, valueChainStage: true } },
    },
    orderBy: [{ capacityTonnes: 'desc' }, { siteName: 'asc' }],
  })
}

export type AquacultureSiteRow = Awaited<ReturnType<typeof getAquacultureSites>>[number]

export async function getAquacultureApplications() {
  return prisma.aquacultureApplication.findMany({
    include: {
      company: { select: { id: true, name: true, orgNr: true } },
    },
    orderBy: [{ createdAt: 'desc' }],
  })
}

export type AquacultureApplicationRow = Awaited<
  ReturnType<typeof getAquacultureApplications>
>[number]

export async function getAquacultureStats() {
  const [totalSites, totalCapacity, byCompany, byStatus, totalApps, byResult] =
    await Promise.all([
      prisma.aquacultureSite.count(),
      prisma.aquacultureSite.aggregate({ _sum: { capacityTonnes: true } }),
      prisma.aquacultureSite.groupBy({
        by: ['companyId'],
        _count: true,
        _sum: { capacityTonnes: true },
      }),
      prisma.aquacultureSite.groupBy({
        by: ['licenseStatus'],
        _count: true,
      }),
      prisma.aquacultureApplication.count(),
      prisma.aquacultureApplication.groupBy({
        by: ['result'],
        _count: true,
      }),
    ])

  return {
    totalSites,
    totalCapacityTonnes: Number(totalCapacity._sum.capacityTonnes ?? 0),
    byCompany,
    byStatus,
    totalApplications: totalApps,
    applicationsByResult: byResult,
  }
}
