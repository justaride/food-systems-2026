import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { parseCsvRows } from '../src/lib/csv'

export const FI_IS_FINANCIAL_CANDIDATES_PATH =
  'research/_plans/gap-program-2026-07-21/data/nordisk-finanser-2025-kandidater.csv'
export const PRISMA_SCHEMA_PATH = 'prisma/schema.prisma'

const EXPECTED_NUMERIC_CELLS = 15
const EXPECTED_OPEN_ROWS = 1
const EXPECTED_COMPANY_GROUPS = 6

const REQUIRED_COLUMNS = [
  'company',
  'orgnr',
  'country',
  'valueChainStage',
  'metric',
  'value',
  'unit',
  'fiscal_year',
  'fiscal_year_note',
  'source_publisher',
  'source_title',
  'source_url',
  'accessed_at',
  'provenance_type',
  'claim_status',
  'note',
] as const

const COMPANY_FINANCIAL_REQUIRED_FIELDS = [
  'companyId',
  'year',
  'revenueNok',
  'operatingResult',
  'operatingMargin',
  'ebitda',
  'source',
  'fiscalYearLabel',
  'fiscalPeriodStart',
  'fiscalPeriodEnd',
  'reportingCurrency',
  'fxRateNokPerUnit',
  'fxRateSource',
  'verificationStatus',
  'verifiedAt',
] as const

const REVENUE_METRICS = new Set(['net_sales', 'revenue', 'retail_sales', 'grocery_sales'])
const OPERATING_RESULT_METRICS = new Set([
  'operating_profit',
  'operating_result',
  'comparable_operating_profit',
])

export type CandidateClassification = 'apply_ready' | 'model_decision_required' | 'source_gap'
export type ValidationIssueKind = 'model_decision' | 'source_gap'

export type ValidationIssue = {
  code: string
  kind: ValidationIssueKind
  message: string
  rowNumbers: number[]
}

export type FinancialCandidateRow = {
  rowNumber: number
  company: string
  orgnr: string
  country: string
  valueChainStage: string
  metric: string
  value: string
  unit: string
  fiscal_year: string
  fiscal_year_note: string
  source_publisher: string
  source_title: string
  source_url: string
  accessed_at: string
  provenance_type: string
  claim_status: string
  note: string
  fiscal_period_start: string
  fiscal_period_end: string
  fx_rate_nok_per_unit: string
  fx_rate_source: string
  financial_scope: string
}

export type CandidateParseResult = {
  header: string[]
  rows: FinancialCandidateRow[]
  issues: ValidationIssue[]
}

export type CompanyFinancialModelCapabilities = {
  found: boolean
  fields: string[]
  missingRequiredFields: string[]
  yearIsInt: boolean
  uniqueCompanyYear: boolean
  hasScopeField: boolean
  hasNetProfitField: boolean
}

export type CompanyCandidateValidation = {
  orgnr: string
  companies: string[]
  fiscalYears: string[]
  numericCells: number
  openRows: number
  classification: CandidateClassification
  compatibleTargetFields: string[]
  issues: ValidationIssue[]
}

export type FiIsFinancialCandidateReport = {
  readOnly: true
  failClosed: true
  expected: {
    numericCells: number
    openRows: number
    companyGroups: number
  }
  actual: {
    totalRows: number
    numericCells: number
    openRows: number
    companyGroups: number
  }
  companyFinancialModel: CompanyFinancialModelCapabilities
  datasetIssues: ValidationIssue[]
  companies: CompanyCandidateValidation[]
  canApply: boolean
}

function addIssue(issues: ValidationIssue[], issue: ValidationIssue): void {
  const existing = issues.find(
    (candidate) =>
      candidate.code === issue.code &&
      candidate.kind === issue.kind &&
      candidate.message === issue.message,
  )
  if (!existing) {
    issues.push({ ...issue, rowNumbers: [...new Set(issue.rowNumbers)].sort((a, b) => a - b) })
    return
  }
  existing.rowNumbers = [...new Set([...existing.rowNumbers, ...issue.rowNumbers])].sort((a, b) => a - b)
}

