import { prisma } from '@/lib/db'

type OwnershipNode = {
  id: string
  name: string
  orgNr: string
  ownershipType: string | null
  valueChainStage: string | null
  isSynthetic?: boolean
}

type OwnershipEdge = {
  parentId: string
  childId: string
  ownershipPct: number | null
  ownershipType: string
}

export type OwnershipTree = {
  rootId: string
  rootName: string
  nodes: OwnershipNode[]
  edges: OwnershipEdge[]
}

export type OwnershipMapData = {
  trees: OwnershipTree[]
  totalCompanies: number
  totalRelationships: number
}

export async function getOwnershipMap(): Promise<OwnershipMapData> {
  const [ownerships, companies] = await Promise.all([
    prisma.companyOwnership.findMany({
      include: {
        parentCompany: { select: { id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true } },
        childCompany: { select: { id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true } },
      },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { parentOf: { some: {} } },
          { childOf: { some: {} } },
        ],
      },
      select: {
        id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true,
        shareholders: { where: { isControlling: true }, select: { name: true, ownershipPct: true } },
      },
    }),
  ])

  const childToParent = new Map<string, string>()
  for (const o of ownerships) {
    childToParent.set(o.childCompanyId, o.parentCompanyId)
  }

  const roots = new Set<string>()
  for (const o of ownerships) {
    let parent = o.parentCompanyId
    while (childToParent.has(parent)) {
      parent = childToParent.get(parent)!
    }
    roots.add(parent)
  }

  const trees: OwnershipTree[] = []
  for (const rootId of roots) {
    const company = companies.find(c => c.id === rootId)
    if (!company) continue

    const treeNodes: OwnershipNode[] = []
    const treeEdges: OwnershipEdge[] = []
    const visited = new Set<string>()

    const controllingShareholder = company.shareholders[0]
    if (controllingShareholder) {
      const syntheticId = `shareholder-${rootId}`
      treeNodes.push({
        id: syntheticId,
        name: `${controllingShareholder.name} ${controllingShareholder.ownershipPct ? Number(controllingShareholder.ownershipPct) + '%' : ''}`,
        orgNr: '',
        ownershipType: null,
        valueChainStage: null,
        isSynthetic: true,
      })
      treeEdges.push({
        parentId: syntheticId,
        childId: rootId,
        ownershipPct: controllingShareholder.ownershipPct ? Number(controllingShareholder.ownershipPct) : null,
        ownershipType: 'subsidiary',
      })
    }

    const queue = [rootId]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      const comp = companies.find(c => c.id === current)
      if (comp) {
        treeNodes.push({
          id: comp.id,
          name: comp.name,
          orgNr: comp.orgNr,
          ownershipType: comp.ownershipType,
          valueChainStage: comp.valueChainStage,
        })
      }

      const children = ownerships.filter(o => o.parentCompanyId === current)
      for (const child of children) {
        treeEdges.push({
          parentId: current,
          childId: child.childCompanyId,
          ownershipPct: child.ownershipPct,
          ownershipType: child.ownershipType,
        })
        queue.push(child.childCompanyId)
      }
    }

    trees.push({
      rootId: controllingShareholder ? `shareholder-${rootId}` : rootId,
      rootName: company.name,
      nodes: treeNodes,
      edges: treeEdges,
    })
  }

  return {
    trees: trees.sort((a, b) => b.nodes.length - a.nodes.length),
    totalCompanies: new Set(ownerships.flatMap(o => [o.parentCompanyId, o.childCompanyId])).size,
    totalRelationships: ownerships.length,
  }
}

export async function getCompanyTreeIds(): Promise<Set<string>> {
  const ownerships = await prisma.companyOwnership.findMany({
    select: { parentCompanyId: true, childCompanyId: true },
  })
  return new Set(ownerships.flatMap(o => [o.parentCompanyId, o.childCompanyId]))
}
