/**
 * Thin NO aquaculture ActivitySignal backfill: licensed capacity (TN/MTB) per site.
 *
 * Safety:
 * - dry-run default (no writes)
 * - --apply upserts via metadata.pass + entityId + signalType + year
 * - Skip STK (pieces) and DA; only TN/MTB with capacityTonnes
 * - Capacity signal only — does not invent sludge/throughput
 * - internal / gate:internal only
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { NORDIC_AQUA_ACTIVITY_PASS } from '../src/lib/nordic-spine'

export const AQUA_PASS = NORDIC_AQUA_ACTIVITY_PASS
export const SIGNAL_TYPE = 'licensed_capacity_mtb'
export const DOMAIN = 'seafood'
export const DEFAULT_YEAR = 2024
export const ALLOWED_CAPACITY_UNITS = new Set(['TN', 'MTB'])
export const SKIP_CAPACITY_UNITS = new Set(['STK', 'DA'])

const ACTIVE_STATUSES = new Set(['aktiv', 'active', 'i drift', 'idriftsatt', 'in drift'])

export type AquaSiteInput = {
  id: string
  country: string
  capacityTonnes: number | null
  capacityUnit: string | null
  licenseStatus: string | null
  licenseIssuedYear: number | null
  source: string | null
}

export type PlannedActivitySignal = {
  entityType: string
  entityId: string
  domain: string
  signalType: string
  year: number
  value: number
  unit: string
  confidence: string
  source: string
  metadata: Record<string, unknown>
}

function looksActive(status: string | null): boolean {
  if (!status) return false
  const s = status.trim().toLocaleLowerCase('nb-NO')
  return ACTIVE_STATUSES.has(s)
}

/** Plan licensed_capacity_mtb signals; excludes STK/DA and requires a known active status. */
export function planAquaNoActivitySignals(sites: AquaSiteInput[]): PlannedActivitySignal[] {
  const eligible = sites.filter((s) => {
    if (s.country !== 'NO') return false
    if (s.capacityTonnes == null || !Number.isFinite(s.capacityTonnes)) return false
    const unit = (s.capacityUnit ?? '').toUpperCase()
    if (SKIP_CAPACITY_UNITS.has(unit)) return false
    if (!ALLOWED_CAPACITY_UNITS.has(unit)) return false
    return true
  })

  const selected = eligible.filter((s) => looksActive(s.licenseStatus))
  const inclusionNote =
    'Included only exact active licenseStatus values (aktiv/active/i drift/idriftsatt/in drift); unknown or inactive statuses fail closed.'

  return selected.map((site) => {
    const unit = (site.capacityUnit ?? 'MTB').toUpperCase()
    return {
      entityType: 'site',
      entityId: site.id,
      domain: DOMAIN,
      signalType: SIGNAL_TYPE,
      year: DEFAULT_YEAR,
      value: site.capacityTonnes as number,
      unit: 't',
      confidence: 'high',
      source: site.source?.trim() || 'fiskeridir',
      metadata: {
        pass: AQUA_PASS,
        capacityUnitRaw: unit,
        licenseStatus: site.licenseStatus,
        licenseIssuedYear: site.licenseIssuedYear,
        inclusionNote,
        note: 'Licensed/installed capacity (MTB/TN as tonnes) — not realized production or sludge.',
      },
    }
  })
}

function createPrisma() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

async function upsertSignal(prisma: PrismaClient, row: PlannedActivitySignal) {
  const existing = await prisma.activitySignal.findFirst({
    where: {
      entityType: row.entityType,
      entityId: row.entityId,
      signalType: row.signalType,
      year: row.year,
      metadata: { path: ['pass'], equals: AQUA_PASS },
    },
  })
  const data = {
    entityType: row.entityType,
    entityId: row.entityId,
    domain: row.domain,
    signalType: row.signalType,
    year: row.year,
    value: row.value,
    unit: row.unit,
    confidence: row.confidence,
    source: row.source,
    metadata: row.metadata as Prisma.InputJsonValue,
  }
  if (existing) {
    await prisma.activitySignal.update({ where: { id: existing.id }, data })
    return 'updated' as const
  }
  await prisma.activitySignal.create({ data })
  return 'created' as const
}

export async function runAquaNoActivityBackfill(argv: string[] = process.argv.slice(2)) {
  const apply = argv.includes('--apply')
  const prisma = createPrisma()
  try {
    const sites = await prisma.aquacultureSite.findMany({
      where: { country: 'NO' },
      select: {
        id: true,
        country: true,
        capacityTonnes: true,
        capacityUnit: true,
        licenseStatus: true,
        licenseIssuedYear: true,
        source: true,
      },
    })

    const planned = planAquaNoActivitySignals(sites)
    const skippedStk = sites.filter((s) => (s.capacityUnit ?? '').toUpperCase() === 'STK').length
    const skippedDa = sites.filter((s) => (s.capacityUnit ?? '').toUpperCase() === 'DA').length
    const sumTonnes = planned.reduce((s, p) => s + p.value, 0)

    const summary = {
      mode: apply ? 'apply' : 'dry-run',
      pass: AQUA_PASS,
      sourceSites: sites.length,
      plannedSignals: planned.length,
      skippedStk,
      skippedDa,
      sumTonnes: Math.round(sumTonnes),
      sample: planned.slice(0, 3).map((p) => ({
        entityId: p.entityId,
        year: p.year,
        value: p.value,
        unit: p.unit,
        source: p.source,
      })),
    }
    console.log(JSON.stringify(summary, null, 2))

    if (!apply) return { planned, written: 0, created: 0, updated: 0, summary }

    let created = 0
    let updated = 0
    for (const row of planned) {
      const result = await upsertSignal(prisma, row)
      if (result === 'created') created += 1
      else updated += 1
    }
    const written = created + updated
    console.log(JSON.stringify({ written, created, updated, pass: AQUA_PASS }, null, 2))
    return { planned, written, created, updated, summary }
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  runAquaNoActivityBackfill().catch((error) => {
    console.error('[nordic-activity-aqua-no] failed:', error)
    process.exitCode = 1
  })
}
