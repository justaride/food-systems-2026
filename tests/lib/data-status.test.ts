import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { buildCountStatus, fallbackSurfaces, getDataStatus } from '../../src/lib/data-status'

describe('data status helpers', () => {
  it('fails a page gate when the count is below the required threshold', () => {
    assert.deepEqual(buildCountStatus(99, 100), {
      ok: false,
      minRequired: 100,
      actual: 99,
    })
  })

  it('fails a page gate when a table count could not be read', () => {
    assert.deepEqual(buildCountStatus(null, 1, 'P1001 database unavailable'), {
      ok: false,
      minRequired: 1,
      actual: null,
      error: 'P1001 database unavailable',
    })
  })

  it('documents known static fallback surfaces for status output', () => {
    assert.ok(fallbackSurfaces.some(surface => surface.id === 'project-core'))
    assert.ok(fallbackSurfaces.some(surface => surface.route === '/moter'))
    assert.ok(fallbackSurfaces.every(surface => surface.queryModule.startsWith('src/lib/queries/')))
  })

  it('keeps data-status alive and reports table errors when a count fails', async () => {
    const count = (value: number) => ({ count: async () => value })
    const failing = { count: async () => { throw new Error('P1001 database unavailable') } }
    const status = await getDataStatus({
      subsidy: count(120),
      aquacultureSite: count(110),
      aquacultureApplication: count(10),
      fishHealthObservation: count(0),
      deliveryVolume: count(5),
      businessRelationship: count(2),
      company: count(150),
      phase: count(3),
      teamMember: count(2),
      kPI: count(4),
      tenStep: count(10),
      evidenceDoc: count(5),
      application: count(1),
      insight: count(6),
      meeting: failing,
      communication: count(0),
      document: count(20),
      actor: count(8),
      personProfile: count(7),
    })

    assert.equal(status.ok, false)
    assert.equal(status.dbOk, false)
    assert.equal(status.pageGatesOk, true)
    assert.equal(status.tableErrors.meetings, 'P1001 database unavailable')
    assert.equal(status.tables.meetings, null)
  })
})
