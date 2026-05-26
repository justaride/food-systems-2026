import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSupplyChainNetwork } from '../../src/lib/supply-chain-network'

describe('supply-chain network adapter', () => {
  it('maps relationships to network edges with source, confidence, href and evidence status', () => {
    const graph = buildSupplyChainNetwork({
      relationships: [
        {
          id: 'rel-1',
          fromCompanyId: 'company-a',
          toCompanyId: 'company-b',
          relationshipType: 'supplier',
          description: 'Supplies fruit',
          sector: 'fruit',
          estimatedValue: 12,
          source: 'official registry',
          metadata: { confidence: 0.8 },
          verificationStatus: 'validated',
          fromCompany: { id: 'company-a', name: 'Supplier AS', valueChainStage: 'processing', country: 'NO' },
          toCompany: { id: 'company-b', name: 'Buyer AS', valueChainStage: 'retail', country: 'NO' },
        },
      ],
      companyDocumentRefs: [],
    })

    assert.equal(graph.nodes.length, 2)
    assert.equal(graph.edges.length, 1)
    assert.deepEqual(graph.stats.byType, { supplier: 1 })

    const edge = graph.edges[0]
    assert.equal(edge.id, 'rel-1')
    assert.equal(edge.type, 'supplier')
    assert.equal(edge.relationshipType, 'supplier')
    assert.equal(edge.label, 'Leverandor')
    assert.equal(edge.href, '/forsyningskjede?relationship=rel-1')
    assert.equal(edge.confidence, 0.8)
    assert.equal(edge.sourceLabel, 'official registry')
    assert.equal(edge.evidenceStatus, 'validated')
  })

  it('adds document evidence nodes without counting them as companies involved', () => {
    const graph = buildSupplyChainNetwork({
      relationships: [
        {
          id: 'rel-1',
          fromCompanyId: 'company-a',
          toCompanyId: 'company-b',
          relationshipType: 'buyer',
          description: null,
          sector: null,
          estimatedValue: null,
          source: 'annual report',
          metadata: null,
          verificationStatus: 'needs_primary_check',
          fromCompany: { id: 'company-a', name: 'Supplier AS', valueChainStage: 'processing', country: 'NO' },
          toCompany: { id: 'company-b', name: 'Buyer AS', valueChainStage: 'retail', country: 'NO' },
        },
      ],
      companyDocumentRefs: [
        {
          companyId: 'company-a',
          context: 'annual-report',
          document: {
            id: 'doc-1',
            slug: 'supplier-report',
            title: 'Supplier annual report',
            tags: ['food-tg'],
            category: 'report',
          },
        },
      ],
    })

    assert.equal(graph.stats.companiesInvolved, 2)
    assert.equal(graph.nodes.some(node => node.id === 'document:doc-1' && node.type === 'document'), true)
    assert.equal(graph.edges.some(edge => edge.source === 'document:doc-1' && edge.target === 'company-a'), true)
    assert.equal(graph.stats.byType['company-ref'], 1)
  })
})
