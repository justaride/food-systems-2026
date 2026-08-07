import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports } from '../prisma/seed-data/reports'

const APPLY_ACK = 'APPLY_VERIFIED_REPORT_ACCESS_DATES'
const ADVISORY_LOCK_KEY = 'foodsystems:verified-report-access-dates:2026-07-19:v1'

export const VERIFIED_REPORT_ACCESS_DATE = '2026-07-19'

export type ReportAccessVerificationMethod =
  | 'http_200'
  | 'browser_verified_bot_blocked'
  | 'repaired_404'

type PinnedReportAccessTarget = {
  id: string
  title: string
  institution: string
  year: number
  expectedSourceUrl: string
  targetSourceUrl?: string
  verificationMethod: ReportAccessVerificationMethod
}

const PINNED_REPORT_ACCESS_TARGETS = [
  {
    id: 'beredskap-island-melmolle-2025',
    title: 'Islands melmolle og matsuverenitet',
    institution: 'Kornax / Iceland Review / RUV',
    year: 2025,
    expectedSourceUrl: 'https://www.icelandreview.com/news/icelands-only-flour-mill-set-to-be-scrapped/',
    verificationMethod: 'http_200',
  },
  {
    id: 'biogas-danmark-outlook-2024',
    title: 'Biogas Outlook 2024',
    institution: 'Biogas Danmark',
    year: 2024,
    expectedSourceUrl: 'https://www.biogas.dk/wp-content/uploads/2024/05/Biogas-Outlook-2024-05-30-WEB-engelsk.pdf',
    verificationMethod: 'http_200',
  },
  {
    id: 'biokierto-biogas-finland-2030-2040-2024',
    title: 'Biokaasun tuotanto ja kaytto Suomessa 2030, 2035 ja 2040',
    institution: 'Suomen Biokierto ja Biokaasu ry',
    year: 2024,
    expectedSourceUrl: 'https://biokierto.fi/wp-content/uploads/2024/05/Biokaasun-tuotanto-ja-kaytto-Suomessa-2030-2035-ja-2040-artikkeli-10052024-1.pdf',
    verificationMethod: 'http_200',
  },
  {
    id: 'danmark-groent-danmark-co2-avgift-2024',
    title: 'Aftale om Grønt Danmark',
    institution: 'Danmarks regering / Finansministeriet',
    year: 2024,
    expectedSourceUrl: 'https://fm.dk/nyheder/2024/juni/aftale-om-groent-danmark/',
    targetSourceUrl: 'https://regeringen.dk/aktuelt/tidligere-publikationer/aftale-om-et-groent-danmark/',
    verificationMethod: 'repaired_404',
  },
  {
    id: 'erkkola-2025-nnr-evidence-to-action',
    title: 'From evidence to action',
    institution: 'Proceedings of the Nutrition Society',
    year: 2025,
    expectedSourceUrl: 'https://doi.org/10.1017/S0029665125100682',
    verificationMethod: 'http_200',
  },
  {
    id: 'evida-biogasstatus-danmark-2024',
    title: 'Biogasstatus for 2024',
    institution: 'Evida',
    year: 2025,
    expectedSourceUrl: 'https://evida.dk/nyheder/biogas-2024/',
    verificationMethod: 'http_200',
  },
  {
    id: 'finland-nutrition-recommendations-2024',
    title: 'Kestavaa terveytta ruoasta',
    institution: 'Terveyden ja hyvinvoinnin laitos / Finnish Institute for Health and Welfare',
    year: 2024,
    expectedSourceUrl: 'https://www.julkari.fi/handle/10024/150005',
    verificationMethod: 'http_200',
  },
  {
    id: 'future-nordic-diets-tn2017-566',
    title: 'Future Nordic Diets',
    institution: 'Nordic Council of Ministers',
    year: 2017,
    expectedSourceUrl: 'https://www.norden.org/en/publication/future-nordic-diets',
    verificationMethod: 'browser_verified_bot_blocked',
  },
  {
    id: 'harwatt-2024-environmental-sustainability-nordic-baltic',
    title: 'Environmental sustainability of Nordic-Baltic food production and consumption',
    institution: 'Food & Nutrition Research / NNR2023 Committee',
    year: 2024,
    expectedSourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/39525325/',
    verificationMethod: 'http_200',
  },
  {
    id: 'ifro-danish-soy-imports-2025',
    title: 'Status of Danish imports of sustainable and deforestation- and conversion-free soy',
    institution: 'Department of Food and Resource Economics, University of Copenhagen',
    year: 2025,
    expectedSourceUrl: 'https://curis.ku.dk/ws/portalfiles/portal/471376644/IFRO_Documentation_2025_01.pdf',
    verificationMethod: 'http_200',
  },
  {
    id: 'jackson-holm-2024-food-sustainability-dimensions',
    title: 'Social and economic dimensions of food sustainability',
    institution: 'Food & Nutrition Research / NNR2023 Committee',
    year: 2024,
    expectedSourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10870971/',
    verificationMethod: 'http_200',
  },
  {
    id: 'jordbruksverket-livsmedelskonsumtion-sverige-2024',
    title: 'Livsmedelskonsumtion och näringsinnehåll 2024',
    institution: 'Jordbruksverket / Sveriges officiella statistik',
    year: 2025,
    expectedSourceUrl: 'https://jordbruksverket.se/om-jordbruksverket/jordbruksverkets-officiella-statistik/jordbruksverkets-statistikrapporter/statistik/2025-12-11-livsmedelskonsumtion-och-naringsinnehall.--uppgifter-till-och-med-2024',
    verificationMethod: 'http_200',
  },
  {
    id: 'karlstad-declaration-matberedskap-2024',
    title: 'Karlstad-deklarasjonen om nordisk matberedskap',
    institution: 'Nordisk Ministerraad',
    year: 2024,
    expectedSourceUrl: 'https://www.norden.org/no/declaration/karlstaddeklarasjonen',
    verificationMethod: 'browser_verified_bot_blocked',
  },
  {
    id: 'luke-peat-soils-roadmap-finland-2024',
    title: 'Climate-smart food production on peat soils',
    institution: 'Natural Resources Institute Finland (Luke)',
    year: 2024,
    expectedSourceUrl: 'https://www.luke.fi/en/about-luke/responsibility/vastuullisuusraportti-2024/climatesmart-food-production-on-peat-soils',
    verificationMethod: 'browser_verified_bot_blocked',
  },
  {
    id: 'meltzer-2024-sustainable-diets-nordics',
    title: 'Sustainable diets in the Nordics',
    institution: 'Food & Nutrition Research / NNR2023 Committee',
    year: 2024,
    expectedSourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11075468/',
    verificationMethod: 'http_200',
  },
  {
    id: 'naturvardsverket-livsmedelsavfall-sverige-2024',
    title: 'Livsmedelsavfall i Sverige 2024',
    institution: 'Naturvardsverket / SMED',
    year: 2025,
    expectedSourceUrl: 'https://www.naturvardsverket.se/data-och-statistik/avfall/avfall-mat/',
    verificationMethod: 'http_200',
  },
  {
    id: 'nnr2023-nordic-nutrition-recommendations',
    title: 'Nordic Nutrition Recommendations 2023',
    institution: 'Nordic Council of Ministers',
    year: 2023,
    expectedSourceUrl: 'https://pub.norden.org/nord2023-003/',
    verificationMethod: 'http_200',
  },
  {
    id: 'norden-policy-2024',
    title: 'Policy tools for sustainable and healthy eating',
    institution: 'Nordregio / Nordisk Ministerraad',
    year: 2024,
    expectedSourceUrl: 'https://pub.norden.org/nord2024-007/nord2024-007.pdf',
    verificationMethod: 'http_200',
  },
  {
    id: 'normo-2025-nordic-monitoring',
    title: 'NORMO 2025',
    institution: 'Nordic Council of Ministers / DTU Food',
    year: 2025,
    expectedSourceUrl: 'https://www.norden.org/en/publication/normo-2025-nordic-monitoring-2014-2024',
    verificationMethod: 'browser_verified_bot_blocked',
  },
  {
    id: 'riksrevisionen-2025-jordbrukets-klimatomstallning',
    title: 'Statens insatser for jordbrukets klimatomstallning',
    institution: 'Riksrevisionen',
    year: 2025,
    expectedSourceUrl: 'https://www.riksrevisionen.se/granskningar/granskningsrapporter/2025/statens-insatser-for-jordbrukets-klimatomstallning.html',
    verificationMethod: 'http_200',
  },
  {
    id: 'sirkularitet-matsvinn-2024',
    title: 'Breaking Barriers',
    institution: 'Nordisk Ministerraad',
    year: 2024,
    expectedSourceUrl: 'https://pub.norden.org/nord2024-034/nord2024-034.pdf',
    verificationMethod: 'http_200',
  },
  {
    id: 'solutions-menu-2018',
    title: 'Solutions Menu',
    institution: 'Nordic Council of Ministers',
    year: 2018,
    expectedSourceUrl: 'https://www.norden.org/en/publication/solutions-menu-nordic-guide-sustainable-food-policy',
    verificationMethod: 'browser_verified_bot_blocked',
  },
  {
    id: 'statistics-finland-biogas-2024',
    title: 'Two per cent more biogas was produced in 2024',
    institution: 'Statistics Finland / Official Statistics of Finland',
    year: 2025,
    expectedSourceUrl: 'https://stat.fi/en/publication/cm1kpvyg5cwuk07vwljv0s760',
    verificationMethod: 'http_200',
  },
  {
    id: 'trolle-2024-fbdg-environmental-sustainability',
    title: 'Integrating environmental sustainability into Nordic food-based dietary guidelines',
    institution: 'Food & Nutrition Research / NNR2023 Committee',
    year: 2024,
    expectedSourceUrl: 'https://doi.org/10.29219/fnr.v68.10792',
    verificationMethod: 'http_200',
  },
  {
    id: 'valio-sustainability-report-2024',
    title: 'Valio Sustainability Report 2024',
    institution: 'Valio',
    year: 2025,
    expectedSourceUrl: 'https://cdn-wp.valio.fi/valio-wp-network/2025/04/Valio-Sustainability-Report-2024-light-version.pdf',
    verificationMethod: 'http_200',
  },
] as const satisfies readonly PinnedReportAccessTarget[]

