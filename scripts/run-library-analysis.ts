/**
 * Model analysis adapter for the research library.
 *
 * Two halves of one loop, deliberately separate so the model call is not
 * wired into the database write:
 *
 *   --emit-requests <path>   select sources and write the analysis requests,
 *                            including the exact source text, to a JSON file
 *   --from-file <path>       read the produced cards, run them through the
 *                            acceptance gate, and report
 *   --from-file <path> --apply   also append one LibraryAnalysisRun row per
 *                            accepted card
 *
 * Nothing here can promote, canonicalise or publish. It writes run rows only,
 * and a rejected card writes nothing at all.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { randomUUID } from 'node:crypto'
import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
} from './library-analysis-common'
import {
  acceptLibraryAnalysisCard,
  toLibraryAnalysisRunFromCard,
  LIBRARY_ANALYSIS_INSTRUCTIONS,
  LIBRARY_ANALYSIS_PROMPT_VERSION,
  type LibraryAnalysisRequest,
} from '../src/lib/library-analysis-adapter'
import type { LibraryAnalysisInventoryRow } from '../src/lib/library-analysis-inventory'

export type LibraryAnalysisArgs = {
  mode: 'emit' | 'ingest'
  path: string
  apply: boolean
  limit: number | null
  sourceKeys: string[]
}

export type LibraryAnalysisSubmission = {
  aiModel: string
  promptVersion?: string
  runId?: string
  analyses: { sourceKey: string; card: unknown }[]
}

export function parseLibraryAnalysisArgs(argv: string[]): LibraryAnalysisArgs {
  const emitIndex = argv.indexOf('--emit-requests')
  const fromIndex = argv.indexOf('--from-file')

  if ((emitIndex === -1) === (fromIndex === -1)) {
    throw new Error('Pass exactly one of --emit-requests <path> or --from-file <path>')
  }

  const mode = emitIndex === -1 ? 'ingest' : 'emit'
  const path = argv[(mode === 'emit' ? emitIndex : fromIndex) + 1]
  if (!path || path.startsWith('--')) {
    throw new Error(`${mode === 'emit' ? '--emit-requests' : '--from-file'} requires a file path`)
  }

  const apply = argv.includes('--apply')
  if (apply && mode === 'emit') {
    throw new Error('--apply is only valid with --from-file')
  }

  const limitIndex = argv.indexOf('--limit')
  const limitRaw = limitIndex === -1 ? null : argv[limitIndex + 1]
  if (limitIndex !== -1 && (!limitRaw || !/^[1-9]\d*$/.test(limitRaw))) {
    throw new Error('--limit requires a positive integer')
  }

  const sourceKeys: string[] = []
  for (const [index, value] of argv.entries()) {
    if (value !== '--source-key') continue
    const key = argv[index + 1]
    if (!key || key.startsWith('--')) throw new Error('--source-key requires a value')
    sourceKeys.push(key)
  }

  return { mode, path, apply, limit: limitRaw ? Number(limitRaw) : null, sourceKeys }
}

export function selectAnalysisRows(
  rows: LibraryAnalysisInventoryRow[],
  args: Pick<LibraryAnalysisArgs, 'limit' | 'sourceKeys'>,
): LibraryAnalysisInventoryRow[] {
  const ordered = [...rows].sort((left, right) => left.sourceKey.localeCompare(right.sourceKey))
  const selected = args.sourceKeys.length > 0
    ? ordered.filter(row => args.sourceKeys.includes(row.sourceKey))
    : ordered.filter(row => row.hasLocalFile && row.canonicalPath !== null)

  if (args.sourceKeys.length > 0) {
    const found = new Set(selected.map(row => row.sourceKey))
    const missing = args.sourceKeys.filter(key => !found.has(key))
    if (missing.length > 0) {
      throw new Error(`Unknown source keys: ${missing.join(', ')}`)
    }
  }

  return args.limit === null ? selected : selected.slice(0, args.limit)
}

export function toAnalysisRequest(
  row: LibraryAnalysisInventoryRow,
  text: string,
): LibraryAnalysisRequest {
  return {
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    title: row.title,
    canonicalPath: row.canonicalPath,
    documentId: row.linkedDocumentId,
    sourceDocId: row.linkedSourceDocId,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    text,
  }
}

export function parseSubmission(raw: string): LibraryAnalysisSubmission {
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Submission must be a JSON object')
  }
  const submission = parsed as Partial<LibraryAnalysisSubmission>
  if (!submission.aiModel?.trim()) {
    throw new Error('Submission must name the aiModel that produced the analyses')
  }
  if (!Array.isArray(submission.analyses)) {
    throw new Error('Submission must contain an analyses array')
  }
  for (const analysis of submission.analyses) {
    if (!analysis || typeof analysis !== 'object' || !('sourceKey' in analysis)) {
      throw new Error('Every analysis must name the sourceKey it belongs to')
    }
  }
  return {
    aiModel: submission.aiModel,
    promptVersion: submission.promptVersion,
    runId: submission.runId,
    analyses: submission.analyses,
  }
}

async function emitRequests(args: LibraryAnalysisArgs) {
  const rows = await loadLibraryAnalysisInventory({ requireDb: true })
  const selected = selectAnalysisRows(rows, args)
  const requests = selected.map(row => toAnalysisRequest(
    row,
    row.canonicalPath ? readFileSync(row.canonicalPath, 'utf8') : '',
  ))

  writeFileSync(args.path, `${JSON.stringify({
    promptVersion: LIBRARY_ANALYSIS_PROMPT_VERSION,
    instructions: LIBRARY_ANALYSIS_INSTRUCTIONS,
    requests,
  }, null, 2)}\n`)

  console.log(`Analysis requests written: ${requests.length} -> ${args.path}`)
  for (const request of requests) {
    console.log(`  ${request.sourceKey}  ${request.wordCount} words  ${request.canonicalPath ?? '(no path)'}`)
  }
}

async function ingestSubmission(args: LibraryAnalysisArgs) {
  const submission = parseSubmission(readFileSync(args.path, 'utf8'))
  const rows = await loadLibraryAnalysisInventory({ requireDb: true })
  const byKey = new Map(rows.map(row => [row.sourceKey, row]))

  const accepted: { request: LibraryAnalysisRequest; card: Parameters<typeof toLibraryAnalysisRunFromCard>[1] }[] = []
  const rejected: { sourceKey: string; issues: string[] }[] = []

  for (const analysis of submission.analyses) {
    const row = byKey.get(analysis.sourceKey)
    if (!row) {
      rejected.push({ sourceKey: analysis.sourceKey, issues: ['unknown_source_key'] })
      continue
    }
    const request = toAnalysisRequest(
      row,
      row.canonicalPath ? readFileSync(row.canonicalPath, 'utf8') : '',
    )
    const result = acceptLibraryAnalysisCard(request, analysis.card)
    if (result.accepted) {
      accepted.push({ request, card: result.card })
    } else {
      rejected.push({ sourceKey: result.sourceKey, issues: result.issues })
    }
  }

  console.log(JSON.stringify({
    runMode: args.apply ? 'apply' : 'dry-run',
    aiModel: submission.aiModel,
    promptVersion: submission.promptVersion ?? LIBRARY_ANALYSIS_PROMPT_VERSION,
    accepted: accepted.map(entry => entry.request.sourceKey),
    rejected,
  }, null, 2))

  if (rejected.length > 0) {
    // A rejected card is a failed analysis, not a partial success. Writing the
    // accepted half of a submission would leave a run that silently covered
    // fewer sources than it claims to.
    throw new Error(`${rejected.length} of ${submission.analyses.length} analyses were rejected; nothing was written`)
  }
  if (!args.apply) {
    console.log(`Dry run: ${accepted.length} analyses would be written. Re-run with --apply.`)
    return
  }

  const runOptions = {
    runId: submission.runId ?? `${new Date().toISOString()}-${randomUUID().slice(0, 8)}`,
    aiModel: submission.aiModel,
    promptVersion: submission.promptVersion ?? LIBRARY_ANALYSIS_PROMPT_VERSION,
  }

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    await prisma.$transaction(async transaction => {
      for (const entry of accepted) {
        await transaction.libraryAnalysisRun.create({
          data: toLibraryAnalysisRunFromCard(entry.request, entry.card, runOptions),
        })
      }
    }, { isolationLevel: 'Serializable', timeout: 120_000 })
  } finally {
    await prisma.$disconnect()
  }

  console.log(`Library analysis runs appended: ${accepted.length} (runId ${runOptions.runId})`)
}

async function main() {
  const args = parseLibraryAnalysisArgs(process.argv.slice(2))
  if (args.mode === 'emit') {
    await emitRequests(args)
    return
  }
  await ingestSubmission(args)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
