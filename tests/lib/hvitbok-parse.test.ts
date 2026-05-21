import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { parseChapter } from '../../src/lib/hvitbok/parser'

describe('hvitbok token parser', () => {
  it('returns a single markdown segment when there are no tokens', () => {
    const segs = parseChapter('# Hei\n\nVanlig avsnitt.')
    assert.equal(segs.length, 1)
    assert.equal(segs[0].kind, 'markdown')
  })

  it('splits a block token onto its own segment', () => {
    const segs = parseChapter('Foran.\n\n{{nokkeltall:tall-1}}\n\nEtter.')
    assert.equal(segs.length, 3)
    assert.equal(segs[0].kind, 'markdown')
    assert.deepEqual(segs[1], {
      kind: 'token',
      tokenType: 'nokkeltall',
      tokenId: 'tall-1',
    })
    assert.equal(segs[2].kind, 'markdown')
  })

  it('treats a token inside a paragraph as literal text, not a token', () => {
    const segs = parseChapter('Se {{viz:graf-1}} her.')
    assert.equal(segs.length, 1)
    assert.equal(segs[0].kind, 'markdown')
  })

  it('parses consecutive block tokens', () => {
    const segs = parseChapter('{{callout:a}}\n\n{{relatert:b}}')
    assert.equal(segs.filter((s) => s.kind === 'token').length, 2)
  })

  it('returns an empty array for empty input', () => {
    assert.deepEqual(parseChapter(''), [])
  })
})
