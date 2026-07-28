import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import {
  REVIEWED_ETMV_2023_CONTENT_HASHES,
  REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH,
  REVIEWED_ETMV_2023_DOCUMENT_ID,
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT,
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_VERSION,
  REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
  REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
  REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_AFTER,
  REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_BEFORE,
  REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID,
  REVIEWED_ETMV_2023_PDF_SHA256,
  REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID,
  REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID,
  REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH,
  REVIEWED_ETMV_2023_REPORT_ID,
  REVIEWED_ETMV_2023_TITLE_AFTER,
  REVIEWED_ETMV_2023_TITLE_BEFORE,
  REVIEWED_ETMV_2023_URL_AFTER,
  REVIEWED_ETMV_2023_URL_BEFORE,
  REVIEWED_ETMV_2023_URL_CITATION_ID,
  REVIEWED_ETMV_2023_URL_CITATION_TEXT_AFTER,
  REVIEWED_ETMV_2023_URL_CITATION_TEXT_BEFORE,
  REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID,
  REVIEWED_ETMV_2023_YEAR_AFTER,
  REVIEWED_ETMV_2023_YEAR_BEFORE,
  assertReviewedEtmv2023ReportSeed,
  canonicalizeReviewedEtmv2023Json,
  reconcileReviewedEtmv2023DocumentContent,
  reconcileReviewedEtmv2023LibraryText,
  reviewedEtmv2023LibraryAnalysisContentHash,
  sha256ReviewedEtmv2023Json,
  sha256ReviewedEtmv2023Text,
  validateReviewedEtmv2023IdentityRepairContract,
  type ReviewedEtmv2023CanonicalJsonValue,
} from '../src/lib/citations/reviewed-etmv-2023-identity-repair'

export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK =
  'APPLY_REVIEWED_ETMV_2023_IDENTITY_REPAIR_4'
export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_ADVISORY_LOCK_KEY =
  'foodsystems:reviewed-etmv-2023-identity-repair:2026-07-20:v1'

export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_DEPENDENCY_SCOPE =
  Object.freeze([
    'primary DatabaseIdentity row',
    'the correct 2023 Report and its exact Report.documentId binding',
    'the stale generated Document and every Report, Thesis, or SourceDoc binding to it',
    'the two exact mutable Document SourceCitations and every SourceCitation directly bound through the Document or Report',
    'every FieldCitation targeting the Document or Report, or referencing an enumerated SourceCitation',
    'every LibraryAnalysisRecord directly bound to the Document or keyed to the Document or Report',
    'every EvidenceAppraisal bound to the Report or using an enumerated SourceCitation as review basis',
    'every direct DocumentRef, InsightDocumentRef, CompanyDocumentRef, and ActorDocumentRef',
    'every Insight or Producer using an enumerated SourceCitation as primary citation',
    'the SHA-256-pinned local PDF, read before planning and again inside the postcondition',
    'boundary: no filesystem lock, no filesystem mutation, and no transitive consumers beyond these enumerated direct relations',
  ]) as readonly string[]

const reportSelect = {
  id: true,
  title: true,
  fullTitle: true,
  author: true,
  institution: true,
  date: true,
  year: true,
  sourceUrl: true,
  reportCategory: true,
  country: true,
  keyFindings: true,
  recommendations: true,
  relevance: true,
  tags: true,
  doi: true,
  isbn: true,
  issn: true,
  publisher: true,
  provenanceType: true,
  supportingSources: true,
  accessedAt: true,
  documentId: true,
} satisfies Prisma.ReportSelect

