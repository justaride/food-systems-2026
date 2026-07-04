import {
  appendFileSync,
  mkdirSync,
} from 'node:fs'
import {
  dirname,
  resolve,
} from 'node:path'
import {
  createLibraryAnalysisPrismaClient,
  loadLibraryAnalysisInventory,
  summarizeRows,
} from './library-analysis-common'
import {
  findStaleLibraryAnalysisRecordIdentities,
  toLibraryAnalysisUpsertPayload,
} from '../src/lib/library-analysis-processing'

const PRUNE_BACKUP_PATH = 'research/_status/library-analysis-prune-backup.jsonl'

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const rows = await loadLibraryAnalysisInventory({ requireDb: apply })
  const summary = summarizeRows(rows)

  if (dryRun) {
    console.log(`Library analysis dry-run sources: ${summary.total}`)
    console.log(`Would queue review: ${summary.reviewRequired}`)
    console.log(`Would approve internal: ${summary.finished}`)
    return
  }

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const existingRecords = await prisma.libraryAnalysisRecord.findMany({
      select: {
        sourceKind: true,
        sourceKey: true,
      },
    })
    const staleRecords = findStaleLibraryAnalysisRecordIdentities(rows, existingRecords)
    let upserted = 0
    for (const row of rows) {
      const payload = toLibraryAnalysisUpsertPayload(row)
      await prisma.libraryAnalysisRecord.upsert(payload)
      upserted += 1
    }
    if (staleRecords.length > 0) {
      const staleRecordBackups = await prisma.libraryAnalysisRecord.findMany({
        where: {
          OR: staleRecords,
        },
      })
      appendBackup(PRUNE_BACKUP_PATH, staleRecordBackups.map(record => JSON.stringify({
        ...record,
        prunedAt: new Date().toISOString(),
      })).join('\n'))
      await prisma.libraryAnalysisRecord.deleteMany({
        where: {
          OR: staleRecords,
        },
      })
    }
    console.log(`Library analysis records upserted: ${upserted}`)
    console.log(`Library analysis stale records pruned: ${staleRecords.length}`)
    console.log(`Review queue: ${summary.reviewRequired}`)
  } finally {
    await prisma.$disconnect()
  }
}

function appendBackup(path: string, content: string) {
  if (!content) return
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  appendFileSync(absolutePath, `${content}\n`, 'utf8')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
