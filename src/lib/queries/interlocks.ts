import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'
import { sectorFromValueChainStage, type SectorKey } from '@/lib/sector'

type InterlockNode = {
  id: string
  label: string
  type: 'company' | 'person'
  val: number
  sector?: SectorKey
}

type InterlockEdge = {
  source: string
  target: string
  role: string
}

type InterlockStats = {
  totalInterlocks: number
  mostConnectedPerson: { name: string; count: number } | null
  mostConnectedCompany: { name: string; count: number } | null
  companiesInvolved: number
  crossSectorPersons: number
}

export type InterlockGraphData = {
  nodes: InterlockNode[]
  edges: InterlockEdge[]
  stats: InterlockStats
  companyMetrics: {
    companyId: string
    latestRevenueNok: number | null
    latestRevenueYear: number | null
    subsidyTotalNok: number
    ownershipLinkCount: number
  }[]
  persons: {
    personKey: string
    personName: string
    roleCount: number
    companyCount: number
    sectorCount: number
    interlockScore: number
    positions: {
      companyId: string
      companyName: string
      role: string
      sector: SectorKey
    }[]
    sectors: SectorKey[]
  }[]
}

export type CompanyInterlockSummary = {
  companyId: string
  interlockScore: number
  interlockingMembers: number
  crossSectorMembers: number
  connectedCompanies: number
  memberScores: {
    personKey: string
    personName: string
    role: string
    otherCompanyCount: number
    sectorCount: number
    interlockScore: number
  }[]
}

function calculatePersonInterlockScore(roleCount: number, companyCount: number, sectorCount: number): number {
  const extraRoles = Math.max(0, roleCount - companyCount)
  const sectorBridgeBonus = Math.max(0, sectorCount - 1) * 2
  return companyCount + extraRoles + sectorBridgeBonus
}

export async function getInterlockCountsForCompany(
  companyId: string,
): Promise<Map<string, number>> {
  const localMembers = await prisma.boardMember.findMany({
    where: { companyId },
    select: { personKey: true },
  })
  if (localMembers.length === 0) return new Map()

  const personKeys = [...new Set(localMembers.map(m => m.personKey))]
  const allRoles = await prisma.boardMember.findMany({
    where: { personKey: { in: personKeys } },
    select: { personKey: true, companyId: true },
  })

  const otherCompaniesByPerson = new Map<string, Set<string>>()
  for (const role of allRoles) {
    if (role.companyId === companyId) continue
    const set = otherCompaniesByPerson.get(role.personKey) ?? new Set<string>()
    set.add(role.companyId)
    otherCompaniesByPerson.set(role.personKey, set)
  }

  return new Map(
    personKeys.map(key => [key, otherCompaniesByPerson.get(key)?.size ?? 0]),
  )
}

export async function getInterlockSummaryForCompany(companyId: string): Promise<CompanyInterlockSummary> {
  const localMembers = await prisma.boardMember.findMany({
    where: { companyId },
    select: { personKey: true, personName: true, role: true },
  })
  if (localMembers.length === 0) {
    return {
      companyId,
      interlockScore: 0,
      interlockingMembers: 0,
      crossSectorMembers: 0,
      connectedCompanies: 0,
      memberScores: [],
    }
  }

  const personKeys = [...new Set(localMembers.map(member => member.personKey))]
  const allRoles = await prisma.boardMember.findMany({
    where: { personKey: { in: personKeys } },
    include: { company: { select: { id: true, name: true, valueChainStage: true } } },
  })

  const rolesByPerson = new Map<string, typeof allRoles>()
  for (const role of allRoles) {
    const existing = rolesByPerson.get(role.personKey) ?? []
    existing.push(role)
    rolesByPerson.set(role.personKey, existing)
  }

  const connectedCompanyIds = new Set<string>()
  let interlockingMembers = 0
  let crossSectorMembers = 0

  const memberScores = localMembers.map(member => {
    const roles = rolesByPerson.get(member.personKey) ?? []
    const companyIds = new Set(roles.map(role => role.companyId))
    const sectors = new Set(roles.map(role => sectorFromValueChainStage(role.company.valueChainStage)))
    const otherCompanyCount = [...companyIds].filter(id => id !== companyId).length

    for (const id of companyIds) {
      if (id !== companyId) connectedCompanyIds.add(id)
    }
    if (otherCompanyCount > 0) interlockingMembers += 1
    if (sectors.size > 1) crossSectorMembers += 1

    return {
      personKey: member.personKey,
      personName: member.personName,
      role: member.role,
      otherCompanyCount,
      sectorCount: sectors.size,
      interlockScore: calculatePersonInterlockScore(roles.length, companyIds.size, sectors.size),
    }
  })

  return {
    companyId,
    interlockScore: interlockingMembers + connectedCompanyIds.size + crossSectorMembers * 2,
    interlockingMembers,
    crossSectorMembers,
    connectedCompanies: connectedCompanyIds.size,
    memberScores,
  }
}

