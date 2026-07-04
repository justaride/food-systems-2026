import { createHash } from 'node:crypto'
import type { LibraryAnalysisRepairBatch } from './library-analysis-repair-backlog'

export const LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH =
  'research/_status/library-analysis-local-text-repair-plan.md'
export const LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH =
  'research/_status/library-analysis-local-text-repair-plan.json'

const LOW_TEXT_WORD_FLOOR = 150
const SUPPORTED_LOCAL_TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.tsv'])

export type LibraryAnalysisLocalTextRepairInput = {
  sourceKey: string
  documentId: string | null
  title: string
  path: string
  extension: string
  repairBatch: LibraryAnalysisRepairBatch | string
  existingContent: string
  existingWordCount: number
  fileText: string
  fileWordCount: number
}

export type LibraryAnalysisLocalTextRepairAction =
  | 'skip_below_quality_floor'
  | 'skip_no_document'
  | 'skip_no_file_text'
  | 'skip_no_gain'
  | 'skip_unsupported_extension'
  | 'update'

export type LibraryAnalysisLocalTextRepairPlanRow = {
  sourceKey: string
  documentId: string | null
  title: string
  path: string
  extension: string
  repairBatch: string
  action: LibraryAnalysisLocalTextRepairAction
  existingWordCount: number
  fileWordCount: number
  newWordCount: number
  wordGain: number
  contentHashBefore: string
  contentHashAfter: string | null
  nextContent: string | null
  reason: string
}

export type LibraryAnalysisLocalTextRepairPlan = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisLocalTextRepairPlanRow[]
  summary: {
    byAction: Record<string, number>
    byRepairBatch: Record<string, number>
    updateRows: number
    totalWordGain: number
    clearsLowTextRows: number
  }
}

export type BuildLibraryAnalysisLocalTextRepairPlanOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisLocalTextRepairPlanMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisLocalTextRepairPlan(
  rows: LibraryAnalysisLocalTextRepairInput[],
  options: BuildLibraryAnalysisLocalTextRepairPlanOptions = {},
): LibraryAnalysisLocalTextRepairPlan {
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
      updateRows: updateRows.length,
      totalWordGain: updateRows.reduce((sum, row) => sum + row.wordGain, 0),
      clearsLowTextRows: updateRows.filter(row => row.fileWordCount >= LOW_TEXT_WORD_FLOOR).length,
    },
  }
}

export function formatLibraryAnalysisLocalTextRepairPlanMarkdown(
  plan: LibraryAnalysisLocalTextRepairPlan,
  options: FormatLibraryAnalysisLocalTextRepairPlanMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = plan.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Local Text Repair Plan',
    '',
    `Generated: ${plan.generatedAt}`,
    '',
    'Dette er en kontrollert plan for aa reparere lavtekst-rader der en lokal tekstfil har mer komplett innhold enn Document.content. Den oppdaterer bare Document.content og Document.wordCount naar raafilteksten krysser 150-ordsgrensen. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
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
    '### Repair Batch',
    '',
    formatCountTable(plan.summary.byRepairBatch),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${plan.total}`,
    '',
    '| Action | Existing words | File words | New words | Gain | Batch | Title | Path | Reason |',
    '|---|---:|---:|---:|---:|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.action,
      String(row.existingWordCount),
      String(row.fileWordCount),
      String(row.newWordCount),
      String(row.wordGain),
      row.repairBatch,
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.path),
      escapeMarkdownCell(row.reason),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toPlanRow(row: LibraryAnalysisLocalTextRepairInput): LibraryAnalysisLocalTextRepairPlanRow {
  const existingContent = row.existingContent.trim()
  const fileText = row.fileText.trim()
  const contentHashBefore = sha256(existingContent)

  if (!row.documentId) {
    return baseRow(row, {
      action: 'skip_no_document',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: 'No linked Document id; local text sync requires a deterministic document target.',
    })
  }

  if (!SUPPORTED_LOCAL_TEXT_EXTENSIONS.has(row.extension)) {
    return baseRow(row, {
      action: 'skip_unsupported_extension',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Unsupported local text extension ${row.extension}; use a dedicated extractor first.`,
    })
  }

  if (!fileText) {
    return baseRow(row, {
      action: 'skip_no_file_text',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: 'Local file contains no text to sync.',
    })
  }

  if (row.fileWordCount <= row.existingWordCount) {
    return baseRow(row, {
      action: 'skip_no_gain',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Local file text does not improve existing word count (${row.existingWordCount} -> ${row.fileWordCount} file words).`,
    })
  }

  if (row.fileWordCount < LOW_TEXT_WORD_FLOOR) {
    return baseRow(row, {
      action: 'skip_below_quality_floor',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Local file has more text but remains below the ${LOW_TEXT_WORD_FLOOR}-word review floor (${row.existingWordCount} -> ${row.fileWordCount} file words).`,
    })
  }

  const nextContent = mergeLocalFileText({
    fileText,
    path: row.path,
    fileWordCount: row.fileWordCount,
  })
  const newWordCount = countWords(nextContent)

  if (newWordCount <= row.existingWordCount) {
    return baseRow(row, {
      action: 'skip_no_gain',
      contentHashBefore,
      contentHashAfter: null,
      nextContent: null,
      newWordCount: row.existingWordCount,
      reason: `Local file text does not improve existing word count (${row.existingWordCount} -> ${newWordCount} words).`,
    })
  }

  return baseRow(row, {
    action: 'update',
    contentHashBefore,
    contentHashAfter: sha256(nextContent),
    nextContent,
    newWordCount,
    reason: `Document.content can be updated from local file (${row.existingWordCount} -> ${newWordCount} words).`,
  })
}

function baseRow(
  row: LibraryAnalysisLocalTextRepairInput,
  values: {
    action: LibraryAnalysisLocalTextRepairAction
    contentHashBefore: string
    contentHashAfter: string | null
    nextContent: string | null
    newWordCount: number
    reason: string
  },
): LibraryAnalysisLocalTextRepairPlanRow {
  return {
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    title: row.title,
    path: row.path,
    extension: row.extension,
    repairBatch: row.repairBatch,
    action: values.action,
    existingWordCount: row.existingWordCount,
    fileWordCount: row.fileWordCount,
    newWordCount: values.newWordCount,
    wordGain: Math.max(0, values.newWordCount - row.existingWordCount),
    contentHashBefore: values.contentHashBefore,
    contentHashAfter: values.contentHashAfter,
    nextContent: values.nextContent,
    reason: values.reason,
  }
}

function mergeLocalFileText(input: {
  fileText: string
  path: string
  fileWordCount: number
}): string {
  return [
    '--- Local file text sync ---',
    '',
    `Source file: \`${input.path}\``,
    `File words: ${input.fileWordCount}`,
    '',
    input.fileText,
  ].join('\n')
}

function comparePlanRows(
  a: LibraryAnalysisLocalTextRepairPlanRow,
  b: LibraryAnalysisLocalTextRepairPlanRow,
): number {
  const actionOrder: Record<LibraryAnalysisLocalTextRepairAction, number> = {
    update: 0,
    skip_below_quality_floor: 1,
    skip_no_gain: 2,
    skip_no_file_text: 3,
    skip_unsupported_extension: 4,
    skip_no_document: 5,
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
