// Leser kuratert CSV (decision='y' for godkjente koblinger) og setter inn
// rader i InsightDocumentRef. Idempotent — UNIQUE-constraint på (insightId, documentId)
// hopper over allerede eksisterende koblinger.
//
// Bruk:
//   1. Curate research/_status/insight-doc-link-candidates-2026-05-11.csv
//      (sett 'y' i decision-kolonnen for godkjente)
//   2. npx tsx scripts/apply-insight-doc-links.ts
//      (legg til --dry-run for å se hva som ville blitt satt inn uten å skrive)

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resolveReviewDocumentId } from '../src/lib/insight-doc-link-review'

const REPO = process.cwd()
const CSV_PATH = join(REPO, 'research/_status/insight-doc-link-candidates-2026-05-11.csv')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Row = { insightId: string; docId: string; docTitle: string; rank: number; decision: string }

function parseCsv(text: string): Row[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const out: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 7) continue
    out.push({
      insightId: fields[0],
      docId: fields[2],
      docTitle: fields[3],
      rank: Number(fields[4]),
      decision: fields[6].trim().toLowerCase(),
    })
  }
  return out
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf-8'))
  const accepted = rows.filter(r => r.decision === 'y')

  console.log(`Total candidates in CSV: ${rows.length}`)
  console.log(`Marked accepted (decision='y'): ${accepted.length}`)
  if (dryRun) console.log('(DRY RUN — no DB writes)')

  if (accepted.length === 0) {
    console.log('Nothing to apply. Edit decision column in CSV and re-run.')
    await prisma.$disconnect()
    return
  }

  const documents = await prisma.document.findMany({
    select: { id: true, title: true },
  })

  let inserted = 0
  let skipped = 0
  for (const row of accepted) {
    const documentId = resolveReviewDocumentId(row, documents)
    if (!documentId) {
      console.log(`  skip missing/ambiguous document: ${row.insightId} -> ${row.docId} (${row.docTitle})`)
      skipped++
      continue
    }

    if (dryRun) {
      const remapped = documentId === row.docId ? '' : ` remapped from ${row.docId}`
      console.log(`  would insert: ${row.insightId} → ${documentId} (rank ${row.rank})${remapped}`)
      inserted++
      continue
    }
    try {
      // relevance maps confidence band → text
      const relevance =
        row.rank > 15 ? 'primary' :
        row.rank > 8 ? 'supporting' :
        'related'
      await prisma.insightDocumentRef.create({
        data: { insightId: row.insightId, documentId, relevance },
      })
      inserted++
    } catch (e: unknown) {
      const err = e as { code?: string }
      if (err.code === 'P2002') { skipped++; continue }
      throw e
    }
  }

  console.log(`\nDone. ${inserted} new refs ${dryRun ? '(would be) ' : ''}inserted, ${skipped} duplicate skipped.`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
