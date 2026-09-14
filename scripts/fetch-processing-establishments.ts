import { execFileSync } from 'child_process'
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { CACHE_DIR, cachedDownload, type CachedFile } from './lib/register-cache'
import { readCsvRecords } from './lib/csv-stream'
import { buildAddressIndex, geocode, type AddressRow } from '../src/lib/map/registers/geocode'
import {
  extractCsvLinks,
  groupEstablishments,
  isVesselOnly,
  parseCsv,
  type Establishment,
} from '../src/lib/map/registers/mattilsynet'
import {
  buildBrregIndex,
  nameKeyFor,
  resolveEstablishment,
  type BrregEntity,
  type BrregUnit,
} from '../src/lib/map/registers/brreg-match'
import { countByKommune, publishDecision } from '../src/lib/map/registers/privacy'

const MATTILSYNET_PAGES = {
  food: 'https://www.mattilsynet.no/godkjente-produkter-og-virksomheter/v-virklist-food-sections.csv',
  fishery:
    'https://www.mattilsynet.no/godkjente-produkter-og-virksomheter/fisk-og-fiskerivarer-fish-and-fishery-products-virksomheter-som-h%C3%A5ndterer-fiskerivarer-fishery-establishments',
}
const MATRIKKEL_URL =
  'https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/CSV/Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV.zip'
const BRREG_UNITS_URL = 'https://data.brreg.no/enhetsregisteret/api/underenheter/lastned/csv'
const BRREG_ENTITIES_URL = 'https://data.brreg.no/enhetsregisteret/api/enheter/lastned/csv'

const OUT_FILE = join(__dirname, '..', 'public', 'data', 'food-systems', 'no', 'processing-establishments.geojson')
const MAX_DROPPED_SHARE = 0.1

const round5 = (n: number) => Math.round(n * 100_000) / 100_000
const toNumber = (value: string) => (value.trim() === '' ? null : Number(value))

async function mattilsynetCsv(pageUrl: string, fileName: string) {
  const res = await fetch(pageUrl)
  if (!res.ok) throw new Error(`Mattilsynet-siden svarte ${res.status}: ${pageUrl}`)
  const [csvUrl] = extractCsvLinks(await res.text())
  if (!csvUrl) throw new Error(`Fant ingen CSV-lenke på ${pageUrl}`)
  const file = await cachedDownload(csvUrl, fileName)
  return { file, pageUrl, rows: parseCsv(readFileSync(file.path, 'utf-8')) }
}

async function matrikkelCsv(): Promise<{ file: CachedFile; csvPath: string }> {
  const file = await cachedDownload(MATRIKKEL_URL, 'matrikkel-adresse.zip', { maxAgeHours: 24 * 7 })
  const dir = join(CACHE_DIR, 'matrikkel-adresse')
  const csvPath = join(dir, 'Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV', 'matrikkelenAdresse.csv')
  if (!existsSync(csvPath) || statSync(csvPath).mtimeMs < statSync(file.path).mtimeMs) {
    execFileSync('unzip', ['-o', '-q', file.path, '-d', dir])
  }
  return { file, csvPath }
}

async function* addressRows(csvPath: string, postnumre: Set<string>): AsyncGenerator<AddressRow> {
  for await (const r of readCsvRecords(csvPath, { delimiter: ';' })) {
    if (!postnumre.has(r.postnummer)) continue
    yield {
      postnummer: r.postnummer,
      kommunenummer: r.kommunenummer,
      adressenavn: r.adressenavn,
      nummer: r.nummer,
      bokstav: r.bokstav,
      adressetilleggsnavn: r.adressetilleggsnavn,
      lat: Number(r.Nord),
      lon: Number(r['Øst']),
    }
  }
}

async function collect<T>(source: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = []
  for await (const item of source) out.push(item)
  return out
}

/** Keep only Brreg rows that can match an establishment, so the index stays small. */
async function brregIndex(establishments: Establishment[]) {
  const keys = new Set(establishments.map(e => nameKeyFor(e.name, e.postnummer)))
  const orgNrs = new Set(establishments.flatMap(e => (e.orgNr ? [e.orgNr] : [])))

  const unitsFile = await cachedDownload(BRREG_UNITS_URL, 'brreg-underenheter.csv')
  const units: BrregUnit[] = []
  for await (const r of readCsvRecords(unitsFile.path)) {
    const postnummer = r['beliggenhetsadresse.postnummer']
    if (!orgNrs.has(r.organisasjonsnummer) && !keys.has(nameKeyFor(r.navn, postnummer))) continue
    units.push({
      orgNr: r.organisasjonsnummer,
      name: r.navn,
      postnummer,
      parentOrgNr: r.overordnetEnhet,
      employees: toNumber(r.antallAnsatte),
      closed: r.nedleggelsesdato !== '',
    })
  }

  const parents = new Set(units.map(u => u.parentOrgNr))
  const entitiesFile = await cachedDownload(BRREG_ENTITIES_URL, 'brreg-enheter.csv')
  const entities: BrregEntity[] = []
  for await (const r of readCsvRecords(entitiesFile.path)) {
    const orgNr = r.organisasjonsnummer
    const postnummer = r['forretningsadresse.postnummer'] || r['postadresse.postnummer']
    if (!orgNrs.has(orgNr) && !parents.has(orgNr) && !keys.has(nameKeyFor(r.navn, postnummer))) continue
    entities.push({
      orgNr,
      name: r.navn,
      postnummer,
      orgForm: r['organisasjonsform.kode'],
      employees: toNumber(r.antallAnsatte),
    })
  }

  return { index: buildBrregIndex(units, entities), files: [unitsFile, entitiesFile] }
}

