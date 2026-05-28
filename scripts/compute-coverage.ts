import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { DATASETS } from '../src/lib/coverage/datasets'
import { buildProfile, type RawDatasetData } from '../src/lib/coverage/build-profile'
import type { CoverageProfile, DatasetSpec } from '../src/lib/coverage/types'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function tally(rows: Array<{ verificationStatus?: string | null }>): Record<string, number> {
  const vc: Record<string, number> = {}
  for (const r of rows) {
    const s = r.verificationStatus ?? 'null'
    vc[s] = (vc[s] ?? 0) + 1
  }
  return vc
}

async function rawFor(spec: DatasetSpec): Promise<RawDatasetData> {
  switch (spec.model) {
    case 'subsidy': {
      const rows = await prisma.subsidy.findMany({ select: { year: true, verificationStatus: true } })
      return {
        years: rows.map((r) => r.year).filter((y): y is number => y != null),
        countries: spec.fixedCountries ?? [],
        verificationStatusCounts: tally(rows),
      }
    }
    case 'deliveryVolume': {
      const rows = await prisma.deliveryVolume.findMany({ select: { year: true } })
      return { years: rows.map((r) => r.year), countries: spec.fixedCountries ?? [], verificationStatusCounts: {} }
    }
    case 'companyFinancial': {
      const rows = await prisma.companyFinancial.findMany({ select: { year: true, verificationStatus: true } })
      return { years: rows.map((r) => r.year), countries: spec.fixedCountries ?? [], verificationStatusCounts: tally(rows) }
    }
    case 'countryMetric': {
      const rows = await prisma.countryMetric.findMany({
        where: spec.metricType ? { metricType: spec.metricType } : undefined,
        select: { year: true, country: true },
      })
      return {
        years: rows.map((r) => Number(r.year)).filter((y) => Number.isFinite(y)),
        countries: rows.map((r) => r.country),
        verificationStatusCounts: {},
      }
    }
  }
  throw new Error(`Unknown dataset model: ${String((spec as DatasetSpec).model)}`)
}

async function main() {
  const computedEnv = process.env.COVERAGE_ENV === 'prod' ? 'prod' : 'local'
  const computedAt = new Date().toISOString()
  const profiles: CoverageProfile[] = []
  for (const spec of DATASETS) {
    const raw = await rawFor(spec)
    profiles.push(buildProfile(spec, raw, computedAt, computedEnv))
  }
  const outDir = join(process.cwd(), 'public', 'data', 'coverage')
  mkdirSync(outDir, { recursive: true })
  writeFileSync(join(outDir, 'profiles.json'), JSON.stringify({ computedAt, computedEnv, profiles }, null, 2))
  console.log(`Wrote ${profiles.length} coverage profiles → public/data/coverage/profiles.json (env=${computedEnv})`)
  for (const p of profiles) {
    console.log(`  ${p.datasetId}: temporal=${p.temporal.kind} geo=${p.geographic.countries.join('/')} proxy=${p.geographic.noAsNordicProxy} verif=${p.verification.rollup}`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
