import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import { sources } from '../prisma/seed-data/sources'
import type { Report, SourceDoc } from '../src/lib/types'
import {
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST,
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
  REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT,
  REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT,
  REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
  REVIEWED_PROVENANCE_COMPLETION_VERSION,
  assertReviewedProvenanceCompletionStateIsAtomic,
  canonicalizeReviewedProvenanceCompletionJson as canonicalizeReviewedProvenanceJson,
  classifyReviewedProvenanceCompletionCurrent,
  sha256ReviewedProvenanceCompletionJson as sha256ReviewedProvenanceJson,
  validateReviewedProvenanceCompletionManifest,
  type ReviewedProvenanceCompletionCanonicalJsonValue as CanonicalJsonValue,
  type ReviewedProvenanceCompletionRowStatus as CompletionStatus,
} from '../src/lib/citations/reviewed-provenance-completion'

export const REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK =
  'APPLY_REVIEWED_PROVENANCE_COMPLETION_39'
export const REVIEWED_PROVENANCE_COMPLETION_ADVISORY_LOCK_KEY =
  'foodsystems:reviewed-provenance-completion:2026-07-20:v1'
export const REVIEWED_PROVENANCE_COMPLETION_RECEIPT_PREFIX =
  'REVIEWED_PROVENANCE_COMPLETION_RECEIPT'

type CompletionEntry =
  (typeof REVIEWED_PROVENANCE_COMPLETION_MANIFEST)[number]
type CompletionEntity = CompletionEntry['entity']

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

const sourceDocSelect = {
  id: true,
  filename: true,
  title: true,
  author: true,
  year: true,
  sourceType: true,
  description: true,
  relevance: true,
  url: true,
  isDuplicate: true,
  doi: true,
  publisher: true,
  provenanceType: true,
  accessedAt: true,
  archivedUrl: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect

export type CompletionReportRow = Prisma.ReportGetPayload<{
  select: typeof reportSelect
}>
export type CompletionSourceDocRow = Prisma.SourceDocGetPayload<{
  select: typeof sourceDocSelect
}>

type CompletionClient = Pick<
  Prisma.TransactionClient,
  | '$queryRaw'
  | 'report'
  | 'sourceDoc'
  | 'document'
  | 'documentRef'
  | 'sourceCitation'
  | 'fieldCitation'
  | 'libraryAnalysisRecord'
  | 'evidenceAppraisal'
  | 'sourceRef'
  | 'mediaEntry'
  | 'insightDocumentRef'
  | 'companyDocumentRef'
  | 'actorDocumentRef'
>

type SeedTarget = {
  entry: CompletionEntry
  portableIdentity: CanonicalJsonValue
  portableIdentitySha256: string
}

export type CompletionDatabaseIdentity = {
  currentDatabase: string
  releaseMetadataAvailable: boolean
  databaseIdentityUuid: string | null
}

export type CompletionPlanRow = {
  entity: CompletionEntity
  id: string
  targetType: string
  currentType: string | null
  status: CompletionStatus
  seedIdentitySha256: string
  databaseNonProvenanceSha256: string | null
  beforeFullRowSha256: string | null
  afterFullRowSha256: string | null
}

export type CompletionConflict = {
  entity: CompletionEntity | 'Batch'
  id: string
  reason: string
}

type DependencyInspection = {
  snapshot: CanonicalJsonValue
  sha256: string
  counts: Record<string, number>
}

export type ReviewedProvenanceCompletionInspection = {
  plan: {
    version: typeof REVIEWED_PROVENANCE_COMPLETION_VERSION
    databaseIdentity: CompletionDatabaseIdentity
    targetCounts: {
      reports: number
      sourceDocs: number
      total: number
    }
    manifestSha256: string
    seedIdentitySha256: string
    databaseNonProvenanceSha256: string
    databaseFullStateSha256: string
    dependencySha256: string
    dependencyCounts: Record<string, number>
    rows: CompletionPlanRow[]
    conflicts: CompletionConflict[]
    summary: {
      reports: { pending: number; applied: number; conflicts: number }
      sourceDocs: { pending: number; applied: number; conflicts: number }
      total: { pending: number; applied: number; conflicts: number }
    }
  }
  dependencySnapshot: CanonicalJsonValue
}

function isoDate(
  value: Date | string | null | undefined,
  field: string,
  id: string,
) {
  if (value == null) return null
  const parsed =
    value instanceof Date
      ? value
      : /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00.000Z`)
        : new Date(value)
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Reviewed provenance completion ${id} has invalid ${field}`)
  }
  return parsed.toISOString()
}

