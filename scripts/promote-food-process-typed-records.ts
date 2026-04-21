import 'dotenv/config'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const DEFAULT_BATCH_NAME = 'food-research-process-2026-04-20'

const TARGET_ARGS = ['sourcedoc', 'report', 'thesis', 'all'] as const
const CONFIDENCE_ORDER = { low: 0, medium: 1, high: 2 } as const
const GENERIC_SUMMARY_PREFIXES = [
  'incoming pdf staged from reviewed intake',
  'metadata-only staging document imported from',
]
const PLACEHOLDER_PATTERNS = [/\buntitled\b/i, /\bcellar\b/i, /\bproof\b/i, /\bdoc\s*\d+\b/i, /\bplaceholder\b/i]
const WORD_EXPORT_PATTERN = /^microsoft word\b/i
const LOW_CONFIDENCE_OVERRIDE_TOKEN = 'allow-low-confidence'

type TargetArg = (typeof TARGET_ARGS)[number]
type Confidence = keyof typeof CONFIDENCE_ORDER
type TypedTarget = 'SourceDoc' | 'Report' | 'Thesis'
type DecisionStatus = 'would-create' | 'would-update' | 'created' | 'updated' | 'skip' | 'conflict'

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

type PromotionCandidateRow = {
  source_path: string
  import_file_path: string
  source_top_folder: string
  filename: string
  current_title: string
  analysis_title: string
  analysis_title_source: string
  remediation_suggested_title: string
  proposed_doc_type: string
  typed_layer_candidate: string
  recommended_target: string
  confidence: string
  reason: string
  primary_signals: string
  caution_flags: string
  score_source_doc: string
  score_report: string
  score_thesis: string
  review_status: string
  action: string
  notes: string
}

type TitleRemediationRow = {
  document_id: string
  file_path: string
  source_path: string
  ext: string
  current_title: string
  suggested_title: string
  suggestion_source: string
  reason: string
  confidence: string
  weak_reasons: string
  auto_apply: string
  applied: string
  review_status: string
  review_action: string
  review_final_title: string
  notes: string
}

type ImportSummaryRecord = {
  sourcePath: string
  filePath: string
  title: string
  status: string
}

type ImportSummary = {
  generatedAt: string
  dryRun: boolean
  reviewCsv: string
  selected: number
  imported: number
  skipped: number
  records: ImportSummaryRecord[]
}

type PromotionCandidatesSummary = {
  generatedAt: string
  batchName: string
  reviewCsv: string
  titleRemediationCsv: string
  importSummaryJson: string
  importedRowsAnalyzed: number
  skippedRows: number
  countsByTarget: Record<string, number>
}

type CliOptions = {
  batchName: string
  target: TargetArg
  apply: boolean
  minConfidence: Confidence
}

type BatchPaths = {
  intakeDir: string
  reviewCsv: string
  thesisReviewCsv: string
  importSummaryJson: string
  titleRemediationCsv: string
  promotionCandidatesCsv: string
  promotionCandidatesSummaryJson: string
}

type JsonRecord = Record<string, unknown>

type BatchDocument = {
  id: string
  filePath: string
  title: string
  author: string | null
  year: number | null
  country: string | null
  documentType: string | null
  category: string | null
  subcategory: string | null
  url: string | null
  summary: string | null
  tags: string[]
  metadata: JsonRecord | null
  sourceDoc: { id: string } | null
  report: { id: string } | null
  thesis: { id: string } | null
}

type ExistingSourceDoc = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  doi: string | null
  publisher: string | null
  documentId: string | null
}

type ExistingReport = {
  id: string
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi: string | null
  isbn: string | null
  issn: string | null
  publisher: string | null
  documentId: string | null
}

type ExistingThesis = {
  id: string
  authors: string
  institution: string
  year: number
  title: string
  titleNo: string | null
  url: string
  synthesis: string
  keyFindings: string[]
  tags: string[]
  takeaways: string[]
  method: string | null
  awardWinning: boolean
  degree: string
  doi: string | null
  isbn: string | null
  publisher: string | null
  accessDate: string | null
  documentId: string | null
}

type LoadedContext = {
  reviewBySourcePath: Map<string, ReviewRow>
  thesisReviewBySourcePath: Map<string, ThesisReviewRow>
  importSummaryBySourcePath: Map<string, ImportSummaryRecord>
  titleRemediationBySourcePath: Map<string, TitleRemediationRow>
  documentsByFilePath: Map<string, BatchDocument>
  documentsBySourcePath: Map<string, BatchDocument>
  importSummary: ImportSummary
  promotionCandidatesSummary: PromotionCandidatesSummary | null
  sourceDocs: ExistingSourceDoc[]
  reports: ExistingReport[]
  theses: ExistingThesis[]
}

type TargetSummary = {
  generatedAt: string
  batchName: string
  target: TargetArg
  targetLabel: TypedTarget
  apply: boolean
  minConfidence: Confidence
  selected: number
  promotable: number
  skipped: number
  conflicts: number
  wouldCreate: number
  wouldUpdate: number
  created: number
  updated: number
  artifactChecks: {
    importedRowsInSummary: number
    batchDocumentsInDb: number
    promotionSummaryTargetCount: number | null
  }
  reasonCounts: Record<string, number>
  outputs: {
    csv: string
    json: string
    md: string
  }
}

type ThesisReviewRow = {
  source_path: string
  final_title: string
  final_year: string
  final_url: string
  authors: string
  institution: string
  synthesis: string
  notes: string
}

type DecisionRow = {
  target: TypedTarget
  sourcePath: string
  importFilePath: string
  filename: string
  confidence: Confidence
  documentId: string | null
  documentTitle: string
  promotedTitle: string
  typedId: string
  status: DecisionStatus
  operation: 'create' | 'update' | 'none'
  existingId: string | null
  reasonCodes: string[]
  reasonSummary: string
  currentTargetLinks: string[]
  reviewAction: string
  titleRemediationStatus: 'clear' | 'blocked'
  payloadPreview: Record<string, unknown> | null
}

type SourceDocCreatePayload = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  doi: string | null
  publisher: string | null
  documentId: string
}

type ReportCreatePayload = {
  id: string
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string | null
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi: string | null
  isbn: string | null
  issn: string | null
  publisher: string | null
  documentId: string
}

type ThesisCreatePayload = {
  id: string
  authors: string
  institution: string
  year: number
  title: string
  titleNo: string | null
  url: string
  synthesis: string
  keyFindings: string[]
  tags: string[]
  takeaways: string[]
  method: string | null
  awardWinning: boolean
  degree: string
  doi: string | null
  isbn: string | null
  publisher: string | null
  accessDate: string | null
  documentId: string
}

type ExactMatchResult<T> =
  | { status: 'none' }
  | { status: 'ambiguous'; ids: string[] }
  | { status: 'match'; record: T }

const REVIEW_REQUIRED_COLUMNS: Array<keyof ReviewRow> = [
  'source_path',
  'source_top_folder',
  'filename',
  'ext',
  'size_bytes',
  'modified_at',
  'sha256',
  'priority',
  'project_fit',
  'candidate_model',
  'typed_layer_candidate',
  'import_file_path',
  'proposed_title',
  'proposed_year',
  'proposed_country',
  'proposed_theme',
  'proposed_doc_type',
  'review_status',
  'action',
  'final_title',
  'final_year',
  'final_country',
  'final_theme',
  'final_doc_type',
  'final_url',
  'notes',
]

const THESIS_REVIEW_REQUIRED_COLUMNS: Array<keyof ThesisReviewRow> = [
  'source_path',
  'final_title',
  'final_year',
  'final_url',
  'authors',
  'institution',
  'synthesis',
  'notes',
]