function issue(
  code: string,
  kind: ValidationIssueKind,
  message: string,
  rowNumbers: number[] = [],
): ValidationIssue {
  return { code, kind, message, rowNumbers }
}

function candidateRowFromRecord(record: Record<string, string>, rowNumber: number): FinancialCandidateRow {
  const value = (key: string) => record[key]?.trim() ?? ''
  return {
    rowNumber,
    company: value('company'),
    orgnr: value('orgnr'),
    country: value('country'),
    valueChainStage: value('valueChainStage'),
    metric: value('metric'),
    value: value('value'),
    unit: value('unit'),
    fiscal_year: value('fiscal_year'),
    fiscal_year_note: value('fiscal_year_note'),
    source_publisher: value('source_publisher'),
    source_title: value('source_title'),
    source_url: value('source_url'),
    accessed_at: value('accessed_at'),
    provenance_type: value('provenance_type'),
    claim_status: value('claim_status'),
    note: value('note'),
    fiscal_period_start: value('fiscal_period_start'),
    fiscal_period_end: value('fiscal_period_end'),
    fx_rate_nok_per_unit: value('fx_rate_nok_per_unit'),
    fx_rate_source: value('fx_rate_source'),
    financial_scope: value('financial_scope'),
  }
}

export function parseCandidateCsv(csvText: string): CandidateParseResult {
  const matrix = parseCsvRows(csvText)
  const rawHeader = matrix[0] ?? []
  const header = rawHeader.map((column) => column.trim())
  const issues: ValidationIssue[] = []

  if (header.length === 0) {
    addIssue(issues, issue('missing_header', 'source_gap', 'Candidate CSV has no header row.'))
    return { header, rows: [], issues }
  }

  const duplicateColumns = [...new Set(header.filter((column, index) => header.indexOf(column) !== index))]
  if (duplicateColumns.length > 0) {
    addIssue(
      issues,
      issue(
        'duplicate_header_columns',
        'source_gap',
        `Candidate CSV repeats header columns: ${duplicateColumns.join(', ')}.`,
        [1],
      ),
    )
  }

  const missingColumns = REQUIRED_COLUMNS.filter((column) => !header.includes(column))
  if (missingColumns.length > 0) {
    addIssue(
      issues,
      issue(
        'missing_required_columns',
        'source_gap',
        `Candidate CSV is missing required columns: ${missingColumns.join(', ')}.`,
        [1],
      ),
    )
  }

  const rows = matrix.slice(1).map((values, index) => {
    const rowNumber = index + 2
    if (values.length !== header.length) {
      addIssue(
        issues,
        issue(
          'row_width_mismatch',
          'source_gap',
          `Row ${rowNumber} has ${values.length} cells; expected ${header.length}.`,
          [rowNumber],
        ),
      )
    }
    const record = Object.fromEntries(header.map((column, columnIndex) => [column, values[columnIndex] ?? '']))
    return candidateRowFromRecord(record, rowNumber)
  })

  return { header, rows, issues }
}

export function inspectCompanyFinancialModel(schemaText: string): CompanyFinancialModelCapabilities {
  const match = schemaText.match(/model\s+CompanyFinancial\s*\{([\s\S]*?)\n\}/)
  if (!match) {
    return {
      found: false,
      fields: [],
      missingRequiredFields: [...COMPANY_FINANCIAL_REQUIRED_FIELDS],
      yearIsInt: false,
      uniqueCompanyYear: false,
      hasScopeField: false,
      hasNetProfitField: false,
    }
  }

  const body = match[1]
  const fields = body
    .split('\n')
    .map((line) => line.trim().match(/^(\w+)\s+([^\s]+)/))
    .filter((field): field is RegExpMatchArray => field !== null)
  const fieldTypes = new Map(fields.map((field) => [field[1], field[2]]))
  const fieldNames = [...fieldTypes.keys()]

  return {
    found: true,
    fields: fieldNames,
    missingRequiredFields: COMPANY_FINANCIAL_REQUIRED_FIELDS.filter((field) => !fieldTypes.has(field)),
    yearIsInt: fieldTypes.get('year') === 'Int',
    uniqueCompanyYear: /@@unique\(\[\s*companyId\s*,\s*year\s*\]\)/.test(body),
    hasScopeField: ['scope', 'financialScope', 'segment', 'segmentScope'].some((field) => fieldTypes.has(field)),
    hasNetProfitField: ['profit', 'netProfit', 'netIncome', 'netResult'].some((field) => fieldTypes.has(field)),
  }
}

