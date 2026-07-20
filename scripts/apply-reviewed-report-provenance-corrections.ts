import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import type { Report } from '../src/lib/types'
import {
  canonicalizeReviewedProvenanceJson,
  sha256ReviewedProvenanceJson,
  type CanonicalJsonValue,
} from '../src/lib/citations/reviewed-provenance-batch'
import {
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION,
  validateReviewedReportProvenanceCorrectionManifest,
} from '../src/lib/citations/reviewed-report-provenance-corrections'

export const REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK =
  'APPLY_REVIEWED_REPORT_PROVENANCE_CORRECTIONS_7'
export const REVIEWED_REPORT_PROVENANCE_CORRECTION_ADVISORY_LOCK_KEY =
  'foodsystems:reviewed-report-provenance-corrections:2026-07-20:v1'
export const REVIEWED_REPORT_PROVENANCE_CORRECTION_RECEIPT_PREFIX =
  'REVIEWED_REPORT_PROVENANCE_CORRECTION_RECEIPT'

export const REVIEWED_REPORT_PROVENANCE_CORRECTION_DEPENDENCY_SCOPE =
  Object.freeze([
    'DatabaseIdentity primary row',
    'Documents directly bound by target Report.documentId',
    'DocumentRefs whose fromId or toId is a target Document',
    'SourceCitations bound to a target Document, cited by a target Report FieldCitation, or used as a target Report appraisal review basis',
    'FieldCitations targeting a target Report or referencing an enumerated SourceCitation',
    'LibraryAnalysisRecords bound to a target Document or keyed as report:<target-id>',
    'EvidenceAppraisals directly bound to a target Report',
    'Boundary: no transitive or reverse consumers beyond the enumerated groups are claimed or locked',
  ]) as readonly string[]

type CorrectionEntry =
  (typeof REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST)[number]
export type ReviewedReportProvenanceCorrectionStatus =
  | 'pending'
  | 'applied'
  | 'conflict'

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

export type ReviewedReportProvenanceCorrectionDatabaseRow =
  Prisma.ReportGetPayload<{ select: typeof reportSelect }>

export type ReviewedReportProvenanceCorrectionClient = Pick<
  Prisma.TransactionClient,
  | '$queryRaw'
  | 'report'
  | 'document'
  | 'documentRef'
  | 'sourceCitation'
  | 'fieldCitation'
  | 'libraryAnalysisRecord'
  | 'evidenceAppraisal'
>

type SeedTarget = {
  entry: CorrectionEntry
  portableIdentity: CanonicalJsonValue
  portableIdentitySha256: string
}

export type ReviewedReportProvenanceCorrectionDatabaseIdentity = {
  currentDatabase: string
  releaseMetadataAvailable: boolean
  databaseIdentityUuid: string | null
}

export type ReviewedReportProvenanceCorrectionPlanRow = {
  entity: 'Report'
  id: string
  expectedCurrentType: string
  targetType: string
  currentType: string | null
  status: ReviewedReportProvenanceCorrectionStatus
  seedIdentitySha256: string
  databaseNonProvenanceSha256: string | null
  beforeFullRowSha256: string | null
  afterFullRowSha256: string | null
}

export type ReviewedReportProvenanceCorrectionConflict = {
  entity: 'Report' | 'Batch'
  id: string
  reason: string
}

type DependencyInspection = {
  snapshot: CanonicalJsonValue
  sha256: string
  counts: Record<string, number>
}

