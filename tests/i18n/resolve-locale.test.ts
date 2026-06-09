import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveLocale, LOCALES, DEFAULT_LOCALE } from '../../src/i18n/resolve-locale'

describe('resolveLocale', () => {
  it('returns the value when it is a supported locale', () => {
    assert.equal(resolveLocale('en'), 'en')
    assert.equal(resolveLocale('no'), 'no')
  })
  it('falls back to the default for missing/unknown values', () => {
    assert.equal(resolveLocale(undefined), DEFAULT_LOCALE)
    assert.equal(resolveLocale('de'), DEFAULT_LOCALE)
    assert.equal(resolveLocale(''), DEFAULT_LOCALE)
  })
  it('exposes the supported set with no as default', () => {
    assert.deepEqual([...LOCALES].sort(), ['en', 'no'])
    assert.equal(DEFAULT_LOCALE, 'no')
  })
})