export function companyFinancialTargetForMetric(
  metric: string,
  model: CompanyFinancialModelCapabilities,
): string | null {
  if (REVENUE_METRICS.has(metric)) return model.fields.includes('revenueNok') ? 'revenueNok' : null
  if (OPERATING_RESULT_METRICS.has(metric)) {
    return model.fields.includes('operatingResult') ? 'operatingResult' : null
  }
  if (metric === 'ebitda') return model.fields.includes('ebitda') ? 'ebitda' : null
  if (metric === 'profit') {
    return model.hasNetProfitField ? model.fields.find((field) => ['profit', 'netProfit', 'netIncome', 'netResult'].includes(field)) ?? null : null
  }
  return null
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value
}

function parseNorwegianDate(value: string): string | null {
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return null
  const iso = `${match[3]}-${match[2]}-${match[1]}`
  return isIsoDate(iso) ? iso : null
}

function reportingCurrency(row: FinancialCandidateRow): string | null {
  return row.unit.match(/^([A-Z]{3})_million$/)?.[1] ?? null
}

function validateRowMetadata(row: FinancialCandidateRow, issues: ValidationIssue[]): void {
  const requiredIdentity: Array<[keyof FinancialCandidateRow, string]> = [
    ['company', 'company'],
    ['orgnr', 'orgnr'],
    ['country', 'country'],
    ['valueChainStage', 'valueChainStage'],
    ['metric', 'metric'],
    ['unit', 'unit'],
    ['fiscal_year', 'fiscal_year'],
    ['fiscal_year_note', 'fiscal_year_note'],
    ['accessed_at', 'accessed_at'],
    ['claim_status', 'claim_status'],
    ['note', 'note'],
  ]
  for (const [field, label] of requiredIdentity) {
    if (!row[field]) {
      addIssue(
        issues,
        issue('missing_required_value', 'source_gap', `Row ${row.rowNumber} is missing ${label}.`, [row.rowNumber]),
      )
    }
  }

  if (!['FI', 'IS'].includes(row.country)) {
    addIssue(
      issues,
      issue(
        'unexpected_country',
        'source_gap',
        `Row ${row.rowNumber} has country ${row.country || '(empty)'}; expected FI or IS.`,
        [row.rowNumber],
      ),
    )
  }
  if (row.country && row.orgnr && !row.orgnr.startsWith(`${row.country}-`)) {
    addIssue(
      issues,
      issue(
        'orgnr_country_mismatch',
        'source_gap',
        `Row ${row.rowNumber} orgnr does not match country prefix ${row.country}-.`,
        [row.rowNumber],
      ),
    )
  }
  if (!reportingCurrency(row)) {
    addIssue(
      issues,
      issue(
        'invalid_unit',
        'model_decision',
        `Row ${row.rowNumber} unit must be formatted as ISO-currency_million.`,
        [row.rowNumber],
      ),
    )
  }
  if (!isIsoDate(row.accessed_at)) {
    addIssue(
      issues,
      issue(
        'invalid_access_date',
        'source_gap',
        `Row ${row.rowNumber} accessed_at must be a real YYYY-MM-DD date.`,
        [row.rowNumber],
      ),
    )
  }

  if (row.value === '') {
    if (row.claim_status !== 'gap_open') {
      addIssue(
        issues,
        issue(
          'empty_value_not_open',
          'source_gap',
          `Row ${row.rowNumber} has no numeric value but is not gap_open.`,
          [row.rowNumber],
        ),
      )
    }
    return
  }

  if (!Number.isFinite(Number(row.value))) {
    addIssue(
      issues,
      issue(
        'invalid_numeric_value',
        'source_gap',
        `Row ${row.rowNumber} value is not a finite number.`,
        [row.rowNumber],
      ),
    )
  }
  if (!row.source_publisher || !row.source_title || !/^https?:\/\/\S+$/.test(row.source_url)) {
    addIssue(
      issues,
      issue(
        'missing_source_locator',
        'source_gap',
        `Row ${row.rowNumber} needs publisher, title, and an HTTP(S) source locator.`,
        [row.rowNumber],
      ),
    )
  }
  if (row.provenance_type !== 'external_report') {
    addIssue(
      issues,
      issue(
        'invalid_provenance_type',
        'source_gap',
        `Row ${row.rowNumber} numeric candidate must use provenance_type=external_report.`,
        [row.rowNumber],
      ),
    )
  }
  if (row.claim_status !== 'candidate_unlocked') {
    addIssue(
      issues,
      issue(
        'invalid_candidate_status',
        'source_gap',
        `Row ${row.rowNumber} numeric candidate must remain candidate_unlocked.`,
        [row.rowNumber],
      ),
    )
  }
}

