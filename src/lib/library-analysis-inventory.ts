import { createHash } from 'node:crypto'
import {
  buildLibraryAnalysisSourceKey,
  classifyLibraryAnalysisRecord,
  summarizeLibraryAnalysisRecords,
  type LibraryAnalysisClassification,
  type LibraryAnalysisSourceKind,
} from './library-analysis'
import { assessLibraryAnalysisExternalCitationPolicy } from './library-analysis-external-citations'
import { normalizeLocalFileLocator } from './local-file-locator'

export type LibraryInventoryDocument = {
  id: string
  slug: string
  title: string
  filePath: string | null
  hasLocalFile?: boolean
  url?: string | null
  archivedUrl?: string | null
  content: string
  summary: string | null
  wordCount: number
  metadata?: unknown
  sourceDoc?: {
    id: string
    url?: string | null
    doi?: string | null
    archivedUrl?: string | null
  } | null
  report?: { id: string } | null
  thesis?: { id: string } | null
  sourceCitations?: {
    id?: string | null
    sourceClass?: string
    citationReadiness: string
    verificationStatus?: string
    url?: string | null
    archivedUrl?: string | null
    accessedAt?: Date | string | null
  }[]
}

export type LibraryInventorySourceDoc = {
  id: string
  filename: string
  title: string | null
  description: string
  documentId: string | null
}

export type LibraryInventoryReport = {
  id: string
  title: string
  documentId: string | null
  keyFindings?: string[]
  relevance?: string
}

export type LibraryInventoryThesis = {
  id: string
  title: string
  documentId: string | null
  synthesis: string
  keyFindings?: string[]
}

export type LibraryInventoryFile = {
  path: string
  title?: string | null
  content: string
}

export type BuildLibraryAnalysisInventoryInput = {
  documents: LibraryInventoryDocument[]
  sourceDocs: LibraryInventorySourceDoc[]
  reports: LibraryInventoryReport[]
  theses: LibraryInventoryThesis[]
  libraryFiles: LibraryInventoryFile[]
}

export type LibraryAnalysisInventoryRow = {
  sourceKind: LibraryAnalysisSourceKind
  sourceKey: string
  title: string
  canonicalPath: string | null
  linkedDocumentId: string | null
  linkedSourceDocId: string | null
  linkedReportId: string | null
  linkedThesisId: string | null
  citationReadiness: string | null
  externalCitationEligible: boolean
  externalCitationPolicyHash?: string | null
  currentExternalCitationPolicyHash: string | null
  hasLocalFile: boolean
  hasDbLink: boolean
  wordCount: number
  contentHash: string
  currentContentHash?: string | null
  riskFlags: string[]
  claimCandidateCount: number
  classification: LibraryAnalysisClassification
  reviewStatus?: string | null
  reviewedAt?: string | null
  reviewer?: string | null
}

