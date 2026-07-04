import { createHash } from 'node:crypto'
import { normalizeLocalFileLocator } from './local-file-locator'

export const LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-manual-pdf-match-plan.md'
export const LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-manual-pdf-match-plan.json'

const LOW_TEXT_WORD_FLOOR = 150

export type LibraryAnalysisManualPdfMatchRepairMapping = {
  sourceKey: string
  documentId: string
  title: string
  sourceUrl: string
  localPath: string
  expectedTitleIncludes?: string[]
  expectedExistingUrlIncludes?: string[]
  sharedPathOwnerDocumentId?: string
  maxPdfBytes?: number
  reviewNote: string
}

export type LibraryAnalysisManualPdfMatchRepairDocument = {
  id: string
  title: string
  url: string | null
  filePath: string | null
  content: string
  wordCount: number
}

export type LibraryAnalysisManualPdfMatchRepairFile = {
  path: string
  text: string
  wordCount: number
}

export type LibraryAnalysisManualPdfMatchRepairAction =
  | 'skip_below_quality_floor'
  | 'skip_existing_url_guard_failed'
  | 'skip_missing_document'
  | 'skip_missing_pdf'
  | 'skip_no_gain'
  | 'skip_no_pdf_text'
  | 'skip_path_already_assigned'
  | 'skip_title_guard_failed'
  | 'update'

export type LibraryAnalysisManualPdfMatchRepairPlanRow = {
  sourceKey: string
  documentId: string
  title: string
  sourceUrl: string
  localPath: string
  action: LibraryAnalysisManualPdfMatchRepairAction
  existingUrl: string | null
  newUrl: string | null
  existingFilePath: string | null
  newFilePath: string | null
  existingWordCount: number
  extractedWordCount: number
  newWordCount: number
  wordGain: number
  contentHashBefore: string | null
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
  reviewNote: string
}

export type LibraryAnalysisManualPdfMatchRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisManualPdfMatchRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    updateRows: number
    totalWordGain: number
    clearsLowTextRows: number
  }
}

export type BuildLibraryAnalysisManualPdfMatchRepairPlanInput = {
  mappings: LibraryAnalysisManualPdfMatchRepairMapping[]
  documents: LibraryAnalysisManualPdfMatchRepairDocument[]
  files: LibraryAnalysisManualPdfMatchRepairFile[]
  generatedAt?: string
}

export type FormatLibraryAnalysisManualPdfMatchRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisManualPdfMatchRepairPlan(
  input: BuildLibraryAnalysisManualPdfMatchRepairPlanInput,
): LibraryAnalysisManualPdfMatchRepairPlan {
  const documentsById = new Map(input.documents.map(document => [document.id, document]))
  const filesByPath = new Map(input.files.map(file => [file.path, file]))
  const filesByNormalizedPath = groupFilesByNormalizedPath(input.files)
  const pathOwnersByNormalizedPath = groupDocumentsByNormalizedPath(input.documents)
  const rows = input.mappings
    .map(mapping => toPlanRow({
      mapping,
      document: documentsById.get(mapping.documentId) ?? null,
      file: filesByPath.get(mapping.localPath) ?? fileForNormalizedPath(filesByNormalizedPath, mapping.localPath),
      pathOwners: documentsForNormalizedPath(pathOwnersByNormalizedPath, mapping.localPath),
    }))
    .sort(comparePlanRows)
  const updateRows = rows.filter(row => row.action === 'update')

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    total: rows.length,
    rows,
    summary: {
      byAction: countBy(rows, row => row.action),
      updateRows: updateRows.length,
      totalWordGain: updateRows.reduce((sum, row) => sum + row.wordGain, 0),
      clearsLowTextRows: updateRows.filter(row => row.extractedWordCount >= LOW_TEXT_WORD_FLOOR).length,
    },
  }
}

