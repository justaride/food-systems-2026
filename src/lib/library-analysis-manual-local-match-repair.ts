import { createHash } from 'node:crypto'

export const LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-manual-local-match-plan.md'
export const LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-manual-local-match-plan.json'

const LOW_TEXT_WORD_FLOOR = 150

export type LibraryAnalysisManualLocalMatchRepairMapping = {
  sourceKey: string
  documentId: string
  title: string
  localPath: string
  expectedTitleIncludes?: string[]
  expectedUrlIncludes?: string[]
  reviewNote: string
}

export type LibraryAnalysisManualLocalMatchRepairDocument = {
  id: string
  title: string
  url: string | null
  filePath: string | null
  content: string
  wordCount: number
}

export type LibraryAnalysisManualLocalMatchRepairFile = {
  path: string
  text: string
  wordCount: number
}

export type LibraryAnalysisManualLocalMatchRepairAction =
  | 'skip_below_quality_floor'
  | 'skip_missing_document'
  | 'skip_missing_file'
  | 'skip_no_file_text'
  | 'skip_no_gain'
  | 'skip_path_already_assigned'
  | 'skip_title_guard_failed'
  | 'skip_url_guard_failed'
  | 'update'

export type LibraryAnalysisManualLocalMatchRepairPlanRow = {
  sourceKey: string
  documentId: string
  title: string
  localPath: string
  action: LibraryAnalysisManualLocalMatchRepairAction
  existingFilePath: string | null
  newFilePath: string | null
  existingWordCount: number
  fileWordCount: number
  newWordCount: number
  wordGain: number
  contentHashBefore: string | null
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
  reviewNote: string
}

export type LibraryAnalysisManualLocalMatchRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisManualLocalMatchRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    updateRows: number
    totalWordGain: number
    clearsLowTextRows: number
  }
}

export type BuildLibraryAnalysisManualLocalMatchRepairPlanInput = {
  mappings: LibraryAnalysisManualLocalMatchRepairMapping[]
  documents: LibraryAnalysisManualLocalMatchRepairDocument[]
  files: LibraryAnalysisManualLocalMatchRepairFile[]
  generatedAt?: string
}

