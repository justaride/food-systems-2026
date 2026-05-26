// Audit academic-source metadata coverage in seed data.
//
// Reports per-field coverage for Report, Thesis, SourceDoc — the three
// academic-citable seed sets. Exits non-zero if any field falls below its
// threshold (configurable below). Default thresholds are set at current
// coverage so the audit acts as a regression gate, not an upgrade gate.
//
// Tighten thresholds over time to drive improvement.

import { reports } from '@seeds/reports'
import { theses } from '@seeds/theses'
import { sources } from '@seeds/sources'

type Threshold = {
  /** Minimum % required for the audit to pass. */
  min: number
  /** Stated target for the next milestone. */
  target: number
}

type FieldCheck<T> = {
  label: string
  getter: (row: T) => unknown
  thresholds: Threshold
}

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim().length > 0
  return true
}

function audit<T>(
  setLabel: string,
  rows: readonly T[],
  checks: ReadonlyArray<FieldCheck<T>>,
): { failures: number; lines: string[] } {
  const total = rows.length
  const lines: string[] = []
  let failures = 0

  lines.push(`\n── ${setLabel} (n=${total}) ─────────────────────────────`)

  for (const { label, getter, thresholds } of checks) {
    const present = rows.filter(r => hasValue(getter(r))).length
    const pct = total === 0 ? 0 : (present / total) * 100
    const status = pct >= thresholds.min ? '✅' : '❌'
    if (pct < thresholds.min) failures++
    const targetSuffix =
      pct >= thresholds.target
        ? ' (≥ target)'
        : ` (target ${thresholds.target}%)`
    lines.push(
      `  ${status} ${label.padEnd(16)} ${present}/${total} (${pct.toFixed(0)}%) — min ${thresholds.min}%${targetSuffix}`,
    )
  }

  return { failures, lines }
}

const reportChecks: ReadonlyArray<FieldCheck<typeof reports[number]>> = [
  { label: 'year',          getter: r => r.year,                              thresholds: { min: 100, target: 100 } },
  { label: 'institution',   getter: r => r.institution,                       thresholds: { min: 100, target: 100 } },
  { label: 'attribution*',  getter: r => r.author || r.institution,           thresholds: { min: 100, target: 100 } },
  { label: 'sourceUrl',     getter: r => r.sourceUrl,                         thresholds: { min: 90,  target: 100 } },
  { label: 'author',        getter: r => r.author,                            thresholds: { min: 22,  target: 80  } },
  { label: 'doi',           getter: r => r.doi,                               thresholds: { min: 15,  target: 50  } },
]
// * attribution = effective attribution: named author OR institutional/corporate
//   authorship (institution). Policy/government reports are correctly attributed
//   to their issuing body even without a named individual author.

const thesisChecks: ReadonlyArray<FieldCheck<typeof theses[number]>> = [
  { label: 'year',        getter: t => t.year,        thresholds: { min: 100, target: 100 } },
  { label: 'method',      getter: t => t.method,      thresholds: { min: 100, target: 100 } },
  { label: 'url',         getter: t => t.url,         thresholds: { min: 100, target: 100 } },
  { label: 'doi',         getter: t => t.doi,         thresholds: { min: 45,  target: 90  } },
  { label: 'accessDate',  getter: t => t.accessDate,  thresholds: { min: 0,   target: 100 } },
]

const sourceDocChecks: ReadonlyArray<FieldCheck<typeof sources[number]>> = [
  { label: 'year',        getter: s => s.year,        thresholds: { min: 93,  target: 100 } },
  { label: 'author',      getter: s => s.author,      thresholds: { min: 90,  target: 100 } },
  { label: 'url',         getter: s => s.url,         thresholds: { min: 55,  target: 95  } },
  { label: 'doi',         getter: s => s.doi,         thresholds: { min: 3,   target: 40  } },
  { label: 'accessedAt',  getter: s => s.accessedAt,  thresholds: { min: 0,   target: 50  } },
  { label: 'archivedUrl', getter: s => s.archivedUrl, thresholds: { min: 0,   target: 50  } },
]

console.log('Academic source-quality audit')
console.log('Seed data: prisma/seed-data/{reports,theses,sources}.ts')

const reportResult = audit('Report', reports, reportChecks)
const thesisResult = audit('Thesis', theses, thesisChecks)
const sourceDocResult = audit('SourceDoc', sources, sourceDocChecks)

for (const line of [...reportResult.lines, ...thesisResult.lines, ...sourceDocResult.lines]) {
  console.log(line)
}

const totalFailures =
  reportResult.failures + thesisResult.failures + sourceDocResult.failures

console.log('')
if (totalFailures > 0) {
  console.log(`❌ ${totalFailures} field(s) below minimum threshold.`)
  console.log('   To raise a threshold, edit scripts/audit-academic-source-quality.ts.')
  console.log('   To improve coverage, fill in missing metadata in prisma/seed-data/.')
  process.exit(1)
}

console.log('✅ All academic-source metadata fields meet their minimum thresholds.')
console.log('   Targets are stated alongside each line — close the gap to improve standing.')
