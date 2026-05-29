type NumericLike = number | string | { toString(): string } | null | undefined

export function isMillionNokFinancialSource(source: string | null | undefined): boolean {
  if (!source) return false
  const normalized = source.trim()
  const lower = normalized.toLowerCase()
  return (
    normalized.includes('Årsrapport') ||
    normalized.includes('Årsresultat') ||
    /^Estimat\b/i.test(normalized) ||
    lower.includes('årsrapport') ||
    lower.includes('årsresultat') ||
    lower.includes('årsredovisning') ||
    lower.includes('annual report') ||
    lower.includes('year-end report') ||
    lower.includes('tilinpäätös') ||
    lower.includes('vuosikertomus') ||
    lower.includes('corporate presentation') ||
    lower.includes('financial statements bulletin') ||
    lower.includes('key figures')
  )
}

export function financialAmountToNok(
  value: NumericLike,
  source: string | null | undefined,
): number | null {
  if (value == null) return null
  const amount = Number(value)
  if (!Number.isFinite(amount)) return null
  if (amount !== 0 && Math.abs(amount) < 1_000_000 && isMillionNokFinancialSource(source)) {
    return amount * 1_000_000
  }
  return amount
}
