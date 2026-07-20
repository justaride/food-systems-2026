import 'dotenv/config'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
  buildLibraryAnalysisUrlTextExtractionProfile,
  type LibraryAnalysisUrlContentKind,
  type LibraryAnalysisUrlExtractionMethod,
  type LibraryAnalysisUrlFetchStatus,
  type LibraryAnalysisUrlTextExtractionProfileInput,
  type LibraryAnalysisUrlTextExtractionProfileRow,
} from '../src/lib/library-analysis-url-text-extraction-profile'
import {
  LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH,
  buildLibraryAnalysisUrlTextRepairPlan,
  formatLibraryAnalysisUrlTextRepairPlanMarkdown,
  type LibraryAnalysisUrlTextRepairInput,
  type LibraryAnalysisUrlTextRepairPlan,
} from '../src/lib/library-analysis-url-text-repair'

const BACKUP_PATH = 'research/_status/library-analysis-url-text-repair-backup.jsonl'
const MAX_BYTES = 20 * 1024 * 1024
const FETCH_TIMEOUT_MS = 12_000
const URL_TEXT_REPAIR_CONCURRENCY = 6

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const generatedAt = new Date().toISOString()
  const limit = parseLimit()
  const profile = readJson<{ rows: LibraryAnalysisUrlTextExtractionProfileRow[] }>(
    LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
  )
  const candidateRows = profile.rows
    .filter(row => isExtractable(row.status))
    .slice(0, limit ?? undefined)
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
        updatedAt: true,
      },
    })
    const documentById = new Map(documents.map(document => [document.id, document]))

    const inputs = await runWithConcurrency(candidateRows, URL_TEXT_REPAIR_CONCURRENCY, async row => {
      const url = row.finalUrl ?? row.url
      const document = row.documentId ? documentById.get(row.documentId) : null
      const extraction = url ? await fetchAndExtractUrlText(url) : missingUrlExtraction()
      const profileInput: LibraryAnalysisUrlTextExtractionProfileInput = {
        sourceKey: row.sourceKey,
        documentId: row.documentId,
        title: row.title,
        repairBatch: row.repairBatch,
        url,
        finalUrl: extraction.finalUrl,
        existingWordCount: document?.wordCount ?? row.existingWordCount,
        fetchStatus: extraction.fetchStatus,
        httpStatus: extraction.httpStatus,
        contentType: extraction.contentType,
        contentKind: extraction.contentKind,
        extractionMethod: extraction.extractionMethod,
        byteLength: extraction.byteLength,
        extractedWordCount: extraction.extractedWordCount,
        extractedContentHash: extraction.extractedText ? sha256(extraction.extractedText) : null,
        error: extraction.error,
      }
      const classified = buildLibraryAnalysisUrlTextExtractionProfile([profileInput], {
        generatedAt,
      }).rows[0]

      return {
        sourceKey: row.sourceKey,
        documentId: document?.id ?? null,
        existingUpdatedAt: document?.updatedAt.toISOString() ?? null,
        title: row.title,
        repairBatch: row.repairBatch,
        url,
        finalUrl: extraction.finalUrl,
        existingContent: document?.content ?? '',
        existingWordCount: document?.wordCount ?? row.existingWordCount,
        extractedText: extraction.extractedText,
        extractedWordCount: extraction.extractedWordCount,
        extractionStatus: classified.status,
        contentKind: extraction.contentKind,
        extractionMethod: extraction.extractionMethod,
      } satisfies LibraryAnalysisUrlTextRepairInput
    })

    const plan = buildLibraryAnalysisUrlTextRepairPlan(inputs, { generatedAt })
    writeArtifact(
      LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH,
      formatLibraryAnalysisUrlTextRepairPlanMarkdown(plan, {
        jsonPath: LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH,
      JSON.stringify(toPlanHandoff(plan), null, 2) + '\n',
    )

    if (apply) {
      const updateRows = plan.rows.filter(row => row.action === 'update' && row.documentId && row.nextContent)
      const backupContent = updateRows.map(row => {
        const document = documentById.get(row.documentId!)
        return JSON.stringify({
          sourceKey: row.sourceKey,
          documentId: row.documentId,
          url: row.finalUrl ?? row.url,
          previousWordCount: document?.wordCount ?? 0,
          previousContent: document?.content ?? '',
          expectedUpdatedAt: row.expectedUpdatedAt,
          contentHashBefore: row.contentHashBefore,
          generatedAt,
        })
      }).join('\n')

      try {
        await prisma.$transaction(async transaction => {
          for (const row of updateRows) {
            const expectedDocument = documentById.get(row.documentId!)
            if (!expectedDocument || !row.expectedUpdatedAt) {
              throw new Error(
                `Library URL text repair conflict for ${row.sourceKey}: target Document snapshot is missing; no rows updated`,
              )
            }
            const result = await transaction.document.updateMany({
              where: {
                id: row.documentId!,
                updatedAt: new Date(row.expectedUpdatedAt),
                wordCount: row.existingWordCount,
                content: expectedDocument.content,
              },
              data: {
                content: row.nextContent!,
                wordCount: row.newWordCount,
              },
            })
            if (result.count !== 1) {
              throw new Error(
                `Library URL text repair conflict for ${row.sourceKey} (${row.documentId}): Document changed since planning; no rows updated`,
              )
            }
          }
        }, { isolationLevel: 'Serializable' })
      } catch (error) {
        if (isConcurrentWriteConflict(error)) {
          throw new Error(
            'Library URL text repair conflict: a Document changed during apply; no rows updated. Regenerate the dry-run plan and retry.',
            { cause: error },
          )
        }
        throw error
      }

      appendArtifact(BACKUP_PATH, backupContent ? `${backupContent}\n` : '')
      console.log(`Library URL text repair applied: ${updateRows.length} Document rows updated`)
      console.log(`Backup: ${BACKUP_PATH}`)
    } else if (dryRun) {
      console.log(`Library URL text repair dry-run: ${plan.summary.updateRows} Document rows would update`)
    }

    console.log(`Total rows: ${plan.total}`)
    for (const [action, count] of Object.entries(plan.summary.byAction)) {
      console.log(`  ${action}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH}`)
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
  extractedText: string
  extractedWordCount: number
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
      extractedText: extracted.text,
      extractedWordCount: countWords(extracted.text),
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
  const tempDir = mkdtempSync(join(tmpdir(), 'library-url-repair-'))
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
    extractedText: '',
    extractedWordCount: 0,
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

function isExtractable(status: string): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
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

function appendArtifact(path: string, content: string) {
  if (!content) return
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  appendFileSync(absolutePath, content, 'utf8')
}

function toPlanHandoff(plan: LibraryAnalysisUrlTextRepairPlan) {
  return {
    ...plan,
    rows: plan.rows.map(row => ({
      ...row,
      nextContent: row.nextContent ? '[omitted from handoff; generated in-memory during repair]' : null,
    })),
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

function isConcurrentWriteConflict(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2034'
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