export type ReportAccessDateTarget = {
  id: string
  title: string
  institution: string
  year: number
  expectedSourceUrl: string
  targetSourceUrl: string
  accessedAt: string
  verificationMethod: ReportAccessVerificationMethod
}

export const REVIEWED_REPORT_ACCESS_DATE_TARGETS: readonly ReportAccessDateTarget[] =
  PINNED_REPORT_ACCESS_TARGETS.map(target => ({
    id: target.id,
    title: target.title,
    institution: target.institution,
    year: target.year,
    expectedSourceUrl: target.expectedSourceUrl,
    targetSourceUrl: 'targetSourceUrl' in target
      ? target.targetSourceUrl
      : target.expectedSourceUrl,
    accessedAt: VERIFIED_REPORT_ACCESS_DATE,
    verificationMethod: target.verificationMethod,
  }))

export const PINNED_REPORT_ACCESS_DATE_MANIFEST_SHA256 =
  'cc3e41e567ab4e0883872a887685416b7d0f9ad3a4a2be8d56ffc99736e5df69'

export type ReportAccessDateSnapshot = {
  id: string
  title: string
  institution: string | null
  year: number | null
  sourceUrl: string | null
  accessedAt: Date | string | null
}

export type ReportAccessDateConflict = {
  id: string
  detail: string
}

