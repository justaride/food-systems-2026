export const LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH =
  'research/_status/library-analysis-pdf-extraction-profile.md'
export const LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH =
  'research/_status/library-analysis-pdf-extraction-profile.json'

export type LibraryAnalysisPdfExtractionProfileInput = {
  sourceKey: string
  title: string
  wordCount: number
  repairBatch: string
  resolvedPath: string | null
  canonicalPath: string | null
}

export type LibraryAnalysisPdfExtractionProbe = {
  exitCode: number
  stderr: string
  text: string
}

export type LibraryAnalysisPdfExtractionStatus =
  | 'extract_failed'
  | 'extractable_150_499'
  | 'extractable_500_plus'
  | 'no_gain'
  | 'small_gain'

export type LibraryAnalysisPdfExtractionProfileRow = {
  sourceKey: string
  title: string
  path: string
  storedWordCount: number
  extractedWordCount: number
  wordGain: number
  status: LibraryAnalysisPdfExtractionStatus
  error: string | null
}

export type LibraryAnalysisPdfExtractionProfile = {
  total: number
  rows: LibraryAnalysisPdfExtractionProfileRow[]
  summary: {
    byStatus: Record<string, number>
    extractableRows: number
    mechanicalRepairCandidates: number
  }
}

export type FormatLibraryAnalysisPdfExtractionProfileMarkdownOptions = {
  generatedAt?: string
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisPdfExtractionProfile(
  rows: LibraryAnalysisPdfExtractionProfileInput[],
  extractText: (row: LibraryAnalysisPdfExtractionProfileInput & { path: string }) => LibraryAnalysisPdfExtractionProbe,
): LibraryAnalysisPdfExtractionProfile {
  const profileRows = rows
    .filter(row => row.repairBatch === 'pdf_text_extraction')
    .map(row => {
      const path = row.resolvedPath ?? row.canonicalPath ?? ''
      const probe = path ? extractText({ ...row, path }) : {
        exitCode: 1,
        stderr: 'missing PDF path',
        text: '',
      }
      const extractedWordCount = countWords(probe.text)
      const status = classifyExtractionStatus({
        exitCode: probe.exitCode,
        storedWordCount: row.wordCount,
        extractedWordCount,
      })

      return {
        sourceKey: row.sourceKey,
        title: row.title,
        path,
        storedWordCount: row.wordCount,
        extractedWordCount,
        wordGain: extractedWordCount - row.wordCount,
        status,
        error: probe.exitCode === 0 ? null : probe.stderr || 'pdftotext failed',
      }
    })
    .sort(compareProfileRows)

  return {
    total: profileRows.length,
    rows: profileRows,
    summary: {
      byStatus: countBy(profileRows, row => row.status),
      extractableRows: profileRows.filter(row =>
        row.status === 'extractable_150_499' || row.status === 'extractable_500_plus'
      ).length,
      mechanicalRepairCandidates: profileRows.filter(row =>
        row.status === 'extractable_150_499' ||
        row.status === 'extractable_500_plus' ||
        row.status === 'small_gain'
      ).length,
    },
  }
}

export function formatLibraryAnalysisPdfExtractionProfileMarkdown(
  profile: LibraryAnalysisPdfExtractionProfile,
  options: FormatLibraryAnalysisPdfExtractionProfileMarkdownOptions = {},
): string {
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = profile.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis PDF Extraction Profile',
    '',
    `Generated: ${generatedAt}`,
    '',
    'Dette er en read-only profil av PDF-rader i library-analysis repair-backloggen. Den endrer ikke Document.content, AI-kort, claim-kandidater eller citation-readiness.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total PDF repair rows | ${profile.total} |`,
    `| Extractable rows | ${profile.summary.extractableRows} |`,
    `| Mechanical repair candidates | ${profile.summary.mechanicalRepairCandidates} |`,
    '',
    '### Extraction Status',
    '',
    formatCountTable(profile.summary.byStatus),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${profile.total}`,
    '',
    '| Status | Stored words | Extracted words | Gain | Title | Path |',
    '|---|---:|---:|---:|---|---|',
    ...sampleRows.map(row => `| ${[
      row.status,
      String(row.storedWordCount),
      String(row.extractedWordCount),
      String(row.wordGain),
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.path),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function classifyExtractionStatus(input: {
  exitCode: number
  storedWordCount: number
  extractedWordCount: number
}): LibraryAnalysisPdfExtractionStatus {
  if (input.exitCode !== 0) return 'extract_failed'
  if (input.extractedWordCount >= 500) return 'extractable_500_plus'
  if (input.extractedWordCount >= 150) return 'extractable_150_499'
  if (input.extractedWordCount > input.storedWordCount) return 'small_gain'
  return 'no_gain'
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

function compareProfileRows(
  a: LibraryAnalysisPdfExtractionProfileRow,
  b: LibraryAnalysisPdfExtractionProfileRow,
): number {
  const statusOrder: Record<LibraryAnalysisPdfExtractionStatus, number> = {
    extractable_500_plus: 0,
    extractable_150_499: 1,
    small_gain: 2,
    no_gain: 3,
    extract_failed: 4,
  }
  const statusDiff = statusOrder[a.status] - statusOrder[b.status]
  if (statusDiff !== 0) return statusDiff
  const gainDiff = b.wordGain - a.wordGain
  if (gainDiff !== 0) return gainDiff
  return a.title.localeCompare(b.title)
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
