import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseVolume } from '../../../src/lib/flows/parse'

describe('parseVolume', () => {
  it('parses number + compound unit, ignoring parenthetical', () => {
    assert.deepEqual(parseVolume('8100 GWh/yr (175 plants)'), { value: 8100, unit: 'GWh/yr' })
  })
  it('parses percent', () => {
    assert.deepEqual(parseVolume('92.3% return rate'), { value: 92.3, unit: '%' })
  })
  it('parses tilde + thousands separator', () => {
    assert.deepEqual(parseVolume('~800,000 tonnes processed/year'), { value: 800000, unit: 'tonnes' })
  })
  it('parses currency-like unit', () => {
    assert.deepEqual(parseVolume('300 MNOK invested'), { value: 300, unit: 'MNOK' })
  })
  it('returns undefined when no number+unit is found', () => {
    assert.equal(parseVolume('market-driven'), undefined)
    assert.equal(parseVolume(undefined), undefined)
  })
})
