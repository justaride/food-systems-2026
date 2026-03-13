import { prisma } from '@/lib/db'
import { semanticSearch } from './semantic-search'

export type SearchMode = 'keyword' | 'semantic' | 'hybrid'

export type SearchResult = {
  type: 'document' | 'insight' | 'source' | 'thesis' | 'company'
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
        url: `/forskning/${r.slug}`,
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
            url: `/forskning/${r.slug}`,
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

async function keywordSearch(query: string, limit: number): Promise<SearchResult[]> {
  const results: SearchResult[] = []
  const terms = query.trim().split(/\s+/).join(' & ')

  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { content: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, title: true, content: true, tags: true, slug: true },
    take: limit,
  })

  for (const doc of documents) {
    const idx = doc.content.toLowerCase().indexOf(query.toLowerCase())
    const start = Math.max(0, idx - 80)
    const excerpt = idx >= 0
      ? '...' + doc.content.slice(start, start + 200) + '...'
      : doc.content.slice(0, 200) + '...'

    results.push({
      type: 'document',
      id: doc.id,
      title: doc.title,
      excerpt,
      tags: doc.tags,
      url: `/forskning/${doc.slug}`,
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
    take: limit,
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
    take: limit,
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
    take: limit,
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
    take: limit,
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

  return results.slice(0, limit)
}
