import { test } from 'node:test'
import assert from 'node:assert/strict'
import { financialSourceIssue } from '../../src/lib/financial-source-issues'

test('withholds only the identified historical discrepancy, without blocking a corrected source row', () => {
  const row = { year: 2023, source: 'Nofima Årsrapport 2023', revenueNok: '725', operatingResult: '-18' }
  assert.match(financialSourceIssue('989278835', row)!, /avviker/)
  assert.equal(financialSourceIssue('815664582', row), null)
  assert.equal(financialSourceIssue('989278835', { ...row, revenueNok: '721.311', operatingResult: '-5.928' }), null)
  assert.equal(financialSourceIssue('989278835', { ...row, year: 2024 }), null)
})

test('excludes identified Austevoll discrepancies while preserving corrected and unrelated records', () => {
  const historic2023 = { year: 2023, source: 'Austevoll Seafood Årsrapport 2023', revenueNok: '28900.00', operatingResult: null }
  const historic2024 = { year: 2024, source: 'Austevoll Seafood Årsrapport 2024', revenueNok: '30600.00', operatingResult: '4200000000.00' }
  for (const row of [historic2023, historic2024]) {
    assert.match(financialSourceIssue('929975200', row)!, /side 103/)
    assert.equal(financialSourceIssue('989278835', row), null)
    assert.equal(financialSourceIssue('929975200', { ...row, source: 'En annen regnskapskilde' }), null)
  }
  assert.equal(financialSourceIssue('929975200', { ...historic2023, revenueNok: '33731', operatingResult: '3438' }), null)
  assert.equal(financialSourceIssue('929975200', { ...historic2024, revenueNok: '35366', operatingResult: '5665' }), null)
})
