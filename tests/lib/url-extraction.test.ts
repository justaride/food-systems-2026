import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { extractFirstHttpUrl } from '../../src/lib/url-extraction'

describe('URL extraction helpers', () => {
  it('keeps DOI parentheses that are part of the URL', () => {
    const text = '**DOI:** https://doi.org/10.1016/S2542-5196(24)00050-5'

    assert.equal(
      extractFirstHttpUrl(text),
      'https://doi.org/10.1016/S2542-5196(24)00050-5',
    )
  })

  it('strips punctuation used to separate multiple source URLs', () => {
    const text = '**Kilde:** https://www.oslomet.no/om/sifo, https://example.org/next'

    assert.equal(extractFirstHttpUrl(text), 'https://www.oslomet.no/om/sifo')
  })

  it('strips markdown closing punctuation without damaging balanced DOI parentheses', () => {
    const text = '[article](https://doi.org/10.1016/S2542-5196(24)00050-5)'

    assert.equal(
      extractFirstHttpUrl(text),
      'https://doi.org/10.1016/S2542-5196(24)00050-5',
    )
  })
})
