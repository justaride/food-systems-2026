import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY_ACK = 'APPLY_REVIEWED_ORPHAN_DOCUMENT_CITATION_RECONCILIATION'

type Client = PrismaClient | Prisma.TransactionClient

type OrphanRow = {
  id: string
  citationId: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
  createdAt: Date
  sourceDocumentId: string | null
  localPath: string | null
  url: string | null
}

type DocumentLocator = {
  id: string
  slug: string
  filePath: string | null
  url: string | null
}

export type ReplacementDecision =
  | { kind: 'replace'; replacementId: string; basis: 'source_document_id' | 'local_path' | 'url' | 'same_missing_document_cohort' }
  | { kind: 'unresolved'; reason: 'no_current_document_match' }
  | { kind: 'conflict'; reason: string }

type ReconciliationPlan = Awaited<ReturnType<typeof buildPlan>>

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
  if (argv.includes('--apply') && argv.includes('--dry-run')) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  return {
    apply: argv.includes('--apply'),
    ack: argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find(argument => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    )
  }
  return value
}

function sha256(value: unknown) {
  return createHash('sha256').update(JSON.stringify(canonicalize(value))).digest('hex')
}

function addToIndex(index: Map<string, DocumentLocator[]>, key: string | null, row: DocumentLocator) {
  if (!key) return
  const current = index.get(key) ?? []
  current.push(row)
  index.set(key, current)
}

export function chooseReplacement(
  orphan: Pick<OrphanRow, 'sourceDocumentId' | 'localPath' | 'url'>,
  documents: DocumentLocator[],
): ReplacementDecision {
  const byId = new Map(documents.map(row => [row.id, row]))
  if (orphan.sourceDocumentId && byId.has(orphan.sourceDocumentId)) {
    return { kind: 'replace', replacementId: orphan.sourceDocumentId, basis: 'source_document_id' }
  }

  const byPath = new Map<string, DocumentLocator[]>()
  const byUrl = new Map<string, DocumentLocator[]>()
  for (const document of documents) {
    addToIndex(byPath, document.filePath, document)
    addToIndex(byUrl, document.url, document)
  }

  const pathMatches = orphan.localPath ? (byPath.get(orphan.localPath) ?? []) : []
  if (pathMatches.length === 1) {
    return { kind: 'replace', replacementId: pathMatches[0]!.id, basis: 'local_path' }
  }
  if (pathMatches.length > 1) {
    return { kind: 'conflict', reason: `localPath matches ${pathMatches.length} Documents` }
  }

  const urlMatches = orphan.url ? (byUrl.get(orphan.url) ?? []) : []
  if (urlMatches.length === 1) {
    return { kind: 'replace', replacementId: urlMatches[0]!.id, basis: 'url' }
  }
  if (urlMatches.length > 1) {
    return { kind: 'conflict', reason: `url matches ${urlMatches.length} Documents` }
  }
  return { kind: 'unresolved', reason: 'no_current_document_match' }
}

export function resolveReplacementCohorts(
  orphans: Array<Pick<OrphanRow, 'id' | 'entityId'>>,
  initial: Map<string, ReplacementDecision>,
) {
  const replacementIdsByMissingDocument = new Map<string, Set<string>>()
  for (const orphan of orphans) {
    const decision = initial.get(orphan.id)
    if (decision?.kind !== 'replace') continue
    const replacements = replacementIdsByMissingDocument.get(orphan.entityId) ?? new Set<string>()
    replacements.add(decision.replacementId)
    replacementIdsByMissingDocument.set(orphan.entityId, replacements)
  }

  return new Map(orphans.map((orphan) => {
    const decision = initial.get(orphan.id)
    if (!decision) throw new Error(`Missing initial replacement decision for ${orphan.id}`)
    const cohortReplacements = replacementIdsByMissingDocument.get(orphan.entityId) ?? new Set<string>()
    if (cohortReplacements.size > 1) {
      return [orphan.id, {
        kind: 'conflict',
        reason: `same missing Document maps to ${cohortReplacements.size} current Documents`,
      } satisfies ReplacementDecision]
    }
    if (decision.kind !== 'replace' && cohortReplacements.size === 1) {
      return [orphan.id, {
        kind: 'replace',
        replacementId: [...cohortReplacements][0]!,
        basis: 'same_missing_document_cohort',
      } satisfies ReplacementDecision]
    }
    return [orphan.id, decision]
  }))
}

function citationTuple(row: { citationId: string; entityId: string; fieldPath: string | null }) {
  return `${row.citationId}\u0000${row.entityId}\u0000${row.fieldPath ?? '\u0000'}`
}

async function inspectOrphans(client: Client): Promise<OrphanRow[]> {
  return client.$queryRaw<OrphanRow[]>`
    SELECT
      field_citation."id",
      field_citation."citationId",
      field_citation."entityId",
      field_citation."fieldPath",
      field_citation."claimText",
      field_citation."confidence",
      field_citation."createdAt",
      source_citation."documentId" AS "sourceDocumentId",
      source_citation."localPath",
      source_citation."url"
    FROM "FieldCitation" field_citation
    INNER JOIN "SourceCitation" source_citation
      ON source_citation."id" = field_citation."citationId"
    LEFT JOIN "Document" document
      ON document."id" = field_citation."entityId"
    WHERE field_citation."entityType" = 'Document'
      AND document."id" IS NULL
    ORDER BY field_citation."id"
  `
}

