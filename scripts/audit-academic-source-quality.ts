// Audit evidence-source metadata in the mixed Report, Thesis, and SourceDoc
// seeds. The scope includes academic works, official sources, registers,
// internal syntheses, operational documents, and declared duplicates.
//
// The default command is a regression gate: it protects existing metadata
// coverage without pretending that the corpus is ready for external academic
// claims. External readiness is reported separately and can be enforced with
// --require-external-ready.

import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { reports } from '@seeds/reports'
import { theses } from '@seeds/theses'
import { sources } from '@seeds/sources'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  knownSourceDocProvenance,
  normalizedSourceDocProvenance,
  sourceDocIsInternalEvidence,
  sourceDocNeedsPublicLocator,
} from '../src/lib/citations/source-doc-provenance'
import {
  knownReportProvenance,
  normalizedReportProvenance,
  reportIsInternalEvidence,
  reportNeedsPublicLocator,
} from '../src/lib/citations/report-provenance'
import { loadManagedTranscriptSourceDocIds } from '../src/lib/citations/academic-corpus-identity'
import {
  assessEvidenceAppraisal,
  type EvidenceAppraisalSnapshot,
} from '../src/lib/citations/evidence-appraisal'
import { assessCitationUse } from '../src/lib/citations/external-citation-policy'

export const ACADEMIC_SOURCE_QUALITY_STATUS_JSON_PATH =
  'research/_status/academic-source-quality-status.json'
export const ACADEMIC_SOURCE_QUALITY_STATUS_MD_PATH =
  'research/_status/academic-source-quality-status.md'
export const ACADEMIC_SOURCE_QUALITY_REPAIR_QUEUE_JSON_PATH =
  'research/_status/academic-source-quality-repair-queue.json'
export const ACADEMIC_SOURCE_QUALITY_REPAIR_QUEUE_MD_PATH =
  'research/_status/academic-source-quality-repair-queue.md'

type Threshold = {
  /** Minimum percentage required for the regression gate to pass. */
  min: number
  /** Absolute reviewed-row floor; prevents percentage rounding or corpus growth from hiding regressions. */
  minPresent?: number
  /** Desired coverage target; this is not silently treated as achieved. */
  target: number
}

type FieldCheck<T> = {
  key: string
  label: string
  getter: (row: T) => unknown
  thresholds: Threshold
}

export type CoverageResult = {
  set: 'Report' | 'Thesis' | 'SourceDoc'
  key: string
  label: string
  present: number
  total: number
  pct: number
  min: number
  minPresent: number
  target: number
  regressionPass: boolean
  targetMet: boolean
}

export type ExternalReadinessDimension = {
  key: string
  label: string
  set: 'Report' | 'Thesis' | 'SourceDoc' | 'Corpus'
  present: number
  total: number
  pct: number
  target: number
  status: 'ready' | 'gap' | 'unsupported'
  note: string
}

export type AcademicSourceQualitySnapshot = {
  generatedAt: string
  scope: {
    reportRows: number
    thesisRows: number
    sourceDocRows: number
    totalRows: number
    database: AcademicDatabaseAudit
  }
  urlSyntax: AcademicUrlSyntaxProfile[]
  identifierSyntax: AcademicIdentifierSyntaxProfile[]
  regressionGate: {
    status: 'pass' | 'fail'
    failureCount: number
    checks: CoverageResult[]
    meaning: string
  }
  externalReadiness: {
    status: 'ready' | 'not_ready'
    dimensions: ExternalReadinessDimension[]
    blockers: string[]
    meaning: string
  }
}

export type AcademicUrlSyntaxProfile = {
  set: 'Report' | 'Thesis' | 'SourceDoc'
  field: 'sourceUrl' | 'url'
  total: number
  nonEmpty: number
  validAbsoluteHttpUrl: number
  invalidNonEmpty: number
  missing: number
}

export type AcademicIdentifierSyntaxProfile = {
  set: 'Report' | 'Thesis' | 'SourceDoc'
  field: 'doi'
  total: number
  nonEmpty: number
  validDoi: number
  otherPersistentIdentifier: number
  unrecognizedNonEmpty: number
  otherPersistentIdentifierSchemes: {
    hdl: number
    diva2: number
    slu: number
    urn: number
  }
}

export type AcademicDatabaseRows = {
  reports: Array<{
    id: string
    title: string
    year: number | null
    institution: string | null
    author: string | null
    sourceUrl: string | null
    doi: string | null
    accessedAt: Date | string | null
    provenanceType: string | null
  }>
  theses: Array<{
    id: string
    title: string
    year: number
    institution: string
    authors: string
    method: string | null
    url: string
    doi: string | null
    accessDate: string | null
  }>
  sourceDocs: Array<{
    id: string
    filename: string
    title: string | null
    year: string | null
    author: string | null
    sourceType: string
    description: string
    relevance: string
    url: string | null
    doi: string | null
    publisher: string | null
    isDuplicate: boolean
    accessedAt: Date | string | null
    archivedUrl: string | null
    provenanceType: string
  }>
  fieldCitations: Array<{
    entityType: string
    entityId: string
    fieldPath: string | null
    claimText: string | null
    citation: {
      pageRef: string | null
      quote: string | null
    }
  }>
  appraisals?: Array<EvidenceAppraisalSnapshot & {
    reportId: string | null
    thesisId: string | null
    sourceDocId: string | null
    reviewBasisCitation: {
      id: string
      sourceClass: string
      citationReadiness: string
      verificationStatus: string
      url: string | null
      archivedUrl: string | null
      accessedAt: Date | string | null
      fileHash: string | null
      contentHash: string | null
      sourceDocId: string | null
      document: {
        report: { id: string } | null
        thesis: { id: string } | null
        sourceDoc: { id: string } | null
      } | null
    } | null
  }>
}

export type AcademicSeedCorpus = {
  reports: ReadonlyArray<(typeof reports)[number]>
  theses: ReadonlyArray<(typeof theses)[number]>
  sources: ReadonlyArray<(typeof sources)[number]>
}

const DEFAULT_ACADEMIC_SEED_CORPUS: AcademicSeedCorpus = {
  reports,
  theses,
  sources,
}

export type AcademicDatabaseCoverage = {
  set: CoverageResult['set']
  key: string
  label: string
  present: number
  total: number
  pct: number
  modeled: boolean
  note?: string
}

export type AcademicDatabaseAudit = {
  status: 'available' | 'unavailable'
  reason: string | null
  counts: {
    reportRows: number | null
    thesisRows: number | null
    sourceDocRows: number | null
    totalRows: number | null
  }
  parity: {
    status: 'match' | 'mismatch' | 'unavailable'
    identityStatus: 'match' | 'mismatch' | 'unavailable'
    metadataStatus: 'match' | 'mismatch' | 'unavailable'
    differences: Array<{
      set: CoverageResult['set']
      seedRows: number
      databaseRows: number | null
      delta: number | null
      matchedRows: number | null
      seedOnlyIds: string[]
      databaseOnlyIds: string[]
      managedRuntimeIds: string[]
      unclassifiedDatabaseOnlyIds: string[]
      missingManagedRuntimeIds: string[]
      classifiedParity: 'match' | 'mismatch'
    }>
    fieldDifferences: Array<{
      set: CoverageResult['set']
      matchedRows: number
      mismatchedRows: number
      mismatchedRowIds: string[]
      mismatchedFields: Record<string, number>
    }>
  }
  coverage: AcademicDatabaseCoverage[]
}

export type AcademicSourceQualityRepairQueue = {
  generatedAt: string
  reportProvenanceReviewCount: number
  reportInternalEvidenceCount: number
  reportProvenanceReviewRows: Array<{
    id: string
    title: string
    reportCategory: string
    rawUrl: string | null
    nextAction: string
  }>
  sourceDocProvenanceReviewCount: number
  sourceDocInternalEvidenceCount: number
  sourceDocProvenanceReviewRows: Array<{
    id: string
    title: string
    filename: string
    sourceType: string
    rawUrl: string | null
    nextAction: string
  }>
  sourceDocUrlGapCount: number
  sourceDocActiveUrlGapCount: number
  sourceDocDuplicateUrlGapCount: number
  sourceDocUrlRows: Array<{
    id: string
    title: string
    filename: string
    declaredPathExists: boolean
    repositoryMatches: string[]
    doi: string | null
    isDuplicate: boolean
    rawUrl: string | null
    locatorIssue: 'missing_url' | 'invalid_absolute_http_url'
    missingFields: string[]
    nextAction: string
  }>
  accessDateReviewCount: number
  liveAccessDateGapCount: number
  accessDateReviewRows: Array<{
    set: 'Report' | 'Thesis' | 'SourceDoc'
    id: string
    title: string
    url: string
    nextAction: string
  }>
  duplicateLocatorSummary: {
    reportGroups: number
    reportRows: number
    sourceDocGroups: number
    sourceDocRows: number
    validAbsoluteHttpUrlGroups: number
    invalidUrlSyntaxGroups: number
  }
  duplicateLocatorGroups: DuplicateLocatorGroup[]
  executionWaves: Array<{
    priority: number
    key: string
    label: string
    scopeCount: number
    targetIds: string[]
    prerequisites: string[]
    humanReviewRequired: boolean
    exitCriteria: string
  }>
  systemGaps: Array<{
    key: string
    affectedRows: number
    action: string
  }>
}

export type DuplicateLocatorGroup = {
  set: 'Report' | 'SourceDoc'
  canonicalLocator: string
  locatorSyntax: 'valid_absolute_http_url' | 'invalid_url_syntax'
  rowCount: number
  rows: Array<{
    id: string
    title: string
    rawLocator: string
    likelyMisbinding: boolean
    reviewNote: string | null
  }>
  nextAction: string
}

type AcademicIdentifierClassification =
  | 'doi'
  | 'hdl'
  | 'diva2'
  | 'slu'
  | 'urn'
  | 'unrecognized'
  | 'missing'

const DOI_PATTERN = /^(?:doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)?10\.\d{4,9}\/\S+$/i
const OTHER_PERSISTENT_IDENTIFIER_PATTERNS: ReadonlyArray<[
  Exclude<AcademicIdentifierClassification, 'doi' | 'unrecognized' | 'missing'>,
  RegExp,
]> = [
  ['hdl', /^hdl:\S+\/\S+$/i],
  ['diva2', /^diva2:\d+$/i],
  ['slu', /^slu:\d+$/i],
  ['urn', /^urn:[^\s:]+:.+$/i],
]

export function isValidDoiSyntax(value: unknown): boolean {
  return typeof value === 'string' && DOI_PATTERN.test(value.trim())
}

export function isValidAbsoluteHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim().length === 0) return false
  try {
    const url = new URL(value.trim())
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0
  } catch {
    return false
  }
}

function classifyAcademicIdentifier(value: unknown): AcademicIdentifierClassification {
  if (typeof value !== 'string' || value.trim().length === 0) return 'missing'
  const normalized = value.trim()
  if (isValidDoiSyntax(normalized)) return 'doi'
  return OTHER_PERSISTENT_IDENTIFIER_PATTERNS.find(([, pattern]) => pattern.test(normalized))?.[0]
    ?? 'unrecognized'
}

function validDoiValue(value: unknown): string | null {
  return isValidDoiSyntax(value) ? String(value).trim() : null
}

function recognizedIdentifierValue(value: unknown): string | null {
  const classification = classifyAcademicIdentifier(value)
  return classification !== 'missing' && classification !== 'unrecognized'
    ? String(value).trim()
    : null
}

