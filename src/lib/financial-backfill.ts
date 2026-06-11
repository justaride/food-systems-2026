import type { MissingValueReason } from '@/components/ui/MissingValue'

export type FinancialMissingReason =
  | 'foreign_registry'
  | 'synthetic_orgnr'
  | 'not_accounting_obligated'
  | 'not_as_asa_scope'
  | 'deregistered'
  | 'research_construct'
  | 'regnskapsregisteret_no_accounts'
  | 'regnskapsregisteret_unsupported_accounts'

export type FinancialBackfillCompany = {
  orgNr: string
  country: string
  legalForm: string | null
  isResearchConstruct?: boolean
  metadata: unknown
}

export type FinancialTargetClassification =
  | { action: 'backfill'; reason: null }
  | { action: 'mark'; reason: FinancialMissingReason }

export type RegnskapsregisteretStatement = {
  id?: number
  regnskapstype?: string
  virksomhet?: {
    organisasjonsnummer?: string
    organisasjonsform?: string
  }
  regnskapsperiode?: {
    fraDato?: string
    tilDato?: string
  }
  valuta?: string
  resultatregnskapResultat?: {
    aarsresultat?: number
    driftsresultat?: {
      driftsresultat?: number
      driftsinntekter?: {
        sumDriftsinntekter?: number
      }
    }
  }
  egenkapitalGjeld?: {
    egenkapital?: {
      sumEgenkapital?: number
    }
  }
  eiendeler?: {
    sumEiendeler?: number
  }
}

export type CompanyFinancialUpsertData = {
  companyId: string
  year: number
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  ebitda: number | null
  equityRatio: number | null
  groupEmployees: number | null
  source: string
  fiscalYearLabel: string
  fiscalPeriodStart: Date | null
  fiscalPeriodEnd: Date | null
  reportingCurrency: string | null
  fxRateNokPerUnit: number | null
  fxRateSource: string | null
  verificationStatus: string
  verifiedAt: Date
}

type JsonObject = Record<string, unknown>

const NORWEGIAN_ORGNR_RE = /^\d{9}$/
const ACCOUNTING_TARGET_LEGAL_FORMS = new Set(['AS', 'ASA'])
const NON_ACCOUNTING_LEGAL_FORMS = new Set(['FLI', 'FORENING', 'STI', 'STIFTELSE'])

function asObject(value: unknown): JsonObject {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonObject) : {}
}

function normalizedLegalForm(value: string | null | undefined): string {
  return value?.trim().toUpperCase() ?? ''
}

export function isNorwegianOrgNr(orgNr: string | null | undefined): boolean {
  return Boolean(orgNr && NORWEGIAN_ORGNR_RE.test(orgNr.trim()))
}

export function financialMissingReason(metadata: unknown): FinancialMissingReason | null {
  const financials = asObject(asObject(metadata).financials)
  const reason = financials.missingReason
  return typeof reason === 'string' && reason ? (reason as FinancialMissingReason) : null
}

export function hasExplicitFinancialMissingReason(metadata: unknown): boolean {
  return financialMissingReason(metadata) !== null
}

function isDeregistered(metadata: unknown): boolean {
  const brregStatus = asObject(metadata).brregStatus
  return typeof brregStatus === 'string' && brregStatus.startsWith('slettet')
}

export function isNorwegianFinancialStatementTarget(company: FinancialBackfillCompany): boolean {
  return (
    company.country === 'NO' &&
    ACCOUNTING_TARGET_LEGAL_FORMS.has(normalizedLegalForm(company.legalForm)) &&
    isNorwegianOrgNr(company.orgNr) &&
    !company.isResearchConstruct &&
    !isDeregistered(company.metadata)
  )
}

export function classifyFinancialBackfillTarget(company: FinancialBackfillCompany): FinancialTargetClassification {
  if (isNorwegianFinancialStatementTarget(company)) return { action: 'backfill', reason: null }
  if (company.isResearchConstruct) return { action: 'mark', reason: 'research_construct' }
  if (company.country !== 'NO') return { action: 'mark', reason: 'foreign_registry' }
  if (!isNorwegianOrgNr(company.orgNr)) return { action: 'mark', reason: 'synthetic_orgnr' }
  if (isDeregistered(company.metadata)) return { action: 'mark', reason: 'deregistered' }
  if (NON_ACCOUNTING_LEGAL_FORMS.has(normalizedLegalForm(company.legalForm))) {
    return { action: 'mark', reason: 'not_accounting_obligated' }
  }
  return { action: 'mark', reason: 'not_as_asa_scope' }
}

export function buildFinancialMissingMetadata(
  existing: unknown,
  input: {
    reason: FinancialMissingReason
    source: string
    checkedAt: string
    note?: string
  },
): JsonObject {
  const metadata = asObject(existing)
  const financials = asObject(metadata.financials)
  return {
    ...metadata,
    financials: {
      ...financials,
      missingReason: input.reason,
      missingReasonSource: input.source,
      missingReasonCheckedAt: input.checkedAt,
      ...(input.note ? { missingReasonNote: input.note } : {}),
    },
  }
}

