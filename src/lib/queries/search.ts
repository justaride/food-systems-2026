import { prisma } from '@/lib/db'

export type SearchResult = {
  type: 'document' | 'insight' | 'source' | 'thesis' | 'company'
  id: string
  title: string
  excerpt: string
  url?: string | null
  tags?: string[]
  relevance?: number
}

export async function unifiedSearch(query: string, limit = 20): Promise<SearchResult[]> {
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
