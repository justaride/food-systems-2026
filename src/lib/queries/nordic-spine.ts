import { prisma } from '@/lib/db'
import { isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import {
  NORDIC_CELL_ORDER,
  NORDIC_AQUA_ACTIVITY_PASS,
  scoreboardCounts,
  shapeFlowMatrix,
  shapeIndicatorMatrix,
  summarizeActivitySignals,
  type FlowMatrixRow,
  type IndicatorMatrixRow,
  type NordicCellId,
} from '@/lib/nordic-spine'

export type NordicSpinePayload = {
  available: boolean
  cells: Array<{ id: string; title: string; status: string; definitionMd: string }>
  c1: {
    matrix: IndicatorMatrixRow[]
    counts: { filled: number; holes: number; total: number }
  }
  c2: {
    matrix: FlowMatrixRow[]
    counts: { filled: number; holes: number; total: number }
  }
  c3: {
    matrix: FlowMatrixRow[]
    counts: { filled: number; holes: number; total: number }
  }
  activity: {
    count: number
    sumMtb: number
    year: number | null
    signalType: string | null
    domain: string | null
  }
}

const C1_INDICATOR_ORDER = [
  'hhi',
  'cr3',
  'margin_top1',
  'margin_top2',
  'margin_top3',
]

const C2_EDGES = [
  { substance: 'mass', fromNode: 'aquaculture_site', toNode: 'sludge_generated' },
  { substance: 'mass', fromNode: 'sludge_generated', toNode: 'sludge_collected' },
  { substance: 'mass', fromNode: 'sludge_collected', toNode: 'treatment' },
  { substance: 'mass', fromNode: 'treatment', toNode: 'unknown_sink' },
]

const C3_EDGES = [
  { substance: 'mass', fromNode: 'household_municipal_waste', toNode: 'collection' },
  { substance: 'mass', fromNode: 'collection', toNode: 'biogas_ad' },
  { substance: 'mass', fromNode: 'biogas_ad', toNode: 'digestate' },
  { substance: 'mass', fromNode: 'digestate', toNode: 'land_application' },
]

function decimalToNumber(value: { toString(): string } | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const n = Number(value.toString())
  return Number.isFinite(n) ? n : null
}

export async function getNordicSpinePayload(): Promise<NordicSpinePayload> {
  try {
    const [cells, indicators, flows, signals] = await Promise.all([
      prisma.nordicCell.findMany({ orderBy: { id: 'asc' } }),
      prisma.nordicIndicatorRow.findMany({
        where: { cellId: 'retail-concentration' },
        orderBy: [{ country: 'asc' }, { indicatorId: 'asc' }, { year: 'desc' }],
      }),
      prisma.flowCell.findMany({
        where: {
          cellId: { in: ['seafood-residue-flow', 'food-waste-digestate'] },
          substance: 'mass',
        },
        orderBy: [{ cellId: 'asc' }, { country: 'asc' }, { fromNode: 'asc' }],
      }),
      prisma.activitySignal.findMany({
        where: {
          domain: 'seafood',
          signalType: 'licensed_capacity_mtb',
          metadata: { path: ['pass'], equals: NORDIC_AQUA_ACTIVITY_PASS },
        },
        orderBy: { updatedAt: 'asc' },
      }),
    ])

    const orderedCells = NORDIC_CELL_ORDER.map((id) => cells.find((c) => c.id === id)).filter(
      (c): c is NonNullable<typeof c> => Boolean(c),
    )

    const allC1Rows = indicators.map((r) => ({
      country: r.country,
      indicatorId: r.indicatorId,
      year: r.year,
      value: decimalToNumber(r.value),
      unit: r.unit,
      quality: r.quality,
      holeReason: r.holeReason,
    }))
    const c1Rows = allC1Rows.filter((r) => C1_INDICATOR_ORDER.includes(r.indicatorId))

    const c2Flows = flows.filter((f) => f.cellId === 'seafood-residue-flow')
    const c3Flows = flows.filter((f) => f.cellId === 'food-waste-digestate')

    const mapFlow = (f: (typeof flows)[number]) => ({
      country: f.country,
      year: f.year,
      substance: f.substance,
      fromNode: f.fromNode,
      toNode: f.toNode,
      quantity: f.quantity,
      unit: f.unit,
      quality: f.quality,
      holeReason: f.holeReason,
    })

    const activity = summarizeActivitySignals(signals)

    return {
      available: true,
      cells: orderedCells.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        definitionMd: c.definitionMd,
      })),
      c1: {
        matrix: shapeIndicatorMatrix(c1Rows, C1_INDICATOR_ORDER),
        counts: scoreboardCounts(allC1Rows),
      },
      c2: {
        matrix: shapeFlowMatrix(c2Flows.map(mapFlow), C2_EDGES),
        counts: scoreboardCounts(
          c2Flows.map((f) => ({ value: f.quantity, quality: f.quality })),
        ),
      },
      c3: {
        matrix: shapeFlowMatrix(c3Flows.map(mapFlow), C3_EDGES),
        counts: scoreboardCounts(
          c3Flows.map((f) => ({ value: f.quantity, quality: f.quality })),
        ),
      },
      activity: {
        count: activity.count,
        sumMtb: activity.sumMtb,
        year: activity.year,
        signalType: signals[0]?.signalType ?? null,
        domain: signals[0]?.domain ?? null,
      },
    }
  } catch (error) {
    if (isPrismaDataUnavailable(error)) {
      return emptyPayload()
    }
    throw error
  }
}

function emptyPayload(): NordicSpinePayload {
  return {
    available: false,
    cells: [],
    c1: { matrix: [], counts: { filled: 0, holes: 0, total: 0 } },
    c2: { matrix: [], counts: { filled: 0, holes: 0, total: 0 } },
    c3: { matrix: [], counts: { filled: 0, holes: 0, total: 0 } },
    activity: { count: 0, sumMtb: 0, year: null, signalType: null, domain: null },
  }
}

export function cellTitle(payload: NordicSpinePayload, id: NordicCellId): string {
  return payload.cells.find((c) => c.id === id)?.title ?? id
}
