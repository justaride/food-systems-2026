// Worklist of Report seed rows missing author attribution.
//
// Output: research/_status/report-author-backfill-<date>.csv
//
// Each row needs an author filled in. Sorted by institution to make batch
// review easier (same publisher tends to use same author roles).
//
// See critical analysis QW3 in docs/superpowers/specs/2026-05-26-kritisk-analyse-db-kildef-validering.md

import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { reports } from '@seeds/reports'

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim().length > 0
  return true
}

function escapeCsv(v: string): string {
  if (v.includes(',') || v.includes('"') || v.includes('\n')) {
    return `"${v.replace(/"/g, '""')}"`
  }
  return v
}

const missing = reports.filter(r => !hasValue(r.author))

missing.sort((a, b) => {
  const inst = (a.institution ?? '').localeCompare(b.institution ?? '')
  if (inst !== 0) return inst
  return (b.year ?? 0) - (a.year ?? 0)
})

const outDir = join(process.cwd(), 'research', '_status')
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })
const date = new Date().toISOString().slice(0, 10)
const outPath = join(outDir, `report-author-backfill-${date}.csv`)

const header = ['id', 'institution', 'year', 'title', 'sourceUrl'].join(',')
const body = missing
  .map(r =>
    [
      r.id,
      escapeCsv(r.institution ?? ''),
      r.year ?? '',
      escapeCsv(r.title),
      escapeCsv(r.sourceUrl ?? ''),
    ].join(','),
  )
  .join('\n')

writeFileSync(outPath, header + '\n' + body + '\n', 'utf-8')

console.log(`Report-author backfill worklist written: ${outPath}`)
console.log(`Total rows needing author: ${missing.length} / ${reports.length}`)
console.log('')

const byInstitution = new Map<string, number>()
for (const r of missing) {
  const k = r.institution ?? '(no institution)'
  byInstitution.set(k, (byInstitution.get(k) ?? 0) + 1)
}
console.log('Top 10 institutions with missing authors:')
const top = [...byInstitution.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10)
for (const [inst, count] of top) {
  console.log(`  ${count.toString().padStart(3)}  ${inst}`)
}
