import { categorizeRole } from './role-category'

export type DatedCompanyRole = {
  companyId?: string | null; companyName: string; role: string
  fromYear?: number | null; toYear?: number | null
}

export function currentBoardCompanyCount(roles: readonly DatedCompanyRole[], year = new Date().getFullYear()): number {
  const active = roles.filter(r => (r.fromYear == null || r.fromYear <= year) && (r.toYear == null || r.toYear >= year))
  const idsByName = new Map(active.filter(r => r.companyId).map(r => [r.companyName.trim().toLowerCase(), r.companyId!]))
  const companies = new Set<string>()
  for (const r of active) {
    const category = categorizeRole(r.role)
    // A combined CEO/board label still contains an explicit board mandate.
    const explicitBoard = /styremedlem|board member|styrelseledamot|bestyrelsesmedlem/i.test(r.role)
    if (!explicitBoard && !['styreleder', 'nestleder', 'styremedlem', 'vara', 'ansatt'].includes(category)) continue
    const name = r.companyName.trim().toLowerCase()
    const key = r.companyId || idsByName.get(name) || name
    if (key) companies.add(key)
  }
  return companies.size
}

export function boardInterlockTags(tags: readonly string[], roles: readonly DatedCompanyRole[]): string[] {
  const retained = tags.filter(tag => tag !== 'interlocking-director')
  if (currentBoardCompanyCount(roles) > 1) retained.push('interlocking-director')
  return [...new Set(retained)].sort((a, b) => a.localeCompare(b, 'nb'))
}
