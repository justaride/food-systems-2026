import { formatAmountWithYear, type FinancialYearLabel } from '@/lib/financial-year-labels'

type NumericLike = number | null | undefined

function normalizeNumberSpaces(value: string): string {
  return value.replace(/\u00a0/g, ' ')
}

export function formatRevenueDisplay(
  value: NumericLike,
  hasFinancialRow: boolean,
  missingLabel = 'Mangler regnskap',
  year?: FinancialYearLabel,
): string {
  if (value == null) return hasFinancialRow ? '—' : missingLabel
  if (value >= 1e9) return formatAmountWithYear(`${(value / 1e9).toFixed(1)} mrd`, year)
  if (value >= 1e6) return formatAmountWithYear(`${(value / 1e6).toFixed(0)} mill`, year)
  return formatAmountWithYear(`${normalizeNumberSpaces(Math.round(value / 1e3).toLocaleString('no'))}k`, year)
}

export function formatEmployeeDisplay(value: NumericLike): string {
  return value == null ? '—' : normalizeNumberSpaces(value.toLocaleString('no'))
}
