import { extname } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import {
  candidateLocalFilePaths,
  normalizeLocalFileLocator,
} from './local-file-locator'

export const LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH =
  'research/_status/library-analysis-repair-backlog.md'
export const LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH =
  'research/_status/library-analysis-repair-backlog.json'

export type LibraryAnalysisRepairPathState =
  | 'no_path'
  | 'path_exists'
  | 'path_missing_on_disk'

export type LibraryAnalysisRepairPathResolution =
  | 'none'
  | 'direct'
  | 'research_prefix'
  | 'docs_prefix'
  | 'missing'

export type LibraryAnalysisRepairKind =
  | 'existing_low_text'
  | 'loose_library_file'
  | 'missing_document_locator'
  | 'seeded_report_stub'
  | 'stale_document_locator'
  | 'url_backed_low_text'

export type LibraryAnalysisRepairBatch =
  | 'existing_control_artifact_review'
  | 'existing_low_text_review'
  | 'existing_short_summary_review'
  | 'existing_source_locator_stub_review'
  | 'existing_transcript_fragment_review'
  | 'loose_file_review'
  | 'loose_json_import_review'
  | 'loose_markdown_import_review'
  | 'loose_presentation_text_extraction'
  | 'markdown_low_text_review'
  | 'missing_document_locator_search'
  | 'missing_sourcedoc_locator'
  | 'pdf_text_extraction'
  | 'seeded_blocked_source_review'
  | 'seeded_composite_source_review'
  | 'seeded_internal_register_review'
  | 'seeded_internal_synthesis_review'
  | 'seeded_report_stub_review'
  | 'stale_document_locator_remap'
  | 'text_low_text_review'
  | 'url_backed_text_extraction'

export type LibraryAnalysisRepairPriority = 'P1' | 'P2' | 'P3'

export type LibraryAnalysisRepairBacklogInput = {
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  documentId: string | null
  sourceDocId: string | null
  wordCount: number
  riskFlags: string[]
  citationReadiness: string | null
  pathState: LibraryAnalysisRepairPathState
  pathResolution: LibraryAnalysisRepairPathResolution
  resolvedPath: string | null
  extension: string
  sizeBucket: string
  sourceDocFilename: string | null
  sourceDocType: string | null
  hasCitationLocalPath: boolean
  hasCitationUrl: boolean
  documentUrl?: string | null
  documentArchivedUrl?: string | null
  sourceDocUrl?: string | null
  sourceDocDoi?: string | null
  sourceDocArchivedUrl?: string | null
  provenanceType?: string | null
  generatedFrom?: string | null
}

export type LibraryAnalysisRepairBacklogRow = LibraryAnalysisRepairBacklogInput & {
  repairKind: LibraryAnalysisRepairKind
  repairBatch: LibraryAnalysisRepairBatch
  repairLane: 'mekanisk tekst-/koblingsreparasjon'
  priority: LibraryAnalysisRepairPriority
  recommendedAction: string
  aiContextNote: string
  claimUseNote: string
  externalUseNote: string
}

export type LibraryAnalysisRepairBacklog = {
  total: number
  rows: LibraryAnalysisRepairBacklogRow[]
  summary: {
    byRepairKind: Record<string, number>
    byRepairBatch: Record<string, number>
    bySourceKind: Record<string, number>
    byPathState: Record<string, number>
    byPathResolution: Record<string, number>
    byExtension: Record<string, number>
    byRiskFlag: Record<string, number>
  }
}

export type LibraryAnalysisRecordDistributionInput = {
  status: string
  usageRule: string
  sourceKind: string
  riskFlags: string[]
  canonicalPath: string | null
  documentId: string | null
  sourceDocId: string | null
}

export type LibraryAnalysisRecordDistribution = {
  total: number
  byStatus: Record<string, number>
  byUsageRule: Record<string, number>
  bySourceKind: Record<string, number>
  byRiskFlag: Record<string, number>
  byLinkMatrix: Record<string, number>
}

export type FormatLibraryAnalysisRepairBacklogMarkdownOptions = {
  generatedAt?: string
  jsonPath?: string
  sampleLimit?: number
  recordDistribution?: LibraryAnalysisRecordDistribution
}

