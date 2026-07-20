import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'
import {
  SEED_ONLY_REPORT_SYNC_IDS,
  buildReviewedSeedOnlyReportTargets,
  buildSeedOnlyReportSyncPlan,
  seedOnlyReportSyncPlanContract,
  type SeedOnlyReportSyncPlan,
  type SeedOnlyReportTarget,
} from '../src/lib/citations/seed-only-report-sync'

const APPLY_ACK = 'APPLY_REVIEWED_SEED_ONLY_REPORT_SYNC'
const ADVISORY_LOCK_KEY = 'foodsystems:seed-only-report-sync:internal-registers:v1'

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

type SeedOnlyReportClient = Pick<PrismaClient, 'report'>

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

async function inspectSeedOnlyReportSync(
  client: SeedOnlyReportClient,
  targets: readonly SeedOnlyReportTarget[],
) {
  const rows = await client.report.findMany({
    where: { id: { in: [...SEED_ONLY_REPORT_SYNC_IDS] } },
    select: reportSelect,
  })
  return buildSeedOnlyReportSyncPlan(rows, targets)
}

function planSha256(plan: SeedOnlyReportSyncPlan) {
  return createHash('sha256')
    .update(JSON.stringify(seedOnlyReportSyncPlanContract(plan)))
    .digest('hex')
}

function printPlan(plan: SeedOnlyReportSyncPlan, digest: string) {
  console.log('Reviewed seed-only Report sync plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Pinned target manifest SHA-256: ${plan.targetManifestSha256}`)
  console.log(
    `Reports: ${plan.summary.total}; pending creates: ${plan.summary.pendingCreates}; ` +
    `already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  )
  for (const row of plan.observed) {
    console.log(`${row.state}\t${row.id}\tdocumentId=${row.documentId ?? 'null'}`)
  }
  for (const conflict of plan.conflicts) {
    console.log(`CONFLICT\t${conflict.id}\t${conflict.detail}`)
  }
}

function reportCreateData(target: SeedOnlyReportTarget): Prisma.ReportCreateInput {
  return {
    id: target.id,
    title: target.title,
    fullTitle: target.fullTitle,
    author: target.author,
    institution: target.institution,
    date: target.date,
    year: target.year,
    sourceUrl: target.sourceUrl,
    reportCategory: target.reportCategory,
    country: target.country,
    keyFindings: target.keyFindings,
    recommendations: target.recommendations,
    relevance: target.relevance,
    tags: target.tags,
    doi: target.doi,
    isbn: target.isbn,
    issn: target.issn,
    publisher: target.publisher,
    provenanceType: target.provenanceType,
    supportingSources: target.supportingSources === null
      ? Prisma.DbNull
      : target.supportingSources as Prisma.InputJsonValue,
    accessedAt: target.accessedAt ? new Date(target.accessedAt) : null,
  }
}

async function findAbsenceCasPreflightMismatches(
  client: SeedOnlyReportClient,
  plan: SeedOnlyReportSyncPlan,
) {
  const checks = await Promise.all(plan.creates.map(async create => ({
    id: create.id,
    count: await client.report.count({ where: { id: create.id } }),
  })))
  return checks.filter(check => check.count !== 0)
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)
  return /P2002|P2034|unique constraint|serialize|serialization|deadlock|concurrent|changed after planning/i.test(message)
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

  const targets = buildReviewedSeedOnlyReportTargets(reports)
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectSeedOnlyReportSync(prisma, targets)
    const digest = planSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('Seed-only Report conflicts detected; refusing all mutation')
    }

    const casPreflightMismatches = await findAbsenceCasPreflightMismatches(prisma, plan)
    if (casPreflightMismatches.length > 0) {
      throw new Error(
        `Seed-only Report absence CAS preflight mismatch: ${casPreflightMismatches.map(row => row.id).join(', ')}`,
      )
    }
    console.log(
      `Absence CAS preflight: ${plan.creates.length}/${plan.creates.length} pending ids remain absent`,
    )

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${APPLY_ACK} ` +
        `--plan-sha256=${digest}`,
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
      await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "Report"
        WHERE "id" IN (${Prisma.join([...SEED_ONLY_REPORT_SYNC_IDS])})
        ORDER BY "id" FOR UPDATE
      `)

      const lockedPlan = await inspectSeedOnlyReportSync(transaction, targets)
      const lockedDigest = planSha256(lockedPlan)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent seed-only Report drift changed the reviewed plan; no rows created')
      }
      const lockedCasMismatches = await findAbsenceCasPreflightMismatches(transaction, lockedPlan)
      if (lockedCasMismatches.length > 0) {
        throw new Error('Concurrent seed-only Report insert violated the absence CAS; no rows created')
      }

      for (const create of lockedPlan.creates) {
        await transaction.report.create({ data: reportCreateData(create.target) })
      }

      const afterPlan = await inspectSeedOnlyReportSync(transaction, targets)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.creates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== SEED_ONLY_REPORT_SYNC_IDS.length
      ) {
        throw new Error('Post-write seed-only Report verification failed; no rows created')
      }
      return lockedPlan.creates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Reviewed seed-only Report sync applied atomically: ${applied} row(s) created`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Seed-only Report sync conflicted with a concurrent write; the Serializable transaction ` +
        `rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'Seed-only Report sync failed')
    process.exitCode = 1
  })
}
