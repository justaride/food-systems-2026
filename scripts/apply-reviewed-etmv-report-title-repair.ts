import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import {
  PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
  REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO,
  REVIEWED_ETMV_REPORT_CITATION_TEXT_AFTER,
  REVIEWED_ETMV_REPORT_CONTENT_HASHES,
  REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
  REVIEWED_ETMV_REPORT_FULL_ROW_HASHES,
  REVIEWED_ETMV_REPORT_ID,
  REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
  REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
  REVIEWED_ETMV_REPORT_TITLE_AFTER,
  REVIEWED_ETMV_REPORT_TITLE_BEFORE,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT,
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_VERSION,
  canonicalizeReviewedEtmvJson,
  replaceReviewedEtmvTitleExactlyOnce,
  reviewedEtmvLibraryAnalysisContentHash,
  sha256ReviewedEtmvJson,
  sha256ReviewedEtmvText,
  validateReviewedEtmvReportTitleRepairContract,
  type ReviewedEtmvCanonicalJsonValue,
} from '../src/lib/citations/reviewed-etmv-report-title-repair'

export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK =
  'APPLY_REVIEWED_ETMV_REPORT_TITLE_REPAIR_1'
export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_ADVISORY_LOCK_KEY =
  'foodsystems:reviewed-etmv-report-title-repair:2026-07-20:v1'

export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_DEPENDENCY_SCOPE =
  Object.freeze([
    'primary DatabaseIdentity row',
    'the exact Report and its exact Report.documentId binding',
    'the exact generated Document and every direct Report, Thesis, or SourceDoc binding to it',
    'the exact SourceCitation plus every SourceCitation directly bound to the target Document',
    'every FieldCitation targeting the Report or referencing the enumerated SourceCitations',
    'every LibraryAnalysisRecord directly bound to the Document or keyed as report:<target-id>',
    'every EvidenceAppraisal bound to the Report or using an enumerated SourceCitation as review basis',
    'every DocumentRef, InsightDocumentRef, CompanyDocumentRef, and ActorDocumentRef bound to the Document',
    'every Insight or Producer using an enumerated SourceCitation as primary citation',
    'boundary: no filesystem copy and no transitive consumers beyond these enumerated direct relations',
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

export type ReviewedEtmvReportRow = Prisma.ReportGetPayload<{
  select: typeof reportSelect
}>
export type ReviewedEtmvDocumentRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect
}>
export type ReviewedEtmvSourceCitationRow = Prisma.SourceCitationGetPayload<{
  select: typeof sourceCitationSelect
}>
export type ReviewedEtmvFieldCitationRow = Prisma.FieldCitationGetPayload<{
  select: typeof fieldCitationSelect
}>
export type ReviewedEtmvLibraryAnalysisRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect
  }>
export type ReviewedEtmvEvidenceAppraisalRow =
  Prisma.EvidenceAppraisalGetPayload<{
    select: typeof evidenceAppraisalSelect
  }>
export type ReviewedEtmvDocumentRefRow = Prisma.DocumentRefGetPayload<{
  select: typeof documentRefSelect
}>
export type ReviewedEtmvInsightDocumentRefRow =
  Prisma.InsightDocumentRefGetPayload<{
    select: typeof insightDocumentRefSelect
  }>
export type ReviewedEtmvCompanyDocumentRefRow =
  Prisma.CompanyDocumentRefGetPayload<{
    select: typeof companyDocumentRefSelect
  }>
export type ReviewedEtmvActorDocumentRefRow =
  Prisma.ActorDocumentRefGetPayload<{
    select: typeof actorDocumentRefSelect
  }>
export type ReviewedEtmvSourceDocBindingRow = Prisma.SourceDocGetPayload<{
  select: typeof sourceDocBindingSelect
}>
export type ReviewedEtmvThesisBindingRow = Prisma.ThesisGetPayload<{
  select: typeof thesisBindingSelect
}>
export type ReviewedEtmvReportBindingRow = Prisma.ReportGetPayload<{
  select: typeof reportBindingSelect
}>
export type ReviewedEtmvInsightCitationBindingRow = Prisma.InsightGetPayload<{
  select: typeof insightCitationBindingSelect
}>
export type ReviewedEtmvProducerCitationBindingRow = Prisma.ProducerGetPayload<{
  select: typeof producerCitationBindingSelect
}>

export type ReviewedEtmvDatabaseIdentity = {
  currentDatabase: string
  identityUuid: string
  createdAt: string
}

export type ReviewedEtmvCollections = {
  reports: ReviewedEtmvReportRow[]
  documents: ReviewedEtmvDocumentRow[]
  sourceCitations: ReviewedEtmvSourceCitationRow[]
  fieldCitations: ReviewedEtmvFieldCitationRow[]
  libraryAnalysisRecords: ReviewedEtmvLibraryAnalysisRow[]
  evidenceAppraisals: ReviewedEtmvEvidenceAppraisalRow[]
  documentRefs: ReviewedEtmvDocumentRefRow[]
  insightDocumentRefs: ReviewedEtmvInsightDocumentRefRow[]
  companyDocumentRefs: ReviewedEtmvCompanyDocumentRefRow[]
  actorDocumentRefs: ReviewedEtmvActorDocumentRefRow[]
  sourceDocBindings: ReviewedEtmvSourceDocBindingRow[]
  thesisBindings: ReviewedEtmvThesisBindingRow[]
  reportBindings: ReviewedEtmvReportBindingRow[]
  insightCitationBindings: ReviewedEtmvInsightCitationBindingRow[]
  producerCitationBindings: ReviewedEtmvProducerCitationBindingRow[]
}

export type ReviewedEtmvPinnedHashes = {
  Report: { before: string; after: string; nonTarget: string }
  Document: { before: string; after: string; nonTarget: string }
  SourceCitation: { before: string; after: string; nonTarget: string }
  FieldCitation: { before: string; after: string; nonTarget: string }
  LibraryAnalysisRecord: {
    before: string
    after: string
    nonTarget: string
  }
}

