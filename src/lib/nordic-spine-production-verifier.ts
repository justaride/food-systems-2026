export type NordicSpineProductionSnapshot = {
  cells: Array<{ id: string; status: string }>
  indicators: Array<{
    id: string
    cellId: string
    country: string
    indicatorId: string
    year: number
    value: string | null
    unit: string
    methodId: string
    quality: string
    holeReason: string | null
    partnerStatus: string
    metadataPass: string | null
  }>
  flows: Array<{
    id: string
    cellId: string
    country: string
    year: number
    substance: string
    fromNode: string
    toNode: string
    quantity: number | null
    unit: string
    quality: string
    holeReason: string | null
    metadataPass: string | null
  }>
  activities: Array<{
    id: string
    entityType: string
    entityId: string
    domain: string
    signalType: string
    year: number
    value: number | null
    unit: string | null
    confidence: string
    metadataPass: string | null
  }>
}

type VerificationCounts = {
  c1: { filled: number; holes: number; total: number }
  c2: { filled: number; holes: number; total: number }
  c3: { filled: number; holes: number; total: number }
  activity: { count: number; sum: number }
}

function requireExact(label: string, actual: number, expected: number) {
  if (actual !== expected) throw new Error(`${label} expected ${expected}, found ${actual}`)
}

function requireUnique(label: string, keys: string[]) {
  const seen = new Set<string>()
  for (const key of keys) {
    if (seen.has(key)) throw new Error(`duplicate ${label} logical key: ${key}`)
    seen.add(key)
  }
}

function sortById<T extends { id: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.id.localeCompare(b.id))
}

export function verifyNordicSpineProductionSnapshot(snapshot: NordicSpineProductionSnapshot): {
  counts: VerificationCounts
  fingerprint: string
} {
  const expectedCells = [C1_CELL_ID, C2_CELL_ID, C3_CELL_ID]
  requireExact('NordicCell', snapshot.cells.length, expectedCells.length)
  for (const id of expectedCells) {
    const cell = snapshot.cells.find(row => row.id === id)
    if (!cell) throw new Error(`NordicCell missing: ${id}`)
    if (cell.status !== 'frozen') throw new Error(`NordicCell ${id} must remain frozen`)
  }

  requireExact('C1', snapshot.indicators.length, 37)
  if (snapshot.indicators.some(row => row.cellId !== C1_CELL_ID || row.metadataPass !== C1_PASS)) {
    throw new Error('C1 rows must use the exact cell and pass')
  }
  if (snapshot.indicators.some(row => row.partnerStatus !== 'internal')) {
    throw new Error('C1 rows must remain internal')
  }
  requireUnique(
    'C1',
    snapshot.indicators.map(row =>
      [row.cellId, row.country, row.indicatorId, row.year, row.methodId].join('|'),
    ),
  )

  const c2 = snapshot.flows.filter(row => row.cellId === C2_CELL_ID)
  const c3 = snapshot.flows.filter(row => row.cellId === C3_CELL_ID)
  requireExact('C2', c2.length, 20)
  requireExact('C3', c3.length, 20)
  if (c2.some(row => row.metadataPass !== C2_PASS)) {
    throw new Error('C2 rows must use the exact pass')
  }
  if (c3.some(row => row.metadataPass !== C3_PASS)) {
    throw new Error('C3 rows must use the exact pass')
  }
  const flowKey = (row: (typeof snapshot.flows)[number]) =>
    [row.cellId, row.country, row.year, row.substance, row.fromNode, row.toNode].join('|')
  requireUnique('C2', c2.map(flowKey))
  requireUnique('C3', c3.map(flowKey))

  requireExact('ActivitySignal', snapshot.activities.length, 250)
  if (
    snapshot.activities.some(
      row =>
        row.metadataPass !== ACTIVITY_PASS ||
        row.entityType !== 'site' ||
        row.domain !== 'seafood' ||
        row.signalType !== 'licensed_capacity_mtb' ||
        row.year !== 2024,
    )
  ) {
    throw new Error('ActivitySignal rows must use the exact internal 2024 pass contract')
  }
  requireUnique(
    'ActivitySignal',
    snapshot.activities.map(row =>
      [row.entityType, row.entityId, row.signalType, row.year].join('|'),
    ),
  )

  const counts: VerificationCounts = {
    c1: {
      filled: snapshot.indicators.filter(row => row.value != null).length,
      holes: snapshot.indicators.filter(row => row.value == null).length,
      total: snapshot.indicators.length,
    },
    c2: {
      filled: c2.filter(row => row.quantity != null).length,
      holes: c2.filter(row => row.quantity == null).length,
      total: c2.length,
    },
    c3: {
      filled: c3.filter(row => row.quantity != null).length,
      holes: c3.filter(row => row.quantity == null).length,
      total: c3.length,
    },
    activity: {
      count: snapshot.activities.length,
      sum: Math.round(snapshot.activities.reduce((sum, row) => sum + (row.value ?? 0), 0)),
    },
  }

  requireExact('C1 filled', counts.c1.filled, 34)
  requireExact('C1 holes', counts.c1.holes, 3)
  requireExact('C2 filled', counts.c2.filled, 0)
  requireExact('C2 holes', counts.c2.holes, 20)
  requireExact('C3 filled', counts.c3.filled, 2)
  requireExact('C3 holes', counts.c3.holes, 18)
  requireExact('ActivitySignal sum', counts.activity.sum, 988478)

  const canonical = JSON.stringify({
    cells: [...snapshot.cells].sort((a, b) => a.id.localeCompare(b.id)),
    indicators: sortById(snapshot.indicators),
    flows: sortById(snapshot.flows),
    activities: sortById(snapshot.activities),
  })

  return {
    counts,
    fingerprint: createHash('sha256').update(canonical).digest('hex'),
  }
}
import { createHash } from 'node:crypto'

const C1_CELL_ID = 'retail-concentration'
const C2_CELL_ID = 'seafood-residue-flow'
const C3_CELL_ID = 'food-waste-digestate'
const C1_PASS = 'nordic-c1-retail-concentration-2026-09-04'
const C2_PASS = 'nordic-c2-seafood-residue-2026-09-04'
const C3_PASS = 'nordic-c3-food-waste-digestate-2026-09-04'
const ACTIVITY_PASS = 'nordic-activity-aqua-no-2026-09-04'
