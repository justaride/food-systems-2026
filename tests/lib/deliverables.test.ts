import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { deliverables } from '../../src/lib/data/deliverables'

describe('deliverables seed data', () => {
  it('covers the Food TG contract deliverables used by db verification', () => {
    assert.ok(deliverables.length >= 5)
    assert.equal(new Set(deliverables.map(deliverable => deliverable.id)).size, deliverables.length)
    assert.ok(deliverables.every(deliverable => deliverable.name.trim().length > 0))
    assert.ok(deliverables.every(deliverable => deliverable.deadline.trim().length > 0))
  })
})