export type ResolveLibraryAnalysisRepairPathFactsOptions = {
  root?: string
  fileExists?: (path: string) => boolean
  fileSize?: (path: string) => number
}

export type LibraryAnalysisRepairPathFacts = {
  pathState: LibraryAnalysisRepairPathState
  pathResolution: LibraryAnalysisRepairPathResolution
  resolvedPath: string | null
  extension: string
  sizeBucket: string
}

export function buildLibraryAnalysisRepairBacklog(
  records: LibraryAnalysisRepairBacklogInput[],
): LibraryAnalysisRepairBacklog {
  const rows = records
    .filter(record => isTextRepairCandidate(record))
    .map(toRepairBacklogRow)
    .sort(compareRepairRows)

  return {
    total: rows.length,
    rows,
    summary: {
      byRepairKind: countBy(rows, row => row.repairKind),
      byRepairBatch: countBy(rows, row => row.repairBatch),
      bySourceKind: countBy(rows, row => row.sourceKind),
      byPathState: countBy(rows, row => row.pathState),
      byPathResolution: countBy(rows, row => row.pathResolution),
      byExtension: countBy(rows, row => row.extension),
      byRiskFlag: countRiskFlags(rows),
    },
  }
}

export function summarizeLibraryAnalysisRecordDistribution(
  records: LibraryAnalysisRecordDistributionInput[],
): LibraryAnalysisRecordDistribution {
  return {
    total: records.length,
    byStatus: countBy(records, record => record.status),
    byUsageRule: countBy(records, record => record.usageRule),
    bySourceKind: countBy(records, record => record.sourceKind),
    byRiskFlag: countDistributionRiskFlags(records),
    byLinkMatrix: countBy(records, linkMatrixKey),
  }
}

export function formatLibraryAnalysisRepairBacklogMarkdown(
  backlog: LibraryAnalysisRepairBacklog,
  options: FormatLibraryAnalysisRepairBacklogMarkdownOptions = {},
): string {
  const generatedAt = options.generatedAt ?? new Date().toISOString()
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 80
  const sampleRows = backlog.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Repair Backlog',
    '',
    `Generated: ${generatedAt}`,
    '',
    'Denne backloggen er en mekanisk arbeidsflate for missing-text/review-koen i LibraryAnalysisRecord. Den endrer ikke AI-kort, lager ikke claim-kandidater, og gjor ingen ekstern publisering.',
    '',
    '## Bruksgrenser',
    '',
    '- Mekanisk tekst-/koblingsreparasjon: finn, remapp, importer eller trekk ut tekst slik at kilden kan vurderes paa nytt.',
    '- Intern AI-kontekst: kan forst vurderes etter at tekst/lokator er reparert og ordinare library-analysis-gater er kjort paa nytt.',
    '- Claim-kandidater: skal fortsatt gjennom PCQ/claim-lock, gate:overclaim og audit:citable; denne backloggen aapner ingen claims.',
    '- Ekstern publiserbar bruk: fortsatt blokkert til citable/overclaim-gatene har godkjent konkret bruk.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    ...formatRecordDistributionSection(options.recordDistribution),
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total repair rows | ${backlog.total} |`,
    ...formatCountRows(backlog.summary.byRepairKind),
    '',
    '## Fordeling',
    '',
    '### Repair Batch',
    '',
    formatCountTable(backlog.summary.byRepairBatch),
    '',
    '### Source Kind',
    '',
    formatCountTable(backlog.summary.bySourceKind),
    '',
    '### Path State',
    '',
    formatCountTable(backlog.summary.byPathState),
    '',
    '### Path Resolution',
    '',
    formatCountTable(backlog.summary.byPathResolution),
    '',
    '### Extension',
    '',
    formatCountTable(backlog.summary.byExtension),
    '',
    '### Risk Flags',
    '',
    formatCountTable(backlog.summary.byRiskFlag),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${backlog.total}`,
    '',
    '| Priority | Repair kind | Repair batch | Source kind | Title | Words | Path state | Path resolution | Path/source | Action |',
    '|---|---|---|---|---|---:|---|---|---|---|',
    ...sampleRows.map(row => [
      row.priority,
      row.repairKind,
      row.repairBatch,
      row.sourceKind,
      escapeMarkdownCell(row.title),
      String(row.wordCount),
      row.pathState,
      row.pathResolution,
      escapeMarkdownCell(row.resolvedPath ?? row.canonicalPath ?? row.sourceDocFilename ?? row.sourceKey),
      escapeMarkdownCell(row.recommendedAction),
    ].join(' | ')).map(line => `| ${line} |`),
    '',
  ].join('\n')
}

