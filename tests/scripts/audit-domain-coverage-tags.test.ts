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
})
