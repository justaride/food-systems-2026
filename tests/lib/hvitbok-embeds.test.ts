import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  getEmbed,
  EMBEDDABLE_CHARTS,
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