export type ReportAccessDateRepairPlan = {
  version: 1
  manifestSha256: string
  updates: ReportAccessDateTarget[]
  alreadyAppliedIds: string[]
  conflicts: ReportAccessDateConflict[]
  summary: {
    total: number
    pending: number
    alreadyApplied: number
    conflicts: number
  }
}

const reportSelect = {
  id: true,
  title: true,
  institution: true,
  year: true,
  sourceUrl: true,
  accessedAt: true,
} satisfies Prisma.ReportSelect

type ReportAccessDateClient = Pick<PrismaClient, 'report'>

function normalizeAccessDate(value: Date | string | null | undefined) {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return value.slice(0, 10)
}

function accessedAtDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function manifestSha256() {
  return createHash('sha256')
    .update(JSON.stringify(REVIEWED_REPORT_ACCESS_DATE_TARGETS))
    .digest('hex')
}

export function validateReviewedReportAccessDateTargets() {
  const ids = REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => target.id)
  if (ids.length !== 25 || new Set(ids).size !== ids.length) {
    throw new Error('Reviewed Report access-date manifest must contain exactly 25 unique rows')
  }
  if (manifestSha256() !== PINNED_REPORT_ACCESS_DATE_MANIFEST_SHA256) {
    throw new Error('Reviewed Report access-date manifest drifted from its pinned SHA-256')
  }
  const methodCounts = Object.fromEntries(
    (['http_200', 'browser_verified_bot_blocked', 'repaired_404'] as const)
      .map(method => [method, REVIEWED_REPORT_ACCESS_DATE_TARGETS.filter(row => row.verificationMethod === method).length]),
  )
  if (
    methodCounts.http_200 !== 19 ||
    methodCounts.browser_verified_bot_blocked !== 5 ||
    methodCounts.repaired_404 !== 1
  ) {
    throw new Error(`Reviewed Report verification-method counts drifted: ${JSON.stringify(methodCounts)}`)
  }
  const locatorRepairs = REVIEWED_REPORT_ACCESS_DATE_TARGETS.filter(target => (
    target.expectedSourceUrl !== target.targetSourceUrl
  ))
  if (
    locatorRepairs.length !== 1 ||
    locatorRepairs[0]?.id !== 'danmark-groent-danmark-co2-avgift-2024' ||
    locatorRepairs[0]?.verificationMethod !== 'repaired_404'
  ) {
    throw new Error('Reviewed Report locator-repair scope drifted')
  }
  for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
    if (target.accessedAt !== VERIFIED_REPORT_ACCESS_DATE) {
      throw new Error(`Reviewed Report access date drifted for ${target.id}`)
    }
    for (const locator of [target.expectedSourceUrl, target.targetSourceUrl]) {
      const url = new URL(locator)
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error(`Reviewed Report locator is not absolute HTTP(S): ${target.id}`)
      }
    }
  }
}

