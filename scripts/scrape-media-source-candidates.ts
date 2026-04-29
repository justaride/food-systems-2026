import { execFile } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { promisify } from 'node:util'

type Candidate = Record<string, string>

type ScrapeResult = {
  id: string
  url: string
  status: 'dry_run' | 'saved' | 'skipped' | 'blocked' | 'failed'
  httpStatus?: number
  contentType?: string
  title?: string
  snapshotPath?: string
  reason?: string
  poison?: string
}

const candidatePath = resolve(
  process.cwd(),
  'research/bibliotek/media/media-source-candidates-2026-04-29.csv',
)
const snapshotDir = resolve(process.cwd(), 'research/bibliotek/media/snapshots')
const args = new Map(
  process.argv
    .slice(2)
    .filter(arg => arg.startsWith('--'))
    .map(arg => {
      const [key, value] = arg.slice(2).split('=')
      return [key, value ?? 'true']
    }),
)

const writeSnapshots = args.get('write') === 'true'
const allowPaywall = args.get('allow-paywall') === 'true'
const limit = Number(args.get('limit') ?? '8')
const wantedPriority = args.get('priority')
const wantedStatus = args.get('status') ?? 'candidate_fetch'
const wantedId = args.get('id')
const reportStem = [
  'media-scrape-report',
  new Date().toISOString().replace(/[:.]/g, '-'),
  wantedId ? `id-${wantedId}` : undefined,
  wantedPriority ? `priority-${wantedPriority}` : undefined,
  wantedStatus ? `status-${wantedStatus}` : undefined,
]
  .filter(Boolean)
  .join('-')
const reportPath = resolve(process.cwd(), `research/bibliotek/media/${reportStem}.json`)

const userAgent = 'FoodSystems2026MediaResearchBot/0.1 (+local research archive; respectful low-volume fetch)'

const robotsCache = new Map<string, string[]>()
const lastFetchByOrigin = new Map<string, number>()
const execFileAsync = promisify(execFile)

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some(value => value.trim().length > 0)) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    if (row.some(value => value.trim().length > 0)) rows.push(row)
  }

  return rows
}

function loadCandidates() {
  const [headers, ...rows] = parseCsv(readFileSync(candidatePath, 'utf8'))
  if (!headers) throw new Error(`No CSV headers found in ${candidatePath}`)
  return rows.map(row =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  ) as Candidate[]
}

function sleep(ms: number) {
  return new Promise(resolveSleep => setTimeout(resolveSleep, ms))
}

async function waitForOrigin(origin: string) {
  const now = Date.now()
  const lastFetch = lastFetchByOrigin.get(origin) ?? 0
  const elapsed = now - lastFetch
  if (elapsed < 1200) await sleep(1200 - elapsed)
  lastFetchByOrigin.set(origin, Date.now())
}

async function getRobotsDisallows(url: URL) {
  const cached = robotsCache.get(url.origin)
  if (cached) return cached

  try {
    await waitForOrigin(url.origin)
    const { stdout } = await execFileAsync('curl', [
      '-L',
      '-sS',
      '--max-time',
      '12',
      '-A',
      userAgent,
      String(new URL('/robots.txt', url.origin)),
    ])
    const text = stdout
    const disallows: string[] = []
    let applies = false
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.split('#')[0].trim()
      if (!line) continue
      const [rawKey, ...rest] = line.split(':')
      const key = rawKey.trim().toLowerCase()
      const value = rest.join(':').trim()
      if (key === 'user-agent') {
        applies = value === '*' || value.toLowerCase().includes('foodsystems')
      }
      if (applies && key === 'disallow' && value) {
        disallows.push(value)
      }
    }
    robotsCache.set(url.origin, disallows)
    return disallows
  } catch {
    robotsCache.set(url.origin, [])
    return []
  }
}

async function curlHead(url: URL) {
  const marker = '\n__CODEX_CURL_META__\n'
  const { stdout } = await execFileAsync('curl', [
    '-L',
    '-sS',
    '-I',
    '--max-time',
    '30',
    '-A',
    userAgent,
    '-w',
    `${marker}%{http_code}\n%{content_type}`,
    String(url),
  ])
  const metaStart = stdout.lastIndexOf(marker)
  const meta = metaStart >= 0 ? stdout.slice(metaStart + marker.length).trim().split('\n') : []
  return {
    status: Number(meta[0] ?? '0'),
    contentType: meta[1] ?? 'unknown',
  }
}

