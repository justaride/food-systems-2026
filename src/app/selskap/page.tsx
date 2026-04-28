import { getCompanies } from '@/lib/queries/companies'
import { SelskaperContent } from './SelskaperContent'

export default async function SelskaperPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string; stage?: string }>
}) {
  const params = await searchParams
  const includeAll = params.all === '1'
  const initialStages = params.stage
    ? params.stage.split(',').map(s => s.trim()).filter(Boolean)
    : []
  const companies = await getCompanies({ includeAll })

  const rows = companies.map(c => ({
    id: c.id,
    name: c.name,
    orgNr: c.orgNr,
    legalForm: c.legalForm,
    founded: c.founded,
    naceDescription: c.naceDescription,
    hqCity: c.hqCity,
    country: c.country,
    ownershipType: c.ownershipType,
    valueChainStage: c.valueChainStage,
    revenueNok: c.financials[0]?.revenueNok ? Number(c.financials[0].revenueNok) : null,
    employees: c.financials[0]?.groupEmployees ?? c.employees ?? null,
    controllingOwner: c.shareholders[0]?.name ?? null,
    boardCount: c._count.boardMembers,
    subsidyCount: c._count.subsidies,
    propertyCount: c._count.ownedProperties,
    relationshipCount: c._count.relationshipsFrom + c._count.relationshipsTo,
  }))

  return <SelskaperContent companies={rows} includeAll={includeAll} initialStages={initialStages} />
}
