import { prisma } from '@/lib/db'
import { actorRelationshipGraphEdge } from '@/lib/actor-relationship-graph'
import { buildBoardMemberGraphArtifacts } from '@/lib/graph-board-members'
import { inferGraphConfidence, isBlockedExternalGraphSource, structuralGraphConfidence } from '@/lib/graph-confidence'
import { isMissingPrismaTable } from './prisma-errors'

export type GraphNode = {
  id: string
  label: string
  type: 'document' | 'insight' | 'thesis' | 'company' | 'source' | 'actor' | 'person' | 'property'
  tags?: string[]
  href?: string
}

export type GraphEdge = {
  source: string
  target: string
  type: string
  confidence?: number // 0..1 — omitted when unknown
  sourceLabel?: string // provenance label, e.g. "brreg", "inferred", "manual"
  href?: string
}

export type DuplicateGroup = {
  key: string
  label: string
  ids: string[]
}

export type GraphQualityReport = {
  companyNameDuplicates: DuplicateGroup[]
  companyOrgNrDuplicates: DuplicateGroup[]
  personNameDuplicates: DuplicateGroup[]
  personKeyDuplicates: DuplicateGroup[]
  businessRelationshipDuplicates: DuplicateGroup[]
  orphanBoardMembers: Array<{ companyId: string; companyName: string; personKey: string; personName: string }>
  boardMemberProfileGaps: Array<{ companyId: string; companyName: string; personKey: string; personName: string }>
  edgeConfidenceCoverage: {
    totalEdges: number
    withConfidence: number
    withoutConfidence: number
  }
}

export type GraphData = {
  nodes: GraphNode[]
  edges: GraphEdge[]
  quality?: GraphQualityReport
}

function normalizeCompanyName(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+(as|asa|sa|ba|ans|da)\b\.?$/i, '')
    .replace(/[.,]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizePersonName(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s+/g, ' ')
}

function groupBy<T>(items: T[], keyFn: (item: T) => string | null | undefined): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    if (!key) continue
    const bucket = map.get(key)
    if (bucket) bucket.push(item)
    else map.set(key, [item])
  }
  return map
}

function structuralEdge(source: string, target: string, type: string): GraphEdge {
  const { confidence, sourceLabel } = structuralGraphConfidence(type)
  return {
    source,
    target,
    type,
    ...(confidence !== undefined ? { confidence } : {}),
    ...(sourceLabel ? { sourceLabel } : {}),
  }
}

export async function getDocumentGraph(id: string): Promise<GraphData> {
  const doc = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      tags: true,
      refsFrom: { include: { to: { select: { id: true, slug: true, title: true, tags: true } } } },
      refsTo: { include: { from: { select: { id: true, slug: true, title: true, tags: true } } } },
      insightDocumentRefs: { include: { insight: { select: { id: true, title: true, tags: true } } } },
      companyDocumentRefs: { include: { company: { select: { id: true, name: true } } } },
    },
  })

  if (!doc) return { nodes: [], edges: [] }

  const nodes: GraphNode[] = [
    { id: doc.id, label: doc.title, type: 'document', tags: doc.tags, href: `/bibliotek/${doc.slug}` },
  ]
  const edges: GraphEdge[] = []
  const seen = new Set<string>([doc.id])

  for (const ref of doc.refsFrom) {
    if (!seen.has(ref.to.id)) {
      nodes.push({
        id: ref.to.id,
        label: ref.to.title,
        type: 'document',
        tags: ref.to.tags,
        href: `/bibliotek/${ref.to.slug}`,
      })
      seen.add(ref.to.id)
    }
    edges.push(structuralEdge(doc.id, ref.to.id, ref.refType))
  }

  for (const ref of doc.refsTo) {
    if (!seen.has(ref.from.id)) {
      nodes.push({
        id: ref.from.id,
        label: ref.from.title,
        type: 'document',
        tags: ref.from.tags,
        href: `/bibliotek/${ref.from.slug}`,
      })
      seen.add(ref.from.id)
    }
    edges.push(structuralEdge(ref.from.id, doc.id, ref.refType))
  }

  for (const ref of doc.insightDocumentRefs) {
    if (!seen.has(ref.insight.id)) {
      nodes.push({
        id: ref.insight.id,
        label: ref.insight.title,
        type: 'insight',
        tags: ref.insight.tags,
        href: `/innsikt#${ref.insight.id}`,
      })
      seen.add(ref.insight.id)
    }
    edges.push(structuralEdge(doc.id, ref.insight.id, 'insight-ref'))
  }

  for (const ref of doc.companyDocumentRefs) {
    if (!seen.has(ref.company.id)) {
      nodes.push({ id: ref.company.id, label: ref.company.name, type: 'company', href: `/selskap/${ref.company.id}` })
      seen.add(ref.company.id)
    }
    edges.push(structuralEdge(doc.id, ref.company.id, 'company-ref'))
  }

  try {
    const actorRefs = await prisma.actorDocumentRef.findMany({
      where: { documentId: id },
      include: { actor: { select: { id: true, slug: true, name: true, themeTags: true } } },
    })

    for (const ref of actorRefs) {
      if (!seen.has(ref.actor.id)) {
        nodes.push({
          id: ref.actor.id,
          label: ref.actor.name,
          type: 'actor',
          tags: ref.actor.themeTags,
          href: `/aktorer/${ref.actor.slug}`,
        })
        seen.add(ref.actor.id)
      }
      edges.push(structuralEdge(doc.id, ref.actor.id, 'actor-ref'))
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Actor')) throw error
  }

  return { nodes, edges }
}

