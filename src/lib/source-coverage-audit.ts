export type CoverageSeverity = 'ok' | 'warning' | 'not_implemented'

export type CoverageCheckInput = {
  model: string
  total: number
  covered: number
  requirement: string
  implemented: boolean
  blocker?: string
}

export type CoverageCheckResult = {
  model: string
  total: number
  covered: number
  coveragePct: string
  severity: CoverageSeverity
  message: string
}

export type FieldCitationTargetValidationResult = {
  severity: CoverageSeverity
  message: string
}

const FIELD_CITATION_TARGET_TABLE_ENTRIES = [
  ['Document', 'Document'],
  ['SourceDoc', 'SourceDoc'],
  ['Company', 'Company'],
  ['CompanyFinancial', 'CompanyFinancial'],
  ['Shareholder', 'Shareholder'],
  ['BoardMember', 'BoardMember'],
  ['PersonProfile', 'PersonProfile'],
  ['Actor', 'Actor'],
  ['CompanyOwnership', 'CompanyOwnership'],
  ['BusinessRelationship', 'BusinessRelationship'],
  ['CompanyProperty', 'CompanyProperty'],
  ['Subsidy', 'Subsidy'],
] as const

export function getFieldCitationTargetTableEntries(): ReadonlyArray<readonly [string, string]> {
  return FIELD_CITATION_TARGET_TABLE_ENTRIES
}

export function formatCoveragePct(covered: number, total: number) {
  if (total === 0) return 'n/a'
  return `${((covered / total) * 100).toFixed(1)}%`
}

export function describeCoverageCheck(input: CoverageCheckInput): CoverageCheckResult {
  if (!input.implemented) {
    const blocker = input.blocker ? ` (${input.blocker})` : ''
    return {
      model: input.model,
      total: input.total,
      covered: input.covered,
      coveragePct: 'ikke implementert',
      severity: 'not_implemented',
      message: `${input.requirement}: ikke implementert${blocker}`,
    }
  }

  const coveragePct = formatCoveragePct(input.covered, input.total)
  const severity: CoverageSeverity = input.total === 0 || input.covered === input.total ? 'ok' : 'warning'

  return {
    model: input.model,
    total: input.total,
    covered: input.covered,
    coveragePct,
    severity,
    message: `${input.requirement}: ${input.covered}/${input.total} (${coveragePct})`,
  }
}

export function describeFieldCitationTargetValidation(fieldCitationTableExists: boolean): FieldCitationTargetValidationResult {
  if (!fieldCitationTableExists) {
    return {
      severity: 'not_implemented',
      message: 'FieldCitation target validation: ikke implementert (FieldCitation table missing)',
    }
  }

  return {
    severity: 'ok',
    message: 'FieldCitation target validation: ready',
  }
}

export function isPersonProfileRoleFieldPath(fieldPath: string | null): boolean {
  return typeof fieldPath === 'string' && fieldPath.startsWith('roles[')
}
