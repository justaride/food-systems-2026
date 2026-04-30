import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'

export type FinancialRecord = {
  year: number
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  ebitda: number | null
  equityRatio: number | null
  groupEmployees: number | null
  source: string | null
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
          source: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  return companies.map(c => ({
    ...c,
    financials: c.financials.map(f => ({
      year: f.year,
      revenueNok: financialAmountToNok(f.revenueNok, f.source),
      operatingResult: financialAmountToNok(f.operatingResult, f.source),
      operatingMargin: f.operatingMargin != null ? Number(f.operatingMargin) : null,
      ebitda: financialAmountToNok(f.ebitda, f.source),
      equityRatio: f.equityRatio != null ? Number(f.equityRatio) : null,
      groupEmployees: f.groupEmployees,
      source: f.source,
    })),
  }))
}

export type SubsidySumByCompany = Record<string, { totalAmountNok: number; count: number }>
export type SubsidySumsByCompanyYear = Record<string, Record<number, { totalAmountNok: number; count: number }>>

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

export async function getSubsidySumsByCompanyYear(): Promise<SubsidySumsByCompanyYear> {
  const rows = await prisma.subsidy.groupBy({
    by: ['companyId', 'year'],
    where: { year: { not: null } },
    _sum: { amountNok: true },
    _count: { _all: true },
  })

  const map: SubsidySumsByCompanyYear = {}
  for (const row of rows) {
    if (row.year === null) continue
    if (!map[row.companyId]) map[row.companyId] = {}
    map[row.companyId][row.year] = {
      totalAmountNok: row._sum.amountNok ? Number(row._sum.amountNok) : 0,
      count: row._count._all,
    }
  }
  return map
}

export async function getTotalCompanyCount(): Promise<number> {
  return prisma.company.count()
}