const tally = (values: string[]) =>
  Object.fromEntries(
    Object.entries(values.reduce<Record<string, number>>((acc, v) => ({ ...acc, [v]: (acc[v] ?? 0) + 1 }), {})).sort(
      ([, a], [, b]) => b - a
    )
  )

async function main() {
  const food = await mattilsynetCsv(MATTILSYNET_PAGES.food, 'mattilsynet-food-sections.csv')
  const fishery = await mattilsynetCsv(MATTILSYNET_PAGES.fishery, 'mattilsynet-fishery.csv')
  const orgNrByApproval = new Map(
    fishery.rows.filter(r => r.BEDRIFTSNUMMER).map(r => [r.GODKJENNINGSNUMMER, r.BEDRIFTSNUMMER])
  )

  const all = groupEstablishments(food.rows, orgNrByApproval)
  const vessels = all.filter(isVesselOnly)
  const land = all.filter(e => !isVesselOnly(e))
  console.log(`[processing] ${all.length} godkjenninger, ${vessels.length} bare fartøy, ${land.length} på land`)

  const matrikkel = await matrikkelCsv()
  const postnumre = new Set(land.map(e => e.postnummer.trim().padStart(4, '0')))
  const addressIndex = buildAddressIndex(await collect(addressRows(matrikkel.csvPath, postnumre)))
  const brreg = await brregIndex(land)

  const features: GeoJSON.Feature<GeoJSON.Point>[] = []
  const counted: { kommunenummer: string; reason: string }[] = []
  const dropped: string[] = []
  const methods: string[] = []

  for (const e of land) {
    const location = geocode(addressIndex, e.address, e.postnummer)
    if (!location) {
      dropped.push(e.approvalNumber)
      continue
    }
    const resolution = resolveEstablishment(brreg.index, e)
    methods.push(resolution.status === 'resolved' ? resolution.method : resolution.reason)
    const decision = publishDecision(resolution)

    if (decision.publish === 'kommune-count' || resolution.status !== 'resolved') {
      counted.push({
        kommunenummer: location.kommunenummer,
        reason: decision.publish === 'kommune-count' ? decision.reason : 'unresolved',
      })
      continue
    }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [round5(location.coordinates[0]), round5(location.coordinates[1])] },
      properties: {
        approvalNumber: e.approvalNumber,
        name: e.name,
        category: e.category,
        sections: e.sections,
        activities: e.activities,
        species: e.species,
        address: e.address,
        postnummer: e.postnummer,
        poststed: e.poststed,
        kommunenummer: location.kommunenummer,
        precision: location.precision,
        orgNr: resolution.orgNr,
        employees: resolution.employees,
      },
    })
  }

  if (features.length + counted.length + dropped.length !== land.length) {
    throw new Error('Avstemming feilet: punkter + kommunetall + utelatt ≠ anlegg på land')
  }
  if (dropped.length / land.length > MAX_DROPPED_SHARE) {
    throw new Error(`For mange anlegg uten posisjon: ${dropped.length} av ${land.length}`)
  }

  features.sort((a, b) => String(a.properties?.approvalNumber).localeCompare(String(b.properties?.approvalNumber)))
  const accessedAt = new Date().toISOString().slice(0, 10)
  const sources = [
    { name: 'Mattilsynet – godkjente virksomheter, næringsmidler', page: food.pageUrl, ...food.file },
    { name: 'Mattilsynet – virksomheter som håndterer fiskerivarer', page: fishery.pageUrl, ...fishery.file },
    { name: 'Kartverket – Matrikkelen adresse (CSV)', ...matrikkel.file },
    { name: 'Brønnøysundregistrene – underenheter', ...brreg.files[0] },
    { name: 'Brønnøysundregistrene – enheter', ...brreg.files[1] },
  ].map(({ path: _path, ...rest }) => rest)

  const meta = {
    title: 'Godkjente næringsmiddelvirksomheter på land',
    sourceClass: 'registry_snapshot',
    verificationStatus: 'unverified',
    accessedAt,
    citationText: `Mattilsynet (${accessedAt.slice(0, 4)}). Godkjente virksomheter – næringsmidler og fiskerivarer. Posisjon fra Kartverket Matrikkelen adresse; organisasjonsform fra Brønnøysundregistrene.`,
    licence: {
      mattilsynet: 'Ingen lisens oppgitt av Mattilsynet; offentlig liste over godkjente virksomheter, gjengitt med kildehenvisning',
      kartverket: 'CC BY 4.0',
      brreg: 'NLOD',
    },
    privacy:
      'Bare virksomheter som tilhører en organisasjon som ikke er enkeltpersonforetak vises som punkter. Enkeltpersonforetak og virksomheter som ikke kunne kobles til Enhetsregisteret, telles per kommune.',
    reproduce: 'npm run fetch:processing-establishments',
    sources,
    counts: {
      approvals: all.length,
      vesselOnly: vessels.length,
      onLand: land.length,
      points: features.length,
      kommuneCounted: tally(counted.map(c => c.reason)),
      droppedWithoutLocation: dropped.length,
      pointsByCategory: tally(features.map(f => String(f.properties?.category))),
      pointsByPrecision: tally(features.map(f => String(f.properties?.precision))),
      brregResolution: tally(methods),
    },
  }

  const output =
    `{"type":"FeatureCollection","_meta":${JSON.stringify(meta, null, 2)},\n` +
    `"kommuneCounts":${JSON.stringify(countByKommune(counted.map(c => c.kommunenummer)))},\n` +
    `"features":[\n${features.map(f => JSON.stringify(f)).join(',\n')}\n]}\n`
  writeFileSync(OUT_FILE, output)
  console.log(`[processing] ${features.length} punkter, ${counted.length} kommunetalt, ${dropped.length} uten posisjon → ${OUT_FILE}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
