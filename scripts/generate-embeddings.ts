import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  EMBEDDING_DIMENSIONS,
  EMBEDDING_MODEL,
  assertBoundedSelection,
  planCandidate,
  sha256,
  type EmbeddingCandidate,
} from '../src/lib/embedding-job'

type Args = { ids: string[]; limit: number | null }

function parseArgs(argv: string[]): Args {
  const args: Args = { ids: [], limit: null }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--id') args.ids.push(argv[++index] ?? '')
    else if (arg === '--ids') args.ids.push(...(argv[++index] ?? '').split(','))
    else if (arg === '--limit') args.limit = Number(argv[++index])
    else if (arg === '--apply') throw new Error('Embedding writes are disabled while normal search is active')
    else throw new Error('Invalid embedding-plan arguments')
  }
  args.ids = [...new Set(args.ids.map(id => id.trim()).filter(Boolean))]
  assertBoundedSelection(args.ids, args.limit)
  return args
}

function reportFailure() {
  console.error('Embedding plan could not be completed')
  process.exitCode = 1
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const connectionString = process.env.DATABASE_URL?.trim()
  if (!connectionString) throw new Error('Database configuration is unavailable')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  try {
    const rows = await prisma.$queryRawUnsafe<Array<{
      id: string; slug: string; title: string; content: string; documentType: string | null
      embeddingPresent: boolean; sourceDocId: string | null; provenanceType: string | null
      sourceCitations: EmbeddingCandidate['sourceCitations']
    }>>(
      `SELECT d.id, d.slug, d.title, d.content, d."documentType",
              (d.embedding IS NOT NULL) AS "embeddingPresent",
              sd.id AS "sourceDocId", sd."provenanceType",
              COALESCE(jsonb_agg(jsonb_build_object(
                'sourceDocId', sc."sourceDocId",
                'sourceClass', sc."sourceClass"::text,
                'citationReadiness', sc."citationReadiness"::text,
                'verificationStatus', sc."verificationStatus"::text,
                'url', sc.url,
                'archivedUrl', sc."archivedUrl",
                'accessedAt', sc."accessedAt"
              )) FILTER (WHERE sc.id IS NOT NULL), '[]'::jsonb) AS "sourceCitations"
       FROM "Document" d
       LEFT JOIN "SourceDoc" sd ON sd."documentId" = d.id
       LEFT JOIN "SourceCitation" sc ON sc."documentId" = d.id AND sc."sourceDocId" = sd.id
       WHERE (cardinality($1::text[]) > 0 AND d.id = ANY($1::text[]))
          OR (cardinality($1::text[]) = 0 AND d.embedding IS NULL)
       GROUP BY d.id, sd.id, sd."provenanceType"
       ORDER BY d.id
       LIMIT $2`,
      args.ids,
      args.limit ?? args.ids.length,
    )
    const candidates: EmbeddingCandidate[] = rows.map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      content: row.content,
      documentType: row.documentType,
      embeddingPresent: row.embeddingPresent,
      sourceDoc: row.sourceDocId && row.provenanceType
        ? { id: row.sourceDocId, provenanceType: row.provenanceType }
        : null,
      sourceCitations: row.sourceCitations,
    }))
    const plan = {
      version: 1,
      mode: 'dry-run',
      authority: 'technical_retrieval_only_not_source_or_claim_approval',
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_DIMENSIONS,
      requestedIds: args.ids,
      requestedLimit: args.limit,
      rows: candidates.map(planCandidate),
    }
    console.log(JSON.stringify({ type: 'embedding-plan', planSha256: sha256(JSON.stringify(plan)), ...plan }, null, 2))
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(reportFailure)
