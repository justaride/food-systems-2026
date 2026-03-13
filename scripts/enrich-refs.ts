import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

const SIMILARITY_THRESHOLD = 0.25
const MAX_SUGGESTIONS_PER_DOC = 5

async function main() {
  const embeddedCount = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
    `SELECT COUNT(*) as count FROM "Document" WHERE embedding IS NOT NULL`
  )

  const count = Number(embeddedCount[0].count)
  if (count < 2) {
    console.log(`Only ${count} documents have embeddings. Need at least 2. Run generate-embeddings.ts first.`)
    await prisma.$disconnect()
    return
  }

  console.log(`Finding similar document pairs among ${count} embedded documents...`)

  const pairs = await prisma.$queryRawUnsafe<{
    from_id: string
    to_id: string
    from_title: string
    to_title: string
    distance: number
  }[]>(
    `SELECT
       a.id as from_id,
       b.id as to_id,
       a.title as from_title,
       b.title as to_title,
       a.embedding <=> b.embedding as distance
     FROM "Document" a
     CROSS JOIN "Document" b
     WHERE a.id < b.id
       AND a.embedding IS NOT NULL
       AND b.embedding IS NOT NULL
       AND a.embedding <=> b.embedding < $1
     ORDER BY distance
     LIMIT 200`,
    SIMILARITY_THRESHOLD
  )

  console.log(`Found ${pairs.length} similar pairs (threshold: ${SIMILARITY_THRESHOLD})`)

  const existingRefs = await prisma.documentRef.findMany({
    select: { fromId: true, toId: true },
  })
  const existingSet = new Set(existingRefs.map(r => `${r.fromId}-${r.toId}`))

  let created = 0
  let skipped = 0
  const docSuggestions = new Map<string, number>()

  for (const pair of pairs) {
    const key1 = `${pair.from_id}-${pair.to_id}`
    const key2 = `${pair.to_id}-${pair.from_id}`

    if (existingSet.has(key1) || existingSet.has(key2)) {
      skipped++
      continue
    }

    const fromCount = docSuggestions.get(pair.from_id) ?? 0
    const toCount = docSuggestions.get(pair.to_id) ?? 0
    if (fromCount >= MAX_SUGGESTIONS_PER_DOC || toCount >= MAX_SUGGESTIONS_PER_DOC) continue

    await prisma.documentRef.create({
      data: {
        fromId: pair.from_id,
        toId: pair.to_id,
        refType: 'semantic-similarity',
      },
    })

    docSuggestions.set(pair.from_id, fromCount + 1)
    docSuggestions.set(pair.to_id, toCount + 1)
    existingSet.add(key1)
    created++

    const similarity = ((1 - pair.distance) * 100).toFixed(1)
    console.log(`  + ${pair.from_title.slice(0, 40)} <-> ${pair.to_title.slice(0, 40)} (${similarity}%)`)
  }

  console.log(`\nDone. Created ${created} new edges, skipped ${skipped} existing.`)
  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  process.exit(1)
})
