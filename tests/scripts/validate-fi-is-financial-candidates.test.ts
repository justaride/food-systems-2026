import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  classifyCompanyCandidate,
  inspectCompanyFinancialModel,
  parseCandidateCsv,
  validateFiIsFinancialCandidates,
  type FinancialCandidateRow,
} from '../../scripts/validate-fi-is-financial-candidates'

const CSV_PATH =
  'research/_plans/gap-program-2026-07-21/data/nordisk-finanser-2025-kandidater.csv'
const SCRIPT_PATH = 'scripts/validate-fi-is-financial-candidates.ts'
const csvText = readFileSync(CSV_PATH, 'utf8')
const schemaText = readFileSync('prisma/schema.prisma', 'utf8')

function issueCodes(report: { issues: Array<{ code: string }> }): string[] {
  return report.issues.map((candidate) => candidate.code)
}

describe('validate-fi-is-financial-candidates', () => {
  it('reads the exact 15 numeric cells and one open Samkaup row fail-closed', () => {
    const report = validateFiIsFinancialCandidates(csvText, schemaText)

    assert.deepEqual(report.actual, {
      totalRows: 16,
      numericCells: 15,
      openRows: 1,
      companyGroups: 6,
    })
    assert.deepEqual(report.datasetIssues, [])
    assert.equal(report.readOnly, true)
    assert.equal(report.failClosed, true)
    assert.equal(report.canApply, false)
  })

  it('classifies every current company and exposes all required semantic blockers', () => {
    const report = validateFiIsFinancialCandidates(csvText, schemaText)
    const companies = new Map(report.companies.map((company) => [company.orgnr, company]))

    const kesko = companies.get('FI-0110456-8')!
    assert.equal(kesko.classification, 'model_decision_required')
    assert.ok(issueCodes(kesko).includes('duplicate_company_year_scope'))
    assert.ok(issueCodes(kesko).includes('kesko_group_grocery_scope_collision'))
    assert.ok(issueCodes(kesko).includes('company_financial_field_collision'))

    const sGroup = companies.get('FI-0116323-9')!
    assert.equal(sGroup.classification, 'model_decision_required')
    assert.ok(issueCodes(sGroup).includes('s_group_scope_semantics'))
    assert.ok(issueCodes(sGroup).includes('company_financial_field_collision'))

    const lidl = companies.get('FI-1615492-7')!
    assert.equal(lidl.classification, 'model_decision_required')
    assert.ok(issueCodes(lidl).includes('lidl_fiscal_2024_not_2025'))
    assert.ok(issueCodes(lidl).includes('incomplete_fiscal_period'))

    const hagar = companies.get('IS-670203-2120')!
    assert.equal(hagar.classification, 'model_decision_required')
    assert.ok(issueCodes(hagar).includes('fiscal_year_not_integer'))
    assert.ok(issueCodes(hagar).includes('period_fx_required'))
    assert.ok(issueCodes(hagar).includes('net_profit_not_supported'))

    const festi = companies.get('IS-540206-2010')!
    assert.equal(festi.classification, 'model_decision_required')
    assert.ok(issueCodes(festi).includes('festi_2025_isk_fx_required'))
    assert.ok(issueCodes(festi).includes('calendar_year_fx_required'))
    assert.ok(issueCodes(festi).includes('net_profit_not_supported'))

    const samkaup = companies.get('IS-571298-3769')!
    assert.equal(samkaup.classification, 'source_gap')
    assert.ok(issueCodes(samkaup).includes('open_source_gap'))
  })

  it('checks required locators and access dates for numeric candidates', () => {
    const parsed = parseCandidateCsv(csvText)
    const model = inspectCompanyFinancialModel(schemaText)
    const rows = parsed.rows
      .filter((row) => row.orgnr === 'FI-0110456-8')
      .map((row, index) =>
        index === 0 ? { ...row, source_url: '', accessed_at: '2026-02-30' } : row,
      )
    const validation = classifyCompanyCandidate(rows, model)

    assert.equal(validation.classification, 'source_gap')
    assert.ok(issueCodes(validation).includes('missing_source_locator'))
    assert.ok(issueCodes(validation).includes('invalid_access_date'))
  })

  it('fails the dataset contract if any one of the 15 numeric cells disappears', () => {
    const lines = csvText.trimEnd().split('\n')
    const withoutFestiProfit = lines.filter(
      (line, index) => index === 0 || !line.startsWith('Festi hf,IS-540206-2010,IS,retail,profit,'),
    )
    const report = validateFiIsFinancialCandidates(`${withoutFestiProfit.join('\n')}\n`, schemaText)

    assert.equal(report.actual.numericCells, 14)
    assert.ok(issueCodes({ issues: report.datasetIssues }).includes('numeric_cell_count_mismatch'))
    assert.equal(report.canApply, false)
  })

  it('matches the current CompanyFinancial schema and detects uniqueness drift', () => {
    const model = inspectCompanyFinancialModel(schemaText)
    assert.equal(model.found, true)
    assert.equal(model.yearIsInt, true)
    assert.equal(model.uniqueCompanyYear, true)
    assert.equal(model.hasScopeField, false)
    assert.equal(model.hasNetProfitField, false)
    assert.deepEqual(model.missingRequiredFields, [])

    const driftedSchema = schemaText.replace('@@unique([companyId, year])', '')
    const drifted = validateFiIsFinancialCandidates(csvText, driftedSchema)
    assert.ok(issueCodes({ issues: drifted.datasetIssues }).includes('company_financial_contract_mismatch'))
    assert.equal(drifted.canApply, false)
  })

  it('can return apply_ready only for an unambiguous, sourced, FX-complete company-year', () => {
    const base: FinancialCandidateRow = {
      rowNumber: 2,
      company: 'Example Oyj',
      orgnr: 'FI-0000000-0',
      country: 'FI',
      valueChainStage: 'retail',
      metric: 'revenue',
      value: '100',
      unit: 'EUR_million',
      fiscal_year: '2025',
      fiscal_year_note: 'kalenderår',
      source_publisher: 'Example Oyj',
      source_title: 'Annual report 2025',
      source_url: 'https://example.test/annual-report-2025',
      accessed_at: '2026-07-21',
      provenance_type: 'external_report',
      claim_status: 'candidate_unlocked',
      note: 'Group revenue',
      fiscal_period_start: '',
      fiscal_period_end: '',
      fx_rate_nok_per_unit: '11.5',
      fx_rate_source: 'Norges Bank 2025 calendar-year average',
      financial_scope: '',
    }
    const rows: FinancialCandidateRow[] = [
      base,
      {
        ...base,
        rowNumber: 3,
        metric: 'operating_profit',
        value: '5',
        note: 'Group operating profit',
      },
    ]
    const validation = classifyCompanyCandidate(rows, inspectCompanyFinancialModel(schemaText))

    assert.equal(validation.classification, 'apply_ready')
    assert.deepEqual(validation.compatibleTargetFields, ['revenueNok', 'operatingResult'])
    assert.deepEqual(validation.issues, [])
  })

  it('contains no filesystem or database write primitives', () => {
    const source = readFileSync(SCRIPT_PATH, 'utf8')
    assert.doesNotMatch(
      source,
      /\b(?:writeFileSync|appendFileSync|mkdirSync|rmSync|unlinkSync|renameSync|PrismaClient)\b|\.(?:upsert|create|update|delete)\s*\(/,
    )
  })
})