function reportSeedIdentity(row: Report) {
  return canonicalizeReviewedProvenanceJson({
    id: row.id,
    title: row.title,
    fullTitle: row.fullTitle ?? null,
    author: row.author ?? null,
    institution: row.institution ?? null,
    date: row.date ?? null,
    year: row.year ?? null,
    sourceUrl: row.sourceUrl ?? null,
    reportCategory: row.reportCategory,
    country: row.country ?? 'NO',
    keyFindings: row.keyFindings,
    recommendations: row.recommendations,
    relevance: row.relevance,
    tags: row.tags,
    doi: row.doi ?? null,
    isbn: row.isbn ?? null,
    issn: row.issn ?? null,
    publisher: row.publisher ?? null,
    supportingSources: row.supportingSources ?? null,
    accessedAt: isoDate(row.accessedAt, 'accessedAt', row.id),
  })
}

function sourceDocSeedIdentity(row: SourceDoc) {
  return canonicalizeReviewedProvenanceJson({
    id: row.id,
    filename: row.filename,
    title: row.title ?? null,
    author: row.author ?? null,
    year: row.year == null ? null : String(row.year),
    sourceType: row.type,
    description: row.description,
    relevance: row.relevance,
    url: row.url ?? null,
    isDuplicate: row.isDuplicate ?? false,
    doi: row.doi ?? null,
    publisher: row.publisher ?? null,
    accessedAt: isoDate(row.accessedAt, 'accessedAt', row.id),
    archivedUrl: row.archivedUrl ?? null,
  })
}

function normalizedReportRow(row: CompletionReportRow) {
  return canonicalizeReviewedProvenanceJson({
    ...row,
    accessedAt: isoDate(row.accessedAt, 'accessedAt', row.id),
  }) as { [key: string]: CanonicalJsonValue }
}

function normalizedSourceDocRow(row: CompletionSourceDocRow) {
  return canonicalizeReviewedProvenanceJson({
    ...row,
    accessedAt: isoDate(row.accessedAt, 'accessedAt', row.id),
  }) as { [key: string]: CanonicalJsonValue }
}

function portableDatabaseIdentity(normalized: {
  [key: string]: CanonicalJsonValue
}) {
  const {
    provenanceType: _provenanceType,
    documentId: _documentId,
    ...portable
  } = normalized
  return portable
}

function nonProvenanceDatabaseIdentity(normalized: {
  [key: string]: CanonicalJsonValue
}) {
  const { provenanceType: _provenanceType, ...identity } = normalized
  return identity
}

function validateManifestContract() {
  validateReviewedProvenanceCompletionManifest()
  const manifest = REVIEWED_PROVENANCE_COMPLETION_MANIFEST
  const reportsCount = manifest.filter(
    (entry) => entry.entity === 'Report',
  ).length
  const sourceDocsCount = manifest.filter(
    (entry) => entry.entity === 'SourceDoc',
  ).length
  const keys = manifest.map((entry) => `${entry.entity}:${entry.id}`)
  if (
    manifest.length !== REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT ||
    reportsCount !== REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT ||
    sourceDocsCount !==
      REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT ||
    new Set(keys).size !== manifest.length
  ) {
    throw new Error(
      'Reviewed provenance completion manifest must contain exactly 14 Report and 25 SourceDoc rows',
    )
  }
}

export function buildReviewedProvenanceCompletionSeedTargets(): SeedTarget[] {
  validateManifestContract()
  const reportById = new Map(reports.map((row) => [row.id, row]))
  const sourceDocById = new Map(sources.map((row) => [row.id, row]))

  return REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map((entry) => {
    const seed =
      entry.entity === 'Report'
        ? reportById.get(entry.id)
        : sourceDocById.get(entry.id)
    if (!seed) {
      throw new Error(
        `Reviewed provenance completion seed row is missing: ${entry.entity}:${entry.id}`,
      )
    }
    if (seed.provenanceType !== entry.targetType) {
      throw new Error(
        `Reviewed provenance completion seed target drifted: ${entry.entity}:${entry.id}`,
      )
    }
    const portableIdentity =
      entry.entity === 'Report'
        ? reportSeedIdentity(seed as Report)
        : sourceDocSeedIdentity(seed as SourceDoc)
    return {
      entry,
      portableIdentity,
      portableIdentitySha256:
        sha256ReviewedProvenanceJson(portableIdentity),
    }
  })
}

function idsFor(entity: CompletionEntity) {
  return REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
    (entry) => entry.entity === entity,
  ).map((entry) => entry.id)
}

