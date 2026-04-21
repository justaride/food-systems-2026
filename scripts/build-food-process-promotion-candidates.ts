import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const BATCH_NAME = 'food-research-process-2026-04-20'
const INTAKE_DIR = path.join(ROOT, `research/intake/${BATCH_NAME}`)
const REVIEW_CSV = path.join(INTAKE_DIR, 'review.csv')
const TITLE_REMEDIATION_CSV = path.join(INTAKE_DIR, 'title-remediation.csv')
const IMPORT_SUMMARY_JSON = path.join(INTAKE_DIR, 'import-summary.json')
const OUTPUT_CSV = path.join(INTAKE_DIR, 'promotion-candidates.csv')
const OUTPUT_MD = path.join(INTAKE_DIR, 'PROMOTION-CANDIDATES.md')
const OUTPUT_JSON = path.join(INTAKE_DIR, 'promotion-candidates-summary.json')

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

type Confidence = 'high' | 'medium' | 'low'
type RecommendationTarget = 'SourceDoc' | 'Report' | 'Thesis' | 'Hold' | 'Manual review'
type TypedTarget = Exclude<RecommendationTarget, 'Hold' | 'Manual review'>
type TitleSource = 'title_remediation' | 'import_summary' | 'review_csv' | 'filename'

type Signal = {
  target: TypedTarget
  points: number
  label: string
}

type HeuristicContext = {
  currentTitle: string
  analysisTitle: string
  analysisTitleSource: TitleSource
  remediationTitle: string | null
  remediationConfirmed: boolean
  remediation: TitleRemediationRow | null
  importRecord: ImportSummaryRecord | null
  weakReasons: string[]
}

type Recommendation = {
  row: ReviewRow
  target: RecommendationTarget
  confidence: Confidence
  reason: string
  primarySignals: string[]
  cautionFlags: string[]
  currentTitle: string
  analysisTitle: string
  analysisTitleSource: TitleSource
  remediationSuggestedTitle: string
  scoreSourceDoc: number
  scoreReport: number
  scoreThesis: number
}

type PatternRule = {
  pattern: RegExp
  points: number
  label: string
}

