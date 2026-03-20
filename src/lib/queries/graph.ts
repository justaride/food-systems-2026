import { prisma } from '@/lib/db'
import { isMissingPrismaTable } from './prisma-errors'

export type GraphNode = {
  id: string
  label: string
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source' | 'actor' | 'person' | 'property'
  tags?: string[]
}

export type GraphEdge = {
  source: string
  target: string
  type: string
}

export type GraphData = {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export async function getDocumentGraph(id: string): Promise<GraphData> {
  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      tags: true,
      refsFrom: { include: { to: { select: { id: true, title: true, tags: true } } } },
      refsTo: { include: { from: { select: { id: true, title: true, tags: true } } } },
      insightDocumentRefs: { include: { insight: { select: { id: true, title: true, tags: true } } } },
      companyDocumentRefs: { include: { company: { select: { id: true, name: true } } } },
    },
  })

  if (!doc) return { nodes: [], edges: [] }

  const nodes: GraphNode[] = [
    { id: doc.id, label: doc.title, type: 'document', tags: doc.tags },
  ]
  const edges: GraphEdge[] = []
  const seen = new Set<string>([doc.id])

  for (const ref of doc.refsFrom) {
    if (!seen.has(ref.to.id)) {
      nodes.push({ id: ref.to.id, label: ref.to.title, type: 'document', tags: ref.to.tags })
      seen.add(ref.to.id)
    }
    edges.push({ source: doc.id, target: ref.to.id, type: ref.refType })
  }

  for (const ref of doc.refsTo) {
    if (!seen.has(ref.from.id)) {
      nodes.push({ id: ref.from.id, label: ref.from.title, type: 'document', tags: ref.from.tags })
      seen.add(ref.from.id)
    }
    edges.push({ source: ref.from.id, target: doc.id, type: ref.refType })
  }

  for (const ref of doc.insightDocumentRefs) {
    if (!seen.has(ref.insight.id)) {
      nodes.push({ id: ref.insight.id, label: ref.insight.title, type: 'insight', tags: ref.insight.tags })
      seen.add(ref.insight.id)
    }
    edges.push({ source: doc.id, target: ref.insight.id, type: 'insight-ref' })
  }

  for (const ref of doc.companyDocumentRefs) {
    if (!seen.has(ref.company.id)) {
      nodes.push({ id: ref.company.id, label: ref.company.name, type: 'company' })
      seen.add(ref.company.id)
    }
    edges.push({ source: doc.id, target: ref.company.id, type: 'company-ref' })
  }

  try {
    const actorRefs = await prisma.actorDocumentRef.findMany({
      where: { documentId: id },
      include: { actor: { select: { id: true, name: true, themeTags: true } } },
    })

    for (const ref of actorRefs) {
      if (!seen.has(ref.actor.id)) {
        nodes.push({ id: ref.actor.id, label: ref.actor.name, type: 'actor', tags: ref.actor.themeTags })
        seen.add(ref.actor.id)
      }
      edges.push({ source: doc.id, target: ref.actor.id, type: 'actor-ref' })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Actor')) throw error
  }

  return { nodes, edges }
}

