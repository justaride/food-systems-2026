import { randomUUID } from 'node:crypto'
import {
  appendFileSync,
  mkdirSync,
} from 'node:fs'
import {
  dirname,
  resolve,
} from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
  summarizeRows,
} from './library-analysis-common'
import {
  buildLibraryAnalysisSyncPlan,
  reconcileLibraryAnalysisUpsertPayload,
  toLibraryAnalysisCasWhere,
  toLibraryAnalysisRunCreatePayload,
  toLibraryAnalysisUpsertPayload,
  LIBRARY_ANALYSIS_TRIAGE_MODEL,
  LIBRARY_ANALYSIS_TRIAGE_PROMPT_VERSION,
  type LibraryAnalysisRunOptions,
  type LibraryAnalysisSyncClassification,
  type LibraryAnalysisSyncPlan,
} from '../src/lib/library-analysis-processing'

const APPROVAL_REVOCATION_BACKUP_PATH = 'research/_status/library-analysis-approval-revocation-backup.jsonl'

type ProcessMode = 'full' | 'create-only'

export type EffectiveLibraryAnalysisSyncPlan = {
  mode: ProcessMode
  actions: LibraryAnalysisSyncPlan['actions']
  counts: Record<LibraryAnalysisSyncClassification, number>
  keys: Record<LibraryAnalysisSyncClassification, string[]>
  skippedMaterialUpdates: number
  skippedApprovalActions: {
    preserved: string[]
    revoked: string[]
  }
}

export function buildEffectiveLibraryAnalysisSyncPlan(
  plan: LibraryAnalysisSyncPlan,
  mode: ProcessMode,
): EffectiveLibraryAnalysisSyncPlan {
  const actions = mode === 'create-only'
    ? plan.actions.filter(action => action.classification === 'create')
    : plan.actions
  const classifications: LibraryAnalysisSyncClassification[] = [
    'create', 'material_update', 'noop', 'stale',
  ]
  const counts = Object.fromEntries(classifications.map(classification => [
    classification,
    actions.filter(action => action.classification === classification).length,
  ])) as Record<LibraryAnalysisSyncClassification, number>
  const keys = Object.fromEntries(classifications.map(classification => [
    classification,
    actions
      .filter(action => action.classification === classification)
      .map(action => action.key),
  ])) as Record<LibraryAnalysisSyncClassification, string[]>
  const skippedMaterialActions = mode === 'create-only'
    ? plan.actions.filter(action => action.classification === 'material_update')
    : []
  return {
    mode,
    actions,
    counts,
    keys,
    skippedMaterialUpdates: skippedMaterialActions.length,
    skippedApprovalActions: {
      preserved: skippedMaterialActions
        .filter(action => action.approvalAction === 'preserved')
        .map(action => action.key),
      revoked: skippedMaterialActions
        .filter(action => action.approvalAction === 'revoked')
        .map(action => action.key),
    },
  }
}

