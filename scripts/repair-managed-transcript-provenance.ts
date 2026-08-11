import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { loadManagedTranscriptSourceDocIds } from '../src/lib/citations/academic-corpus-identity'
import {
  MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT,
  buildManagedTranscriptProvenanceRepairPlan,
  managedTranscriptProvenanceRepairPlanContract,
  sha256ManagedTranscriptJson,
  validateManagedTranscriptSourceDocIds,
  type ManagedTranscriptProvenanceRepairPlan,
  type ManagedTranscriptProvenanceSnapshot,
  type ManagedTranscriptProvenanceUpdate,
} from '../src/lib/citations/managed-transcript-provenance-repair'

const APPLY_ACK = 'APPLY_REVIEWED_MANAGED_TRANSCRIPT_PROVENANCE'
const ADVISORY_LOCK_KEY = 'foodsystems:managed-transcript-provenance:landbruk-arena:v1'

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

const documentSelect = {
  id: true,
  filePath: true,
  title: true,
  author: true,
  documentType: true,
  category: true,
  url: true,
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

const libraryAnalysisSelect = {
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

type ManagedTranscriptClient = Pick<
  PrismaClient,
  'sourceDoc' | 'document' | 'sourceCitation' | 'fieldCitation' | 'libraryAnalysisRecord'
>

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

export async function inspectManagedTranscriptProvenance(
  client: ManagedTranscriptClient,
  managedSourceDocIds: readonly string[],
) {
  const expectedIds = validateManagedTranscriptSourceDocIds(managedSourceDocIds)
  const sourceDocs = await client.sourceDoc.findMany({
    where: { id: { startsWith: 'src-yt-' } },
    select: sourceDocSelect,
    orderBy: { id: 'asc' },
  })
  const linkedDocumentIds = sourceDocs
    .filter(row => expectedIds.includes(row.id) && row.documentId)
    .map(row => row.documentId as string)

  const [documents, sourceCitations, libraryAnalysisRecords] = await Promise.all([
    client.document.findMany({
      where: { id: { in: linkedDocumentIds } },
      select: documentSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { sourceDocId: { in: expectedIds } },
          {
            fieldCitations: {
              some: {
                entityType: 'SourceDoc',
                entityId: { in: expectedIds },
              },
            },
          },
        ],
      },
      select: sourceCitationSelect,
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { sourceDocId: { in: expectedIds } },
          { documentId: { in: linkedDocumentIds } },
        ],
      },
      select: libraryAnalysisSelect,
      orderBy: { id: 'asc' },
    }),
  ])

  const sourceCitationIds = sourceCitations.map(row => row.id)
  const fieldCitations = await client.fieldCitation.findMany({
    where: {
      OR: [
        { citationId: { in: sourceCitationIds } },
        {
          entityType: 'SourceDoc',
          entityId: { in: expectedIds },
        },
      ],
    },
    select: fieldCitationSelect,
    orderBy: { id: 'asc' },
  })

  return buildManagedTranscriptProvenanceRepairPlan(expectedIds, {
    sourceDocs,
    documents,
    sourceCitations,
    fieldCitations,
    libraryAnalysisRecords,
  })
}

export function managedTranscriptProvenancePlanSha256(
  plan: ManagedTranscriptProvenanceRepairPlan,
) {
  return sha256ManagedTranscriptJson(managedTranscriptProvenanceRepairPlanContract(plan))
}

function printPlan(plan: ManagedTranscriptProvenanceRepairPlan, digest: string) {
  console.log('Reviewed managed transcript SourceDoc provenance plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Manifest ids SHA-256: ${plan.targetManifestSha256}`)
  console.log(`Dependency preservation SHA-256: ${plan.preservedDependencyStateSha256}`)
  console.log(
    `SourceDocs: ${plan.summary.total}; pending: ${plan.summary.pending}; already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  )
  console.log(
    `Permitted scope: provenance only; citation gate changes: ${plan.summary.citationGateChanges}; library policy changes: ${plan.summary.libraryPolicyChanges}`,
  )
  for (const update of plan.updates) {
    console.log(`Pending ${update.id}: ${update.expectedSourceDoc.provenanceType} -> ${update.targetProvenanceType}`)
  }
  for (const id of plan.alreadyAppliedIds) console.log(`Already applied ${id}`)
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}/${conflict.code}: ${conflict.detail}`)
  }
}

function dateTime(value: string | null) {
  return value ? new Date(value) : null
}