export function validateReportAccessDateSeedTargets(rows = reports) {
  validateReviewedReportAccessDateTargets()
  for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
    const matches = rows.filter(row => row.id === target.id)
    if (matches.length !== 1) {
      throw new Error(`Expected exactly one seed Report for ${target.id}; found ${matches.length}`)
    }
    const row = matches[0]!
    if (
      row.title !== target.title ||
      row.institution !== target.institution ||
      row.year !== target.year ||
      row.sourceUrl !== target.targetSourceUrl ||
      normalizeAccessDate(row.accessedAt) !== target.accessedAt
    ) {
      throw new Error(`Seed Report access-date target drifted for ${target.id}`)
    }
  }
}

export function buildReportAccessDateRepairPlan(
  rows: readonly ReportAccessDateSnapshot[],
): ReportAccessDateRepairPlan {
  validateReviewedReportAccessDateTargets()
  const updates: ReportAccessDateTarget[] = []
  const alreadyAppliedIds: string[] = []
  const conflicts: ReportAccessDateConflict[] = []

  for (const target of REVIEWED_REPORT_ACCESS_DATE_TARGETS) {
    const matches = rows.filter(row => row.id === target.id)
    if (matches.length !== 1) {
      conflicts.push({ id: target.id, detail: `Expected exactly one database row; found ${matches.length}.` })
      continue
    }
    const row = matches[0]!
    const driftedFields = (['title', 'institution', 'year'] as const)
      .filter(field => row[field] !== target[field])
    if (driftedFields.length > 0) {
      conflicts.push({ id: target.id, detail: `Pinned identity drifted: ${driftedFields.join(', ')}.` })
      continue
    }

    const currentAccessDate = normalizeAccessDate(row.accessedAt)
    const pending = row.sourceUrl === target.expectedSourceUrl && currentAccessDate == null
    const applied = row.sourceUrl === target.targetSourceUrl && currentAccessDate === target.accessedAt
    if (pending) {
      updates.push(target)
    } else if (applied) {
      alreadyAppliedIds.push(target.id)
    } else {
      conflicts.push({
        id: target.id,
        detail: `Unexpected sourceUrl/accessedAt state: ${JSON.stringify({
          sourceUrl: row.sourceUrl,
          accessedAt: currentAccessDate,
        })}.`,
      })
    }
  }

  return {
    version: 1,
    manifestSha256: PINNED_REPORT_ACCESS_DATE_MANIFEST_SHA256,
    updates,
    alreadyAppliedIds,
    conflicts,
    summary: {
      total: REVIEWED_REPORT_ACCESS_DATE_TARGETS.length,
      pending: updates.length,
      alreadyApplied: alreadyAppliedIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function reportAccessDateRepairPlanContract(plan: ReportAccessDateRepairPlan) {
  return {
    version: plan.version,
    manifestSha256: plan.manifestSha256,
    updates: plan.updates,
    alreadyAppliedIds: plan.alreadyAppliedIds,
    conflicts: plan.conflicts,
    summary: plan.summary,
  }
}

export function reportAccessDateRepairPlanSha256(plan: ReportAccessDateRepairPlan) {
  return createHash('sha256')
    .update(JSON.stringify(reportAccessDateRepairPlanContract(plan)))
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

async function inspectReportAccessDates(client: ReportAccessDateClient) {
  const rows = await client.report.findMany({
    where: { id: { in: REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => target.id) } },
    select: reportSelect,
    orderBy: { id: 'asc' },
  })
  return buildReportAccessDateRepairPlan(rows)
}

function printPlan(plan: ReportAccessDateRepairPlan, digest: string) {
  console.log('Verified Report access-date and locator repair plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Reviewed manifest SHA-256: ${plan.manifestSha256}`)
  console.log(`Rows: ${plan.summary.total}; pending: ${plan.summary.pending}; already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`)
  for (const target of plan.updates) {
    const locatorChange = target.expectedSourceUrl === target.targetSourceUrl
      ? ''
      : `; sourceUrl ${target.expectedSourceUrl} -> ${target.targetSourceUrl}`
    console.log(`Pending Report:${target.id} accessedAt null -> ${target.accessedAt}${locatorChange}`)
  }
  for (const id of plan.alreadyAppliedIds) console.log(`Already applied Report:${id}`)
  for (const conflict of plan.conflicts) console.log(`Conflict Report:${conflict.id}: ${conflict.detail}`)
}

async function findCasPreflightMismatches(
  client: ReportAccessDateClient,
  plan: ReportAccessDateRepairPlan,
) {
  const checks = await Promise.all(plan.updates.map(async target => ({
    id: target.id,
    count: await client.report.count({
      where: {
        id: target.id,
        title: target.title,
        institution: target.institution,
        year: target.year,
        sourceUrl: target.expectedSourceUrl,
        accessedAt: null,
      },
    }),
  })))
  return checks.filter(check => check.count !== 1)
}

function exactIds(rows: Array<{ id: string }>, expected: readonly string[]) {
  return JSON.stringify(rows.map(row => row.id).sort()) === JSON.stringify([...expected].sort())
}

async function lockReviewedRows(transaction: Prisma.TransactionClient) {
  const ids = REVIEWED_REPORT_ACCESS_DATE_TARGETS.map(target => target.id)
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Report"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `)
  if (!exactIds(locked, ids)) {
    throw new Error('Reviewed Report rows changed after planning; no rows updated')
  }
}

async function applyUpdate(transaction: Prisma.TransactionClient, target: ReportAccessDateTarget) {
  const result = await transaction.report.updateMany({
    where: {
      id: target.id,
      title: target.title,
      institution: target.institution,
      year: target.year,
      sourceUrl: target.expectedSourceUrl,
      accessedAt: null,
    },
    data: {
      sourceUrl: target.targetSourceUrl,
      accessedAt: accessedAtDate(target.accessedAt),
    },
  })
  if (result.count !== 1) {
    throw new Error(`Concurrent Report access-date CAS conflict: ${target.id}; no rows updated`)
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

  validateReportAccessDateSeedTargets()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectReportAccessDates(prisma)
    const digest = reportAccessDateRepairPlanSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('Reviewed Report access-date conflicts detected; refusing mutation')
    }
    const preflightMismatches = await findCasPreflightMismatches(prisma, plan)
    if (preflightMismatches.length > 0) {
      throw new Error(`Report access-date CAS preflight mismatch: ${preflightMismatches.map(row => row.id).join(', ')}`)
    }
    console.log(`CAS preflight: ${plan.updates.length}/${plan.updates.length} exact pending Report snapshots matched`)

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

      const lockedPlan = await inspectReportAccessDates(transaction)
      if (
        lockedPlan.conflicts.length > 0 ||
        reportAccessDateRepairPlanSha256(lockedPlan) !== args.expectedPlanSha256
      ) {
        throw new Error('Concurrent Report identity/locator/access-date drift detected; no rows updated')
      }
      for (const target of lockedPlan.updates) await applyUpdate(transaction, target)

      const afterPlan = await inspectReportAccessDates(transaction)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.updates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== REVIEWED_REPORT_ACCESS_DATE_TARGETS.length
      ) {
        throw new Error('Post-apply Report access-date state did not match the reviewed target; no rows updated')
      }
      return lockedPlan.updates.length
    }, { isolationLevel: 'Serializable' })

    console.log(`Verified Report access-date and locator repair applied: ${applied} row(s)`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `Verified Report access-date repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}. Rerun dry-run.`,
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
    console.error(error instanceof Error ? error.message : 'Verified Report access-date repair failed')
    process.exitCode = 1
  })
}
