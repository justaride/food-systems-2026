import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { actorsSeed } from '../../prisma/seed-data/actors'
import { deliverables } from '../../prisma/seed-data/deliverables'
import { mediaEntries, mediaOutlets } from '../../prisma/seed-data/media-corpus'
import { reports } from '../../prisma/seed-data/reports'
import { researchPrompts } from '../../prisma/seed-data/research-prompts'
import { sources } from '../../prisma/seed-data/sources'
import { theses } from '../../prisma/seed-data/theses'

// Importers upsert by these keys in array order, so a repeated key makes the
// later entry silently overwrite the earlier one instead of failing.
function duplicates(values: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) repeated.add(value)
    seen.add(value)
  }
  return [...repeated]
}

describe('seed data unique keys', () => {
  it('has unique actor ids and slugs', () => {
    assert.deepEqual(duplicates(actorsSeed.map(actor => actor.id)), [])
    assert.deepEqual(duplicates(actorsSeed.map(actor => actor.slug)), [])
  })

  const idKeyedSeeds: Array<[string, Array<{ id: string }>]> = [
    ['deliverables', deliverables],
    ['mediaOutlets', mediaOutlets],
    ['mediaEntries', mediaEntries],
    ['reports', reports],
    ['researchPrompts', researchPrompts],
    ['sources', sources],
    ['theses', theses],
  ]

  for (const [name, seed] of idKeyedSeeds) {
    it(`has unique ${name} ids`, () => {
      assert.deepEqual(duplicates(seed.map(entry => entry.id)), [])
    })
  }
})
