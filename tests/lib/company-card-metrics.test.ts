import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { formatEmployeeDisplay, formatRevenueDisplay } from '../../src/lib/company-card-metrics'

describe('company card metric display', () => {
  it('labels a missing company financial row instead of showing an opaque dash', () => {
    assert.equal(formatRevenueDisplay(null, false), 'Mangler regnskap')
  })

  it('keeps unknown revenue distinct when a financial row exists but revenue is blank', () => {
    assert.equal(formatRevenueDisplay(null, true), '—')
  })

  it('formats revenue and employees compactly for company cards', () => {
    assert.equal(formatRevenueDisplay(52_100_000_000, true), '52.1 mrd')
    assert.equal(formatEmployeeDisplay(2800), '2 800')
  })
})
