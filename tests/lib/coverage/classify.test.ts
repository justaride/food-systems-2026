import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  classifyTemporal,
  coversNordic,
  deriveGeographicScope,
  rollupVerification,
} from '../../../src/lib/coverage/classify'

describe('classifyTemporal', () => {
  it('single year is a snapshot', () => {
    assert.deepEqual(classifyTemporal([2025, 2025]), { kind: 'snapshot', year: 2025 })
  })
  it('empty is unknown', () => {
    assert.deepEqual(classifyTemporal([]), { kind: 'unknown' })
  })
  it('one dominant year (>=95% of rows) is a snapshot despite a stray', () => {
    const years = [...Array(99).fill(2025), 2022]
    assert.deepEqual(classifyTemporal(years), { kind: 'snapshot', year: 2025 })
  })
  it('5+ contiguous distinct years is a time_series', () => {
    assert.deepEqual(classifyTemporal([2020, 2021, 2022, 2023, 2024, 2025]), {
      kind: 'time_series',
      from: 2020,
      to: 2025,
      cadence: 'yearly',
    })
  })
  it('sparse distinct years are multi_year', () => {
    assert.deepEqual(classifyTemporal([2020, 2022, 2024]), {
      kind: 'multi_year',
      years: [2020, 2022, 2024],
    })
  })
})

describe('coversNordic', () => {
  it('true only when all five Nordic codes are present (case-insensitive)', () => {
    assert.equal(coversNordic(['NO', 'SE', 'DK', 'FI', 'IS']), true)
    assert.equal(coversNordic(['no', 'se', 'dk', 'fi', 'is']), true)
    assert.equal(coversNordic(['NO']), false)
  })
})

describe('deriveGeographicScope', () => {
  it('flags NO-only presented as nordic', () => {
    const s = deriveGeographicScope(['NO'], 'nordic')
    assert.equal(s.noAsNordicProxy, true)
    assert.deepEqual(s.countries, ['NO'])
  })
  it('no proxy when full nordic', () => {
    assert.equal(deriveGeographicScope(['NO', 'SE', 'DK', 'FI', 'IS'], 'nordic').noAsNordicProxy, false)
  })
  it('no proxy when presented as no', () => {
    assert.equal(deriveGeographicScope(['NO'], 'no').noAsNordicProxy, false)
  })
})

describe('rollupVerification', () => {
  it('human_grade at/above threshold', () => {
    assert.equal(
      rollupVerification({ verified: 8, humanVerified: 0, machineVerified: 1, needsReview: 1, total: 10 }).rollup,
      'human_grade',
    )
  })
  it('empty totals are needs_review (never human_grade)', () => {
    assert.equal(
      rollupVerification({ verified: 0, humanVerified: 0, machineVerified: 0, needsReview: 0, total: 0 }).rollup,
      'needs_review',
    )
  })
  it('machine_grade when majority machine', () => {
    assert.equal(
      rollupVerification({ verified: 0, humanVerified: 0, machineVerified: 6, needsReview: 4, total: 10 }).rollup,
      'machine_grade',
    )
  })
})
