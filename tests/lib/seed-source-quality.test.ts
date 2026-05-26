import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { theses } from '../../prisma/seed-data/theses'
import { sources } from '../../prisma/seed-data/sources'

function hasValue(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === 'string') return v.trim().length > 0
  return true
}

function pct<T>(rows: readonly T[], getter: (r: T) => unknown): number {
  const present = rows.filter(r => hasValue(getter(r))).length
  return rows.length === 0 ? 0 : (present / rows.length) * 100
}

// Baseline thresholds reflect the current state (2026-05-26). Tighten over time;
// the audit-academic-source-quality.ts script lists targets as the next milestone.

describe('academic source metadata coverage', () => {
  describe('Report seed', () => {
    it('year coverage stays at 100%', () => {
      assert.ok(pct(reports, r => r.year) >= 100, 'Every Report must have year')
    })

    it('institution coverage stays at 100%', () => {
      assert.ok(
        pct(reports, r => r.institution) >= 100,
        'Every Report must have institution (corporate authorship). For reports without a publishing body, use "Food Systems 2026 (intern syntese)" or similar.',
      )
    })

    it('effective attribution (author OR institution) is 100%', () => {
      const total = reports.length
      const attributed = reports.filter(r => hasValue(r.author) || hasValue(r.institution)).length
      assert.equal(
        attributed,
        total,
        `${total - attributed} Reports have neither author nor institution. Add at minimum an institution.`,
      )
    })

    it('sourceUrl coverage stays at ≥ 90%', () => {
      assert.ok(pct(reports, r => r.sourceUrl) >= 90)
    })

    it('author coverage does not regress below 22%', () => {
      assert.ok(pct(reports, r => r.author) >= 22)
    })

    it('count of Reports missing author does not increase beyond 100', () => {
      // Hard cap. Any new Report seed entry without author bumps this to 101
      // and breaks the build. To increase the cap, you must first reduce the
      // missing-author backlog using scripts/build-report-author-backfill-worklist.ts
      // — and then tighten this number, not loosen it.
      const missing = reports.filter(r => !hasValue(r.author)).length
      assert.ok(
        missing <= 100,
        `Found ${missing} Reports without author (cap = 100). New Report seed entries must include author.`,
      )
    })

    it('doi coverage does not regress below 15%', () => {
      assert.ok(pct(reports, r => r.doi) >= 15)
    })
  })

  describe('Thesis seed', () => {
    it('year/method/url coverage stays at 100%', () => {
      assert.ok(pct(theses, t => t.year) >= 100)
      assert.ok(pct(theses, t => t.method) >= 100)
      assert.ok(pct(theses, t => t.url) >= 100)
    })

    it('doi coverage does not regress below 45%', () => {
      assert.ok(pct(theses, t => t.doi) >= 45)
    })
  })

  describe('SourceDoc seed', () => {
    it('year coverage stays at ≥ 93%', () => {
      assert.ok(pct(sources, s => s.year) >= 93)
    })

    it('author coverage stays at ≥ 90%', () => {
      assert.ok(pct(sources, s => s.author) >= 90)
    })

    it('url coverage stays at ≥ 55%', () => {
      assert.ok(pct(sources, s => s.url) >= 55)
    })

    it('accessedAt and archivedUrl fields are accepted on the type', () => {
      // Smoke-test that the new fields exist on the TS type and are accepted
      // by the seed shape. Coverage is 0% today, but the field is now usable —
      // future entries can include it. Audit script tracks the gap toward
      // target=50%.
      const example: typeof sources[number] = {
        ...sources[0],
        accessedAt: '2026-05-26',
        archivedUrl: 'https://web.archive.org/web/2026/https://example.no',
      }
      assert.equal(example.accessedAt, '2026-05-26')
      assert.ok(example.archivedUrl?.startsWith('https://web.archive.org/'))
    })
  })
})
