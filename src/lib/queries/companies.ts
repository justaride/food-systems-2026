import { prisma } from '@/lib/db'

export async function getCompanies(opts?: {
  valueChainStage?: string
  ownershipType?: string
  includeAll?: boolean
}) {
  const { valueChainStage, ownershipType, includeAll = false } = opts ?? {}

  const trackedOnly = !includeAll
    ? {
        OR: [
          { financials: { some: {} } },
          { boardMembers: { some: {} } },
          { shareholders: { some: {} } },
          { ownedProperties: { some: {} } },
          { tenantProperties: { some: {} } },
          { relationshipsFrom: { some: {} } },
          { relationshipsTo: { some: {} } },
          { childOf: { some: {} } },
          { parentOf: { some: {} } },
          { aquacultureSites: { some: {} } },
          { actor: { isNot: null } },
        ],
      }
    : {}

  const where = {
    ...(valueChainStage && { valueChainStage }),
    ...(ownershipType && { ownershipType }),
    ...trackedOnly,
  }

  return prisma.company.findMany({
    where,
    include: {
      financials: { orderBy: { year: 'desc' }, take: 1 },
      shareholders: { where: { isControlling: true } },
      _count: {
        select: {
          boardMembers: true,
          subsidies: true,
          ownedProperties: true,
          relationshipsFrom: true,
          relationshipsTo: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })
}

export async function getCompanyById(id: string) {
  return prisma.company.findUnique({
    where: { id },
    include: {
      financials: { orderBy: { year: 'desc' } },
      shareholders: { orderBy: { ownershipPct: 'desc' } },
      boardMembers: true,
      subsidies: { orderBy: { year: 'desc' } },
      documentRefs: {
        include: { document: { select: { id: true, title: true, slug: true } } },
      },
      ownedProperties: {
        include: { tenantCompany: { select: { id: true, name: true } } },
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
