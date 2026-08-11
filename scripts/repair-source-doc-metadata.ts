import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'
import {
  SOURCE_DOC_METADATA_REPAIR_IDS,
  buildReviewedSourceDocMetadataTargets,
  buildSourceDocMetadataRepairPlan,
  sourceDocMetadataRepairPlanContract,
  type ReviewedSourceDocMetadataTarget,
  type SourceDocMetadataRepairPlan,
  type SourceDocMetadataRepairUpdate,
} from '../src/lib/citations/source-doc-metadata-repair'

const APPLY_ACK = 'APPLY_REVIEWED_SOURCE_DOC_METADATA_REPAIR'
const ADVISORY_LOCK_KEY = 'foodsystems:source-doc-metadata-repair:v1'

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
  doi: true,
  publisher: true,
  provenanceType: true,
  accessedAt: true,
  archivedUrl: true,
  isDuplicate: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect

type SourceDocMetadataClient = Pick<PrismaClient, 'sourceDoc'>

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

async function inspectSourceDocMetadata(
  client: SourceDocMetadataClient,
  targets: ReviewedSourceDocMetadataTarget[],
) {
  const rows = await client.sourceDoc.findMany({
    where: { id: { in: [...SOURCE_DOC_METADATA_REPAIR_IDS] } },
    select: sourceDocSelect,
  })
  return buildSourceDocMetadataRepairPlan(rows, targets)
}

function planSha256(plan: SourceDocMetadataRepairPlan) {
  return createHash('sha256')
    .update(JSON.stringify(sourceDocMetadataRepairPlanContract(plan)))
    .digest('hex')
}

function printPlan(plan: SourceDocMetadataRepairPlan, digest: string) {
  console.log('Reviewed SourceDoc metadata repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Pinned before batch SHA-256: ${plan.pinnedBeforeBatchSha256}`)
  console.log(`Current metadata batch SHA-256: ${plan.currentMetadataBatchSha256 ?? 'incomplete'}`)
  console.log(`Reviewed after batch SHA-256: ${plan.targetAfterBatchSha256}`)
  console.log(`Protected identity SHA-256: ${plan.protectedIdentitySha256}`)
  console.log(`Rows: ${plan.summary.total}; pending: ${plan.summary.pending}; already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`)
  for (const update of plan.updates) {
    console.log(`Pending ${update.id}: ${update.changedFields.join(', ')}`)
  }
  for (const [field, count] of Object.entries(plan.summary.changedFieldCounts)) {
    console.log(`Changed field ${field}: ${count}`)
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}/${conflict.code}: ${conflict.detail}`)
  }
}

function dateWhereValue(value: string | null) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null
}

function sourceDocCasWhere(
  update: SourceDocMetadataRepairUpdate,
): Prisma.SourceDocWhereInput {
  return {
    id: update.id,
    author: update.expected.author,
    year: update.expected.year,
    sourceType: update.expected.sourceType,
    description: update.expected.description,
    relevance: update.expected.relevance,
    publisher: update.expected.publisher,
    filename: update.protectedIdentity.filename,
    title: update.protectedIdentity.title,
    url: update.protectedIdentity.url,
    doi: update.protectedIdentity.doi,
    accessedAt: dateWhereValue(update.protectedIdentity.accessedAt),
    archivedUrl: update.protectedIdentity.archivedUrl,
    provenanceType: update.protectedIdentity.provenanceType,
    isDuplicate: update.protectedIdentity.isDuplicate,
    documentId: update.expectedDocumentId,
  }
}

async function findCasPreflightMismatches(
  client: SourceDocMetadataClient,
  plan: SourceDocMetadataRepairPlan,
) {
  const checks = await Promise.all(plan.updates.map(async update => ({
    id: update.id,
    count: await client.sourceDoc.count({ where: sourceDocCasWhere(update) }),
  })))
  return checks.filter(check => check.count !== 1)
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

  const targets = buildReviewedSourceDocMetadataTargets(sources)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectSourceDocMetadata(prisma, targets)
    const digest = planSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('SourceDoc metadata conflicts detected; refusing mutation')
    }
    const casPreflightMismatches = await findCasPreflightMismatches(prisma, plan)
    if (casPreflightMismatches.length > 0) {
      throw new Error(
        `SourceDoc metadata CAS preflight mismatch: ${casPreflightMismatches.map(row => row.id).join(', ')}`,
      )
    }
    console.log(`CAS preflight: ${plan.updates.length}/${plan.updates.length} exact row snapshots matched`)
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
      const lockedRows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "SourceDoc"
        WHERE "id" IN (${Prisma.join([...SOURCE_DOC_METADATA_REPAIR_IDS])})
        ORDER BY "id" FOR UPDATE
      `)
      if (lockedRows.length !== SOURCE_DOC_METADATA_REPAIR_IDS.length) {
        throw new Error('SourceDoc metadata targets changed after planning; no rows updated')
      }

      const lockedPlan = await inspectSourceDocMetadata(transaction, targets)
      const lockedDigest = planSha256(lockedPlan)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent SourceDoc metadata drift detected; no rows updated')
      }

      for (const update of lockedPlan.updates) {
        const result = await transaction.sourceDoc.updateMany({
          where: sourceDocCasWhere(update),
          data: {
            author: update.target.author,
            year: update.target.year,
            sourceType: update.target.sourceType,
            description: update.target.description,
            relevance: update.target.relevance,
            publisher: update.target.publisher,
          },
        })
        if (result.count !== 1) {
          throw new Error(`Concurrent SourceDoc metadata CAS conflict: ${update.id}; no rows updated`)
        }
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Reviewed SourceDoc metadata repair applied: ${applied} row(s)`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `SourceDoc metadata repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'SourceDoc metadata repair failed')
    process.exitCode = 1
  })
}
