import { prisma } from '@/lib/db'
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
  persons: {
    personKey: string
    personName: string
    positions: {
      companyId: string
      companyName: string
      role: string
      sector: SectorKey
    }[]
    sectors: SectorKey[]
  }[]
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

export async function getInterlockGraph(): Promise<InterlockGraphData> {
  const allMembers = await prisma.boardMember.findMany({
    include: { company: { select: { id: true, name: true, valueChainStage: true } } },
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
      interlocks.push({
        personKey,
        personName: members[0].personName,
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
    persons: interlocks,
  }
}
