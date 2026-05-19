import { prisma } from '@/lib/db'
import { isAquacultureTonnageUnit } from '@/lib/aquaculture-capacity'

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
  const [sites, totalApps, byResult] = await Promise.all([
    prisma.aquacultureSite.findMany({
      select: {
        companyId: true,
        licenseStatus: true,
        capacityTonnes: true,
        capacityUnit: true,
      },
    }),
    prisma.aquacultureApplication.count(),
    prisma.aquacultureApplication.groupBy({
      by: ['result'],
      _count: true,
    }),
  ])

  let totalCapacityTonnes = 0
  const companyStats = new Map<string, { count: number; capacityTonnes: number }>()
  const statusStats = new Map<string | null, number>()

  for (const site of sites) {
    const company = companyStats.get(site.companyId) ?? { count: 0, capacityTonnes: 0 }
    company.count += 1
    if (isAquacultureTonnageUnit(site.capacityUnit)) {
      const capacity = Number(site.capacityTonnes ?? 0)
      company.capacityTonnes += capacity
      totalCapacityTonnes += capacity
    }
    companyStats.set(site.companyId, company)
    statusStats.set(site.licenseStatus, (statusStats.get(site.licenseStatus) ?? 0) + 1)
  }

  const byCompany = [...companyStats.entries()].map(([companyId, stats]) => ({
    companyId,
    _count: stats.count,
    _sum: { capacityTonnes: stats.capacityTonnes },
  }))

  const byStatus = [...statusStats.entries()].map(([licenseStatus, count]) => ({
    licenseStatus,
    _count: count,
  }))

  return {
    totalSites: sites.length,
    totalCapacityTonnes,
    byCompany,
    byStatus,
    totalApplications: totalApps,
    applicationsByResult: byResult,
  }
}
