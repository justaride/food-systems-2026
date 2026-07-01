import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOKEN_URL = 'https://id.barentswatch.no/connect/token'
const API_BASE = 'https://www.barentswatch.no/bwapi'

type TokenResponse = {
  access_token: string
  expires_in: number
  token_type: string
}

type LocalityWeekV2 = {
  localityNo?: number
  year?: number
  week?: number
  seaTemperature?: number
  liceReport?: {
    avgAdultFemaleLice?: number
    avgMobileLice?: number
    avgStationaryLice?: number
    hasReportedLice?: boolean
    isFallow?: boolean
    hasBathTreatment?: boolean
    hasInFeedTreatment?: boolean
    hasMechanicalRemoval?: boolean
    hasCleanerFishDeployed?: boolean
  }
  disease?: Array<{
    name?: string
    status?: string
    diagnosisDate?: string
  }>
}

async function getToken(): Promise<string> {
  const clientId = process.env.BARENTSWATCH_CLIENT_ID
  const clientSecret = process.env.BARENTSWATCH_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing BARENTSWATCH_CLIENT_ID or BARENTSWATCH_CLIENT_SECRET. Register at https://www.barentswatch.no/minside/ → Mine applikasjoner → create API-client (scope: api).'
    )
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'api',
  })
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`)
  const json = (await res.json()) as TokenResponse
  return json.access_token
}

async function fetchLocalityWeek(
  token: string,
  localityNo: string,
  year: number,
  week: number
): Promise<LocalityWeekV2 | null> {
  const url = `${API_BASE}/v2/geodata/fishhealth/locality/${localityNo}/${year}/${week}`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return (await res.json()) as LocalityWeekV2
}

function isoWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return { year: d.getUTCFullYear(), week }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const weeksArg = process.argv.find(a => a.startsWith('--weeks='))
  const weeksBack = weeksArg ? parseInt(weeksArg.split('=')[1], 10) : 4

  // Graceful skip: BarentsWatch is an optional external-API enrichment. When its
  // credentials are not configured (e.g. missing secrets in CI), skip with a warning
  // and exit 0 so a chained prod-sync (db:prod-sync / registers) can continue instead
  // of hard-failing the whole run.
  if (!dryRun && (!process.env.BARENTSWATCH_CLIENT_ID || !process.env.BARENTSWATCH_CLIENT_SECRET)) {
    console.warn(
      '[fiskehelse] skipper: mangler BARENTSWATCH_CLIENT_ID/SECRET. ' +
        'Registrer API-client på https://www.barentswatch.no/minside/ (Mine applikasjoner, scope: api) ' +
        'og sett dem som secrets for å importere fiskehelsedata.'
    )
    return
  }

  const token = dryRun ? 'dry-run' : await getToken()

  const sites = await prisma.aquacultureSite.findMany({
    where: { licenseStatus: { not: 'revoked' } },
    select: { id: true, localityNumber: true, siteName: true },
  })
  console.log(
    `[fiskehelse] sites=${sites.length} weeksBack=${weeksBack}${dryRun ? ' (DRY RUN)' : ''}`
  )
  if (sites.length === 0) {
    console.warn('[fiskehelse] no sites in DB — run import-akvakulturregister first')
    return
  }

  const now = new Date()
  const targets: Array<{ year: number; week: number }> = []
  for (let i = 1; i <= weeksBack; i++) {
    const d = new Date(now.getTime() - i * 7 * 86400000)
    targets.push(isoWeek(d))
  }

  let observations = 0

  for (const site of sites) {
    for (const { year, week } of targets) {
      if (dryRun) {
        observations++
        continue
      }
      try {
        const data = await fetchLocalityWeek(token, site.localityNumber, year, week)
        if (!data) continue
        const lice = data.liceReport
        const primaryDisease = data.disease?.[0]
        await prisma.fishHealthObservation.upsert({
          where: {
            siteId_year_week_diseaseType: {
              siteId: site.id,
              year,
              week,
              diseaseType: primaryDisease?.name ?? '',
            },
          },
          create: {
            siteId: site.id,
            year,
            week,
            observationDate: primaryDisease?.diagnosisDate
              ? new Date(primaryDisease.diagnosisDate)
              : undefined,
            avgAdultFemaleLice: lice?.avgAdultFemaleLice,
            avgMobileLice: lice?.avgMobileLice,
            avgStationaryLice: lice?.avgStationaryLice,
            seaTemperature: data.seaTemperature,
            isFallow: lice?.isFallow ?? false,
            hasReportedLice: lice?.hasReportedLice ?? false,
            hasBathTreatment: lice?.hasBathTreatment ?? false,
            hasInFeedTreatment: lice?.hasInFeedTreatment ?? false,
            hasMechanicalRemoval: lice?.hasMechanicalRemoval ?? false,
            hasCleanerFishDeployed: lice?.hasCleanerFishDeployed ?? false,
            // Match the upsert `where` (which uses ?? '') so the unique key
            // (siteId, year, week, diseaseType) dedupes lice observations on
            // re-import — Postgres treats NULLs as distinct, so '' must be used consistently.
            diseaseType: primaryDisease?.name ?? '',
            diseaseStatus: primaryDisease?.status,
            source: 'BarentsWatch',
            metadata: { raw: JSON.parse(JSON.stringify(data)) } as any,
          },
          update: {
            avgAdultFemaleLice: lice?.avgAdultFemaleLice,
            avgMobileLice: lice?.avgMobileLice,
            avgStationaryLice: lice?.avgStationaryLice,
            seaTemperature: data.seaTemperature,
            isFallow: lice?.isFallow ?? false,
            hasReportedLice: lice?.hasReportedLice ?? false,
            hasBathTreatment: lice?.hasBathTreatment ?? false,
            hasInFeedTreatment: lice?.hasInFeedTreatment ?? false,
            hasMechanicalRemoval: lice?.hasMechanicalRemoval ?? false,
            hasCleanerFishDeployed: lice?.hasCleanerFishDeployed ?? false,
            diseaseStatus: primaryDisease?.status,
          },
        })
        observations++
      } catch (err) {
        console.warn(
          `[fiskehelse] ${site.localityNumber} ${year}w${week}: ${(err as Error).message}`
        )
      }
    }
  }

  console.log(`[fiskehelse] done: observations=${observations}`)
}

main()
  .catch(err => {
    console.error('[fiskehelse] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