export function resolveLibraryAnalysisRepairPathFacts(
  path: string | null,
  options: ResolveLibraryAnalysisRepairPathFactsOptions = {},
): LibraryAnalysisRepairPathFacts {
  const normalized = normalizeLocalFileLocator(path)
  if (!normalized) {
    return {
      pathState: 'no_path',
      pathResolution: 'none',
      resolvedPath: null,
      extension: 'none',
      sizeBucket: 'none',
    }
  }

  const extension = extname(normalized).toLowerCase() || 'none'
  const root = options.root ?? process.cwd()
  const fileExists = options.fileExists ?? existsSync
  const fileSize = options.fileSize ?? ((filePath: string) => statSync(filePath).size)
  const candidates = candidateLocalFilePaths(normalized, root)
  const resolutionByIndex: LibraryAnalysisRepairPathResolution[] = [
    'direct',
    'research_prefix',
    'docs_prefix',
  ]

  for (const [index, candidate] of candidates.entries()) {
    if (!fileExists(candidate)) continue
    const pathResolution = resolutionByIndex[index] ?? 'direct'
    return {
      pathState: 'path_exists',
      pathResolution,
      resolvedPath: repoRelativeResolvedPath(normalized, pathResolution),
      extension,
      sizeBucket: sizeBucket(fileSize(candidate)),
    }
  }

  return {
    pathState: 'path_missing_on_disk',
    pathResolution: 'missing',
    resolvedPath: null,
    extension,
    sizeBucket: 'missing',
  }
}

function toRepairBacklogRow(record: LibraryAnalysisRepairBacklogInput): LibraryAnalysisRepairBacklogRow {
  const repairKind = classifyRepairKind(record)
  const repairBatch = classifyRepairBatch(record, repairKind)
  return {
    ...record,
    repairKind,
    repairBatch,
    repairLane: 'mekanisk tekst-/koblingsreparasjon',
    priority: classifyPriority(record, repairKind),
    recommendedAction: recommendedAction(record, repairKind, repairBatch),
    aiContextNote: 'Ikke oppgrader til intern AI-kontekst foer tekst/lokator er reparert og library-analysis er regenerert.',
    claimUseNote: 'Ingen claim-kandidat skal opprettes her; bruk PCQ/claim-lock og eksisterende gates etter separat review.',
    externalUseNote: 'Ikke ekstern publiserbar bruk uten konkret citable/overclaim-godkjenning.',
  }
}

function classifyRepairBatch(
  record: LibraryAnalysisRepairBacklogInput,
  repairKind: LibraryAnalysisRepairKind,
): LibraryAnalysisRepairBatch {
  if (repairKind === 'stale_document_locator') return 'stale_document_locator_remap'
  if (repairKind === 'seeded_report_stub') return seededReportRepairBatch(record)
  if (repairKind === 'url_backed_low_text') return 'url_backed_text_extraction'
  if (repairKind === 'missing_document_locator') {
    if (record.sourceDocId || record.sourceDocFilename) return 'missing_sourcedoc_locator'
    return 'missing_document_locator_search'
  }
  if (repairKind === 'loose_library_file') {
    if (record.extension === '.pptx') return 'loose_presentation_text_extraction'
    if (record.extension === '.json') return 'loose_json_import_review'
    if (record.extension === '.md') return 'loose_markdown_import_review'
    return 'loose_file_review'
  }
  if (record.extension === '.pdf') return 'pdf_text_extraction'
  const existingBatch = existingLowTextRepairBatch(record)
  if (existingBatch) return existingBatch
  if (record.extension === '.md') return 'markdown_low_text_review'
  if (record.extension === '.txt') return 'text_low_text_review'
  return 'existing_low_text_review'
}

