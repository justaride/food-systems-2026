import assert from 'node:assert/strict'
import fs from 'node:fs'
import { describe, it } from 'node:test'
import projection from '../../src/lib/hvitbok/generated/whitepaper-chapters.json'
import {
  buildWhitepaperProjection,
  sha256,
  WHITEPAPER_SOURCE_PATH,
} from '../../src/lib/hvitbok/projection'

const source = fs.readFileSync(WHITEPAPER_SOURCE_PATH, 'utf8')

describe('generated whitepaper projection', () => {
  it('matches the exact canonical manuscript and its hash', () => {
    const rebuilt = buildWhitepaperProjection(source)
    assert.deepEqual(projection, rebuilt)
    assert.equal(projection.sourceHash, sha256(source))
    assert.equal(projection.sourceHash, 'a33e5ba24c0dc022c90a9eb7ea43a9646b7cab5ffe977e10e473cdc5cfebad1b')
  })

  it('contains the reader guide and all 15 chapters without changing content', () => {
    assert.equal(projection.chapters.length, 16)
    assert.equal(projection.chapters[0].number, '0')
    assert.equal(projection.chapters.at(-1)?.number, '15')
    for (const chapter of projection.chapters) {
      assert.equal(chapter.contentHash, sha256(chapter.body))
      const exactSourceSlice = source.split('\n').slice(chapter.startLine - 1, chapter.endLine).join('\n').trimEnd() + '\n'
      assert.equal(chapter.body, exactSourceSlice)
    }
  })

  it('retains the internal gate and never marks the projection externally ready', () => {
    assert.equal(projection.sourceStatus, 'intern-syntese-til-godkjenning')
    assert.equal(projection.externalReady, false)
    assert.match(projection.chapters[0].body, /ikke ekstern faktastemme/i)
    assert.match(projection.chapters.at(-1)?.body ?? '', /Godkjenningsside/)
  })
})
