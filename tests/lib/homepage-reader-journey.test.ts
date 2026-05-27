import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const pageSource = readFileSync(new URL('../../src/app/page.tsx', import.meta.url), 'utf8')

describe('homepage reader journey', () => {
  it('exposes the four required first-screen reader entries with existing routes', () => {
    const requiredEntries = [
      { label: 'Forstå prosjektet', href: '/mandat' },
      { label: 'Se hovedfunn', href: '/innsikt' },
      { label: 'Kontroller kilder', href: '/bibliotek' },
      { label: 'Forbered whitepaper', href: '/hvitbok' },
    ]

    for (const entry of requiredEntries) {
      assert.match(
        pageSource,
        new RegExp(`(?:href="${entry.href}"|href: '${entry.href}')`),
        `${entry.label} must link to ${entry.href}`,
      )
      assert.ok(pageSource.includes(entry.label), `Missing reader entry: ${entry.label}`)
    }
  })

  it('keeps homepage reader copy status-aware without external validation lift', () => {
    assert.match(pageSource, /med forbehold|intern|ingen Food TG-claims er eksternt validert/i)
    assert.doesNotMatch(pageSource, /validert eksternt|pilotklar/i)
  })
})
