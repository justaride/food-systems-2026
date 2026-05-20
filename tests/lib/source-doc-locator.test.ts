import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { hasSourceDocLocator } from '../../src/lib/source-doc-locator'

describe('SourceDoc locator coverage', () => {
  it('treats public URLs and DOI values as resolved SourceDoc locators', () => {
    assert.equal(hasSourceDocLocator({ url: 'https://example.org/report.pdf' }), true)
    assert.equal(hasSourceDocLocator({ doi: '10.1234/example.report' }), true)
  })

  it('treats linked documents and local files as resolved SourceDoc locators', () => {
    assert.equal(hasSourceDocLocator({ documentId: 'doc-1' }), true)
    assert.equal(hasSourceDocLocator({ hasLocalFile: true }), true)
  })

  it('requires at least one locator signal', () => {
    assert.equal(hasSourceDocLocator({ filename: 'missing.pdf' }), false)
  })
})
