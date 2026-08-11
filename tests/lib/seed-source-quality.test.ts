import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
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

function isValidAbsoluteHttpUrl(value: unknown): boolean {
  if (typeof value !== 'string' || value.trim().length === 0) return false
  try {
    const url = new URL(value.trim())
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.hostname.length > 0
  } catch {
    return false
  }
}

function isValidDoiSyntax(value: unknown): boolean {
  return typeof value === 'string' &&
    /^(?:doi:\s*|https?:\/\/(?:dx\.)?doi\.org\/)?10\.\d{4,9}\/\S+$/i.test(value.trim())
}

function isRecognizedRepositoryIdentifier(value: unknown): boolean {
  if (typeof value !== 'string') return false
  const normalized = value.trim()
  return /^hdl:\S+\/\S+$/i.test(normalized) ||
    /^diva2:\d+$/i.test(normalized) ||
    /^slu:\d+$/i.test(normalized) ||
    /^urn:[^\s:]+:.+$/i.test(normalized)
}

function isRecognizedPersistentIdentifier(value: unknown): boolean {
  return isValidDoiSyntax(value) || isRecognizedRepositoryIdentifier(value)
}

function hasSourceDocLocator(source: typeof sources[number]): boolean {
  return isValidAbsoluteHttpUrl(source.url) || existsSync(join(process.cwd(), source.filename))
}

const REVIEWED_INSTITUTION_AUTHORED_REPORT_IDS = new Set([
  'konkurrensverket-etablering-2026',
])

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

    it('valid absolute http(s) sourceUrl coverage stays at ≥ 90%', () => {
      assert.ok(pct(reports, r => isValidAbsoluteHttpUrl(r.sourceUrl) ? r.sourceUrl : null) >= 90)
    })

    it('author coverage does not regress below 22%', () => {
      assert.ok(pct(reports, r => r.author) >= 22)
    })

    it('keeps the reviewed Konkurrensverket report as explicit institutional authorship', () => {
      const report = reports.find(row => row.id === 'konkurrensverket-etablering-2026')
      assert.ok(report)
      assert.equal(report.institution, 'Konkurrensverket')
      assert.equal(hasValue(report.author), false)
      assert.ok(report.supportingSources?.some(source => (
        source.note?.includes('Cecilia Maxe-Aglinder is listed as contact, not author.')
      )))
    })

    it('count of Reports missing author does not increase beyond 100', () => {
      // Hard cap. Any new Report seed entry without author bumps this to 101
      // and breaks the build. To increase the cap, you must first reduce the
      // missing-author backlog using scripts/build-report-author-backfill-worklist.ts
      // — and then tighten this number, not loosen it.
      const missing = reports.filter(r => (
        !hasValue(r.author) && !REVIEWED_INSTITUTION_AUTHORED_REPORT_IDS.has(r.id)
      )).length
      assert.ok(
        missing <= 100,
        `Found ${missing} unreviewed Reports without author (cap = 100). New Report seed entries must include author.`,
      )
    })

    it('valid DOI syntax coverage does not regress below 15%', () => {
      assert.ok(pct(reports, r => isValidDoiSyntax(r.doi) ? r.doi : null) >= 15)
    })
  })

  describe('Thesis seed', () => {
    it('year/method/valid absolute URL coverage stays at 100%', () => {
      assert.ok(pct(theses, t => t.year) >= 100)
      assert.ok(pct(theses, t => t.method) >= 100)
      assert.ok(pct(theses, t => isValidAbsoluteHttpUrl(t.url) ? t.url : null) >= 100)
    })

    it('recognized persistent-identifier coverage does not regress below 45%', () => {
      assert.ok(pct(theses, t => isRecognizedPersistentIdentifier(t.doi) ? t.doi : null) >= 45)
    })

    it('does not label repository identifiers as DOI syntax and retains the reviewed real DOI', () => {
      const repositoryIdentifiers = theses.filter(t => isRecognizedRepositoryIdentifier(t.doi))
      assert.equal(repositoryIdentifiers.length, 36)
      assert.equal(repositoryIdentifiers.filter(t => isValidDoiSyntax(t.doi)).length, 0)

      assert.deepEqual(
        theses.filter(t => isValidDoiSyntax(t.doi)).map(t => ({ id: t.id, doi: t.doi })),
        [{ id: 'slu-house-crickets-2025', doi: '10.54612/a.7ersgt4v2k' }],
      )
      assert.equal(theses.filter(t => isRecognizedPersistentIdentifier(t.doi)).length, 37)
    })
  })

  describe('SourceDoc seed', () => {
    it('year coverage stays at ≥ 93%', () => {
      assert.ok(pct(sources, s => s.year) >= 93)
    })

    it('author coverage stays at ≥ 90%', () => {
      assert.ok(pct(sources, s => s.author) >= 90)
    })

    it('valid absolute http(s) URL coverage stays at ≥ 44%', () => {
      assert.ok(pct(sources, source => isValidAbsoluteHttpUrl(source.url) ? source.url : null) >= 44)
    })

    it('valid absolute URL or local-file locator coverage stays at ≥ 50%', () => {
      assert.ok(pct(sources, source => hasSourceDocLocator(source) ? 'locator' : null) >= 50)
    })

    it('retains the verified permanent SLU work locators and exact bibliographic identity', () => {
      const eriksson = sources.find(source => source.id === 'src-88')
      const sundin = sources.find(source => source.id === 'src-89')

      assert.equal(eriksson?.url, 'https://res.slu.se/id/publ/68633')
      assert.equal(eriksson?.author, 'Mattias Eriksson')
      assert.match(eriksson?.title ?? '', /reduced waste for reduced carbon footprint$/)
      assert.equal(sundin?.url, 'https://res.slu.se/id/publ/128772')
      assert.equal(sundin?.author, 'Niina Sundin')
      assert.match(sundin?.title ?? '', /through food consumption$/)
      assert.equal(eriksson?.publisher, 'Swedish University of Agricultural Sciences')
      assert.equal(sundin?.publisher, 'Swedish University of Agricultural Sciences')
      assert.equal(eriksson?.provenanceType, 'external_publication')
      assert.equal(sundin?.provenanceType, 'external_publication')
      assert.equal(eriksson?.accessedAt, '2026-07-19')
      assert.equal(sundin?.accessedAt, '2026-07-19')
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
