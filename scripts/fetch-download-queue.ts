import { promises as fs } from 'fs'
import { createHash } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const QUEUE_CSV = path.join(RESEARCH, 'download-queue.csv')
const SEED_MAP = path.join(RESEARCH, 'seed-pdf-map.json')
const PDF_KATALOG = path.join(RESEARCH, 'pdf-katalog.json')
const LOG_PATH = path.join(RESEARCH, `download-log-${new Date().toISOString().slice(0, 10)}.jsonl`)

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const REQ_TIMEOUT_MS = 60_000
const THROTTLE_MS = 1_500
const MAX_RETRIES = 2

function domainThrottleMs(url: string): number {
  try {
    const host = new URL(url).hostname
    if (host.includes('diva-portal.org')) return 5_000
    if (host.includes('skemman.is')) return 4_000
    if (host.includes('research.cbs.dk')) return 3_000
    if (host.includes('orbit.dtu.dk')) return 3_000
    return THROTTLE_MS
  } catch {
    return THROTTLE_MS
  }
}

function browserHeaders(url: string): Record<string, string> {
  const h: Record<string, string> = {
    'User-Agent': UA,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,nb;q=0.8,no;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  }
  try {
    const host = new URL(url).hostname
    h['Referer'] = `https://${host}/`
  } catch {
    // ignore
  }
  return h
}

type Row = {
  priority: string
  source: string
  id: string
  title: string
  year: string
  url: string
  urlType: string
  access: string
  targetPath: string
  note: string
}

type LogEntry = {
  id: string
  priority: string
  url: string
  resolved_pdf_url: string
  status: 'downloaded' | 'skipped' | 'duplicate' | 'failed' | 'requires_manual' | 'dry_run'
  http_code: number
  bytes: number
  sha256: string
  local_path: string
  error: string
  ts: string
}

function parseArgs(): { priority: string; limit: number; dryRun: boolean; onlyId: string } {
  const args = process.argv.slice(2)
  let priority = 'P1'
  let limit = Infinity
  let dryRun = false
  let onlyId = ''
  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--priority') priority = args[++i]
    else if (a === '--limit') limit = parseInt(args[++i], 10)
    else if (a === '--dry-run') dryRun = true
    else if (a === '--id') onlyId = args[++i]
  }
  return { priority, limit, dryRun, onlyId }
}

function parseCsv(src: string): Row[] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i++
        } else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else if (c === '\r') {
        // skip
      } else field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  const [header, ...data] = rows
  const idx = (name: string) => header.indexOf(name)
  return data
    .filter((r) => r.length >= header.length && r[idx('id')])
    .map((r) => ({
      priority: r[idx('priority')] || '',
      source: r[idx('source')] || '',
      id: r[idx('id')] || '',
      title: r[idx('title')] || '',
      year: r[idx('year')] || '',
      url: r[idx('url')] || '',
      urlType: r[idx('url_type')] || '',
      access: r[idx('access')] || '',
      targetPath: r[idx('target_path')] || '',
      note: r[idx('note')] || '',
    }))
}

async function loadSkipSet(): Promise<Set<string>> {
  const map = JSON.parse(await fs.readFile(SEED_MAP, 'utf8'))
  const skip = new Set<string>()
  for (const g of ['theses', 'reports', 'sources'] as const) {
    for (const id of Object.keys(map[g] || {})) skip.add(id)
  }
  return skip
}

async function loadKnownHashes(): Promise<Map<string, string>> {
  const katalog = JSON.parse(await fs.readFile(PDF_KATALOG, 'utf8'))
  const map = new Map<string, string>()
  for (const e of katalog) if (e.sha256) map.set(e.sha256, e.rel)
  return map
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms))
}

async function fetchWithTimeout(url: string, opts: RequestInit = {}): Promise<Response> {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), REQ_TIMEOUT_MS)
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { ...browserHeaders(url), ...(opts.headers as Record<string, string>) },
      redirect: 'follow',
    })
  } finally {
    clearTimeout(t)
  }
}

async function resolveViaOpenAlex(doi: string): Promise<string> {
  const url = `https://api.openalex.org/works/https://doi.org/${encodeURIComponent(doi)}`
  try {
    const res = await fetchWithTimeout(url)
    if (!res.ok) return ''
    const j = (await res.json()) as {
      best_oa_location?: { pdf_url?: string; landing_page_url?: string }
      open_access?: { oa_url?: string }
    }
    return j.best_oa_location?.pdf_url || j.open_access?.oa_url || ''
  } catch {
    return ''
  }
}

function extractDoi(url: string): string {
  if (url.startsWith('https://doi.org/')) return url.slice('https://doi.org/'.length)
  if (url.startsWith('http://doi.org/')) return url.slice('http://doi.org/'.length)
  const m = url.match(/10\.\d{4,9}\/[^\s]+$/)
  return m ? m[0] : ''
}

