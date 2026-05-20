import 'dotenv/config'
import { execFile } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import { parseCsvRecords } from '../src/lib/csv'
import {
  classifyUrlStatus,
  shouldAttemptUrlHealthFallback,
  type UrlHealthClassification as Classification,
} from '../src/lib/url-health-classifier'

type CheckResult = {
  status: number | string
  finalUrl?: string
  ms: number
}

type UrlRecord = {
  url: string
  source: string
  source_priority: number | null
}

type HealthRow = UrlRecord & {
  status: number | string
  classification: Classification
  final_url: string
  ms: number
}

const RATE_LIMIT_MS = 1000 // 1 req/sec to be polite
const REQUEST_TIMEOUT_MS = 10000
const CURL_FALLBACK_TIMEOUT_MS = 15000
const MAX_REDIRECT_HOPS = 5
const REQUEST_HEADERS = {
  // Several public archives/WAFs return false 5xx/429 responses to custom bot
  // user agents even when the public page is reachable in a normal browser.
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9,nb;q=0.8,no;q=0.7',
}

const execFileAsync = promisify(execFile)

function csvEscape(value: string): string {
  return `"${String(value).replace(/"/g, '""')}"`
}

/**
 * Load URL-INVENTORY.csv produced by `scripts/inventory-urls.ts`. Each row is
 * a (url, source_type, source_id, source_priority, ...) occurrence; we
 * deduplicate by URL and keep the highest-priority source per URL.
 */
function loadInventory(root: string): UrlRecord[] {
  const path = join(root, 'research', 'URL-INVENTORY.csv')
  if (!existsSync(path)) return []
  const raw = readFileSync(path, 'utf-8')
  const records = parseCsvRecords(raw)

  const seen = new Map<string, UrlRecord>()
  for (const record of records) {
    const url = record.url
    if (!url) continue
    const sourceType = record.source_type
    const sourceId = record.source_id
    const priorityStr = record.source_priority
    const priority = priorityStr ? parseFloat(priorityStr) : NaN
    const source = `${sourceType}:${sourceId}`
    const priorityVal = Number.isFinite(priority) ? priority : null

    const existing = seen.get(url)
    if (!existing) {
      seen.set(url, { url, source, source_priority: priorityVal })
    } else {
      // Keep highest-priority source
      const existingPri = existing.source_priority ?? -Infinity
      const newPri = priorityVal ?? -Infinity
      if (newPri > existingPri) {
        seen.set(url, { url, source, source_priority: priorityVal })
      }
    }
  }
  return [...seen.values()]
}

/**
 * Issue HEAD (with GET fallback for 405/403) and follow redirects manually so
 * we can record the final URL. Returns the final status, finalUrl when
 * different, and total elapsed time.
 */
async function checkUrl(url: string): Promise<CheckResult> {
  const start = Date.now()
  let current = url
  let lastStatus: number | string = 0
  let didFallback = false

  for (let hop = 0; hop < MAX_REDIRECT_HOPS; hop++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const method = didFallback ? 'GET' : 'HEAD'
      const res = await fetch(current, {
        method,
        signal: controller.signal,
        headers: REQUEST_HEADERS,
        redirect: 'manual',
      })
      clearTimeout(timeout)
      lastStatus = res.status

      // Some servers reject HEAD with 405/403 — retry once with GET
      if ((res.status === 405 || res.status === 403) && !didFallback) {
        didFallback = true
        continue
      }

      // 3xx — follow if Location is present
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location')
        if (!loc) {
          // 3xx without Location — treat as terminal redirect
          return { status: res.status, finalUrl: current, ms: Date.now() - start }
        }
        try {
          current = new URL(loc, current).toString()
        } catch {
          return { status: res.status, finalUrl: current, ms: Date.now() - start }
        }
        didFallback = false // reset for new URL
        continue
      }

      // 2xx, 4xx, 5xx — terminal
      return {
        status: res.status,
        finalUrl: current === url ? undefined : current,
        ms: Date.now() - start,
      }
    } catch (e) {
      clearTimeout(timeout)
      if ((e as Error).name === 'AbortError') {
        return { status: 'timeout', ms: Date.now() - start }
      }
      // undici wraps the real error in `.cause` — surface its code/message so
      // the classifier can recognise ENOTFOUND/ECONNREFUSED/etc.
      const err = e as Error & { cause?: { code?: string; message?: string } }
      const causeCode = err.cause?.code
      const causeMsg = err.cause?.message
      const detail = causeCode || causeMsg || err.message || String(e)
      return { status: `error: ${detail}`, ms: Date.now() - start }
    }
  }

  // Exceeded max redirect hops
  return {
    status: lastStatus,
    finalUrl: current === url ? undefined : current,
    ms: Date.now() - start,
  }
}

