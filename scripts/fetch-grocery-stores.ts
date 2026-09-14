import { execFileSync } from 'child_process'
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { CACHE_DIR, cachedDownload, type CachedFile } from './lib/register-cache'
import { readCsvRecords } from './lib/csv-stream'
import { buildNearestIndex, nearestPlace, type PlaceRow } from '../src/lib/map/registers/nearest'
import {
  classifyGroceryElement,
  dedupeNearby,
  DAGLIGVAREFASITEN_2024,
  reconcileChains,
  RECONCILIATION_TOLERANCE,
} from '../src/lib/map/registers/grocery-chains'
import type { Store } from '../src/lib/map/types'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'
const OVERPASS_QUERY =
  '[out:json][timeout:180];area["ISO3166-1"="NO"][admin_level=2]->.a;(nwr["shop"~"^(supermarket|convenience)$"](area.a););out tags center;'
// Overpass answers the default client User-Agent with HTTP 406.
const USER_AGENT = 'food-systems-2026-kart/1.0 (+https://github.com/justaride/food-systems-2026)'
const MATRIKKEL_URL =
  'https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/CSV/Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV.zip'
const MAX_PLACE_DISTANCE_M = 2_000
const DEDUPE_DISTANCE_M = 75

const OUT_FILE = join(__dirname, '..', 'public', 'data', 'food-systems', 'no', 'grocery-stores.json')

type OsmElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags?: Record<string, string>
}

const round6 = (n: number) => Math.round(n * 1_000_000) / 1_000_000

const titleCase = (value: string) =>
  value.toLocaleLowerCase('nb-NO').replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase('nb-NO'))

const tally = (values: string[]) => {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([, a], [, b]) => b - a))
}

async function placeIndex(): Promise<{ file: CachedFile; index: ReturnType<typeof buildNearestIndex> }> {
  const file = await cachedDownload(MATRIKKEL_URL, 'matrikkel-adresse.zip', { maxAgeHours: 24 * 7 })
  const dir = join(CACHE_DIR, 'matrikkel-adresse')
  const csvPath = join(dir, 'Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV', 'matrikkelenAdresse.csv')
  if (!existsSync(csvPath) || statSync(csvPath).mtimeMs < statSync(file.path).mtimeMs) {
    execFileSync('unzip', ['-o', '-q', file.path, '-d', dir])
  }

  // One address per ~500 m cell and poststed keeps the index small without losing coverage.
  const seen = new Set<string>()
  const rows: PlaceRow[] = []
  for await (const r of readCsvRecords(csvPath, { delimiter: ';' })) {
    const lat = Number(r.Nord)
    const lon = Number(r['Øst'])
    const key = `${Math.round(lon / 0.005)}:${Math.round(lat / 0.005)}:${r.poststed}`
    if (seen.has(key)) continue
    seen.add(key)
    rows.push({ lon, lat, kommunenummer: r.kommunenummer, kommunenavn: r.kommunenavn, poststed: r.poststed })
  }
  return { file, index: buildNearestIndex(rows) }
}

