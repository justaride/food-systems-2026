import { prisma } from '@/lib/db'
import { isMissingPrismaTable } from './prisma-errors'

type PersonRole = {
  companyId: string
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

export async function getPersonProfiles(): Promise<PersonProfileRow[]> {
  try {
    const profiles = await prisma.personProfile.findMany({
      orderBy: { name: 'asc' },
    })

    return profiles.map(p => ({
      ...p,
      roles: p.roles as unknown as PersonRole[],
    }))
  } catch (error) {
    if (isMissingPrismaTable(error, 'PersonProfile')) return []
    throw error
  }
}

export async function getPersonByKey(personKey: string): Promise<PersonProfileRow | null> {
  try {
    const profile = await prisma.personProfile.findUnique({
      where: { personKey },
    })

    if (!profile) return null

    return {
      ...profile,
      roles: profile.roles as unknown as PersonRole[],
    }
  } catch (error) {
    if (isMissingPrismaTable(error, 'PersonProfile')) return null
    throw error
  }
}

export async function getPersonKeysWithProfiles(): Promise<Set<string>> {
  try {
    const profiles = await prisma.personProfile.findMany({
      select: { personKey: true },
    })
    return new Set(profiles.map(p => p.personKey))
  } catch (error) {
    if (isMissingPrismaTable(error, 'PersonProfile')) return new Set()
    throw error
  }
}