export type ReviewedEtmvAtomicState =
  | 'all_before'
  | 'all_after'
  | 'hybrid'
  | 'conflict'

export type ReviewedEtmvConflict = {
  code: string
  subject: string
  detail: string
}

export type ReviewedEtmvPlan = {
  version: typeof REVIEWED_ETMV_REPORT_TITLE_REPAIR_VERSION
  contractSha256: string
  seedTargetSha256: string
  databaseIdentity: ReviewedEtmvDatabaseIdentity
  atomicState: ReviewedEtmvAtomicState
  targetStateSha256: string
  dependencySha256: string
  preservedStateSha256: string
  dependencyScope: readonly string[]
  dependencyCounts: Record<keyof ReviewedEtmvCollections, number>
  dependencyIds: Record<keyof ReviewedEtmvCollections, string[]>
  targetHashes: {
    report: string | null
    document: string | null
    sourceCitation: string | null
    fieldCitation: string | null
    libraryAnalysisRecord: string | null
  }
  conflicts: ReviewedEtmvConflict[]
  summary: {
    targets: 4
    pendingTargets: number
    appliedTargets: number
    conflicts: number
  }
  boundary: typeof REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.boundary
}

export type ReviewedEtmvInspection = {
  plan: ReviewedEtmvPlan
  collections: ReviewedEtmvCollections
}

export type ReviewedEtmvArgs = {
  apply: boolean
  ack: string | undefined
  expectedPlanSha256: string | undefined
}

export type ReviewedEtmvClient = Pick<
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
] as const satisfies readonly (keyof ReviewedEtmvCollections)[]

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true })
}

function canonicalHash(value: unknown) {
  return sha256ReviewedEtmvJson(value)
}

function canonicalRow<T>(row: T) {
  return canonicalizeReviewedEtmvJson(row) as {
    [key: string]: ReviewedEtmvCanonicalJsonValue
  }
}

function omitTopLevel(
  row: { [key: string]: ReviewedEtmvCanonicalJsonValue },
  fields: readonly string[],
) {
  return Object.fromEntries(
    Object.entries(row).filter(([key]) => !fields.includes(key)),
  )
}

function libraryAnalysisNonTarget(row: ReviewedEtmvLibraryAnalysisRow) {
  const normalized = canonicalRow(row)
  const result = omitTopLevel(normalized, [
    'title',
    'aiSummary',
    'contentHash',
  ])
  const aiCard = result.aiCard
  if (aiCard && typeof aiCard === 'object' && !Array.isArray(aiCard)) {
    result.aiCard = Object.fromEntries(
      Object.entries(aiCard).filter(([key]) => key !== 'shortSummary'),
    )
  }
  return canonicalizeReviewedEtmvJson(result)
}

export function reviewedEtmvNonTargetHashes(input: {
  report: ReviewedEtmvReportRow
  document: ReviewedEtmvDocumentRow
  sourceCitation: ReviewedEtmvSourceCitationRow
  libraryAnalysisRecord: ReviewedEtmvLibraryAnalysisRow
}) {
  return {
    Report: canonicalHash(omitTopLevel(canonicalRow(input.report), ['title'])),
    Document: canonicalHash(
      omitTopLevel(canonicalRow(input.document), ['title', 'content']),
    ),
    SourceCitation: canonicalHash(
      omitTopLevel(canonicalRow(input.sourceCitation), [
        'citationText',
        'title',
        'accessedAt',
      ]),
    ),
    LibraryAnalysisRecord: canonicalHash(
      libraryAnalysisNonTarget(input.libraryAnalysisRecord),
    ),
  }
}

