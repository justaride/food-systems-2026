import { execFileSync } from 'child_process'
import { existsSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'
import { CACHE_DIR, cachedDownload, type CachedFile } from './lib/register-cache'
import { readCsvRecords } from './lib/csv-stream'
import { buildAddressIndex, geocode, type AddressRow } from '../src/lib/map/registers/geocode'
import { countByKommune, publishDecision } from '../src/lib/map/registers/privacy'
import { geocodeAddressLines, selectWholesaleUnit, SELECTION_RULE } from '../src/lib/map/registers/wholesale'

const MATRIKKEL_URL =
  'https://nedlasting.geonorge.no/geonorge/Basisdata/MatrikkelenAdresse/CSV/Basisdata_0000_Norge_4258_MatrikkelenAdresse_CSV.zip'
const BRREG_UNITS_URL = 'https://data.brreg.no/enhetsregisteret/api/underenheter/lastned/csv'
const BRREG_ENTITIES_URL = 'https://data.brreg.no/enhetsregisteret/api/enheter/lastned/csv'

const OUT_FILE = join(__dirname, '..', 'public', 'data', 'food-systems', 'no', 'wholesale-logistics.geojson')
const MAX_DROPPED_SHARE = 0.05
const NACE_PREFIX = /^(46\.3|52\.1)/

const round5 = (n: number) => Math.round(n * 100_000) / 100_000
const toNumber = (value: string) => (value.trim() === '' ? null : Number(value))

type UnitRow = {
  orgNr: string
  name: string
  naceCode: string
  naceDescription: string
  employees: number | null
  closed: boolean
  address: string
  postnummer: string
  poststed: string
  parentOrgNr: string
}

type ParentRow = { orgNr: string; name: string; orgForm: string; naceCode: string }

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

/** Active sub-units in 46.3 or 52.1 with enough employees, before the parent-dependent rule. */
async function brregUnits() {
  const file = await cachedDownload(BRREG_UNITS_URL, 'brreg-underenheter.csv')
  const units: UnitRow[] = []
  let rowsRead = 0
  for await (const r of readCsvRecords(file.path)) {
    rowsRead++
    if (!NACE_PREFIX.test(r['naeringskode1.kode'])) continue
    units.push({
      orgNr: r.organisasjonsnummer,
      name: r.navn,
      naceCode: r['naeringskode1.kode'],
      naceDescription: r['naeringskode1.beskrivelse'],
      employees: toNumber(r.antallAnsatte),
      closed: r.nedleggelsesdato !== '',
      address: r['beliggenhetsadresse.adresse'],
      postnummer: r['beliggenhetsadresse.postnummer'],
      poststed: r['beliggenhetsadresse.poststed'],
      parentOrgNr: r.overordnetEnhet,
    })
  }
  return { file, units, rowsRead }
}

async function brregParents(orgNrs: Set<string>) {
  const file = await cachedDownload(BRREG_ENTITIES_URL, 'brreg-enheter.csv')
  const parents = new Map<string, ParentRow>()
  for await (const r of readCsvRecords(file.path)) {
    if (!orgNrs.has(r.organisasjonsnummer)) continue
    parents.set(r.organisasjonsnummer, {
      orgNr: r.organisasjonsnummer,
      name: r.navn,
      orgForm: r['organisasjonsform.kode'],
      naceCode: r['naeringskode1.kode'],
    })
  }
  return { file, parents }
}

const tally = (values: string[]) => {
  const counts = new Map<string, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  return Object.fromEntries([...counts.entries()].sort(([, a], [, b]) => b - a))
}

async function main() {
  const brreg = await brregUnits()
  const parentsFile = await brregParents(new Set(brreg.units.map(u => u.parentOrgNr).filter(Boolean)))
  const selections = brreg.units.map(unit => ({
    unit,
    selection: selectWholesaleUnit(unit, parentsFile.parents.get(unit.parentOrgNr) ?? null),
  }))
  const candidates = selections.filter(s => s.selection.include)
  console.log(
    `[wholesale] ${brreg.rowsRead} underenheter lest, ${brreg.units.length} i NACE 46.3/52.1, ${candidates.length} valgt`
  )

  const matrikkel = await matrikkelCsv()
  const postnumre = new Set(candidates.map(c => c.unit.postnummer.trim().padStart(4, '0')))
  const addressIndex = buildAddressIndex(await collect(addressRows(matrikkel.csvPath, postnumre)))

  const features: GeoJSON.Feature<GeoJSON.Point>[] = []
  const counted: { kommunenummer: string; reason: string }[] = []
  const dropped: string[] = []

  for (const { unit, selection } of candidates) {
    if (!selection.include) continue
    const location = geocodeAddressLines(unit.address, unit.postnummer, (line, pn) => geocode(addressIndex, line, pn))
    if (!location) {
      dropped.push(unit.orgNr)
      continue
    }

    const parent = parentsFile.parents.get(unit.parentOrgNr)
    const decision = publishDecision(
      parent
        ? { status: 'resolved', method: 'orgnr', orgNr: parent.orgNr, orgForm: parent.orgForm, employees: unit.employees }
        : { status: 'unresolved', reason: 'unknown-parent' }
    )
    if (decision.publish === 'kommune-count' || !parent) {
      counted.push({ kommunenummer: location.kommunenummer, reason: decision.publish === 'kommune-count' ? decision.reason : 'unresolved' })
      continue
    }

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [round5(location.coordinates[0]), round5(location.coordinates[1])] },
      properties: {
        orgNr: unit.orgNr,
        name: unit.name,
        group: selection.group,
        naceCode: unit.naceCode,
        naceDescription: unit.naceDescription,
        employees: unit.employees,
        parentOrgNr: parent.orgNr,
        parentName: parent.name,
        parentOrgForm: parent.orgForm,
        address: unit.address.split(/\r?\n/).map(line => line.trim()).filter(Boolean).join(', '),
        postnummer: unit.postnummer,
        poststed: unit.poststed,
        kommunenummer: location.kommunenummer,
        precision: location.precision,
      },
    })
  }

  if (features.length + counted.length + dropped.length !== candidates.length) {
    throw new Error('Avstemming feilet: punkter + kommunetall + utelatt ≠ valgte underenheter')
  }
  if (dropped.length / candidates.length > MAX_DROPPED_SHARE) {
    throw new Error(`For mange enheter uten posisjon: ${dropped.length} av ${candidates.length}`)
  }

  features.sort((a, b) => String(a.properties?.orgNr).localeCompare(String(b.properties?.orgNr)))
  const accessedAt = new Date().toISOString().slice(0, 10)
  const excluded = selections.filter(s => !s.selection.include)
  const sources = [
    { name: 'Brønnøysundregistrene – underenheter', ...brreg.file },
    { name: 'Brønnøysundregistrene – enheter', ...parentsFile.file },
    { name: 'Kartverket – Matrikkelen adresse (CSV)', ...matrikkel.file },
  ].map(({ path: _path, ...rest }) => rest)

  const meta = {
    title: 'Engroshandel med nærings- og nytelsesmidler og matrelatert lagring',
    sourceClass: 'registry_snapshot',
    verificationStatus: 'unverified',
    accessedAt,
    citationText: `Brønnøysundregistrene (${accessedAt.slice(0, 4)}). Enhetsregisteret – underenheter og enheter, næringskode 46.3 og 52.1. Posisjon fra Kartverket Matrikkelen adresse.`,
    licence: { brreg: 'NLOD', kartverket: 'CC BY 4.0' },
    privacy:
      'Bare underenheter som tilhører en organisasjon som ikke er enkeltpersonforetak vises som punkter. Enkeltpersonforetak og underenheter uten kjent hovedenhet telles per kommune.',
    selection: {
      rule: `Aktive underenheter (uten nedleggelsesdato) med minst ${SELECTION_RULE.minEmployees} ansatte og næringskode 46.3 eller 52.1. 46.35 (tobakk) er utelatt. 52.1 (lagring) tas bare med når hovedenhetens næringskode er matrelatert (${SELECTION_RULE.warehousingFoodParentNace.join(', ')}) eller navnet på underenheten eller hovedenheten viser kjøle-, fryse- eller matlager.`,
      ...SELECTION_RULE,
    },
    method:
      'Beliggenhetsadressen geokodes mot Matrikkelen: gateadresse og postnummer, deretter stedsnavn, deretter postnummerets midtpunkt. Flerlinjeadresser prøves linje for linje.',
    reproduce: 'npm run fetch:wholesale-logistics',
    sources,
    counts: {
      unitsRead: brreg.rowsRead,
      unitsInNace: brreg.units.length,
      excluded: tally(excluded.map(s => (s.selection.include ? '' : s.selection.reason))),
      selected: candidates.length,
      selectedBy: tally(candidates.map(c => (c.selection.include ? c.selection.reason : ''))),
      points: features.length,
      kommuneCounted: tally(counted.map(c => c.reason)),
      droppedWithoutLocation: dropped.length,
      pointsByGroup: tally(features.map(f => String(f.properties?.group))),
      pointsByNace: tally(features.map(f => String(f.properties?.naceCode))),
      pointsByPrecision: tally(features.map(f => String(f.properties?.precision))),
    },
  }

  const output =
    `{"type":"FeatureCollection","_meta":${JSON.stringify(meta, null, 2)},\n` +
    `"kommuneCounts":${JSON.stringify(countByKommune(counted.map(c => c.kommunenummer)))},\n` +
    `"features":[\n${features.map(f => JSON.stringify(f)).join(',\n')}\n]}\n`
  writeFileSync(OUT_FILE, output)
  console.log(`[wholesale] ${features.length} punkter, ${counted.length} kommunetalt, ${dropped.length} uten posisjon → ${OUT_FILE}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
