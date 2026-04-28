import { prisma } from '@/lib/db'
import { isMissingPrismaTable, isPrismaDataUnavailable } from './prisma-errors'

type CompanyQueryResult = Awaited<ReturnType<typeof runCompanyQuery>>

async function runCompanyQuery(opts: {
  valueChainStage?: string
  ownershipType?: string
  includeAll: boolean
  useExtendedRelations: boolean
}) {
  const { valueChainStage, ownershipType, includeAll, useExtendedRelations } = opts

  const baseOr = [
    { financials: { some: {} } },
    { boardMembers: { some: {} } },
    { shareholders: { some: {} } },
    { documentRefs: { some: {} } },
  ]

  const extendedOr = useExtendedRelations
    ? [
        { ownedProperties: { some: {} } },
        { tenantProperties: { some: {} } },
        { relationshipsFrom: { some: {} } },
        { relationshipsTo: { some: {} } },
        { childOf: { some: {} } },
        { parentOf: { some: {} } },
        { aquacultureSites: { some: {} } },
        { actor: { isNot: null } },
      ]
    : []

  const trackedOnly = !includeAll ? { OR: [...baseOr, ...extendedOr] } : {}

  const where = {
    ...(valueChainStage && { valueChainStage }),
    ...(ownershipType && { ownershipType }),
    ...trackedOnly,
  }

  const baseCount = {
    boardMembers: true,
    subsidies: true,
  } as const

  const extendedCount = useExtendedRelations
    ? ({
        ownedProperties: true,
        relationshipsFrom: true,
        relationshipsTo: true,
      } as const)
    : ({} as Record<string, never>)

  return prisma.company.findMany({
    where,
    include: {
      financials: { orderBy: { year: 'desc' }, take: 1 },
      shareholders: { where: { isControlling: true } },
      _count: {
        select: {
          ...baseCount,
          ...extendedCount,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

type NormalizedCompanyRow = CompanyQueryResult[number] & {
  _count: {
    boardMembers: number
    subsidies: number
    ownedProperties: number
    relationshipsFrom: number
    relationshipsTo: number
  }
}

function normalizeCompanyRow(row: CompanyQueryResult[number]): NormalizedCompanyRow {
  const rawCount = row._count as Partial<NormalizedCompanyRow['_count']>
  return {
    ...row,
    _count: {
      boardMembers: rawCount.boardMembers ?? 0,
      subsidies: rawCount.subsidies ?? 0,
      ownedProperties: rawCount.ownedProperties ?? 0,
      relationshipsFrom: rawCount.relationshipsFrom ?? 0,
      relationshipsTo: rawCount.relationshipsTo ?? 0,
    },
  }
}

export async function getCompanies(opts?: {
  valueChainStage?: string
  ownershipType?: string
  includeAll?: boolean
}): Promise<NormalizedCompanyRow[]> {
  const { valueChainStage, ownershipType, includeAll = false } = opts ?? {}

  try {
    const rows = await runCompanyQuery({
      valueChainStage,
      ownershipType,
      includeAll,
      useExtendedRelations: true,
    })
    return rows.map(normalizeCompanyRow)
  } catch (error) {
    const isMissing =
      isMissingPrismaTable(error, 'CompanyProperty') ||
      isMissingPrismaTable(error, 'BusinessRelationship') ||
      isMissingPrismaTable(error, 'CompanyOwnership') ||
      isMissingPrismaTable(error, 'AquacultureSite') ||
      isMissingPrismaTable(error, 'Actor')

    if (!isMissing && !isPrismaDataUnavailable(error)) throw error

    try {
      const rows = await runCompanyQuery({
        valueChainStage,
        ownershipType,
        includeAll,
        useExtendedRelations: false,
      })
      return rows.map(normalizeCompanyRow)
    } catch (retryError) {
      if (isPrismaDataUnavailable(retryError)) return []
      throw retryError
    }
  }
}

export async function getCompanyById(id: string) {
  const baseInclude = {
    financials: { orderBy: { year: 'desc' } },
    shareholders: { orderBy: { ownershipPct: 'desc' } },
    boardMembers: true,
    subsidies: { orderBy: { year: 'desc' } },
    documentRefs: {
      include: { document: { select: { id: true, title: true, slug: true } } },
    },
  } as const

  try {
    return await prisma.company.findUnique({
      where: { id },
      include: {
        ...baseInclude,
        ownedProperties: {
          include: { tenantCompany: { select: { id: true, name: true } } },
          orderBy: [{ propertyType: 'asc' }, { municipality: 'asc' }],
        },
        tenantProperties: {
          include: { company: { select: { id: true, name: true } } },
          orderBy: [{ propertyType: 'asc' }, { municipality: 'asc' }],
        },
        relationshipsFrom: {
          include: {
            toCompany: { select: { id: true, name: true } },
          },
          orderBy: [{ relationshipType: 'asc' }, { estimatedValue: 'desc' }],
        },
        relationshipsTo: {
          include: {
            fromCompany: { select: { id: true, name: true } },
          },
          orderBy: [{ relationshipType: 'asc' }, { estimatedValue: 'desc' }],
        },
      },
    })
  } catch (error) {
    const isMissing =
      isMissingPrismaTable(error, 'CompanyProperty') ||
      isMissingPrismaTable(error, 'BusinessRelationship')

    if (!isMissing && !isPrismaDataUnavailable(error)) throw error

    const base = await prisma.company.findUnique({
      where: { id },
      include: baseInclude,
    })
    if (!base) return null

    return {
      ...base,
      ownedProperties: [] as Array<{
        id: string
        propertyType: string
        address: string | null
        municipality: string | null
        county: string | null
        sqMeters: number | null
        selfLeased: boolean
        tenantCompany: { id: string; name: string } | null
      }>,
      tenantProperties: [] as Array<{
        id: string
        propertyType: string
        address: string | null
        municipality: string | null
        county: string | null
        sqMeters: number | null
        selfLeased: boolean
        company: { id: string; name: string }
      }>,
      relationshipsFrom: [] as Array<{
        id: string
        relationshipType: string
        fromCompanyId: string
        toCompanyId: string
        description: string | null
        estimatedValue: number | null
        toCompany: { id: string; name: string }
      }>,
      relationshipsTo: [] as Array<{
        id: string
        relationshipType: string
        fromCompanyId: string
        toCompanyId: string
        description: string | null
        estimatedValue: number | null
        fromCompany: { id: string; name: string }
      }>,
    }
  }
}

export async function getInterlockingDirectorates() {
  const allMembers = await prisma.boardMember.findMany({
    include: { company: { select: { id: true, name: true } } },
  })

  const byKey = new Map<string, typeof allMembers>()
  for (const m of allMembers) {
    const existing = byKey.get(m.personKey) ?? []
    existing.push(m)
    byKey.set(m.personKey, existing)
  }

  const interlocks = []
  for (const [personKey, members] of byKey) {
    if (members.length > 1) {
      interlocks.push({
        personKey,
        personName: members[0].personName,
        positions: members.map((m) => ({
          companyId: m.company.id,
          companyName: m.company.name,
          role: m.role,
        })),
      })
    }
  }

  return interlocks
}
