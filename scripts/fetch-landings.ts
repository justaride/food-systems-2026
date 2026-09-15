import { execFileSync } from 'child_process'
import { existsSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { CACHE_DIR, cachedDownload } from './lib/register-cache'
import { readCsvRecords } from './lib/csv-stream'
import {
  addLanding,
  createLandingAccumulator,
  finalizeLandings,
  landingsReconcile,
} from '../src/lib/map/registers/landings'

const YEAR = 2025
const FANGSTDATA_URL = `https://register.fiskeridir.no/uttrekk/fangstdata_${YEAR}.csv.zip`
const USER_AGENT = 'food-systems-2026-kart/1.0 (+https://github.com/justaride/food-systems-2026)'
const MIN_VESSELS = 3
const MIN_STATION_SHARE = 0.5

const DATA_DIR = join(__dirname, '..', 'public', 'data', 'food-systems', 'no')
const OUT_FILE = join(DATA_DIR, `landings-${YEAR}.json`)

async function main() {
  const file = await cachedDownload(FANGSTDATA_URL, `fiskeridir/fangstdata_${YEAR}.csv.zip`, {
    maxAgeHours: 24 * 7,
    headers: { 'User-Agent': USER_AGENT },
  })
  const csvPath = join(CACHE_DIR, 'fiskeridir', `fangstdata_${YEAR}.csv`)
  if (!existsSync(csvPath) || statSync(csvPath).mtimeMs < statSync(file.path).mtimeMs) {
    execFileSync('unzip', ['-o', '-q', file.path, '-d', join(CACHE_DIR, 'fiskeridir')])
  }

  const approvals = new Set<string>(
    JSON.parse(readFileSync(join(DATA_DIR, 'processing-establishments.geojson'), 'utf-8')).features.map(
      (f: { properties: { approvalNumber: string } }) => String(f.properties.approvalNumber)
    )
  )

  // Only the columns the aggregation needs are read; fisher and vessel names are never touched.
  const acc = createLandingAccumulator()
  for await (const r of readCsvRecords(csvPath, { delimiter: ';' })) {
    addLanding(acc, {
      documentType: r['Dokumenttype (kode)'],
      landingNation: r['Landingsnasjon (kode)'],
      station: r['Mottaksstasjon'],
      landingKommune: r['Landingskommune (kode)'],
      vessel: r['Fartøy ID'] || r['Registreringsmerke (seddel)'],
      speciesGroup: r['Art - hovedgruppe'],
      roundWeightKg: Number((r['Rundvekt'] || '0').replace(',', '.')) || 0,
    })
  }
  const result = finalizeLandings(acc, approvals, MIN_VESSELS)
  console.log(`[landings] ${acc.rowsRead} rader lest, ${acc.rowsKept} sluttseddellinjer landet i Norge`)

  if (!landingsReconcile(result)) {
    throw new Error('Avstemming feilet: stasjoner + kommuner + skjult ≠ total rundvekt')
  }
  const stationShare = result.counts.tonnes.stations / result.counts.totalTonnes
  if (stationShare < MIN_STATION_SHARE) {
    throw new Error(`For lite volum koblet til anlegg: ${Math.round(stationShare * 100)} %`)
  }

  const accessedAt = new Date().toISOString().slice(0, 10)
  const meta = {
    title: `Landet fangst per mottaksstasjon ${YEAR}`,
    sourceClass: 'registry_snapshot',
    verificationStatus: 'unverified',
    accessedAt,
    year: YEAR,
    citationText: `Fiskeridirektoratet (${accessedAt.slice(0, 4)}). Fangstdata (landings- og sluttseddelregisteret) ${YEAR}, åpne data. Rundvekt summert per mottaksstasjon og koblet til Mattilsynets godkjenningsnummer.`,
    licence: { fiskeridirektoratet: 'NLOD 2.0' },
    unit: 'tonn rundvekt',
    selection:
      'Bare sluttseddellinjer (dokumenttype 0) landet i Norge. Landingsdokumenter gjentar for det meste sluttsedler og er utelatt, det samme er fangst landet i utlandet.',
    privacy: `Volum vises per mottaksstasjon bare når stasjonens kode er et godkjenningsnummer fra Mattilsynet og minst ${MIN_VESSELS} ulike fartøy leverte der i året. Øvrige stasjoner summeres per landingskommune etter samme regel; resten er én skjult sum. Fisker-ID, fartøy-ID, fartøynavn og enkeltlandinger forlater aldri tmp/.`,
    reproduce: 'npm run fetch:landings',
    sources: [{ name: `Fiskeridirektoratet – fangstdata ${YEAR} (CSV)`, ...file }].map(({ path: _path, ...rest }) => rest),
    counts: { ...result.counts, stationShareOfTonnes: Math.round(stationShare * 1000) / 1000 },
  }

  const output = {
    _meta: meta,
    stations: result.stations,
    kommuner: result.kommuner,
    suppressed: result.suppressed,
  }
  writeFileSync(OUT_FILE, `${JSON.stringify(output, null, 1)}\n`)
  const c = result.counts
  console.log(
    `[landings] ${c.stationsPublished} stasjoner (${c.tonnes.stations} t), ${c.kommunerPublished} kommuner (${c.tonnes.kommuner} t), skjult ${c.tonnes.suppressed} t av ${c.totalTonnes} t → ${OUT_FILE}`
  )
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
