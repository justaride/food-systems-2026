import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { actorsSeed } from '../../prisma/seed-data/actors'

// Brønnøysund organisasjonsnummer carry a mod-11 check digit. A number that
// fails it cannot exist, so import-actors would silently leave the actor
// without its Company link.
function hasValidCheckDigit(orgNr: string): boolean {
  const weights = [3, 2, 7, 6, 5, 4, 3, 2]
  const digits = [...orgNr].map(Number)
  const sum = weights.reduce((total, weight, index) => total + weight * digits[index], 0)
  const remainder = sum % 11
  const checkDigit = remainder === 0 ? 0 : 11 - remainder
  return checkDigit !== 10 && checkDigit === digits[8]
}

describe('actor seed company org numbers', () => {
  it('uses only Norwegian org numbers with a valid check digit', () => {
    const invalid = actorsSeed
      .filter(actor => actor.companyOrgNr && /^\d{9}$/.test(actor.companyOrgNr))
      .filter(actor => !hasValidCheckDigit(actor.companyOrgNr!))
      .map(actor => `${actor.id}: ${actor.companyOrgNr}`)
    assert.deepEqual(invalid, [])
  })
})
