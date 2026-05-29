import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseLoopFlow } from '../../../src/lib/flows/parse'

describe('parseLoopFlow', () => {
  it('splits flow on arrows into nodes + chained edges, illustrative + no overclaim', () => {
    const result = parseLoopFlow({
      id: 'dk-biogas',
      rLevel: 'R9',
      volume: '8100 GWh/yr (175 plants)',
      value_chain_step: ['waste', 'primary'],
      flow: 'Food waste → anaerobic digestion → Nature Energy → agriculture',
      sources: ['IEA Bioenergy DK 2024', 'SA-02'],
    })
    assert.equal(result.loopId, 'dk-biogas')
    assert.equal(result.nodes.length, 4)
    assert.equal(result.edges.length, 3)
    const ne = result.nodes.find((n) => n.label === 'Nature Energy')
    assert.equal(ne?.type, 'actor')
    assert.equal(ne?.ref, '/aktorer/nature-energy-shell')
    assert.equal(result.nodes[0].type, 'category')
    assert.equal(result.nodes[0].valueChainStep, 'waste')
    assert.ok(result.edges.every((e) => e.evidenceStatus === 'illustrative'))
    assert.ok(result.edges.every((e) => e.rLevel === 'R9'))
    assert.deepEqual(result.edges[0].sourceRefs, [{ label: 'IEA Bioenergy DK 2024' }, { label: 'SA-02' }])
    assert.deepEqual(result.edges[0].quantity, { value: 8100, unit: 'GWh/yr' })
    assert.equal(result.edges[1].quantity, undefined)
  })

  it('produces no edges for an empty flow', () => {
    const result = parseLoopFlow({ id: 'x', flow: '' })
    assert.deepEqual(result, { loopId: 'x', nodes: [], edges: [] })
  })
})
