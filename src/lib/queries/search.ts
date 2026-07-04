import { prisma } from '@/lib/db'
import {
  SemanticSearchUnavailableError,
  semanticSearch,
  type SemanticSearchStatus,
} from './semantic-search'
import { isMissingPrismaTable } from './prisma-errors'
import { getLibraryAnalysisBadgesByDocumentIds, type LibraryAnalysisBadge } from './library-analysis'

export type SearchMode = 'keyword' | 'semantic' | 'hybrid'

export type SearchResult = {
  type: 'document' | 'insight' | 'source' | 'thesis' | 'company' | 'actor' | 'relationship' | 'property' | 'person'
  id: string
  title: string
  excerpt: string
  url?: string | null
  tags?: string[]
  relevance?: number
  libraryAnalysis?: LibraryAnalysisBadge | null
}

export type SearchWarning = {
  code: 'semantic-unavailable' | 'semantic-error'
  message: string
}

export type SearchExecution = {
  requestedMode: SearchMode
  executedMode: SearchMode
  fallback: boolean
  warnings: SearchWarning[]
  results: SearchResult[]
}

export async function unifiedSearch(query: string, limit = 20, mode: SearchMode = 'keyword'): Promise<SearchResult[]> {
  const execution = await searchWithDiagnostics(query, limit, mode)
  return execution.results
}

export async function searchWithDiagnostics(query: string, limit = 20, mode: SearchMode = 'keyword'): Promise<SearchExecution> {
  if (mode === 'semantic') {
    try {
      const results = await semanticSearch(query, limit)
      return {
        requestedMode: mode,
        executedMode: 'semantic',
        fallback: false,
        warnings: [],
        results: await enrichLibraryAnalysisBadges(mapSemanticResults(results)),
      }
    } catch (error) {
      return fallbackToKeyword(query, limit, mode, error)
    }
  }

  if (mode === 'hybrid') {
    try {
      const [keyword, semantic] = await Promise.all([
        keywordSearch(query, limit),
        semanticSearch(query, limit).then(mapSemanticResults),
      ])
      const seen = new Set<string>()
      const merged: SearchResult[] = []
      for (const r of [...keyword, ...semantic]) {
        const key = `${r.type}-${r.id}`
        if (!seen.has(key)) {
          seen.add(key)
          merged.push(r)
        }
      }
      return {
        requestedMode: mode,
        executedMode: 'hybrid',
        fallback: false,
        warnings: [],
        results: await enrichLibraryAnalysisBadges(merged.slice(0, limit)),
      }
    } catch (error) {
      return fallbackToKeyword(query, limit, mode, error)
    }
  }

  return {
    requestedMode: mode,
    executedMode: 'keyword',
    fallback: false,
    warnings: [],
    results: await enrichLibraryAnalysisBadges(await keywordSearch(query, limit)),
  }
}

function mapSemanticResults(results: Awaited<ReturnType<typeof semanticSearch>>): SearchResult[] {
  return results.map(r => ({
    type: 'document' as const,
    id: r.id,
    title: r.title,
    excerpt: r.excerpt,
    tags: r.tags,
    url: `/bibliotek/${r.slug}`,
    relevance: 1 - r.distance,
  }))
}

async function fallbackToKeyword(query: string, limit: number, mode: SearchMode, error: unknown): Promise<SearchExecution> {
  const semanticStatus = semanticStatusFromError(error)
  const warning = semanticWarning(mode, semanticStatus)

  return {
    requestedMode: mode,
    executedMode: 'keyword',
    fallback: true,
    warnings: [warning],
    results: await enrichLibraryAnalysisBadges(await keywordSearch(query, limit)),
  }
}

function semanticStatusFromError(error: unknown): SemanticSearchStatus | undefined {
  if (error instanceof SemanticSearchUnavailableError) return error.status

  const maybeError = error as { status?: unknown } | null
  if (maybeError?.status && typeof maybeError.status === 'object') {
    return maybeError.status as SemanticSearchStatus
  }

  return undefined
}

function semanticWarning(mode: SearchMode, status: SemanticSearchStatus | undefined): SearchWarning {
  if (!status) {
    return {
      code: 'semantic-error',
      message: fallbackWarningMessage(mode),
    }
  }

  return {
    code: 'semantic-unavailable',
    message: fallbackWarningMessage(mode),
  }
}

