import 'dotenv/config'
import { execFileSync, spawnSync } from 'child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import { basename, join, relative, resolve } from 'path'
import { tmpdir } from 'os'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { parseCsvRecords } from '../src/lib/csv'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ROOT = process.cwd()
const RESEARCH_DIR = join(ROOT, 'research')
const QUALITY_CSV = join(RESEARCH_DIR, 'PDF-QUALITY.csv')
const OCR_OUTPUT_DIR = join(RESEARCH_DIR, 'ocr-output')
const OCR_LOG_PATH = join(RESEARCH_DIR, 'OCR-LOG.md')
const OCR_REVIEW_CSV_PATH = join(RESEARCH_DIR, 'PDF-OCR-REVIEW.csv')

const MIN_FILE_BYTES = 10 * 1024 // 10 KB — skip smaller (likely corrupt)
const OCR_LANGS = 'eng+nor'
const OCR_DPI = 300
const OCR_TIMEOUT_MS = 15 * 60_000 // 15 min per PDF — Impact Report can run long
const SUBSTANTIAL_WORD_THRESHOLD = 500

type CsvRow = {
  path: string
  classification: string
  fileSizeKb: number
  wordCount: number
  wordDensity: number
  severity: string
  action: string
  notes: string
}

type Action = 'updated' | 'archived' | 'skipped'

type Outcome = {
  rel: string
  abs: string
  fileSizeKb: number
  originalWordCount: number
  ocrWordCount: number
  action: Action
  reason: string
  archivePath: string | null
  documentId: string | null
  pages: number
}

function loadScannedRows(): CsvRow[] {
  if (!existsSync(QUALITY_CSV)) {
    throw new Error(`PDF-QUALITY.csv not found at ${QUALITY_CSV}`)
  }
  const records = parseCsvRecords(readFileSync(QUALITY_CSV, 'utf-8'))
  const rows: CsvRow[] = []
  for (const record of records) {
    if (!record.path) continue
    const row: CsvRow = {
      path: record.path,
      classification: record.classification,
      fileSizeKb: Number(record.file_size_kb) || 0,
      wordCount: Number(record.word_count) || 0,
      wordDensity: Number(record.word_density) || 0,
      severity: record.severity,
      action: record.action,
      notes: record.notes,
    }
    if (row.classification === 'scanned') rows.push(row)
  }
  return rows
}

function checkBin(name: string): boolean {
  const r = spawnSync('which', [name], { encoding: 'utf-8' })
  return r.status === 0 && Boolean(r.stdout.trim())
}

