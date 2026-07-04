export const LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH =
  'research/_status/library-analysis-url-text-extraction-profile.md'
export const LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH =
  'research/_status/library-analysis-url-text-extraction-profile.json'

export type LibraryAnalysisUrlFetchStatus =
  | 'fetch_error'
  | 'http_error'
  | 'missing_url'
  | 'ok'
  | 'too_large'

export type LibraryAnalysisUrlContentKind =
  | 'html'
  | 'pdf'
  | 'text'
  | 'unknown'
  | 'unsupported'

export type LibraryAnalysisUrlExtractionMethod =
  | 'html_text'
  | 'none'
  | 'pdf_pdftotext'
  | 'plain_text'

export type LibraryAnalysisUrlTextExtractionStatus =
  | 'extractable_150_499'
  | 'extractable_500_plus'
  | 'fetch_failed'
  | 'http_error'
  | 'missing_url'
  | 'no_extracted_text'
  | 'no_gain'
  | 'small_text'
  | 'too_large'
  | 'unsupported_content_type'

export type LibraryAnalysisUrlTextExtractionProfileInput = {
  sourceKey: string
  documentId: string | null
  title: string
  repairBatch: string
  url: string | null
  finalUrl: string | null
  existingWordCount: number
  fetchStatus: LibraryAnalysisUrlFetchStatus
  httpStatus: number | null
  contentType: string | null
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  byteLength: number
  extractedWordCount: number
  extractedContentHash: string | null
  error: string | null
}

export type LibraryAnalysisUrlTextExtractionProfileRow =
  LibraryAnalysisUrlTextExtractionProfileInput & {
    status: LibraryAnalysisUrlTextExtractionStatus
    wordGain: number
    recommendedAction: string
    claimUseNote: string
  }

export type LibraryAnalysisUrlTextExtractionProfile = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisUrlTextExtractionProfileRow[]
  summary: {
    byStatus: Record<string, number>
    byContentKind: Record<string, number>
    byRepairBatch: Record<string, number>
    extractableRows: number
    mechanicalRepairCandidates: number
    totalExtractedWords: number
  }
}

export type BuildLibraryAnalysisUrlTextExtractionProfileOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisUrlTextExtractionProfileMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export type LibraryAnalysisUrlTextExtractionLocatorCandidate = {
  sourceKey: string
  documentId: string | null
  title: string
  repairBatch: string
  locatorStatus: string
  documentUrl: string | null
  documentArchivedUrl: string | null
  sourceDocUrl: string | null
  sourceDocDoi: string | null
  sourceDocArchivedUrl: string | null
}

export type LibraryAnalysisUrlTextExtractionBacklogCandidate = {
  sourceKey: string
  documentId: string | null
  title: string
  repairKind: string
  repairBatch: string
}

export type LibraryAnalysisUrlTextExtractionDocumentLocator = {
  id: string
  wordCount: number
  url: string | null
  archivedUrl: string | null
  sourceDoc: {
    url: string | null
    doi: string | null
    archivedUrl: string | null
  } | null
  sourceCitations: {
    url: string | null
    archivedUrl: string | null
  }[]
}

export type LibraryAnalysisUrlTextExtractionTarget = {
  sourceKey: string
  documentId: string | null
  title: string
  repairBatch: string
  url: string
  existingWordCount: number
}

export type BuildLibraryAnalysisUrlTextExtractionTargetsOptions = {
  locatorRows: LibraryAnalysisUrlTextExtractionLocatorCandidate[]
  backlogRows: LibraryAnalysisUrlTextExtractionBacklogCandidate[]
  documents: LibraryAnalysisUrlTextExtractionDocumentLocator[]
  limit?: number | null
}

export function buildLibraryAnalysisUrlTextExtractionTargets(
  options: BuildLibraryAnalysisUrlTextExtractionTargetsOptions,
): LibraryAnalysisUrlTextExtractionTarget[] {
  const documentById = new Map(options.documents.map(document => [document.id, document]))
  const targets = new Map<string, LibraryAnalysisUrlTextExtractionTarget>()

  for (const row of options.locatorRows) {
    if (row.locatorStatus !== 'url_backed_no_local_file') continue
    addTarget(targets, toTarget(row, documentById.get(row.documentId ?? '')))
  }

  for (const row of options.backlogRows) {
    if (row.repairKind !== 'existing_low_text') continue
    addTarget(targets, toTarget(row, documentById.get(row.documentId ?? '')))
  }

  const selected = [...targets.values()]
  return options.limit ? selected.slice(0, options.limit) : selected
}

