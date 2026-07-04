import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH,
  LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH,
  buildLibraryAnalysisRepairBacklog,
  formatLibraryAnalysisRepairBacklogMarkdown,
  resolveLibraryAnalysisRepairPathFacts,
  summarizeLibraryAnalysisRecordDistribution,
  type LibraryAnalysisRepairBacklogInput,
} from '../src/lib/library-analysis-repair-backlog'

async function main() {
  const generatedAt = new Date().toISOString()
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for library analysis repair backlog generation')
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  try {
    const allRecords = await prisma.libraryAnalysisRecord.findMany({
      select: {
        status: true,
        usageRule: true,
        sourceKind: true,
        riskFlags: true,
        canonicalPath: true,
        documentId: true,
        sourceDocId: true,
      },
    })
    const records = await prisma.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { riskFlags: { has: 'missing_text' } },
          { riskFlags: { has: 'low_text_quality' } },
        ],
      },
      select: {
        sourceKind: true,
        sourceKey: true,
        title: true,
        canonicalPath: true,
        documentId: true,
        sourceDocId: true,
        wordCount: true,
        riskFlags: true,
        citationReadiness: true,
        document: {
          select: {
            filePath: true,
            url: true,
            archivedUrl: true,
            metadata: true,
            sourceDoc: {
              select: {
                filename: true,
                sourceType: true,
                url: true,
                doi: true,
                archivedUrl: true,
              },
            },
            sourceCitations: {
              select: {
                localPath: true,
                url: true,
              },
            },
          },
        },
        sourceDoc: {
          select: {
            filename: true,
            sourceType: true,
            url: true,
            doi: true,
            archivedUrl: true,
          },
        },
      },
      orderBy: [
        { sourceKind: 'asc' },
        { wordCount: 'asc' },
        { title: 'asc' },
      ],
    })

    const backlog = buildLibraryAnalysisRepairBacklog(records.map(toRepairInput))
    const recordDistribution = summarizeLibraryAnalysisRecordDistribution(allRecords)
    const markdown = formatLibraryAnalysisRepairBacklogMarkdown(backlog, {
      generatedAt,
      jsonPath: LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH,
      recordDistribution,
    })

    writeArtifact(LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH, markdown)
    writeArtifact(
      LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH,
      JSON.stringify({ generatedAt, recordDistribution, ...backlog }, null, 2) + '\n',
    )

    console.log(`Library repair backlog rows: ${backlog.total}`)
    for (const [kind, count] of Object.entries(backlog.summary.byRepairKind)) {
      console.log(`  ${kind}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

function toRepairInput(record: {
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  documentId: string | null
  sourceDocId: string | null
  wordCount: number
  riskFlags: string[]
  citationReadiness: string | null
  document: {
    filePath: string | null
    url: string | null
    archivedUrl: string | null
    metadata: unknown
    sourceDoc: {
      filename: string
      sourceType: string
      url: string | null
      doi: string | null
      archivedUrl: string | null
    } | null
    sourceCitations: {
      localPath: string | null
      url: string | null
    }[]
  } | null
  sourceDoc: {
    filename: string
    sourceType: string
    url: string | null
    doi: string | null
    archivedUrl: string | null
  } | null
}): LibraryAnalysisRepairBacklogInput {
  const canonicalPath = record.canonicalPath ?? record.document?.filePath ?? null
  const pathFacts = resolveLibraryAnalysisRepairPathFacts(canonicalPath)
  const sourceDoc = record.sourceDoc ?? record.document?.sourceDoc ?? null
  const citations = record.document?.sourceCitations ?? []
  const metadata = metadataObject(record.document?.metadata)

  return {
    sourceKind: record.sourceKind,
    sourceKey: record.sourceKey,
    title: record.title,
    canonicalPath,
    documentId: record.documentId,
    sourceDocId: record.sourceDocId,
    wordCount: record.wordCount,
    riskFlags: record.riskFlags,
    citationReadiness: record.citationReadiness,
    pathState: pathFacts.pathState,
    pathResolution: pathFacts.pathResolution,
    resolvedPath: pathFacts.resolvedPath,
    extension: pathFacts.extension,
    sizeBucket: pathFacts.sizeBucket,
    sourceDocFilename: sourceDoc?.filename ?? null,
    sourceDocType: sourceDoc?.sourceType ?? null,
    hasCitationLocalPath: citations.some(citation => Boolean(citation.localPath)),
    hasCitationUrl: citations.some(citation => Boolean(citation.url)),
    documentUrl: record.document?.url ?? null,
    documentArchivedUrl: record.document?.archivedUrl ?? null,
    sourceDocUrl: sourceDoc?.url ?? null,
    sourceDocDoi: sourceDoc?.doi ?? null,
    sourceDocArchivedUrl: sourceDoc?.archivedUrl ?? null,
    provenanceType: stringMetadataValue(metadata, 'provenanceType'),
    generatedFrom: stringMetadataValue(metadata, 'generatedFrom'),
  }
}

function metadataObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function stringMetadataValue(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key]
  return typeof value === 'string' && value.trim() ? value : null
}

function writeArtifact(path: string, content: string) {
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