function fallbackWarningMessage(mode: SearchMode): string {
  if (mode === 'hybrid') {
    return 'Hybrid søk bruker nøkkelord i denne versjonen. Semantisk rangering er ikke aktivert.'
  }

  return 'Semantisk søk er ikke aktivert i denne versjonen. Viser nøkkelordtreff.'
}

function interleaveByType(results: SearchResult[], cap: number): SearchResult[] {
  const groups = new Map<string, SearchResult[]>()
  for (const r of results) {
    const list = groups.get(r.type) ?? []
    list.push(r)
    groups.set(r.type, list)
  }
  const queues = [...groups.values()]
  const out: SearchResult[] = []
  while (out.length < cap && queues.some(q => q.length > 0)) {
    for (const queue of queues) {
      if (out.length >= cap) break
      const next = queue.shift()
      if (next) out.push(next)
    }
  }
  return out
}

async function enrichLibraryAnalysisBadges(results: SearchResult[]): Promise<SearchResult[]> {
  const documentIds = results
    .filter(result => result.type === 'document')
    .map(result => result.id)
  if (documentIds.length === 0) return results

  try {
    const badges = await getLibraryAnalysisBadgesByDocumentIds(documentIds)
    return results.map(result => {
      if (result.type !== 'document') return result
      return {
        ...result,
        libraryAnalysis: badges.get(result.id) ?? null,
      }
    })
  } catch (error) {
    if (!isMissingPrismaTable(error, 'LibraryAnalysisRecord')) throw error
    return results
  }
}

function tokenizeSearchQuery(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .match(/[\p{L}\p{N}][\p{L}\p{N}-]{1,}/gu) ?? []

  return Array.from(new Set(tokens)).slice(0, 6)
}

function buildSearchValues(query: string): string[] {
  const trimmed = query.trim()
  return Array.from(new Set([trimmed, ...tokenizeSearchQuery(trimmed)].filter(Boolean))).slice(0, 7)
}

function buildArraySearchValues(values: string[]): string[] {
  const variants = new Set<string>()
  for (const value of values) {
    variants.add(value)
    variants.add(value.toLowerCase())
    variants.add(value.toUpperCase())
  }
  return [...variants]
}

function scoreSearchResult(result: SearchResult, query: string): number {
  const normalizedQuery = query.trim().toLowerCase()
  const tokens = tokenizeSearchQuery(query)
  const title = result.title.toLowerCase()
  const excerpt = result.excerpt.toLowerCase()
  const tags = (result.tags ?? []).map(tag => tag.toLowerCase())
  let score = 0

  if (title === normalizedQuery) score += 100
  if (title.startsWith(normalizedQuery)) score += 70
  if (title.includes(normalizedQuery)) score += 50
  if (excerpt.includes(normalizedQuery)) score += 20
  if (tags.includes(normalizedQuery)) score += 40

  for (const token of tokens) {
    if (title.includes(token)) score += 12
    if (excerpt.includes(token)) score += 4
    if (tags.includes(token)) score += 8
  }

  return score
}

