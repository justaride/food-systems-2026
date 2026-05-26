import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { NetworkMap } from '../../src/components/network/NetworkMap'
import { SupplyChainGraph } from '../../src/components/charts/SupplyChainGraph'

describe('supply-chain graph component contract', () => {
  it('forwards external selection and relationship colors to the reusable network map', () => {
    const onNodeClick = () => {}
    const element = SupplyChainGraph({
      nodes: [
        { id: 'company-a', label: 'Supplier AS', type: 'processing' },
        { id: 'company-b', label: 'Buyer AS', type: 'retail' },
      ],
      edges: [
        { id: 'rel-1', source: 'company-a', target: 'company-b', type: 'supplier' },
      ],
      stageColors: { processing: '#ea580c', retail: '#e11d48' },
      relationshipColors: { supplier: '#16a34a' },
      selectedRelationshipId: 'rel-1',
      selectedNodeId: 'company-a',
      onNodeClick,
    }) as { type: unknown; props: Record<string, unknown> }

    assert.equal(element.type, NetworkMap)
    assert.equal(element.props.selectedEdgeId, 'rel-1')
    assert.equal(element.props.selectedNodeId, 'company-a')
    assert.equal(element.props.onNodeSelect, onNodeClick)
    assert.deepEqual(element.props.edgeColors, { supplier: '#16a34a' })
  })
})
