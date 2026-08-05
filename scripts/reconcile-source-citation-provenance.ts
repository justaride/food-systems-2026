import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { loadManagedTranscriptSourceDocIds } from '../src/lib/citations/academic-corpus-identity'
import {
  MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT,
  MANAGED_TRANSCRIPT_PROVENANCE_TARGET,
  validateManagedTranscriptSourceDocIds,
} from '../src/lib/citations/managed-transcript-provenance-repair'
import { REVIEWED_PROVENANCE_MANIFEST } from '../src/lib/citations/reviewed-provenance-batch'
import { REVIEWED_PROVENANCE_COMPLETION_MANIFEST } from '../src/lib/citations/reviewed-provenance-completion'
import { buildSourceDocProvenanceRepairs } from './apply-source-doc-provenance'
import {
  REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT,
  buildReviewedSourceDocProvenanceRegistry,
  buildSourceCitationProvenanceReconciliationPlan,
  sourceCitationProvenancePlanContract,
  type ReviewedSourceDocProvenance,
  type SourceCitationProvenanceReconciliationPlan,
} from '../src/lib/citations/source-citation-provenance-reconciliation'

const APPLY_ACK = 'APPLY_REVIEWED_SOURCE_CITATION_PROVENANCE_RECONCILIATION'
const ADVISORY_LOCK_KEY = 'foodsystems:source-citation-provenance-reconciliation:v1'

const sourceDocSelect = {
  id: true,
  provenanceType: true,
  url: true,
  archivedUrl: true,
  documentId: true,
  accessedAt: true,
} satisfies Prisma.SourceDocSelect

const sourceCitationSelect = {
  id: true,
  sourceDocId: true,
  sourceClass: true,
  citationReadiness: true,
  verificationStatus: true,
  citationText: true,
  url: true,
  archivedUrl: true,
  localPath: true,
  documentId: true,
  accessedAt: true,
  verifiedAt: true,
  updatedAt: true,
  fieldCitations: {
    where: { entityType: 'SourceDoc' },
    select: {
      id: true,
      entityType: true,
      entityId: true,
    },
  },
  _count: {
    select: { fieldCitations: true },
  },
} satisfies Prisma.SourceCitationSelect

type ReconciliationClient = Pick<PrismaClient, 'sourceDoc' | 'sourceCitation'>

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

export function reviewedSourceManifest(): ReviewedSourceDocProvenance[] {
  const legacy = buildSourceDocProvenanceRepairs().map(repair => ({
    id: repair.id,
    provenanceType: repair.provenanceType,
  }))
  const historical = REVIEWED_PROVENANCE_MANIFEST
    .filter(
      (entry): entry is typeof entry & { entity: 'SourceDoc' } =>
        entry.entity === 'SourceDoc',
    )
    .map(entry => ({
      id: entry.id,
      provenanceType: entry.targetType as ReviewedSourceDocProvenance['provenanceType'],
    }))
  const completion = REVIEWED_PROVENANCE_COMPLETION_MANIFEST
    .filter(entry => entry.entity === 'SourceDoc')
    .map(entry => ({
      id: entry.id,
      provenanceType: entry.targetType as ReviewedSourceDocProvenance['provenanceType'],
    }))
  const managedTranscriptIds = validateManagedTranscriptSourceDocIds(
    loadManagedTranscriptSourceDocIds(),
  )
  const managedRuntime = managedTranscriptIds.map(id => ({
    id,
    provenanceType: MANAGED_TRANSCRIPT_PROVENANCE_TARGET,
  }))

  const registry = buildReviewedSourceDocProvenanceRegistry([
    { name: 'legacy_seed', expectedCount: 44, rows: legacy },
    { name: 'historical_batch', expectedCount: 111, rows: historical },
    { name: 'completion_batch', expectedCount: 25, rows: completion },
    {
      name: 'managed_runtime_transcripts',
      expectedCount: MANAGED_TRANSCRIPT_PROVENANCE_EXPECTED_COUNT,
      rows: managedRuntime,
    },
  ])
  if (
    registry.length !==
    REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT
  ) {
    throw new Error('Reviewed SourceDoc provenance registry count drifted')
  }
  return registry
}

async function inspectSourceCitationProvenance(
  client: ReconciliationClient,
  reviewedSources: ReviewedSourceDocProvenance[],
) {
  const [sourceDocs, citationRows] = await Promise.all([
    client.sourceDoc.findMany({ select: sourceDocSelect }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { sourceDocId: { not: null } },
          { fieldCitations: { some: { entityType: 'SourceDoc' } } },
        ],
      },
      select: sourceCitationSelect,
    }),
  ])

  const citations = citationRows.map(row => ({
    ...row,
    fieldCitationCount: row._count.fieldCitations,
  }))
  return buildSourceCitationProvenanceReconciliationPlan(
    sourceDocs,
    citations,
    reviewedSources,
  )
}

function planSha256(
  plan: SourceCitationProvenanceReconciliationPlan,
  reviewedSources: ReviewedSourceDocProvenance[],
) {
  const contract = {
    reviewedSources: [...reviewedSources].sort((left, right) => left.id.localeCompare(right.id)),
    plan: sourceCitationProvenancePlanContract(plan),
  }
  return createHash('sha256').update(JSON.stringify(contract)).digest('hex')
}

