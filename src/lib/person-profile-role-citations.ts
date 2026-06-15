export type PersonProfileRole = {
  companyId?: string | null
  companyName?: string | null
  role?: string | null
  fromYear?: number | null
  toYear?: number | null
}

function cleanRolePart(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined) return null
  const text = String(value).trim()
  return text || null
}

function yearPart(value: number | null | undefined): string {
  return value === null || value === undefined ? 'null' : String(value)
}

export function buildPersonProfileRoleFieldPath(role: PersonProfileRole): string | null {
  const companyId = cleanRolePart(role.companyId)
  const roleKey = cleanRolePart(role.role)

  if (!companyId || !roleKey) return null

  return [
    `roles[companyId=${companyId}`,
    `roleKey=${roleKey}`,
    `fromYear=${yearPart(role.fromYear)}`,
    `toYear=${yearPart(role.toYear)}]`,
  ].join(';')
}
