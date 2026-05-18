export type PersonProfileRole = {
  companyId?: string | null
  companyName?: string | null
  role?: string | null
  fromYear?: number | null
  toYear?: number | null
}

export type PersonProfileRoleProfile = {
  id: string
  personKey: string
  roles: PersonProfileRole[]
}

export type CitedBoardMemberRole = {
  id: string
  personKey: string
  companyId: string
  companyName: string
  role: string
  citationId: string
}

export type PersonProfileRoleCitationPlan = {
  profileId: string
  citationId: string
  fieldPath: string
}

export type SkippedPersonProfileRole = {
  profileId: string
  fieldPath: string | null
  reason: 'unsupported_role' | 'missing_company_locator' | 'no_match' | 'ambiguous_match'
}

export type PersonProfileRoleCitationPlanResult = {
  plans: PersonProfileRoleCitationPlan[]
  skipped: SkippedPersonProfileRole[]
}

export function buildPersonProfileRoleCitationPlans(
  profiles: PersonProfileRoleProfile[],
  boardRows: CitedBoardMemberRole[],
): PersonProfileRoleCitationPlanResult {
  const plans: PersonProfileRoleCitationPlan[] = []
  const skipped: SkippedPersonProfileRole[] = []

  for (const profile of profiles) {
    for (const role of profile.roles) {
      const fieldPath = buildPersonProfileRoleFieldPath(role)
      if (!fieldPath) {
        skipped.push({
          profileId: profile.id,
          fieldPath,
          reason: normalizePersonProfileRoleKey(role.role ?? '') ? 'missing_company_locator' : 'unsupported_role',
        })
        continue
      }

      const candidates = findMatchingBoardRows(profile, role, boardRows)
      if (candidates.length === 0) {
        skipped.push({ profileId: profile.id, fieldPath, reason: 'no_match' })
        continue
      }
      if (candidates.length > 1) {
        skipped.push({ profileId: profile.id, fieldPath, reason: 'ambiguous_match' })
        continue
      }

      plans.push({
        profileId: profile.id,
        citationId: candidates[0].citationId,
        fieldPath,
      })
    }
  }

  return { plans: dedupePlans(plans), skipped }
}

export function buildPersonProfileRoleFieldPath(role: PersonProfileRole): string | null {
  const roleKey = normalizePersonProfileRoleKey(role.role ?? '')
  if (!roleKey) return null

  const fromYear = role.fromYear ?? 'null'
  const toYear = role.toYear ?? 'null'
  const companyId = normalizeText(role.companyId)
  if (companyId) {
    return `roles[companyId=${companyId};roleKey=${roleKey};fromYear=${fromYear};toYear=${toYear}]`
  }

  const companyNameKey = normalizeCompanyNameKey(role.companyName)
  if (companyNameKey) {
    return `roles[companyNameKey=${companyNameKey};roleKey=${roleKey};fromYear=${fromYear};toYear=${toYear}]`
  }

  return null
}

export function normalizePersonProfileRoleKey(role: string): string | null {
  const normalized = normalizeText(role)?.toLowerCase() ?? ''
  if (!normalized) return null

  const matches = new Set<string>()

  if (
    normalized.includes('ceo')
    || normalized.includes('daglig leder')
    || normalized.includes('administrerende direktor')
    || normalized.includes('administrerende direktør')
    || normalized.includes('adm. dir')
  ) {
    matches.add('CEO')
  }
  if (
    normalized.includes('styrets leder')
    || normalized.includes('styreleder')
  ) {
    matches.add('styreleder')
  }
  if (normalized.includes('nestleder')) {
    matches.add('nestleder')
  }
  if (normalized.includes('styremedlem')) {
    matches.add('styremedlem')
  }

  return matches.size === 1 ? [...matches][0] : null
}

export function normalizeCompanyNameKey(name: string | null | undefined): string | null {
  const normalized = canonicalKey(name ?? '')
  return normalized || null
}

function findMatchingBoardRows(
  profile: PersonProfileRoleProfile,
  role: PersonProfileRole,
  boardRows: CitedBoardMemberRole[],
): CitedBoardMemberRole[] {
  const roleKey = normalizePersonProfileRoleKey(role.role ?? '')
  if (!roleKey) return []

  const baseCandidates = boardRows.filter(row =>
    row.personKey === profile.personKey
    && normalizePersonProfileRoleKey(row.role) === roleKey,
  )
  const companyId = normalizeText(role.companyId)
  if (companyId) {
    return baseCandidates.filter(row => row.companyId === companyId)
  }

  const companyNameKey = normalizeCompanyNameKey(role.companyName)
  if (!companyNameKey) return []

  return baseCandidates.filter(row => normalizeCompanyNameKey(row.companyName) === companyNameKey)
}

function dedupePlans(plans: PersonProfileRoleCitationPlan[]): PersonProfileRoleCitationPlan[] {
  const seen = new Set<string>()
  const deduped: PersonProfileRoleCitationPlan[] = []

  for (const plan of plans) {
    const key = [plan.citationId, plan.profileId, plan.fieldPath].join('\u001f')
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(plan)
  }

  return deduped
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ')
  return normalized ? normalized : undefined
}

function canonicalKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}