function sortedUnique(values: readonly (string | null)[]) {
  return [
    ...new Set(
      values.filter((value): value is string => typeof value === 'string'),
    ),
  ].sort((left, right) =>
    left.localeCompare(right, undefined, { numeric: true }),
  )
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, '$queryRaw'>,
): Promise<CompletionDatabaseIdentity> {
  const databaseRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `)
  if (databaseRows.length !== 1 || !databaseRows[0]?.currentDatabase) {
    throw new Error('Could not pin current_database() for the completion plan')
  }
  if (databaseRows[0].identityTable == null) {
    return {
      currentDatabase: databaseRows[0].currentDatabase,
      releaseMetadataAvailable: false,
      databaseIdentityUuid: null,
    }
  }

  const identityRows = await client.$queryRaw<
    Array<{ identityUuid: string }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid"
    FROM "DatabaseIdentity"
    WHERE "key" = 'primary'
    ORDER BY "key"
  `)
  if (
    identityRows.length !== 1 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identityRows[0]?.identityUuid ?? '',
    )
  ) {
    throw new Error(
      'DatabaseIdentity exists but does not contain exactly one valid primary UUID',
    )
  }
  return {
    currentDatabase: databaseRows[0].currentDatabase,
    releaseMetadataAvailable: true,
    databaseIdentityUuid: identityRows[0].identityUuid.toLowerCase(),
  }
}

async function inspectDependencies(
  client: CompletionClient,
  identity: CompletionDatabaseIdentity,
  reportRows: readonly CompletionReportRow[],
  sourceDocRows: readonly CompletionSourceDocRow[],
): Promise<DependencyInspection> {
  const reportIds = idsFor('Report')
  const sourceDocIds = idsFor('SourceDoc')
  const reportSourceKeys = reportIds.map((id) => `report:${id}`)
  const documentIds = sortedUnique([
    ...reportRows.map((row) => row.documentId),
    ...sourceDocRows.map((row) => row.documentId),
  ])

  const [
    documents,
    documentRefs,
    sourceCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
    sourceRefs,
    mediaEntries,
    sourceDocInsightRows,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
  ] = await Promise.all([
    client.document.findMany({
      where: { id: { in: documentIds } },
      orderBy: { id: 'asc' },
    }),
    client.documentRef.findMany({
      where: {
        OR: [{ fromId: { in: documentIds } }, { toId: { in: documentIds } }],
      },
      orderBy: { id: 'asc' },
    }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { sourceDocId: { in: sourceDocIds } },
          { documentId: { in: documentIds } },
          {
            fieldCitations: {
              some: {
                OR: [
                  {
                    entityType: 'Report',
                    entityId: { in: reportIds },
                  },
                  {
                    entityType: 'SourceDoc',
                    entityId: { in: sourceDocIds },
                  },
                ],
              },
            },
          },
          {
            reviewBasisForAppraisals: {
              some: {
                OR: [
                  { reportId: { in: reportIds } },
                  { sourceDocId: { in: sourceDocIds } },
                ],
              },
            },
          },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { sourceDocId: { in: sourceDocIds } },
          { documentId: { in: documentIds } },
          { sourceKind: 'report', sourceKey: { in: reportSourceKeys } },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { reportId: { in: reportIds } },
          { sourceDocId: { in: sourceDocIds } },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.sourceRef.findMany({
      where: { sourceDocId: { in: sourceDocIds } },
      orderBy: { id: 'asc' },
    }),
    client.mediaEntry.findMany({
      where: { sourceDocId: { in: sourceDocIds } },
      orderBy: { id: 'asc' },
    }),
    client.sourceDoc.findMany({
      where: { id: { in: sourceDocIds } },
      select: {
        id: true,
        insights: {
          select: { id: true },
          orderBy: { id: 'asc' },
        },
      },
      orderBy: { id: 'asc' },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: 'asc' },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: 'asc' },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: 'asc' },
    }),
  ])
  const citationIds = sourceCitations.map((row) => row.id)
  const fieldCitations = await client.fieldCitation.findMany({
    where: {
      OR: [
        { entityType: 'Report', entityId: { in: reportIds } },
        { entityType: 'SourceDoc', entityId: { in: sourceDocIds } },
        { citationId: { in: citationIds } },
      ],
    },
    orderBy: { id: 'asc' },
  })

  const snapshot = canonicalizeReviewedProvenanceJson({
    databaseIdentity: identity,
    documents,
    documentRefs,
    sourceCitations,
    fieldCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
    sourceRefs,
    mediaEntries,
    sourceDocInsightLinks: sourceDocInsightRows.map((row) => ({
      sourceDocId: row.id,
      insightIds: row.insights.map((insight) => insight.id),
    })),
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
  })
  const counts = {
    databaseIdentity: identity.databaseIdentityUuid == null ? 0 : 1,
    documents: documents.length,
    documentRefs: documentRefs.length,
    sourceCitations: sourceCitations.length,
    fieldCitations: fieldCitations.length,
    libraryAnalysisRecords: libraryAnalysisRecords.length,
    evidenceAppraisals: evidenceAppraisals.length,
    sourceRefs: sourceRefs.length,
    mediaEntries: mediaEntries.length,
    sourceDocInsightLinks: sourceDocInsightRows.reduce(
      (total, row) => total + row.insights.length,
      0,
    ),
    insightDocumentRefs: insightDocumentRefs.length,
    companyDocumentRefs: companyDocumentRefs.length,
    actorDocumentRefs: actorDocumentRefs.length,
  }
  return {
    snapshot,
    sha256: sha256ReviewedProvenanceJson(snapshot),
    counts,
  }
}

