import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { summarizeKonsernFinancialCoverage } from '../../scripts/lib/konsern-coverage-year'

describe('konsern financial coverage year summary', () => {
  it('counts current and early next-year child rows as recent without staling peers', () => {
    const summary = summarizeKonsernFinancialCoverage(
      ['a', 'b', 'c'],
      [
        { companyId: 'a', year: 2025 },
        { companyId: 'b', year: 2024 },
      ],
      2026,
    )

    assert.deepEqual(summary, {
      measuredYear: 2025,
      recencyThreshold: 2024,
      childrenWithLatestFinancial: 2,
      childrenWithOlderFinancial: 0,
      childrenWithoutFinancial: 1,
    })
  })

  it('separates stale financial rows from missing financial rows', () => {
    const summary = summarizeKonsernFinancialCoverage(
      ['a', 'b', 'c'],
      [
        { companyId: 'a', year: 2023 },
        { companyId: 'b', year: 2022 },
        { companyId: 'b', year: 2024 },
      ],
      2026,
    )

    assert.deepEqual(summary, {
      measuredYear: 2024,
      recencyThreshold: 2024,
      childrenWithLatestFinancial: 1,
      childrenWithOlderFinancial: 1,
      childrenWithoutFinancial: 1,
    })
  })

  it('uses the previous year as informational measuredYear when no child financials exist', () => {
    const summary = summarizeKonsernFinancialCoverage(['a', 'b'], [], 2026)

    assert.deepEqual(summary, {
      measuredYear: 2025,
      recencyThreshold: 2024,
      childrenWithLatestFinancial: 0,
      childrenWithOlderFinancial: 0,
      childrenWithoutFinancial: 2,
    })
  })
})
