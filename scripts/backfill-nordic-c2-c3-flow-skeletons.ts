/**
 * Backfill FlowCell skeletons for C2 seafood-residue-flow and C3 food-waste-digestate.
 *
 * Safety:
 * - dry-run default (no writes)
 * - --apply upserts FlowCell rows via metadata.pass + keys (no unique constraint)
 * - C2: never invent sludge quantities from AquacultureSite capacity
 * - C3: fill edge1 only from absolute foodWaste tonnes (Totalt / SE retail+consumer); never per-capita→national
 * - internal / gate:internal only
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient, Prisma } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export const C2_CELL_ID = 'seafood-residue-flow'
export const C3_CELL_ID = 'food-waste-digestate'
export const C2_PASS = 'nordic-c2-seafood-residue-2026-09-04'
export const C3_PASS = 'nordic-c3-food-waste-digestate-2026-09-04'
export const COUNTRIES = ['NO', 'SE', 'DK', 'FI', 'IS'] as const
export const DEFAULT_YEAR = 2024

export const C2_SYSTEM_BOUNDARY =
  'Marine/land aquaculture production sites → sludge/residue generation → collection → treatment / land application / other sink. Feed and harvested biomass out of scope for this skeleton.'

export const C3_SYSTEM_BOUNDARY =
  'Household + municipal food-waste collection → biogas / AD → digestate → land application. Industrial food-waste only if the national series cannot separate — then flagged in metadata.'

const C2_EDGES = [
  { fromNode: 'aquaculture_site', toNode: 'sludge_generated' },
  { fromNode: 'sludge_generated', toNode: 'sludge_collected' },
  { fromNode: 'sludge_collected', toNode: 'treatment' },
  { fromNode: 'treatment', toNode: 'unknown_sink' },
] as const

const C3_EDGES = [
  { fromNode: 'household_municipal_waste', toNode: 'collection' },
  { fromNode: 'collection', toNode: 'biogas_ad' },
  { fromNode: 'biogas_ad', toNode: 'digestate' },
  { fromNode: 'digestate', toNode: 'land_application' },
] as const

type MetricRow = {
  country: string
  metricType: string
  category: string
  value: Prisma.Decimal | number
  unit: string | null
  year: string
  source: string
  metadata: unknown
}

export type PlannedFlow = {
  cellId: string
  country: string
  year: number
  substance: string
  fromNode: string
  toNode: string
  quantity: number | null
  unit: string
  quality: string
  systemBoundary: string
  holeReason: string | null
  metadata: Record<string, unknown>
}

export type NoCapacityContext = {
  siteCount: number
  sumTonnes: number
  capacityUnit: string
}

function num(v: Prisma.Decimal | number | null | undefined): number | null {
  if (v == null) return null
  const n = typeof v === 'number' ? v : Number(v.toString())
  return Number.isFinite(n) ? n : null
}

function parseYear(year: string): number | null {
  const m = year.match(/(\d{4})/)
  return m ? Number(m[1]) : null
}

/** C2 mass-chain skeletons: all unknown True-C holes; never proxy from capacity. */
export function planC2Flows(opts?: { noCapacityContext?: NoCapacityContext }): PlannedFlow[] {
  const planned: PlannedFlow[] = []
  for (const country of COUNTRIES) {
    for (const edge of C2_EDGES) {
      const metadata: Record<string, unknown> = {
        pass: C2_PASS,
        note: 'Skeleton only — realized national sludge mass balance unmeasured (True-C). Capacity ≠ realized throughput.',
      }
      if (country === 'NO' && opts?.noCapacityContext) {
        metadata.noLicensedCapacityContext = {
          ...opts.noCapacityContext,
          warning: 'Context only — do not use as FlowCell.quantity (capacity ≠ sludge mass).',
        }
      }
      planned.push({
        cellId: C2_CELL_ID,
        country,
        year: DEFAULT_YEAR,
        substance: 'mass',
        fromNode: edge.fromNode,
        toNode: edge.toNode,
        quantity: null,
        unit: 't',
        quality: 'unknown',
        systemBoundary: C2_SYSTEM_BOUNDARY,
        holeReason:
          'Unmeasured national aquaculture sludge/residue mass balance (True-C). Do not proxy from AquacultureSite capacity.',
        metadata,
      })
    }
  }
  return planned
}

/**
 * C3 mass-chain: fill edge1 when absolute foodWaste tonnes exist (NO Totalt;
 * SE retailAndConsumerStageTotal). Never invent from foodWastePerCapita.
 */
