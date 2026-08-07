import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { theses } from '../prisma/seed-data/theses'

const APPLY_ACK = 'APPLY_VERIFIED_THESIS_ACCESS_DATES'
const ADVISORY_LOCK_KEY = 'foodsystems:verified-thesis-access-dates:2026-07-19:v1'

export const VERIFIED_THESIS_ACCESS_DATE = '2026-07-19'

export const REVIEWED_THESIS_ACCESS_DATE_TARGETS = [
  {
    id: 'jacobsen-jansson-2022',
    url: 'https://hdl.handle.net/11250/3051794',
    title: 'Norway — the Black Sheep in the Scandinavian Grocery Industry',
    institution: 'NHH',
    accessDate: VERIFIED_THESIS_ACCESS_DATE,
  },
  {
    id: 'nguyen-hartmann-2024',
    url: 'https://hdl.handle.net/11250/3158950',
    title: 'Restrictive covenants in the Norwegian grocery market: an empirical study',
    institution: 'NHH',
    accessDate: VERIFIED_THESIS_ACCESS_DATE,
  },
] as const

export const PINNED_THESIS_ACCESS_DATE_MANIFEST_SHA256 =
  'fda04f889628b0fbfa744ca592fada1509eb41d189242790e4bc81f7d6ff1502'

export type ThesisAccessDateTarget = (typeof REVIEWED_THESIS_ACCESS_DATE_TARGETS)[number]

export type ThesisAccessDateSnapshot = {
  id: string
  url: string
  title: string
  institution: string
  accessDate: string | null
}

export type ThesisAccessDateConflict = {
  id: string
  detail: string
}

export type ThesisAccessDateRepairPlan = {
  version: 1
  manifestSha256: string
  updates: ThesisAccessDateTarget[]
  alreadyAppliedIds: string[]
  conflicts: ThesisAccessDateConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
  }
}

const thesisSelect = {
  id: true,
  url: true,
  title: true,
  institution: true,
  accessDate: true,
} satisfies Prisma.ThesisSelect

type ThesisAccessDateClient = Pick<PrismaClient, 'thesis'>

function manifestSha256() {
  return createHash('sha256')
    .update(JSON.stringify(REVIEWED_THESIS_ACCESS_DATE_TARGETS))
    .digest('hex')
}

export function validateReviewedThesisAccessDateTargets() {
  const ids = REVIEWED_THESIS_ACCESS_DATE_TARGETS.map(target => target.id)
  if (ids.length !== 2 || new Set(ids).size !== ids.length) {
    throw new Error('Reviewed Thesis access-date manifest must contain exactly two unique rows')
  }
  if (manifestSha256() !== PINNED_THESIS_ACCESS_DATE_MANIFEST_SHA256) {
    throw new Error('Reviewed Thesis access-date manifest drifted from its pinned SHA-256')
  }
  for (const target of REVIEWED_THESIS_ACCESS_DATE_TARGETS) {
    if (target.accessDate !== VERIFIED_THESIS_ACCESS_DATE) {
      throw new Error(`Reviewed Thesis access date drifted for ${target.id}`)
    }
    const url = new URL(target.url)
    if (url.protocol !== 'https:' || url.hostname !== 'hdl.handle.net') {
      throw new Error(`Reviewed Thesis locator is not a pinned HTTPS Handle resolver: ${target.id}`)
    }
  }
}