function summaryForRows(rows: readonly CompletionPlanRow[]) {
  const forEntity = (entity: CompletionEntity) => {
    const selected = rows.filter((row) => row.entity === entity)
    return {
      pending: selected.filter((row) => row.status === 'pending').length,
      applied: selected.filter((row) => row.status === 'applied').length,
      conflicts: selected.filter((row) => row.status === 'conflict').length,
    }
  }
  const reportsSummary = forEntity('Report')
  const sourceDocsSummary = forEntity('SourceDoc')
  return {
    reports: reportsSummary,
    sourceDocs: sourceDocsSummary,
    total: {
      pending: reportsSummary.pending + sourceDocsSummary.pending,
      applied: reportsSummary.applied + sourceDocsSummary.applied,
      conflicts: reportsSummary.conflicts + sourceDocsSummary.conflicts,
    },
  }
}

export async function inspectReviewedProvenanceCompletionState(
  client: CompletionClient,
): Promise<ReviewedProvenanceCompletionInspection> {
  const seedTargets = buildReviewedProvenanceCompletionSeedTargets()
  const reportIds = idsFor('Report')
  const sourceDocIds = idsFor('SourceDoc')
  const [identity, reportRows, sourceDocRows] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.report.findMany({
      where: { id: { in: reportIds } },
      select: reportSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceDoc.findMany({
      where: { id: { in: sourceDocIds } },
      select: sourceDocSelect,
      orderBy: { id: 'asc' },
    }),
  ])
  const reportById = new Map(reportRows.map((row) => [row.id, row]))
  const sourceDocById = new Map(sourceDocRows.map((row) => [row.id, row]))
  const conflicts: CompletionConflict[] = []

  const rows = seedTargets.map((target): CompletionPlanRow => {
    const current =
      target.entry.entity === 'Report'
        ? reportById.get(target.entry.id)
        : sourceDocById.get(target.entry.id)
    if (!current) {
      conflicts.push({
        entity: target.entry.entity,
        id: target.entry.id,
        reason: 'missing_database_row',
      })
      return {
        entity: target.entry.entity,
        id: target.entry.id,
        targetType: target.entry.targetType,
        currentType: null,
        status: 'conflict',
        seedIdentitySha256: target.portableIdentitySha256,
        databaseNonProvenanceSha256: null,
        beforeFullRowSha256: null,
        afterFullRowSha256: null,
      }
    }

    const normalized =
      target.entry.entity === 'Report'
        ? normalizedReportRow(current as CompletionReportRow)
        : normalizedSourceDocRow(current as CompletionSourceDocRow)
    const portable = portableDatabaseIdentity(normalized)
    const nonProvenance = nonProvenanceDatabaseIdentity(normalized)
    const currentType = current.provenanceType
    let status: CompletionStatus =
      classifyReviewedProvenanceCompletionCurrent(target.entry, currentType)
    if (
      sha256ReviewedProvenanceJson(portable) !==
      target.portableIdentitySha256
    ) {
      status = 'conflict'
      conflicts.push({
        entity: target.entry.entity,
        id: target.entry.id,
        reason: 'seed_database_non_provenance_identity_drift',
      })
    } else if (status === 'conflict') {
      conflicts.push({
        entity: target.entry.entity,
        id: target.entry.id,
        reason: `unexpected_current_provenance:${String(currentType)}`,
      })
    }
    const after = { ...normalized, provenanceType: target.entry.targetType }
    return {
      entity: target.entry.entity,
      id: target.entry.id,
      targetType: target.entry.targetType,
      currentType,
      status,
      seedIdentitySha256: target.portableIdentitySha256,
      databaseNonProvenanceSha256:
        sha256ReviewedProvenanceJson(nonProvenance),
      beforeFullRowSha256: sha256ReviewedProvenanceJson(normalized),
      afterFullRowSha256: sha256ReviewedProvenanceJson(after),
    }
  })

  if (conflicts.length === 0) {
    try {
      assertReviewedProvenanceCompletionStateIsAtomic(
        rows.map((row) => row.status),
      )
    } catch (error) {
      conflicts.push({
        entity: 'Batch',
        id: REVIEWED_PROVENANCE_COMPLETION_VERSION,
        reason: error instanceof Error ? error.message : 'invalid_atomic_state',
      })
    }
  }

  const dependency = await inspectDependencies(
    client,
    identity,
    reportRows,
    sourceDocRows,
  )
  const databaseNonProvenanceState = rows.map((row) => ({
    entity: row.entity,
    id: row.id,
    sha256: row.databaseNonProvenanceSha256,
  }))
  const databaseFullState = rows.map((row) => ({
    entity: row.entity,
    id: row.id,
    sha256: row.beforeFullRowSha256,
  }))
  const summary = summaryForRows(rows)
  summary.total.conflicts = conflicts.length

  return {
    plan: {
      version: REVIEWED_PROVENANCE_COMPLETION_VERSION,
      databaseIdentity: identity,
      targetCounts: {
        reports: REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT,
        sourceDocs: REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT,
        total: REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
      },
      manifestSha256: REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
      seedIdentitySha256: sha256ReviewedProvenanceJson(
        seedTargets.map((target) => ({
          entity: target.entry.entity,
          id: target.entry.id,
          targetType: target.entry.targetType,
          portableIdentity: target.portableIdentity,
        })),
      ),
      databaseNonProvenanceSha256: sha256ReviewedProvenanceJson(
        databaseNonProvenanceState,
      ),
      databaseFullStateSha256:
        sha256ReviewedProvenanceJson(databaseFullState),
      dependencySha256: dependency.sha256,
      dependencyCounts: dependency.counts,
      rows,
      conflicts,
      summary,
    },
    dependencySnapshot: dependency.snapshot,
  }
}