function classifyRepairKind(record: LibraryAnalysisRepairBacklogInput): LibraryAnalysisRepairKind {
  if (record.sourceKind === 'library_file') return 'loose_library_file'
  if (record.pathState === 'path_missing_on_disk') return 'stale_document_locator'
  if (record.pathState === 'no_path' && hasExternalLocator(record)) return 'url_backed_low_text'
  if (record.pathState === 'no_path' && isSeededReportStub(record)) return 'seeded_report_stub'
  if (record.pathState === 'no_path') return 'missing_document_locator'
  return 'existing_low_text'
}

function classifyPriority(
  record: LibraryAnalysisRepairBacklogInput,
  repairKind: LibraryAnalysisRepairKind,
): LibraryAnalysisRepairPriority {
  if (repairKind === 'stale_document_locator' || repairKind === 'missing_document_locator') return 'P1'
  if (repairKind === 'seeded_report_stub' || repairKind === 'url_backed_low_text') return 'P2'
  if (repairKind === 'existing_low_text' && record.extension === '.pdf') return 'P1'
  if (repairKind === 'loose_library_file') return 'P2'
  return 'P3'
}

function recommendedAction(
  record: LibraryAnalysisRepairBacklogInput,
  repairKind: LibraryAnalysisRepairKind,
  repairBatch: LibraryAnalysisRepairBatch,
): string {
  if (repairKind === 'stale_document_locator') {
    return 'Remapp Document.filePath til eksisterende repo-fil eller marker lokatoren som historisk/stale foer ny analyse.'
  }
  if (repairKind === 'missing_document_locator') {
    if (record.sourceDocId) {
      return 'Koble SourceDoc/Document til lokal filsti eller source citation localPath foer ny analyse.'
    }
    return 'Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes.'
  }
  if (repairKind === 'url_backed_low_text') {
    return 'Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn.'
  }
  if (repairKind === 'seeded_report_stub') {
    return 'Avklar seedet rapportstubbe: behold som intern syntese/register, koble til kontrollerte kilder, eller parker som ikke-citable.'
  }
  if (repairKind === 'existing_low_text') {
    if (repairBatch === 'existing_control_artifact_review') {
      return 'Vurder om kontroll-/runbook-artefaktet skal ut av library-analysis-koen eller beholdes som teknisk auditkontekst.'
    }
    if (repairBatch === 'existing_transcript_fragment_review') {
      return 'Rehent full transkripsjon eller parker transkripsjonsfragmentet som ikke-citable lavtekst.'
    }
    if (repairBatch === 'existing_source_locator_stub_review') {
      return 'Bruk lenke-stubben til kontrollert kildeinnhenting/tekstimport, eller behold den som locator-only bakgrunn.'
    }
    if (repairBatch === 'existing_short_summary_review') {
      return 'Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst.'
    }
    if (record.extension === '.pdf') {
      return 'Kjor planlagt tekstuttrekk/OCR-vurdering for eksisterende PDF, deretter regenerer library-analysis.'
    }
    return 'Vurder om eksisterende fil er en kort stub, indeks eller metadatafil; utvid tekst eller behold som lavtekst.'
  }
  if (record.extension === '.pptx') {
    return 'Ekstraher tekst fra presentasjonen eller opprett kontrollert markdown-notat foer eventuell import.'
  }
  return 'Vurder om loes bibliotekfil skal importeres, slas sammen med eksisterende Document, eller beholdes som orphan bakgrunn.'
}

function isTextRepairCandidate(record: LibraryAnalysisRepairBacklogInput): boolean {
  return record.riskFlags.includes('missing_text') || record.riskFlags.includes('low_text_quality')
}

function hasExternalLocator(record: LibraryAnalysisRepairBacklogInput): boolean {
  return Boolean(
    record.hasCitationUrl ||
    record.documentUrl ||
    record.documentArchivedUrl ||
    record.sourceDocUrl ||
    record.sourceDocDoi ||
    record.sourceDocArchivedUrl,
  )
}

function isSeededReportStub(record: LibraryAnalysisRepairBacklogInput): boolean {
  return record.generatedFrom === 'prisma/seed-data/reports.ts' || Boolean(record.provenanceType)
}

function seededReportRepairBatch(record: LibraryAnalysisRepairBacklogInput): LibraryAnalysisRepairBatch {
  if (record.provenanceType === 'internal_synthesis') return 'seeded_internal_synthesis_review'
  if (record.provenanceType === 'internal_register') return 'seeded_internal_register_review'
  if (record.provenanceType === 'composite_source') return 'seeded_composite_source_review'
  if (record.provenanceType === 'blocked_source') return 'seeded_blocked_source_review'
  return 'seeded_report_stub_review'
}

