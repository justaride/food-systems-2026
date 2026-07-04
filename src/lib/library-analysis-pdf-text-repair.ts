import { createHash } from 'node:crypto'
import type { LibraryAnalysisPdfExtractionStatus } from './library-analysis-pdf-extraction-profile'

export const LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-pdf-text-repair-plan.md'
export const LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-pdf-text-repair-plan.json'

export type LibraryAnalysisPdfTextRepairInput = {
  sourceKey: string
  documentId: string | null
  title: string
  path: string
  existingContent: string
  existingWordCount: number
  extractedText: string
  extractedWordCount: number
  extractionStatus: LibraryAnalysisPdfExtractionStatus
}

export type LibraryAnalysisPdfTextRepairAction =
  | 'skip_no_document'
  | 'skip_no_extracted_text'
  | 'skip_no_gain'
  | 'update'

export type LibraryAnalysisPdfTextRepairPlanRow = {
  sourceKey: string
  documentId: string | null
  title: string
  path: string
  action: LibraryAnalysisPdfTextRepairAction
  extractionStatus: LibraryAnalysisPdfExtractionStatus
  existingWordCount: number
  extractedWordCount: number
  newWordCount: number
  wordGain: number
  contentHashBefore: string
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
}

export type LibraryAnalysisPdfTextRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisPdfTextRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    updateRows: number
    totalWordGain: number
  }
}

export type BuildLibraryAnalysisPdfTextRepairPlanOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisPdfTextRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisPdfTextRepairPlan(
  rows: LibraryAnalysisPdfTextRepairInput[],
  options: BuildLibraryAnalysisPdfTextRepairPlanOptions = {},
): LibraryAnalysisPdfTextRepairPlan {
  const planRows = rows
    .map(toPlanRow)
    .sort(comparePlanRows)

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    total: planRows.length,
    rows: planRows,
    summary: {
      byAction: countBy(planRows, row => row.action),
      updateRows: planRows.filter(row => row.action === 'update').length,
      totalWordGain: planRows
        .filter(row => row.action === 'update')
        .reduce((sum, row) => sum + row.wordGain, 0),
    },
  }
}

export function formatLibraryAnalysisPdfTextRepairPlanMarkdown(
  plan: LibraryAnalysisPdfTextRepairPlan,
  options: FormatLibraryAnalysisPdfTextRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis PDF Text Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for aa reparere lavtekst-PDF-er ved aa oppdatere Document.content og Document.wordCount med lokalt pdftotext-uttrekk. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
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
    '',
    '### Action',
    '',
    formatCountTable(plan.summary.byAction),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${plan.total}`,
    '',
    '| Action | Existing words | Extracted words | New words | Gain | Title | Path | Reason |',
    '|---|---:|---:|---:|---:|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      String(row.existingWordCount),
      String(row.extractedWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.path),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(row: LibraryAnalysisPdfTextRepairInput): LibraryAnalysisPdfTextRepairPlanRow {
  const existingContent = row.existingContent.trim()
  const extractedText = row.extractedText.trim()
  const contentHashBefore = sha256(existingContent)

  if (!row.documentId) {
    return baseRow(row, {
      action: 'skip_no_document',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: 'No linked Document id; repair requires a deterministic document target.',
    })
  }

  if (!extractedText) {
    return baseRow(row, {
      action: 'skip_no_extracted_text',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: 'pdftotext produced no text to append.',
    })
  }

  if (row.extractedWordCount <= row.existingWordCount) {
    return baseRow(row, {
      action: 'skip_no_gain',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Extracted text does not improve existing word count (${row.existingWordCount} -> ${row.extractedWordCount} extracted words).`,
    })
  }

  const nextContent = mergePdfExtractedText({
    existingContent,
    extractedText,
    path: row.path,
    extractedWordCount: row.extractedWordCount,
  })
  const newWordCount = countWords(nextContent)
  if (newWordCount <= row.existingWordCount) {
    return baseRow(row, {
      action: 'skip_no_gain',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Extracted text does not improve existing word count (${row.existingWordCount} -> ${newWordCount} words).`,
    })
  }

  return baseRow(row, {
    action: 'update',
    contentHashBefore,
    contentHashAfter: sha256(nextContent),
    nextContent,
    newWordCount,
    reason: `Document.content can be updated (${row.existingWordCount} -> ${newWordCount} words).`,
  })
}

function baseRow(
  row: LibraryAnalysisPdfTextRepairInput,
  values: {
    action: LibraryAnalysisPdfTextRepairAction
    contentHashBefore: string
    contentHashAfter: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisPdfTextRepairPlanRow {
  return {
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    title: row.title,
    path: row.path,
    action: values.action,
    extractionStatus: row.extractionStatus,
    existingWordCount: row.existingWordCount,
    extractedWordCount: row.extractedWordCount,
    newWordCount: values.newWordCount,
    wordGain: Math.max(0, values.newWordCount - row.existingWordCount),
    contentHashBefore: values.contentHashBefore,
    contentHashAfter: values.contentHashAfter,
    nextContent: values.nextContent,
    reason: values.reason,
  }
}

function mergePdfExtractedText(input: {
  existingContent: string
  extractedText: string
  path: string
  extractedWordCount: number
}): string {
  return [
    input.existingContent,
    '',
    '--- PDF text extraction (pdftotext -layout) ---',
    '',
    `Source PDF: \`${input.path}\``,
    `Extracted words: ${input.extractedWordCount}`,
    '',
    input.extractedText,
  ].filter(part => part !== '').join('\n')
}

function comparePlanRows(
  a: LibraryAnalysisPdfTextRepairPlanRow,
  b: LibraryAnalysisPdfTextRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisPdfTextRepairAction, number> = {
    update: 0,
    skip_no_extracted_text: 1,
    skip_no_gain: 2,
    skip_no_document: 3,
  }
  const actionDiff = actionOrder[a.action] - actionOrder[b.action]
  if (actionDiff !== 0) return actionDiff
  const gainDiff = b.wordGain - a.wordGain
  if (gainDiff !== 0) return gainDiff
  return a.title.localeCompare(b.title)
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function countBy<T>(rows: T[], keyFn: (row: T) => string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const key = keyFn(row)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function formatCountTable(counts: Record<string, number>): string {
  return [
    '| Value | Count |',
    '|---|---:|',
    ...Object.entries(counts).map(([key, count]) => `| ${escapeMarkdownCell(key)} | ${count} |`),
  ].join('\n')
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replace(/\s+/g, ' ').trim()
}