export function reviewedProvenanceCompletionPlanContract(
  inspection: ReviewedProvenanceCompletionInspection,
) {
  return inspection.plan
}

export function reviewedProvenanceCompletionPlanSha256(
  inspection: ReviewedProvenanceCompletionInspection,
) {
  return sha256ReviewedProvenanceJson(
    reviewedProvenanceCompletionPlanContract(inspection),
  )
}

function exactIds(rows: readonly { id: string }[], expected: readonly string[]) {
  const actual = rows
    .map((row) => row.id)
    .sort((left, right) => left.localeCompare(right))
  const sortedExpected = [...expected].sort((left, right) =>
    left.localeCompare(right),
  )
  return (
    actual.length === sortedExpected.length &&
    actual.every((id, index) => id === sortedExpected[index])
  )
}

async function lockTargetRows(transaction: Prisma.TransactionClient) {
  const reportIds = idsFor('Report')
  const sourceDocIds = idsFor('SourceDoc')
  const lockedReports = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
      ORDER BY "id" FOR UPDATE
    `,
  )
  const lockedSourceDocs = await transaction.$queryRaw<
    Array<{ id: string }>
  >(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "id" FOR UPDATE
  `)
  if (
    !exactIds(lockedReports, reportIds) ||
    !exactIds(lockedSourceDocs, sourceDocIds)
  ) {
    throw new Error(
      'Completion target rows changed after planning; no rows updated',
    )
  }
}

