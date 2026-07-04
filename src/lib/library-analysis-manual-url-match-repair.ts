import { createHash } from 'node:crypto'
import type {
  LibraryAnalysisUrlContentKind,
  LibraryAnalysisUrlExtractionMethod,
} from './library-analysis-url-text-extraction-profile'

export const LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-manual-url-match-plan.md'
export const LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-manual-url-match-plan.json'

const LOW_TEXT_WORD_FLOOR = 150

export type LibraryAnalysisManualUrlMatchRepairMapping = {
  sourceKey: string
  documentId: string
  title: string
  sourceUrl: string
  expectedTitleIncludes?: string[]
  expectedExistingUrlIncludes?: string[]
  expectedExtractedTextIncludes?: string[]
  reviewNote: string
}

export type LibraryAnalysisManualUrlMatchRepairDocument = {
  id: string
  title: string
  url: string | null
  content: string
  wordCount: number
}

export type LibraryAnalysisManualUrlMatchRepairUrl = {
  url: string
  finalUrl: string | null
  text: string
  wordCount: number
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  error?: string | null
}

export type LibraryAnalysisManualUrlMatchRepairAction =
  | 'skip_below_quality_floor'
  | 'skip_existing_url_guard_failed'
  | 'skip_extracted_text_guard_failed'
  | 'skip_missing_document'
  | 'skip_missing_url'
  | 'skip_no_gain'
  | 'skip_no_url_text'
  | 'skip_title_guard_failed'
  | 'update'

export type LibraryAnalysisManualUrlMatchRepairPlanRow = {
  sourceKey: string
  documentId: string
  title: string
  sourceUrl: string
  finalUrl: string | null
  action: LibraryAnalysisManualUrlMatchRepairAction
  existingUrl: string | null
  newUrl: string | null
  existingWordCount: number
  extractedWordCount: number
  newWordCount: number
  wordGain: number
  contentKind: LibraryAnalysisUrlContentKind | null
  extractionMethod: LibraryAnalysisUrlExtractionMethod | null
  contentHashBefore: string | null
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
  reviewNote: string
}

export type LibraryAnalysisManualUrlMatchRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisManualUrlMatchRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    updateRows: number
    totalWordGain: number
    clearsLowTextRows: number
  }
}

export type BuildLibraryAnalysisManualUrlMatchRepairPlanInput = {
  mappings: LibraryAnalysisManualUrlMatchRepairMapping[]
  documents: LibraryAnalysisManualUrlMatchRepairDocument[]
  urls: LibraryAnalysisManualUrlMatchRepairUrl[]
  generatedAt?: string
}

