import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  chapters,
  getChapterBySlug,
  getAdjacentChapters,
} from '../../src/lib/hvitbok/chapters'

describe('hvitbok chapter registry', () => {
  it('has unique, non-empty slugs', () => {
    const slugs = chapters.map((c) => c.slug)
    assert.equal(slugs.length, new Set(slugs).size)
    assert.ok(slugs.every((s) => s.length > 0))
  })

  it('resolves a chapter by slug', () => {
    const ch = getChapterBySlug('kort-til-jan-thomas')
    assert.ok(ch)
    assert.equal(ch?.title, 'Kort til Jan Thomas')
  })

  it('returns undefined for an unknown slug', () => {
    assert.equal(getChapterBySlug('finnes-ikke'), undefined)
  })

  it('returns adjacent chapters by reading order', () => {
    const first = chapters[0]
    const second = chapters[1]
    assert.equal(getAdjacentChapters(first.slug).prev, undefined)
    assert.equal(getAdjacentChapters(first.slug).next?.slug, second.slug)
    assert.equal(getAdjacentChapters(second.slug).prev?.slug, first.slug)
  })

  it('returns no next chapter for the last chapter', () => {
    const last = chapters[chapters.length - 1]
    assert.equal(getAdjacentChapters(last.slug).next, undefined)
  })
})
