// Build a prioritized worklist for link-rot mitigation across academic sources.
//
// For each Report/Thesis/SourceDoc URL, outputs a CSV row with the expected
// Wayback Machine URL so a human (or external script using wayback API access)
// can verify or trigger archival.
//
// Output: research/_status/link-rot-worklist-<date>.csv
//
// Usage: tsx scripts/build-link-rot-worklist.ts
//
// Sorted by domain so concentration risk is visible (one outage = many lost
// citations). Schema does not yet have archivedUrl on Report/Thesis — when
// that is added (see kritisk analyse anbefaling #2 + #6), this script can
// be extended to skip already-archived rows.

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { reports } from '@seeds/reports'
import { theses } from '@seeds/theses'
import { sources } from '@seeds/sources'

type Row = {
  type: 'Report' | 'Thesis' | 'SourceDoc'
  id: string
  title: string
  year: string
  url: string
  domain: string
  malformed: boolean
  waybackProbeUrl: string
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    // Some seeds store domain-only strings like "nibio.no" — try to
    // recover by prepending https:// and re-parsing.
    try {
      return new URL(`https://${url}`).hostname.replace(/^www\./, '')
    } catch {
      return '(invalid)'
    }
  }
}

function isMalformed(url: string): boolean {
  try {
    new URL(url)
    return false
  } catch {
    return true
  }
}

function buildWaybackProbe(url: string): string {
  return `https://web.archive.org/web/2026*/${url}`
}

function escapeCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

const rows: Row[] = []

for (const r of reports) {
  if (!r.sourceUrl) continue
  rows.push({
    type: 'Report',
    id: r.id,
    title: r.title,
    year: r.year != null ? String(r.year) : '',
    url: r.sourceUrl,
    domain: getDomain(r.sourceUrl),
    malformed: isMalformed(r.sourceUrl),
    waybackProbeUrl: buildWaybackProbe(r.sourceUrl),
  })
}

for (const t of theses) {
  if (!t.url) continue
  rows.push({
    type: 'Thesis',
    id: t.id,
    title: t.title,
    year: String(t.year),
    url: t.url,
    domain: getDomain(t.url),
    malformed: isMalformed(t.url),
    waybackProbeUrl: buildWaybackProbe(t.url),
  })
}

for (const s of sources) {
  if (!s.url) continue
  rows.push({
    type: 'SourceDoc',
    id: s.id,
    title: s.title ?? s.filename,
    year: s.year != null ? String(s.year) : '',
    url: s.url,
    domain: getDomain(s.url),
    malformed: isMalformed(s.url),
    waybackProbeUrl: buildWaybackProbe(s.url),
  })
}

const byDomain = new Map<string, number>()
for (const r of rows) {
  byDomain.set(r.domain, (byDomain.get(r.domain) ?? 0) + 1)
}

rows.sort((a, b) => {
  const dDiff = (byDomain.get(b.domain) ?? 0) - (byDomain.get(a.domain) ?? 0)
  if (dDiff !== 0) return dDiff
  if (a.domain !== b.domain) return a.domain.localeCompare(b.domain)
  return a.id.localeCompare(b.id)
})

const outDir = join(process.cwd(), 'research', '_status')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const date = new Date().toISOString().slice(0, 10)
const outPath = join(outDir, `link-rot-worklist-${date}.csv`)

const header = ['type', 'id', 'year', 'domain', 'malformed', 'url', 'wayback_probe', 'title'].join(',')
const body = rows
  .map(r =>
    [
      r.type,
      r.id,
      r.year,
      r.domain,
      r.malformed ? '1' : '0',
      escapeCsv(r.url),
      escapeCsv(r.waybackProbeUrl),
      escapeCsv(r.title),
    ].join(','),
  )
  .join('\n')

writeFileSync(outPath, header + '\n' + body + '\n', 'utf-8')

console.log(`Link-rot worklist written: ${outPath}`)
console.log(`Total URLs: ${rows.length}`)
const malformedCount = rows.filter(r => r.malformed).length
if (malformedCount > 0) {
  console.log(`Malformed URLs (need fixing in seed): ${malformedCount}`)
}
console.log('')
console.log('Top 10 domains by concentration risk:')
const top = [...byDomain.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
for (const [domain, count] of top) {
  console.log(`  ${count.toString().padStart(4)}  ${domain}`)
}
console.log('')
console.log('Next steps:')
console.log('  1. Visit the wayback_probe column URL for any row to see existing snapshots.')
console.log('  2. To create snapshots in bulk, use the public Wayback Save API:')
console.log('     curl -sS "https://web.archive.org/save/<URL>"')
console.log('  3. Once schema has archivedUrl on Report/Thesis, run a backfill script.')
