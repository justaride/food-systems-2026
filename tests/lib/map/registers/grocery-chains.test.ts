import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  classifyGroceryElement,
  dedupeNearby,
  reconcileChains,
} from '../../../../src/lib/map/registers/grocery-chains'

// Synthetic OSM tags with invented place names.
describe('classifyGroceryElement', () => {
  it('uses the brand tag when present', () => {
    assert.deepEqual(classifyGroceryElement({ brand: 'Kiwi', name: 'Kiwi Prøvested' }), {
      include: true,
      chainId: 'kiwi',
      chain: 'Kiwi',
      storeType: 'discount',
      matchedBy: 'brand',
    })
    assert.equal(classifyGroceryElement({ brand: 'Coop Prix', name: 'Prix Prøvested' }).include && 'coop-prix', 'coop-prix')
  })

  it('falls back to a chain name at the start of the name, longest alias first', () => {
    const extra = classifyGroceryElement({ name: 'Coop Extra Prøvested' })
    assert.equal(extra.include && extra.chainId, 'extra')
    assert.equal(extra.include && extra.matchedBy, 'name')
    const eurospar = classifyGroceryElement({ name: 'Eurospar Prøvested' })
    assert.equal(eurospar.include && eurospar.chainId, 'eurospar')
    const obs = classifyGroceryElement({ name: 'Coop Obs Prøvested' })
    assert.equal(obs.include && obs.chainId, 'obs')
  })

  it('does not match a chain name inside another word', () => {
    assert.deepEqual(classifyGroceryElement({ name: 'Sparebutikken Prøvested' }), { include: false, reason: 'other' })
    assert.deepEqual(classifyGroceryElement({ name: 'Prøvested Kiwi' }), { include: false, reason: 'other' })
  })

  it('excludes service retail and unknown brands', () => {
    assert.deepEqual(classifyGroceryElement({ brand: '7-Eleven', name: '7-Eleven Prøvested' }), {
      include: false,
      reason: 'service-retail',
    })
    assert.deepEqual(classifyGroceryElement({ name: 'Mix Prøvested' }), { include: false, reason: 'service-retail' })
    assert.deepEqual(classifyGroceryElement({ brand: 'Prøvekolonial', name: 'Kiwi-lignende' }), { include: false, reason: 'other' })
    assert.deepEqual(classifyGroceryElement({}), { include: false, reason: 'other' })
  })
})

describe('dedupeNearby', () => {
  const store = (id: string, chainId: string, name: string, lat: number, lng: number) => ({
    id,
    chainId,
    chain: chainId === 'kiwi' ? 'Kiwi' : 'Rema 1000',
    name,
    location: { lat, lng },
  })

  it('drops a same-chain point within the distance and keeps other chains', () => {
    const { kept, removed } = dedupeNearby([
      store('a', 'kiwi', 'Kiwi Prøvested', 60, 10),
      store('b', 'kiwi', 'Kiwi', 60.0003, 10),
      store('c', 'rema', 'Rema 1000 Prøvested', 60.0003, 10),
      store('d', 'kiwi', 'Kiwi Prøvested', 60.01, 10),
    ])
    assert.deepEqual(kept.map(s => s.id), ['a', 'c', 'd'])
    assert.deepEqual(removed.map(s => s.id), ['b'])
  })

  it('treats an extended name as the same shop but keeps differently named neighbours', () => {
    const { kept, removed } = dedupeNearby([
      store('a', 'kiwi', 'KIWI Prøvested', 60, 10),
      store('b', 'kiwi', 'Kiwi Prøvested Nord', 60.0002, 10),
      store('c', 'kiwi', 'Kiwi Annetsted', 60.0004, 10),
    ])
    assert.deepEqual(kept.map(s => s.id), ['a', 'c'])
    assert.deepEqual(removed.map(s => s.id), ['b'])
  })
})

describe('reconcileChains', () => {
  const reference = {
    source: 'synthetic',
    url: '',
    total: 300,
    groups: [
      { label: 'A', chainIds: ['a'], stores: 200 },
      { label: 'B + C', chainIds: ['b', 'c'], stores: 60 },
      { label: 'Liten', chainIds: ['d'], stores: 10 },
      { label: 'Delmengde', chainIds: ['e'], stores: 30, subsetOnly: true },
    ],
  }

  it('passes within tolerance and compares paired chains together', () => {
    const result = reconcileChains({ a: 210, b: 25, c: 35, d: 2, e: 28 }, reference)
    assert.deepEqual(result.failures, [])
    assert.equal(result.rows[1].osm, 60)
    assert.equal(result.rows[2].checked, false)
    assert.equal(result.rows[3].checked, false)
  })

  it('fails when a large chain or the total drifts too far', () => {
    const result = reconcileChains({ a: 120, b: 30, c: 30 }, reference)
    assert.equal(result.failures.length, 2)
    assert.match(result.failures[0], /^A:/)
    assert.match(result.failures[1], /^Totalt:/)
  })
})