async function checkUrlWithCurl(url: string): Promise<CheckResult | null> {
  const start = Date.now()
  try {
    const { stdout } = await execFileAsync(
      'curl',
      [
        '-L',
        '-I',
        '--max-time',
        String(Math.ceil(CURL_FALLBACK_TIMEOUT_MS / 1000)),
        '-A',
        REQUEST_HEADERS['User-Agent'],
        '-H',
        `Accept: ${REQUEST_HEADERS.Accept}`,
        '-H',
        `Accept-Language: ${REQUEST_HEADERS['Accept-Language']}`,
        '-o',
        '/dev/null',
        '-sS',
        '-w',
        '%{http_code}\t%{url_effective}',
        url,
      ],
      { timeout: CURL_FALLBACK_TIMEOUT_MS },
    )

    const [statusText, finalUrl] = stdout.trim().split('\t')
    const status = Number(statusText)
    if (!Number.isFinite(status) || status === 0) return null

    return {
      status,
      finalUrl: finalUrl && finalUrl !== url ? finalUrl : undefined,
      ms: Date.now() - start,
    }
  } catch {
    return null
  }
}

async function checkUrlWithFallback(url: string): Promise<CheckResult> {
  const primary = await checkUrl(url)
  if (!shouldAttemptUrlHealthFallback(primary.status)) return primary

  const fallback = await checkUrlWithCurl(url)
  if (!fallback) return primary

  const primaryClassification = classifyUrlStatus(primary.status)
  const fallbackClassification = classifyUrlStatus(fallback.status)
  if (
    fallbackClassification === 'ok' ||
    fallbackClassification === 'redirect' ||
    (primaryClassification !== 'ok' && fallbackClassification !== primaryClassification)
  ) {
    return fallback
  }

  return primary
}

function distribution(rows: HealthRow[]): Record<Classification, number> {
  const counts: Record<Classification, number> = {
    ok: 0,
    redirect: 0,
    dead: 0,
    blocked: 0,
    paywalled: 0,
    timeout: 0,
    server_error: 0,
    other: 0,
  }
  for (const r of rows) counts[r.classification]++
  return counts
}

function writeCsv(root: string, rows: HealthRow[]): void {
  const header = 'url,status,classification,final_url,source,source_priority,ms'
  const lines = [header]
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.url),
        String(r.status),
        r.classification,
        r.final_url ? csvEscape(r.final_url) : '',
        r.source,
        r.source_priority !== null ? r.source_priority.toFixed(1) : '',
        String(r.ms),
      ].join(','),
    )
  }
  writeFileSync(join(root, 'research', 'URL-HEALTH.csv'), lines.join('\n') + '\n')
}

