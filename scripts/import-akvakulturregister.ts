import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.fiskeridir.no/pub-aqua/api/v1'

type SiteConnection = {
  legalEntity?: { openNr?: string; name?: string }
  license?: { licenseNr?: string }
}

type Site = {
  siteId: number
  siteNr?: number | string
  name?: string
  placementType?: string
  waterType?: string
  latitude?: number
  longitude?: number
  capacity?: number
  capacityUnitType?: string
  placement?: { municipality?: string; municipalityNo?: string; county?: string }
  speciesTypes?: Array<{ name?: string; code?: string }>
  speciesLimitations?: unknown
  connections?: SiteConnection[]
  status?: string
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error(`fetch ${url} -> ${res.status}`)
  return (await res.json()) as T
}

async function fetchSitesByOrgNr(orgNr: string): Promise<Site[]> {
  const url = `${BASE}/entities/sites-by-entity-nr/${orgNr}`
  try {
    const data = await fetchJson<Site[] | { items?: Site[] }>(url)
    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as { items?: Site[] }).items)) {
      return (data as { items: Site[] }).items
    }
    return []
  } catch (err) {
    console.warn(`[akvakultur] no sites for orgNr ${orgNr}: ${(err as Error).message}`)
    return []
  }
}

function localityNumber(site: Site): string {
  return String(site.siteNr ?? site.siteId)
}

async function upsertSite(site: Site, companyId: string, source: string) {
  const species = (site.speciesTypes ?? [])
    .map(s => s.name || s.code)
    .filter((x): x is string => Boolean(x))
  const locNr = localityNumber(site)
  await prisma.aquacultureSite.upsert({
    where: { localityNumber: locNr },
    create: {
      localityNumber: locNr,
      companyId,
      siteName: site.name,
      municipality: site.placement?.municipality,
      municipalityNo: site.placement?.municipalityNo,
      county: site.placement?.county,
      country: 'NO',
      lat: site.latitude,
      lng: site.longitude,
      licenseStatus: site.status?.toLowerCase(),
      placement: site.placementType,
      waterType: site.waterType,
      capacityTonnes: site.capacity,
      capacityUnit: site.capacityUnitType ?? 'MTB',
      species,
      productionTypes: [],
      source,
      metadata: { raw: JSON.parse(JSON.stringify(site)) } as any,
    },
    update: {
      companyId,
      siteName: site.name,
      municipality: site.placement?.municipality,
      municipalityNo: site.placement?.municipalityNo,
      county: site.placement?.county,
      lat: site.latitude,
      lng: site.longitude,
      licenseStatus: site.status?.toLowerCase(),
      placement: site.placementType,
      waterType: site.waterType,
      capacityTonnes: site.capacity,
      capacityUnit: site.capacityUnitType ?? 'MTB',
      species,
      source,
      metadata: { raw: JSON.parse(JSON.stringify(site)) } as any,
    },
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

    for (const site of sites) {
      try {
        await upsertSite(site, company.id, 'Fiskeridirektoratet pub-aqua')
      } catch (err) {
        console.warn(
          `[akvakultur] upsert failed for site ${localityNumber(site)}: ${(err as Error).message}`
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
