import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildOrphanDocumentFieldCitationRepairPlan,
  loadOrphanDocumentFieldCitationManifest,
  orphanDocumentFieldCitationPlanSha256,
  serializeDocumentIdentity,
  serializeFieldCitationSnapshot,
  serializeSourceCitationSnapshot,
  validateOrphanDocumentFieldCitationManifest,
  type OrphanDocumentFieldCitationInspection,
  type OrphanDocumentFieldCitationManifest,
  type SafeOrphanDocumentFieldCitationTarget,
  type SerializedFieldCitationSnapshot,
} from '../src/lib/citations/orphan-document-field-citation-repair'

const APPLY_ACK = 'APPLY_REVIEWED_ORPHAN_DOCUMENT_FIELD_CITATION_REPAIR'
const ADVISORY_LOCK_KEY = 'foodsystems:orphan-document-field-citation-id-churn:2026-07-20:v1'

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

type RepairClient = Pick<
  PrismaClient,
  'fieldCitation' | 'sourceCitation' | 'document' | '$queryRaw'
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

function manifestFieldIds(manifest: OrphanDocumentFieldCitationManifest) {
  return [...manifest.safeTargets, ...manifest.unresolvedTargets]
    .map(target => target.expectedFieldCitation.id)
    .sort()
}

function manifestCitationIds(manifest: OrphanDocumentFieldCitationManifest) {
  return [...manifest.safeTargets, ...manifest.unresolvedTargets]
    .map(target => target.expectedSourceCitation.id)
    .sort()
}

function manifestOldDocumentIds(manifest: OrphanDocumentFieldCitationManifest) {
  return [...new Set(
    [...manifest.safeTargets, ...manifest.unresolvedTargets]
      .map(target => target.oldDocumentIdMustBeMissing),
  )].sort()
}

function manifestTargetDocumentIds(manifest: OrphanDocumentFieldCitationManifest) {
  return [...new Set(manifest.safeTargets.map(target => target.targetDocumentId))].sort()
}

async function inspectOrphanDocumentFieldCitations(
  client: RepairClient,
  manifest: OrphanDocumentFieldCitationManifest,
): Promise<OrphanDocumentFieldCitationInspection> {
  const fieldIds = manifestFieldIds(manifest)
  const citationIds = manifestCitationIds(manifest)
  const oldDocumentIds = manifestOldDocumentIds(manifest)
  const targetDocumentIds = manifestTargetDocumentIds(manifest)
  const targetTupleWhere: Prisma.FieldCitationWhereInput[] = manifest.safeTargets.map(target => ({
    citationId: target.expectedFieldCitation.citationId,
    entityType: 'Document',
    entityId: target.targetDocumentId,
    fieldPath: target.expectedFieldCitation.fieldPath,
  }))

  const [
    orphanRows,
    fields,
    citations,
    targetDocuments,
    oldDocuments,
    targetTupleFieldCitations,
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
      where: { id: { in: fieldIds } },
      select: fieldCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceCitation.findMany({
      where: { id: { in: citationIds } },
      select: sourceCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: { in: targetDocumentIds } },
      select: documentIdentitySelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: { in: oldDocumentIds } },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.fieldCitation.findMany({
      where: { OR: targetTupleWhere },
      select: {
        id: true,
        citationId: true,
        entityType: true,
        entityId: true,
        fieldPath: true,
      },
      orderBy: { id: 'asc' },
    }),
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
    targetDocuments: targetDocuments.map(serializeDocumentIdentity),
    presentOldDocumentIds: oldDocuments.map(row => row.id),
    targetTupleFieldCitations,
  }
}

