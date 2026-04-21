import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const DEFAULT_BATCH_NAME = 'food-research-process-2026-04-20'
const KNOWN_REVIEW_ACTIONS = new Set(['import', 'hold'])

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

type ManifestSummary = {
  generatedAt: string
  sourceDir: string
  reviewCsv: string
  totalReviewRows: number
  exactDuplicateCount: number
  countsByFolder: Record<string, number>
  countsByAction: Record<string, number>
  countsByExt: Record<string, number>
  exactDuplicates: string[]
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

type TitleRemediationSummary = {
  generatedAt: string
  batchName: string
  applyMode: boolean
  weakTitleCount: number
  autoApplyCount: number
  dbChangedCount: number
  reviewCsvChangedCount: number
  appliedCount: number
  weakCounts: Record<string, number>
  suggestionCounts: Record<string, number>
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
  countsByConfidence: Record<string, number>
  countsByTargetAndConfidence: Record<string, Record<string, number>>
  manualReviewRows: Array<{ sourcePath: string; analysisTitle: string; reason: string }>
  holdRows: Array<{ sourcePath: string; analysisTitle: string; reason: string }>
  outputs: Record<string, string>
}

type AttentionRow = {
  sourcePath: string
  sourceTopFolder: string
  filename: string
  categories: string[]
  reviewAction: string | null
  titleRemediationConfidence: string | null
  titleRemediationSuggestedTitle: string | null
  promotionTarget: string | null
  promotionConfidence: string | null
  currentTitle: string | null
  reason: string | null
  notes: string | null
}

type CliOptions = {
  batchName: string
}

type BatchPaths = {
  intakeDir: string
  manifestJson: string
  reviewCsv: string
  importSummaryJson: string
  titleRemediationCsv: string
  titleRemediationJson: string
  promotionCandidatesCsv: string
  promotionCandidatesJson: string
  outputMd: string
  outputJson: string
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

function csvRowsToObjects<T extends Record<string, string>>(rows: string[][]): T[] {
  if (rows.length === 0) return []
  const [header, ...dataRows] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name, idx]))

  return dataRows.map((row) => {
    const record: Record<string, string> = {}
    for (const key of header) {
      record[key] = row[index[key]] ?? ''
    }
    return record as T
  })
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2)
  let batchName = DEFAULT_BATCH_NAME

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--batch' || arg === '-b') {
      const next = args[i + 1]
      if (!next) throw new Error('Missing value for --batch')
      batchName = next
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
    manifestJson: path.join(intakeDir, 'manifest.json'),
    reviewCsv: path.join(intakeDir, 'review.csv'),
    importSummaryJson: path.join(intakeDir, 'import-summary.json'),
    titleRemediationCsv: path.join(intakeDir, 'title-remediation.csv'),
    titleRemediationJson: path.join(intakeDir, 'title-remediation-summary.json'),
    promotionCandidatesCsv: path.join(intakeDir, 'promotion-candidates.csv'),
    promotionCandidatesJson: path.join(intakeDir, 'promotion-candidates-summary.json'),
    outputMd: path.join(intakeDir, 'CONTROL-REPORT.md'),
    outputJson: path.join(intakeDir, 'control-report-summary.json'),
  }
}

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

async function readCsvObjects<T extends Record<string, string>>(filePath: string): Promise<T[]> {
  const raw = await fs.readFile(filePath, 'utf8')
  return csvRowsToObjects<T>(parseCsv(raw))
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase()
}

function toBool(value: string | null | undefined): boolean {
  const normalized = normalizeKey(value)
  return normalized === 'true' || normalized === 'yes' || normalized === '1'
}

function increment(map: Record<string, number>, key: string, amount = 1): void {
  map[key] = (map[key] ?? 0) + amount
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

function compactText(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function markdownInline(value: string | null | undefined): string {
  const text = compactText(value)
  if (!text) return '—'
  return text.replace(/\|/g, '\\|')
}

function sortBySourcePath<T extends { source_path?: string; sourcePath?: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => {
    const left = a.source_path ?? a.sourcePath ?? ''
    const right = b.source_path ?? b.sourcePath ?? ''
    return left.localeCompare(right)
  })
}

function splitWeakReasons(value: string): string[] {
  return value
    .split(';')
    .map((item) => compactText(item))
    .filter(Boolean)
}

function countsToBullets(counts: Record<string, number>): string[] {
  return Object.entries(counts)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => `- ${key}: ${formatNumber(value)}`)
}

