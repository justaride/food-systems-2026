// v2: kuraterer kandidater fra Document/Report/Thesis (alle med Document-link).
// Strict gates: meta-filter + title-anchor + threshold.
//
// Bruk:
//   npx tsx scripts/curate-insight-links-v2.ts --report
//   npx tsx scripts/curate-insight-links-v2.ts            (skriver y-marker)
//
// Input:  research/_status/insight-link-candidates-v3-2026-05-11.csv
// Output: samme fil med decision='y' på godkjente

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = '/Users/gabrielboen/Documents/Food Systems 2026'
const CSV_PATH = join(REPO, 'research/_status/insight-link-candidates-v3-2026-05-11.csv')

const META_DOC_PATTERNS = [
  /promptpack/i, /research corpus audit/i, /pdf-gjennomgang/i, /perplexity/i,
  /arkiv-indeks/i, /sentralt kilderegister/i,
  /^kartlegg /i, /^identifiser /i, /^oppdater /i,
  /dypforskning/i, /\[deep research\]/i, /\bdeep[-\s]research\b/i,
  /\b9\.\s*mars[-\s]notater\b/i, /møtenotat/i, /motenotat/i,
  /gap list:/i, /^søknad nch/i,
  /promotion preview/i, /strategisk ledergruppe/i, /nordic house møte/i,
  /prioritert masterlogg/i, /tidsserier:/i,
  /oslo innovasjonsprogram/i, /innovasjons[- ]?program 2025/i,
  /food systems application/i, /nch[- ]application/i, /ni soknad/i,
  /\boppdater[- ]/i, /massebalanse-tallene/i,
  /\bnordics?\s+circular\s+food\s+systems\b/i,
]

function isMetaDoc(title: string): boolean {
  return META_DOC_PATTERNS.some(p => p.test(title))
}

const STOPWORDS = new Set([
  'over','under','etter','mellom','blant','rundt','dette','disse','denne',
  'være','vare','vart','varte','ikke','også','ogsa','andre','noen','for','med',
  'til','fra','som','er','har','men','og','eller','at','de','det','den','en','et',
  'av','i','på','pa','om','så','sa','kan','vil','har','via','per','mer',
  'siden','mange','flere','alle','hver','samme','egen','egne','større','storre',
  'norge','norske','norsk','nordisk','nordiske','norden','land','landet',
])

function meaningfulTokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase()
      .replace(/[^a-zæøå0-9\s-]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 4 && !STOPWORDS.has(t) && !/^[0-9]+$/.test(t))
  )
}

function titleOverlap(a: string, b: string): number {
  const at = meaningfulTokens(a), bt = meaningfulTokens(b)
  let n = 0
  for (const t of at) if (bt.has(t)) n++
  return n
}

type Row = {
  insightId: string; insightTitle: string;
  docId: string; docTitle: string; source: string;
  rank: number; confidence: string; decision: string;
}

function parseCsv(text: string): { header: string; rows: Row[] } {
  const lines = text.split('\n')
  const header = lines[0]
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim().length === 0) continue
    const fields: string[] = []
    let cur = ''; let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; cur += ch; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 8) continue
    rows.push({
      insightId: fields[0],
      insightTitle: fields[1].replace(/^"|"$/g, '').replace(/""/g, '"'),
      docId: fields[2],
      docTitle: fields[3].replace(/^"|"$/g, '').replace(/""/g, '"'),
      source: fields[4],
      rank: Number(fields[5]),
      confidence: fields[6],
      decision: fields[7],
    })
  }
  return { header, rows }
}

function main() {
  const reportMode = process.argv.includes('--report')
  const { rows } = parseCsv(readFileSync(CSV_PATH, 'utf-8'))

  // Group by insight; pick best (highest-rank) non-meta with title-overlap >=1.
  // To avoid duplicate (insightId, docId) refs across Document/Report/Thesis,
  // dedupe on docId — keep highest rank.
  const byInsight = new Map<string, Row[]>()
  for (const r of rows) {
    const list = byInsight.get(r.insightId) ?? []
    list.push(r)
    byInsight.set(r.insightId, list)
  }

  type Decision = { row: Row; reason: string }
  const accepted: Decision[] = []
  const acceptedKeys = new Set<string>()
  let withoutMatch = 0

  for (const [, list] of byInsight) {
    // Dedupe on docId, keep max rank
    const byDoc = new Map<string, Row>()
    for (const r of list) {
      const existing = byDoc.get(r.docId)
      if (!existing || r.rank > existing.rank) byDoc.set(r.docId, r)
    }
    const candidates = [...byDoc.values()].sort((a, b) => b.rank - a.rank)

    let chosen: Row | null = null
    // Tier 1: rank >= 15, overlap >= 1
    for (const r of candidates) {
      if (isMetaDoc(r.docTitle)) continue
      if (r.rank < 15) break
      if (titleOverlap(r.insightTitle, r.docTitle) < 1) continue
      chosen = r
      break
    }
    // Tier 2 fallback: rank 8–15, overlap >= 2 (stricter overlap compensates lower rank)
    if (!chosen) {
      for (const r of candidates) {
        if (isMetaDoc(r.docTitle)) continue
        if (r.rank >= 15) continue
        if (r.rank < 8) break
        if (titleOverlap(r.insightTitle, r.docTitle) < 2) continue
        chosen = r
        break
      }
    }
    // Tier 3 fallback: rank 5–8, overlap >= 3 (very strict overlap, very low rank)
    if (!chosen) {
      for (const r of candidates) {
        if (isMetaDoc(r.docTitle)) continue
        if (r.rank >= 8) continue
        if (r.rank < 5) break
        if (titleOverlap(r.insightTitle, r.docTitle) < 3) continue
        chosen = r
        break
      }
    }

    if (chosen) {
      acceptedKeys.add(`${chosen.insightId}|${chosen.docId}`)
      accepted.push({ row: chosen, reason: `rank=${chosen.rank.toFixed(1)} src=${chosen.source}` })
    } else {
      withoutMatch++
    }
  }

  console.log(`Insights total: ${byInsight.size}`)
  console.log(`Accepted: ${accepted.length}`)
  console.log(`Without match: ${withoutMatch}`)
  console.log('')

  if (reportMode) {
    accepted.sort((a, b) => b.row.rank - a.row.rank)
    console.log('=== ACCEPTED ===')
    for (const d of accepted) {
      console.log(`[${d.row.rank.toFixed(1)} ${d.row.source.padEnd(8)}] ${d.row.insightId} ${d.row.insightTitle.slice(0, 50)}`)
      console.log(`     → ${d.row.docTitle.slice(0, 70)}`)
    }
    return
  }

  // Update CSV
  const lines = readFileSync(CSV_PATH, 'utf-8').split('\n')
  const out: string[] = [lines[0]]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().length === 0) { out.push(line); continue }
    const fields: string[] = []
    let cur = ''; let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; cur += ch; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 8) { out.push(line); continue }
    const key = `${fields[0]}|${fields[2]}`
    fields[fields.length - 1] = acceptedKeys.has(key) ? 'y' : ''
    out.push(fields.join(','))
  }
  writeFileSync(CSV_PATH, out.join('\n'), 'utf-8')
  console.log(`CSV updated with ${accepted.length} y marks.`)
}

main()
