import 'dotenv/config'
import { promises as fs } from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const REVIEW_CSV = path.join(ROOT, 'research/intake/food-research-process-2026-04-20/review.csv')
const SUMMARY_JSON = path.join(ROOT, 'research/intake/food-research-process-2026-04-20/import-summary.json')

type ReviewRow = {
  source_path: string
  source_top_folder: string
  filename: string
  ext: string
  size_bytes: string
  modified_at: string
  sha256: string
  priority: string
  project_fit: string
  candidate_model: string
  typed_layer_candidate: string
  import_file_path: string
  proposed_title: string
  proposed_year: string
  proposed_country: string
  proposed_theme: string
  proposed_doc_type: string
  review_status: string
  action: string
  final_title: string
  final_year: string
  final_country: string
  final_theme: string
  final_doc_type: string
  final_url: string
  notes: string
}

type CliOptions = {
  dryRun: boolean
}

function parseArgs(): CliOptions {
  return {
    dryRun: process.argv.slice(2).includes('--dry-run'),
  }
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((value) => value.length > 0)) rows.push(row)
  }

  return rows
}

function extractMarkdownSummary(content: string): string | null {
  const lines = content.split('\n')
  const bodyLines: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---') || trimmed.startsWith('>')) continue
    if (trimmed.startsWith('|') || trimmed.startsWith(':---')) continue
    bodyLines.push(trimmed)
    if (bodyLines.length >= 10) break
  }

  if (bodyLines.length === 0) return null
  return bodyLines.join(' ').split(/\s+/).slice(0, 120).join(' ').trim() || null
}

