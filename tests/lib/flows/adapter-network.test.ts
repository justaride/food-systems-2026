import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toNetwork } from '../../../src/lib/flows/adapter'
import type { LoopFlows } from '../../../src/lib/flows/types'

const loops: LoopFlows[] = [
  {
    loopId: 'L1',
    nodes: [
      { id: 'a', type: 'category', label: 'Matavfall', valueChainStep: 'waste' },
      { id: 'b', type: 'actor', label: 'Nature Energy', ref: '/aktorer/nature-energy-shell' },
    ],
    edges: [
      { id: 'L1-e0', fromId: 'a', toId: 'b', material: 'matavfall', rLevel: 'R9', quantity: { value: 8100, unit: 'GWh/yr' }, evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
    ],
  },
]

describe('toNetwork', () => {
  it('maps loop nodes/edges to NetworkNode/NetworkEdge, namespaced by loopId, evidence-typed', () => {
    const { nodes, edges } = toNetwork(loops)
    assert.equal(nodes.length, 2)
    assert.deepEqual(nodes.map((n) => n.id), ['L1:a', 'L1:b'])
    assert.equal(nodes[1].href, '/aktorer/nature-energy-shell')
    assert.equal(nodes[0].valueChainStage, 'waste')
    assert.equal(edges.length, 1)
    assert.deepEqual({ source: edges[0].source, target: edges[0].target }, { source: 'L1:a', target: 'L1:b' })
    assert.equal(edges[0].type, 'estimated')
    assert.equal(edges[0].evidenceStatus, 'estimated')
    assert.equal(edges[0].estimatedValue, 8100)
    assert.match(edges[0].label ?? '', /matavfall/)
    assert.match(edges[0].label ?? '', /R9/)
    assert.equal(edges[0].sourceLabel, 'x')
  })
})
