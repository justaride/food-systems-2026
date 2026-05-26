import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  filterNewInsightDocumentRefs,
  resolveReviewDocumentId,
} from '../../src/lib/insight-doc-link-review'

describe('insight doc link review helpers', () => {
  it('keeps the reviewed document id when it exists in the current DB', () => {
    const resolved = resolveReviewDocumentId(
      { docId: 'current-doc', docTitle: 'Matsvinn og sirkulær økonomi' },
      [{ id: 'current-doc', title: 'Different title' }],
    )

    assert.equal(resolved, 'current-doc')
  })

  it('remaps stale reviewed document ids by exact title when the match is unique', () => {
    const resolved = resolveReviewDocumentId(
      { docId: 'stale-doc', docTitle: 'Matsvinn og sirkulær økonomi' },
      [{ id: 'current-doc', title: 'Matsvinn og sirkulaer okonomi' }],
    )

    assert.equal(resolved, 'current-doc')
  })

  it('does not remap stale document ids when the title match is ambiguous', () => {
    const resolved = resolveReviewDocumentId(
      { docId: 'stale-doc', docTitle: 'Markedskonsentrasjon i Skandinavia' },
      [
        { id: 'doc-1', title: 'Markedskonsentrasjon i Skandinavia' },
        { id: 'doc-2', title: 'Markedskonsentrasjon i Skandinavia' },
      ],
    )

    assert.equal(resolved, null)
  })

  it('remaps reviewed report ids to their linked document when title matches uniquely', () => {
    const resolved = resolveReviewDocumentId(
      { docId: 'stale-report-id', docTitle: 'Dagligvaretilsynet — Årsrapport 2022' },
      [],
      [{ id: 'current-report-id', title: 'Dagligvaretilsynet — Årsrapport 2022', documentId: 'linked-document-id' }],
    )

    assert.equal(resolved, 'linked-document-id')
  })

  it('filters already-existing insight document refs before dry-run accounting', () => {
    const planned = [
      { insightId: 'ins-95', documentId: 'doc-reitan' },
      { insightId: 'ins-96', documentId: 'doc-dagligvaretilsynet' },
      { insightId: 'ins-96', documentId: 'doc-dagligvaretilsynet' },
    ]

    assert.deepEqual(
      filterNewInsightDocumentRefs(planned, [{ insightId: 'ins-95', documentId: 'doc-reitan' }]),
      [{ insightId: 'ins-96', documentId: 'doc-dagligvaretilsynet' }],
    )
  })
})