async function buildPlan(client: Client) {
  const [orphans, documents] = await Promise.all([
    inspectOrphans(client),
    client.document.findMany({
      select: { id: true, slug: true, filePath: true, url: true },
      orderBy: { id: 'asc' },
    }),
  ])
  const citationIds = [...new Set(orphans.map(row => row.citationId))]
  const relatedBindings = citationIds.length === 0
    ? []
    : await client.fieldCitation.findMany({
      where: { citationId: { in: citationIds }, entityType: 'Document' },
      select: { id: true, citationId: true, entityId: true, fieldPath: true },
      orderBy: { id: 'asc' },
    })
  const existingTuples = new Map(relatedBindings.map(row => [citationTuple(row), row.id]))

  const updates: Array<{ before: OrphanRow; replacement: DocumentLocator; basis: string }> = []
  const deletions: Array<{ before: OrphanRow; reason: string }> = []
  const conflicts: string[] = []

  const initialDecisions = new Map(orphans.map(orphan => [
    orphan.id,
    chooseReplacement(orphan, documents),
  ]))
  const decisions = resolveReplacementCohorts(orphans, initialDecisions)

  for (const orphan of orphans) {
    const decision = decisions.get(orphan.id)
    if (!decision) throw new Error(`Missing replacement decision for ${orphan.id}`)
    if (decision.kind === 'conflict') {
      conflicts.push(`${orphan.id}: ${decision.reason}`)
      continue
    }
    if (decision.kind === 'unresolved') {
      deletions.push({ before: orphan, reason: decision.reason })
      continue
    }
    const duplicateId = existingTuples.get(citationTuple({
      citationId: orphan.citationId,
      entityId: decision.replacementId,
      fieldPath: orphan.fieldPath,
    }))
    if (duplicateId && duplicateId !== orphan.id) {
      deletions.push({ before: orphan, reason: `duplicate_of_current_binding:${duplicateId}` })
      continue
    }
    const replacement = documents.find(row => row.id === decision.replacementId)
    if (!replacement) throw new Error(`Replacement ${decision.replacementId} disappeared from inspection`)
    updates.push({ before: orphan, replacement, basis: decision.basis })
  }

  return {
    version: 1,
    mode: 'reviewed-retarget-or-dispose-invalid-binding' as const,
    invariant: 'SourceCitation rows are never mutated or deleted',
    conflicts: conflicts.sort(),
    updates,
    deletions,
  }
}

function summarize(plan: ReconciliationPlan) {
  const deletionReasons = Object.fromEntries(
    [...new Set(plan.deletions.map(row => row.reason))]
      .sort()
      .map(reason => [reason, plan.deletions.filter(row => row.reason === reason).length]),
  )
  return {
    conflicts: plan.conflicts.length,
    retargetedBindings: plan.updates.length,
    disposedInvalidBindings: plan.deletions.length,
    deletionReasons,
  }
}

function fieldCitationCasWhere(row: OrphanRow) {
  return {
    id: row.id,
    citationId: row.citationId,
    entityType: 'Document',
    entityId: row.entityId,
    fieldPath: row.fieldPath,
    claimText: row.claimText,
    confidence: row.confidence,
    createdAt: row.createdAt,
  }
}

async function applyPlan(transaction: Prisma.TransactionClient, plan: ReconciliationPlan) {
  for (const update of plan.updates) {
    const result = await transaction.fieldCitation.updateMany({
      where: fieldCitationCasWhere(update.before),
      data: { entityId: update.replacement.id },
    })
    if (result.count !== 1) throw new Error(`FieldCitation ${update.before.id} changed after review`)
  }
  for (const deletion of plan.deletions) {
    const result = await transaction.fieldCitation.deleteMany({
      where: fieldCitationCasWhere(deletion.before),
    })
    if (result.count !== 1) throw new Error(`FieldCitation ${deletion.before.id} changed after review`)
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error('--apply requires --plan-sha256=<64 lowercase hex> from the reviewed dry run')
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await buildPlan(client)
    const digest = sha256(plan)
    console.log('Orphan Document FieldCitation reconciliation')
    console.log(`Plan SHA-256: ${digest}`)
    console.log(JSON.stringify(summarize(plan), null, 2))
    for (const conflict of plan.conflicts) console.log(`CONFLICT ${conflict}`)
    if (plan.conflicts.length > 0) throw new Error('Ambiguous replacements detected; refusing mutation')
    if (!args.apply) {
      console.log(
        `Dry run only. Apply after review with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current plan differs from --plan-sha256; rerun and review')
    }

    await client.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe(
        'LOCK TABLE "FieldCitation", "SourceCitation", "Document" IN SHARE ROW EXCLUSIVE MODE',
      )
      const lockedPlan = await buildPlan(transaction)
      if (lockedPlan.conflicts.length > 0 || sha256(lockedPlan) !== args.expectedPlanSha256) {
        throw new Error('Citation state changed after plan review; no rows were changed')
      }
      await applyPlan(transaction, lockedPlan)
      const remaining = await inspectOrphans(transaction)
      if (remaining.length !== 0) {
        throw new Error(`${remaining.length} orphan Document FieldCitations remain after reconciliation`)
      }
    }, { isolationLevel: 'Serializable', timeout: 120_000 })

    console.log('Orphan Document FieldCitation reconciliation applied and verified')
  } finally {
    await client.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
