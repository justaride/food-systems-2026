export type CompanyFinancialYear = {
  companyId: string
  year: number
}

export type KonsernFinancialCoverage = {
  measuredYear: number
  recencyThreshold: number
  childrenWithLatestFinancial: number
  childrenWithOlderFinancial: number
  childrenWithoutFinancial: number
}

export function summarizeKonsernFinancialCoverage(
  childIds: string[],
  childFinancials: CompanyFinancialYear[],
  currentYear: number,
): KonsernFinancialCoverage {
  const recencyThreshold = currentYear - 2
  const groupYears = childFinancials.map(f => f.year)
  const measuredYear = groupYears.length > 0 ? Math.max(...groupYears) : currentYear - 1

  const childYearsMap = new Map<string, number[]>()
  for (const financial of childFinancials) {
    const years = childYearsMap.get(financial.companyId) ?? []
    years.push(financial.year)
    childYearsMap.set(financial.companyId, years)
  }

  let childrenWithLatestFinancial = 0
  let childrenWithOlderFinancial = 0
  for (const childId of childIds) {
    const years = childYearsMap.get(childId) ?? []
    if (years.length === 0) continue
    if (Math.max(...years) >= recencyThreshold) {
      childrenWithLatestFinancial++
    } else {
      childrenWithOlderFinancial++
    }
  }

  return {
    measuredYear,
    recencyThreshold,
    childrenWithLatestFinancial,
    childrenWithOlderFinancial,
    childrenWithoutFinancial: childIds.length - childrenWithLatestFinancial - childrenWithOlderFinancial,
  }
}
