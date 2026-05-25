import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { COUNTRY_LIST } from '../../src/lib/config/countries'
import { mediaEntries } from '../../prisma/seed-data/media-corpus'
import { mediaCountryMatches } from '../../src/lib/media-country'

describe('media country helpers', () => {
  it('maps uppercase media corpus ISO codes onto lowercase app country codes', () => {
    const countriesWithEntries = COUNTRY_LIST
      .filter(country => mediaEntries.some(entry => mediaCountryMatches(entry.country, country.code)))
      .map(country => country.code)

    assert.deepEqual(countriesWithEntries, ['no', 'se', 'dk', 'fi', 'is'])
  })
})
