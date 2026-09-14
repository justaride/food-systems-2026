/** One address row from Kartverket's Matrikkelen address file (EPSG:4258). */
export type AddressRow = {
  postnummer: string
  kommunenummer: string
  adressenavn: string
  nummer: string
  bokstav: string
  adressetilleggsnavn: string
  lat: number
  lon: number
}

export type GeocodePrecision = 'address' | 'place-name' | 'postnummer'

export type GeocodeResult = {
  coordinates: [number, number]
  precision: GeocodePrecision
  kommunenummer: string
}

type Point = { lng: number; lat: number; kommunenummer: string }

type Centroid = { lng: number; lat: number; count: number; kommuner: Map<string, number> }

export type AddressIndex = {
  streets: Map<string, Point>
  placeNames: Map<string, Point>
  postnummer: Map<string, Centroid>
}

const padPostnummer = (value: string) => {
  const trimmed = value.trim()
  return trimmed ? trimmed.padStart(4, '0') : ''
}

/** Lower-case, drop punctuation, expand "gt." and join house-number letters ("12 a" → "12a"). */
export function normalizeAddress(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/\bgt\b\.?/g, 'gate')
    .replace(/[.,;:/()"]/g, ' ')
    .replace(/(\d+)\s+([a-zæøå])\b/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Keep the street name and first house number, dropping floor, unit or c/o suffixes. */
function streetWithNumber(normalized: string): string | null {
  const match = normalized.match(/^(\D+?)\s?(\d+[a-zæøå]?)\b/)
  return match ? `${match[1].trim()} ${match[2]}` : null
}

export function buildAddressIndex(rows: Iterable<AddressRow>): AddressIndex {
  const index: AddressIndex = { streets: new Map(), placeNames: new Map(), postnummer: new Map() }

  for (const row of rows) {
    const postnummer = padPostnummer(row.postnummer)
    if (!postnummer) continue
    const point: Point = { lng: row.lon, lat: row.lat, kommunenummer: row.kommunenummer }

    if (row.adressenavn && row.nummer) {
      const key = `${postnummer}|${normalizeAddress(`${row.adressenavn} ${row.nummer}${row.bokstav}`)}`
      if (!index.streets.has(key)) index.streets.set(key, point)
    }
    if (row.adressetilleggsnavn) {
      const key = `${postnummer}|${normalizeAddress(row.adressetilleggsnavn)}`
      if (!index.placeNames.has(key)) index.placeNames.set(key, point)
    }

    const centroid = index.postnummer.get(postnummer) ?? { lng: 0, lat: 0, count: 0, kommuner: new Map() }
    centroid.lng += row.lon
    centroid.lat += row.lat
    centroid.count += 1
    centroid.kommuner.set(row.kommunenummer, (centroid.kommuner.get(row.kommunenummer) ?? 0) + 1)
    index.postnummer.set(postnummer, centroid)
  }

  return index
}

const toResult = (point: Point, precision: GeocodePrecision): GeocodeResult => ({
  coordinates: [point.lng, point.lat],
  precision,
  kommunenummer: point.kommunenummer,
})

/**
 * Place an address: exact street and number first, then a named place (farm or
 * site name) in the same postnummer, then the postnummer's centroid, attributed
 * to the kommune holding most of its addresses. Returns null for an unknown postnummer.
 */
export function geocode(index: AddressIndex, address: string, postnummer: string): GeocodeResult | null {
  const pn = padPostnummer(postnummer)
  if (!pn) return null
  const normalized = normalizeAddress(address)

  const street = streetWithNumber(normalized)
  const streetHit = street ? index.streets.get(`${pn}|${street}`) : undefined
  if (streetHit) return toResult(streetHit, 'address')

  const placeHit = normalized ? index.placeNames.get(`${pn}|${normalized}`) : undefined
  if (placeHit) return toResult(placeHit, 'place-name')

  const centroid = index.postnummer.get(pn)
  if (!centroid) return null
  const kommunenummer = [...centroid.kommuner.entries()].sort((a, b) => b[1] - a[1])[0][0]
  return toResult(
    { lng: centroid.lng / centroid.count, lat: centroid.lat / centroid.count, kommunenummer },
    'postnummer'
  )
}