export type FormatLibraryAnalysisManualLocalMatchRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisManualLocalMatchRepairPlan(
  input: BuildLibraryAnalysisManualLocalMatchRepairPlanInput,
): LibraryAnalysisManualLocalMatchRepairPlan {
  const documentsById = new Map(input.documents.map(document => [document.id, document]))
  const filesByPath = new Map(input.files.map(file => [file.path, file]))
  const pathOwners = new Map(
    input.documents
      .filter(document => document.filePath)
      .map(document => [document.filePath!, document]),
  )
  const rows = input.mappings
    .map(mapping => toPlanRow({
      mapping,
      document: documentsById.get(mapping.documentId) ?? null,
      file: filesByPath.get(mapping.localPath) ?? null,
      pathOwner: pathOwners.get(mapping.localPath) ?? null,
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
      clearsLowTextRows: updateRows.filter(row => row.fileWordCount >= LOW_TEXT_WORD_FLOOR).length,
    },
  }
}

export function formatLibraryAnalysisManualLocalMatchRepairPlanMarkdown(
  plan: LibraryAnalysisManualLocalMatchRepairPlan,
  options: FormatLibraryAnalysisManualLocalMatchRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Manual Local Match Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for forhaandsvurderte lokale kilde-matcher der en lavtekst-Document kan kobles til en eksisterende lokal tekstfil. Den oppdaterer bare Document.filePath, Document.content og Document.wordCount naar document-id, tittel/URL-guards, path-eierskap og tekstgrense passer. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
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
    '| Action | Existing words | File words | New words | Gain | Title | Document | Local path | Reason |',
    '|---|---:|---:|---:|---:|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      String(row.existingWordCount),
      String(row.fileWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      escapeMarkdownCell(row.title),
      row.documentId,
      escapeMarkdownCell(row.localPath),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(input: {
  mapping: LibraryAnalysisManualLocalMatchRepairMapping
  document: LibraryAnalysisManualLocalMatchRepairDocument | null
  file: LibraryAnalysisManualLocalMatchRepairFile | null
  pathOwner: LibraryAnalysisManualLocalMatchRepairDocument | null
}): LibraryAnalysisManualLocalMatchRepairPlanRow {
  const { mapping, document, file, pathOwner } = input

  if (!document) {
    return baseRow(mapping, {
      action: 'skip_missing_document',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: 0,
      reason: `Document ${mapping.documentId} was not found; reviewed mapping cannot be applied.`,
    })
  }

  const titleMiss = firstMissingNeedle(document.title, mapping.expectedTitleIncludes)
  if (titleMiss) {
    return baseRow(mapping, {
      action: 'skip_title_guard_failed',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Document title guard failed; missing expected fragment "${titleMiss}".`,
    })
  }

  const urlMiss = firstMissingNeedle(document.url ?? '', mapping.expectedUrlIncludes)
  if (urlMiss) {
    return baseRow(mapping, {
      action: 'skip_url_guard_failed',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Document URL guard failed; missing expected fragment "${urlMiss}".`,
    })
  }

  if (pathOwner && pathOwner.id !== document.id) {
    return baseRow(mapping, {
      action: 'skip_path_already_assigned',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Local path is already assigned to Document ${pathOwner.id}.`,
    })
  }

  if (!file) {
    return baseRow(mapping, {
      action: 'skip_missing_file',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: 'Reviewed local file was not found in the current checkout.',
    })
  }

  const fileText = file.text.trim()
  if (!fileText) {
    return baseRow(mapping, {
      action: 'skip_no_file_text',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: 'Reviewed local file has no extracted text.',
    })
  }

  if (file.wordCount < LOW_TEXT_WORD_FLOOR) {
    return baseRow(mapping, {
      action: 'skip_below_quality_floor',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed local file remains below the ${LOW_TEXT_WORD_FLOOR}-word floor (${file.wordCount} words).`,
    })
  }

  const nextContent = mergeManualLocalMatch({
    fileText,
    localPath: mapping.localPath,
    fileWordCount: file.wordCount,
    reviewNote: mapping.reviewNote,
  })
  const newWordCount = countWords(nextContent)
  if (newWordCount <= document.wordCount) {
    return baseRow(mapping, {
      action: 'skip_no_gain',
      document,
      file,
      newFilePath: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed local file does not improve existing word count (${document.wordCount} -> ${newWordCount} words).`,
    })
  }

  return baseRow(mapping, {
    action: 'update',
    document,
    file,
    newFilePath: mapping.localPath,
    nextContent,
    newWordCount,
    reason: `Document can be linked to reviewed local file (${document.wordCount} -> ${newWordCount} words).`,
  })
}

function baseRow(
  mapping: LibraryAnalysisManualLocalMatchRepairMapping,
  values: {
    action: LibraryAnalysisManualLocalMatchRepairAction
    document: LibraryAnalysisManualLocalMatchRepairDocument | null
    file: LibraryAnalysisManualLocalMatchRepairFile | null
    newFilePath: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisManualLocalMatchRepairPlanRow {
  const existingWordCount = values.document?.wordCount ?? 0
  return {
    sourceKey: mapping.sourceKey,
    documentId: mapping.documentId,
    title: mapping.title,
    localPath: mapping.localPath,
    action: values.action,
    existingFilePath: values.document?.filePath ?? null,
    newFilePath: values.newFilePath,
    existingWordCount,
    fileWordCount: values.file?.wordCount ?? 0,
    newWordCount: values.newWordCount,
    wordGain: Math.max(0, values.newWordCount - existingWordCount),
    contentHashBefore: values.document ? sha256(values.document.content.trim()) : null,
    contentHashAfter: values.nextContent ? sha256(values.nextContent) : null,
    nextContent: values.nextContent,
    reason: values.reason,
    reviewNote: mapping.reviewNote,
  }
}

function mergeManualLocalMatch(input: {
  fileText: string
  localPath: string
  fileWordCount: number
  reviewNote: string
}): string {
  return [
    '--- Manual local source match ---',
    '',
    `Source file: \`${input.localPath}\``,
    `File words: ${input.fileWordCount}`,
    `Reviewed note: ${input.reviewNote}`,
    '',
    input.fileText,
  ].join('\n')
}

function firstMissingNeedle(value: string, needles: string[] | undefined): string | null {
  if (!needles || needles.length === 0) return null
  const normalizedValue = value.toLowerCase()
  return needles.find(needle => !normalizedValue.includes(needle.toLowerCase())) ?? null
}

function comparePlanRows(
  a: LibraryAnalysisManualLocalMatchRepairPlanRow,
  b: LibraryAnalysisManualLocalMatchRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisManualLocalMatchRepairAction, number> = {
    update: 0,
    skip_below_quality_floor: 1,
    skip_no_gain: 2,
    skip_no_file_text: 3,
    skip_missing_file: 4,
    skip_path_already_assigned: 5,
    skip_title_guard_failed: 6,
    skip_url_guard_failed: 7,
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
