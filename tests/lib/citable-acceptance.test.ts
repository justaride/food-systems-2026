import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  ACCEPTANCE_TESTS,
  buildCitableAcceptancePack,
} from '../../src/lib/citations/citable-acceptance'
import { isExternallyCitable } from '../../src/lib/citations/citation-status'

describe('citable acceptance pack', () => {
  it('covers the required acceptance question categories', () => {
    assert.ok(ACCEPTANCE_TESTS.length >= 12)

    const counts = new Map<string, number>()
    for (const test of ACCEPTANCE_TESTS) {
      counts.set(test.category, (counts.get(test.category) ?? 0) + 1)
    }

    assert.ok((counts.get('nordic_circularity') ?? 0) >= 3)
    assert.ok((counts.get('market_concentration') ?? 0) >= 2)
    assert.ok((counts.get('food_waste') ?? 0) >= 2)
    assert.ok((counts.get('ownership_company') ?? 0) >= 2)
    assert.ok((counts.get('public_subsidies') ?? 0) >= 1)
    assert.ok((counts.get('library_sources') ?? 0) >= 1)
    assert.ok((counts.get('graph_relationships') ?? 0) >= 1)
  })

  it('defines source expectations and field allow/deny rules for every question', () => {
    for (const test of ACCEPTANCE_TESTS) {
      assert.ok(test.question)
      assert.ok(test.expectedSourceType)
      assert.ok(test.requiredReadinessLevel)
      assert.ok(test.mustUse.length > 0)
      assert.ok(test.mustNotUse.length > 0)
      assert.ok(test.knownCaveat)
    }
  })

  it('marks each answer cite-ready or blocked with explicit evidence handling', () => {
    const pack = buildCitableAcceptancePack()

    assert.equal(pack.summary.total, ACCEPTANCE_TESTS.length)
    assert.equal(pack.results.length, ACCEPTANCE_TESTS.length)

    for (const result of pack.results) {
      assert.ok(result.status === 'cite_ready' || result.status === 'blocked')

      if (result.status === 'cite_ready') {
        assert.ok(result.citations.length > 0)
        assert.ok(result.citations.every(citation => isExternallyCitable(citation.readiness)))
      } else {
        assert.ok(result.exclusionNotes.length > 0)
      }
    }
  })
})
