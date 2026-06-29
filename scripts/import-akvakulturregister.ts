import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  type SiteSummary,
  type SiteDetail,
  buildSitePayload,
  localityNumber,
} from './lib/akvakultur-transform'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.fiskeridir.no/pub-aqua/api/v1'

let requestDelayMs = 0
let maxRetries = 3

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function retryDelay(res: Response, attempt: number) {
  const retryAfter = res.headers.get('retry-after')
  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds) && seconds > 0) return seconds * 1000
  }
  return Math.min(30_000, 1000 * 2 ** attempt)
}

async function fetchJson<T>(url: string): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (requestDelayMs > 0) await sleep(requestDelayMs)

    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (res.ok) return (await res.json()) as T

    if (res.status === 429 && attempt < maxRetries) {
      const waitMs = retryDelay(res, attempt)
      console.warn(`[akvakultur] rate limited, retrying in ${waitMs}ms: ${url}`)
      await sleep(waitMs)
      continue
    }

    throw new Error(`fetch ${url} -> ${res.status}`)
  }

  throw new Error(`fetch ${url} -> retry exhausted`)
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

async function upsertSite(
  summary: SiteSummary,
  detail: SiteDetail | null,
  companyId: string,
  source: string
) {
  const locNr = localityNumber(summary)
  const payload = {
    ...buildSitePayload(summary, detail),
    source,
    metadata: {
      summary: JSON.parse(JSON.stringify(summary)),
      detail: detail ? JSON.parse(JSON.stringify(detail)) : null,
    } as any,
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
  const orgArg = process.argv.find(a => a.startsWith('--org-nr='))
  const orgFilter = orgArg
    ? new Set(
        orgArg
          .split('=')[1]
          .split(',')
          .map(orgNr => orgNr.replace(/\D/g, ''))
          .filter(Boolean)
      )
    : null
  const delayArg = process.argv.find(a => a.startsWith('--delay-ms='))
  requestDelayMs = delayArg ? parseInt(delayArg.split('=')[1], 10) : 0
  if (!Number.isFinite(requestDelayMs) || requestDelayMs < 0) requestDelayMs = 0
  const retryArg = process.argv.find(a => a.startsWith('--max-retries='))
  maxRetries = retryArg ? parseInt(retryArg.split('=')[1], 10) : 3
  if (!Number.isFinite(maxRetries) || maxRetries < 0) maxRetries = 3

  const allCompanies = await prisma.company.findMany({
    where: { valueChainStage: stage, country: 'NO' },
    select: { id: true, orgNr: true, name: true },
  })
  const seafoodCompanies = orgFilter
    ? allCompanies.filter(company => orgFilter.has(company.orgNr))
    : allCompanies

  console.log(
    `[akvakultur] pulling sites for ${seafoodCompanies.length} companies (stage=${stage})${orgFilter ? ', org-filtered' : ''}${requestDelayMs ? `, delay=${requestDelayMs}ms` : ''}${dryRun ? ' (DRY RUN)' : ''}`
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
