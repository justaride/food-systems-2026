import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT = path.join(RESEARCH, 'seed-pdf-map.json')

// Manual overrides for cases where the matcher can't or shouldn't auto-match
// Edit this to add known mappings or to exclude false positives.
const MANUAL_OVERRIDE_FILE = path.join(RESEARCH, 'seed-pdf-map.overrides.json')

type Entry = {
  id: string
  title: string
  year: string
  extra: string
  raw: string
}

type MapEntry = {
  pdf: string
  score: number
  confidence: 'high' | 'medium' | 'low'
  why: string
}

// ─────── Seed parsing (same as audit script) ───────
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

// ─────── Slugs and tokens ───────
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[æø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const PREFIX_STOPWORDS = new Set([
  'kt', 'nou', 'meld', 'sou', 'st', 'eu', 'dk', 'se', 'fi', 'is', 'no',
])

function stripPrefix(slug: string): string {
  const parts = slug.split('-')
  while (parts.length > 1 && PREFIX_STOPWORDS.has(parts[0])) parts.shift()
  return parts.join('-')
}

const TOK_STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'from', 'report', 'rapport', 'study', 'studie',
  'analysis', 'analyse', 'status', 'part', 'del', 'versjon', 'offentlig',
  'offisiell', 'food', 'mat', 'norge', 'norsk', 'norsk-', 'norway', 'annual',
  'aarsrapport', 'nordic', 'nordisk',
])

function toks(s: string): string[] {
  return slugify(s)
    .split('-')
    .filter((t) => t.length >= 4 && !TOK_STOPWORDS.has(t))
}

function firstAuthorLast(authors: string): string {
  const first = authors.split(/[&,]/)[0] || ''
  const parts = first.trim().split(/\s+/)
  return slugify(parts[parts.length - 1] || '')
}

// ─────── Matching ───────
type MatchCandidate = {
  pdf: string
  score: number
  reasons: string[]
}

function scorePdf(base: string, entry: Entry, mode: 'thesis' | 'report' | 'source'): MatchCandidate | null {
  const idSlug = slugify(entry.id)
  const idStripped = stripPrefix(idSlug)
  const year = entry.year || (entry.raw.match(/\byear\s*:\s*(\d{4})/) || ['', ''])[1]
  const authorLast = mode === 'thesis' ? firstAuthorLast(entry.extra) : ''
  const titleToks = toks(entry.title)
  const extraSlug = slugify(entry.extra)

  let score = 0
  const reasons: string[] = []

  // Exact filename match
  if (base === idSlug) { score += 20; reasons.push('exact-id') }
  else if (base === idStripped && idStripped !== idSlug) { score += 18; reasons.push('exact-id-stripped') }

  // id as substring (at boundary)
  if (score < 18 && idSlug.length >= 4) {
    if (base.startsWith(idSlug + '-') || base.endsWith('-' + idSlug) || base.includes('-' + idSlug + '-')) {
      score += 12; reasons.push('id-boundary')
    } else if (base.includes(idSlug)) {
      score += 6; reasons.push('id-contains')
    }
  }
  if (score < 10 && idStripped !== idSlug && idStripped.length >= 4) {
    if (base.startsWith(idStripped + '-') || base.endsWith('-' + idStripped) || base.includes('-' + idStripped + '-')) {
      score += 10; reasons.push('id-stripped-boundary')
    } else if (base.includes(idStripped)) {
      score += 5; reasons.push('id-stripped-contains')
    }
  }

  // Source mode: filename field is authoritative
  if (mode === 'source' && extraSlug) {
    const fn = extraSlug.replace(/-(pdf|md|docx|html|png|jpg)$/i, '')
    if (fn && base === fn) { score += 25; reasons.push('filename-exact') }
    else if (fn && base.includes(fn) && fn.length >= 6) { score += 15; reasons.push('filename-contains') }
  }

  // Author last name
  if (authorLast.length >= 4 && base.includes(authorLast)) {
    score += 4; reasons.push(`author-${authorLast}`)
  }

  // Year
  if (year && base.includes(year)) { score += 2; reasons.push(`year-${year}`) }
  else if (year && base.includes((parseInt(year) + 1).toString())) { score += 1; reasons.push(`year-off-by-one`) }

  // Title tokens
  let tokHits = 0
  const hitTokens: string[] = []
  for (const t of titleToks) {
    if (base.includes(t)) { tokHits++; hitTokens.push(t) }
  }
  if (tokHits >= 1) score += tokHits * 2
  if (tokHits >= 3) { score += 3; reasons.push(`title-${tokHits}tok`) }
  else if (tokHits >= 1) reasons.push(`title-${hitTokens.join(',')}`)

  if (score <= 0) return null
  return { pdf: '', score, reasons }
}

type PdfFile = { rel: string; base: string; abs: string }

async function walkPdfs(dir: string, acc: PdfFile[] = []): Promise<PdfFile[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) await walkPdfs(abs, acc)
    else if (e.isFile() && abs.toLowerCase().endsWith('.pdf')) {
      const rel = path.relative(RESEARCH, abs)
      const base = slugify(path.basename(e.name, '.pdf'))
      acc.push({ rel, base, abs })
    }
  }
  return acc
}

function bestMatch(entry: Entry, pdfs: PdfFile[], mode: 'thesis' | 'report' | 'source'): MatchCandidate | null {
  let best: MatchCandidate | null = null
  for (const p of pdfs) {
    const c = scorePdf(p.base, entry, mode)
    if (!c) continue
    if (!best || c.score > best.score) best = { pdf: p.rel, score: c.score, reasons: c.reasons }
  }
  return best
}

function classifyConfidence(score: number): MapEntry['confidence'] {
  if (score >= 18) return 'high'
  if (score >= 10) return 'medium'
  return 'low'
}