function validateFiscalPeriod(rows: FinancialCandidateRow[], issues: ValidationIssue[]): void {
  const numericRows = rows.filter((row) => row.value !== '')
  for (const row of numericRows) {
    if (row.fiscal_year_note === 'kalenderår') {
      if (!/^\d{4}$/.test(row.fiscal_year)) {
        addIssue(
          issues,
          issue(
            'calendar_year_not_integer',
            'model_decision',
            `Row ${row.rowNumber} is marked calendar year but fiscal_year is not a four-digit integer.`,
            [row.rowNumber],
          ),
        )
      }
      continue
    }

    const fullPeriod = row.fiscal_year_note.match(
      /^regnskapsår\s+(\d{2}\.\d{2}\.\d{4})-(\d{2}\.\d{2}\.\d{4})$/,
    )
    if (fullPeriod) {
      const start = parseNorwegianDate(fullPeriod[1])
      const end = parseNorwegianDate(fullPeriod[2])
      if (!start || !end || start > end) {
        addIssue(
          issues,
          issue(
            'invalid_fiscal_period',
            'model_decision',
            `Row ${row.rowNumber} has an invalid fiscal period label.`,
            [row.rowNumber],
          ),
        )
      }
      continue
    }

    const endOnly = row.fiscal_year_note.match(/^regnskapsår\s+t\.o\.m\.\s+(\d{2}\.\d{2}\.\d{4})$/)
    if (endOnly && parseNorwegianDate(endOnly[1])) {
      addIssue(
        issues,
        issue(
          'incomplete_fiscal_period',
          'model_decision',
          'Fiscal label gives only the period end; CompanyFinancial period start cannot be set safely.',
          [row.rowNumber],
        ),
      )
      continue
    }

    addIssue(
      issues,
      issue(
        'unrecognized_fiscal_period_label',
        'model_decision',
        `Row ${row.rowNumber} has an unrecognized fiscal_year_note.`,
        [row.rowNumber],
      ),
    )
  }
}

