import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  findExactSourceDocLink,
  normalizeSourceDocumentPath,
} from '../../src/lib/source-document-link-matches'

describe('source document link matches', () => {
  it('normalizes research and project-relative paths consistently', () => {
    assert.equal(
      normalizeSourceDocumentPath('research/external/coffee-forest/research_review_eudr.md'),
      'external/coffee-forest/research_review_eudr.md'
    )
    assert.equal(
      normalizeSourceDocumentPath('./docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md'),
      'docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md'
    )
  })

  it('maps exact local source files to their SourceDoc rows', () => {
    assert.deepEqual(findExactSourceDocLink('external/coffee-forest/research_review_eudr.md'), {
      sourceDocId: 'src-102',
      reason: 'EUDR research review imported from the Coffee & Forest workspace',
    })

    assert.deepEqual(findExactSourceDocLink('external/circular-cities/SA-02-mat-og-biomasse.md'), {
      sourceDocId: 'src-123',
      reason: 'Circular Cities food and biomass sector analysis',
    })

    assert.deepEqual(findExactSourceDocLink('external/circular-cities/15-nordic-policy-landscape.md'), {
      sourceDocId: 'src-124',
      reason: 'Circular Cities Nordic policy landscape synthesis',
    })

    assert.deepEqual(findExactSourceDocLink('external/circular-cities/07-horizon-europe-call-analysis.md'), {
      sourceDocId: 'src-125',
      reason: 'Circular Cities Horizon Europe Cluster 6 call analysis',
    })

    assert.deepEqual(findExactSourceDocLink('external/circular-cities/19-nordic-added-value.md'), {
      sourceDocId: 'src-126',
      reason: 'Circular Cities Nordic added value and NCH portfolio synthesis',
    })

    assert.deepEqual(findExactSourceDocLink('evidence-pack/download-backlog-2026-04-20.csv'), {
      sourceDocId: 'src-153',
      reason: 'Food Research Process source download backlog for the 2026-04-20 research round',
    })

    assert.deepEqual(findExactSourceDocLink('docs/meetings/Strategisk ledergruppe Marked 16 mars 2026.md'), {
      sourceDocId: 'src-100',
      reason: 'Strategisk ledergruppe Marked meeting transcript',
    })
  })

  it('does not infer loose matches from derivative or summary files', () => {
    assert.equal(findExactSourceDocLink('rammeverk/sirkulaer-matsystem-rammeverk.md'), null)
    assert.equal(findExactSourceDocLink('bibliotek/akademia/nhh-food/frode-steen-profil.md'), null)
  })
})