export async function getInterlockGraph(): Promise<InterlockGraphData> {
  const allMembers = await prisma.boardMember.findMany({
    include: {
      company: {
        select: {
          id: true,
          name: true,
          valueChainStage: true,
          financials: {
            orderBy: { year: 'desc' },
            take: 1,
            select: { year: true, revenueNok: true, source: true },
          },
          _count: {
            select: {
              parentOf: true,
              childOf: true,
            },
          },
        },
      },
    },
  })

  const byKey = new Map<string, typeof allMembers>()
  for (const m of allMembers) {
    const existing = byKey.get(m.personKey) ?? []
    existing.push(m)
    byKey.set(m.personKey, existing)
  }

  const interlocks: InterlockGraphData['persons'] = []
  for (const [personKey, members] of byKey) {
    if (members.length > 1) {
      const positions = members.map((m) => ({
        companyId: m.company.id,
        companyName: m.company.name,
        role: m.role,
        sector: sectorFromValueChainStage(m.company.valueChainStage),
      }))
      const sectors = [...new Set(positions.map((p) => p.sector))]
      const companyCount = new Set(positions.map((p) => p.companyId)).size
      interlocks.push({
        personKey,
        personName: members[0].personName,
        roleCount: positions.length,
        companyCount,
        sectorCount: sectors.length,
        interlockScore: calculatePersonInterlockScore(positions.length, companyCount, sectors.length),
        positions,
        sectors,
      })
    }
  }

  const companyIds = new Set<string>()
  const companySectorById = new Map<string, SectorKey>()
  const nodes: InterlockNode[] = []
  const edges: InterlockEdge[] = []

  for (const interlock of interlocks) {
    nodes.push({
      id: `person-${interlock.personKey}`,
      label: interlock.personName,
      type: 'person',
      val: interlock.positions.length * 2,
    })

    for (const pos of interlock.positions) {
      if (!companyIds.has(pos.companyId)) {
        companyIds.add(pos.companyId)
        companySectorById.set(pos.companyId, pos.sector)
        nodes.push({
          id: `company-${pos.companyId}`,
          label: pos.companyName,
          type: 'company',
          val: 8,
          sector: pos.sector,
        })
      }
      edges.push({
        source: `person-${interlock.personKey}`,
        target: `company-${pos.companyId}`,
        role: pos.role,
      })
    }
  }

  const companyConnections = new Map<string, number>()
  for (const e of edges) {
    const target = typeof e.target === 'string' ? e.target : (e.target as any).id
    companyConnections.set(target, (companyConnections.get(target) ?? 0) + 1)
  }
  for (const node of nodes) {
    if (node.type === 'company') {
      node.val = (companyConnections.get(node.id) ?? 1) * 3
    }
  }

  const personCounts = interlocks.map((i) => ({ name: i.personName, count: i.positions.length }))
  const companyCounts = [...companyConnections.entries()].map(([id, count]) => ({
    name: nodes.find((n) => n.id === id)?.label ?? '',
    count,
  }))
  const crossSectorPersons = interlocks.filter((i) => i.sectors.length > 1).length
  const companiesById = new Map(allMembers.map(member => [member.company.id, member.company]))
  const subsidyRows = await prisma.subsidy.groupBy({
    by: ['companyId'],
    where: { companyId: { in: [...companiesById.keys()] } },
    _sum: { amountNok: true },
  })
  const subsidyTotalByCompany = new Map(
    subsidyRows.map(row => [row.companyId, Number(row._sum.amountNok ?? 0)])
  )
  const companyMetrics = [...companiesById.values()].map(company => {
    const latestFinancial = company.financials[0]
    return {
      companyId: company.id,
      latestRevenueNok: financialAmountToNok(latestFinancial?.revenueNok, latestFinancial?.source),
      latestRevenueYear: latestFinancial?.year ?? null,
      subsidyTotalNok: subsidyTotalByCompany.get(company.id) ?? 0,
      ownershipLinkCount: company._count.parentOf + company._count.childOf,
    }
  })

  return {
    nodes,
    edges,
    stats: {
      totalInterlocks: interlocks.length,
      mostConnectedPerson: personCounts.sort((a, b) => b.count - a.count)[0] ?? null,
      mostConnectedCompany: companyCounts.sort((a, b) => b.count - a.count)[0] ?? null,
      companiesInvolved: companyIds.size,
      crossSectorPersons,
    },
    companyMetrics,
    persons: interlocks,
  }
}
