import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  buildDocumentPayload,
  formatCitation,
  normalizeLimit,
  parseNonEmptyQuery,
  resolveObsidianVaultPath,
  summarizeCitationReadiness,
  truncateText,
} from './formatters'

export type EntityType = 'company' | 'actor' | 'person'
export type SearchMode = 'keyword' | 'semantic' | 'hybrid'
export type CitationReadinessFilter = 'citable_external' | 'citable_with_note' | 'internal_context' | 'blocked_unsourced'

type PrismaClientLike = Awaited<ReturnType<typeof getPrisma>>

export const REPO_ROOT = process.cwd()
export const OBSIDIAN_VAULT_ROOT = join(REPO_ROOT, 'Food Systems Obsidian')

export async function kbStatus() {
  const vaultExists = existsSync(OBSIDIAN_VAULT_ROOT)
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim())
  const status = {
    database: {
      configured: hasDatabaseUrl,
      connected: false,
      error: null as string | null,
      counts: {} as Record<string, number>,
    },
    semanticSearch: await safeSemanticStatus(),
    obsidianVault: {
      path: OBSIDIAN_VAULT_ROOT,
      exists: vaultExists,
    },
  }

  if (!hasDatabaseUrl) return status

  try {
    const prisma = await getPrisma()
    const [documents, sourceCitations, insights, companies, actors, people] = await Promise.all([
      prisma.document.count(),
      prisma.sourceCitation.count(),
      prisma.insight.count(),
      prisma.company.count(),
      prisma.actor.count().catch(() => 0),
      prisma.personProfile.count().catch(() => 0),
    ])

    status.database.connected = true
    status.database.counts = {
      documents,
      sourceCitations,
      insights,
      companies,
      actors,
      people,
    }
  } catch (error) {
    status.database.error = errorMessage(error)
  }

  return status
}

export async function kbSearch(input: { query: string; limit?: number; mode?: SearchMode; types?: string[] }) {
  const query = parseNonEmptyQuery(input.query)
  const limit = normalizeLimit(input.limit)
  const mode = input.mode ?? 'keyword'
  const { searchWithDiagnostics } = await import('../../src/lib/queries/search')
  const execution = await searchWithDiagnostics(query, limit, mode)
  const allowedTypes = new Set(input.types ?? [])
  const results = allowedTypes.size > 0
    ? execution.results.filter((result) => allowedTypes.has(result.type))
    : execution.results

  return {
    query,
    requestedMode: execution.requestedMode,
    executedMode: execution.executedMode,
    fallback: execution.fallback,
    warnings: execution.warnings,
    results: results.map((result) => ({
      id: result.id,
      type: result.type,
      title: result.title,
      summary: result.excerpt,
      tags: result.tags ?? [],
      links: { appPath: result.url ?? null },
      relevance: result.relevance ?? null,
    })),
  }
}

export async function kbGetDocument(input: {
  slug?: string
  id?: string
  includeContent?: boolean
  contentWindow?: number
}) {
  if (!input.slug && !input.id) throw new Error('Provide either slug or id')
  const prisma = await getPrisma()
  const document = await prisma.document.findFirst({
    where: input.slug ? { slug: input.slug } : { id: input.id },
    include: {
      sourceCitations: {
        orderBy: { updatedAt: 'desc' },
        take: 20,
      },
      sourceDoc: true,
    },
  })

  if (!document) {
    return {
      found: false,
      warnings: [`Document not found for ${input.slug ? `slug=${input.slug}` : `id=${input.id}`}`],
    }
  }

  return {
    found: true,
    ...buildDocumentPayload(document, {
      includeContent: input.includeContent,
      contentWindow: input.contentWindow,
    }),
    sourceDoc: document.sourceDoc
      ? {
          id: document.sourceDoc.id,
          title: document.sourceDoc.title,
          filename: document.sourceDoc.filename,
          url: document.sourceDoc.url,
        }
      : null,
  }
}

export async function kbGetEntity(input: { type: EntityType; id: string }) {
  const prisma = await getPrisma()

  if (input.type === 'company') return getCompany(prisma, input.id)
  if (input.type === 'actor') return getActor(prisma, input.id)
  return getPerson(prisma, input.id)
}

