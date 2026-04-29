import pgvector from 'pgvector'
import { prisma } from '@/lib/db'

export type SemanticSearchStatus = {
  available: boolean
  hasOpenAiKey: boolean
  totalDocuments: number | null
  embeddedDocuments: number | null
  reason?: 'missing-openai-key' | 'missing-document-embeddings' | 'missing-openai-key-and-document-embeddings' | 'status-check-failed'
}

export class SemanticSearchUnavailableError extends Error {
  code = 'SEMANTIC_SEARCH_UNAVAILABLE'

  constructor(
    message: string,
    public readonly status: SemanticSearchStatus,
  ) {
    super(message)
    this.name = 'SemanticSearchUnavailableError'
  }
}

type SemanticResult = {
  id: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
  distance: number
}

export async function getSemanticSearchStatus(): Promise<SemanticSearchStatus> {
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY?.trim())

  try {
    const [counts] = await prisma.$queryRaw<Array<{ total: number; embedded: number }>>`
      SELECT COUNT(*)::int AS total, COUNT(embedding)::int AS embedded
      FROM "Document"
    `

    const totalDocuments = counts?.total ?? 0
    const embeddedDocuments = counts?.embedded ?? 0
    const hasEmbeddings = embeddedDocuments > 0

    if (hasOpenAiKey && hasEmbeddings) {
      return { available: true, hasOpenAiKey, totalDocuments, embeddedDocuments }
    }

    return {
      available: false,
      hasOpenAiKey,
      totalDocuments,
      embeddedDocuments,
      reason: !hasOpenAiKey && !hasEmbeddings
        ? 'missing-openai-key-and-document-embeddings'
        : !hasOpenAiKey
          ? 'missing-openai-key'
          : 'missing-document-embeddings',
    }
  } catch {
    return {
      available: false,
      hasOpenAiKey,
      totalDocuments: null,
      embeddedDocuments: null,
      reason: 'status-check-failed',
    }
  }
}

async function getQueryEmbedding(query: string): Promise<number[]> {
  const openAiApiKey = process.env.OPENAI_API_KEY?.trim()
  if (!openAiApiKey) {
    const status = await getSemanticSearchStatus()
    throw new SemanticSearchUnavailableError('OPENAI_API_KEY is not configured', status)
  }

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: query,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`)
  const data = await res.json()
  return data.data[0].embedding
}

export async function semanticSearch(query: string, limit = 10): Promise<SemanticResult[]> {
  const status = await getSemanticSearchStatus()
  if (!status.available) {
    throw new SemanticSearchUnavailableError('Semantic search is not configured', status)
  }

  const embedding = await getQueryEmbedding(query)
  const vector = pgvector.toSql(embedding)

  const results = await prisma.$queryRawUnsafe<Array<{
    id: string
    slug: string
    title: string
    content: string
    tags: string[]
    distance: number
  }>>(
    `SELECT id, slug, title, LEFT(content, 300) as content, tags,
            embedding <=> $1::vector as distance
     FROM "Document"
     WHERE embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT $2`,
    vector,
    limit
  )

  return results.map(r => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.content + '...',
    tags: r.tags,
    distance: r.distance,
  }))
}
