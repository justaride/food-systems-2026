import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deriveGraphPreset } from '../../../src/lib/graph/preset'
import type { GraphNode, GraphEdge } from '../../../src/lib/queries/graph'

const n = (id: string, type: GraphNode['type']): GraphNode => ({ id, label: id, type })
const e = (source: string, target: string, type = 'rel', confidence?: number): GraphEdge =>
  confidence === undefined ? { source, target, type } : { source, target, type, confidence }

describe('deriveGraphPreset', () => {
  it('sentrale: keeps the top-N nodes by degree and edges between them', () => {
    const nodes = ['A', 'B', 'C', 'D', 'E'].map((id) => n(id, 'company'))
    const edges = [e('A', 'B'), e('A', 'C'), e('A', 'D'), e('A', 'E'), e('B', 'C'), e('B', 'D')]
    const out = deriveGraphPreset(nodes, edges, 'sentrale', 2)
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['A', 'B'])
    assert.deepEqual(out.edges, [e('A', 'B')])
  })

  it('eierskap: keeps company/person/property subgraph, drops actor', () => {
    const nodes = [n('c1', 'company'), n('p1', 'person'), n('a1', 'actor'), n('pr1', 'property')]
    const edges = [e('p1', 'c1', 'person-role'), e('a1', 'c1', 'company-link'), e('c1', 'pr1', 'owns-property')]
    const out = deriveGraphPreset(nodes, edges, 'eierskap')
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['c1', 'p1', 'pr1'])
    assert.equal(out.edges.some((x) => x.source === 'a1' || x.target === 'a1'), false)
  })

  it('forsyning: keeps company/actor subgraph, drops person/property', () => {
    const nodes = [n('c1', 'company'), n('p1', 'person'), n('a1', 'actor'), n('pr1', 'property')]
    const edges = [e('p1', 'c1', 'person-role'), e('a1', 'c1', 'company-link'), e('c1', 'pr1', 'owns-property')]
    const out = deriveGraphPreset(nodes, edges, 'forsyning')
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['a1', 'c1'])
    assert.deepEqual(out.edges, [e('a1', 'c1', 'company-link')])
  })

  it('evidensgap: keeps edges with low or unknown confidence + their endpoints', () => {
    const nodes = ['A', 'B', 'C', 'D'].map((id) => n(id, 'company'))
    const edges = [e('A', 'B', 'rel', 0.9), e('B', 'C', 'rel', 0.3), e('C', 'D', 'rel')]
    const out = deriveGraphPreset(nodes, edges, 'evidensgap')
    assert.deepEqual(out.edges.map((x) => `${x.source}-${x.target}`), ['B-C', 'C-D'])
    assert.deepEqual(out.nodes.map((x) => x.id).sort(), ['B', 'C', 'D'])
  })

  it('unknown preset returns the input unchanged', () => {
    const nodes = [n('A', 'company')]
    const edges = [e('A', 'A')]
    const out = deriveGraphPreset(nodes, edges, 'foo' as never)
    assert.deepEqual(out, { nodes, edges })
  })
})
