import { prisma } from '@/lib/db'
import { isMissingPrismaTable } from './prisma-errors'

type PersonRole = {
  companyId: string | null
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
}

type PersonProfileRow = {
  id: string
  name: string
  personKey: string
  roles: PersonRole[]
  biography: string | null
  linkedInUrl: string | null
  affiliations: string[]
  tags: string[]
}

function parseYear(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function normalizeStoredRoles(roles: unknown[]): PersonRole[] {
  return roles.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return []

    const record = entry as Record<string, unknown>
    const companyName = typeof record.companyName === 'string' ? record.companyName : null
    const role = typeof record.role === 'string' ? record.role : null

    if (!companyName || !role) return []

    return [{
      companyId: typeof record.companyId === 'string' && record.companyId ? record.companyId : null,
      companyName,
      role,
      fromYear: parseYear(record.fromYear),
      toYear: parseYear(record.toYear),
    }]
  })
}

function normalizeRoleKey(role: PersonRole) {
  return `${role.companyName.trim().toLowerCase()}::${role.role.trim().toLowerCase()}`
}

function mergeRoles(primary: PersonRole[], secondary: PersonRole[]): PersonRole[] {
  const merged = new Map<string, PersonRole>()

  for (const role of [...primary, ...secondary]) {
    const key = normalizeRoleKey(role)
    const existing = merged.get(key)

    if (!existing) {
      merged.set(key, role)
      continue
    }

    merged.set(key, {
      companyId: existing.companyId ?? role.companyId,
      companyName: existing.companyName || role.companyName,
      role: existing.role || role.role,
      fromYear: existing.fromYear ?? role.fromYear,
      toYear: existing.toYear ?? role.toYear,
    })
  }

  return [...merged.values()].sort((a, b) => {
    const byStartYear = (b.fromYear ?? -Infinity) - (a.fromYear ?? -Infinity)
    if (byStartYear !== 0) return byStartYear

    const byCompany = a.companyName.localeCompare(b.companyName, 'nb')
    if (byCompany !== 0) return byCompany

    return a.role.localeCompare(b.role, 'nb')
  })
}

function mergeTags(primary: string[], secondary: string[]) {
  return [...new Set([...primary, ...secondary])].sort((a, b) => a.localeCompare(b, 'nb'))
}

function mergeProfileRows(
  profile: PersonProfileRow | null,
  fallback: PersonProfileRow | null,
): PersonProfileRow | null {
  if (!profile) return fallback
  if (!fallback) return profile

  return {
    id: profile.id,
    name: profile.name || fallback.name,
    personKey: profile.personKey,
    roles: mergeRoles(profile.roles, fallback.roles),
    biography: profile.biography ?? fallback.biography,
    linkedInUrl: profile.linkedInUrl ?? fallback.linkedInUrl,
    affiliations: [...new Set([...profile.affiliations, ...fallback.affiliations])],
    tags: mergeTags(profile.tags, fallback.tags),
  }
}

async function loadStoredProfiles(): Promise<PersonProfileRow[]> {
  try {
    const profiles = await prisma.personProfile.findMany({
      orderBy: { name: 'asc' },
    })

    return profiles.map((profile) => ({
      ...profile,
      roles: normalizeStoredRoles(profile.roles as unknown[]),
    }))
  } catch (error) {
    if (isMissingPrismaTable(error, 'PersonProfile')) return []
    throw error
  }
}

async function loadStoredProfileByKey(personKey: string): Promise<PersonProfileRow | null> {
  try {
    const profile = await prisma.personProfile.findUnique({
      where: { personKey },
    })

    if (!profile) return null

    return {
      ...profile,
      roles: normalizeStoredRoles(profile.roles as unknown[]),
    }
  } catch (error) {
    if (isMissingPrismaTable(error, 'PersonProfile')) return null
    throw error
  }
}

async function buildFallbackProfilesFromBoardMembers(personKey?: string): Promise<PersonProfileRow[]> {
  const members = await prisma.boardMember.findMany({
    ...(personKey ? { where: { personKey } } : {}),
    include: { company: { select: { id: true, name: true } } },
    orderBy: [{ personName: 'asc' }, { companyId: 'asc' }],
  })

  const byKey = new Map<string, PersonProfileRow>()

  for (const member of members) {
    const existing = byKey.get(member.personKey)
    const nextRole: PersonRole = {
      companyId: member.company.id,
      companyName: member.company.name,
      role: member.role,
      fromYear: null,
      toYear: null,
    }

    if (existing) {
      existing.roles = mergeRoles(existing.roles, [nextRole])
      continue
    }

    byKey.set(member.personKey, {
      id: `board-${member.personKey}`,
      name: member.personName,
      personKey: member.personKey,
      roles: [nextRole],
      biography: null,
      linkedInUrl: null,
      affiliations: [],
      tags: [],
    })
  }

  return [...byKey.values()].map((profile) => ({
    ...profile,
    tags: mergeTags(
      profile.tags,
      profile.roles.length > 1
        ? ['auto-detected', 'board-member', 'interlocking-director']
        : ['auto-detected', 'board-member'],
    ),
  }))
}

export async function getPersonProfiles(): Promise<PersonProfileRow[]> {
  const [profiles, fallbackProfiles] = await Promise.all([
    loadStoredProfiles(),
    buildFallbackProfilesFromBoardMembers(),
  ])

  const merged = new Map<string, PersonProfileRow>()

  for (const fallback of fallbackProfiles) {
    merged.set(fallback.personKey, fallback)
  }

  for (const profile of profiles) {
    merged.set(profile.personKey, mergeProfileRows(profile, merged.get(profile.personKey) ?? null)!)
  }

  return [...merged.values()].sort((a, b) => a.name.localeCompare(b.name, 'nb'))
}

export async function getPersonByKey(personKey: string): Promise<PersonProfileRow | null> {
  const [profile, fallback] = await Promise.all([
    loadStoredProfileByKey(personKey),
    buildFallbackProfilesFromBoardMembers(personKey).then((rows) => rows[0] ?? null),
  ])

  return mergeProfileRows(profile, fallback)
}

export async function getPersonKeysWithProfiles(): Promise<Set<string>> {
  const [profiles, fallbackProfiles] = await Promise.all([
    loadStoredProfiles(),
    buildFallbackProfilesFromBoardMembers(),
  ])

  return new Set([
    ...profiles.map((profile) => profile.personKey),
    ...fallbackProfiles.map((profile) => profile.personKey),
  ])
}