function titleQueueSummary(rows: TitleRemediationRow[]): {
  unresolvedCount: number
  manualOnlyCount: number
  suggestedCount: number
  byConfidence: Record<string, number>
  bySuggestionSource: Record<string, number>
  byWeakReason: Record<string, number>
} {
  const byConfidence: Record<string, number> = {}
  const bySuggestionSource: Record<string, number> = {}
  const byWeakReason: Record<string, number> = {}

  let manualOnlyCount = 0
  let suggestedCount = 0

  for (const row of rows) {
    increment(byConfidence, compactText(row.confidence) || 'unknown')
    increment(bySuggestionSource, compactText(row.suggestion_source) || 'unknown')

    if (compactText(row.suggested_title)) {
      suggestedCount += 1
    } else {
      manualOnlyCount += 1
    }

    for (const weakReason of splitWeakReasons(row.weak_reasons)) {
      increment(byWeakReason, weakReason)
    }
  }

  return {
    unresolvedCount: rows.length,
    manualOnlyCount,
    suggestedCount,
    byConfidence,
    bySuggestionSource,
    byWeakReason,
  }
}

function buildAttentionRows(
  reviewHoldRows: ReviewRow[],
  reviewUnknownActionRows: ReviewRow[],
  unresolvedTitleRows: TitleRemediationRow[],
  promotionAttentionRows: PromotionCandidateRow[],
): AttentionRow[] {
  const bySourcePath = new Map<string, AttentionRow>()

  const ensureRow = (sourcePath: string, sourceTopFolder: string, filename: string): AttentionRow => {
    const existing = bySourcePath.get(sourcePath)
    if (existing) return existing

    const created: AttentionRow = {
      sourcePath,
      sourceTopFolder,
      filename,
      categories: [],
      reviewAction: null,
      titleRemediationConfidence: null,
      titleRemediationSuggestedTitle: null,
      promotionTarget: null,
      promotionConfidence: null,
      currentTitle: null,
      reason: null,
      notes: null,
    }

    bySourcePath.set(sourcePath, created)
    return created
  }

  for (const row of reviewHoldRows) {
    const entry = ensureRow(row.source_path, row.source_top_folder, row.filename)
    entry.categories.push('Review hold')
    entry.reviewAction = compactText(row.action) || 'hold'
    entry.currentTitle = compactText(row.final_title || row.proposed_title || row.filename)
    entry.notes = compactText(row.notes) || null
    if (!entry.reason) {
      entry.reason = 'Still marked hold in review.csv.'
    }
  }

  for (const row of reviewUnknownActionRows) {
    const entry = ensureRow(row.source_path, row.source_top_folder, row.filename)
    entry.categories.push('Review action unclassified')
    entry.reviewAction = compactText(row.action) || '(blank)'
    entry.currentTitle = compactText(row.final_title || row.proposed_title || row.filename)
    entry.notes = compactText(row.notes) || null
    entry.reason = `review.csv contains an unclassified action value: ${entry.reviewAction}.`
  }

  for (const row of unresolvedTitleRows) {
    const entry = ensureRow(
      row.source_path,
      extractTopFolder(row.source_path),
      path.basename(row.source_path),
    )
    entry.categories.push('Title review queue')
    entry.titleRemediationConfidence = compactText(row.confidence) || null
    entry.titleRemediationSuggestedTitle = compactText(row.suggested_title) || null
    entry.currentTitle = compactText(row.current_title) || entry.currentTitle
    entry.reason = compactText(row.reason) || entry.reason
    entry.notes = compactText(row.notes) || entry.notes
  }

  for (const row of promotionAttentionRows) {
    const target = compactText(row.recommended_target) || 'Manual attention'
    const entry = ensureRow(row.source_path, row.source_top_folder, row.filename)
    entry.categories.push(`Promotion ${target}`)
    entry.promotionTarget = target
    entry.promotionConfidence = compactText(row.confidence) || null
    entry.currentTitle = compactText(row.analysis_title || row.current_title) || entry.currentTitle
    entry.reason = compactText(row.reason) || entry.reason
    entry.notes = compactText(row.notes) || entry.notes
  }

  return [...bySourcePath.values()].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath))
}

