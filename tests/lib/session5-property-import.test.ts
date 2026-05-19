import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const importScript = readFileSync(
  new URL('../../scripts/import-session5-supply-chain.ts', import.meta.url),
  'utf8',
)

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function propertyRowFor(sourceLabel: string) {
  const match = importScript.match(
    new RegExp(`\\{[^\\n]*source:\\s*'${escapeRegExp(sourceLabel)}'[^\\n]*\\}`),
  )
  assert.ok(match, `Expected property row for ${sourceLabel}`)
  return match[0]
}

function propertyRowsForOrg(orgNr: string) {
  const matches = importScript.match(
    new RegExp(`\\{[^\\n]*companyOrgNr:\\s*'${escapeRegExp(orgNr)}'[^\\n]*\\}`, 'g'),
  )
  assert.ok(matches?.length, `Expected property rows for ${orgNr}`)
  return matches
}

describe('session 5 property import', () => {
  it('preserves non-Norwegian country codes for Nordic company properties', () => {
    assert.match(importScript, /country\?:\s*string/)
    assert.match(importScript, /country:\s*p\.country\s*\?\?\s*'NO'/)

    assert.match(propertyRowFor('icagruppen.se (Huvudkontor)'), /country:\s*'SE'/)
    assert.match(propertyRowFor('sallinggroup.com (Hovedkontor)'), /country:\s*'DK'/)
    assert.match(propertyRowFor('s-ryhma.fi (Pääkonttori)'), /country:\s*'FI'/)
    assert.match(propertyRowFor('hagar.is (Höfuðstöðvar)'), /country:\s*'IS'/)
  })

  it('keeps official subunit-backed property groups on Bronnoysund source locators', () => {
    for (const orgNr of ['936560288', '938752648', '947942638']) {
      for (const row of propertyRowsForOrg(orgNr)) {
        assert.match(row, /source:\s*'Brønnøysund underenheter'/)
      }
    }
  })

  it('keeps ASKO Oslofjord and Hedmark warehouse seeds aligned with official ASKO pages', () => {
    const oslofjord = propertyRowFor('asko.no (ASKO Oslofjord)')
    assert.match(oslofjord, /address:\s*'Hanekleiva 76'/)
    assert.match(oslofjord, /municipality:\s*'Holmestrand'/)
    assert.match(oslofjord, /county:\s*'Vestfold'/)

    const hedmark = propertyRowFor('asko.no (ASKO Hedmark)')
    assert.match(hedmark, /address:\s*'Skansvegen 5'/)
    assert.match(hedmark, /municipality:\s*'Ringsaker'/)
    assert.match(hedmark, /county:\s*'Innlandet'/)
  })
})
