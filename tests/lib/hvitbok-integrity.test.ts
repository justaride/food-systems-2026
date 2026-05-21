import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'
import { chapters } from '../../src/lib/hvitbok/chapters'
import { chapterEmbeds } from '../../src/lib/hvitbok/embeds'
import { parseChapter } from '../../src/lib/hvitbok/parser'
import { readChapterMarkdown } from '../../src/lib/hvitbok/loader'

const APP_DIR = path.join(process.cwd(), 'src/app')

function routeExists(href: string): boolean {
  const segment = href.replace(/^\//, '').split('/')[0]
  return fs.existsSync(path.join(APP_DIR, segment))
}

describe('hvitbok content integrity', () => {
  it('every chapter file exists on disk', () => {
    for (const ch of chapters) {
      assert.ok(
        fs.existsSync(path.join(process.cwd(), ch.filePath)),
        `missing file: ${ch.filePath}`,
      )
    }
  })

  it('every token in every chapter has a matching embed definition', () => {
    for (const ch of chapters) {
      const segs = parseChapter(readChapterMarkdown(ch.filePath))
      for (const seg of segs) {
        if (seg.kind !== 'token') continue
        const embed = chapterEmbeds[ch.slug]?.[seg.tokenId]
        assert.ok(
          embed,
          `${ch.slug}: token ${seg.tokenType}:${seg.tokenId} has no embed`,
        )
        assert.equal(
          embed.kind,
          seg.tokenType,
          `${ch.slug}: token ${seg.tokenId} kind mismatch`,
        )
      }
    }
  })

  it('every embed definition is referenced by a token', () => {
    for (const ch of chapters) {
      const used = new Set(
        parseChapter(readChapterMarkdown(ch.filePath))
          .filter((s) => s.kind === 'token')
          .map((s) => (s as { tokenId: string }).tokenId),
      )
      for (const tokenId of Object.keys(chapterEmbeds[ch.slug] ?? {})) {
        assert.ok(
          used.has(tokenId),
          `${ch.slug}: embed ${tokenId} is never referenced`,
        )
      }
    }
  })

  it('every viz and relatert href points to a real app route', () => {
    for (const embeds of Object.values(chapterEmbeds)) {
      for (const embed of Object.values(embeds)) {
        if (embed.kind === 'viz') {
          assert.ok(routeExists(embed.href), `dead route: ${embed.href}`)
        }
        if (embed.kind === 'relatert') {
          for (const l of embed.lenker) {
            assert.ok(routeExists(l.href), `dead route: ${l.href}`)
          }
        }
      }
    }
  })
})
