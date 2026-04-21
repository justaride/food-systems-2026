import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const DEFAULT_BACKLOG = path.join(RESEARCH, 'evidence-pack/download-backlog-2026-04-20.csv')
const LOG_DIR = path.join(RESEARCH, 'evidence-pack/_logs')
const PDF_KATALOG = path.join(RESEARCH, 'pdf-katalog.json')

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const REQUEST_TIMEOUT_MS = 20_000
const THROTTLE_MS = 1_500
const MAX_PDF_CANDIDATES = 6
const MAX_INTERNAL_PAGE_CANDIDATES = 6
const MAX_INTERNAL_PAGES_TO_FETCH = 8
const MAX_INTERNAL_CRAWL_DEPTH = 2

type BacklogRow = {
  priority: string
  status: string
  country: string
  theme: string
  docType: string
  institution: string
  title: string
  year: string
  url: string
  urlType: string
  currentLocalStatus: string
  targetPath: string
  nextAction: string
  sourceBasis: string
}

type LogEntry = {
  priority: string
  title: string
  url: string
  url_type: string
  target_path: string
  next_action: string
  result:
    | 'downloaded_pdf'
    | 'saved_snapshot'
    | 'duplicate'
    | 'skipped'
    | 'requires_manual'
    | 'failed'
    | 'dry_run'
  resolved_url: string
  resolved_via: string
  local_path: string
  bytes: number
  sha256: string
  error: string
  ts: string
}

type ResolvedPdfPlan = {
  kind: 'pdf'
  candidates: Array<{ url: string; reason: string }>
}

type ResolvedSnapshotPlan = {
  kind: 'snapshot'
  finalUrl: string
  html: string
  pageTitle: string
  reason: string
}

type ResolvedPlan = ResolvedPdfPlan | ResolvedSnapshotPlan

type Options = {
  backlogPath: string
  priority: string
  status: string
  theme: string
  action: string
  targets: string[]
  limit: number
  dryRun: boolean
  logPath: string
}

function parseArgs(): Options {
  const now = new Date().toISOString().replace(/[:]/g, '-')
  const args = process.argv.slice(2)
  let backlogPath = DEFAULT_BACKLOG
  let priority = 'ALL'
  let status = 'PENDING'
  let theme = ''
  let action = ''
  const targets: string[] = []
  let limit = Infinity
  let dryRun = false
  let logPath = path.join(LOG_DIR, `fetch-evidence-backlog-${now}.jsonl`)

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--backlog') backlogPath = resolveInputPath(args[++i] || '')
    else if (arg === '--priority') priority = (args[++i] || 'ALL').toUpperCase()
    else if (arg === '--status') status = args[++i] || 'PENDING'
    else if (arg === '--theme') theme = args[++i] || ''
    else if (arg === '--action') action = args[++i] || ''
    else if (arg === '--target') targets.push(args[++i] || '')
    else if (arg === '--limit') limit = parseFiniteInt(args[++i], Infinity)
    else if (arg === '--dry-run') dryRun = true
    else if (arg === '--log') logPath = resolveInputPath(args[++i] || '')
  }

  return { backlogPath, priority, status, theme, action, targets, limit, dryRun, logPath }
}

function resolveInputPath(input: string): string {
  if (!input) return input
  return path.isAbsolute(input) ? input : path.join(ROOT, input)
}

function parseFiniteInt(value: string | undefined, fallback: number): number {
  const num = Number.parseInt(value || '', 10)
  return Number.isFinite(num) ? num : fallback
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((value) => value.length > 0)) rows.push(row)
  }

  return rows
}

async function loadBacklog(backlogPath: string): Promise<BacklogRow[]> {
  const raw = await fs.readFile(backlogPath, 'utf8')
  const [header, ...data] = parseCsv(raw)
  const index = Object.fromEntries(header.map((name, idx) => [name.trim(), idx]))

  return data
    .map((values) => ({
      priority: values[index.priority] ?? '',
      status: values[index.status] ?? '',
      country: values[index.country] ?? '',
      theme: values[index.theme] ?? '',
      docType: values[index.doc_type] ?? '',
      institution: values[index.institution] ?? '',
      title: values[index.title] ?? '',
      year: values[index.year] ?? '',
      url: values[index.url] ?? '',
      urlType: values[index.url_type] ?? '',
      currentLocalStatus: values[index.current_local_status] ?? '',
      targetPath: values[index.target_path] ?? '',
      nextAction: values[index.next_action] ?? '',
      sourceBasis: values[index.source_basis] ?? '',
    }))
    .filter((row) => row.priority && !row.priority.startsWith('#'))
}

