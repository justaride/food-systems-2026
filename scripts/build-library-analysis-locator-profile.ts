import 'dotenv/config'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, relative, resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH,
  buildLibraryAnalysisLocatorProfile,
  formatLibraryAnalysisLocatorProfileMarkdown,
  type LibraryAnalysisLocatorProfileInput,
} from '../src/lib/library-analysis-locator-profile'
import { LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH } from '../src/lib/library-analysis-repair-backlog'

const LOCATOR_PROFILE_REPAIR_KINDS = new Set([
  'missing_document_locator',
  'url_backed_low_text',
  'seeded_report_stub',
])

async function main() {
  const generatedAt = new Date().toISOString()
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for library analysis locator profile generation')
  }

  const repairBacklog = readJson<{
    rows: {
      sourceKey: string
      title: string
      repairKind: string
      repairBatch: string
      documentId: string | null
      sourceDocId: string | null
      sourceDocFilename: string | null
    }[]
  }>(LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH)
  const rows = repairBacklog.rows.filter(row => LOCATOR_PROFILE_REPAIR_KINDS.has(row.repairKind))
  const documentIds = [...new Set(rows.map(row => row.documentId).filter((id): id is string => Boolean(id)))]
  const sourceDocIds = [...new Set(rows.map(row => row.sourceDocId).filter((id): id is string => Boolean(id)))]
  const localFilesByBasename = buildLocalFileBasenameIndex()

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const [documents, sourceDocs, citations] = await Promise.all([
      prisma.document.findMany({
        where: { id: { in: documentIds } },
        select: {
          id: true,
          url: true,
          archivedUrl: true,
        },
      }),
      prisma.sourceDoc.findMany({
        where: { id: { in: sourceDocIds } },
        select: {
          id: true,
          url: true,
          doi: true,
          archivedUrl: true,
        },
      }),
      prisma.sourceCitation.findMany({
        where: {
          OR: [
            { documentId: { in: documentIds } },
            { sourceDocId: { in: sourceDocIds } },
          ],
        },
        select: {
          documentId: true,
          sourceDocId: true,
          url: true,
          localPath: true,
        },
      }),
    ])
    const documentById = new Map(documents.map(document => [document.id, document]))
    const sourceDocById = new Map(sourceDocs.map(sourceDoc => [sourceDoc.id, sourceDoc]))
    const inputs: LibraryAnalysisLocatorProfileInput[] = rows.map(row => {
      const document = row.documentId ? documentById.get(row.documentId) : null
      const sourceDoc = row.sourceDocId ? sourceDocById.get(row.sourceDocId) : null
      const rowCitations = citations.filter(citation => (
        (row.documentId && citation.documentId === row.documentId) ||
        (row.sourceDocId && citation.sourceDocId === row.sourceDocId)
      ))

      return {
        sourceKey: row.sourceKey,
        title: row.title,
        repairBatch: row.repairBatch,
        documentId: row.documentId,
        sourceDocId: row.sourceDocId,
        sourceDocFilename: row.sourceDocFilename,
        documentUrl: document?.url ?? null,
        documentArchivedUrl: document?.archivedUrl ?? null,
        sourceDocUrl: sourceDoc?.url ?? null,
        sourceDocDoi: sourceDoc?.doi ?? null,
        sourceDocArchivedUrl: sourceDoc?.archivedUrl ?? null,
        citationUrlCount: rowCitations.filter(citation => Boolean(citation.url)).length,
        citationLocalPathCount: rowCitations.filter(citation => Boolean(citation.localPath)).length,
        localFilenameMatches: row.sourceDocFilename
          ? localFilesByBasename.get(row.sourceDocFilename) ?? []
          : [],
      }
    })

    const profile = buildLibraryAnalysisLocatorProfile(inputs, { generatedAt })
    writeArtifact(
      LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH,
      formatLibraryAnalysisLocatorProfileMarkdown(profile, {
        jsonPath: LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH,
      JSON.stringify(profile, null, 2) + '\n',
    )

    console.log(`Library locator profile rows: ${profile.total}`)
    for (const [status, count] of Object.entries(profile.summary.byLocatorStatus)) {
      console.log(`  ${status}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

function buildLocalFileBasenameIndex(): Map<string, string[]> {
  const root = process.cwd()
  const index = new Map<string, string[]>()
  for (const topLevelDir of ['research', 'docs']) {
    const absoluteDir = join(root, topLevelDir)
    if (!existsSync(absoluteDir)) continue
    walkFiles(absoluteDir, filePath => {
      const relPath = relative(root, filePath).replaceAll('\\', '/')
      const name = basename(filePath)
      const existing = index.get(name) ?? []
      existing.push(relPath)
      index.set(name, existing.sort())
    })
  }
  return index
}

function walkFiles(dir: string, visit: (filePath: string) => void) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkFiles(fullPath, visit)
    } else if (entry.isFile()) {
      visit(fullPath)
    }
  }
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
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
