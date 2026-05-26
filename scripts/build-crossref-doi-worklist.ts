// Query Crossref for DOI candidates for Reports and SourceDocs missing a
// real DOI. Outputs a CSV worklist with top-3 Crossref matches per source,
// scored by title similarity + author/year corroboration.
//
// Humans review the worklist and apply high-confidence matches manually
// (or via a follow-up script with --apply).
//
// Skips Theses since Nordic theses use institutional handle IDs (`hdl:`,
// `urn:`) not Crossref DOIs.
//
// Output: research/_status/crossref-doi-worklist-<date>.csv
// npm script: audit:crossref-doi-worklist
//
// Critical analysis (PR #83): DOI coverage was 3–46%. This surfaces
// achievable wins without auto-committing potentially-bad fuzzy matches.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { reports } from '@seeds/reports'
import { sources } from '@seeds/sources'

type Args = { limit: number | null }

function parseArgs(argv: string[]): Args {
  let limit: number | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--limit') {
      limit = parseInt(argv[++i] ?? '', 10)
      if (isNaN(limit)) throw new Error('--limit requires a number')
    } else if (a.startsWith('--limit=')) {
      limit = parseInt(a.slice('--limit='.length), 10)
    } else {
      throw new Error(`Unknown argument: ${a}`)
    }
  }
  return { limit }
}

type Candidate = {
  source: 'Report' | 'SourceDoc'
  id: string
  title: string
  author: string
  year: string
}

type CrossrefItem = {
  DOI?: string
  title?: string[]
  author?: Array<{ family?: string; given?: string }>
  issued?: { 'date-parts'?: number[][] }
  publisher?: string
  type?: string
}

function isRealDoi(d: unknown): boolean {
  if (typeof d !== 'string') return false
  const lower = d.toLowerCase().trim()
  if (!lower) return false
  return lower.startsWith('10.') || lower.startsWith('https://doi.org/') || lower.startsWith('doi.org/')
}

function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,:;!?'"\-–—()[\]/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleSimilarity(a: string, b: string): number {
  const aN = normalizeTitle(a)
  const bN = normalizeTitle(b)
  if (aN === bN) return 1.0
  const aTokens = new Set(aN.split(' ').filter(t => t.length >= 3))
  const bTokens = new Set(bN.split(' ').filter(t => t.length >= 3))
  if (aTokens.size === 0 || bTokens.size === 0) return 0
  let intersection = 0
  for (const t of aTokens) if (bTokens.has(t)) intersection++
  const union = aTokens.size + bTokens.size - intersection
  return intersection / union
}

function escapeCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

const UA = 'FoodSystems2026/1.0 (mailto:gabriel@naturalstate.no)'

async function queryCrossref(c: Candidate): Promise<CrossrefItem[]> {
  const params = new URLSearchParams({
    'query.title': c.title,
    rows: '3',
  })
  if (c.author) params.set('query.author', c.author)
  const url = `https://api.crossref.org/works?${params.toString()}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, signal: ctrl.signal })
    if (!res.ok) return []
    const data = (await res.json()) as { message?: { items?: CrossrefItem[] } }
    return data.message?.items ?? []
  } catch {
    return []
  } finally {
    clearTimeout(timer)
  }
}

function scoreMatch(c: Candidate, item: CrossrefItem): number {
  const candTitle = c.title
  const itemTitle = (item.title ?? [])[0] ?? ''
  const titleScore = titleSimilarity(candTitle, itemTitle)

  const candYear = parseInt(c.year, 10)
  const itemYear = item.issued?.['date-parts']?.[0]?.[0]
  const yearOk = !isNaN(candYear) && itemYear ? Math.abs(itemYear - candYear) <= 1 : false

  const candAuthor = c.author.toLowerCase()
  const authorOk = (item.author ?? []).some(a =>
    candAuthor.includes((a.family ?? '').toLowerCase()) ||
    candAuthor.includes((a.given ?? '').toLowerCase()),
  )

  let score = titleScore * 0.7
  if (yearOk) score += 0.15
  if (authorOk) score += 0.15
  return Math.min(1, score)
}

async function main() {
  const { limit } = parseArgs(process.argv.slice(2))

  const candidates: Candidate[] = []
  for (const r of reports) {
    if (!isRealDoi(r.doi) && r.title && (r.author || r.institution)) {
      candidates.push({
        source: 'Report',
        id: r.id,
        title: r.title,
        author: r.author || r.institution || '',
        year: r.year != null ? String(r.year) : '',
      })
    }
  }
  for (const s of sources) {
    if (!isRealDoi(s.doi) && s.title && (s.author || s.publisher)) {
      candidates.push({
        source: 'SourceDoc',
        id: s.id,
        title: s.title,
        author: s.author || s.publisher || '',
        year: s.year != null ? String(s.year) : '',
      })
    }
  }

  const work = limit != null ? candidates.slice(0, limit) : candidates
  console.log(`DOI candidates: ${candidates.length}`)
  if (limit != null) console.log(`Limited to first ${work.length}.`)
  console.log(`Querying Crossref with 200ms pacing — estimated ${Math.ceil(work.length * 0.25)}s.\n`)

  type Row = {
    source: string
    id: string
    title: string
    bestScore: number
    bestDoi: string
    bestTitle: string
    bestYear: string
  }
  const out: Row[] = []
  let processed = 0
  let highConf = 0
  const start = Date.now()

  for (const c of work) {
    processed++
    const items = await queryCrossref(c)
    let bestScore = 0
    let bestDoi = ''
    let bestTitle = ''
    let bestYear = ''
    for (const item of items) {
      const score = scoreMatch(c, item)
      if (score > bestScore) {
        bestScore = score
        bestDoi = item.DOI ?? ''
        bestTitle = (item.title ?? [])[0] ?? ''
        bestYear = String(item.issued?.['date-parts']?.[0]?.[0] ?? '')
      }
    }
    if (bestScore >= 0.85) highConf++
    out.push({
      source: c.source,
      id: c.id,
      title: c.title,
      bestScore,
      bestDoi,
      bestTitle,
      bestYear,
    })

    if (processed % 25 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      console.log(`  ${processed} / ${work.length}  high-conf=${highConf}  (${elapsed}s)`)
    }
    await sleep(200)
  }

  out.sort((a, b) => b.bestScore - a.bestScore)

  const outDir = join(process.cwd(), 'research', '_status')
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
  const date = new Date().toISOString().slice(0, 10)
  const outPath = join(outDir, `crossref-doi-worklist-${date}.csv`)

  const header = ['source', 'id', 'best_score', 'best_doi', 'best_year', 'best_title', 'candidate_title'].join(',')
  const body = out
    .map(r =>
      [
        r.source,
        r.id,
        r.bestScore.toFixed(2),
        r.bestDoi,
        r.bestYear,
        escapeCsv(r.bestTitle),
        escapeCsv(r.title),
      ].join(','),
    )
    .join('\n')

  writeFileSync(outPath, header + '\n' + body + '\n', 'utf-8')

  console.log('\n── Summary ────────────────────')
  console.log(`  Processed:         ${processed}`)
  console.log(`  High confidence (≥0.85): ${highConf}`)
  console.log(`  Some signal (≥0.50):     ${out.filter(r => r.bestScore >= 0.5).length}`)
  console.log(`  No match (<0.50):        ${out.filter(r => r.bestScore < 0.5).length}`)
  console.log(`  Output: ${outPath}`)
  console.log(`\n  Review the high-confidence rows manually before applying DOIs to seed.`)
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