const PROMOTION_REQUIRED_COLUMNS: Array<keyof PromotionCandidateRow> = [
  'source_path',
  'import_file_path',
  'source_top_folder',
  'filename',
  'current_title',
  'analysis_title',
  'analysis_title_source',
  'remediation_suggested_title',
  'proposed_doc_type',
  'typed_layer_candidate',
  'recommended_target',
  'confidence',
  'reason',
  'primary_signals',
  'caution_flags',
  'score_source_doc',
  'score_report',
  'score_thesis',
  'review_status',
  'action',
  'notes',
]

const TITLE_REMEDIATION_REQUIRED_COLUMNS: Array<keyof TitleRemediationRow> = [
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

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  let batchName = DEFAULT_BATCH_NAME
  let target: TargetArg = 'all'
  let apply = false
  let minConfidence: Confidence = 'low'

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    if (arg === '--apply') {
      apply = true
      continue
    }

    if (arg === '--batch' || arg === '-b') {
      const next = args[i + 1]
      if (!next) throw new Error('Missing value for --batch')
      batchName = next
      i++
      continue
    }

    if (arg.startsWith('--batch=')) {
      batchName = arg.slice('--batch='.length)
      continue
    }

    if (arg === '--target' || arg === '-t') {
      const next = args[i + 1] as TargetArg | undefined
      if (!next) throw new Error('Missing value for --target')
      if (!TARGET_ARGS.includes(next)) throw new Error(`Unsupported --target value: ${next}`)
      target = next
      i++
      continue
    }

    if (arg.startsWith('--target=')) {
      const value = arg.slice('--target='.length) as TargetArg
      if (!TARGET_ARGS.includes(value)) throw new Error(`Unsupported --target value: ${value}`)
      target = value
      continue
    }

    if (arg === '--min-confidence') {
      const next = args[i + 1] as Confidence | undefined
      if (!next || !(next in CONFIDENCE_ORDER)) throw new Error(`Unsupported --min-confidence value: ${String(next)}`)
      minConfidence = next
      i++
      continue
    }

    if (arg.startsWith('--min-confidence=')) {
      const value = arg.slice('--min-confidence='.length) as Confidence
      if (!(value in CONFIDENCE_ORDER)) throw new Error(`Unsupported --min-confidence value: ${value}`)
      minConfidence = value
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return {
    batchName,
    target,
    apply,
    minConfidence,
  }
}

function buildPaths(batchName: string): BatchPaths {
  const intakeDir = path.join(ROOT, `research/intake/${batchName}`)
  return {
    intakeDir,
    reviewCsv: path.join(intakeDir, 'review.csv'),
    thesisReviewCsv: path.join(intakeDir, 'thesis-review.csv'),
    importSummaryJson: path.join(intakeDir, 'import-summary.json'),
    titleRemediationCsv: path.join(intakeDir, 'title-remediation.csv'),
    promotionCandidatesCsv: path.join(intakeDir, 'promotion-candidates.csv'),
    promotionCandidatesSummaryJson: path.join(intakeDir, 'promotion-candidates-summary.json'),
  }
}

function parseCsv(content: string): string[][] {
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1)

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

function createHeaderIndex(header: string[], requiredColumns: string[], filePath: string): Record<string, number> {
  const cleanedHeader = header.map((column) => column.replace(/^\uFEFF/, '').trim())
  const index = Object.fromEntries(cleanedHeader.map((name, idx) => [name, idx]))
  const missing = requiredColumns.filter((column) => !(column in index))

  if (missing.length > 0) {
    throw new Error(`${path.relative(ROOT, filePath)} is missing required columns: ${missing.join(', ')}`)
  }

  return index
}

function normalizeWhitespace(value: string | null | undefined): string {
  return (value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()
}

function normalizeComparableText(value: string | null | undefined): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'aa')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeUrl(value: string | null | undefined): string | null {
  const trimmed = normalizeWhitespace(value)
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    url.hash = ''
    url.pathname = url.pathname.replace(/\/+$/, '') || '/'
    return url.toString()
  } catch {
    return trimmed.replace(/#.*$/, '').replace(/\/+$/, '')
  }
}

function parseYear(value: string | null | undefined): number | null {
  const normalized = normalizeWhitespace(value)
  if (!normalized) return null
  const match = normalized.match(/\b(19|20)\d{2}\b/)
  return match ? Number(match[0]) : null
}

function isTruthyFlag(value: string | null | undefined): boolean {
  const normalized = normalizeWhitespace(value).toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function dedupe(values: Array<string | null | undefined>): string[] {
  const result: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const normalized = normalizeWhitespace(value)
    if (!normalized) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    result.push(normalized)
  }

  return result
}

function isMeaningfulSummary(summary: string | null | undefined): boolean {
  const normalized = normalizeWhitespace(summary).toLowerCase()
  if (!normalized) return false
  return !GENERIC_SUMMARY_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

function titleLooksWeak(title: string): boolean {
  const normalized = normalizeWhitespace(title)
  if (!normalized) return true
  if (normalized.length < 8) return true
  if (WORD_EXPORT_PATTERN.test(normalized)) return true
  if (/\.docx?$/i.test(normalized)) return true
  if (PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(normalized))) return true
  return false
}

function stableToken(seed: string): string {
  return crypto.createHash('sha1').update(seed).digest('hex').slice(0, 12)
}

function buildStableId(target: TypedTarget, doc: BatchDocument, review: ReviewRow | null): string {
  const metadata = doc.metadata ?? {}
  const sha = typeof metadata.sha256 === 'string' ? metadata.sha256 : null
  const token = sha?.match(/^[a-f0-9]{12,}$/i)?.[0]?.slice(0, 12).toLowerCase() ?? stableToken(review?.source_path || doc.filePath)

  if (target === 'SourceDoc') return `src-food-${token}`
  if (target === 'Report') return `report-food-${token}`
  return `thesis-food-${token}`
}

function mapTargetArgToLabel(target: Exclude<TargetArg, 'all'>): TypedTarget {
  if (target === 'sourcedoc') return 'SourceDoc'
  if (target === 'report') return 'Report'
  return 'Thesis'
}

function matchConfidence(value: string): Confidence {
  const normalized = normalizeWhitespace(value).toLowerCase()
  if (normalized === 'high' || normalized === 'medium' || normalized === 'low') return normalized
  return 'low'
}

function reviewAllowsLowConfidence(review: ReviewRow | null): boolean {
  if (!review) return false
  if (normalizeWhitespace(review.action).toLowerCase() !== 'import') return false
  return normalizeWhitespace(review.notes).toLowerCase().includes(LOW_CONFIDENCE_OVERRIDE_TOKEN)
}

function confidencePasses(candidate: PromotionCandidateRow, minConfidence: Confidence): boolean {
  return CONFIDENCE_ORDER[matchConfidence(candidate.confidence)] >= CONFIDENCE_ORDER[minConfidence]
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

async function loadReviewRows(filePath: string): Promise<Map<string, ReviewRow>> {
  const raw = await fs.readFile(filePath, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return new Map()
  const [header, ...dataRows] = rows
  const index = createHeaderIndex(header, REVIEW_REQUIRED_COLUMNS, filePath)

  const mapped = new Map<string, ReviewRow>()
  for (const row of dataRows) {
    const sourcePath = row[index.source_path] ?? ''
    if (!sourcePath.trim()) continue
    mapped.set(sourcePath, {
      source_path: sourcePath,
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
    })
  }

  return mapped
}

async function loadPromotionCandidates(filePath: string): Promise<PromotionCandidateRow[]> {
  const raw = await fs.readFile(filePath, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return []
  const [header, ...dataRows] = rows
  const index = createHeaderIndex(header, PROMOTION_REQUIRED_COLUMNS, filePath)

  return dataRows
    .filter((row) => normalizeWhitespace(row[index.source_path]).length > 0)
    .map((row) => ({
      source_path: row[index.source_path] ?? '',
      import_file_path: row[index.import_file_path] ?? '',
      source_top_folder: row[index.source_top_folder] ?? '',
      filename: row[index.filename] ?? '',
      current_title: row[index.current_title] ?? '',
      analysis_title: row[index.analysis_title] ?? '',
      analysis_title_source: row[index.analysis_title_source] ?? '',
      remediation_suggested_title: row[index.remediation_suggested_title] ?? '',
      proposed_doc_type: row[index.proposed_doc_type] ?? '',
      typed_layer_candidate: row[index.typed_layer_candidate] ?? '',
      recommended_target: row[index.recommended_target] ?? '',
      confidence: row[index.confidence] ?? '',
      reason: row[index.reason] ?? '',
      primary_signals: row[index.primary_signals] ?? '',
      caution_flags: row[index.caution_flags] ?? '',
      score_source_doc: row[index.score_source_doc] ?? '',
      score_report: row[index.score_report] ?? '',
      score_thesis: row[index.score_thesis] ?? '',
      review_status: row[index.review_status] ?? '',
      action: row[index.action] ?? '',
      notes: row[index.notes] ?? '',
    }))
}

async function loadThesisReviewRows(filePath: string): Promise<Map<string, ThesisReviewRow>> {
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const rows = parseCsv(raw)
    if (rows.length === 0) return new Map()
    const [header, ...dataRows] = rows
    const index = createHeaderIndex(header, THESIS_REVIEW_REQUIRED_COLUMNS, filePath)

    const mapped = new Map<string, ThesisReviewRow>()
    for (const row of dataRows) {
      const sourcePath = row[index.source_path] ?? ''
      if (!normalizeWhitespace(sourcePath)) continue
      mapped.set(sourcePath, {
        source_path: sourcePath,
        final_title: row[index.final_title] ?? '',
        final_year: row[index.final_year] ?? '',
        final_url: row[index.final_url] ?? '',
        authors: row[index.authors] ?? '',
        institution: row[index.institution] ?? '',
        synthesis: row[index.synthesis] ?? '',
        notes: row[index.notes] ?? '',
      })
    }

    return mapped
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return new Map()
    throw error
  }
}

async function loadTitleRemediationRows(filePath: string): Promise<Map<string, TitleRemediationRow>> {
  const raw = await fs.readFile(filePath, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return new Map()
  const [header, ...dataRows] = rows
  const index = createHeaderIndex(header, TITLE_REMEDIATION_REQUIRED_COLUMNS, filePath)

  const mapped = new Map<string, TitleRemediationRow>()
  for (const row of dataRows) {
    const sourcePath = row[index.source_path] ?? ''
    if (!normalizeWhitespace(sourcePath)) continue
    mapped.set(sourcePath, {
      document_id: row[index.document_id] ?? '',
      file_path: row[index.file_path] ?? '',
      source_path: sourcePath,
      ext: row[index.ext] ?? '',
      current_title: row[index.current_title] ?? '',
      suggested_title: row[index.suggested_title] ?? '',
      suggestion_source: row[index.suggestion_source] ?? '',
      reason: row[index.reason] ?? '',
      confidence: row[index.confidence] ?? '',
      weak_reasons: row[index.weak_reasons] ?? '',
      auto_apply: row[index.auto_apply] ?? '',
      applied: row[index.applied] ?? '',
      review_status: row[index.review_status] ?? '',
      review_action: row[index.review_action] ?? '',
      review_final_title: row[index.review_final_title] ?? '',
      notes: row[index.notes] ?? '',
    })
  }

  return mapped
}

function buildDocumentsBySourcePath(documents: BatchDocument[]): Map<string, BatchDocument> {
  const mapped = new Map<string, BatchDocument>()

  for (const doc of documents) {
    const metadata = doc.metadata ?? {}
    const sourcePath = typeof metadata.sourcePath === 'string' ? metadata.sourcePath : null
    if (!sourcePath) continue
    mapped.set(sourcePath, doc)
  }

  return mapped
}

function getMetadataString(doc: BatchDocument, key: string): string | null {
  const metadata = doc.metadata ?? {}
  const value = metadata[key]
  return typeof value === 'string' ? value : null
}

function titleRemediationResolved(remediation: TitleRemediationRow | null, doc: BatchDocument | null): boolean {
  if (!remediation) return true
  if (isTruthyFlag(remediation.applied)) return true

  const finalTitle = normalizeWhitespace(remediation.review_final_title)
  if (!finalTitle || !doc) return false
  return normalizeComparableText(finalTitle) === normalizeComparableText(doc.title)
}

function buildCurrentTargetLinks(doc: BatchDocument | null): string[] {
  if (!doc) return []
  return dedupe([
    doc.sourceDoc ? `SourceDoc:${doc.sourceDoc.id}` : null,
    doc.report ? `Report:${doc.report.id}` : null,
    doc.thesis ? `Thesis:${doc.thesis.id}` : null,
  ])
}

function otherTargetLinked(target: TypedTarget, doc: BatchDocument | null): string[] {
  if (!doc) return []
  return buildCurrentTargetLinks(doc).filter((entry) => !entry.startsWith(`${target}:`))
}

function buildPromotedTitle(candidate: PromotionCandidateRow, review: ReviewRow | null, doc: BatchDocument | null): string {
  return (
    normalizeWhitespace(review?.final_title) ||
    normalizeWhitespace(candidate.analysis_title) ||
    normalizeWhitespace(doc?.title) ||
    normalizeWhitespace(candidate.current_title) ||
    normalizeWhitespace(candidate.filename)
  )
}

function buildPromotedYear(review: ReviewRow | null, doc: BatchDocument | null): number | null {
  return parseYear(review?.final_year) ?? doc?.year ?? parseYear(review?.proposed_year)
}

function buildPromotedUrl(review: ReviewRow | null, doc: BatchDocument | null): string | null {
  return normalizeUrl(review?.final_url) ?? normalizeUrl(doc?.url)
}

function buildPromotedCountry(review: ReviewRow | null, doc: BatchDocument | null): string | null {
  return normalizeWhitespace(review?.final_country) || normalizeWhitespace(review?.proposed_country) || normalizeWhitespace(doc?.country) || null
}

function buildPromotedTheme(review: ReviewRow | null, doc: BatchDocument | null): string {
  const explicit = normalizeWhitespace(review?.final_theme) || normalizeWhitespace(review?.proposed_theme)
  if (explicit) return explicit

  const subcategory = normalizeWhitespace(doc?.subcategory)
  const match = subcategory.match(/food-research-process-\d{4}-\d{2}-\d{2}\/(.+)$/)
  return match?.[1] ?? 'unreviewed'
}

function buildSourceType(candidate: PromotionCandidateRow, review: ReviewRow | null, doc: BatchDocument | null): string {
  const docType = normalizeWhitespace(review?.final_doc_type) || normalizeWhitespace(review?.proposed_doc_type) || normalizeWhitespace(doc?.documentType)
  const folder = (review?.source_top_folder || candidate.source_top_folder).toLowerCase()
  const fileType = normalizeWhitespace(getMetadataString(doc!, 'canonicalFileType'))
  const normalizedTitle = normalizeComparableText(candidate.analysis_title || doc?.title || candidate.current_title)

  if (normalizedTitle.includes('press release') || normalizedTitle.includes('announcement')) return 'press-release'
  if (normalizedTitle.includes('factsheet') || normalizedTitle.includes('fact sheet')) return 'factsheet'
  if (normalizedTitle.includes('news') || normalizedTitle.includes('article')) return 'article'
  if (folder.includes('academic')) return 'academic-source'
  if (folder.includes('company')) return 'company-source'
  if (docType.includes('article')) return 'article'
  if (docType.includes('annual_report')) return 'annual-report'
  if (docType.includes('policy_report')) return 'policy-report'
  if (fileType === 'md') return 'markdown-note'
  return fileType === 'pdf' ? 'pdf-document' : docType || 'document'
}

function buildReportCategory(candidate: PromotionCandidateRow, review: ReviewRow | null): string {
  const docType = normalizeWhitespace(review?.final_doc_type) || normalizeWhitespace(review?.proposed_doc_type) || normalizeWhitespace(candidate.proposed_doc_type)
  const folder = (review?.source_top_folder || candidate.source_top_folder).toLowerCase()

  if (folder.includes('company-and-annual-reports') || docType.includes('annual_report')) return 'bransje'
  if (folder.includes('policy-governance') || docType.includes('policy_report')) return 'offentlig'
  if (folder.includes('academic')) return 'akademia'
  if (folder.includes('food-waste') || folder.includes('circularity')) return 'sirkularitet'
  if (folder.includes('working') || folder.includes('archives')) return 'arbeidsmateriale'
  return 'food-process-intake'
}

function buildSourceDocPayload(
  batchName: string,
  typedId: string,
  candidate: PromotionCandidateRow,
  review: ReviewRow | null,
  doc: BatchDocument,
): SourceDocCreatePayload {
  const title = buildPromotedTitle(candidate, review, doc)
  const summary = normalizeWhitespace(doc.summary)
  const reason = normalizeWhitespace(candidate.reason)
  const description =
    (isMeaningfulSummary(summary) ? summary : '') ||
    `Promoted from ${review?.source_top_folder || candidate.source_top_folder} in ${batchName}.`
  const relevance = reason || `Batch recommendation: ${candidate.recommended_target}.`

  return {
    id: typedId,
    filename: normalizeWhitespace(review?.filename) || path.basename(doc.filePath),
    title: title || null,
    author: normalizeWhitespace(doc.author) || null,
    year: buildPromotedYear(review, doc)?.toString() ?? null,
    sourceType: buildSourceType(candidate, review, doc),
    description,
    relevance,
    url: buildPromotedUrl(review, doc),
    isDuplicate: false,
    doi: null,
    publisher: null,
    documentId: doc.id,
  }
}

function buildReportPayload(
  batchName: string,
  typedId: string,
  candidate: PromotionCandidateRow,
  review: ReviewRow | null,
  doc: BatchDocument,
): ReportCreatePayload {
  const title = buildPromotedTitle(candidate, review, doc)
  const summary = normalizeWhitespace(doc.summary)
  const relevance =
    normalizeWhitespace(candidate.reason) ||
    (isMeaningfulSummary(summary) ? summary : '') ||
    `Promoted from ${review?.source_top_folder || candidate.source_top_folder}.`

  return {
    id: typedId,
    title,
    fullTitle: title !== normalizeWhitespace(doc.title) ? normalizeWhitespace(doc.title) || null : null,
    author: normalizeWhitespace(doc.author) || null,
    institution: null,
    date: buildPromotedYear(review, doc)?.toString() ?? null,
    year: buildPromotedYear(review, doc),
    sourceUrl: buildPromotedUrl(review, doc),
    reportCategory: buildReportCategory(candidate, review),
    country: buildPromotedCountry(review, doc),
    keyFindings: [],
    recommendations: [],
    relevance,
    tags: dedupe([`batch:${batchName}`, buildPromotedTheme(review, doc), review?.source_top_folder, candidate.source_top_folder]),
    doi: null,
    isbn: null,
    issn: null,
    publisher: null,
    documentId: doc.id,
  }
}

function inferDegree(title: string): string {
  const normalized = normalizeComparableText(title)
  if (normalized.includes('phd') || normalized.includes('doctoral') || normalized.includes('dissertation')) return 'phd'
  return 'master'
}

function buildThesisPayload(
  batchName: string,
  typedId: string,
  candidate: PromotionCandidateRow,
  review: ReviewRow | null,
  thesisReview: ThesisReviewRow | null,
  doc: BatchDocument,
): ThesisCreatePayload {
  const title = normalizeWhitespace(thesisReview?.final_title) || buildPromotedTitle(candidate, review, doc)
  const summary = normalizeWhitespace(doc.summary)
  const promotedYear = parseYear(thesisReview?.final_year) ?? buildPromotedYear(review, doc) ?? 0
  const promotedUrl = normalizeWhitespace(thesisReview?.final_url) || buildPromotedUrl(review, doc) || ''
  const synthesis = normalizeWhitespace(thesisReview?.synthesis) || (isMeaningfulSummary(summary) ? summary : '')

  return {
    id: typedId,
    authors: normalizeWhitespace(thesisReview?.authors) || normalizeWhitespace(doc.author),
    institution: normalizeWhitespace(thesisReview?.institution),
    year: promotedYear,
    title,
    titleNo: null,
    url: promotedUrl,
    synthesis,
    keyFindings: [],
    tags: dedupe([`batch:${batchName}`, buildPromotedTheme(review, doc), review?.source_top_folder, candidate.source_top_folder]),
    takeaways: [],
    method: null,
    awardWinning: false,
    degree: inferDegree(title),
    doi: null,
    isbn: null,
    publisher: null,
    accessDate: null,
    documentId: doc.id,
  }
}

function sourceDocMissingFields(payload: SourceDocCreatePayload): string[] {
  const missing: string[] = []
  if (!payload.documentId) missing.push('documentId')
  if (!payload.filename) missing.push('filename')
  if (!payload.sourceType) missing.push('sourceType')
  if (!payload.description) missing.push('description')
  if (!payload.relevance) missing.push('relevance')
  if (payload.title && titleLooksWeak(payload.title)) missing.push('title-quality')
  return missing
}

function reportMissingFields(payload: ReportCreatePayload, confidence: Confidence): string[] {
  const missing: string[] = []
  if (!payload.documentId) missing.push('documentId')
  if (!payload.title) missing.push('title')
  if (!payload.reportCategory) missing.push('reportCategory')
  if (!payload.country) missing.push('country')
  if (!payload.relevance) missing.push('relevance')
  if (titleLooksWeak(payload.title)) missing.push('title-quality')
  if (confidence === 'low') missing.push('confidence-below-medium')
  if (!payload.year && !payload.sourceUrl) missing.push('year-or-sourceUrl')
  return missing
}

function thesisMissingFields(payload: ThesisCreatePayload): string[] {
  const missing: string[] = []
  if (!payload.documentId) missing.push('documentId')
  if (!payload.authors) missing.push('authors')
  if (!payload.institution) missing.push('institution')
  if (!payload.year) missing.push('year')
  if (!payload.title) missing.push('title')
  if (!payload.url) missing.push('url')
  if (!payload.synthesis) missing.push('synthesis')
  if (titleLooksWeak(payload.title)) missing.push('title-quality')
  return missing
}

function findSourceDocExactMatch(payload: SourceDocCreatePayload, sourceDocs: ExistingSourceDoc[]): ExactMatchResult<ExistingSourceDoc> {
  const normalizedUrl = normalizeUrl(payload.url)
  if (!normalizedUrl) return { status: 'none' }

  const matches = sourceDocs.filter((record) => normalizeUrl(record.url) === normalizedUrl)
  if (matches.length === 0) return { status: 'none' }
  if (matches.length > 1) return { status: 'ambiguous', ids: matches.map((match) => match.id) }
  return { status: 'match', record: matches[0] }
}

function findReportExactMatch(payload: ReportCreatePayload, reports: ExistingReport[]): ExactMatchResult<ExistingReport> {
  const normalizedUrl = normalizeUrl(payload.sourceUrl)
  if (normalizedUrl) {
    const urlMatches = reports.filter((record) => normalizeUrl(record.sourceUrl) === normalizedUrl)
    if (urlMatches.length === 1) return { status: 'match', record: urlMatches[0] }
    if (urlMatches.length > 1) return { status: 'ambiguous', ids: urlMatches.map((record) => record.id) }
  }

  if (!payload.year) return { status: 'none' }

  const normalizedTitle = normalizeComparableText(payload.title)
  if (!normalizedTitle) return { status: 'none' }

  const titleMatches = reports.filter((record) => {
    if (!record.year) return false
    const titleMatch =
      normalizeComparableText(record.title) === normalizedTitle ||
      normalizeComparableText(record.fullTitle) === normalizedTitle
    if (!titleMatch) return false
    return record.year === payload.year
  })

  if (titleMatches.length === 0) return { status: 'none' }
  if (titleMatches.length > 1) return { status: 'ambiguous', ids: titleMatches.map((record) => record.id) }
  return { status: 'match', record: titleMatches[0] }
}

function findThesisExactMatch(payload: ThesisCreatePayload, theses: ExistingThesis[]): ExactMatchResult<ExistingThesis> {
  const normalizedUrl = normalizeUrl(payload.url)
  if (normalizedUrl) {
    const urlMatches = theses.filter((record) => normalizeUrl(record.url) === normalizedUrl)
    if (urlMatches.length === 1) return { status: 'match', record: urlMatches[0] }
    if (urlMatches.length > 1) return { status: 'ambiguous', ids: urlMatches.map((record) => record.id) }
  }

  const normalizedTitle = normalizeComparableText(payload.title)
  if (!normalizedTitle) return { status: 'none' }

  const titleMatches = theses.filter((record) => {
    const titleMatch =
      normalizeComparableText(record.title) === normalizedTitle ||
      normalizeComparableText(record.titleNo) === normalizedTitle
    if (!titleMatch) return false
    return record.year === payload.year
  })

  if (titleMatches.length === 0) return { status: 'none' }
  if (titleMatches.length > 1) return { status: 'ambiguous', ids: titleMatches.map((record) => record.id) }
  return { status: 'match', record: titleMatches[0] }
}

function buildReasonSummary(reasonCodes: string[]): string {
  return reasonCodes.join(' | ')
}

function decisionBase(
  target: TypedTarget,
  candidate: PromotionCandidateRow,
  review: ReviewRow | null,
  doc: BatchDocument | null,
  typedId: string,
): Omit<DecisionRow, 'status' | 'operation' | 'existingId' | 'reasonCodes' | 'reasonSummary' | 'payloadPreview'> {
  return {
    target,
    sourcePath: candidate.source_path,
    importFilePath: candidate.import_file_path,
    filename: candidate.filename,
    confidence: matchConfidence(candidate.confidence),
    documentId: doc?.id ?? null,
    documentTitle: normalizeWhitespace(doc?.title) || normalizeWhitespace(candidate.current_title) || candidate.filename,
    promotedTitle: buildPromotedTitle(candidate, review, doc),
    typedId,
    currentTargetLinks: buildCurrentTargetLinks(doc),
    reviewAction: normalizeWhitespace(review?.action || candidate.action).toLowerCase() || 'unknown',
    titleRemediationStatus: 'clear',
  }
}

function evaluateSourceDocDecision(batchName: string, candidate: PromotionCandidateRow, context: LoadedContext): DecisionRow {
  const review = context.reviewBySourcePath.get(candidate.source_path) ?? null
  const importRecord = context.importSummaryBySourcePath.get(candidate.source_path) ?? null
  const doc =
    context.documentsByFilePath.get(candidate.import_file_path) ??
    context.documentsBySourcePath.get(candidate.source_path) ??
    null
  const typedId = buildStableId('SourceDoc', doc ?? {
    id: '',
    filePath: candidate.import_file_path,
    title: candidate.current_title,
    author: null,
    year: null,
    country: null,
    documentType: null,
    category: null,
    subcategory: null,
    url: null,
    summary: null,
    tags: [],
    metadata: null,
    sourceDoc: null,
    report: null,
    thesis: null,
  }, review)
  const base = decisionBase('SourceDoc', candidate, review, doc, typedId)
  const reasonCodes: string[] = []

  if (!doc) {
    reasonCodes.push('missing-batch-document')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const remediation = context.titleRemediationBySourcePath.get(candidate.source_path) ?? null
  if (!titleRemediationResolved(remediation, doc)) {
    reasonCodes.push('unresolved-title-remediation')
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
      titleRemediationStatus: 'blocked',
    }
  }

  if (base.reviewAction !== 'import' || normalizeWhitespace(importRecord?.status).startsWith('missing-source')) {
    reasonCodes.push('review-action-not-import')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const conflictingLinks = otherTargetLinked('SourceDoc', doc)
  if (conflictingLinks.length > 0) {
    reasonCodes.push(`document-linked-to-other-target:${conflictingLinks.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
    }
  }

  const payload = buildSourceDocPayload(batchName, typedId, candidate, review, doc)
  const missingFields = sourceDocMissingFields(payload)
  if (missingFields.length > 0) {
    reasonCodes.push(`sourceDoc-metadata-too-weak:${missingFields.join('+')}`)
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  if (doc.sourceDoc) {
    reasonCodes.push('document-already-linked-to-sourcedoc')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: doc.sourceDoc.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const existingById = context.sourceDocs.find((record) => record.id === payload.id) ?? null
  if (existingById) {
    if (existingById.documentId && existingById.documentId !== doc.id) {
      reasonCodes.push(`typed-id-already-claimed:${existingById.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: existingById.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('stable-id-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: existingById.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const exactMatch = findSourceDocExactMatch(payload, context.sourceDocs)
  if (exactMatch.status === 'ambiguous') {
    reasonCodes.push(`ambiguous-existing-sourcedoc-match:${exactMatch.ids.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  if (exactMatch.status === 'match') {
    if (exactMatch.record.documentId && exactMatch.record.documentId !== doc.id) {
      reasonCodes.push(`existing-sourcedoc-linked-elsewhere:${exactMatch.record.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: exactMatch.record.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('exact-url-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: exactMatch.record.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  reasonCodes.push('eligible-create')
  return {
    ...base,
    status: 'would-create',
    operation: 'create',
    existingId: null,
    reasonCodes,
    reasonSummary: buildReasonSummary(reasonCodes),
    payloadPreview: payload,
  }
}

function evaluateReportDecision(batchName: string, candidate: PromotionCandidateRow, context: LoadedContext): DecisionRow {
  const review = context.reviewBySourcePath.get(candidate.source_path) ?? null
  const doc =
    context.documentsByFilePath.get(candidate.import_file_path) ??
    context.documentsBySourcePath.get(candidate.source_path) ??
    null
  const typedId = buildStableId('Report', doc ?? {
    id: '',
    filePath: candidate.import_file_path,
    title: candidate.current_title,
    author: null,
    year: null,
    country: null,
    documentType: null,
    category: null,
    subcategory: null,
    url: null,
    summary: null,
    tags: [],
    metadata: null,
    sourceDoc: null,
    report: null,
    thesis: null,
  }, review)
  const base = decisionBase('Report', candidate, review, doc, typedId)
  const reasonCodes: string[] = []

  if (!doc) {
    reasonCodes.push('missing-batch-document')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const remediation = context.titleRemediationBySourcePath.get(candidate.source_path) ?? null
  if (!titleRemediationResolved(remediation, doc)) {
    reasonCodes.push('unresolved-title-remediation')
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
      titleRemediationStatus: 'blocked',
    }
  }

  if (base.reviewAction !== 'import') {
    reasonCodes.push('review-action-not-import')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const conflictingLinks = otherTargetLinked('Report', doc)
  if (conflictingLinks.length > 0) {
    reasonCodes.push(`document-linked-to-other-target:${conflictingLinks.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
    }
  }

  const payload = buildReportPayload(batchName, typedId, candidate, review, doc)
  if (doc.report) {
    reasonCodes.push('document-already-linked-to-report')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: doc.report.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const existingById = context.reports.find((record) => record.id === payload.id) ?? null
  if (existingById) {
    if (existingById.documentId && existingById.documentId !== doc.id) {
      reasonCodes.push(`typed-id-already-claimed:${existingById.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: existingById.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('stable-id-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: existingById.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const exactMatch = findReportExactMatch(payload, context.reports)
  if (exactMatch.status === 'ambiguous') {
    reasonCodes.push(`ambiguous-existing-report-match:${exactMatch.ids.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  if (exactMatch.status === 'match') {
    if (exactMatch.record.documentId && exactMatch.record.documentId !== doc.id) {
      reasonCodes.push(`existing-report-linked-elsewhere:${exactMatch.record.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: exactMatch.record.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('exact-existing-report-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: exactMatch.record.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const effectiveConfidence: Confidence = reviewAllowsLowConfidence(review) && base.confidence === 'low' ? 'medium' : base.confidence
  if (effectiveConfidence !== base.confidence) {
    reasonCodes.push('manual-low-confidence-override')
  }

  const missingFields = reportMissingFields(payload, effectiveConfidence)
  if (missingFields.length > 0) {
    reasonCodes.push(`report-metadata-too-weak:${missingFields.join('+')}`)
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  reasonCodes.push('eligible-create')
  return {
    ...base,
    status: 'would-create',
    operation: 'create',
    existingId: null,
    reasonCodes,
    reasonSummary: buildReasonSummary(reasonCodes),
    payloadPreview: payload,
  }
}

function evaluateThesisDecision(batchName: string, candidate: PromotionCandidateRow, context: LoadedContext): DecisionRow {
  const review = context.reviewBySourcePath.get(candidate.source_path) ?? null
  const thesisReview = context.thesisReviewBySourcePath.get(candidate.source_path) ?? null
  const doc =
    context.documentsByFilePath.get(candidate.import_file_path) ??
    context.documentsBySourcePath.get(candidate.source_path) ??
    null
  const typedId = buildStableId('Thesis', doc ?? {
    id: '',
    filePath: candidate.import_file_path,
    title: candidate.current_title,
    author: null,
    year: null,
    country: null,
    documentType: null,
    category: null,
    subcategory: null,
    url: null,
    summary: null,
    tags: [],
    metadata: null,
    sourceDoc: null,
    report: null,
    thesis: null,
  }, review)
  const base = decisionBase('Thesis', candidate, review, doc, typedId)
  const reasonCodes: string[] = []

  if (!doc) {
    reasonCodes.push('missing-batch-document')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const remediation = context.titleRemediationBySourcePath.get(candidate.source_path) ?? null
  if (!titleRemediationResolved(remediation, doc)) {
    reasonCodes.push('unresolved-title-remediation')
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
      titleRemediationStatus: 'blocked',
    }
  }

  if (base.reviewAction !== 'import') {
    reasonCodes.push('review-action-not-import')
    return { ...base, status: 'skip', operation: 'none', existingId: null, reasonCodes, reasonSummary: buildReasonSummary(reasonCodes), payloadPreview: null }
  }

  const conflictingLinks = otherTargetLinked('Thesis', doc)
  if (conflictingLinks.length > 0) {
    reasonCodes.push(`document-linked-to-other-target:${conflictingLinks.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: null,
    }
  }

  const payload = buildThesisPayload(batchName, typedId, candidate, review, thesisReview, doc)
  if (doc.thesis) {
    reasonCodes.push('document-already-linked-to-thesis')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: doc.thesis.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const existingById = context.theses.find((record) => record.id === payload.id) ?? null
  if (existingById) {
    if (existingById.documentId && existingById.documentId !== doc.id) {
      reasonCodes.push(`typed-id-already-claimed:${existingById.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: existingById.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('stable-id-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: existingById.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const exactMatch = findThesisExactMatch(payload, context.theses)
  if (exactMatch.status === 'ambiguous') {
    reasonCodes.push(`ambiguous-existing-thesis-match:${exactMatch.ids.join('+')}`)
    return {
      ...base,
      status: 'conflict',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  if (exactMatch.status === 'match') {
    if (exactMatch.record.documentId && exactMatch.record.documentId !== doc.id) {
      reasonCodes.push(`existing-thesis-linked-elsewhere:${exactMatch.record.id}`)
      return {
        ...base,
        status: 'conflict',
        operation: 'none',
        existingId: exactMatch.record.id,
        reasonCodes,
        reasonSummary: buildReasonSummary(reasonCodes),
        payloadPreview: payload,
      }
    }

    reasonCodes.push('exact-existing-thesis-match')
    return {
      ...base,
      status: 'would-update',
      operation: 'update',
      existingId: exactMatch.record.id,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  const missingFields = thesisMissingFields(payload)
  if (missingFields.length > 0) {
    reasonCodes.push(`thesis-metadata-too-weak:${missingFields.join('+')}`)
    return {
      ...base,
      status: 'skip',
      operation: 'none',
      existingId: null,
      reasonCodes,
      reasonSummary: buildReasonSummary(reasonCodes),
      payloadPreview: payload,
    }
  }

  reasonCodes.push('eligible-create')
  return {
    ...base,
    status: 'would-create',
    operation: 'create',
    existingId: null,
    reasonCodes,
    reasonSummary: buildReasonSummary(reasonCodes),
    payloadPreview: payload,
  }
}

async function loadContext(batchName: string, paths: BatchPaths, prisma: PrismaClient): Promise<LoadedContext> {
  const [reviewBySourcePath, thesisReviewBySourcePath, promotionCandidatesSummary, importSummary, titleRemediationBySourcePath] = await Promise.all([
    loadReviewRows(paths.reviewCsv),
    loadThesisReviewRows(paths.thesisReviewCsv),
    readJsonIfExists<PromotionCandidatesSummary>(paths.promotionCandidatesSummaryJson),
    readJsonIfExists<ImportSummary>(paths.importSummaryJson),
    loadTitleRemediationRows(paths.titleRemediationCsv),
  ])

  if (!importSummary) throw new Error(`Missing import summary: ${path.relative(ROOT, paths.importSummaryJson)}`)

  const [documents, sourceDocs, reports, theses] = await Promise.all([
    prisma.document.findMany({
      where: { metadata: { path: ['importBatch'], equals: batchName } },
      select: {
        id: true,
        filePath: true,
        title: true,
        author: true,
        year: true,
        country: true,
        documentType: true,
        category: true,
        subcategory: true,
        url: true,
        summary: true,
        tags: true,
        metadata: true,
        sourceDoc: { select: { id: true } },
        report: { select: { id: true } },
        thesis: { select: { id: true } },
      },
    }),
    prisma.sourceDoc.findMany({
      select: {
        id: true,
        filename: true,
        title: true,
        author: true,
        year: true,
        sourceType: true,
        description: true,
        relevance: true,
        url: true,
        isDuplicate: true,
        doi: true,
        publisher: true,
        documentId: true,
      },
    }),
    prisma.report.findMany({
      select: {
        id: true,
        title: true,
        fullTitle: true,
        author: true,
        institution: true,
        date: true,
        year: true,
        sourceUrl: true,
        reportCategory: true,
        country: true,
        keyFindings: true,
        recommendations: true,
        relevance: true,
        tags: true,
        doi: true,
        isbn: true,
        issn: true,
        publisher: true,
        documentId: true,
      },
    }),
    prisma.thesis.findMany({
      select: {
        id: true,
        authors: true,
        institution: true,
        year: true,
        title: true,
        titleNo: true,
        url: true,
        synthesis: true,
        keyFindings: true,
        tags: true,
        takeaways: true,
        method: true,
        awardWinning: true,
        degree: true,
        doi: true,
        isbn: true,
        publisher: true,
        accessDate: true,
        documentId: true,
      },
    }),
  ])

  const importSummaryBySourcePath = new Map<string, ImportSummaryRecord>()
  for (const record of importSummary.records ?? []) {
    if (!record?.sourcePath) continue
    importSummaryBySourcePath.set(record.sourcePath, record)
  }

  return {
    reviewBySourcePath,
    thesisReviewBySourcePath,
    importSummaryBySourcePath,
    titleRemediationBySourcePath,
    documentsByFilePath: new Map(documents.map((doc) => [doc.filePath, doc])),
    documentsBySourcePath: buildDocumentsBySourcePath(documents),
    importSummary,
    promotionCandidatesSummary,
    sourceDocs,
    reports,
    theses,
  }
}

function summarizeDecisions(
  batchName: string,
  targetArg: Exclude<TargetArg, 'all'>,
  decisions: DecisionRow[],
  context: LoadedContext,
  outputs: TargetSummary['outputs'],
  apply: boolean,
  minConfidence: Confidence,
): TargetSummary {
  const targetLabel = mapTargetArgToLabel(targetArg)
  const selected = decisions.length
  const skipped = decisions.filter((decision) => decision.status === 'skip').length
  const conflicts = decisions.filter((decision) => decision.status === 'conflict').length
  const wouldCreate = decisions.filter((decision) => decision.status === 'would-create' || decision.status === 'created').length
  const wouldUpdate = decisions.filter((decision) => decision.status === 'would-update' || decision.status === 'updated').length
  const created = decisions.filter((decision) => decision.status === 'created').length
  const updated = decisions.filter((decision) => decision.status === 'updated').length

  const reasonCounts: Record<string, number> = {}
  for (const decision of decisions) {
    for (const reasonCode of decision.reasonCodes) {
      reasonCounts[reasonCode] = (reasonCounts[reasonCode] ?? 0) + 1
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    batchName,
    target: targetArg,
    targetLabel,
    apply,
    minConfidence,
    selected,
    promotable: wouldCreate + wouldUpdate,
    skipped,
    conflicts,
    wouldCreate,
    wouldUpdate,
    created,
    updated,
    artifactChecks: {
      importedRowsInSummary: context.importSummary.records?.length ?? 0,
      batchDocumentsInDb: context.documentsByFilePath.size,
      promotionSummaryTargetCount: context.promotionCandidatesSummary?.countsByTarget?.[targetLabel] ?? null,
    },
    reasonCounts,
    outputs,
  }
}

function decisionRowsToCsv(decisions: DecisionRow[]): string {
  const header = [
    'target',
    'status',
    'operation',
    'confidence',
    'document_id',
    'typed_id',
    'existing_id',
    'source_path',
    'import_file_path',
    'filename',
    'document_title',
    'promoted_title',
    'review_action',
    'title_remediation_status',
    'current_target_links',
    'reason_codes',
    'reason_summary',
    'payload_preview',
  ]

  const rows = decisions.map((decision) => [
    decision.target,
    decision.status,
    decision.operation,
    decision.confidence,
    decision.documentId ?? '',
    decision.typedId,
    decision.existingId ?? '',
    decision.sourcePath,
    decision.importFilePath,
    decision.filename,
    decision.documentTitle,
    decision.promotedTitle,
    decision.reviewAction,
    decision.titleRemediationStatus,
    decision.currentTargetLinks.join(' | '),
    decision.reasonCodes.join(' | '),
    decision.reasonSummary,
    JSON.stringify(decision.payloadPreview ?? {}),
  ])

  return stringifyCsv([header, ...rows])
}

function buildMarkdown(summary: TargetSummary, decisions: DecisionRow[]): string {
  const lines: string[] = []
  lines.push(`# ${summary.targetLabel} Promotion Preview`)
  lines.push('')
  lines.push(`- Generated: ${summary.generatedAt}`)
  lines.push(`- Batch: \`${summary.batchName}\``)
  lines.push(`- Target: \`${summary.target}\``)
  lines.push(`- Mode: \`${summary.apply ? 'apply' : 'dry-run'}\``)
  lines.push(`- Minimum confidence: \`${summary.minConfidence}\``)
  lines.push(`- Selected rows: ${summary.selected}`)
  lines.push(`- Promotable rows: ${summary.promotable}`)
  lines.push(`- Would create: ${summary.wouldCreate}`)
  lines.push(`- Would update: ${summary.wouldUpdate}`)
  lines.push(`- Skipped rows: ${summary.skipped}`)
  lines.push(`- Conflicts: ${summary.conflicts}`)
  lines.push('')
  lines.push('## Artifact Checks')
  lines.push('')
  lines.push(`- Import summary rows: ${summary.artifactChecks.importedRowsInSummary}`)
  lines.push(`- Batch documents in DB: ${summary.artifactChecks.batchDocumentsInDb}`)
  lines.push(`- Candidate summary target count: ${summary.artifactChecks.promotionSummaryTargetCount ?? 'n/a'}`)
  lines.push('')
  lines.push('## Reason Counts')
  lines.push('')

  const reasonEntries = Object.entries(summary.reasonCounts).sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
  if (reasonEntries.length === 0) {
    lines.push('- None')
  } else {
    for (const [reason, count] of reasonEntries) {
      lines.push(`- ${reason}: ${count}`)
    }
  }

  lines.push('')
  lines.push('## Promotable Rows')
  lines.push('')
  lines.push('| Status | Typed ID | Source Path | Title | Reason |')
  lines.push('| --- | --- | --- | --- | --- |')
  const promotable = decisions.filter((decision) => decision.status === 'would-create' || decision.status === 'would-update' || decision.status === 'created' || decision.status === 'updated')
  if (promotable.length === 0) {
    lines.push('| None |  |  |  |  |')
  } else {
    for (const decision of promotable) {
      lines.push(`| ${decision.status} | \`${decision.typedId}\` | ${decision.sourcePath} | ${decision.promotedTitle} | ${decision.reasonSummary} |`)
    }
  }

  lines.push('')
  lines.push('## Blocked Rows')
  lines.push('')
  lines.push('| Status | Source Path | Title | Reason |')
  lines.push('| --- | --- | --- | --- |')
  const blocked = decisions.filter((decision) => decision.status === 'skip' || decision.status === 'conflict')
  if (blocked.length === 0) {
    lines.push('| None |  |  |  |')
  } else {
    for (const decision of blocked) {
      lines.push(`| ${decision.status} | ${decision.sourcePath} | ${decision.promotedTitle} | ${decision.reasonSummary} |`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

async function writeArtifacts(
  intakeDir: string,
  targetArg: Exclude<TargetArg, 'all'>,
  summary: TargetSummary,
  decisions: DecisionRow[],
): Promise<void> {
  const csvPath = path.join(intakeDir, `promotion-preview-${targetArg}.csv`)
  const jsonPath = path.join(intakeDir, `promotion-preview-${targetArg}.json`)
  const mdPath = path.join(intakeDir, `promotion-preview-${targetArg}.md`)

  await fs.writeFile(csvPath, decisionRowsToCsv(decisions), 'utf8')
  await fs.writeFile(jsonPath, JSON.stringify({ summary, decisions }, null, 2) + '\n', 'utf8')
  await fs.writeFile(mdPath, buildMarkdown(summary, decisions), 'utf8')
}

function mergeSourceDocForUpdate(existing: ExistingSourceDoc, payload: SourceDocCreatePayload): Omit<SourceDocCreatePayload, 'id'> {
  return {
    filename: payload.filename || existing.filename,
    title: payload.title ?? existing.title,
    author: payload.author ?? existing.author,
    year: payload.year ?? existing.year,
    sourceType: existing.sourceType || payload.sourceType,
    description: existing.description || payload.description,
    relevance: existing.relevance || payload.relevance,
    url: existing.url ?? payload.url,
    isDuplicate: existing.isDuplicate,
    doi: existing.doi ?? payload.doi,
    publisher: existing.publisher ?? payload.publisher,
    documentId: payload.documentId,
  }
}

function mergeReportForUpdate(
  existing: ExistingReport,
  payload: ReportCreatePayload,
): Omit<ReportCreatePayload, 'id'> & { country: string } {
  return {
    title: existing.title || payload.title,
    fullTitle: existing.fullTitle ?? payload.fullTitle,
    author: existing.author ?? payload.author,
    institution: existing.institution ?? payload.institution,
    date: existing.date ?? payload.date,
    year: existing.year ?? payload.year,
    sourceUrl: existing.sourceUrl ?? payload.sourceUrl,
    reportCategory: existing.reportCategory || payload.reportCategory,
    country: payload.country ?? existing.country,
    keyFindings: existing.keyFindings.length > 0 ? existing.keyFindings : payload.keyFindings,
    recommendations: existing.recommendations.length > 0 ? existing.recommendations : payload.recommendations,
    relevance: existing.relevance || payload.relevance,
    tags: dedupe([...existing.tags, ...payload.tags]),
    doi: existing.doi ?? payload.doi,
    isbn: existing.isbn ?? payload.isbn,
    issn: existing.issn ?? payload.issn,
    publisher: existing.publisher ?? payload.publisher,
    documentId: payload.documentId,
  }
}

function mergeThesisForUpdate(existing: ExistingThesis, payload: ThesisCreatePayload): Omit<ThesisCreatePayload, 'id'> {
  return {
    authors: existing.authors || payload.authors,
    institution: existing.institution || payload.institution,
    year: existing.year || payload.year,
    title: existing.title || payload.title,
    titleNo: existing.titleNo ?? payload.titleNo,
    url: existing.url || payload.url,
    synthesis: existing.synthesis || payload.synthesis,
    keyFindings: existing.keyFindings.length > 0 ? existing.keyFindings : payload.keyFindings,
    tags: dedupe([...existing.tags, ...payload.tags]),
    takeaways: existing.takeaways.length > 0 ? existing.takeaways : payload.takeaways,
    method: existing.method ?? payload.method,
    awardWinning: existing.awardWinning,
    degree: existing.degree || payload.degree,
    doi: existing.doi ?? payload.doi,
    isbn: existing.isbn ?? payload.isbn,
    publisher: existing.publisher ?? payload.publisher,
    accessDate: existing.accessDate ?? payload.accessDate,
    documentId: payload.documentId,
  }
}

async function applyDecision(decision: DecisionRow, context: LoadedContext, prisma: PrismaClient): Promise<DecisionRow> {
  if (decision.status !== 'would-create' && decision.status !== 'would-update') return decision
  if (!decision.documentId || !decision.payloadPreview) return { ...decision, status: 'skip', operation: 'none', reasonCodes: [...decision.reasonCodes, 'missing-apply-payload'], reasonSummary: buildReasonSummary([...decision.reasonCodes, 'missing-apply-payload']) }

  if (decision.target === 'SourceDoc') {
    const payload = decision.payloadPreview as SourceDocCreatePayload
    if (decision.operation === 'create') {
      await prisma.sourceDoc.create({ data: payload })
      return { ...decision, status: 'created' }
    }

    const existing = context.sourceDocs.find((record) => record.id === decision.existingId)
    if (!existing) throw new Error(`Missing SourceDoc for update: ${decision.existingId}`)
    await prisma.sourceDoc.update({
      where: { id: existing.id },
      data: mergeSourceDocForUpdate(existing, payload),
    })
    return { ...decision, status: 'updated' }
  }

  if (decision.target === 'Report') {
    const payload = decision.payloadPreview as ReportCreatePayload
    if (decision.operation === 'create') {
      if (!payload.country) throw new Error(`Missing country for report create: ${decision.typedId}`)
      await prisma.report.create({ data: { ...payload, country: payload.country } })
      return { ...decision, status: 'created' }
    }

    const existing = context.reports.find((record) => record.id === decision.existingId)
    if (!existing) throw new Error(`Missing Report for update: ${decision.existingId}`)
    await prisma.report.update({
      where: { id: existing.id },
      data: mergeReportForUpdate(existing, payload),
    })
    return { ...decision, status: 'updated' }
  }

  const payload = decision.payloadPreview as ThesisCreatePayload
  if (decision.operation === 'create') {
    await prisma.thesis.create({ data: payload })
    return { ...decision, status: 'created' }
  }

  const existing = context.theses.find((record) => record.id === decision.existingId)
  if (!existing) throw new Error(`Missing Thesis for update: ${decision.existingId}`)
  await prisma.thesis.update({
    where: { id: existing.id },
    data: mergeThesisForUpdate(existing, payload),
  })
  return { ...decision, status: 'updated' }
}

async function processTarget(
  batchName: string,
  targetArg: Exclude<TargetArg, 'all'>,
  candidates: PromotionCandidateRow[],
  context: LoadedContext,
  prisma: PrismaClient,
  intakeDir: string,
  apply: boolean,
  minConfidence: Confidence,
): Promise<TargetSummary> {
  const targetLabel = mapTargetArgToLabel(targetArg)

  const selectedCandidates = candidates.filter((candidate) => {
    if (candidate.recommended_target !== targetLabel) return false
    return confidencePasses(candidate, minConfidence)
  })

  let decisions = selectedCandidates.map((candidate) => {
    if (targetLabel === 'SourceDoc') return evaluateSourceDocDecision(batchName, candidate, context)
    if (targetLabel === 'Report') return evaluateReportDecision(batchName, candidate, context)
    return evaluateThesisDecision(batchName, candidate, context)
  })

  if (apply) {
    const applied: DecisionRow[] = []
    for (const decision of decisions) {
      applied.push(await applyDecision(decision, context, prisma))
    }
    decisions = applied
  }

  const outputs = {
    csv: path.relative(ROOT, path.join(intakeDir, `promotion-preview-${targetArg}.csv`)),
    json: path.relative(ROOT, path.join(intakeDir, `promotion-preview-${targetArg}.json`)),
    md: path.relative(ROOT, path.join(intakeDir, `promotion-preview-${targetArg}.md`)),
  }

  const summary = summarizeDecisions(batchName, targetArg, decisions, context, outputs, apply, minConfidence)
  await writeArtifacts(intakeDir, targetArg, summary, decisions)

  console.log(
    `[food-process-promote] target=${targetArg} selected=${summary.selected} promotable=${summary.promotable} ` +
      `create=${summary.wouldCreate} update=${summary.wouldUpdate} skipped=${summary.skipped} conflicts=${summary.conflicts} mode=${apply ? 'apply' : 'dry-run'}`,
  )
  console.log(`[food-process-promote] artifacts=${outputs.csv}, ${outputs.json}, ${outputs.md}`)

  return summary
}

async function main(): Promise<void> {
  const options = parseArgs()
  const paths = buildPaths(options.batchName)

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const [candidates, context] = await Promise.all([
      loadPromotionCandidates(paths.promotionCandidatesCsv),
      loadContext(options.batchName, paths, prisma),
    ])

    await fs.mkdir(paths.intakeDir, { recursive: true })

    const targets = options.target === 'all' ? (['sourcedoc', 'report', 'thesis'] as const) : [options.target]
    const summaries: TargetSummary[] = []

    for (const target of targets) {
      summaries.push(
        await processTarget(
          options.batchName,
          target,
          candidates,
          context,
          prisma,
          paths.intakeDir,
          options.apply,
          options.minConfidence,
        ),
      )
    }

    if (options.target === 'all') {
      const combinedPath = path.join(paths.intakeDir, 'promotion-preview-all-summary.json')
      await fs.writeFile(combinedPath, JSON.stringify({ generatedAt: new Date().toISOString(), summaries }, null, 2) + '\n', 'utf8')
      console.log(`[food-process-promote] combined-summary=${path.relative(ROOT, combinedPath)}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
