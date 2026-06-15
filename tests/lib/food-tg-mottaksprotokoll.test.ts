import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const protocolPath = 'docs/project/mandates/food-tg-mottaksprotokoll-v1-2026-06-15.md'
const protocolFile = 'food-tg-mottaksprotokoll-v1-2026-06-15.md'

function readProtocol() {
  assert.ok(existsSync(protocolPath), `${protocolPath} must exist`)
  return readFileSync(protocolPath, 'utf8')
}

describe('Food TG mottaksprotokoll v1.0', () => {
  it('anchors the 10.06 research intake files in a single mandatory protocol', () => {
    const protocol = readProtocol()
    const readme = readFileSync('docs/project/mandates/README.md', 'utf8')
    const sourceShortlist = readFileSync('docs/project/mandates/source-shortlist-food-tg.md', 'utf8')

    for (const path of [
      'docs/project/mandates/food-tg-deep-research-prompt-pack-2026-06-10.md',
      'docs/project/mandates/food-tg-casekort-og-research-mottak-2026-06-10.md',
      'docs/project/mandates/food-tg-deep-research-results-intake-2026-06-10.md',
      'docs/project/mandates/food-tg-dokumentask-og-actor-ask-pack-2026-06-10.md',
      'docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md',
      'docs/project/mandates/source-shortlist-food-tg.md',
      'docs/project/mandates/primary-check-queue-food-tg-v0.1.md',
      'docs/project/mandates/food-tg-claim-lock-table-2026-05.md',
    ]) {
      assert.ok(existsSync(path), `${path} must remain present`)
      assert.ok(protocol.includes(path), `${path} missing from mottaksprotokoll`)
    }

    assert.ok(readme.includes(protocolFile), `${protocolFile} missing from mandates README`)
    assert.ok(sourceShortlist.includes(protocolPath), `${protocolPath} missing from source shortlist handoff`)
  })

  it('codifies mandatory rows, fields, status vocabulary, and stop rules', () => {
    const protocol = readProtocol()

    for (const term of [
      'DRO',
      'DRR',
      'DASK',
      'AASK',
      'eier',
      'dato',
      'status',
      'locator',
      'bruksrett',
      'claim-lock',
      'ingen kilde inn uten DRO/DRR-rad',
      'ikke ekstern outreach',
      'source-shortlist',
      'PCQ',
      'actor validation',
      'deckklart internt',
      'needs-primary-check',
      'needs-actor-validation',
      'watchlist',
      'parkert',
    ]) {
      assert.ok(protocol.includes(term), `${term} missing from protocol`)
    }

    assert.match(
      protocol,
      /DRO[\s\S]+DRR[\s\S]+DASK[\s\S]+AASK[\s\S]+PCQ[\s\S]+claim-lock/i,
      'protocol must preserve the intake order from raw research to claim-lock',
    )
  })
})
