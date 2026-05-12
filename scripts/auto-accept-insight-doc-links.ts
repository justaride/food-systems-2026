// Forsiktig auto-accept: kobler top-1 Document for insights der den
// dominerer rank #2 med margin. Skriver 'y' i decision-kolonnen til
// kandidat-CSV-en for de godkjente — så kjør apply-insight-doc-links.ts
// for å faktisk skrive til DB.
//
// Kriterier (alle må holde):
//   - confidence = 'high' (rank > 15)
//   - rank top-1 >= 20
//   - rank top-1 >= 1.5 × rank top-2 (eller bare 1 kandidat)
//
// Idé: gir ~30-50 trygge baseline-koblinger uten manuell review.
// Resten av medium/low-kandidatene må fortsatt review'es manuelt.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = '/Users/gabrielboen/Documents/Food Systems 2026'
const CSV_PATH = join(REPO, 'research/_status/insight-doc-link-candidates-2026-05-11.csv')

type RawRow = {
  insightId: string
  insightTitleField: string
  docId: string
  docTitleField: string
  rankField: string
  rank: number
  confidence: string
  decision: string
  raw: string
}

function parseCsv(text: string): { header: string; rows: RawRow[] } {
  const lines = text.split('\n')
  const header = lines[0]
  const rows: RawRow[] = []
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
      insightTitleField: fields[1],
      docId: fields[2],
      docTitleField: fields[3],
      rankField: fields[4],
      rank: Number(fields[4]),
      confidence: fields[5],
      decision: fields[6],
      raw: lines[i],
    })
  }
  return { header, rows }
}

function main() {
  const { header, rows } = parseCsv(readFileSync(CSV_PATH, 'utf-8'))

  // Group by insight, sort by rank desc
  const byInsight = new Map<string, RawRow[]>()
  for (const r of rows) {
    const list = byInsight.get(r.insightId) ?? []
    list.push(r)
    byInsight.set(r.insightId, list)
  }
  for (const list of byInsight.values()) {
    list.sort((a, b) => b.rank - a.rank)
  }

  const acceptIds = new Set<string>()
  let accepted = 0
  for (const [insightId, list] of byInsight) {
    if (list.length === 0) continue
    const top = list[0]
    const next = list[1]
    const dominates = !next || top.rank >= next.rank * 1.5
    if (top.confidence === 'high' && top.rank >= 20 && dominates) {
      acceptIds.add(`${insightId}|${top.docId}`)
      accepted++
    }
  }

  console.log(`Insights covered: ${byInsight.size}`)
  console.log(`Auto-accept candidates (top1 rank>=20 AND dominates 1.5×): ${accepted}`)

  // Rewrite CSV with decision='y' on accepted rows
  const lines = readFileSync(CSV_PATH, 'utf-8').split('\n')
  const out: string[] = [lines[0]]
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().length === 0) { out.push(line); continue }
    // Parse just enough to identify (insightId, docId)
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
    if (acceptIds.has(key)) {
      // Replace last field with 'y'
      fields[fields.length - 1] = 'y'
      out.push(fields.join(','))
    } else {
      out.push(line)
    }
  }

  writeFileSync(CSV_PATH, out.join('\n'), 'utf-8')
  console.log(`\nCSV updated: ${CSV_PATH}`)
  console.log(`Next: review the marked 'y' rows; remove any false-positives; then run apply-insight-doc-links.ts`)
}

main()