export async function getFullGraph(): Promise<GraphData> {
  const [docs, docRefs, insightRefs, companyRefs, insights, theses, companies] = await Promise.all([
    prisma.document.findMany({ select: { id: true, slug: true, title: true, tags: true } }),
    prisma.documentRef.findMany({ select: { fromId: true, toId: true, refType: true } }),
    prisma.insightDocumentRef.findMany({ select: { insightId: true, documentId: true } }),
    prisma.companyDocumentRef.findMany({ select: { companyId: true, documentId: true } }),
    prisma.insight.findMany({ select: { id: true, title: true, tags: true } }),
    prisma.thesis.findMany({
      where: { documentId: { not: null } },
      select: { id: true, title: true, tags: true, documentId: true },
    }),
    prisma.company.findMany({ select: { id: true, name: true, orgNr: true } }),
  ])

  let actors: Array<{ id: string; slug: string; name: string; themeTags: string[]; companyId: string | null }> = []
  let actorRefs: Array<{ actorId: string; documentId: string }> = []
  let actorRelationships: Array<{
    fromActorId: string
    toActorId: string
    relationType: string
    source: string | null
    metadata: unknown
  }> = []

  try {
    ;[actors, actorRefs, actorRelationships] = await Promise.all([
      prisma.actor.findMany({
        select: {
          id: true,
          slug: true,
          name: true,
          themeTags: true,
          companyId: true,
        },
      }),
      prisma.actorDocumentRef.findMany({ select: { actorId: true, documentId: true } }),
      prisma.actorRelationship.findMany({
        select: { fromActorId: true, toActorId: true, relationType: true, source: true, metadata: true },
      }),
    ])
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Actor')) throw error
  }

  const [ownershipEdges, bizRelEdges, personProfiles, properties, boardMembers] = await Promise.all([
    prisma.companyOwnership.findMany({
      select: {
        parentCompanyId: true,
        childCompanyId: true,
        ownershipType: true,
        source: true,
        metadata: true,
      },
    }),
    prisma.businessRelationship.findMany({
      select: {
        id: true,
        fromCompanyId: true,
        toCompanyId: true,
        relationshipType: true,
        source: true,
        metadata: true,
      },
    }),
    prisma.personProfile.findMany({
      select: { id: true, name: true, personKey: true, tags: true, roles: true },
    }),
    prisma.companyProperty.findMany({
      select: { id: true, companyId: true, propertyType: true, municipality: true, selfLeased: true, tenantCompanyId: true, source: true, metadata: true },
    }),
    prisma.boardMember.findMany({
      select: {
        id: true,
        companyId: true,
        personKey: true,
        personName: true,
        role: true,
        source: true,
        sourceUrl: true,
        verifiedAt: true,
      },
    }).catch((error) => {
      if (isMissingPrismaTable(error, 'BoardMember')) return []
      throw error
    }),
  ])

  const companyIdSet = new Set(companies.map(c => c.id))
  const publicOwnershipEdges = ownershipEdges.filter((edge) => !isBlockedExternalGraphSource(edge.source))
  const publicBizRelEdges = bizRelEdges.filter((edge) => !isBlockedExternalGraphSource(edge.source))
  const publicProperties = properties.filter((property) => !isBlockedExternalGraphSource(property.source))
  const companyById = new Map(companies.map(c => [c.id, c]))
  const boardMemberGraph = buildBoardMemberGraphArtifacts({
    boardMembers,
    personProfiles,
    companyIds: companyIdSet,
    companyNamesById: new Map(companies.map((company) => [company.id, company.name])),
  })

  const nodes: GraphNode[] = [
    ...docs.map(d => ({
      id: d.id,
      label: d.title,
      type: 'document' as const,
      tags: d.tags,
      href: `/bibliotek/${d.slug}`,
    })),
    ...insights.map(i => ({
      id: i.id,
      label: i.title,
      type: 'insight' as const,
      tags: i.tags,
      href: `/innsikt#${i.id}`,
    })),
    ...theses.map(t => ({
      id: t.id,
      label: t.title,
      type: 'thesis' as const,
      tags: t.tags,
      href: `/masteroppgaver#${t.id}`,
    })),
    ...companies.map(c => ({ id: c.id, label: c.name, type: 'company' as const, href: `/selskap/${c.id}` })),
    ...actors.map(a => ({
      id: a.id,
      label: a.name,
      type: 'actor' as const,
      tags: a.themeTags,
      href: `/aktorer/${a.slug}`,
    })),
    ...personProfiles.map(p => ({
      id: p.id,
      label: p.name,
      type: 'person' as const,
      tags: p.tags,
      href: `/personer/${encodeURIComponent(p.personKey)}`,
    })),
    ...boardMemberGraph.fallbackPersonNodes,
    ...publicProperties.map(p => ({
      id: p.id,
      label: `${p.propertyType}${p.municipality ? ` (${p.municipality})` : ''}`,
      type: 'property' as const,
      tags: [p.propertyType, ...(p.selfLeased ? ['self-leased'] : [])],
      href: `/eiendommer#${p.id}`,
    })),
  ]

  const personEdges: GraphEdge[] = personProfiles.flatMap(p => {
    const roles = p.roles as Array<{ companyId?: string }>
    return roles
      .filter(r => r.companyId && companyIdSet.has(r.companyId))
      .map(r => structuralEdge(p.id, r.companyId!, 'person-role'))
  })

  const edges: GraphEdge[] = [
    ...docRefs.map(r => structuralEdge(r.fromId, r.toId, r.refType)),
    ...insightRefs.map(r => structuralEdge(r.documentId, r.insightId, 'insight-ref')),
    ...companyRefs.map(r => structuralEdge(r.documentId, r.companyId, 'company-ref')),
    ...actorRefs.map(r => structuralEdge(r.documentId, r.actorId, 'actor-ref')),
    ...actorRelationships.map(actorRelationshipGraphEdge),
    ...actors
      .filter(a => a.companyId)
      .map(a => structuralEdge(a.id, a.companyId!, 'company-link')),
    ...theses
      .filter(t => t.documentId)
      .map(t => structuralEdge(t.documentId!, t.id, 'thesis-doc')),
    ...publicOwnershipEdges.map((r) => {
      const { confidence, sourceLabel } = inferGraphConfidence(r.metadata, r.source)
      return {
        source: r.parentCompanyId,
        target: r.childCompanyId,
        type: r.ownershipType,
        ...(confidence !== undefined ? { confidence } : {}),
        ...(sourceLabel ? { sourceLabel } : {}),
      }
    }),
    ...publicBizRelEdges.map((r) => {
      const { confidence, sourceLabel } = inferGraphConfidence(r.metadata, r.source)
      return {
        source: r.fromCompanyId,
        target: r.toCompanyId,
        type: r.relationshipType,
        ...(confidence !== undefined ? { confidence } : {}),
        ...(sourceLabel ? { sourceLabel } : {}),
        href: `/forsyningskjede?relationship=${encodeURIComponent(r.id)}`,
      }
    }),
    ...personEdges,
    ...boardMemberGraph.edges,
    ...publicProperties.map((p) => {
      const { confidence, sourceLabel } = inferGraphConfidence(p.metadata, p.source)
      return {
        source: p.companyId,
        target: p.id,
        type: 'owns-property',
        ...(confidence !== undefined ? { confidence } : {}),
        ...(sourceLabel ? { sourceLabel } : {}),
      }
    }),
    ...publicProperties
      .filter(p => p.tenantCompanyId)
      .map((p) => {
        const { confidence, sourceLabel } = inferGraphConfidence(p.metadata, p.source)
        return {
          source: p.tenantCompanyId!,
          target: p.id,
          type: 'leases-property',
          ...(confidence !== undefined ? { confidence } : {}),
          ...(sourceLabel ? { sourceLabel } : {}),
        }
      }),
  ]

  // ─── Quality analysis ──────────────────────────────────────────────
  const companyNameGroups = groupBy(companies, (c) => normalizeCompanyName(c.name))
  const companyNameDuplicates: DuplicateGroup[] = [...companyNameGroups.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([key, v]) => ({ key, label: v[0].name, ids: v.map(c => c.id) }))

  const companyOrgNrGroups = groupBy(companies, (c) => c.orgNr?.trim() || null)
  const companyOrgNrDuplicates: DuplicateGroup[] = [...companyOrgNrGroups.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([key, v]) => ({ key, label: `${v[0].name} (orgNr ${key})`, ids: v.map(c => c.id) }))

  const personNameGroups = groupBy(personProfiles, (p) => normalizePersonName(p.name))
  const personNameDuplicates: DuplicateGroup[] = [...personNameGroups.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([key, v]) => ({ key, label: v[0].name, ids: v.map(p => p.id) }))

  const personKeyGroups = groupBy(personProfiles, (p) => p.personKey?.trim() || null)
  const personKeyDuplicates: DuplicateGroup[] = [...personKeyGroups.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([key, v]) => ({ key, label: `${v[0].name} (key ${key})`, ids: v.map(p => p.id) }))

  const bizRelGroups = groupBy(
    publicBizRelEdges,
    (r) => `${r.fromCompanyId}::${r.toCompanyId}::${r.relationshipType}`,
  )
  const businessRelationshipDuplicates: DuplicateGroup[] = [...bizRelGroups.entries()]
    .filter(([, v]) => v.length > 1)
    .map(([key, v]) => ({
      key,
      label: `${v[0].relationshipType} ${v[0].fromCompanyId} → ${v[0].toCompanyId}`,
      ids: v.map((_, i) => `${key}#${i}`),
    }))

  // Orphan board members: rows that still cannot be represented in the graph
  // because their company endpoint is missing. Missing PersonProfile rows get
  // fallback person nodes and are tracked separately as profile gaps.
  const orphanBoardMembers = boardMembers
    .filter((bm) => !companyIdSet.has(bm.companyId))
    .map((bm) => ({
      companyId: bm.companyId,
      companyName: companyById.get(bm.companyId)?.name ?? bm.companyId,
      personKey: bm.personKey,
      personName: bm.personName,
    }))

  const edgesWithConfidence = edges.filter((e) => typeof e.confidence === 'number').length

  const quality: GraphQualityReport = {
    companyNameDuplicates,
    companyOrgNrDuplicates,
    personNameDuplicates,
    personKeyDuplicates,
    businessRelationshipDuplicates,
    orphanBoardMembers,
    boardMemberProfileGaps: boardMemberGraph.boardMemberProfileGaps,
    edgeConfidenceCoverage: {
      totalEdges: edges.length,
      withConfidence: edgesWithConfidence,
      withoutConfidence: edges.length - edgesWithConfidence,
    },
  }

  return { nodes, edges, quality }
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
