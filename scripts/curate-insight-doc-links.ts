// Smart curation av insight-doc-koblinger:
//   - Filtrerer ut meta-dokumenter (promptpacks, audits, deep-research-prompts)
//     som ikke er reelt sitérbare kilder
//   - Aksepterer top-1 per insight når rank >= 15 og doc er "real source"
//   - Skriver y i decision-kolonnen
//
// Bruk:
//   npx tsx scripts/curate-insight-doc-links.ts            (curate)
//   npx tsx scripts/curate-insight-doc-links.ts --report   (vis hva som ville aksepteres)

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const REPO = '/Users/gabrielboen/Documents/Food Systems 2026'
const CSV_PATH = join(REPO, 'research/_status/insight-doc-link-candidates-2026-05-11.csv')

// Excludelist: title-patterns som indikerer dokumentet er en
// research-process-artifact, ikke en sitérbar kilde.
const META_DOC_PATTERNS = [
  /promptpack/i,
  /research corpus audit/i,
  /pdf-gjennomgang/i,
  /perplexity/i,
  /arkiv-indeks/i,
  /sentralt kilderegister/i,
  /sentralt\s+kilderegister/i,
  /^kartlegg /i,
  /^identifiser /i,
  /^oppdater /i,
  /dypforskning/i,
  /\[deep research\]/i,
  /\bdeep[-\s]research\b/i,
  /\b9\.\s*mars[-\s]notater\b/i,
  /møtenotat/i,
  /motenotat/i,
  /gap list:/i,
  /^søknad nch/i,
  /promotion preview/i,
  /strategisk ledergruppe/i,
  /nordic house møte/i,
  /prioritert masterlogg/i,
  /prioritert\s+masterlogg/i,
  /tidsserier:/i,
  /oslo innovasjonsprogram/i,
  /innovasjons[- ]?program 2025/i,
  /food systems application/i,
  /nch[- ]application/i,
  /ni soknad/i,
  /\boppdater[- ]/i,
  /massebalanse-tallene/i,
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
  'norge','norske','norsk','nordisk','nordiske','norden','land','landet','i',
])

function meaningfulTokens(s: string): Set<string> {
  return new Set(
    s.toLowerCase()
      .replace(/[^a-zæøå0-9\s-]/gi, ' ')
      .split(/\s+/)
      .filter(t => t.length >= 4 && !STOPWORDS.has(t) && !/^[0-9]+$/.test(t))
  )
}

// Title-anchor gate: how many meaningful tokens from insight title appear in doc title?
function titleOverlap(insightTitle: string, docTitle: string): number {
  const a = meaningfulTokens(insightTitle)
  const b = meaningfulTokens(docTitle)
  let n = 0
  for (const t of a) if (b.has(t)) n++
  return n
}

type Row = {
  insightId: string
  insightTitle: string
  docId: string
  docTitle: string
  rank: number
  confidence: string
  decision: string
  rawLine: string
}

function parseCsv(text: string): { header: string; rows: Row[] } {
  const lines = text.split('\n')
  const header = lines[0]
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim().length === 0) continue
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; cur += ch; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 7) continue
    rows.push({
      insightId: fields[0],
      insightTitle: fields[1].replace(/^"|"$/g, '').replace(/""/g, '"'),
      docId: fields[2],
      docTitle: fields[3].replace(/^"|"$/g, '').replace(/""/g, '"'),
      rank: Number(fields[4]),
      confidence: fields[5],
      decision: fields[6],
      rawLine: lines[i],
    })
  }
  return { header, rows }
}

async function main() {
  const reportMode = process.argv.includes('--report')

  const { header, rows } = parseCsv(readFileSync(CSV_PATH, 'utf-8'))

  const byInsight = new Map<string, Row[]>()
  for (const r of rows) {
    const list = byInsight.get(r.insightId) ?? []
    list.push(r)
    byInsight.set(r.insightId, list)
  }
  for (const list of byInsight.values()) list.sort((a, b) => b.rank - a.rank)

  const acceptedKeys = new Set<string>()
  type Decision = { insightId: string; insightTitle: string; docTitle: string; rank: number; reason: string }
  const accepted: Decision[] = []
  const rejected: Decision[] = []
  let insightsWithoutGoodMatch = 0

  for (const [insightId, list] of byInsight) {
    const insightTitle = list[0].insightTitle
    // Find first non-meta candidate with rank >= 15 AND title-overlap >= 1
    let chosen: Row | null = null
    let chosenReason = ''
    for (const r of list) {
      if (isMetaDoc(r.docTitle)) continue
      if (r.rank < 15) break // sorted desc
      const overlap = titleOverlap(insightTitle, r.docTitle)
      if (overlap < 1) continue // require at least 1 meaningful title token shared
      chosen = r
      chosenReason = `rank=${r.rank}, overlap=${overlap} tokens`
      break
    }

    if (chosen) {
      acceptedKeys.add(`${chosen.insightId}|${chosen.docId}`)
      accepted.push({
        insightId: chosen.insightId,
        insightTitle: chosen.insightTitle,
        docTitle: chosen.docTitle,
        rank: chosen.rank,
        reason: chosenReason,
      })
    } else {
      insightsWithoutGoodMatch++
      // Track top reject for visibility
      const top = list[0]
      if (top) {
        rejected.push({
          insightId: top.insightId,
          insightTitle: top.insightTitle,
          docTitle: top.docTitle,
          rank: top.rank,
          reason: isMetaDoc(top.docTitle) ? 'meta-doc-excluded' : top.rank < 15 ? `rank ${top.rank} below threshold` : 'no candidate',
        })
      }
    }
  }

  console.log(`Insights total: ${byInsight.size}`)
  console.log(`Accepted (top-1 real-source rank >= 15): ${accepted.length}`)
  console.log(`Insights without good match: ${insightsWithoutGoodMatch}`)
  console.log('')

  if (reportMode) {
    console.log('=== ACCEPTED ===')
    for (const d of accepted.sort((a, b) => b.rank - a.rank)) {
      console.log(`[${d.rank}] ${d.insightId} ${d.insightTitle.slice(0, 50)}`)
      console.log(`     → ${d.docTitle.slice(0, 70)}`)
    }
    console.log('\n=== REJECTED (top candidate was filtered or below threshold) ===')
    for (const d of rejected.slice(0, 20)) {
      console.log(`[${d.rank}] ${d.insightId} ${d.insightTitle.slice(0, 50)} → ${d.reason}`)
    }
    return
  }

  // Update CSV: set decision='y' on accepted rows, clear others
  const lines = readFileSync(CSV_PATH, 'utf-8').split('\n')
  const out: string[] = [lines[0]]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().length === 0) { out.push(line); continue }
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of line) {
      if (ch === '"') { inQuote = !inQuote; cur += ch; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 7) { out.push(line); continue }
    const key = `${fields[0]}|${fields[2]}`
    fields[fields.length - 1] = acceptedKeys.has(key) ? 'y' : ''
    out.push(fields.join(','))
  }
  writeFileSync(CSV_PATH, out.join('\n'), 'utf-8')
  console.log(`CSV updated with ${accepted.length} 'y' marks: ${CSV_PATH}`)
  console.log(`Next: review the y-rows; run scripts/apply-insight-doc-links.ts to apply.`)
}

main().catch(e => { console.error(e); process.exit(1) })