function writeMd(root: string, rows: HealthRow[], elapsedMs: number): void {
  const counts = distribution(rows)
  const total = rows.length

  const dead = rows
    .filter((r) => r.classification === 'dead')
    .sort((a, b) => (b.source_priority ?? 0) - (a.source_priority ?? 0))

  const redirects = rows
    .filter((r) => r.classification === 'redirect' && r.final_url && r.final_url !== r.url)
    .sort((a, b) => (b.source_priority ?? 0) - (a.source_priority ?? 0))

  const blocked = rows.filter((r) => r.classification === 'blocked')
  const timeouts = rows.filter((r) => r.classification === 'timeout')
  const serverErrors = rows.filter((r) => r.classification === 'server_error')
  const others = rows.filter((r) => r.classification === 'other')

  const order: Classification[] = [
    'ok',
    'redirect',
    'dead',
    'blocked',
    'paywalled',
    'timeout',
    'server_error',
    'other',
  ]

  const lines: string[] = [
    '# URL Health — Food Systems 2026',
    '',
    '> Auto-generert av `scripts/check-urls.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt sjekket: **${total}** unike URL-er`,
    `> Skanntid: **${(elapsedMs / 1000).toFixed(1)}s** (rate-limit ${RATE_LIMIT_MS}ms/req)`,
    '',
    '## Distribusjon per klassifikasjon',
    '',
    '| classification | antall | %  |',
    '|---|---:|---:|',
    ...order.map((c) => {
      const n = counts[c]
      const pct = total > 0 ? ((n / total) * 100).toFixed(1) : '0.0'
      return `| ${c} | ${n} | ${pct}% |`
    }),
    '',
    '## Klassifikasjons-regler',
    '',
    '- **ok**: HTTP 2xx',
    '- **redirect**: HTTP 3xx (Location-feltet fulgt manuelt opp til 5 hopp)',
    '- **dead**: HTTP 404 / 410, eller nettverksfeil (ENOTFOUND, ECONNREFUSED, ECONNRESET, EHOSTUNREACH)',
    '- **blocked**: HTTP 403 / 451 (etter retry med GET-fallback)',
    '- **paywalled**: TODO — krever innholdsanalyse, ikke implementert (alltid 0 i denne kjøringen)',
    '- **timeout**: ingen respons innen 10s',
    '- **server_error**: HTTP 5xx',
    '- **other**: alt annet (1xx, 4xx ikke 403/404/410/451)',
    '',
  ]

  if (dead.length > 0) {
    lines.push(
      '## Dead URLs (404 / 410 / nettverksfeil)',
      '',
      '| priority | source | status | url |',
      '|---|---|---|---|',
      ...dead.map(
        (r) =>
          `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.status} | ${r.url} |`,
      ),
      '',
    )
  }

  if (redirects.length > 0) {
    const highPri = redirects.filter((r) => (r.source_priority ?? 0) >= 4.0)
    lines.push(
      '## Redirects med endret final_url (alle)',
      '',
      `Totalt: ${redirects.length}, hvorav ${highPri.length} med priority >= 4.0.`,
      '',
      '| priority | source | status | url -> final_url |',
      '|---|---|---|---|',
      ...redirects
        .slice(0, 50)
        .map(
          (r) =>
            `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.status} | ${r.url} -> ${r.final_url} |`,
        ),
      '',
    )
    if (redirects.length > 50) {
      lines.push(`...og ${redirects.length - 50} flere — se URL-HEALTH.csv.`, '')
    }
  }

  if (blocked.length > 0) {
    lines.push(
      '## Blocked (403 / 451)',
      '',
      '| priority | source | status | url |',
      '|---|---|---|---|',
      ...blocked
        .sort((a, b) => (b.source_priority ?? 0) - (a.source_priority ?? 0))
        .map(
          (r) =>
            `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.status} | ${r.url} |`,
        ),
      '',
    )
  }

  if (timeouts.length > 0) {
    lines.push(
      '## Timeouts',
      '',
      '| priority | source | url |',
      '|---|---|---|',
      ...timeouts
        .sort((a, b) => (b.source_priority ?? 0) - (a.source_priority ?? 0))
        .map(
          (r) =>
            `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.url} |`,
        ),
      '',
    )
  }

  if (serverErrors.length > 0) {
    lines.push(
      '## Server errors (5xx)',
      '',
      '| priority | source | status | url |',
      '|---|---|---|---|',
      ...serverErrors.map(
        (r) =>
          `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.status} | ${r.url} |`,
      ),
      '',
    )
  }

  if (others.length > 0) {
    lines.push(
      '## Other / uklassifisert',
      '',
      '| priority | source | status | url |',
      '|---|---|---|---|',
      ...others.map(
        (r) =>
          `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source} | ${r.status} | ${r.url} |`,
      ),
      '',
    )
  }

  lines.push(
    '## Notater',
    '',
    '- URL-listen leses fra `research/URL-INVENTORY.csv` (deduplisert per URL, høyeste source_priority beholdes).',
    '- HEAD brukes først; GET-fallback ved 403/405. Redirect (3xx) følges manuelt opp til 5 hopp for å fange `final_url`.',
    '- `paywalled` er ikke implementert i denne versjonen — krever innholdsanalyse av 200-respons. TODO.',
    '- Rate-limit: 1 req/sek for å være høflig mot kildene. Tidsavbrudd: 10s per request.',
    '- Bruk `tsx scripts/check-urls.ts --csv-only` for å undertrykke per-URL konsoll-logging.',
    '- ENOTFOUND mot `brage.unit.no`-aliaser (`openaccess.nhh.no`, `nmbu.brage.unit.no`, `uia.brage.unit.no`, `oda.oslomet.no`, `nibio.brage.unit.no`) skyldes at canonical-domenet `brage.unit.no` ikke resolverer for øyeblikket — dette kan være transient DNS, men er flagget som `dead` her fordi URL-en ikke kan brukes i RAG-pipelinen før det fikses.',
  )

  writeFileSync(join(root, 'research', 'URL-HEALTH.md'), lines.join('\n') + '\n')
}

