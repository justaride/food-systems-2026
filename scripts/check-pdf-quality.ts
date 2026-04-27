import { execFileSync, spawnSync } from 'child_process'
import { existsSync, openSync, readFileSync, readSync, closeSync, writeFileSync } from 'fs'
import { join } from 'path'

type Classification =
  | 'ok'
  | 'html-mis-saved'
  | 'scanned'
  | 'low-text'
  | 'encoding-issue'
  | 'invalid'
  | 'skipped-too-large'
  | 'missing-file'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'

type PdfCatalogEntry = {
  rel: string
  size: number
  mtime: string
  sha256: string
  pages?: number
  title?: string
  author?: string
  creationDate?: string
  producer?: string
  textHead?: string
}

type Finding = {
  rel: string
  classification: Classification
  fileSizeKb: number
  wordCount: number
  wordDensity: number
  encodingRatio: number
  severity: Severity
  action: string
  notes: string
}

const ROOT = process.cwd()
const RESEARCH_DIR = join(ROOT, 'research')
const CATALOG_PATH = join(RESEARCH_DIR, 'pdf-katalog.json')
const OUT_CSV = join(RESEARCH_DIR, 'PDF-QUALITY.csv')
const OUT_MD = join(RESEARCH_DIR, 'PDF-QUALITY.md')

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB cap
const HEAD_BYTES = 1024
const SCANNED_THRESHOLD = 50 // words per MB
const LOW_TEXT_THRESHOLD = 500 // words per MB
const ENCODING_REPLACEMENT_RATIO = 0.05

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function loadCatalog(): PdfCatalogEntry[] {
  if (!existsSync(CATALOG_PATH)) {
    throw new Error(`pdf-katalog.json not found at ${CATALOG_PATH}`)
  }
  const data = JSON.parse(readFileSync(CATALOG_PATH, 'utf-8'))
  if (!Array.isArray(data)) {
    throw new Error('pdf-katalog.json: expected an array')
  }
  return data as PdfCatalogEntry[]
}

function readHead(absPath: string, n: number): Buffer {
  const fd = openSync(absPath, 'r')
  try {
    const buf = Buffer.alloc(n)
    const read = readSync(fd, buf, 0, n, 0)
    return buf.subarray(0, read)
  } finally {
    closeSync(fd)
  }
}

function checkPdftotextAvailable(): boolean {
  const result = spawnSync('which', ['pdftotext'], { encoding: 'utf-8' })
  return result.status === 0 && Boolean(result.stdout.trim())
}

function extractText(absPath: string): string {
  // pdftotext -enc UTF-8 -layout - reads the file and writes plain text to stdout.
  // We use a 60s timeout per file to avoid hangs on broken PDFs.
  try {
    const out = execFileSync(
      'pdftotext',
      ['-enc', 'UTF-8', '-q', absPath, '-'],
      { encoding: 'utf-8', timeout: 60_000, maxBuffer: 64 * 1024 * 1024 },
    )
    return out
  } catch {
    return ''
  }
}

function classifyHead(head: Buffer): Classification | null {
  // PDF marker is %PDF- (0x25 0x50 0x44 0x46 0x2D)
  // Check for HTML markers (case-insensitive on first ~200 chars trimmed)
  const headStr = head.toString('utf-8', 0, Math.min(head.length, 512))
  const trimmed = headStr.replace(/^[\s﻿\xA0]+/, '')
  const lower = trimmed.toLowerCase()
  if (
    lower.startsWith('<!doctype') ||
    lower.startsWith('<html') ||
    lower.startsWith('<head') ||
    lower.startsWith('<?xml') && lower.includes('<html')
  ) {
    return 'html-mis-saved'
  }
  if (head.length >= 5) {
    if (
      head[0] === 0x25 &&
      head[1] === 0x50 &&
      head[2] === 0x44 &&
      head[3] === 0x46 &&
      head[4] === 0x2d
    ) {
      return null // valid PDF marker
    }
  }
  return 'invalid'
}