function validAbsoluteHttpUrlValue(value: unknown): string | null {
  return isValidAbsoluteHttpUrl(value) ? String(value).trim() : null
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

function percentage(present: number, total: number): number {
  return total === 0 ? 0 : (present / total) * 100
}

function auditSet<T>(
  set: CoverageResult['set'],
  rows: readonly T[],
  checks: ReadonlyArray<FieldCheck<T>>,
): CoverageResult[] {
  return checks.map(check => {
    const present = rows.filter(row => hasValue(check.getter(row))).length
    const pct = percentage(present, rows.length)
    return {
      set,
      key: check.key,
      label: check.label,
      present,
      total: rows.length,
      pct,
      min: check.thresholds.min,
      minPresent: check.thresholds.minPresent ?? 0,
      target: check.thresholds.target,
      regressionPass: pct >= check.thresholds.min && present >= (check.thresholds.minPresent ?? 0),
      targetMet: pct >= check.thresholds.target,
    }
  })
}

const reportChecks: ReadonlyArray<FieldCheck<typeof reports[number]>> = [
  { key: 'year', label: 'year', getter: row => row.year, thresholds: { min: 100, target: 100 } },
  { key: 'institution', label: 'institution', getter: row => row.institution, thresholds: { min: 100, target: 100 } },
  { key: 'attribution', label: 'attribution*', getter: row => row.author || row.institution, thresholds: { min: 100, target: 100 } },
  { key: 'source_url', label: 'valid absolute http(s) sourceUrl', getter: row => validAbsoluteHttpUrlValue(row.sourceUrl), thresholds: { min: 90, target: 100 } },
  { key: 'author', label: 'author', getter: row => row.author, thresholds: { min: 22, target: 80 } },
  { key: 'doi', label: 'valid DOI syntax', getter: row => validDoiValue(row.doi), thresholds: { min: 15, target: 50 } },
  { key: 'access_date', label: 'accessedAt', getter: row => row.accessedAt, thresholds: { min: 66, minPresent: 92, target: 100 } },
  { key: 'provenance_type', label: 'explicit provenanceType', getter: row => knownReportProvenance(row.provenanceType), thresholds: { min: 89, minPresent: 125, target: 100 } },
]

const thesisChecks: ReadonlyArray<FieldCheck<typeof theses[number]>> = [
  { key: 'year', label: 'year', getter: row => row.year, thresholds: { min: 100, target: 100 } },
  { key: 'method', label: 'method', getter: row => row.method, thresholds: { min: 100, target: 100 } },
  { key: 'url', label: 'valid absolute http(s) url', getter: row => validAbsoluteHttpUrlValue(row.url), thresholds: { min: 100, target: 100 } },
  { key: 'persistent_identifier', label: 'recognized persistent identifier', getter: row => recognizedIdentifierValue(row.doi), thresholds: { min: 45, target: 90 } },
  { key: 'doi', label: 'valid DOI syntax', getter: row => validDoiValue(row.doi), thresholds: { min: 0, target: 50 } },
  { key: 'access_date', label: 'accessDate', getter: row => row.accessDate, thresholds: { min: 100, minPresent: 78, target: 100 } },
]

const sourceDocChecks: ReadonlyArray<FieldCheck<typeof sources[number]>> = [
  { key: 'year', label: 'year', getter: row => row.year, thresholds: { min: 93, target: 100 } },
  { key: 'author', label: 'author', getter: row => row.author, thresholds: { min: 90, target: 100 } },
  { key: 'url', label: 'valid absolute http(s) url', getter: row => validAbsoluteHttpUrlValue(row.url), thresholds: { min: 44, target: 95 } },
  { key: 'doi', label: 'valid DOI syntax', getter: row => validDoiValue(row.doi), thresholds: { min: 3, target: 40 } },
  { key: 'accessed_at', label: 'accessedAt', getter: row => row.accessedAt, thresholds: { min: 41, minPresent: 76, target: 100 } },
  { key: 'archived_url', label: 'archivedUrl', getter: row => row.archivedUrl, thresholds: { min: 0, target: 50 } },
  { key: 'provenance_type', label: 'explicit provenanceType', getter: row => knownSourceDocProvenance(row.provenanceType), thresholds: { min: 85, minPresent: 156, target: 100 } },
]

export function unavailableAcademicDatabaseAudit(reason: string): AcademicDatabaseAudit {
  return {
    status: 'unavailable',
    reason,
    counts: {
      reportRows: null,
      thesisRows: null,
      sourceDocRows: null,
      totalRows: null,
    },
    parity: {
      status: 'unavailable',
      identityStatus: 'unavailable',
      metadataStatus: 'unavailable',
      differences: [
        { set: 'Report', seedRows: reports.length, databaseRows: null, delta: null, matchedRows: null, seedOnlyIds: [], databaseOnlyIds: [], managedRuntimeIds: [], unclassifiedDatabaseOnlyIds: [], missingManagedRuntimeIds: [], classifiedParity: 'mismatch' },
        { set: 'Thesis', seedRows: theses.length, databaseRows: null, delta: null, matchedRows: null, seedOnlyIds: [], databaseOnlyIds: [], managedRuntimeIds: [], unclassifiedDatabaseOnlyIds: [], missingManagedRuntimeIds: [], classifiedParity: 'mismatch' },
        { set: 'SourceDoc', seedRows: sources.length, databaseRows: null, delta: null, matchedRows: null, seedOnlyIds: [], databaseOnlyIds: [], managedRuntimeIds: [], unclassifiedDatabaseOnlyIds: [], missingManagedRuntimeIds: [], classifiedParity: 'mismatch' },
      ],
      fieldDifferences: [],
    },
    coverage: [],
  }
}

export function buildAcademicDatabaseAudit(
  rows: AcademicDatabaseRows,
  managedRuntimeSourceDocIds: readonly string[] = [],
  seedCorpus: AcademicSeedCorpus = DEFAULT_ACADEMIC_SEED_CORPUS,
): AcademicDatabaseAudit {
  const counts = {
    reportRows: rows.reports.length,
    thesisRows: rows.theses.length,
    sourceDocRows: rows.sourceDocs.length,
    totalRows: rows.reports.length + rows.theses.length + rows.sourceDocs.length,
  }
  const differences = [
    identityDifference('Report', seedCorpus.reports.map(row => row.id), rows.reports.map(row => row.id)),
    identityDifference('Thesis', seedCorpus.theses.map(row => row.id), rows.theses.map(row => row.id)),
    identityDifference(
      'SourceDoc',
      seedCorpus.sources.map(row => row.id),
      rows.sourceDocs.map(row => row.id),
      managedRuntimeSourceDocIds,
    ),
  ]
  const fieldDifferences = [
    fieldParityDifference('Report', seedCorpus.reports, rows.reports, [
      { key: 'title', seed: row => row.title, database: row => row.title },
      { key: 'year', seed: row => row.year, database: row => row.year },
      { key: 'institution', seed: row => row.institution, database: row => row.institution },
      { key: 'author', seed: row => row.author, database: row => row.author },
      { key: 'sourceUrl', seed: row => row.sourceUrl, database: row => row.sourceUrl },
      { key: 'doi', seed: row => row.doi, database: row => row.doi },
      { key: 'provenanceType', seed: row => row.provenanceType, database: row => row.provenanceType },
      { key: 'accessedAt', seed: row => row.accessedAt, database: row => row.accessedAt },
    ]),
    fieldParityDifference('Thesis', seedCorpus.theses, rows.theses, [
      { key: 'title', seed: row => row.title, database: row => row.title },
      { key: 'year', seed: row => row.year, database: row => row.year },
      { key: 'institution', seed: row => row.institution, database: row => row.institution },
      { key: 'authors', seed: row => row.authors, database: row => row.authors },
      { key: 'method', seed: row => row.method, database: row => row.method },
      { key: 'url', seed: row => row.url, database: row => row.url },
      { key: 'doi', seed: row => row.doi, database: row => row.doi },
      { key: 'accessDate', seed: row => row.accessDate, database: row => row.accessDate },
    ]),
    fieldParityDifference('SourceDoc', seedCorpus.sources, rows.sourceDocs, [
      { key: 'filename', seed: row => row.filename, database: row => row.filename },
      { key: 'title', seed: row => row.title, database: row => row.title },
      { key: 'year', seed: row => row.year == null ? null : String(row.year), database: row => row.year },
      { key: 'author', seed: row => row.author, database: row => row.author },
      { key: 'sourceType', seed: row => row.type, database: row => row.sourceType },
      { key: 'description', seed: row => row.description, database: row => row.description },
      { key: 'relevance', seed: row => row.relevance, database: row => row.relevance },
      { key: 'url', seed: row => row.url, database: row => row.url },
      { key: 'doi', seed: row => row.doi, database: row => row.doi },
      { key: 'publisher', seed: row => row.publisher, database: row => row.publisher },
      { key: 'isDuplicate', seed: row => row.isDuplicate ?? false, database: row => row.isDuplicate },
      { key: 'provenanceType', seed: row => row.provenanceType ?? 'unknown', database: row => row.provenanceType },
      { key: 'accessedAt', seed: row => row.accessedAt, database: row => row.accessedAt },
      { key: 'archivedUrl', seed: row => row.archivedUrl, database: row => row.archivedUrl },
    ]),
  ]
  const databaseDuplicateLocatorGroups = buildDatabaseDuplicateLocatorGroups(rows)
  const coverage = [
    databaseCoverage('Report', 'year', 'year', rows.reports, row => row.year),
    databaseCoverage('Report', 'institution', 'institution', rows.reports, row => row.institution),
    databaseCoverage('Report', 'attribution', 'attribution*', rows.reports, row => row.author || row.institution),
    databaseCoverage('Report', 'source_url', 'valid absolute http(s) sourceUrl', rows.reports, row => validAbsoluteHttpUrlValue(row.sourceUrl)),
    databaseCoverage('Report', 'author', 'author', rows.reports, row => row.author),
    databaseCoverage('Report', 'doi', 'valid DOI syntax', rows.reports, row => validDoiValue(row.doi)),
    databaseCoverage('Report', 'access_date', 'accessedAt', rows.reports, row => row.accessedAt),
    databaseCoverage('Report', 'provenance_type', 'explicit provenanceType', rows.reports, row => knownReportProvenance(row.provenanceType)),
    databaseCoverage(
      'Report',
      'external_source_url',
      'valid absolute http(s) sourceUrl for externally classified rows',
      rows.reports.filter(reportNeedsPublicLocator),
      row => validAbsoluteHttpUrlValue(row.sourceUrl),
    ),
    databaseCoverage(
      'Report',
      'external_access_date',
      'accessedAt for externally classified rows',
      rows.reports.filter(reportNeedsPublicLocator),
      row => row.accessedAt,
    ),
    databaseDuplicateLocatorCoverage('Report', rows.reports.length, databaseDuplicateLocatorGroups),
    databaseAppraisalCoverage('Report', 'appraisal_status', 'appraisal disposition', rows.reports, rows.appraisals ?? [], 'disposition'),
    databaseAppraisalCoverage('Report', 'structured_appraisal', 'complete current structured appraisal or explicit exclusion', rows.reports, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('Report', 'study_design_and_bias', 'study design/risk of bias', rows.reports, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('Report', 'external_appraisal_gate', 'external appraisal gate', rows.reports, rows.appraisals ?? [], 'external'),
    databaseAppraisalCoverage('Report', 'external_release_disposition', 'external gate pass or explicit exclusion', rows.reports, rows.appraisals ?? [], 'external_resolution'),
    databaseClaimAnchorCoverage('Report', rows.reports, rows.fieldCitations),
    databaseExternalClaimAnchorCoverage('Report', rows.reports, rows.appraisals ?? [], rows.fieldCitations),
    databaseCoverage('Thesis', 'year', 'year', rows.theses, row => row.year),
    databaseCoverage('Thesis', 'institution', 'institution', rows.theses, row => row.institution),
    databaseCoverage('Thesis', 'attribution', 'authors', rows.theses, row => row.authors),
    databaseCoverage('Thesis', 'method', 'method', rows.theses, row => row.method),
    databaseCoverage('Thesis', 'url', 'valid absolute http(s) url', rows.theses, row => validAbsoluteHttpUrlValue(row.url)),
    databaseCoverage('Thesis', 'persistent_identifier', 'recognized persistent identifier', rows.theses, row => recognizedIdentifierValue(row.doi)),
    databaseCoverage('Thesis', 'doi', 'valid DOI syntax', rows.theses, row => validDoiValue(row.doi)),
    databaseCoverage('Thesis', 'access_date', 'accessDate', rows.theses, row => row.accessDate),
    databaseAppraisalCoverage('Thesis', 'appraisal_status', 'appraisal disposition', rows.theses, rows.appraisals ?? [], 'disposition'),
    databaseAppraisalCoverage('Thesis', 'structured_appraisal', 'complete current structured appraisal or explicit exclusion', rows.theses, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('Thesis', 'study_design_and_bias', 'study design/risk of bias', rows.theses, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('Thesis', 'external_appraisal_gate', 'external appraisal gate', rows.theses, rows.appraisals ?? [], 'external'),
    databaseAppraisalCoverage('Thesis', 'external_release_disposition', 'external gate pass or explicit exclusion', rows.theses, rows.appraisals ?? [], 'external_resolution'),
    databaseClaimAnchorCoverage('Thesis', rows.theses, rows.fieldCitations),
    databaseExternalClaimAnchorCoverage('Thesis', rows.theses, rows.appraisals ?? [], rows.fieldCitations),
    databaseCoverage('SourceDoc', 'year', 'year', rows.sourceDocs, row => row.year),
    databaseCoverage('SourceDoc', 'author', 'author', rows.sourceDocs, row => row.author),
    databaseCoverage('SourceDoc', 'url', 'valid absolute http(s) url', rows.sourceDocs, row => validAbsoluteHttpUrlValue(row.url)),
    databaseCoverage('SourceDoc', 'doi', 'valid DOI syntax', rows.sourceDocs, row => validDoiValue(row.doi)),
    databaseCoverage('SourceDoc', 'accessed_at', 'accessedAt', rows.sourceDocs, row => row.accessedAt),
    databaseCoverage('SourceDoc', 'archived_url', 'archivedUrl', rows.sourceDocs, row => row.archivedUrl),
    databaseCoverage('SourceDoc', 'provenance_type', 'explicit provenanceType', rows.sourceDocs, row => knownSourceDocProvenance(row.provenanceType)),
    databaseCoverage(
      'SourceDoc',
      'external_url',
      'valid absolute http(s) url for externally classified rows',
      rows.sourceDocs.filter(sourceDocNeedsPublicLocator),
      row => validAbsoluteHttpUrlValue(row.url),
    ),
    databaseCoverage(
      'SourceDoc',
      'external_accessed_at',
      'accessedAt for externally classified rows',
      rows.sourceDocs.filter(sourceDocNeedsPublicLocator),
      row => row.accessedAt,
    ),
    databaseDuplicateLocatorCoverage('SourceDoc', rows.sourceDocs.length, databaseDuplicateLocatorGroups),
    databaseAppraisalCoverage('SourceDoc', 'appraisal_status', 'appraisal disposition', rows.sourceDocs, rows.appraisals ?? [], 'disposition'),
    databaseAppraisalCoverage('SourceDoc', 'structured_appraisal', 'complete current structured appraisal or explicit exclusion', rows.sourceDocs, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('SourceDoc', 'study_design_and_bias', 'study design/risk of bias', rows.sourceDocs, rows.appraisals ?? [], 'structured'),
    databaseAppraisalCoverage('SourceDoc', 'external_appraisal_gate', 'external appraisal gate', rows.sourceDocs, rows.appraisals ?? [], 'external'),
    databaseAppraisalCoverage('SourceDoc', 'external_release_disposition', 'external gate pass or explicit exclusion', rows.sourceDocs, rows.appraisals ?? [], 'external_resolution'),
    databaseClaimAnchorCoverage('SourceDoc', rows.sourceDocs, rows.fieldCitations),
    databaseExternalClaimAnchorCoverage('SourceDoc', rows.sourceDocs, rows.appraisals ?? [], rows.fieldCitations),
  ]

  const identityStatus = differences.every(difference => difference.classifiedParity === 'match')
    ? 'match' as const
    : 'mismatch' as const
  const metadataStatus = fieldDifferences.every(difference => difference.mismatchedRows === 0)
    ? 'match' as const
    : 'mismatch' as const

  return {
    status: 'available',
    reason: null,
    counts,
    parity: {
      status: identityStatus === 'match' && metadataStatus === 'match' ? 'match' : 'mismatch',
      identityStatus,
      metadataStatus,
      differences,
      fieldDifferences,
    },
    coverage,
  }
}

function identityDifference(
  set: CoverageResult['set'],
  seedIds: string[],
  databaseIds: string[],
  managedRuntimeIds: readonly string[] = [],
) {
  const seed = new Set(seedIds)
  const database = new Set(databaseIds)
  const managed = new Set(managedRuntimeIds)
  const seedOnlyIds = [...seed].filter(id => !database.has(id)).sort()
  const databaseOnlyIds = [...database].filter(id => !seed.has(id)).sort()
  const presentManagedRuntimeIds = databaseOnlyIds.filter(id => managed.has(id))
  const unclassifiedDatabaseOnlyIds = databaseOnlyIds.filter(id => !managed.has(id))
  const missingManagedRuntimeIds = [...managed]
    .filter(id => !database.has(id))
    .sort()
  const classifiedParity = (
    seedOnlyIds.length === 0 &&
    unclassifiedDatabaseOnlyIds.length === 0 &&
    missingManagedRuntimeIds.length === 0
  ) ? 'match' as const : 'mismatch' as const
  return {
    set,
    seedRows: seedIds.length,
    databaseRows: databaseIds.length,
    delta: databaseIds.length - seedIds.length,
    matchedRows: [...seed].filter(id => database.has(id)).length,
    seedOnlyIds,
    databaseOnlyIds,
    managedRuntimeIds: presentManagedRuntimeIds,
    unclassifiedDatabaseOnlyIds,
    missingManagedRuntimeIds,
    classifiedParity,
  }
}

function fieldParityDifference<SeedRow extends { id: string }, DatabaseRow extends { id: string }>(
  set: CoverageResult['set'],
  seedRows: readonly SeedRow[],
  databaseRows: readonly DatabaseRow[],
  fields: ReadonlyArray<{
    key: string
    seed: (row: SeedRow) => unknown
    database: (row: DatabaseRow) => unknown
  }>,
) {
  const databaseById = new Map(databaseRows.map(row => [row.id, row]))
  const mismatchedFields: Record<string, number> = {}
  const mismatchedRowIds: string[] = []
  let matchedRows = 0

  for (const seedRow of seedRows) {
    const databaseRow = databaseById.get(seedRow.id)
    if (!databaseRow) continue
    matchedRows += 1
    let rowMismatch = false
    for (const field of fields) {
      const seedValue = normalizeParityValue(field.key, field.seed(seedRow))
      const databaseValue = normalizeParityValue(field.key, field.database(databaseRow))
      if (seedValue === databaseValue) continue
      mismatchedFields[field.key] = (mismatchedFields[field.key] ?? 0) + 1
      rowMismatch = true
    }
    if (rowMismatch) mismatchedRowIds.push(seedRow.id)
  }

  return {
    set,
    matchedRows,
    mismatchedRows: mismatchedRowIds.length,
    mismatchedRowIds: mismatchedRowIds.sort((left, right) => (
      left.localeCompare(right, undefined, { numeric: true })
    )),
    mismatchedFields: Object.fromEntries(
      Object.entries(mismatchedFields).sort(([left], [right]) => left.localeCompare(right)),
    ),
  }
}

function normalizeParityValue(field: string, value: unknown): string | number | boolean | null {
  if (value === undefined || value === null || value === '') return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (
    typeof value === 'string' &&
    /(date|accessedAt)$/i.test(field) &&
    /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)
  ) {
    return value.slice(0, 10)
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return JSON.stringify(value)
}

function databaseCoverage<T>(
  set: AcademicDatabaseCoverage['set'],
  key: string,
  label: string,
  rows: readonly T[],
  getter: (row: T) => unknown,
): AcademicDatabaseCoverage {
  const present = rows.filter(row => hasValue(getter(row))).length
  return {
    set,
    key,
    label,
    present,
    total: rows.length,
    pct: percentage(present, rows.length),
    modeled: true,
  }
}

function databaseDuplicateLocatorCoverage(
  set: DuplicateLocatorGroup['set'],
  total: number,
  groups: readonly DuplicateLocatorGroup[],
): AcademicDatabaseCoverage {
  const duplicateRows = groups
    .filter(group => group.set === set)
    .reduce((sum, group) => sum + group.rowCount, 0)
  const present = total - duplicateRows
  return {
    set,
    key: 'duplicate_locator_review',
    label: 'rows outside duplicate canonical locator groups',
    present,
    total,
    pct: percentage(present, total),
    modeled: true,
    note: `${duplicateRows} live rows share canonical stored locator keys within ${set}.`,
  }
}

function databaseClaimAnchorCoverage<T extends { id: string }>(
  set: AcademicDatabaseCoverage['set'],
  rows: readonly T[],
  fieldCitations: AcademicDatabaseRows['fieldCitations'],
): AcademicDatabaseCoverage {
  const anchoredIds = syntacticallyAnchoredIds(set, fieldCitations)
  const present = rows.filter(row => anchoredIds.has(row.id)).length
  return {
    set,
    key: 'claim_anchor',
    label: 'claim-level anchor',
    present,
    total: rows.length,
    pct: percentage(present, rows.length),
    modeled: true,
    note: 'FieldCitation is modeled; only rows with claimText and a pageRef or quote count as anchored.',
  }
}

function databaseExternalClaimAnchorCoverage<T extends { id: string }>(
  set: AcademicDatabaseCoverage['set'],
  rows: readonly T[],
  appraisals: NonNullable<AcademicDatabaseRows['appraisals']>,
  fieldCitations: AcademicDatabaseRows['fieldCitations'],
): AcademicDatabaseCoverage {
  const appraisalByTarget = databaseAppraisalsByTarget(set, appraisals)
  const externallyQualifiedIds = new Set(rows
    .filter(row => {
      const appraisal = appraisalByTarget.get(row.id)
      return appraisal
        ? evidenceTargetEligibleForExternalUse(set, row) &&
          assessDatabaseAppraisal(appraisal).externalGateSatisfied
        : false
    })
    .map(row => row.id))
  const anchoredIds = syntacticallyAnchoredIds(set, fieldCitations)
  const present = [...externallyQualifiedIds].filter(id => anchoredIds.has(id)).length

  return {
    set,
    key: 'external_claim_anchor',
    label: 'syntactic claim anchor for externally qualified evidence',
    present,
    total: externallyQualifiedIds.size,
    pct: percentage(present, externallyQualifiedIds.size),
    modeled: true,
    note: 'Only records already passing the independent appraisal/citation gate enter this denominator. A syntactic record anchor does not authorize every claim.',
  }
}

function syntacticallyAnchoredIds(
  set: AcademicDatabaseCoverage['set'],
  fieldCitations: AcademicDatabaseRows['fieldCitations'],
) {
  const entityType = set.toLowerCase()
  return new Set(fieldCitations
    .filter(row => (
      row.entityType.trim().toLowerCase() === entityType &&
      hasValue(row.claimText) &&
      (hasValue(row.citation.pageRef) || hasValue(row.citation.quote))
    ))
    .map(row => row.entityId))
}

function databaseAppraisalCoverage<T extends { id: string }>(
  set: AcademicDatabaseCoverage['set'],
  key: string,
  label: string,
  rows: readonly T[],
  appraisals: NonNullable<AcademicDatabaseRows['appraisals']>,
  mode: 'disposition' | 'structured' | 'external' | 'external_resolution',
): AcademicDatabaseCoverage {
  const appraisalByTarget = databaseAppraisalsByTarget(set, appraisals)
  const present = rows.filter(row => {
    const appraisal = appraisalByTarget.get(row.id)
    if (!appraisal) return false
    const assessment = assessDatabaseAppraisal(appraisal)
    const targetSatisfied = appraisalReviewBasisTargetsTarget(appraisal)
    const externalTargetEligible = evidenceTargetEligibleForExternalUse(set, row)
    if (mode === 'external') {
      return externalTargetEligible && assessment.externalGateSatisfied
    }
    if (mode === 'external_resolution') {
      return (externalTargetEligible && assessment.externalGateSatisfied) || (
        appraisal.status === 'excluded_not_applicable' &&
        assessment.structurallyComplete &&
        assessment.current &&
        targetSatisfied
      )
    }
    if (mode === 'structured') {
      return (appraisal.status === 'reviewed' || appraisal.status === 'excluded_not_applicable') &&
        assessment.structurallyComplete &&
        assessment.current &&
        targetSatisfied
    }
    return assessment.structurallyComplete && assessment.current && targetSatisfied
  }).length

  return {
    set,
    key,
    label,
    present,
    total: rows.length,
    pct: percentage(present, rows.length),
    modeled: true,
    note: mode === 'external'
      ? 'Requires a complete current review plus the conservative appraisal and citation policy; appraisal never upgrades citation readiness.'
      : mode === 'external_resolution'
        ? 'Every record must either pass the conservative external appraisal/citation gate or carry a complete current explicit exclusion; exclusions never authorize external use.'
      : mode === 'structured'
        ? 'Requires a complete reviewed appraisal or complete explicit exclusion bound to the current source hash; Thesis.method alone does not count.'
        : 'Counts complete current reviewed or explicitly excluded dispositions; missing rows and drafts remain open.',
  }
}

function evidenceTargetEligibleForExternalUse(
  set: AcademicDatabaseCoverage['set'],
  row: { id: string; provenanceType?: unknown },
) {
  if (set === 'Report') {
    return reportNeedsPublicLocator(row)
  }
  if (set === 'SourceDoc') {
    return sourceDocNeedsPublicLocator(row)
  }
  return true
}

function databaseAppraisalsByTarget(
  set: AcademicDatabaseCoverage['set'],
  appraisals: NonNullable<AcademicDatabaseRows['appraisals']>,
) {
  const targetField = set === 'Report'
    ? 'reportId'
    : set === 'Thesis'
      ? 'thesisId'
      : 'sourceDocId'
  return new Map(
    appraisals
      .filter(appraisal => appraisal[targetField])
      .map(appraisal => [String(appraisal[targetField]), appraisal] as const),
  )
}

function assessDatabaseAppraisal(
  appraisal: NonNullable<AcademicDatabaseRows['appraisals']>[number],
) {
  const citation = appraisal.reviewBasisCitation
  return assessEvidenceAppraisal({
    appraisal,
    currentSourceHash: citation?.fileHash ?? citation?.contentHash ?? null,
    reviewBasisCitationPolicySatisfied: citation
      ? assessCitationUse(citation, 'external').externalCitable
      : false,
    reviewBasisCitationTargetSatisfied: appraisalReviewBasisTargetsTarget(appraisal),
  })
}

function appraisalReviewBasisTargetsTarget(
  appraisal: NonNullable<AcademicDatabaseRows['appraisals']>[number],
) {
  const citation = appraisal.reviewBasisCitation
  if (!citation) return false
  if (appraisal.sourceDocId) {
    return citation.sourceDocId === appraisal.sourceDocId
      || citation.document?.sourceDoc?.id === appraisal.sourceDocId
  }
  if (appraisal.reportId) return citation.document?.report?.id === appraisal.reportId
  if (appraisal.thesisId) return citation.document?.thesis?.id === appraisal.thesisId
  return false
}

function buildIdentifierSyntaxProfile(
  set: AcademicIdentifierSyntaxProfile['set'],
  values: readonly unknown[],
): AcademicIdentifierSyntaxProfile {
  const classifications = values.map(classifyAcademicIdentifier)
  const count = (classification: AcademicIdentifierClassification) => (
    classifications.filter(value => value === classification).length
  )
  const otherPersistentIdentifierSchemes = {
    hdl: count('hdl'),
    diva2: count('diva2'),
    slu: count('slu'),
    urn: count('urn'),
  }
  const otherPersistentIdentifier = Object.values(otherPersistentIdentifierSchemes)
    .reduce((sum, value) => sum + value, 0)

  return {
    set,
    field: 'doi',
    total: values.length,
    nonEmpty: values.length - count('missing'),
    validDoi: count('doi'),
    otherPersistentIdentifier,
    unrecognizedNonEmpty: count('unrecognized'),
    otherPersistentIdentifierSchemes,
  }
}

function buildUrlSyntaxProfile(
  set: AcademicUrlSyntaxProfile['set'],
  field: AcademicUrlSyntaxProfile['field'],
  values: readonly unknown[],
): AcademicUrlSyntaxProfile {
  const nonEmpty = values.filter(hasValue).length
  const validAbsoluteHttpUrl = values.filter(isValidAbsoluteHttpUrl).length
  return {
    set,
    field,
    total: values.length,
    nonEmpty,
    validAbsoluteHttpUrl,
    invalidNonEmpty: nonEmpty - validAbsoluteHttpUrl,
    missing: values.length - nonEmpty,
  }
}

export function buildAcademicSourceQualitySnapshot(
  generatedAt = new Date().toISOString(),
  database = unavailableAcademicDatabaseAudit('Database scope was not supplied to the pure audit core.'),
): AcademicSourceQualitySnapshot {
  const checks = [
    ...auditSet('Report', reports, reportChecks),
    ...auditSet('Thesis', theses, thesisChecks),
    ...auditSet('SourceDoc', sources, sourceDocChecks),
  ]
  const failureCount = checks.filter(check => !check.regressionPass).length
  const externalReadiness = buildAcademicExternalReadiness(database)

  return {
    generatedAt,
    scope: {
      reportRows: reports.length,
      thesisRows: theses.length,
      sourceDocRows: sources.length,
      totalRows: reports.length + theses.length + sources.length,
      database,
    },
    urlSyntax: [
      buildUrlSyntaxProfile('Report', 'sourceUrl', reports.map(row => row.sourceUrl)),
      buildUrlSyntaxProfile('Thesis', 'url', theses.map(row => row.url)),
      buildUrlSyntaxProfile('SourceDoc', 'url', sources.map(row => row.url)),
    ],
    identifierSyntax: [
      buildIdentifierSyntaxProfile('Report', reports.map(row => row.doi)),
      buildIdentifierSyntaxProfile('Thesis', theses.map(row => row.doi)),
      buildIdentifierSyntaxProfile('SourceDoc', sources.map(row => row.doi)),
    ],
    regressionGate: {
      status: failureCount === 0 ? 'pass' : 'fail',
      failureCount,
      checks,
      meaning: 'Protects minimum seed-metadata coverage. A pass is not academic or external readiness.',
    },
    externalReadiness,
  }
}

export function buildExternalReadinessDimensions(
  database: AcademicDatabaseAudit,
  seedCorpus: AcademicSeedCorpus = DEFAULT_ACADEMIC_SEED_CORPUS,
): ExternalReadinessDimension[] {
  const dimension = (
    key: string,
    label: string,
    set: ExternalReadinessDimension['set'],
    present: number,
    total: number,
    target: number,
    status: ExternalReadinessDimension['status'],
    note: string,
  ): ExternalReadinessDimension => ({
    key,
    label,
    set,
    present,
    total,
    pct: percentage(present, total),
    target,
    status,
    note,
  })

  const metric = (
    set: AcademicDatabaseCoverage['set'],
    key: string,
    fallbackPresent: number,
    fallbackTotal: number,
  ) => {
    if (database.status !== 'available') return { present: fallbackPresent, total: fallbackTotal }
    const coverage = database.coverage.find(row => row.set === set && row.key === key)
    return coverage
      ? { present: coverage.present, total: coverage.total }
      : { present: 0, total: fallbackTotal }
  }

  const seedReports = seedCorpus.reports
  const seedTheses = seedCorpus.theses
  const seedSources = seedCorpus.sources
  const reportExternalRows = seedReports.filter(reportNeedsPublicLocator)
  const sourceDocExternalRows = seedSources.filter(sourceDocNeedsPublicLocator)
  const reportProvenance = metric(
    'Report',
    'provenance_type',
    seedReports.filter(row => knownReportProvenance(row.provenanceType)).length,
    seedReports.length,
  )
  const reportLocators = metric(
    'Report',
    'external_source_url',
    reportExternalRows.filter(row => isValidAbsoluteHttpUrl(row.sourceUrl)).length,
    reportExternalRows.length,
  )
  const reportAccessDates = metric(
    'Report',
    'external_access_date',
    reportExternalRows.filter(row => hasValue(row.accessedAt)).length,
    reportExternalRows.length,
  )
  const thesisLocators = metric(
    'Thesis',
    'url',
    seedTheses.filter(row => isValidAbsoluteHttpUrl(row.url)).length,
    seedTheses.length,
  )
  const thesisAccessDates = metric(
    'Thesis',
    'access_date',
    seedTheses.filter(row => hasValue(row.accessDate)).length,
    seedTheses.length,
  )
  const thesisMethods = metric(
    'Thesis',
    'method',
    seedTheses.filter(row => hasValue(row.method)).length,
    seedTheses.length,
  )
  const sourceDocProvenance = metric(
    'SourceDoc',
    'provenance_type',
    seedSources.filter(row => knownSourceDocProvenance(row.provenanceType)).length,
    seedSources.length,
  )
  const sourceDocLocators = metric(
    'SourceDoc',
    'external_url',
    sourceDocExternalRows.filter(row => isValidAbsoluteHttpUrl(row.url)).length,
    sourceDocExternalRows.length,
  )
  const sourceDocAccessDates = metric(
    'SourceDoc',
    'external_accessed_at',
    sourceDocExternalRows.filter(row => hasValue(row.accessedAt)).length,
    sourceDocExternalRows.length,
  )
  const totalRows = database.counts.totalRows ?? seedReports.length + seedTheses.length + seedSources.length
  const seedDuplicateLocatorGroups = buildDuplicateLocatorGroups(seedCorpus)
  const seedReportDuplicateRows = seedDuplicateLocatorGroups
    .filter(group => group.set === 'Report')
    .reduce((sum, group) => sum + group.rowCount, 0)
  const seedSourceDocDuplicateRows = seedDuplicateLocatorGroups
    .filter(group => group.set === 'SourceDoc')
    .reduce((sum, group) => sum + group.rowCount, 0)
  const reportDuplicateReview = metric(
    'Report',
    'duplicate_locator_review',
    seedReports.length - seedReportDuplicateRows,
    seedReports.length,
  )
  const sourceDocDuplicateReview = metric(
    'SourceDoc',
    'duplicate_locator_review',
    seedSources.length - seedSourceDocDuplicateRows,
    seedSources.length,
  )
  const locatorAuditedRows = reportDuplicateReview.total + sourceDocDuplicateReview.total
  const locatorDuplicateRows =
    reportDuplicateReview.total - reportDuplicateReview.present +
    sourceDocDuplicateReview.total - sourceDocDuplicateReview.present
  const databaseScopeReady = database.status === 'available' && database.parity.status === 'match'
  const appraisalTotal = database.counts.totalRows ?? totalRows
  const appraisalDispositionRows = database.coverage
    .filter(row => row.key === 'appraisal_status' && row.modeled)
    .reduce((sum, row) => sum + row.present, 0)
  const structuredAppraisalRows = database.coverage
    .filter(row => row.key === 'structured_appraisal' && row.modeled)
    .reduce((sum, row) => sum + row.present, 0)
  const externalAppraisalRows = database.coverage
    .filter(row => row.key === 'external_appraisal_gate' && row.modeled)
    .reduce((sum, row) => sum + row.present, 0)
  const externalReleaseDispositionRows = database.coverage
    .filter(row => row.key === 'external_release_disposition' && row.modeled)
    .reduce((sum, row) => sum + row.present, 0)
  const externalClaimAnchorRows = database.coverage
    .filter(row => row.key === 'external_claim_anchor' && row.modeled)
    .reduce((sum, row) => sum + row.present, 0)
  const externalClaimAnchorTotal = database.coverage
    .filter(row => row.key === 'external_claim_anchor' && row.modeled)
    .reduce((sum, row) => sum + row.total, 0)

  return [
    dimension(
      'database_scope',
      'Live database available with seed identity parity',
      'Corpus',
      databaseScopeReady ? 1 : 0,
      1,
      100,
      database.status === 'available' ? databaseScopeReady ? 'ready' : 'gap' : 'unsupported',
      database.status === 'available'
        ? `Seed/database identity parity is ${database.parity.status}; external readiness cannot be granted across mixed scopes.`
        : 'A live read-only database audit is required; seed-only evidence cannot prove runtime readiness.',
    ),
    dimension('report_provenance', 'Explicit evidence provenance', 'Report', reportProvenance.present, reportProvenance.total, 100, reportProvenance.present === reportProvenance.total ? 'ready' : 'gap', 'Unknown Report provenance remains fail-closed; internal syntheses, registers, composite rows, and blocked records do not require an invented work URL.'),
    dimension('report_locator', 'Valid absolute http(s) locator syntax for externally classified rows', 'Report', reportLocators.present, reportLocators.total, 100, reportLocators.present === reportLocators.total ? 'ready' : 'gap', 'Only Reports explicitly classified as external_report or external_article are in this denominator; URL syntax does not prove live availability.'),
    dimension('thesis_locator', 'Valid absolute http(s) locator syntax', 'Thesis', thesisLocators.present, thesisLocators.total, 100, thesisLocators.present === thesisLocators.total ? 'ready' : 'gap', 'Every externally used thesis needs verified work-level locator metadata; this count validates URL syntax only.'),
    dimension('source_doc_provenance', 'Explicit evidence provenance', 'SourceDoc', sourceDocProvenance.present, sourceDocProvenance.total, 100, sourceDocProvenance.present === sourceDocProvenance.total ? 'ready' : 'gap', 'Unknown SourceDoc provenance remains fail-closed; internal evidence and duplicates do not require a public publication URL.'),
    dimension('source_doc_locator', 'Valid absolute http(s) locator syntax for externally classified rows', 'SourceDoc', sourceDocLocators.present, sourceDocLocators.total, 100, sourceDocLocators.present === sourceDocLocators.total ? 'ready' : 'gap', 'Only SourceDocs explicitly classified as external publications, official sources, self-reports, commissioned reports, peer-reviewed works, or advocacy positions are in this denominator.'),
    dimension('duplicate_locator_review', 'Rows outside duplicate canonical locator groups', 'Corpus', locatorAuditedRows - locatorDuplicateRows, locatorAuditedRows, 100, locatorDuplicateRows === 0 ? 'ready' : 'gap', `${locatorDuplicateRows} Report/SourceDoc ${database.status === 'available' ? 'live' : 'seed'} rows share canonical stored locator keys and require record-level duplicate, generic-locator, or misbinding review.`),
    dimension('report_access_date', 'Access date for externally classified rows', 'Report', reportAccessDates.present, reportAccessDates.total, 100, reportAccessDates.present === reportAccessDates.total ? 'ready' : 'gap', 'Source policy requires an evidence-based ISO access date for externally used URLs; internal and unknown rows are excluded.'),
    dimension('thesis_access_date', 'Access date', 'Thesis', thesisAccessDates.present, thesisAccessDates.total, 100, thesisAccessDates.present === thesisAccessDates.total ? 'ready' : 'gap', 'Source policy requires an evidence-based ISO access date for externally used URLs.'),
    dimension('source_doc_access_date', 'Access date for externally classified rows', 'SourceDoc', sourceDocAccessDates.present, sourceDocAccessDates.total, 100, sourceDocAccessDates.present === sourceDocAccessDates.total ? 'ready' : 'gap', 'Source policy requires an evidence-based ISO access date for externally used URLs; internal and unknown rows are excluded from this denominator.'),
    dimension(
      'appraisal_status',
      'Complete current appraisal disposition',
      'Corpus',
      database.status === 'available' ? appraisalDispositionRows : 0,
      appraisalTotal,
      100,
      database.status === 'available'
        ? appraisalDispositionRows === appraisalTotal ? 'ready' : 'gap'
        : 'unsupported',
      database.status === 'available'
        ? 'The structured model is active. Missing rows, drafts, stale source hashes, and incomplete reviews remain fail-closed; excluded rows close review disposition but never authorize external use.'
        : 'A live database audit is required to measure the structured EvidenceAppraisal model.',
    ),
    dimension('thesis_method', 'Method summary', 'Thesis', thesisMethods.present, thesisMethods.total, 100, thesisMethods.present === thesisMethods.total ? 'ready' : 'gap', 'Method summaries are present but are not a risk-of-bias assessment.'),
    dimension(
      'study_design',
      'Complete current structured appraisal or explicit exclusion',
      'Corpus',
      database.status === 'available' ? structuredAppraisalRows : 0,
      appraisalTotal,
      100,
      database.status === 'available'
        ? structuredAppraisalRows === appraisalTotal ? 'ready' : 'gap'
        : 'unsupported',
      database.status === 'available'
        ? 'Reviewed rows require full-text basis, design, applicability, limitations, risk-of-bias, reviewer provenance, basis citation, and current source hash. Complete current exclusions close the row without authorizing it.'
        : 'A live database audit is required to measure structured methodology, applicability, limitations, and risk-of-bias.',
    ),
    dimension(
      'external_appraisal_gate',
      'External-use disposition resolved',
      'Corpus',
      database.status === 'available' ? externalReleaseDispositionRows : 0,
      appraisalTotal,
      100,
      database.status === 'available'
        ? externalReleaseDispositionRows === appraisalTotal ? 'ready' : 'gap'
        : 'unsupported',
      `${externalAppraisalRows} records currently pass the conservative external gate. Every other row needs a complete current explicit exclusion; exclusions never authorize use, and an appraisal cannot promote a citation.`,
    ),
    dimension(
      'claim_anchor',
      'Externally qualified records with a syntactic claim anchor',
      'Corpus',
      database.status === 'available' ? externalClaimAnchorRows : 0,
      database.status === 'available' ? externalClaimAnchorTotal : totalRows,
      100,
      database.status === 'available'
        ? externalClaimAnchorTotal > 0 && externalClaimAnchorRows === externalClaimAnchorTotal
          ? 'ready'
          : 'gap'
        : 'unsupported',
      database.status === 'available'
        ? 'The denominator contains only records already passing the independent appraisal/citation gate and must be non-empty. One claimText plus pageRef/quote is still only a record-level onboarding check; every emitted claim remains separately fail-closed under citation and appraisal policy.'
        : 'Database FieldCitation evidence was unavailable, and the seed contract does not encode a complete claim denominator.',
    ),
  ]
}

export function buildAcademicExternalReadiness(
  database: AcademicDatabaseAudit,
  seedCorpus: AcademicSeedCorpus = DEFAULT_ACADEMIC_SEED_CORPUS,
): AcademicSourceQualitySnapshot['externalReadiness'] {
  const dimensions = buildExternalReadinessDimensions(database, seedCorpus)
  const blockers = dimensions
    .filter(dimension => dimension.status !== 'ready')
    .map(dimension => `${dimension.label}: ${dimension.note}`)

  return {
    status: blockers.length === 0 ? 'ready' : 'not_ready',
    dimensions,
    blockers,
    meaning: 'Requires live seed/runtime parity; complete provenance, locator, access-date, and duplicate review; a complete current appraisal or explicit exclusion for every corpus row; and a non-empty externally qualified subset whose records have syntactic claim anchors. Exclusions never authorize use, and every emitted claim remains subject to the independent citation/appraisal gate. URL checks validate syntax only, not network availability.',
  }
}

const LIKELY_MISBINDING_REVIEW_NOTES: Readonly<Record<string, string>> = {
  'Report:dagligvaretilsynet-aarsrapport-2024': 'The record title says Dagligvaretilsynet annual report 2024, while the stored URL path names the separate R15-2023 EMV mapping report.',
}

function canonicalizeStoredUrl(value: unknown): {
  canonicalLocator: string
  locatorSyntax: DuplicateLocatorGroup['locatorSyntax']
} | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const trimmed = value.trim()
  if (!isValidAbsoluteHttpUrl(trimmed)) {
    return {
      canonicalLocator: trimmed.toLowerCase().replace(/\/+$/, ''),
      locatorSyntax: 'invalid_url_syntax',
    }
  }

  const url = new URL(trimmed)
  url.hash = ''
  url.protocol = url.protocol.toLowerCase()
  url.hostname = url.hostname.toLowerCase()
  if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
    url.port = ''
  }
  if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, '')
  return {
    canonicalLocator: url.toString(),
    locatorSyntax: 'valid_absolute_http_url',
  }
}

type DuplicateLocatorInput = {
  set: DuplicateLocatorGroup['set']
  id: string
  title: string
  rawLocator: string | null | undefined
}

function buildDuplicateLocatorGroups(
  seedCorpus: AcademicSeedCorpus = DEFAULT_ACADEMIC_SEED_CORPUS,
): DuplicateLocatorGroup[] {
  return buildDuplicateLocatorGroupsFromInputs([
    ...seedCorpus.reports.map(row => ({
      set: 'Report' as const,
      id: row.id,
      title: row.title,
      rawLocator: row.sourceUrl,
    })),
    ...seedCorpus.sources.map(row => ({
      set: 'SourceDoc' as const,
      id: row.id,
      title: row.title ?? row.description,
      rawLocator: row.url,
    })),
  ])
}

function buildDatabaseDuplicateLocatorGroups(
  rows: AcademicDatabaseRows,
): DuplicateLocatorGroup[] {
  return buildDuplicateLocatorGroupsFromInputs([
    ...rows.reports.map(row => ({
      set: 'Report' as const,
      id: row.id,
      title: row.title,
      rawLocator: row.sourceUrl,
    })),
    ...rows.sourceDocs.map(row => ({
      set: 'SourceDoc' as const,
      id: row.id,
      title: row.title ?? row.description,
      rawLocator: row.url,
    })),
  ])
}

function buildDuplicateLocatorGroupsFromInputs(
  inputs: readonly DuplicateLocatorInput[],
): DuplicateLocatorGroup[] {
  const grouped = new Map<string, {
    set: DuplicateLocatorGroup['set']
    canonicalLocator: string
    locatorSyntax: DuplicateLocatorGroup['locatorSyntax']
    rows: DuplicateLocatorGroup['rows']
  }>()

  for (const input of inputs) {
    const canonical = canonicalizeStoredUrl(input.rawLocator)
    if (!canonical || !input.rawLocator) continue
    const key = `${input.set}\u0000${canonical.locatorSyntax}\u0000${canonical.canonicalLocator}`
    const reviewNote = LIKELY_MISBINDING_REVIEW_NOTES[`${input.set}:${input.id}`] ?? null
    const group = grouped.get(key) ?? {
      set: input.set,
      canonicalLocator: canonical.canonicalLocator,
      locatorSyntax: canonical.locatorSyntax,
      rows: [],
    }
    group.rows.push({
      id: input.id,
      title: input.title,
      rawLocator: input.rawLocator.trim(),
      likelyMisbinding: reviewNote !== null,
      reviewNote,
    })
    grouped.set(key, group)
  }

  return [...grouped.values()]
    .filter(group => group.rows.length > 1)
    .map(group => ({
      ...group,
      rowCount: group.rows.length,
      rows: group.rows.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true })),
      nextAction: group.locatorSyntax === 'valid_absolute_http_url'
        ? 'Verify that the canonical URL identifies each named work. Merge true duplicate records or replace generic/misbound locators with authoritative work-level URLs; do not auto-correct from titles.'
        : 'Replace each bare-domain or otherwise invalid value with a verified absolute http(s) work-level URL and access date; do not infer paths from titles.',
    }))
    .sort((a, b) => a.set.localeCompare(b.set) || a.canonicalLocator.localeCompare(b.canonicalLocator))
}