function rasterize(absPdf: string, workDir: string): string[] {
  // pdftoppm -r 300 INPUT prefix → produces prefix-1.png, prefix-2.png, ...
  const prefix = join(workDir, 'page')
  execFileSync('pdftoppm', ['-r', String(OCR_DPI), '-png', absPdf, prefix], {
    timeout: OCR_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  return readdirSync(workDir)
    .filter(name => name.startsWith('page-') && name.endsWith('.png'))
    .map(name => join(workDir, name))
    .sort((a, b) => {
      const na = Number(basename(a).replace(/^page-/, '').replace(/\.png$/, ''))
      const nb = Number(basename(b).replace(/^page-/, '').replace(/\.png$/, ''))
      return na - nb
    })
}

function ocrPage(absPng: string): string {
  // tesseract <png> stdout -l eng+nor
  try {
    const out = execFileSync('tesseract', [absPng, 'stdout', '-l', OCR_LANGS], {
      encoding: 'utf-8',
      timeout: OCR_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    return out
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`    tesseract failed on ${basename(absPng)}: ${msg}`)
    return ''
  }
}

function countWords(text: string): number {
  if (!text) return 0
  return text.split(/[\s\p{P}]+/u).filter(t => t.length > 0).length
}

function safeBaseName(rel: string): string {
  return rel.replace(/[\/\\]+/g, '__').replace(/\.pdf$/i, '')
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

async function findDocumentByFilePath(rel: string): Promise<{
  id: string
  filePath: string
  content: string
  title: string
} | null> {
  const variants = new Set<string>([rel])
  // Try without leading research/ if present, etc.
  if (rel.startsWith('research/')) variants.add(rel.slice('research/'.length))
  // Also try fully-qualified relPath that schema may store
  const exact = await prisma.document.findFirst({
    where: { filePath: { in: Array.from(variants) } },
    select: { id: true, filePath: true, content: true, title: true },
  })
  if (exact) return exact
  // Fallback: filename match (last segment) — less reliable but covers basename-only refs
  const fileName = rel.split('/').pop()
  if (!fileName) return null
  const byFilename = await prisma.document.findFirst({
    where: { filePath: { endsWith: fileName } },
    select: { id: true, filePath: true, content: true, title: true },
  })
  return byFilename
}

async function processPdf(row: CsvRow): Promise<Outcome> {
  const abs = resolve(RESEARCH_DIR, row.path)
  const outcome: Outcome = {
    rel: row.path,
    abs,
    fileSizeKb: row.fileSizeKb,
    originalWordCount: row.wordCount,
    ocrWordCount: 0,
    action: 'skipped',
    reason: '',
    archivePath: null,
    documentId: null,
    pages: 0,
  }

  if (!existsSync(abs)) {
    outcome.reason = 'File not found on disk'
    return outcome
  }

  const stat = statSync(abs)
  if (stat.size < MIN_FILE_BYTES) {
    outcome.reason = `File size ${stat.size} B < ${MIN_FILE_BYTES} B threshold (likely corrupt)`
    return outcome
  }

  console.log(`\n[OCR] ${row.path}`)
  console.log(`  Size: ${(stat.size / 1024 / 1024).toFixed(2)} MB | original wordCount: ${row.wordCount}`)

  // Per-PDF working directory under TMPDIR (sandbox-safe).
  const tmpRoot = process.env.TMPDIR || tmpdir()
  const workDir = join(
    tmpRoot,
    `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  )
  mkdirSync(workDir, { recursive: true })

  let pages: string[] = []
  try {
    const t0 = Date.now()
    console.log(`  Rasterizing at ${OCR_DPI} dpi...`)
    pages = rasterize(abs, workDir)
    console.log(`  Pages: ${pages.length} (rasterize ${(Date.now() - t0) / 1000}s)`)
    outcome.pages = pages.length

    if (pages.length === 0) {
      outcome.reason = 'pdftoppm produced no pages'
      return outcome
    }

    const ocrChunks: string[] = []
    const tOcr0 = Date.now()
    for (let i = 0; i < pages.length; i++) {
      const txt = ocrPage(pages[i])
      ocrChunks.push(`--- Page ${i + 1} ---\n${txt.trim()}`)
      if ((i + 1) % 10 === 0 || i === pages.length - 1) {
        console.log(`    OCR ${i + 1}/${pages.length}`)
      }
    }
    const ocrText = ocrChunks.join('\n\n').trim()
    const ocrWords = countWords(ocrText)
    outcome.ocrWordCount = ocrWords
    console.log(
      `  OCR done: ${ocrWords} words (${((Date.now() - tOcr0) / 1000).toFixed(1)}s)`,
    )

    if (ocrText.length === 0) {
      outcome.reason = 'OCR produced no text'
      return outcome
    }

    // Always archive OCR output for traceability.
    if (!existsSync(OCR_OUTPUT_DIR)) mkdirSync(OCR_OUTPUT_DIR, { recursive: true })
    const archivePath = join(OCR_OUTPUT_DIR, `${safeBaseName(row.path)}.md`)
    const archiveBody = [
      `# OCR Output — ${basename(row.path)}`,
      '',
      `> Source PDF: \`${row.path}\``,
      `> Generated: ${new Date().toISOString()}`,
      `> Tool: pdftoppm (${OCR_DPI} dpi PNG) + tesseract -l ${OCR_LANGS}`,
      `> Pages: ${pages.length} | OCR words: ${ocrWords}`,
      '',
      '---',
      '',
      ocrText,
      '',
    ].join('\n')
    writeFileSync(archivePath, archiveBody)
    outcome.archivePath = archivePath
    console.log(`  Archived: research/ocr-output/${basename(archivePath)}`)

    // Locate matching Document.
    const doc = await findDocumentByFilePath(row.path)
    if (!doc) {
      outcome.action = 'archived'
      outcome.reason = 'No Document with matching filePath — archived only'
      console.log(`  No Document match for filePath=${row.path}`)
      return outcome
    }

    const existingWords = countWords(doc.content || '')
    console.log(`  Document found: id=${doc.id} | existing words: ${existingWords}`)

    if (existingWords > SUBSTANTIAL_WORD_THRESHOLD && existingWords >= ocrWords) {
      outcome.action = 'archived'
      outcome.reason = `Document already has ${existingWords} words (>${SUBSTANTIAL_WORD_THRESHOLD}) — archived only`
      return outcome
    }

    if (ocrWords <= existingWords) {
      outcome.action = 'archived'
      outcome.reason = `OCR (${ocrWords} words) does not improve over existing (${existingWords}) — archived only`
      return outcome
    }

    const newContent =
      (doc.content || '').trim() +
      '\n\n--- OCR-extracted text ---\n\n' +
      ocrText
    await prisma.document.update({
      where: { id: doc.id },
      data: {
        content: newContent,
        wordCount: countWords(newContent),
      },
    })
    outcome.action = 'updated'
    outcome.documentId = doc.id
    outcome.reason = `Document.content updated (${existingWords} → ${countWords(newContent)} words)`
    console.log(`  ✓ Updated Document ${doc.id}: ${existingWords} → ${countWords(newContent)} words`)
  } finally {
    // Cleanup working dir.
    try {
      for (const p of pages) {
        try {
          unlinkSync(p)
        } catch {
          /* ignore */
        }
      }
      rmSync(workDir, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
  }

  return outcome
}

function writeOcrLog(outcomes: Outcome[], elapsedSec: number): void {
  const totalOcrWords = outcomes.reduce((s, o) => s + o.ocrWordCount, 0)
  const updated = outcomes.filter(o => o.action === 'updated').length
  const archived = outcomes.filter(o => o.action === 'archived').length
  const skipped = outcomes.filter(o => o.action === 'skipped').length

  const md = [
    '# OCR-LOG — scanned PDFs',
    '',
    '> Auto-generert av `scripts/ocr-scanned-pdfs.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Verktøy: pdftoppm (${OCR_DPI} dpi PNG) + tesseract -l ${OCR_LANGS}`,
    `> Kilde: \`research/PDF-QUALITY.csv\` (filter classification=scanned)`,
    `> Totalt prosessert: **${outcomes.length}** | Tid: **${elapsedSec.toFixed(1)} s**`,
    '',
    '## Sammendrag',
    '',
    '| Aksjon | Antall |',
    '|---|---:|',
    `| Document oppdatert | ${updated} |`,
    `| Kun arkivert (research/ocr-output/) | ${archived} |`,
    `| Hoppet over | ${skipped} |`,
    `| **Totalt OCR-ord** | **${totalOcrWords.toLocaleString('nb-NO')}** |`,
    '',
    '## Per PDF',
    '',
    '| # | Fil | KB | Sider | Original ord | OCR ord | Aksjon | Begrunnelse |',
    '|---:|---|---:|---:|---:|---:|---|---|',
    ...outcomes.map((o, i) => {
      const shortPath = o.rel.length > 80 ? '…' + o.rel.slice(-77) : o.rel
      return `| ${i + 1} | \`${shortPath}\` | ${o.fileSizeKb} | ${o.pages} | ${o.originalWordCount} | ${o.ocrWordCount} | ${o.action} | ${o.reason.replace(/\|/g, '\\|')} |`
    }),
    '',
    '## Document-oppdateringer',
    '',
    updated === 0
      ? '*Ingen Document-oppdateringer.*'
      : '| # | Document.id | Fil | OCR ord |\n|---:|---|---|---:|\n' +
        outcomes
          .filter(o => o.action === 'updated')
          .map(
            (o, i) =>
              `| ${i + 1} | \`${o.documentId}\` | \`${o.rel}\` | ${o.ocrWordCount} |`,
          )
          .join('\n'),
    '',
    '## Konstanter',
    '',
    `- DPI: \`${OCR_DPI}\``,
    `- Språk: \`${OCR_LANGS}\``,
    `- Per-PDF timeout: \`${OCR_TIMEOUT_MS / 60_000} min\``,
    `- Min filstørrelse (skip-grense): \`${MIN_FILE_BYTES / 1024} KB\``,
    `- "Substantial content" terskel: \`${SUBSTANTIAL_WORD_THRESHOLD} ord\``,
    '',
    '## Fremgangsmåte',
    '',
    '1. Les `research/PDF-QUALITY.csv`, filtrer `classification=scanned`.',
    '2. For hver PDF: skip hvis < 10 KB (sannsynlig korrupt).',
    '3. `pdftoppm -r 300 -png INPUT $TMPDIR/page` → en PNG per side.',
    '4. `tesseract page-N.png stdout -l eng+nor` per side, sammenslått tekst.',
    '5. Arkiver alltid OCR-tekst i `research/ocr-output/<basename>.md`.',
    '6. Slå opp `Document` på `filePath` (eksakt match, så filename-fallback).',
    '7. Oppdater `Document.content` kun hvis OCR gir flere ord enn eksisterende, og ',
    '   eksisterende ikke allerede er "substantial" (> 500 ord).',
    '8. Bevar eksisterende kontekst: `existing + "\\n\\n--- OCR-extracted text ---\\n\\n" + ocr`.',
    '',
  ].join('\n')

  writeFileSync(OCR_LOG_PATH, md + '\n')
  writeFileSync(
    OCR_REVIEW_CSV_PATH,
    [
      'path,action,ocr_word_count,archive_path,document_id,reason',
      ...outcomes.map(o =>
        [
          csvEscape(o.rel),
          o.action,
          String(o.ocrWordCount),
          csvEscape(o.archivePath ? relative(ROOT, o.archivePath) : ''),
          o.documentId ?? '',
          csvEscape(o.reason),
        ].join(','),
      ),
    ].join('\n') + '\n',
  )
  console.log(`\nOCR-LOG written: ${OCR_LOG_PATH}`)
  console.log(`PDF-OCR-REVIEW written: ${OCR_REVIEW_CSV_PATH}`)
}

async function main(): Promise<void> {
  console.log('Food Systems 2026 — OCR scanned PDFs')
  console.log(`Run at: ${new Date().toISOString()}`)

  for (const bin of ['pdftoppm', 'tesseract']) {
    if (!checkBin(bin)) {
      console.error(`ERROR: required binary not found in PATH: ${bin}`)
      process.exit(1)
    }
  }

  const rows = loadScannedRows()
  console.log(`Scanned PDFs in PDF-QUALITY.csv: ${rows.length}`)

  if (!existsSync(OCR_OUTPUT_DIR)) mkdirSync(OCR_OUTPUT_DIR, { recursive: true })

  const t0 = Date.now()
  const outcomes: Outcome[] = []
  for (const row of rows) {
    try {
      const o = await processPdf(row)
      outcomes.push(o)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ERROR processing ${row.path}: ${msg}`)
      outcomes.push({
        rel: row.path,
        abs: resolve(RESEARCH_DIR, row.path),
        fileSizeKb: row.fileSizeKb,
        originalWordCount: row.wordCount,
        ocrWordCount: 0,
        action: 'skipped',
        reason: `Error: ${msg.slice(0, 200)}`,
        archivePath: null,
        documentId: null,
        pages: 0,
      })
    }
  }
  const elapsedSec = (Date.now() - t0) / 1000

  writeOcrLog(outcomes, elapsedSec)

  console.log('')
  console.log('=== Summary ===')
  console.log(`  Updated:  ${outcomes.filter(o => o.action === 'updated').length}`)
  console.log(`  Archived: ${outcomes.filter(o => o.action === 'archived').length}`)
  console.log(`  Skipped:  ${outcomes.filter(o => o.action === 'skipped').length}`)
  console.log(`  Total OCR words: ${outcomes.reduce((s, o) => s + o.ocrWordCount, 0)}`)
  console.log(`  Elapsed: ${elapsedSec.toFixed(1)} s`)
}

main()
  .catch(err => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
