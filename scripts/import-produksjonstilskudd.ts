import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DEFAULT_YEAR = 2025
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

async function ensureCompany(orgNr: string, orgName: string | null, kommuneNr: string | null) {
  const existing = await prisma.company.findUnique({ where: { orgNr } })
  if (existing) return existing
  return prisma.company.create({
    data: {
      name: orgName || `Jordbruksforetak ${orgNr}`,
      orgNr,
      country: 'NO',
      valueChainStage: 'production',
      ownershipType: 'family',
      metadata: { kommuneNr, source: 'Produksjonstilskudd' },
    },
  })
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const yearArg = process.argv.find(a => a.startsWith('--year='))
  const year = yearArg ? parseInt(yearArg.split('=')[1], 10) : DEFAULT_YEAR
  const limitArg = process.argv.find(a => a.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined

  console.log(`[produksjonstilskudd] fetching ${year}`)
  const rows = await fetchCsv(year)
  console.log(`[produksjonstilskudd] parsed ${rows.length} rows`)

  const slice = limit ? rows.slice(0, limit) : rows
  console.log(
    `[produksjonstilskudd] processing ${slice.length}${dryRun ? ' (DRY RUN)' : ''}`
  )

  let subsidyCount = 0
  let farmCount = 0

  for (const row of slice) {
    const orgNr = normalizeOrgNr(row.orgnr)
    if (!orgNr) continue
    const kommuneNr = row.kommunenr || null
    const orgName = row.orgnavn || null

    if (dryRun) {
      for (const scheme of SCHEME_COLUMNS) {
        const amount = parseAmount(row[scheme])
        if (amount) subsidyCount++
      }
      farmCount++
      continue
    }

    const company = await ensureCompany(orgNr, orgName, kommuneNr)
    farmCount++

    for (const scheme of SCHEME_COLUMNS) {
      const amount = parseAmount(row[scheme])
      if (!amount) continue
      await prisma.subsidy.upsert({
        where: {
          id: `prodtil-${year}-${orgNr}-${scheme}`,
        },
        create: {
          id: `prodtil-${year}-${orgNr}-${scheme}`,
          companyId: company.id,
          subsidyType: 'produksjonstilskudd',
          scheme,
          amountNok: amount,
          year,
          kommuneNr,
          source: 'Landbruksdirektoratet',
        },
        update: {
          amountNok: amount,
          kommuneNr,
          source: 'Landbruksdirektoratet',
        },
      })
      subsidyCount++
    }

    if (farmCount % 500 === 0) {
      console.log(`[produksjonstilskudd] processed ${farmCount} farms`)
    }
  }

  console.log(
    `[produksjonstilskudd] done: farms=${farmCount} subsidyRows=${subsidyCount}`
  )
}

main()
  .catch(err => {
    console.error('[produksjonstilskudd] import failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
