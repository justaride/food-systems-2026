import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { isAquacultureTonnageUnit } from '../src/lib/aquaculture-capacity'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Counts how many AquacultureSite rows are missing capacity / species / status,
// broken down by placement (LAND vs sea), to quantify the "—" gaps in /havbruk.
//
// Run: npx tsx scripts/audit-aquaculture-coverage.ts

type Bucket = {
  total: number
  noTonnage: number // capacity not expressed as a tonnage (MTB) value > 0
  noSpecies: number
  noStatus: number
}

function emptyBucket(): Bucket {
  return { total: 0, noTonnage: 0, noSpecies: 0, noStatus: 0 }
}

function pct(part: number, whole: number) {
  return whole === 0 ? '0%' : `${Math.round((part / whole) * 100)}%`
}

async function main() {
  const sites = await prisma.aquacultureSite.findMany({
    select: {
      placement: true,
      capacityTonnes: true,
      capacityUnit: true,
      species: true,
      licenseStatus: true,
    },
  })

  const byPlacement = new Map<string, Bucket>()
  const overall = emptyBucket()

  for (const s of sites) {
    const key = (s.placement ?? 'UKJENT').toUpperCase()
    const b = byPlacement.get(key) ?? emptyBucket()

    const hasTonnage =
      isAquacultureTonnageUnit(s.capacityUnit) && Number(s.capacityTonnes ?? 0) > 0
    const hasSpecies = (s.species ?? []).length > 0
    const hasStatus = Boolean(s.licenseStatus)

    for (const target of [b, overall]) {
      target.total += 1
      if (!hasTonnage) target.noTonnage += 1
      if (!hasSpecies) target.noSpecies += 1
      if (!hasStatus) target.noStatus += 1
    }
    byPlacement.set(key, b)
  }

  console.log(`\nAquacultureSite coverage audit (${overall.total} lokaliteter)\n`)
  const header = `${'Plassering'.padEnd(12)} ${'Antall'.padStart(7)} ${'Uten MTB'.padStart(14)} ${'Uten art'.padStart(14)} ${'Uten status'.padStart(14)}`
  console.log(header)
  console.log('-'.repeat(header.length))

  const rows = [...byPlacement.entries()].sort((a, b) => b[1].total - a[1].total)
  for (const [placement, b] of rows) {
    console.log(
      `${placement.padEnd(12)} ${String(b.total).padStart(7)} ` +
        `${`${b.noTonnage} (${pct(b.noTonnage, b.total)})`.padStart(14)} ` +
        `${`${b.noSpecies} (${pct(b.noSpecies, b.total)})`.padStart(14)} ` +
        `${`${b.noStatus} (${pct(b.noStatus, b.total)})`.padStart(14)}`
    )
  }
  console.log('-'.repeat(header.length))
  console.log(
    `${'TOTALT'.padEnd(12)} ${String(overall.total).padStart(7)} ` +
      `${`${overall.noTonnage} (${pct(overall.noTonnage, overall.total)})`.padStart(14)} ` +
      `${`${overall.noSpecies} (${pct(overall.noSpecies, overall.total)})`.padStart(14)} ` +
      `${`${overall.noStatus} (${pct(overall.noStatus, overall.total)})`.padStart(14)}`
  )
  console.log(
    '\nMerk: "Uten MTB" teller lokaliteter uten en tonnasje-kapasitet > 0 ' +
      '(landanlegg måles typisk i antall fisk/STK, ikke MTB).\n'
  )
}

main()
  .catch(err => {
    console.error('[aquaculture-coverage] audit failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