export function planC3Flows(metrics: MetricRow[]): PlannedFlow[] {
  const planned: PlannedFlow[] = []
  const byCountry = new Map<string, MetricRow[]>()
  for (const row of metrics) {
    if (!COUNTRIES.includes(row.country as (typeof COUNTRIES)[number])) continue
    const list = byCountry.get(row.country) ?? []
    list.push(row)
    byCountry.set(row.country, list)
  }

  for (const country of COUNTRIES) {
    const rows = byCountry.get(country) ?? []
    const edge1 = resolveC3Edge1(country, rows)

    for (const edge of C3_EDGES) {
      const isEdge1 =
        edge.fromNode === 'household_municipal_waste' && edge.toNode === 'collection'
      if (isEdge1) {
        planned.push(edge1)
      } else {
        planned.push({
          cellId: C3_CELL_ID,
          country,
          year: edge1.year,
          substance: 'mass',
          fromNode: edge.fromNode,
          toNode: edge.toNode,
          quantity: null,
          unit: 't',
          quality: 'unknown',
          systemBoundary: C3_SYSTEM_BOUNDARY,
          holeReason: `No national measured mass for ${edge.fromNode} → ${edge.toNode} (True-C digestate loop hole).`,
          metadata: { pass: C3_PASS, linkedEdge1Year: edge1.year },
        })
      }
    }
  }

  return planned
}

function resolveC3Edge1(country: string, rows: MetricRow[]): PlannedFlow {
  // Prefer absolute Totalt foodWaste (NO).
  const totalt = rows
    .filter(
      (r) =>
        r.metricType === 'foodWaste' &&
        r.category.trim().toLocaleLowerCase('nb-NO') === 'totalt',
    )
    .map((r) => ({ ...r, y: parseYear(r.year), v: num(r.value) }))
    .filter((r) => r.y != null && r.v != null) as Array<MetricRow & { y: number; v: number }>
  totalt.sort((a, b) => b.y - a.y)
  const bestTotalt = totalt[0]
  if (bestTotalt) {
    return {
      cellId: C3_CELL_ID,
      country,
      year: bestTotalt.y,
      substance: 'mass',
      fromNode: 'household_municipal_waste',
      toNode: 'collection',
      quantity: bestTotalt.v,
      unit: 't',
      quality: 'measured',
      systemBoundary: C3_SYSTEM_BOUNDARY,
      holeReason: null,
      metadata: {
        pass: C3_PASS,
        sourceMetricType: 'foodWaste',
        sourceCategory: bestTotalt.category,
        source: bestTotalt.source,
        sourceYearLabel: bestTotalt.year,
        sourceUnit: bestTotalt.unit,
        methodNote:
          'CountryMetric foodWaste Totalt as absolute tonnes. Totalt may include industry/other stages if the national series cannot separate household+municipal only.',
      },
    }
  }

  // SE retail+consumer stage absolute total (not full national Totalt / not full AD feedstock).
  const seRetail = rows
    .filter(
      (r) =>
        r.metricType === 'foodWaste' &&
        r.category === 'retailAndConsumerStageTotal',
    )
    .map((r) => ({ ...r, y: parseYear(r.year), v: num(r.value) }))
    .filter((r) => r.y != null && r.v != null) as Array<MetricRow & { y: number; v: number }>
  seRetail.sort((a, b) => b.y - a.y)
  const bestSe = seRetail[0]
  if (bestSe) {
    const scopeNote =
      'retailAndConsumerStageTotal — retail+consumer stage only (not full AD feedstock / not national Totalt).'
    return {
      cellId: C3_CELL_ID,
      country,
      year: bestSe.y,
      substance: 'mass',
      fromNode: 'household_municipal_waste',
      toNode: 'collection',
      quantity: bestSe.v,
      unit: 't',
      quality: 'measured',
      systemBoundary: C3_SYSTEM_BOUNDARY,
      holeReason: scopeNote,
      metadata: {
        pass: C3_PASS,
        sourceMetricType: 'foodWaste',
        sourceCategory: bestSe.category,
        source: bestSe.source,
        sourceYearLabel: bestSe.year,
        sourceUnit: bestSe.unit,
        scopeNote,
        methodNote: scopeNote,
      },
    }
  }

  return {
    cellId: C3_CELL_ID,
    country,
    year: DEFAULT_YEAR,
    substance: 'mass',
    fromNode: 'household_municipal_waste',
    toNode: 'collection',
    quantity: null,
    unit: 't',
    quality: 'unknown',
    systemBoundary: C3_SYSTEM_BOUNDARY,
    holeReason:
      'No absolute CountryMetric foodWaste Totalt (tonnes) for country; foodWastePerCapita not converted to national tonnes (would invent population).',
    metadata: { pass: C3_PASS },
  }
}

function createPrisma() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  const adapter = new PrismaPg({ connectionString: url })
  return new PrismaClient({ adapter })
}

