import { canonicalPersonKey } from './person-key'

export type PersonDuplicateAction = 'merge_candidate' | 'review_required'

export type PersonDuplicateGroupInput = {
  key: string
  label: string
  ids: string[]
}

export type PersonDuplicateProfile = {
  id: string
  name: string
  personKey: string
  tags?: string[] | null
  roles?: unknown
  biography?: string | null
  linkedInUrl?: string | null
  photoUrl?: string | null
}

export type PersonDuplicateTriageRecord = {
  key: string
  label: string
  ids: string[]
  action: PersonDuplicateAction
  canonicalId: string | null
  canonicalPersonKey: string
  sharedCompanyKeys: string[]
  rationale: string
}

export type PersonDuplicateTriageSummary = {
  total: number
  mergeCandidates: number
  reviewRequired: number
  byAction: Partial<Record<PersonDuplicateAction, number>>
  samples: PersonDuplicateTriageRecord[]
}

type ParsedRole = {
  companyId: string | null
  companyName: string | null
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function parseRoles(rawRoles: unknown): ParsedRole[] {
  if (!Array.isArray(rawRoles)) return []

  return rawRoles.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return []
    const record = raw as Record<string, unknown>
    const companyId = typeof record.companyId === 'string' && record.companyId.trim()
      ? record.companyId.trim()
      : null
    const companyName = typeof record.companyName === 'string' && record.companyName.trim()
      ? record.companyName.trim()
      : null

    if (!companyId && !companyName) return []

    return [{ companyId, companyName }]
  })
}

function companyEvidenceKey(role: ParsedRole): string | null {
  if (role.companyId) return role.companyId
  if (role.companyName) return `name:${normalizeText(role.companyName)}`
  return null
}

function profileCompanyKeys(profile: PersonDuplicateProfile): Set<string> {
  return new Set(
    parseRoles(profile.roles)
      .map(companyEvidenceKey)
      .filter((key): key is string => Boolean(key)),
  )
}

function profileScore(profile: PersonDuplicateProfile, targetPersonKey: string): number {
  const tags = profile.tags ?? []
  const normalizedTags = new Set(tags.map(tag => tag.toLowerCase()))
  const nonStubTagCount = tags.filter(tag => tag.toLowerCase() !== 'stub').length
  const roleCount = parseRoles(profile.roles).length

  return (
    roleCount * 10 +
    nonStubTagCount * 5 +
    (normalizedTags.has('brreg-role') ? 8 : 0) +
    (profile.biography ? 100 : 0) +
    (profile.linkedInUrl ? 30 : 0) +
    (profile.photoUrl ? 20 : 0) +
    (profile.personKey === targetPersonKey ? 3 : 0) -
    (normalizedTags.has('stub') ? 20 : 0)
  )
}

function pickCanonicalProfile(
  profiles: PersonDuplicateProfile[],
  targetPersonKey: string,
): PersonDuplicateProfile | null {
  return [...profiles].sort((a, b) => {
    const byScore = profileScore(b, targetPersonKey) - profileScore(a, targetPersonKey)
    if (byScore !== 0) return byScore

    if (a.personKey === targetPersonKey && b.personKey !== targetPersonKey) return -1
    if (b.personKey === targetPersonKey && a.personKey !== targetPersonKey) return 1

    return a.id.localeCompare(b.id, 'nb')
  })[0] ?? null
}

function incrementAction(
  map: Partial<Record<PersonDuplicateAction, number>>,
  key: PersonDuplicateAction,
) {
  map[key] = (map[key] ?? 0) + 1
}

export function classifyPersonDuplicateGroup(
  group: PersonDuplicateGroupInput,
  profilesById: Map<string, PersonDuplicateProfile>,
): PersonDuplicateTriageRecord {
  const profiles = group.ids
    .map(id => profilesById.get(id))
    .filter((profile): profile is PersonDuplicateProfile => Boolean(profile))
  const targetPersonKey = canonicalPersonKey(group.label)
  const canonicalProfile = pickCanonicalProfile(profiles, targetPersonKey)

  const companyKeysByProfile = profiles.map(profileCompanyKeys)
  const companyKeyCounts = new Map<string, number>()
  for (const keys of companyKeysByProfile) {
    for (const key of keys) companyKeyCounts.set(key, (companyKeyCounts.get(key) ?? 0) + 1)
  }

  const sharedCompanyKeys = [...companyKeyCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([key]) => key)
    .sort((a, b) => a.localeCompare(b, 'nb'))

  const everyProfileAnchoredToSharedCompany =
    profiles.length >= 2 &&
    sharedCompanyKeys.length > 0 &&
    companyKeysByProfile.every(keys => [...keys].some(key => sharedCompanyKeys.includes(key)))

  const action: PersonDuplicateAction = everyProfileAnchoredToSharedCompany
    ? 'merge_candidate'
    : 'review_required'

  return {
    key: group.key,
    label: group.label,
    ids: group.ids,
    action,
    canonicalId: canonicalProfile?.id ?? null,
    canonicalPersonKey: targetPersonKey,
    sharedCompanyKeys,
    rationale: action === 'merge_candidate'
      ? 'Duplicate-name profiles share company evidence and can be consolidated after provenance-preserving merge.'
      : 'Duplicate-name profiles do not share company evidence; avoid automatic merge.',
  }
}

export function analyzePersonNameDuplicates(
  groups: PersonDuplicateGroupInput[],
  profiles: PersonDuplicateProfile[],
  sampleLimit = 50,
): PersonDuplicateTriageSummary {
  const profilesById = new Map(profiles.map(profile => [profile.id, profile]))
  const records = groups.map(group => classifyPersonDuplicateGroup(group, profilesById))

  const summary: PersonDuplicateTriageSummary = {
    total: records.length,
    mergeCandidates: 0,
    reviewRequired: 0,
    byAction: {},
    samples: [...records]
      .sort((a, b) => {
        if (a.action === b.action) return 0
        return a.action === 'review_required' ? -1 : 1
      })
      .slice(0, sampleLimit),
  }

  for (const record of records) {
    incrementAction(summary.byAction, record.action)
    if (record.action === 'merge_candidate') summary.mergeCandidates += 1
    else summary.reviewRequired += 1
  }

  return summary
}

export function isSafeAutomaticPersonDuplicateMerge(
  group: PersonDuplicateGroupInput,
  profiles: PersonDuplicateProfile[],
): boolean {
  const profilesById = new Map(profiles.map(profile => [profile.id, profile]))
  return classifyPersonDuplicateGroup(group, profilesById).action === 'merge_candidate'
}
