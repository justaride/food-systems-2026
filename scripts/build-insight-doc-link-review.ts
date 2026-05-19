// Bygger en human-readable markdown-review av insight-doc-koblingskandidater.
// Input: research/_status/insight-doc-link-candidates-2026-05-11.csv (generert av suggest-insight-doc-links.sql)
// Output: research/_status/insight-doc-link-review-2026-05-11.md
// Brukeren kan så markere y/n i CSV-en og kjøre apply-insight-doc-links.sql.

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const REPO = process.cwd()
const CSV_PATH = join(REPO, 'research/_status/insight-doc-link-candidates-2026-05-11.csv')
const MD_PATH = join(REPO, 'research/_status/insight-doc-link-review-2026-05-11.md')

type Row = {
  insightId: string
  insightTitle: string
  docId: string
  docTitle: string
  rank: number
  confidence: 'high' | 'medium' | 'low'
}

// Robust CSV parser handling quoted fields with commas
function parseCsv(text: string): Row[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  if (lines.length < 2) return []
  const out: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 7) continue
    out.push({
      insightId: fields[0],
      insightTitle: fields[1],
      docId: fields[2],
      docTitle: fields[3],
      rank: Number(fields[4]),
      confidence: (fields[5] as Row['confidence']) ?? 'low',
    })
  }
  return out
}

function main() {
  const rows = parseCsv(readFileSync(CSV_PATH, 'utf-8'))
  if (rows.length === 0) {
    console.error('No rows in candidate CSV')
    process.exit(1)
  }

  const byInsight = new Map<string, Row[]>()
  for (const r of rows) {
    const list = byInsight.get(r.insightId) ?? []
    list.push(r)
    byInsight.set(r.insightId, list)
  }

  const insightCount = byInsight.size
  const totalCandidates = rows.length
  const high = rows.filter(r => r.confidence === 'high').length
  const med = rows.filter(r => r.confidence === 'medium').length
  const low = rows.filter(r => r.confidence === 'low').length

  let md = `# Insight → Document koblingskandidater\n\n`
  md += `**Generert:** 2026-05-11 fra FTS ts_rank_cd mot Document.search_vector\n`
  md += `**Innsikter dekket:** ${insightCount}/102 unlinked\n`
  md += `**Kandidater totalt:** ${totalCandidates} (high: ${high} · medium: ${med} · low: ${low})\n\n`
  md += `## Hvordan reviewe\n\n`
  md += `1. Åpne CSV-en (\`insight-doc-link-candidates-2026-05-11.csv\`) i Numbers/Excel\n`
  md += `2. For hver rad: sett \`decision\` til \`y\` for godkjente koblinger, ellers la stå tom\n`
  md += `3. Kjør \`scripts/apply-insight-doc-links.sql\` for å sette inn de godkjente i \`InsightDocumentRef\`\n\n`
  md += `**Tommelfingerregel:**\n`
  md += `- **high (rank > 15):** sterk token-overlap. Sjekk likevel — kan være falsk-positiv hvis temaet er bredt\n`
  md += `- **medium (rank 8–15):** kreves manuell vurdering\n`
  md += `- **low (rank ≤ 8):** sannsynligvis ikke direkte sitérbar\n\n`
  md += `---\n\n`

  const sortedIds = [...byInsight.keys()].sort()
  for (const insightId of sortedIds) {
    const list = byInsight.get(insightId)!
    const insightTitle = list[0].insightTitle
    md += `### \`${insightId}\` ${insightTitle}\n\n`
    md += `| # | Confidence | Rank | Document |\n|---|---|---|---|\n`
    list.forEach((r, idx) => {
      const conf = r.confidence === 'high' ? '🟢 high' : r.confidence === 'medium' ? '🟡 med' : '⚪ low'
      md += `| ${idx + 1} | ${conf} | ${r.rank} | \`${r.docId}\` ${r.docTitle} |\n`
    })
    md += `\n`
  }

  writeFileSync(MD_PATH, md, 'utf-8')
  console.log(`Wrote ${MD_PATH}`)
  console.log(`  ${insightCount} insights × ~${(totalCandidates / insightCount).toFixed(1)} avg candidates each`)
}

main()