const documentSelect = {
  id: true,
  slug: true,
  filePath: true,
  title: true,
  author: true,
  year: true,
  documentType: true,
  category: true,
  subcategory: true,
  country: true,
  content: true,
  summary: true,
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect

const sourceCitationSelect = {
  id: true,
  sourceClass: true,
  citationReadiness: true,
  verificationStatus: true,
  citationText: true,
  title: true,
  publisher: true,
  author: true,
  year: true,
  url: true,
  archivedUrl: true,
  localPath: true,
  fileHash: true,
  contentHash: true,
  hashAlgorithm: true,
  pageRef: true,
  quote: true,
  accessedAt: true,
  captureMethod: true,
  verifiedAt: true,
  verifiedBy: true,
  confidence: true,
  notes: true,
  documentId: true,
  sourceDocId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SourceCitationSelect

const fieldCitationSelect = {
  id: true,
  citationId: true,
  entityType: true,
  entityId: true,
  fieldPath: true,
  claimText: true,
  confidence: true,
  createdAt: true,
} satisfies Prisma.FieldCitationSelect

const libraryAnalysisRecordSelect = {
  id: true,
  sourceKind: true,
  sourceKey: true,
  documentId: true,
  sourceDocId: true,
  canonicalPath: true,
  title: true,
  status: true,
  usageRule: true,
  reviewStatus: true,
  citationReadiness: true,
  analysisTier: true,
  aiCard: true,
  aiSummary: true,
  keyFindings: true,
  claimCandidates: true,
  projectImplications: true,
  gaps: true,
  controlLinks: true,
  riskFlags: true,
  contentHash: true,
  wordCount: true,
  processedAt: true,
  reviewedAt: true,
  reviewer: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibraryAnalysisRecordSelect

const evidenceAppraisalSelect = {
  id: true,
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
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EvidenceAppraisalSelect

const documentRefSelect = {
  id: true,
  fromId: true,
  toId: true,
  refType: true,
} satisfies Prisma.DocumentRefSelect
const insightDocumentRefSelect = {
  id: true,
  insightId: true,
  documentId: true,
  relevance: true,
} satisfies Prisma.InsightDocumentRefSelect
const companyDocumentRefSelect = {
  id: true,
  companyId: true,
  documentId: true,
  context: true,
} satisfies Prisma.CompanyDocumentRefSelect
const actorDocumentRefSelect = {
  id: true,
  actorId: true,
  documentId: true,
  context: true,
} satisfies Prisma.ActorDocumentRefSelect
const sourceDocBindingSelect = {
  id: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect
const thesisBindingSelect = {
  id: true,
  documentId: true,
} satisfies Prisma.ThesisSelect
const reportBindingSelect = {
  id: true,
  documentId: true,
} satisfies Prisma.ReportSelect
const insightCitationBindingSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.InsightSelect
const producerCitationBindingSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.ProducerSelect

export type ReviewedEtmv2023ReportRow = Prisma.ReportGetPayload<{
  select: typeof reportSelect
}>
export type ReviewedEtmv2023DocumentRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect
}>
export type ReviewedEtmv2023SourceCitationRow = Prisma.SourceCitationGetPayload<{
  select: typeof sourceCitationSelect
}>
export type ReviewedEtmv2023FieldCitationRow = Prisma.FieldCitationGetPayload<{
  select: typeof fieldCitationSelect
}>
export type ReviewedEtmv2023LibraryAnalysisRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect
  }>
export type ReviewedEtmv2023EvidenceAppraisalRow =
  Prisma.EvidenceAppraisalGetPayload<{
    select: typeof evidenceAppraisalSelect
  }>
export type ReviewedEtmv2023DocumentRefRow = Prisma.DocumentRefGetPayload<{
  select: typeof documentRefSelect
}>
export type ReviewedEtmv2023InsightDocumentRefRow =
  Prisma.InsightDocumentRefGetPayload<{
    select: typeof insightDocumentRefSelect
  }>
export type ReviewedEtmv2023CompanyDocumentRefRow =
  Prisma.CompanyDocumentRefGetPayload<{
    select: typeof companyDocumentRefSelect
  }>
export type ReviewedEtmv2023ActorDocumentRefRow =
  Prisma.ActorDocumentRefGetPayload<{
    select: typeof actorDocumentRefSelect
  }>
export type ReviewedEtmv2023SourceDocBindingRow = Prisma.SourceDocGetPayload<{
  select: typeof sourceDocBindingSelect
}>
export type ReviewedEtmv2023ThesisBindingRow = Prisma.ThesisGetPayload<{
  select: typeof thesisBindingSelect
}>
export type ReviewedEtmv2023ReportBindingRow = Prisma.ReportGetPayload<{
  select: typeof reportBindingSelect
}>
export type ReviewedEtmv2023InsightCitationBindingRow =
  Prisma.InsightGetPayload<{
    select: typeof insightCitationBindingSelect
  }>
export type ReviewedEtmv2023ProducerCitationBindingRow =
  Prisma.ProducerGetPayload<{
    select: typeof producerCitationBindingSelect
  }>

export type ReviewedEtmv2023DatabaseIdentity = {
  currentDatabase: string
  key: 'primary'
  identityUuid: string
  createdAt: string
}

export type ReviewedEtmv2023Collections = {
  reports: ReviewedEtmv2023ReportRow[]
  documents: ReviewedEtmv2023DocumentRow[]
  sourceCitations: ReviewedEtmv2023SourceCitationRow[]
  fieldCitations: ReviewedEtmv2023FieldCitationRow[]
  libraryAnalysisRecords: ReviewedEtmv2023LibraryAnalysisRow[]
  evidenceAppraisals: ReviewedEtmv2023EvidenceAppraisalRow[]
  documentRefs: ReviewedEtmv2023DocumentRefRow[]
  insightDocumentRefs: ReviewedEtmv2023InsightDocumentRefRow[]
  companyDocumentRefs: ReviewedEtmv2023CompanyDocumentRefRow[]
  actorDocumentRefs: ReviewedEtmv2023ActorDocumentRefRow[]
  sourceDocBindings: ReviewedEtmv2023SourceDocBindingRow[]
  thesisBindings: ReviewedEtmv2023ThesisBindingRow[]
  reportBindings: ReviewedEtmv2023ReportBindingRow[]
  insightCitationBindings: ReviewedEtmv2023InsightCitationBindingRow[]
  producerCitationBindings: ReviewedEtmv2023ProducerCitationBindingRow[]
}

export type ReviewedEtmv2023AtomicState =
  | 'all_before'
  | 'all_after'
  | 'hybrid'
  | 'conflict'

export type ReviewedEtmv2023Conflict = {
  code: string
  subject: string
  detail: string
}

export type ReviewedEtmv2023Plan = {
  version: typeof REVIEWED_ETMV_2023_IDENTITY_REPAIR_VERSION
  contractSha256: string
  seedTargetSha256: string
  artifactSha256: string
  databaseIdentity: ReviewedEtmv2023DatabaseIdentity
  atomicState: ReviewedEtmv2023AtomicState
  targetStateSha256: string
  dependencySha256: string
  preservedDependencySha256: string
  dependencyScope: readonly string[]
  dependencyCounts: Record<keyof ReviewedEtmv2023Collections, number>
  dependencyIds: Record<keyof ReviewedEtmv2023Collections, string[]>
  targetStates: {
    document: string
    urlCitation: string
    localCitation: string
    libraryAnalysisRecord: string
  }
  targetHashes: {
    report: string | null
    document: string | null
    urlCitation: string | null
    localCitation: string | null
    urlFieldCitation: string | null
    localFieldCitation: string | null
    protectedReportCitation: string | null
    protectedReportFieldCitation: string | null
    libraryAnalysisRecord: string | null
  }
  conflicts: ReviewedEtmv2023Conflict[]
  summary: {
    targets: 4
    pendingTargets: number
    appliedTargets: number
    conflicts: number
  }
  boundary: typeof REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.boundary
}

export type ReviewedEtmv2023Inspection = {
  plan: ReviewedEtmv2023Plan
  collections: ReviewedEtmv2023Collections
}

export type ReviewedEtmv2023Args = {
  apply: boolean
  ack: string | undefined
  expectedPlanSha256: string | undefined
}

export type ReviewedEtmv2023Client = Pick<
  Prisma.TransactionClient,
  | '$queryRaw'
  | '$executeRaw'
  | 'report'
  | 'document'
  | 'sourceCitation'
  | 'fieldCitation'
  | 'libraryAnalysisRecord'
  | 'evidenceAppraisal'
  | 'documentRef'
  | 'insightDocumentRef'
  | 'companyDocumentRef'
  | 'actorDocumentRef'
  | 'sourceDoc'
  | 'thesis'
  | 'insight'
  | 'producer'
>

const collectionNames = [
  'reports',
  'documents',
  'sourceCitations',
  'fieldCitations',
  'libraryAnalysisRecords',
  'evidenceAppraisals',
  'documentRefs',
  'insightDocumentRefs',
  'companyDocumentRefs',
  'actorDocumentRefs',
  'sourceDocBindings',
  'thesisBindings',
  'reportBindings',
  'insightCitationBindings',
  'producerCitationBindings',
] as const satisfies readonly (keyof ReviewedEtmv2023Collections)[]

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true })
}

function canonicalHash(value: unknown) {
  return sha256ReviewedEtmv2023Json(value)
}

function canonicalRow(value: unknown) {
  return canonicalizeReviewedEtmv2023Json(value) as Record<
    string,
    ReviewedEtmv2023CanonicalJsonValue
  >
}

function exactOne<T>(
  rows: readonly T[],
  subject: string,
  conflicts: ReviewedEtmv2023Conflict[],
) {
  if (rows.length !== 1) {
    conflicts.push({
      code: rows.length === 0 ? 'missing_target' : 'duplicate_target',
      subject,
      detail: `Expected exactly one ${subject}; found ${rows.length}`,
    })
    return null
  }
  return rows[0]!
}

function rowId(row: unknown, collection: string) {
  const id = (row as { id?: unknown }).id
  if (typeof id !== 'string') {
    throw new Error(`Reviewed ETMV 2023 ${collection} row has no string id`)
  }
  return id
}

function normalizeCollections(
  collections: ReviewedEtmv2023Collections,
): ReviewedEtmv2023Collections {
  return Object.fromEntries(
    collectionNames.map((name) => [
      name,
      [...collections[name]].sort((left, right) =>
        compareIds(rowId(left, name), rowId(right, name)),
      ),
    ]),
  ) as ReviewedEtmv2023Collections
}

function backlogProjection(metadata: Prisma.JsonValue | null) {
  if (metadata === null || Array.isArray(metadata) || typeof metadata !== 'object') {
    return null
  }
  const backlog = (metadata as Record<string, unknown>).backlog
  if (backlog === null || Array.isArray(backlog) || typeof backlog !== 'object') {
    return null
  }
  const record = backlog as Record<string, unknown>
  return {
    title: record.title ?? null,
    year: record.year ?? null,
    url: record.url ?? null,
  }
}

export function reviewedEtmv2023DocumentProjection(
  row: ReviewedEtmv2023DocumentRow,
) {
  return {
    title: row.title,
    year: row.year,
    url: row.url,
    contentHash: sha256ReviewedEtmv2023Text(row.content),
    metadataBacklog: backlogProjection(row.metadata),
  }
}

const documentBeforeProjection = {
  title: REVIEWED_ETMV_2023_TITLE_BEFORE,
  year: REVIEWED_ETMV_2023_YEAR_BEFORE,
  url: REVIEWED_ETMV_2023_URL_BEFORE,
  contentHash: REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentBefore,
  metadataBacklog: {
    title: REVIEWED_ETMV_2023_TITLE_BEFORE,
    year: String(REVIEWED_ETMV_2023_YEAR_BEFORE),
    url: REVIEWED_ETMV_2023_URL_BEFORE,
  },
}
const documentAfterProjection = {
  title: REVIEWED_ETMV_2023_TITLE_AFTER,
  year: REVIEWED_ETMV_2023_YEAR_AFTER,
  url: REVIEWED_ETMV_2023_URL_AFTER,
  contentHash: REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentAfter,
  metadataBacklog: {
    title: REVIEWED_ETMV_2023_TITLE_AFTER,
    year: String(REVIEWED_ETMV_2023_YEAR_AFTER),
    url: REVIEWED_ETMV_2023_URL_AFTER,
  },
}

