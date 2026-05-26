import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  inferGraphConfidence,
  isBlockedExternalGraphSource,
  structuralGraphConfidence,
} from '../../src/lib/graph-confidence'

describe('graph confidence helpers', () => {
  it('infers explicit metadata confidence before source labels', () => {
    assert.deepEqual(inferGraphConfidence({ confidence: 0.82 }, 'heuristic estimate'), {
      confidence: 0.82,
      sourceLabel: 'heuristic estimate',
    })
  })

  it('keeps unsupported confidence metadata out of the graph', () => {
    assert.deepEqual(inferGraphConfidence({ confidence: 2 }, 'official registry'), {
      confidence: 0.95,
      sourceLabel: 'official registry',
    })
  })

  it('recognizes Norwegian source labels used by the graph data', () => {
    assert.deepEqual(inferGraphConfidence(null, 'Brønnøysund underenheter'), {
      confidence: 0.95,
      sourceLabel: 'Brønnøysund underenheter',
    })
    assert.deepEqual(inferGraphConfidence(null, 'Matsentralen Årsrapport 2024'), {
      confidence: 0.7,
      sourceLabel: 'Matsentralen Årsrapport 2024',
    })
  })

  it('uses conservative confidence for sourced but uncategorized graph labels', () => {
    assert.deepEqual(inferGraphConfidence(null, 'TGTG Partnerliste 2024'), {
      confidence: 0.6,
      sourceLabel: 'TGTG Partnerliste 2024',
    })
  })

  it('blocks known internal unsourced graph labels from public graph edges', () => {
    assert.equal(isBlockedExternalGraphSource('source:blocked-unsourced/company-financial-estimate'), true)
    assert.equal(isBlockedExternalGraphSource('legacy_unsourced annual report label'), true)
    assert.equal(isBlockedExternalGraphSource('official registry'), false)
  })

  it('marks deterministic graph links without treating them as external proof', () => {
    assert.deepEqual(structuralGraphConfidence('company-ref'), {
      confidence: 0.9,
      sourceLabel: 'kurert dokumentkobling',
    })
    assert.deepEqual(structuralGraphConfidence('person-role'), {
      confidence: 0.7,
      sourceLabel: 'personprofil-rolle',
    })
    assert.deepEqual(structuralGraphConfidence('unknown-relation'), {})
  })
})
