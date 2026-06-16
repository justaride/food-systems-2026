import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

type Row = {
  year: number
  soya_import_brasil_share_kg_pct: number | null
  klippfisk_export_brasil_share_kg_pct: number | null
  soya_import_brasil_kg: number | null
  klippfisk_export_brasil_kg: number | null
  data_quality: string
}
type Data = {
  source: string
  primary_sources: string[]
  control: string
  caveats: string[]
  timeseries: Row[]
}

const data = JSON.parse(
  readFileSync('public/data/food-systems/handelsakse-norge-brasil.json', 'utf8'),
) as Data

describe('handelsakse Norge–Brasil data', () => {
  it('has SSB source, control note and caveats', () => {
    assert.match(data.source, /08801/)
    assert.ok(data.primary_sources.length > 0, 'missing primary sources')
    assert.ok(data.control.length > 0, 'missing SSB-vs-Comtrade control note')
    assert.ok(data.caveats.length > 0, 'missing caveats')
  })

  it('covers 2015–2025 with unique, strictly ascending years', () => {
    const years = data.timeseries.map((r) => r.year)
    assert.equal(years[0], 2015)
    assert.equal(years[years.length - 1], 2025)
    assert.equal(new Set(years).size, years.length, 'duplicate years')
    for (let i = 1; i < years.length; i += 1) {
      assert.ok(years[i] > years[i - 1], `years not ascending at ${years[i]}`)
    }
  })

  it('shares are valid percentages and kg values are positive', () => {
    for (const r of data.timeseries) {
      for (const share of [r.soya_import_brasil_share_kg_pct, r.klippfisk_export_brasil_share_kg_pct]) {
        if (share != null) {
          assert.ok(share >= 0 && share <= 100, `${r.year} share out of range: ${share}`)
        }
      }
      for (const kg of [r.soya_import_brasil_kg, r.klippfisk_export_brasil_kg]) {
        if (kg != null) assert.ok(kg > 0, `${r.year} kg not positive: ${kg}`)
      }
    }
  })

  it('marks 2025 as foreløpig (preliminary)', () => {
    const row2025 = data.timeseries.find((r) => r.year === 2025)
    assert.ok(row2025, 'missing 2025 row')
    assert.equal(row2025?.data_quality, 'foreløpig')
  })
})