async function lockDependencyRows(
  transaction: Prisma.TransactionClient,
  identity: CompletionDatabaseIdentity,
) {
  const reportIds = idsFor('Report')
  const sourceDocIds = idsFor('SourceDoc')
  const reportSourceKeys = reportIds.map((id) => `report:${id}`)

  if (identity.releaseMetadataAvailable) {
    const lockedIdentity = await transaction.$queryRaw<
      Array<{ identityUuid: string }>
    >(Prisma.sql`
      SELECT "identityUuid"::text AS "identityUuid"
      FROM "DatabaseIdentity"
      WHERE "key" = 'primary'
      FOR SHARE
    `)
    if (
      lockedIdentity.length !== 1 ||
      lockedIdentity[0]?.identityUuid.toLowerCase() !==
        identity.databaseIdentityUuid
    ) {
      throw new Error('Database identity changed after planning')
    }
  }

  const documentRows = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "documentId" AS "id" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)}) AND "documentId" IS NOT NULL
      UNION
      SELECT "documentId" AS "id" FROM "SourceDoc"
      WHERE "id" IN (${Prisma.join(sourceDocIds)}) AND "documentId" IS NOT NULL
      ORDER BY "id"
    `,
  )
  const documentIds = documentRows.map((row) => row.id)
  if (documentIds.length > 0) {
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "Document"
      WHERE "id" IN (${Prisma.join(documentIds)}) ORDER BY "id" FOR SHARE
    `)
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "DocumentRef"
      WHERE "fromId" IN (${Prisma.join(documentIds)})
         OR "toId" IN (${Prisma.join(documentIds)})
      ORDER BY "id" FOR SHARE
    `)
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "InsightDocumentRef"
      WHERE "documentId" IN (${Prisma.join(documentIds)})
      ORDER BY "id" FOR SHARE
    `)
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "CompanyDocumentRef"
      WHERE "documentId" IN (${Prisma.join(documentIds)})
      ORDER BY "id" FOR SHARE
    `)
    await transaction.$queryRaw(Prisma.sql`
      SELECT "id" FROM "ActorDocumentRef"
      WHERE "documentId" IN (${Prisma.join(documentIds)})
      ORDER BY "id" FOR SHARE
    `)
  }

  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "sourceDocId" IN (${Prisma.join(sourceDocIds)})
       OR "documentId" IN (
         SELECT "documentId" FROM "Report"
         WHERE "id" IN (${Prisma.join(reportIds)}) AND "documentId" IS NOT NULL
         UNION
         SELECT "documentId" FROM "SourceDoc"
         WHERE "id" IN (${Prisma.join(sourceDocIds)}) AND "documentId" IS NOT NULL
       )
       OR "id" IN (
         SELECT "citationId" FROM "FieldCitation"
         WHERE ("entityType" = 'Report' AND "entityId" IN (${Prisma.join(reportIds)}))
            OR ("entityType" = 'SourceDoc' AND "entityId" IN (${Prisma.join(sourceDocIds)}))
       )
       OR "id" IN (
         SELECT "reviewBasisCitationId" FROM "EvidenceAppraisal"
         WHERE ("reportId" IN (${Prisma.join(reportIds)})
                OR "sourceDocId" IN (${Prisma.join(sourceDocIds)}))
           AND "reviewBasisCitationId" IS NOT NULL
       )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE ("entityType" = 'Report' AND "entityId" IN (${Prisma.join(reportIds)}))
       OR ("entityType" = 'SourceDoc' AND "entityId" IN (${Prisma.join(sourceDocIds)}))
       OR "citationId" IN (
         SELECT "id" FROM "SourceCitation"
         WHERE "sourceDocId" IN (${Prisma.join(sourceDocIds)})
            OR "documentId" IN (
              SELECT "documentId" FROM "Report"
              WHERE "id" IN (${Prisma.join(reportIds)}) AND "documentId" IS NOT NULL
              UNION
              SELECT "documentId" FROM "SourceDoc"
              WHERE "id" IN (${Prisma.join(sourceDocIds)}) AND "documentId" IS NOT NULL
            )
            OR "id" IN (
              SELECT "citationId" FROM "FieldCitation"
              WHERE ("entityType" = 'Report' AND "entityId" IN (${Prisma.join(reportIds)}))
                 OR ("entityType" = 'SourceDoc' AND "entityId" IN (${Prisma.join(sourceDocIds)}))
            )
            OR "id" IN (
              SELECT "reviewBasisCitationId" FROM "EvidenceAppraisal"
              WHERE ("reportId" IN (${Prisma.join(reportIds)})
                     OR "sourceDocId" IN (${Prisma.join(sourceDocIds)}))
                AND "reviewBasisCitationId" IS NOT NULL
            )
       )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "LibraryAnalysisRecord"
    WHERE "sourceDocId" IN (${Prisma.join(sourceDocIds)})
       OR "documentId" IN (
         SELECT "documentId" FROM "Report"
         WHERE "id" IN (${Prisma.join(reportIds)}) AND "documentId" IS NOT NULL
         UNION
         SELECT "documentId" FROM "SourceDoc"
         WHERE "id" IN (${Prisma.join(sourceDocIds)}) AND "documentId" IS NOT NULL
       )
       OR ("sourceKind" = 'report' AND "sourceKey" IN (${Prisma.join(reportSourceKeys)}))
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "EvidenceAppraisal"
    WHERE "reportId" IN (${Prisma.join(reportIds)})
       OR "sourceDocId" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "SourceRef"
    WHERE "sourceDocId" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "MediaEntry"
    WHERE "sourceDocId" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "A", "B" FROM "_InsightSourceDoc"
    WHERE "B" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "A", "B" FOR SHARE
  `)
}

async function applyPlannedRow(
  transaction: Prisma.TransactionClient,
  row: CompletionPlanRow,
) {
  if (row.status !== 'pending') return 0
  if (!row.beforeFullRowSha256 || !row.afterFullRowSha256) {
    throw new Error(
      `Completion row lacks full-row CAS hashes: ${row.entity}:${row.id}`,
    )
  }

  if (row.entity === 'Report') {
    const current = await transaction.report.findUnique({
      where: { id: row.id },
      select: reportSelect,
    })
    if (!current) throw new Error(`Concurrent Report deletion: ${row.id}`)
    if (
      sha256ReviewedProvenanceJson(normalizedReportRow(current)) !==
      row.beforeFullRowSha256
    ) {
      throw new Error(`Concurrent full-row Report CAS conflict: ${row.id}`)
    }
    const updated = await transaction.report.updateMany({
      where: { id: row.id, provenanceType: null },
      data: { provenanceType: row.targetType },
    })
    if (updated.count !== 1) {
      throw new Error(`Concurrent Report provenance CAS conflict: ${row.id}`)
    }
    return 1
  }

  const current = await transaction.sourceDoc.findUnique({
    where: { id: row.id },
    select: sourceDocSelect,
  })
  if (!current) throw new Error(`Concurrent SourceDoc deletion: ${row.id}`)
  if (
    sha256ReviewedProvenanceJson(normalizedSourceDocRow(current)) !==
    row.beforeFullRowSha256
  ) {
    throw new Error(`Concurrent full-row SourceDoc CAS conflict: ${row.id}`)
  }
  const updated = await transaction.sourceDoc.updateMany({
    where: { id: row.id, provenanceType: 'unknown' },
    data: { provenanceType: row.targetType },
  })
  if (updated.count !== 1) {
    throw new Error(`Concurrent SourceDoc provenance CAS conflict: ${row.id}`)
  }
  return 1
}

