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

function ownershipRowForChild(childOrgNr: string) {
  const match = importScript.match(
    new RegExp(`\\{[^\\n]*childOrgNr:\\s*'${escapeRegExp(childOrgNr)}'[^\\n]*\\}`),
  )
  assert.ok(match, `Expected ownership row for child ${childOrgNr}`)
  return match[0]
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

  it('keeps Reitan operating-company ownership on the direct REMA 1000 Norge parent with direct sources', () => {
    const remaDistribution = ownershipRowForChild('894759372')
    assert.match(remaDistribution, /parentOrgNr:\s*'982254604'/)
    assert.match(
      remaDistribution,
      /source:\s*'https:\/\/www\.rema\.no\/wordpress\/wp-content\/uploads\/2024\/06\/REMA-Distribusjon-AS-Redegjorelse-apenhetsloven-for-2023-28\.08\.2024\.pdf'/,
    )

    const norskKylling = ownershipRowForChild('980411133')
    assert.match(norskKylling, /parentOrgNr:\s*'982254604'/)
    assert.match(norskKylling, /source:\s*'https:\/\/www\.rema\.no\/egne-merkevarer\/norsk-kylling\/'/)
  })

  it('keeps Nordic head-office seeds aligned with current official contact pages', () => {
    const ica = propertyRowFor('icagruppen.se (Huvudkontor)')
    assert.match(ica, /address:\s*'Kolonnvägen 20'/)
    assert.match(ica, /municipality:\s*'Solna'/)

    const axfood = propertyRowFor('axfood.se (Huvudkontor)')
    assert.match(axfood, /address:\s*'Solnavägen 4'/)
    assert.match(axfood, /municipality:\s*'Stockholm'/)

    const kesko = propertyRowFor('kesko.fi (Pääkonttori)')
    assert.match(kesko, /address:\s*'Työpajankatu 12'/)
    assert.match(kesko, /municipality:\s*'Helsinki'/)

    const samkaup = propertyRowFor('samkaup.is (Höfuðstöðvar)')
    assert.match(samkaup, /address:\s*'Krossmóa 4'/)
    assert.match(samkaup, /municipality:\s*'Reykjanesbær'/)

    const reitan = propertyRowFor('reitanretail.no (Hovedkontor)')
    assert.match(reitan, /address:\s*'Gladengveien 2'/)
    assert.match(reitan, /municipality:\s*'Oslo'/)
  })
})
