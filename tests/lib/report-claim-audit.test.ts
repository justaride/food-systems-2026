import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { auditCitableReportDocuments } from '../../src/lib/citations/report-claim-audit'

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