export function buildLibraryAnalysisInventory(input: BuildLibraryAnalysisInventoryInput): LibraryAnalysisInventoryRow[] {
  const rows: LibraryAnalysisInventoryRow[] = []
  const importedPaths = new Set<string>()

  for (const document of input.documents) {
    const canonicalPath = normalizeLibraryPath(document.filePath)
    if (isControlArtifactPath(canonicalPath)) continue
    addImportedPath(importedPaths, canonicalPath)
    const externalCitationPolicy = assessDocumentExternalCitationPolicy(
      document.sourceCitations ?? [],
    )

    rows.push(buildRow({
      sourceKind: 'document',
      id: document.id,
      title: document.title,
      canonicalPath,
      linkedDocumentId: document.id,
      linkedSourceDocId: document.sourceDoc?.id ?? null,
      linkedReportId: document.report?.id ?? input.reports.find(report => report.documentId === document.id)?.id ?? null,
      linkedThesisId: document.thesis?.id ?? input.theses.find(thesis => thesis.documentId === document.id)?.id ?? null,
      citationReadiness: strongestCitationReadiness(document.sourceCitations ?? []),
      currentExternalCitationPolicyHash: externalCitationPolicy.policyHash,
      hasLocalFile: document.hasLocalFile ?? Boolean(canonicalPath),
      hasDbLink: true,
      wordCount: document.wordCount,
      content: [document.summary, document.content].filter(Boolean).join('\n\n'),
      riskFlags: [],
      claimCandidateCount: 0,
      isBlockedSource: documentMetadataString(document.metadata, 'provenanceType') === 'blocked_source',
      isCuratedShortSummary:
        documentMetadataString(document.metadata, 'libraryAnalysisDisposition') === 'curated_short_summary',
      hasExternalLocator: hasDocumentExternalLocator(document),
    }))
  }

  const linkedDocumentIds = new Set(input.documents.map(document => document.id))

  for (const sourceDoc of input.sourceDocs) {
    if (sourceDoc.documentId && linkedDocumentIds.has(sourceDoc.documentId)) continue
    rows.push(buildRow({
      sourceKind: 'source_doc',
      id: sourceDoc.id,
      title: sourceDoc.title ?? sourceDoc.filename,
      canonicalPath: null,
      linkedDocumentId: sourceDoc.documentId,
      linkedSourceDocId: sourceDoc.id,
      linkedReportId: null,
      linkedThesisId: null,
      citationReadiness: null,
      currentExternalCitationPolicyHash: null,
      hasLocalFile: false,
      hasDbLink: true,
      wordCount: countWords(sourceDoc.description),
      content: sourceDoc.description,
      riskFlags: ['missing_file_path'],
      claimCandidateCount: 0,
      isBlockedSource: false,
      isCuratedShortSummary: false,
    }))
  }

  for (const report of input.reports) {
    if (report.documentId && linkedDocumentIds.has(report.documentId)) continue
    const content = [report.relevance, ...(report.keyFindings ?? [])].filter(Boolean).join('\n')
    rows.push(buildRow({
      sourceKind: 'report',
      id: report.id,
      title: report.title,
      canonicalPath: null,
      linkedDocumentId: report.documentId,
      linkedSourceDocId: null,
      linkedReportId: report.id,
      linkedThesisId: null,
      citationReadiness: null,
      currentExternalCitationPolicyHash: null,
      hasLocalFile: false,
      hasDbLink: true,
      wordCount: countWords(content),
      content,
      riskFlags: ['missing_file_path'],
      claimCandidateCount: 0,
      isBlockedSource: false,
      isCuratedShortSummary: false,
    }))
  }

  for (const thesis of input.theses) {
    if (thesis.documentId && linkedDocumentIds.has(thesis.documentId)) continue
    const content = [thesis.synthesis, ...(thesis.keyFindings ?? [])].filter(Boolean).join('\n')
    rows.push(buildRow({
      sourceKind: 'thesis',
      id: thesis.id,
      title: thesis.title,
      canonicalPath: null,
      linkedDocumentId: thesis.documentId,
      linkedSourceDocId: null,
      linkedReportId: null,
      linkedThesisId: thesis.id,
      citationReadiness: null,
      currentExternalCitationPolicyHash: null,
      hasLocalFile: false,
      hasDbLink: true,
      wordCount: countWords(content),
      content,
      riskFlags: ['missing_file_path'],
      claimCandidateCount: 0,
      isBlockedSource: false,
      isCuratedShortSummary: false,
    }))
  }

  for (const file of input.libraryFiles) {
    const canonicalPath = normalizeLibraryPath(file.path)
    if (!canonicalPath || isImportedPath(importedPaths, canonicalPath)) continue
    const wordCount = countWords(file.content)
    rows.push(buildRow({
      sourceKind: 'library_file',
      path: canonicalPath,
      title: file.title ?? titleFromPath(canonicalPath),
      canonicalPath,
      linkedDocumentId: null,
      linkedSourceDocId: null,
      linkedReportId: null,
      linkedThesisId: null,
      citationReadiness: null,
      currentExternalCitationPolicyHash: null,
      hasLocalFile: true,
      hasDbLink: false,
      wordCount,
      content: file.content,
      riskFlags: wordCount < 15 ? ['missing_text'] : [],
      claimCandidateCount: 0,
      isBlockedSource: false,
      isCuratedShortSummary: false,
      isLooseLibraryFile: true,
    }))
  }

  return rows.sort((a, b) => a.sourceKey.localeCompare(b.sourceKey))
}