function extractTopFolder(sourcePath: string): string {
  const segments = sourcePath.split('/').filter(Boolean)
  return segments.length >= 2 ? segments[1] : ''
}

function rowsByTarget(rows: PromotionCandidateRow[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const row of rows) increment(counts, compactText(row.recommended_target) || 'unknown')
  return counts
}

function rowsByTargetAndConfidence(rows: PromotionCandidateRow[]): Record<string, Record<string, number>> {
  const counts: Record<string, Record<string, number>> = {}
  for (const row of rows) {
    const target = compactText(row.recommended_target) || 'unknown'
    const confidence = compactText(row.confidence) || 'unknown'
    counts[target] ??= {}
    increment(counts[target], confidence)
  }
  return counts
}

function summarizeReviewActions(reviewRows: ReviewRow[]): {
  allCounts: Record<string, number>
  knownCounts: Record<string, number>
  unknownCounts: Record<string, number>
  unknownRows: ReviewRow[]
} {
  const allCounts: Record<string, number> = {}
  const knownCounts: Record<string, number> = {}
  const unknownCounts: Record<string, number> = {}
  const unknownRows: ReviewRow[] = []

  for (const row of reviewRows) {
    const actionKey = normalizeKey(row.action) || '(blank)'
    increment(allCounts, actionKey)

    if (KNOWN_REVIEW_ACTIONS.has(actionKey)) {
      increment(knownCounts, actionKey)
      continue
    }

    increment(unknownCounts, actionKey)
    unknownRows.push(row)
  }

  return { allCounts, knownCounts, unknownCounts, unknownRows }
}

function validateArtifactBatchConsistency(
  batchName: string,
  paths: BatchPaths,
  manifest: ManifestSummary,
  importSummary: ImportSummary,
  titleRemediationSummary: TitleRemediationSummary,
  promotionSummary: PromotionCandidatesSummary,
): { checks: string[] } {
  const checks: string[] = []
  const errors: string[] = []
  const expectedReviewCsv = path.relative(ROOT, paths.reviewCsv)
  const expectedImportSummaryJson = path.relative(ROOT, paths.importSummaryJson)
  const expectedTitleRemediationCsv = path.relative(ROOT, paths.titleRemediationCsv)

  const addPathCheck = (label: string, actual: string, expected: string) => {
    if (actual !== expected) {
      errors.push(`${label} mismatch: expected "${expected}", got "${actual}"`)
      return
    }
    checks.push(`${label}: ok`)
  }

  addPathCheck('manifest.reviewCsv', manifest.reviewCsv, expectedReviewCsv)
  addPathCheck('importSummary.reviewCsv', importSummary.reviewCsv, expectedReviewCsv)
  addPathCheck('promotionSummary.reviewCsv', promotionSummary.reviewCsv, expectedReviewCsv)
  addPathCheck(
    'promotionSummary.titleRemediationCsv',
    promotionSummary.titleRemediationCsv,
    expectedTitleRemediationCsv,
  )
  addPathCheck(
    'promotionSummary.importSummaryJson',
    promotionSummary.importSummaryJson,
    expectedImportSummaryJson,
  )

  if (titleRemediationSummary.batchName !== batchName) {
    errors.push(
      `titleRemediationSummary.batchName mismatch: expected "${batchName}", got "${titleRemediationSummary.batchName}"`,
    )
  } else {
    checks.push('titleRemediationSummary.batchName: ok')
  }

  if (promotionSummary.batchName !== batchName) {
    errors.push(`promotionSummary.batchName mismatch: expected "${batchName}", got "${promotionSummary.batchName}"`)
  } else {
    checks.push('promotionSummary.batchName: ok')
  }

  if (errors.length > 0) {
    throw new Error(`Batch consistency check failed for "${batchName}":\n- ${errors.join('\n- ')}`)
  }

  return { checks }
}

function renderQueueSection(
  title: string,
  rows: string[],
  emptyText: string,
): string {
  if (rows.length === 0) {
    return `## ${title}\n\n- ${emptyText}\n`
  }

  return `## ${title}\n\n${rows.join('\n')}\n`
}

