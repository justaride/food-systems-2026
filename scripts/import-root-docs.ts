import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as fs from 'fs'
import * as path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const PROJECT_ROOT = path.resolve(__dirname, '..')

type RootDocConfig = {
  sourceDocId: string
  filename: string
  title: string
  author: string | null
  year: number | null
  documentType: string
  category: string
  country: string | null
  tags: string[]
}

const ROOT_DOCS: RootDocConfig[] = [
  {
    sourceDocId: 'src-1',
    filename: 'Just now (12.Revise-Gab) Nordic Circular Food systems  - V.2.10-07-24.docx.md',
    title: 'Nordic Circular Food Systems — NI 2024 Application (Rejected)',
    author: 'Natural State / Nordic Circular Hotspot',
    year: 2024,
    documentType: 'application',
    category: 'project',
    country: 'Nordic',
    tags: ['soknad', 'nordic-innovation', 'ni-2024', 'project'],
  },
  {
    sourceDocId: 'src-2',
    filename: '1. Food system_ Oslo Innovasjons program 2025 .md',
    title: 'Oslo Innovasjonsprogram 2025 — Food Systems Application',
    author: 'Natural State',
    year: 2025,
    documentType: 'application',
    category: 'project',
    country: 'NO',
    tags: ['soknad', 'oslo', 'innovasjonsprogram', 'project'],
  },
  {
    sourceDocId: 'src-3',
    filename: '9, mars 2026 FOOD.md',
    title: 'Møtenotat 9. mars 2026 — Food Systems Transition Group',
    author: 'Gabriel Freeman / Cathrine Barth',
    year: 2026,
    documentType: 'meeting-note',
    category: 'meetings',
    country: 'NO',
    tags: ['meeting', 'aksjonspunkter', 'nch', 'project'],
  },
  {
    sourceDocId: 'src-4',
    filename: 'Speaker 1.md',
    title: 'Strategisamtale — Verdikjeder, Data og Transition Groups',
    author: null,
    year: 2026,
    documentType: 'transcript',
    category: 'meetings',
    country: 'NO',
    tags: ['transkripsjon', 'strategi', 'verdikjede', 'project'],
  },
  {
    sourceDocId: 'src-5',
    filename: 'Speaker 1 (1).md',
    title: 'Samtale om Dokumenter og Oppstart av Arbeidet',
    author: null,
    year: 2026,
    documentType: 'transcript',
    category: 'meetings',
    country: 'NO',
    tags: ['transkripsjon', 'oppstart', 'project'],
  },
  {
    sourceDocId: 'src-6',
    filename: 'Untitled document.md',
    title: '9. mars-notater — Utvidet Kontekst',
    author: null,
    year: 2026,
    documentType: 'meeting-note',
    category: 'meetings',
    country: 'NO',
    tags: ['meeting', 'duplikat', 'project'],
  },
  {
    sourceDocId: 'src-7',
    filename: '2026 1401 DRØFTING TRANSITION GROUPS.pdf',
    title: 'Drøfting Transition Groups — Metodikk og Governance',
    author: 'Cathrine Barth',
    year: 2026,
    documentType: 'strategy',
    category: 'project',
    country: 'NO',
    tags: ['strategi', 'transition-groups', 'metodikk', 'governance', 'project'],
  },
  {
    sourceDocId: 'src-8',
    filename: '2026 TRANSITION GROUP OVERVIES WORKING DOC .pdf',
    title: 'Transition Group Overview — 10 Step Start Working Document',
    author: 'Nordic Circular Hotspot',
    year: 2026,
    documentType: 'strategy',
    category: 'project',
    country: 'Nordic',
    tags: ['10-step', 'transition-groups', 'arbeidsdokument', 'project'],
  },
  {
    sourceDocId: 'src-9',
    filename: 'Natural State AS Mail - Fwd_ NCH_ application 2025 # adjusted.pdf',
    title: 'NCH Application 2025 — Email from Martin Hagen',
    author: 'Martin Hagen / NCH',
    year: 2025,
    documentType: 'correspondence',
    category: 'project',
    country: 'Nordic',
    tags: ['epost', 'nch', 'soknad', 'project'],
  },
  {
    sourceDocId: 'src-10',
    filename: 'Natural State AS Mail - 2026 1401 DRØFTING TRANSITION GROUPS.pdf',
    title: 'Drøfting TG — Email from Cathrine Barth',
    author: 'Cathrine Barth',
    year: 2026,
    documentType: 'correspondence',
    category: 'project',
    country: 'NO',
    tags: ['epost', 'transition-groups', 'project'],
  },
  {
    sourceDocId: 'src-11',
    filename: '1. Food system_ Oslo Innovasjons program 2025  (1).md',
    title: 'Oslo Innovasjonsprogram 2025 — Copy',
    author: 'Natural State',
    year: 2025,
    documentType: 'application',
    category: 'project',
    country: 'NO',
    tags: ['soknad', 'oslo', 'duplikat', 'project'],
  },
  {
    sourceDocId: 'src-100',
    filename: 'docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md',
    title: 'Strategisk ledergruppe Marked 16. mars 2026',
    author: null,
    year: 2026,
    documentType: 'transcript',
    category: 'meetings',
    country: 'NO',
    tags: ['meeting', 'transkripsjon', 'marked', 'project'],
  },
]

