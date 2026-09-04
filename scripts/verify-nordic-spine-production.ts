/**
 * Fail-closed production verification for the internal Nordic spine backfills.
 *
 * Rebuilds the current plans from their source tables, compares every persisted
 * field written by the backfills, and emits a stable post-state fingerprint.
 * It performs no writes.
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { planC1Indicators, COUNTRIES as C1_COUNTRIES } from './backfill-nordic-c1-retail-concentration'
import {
  planC2Flows,
  planC3Flows,
  COUNTRIES as FLOW_COUNTRIES,
  type NoCapacityContext,
} from './backfill-nordic-c2-c3-flow-skeletons'
import { planAquaNoActivitySignals } from './backfill-nordic-activity-signals-aqua-no'
import {
  verifyNordicSpineProductionSnapshot,
  type NordicSpineExpectedSnapshot,
  type NordicSpineProductionSnapshot,
} from '../src/lib/nordic-spine-production-verifier'

const CELL_IDS = [
  'retail-concentration',
  'seafood-residue-flow',
  'food-waste-digestate',
] as const
const ACTIVITY_PASS = 'nordic-activity-aqua-no-2026-09-04'

export async function verifyNordicSpineProduction(prisma: PrismaClient) {
  const [
    cells,
    indicators,
    flows,
    activities,
    c1Metrics,
    foodWasteMetrics,
    noCapacityAggregate,
    aquaSites,
  ] = await Promise.all([
    prisma.nordicCell.findMany({
      where: { id: { in: [...CELL_IDS] } },
      select: { id: true, status: true },
    }),
    prisma.nordicIndicatorRow.findMany({
      where: { cellId: 'retail-concentration' },
      select: {
        id: true,
        cellId: true,
        country: true,
        indicatorId: true,
        year: true,
        value: true,
        unit: true,
        methodId: true,
        quality: true,
        holeReason: true,
        partnerStatus: true,
        metadata: true,
      },
    }),
    prisma.flowCell.findMany({
      where: { cellId: { in: ['seafood-residue-flow', 'food-waste-digestate'] } },
      select: {
        id: true,
        cellId: true,
        country: true,
        year: true,
        substance: true,
        fromNode: true,
        toNode: true,
        quantity: true,
        unit: true,
        quality: true,
        systemBoundary: true,
        holeReason: true,
        metadata: true,
      },
    }),
    prisma.activitySignal.findMany({
      where: { metadata: { path: ['pass'], equals: ACTIVITY_PASS } },
      select: {
        id: true,
        entityType: true,
        entityId: true,
        domain: true,
        signalType: true,
        year: true,
        value: true,
        unit: true,
        confidence: true,
        source: true,
        metadata: true,
      },
    }),
    prisma.countryMetric.findMany({
      where: {
        metricType: { in: ['hhi', 'retailerShare', 'margin'] },
        country: { in: [...C1_COUNTRIES] },
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
    }),
    prisma.countryMetric.findMany({
      where: {
        metricType: { in: ['foodWaste', 'foodWastePerCapita'] },
        country: { in: [...FLOW_COUNTRIES] },
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
    }),
    prisma.aquacultureSite.aggregate({
      where: {
        country: 'NO',
        capacityTonnes: { not: null },
        capacityUnit: { in: ['TN', 'MTB'] },
      },
      _count: { _all: true },
      _sum: { capacityTonnes: true },
    }),
    prisma.aquacultureSite.findMany({
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
    }),
  ])

  const noCapacityContext: NoCapacityContext | undefined =
    noCapacityAggregate._count._all > 0
      ? {
          siteCount: noCapacityAggregate._count._all,
          sumTonnes: Math.round(noCapacityAggregate._sum.capacityTonnes ?? 0),
          capacityUnit: 'TN/MTB',
        }
      : undefined

  const snapshot: NordicSpineProductionSnapshot = {
    cells,
    indicators: indicators.map(row => ({
      ...row,
      value: row.value == null ? null : Number(row.value.toString()),
    })),
    flows,
    activities,
  }

  const expected: NordicSpineExpectedSnapshot = {
    cells: CELL_IDS.map(id => ({ id, status: 'frozen' })),
    indicators: planC1Indicators(
      c1Metrics as Parameters<typeof planC1Indicators>[0],
    ),
    flows: [
      ...planC2Flows({ noCapacityContext }),
      ...planC3Flows(foodWasteMetrics as Parameters<typeof planC3Flows>[0]),
    ],
    activities: planAquaNoActivitySignals(
      aquaSites as Parameters<typeof planAquaNoActivitySignals>[0],
    ),
  }

  return verifyNordicSpineProductionSnapshot(snapshot, expected)
}

function createPrisma() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL required')
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

async function main() {
  const prisma = createPrisma()
  try {
    const result = await verifyNordicSpineProduction(prisma)
    console.log(JSON.stringify({ counts: result.counts }, null, 2))
    console.log(`NORDIC_SPINE_FINGERPRINT=${result.fingerprint}`)
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = import.meta.url === pathToFileURL(process.argv[1] ?? '').href
if (isMain) {
  main().catch(error => {
    console.error('[verify-nordic-spine-production] failed:', error)
    process.exitCode = 1
  })
}
