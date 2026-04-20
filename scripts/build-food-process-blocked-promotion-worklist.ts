import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const DEFAULT_BATCH_NAME = 'food-research-process-2026-04-20'

const PREVIEW_FILES = [
  { target: 'SourceDoc', fileName: 'promotion-preview-sourcedoc.json' },
  { target: 'Report', fileName: 'promotion-preview-report.json' },
  { target: 'Thesis', fileName: 'promotion-preview-thesis.json' },
] as const

const PRIORITY_ORDER = { P1: 0, P2: 1, P3: 2 } as const
const TARGET_ORDER = { SourceDoc: 0, Report: 1, Thesis: 2 } as const
const REMEDIATION_TRACK_ORDER = {
  'unresolved-title-remediation': 0,
  'title-quality-only': 1,
  'report-country-only': 2,
  'report-country-plus-metadata': 3,
  'report-confidence-review': 4,
  'report-metadata-backfill': 5,
  'thesis-metadata-and-pipeline-gap': 6,
  'conflict-human-resolution': 7,
  'manual-follow-up': 8,
} as const

const CSV_HEADER = [
  'priority_bucket',
  'target',
  'status',
  'source_path',
  'import_file_path',
  'filename',
  'document_id',
  'current_title',
  'promoted_title',
  'confidence',
  'reason_codes',
  'reason_summary',
  'missing_metadata',
  'suggested_next_action',
  'remediation_track',
  'source_top_folder',
  'review_final_url',
  'review_notes',
  'title_remediation_status',
  'title_remediation_suggested_title',
  'title_remediation_confidence',
  'review_action',
  'existing_id',
  'current_target_links',
] as const

type TargetLabel = 'SourceDoc' | 'Report' | 'Thesis'
type DecisionStatus = 'would-create' | 'would-update' | 'created' | 'updated' | 'skip' | 'conflict'
type PriorityBucket = keyof typeof PRIORITY_ORDER
type RemediationTrack = keyof typeof REMEDIATION_TRACK_ORDER

type CliOptions = {
  batchName: string
}

type BatchPaths = {
  intakeDir: string
  reviewCsv: string
  titleRemediationCsv: string
  previewJsons: string[]
  outputCsv: string
  outputJson: string
  outputMd: string
}

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

type PreviewSummary = {
  batchName: string
  target: string
  targetLabel: TargetLabel
}

type PreviewDecision = {
  target: TargetLabel
  sourcePath: string
  importFilePath: string
  filename: string
  confidence: string
  documentId: string | null
  documentTitle: string
  promotedTitle: string
  typedId: string
  currentTargetLinks: string[]
  reviewAction: string
  titleRemediationStatus: string
  status: DecisionStatus
  operation: string
  existingId: string | null
  reasonCodes: string[]
  reasonSummary: string
  payloadPreview: Record<string, unknown> | null
}

type PreviewArtifact = {
  summary: PreviewSummary
  decisions: PreviewDecision[]
}

type WorklistRow = {
  priorityBucket: PriorityBucket
  remediationTrack: RemediationTrack
  suggestedNextAction: string
  target: TargetLabel
  status: DecisionStatus
  sourcePath: string
  importFilePath: string
  filename: string
  documentId: string
  currentTitle: string
  promotedTitle: string
  confidence: string
  reasonCodes: string[]
  reasonSummary: string
  missingMetadata: string[]
  sourceTopFolder: string
  reviewFinalUrl: string
  reviewNotes: string
  titleRemediationStatus: string
  titleRemediationSuggestedTitle: string
  titleRemediationConfidence: string
  reviewAction: string
  existingId: string
  currentTargetLinks: string[]
}

type SummaryJson = {
  generatedAt: string
  batchName: string
  totalBlocked: number
  totalsByPriorityBucket: Record<string, number>
  totalsByRemediationTrack: Record<string, number>
  totalsByTarget: Record<string, number>
  totalsByStatus: Record<string, number>
  totalsByReasonCode: Record<string, number>
  totalsByMissingMetadata: Record<string, number>
  highestPriorityRows: Array<{
    priorityBucket: string
    remediationTrack: string
    target: string
    sourcePath: string
    currentTitle: string
    suggestedNextAction: string
  }>
  outputs: {
    csv: string
    json: string
    md: string
  }
}

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

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  let batchName = DEFAULT_BATCH_NAME

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--batch' || arg === '-b') {
      const value = args[i + 1]
      if (!value) throw new Error('Missing value for --batch')
      batchName = value
      i++
      continue
    }

    if (arg.startsWith('--batch=')) {
      const value = arg.slice('--batch='.length).trim()
      if (!value) throw new Error('Missing value for --batch')
      batchName = value
    }
  }

  return { batchName }
}

