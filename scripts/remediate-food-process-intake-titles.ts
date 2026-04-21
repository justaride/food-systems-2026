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
const BATCH_NAME = 'food-research-process-2026-04-20'
const INTAKE_DIR = path.join(ROOT, `research/intake/${BATCH_NAME}`)
const REVIEW_CSV = path.join(INTAKE_DIR, 'review.csv')
const TITLE_REMEDIATION_CSV = path.join(INTAKE_DIR, 'title-remediation.csv')
const TITLE_REMEDIATION_MD = path.join(INTAKE_DIR, 'TITLE-REMEDIATION.md')
const TITLE_REMEDIATION_JSON = path.join(INTAKE_DIR, 'title-remediation-summary.json')

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

type BatchDocument = {
  id: string
  filePath: string
  title: string
  metadata: Record<string, unknown> | null
}

type WeakReason =
  | 'excess_whitespace'
  | 'generic_short_title'
  | 'truncated_source_title'
  | 'leading_identifier'
  | 'artifact_label'
  | 'all_caps_identifier'

type SuggestionSource = 'whitespace' | 'pdf-metadata' | 'pdf-heading' | 'markdown-heading' | 'filename'
type Confidence = 'high' | 'medium' | 'low'

type Suggestion = {
  suggestedTitle: string
  source: SuggestionSource
  reason: string
  confidence: Confidence
  autoApply: boolean
}

type AuditRow = {
  documentId: string
  filePath: string
  sourcePath: string
  ext: string
  currentTitle: string
  suggestedTitle: string
  suggestionSource: SuggestionSource | 'manual-review'
  reason: string
  confidence: Confidence
  weakReasons: string[]
  autoApply: boolean
  applied: boolean
  reviewStatus: string
  reviewAction: string
  reviewFinalTitle: string
  notes: string
}

type LoadedReviewRow = {
  raw: string[]
  data: ReviewRow
}

type LoadedReviewCsv = {
  header: string[]
  index: Record<string, number>
  rows: LoadedReviewRow[]
}

type CliOptions = {
  apply: boolean
}

const GENERIC_SINGLE_LINE_LABELS = new Set([
  'abstract',
  'appendix',
  'bilag',
  'draft',
  'final',
  'notat',
  'paper',
  'rapport',
  'report',
  'summary',
])

const GENERIC_TITLE_WORDS = new Set([
  'af',
  'analyse',
  'analysis',
  'annual',
  'arsrapport',
  'aarsrapport',
  'brief',
  'document',
  'draft',
  'final',
  'for',
  'memo',
  'notat',
  'paper',
  'rapport',
  'report',
  'study',
  'summary',
  'thesis',
])

const ARTIFACT_TOKENS = [
  'artifact',
  'compass',
  'deep research report',
  'draft',
  'final',
  'fulltext',
  'markdown',
  'print',
  'scan',
  'untitled',
  'web',
  'wf-',
]

const HEADING_STOP_PATTERNS = [
  /^(rapport fra|report from)\b/i,
  /^(av|by)\b/i,
  /^(veileder|vejleder)\b/i,
  /^(aalborg universitet|universitet|university)\b/i,
  /^(menon-publikasjon|menon publication)\b/i,
  /^(gruppe|group)\b/i,
  /^(january|february|march|april|may|june|july|august|september|october|november|december)\b/i,
]

const HEADING_SKIP_PATTERNS = [
  /downloaded from/i,
  /doctoral theses/i,
  /isbn\b/i,
  /issn\b/i,
  /natural resources and bioeconomy studies/i,
  /number of credits/i,
  /programme of study/i,
  /^author:/i,
  /^tutor:/i,
  /faculty of/i,
  /department of/i,
  /university dissertations/i,
]

const HEADING_UNSAFE_PATTERNS = [
  /a h2020/i,
  /bachelor thesis within/i,
  /doctoral theses/i,
  /downloaded from/i,
  /dette er/i,
  /isbn\b/i,
  /issn\b/i,
  /oe\.cd\//i,
  /^innhold\b/i,
  /natural resources and bioeconomy studies/i,
  /number of credits/i,
  /programme of study/i,
  /faculty of/i,
  /department of/i,
  /lokaverkefni/i,
]

