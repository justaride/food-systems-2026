import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { mapStructuredReport } from '../../src/lib/queries/reports'

function structuredReport(id: string, provenanceType: 'blocked_source' | 'composite_source') {
  return {
    id,
    title: `Report ${id}`,
    fullTitle: null,
    author: null,
    institution: null,
    date: null,
    year: 2026,
    sourceUrl: 'https://example.org/report.pdf',
    reportCategory: 'akademia',
    country: 'NO',
    keyFindings: ['Claim hidden by the row-level provenance ceiling'],
    recommendations: [],
    relevance: 'Regression fixture',
    tags: [],
    provenanceType,
    supportingSources: [],
    documentId: `document-${id}`,
    accessedAt: null,
    document: {
      slug: `document-${id}`,
      url: 'https://example.org/report.pdf',
      filePath: `/tmp/${id}.pdf`,
      summary: null,
      content: 'Document content',
      tags: [],
      sourceCitations: [
        {
          citationText: `Pre-existing citation for ${id}`,
          title: `Primary source for ${id}`,
          url: 'https://example.org/primary.pdf',
          localPath: null,
          pageRef: 'p. 7',
          accessedAt: new Date('2026-07-20T00:00:00.000Z'),
          verifiedAt: new Date('2026-07-20T00:00:00.000Z'),
          citationReadiness: 'citable_external',
          notes: null,
        },
      ],
    },
  }
}

describe('Report query provenance ceiling', () => {
  it('downgrades pre-existing Document SourceCitations before row-level external evaluation', () => {
    const blocked = mapStructuredReport(
      structuredReport('blocked-report', 'blocked_source') as never,
    )
    const composite = mapStructuredReport(
      structuredReport('composite-report', 'composite_source') as never,
    )

    assert.equal(blocked.citations[0]?.citationText, 'Pre-existing citation for blocked-report')
    assert.equal(blocked.citations[0]?.citationReadiness, 'blocked_unsourced')
    assert.equal(blocked.citationReadiness, 'blocked_unsourced')
    assert.equal(blocked.externalUseAllowed, false)
    assert.equal(blocked.externalUseReason, 'blocked_unsourced')

    assert.equal(composite.citations[0]?.citationText, 'Pre-existing citation for composite-report')
    assert.equal(composite.citations[0]?.citationReadiness, 'internal_context')
    assert.equal(composite.citationReadiness, 'internal_context')
    assert.equal(composite.externalUseAllowed, false)
    assert.equal(composite.externalUseReason, 'internal_context')
  })
})
