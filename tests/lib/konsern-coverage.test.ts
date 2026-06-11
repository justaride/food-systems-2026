import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { computeQualityScore, type KonsernAuditInput } from '../../scripts/lib/konsern-coverage-scoring'
import {
  formatFinancialCoverageGaps,
  summarizeFinancialCoverage,
} from '../../scripts/lib/konsern-coverage-year'

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

describe('konsern financial coverage year selection', () => {
  it('counts complete 2024 financials when 2024 is the newest available year', () => {
    const coverage = summarizeFinancialCoverage(['child-a', 'child-b'], [
      { companyId: 'child-a', year: 2024 },
      { companyId: 'child-b', year: 2024 },
    ])

    assert.deepEqual(coverage, {
      measuredYear: 2024,
      childrenWithLatestFinancial: 2,
      childrenWithoutFinancial: 0,
      childrenWithOlderFinancial: 0,
    })
    assert.deepEqual(formatFinancialCoverageGaps(coverage), [])
  })

  it('distinguishes missing financials from older financials than the measured year', () => {
    const coverage = summarizeFinancialCoverage(['child-a', 'child-b', 'child-c'], [
      { companyId: 'child-a', year: 2024 },
      { companyId: 'child-b', year: 2023 },
    ])

    assert.deepEqual(coverage, {
      measuredYear: 2024,
      childrenWithLatestFinancial: 1,
      childrenWithoutFinancial: 1,
      childrenWithOlderFinancial: 1,
    })
    assert.deepEqual(formatFinancialCoverageGaps(coverage), [
      '1 datterselskap mangler regnskap helt (målt mot 2024)',
      '1 datterselskap har eldre regnskap enn målt år 2024',
    ])
  })

  it('uses the global measured year when the tree has no financial basis', () => {
    const coverage = summarizeFinancialCoverage(['child-a', 'child-b'], [], 2024)

    assert.deepEqual(coverage, {
      measuredYear: 2024,
      childrenWithLatestFinancial: 0,
      childrenWithoutFinancial: 2,
      childrenWithOlderFinancial: 0,
    })
    assert.deepEqual(formatFinancialCoverageGaps(coverage), [
      '2 datterselskap mangler regnskap helt (målt mot 2024)',
    ])
  })
})