function printPlan(
  plan: SourceCitationProvenanceReconciliationPlan,
  digest: string,
  details: boolean,
) {
  const { summary } = plan
  console.log('SourceCitation provenance reconciliation plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`SourceDocs scanned: ${summary.sourceDocsScanned}`)
  console.log(`Reviewed SourceDocs: ${summary.reviewedSourceDocsPresent}/${summary.reviewedSourceDocsExpected}`)
  console.log(`Linked unknown SourceDocs: ${summary.linkedUnknownSourceDocs}`)
  console.log(`SourceCitations scanned: ${summary.sourceCitationsScanned}`)
  console.log(`SourceDoc FieldCitations scanned: ${summary.sourceDocFieldCitationsScanned}`)
  console.log(`Updates: ${summary.updates}; unchanged: ${summary.unchanged}; conflicts: ${summary.conflicts}`)
  console.log(`Known-source citation updates: ${summary.reviewedCitationUpdates}`)
  console.log(`Unknown fail-closed citation updates: ${summary.unknownFailClosedCitationUpdates}`)
  console.log(`Source-class changes: ${summary.sourceClassChanges}`)
  console.log(`Readiness downgrades: ${summary.readinessDowngrades}`)
  console.log(`Impacted SourceDoc FieldCitations: ${summary.impactedSourceDocFieldCitations}`)
  console.log(`Impacted FieldCitations (all entity types): ${summary.impactedFieldCitations}`)

  for (const [provenance, count] of Object.entries(summary.byProvenance)) {
    const fieldCount = summary.byProvenanceSourceDocFieldCitations[provenance] ?? 0
    console.log(`Provenance ${provenance}: ${count} citation(s), ${fieldCount} SourceDoc FieldCitation link(s)`)
  }
  for (const [transition, count] of Object.entries(summary.byTransition)) {
    console.log(`Transition ${transition}: ${count}`)
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.code}: ${conflict.detail}`)
  }
  if (details) {
    for (const update of plan.updates) {
      console.log(`Update ${update.citationId} (${update.sourceDocId}): ${update.expectedSourceClass}/${update.expectedCitationReadiness} -> ${update.targetSourceClass}/${update.targetCitationReadiness} [${update.reasons.join(', ')}]`)
    }
  }
}

async function lockPlanRows(
  transaction: Prisma.TransactionClient,
  plan: SourceCitationProvenanceReconciliationPlan,
) {
  const sourceDocIds = [...new Set(plan.updates.map(update => update.sourceDocId))].sort()
  const citationIds = [...new Set(plan.updates.map(update => update.citationId))].sort()
  const fieldCitationIds = [...new Set(plan.updates.flatMap(update => update.sourceDocFieldCitationIds))].sort()

  if (sourceDocIds.length > 0) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "SourceDoc"
      WHERE "id" IN (${Prisma.join(sourceDocIds)})
      ORDER BY "id" FOR SHARE
    `)
    if (rows.length !== sourceDocIds.length) {
      throw new Error('SourceDoc rows changed after planning; no rows updated')
    }
  }

  if (citationIds.length > 0) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "SourceCitation"
      WHERE "id" IN (${Prisma.join(citationIds)})
      ORDER BY "id" FOR UPDATE
    `)
    if (rows.length !== citationIds.length) {
      throw new Error('SourceCitation rows changed after planning; no rows updated')
    }
  }

  if (fieldCitationIds.length > 0) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
      SELECT "id" FROM "FieldCitation"
      WHERE "id" IN (${Prisma.join(fieldCitationIds)})
      ORDER BY "id" FOR SHARE
    `)
    if (rows.length !== fieldCitationIds.length) {
      throw new Error('SourceDoc FieldCitation links changed after planning; no rows updated')
    }
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

  const reviewedSources = reviewedSourceManifest()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectSourceCitationProvenance(prisma, reviewedSources)
    const digest = planSha256(plan, reviewedSources)
    printPlan(plan, digest, args.details)
    if (plan.conflicts.length > 0) {
      throw new Error('SourceCitation provenance conflicts detected; refusing mutation')
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
      await lockPlanRows(transaction, plan)

      const lockedPlan = await inspectSourceCitationProvenance(transaction, reviewedSources)
      const lockedDigest = planSha256(lockedPlan, reviewedSources)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent SourceDoc, SourceCitation, or FieldCitation drift detected; no rows updated')
      }

      for (const update of lockedPlan.updates) {
        const result = await transaction.sourceCitation.updateMany({
          where: {
            id: update.citationId,
            sourceDocId: update.expectedDirectSourceDocId,
            sourceClass: update.expectedSourceClass as never,
            citationReadiness: update.expectedCitationReadiness as never,
            updatedAt: new Date(update.expectedUpdatedAt),
          },
          data: {
            sourceClass: update.targetSourceClass as never,
            citationReadiness: update.targetCitationReadiness as never,
          },
        })
        if (result.count !== 1) {
          throw new Error(`Concurrent SourceCitation CAS conflict: ${update.citationId}; no rows updated`)
        }
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`SourceCitation provenance reconciliation applied: ${applied} row(s)`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      throw new Error(
        'SourceCitation provenance reconciliation conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Rerun dry-run.',
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
    console.error(error instanceof Error ? error.message : 'SourceCitation provenance reconciliation failed')
    process.exitCode = 1
  })
}
