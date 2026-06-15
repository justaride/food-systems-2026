export interface PersonProfileRole {
  companyId: string | null
  companyName: string | null
  role: string | null
  fromYear: number | null
  toYear: number | null
}

export function buildPersonProfileRoleFieldPath(role: PersonProfileRole): string {
  const companyId = role.companyId ?? 'null'
  const roleKey = role.role ?? 'null'
  const fromYear = role.fromYear ?? 'null'
  const toYear = role.toYear ?? 'null'
  return `roles[companyId=${companyId};roleKey=${roleKey};fromYear=${fromYear};toYear=${toYear}]`
}