export async function kbTraceClaim(input: {
  query: string
  entityType?: string
  entityId?: string
  limit?: number
}) {
  const query = parseNonEmptyQuery(input.query)
  const limit = normalizeLimit(input.limit)
  const prisma = await getPrisma()

  const fieldCitations = await prisma.fieldCitation.findMany({
    where: {
      ...(input.entityType ? { entityType: input.entityType } : {}),
      ...(input.entityId ? { entityId: input.entityId } : {}),
      OR: [
        { claimText: { contains: query, mode: 'insensitive' } },
        { fieldPath: { contains: query, mode: 'insensitive' } },
        { citation: { citationText: { contains: query, mode: 'insensitive' } } },
        { citation: { title: { contains: query, mode: 'insensitive' } } },
      ],
    },
    include: { citation: true },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })

  const sourceCitations = fieldCitations.length > 0
    ? []
    : await prisma.sourceCitation.findMany({
        where: {
          OR: [
            { citationText: { contains: query, mode: 'insensitive' } },
            { title: { contains: query, mode: 'insensitive' } },
            { quote: { contains: query, mode: 'insensitive' } },
            { notes: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: limit,
        orderBy: { updatedAt: 'desc' },
      })

  const claims = [
    ...fieldCitations.map((fieldCitation) => ({
      id: fieldCitation.id,
      entityType: fieldCitation.entityType,
      entityId: fieldCitation.entityId,
      fieldPath: fieldCitation.fieldPath,
      claimText: fieldCitation.claimText,
      confidence: fieldCitation.confidence,
      citation: formatCitation(fieldCitation.citation),
    })),
    ...sourceCitations.map((citation) => ({
      id: citation.id,
      entityType: null,
      entityId: null,
      fieldPath: null,
      claimText: citation.citationText,
      confidence: citation.confidence,
      citation: formatCitation(citation),
    })),
  ]

  return {
    query,
    found: claims.length > 0,
    claims,
    warnings: claims.length > 0 ? [] : ['No matching claim or citation found; treat as uncited/internal until verified.'],
  }
}

export async function kbListGaps(input: { limit?: number; readiness?: CitationReadinessFilter }) {
  const limit = normalizeLimit(input.limit)
  const readiness = input.readiness ?? 'blocked_unsourced'
  const prisma = await getPrisma()
  const citations = await prisma.sourceCitation.findMany({
    where: {
      OR: [
        { citationReadiness: readiness as never },
        { verificationStatus: 'needs_review' },
        { url: null, archivedUrl: null, localPath: null },
      ],
    },
    include: { fieldCitations: true },
    take: limit,
    orderBy: { updatedAt: 'desc' },
  })

  return {
    readiness,
    filters: {
      citationReadiness: readiness,
      includeNeedsReview: true,
      includeMissingLocator: true,
    },
    count: citations.length,
    gaps: citations.map((citation) => ({
      citation: formatCitation(citation),
      fieldCitations: citation.fieldCitations.map((fieldCitation) => ({
        id: fieldCitation.id,
        entityType: fieldCitation.entityType,
        entityId: fieldCitation.entityId,
        fieldPath: fieldCitation.fieldPath,
        claimText: fieldCitation.claimText,
      })),
      sourceStatus: summarizeCitationReadiness([citation]),
    })),
  }
}

export async function readSchemaResource() {
  const schemaPath = join(REPO_ROOT, 'prisma/schema.prisma')
  return readFileSync(schemaPath, 'utf8')
}

export async function readObsidianResource(resourcePath: string) {
  const filePath = resolveObsidianVaultPath(OBSIDIAN_VAULT_ROOT, resourcePath)
  if (!existsSync(filePath)) {
    throw new Error(`Obsidian resource not found: ${resourcePath}`)
  }
  return readFileSync(filePath, 'utf8')
}

async function getCompany(prisma: PrismaClientLike, id: string) {
  const company = await prisma.company.findFirst({
    where: { OR: [{ id }, { orgNr: id }, { name: { equals: id, mode: 'insensitive' } }] },
    include: {
      boardMembers: { take: 10, orderBy: { personName: 'asc' } },
      shareholders: { take: 10, orderBy: { ownershipPct: 'desc' } },
      documentRefs: { include: { document: true }, take: 10 },
      actor: true,
      parentOf: { include: { childCompany: true }, take: 10 },
      childOf: { include: { parentCompany: true }, take: 10 },
      relationshipsFrom: { include: { toCompany: true }, take: 10 },
      relationshipsTo: { include: { fromCompany: true }, take: 10 },
    },
  })

  if (!company) return notFound('company', id)

  return {
    found: true,
    entity: {
      id: company.id,
      type: 'company',
      title: company.name,
      summary: [company.naceDescription, company.valueChainStage, company.hqCity].filter(Boolean).join(' — '),
      fields: {
        orgNr: company.orgNr,
        country: company.country,
        legalForm: company.legalForm,
        valueChainStage: company.valueChainStage,
        ownershipType: company.ownershipType,
        registrySource: company.registrySource,
        registryVerifiedAt: company.registryVerifiedAt,
      },
      links: {
        appPath: `/selskap/${company.id}`,
        actorPath: company.actor ? `/aktorer/${company.actor.slug}` : null,
      },
      relationships: {
        boardMembers: company.boardMembers.map((member) => ({
          personName: member.personName,
          role: member.role,
          personKey: member.personKey,
          sourceUrl: member.sourceUrl,
          verificationStatus: member.verificationStatus,
        })),
        shareholders: company.shareholders.map((shareholder) => ({
          name: shareholder.name,
          ownershipPct: shareholder.ownershipPct?.toString() ?? null,
          sourceUrl: shareholder.sourceUrl,
          verificationStatus: shareholder.verificationStatus,
        })),
        children: company.parentOf.map((edge) => ({
          id: edge.childCompany.id,
          name: edge.childCompany.name,
          ownershipPct: edge.ownershipPct,
          source: edge.source,
        })),
        parents: company.childOf.map((edge) => ({
          id: edge.parentCompany.id,
          name: edge.parentCompany.name,
          ownershipPct: edge.ownershipPct,
          source: edge.source,
        })),
        businessRelationships: [
          ...company.relationshipsFrom.map((edge) => ({
            direction: 'out',
            company: edge.toCompany.name,
            relationshipType: edge.relationshipType,
            source: edge.source,
            verificationStatus: edge.verificationStatus,
          })),
          ...company.relationshipsTo.map((edge) => ({
            direction: 'in',
            company: edge.fromCompany.name,
            relationshipType: edge.relationshipType,
            source: edge.source,
            verificationStatus: edge.verificationStatus,
          })),
        ],
      },
      documents: company.documentRefs.map((ref) => ({
        id: ref.document.id,
        title: ref.document.title,
        slug: ref.document.slug,
        context: ref.context,
      })),
    },
  }
}

async function getActor(prisma: PrismaClientLike, id: string) {
  const actor = await prisma.actor.findFirst({
    where: { OR: [{ id }, { slug: id }, { name: { equals: id, mode: 'insensitive' } }] },
    include: {
      company: true,
      documentRefs: { include: { document: true }, take: 10 },
      relationshipsFrom: { include: { toActor: true }, take: 10 },
      relationshipsTo: { include: { fromActor: true }, take: 10 },
    },
  })

  if (!actor) return notFound('actor', id)

  return {
    found: true,
    entity: {
      id: actor.id,
      type: 'actor',
      title: actor.name,
      summary: actor.roleSummary,
      tags: actor.themeTags,
      fields: {
        actorType: actor.actorType,
        country: actor.country,
        currentStance: actor.currentStance,
        desiredStance: actor.desiredStance,
        priorityTier: actor.priorityTier,
        verificationStatus: actor.verificationStatus,
        lastVerifiedAt: actor.lastVerifiedAt,
      },
      links: {
        appPath: `/aktorer/${actor.slug}`,
        website: actor.website,
        companyPath: actor.company ? `/selskap/${actor.company.id}` : null,
      },
      relationships: [
        ...actor.relationshipsFrom.map((edge) => ({
          direction: 'out',
          actor: edge.toActor.name,
          relationType: edge.relationType,
          sourceUrl: edge.sourceUrl,
        })),
        ...actor.relationshipsTo.map((edge) => ({
          direction: 'in',
          actor: edge.fromActor.name,
          relationType: edge.relationType,
          sourceUrl: edge.sourceUrl,
        })),
      ],
      documents: actor.documentRefs.map((ref) => ({
        id: ref.document.id,
        title: ref.document.title,
        slug: ref.document.slug,
        context: ref.context,
      })),
    },
  }
}

async function getPerson(prisma: PrismaClientLike, id: string) {
  const person = await prisma.personProfile.findFirst({
    where: { OR: [{ personKey: id }, { id }, { name: { equals: id, mode: 'insensitive' } }] },
  })

  if (!person) return notFound('person', id)

  return {
    found: true,
    entity: {
      id: person.personKey,
      type: 'person',
      title: person.name,
      summary: truncateText(person.biography ?? person.affiliations.join(', '), 500),
      tags: person.tags,
      fields: {
        affiliations: person.affiliations,
        lastVerifiedAt: person.lastVerifiedAt,
      },
      links: {
        appPath: `/personer/${encodeURIComponent(person.personKey)}`,
        linkedInUrl: person.linkedInUrl,
        photoUrl: person.photoUrl,
      },
      relationships: {
        roles: person.roles,
      },
    },
  }
}

function notFound(type: EntityType, id: string) {
  return {
    found: false,
    warnings: [`${type} not found for id=${id}`],
  }
}

async function safeSemanticStatus() {
  try {
    const { getSemanticSearchStatus } = await import('../../src/lib/queries/semantic-search')
    return await getSemanticSearchStatus()
  } catch (error) {
    return {
      available: false,
      hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
      totalDocuments: null,
      embeddedDocuments: null,
      reason: errorMessage(error),
    }
  }
}

async function getPrisma() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error('DATABASE_URL is not configured')
  }
  const { prisma } = await import('../../src/lib/db')
  return prisma
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
