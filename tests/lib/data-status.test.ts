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
      company: count(351),
      phase: count(3),
      teamMember: count(2),
      kPI: count(4),
      tenStep: count(10),
      evidenceDoc: count(5),
      application: count(1),
      insight: count(6),
      meeting: failing,
      communication: count(0),
      document: count(1539),
      sourceCitation: count(2699),
      fieldCitation: count(244516),
      libraryAnalysisRecord: count(1295),
      actor: count(1636),
      personProfile: count(1594),
    })

    assert.equal(status.ok, false)
    assert.equal(status.dbOk, false)
    assert.equal(status.pageGatesOk, true)
    assert.equal(status.knowledgeBaseGatesOk, true)
    assert.equal(status.tableErrors.meetings, 'P1001 database unavailable')
    assert.equal(status.tables.meetings, null)
  })

  it('treats the current curated havbruk site import as enough for the havbruk page gate', async () => {
    const count = (value: number) => ({ count: async () => value })
    const status = await getDataStatus({
      subsidy: count(179310),
      aquacultureSite: count(50),
      aquacultureApplication: count(8),
      fishHealthObservation: count(0),
      deliveryVolume: count(60310),
      businessRelationship: count(50),
      company: count(38976),
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(18),
      application: count(3),
      insight: count(122),
      meeting: count(8),
      communication: count(0),
      document: count(1539),
      sourceCitation: count(2699),
      fieldCitation: count(244516),
      libraryAnalysisRecord: count(1295),
      actor: count(1636),
      personProfile: count(1594),
    })

    assert.equal(status.pages.havbruk.ok, true)
    assert.equal(status.pages.havbruk.minRequired, 50)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.ok, true)
    assert.equal(status.knowledgeBase.actors.minRequired, 1636)
    assert.equal(status.knowledgeBaseGatesOk, true)
    assert.equal(status.ok, true)
  })

  it('fails closed when the library-analysis table is unavailable', async () => {
    const count = (value: number) => ({ count: async () => value })
    const missingTable = { count: async () => { throw new Error('P2021 table does not exist') } }
    const status = await getDataStatus({
      subsidy: count(120),
      aquacultureSite: count(110),
      aquacultureApplication: count(10),
      fishHealthObservation: count(0),
      deliveryVolume: count(5),
      businessRelationship: count(2),
      company: count(351),
      phase: count(3),
      teamMember: count(2),
      kPI: count(4),
      tenStep: count(10),
      evidenceDoc: count(5),
      application: count(1),
      insight: count(6),
      meeting: count(1),
      communication: count(0),
      document: count(1539),
      sourceCitation: count(2699),
      fieldCitation: count(244516),
      libraryAnalysisRecord: missingTable,
      actor: count(1636),
      personProfile: count(1594),
    })

    assert.equal(status.ok, false)
    assert.equal(status.dbOk, false)
    assert.equal(status.knowledgeBaseGatesOk, false)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.actual, null)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.error, 'P2021 table does not exist')
  })
})