function yearFromStatement(statement: RegnskapsregisteretStatement): number | null {
  const end = statement.regnskapsperiode?.tilDato
  if (end) {
    const year = Number(end.slice(0, 4))
    if (Number.isInteger(year)) return year
  }
  return null
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function roundedPercent(numerator: number | null, denominator: number | null): number | null {
  if (numerator == null || denominator == null || denominator === 0) return null
  const value = Math.round((numerator / denominator) * 10000) / 100
  return Math.abs(value) <= 999.99 ? value : null
}

function statementOrgNr(statement: RegnskapsregisteretStatement): string | null {
  return statement.virksomhet?.organisasjonsnummer?.trim() ?? null
}

export function selectLatestCompanyStatement(
  statements: RegnskapsregisteretStatement[],
  orgNr: string,
): RegnskapsregisteretStatement | null {
  const normalizedOrgNr = orgNr.trim()
  const candidates = statements
    .filter(statement => (statement.regnskapstype ?? 'SELSKAP') === 'SELSKAP')
    .filter(statement => statementOrgNr(statement) === normalizedOrgNr)
    .map(statement => ({ statement, year: yearFromStatement(statement) }))
    .filter((row): row is { statement: RegnskapsregisteretStatement; year: number } => row.year !== null)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return (b.statement.id ?? 0) - (a.statement.id ?? 0)
    })

  return candidates[0]?.statement ?? null
}

export function buildFinancialUpsertData(
  companyId: string,
  statement: RegnskapsregisteretStatement,
  checkedAt: string,
): CompanyFinancialUpsertData {
  const year = yearFromStatement(statement)
  if (!year) throw new Error('Regnskapsregisteret statement is missing regnskapsperiode.tilDato year')

  const revenue = finiteNumber(
    statement.resultatregnskapResultat?.driftsresultat?.driftsinntekter?.sumDriftsinntekter,
  )
  const operatingResult = finiteNumber(statement.resultatregnskapResultat?.driftsresultat?.driftsresultat)
  const equity = finiteNumber(statement.egenkapitalGjeld?.egenkapital?.sumEgenkapital)
  const assets = finiteNumber(statement.eiendeler?.sumEiendeler)
  const currency = statement.valuta?.trim() || null

  return {
    companyId,
    year,
    revenueNok: revenue,
    operatingResult,
    operatingMargin: roundedPercent(operatingResult, revenue),
    ebitda: null,
    equityRatio: roundedPercent(equity, assets),
    groupEmployees: null,
    source: `Regnskapsregisteret ${year}`,
    fiscalYearLabel: String(year),
    fiscalPeriodStart: statement.regnskapsperiode?.fraDato
      ? new Date(`${statement.regnskapsperiode.fraDato}T00:00:00.000Z`)
      : null,
    fiscalPeriodEnd: statement.regnskapsperiode?.tilDato
      ? new Date(`${statement.regnskapsperiode.tilDato}T00:00:00.000Z`)
      : null,
    reportingCurrency: currency,
    fxRateNokPerUnit: currency === 'NOK' ? 1 : null,
    fxRateSource: currency === 'NOK' ? 'NOK' : null,
    verificationStatus: 'machine_verified',
    verifiedAt: new Date(checkedAt),
  }
}

const missingDisplayByReason: Record<FinancialMissingReason, { missingValueReason: MissingValueReason; label: string }> = {
  foreign_registry: { missingValueReason: 'not_applicable', label: 'Utenlandsk register' },
  synthetic_orgnr: { missingValueReason: 'no_matching_record', label: 'Uten BRREG-match' },
  not_accounting_obligated: { missingValueReason: 'not_applicable', label: 'Ikke regnskapspliktig' },
  not_as_asa_scope: { missingValueReason: 'not_applicable', label: 'Utenfor AS/ASA-scope' },
  deregistered: { missingValueReason: 'not_applicable', label: 'Slettet enhet' },
  research_construct: { missingValueReason: 'not_applicable', label: 'Analyseobjekt' },
  regnskapsregisteret_no_accounts: { missingValueReason: 'no_financial_row', label: 'Ingen BRREG-regnskap' },
  regnskapsregisteret_unsupported_accounts: { missingValueReason: 'no_financial_row', label: 'Ikke støttet regnskap' },
}

export function financialMissingDisplay(metadata: unknown): { missingValueReason: MissingValueReason; label: string } {
  const reason = financialMissingReason(metadata)
  return reason && reason in missingDisplayByReason
    ? missingDisplayByReason[reason]
    : { missingValueReason: 'no_financial_row', label: 'Mangler regnskap' }
}
