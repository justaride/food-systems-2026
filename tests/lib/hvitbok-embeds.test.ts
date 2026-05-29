import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getEmbed,
  EMBEDDABLE_CHARTS,
  collectAssertedScopesFrom,
  type EmbedDefinition,
} from '../../src/lib/hvitbok/embeds'

describe('hvitbok embed registry', () => {
  it('resolves a key-figure embed', () => {
    const e = getEmbed('kort-til-jan-thomas', 'oeko-melk-anvendelse')
    assert.equal(e?.kind, 'nokkeltall')
  })

  it('resolves a callout embed', () => {
    const e = getEmbed('kort-til-jan-thomas', 'landbruksdir-sitat')
    assert.equal(e?.kind, 'callout')
  })

  it('returns undefined for an unknown embed', () => {
    assert.equal(getEmbed('kort-til-jan-thomas', 'finnes-ikke'), undefined)
  })

  it('whitelists the zipf chart as embeddable', () => {
    assert.ok(EMBEDDABLE_CHARTS.has('zipf-distribution'))
  })
})

const fixture: Record<string, Record<string, EmbedDefinition>> = {
  kap1: {
    tall1: { kind: 'nokkeltall', label: 'X', value: '5', kilde: 'k', assertedScope: { datasetId: 'd1', geo: 'nordic' } },
    callout1: { kind: 'callout', variant: 'info', tekst: 'no scope' },
    viz1: { kind: 'viz', href: '/x', label: 'V', description: 'd', assertedScope: { datasetId: 'd2', temporal: 'trend' } },
  },
}

describe('collectAssertedScopesFrom', () => {
  it('flattens only embeds that declare assertedScope', () => {
    const claims = collectAssertedScopesFrom(fixture)
    assert.deepEqual(claims, [
      { ref: 'kap1/tall1', assertedScope: { datasetId: 'd1', geo: 'nordic' } },
      { ref: 'kap1/viz1', assertedScope: { datasetId: 'd2', temporal: 'trend' } },
    ])
  })
})
