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
