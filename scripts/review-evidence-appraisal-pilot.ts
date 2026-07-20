import 'dotenv/config'
import { createHash, randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve, sep } from 'node:path'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST } from '../research/review/evidence-appraisal-pilot-manifest'
import {
  EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS,
  buildEvidenceAppraisalReviewPlan,
  evidenceAppraisalReviewManifestContract,
  evidenceAppraisalReviewPlanContract,
  evidenceAppraisalReviewTargetContract,
  sha256EvidenceAppraisalReviewJson,
  validateCompletedEvidenceAppraisalReviewManifest,
  validateEvidenceAppraisalReviewTemplate,
  type CompletedEvidenceAppraisalReviewManifest,
  type EvidenceAppraisalCreateTarget,
  type EvidenceAppraisalReviewPlan,
} from '../src/lib/citations/evidence-appraisal-review-workflow'

const APPLY_ACK = 'APPLY_HUMAN_REVIEWED_EVIDENCE_APPRAISAL_PILOT'
const ADVISORY_LOCK_KEY = 'foodsystems:evidence-appraisal-human-review:pilot:v1'
const REVIEW_LOG_PATH = 'research/_status/evidence-appraisal-human-review-log.jsonl'

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

const evidenceAppraisalSelect = {
  id: true,
  reportId: true,
  thesisId: true,
  sourceDocId: true,
  status: true,
  basis: true,
  studyDesign: true,
  studyDesignDetails: true,
  methodologySummary: true,
  sampleOrCoverage: true,
  applicability: true,
  applicabilityContext: true,
  applicabilityNotes: true,
  limitationsStatus: true,
  limitations: true,
  limitationsNotes: true,
  riskOfBias: true,
  riskOfBiasNotes: true,
  framework: true,
  frameworkVersion: true,
  reviewMethod: true,
  reviewBasisCitationId: true,
  reviewedSourceHash: true,
  hashAlgorithm: true,
  reviewedBy: true,
  reviewedAt: true,
  notApplicableReason: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EvidenceAppraisalSelect

type AppraisalReviewClient = Pick<
  PrismaClient,
  'sourceDoc' | 'sourceCitation' | 'evidenceAppraisal'
>

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run', '--template-check'])
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
  const templateCheck = argv.includes('--template-check')
  if ([apply, argv.includes('--dry-run'), templateCheck].filter(Boolean).length > 1) {
    throw new Error('--apply, --dry-run, and --template-check are mutually exclusive')
  }
  return {
    apply,
    templateCheck,
    ack: argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find(argument => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

async function inspectEvidenceAppraisalReview(
  client: AppraisalReviewClient,
  manifest: CompletedEvidenceAppraisalReviewManifest,
) {
  const sourceDocIds = manifest.entries.map(entry => entry.targetId)
  const citationIds = manifest.entries.map(entry => entry.reviewBasisCitationId)
  const appraisalIds = manifest.entries.map(entry => entry.appraisalId)
  const [sourceDocs, citations, appraisals] = await Promise.all([
    client.sourceDoc.findMany({
      where: { id: { in: sourceDocIds } },
      select: sourceDocSelect,
    }),
    client.sourceCitation.findMany({
      where: { id: { in: citationIds } },
      select: sourceCitationSelect,
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { id: { in: appraisalIds } },
          { sourceDocId: { in: sourceDocIds } },
        ],
      },
      select: evidenceAppraisalSelect,
    }),
  ])
  return buildEvidenceAppraisalReviewPlan(manifest, sourceDocs, citations, appraisals)
}

function planSha256(plan: EvidenceAppraisalReviewPlan) {
  return sha256EvidenceAppraisalReviewJson(evidenceAppraisalReviewPlanContract(plan))
}

function printPlan(plan: EvidenceAppraisalReviewPlan, digest: string) {
  console.log('Human-reviewed EvidenceAppraisal pilot plan')
  console.log(`Plan SHA-256: ${digest}`)
  console.log(
    `Targets: ${plan.summary.total}; pending creates: ${plan.summary.pendingCreates}; ` +
    `already applied: ${plan.summary.alreadyApplied}; conflicts: ${plan.summary.conflicts}`,
  )
  console.log(JSON.stringify(evidenceAppraisalReviewPlanContract(plan), null, 2))
}

function verifyReviewArtifacts(manifest: CompletedEvidenceAppraisalReviewManifest) {
  const evidenceRoot = resolve(process.cwd(), 'research/evidence-pack')
  for (const entry of manifest.entries) {
    const artifactPath = resolve(process.cwd(), entry.reviewArtifactPath)
    if (!artifactPath.startsWith(`${evidenceRoot}${sep}`)) {
      throw new Error(`Review artifact escaped the evidence-pack root: SourceDoc:${entry.targetId}`)
    }
    let bytes: Buffer
    try {
      bytes = readFileSync(artifactPath)
    } catch {
      throw new Error(
        `Durable review artifact is unavailable for SourceDoc:${entry.targetId}: ${entry.reviewArtifactPath}`,
      )
    }
    if (bytes.length < 5 || bytes.subarray(0, 5).toString('ascii') !== '%PDF-') {
      throw new Error(`Review artifact is not a PDF: SourceDoc:${entry.targetId}`)
    }
    const actualHash = createHash('sha256').update(bytes).digest('hex')
    if (actualHash !== entry.expectedSourceHash || actualHash !== entry.reviewedSourceHash) {
      throw new Error(`Reviewed PDF SHA-256 mismatch for SourceDoc:${entry.targetId}`)
    }
  }
}

function appraisalCreateData(
  target: EvidenceAppraisalCreateTarget,
): Prisma.EvidenceAppraisalUncheckedCreateInput {
  return {
    ...target,
    reviewedAt: new Date(target.reviewedAt),
  }
}

async function findAbsenceCasMismatches(
  client: AppraisalReviewClient,
  plan: EvidenceAppraisalReviewPlan,
) {
  const checks = await Promise.all(plan.creates.map(async row => ({
    targetId: row.targetId,
    count: await client.evidenceAppraisal.count({
      where: {
        OR: [
          { id: row.appraisalId },
          { sourceDocId: row.targetId },
        ],
      },
    }),
  })))
  return checks.filter(check => check.count !== 0)
}

function reviewLogEvent(
  eventId: string,
  manifest: CompletedEvidenceAppraisalReviewManifest,
  plan: EvidenceAppraisalReviewPlan,
  digest: string,
  createdCount: number,
) {
  return {
    eventId,
    phase: 'applied',
    committed: true,
    loggedAt: new Date().toISOString(),
    workflowId: manifest.workflowId,
    manifestSha256: plan.manifestSha256,
    planSha256: digest,
    createdCount,
    reviews: manifest.entries
      .map(entry => ({
        appraisalId: entry.appraisalId,
        target: `${entry.targetKind}:${entry.targetId}`,
        status: entry.status,
        reviewBasisCitationId: entry.reviewBasisCitationId,
        reviewedSourceHash: entry.reviewedSourceHash,
        reviewedBy: entry.reviewedBy,
        reviewedAt: entry.reviewedAt,
      }))
      .sort((left, right) => left.target.localeCompare(right.target)),
  }
}

function appendReviewEvent(event: Record<string, unknown>) {
  const path = resolve(process.cwd(), REVIEW_LOG_PATH)
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(event)}\n`, { encoding: 'utf8', flag: 'a' })
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
  if (args.apply && !/^[a-f0-9]{64}$/u.test(args.expectedPlanSha256 ?? '')) {
    throw new Error('--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run')
  }

  if (args.templateCheck) {
    const template = validateEvidenceAppraisalReviewTemplate(EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST)
    const pendingTargets = template.entries
      .filter(entry => entry.reviewState === 'pending_human_review')
      .map(entry => `${entry.targetKind}:${entry.targetId}`)
    console.log(JSON.stringify({
      mode: 'template-check',
      targetContractSha256: sha256EvidenceAppraisalReviewJson(
        evidenceAppraisalReviewTargetContract(template),
      ),
      readyForDatabaseDryRun: pendingTargets.length === 0,
      pendingTargets,
    }, null, 2))
    return
  }

  // This validation deliberately happens before DATABASE_URL is checked or a
  // Prisma client is constructed. The blank template cannot query the DB.
  const manifest = validateCompletedEvidenceAppraisalReviewManifest(
    EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST,
  )
  verifyReviewArtifacts(manifest)
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const plan = await inspectEvidenceAppraisalReview(prisma, manifest)
    const digest = planSha256(plan)
    printPlan(plan, digest)
    if (plan.conflicts.length > 0) {
      throw new Error('EvidenceAppraisal review conflicts detected; refusing all mutation')
    }
    const casMismatches = await findAbsenceCasMismatches(prisma, plan)
    if (casMismatches.length > 0) {
      throw new Error(
        `EvidenceAppraisal absence CAS preflight mismatch: ${casMismatches.map(row => row.targetId).join(', ')}`,
      )
    }
    if (!args.apply) {
      console.log(
        `Dry run only. After full plan review, re-run with --apply --ack=${APPLY_ACK} ` +
        `--plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current plan differs from --plan-sha256; rerun dry-run and review the new plan')
    }

    const eventId = randomUUID()
    const createdCount = await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `
      await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "SourceDoc"
        WHERE "id" IN (${Prisma.join([...EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS])})
        ORDER BY "id" FOR SHARE
      `)
      const citationIds = manifest.entries.map(entry => entry.reviewBasisCitationId)
      await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "SourceCitation"
        WHERE "id" IN (${Prisma.join(citationIds)})
        ORDER BY "id" FOR SHARE
      `)
      await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "FieldCitation"
        WHERE "citationId" IN (${Prisma.join(citationIds)})
        ORDER BY "id" FOR SHARE
      `)
      const appraisalIds = manifest.entries.map(entry => entry.appraisalId)
      await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT "id" FROM "EvidenceAppraisal"
        WHERE "id" IN (${Prisma.join(appraisalIds)})
           OR "sourceDocId" IN (${Prisma.join([...EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS])})
        ORDER BY "id" FOR UPDATE
      `)

      const lockedPlan = await inspectEvidenceAppraisalReview(transaction, manifest)
      const lockedDigest = planSha256(lockedPlan)
      if (lockedPlan.conflicts.length > 0 || lockedDigest !== args.expectedPlanSha256) {
        throw new Error('Concurrent EvidenceAppraisal review drift changed the reviewed plan')
      }
      const lockedCasMismatches = await findAbsenceCasMismatches(transaction, lockedPlan)
      if (lockedCasMismatches.length > 0) {
        throw new Error('Concurrent EvidenceAppraisal insert violated the absence CAS')
      }
      verifyReviewArtifacts(manifest)

      for (const row of lockedPlan.creates) {
        await transaction.evidenceAppraisal.create({ data: appraisalCreateData(row.target) })
      }

      const afterPlan = await inspectEvidenceAppraisalReview(transaction, manifest)
      if (
        afterPlan.conflicts.length > 0 ||
        afterPlan.creates.length > 0 ||
        afterPlan.alreadyAppliedIds.length !== EVIDENCE_APPRAISAL_REVIEW_TARGET_IDS.length
      ) {
        throw new Error('Post-write EvidenceAppraisal verification failed; transaction will roll back')
      }
      return lockedPlan.creates.length
    }, { isolationLevel: 'Serializable' })

    try {
      appendReviewEvent(reviewLogEvent(eventId, manifest, plan, digest, createdCount))
      console.log('Committed review event appended to the audit log')
    } catch (logError) {
      const detail = logError instanceof Error ? logError.message : String(logError)
      console.warn(
        `EvidenceAppraisal rows committed, but the advisory review log could not be appended: ${detail}. ` +
        'The database remains the authoritative commit record.',
      )
    }
    console.log(`Human-reviewed EvidenceAppraisal pilot applied atomically: ${createdCount} row(s) created`)
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(
        `EvidenceAppraisal review conflicted with a concurrent write; the Serializable transaction ` +
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
    console.error(error instanceof Error ? error.message : 'EvidenceAppraisal review failed')
    process.exitCode = 1
  })
}
