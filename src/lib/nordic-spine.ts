/** Pure helpers for Nordic spine (C1–C3) internal utilization UI. */

export const NORDIC_SPINE_COUNTRIES = ['NO', 'SE', 'DK', 'FI', 'IS'] as const
export type NordicSpineCountry = (typeof NORDIC_SPINE_COUNTRIES)[number]

export const NORDIC_CELL_ORDER = [
  'retail-concentration',
  'seafood-residue-flow',
  'food-waste-digestate',
] as const

export type NordicCellId = (typeof NORDIC_CELL_ORDER)[number]

export type SpineCellValue = {
  value: number | string | null
  unit: string
  year: number
  quality: string
  holeReason?: string | null
}

export type DisplayCell =
  | {
      kind: 'value'
      text: string
      meta: string
      quality: string
    }
  | {
      kind: 'hole'
      text: string
      reason: string
      year: number
    }
  | {
      kind: 'missing'
      text: string
    }

const HOLE_QUALITIES = new Set(['unknown'])

export function isHoleQuality(quality: string, value: number | string | null | undefined): boolean {
  if (value === null || value === undefined) return true
  return HOLE_QUALITIES.has(quality)
}

export function truncateHoleReason(reason: string | null | undefined, max = 72): string {
  if (!reason || !reason.trim()) return 'No usable figure (True-C hole)'
  const trimmed = reason.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`
}

export function formatSpineNumber(value: number | string, unit: string): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) return String(value)
  const abs = Math.abs(n)
  let formatted: string
  if (abs >= 1000 && Number.isInteger(n)) {
    formatted = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(n)
  } else if (abs >= 100 || Number.isInteger(n)) {
    formatted = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 1 }).format(n)
  } else {
    formatted = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 2 }).format(n)
  }
  if (!unit || unit === 'index') return formatted
  if (unit === 'percent' || unit === '%') return `${formatted} %`
  return `${formatted} ${unit}`
}

export function toDisplayCell(row: SpineCellValue | null | undefined): DisplayCell {
  if (!row) {
    return { kind: 'missing', text: '—' }
  }
  if (isHoleQuality(row.quality, row.value)) {
    return {
      kind: 'hole',
      text: `Hole ${row.year}`,
      reason: truncateHoleReason(row.holeReason),
      year: row.year,
    }
  }
  return {
    kind: 'value',
    text: formatSpineNumber(row.value as number | string, row.unit),
    meta: `${row.year} · ${row.quality}`,
    quality: row.quality,
  }
}

export type IndicatorMatrixRow = {
  indicatorId: string
  cells: Record<NordicSpineCountry, DisplayCell>
}

export type FlowMatrixRow = {
  edge: string
  fromNode: string
  toNode: string
  cells: Record<NordicSpineCountry, DisplayCell>
}

export type IndicatorLike = {
  country: string
  indicatorId: string
  year: number
  value: number | string | null
  unit: string
  quality: string
  holeReason?: string | null
}

export type FlowLike = {
  country: string
  year: number
  fromNode: string
  toNode: string
  quantity: number | null
  unit: string
  quality: string
  holeReason?: string | null
}

/** Prefer latest year per country×indicator; holes still win as explicit rows. */
export function shapeIndicatorMatrix(
  rows: IndicatorLike[],
  indicatorOrder?: string[],
): IndicatorMatrixRow[] {
  const best = new Map<string, IndicatorLike>()
  for (const row of rows) {
    const key = `${row.country}::${row.indicatorId}`
    const prev = best.get(key)
    if (!prev || row.year > prev.year) best.set(key, row)
  }

  const ids = indicatorOrder?.length
    ? indicatorOrder
    : [...new Set([...best.values()].map((r) => r.indicatorId))].sort((a, b) => {
        const rank = (id: string) => {
          if (id === 'hhi') return 0
          if (id === 'cr3') return 1
          if (id.startsWith('margin_top')) return 2 + Number(id.replace('margin_top', '') || 9)
          if (id.startsWith('margin_banner_')) return 20
          return 50
        }
        return rank(a) - rank(b) || a.localeCompare(b)
      })

  return ids.map((indicatorId) => {
    const cells = {} as Record<NordicSpineCountry, DisplayCell>
    for (const country of NORDIC_SPINE_COUNTRIES) {
      const row = best.get(`${country}::${indicatorId}`)
      cells[country] = toDisplayCell(
        row
          ? {
              value: row.value,
              unit: row.unit,
              year: row.year,
              quality: row.quality,
              holeReason: row.holeReason,
            }
          : null,
      )
    }
    return { indicatorId, cells }
  })
}

export function shapeFlowMatrix(rows: FlowLike[], edgeOrder?: Array<{ fromNode: string; toNode: string }>): FlowMatrixRow[] {
  const best = new Map<string, FlowLike>()
  for (const row of rows) {
    const key = `${row.country}::${row.fromNode}::${row.toNode}`
    const prev = best.get(key)
    if (!prev || row.year > prev.year) best.set(key, row)
  }

  const edges =
    edgeOrder?.length
      ? edgeOrder
      : [...new Set([...best.values()].map((r) => `${r.fromNode}→${r.toNode}`))]
          .map((edge) => {
            const [fromNode, toNode] = edge.split('→')
            return { fromNode, toNode }
          })
          .sort((a, b) => a.fromNode.localeCompare(b.fromNode) || a.toNode.localeCompare(b.toNode))

  return edges.map(({ fromNode, toNode }) => {
    const cells = {} as Record<NordicSpineCountry, DisplayCell>
    for (const country of NORDIC_SPINE_COUNTRIES) {
      const row = best.get(`${country}::${fromNode}::${toNode}`)
      cells[country] = toDisplayCell(
        row
          ? {
              value: row.quantity,
              unit: row.unit,
              year: row.year,
              quality: row.quality,
              holeReason: row.holeReason,
            }
          : null,
      )
    }
    return {
      edge: `${fromNode} → ${toNode}`,
      fromNode,
      toNode,
      cells,
    }
  })
}

export function scoreboardCounts(rows: Array<{ value: number | string | null; quality: string }>) {
  let filled = 0
  let holes = 0
  for (const row of rows) {
    if (isHoleQuality(row.quality, row.value)) holes += 1
    else filled += 1
  }
  return { filled, holes, total: rows.length }
}
