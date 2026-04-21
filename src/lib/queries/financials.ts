import { prisma } from '@/lib/db'

export type FinancialRecord = {
  year: number
  revenueNok: number | null
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
      operatingMargin: f.operatingMargin ? Number(f.operatingMargin) : null,
      ebitda: f.ebitda ? Number(f.ebitda) : null,
      equityRatio: f.equityRatio ? Number(f.equityRatio) : null,
      groupEmployees: f.groupEmployees,
    })),
  }))
}