function sourceDocCasWhere(
  expected: ManagedTranscriptProvenanceSnapshot,
): Prisma.SourceDocWhereInput {
  return {
    id: expected.id,
    filename: expected.filename,
    title: expected.title,
    author: expected.author,
    year: expected.year,
    sourceType: expected.sourceType,
    description: expected.description,
    relevance: expected.relevance,
    url: expected.url,
    isDuplicate: expected.isDuplicate,
    doi: expected.doi,
    publisher: expected.publisher,
    provenanceType: expected.provenanceType,
    accessedAt: dateTime(expected.accessedAt),
    archivedUrl: expected.archivedUrl,
    documentId: expected.documentId,
  }
}

async function findSourceDocCasPreflightMismatches(
  client: ManagedTranscriptClient,
  plan: ManagedTranscriptProvenanceRepairPlan,
) {
  const checks = await Promise.all(plan.updates.map(update =>
    client.sourceDoc.count({ where: sourceDocCasWhere(update.expectedSourceDoc) })
      .then(count => ({ id: update.id, count })),
  ))
  return checks.filter(check => check.count !== 1)
}

function exactIds(rows: Array<{ id: string }>, expected: string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockManagedTranscriptRows(
  transaction: Prisma.TransactionClient,
  plan: ManagedTranscriptProvenanceRepairPlan,
) {
  const lockedSourceDocs = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" LIKE 'src-yt-%'
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(lockedSourceDocs, plan.lockSet.sourceDocIds)) {
    throw new Error('Managed transcript SourceDoc set changed after planning; no rows updated')
  }

  const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Document"
    WHERE "id" IN (${Prisma.join(plan.lockSet.documentIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedDocuments, plan.lockSet.documentIds)) {
    throw new Error('Managed transcript Document bindings changed after planning; no rows updated')
  }

  const lockedSourceCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceCitation"
    WHERE "id" IN (${Prisma.join(plan.lockSet.sourceCitationIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedSourceCitations, plan.lockSet.sourceCitationIds)) {
    throw new Error('Managed transcript SourceCitation bindings changed after planning; no rows updated')
  }

  const lockedFieldCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE "id" IN (${Prisma.join(plan.lockSet.fieldCitationIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedFieldCitations, plan.lockSet.fieldCitationIds)) {
    throw new Error('Managed transcript FieldCitation bindings changed after planning; no rows updated')
  }

  const lockedLibraryRows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "LibraryAnalysisRecord"
    WHERE "id" IN (${Prisma.join(plan.lockSet.libraryAnalysisRecordIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedLibraryRows, plan.lockSet.libraryAnalysisRecordIds)) {
    throw new Error('Managed transcript LibraryAnalysisRecord bindings changed after planning; no rows updated')
  }
}

async function applyManagedTranscriptUpdate(
  transaction: Prisma.TransactionClient,
  update: ManagedTranscriptProvenanceUpdate,
) {
  const result = await transaction.sourceDoc.updateMany({
    where: sourceDocCasWhere(update.expectedSourceDoc),
    data: { provenanceType: update.targetProvenanceType },
  })
  if (result.count !== 1) {
    throw new Error(`Concurrent managed transcript SourceDoc CAS conflict: ${update.id}; no rows updated`)
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

  const managedSourceDocIds = loadManagedTranscriptSourceDocIds()
  validateManagedTranscriptSourceDocIds(managedSourceDocIds)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectManagedTranscriptProvenance(prisma, managedSourceDocIds)
    const digest = managedTranscriptProvenancePlanSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('Managed transcript provenance conflicts detected; refusing mutation')
    }
    const preflightMismatches = await findSourceDocCasPreflightMismatches(prisma, plan)
    if (preflightMismatches.length > 0) {
      throw new Error(
        `Managed transcript SourceDoc CAS preflight mismatch: ${preflightMismatches.map(row => row.id).join(', ')}`,
      )
    }
    console.log(
      `CAS preflight: ${plan.updates.length}/${plan.updates.length} exact full SourceDoc snapshots matched`,
    )

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`,
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
      await lockManagedTranscriptRows(transaction, plan)

      const lockedPlan = await inspectManagedTranscriptProvenance(transaction, managedSourceDocIds)
      const lockedDigest = managedTranscriptProvenancePlanSha256(lockedPlan)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent managed transcript dependency drift detected; no rows updated')
      }

      for (const update of lockedPlan.updates) {
        await applyManagedTranscriptUpdate(transaction, update)
      }

      const afterPlan = await inspectManagedTranscriptProvenance(transaction, managedSourceDocIds)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.updates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT ||
        afterPlan.preservedDependencyStateSha256 !== lockedPlan.preservedDependencyStateSha256
      ) {
        throw new Error('Post-apply managed transcript state violated the reviewed provenance-only contract; no rows updated')
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(
      `Reviewed managed transcript provenance repair applied: ${applied} SourceDoc row(s); SourceCitation and LibraryAnalysisRecord states preserved`,
    )
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Managed transcript provenance repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'Managed transcript provenance repair failed')
    process.exitCode = 1
  })
}
