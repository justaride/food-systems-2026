import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { candidateLocalFilePaths } from '../src/lib/local-file-locator'
import {
  buildLibraryAnalysisInventory,
  formatLibraryAnalysisLedgerJsonl,
  formatLibraryAnalysisSummaryMarkdown,
  type BuildLibraryAnalysisInventoryInput,
  type LibraryAnalysisInventoryRow,
  type LibraryInventoryFile,
} from '../src/lib/library-analysis-inventory'
import { summarizeLibraryAnalysisRecords } from '../src/lib/library-analysis'

export const LIBRARY_ANALYSIS_LEDGER_PATH = 'research/_status/library-analysis-ledger.jsonl'
export const LIBRARY_ANALYSIS_SUMMARY_PATH = 'research/_status/library-analysis-summary.md'

const TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.tsv'])
const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024
const MAX_PPTX_FILE_BYTES = 25 * 1024 * 1024

export function createLibraryAnalysisPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for DB-backed library analysis processing')
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export async function loadLibraryAnalysisInventory(options?: {
  requireDb?: boolean
}): Promise<LibraryAnalysisInventoryRow[]> {
  const libraryFiles = readResearchLibraryFiles()

  if (!process.env.DATABASE_URL) {
    if (options?.requireDb) {
      throw new Error('DATABASE_URL is required for this library analysis command')
    }
    return buildLibraryAnalysisInventory(emptyDbInput(libraryFiles))
  }

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const [documents, sourceDocs, reports, theses] = await Promise.all([
      prisma.document.findMany({
        select: {
          id: true,
          slug: true,
          title: true,
          filePath: true,
          url: true,
          archivedUrl: true,
          content: true,
          summary: true,
          wordCount: true,
          metadata: true,
          sourceDoc: {
            select: {
              id: true,
              url: true,
              doi: true,
              archivedUrl: true,
            },
          },
          report: { select: { id: true } },
          thesis: { select: { id: true } },
          sourceCitations: {
            select: {
              citationReadiness: true,
              url: true,
            },
          },
        },
      }),
      prisma.sourceDoc.findMany({
        select: {
          id: true,
          filename: true,
          title: true,
          description: true,
          documentId: true,
        },
      }),
      prisma.report.findMany({
        select: {
          id: true,
          title: true,
          documentId: true,
          keyFindings: true,
          relevance: true,
        },
      }),
      prisma.thesis.findMany({
        select: {
          id: true,
          title: true,
          documentId: true,
          synthesis: true,
          keyFindings: true,
        },
      }),
    ])

    return buildLibraryAnalysisInventory({
      documents: documents.map(document => ({
        ...document,
        hasLocalFile: localFileExists(document.filePath),
      })),
      sourceDocs,
      reports,
      theses,
      libraryFiles,
    })
  } finally {
    await prisma.$disconnect()
  }
}

function localFileExists(path: string | null | undefined): boolean {
  return candidateLocalFilePaths(path).some(candidate => existsSync(candidate))
}

export function writeLibraryAnalysisArtifacts(rows: LibraryAnalysisInventoryRow[]) {
  const ledgerPath = join(process.cwd(), LIBRARY_ANALYSIS_LEDGER_PATH)
  const summaryPath = join(process.cwd(), LIBRARY_ANALYSIS_SUMMARY_PATH)
  mkdirSync(join(process.cwd(), 'research/_status'), { recursive: true })
  writeFileSync(ledgerPath, formatLibraryAnalysisLedgerJsonl(rows), 'utf8')
  writeFileSync(summaryPath, formatLibraryAnalysisSummaryMarkdown(rows), 'utf8')
  return { ledgerPath, summaryPath }
}

export function summarizeRows(rows: LibraryAnalysisInventoryRow[]) {
  return summarizeLibraryAnalysisRecords(rows.map(row => ({
    status: row.classification.status,
    usageRule: row.classification.usageRule,
    claimCandidateCount: row.claimCandidateCount,
    riskFlags: row.riskFlags,
  })))
}

function emptyDbInput(libraryFiles: LibraryInventoryFile[]): BuildLibraryAnalysisInventoryInput {
  return {
    documents: [],
    sourceDocs: [],
    reports: [],
    theses: [],
    libraryFiles,
  }
}

function readResearchLibraryFiles(): LibraryInventoryFile[] {
  const root = process.cwd()
  const baseDir = join(root, 'research/bibliotek')
  if (!existsSync(baseDir)) return []

  const files: LibraryInventoryFile[] = []
  walk(baseDir, (filePath) => {
    const relPath = relative(root, filePath).replaceAll('\\', '/')
    if (!shouldIncludeResearchLibraryFile(relPath)) return
    files.push({
      path: relPath,
      title: titleFromFilePath(relPath),
      content: readTextFile(filePath),
    })
  })
  return files.sort((a, b) => a.path.localeCompare(b.path))
}

export function shouldIncludeResearchLibraryFile(path: string): boolean {
  return !(
    /\/media-scrape-report-[^/]+\.json$/i.test(path) ||
    /\/progress\.md$/i.test(path)
  )
}

function walk(dir: string, visit: (filePath: string) => void) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(fullPath, visit)
    } else if (entry.isFile()) {
      visit(fullPath)
    }
  }
}

function readTextFile(filePath: string): string {
  const extension = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  if (extension === '.pptx') return readPptxTextFile(filePath)
  if (!TEXT_EXTENSIONS.has(extension)) return ''
  if (statSync(filePath).size > MAX_TEXT_FILE_BYTES) return ''
  return readFileSync(filePath, 'utf8')
}

function readPptxTextFile(filePath: string): string {
  if (statSync(filePath).size > MAX_PPTX_FILE_BYTES) return ''
  const result = spawnSync('unzip', ['-p', filePath, 'ppt/slides/slide*.xml'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  return result.status === 0 ? extractPptxSlideText(result.stdout ?? '') : ''
}

export function extractPptxSlideText(xml: string): string {
  const parts: string[] = []
  const textPattern = /<a:t>([\s\S]*?)<\/a:t>/g
  let match: RegExpExecArray | null
  while ((match = textPattern.exec(xml)) !== null) {
    parts.push(decodeXmlText(match[1] ?? ''))
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

function decodeXmlText(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function titleFromFilePath(filePath: string): string {
  return filePath
    .split('/')
    .at(-1)!
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
}
