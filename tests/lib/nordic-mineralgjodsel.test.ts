import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

type CountryRow = {
  code: string
  name: string
  n_t: number | null
  p_t: number | null
  k_t: number | null
  year: string
  source: string
  data_quality: string
}
type Data = {
  basis: string
  primary_sources: string[]
  caveats: string[]
  countries: CountryRow[]
}

const data = JSON.parse(
  readFileSync('public/data/food-systems/nordic-mineralgjodsel.json', 'utf8'),
) as Data

describe('nordic mineralgjødsel data', () => {
  it('states element basis, sources and caveats', () => {
    assert.match(data.basis, /element/i)
    assert.ok(data.primary_sources.length >= 3, 'expected >= 3 primary sources')
    assert.ok(data.caveats.length > 0, 'missing caveats')
  })

  it('covers NO, SE, DK with positive N/P/K and IS as not-fetched', () => {
    const byCode = Object.fromEntries(data.countries.map((c) => [c.code, c]))
    for (const code of ['NO', 'SE', 'DK']) {
      const c = byCode[code]
      assert.ok(c, `missing ${code}`)
      for (const v of [c.n_t, c.p_t, c.k_t]) {
        assert.ok(typeof v === 'number' && v > 0, `${code} has non-positive nutrient: ${v}`)
      }
    }
    const is = byCode['IS']
    assert.ok(is, 'missing IS')
    assert.equal(is.n_t, null)
    assert.equal(is.data_quality, 'ikke hentet')
  })

  it('every country has a source and year', () => {
    for (const c of data.countries) {
      assert.ok(c.source.length > 0, `${c.code} missing source`)
      assert.ok(c.year.length > 0, `${c.code} missing year`)
    }
  })
})