function buildBatchPaths(batchName: string): BatchPaths {
  const intakeDir = path.join(ROOT, `research/intake/${batchName}`)
  return {
    intakeDir,
    reviewCsv: path.join(intakeDir, 'review.csv'),
    titleRemediationCsv: path.join(intakeDir, 'title-remediation.csv'),
    previewJsons: PREVIEW_FILES.map(({ fileName }) => path.join(intakeDir, fileName)),
    outputCsv: path.join(intakeDir, 'blocked-promotion-worklist.csv'),
    outputJson: path.join(intakeDir, 'blocked-promotion-worklist-summary.json'),
    outputMd: path.join(intakeDir, 'BLOCKED-PROMOTION-WORKLIST.md'),
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

function csvRowsToObjects<T extends Record<string, string>>(
  rows: string[][],
  requiredColumns: string[],
  filePath: string,
): T[] {
  if (rows.length === 0) throw new Error(`${path.basename(filePath)} is empty.`)

  const [header, ...dataRows] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  for (const column of requiredColumns) {
    if (!(column in index)) {
      throw new Error(`${path.basename(filePath)} is missing the ${column} column.`)
    }
  }

  return dataRows.map((row) => {
    const record: Record<string, string> = {}
    for (const key of header) record[key] = row[index[key]] ?? ''
    return record as T
  })
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

async function readCsvObjects<T extends Record<string, string>>(
  filePath: string,
  requiredColumns: string[],
): Promise<T[]> {
  const raw = await fs.readFile(filePath, 'utf8')
  return csvRowsToObjects<T>(parseCsv(raw), requiredColumns, filePath)
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

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function normalizePathKey(value: string | null | undefined): string {
  return normalizeKey((value ?? '').normalize('NFC'))
}

function compactText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function chooseFirstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const text = compactText(value)
    if (text) return text
  }
  return ''
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  const seen = new Set<string>()
  const output: string[] = []

  for (const value of values) {
    const text = compactText(value)
    if (!text) continue
    const key = normalizeKey(text)
    if (seen.has(key)) continue
    seen.add(key)
    output.push(text)
  }

  return output
}

function increment(map: Record<string, number>, key: string, amount = 1): void {
  map[key] = (map[key] ?? 0) + amount
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function markdownInline(value: string | null | undefined): string {
  const text = compactText(value)
  return text ? text.replace(/\|/g, '\\|') : '-'
}

function extractSourceTopFolder(sourcePath: string): string {
  const segments = sourcePath.split('/').filter(Boolean)
  return segments.length >= 2 ? segments[1] : ''
}

function isMissingValue(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return compactText(value) === ''
  if (typeof value === 'number') return value <= 0
  if (Array.isArray(value)) return value.length === 0
  return false
}

function getPayloadField(payload: Record<string, unknown> | null, key: string): unknown {
  if (!payload) return undefined
  return payload[key]
}

function addMissingMetadata(
  missing: Set<string>,
  payload: Record<string, unknown> | null,
  key: string,
  label: string,
): void {
  if (!payload || isMissingValue(getPayloadField(payload, key))) {
    missing.add(label)
  }
}

function extractMissingMetadata(decision: PreviewDecision): string[] {
  const missing = new Set<string>()

  for (const code of decision.reasonCodes ?? []) {
    if (code.includes('linked-elsewhere')) {
      missing.add('human conflict resolution')
      continue
    }

    if (code === 'unresolved-title-remediation') {
      missing.add('title quality')
      continue
    }

    const separatorIndex = code.indexOf(':')
    if (separatorIndex < 0) {
      if (code.includes('linked-elsewhere')) missing.add('human conflict resolution')
      continue
    }

    const rawTokens = code
      .slice(separatorIndex + 1)
      .split('+')
      .map((item) => compactText(item))
      .filter(Boolean)

    for (const token of rawTokens) {
      if (token === 'title-quality') {
        missing.add('title quality')
        continue
      }

      if (token === 'confidence-below-medium') {
        missing.add('confidence uplift')
        continue
      }

      if (token === 'country') {
        addMissingMetadata(missing, decision.payloadPreview, 'country', 'country')
        continue
      }

      if (token === 'year') {
        addMissingMetadata(missing, decision.payloadPreview, 'year', 'year')
        continue
      }

      if (token === 'year-or-sourceUrl') {
        const payload = decision.payloadPreview
        const yearMissing = !payload || isMissingValue(getPayloadField(payload, 'year'))
        const sourceUrlMissing =
          !payload || (isMissingValue(getPayloadField(payload, 'sourceUrl')) && isMissingValue(getPayloadField(payload, 'url')))

        if (yearMissing) missing.add('year')
        if (sourceUrlMissing) missing.add('sourceUrl')
        if (!yearMissing && !sourceUrlMissing) missing.add('year/sourceUrl verification')
        continue
      }

      if (token === 'sourceUrl' || token === 'url') {
        const payload = decision.payloadPreview
        const sourceUrlMissing =
          !payload || (isMissingValue(getPayloadField(payload, 'sourceUrl')) && isMissingValue(getPayloadField(payload, 'url')))
        if (sourceUrlMissing) missing.add('sourceUrl')
        continue
      }

      if (token === 'authors') {
        addMissingMetadata(missing, decision.payloadPreview, 'authors', 'authors')
        continue
      }

      if (token === 'author') {
        addMissingMetadata(missing, decision.payloadPreview, 'author', 'authors')
        continue
      }

      if (token === 'institution') {
        addMissingMetadata(missing, decision.payloadPreview, 'institution', 'institution')
        continue
      }

      if (token === 'synthesis') {
        addMissingMetadata(missing, decision.payloadPreview, 'synthesis', 'synthesis')
        continue
      }

      missing.add(token.replace(/-/g, ' '))
    }
  }

  const ordered = ['country', 'year', 'sourceUrl', 'title quality', 'confidence uplift', 'authors', 'institution', 'synthesis', 'human conflict resolution']
  return [...missing].sort((left, right) => {
    const leftIndex = ordered.indexOf(left)
    const rightIndex = ordered.indexOf(right)
    const normalizedLeft = leftIndex === -1 ? ordered.length : leftIndex
    const normalizedRight = rightIndex === -1 ? ordered.length : rightIndex
    if (normalizedLeft !== normalizedRight) return normalizedLeft - normalizedRight
    return left.localeCompare(right)
  })
}

function deriveRemediationTrack(decision: PreviewDecision, missingMetadata: string[]): RemediationTrack {
  if (decision.status === 'conflict') return 'conflict-human-resolution'
  if (decision.reasonCodes.includes('unresolved-title-remediation')) return 'unresolved-title-remediation'
  if (missingMetadata.length === 1 && missingMetadata[0] === 'title quality') return 'title-quality-only'

  if (decision.target === 'Report') {
    const hasCountry = missingMetadata.includes('country')
    const hasConfidence = missingMetadata.includes('confidence uplift')
    const hasSourceResearch = missingMetadata.includes('year') || missingMetadata.includes('sourceUrl')

    if (hasCountry && !hasConfidence && !hasSourceResearch) return 'report-country-only'
    if (hasCountry) return 'report-country-plus-metadata'
    if (hasConfidence && !hasSourceResearch) return 'report-confidence-review'
    return 'report-metadata-backfill'
  }

  if (decision.target === 'Thesis') return 'thesis-metadata-and-pipeline-gap'
  return 'manual-follow-up'
}

function derivePriorityBucket(decision: PreviewDecision, remediationTrack: RemediationTrack): PriorityBucket {
  if (remediationTrack === 'unresolved-title-remediation' || remediationTrack === 'title-quality-only') return 'P1'

  if (remediationTrack === 'report-country-only') {
    return normalizeKey(decision.confidence) === 'high' ? 'P1' : 'P2'
  }

  if (remediationTrack === 'report-country-plus-metadata' || remediationTrack === 'report-metadata-backfill') return 'P2'
  return 'P3'
}

function deriveSuggestedNextAction(
  row: {
    remediationTrack: RemediationTrack
    titleRemediationSuggestedTitle: string
    missingMetadata: string[]
    existingId: string
  },
): string {
  if (row.remediationTrack === 'unresolved-title-remediation') {
    if (row.titleRemediationSuggestedTitle) {
      return `Use title-remediation.csv as guidance only: copy "${row.titleRemediationSuggestedTitle}" into review.csv final_title, sync Document.title to the same value, rerun the title-remediation audit, then rerun the promotion preview.`
    }
    return 'Inspect the first page, set a clean final title in review.csv, sync Document.title to the same value, rerun the title-remediation audit, then rerun the promotion preview.'
  }

  if (row.remediationTrack === 'title-quality-only') {
    if (row.titleRemediationSuggestedTitle) {
      return `Use the suggested title "${row.titleRemediationSuggestedTitle}", confirm it in review.csv, then rerun the SourceDoc preview.`
    }
    return 'Repair the title from the first-page heading or a reliable filename-derived title, then rerun the SourceDoc preview.'
  }

  if (row.remediationTrack === 'report-country-only') {
    return 'Set final_country in review.csv from the issuer, jurisdiction, or publication context, then rerun the Report preview.'
  }

  if (row.remediationTrack === 'report-country-plus-metadata') {
    return 'Backfill final_country plus any missing year/sourceUrl fields in review.csv, and confirm the report classification before rerunning the Report preview.'
  }

  if (row.remediationTrack === 'report-confidence-review') {
    return 'Confirm the row should stay a Report, then strengthen the review metadata signals or reclassify it before rerunning the Report preview.'
  }

  if (row.remediationTrack === 'report-metadata-backfill') {
    return 'Backfill the missing year/sourceUrl fields and confirm report classification if confidence is too low, then rerun the Report preview.'
  }

  if (row.remediationTrack === 'thesis-metadata-and-pipeline-gap') {
    return 'Research authors, institution, year, canonical URL, and a short synthesis, then extend the thesis promotion mapper so it reads those fields before rerunning the Thesis preview.'
  }

  if (row.remediationTrack === 'conflict-human-resolution') {
    return `Compare this document against existing typed record ${row.existingId || '(unknown)'}, then decide whether to relink, merge, or drop the new promotion.`
  }

  return `Review and backfill the missing metadata: ${row.missingMetadata.join(', ') || 'manual follow-up required'}.`
}

function compareWorklistRows(left: WorklistRow, right: WorklistRow): number {
  const priorityDelta = PRIORITY_ORDER[left.priorityBucket] - PRIORITY_ORDER[right.priorityBucket]
  if (priorityDelta !== 0) return priorityDelta

  const leftTrack = REMEDIATION_TRACK_ORDER[left.remediationTrack] ?? Number.MAX_SAFE_INTEGER
  const rightTrack = REMEDIATION_TRACK_ORDER[right.remediationTrack] ?? Number.MAX_SAFE_INTEGER
  if (leftTrack !== rightTrack) return leftTrack - rightTrack

  const targetDelta = (TARGET_ORDER[left.target] ?? Number.MAX_SAFE_INTEGER) - (TARGET_ORDER[right.target] ?? Number.MAX_SAFE_INTEGER)
  if (targetDelta !== 0) return targetDelta

  return left.sourcePath.localeCompare(right.sourcePath)
}

function formatCounts(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([key, value]) => `- ${key}: ${formatNumber(value)}`)
}

function buildMarkdownReport(batchName: string, rows: WorklistRow[], summary: SummaryJson): string {
  const topPriorityRows = rows.filter((row) => row.priorityBucket === 'P1').slice(0, 12)
  const reportLines = [
    '# Blocked Promotion Worklist',
    '',
    `Batch: \`${batchName}\``,
    '',
    `Total blocked rows: ${formatNumber(summary.totalBlocked)}`,
    '',
    '## Topline counts',
    '',
    '### By priority bucket',
    ...formatCounts(summary.totalsByPriorityBucket),
    '',
    '### By remediation track',
    ...formatCounts(summary.totalsByRemediationTrack),
    '',
    '### By target',
    ...formatCounts(summary.totalsByTarget),
    '',
    '## Prioritized action groups',
    '',
    '- P1 title fixes: use title-remediation.csv as guidance, copy the chosen title into review.csv final_title, sync Document.title, then rerun the title-remediation audit and preview.',
    '- P1/P2 report country backfill: fill final_country for report rows that otherwise look ready.',
    '- P2 report metadata backfill: add year and/or sourceUrl and confirm borderline report classifications.',
    '- P3 thesis pipeline gap: these rows need manual metadata research plus an upstream mapper update before they can promote cleanly.',
    '- P3 conflicts: compare against the existing typed record and decide whether to relink or merge.',
    '',
    '## Highest-priority rows',
    '',
    '| Priority | Target | Source path | Current title | Next action |',
    '| --- | --- | --- | --- | --- |',
    ...topPriorityRows.map(
      (row) =>
        `| ${row.priorityBucket} | ${row.target} | ${markdownInline(row.sourcePath)} | ${markdownInline(row.currentTitle)} | ${markdownInline(row.suggestedNextAction)} |`,
    ),
    '',
  ]

  return reportLines.join('\n')
}

async function main(): Promise<void> {
  const { batchName } = parseArgs()
  const paths = buildBatchPaths(batchName)

  const [reviewRows, titleRemediationRows, ...previewArtifacts] = await Promise.all([
    readCsvObjects<ReviewRow>(paths.reviewCsv, REVIEW_REQUIRED_COLUMNS),
    readCsvObjects<TitleRemediationRow>(paths.titleRemediationCsv, TITLE_REMEDIATION_REQUIRED_COLUMNS),
    ...paths.previewJsons.map((filePath) => readJson<PreviewArtifact>(filePath)),
  ])

  const reviewBySourcePath = new Map<string, ReviewRow>()
  const reviewByImportFilePath = new Map<string, ReviewRow>()
  for (const row of reviewRows) {
    reviewBySourcePath.set(normalizePathKey(row.source_path), row)
    reviewByImportFilePath.set(normalizePathKey(row.import_file_path), row)
  }

  const titleRemediationBySourcePath = new Map<string, TitleRemediationRow>()
  const titleRemediationByImportFilePath = new Map<string, TitleRemediationRow>()
  const titleRemediationByDocumentId = new Map<string, TitleRemediationRow>()
  for (const row of titleRemediationRows) {
    titleRemediationBySourcePath.set(normalizePathKey(row.source_path), row)
    titleRemediationByImportFilePath.set(normalizePathKey(row.file_path), row)
    titleRemediationByDocumentId.set(normalizeKey(row.document_id), row)
  }

  const worklistRows: WorklistRow[] = []

  for (const artifact of previewArtifacts) {
    for (const decision of artifact.decisions) {
      if (decision.status !== 'skip' && decision.status !== 'conflict') continue
      if ((decision.reasonCodes ?? []).includes('review-action-not-import')) continue

      const reviewRow =
        reviewBySourcePath.get(normalizePathKey(decision.sourcePath)) ??
        reviewByImportFilePath.get(normalizePathKey(decision.importFilePath)) ??
        null

      const titleRemediationRow =
        titleRemediationBySourcePath.get(normalizePathKey(decision.sourcePath)) ??
        titleRemediationByImportFilePath.get(normalizePathKey(decision.importFilePath)) ??
        titleRemediationByDocumentId.get(normalizeKey(decision.documentId)) ??
        null

      const currentTitle = chooseFirstNonEmpty(
        decision.documentTitle,
        titleRemediationRow?.current_title,
        reviewRow?.final_title,
        reviewRow?.proposed_title,
        decision.filename,
      )

      const missingMetadata = extractMissingMetadata(decision)
      const remediationTrack = deriveRemediationTrack(decision, missingMetadata)
      const priorityBucket = derivePriorityBucket(decision, remediationTrack)
      const titleRemediationSuggestedTitle = compactText(titleRemediationRow?.suggested_title)
      const promotedTitle = chooseFirstNonEmpty(
        reviewRow?.final_title,
        titleRemediationRow?.review_final_title,
        titleRemediationSuggestedTitle,
        decision.promotedTitle,
        currentTitle,
      )
      const reviewNotes = uniqueStrings([reviewRow?.notes, titleRemediationRow?.reason, titleRemediationRow?.notes]).join(' | ')

      worklistRows.push({
        priorityBucket,
        remediationTrack,
        suggestedNextAction: deriveSuggestedNextAction({
          remediationTrack,
          titleRemediationSuggestedTitle,
          missingMetadata,
          existingId: compactText(decision.existingId),
        }),
        target: decision.target,
        status: decision.status,
        sourcePath: decision.sourcePath,
        importFilePath: decision.importFilePath,
        filename: decision.filename,
        documentId: compactText(decision.documentId),
        currentTitle,
        promotedTitle,
        confidence: compactText(decision.confidence),
        reasonCodes: decision.reasonCodes ?? [],
        reasonSummary: compactText(decision.reasonSummary),
        missingMetadata,
        sourceTopFolder: chooseFirstNonEmpty(reviewRow?.source_top_folder, extractSourceTopFolder(decision.sourcePath)),
        reviewFinalUrl: compactText(reviewRow?.final_url),
        reviewNotes,
        titleRemediationStatus: chooseFirstNonEmpty(decision.titleRemediationStatus, titleRemediationRow?.review_status, 'clear'),
        titleRemediationSuggestedTitle,
        titleRemediationConfidence: compactText(titleRemediationRow?.confidence),
        reviewAction: chooseFirstNonEmpty(decision.reviewAction, reviewRow?.action),
        existingId: compactText(decision.existingId),
        currentTargetLinks: (decision.currentTargetLinks ?? []).map((item) => compactText(item)).filter(Boolean),
      })
    }
  }

  worklistRows.sort(compareWorklistRows)

  const totalsByPriorityBucket: Record<string, number> = {}
  const totalsByRemediationTrack: Record<string, number> = {}
  const totalsByTarget: Record<string, number> = {}
  const totalsByStatus: Record<string, number> = {}
  const totalsByReasonCode: Record<string, number> = {}
  const totalsByMissingMetadata: Record<string, number> = {}

  for (const row of worklistRows) {
    increment(totalsByPriorityBucket, row.priorityBucket)
    increment(totalsByRemediationTrack, row.remediationTrack)
    increment(totalsByTarget, row.target)
    increment(totalsByStatus, row.status)

    for (const reasonCode of row.reasonCodes) increment(totalsByReasonCode, reasonCode)
    for (const missing of row.missingMetadata) increment(totalsByMissingMetadata, missing)
  }

  const summary: SummaryJson = {
    generatedAt: new Date().toISOString(),
    batchName,
    totalBlocked: worklistRows.length,
    totalsByPriorityBucket,
    totalsByRemediationTrack,
    totalsByTarget,
    totalsByStatus,
    totalsByReasonCode,
    totalsByMissingMetadata,
    highestPriorityRows: worklistRows.slice(0, 15).map((row) => ({
      priorityBucket: row.priorityBucket,
      remediationTrack: row.remediationTrack,
      target: row.target,
      sourcePath: row.sourcePath,
      currentTitle: row.currentTitle,
      suggestedNextAction: row.suggestedNextAction,
    })),
    outputs: {
      csv: path.relative(ROOT, paths.outputCsv),
      json: path.relative(ROOT, paths.outputJson),
      md: path.relative(ROOT, paths.outputMd),
    },
  }

  const csvRows: string[][] = [
    [...CSV_HEADER],
    ...worklistRows.map((row) => [
      row.priorityBucket,
      row.target,
      row.status,
      row.sourcePath,
      row.importFilePath,
      row.filename,
      row.documentId,
      row.currentTitle,
      row.promotedTitle,
      row.confidence,
      row.reasonCodes.join('; '),
      row.reasonSummary,
      row.missingMetadata.join('; '),
      row.suggestedNextAction,
      row.remediationTrack,
      row.sourceTopFolder,
      row.reviewFinalUrl,
      row.reviewNotes,
      row.titleRemediationStatus,
      row.titleRemediationSuggestedTitle,
      row.titleRemediationConfidence,
      row.reviewAction,
      row.existingId,
      row.currentTargetLinks.join('; '),
    ]),
  ]

  const markdown = buildMarkdownReport(batchName, worklistRows, summary)

  await Promise.all([
    writeFileAtomically(paths.outputCsv, stringifyCsv(csvRows)),
    writeFileAtomically(paths.outputJson, JSON.stringify(summary, null, 2) + '\n'),
    writeFileAtomically(paths.outputMd, markdown),
  ])

  console.log(
    `Built blocked promotion worklist for ${batchName}: ${worklistRows.length} blocked rows -> ${path.relative(ROOT, paths.outputCsv)}`,
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
