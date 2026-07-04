import 'dotenv/config'
import { appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH,
  buildLibraryAnalysisLocalTextRepairPlan,
  formatLibraryAnalysisLocalTextRepairPlanMarkdown,
  type LibraryAnalysisLocalTextRepairInput,
  type LibraryAnalysisLocalTextRepairPlan,
} from '../src/lib/library-analysis-local-text-repair'
import { LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH } from '../src/lib/library-analysis-repair-backlog'

const BACKUP_PATH = 'research/_status/library-analysis-local-text-repair-backup.jsonl'
const SUPPORTED_LOCAL_TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.tsv'])

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const generatedAt = new Date().toISOString()
  const repairBacklog = readJson<{
    rows: {
      sourceKey: string
      documentId: string | null
      title: string
      resolvedPath: string | null
      canonicalPath: string | null
      pathState: string
      extension: string
      repairBatch: string
      wordCount: number
    }[]
  }>(LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH)
  const candidateRows = repairBacklog.rows.filter(row => row.pathState === 'path_exists')
  const documentIds = [...new Set(
    candidateRows
      .map(row => row.documentId)
      .filter((id): id is string => Boolean(id)),
  )]

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      select: {
        id: true,
        content: true,
        wordCount: true,
      },
    })
    const documentById = new Map(documents.map(document => [document.id, document]))
    const inputs: LibraryAnalysisLocalTextRepairInput[] = candidateRows.map(row => {
      const path = row.resolvedPath ?? row.canonicalPath ?? ''
      const document = row.documentId ? documentById.get(row.documentId) : null
      const fileText = readLocalTextFile(path, row.extension)

      return {
        sourceKey: row.sourceKey,
        documentId: document?.id ?? null,
        title: row.title,
        path,
        extension: row.extension,
        repairBatch: row.repairBatch,
        existingContent: document?.content ?? '',
        existingWordCount: document?.wordCount ?? row.wordCount,
        fileText,
        fileWordCount: countWords(fileText),
      }
    })

    const plan = buildLibraryAnalysisLocalTextRepairPlan(inputs, { generatedAt })
    writeArtifact(
      LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH,
      formatLibraryAnalysisLocalTextRepairPlanMarkdown(plan, {
        jsonPath: LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH,
      JSON.stringify(toPlanHandoff(plan), null, 2) + '\n',
    )

    if (apply) {
      const updateRows = plan.rows.filter(row => row.action === 'update' && row.documentId && row.nextContent)
      const backupContent = updateRows.map(row => {
        const document = documentById.get(row.documentId!)
        return JSON.stringify({
          sourceKey: row.sourceKey,
          documentId: row.documentId,
          path: row.path,
          previousWordCount: document?.wordCount ?? 0,
          previousContent: document?.content ?? '',
          contentHashBefore: row.contentHashBefore,
          generatedAt,
        })
      }).join('\n')
      appendArtifact(BACKUP_PATH, backupContent ? `${backupContent}\n` : '')

      for (const row of updateRows) {
        await prisma.document.update({
          where: { id: row.documentId! },
          data: {
            content: row.nextContent!,
            wordCount: row.newWordCount,
          },
        })
      }
      console.log(`Library local text repair applied: ${updateRows.length} Document rows updated`)
      console.log(`Backup: ${BACKUP_PATH}`)
    } else if (dryRun) {
      console.log(`Library local text repair dry-run: ${plan.summary.updateRows} Document rows would update`)
    }

    console.log(`Total rows: ${plan.total}`)
    for (const [action, count] of Object.entries(plan.summary.byAction)) {
      console.log(`  ${action}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

function readLocalTextFile(path: string, extension: string): string {
  if (!SUPPORTED_LOCAL_TEXT_EXTENSIONS.has(extension)) return ''
  const absolutePath = resolve(process.cwd(), path)
  if (!existsSync(absolutePath)) return ''
  if (statSync(absolutePath).size > 2 * 1024 * 1024) return ''
  return readFileSync(absolutePath, 'utf8')
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
}

function writeArtifact(path: string, content: string) {
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

function appendArtifact(path: string, content: string) {
  if (!content) return
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  appendFileSync(absolutePath, content, 'utf8')
}

function toPlanHandoff(plan: LibraryAnalysisLocalTextRepairPlan) {
  return {
    ...plan,
    rows: plan.rows.map(row => ({
      ...row,
      nextContent: row.nextContent ? '[omitted from handoff; generated in-memory during repair]' : null,
    })),
  }
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