export function formatLibraryAnalysisManualPdfMatchRepairPlanMarkdown(
  plan: LibraryAnalysisManualPdfMatchRepairPlan,
  options: FormatLibraryAnalysisManualPdfMatchRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Manual PDF Match Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for forhaandsvurderte offisielle PDF-matcher der en lavtekst-Document kan kobles til en lokal PDF og korrigert kilde-URL. Den oppdaterer bare Document.url, Document.filePath, Document.content og Document.wordCount naar document-id, tittel/URL-guards, path-eierskap og tekstgrense passer. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total rows | ${plan.total} |`,
    `| Update rows | ${plan.summary.updateRows} |`,
    `| Total word gain | ${plan.summary.totalWordGain} |`,
    `| Clears low-text rows | ${plan.summary.clearsLowTextRows} |`,
    '',
    '### Action',
    '',
    formatCountTable(plan.summary.byAction),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${plan.total}`,
    '',
    '| Action | Existing words | Extracted words | New words | Gain | Title | Document | Local PDF | Source URL | Reason |',
    '|---|---:|---:|---:|---:|---|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      String(row.existingWordCount),
      String(row.extractedWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      escapeMarkdownCell(row.title),
      row.documentId,
      escapeMarkdownCell(row.localPath),
      escapeMarkdownCell(row.sourceUrl),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(input: {
  mapping: LibraryAnalysisManualPdfMatchRepairMapping
  document: LibraryAnalysisManualPdfMatchRepairDocument | null
  file: LibraryAnalysisManualPdfMatchRepairFile | null
  pathOwners: LibraryAnalysisManualPdfMatchRepairDocument[]
}): LibraryAnalysisManualPdfMatchRepairPlanRow {
  const { mapping, document, file, pathOwners } = input

  if (!document) {
    return baseRow(mapping, {
      action: 'skip_missing_document',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: 0,
      reason: `Document ${mapping.documentId} was not found; reviewed PDF mapping cannot be applied.`,
    })
  }

  const titleMiss = firstMissingNeedle(document.title, mapping.expectedTitleIncludes)
  if (titleMiss) {
    return baseRow(mapping, {
      action: 'skip_title_guard_failed',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Document title guard failed; missing expected fragment "${titleMiss}".`,
    })
  }

  const urlMiss = firstMissingNeedle(document.url ?? '', mapping.expectedExistingUrlIncludes)
  if (urlMiss) {
    return baseRow(mapping, {
      action: 'skip_existing_url_guard_failed',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Existing Document URL guard failed; missing expected fragment "${urlMiss}".`,
    })
  }

  const disallowedPathOwner = pathOwners.find(pathOwner =>
    pathOwner.id !== document.id &&
    pathOwner.id !== mapping.sharedPathOwnerDocumentId
  )
  if (disallowedPathOwner) {
    return baseRow(mapping, {
      action: 'skip_path_already_assigned',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Local PDF path is already assigned to Document ${disallowedPathOwner.id}.`,
    })
  }
  const exactSharedPathOwner = pathOwners.find(pathOwner =>
    pathOwner.id !== document.id &&
    pathOwner.id === mapping.sharedPathOwnerDocumentId &&
    pathOwner.filePath === mapping.localPath
  )
  if (exactSharedPathOwner) {
    return baseRow(mapping, {
      action: 'skip_path_already_assigned',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Local PDF path is exactly assigned to Document ${exactSharedPathOwner.id}; use a distinct reviewed alias path before applying.`,
    })
  }

  if (!file) {
    return baseRow(mapping, {
      action: 'skip_missing_pdf',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: 'Reviewed local PDF was not found in the current checkout.',
    })
  }

  const extractedText = file.text.trim()
  if (!extractedText) {
    return baseRow(mapping, {
      action: 'skip_no_pdf_text',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: 'Reviewed local PDF has no extracted text.',
    })
  }

  if (file.wordCount < LOW_TEXT_WORD_FLOOR) {
    return baseRow(mapping, {
      action: 'skip_below_quality_floor',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed local PDF remains below the ${LOW_TEXT_WORD_FLOOR}-word floor (${file.wordCount} words).`,
    })
  }

  const nextContent = mergeManualPdfMatch({
    extractedText,
    sourceUrl: mapping.sourceUrl,
    localPath: mapping.localPath,
    extractedWordCount: file.wordCount,
    reviewNote: mapping.reviewNote,
  })
  const newWordCount = countWords(nextContent)
  if (newWordCount <= document.wordCount) {
    return baseRow(mapping, {
      action: 'skip_no_gain',
      document,
      file,
      newUrl: null,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed local PDF does not improve existing word count (${document.wordCount} -> ${newWordCount} words).`,
    })
  }

  const sharedPathOwner = pathOwners.find(pathOwner =>
    pathOwner.id !== document.id &&
    pathOwner.id === mapping.sharedPathOwnerDocumentId
  )
  return baseRow(mapping, {
    action: 'update',
    document,
    file,
    newUrl: mapping.sourceUrl,
    newFilePath: mapping.localPath,
    nextContent,
    newWordCount,
    reason: sharedPathOwner
      ? `Document can be linked to reviewed official PDF shared with reviewed owner ${sharedPathOwner.id} (${document.wordCount} -> ${newWordCount} words).`
      : `Document can be linked to reviewed official PDF (${document.wordCount} -> ${newWordCount} words).`,
  })
}

function groupFilesByNormalizedPath(
  files: LibraryAnalysisManualPdfMatchRepairFile[],
): Map<string, LibraryAnalysisManualPdfMatchRepairFile> {
  const filesByNormalizedPath = new Map<string, LibraryAnalysisManualPdfMatchRepairFile>()
  for (const file of files) {
    const normalizedPath = normalizeLocalFileLocator(file.path)
    if (normalizedPath && !filesByNormalizedPath.has(normalizedPath)) {
      filesByNormalizedPath.set(normalizedPath, file)
    }
  }
  return filesByNormalizedPath
}

function fileForNormalizedPath(
  filesByNormalizedPath: Map<string, LibraryAnalysisManualPdfMatchRepairFile>,
  path: string,
): LibraryAnalysisManualPdfMatchRepairFile | null {
  const normalizedPath = normalizeLocalFileLocator(path)
  return normalizedPath ? filesByNormalizedPath.get(normalizedPath) ?? null : null
}

function groupDocumentsByNormalizedPath(
  documents: LibraryAnalysisManualPdfMatchRepairDocument[],
): Map<string, LibraryAnalysisManualPdfMatchRepairDocument[]> {
  const documentsByNormalizedPath = new Map<string, LibraryAnalysisManualPdfMatchRepairDocument[]>()
  for (const document of documents) {
    const normalizedPath = normalizeLocalFileLocator(document.filePath)
    if (!normalizedPath) continue
    const owners = documentsByNormalizedPath.get(normalizedPath) ?? []
    owners.push(document)
    documentsByNormalizedPath.set(normalizedPath, owners)
  }
  return documentsByNormalizedPath
}

function documentsForNormalizedPath(
  documentsByNormalizedPath: Map<string, LibraryAnalysisManualPdfMatchRepairDocument[]>,
  path: string,
): LibraryAnalysisManualPdfMatchRepairDocument[] {
  const normalizedPath = normalizeLocalFileLocator(path)
  return normalizedPath ? documentsByNormalizedPath.get(normalizedPath) ?? [] : []
}

function baseRow(
  mapping: LibraryAnalysisManualPdfMatchRepairMapping,
  values: {
    action: LibraryAnalysisManualPdfMatchRepairAction
    document: LibraryAnalysisManualPdfMatchRepairDocument | null
    file: LibraryAnalysisManualPdfMatchRepairFile | null
    newUrl: string | null
    newFilePath: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisManualPdfMatchRepairPlanRow {
  const existingWordCount = values.document?.wordCount ?? 0
  return {
    sourceKey: mapping.sourceKey,
    documentId: mapping.documentId,
    title: mapping.title,
    sourceUrl: mapping.sourceUrl,
    localPath: mapping.localPath,
    action: values.action,
    existingUrl: values.document?.url ?? null,
    newUrl: values.newUrl,
    existingFilePath: values.document?.filePath ?? null,
    newFilePath: values.newFilePath,
    existingWordCount,
    extractedWordCount: values.file?.wordCount ?? 0,
    newWordCount: values.newWordCount,
    wordGain: Math.max(0, values.newWordCount - existingWordCount),
    contentHashBefore: values.document ? sha256(values.document.content.trim()) : null,
    contentHashAfter: values.nextContent ? sha256(values.nextContent) : null,
    nextContent: values.nextContent,
    reason: values.reason,
    reviewNote: mapping.reviewNote,
  }
}

function mergeManualPdfMatch(input: {
  extractedText: string
  sourceUrl: string
  localPath: string
  extractedWordCount: number
  reviewNote: string
}): string {
  return [
    '--- Manual PDF source match ---',
    '',
    `Source PDF: \`${input.localPath}\``,
    `Source URL: ${input.sourceUrl}`,
    `Extracted words: ${input.extractedWordCount}`,
    `Reviewed note: ${input.reviewNote}`,
    '',
    input.extractedText,
  ].join('\n')
}

function firstMissingNeedle(value: string, needles: string[] | undefined): string | null {
  if (!needles || needles.length === 0) return null
  const normalizedValue = value.toLowerCase()
  return needles.find(needle => !normalizedValue.includes(needle.toLowerCase())) ?? null
}

function comparePlanRows(
  a: LibraryAnalysisManualPdfMatchRepairPlanRow,
  b: LibraryAnalysisManualPdfMatchRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisManualPdfMatchRepairAction, number> = {
    update: 0,
    skip_below_quality_floor: 1,
    skip_no_gain: 2,
    skip_no_pdf_text: 3,
    skip_missing_pdf: 4,
    skip_path_already_assigned: 5,
    skip_title_guard_failed: 6,
    skip_existing_url_guard_failed: 7,
    skip_missing_document: 8,
  }
  const actionDiff = actionOrder[a.action] - actionOrder[b.action]
  if (actionDiff !== 0) return actionDiff
  const gainDiff = b.wordGain - a.wordGain
  if (gainDiff !== 0) return gainDiff
  return a.sourceKey.localeCompare(b.sourceKey)
}

function countBy<T>(rows: T[], key: (row: T) => string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = key(row)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function formatCountTable(counts: Record<string, number>): string {
  const entries = Object.entries(counts)
  if (entries.length === 0) return '_Ingen rader._'
  return [
    '| Value | Count |',
    '|---|---:|',
    ...entries.map(([value, count]) => `| ${escapeMarkdownCell(value)} | ${count} |`),
  ].join('\n')
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}