function renderReviewHoldLines(rows: ReviewRow[]): string[] {
  return sortBySourcePath(rows).map((row) => {
    const note = compactText(row.notes)
    const details = [
      `- \`${markdownInline(row.source_path)}\``,
      `  folder: \`${markdownInline(row.source_top_folder)}\``,
      `  proposed title: ${markdownInline(row.final_title || row.proposed_title || row.filename)}`,
      `  priority/project fit: \`${markdownInline(row.priority)}\` / \`${markdownInline(row.project_fit)}\``,
      `  notes: ${note ? markdownInline(note) : '—'}`,
    ]
    return details.join('\n')
  })
}

function renderReviewUnknownActionLines(rows: ReviewRow[]): string[] {
  return sortBySourcePath(rows).map((row) => {
    const actionValue = normalizeKey(row.action) || '(blank)'
    const note = compactText(row.notes)
    const details = [
      `- \`${markdownInline(row.source_path)}\``,
      `  action value: \`${markdownInline(actionValue)}\``,
      `  folder: \`${markdownInline(row.source_top_folder)}\``,
      `  proposed title: ${markdownInline(row.final_title || row.proposed_title || row.filename)}`,
      `  notes: ${note ? markdownInline(note) : '—'}`,
    ]
    return details.join('\n')
  })
}

function renderTitleQueueLines(rows: TitleRemediationRow[]): string[] {
  return sortBySourcePath(rows).map((row) => {
    const suggested = compactText(row.suggested_title)
    const weakReasons = splitWeakReasons(row.weak_reasons)
    const details = [
      `- \`${markdownInline(row.source_path)}\``,
      `  confidence/source: \`${markdownInline(row.confidence)}\` / \`${markdownInline(row.suggestion_source)}\``,
      `  current title: ${markdownInline(row.current_title)}`,
      `  suggested title: ${suggested ? markdownInline(suggested) : '— manual review needed'}`,
      `  weak reasons: ${weakReasons.length > 0 ? weakReasons.map(markdownInline).join(', ') : '—'}`,
    ]
    return details.join('\n')
  })
}

function renderPromotionAttentionLines(rows: PromotionCandidateRow[]): string[] {
  return sortBySourcePath(rows).map((row) => {
    const cautionFlags = compactText(row.caution_flags)
    const details = [
      `- \`${markdownInline(row.source_path)}\``,
      `  target/confidence: \`${markdownInline(row.recommended_target)}\` / \`${markdownInline(row.confidence)}\``,
      `  analysis title: ${markdownInline(row.analysis_title || row.current_title)}`,
      `  reason: ${markdownInline(row.reason)}`,
      `  caution flags: ${cautionFlags ? markdownInline(cautionFlags) : '—'}`,
    ]
    return details.join('\n')
  })
}