function validateFx(rows: FinancialCandidateRow[], issues: ValidationIssue[]): void {
  const numericRows = rows.filter((row) => row.value !== '')
  const currencies = [...new Set(numericRows.map(reportingCurrency).filter((value): value is string => value !== null))]
  if (currencies.length > 1) {
    addIssue(
      issues,
      issue(
        'mixed_reporting_currencies',
        'model_decision',
        `One company-year group uses multiple reporting currencies: ${currencies.join(', ')}.`,
        numericRows.map((row) => row.rowNumber),
      ),
    )
  }

  const missingRateRows = numericRows.filter((row) => {
    const rate = Number(row.fx_rate_nok_per_unit)
    return row.fx_rate_nok_per_unit === '' || !Number.isFinite(rate) || rate <= 0
  })
  const missingSourceRows = numericRows.filter((row) => !row.fx_rate_source)
  if (missingRateRows.length > 0 || missingSourceRows.length > 0) {
    const affectedRows = [...new Set([...missingRateRows, ...missingSourceRows].map((row) => row.rowNumber))]
    const nonCalendar = numericRows.some((row) => row.fiscal_year_note !== 'kalenderår')
    addIssue(
      issues,
      issue(
        nonCalendar ? 'period_fx_required' : 'calendar_year_fx_required',
        'model_decision',
        nonCalendar
          ? 'CompanyFinancial needs a documented NOK FX rate for the exact fiscal period before conversion.'
          : 'CompanyFinancial needs a documented calendar-year NOK FX rate before conversion.',
        affectedRows,
      ),
    )
  }

  const rates = [...new Set(numericRows.map((row) => row.fx_rate_nok_per_unit).filter(Boolean))]
  const sources = [...new Set(numericRows.map((row) => row.fx_rate_source).filter(Boolean))]
  if (rates.length > 1 || sources.length > 1) {
    addIssue(
      issues,
      issue(
        'inconsistent_fx_metadata',
        'model_decision',
        'Rows in one company-period must use one documented FX rate and source.',
        numericRows.map((row) => row.rowNumber),
      ),
    )
  }
}

function validateKnownSemanticRisks(rows: FinancialCandidateRow[], issues: ValidationIssue[]): void {
  const orgnr = rows[0]?.orgnr
  const rowNumbers = rows.map((row) => row.rowNumber)

  if (orgnr === 'FI-0110456-8') {
    addIssue(
      issues,
      issue(
        'kesko_group_grocery_scope_collision',
        'model_decision',
        'Kesko group and grocery-trade rows share one orgnr/year, while CompanyFinancial has no scope dimension.',
        rowNumbers,
      ),
    )
  }

  if (orgnr === 'FI-0116323-9') {
    addIssue(
      issues,
      issue(
        's_group_scope_semantics',
        'model_decision',
        'S Group retail_sales, grocery_sales, and operating_result do not establish one common CompanyFinancial scope.',
        rowNumbers,
      ),
    )
  }

  if (orgnr === 'FI-1615492-7') {
    const incorrectYears = rows.filter((row) => row.fiscal_year !== '2024')
    addIssue(
      issues,
      issue(
        'lidl_fiscal_2024_not_2025',
        'model_decision',
        incorrectYears.length > 0
          ? 'Lidl source is fiscal 2024; it must not be labeled or imported as fiscal 2025.'
          : 'Lidl source is fiscal 2024 ending 2025-02-28; CompanyFinancial year convention must be decided explicitly.',
        incorrectYears.length > 0 ? incorrectYears.map((row) => row.rowNumber) : rowNumbers,
      ),
    )
  }

  if (orgnr === 'IS-670203-2120' && !/^\d{4}$/.test(rows[0]?.fiscal_year ?? '')) {
    addIssue(
      issues,
      issue(
        'fiscal_year_not_integer',
        'model_decision',
        'Hagar fiscal year 2025/26 cannot populate CompanyFinancial.year Int without an explicit end-year decision.',
        rowNumbers,
      ),
    )
  }

  if (orgnr === 'IS-540206-2010' && rows.some((row) => !row.fx_rate_nok_per_unit || !row.fx_rate_source)) {
    addIssue(
      issues,
      issue(
        'festi_2025_isk_fx_required',
        'model_decision',
        'Festi requires a documented 2025 ISK/NOK rate before CompanyFinancial conversion.',
        rowNumbers,
      ),
    )
  }
}

