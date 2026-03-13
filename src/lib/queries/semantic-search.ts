import { prisma } from '@/lib/db'

type SemanticResult = {
  id: string
  slug: string
  title: string
  excerpt: string
  tags: string[]
  distance: number
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

async function getQueryEmbedding(query: string): Promise<number[]> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set')
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
  const embedding = await getQueryEmbedding(query)
  const vec = `[${embedding.join(',')}]`

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
    vec,
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
