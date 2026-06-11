type NumericLike = number | null | undefined

function normalizeNumberSpaces(value: string): string {
  return value.replace(/\u00a0/g, ' ')
}

export function formatRevenueDisplay(
  value: NumericLike,
  hasFinancialRow: boolean,
  missingLabel = 'Mangler regnskap',
): string {
  if (value == null) return hasFinancialRow ? '—' : missingLabel
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} mrd`
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} mill`
  return `${normalizeNumberSpaces(Math.round(value / 1e3).toLocaleString('no'))}k`
}

export function formatEmployeeDisplay(value: NumericLike): string {
  return value == null ? '—' : normalizeNumberSpaces(value.toLocaleString('no'))
}