function exactOne<T>(
  rows: readonly T[],
  subject: string,
  conflicts: ReviewedEtmvConflict[],
): T | null {
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

function occurrenceCount(value: string, needle: string) {
  return value.split(needle).length - 1
}

function libraryCardShortSummary(
  row: ReviewedEtmvLibraryAnalysisRow,
): string | null {
  if (!row.aiCard || typeof row.aiCard !== 'object' || Array.isArray(row.aiCard)) {
    return null
  }
  const value = (row.aiCard as Record<string, unknown>).shortSummary
  return typeof value === 'string' ? value : null
}

export function materializeReviewedEtmvAfterRows(
  input: {
    report: ReviewedEtmvReportRow
    document: ReviewedEtmvDocumentRow
    sourceCitation: ReviewedEtmvSourceCitationRow
    fieldCitation: ReviewedEtmvFieldCitationRow
    libraryAnalysisRecord: ReviewedEtmvLibraryAnalysisRow
  },
  options: {
    verifyPinnedHashes?: boolean
    pinnedHashes?: ReviewedEtmvPinnedHashes
    contentHashes?: typeof REVIEWED_ETMV_REPORT_CONTENT_HASHES
  } = {},
) {
  const verifyPinnedHashes = options.verifyPinnedHashes ?? true
  const pinnedHashes = options.pinnedHashes ?? REVIEWED_ETMV_REPORT_FULL_ROW_HASHES
  const contentHashes =
    options.contentHashes ?? REVIEWED_ETMV_REPORT_CONTENT_HASHES

  if (
    input.report.id !== REVIEWED_ETMV_REPORT_ID ||
    input.report.documentId !== REVIEWED_ETMV_REPORT_DOCUMENT_ID ||
    input.document.id !== REVIEWED_ETMV_REPORT_DOCUMENT_ID ||
    input.sourceCitation.id !== REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID ||
    input.fieldCitation.id !== REVIEWED_ETMV_REPORT_FIELD_CITATION_ID ||
    input.libraryAnalysisRecord.id !== REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID
  ) {
    throw new Error('Reviewed ETMV target identity or Report->Document binding drifted')
  }
  if (
    input.fieldCitation.citationId !==
      REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID ||
    input.fieldCitation.entityType !== 'Report' ||
    input.fieldCitation.entityId !== REVIEWED_ETMV_REPORT_ID ||
    input.fieldCitation.fieldPath !== 'sourceUrl'
  ) {
    throw new Error('Reviewed ETMV FieldCitation binding drifted')
  }
  if (
    input.libraryAnalysisRecord.sourceKind !== 'document' ||
    input.libraryAnalysisRecord.sourceKey !==
      `document:${REVIEWED_ETMV_REPORT_DOCUMENT_ID}` ||
    input.libraryAnalysisRecord.documentId !==
      REVIEWED_ETMV_REPORT_DOCUMENT_ID
  ) {
    throw new Error('Reviewed ETMV LibraryAnalysisRecord binding drifted')
  }
  if (
    input.report.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE ||
    input.document.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE ||
    input.sourceCitation.citationText !==
      REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.before.citationText ||
    input.sourceCitation.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE ||
    input.sourceCitation.accessedAt !== null ||
    input.libraryAnalysisRecord.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE
  ) {
    throw new Error('Reviewed ETMV before projection drifted')
  }

  const documentContent = replaceReviewedEtmvTitleExactlyOnce(
    input.document.content,
    'Document.content',
  )
  const aiSummary = replaceReviewedEtmvTitleExactlyOnce(
    input.libraryAnalysisRecord.aiSummary ?? '',
    'LibraryAnalysisRecord.aiSummary',
  )
  const shortSummaryBefore = libraryCardShortSummary(
    input.libraryAnalysisRecord,
  )
  if (shortSummaryBefore === null) {
    throw new Error('Reviewed ETMV aiCard.shortSummary is missing')
  }
  const shortSummary = replaceReviewedEtmvTitleExactlyOnce(
    shortSummaryBefore,
    'LibraryAnalysisRecord.aiCard.shortSummary',
  )
  const rawBeforeHash = sha256ReviewedEtmvText(input.document.content)
  const rawAfterHash = sha256ReviewedEtmvText(documentContent)
  const compositeBeforeHash = reviewedEtmvLibraryAnalysisContentHash({
    summary: input.document.summary,
    content: input.document.content,
  })
  const compositeAfterHash = reviewedEtmvLibraryAnalysisContentHash({
    summary: input.document.summary,
    content: documentContent,
  })

  if (
    verifyPinnedHashes &&
    (rawBeforeHash !== contentHashes.documentContentBefore ||
      rawAfterHash !== contentHashes.documentContentAfter ||
      compositeBeforeHash !== contentHashes.libraryAnalysisContentBefore ||
      compositeAfterHash !== contentHashes.libraryAnalysisContentAfter ||
      input.libraryAnalysisRecord.contentHash !== compositeBeforeHash)
  ) {
    throw new Error(
      'Reviewed ETMV raw or LibraryAnalysis composite content hash drifted',
    )
  }

  const report = {
    ...input.report,
    title: REVIEWED_ETMV_REPORT_TITLE_AFTER,
  }
  const document = {
    ...input.document,
    title: REVIEWED_ETMV_REPORT_TITLE_AFTER,
    content: documentContent,
  }
  const sourceCitation = {
    ...input.sourceCitation,
    citationText: REVIEWED_ETMV_REPORT_CITATION_TEXT_AFTER,
    title: REVIEWED_ETMV_REPORT_TITLE_AFTER,
    accessedAt: new Date(REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO),
  }
  const libraryAnalysisRecord = {
    ...input.libraryAnalysisRecord,
    title: REVIEWED_ETMV_REPORT_TITLE_AFTER,
    aiSummary,
    aiCard: {
      ...(input.libraryAnalysisRecord.aiCard as Record<string, unknown>),
      shortSummary,
    },
    contentHash: compositeAfterHash,
  }
  const result = {
    report,
    document,
    sourceCitation,
    fieldCitation: input.fieldCitation,
    libraryAnalysisRecord,
  }

  if (verifyPinnedHashes) {
    const computed = {
      Report: canonicalHash(report),
      Document: canonicalHash(document),
      SourceCitation: canonicalHash(sourceCitation),
      FieldCitation: canonicalHash(input.fieldCitation),
      LibraryAnalysisRecord: canonicalHash(libraryAnalysisRecord),
    }
    const expected = {
      Report: pinnedHashes.Report.after,
      Document: pinnedHashes.Document.after,
      SourceCitation: pinnedHashes.SourceCitation.after,
      FieldCitation: pinnedHashes.FieldCitation.after,
      LibraryAnalysisRecord: pinnedHashes.LibraryAnalysisRecord.after,
    }
    if (canonicalHash(computed) !== canonicalHash(expected)) {
      throw new Error('Reviewed ETMV computed after full-row hashes drifted')
    }
  }
  return result
}

function seedTargetSha256() {
  const matches = reports.filter((row) => row.id === REVIEWED_ETMV_REPORT_ID)
  if (matches.length !== 1) {
    throw new Error(
      `Reviewed ETMV seed projection must contain exactly one target; actual=${matches.length}`,
    )
  }
  const target = matches[0]!
  if (target.title !== REVIEWED_ETMV_REPORT_TITLE_AFTER) {
    throw new Error('Reviewed ETMV seed projection is not at the approved title')
  }
  return canonicalHash(target)
}

function collectionIds(collections: ReviewedEtmvCollections) {
  return Object.fromEntries(
    collectionNames.map((name) => [
      name,
      collections[name]
        .map((row) => row.id)
        .sort(compareIds),
    ]),
  ) as Record<keyof ReviewedEtmvCollections, string[]>
}

function collectionCounts(collections: ReviewedEtmvCollections) {
  return Object.fromEntries(
    collectionNames.map((name) => [name, collections[name].length]),
  ) as Record<keyof ReviewedEtmvCollections, number>
}

function dependencySnapshot(collections: ReviewedEtmvCollections) {
  return canonicalizeReviewedEtmvJson({
    sourceCitations: collections.sourceCitations.filter(
      (row) => row.id !== REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
    ),
    fieldCitations: collections.fieldCitations,
    libraryAnalysisRecords: collections.libraryAnalysisRecords.filter(
      (row) => row.id !== REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
    ),
    evidenceAppraisals: collections.evidenceAppraisals,
    documentRefs: collections.documentRefs,
    insightDocumentRefs: collections.insightDocumentRefs,
    companyDocumentRefs: collections.companyDocumentRefs,
    actorDocumentRefs: collections.actorDocumentRefs,
    sourceDocBindings: collections.sourceDocBindings,
    thesisBindings: collections.thesisBindings,
    reportBindings: collections.reportBindings,
    insightCitationBindings: collections.insightCitationBindings,
    producerCitationBindings: collections.producerCitationBindings,
  })
}

function targetState(
  hash: string | null,
  pinned: { before: string; after: string },
) {
  if (hash === null) return 'missing' as const
  if (hash === pinned.before) return 'before' as const
  if (hash === pinned.after) return 'after' as const
  return 'drift' as const
}

function citationEvidenceMatches(row: ReviewedEtmvSourceCitationRow) {
  const expected =
    REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.preservedCitationEvidence
  return (
    row.sourceClass === expected.sourceClass &&
    row.citationReadiness === expected.citationReadiness &&
    row.verificationStatus === expected.verificationStatus &&
    row.url === expected.url &&
    row.archivedUrl === expected.archivedUrl &&
    row.verifiedAt?.toISOString() === expected.verifiedAt &&
    row.verifiedBy === expected.verifiedBy &&
    row.captureMethod === expected.captureMethod
  )
}

export function buildReviewedEtmvPlanFromCollections(
  collections: ReviewedEtmvCollections,
  databaseIdentity: ReviewedEtmvDatabaseIdentity,
  options: {
    pinnedHashes?: ReviewedEtmvPinnedHashes
    verifyProductionDerivation?: boolean
  } = {},
): ReviewedEtmvInspection {
  validateReviewedEtmvReportTitleRepairContract()
  const pinned = options.pinnedHashes ?? REVIEWED_ETMV_REPORT_FULL_ROW_HASHES
  const verifyProductionDerivation = options.verifyProductionDerivation ?? true
  const conflicts: ReviewedEtmvConflict[] = []

  const report = exactOne(
    collections.reports.filter((row) => row.id === REVIEWED_ETMV_REPORT_ID),
    `Report:${REVIEWED_ETMV_REPORT_ID}`,
    conflicts,
  )
  const document = exactOne(
    collections.documents.filter(
      (row) => row.id === REVIEWED_ETMV_REPORT_DOCUMENT_ID,
    ),
    `Document:${REVIEWED_ETMV_REPORT_DOCUMENT_ID}`,
    conflicts,
  )
  const sourceCitation = exactOne(
    collections.sourceCitations.filter(
      (row) => row.id === REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
    ),
    `SourceCitation:${REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID}`,
    conflicts,
  )
  const fieldCitation = exactOne(
    collections.fieldCitations.filter(
      (row) => row.id === REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
    ),
    `FieldCitation:${REVIEWED_ETMV_REPORT_FIELD_CITATION_ID}`,
    conflicts,
  )
  const libraryAnalysisRecord = exactOne(
    collections.libraryAnalysisRecords.filter(
      (row) => row.id === REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
    ),
    `LibraryAnalysisRecord:${REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID}`,
    conflicts,
  )

  if (report && report.documentId !== REVIEWED_ETMV_REPORT_DOCUMENT_ID) {
    conflicts.push({
      code: 'report_document_binding_drift',
      subject: report.id,
      detail: `Expected documentId=${REVIEWED_ETMV_REPORT_DOCUMENT_ID}; actual=${report.documentId ?? 'null'}`,
    })
  }
  if (
    fieldCitation &&
    (fieldCitation.citationId !== REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID ||
      fieldCitation.entityType !== 'Report' ||
      fieldCitation.entityId !== REVIEWED_ETMV_REPORT_ID ||
      fieldCitation.fieldPath !== 'sourceUrl')
  ) {
    conflicts.push({
      code: 'field_citation_binding_drift',
      subject: fieldCitation.id,
      detail: 'The approved Report.sourceUrl citation binding changed',
    })
  }
  if (
    libraryAnalysisRecord &&
    (libraryAnalysisRecord.sourceKind !== 'document' ||
      libraryAnalysisRecord.sourceKey !==
        `document:${REVIEWED_ETMV_REPORT_DOCUMENT_ID}` ||
      libraryAnalysisRecord.documentId !== REVIEWED_ETMV_REPORT_DOCUMENT_ID)
  ) {
    conflicts.push({
      code: 'library_analysis_binding_drift',
      subject: libraryAnalysisRecord.id,
      detail: 'The approved Document LibraryAnalysisRecord binding changed',
    })
  }
  if (sourceCitation && !citationEvidenceMatches(sourceCitation)) {
    conflicts.push({
      code: 'citation_evidence_drift',
      subject: sourceCitation.id,
      detail:
        'Source class, readiness, verification, URL, archive, or verification evidence changed',
    })
  }

  const reportBindingIds = collections.reportBindings.map((row) => row.id)
  if (
    collections.reportBindings.length !== 1 ||
    reportBindingIds[0] !== REVIEWED_ETMV_REPORT_ID ||
    collections.reportBindings[0]?.documentId !==
      REVIEWED_ETMV_REPORT_DOCUMENT_ID
  ) {
    conflicts.push({
      code: 'report_document_inventory_drift',
      subject: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
      detail: `Expected only ${REVIEWED_ETMV_REPORT_ID} to bind the Document; actual=${reportBindingIds.join(',') || 'none'}`,
    })
  }
  if (
    collections.sourceDocBindings.length !== 0 ||
    collections.thesisBindings.length !== 0
  ) {
    conflicts.push({
      code: 'cross_entity_document_binding',
      subject: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
      detail:
        'The ETMV Report Document unexpectedly binds a SourceDoc or Thesis',
    })
  }

  const targetHashes = {
    report: report ? canonicalHash(report) : null,
    document: document ? canonicalHash(document) : null,
    sourceCitation: sourceCitation ? canonicalHash(sourceCitation) : null,
    fieldCitation: fieldCitation ? canonicalHash(fieldCitation) : null,
    libraryAnalysisRecord: libraryAnalysisRecord
      ? canonicalHash(libraryAnalysisRecord)
      : null,
  }
  const targetStates = {
    report: targetState(targetHashes.report, pinned.Report),
    document: targetState(targetHashes.document, pinned.Document),
    sourceCitation: targetState(
      targetHashes.sourceCitation,
      pinned.SourceCitation,
    ),
    libraryAnalysisRecord: targetState(
      targetHashes.libraryAnalysisRecord,
      pinned.LibraryAnalysisRecord,
    ),
  }
  if (
    targetHashes.fieldCitation !== null &&
    targetHashes.fieldCitation !== pinned.FieldCitation.before
  ) {
    conflicts.push({
      code: 'field_citation_full_row_drift',
      subject: REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
      detail: 'The immutable FieldCitation full row changed',
    })
  }
  for (const [subject, state] of Object.entries(targetStates)) {
    if (state === 'drift') {
      conflicts.push({
        code: 'target_full_row_drift',
        subject,
        detail: 'The full row is neither the pinned before nor after snapshot',
      })
    }
  }

  if (report && document && sourceCitation && libraryAnalysisRecord) {
    const nonTarget = reviewedEtmvNonTargetHashes({
      report,
      document,
      sourceCitation,
      libraryAnalysisRecord,
    })
    const expectedNonTarget = {
      Report: pinned.Report.nonTarget,
      Document: pinned.Document.nonTarget,
      SourceCitation: pinned.SourceCitation.nonTarget,
      LibraryAnalysisRecord: pinned.LibraryAnalysisRecord.nonTarget,
    }
    if (canonicalHash(nonTarget) !== canonicalHash(expectedNonTarget)) {
      conflicts.push({
        code: 'protected_field_drift',
        subject: 'Batch',
        detail:
          'At least one non-target Report, Document, SourceCitation, LAR, or aiCard field changed',
      })
    }
  }

  const stateValues = Object.values(targetStates)
  const beforeCount = stateValues.filter((state) => state === 'before').length
  const afterCount = stateValues.filter((state) => state === 'after').length
  let atomicState: ReviewedEtmvAtomicState = 'conflict'
  if (conflicts.length === 0 && beforeCount === 4) atomicState = 'all_before'
  else if (conflicts.length === 0 && afterCount === 4) atomicState = 'all_after'
  else if (
    conflicts.length === 0 &&
    beforeCount > 0 &&
    afterCount > 0 &&
    beforeCount + afterCount === 4
  ) {
    atomicState = 'hybrid'
    conflicts.push({
      code: 'hybrid_partial_state',
      subject: 'Batch',
      detail: `Found ${beforeCount} before and ${afterCount} after target rows`,
    })
  }

  if (
    verifyProductionDerivation &&
    atomicState === 'all_before' &&
    report &&
    document &&
    sourceCitation &&
    fieldCitation &&
    libraryAnalysisRecord
  ) {
    materializeReviewedEtmvAfterRows({
      report,
      document,
      sourceCitation,
      fieldCitation,
      libraryAnalysisRecord,
    })
  }

  const dependency = dependencySnapshot(collections)
  const preservedTarget =
    report && document && sourceCitation && libraryAnalysisRecord
      ? reviewedEtmvNonTargetHashes({
          report,
          document,
          sourceCitation,
          libraryAnalysisRecord,
        })
      : null
  const dependencyCounts = collectionCounts(collections)
  const dependencyIds = collectionIds(collections)
  const plan: ReviewedEtmvPlan = {
    version: REVIEWED_ETMV_REPORT_TITLE_REPAIR_VERSION,
    contractSha256:
      PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256,
    seedTargetSha256: seedTargetSha256(),
    databaseIdentity,
    atomicState,
    targetStateSha256: canonicalHash(targetHashes),
    dependencySha256: canonicalHash(dependency),
    preservedStateSha256: canonicalHash({
      dependency,
      preservedTarget,
      fieldCitation: fieldCitation ?? null,
    }),
    dependencyScope: REVIEWED_ETMV_REPORT_TITLE_REPAIR_DEPENDENCY_SCOPE,
    dependencyCounts,
    dependencyIds,
    targetHashes,
    conflicts,
    summary: {
      targets: 4,
      pendingTargets: atomicState === 'all_before' ? 4 : 0,
      appliedTargets: atomicState === 'all_after' ? 4 : 0,
      conflicts: conflicts.length,
    },
    boundary: REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT.boundary,
  }
  return { plan, collections }
}

export function reviewedEtmvPlanSha256(inspection: ReviewedEtmvInspection) {
  return canonicalHash(inspection.plan)
}

export function assertReviewedEtmvPlanReady(
  inspection: ReviewedEtmvInspection,
) {
  if (
    inspection.plan.conflicts.length > 0 ||
    (inspection.plan.atomicState !== 'all_before' &&
      inspection.plan.atomicState !== 'all_after')
  ) {
    const detail = inspection.plan.conflicts
      .map((conflict) => `${conflict.code}:${conflict.subject}`)
      .join(',')
    throw new Error(
      `Reviewed ETMV title repair is not ready: ${detail || inspection.plan.atomicState}`,
    )
  }
  return {
    pendingTargets: inspection.plan.summary.pendingTargets,
    appliedTargets: inspection.plan.summary.appliedTargets,
  }
}

export function assertReviewedEtmvPostApply(
  before: ReviewedEtmvInspection,
  after: ReviewedEtmvInspection,
  pinnedHashes: ReviewedEtmvPinnedHashes =
    REVIEWED_ETMV_REPORT_FULL_ROW_HASHES,
) {
  assertReviewedEtmvPlanReady(before)
  assertReviewedEtmvPlanReady(after)
  if (
    after.plan.atomicState !== 'all_after' ||
    before.plan.databaseIdentity.identityUuid !==
      after.plan.databaseIdentity.identityUuid ||
    before.plan.databaseIdentity.createdAt !==
      after.plan.databaseIdentity.createdAt ||
    before.plan.dependencySha256 !== after.plan.dependencySha256 ||
    before.plan.preservedStateSha256 !== after.plan.preservedStateSha256 ||
    after.plan.targetHashes.report !==
      pinnedHashes.Report.after ||
    after.plan.targetHashes.document !==
      pinnedHashes.Document.after ||
    after.plan.targetHashes.sourceCitation !==
      pinnedHashes.SourceCitation.after ||
    after.plan.targetHashes.fieldCitation !==
      pinnedHashes.FieldCitation.after ||
    after.plan.targetHashes.libraryAnalysisRecord !==
      pinnedHashes.LibraryAnalysisRecord.after
  ) {
    throw new Error(
      'Reviewed ETMV post-apply all-after, identity, dependency, preservation, or full-row proof failed; transaction must roll back',
    )
  }
  return { pendingTargets: 0, appliedTargets: 4 }
}

export function parseReviewedEtmvArgs(
  argv: readonly string[],
): ReviewedEtmvArgs {
  let apply = false
  let ack: string | undefined
  let expectedPlanSha256: string | undefined
  for (const argument of argv) {
    if (argument === '--apply') {
      if (apply) throw new Error('--apply must not be repeated')
      apply = true
    } else if (argument.startsWith('--ack=')) {
      if (ack !== undefined) throw new Error('--ack must not be repeated')
      ack = argument.slice('--ack='.length)
    } else if (argument.startsWith('--plan-sha256=')) {
      if (expectedPlanSha256 !== undefined) {
        throw new Error('--plan-sha256 must not be repeated')
      }
      expectedPlanSha256 = argument.slice('--plan-sha256='.length)
    } else {
      throw new Error(`Unknown reviewed ETMV title repair argument: ${argument}`)
    }
  }
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error('--ack and --plan-sha256 are valid only with --apply')
  }
  return { apply, ack, expectedPlanSha256 }
}