function parseArgs(argv: string[]) {
  const allowed = new Set(['--apply', '--dry-run', '--create-only'])
  const unknown = argv.filter(argument => !allowed.has(argument))
  if (unknown.length > 0) throw new Error(`Unknown argument(s): ${unknown.join(', ')}`)
  if (argv.includes('--apply') && argv.includes('--dry-run')) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  return {
    apply: argv.includes('--apply'),
    mode: argv.includes('--create-only') ? 'create-only' as const : 'full' as const,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const apply = args.apply
  const dryRun = process.argv.includes('--dry-run') || !apply
  const rows = await loadLibraryAnalysisInventory({ requireDb: true })
  const summary = summarizeRows(rows)

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const existingRecords = await prisma.libraryAnalysisRecord.findMany({
      orderBy: [{ sourceKind: 'asc' }, { sourceKey: 'asc' }],
    })
    const plan = buildLibraryAnalysisSyncPlan(rows, existingRecords)
    const effectivePlan = buildEffectiveLibraryAnalysisSyncPlan(plan, args.mode)
    printSyncPlan(plan, effectivePlan, dryRun ? 'dry-run' : 'apply')
    if (dryRun) return

    // One run identity per invocation, so every row this batch analysed can be
    // read back together as a single run.
    const runOptions: LibraryAnalysisRunOptions = {
      runId: `${new Date().toISOString()}-${randomUUID().slice(0, 8)}`,
      aiModel: LIBRARY_ANALYSIS_TRIAGE_MODEL,
      promptVersion: LIBRARY_ANALYSIS_TRIAGE_PROMPT_VERSION,
    }

    let applied: {
      created: number
      materiallyUpdated: number
      runsAppended: number
      approvalsPreserved: number
      approvalsRevoked: number
      approvalRevocationBackups: string[]
    }
    try {
      applied = await prisma.$transaction(async transaction => {
        let transactionPlan = effectivePlan
        if (args.mode === 'create-only') {
          await transaction.$executeRawUnsafe(
            'LOCK TABLE "LibraryAnalysisRecord" IN SHARE ROW EXCLUSIVE MODE',
          )
          const lockedExistingRecords = await transaction.libraryAnalysisRecord.findMany({
            orderBy: [{ sourceKind: 'asc' }, { sourceKey: 'asc' }],
          })
          const lockedFullPlan = buildLibraryAnalysisSyncPlan(rows, lockedExistingRecords)
          transactionPlan = buildEffectiveLibraryAnalysisSyncPlan(lockedFullPlan, args.mode)
          if (
            JSON.stringify(transactionPlan.keys.create) !== JSON.stringify(effectivePlan.keys.create) ||
            transactionPlan.skippedMaterialUpdates !== effectivePlan.skippedMaterialUpdates
          ) {
            throw new LibraryAnalysisSyncConflict(
              'Create-only plan changed after review; no rows were created',
            )
          }
        }
        let created = 0
        let materiallyUpdated = 0
        let runsAppended = 0
        let approvalsPreserved = 0
        let approvalsRevoked = 0
        const approvalRevocationBackups: string[] = []

        for (const action of transactionPlan.actions) {
          if (action.classification === 'create' && action.row) {
            const upsert = toLibraryAnalysisUpsertPayload(action.row)
            const run = await transaction.libraryAnalysisRun.create({
              data: toLibraryAnalysisRunCreatePayload(upsert.create, runOptions),
            })
            await transaction.libraryAnalysisRecord.create({
              data: { ...upsert.create, currentRunId: run.id },
            })
            created += 1
            runsAppended += 1
            continue
          }
          if (
            action.classification !== 'material_update' ||
            !action.row ||
            !action.existing ||
            !action.expectedSnapshot
          ) {
            continue
          }

          const reconciliation = reconcileLibraryAnalysisUpsertPayload(action.row, action.existing)
          // The analysis is recorded even when the record does not adopt it.
          // A preserved external approval keeps its existing analysis, and
          // before this table that freshly computed result was discarded.
          const run = await transaction.libraryAnalysisRun.create({
            data: toLibraryAnalysisRunCreatePayload(reconciliation.payload.create, runOptions),
          })
          runsAppended += 1
          const result = await transaction.libraryAnalysisRecord.updateMany({
            where: toLibraryAnalysisCasWhere(action.expectedSnapshot),
            data: reconciliation.approvalAction === 'preserved'
              ? reconciliation.payload.update
              : { ...reconciliation.payload.update, currentRunId: run.id },
          })
          if (result.count !== 1) {
            throw new LibraryAnalysisSyncConflict(
              `CAS mismatch for ${action.key}; LibraryAnalysisRecord changed after planning`,
            )
          }
          materiallyUpdated += 1

          if (reconciliation.approvalAction === 'revoked') {
            approvalRevocationBackups.push(JSON.stringify({
              ...action.existing,
              revokedAt: new Date().toISOString(),
              replacementContentHash: action.row.contentHash,
              reasons: reconciliation.reasons,
            }))
            approvalsRevoked += 1
          } else if (reconciliation.approvalAction === 'preserved') {
            approvalsPreserved += 1
          }
        }

        const result = {
          created,
          materiallyUpdated,
          runsAppended,
          approvalsPreserved,
          approvalsRevoked,
          approvalRevocationBackups,
        }
        if (args.mode === 'create-only' && (
          result.materiallyUpdated !== 0 ||
          result.approvalsPreserved !== 0 ||
          result.approvalsRevoked !== 0 ||
          result.approvalRevocationBackups.length !== 0
        )) {
          throw new LibraryAnalysisSyncConflict(
            'Create-only postcondition failed: a material update or approval action was attempted',
          )
        }
        return result
      }, { isolationLevel: 'Serializable', timeout: 120_000 })
    } catch (error) {
      if (isLibraryAnalysisSyncConflict(error)) {
        throw new Error(
          'Library analysis apply conflict: the entire Serializable batch was rolled back and zero batch writes were committed. Regenerate the dry-run plan and retry.',
          { cause: error },
        )
      }
      throw error
    }

    appendBackup(
      APPROVAL_REVOCATION_BACKUP_PATH,
      applied.approvalRevocationBackups.join('\n'),
    )
    console.log(`Library analysis records created: ${applied.created}`)
    console.log(`Library analysis records materially updated: ${applied.materiallyUpdated}`)
    console.log(`Library analysis runs appended: ${applied.runsAppended}`)
    console.log(`Library analysis material updates skipped by create-only mode: ${effectivePlan.skippedMaterialUpdates}`)
    console.log(`Library analysis no-op records skipped: ${plan.counts.noop}`)
    console.log(`Library analysis stale records retained: ${plan.counts.stale}`)
    console.log(`Human external approvals preserved: ${applied.approvalsPreserved}`)
    console.log(`Human external approvals revoked for re-review: ${applied.approvalsRevoked}`)
    console.log(`Review queue: ${summary.reviewRequired}`)
  } finally {
    await prisma.$disconnect()
  }
}