function countWords(text: string): number {
  if (!text) return 0
  // Split on whitespace and punctuation, drop empties.
  const tokens = text.split(/[\s\p{P}]+/u).filter((t) => t.length > 0)
  return tokens.length
}

function replacementRatio(text: string): number {
  if (!text) return 0
  const total = text.length
  if (total === 0) return 0
  // Replacement char + private-use placeholders + zero-width artifacts often used by OCR/encoding-broken PDFs
  let bad = 0
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    // U+FFFD replacement character
    if (code === 0xfffd) bad++
  }
  return bad / total
}

function classifyValid(
  pdftotextWorks: boolean,
  text: string,
  fileSizeBytes: number,
): { classification: Classification; wordCount: number; wordDensity: number; encodingRatio: number } {
  const wordCount = countWords(text)
  const sizeMb = fileSizeBytes / (1024 * 1024)
  const wordDensity = sizeMb > 0 ? wordCount / sizeMb : 0
  const encRatio = replacementRatio(text)

  if (!pdftotextWorks) {
    // We cannot analyze text content; classify as ok-pending so the report flags this.
    return { classification: 'ok', wordCount, wordDensity, encodingRatio: encRatio }
  }

  if (encRatio > ENCODING_REPLACEMENT_RATIO) {
    return { classification: 'encoding-issue', wordCount, wordDensity, encodingRatio: encRatio }
  }
  if (wordDensity < SCANNED_THRESHOLD) {
    return { classification: 'scanned', wordCount, wordDensity, encodingRatio: encRatio }
  }
  if (wordDensity < LOW_TEXT_THRESHOLD) {
    return { classification: 'low-text', wordCount, wordDensity, encodingRatio: encRatio }
  }
  return { classification: 'ok', wordCount, wordDensity, encodingRatio: encRatio }
}

function priorityFromCsv(): Map<string, number> {
  // Optional KI-PRIORITY signal — if Document/seed mapping cannot be done, we just
  // treat low-text as LOW severity. We keep this hook simple: returns an empty
  // map, severityFor does not depend on it for now.
  return new Map()
}

function severityFor(classification: Classification): Severity {
  switch (classification) {
    case 'html-mis-saved':
    case 'invalid':
      return 'HIGH'
    case 'scanned':
      return 'MEDIUM'
    case 'low-text':
      return 'LOW'
    case 'encoding-issue':
      return 'LOW'
    case 'skipped-too-large':
      return 'LOW'
    case 'missing-file':
      return 'MEDIUM'
    case 'ok':
    default:
      return 'NONE'
  }
}

function actionFor(classification: Classification): string {
  switch (classification) {
    case 'html-mis-saved':
      return 'Re-download as actual PDF or archive HTML correctly with .html extension'
    case 'invalid':
      return 'Re-download or remove corrupt file; investigate source URL'
    case 'scanned':
      return 'OCR required for KI/RAG ingestion (e.g. ocrmypdf)'
    case 'low-text':
      return 'Confirm intentional (chart/figure-heavy); consider OCR if priority HIGH'
    case 'encoding-issue':
      return 'Re-extract with alternative tooling (PyMuPDF/Tesseract) for clean text'
    case 'skipped-too-large':
      return 'Manually inspect and split if needed; current cap is 50 MB'
    case 'missing-file':
      return 'Restore PDF from source or remove catalog entry'
    case 'ok':
    default:
      return ''
  }
}

function sevRank(s: Severity): number {
  switch (s) {
    case 'HIGH':
      return 0
    case 'MEDIUM':
      return 1
    case 'LOW':
      return 2
    case 'NONE':
    default:
      return 3
  }
}

