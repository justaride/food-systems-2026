import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildBarekraftDocumentCitation } from '../../scripts/lib/barekraft-citations'

describe('barekraft import citations', () => {
  it('builds a structured citation for imported local analysis documents', () => {
    const citation = buildBarekraftDocumentCitation(
      {
        id: 'src-110',
        title: 'Regulering og matsvinn',
        author: 'Bærekraft Kartlegging Prosjekt',
        year: '2025',
        url: 'https://example.test/source',
      },
      'research/external/barekraft/SEC-MAT-01-Regulering-og-Matsvinn.md',
    )

    assert.deepEqual(citation, {
      sourceClass: 'synthesis',
      citationText: 'Bærekraft Kartlegging Prosjekt. (2025). Regulering og matsvinn.',
      accessedAt: '2026-05-18',
      url: 'https://example.test/source',
      localPath: 'research/external/barekraft/SEC-MAT-01-Regulering-og-Matsvinn.md',
      sourceDocId: 'src-110',
      captureMethod: 'script',
      confidence: 80,
    })
  })

  it('falls back to file and unknown-date citation text when source metadata is sparse', () => {
    const citation = buildBarekraftDocumentCitation(
      {
        id: 'src-122',
        title: null,
        author: null,
        year: null,
        url: null,
      },
      'research/external/circular-cities/SA-02-mat-og-biomasse.md',
    )

    assert.equal(citation.citationText, 'Bærekraft Kartlegging Prosjekt. (u.d.). SA-02-mat-og-biomasse.')
    assert.equal(citation.url, undefined)
    assert.equal(citation.sourceDocId, 'src-122')
  })
})
