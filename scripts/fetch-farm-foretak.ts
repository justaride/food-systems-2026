import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { countForetakByKommune, parseForetakCsv } from '../src/lib/map/farm-foretak'
import { kommuneCentroid } from '../src/lib/map/kommune-centroid'
import type { Farm } from '../src/lib/map/types'

const FORETAK_URL =
  'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/foretak/dataset_extended.csv'
const DATA_DIR = join(__dirname, '..', 'public', 'data', 'food-systems', 'no')
const OUT_FILE = join(DATA_DIR, 'farm-foretak-by-kommune.json')

const round = (n: number) => Math.round(n * 10000) / 10000

async function main() {
  const res = await fetch(FORETAK_URL)
  if (!res.ok) throw new Error(`Henting av foretak-CSV feilet: ${res.status}`)
  const counts = countForetakByKommune(parseForetakCsv(await res.text()))

  const boundaries = JSON.parse(
    readFileSync(join(DATA_DIR, 'norway-municipalities.geojson'), 'utf-8')
  ) as GeoJSON.FeatureCollection

  const known = new Set<string>()
  const kommuner: Farm[] = []
  for (const feature of boundaries.features) {
    const code = String(feature.properties?.kommunenummer ?? '')
    known.add(code)
    const foretak = counts.get(code)
    if (!foretak) continue
    const [lng, lat] = kommuneCentroid(feature)
    kommuner.push({
      municipalityCode: code,
      name: String(feature.properties?.kommunenavn ?? code),
      foretak,
      coordinates: [round(lng), round(lat)],
    })
  }

  const unknown = [...counts.keys()].filter(code => !known.has(code))
  if (unknown.length) throw new Error(`Kommunenummer uten kommunegrense: ${unknown.join(', ')}`)

  kommuner.sort((a, b) => a.municipalityCode.localeCompare(b.municipalityCode))
  const total = kommuner.reduce((sum, k) => sum + k.foretak, 0)
  const output = {
    _meta: {
      source: 'Landbruksdirektoratet – Foretak (åpne data)',
      sourceUrl: FORETAK_URL,
      fetched: new Date().toISOString().slice(0, 10),
      unit: 'Registrerte landbruksforetak, talt i kommunen der driftssenteret ligger',
      total,
      note: 'Bare antall per kommune. Registeret identifiserer enkeltpersonforetak, så rader per foretak publiseres ikke.',
    },
    kommuner,
  }

  writeFileSync(OUT_FILE, JSON.stringify(output, null, 2) + '\n')
  console.log(`[farm-foretak] ${total} foretak i ${kommuner.length} kommuner → ${OUT_FILE}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