async function loadOverrides(): Promise<{
  theses: Record<string, string>
  reports: Record<string, string>
  sources: Record<string, string>
  exclude_pdfs?: string[]
}> {
  try {
    const text = await fs.readFile(MANUAL_OVERRIDE_FILE, 'utf8')
    return JSON.parse(text)
  } catch {
    return { theses: {}, reports: {}, sources: {} }
  }
}

async function main() {
  const [thesesSrc, reportsSrc, sourcesSrc] = await Promise.all([
    fs.readFile(path.join(ROOT, 'prisma/seed-data/theses.ts'), 'utf8'),
    fs.readFile(path.join(ROOT, 'prisma/seed-data/reports.ts'), 'utf8'),
    fs.readFile(path.join(ROOT, 'prisma/seed-data/sources.ts'), 'utf8'),
  ])

  const parseWith = (src: string, name: string, extraKey: string): Entry[] =>
    parseEntries(src, name).map((b) => ({
      id: field(b, 'id'),
      title: field(b, 'title') || field(b, 'description'),
      year: field(b, 'year'),
      extra: field(b, extraKey),
      raw: b,
    }))

  const theses = parseWith(thesesSrc, 'theses', 'authors')
  const reports = parseWith(reportsSrc, 'reports', 'institution')
  const sources = parseWith(sourcesSrc, 'sources', 'filename')

  const pdfs = await walkPdfs(RESEARCH)
  console.log(`[seed-map] ${theses.length} theses, ${reports.length} reports, ${sources.length} sources, ${pdfs.length} pdfs`)

  const overrides = await loadOverrides()
  const excludePdfs = new Set(overrides.exclude_pdfs || [])
  const usablePdfs = pdfs.filter((p) => !excludePdfs.has(p.rel))

  const map = {
    generatedAt: new Date().toISOString(),
    theses: {} as Record<string, MapEntry>,
    reports: {} as Record<string, MapEntry>,
    sources: {} as Record<string, MapEntry>,
    orphanPdfs: [] as string[],
    seedWithoutPdf: {
      theses: [] as string[],
      reports: [] as string[],
      sources: [] as string[],
    },
  }

  const usedPdfs = new Set<string>()

  const processGroup = (
    entries: Entry[],
    mode: 'thesis' | 'report' | 'source',
    target: Record<string, MapEntry>,
    overrideMap: Record<string, string>,
    missingList: string[]
  ) => {
    for (const e of entries) {
      if (!e.id) continue
      // Manual override takes precedence
      if (overrideMap[e.id]) {
        target[e.id] = {
          pdf: overrideMap[e.id],
          score: 999,
          confidence: 'high',
          why: 'manual-override',
        }
        usedPdfs.add(overrideMap[e.id])
        continue
      }
      const m = bestMatch(e, usablePdfs, mode)
      if (m && m.score >= 6) {
        target[e.id] = {
          pdf: m.pdf,
          score: m.score,
          confidence: classifyConfidence(m.score),
          why: m.reasons.join('+'),
        }
        usedPdfs.add(m.pdf)
      } else {
        missingList.push(e.id)
      }
    }
  }

  processGroup(theses, 'thesis', map.theses, overrides.theses, map.seedWithoutPdf.theses)
  processGroup(reports, 'report', map.reports, overrides.reports, map.seedWithoutPdf.reports)
  processGroup(sources, 'source', map.sources, overrides.sources, map.seedWithoutPdf.sources)

  // Orphans: PDFs not used by any mapping, excluding generated figures and manual exclusions
  const IGNORE_ORPHAN_PATTERNS = [/^visualisering\/figurer\//, /^external\/nch-contract\//]
  for (const p of pdfs) {
    if (usedPdfs.has(p.rel)) continue
    if (excludePdfs.has(p.rel)) continue
    if (IGNORE_ORPHAN_PATTERNS.some((re) => re.test(p.rel))) continue
    map.orphanPdfs.push(p.rel)
  }
  map.orphanPdfs.sort()

  // Summary
  const summarize = (
    label: string,
    target: Record<string, MapEntry>,
    missing: string[],
    total: number
  ) => {
    const high = Object.values(target).filter((m) => m.confidence === 'high').length
    const med = Object.values(target).filter((m) => m.confidence === 'medium').length
    const low = Object.values(target).filter((m) => m.confidence === 'low').length
    console.log(
      `[seed-map] ${label}: ${Object.keys(target).length}/${total} matched (high=${high} med=${med} low=${low}), ${missing.length} without pdf`
    )
  }
  summarize('theses', map.theses, map.seedWithoutPdf.theses, theses.length)
  summarize('reports', map.reports, map.seedWithoutPdf.reports, reports.length)
  summarize('sources', map.sources, map.seedWithoutPdf.sources, sources.length)
  console.log(`[seed-map] ${map.orphanPdfs.length} orphan PDFs (excluding figurer/nch-contract)`)

  await fs.writeFile(OUT, JSON.stringify(map, null, 2), 'utf8')
  console.log(`[seed-map] wrote ${OUT}`)

  // Touch overrides file with a template if it doesn't exist (don't overwrite)
  try {
    await fs.access(MANUAL_OVERRIDE_FILE)
  } catch {
    const template = {
      _comment:
        'Manuelle overstyringer for seed-pdf-map. id → relative path (fra research/). exclude_pdfs = filer som ikke skal med i orphan-listen.',
      theses: {},
      reports: {},
      sources: {},
      exclude_pdfs: [],
    }
    await fs.writeFile(MANUAL_OVERRIDE_FILE, JSON.stringify(template, null, 2), 'utf8')
    console.log(`[seed-map] wrote template ${MANUAL_OVERRIDE_FILE}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
