import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  auditCitationCoverage,
  auditFieldCitation,
  auditSourceCitation,
  formatCitationAuditSummary,
} from '../../src/lib/citations/citation-audit'

describe('citation audit helpers', () => {
  it('blocks external-ready citations without direct locator or verified status', () => {
    const issues = auditSourceCitation({
      id: 'cit-1',
      citationText: 'Broken external citation',
      citationReadiness: 'citable_external',
      verificationStatus: 'needs_review',
    })

    assert.deepEqual(
      issues.map(issue => issue.code),
      ['missing_direct_locator', 'external_ready_not_verified'],
    )
    assert.equal(issues.every(issue => issue.severity === 'blocking'), true)
  })

  it('allows citable_with_note citations with a direct locator to remain non-blocking', () => {
    const issues = auditSourceCitation({
      id: 'cit-note',
      citationText: 'Secondary source with caveat',
      citationReadiness: 'citable_with_note',
      verificationStatus: 'needs_review',
      url: 'https://example.com/secondary-source',
    })

    assert.equal(issues.some(issue => issue.severity === 'blocking'), false)
  })

  it('treats legacy machine_verified and human_verified as verified for external citations', () => {
    for (const verificationStatus of ['machine_verified', 'human_verified']) {
      const issues = auditSourceCitation({
        id: `cit-${verificationStatus}`,
        citationText: 'Verified registry snapshot',
        citationReadiness: 'citable_external',
        verificationStatus,
        url: 'https://data.brreg.no/enhetsregisteret/api/enheter/819731322/roller',
      })

      assert.deepEqual(issues, [])
    }
  })

  it('flags missing local files for citations that cite local paths', () => {
    const issues = auditSourceCitation(
      {
        id: 'cit-2',
        citationText: 'Local file citation',
        citationReadiness: 'blocked_unsourced',
        verificationStatus: 'needs_review',
        localPath: 'research/missing.pdf',
      },
      { localPathExists: () => false },
    )

    assert.deepEqual(issues.map(issue => issue.code), ['missing_local_file'])
    assert.equal(issues[0].severity, 'warning')
  })

  it('blocks missing local files only when no other direct locator exists', () => {
    const withUrl = auditSourceCitation(
      {
        id: 'cit-url-and-missing-local',
        citationText: 'Registry snapshot with live API URL',
        citationReadiness: 'citable_external',
        verificationStatus: 'machine_verified',
        url: 'https://data.brreg.no/enhetsregisteret/api/enheter/819731322',
        localPath: 'research/evidence-pack/missing-snapshot.json',
      },
      { localPathExists: () => false },
    )

    assert.deepEqual(withUrl.map(issue => issue.code), ['missing_local_file'])
    assert.equal(withUrl[0].severity, 'warning')

    const localOnly = auditSourceCitation(
      {
        id: 'cit-missing-local-only',
        citationText: 'Local-only evidence',
        citationReadiness: 'citable_external',
        verificationStatus: 'verified',
        localPath: 'research/evidence-pack/missing-only.pdf',
      },
      { localPathExists: () => false },
    )

    assert.deepEqual(localOnly.map(issue => issue.code), ['missing_local_file'])
    assert.equal(localOnly[0].severity, 'blocking')
  })

  it('requires claim text for narrative and report field citations', () => {
    const issues = auditFieldCitation({
      id: 'field-1',
      citationId: 'cit-1',
      entityType: 'Report',
      entityId: 'report-1',
      fieldPath: 'keyFindings[0]',
      claimText: null,
    })

    assert.deepEqual(issues.map(issue => issue.code), ['missing_claim_text'])
  })

  it('summarizes citation readiness and external blockers', () => {
    const summary = auditCitationCoverage({
      sourceCitations: [
        {
          id: 'cit-1',
          citationText: 'Verified source',
          citationReadiness: 'citable_external',
          verificationStatus: 'verified',
          url: 'https://example.com/source.pdf',
          accessedAt: '2026-05-20T00:00:00.000Z',
        },
        {
          id: 'cit-2',
          citationText: 'Blocked label',
          citationReadiness: 'blocked_unsourced',
          verificationStatus: 'needs_review',
        },
      ],
      fieldCitations: [
        {
          id: 'field-1',
          citationId: 'cit-2',
          entityType: 'Report',
          entityId: 'report-1',
          fieldPath: 'keyFindings[0]',
          claimText: null,
        },
      ],
    })

    assert.equal(summary.sourceCitationTotal, 2)
    assert.equal(summary.readinessCounts.citable_external, 1)
    assert.equal(summary.readinessCounts.blocked_unsourced, 1)
    assert.equal(summary.fieldCitationTotal, 1)
    assert.equal(summary.externalBlockingIssues, 1)
    assert.match(formatCitationAuditSummary(summary), /Citation Coverage/)
    assert.match(formatCitationAuditSummary(summary), /External blocking issues:\s+1/)
  })
})