function filterRows(rows: BacklogRow[], opts: Options): BacklogRow[] {
  return rows.filter((row) => {
    if (opts.priority !== 'ALL' && row.priority.toUpperCase() !== opts.priority) return false
    if (opts.status === 'PENDING' && row.status === 'downloaded') return false
    if (opts.status !== 'PENDING' && opts.status !== 'ALL' && row.status !== opts.status) return false
    if (opts.theme && row.theme !== opts.theme) return false
    if (opts.action && row.nextAction !== opts.action) return false
    if (opts.targets.length > 0 && !opts.targets.includes(row.targetPath)) return false
    return true
  })
}

function normalizeSourceUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(trimmed)) return `https://${trimmed}`
  return trimmed
}

function browserHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
    'Accept-Language': 'nb-NO,nb;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Upgrade-Insecure-Requests': '1',
  }

  try {
    headers.Referer = `${new URL(url).origin}/`
  } catch {
    // ignore malformed URL
  }

  return headers
}

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

function domainThrottleMs(url: string): number {
  try {
    const host = new URL(url).hostname
    if (host.includes('diva-portal.org')) return 4_000
    if (host.includes('skemman.is')) return 3_500
    if (host.includes('research.cbs.dk')) return 3_500
    if (host.includes('regjeringen.no')) return 2_000
  } catch {
    // ignore malformed URL
  }
  return THROTTLE_MS
}

async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        ...browserHeaders(url),
        ...(init.headers as Record<string, string> | undefined),
      },
    })
  } finally {
    clearTimeout(timeout)
  }
}

function looksLikePdfUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    /\.pdf(?:[?#]|$)/.test(lower) ||
    lower.includes('/download') ||
    lower.includes('/viewcontent.cgi') ||
    lower.includes('/contentassets/') ||
    lower.includes('/media/')
  )
}

function isLikelyPdfAssetUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return (
    /\.pdf(?:[?#]|$)/.test(lower) ||
    /(?:^|[/?=&_-])download(?:[/?=&_-]|$)/.test(lower) ||
    lower.includes('/viewcontent.cgi') ||
    lower.includes('/contentassets/') ||
    lower.includes('/media/')
  )
}

function shouldPreferSnapshot(row: BacklogRow): boolean {
  const action = row.nextAction.toLowerCase()
  return (
    row.targetPath.toLowerCase().endsWith('.md') ||
    action.includes('snapshot') ||
    action.includes('archive_')
  )
}

function snapshotTargetPath(row: BacklogRow): string {
  if (row.targetPath.toLowerCase().endsWith('.md')) return row.targetPath
  if (row.targetPath.toLowerCase().endsWith('.pdf')) return row.targetPath.replace(/\.pdf$/i, '.md')
  return `${row.targetPath}.md`
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function loadKnownHashes(): Promise<Map<string, string>> {
  try {
    const raw = await fs.readFile(PDF_KATALOG, 'utf8')
    const entries = JSON.parse(raw) as Array<{ sha256?: string; rel?: string }>
    const map = new Map<string, string>()
    for (const entry of entries) {
      if (entry.sha256 && entry.rel) map.set(entry.sha256, entry.rel)
    }
    return map
  } catch {
    return new Map()
  }
}

function sha256(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex')
}

async function appendLog(logPath: string, entry: LogEntry): Promise<void> {
  await fs.mkdir(path.dirname(logPath), { recursive: true })
  await fs.appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8')
}

type Candidate = { url: string; reason: string; score: number }

const GENERIC_TITLE_TOKENS = new Set([
  'annual',
  'analysis',
  'business',
  'capital',
  'check',
  'corporate',
  'data',
  'evaluation',
  'guide',
  'investor',
  'model',
  'policy',
  'presentation',
  'press',
  'procurement',
  'project',
  'projects',
  'raise',
  'release',
  'report',
  'rapport',
  'responsible',
  'statusrapport',
  'strategy',
])

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function foldText(input: string): string {
  return decodeHtmlEntities(input)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function stripTags(input: string): string {
  return decodeHtmlEntities(
    input
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim(),
  )
}

function splitTokens(input: string): string[] {
  return foldText(input)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
}

function uniqueTokens(tokens: string[]): string[] {
  return [...new Set(tokens)]
}

function extractQuarterToken(row: BacklogRow): string {
  const match = foldText(row.title).match(/\bq([1-4])\b/)
  return match ? `q${match[1]}` : ''
}

function extractStortingDocNumber(row: BacklogRow): string {
  const title = foldText(row.title)
  const match =
    title.match(/\binnst\.\s*(\d{1,3})\s*s\b/) ||
    title.match(/\bprop\.\s*(\d{1,3})\s*[ls]\b/) ||
    title.match(/\bmeld\.\s*st\.\s*(\d{1,3})\b/)
  return match ? match[1] : ''
}

function titleTokens(row: BacklogRow): string[] {
  const tokens = splitTokens(`${row.title} ${row.institution} ${row.year}`).filter((token) => {
    if (/^\d{4}$/.test(token)) return true
    if (/^\d{2,3}$/.test(token) && extractStortingDocNumber(row)) return true
    if (/^q[1-4]$/.test(token)) return true
    return token.length >= 4
  })
  return uniqueTokens(tokens)
}

function distinctiveTitleTokens(row: BacklogRow): string[] {
  return titleTokens(row).filter((token) => !GENERIC_TITLE_TOKENS.has(token) && !/^\d{4}$/.test(token))
}

function institutionTokens(row: BacklogRow): string[] {
  return uniqueTokens(splitTokens(row.institution).filter((token) => token.length >= 4 || token === 'arla'))
}

function hasAnyToken(haystack: string, tokens: string[]): boolean {
  return tokens.some((token) => haystack.includes(token))
}

function pathAndQueryText(url: string): string {
  try {
    const parsed = new URL(url)
    return foldText(`${parsed.pathname} ${parsed.search}`)
  } catch {
    return foldText(url)
  }
}

function isCandidatePlausible(url: string, row: BacklogRow): boolean {
  const lower = foldText(url)
  const pathLower = pathAndQueryText(url)
  const title = foldText(row.title)
  const quarter = extractQuarterToken(row)
  const stortingNumber = extractStortingDocNumber(row)

  if (quarter && !lower.includes(quarter)) return false

  if (title.includes('investor presentation') && !lower.includes('presentation') && !lower.includes('dnbc')) return false
  if ((title.includes('horingssvar') || title.includes('hoeringssvar')) && !hasAnyToken(lower, ['horingssvar', 'hoeringssvar', 'horing', 'handelsskikk'])) return false
  if (title.includes('foedevarehandelsloven') && !lower.includes('foedevarehandelsloven')) return false
  if (title.includes('farmahead') && !lower.includes('farmahead')) return false
  if (title.includes('kartlegging') && title.includes('ernaering') && !(pathLower.includes('kartlegging') && pathLower.includes('ernaering'))) return false

  if (stortingNumber && lower.includes('stortinget.no')) {
    const match = lower.match(/-(\d{1,3})(?:[sl])\.pdf/)
    if (match && match[1] !== stortingNumber) return false
  }

  const requiredInstitutionToken = distinctiveTitleTokens(row).length <= 1 ? institutionTokens(row) : []
  if (requiredInstitutionToken.length > 0 && !hasAnyToken(pathLower, requiredInstitutionToken)) return false

  return true
}

function scoreCandidate(url: string, row: BacklogRow, reason = ''): number {
  const lower = foldText(`${url} ${reason}`)
  let score = 0
  if (/\.pdf(?:[?#]|$)/.test(lower)) score += 100
  if (lower.includes('/download')) score += 30
  if (lower.includes('/viewcontent.cgi')) score += 25
  if (lower.includes('/contentassets/')) score += 20
  if (row.year && lower.includes(row.year)) score += 20
  if (row.docType && lower.includes(row.docType.toLowerCase())) score += 10
  if (lower.includes('annual') || lower.includes('rapport') || lower.includes('report')) score += 10
  for (const token of titleTokens(row)) {
    if (lower.includes(token)) score += 5
  }
  const quarter = extractQuarterToken(row)
  if (quarter && lower.includes(quarter)) score += 35

  const stortingNumber = extractStortingDocNumber(row)
  if (stortingNumber && lower.includes(`-${stortingNumber}s.pdf`)) score += 50

  for (const token of distinctiveTitleTokens(row)) {
    if (lower.includes(token)) score += 8
  }

  return score
}

function addCandidate(
  candidates: Map<string, Candidate>,
  candidateUrl: string,
  reason: string,
  row: BacklogRow,
  baseUrl: string,
): void {
  if (!candidateUrl) return
  if (/^(mailto:|javascript:|tel:)/i.test(candidateUrl)) return

  let absolute = candidateUrl.trim()
  try {
    absolute = new URL(candidateUrl, baseUrl).toString()
  } catch {
    try {
      absolute = new URL(candidateUrl, new URL(baseUrl).origin).toString()
    } catch {
      return
    }
  }

  const lower = absolute.toLowerCase()
  if (/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff2?)(?:[?#]|$)/.test(lower)) return
  if (!isLikelyPdfAssetUrl(absolute)) return
  if (!isCandidatePlausible(absolute, row)) return

  const score = scoreCandidate(absolute, row, reason)
  const existing = candidates.get(absolute)
  if (!existing || score > existing.score) {
    candidates.set(absolute, { url: absolute, reason, score })
  }
}

function collectPdfCandidates(html: string, pageUrl: string, row: BacklogRow): Array<{ url: string; reason: string }> {
  const candidates = new Map<string, Candidate>()

  addCandidate(candidates, normalizeSourceUrl(row.url), 'source_url', row, pageUrl)

  const metaPatterns = [
    /<meta[^>]+name=["']citation_pdf_url["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+name=["']MA\.Pdf-url["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+property=["']og:pdf["'][^>]+content=["']([^"']+)["']/gi,
    /"pdfUrl"\s*:\s*"([^"]+)"/gi,
    /"pdf_url"\s*:\s*"([^"]+)"/gi,
    /"pdfLink"\s*:\s*"([^"]+)"/gi,
    /"downloadUrl"\s*:\s*"([^"]+)"/gi,
  ]

  for (const pattern of metaPatterns) {
    let match: RegExpExecArray | null
    while ((match = pattern.exec(html))) {
      addCandidate(candidates, decodeHtmlEntities(match[1]), 'meta', row, pageUrl)
    }
  }

  const attrPattern = /(href|src)=["']([^"']+)["']/gi
  let attrMatch: RegExpExecArray | null
  while ((attrMatch = attrPattern.exec(html))) {
    addCandidate(candidates, decodeHtmlEntities(attrMatch[2]), 'attr', row, pageUrl)
  }

  try {
    const parsed = new URL(pageUrl)
    if (parsed.hostname.includes('pub.norden.org')) {
      const cleanPath = parsed.pathname.replace(/\/index\.html$/i, '').replace(/\/$/, '')
      if (cleanPath) {
        addCandidate(candidates, `${parsed.origin}${cleanPath}.pdf`, 'pub_norden_guess', row, pageUrl)
      }
    }
    if (parsed.hostname.includes('regjeringen.no')) {
      const contentAssetsPattern = /\/contentassets\/[^"'\s>]+\.pdf/gi
      let contentMatch: RegExpExecArray | null
      while ((contentMatch = contentAssetsPattern.exec(html))) {
        addCandidate(candidates, contentMatch[0], 'regjeringen_contentassets', row, pageUrl)
      }
    }
  } catch {
    // ignore malformed URL
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PDF_CANDIDATES)
    .map(({ url, reason }) => ({ url, reason }))
}

function explorationKeywords(row: BacklogRow, host: string): string[] {
  const raw = [
    ...titleTokens(row),
    ...foldText(`${row.institution} ${row.nextAction} ${row.docType} ${row.theme}`).split(/[^a-z0-9]+/),
  ]

  if (host.includes('norgesgruppen.no')) {
    raw.push('obligasjonslan', 'gjeldsfinansiering', 'registreringsdokument', 'finans', 'rapporter')
  }
  if (host.includes('motiva.fi')) {
    raw.push('hankinnat', 'julkiselle', 'sektorille', 'oppaat', 'raportit', 'ruoka', 'tietopankki')
  }
  if (host.includes('kk.dk')) {
    raw.push('food', 'mad', 'strategi', 'policy', 'kommune')
  }
  if (host.includes('stiftelsennorskmat.no')) {
    raw.push('lokalmat', 'rapport')
  }
  if (host.includes('helsedirektoratet.no')) {
    raw.push('rapport', 'ernaering', 'skolemaaltid')
  }
  if (host.includes('cheffelo.com') || host.includes('kesko.fi')) {
    raw.push('investor', 'reports', 'presentation')
  }

  return [...new Set(raw.filter((token) => token.length >= 4))]
}

type InternalPageCandidate = {
  url: string
  reason: string
  score: number
}

function collectInternalPageCandidates(html: string, pageUrl: string, row: BacklogRow): InternalPageCandidate[] {
  const candidates = new Map<string, InternalPageCandidate>()
  let origin = ''
  let pathname = ''

  try {
    const parsed = new URL(pageUrl)
    origin = parsed.origin
    pathname = parsed.pathname
  } catch {
    return []
  }

  const keywords = explorationKeywords(row, new URL(pageUrl).hostname)
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi
  let anchorMatch: RegExpExecArray | null

  while ((anchorMatch = anchorPattern.exec(html))) {
    const href = decodeHtmlEntities(anchorMatch[1]).trim()
    const text = foldText(stripTags(anchorMatch[2]))
    if (!href || /^(mailto:|javascript:|tel:|#)/i.test(href)) continue

    let absolute = ''
    try {
      absolute = new URL(href, pageUrl).toString()
    } catch {
      continue
    }

    const parsed = new URL(absolute)
    if (parsed.origin !== origin) continue
    if (parsed.pathname === pathname && !parsed.search) continue
    if (looksLikePdfUrl(absolute)) continue
    if (/\.(css|js|png|jpg|jpeg|gif|svg|webp|woff2?|zip)(?:[?#]|$)/i.test(parsed.pathname)) continue

    const haystack = `${foldText(absolute)} ${text}`
    let score = 0
    for (const keyword of keywords) {
      if (haystack.includes(keyword)) score += 6
    }
    if (parsed.pathname.includes('rapport') || parsed.pathname.includes('report')) score += 3
    if (parsed.pathname.includes('publik') || parsed.pathname.includes('publication')) score += 3
    if (parsed.pathname.includes('investor')) score += 3
    if (parsed.pathname.includes('hankinnat') || parsed.pathname.includes('procurement')) score += 4
    if (parsed.pathname.includes('obligasjons') || parsed.pathname.includes('gjeldsfinansiering')) score += 5
    if (parsed.pathname.includes('tietopankki')) score += 4
    if (!score) continue

    const existing = candidates.get(absolute)
    if (!existing || score > existing.score) {
      candidates.set(absolute, { url: absolute, reason: `follow_page:${text.slice(0, 80) || parsed.pathname}`, score })
    }
  }

  return [...candidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_INTERNAL_PAGE_CANDIDATES)
}

async function exploreInternalPagesForPdf(
  row: BacklogRow,
  initialUrl: string,
  initialHtml: string,
): Promise<Array<{ url: string; reason: string }>> {
  const visited = new Set<string>([initialUrl])
  const queue: Array<{ url: string; html: string; depth: number }> = [{ url: initialUrl, html: initialHtml, depth: 0 }]
  const pdfCandidates = new Map<string, Candidate>()
  let fetchedPages = 0

  while (queue.length > 0 && fetchedPages < MAX_INTERNAL_PAGES_TO_FETCH) {
    const current = queue.shift()!
    const found = collectPdfCandidates(current.html, current.url, row)
    for (const candidate of found) {
      addCandidate(pdfCandidates, candidate.url, `${candidate.reason}@depth${current.depth}`, row, current.url)
    }

    if (current.depth >= MAX_INTERNAL_CRAWL_DEPTH) continue

    const nextPages = collectInternalPageCandidates(current.html, current.url, row)
    for (const nextPage of nextPages) {
      if (visited.has(nextPage.url)) continue
      visited.add(nextPage.url)
      fetchedPages++

      try {
        const response = await fetchWithTimeout(nextPage.url, {
          headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8' },
        })
        if (!response.ok) continue

        const contentType = response.headers.get('content-type') || ''
        if (contentType.includes('application/pdf')) {
          addCandidate(pdfCandidates, response.url || nextPage.url, `follow_page_content_type_pdf`, row, current.url)
          continue
        }

        const html = await response.text()
        queue.push({ url: response.url || nextPage.url, html, depth: current.depth + 1 })
      } catch {
        // continue exploring other pages
      }
    }
  }

  return [...pdfCandidates.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PDF_CANDIDATES)
    .map(({ url, reason }) => ({ url, reason }))
}

function snapshotPlanFromHtml(
  row: BacklogRow,
  finalUrl: string,
  html: string,
  reason: string,
): ResolvedSnapshotPlan {
  const pageTitleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const pageTitle = pageTitleMatch ? decodeHtmlEntities(stripTags(pageTitleMatch[1])) : row.title
  return {
    kind: 'snapshot',
    finalUrl,
    html,
    pageTitle,
    reason,
  }
}

async function buildSnapshotPlan(row: BacklogRow): Promise<ResolvedSnapshotPlan | null> {
  const sourceUrl = normalizeSourceUrl(row.url)
  if (!sourceUrl || !/^https?:\/\//i.test(sourceUrl)) return null

  const response = await fetchWithTimeout(sourceUrl, {
    headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8' },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) return null

  const html = await response.text()
  return snapshotPlanFromHtml(row, response.url || sourceUrl, html, 'snapshot_fallback_after_pdf_failure')
}

function buildPreferredSourceUrls(row: BacklogRow): string[] {
  const sourceUrl = normalizeSourceUrl(row.url)
  const urls: string[] = []
  if (!sourceUrl) return urls

  let host = ''
  try {
    host = new URL(sourceUrl).hostname
  } catch {
    return [sourceUrl]
  }

  const foldedTitle = foldText(row.title)

  if (
    host.includes('norgesgruppen.no') &&
    foldedTitle.includes('registreringsdokument') &&
    foldedTitle.includes('no0013462705')
  ) {
    urls.push(
      'https://www.norgesgruppen.no/globalassets/finansiell-informasjon/lan/obligasjonslan/gronne-obligasjoner/2025/registreringsdokument--no0013462705-norgesgruppen---02.06.2025.pdf',
    )
    urls.push('https://www.norgesgruppen.no/finans/finans-hjem/gjeldsfinansiering/norske-obligasjonslan/')
  }

  if (host.includes('motiva.fi') && foldedTitle.includes('responsible procurement of food')) {
    urls.push(
      'https://www.motiva.fi/tietopankki/guide-for-the-responsible-procurement-of-food-recommendations-for-requirements-and-evaluation-criteria/',
    )
  }

  if (host.includes('stortinget.no')) {
    const stortingNumber = extractStortingDocNumber(row)
    const sessionMatch = sourceUrl.match(/\/(\d{4})-(\d{4})\/(?:\?all=true)?$/)
    if (stortingNumber && sessionMatch && foldedTitle.includes('innst.')) {
      const sessionCode = `${sessionMatch[1].slice(2)}${sessionMatch[2].slice(2)}`
      urls.push(`${sourceUrl.replace(/\?all=true$/i, '').replace(/\/$/, '')}/inns-${sessionCode}-${stortingNumber.padStart(3, '0')}s/`)
      urls.push(`${sourceUrl.replace(/\?all=true$/i, '').replace(/\/$/, '')}/?all=true`)
    }
  }

  urls.push(sourceUrl)
  return [...new Set(urls)]
}

async function resolveFromSourceUrl(
  row: BacklogRow,
  sourceUrl: string,
  allowSnapshot: boolean,
): Promise<ResolvedPlan | null> {
  if (!sourceUrl) return null
  if (!/^https?:\/\//i.test(sourceUrl)) return null

  if (looksLikePdfUrl(sourceUrl) && row.urlType !== 'landing_html') {
    return { kind: 'pdf', candidates: [{ url: sourceUrl, reason: 'source_url' }] }
  }

  let response: Response
  try {
    response = await fetchWithTimeout(sourceUrl, {
      headers: { Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8' },
    })
  } catch (error) {
    if (looksLikePdfUrl(sourceUrl)) {
      return { kind: 'pdf', candidates: [{ url: sourceUrl, reason: 'source_url_after_fetch_error' }] }
    }
    throw error
  }

  if (!response.ok) {
    if (looksLikePdfUrl(sourceUrl)) {
      return { kind: 'pdf', candidates: [{ url: sourceUrl, reason: `source_url_http_${response.status}` }] }
    }
    throw new Error(`HTTP ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    return { kind: 'pdf', candidates: [{ url: response.url || sourceUrl, reason: 'content_type_pdf' }] }
  }

  const html = await response.text()
  const finalUrl = response.url || sourceUrl
  const candidates = collectPdfCandidates(html, finalUrl, row)

  if (candidates.length > 0) {
    return { kind: 'pdf', candidates }
  }

  const exploredCandidates = await exploreInternalPagesForPdf(row, finalUrl, html)
  if (exploredCandidates.length > 0) {
    return { kind: 'pdf', candidates: exploredCandidates }
  }

  if (allowSnapshot && shouldPreferSnapshot(row)) {
    return snapshotPlanFromHtml(row, finalUrl, html, 'snapshot_fallback')
  }

  return null
}

async function resolveRow(row: BacklogRow): Promise<ResolvedPlan | null> {
  const preferredUrls = buildPreferredSourceUrls(row)

  for (let i = 0; i < preferredUrls.length; i++) {
    const sourceUrl = preferredUrls[i]
    try {
      const plan = await resolveFromSourceUrl(row, sourceUrl, i === preferredUrls.length - 1)
      if (plan) return plan
    } catch (error) {
      if (i === preferredUrls.length - 1) throw error
    }
  }

  return null
}

async function downloadPdf(url: string): Promise<{ ok: boolean; bytes: number; status: number; buffer: Buffer | null; error: string }> {
  try {
    const response = await fetchWithTimeout(url, {
      headers: { Accept: 'application/pdf,*/*;q=0.8' },
    })
    if (!response.ok) {
      return { ok: false, bytes: 0, status: response.status, buffer: null, error: `HTTP ${response.status}` }
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    if (buffer.length < 4 || buffer.slice(0, 4).toString() !== '%PDF') {
      return {
        ok: false,
        bytes: buffer.length,
        status: response.status,
        buffer: null,
        error: 'not a PDF (missing %PDF magic)',
      }
    }

    return {
      ok: true,
      bytes: buffer.length,
      status: response.status,
      buffer,
      error: '',
    }
  } catch (error) {
    return {
      ok: false,
      bytes: 0,
      status: 0,
      buffer: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function renderSnapshotMarkdown(row: BacklogRow, pageTitle: string, finalUrl: string, html: string): string {
  const body = stripTags(html)
  return [
    `# ${pageTitle || row.title || 'Snapshot'}`,
    '',
    `- Original tittel: ${row.title || '(ukjent)'}`,
    `- Institusjon: ${row.institution || '(ukjent)'}`,
    `- Aar: ${row.year || '(ukjent)'}`,
    `- Kilde-URL: ${finalUrl}`,
    `- Backlog-status: ${row.status || '(ukjent)'}`,
    `- Neste aksjon: ${row.nextAction || '(ukjent)'}`,
    `- Hentet: ${new Date().toISOString()}`,
    '',
    '## Snapshot',
    '',
    body || '_Ingen tekst kunne ekstraheres fra siden._',
    '',
  ].join('\n')
}

async function saveSnapshot(row: BacklogRow, plan: ResolvedSnapshotPlan): Promise<{ localPath: string; bytes: number; sha: string }> {
  const relPath = snapshotTargetPath(row)
  const absPath = path.join(ROOT, relPath)
  await fs.mkdir(path.dirname(absPath), { recursive: true })
  const markdown = renderSnapshotMarkdown(row, plan.pageTitle, plan.finalUrl, plan.html)
  const buffer = Buffer.from(markdown, 'utf8')
  await fs.writeFile(absPath, buffer)
  return { localPath: relPath, bytes: buffer.length, sha: sha256(buffer) }
}

async function main(): Promise<void> {
  const opts = parseArgs()
  const rows = await loadBacklog(opts.backlogPath)
  const filtered = filterRows(rows, opts)
  const knownHashes = await loadKnownHashes()

  console.log(
    `[backlog] file=${path.relative(ROOT, opts.backlogPath)} priority=${opts.priority} status=${opts.status} theme=${opts.theme || '(all)'} action=${opts.action || '(all)'} targets=${opts.targets.length || '(all)'} limit=${opts.limit} dryRun=${opts.dryRun}`,
  )
  console.log(`[backlog] ${filtered.length} rows match filters (${rows.length} total rows)`)
  console.log(`[backlog] log=${path.relative(ROOT, opts.logPath)}`)

  const stats = {
    downloaded_pdf: 0,
    saved_snapshot: 0,
    duplicate: 0,
    skipped: 0,
    requires_manual: 0,
    failed: 0,
    dry_run: 0,
  }

  let processed = 0

  for (const row of filtered) {
    if (processed >= opts.limit) break
    processed++

    const ts = new Date().toISOString()
    const sourceUrl = normalizeSourceUrl(row.url)
    const pdfAbsPath = path.join(ROOT, row.targetPath)
    const snapshotRelPath = snapshotTargetPath(row)
    const snapshotAbsPath = path.join(ROOT, snapshotRelPath)

    if (!sourceUrl) {
      const entry: LogEntry = {
        priority: row.priority,
        title: row.title,
        url: row.url,
        url_type: row.urlType,
        target_path: row.targetPath,
        next_action: row.nextAction,
        result: 'requires_manual',
        resolved_url: '',
        resolved_via: '',
        local_path: '',
        bytes: 0,
        sha256: '',
        error: 'no URL present',
        ts,
      }
      await appendLog(opts.logPath, entry)
      stats.requires_manual++
      console.log(`[${processed}/${filtered.length}] MANUAL ${row.title} - no URL`)
      continue
    }

    if (await fileExists(pdfAbsPath) || (snapshotRelPath !== row.targetPath && (await fileExists(snapshotAbsPath)))) {
      const entry: LogEntry = {
        priority: row.priority,
        title: row.title,
        url: sourceUrl,
        url_type: row.urlType,
        target_path: row.targetPath,
        next_action: row.nextAction,
        result: 'skipped',
        resolved_url: '',
        resolved_via: '',
        local_path: await fileExists(pdfAbsPath) ? row.targetPath : snapshotRelPath,
        bytes: 0,
        sha256: '',
        error: 'target exists',
        ts,
      }
      await appendLog(opts.logPath, entry)
      stats.skipped++
      console.log(`[${processed}/${filtered.length}] SKIP ${row.title} - target exists`)
      continue
    }

    try {
      const plan = await resolveRow(row)

      if (!plan) {
        const entry: LogEntry = {
          priority: row.priority,
          title: row.title,
          url: sourceUrl,
          url_type: row.urlType,
          target_path: row.targetPath,
          next_action: row.nextAction,
          result: 'requires_manual',
          resolved_url: '',
          resolved_via: '',
          local_path: '',
          bytes: 0,
          sha256: '',
          error: 'no automated download path resolved',
          ts,
        }
        await appendLog(opts.logPath, entry)
        stats.requires_manual++
        console.log(`[${processed}/${filtered.length}] MANUAL ${row.title} - unresolved`)
        await sleep(domainThrottleMs(sourceUrl))
        continue
      }

      if (opts.dryRun) {
        const previewUrl = plan.kind === 'pdf' ? plan.candidates[0]?.url || '' : plan.finalUrl
        const previewReason = plan.kind === 'pdf' ? plan.candidates[0]?.reason || '' : plan.reason
        const entry: LogEntry = {
          priority: row.priority,
          title: row.title,
          url: sourceUrl,
          url_type: row.urlType,
          target_path: row.targetPath,
          next_action: row.nextAction,
          result: 'dry_run',
          resolved_url: previewUrl,
          resolved_via: previewReason,
          local_path: '',
          bytes: 0,
          sha256: '',
          error: '',
          ts,
        }
        await appendLog(opts.logPath, entry)
        stats.dry_run++
        console.log(`[${processed}/${filtered.length}] DRY ${row.title} -> ${previewUrl || '(unresolved)'}`)
        await sleep(domainThrottleMs(sourceUrl))
        continue
      }

      if (plan.kind === 'snapshot') {
        const saved = await saveSnapshot(row, plan)
        const entry: LogEntry = {
          priority: row.priority,
          title: row.title,
          url: sourceUrl,
          url_type: row.urlType,
          target_path: row.targetPath,
          next_action: row.nextAction,
          result: 'saved_snapshot',
          resolved_url: plan.finalUrl,
          resolved_via: plan.reason,
          local_path: saved.localPath,
          bytes: saved.bytes,
          sha256: saved.sha,
          error: '',
          ts,
        }
        await appendLog(opts.logPath, entry)
        stats.saved_snapshot++
        console.log(`[${processed}/${filtered.length}] SNAP ${row.title} -> ${saved.localPath}`)
        await sleep(domainThrottleMs(sourceUrl))
        continue
      }

      let downloaded = false
      let lastError = 'no PDF candidate succeeded'

      for (const candidate of plan.candidates) {
        const attempt = await downloadPdf(candidate.url)
        if (!attempt.ok || !attempt.buffer) {
          lastError = `${candidate.reason}: ${attempt.error}`
          continue
        }

        const hash = sha256(attempt.buffer)
        if (knownHashes.has(hash)) {
          const entry: LogEntry = {
            priority: row.priority,
            title: row.title,
            url: sourceUrl,
            url_type: row.urlType,
            target_path: row.targetPath,
            next_action: row.nextAction,
            result: 'duplicate',
            resolved_url: candidate.url,
            resolved_via: candidate.reason,
            local_path: '',
            bytes: attempt.bytes,
            sha256: hash,
            error: `duplicate of ${knownHashes.get(hash)}`,
            ts,
          }
          await appendLog(opts.logPath, entry)
          stats.duplicate++
          console.log(`[${processed}/${filtered.length}] DUP ${row.title} -> ${knownHashes.get(hash)}`)
          downloaded = true
          break
        }

        await fs.mkdir(path.dirname(pdfAbsPath), { recursive: true })
        await fs.writeFile(pdfAbsPath, attempt.buffer)
        knownHashes.set(hash, path.relative(RESEARCH, pdfAbsPath))

        const entry: LogEntry = {
          priority: row.priority,
          title: row.title,
          url: sourceUrl,
          url_type: row.urlType,
          target_path: row.targetPath,
          next_action: row.nextAction,
          result: 'downloaded_pdf',
          resolved_url: candidate.url,
          resolved_via: candidate.reason,
          local_path: row.targetPath,
          bytes: attempt.bytes,
          sha256: hash,
          error: '',
          ts,
        }
        await appendLog(opts.logPath, entry)
        stats.downloaded_pdf++
        console.log(`[${processed}/${filtered.length}] OK ${row.title} -> ${row.targetPath}`)
        downloaded = true
        break
      }

      if (!downloaded) {
        if (shouldPreferSnapshot(row)) {
          const snapshot = await buildSnapshotPlan(row)
          if (snapshot) {
            const saved = await saveSnapshot(row, snapshot)
            const entry: LogEntry = {
              priority: row.priority,
              title: row.title,
              url: sourceUrl,
              url_type: row.urlType,
              target_path: row.targetPath,
              next_action: row.nextAction,
              result: 'saved_snapshot',
              resolved_url: snapshot.finalUrl,
              resolved_via: snapshot.reason,
              local_path: saved.localPath,
              bytes: saved.bytes,
              sha256: saved.sha,
              error: '',
              ts,
            }
            await appendLog(opts.logPath, entry)
            stats.saved_snapshot++
            console.log(`[${processed}/${filtered.length}] SNAP ${row.title} -> ${saved.localPath}`)
            await sleep(domainThrottleMs(sourceUrl))
            continue
          }
        }

        const entry: LogEntry = {
          priority: row.priority,
          title: row.title,
          url: sourceUrl,
          url_type: row.urlType,
          target_path: row.targetPath,
          next_action: row.nextAction,
          result: 'failed',
          resolved_url: plan.candidates[0]?.url || '',
          resolved_via: plan.candidates[0]?.reason || '',
          local_path: '',
          bytes: 0,
          sha256: '',
          error: lastError,
          ts,
        }
        await appendLog(opts.logPath, entry)
        stats.failed++
        console.log(`[${processed}/${filtered.length}] FAIL ${row.title} - ${lastError}`)
      }
    } catch (error) {
      const entry: LogEntry = {
        priority: row.priority,
        title: row.title,
        url: sourceUrl,
        url_type: row.urlType,
        target_path: row.targetPath,
        next_action: row.nextAction,
        result: 'failed',
        resolved_url: '',
        resolved_via: '',
        local_path: '',
        bytes: 0,
        sha256: '',
        error: error instanceof Error ? error.message : String(error),
        ts,
      }
      await appendLog(opts.logPath, entry)
      stats.failed++
      console.log(`[${processed}/${filtered.length}] FAIL ${row.title} - ${entry.error}`)
    }

    await sleep(domainThrottleMs(sourceUrl))
  }

  console.log(`[backlog] finished processed=${Math.min(processed, filtered.length)}`)
  console.log(`[backlog] stats=${JSON.stringify(stats)}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
