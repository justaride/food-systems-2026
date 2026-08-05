import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { buildAcademicLocatorRepairs } from './apply-academic-locator-repairs'
import {
  academicCitationLocatorMutationSignature,
  buildAcademicCitationLocatorReconciliationPlan,
  type AcademicCitationLocatorReconciliationPlan,
  type AcademicLocatorCitationSnapshot,
  type AcademicLocatorEntitySnapshot,
  type AcademicLocatorRepairContract,
} from '../src/lib/citations/academic-citation-locator-reconciliation'

const APPLY_ACK = 'APPLY_VERIFIED_ACADEMIC_CITATION_LOCATORS'
const ADVISORY_LOCK_KEY = 'foodsystems:academic-citation-locator-reconciliation:v1'

type ReconciliationClient = Prisma.TransactionClient

const sourceCitationSelect = {
  id: true,
  citationText: true,
  title: true,
  url: true,
  accessedAt: true,
  updatedAt: true,
  sourceDocId: true,
  documentId: true,
  fieldCitations: {
    select: {
      id: true,
      entityType: true,
      entityId: true,
      fieldPath: true,
    },
  },
} satisfies Prisma.SourceCitationSelect

function repairContracts(): AcademicLocatorRepairContract[] {
  return buildAcademicLocatorRepairs().map(repair => ({
    ...repair,
    alternateExpected: repair.alternateExpected
      ? [...repair.alternateExpected]
      : undefined,
  }))
}

async function loadReconciliationPlan(
  client: ReconciliationClient,
  repairs: readonly AcademicLocatorRepairContract[],
): Promise<AcademicCitationLocatorReconciliationPlan> {
  const reportIds = repairs
    .filter(repair => repair.kind === 'Report')
    .map(repair => repair.id)
  const sourceDocIds = repairs
    .filter(repair => repair.kind === 'SourceDoc')
    .map(repair => repair.id)

  const [reports, sourceDocs] = await Promise.all([
    client.report.findMany({
      where: { id: { in: reportIds } },
      select: {
        id: true,
        title: true,
        documentId: true,
        sourceUrl: true,
        accessedAt: true,
      },
    }),
    client.sourceDoc.findMany({
      where: { id: { in: sourceDocIds } },
      select: {
        id: true,
        title: true,
        documentId: true,
        url: true,
        accessedAt: true,
      },
    }),
  ])

  const entities: AcademicLocatorEntitySnapshot[] = [
    ...reports.map(report => ({
      kind: 'Report' as const,
      id: report.id,
      title: report.title,
      documentId: report.documentId,
      locator: report.sourceUrl,
      accessedAt: report.accessedAt,
    })),
    ...sourceDocs.map(source => ({
      kind: 'SourceDoc' as const,
      id: source.id,
      title: source.title,
      documentId: source.documentId,
      locator: source.url,
      accessedAt: source.accessedAt,
    })),
  ]
  const documentIds = [...new Set(
    entities
      .map(entity => entity.documentId)
      .filter((value): value is string => Boolean(value)),
  )]
  const fieldTargetConditions = repairs.map(repair => ({
    entityType: repair.kind,
    entityId: repair.id,
  }))

  const citations = await client.sourceCitation.findMany({
    where: {
      OR: [
        { fieldCitations: { some: { OR: fieldTargetConditions } } },
        { sourceDocId: { in: sourceDocIds } },
        { documentId: { in: documentIds } },
      ],
    },
    select: sourceCitationSelect,
  })

  return buildAcademicCitationLocatorReconciliationPlan(
    repairs,
    entities,
    citations as AcademicLocatorCitationSnapshot[],
  )
}

function printPlan(plan: AcademicCitationLocatorReconciliationPlan) {
  console.log('Academic citation locator reconciliation audit:')
  console.log(JSON.stringify(plan.summary, null, 2))
  for (const row of plan.auditRows.filter(candidate =>
    candidate.status !== 'already_applied' &&
    candidate.status !== 'reviewed_alternate_locator',
  )) {
    console.log(
      `${row.status}\t${row.citationId}\t${row.targetKeys.join(',') || '-'}\t${row.reason}`,
    )
  }
  if (plan.targetsWithoutCitations.length > 0) {
    console.log(`Targets without linked citations: ${plan.targetsWithoutCitations.join(', ')}`)
  }
}