async function main(): Promise<void> {
  const opts = parseArgs()
  const batchName = opts.batchName
  const paths = buildBatchPaths(batchName)

  const [
    manifest,
    reviewRows,
    importSummary,
    titleRemediationSummary,
    titleRemediationRowsAll,
    promotionSummary,
    promotionRows,
  ] = await Promise.all([
    readJson<ManifestSummary>(paths.manifestJson),
    readCsvObjects<ReviewRow>(paths.reviewCsv),
    readJson<ImportSummary>(paths.importSummaryJson),
    readJson<TitleRemediationSummary>(paths.titleRemediationJson),
    readCsvObjects<TitleRemediationRow>(paths.titleRemediationCsv),
    readJson<PromotionCandidatesSummary>(paths.promotionCandidatesJson),
    readCsvObjects<PromotionCandidateRow>(paths.promotionCandidatesCsv),
  ])

  const consistency = validateArtifactBatchConsistency(
    batchName,
    paths,
    manifest,
    importSummary,
    titleRemediationSummary,
    promotionSummary,
  )
  const reviewActionSummary = summarizeReviewActions(reviewRows)
  const reviewHoldRows = sortBySourcePath(reviewRows.filter((row) => normalizeKey(row.action) === 'hold'))
  const reviewImportRows = sortBySourcePath(reviewRows.filter((row) => normalizeKey(row.action) === 'import'))
  const reviewUnknownActionRows = sortBySourcePath(reviewActionSummary.unknownRows)
  const unresolvedTitleRows = sortBySourcePath(titleRemediationRowsAll.filter((row) => !toBool(row.applied)))
  const promotionAttentionRows = sortBySourcePath(
    promotionRows.filter((row) => {
      const target = compactText(row.recommended_target)
      return target === 'Hold' || target === 'Manual review'
    }),
  )
  const typedPromotionRows = promotionRows.filter((row) => {
    const target = compactText(row.recommended_target)
    return target === 'SourceDoc' || target === 'Report' || target === 'Thesis'
  })

  const unresolvedTitlePaths = new Set(unresolvedTitleRows.map((row) => row.source_path))
  const promotionAttentionPaths = new Set(promotionAttentionRows.map((row) => row.source_path))

  const typedPromotionRowsReady = typedPromotionRows.filter((row) => !unresolvedTitlePaths.has(row.source_path))
  const typedPromotionRowsBlockedByTitle = typedPromotionRows.filter((row) => unresolvedTitlePaths.has(row.source_path))

  const holdCountsByFolder: Record<string, number> = {}
  for (const row of reviewHoldRows) increment(holdCountsByFolder, row.source_top_folder || 'unknown')

  const titleQueue = titleQueueSummary(unresolvedTitleRows)
  const typedReadyCountsByTarget = rowsByTarget(typedPromotionRowsReady)
  const typedBlockedCountsByTarget = rowsByTarget(typedPromotionRowsBlockedByTitle)
  const attentionRows = buildAttentionRows(
    reviewHoldRows,
    reviewUnknownActionRows,
    unresolvedTitleRows,
    promotionAttentionRows,
  )

  const overlappingTitleAndPromotionCount = [...unresolvedTitlePaths].filter((sourcePath) =>
    promotionAttentionPaths.has(sourcePath),
  ).length

  const reviewableRows = reviewRows.length
  const sourceBatchSize = reviewableRows + manifest.exactDuplicateCount
  const controlSummary = {
    generatedAt: new Date().toISOString(),
    batchName,
    consistency: {
      checksPassed: true,
      checks: consistency.checks,
    },
    inputArtifacts: {
      manifestJson: path.relative(ROOT, paths.manifestJson),
      reviewCsv: path.relative(ROOT, paths.reviewCsv),
      importSummaryJson: path.relative(ROOT, paths.importSummaryJson),
      titleRemediationCsv: path.relative(ROOT, paths.titleRemediationCsv),
      titleRemediationSummaryJson: path.relative(ROOT, paths.titleRemediationJson),
      promotionCandidatesCsv: path.relative(ROOT, paths.promotionCandidatesCsv),
      promotionCandidatesSummaryJson: path.relative(ROOT, paths.promotionCandidatesJson),
    },
    source: {
      sourceDir: manifest.sourceDir,
      sourceBatchSize,
      reviewableRows,
      exactDuplicatesExcluded: manifest.exactDuplicateCount,
      countsByFolder: manifest.countsByFolder,
      countsByAction: reviewActionSummary.allCounts,
      unclassifiedActionCounts: reviewActionSummary.unknownCounts,
      countsByExt: manifest.countsByExt,
    },
    intake: {
      reviewImportRows: reviewImportRows.length,
      reviewHoldRows: reviewHoldRows.length,
      reviewUnclassifiedActionRows: reviewUnknownActionRows.length,
      holdCountsByFolder,
      importSummary: {
        dryRun: importSummary.dryRun,
        selected: importSummary.selected,
        imported: importSummary.imported,
        skipped: importSummary.skipped,
      },
    },
    titleRemediation: {
      ...titleRemediationSummary,
      unresolvedQueueCount: titleQueue.unresolvedCount,
      unresolvedSuggestedCount: titleQueue.suggestedCount,
      unresolvedManualOnlyCount: titleQueue.manualOnlyCount,
      unresolvedCountsByConfidence: titleQueue.byConfidence,
      unresolvedCountsBySuggestionSource: titleQueue.bySuggestionSource,
      unresolvedCountsByWeakReason: titleQueue.byWeakReason,
      unresolvedRows: unresolvedTitleRows.map((row) => ({
        sourcePath: row.source_path,
        currentTitle: compactText(row.current_title),
        suggestedTitle: compactText(row.suggested_title) || null,
        suggestionSource: compactText(row.suggestion_source),
        confidence: compactText(row.confidence),
        weakReasons: splitWeakReasons(row.weak_reasons),
        reason: compactText(row.reason),
      })),
    },
    promotion: {
      ...promotionSummary,
      typedRecommendationCount: typedPromotionRows.length,
      typedReadyCount: typedPromotionRowsReady.length,
      typedBlockedByTitleCount: typedPromotionRowsBlockedByTitle.length,
      typedReadyCountsByTarget: typedReadyCountsByTarget,
      typedBlockedByTitleCountsByTarget: typedBlockedCountsByTarget,
      attentionRows: promotionAttentionRows.map((row) => ({
        sourcePath: row.source_path,
        analysisTitle: compactText(row.analysis_title || row.current_title),
        target: compactText(row.recommended_target),
        confidence: compactText(row.confidence),
        reason: compactText(row.reason),
        cautionFlags: compactText(row.caution_flags),
      })),
      countsByTargetFromCsv: rowsByTarget(promotionRows),
      countsByTargetAndConfidenceFromCsv: rowsByTargetAndConfidence(promotionRows),
    },
    manualAttention: {
      reviewHoldCount: reviewHoldRows.length,
      reviewUnclassifiedActionCount: reviewUnknownActionRows.length,
      titleReviewQueueCount: unresolvedTitleRows.length,
      promotionAttentionCount: promotionAttentionRows.length,
      overlappingTitleAndPromotionCount,
      uniqueRowCount: attentionRows.length,
      rows: attentionRows,
    },
    outputs: {
      markdown: path.relative(ROOT, paths.outputMd),
      json: path.relative(ROOT, paths.outputJson),
    },
  }

  const markdown = [
    '# Control Report',
    '',
    `Generated: ${controlSummary.generatedAt}`,
    '',
    `- Batch: \`${batchName}\``,
    `- Source folder: \`${markdownInline(manifest.sourceDir)}\``,
    `- Input artifacts: \`manifest.json\`, \`review.csv\`, \`import-summary.json\`, \`title-remediation.csv\`, \`title-remediation-summary.json\`, \`promotion-candidates.csv\`, \`promotion-candidates-summary.json\``,
    `- Output JSON summary: \`${path.relative(ROOT, paths.outputJson)}\``,
    `- Report is read-only: no database writes.`,
    `- Batch consistency checks: passed (${formatNumber(consistency.checks.length)} checks).`,
    '',
    '## Status Snapshot',
    '',
    '| Metric | Count | Notes |',
    '| --- | ---: | --- |',
    `| Source batch files seen | ${formatNumber(sourceBatchSize)} | Reviewable rows plus exact duplicates excluded from review. |`,
    `| Reviewable rows | ${formatNumber(reviewableRows)} | Rows represented in current \`review.csv\`. |`,
    `| Exact duplicates excluded | ${formatNumber(manifest.exactDuplicateCount)} | Files filtered out before review. |`,
    `| Rows marked import in review.csv | ${formatNumber(reviewImportRows.length)} | Human-selected intake rows. |`,
    `| Rows still on hold in review.csv | ${formatNumber(reviewHoldRows.length)} | Intake rows still outside import. |`,
    `| Rows with unclassified review actions | ${formatNumber(reviewUnknownActionRows.length)} | Action values not recognized as \`import\` or \`hold\`. |`,
    `| Imported rows in import summary | ${formatNumber(importSummary.imported)} | \`selected=${formatNumber(importSummary.selected)}\`, \`skipped=${formatNumber(importSummary.skipped)}\`, \`dryRun=${String(importSummary.dryRun)}\`. |`,
    `| Unresolved weak-title queue | ${formatNumber(titleQueue.unresolvedCount)} | ${formatNumber(titleQueue.suggestedCount)} with candidate replacements, ${formatNumber(titleQueue.manualOnlyCount)} manual-only. |`,
    `| Typed promotion recommendations | ${formatNumber(typedPromotionRows.length)} | SourceDoc + Report + Thesis recommendations. |`,
    `| Promotion blockers | ${formatNumber(promotionAttentionRows.length)} | Rows still labeled Hold or Manual review by the promotion pass. |`,
    `| Unique rows needing manual attention | ${formatNumber(attentionRows.length)} | Deduplicated union of review hold, title queue, and promotion blockers. |`,
    '',
    '## Source Intake Summary',
    '',
    `- Source batch size: ${formatNumber(sourceBatchSize)}`,
    `- Duplicates excluded before review: ${formatNumber(manifest.exactDuplicateCount)}`,
    `- Reviewable rows: ${formatNumber(reviewableRows)}`,
    `- Live review.csv action counts: ${Object.entries(reviewActionSummary.allCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([action, count]) => `\`${action}=${formatNumber(count)}\``)
      .join(', ') || 'none'}`,
    '',
    '### Live Review Action Counts',
    '',
    ...(Object.keys(reviewActionSummary.allCounts).length > 0
      ? countsToBullets(reviewActionSummary.allCounts)
      : ['- None']),
    '',
    '### Unclassified Review Actions',
    '',
    ...(Object.keys(reviewActionSummary.unknownCounts).length > 0
      ? countsToBullets(reviewActionSummary.unknownCounts)
      : ['- None']),
    '',
    '### Review Hold Rows By Folder',
    '',
    ...(Object.keys(holdCountsByFolder).length > 0 ? countsToBullets(holdCountsByFolder) : ['- None']),
    '',
    '## Import Status',
    '',
    `- Import summary generated: ${importSummary.generatedAt}`,
    `- Selected rows: ${formatNumber(importSummary.selected)}`,
    `- Imported rows: ${formatNumber(importSummary.imported)}`,
    `- Skipped rows during import: ${formatNumber(importSummary.skipped)}`,
    `- Import mode: ${importSummary.dryRun ? 'dry run' : 'live import summary already completed'}`,
    '',
    '## Title Remediation Status',
    '',
    `- Title remediation summary generated: ${titleRemediationSummary.generatedAt}`,
    `- Weak imported titles flagged: ${formatNumber(titleRemediationSummary.weakTitleCount)}`,
    `- Unresolved queue remaining: ${formatNumber(titleQueue.unresolvedCount)}`,
    `- Suggested replacements available: ${formatNumber(titleQueue.suggestedCount)}`,
    `- Manual-only title cases: ${formatNumber(titleQueue.manualOnlyCount)}`,
    `- Applied title updates: ${formatNumber(titleRemediationSummary.appliedCount)}`,
    `- Review CSV rows changed by remediation script: ${formatNumber(titleRemediationSummary.reviewCsvChangedCount)}`,
    `- DB title changes applied: ${formatNumber(titleRemediationSummary.dbChangedCount)}`,
    '',
    '### Weak Title Reasons',
    '',
    ...(Object.keys(titleQueue.byWeakReason).length > 0 ? countsToBullets(titleQueue.byWeakReason) : ['- None']),
    '',
    '### Title Queue By Confidence',
    '',
    ...(Object.keys(titleQueue.byConfidence).length > 0 ? countsToBullets(titleQueue.byConfidence) : ['- None']),
    '',
    '### Title Queue By Suggestion Source',
    '',
    ...(Object.keys(titleQueue.bySuggestionSource).length > 0
      ? countsToBullets(titleQueue.bySuggestionSource)
      : ['- None']),
    '',
    '## Promotion Candidate Status',
    '',
    `- Promotion summary generated: ${promotionSummary.generatedAt}`,
    `- Imported rows analyzed: ${formatNumber(promotionSummary.importedRowsAnalyzed)}`,
    `- Hold rows skipped from intake review: ${formatNumber(promotionSummary.skippedRows)}`,
    '',
    '### Counts By Target',
    '',
    ...(Object.keys(promotionSummary.countsByTarget).length > 0
      ? countsToBullets(promotionSummary.countsByTarget)
      : ['- None']),
    '',
    '### Counts By Confidence',
    '',
    ...(Object.keys(promotionSummary.countsByConfidence).length > 0
      ? countsToBullets(promotionSummary.countsByConfidence)
      : ['- None']),
    '',
    '### Counts By Target And Confidence',
    '',
    ...Object.entries(promotionSummary.countsByTargetAndConfidence)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([target, confidenceCounts]) => {
        const high = confidenceCounts.high ?? 0
        const medium = confidenceCounts.medium ?? 0
        const low = confidenceCounts.low ?? 0
        return `- ${target}: high ${formatNumber(high)} / medium ${formatNumber(medium)} / low ${formatNumber(low)}`
      }),
    '',
    '### Typed Promotion Readiness',
    '',
    `- Typed recommendations total: ${formatNumber(typedPromotionRows.length)}`,
    `- Typed recommendations ready without unresolved title blockers: ${formatNumber(typedPromotionRowsReady.length)}`,
    `- Typed recommendations still carrying unresolved title issues: ${formatNumber(typedPromotionRowsBlockedByTitle.length)}`,
    '',
    '#### Ready Typed Recommendations By Target',
    '',
    ...(Object.keys(typedReadyCountsByTarget).length > 0
      ? countsToBullets(typedReadyCountsByTarget)
      : ['- None']),
    '',
    '#### Typed Recommendations Blocked By Title Review',
    '',
    ...(Object.keys(typedBlockedCountsByTarget).length > 0
      ? countsToBullets(typedBlockedCountsByTarget)
      : ['- None']),
    '',
    '## Manual Attention Summary',
    '',
    `- Review hold rows: ${formatNumber(reviewHoldRows.length)}`,
    `- Review rows with unclassified action values: ${formatNumber(reviewUnknownActionRows.length)}`,
    `- Title review queue rows: ${formatNumber(unresolvedTitleRows.length)}`,
    `- Promotion Hold/Manual review rows: ${formatNumber(promotionAttentionRows.length)}`,
    `- Overlap between title queue and promotion blockers: ${formatNumber(overlappingTitleAndPromotionCount)}`,
    `- Unique source rows requiring manual attention: ${formatNumber(attentionRows.length)}`,
    '',
    '## Next-Step Checklist',
    '',
    `- Confirm the ${formatNumber(reviewHoldRows.length)} \`review.csv\` hold rows should stay excluded. If any should enter intake, update \`action\` and rerun the import workflow before promotion work.`,
    ...(reviewUnknownActionRows.length > 0
      ? [
          `- Resolve the ${formatNumber(reviewUnknownActionRows.length)} rows with unclassified \`review.csv\` action values before trusting intake totals; remap each action to \`import\` or \`hold\` or clean up the legacy value.`,
        ]
      : []),
    `- Resolve the ${formatNumber(titleQueue.unresolvedCount)} weak-title rows in \`title-remediation.csv\`, starting with the ${formatNumber(titleQueue.manualOnlyCount)} rows that have no automatic replacement suggestion.`,
    `- Re-run title remediation or apply confirmed title fixes before typed promotion on the ${formatNumber(typedPromotionRowsBlockedByTitle.length)} typed candidates still carrying title blockers.`,
    `- Promote the ${formatNumber(typedPromotionRowsReady.length)} clean typed recommendations first. Current ready split: ${Object.entries(typedReadyCountsByTarget)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([target, count]) => `${target} ${formatNumber(count)}`)
      .join(', ') || 'none'}.`,
    `- Keep the ${formatNumber(promotionAttentionRows.length)} promotion-blocked rows out of typed layers until their titles or metadata are clarified.`,
    '',
    renderQueueSection(
      'Review Hold Queue',
      renderReviewHoldLines(reviewHoldRows),
      'No review hold rows remain.',
    ).trimEnd(),
    '',
    renderQueueSection(
      'Unclassified Review Actions',
      renderReviewUnknownActionLines(reviewUnknownActionRows),
      'No unclassified or legacy review action values were found.',
    ).trimEnd(),
    '',
    renderQueueSection(
      'Title Review Queue',
      renderTitleQueueLines(unresolvedTitleRows),
      'No unresolved weak-title rows remain.',
    ).trimEnd(),
    '',
    renderQueueSection(
      'Promotion Blockers',
      renderPromotionAttentionLines(promotionAttentionRows),
      'No promotion Hold/Manual review blockers remain.',
    ).trimEnd(),
    '',
  ].join('\n')

  await fs.writeFile(paths.outputJson, JSON.stringify(controlSummary, null, 2) + '\n', 'utf8')
  await fs.writeFile(paths.outputMd, markdown, 'utf8')

  console.log(
    JSON.stringify(
      {
        batchName,
        createdOrUpdated: [
          path.relative(ROOT, paths.outputMd),
          path.relative(ROOT, paths.outputJson),
        ],
        sourceBatchSize,
        reviewHoldRows: reviewHoldRows.length,
        reviewUnclassifiedActionRows: reviewUnknownActionRows.length,
        importedRows: importSummary.imported,
        unresolvedTitleQueue: titleQueue.unresolvedCount,
        promotionBlockers: promotionAttentionRows.length,
        uniqueManualAttentionRows: attentionRows.length,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error('[food-process-control-report] failed')
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
})