async function main() {
  const args = process.argv.slice(2)
  const csvOnly = args.includes('--csv-only')

  const root = process.cwd()
  const records = loadInventory(root)

  if (records.length === 0) {
    console.error(
      'No URLs found in research/URL-INVENTORY.csv. Run `npm run inventory-urls` first.',
    )
    process.exit(1)
  }

  if (!csvOnly) {
    console.log('URL Health Check — Food Systems 2026\n')
    console.log(`Loaded ${records.length} unique URLs from research/URL-INVENTORY.csv\n`)
  }

  const startTime = Date.now()
  const rows: HealthRow[] = []

  for (let i = 0; i < records.length; i++) {
    const rec = records[i]
    const { status, finalUrl, ms } = await checkUrlWithFallback(rec.url)
    const cls = classifyUrlStatus(status)
    rows.push({
      ...rec,
      status,
      classification: cls,
      final_url: finalUrl ?? '',
      ms,
    })

    if (!csvOnly) {
      const tag =
        cls === 'ok'
          ? 'OK   '
          : cls === 'redirect'
            ? 'REDIR'
            : cls === 'dead'
              ? 'DEAD '
              : cls === 'blocked'
                ? 'BLOCK'
                : cls === 'timeout'
                  ? 'TIMOT'
                  : cls === 'server_error'
                    ? '5xx  '
                    : 'OTHR '
      console.log(
        `  [${String(i + 1).padStart(3, ' ')}/${records.length}] ${tag} ${String(status).padEnd(7, ' ')} ${ms}ms  ${rec.url}`,
      )
    } else if ((i + 1) % 25 === 0) {
      console.log(`  Checked ${i + 1}/${records.length}...`)
    }

    // Rate-limit: skip on last iteration
    if (i < records.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS))
    }
  }

  const elapsedMs = Date.now() - startTime
  writeCsv(root, rows)
  writeMd(root, rows, elapsedMs)

  const counts = distribution(rows)

  console.log('\n' + '='.repeat(60))
  console.log('  URL Health Check Results')
  console.log('='.repeat(60))
  console.log(`  Total checked:   ${rows.length}`)
  console.log(`  Elapsed:         ${(elapsedMs / 1000).toFixed(1)}s`)
  console.log('')
  console.log(`  ok            : ${counts.ok}`)
  console.log(`  redirect      : ${counts.redirect}`)
  console.log(`  dead          : ${counts.dead}`)
  console.log(`  blocked       : ${counts.blocked}`)
  console.log(`  paywalled     : ${counts.paywalled} (TODO — not implemented)`)
  console.log(`  timeout       : ${counts.timeout}`)
  console.log(`  server_error  : ${counts.server_error}`)
  console.log(`  other         : ${counts.other}`)
  console.log('')
  console.log('  Output: research/URL-HEALTH.csv + research/URL-HEALTH.md')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
