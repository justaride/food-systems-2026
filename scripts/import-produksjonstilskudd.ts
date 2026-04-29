import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEFAULT_YEAR = 2025
const COMPANY_BATCH_SIZE = 1000
const SUBSIDY_BATCH_SIZE = 2000

const urlForYear = (year: number) =>
  `https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/produksjon-og-avlosertilskudd/${year}/dataset.csv`

const SCHEME_COLUMNS = [
  'arealtilskudd',
  'avloesertilskudd',
  'beitetilskudd',
  'bevaringsverdige_husdyr_tilsku',
  'distriktstilskudd_frukt_groent',
  'distriktstilskudd_potet_gronns',
  'oeko_grønt_tilskudd',
  'husdyrtilskudd',
  'kulturlandskapstilskudd',
  'melkeproduksjon',
  'oekologiskarealtilskudd',
  'oekologiskhusdyrtilskudd',
  'smaa_mellomstore_melkebruk',
  'storfekjoettproduksjon',
  'utmarksbeitetilskudd',
] as const

type SchemeCol = (typeof SCHEME_COLUMNS)[number]

type FarmRow = {
  orgNr: string
  orgName: string | null
  kommuneNr: string | null
}

type SubsidyRow = {
  id: string
  orgNr: string
  scheme: SchemeCol
  amount: number
  kommuneNr: string | null
}

function parseCsv(text: string, delimiter: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []
  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase())
  return lines.slice(1).map(line => {
    const cells = line.split(delimiter)
    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = (cells[idx] ?? '').trim()
    })
    return row
  })
}

function normalizeOrgNr(raw: string | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length !== 9) return null
  return digits
}

function parseAmount(raw: string | undefined): number | null {
  if (!raw) return null
  const cleaned = raw.replace(/\s/g, '').replace(',', '.')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) && n !== 0 ? n : null
}

async function fetchCsv(year: number) {
  const url = urlForYear(year)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch tilskudd CSV ${year}: ${res.status}`)
  const text = await res.text()
  const delimiter = text.split(/\r?\n/)[0].includes(';') ? ';' : ','
  return parseCsv(text, delimiter)
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const yearArg = process.argv.find(a => a.startsWith('--year='))
  const year = yearArg ? parseInt(yearArg.split('=')[1], 10) : DEFAULT_YEAR
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log(`[produksjonstilskudd] fetching ${year}`)
  const rawRows = await fetchCsv(year)
  console.log(`[produksjonstilskudd] parsed ${rawRows.length} CSV rows`)

  const slice = limit ? rawRows.slice(0, limit) : rawRows

  const farms = new Map<string, FarmRow>()
  const subsidies: SubsidyRow[] = []

  for (const row of slice) {
    const orgNr = normalizeOrgNr(row.orgnr)
    if (!orgNr) continue
    const kommuneNr = row.kommunenr || null
    const orgName = row.orgnavn || null

    if (!farms.has(orgNr)) {
      farms.set(orgNr, { orgNr, orgName, kommuneNr })
    }

    for (const scheme of SCHEME_COLUMNS) {
      const amount = parseAmount(row[scheme])
      if (!amount) continue
      subsidies.push({
        id: `prodtil-${year}-${orgNr}-${scheme}`,
        orgNr,
        scheme,
        amount,
        kommuneNr,
      })
    }
  }

  console.log(
    `[produksjonstilskudd] aggregated farms=${farms.size} subsidyRows=${subsidies.length}${dryRun ? ' (DRY RUN)' : ''}`
  )

  if (dryRun) return

  const orgNrs = [...farms.keys()]

  console.log(`[produksjonstilskudd] looking up ${orgNrs.length} existing companies`)
  const existingCompanies: { id: string; orgNr: string }[] = []
  for (const ids of chunk(orgNrs, 5000)) {
    const found = await prisma.company.findMany({
      where: { orgNr: { in: ids } },
      select: { id: true, orgNr: true },
    })
    existingCompanies.push(...found)
  }
  const orgNrToId = new Map(existingCompanies.map(c => [c.orgNr, c.id]))
  console.log(`[produksjonstilskudd] found ${existingCompanies.length} existing companies`)

  const newCompanies = [...farms.values()]
    .filter(f => !orgNrToId.has(f.orgNr))
    .map(f => ({
      name: f.orgName || `Jordbruksforetak ${f.orgNr}`,
      orgNr: f.orgNr,
      country: 'NO',
      valueChainStage: 'production',
      ownershipType: 'family',
      metadata: { kommuneNr: f.kommuneNr, source: 'Produksjonstilskudd' } as any,
    }))

  if (newCompanies.length > 0) {
    console.log(`[produksjonstilskudd] creating ${newCompanies.length} new companies`)
    for (const batch of chunk(newCompanies, COMPANY_BATCH_SIZE)) {
      await prisma.company.createMany({ data: batch, skipDuplicates: true })
    }
    const newOrgNrs = newCompanies.map(c => c.orgNr)
    for (const ids of chunk(newOrgNrs, 5000)) {
      const inserted = await prisma.company.findMany({
        where: { orgNr: { in: ids } },
        select: { id: true, orgNr: true },
      })
      for (const c of inserted) orgNrToId.set(c.orgNr, c.id)
    }
  }

  console.log(
    `[produksjonstilskudd] deleting existing subsidies for year=${year} subsidyType=produksjonstilskudd`
  )
  const deleted = await prisma.subsidy.deleteMany({
    where: { subsidyType: 'produksjonstilskudd', year },
  })
  console.log(`[produksjonstilskudd] deleted ${deleted.count} stale rows`)

  const subsidyData = subsidies
    .map(s => {
      const companyId = orgNrToId.get(s.orgNr)
      if (!companyId) return null
      return {
        id: s.id,
        companyId,
        subsidyType: 'produksjonstilskudd',
        scheme: s.scheme,
        amountNok: s.amount,
        year,
        kommuneNr: s.kommuneNr,
        source: 'Landbruksdirektoratet',
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)

  const skippedCount = subsidies.length - subsidyData.length
  if (skippedCount > 0) {
    console.warn(
      `[produksjonstilskudd] WARNING: ${skippedCount} subsidies skipped (companyId lookup failed)`
    )
  }

  console.log(`[produksjonstilskudd] inserting ${subsidyData.length} subsidies in batches`)
  let inserted = 0
  for (const batch of chunk(subsidyData, SUBSIDY_BATCH_SIZE)) {
    const result = await prisma.subsidy.createMany({
      data: batch,
      skipDuplicates: true,
    })
    inserted += result.count
    if (inserted % (SUBSIDY_BATCH_SIZE * 5) === 0 || inserted === subsidyData.length) {
      console.log(`[produksjonstilskudd] inserted ${inserted}/${subsidyData.length}`)
    }
  }

  console.log(
    `[produksjonstilskudd] done: farms=${farms.size} newCompanies=${newCompanies.length} subsidiesInserted=${inserted}`
  )
}

main()
  .catch(err => {
    console.error('[produksjonstilskudd] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
