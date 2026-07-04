import 'dotenv/config'
import { spawnSync } from 'node:child_process'
import { appendFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH,
  buildLibraryAnalysisManualUrlMatchRepairPlan,
  formatLibraryAnalysisManualUrlMatchRepairPlanMarkdown,
  type LibraryAnalysisManualUrlMatchRepairMapping,
  type LibraryAnalysisManualUrlMatchRepairPlan,
  type LibraryAnalysisManualUrlMatchRepairUrl,
} from '../src/lib/library-analysis-manual-url-match-repair'
import type {
  LibraryAnalysisUrlContentKind,
  LibraryAnalysisUrlExtractionMethod,
} from '../src/lib/library-analysis-url-text-extraction-profile'

const BACKUP_PATH = 'research/_status/library-analysis-manual-url-match-backup.jsonl'
const MAX_BYTES = 20 * 1024 * 1024
const FETCH_TIMEOUT_MS = 12_000

const REVIEWED_URL_MATCHES: LibraryAnalysisManualUrlMatchRepairMapping[] = [
  {
    sourceKey: 'document:cmp8xyo4900jlvvvmghld2kdi',
    documentId: 'cmp8xyo4900jlvvvmghld2kdi',
    title: 'Capital raise and business model 2024',
    sourceUrl: 'https://presscloud.com/csp/vocast/message.csp?KEY=519058656948183&format=web',
    expectedTitleIncludes: ['Capital raise', 'business model'],
    expectedExistingUrlIncludes: ['agrain.com'],
    expectedExtractedTextIncludes: ['Agrain', 'DKK 26 million'],
    reviewNote: 'Reviewed Agrain press-release page resolved during P1 manual source repair.',
  },
  {
    sourceKey: 'document:cmp8xypc500luvvvme9ehlnlr',
    documentId: 'cmp8xypc500luvvvme9ehlnlr',
    title: 'Veg of Lund / DUG Foodtech aarsredovisning 2024',
    sourceUrl: 'https://mb.cision.com/Main/18795/4146365/3432515.pdf',
    expectedTitleIncludes: ['DUG Foodtech', '2024'],
    expectedExistingUrlIncludes: ['allabolag.se'],
    expectedExtractedTextIncludes: ['DUG FOODTECH', '2024'],
    reviewNote: 'Official DUG Foodtech 2024 annual-report PDF resolved from the 2025 publication notice.',
  },
  {
    sourceKey: 'document:cmp8xyph300mavvvmk4wxt3ry',
    documentId: 'cmp8xyph300mavvvmk4wxt3ry',
    title: 'Ljusgaarda AB aarsredovisning 2023',
    sourceUrl: 'https://www.hitta.se/f%C3%B6retagsinformation/ljusg%C3%A5rda%2Bab%2B%28publ%29/5591135321',
    expectedTitleIncludes: ['Ljusgaarda', '2023'],
    expectedExistingUrlIncludes: ['allabolag.se'],
    expectedExtractedTextIncludes: ['Ljusg', '559113', '2023'],
    reviewNote: 'Hitta company annual-report page resolved from organisation number 559113-5321 during P1 manual source repair.',
  },
  {
    sourceKey: 'document:cmp8xypko00mmvvvmaztul3oz',
    documentId: 'cmp8xypko00mmvvvmaztul3oz',
    title: 'Stockeld Dreamery AB aarsredovisning siste',
    sourceUrl: 'https://www.hitta.se/f%C3%B6retagsinformation/noquo%2Bfoods%2Bab/5591897193',
    expectedTitleIncludes: ['Stockeld Dreamery'],
    expectedExistingUrlIncludes: ['allabolag.se'],
    expectedExtractedTextIncludes: ['Stockeld Dreamery', '559189', '2023'],
    reviewNote: 'Hitta company annual-report page resolved from organisation number 559189-7193 during P1 manual source repair.',
  },
  {
    sourceKey: 'document:cmp8xypew00m2vvvm5l8kh29p',
    documentId: 'cmp8xypew00m2vvvm5l8kh29p',
    title: 'Hooked Foods AB siste aarsredovisning 2024',
    sourceUrl: 'https://krafman.se/hooked-foods-ab/5591619944/sammanfattning',
    expectedTitleIncludes: ['Hooked Foods', '2024'],
    expectedExistingUrlIncludes: ['allabolag.se'],
    expectedExtractedTextIncludes: ['Hooked Foods AB', '559161', '2024'],
    reviewNote: 'Krafman company annual-report summary page resolved from organisation number 559161-9944 during P1 manual source repair.',
  },
  {
    sourceKey: 'document:cmp8xypkg00mlvvvmy7dbtr2i',
    documentId: 'cmp8xypkg00mlvvvmy7dbtr2i',
    title: 'Rest Oslo - Green Star profile',
    sourceUrl: 'https://www.gausta.com/en-US/jimmy-oien/',
    expectedTitleIncludes: ['Rest Oslo', 'Green Star'],
    expectedExistingUrlIncludes: ['guide.michelin.com'],
    expectedExtractedTextIncludes: ['Rest in Oslo', 'Michelin Green Star', 'Young Chef 2022'],
    reviewNote: 'Gausta chef profile resolved as a controlled replacement locator after the original MICHELIN Guide restaurant profile became unavailable.',
  },
]

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const generatedAt = new Date().toISOString()
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const documents = await prisma.document.findMany({
      where: { id: { in: REVIEWED_URL_MATCHES.map(mapping => mapping.documentId) } },
      select: {
        id: true,
        title: true,
        url: true,
        content: true,
        wordCount: true,
      },
    })
    const urls = await Promise.all(REVIEWED_URL_MATCHES.map(mapping =>
      fetchAndExtractUrlText(mapping.sourceUrl)
    ))
    const plan = buildLibraryAnalysisManualUrlMatchRepairPlan({
      mappings: REVIEWED_URL_MATCHES,
      documents: documents.map(document => ({
        id: document.id,
        title: document.title,
        url: document.url,
        content: document.content ?? '',
        wordCount: document.wordCount ?? 0,
      })),
      urls,
      generatedAt,
    })

    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH,
      formatLibraryAnalysisManualUrlMatchRepairPlanMarkdown(plan, {
        jsonPath: LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH,
      JSON.stringify(toPlanHandoff(plan), null, 2) + '\n',
    )

    if (apply) {
      const documentById = new Map(documents.map(document => [document.id, document]))
      const updateRows = plan.rows.filter(row =>
        row.action === 'update' &&
        row.nextContent &&
        row.newUrl
      )
      const backupContent = updateRows.map(row => {
        const document = documentById.get(row.documentId)
        return JSON.stringify({
          sourceKey: row.sourceKey,
          documentId: row.documentId,
          previousUrl: document?.url ?? null,
          previousWordCount: document?.wordCount ?? 0,
          previousContent: document?.content ?? '',
          nextUrl: row.newUrl,
          contentHashBefore: row.contentHashBefore,
          generatedAt,
        })
      }).join('\n')
      await prisma.$transaction(updateRows.map(row =>
        prisma.document.update({
          where: { id: row.documentId },
          data: {
            url: row.newUrl,
            content: row.nextContent!,
            wordCount: row.newWordCount,
          },
        })
      ))
      appendArtifact(BACKUP_PATH, backupContent ? `${backupContent}\n` : '')
      console.log(`Library manual URL match repair applied: ${updateRows.length} Document rows updated`)
      console.log(`Backup: ${BACKUP_PATH}`)
    } else if (dryRun) {
      console.log(`Library manual URL match repair dry-run: ${plan.summary.updateRows} Document rows would update`)
    }

    console.log(`Total rows: ${plan.total}`)
    for (const [action, count] of Object.entries(plan.summary.byAction)) {
      console.log(`  ${action}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

async function fetchAndExtractUrlText(url: string): Promise<LibraryAnalysisManualUrlMatchRepairUrl> {
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
      return emptyUrlResult(url, response.url, 'unknown', 'none', `HTTP ${response.status}`)
    }
    if (contentLength > MAX_BYTES) {
      await response.body?.cancel()
      return emptyUrlResult(url, response.url, 'unknown', 'none', `Content-Length ${contentLength} exceeds ${MAX_BYTES}`)
    }

    const body = Buffer.from(await response.arrayBuffer())
    if (body.byteLength > MAX_BYTES) {
      return emptyUrlResult(url, response.url, 'unknown', 'none', `Downloaded ${body.byteLength} bytes exceeds ${MAX_BYTES}`)
    }

    const extracted = extractBodyText(body, contentType, response.url)
    return {
      url,
      finalUrl: response.url,
      text: extracted.text,
      wordCount: countWords(extracted.text),
      contentKind: extracted.contentKind,
      extractionMethod: extracted.extractionMethod,
      error: extracted.error,
    }
  } catch (error) {
    return emptyUrlResult(url, null, 'unknown', 'none', error instanceof Error ? error.message : String(error))
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
  if (
    body.subarray(0, 5).toString('utf8') === '%PDF-' ||
    normalizedContentType.includes('application/pdf') ||
    lowerUrl.endsWith('.pdf')
  ) {
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
  const tempDir = mkdtempSync(join(tmpdir(), 'library-manual-url-repair-'))
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

function emptyUrlResult(
  url: string,
  finalUrl: string | null,
  contentKind: LibraryAnalysisUrlContentKind,
  extractionMethod: LibraryAnalysisUrlExtractionMethod,
  error: string,
): LibraryAnalysisManualUrlMatchRepairUrl {
  return {
    url,
    finalUrl,
    text: '',
    wordCount: 0,
    contentKind,
    extractionMethod,
    error,
  }
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

function toPlanHandoff(plan: LibraryAnalysisManualUrlMatchRepairPlan) {
  return {
    ...plan,
    rows: plan.rows.map(row => ({
      ...row,
      nextContent: row.nextContent ? '[omitted from handoff; generated in-memory during repair]' : null,
    })),
  }
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
