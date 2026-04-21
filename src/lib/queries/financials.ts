import { prisma } from '@/lib/db'

export type FinancialRecord = {
  year: number
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  ebitda: number | null
  equityRatio: number | null
  groupEmployees: number | null
}

export type CompanyWithFinancials = {
  id: string
  name: string
  orgNr: string
  valueChainStage: string | null
  ownershipType: string | null
  financials: FinancialRecord[]
}

export async function getFinancialTrends(): Promise<CompanyWithFinancials[]> {
  const companies = await prisma.company.findMany({
    where: { financials: { some: {} } },
    select: {
      id: true,
      name: true,
      orgNr: true,
      valueChainStage: true,
      ownershipType: true,
      financials: {
        orderBy: { year: 'asc' },
        select: {
          year: true,
          revenueNok: true,
          operatingResult: true,
          operatingMargin: true,
          ebitda: true,
          equityRatio: true,
          groupEmployees: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return companies.map(c => ({
    ...c,
    financials: c.financials.map(f => ({
      year: f.year,
      revenueNok: f.revenueNok ? Number(f.revenueNok) : null,
      operatingResult: f.operatingResult ? Number(f.operatingResult) : null,
      operatingMargin: f.operatingMargin ? Number(f.operatingMargin) : null,
      ebitda: f.ebitda ? Number(f.ebitda) : null,
      equityRatio: f.equityRatio ? Number(f.equityRatio) : null,
      groupEmployees: f.groupEmployees,
    })),
  }))
}

export type SubsidySumByCompany = Record<string, { totalAmountNok: number; count: number }>

export async function getSubsidySumsByCompany(): Promise<SubsidySumByCompany> {
  const rows = await prisma.subsidy.groupBy({
    by: ['companyId'],
    _sum: { amountNok: true },
    _count: { _all: true },
  })

  const map: SubsidySumByCompany = {}
  for (const r of rows) {
    map[r.companyId] = {
      totalAmountNok: r._sum.amountNok ? Number(r._sum.amountNok) : 0,
      count: r._count._all,
    }
  }
  return map
}

export async function getTotalCompanyCount(): Promise<number> {
  return prisma.company.count()
}
