import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  describeCoverageCheck,
  describeFieldCitationTargetValidation,
  formatCoveragePct,
  getFieldCitationTargetTableEntries,
  isPersonProfileRoleFieldPath,
} from '../../src/lib/source-coverage-audit'

describe('source coverage audit helpers', () => {
  it('formats coverage percentages with empty-model handling', () => {
    assert.equal(formatCoveragePct(0, 0), 'n/a')
    assert.equal(formatCoveragePct(5, 20), '25.0%')
  })

  it('marks unavailable schema checks as not implemented without failing audit', () => {
    assert.deepEqual(describeCoverageCheck({
      model: 'BoardMember',
      total: 328,
      covered: 0,
      requirement: 'BoardMember with SourceCitation coverage',
      implemented: false,
      blocker: 'FieldCitation table missing',
    }), {
      model: 'BoardMember',
      total: 328,
      covered: 0,
      coveragePct: 'ikke implementert',
      severity: 'not_implemented',
      message: 'BoardMember with SourceCitation coverage: ikke implementert (FieldCitation table missing)',
    })
  })

  it('classifies implemented coverage gaps as warnings', () => {
    assert.deepEqual(describeCoverageCheck({
      model: 'CompanyFinancial',
      total: 10,
      covered: 7,
      requirement: 'CompanyFinancial with source coverage',
      implemented: true,
    }), {
      model: 'CompanyFinancial',
      total: 10,
      covered: 7,
      coveragePct: '70.0%',
      severity: 'warning',
      message: 'CompanyFinancial with source coverage: 7/10 (70.0%)',
    })
  })

  it('keeps FieldCitation target validation explicit before migration exists', () => {
    assert.deepEqual(describeFieldCitationTargetValidation(false), {
      severity: 'not_implemented',
      message: 'FieldCitation target validation: ikke implementert (FieldCitation table missing)',
    })
  })

  it('includes document-level citations in the FieldCitation target map', () => {
    assert.ok(getFieldCitationTargetTableEntries().some(([entityType, tableName]) => (
      entityType === 'Document' && tableName === 'Document'
    )))
  })

  it('identifies role-level PersonProfile field paths', () => {
    assert.equal(
      isPersonProfileRoleFieldPath('roles[companyId=company-ng;roleKey=CEO;fromYear=2016;toYear=null]'),
      true,
    )
    assert.equal(isPersonProfileRoleFieldPath('roles'), false)
    assert.equal(isPersonProfileRoleFieldPath('biography'), false)
    assert.equal(isPersonProfileRoleFieldPath(null), false)
  })
})
