export type FinancialYearLabel = number | string | null | undefined

export function formatAmountWithYear(amountLabel: string, yearLabel: FinancialYearLabel): string {
  if (!yearLabel || amountLabel === '—') return amountLabel
  return `${amountLabel} (${yearLabel})`
}

export function formatYearRange(years: Iterable<number | null | undefined>): string | null {
  const sortedYears = Array.from(
    new Set(
      Array.from(years)
        .filter((year): year is number => typeof year === 'number' && Number.isFinite(year))
    )
  ).sort((a, b) => a - b)

  if (sortedYears.length === 0) return null
  if (sortedYears.length === 1) return String(sortedYears[0])
  return `${sortedYears[0]}-${sortedYears[sortedYears.length - 1]}`
}