function urlCitationProjection(row: ReviewedEtmv2023SourceCitationRow) {
  return {
    citationText: row.citationText,
    title: row.title,
    year: row.year,
    url: row.url,
    verificationStatus: row.verificationStatus,
    archivedUrl: row.archivedUrl,
    verifiedAt: row.verifiedAt?.toISOString() ?? null,
    verifiedBy: row.verifiedBy,
  }
}
const urlCitationBeforeProjection = {
  citationText: REVIEWED_ETMV_2023_URL_CITATION_TEXT_BEFORE,
  title: REVIEWED_ETMV_2023_TITLE_BEFORE,
  year: REVIEWED_ETMV_2023_YEAR_BEFORE,
  url: REVIEWED_ETMV_2023_URL_BEFORE,
  verificationStatus: 'machine_verified',
  archivedUrl:
    REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.before
      .urlCitationArchivedUrl,
  verifiedAt:
    REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.before
      .urlCitationVerifiedAt,
  verifiedBy: null,
}
const urlCitationAfterProjection = {
  citationText: REVIEWED_ETMV_2023_URL_CITATION_TEXT_AFTER,
  title: REVIEWED_ETMV_2023_TITLE_AFTER,
  year: REVIEWED_ETMV_2023_YEAR_AFTER,
  url: REVIEWED_ETMV_2023_URL_AFTER,
  verificationStatus: 'needs_review',
  archivedUrl: null,
  verifiedAt: null,
  verifiedBy: null,
}

function localCitationProjection(row: ReviewedEtmv2023SourceCitationRow) {
  return {
    citationText: row.citationText,
    title: row.title,
    year: row.year,
    fileHash: row.fileHash,
  }
}
const localCitationBeforeProjection = {
  citationText: REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_BEFORE,
  title: REVIEWED_ETMV_2023_TITLE_BEFORE,
  year: REVIEWED_ETMV_2023_YEAR_BEFORE,
  fileHash: null,
}
const localCitationAfterProjection = {
  citationText: REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_AFTER,
  title: REVIEWED_ETMV_2023_TITLE_AFTER,
  year: REVIEWED_ETMV_2023_YEAR_AFTER,
  fileHash: REVIEWED_ETMV_2023_PDF_SHA256,
}

function libraryCardShortSummary(row: ReviewedEtmv2023LibraryAnalysisRow) {
  if (!row.aiCard || Array.isArray(row.aiCard) || typeof row.aiCard !== 'object') {
    return null
  }
  const value = (row.aiCard as Record<string, unknown>).shortSummary
  return typeof value === 'string' ? value : null
}

function libraryProjection(row: ReviewedEtmv2023LibraryAnalysisRow) {
  return {
    title: row.title,
    aiSummary: row.aiSummary,
    shortSummary: libraryCardShortSummary(row),
    contentHash: row.contentHash,
  }
}
const libraryBeforeSummary = `${REVIEWED_ETMV_2023_TITLE_BEFORE} er triagert som document med 5436 ord i lokalt grunnlag.`
const libraryAfterSummary = `${REVIEWED_ETMV_2023_TITLE_AFTER} er triagert som document med 5436 ord i lokalt grunnlag.`
const libraryBeforeProjection = {
  title: REVIEWED_ETMV_2023_TITLE_BEFORE,
  aiSummary: libraryBeforeSummary,
  shortSummary: libraryBeforeSummary,
  contentHash: REVIEWED_ETMV_2023_CONTENT_HASHES.libraryAnalysisContentBefore,
}
const libraryAfterProjection = {
  title: REVIEWED_ETMV_2023_TITLE_AFTER,
  aiSummary: libraryAfterSummary,
  shortSummary: libraryAfterSummary,
  contentHash: REVIEWED_ETMV_2023_CONTENT_HASHES.libraryAnalysisContentAfter,
}

function projectionState(actual: unknown, before: unknown, after: unknown) {
  const actualHash = canonicalHash(actual)
  if (actualHash === canonicalHash(before)) return 'before' as const
  if (actualHash === canonicalHash(after)) return 'after' as const
  return 'conflict' as const
}

function conflict(
  conflicts: ReviewedEtmv2023Conflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail })
}

function assertCoreBindings(input: {
  report: ReviewedEtmv2023ReportRow
  document: ReviewedEtmv2023DocumentRow
  urlCitation: ReviewedEtmv2023SourceCitationRow
  localCitation: ReviewedEtmv2023SourceCitationRow
  urlFieldCitation: ReviewedEtmv2023FieldCitationRow
  localFieldCitation: ReviewedEtmv2023FieldCitationRow
  protectedReportCitation: ReviewedEtmv2023SourceCitationRow
  protectedReportFieldCitation: ReviewedEtmv2023FieldCitationRow
  libraryAnalysisRecord: ReviewedEtmv2023LibraryAnalysisRow
}) {
  const errors: string[] = []
  if (
    input.report.title !== REVIEWED_ETMV_2023_TITLE_AFTER ||
    input.report.year !== REVIEWED_ETMV_2023_YEAR_AFTER ||
    input.report.sourceUrl !== REVIEWED_ETMV_2023_URL_AFTER ||
    input.report.documentId !== REVIEWED_ETMV_2023_DOCUMENT_ID
  ) {
    errors.push('protected Report identity or Document binding drifted')
  }
  if (
    input.document.slug !==
      'evidence-pack/nordisk/finland-food-market-ombudsman-2023' ||
    input.document.filePath !== REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH
  ) {
    errors.push('Document slug or filePath drifted')
  }
  if (
    input.urlFieldCitation.citationId !== REVIEWED_ETMV_2023_URL_CITATION_ID ||
    input.urlFieldCitation.entityType !== 'Document' ||
    input.urlFieldCitation.entityId !== REVIEWED_ETMV_2023_DOCUMENT_ID ||
    input.urlFieldCitation.fieldPath !== 'url'
  ) {
    errors.push('URL FieldCitation binding drifted')
  }
  if (
    input.localFieldCitation.citationId !==
      REVIEWED_ETMV_2023_LOCAL_CITATION_ID ||
    input.localFieldCitation.entityType !== 'Document' ||
    input.localFieldCitation.entityId !== REVIEWED_ETMV_2023_DOCUMENT_ID ||
    input.localFieldCitation.fieldPath !== 'filePath'
  ) {
    errors.push('local-file FieldCitation binding drifted')
  }
  if (
    input.protectedReportFieldCitation.citationId !==
      REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID ||
    input.protectedReportFieldCitation.entityType !== 'Report' ||
    input.protectedReportFieldCitation.entityId !== REVIEWED_ETMV_2023_REPORT_ID ||
    input.protectedReportFieldCitation.fieldPath !== 'sourceUrl'
  ) {
    errors.push('protected Report FieldCitation binding drifted')
  }
  const protectedReportCitation =
    REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.protectedReportCitationProjection
  if (
    input.protectedReportCitation.citationText !==
      protectedReportCitation.citationText ||
    input.protectedReportCitation.title !== protectedReportCitation.title ||
    input.protectedReportCitation.year !== protectedReportCitation.year ||
    input.protectedReportCitation.url !== protectedReportCitation.url ||
    input.protectedReportCitation.sourceClass !==
      protectedReportCitation.sourceClass ||
    input.protectedReportCitation.citationReadiness !==
      protectedReportCitation.citationReadiness ||
    input.protectedReportCitation.verificationStatus !==
      protectedReportCitation.verificationStatus ||
    input.protectedReportCitation.archivedUrl !==
      protectedReportCitation.archivedUrl ||
    input.protectedReportCitation.verifiedAt?.toISOString() !==
      protectedReportCitation.verifiedAt ||
    input.protectedReportCitation.verifiedBy !==
      protectedReportCitation.verifiedBy ||
    input.protectedReportCitation.captureMethod !==
      protectedReportCitation.captureMethod ||
    input.protectedReportCitation.hashAlgorithm !==
      protectedReportCitation.hashAlgorithm
  ) {
    errors.push('protected Report SourceCitation identity or evidence drifted')
  }
  for (const [label, row] of [
    ['URL', input.urlCitation],
    ['local', input.localCitation],
  ] as const) {
    if (
      row.sourceClass !== 'primary' ||
      row.citationReadiness !== 'citable_with_note' ||
      row.captureMethod !== 'backfill-existing-locators' ||
      row.hashAlgorithm !== 'sha256' ||
      row.documentId !== null ||
      row.sourceDocId !== null
    ) {
      errors.push(`${label} SourceCitation protected policy drifted`)
    }
  }
  if (
    input.urlCitation.localPath !== null ||
    input.urlCitation.fileHash !== null ||
    input.urlCitation.contentHash !== null
  ) {
    errors.push('URL SourceCitation protected locator fields drifted')
  }
  if (
    input.localCitation.url !== null ||
    input.localCitation.localPath !== REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH ||
    input.localCitation.verificationStatus !== 'needs_review' ||
    input.localCitation.verifiedAt !== null ||
    input.localCitation.verifiedBy !== null ||
    input.localCitation.archivedUrl !== null
  ) {
    errors.push('local SourceCitation protected locator policy drifted')
  }
  if (
    input.libraryAnalysisRecord.sourceKind !== 'document' ||
    input.libraryAnalysisRecord.sourceKey !==
      `document:${REVIEWED_ETMV_2023_DOCUMENT_ID}` ||
    input.libraryAnalysisRecord.documentId !== REVIEWED_ETMV_2023_DOCUMENT_ID ||
    input.libraryAnalysisRecord.canonicalPath !==
      REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH
  ) {
    errors.push('LibraryAnalysisRecord binding drifted')
  }
  if (errors.length > 0) throw new Error(errors.join('; '))
}

