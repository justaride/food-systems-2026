import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  addLanding,
  createLandingAccumulator,
  finalizeLandings,
  landingsReconcile,
  type LandingRow,
} from '../../../../src/lib/map/registers/landings'

// Synthetic sales-note lines with invented station, kommune and vessel codes.
const row = (over: Partial<LandingRow>): LandingRow => ({
  documentType: '0',
  landingNation: 'NOR',
  station: 'S1',
  landingKommune: '9901',
  vessel: 'V1',
  speciesGroup: 'Pelagisk fisk',
  roundWeightKg: 1000,
  ...over,
})

function build(rows: LandingRow[]) {
  const acc = createLandingAccumulator()
  for (const r of rows) addLanding(acc, r)
  return acc
}

describe('addLanding', () => {
  it('keeps only sales notes landed in Norway at a station', () => {
    const acc = build([
      row({}),
      row({ documentType: '1' }),
      row({ landingNation: 'DNK' }),
      row({ station: '' }),
    ])
    assert.equal(acc.rowsRead, 4)
    assert.equal(acc.rowsKept, 1)
    assert.deepEqual(acc.skipped, { landingDocument: 1, landedAbroad: 1, withoutStation: 1 })
    assert.equal(acc.totalKg, 1000)
  })
})

describe('finalizeLandings', () => {
  const acc = build([
    // Matched station with three vessels: published under its approval number.
    row({ station: '1001', vessel: 'V1', roundWeightKg: 2000 }),
    row({ station: '1001', vessel: 'V2', roundWeightKg: 1500, speciesGroup: 'Torsk og torskeartet fisk' }),
    row({ station: '1001', vessel: 'V3', roundWeightKg: 500 }),
    // Matched station with two vessels: too few, falls back to its kommune.
    row({ station: '1002', vessel: 'V4', landingKommune: '9902', roundWeightKg: 1000 }),
    row({ station: '1002', vessel: 'V5', landingKommune: '9902', roundWeightKg: 1000 }),
    // Unmatched station in the same kommune adds a third vessel.
    row({ station: 'X1', vessel: 'V6', landingKommune: '9902', roundWeightKg: 3000 }),
    // Unmatched lone station: suppressed.
    row({ station: 'X2', vessel: 'V7', landingKommune: '9903', roundWeightKg: 4000 }),
  ])
  const result = finalizeLandings(acc, new Set(['1001', '1002']))

  it('publishes matched stations with enough vessels, largest species group first', () => {
    assert.deepEqual(result.stations, {
      '1001': { tonnes: 4, byGroup: { 'Pelagisk fisk': 3, 'Torsk og torskeartet fisk': 2 }, landingKommune: '9901' },
    })
  })

  it('rolls the rest into kommuner that clear the threshold and suppresses the remainder', () => {
    assert.deepEqual(result.kommuner, { '9902': { tonnes: 5, byGroup: { 'Pelagisk fisk': 5 } } })
    assert.deepEqual(result.suppressed, { tonnes: 4, stations: 1 })
    assert.equal(result.counts.stationsInKommuner, 2)
  })

  it('reconciles buckets against the total and leaks no vessel codes', () => {
    assert.equal(landingsReconcile(result), true)
    assert.doesNotMatch(JSON.stringify(result), /V\d/)
  })
})
