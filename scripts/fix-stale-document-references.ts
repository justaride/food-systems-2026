import 'dotenv/config'
import { existsSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ROOT = process.cwd()

const PATTERNS = [
  { name: 'external', startsWith: 'external/' },
  { name: 'meetings', startsWith: 'generated/meetings/' },
  { name: 'incoming_unfixed', startsWith: 'incoming/' },
]

type Action = 'add_research_prefix' | 'null_filepath' | 'delete' | 'keep'

type DocPlan = {
  id: string
  slug: string | null
  title: string | null
  filePath: string
  newFilePath: string | null
  contentLength: number
  pattern: string
  action: Action
  rationale: string
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')

  const allDocs: DocPlan[] = []

  for (const pattern of PATTERNS) {
    const docs = await prisma.document.findMany({
      where: { filePath: { startsWith: pattern.startsWith } },
      select: {
        id: true,
        slug: true,
        title: true,
        filePath: true,
        content: true,
      },
    })

    for (const doc of docs) {
      const contentLength = doc.content?.length ?? 0
      const filePath = doc.filePath ?? ''
      let action: Action
      let rationale: string
      let newFilePath: string | null = null

      const researchPrefixed = `research/${filePath}`
      if (existsSync(join(ROOT, researchPrefixed))) {
        action = 'add_research_prefix'
        newFilePath = researchPrefixed
        rationale = `file exists at research/${filePath} — filePath missing 'research/' prefix`
      } else if (contentLength < 100) {
        action = 'delete'
        rationale = `content empty/stub (<100 chars), filePath broken — safe to remove`
      } else {
        action = 'null_filepath'
        rationale = `content preserved (${contentLength} chars), filePath broken — null filePath, keep DB record`
      }

      allDocs.push({
        id: doc.id,
        slug: doc.slug,
        title: doc.title,
        filePath,
        newFilePath,
        contentLength,
        pattern: pattern.name,
        action,
        rationale,
      })
    }
  }

  const summary: Record<
    string,
    {
      total: number
      add_research_prefix: number
      null_filepath: number
      delete: number
      keep: number
    }
  > = {}
  for (const d of allDocs) {
    summary[d.pattern] = summary[d.pattern] ?? {
      total: 0,
      add_research_prefix: 0,
      null_filepath: 0,
      delete: 0,
      keep: 0,
    }
    summary[d.pattern].total += 1
    summary[d.pattern][d.action] += 1
  }

  console.log(`\nDocuments with stale filePath:`)
  for (const [pattern, counts] of Object.entries(summary)) {
    console.log(
      `  ${pattern}: ${counts.total} — prefix=${counts.add_research_prefix}, null=${counts.null_filepath}, delete=${counts.delete}`,
    )
  }

  function csvEscape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const logLines = [
    'id,slug,title,filePath,contentLength,pattern,action,rationale',
    ...allDocs.map((d) =>
      [
        d.id,
        csvEscape(d.slug ?? ''),
        csvEscape(d.title ?? ''),
        csvEscape(d.filePath),
        String(d.contentLength),
        d.pattern,
        d.action,
        csvEscape(d.rationale),
      ].join(','),
    ),
  ]
  writeFileSync(
    join(ROOT, 'research', 'stale-document-fix-log.csv'),
    logLines.join('\n') + '\n',
  )
  console.log(`\nLog written: research/stale-document-fix-log.csv`)

  if (!apply) {
    console.log(
      '\n[DRY RUN] No DB changes. Re-run with --apply to execute (null_filepath + delete).',
    )
    await prisma.$disconnect()
    return
  }

  let prefixed = 0
  let nulled = 0
  let deleted = 0
  let conflict = 0

  for (const d of allDocs) {
    try {
      if (d.action === 'add_research_prefix' && d.newFilePath) {
        const existing = await prisma.document.findFirst({
          where: { filePath: d.newFilePath },
          select: { id: true },
        })
        if (existing && existing.id !== d.id) {
          await prisma.document.update({
            where: { id: d.id },
            data: { filePath: null },
          })
          conflict++
        } else {
          await prisma.document.update({
            where: { id: d.id },
            data: { filePath: d.newFilePath },
          })
          prefixed++
        }
      } else if (d.action === 'null_filepath') {
        await prisma.document.update({
          where: { id: d.id },
          data: { filePath: null },
        })
        nulled++
      } else if (d.action === 'delete') {
        await prisma.document.delete({ where: { id: d.id } })
        deleted++
      }
    } catch (err) {
      console.error(`  ! Failed to apply for ${d.id} (${d.action}):`, err)
    }
  }
  console.log(
    `\nApplied: ${prefixed} prefix-fixed, ${conflict} demoted to null (proper Document exists), ${nulled} filePath nulled, ${deleted} Documents deleted.`,
  )

  await prisma.$disconnect()
}

main()
