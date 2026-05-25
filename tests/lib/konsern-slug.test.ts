import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  KONSERN_REGISTRY,
  slugForOrgNr,
  orgNrForSlug,
  isKnownKonsernRoot,
} from '../../src/lib/queries/ownership'

describe('KONSERN_REGISTRY', () => {
  it('maps NorgesGruppen orgnr 819731322 → slug "norgesgruppen"', () => {
    assert.equal(slugForOrgNr('819731322'), 'norgesgruppen')
  })
  it('maps slug "reitan-retail" → orgnr 914526647', () => {
    assert.equal(orgNrForSlug('reitan-retail'), '914526647')
  })
  it('returns null for unknown orgnr', () => {
    assert.equal(slugForOrgNr('000000000'), null)
  })
  it('returns null for unknown slug', () => {
    assert.equal(orgNrForSlug('notreal'), null)
  })
  it('isKnownKonsernRoot true for NorgesGruppen', () => {
    assert.equal(isKnownKonsernRoot('819731322'), true)
  })
  it('has unique slugs', () => {
    const slugs = Object.values(KONSERN_REGISTRY).map(c => c.slug)
    assert.equal(slugs.length, new Set(slugs).size)
  })
  it('has unique orgNrs', () => {
    const orgNrs = Object.keys(KONSERN_REGISTRY)
    assert.equal(orgNrs.length, new Set(orgNrs).size)
  })
})