export function buildLibraryAnalysisUrlTextExtractionProfile(
  rows: LibraryAnalysisUrlTextExtractionProfileInput[],
  options: BuildLibraryAnalysisUrlTextExtractionProfileOptions = {},
): LibraryAnalysisUrlTextExtractionProfile {
  const profileRows = rows
    .map(toProfileRow)
    .sort(compareRows)
  const extractableRows = profileRows.filter(row => isExtractable(row.status))

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    total: profileRows.length,
    rows: profileRows,
    summary: {
      byStatus: countBy(profileRows, row => row.status),
      byContentKind: countBy(profileRows, row => row.contentKind),
      byRepairBatch: countBy(profileRows, row => row.repairBatch),
      extractableRows: extractableRows.length,
      mechanicalRepairCandidates: extractableRows.filter(row => row.wordGain > 0).length,
      totalExtractedWords: profileRows.reduce((sum, row) => sum + row.extractedWordCount, 0),
    },
  }
}

export function formatLibraryAnalysisUrlTextExtractionProfileMarkdown(
  profile: LibraryAnalysisUrlTextExtractionProfile,
  options: FormatLibraryAnalysisUrlTextExtractionProfileMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = profile.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis URL Text Extraction Profile',
    '',
    `Generated: ${profile.generatedAt}`,
    '',
    'Dette er en read-only profil for URL-backed library-analysis-rader uten lokal fil. Den henter og teller tekst for aa skille mekaniske tekstkandidater fra URL-er som maa lastes ned, parseres eller vurderes manuelt. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total rows | ${profile.total} |`,
    `| Extractable rows | ${profile.summary.extractableRows} |`,
    `| Mechanical repair candidates | ${profile.summary.mechanicalRepairCandidates} |`,
    `| Total extracted words | ${profile.summary.totalExtractedWords} |`,
    '',
    '### Extraction Status',
    '',
    formatCountTable(profile.summary.byStatus),
    '',
    '### Content Kind',
    '',
    formatCountTable(profile.summary.byContentKind),
    '',
    '### Repair Batch',
    '',
    formatCountTable(profile.summary.byRepairBatch),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${profile.total}`,
    '',
    '| Status | Kind | Existing words | Extracted words | Gain | HTTP | Title | URL | Action |',
    '|---|---|---:|---:|---:|---:|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.status,
      row.contentKind,
      String(row.existingWordCount),
      String(row.extractedWordCount),
      String(row.wordGain),
      row.httpStatus === null ? '' : String(row.httpStatus),
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.finalUrl ?? row.url ?? ''),
      escapeMarkdownCell(row.recommendedAction),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toProfileRow(
  row: LibraryAnalysisUrlTextExtractionProfileInput,
): LibraryAnalysisUrlTextExtractionProfileRow {
  const status = statusFor(row)
  return {
    ...row,
    status,
    wordGain: Math.max(0, row.extractedWordCount - row.existingWordCount),
    recommendedAction: recommendedActionFor(status),
    claimUseNote: 'Ingen claim-bruk uten PCQ/claim-lock, gate:overclaim og audit:citable for konkret utsagn.',
  }
}

function statusFor(row: LibraryAnalysisUrlTextExtractionProfileInput): LibraryAnalysisUrlTextExtractionStatus {
  if (!row.url || row.fetchStatus === 'missing_url') return 'missing_url'
  if (row.fetchStatus === 'fetch_error') return 'fetch_failed'
  if (row.fetchStatus === 'http_error') return 'http_error'
  if (row.fetchStatus === 'too_large') return 'too_large'
  if (row.contentKind === 'unsupported' || row.extractionMethod === 'none') return 'unsupported_content_type'
  if (row.extractedWordCount === 0) return 'no_extracted_text'
  if (row.extractedWordCount <= row.existingWordCount) return 'no_gain'
  if (row.extractedWordCount < 150) return 'small_text'
  if (row.extractedWordCount >= 500) return 'extractable_500_plus'
  return 'extractable_150_499'
}

function recommendedActionFor(status: LibraryAnalysisUrlTextExtractionStatus): string {
  if (isExtractable(status)) {
    return 'Eligible for a controlled URL text repair plan with backup before Document.content update.'
  }
  if (status === 'small_text') {
    return 'Keep in review queue; fetched text remains below the low-text floor.'
  }
  if (status === 'unsupported_content_type') {
    return 'Use a dedicated extractor or manual download workflow before DB repair.'
  }
  if (status === 'http_error' || status === 'fetch_failed') {
    return 'Retry or manually verify URL before treating it as a source gap.'
  }
  if (status === 'too_large') {
    return 'Route to manual download/extraction to avoid uncontrolled artifact size.'
  }
  if (status === 'missing_url') {
    return 'Find a deterministic URL or local source before text repair.'
  }
  if (status === 'no_gain') {
    return 'Skip automatic repair; extracted text does not improve existing content.'
  }
  return 'Manual review required before text repair.'
}

function addTarget(
  targets: Map<string, LibraryAnalysisUrlTextExtractionTarget>,
  target: LibraryAnalysisUrlTextExtractionTarget | null,
) {
  if (!target || targets.has(target.sourceKey)) return
  targets.set(target.sourceKey, target)
}

function toTarget(
  row: LibraryAnalysisUrlTextExtractionLocatorCandidate | LibraryAnalysisUrlTextExtractionBacklogCandidate,
  document: LibraryAnalysisUrlTextExtractionDocumentLocator | undefined,
): LibraryAnalysisUrlTextExtractionTarget | null {
  const url = effectiveUrl(row, document)
  if (!url) return null

  return {
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    title: row.title,
    repairBatch: row.repairBatch,
    url,
    existingWordCount: document?.wordCount ?? 0,
  }
}

function effectiveUrl(
  row: LibraryAnalysisUrlTextExtractionLocatorCandidate | LibraryAnalysisUrlTextExtractionBacklogCandidate,
  document: LibraryAnalysisUrlTextExtractionDocumentLocator | undefined,
): string | null {
  const rowUrlFacts = 'documentUrl' in row
    ? {
        documentUrl: row.documentUrl,
        documentArchivedUrl: row.documentArchivedUrl,
        sourceDocUrl: row.sourceDocUrl,
        sourceDocDoi: row.sourceDocDoi,
        sourceDocArchivedUrl: row.sourceDocArchivedUrl,
      }
    : {
        documentUrl: null,
        documentArchivedUrl: null,
        sourceDocUrl: null,
        sourceDocDoi: null,
        sourceDocArchivedUrl: null,
      }
  const citationUrl = document?.sourceCitations.find(citation => citation.url)?.url ?? null
  const citationArchivedUrl = document?.sourceCitations.find(citation => citation.archivedUrl)?.archivedUrl ?? null

  return rowUrlFacts.documentUrl ??
    document?.url ??
    rowUrlFacts.documentArchivedUrl ??
    document?.archivedUrl ??
    rowUrlFacts.sourceDocUrl ??
    document?.sourceDoc?.url ??
    doiUrl(rowUrlFacts.sourceDocDoi ?? document?.sourceDoc?.doi ?? null) ??
    rowUrlFacts.sourceDocArchivedUrl ??
    document?.sourceDoc?.archivedUrl ??
    citationUrl ??
    citationArchivedUrl ??
    null
}

function doiUrl(doi: string | null): string | null {
  if (!doi) return null
  return `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}`
}

function isExtractable(status: LibraryAnalysisUrlTextExtractionStatus): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
}

function compareRows(
  a: LibraryAnalysisUrlTextExtractionProfileRow,
  b: LibraryAnalysisUrlTextExtractionProfileRow,
): number {
  const statusOrder: Record<LibraryAnalysisUrlTextExtractionStatus, number> = {
    extractable_500_plus: 0,
    extractable_150_499: 1,
    small_text: 2,
    no_gain: 3,
    no_extracted_text: 4,
    unsupported_content_type: 5,
    too_large: 6,
    http_error: 7,
    fetch_failed: 8,
    missing_url: 9,
  }
  const statusDiff = statusOrder[a.status] - statusOrder[b.status]
  if (statusDiff !== 0) return statusDiff
  const wordDiff = b.wordGain - a.wordGain
  if (wordDiff !== 0) return wordDiff
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
