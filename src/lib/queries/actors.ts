import { prisma } from '@/lib/db'
import { isMissingPrismaTable } from './prisma-errors'

const PRIORITY_RANK: Record<string, number> = {
  p1: 0,
  p2: 1,
  p3: 2,
}

function sortActors<T extends { priorityTier: string | null; powerScore: number | null; name: string }>(actors: T[]) {
  return actors.sort((a, b) => {
    const priorityDiff = (PRIORITY_RANK[a.priorityTier ?? 'p9'] ?? 99) - (PRIORITY_RANK[b.priorityTier ?? 'p9'] ?? 99)
    if (priorityDiff !== 0) return priorityDiff

    const powerDiff = (b.powerScore ?? -1) - (a.powerScore ?? -1)
    if (powerDiff !== 0) return powerDiff

    return a.name.localeCompare(b.name, 'no')
  })
}

export async function getActors(opts?: {
  actorType?: string
  priorityTier?: string
  stance?: string
  country?: string
  query?: string
}) {
  const { actorType, priorityTier, stance, country, query } = opts ?? {}

  const where = {
    ...(actorType && { actorType }),
    ...(priorityTier && { priorityTier }),
    ...(stance && { currentStance: stance }),
    ...(country && { country }),
    ...(query && {
      OR: [
        { name: { contains: query, mode: 'insensitive' as const } },
        { roleSummary: { contains: query, mode: 'insensitive' as const } },
        { currentRelevance: { contains: query, mode: 'insensitive' as const } },
        { specificAsk: { contains: query, mode: 'insensitive' as const } },
        { nextStep: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  }

  try {
    const actors = await prisma.actor.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            orgNr: true,
            valueChainStage: true,
            ownershipType: true,
          },
        },
        contacts: {
          select: {
            id: true,
            name: true,
            role: true,
            email: true,
            organization: true,
            note: true,
          },
        },
        _count: {
          select: {
            documentRefs: true,
            relationshipsFrom: true,
            relationshipsTo: true,
          },
        },
      },
    })

    return sortActors(actors)
  } catch (error) {
    if (isMissingPrismaTable(error, 'Actor')) return []
    throw error
  }
}

export async function getActorBySlug(slug: string) {
  try {
    return await prisma.actor.findUnique({
      where: { slug },
      include: {
        company: {
          include: {
            financials: { orderBy: { year: 'desc' }, take: 1 },
            shareholders: { where: { isControlling: true } },
          },
        },
        contacts: {
          orderBy: [{ organization: 'asc' }, { name: 'asc' }],
        },
        documentRefs: {
          include: {
            document: {
              select: {
                id: true,
                slug: true,
                title: true,
                category: true,
                country: true,
              },
            },
          },
          orderBy: {
            document: {
              title: 'asc',
            },
          },
        },
        relationshipsFrom: {
          include: {
            toActor: {
              select: {
                id: true,
                slug: true,
                name: true,
                actorType: true,
                priorityTier: true,
              },
            },
          },
          orderBy: [{ relationType: 'asc' }, { toActor: { name: 'asc' } }],
        },
        relationshipsTo: {
          include: {
            fromActor: {
              select: {
                id: true,
                slug: true,
                name: true,
                actorType: true,
                priorityTier: true,
              },
            },
          },
          orderBy: [{ relationType: 'asc' }, { fromActor: { name: 'asc' } }],
        },
      },
    })
  } catch (error) {
    if (isMissingPrismaTable(error, 'Actor')) return null
    throw error
  }
}