function existingLowTextRepairBatch(record: LibraryAnalysisRepairBacklogInput): LibraryAnalysisRepairBatch | null {
  const path = (record.resolvedPath ?? record.canonicalPath ?? '').toLowerCase()
  if (isControlArtifactPath(path)) return 'existing_control_artifact_review'
  if (path.includes('/landbrukarena_transcripts/')) return 'existing_transcript_fragment_review'
  if (record.wordCount < 25) return 'existing_source_locator_stub_review'
  if (record.extension === '.md' || record.extension === '.txt') return 'existing_short_summary_review'
  return null
}

function isControlArtifactPath(path: string): boolean {
  return (
    path.startsWith('research/_plans/') ||
    path.startsWith('research/intake/') ||
    path.startsWith('research/data/') ||
    path.endsWith('/progress.md') ||
    path.includes('/readme') ||
    path.endsWith('blocked-promotion-worklist.md')
  )
}

function compareRepairRows(
  a: LibraryAnalysisRepairBacklogRow,
  b: LibraryAnalysisRepairBacklogRow,
): number {
  const priorityOrder: Record<LibraryAnalysisRepairPriority, number> = { P1: 0, P2: 1, P3: 2 }
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
  if (priorityDiff !== 0) return priorityDiff
  if (a.repairKind !== b.repairKind) return a.repairKind.localeCompare(b.repairKind)
  if (a.wordCount !== b.wordCount) return a.wordCount - b.wordCount
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

function countRiskFlags(rows: LibraryAnalysisRepairBacklogRow[]): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const flag of row.riskFlags) {
      counts.set(flag, (counts.get(flag) ?? 0) + 1)
    }
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function countDistributionRiskFlags(rows: LibraryAnalysisRecordDistributionInput[]): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const flag of row.riskFlags) {
      counts.set(flag, (counts.get(flag) ?? 0) + 1)
    }
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function linkMatrixKey(record: LibraryAnalysisRecordDistributionInput): string {
  return [
    `doc:${Boolean(record.documentId)}`,
    `sourceDoc:${Boolean(record.sourceDocId)}`,
    `path:${Boolean(record.canonicalPath)}`,
  ].join('|')
}

function formatRecordDistributionSection(distribution: LibraryAnalysisRecordDistribution | undefined): string[] {
  if (!distribution) return []

  return [
    '## LibraryAnalysisRecord Snapshot',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total records | ${distribution.total} |`,
    '',
    '### Status',
    '',
    formatCountTable(distribution.byStatus),
    '',
    '### Usage Rule',
    '',
    formatCountTable(distribution.byUsageRule),
    '',
    '### Source Kind',
    '',
    formatCountTable(distribution.bySourceKind),
    '',
    '### Link Matrix',
    '',
    formatCountTable(distribution.byLinkMatrix),
    '',
    '### Risk Flags',
    '',
    formatCountTable(distribution.byRiskFlag),
    '',
  ]
}

function formatCountRows(counts: Record<string, number>): string[] {
  return Object.entries(counts).map(([key, count]) => `| ${escapeMarkdownCell(key)} | ${count} |`)
}

function formatCountTable(counts: Record<string, number>): string {
  return [
    '| Value | Count |',
    '|---|---:|',
    ...formatCountRows(counts),
  ].join('\n')
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replace(/\s+/g, ' ').trim()
}

function repoRelativeResolvedPath(
  normalizedPath: string,
  pathResolution: LibraryAnalysisRepairPathResolution,
): string | null {
  if (pathResolution === 'direct') return normalizedPath
  if (pathResolution === 'research_prefix') return `research/${normalizedPath}`
  if (pathResolution === 'docs_prefix') return `docs/${normalizedPath}`
  return null
}

function sizeBucket(size: number): string {
  if (size === 0) return '0'
  if (size < 1024) return '1B-1KB'
  if (size < 16 * 1024) return '1KB-16KB'
  if (size < 256 * 1024) return '16KB-256KB'
  return '256KB+'
}
