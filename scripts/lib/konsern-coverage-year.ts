export type FinancialCoverageRow = {
  companyId: string
  year: number | null
}

export type FinancialCoverageSummary = {
  measuredYear: number | null
  childrenWithLatestFinancial: number
  childrenWithoutFinancial: number
  childrenWithOlderFinancial: number
}

export function summarizeFinancialCoverage(
  childIds: string[],
  financialRows: FinancialCoverageRow[],
  fallbackMeasuredYear: number | null = null,
): FinancialCoverageSummary {
  const childIdSet = new Set(childIds)
  const latestYearByCompany = new Map<string, number>()

  for (const row of financialRows) {
    if (!childIdSet.has(row.companyId) || row.year == null || !Number.isFinite(row.year)) continue

    const year = Math.trunc(row.year)
    const previousYear = latestYearByCompany.get(row.companyId)
    if (previousYear == null || year > previousYear) {
      latestYearByCompany.set(row.companyId, year)
    }
  }

  const measuredYear = latestYearByCompany.size > 0
    ? Math.max(...latestYearByCompany.values())
    : fallbackMeasuredYear

  let childrenWithLatestFinancial = 0
  let childrenWithoutFinancial = 0
  let childrenWithOlderFinancial = 0

  for (const childId of childIds) {
    const latestYear = latestYearByCompany.get(childId)
    if (latestYear == null) {
      childrenWithoutFinancial += 1
    } else if (latestYear === measuredYear) {
      childrenWithLatestFinancial += 1
    } else {
      childrenWithOlderFinancial += 1
    }
  }

  return {
    measuredYear,
    childrenWithLatestFinancial,
    childrenWithoutFinancial,
    childrenWithOlderFinancial,
  }
}

export function formatFinancialCoverageGaps(summary: FinancialCoverageSummary): string[] {
  const gaps: string[] = []
  const measuredYearLabel = summary.measuredYear == null
    ? 'målt år kan ikke bestemmes'
    : `målt mot ${summary.measuredYear}`

  if (summary.childrenWithoutFinancial > 0) {
    gaps.push(`${summary.childrenWithoutFinancial} datterselskap mangler regnskap helt (${measuredYearLabel})`)
  }
  if (summary.measuredYear != null && summary.childrenWithOlderFinancial > 0) {
    gaps.push(`${summary.childrenWithOlderFinancial} datterselskap har eldre regnskap enn målt år ${summary.measuredYear}`)
  }

  return gaps
}