export function buildAcademicSourceQualityRepairQueue(
  generatedAt = new Date().toISOString(),
  database = unavailableAcademicDatabaseAudit('Database scope was not supplied to the repair queue.'),
): AcademicSourceQualityRepairQueue {
  const repositoryPathsByBasename = buildRepositoryPathIndex()
  const reportProvenanceReviewRows = reports
    .filter(row => normalizedReportProvenance(row.provenanceType) === 'unknown')
    .map(row => ({
      id: row.id,
      title: row.title,
      reportCategory: row.reportCategory,
      rawUrl: hasValue(row.sourceUrl) ? row.sourceUrl!.trim() : null,
      nextAction: 'Classify the evidence role before deciding whether this row is an external work, internal synthesis/register, composite record, or blocked source.',
    }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  const sourceDocProvenanceReviewRows = sources
    .filter(row => normalizedSourceDocProvenance(row.provenanceType) === 'unknown')
    .map(row => ({
      id: row.id,
      title: row.title ?? row.description,
      filename: row.filename,
      sourceType: row.type,
      rawUrl: hasValue(row.url) ? row.url!.trim() : null,
      nextAction: 'Classify the evidence role from the record and underlying artifact before deciding whether it needs a public locator, local evidence identity, or duplicate handling.',
    }))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  const sourceDocUrlRows = sources
    .filter(row => sourceDocNeedsPublicLocator(row) && !isValidAbsoluteHttpUrl(row.url))
    .map(row => {
      const declaredPathExists = existsSync(join(process.cwd(), row.filename))
      const repositoryMatches = repositoryPathsByBasename.get(basename(row.filename)) ?? []
      const doi = validDoiValue(row.doi)
      const rawUrl = hasValue(row.url) ? row.url!.trim() : null
      const locatorIssue = rawUrl === null
        ? 'missing_url' as const
        : 'invalid_absolute_http_url' as const
      return {
        id: row.id,
        title: row.title ?? row.description,
        filename: row.filename,
        declaredPathExists,
        repositoryMatches,
        doi,
        isDuplicate: row.isDuplicate === true,
        rawUrl,
        locatorIssue,
        missingFields: [
          locatorIssue === 'missing_url' ? 'url' : 'validAbsoluteHttpUrl',
          ...(!hasValue(row.accessedAt) ? ['accessedAt'] : []),
          ...(!hasValue(row.archivedUrl) ? ['archivedUrl'] : []),
        ],
        nextAction: doi
          ? 'Verify the existing DOI against the named work, then add its canonical DOI URL and evidence-based access date.'
          : locatorIssue === 'invalid_absolute_http_url'
            ? 'Replace the bare-domain or otherwise invalid value with a verified absolute http(s) work-level URL and evidence-based access date; do not infer a path from the title.'
          : declaredPathExists || repositoryMatches.length > 0
            ? 'Inspect the matched repository file for a named primary locator; do not infer a URL from the title.'
            : 'Resolve the named source manually and record verified canonical locator metadata plus an evidence-based access date; keep it internal until verified.',
      }
    })
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  const duplicateLocatorGroups = buildDuplicateLocatorGroups()
  const reportDuplicateGroups = duplicateLocatorGroups.filter(group => group.set === 'Report')
  const sourceDocDuplicateGroups = duplicateLocatorGroups.filter(group => group.set === 'SourceDoc')
  const reportExternalRows = reports.filter(reportNeedsPublicLocator)
  const accessDateReviewRows: AcademicSourceQualityRepairQueue['accessDateReviewRows'] = [
    ...reportExternalRows
      .filter(row => !hasValue(row.accessedAt) && hasValue(row.sourceUrl))
      .map(row => ({
        set: 'Report' as const,
        id: row.id,
        title: row.title,
        url: row.sourceUrl!.trim(),
        nextAction: 'Open the authoritative work-level locator, verify the named work, and record the actual access date.',
      })),
    ...theses
      .filter(row => !hasValue(row.accessDate) && hasValue(row.url))
      .map(row => ({
        set: 'Thesis' as const,
        id: row.id,
        title: row.title,
        url: row.url.trim(),
        nextAction: 'Open the thesis repository record, verify the named thesis, and record the actual access date.',
      })),
    ...sources
      .filter(row => (
        sourceDocNeedsPublicLocator(row)
        && !hasValue(row.accessedAt)
        && hasValue(row.url)
      ))
      .map(row => ({
        set: 'SourceDoc' as const,
        id: row.id,
        title: row.title ?? row.description,
        url: row.url!.trim(),
        nextAction: 'Open the authoritative work-level locator, verify the named work, and record the actual access date.',
      })),
  ].sort((left, right) => left.set.localeCompare(right.set) || left.id.localeCompare(right.id))
  const databaseGap = (
    set: AcademicDatabaseCoverage['set'],
    key: string,
    fallback: number,
  ) => {
    if (database.status !== 'available') return fallback
    const coverage = database.coverage.find(row => row.set === set && row.key === key)
    return coverage ? coverage.total - coverage.present : fallback
  }
  const corpusRows = database.counts.totalRows ?? reports.length + theses.length + sources.length
  const externalClaimAnchorGap = database.status === 'available'
    ? database.coverage
      .filter(row => row.key === 'external_claim_anchor' && row.modeled)
      .reduce((sum, row) => sum + row.total - row.present, 0)
    : corpusRows
  const reportProvenanceGap = databaseGap(
    'Report',
    'provenance_type',
    reportProvenanceReviewRows.length,
  )
  const sourceDocProvenanceGap = databaseGap(
    'SourceDoc',
    'provenance_type',
    sourceDocProvenanceReviewRows.length,
  )
  const accessDateGap =
    databaseGap(
      'Report',
      'external_access_date',
      reportExternalRows.filter(row => !hasValue(row.accessedAt)).length,
    ) +
    databaseGap(
      'Thesis',
      'access_date',
      theses.filter(row => !hasValue(row.accessDate)).length,
    ) +
    databaseGap(
      'SourceDoc',
      'external_accessed_at',
      sources.filter(row => sourceDocNeedsPublicLocator(row) && !hasValue(row.accessedAt)).length,
    )
  const appraisalDispositionGap = ['Report', 'Thesis', 'SourceDoc']
    .reduce((sum, set) => sum + databaseGap(
      set as AcademicDatabaseCoverage['set'],
      'appraisal_status',
      set === 'Report' ? reports.length : set === 'Thesis' ? theses.length : sources.length,
    ), 0)
  const structuredAppraisalGap = ['Report', 'Thesis', 'SourceDoc']
    .reduce((sum, set) => sum + databaseGap(
      set as AcademicDatabaseCoverage['set'],
      'structured_appraisal',
      set === 'Report' ? reports.length : set === 'Thesis' ? theses.length : sources.length,
    ), 0)
  const unclassifiedIdentityIds = database.status === 'available'
    ? database.parity.differences.flatMap(difference => (
        difference.unclassifiedDatabaseOnlyIds.map(id => `${difference.set}:${id}`)
      ))
    : []
  const appraisalPilotIds = ['SourceDoc:src-30', 'SourceDoc:src-32', 'SourceDoc:src-45']

  return {
    generatedAt,
    reportProvenanceReviewCount: reportProvenanceReviewRows.length,
    reportInternalEvidenceCount: reports.filter(reportIsInternalEvidence).length,
    reportProvenanceReviewRows,
    sourceDocProvenanceReviewCount: sourceDocProvenanceReviewRows.length,
    sourceDocInternalEvidenceCount: sources.filter(sourceDocIsInternalEvidence).length,
    sourceDocProvenanceReviewRows,
    sourceDocUrlGapCount: sourceDocUrlRows.length,
    sourceDocActiveUrlGapCount: sourceDocUrlRows.filter(row => !row.isDuplicate).length,
    sourceDocDuplicateUrlGapCount: sourceDocUrlRows.filter(row => row.isDuplicate).length,
    sourceDocUrlRows,
    accessDateReviewCount: accessDateReviewRows.length,
    liveAccessDateGapCount: accessDateGap,
    accessDateReviewRows,
    duplicateLocatorSummary: {
      reportGroups: reportDuplicateGroups.length,
      reportRows: reportDuplicateGroups.reduce((sum, group) => sum + group.rowCount, 0),
      sourceDocGroups: sourceDocDuplicateGroups.length,
      sourceDocRows: sourceDocDuplicateGroups.reduce((sum, group) => sum + group.rowCount, 0),
      validAbsoluteHttpUrlGroups: duplicateLocatorGroups.filter(group => group.locatorSyntax === 'valid_absolute_http_url').length,
      invalidUrlSyntaxGroups: duplicateLocatorGroups.filter(group => group.locatorSyntax === 'invalid_url_syntax').length,
    },
    duplicateLocatorGroups,
    executionWaves: [
      {
        priority: 1,
        key: 'identity_truth_gate',
        label: 'Resolve unclassified database-only evidence identities',
        scopeCount: unclassifiedIdentityIds.length,
        targetIds: unclassifiedIdentityIds,
        prerequisites: [
          'Verify the named work from an authoritative source before promotion.',
          'Do not copy synthetic or unverified identifiers into seed data.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'Zero unclassified database-only Report, Thesis, or SourceDoc identities.',
      },
      {
        priority: 2,
        key: 'appraisal_pilot',
        label: 'Run the first full-text appraisal and claim-anchor pilot',
        scopeCount: appraisalPilotIds.length,
        targetIds: appraisalPilotIds,
        prerequisites: [
          'Use the already verified full-text hash and page/quote anchor as review evidence.',
          'Bind the appraisal to a citation for the same target; never infer review fields from metadata.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'Three named-reviewer dispositions pass structural, current-hash, target-binding, and citation-policy checks; external eligibility may remain blocked.',
      },
      {
        priority: 3,
        key: 'external_access_dates',
        label: 'Capture evidence-based access dates for externally classified works',
        scopeCount: accessDateGap,
        targetIds: [],
        prerequisites: [
          'Re-open the authoritative work-level locator.',
          'Record the actual verification date; never manufacture or bulk-assume dates.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'All externally classified Report, Thesis, and SourceDoc rows have verified access dates.',
      },
      {
        priority: 4,
        key: 'provenance_classification',
        label: 'Classify remaining unknown evidence roles',
        scopeCount: reportProvenanceGap + sourceDocProvenanceGap,
        targetIds: [],
        prerequisites: [
          'Inspect the underlying work or local artifact.',
          'Keep internal syntheses, composite records, duplicates, and blocked material distinct from external publications.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'Zero unknown Report and SourceDoc provenance rows in the live corpus.',
      },
      {
        priority: 5,
        key: 'appraisal_corpus',
        label: 'Complete the remaining evidence-appraisal corpus',
        scopeCount: Math.max(0, appraisalDispositionGap - appraisalPilotIds.length),
        targetIds: [],
        prerequisites: [
          'Complete the appraisal pilot and approve its review runbook.',
          'Require full text, reviewer identity, current source hash, same-target basis citation, method, applicability, limitations, and risk of bias.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'Every evidence record has a complete current reviewed or explicit excluded disposition; only conservative-gate reviews can support external claims.',
      },
      {
        priority: 6,
        key: 'claim_anchor_expansion',
        label: 'Expand claim-level page, section, table, and quote anchors',
        scopeCount: externalClaimAnchorGap,
        targetIds: [],
        prerequisites: [
          'Define the external-claim denominator for each reviewed work.',
          'Do not treat one anchored claim as complete source coverage.',
        ],
        humanReviewRequired: true,
        exitCriteria: 'Every externally used claim is mapped to an exact evidence anchor and independently passes citation plus appraisal policy.',
      },
    ],
    systemGaps: [
      {
        key: 'report_provenance_review',
        affectedRows: reportProvenanceGap,
        action: 'Classify each unknown Report as an external report/article, internal synthesis/register, composite record, or blocked source before applying locator and citation policy.',
      },
      {
        key: 'invalid_source_doc_url_syntax',
        affectedRows: sources.filter(row => sourceDocNeedsPublicLocator(row) && hasValue(row.url) && !isValidAbsoluteHttpUrl(row.url)).length,
        action: 'For externally classified SourceDocs only, replace bare-domain, relative, or malformed values with verified absolute http(s) work-level URLs; syntax validation does not prove availability.',
      },
      {
        key: 'source_doc_provenance_review',
        affectedRows: sourceDocProvenanceGap,
        action: 'Classify each unknown row as external evidence, internal primary material, internal synthesis, or duplicate before applying locator and citation policy.',
      },
      {
        key: 'internal_evidence_identity',
        affectedRows: sources.filter(sourceDocIsInternalEvidence).length,
        action: 'Preserve local path or document identity and content hash for internal evidence; do not invent a public URL.',
      },
      {
        key: 'duplicate_locator_reconciliation',
        affectedRows: duplicateLocatorGroups.reduce((sum, group) => sum + group.rowCount, 0),
        action: 'Review shared canonical locator groups for true duplicates, generic landing pages, and likely misbindings before external use; do not auto-correct URLs from titles.',
      },
      {
        key: 'access_dates',
        affectedRows: accessDateGap,
        action: 'Capture verified ISO access dates from evidence; never backfill dates by assumption.',
      },
      {
        key: 'peer_review_appraisal',
        affectedRows: appraisalDispositionGap,
        action: 'Complete named, full-text appraisal dispositions in the active model; bind each review to the current source hash and a citation for the same target. Never infer appraisal from metadata.',
      },
      {
        key: 'study_design_and_bias',
        affectedRows: structuredAppraisalGap,
        action: 'Add structured methodology/applicability, sample/coverage, limitations, and risk-of-bias fields before causal use, or record a complete current explicit exclusion. Thesis.method alone is not a risk-of-bias assessment; exclusions never authorize external use.',
      },
      {
        key: 'claim_anchors',
        affectedRows: externalClaimAnchorGap,
        action: 'The count is externally qualified records without even one syntactic anchor; zero qualifying records is handled by the appraisal gate, not hidden here. Map every emitted claim to page, section, table, quote, or equivalent evidence; one anchored claim must not mark a record complete.',
      },
    ],
  }
}

function buildRepositoryPathIndex(): Map<string, string[]> {
  const root = process.cwd()
  const index = new Map<string, string[]>()
  const roots = [
    'research/bibliotek',
    'research/norden',
    'research/norge',
    'research/analyse',
    'research/external',
    'research/evidence-pack',
    'docs',
  ]

  for (const path of roots) {
    const absolutePath = join(root, path)
    if (!existsSync(absolutePath)) continue
    walkFiles(absolutePath, filePath => {
      const name = basename(filePath)
      const matches = index.get(name) ?? []
      matches.push(relative(root, filePath).replaceAll('\\', '/'))
      index.set(name, matches.sort())
    })
  }

  return index
}

function walkFiles(path: string, visit: (filePath: string) => void) {
  for (const entry of readdirSync(path, { withFileTypes: true })) {
    const filePath = join(path, entry.name)
    if (entry.isDirectory()) {
      walkFiles(filePath, visit)
    } else if (entry.isFile()) {
      visit(filePath)
    }
  }
}

export function formatAcademicSourceQualityStatusMarkdown(
  snapshot: AcademicSourceQualitySnapshot,
): string {
  const database = snapshot.scope.database
  const mixedCorpusRows = database.status === 'available'
    ? database.counts.totalRows
    : snapshot.scope.totalRows
  const lines = [
    '# Evidence Source Quality Status',
    '',
    `Generated: ${snapshot.generatedAt}`,
    '',
    '## Decision',
    '',
    `- Regression gate: **${snapshot.regressionGate.status.toUpperCase()}**`,
    `- Academic/external readiness: **${snapshot.externalReadiness.status === 'ready' ? 'READY' : 'NOT READY'}**`,
    `- Database scope: **${database.status.toUpperCase()}**`,
    `- Seed/database combined parity: **${database.parity.status.toUpperCase()}**`,
    `- Identity parity: **${database.parity.identityStatus.toUpperCase()}**`,
    `- Metadata field parity: **${database.parity.metadataStatus.toUpperCase()}**`,
    '- A green regression gate protects current metadata coverage only; it is not permission for external claims.',
    `- Scope is a mixed evidence corpus, not a set of ${mixedCorpusRows} academic publications: it also includes official sources, registers, internal syntheses, operational documents, and duplicates.`,
    '- Locator checks validate stored metadata syntax and canonical duplicate keys only. They do not make HTTP requests or prove live status, redirects, archive persistence, or availability.',
    '',
    '## Seed And Database Reconciliation',
    '',
    ...(database.status === 'unavailable'
      ? [
          `Database unavailable: ${database.reason ?? 'No reason supplied.'}`,
          '',
          'Default CI remains seed-only. Use `--require-database-parity` when a reachable read-only database is part of the gate.',
        ]
      : [
          '| Set | Seed rows | Database rows | Delta | Parity |',
          '|---|---:|---:|---:|---|',
          ...database.parity.differences.map(difference =>
            `| ${difference.set} | ${difference.seedRows} | ${difference.databaseRows} | ${formatSignedNumber(difference.delta ?? 0)} | ${difference.classifiedParity} |`,
          ),
          '',
          `Database total: ${database.counts.totalRows}. Seed total: ${snapshot.scope.totalRows}.`,
          '',
          '### Identity reconciliation',
          '',
          '| Set | Matched seed IDs | Seed-only IDs | Managed runtime IDs | Unclassified DB-only IDs | Missing managed IDs |',
          '|---|---:|---|---|---|---|',
          ...database.parity.differences.map(difference =>
            `| ${difference.set} | ${difference.matchedRows} | ${difference.seedOnlyIds.length > 0 ? difference.seedOnlyIds.map(escapeTable).join('; ') : '—'} | ${difference.managedRuntimeIds.length > 0 ? difference.managedRuntimeIds.map(escapeTable).join('; ') : '—'} | ${difference.unclassifiedDatabaseOnlyIds.length > 0 ? difference.unclassifiedDatabaseOnlyIds.map(escapeTable).join('; ') : '—'} | ${difference.missingManagedRuntimeIds.length > 0 ? difference.missingManagedRuntimeIds.map(escapeTable).join('; ') : '—'} |`,
          ),
          '',
          'Managed runtime IDs are deterministic, manifest-derived imports. They are expected DB identities but are not static seed rows and do not gain evidence provenance or citation readiness from this classification.',
          '',
          '### Field-level metadata reconciliation',
          '',
          '| Set | Matched IDs compared | Rows with field drift | Drifted fields | Drifted row IDs |',
          '|---|---:|---:|---|---|',
          ...database.parity.fieldDifferences.map(difference =>
            `| ${difference.set} | ${difference.matchedRows} | ${difference.mismatchedRows} | ${Object.keys(difference.mismatchedFields).length > 0 ? Object.entries(difference.mismatchedFields).map(([field, count]) => `${field}:${count}`).join('; ') : '—'} | ${difference.mismatchedRowIds.length > 0 ? difference.mismatchedRowIds.map(escapeTable).join('; ') : '—'} |`,
          ),
        ]),
    '',
    '## Database Metadata Coverage',
    '',
    ...(database.status === 'unavailable'
      ? ['Coverage was not measured because the database was unavailable.']
      : [
          '| Set | Field | Present | Coverage | Modeled | Note |',
          '|---|---|---:|---:|---|---|',
          ...database.coverage.map(check =>
            `| ${check.set} | ${check.label} | ${check.present}/${check.total} | ${check.pct.toFixed(1)}% | ${check.modeled ? 'yes' : 'no'} | ${check.note ?? '—'} |`,
          ),
        ]),
    '',
    '## Regression Minimums',
    '',
    '| Set | Field | Present | Coverage | Minimum coverage | Minimum rows | Target | Status |',
    '|---|---|---:|---:|---:|---:|---:|---|',
    ...snapshot.regressionGate.checks.map(check =>
      `| ${check.set} | ${check.label} | ${check.present}/${check.total} | ${check.pct.toFixed(1)}% | ${check.min}% | ${check.minPresent} | ${check.target}% | ${check.regressionPass ? 'pass' : 'fail'} |`,
    ),
    '',
    '`attribution*` means that either a named author or an institution is present.',
    '',
    '## URL Syntax Profile',
    '',
    '| Set | Field | Non-empty strings | Valid absolute http(s) URLs | Invalid non-empty strings | Missing |',
    '|---|---|---:|---:|---:|---:|',
    ...snapshot.urlSyntax.map(profile =>
      `| ${profile.set} | ${profile.field} | ${profile.nonEmpty}/${profile.total} | ${profile.validAbsoluteHttpUrl}/${profile.total} | ${profile.invalidNonEmpty} | ${profile.missing} |`,
    ),
    '',
    '## Identifier Syntax Profile',
    '',
    'The field named `doi` contains both DOI values and other persistent identifiers. They are counted separately; no identifier is upgraded or resolved by this audit.',
    '',
    '| Set | Non-empty `doi` field | Valid DOI syntax | Other recognized persistent IDs | hdl | diva2 | slu | URN | Unrecognized non-empty |',
    '|---|---:|---:|---:|---:|---:|---:|---:|---:|',
    ...snapshot.identifierSyntax.map(profile =>
      `| ${profile.set} | ${profile.nonEmpty}/${profile.total} | ${profile.validDoi} | ${profile.otherPersistentIdentifier} | ${profile.otherPersistentIdentifierSchemes.hdl} | ${profile.otherPersistentIdentifierSchemes.diva2} | ${profile.otherPersistentIdentifierSchemes.slu} | ${profile.otherPersistentIdentifierSchemes.urn} | ${profile.unrecognizedNonEmpty} |`,
    ),
    '',
    '## Academic And External Readiness',
    '',
    '| Set | Dimension | Present | Coverage | Target | Status | Note |',
    '|---|---|---:|---:|---:|---|---|',
    ...snapshot.externalReadiness.dimensions.map(dimension =>
      `| ${dimension.set} | ${dimension.label} | ${dimension.present}/${dimension.total} | ${dimension.pct.toFixed(1)}% | ${dimension.target}% | ${dimension.status} | ${dimension.note} |`,
    ),
    '',
    '## Use Boundary',
    '',
    '- Descriptive mapping and internal synthesis remain possible under the existing claim-lock and citation gates.',
    '- Causal, health, intervention-effect, or authoritative academic claims remain blocked until the relevant source has appraisal, method, access-date, locator, and claim-anchor evidence.',
    '- AI drafts and internal-background records are not upgraded by this audit.',
    '',
  ]
  return lines.join('\n')
}

function formatSignedNumber(value: number): string {
  return value > 0 ? `+${value}` : String(value)
}

export function formatAcademicSourceQualityRepairQueueMarkdown(
  queue: AcademicSourceQualityRepairQueue,
): string {
  const lines = [
    '# Evidence Source Quality Repair Queue',
    '',
    `Generated: ${queue.generatedAt}`,
    '',
    'This queue records missing evidence. It does not manufacture metadata or authorize external use.',
    'URL checks validate stored syntax and canonical duplicate keys only; they do not make HTTP requests or prove live status, redirects, archive persistence, or availability.',
    '',
    '## Prioritized Execution Waves',
    '',
    '| Priority | Wave | Scope | Named targets | Human review | Exit criteria |',
    '|---:|---|---:|---|---|---|',
    ...queue.executionWaves.map(wave => (
      `| ${wave.priority} | ${wave.key}: ${escapeTable(wave.label)} | ${wave.scopeCount} | ${wave.targetIds.length > 0 ? escapeTable(wave.targetIds.join('; ')) : 'generated queue'} | ${wave.humanReviewRequired ? 'required' : 'not required'} | ${escapeTable(wave.exitCriteria)} |`
    )),
    '',
    ...queue.executionWaves.flatMap(wave => [
      `### Wave ${wave.priority}: ${wave.key}`,
      '',
      ...wave.prerequisites.map(item => `- ${item}`),
      '',
    ]),
    '## System Gaps',
    '',
    '| Gap | Affected rows | Required action |',
    '|---|---:|---|',
    ...queue.systemGaps.map(gap => `| ${gap.key} | ${gap.affectedRows} | ${gap.action} |`),
    '',
    `## Access Date Verification (${queue.accessDateReviewCount} seed-known rows; ${queue.liveAccessDateGapCount} live gap rows)`,
    '',
    'These rows are candidates, not verified dates. Open each authoritative locator and record the actual access date only after confirming the named work.',
    '',
    '| Set | ID | URL | Title | Required action |',
    '|---|---|---|---|---|',
    ...queue.accessDateReviewRows.map(row => (
      `| ${row.set} | ${row.id} | ${escapeTable(row.url)} | ${escapeTable(row.title)} | ${row.nextAction} |`
    )),
    '',
    `## Report Provenance Review (${queue.reportProvenanceReviewCount} unknown; ${queue.reportInternalEvidenceCount} explicitly internal/composite/blocked)`,
    '',
    '| ID | Category | Stored URL | Title | Required action |',
    '|---|---|---|---|---|',
    ...queue.reportProvenanceReviewRows.map(row =>
      `| ${row.id} | ${row.reportCategory} | ${row.rawUrl ? escapeTable(row.rawUrl) : '—'} | ${escapeTable(row.title)} | ${row.nextAction} |`,
    ),
    '',
    `## SourceDoc Provenance Review (${queue.sourceDocProvenanceReviewCount} unknown; ${queue.sourceDocInternalEvidenceCount} explicitly internal/duplicate)`,
    '',
    '| ID | Source type | Stored URL | Title | Filename | Required action |',
    '|---|---|---|---|---|---|',
    ...queue.sourceDocProvenanceReviewRows.map(row =>
      `| ${row.id} | ${row.sourceType} | ${row.rawUrl ? escapeTable(row.rawUrl) : '—'} | ${escapeTable(row.title)} | ${escapeTable(row.filename)} | ${row.nextAction} |`,
    ),
    '',
    `## SourceDoc Valid Absolute URL Queue (${queue.sourceDocUrlGapCount} total; ${queue.sourceDocActiveUrlGapCount} active; ${queue.sourceDocDuplicateUrlGapCount} declared duplicate rows)`,
    '',
    '| ID | State | Locator issue | Stored URL | Title | Filename | Repository matches | Valid DOI syntax | Next action |',
    '|---|---|---|---|---|---|---|---|---|',
    ...queue.sourceDocUrlRows.map(row =>
      `| ${row.id} | ${row.isDuplicate ? 'duplicate' : 'active'} | ${row.locatorIssue} | ${row.rawUrl ? escapeTable(row.rawUrl) : '—'} | ${escapeTable(row.title)} | ${escapeTable(row.filename)} | ${row.repositoryMatches.length > 0 ? escapeTable(row.repositoryMatches.join('; ')) : row.declaredPathExists ? 'declared path exists' : 'none'} | ${row.doi ?? '—'} | ${row.nextAction} |`,
    ),
    '',
    `## Duplicate Canonical Locator Review (${queue.duplicateLocatorSummary.reportGroups} Report groups / ${queue.duplicateLocatorSummary.reportRows} rows; ${queue.duplicateLocatorSummary.sourceDocGroups} SourceDoc groups / ${queue.duplicateLocatorSummary.sourceDocRows} rows)`,
    '',
    `${queue.duplicateLocatorSummary.validAbsoluteHttpUrlGroups} groups contain valid absolute http(s) URL syntax; ${queue.duplicateLocatorSummary.invalidUrlSyntaxGroups} groups contain repeated invalid URL syntax. Shared locators may be legitimate duplicate records, generic landing pages, or misbindings and require record-level review.`,
    '',
    '| Set | Syntax | Canonical locator | Rows | Likely misbinding | Required action |',
    '|---|---|---|---|---|---|',
    ...queue.duplicateLocatorGroups.map(group => {
      const rowLabels = group.rows.map(row => `${row.id}: ${row.title}`).join('; ')
      const reviewNotes = group.rows.flatMap(row => row.reviewNote ? [row.reviewNote] : [])
      return `| ${group.set} | ${group.locatorSyntax} | ${escapeTable(group.canonicalLocator)} | ${escapeTable(rowLabels)} | ${reviewNotes.length > 0 ? escapeTable(reviewNotes.join('; ')) : 'none flagged'} | ${group.nextAction} |`
    }),
    '',
  ]
  return lines.join('\n')
}

function escapeTable(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}

function writeArtifact(path: string, content: string) {
  const absolutePath = join(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

export function writeAcademicSourceQualityArtifacts(
  snapshot: AcademicSourceQualitySnapshot,
  queue: AcademicSourceQualityRepairQueue,
) {
  writeArtifact(ACADEMIC_SOURCE_QUALITY_STATUS_JSON_PATH, `${JSON.stringify(snapshot, null, 2)}\n`)
  writeArtifact(ACADEMIC_SOURCE_QUALITY_STATUS_MD_PATH, formatAcademicSourceQualityStatusMarkdown(snapshot))
  writeArtifact(ACADEMIC_SOURCE_QUALITY_REPAIR_QUEUE_JSON_PATH, `${JSON.stringify(queue, null, 2)}\n`)
  writeArtifact(ACADEMIC_SOURCE_QUALITY_REPAIR_QUEUE_MD_PATH, formatAcademicSourceQualityRepairQueueMarkdown(queue))
}

export function academicSourceQualityExitCode(
  snapshot: AcademicSourceQualitySnapshot,
  requireExternalReady = false,
  requireDatabaseParity = false,
): number {
  if (snapshot.regressionGate.status === 'fail') return 1
  if (requireExternalReady && snapshot.externalReadiness.status !== 'ready') return 1
  if (requireExternalReady && snapshot.scope.database.parity.status !== 'match') return 1
  if (requireDatabaseParity && snapshot.scope.database.parity.status !== 'match') return 1
  return 0
}

export type AcademicSourceQualityCliOptions = {
  requireExternalReady: boolean
  requireDatabaseParity: boolean
  releaseGate: boolean
}

const ACADEMIC_SOURCE_QUALITY_ARGUMENTS = new Set([
  '--require-external-ready',
  '--require-database-parity',
  '--require-db-parity',
  '--release-gate',
])

export function parseAcademicSourceQualityArgs(args: readonly string[]): AcademicSourceQualityCliOptions {
  const unknown = args.filter(argument => !ACADEMIC_SOURCE_QUALITY_ARGUMENTS.has(argument))
  if (unknown.length > 0) {
    throw new Error(`Unknown academic source-quality argument(s): ${unknown.join(', ')}`)
  }

  const releaseGate = args.includes('--release-gate')
  return {
    requireExternalReady: args.includes('--require-external-ready'),
    requireDatabaseParity: releaseGate ||
      args.includes('--require-database-parity') ||
      args.includes('--require-db-parity'),
    releaseGate,
  }
}

function printSnapshot(snapshot: AcademicSourceQualitySnapshot) {
  console.log('Academic source-quality audit')
  console.log('Seed data: prisma/seed-data/{reports,theses,sources}.ts')
  console.log('')
  console.log(`Regression gate: ${snapshot.regressionGate.status.toUpperCase()}`)
  for (const set of ['Report', 'Thesis', 'SourceDoc'] as const) {
    const checks = snapshot.regressionGate.checks.filter(check => check.set === set)
    console.log(`\n── ${set} (n=${checks[0]?.total ?? 0}) ─────────────────────────────`)
    for (const check of checks) {
      const status = check.regressionPass ? '✅' : '❌'
      const targetSuffix = check.targetMet ? ' (≥ target)' : ` (target ${check.target}%)`
      console.log(`  ${status} ${check.label.padEnd(16)} ${check.present}/${check.total} (${check.pct.toFixed(0)}%) — min ${check.min}% and ${check.minPresent} rows${targetSuffix}`)
    }
  }
  console.log('')
  console.log(`Academic/external readiness: ${snapshot.externalReadiness.status === 'ready' ? 'READY' : 'NOT READY'}`)
  console.log(`Database scope: ${snapshot.scope.database.status.toUpperCase()}`)
  console.log(`Seed/database combined parity: ${snapshot.scope.database.parity.status.toUpperCase()}`)
  console.log(`Identity parity: ${snapshot.scope.database.parity.identityStatus.toUpperCase()}`)
  console.log(`Metadata field parity: ${snapshot.scope.database.parity.metadataStatus.toUpperCase()}`)
  if (snapshot.scope.database.status === 'available') {
    for (const difference of snapshot.scope.database.parity.differences) {
      console.log(`  ${difference.set}: seed ${difference.seedRows}, database ${difference.databaseRows}, delta ${formatSignedNumber(difference.delta ?? 0)}`)
    }
  } else {
    console.log(`  ${snapshot.scope.database.reason}`)
  }
  console.log(`Status: ${ACADEMIC_SOURCE_QUALITY_STATUS_MD_PATH}`)
  console.log(`Repair queue: ${ACADEMIC_SOURCE_QUALITY_REPAIR_QUEUE_MD_PATH}`)
}

export async function loadAcademicDatabaseAudit(): Promise<AcademicDatabaseAudit> {
  if (!process.env.DATABASE_URL) {
    return unavailableAcademicDatabaseAudit('DATABASE_URL is not configured.')
  }

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const [
      databaseReports,
      databaseTheses,
      databaseSourceDocs,
      databaseFieldCitations,
      databaseAppraisals,
    ] = await Promise.all([
      prisma.report.findMany({
        select: {
          id: true,
          title: true,
          year: true,
          institution: true,
          author: true,
          sourceUrl: true,
          doi: true,
          accessedAt: true,
          provenanceType: true,
        },
      }),
      prisma.thesis.findMany({
        select: {
          id: true,
          title: true,
          year: true,
          institution: true,
          authors: true,
          method: true,
          url: true,
          doi: true,
          accessDate: true,
        },
      }),
      prisma.sourceDoc.findMany({
        select: {
          id: true,
          filename: true,
          title: true,
          year: true,
          author: true,
          sourceType: true,
          description: true,
          relevance: true,
          url: true,
          doi: true,
          publisher: true,
          isDuplicate: true,
          accessedAt: true,
          archivedUrl: true,
          provenanceType: true,
        },
      }),
      prisma.fieldCitation.findMany({
        select: {
          entityType: true,
          entityId: true,
          fieldPath: true,
          claimText: true,
          citation: {
            select: {
              pageRef: true,
              quote: true,
            },
          },
        },
      }),
      prisma.evidenceAppraisal.findMany({
        select: {
          reportId: true,
          thesisId: true,
          sourceDocId: true,
          status: true,
          basis: true,
          studyDesign: true,
          studyDesignDetails: true,
          methodologySummary: true,
          sampleOrCoverage: true,
          applicability: true,
          applicabilityContext: true,
          applicabilityNotes: true,
          limitationsStatus: true,
          limitations: true,
          limitationsNotes: true,
          riskOfBias: true,
          riskOfBiasNotes: true,
          framework: true,
          frameworkVersion: true,
          reviewMethod: true,
          reviewBasisCitationId: true,
          reviewedSourceHash: true,
          hashAlgorithm: true,
          reviewedBy: true,
          reviewedAt: true,
          notApplicableReason: true,
          reviewBasisCitation: {
            select: {
              id: true,
              sourceClass: true,
              citationReadiness: true,
              verificationStatus: true,
              url: true,
              archivedUrl: true,
              accessedAt: true,
              fileHash: true,
              contentHash: true,
              sourceDocId: true,
              document: {
                select: {
                  report: { select: { id: true } },
                  thesis: { select: { id: true } },
                  sourceDoc: { select: { id: true } },
                },
              },
            },
          },
        },
      }),
    ])
    return buildAcademicDatabaseAudit({
      reports: databaseReports,
      theses: databaseTheses,
      sourceDocs: databaseSourceDocs,
      fieldCitations: databaseFieldCitations,
      appraisals: databaseAppraisals,
    }, loadManagedTranscriptSourceDocIds())
  } catch (error) {
    const errorName = error instanceof Error ? error.name : 'UnknownError'
    return unavailableAcademicDatabaseAudit(`Database metadata query failed (${errorName}).`)
  } finally {
    await prisma.$disconnect()
  }
}

async function main() {
  const options = parseAcademicSourceQualityArgs(process.argv.slice(2))
  const generatedAt = new Date().toISOString()
  const database = await loadAcademicDatabaseAudit()
  const snapshot = buildAcademicSourceQualitySnapshot(generatedAt, database)
  const queue = buildAcademicSourceQualityRepairQueue(generatedAt, database)
  writeAcademicSourceQualityArtifacts(snapshot, queue)
  printSnapshot(snapshot)

  const exitCode = academicSourceQualityExitCode(
    snapshot,
    options.requireExternalReady,
    options.requireDatabaseParity,
  )
  if (options.requireExternalReady && snapshot.externalReadiness.status !== 'ready') {
    console.error('External readiness enforcement failed: corpus is NOT READY.')
  }
  if (options.requireDatabaseParity && snapshot.scope.database.parity.status !== 'match') {
    console.error(`Database parity enforcement failed: ${snapshot.scope.database.parity.status.toUpperCase()}.`)
  }
  process.exitCode = exitCode
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false
if (isEntrypoint) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