async function resolveLandingPage(url: string): Promise<string> {
  try {
    const res = await fetchWithTimeout(url, { headers: { Accept: 'text/html,application/xhtml+xml' } })
    if (!res.ok) return ''
    const ct = res.headers.get('content-type') || ''
    if (ct.includes('application/pdf')) return url
    const html = await res.text()

    // Domain-specific patterns
    const host = new URL(url).hostname
    const patterns: RegExp[] = []

    if (host.includes('regjeringen.no')) {
      patterns.push(/href="(\/contentassets\/[^"]+\.pdf)"/i)
      patterns.push(/href="(https?:\/\/www\.regjeringen\.no\/contentassets\/[^"]+\.pdf)"/i)
    }
    if (host.includes('nhh.no')) {
      patterns.push(/href="(\/contentassets\/[^"]+\.pdf)"/i)
      patterns.push(/href="([^"]*\/bitstream\/[^"]+\.pdf[^"]*)"/i)
    }
    if (host.includes('brage.unit.no') || host.includes('openaccess.nhh.no') || host.includes('hdl.handle.net')) {
      patterns.push(/href="([^"]*\/bitstream\/[^"]+\.pdf[^"]*)"/i)
    }
    if (host.includes('diva-portal.org')) {
      patterns.push(/href="([^"]*get\/diva2:[^"]+\/FULLTEXT01\.pdf[^"]*)"/i)
      patterns.push(/href="([^"]*fulltext01\.pdf[^"]*)"/i)
    }
    if (host.includes('skemman.is') || host.includes('helda.helsinki.fi') || host.includes('jyx.jyu.fi')) {
      patterns.push(/href="([^"]*\/bitstream\/[^"]+\.pdf[^"]*)"/i)
    }
    if (host.includes('orbit.dtu.dk')) {
      patterns.push(/href="([^"]*\/files\/[^"]+\.pdf[^"]*)"/i)
      patterns.push(/href="([^"]*orbit\.dtu\.dk[^"]+\.pdf[^"]*)"/i)
    }
    if (host.includes('research.cbs.dk')) {
      patterns.push(/href="([^"]*\/files\/[^"]+\.pdf[^"]*)"/i)
    }
    if (host.includes('ntnuopen.ntnu.no') || host.includes('nordopen.nord.no') || host.includes('munin.uit.no') || host.includes('bora.uib.no') || host.includes('nmbu.brage.unit.no') || host.includes('duo.uio.no') || host.includes('uia.brage.unit.no') || host.includes('oda.oslomet.no')) {
      patterns.push(/href="([^"]*\/bitstream\/[^"]+\.pdf[^"]*)"/i)
    }

    // Generic fallback
    patterns.push(/href="([^"]+\.pdf(?:\?[^"]*)?)"/i)

    for (const re of patterns) {
      const m = html.match(re)
      if (m) {
        const href = m[1]
        if (href.startsWith('http')) return href
        if (href.startsWith('//')) return 'https:' + href
        if (href.startsWith('/')) return new URL(href, url).toString()
        return new URL(href, url).toString()
      }
    }
    return ''
  } catch {
    return ''
  }
}

async function resolvePdfUrl(r: Row): Promise<string> {
  if (r.urlType === 'direct_pdf') return r.url
  if (r.urlType === 'doi') {
    const doi = extractDoi(r.url)
    if (doi) return await resolveViaOpenAlex(doi)
    return ''
  }
  if (r.urlType === 'landing_page' || r.urlType === 'landing_html') {
    return await resolveLandingPage(r.url)
  }
  return ''
}

async function downloadPdf(url: string, destTmp: string): Promise<{ ok: boolean; http: number; bytes: number; error: string }> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetchWithTimeout(url, { headers: { Accept: 'application/pdf,*/*' } })
      if (!res.ok) {
        if (attempt < MAX_RETRIES) {
          await sleep(2000)
          continue
        }
        return { ok: false, http: res.status, bytes: 0, error: `HTTP ${res.status}` }
      }
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 4 || buf.slice(0, 4).toString() !== '%PDF') {
        return { ok: false, http: res.status, bytes: buf.length, error: 'not a PDF (missing %PDF magic)' }
      }
      await fs.writeFile(destTmp, buf)
      return { ok: true, http: res.status, bytes: buf.length, error: '' }
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        await sleep(2000)
        continue
      }
      return { ok: false, http: 0, bytes: 0, error: (e as Error).message }
    }
  }
  return { ok: false, http: 0, bytes: 0, error: 'unreachable' }
}