export type ReviewedReportProvenanceCorrectionInspection = {
  plan: {
    version: typeof REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION
    databaseIdentity: ReviewedReportProvenanceCorrectionDatabaseIdentity
    targetCount: number
    manifestSha256: string
    seedIdentitySha256: string
    databaseNonProvenanceSha256: string
    databaseFullStateSha256: string
    dependencyScope: readonly string[]
    dependencySha256: string
    dependencyCounts: Record<string, number>
    rows: ReviewedReportProvenanceCorrectionPlanRow[]
    conflicts: ReviewedReportProvenanceCorrectionConflict[]
    summary: {
      pending: number
      applied: number
      conflicts: number
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
    throw new Error(
      `Reviewed Report provenance correction ${id} has invalid ${field}`,
    )
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

function normalizedReportRow(
  row: ReviewedReportProvenanceCorrectionDatabaseRow,
) {
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
  const manifest = validateReviewedReportProvenanceCorrectionManifest()
  if (
    manifest.length !== REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT ||
    new Set(manifest.map((entry) => entry.id)).size !== manifest.length
  ) {
    throw new Error(
      'Reviewed Report provenance correction manifest must contain exactly 7 unique Report rows',
    )
  }
  return manifest
}

export function buildReviewedReportProvenanceCorrectionSeedTargets(): SeedTarget[] {
  const manifest = validateManifestContract()
  const reportById = new Map(reports.map((row) => [row.id, row]))
  return manifest.map((entry) => {
    const seed = reportById.get(entry.id)
    if (!seed) {
      throw new Error(
        `Reviewed Report provenance correction seed row is missing: ${entry.id}`,
      )
    }
    if (seed.provenanceType !== entry.targetType) {
      throw new Error(
        `Reviewed Report provenance correction seed target drifted: ${entry.id}`,
      )
    }
    const portableIdentity = reportSeedIdentity(seed)
    return {
      entry,
      portableIdentity,
      portableIdentitySha256:
        sha256ReviewedProvenanceJson(portableIdentity),
    }
  })
}

function targetIds() {
  return REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map(
    (entry) => entry.id,
  )
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
): Promise<ReviewedReportProvenanceCorrectionDatabaseIdentity> {
  const databaseRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `)
  if (databaseRows.length !== 1 || !databaseRows[0]?.currentDatabase) {
    throw new Error(
      'Could not pin current_database() for the Report correction plan',
    )
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
  const identityUuid = identityRows[0]?.identityUuid ?? ''
  if (
    identityRows.length !== 1 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      identityUuid,
    )
  ) {
    throw new Error(
      'DatabaseIdentity exists but does not contain exactly one valid primary UUID',
    )
  }
  return {
    currentDatabase: databaseRows[0].currentDatabase,
    releaseMetadataAvailable: true,
    databaseIdentityUuid: identityUuid.toLowerCase(),
  }
}

async function inspectDependencies(
  client: ReviewedReportProvenanceCorrectionClient,
  identity: ReviewedReportProvenanceCorrectionDatabaseIdentity,
  reportRows: readonly ReviewedReportProvenanceCorrectionDatabaseRow[],
): Promise<DependencyInspection> {
  const reportIds = targetIds()
  const reportSourceKeys = reportIds.map((id) => `report:${id}`)
  const documentIds = sortedUnique(reportRows.map((row) => row.documentId))

  const [
    documents,
    documentRefs,
    sourceCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
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
          { documentId: { in: documentIds } },
          {
            fieldCitations: {
              some: {
                entityType: 'Report',
                entityId: { in: reportIds },
              },
            },
          },
          {
            reviewBasisForAppraisals: {
              some: { reportId: { in: reportIds } },
            },
          },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { documentId: { in: documentIds } },
          { sourceKind: 'report', sourceKey: { in: reportSourceKeys } },
        ],
      },
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: { reportId: { in: reportIds } },
      orderBy: { id: 'asc' },
    }),
  ])
  const citationIds = sourceCitations.map((row) => row.id)
  const fieldCitations = await client.fieldCitation.findMany({
    where: {
      OR: [
        { entityType: 'Report', entityId: { in: reportIds } },
        { citationId: { in: citationIds } },
      ],
    },
    orderBy: { id: 'asc' },
  })

  const snapshot = canonicalizeReviewedProvenanceJson({
    scope: REVIEWED_REPORT_PROVENANCE_CORRECTION_DEPENDENCY_SCOPE,
    databaseIdentity: identity,
    documents,
    documentRefs,
    sourceCitations,
    fieldCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
  })
  const counts = {
    databaseIdentity: identity.databaseIdentityUuid == null ? 0 : 1,
    documents: documents.length,
    documentRefs: documentRefs.length,
    sourceCitations: sourceCitations.length,
    fieldCitations: fieldCitations.length,
    libraryAnalysisRecords: libraryAnalysisRecords.length,
    evidenceAppraisals: evidenceAppraisals.length,
  }
  return {
    snapshot,
    sha256: sha256ReviewedProvenanceJson(snapshot),
    counts,
  }
}

export function classifyReviewedReportProvenanceCorrectionCurrent(
  entry: CorrectionEntry,
  current: string | null | undefined,
): ReviewedReportProvenanceCorrectionStatus {
  if (current === entry.targetType) return 'applied'
  if (current === entry.expectedCurrentType) return 'pending'
  return 'conflict'
}

export function assertReviewedReportProvenanceCorrectionStateIsAtomic(
  statuses: readonly ReviewedReportProvenanceCorrectionStatus[],
) {
  if (statuses.length !== REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT) {
    throw new Error(
      `Reviewed Report provenance correction state must contain ${REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT} rows`,
    )
  }
  if (statuses.includes('conflict')) {
    throw new Error('Reviewed Report provenance correction state contains conflicts')
  }
  const pending = statuses.filter((status) => status === 'pending').length
  const applied = statuses.filter((status) => status === 'applied').length
  if (pending > 0 && applied > 0) {
    throw new Error(
      'Reviewed Report provenance correction state is hybrid/partially applied',
    )
  }
  return { pending, applied }
}

export async function inspectReviewedReportProvenanceCorrectionState(
  client: ReviewedReportProvenanceCorrectionClient,
): Promise<ReviewedReportProvenanceCorrectionInspection> {
  const seedTargets = buildReviewedReportProvenanceCorrectionSeedTargets()
  const reportIds = targetIds()
  const [identity, reportRows] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.report.findMany({
      where: { id: { in: reportIds } },
      select: reportSelect,
      orderBy: { id: 'asc' },
    }),
  ])
  const reportById = new Map(reportRows.map((row) => [row.id, row]))
  const conflicts: ReviewedReportProvenanceCorrectionConflict[] = []

  const rows = seedTargets.map(
    (target): ReviewedReportProvenanceCorrectionPlanRow => {
      const current = reportById.get(target.entry.id)
      if (!current) {
        conflicts.push({
          entity: 'Report',
          id: target.entry.id,
          reason: 'missing_database_row',
        })
        return {
          entity: 'Report',
          id: target.entry.id,
          expectedCurrentType: target.entry.expectedCurrentType,
          targetType: target.entry.targetType,
          currentType: null,
          status: 'conflict',
          seedIdentitySha256: target.portableIdentitySha256,
          databaseNonProvenanceSha256: null,
          beforeFullRowSha256: null,
          afterFullRowSha256: null,
        }
      }

      const normalized = normalizedReportRow(current)
      const portable = portableDatabaseIdentity(normalized)
      const nonProvenance = nonProvenanceDatabaseIdentity(normalized)
      const currentType = current.provenanceType
      let status = classifyReviewedReportProvenanceCorrectionCurrent(
        target.entry,
        currentType,
      )
      if (
        sha256ReviewedProvenanceJson(portable) !==
        target.portableIdentitySha256
      ) {
        status = 'conflict'
        conflicts.push({
          entity: 'Report',
          id: target.entry.id,
          reason: 'seed_database_non_provenance_identity_drift',
        })
      } else if (status === 'conflict') {
        conflicts.push({
          entity: 'Report',
          id: target.entry.id,
          reason: `unexpected_current_provenance:${String(currentType)}`,
        })
      }
      const after = { ...normalized, provenanceType: target.entry.targetType }
      return {
        entity: 'Report',
        id: target.entry.id,
        expectedCurrentType: target.entry.expectedCurrentType,
        targetType: target.entry.targetType,
        currentType,
        status,
        seedIdentitySha256: target.portableIdentitySha256,
        databaseNonProvenanceSha256:
          sha256ReviewedProvenanceJson(nonProvenance),
        beforeFullRowSha256: sha256ReviewedProvenanceJson(normalized),
        afterFullRowSha256: sha256ReviewedProvenanceJson(after),
      }
    },
  )

  if (conflicts.length === 0) {
    try {
      assertReviewedReportProvenanceCorrectionStateIsAtomic(
        rows.map((row) => row.status),
      )
    } catch (error) {
      conflicts.push({
        entity: 'Batch',
        id: REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION,
        reason: error instanceof Error ? error.message : 'invalid_atomic_state',
      })
    }
  }

  const dependency = await inspectDependencies(client, identity, reportRows)
  const databaseNonProvenanceState = rows.map((row) => ({
    id: row.id,
    sha256: row.databaseNonProvenanceSha256,
  }))
  const databaseFullState = rows.map((row) => ({
    id: row.id,
    sha256: row.beforeFullRowSha256,
  }))
  const summary = {
    pending: rows.filter((row) => row.status === 'pending').length,
    applied: rows.filter((row) => row.status === 'applied').length,
    conflicts: conflicts.length,
  }

  return {
    plan: {
      version: REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION,
      databaseIdentity: identity,
      targetCount: REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
      manifestSha256:
        REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
      seedIdentitySha256: sha256ReviewedProvenanceJson(
        seedTargets.map((target) => ({
          id: target.entry.id,
          sha256: target.portableIdentitySha256,
        })),
      ),
      databaseNonProvenanceSha256: sha256ReviewedProvenanceJson(
        databaseNonProvenanceState,
      ),
      databaseFullStateSha256:
        sha256ReviewedProvenanceJson(databaseFullState),
      dependencyScope:
        REVIEWED_REPORT_PROVENANCE_CORRECTION_DEPENDENCY_SCOPE,
      dependencySha256: dependency.sha256,
      dependencyCounts: dependency.counts,
      rows,
      conflicts,
      summary,
    },
    dependencySnapshot: dependency.snapshot,
  }
}

export function reviewedReportProvenanceCorrectionPlanContract(
  inspection: ReviewedReportProvenanceCorrectionInspection,
) {
  return canonicalizeReviewedProvenanceJson(inspection.plan)
}

export function reviewedReportProvenanceCorrectionPlanSha256(
  inspection: ReviewedReportProvenanceCorrectionInspection,
) {
  return sha256ReviewedProvenanceJson(
    reviewedReportProvenanceCorrectionPlanContract(inspection),
  )
}

export function assertReviewedReportProvenanceCorrectionReady(
  inspection: ReviewedReportProvenanceCorrectionInspection,
) {
  const { plan } = inspection
  if (
    plan.rows.length !== REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT ||
    plan.rows.some((row) => row.entity !== 'Report') ||
    plan.conflicts.length > 0
  ) {
    throw new Error(
      `Reviewed Report provenance correction conflicts detected; refusing mutation: ${plan.conflicts
        .map(
          (conflict) =>
            `${conflict.entity}:${conflict.id}:${conflict.reason}`,
        )
        .join(', ')}`,
    )
  }
  return assertReviewedReportProvenanceCorrectionStateIsAtomic(
    plan.rows.map((row) => row.status),
  )
}

export function assertReviewedReportProvenanceCorrectionPostApply(
  before: ReviewedReportProvenanceCorrectionInspection,
  after: ReviewedReportProvenanceCorrectionInspection,
) {
  assertReviewedReportProvenanceCorrectionReady(before)
  const afterAtomic = assertReviewedReportProvenanceCorrectionReady(after)
  if (
    afterAtomic.pending !== 0 ||
    afterAtomic.applied !==
      REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT ||
    after.plan.seedIdentitySha256 !== before.plan.seedIdentitySha256 ||
    after.plan.databaseNonProvenanceSha256 !==
      before.plan.databaseNonProvenanceSha256 ||
    after.plan.dependencySha256 !== before.plan.dependencySha256 ||
    sha256ReviewedProvenanceJson(after.plan.databaseIdentity) !==
      sha256ReviewedProvenanceJson(before.plan.databaseIdentity)
  ) {
    throw new Error(
      'Reviewed Report provenance correction post-apply idempotence, non-provenance, identity, or dependency verification failed; no rows updated',
    )
  }
  const expectedAfterById = new Map(
    before.plan.rows.map((row) => [row.id, row.afterFullRowSha256]),
  )
  if (
    after.plan.rows.some(
      (row) => row.beforeFullRowSha256 !== expectedAfterById.get(row.id),
    )
  ) {
    throw new Error(
      'Reviewed Report provenance correction post-apply full-row hash verification failed; no rows updated',
    )
  }
  return afterAtomic
}

async function lockTargetRows(transaction: Prisma.TransactionClient) {
  const reportIds = targetIds()
  const lockedRows = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
      ORDER BY "id" FOR UPDATE
    `,
  )
  const lockedIds = lockedRows.map((row) => row.id).sort()
  const expectedIds = [...reportIds].sort()
  if (
    lockedIds.length !== expectedIds.length ||
    lockedIds.some((id, index) => id !== expectedIds[index])
  ) {
    throw new Error('Target Report lock set drifted; no rows updated')
  }
}

async function lockDependencyRows(
  transaction: Prisma.TransactionClient,
  identity: ReviewedReportProvenanceCorrectionDatabaseIdentity,
) {
  if (!identity.databaseIdentityUuid) {
    throw new Error('Cannot lock a missing DatabaseIdentity UUID')
  }
  const reportIds = targetIds()
  const reportSourceKeys = reportIds.map((id) => `report:${id}`)
  const identityRows = await transaction.$queryRaw<
    Array<{ identityUuid: string }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid"
    FROM "DatabaseIdentity"
    WHERE "key" = 'primary'
      AND "identityUuid" = ${identity.databaseIdentityUuid}::uuid
    FOR SHARE
  `)
  if (
    identityRows.length !== 1 ||
    identityRows[0]?.identityUuid.toLowerCase() !==
      identity.databaseIdentityUuid
  ) {
    throw new Error('DatabaseIdentity changed before dependency lock')
  }

  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "Document"
    WHERE "id" IN (
      SELECT "documentId" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
        AND "documentId" IS NOT NULL
    )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "DocumentRef"
    WHERE "fromId" IN (
      SELECT "documentId" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
        AND "documentId" IS NOT NULL
    )
       OR "toId" IN (
      SELECT "documentId" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
        AND "documentId" IS NOT NULL
    )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "documentId" IN (
      SELECT "documentId" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
        AND "documentId" IS NOT NULL
    )
       OR "id" IN (
      SELECT "citationId" FROM "FieldCitation"
      WHERE "entityType" = 'Report'
        AND "entityId" IN (${Prisma.join(reportIds)})
    )
       OR "id" IN (
      SELECT "reviewBasisCitationId" FROM "EvidenceAppraisal"
      WHERE "reportId" IN (${Prisma.join(reportIds)})
        AND "reviewBasisCitationId" IS NOT NULL
    )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE ("entityType" = 'Report'
           AND "entityId" IN (${Prisma.join(reportIds)}))
       OR "citationId" IN (
      SELECT "id" FROM "SourceCitation"
      WHERE "documentId" IN (
        SELECT "documentId" FROM "Report"
        WHERE "id" IN (${Prisma.join(reportIds)})
          AND "documentId" IS NOT NULL
      )
         OR "id" IN (
        SELECT "citationId" FROM "FieldCitation"
        WHERE "entityType" = 'Report'
          AND "entityId" IN (${Prisma.join(reportIds)})
      )
         OR "id" IN (
        SELECT "reviewBasisCitationId" FROM "EvidenceAppraisal"
        WHERE "reportId" IN (${Prisma.join(reportIds)})
          AND "reviewBasisCitationId" IS NOT NULL
      )
    )
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "LibraryAnalysisRecord"
    WHERE "documentId" IN (
      SELECT "documentId" FROM "Report"
      WHERE "id" IN (${Prisma.join(reportIds)})
        AND "documentId" IS NOT NULL
    )
       OR ("sourceKind" = 'report'
           AND "sourceKey" IN (${Prisma.join(reportSourceKeys)}))
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "EvidenceAppraisal"
    WHERE "reportId" IN (${Prisma.join(reportIds)})
    ORDER BY "id" FOR SHARE
  `)
}

async function applyPlannedRow(
  transaction: Prisma.TransactionClient,
  row: ReviewedReportProvenanceCorrectionPlanRow,
) {
  if (row.status !== 'pending') return 0
  if (!row.beforeFullRowSha256 || !row.afterFullRowSha256) {
    throw new Error(`Report correction row lacks full-row CAS hashes: ${row.id}`)
  }
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
    where: {
      id: row.id,
      provenanceType: row.expectedCurrentType,
    },
    data: { provenanceType: row.targetType },
  })
  if (updated.count !== 1) {
    throw new Error(`Concurrent Report provenance CAS conflict: ${row.id}`)
  }
  return 1
}