async function keywordSearch(query: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  const perTypeLimit = Math.max(5, Math.ceil(limit / 4))
  const searchValues = buildSearchValues(query)
  const arraySearchValues = buildArraySearchValues(searchValues)

  // FTS-first for Document — uses tsvector + GIN index for ranked relevance.
  // Falls back to ILIKE on syntax errors (e.g. unclosed quotes in user input).
  const documents = await ftsDocumentSearch(query, perTypeLimit).catch(async () => {
    return prisma.document.findMany({
      where: {
        OR: searchValues.flatMap(value => [
          { title: { contains: value, mode: 'insensitive' as const } },
          { content: { contains: value, mode: 'insensitive' as const } },
        ]),
      },
      select: { id: true, title: true, content: true, summary: true, tags: true, slug: true },
      take: perTypeLimit,
    })
  })

  for (const doc of documents) {
    let excerpt: string
    if (doc.summary) {
      excerpt = doc.summary.slice(0, 200)
    } else {
      const idx = doc.content.toLowerCase().indexOf(query.toLowerCase())
      const start = Math.max(0, idx - 80)
      excerpt = idx >= 0
        ? '...' + doc.content.slice(start, start + 200) + '...'
        : doc.content.slice(0, 200) + '...'
    }

    results.push({
      type: 'document',
      id: doc.id,
      title: doc.title,
      excerpt,
      tags: doc.tags,
      url: `/bibliotek/${doc.slug}`,
    })
  }

  const insightsResult = await ftsInsightSearch(query, perTypeLimit).catch(async () =>
    prisma.insight.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { title: { contains: value, mode: 'insensitive' as const } },
            { description: { contains: value, mode: 'insensitive' as const } },
          ]),
          { tags: { hasSome: arraySearchValues } },
        ],
      },
      take: perTypeLimit,
    }),
  )

  for (const ins of insightsResult) {
    results.push({
      type: 'insight',
      id: ins.id,
      title: ins.title,
      excerpt: ins.description.slice(0, 200),
      tags: ins.tags,
      url: `/innsikt#${ins.id}`,
    })
  }

  const sourcesResult = await prisma.sourceDoc.findMany({
    where: {
      OR: searchValues.flatMap(value => [
        { title: { contains: value, mode: 'insensitive' as const } },
        { description: { contains: value, mode: 'insensitive' as const } },
        { filename: { contains: value, mode: 'insensitive' as const } },
      ]),
    },
    take: perTypeLimit,
  })

  for (const src of sourcesResult) {
    results.push({
      type: 'source',
      id: src.id,
      title: src.title ?? src.filename,
      excerpt: src.description.slice(0, 200),
      url: src.url,
    })
  }

  const thesesResult = await ftsThesisSearch(query, perTypeLimit).catch(async () =>
    prisma.thesis.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { title: { contains: value, mode: 'insensitive' as const } },
            { synthesis: { contains: value, mode: 'insensitive' as const } },
          ]),
          { tags: { hasSome: arraySearchValues } },
        ],
      },
      take: perTypeLimit,
    }),
  )

  for (const t of thesesResult) {
    results.push({
      type: 'thesis',
      id: t.id,
      title: t.title,
      excerpt: t.synthesis.slice(0, 200),
      tags: t.tags,
      url: t.url || `/masteroppgaver#${t.id}`,
    })
  }

  const companiesResult = await prisma.company.findMany({
    where: {
      OR: searchValues.flatMap(value => [
        { name: { contains: value, mode: 'insensitive' as const } },
        { naceDescription: { contains: value, mode: 'insensitive' as const } },
        { valueChainStage: { contains: value, mode: 'insensitive' as const } },
      ]),
    },
    take: perTypeLimit,
  })

  for (const c of companiesResult) {
    results.push({
      type: 'company',
      id: c.id,
      title: c.name,
      excerpt: `${c.naceDescription ?? ''} — ${c.valueChainStage ?? ''} — ${c.hqCity ?? ''}`,
      url: `/selskap/${c.id}`,
    })
  }

  try {
    const actorsResult = await prisma.actor.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { name: { contains: value, mode: 'insensitive' as const } },
            { roleSummary: { contains: value, mode: 'insensitive' as const } },
            { currentRelevance: { contains: value, mode: 'insensitive' as const } },
            { specificAsk: { contains: value, mode: 'insensitive' as const } },
          ]),
          { themeTags: { hasSome: arraySearchValues } },
        ],
      },
      take: perTypeLimit,
    })

    for (const actor of actorsResult) {
      results.push({
        type: 'actor',
        id: actor.id,
        title: actor.name,
        excerpt: `${actor.actorType} — ${actor.currentStance ?? 'unknown stance'} — ${actor.roleSummary}`,
        tags: actor.themeTags,
        url: `/aktorer/${actor.slug}`,
      })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Actor')) throw error
  }

  try {
    const relationshipsResult = await prisma.businessRelationship.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { description: { contains: value, mode: 'insensitive' as const } },
            { sector: { contains: value, mode: 'insensitive' as const } },
            { relationshipType: { contains: value, mode: 'insensitive' as const } },
            { fromCompany: { name: { contains: value, mode: 'insensitive' as const } } },
            { toCompany: { name: { contains: value, mode: 'insensitive' as const } } },
          ]),
        ],
      },
      include: {
        fromCompany: { select: { name: true } },
        toCompany: { select: { name: true } },
      },
      take: perTypeLimit,
    })

    for (const rel of relationshipsResult) {
      results.push({
        type: 'relationship',
        id: rel.id,
        title: `${rel.fromCompany.name} → ${rel.toCompany.name}`,
        excerpt: `${rel.relationshipType}${rel.sector ? ` — ${rel.sector}` : ''}${rel.description ? ` — ${rel.description}` : ''}`,
        url: `/forsyningskjede?relationship=${encodeURIComponent(rel.id)}`,
      })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'BusinessRelationship')) throw error
  }

  try {
    const propertiesResult = await prisma.companyProperty.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { address: { contains: value, mode: 'insensitive' as const } },
            { municipality: { contains: value, mode: 'insensitive' as const } },
            { county: { contains: value, mode: 'insensitive' as const } },
            { propertyType: { contains: value, mode: 'insensitive' as const } },
            { company: { name: { contains: value, mode: 'insensitive' as const } } },
          ]),
        ],
      },
      include: {
        company: { select: { name: true } },
      },
      take: perTypeLimit,
    })

    for (const prop of propertiesResult) {
      const location = [prop.address, prop.municipality, prop.county].filter(Boolean).join(', ')
      results.push({
        type: 'property',
        id: prop.id,
        title: `${prop.company.name} — ${prop.propertyType}`,
        excerpt: location || prop.propertyType,
        url: `/eiendommer#${prop.id}`,
      })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'CompanyProperty')) throw error
  }

  try {
    const personsResult = await prisma.personProfile.findMany({
      where: {
        OR: [
          ...searchValues.flatMap(value => [
            { name: { contains: value, mode: 'insensitive' as const } },
            { biography: { contains: value, mode: 'insensitive' as const } },
          ]),
          { affiliations: { hasSome: arraySearchValues } },
          { tags: { hasSome: arraySearchValues } },
        ],
      },
      take: perTypeLimit,
    })

    for (const person of personsResult) {
      const roles = (person.roles as Array<{ companyName?: string; role?: string }> | null) ?? []
      const topRoles = roles
        .map(r => r.companyName && r.role ? `${r.role} @ ${r.companyName}` : r.role ?? r.companyName)
        .filter((v): v is string => Boolean(v))
        .slice(0, 2)
        .join(' · ')
      results.push({
        type: 'person',
        id: person.personKey,
        title: person.name,
        excerpt: person.biography?.slice(0, 200) ?? topRoles ?? person.affiliations.join(', '),
        tags: person.tags,
        url: `/personer/${encodeURIComponent(person.personKey)}`,
      })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'PersonProfile')) throw error
  }

  return interleaveByType(
    results.sort((a, b) => scoreSearchResult(b, query) - scoreSearchResult(a, query)),
    limit,
  )
}