function addImportedPath(importedPaths: Set<string>, path: string | null) {
  for (const key of libraryPathKeys(path)) {
    importedPaths.add(key)
  }
}

function isImportedPath(importedPaths: Set<string>, path: string): boolean {
  return libraryPathKeys(path).some(key => importedPaths.has(key))
}

function libraryPathKeys(path: string | null | undefined): string[] {
  const canonicalPath = normalizeLibraryPath(path)
  const normalizedPath = normalizeLocalFileLocator(path)
  return [...new Set([
    canonicalPath,
    normalizedPath,
    normalizedPath ? `research/${normalizedPath}` : null,
    normalizedPath ? `docs/${normalizedPath}` : null,
  ].filter((value): value is string => Boolean(value)))]
}

export function formatLibraryAnalysisLedgerJsonl(rows: LibraryAnalysisInventoryRow[]): string {
  return rows
    .map(row => JSON.stringify({
      sourceKind: row.sourceKind,
      sourceKey: row.sourceKey,
      title: row.title,
      canonicalPath: row.canonicalPath,
      status: row.classification.status,
      usageRule: row.classification.usageRule,
      reviewRequired: row.classification.reviewRequired,
      riskFlags: row.riskFlags,
      claimCandidateCount: row.claimCandidateCount,
      contentHash: row.contentHash,
      currentContentHash: row.currentContentHash ?? null,
      linkedDocumentId: row.linkedDocumentId,
      linkedSourceDocId: row.linkedSourceDocId,
      linkedReportId: row.linkedReportId,
      linkedThesisId: row.linkedThesisId,
      citationReadiness: row.citationReadiness,
      externalCitationEligible: row.externalCitationEligible,
      externalCitationPolicyHash: row.externalCitationPolicyHash ?? null,
      currentExternalCitationPolicyHash: row.currentExternalCitationPolicyHash,
      reviewStatus: row.reviewStatus ?? null,
      reviewedAt: row.reviewedAt ?? null,
      reviewer: row.reviewer ?? null,
    }))
    .join('\n') + '\n'
}

