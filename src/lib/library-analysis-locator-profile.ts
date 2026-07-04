export const LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH =
  'research/_status/library-analysis-locator-profile.md'
export const LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH =
  'research/_status/library-analysis-locator-profile.json'

export type LibraryAnalysisLocatorStatus =
  | 'citation_backed_no_local_file'
  | 'locator_missing'
  | 'local_match_candidate'
  | 'url_backed_no_local_file'

export type LibraryAnalysisLocatorSignal =
  | 'citation_local_path'
  | 'citation_url'
  | 'document_archived_url'
  | 'document_url'
  | 'local_filename_match'
  | 'source_doc_archived_url'
  | 'source_doc_doi'
  | 'source_doc_url'

export type LibraryAnalysisLocatorProfileInput = {
  sourceKey: string
  title: string
  repairBatch: string
  documentId: string | null
  sourceDocId: string | null
  sourceDocFilename: string | null
  documentUrl: string | null
  documentArchivedUrl: string | null
  sourceDocUrl: string | null
  sourceDocDoi: string | null
  sourceDocArchivedUrl: string | null
  citationUrlCount: number
  citationLocalPathCount: number
  localFilenameMatches: string[]
}

export type LibraryAnalysisLocatorProfileRow = LibraryAnalysisLocatorProfileInput & {
  locatorStatus: LibraryAnalysisLocatorStatus
  locatorSignals: LibraryAnalysisLocatorSignal[]
  recommendedAction: string
  claimUseNote: string
}

export type LibraryAnalysisLocatorProfile = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisLocatorProfileRow[]
  summary: {
    byLocatorStatus: Record<string, number>
    byRepairBatch: Record<string, number>
    byLocatorSignal: Record<string, number>
    rowsWithExternalLocator: number
    localMatchCandidates: number
    trueLocatorGaps: number
  }
}

export type BuildLibraryAnalysisLocatorProfileOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisLocatorProfileMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisLocatorProfile(
  rows: LibraryAnalysisLocatorProfileInput[],
  options: BuildLibraryAnalysisLocatorProfileOptions = {},
): LibraryAnalysisLocatorProfile {
  const profileRows = rows
    .map(toProfileRow)
    .sort(compareRows)

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    total: profileRows.length,
    rows: profileRows,
    summary: {
      byLocatorStatus: countBy(profileRows, row => row.locatorStatus),
      byRepairBatch: countBy(profileRows, row => row.repairBatch),
      byLocatorSignal: countLocatorSignals(profileRows),
      rowsWithExternalLocator: profileRows.filter(row => hasExternalLocator(row.locatorSignals)).length,
      localMatchCandidates: profileRows.filter(row => row.locatorStatus === 'local_match_candidate').length,
      trueLocatorGaps: profileRows.filter(row => row.locatorStatus === 'locator_missing').length,
    },
  }
}