function printPlan(
  plan: ReturnType<typeof buildOrphanDocumentFieldCitationRepairPlan>,
  digest: string,
  details: boolean,
) {
  console.log('Orphan Document FieldCitation ID-churn repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Pinned manifest SHA-256: ${plan.manifestSha256}`)
  console.log(
    `Inventory: ${plan.summary.inventory}; safe: ${plan.summary.safe}; pending: ${plan.summary.pending}; ` +
    `already applied: ${plan.summary.alreadyApplied}; quarantined unresolved: ${plan.summary.unresolved}; ` +
    `conflicts: ${plan.summary.conflicts}`,
  )
  for (const target of plan.updates) {
    console.log(
      `Pending ${target.expectedFieldCitation.id}: ${target.oldDocumentIdMustBeMissing} -> ` +
      `${target.targetDocumentId} [${target.proofKind}]`,
    )
  }
  for (const id of plan.alreadyAppliedIds) console.log(`Already applied ${id}`)
  for (const target of plan.unresolved) {
    console.log(
      `QUARANTINED ${target.fieldCitationId}: preserved at missing ${target.oldDocumentId} ` +
      `[${target.reasonCode}] ${target.reason}`,
    )
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}/${conflict.code}: ${conflict.detail}`)
  }
  if (details) {
    console.log(`Observed orphan IDs: ${plan.observedOrphanFieldCitationIds.join(', ')}`)
  }
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockPinnedRows(
  transaction: Prisma.TransactionClient,
  manifest: OrphanDocumentFieldCitationManifest,
) {
  const fieldIds = manifestFieldIds(manifest)
  const citationIds = manifestCitationIds(manifest)
  const targetDocumentIds = manifestTargetDocumentIds(manifest)

  const lockedFields = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE "id" IN (${Prisma.join(fieldIds)})
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(lockedFields, fieldIds)) {
    throw new Error('Pinned FieldCitation inventory changed after planning; no rows updated')
  }

  const lockedCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "id" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedCitations, citationIds)) {
    throw new Error('Pinned SourceCitation dependencies changed after planning; no rows updated')
  }

  const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Document"
    WHERE "id" IN (${Prisma.join(targetDocumentIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedDocuments, targetDocumentIds)) {
    throw new Error('Pinned target Document identities changed after planning; no rows updated')
  }

  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE "citationId" IN (${Prisma.join(citationIds)})
      AND "entityType" = 'Document'
      AND "entityId" IN (${Prisma.join(targetDocumentIds)})
    ORDER BY "id" FOR UPDATE
  `)
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

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  target: SafeOrphanDocumentFieldCitationTarget,
) {
  const result = await transaction.fieldCitation.updateMany({
    where: fieldCitationCasWhere(target.expectedFieldCitation),
    data: { entityId: target.targetDocumentId },
  })
  if (result.count !== 1) {
    throw new Error(
      `Concurrent full-row FieldCitation CAS conflict: ${target.expectedFieldCitation.id}; no rows updated`,
    )
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/i.test(message)
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

  const manifest = validateOrphanDocumentFieldCitationManifest(
    loadOrphanDocumentFieldCitationManifest(),
  )
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = buildOrphanDocumentFieldCitationRepairPlan(
      await inspectOrphanDocumentFieldCitations(prisma, manifest),
      manifest,
    )
    const digest = orphanDocumentFieldCitationPlanSha256(plan)
    printPlan(plan, digest, args.details)
    if (plan.conflicts.length > 0) {
      throw new Error('Orphan Document FieldCitation conflicts detected; refusing mutation')
    }
    if (!args.apply) {
      console.log(
        `Dry run only. The five unresolved rows remain quarantined. After explicit review, re-run ` +
        `with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current plan differs from --plan-sha256; rerun dry-run and review the new plan')
    }

    const applied = await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `
      await lockPinnedRows(transaction, manifest)

      const lockedPlan = buildOrphanDocumentFieldCitationRepairPlan(
        await inspectOrphanDocumentFieldCitations(transaction, manifest),
        manifest,
      )
      if (
        lockedPlan.conflicts.length > 0 ||
        orphanDocumentFieldCitationPlanSha256(lockedPlan) !== args.expectedPlanSha256
      ) {
        throw new Error('Concurrent FieldCitation, SourceCitation, or Document drift detected; no rows updated')
      }

      for (const target of lockedPlan.updates) await applyUpdate(transaction, target)

      const afterPlan = buildOrphanDocumentFieldCitationRepairPlan(
        await inspectOrphanDocumentFieldCitations(transaction, manifest),
        manifest,
      )
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.updates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== manifest.safeTargets.length ||
        afterPlan.unresolved.length !== manifest.unresolvedTargets.length
      ) {
        throw new Error('Post-apply state did not preserve the reviewed target and quarantine; no rows updated')
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(
      `Orphan Document FieldCitation repair applied: ${applied} safe row(s); ` +
      `${manifest.unresolvedTargets.length} unresolved row(s) preserved in quarantine`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Orphan Document FieldCitation repair conflicted with a concurrent write; ` +
        `the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. ` +
        `Rerun dry-run.`,
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
        : 'Orphan Document FieldCitation repair failed',
    )
    process.exitCode = 1
  })
}
