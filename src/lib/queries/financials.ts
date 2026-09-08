import { currentCompanyIdentityWhere } from '@/lib/company-identities'
import { financialSourceIssue } from '@/lib/financial-source-issues'
import { prisma } from '@/lib/db'
import { financialAmountToNok, financialUnitSelect, financialUnitIssue } from '@/lib/queries/financial-units'
import { isPrismaDataUnavailable } from './prisma-errors'

export type FinancialRecord = {
  year: number
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  ebitda: number | null
  equityRatio: number | null
  groupEmployees: number | null
  source: string | null
  unitIssue: string | null
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
  try {
    const companies = await prisma.company.findMany({
      where: { ...currentCompanyIdentityWhere, financials: { some: {} } },
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
            ...financialUnitSelect, source: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return companies.map(c => ({
      ...c,
      financials: c.financials.map(f => ({
        year: f.year,
        revenueNok: financialSourceIssue(c.orgNr, f) ? null : financialAmountToNok(f.revenueNok, f),
        operatingResult: financialSourceIssue(c.orgNr, f) ? null : financialAmountToNok(f.operatingResult, f),
        operatingMargin: !financialSourceIssue(c.orgNr, f) && f.operatingMargin != null ? Number(f.operatingMargin) : null,
        ebitda: financialSourceIssue(c.orgNr, f) ? null : financialAmountToNok(f.ebitda, f),
        equityRatio: f.equityRatio != null ? Number(f.equityRatio) : null,
        groupEmployees: f.groupEmployees,
        source: f.source,
        unitIssue: financialSourceIssue(c.orgNr, f) ?? financialUnitIssue(f),
      })),
    }))
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return []
    throw error
  }
}

export type SubsidySumByCompany = Record<string, { totalAmountNok: number; count: number }>
export type SubsidySumsByCompanyYear = Record<string, Record<number, { totalAmountNok: number; count: number }>>

export async function getSubsidySumsByCompany(): Promise<SubsidySumByCompany> {
  try {
    const rows = await prisma.subsidy.groupBy({
      by: ['companyId'],
      where: { companyId: { not: null } },
      _sum: { amountNok: true },
      _count: { _all: true },
    })

    const map: SubsidySumByCompany = {}
    for (const r of rows) {
      if (r.companyId === null) continue
      map[r.companyId] = {
        totalAmountNok: r._sum.amountNok ? Number(r._sum.amountNok) : 0,
        count: r._count._all,
      }
    }
    return map
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return {}
    throw error
  }
}

export async function getSubsidySumsByCompanyYear(): Promise<SubsidySumsByCompanyYear> {
  try {
    const rows = await prisma.subsidy.groupBy({
      by: ['companyId', 'year'],
      where: { companyId: { not: null }, year: { not: null } },
      _sum: { amountNok: true },
      _count: { _all: true },
    })

    const map: SubsidySumsByCompanyYear = {}
    for (const row of rows) {
      if (row.companyId === null || row.year === null) continue
      if (!map[row.companyId]) map[row.companyId] = {}
      map[row.companyId][row.year] = {
        totalAmountNok: row._sum.amountNok ? Number(row._sum.amountNok) : 0,
        count: row._count._all,
      }
    }
    return map
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return {}
    throw error
  }
}

export async function getTotalCompanyCount(): Promise<number> {
  try {
    return await prisma.company.count({ where: currentCompanyIdentityWhere })
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return 0
    throw error
  }
}
