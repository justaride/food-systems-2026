import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'
import {
  REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS,
  SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS,
  buildSourceDocBibliographicRepairPlan,
  sourceDocBibliographicRepairPlanContract,
  validateReviewedSourceDocBibliographicRepairs,
  validateSourceDocBibliographicSeedTargets,
  type NormalizedSourceCitationBibliographicSnapshot,
  type NormalizedSourceDocBibliographicSnapshot,
  type SourceDocBibliographicRepairPlan,
  type SourceDocBibliographicRepairUpdate,
} from '../src/lib/citations/source-doc-bibliographic-repair'

const APPLY_ACK = 'APPLY_REVIEWED_SLU_BIBLIOGRAPHIC_REPAIR'
const ADVISORY_LOCK_KEY = 'foodsystems:source-doc-bibliographic-repair:slu:v1'

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
  fieldCitations: {
    select: fieldCitationSelect,
    orderBy: { id: 'asc' },
  },
} satisfies Prisma.SourceCitationSelect

type BibliographicClient = Pick<PrismaClient, 'sourceDoc' | 'sourceCitation'>

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

async function inspectSourceDocBibliography(client: BibliographicClient) {
  const [sourceDocs, citations] = await Promise.all([
    client.sourceDoc.findMany({
      where: { id: { in: [...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS] } },
      select: sourceDocSelect,
    }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { sourceDocId: { in: [...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS] } },
          {
            fieldCitations: {
              some: {
                entityType: 'SourceDoc',
                entityId: { in: [...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS] },
              },
            },
          },
        ],
      },
      select: sourceCitationSelect,
    }),
  ])
  return buildSourceDocBibliographicRepairPlan(sourceDocs, citations)
}

function planSha256(plan: SourceDocBibliographicRepairPlan) {
  return createHash('sha256')
    .update(JSON.stringify(sourceDocBibliographicRepairPlanContract(plan)))
    .digest('hex')
}

