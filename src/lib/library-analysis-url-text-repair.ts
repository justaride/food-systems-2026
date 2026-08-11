import { createHash } from 'node:crypto'
import type {
  LibraryAnalysisUrlContentKind,
  LibraryAnalysisUrlExtractionMethod,
  LibraryAnalysisUrlTextExtractionStatus,
} from './library-analysis-url-text-extraction-profile'

export const LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-url-text-repair-plan.md'
export const LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-url-text-repair-plan.json'

export type LibraryAnalysisUrlTextRepairInput = {
  sourceKey: string
  documentId: string | null
  existingUpdatedAt: string | null
  title: string
  repairBatch: string
  url: string | null
  finalUrl: string | null
  existingContent: string
  existingWordCount: number
  extractedText: string
  extractedWordCount: number
  extractionStatus: LibraryAnalysisUrlTextExtractionStatus
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
}

export type LibraryAnalysisUrlTextRepairAction =
  | 'skip_no_document'
  | 'skip_no_extracted_text'
  | 'skip_no_gain'
  | 'skip_not_extractable'
  | 'update'

export type LibraryAnalysisUrlTextRepairPlanRow = {
  sourceKey: string
  documentId: string | null
  expectedUpdatedAt: string | null
  title: string
  repairBatch: string
  url: string | null
  finalUrl: string | null
  action: LibraryAnalysisUrlTextRepairAction
  extractionStatus: LibraryAnalysisUrlTextExtractionStatus
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  existingWordCount: number
  extractedWordCount: number
  newWordCount: number
  wordGain: number
  contentHashBefore: string
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
}

export type LibraryAnalysisUrlTextRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisUrlTextRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    byRepairBatch: Record<string, number>
    byContentKind: Record<string, number>
    updateRows: number
    totalWordGain: number
    clearsLowTextRows: number
  }
}

export type BuildLibraryAnalysisUrlTextRepairPlanOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisUrlTextRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisUrlTextRepairPlan(
  rows: LibraryAnalysisUrlTextRepairInput[],
  options: BuildLibraryAnalysisUrlTextRepairPlanOptions = {},
): LibraryAnalysisUrlTextRepairPlan {
  const planRows = rows
    .map(toPlanRow)
    .sort(comparePlanRows)
  const updateRows = planRows.filter(row => row.action === 'update')

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    total: planRows.length,
    rows: planRows,
    summary: {
      byAction: countBy(planRows, row => row.action),
      byRepairBatch: countBy(planRows, row => row.repairBatch),
      byContentKind: countBy(planRows, row => row.contentKind),
      updateRows: updateRows.length,
      totalWordGain: updateRows.reduce((sum, row) => sum + row.wordGain, 0),
      clearsLowTextRows: updateRows.filter(row => row.newWordCount >= 150).length,
    },
  }
}

export function formatLibraryAnalysisUrlTextRepairPlanMarkdown(
  plan: LibraryAnalysisUrlTextRepairPlan,
  options: FormatLibraryAnalysisUrlTextRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis URL Text Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for aa reparere URL-backed lavtekst-rader ved aa oppdatere Document.content og Document.wordCount med refetchet PDF/HTML/tekst-uttrekk. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
    'Hver oppdatering er bundet til Document.updatedAt, wordCount og content fra denne planen. Apply avbryter hele batchen dersom en target-rad har endret seg etter planlegging.',
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
    '### Content Kind',
    '',
    formatCountTable(plan.summary.byContentKind),
    '',
    '### Repair Batch',
    '',
    formatCountTable(plan.summary.byRepairBatch),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${plan.total}`,
    '',
    '| Action | Kind | Existing words | Extracted words | New words | Gain | Batch | Title | URL | Reason |',
    '|---|---|---:|---:|---:|---:|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      row.contentKind,
      String(row.existingWordCount),
      String(row.extractedWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      row.repairBatch,
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.finalUrl ?? row.url ?? ''),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(row: LibraryAnalysisUrlTextRepairInput): LibraryAnalysisUrlTextRepairPlanRow {
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
      reason: 'No linked Document id; URL text repair requires a deterministic document target.',
    })
  }

  if (!isExtractable(row.extractionStatus)) {
    return baseRow(row, {
      action: 'skip_not_extractable',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Extraction status ${row.extractionStatus} is not eligible for automatic URL text repair.`,
    })
  }

  if (!extractedText) {
    return baseRow(row, {
      action: 'skip_no_extracted_text',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: 'URL extraction produced no text to append.',
    })
  }

  if (row.extractedWordCount <= row.existingWordCount) {
    return baseRow(row, {
      action: 'skip_no_gain',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `URL text does not improve existing word count (${row.existingWordCount} -> ${row.extractedWordCount} extracted words).`,
    })
  }

  const nextContent = mergeUrlExtractedText({
    existingContent,
    extractedText,
    url: row.url,
    finalUrl: row.finalUrl,
    contentKind: row.contentKind,
    extractionMethod: row.extractionMethod,
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
      reason: `URL text does not improve existing word count (${row.existingWordCount} -> ${newWordCount} words).`,
    })
  }

  return baseRow(row, {
    action: 'update',
    contentHashBefore,
    contentHashAfter: sha256(nextContent),
    nextContent,
    newWordCount,
    reason: `Document.content can be updated from URL text (${row.existingWordCount} -> ${newWordCount} words).`,
  })
}

function baseRow(
  row: LibraryAnalysisUrlTextRepairInput,
  values: {
    action: LibraryAnalysisUrlTextRepairAction
    contentHashBefore: string
    contentHashAfter: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisUrlTextRepairPlanRow {
  return {
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    expectedUpdatedAt: row.existingUpdatedAt,
    title: row.title,
    repairBatch: row.repairBatch,
    url: row.url,
    finalUrl: row.finalUrl,
    action: values.action,
    extractionStatus: row.extractionStatus,
    contentKind: row.contentKind,
    extractionMethod: row.extractionMethod,
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

function mergeUrlExtractedText(input: {
  existingContent: string
  extractedText: string
  url: string | null
  finalUrl: string | null
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  extractedWordCount: number
}): string {
  return [
    input.existingContent,
    '',
    '--- URL text extraction ---',
    '',
    `Source URL: \`${input.url ?? ''}\``,
    input.finalUrl && input.finalUrl !== input.url ? `Final URL: \`${input.finalUrl}\`` : '',
    `Content kind: \`${input.contentKind}\``,
    `Extraction method: \`${input.extractionMethod}\``,
    `Extracted words: ${input.extractedWordCount}`,
    '',
    input.extractedText,
  ].filter(part => part !== '').join('\n')
}

function isExtractable(status: LibraryAnalysisUrlTextExtractionStatus): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
}

function comparePlanRows(
  a: LibraryAnalysisUrlTextRepairPlanRow,
  b: LibraryAnalysisUrlTextRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisUrlTextRepairAction, number> = {
    update: 0,
    skip_no_extracted_text: 1,
    skip_no_gain: 2,
    skip_not_extractable: 3,
    skip_no_document: 4,
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
