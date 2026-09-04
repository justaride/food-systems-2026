/**
 * Fail-closed production verification for the internal Nordic spine backfills.
 *
 * Reads only the three spine tables and the exact current ActivitySignal pass,
 * then checks counts, logical-key uniqueness, internal authority and a stable
 * post-state fingerprint. It performs no writes.
 */

import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  verifyNordicSpineProductionSnapshot,
  type NordicSpineProductionSnapshot,
} from '../src/lib/nordic-spine-production-verifier'

const CELL_IDS = [
  'retail-concentration',
  'seafood-residue-flow',
  'food-waste-digestate',
] as const
const ACTIVITY_PASS = 'nordic-activity-aqua-no-2026-09-04'

function metadataPass(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const pass = (metadata as Record<string, unknown>).pass
  return typeof pass === 'string' ? pass : null
}

export async function verifyNordicSpineProduction(prisma: PrismaClient) {
  const [cells, indicators, flows, activities] = await Promise.all([
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
      where: {
        cellId: { in: ['seafood-residue-flow', 'food-waste-digestate'] },
        substance: 'mass',
      },
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
        holeReason: true,
        metadata: true,
      },
    }),
    prisma.activitySignal.findMany({
      where: {
        domain: 'seafood',
        signalType: 'licensed_capacity_mtb',
        metadata: { path: ['pass'], equals: ACTIVITY_PASS },
      },
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
        metadata: true,
      },
    }),
  ])

  const snapshot: NordicSpineProductionSnapshot = {
    cells,
    indicators: indicators.map(row => ({
      ...row,
      value: row.value?.toString() ?? null,
      metadataPass: metadataPass(row.metadata),
    })),
    flows: flows.map(row => ({
      ...row,
      metadataPass: metadataPass(row.metadata),
    })),
    activities: activities.map(row => ({
      ...row,
      metadataPass: metadataPass(row.metadata),
    })),
  }

  return verifyNordicSpineProductionSnapshot(snapshot)
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