export function classifyCompanyCandidate(
  rows: FinancialCandidateRow[],
  model: CompanyFinancialModelCapabilities,
): CompanyCandidateValidation {
  const issues: ValidationIssue[] = []
  const orgnr = rows[0]?.orgnr ?? ''
  const companies = [...new Set(rows.map((row) => row.company).filter(Boolean))]
  const fiscalYears = [...new Set(rows.map((row) => row.fiscal_year).filter(Boolean))]
  const numericRows = rows.filter((row) => row.value !== '')
  const openRows = rows.filter((row) => row.value === '')

  for (const row of rows) validateRowMetadata(row, issues)

  if (!model.found || model.missingRequiredFields.length > 0 || !model.yearIsInt || !model.uniqueCompanyYear) {
    addIssue(
      issues,
      issue(
        'company_financial_contract_mismatch',
        'model_decision',
        'Current CompanyFinancial schema does not satisfy the validator contract.',
        rows.map((row) => row.rowNumber),
      ),
    )
  }

  if (openRows.length > 0) {
    addIssue(
      issues,
      issue(
        'open_source_gap',
        'source_gap',
        'Candidate has no numeric value or source and must remain an open source gap.',
        openRows.map((row) => row.rowNumber),
      ),
    )
  }

  validateFiscalPeriod(rows, issues)
  validateFx(rows, issues)

  if (companies.length > 1 && !model.hasScopeField) {
    addIssue(
      issues,
      issue(
        'duplicate_company_year_scope',
        'model_decision',
        'Multiple company/scope labels share one orgnr and fiscal year, but CompanyFinancial is unique on companyId/year.',
        rows.map((row) => row.rowNumber),
      ),
    )
  }

  const targets = numericRows.map((row) => ({
    row,
    target: companyFinancialTargetForMetric(row.metric, model),
  }))
  for (const { row, target } of targets) {
    if (!target) {
      const message =
        row.metric === 'profit'
          ? 'Profit is net profit, not operating result; CompanyFinancial has no net-profit field.'
          : `Metric ${row.metric || '(empty)'} has no unambiguous CompanyFinancial target field.`
      addIssue(
        issues,
        issue(
          row.metric === 'profit' ? 'net_profit_not_supported' : 'unsupported_metric',
          'model_decision',
          message,
          [row.rowNumber],
        ),
      )
    }
    if (row.metric === 'comparable_operating_profit') {
      addIssue(
        issues,
        issue(
          'comparable_operating_profit_semantics',
          'model_decision',
          'Comparable operating profit must not silently become generic operatingResult.',
          [row.rowNumber],
        ),
      )
    }
  }

  for (const target of [...new Set(targets.map((entry) => entry.target).filter(Boolean))]) {
    const collidingRows = targets.filter((entry) => entry.target === target)
    if (collidingRows.length > 1) {
      addIssue(
        issues,
        issue(
          'company_financial_field_collision',
          'model_decision',
          `Multiple candidate cells compete for CompanyFinancial.${target}.`,
          collidingRows.map((entry) => entry.row.rowNumber),
        ),
      )
    }
  }

  validateKnownSemanticRisks(rows, issues)

  const classification: CandidateClassification = issues.some((candidate) => candidate.kind === 'source_gap')
    ? 'source_gap'
    : issues.length > 0
      ? 'model_decision_required'
      : 'apply_ready'

  return {
    orgnr,
    companies,
    fiscalYears,
    numericCells: numericRows.length,
    openRows: openRows.length,
    classification,
    compatibleTargetFields: [...new Set(targets.map((entry) => entry.target).filter((target): target is string => Boolean(target)))],
    issues,
  }
}