function detectPdfAvailabilityStatus(filePath: string): 'fulltext-pdf' | 'metadata-only' {
  try {
    const raw = execFileSync('xxd', ['-l', '5', '-ps', filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    return raw.toLowerCase() === '255044462d' ? 'fulltext-pdf' : 'metadata-only'
  } catch {
    return 'metadata-only'
  }
}

function readPdfMetadata(filePath: string): { title: string | null; pages: number | null } {
  try {
    const output = execFileSync('pdfinfo', [filePath], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    let title: string | null = null
    let pages: number | null = null

    for (const line of output.split('\n')) {
      const [key, ...rest] = line.split(':')
      if (!key || rest.length === 0) continue
      const value = rest.join(':').trim()
      if (key.trim().toLowerCase() === 'title' && value) title = value
      if (key.trim().toLowerCase() === 'pages' && value) pages = Number(value)
    }

    return { title, pages }
  } catch {
    return { title: null, pages: null }
  }
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function pickValue(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    if (value && value.trim()) return value.trim()
  }
  return null
}

function parseYear(value: string | null | undefined): number | null {
  if (!value) return null
  const match = value.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

async function loadReviewRows(): Promise<ReviewRow[]> {
  const raw = await fs.readFile(REVIEW_CSV, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  return dataRows
    .filter((row) => (row[index.source_path] ?? '').trim())
    .map((row) => ({
      source_path: row[index.source_path] ?? '',
      source_top_folder: row[index.source_top_folder] ?? '',
      filename: row[index.filename] ?? '',
      ext: row[index.ext] ?? '',
      size_bytes: row[index.size_bytes] ?? '',
      modified_at: row[index.modified_at] ?? '',
      sha256: row[index.sha256] ?? '',
      priority: row[index.priority] ?? '',
      project_fit: row[index.project_fit] ?? '',
      candidate_model: row[index.candidate_model] ?? '',
      typed_layer_candidate: row[index.typed_layer_candidate] ?? '',
      import_file_path: row[index.import_file_path] ?? '',
      proposed_title: row[index.proposed_title] ?? '',
      proposed_year: row[index.proposed_year] ?? '',
      proposed_country: row[index.proposed_country] ?? '',
      proposed_theme: row[index.proposed_theme] ?? '',
      proposed_doc_type: row[index.proposed_doc_type] ?? '',
      review_status: row[index.review_status] ?? '',
      action: row[index.action] ?? '',
      final_title: row[index.final_title] ?? '',
      final_year: row[index.final_year] ?? '',
      final_country: row[index.final_country] ?? '',
      final_theme: row[index.final_theme] ?? '',
      final_doc_type: row[index.final_doc_type] ?? '',
      final_url: row[index.final_url] ?? '',
      notes: row[index.notes] ?? '',
    }))
}

async function main(): Promise<void> {
  const opts = parseArgs()
  const rows = await loadReviewRows()
  const selected = rows.filter((row) => row.action.trim().toLowerCase() === 'import')

  const summary = {
    generatedAt: new Date().toISOString(),
    dryRun: opts.dryRun,
    reviewCsv: path.relative(ROOT, REVIEW_CSV),
    selected: selected.length,
    imported: 0,
    skipped: 0,
    records: [] as Array<{ sourcePath: string; filePath: string; title: string; status: string }>,
  }

  if (selected.length === 0) {
    await fs.mkdir(path.dirname(SUMMARY_JSON), { recursive: true })
    await fs.writeFile(SUMMARY_JSON, JSON.stringify(summary, null, 2) + '\n', 'utf8')
    console.log('[food-process-import] no rows marked action=import')
    return
  }

  let prisma: PrismaClient | null = null

  if (!opts.dryRun) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
    prisma = new PrismaClient({ adapter })
  }

  try {
    for (const row of selected) {
      const sourcePath = path.join(ROOT, row.source_path)
      const title = pickValue(row.final_title, row.proposed_title, row.filename) ?? row.filename
      const year = parseYear(pickValue(row.final_year, row.proposed_year))
      const country = pickValue(row.final_country, row.proposed_country)
      const theme = pickValue(row.final_theme, row.proposed_theme) ?? 'unreviewed'
      const documentType = pickValue(row.final_doc_type, row.proposed_doc_type) ?? 'report'
      const url = pickValue(row.final_url)
      const filePath = row.import_file_path
      const slug = `incoming-${slugify(filePath)}`

      let content = ''
      let summaryText: string | null = null
      let wordCount = 0
      let availabilityStatus = 'metadata-only'
      let metadata: Record<string, unknown> = {
        importedFrom: 'research/arkiv-sortert',
        sourcePath: row.source_path,
        sourceTopFolder: row.source_top_folder,
        sha256: row.sha256,
        reviewStatus: row.review_status || 'approved',
        action: row.action,
        priority: row.priority,
        projectFit: row.project_fit,
        candidateModel: row.candidate_model,
        typedLayerCandidate: row.typed_layer_candidate,
        importBatch: 'food-research-process-2026-04-20',
        notes: row.notes || null,
      }

      try {
        const raw = await fs.readFile(sourcePath)

        if (row.ext === '.md') {
          const text = raw.toString('utf8')
          content = text
          wordCount = text.split(/\s+/).filter(Boolean).length
          summaryText = extractMarkdownSummary(text)
          availabilityStatus = 'fulltext'
          metadata = {
            ...metadata,
            canonicalFileType: 'md',
            availabilityStatus,
          }
        } else if (row.ext === '.pdf') {
          const pdfMeta = readPdfMetadata(sourcePath)
          availabilityStatus = detectPdfAvailabilityStatus(sourcePath)
          content = [
            `# ${title}`,
            '',
            '- Importtype: incoming-review PDF',
            `- Source file: ${row.source_path}`,
            pdfMeta.pages ? `- Pages: ${pdfMeta.pages}` : null,
            url ? `- URL: ${url}` : null,
            '',
            'This file was imported as a reviewed staging document from research/arkiv-sortert.',
          ].filter(Boolean).join('\n')
          wordCount = content.split(/\s+/).filter(Boolean).length
          summaryText = `Incoming PDF staged from reviewed intake. ${pdfMeta.pages ? `${pdfMeta.pages} pages.` : ''}`.trim()
          metadata = {
            ...metadata,
            canonicalFileType: 'pdf',
            availabilityStatus,
            pageCount: pdfMeta.pages,
            pdfTitle: pdfMeta.title,
          }
        } else {
          content = [
            `# ${title}`,
            '',
            '- Importtype: incoming-review metadata-only file',
            `- Source file: ${row.source_path}`,
            `- File extension: ${row.ext || 'unknown'}`,
            url ? `- URL: ${url}` : null,
            '',
            'Binary or non-markdown source retained as a metadata-only staging document.',
          ].filter(Boolean).join('\n')
          wordCount = content.split(/\s+/).filter(Boolean).length
          summaryText = `Metadata-only staging document imported from ${row.source_top_folder}.`
          metadata = {
            ...metadata,
            canonicalFileType: row.ext.replace(/^\./, '') || 'binary',
            availabilityStatus,
          }
        }
      } catch (error) {
        summary.skipped++
        summary.records.push({
          sourcePath: row.source_path,
          filePath,
          title,
          status: `missing-source: ${String(error)}`,
        })
        continue
      }

      if (opts.dryRun) {
        summary.imported++
        summary.records.push({
          sourcePath: row.source_path,
          filePath,
          title,
          status: 'dry-run',
        })
        continue
      }

      if (!prisma) throw new Error('Prisma client was not initialized.')

      await prisma.document.upsert({
        where: { filePath },
        update: {
          slug,
          title,
          year,
          country,
          category: 'incoming',
          subcategory: `food-research-process-2026-04-20/${theme}`,
          documentType,
          content,
          summary: summaryText,
          url,
          wordCount,
          tags: [
            'incoming',
            'food-research-process-2026-04-20',
            theme,
            row.source_top_folder,
            row.ext.replace(/^\./, '') || 'unknown',
          ].filter(Boolean),
          metadata,
        },
        create: {
          slug,
          filePath,
          title,
          year,
          country,
          category: 'incoming',
          subcategory: `food-research-process-2026-04-20/${theme}`,
          documentType,
          content,
          summary: summaryText,
          url,
          wordCount,
          tags: [
            'incoming',
            'food-research-process-2026-04-20',
            theme,
            row.source_top_folder,
            row.ext.replace(/^\./, '') || 'unknown',
          ].filter(Boolean),
          metadata,
        },
      })

      summary.imported++
      summary.records.push({
        sourcePath: row.source_path,
        filePath,
        title,
        status: 'imported',
      })
    }
  } finally {
    if (prisma) await prisma.$disconnect()
  }

  await fs.mkdir(path.dirname(SUMMARY_JSON), { recursive: true })
  await fs.writeFile(SUMMARY_JSON, JSON.stringify(summary, null, 2) + '\n', 'utf8')
  console.log(`[food-process-import] selected=${summary.selected} imported=${summary.imported} skipped=${summary.skipped} dryRun=${opts.dryRun}`)
  console.log(`[food-process-import] summary=${path.relative(ROOT, SUMMARY_JSON)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