function printPlan(plan: SourceDocBibliographicRepairPlan, digest: string) {
  console.log('Reviewed SLU SourceDoc/SourceCitation bibliographic repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Reviewed manifest SHA-256: ${plan.reviewedManifestSha256}`)
  console.log(`Pairs: ${plan.summary.total}; pending: ${plan.summary.pending}; already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`)
  for (const update of plan.updates) {
    console.log(`Pending ${update.sourceDocId} / ${update.citationId}`)
    console.log(`  SourceDoc: ${update.expectedSourceDoc.title} -> ${update.targetSourceDoc.title}`)
    console.log(`  Locator: ${update.expectedSourceDoc.url ?? 'null'} -> ${update.targetSourceDoc.url}`)
    console.log(`  Citation: ${update.expectedCitation.sourceClass}/${update.expectedCitation.citationReadiness} -> ${update.targetCitation.sourceClass}/${update.targetCitation.citationReadiness}`)
    console.log(`  Citation CAS updatedAt: ${update.expectedCitation.updatedAt}`)
  }
  for (const id of plan.alreadyAppliedIds) console.log(`Already applied ${id}`)
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.sourceDocId}/${conflict.code}: ${conflict.detail}`)
  }
}

function dateTime(value: string | null) {
  return value ? new Date(value) : null
}

function sourceDocCasWhere(
  expected: NormalizedSourceDocBibliographicSnapshot,
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

function sourceCitationCasWhere(
  expected: NormalizedSourceCitationBibliographicSnapshot,
): Prisma.SourceCitationWhereInput {
  return {
    id: expected.id,
    sourceClass: expected.sourceClass as never,
    citationReadiness: expected.citationReadiness as never,
    verificationStatus: expected.verificationStatus as never,
    citationText: expected.citationText,
    title: expected.title,
    publisher: expected.publisher,
    author: expected.author,
    year: expected.year,
    url: expected.url,
    archivedUrl: expected.archivedUrl,
    localPath: expected.localPath,
    fileHash: expected.fileHash,
    contentHash: expected.contentHash,
    hashAlgorithm: expected.hashAlgorithm,
    pageRef: expected.pageRef,
    quote: expected.quote,
    accessedAt: dateTime(expected.accessedAt),
    captureMethod: expected.captureMethod,
    verifiedAt: dateTime(expected.verifiedAt),
    verifiedBy: expected.verifiedBy,
    confidence: expected.confidence,
    notes: expected.notes,
    documentId: expected.documentId,
    sourceDocId: expected.sourceDocId,
    createdAt: new Date(expected.createdAt),
    updatedAt: new Date(expected.updatedAt),
  }
}

async function findCasPreflightMismatches(
  client: BibliographicClient,
  plan: SourceDocBibliographicRepairPlan,
) {
  const checks = await Promise.all(plan.updates.flatMap(update => [
    client.sourceDoc.count({ where: sourceDocCasWhere(update.expectedSourceDoc) })
      .then(count => ({ key: `${update.sourceDocId}/SourceDoc`, count })),
    client.sourceCitation.count({ where: sourceCitationCasWhere(update.expectedCitation) })
      .then(count => ({ key: `${update.citationId}/SourceCitation`, count })),
  ]))
  return checks.filter(check => check.count !== 1)
}

function exactIds(rows: Array<{ id: string }>, expected: string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const sourceDocIds = [...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS]
  const citationIds = REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => repair.citationId)
  const fieldCitationIds = REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS
    .flatMap(repair => repair.before.citation.fieldCitations.map(field => field.id))

  const lockedSources = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" IN (${Prisma.join(sourceDocIds)})
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(lockedSources, sourceDocIds)) {
    throw new Error('Reviewed SourceDoc rows changed after planning; no rows updated')
  }

  const lockedCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT citation."id" FROM "SourceCitation" citation
    WHERE citation."sourceDocId" IN (${Prisma.join(sourceDocIds)})
      OR EXISTS (
        SELECT 1 FROM "FieldCitation" field_citation
        WHERE field_citation."citationId" = citation."id"
          AND field_citation."entityType" = 'SourceDoc'
          AND field_citation."entityId" IN (${Prisma.join(sourceDocIds)})
      )
    ORDER BY citation."id" FOR UPDATE
  `)
  if (!exactIds(lockedCitations, citationIds)) {
    throw new Error('Reviewed SourceCitation bindings changed after planning; no rows updated')
  }

  const lockedFieldCitations = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "FieldCitation"
    WHERE "citationId" IN (${Prisma.join(citationIds)})
    ORDER BY "id" FOR SHARE
  `)
  if (!exactIds(lockedFieldCitations, fieldCitationIds)) {
    throw new Error('Preserved FieldCitation claim bindings changed after planning; no rows updated')
  }
}

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  update: SourceDocBibliographicRepairUpdate,
) {
  const sourceResult = await transaction.sourceDoc.updateMany({
    where: sourceDocCasWhere(update.expectedSourceDoc),
    data: {
      title: update.targetSourceDoc.title,
      author: update.targetSourceDoc.author,
      url: update.targetSourceDoc.url,
      publisher: update.targetSourceDoc.publisher,
      provenanceType: update.targetSourceDoc.provenanceType,
      accessedAt: dateTime(update.targetSourceDoc.accessedAt),
    },
  })
  if (sourceResult.count !== 1) {
    throw new Error(`Concurrent SourceDoc CAS conflict: ${update.sourceDocId}; no rows updated`)
  }

  const citationResult = await transaction.sourceCitation.updateMany({
    where: sourceCitationCasWhere(update.expectedCitation),
    data: {
      sourceClass: update.targetCitation.sourceClass as never,
      citationReadiness: update.targetCitation.citationReadiness as never,
      citationText: update.targetCitation.citationText,
      title: update.targetCitation.title,
      publisher: update.targetCitation.publisher,
      author: update.targetCitation.author,
      year: update.targetCitation.year,
      url: update.targetCitation.url,
      accessedAt: dateTime(update.targetCitation.accessedAt),
    },
  })
  if (citationResult.count !== 1) {
    throw new Error(`Concurrent SourceCitation CAS conflict: ${update.citationId}; no rows updated`)
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

  validateReviewedSourceDocBibliographicRepairs()
  validateSourceDocBibliographicSeedTargets(sources)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectSourceDocBibliography(prisma)
    const digest = planSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('Reviewed SLU bibliographic conflicts detected; refusing mutation')
    }
    const preflightMismatches = await findCasPreflightMismatches(prisma, plan)
    if (preflightMismatches.length > 0) {
      throw new Error(`Bibliographic CAS preflight mismatch: ${preflightMismatches.map(row => row.key).join(', ')}`)
    }
    console.log(`CAS preflight: ${plan.updates.length * 2}/${plan.updates.length * 2} exact SourceDoc/SourceCitation snapshots matched`)

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

      const lockedPlan = await inspectSourceDocBibliography(transaction)
      const lockedDigest = planSha256(lockedPlan)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent SourceDoc, SourceCitation, or FieldCitation drift detected; no rows updated')
      }
      for (const update of lockedPlan.updates) await applyUpdate(transaction, update)

      const afterPlan = await inspectSourceDocBibliography(transaction)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.updates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS.length
      ) {
        throw new Error('Post-apply bibliographic state did not match the reviewed after-snapshot; no rows updated')
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Reviewed SLU bibliographic repair applied: ${applied} SourceDoc/SourceCitation pair(s)`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Reviewed SLU bibliographic repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'Reviewed SLU bibliographic repair failed')
    process.exitCode = 1
  })
}
