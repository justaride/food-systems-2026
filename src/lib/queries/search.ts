import { prisma } from '@/lib/db'
import { semanticSearch } from './semantic-search'
import { isMissingPrismaTable } from './prisma-errors'

export type SearchMode = 'keyword' | 'semantic' | 'hybrid'

export type SearchResult = {
  type: 'document' | 'insight' | 'source' | 'thesis' | 'company' | 'actor' | 'relationship' | 'property' | 'person'
  id: string
  title: string
  excerpt: string
  url?: string | null
  tags?: string[]
  relevance?: number
}

export async function unifiedSearch(query: string, limit = 20, mode: SearchMode = 'keyword'): Promise<SearchResult[]> {
  if (mode === 'semantic') {
    try {
      const results = await semanticSearch(query, limit)
      return results.map(r => ({
        type: 'document' as const,
        id: r.id,
        title: r.title,
        excerpt: r.excerpt,
        tags: r.tags,
        url: `/bibliotek/${r.slug}`,
        relevance: 1 - r.distance,
      }))
    } catch {
      return keywordSearch(query, limit)
    }
  }

  if (mode === 'hybrid') {
    try {
      const [keyword, semantic] = await Promise.all([
        keywordSearch(query, limit),
        semanticSearch(query, limit).then(results =>
          results.map(r => ({
            type: 'document' as const,
            id: r.id,
            title: r.title,
            excerpt: r.excerpt,
            tags: r.tags,
            url: `/bibliotek/${r.slug}`,
            relevance: 1 - r.distance,
          }))
        ),
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
      return merged.slice(0, limit)
    } catch {
      return keywordSearch(query, limit)
    }
  }

  return keywordSearch(query, limit)
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

async function keywordSearch(query: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  const perTypeLimit = Math.max(5, Math.ceil(limit / 4))

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, content: true, summary: true, tags: true, slug: true },
    take: perTypeLimit,
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

  const insightsResult = await prisma.insight.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    take: perTypeLimit,
  })

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
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { filename: { contains: query, mode: 'insensitive' } },
      ],
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

  const thesesResult = await prisma.thesis.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { synthesis: { contains: query, mode: 'insensitive' } },
        { tags: { has: query.toLowerCase() } },
      ],
    },
    take: perTypeLimit,
  })

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
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { naceDescription: { contains: query, mode: 'insensitive' } },
        { valueChainStage: { contains: query, mode: 'insensitive' } },
      ],
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
    const themeVariants = Array.from(new Set([query, query.toLowerCase(), query.toUpperCase()]))
    const actorsResult = await prisma.actor.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { roleSummary: { contains: query, mode: 'insensitive' } },
          { currentRelevance: { contains: query, mode: 'insensitive' } },
          { specificAsk: { contains: query, mode: 'insensitive' } },
          { themeTags: { hasSome: themeVariants } },
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
          { description: { contains: query, mode: 'insensitive' } },
          { sector: { contains: query, mode: 'insensitive' } },
          { relationshipType: { contains: query, mode: 'insensitive' } },
          { fromCompany: { name: { contains: query, mode: 'insensitive' } } },
          { toCompany: { name: { contains: query, mode: 'insensitive' } } },
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
        url: `/relasjoner#${rel.id}`,
      })
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'BusinessRelationship')) throw error
  }

  try {
    const propertiesResult = await prisma.companyProperty.findMany({
      where: {
        OR: [
          { address: { contains: query, mode: 'insensitive' } },
          { municipality: { contains: query, mode: 'insensitive' } },
          { county: { contains: query, mode: 'insensitive' } },
          { propertyType: { contains: query, mode: 'insensitive' } },
          { company: { name: { contains: query, mode: 'insensitive' } } },
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
          { name: { contains: query, mode: 'insensitive' } },
          { biography: { contains: query, mode: 'insensitive' } },
          { affiliations: { has: query } },
          { tags: { has: query.toLowerCase() } },
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

  return interleaveByType(results, limit)
}