export function validateThesisAccessDateSeedTargets(rows: typeof theses = theses) {
  validateReviewedThesisAccessDateTargets()
  for (const target of REVIEWED_THESIS_ACCESS_DATE_TARGETS) {
    const matches = rows.filter(row => row.id === target.id)
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one seed Thesis for ${target.id}; found ${matches.length}`)
    }
    const row = matches[0]!
    if (
      row.url !== target.url ||
      row.title !== target.title ||
      row.institution !== target.institution ||
      row.accessDate !== target.accessDate
    ) {
      throw new Error(`Seed Thesis access-date target drifted for ${target.id}`)
    }
  }
}

export function buildThesisAccessDateRepairPlan(
  rows: readonly ThesisAccessDateSnapshot[],
): ThesisAccessDateRepairPlan {
  validateReviewedThesisAccessDateTargets()
  const updates: ThesisAccessDateTarget[] = []
  const alreadyAppliedIds: string[] = []
  const conflicts: ThesisAccessDateConflict[] = []

  for (const target of REVIEWED_THESIS_ACCESS_DATE_TARGETS) {
    const matches = rows.filter(row => row.id === target.id)
    if (matches.length !== 1) {
      conflicts.push({ id: target.id, detail: `Expected exactly one database row; found ${matches.length}.` })
      continue
    }
    const row = matches[0]!
    const driftedFields = (['url', 'title', 'institution'] as const)
      .filter(field => row[field] !== target[field])
    if (driftedFields.length > 0) {
      conflicts.push({ id: target.id, detail: `Pinned identity drifted: ${driftedFields.join(', ')}.` })
      continue
    }
    if (row.accessDate === target.accessDate) {
      alreadyAppliedIds.push(target.id)
    } else if (row.accessDate == null) {
      updates.push(target)
    } else {
      conflicts.push({ id: target.id, detail: `Unexpected accessDate ${JSON.stringify(row.accessDate)}.` })
    }
  }

  return {
    version: 1,
    manifestSha256: PINNED_THESIS_ACCESS_DATE_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: REVIEWED_THESIS_ACCESS_DATE_TARGETS.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function thesisAccessDateRepairPlanContract(plan: ThesisAccessDateRepairPlan) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
    summary: plan.summary,
  }
}

export function thesisAccessDateRepairPlanSha256(plan: ThesisAccessDateRepairPlan) {
  return createHash('sha256')
    .update(JSON.stringify(thesisAccessDateRepairPlanContract(plan)))
    .digest('hex')
}

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

async function inspectThesisAccessDates(client: ThesisAccessDateClient) {
  const rows = await client.thesis.findMany({
    where: { id: { in: REVIEWED_THESIS_ACCESS_DATE_TARGETS.map(target => target.id) } },
    select: thesisSelect,
    orderBy: { id: 'asc' },
  })
  return buildThesisAccessDateRepairPlan(rows)
}

function printPlan(plan: ThesisAccessDateRepairPlan, digest: string) {
  console.log('Verified Thesis access-date repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Reviewed manifest SHA-256: ${plan.manifestSha256}`)
  console.log(`Rows: ${plan.summary.total}; pending: ${plan.summary.pending}; already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`)
  for (const target of plan.updates) {
    console.log(`Pending Thesis:${target.id} accessDate null -> ${target.accessDate}`)
  }
  for (const id of plan.alreadyAppliedIds) console.log(`Already applied Thesis:${id}`)
  for (const conflict of plan.conflicts) console.log(`Conflict Thesis:${conflict.id}: ${conflict.detail}`)
}

async function findCasPreflightMismatches(
  client: ThesisAccessDateClient,
  plan: ThesisAccessDateRepairPlan,
) {
  const checks = await Promise.all(plan.updates.map(async target => ({
    id: target.id,
    count: await client.thesis.count({
      where: {
        id: target.id,
        url: target.url,
        title: target.title,
        institution: target.institution,
        accessDate: null,
      },
    }),
  })))
  return checks.filter(check => check.count !== 1)
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const ids = REVIEWED_THESIS_ACCESS_DATE_TARGETS.map(target => target.id)
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Thesis"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(locked, ids)) {
    throw new Error('Reviewed Thesis rows changed after planning; no rows updated')
  }
}

async function applyUpdate(transaction: Prisma.TransactionClient, target: ThesisAccessDateTarget) {
  const result = await transaction.thesis.updateMany({
    where: {
      id: target.id,
      url: target.url,
      title: target.title,
      institution: target.institution,
      accessDate: null,
    },
    data: { accessDate: target.accessDate },
  })
  if (result.count !== 1) {
    throw new Error(`Concurrent Thesis access-date CAS conflict: ${target.id}; no rows updated`)
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

  validateThesisAccessDateSeedTargets()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectThesisAccessDates(prisma)
    const digest = thesisAccessDateRepairPlanSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('Reviewed Thesis access-date conflicts detected; refusing mutation')
    }
    const preflightMismatches = await findCasPreflightMismatches(prisma, plan)
    if (preflightMismatches.length > 0) {
      throw new Error(`Thesis access-date CAS preflight mismatch: ${preflightMismatches.map(row => row.id).join(', ')}`)
    }
    console.log(`CAS preflight: ${plan.updates.length}/${plan.updates.length} exact pending Thesis snapshots matched`)

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

      const lockedPlan = await inspectThesisAccessDates(transaction)
      if (
        lockedPlan.conflicts.length > 0 ||
        thesisAccessDateRepairPlanSha256(lockedPlan) !== args.expectedPlanSha256
      ) {
        throw new Error('Concurrent Thesis identity/access-date drift detected; no rows updated')
      }
      for (const target of lockedPlan.updates) await applyUpdate(transaction, target)

      const afterPlan = await inspectThesisAccessDates(transaction)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.updates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== REVIEWED_THESIS_ACCESS_DATE_TARGETS.length
      ) {
        throw new Error('Post-apply Thesis access-date state did not match the reviewed target; no rows updated')
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Verified Thesis access-date repair applied: ${applied} row(s)`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Verified Thesis access-date repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'Verified Thesis access-date repair failed')
    process.exitCode = 1
  })
}
