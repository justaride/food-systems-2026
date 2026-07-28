import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import {
  AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS,
  AUTHORITATIVE_REPORT_IDENTITY_IDS,
  authoritativeDocumentAfterContent,
  authoritativeIdentityRepairPlanContract,
  buildAuthoritativeIdentityRepairPlan,
  buildReviewedAuthoritativeIdentityTargets,
  canonicalizeAuthoritativeIdentityJson,
  normalizeAuthoritativeDocumentDatabaseSnapshot,
  normalizeAuthoritativeReportDatabaseSnapshot,
  sha256AuthoritativeIdentityJson,
  type CanonicalJsonValue,
  type AuthoritativeDocumentDatabaseSnapshot,
  type AuthoritativeDocumentPlannedUpdate,
  type AuthoritativeReportDatabaseSnapshot,
  type AuthoritativeReportIdentityRepairPlan,
  type AuthoritativeReportIdentityId,
  type AuthoritativeReportPlannedUpdate,
} from '../src/lib/citations/authoritative-report-identity-repair'

const APPLY_ACK = 'APPLY_AUTHORITATIVE_REPORT_IDENTITIES'
const ADVISORY_LOCK_KEY = 'foodsystems:authoritative-report-identities:2026-07-19:v1'
const AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS = [
  'konkurrensverket-etablering-2026',
  'konkurrensverket-lonsamhet-2025',
] as const satisfies readonly AuthoritativeReportIdentityId[]
const AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_SOURCE_KEYS =
  AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS.map(reportId => `report:${reportId}`)

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

type RepairClient = Pick<
  PrismaClient,
  | 'report'
  | 'document'
  | 'libraryAnalysisRecord'
  | 'sourceCitation'
  | 'fieldCitation'
  | 'evidenceAppraisal'
>

type PreservedDependencyState = {
  libraryAnalysisRecords: unknown[]
  sourceCitations: unknown[]
  fieldCitations: unknown[]
  evidenceAppraisals: unknown[]
}

type InspectedState = {
  plan: AuthoritativeReportIdentityRepairPlan
  dependencies: PreservedDependencyState
  libraryAnalysisPlan: LibraryAnalysisRepairPlan
}

type CanonicalObject = { [key: string]: CanonicalJsonValue }

export type LibraryAnalysisPlannedUpdate = {
  reportId: string
  rowId: string
  before: CanonicalObject
  after: CanonicalObject
  beforeFullRowSha256: string
  afterFullRowSha256: string
}

export type LibraryAnalysisRepairPlan = {
  updates: LibraryAnalysisPlannedUpdate[]
  alreadyAppliedReportIds: string[]
  conflicts: Array<{ reportId: string; detail: string }>
}