export function validateFiIsFinancialCandidates(
  csvText: string,
  schemaText: string,
): FiIsFinancialCandidateReport {
  const parsed = parseCandidateCsv(csvText)
  const model = inspectCompanyFinancialModel(schemaText)
  const datasetIssues = [...parsed.issues]
  const numericRows = parsed.rows.filter((row) => row.value !== '')
  const openRows = parsed.rows.filter((row) => row.value === '')

  if (numericRows.length !== EXPECTED_NUMERIC_CELLS) {
    addIssue(
      datasetIssues,
      issue(
        'numeric_cell_count_mismatch',
        'source_gap',
        `Expected exactly ${EXPECTED_NUMERIC_CELLS} numeric cells; found ${numericRows.length}.`,
      ),
    )
  }
  if (openRows.length !== EXPECTED_OPEN_ROWS) {
    addIssue(
      datasetIssues,
      issue(
        'open_row_count_mismatch',
        'source_gap',
        `Expected exactly ${EXPECTED_OPEN_ROWS} open row; found ${openRows.length}.`,
      ),
    )
  }
  if (
    openRows.length === 1 &&
    (openRows[0].orgnr !== 'IS-571298-3769' ||
      openRows[0].company !== 'Samkaup hf' ||
      openRows[0].claim_status !== 'gap_open')
  ) {
    addIssue(
      datasetIssues,
      issue(
        'unexpected_open_row',
        'source_gap',
        'The one open row must be the explicitly gap_open Samkaup candidate.',
        [openRows[0].rowNumber],
      ),
    )
  }

  if (!model.found || model.missingRequiredFields.length > 0 || !model.yearIsInt || !model.uniqueCompanyYear) {
    addIssue(
      datasetIssues,
      issue(
        'company_financial_contract_mismatch',
        'model_decision',
        `CompanyFinancial schema mismatch; missing fields: ${model.missingRequiredFields.join(', ') || 'none'}.`,
      ),
    )
  }

  const groups = new Map<string, FinancialCandidateRow[]>()
  for (const row of parsed.rows) {
    const key = row.orgnr || `missing-orgnr-row-${row.rowNumber}`
    groups.set(key, [...(groups.get(key) ?? []), row])
  }
  if (groups.size !== EXPECTED_COMPANY_GROUPS) {
    addIssue(
      datasetIssues,
      issue(
        'company_group_count_mismatch',
        'source_gap',
        `Expected exactly ${EXPECTED_COMPANY_GROUPS} company groups; found ${groups.size}.`,
      ),
    )
  }

  const companies = [...groups.values()]
    .map((rows) => classifyCompanyCandidate(rows, model))
    .sort((left, right) => left.orgnr.localeCompare(right.orgnr))
  const canApply =
    datasetIssues.length === 0 && companies.every((company) => company.classification === 'apply_ready')

  return {
    readOnly: true,
    failClosed: true,
    expected: {
      numericCells: EXPECTED_NUMERIC_CELLS,
      openRows: EXPECTED_OPEN_ROWS,
      companyGroups: EXPECTED_COMPANY_GROUPS,
    },
    actual: {
      totalRows: parsed.rows.length,
      numericCells: numericRows.length,
      openRows: openRows.length,
      companyGroups: groups.size,
    },
    companyFinancialModel: model,
    datasetIssues,
    companies,
    canApply,
  }
}

export function runFiIsFinancialCandidateValidation(
  candidatePath = FI_IS_FINANCIAL_CANDIDATES_PATH,
  schemaPath = PRISMA_SCHEMA_PATH,
): FiIsFinancialCandidateReport {
  const csvText = readFileSync(resolve(candidatePath), 'utf8')
  const schemaText = readFileSync(resolve(schemaPath), 'utf8')
  return validateFiIsFinancialCandidates(csvText, schemaText)
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  try {
    const report = runFiIsFinancialCandidateValidation(process.argv[2], process.argv[3])
    console.log(JSON.stringify(report, null, 2))
    if (!report.canApply) process.exitCode = 1
  } catch (error) {
    console.error('[validate-fi-is-financial-candidates] failed:', error)
    process.exitCode = 1
  }
}
