import assert from 'node:assert/strict'
import { test } from 'node:test'
import { compareCompanyAttachments } from '../../src/lib/company-reconciliation'
test('same year never hides amount, source or unit conflicts, and a different role is retained', () => {
  const financial = { year: 2024, revenueNok: '579', operatingResult: '23', source: 'legacy', unitScale: 1000000, amountCurrency: 'NOK' }
  const legacy = { financials: [financial, { ...financial, year: 2023 }], boardMembers: [{ personKey: 'a', personName: 'A', role: 'chair' }], documentRefs: [] }
  const result = compareCompanyAttachments(legacy, { financials: [{ ...financial, unitScale: 1 }], boardMembers: [{ personKey: 'a', personName: 'A', role: 'member' }], documentRefs: [] })
  assert.equal(result.conflictYears, 1); assert.equal(result.uniqueFinancialYears, 1); assert.equal(result.uniqueBoardRoles.length, 1)
  assert.equal(legacy.financials[0].unitScale, 1000000)
})
