type NumericLike = number | string | { toString(): string } | null | undefined

export function isMillionNokFinancialSource(source: string | null | undefined): boolean {
  if (!source) return false
  const normalized = source.trim()
  return (
    normalized.includes('Årsrapport') ||
    normalized.includes('Årsresultat') ||
    /annual report/i.test(normalized) ||
    /research\/evidence-pack\/arsrapporter\//i.test(normalized) ||
    /^Estimat\b/i.test(normalized)
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
