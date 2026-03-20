import { prisma } from '@/lib/db'

type InterlockNode = {
  id: string
  label: string
  type: 'company' | 'person'
  val: number
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
}

export type InterlockGraphData = {
  nodes: InterlockNode[]
  edges: InterlockEdge[]
  stats: InterlockStats
  persons: {
    personKey: string
    personName: string
    positions: { companyId: string; companyName: string; role: string }[]
  }[]
}

export async function getInterlockGraph(): Promise<InterlockGraphData> {
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
        positions: members.map(m => ({
          companyId: m.company.id,
          companyName: m.company.name,
          role: m.role,
        })),
      })
    }
  }

  const companyIds = new Set<string>()
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
        nodes.push({
          id: `company-${pos.companyId}`,
          label: pos.companyName,
          type: 'company',
          val: 8,
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

  const personCounts = interlocks.map(i => ({ name: i.personName, count: i.positions.length }))
  const companyCounts = [...companyConnections.entries()].map(([id, count]) => ({
    name: nodes.find(n => n.id === id)?.label ?? '',
    count,
  }))

  return {
    nodes,
    edges,
    stats: {
      totalInterlocks: interlocks.length,
      mostConnectedPerson: personCounts.sort((a, b) => b.count - a.count)[0] ?? null,
      mostConnectedCompany: companyCounts.sort((a, b) => b.count - a.count)[0] ?? null,
      companiesInvolved: companyIds.size,
    },
    persons: interlocks,
  }
}