function main(): void {
  console.log('Food Systems 2026 — PDF quality check')
  console.log(`Run at: ${new Date().toISOString()}`)

  const catalog = loadCatalog()
  console.log(`  Catalog entries: ${catalog.length}`)

  const pdftotextWorks = checkPdftotextAvailable()
  console.log(`  pdftotext available: ${pdftotextWorks ? 'yes' : 'no'}`)

  // Reserved for future use; severity rules don't depend on priority right now.
  void priorityFromCsv()

  const findings: Finding[] = []
  let processed = 0
  let skippedLarge = 0
  let missingFiles = 0

  for (const entry of catalog) {
    const abs = join(RESEARCH_DIR, entry.rel)

    if (!existsSync(abs)) {
      missingFiles += 1
      findings.push({
        rel: entry.rel,
        classification: 'missing-file',
        fileSizeKb: Math.round(entry.size / 1024),
        wordCount: 0,
        wordDensity: 0,
        encodingRatio: 0,
        severity: severityFor('missing-file'),
        action: actionFor('missing-file'),
        notes: 'Catalog entry but file not present on disk',
      })
      continue
    }

    if (entry.size > MAX_BYTES) {
      skippedLarge += 1
      findings.push({
        rel: entry.rel,
        classification: 'skipped-too-large',
        fileSizeKb: Math.round(entry.size / 1024),
        wordCount: 0,
        wordDensity: 0,
        encodingRatio: 0,
        severity: severityFor('skipped-too-large'),
        action: actionFor('skipped-too-large'),
        notes: `File size ${(entry.size / 1024 / 1024).toFixed(1)} MB exceeds 50 MB cap`,
      })
      continue
    }

    const head = readHead(abs, HEAD_BYTES)
    const headClass = classifyHead(head)
    if (headClass !== null) {
      // html-mis-saved or invalid — no further extraction.
      findings.push({
        rel: entry.rel,
        classification: headClass,
        fileSizeKb: Math.round(entry.size / 1024),
        wordCount: 0,
        wordDensity: 0,
        encodingRatio: 0,
        severity: severityFor(headClass),
        action: actionFor(headClass),
        notes: `Header bytes: ${head.subarray(0, 16).toString('utf-8').replace(/[\x00-\x1f]/g, '.')}`,
      })
      processed += 1
      continue
    }

    // Valid PDF marker — try to extract text if pdftotext is available.
    let text = ''
    if (pdftotextWorks) {
      text = extractText(abs)
    }
    const result = classifyValid(pdftotextWorks, text, entry.size)
    findings.push({
      rel: entry.rel,
      classification: result.classification,
      fileSizeKb: Math.round(entry.size / 1024),
      wordCount: result.wordCount,
      wordDensity: Math.round(result.wordDensity),
      encodingRatio: Number(result.encodingRatio.toFixed(4)),
      severity: severityFor(result.classification),
      action: actionFor(result.classification),
      notes: pdftotextWorks
        ? ''
        : 'pdftotext not available — classification limited to header check',
    })
    processed += 1

    if (processed % 25 === 0) {
      console.log(`  Processed ${processed}/${catalog.length}`)
    }
  }

  // === CSV ===
  const csvLines = [
    'path,classification,file_size_kb,word_count,word_density,severity,action,notes',
    ...findings.map((f) =>
      [
        csvEscape(f.rel),
        f.classification,
        String(f.fileSizeKb),
        String(f.wordCount),
        String(f.wordDensity),
        f.severity,
        csvEscape(f.action),
        csvEscape(f.notes),
      ].join(','),
    ),
  ]
  writeFileSync(OUT_CSV, csvLines.join('\n') + '\n')

  // === Distribution ===
  const dist = new Map<Classification, number>()
  const sevDist = new Map<Severity, number>()
  for (const f of findings) {
    dist.set(f.classification, (dist.get(f.classification) ?? 0) + 1)
    sevDist.set(f.severity, (sevDist.get(f.severity) ?? 0) + 1)
  }

  const sortedFindings = [...findings].sort((a, b) => {
    if (sevRank(a.severity) !== sevRank(b.severity)) {
      return sevRank(a.severity) - sevRank(b.severity)
    }
    // For same severity, sort by word density ascending (worst first)
    if (a.classification === 'scanned' || a.classification === 'low-text') {
      return a.wordDensity - b.wordDensity
    }
    return a.fileSizeKb - b.fileSizeKb
  })

  const top30 = sortedFindings.slice(0, 30)
  const allHtmlMisSaved = findings.filter((f) => f.classification === 'html-mis-saved')
  const allInvalid = findings.filter((f) => f.classification === 'invalid')

  const classOrder: Classification[] = [
    'html-mis-saved',
    'invalid',
    'scanned',
    'low-text',
    'encoding-issue',
    'skipped-too-large',
    'missing-file',
    'ok',
  ]

  const md = [
    '# PDF-/tekstuttrekkskvalitet — research/',
    '',
    '> Auto-generert av `scripts/check-pdf-quality.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Catalog: **${catalog.length}** PDFs (kilde: \`research/pdf-katalog.json\`)`,
    `> Analysert: **${processed}** | Skippet (>50 MB): **${skippedLarge}** | Manglende fil: **${missingFiles}**`,
    `> pdftotext: **${pdftotextWorks ? 'tilgjengelig (Poppler)' : 'IKKE tilgjengelig — kun header-sjekk'}**`,
    '',
    '## Klassifiseringsfordeling',
    '',
    '| Klassifisering | Antall | Severity |',
    '|---|---:|---|',
    ...classOrder
      .filter((c) => (dist.get(c) ?? 0) > 0)
      .map((c) => `| ${c} | ${dist.get(c) ?? 0} | ${severityFor(c)} |`),
    '',
    '## Severity-fordeling',
    '',
    '| Severity | Antall |',
    '|---|---:|',
    ...(['HIGH', 'MEDIUM', 'LOW', 'NONE'] as Severity[])
      .filter((s) => (sevDist.get(s) ?? 0) > 0)
      .map((s) => `| ${s} | ${sevDist.get(s) ?? 0} |`),
    '',
    '## Topp 30 verste funn (etter severity)',
    '',
    '| # | Severity | Klassifisering | Størrelse (KB) | Ord | Tetthet | Sti |',
    '|---:|---|---|---:|---:|---:|---|',
    ...top30.map((f, i) => {
      const path = f.rel.length > 70 ? '…' + f.rel.slice(-67) : f.rel
      return `| ${i + 1} | ${f.severity} | ${f.classification} | ${f.fileSizeKb} | ${f.wordCount} | ${f.wordDensity} | \`${path}\` |`
    }),
    '',
    '## Alle html-mis-saved (KRITISK — bryter direkte med KI/RAG)',
    '',
    allHtmlMisSaved.length === 0
      ? '*Ingen html-mis-saved funn.*'
      : '| # | Sti | Størrelse (KB) | Notat |\n|---:|---|---:|---|\n' +
        allHtmlMisSaved
          .map(
            (f, i) =>
              `| ${i + 1} | \`${f.rel}\` | ${f.fileSizeKb} | ${f.notes.replace(/\|/g, '\\|')} |`,
          )
          .join('\n'),
    '',
    '## Alle invalid (ikke gyldig PDF)',
    '',
    allInvalid.length === 0
      ? '*Ingen invalid funn.*'
      : '| # | Sti | Størrelse (KB) | Notat |\n|---:|---|---:|---|\n' +
        allInvalid
          .map(
            (f, i) =>
              `| ${i + 1} | \`${f.rel}\` | ${f.fileSizeKb} | ${f.notes.replace(/\|/g, '\\|')} |`,
          )
          .join('\n'),
    '',
    '## Klassifiseringsregler',
    '',
    '- **html-mis-saved**: første 1024 byte starter med `<!DOCTYPE`, `<html`, `<HTML`, eller `<head`. Filen har `.pdf`-endelse, men er HTML.',
    '- **invalid**: filen starter ikke med `%PDF-` og er ikke HTML (sannsynligvis korrupt eller annet format).',
    '- **scanned**: gyldig PDF, men `word_density` (ord per MB) < ' +
      SCANNED_THRESHOLD +
      ' — image-only PDF som trenger OCR.',
    '- **low-text**: gyldig PDF med `word_density` mellom ' +
      SCANNED_THRESHOLD +
      ' og ' +
      LOW_TEXT_THRESHOLD +
      ' — sparsom tekst (chart/figur-tunge dokumenter).',
    '- **encoding-issue**: gyldig PDF, men > ' +
      (ENCODING_REPLACEMENT_RATIO * 100).toFixed(0) +
      '% av ekstrahert tekst er Unicode-erstatningstegn (U+FFFD).',
    '- **ok**: gyldig PDF med `word_density` ≥ ' + LOW_TEXT_THRESHOLD + ' og ren tekst.',
    '- **skipped-too-large**: filstørrelse > 50 MB (cap for analysetid).',
    '- **missing-file**: katalogoppføring uten fysisk fil på disk.',
    '',
    '## Severity-regler',
    '',
    '- **HIGH**: `html-mis-saved`, `invalid` — direkte ødelagte poster som påvirker KI/RAG-uthenting.',
    '- **MEDIUM**: `scanned`, `missing-file` — krever OCR eller restoration før KI-ingest.',
    '- **LOW**: `low-text`, `encoding-issue`, `skipped-too-large` — kvalitetsforbedring.',
    '- **NONE**: `ok` — ingen tiltak.',
    '',
    '## Tekstuttrekksmetode',
    '',
    pdftotextWorks
      ? '- `pdftotext -enc UTF-8 -q <file> -` (Poppler) brukes for tekstuttrekk.'
      : '- pdftotext er IKKE tilgjengelig på dette systemet. Kun header-baserte klassifikasjoner (`html-mis-saved`, `invalid`) er pålitelige; `scanned`, `low-text` og `encoding-issue` blir ikke detektert.',
    '- Word density = antall ord (split på whitespace + punctuation) delt på filstørrelse i MB.',
    '- 60-sekunders timeout per fil; tomstrenger ved feil tolkes som 0 ord.',
    '',
    '## Spesialtilfelle: agrianalyse-bondens-andel-2025',
    '',
    (() => {
      const agri = findings.find((f) => f.rel.includes('agrianalyse-bondens-andel-2025'))
      if (agri) {
        return (
          `Detektert: **${agri.classification}** (severity: ${agri.severity}). ` +
          `Notat: ${agri.notes}`
        )
      }
      return (
        'Ikke til stede i `pdf-katalog.json` — filen finnes ikke på disk i nåværende state. ' +
        'Den er dokumentert i `research/seed-pdf-map.json` og `research/REPORT-SOURCEURL-GAP-13.md` ' +
        'som kjent HTML-feil-lagret som PDF, men kan ikke verifiseres maskinelt herfra.'
      )
    })(),
    '',
  ].join('\n')

  writeFileSync(OUT_MD, md + '\n')

  console.log('')
  console.log(`Findings written: ${findings.length}`)
  console.log('  By classification:')
  for (const c of classOrder) {
    if ((dist.get(c) ?? 0) > 0) {
      console.log(`    ${c}: ${dist.get(c)}`)
    }
  }
  console.log('  By severity:')
  for (const s of ['HIGH', 'MEDIUM', 'LOW', 'NONE'] as Severity[]) {
    if ((sevDist.get(s) ?? 0) > 0) {
      console.log(`    ${s}: ${sevDist.get(s)}`)
    }
  }
  console.log('')
  console.log(`Output: ${OUT_CSV}`)
  console.log(`Output: ${OUT_MD}`)
}

main()
