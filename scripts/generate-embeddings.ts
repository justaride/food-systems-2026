import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const BATCH_SIZE = 20
const MAX_CHUNK_CHARS = 8000

async function getEmbedding(text: string): Promise<number[]> {
  const truncated = text.slice(0, MAX_CHUNK_CHARS)
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: truncated,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI API error: ${res.status} ${err}`)
  }
  const data = await res.json()
  return data.data[0].embedding
}

async function main() {
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set in environment')
    process.exit(1)
  }

  const docs = await prisma.$queryRawUnsafe<{ id: string; title: string; content: string }[]>(
    `SELECT id, title, content FROM "Document" WHERE embedding IS NULL ORDER BY id`
  )

  console.log(`Found ${docs.length} documents without embeddings`)

  let processed = 0
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const embeddings = await Promise.all(
      batch.map(doc => {
        const text = `${doc.title}\n\n${doc.content}`
        return getEmbedding(text)
      })
    )

    for (let j = 0; j < batch.length; j++) {
      const vec = `[${embeddings[j].join(',')}]`
      await prisma.$executeRawUnsafe(
        `UPDATE "Document" SET embedding = $1::vector WHERE id = $2`,
        vec,
        batch[j].id
      )
    }

    processed += batch.length
    console.log(`Embedded ${processed}/${docs.length} documents`)
  }

  const total = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "Document" WHERE embedding IS NOT NULL`
  )
  console.log(`Done. ${total[0].count} documents now have embeddings.`)

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "Document_embedding_idx" ON "Document" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10)`
  )
  console.log('Created IVFFlat index on embeddings')

  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