async function main() {
  const overpass = await cachedDownload(`${OVERPASS_URL}?data=${encodeURIComponent(OVERPASS_QUERY)}`, 'overpass-no-grocery.json', {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
  })
  const raw = JSON.parse(readFileSync(overpass.path, 'utf-8')) as { osm3s?: { timestamp_osm_base?: string }; elements: OsmElement[] }
  const elements = raw.elements
  const osmBase = raw.osm3s?.timestamp_osm_base ?? ''
  console.log(`[stores] ${elements.length} OSM-objekter (shop=supermarket/convenience), OSM-data per ${osmBase}`)

  const candidates: Store[] = []
  const excluded: string[] = []
  const matchedBy: string[] = []
  let withoutPosition = 0

  for (const el of elements) {
    const tags = el.tags ?? {}
    const lat = el.lat ?? el.center?.lat
    const lon = el.lon ?? el.center?.lon
    if (lat === undefined || lon === undefined) {
      withoutPosition++
      continue
    }
    const result = classifyGroceryElement(tags)
    if (!result.include) {
      excluded.push(result.reason)
      continue
    }
    matchedBy.push(result.matchedBy)
    candidates.push({
      id: `${result.chainId}-${el.type === 'node' ? '' : el.type[0]}${el.id}`,
      osmId: el.id,
      name: tags.name || result.chain,
      chain: result.chain,
      chainId: result.chainId,
      storeType: result.storeType,
      location: { lat: round6(lat), lng: round6(lon) },
      address: tags['addr:street'] ? [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ') : '',
      city: '',
      postcode: tags['addr:postcode'] ?? '',
      openingHours: tags.opening_hours ?? '',
      wheelchair: tags.wheelchair ?? '',
    })
  }

  // Nodes before ways, so the shop's own point wins over a building centre.
  candidates.sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }))
  const { kept: stores, removed } = dedupeNearby(candidates, DEDUPE_DISTANCE_M)

  if (stores.length + removed.length + excluded.length + withoutPosition !== elements.length) {
    throw new Error('Avstemming feilet: butikker + duplikater + utelatt + uten posisjon ≠ OSM-objekter')
  }

  const reconciliation = reconcileChains(tally(stores.map(s => s.chainId)))
  if (reconciliation.failures.length) {
    throw new Error(`Kjedetall avviker for mye fra Dagligvarefasiten:\n${reconciliation.failures.join('\n')}`)
  }

  const places = await placeIndex()
  let withPlace = 0
  for (const store of stores) {
    const place = nearestPlace(places.index, store.location.lng, store.location.lat, MAX_PLACE_DISTANCE_M)
    if (!place) continue
    store.city = titleCase(place.poststed)
    withPlace++
  }

  const accessedAt = new Date().toISOString().slice(0, 10)
  const meta = {
    title: 'Dagligvarebutikker i konseptkjeder',
    sourceClass: 'registry_snapshot',
    verificationStatus: 'unverified',
    accessedAt,
    osmDataTimestamp: osmBase,
    citationText: `© OpenStreetMap-bidragsytere (${osmBase.slice(0, 10)}), hentet via Overpass API. Kjedetilhørighet fra brand- og name-tagger; avstemt mot ${DAGLIGVAREFASITEN_2024.source}.`,
    licence: {
      openstreetmap: 'ODbL 1.0 — © OpenStreetMap-bidragsytere. Denne filen er en avledet database og deles under ODbL.',
      kartverket: 'CC BY 4.0',
    },
    privacy: 'Telefonnummer og nettside er utelatt, fordi kjøpmannseide butikker kan ha kjøpmannens eget nummer.',
    selection: `shop=supermarket og shop=convenience i Norge. Bare de tradisjonelle dagligvarekjedene i Dagligvarefasiten tas med (brand-tagg, ellers kjedenavn først i name). Servicehandel (7-Eleven, Narvesen, Mix, Snarkjøp, Circle K m.fl.) og uavhengige butikker er utelatt. Samme kjede innen ${DEDUPE_DISTANCE_M} m regnes som samme butikk.`,
    method: `Poststed fra nærmeste adresse i Kartverket Matrikkelen innen ${MAX_PLACE_DISTANCE_M / 1000} km. Kommune avgjøres i kartet ved punkt-i-polygon.`,
    reproduce: 'npm run fetch:grocery-stores',
    sources: [
      { name: 'OpenStreetMap via Overpass API', query: OVERPASS_QUERY, ...overpass, url: OVERPASS_URL },
      { name: 'Kartverket – Matrikkelen adresse (CSV)', ...places.file },
    ].map(({ path: _path, ...rest }) => rest),
    reconciliation: {
      reference: DAGLIGVAREFASITEN_2024.source,
      url: DAGLIGVAREFASITEN_2024.url,
      tolerance: RECONCILIATION_TOLERANCE,
      note: 'Referansen er per 31.12.2024; OSM viser dagens kart. Spar og Coop Prix sammenlignes samlet fordi rekkefølgen er tvetydig i PDF-teksten. Nærbutikken er bare en del av «NG øvrige».',
      rows: reconciliation.rows,
      total: reconciliation.total,
    },
    counts: {
      osmElements: elements.length,
      stores: stores.length,
      duplicatesRemoved: removed.length,
      withoutPosition,
      excluded: tally(excluded),
      matchedBy: tally(matchedBy),
      storesByChain: tally(stores.map(s => s.chainId)),
      storesWithPoststed: withPlace,
    },
  }

  const output =
    `{"_meta":${JSON.stringify(meta, null, 2)},\n` +
    `"stores":[\n${stores.map(s => JSON.stringify(s)).join(',\n')}\n]}\n`
  writeFileSync(OUT_FILE, output)
  console.log(`[stores] ${stores.length} butikker (${removed.length} duplikater, ${excluded.length} utelatt) → ${OUT_FILE}`)
  for (const row of [...reconciliation.rows, reconciliation.total]) {
    console.log(`  ${row.label}: OSM ${row.osm} / referanse ${row.reference} (${Math.round(row.deviation * 100)} %)${row.checked ? '' : ' – ikke kontrollert'}`)
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