function reconcileMetadata(metadata: Prisma.JsonValue | null) {
  if (metadata === null || Array.isArray(metadata) || typeof metadata !== 'object') {
    throw new Error('Reviewed ETMV 2023 Document.metadata must be an object')
  }
  const root = metadata as Record<string, Prisma.JsonValue>
  const backlogValue = root.backlog
  if (
    backlogValue === null ||
    Array.isArray(backlogValue) ||
    typeof backlogValue !== 'object'
  ) {
    throw new Error('Reviewed ETMV 2023 Document.metadata.backlog is missing')
  }
  const backlog = backlogValue as Record<string, Prisma.JsonValue>
  const current = {
    title: backlog.title,
    year: backlog.year,
    url: backlog.url,
  }
  const before = documentBeforeProjection.metadataBacklog
  const after = documentAfterProjection.metadataBacklog
  const state = projectionState(current, before, after)
  if (state === 'conflict') {
    throw new Error('Reviewed ETMV 2023 metadata backlog identity drifted')
  }
  return {
    ...root,
    backlog: {
      ...backlog,
      title: after.title,
      year: after.year,
      url: after.url,
    },
  } as Prisma.InputJsonValue
}

export function materializeReviewedEtmv2023AfterRows(input: {
  document: ReviewedEtmv2023DocumentRow
  urlCitation: ReviewedEtmv2023SourceCitationRow
  localCitation: ReviewedEtmv2023SourceCitationRow
  libraryAnalysisRecord: ReviewedEtmv2023LibraryAnalysisRow
}) {
  const content = reconcileReviewedEtmv2023DocumentContent(
    input.document.content,
  )
  const metadata = reconcileMetadata(input.document.metadata)
  const shortSummary = libraryCardShortSummary(input.libraryAnalysisRecord)
  if (input.libraryAnalysisRecord.aiSummary === null || shortSummary === null) {
    throw new Error('Reviewed ETMV 2023 LibraryAnalysis summary projection is missing')
  }
  const aiSummary = reconcileReviewedEtmv2023LibraryText(
    input.libraryAnalysisRecord.aiSummary,
    'LibraryAnalysisRecord.aiSummary',
  )
  const repairedShortSummary = reconcileReviewedEtmv2023LibraryText(
    shortSummary,
    'LibraryAnalysisRecord.aiCard.shortSummary',
  )
  const contentHash = reviewedEtmv2023LibraryAnalysisContentHash({
    summary: input.document.summary,
    content,
  })
  if (
    contentHash !==
    REVIEWED_ETMV_2023_CONTENT_HASHES.libraryAnalysisContentAfter
  ) {
    throw new Error('Reviewed ETMV 2023 LibraryAnalysis content hash drifted')
  }
  return {
    document: {
      ...input.document,
      title: REVIEWED_ETMV_2023_TITLE_AFTER,
      year: REVIEWED_ETMV_2023_YEAR_AFTER,
      content,
      url: REVIEWED_ETMV_2023_URL_AFTER,
      metadata,
    },
    urlCitation: {
      ...input.urlCitation,
      citationText: REVIEWED_ETMV_2023_URL_CITATION_TEXT_AFTER,
      title: REVIEWED_ETMV_2023_TITLE_AFTER,
      year: REVIEWED_ETMV_2023_YEAR_AFTER,
      url: REVIEWED_ETMV_2023_URL_AFTER,
      verificationStatus: 'needs_review' as const,
      archivedUrl: null,
      verifiedAt: null,
      verifiedBy: null,
    },
    localCitation: {
      ...input.localCitation,
      citationText: REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_AFTER,
      title: REVIEWED_ETMV_2023_TITLE_AFTER,
      year: REVIEWED_ETMV_2023_YEAR_AFTER,
      fileHash: REVIEWED_ETMV_2023_PDF_SHA256,
    },
    libraryAnalysisRecord: {
      ...input.libraryAnalysisRecord,
      title: REVIEWED_ETMV_2023_TITLE_AFTER,
      aiSummary,
      aiCard: {
        ...(input.libraryAnalysisRecord.aiCard as Record<string, unknown>),
        shortSummary: repairedShortSummary,
      },
      contentHash,
    },
  }
}

function protectedCollections(collections: ReviewedEtmv2023Collections) {
  const canonical = canonicalizeReviewedEtmv2023Json(collections) as Record<
    keyof ReviewedEtmv2023Collections,
    Array<Record<string, ReviewedEtmv2023CanonicalJsonValue>>
  >
  return {
    ...canonical,
    documents: canonical.documents.map((row) => {
      if (row.id !== REVIEWED_ETMV_2023_DOCUMENT_ID) return row
      const copy = { ...row }
      delete copy.title
      delete copy.year
      delete copy.content
      delete copy.url
      delete copy.updatedAt
      const metadata = copy.metadata
      if (metadata && !Array.isArray(metadata) && typeof metadata === 'object') {
        const metadataCopy = { ...metadata }
        const backlog = metadataCopy.backlog
        if (backlog && !Array.isArray(backlog) && typeof backlog === 'object') {
          const backlogCopy = { ...backlog }
          delete backlogCopy.title
          delete backlogCopy.year
          delete backlogCopy.url
          metadataCopy.backlog = backlogCopy
        }
        copy.metadata = metadataCopy
      }
      return copy
    }),
    sourceCitations: canonical.sourceCitations.map((row) => {
      if (
        row.id !== REVIEWED_ETMV_2023_URL_CITATION_ID &&
        row.id !== REVIEWED_ETMV_2023_LOCAL_CITATION_ID
      ) {
        return row
      }
      const copy = { ...row }
      const mutable =
        row.id === REVIEWED_ETMV_2023_URL_CITATION_ID
          ? REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.mutableFields
              .UrlSourceCitation
          : REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.mutableFields
              .LocalSourceCitation
      for (const field of mutable) delete copy[field]
      delete copy.updatedAt
      return copy
    }),
    libraryAnalysisRecords: canonical.libraryAnalysisRecords.map((row) => {
      if (row.id !== REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID) return row
      const copy = { ...row }
      delete copy.title
      delete copy.aiSummary
      delete copy.contentHash
      delete copy.updatedAt
      const card = copy.aiCard
      if (card && !Array.isArray(card) && typeof card === 'object') {
        const cardCopy = { ...card }
        delete cardCopy.shortSummary
        copy.aiCard = cardCopy
      }
      return copy
    }),
  }
}

