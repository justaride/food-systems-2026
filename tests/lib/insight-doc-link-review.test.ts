import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveReviewDocumentId } from '../../src/lib/insight-doc-link-review'

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
})