class LibraryAnalysisSyncConflict extends Error {}

function isLibraryAnalysisSyncConflict(error: unknown): boolean {
  if (error instanceof LibraryAnalysisSyncConflict) return true
  if (!error || typeof error !== 'object') return false
  const code = 'code' in error ? error.code : null
  return code === 'P2002' || code === 'P2034'
}

function printSyncPlan(
  plan: LibraryAnalysisSyncPlan,
  effectivePlan: EffectiveLibraryAnalysisSyncPlan,
  runMode: 'dry-run' | 'apply',
) {
  const approvalActions = {
    preserved: plan.actions.filter(action => action.approvalAction === 'preserved').map(action => action.key),
    revoked: plan.actions.filter(action => action.approvalAction === 'revoked').map(action => action.key),
  }
  const effectiveApprovalActions = {
    preserved: effectivePlan.actions
      .filter(action => action.approvalAction === 'preserved')
      .map(action => action.key),
    revoked: effectivePlan.actions
      .filter(action => action.approvalAction === 'revoked')
      .map(action => action.key),
  }
  console.log(JSON.stringify({
    runMode,
    processMode: effectivePlan.mode,
    stalePolicy: `${plan.stalePolicy}: no database writes for stale rows`,
    discoveredPlan: {
      counts: plan.counts,
      keys: plan.keys,
      approvalActions,
    },
    effectivePlan: {
      counts: effectivePlan.counts,
      keys: effectivePlan.keys,
      skippedMaterialUpdates: effectivePlan.skippedMaterialUpdates,
      effectiveApprovalActions,
      skippedApprovalActions: effectivePlan.skippedApprovalActions,
    },
  }, null, 2))
}

function appendBackup(path: string, content: string) {
  if (!content) return
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  appendFileSync(absolutePath, `${content}\n`, 'utf8')
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch(error => {
    console.error(error)
    process.exitCode = 1
  })
}
