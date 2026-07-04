import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
  LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH,
  LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH,
  buildLibraryAnalysisDecisionQueue,
  formatLibraryAnalysisDecisionQueueMarkdown,
  type LibraryAnalysisDecisionQueueInput,
} from '../src/lib/library-analysis-decision-queue'
import { LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH } from '../src/lib/library-analysis-local-text-repair'
import { LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH } from '../src/lib/library-analysis-repair-backlog'
import { LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH } from '../src/lib/library-analysis-url-text-extraction-profile'

function main() {
  const generatedAt = new Date().toISOString()
  const repairBacklog = readJson<{
    rows: {
      sourceKey: string
      title: string
      repairKind: string
      repairBatch: string
      wordCount: number
      canonicalPath: string | null
      documentUrl: string | null
      documentArchivedUrl: string | null
      sourceDocUrl: string | null
      sourceDocDoi: string | null
      sourceDocArchivedUrl: string | null
    }[]
  }>(LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH)
  const localTextPlan = readJson<{
    rows: {
      sourceKey: string
      action: string
    }[]
  }>(LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH)
  const urlTextProfile = readJson<{
    rows: {
      sourceKey: string
      status: string
      finalUrl: string | null
      url: string | null
    }[]
  }>(LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH)

  const localActionBySourceKey = new Map(localTextPlan.rows.map(row => [row.sourceKey, row.action]))
  const urlStatusBySourceKey = new Map(urlTextProfile.rows.map(row => [row.sourceKey, row.status]))
  const urlBySourceKey = new Map(
    urlTextProfile.rows.map(row => [row.sourceKey, row.finalUrl ?? row.url]),
  )

  const inputs: LibraryAnalysisDecisionQueueInput[] = repairBacklog.rows.map(row => ({
    sourceKey: row.sourceKey,
    title: row.title,
    repairKind: row.repairKind,
    repairBatch: row.repairBatch,
    wordCount: row.wordCount,
    canonicalPath: row.canonicalPath,
    url: urlBySourceKey.get(row.sourceKey) ?? effectiveUrl(row),
    urlExtractionStatus: urlStatusBySourceKey.get(row.sourceKey) ?? null,
    localRepairAction: localActionBySourceKey.get(row.sourceKey) ?? null,
  }))

  const queue = buildLibraryAnalysisDecisionQueue(inputs, { generatedAt })
  writeArtifact(
    LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH,
    formatLibraryAnalysisDecisionQueueMarkdown(queue, {
      jsonPath: LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH,
    }),
  )
  writeArtifact(
    LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH,
    JSON.stringify(queue, null, 2) + '\n',
  )

  console.log(`Library analysis decision queue rows: ${queue.total}`)
  for (const [kind, count] of Object.entries(queue.summary.byDecisionKind)) {
    console.log(`  ${kind}: ${count}`)
  }
  console.log(`Markdown: ${LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH}`)
  console.log(`JSON: ${LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH}`)
}

function effectiveUrl(row: {
  documentUrl: string | null
  documentArchivedUrl: string | null
  sourceDocUrl: string | null
  sourceDocDoi: string | null
  sourceDocArchivedUrl: string | null
}): string | null {
  return row.documentUrl ??
    row.documentArchivedUrl ??
    row.sourceDocUrl ??
    doiUrl(row.sourceDocDoi) ??
    row.sourceDocArchivedUrl ??
    null
}

function doiUrl(doi: string | null): string | null {
  if (!doi) return null
  return `https://doi.org/${doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')}`
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function writeArtifact(path: string, content: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, content)
}

main()