export type FormatLibraryAnalysisManualUrlMatchRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisManualUrlMatchRepairPlan(
  input: BuildLibraryAnalysisManualUrlMatchRepairPlanInput,
): LibraryAnalysisManualUrlMatchRepairPlan {
  const documentsById = new Map(input.documents.map(document => [document.id, document]))
  const urlsByUrl = new Map(input.urls.map(url => [url.url, url]))
  const rows = input.mappings
    .map(mapping => toPlanRow({
      mapping,
      document: documentsById.get(mapping.documentId) ?? null,
      url: urlsByUrl.get(mapping.sourceUrl) ?? null,
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

export function formatLibraryAnalysisManualUrlMatchRepairPlanMarkdown(
  plan: LibraryAnalysisManualUrlMatchRepairPlan,
  options: FormatLibraryAnalysisManualUrlMatchRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Manual URL Match Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for forhaandsvurderte URL-matcher der en lavtekst-Document kan kobles til en bedre offentlig HTML/PDF-URL og refetchet tekst. Den oppdaterer bare Document.url, Document.content og Document.wordCount naar document-id, tittel/URL-guards, tekst-guards og tekstgrense passer. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
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
    '| Action | Existing words | Extracted words | New words | Gain | Title | Document | Source URL | Reason |',
    '|---|---:|---:|---:|---:|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      String(row.existingWordCount),
      String(row.extractedWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      escapeMarkdownCell(row.title),
      row.documentId,
      escapeMarkdownCell(row.sourceUrl),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(input: {
  mapping: LibraryAnalysisManualUrlMatchRepairMapping
  document: LibraryAnalysisManualUrlMatchRepairDocument | null
  url: LibraryAnalysisManualUrlMatchRepairUrl | null
}): LibraryAnalysisManualUrlMatchRepairPlanRow {
  const { mapping, document, url } = input

  if (!document) {
    return baseRow(mapping, {
      action: 'skip_missing_document',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: 0,
      reason: `Document ${mapping.documentId} was not found; reviewed URL mapping cannot be applied.`,
    })
  }

  const titleMiss = firstMissingNeedle(document.title, mapping.expectedTitleIncludes)
  if (titleMiss) {
    return baseRow(mapping, {
      action: 'skip_title_guard_failed',
      document,
      url,
      newUrl: null,
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
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Existing Document URL guard failed; missing expected fragment "${urlMiss}".`,
    })
  }

  if (!url) {
    return baseRow(mapping, {
      action: 'skip_missing_url',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: 'Reviewed source URL was not fetched for the current plan.',
    })
  }

  const extractedText = url.text.trim()
  if (!extractedText) {
    return baseRow(mapping, {
      action: 'skip_no_url_text',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: url.error ? `Reviewed source URL has no extracted text: ${url.error}` : 'Reviewed source URL has no extracted text.',
    })
  }

  const extractedTextMiss = firstMissingNeedle(extractedText, mapping.expectedExtractedTextIncludes)
  if (extractedTextMiss) {
    return baseRow(mapping, {
      action: 'skip_extracted_text_guard_failed',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Extracted text guard failed; missing expected fragment "${extractedTextMiss}".`,
    })
  }

  if (url.wordCount < LOW_TEXT_WORD_FLOOR) {
    return baseRow(mapping, {
      action: 'skip_below_quality_floor',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed source URL remains below the ${LOW_TEXT_WORD_FLOOR}-word floor (${url.wordCount} words).`,
    })
  }

  const nextContent = mergeManualUrlMatch({
    extractedText,
    sourceUrl: mapping.sourceUrl,
    finalUrl: url.finalUrl,
    contentKind: url.contentKind,
    extractionMethod: url.extractionMethod,
    extractedWordCount: url.wordCount,
    reviewNote: mapping.reviewNote,
  })
  const newWordCount = countWords(nextContent)
  if (newWordCount <= document.wordCount) {
    return baseRow(mapping, {
      action: 'skip_no_gain',
      document,
      url,
      newUrl: null,
      nextContent: null,
      newWordCount: document.wordCount,
      reason: `Reviewed source URL does not improve existing word count (${document.wordCount} -> ${newWordCount} words).`,
    })
  }

  return baseRow(mapping, {
    action: 'update',
    document,
    url,
    newUrl: mapping.sourceUrl,
    nextContent,
    newWordCount,
    reason: `Document can be linked to reviewed source URL (${document.wordCount} -> ${newWordCount} words).`,
  })
}

function baseRow(
  mapping: LibraryAnalysisManualUrlMatchRepairMapping,
  values: {
    action: LibraryAnalysisManualUrlMatchRepairAction
    document: LibraryAnalysisManualUrlMatchRepairDocument | null
    url: LibraryAnalysisManualUrlMatchRepairUrl | null
    newUrl: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisManualUrlMatchRepairPlanRow {
  const existingWordCount = values.document?.wordCount ?? 0
  return {
    sourceKey: mapping.sourceKey,
    documentId: mapping.documentId,
    title: mapping.title,
    sourceUrl: mapping.sourceUrl,
    finalUrl: values.url?.finalUrl ?? null,
    action: values.action,
    existingUrl: values.document?.url ?? null,
    newUrl: values.newUrl,
    existingWordCount,
    extractedWordCount: values.url?.wordCount ?? 0,
    newWordCount: values.newWordCount,
    wordGain: Math.max(0, values.newWordCount - existingWordCount),
    contentKind: values.url?.contentKind ?? null,
    extractionMethod: values.url?.extractionMethod ?? null,
    contentHashBefore: values.document ? sha256(values.document.content.trim()) : null,
    contentHashAfter: values.nextContent ? sha256(values.nextContent) : null,
    nextContent: values.nextContent,
    reason: values.reason,
    reviewNote: mapping.reviewNote,
  }
}

function mergeManualUrlMatch(input: {
  extractedText: string
  sourceUrl: string
  finalUrl: string | null
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  extractedWordCount: number
  reviewNote: string
}): string {
  return [
    '--- Manual URL source match ---',
    '',
    `Source URL: \`${input.sourceUrl}\``,
    input.finalUrl && input.finalUrl !== input.sourceUrl ? `Final URL: \`${input.finalUrl}\`` : '',
    `Content kind: \`${input.contentKind}\``,
    `Extraction method: \`${input.extractionMethod}\``,
    `Extracted words: ${input.extractedWordCount}`,
    `Reviewed note: ${input.reviewNote}`,
    '',
    input.extractedText,
  ].filter(part => part !== '').join('\n')
}

function firstMissingNeedle(value: string, needles: string[] | undefined): string | null {
  if (!needles || needles.length === 0) return null
  const normalizedValue = value.toLowerCase()
  return needles.find(needle => !normalizedValue.includes(needle.toLowerCase())) ?? null
}

function comparePlanRows(
  a: LibraryAnalysisManualUrlMatchRepairPlanRow,
  b: LibraryAnalysisManualUrlMatchRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisManualUrlMatchRepairAction, number> = {
    update: 0,
    skip_below_quality_floor: 1,
    skip_no_gain: 2,
    skip_no_url_text: 3,
    skip_extracted_text_guard_failed: 4,
    skip_missing_url: 5,
    skip_existing_url_guard_failed: 6,
    skip_title_guard_failed: 7,
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
