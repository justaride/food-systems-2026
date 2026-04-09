import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT_MD = path.join(RESEARCH, 'DOWNLOAD-QUEUE.md')
const OUT_CSV = path.join(RESEARCH, 'download-queue.csv')

type QueueRow = {
  priority: 'P1' | 'P2' | 'P3'
  source: string // which list it came from
  id: string
  title: string
  year: string
  url: string
  urlType: 'direct_pdf' | 'doi' | 'landing_page' | 'unknown'
  access: 'open' | 'paywalled' | 'manual_only' | 'unknown'
  targetPath: string
  note: string
}

function classifyUrl(url: string): QueueRow['urlType'] {
  if (!url) return 'unknown'
  if (/\.pdf(\?|$)/i.test(url)) return 'direct_pdf'
  if (/doi\.org/i.test(url) || /^doi:/i.test(url) || /^hdl:/i.test(url)) return 'doi'
  if (/^https?:\/\//i.test(url)) return 'landing_page'
  return 'unknown'
}

// ────────────────────────────────────────────────────────────
// CSV parsing (simple, with quoted field support)
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQ = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else inQ = false
      } else field += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') {
        row.push(field)
        field = ''
      } else if (c === '\n') {
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else if (c === '\r') {
        /* skip */
      } else field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

async function loadBacklogCsv(): Promise<QueueRow[]> {
  const p = path.join(RESEARCH, 'evidence-pack/download-backlog-2026-03-18.csv')
  const text = await fs.readFile(p, 'utf8')
  const rows = parseCsv(text)
  const header = rows[0]
  const idx = (k: string) => header.indexOf(k)
  const out: QueueRow[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (r.length < header.length) continue
    const status = (r[idx('current_local_status')] || '').toLowerCase()
    if (status.includes('downloaded')) continue
    out.push({
      priority: (r[idx('priority')] as 'P1' | 'P2' | 'P3') || 'P2',
      source: 'backlog-csv',
      id: `${r[idx('institution')]}-${r[idx('year')]}`.toLowerCase().replace(/\s+/g, '-'),
      title: r[idx('title')],
      year: r[idx('year')],
      url: r[idx('url')],
      urlType: (r[idx('url_type')] as QueueRow['urlType']) || classifyUrl(r[idx('url')]),
      access: 'unknown',
      targetPath: r[idx('target_path')],
      note: r[idx('next_action')],
    })
  }
  return out
}

async function loadPubmedJsonl(): Promise<QueueRow[]> {
  const p = path.join(RESEARCH, 'evidence-pack/pubmed-wave1-manifest-2026-03-30.jsonl')
  const text = await fs.readFile(p, 'utf8')
  const out: QueueRow[] = []
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const j = JSON.parse(line)
      if (j.download_status === 'downloaded_pdf') continue
      const url: string = j.pdf_url || j.landing_url || (j.doi ? `https://doi.org/${j.doi}` : '')
      out.push({
        priority: 'P2',
        source: 'pubmed-wave1',
        id: j.slug || j.pmid || '',
        title: j.title || '',
        year: String(j.year || ''),
        url,
        urlType: classifyUrl(url),
        access: j.is_oa ? 'open' : j.oa_status === 'closed' ? 'paywalled' : 'unknown',
        targetPath: `research/evidence-pack/akademia/pubmed/${j.slug || j.pmid}.pdf`,
        note: j.download_error || j.download_status || '',
      })
    } catch {
      /* skip malformed line */
    }
  }
  return out
}

// ────────────────────────────────────────────────────────────
// Seed file parsing (reuse logic from audit script)
function parseEntries(src: string, arrayName: string): string[] {
  const re = new RegExp(`export const ${arrayName}[^=]*=\\s*\\[`, 'm')
  const m = src.match(re)
  if (!m) return []
  let i = (m.index ?? 0) + m[0].length
  const entries: string[] = []
  let depth = 1
  let start = -1
  let inStr: string | null = null
  let escape = false
  while (i < src.length && depth > 0) {
    const c = src[i]
    if (inStr) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === inStr) inStr = null
    } else {
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') {
        if (depth === 1) start = i
        depth++
      } else if (c === '}') {
        depth--
        if (depth === 1 && start >= 0) {
          entries.push(src.slice(start, i + 1))
          start = -1
        }
      } else if (c === '[') depth++
      else if (c === ']') {
        depth--
        if (depth === 0) break
      }
    }
    i++
  }
  return entries
}

function field(block: string, key: string): string {
  const re = new RegExp(`\\b${key}\\s*:\\s*(['\"\`])((?:\\\\.|(?!\\1).)*?)\\1`, 's')
  const m = block.match(re)
  if (m) return m[2]
  const num = block.match(new RegExp(`\\b${key}\\s*:\\s*(\\d+)`))
  return num ? num[1] : ''
}

