import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.fiskeridir.no/pub-aqua/api/v1'

type SiteSummary = {
  siteId?: number
  siteNr?: string
  siteName?: string
  status?: string
  statusValue?: string
  siteCapacity?: number
  siteCapacityUnitType?: string
  sitePlacement?: {
    municipalityCode?: string
    municipalityName?: string
    countyCode?: string
    countyName?: string
  }
  connections?: Array<{
    openLegalEntityNr?: string
    productionStageValue?: string
  }>
}

type SiteDetail = {
  siteId: number
  siteNr: number
  name?: string
  placementType?: string
  placementTypeValue?: string
  waterType?: string
  waterTypeValue?: string
  latitude?: number
  longitude?: number
  capacity?: number
  tempCapacity?: number
  capacityUnitType?: string
  placement?: {
    municipalityCode?: string
    municipalityName?: string
    countyCode?: string
    countyName?: string
  }
  speciesType?: string | null
  speciesTypeValue?: string | null
  speciesLimitations?: Array<{ name?: string }>
  connections?: Array<{
    licenseNr?: string
    openLegalEntityNr?: string
    productionStageValue?: string
    statusValue?: string
  }>
  statusValue?: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return (await res.json()) as T
}

async function fetchSitesByOrgNr(orgNr: string): Promise<SiteSummary[]> {
  const url = `${BASE}/entities/sites-by-entity-nr/${orgNr}`
  try {
    const data = await fetchJson<SiteSummary[] | { items?: SiteSummary[] }>(url)
    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as { items?: SiteSummary[] }).items)) {
      return (data as { items: SiteSummary[] }).items
    }
    return []
  } catch (err) {
    console.warn(`[akvakultur] no sites for orgNr ${orgNr}: ${(err as Error).message}`)
    return []
  }
}

async function fetchSiteDetail(siteNr: string): Promise<SiteDetail | null> {
  try {
    return await fetchJson<SiteDetail>(`${BASE}/sites/${siteNr}`)
  } catch {
    return null
  }
}

function localityNumber(summary: SiteSummary): string {
  return String(summary.siteNr ?? summary.siteId)
}

async function upsertSite(
  summary: SiteSummary,
  detail: SiteDetail | null,
  companyId: string,
  source: string
) {
  const locNr = localityNumber(summary)
  const species = (detail?.speciesLimitations ?? [])
    .map(s => s?.name)
    .filter((x): x is string => Boolean(x))
  if (detail?.speciesTypeValue) species.push(detail.speciesTypeValue)

  const placement = detail?.placementTypeValue ?? summary.connections?.[0]?.productionStageValue
  const waterType = detail?.waterTypeValue ?? null
  const capacity = detail?.capacity ?? summary.siteCapacity ?? null
  const capacityUnit = detail?.capacityUnitType ?? summary.siteCapacityUnitType ?? 'TN'
  const siteName = detail?.name ?? summary.siteName ?? null
  const municipality = detail?.placement?.municipalityName ?? summary.sitePlacement?.municipalityName
  const municipalityNo = detail?.placement?.municipalityCode ?? summary.sitePlacement?.municipalityCode
  const county = detail?.placement?.countyName ?? summary.sitePlacement?.countyName
  const licenseStatus = (detail?.statusValue ?? summary.statusValue ?? summary.status ?? '').toLowerCase() || null

  const payload = {
    siteName,
    municipality,
    municipalityNo,
    county,
    country: 'NO',
    lat: detail?.latitude ?? null,
    lng: detail?.longitude ?? null,
    licenseStatus,
    placement,
    waterType,
    capacityTonnes: capacity ? Number(capacity) : null,
    capacityUnit,
    species: Array.from(new Set(species)),
    productionTypes: Array.from(
      new Set(
        (summary.connections ?? [])
          .map(c => c.productionStageValue)
          .filter((x): x is string => Boolean(x))
      )
    ),
    source,
    metadata: { summary: JSON.parse(JSON.stringify(summary)), detail: detail ? JSON.parse(JSON.stringify(detail)) : null } as any,
  }

  await prisma.aquacultureSite.upsert({
    where: { localityNumber: locNr },
    create: { localityNumber: locNr, companyId, ...payload },
    update: { companyId, ...payload },
  })
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const stageArg = process.argv.find(a => a.startsWith('--stage='))
  const stage = stageArg ? stageArg.split('=')[1] : 'seafood'

  const seafoodCompanies = await prisma.company.findMany({
    where: { valueChainStage: stage, country: 'NO' },
    select: { id: true, orgNr: true, name: true },
  })

  console.log(
    `[akvakultur] pulling sites for ${seafoodCompanies.length} companies (stage=${stage})${dryRun ? ' (DRY RUN)' : ''}`
  )

  let totalSites = 0
  let matched = 0

  for (const company of seafoodCompanies) {
    const sites = await fetchSitesByOrgNr(company.orgNr)
    if (sites.length === 0) continue
    matched++
    console.log(`[akvakultur] ${company.name} (${company.orgNr}): ${sites.length} sites`)
    totalSites += sites.length

    if (dryRun) continue

    for (const summary of sites) {
      const siteNr = localityNumber(summary)
      const detail = await fetchSiteDetail(siteNr)
      try {
        await upsertSite(summary, detail, company.id, 'Fiskeridirektoratet pub-aqua')
      } catch (err) {
        console.warn(
          `[akvakultur] upsert failed for site ${siteNr}: ${(err as Error).message}`
        )
      }
    }
  }

  console.log(
    `[akvakultur] done: companiesWithSites=${matched} totalSites=${totalSites}`
  )
}

main()
  .catch(err => {
    console.error('[akvakultur] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
