import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const DATA_DIR = join(__dirname, '..', '..', '..', 'public', 'data', 'food-systems')
const readJson = (path: string) => JSON.parse(readFileSync(join(DATA_DIR, path), 'utf-8'))

const municipalities = readJson('no/municipalities.json') as Record<string, { name?: string }>
const REPLACEMENT_CHAR = '�'

describe('Norwegian kommune names used on the map', () => {
  it('municipalities.json names have no replacement characters', () => {
    for (const [code, muni] of Object.entries(municipalities)) {
      if (code === '_meta') continue
      assert.ok(muni.name, `missing name for ${code}`)
      assert.ok(!muni.name.includes(REPLACEMENT_CHAR), `garbled name for ${code}: ${muni.name}`)
    }
  })

  for (const file of ['no/norway-municipalities.geojson', 'norway-municipalities.geojson']) {
    it(`${file} names are clean and match municipalities.json`, () => {
      const boundaries = readJson(file) as GeoJSON.FeatureCollection
      assert.equal(boundaries.features.length, 357)
      for (const feature of boundaries.features) {
        const code = String(feature.properties?.kommunenummer)
        const name = String(feature.properties?.kommunenavn)
        assert.equal(name, municipalities[code]?.name, `kommunenavn for ${code}`)
        for (const entry of feature.properties?.administrativenhetnavn ?? []) {
          assert.ok(!String(entry.navn).includes(REPLACEMENT_CHAR), `garbled navn for ${code}: ${entry.navn}`)
        }
      }
    })
  }

  it('farm-foretak-by-kommune.json names are clean and match municipalities.json', () => {
    const { kommuner } = readJson('no/farm-foretak-by-kommune.json') as {
      kommuner: { municipalityCode: string; name: string }[]
    }
    for (const k of kommuner) {
      assert.ok(!k.name.includes(REPLACEMENT_CHAR), `garbled name for ${k.municipalityCode}: ${k.name}`)
      assert.equal(k.name, municipalities[k.municipalityCode]?.name)
    }
  })
})
