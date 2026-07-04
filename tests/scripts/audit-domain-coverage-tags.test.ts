import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { countActorDomainCells } from '../../scripts/lib/domain-coverage'

describe('domain coverage tag counting', () => {
  it('counts an actor in every tagged subdomain for the same domain', () => {
    const counts = countActorDomainCells([
      {
        metadata: { geo: 'NO' },
        country: 'NO',
        themeTags: [
          'domene:matsvinn-sirkulaer',
          'subdomene:paraply-nettverk',
          'subdomene:matredistribusjon',
        ],
      },
    ])

    assert.equal(counts.get('matsvinn-sirkulaer|paraply-nettverk|NO'), 1)
    assert.equal(counts.get('matsvinn-sirkulaer|matredistribusjon|NO'), 1)
  })

  it('uses exact domain registration geo for enriched global actors', () => {
    const counts = countActorDomainCells([
      {
        metadata: {
          domainRegistrations: [
            {
              domain: 'horeca-offentlig',
              subdomain: 'offentlig-innkjop-kantine',
              geo: 'NO',
              dataset: 'mvk-offentlig-innkjop-kantine-2026-07-01',
            },
          ],
        },
        country: 'UK',
        themeTags: [
          'domene:horeca-offentlig',
          'subdomene:offentlig-innkjop-kantine',
          'mvk-offentlig-innkjop-kantine-2026-07-01',
        ],
      },
    ])

    assert.equal(counts.get('horeca-offentlig|offentlig-innkjop-kantine|NO'), 1)
    assert.equal(counts.get('horeca-offentlig|offentlig-innkjop-kantine|UK'), undefined)
  })
})