async function upsertFlow(prisma: PrismaClient, row: PlannedFlow) {
  const pass = String(row.metadata.pass)
  const existing = await prisma.flowCell.findFirst({
    where: {
      cellId: row.cellId,
      country: row.country,
      year: row.year,
      substance: row.substance,
      fromNode: row.fromNode,
      toNode: row.toNode,
      metadata: { path: ['pass'], equals: pass },
    },
  })
  const data = {
    cellId: row.cellId,
    country: row.country,
    year: row.year,
    substance: row.substance,
    fromNode: row.fromNode,
    toNode: row.toNode,
    quantity: row.quantity,
    unit: row.unit,
    quality: row.quality,
    systemBoundary: row.systemBoundary,
    holeReason: row.holeReason,
    metadata: row.metadata,
  }
  if (existing) {
    await prisma.flowCell.update({ where: { id: existing.id }, data })
    return 'updated' as const
  }
  await prisma.flowCell.create({ data })
  return 'created' as const
}

export async function runC2C3Backfill(argv: string[] = process.argv.slice(2)) {
  const apply = argv.includes('--apply')
  const prisma = createPrisma()
  try {
    for (const cellId of [C2_CELL_ID, C3_CELL_ID]) {
      const cell = await prisma.nordicCell.findUnique({ where: { id: cellId } })
      if (!cell) {
        throw new Error(`NordicCell ${cellId} missing — apply schema migration first`)
      }
    }

    const noCapAgg = await prisma.aquacultureSite.aggregate({
      where: {
        country: 'NO',
        capacityTonnes: { not: null },
        capacityUnit: { in: ['TN', 'MTB'] },
      },
      _count: { _all: true },
      _sum: { capacityTonnes: true },
    })
    const noCapacityContext: NoCapacityContext | undefined =
      noCapAgg._count._all > 0
        ? {
            siteCount: noCapAgg._count._all,
            sumTonnes: Math.round(noCapAgg._sum.capacityTonnes ?? 0),
            capacityUnit: 'TN/MTB',
          }
        : undefined

    const c2 = planC2Flows({ noCapacityContext })

    const metrics = (await prisma.countryMetric.findMany({
      where: {
        metricType: { in: ['foodWaste', 'foodWastePerCapita'] },
        country: { in: [...COUNTRIES] },
      },
      select: {
        country: true,
        metricType: true,
        category: true,
        value: true,
        unit: true,
        year: true,
        source: true,
        metadata: true,
      },
    })) as MetricRow[]

    const c3 = planC3Flows(metrics)
    const planned = [...c2, ...c3]

    const summary = {
      mode: apply ? 'apply' : 'dry-run',
      c2: {
        pass: C2_PASS,
        cellId: C2_CELL_ID,
        plannedRows: c2.length,
        withValues: c2.filter((p) => p.quantity != null).length,
        holes: c2.filter((p) => p.quantity == null).length,
        noCapacityContext: noCapacityContext ?? null,
        byCountry: Object.fromEntries(
          COUNTRIES.map((c) => [
            c,
            c2
              .filter((p) => p.country === c)
              .map((p) => ({
                fromNode: p.fromNode,
                toNode: p.toNode,
                year: p.year,
                quantity: p.quantity,
                quality: p.quality,
              })),
          ]),
        ),
      },
      c3: {
        pass: C3_PASS,
        cellId: C3_CELL_ID,
        sourceMetricRows: metrics.length,
        plannedRows: c3.length,
        withValues: c3.filter((p) => p.quantity != null).length,
        holes: c3.filter((p) => p.quantity == null).length,
        byCountry: Object.fromEntries(
          COUNTRIES.map((c) => [
            c,
            c3
              .filter((p) => p.country === c)
              .map((p) => ({
                fromNode: p.fromNode,
                toNode: p.toNode,
                year: p.year,
                quantity: p.quantity,
                quality: p.quality,
                holeReason: p.holeReason,
              })),
          ]),
        ),
      },
    }

    console.log(JSON.stringify(summary, null, 2))

    if (!apply) return { planned, written: 0, created: 0, updated: 0, summary }

    let created = 0
    let updated = 0
    for (const row of planned) {
      const result = await upsertFlow(prisma, row)
      if (result === 'created') created += 1
      else updated += 1
    }
    const written = created + updated
    console.log(JSON.stringify({ written, created, updated, c2Pass: C2_PASS, c3Pass: C3_PASS }, null, 2))
    return { planned, written, created, updated, summary }
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  runC2C3Backfill().catch((error) => {
    console.error('[nordic-c2-c3-backfill] failed:', error)
    process.exitCode = 1
  })
}