const THESIS_STRONG_RULES: PatternRule[] = [
  { pattern: /\bph\.?d(?: thesis)?\b/, points: 10, label: 'title/filename matches a phd or doctoral thesis pattern' },
  { pattern: /\bdoctoral(?: thesis)?\b/, points: 10, label: 'title/filename contains doctoral thesis language' },
  { pattern: /\bdissertation\b/, points: 10, label: 'title/filename contains dissertation language' },
  { pattern: /\bmaster(?:'s)? thesis\b/, points: 10, label: 'title/filename contains master thesis language' },
  { pattern: /\bmasteroppgave\b/, points: 10, label: 'title/filename contains masteroppgave language' },
  { pattern: /\bbachelor thesis\b/, points: 10, label: 'title/filename contains bachelor thesis language' },
  { pattern: /\bafgangsprojekt\b/, points: 10, label: 'title/filename contains afgangsprojekt language' },
  { pattern: /\bavhandling\b/, points: 10, label: 'title/filename contains avhandling language' },
  { pattern: /\bdoctor thesis\b/, points: 10, label: 'title/filename contains doctor thesis language' },
]

const THESIS_WEAK_RULES: PatternRule[] = [
  { pattern: /\bthesis\b/, points: 6, label: 'title/filename mentions thesis' },
  { pattern: /\boppgave\b/, points: 6, label: 'title/filename mentions oppgave' },
]

const REPORT_SERIES_RULES: PatternRule[] = [
  { pattern: /\bannual report\b/, points: 10, label: 'title/filename matches annual report language' },
  { pattern: /\baarsrapport\b/, points: 10, label: 'title/filename matches arsrapport language' },
  { pattern: /\barsrapport\b/, points: 10, label: 'title/filename matches arsrapport language' },
  { pattern: /\barsredovisning\b/, points: 10, label: 'title/filename matches arsredovisning language' },
  { pattern: /\binterim report\b/, points: 10, label: 'title/filename matches interim report language' },
  { pattern: /\byear[- ]?end report\b/, points: 10, label: 'title/filename matches year-end report language' },
  { pattern: /\bimpact report\b/, points: 10, label: 'title/filename matches impact report language' },
  { pattern: /\bsustainability report\b/, points: 10, label: 'title/filename matches sustainability report language' },
  { pattern: /\btrading update\b/, points: 10, label: 'title/filename matches trading update language' },
  { pattern: /\bdagligvarerapport\b/, points: 10, label: 'title/filename matches dagligvarerapport language' },
  { pattern: /\bdagligvare rapport\b/, points: 10, label: 'title/filename matches dagligvare rapport language' },
  { pattern: /\bars og baerekraftsrapport\b/, points: 10, label: 'title/filename matches annual sustainability report language' },
]

const REPORT_OFFICIAL_RULES: PatternRule[] = [
  { pattern: /\bsou\s*\d{4}:\d+\b/, points: 10, label: 'title/filename contains an SOU official-report marker' },
  { pattern: /\bnou\s*\d{4}:\d+\b/, points: 10, label: 'title/filename contains an NOU official-report marker' },
  { pattern: /\bdokument\s*3[:\-]\s*\d+\b/, points: 10, label: 'title/filename contains a Dokument 3 official-report marker' },
  { pattern: /\btildelingsbrev\b/, points: 10, label: 'title/filename contains tildelingsbrev language' },
]

const REPORT_GENERIC_RULES: PatternRule[] = [
  { pattern: /\bpolicy report\b/, points: 4, label: 'title/filename uses policy report language' },
  { pattern: /\breport\b/, points: 4, label: 'title/filename uses report language' },
  { pattern: /\brapport\b/, points: 4, label: 'title/filename uses rapport language' },
  { pattern: /\butredning\b/, points: 4, label: 'title/filename uses utredning language' },
  { pattern: /\bevaluation\b/, points: 4, label: 'title/filename uses evaluation language' },
  { pattern: /\breview report\b/, points: 4, label: 'title/filename uses review report language' },
  { pattern: /\bfinal report\b/, points: 4, label: 'title/filename uses final report language' },
  { pattern: /\bstudy\b/, points: 4, label: 'title/filename uses study language' },
  { pattern: /\banalyse\b/, points: 4, label: 'title/filename uses analyse language' },
  { pattern: /\banalysis\b/, points: 4, label: 'title/filename uses analysis language' },
  { pattern: /\bkartlegging\b/, points: 4, label: 'title/filename uses kartlegging language' },
  { pattern: /\bscenarioanalyse\b/, points: 4, label: 'title/filename uses scenarioanalyse language' },
  { pattern: /\bmarginstudie\b/, points: 4, label: 'title/filename uses marginstudie language' },
  { pattern: /\baction plan\b/, points: 4, label: 'title/filename uses action plan language' },
  { pattern: /\bhandlingsplan\b/, points: 4, label: 'title/filename uses handlingsplan language' },
]

const SOURCE_PUBLISHER_RULES: PatternRule[] = [
  { pattern: /regjeringen\.no/, points: 10, label: 'title/filename references regjeringen.no' },
  { pattern: /sciencedirect/, points: 10, label: 'title/filename references ScienceDirect' },
  { pattern: /european commission/, points: 10, label: 'title/filename references the European Commission' },
  { pattern: /nofima/, points: 10, label: 'title/filename references Nofima' },
  { pattern: /framtiden i vare hender/, points: 10, label: 'title/filename references Framtiden i vaare hender' },
  { pattern: /stockholm resilience centre/, points: 10, label: 'title/filename references Stockholm Resilience Centre' },
  { pattern: /petfoodindustry/, points: 10, label: 'title/filename references PetfoodIndustry' },
  { pattern: /ppti news/, points: 10, label: 'title/filename references PPTI News' },
  { pattern: /the fish site/, points: 10, label: 'title/filename references The Fish Site' },
  { pattern: /vegconomist/, points: 10, label: 'title/filename references vegconomist' },
  { pattern: /tech\.eu/, points: 10, label: 'title/filename references Tech.eu' },
  { pattern: /slu\.se/, points: 10, label: 'title/filename references SLU' },
  { pattern: /skemman/, points: 10, label: 'title/filename references Skemman' },
  { pattern: /rastech magazine/, points: 10, label: 'title/filename references RASTECH Magazine' },
  { pattern: /nordic cooperation/, points: 10, label: 'title/filename references Nordic cooperation' },
  { pattern: /huoltovarmuuskeskus/, points: 10, label: 'title/filename references Huoltovarmuuskeskus' },
  { pattern: /arcticstartup/, points: 10, label: 'title/filename references ArcticStartup' },
  { pattern: /gfi europe/, points: 10, label: 'title/filename references GFI Europe' },
  { pattern: /civita/, points: 10, label: 'title/filename references Civita' },
]

const SOURCE_GENERIC_RULES: PatternRule[] = [
  { pattern: /\bfactsheet\b/, points: 7, label: 'title/filename uses factsheet language' },
  { pattern: /\bfact sheet\b/, points: 7, label: 'title/filename uses fact sheet language' },
  { pattern: /\bbrochure\b/, points: 7, label: 'title/filename uses brochure language' },
  { pattern: /\bpress release\b/, points: 7, label: 'title/filename uses press-release language' },
  { pattern: /\bfrettatilkynning\b/, points: 7, label: 'title/filename uses press-announcement language' },
  { pattern: /\bannouncement\b/, points: 7, label: 'title/filename uses announcement language' },
  { pattern: /\bnews\b/, points: 7, label: 'title/filename uses news language' },
  { pattern: /\bnyhet\b/, points: 7, label: 'title/filename uses nyhet language' },
  { pattern: /\bjournal\b/, points: 7, label: 'title/filename uses journal language' },
  { pattern: /\bmagazine\b/, points: 7, label: 'title/filename uses magazine language' },
  { pattern: /\bhomepage\b/, points: 7, label: 'title/filename uses homepage language' },
  { pattern: /\bwebsite\b/, points: 7, label: 'title/filename uses website language' },
  { pattern: /\bwebpage\b/, points: 7, label: 'title/filename uses webpage language' },
  { pattern: /\barticle\b/, points: 7, label: 'title/filename uses article language' },
  { pattern: /\bhome\b/, points: 7, label: 'title/filename looks like a homepage capture' },
  { pattern: /\bforsiden\b/, points: 7, label: 'title/filename looks like a front-page capture' },
]

const SOURCE_NEWSY_RULES: PatternRule[] = [
  { pattern: /\bbankrupt(?:cy)?\b/, points: 5, label: 'title/filename uses bankruptcy news language' },
  { pattern: /\bdeclared\b/, points: 5, label: 'title/filename uses declared news language' },
  { pattern: /\bclosure\b/, points: 5, label: 'title/filename uses closure news language' },
  { pattern: /\bcloses?\b/, points: 5, label: 'title/filename uses closure or news language' },
  { pattern: /\bshuts?\s+down\b/, points: 5, label: 'title/filename uses shutdown news language' },
  { pattern: /\bfiles?\s+for\s+bankruptcy\b/, points: 5, label: 'title/filename uses bankruptcy filing language' },
  { pattern: /\bliquidation\b/, points: 5, label: 'title/filename uses liquidation language' },
  { pattern: /\breconstruction\b/, points: 5, label: 'title/filename uses reconstruction language' },
  { pattern: /\bacquires?\b/, points: 5, label: 'title/filename uses acquisition news language' },
  { pattern: /\bacquisition\b/, points: 5, label: 'title/filename uses acquisition language' },
  { pattern: /\blessons from\b/, points: 5, label: 'title/filename reads like commentary or analysis coverage' },
  { pattern: /\bfive reasons\b/, points: 5, label: 'title/filename reads like article-style commentary' },
  { pattern: /\bstrategy shift\b/, points: 5, label: 'title/filename reads like company-news coverage' },
  { pattern: /\bdecline\b/, points: 5, label: 'title/filename reads like commentary or market coverage' },
  { pattern: /\bboost\b/, points: 5, label: 'title/filename reads like announcement coverage' },
]

const JOURNAL_CITATION_RULES: PatternRule[] = [
  { pattern: /\bdoi:\b/, points: 10, label: 'title/filename includes a DOI citation marker' },
  { pattern: /\bvol\.?\s*\d+\b/, points: 10, label: 'title/filename includes a journal volume marker' },
  { pattern: /\bissue\s*\d+\b/, points: 10, label: 'title/filename includes a journal issue marker' },
]

const PLACEHOLDER_PATTERNS = [/\buntitled\b/, /\bcellar\b/, /\bdoc\s*\d+\b/, /\bproof\b/, /\bindd\b/]
const WORD_EXPORT_PATTERN = /^microsoft word\b/i
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

function parseCsv(content: string): string[][] {
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1)
  }

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

function humanizeFilename(filename: string): string {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[._]+/g, ' ')
    .replace(/[-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeWhitespace(value: string | null | undefined): string {
  return (value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim()
}

function toAsciiFolded(value: string): string {
  const normalizedInput = value.normalize('NFC')
  const replacements: Array<[RegExp, string]> = [
    [/æ/gi, 'ae'],
    [/ø/gi, 'o'],
    [/å/gi, 'aa'],
    [/ä/gi, 'a'],
    [/ö/gi, 'o'],
    [/ü/gi, 'u'],
    [/ß/g, 'ss'],
    [/œ/gi, 'oe'],
  ]

  let normalized = normalizedInput
  for (const [pattern, replacement] of replacements) {
    normalized = normalized.replace(pattern, replacement)
  }

  return normalized.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
}

function normalizeComparableText(value: string | null | undefined): string {
  return normalizeWhitespace(value).toLocaleLowerCase('en-US')
}

function toSearchableText(...values: string[]): string {
  return toAsciiFolded(values.filter(Boolean).join(' | '))
    .toLowerCase()
    .replace(/[,_/\\()+]+/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function splitWeakReasons(value: string | null | undefined): string[] {
  return normalizeWhitespace(value)
    .split(/\s*\|\s*|\s*;\s*|\s*,\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function isTruthyFlag(value: string | null | undefined): boolean {
  const normalized = normalizeWhitespace(value).toLowerCase()
  return normalized === 'true' || normalized === '1' || normalized === 'yes'
}

function createHeaderIndex(header: string[], requiredColumns: string[], filePath: string): Record<string, number> {
  const cleanedHeader = header.map((column, index) => {
    const cleaned = column.replace(/^\uFEFF/, '').trim()
    if (!cleaned) {
      throw new Error(`[promotion-candidates] empty header column at index ${index} in ${path.relative(ROOT, filePath)}`)
    }
    return cleaned
  })

  const index = Object.fromEntries(cleanedHeader.map((name, idx) => [name, idx]))
  const missing = requiredColumns.filter((column) => !(column in index))

  if (missing.length > 0) {
    throw new Error(
      `[promotion-candidates] ${path.relative(ROOT, filePath)} is missing required columns: ${missing.join(', ')}`,
    )
  }

  return index
}

function fileExists(filePath: string): Promise<boolean> {
  return fs.access(filePath).then(
    () => true,
    () => false,
  )
}

async function loadReviewRows(): Promise<ReviewRow[]> {
  const raw = await fs.readFile(REVIEW_CSV, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  const index = createHeaderIndex(header, REVIEW_REQUIRED_COLUMNS, REVIEW_CSV)

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

async function loadTitleRemediationMap(): Promise<Map<string, TitleRemediationRow>> {
  if (!(await fileExists(TITLE_REMEDIATION_CSV))) return new Map()

  const raw = await fs.readFile(TITLE_REMEDIATION_CSV, 'utf8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return new Map()

  const [header, ...dataRows] = rows
  const index = createHeaderIndex(header, TITLE_REMEDIATION_REQUIRED_COLUMNS, TITLE_REMEDIATION_CSV)
  const mapped = new Map<string, TitleRemediationRow>()

  for (const row of dataRows) {
    const sourcePath = row[index.source_path] ?? ''
    if (!sourcePath.trim()) continue

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

async function loadImportSummaryMap(): Promise<Map<string, ImportSummaryRecord>> {
  if (!(await fileExists(IMPORT_SUMMARY_JSON))) return new Map()

  const raw = await fs.readFile(IMPORT_SUMMARY_JSON, 'utf8')
  const parsed = JSON.parse(raw) as ImportSummary
  const mapped = new Map<string, ImportSummaryRecord>()

  for (const record of parsed.records ?? []) {
    if (!record?.sourcePath) continue
    mapped.set(record.sourcePath, record)
  }

  return mapped
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  const counts = {} as Record<T, number>
  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1
  }
  return counts
}

function buildContext(
  row: ReviewRow,
  remediationMap: Map<string, TitleRemediationRow>,
  importSummaryMap: Map<string, ImportSummaryRecord>,
): HeuristicContext {
  const remediation = remediationMap.get(row.source_path) ?? null
  const importRecord = importSummaryMap.get(row.source_path) ?? null
  const finalTitle = normalizeWhitespace(row.final_title)
  const proposedTitle = normalizeWhitespace(row.proposed_title)
  const importedTitle = normalizeWhitespace(importRecord?.title)
  const remediationTitle = normalizeWhitespace(remediation?.suggested_title)
  const remediationReviewFinalTitle = normalizeWhitespace(remediation?.review_final_title)
  const remediationConfirmed =
    Boolean(remediationTitle) &&
    (isTruthyFlag(remediation?.applied) ||
      normalizeComparableText(remediationReviewFinalTitle) === normalizeComparableText(remediationTitle) ||
      normalizeComparableText(row.final_title) === normalizeComparableText(remediationTitle) ||
      normalizeComparableText(importRecord?.title) === normalizeComparableText(remediationTitle))

  const currentTitle = finalTitle || importedTitle || proposedTitle || humanizeFilename(row.filename)
  const analysisTitle = remediationConfirmed && remediationTitle ? remediationTitle : currentTitle

  let analysisTitleSource: TitleSource = 'filename'
  if (remediationConfirmed && remediationTitle) analysisTitleSource = 'title_remediation'
  else if (finalTitle || proposedTitle) analysisTitleSource = currentTitle === importedTitle ? 'import_summary' : 'review_csv'
  else if (importedTitle) analysisTitleSource = 'import_summary'

  return {
    currentTitle,
    analysisTitle,
    analysisTitleSource,
    remediationTitle: remediationTitle || null,
    remediationConfirmed,
    remediation,
    importRecord,
    weakReasons: splitWeakReasons(remediation?.weak_reasons),
  }
}

function applyRules(searchText: string, rules: PatternRule[], target: TypedTarget, signals: Signal[]): void {
  for (const rule of rules) {
    if (rule.pattern.test(searchText)) {
      signals.push({
        target,
        points: rule.points,
        label: rule.label,
      })
    }
  }
}

function scoreFor(signals: Signal[], target: TypedTarget): number {
  return signals.filter((signal) => signal.target === target).reduce((total, signal) => total + signal.points, 0)
}

function uniqueSignalLabels(signals: Signal[], target: TypedTarget): string[] {
  const seen = new Set<string>()
  return signals
    .filter((signal) => signal.target === target)
    .sort((left, right) => right.points - left.points || left.label.localeCompare(right.label))
    .map((signal) => signal.label)
    .filter((label) => {
      if (seen.has(label)) return false
      seen.add(label)
      return true
    })
}

function buildReason(target: RecommendationTarget, targetSignals: string[], cautionFlags: string[]): string {
  if (target === 'Hold') {
    return 'Placeholder or artifact-style title with no strong typed-layer signal. Keep this row out of typed promotion until the title or metadata is remediated.'
  }

  if (target === 'Manual review') {
    return 'Signals are weak or mixed across SourceDoc, Report, and Thesis. Review manually before promoting into a typed layer.'
  }

  const signalText = targetSignals.slice(0, 3).join('; ')
  const cautionText = cautionFlags.length > 0 ? ` Caution: ${cautionFlags.slice(0, 2).join('; ')}.` : ''

  if (target === 'Thesis') {
    return `Explicit thesis signals lead this recommendation: ${signalText}.${cautionText}`
  }

  if (target === 'Report') {
    return `Report-oriented signals lead this recommendation: ${signalText}.${cautionText}`
  }

  return `Source-material signals lead this recommendation: ${signalText}.${cautionText}`
}

function recommendTarget(row: ReviewRow, context: HeuristicContext): Recommendation {
  const signals: Signal[] = []
  const cautionFlags: string[] = []
  const rawTitle = context.analysisTitle
  const searchText = toSearchableText(context.analysisTitle, context.currentTitle, row.filename, row.source_path)
  const titleForShapeChecks = rawTitle.toLowerCase()

  applyRules(searchText, THESIS_STRONG_RULES, 'Thesis', signals)
  if (scoreFor(signals, 'Thesis') === 0) {
    applyRules(searchText, THESIS_WEAK_RULES, 'Thesis', signals)
  }

  applyRules(searchText, REPORT_SERIES_RULES, 'Report', signals)
  applyRules(searchText, REPORT_OFFICIAL_RULES, 'Report', signals)
  applyRules(searchText, REPORT_GENERIC_RULES, 'Report', signals)
  applyRules(searchText, SOURCE_PUBLISHER_RULES, 'SourceDoc', signals)
  applyRules(searchText, SOURCE_GENERIC_RULES, 'SourceDoc', signals)
  applyRules(searchText, SOURCE_NEWSY_RULES, 'SourceDoc', signals)
  applyRules(searchText, JOURNAL_CITATION_RULES, 'SourceDoc', signals)

  const reportSeriesHit = REPORT_SERIES_RULES.some((rule) => rule.pattern.test(searchText))
  const officialReportHit = REPORT_OFFICIAL_RULES.some((rule) => rule.pattern.test(searchText))
  const strongThesisHit = THESIS_STRONG_RULES.some((rule) => rule.pattern.test(searchText))
  const webStyleTitle =
    (titleForShapeChecks.includes(' | ') || titleForShapeChecks.includes(' - ') || titleForShapeChecks.includes(' • ')) &&
    !reportSeriesHit &&
    !officialReportHit

  if (webStyleTitle) {
    signals.push({
      target: 'SourceDoc',
      points: 4,
      label: 'title is formatted like a web or page capture',
    })
  }

  if (/[?!…]/.test(context.analysisTitle)) {
    signals.push({
      target: 'SourceDoc',
      points: 3,
      label: 'title punctuation reads like article or web-copy language',
    })
  }

  const proposedDocType = normalizeWhitespace(row.proposed_doc_type).toLowerCase()
  if (proposedDocType === 'thesis') {
    signals.push({
      target: 'Thesis',
      points: 6,
      label: 'review metadata proposed doc_type=thesis',
    })
  } else if (proposedDocType === 'annual_report' || proposedDocType === 'policy_report') {
    signals.push({
      target: 'Report',
      points: 7,
      label: `review metadata proposed doc_type=${proposedDocType}`,
    })
  } else if (proposedDocType === 'report') {
    signals.push({
      target: 'Report',
      points: 2,
      label: 'review metadata proposed doc_type=report',
    })
  }

  const typedLayerCandidate = normalizeWhitespace(row.typed_layer_candidate).toLowerCase()
  if (typedLayerCandidate === 'report') {
    signals.push({
      target: 'Report',
      points: 4,
      label: 'review metadata typed_layer_candidate=report',
    })
  } else if (typedLayerCandidate === 'thesis-or-report') {
    signals.push({
      target: 'Thesis',
      points: 2,
      label: 'review metadata typed_layer_candidate=thesis-or-report',
    })
    signals.push({
      target: 'Report',
      points: 1,
      label: 'review metadata typed_layer_candidate=thesis-or-report',
    })
  } else if (typedLayerCandidate === 'report-or-source') {
    signals.push({
      target: 'Report',
      points: 1,
      label: 'review metadata typed_layer_candidate=report-or-source',
    })
    signals.push({
      target: 'SourceDoc',
      points: 1,
      label: 'review metadata typed_layer_candidate=report-or-source',
    })
  }

  if (row.source_top_folder === '06_Company_And_Annual_Reports') {
    signals.push({
      target: 'Report',
      points: 3,
      label: 'source folder is company-and-annual-reports',
    })
  } else if (row.source_top_folder === '07_Academic_Research_And_Theses') {
    signals.push({
      target: 'SourceDoc',
      points: 2,
      label: 'academic folder defaults to source material unless thesis/report is explicit',
    })
  }

  if (WORD_EXPORT_PATTERN.test(context.currentTitle)) {
    cautionFlags.push('current imported title still looks like a word-export artifact')
  }

  if (context.weakReasons.length > 0) {
    cautionFlags.push(`title-remediation weak-title flags: ${context.weakReasons.join(', ')}`)
  }

  if (context.remediationTitle && !context.remediationConfirmed) {
    cautionFlags.push('unapplied title-remediation suggestion exists but was not used for classification')
  }

  const scoreSourceDoc = scoreFor(signals, 'SourceDoc')
  const scoreReport = scoreFor(signals, 'Report')
  const scoreThesis = scoreFor(signals, 'Thesis')
  const targetSignals = {
    SourceDoc: uniqueSignalLabels(signals, 'SourceDoc'),
    Report: uniqueSignalLabels(signals, 'Report'),
    Thesis: uniqueSignalLabels(signals, 'Thesis'),
  }

  const placeholderTitle = PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(searchText))
  let target: RecommendationTarget
  let confidence: Confidence

  if (placeholderTitle && Math.max(scoreSourceDoc, scoreReport, scoreThesis) < 10) {
    target = 'Hold'
    confidence = 'low'
  } else if (scoreSourceDoc >= 10 && scoreReport <= 6 && scoreThesis < 10) {
    target = 'SourceDoc'
    confidence = scoreSourceDoc >= 14 ? 'high' : 'medium'
  } else if (
    typedLayerCandidate === 'report-or-source' &&
    scoreThesis >= 6 &&
    scoreThesis > scoreReport &&
    scoreThesis > scoreSourceDoc &&
    !reportSeriesHit &&
    !officialReportHit
  ) {
    target = 'Thesis'
    confidence = scoreThesis >= 10 || strongThesisHit ? 'medium' : 'low'
  } else if (scoreThesis >= 10 && scoreThesis >= scoreReport + 2 && scoreThesis >= scoreSourceDoc + 2) {
    target = 'Thesis'
    confidence = scoreThesis >= 14 ? 'high' : 'medium'
  } else if (scoreReport >= 10 && scoreReport >= scoreSourceDoc + 2 && scoreReport >= scoreThesis + 2) {
    target = 'Report'
    confidence = scoreReport >= 14 ? 'high' : 'medium'
  } else if (scoreSourceDoc >= 10 && scoreSourceDoc >= scoreReport + 2 && scoreSourceDoc >= scoreThesis + 2) {
    target = 'SourceDoc'
    confidence = scoreSourceDoc >= 14 ? 'high' : 'medium'
  } else if (proposedDocType === 'thesis' && scoreSourceDoc < 10 && scoreReport < 10) {
    target = 'Thesis'
    confidence = 'medium'
  } else if (row.source_top_folder === '07_Academic_Research_And_Theses' && scoreReport < 10 && scoreThesis < 10) {
    target = 'SourceDoc'
    confidence = placeholderTitle ? 'low' : 'medium'
  } else if (proposedDocType === 'annual_report' || proposedDocType === 'policy_report') {
    target = 'Report'
    confidence = 'medium'
  } else if (typedLayerCandidate === 'report' || row.source_top_folder === '06_Company_And_Annual_Reports') {
    target = 'Report'
    confidence = 'medium'
  } else if (typedLayerCandidate === 'report-or-source') {
    if (scoreThesis >= 6 && scoreThesis > scoreReport && scoreThesis > scoreSourceDoc) {
      target = 'Thesis'
      confidence = scoreThesis >= 10 || strongThesisHit ? 'medium' : 'low'
    } else if (scoreSourceDoc >= 5) {
      target = 'SourceDoc'
      confidence = 'medium'
    } else if (
      context.weakReasons.includes('artifact_label') ||
      context.weakReasons.includes('truncated_source_title') ||
      WORD_EXPORT_PATTERN.test(context.currentTitle)
    ) {
      target = 'Manual review'
      confidence = 'low'
    } else {
      target = 'Report'
      confidence = 'low'
    }
  } else if (typedLayerCandidate === 'thesis-or-report') {
    if (scoreThesis >= 6 && scoreReport < 10) {
      target = 'Thesis'
      confidence = 'medium'
    } else {
      target = 'Manual review'
      confidence = 'low'
    }
  } else {
    target = 'Manual review'
    confidence = 'low'
  }

  const primarySignals =
    target === 'SourceDoc' ? targetSignals.SourceDoc : target === 'Report' ? targetSignals.Report : target === 'Thesis' ? targetSignals.Thesis : []

  const reason = buildReason(target, primarySignals, cautionFlags)

  return {
    row,
    target,
    confidence,
    reason,
    primarySignals,
    cautionFlags,
    currentTitle: context.currentTitle,
    analysisTitle: context.analysisTitle,
    analysisTitleSource: context.analysisTitleSource,
    remediationSuggestedTitle: context.remediationTitle ?? '',
    scoreSourceDoc,
    scoreReport,
    scoreThesis,
  }
}

function toCsvRows(recommendations: Recommendation[]): string[][] {
  const header = [
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

  const rows = recommendations.map((recommendation) => [
    recommendation.row.source_path,
    recommendation.row.import_file_path,
    recommendation.row.source_top_folder,
    recommendation.row.filename,
    recommendation.currentTitle,
    recommendation.analysisTitle,
    recommendation.analysisTitleSource,
    recommendation.remediationSuggestedTitle,
    recommendation.row.proposed_doc_type,
    recommendation.row.typed_layer_candidate,
    recommendation.target,
    recommendation.confidence,
    recommendation.reason,
    recommendation.primarySignals.join(' | '),
    recommendation.cautionFlags.join(' | '),
    String(recommendation.scoreSourceDoc),
    String(recommendation.scoreReport),
    String(recommendation.scoreThesis),
    recommendation.row.review_status,
    recommendation.row.action,
    recommendation.row.notes,
  ])

  return [header, ...rows]
}

function buildMarkdown(
  generatedAt: string,
  importedRows: number,
  skippedRows: number,
  recommendations: Recommendation[],
): string {
  const countsByTarget = countBy(recommendations.map((recommendation) => recommendation.target))
  const countsByConfidence = countBy(recommendations.map((recommendation) => recommendation.confidence))
  const targets: RecommendationTarget[] = ['SourceDoc', 'Report', 'Thesis', 'Hold', 'Manual review']
  const confidences: Confidence[] = ['high', 'medium', 'low']
  const manualReviewRows = recommendations.filter((recommendation) => recommendation.target === 'Manual review')
  const holdRows = recommendations.filter((recommendation) => recommendation.target === 'Hold')

  const lines: string[] = []
  lines.push('# Promotion Candidates')
  lines.push('')
  lines.push(`Generated: ${generatedAt}`)
  lines.push('')
  lines.push(`- Batch: \`${BATCH_NAME}\``)
  lines.push(`- Review CSV input: \`${path.relative(ROOT, REVIEW_CSV)}\``)
  lines.push(`- Imported rows analyzed: ${importedRows}`)
  lines.push(`- Intake rows skipped because they remain on hold: ${skippedRows}`)
  lines.push(`- Output CSV: \`${path.relative(ROOT, OUTPUT_CSV)}\``)
  lines.push(`- Output JSON summary: \`${path.relative(ROOT, OUTPUT_JSON)}\``)
  lines.push('')
  lines.push('## Recommendation Counts')
  lines.push('')

  for (const target of targets) {
    lines.push(`- ${target}: ${countsByTarget[target] ?? 0}`)
  }

  lines.push('')
  lines.push('## Confidence Counts')
  lines.push('')

  for (const confidence of confidences) {
    lines.push(`- ${confidence}: ${countsByConfidence[confidence] ?? 0}`)
  }

  lines.push('')
  lines.push('## Counts By Target And Confidence')
  lines.push('')

  for (const target of targets) {
    const parts = confidences.map((confidence) => `${confidence} ${(recommendations.filter((row) => row.target === target && row.confidence === confidence).length)}`)
    lines.push(`- ${target}: ${parts.join(' / ')}`)
  }

  lines.push('')
  lines.push('## Heuristics Used')
  lines.push('')
  lines.push('- `Thesis`: explicit thesis, master, phd, dissertation, avhandling, bachelor thesis, or afgangsprojekt patterns; review metadata that already proposed `thesis` also counts as supporting evidence.')
  lines.push('- `Report`: annual/interim/year-end/impact/sustainability report patterns, official-report markers such as `SOU`, `NOU`, `Dokument 3`, and `tildelingsbrev`, plus report-oriented metadata like `annual_report`, `policy_report`, or `typed_layer_candidate=report`.')
  lines.push('- `SourceDoc`: webpage/article/factsheet/brochure/announcement/journal capture patterns, known publisher or domain markers, DOI or journal citation markers, and web-style title shapes such as `|` or homepage captures.')
  lines.push('- `Hold`: placeholder or artifact titles such as `untitled`, `cellar`, `doc N`, `proof`, or `.indd` when there is still no strong typed-layer signal.')
  lines.push('- `Manual review`: weak or mixed evidence where the script could not justify a conservative typed-layer recommendation.')
  lines.push('')
  lines.push('## Attention Queue')
  lines.push('')

  if (manualReviewRows.length === 0 && holdRows.length === 0) {
    lines.push('- None')
  } else {
    if (manualReviewRows.length > 0) {
      lines.push(`- Manual review (${manualReviewRows.length}):`)
      for (const recommendation of manualReviewRows.slice(0, 20)) {
        lines.push(`  ${recommendation.analysisTitle} -> ${recommendation.reason}`)
      }
    }
    if (holdRows.length > 0) {
      lines.push(`- Hold (${holdRows.length}):`)
      for (const recommendation of holdRows.slice(0, 20)) {
        lines.push(`  ${recommendation.analysisTitle} -> ${recommendation.reason}`)
      }
    }
  }

  return lines.join('\n') + '\n'
}

async function main(): Promise<void> {
  const [reviewRows, remediationMap, importSummaryMap] = await Promise.all([
    loadReviewRows(),
    loadTitleRemediationMap(),
    loadImportSummaryMap(),
  ])

  const importedRows = reviewRows.filter((row) => normalizeWhitespace(row.action).toLowerCase() === 'import')
  const skippedRows = reviewRows.filter((row) => normalizeWhitespace(row.action).toLowerCase() !== 'import')

  const recommendations = importedRows.map((row) => recommendTarget(row, buildContext(row, remediationMap, importSummaryMap)))
  const generatedAt = new Date().toISOString()

  const countsByTarget = countBy(recommendations.map((recommendation) => recommendation.target))
  const countsByConfidence = countBy(recommendations.map((recommendation) => recommendation.confidence))
  const countsByTargetAndConfidence = {
    SourceDoc: countBy(recommendations.filter((row) => row.target === 'SourceDoc').map((row) => row.confidence)),
    Report: countBy(recommendations.filter((row) => row.target === 'Report').map((row) => row.confidence)),
    Thesis: countBy(recommendations.filter((row) => row.target === 'Thesis').map((row) => row.confidence)),
    Hold: countBy(recommendations.filter((row) => row.target === 'Hold').map((row) => row.confidence)),
    'Manual review': countBy(recommendations.filter((row) => row.target === 'Manual review').map((row) => row.confidence)),
  }

  const summary = {
    generatedAt,
    batchName: BATCH_NAME,
    reviewCsv: path.relative(ROOT, REVIEW_CSV),
    titleRemediationCsv: (await fileExists(TITLE_REMEDIATION_CSV)) ? path.relative(ROOT, TITLE_REMEDIATION_CSV) : null,
    importSummaryJson: (await fileExists(IMPORT_SUMMARY_JSON)) ? path.relative(ROOT, IMPORT_SUMMARY_JSON) : null,
    importedRowsAnalyzed: importedRows.length,
    skippedRows: skippedRows.length,
    countsByTarget,
    countsByConfidence,
    countsByTargetAndConfidence,
    manualReviewRows: recommendations
      .filter((recommendation) => recommendation.target === 'Manual review')
      .map((recommendation) => ({
        sourcePath: recommendation.row.source_path,
        analysisTitle: recommendation.analysisTitle,
        reason: recommendation.reason,
      })),
    holdRows: recommendations
      .filter((recommendation) => recommendation.target === 'Hold')
      .map((recommendation) => ({
        sourcePath: recommendation.row.source_path,
        analysisTitle: recommendation.analysisTitle,
        reason: recommendation.reason,
      })),
    outputs: {
      csv: path.relative(ROOT, OUTPUT_CSV),
      markdown: path.relative(ROOT, OUTPUT_MD),
      json: path.relative(ROOT, OUTPUT_JSON),
    },
  }

  await fs.mkdir(INTAKE_DIR, { recursive: true })
  await fs.writeFile(OUTPUT_CSV, stringifyCsv(toCsvRows(recommendations)), 'utf8')
  await fs.writeFile(OUTPUT_MD, buildMarkdown(generatedAt, importedRows.length, skippedRows.length, recommendations), 'utf8')
  await fs.writeFile(OUTPUT_JSON, JSON.stringify(summary, null, 2) + '\n', 'utf8')

  console.log(`[promotion-candidates] analyzed imported rows: ${importedRows.length}`)
  console.log(`[promotion-candidates] skipped non-import rows: ${skippedRows.length}`)
  const targets: RecommendationTarget[] = ['SourceDoc', 'Report', 'Thesis', 'Hold', 'Manual review']
  for (const target of targets) {
    const targetCount = countsByTarget[target] ?? 0
    const breakdown = ['high', 'medium', 'low']
      .map((confidence) => `${confidence}:${countsByTargetAndConfidence[target][confidence as Confidence] ?? 0}`)
      .join(' ')
    console.log(`[promotion-candidates] ${target}: ${targetCount} (${breakdown})`)
  }
  console.log(`[promotion-candidates] wrote ${path.relative(ROOT, OUTPUT_CSV)}`)
  console.log(`[promotion-candidates] wrote ${path.relative(ROOT, OUTPUT_MD)}`)
  console.log(`[promotion-candidates] wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
}

main().catch((error) => {
  console.error('[promotion-candidates] failed')
  console.error(error)
  process.exitCode = 1
})