async function curlProbeGet(url: URL) {
  const marker = '\n__CODEX_CURL_META__\n'
  const { stdout } = await execFileAsync('curl', [
    '-L',
    '-sS',
    '--max-time',
    '30',
    '-A',
    userAgent,
    '-r',
    '0-0',
    '-o',
    '/dev/null',
    '-w',
    `${marker}%{http_code}\n%{content_type}`,
    String(url),
  ])
  const metaStart = stdout.lastIndexOf(marker)
  const meta = metaStart >= 0 ? stdout.slice(metaStart + marker.length).trim().split('\n') : []
  return {
    status: Number(meta[0] ?? '0'),
    contentType: meta[1] ?? 'unknown',
  }
}

async function curlGetText(url: URL) {
  const marker = '\n__CODEX_CURL_META__\n'
  const { stdout } = await execFileAsync('curl', [
    '-L',
    '-sS',
    '--max-time',
    '30',
    '-A',
    userAgent,
    '-H',
    'Accept: text/html,application/xhtml+xml,application/pdf;q=0.8,*/*;q=0.5',
    '-H',
    'Accept-Language: en,nb;q=0.9,no;q=0.8,sv;q=0.7,da;q=0.7',
    '-w',
    `${marker}%{http_code}\n%{content_type}`,
    String(url),
  ], { maxBuffer: 3 * 1024 * 1024 })
  const metaStart = stdout.lastIndexOf(marker)
  if (metaStart < 0) {
    return { body: stdout, status: 0, contentType: 'unknown' }
  }

  const body = stdout.slice(0, metaStart)
  const meta = stdout.slice(metaStart + marker.length).trim().split('\n')
  return {
    body,
    status: Number(meta[0] ?? '0'),
    contentType: meta[1] ?? 'unknown',
  }
}

async function isRobotsAllowed(url: URL) {
  const disallows = await getRobotsDisallows(url)
  return !disallows.some(path => path !== '/' && url.pathname.startsWith(path))
}

function decodeHtml(value: string) {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function extractTitle(html: string) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!titleMatch) return undefined
  return decodeHtml(titleMatch[1].replace(/\s+/g, ' ').trim())
}

