import 'dotenv/config'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH,
  buildLibraryAnalysisUrlTextExtractionTargets,
  buildLibraryAnalysisUrlTextExtractionProfile,
  formatLibraryAnalysisUrlTextExtractionProfileMarkdown,
  type LibraryAnalysisUrlContentKind,
  type LibraryAnalysisUrlExtractionMethod,
  type LibraryAnalysisUrlFetchStatus,
  type LibraryAnalysisUrlTextExtractionProfileInput,
} from '../src/lib/library-analysis-url-text-extraction-profile'
import { LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH } from '../src/lib/library-analysis-locator-profile'
import { LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH } from '../src/lib/library-analysis-repair-backlog'

const MAX_BYTES = 20 * 1024 * 1024
const FETCH_TIMEOUT_MS = 12_000
const URL_TEXT_PROFILE_CONCURRENCY = 8

async function main() {
  const generatedAt = new Date().toISOString()
  const limit = parseLimit()
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for library analysis URL text extraction profiling')
  }

  const locatorProfile = readJson<{
    rows: {
      sourceKey: string
      documentId: string | null
      title: string
      repairBatch: string
      locatorStatus: string
      documentUrl: string | null
      documentArchivedUrl: string | null
      sourceDocUrl: string | null
      sourceDocDoi: string | null
      sourceDocArchivedUrl: string | null
    }[]
  }>(LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH)
  const repairBacklog = readJson<{
    rows: {
      sourceKey: string
      documentId: string | null
      title: string
      repairKind: string
      repairBatch: string
    }[]
  }>(LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH)
  const documentIds = [...new Set([
    ...locatorProfile.rows.map(row => row.documentId),
    ...repairBacklog.rows.map(row => row.documentId),
  ].filter((id): id is string => Boolean(id)))]

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  try {
    const documents = await prisma.document.findMany({
      where: { id: { in: documentIds } },
      select: {
        id: true,
        wordCount: true,
        url: true,
        archivedUrl: true,
        sourceDoc: {
          select: {
            url: true,
            doi: true,
            archivedUrl: true,
          },
        },
        sourceCitations: {
          select: {
            url: true,
            archivedUrl: true,
          },
        },
      },
    })
    const targets = buildLibraryAnalysisUrlTextExtractionTargets({
      locatorRows: locatorProfile.rows,
      backlogRows: repairBacklog.rows,
      documents,
      limit,
    })
    const inputs = await runWithConcurrency(targets, URL_TEXT_PROFILE_CONCURRENCY, async target => {
      const extraction = await fetchAndExtractUrlText(target.url)
      return {
        sourceKey: target.sourceKey,
        documentId: target.documentId,
        title: target.title,
        repairBatch: target.repairBatch,
        url: target.url,
        finalUrl: extraction.finalUrl,
        existingWordCount: target.existingWordCount,
        fetchStatus: extraction.fetchStatus,
        httpStatus: extraction.httpStatus,
        contentType: extraction.contentType,
        contentKind: extraction.contentKind,
        extractionMethod: extraction.extractionMethod,
        byteLength: extraction.byteLength,
        extractedWordCount: extraction.extractedWordCount,
        extractedContentHash: extraction.extractedContentHash,
        error: extraction.error,
      }
    })

    const profile = buildLibraryAnalysisUrlTextExtractionProfile(inputs, { generatedAt })
    writeArtifact(
      LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH,
      formatLibraryAnalysisUrlTextExtractionProfileMarkdown(profile, {
        jsonPath: LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
      JSON.stringify(profile, null, 2) + '\n',
    )

    console.log(`Library URL text extraction profile rows: ${profile.total}`)
    for (const [status, count] of Object.entries(profile.summary.byStatus)) {
      console.log(`  ${status}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

type UrlExtractionResult = {
  finalUrl: string | null
  fetchStatus: LibraryAnalysisUrlFetchStatus
  httpStatus: number | null
  contentType: string | null
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  byteLength: number
  extractedWordCount: number
  extractedContentHash: string | null
  error: string | null
}

async function fetchAndExtractUrlText(url: string): Promise<UrlExtractionResult> {
  try {
    const response = await fetch(url, {
      headers: {
        accept: 'application/pdf,text/html,text/plain,*/*;q=0.8',
        connection: 'close',
        'user-agent': 'FoodSystemsLibraryAnalysis/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    const contentType = response.headers.get('content-type')
    const contentLength = Number(response.headers.get('content-length') ?? 0)
    if (!response.ok) {
      await response.body?.cancel()
      return emptyExtraction({
        finalUrl: response.url,
        fetchStatus: 'http_error',
        httpStatus: response.status,
        contentType,
        error: `HTTP ${response.status}`,
      })
    }
    if (contentLength > MAX_BYTES) {
      await response.body?.cancel()
      return emptyExtraction({
        finalUrl: response.url,
        fetchStatus: 'too_large',
        httpStatus: response.status,
        contentType,
        byteLength: contentLength,
        error: `Content-Length ${contentLength} exceeds ${MAX_BYTES}`,
      })
    }

    const body = Buffer.from(await response.arrayBuffer())
    if (body.byteLength > MAX_BYTES) {
      return emptyExtraction({
        finalUrl: response.url,
        fetchStatus: 'too_large',
        httpStatus: response.status,
        contentType,
        byteLength: body.byteLength,
        error: `Downloaded ${body.byteLength} bytes exceeds ${MAX_BYTES}`,
      })
    }

    const extracted = extractBodyText(body, contentType, response.url)
    return {
      finalUrl: response.url,
      fetchStatus: 'ok',
      httpStatus: response.status,
      contentType,
      contentKind: extracted.contentKind,
      extractionMethod: extracted.extractionMethod,
      byteLength: body.byteLength,
      extractedWordCount: countWords(extracted.text),
      extractedContentHash: extracted.text ? sha256(extracted.text) : null,
      error: extracted.error,
    }
  } catch (error) {
    return emptyExtraction({
      finalUrl: null,
      fetchStatus: 'fetch_error',
      httpStatus: null,
      contentType: null,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

function extractBodyText(
  body: Buffer,
  contentType: string | null,
  finalUrl: string,
): {
  text: string
  contentKind: LibraryAnalysisUrlContentKind
  extractionMethod: LibraryAnalysisUrlExtractionMethod
  error: string | null
} {
  const normalizedContentType = contentType?.toLowerCase() ?? ''
  const lowerUrl = finalUrl.toLowerCase()
  if (body.subarray(0, 5).toString('utf8') === '%PDF-' ||
    normalizedContentType.includes('application/pdf') ||
    lowerUrl.endsWith('.pdf')) {
    const text = extractPdfText(body)
    return {
      text,
      contentKind: 'pdf',
      extractionMethod: 'pdf_pdftotext',
      error: text ? null : 'pdftotext produced no text',
    }
  }

  if (isUnsupportedContentType(normalizedContentType, lowerUrl)) {
    return {
      text: '',
      contentKind: 'unsupported',
      extractionMethod: 'none',
      error: `Unsupported content type ${contentType ?? 'unknown'}`,
    }
  }

  const decoded = body.toString('utf8')
  if (normalizedContentType.includes('text/html') || looksLikeHtml(decoded)) {
    return {
      text: htmlToText(decoded),
      contentKind: 'html',
      extractionMethod: 'html_text',
      error: null,
    }
  }
  if (normalizedContentType.startsWith('text/') || normalizedContentType.includes('application/json')) {
    return {
      text: normalizeWhitespace(decoded),
      contentKind: 'text',
      extractionMethod: 'plain_text',
      error: null,
    }
  }

  return {
    text: normalizeWhitespace(decoded),
    contentKind: 'unknown',
    extractionMethod: 'plain_text',
    error: null,
  }
}

function extractPdfText(body: Buffer): string {
  const tempDir = mkdtempSync(join(tmpdir(), 'library-url-text-'))
  const pdfPath = join(tempDir, 'source.pdf')
  try {
    writeFileSync(pdfPath, body)
    const result = spawnSync('pdftotext', ['-layout', pdfPath, '-'], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    })
    return result.status === 0 ? normalizeWhitespace(result.stdout ?? '') : ''
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

function isUnsupportedContentType(contentType: string, url: string): boolean {
  return contentType.includes('officedocument') ||
    contentType.includes('application/msword') ||
    contentType.includes('application/vnd.ms-') ||
    contentType.includes('application/zip') ||
    contentType.startsWith('image/') ||
    /\.(docx?|pptx?|xlsx?|zip)(?:$|[?#])/.test(url)
}

function looksLikeHtml(value: string): boolean {
  return /^\s*<!doctype html/i.test(value) || /^\s*<html[\s>]/i.test(value)
}

function htmlToText(html: string): string {
  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, ' ')
  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
  return normalizeWhitespace(text)
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function emptyExtraction(values: {
  finalUrl: string | null
  fetchStatus: LibraryAnalysisUrlFetchStatus
  httpStatus: number | null
  contentType: string | null
  byteLength?: number
  error: string | null
}): UrlExtractionResult {
  return {
    finalUrl: values.finalUrl,
    fetchStatus: values.fetchStatus,
    httpStatus: values.httpStatus,
    contentType: values.contentType,
    contentKind: 'unknown',
    extractionMethod: 'none',
    byteLength: values.byteLength ?? 0,
    extractedWordCount: 0,
    extractedContentHash: null,
    error: values.error,
  }
}

function missingUrlExtraction(): UrlExtractionResult {
  return emptyExtraction({
    finalUrl: null,
    fetchStatus: 'missing_url',
    httpStatus: null,
    contentType: null,
    error: 'No URL available',
  })
}

async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0
  const workerCount = Math.min(concurrency, items.length)

  await Promise.all(Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await worker(items[index], index)
    }
  }))

  return results
}

function parseLimit(): number | null {
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='))
  if (!limitArg) return null
  const value = Number(limitArg.slice('--limit='.length))
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : null
}

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(resolve(process.cwd(), path), 'utf8')) as T
}

function writeArtifact(path: string, content: string) {
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