function slugify(filename: string): string {
  return filename
    .replace(/\.(md|pdf|docx\.md)$/, '')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function extractMarkdownSummary(content: string): string | null {
  const lines = content.split('\n')
  const bodyLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('**') || trimmed.startsWith('>')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith(':---')) continue
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

  return joined.split(/\s+/).slice(0, 200).join(' ').trim() || null
}

async function main() {
  console.log('Importing root-level project documents...\n')

  let imported = 0
  let skipped = 0
  let linked = 0

  for (const config of ROOT_DOCS) {
    const fullPath = path.join(PROJECT_ROOT, config.filename)

    if (!fs.existsSync(fullPath)) {
      console.log(`  SKIP ${config.sourceDocId} — file not found: ${config.filename}`)
      skipped++
      continue
    }

    const slug = `root-${slugify(config.filename)}`
    const filePath = config.filename
    const isPdf = config.filename.endsWith('.pdf')

    let content: string
    let summary: string | null = null
    let wordCount: number

    if (isPdf) {
      content = [
        `# ${config.title}`,
        '',
        `- Type: ${config.documentType}`,
        `- Author: ${config.author ?? 'Unknown'}`,
        config.year ? `- Year: ${config.year}` : null,
        `- Source file: ${config.filename}`,
        '',
        'PDF document — full text not extracted.',
      ].filter(Boolean).join('\n')
      summary = config.tags.includes('duplikat')
        ? 'Duplicate of another document.'
        : `${config.title}. ${config.author ?? 'Unknown author'}.`
      wordCount = content.split(/\s+/).length
    } else {
      content = fs.readFileSync(fullPath, 'utf-8')
      summary = extractMarkdownSummary(content)
      wordCount = content.split(/\s+/).filter(Boolean).length
    }

    try {
      const doc = await prisma.document.upsert({
        where: { filePath },
        update: {
          title: config.title,
          author: config.author,
          year: config.year,
          category: config.category,
          country: config.country,
          content,
          summary,
          wordCount,
          documentType: config.documentType,
          slug,
          tags: config.tags,
          metadata: {
            canonicalFileType: isPdf ? 'pdf' : 'md',
            availabilityStatus: isPdf ? 'metadata-only' : 'fulltext',
            localPath: filePath,
            isRootDocument: true,
          },
        },
        create: {
          slug,
          filePath,
          title: config.title,
          author: config.author,
          year: config.year,
          category: config.category,
          country: config.country,
          content,
          summary,
          wordCount,
          documentType: config.documentType,
          tags: config.tags,
          metadata: {
            canonicalFileType: isPdf ? 'pdf' : 'md',
            availabilityStatus: isPdf ? 'metadata-only' : 'fulltext',
            localPath: filePath,
            isRootDocument: true,
          },
        },
      })

      console.log(`  IMPORTED ${config.sourceDocId} → Doc[${slug}]`)
      imported++

      const sourceDoc = await prisma.sourceDoc.findUnique({
        where: { id: config.sourceDocId },
        select: { id: true, documentId: true },
      })

      if (sourceDoc && !sourceDoc.documentId) {
        await prisma.sourceDoc.update({
          where: { id: sourceDoc.id },
          data: { documentId: doc.id },
        })
        console.log(`    LINKED → SourceDoc[${config.sourceDocId}]`)
        linked++
      } else if (sourceDoc?.documentId) {
        console.log(`    ALREADY LINKED SourceDoc[${config.sourceDocId}]`)
      }
    } catch (err) {
      console.error(`  FAILED ${config.sourceDocId}: ${err}`)
      skipped++
    }
  }

  console.log(`\nDone: ${imported} imported, ${linked} linked, ${skipped} skipped`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
