import { prisma } from '@/lib/db'
import { isMissingPrismaTable, isPrismaDataUnavailable } from './prisma-errors'
import { PROPERTY_COMPANIES, type PropertyCompany } from '@/lib/data/property-companies'

export type PropertyCompanyRow = PropertyCompany & {
  companyId: string | null
}

export async function getPropertyCompaniesWithLinks(): Promise<PropertyCompanyRow[]> {
  const orgNrs = PROPERTY_COMPANIES.map(p => p.orgNr)

  let idByOrg: Map<string, string>
  try {
    const companies = await prisma.company.findMany({
      where: { orgNr: { in: orgNrs } },
      select: { id: true, orgNr: true },
    })
    idByOrg = new Map(companies.map(c => [c.orgNr, c.id]))
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Company') && !isPrismaDataUnavailable(error)) throw error
    idByOrg = new Map()
  }

  return PROPERTY_COMPANIES.map(p => ({ ...p, companyId: idByOrg.get(p.orgNr) ?? null }))
}
