import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeQualityScore, type KonsernAuditInput } from '../../scripts/lib/konsern-coverage-scoring'

const baseInput: KonsernAuditInput = {
  hasControllingOwner: false,
  ownershipEdgesWithSource: 0,
  ownershipEdgesTotal: 0,
  childrenWithLatestFinancial: 0,
  childrenTotal: 0,
  propertyCount: 0,
  relationshipCount: 0,
  daysSinceBrregRefresh: null,
  maEventCount: 0,
  expectsMaActivity: true,
}

describe('konsern quality score', () => {
  it('scores 0 when nothing is registered', () => {
    assert.equal(computeQualityScore(baseInput), 0)
  })
  it('scores 2 for controlling owner only', () => {
    assert.equal(computeQualityScore({ ...baseInput, hasControllingOwner: true }), 2)
  })
  it('full score 10 for complete data', () => {
    assert.equal(
      computeQualityScore({
        hasControllingOwner: true,
        ownershipEdgesWithSource: 5,
        ownershipEdgesTotal: 5,
        childrenWithLatestFinancial: 10,
        childrenTotal: 10,
        propertyCount: 3,
        relationshipCount: 4,
        daysSinceBrregRefresh: 30,
        maEventCount: 2,
        expectsMaActivity: true,
      }),
      10,
    )
  })
  it('gives +1 for ma-quiet konsern with no events', () => {
    const score = computeQualityScore({ ...baseInput, expectsMaActivity: false })
    assert.equal(score, 1)
  })
  it('no bonus for unregistered controlling owner', () => {
    assert.equal(
      computeQualityScore({ ...baseInput, hasControllingOwner: false, propertyCount: 1, relationshipCount: 1 }),
      2,
    )
  })
})