export function formatLibraryAnalysisSummaryMarkdown(
  rows: LibraryAnalysisInventoryRow[],
  options: { staleRetainedCount?: number } = {},
): string {
  const summary = summarizeLibraryAnalysisRecords(rows.map(row => ({
    status: row.classification.status,
    usageRule: row.classification.usageRule,
    claimCandidateCount: row.claimCandidateCount,
    riskFlags: row.riskFlags,
  })))

  return [
    '# Library Analysis Summary',
    '',
    'Kompakt status for AI-klargjoring av research-biblioteket. AI-kort og claim-kandidater er arbeidsgrunnlag, ikke publiserbare claims.',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total sources | ${summary.total} |`,
    `| Finished internal | ${summary.finished} |`,
    `| Review queue | ${summary.reviewRequired} |`,
    `| Blocked | ${summary.blocked} |`,
    `| Type-B actor gates | ${summary.typeB} |`,
    `| Type-C gaps | ${summary.typeC} |`,
    `| Claim candidates | ${summary.claimCandidates} |`,
    `| Missing text | ${summary.missingText} |`,
    `| Stale retained outside live ledger | ${options.staleRetainedCount ?? 0} |`,
    '',
  ].join('\n')
}

export function computeLibraryContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex')
}

export function normalizeLibraryPath(path: string | null | undefined): string | null {
  const normalized = path?.replaceAll('\\', '/').replace(/^\.\//, '').trim()
  return normalized || null
}

function isControlArtifactPath(path: string | null): boolean {
  const normalized = path?.toLowerCase()
  if (!normalized) return false
  return (
    normalized === '_plans/orphan-review.md' ||
    normalized === 'research/_plans/orphan-review.md' ||
    normalized === 'data/nordic/prices/readme.md' ||
    normalized === 'research/data/nordic/prices/readme.md' ||
    normalized.endsWith('/progress.md') ||
    normalized.endsWith('/readme-organisering.md') ||
    normalized.endsWith('/blocked-promotion-worklist.md')
  )
}

function buildRow(input: {
  sourceKind: LibraryAnalysisSourceKind
  id?: string
  path?: string
  title: string
  canonicalPath: string | null
  linkedDocumentId: string | null
  linkedSourceDocId: string | null
  linkedReportId: string | null
  linkedThesisId: string | null
  citationReadiness: string | null
  currentExternalCitationPolicyHash: string | null
  hasLocalFile: boolean
  hasDbLink: boolean
  wordCount: number
  content: string
  riskFlags: string[]
  claimCandidateCount: number
  isBlockedSource: boolean
  isCuratedShortSummary: boolean
  hasExternalLocator?: boolean
  isLooseLibraryFile?: boolean
}): LibraryAnalysisInventoryRow {
  const sourceKey = buildLibraryAnalysisSourceKey({
    sourceKind: input.sourceKind,
    id: input.id,
    path: input.path,
  })
  const riskFlags = [...new Set(input.riskFlags)]
  const classification = classifyLibraryAnalysisRecord({
    wordCount: input.wordCount,
    hasLocalFile: input.hasLocalFile,
    hasDbLink: input.hasDbLink,
    citationReadiness: input.citationReadiness,
    claimCandidateCount: input.claimCandidateCount,
    riskFlags,
    gapKinds: [],
    isSuperseded: false,
    isBlockedSource: input.isBlockedSource,
    isCuratedShortSummary: input.isCuratedShortSummary,
    hasExternalLocator: input.hasExternalLocator ?? false,
    isLooseLibraryFile: input.isLooseLibraryFile ?? false,
  })
  const effectiveRiskFlags = [...new Set([...riskFlags, ...classification.reasons])]

  return {
    sourceKind: input.sourceKind,
    sourceKey,
    title: input.title,
    canonicalPath: input.canonicalPath,
    linkedDocumentId: input.linkedDocumentId,
    linkedSourceDocId: input.linkedSourceDocId,
    linkedReportId: input.linkedReportId,
    linkedThesisId: input.linkedThesisId,
    citationReadiness: input.citationReadiness,
    externalCitationEligible: Boolean(input.currentExternalCitationPolicyHash),
    currentExternalCitationPolicyHash: input.currentExternalCitationPolicyHash,
    hasLocalFile: input.hasLocalFile,
    hasDbLink: input.hasDbLink,
    wordCount: input.wordCount,
    contentHash: computeLibraryContentHash(input.content),
    riskFlags: effectiveRiskFlags,
    claimCandidateCount: input.claimCandidateCount,
    classification,
  }
}

function documentMetadataString(metadata: unknown, key: string): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const value = (metadata as Record<string, unknown>)[key]
  return typeof value === 'string' ? value : null
}

function hasDocumentExternalLocator(document: LibraryInventoryDocument): boolean {
  return Boolean(
    nonEmptyString(document.url) ||
    nonEmptyString(document.archivedUrl) ||
    nonEmptyString(document.sourceDoc?.url) ||
    nonEmptyString(document.sourceDoc?.doi) ||
    nonEmptyString(document.sourceDoc?.archivedUrl) ||
    document.sourceCitations?.some(citation => (
      nonEmptyString(citation.url) || nonEmptyString(citation.archivedUrl)
    )),
  )
}

function assessDocumentExternalCitationPolicy(
  citations: NonNullable<LibraryInventoryDocument['sourceCitations']>,
) {
  return assessLibraryAnalysisExternalCitationPolicy(citations.map(citation => ({
    id: citation.id,
    sourceClass: citation.sourceClass ?? 'unknown',
    citationReadiness: citation.citationReadiness,
    verificationStatus: citation.verificationStatus ?? 'needs_review',
    url: citation.url ?? null,
    archivedUrl: citation.archivedUrl ?? null,
    accessedAt: citation.accessedAt ?? null,
  })))
}

function nonEmptyString(value: string | null | undefined): boolean {
  return typeof value === 'string' && Boolean(value.trim())
}

function strongestCitationReadiness(rows: { citationReadiness: string }[]): string | null {
  const order = ['blocked_unsourced', 'internal_context', 'citable_with_note', 'citable_external']
  let strongest: string | null = null
  for (const row of rows) {
    if (!strongest || order.indexOf(row.citationReadiness) > order.indexOf(strongest)) {
      strongest = row.citationReadiness
    }
  }
  return strongest
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

function titleFromPath(path: string): string {
  return path
    .split('/')
    .at(-1)!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
}