export function assertReviewedEtmvApplyAuthorization(args: ReviewedEtmvArgs) {
  if (!args.apply) return
  if (args.ack !== REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK}`,
    )
  }
  if (!/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error(
      '--apply requires the exact --plan-sha256=<64 lowercase hex> from a reviewed dry run',
    )
  }
}

async function inspectReviewedEtmvDatabaseIdentity(
  client: ReviewedEtmvClient,
): Promise<ReviewedEtmvDatabaseIdentity> {
  const metadata = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `)
  if (
    metadata.length !== 1 ||
    !metadata[0]?.currentDatabase ||
    metadata[0]?.identityTable === null
  ) {
    throw new Error(
      'Reviewed ETMV title repair requires DatabaseIdentity metadata',
    )
  }
  const rows = await client.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    ORDER BY "key"
  `)
  if (
    rows.length !== 1 ||
    rows[0]?.key !== 'primary' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      rows[0]?.identityUuid ?? '',
    )
  ) {
    throw new Error(
      'Reviewed ETMV title repair requires exactly one valid primary DatabaseIdentity UUID',
    )
  }
  return {
    currentDatabase: metadata[0].currentDatabase,
    identityUuid: rows[0].identityUuid.toLowerCase(),
    createdAt: rows[0].createdAt.toISOString(),
  }
}

function sortRows<T extends { id: string }>(rows: T[]) {
  return rows.sort((left, right) => compareIds(left.id, right.id))
}

export async function inspectReviewedEtmvState(
  client: ReviewedEtmvClient,
): Promise<ReviewedEtmvInspection> {
  const [databaseIdentity, reportRows, documentRows] = await Promise.all([
    inspectReviewedEtmvDatabaseIdentity(client),
    client.report.findMany({
      where: { id: REVIEWED_ETMV_REPORT_ID },
      select: reportSelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: documentSelect,
      orderBy: { id: 'asc' },
    }),
  ])
  const sourceCitations = sortRows(
    await client.sourceCitation.findMany({
      where: {
        OR: [
          { id: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID },
          { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
        ],
      },
      select: sourceCitationSelect,
    }),
  )
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
          { entityType: 'Report', entityId: REVIEWED_ETMV_REPORT_ID },
          { citationId: { in: citationIds } },
        ],
      },
      select: fieldCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
          {
            sourceKind: 'report',
            sourceKey: `report:${REVIEWED_ETMV_REPORT_ID}`,
          },
        ],
      },
      select: libraryAnalysisRecordSelect,
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { reportId: REVIEWED_ETMV_REPORT_ID },
          { reviewBasisCitationId: { in: citationIds } },
        ],
      },
      select: evidenceAppraisalSelect,
      orderBy: { id: 'asc' },
    }),
    client.documentRef.findMany({
      where: {
        OR: [
          { fromId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
          { toId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
        ],
      },
      select: documentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: insightDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: companyDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: actorDocumentRefSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceDoc.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: sourceDocBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.thesis.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
      select: thesisBindingSelect,
      orderBy: { id: 'asc' },
    }),
    client.report.findMany({
      where: { documentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID },
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
  return buildReviewedEtmvPlanFromCollections(
    {
      reports: sortRows(reportRows),
      documents: sortRows(documentRows),
      sourceCitations,
      fieldCitations: sortRows(fieldCitations),
      libraryAnalysisRecords: sortRows(libraryAnalysisRecords),
      evidenceAppraisals: sortRows(evidenceAppraisals),
      documentRefs: sortRows(documentRefs),
      insightDocumentRefs: sortRows(insightDocumentRefs),
      companyDocumentRefs: sortRows(companyDocumentRefs),
      actorDocumentRefs: sortRows(actorDocumentRefs),
      sourceDocBindings: sortRows(sourceDocBindings),
      thesisBindings: sortRows(thesisBindings),
      reportBindings: sortRows(reportBindings),
      insightCitationBindings: sortRows(insightCitationBindings),
      producerCitationBindings: sortRows(producerCitationBindings),
    },
    databaseIdentity,
  )
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value }
}

export function fullReviewedEtmvReportWhere(
  row: ReviewedEtmvReportRow,
): Prisma.ReportWhereInput {
  return {
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle,
    author: row.author,
    institution: row.institution,
    date: row.date,
    year: row.year,
    sourceUrl: row.sourceUrl,
    reportCategory: row.reportCategory,
    country: row.country,
    keyFindings: { equals: row.keyFindings },
    recommendations: { equals: row.recommendations },
    relevance: row.relevance,
    tags: { equals: row.tags },
    doi: row.doi,
    isbn: row.isbn,
    issn: row.issn,
    publisher: row.publisher,
    provenanceType: row.provenanceType,
    supportingSources: nullableJsonWhere(row.supportingSources),
    accessedAt: row.accessedAt,
    documentId: row.documentId,
  } as Prisma.ReportWhereInput
}

export function fullReviewedEtmvDocumentWhere(
  row: ReviewedEtmvDocumentRow,
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

export function fullReviewedEtmvSourceCitationWhere(
  row: ReviewedEtmvSourceCitationRow,
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

export function fullReviewedEtmvLibraryAnalysisWhere(
  row: ReviewedEtmvLibraryAnalysisRow,
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

async function lockIds(
  transaction: Prisma.TransactionClient,
  table: string,
  ids: readonly string[],
  mode: 'UPDATE' | 'SHARE',
) {
  const uniqueIds = [...new Set(ids)].sort(compareIds)
  if (uniqueIds.length === 0) return
  const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id"
    FROM ${Prisma.raw(`"${table}"`)}
    WHERE "id" IN (${Prisma.join(uniqueIds)})
    ORDER BY "id"
    FOR ${Prisma.raw(mode)}
  `)
  if (
    canonicalHash(rows.map((row) => row.id).sort(compareIds)) !==
    canonicalHash(uniqueIds)
  ) {
    throw new Error(
      `Reviewed ETMV ${table} lock inventory changed; transaction must roll back`,
    )
  }
}