function dependencyState(collections: ReviewedEtmv2023Collections) {
  const normalized = normalizeCollections(collections)
  const counts = Object.fromEntries(
    collectionNames.map((name) => [name, normalized[name].length]),
  ) as Record<keyof ReviewedEtmv2023Collections, number>
  const ids = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      normalized[name].map((row) => rowId(row, name)),
    ]),
  ) as Record<keyof ReviewedEtmv2023Collections, string[]>
  return {
    normalized,
    counts,
    ids,
    sha256: canonicalHash(normalized),
    preservedSha256: canonicalHash(protectedCollections(normalized)),
  }
}

export function buildReviewedEtmv2023Plan(input: {
  databaseIdentity: ReviewedEtmv2023DatabaseIdentity
  artifactSha256: string
  collections: ReviewedEtmv2023Collections
}): ReviewedEtmv2023Inspection {
  validateReviewedEtmv2023IdentityRepairContract()
  const seedTarget = assertReviewedEtmv2023ReportSeed(reports)
  const collections = normalizeCollections(input.collections)
  const dependencies = dependencyState(collections)
  const conflicts: ReviewedEtmv2023Conflict[] = []
  if (input.artifactSha256 !== REVIEWED_ETMV_2023_PDF_SHA256) {
    conflict(
      conflicts,
      'artifact_hash_drift',
      REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH,
      `expected=${REVIEWED_ETMV_2023_PDF_SHA256}; actual=${input.artifactSha256}`,
    )
  }

  const report = exactOne(
    collections.reports.filter((row) => row.id === REVIEWED_ETMV_2023_REPORT_ID),
    `Report:${REVIEWED_ETMV_2023_REPORT_ID}`,
    conflicts,
  )
  const document = exactOne(
    collections.documents.filter(
      (row) => row.id === REVIEWED_ETMV_2023_DOCUMENT_ID,
    ),
    `Document:${REVIEWED_ETMV_2023_DOCUMENT_ID}`,
    conflicts,
  )
  const urlCitation = exactOne(
    collections.sourceCitations.filter(
      (row) => row.id === REVIEWED_ETMV_2023_URL_CITATION_ID,
    ),
    `SourceCitation:${REVIEWED_ETMV_2023_URL_CITATION_ID}`,
    conflicts,
  )
  const localCitation = exactOne(
    collections.sourceCitations.filter(
      (row) => row.id === REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
    ),
    `SourceCitation:${REVIEWED_ETMV_2023_LOCAL_CITATION_ID}`,
    conflicts,
  )
  const urlFieldCitation = exactOne(
    collections.fieldCitations.filter(
      (row) => row.id === REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID,
    ),
    `FieldCitation:${REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID}`,
    conflicts,
  )
  const localFieldCitation = exactOne(
    collections.fieldCitations.filter(
      (row) => row.id === REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID,
    ),
    `FieldCitation:${REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID}`,
    conflicts,
  )
  const protectedReportCitation = exactOne(
    collections.sourceCitations.filter(
      (row) => row.id === REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID,
    ),
    `SourceCitation:${REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID}`,
    conflicts,
  )
  const protectedReportFieldCitation = exactOne(
    collections.fieldCitations.filter(
      (row) =>
        row.id === REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID,
    ),
    `FieldCitation:${REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID}`,
    conflicts,
  )
  const libraryAnalysisRecord = exactOne(
    collections.libraryAnalysisRecords.filter(
      (row) => row.id === REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
    ),
    `LibraryAnalysisRecord:${REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID}`,
    conflicts,
  )

  if (
    report &&
    document &&
    urlCitation &&
    localCitation &&
    urlFieldCitation &&
    localFieldCitation &&
    protectedReportCitation &&
    protectedReportFieldCitation &&
    libraryAnalysisRecord
  ) {
    try {
      assertCoreBindings({
        report,
        document,
        urlCitation,
        localCitation,
        urlFieldCitation,
        localFieldCitation,
        protectedReportCitation,
        protectedReportFieldCitation,
        libraryAnalysisRecord,
      })
      const composite = reviewedEtmv2023LibraryAnalysisContentHash({
        summary: document.summary,
        content: document.content,
      })
      if (libraryAnalysisRecord.contentHash !== composite) {
        throw new Error(
          `LibraryAnalysisRecord.contentHash=${libraryAnalysisRecord.contentHash}; computed=${composite}`,
        )
      }
    } catch (error) {
      conflict(
        conflicts,
        'protected_binding_or_policy_drift',
        REVIEWED_ETMV_2023_REPORT_ID,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  const targetStates = {
    document: document
      ? projectionState(
          reviewedEtmv2023DocumentProjection(document),
          documentBeforeProjection,
          documentAfterProjection,
        )
      : 'conflict',
    urlCitation: urlCitation
      ? projectionState(
          urlCitationProjection(urlCitation),
          urlCitationBeforeProjection,
          urlCitationAfterProjection,
        )
      : 'conflict',
    localCitation: localCitation
      ? projectionState(
          localCitationProjection(localCitation),
          localCitationBeforeProjection,
          localCitationAfterProjection,
        )
      : 'conflict',
    libraryAnalysisRecord: libraryAnalysisRecord
      ? projectionState(
          libraryProjection(libraryAnalysisRecord),
          libraryBeforeProjection,
          libraryAfterProjection,
        )
      : 'conflict',
  }
  for (const [subject, state] of Object.entries(targetStates)) {
    if (state === 'conflict') {
      conflict(
        conflicts,
        'target_projection_drift',
        subject,
        'Target matches neither the exact reviewed before nor after projection',
      )
    }
  }

  const values = Object.values(targetStates)
  let atomicState: ReviewedEtmv2023AtomicState = 'conflict'
  if (conflicts.length === 0 && values.every((state) => state === 'before')) {
    atomicState = 'all_before'
  } else if (
    conflicts.length === 0 &&
    values.every((state) => state === 'after')
  ) {
    atomicState = 'all_after'
  } else if (conflicts.length === 0) {
    atomicState = 'hybrid'
    conflict(
      conflicts,
      'atomic_hybrid',
      REVIEWED_ETMV_2023_REPORT_ID,
      'The four mutable projections must be exact all-before or exact all-after',
    )
  }

  const targetRows = {
    report,
    document,
    urlCitation,
    localCitation,
    urlFieldCitation,
    localFieldCitation,
    protectedReportCitation,
    protectedReportFieldCitation,
    libraryAnalysisRecord,
  }
  const targetHashes = Object.fromEntries(
    Object.entries(targetRows).map(([key, row]) => [
      key,
      row === null ? null : canonicalHash(row),
    ]),
  ) as ReviewedEtmv2023Plan['targetHashes']
  const pendingTargets = values.filter((state) => state === 'before').length
  const appliedTargets = values.filter((state) => state === 'after').length

  return {
    plan: {
      version: REVIEWED_ETMV_2023_IDENTITY_REPAIR_VERSION,
      contractSha256: REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256,
      seedTargetSha256: canonicalHash(seedTarget),
      artifactSha256: input.artifactSha256,
      databaseIdentity: input.databaseIdentity,
      atomicState,
      targetStateSha256: canonicalHash(targetRows),
      dependencySha256: dependencies.sha256,
      preservedDependencySha256: dependencies.preservedSha256,
      dependencyScope: REVIEWED_ETMV_2023_IDENTITY_REPAIR_DEPENDENCY_SCOPE,
      dependencyCounts: dependencies.counts,
      dependencyIds: dependencies.ids,
      targetStates,
      targetHashes,
      conflicts,
      summary: {
        targets: 4,
        pendingTargets,
        appliedTargets,
        conflicts: conflicts.length,
      },
      boundary: REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT.boundary,
    },
    collections,
  }
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, '$queryRaw'>,
): Promise<ReviewedEtmv2023DatabaseIdentity> {
  const databaseRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `)
  if (
    databaseRows.length !== 1 ||
    !databaseRows[0]?.currentDatabase ||
    databaseRows[0].identityTable === null
  ) {
    throw new Error('Reviewed ETMV 2023 repair requires DatabaseIdentity metadata')
  }
  const rows = await client.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    ORDER BY "key"
  `)
  const row = rows[0]
  if (
    rows.length !== 1 ||
    row?.key !== 'primary' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      row.identityUuid,
    ) ||
    !(row.createdAt instanceof Date) ||
    Number.isNaN(row.createdAt.valueOf())
  ) {
    throw new Error(
      'Reviewed ETMV 2023 repair requires exactly one valid primary DatabaseIdentity row',
    )
  }
  return {
    currentDatabase: databaseRows[0].currentDatabase,
    key: 'primary',
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  }
}

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export async function inspectReviewedEtmv2023ArtifactSha256(
  repositoryRoot = scriptRoot,
) {
  const bytes = await readFile(
    resolve(repositoryRoot, REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH),
  )
  return sha256ReviewedEtmv2023Text(bytes)
}

async function assertCanonicalFieldCitationTargets(
  client: Pick<Prisma.TransactionClient, '$queryRaw'>,
) {
  const rows = await client.$queryRaw<
    Array<{ id: string; entityType: string; entityId: string }>
  >(Prisma.sql`
    SELECT "id", "entityType", "entityId"
    FROM "FieldCitation"
    WHERE (
      (
        regexp_replace(lower(btrim("entityType")), '[^a-z0-9]+', '', 'g') = 'document'
        AND regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g') = ${REVIEWED_ETMV_2023_DOCUMENT_ID}
        AND (
          "entityType" IS DISTINCT FROM 'Document'
          OR "entityId" IS DISTINCT FROM ${REVIEWED_ETMV_2023_DOCUMENT_ID}
        )
      ) OR (
        regexp_replace(lower(btrim("entityType")), '[^a-z0-9]+', '', 'g') = 'report'
        AND regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g') = ${REVIEWED_ETMV_2023_REPORT_ID}
        AND (
          "entityType" IS DISTINCT FROM 'Report'
          OR "entityId" IS DISTINCT FROM ${REVIEWED_ETMV_2023_REPORT_ID}
        )
      )
    )
    ORDER BY "id"
  `)
  if (rows.length > 0) {
    throw new Error(
      `Reviewed ETMV 2023 dependency closure found non-canonical FieldCitation targets: ${rows
        .map((row) => `${row.id}:${row.entityType}:${row.entityId}`)
        .join(', ')}`,
    )
  }
}

export async function inspectReviewedEtmv2023DatabaseState(
  client: ReviewedEtmv2023Client,
): Promise<ReviewedEtmv2023Inspection> {
  await assertCanonicalFieldCitationTargets(client)
  const [databaseIdentity, artifactSha256, reportsRows, documents] =
    await Promise.all([
      inspectDatabaseIdentity(client),
      inspectReviewedEtmv2023ArtifactSha256(),
      client.report.findMany({
        where: { id: REVIEWED_ETMV_2023_REPORT_ID },
        select: reportSelect,
        orderBy: { id: 'asc' },
      }),
      client.document.findMany({
        where: { id: REVIEWED_ETMV_2023_DOCUMENT_ID },
        select: documentSelect,
        orderBy: { id: 'asc' },
      }),
    ])

  const sourceCitations = await client.sourceCitation.findMany({
    where: {
      OR: [
        {
          id: {
            in: [
              REVIEWED_ETMV_2023_URL_CITATION_ID,
              REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
              REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID,
            ],
          },
        },
        { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
        {
          fieldCitations: {
            some: {
              OR: [
                {
                  entityType: 'Document',
                  entityId: REVIEWED_ETMV_2023_DOCUMENT_ID,
                },
                {
                  entityType: 'Report',
                  entityId: REVIEWED_ETMV_2023_REPORT_ID,
                },
              ],
            },
          },
        },
        {
          reviewBasisForAppraisals: {
            some: { reportId: REVIEWED_ETMV_2023_REPORT_ID },
          },
        },
      ],
    },
    select: sourceCitationSelect,
    orderBy: { id: 'asc' },
  })
  const citationIds = sourceCitations.map((row) => row.id)
  const [
    fieldCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
    documentRefs,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
    sourceDocBindings,
    thesisBindings,
    reportBindings,
    insightCitationBindings,
    producerCitationBindings,
  ] = await Promise.all([
    client.fieldCitation.findMany({
      where: {
        OR: [
          { citationId: { in: citationIds } },
          {
            entityType: 'Document',
            entityId: REVIEWED_ETMV_2023_DOCUMENT_ID,
          },
          { entityType: 'Report', entityId: REVIEWED_ETMV_2023_REPORT_ID },
        ],
      },
      select: fieldCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
          { sourceKey: `document:${REVIEWED_ETMV_2023_DOCUMENT_ID}` },
          { sourceKey: `report:${REVIEWED_ETMV_2023_REPORT_ID}` },
        ],
      },
      select: libraryAnalysisRecordSelect,
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { reportId: REVIEWED_ETMV_2023_REPORT_ID },
          { reviewBasisCitationId: { in: citationIds } },
        ],
      },
      select: evidenceAppraisalSelect,
      orderBy: { id: 'asc' },
    }),
    client.documentRef.findMany({
      where: {
        OR: [
          { fromId: REVIEWED_ETMV_2023_DOCUMENT_ID },
          { toId: REVIEWED_ETMV_2023_DOCUMENT_ID },
        ],
      },
      select: documentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: insightDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: companyDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: actorDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceDoc.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: sourceDocBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.thesis.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: thesisBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.report.findMany({
      where: { documentId: REVIEWED_ETMV_2023_DOCUMENT_ID },
      select: reportBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.insight.findMany({
      where: { primaryCitationId: { in: citationIds } },
      select: insightCitationBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.producer.findMany({
      where: { primaryCitationId: { in: citationIds } },
      select: producerCitationBindingSelect,
      orderBy: { id: 'asc' },
    }),
  ])

  return buildReviewedEtmv2023Plan({
    databaseIdentity,
    artifactSha256,
    collections: {
      reports: reportsRows,
      documents,
      sourceCitations,
      fieldCitations,
      libraryAnalysisRecords,
      evidenceAppraisals,
      documentRefs,
      insightDocumentRefs,
      companyDocumentRefs,
      actorDocumentRefs,
      sourceDocBindings,
      thesisBindings,
      reportBindings,
      insightCitationBindings,
      producerCitationBindings,
    },
  })
}

export function reviewedEtmv2023PlanSha256(plan: ReviewedEtmv2023Plan) {
  return canonicalHash(plan)
}

export function parseReviewedEtmv2023Args(
  argv: readonly string[],
): ReviewedEtmv2023Args {
  let apply = false
  let dryRun = false
  let ack: string | undefined
  let expectedPlanSha256: string | undefined
  for (const argument of argv) {
    if (argument === '--apply') {
      if (apply) throw new Error('--apply must not be repeated')
      apply = true
    } else if (argument === '--dry-run') {
      if (dryRun) throw new Error('--dry-run must not be repeated')
      dryRun = true
    } else if (argument.startsWith('--ack=')) {
      if (ack !== undefined) throw new Error('--ack must not be repeated')
      ack = argument.slice('--ack='.length)
    } else if (argument.startsWith('--plan-sha256=')) {
      if (expectedPlanSha256 !== undefined) {
        throw new Error('--plan-sha256 must not be repeated')
      }
      expectedPlanSha256 = argument.slice('--plan-sha256='.length)
    } else {
      throw new Error(`Unknown reviewed ETMV 2023 argument: ${argument}`)
    }
  }
  if (apply && dryRun) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error('--ack and --plan-sha256 are valid only with --apply')
  }
  return { apply, ack, expectedPlanSha256 }
}

export function assertReviewedEtmv2023PlanReady(plan: ReviewedEtmv2023Plan) {
  if (
    plan.conflicts.length > 0 ||
    (plan.atomicState !== 'all_before' && plan.atomicState !== 'all_after') ||
    (plan.atomicState === 'all_before' && plan.summary.pendingTargets !== 4) ||
    (plan.atomicState === 'all_after' && plan.summary.appliedTargets !== 4) ||
    plan.artifactSha256 !== REVIEWED_ETMV_2023_PDF_SHA256
  ) {
    throw new Error(
      `Reviewed ETMV 2023 identity conflicts or hybrid state detected: ${plan.conflicts
        .map((item) => `${item.code}:${item.subject}:${item.detail}`)
        .join(', ')}`,
    )
  }
  return plan.atomicState
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value }
}

export function fullReviewedEtmv2023DocumentWhere(
  row: ReviewedEtmv2023DocumentRow,
): Prisma.DocumentWhereInput {
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    content: row.content,
    summary: row.summary,
    url: row.url,
    accessedAt: row.accessedAt,
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: { equals: row.tags },
    metadata: nullableJsonWhere(row.metadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } as Prisma.DocumentWhereInput
}

export function fullReviewedEtmv2023SourceCitationWhere(
  row: ReviewedEtmv2023SourceCitationRow,
): Prisma.SourceCitationWhereInput {
  return {
    id: row.id,
    sourceClass: row.sourceClass,
    citationReadiness: row.citationReadiness,
    verificationStatus: row.verificationStatus,
    citationText: row.citationText,
    title: row.title,
    publisher: row.publisher,
    author: row.author,
    year: row.year,
    url: row.url,
    archivedUrl: row.archivedUrl,
    localPath: row.localPath,
    fileHash: row.fileHash,
    contentHash: row.contentHash,
    hashAlgorithm: row.hashAlgorithm,
    pageRef: row.pageRef,
    quote: row.quote,
    accessedAt: row.accessedAt,
    captureMethod: row.captureMethod,
    verifiedAt: row.verifiedAt,
    verifiedBy: row.verifiedBy,
    confidence: row.confidence,
    notes: row.notes,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function fullReviewedEtmv2023LibraryAnalysisWhere(
  row: ReviewedEtmv2023LibraryAnalysisRow,
): Prisma.LibraryAnalysisRecordWhereInput {
  return {
    id: row.id,
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.status,
    usageRule: row.usageRule,
    reviewStatus: row.reviewStatus,
    citationReadiness: row.citationReadiness,
    analysisTier: row.analysisTier,
    aiCard: nullableJsonWhere(row.aiCard),
    aiSummary: row.aiSummary,
    keyFindings: { equals: row.keyFindings },
    claimCandidates: nullableJsonWhere(row.claimCandidates),
    projectImplications: { equals: row.projectImplications },
    gaps: nullableJsonWhere(row.gaps),
    controlLinks: nullableJsonWhere(row.controlLinks),
    riskFlags: { equals: row.riskFlags },
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: row.processedAt,
    reviewedAt: row.reviewedAt,
    reviewer: row.reviewer,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } as Prisma.LibraryAnalysisRecordWhereInput
}

async function fullRowCasPreflight(
  client: ReviewedEtmv2023Client,
  inspection: ReviewedEtmv2023Inspection,
) {
  if (inspection.plan.atomicState === 'all_after') return []
  const document = inspection.collections.documents.find(
    (row) => row.id === REVIEWED_ETMV_2023_DOCUMENT_ID,
  )
  const urlCitation = inspection.collections.sourceCitations.find(
    (row) => row.id === REVIEWED_ETMV_2023_URL_CITATION_ID,
  )
  const localCitation = inspection.collections.sourceCitations.find(
    (row) => row.id === REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
  )
  const library = inspection.collections.libraryAnalysisRecords.find(
    (row) => row.id === REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
  )
  const checks = await Promise.all([
    document
      ? client.document.count({ where: fullReviewedEtmv2023DocumentWhere(document) })
      : 0,
    urlCitation
      ? client.sourceCitation.count({
          where: fullReviewedEtmv2023SourceCitationWhere(urlCitation),
        })
      : 0,
    localCitation
      ? client.sourceCitation.count({
          where: fullReviewedEtmv2023SourceCitationWhere(localCitation),
        })
      : 0,
    library
      ? client.libraryAnalysisRecord.count({
          where: fullReviewedEtmv2023LibraryAnalysisWhere(library),
        })
      : 0,
  ])
  return checks
    .map((count, index) => ({
      subject: ['Document', 'URL SourceCitation', 'local SourceCitation', 'LibraryAnalysisRecord'][index]!,
      count,
    }))
    .filter((item) => item.count !== 1)
}

async function lockDependencyTables(transaction: Prisma.TransactionClient) {
  await transaction.$executeRaw`
    LOCK TABLE
      "DatabaseIdentity", "Report", "Document", "DocumentRef", "SourceDoc",
      "Thesis", "SourceCitation", "FieldCitation", "LibraryAnalysisRecord",
      "EvidenceAppraisal", "Insight", "Producer", "InsightDocumentRef",
      "CompanyDocumentRef", "ActorDocumentRef"
    IN SHARE ROW EXCLUSIVE MODE
  `
}

function exactIds(actual: readonly string[], expected: readonly string[]) {
  return (
    JSON.stringify([...actual].sort(compareIds)) ===
    JSON.stringify([...expected].sort(compareIds))
  )
}

async function lockCoreRows(transaction: Prisma.TransactionClient) {
  const reportsLocked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "Report" WHERE "id" = ${REVIEWED_ETMV_2023_REPORT_ID} FOR SHARE`,
  )
  const documentsLocked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "Document" WHERE "id" = ${REVIEWED_ETMV_2023_DOCUMENT_ID} FOR UPDATE`,
  )
  const citationIds = [
    REVIEWED_ETMV_2023_URL_CITATION_ID,
    REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
    REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID,
  ]
  const citationsLocked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "SourceCitation" WHERE "id" IN (${Prisma.join(citationIds)}) ORDER BY "id" FOR UPDATE`,
  )
  const fieldCitationIds = [
    REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID,
    REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID,
    REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID,
  ]
  const fieldCitationsLocked = await transaction.$queryRaw<
    Array<{ id: string }>
  >(
    Prisma.sql`SELECT "id" FROM "FieldCitation" WHERE "id" IN (${Prisma.join(fieldCitationIds)}) ORDER BY "id" FOR SHARE`,
  )
  const libraryLocked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`SELECT "id" FROM "LibraryAnalysisRecord" WHERE "id" = ${REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID} FOR UPDATE`,
  )
  if (
    !exactIds(reportsLocked.map((row) => row.id), [REVIEWED_ETMV_2023_REPORT_ID]) ||
    !exactIds(documentsLocked.map((row) => row.id), [REVIEWED_ETMV_2023_DOCUMENT_ID]) ||
    !exactIds(citationsLocked.map((row) => row.id), citationIds) ||
    !exactIds(fieldCitationsLocked.map((row) => row.id), fieldCitationIds) ||
    !exactIds(libraryLocked.map((row) => row.id), [REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID])
  ) {
    throw new Error('Reviewed ETMV 2023 core target set changed after planning')
  }
}

async function lockDatabaseIdentity(
  transaction: Prisma.TransactionClient,
  expected: ReviewedEtmv2023DatabaseIdentity,
) {
  const rows = await transaction.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    ORDER BY "key" FOR SHARE
  `)
  const actual = rows.map((row) => ({
    currentDatabase: expected.currentDatabase,
    key: row.key,
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  }))
  if (actual.length !== 1 || canonicalHash(actual[0]) !== canonicalHash(expected)) {
    throw new Error('Reviewed ETMV 2023 DatabaseIdentity changed after planning')
  }
}

async function applyReviewedEtmv2023Updates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedEtmv2023Inspection,
) {
  const document = inspection.collections.documents.find(
    (row) => row.id === REVIEWED_ETMV_2023_DOCUMENT_ID,
  )!
  const urlCitation = inspection.collections.sourceCitations.find(
    (row) => row.id === REVIEWED_ETMV_2023_URL_CITATION_ID,
  )!
  const localCitation = inspection.collections.sourceCitations.find(
    (row) => row.id === REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
  )!
  const libraryAnalysisRecord = inspection.collections.libraryAnalysisRecords.find(
    (row) => row.id === REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
  )!
  const after = materializeReviewedEtmv2023AfterRows({
    document,
    urlCitation,
    localCitation,
    libraryAnalysisRecord,
  })
  const documentResult = await transaction.document.updateMany({
    where: fullReviewedEtmv2023DocumentWhere(document),
    data: {
      title: after.document.title,
      year: after.document.year,
      content: after.document.content,
      url: after.document.url,
      metadata: after.document.metadata,
    },
  })
  const urlCitationResult = await transaction.sourceCitation.updateMany({
    where: fullReviewedEtmv2023SourceCitationWhere(urlCitation),
    data: {
      citationText: after.urlCitation.citationText,
      title: after.urlCitation.title,
      year: after.urlCitation.year,
      url: after.urlCitation.url,
      verificationStatus: after.urlCitation.verificationStatus,
      archivedUrl: null,
      verifiedAt: null,
      verifiedBy: null,
    },
  })
  const localCitationResult = await transaction.sourceCitation.updateMany({
    where: fullReviewedEtmv2023SourceCitationWhere(localCitation),
    data: {
      citationText: after.localCitation.citationText,
      title: after.localCitation.title,
      year: after.localCitation.year,
      fileHash: after.localCitation.fileHash,
    },
  })
  const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
    where: fullReviewedEtmv2023LibraryAnalysisWhere(libraryAnalysisRecord),
    data: {
      title: after.libraryAnalysisRecord.title,
      aiSummary: after.libraryAnalysisRecord.aiSummary,
      aiCard: after.libraryAnalysisRecord.aiCard as Prisma.InputJsonValue,
      contentHash: after.libraryAnalysisRecord.contentHash,
    },
  })
  const counts = {
    documents: documentResult.count,
    urlCitations: urlCitationResult.count,
    localCitations: localCitationResult.count,
    libraryAnalysisRecords: libraryResult.count,
  }
  if (Object.values(counts).some((count) => count !== 1)) {
    throw new Error(
      `Reviewed ETMV 2023 full-row CAS conflict: ${JSON.stringify(counts)}; transaction must roll back`,
    )
  }
  return counts
}

