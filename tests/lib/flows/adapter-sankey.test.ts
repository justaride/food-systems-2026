import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { toSankey, isSankeyConnected } from '../../../src/lib/flows/adapter'
import type { LoopFlows } from '../../../src/lib/flows/types'

const q = (v: number) => ({ value: v, unit: 't/yr' })

describe('toSankey', () => {
  it('includes only quantified edges and dedupes nodes by label', () => {
    const loops: LoopFlows[] = [
      { loopId: 'L', nodes: [
        { id: 'a', type: 'category', label: 'A' },
        { id: 'b', type: 'category', label: 'B' },
        { id: 'c', type: 'category', label: 'C' },
      ], edges: [
        { id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: q(10), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
        { id: 'e1', fromId: 'b', toId: 'c', material: 'B', evidenceStatus: 'illustrative', sourceRefs: [] },
      ] },
    ]
    const { nodes, links } = toSankey(loops)
    assert.deepEqual(nodes, [{ name: 'A' }, { name: 'B' }])
    assert.deepEqual(links, [{ source: 0, target: 1, value: 10 }])
  })

  it('drops a quantified edge that would create a cycle', () => {
    const loops: LoopFlows[] = [
      { loopId: 'L', nodes: [
        { id: 'a', type: 'category', label: 'A' },
        { id: 'b', type: 'category', label: 'B' },
      ], edges: [
        { id: 'e0', fromId: 'a', toId: 'b', material: 'A', quantity: q(5), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
        { id: 'e1', fromId: 'b', toId: 'a', material: 'B', quantity: q(5), evidenceStatus: 'estimated', sourceRefs: [{ label: 'x' }] },
      ] },
    ]
    const { links } = toSankey(loops)
    assert.deepEqual(links, [{ source: 0, target: 1, value: 5 }])
  })
})

describe('isSankeyConnected', () => {
  it('true for a connected chain', () => {
    assert.equal(isSankeyConnected({ nodes: [{ name: 'a' }, { name: 'b' }, { name: 'c' }], links: [{ source: 0, target: 1, value: 1 }, { source: 1, target: 2, value: 1 }] }), true)
  })
  it('false for two disjoint link-components', () => {
    assert.equal(isSankeyConnected({ nodes: [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }], links: [{ source: 0, target: 1, value: 1 }, { source: 2, target: 3, value: 1 }] }), false)
  })
  it('false for fewer than 2 links', () => {
    assert.equal(isSankeyConnected({ nodes: [{ name: 'a' }, { name: 'b' }], links: [{ source: 0, target: 1, value: 1 }] }), false)
  })
})
