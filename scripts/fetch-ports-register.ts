import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { execFileSync } from 'child_process'
import { join } from 'path'
import { CACHE_DIR, cachedDownload, type CachedFile } from './lib/register-cache'
import { readCsvRecords } from './lib/csv-stream'
import { parseWfsGmlPoints, type WfsPoint } from '../src/lib/map/registers/wfs'
import { utmToLonLat } from '../src/lib/map/registers/utm'
import { buildNearestIndex, nearestPlace, type NearestPlace, type PlaceRow } from '../src/lib/map/registers/nearest'

const WFS = 'https://services.kystverket.no/wfs.ashx?service=WFS&version=1.0.0&request=GetFeature&typeName='
const LAYERS = {
  fishingHarbours: { typeName: 'layer_1077', title: 'Kystverket – Fiskerihavner' },
  portFacilities: { typeName: 'layer_420', title: 'Kystverket – ISPS havneanlegg' },
}
const MATRIKKEL_URL =
  'https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/CSV/Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV.zip'
const UTM_ZONE = 33
const MAX_ADDRESS_DISTANCE_M = 5_000
const NORWAY_BBOX = { minLon: 2, maxLon: 34, minLat: 57.5, maxLat: 81.5 }

const OUT_FILE = join(__dirname, '..', 'public', 'data', 'food-systems', 'no', 'ports-register.geojson')

// A private owner without a legal-form suffix may be a person, so only these are named.
const LEGAL_FORM = /\b(AS|ASA|SA|IKS|KF|FKF|BA|DA|ANS|NUF|HF|SF|KS)\b/

const round5 = (value: number) => Math.round(value * 100_000) / 100_000

const titleCase = (value: string) =>
  value.toLocaleLowerCase('nb-NO').replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toLocaleUpperCase('nb-NO'))

async function wfsLayer(typeName: string, fileName: string) {
  const file = await cachedDownload(`${WFS}${typeName}`, fileName)
  return { file, points: parseWfsGmlPoints(readFileSync(file.path, 'utf-8')) }
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

function toLonLat(point: WfsPoint): [number, number] {
  const [lon, lat] = utmToLonLat(point.x, point.y, UTM_ZONE)
  if (lon < NORWAY_BBOX.minLon || lon > NORWAY_BBOX.maxLon || lat < NORWAY_BBOX.minLat || lat > NORWAY_BBOX.maxLat) {
    throw new Error(`Punkt ${point.fid} havnet utenfor Norge etter omregning: ${lon}, ${lat}`)
  }
  return [round5(lon), round5(lat)]
}

const placeProps = (place: NearestPlace | null) =>
  place
    ? {
        kommunenummer: place.kommunenummer,
        kommunenavn: titleCase(place.kommunenavn),
        poststed: titleCase(place.poststed),
        addressDistanceM: Math.round(place.distanceM),
      }
    : { kommunenummer: '', kommunenavn: '', poststed: '', addressDistanceM: null }

const tally = (values: string[]) => {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([, a], [, b]) => b - a))
}

async function main() {
  const harbours = await wfsLayer(LAYERS.fishingHarbours.typeName, 'kystverket-fiskerihavner.gml')
  const facilities = await wfsLayer(LAYERS.portFacilities.typeName, 'kystverket-isps.gml')
  const places = await placeIndex()
  console.log(`[ports] ${harbours.points.length} fiskerihavner, ${facilities.points.length} ISPS-havneanlegg`)

  const features: GeoJSON.Feature<GeoJSON.Point>[] = []

  for (const point of harbours.points) {
    const coordinates = toLonLat(point)
    const place = nearestPlace(places.index, coordinates[0], coordinates[1], MAX_ADDRESS_DISTANCE_M)
    const props = placeProps(place)
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: {
        id: `fiskerihavn-${point.fid.split('.').pop()}`,
        kind: 'fishing-harbour',
        name: props.poststed ? `Fiskerihavn, ${props.poststed}` : 'Fiskerihavn',
        ...props,
      },
    })
  }

  let ownersPublished = 0
  for (const point of facilities.points) {
    const p = point.properties
    const coordinates = toLonLat(point)
    const place = nearestPlace(places.index, coordinates[0], coordinates[1], MAX_ADDRESS_DISTANCE_M)
    const owner = p.ownercompanyname ?? ''
    const publishOwner = owner !== '' && (p.ownertypenor === 'Offentlig' || LEGAL_FORM.test(owner))
    if (publishOwner) ownersPublished++
    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
      properties: {
        id: p.portfacilityno,
        kind: 'port-facility',
        name: p.locationnamenor,
        harbour: p.harbour,
        functions: (p.functionsnor ?? '').split(',').map(f => f.trim()).filter(Boolean),
        ownerType: p.ownertypenor,
        owner: publishOwner ? owner : null,
        cruise: p.hascruisefunction === 'Ja',
        ...placeProps(place),
        kommunenavn: p.councilname || placeProps(place).kommunenavn,
        county: p.countyname,
      },
    })
  }

  if (features.length !== harbours.points.length + facilities.points.length) {
    throw new Error('Avstemming feilet: antall punkter ≠ antall WFS-objekter')
  }

  const harbourFeatures = features.filter(f => f.properties?.kind === 'fishing-harbour')
  const facilityFeatures = features.filter(f => f.properties?.kind === 'port-facility')
  const accessedAt = new Date().toISOString().slice(0, 10)
  const meta = {
    title: 'Fiskerihavner og ISPS-havneanlegg',
    sourceClass: 'registry_snapshot',
    verificationStatus: 'unverified',
    accessedAt,
    citationText: `Kystverket (${accessedAt.slice(0, 4)}). Fiskerihavner og ISPS havneanlegg (WFS). Navn og kommune for fiskerihavner fra nærmeste adresse i Kartverket Matrikkelen adresse.`,
    licence: { kystverket: 'NLOD', kartverket: 'CC BY 4.0' },
    privacy: 'Eiernavn for ISPS-havneanlegg vises bare når eieren er offentlig eller har en selskapsform (AS, IKS, KF …).',
    method: `Koordinater omregnet fra UTM sone ${UTM_ZONE} (EPSG:32633) til WGS84. Fiskerihavner uten adresse innen ${MAX_ADDRESS_DISTANCE_M / 1000} km har verken stedsnavn eller kommune.`,
    reproduce: 'npm run fetch:ports-register',
    sources: [
      { name: LAYERS.fishingHarbours.title, ...harbours.file },
      { name: LAYERS.portFacilities.title, ...facilities.file },
      { name: 'Kartverket – Matrikkelen adresse (CSV)', ...places.file },
    ].map(({ path: _path, ...rest }) => rest),
    counts: {
      fishingHarbours: harbourFeatures.length,
      fishingHarboursWithPlace: harbourFeatures.filter(f => f.properties?.poststed).length,
      portFacilities: facilityFeatures.length,
      portFacilityOwnersPublished: ownersPublished,
      portFacilityFunctions: tally(facilityFeatures.flatMap(f => f.properties?.functions as string[])),
    },
  }

  const output =
    `{"type":"FeatureCollection","_meta":${JSON.stringify(meta, null, 2)},\n` +
    `"features":[\n${features.map(f => JSON.stringify(f)).join(',\n')}\n]}\n`
  writeFileSync(OUT_FILE, output)
  console.log(
    `[ports] ${harbourFeatures.length} fiskerihavner (${meta.counts.fishingHarboursWithPlace} med sted), ${facilityFeatures.length} havneanlegg (${ownersPublished} med eier) → ${OUT_FILE}`
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
