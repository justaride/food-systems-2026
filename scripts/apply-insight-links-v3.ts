// Applies decision='y' rows from v2 CSV (with source column) to InsightDocumentRef.
// Note: InsightDocumentRef.documentId may point to a Document that was originally
// from a Report or Thesis via documentId field. Idempotent via unique constraint.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const REPO = '/Users/gabrielboen/Documents/Food Systems 2026'
const CSV_PATH = join(REPO, 'research/_status/insight-link-candidates-v3-2026-05-11.csv')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Row = { insightId: string; docId: string; source: string; rank: number; decision: string }

function parseCsv(text: string): Row[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const out: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = []
    let cur = ''; let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 8) continue
    out.push({
      insightId: fields[0],
      docId: fields[2],
      source: fields[4],
      rank: Number(fields[5]),
      decision: fields[7].trim().toLowerCase(),
    })
  }
  return out
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf-8'))
  const accepted = rows.filter(r => r.decision === 'y')

  console.log(`Total candidates: ${rows.length}`)
  console.log(`Accepted (y): ${accepted.length}`)
  if (dryRun) console.log('(DRY RUN)')

  let inserted = 0, skipped = 0
  for (const r of accepted) {
    if (dryRun) { inserted++; continue }
    try {
      const relevance =
        r.rank > 25 ? 'primary' :
        r.rank > 15 ? 'supporting' :
        'related'
      await prisma.insightDocumentRef.create({
        data: { insightId: r.insightId, documentId: r.docId, relevance },
      })
      inserted++
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      if (err.code === 'P2002') { skipped++; continue }
      console.log(`ERROR ${r.insightId} → ${r.docId}: ${err.message}`)
      skipped++
    }
  }

  console.log(`Done. inserted=${inserted} skipped=${skipped}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
