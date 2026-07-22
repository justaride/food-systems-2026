import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { evidenceGrammar, getEvidenceGrammarToken } from '../../src/lib/visualization/evidence-grammar'
import { evidenceStatusOrder, getEvidenceStatusConfig } from '../../src/lib/visualization/status'

describe('visual evidence grammar', () => {
  it('covers the canonical evidence statuses without creating a parallel vocabulary', () => {
    assert.deepEqual(evidenceGrammar.map(token => token.status), evidenceStatusOrder)
    assert.equal(evidenceGrammar.length, 4)

    for (const token of evidenceGrammar) {
      assert.equal(token.label, getEvidenceStatusConfig(token.status).label)
      assert.ok(token.description.length > 0)
      assert.ok(token.lineClassName.startsWith('evidence-line--'))
    }
  })

  it('uses a distinct non-colour line pattern for every evidence status', () => {
    const patterns = evidenceGrammar.map(token => token.pattern)
    assert.equal(new Set(patterns).size, evidenceGrammar.length)
    assert.equal(getEvidenceGrammarToken('observed').pattern, 'solid')
    assert.equal(getEvidenceGrammarToken('estimated').pattern, 'dashed')
    assert.equal(getEvidenceGrammarToken('proxy').pattern, 'dotted')
    assert.equal(getEvidenceGrammarToken('illustrative').pattern, 'long-dashed')
  })

  it('does not infer external validation from observed data', () => {
    const observed = getEvidenceGrammarToken('observed')
    assert.doesNotMatch(`${observed.label} ${observed.description}`, /validert eksternt/i)
  })
})
