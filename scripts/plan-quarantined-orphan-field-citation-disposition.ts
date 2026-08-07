import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  loadOrphanDocumentFieldCitationManifest,
  serializeDocumentIdentity,
  serializeFieldCitationSnapshot,
  serializeSourceCitationSnapshot,
  type SerializedFieldCitationSnapshot,
} from '../src/lib/citations/orphan-document-field-citation-repair'
import {
  ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_APPLY_ENABLED,
  buildOrphanDocumentFieldCitationDispositionPlan,
  loadOrphanDocumentFieldCitationDisposition,
  orphanDocumentFieldCitationDispositionPlanSha256,
  validateOrphanDocumentFieldCitationDisposition,
  type OrphanDocumentFieldCitationDisposition,
  type OrphanDocumentFieldCitationDispositionInspection,
  type SourceCitationConsumerCounts,
} from '../src/lib/citations/orphan-document-field-citation-disposition'

const APPLY_ACK = 'DELETE_REVIEWED_CORRUPT_ORPHAN_FIELD_CITATIONS_PRESERVE_SOURCES'
const ADVISORY_LOCK_KEY = 'foodsystems:quarantined-orphan-field-citation-disposition:2026-07-20:v1'

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

const documentIdentitySelect = {
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
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect

type DispositionClient = Pick<
  PrismaClient,
  | 'fieldCitation'
  | 'sourceCitation'
  | 'document'
  | '$queryRaw'
>

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run', '--details'])
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
    details: argv.includes('--details'),
    ack: argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find(argument => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

function targetCitationIds(disposition: OrphanDocumentFieldCitationDisposition) {
  return disposition.targets.map(target => target.sourceCitationIdToPreserve).sort()
}

function oldDocumentIds(disposition: OrphanDocumentFieldCitationDisposition) {
  return [...new Set(disposition.targets.map(target => target.oldDocumentIdMustBeMissing))].sort()
}

function parallelDocumentIds(disposition: OrphanDocumentFieldCitationDisposition) {
  return disposition.targets
    .flatMap(target => target.expectedParallelValidDocumentIdentity?.id ?? [])
    .sort()
}

async function inspectDisposition(
  client: DispositionClient,
  disposition: OrphanDocumentFieldCitationDisposition,
): Promise<OrphanDocumentFieldCitationDispositionInspection> {
  const citationIds = targetCitationIds(disposition)
  const oldIds = oldDocumentIds(disposition)
  const parallelIds = parallelDocumentIds(disposition)
  const [
    orphanRows,
    fields,
    citations,
    parallelDocuments,
    presentOldDocuments,
    consumerRows,
  ] = await Promise.all([
    client.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT field_citation."id"
      FROM "FieldCitation" field_citation
      LEFT JOIN "Document" document
        ON document."id" = field_citation."entityId"
      WHERE field_citation."entityType" = 'Document'
        AND document."id" IS NULL
      ORDER BY field_citation."id"
    `),
    client.fieldCitation.findMany({
      where: { citationId: { in: citationIds } },
      select: fieldCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceCitation.findMany({
      where: { id: { in: citationIds } },
      select: sourceCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: { in: parallelIds } },
      select: documentIdentitySelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: { in: oldIds } },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.$queryRaw<Array<{
      id: string
      fieldCitations: number
      insightPrimaryCitations: number
      producerPrimaryCitations: number
      evidenceAppraisalReviewBasisCitations: number
    }>>(Prisma.sql`
      SELECT citation."id",
        (SELECT count(*)::integer FROM "FieldCitation" field
          WHERE field."citationId" = citation."id") AS "fieldCitations",
        (SELECT count(*)::integer FROM "Insight" insight
          WHERE insight."primaryCitationId" = citation."id") AS "insightPrimaryCitations",
        (SELECT count(*)::integer FROM "Producer" producer
          WHERE producer."primaryCitationId" = citation."id") AS "producerPrimaryCitations",
        (SELECT count(*)::integer FROM "EvidenceAppraisal" appraisal
          WHERE appraisal."reviewBasisCitationId" = citation."id") AS "evidenceAppraisalReviewBasisCitations"
      FROM "SourceCitation" citation
      WHERE citation."id" IN (${Prisma.join(citationIds)})
      ORDER BY citation."id"
    `),
  ])

  return {
    orphanFieldCitationIds: orphanRows.map(row => row.id),
    fieldCitations: fields.map(serializeFieldCitationSnapshot),
    sourceCitations: citations.map(row => serializeSourceCitationSnapshot({
      ...row,
      sourceClass: row.sourceClass,
      citationReadiness: row.citationReadiness,
      verificationStatus: row.verificationStatus,
    })),
    parallelDocuments: parallelDocuments.map(serializeDocumentIdentity),
    presentOldDocumentIds: presentOldDocuments.map(row => row.id),
    consumerCounts: Object.fromEntries(
      consumerRows.map(row => [row.id, {
        fieldCitations: row.fieldCitations,
        insightPrimaryCitations: row.insightPrimaryCitations,
        producerPrimaryCitations: row.producerPrimaryCitations,
        evidenceAppraisalReviewBasisCitations: row.evidenceAppraisalReviewBasisCitations,
      } satisfies SourceCitationConsumerCounts]),
    ),
  }
}

function printPlan(
  plan: ReturnType<typeof buildOrphanDocumentFieldCitationDispositionPlan>,
  digest: string,
  details: boolean,
) {
  console.log('Quarantined orphan Document FieldCitation disposition plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Pinned disposition SHA-256: ${plan.dispositionSha256}`)
  console.log(`Apply enabled: ${plan.applyEnabled}`)
  console.log(
    `Targets: ${plan.summary.total}; pending deletion: ${plan.summary.pendingDeletion}; ` +
    `already disposed: ${plan.summary.alreadyDisposed}; SourceCitations preserved: ` +
    `${plan.summary.sourceCitationsPreserved}; empty bindings after deletion: ` +
    `${plan.summary.singletonSourceCitationsAfterDeletion}; parallel bindings preserved: ` +
    `${plan.summary.parallelBindingsPreserved}; conflicts: ${plan.summary.conflicts}`,
  )
  for (const target of plan.deletions) {
    console.log(
      `Reviewed deletion candidate ${target.fieldCitationId}; preserve SourceCitation ` +
      `${target.sourceCitationIdToPreserve}; preserve parallel FieldCitation(s): ` +
      `${target.expectedAfterState.remainingFieldCitationIds.join(', ') || 'none'}`,
    )
    if (details) console.log(`  ${target.dispositionRationale}`)
  }
  for (const id of plan.alreadyDisposedIds) console.log(`Already disposed ${id}`)
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}/${conflict.code}: ${conflict.detail}`)
  }
  console.log(
    `Decision boundary: apply requires --ack=${APPLY_ACK} and this exact current plan SHA-256.`,
  )
}

function fieldCitationCasWhere(
  expected: SerializedFieldCitationSnapshot,
): Prisma.FieldCitationWhereInput {
  return {
    id: expected.id,
    citationId: expected.citationId,
    entityType: expected.entityType,
    entityId: expected.entityId,
    fieldPath: expected.fieldPath,
    claimText: expected.claimText,
    confidence: expected.confidence,
    createdAt: new Date(`${expected.createdAt}Z`),
  }
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockDispositionDependencies(
  transaction: Prisma.TransactionClient,
  disposition: OrphanDocumentFieldCitationDisposition,
) {
  const citationIds = targetCitationIds(disposition)
  const parallelIds = parallelDocumentIds(disposition)
  const lockedCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "id" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedCitations, citationIds)) {
    throw new Error('Preserved SourceCitation rows changed after planning; no rows deleted')
  }

  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE "citationId" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR UPDATE
  `)

  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "Insight"
    WHERE "primaryCitationId" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "Producer"
    WHERE "primaryCitationId" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "EvidenceAppraisal"
    WHERE "reviewBasisCitationId" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)

  if (parallelIds.length > 0) {
    const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "Document"
      WHERE "id" IN (${Prisma.join(parallelIds)})
      ORDER BY "id" FOR SHARE
    `)
    if (!exactIds(lockedDocuments, parallelIds)) {
      throw new Error('Parallel valid Document bindings changed after planning; no rows deleted')
    }
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/i.test(message)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.apply && !ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_APPLY_ENABLED) {
    throw new Error(
      'Destructive disposition apply is disabled in code pending explicit preservation review and authorization',
    )
  }
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error('--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run')
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const baseManifest = loadOrphanDocumentFieldCitationManifest()
  const disposition = validateOrphanDocumentFieldCitationDisposition(
    loadOrphanDocumentFieldCitationDisposition(),
    baseManifest,
  )
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = buildOrphanDocumentFieldCitationDispositionPlan(
      await inspectDisposition(prisma, disposition),
      disposition,
      baseManifest,
    )
    const digest = orphanDocumentFieldCitationDispositionPlanSha256(plan)
    printPlan(plan, digest, args.details)
    if (plan.conflicts.length > 0) {
      throw new Error('Quarantined orphan FieldCitation disposition conflicts detected')
    }
    if (!args.apply) return
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current disposition differs from --plan-sha256; rerun dry-run and review')
    }

    const deleted = await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `
      await lockDispositionDependencies(transaction, disposition)
      const lockedPlan = buildOrphanDocumentFieldCitationDispositionPlan(
        await inspectDisposition(transaction, disposition),
        disposition,
        baseManifest,
      )
      if (
        lockedPlan.conflicts.length > 0 ||
        orphanDocumentFieldCitationDispositionPlanSha256(lockedPlan) !==
          args.expectedPlanSha256
      ) {
        throw new Error('Concurrent disposition dependency drift detected; no rows deleted')
      }

      for (const target of lockedPlan.deletions) {
        const result = await transaction.fieldCitation.deleteMany({
          where: fieldCitationCasWhere(target.expectedFieldCitation),
        })
        if (result.count !== 1) {
          throw new Error(`Concurrent full-row delete CAS conflict: ${target.fieldCitationId}`)
        }
      }

      const afterPlan = buildOrphanDocumentFieldCitationDispositionPlan(
        await inspectDisposition(transaction, disposition),
        disposition,
        baseManifest,
      )
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.deletions.length > 0 ||
        afterPlan.alreadyDisposedIds.length !== disposition.targets.length
      ) {
        throw new Error('Post-disposition preservation contract failed; no rows deleted')
      }
      return lockedPlan.deletions.length
    }, { isolationLevel: 'Serializable' })

    console.log(
      `Disposition applied: ${deleted} corrupt FieldCitation row(s) deleted; ` +
      `${disposition.targets.length} SourceCitation row(s) preserved`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Quarantined disposition conflicted with a concurrent write; the Serializable ` +
        `transaction rolled back and zero rows were deleted. Cause: ${detail}.`,
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
    console.error(
      error instanceof Error
        ? error.message
        : 'Quarantined orphan FieldCitation disposition failed',
    )
    process.exitCode = 1
  })
}
