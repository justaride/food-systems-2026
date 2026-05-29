// Applies reviewed insight-document links by stable Document.slug.
// Input is deliberately small and human-reviewed; broad archived seed rows stay archived.

import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { filterNewInsightDocumentRefs } from '../src/lib/insight-doc-link-review'

const REPO = process.cwd()
const CSV_PATH = join(REPO, 'research/_status/insight-slug-link-accepted-2026-05-27.csv')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Row = {
  insightId: string
  documentSlug: string
  relevance: string
  decision: string
}

type PlannedRef = {
  insightId: string
  documentId: string
  relevance: string
}

function parseCsv(text: string): Row[] {
  const lines = text.split('\n').filter((line) => line.trim().length > 0)
  const rows: Row[] = []

  for (const line of lines.slice(1)) {
    const [insightId, documentSlug, relevance, decision] = line.split(',')
    if (!insightId || !documentSlug || !relevance) continue
    rows.push({
      insightId,
      documentSlug,
      relevance,
      decision: (decision ?? '').trim().toLowerCase(),
    })
  }

  return rows
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf-8'))
  const accepted = rows.filter((row) => row.decision === 'y')

  console.log(`Total reviewed: ${rows.length}`)
  console.log(`Accepted (y): ${accepted.length}`)
  if (dryRun) console.log('(DRY RUN)')

  const [documents, insights] = await Promise.all([
    prisma.document.findMany({
      where: { slug: { in: [...new Set(accepted.map((row) => row.documentSlug))] } },
      select: { id: true, slug: true, title: true },
    }),
    prisma.insight.findMany({
      where: { id: { in: [...new Set(accepted.map((row) => row.insightId))] } },
      select: { id: true, title: true },
    }),
  ])

  const documentsBySlug = new Map(documents.map((document) => [document.slug, document]))
  const insightIds = new Set(insights.map((insight) => insight.id))

  const planned: PlannedRef[] = []
  let skipped = 0

  for (const row of accepted) {
    const document = documentsBySlug.get(row.documentSlug)
    if (!insightIds.has(row.insightId)) {
      console.log(`SKIP missing insight ${row.insightId} -> ${row.documentSlug}`)
      skipped++
      continue
    }
    if (!document) {
      console.log(`SKIP missing document slug ${row.insightId} -> ${row.documentSlug}`)
      skipped++
      continue
    }

    planned.push({
      insightId: row.insightId,
      documentId: document.id,
      relevance: row.relevance,
    })
  }

  const existingRefs = planned.length
    ? await prisma.insightDocumentRef.findMany({
        where: {
          OR: planned.map((ref) => ({
            insightId: ref.insightId,
            documentId: ref.documentId,
          })),
        },
        select: { insightId: true, documentId: true },
      })
    : []
  const toCreate = filterNewInsightDocumentRefs(planned, existingRefs)
  skipped += planned.length - toCreate.length

  let inserted = toCreate.length
  if (!dryRun && toCreate.length > 0) {
    const result = await prisma.insightDocumentRef.createMany({
      data: toCreate,
      skipDuplicates: true,
    })
    inserted = result.count
    skipped += toCreate.length - result.count
  }

  console.log(`Done. inserted=${inserted} skipped=${skipped}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