// Read seed-pdf-map.json as source of truth
async function loadLinkage(): Promise<{ hasLocalPdf: Set<string>; hasAnyMatch: Set<string> }> {
  const p = path.join(RESEARCH, 'seed-pdf-map.json')
  const map = JSON.parse(await fs.readFile(p, 'utf8'))
  const hasLocalPdf = new Set<string>()
  for (const group of ['theses', 'reports', 'sources'] as const) {
    for (const id of Object.keys(map[group])) hasLocalPdf.add(id)
  }
  // hasAnyMatch would also include MD-only matches, but for queue purposes
  // the seed-pdf-map is the canonical truth about PDFs.
  return { hasLocalPdf, hasAnyMatch: new Set(hasLocalPdf) }
}

async function loadTheses(hasLocalPdf: Set<string>): Promise<QueueRow[]> {
  const src = await fs.readFile(path.join(ROOT, 'src/lib/data/theses.ts'), 'utf8')
  const blocks = parseEntries(src, 'theses')
  const out: QueueRow[] = []
  for (const b of blocks) {
    const id = field(b, 'id')
    if (hasLocalPdf.has(id)) continue
    const url = field(b, 'url')
    if (!url) continue
    out.push({
      priority: 'P1',
      source: 'theses.ts',
      id,
      title: field(b, 'title'),
      year: field(b, 'year'),
      url,
      urlType: classifyUrl(url),
      access: 'open',
      targetPath: `research/evidence-pack/akademia/${id}.pdf`,
      note: `thesis; inst=${field(b, 'institution')}`,
    })
  }
  return out
}

async function loadReports(hasLocalPdf: Set<string>): Promise<QueueRow[]> {
  const src = await fs.readFile(path.join(ROOT, 'src/lib/data/reports.ts'), 'utf8')
  const blocks = parseEntries(src, 'reports')
  const out: QueueRow[] = []
  for (const b of blocks) {
    const id = field(b, 'id')
    if (hasLocalPdf.has(id)) continue
    const url = field(b, 'sourceUrl')
    if (!url) continue
    const cat = field(b, 'reportCategory') || 'offentlig'
    out.push({
      priority: 'P1',
      source: 'reports.ts',
      id,
      title: field(b, 'title'),
      year: field(b, 'year'),
      url,
      urlType: classifyUrl(url),
      access: 'unknown',
      targetPath: `research/evidence-pack/${cat === 'nou' ? 'offentlig' : cat}/${id}.pdf`,
      note: `report; inst=${field(b, 'institution')}`,
    })
  }
  return out
}

async function loadSources(hasAnyMatch: Set<string>): Promise<QueueRow[]> {
  const src = await fs.readFile(path.join(ROOT, 'src/lib/data/sources.ts'), 'utf8')
  const blocks = parseEntries(src, 'sources')
  const out: QueueRow[] = []
  for (const b of blocks) {
    const id = field(b, 'id')
    if (hasAnyMatch.has(id)) continue
    const url = field(b, 'url')
    if (!url) continue
    out.push({
      priority: 'P2',
      source: 'sources.ts',
      id,
      title: field(b, 'description'),
      year: '',
      url,
      urlType: classifyUrl(url),
      access: 'unknown',
      targetPath: `research/evidence-pack/offentlig/${id}.pdf`,
      note: `sourcedoc; filename=${field(b, 'filename')}`,
    })
  }
  return out
}

// ────────────────────────────────────────────────────────────
// MD scrape — find URLs in research/bibliotek/ and research/norden/
async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    for (const e of entries) {
      const abs = path.join(dir, e.name)
      if (e.isDirectory()) await walk(abs, acc)
      else if (e.isFile() && abs.endsWith('.md')) acc.push(abs)
    }
  } catch {
    /* missing */
  }
  return acc
}