export function formatLibraryAnalysisLocatorProfileMarkdown(
  profile: LibraryAnalysisLocatorProfile,
  options: FormatLibraryAnalysisLocatorProfileMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = profile.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Locator Profile',
    '',
    `Generated: ${profile.generatedAt}`,
    '',
    'Dette er en read-only profil for no-path-rader i library-analysis-backloggen. Den skiller URL/DOI-backed dokumenter fra ekte locator-gap og lokale remap-kandidater. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total rows | ${profile.total} |`,
    `| Rows with external locator | ${profile.summary.rowsWithExternalLocator} |`,
    `| Local match candidates | ${profile.summary.localMatchCandidates} |`,
    `| True locator gaps | ${profile.summary.trueLocatorGaps} |`,
    '',
    '### Locator Status',
    '',
    formatCountTable(profile.summary.byLocatorStatus),
    '',
    '### Repair Batch',
    '',
    formatCountTable(profile.summary.byRepairBatch),
    '',
    '### Locator Signal',
    '',
    formatCountTable(profile.summary.byLocatorSignal),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${profile.total}`,
    '',
    '| Status | Batch | Title | Signals | SourceDoc filename | Local matches | Action |',
    '|---|---|---|---|---|---:|---|',
    ...sampleRows.map(row => `| ${[
      row.locatorStatus,
      row.repairBatch,
      escapeMarkdownCell(row.title),
      row.locatorSignals.join(', ') || 'none',
      escapeMarkdownCell(row.sourceDocFilename ?? ''),
      String(row.localFilenameMatches.length),
      escapeMarkdownCell(row.recommendedAction),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toProfileRow(row: LibraryAnalysisLocatorProfileInput): LibraryAnalysisLocatorProfileRow {
  const locatorSignals = locatorSignalsFor(row)
  const locatorStatus = locatorStatusFor(locatorSignals)

  return {
    ...row,
    locatorSignals,
    locatorStatus,
    recommendedAction: recommendedActionFor(locatorStatus),
    claimUseNote: 'Ingen claim-bruk uten PCQ/claim-lock, gate:overclaim og audit:citable for konkret utsagn.',
  }
}

function locatorSignalsFor(row: LibraryAnalysisLocatorProfileInput): LibraryAnalysisLocatorSignal[] {
  return [
    ...(row.localFilenameMatches.length > 0 ? ['local_filename_match' as const] : []),
    ...(row.citationLocalPathCount > 0 ? ['citation_local_path' as const] : []),
    ...(row.citationUrlCount > 0 ? ['citation_url' as const] : []),
    ...(row.documentUrl ? ['document_url' as const] : []),
    ...(row.documentArchivedUrl ? ['document_archived_url' as const] : []),
    ...(row.sourceDocUrl ? ['source_doc_url' as const] : []),
    ...(row.sourceDocDoi ? ['source_doc_doi' as const] : []),
    ...(row.sourceDocArchivedUrl ? ['source_doc_archived_url' as const] : []),
  ]
}

function locatorStatusFor(signals: LibraryAnalysisLocatorSignal[]): LibraryAnalysisLocatorStatus {
  if (signals.includes('local_filename_match')) return 'local_match_candidate'
  if (signals.includes('citation_local_path') || signals.includes('citation_url')) {
    return 'citation_backed_no_local_file'
  }
  if (hasExternalLocator(signals)) return 'url_backed_no_local_file'
  return 'locator_missing'
}

function hasExternalLocator(signals: LibraryAnalysisLocatorSignal[]): boolean {
  return signals.some(signal => (
    signal === 'document_url' ||
    signal === 'document_archived_url' ||
    signal === 'source_doc_url' ||
    signal === 'source_doc_doi' ||
    signal === 'source_doc_archived_url' ||
    signal === 'citation_url'
  ))
}

function recommendedActionFor(status: LibraryAnalysisLocatorStatus): string {
  if (status === 'local_match_candidate') {
    return 'Verify exact local file match, then remap Document.filePath or SourceDoc.documentId in a separate reviewed repair.'
  }
  if (status === 'citation_backed_no_local_file') {
    return 'Use existing citation locator to decide whether to download/extract local text or keep URL-only internal context.'
  }
  if (status === 'url_backed_no_local_file') {
    return 'Queue download/extraction from existing URL/DOI; keep as internal context until text and citation gates are reviewed.'
  }
  return 'Manual source search required before any text repair or citation upgrade.'
}

function compareRows(
  a: LibraryAnalysisLocatorProfileRow,
  b: LibraryAnalysisLocatorProfileRow,
): number {
  const statusOrder: Record<LibraryAnalysisLocatorStatus, number> = {
    local_match_candidate: 0,
    url_backed_no_local_file: 1,
    citation_backed_no_local_file: 2,
    locator_missing: 3,
  }
  const statusDiff = statusOrder[a.locatorStatus] - statusOrder[b.locatorStatus]
  if (statusDiff !== 0) return statusDiff
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

function countLocatorSignals(rows: LibraryAnalysisLocatorProfileRow[]): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const signal of row.locatorSignals) {
      counts.set(signal, (counts.get(signal) ?? 0) + 1)
    }
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