export function assertReviewedProvenanceCompletionReady(
  inspection: ReviewedProvenanceCompletionInspection,
) {
  const { plan } = inspection
  if (
    plan.rows.length !== REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT ||
    plan.rows.filter((row) => row.entity === 'Report').length !==
      REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT ||
    plan.rows.filter((row) => row.entity === 'SourceDoc').length !==
      REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT ||
    plan.conflicts.length > 0
  ) {
    throw new Error(
      `Completion conflicts detected; refusing mutation: ${plan.conflicts
        .map(
          (conflict) =>
            `${conflict.entity}:${conflict.id}:${conflict.reason}`,
        )
        .join(', ')}`,
    )
  }
  return assertReviewedProvenanceCompletionStateIsAtomic(
    plan.rows.map((row) => row.status),
  )
}

function printInspection(
  inspection: ReviewedProvenanceCompletionInspection,
  planSha256: string,
) {
  const { plan } = inspection
  console.log('Reviewed 39-row Report/SourceDoc provenance completion')
  console.log(`Plan SHA-256: ${planSha256}`)
  console.log(`Database: ${plan.databaseIdentity.currentDatabase}`)
  console.log(
    `Database identity UUID: ${plan.databaseIdentity.databaseIdentityUuid ?? 'unavailable'}`,
  )
  console.log(`Manifest SHA-256: ${plan.manifestSha256}`)
  console.log(`Seed identity SHA-256: ${plan.seedIdentitySha256}`)
  console.log(
    `Database non-provenance SHA-256: ${plan.databaseNonProvenanceSha256}`,
  )
  console.log(`Database full-state SHA-256: ${plan.databaseFullStateSha256}`)
  console.log(`Dependency SHA-256: ${plan.dependencySha256}`)
  console.log(
    JSON.stringify(reviewedProvenanceCompletionPlanContract(inspection), null, 2),
  )
}

export type ReviewedProvenanceCompletionArgs = {
  apply: boolean
  ack?: string
  expectedPlanSha256?: string
}

export function parseReviewedProvenanceCompletionArgs(
  args: readonly string[],
): ReviewedProvenanceCompletionArgs {
  const isAllowed = (argument: string) =>
    argument === '--apply' ||
    argument.startsWith('--ack=') ||
    argument.startsWith('--plan-sha256=')
  const unknown = args.find((argument) => !isAllowed(argument))
  if (unknown) throw new Error(`Unknown completion argument: ${unknown}`)
  const ackArgs = args.filter((argument) => argument.startsWith('--ack='))
  const planArgs = args.filter((argument) =>
    argument.startsWith('--plan-sha256='),
  )
  if (
    args.filter((argument) => argument === '--apply').length > 1 ||
    ackArgs.length > 1 ||
    planArgs.length > 1
  ) {
    throw new Error('Completion arguments must not be repeated')
  }
  const parsed = {
    apply: args.includes('--apply'),
    ack: ackArgs[0]?.slice('--ack='.length),
    expectedPlanSha256: planArgs[0]?.slice('--plan-sha256='.length),
  }
  if (!parsed.apply && (ackArgs.length > 0 || planArgs.length > 0)) {
    throw new Error('--ack and --plan-sha256 are valid only with --apply')
  }
  return parsed
}

function machineReceipt(payload: Record<string, unknown>) {
  console.log(
    `${REVIEWED_PROVENANCE_COMPLETION_RECEIPT_PREFIX} ${JSON.stringify(payload)}`,
  )
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serializ|deadlock|concurrent|changed after planning|CAS conflict/i.test(
    message,
  )
}

