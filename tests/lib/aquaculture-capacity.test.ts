import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatAquacultureCapacity,
  isAquacultureTonnageUnit,
} from '../../src/lib/aquaculture-capacity'

describe('aquaculture capacity helpers', () => {
  it('keeps count-based capacity units out of tonnage totals', () => {
    assert.equal(isAquacultureTonnageUnit('TN'), true)
    assert.equal(isAquacultureTonnageUnit('MTB'), true)
    assert.equal(isAquacultureTonnageUnit('STK'), false)
  })

  it('renders capacity with the source unit instead of forcing everything to tonnes', () => {
    assert.equal(formatAquacultureCapacity(2500, 'TN'), '2 500 tonn')
    assert.equal(formatAquacultureCapacity(2500000, 'STK'), '2 500 000 stk')
    assert.equal(formatAquacultureCapacity(null, 'TN'), '—')
  })
})