function extractText(html: string) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
      .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
      .replace(/<aside[\s\S]*?<\/aside>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

function detectPoison(text: string, httpStatus: number) {
  if (httpStatus === 429) return 'rate_limit'
  if (httpStatus === 403) return 'blocked_403'
  if (httpStatus === 404) return 'not_found'

  const lower = text.toLowerCase()
  const patterns: [string, RegExp][] = [
    ['paywall', /subscribe to continue|subscription required|become a member|sign up to read|article limit reached/],
    ['captcha', /verify you are human|robot verification|prove you're not a robot|please complete.{0,80}captcha|captcha required/],
    ['cloudflare', /checking your browser|cloudflare|ddos protection|please wait while we verify/],
    ['login_required', /sign in to continue|log in required|create an account/],
  ]

  for (const [label, pattern] of patterns) {
    if (pattern.test(lower)) return label
  }

  return undefined
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120)
}

function markdownFor(row: Candidate, result: ScrapeResult, excerpt: string) {
  return `# ${row.title}

- id: ${row.id}
- country: ${row.country}
- theme: ${row.theme}
- outlet: ${row.outlet}
- year: ${row.year}
- url: ${row.url}
- captured_at: ${new Date().toISOString()}
- http_status: ${result.httpStatus ?? 'unknown'}
- content_type: ${result.contentType ?? 'unknown'}
- poison: ${result.poison ?? 'none_detected'}

## Extraction note

This is a short research snapshot for review. It is not a full article copy.

## Extract

${excerpt}
`
}

function buildExcerpt(row: Candidate, text: string) {
  const focusTerms = [
    'grocery',
    'dagligvare',
    'livsmedel',
    'matvöru',
    'food products',
    'food market',
    'hhi',
    'concentration',
    'market share',
    'price',
    'pris',
    'matsvinn',
    'food waste',
    'circular',
    'sirkular',
    ...row.title
      .toLowerCase()
      .split(/[^a-z0-9æøåäöðþ]+/)
      .filter(term => term.length > 5),
  ]

  const lower = text.toLowerCase()
  const first = text.slice(0, 1200)
  const matchIndex = focusTerms
    .map(term => lower.indexOf(term))
    .find(index => index > 1200)

  if (!matchIndex) return text.slice(0, 1800)

  const start = Math.max(0, matchIndex - 500)
  const focus = text.slice(start, matchIndex + 1400)
  return `${first}\n\n## Focus extract\n\n${focus}`
}

async function scrape(row: Candidate): Promise<ScrapeResult> {
  if (row.poison_pill_risk === 'high_paywall' && !allowPaywall) {
    return { id: row.id, url: row.url, status: 'skipped', reason: 'high_paywall_manual_only' }
  }

  const url = new URL(row.url)
  const allowed = await isRobotsAllowed(url)
  if (!allowed) {
    return { id: row.id, url: row.url, status: 'blocked', reason: 'robots_disallow' }
  }

  if (!writeSnapshots) {
    return { id: row.id, url: row.url, status: 'dry_run', reason: 'rerun_with_--write_to_fetch' }
  }

  await waitForOrigin(url.origin)
  const isPdfCandidate = row.capture_method.includes('pdf') || url.pathname.toLowerCase().endsWith('.pdf')
  let response = isPdfCandidate ? await curlHead(url) : await curlGetText(url)
  if (isPdfCandidate && response.status === 405) {
    response = await curlProbeGet(url)
  }
  const contentType = response.contentType
  const baseResult: ScrapeResult = {
    id: row.id,
    url: row.url,
    status: response.status >= 200 && response.status < 400 ? 'saved' : 'failed',
    httpStatus: response.status,
    contentType,
  }

  if (response.status < 200 || response.status >= 400) {
    return {
      ...baseResult,
      reason: `http_${response.status}`,
      poison: detectPoison('', response.status),
    }
  }

  if (isPdfCandidate || contentType.includes('application/pdf')) {
    const snapshotPath = resolve(snapshotDir, `${slugify(row.id)}.md`)
    const markdown = markdownFor(
      row,
      { ...baseResult, snapshotPath },
      'PDF detected. Binary content was not copied into this snapshot. Catalog/download through the PDF evidence workflow before import.',
    )
    mkdirSync(dirname(snapshotPath), { recursive: true })
    writeFileSync(snapshotPath, markdown)
    return { ...baseResult, snapshotPath, title: row.title }
  }

  const html = 'body' in response ? response.body : ''
  const title = extractTitle(html) ?? row.title
  const text = extractText(html)
  const poison = detectPoison(text, response.status)
  const excerpt = buildExcerpt(row, text)
  const snapshotPath = resolve(snapshotDir, `${slugify(row.id)}.md`)
  const markdown = markdownFor(row, { ...baseResult, title, poison, snapshotPath }, excerpt)

  mkdirSync(dirname(snapshotPath), { recursive: true })
  writeFileSync(snapshotPath, markdown)

  return { ...baseResult, title, poison, snapshotPath }
}

async function main() {
  const candidates = loadCandidates()
    .filter(row => !wantedId || row.id === wantedId)
    .filter(row => row.status === wantedStatus)
    .filter(row => !wantedPriority || row.priority === wantedPriority)
    .slice(0, Number.isFinite(limit) ? limit : 8)

  const results: ScrapeResult[] = []
  console.log(`Selected ${candidates.length} rows from ${candidatePath}`)
  console.log(writeSnapshots ? `Writing snapshots to ${snapshotDir}` : 'Dry run only')

  for (const row of candidates) {
    try {
      const result = await scrape(row)
      results.push(result)
      console.log(`${result.status.toUpperCase()} ${row.id} ${result.reason ?? result.httpStatus ?? ''}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const cause = error instanceof Error && 'cause' in error ? error.cause : undefined
      const causeMessage =
        cause && typeof cause === 'object' && 'message' in cause
          ? String(cause.message)
          : undefined
      const reason = causeMessage ? `${message}: ${causeMessage}` : message
      results.push({ id: row.id, url: row.url, status: 'failed', reason })
      console.log(`FAILED ${row.id} ${reason}`)
    }
  }

  if (writeSnapshots) {
    writeFileSync(reportPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
    console.log(`Report: ${reportPath}`)
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
