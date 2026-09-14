/** Fields of one Fiskeridirektoratet sales-note line that the aggregation reads. */
export type LandingRow = {
  documentType: string
  landingNation: string
  station: string
  landingKommune: string
  vessel: string
  speciesGroup: string
  roundWeightKg: number
}

type Cell = { kg: number; byGroup: Map<string, number>; vessels: Set<string> }

export type LandingAccumulator = {
  rowsRead: number
  rowsKept: number
  skipped: { landingDocument: number; landedAbroad: number; withoutStation: number }
  totalKg: number
  stations: Map<string, Cell & { kommuneKg: Map<string, number> }>
}

export type LandingVolume = { tonnes: number; byGroup: Record<string, number> }

export type LandingsResult = {
  stations: Record<string, LandingVolume & { landingKommune: string }>
  kommuner: Record<string, LandingVolume>
  suppressed: { tonnes: number; stations: number }
  counts: {
    rowsRead: number
    rowsKept: number
    skipped: LandingAccumulator['skipped']
    totalTonnes: number
    stationsInNorway: number
    stationsPublished: number
    stationsInKommuner: number
    stationsSuppressed: number
    kommunerPublished: number
    tonnes: { stations: number; kommuner: number; suppressed: number }
  }
}

/** Sales notes (sluttseddel); landing documents mostly repeat them. */
const SALES_NOTE = '0'

export function createLandingAccumulator(): LandingAccumulator {
  return {
    rowsRead: 0,
    rowsKept: 0,
    skipped: { landingDocument: 0, landedAbroad: 0, withoutStation: 0 },
    totalKg: 0,
    stations: new Map(),
  }
}

const newCell = (): Cell => ({ kg: 0, byGroup: new Map(), vessels: new Set() })

function addToCell(cell: Cell, kg: number, group: string, vessel: string) {
  cell.kg += kg
  cell.byGroup.set(group, (cell.byGroup.get(group) ?? 0) + kg)
  if (vessel) cell.vessels.add(vessel)
}

/** Count a sales-note line landed in Norway towards its receiving station. */
export function addLanding(acc: LandingAccumulator, row: LandingRow): void {
  acc.rowsRead++
  if (row.documentType !== SALES_NOTE) {
    acc.skipped.landingDocument++
    return
  }
  if (row.landingNation !== 'NOR') {
    acc.skipped.landedAbroad++
    return
  }
  if (!row.station) {
    acc.skipped.withoutStation++
    return
  }
  acc.rowsKept++
  acc.totalKg += row.roundWeightKg
  const station = acc.stations.get(row.station) ?? { ...newCell(), kommuneKg: new Map<string, number>() }
  addToCell(station, row.roundWeightKg, row.speciesGroup, row.vessel)
  station.kommuneKg.set(row.landingKommune, (station.kommuneKg.get(row.landingKommune) ?? 0) + row.roundWeightKg)
  acc.stations.set(row.station, station)
}

const tonnes = (kg: number) => Math.round(kg / 1000)

function toVolume(cell: Cell): LandingVolume {
  const byGroup = Object.fromEntries(
    [...cell.byGroup.entries()]
      .map(([group, kg]) => [group, tonnes(kg)] as const)
      .filter(([, t]) => t > 0)
      .sort((a, b) => b[1] - a[1])
  )
  return { tonnes: tonnes(cell.kg), byGroup }
}

/**
 * Publish a station's volume under its approval number when it matches an
 * establishment and at least `minVessels` vessels delivered there. Other
 * stations fall back to their main landing kommune under the same rule; what
 * remains is one suppressed total. Vessel identifiers are dropped here.
 */
export function finalizeLandings(acc: LandingAccumulator, approvalNumbers: Set<string>, minVessels = 3): LandingsResult {
  const stations: LandingsResult['stations'] = {}
  const kommuneCells = new Map<string, Cell & { stationCount: number }>()
  let stationKg = 0
  let stationsInKommuner = 0

  for (const [code, cell] of acc.stations) {
    const landingKommune = [...cell.kommuneKg.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
    if (approvalNumbers.has(code) && cell.vessels.size >= minVessels) {
      stations[code] = { ...toVolume(cell), landingKommune }
      stationKg += cell.kg
      continue
    }
    const kommune = kommuneCells.get(landingKommune) ?? { ...newCell(), stationCount: 0 }
    for (const [group, kg] of cell.byGroup) kommune.byGroup.set(group, (kommune.byGroup.get(group) ?? 0) + kg)
    kommune.kg += cell.kg
    for (const vessel of cell.vessels) kommune.vessels.add(vessel)
    kommune.stationCount++
    kommuneCells.set(landingKommune, kommune)
  }

  const kommuner: LandingsResult['kommuner'] = {}
  let kommuneKg = 0
  let suppressedKg = 0
  let stationsSuppressed = 0
  for (const [code, cell] of [...kommuneCells.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (code && cell.vessels.size >= minVessels) {
      kommuner[code] = toVolume(cell)
      kommuneKg += cell.kg
      stationsInKommuner += cell.stationCount
    } else {
      suppressedKg += cell.kg
      stationsSuppressed += cell.stationCount
    }
  }

  return {
    stations: Object.fromEntries(Object.entries(stations).sort(([a], [b]) => a.localeCompare(b, 'en', { numeric: true }))),
    kommuner,
    suppressed: { tonnes: tonnes(suppressedKg), stations: stationsSuppressed },
    counts: {
      rowsRead: acc.rowsRead,
      rowsKept: acc.rowsKept,
      skipped: acc.skipped,
      totalTonnes: tonnes(acc.totalKg),
      stationsInNorway: acc.stations.size,
      stationsPublished: Object.keys(stations).length,
      stationsInKommuner,
      stationsSuppressed,
      kommunerPublished: Object.keys(kommuner).length,
      tonnes: { stations: tonnes(stationKg), kommuner: tonnes(kommuneKg), suppressed: tonnes(suppressedKg) },
    },
  }
}

/** Kilogram sums in the three buckets must add up to the kept total (within rounding). */
export function landingsReconcile(result: LandingsResult): boolean {
  const { stations, kommuner, suppressed } = result.counts.tonnes
  return Math.abs(stations + kommuner + suppressed - result.counts.totalTonnes) <= 2
}