function printInspection(
  inspection: ReviewedReportProvenanceCorrectionInspection,
  planSha256: string,
) {
  const { plan } = inspection
  console.log('Reviewed 7-row Report provenance corrections')
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
    JSON.stringify(
      reviewedReportProvenanceCorrectionPlanContract(inspection),
      null,
      2,
    ),
  )
}

export type ReviewedReportProvenanceCorrectionArgs = {
  apply: boolean
  ack?: string
  expectedPlanSha256?: string
}

export function parseReviewedReportProvenanceCorrectionArgs(
  args: readonly string[],
): ReviewedReportProvenanceCorrectionArgs {
  const isAllowed = (argument: string) =>
    argument === '--apply' ||
    argument.startsWith('--ack=') ||
    argument.startsWith('--plan-sha256=')
  const unknown = args.find((argument) => !isAllowed(argument))
  if (unknown) {
    throw new Error(`Unknown Report provenance correction argument: ${unknown}`)
  }
  const ackArgs = args.filter((argument) => argument.startsWith('--ack='))
  const planArgs = args.filter((argument) =>
    argument.startsWith('--plan-sha256='),
  )
  if (
    args.filter((argument) => argument === '--apply').length > 1 ||
    ackArgs.length > 1 ||
    planArgs.length > 1
  ) {
    throw new Error(
      'Report provenance correction arguments must not be repeated',
    )
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
    `${REVIEWED_REPORT_PROVENANCE_CORRECTION_RECEIPT_PREFIX} ${JSON.stringify(payload)}`,
  )
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serializ|deadlock|concurrent|changed before|changed after planning|CAS conflict/i.test(
    message,
  )
}

