import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mergeAquacultureSites } from '../../../src/lib/map/aquaculture-merge'
import type { AquacultureSite } from '../../../src/lib/map/types'

function site(id: number, extra: Partial<AquacultureSite> = {}): AquacultureSite {
  return {
    id,
    name: `Lokalitet ${id}`,
    status: 'AKTIV',
    capacity: 780,
    capacityUnit: 'TN',
    placement: 'sea',
    waterType: 'SALTVANN',
    county: 'VESTLAND',
    municipality: 'ETNE',
    species: ['Laks'],
    productionType: 'matfisk',
    coordinates: [5.98, 59.74],
    ...extra,
  }
}

describe('mergeAquacultureSites', () => {
  it('keeps every register site when the database covers only some of them', () => {
    const merged = mergeAquacultureSites(
      [site(1), site(2), site(3)],
      [site(2, { companyName: 'Mowi ASA', orgNr: '964118191' })]
    )
    assert.equal(merged.length, 3)
  })

  it('adds owner fields from the database without overwriting register fields', () => {
    const [merged] = mergeAquacultureSites(
      [site(2, { productionType: 'settefisk' })],
      [site(2, { productionType: 'matfisk', companyName: 'Mowi ASA', orgNr: '964118191' })]
    )
    assert.equal(merged.productionType, 'settefisk')
    assert.equal(merged.companyName, 'Mowi ASA')
    assert.equal(merged.orgNr, '964118191')
  })

  it('appends database sites that the register snapshot lacks', () => {
    const merged = mergeAquacultureSites([site(1)], [site(9, { companyName: 'Lerøy Seafood Group ASA' })])
    assert.deepEqual(merged.map(s => s.id), [1, 9])
  })
})
