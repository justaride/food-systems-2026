import { createHash } from 'node:crypto'

const C1_CELL_ID = 'retail-concentration'
const C2_CELL_ID = 'seafood-residue-flow'
const C3_CELL_ID = 'food-waste-digestate'
const C1_PASS = 'nordic-c1-retail-concentration-2026-09-04'
const C2_PASS = 'nordic-c2-seafood-residue-2026-09-04'
const C3_PASS = 'nordic-c3-food-waste-digestate-2026-09-04'
const ACTIVITY_PASS = 'nordic-activity-aqua-no-2026-09-04'

type Cell = { id: string; status: string }

type Indicator = {
  cellId: string
  country: string
  indicatorId: string
  year: number
  value: number | null
  unit: string
  methodId: string
  quality: string
  holeReason: string | null
  partnerStatus: string
  metadata: unknown
}

type Flow = {
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
  metadata: unknown
}

type Activity = {
  entityType: string
  entityId: string
  domain: string
  signalType: string
  year: number
  value: number | null
  unit: string | null
  confidence: string
  source: string
  metadata: unknown
}

export type NordicSpineProductionSnapshot = {
  cells: Cell[]
  indicators: Array<Indicator & { id: string }>
  flows: Array<Flow & { id: string }>
  activities: Array<Activity & { id: string }>
}

export type NordicSpineExpectedSnapshot = {
  cells: Cell[]
  indicators: Indicator[]
  flows: Flow[]
  activities: Activity[]
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

function metadataPass(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const pass = (metadata as Record<string, unknown>).pass
  return typeof pass === 'string' ? pass : null
}

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalize(item)]),
    )
  }
  return value
}

function canonical(value: unknown): string {
  return JSON.stringify(normalize(value))
}

function withoutId<T extends { id: string }>({ id: _id, ...row }: T): Omit<T, 'id'> {
  return row
}

function requirePlannedRows<T>(
  label: string,
  actual: T[],
  expected: T[],
  key: (row: T) => string,
) {
  const sorted = (rows: T[]) => [...rows].sort((a, b) => key(a).localeCompare(key(b)))
  if (canonical(sorted(actual)) !== canonical(sorted(expected))) {
    throw new Error(`${label} persisted rows differ from the current plan`)
  }
}

const indicatorKey = (row: Indicator) =>
  [row.cellId, row.country, row.indicatorId, row.year, row.methodId].join('|')

const flowKey = (row: Flow) =>
  [row.cellId, row.country, row.year, row.substance, row.fromNode, row.toNode].join('|')

const activityKey = (row: Activity) =>
  [row.entityType, row.entityId, row.signalType, row.year].join('|')

export function verifyNordicSpineProductionSnapshot(
  snapshot: NordicSpineProductionSnapshot,
  expected: NordicSpineExpectedSnapshot,
): { counts: VerificationCounts; fingerprint: string } {
  const expectedCellIds = [C1_CELL_ID, C2_CELL_ID, C3_CELL_ID]
  requireExact('NordicCell', snapshot.cells.length, expectedCellIds.length)
  for (const id of expectedCellIds) {
    const cell = snapshot.cells.find(row => row.id === id)
    if (!cell) throw new Error(`NordicCell missing: ${id}`)
    if (cell.status !== 'frozen') throw new Error(`NordicCell ${id} must remain frozen`)
  }
  requirePlannedRows('NordicCell', snapshot.cells, expected.cells, row => row.id)

  requireExact('C1', snapshot.indicators.length, 37)
  if (
    snapshot.indicators.some(
      row => row.cellId !== C1_CELL_ID || metadataPass(row.metadata) !== C1_PASS,
    )
  ) {
    throw new Error('C1 rows must use the exact cell and pass')
  }
  if (snapshot.indicators.some(row => row.partnerStatus !== 'internal')) {
    throw new Error('C1 rows must remain internal')
  }
  requireUnique('C1', snapshot.indicators.map(indicatorKey))

  const c2 = snapshot.flows.filter(row => row.cellId === C2_CELL_ID)
  const c3 = snapshot.flows.filter(row => row.cellId === C3_CELL_ID)
  requireExact('C2', c2.length, 20)
  requireExact('C3', c3.length, 20)
  if (c2.some(row => metadataPass(row.metadata) !== C2_PASS)) {
    throw new Error('C2 rows must use the exact pass')
  }
  if (c3.some(row => metadataPass(row.metadata) !== C3_PASS)) {
    throw new Error('C3 rows must use the exact pass')
  }
  requireUnique('C2', c2.map(flowKey))
  requireUnique('C3', c3.map(flowKey))

  requireExact('ActivitySignal', snapshot.activities.length, 250)
  if (
    snapshot.activities.some(
      row =>
        metadataPass(row.metadata) !== ACTIVITY_PASS ||
        row.entityType !== 'site' ||
        row.domain !== 'seafood' ||
        row.signalType !== 'licensed_capacity_mtb' ||
        row.year !== 2024,
    )
  ) {
    throw new Error('ActivitySignal rows must use the exact internal 2024 pass contract')
  }
  requireUnique('ActivitySignal', snapshot.activities.map(activityKey))

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

  requirePlannedRows(
    'C1',
    snapshot.indicators.map(withoutId),
    expected.indicators,
    indicatorKey,
  )
  requirePlannedRows(
    'C2',
    c2.map(withoutId),
    expected.flows.filter(row => row.cellId === C2_CELL_ID),
    flowKey,
  )
  requirePlannedRows(
    'C3',
    c3.map(withoutId),
    expected.flows.filter(row => row.cellId === C3_CELL_ID),
    flowKey,
  )
  requirePlannedRows(
    'ActivitySignal',
    snapshot.activities.map(withoutId),
    expected.activities,
    activityKey,
  )

  const fingerprintState = {
    cells: [...snapshot.cells].sort((a, b) => a.id.localeCompare(b.id)),
    indicators: [...snapshot.indicators].sort((a, b) => a.id.localeCompare(b.id)),
    flows: [...snapshot.flows].sort((a, b) => a.id.localeCompare(b.id)),
    activities: [...snapshot.activities].sort((a, b) => a.id.localeCompare(b.id)),
  }

  return {
    counts,
    fingerprint: createHash('sha256').update(canonical(fingerprintState)).digest('hex'),
  }
}