function sameIds(
  left: Record<keyof ReviewedEtmv2023Collections, string[]>,
  right: Record<keyof ReviewedEtmv2023Collections, string[]>,
) {
  return canonicalHash(left) === canonicalHash(right)
}

export function assertReviewedEtmv2023PostApply(
  before: ReviewedEtmv2023Inspection,
  after: ReviewedEtmv2023Inspection,
) {
  assertReviewedEtmv2023PlanReady(after.plan)
  if (
    after.plan.atomicState !== 'all_after' ||
    after.plan.summary.appliedTargets !== 4 ||
    canonicalHash(after.plan.databaseIdentity) !==
      canonicalHash(before.plan.databaseIdentity) ||
    after.plan.seedTargetSha256 !== before.plan.seedTargetSha256 ||
    after.plan.artifactSha256 !== before.plan.artifactSha256 ||
    after.plan.preservedDependencySha256 !==
      before.plan.preservedDependencySha256 ||
    !sameIds(after.plan.dependencyIds, before.plan.dependencyIds) ||
    canonicalHash(after.plan.dependencyCounts) !==
      canonicalHash(before.plan.dependencyCounts)
  ) {
    throw new Error(
      'Reviewed ETMV 2023 post-apply identity, artifact, seed, dependency, or idempotence proof failed; transaction must roll back',
    )
  }
}

