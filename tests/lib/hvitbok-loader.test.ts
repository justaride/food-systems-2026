import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readChapterMarkdown, countChapterWords } from '../../src/lib/hvitbok/loader'

describe('hvitbok markdown loader', () => {
  it('reads a chapter markdown file relative to project root', () => {
    const md = readChapterMarkdown('content/hvitbok/01-kort-til-jan-thomas.md')
    assert.ok(md.includes('Hvorfor dette notatet'))
  })

  it('counts words in a chapter', () => {
    const count = countChapterWords('content/hvitbok/01-kort-til-jan-thomas.md')
    assert.ok(count > 20)
  })

  it('throws for a missing file', () => {
    assert.throws(() => readChapterMarkdown('content/hvitbok/finnes-ikke.md'))
  })
})