function sha256File(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex')
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function appendLog(entry: LogEntry): Promise<void> {
  await fs.appendFile(LOG_PATH, JSON.stringify(entry) + '\n', 'utf8')
}

async function main(): Promise<void> {
  const opts = parseArgs()
  console.log(`[fetch] priority=${opts.priority} dryRun=${opts.dryRun} limit=${opts.limit} onlyId=${opts.onlyId || '(all)'}`)

  const csvSrc = await fs.readFile(QUEUE_CSV, 'utf8')
  const rows = parseCsv(csvSrc)
  const skipIds = await loadSkipSet()
  const knownHashes = await loadKnownHashes()

  const filtered = rows.filter((r) => {
    if (opts.onlyId) return r.id === opts.onlyId
    if (opts.priority !== 'ALL' && r.priority !== opts.priority) return false
    return true
  })

  console.log(`[fetch] ${filtered.length} rows match filter (of ${rows.length} total)`)

  let count = 0
  const stats = { downloaded: 0, skipped: 0, duplicate: 0, failed: 0, requires_manual: 0, dry_run: 0 }

  for (const r of filtered) {
    if (count >= opts.limit) break
    count++

    const ts = new Date().toISOString()
    const baseLog: Omit<LogEntry, 'status' | 'resolved_pdf_url' | 'http_code' | 'bytes' | 'sha256' | 'local_path' | 'error'> = {
      id: r.id,
      priority: r.priority,
      url: r.url,
      ts,
    }

    // Skip if already mapped
    if (skipIds.has(r.id)) {
      await appendLog({ ...baseLog, status: 'skipped', resolved_pdf_url: '', http_code: 0, bytes: 0, sha256: '', local_path: '', error: 'already in seed-pdf-map' })
      stats.skipped++
      console.log(`[${count}/${filtered.length}] SKIP ${r.id} — already mapped`)
      continue
    }

    // Skip if target file already exists on disk
    const destAbs = path.join(ROOT, r.targetPath)
    if (await fileExists(destAbs)) {
      await appendLog({ ...baseLog, status: 'skipped', resolved_pdf_url: '', http_code: 0, bytes: 0, sha256: '', local_path: r.targetPath, error: 'target file exists' })
      stats.skipped++
      console.log(`[${count}/${filtered.length}] SKIP ${r.id} — target exists`)
      continue
    }

    if (opts.dryRun) {
      const resolved = await resolvePdfUrl(r)
      await appendLog({ ...baseLog, status: 'dry_run', resolved_pdf_url: resolved, http_code: 0, bytes: 0, sha256: '', local_path: r.targetPath, error: resolved ? '' : 'no pdf URL resolved' })
      stats.dry_run++
      console.log(`[${count}/${filtered.length}] DRY ${r.id} → ${resolved || '(unresolved)'}`)
      await sleep(domainThrottleMs(r.url))
      continue
    }

    const resolvedPdf = await resolvePdfUrl(r)
    if (!resolvedPdf) {
      await appendLog({ ...baseLog, status: 'requires_manual', resolved_pdf_url: '', http_code: 0, bytes: 0, sha256: '', local_path: '', error: 'no PDF URL found' })
      stats.requires_manual++
      console.log(`[${count}/${filtered.length}] MANUAL ${r.id} — no PDF URL`)
      await sleep(domainThrottleMs(r.url))
      continue
    }

    await fs.mkdir(path.dirname(destAbs), { recursive: true })
    const tmpPath = destAbs + '.tmp'
    const dl = await downloadPdf(resolvedPdf, tmpPath)

    if (!dl.ok) {
      await fs.rm(tmpPath, { force: true })
      await appendLog({ ...baseLog, status: 'failed', resolved_pdf_url: resolvedPdf, http_code: dl.http, bytes: dl.bytes, sha256: '', local_path: '', error: dl.error })
      stats.failed++
      console.log(`[${count}/${filtered.length}] FAIL ${r.id} — ${dl.error}`)
      await sleep(domainThrottleMs(r.url))
      continue
    }

    const buf = await fs.readFile(tmpPath)
    const hash = sha256File(buf)
    if (knownHashes.has(hash)) {
      await fs.rm(tmpPath, { force: true })
      await appendLog({
        ...baseLog,
        status: 'duplicate',
        resolved_pdf_url: resolvedPdf,
        http_code: dl.http,
        bytes: dl.bytes,
        sha256: hash,
        local_path: '',
        error: `duplicate of ${knownHashes.get(hash)}`,
      })
      stats.duplicate++
      console.log(`[${count}/${filtered.length}] DUP ${r.id} — matches ${knownHashes.get(hash)}`)
      await sleep(domainThrottleMs(r.url))
      continue
    }

    await fs.rename(tmpPath, destAbs)
    knownHashes.set(hash, path.relative(RESEARCH, destAbs))
    await appendLog({
      ...baseLog,
      status: 'downloaded',
      resolved_pdf_url: resolvedPdf,
      http_code: dl.http,
      bytes: dl.bytes,
      sha256: hash,
      local_path: path.relative(RESEARCH, destAbs),
      error: '',
    })
    stats.downloaded++
    console.log(`[${count}/${filtered.length}] OK ${r.id} — ${dl.bytes} bytes → ${path.relative(RESEARCH, destAbs)}`)
    await sleep(domainThrottleMs(r.url))
  }

  console.log(`\n[fetch] done. log=${path.relative(ROOT, LOG_PATH)}`)
  console.log(`[fetch] stats: ${JSON.stringify(stats)}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