export async function lockReviewedEtmvScope(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedEtmvInspection,
) {
  await transaction.$executeRaw(Prisma.sql`
    LOCK TABLE
      "Report", "Document", "SourceCitation", "FieldCitation",
      "LibraryAnalysisRecord", "EvidenceAppraisal", "DocumentRef",
      "InsightDocumentRef", "CompanyDocumentRef", "ActorDocumentRef",
      "SourceDoc", "Thesis", "Insight", "Producer"
    IN SHARE ROW EXCLUSIVE MODE
  `)
  const identity = await transaction.$queryRaw<
    Array<{ identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    WHERE "key" = 'primary'
    FOR SHARE
  `)
  if (
    identity.length !== 1 ||
    identity[0]?.identityUuid.toLowerCase() !==
      inspection.plan.databaseIdentity.identityUuid ||
    identity[0]?.createdAt.toISOString() !==
      inspection.plan.databaseIdentity.createdAt
  ) {
    throw new Error(
      'Reviewed ETMV DatabaseIdentity changed after planning; transaction must roll back',
    )
  }
  const ids = inspection.plan.dependencyIds
  await lockIds(transaction, 'Report', ids.reports, 'UPDATE')
  await lockIds(transaction, 'Document', ids.documents, 'UPDATE')
  await lockIds(
    transaction,
    'SourceCitation',
    ids.sourceCitations,
    'UPDATE',
  )
  await lockIds(transaction, 'FieldCitation', ids.fieldCitations, 'SHARE')
  await lockIds(
    transaction,
    'LibraryAnalysisRecord',
    ids.libraryAnalysisRecords,
    'UPDATE',
  )
  await lockIds(
    transaction,
    'EvidenceAppraisal',
    ids.evidenceAppraisals,
    'SHARE',
  )
  await lockIds(transaction, 'DocumentRef', ids.documentRefs, 'SHARE')
  await lockIds(
    transaction,
    'InsightDocumentRef',
    ids.insightDocumentRefs,
    'SHARE',
  )
  await lockIds(
    transaction,
    'CompanyDocumentRef',
    ids.companyDocumentRefs,
    'SHARE',
  )
  await lockIds(
    transaction,
    'ActorDocumentRef',
    ids.actorDocumentRefs,
    'SHARE',
  )
  await lockIds(transaction, 'SourceDoc', ids.sourceDocBindings, 'SHARE')
  await lockIds(transaction, 'Thesis', ids.thesisBindings, 'SHARE')
  await lockIds(transaction, 'Insight', ids.insightCitationBindings, 'SHARE')
  await lockIds(
    transaction,
    'Producer',
    ids.producerCitationBindings,
    'SHARE',
  )
}

export async function applyReviewedEtmvUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedEtmvInspection,
) {
  assertReviewedEtmvPlanReady(inspection)
  if (inspection.plan.atomicState === 'all_after') {
    return { reports: 0, documents: 0, sourceCitations: 0, libraryAnalysisRecords: 0 }
  }
  const report = inspection.collections.reports.find(
    (row) => row.id === REVIEWED_ETMV_REPORT_ID,
  )
  const document = inspection.collections.documents.find(
    (row) => row.id === REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  )
  const sourceCitation = inspection.collections.sourceCitations.find(
    (row) => row.id === REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
  )
  const fieldCitation = inspection.collections.fieldCitations.find(
    (row) => row.id === REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
  )
  const libraryAnalysisRecord =
    inspection.collections.libraryAnalysisRecords.find(
      (row) => row.id === REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
    )
  if (
    !report ||
    !document ||
    !sourceCitation ||
    !fieldCitation ||
    !libraryAnalysisRecord
  ) {
    throw new Error(
      'Reviewed ETMV locked target inventory is incomplete; transaction must roll back',
    )
  }
  const after = materializeReviewedEtmvAfterRows({
    report,
    document,
    sourceCitation,
    fieldCitation,
    libraryAnalysisRecord,
  })

  const reportResult = await transaction.report.updateMany({
    where: fullReviewedEtmvReportWhere(report),
    data: { title: after.report.title },
  })
  if (reportResult.count !== 1) {
    throw new Error(
      'Concurrent full-row Report CAS conflict; transaction must roll back',
    )
  }
  const documentResult = await transaction.document.updateMany({
    where: fullReviewedEtmvDocumentWhere(document),
    data: {
      title: after.document.title,
      content: after.document.content,
      updatedAt: document.updatedAt,
    },
  })
  if (documentResult.count !== 1) {
    throw new Error(
      'Concurrent full-row Document CAS conflict; transaction must roll back',
    )
  }
  const citationResult = await transaction.sourceCitation.updateMany({
    where: fullReviewedEtmvSourceCitationWhere(sourceCitation),
    data: {
      citationText: after.sourceCitation.citationText,
      title: after.sourceCitation.title,
      accessedAt: after.sourceCitation.accessedAt,
      updatedAt: sourceCitation.updatedAt,
    },
  })
  if (citationResult.count !== 1) {
    throw new Error(
      'Concurrent full-row SourceCitation CAS conflict; transaction must roll back',
    )
  }
  const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
    where: fullReviewedEtmvLibraryAnalysisWhere(libraryAnalysisRecord),
    data: {
      title: after.libraryAnalysisRecord.title,
      aiSummary: after.libraryAnalysisRecord.aiSummary,
      aiCard: after.libraryAnalysisRecord.aiCard as Prisma.InputJsonValue,
      contentHash: after.libraryAnalysisRecord.contentHash,
      updatedAt: libraryAnalysisRecord.updatedAt,
    },
  })
  if (libraryResult.count !== 1) {
    throw new Error(
      'Concurrent full-row LibraryAnalysisRecord CAS conflict; transaction must roll back',
    )
  }
  return {
    reports: reportResult.count,
    documents: documentResult.count,
    sourceCitations: citationResult.count,
    libraryAnalysisRecords: libraryResult.count,
  }
}

function printReviewedEtmvPlan(
  inspection: ReviewedEtmvInspection,
  digest: string,
) {
  const plan = inspection.plan
  console.log('Reviewed ETMV Report semantic title repair')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Contract SHA-256: ${plan.contractSha256}`)
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`,
  )
  console.log(
    `Atomic state: ${plan.atomicState}; pending=${plan.summary.pendingTargets}; applied=${plan.summary.appliedTargets}; conflicts=${plan.summary.conflicts}`,
  )
  console.log(
    `Dependency SHA-256: ${plan.dependencySha256}; preserved state SHA-256: ${plan.preservedStateSha256}`,
  )
  console.log(`Dependency counts: ${JSON.stringify(plan.dependencyCounts)}`)
  if (plan.conflicts.length > 0) {
    console.log(`Conflicts: ${JSON.stringify(plan.conflicts)}`)
  }
}

export async function runReviewedEtmvTitleRepair(
  args: ReviewedEtmvArgs,
  prisma: PrismaClient,
) {
  assertReviewedEtmvApplyAuthorization(args)
  const initial = await inspectReviewedEtmvState(prisma)
  assertReviewedEtmvPlanReady(initial)
  const initialDigest = reviewedEtmvPlanSha256(initial)
  printReviewedEtmvPlan(initial, initialDigest)

  if (!args.apply) {
    console.log(
      `Dry run only. After review, re-run with --apply --ack=${REVIEWED_ETMV_REPORT_TITLE_REPAIR_APPLY_ACK} --plan-sha256=${initialDigest}`,
    )
    return { applied: false, inspection: initial, planSha256: initialDigest }
  }
  if (initialDigest !== args.expectedPlanSha256) {
    throw new Error(
      'Current reviewed ETMV title repair plan differs from --plan-sha256; rerun dry-run',
    )
  }

  const result = await prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(
          hashtext(${REVIEWED_ETMV_REPORT_TITLE_REPAIR_ADVISORY_LOCK_KEY})
        )
      `
      await lockReviewedEtmvScope(transaction, initial)
      const locked = await inspectReviewedEtmvState(transaction)
      assertReviewedEtmvPlanReady(locked)
      const lockedDigest = reviewedEtmvPlanSha256(locked)
      if (
        lockedDigest !== initialDigest ||
        lockedDigest !== args.expectedPlanSha256
      ) {
        throw new Error(
          'Locked reviewed ETMV plan changed; transaction must roll back',
        )
      }
      const mutations = await applyReviewedEtmvUpdates(transaction, locked)
      const after = await inspectReviewedEtmvState(transaction)
      assertReviewedEtmvPostApply(locked, after)
      return { mutations, after }
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      maxWait: 10_000,
      timeout: 60_000,
    },
  )
  const afterDigest = reviewedEtmvPlanSha256(result.after)
  printReviewedEtmvPlan(result.after, afterDigest)
  console.log(
    `Reviewed ETMV title repair committed: ${JSON.stringify(result.mutations)}`,
  )
  return {
    applied: true,
    inspection: result.after,
    planSha256: afterDigest,
    mutations: result.mutations,
  }
}

async function main() {
  const args = parseReviewedEtmvArgs(process.argv.slice(2))
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required')
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  })
  try {
    await runReviewedEtmvTitleRepair(args, prisma)
  } finally {
    await prisma.$disconnect()
  }
}

const invokedPath = process.argv[1]
if (invokedPath && import.meta.url === pathToFileURL(invokedPath).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
