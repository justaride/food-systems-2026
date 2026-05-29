import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { auditCitableReportDocuments, auditCoverageClaims } from '../../src/lib/citations/report-claim-audit'
import type { CoverageProfile } from '../../src/lib/coverage/types'

function baseInput(overrides: Partial<Parameters<typeof auditCitableReportDocuments>[0]> = {}) {
  return {
    html: '',
    appendix: '',
    claimAudit: '',
    phase2: '',
    selfCritique: '',
    t3Diff: '',
    readme: '',
    ...overrides,
  }
}

describe('report claim audit', () => {
  it('flags contradictory T3 status text', () => {
    const issues = auditCitableReportDocuments(
      baseInput({
        html: '<p>T3 ekstern-vs-intern diff gjennomført i Phase 8.</p>',
        selfCritique: 'SK-3 · Ingen ekstern validering (T3) er gjort. T3 er deferred.',
        t3Diff: 'status: ferdig\n[x] T3 demonstrerer plattform-merverdi',
        readme: 'Phase 8: T3 ekstern-vs-intern diff | ✅',
      }),
    )

    assert.deepEqual(issues.map(issue => issue.code), ['t3_status_contradiction'])
  })

  it('flags highlighted numeric claims without citation or caveat', () => {
    const issues = auditCitableReportDocuments(
      baseInput({
        html: '<p><b>DK kan spore 6% av soyaimporten</b></p>',
      }),
    )

    assert.deepEqual(issues.map(issue => issue.code), ['highlighted_numeric_claim_without_support'])
  })

  it('passes resolved numeric claims when a source citation is present', () => {
    const issues = auditCitableReportDocuments(
      baseInput({
        html: '<p><b>DK kan spore 6% av sertifisert soyaimport</b> (Bosselmann et al., 2025, IFRO Documentation no. 1).</p>',
        appendix: 'Bosselmann, A. S. et al. (2025). IFRO Documentation no. 1. https://curis.ku.dk/ws/portalfiles/portal/471376644/IFRO_Documentation_2025_01.pdf',
        phase2: '6%-tallet bekreftet mot Bosselmann et al., 2025.',
      }),
    )

    assert.deepEqual(issues, [])
  })
})

function coverageProfile(overrides: Partial<CoverageProfile> = {}): CoverageProfile {
  return {
    datasetId: 'd1',
    label: 'D1',
    temporal: { kind: 'snapshot', year: 2025 },
    geographic: { countries: ['NO'], presentedAs: 'nordic', noAsNordicProxy: true },
    verification: { total: 100, humanVerified: 5, machineVerified: 90, needsReview: 5, humanVerifiedPct: 5, rollup: 'machine_grade' },
    computedAt: '2026-05-29T00:00:00.000Z',
    computedEnv: 'local',
    ...overrides,
  }
}

describe('auditCoverageClaims', () => {
  it('blocks geographic overclaim (nordic claim, NO-only data)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', geo: 'nordic' } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['geographic_overclaim'])
    assert.equal(issues[0].severity, 'blocking')
  })
  it('blocks temporal overclaim (trend claim, snapshot data)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', temporal: 'trend' } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['temporal_overclaim'])
  })
  it('blocks verification overclaim (verified claim, not human_grade)', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', verified: true } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues.map((i) => i.code), ['verification_overclaim'])
  })
  it('blocks when the datasetId has no profile (fail-closed)', () => {
    const issues = auditCoverageClaims([{ ref: 'kap/figur', assertedScope: { datasetId: 'ukjent', geo: 'nordic' } }], [])
    assert.deepEqual(issues.map((i) => i.code), ['coverage_profile_missing'])
  })
  it('passes a truthful weak claim', () => {
    const issues = auditCoverageClaims(
      [{ ref: 'kap/figur', assertedScope: { datasetId: 'd1', geo: 'no', temporal: 'point', verified: false } }],
      [coverageProfile()],
    )
    assert.deepEqual(issues, [])
  })
})
