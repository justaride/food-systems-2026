import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const guidePath = 'docs/project/status/food-tg-start-her-2026-06-15.md'

function readGuide() {
  assert.ok(existsSync(guidePath), `${guidePath} must exist`)
  return readFileSync(guidePath, 'utf8')
}

describe('Food TG Start her guide', () => {
  it('gives new TG readers the required source-backed reader path', () => {
    const guide = readGuide()

    const requiredPath = [
      'docs/meetings/MØTEOVERSIKT.md',
      'docs/project/mandates/food-transition-group-mandate-2026-04-21.md',
      'docs/project/mandates/food-tg-case-shortlist-addendum-2026-06-09.md',
      'docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md',
      'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
    ]

    for (const path of requiredPath) {
      assert.ok(existsSync(path), `${path} must remain present`)
      assert.ok(guide.includes(path), `${path} missing from Start her guide`)
    }

    assert.match(
      guide,
      /MØTEOVERSIKT[\s\S]+mandat[\s\S]+case-shortlist[\s\S]+sprintboard[\s\S]+citable-status/i,
      'guide must preserve the planned reader path order',
    )
  })

  it('keeps the status vocabulary, ownership, and stop rules visible', () => {
    const guide = readGuide()

    for (const term of [
      'citable_external',
      'internal_context',
      'blocked_unsourced',
      'needs-primary-check',
      'needs-actor-validation',
      'deckklart internt',
      'watchlist',
    ]) {
      assert.ok(guide.includes(term), `${term} missing from status glossary`)
    }

    for (const owner of ['JT', 'Einar', 'Thea', 'Cathrine', 'Gabriel']) {
      assert.match(guide, new RegExp(`\\b${owner}\\b`), `${owner} missing from ownership map`)
    }

    for (const stopRule of ['ikke ekstern outreach', 'claim-lock', 'operatorsekvens', 'PR #159']) {
      assert.ok(guide.includes(stopRule), `${stopRule} missing from stop rules`)
    }
  })
})
