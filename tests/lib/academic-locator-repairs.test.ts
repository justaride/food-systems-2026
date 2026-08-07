import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  buildAcademicLocatorRepairs,
  classifyAcademicLocatorRepair,
  classifyAcademicLocatorRepairState,
} from '../../scripts/apply-academic-locator-repairs'
import { reports } from '../../prisma/seed-data/reports'
import { sources } from '../../prisma/seed-data/sources'

describe('verified academic locator repairs', () => {
  it('contains only the 32 reviewed, public locator replacements with verified access dates', () => {
    const repairs = buildAcademicLocatorRepairs()
    assert.equal(repairs.filter(repair => repair.kind === 'Report').length, 5)
    assert.equal(repairs.filter(repair => repair.kind === 'SourceDoc').length, 27)
    assert.equal(new Set(repairs.map(repair => `${repair.kind}:${repair.id}`)).size, 32)
    for (const repair of repairs) {
      const replacement = new URL(repair.replacement)
      assert.ok(['https:', 'http:'].includes(replacement.protocol))
      assert.equal(replacement.username, '')
      assert.equal(replacement.password, '')
      assert.notEqual(repair.expected, repair.replacement)
      assert.equal(repair.verifiedAccessDate, '2026-07-19')
    }
    const titleRepair = repairs.find(repair => repair.id === 'src-141')!
    assert.equal(titleRepair.expectedTitle, 'Konkurrensverket rapport 2025:5 - livsmedelsutredningen')
    assert.match(titleRepair.replacementTitle ?? '', /Utvärdering av lagen/)
    assert.equal(
      repairs.find(repair => repair.id === 'src-37')?.replacement,
      'https://menon.no/prosjekter/egne-merkevarer-emv-og-innovasjon-i-dagligvare',
    )
    assert.equal(
      repairs.find(repair => repair.id === 'src-88')?.replacement,
      'https://res.slu.se/id/publ/68633',
    )
    assert.equal(
      repairs.find(repair => repair.id === 'src-89')?.replacement,
      'https://res.slu.se/id/publ/128772',
    )
  })

  it('fails closed when mutable seed data drifts from the pinned repair contract', () => {
    const driftedReports = reports.map(report => report.id === 'konkurrensverket-summary-2024'
      ? { ...report, sourceUrl: 'https://source.invalid/unreviewed-replacement.pdf' }
      : report)
    assert.throws(
      () => buildAcademicLocatorRepairs(driftedReports, sources),
      /seed locator drifted from pinned Report repair contract/i,
    )
  })

  it('classifies exact expected, already-applied, and conflicting database states', () => {
    const repair = buildAcademicLocatorRepairs()[0]!
    assert.equal(classifyAcademicLocatorRepair(repair, repair.expected), 'pending')
    assert.equal(classifyAcademicLocatorRepair(repair, repair.replacement), 'applied')
    assert.equal(classifyAcademicLocatorRepair(repair, 'https://example.test/operator-change'), 'conflict')
    assert.equal(classifyAcademicLocatorRepair(repair, null), 'conflict')

    const migratedNhhRepair = buildAcademicLocatorRepairs().find(row => row.id === 'src-19')!
    assert.equal(
      classifyAcademicLocatorRepair(migratedNhhRepair, migratedNhhRepair.alternateExpected?.[0]),
      'pending',
    )

    assert.equal(
      classifyAcademicLocatorRepairState(repair, repair.replacement, null, null),
      'pending',
    )
    assert.equal(
      classifyAcademicLocatorRepairState(repair, repair.replacement, null, repair.verifiedAccessDate),
      'applied',
    )
    assert.equal(
      classifyAcademicLocatorRepairState(repair, repair.replacement, null, '2026-07-18'),
      'conflict',
    )
  })

  it('requires explicit acknowledgement and compare-and-swap updates', () => {
    const source = readFileSync('scripts/apply-academic-locator-repairs.ts', 'utf8')
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /sourceUrl: \{ in: \[repair\.expected, repair\.replacement\] \}/)
    assert.match(source, /in: \[repair\.expected, \.\.\.\(repair\.alternateExpected \?\? \[\]\), repair\.replacement\]/)
    assert.match(source, /title: \{ in: \[repair\.expectedTitle, repair\.replacementTitle\] \}/)
    assert.match(source, /OR: \[\{ accessedAt: null \}, \{ accessedAt: verifiedAccessDate \}\]/)
    assert.match(source, /accessedAt: verifiedAccessDate/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.doesNotMatch(source, /deleteMany|createMany/)
  })
})
