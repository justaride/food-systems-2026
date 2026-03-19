import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function extractBodySummary(content: string): string | null {
  const lines = content.split('\n')
  const bodyLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('#')) continue
    if (trimmed.startsWith('---')) continue
    if (trimmed.startsWith('**') && trimmed.endsWith('**')) continue
    if (trimmed.startsWith('>')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith(':---')) continue
    if (trimmed.startsWith('- Importtype:')) continue
    if (trimmed.startsWith('- Lokal fil:')) continue
    if (trimmed.startsWith('- Sider:')) continue
    if (trimmed.startsWith('- Institusjon/kilde:')) continue
    if (trimmed.startsWith('- Aar:')) continue
    if (trimmed.startsWith('- Land:')) continue
    if (trimmed.startsWith('- Dokumenttype:')) continue
    if (trimmed.startsWith('- Kilde-URL:')) continue
    if (trimmed.startsWith('- Backlog-status:')) continue
    if (trimmed.startsWith('- Lokal tilgjengelighet:')) continue
    if (trimmed.startsWith('- Strukturert kobling:')) continue
    if (/^-\s/.test(trimmed) && trimmed.length < 60) continue
    bodyLines.push(trimmed)
    if (bodyLines.length >= 10) break
  }

  if (bodyLines.length === 0) return null

  const joined = bodyLines.join(' ')
  const sentences = joined.match(/[^.!?]+[.!?]+/g)
  if (sentences && sentences.length > 0) {
    let summary = ''
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const next = summary + sentences[i]
      if (next.split(/\s+/).length > 200) break
      summary = next
    }
    return summary.trim() || null
  }

  const words = joined.split(/\s+/)
  return words.slice(0, 200).join(' ').trim() || null
}

async function main() {
  console.log('Generating summaries for documents with null summary...\n')

  const docsWithThesis = await prisma.document.findMany({
    where: { summary: null },
    select: { id: true, title: true, content: true },
    orderBy: { updatedAt: 'desc' },
  })

  const thesesByDocId = new Map(
    (await prisma.thesis.findMany({
      where: { documentId: { not: null } },
      select: { documentId: true, synthesis: true },
    })).map(t => [t.documentId!, t])
  )

  const reportsByDocId = new Map(
    (await prisma.report.findMany({
      where: { documentId: { not: null } },
      select: { documentId: true, keyFindings: true, relevance: true },
    })).map(r => [r.documentId!, r])
  )

  let updated = 0
  let skippedEmpty = 0
  let skippedNoExtract = 0
  let errors = 0

  for (const doc of docsWithThesis) {
    try {
      let summary: string | null = null

      const thesis = thesesByDocId.get(doc.id)
      if (thesis?.synthesis) {
        summary = thesis.synthesis
      }

      if (!summary) {
        const report = reportsByDocId.get(doc.id)
        if (report?.keyFindings && report.keyFindings.length > 0) {
          const findings = report.keyFindings.slice(0, 3)
          summary = findings.join(' ')
          if (report.relevance) {
            summary += ` Relevans: ${report.relevance}`
          }
        }
      }

      if (!summary) {
        if (!doc.content || doc.content.trim().length === 0) {
          skippedEmpty++
          continue
        }
        summary = extractBodySummary(doc.content)
      }

      if (!summary) {
        skippedNoExtract++
        continue
      }

      await prisma.document.update({
        where: { id: doc.id },
        data: { summary },
      })
      updated++
      console.log(`  [OK] ${doc.title}`)
    } catch (err) {
      errors++
      console.error(`  [ERR] ${doc.title}:`, err)
    }
  }

  console.log(`\nDone:`)
  console.log(`  Updated:          ${updated}`)
  console.log(`  Skipped (empty):  ${skippedEmpty}`)
  console.log(`  Skipped (no extract): ${skippedNoExtract}`)
  console.log(`  Errors:           ${errors}`)
  console.log(`  Total processed:  ${docsWithThesis.length}`)
}

main()
  .catch((e) => {
    console.error('Summary generation failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