const REPORT_ONLY_LIBRARY_ANALYSIS_BEFORE = {
  'konkurrensverket-etablering-2026': {
    title: 'Etablering av dagligvarubutiker',
    wordCount: 66,
    contentHash: 'be8a34e2a244ac1bd3e71be69e8963211683d97e809ddb7e864108cf98952ee1',
  },
  'konkurrensverket-lonsamhet-2025': {
    title: 'Lönsamhet i livsmedelskedjan',
    wordCount: 65,
    contentHash: '1d27c7d6b056ff6231e8c5259705e2005bfe67a444e812ee2c3994b982b2ed8e',
  },
} as const

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run'])
  for (const argument of argv) {
    if (
      !allowedFlags.has(argument) &&
      !argument.startsWith('--ack=') &&
      !argument.startsWith('--plan-sha256=')
    ) {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }
  const apply = argv.includes('--apply')
  if (apply && argv.includes('--dry-run')) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  return {
    apply,
    ack: argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find(argument => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

function exactIds(rows: Array<{ id: string }>, expected: string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

function dateTime(value: string | null) {
  return value ? new Date(value) : null
}

function assertNoEligibilityArtifacts(dependencies: PreservedDependencyState) {
  const counts = {
    sourceCitations: dependencies.sourceCitations.length,
    fieldCitations: dependencies.fieldCitations.length,
    evidenceAppraisals: dependencies.evidenceAppraisals.length,
  }
  if (Object.values(counts).some(count => count !== 0)) {
    throw new Error(
      `Authoritative identity repair requires zero citation/appraisal eligibility artifacts: ${JSON.stringify(counts)}`,
    )
  }
}

function canonicalObject(value: unknown, label: string): CanonicalObject {
  const canonical = canonicalizeAuthoritativeIdentityJson(value)
  if (!canonical || typeof canonical !== 'object' || Array.isArray(canonical)) {
    throw new Error(`${label} must be a canonical JSON object`)
  }
  return canonical
}

function jsonEquals(left: unknown, right: unknown) {
  return JSON.stringify(canonicalizeAuthoritativeIdentityJson(left)) ===
    JSON.stringify(canonicalizeAuthoritativeIdentityJson(right))
}

function libraryContentHash(summary: string | null, content: string) {
  return createHash('sha256')
    .update([summary, content].filter(Boolean).join('\n\n'))
    .digest('hex')
}

export function buildLibraryAnalysisRepairPlan(
  rows: unknown[],
  documentRows: readonly AuthoritativeDocumentDatabaseSnapshot[],
  documentTargets: ReturnType<typeof buildReviewedAuthoritativeIdentityTargets>['documentTargets'],
  reportTargets: ReturnType<typeof buildReviewedAuthoritativeIdentityTargets>['reportTargets'] = [],
): LibraryAnalysisRepairPlan {
  const updates: LibraryAnalysisPlannedUpdate[] = []
  const alreadyAppliedReportIds: string[] = []
  const conflicts: Array<{ reportId: string; detail: string }> = []
  const rowsByDocumentId = new Map<string, CanonicalObject[]>()
  for (const raw of rows) {
    const row = canonicalObject(raw, 'LibraryAnalysisRecord')
    const documentId = typeof row.documentId === 'string' ? row.documentId : ''
    rowsByDocumentId.set(documentId, [...(rowsByDocumentId.get(documentId) ?? []), row])
  }

  for (const target of documentTargets) {
    const document = documentRows.find(row => row.reportId === target.reportId)
    if (!document) {
      conflicts.push({ reportId: target.reportId, detail: 'Linked Document snapshot is missing.' })
      continue
    }
    const matching = rowsByDocumentId.get(document.id) ?? []
    if (matching.length !== 1) {
      conflicts.push({
        reportId: target.reportId,
        detail: `Expected exactly one LibraryAnalysisRecord; found ${matching.length}.`,
      })
      continue
    }
    const before = matching[0]!
    const rowId = typeof before.id === 'string' ? before.id : ''
    const afterContent = authoritativeDocumentAfterContent(target.reportId)
    const warning =
      'Identitetsmetadata er korrigert, men lagrede relevans-, funn- og anbefalingstekster er ikke kildeverifisert.'
    const implication =
      'Kun intern bakgrunn; ikke bruk lagrede påstander eksternt før claim-ankre og evidence appraisal er gjennomført.'
    const gap = {
      kind: 'citation_anchors_missing',
      detail: 'Stored relevance, key findings, and recommendations remain unverified.',
    }
    const riskFlags = ['unverified_report_claims']
    const aiSummary =
      `${target.after.title} har korrigert kildeidentitet, men lagrede påstander er ikke ` +
      `kildeverifisert. Kilden er blokkert for ekstern sitering.`
    const currentAiCard = canonicalObject(before.aiCard, `LibraryAnalysisRecord ${rowId} aiCard`)
    const after: CanonicalObject = {
      ...before,
      title: target.after.title,
      reviewStatus: 'queued',
      citationReadiness: 'blocked_unsourced',
      aiCard: {
        ...currentAiCard,
        shortSummary: aiSummary,
        citationStatus: 'blocked_unsourced',
        recommendedUsageRule: 'internal_background',
        keyFindings: [warning],
        projectImplication: implication,
        gaps: [gap],
        riskFlags,
      },
      aiSummary,
      keyFindings: [warning],
      projectImplications: [implication],
      gaps: [gap],
      riskFlags,
      contentHash: libraryContentHash(target.after.summary, afterContent),
      wordCount: target.after.wordCount,
    }
    const mutableFields = [
      'title', 'reviewStatus', 'citationReadiness', 'aiCard', 'aiSummary', 'keyFindings',
      'projectImplications', 'gaps', 'riskFlags', 'contentHash', 'wordCount',
    ]
    const isApplied = mutableFields.every(field => jsonEquals(before[field], after[field]))
    if (isApplied) {
      alreadyAppliedReportIds.push(target.reportId)
      continue
    }

    const expectedBeforeHash = libraryContentHash(document.summary, document.content)
    const expectedBeforeSummary =
      `${target.before.title} er triagert som document med ${target.before.wordCount} ord i lokalt grunnlag.`
    const guardedBefore =
      rowId.length > 0 &&
      before.sourceKind === 'document' &&
      before.sourceKey === `document:${document.id}` &&
      before.documentId === document.id &&
      before.title === target.before.title &&
      before.status === 'ai_draft' &&
      before.usageRule === 'internal_background' &&
      before.reviewStatus === 'not_required' &&
      before.citationReadiness === null &&
      before.contentHash === expectedBeforeHash &&
      before.wordCount === target.before.wordCount &&
      before.aiSummary === expectedBeforeSummary &&
      jsonEquals(before.riskFlags, []) &&
      jsonEquals(before.gaps, [])
    if (!guardedBefore) {
      conflicts.push({
        reportId: target.reportId,
        detail: 'LibraryAnalysisRecord matches neither the reviewed fail-closed before state nor the after state.',
      })
      continue
    }
    updates.push({
      reportId: target.reportId,
      rowId,
      before,
      after,
      beforeFullRowSha256: sha256AuthoritativeIdentityJson(before),
      afterFullRowSha256: sha256AuthoritativeIdentityJson(after),
    })
  }

  for (const reportId of reportTargets.length > 0
    ? AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS
    : []) {
    const target = reportTargets.find(candidate => candidate.id === reportId)
    const expectedBefore = REPORT_ONLY_LIBRARY_ANALYSIS_BEFORE[reportId]
    const matching = rows
      .map(raw => canonicalObject(raw, 'LibraryAnalysisRecord'))
      .filter(row => row.sourceKind === 'report' && row.sourceKey === `report:${reportId}`)
    if (!target || matching.length !== 1) {
      conflicts.push({
        reportId,
        detail: `Expected one reviewed Report-kind LibraryAnalysisRecord and target; found ${matching.length}.`,
      })
      continue
    }
    const before = matching[0]!
    const rowId = typeof before.id === 'string' ? before.id : ''
    const currentAiCard = canonicalObject(before.aiCard, `LibraryAnalysisRecord ${rowId} aiCard`)
    const warning =
      'Identitetsmetadata er korrigert, men lagrede relevans-, funn- og anbefalingstekster er ikke kildeverifisert.'
    const implication =
      'Kun intern bakgrunn; ikke bruk lagrede påstander eksternt før claim-ankre og evidence appraisal er gjennomført.'
    const gap = {
      kind: 'citation_anchors_missing',
      detail: 'Stored relevance, key findings, and recommendations remain unverified.',
    }
    const riskFlags = ['missing_file_path', 'low_text_quality', 'unverified_report_claims']
    const gaps = [
      { kind: 'needs_text_extraction', note: 'low_text_quality' },
      { kind: 'unclear_source', note: 'missing_file_path' },
      gap,
    ]
    const keyFindings = [
      'Triage flag: low_text_quality',
      'Triage flag: missing_file_path',
      warning,
    ]
    const aiSummary =
      `${target.after.title} har korrigert kildeidentitet, men lagrede påstander er ikke ` +
      `kildeverifisert. Kilden er blokkert for ekstern sitering.`
    const after: CanonicalObject = {
      ...before,
      title: target.after.title,
      reviewStatus: 'queued',
      citationReadiness: 'blocked_unsourced',
      aiCard: {
        ...currentAiCard,
        shortSummary: aiSummary,
        citationStatus: 'blocked_unsourced',
        recommendedUsageRule: 'internal_background',
        keyFindings,
        projectImplication: implication,
        gaps,
        riskFlags,
      },
      aiSummary,
      keyFindings,
      projectImplications: [implication],
      gaps,
      riskFlags,
    }
    const mutableFields = [
      'title', 'reviewStatus', 'citationReadiness', 'aiCard', 'aiSummary', 'keyFindings',
      'projectImplications', 'gaps', 'riskFlags',
    ]
    if (mutableFields.every(field => jsonEquals(before[field], after[field]))) {
      alreadyAppliedReportIds.push(reportId)
      continue
    }
    const expectedBeforeSummary =
      `${expectedBefore.title} er triagert som report med ${expectedBefore.wordCount} ord i lokalt grunnlag.`
    const guardedBefore =
      rowId.length > 0 &&
      before.sourceKind === 'report' &&
      before.sourceKey === `report:${reportId}` &&
      before.documentId === null &&
      before.sourceDocId === null &&
      before.canonicalPath === null &&
      before.title === expectedBefore.title &&
      before.status === 'review_required' &&
      before.usageRule === 'internal_background' &&
      before.reviewStatus === 'queued' &&
      before.citationReadiness === null &&
      before.contentHash === expectedBefore.contentHash &&
      before.wordCount === expectedBefore.wordCount &&
      before.aiSummary === expectedBeforeSummary &&
      currentAiCard.shortSummary === expectedBeforeSummary &&
      currentAiCard.citationStatus === 'not_citation_checked' &&
      jsonEquals(before.riskFlags, ['missing_file_path', 'low_text_quality']) &&
      jsonEquals(before.gaps, gaps.slice(0, 2))
    if (!guardedBefore) {
      conflicts.push({
        reportId,
        detail: 'Report-kind LibraryAnalysisRecord matches neither the reviewed before state nor fail-closed after state.',
      })
      continue
    }
    updates.push({
      reportId,
      rowId,
      before,
      after,
      beforeFullRowSha256: sha256AuthoritativeIdentityJson(before),
      afterFullRowSha256: sha256AuthoritativeIdentityJson(after),
    })
  }

  return { updates, alreadyAppliedReportIds, conflicts }
}

async function inspectDependencies(
  client: RepairClient,
  reportRows: readonly AuthoritativeReportDatabaseSnapshot[],
): Promise<PreservedDependencyState> {
  const documentIds = reportRows
    .map(row => row.documentId)
    .filter((id): id is string => typeof id === 'string')
  const sourceCitations = await client.sourceCitation.findMany({
    where: { documentId: { in: documentIds } },
    orderBy: { id: 'asc' },
  })
  const citationIds = sourceCitations.map(row => row.id)
  const [libraryAnalysisRecords, fieldCitations, evidenceAppraisals] = await Promise.all([
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { documentId: { in: documentIds } },
          {
            sourceKind: 'report',
            sourceKey: { in: AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_SOURCE_KEYS },
          },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.fieldCitation.findMany({
      where: {
        OR: [
          {
            entityType: 'Report',
            entityId: { in: [...AUTHORITATIVE_REPORT_IDENTITY_IDS] },
          },
          { citationId: { in: citationIds } },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: { reportId: { in: [...AUTHORITATIVE_REPORT_IDENTITY_IDS] } },
      orderBy: { id: 'asc' },
    }),
  ])
  return {
    libraryAnalysisRecords: canonicalizeAuthoritativeIdentityJson(libraryAnalysisRecords) as unknown[],
    sourceCitations: canonicalizeAuthoritativeIdentityJson(sourceCitations) as unknown[],
    fieldCitations: canonicalizeAuthoritativeIdentityJson(fieldCitations) as unknown[],
    evidenceAppraisals: canonicalizeAuthoritativeIdentityJson(evidenceAppraisals) as unknown[],
  }
}

async function inspectState(client: RepairClient): Promise<InspectedState> {
  const { reportTargets, documentTargets } = buildReviewedAuthoritativeIdentityTargets(reports)
  const reportRows = await client.report.findMany({
    where: { id: { in: [...AUTHORITATIVE_REPORT_IDENTITY_IDS] } },
    select: reportSelect,
    orderBy: { id: 'asc' },
  }) as AuthoritativeReportDatabaseSnapshot[]
  const documents = await client.document.findMany({
    where: {
      report: {
        is: { id: { in: [...AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS] } },
      },
    },
    select: documentSelect,
    orderBy: { id: 'asc' },
  })
  const reportIdByDocumentId = new Map(
    reportRows
      .filter(row => row.documentId)
      .map(row => [row.documentId!, row.id]),
  )
  const documentRows = documents.map(document => ({
    ...document,
    reportId: reportIdByDocumentId.get(document.id) ?? '',
  })) as AuthoritativeDocumentDatabaseSnapshot[]
  const dependencies = await inspectDependencies(client, reportRows)
  assertNoEligibilityArtifacts(dependencies)
  const expectedLibraryAnalysisRecords =
    AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS.length +
    AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS.length
  if (dependencies.libraryAnalysisRecords.length !== expectedLibraryAnalysisRecords) {
    throw new Error(
      `Expected ${expectedLibraryAnalysisRecords} reviewed LibraryAnalysisRecord rows; ` +
      `found ${dependencies.libraryAnalysisRecords.length}`,
    )
  }
  const preservedDependencyStateSha256 = sha256AuthoritativeIdentityJson({
    sourceCitations: dependencies.sourceCitations,
    fieldCitations: dependencies.fieldCitations,
    evidenceAppraisals: dependencies.evidenceAppraisals,
  })
  const plan = buildAuthoritativeIdentityRepairPlan(
    reportRows,
    documentRows,
    reportTargets,
    documentTargets,
    preservedDependencyStateSha256,
  )
  return {
    plan,
    dependencies,
    libraryAnalysisPlan: buildLibraryAnalysisRepairPlan(
      dependencies.libraryAnalysisRecords,
      documentRows,
      documentTargets,
      reportTargets,
    ),
  }
}

function executionPlanContract(inspected: InspectedState) {
  return {
    identity: authoritativeIdentityRepairPlanContract(inspected.plan),
    libraryAnalysis: inspected.libraryAnalysisPlan,
  }
}

function executionPlanSha256(inspected: InspectedState) {
  return sha256AuthoritativeIdentityJson(executionPlanContract(inspected))
}

function printPlan(inspected: InspectedState, digest: string) {
  const { plan, libraryAnalysisPlan } = inspected
  console.log('Authoritative Report/Document identity repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Target manifest SHA-256: ${plan.targetManifestSha256}`)
  console.log(`Preserved dependency SHA-256: ${plan.preservedDependencyStateSha256}`)
  console.log(
    `Reports: ${plan.summary.pendingReportUpdates} pending, ${plan.summary.alreadyAppliedReports} already applied; ` +
    `Documents: ${plan.summary.pendingDocumentUpdates} pending, ${plan.summary.alreadyAppliedDocuments} already applied; ` +
    `LibraryAnalysisRecords: ${libraryAnalysisPlan.updates.length} pending, ` +
    `${libraryAnalysisPlan.alreadyAppliedReportIds.length} already applied; ` +
    `conflicts: ${plan.summary.conflicts + libraryAnalysisPlan.conflicts.length}`,
  )
  console.log(JSON.stringify(executionPlanContract(inspected), null, 2))
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const reportIds = [...AUTHORITATIVE_REPORT_IDENTITY_IDS]
  const linkedReportIds = [...AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS]
  const lockedReports = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Report"
    WHERE "id" IN (${Prisma.join(reportIds)})
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(lockedReports, reportIds)) {
    throw new Error('Authoritative Report rows changed after planning; no rows updated')
  }

  const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT document."id" FROM "Document" document
    JOIN "Report" report ON report."documentId" = document."id"
    WHERE report."id" IN (${Prisma.join(linkedReportIds)})
    ORDER BY document."id" FOR UPDATE OF document
  `)
  if (lockedDocuments.length !== linkedReportIds.length) {
    throw new Error('Mirrored Document bindings changed after planning; no rows updated')
  }
  const documentIds = lockedDocuments.map(row => row.id)

  const lockedLibraryRows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "LibraryAnalysisRecord"
    WHERE "documentId" IN (${Prisma.join(documentIds)})
       OR ("sourceKind" = 'report' AND "sourceKey" IN (${Prisma.join(AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_SOURCE_KEYS)}))
    ORDER BY "id" FOR UPDATE
  `)
  const expectedLibraryRows =
    linkedReportIds.length + AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS.length
  if (lockedLibraryRows.length !== expectedLibraryRows) {
    throw new Error('Reviewed LibraryAnalysisRecord bindings changed after planning; no rows updated')
  }

  const lockedCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "documentId" IN (${Prisma.join(documentIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (lockedCitations.length !== 0) {
    throw new Error('Citation eligibility artifacts appeared after planning; no rows updated')
  }

  const lockedFieldCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE ("entityType" = 'Report' AND "entityId" IN (${Prisma.join(reportIds)}))
       OR "citationId" IN (
         SELECT "id" FROM "SourceCitation" WHERE "documentId" IN (${Prisma.join(documentIds)})
       )
    ORDER BY "id" FOR SHARE
  `)
  if (lockedFieldCitations.length !== 0) {
    throw new Error('FieldCitation eligibility artifacts appeared after planning; no rows updated')
  }

  const lockedAppraisals = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "EvidenceAppraisal"
    WHERE "reportId" IN (${Prisma.join(reportIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (lockedAppraisals.length !== 0) {
    throw new Error('EvidenceAppraisal eligibility artifacts appeared after planning; no rows updated')
  }
}

async function applyReportUpdate(
  transaction: Prisma.TransactionClient,
  update: AuthoritativeReportPlannedUpdate,
) {
  const current = await transaction.report.findUnique({ where: { id: update.id }, select: reportSelect })
  if (!current) throw new Error(`Concurrent Report deletion: ${update.id}`)
  const currentFullSha256 = sha256AuthoritativeIdentityJson(
    normalizeAuthoritativeReportDatabaseSnapshot(current as AuthoritativeReportDatabaseSnapshot),
  )
  if (currentFullSha256 !== update.beforeFullRowSha256) {
    throw new Error(`Concurrent full-row Report CAS conflict: ${update.id}`)
  }
  await transaction.report.update({
    where: { id: update.id },
    data: {
      title: update.after.title,
      fullTitle: update.after.fullTitle,
      author: update.after.author,
      institution: update.after.institution,
      date: update.after.date,
      sourceUrl: update.after.sourceUrl,
      reportCategory: update.after.reportCategory,
      doi: update.after.doi,
      isbn: update.after.isbn,
      issn: update.after.issn,
      publisher: update.after.publisher,
      provenanceType: update.after.provenanceType,
      supportingSources: update.after.supportingSources as Prisma.InputJsonValue,
      accessedAt: dateTime(update.after.accessedAt),
    },
  })
}

async function applyDocumentUpdate(
  transaction: Prisma.TransactionClient,
  update: AuthoritativeDocumentPlannedUpdate,
) {
  const current = await transaction.document.findUnique({
    where: { id: update.beforeFull.id },
    select: documentSelect,
  })
  if (!current) throw new Error(`Concurrent Document deletion: ${update.beforeFull.id}`)
  const currentFullSha256 = sha256AuthoritativeIdentityJson(
    normalizeAuthoritativeDocumentDatabaseSnapshot({
      ...current,
      reportId: update.reportId,
    } as AuthoritativeDocumentDatabaseSnapshot),
  )
  if (currentFullSha256 !== update.beforeFullRowSha256) {
    throw new Error(`Concurrent full-row Document CAS conflict: ${update.beforeFull.id}`)
  }
  await transaction.document.update({
    where: { id: update.beforeFull.id },
    data: {
      title: update.after.title,
      author: update.after.author,
      documentType: update.after.documentType,
      content: authoritativeDocumentAfterContent(update.reportId),
      url: update.after.url,
      accessedAt: dateTime(update.after.accessedAt),
      wordCount: update.after.wordCount,
      metadata: update.after.metadata as Prisma.InputJsonValue,
      updatedAt: new Date(update.beforeFull.updatedAt),
    },
  })
}

function plannedString(value: CanonicalJsonValue, field: string): string {
  if (typeof value !== 'string') throw new Error(`Planned LibraryAnalysisRecord ${field} is not a string`)
  return value
}

function plannedStringArray(value: CanonicalJsonValue, field: string): string[] {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`Planned LibraryAnalysisRecord ${field} is not a string array`)
  }
  return [...value] as string[]
}

async function applyLibraryAnalysisUpdate(
  transaction: Prisma.TransactionClient,
  update: LibraryAnalysisPlannedUpdate,
) {
  const current = await transaction.libraryAnalysisRecord.findUnique({ where: { id: update.rowId } })
  if (!current) throw new Error(`Concurrent LibraryAnalysisRecord deletion: ${update.rowId}`)
  const currentSnapshot = canonicalObject(current, `LibraryAnalysisRecord ${update.rowId}`)
  if (sha256AuthoritativeIdentityJson(currentSnapshot) !== update.beforeFullRowSha256) {
    throw new Error(`Concurrent full-row LibraryAnalysisRecord CAS conflict: ${update.rowId}`)
  }
  await transaction.libraryAnalysisRecord.update({
    where: { id: update.rowId },
    data: {
      title: plannedString(update.after.title, 'title'),
      reviewStatus: plannedString(update.after.reviewStatus, 'reviewStatus'),
      citationReadiness: plannedString(update.after.citationReadiness, 'citationReadiness'),
      aiCard: update.after.aiCard as Prisma.InputJsonValue,
      aiSummary: plannedString(update.after.aiSummary, 'aiSummary'),
      keyFindings: plannedStringArray(update.after.keyFindings, 'keyFindings'),
      projectImplications: plannedStringArray(update.after.projectImplications, 'projectImplications'),
      gaps: update.after.gaps as Prisma.InputJsonValue,
      riskFlags: plannedStringArray(update.after.riskFlags, 'riskFlags'),
      contentHash: plannedString(update.after.contentHash, 'contentHash'),
      wordCount: Number(update.after.wordCount),
      updatedAt: new Date(plannedString(update.before.updatedAt, 'updatedAt')),
    },
  })
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning|CAS conflict/i.test(message)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error('--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run')
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const inspected = await inspectState(prisma)
    const digest = executionPlanSha256(inspected)
    printPlan(inspected, digest)
    if (inspected.plan.conflicts.length > 0 || inspected.libraryAnalysisPlan.conflicts.length > 0) {
      throw new Error('Authoritative Report/Document identity conflicts detected; refusing mutation')
    }
    if (!args.apply) {
      console.log(`Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`)
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current plan differs from --plan-sha256; rerun dry-run and review the new plan')
    }

    const applied = await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `
      await lockReviewedRows(transaction)
      const locked = await inspectState(transaction as unknown as RepairClient)
      const lockedDigest = executionPlanSha256(locked)
      if (
        locked.plan.conflicts.length > 0 || locked.libraryAnalysisPlan.conflicts.length > 0 ||
        lockedDigest !== args.expectedPlanSha256 ||
        locked.plan.preservedDependencyStateSha256 !== inspected.plan.preservedDependencyStateSha256
      ) {
        throw new Error('Concurrent Report, Document, or preserved dependency drift detected; no rows updated')
      }

      for (const update of locked.plan.reportUpdates) await applyReportUpdate(transaction, update)
      for (const update of locked.plan.documentUpdates) await applyDocumentUpdate(transaction, update)
      for (const update of locked.libraryAnalysisPlan.updates) {
        await applyLibraryAnalysisUpdate(transaction, update)
      }

      const after = await inspectState(transaction as unknown as RepairClient)
      if (
        after.plan.conflicts.length > 0 ||
        after.libraryAnalysisPlan.conflicts.length > 0 ||
        after.plan.reportUpdates.length > 0 ||
        after.plan.documentUpdates.length > 0 ||
        after.libraryAnalysisPlan.updates.length > 0 ||
        after.plan.alreadyAppliedReportIds.length !== AUTHORITATIVE_REPORT_IDENTITY_IDS.length ||
        after.plan.alreadyAppliedDocumentReportIds.length !== AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS.length ||
        after.libraryAnalysisPlan.alreadyAppliedReportIds.length !==
          AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS.length +
          AUTHORITATIVE_REPORT_ONLY_LIBRARY_ANALYSIS_REPORT_IDS.length ||
        after.plan.preservedDependencyStateSha256 !== locked.plan.preservedDependencyStateSha256
      ) {
        throw new Error('Post-apply identity or preserved dependency state failed verification; no rows updated')
      }
      return {
        reports: locked.plan.reportUpdates.length,
        documents: locked.plan.documentUpdates.length,
        libraryAnalysisRecords: locked.libraryAnalysisPlan.updates.length,
      }
    }, { isolationLevel: 'Serializable' })

    console.log(
      `Authoritative identity repair applied: ${applied.reports} Report row(s), ` +
      `${applied.documents} mirrored Document row(s), ` +
      `${applied.libraryAnalysisRecords} fail-closed LibraryAnalysisRecord row(s); ` +
      `zero citation/appraisal rows created`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Authoritative identity repair conflicted with a concurrent write; the Serializable transaction ` +
        `rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Authoritative identity repair failed')
    process.exitCode = 1
  })
}