export async function getFullGraph(): Promise<GraphData> {
  const [docs, docRefs, insightRefs, companyRefs, insights, theses, companies] = await Promise.all([
    prisma.document.findMany({ select: { id: true, title: true, tags: true } }),
    prisma.documentRef.findMany({ select: { fromId: true, toId: true, refType: true } }),
    prisma.insightDocumentRef.findMany({ select: { insightId: true, documentId: true } }),
    prisma.companyDocumentRef.findMany({ select: { companyId: true, documentId: true } }),
    prisma.insight.findMany({ select: { id: true, title: true, tags: true } }),
    prisma.thesis.findMany({
      where: { documentId: { not: null } },
      select: { id: true, title: true, tags: true, documentId: true },
    }),
    prisma.company.findMany({ select: { id: true, name: true } }),
  ])

  let actors: Array<{ id: string; name: string; themeTags: string[]; companyId: string | null }> = []
  let actorRefs: Array<{ actorId: string; documentId: string }> = []
  let actorRelationships: Array<{ fromActorId: string; toActorId: string; relationType: string }> = []

  try {
    ;[actors, actorRefs, actorRelationships] = await Promise.all([
      prisma.actor.findMany({
        select: {
          id: true,
          name: true,
          themeTags: true,
          companyId: true,
        },
      }),
      prisma.actorDocumentRef.findMany({ select: { actorId: true, documentId: true } }),
      prisma.actorRelationship.findMany({
        select: { fromActorId: true, toActorId: true, relationType: true },
      }),
    ])
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Actor')) throw error
  }

  const [ownershipEdges, bizRelEdges, personProfiles, properties] = await Promise.all([
    prisma.companyOwnership.findMany({
      select: { parentCompanyId: true, childCompanyId: true, ownershipType: true },
    }),
    prisma.businessRelationship.findMany({
      select: { fromCompanyId: true, toCompanyId: true, relationshipType: true },
    }),
    prisma.personProfile.findMany({
      select: { id: true, name: true, tags: true, roles: true },
    }),
    prisma.companyProperty.findMany({
      select: { id: true, companyId: true, propertyType: true, municipality: true, selfLeased: true, tenantCompanyId: true },
    }),
  ])

  const companyIdSet = new Set(companies.map(c => c.id))

  const nodes: GraphNode[] = [
    ...docs.map(d => ({ id: d.id, label: d.title, type: 'document' as const, tags: d.tags })),
    ...insights.map(i => ({ id: i.id, label: i.title, type: 'insight' as const, tags: i.tags })),
    ...theses.map(t => ({ id: t.id, label: t.title, type: 'thesis' as const, tags: t.tags })),
    ...companies.map(c => ({ id: c.id, label: c.name, type: 'company' as const })),
    ...actors.map(a => ({ id: a.id, label: a.name, type: 'actor' as const, tags: a.themeTags })),
    ...personProfiles.map(p => ({ id: p.id, label: p.name, type: 'person' as const, tags: p.tags })),
    ...properties.map(p => ({
      id: p.id,
      label: `${p.propertyType}${p.municipality ? ` (${p.municipality})` : ''}`,
      type: 'property' as const,
      tags: [p.propertyType, ...(p.selfLeased ? ['self-leased'] : [])],
    })),
  ]

  const personEdges: GraphEdge[] = personProfiles.flatMap(p => {
    const roles = p.roles as Array<{ companyId?: string }>
    return roles
      .filter(r => r.companyId && companyIdSet.has(r.companyId))
      .map(r => ({ source: p.id, target: r.companyId!, type: 'person-role' }))
  })

  const edges: GraphEdge[] = [
    ...docRefs.map(r => ({ source: r.fromId, target: r.toId, type: r.refType })),
    ...insightRefs.map(r => ({ source: r.documentId, target: r.insightId, type: 'insight-ref' })),
    ...companyRefs.map(r => ({ source: r.documentId, target: r.companyId, type: 'company-ref' })),
    ...actorRefs.map(r => ({ source: r.documentId, target: r.actorId, type: 'actor-ref' })),
    ...actorRelationships.map(r => ({ source: r.fromActorId, target: r.toActorId, type: r.relationType })),
    ...actors
      .filter(a => a.companyId)
      .map(a => ({ source: a.id, target: a.companyId!, type: 'company-link' })),
    ...theses
      .filter(t => t.documentId)
      .map(t => ({ source: t.documentId!, target: t.id, type: 'thesis-doc' })),
    ...ownershipEdges.map(r => ({ source: r.parentCompanyId, target: r.childCompanyId, type: r.ownershipType })),
    ...bizRelEdges.map(r => ({ source: r.fromCompanyId, target: r.toCompanyId, type: r.relationshipType })),
    ...personEdges,
    ...properties.map(p => ({ source: p.companyId, target: p.id, type: 'owns-property' })),
    ...properties
      .filter(p => p.tenantCompanyId)
      .map(p => ({ source: p.tenantCompanyId!, target: p.id, type: 'leases-property' })),
  ]

  return { nodes, edges }
}

export async function getRelatedEntities(id: string, type: 'document' | 'insight' | 'company' | 'actor') {
  if (type === 'document') {
    const refs = await prisma.documentRef.findMany({
      where: { OR: [{ fromId: id }, { toId: id }] },
      include: {
        from: { select: { id: true, title: true, slug: true } },
        to: { select: { id: true, title: true, slug: true } },
      },
    })
    return refs.map(r => r.fromId === id ? r.to : r.from)
  }

  if (type === 'insight') {
    const refs = await prisma.insightDocumentRef.findMany({
      where: { insightId: id },
      include: { document: { select: { id: true, title: true, slug: true } } },
    })
    return refs.map(r => r.document)
  }

  if (type === 'company') {
    const refs = await prisma.companyDocumentRef.findMany({
      where: { companyId: id },
      include: { document: { select: { id: true, title: true, slug: true } } },
    })
    return refs.map(r => r.document)
  }

  if (type === 'actor') {
    try {
      const [docs, outgoing, incoming] = await Promise.all([
        prisma.actorDocumentRef.findMany({
          where: { actorId: id },
          include: { document: { select: { id: true, title: true, slug: true } } },
        }),
        prisma.actorRelationship.findMany({
          where: { fromActorId: id },
          include: { toActor: { select: { id: true, name: true, slug: true } } },
        }),
        prisma.actorRelationship.findMany({
          where: { toActorId: id },
          include: { fromActor: { select: { id: true, name: true, slug: true } } },
        }),
      ])

      return [
        ...docs.map(ref => ref.document),
        ...outgoing.map(ref => ref.toActor),
        ...incoming.map(ref => ref.fromActor),
      ]
    } catch (error) {
      if (isMissingPrismaTable(error, 'Actor')) return []
      throw error
    }
  }

  return []
}