export async function main() {
  const args = parseReviewedProvenanceCompletionArgs(process.argv.slice(2))
  if (args.apply && args.ack !== REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK}`,
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
    const inspected = await inspectReviewedProvenanceCompletionState(
      prisma as unknown as CompletionClient,
    )
    const planSha256 = reviewedProvenanceCompletionPlanSha256(inspected)
    printInspection(inspected, planSha256)
    assertReviewedProvenanceCompletionReady(inspected)

    if (!args.apply) {
      console.log(
        `Dry run only. Re-run with --apply --ack=${REVIEWED_PROVENANCE_COMPLETION_APPLY_ACK} --plan-sha256=${planSha256}`,
      )
      machineReceipt({
        mode: 'dry-run',
        version: REVIEWED_PROVENANCE_COMPLETION_VERSION,
        planSha256,
        databaseIdentity: inspected.plan.databaseIdentity,
        targetCounts: inspected.plan.targetCounts,
        manifestSha256: inspected.plan.manifestSha256,
        seedIdentitySha256: inspected.plan.seedIdentitySha256,
        databaseNonProvenanceSha256:
          inspected.plan.databaseNonProvenanceSha256,
        databaseFullStateSha256: inspected.plan.databaseFullStateSha256,
        dependencySha256: inspected.plan.dependencySha256,
        dependencyCounts: inspected.plan.dependencyCounts,
        pending: inspected.plan.summary.total.pending,
        applied: inspected.plan.summary.total.applied,
      })
      return
    }
    if (
      !inspected.plan.databaseIdentity.releaseMetadataAvailable ||
      inspected.plan.databaseIdentity.databaseIdentityUuid == null
    ) {
      throw new Error(
        '--apply requires an available, pinned primary DatabaseIdentity UUID; no rows updated',
      )
    }
    if (planSha256 !== args.expectedPlanSha256) {
      throw new Error(
        'Current plan differs from --plan-sha256; rerun dry-run and review the new plan',
      )
    }

    const result = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_PROVENANCE_COMPLETION_ADVISORY_LOCK_KEY}))
        `
        await lockTargetRows(transaction)
        await lockDependencyRows(transaction, inspected.plan.databaseIdentity)

        const locked = await inspectReviewedProvenanceCompletionState(
          transaction as unknown as CompletionClient,
        )
        assertReviewedProvenanceCompletionReady(locked)
        if (
          reviewedProvenanceCompletionPlanSha256(locked) !==
          args.expectedPlanSha256
        ) {
          throw new Error(
            'Concurrent target, identity, or dependency drift changed the completion plan; no rows updated',
          )
        }

        let updatedRows = 0
        for (const row of locked.plan.rows) {
          updatedRows += await applyPlannedRow(transaction, row)
        }

        const after = await inspectReviewedProvenanceCompletionState(
          transaction as unknown as CompletionClient,
        )
        const afterAtomic = assertReviewedProvenanceCompletionReady(after)
        if (
          afterAtomic.pending !== 0 ||
          afterAtomic.applied !== REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT ||
          after.plan.seedIdentitySha256 !== locked.plan.seedIdentitySha256 ||
          after.plan.databaseNonProvenanceSha256 !==
            locked.plan.databaseNonProvenanceSha256 ||
          after.plan.dependencySha256 !== locked.plan.dependencySha256 ||
          sha256ReviewedProvenanceJson(after.plan.databaseIdentity) !==
            sha256ReviewedProvenanceJson(locked.plan.databaseIdentity)
        ) {
          throw new Error(
            'Completion post-apply idempotence, non-provenance, identity, or dependency verification failed; no rows updated',
          )
        }
        const expectedAfterByKey = new Map(
          locked.plan.rows.map((row) => [
            `${row.entity}:${row.id}`,
            row.afterFullRowSha256,
          ]),
        )
        if (
          after.plan.rows.some(
            (row) =>
              row.beforeFullRowSha256 !==
              expectedAfterByKey.get(`${row.entity}:${row.id}`),
          )
        ) {
          throw new Error(
            'Completion post-apply full-row hash verification failed; no rows updated',
          )
        }
        return {
          updatedRows,
          beforeFullStateSha256: locked.plan.databaseFullStateSha256,
          afterFullStateSha256: after.plan.databaseFullStateSha256,
          databaseNonProvenanceSha256:
            after.plan.databaseNonProvenanceSha256,
          dependencySha256: after.plan.dependencySha256,
        }
      },
      { isolationLevel: 'Serializable' },
    )

    machineReceipt({
      mode: 'apply',
      version: REVIEWED_PROVENANCE_COMPLETION_VERSION,
      planSha256,
      databaseIdentity: inspected.plan.databaseIdentity,
      targetCounts: inspected.plan.targetCounts,
      manifestSha256: inspected.plan.manifestSha256,
      seedIdentitySha256: inspected.plan.seedIdentitySha256,
      databaseNonProvenanceSha256: result.databaseNonProvenanceSha256,
      beforeFullStateSha256: result.beforeFullStateSha256,
      afterFullStateSha256: result.afterFullStateSha256,
      dependencySha256: result.dependencySha256,
      updatedRows: result.updatedRows,
      idempotentAppliedRows: REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
    })
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Completion apply conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
        : 'Reviewed provenance completion failed',
    )
    process.exitCode = 1
  })
}