async function lockReconciliationScope(
  transaction: ReconciliationClient,
  repairs: readonly AcademicLocatorRepairContract[],
  citationIds: readonly string[],
) {
  await transaction.$executeRaw`
    SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
  `

  for (const repair of repairs) {
    const rows = repair.kind === 'Report'
      ? await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "Report" WHERE "id" = ${repair.id} FOR SHARE
        `
      : await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "SourceDoc" WHERE "id" = ${repair.id} FOR SHARE
        `
    if (rows.length !== 1) throw new Error(`Target disappeared during apply: ${repair.kind}:${repair.id}`)

    await transaction.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "FieldCitation"
      WHERE "entityType" = ${repair.kind} AND "entityId" = ${repair.id}
      FOR SHARE
    `
  }

  for (const citationId of citationIds) {
    const rows = await transaction.$queryRaw<Array<{ id: string }>>`
      SELECT "id" FROM "SourceCitation" WHERE "id" = ${citationId} FOR UPDATE
    `
    if (rows.length !== 1) throw new Error(`Citation disappeared during apply: ${citationId}`)
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const ack = process.argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length)
  if (apply && ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const repairs = repairContracts()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const initialPlan = await loadReconciliationPlan(prisma, repairs)
    printPlan(initialPlan)
    if (initialPlan.hardConflicts.length > 0) {
      throw new Error(`Citation locator reconciliation conflict: ${initialPlan.hardConflicts.join('; ')}`)
    }
    if (!apply) {
      console.log(`Dry run only. Re-run with --apply --ack=${APPLY_ACK}`)
      return
    }
    if (initialPlan.mutations.length === 0) {
      console.log('Academic citation locator reconciliation is already a safe no-op.')
      return
    }

    const initialSignature = academicCitationLocatorMutationSignature(initialPlan)
    const citationIds = initialPlan.auditRows.map(row => row.citationId)
    const applied = await prisma.$transaction(async transaction => {
      await lockReconciliationScope(transaction, repairs, citationIds)
      const lockedPlan = await loadReconciliationPlan(transaction, repairs)
      if (lockedPlan.hardConflicts.length > 0) {
        throw new Error(`Concurrent reconciliation conflict: ${lockedPlan.hardConflicts.join('; ')}`)
      }
      if (academicCitationLocatorMutationSignature(lockedPlan) !== initialSignature) {
        throw new Error('Concurrent citation or FieldCitation drift changed the reviewed mutation plan')
      }

      for (const mutation of lockedPlan.mutations) {
        const result = await transaction.sourceCitation.updateMany({
          where: {
            id: mutation.citationId,
            url: mutation.expectedUrl,
            accessedAt: mutation.expectedAccessedAt
              ? new Date(mutation.expectedAccessedAt)
              : null,
            updatedAt: new Date(mutation.expectedUpdatedAt),
          },
          data: {
            url: mutation.replacementUrl,
            accessedAt: new Date(mutation.replacementAccessedAt),
          },
        })
        if (result.count !== 1) {
          throw new Error(`Citation compare-and-swap failed: ${mutation.citationId}`)
        }
      }

      const verifiedPlan = await loadReconciliationPlan(transaction, repairs)
      const appliedIds = new Set(lockedPlan.mutations.map(mutation => mutation.citationId))
      const incomplete = verifiedPlan.auditRows.filter(row =>
        appliedIds.has(row.citationId) && row.status !== 'already_applied',
      )
      if (incomplete.length > 0) {
        throw new Error(`Post-write citation verification failed: ${incomplete.map(row => row.citationId).join(', ')}`)
      }
      return lockedPlan.mutations.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Academic citation locator reconciliation applied atomically: ${applied} citation(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Academic citation locator reconciliation failed')
    process.exitCode = 1
  })
}
