/** An address point carrying the place names used to label unnamed features. */
export type PlaceRow = {
  lon: number
  lat: number
  kommunenummer: string
  kommunenavn: string
  poststed: string
}

export type NearestPlace = PlaceRow & { distanceM: number }

export type NearestIndex = { cellDeg: number; cells: Map<string, PlaceRow[]> }

const EARTH_RADIUS_M = 6_371_000

export function distanceM(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const toRad = Math.PI / 180
  const dLat = (lat2 - lat1) * toRad
  const dLon = (lon2 - lon1) * toRad
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a))
}

const cellKey = (col: number, row: number) => `${col}:${row}`

export function buildNearestIndex(rows: Iterable<PlaceRow>, cellDeg = 0.02): NearestIndex {
  const cells = new Map<string, PlaceRow[]>()
  for (const row of rows) {
    const key = cellKey(Math.floor(row.lon / cellDeg), Math.floor(row.lat / cellDeg))
    const cell = cells.get(key)
    if (cell) cell.push(row)
    else cells.set(key, [row])
  }
  return { cellDeg, cells }
}

/**
 * Nearest indexed place within `maxDistanceM`, searching grid rings outward and
 * stopping once no unsearched cell can hold a closer point. Returns null when
 * nothing lies within range.
 */
export function nearestPlace(index: NearestIndex, lon: number, lat: number, maxDistanceM = 5_000): NearestPlace | null {
  const { cellDeg, cells } = index
  const col = Math.floor(lon / cellDeg)
  const row = Math.floor(lat / cellDeg)
  // A ring of cells is at least this far away in the narrower (longitude) direction.
  const cellWidthM = distanceM(lon, lat, lon + cellDeg, lat)
  const maxRing = Math.ceil(maxDistanceM / cellWidthM) + 1

  let best: NearestPlace | null = null
  for (let ring = 0; ring <= maxRing; ring++) {
    if (best && best.distanceM <= (ring - 1) * cellWidthM) break
    for (let dc = -ring; dc <= ring; dc++) {
      for (let dr = -ring; dr <= ring; dr++) {
        if (Math.max(Math.abs(dc), Math.abs(dr)) !== ring) continue
        for (const place of cells.get(cellKey(col + dc, row + dr)) ?? []) {
          const d = distanceM(lon, lat, place.lon, place.lat)
          if (d <= maxDistanceM && (!best || d < best.distanceM)) best = { ...place, distanceM: d }
        }
      }
    }
  }
  return best
}