const SMALL_WORDS = new Set([
  'a',
  'af',
  'an',
  'and',
  'av',
  'de',
  'den',
  'det',
  'for',
  'fra',
  'i',
  'in',
  'med',
  'of',
  'og',
  'on',
  'or',
  'på',
  'som',
  'the',
  'til',
  'to',
  'und',
  'with',
])

function parseArgs(): CliOptions {
  return {
    apply: process.argv.slice(2).includes('--apply'),
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

function stringifyCsv(rows: string[][]): string {
  return (
    rows
      .map((row) =>
        row
          .map((value) => {
            const field = value ?? ''
            if (/[",\n\r]/.test(field)) return `"${field.replace(/"/g, '""')}"`
            return field
          })
          .join(','),
      )
      .join('\n') + '\n'
  )
}

async function writeFileAtomically(filePath: string, content: string): Promise<void> {
  const tempPath = `${filePath}.tmp-${process.pid}-${Date.now()}`

  try {
    await fs.writeFile(tempPath, content, 'utf8')
    await fs.rename(tempPath, filePath)
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => undefined)
    throw error
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function normalizeComparison(value: string): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9/ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenizeComparison(value: string): string[] {
  return normalizeComparison(value)
    .split(' ')
    .map((token) => token.trim())
    .filter(Boolean)
}

function wordCount(value: string): number {
  return normalizeWhitespace(value).split(' ').filter(Boolean).length
}

function hasUppercase(value: string): boolean {
  return /[A-ZÆØÅ]/.test(value)
}

function isMostlyUppercase(value: string): boolean {
  const letters = value.replace(/[^A-Za-zÆØÅæøå]/g, '')
  if (!letters) return false
  const upper = letters.replace(/[^A-ZÆØÅ]/g, '')
  return upper.length / letters.length >= 0.6
}

function humanizeFilename(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[._]+/g, ' ')
    .replace(/[-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleCaseToken(token: string, index: number): string {
  const match = token.match(/^([^A-Za-zÆØÅæøå0-9]*)(.*?)([^A-Za-zÆØÅæøå0-9]*)$/)
  if (!match) return token

  const [, prefix, core, suffix] = match
  if (!core) return token
  if (/[0-9]/.test(core) || core.includes('/')) return `${prefix}${core.toUpperCase()}${suffix}`

  const lower = core.toLowerCase()
  if (index > 0 && SMALL_WORDS.has(lower)) return `${prefix}${lower}${suffix}`
  if (core === core.toUpperCase() && core.length <= 3) return `${prefix}${core}${suffix}`
  return `${prefix}${lower.charAt(0).toUpperCase()}${lower.slice(1)}${suffix}`
}

function normalizeCandidateCasing(value: string): string {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return normalized
  if (!isMostlyUppercase(normalized)) return normalized
  return normalized
    .split(' ')
    .map((token, index) => titleCaseToken(token, index))
    .join(' ')
}

function tokenOverlap(a: string, b: string): number {
  const left = new Set(tokenizeComparison(a).filter((token) => !GENERIC_TITLE_WORDS.has(token)))
  const right = new Set(tokenizeComparison(b).filter((token) => !GENERIC_TITLE_WORDS.has(token)))

  if (left.size === 0 || right.size === 0) return 0

  let shared = 0
  for (const token of left) {
    if (right.has(token)) shared++
  }

  return shared / Math.max(left.size, right.size)
}

function isGenericShortTitle(value: string): boolean {
  const tokens = tokenizeComparison(value).filter((token) => !/^\d+$/.test(token))
  if (tokens.length === 0) return true
  if (tokens.length >= 3) return false
  const genericCount = tokens.filter((token) => GENERIC_TITLE_WORDS.has(token)).length
  return genericCount >= 1
}

function isStrongCandidate(value: string): boolean {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return false
  if (normalized.length < 12) return false
  if (wordCount(normalized) < 3) return false
  if (ARTIFACT_TOKENS.some((token) => normalizeComparison(normalized).includes(normalizeComparison(token)))) return false
  if (/^[A-Z0-9_. -]+$/.test(normalized) && !/[a-zæøå]/i.test(normalized)) return false
  return true
}

function looksLikeNameToken(token: string): boolean {
  return /^\p{Lu}[\p{L}'’-]+$/u.test(token)
}

function looksLikeNameSequence(tokens: string[]): boolean {
  return tokens.length >= 2 && tokens.length <= 4 && tokens.every((token) => looksLikeNameToken(token))
}

function isSafeHeadingCandidate(value: string): boolean {
  const normalized = normalizeWhitespace(value)
  if (!isStrongCandidate(normalized)) return false
  if (HEADING_UNSAFE_PATTERNS.some((pattern) => pattern.test(normalized))) return false
  if (normalized.length > 140) return false
  if (wordCount(normalized) > 20) return false
  if (/^[A-ZÆØÅ][A-ZÆØÅ-]+(?:\s+[A-ZÆØÅ][A-ZÆØÅ-]+){1,3}\s+/.test(normalized)) return false
  const tokens = normalized
    .replace(/[():;,]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
  if (looksLikeNameSequence(tokens.slice(0, 2)) && tokens.length > 6) return false
  if (looksLikeNameSequence(tokens.slice(-2)) && normalized.length > 45) return false
  if (tokens.length >= 4 && tokens[0] === tokens[2] && tokens[1] === tokens[3]) return false
  return true
}

function inferWeakReasons(currentTitle: string, filenameCandidate: string): WeakReason[] {
  const reasons: WeakReason[] = []
  const current = normalizeWhitespace(currentTitle)
  const currentNorm = normalizeComparison(current)
  const fileNorm = normalizeComparison(filenameCandidate)

  if (current !== currentTitle.trim() || /\s{2,}/.test(currentTitle)) reasons.push('excess_whitespace')
  if (isGenericShortTitle(current)) reasons.push('generic_short_title')
  if (
    currentNorm &&
    fileNorm &&
    currentNorm !== fileNorm &&
    fileNorm.includes(currentNorm) &&
    wordCount(filenameCandidate) >= wordCount(current) + 2 &&
    filenameCandidate.length >= current.length + 12
  ) {
    reasons.push('truncated_source_title')
  }
  if (/^\d{4}\s+\d{1,3}\b/.test(currentNorm) || /^\d{2}q\d\b/i.test(currentNorm)) reasons.push('leading_identifier')
  if (ARTIFACT_TOKENS.some((token) => currentNorm.includes(normalizeComparison(token)))) reasons.push('artifact_label')
  if (!/[a-zæøå]/.test(current) && /[A-ZÆØÅ]{8,}/.test(current)) reasons.push('all_caps_identifier')

  return [...new Set(reasons)]
}

function extractPdfHeading(filePath: string): string | null {
  try {
    const output = execFileSync('pdftotext', ['-f', '1', '-l', '1', '-layout', '-nopgbrk', filePath, '-'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })

    const rawLines = output
      .split(/\r?\n/)
      .map((line) => normalizeWhitespace(line))
      .filter(Boolean)

    const collected: string[] = []

    for (const line of rawLines) {
      const normalized = normalizeComparison(line)
      if (!normalized) continue

      if (!collected.length) {
        if (/^\d+$/.test(normalized)) continue
        if (/^[A-Z0-9]{1,6}$/.test(line)) continue
        if (GENERIC_SINGLE_LINE_LABELS.has(normalized)) continue
        if (HEADING_SKIP_PATTERNS.some((pattern) => pattern.test(line))) continue
      } else {
        if (HEADING_SKIP_PATTERNS.some((pattern) => pattern.test(line))) break
        if (HEADING_STOP_PATTERNS.some((pattern) => pattern.test(line))) break
        if (/^\d+\s/.test(line)) break
      }

      collected.push(line)

      const joined = collected.join(' ')
      if (collected.length >= 3 && (joined.length >= 80 || wordCount(joined) >= 8)) break
    }

    if (collected.length === 0) return null

    const candidate = normalizeCandidateCasing(collected.join(' '))
      .replace(/\s+([:;,.)])/g, '$1')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')')
      .trim()

    return isStrongCandidate(candidate) ? candidate : null
  } catch {
    return null
  }
}

async function extractMarkdownHeading(filePath: string): Promise<string | null> {
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const headingLine = content.split(/\r?\n/).find((line) => /^#\s+/.test(line.trim()))
    if (!headingLine) return null
    const candidate = normalizeWhitespace(headingLine.replace(/^#\s+/, ''))
    return isStrongCandidate(candidate) ? candidate : null
  } catch {
    return null
  }
}

function pickSuggestion(params: {
  candidateTitle: string
  filenameCandidate: string
  pdfTitle: string | null
  headingTitle: string | null
  headingSource: Extract<SuggestionSource, 'pdf-heading' | 'markdown-heading'> | null
  weakReasons: WeakReason[]
}): Suggestion | null {
  const { candidateTitle, filenameCandidate, pdfTitle, headingTitle, headingSource, weakReasons } = params
  const normalizedCurrent = normalizeWhitespace(candidateTitle)
  const collapsedWhitespace = normalizeWhitespace(candidateTitle)

  if (collapsedWhitespace !== candidateTitle) {
    return {
      suggestedTitle: collapsedWhitespace,
      source: 'whitespace',
      reason: 'Collapsed repeated or stray internal whitespace.',
      confidence: 'high',
      autoApply: true,
    }
  }

  if (weakReasons.includes('truncated_source_title') && isStrongCandidate(filenameCandidate)) {
    const canAutoApply = weakReasons.includes('generic_short_title') || wordCount(candidateTitle) < 4
    return {
      suggestedTitle: filenameCandidate,
      source: 'filename',
      reason: 'Expanded a truncated import title to the fuller source filename.',
      confidence: canAutoApply ? 'high' : 'medium',
      autoApply: canAutoApply,
    }
  }

  if (
    pdfTitle &&
    isStrongCandidate(pdfTitle) &&
    normalizeComparison(pdfTitle) !== normalizeComparison(normalizedCurrent) &&
    (weakReasons.includes('generic_short_title') || weakReasons.includes('leading_identifier'))
  ) {
    return {
      suggestedTitle: normalizeWhitespace(pdfTitle),
      source: 'pdf-metadata',
      reason: 'Replaced a weak import title with the embedded PDF metadata title.',
      confidence: 'high',
      autoApply: true,
    }
  }

  if (headingTitle && normalizeComparison(headingTitle) !== normalizeComparison(normalizedCurrent)) {
    const overlapWithCurrent = tokenOverlap(headingTitle, candidateTitle)
    const overlapWithFilename = tokenOverlap(headingTitle, filenameCandidate)
    const clearlyWeak =
      weakReasons.includes('generic_short_title') ||
      weakReasons.includes('leading_identifier') ||
      weakReasons.includes('artifact_label') ||
      weakReasons.includes('all_caps_identifier')

    if (
      clearlyWeak &&
      isSafeHeadingCandidate(headingTitle) &&
      (overlapWithCurrent >= 0.2 || overlapWithFilename >= 0.2 || weakReasons.includes('generic_short_title'))
    ) {
      return {
        suggestedTitle: headingTitle,
        source: headingSource ?? 'pdf-heading',
        reason:
          headingSource === 'markdown-heading'
            ? 'Used the top-level markdown heading to replace a clearly weak import title.'
            : 'Used the first-page title block from the source PDF to replace a clearly weak import title.',
        confidence: 'high',
        autoApply: true,
      }
    }

    return {
      suggestedTitle: headingTitle,
      source: headingSource ?? 'pdf-heading',
      reason:
        headingSource === 'markdown-heading'
          ? 'The top-level markdown heading looks stronger than the current import title, but it was left for review.'
          : 'The first-page title block looks stronger than the current import title, but it was left for review.',
      confidence: 'medium',
      autoApply: false,
    }
  }

  if (
    pdfTitle &&
    isStrongCandidate(pdfTitle) &&
    normalizeComparison(pdfTitle) !== normalizeComparison(normalizedCurrent)
  ) {
    return {
      suggestedTitle: normalizeWhitespace(pdfTitle),
      source: 'pdf-metadata',
      reason: 'Embedded PDF metadata suggests a stronger title than the current import title.',
      confidence: 'medium',
      autoApply: false,
    }
  }

  return null
}

async function loadReviewRows(): Promise<LoadedReviewCsv> {
  const raw = await fs.readFile(REVIEW_CSV, 'utf8')
  const parsed = parseCsv(raw)
  if (parsed.length === 0) return { header: [], index: {}, rows: [] }

  const [header, ...dataRows] = parsed
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  const rows = dataRows
    .filter((row) => (row[index.source_path] ?? '').trim())
    .map((row) => ({
      raw: row.slice(),
      data: {
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
      },
    }))

  return { rows, header, index }
}

function buildReviewMap(rows: LoadedReviewRow[]): Map<string, LoadedReviewRow> {
  return new Map(rows.map((row) => [row.data.import_file_path, row]))
}

async function loadBatchDocuments(prisma: PrismaClient): Promise<BatchDocument[]> {
  const documents = await prisma.document.findMany({
    where: {
      category: 'incoming',
      subcategory: { startsWith: `${BATCH_NAME}/` },
    },
    select: {
      id: true,
      filePath: true,
      title: true,
      metadata: true,
    },
    orderBy: { filePath: 'asc' },
  })

  return documents.map((doc) => ({
    id: doc.id,
    filePath: doc.filePath,
    title: doc.title,
    metadata: doc.metadata && typeof doc.metadata === 'object' && !Array.isArray(doc.metadata)
      ? (doc.metadata as Record<string, unknown>)
      : null,
  }))
}

async function auditTitles(prisma: PrismaClient, reviewRows: LoadedReviewRow[]): Promise<AuditRow[]> {
  const reviewMap = buildReviewMap(reviewRows)
  const batchDocuments = await loadBatchDocuments(prisma)
  const auditRows: AuditRow[] = []

  for (const document of batchDocuments) {
    const reviewRow = reviewMap.get(document.filePath)
    const sourcePath =
      reviewRow?.data.source_path ??
      (typeof document.metadata?.sourcePath === 'string' ? document.metadata.sourcePath : '') ??
      ''
    const ext = reviewRow?.data.ext ?? path.extname(sourcePath || document.filePath).toLowerCase()
    const sourceAbsolutePath = sourcePath ? path.join(ROOT, sourcePath) : ''
    const filenameCandidate = sourcePath
      ? humanizeFilename(path.basename(sourcePath))
      : humanizeFilename(path.basename(document.filePath))
    const manualFinalTitle = reviewRow?.data.final_title.trim() ?? ''
    const heuristicCandidateTitle =
      manualFinalTitle || reviewRow?.data.proposed_title.trim() || document.title
    const pdfTitle =
      typeof document.metadata?.pdfTitle === 'string' && document.metadata.pdfTitle.trim()
        ? document.metadata.pdfTitle.trim()
        : null

    const weakReasons = inferWeakReasons(heuristicCandidateTitle, filenameCandidate)
    let headingTitle: string | null = null
    let headingSource: Extract<SuggestionSource, 'pdf-heading' | 'markdown-heading'> | null = null

    if (sourceAbsolutePath) {
      if (ext === '.pdf' && weakReasons.length > 0) {
        headingTitle = extractPdfHeading(sourceAbsolutePath)
        headingSource = headingTitle ? 'pdf-heading' : null
      } else if (ext === '.md' && weakReasons.length > 0) {
        headingTitle = await extractMarkdownHeading(sourceAbsolutePath)
        headingSource = headingTitle ? 'markdown-heading' : null
      }
    }

    let suggestion = pickSuggestion({
      candidateTitle: heuristicCandidateTitle,
      filenameCandidate,
      pdfTitle,
      headingTitle,
      headingSource,
      weakReasons,
    })

    if (!suggestion && manualFinalTitle && manualFinalTitle !== document.title) {
      suggestion = {
        suggestedTitle: manualFinalTitle,
        source: 'filename',
        reason: 'Review CSV final_title differs from the current Document.title and will be used as the repair target.',
        confidence: 'high',
        autoApply: false,
      }
    }

    if (weakReasons.length === 0 && !suggestion) continue

    auditRows.push({
      documentId: document.id,
      filePath: document.filePath,
      sourcePath,
      ext,
      currentTitle: document.title,
      suggestedTitle: suggestion?.suggestedTitle ?? '',
      suggestionSource:
        suggestion?.reason === 'Review CSV final_title differs from the current Document.title and will be used as the repair target.'
          ? 'manual-review'
          : (suggestion?.source ?? 'manual-review'),
      reason: suggestion?.reason ?? 'Weak title flagged for review, but no unambiguous automatic replacement was found.',
      confidence: suggestion?.confidence ?? 'low',
      weakReasons,
      autoApply: suggestion?.autoApply ?? false,
      applied: false,
      reviewStatus: reviewRow?.data.review_status ?? '',
      reviewAction: reviewRow?.data.action ?? '',
      reviewFinalTitle: reviewRow?.data.final_title ?? '',
      notes: reviewRow?.data.notes ?? '',
    })
  }

  return auditRows
}

async function writeArtifacts(
  auditRows: AuditRow[],
  opts: { applyMode: boolean; dbChangedCount: number; reviewCsvChangedCount: number },
): Promise<void> {
  const generatedAt = new Date().toISOString()
  const weakCounts = auditRows.reduce<Record<string, number>>((acc, row) => {
    for (const reason of row.weakReasons) acc[reason] = (acc[reason] ?? 0) + 1
    return acc
  }, {})
  const suggestionCounts = auditRows.reduce<Record<string, number>>((acc, row) => {
    acc[row.suggestionSource] = (acc[row.suggestionSource] ?? 0) + 1
    return acc
  }, {})
  const autoApplyRows = auditRows.filter((row) => row.autoApply)
  const appliedRows = auditRows.filter((row) => row.applied)

  const csvHeader = [
    'document_id',
    'file_path',
    'source_path',
    'ext',
    'current_title',
    'suggested_title',
    'suggestion_source',
    'reason',
    'confidence',
    'weak_reasons',
    'auto_apply',
    'applied',
    'review_status',
    'review_action',
    'review_final_title',
    'notes',
  ]

  const summary = {
    generatedAt,
    batchName: BATCH_NAME,
    applyMode: opts.applyMode,
    weakTitleCount: auditRows.length,
    autoApplyCount: autoApplyRows.length,
    dbChangedCount: opts.dbChangedCount,
    reviewCsvChangedCount: opts.reviewCsvChangedCount,
    appliedCount: opts.dbChangedCount,
    weakCounts,
    suggestionCounts,
  }

  await writeFileAtomically(
    TITLE_REMEDIATION_CSV,
    stringifyCsv([
      csvHeader,
      ...auditRows.map((row) => [
        row.documentId,
        row.filePath,
        row.sourcePath,
        row.ext,
        row.currentTitle,
        row.suggestedTitle,
        row.suggestionSource,
        row.reason,
        row.confidence,
        row.weakReasons.join('; '),
        String(row.autoApply),
        String(row.applied),
        row.reviewStatus,
        row.reviewAction,
        row.reviewFinalTitle,
        row.notes,
      ]),
    ]),
  )

  await writeFileAtomically(TITLE_REMEDIATION_JSON, JSON.stringify(summary, null, 2) + '\n')

  const lines = [
    '# Title Remediation',
    '',
    `Generated: ${generatedAt}`,
    '',
    `- Batch: \`${BATCH_NAME}\``,
    `- Review CSV: \`${path.relative(ROOT, REVIEW_CSV)}\``,
    `- Weak titles flagged: ${auditRows.length}`,
    `- Auto-apply candidates: ${autoApplyRows.length}`,
    `- Applied in this run: ${opts.dbChangedCount} DB rows, ${opts.reviewCsvChangedCount} review CSV rows`,
    '',
    '## Weak Reasons',
    '',
    ...(Object.keys(weakCounts).length > 0
      ? Object.entries(weakCounts)
          .sort((left, right) => right[1] - left[1])
          .map(([reason, count]) => `- ${reason}: ${count}`)
      : ['- None']),
    '',
    '## Auto-Apply Candidates',
    '',
    ...(autoApplyRows.length > 0
      ? autoApplyRows.map(
          (row) =>
            `- ${row.currentTitle} -> ${row.suggestedTitle} (${row.suggestionSource}; ${row.reason})`,
        )
      : ['- None']),
    '',
    '## Applied Rows',
    '',
    ...(appliedRows.length > 0
      ? appliedRows.map((row) => `- ${row.currentTitle} -> ${row.suggestedTitle}`)
      : ['- None']),
    '',
    '## Review Queue',
    '',
    ...(auditRows.filter((row) => !row.autoApply).length > 0
      ? auditRows
          .filter((row) => !row.autoApply)
          .slice(0, 50)
          .map(
            (row) =>
              `- ${row.currentTitle}${row.suggestedTitle ? ` -> ${row.suggestedTitle}` : ''} (${row.reason})`,
          )
      : ['- None']),
    '',
    `Full audit CSV: \`${path.relative(ROOT, TITLE_REMEDIATION_CSV)}\``,
  ]

  await writeFileAtomically(TITLE_REMEDIATION_MD, lines.join('\n') + '\n')
}

async function updateReviewCsv(reviewCsv: LoadedReviewCsv, titleUpdates: Map<string, string>): Promise<number> {
  const finalTitleIndex = reviewCsv.index.final_title
  if (finalTitleIndex === undefined) throw new Error('review.csv is missing the final_title column.')

  let changed = 0

  for (const row of reviewCsv.rows) {
    const suggestedTitle = titleUpdates.get(row.data.import_file_path)
    if (!suggestedTitle) continue
    if (row.data.final_title === suggestedTitle) continue
    while (row.raw.length <= finalTitleIndex) row.raw.push('')
    row.raw[finalTitleIndex] = suggestedTitle
    row.data.final_title = suggestedTitle
    changed++
  }

  if (changed === 0) return 0

  await writeFileAtomically(
    REVIEW_CSV,
    stringifyCsv([
      reviewCsv.header,
      ...reviewCsv.rows.map((row) => {
        const values = row.raw.slice()
        while (values.length < reviewCsv.header.length) values.push('')
        return values
      }),
    ]),
  )

  return changed
}

async function main(): Promise<void> {
  const opts = parseArgs()
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    await fs.mkdir(INTAKE_DIR, { recursive: true })

    const reviewCsv = await loadReviewRows()
    const auditRows = await auditTitles(prisma, reviewCsv.rows)

    let dbChangedCount = 0
    let reviewCsvChangedCount = 0

    if (opts.apply) {
      const reviewCsvUpdates = new Map(
        auditRows
          .filter((row) => row.autoApply && row.suggestedTitle && row.reviewFinalTitle !== row.suggestedTitle)
          .map((row) => [row.filePath, row.suggestedTitle]),
      )

      if (reviewCsvUpdates.size > 0) {
        reviewCsvChangedCount = await updateReviewCsv(reviewCsv, reviewCsvUpdates)
      }

      const reviewMap = buildReviewMap(reviewCsv.rows)
      const batchDocuments = await loadBatchDocuments(prisma)
      const dbRowsToSync = batchDocuments
        .map((document) => {
          const reviewRow = reviewMap.get(document.filePath)
          const desiredTitle = reviewRow?.data.final_title.trim() ?? ''
          if (!desiredTitle || document.title === desiredTitle) return null
          return {
            documentId: document.id,
            filePath: document.filePath,
            currentTitle: document.title,
            desiredTitle,
          }
        })
        .filter(Boolean) as Array<{
        documentId: string
        filePath: string
        currentTitle: string
        desiredTitle: string
      }>

      if (dbRowsToSync.length > 0) {
        await prisma.$transaction(
          dbRowsToSync.map((row) =>
            prisma.document.update({
              where: { id: row.documentId },
              data: { title: row.desiredTitle },
            }),
          ),
        )

        for (const row of auditRows) {
          if (
            reviewCsvUpdates.has(row.filePath) ||
            dbRowsToSync.some((candidate) => candidate.documentId === row.documentId)
          ) {
            row.applied = true
          }
        }

        dbChangedCount = dbRowsToSync.length
      } else if (reviewCsvUpdates.size > 0) {
        for (const row of auditRows) {
          if (reviewCsvUpdates.has(row.filePath)) row.applied = true
        }
      }
    }

    await writeArtifacts(auditRows, {
      applyMode: opts.apply,
      dbChangedCount,
      reviewCsvChangedCount,
    })

    console.log(
      JSON.stringify(
        {
          batchName: BATCH_NAME,
          applyMode: opts.apply,
          weakTitleCount: auditRows.length,
          autoApplyCount: auditRows.filter((row) => row.autoApply).length,
          dbChangedCount,
          reviewCsvChangedCount,
          changedCount: dbChangedCount,
          titleRemediationCsv: path.relative(ROOT, TITLE_REMEDIATION_CSV),
          titleRemediationMd: path.relative(ROOT, TITLE_REMEDIATION_MD),
          titleRemediationSummary: path.relative(ROOT, TITLE_REMEDIATION_JSON),
        },
        null,
        2,
      ),
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