export function assertReviewedReportProvenanceCorrectionApplyAuthorization(
  args: ReviewedReportProvenanceCorrectionArgs,
) {
  if (!args.apply) return
  if (args.ack !== REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK}`,
    )
  }
  if (!/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error(
      '--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run',
    )
  }
}

export async function main() {
  const args = parseReviewedReportProvenanceCorrectionArgs(
    process.argv.slice(2),
  )
  assertReviewedReportProvenanceCorrectionApplyAuthorization(args)
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const inspected = await inspectReviewedReportProvenanceCorrectionState(
      prisma as unknown as ReviewedReportProvenanceCorrectionClient,
    )
    const planSha256 =
      reviewedReportProvenanceCorrectionPlanSha256(inspected)
    printInspection(inspected, planSha256)
    assertReviewedReportProvenanceCorrectionReady(inspected)

    if (!args.apply) {
      console.log(
        `Dry run only. Re-run with --apply --ack=${REVIEWED_REPORT_PROVENANCE_CORRECTION_APPLY_ACK} --plan-sha256=${planSha256}`,
      )
      machineReceipt({
        mode: 'dry-run',
        version: REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION,
        planSha256,
        databaseIdentity: inspected.plan.databaseIdentity,
        targetCount: inspected.plan.targetCount,
        manifestSha256: inspected.plan.manifestSha256,
        seedIdentitySha256: inspected.plan.seedIdentitySha256,
        databaseNonProvenanceSha256:
          inspected.plan.databaseNonProvenanceSha256,
        databaseFullStateSha256: inspected.plan.databaseFullStateSha256,
        dependencyScope: inspected.plan.dependencyScope,
        dependencySha256: inspected.plan.dependencySha256,
        dependencyCounts: inspected.plan.dependencyCounts,
        pending: inspected.plan.summary.pending,
        applied: inspected.plan.summary.applied,
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
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_REPORT_PROVENANCE_CORRECTION_ADVISORY_LOCK_KEY}))
        `
        await lockTargetRows(transaction)
        await lockDependencyRows(
          transaction,
          inspected.plan.databaseIdentity,
        )

        const locked = await inspectReviewedReportProvenanceCorrectionState(
          transaction as unknown as ReviewedReportProvenanceCorrectionClient,
        )
        const lockedAtomic =
          assertReviewedReportProvenanceCorrectionReady(locked)
        if (
          reviewedReportProvenanceCorrectionPlanSha256(locked) !==
          args.expectedPlanSha256
        ) {
          throw new Error(
            'Concurrent target, identity, or enumerated dependency drift changed the Report correction plan; no rows updated',
          )
        }

        let updatedRows = 0
        for (const row of locked.plan.rows) {
          updatedRows += await applyPlannedRow(transaction, row)
        }
        if (updatedRows !== lockedAtomic.pending) {
          throw new Error(
            'Report correction update count differed from the locked pending count; no rows updated',
          )
        }

        const after = await inspectReviewedReportProvenanceCorrectionState(
          transaction as unknown as ReviewedReportProvenanceCorrectionClient,
        )
        assertReviewedReportProvenanceCorrectionPostApply(locked, after)
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
      version: REVIEWED_REPORT_PROVENANCE_CORRECTION_VERSION,
      planSha256,
      databaseIdentity: inspected.plan.databaseIdentity,
      targetCount: inspected.plan.targetCount,
      manifestSha256: inspected.plan.manifestSha256,
      seedIdentitySha256: inspected.plan.seedIdentitySha256,
      databaseNonProvenanceSha256: result.databaseNonProvenanceSha256,
      beforeFullStateSha256: result.beforeFullStateSha256,
      afterFullStateSha256: result.afterFullStateSha256,
      dependencyScope: inspected.plan.dependencyScope,
      dependencySha256: result.dependencySha256,
      updatedRows: result.updatedRows,
      idempotentAppliedRows:
        REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
    })
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Report provenance correction apply conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
        : 'Reviewed Report provenance correction failed',
    )
    process.exitCode = 1
  })
}
