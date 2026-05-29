import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getNetworkMapView,
  getNetworkPresetTypeSets,
  networkEdgeKey,
  resolveNetworkEdgeSelection,
  type NetworkEdge,
  type NetworkNode,
  type NetworkPreset,
} from '../../src/lib/network-map'

const nodes: NetworkNode[] = [
  { id: 'company-a', label: 'NorgesGruppen', type: 'company', tags: ['food-tg'], href: '/selskap/company-a' },
  { id: 'company-b', label: 'Bama', type: 'company', href: '/selskap/company-b' },
  { id: 'document-a', label: 'Food TG mandate', type: 'document', tags: ['mandat'], href: '/bibliotek/mandate' },
  { id: 'source-a', label: 'Annual report', type: 'source' },
  { id: 'isolated', label: 'Isolated company', type: 'company' },
  { id: 'search-only', label: 'Needle result', type: 'company' },
]

const edges: NetworkEdge[] = [
  { source: 'company-a', target: 'company-b', type: 'supplier', confidence: 0.95 },
  { source: 'document-a', target: 'company-a', type: 'company-ref' },
  { source: 'missing-node', target: 'company-a', type: 'broken' },
  { source: 'source-a', target: 'document-a', type: 'source-file' },
  { source: 'search-only', target: 'company-b', type: 'supplier' },
]

describe('network map view model', () => {
  it('filters dangling edges and hides isolated nodes by default', () => {
    const view = getNetworkMapView({
      nodes,
      edges,
      activeNodeTypes: new Set(['company', 'document', 'source']),
      activeEdgeTypes: new Set(['supplier', 'company-ref', 'source-file', 'broken']),
      showIsolated: false,
    })

    assert.deepEqual(view.nodes.map(node => node.id).sort(), [
      'company-a',
      'company-b',
      'document-a',
      'search-only',
      'source-a',
    ])
    assert.equal(view.edges.some(edge => edge.type === 'broken'), false)
    assert.equal(view.hiddenIsolatedCount, 1)
  })

  it('applies preset match rules and expands to direct neighbors', () => {
    const preset: NetworkPreset = {
      id: 'food-tg',
      label: 'Food TG',
      nodeTypes: ['company', 'document', 'source'],
      edgeTypes: ['supplier', 'company-ref', 'source-file'],
      showIsolated: false,
      matchRules: [{ field: 'tag', mode: 'exact', values: ['food-tg'] }],
      includeMatchedNeighbors: true,
    }

    const view = getNetworkMapView({
      nodes,
      edges,
      preset,
      activeNodeTypes: new Set(['company', 'document', 'source']),
      activeEdgeTypes: new Set(['supplier', 'company-ref', 'source-file']),
      showIsolated: false,
    })

    assert.deepEqual(view.nodes.map(node => node.id).sort(), [
      'company-a',
      'company-b',
      'document-a',
    ])
    assert.deepEqual(view.edges.map(edge => edge.type).sort(), ['company-ref', 'supplier'])
  })

  it('keeps selected and search result nodes when limiting dense graphs', () => {
    const view = getNetworkMapView({
      nodes,
      edges,
      activeNodeTypes: new Set(['company', 'document', 'source']),
      activeEdgeTypes: new Set(['supplier', 'company-ref', 'source-file']),
      showIsolated: true,
      selectedNodeId: 'source-a',
      search: 'needle',
      maxNodes: 3,
    })

    assert.equal(view.nodes.some(node => node.id === 'source-a'), true)
    assert.equal(view.nodes.some(node => node.id === 'search-only'), true)
    assert.equal(view.limitedFromCount, 6)
    assert.equal(view.nodes.length, 3)
  })

  it('resolves external edge ids to the rendered edge selection key', () => {
    assert.equal(resolveNetworkEdgeSelection(edges, 'company-a-company-b-supplier-0'), 'company-a-company-b-supplier-0')

    const identifiedEdges: NetworkEdge[] = [
      { id: 'rel-1', source: 'company-a', target: 'company-b', type: 'supplier' },
      { source: 'document-a', target: 'company-a', type: 'company-ref' },
    ]

    assert.equal(networkEdgeKey(identifiedEdges[0], 0), 'rel-1')
    assert.equal(networkEdgeKey(identifiedEdges[1], 1), 'document-a-company-a-company-ref-1')
    assert.equal(resolveNetworkEdgeSelection(identifiedEdges, 'rel-1'), 'rel-1')
    assert.equal(resolveNetworkEdgeSelection(identifiedEdges, 'document-a-company-a-company-ref-1'), 'document-a-company-a-company-ref-1')
    assert.equal(resolveNetworkEdgeSelection(identifiedEdges, 'missing-rel'), null)
  })

  it('resets missing preset type lists to all available node and edge types', () => {
    const preset: NetworkPreset = {
      id: 'all',
      label: 'All',
      showIsolated: true,
    }

    const resolved = getNetworkPresetTypeSets({
      preset,
      allNodeTypes: ['company', 'document'],
      allEdgeTypes: ['supplier', 'company-ref'],
    })

    assert.deepEqual([...resolved.nodeTypes].sort(), ['company', 'document'])
    assert.deepEqual([...resolved.edgeTypes].sort(), ['company-ref', 'supplier'])
  })
})