function printPlan(inspection: ReviewedEtmv2023Inspection, digest: string) {
  const plan = inspection.plan
  console.log('Reviewed ETMV 2023 generated-projection identity repair')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Contract SHA-256: ${plan.contractSha256}`)
  console.log(`Seed target SHA-256: ${plan.seedTargetSha256}`)
  console.log(`Artifact SHA-256: ${plan.artifactSha256}`)
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`,
  )
  console.log(
    `Atomic state: ${plan.atomicState}; targets=${plan.summary.targets}; pending=${plan.summary.pendingTargets}; applied=${plan.summary.appliedTargets}; conflicts=${plan.summary.conflicts}`,
  )
  console.log(
    `Target state SHA-256: ${plan.targetStateSha256}; dependency SHA-256: ${plan.dependencySha256}; preserved dependency SHA-256: ${plan.preservedDependencySha256}`,
  )
  console.log(`Target states: ${JSON.stringify(plan.targetStates)}`)
  console.log(`Dependency counts: ${JSON.stringify(plan.dependencyCounts)}`)
  console.log(
    `Boundary: ${REVIEWED_ETMV_2023_IDENTITY_REPAIR_DEPENDENCY_SCOPE.join('; ')}`,
  )
  for (const item of plan.conflicts) {
    console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`)
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning|CAS conflict|roll back/i.test(
    message,
  )
}

async function main() {
  const args = parseReviewedEtmv2023Args(process.argv.slice(2))
  if (
    args.apply &&
    args.ack !== REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK
  ) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK}`,
    )
  }
  if (
    args.apply &&
    !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')
  ) {
    throw new Error(
      '--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run',
    )
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const inspection = await inspectReviewedEtmv2023DatabaseState(prisma)
    assertReviewedEtmv2023PlanReady(inspection.plan)
    const digest = reviewedEtmv2023PlanSha256(inspection.plan)
    printPlan(inspection, digest)
    const mismatches = await fullRowCasPreflight(prisma, inspection)
    if (mismatches.length > 0) {
      throw new Error(
        `Reviewed ETMV 2023 full-row CAS preflight mismatch: ${mismatches
          .map((item) => `${item.subject}:${item.count}`)
          .join(', ')}`,
      )
    }
    console.log(
      `Full-row CAS preflight: ${inspection.plan.atomicState === 'all_before' ? '4/4 exact pending snapshots matched' : 'idempotent all-after state; no pending snapshots'}`,
    )
    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${REVIEWED_ETMV_2023_IDENTITY_REPAIR_APPLY_ACK} --plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current reviewed ETMV 2023 plan differs from --plan-sha256')
    }
    if (inspection.plan.atomicState === 'all_after') {
      console.log('Reviewed ETMV 2023 identity repair is already applied; zero rows updated')
      return
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        await lockDependencyTables(transaction)
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_ETMV_2023_IDENTITY_REPAIR_ADVISORY_LOCK_KEY}))
        `
        const locked = await inspectReviewedEtmv2023DatabaseState(transaction)
        assertReviewedEtmv2023PlanReady(locked.plan)
        if (reviewedEtmv2023PlanSha256(locked.plan) !== args.expectedPlanSha256) {
          throw new Error(
            'Locked reviewed ETMV 2023 plan changed after planning; no rows updated',
          )
        }
        await lockCoreRows(transaction)
        await lockDatabaseIdentity(transaction, inspection.plan.databaseIdentity)
        const counts = await applyReviewedEtmv2023Updates(transaction, locked)
        const after = await inspectReviewedEtmv2023DatabaseState(transaction)
        assertReviewedEtmv2023PostApply(locked, after)
        return counts
      },
      { isolationLevel: 'Serializable' },
    )
    console.log(
      `Reviewed ETMV 2023 identity repair applied: ${JSON.stringify(result)}; Report, Report citation, FieldCitations, bindings, and all protected dependency state unchanged`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Reviewed ETMV 2023 identity repair conflicted or failed a postcondition; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
        { cause: error },
      )
    }
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch((error) => {
    console.error(
      error instanceof Error
        ? error.message
        : 'Reviewed ETMV 2023 identity repair failed',
    )
    process.exitCode = 1
  })
}