// ─── Postgres FTS layer (added 2026-05-11) ───────────────────────────────────
// Uses the search_vector tsvector generated columns + GIN indexes added in the
// same migration. Returns the same shape as the prior Prisma .findMany() calls
// so consumer mapping code in keywordSearch() stays untouched.
//
// websearch_to_tsquery is forgiving with operators (AND, OR, "phrase", -negation)
// and tolerates fragments better than plainto_tsquery. Errors here propagate to
// callers which fall back to ILIKE.

async function ftsDocumentSearch(query: string, limit: number): Promise<
  Array<{ id: string; title: string; content: string; summary: string | null; tags: string[]; slug: string }>
> {
  return prisma.$queryRaw`
    SELECT id, title, content, summary, tags, slug
    FROM "Document"
    WHERE search_vector @@ websearch_to_tsquery('norwegian', ${query})
    ORDER BY ts_rank(search_vector, websearch_to_tsquery('norwegian', ${query})) DESC
    LIMIT ${limit}
  `
}

async function ftsInsightSearch(query: string, limit: number): Promise<
  Array<{ id: string; title: string; description: string; tags: string[] }>
> {
  return prisma.$queryRaw`
    SELECT id, title, description, tags
    FROM "Insight"
    WHERE search_vector @@ websearch_to_tsquery('norwegian', ${query})
    ORDER BY ts_rank(search_vector, websearch_to_tsquery('norwegian', ${query})) DESC
    LIMIT ${limit}
  `
}

async function ftsThesisSearch(query: string, limit: number): Promise<
  Array<{ id: string; title: string; synthesis: string; tags: string[]; url: string }>
> {
  return prisma.$queryRaw`
    SELECT id, title, synthesis, tags, url
    FROM "Thesis"
    WHERE search_vector @@ websearch_to_tsquery('norwegian', ${query})
    ORDER BY ts_rank(search_vector, websearch_to_tsquery('norwegian', ${query})) DESC
    LIMIT ${limit}
  `
}