async function loadMdScrape(): Promise<QueueRow[]> {
  const dirs = [
    path.join(RESEARCH, 'bibliotek'),
    path.join(RESEARCH, 'norden'),
  ]
  const files: string[] = []
  for (const d of dirs) await walk(d, files)

  const out: QueueRow[] = []
  const seen = new Set<string>()
  for (const f of files) {
    const text = await fs.readFile(f, 'utf8')
    const lines = text.split('\n')
    // Scan first 30 lines (frontmatter area)
    const head = lines.slice(0, 30)
    for (const l of head) {
      const urlMatch = l.match(/https?:\/\/\S+?(?=[\s)>\]"']|$)/)
      if (!urlMatch) continue
      const url = urlMatch[0].replace(/[.,;:]+$/, '')
      if (seen.has(url)) continue
      if (!/pdf|doi|hdl|regjeringen|nou|konkurranse|nhh|nmbu|sifo|diva/i.test(url)) continue
      seen.add(url)
      const title = lines[0].replace(/^#\s*/, '').trim().slice(0, 120)
      out.push({
        priority: 'P3',
        source: 'md-scrape',
        id: path.relative(RESEARCH, f).replace(/\.md$/, ''),
        title,
        year: '',
        url,
        urlType: classifyUrl(url),
        access: 'unknown',
        targetPath: '',
        note: `cited in ${path.relative(RESEARCH, f)}`,
      })
      break // one URL per MD is enough for queue
    }
  }
  return out
}

function dedupeByUrl(rows: QueueRow[]): QueueRow[] {
  const byUrl = new Map<string, QueueRow>()
  const prio = { P1: 3, P2: 2, P3: 1 }
  for (const r of rows) {
    const key = r.url.toLowerCase()
    const existing = byUrl.get(key)
    if (!existing || prio[r.priority] > prio[existing.priority]) byUrl.set(key, r)
  }
  return Array.from(byUrl.values())
}

function csvEscape(s: string): string {
  if (s == null) return ''
  const str = String(s)
  if (/[",\n]/.test(str)) return '"' + str.replace(/"/g, '""') + '"'
  return str
}

function esc(s: string): string {
  return String(s ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').slice(0, 120)
}

async function main() {
  console.log('[download-queue] loading linkage…')
  const { hasLocalPdf, hasAnyMatch } = await loadLinkage()
  console.log(`[download-queue] hasLocalPdf=${hasLocalPdf.size} hasAnyMatch=${hasAnyMatch.size}`)

  const backlog = await loadBacklogCsv()
  const pubmed = await loadPubmedJsonl()
  const theses = await loadTheses(hasLocalPdf)
  const reports = await loadReports(hasLocalPdf)
  const sources = await loadSources(hasAnyMatch)
  const mdScrape = await loadMdScrape()

  console.log(
    `[download-queue] backlog=${backlog.length} pubmed=${pubmed.length} theses=${theses.length} reports=${reports.length} sources=${sources.length} md-scrape=${mdScrape.length}`
  )

  const all = [...backlog, ...pubmed, ...theses, ...reports, ...sources, ...mdScrape]
  const deduped = dedupeByUrl(all)
  const prioSort = { P1: 0, P2: 1, P3: 2 }
  deduped.sort(
    (a, b) => prioSort[a.priority] - prioSort[b.priority] || a.source.localeCompare(b.source)
  )

  console.log(`[download-queue] ${deduped.length} unique URLs after dedup`)

  // CSV
  const csvHeader = [
    'priority',
    'source',
    'id',
    'title',
    'year',
    'url',
    'url_type',
    'access',
    'target_path',
    'note',
  ]
  const csvLines = [csvHeader.join(',')]
  for (const r of deduped) {
    csvLines.push(
      [
        r.priority,
        r.source,
        r.id,
        r.title,
        r.year,
        r.url,
        r.urlType,
        r.access,
        r.targetPath,
        r.note,
      ]
        .map(csvEscape)
        .join(',')
    )
  }
  await fs.writeFile(OUT_CSV, csvLines.join('\n'), 'utf8')

  // Markdown
  const lines: string[] = []
  lines.push('# Nedlastings-kø — manglende originaldokumenter')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/build-download-queue.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push('')
  lines.push('Dette er kilder vi **vet om** via seed-filer, backlog-CSV, PubMed-manifest og MD-frontmatter, men som mangler lokal PDF. Duplisert på URL og sortert etter prioritet.')
  lines.push('')

  const byPrio = { P1: 0, P2: 0, P3: 0 }
  for (const r of deduped) byPrio[r.priority]++
  const bySource = new Map<string, number>()
  for (const r of deduped) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1)

  lines.push('## Sammendrag')
  lines.push('')
  lines.push(`**Totalt:** ${deduped.length} unike URL-er`)
  lines.push('')
  lines.push('| Prioritet | Antall |')
  lines.push('|---|---:|')
  lines.push(`| P1 (plattform-kjerne) | ${byPrio.P1} |`)
  lines.push(`| P2 (evidens/sitater) | ${byPrio.P2} |`)
  lines.push(`| P3 (MD-frontmatter) | ${byPrio.P3} |`)
  lines.push('')
  lines.push('| Kilde | Antall |')
  lines.push('|---|---:|')
  for (const [s, n] of Array.from(bySource.entries()).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${s} | ${n} |`)
  }
  lines.push('')

  for (const prio of ['P1', 'P2', 'P3'] as const) {
    const rows = deduped.filter((r) => r.priority === prio)
    if (rows.length === 0) continue
    lines.push(`## ${prio} — ${rows.length}`)
    lines.push('')
    lines.push('| ID | Kilde | Tittel | År | URL-type | Access | Target |')
    lines.push('|---|---|---|---|---|---|---|')
    for (const r of rows) {
      lines.push(
        `| \`${esc(r.id)}\` | ${r.source} | ${esc(r.title)} | ${esc(r.year)} | ${r.urlType} | ${r.access} | \`${esc(r.targetPath)}\` |`
      )
    }
    lines.push('')
  }

  await fs.writeFile(OUT_MD, lines.join('\n'), 'utf8')
  console.log(`[download-queue] wrote ${OUT_MD}`)
  console.log(`[download-queue] wrote ${OUT_CSV}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
