import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  type SiteSummary,
  type SiteDetail,
  type SitePayload,
  buildSitePayload,
  localityNumber,
} from './lib/akvakultur-transform'

// READ-ONLY. Re-fetches every tracked seafood operator's sites from the
// Fiskeridirektoratet pub-aqua API, recomputes the canonical field set with the
// exact same transform the importer uses, and diffs it against what is stored in
// the DB. Prints every discrepancy so you can confirm the data is 100% correct
// (or see precisely what a re-import would change).
//
// Run: npx tsx scripts/audit-aquaculture-reconcile.ts            (all operators)
//      npx tsx scripts/audit-aquaculture-reconcile.ts --org-nr=964118191
//      npx tsx scripts/audit-aquaculture-reconcile.ts --samples=20  (max sample locs per field)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const BASE = 'https://api.fiskeridir.no/pub-aqua/api/v1'

async function fetchJson<T>(url: string): Promise<T | null> {
  for (let attempt = 0; attempt <= 3; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (res.ok) return (await res.json()) as T
    if (res.status === 429 && attempt < 3) {
      await new Promise(r => setTimeout(r, 1000 * 2 ** attempt))
      continue
    }
    return null
  }
  return null
}

async function fetchSites(orgNr: string): Promise<SiteSummary[]> {
  const data = await fetchJson<SiteSummary[] | { items?: SiteSummary[] }>(
    `${BASE}/entities/sites-by-entity-nr/${orgNr}`
  )
  if (Array.isArray(data)) return data
  if (data && Array.isArray((data as { items?: SiteSummary[] }).items)) {
    return (data as { items: SiteSummary[] }).items
  }
  return []
}

const COMPARED_FIELDS: (keyof SitePayload)[] = [
  'siteName',
  'municipality',
  'municipalityNo',
  'county',
  'lat',
  'lng',
  'licenseStatus',
  'placement',
  'waterType',
  'capacityTonnes',
  'capacityUnit',
  'species',
  'productionTypes',
]

function norm(v: unknown): string {
  if (v == null) return '∅'
  if (Array.isArray(v)) return JSON.stringify([...v].map(String).sort())
  if (typeof v === 'number') return String(v)
  return String(v)
}

function eq(a: unknown, b: unknown): boolean {
  return norm(a) === norm(b)
}

async function main() {
  const orgArg = process.argv.find(a => a.startsWith('--org-nr='))
  const orgFilter = orgArg
    ? new Set(orgArg.split('=')[1].split(',').map(s => s.replace(/\D/g, '')).filter(Boolean))
    : null
  const sampleArg = process.argv.find(a => a.startsWith('--samples='))
  const maxSamples = sampleArg ? parseInt(sampleArg.split('=')[1], 10) || 8 : 8

  const companies = await prisma.company.findMany({
    where: { valueChainStage: 'seafood', country: 'NO' },
    select: { id: true, orgNr: true, name: true },
  })
  const targets = orgFilter ? companies.filter(c => orgFilter.has(c.orgNr)) : companies

  const dbSites = await prisma.aquacultureSite.findMany()
  const dbByLoc = new Map(dbSites.map(s => [s.localityNumber, s]))

  const mismatches = new Map<string, string[]>() // field -> sample localityNumbers
  const fieldCounts = new Map<string, number>()
  let checked = 0
  let perfect = 0
  const missingInDb: string[] = []
  const seenLoc = new Set<string>()

  // Two-pass: mirror import upsert semantics (last company wins per locality).
  // Pass 1 — build expected map; later companies override earlier ones for shared sites.
  const detailCache = new Map<string, SiteDetail | null>()
  const expectedMap = new Map<string, SitePayload>()

  for (const company of targets) {
    const summaries = await fetchSites(company.orgNr)
    for (const summary of summaries) {
      const loc = localityNumber(summary)
      seenLoc.add(loc)
      if (!detailCache.has(loc)) {
        detailCache.set(loc, await fetchJson<SiteDetail>(`${BASE}/sites/${loc}`))
      }
      expectedMap.set(loc, buildSitePayload(summary, detailCache.get(loc) ?? null))
    }
  }

  // Pass 2 — compare final expected values against DB.
  for (const [loc, expected] of expectedMap) {
    const row = dbByLoc.get(loc)
    if (!row) {
      missingInDb.push(loc)
      continue
    }
    checked++
    let clean = true
    for (const f of COMPARED_FIELDS) {
      if (!eq((row as Record<string, unknown>)[f], expected[f])) {
        clean = false
        fieldCounts.set(f, (fieldCounts.get(f) ?? 0) + 1)
        const arr = mismatches.get(f) ?? []
        if (arr.length < maxSamples) arr.push(loc)
        mismatches.set(f, arr)
      }
    }
    if (clean) perfect++
  }

  const orphanInDb = dbSites.filter(s => !seenLoc.has(s.localityNumber)).map(s => s.localityNumber)

  console.log(`\nAquaculture reconciliation (operators=${targets.length})\n`)
  console.log(`Sites checked vs API : ${checked}`)
  console.log(`Fully correct        : ${perfect} (${checked ? Math.round((perfect / checked) * 100) : 0}%)`)
  console.log(`In API, missing in DB: ${missingInDb.length}${missingInDb.length ? ' -> ' + missingInDb.slice(0, 15).join(', ') : ''}`)
  console.log(`In DB, not in API    : ${orphanInDb.length}${orphanInDb.length ? ' -> ' + orphanInDb.slice(0, 15).join(', ') : ''}`)

  if (fieldCounts.size === 0) {
    console.log('\n✅ Every compared field matches the live source for all checked sites.\n')
  } else {
    console.log('\nField discrepancies (stored DB value != live source):\n')
    const sorted = [...fieldCounts.entries()].sort((a, b) => b[1] - a[1])
    for (const [field, count] of sorted) {
      console.log(`  ${field.padEnd(16)} ${String(count).padStart(5)}  e.g. ${(mismatches.get(field) ?? []).join(', ')}`)
    }
    console.log('\nRun `npm run db:import:akvakulturregister` to bring the DB in sync, then re-run this audit.\n')
  }
}

main()
  .catch(err => {
    console.error('[aquaculture-reconcile] failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
