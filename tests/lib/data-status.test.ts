import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildCountStatus,
  coverageShare,
  fallbackSurfaces,
  getDataStatus,
} from '../../src/lib/data-status'

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

  it('regner dekningsandel, og skiller «vet ikke» fra «null dekning»', () => {
    assert.equal(coverageShare(180, 361), 0.499)
    assert.equal(coverageShare(0, 361), 0)
    // null betyr at tellingen feilet — ikke at dekningen er null
    assert.equal(coverageShare(null, 361), null)
    assert.equal(coverageShare(180, null), null)
    // ingen selskaper i det hele tatt gir ingen meningsfull andel
    assert.equal(coverageShare(0, 0), null)
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
      companyFinancial: count(180),
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
      companyFinancial: count(180),
    })

    assert.equal(status.pages.havbruk.ok, true)
    assert.equal(status.pages.havbruk.minRequired, 50)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.ok, true)
    assert.equal(status.knowledgeBase.actors.minRequired, 1636)
    assert.equal(status.knowledgeBaseGatesOk, true)
    assert.equal(status.ok, true)
  })

  it('rapporterer finansdekning, og skiller totaldekning fra AP-4s join-univers', async () => {
    const count = (value: number) => ({ count: async () => value })
    // Selskapstellingen svarer ulikt etter filter — det er nettopp poenget.
    // Formen speiler prod: leverandørsiden er nesten tom fordi bønder ligger i
    // `Producer`, mens kjøpersiden er foredlingsleddet og er det AP-4 kan bruke.
    const companyDelegate = {
      count: async (args?: unknown) => {
        const where = (args as { where?: Record<string, unknown> } | undefined)?.where
        if (!where) return 361
        if (Array.isArray(where.AND)) {
          const clauses = where.AND as Record<string, unknown>[]
          if (clauses.some(clause => 'deliveriesTo' in clause)) return 3
          return 1 // regnskap + leverandørside
        }
        if ('deliveriesTo' in where) return 3
        if ('financials' in where) return 180
        return 4 // landbruksregister-filteret
      },
    }
    const status = await getDataStatus({
      subsidy: count(179310),
      aquacultureSite: count(287),
      aquacultureApplication: count(110),
      fishHealthObservation: count(0),
      deliveryVolume: count(60310),
      businessRelationship: count(105),
      company: companyDelegate,
      companyFinancial: count(742),
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(23),
      application: count(3),
      insight: count(132),
      meeting: count(9),
      communication: count(0),
      document: count(1615),
      sourceCitation: count(5265),
      fieldCitation: count(247477),
      libraryAnalysisRecord: count(1770),
      actor: count(1636),
      personProfile: count(1740),
    })

    assert.equal(status.tables.companyFinancials, 742)
    assert.equal(status.tables.companiesWithFinancials, 180)
    assert.equal(status.tables.companiesWithFinancialsAndDeliveries, 1)
    assert.equal(status.tables.companiesWithFinancialsAndDeliveriesTo, 3)

    assert.equal(status.financialCoverage.companies, 361)
    assert.equal(status.financialCoverage.withFinancials, 180)
    assert.equal(status.financialCoverage.share, 0.499)
    // Leverandørsiden er lav ved konstruksjon, ikke av datamangel …
    assert.equal(status.financialCoverage.supplierSide.withDeliveries, 1)
    // … og kjøpersiden er den AP-4 skal leses mot.
    assert.equal(status.financialCoverage.buyerSide.withDeliveries, 3)
    assert.equal(status.financialCoverage.buyerSide.withFinancialsAndDeliveries, 3)
    // Bakoverkompatible felt beholder leverandørsidens tall uendret.
    assert.equal(status.financialCoverage.withFinancialsAndDeliveries, 1)
    assert.equal(status.financialCoverage.joinShare, 0.003)

    // Finansdekningen er rapportering, ikke en gate — den skal ikke kunne
    // felle helsesjekken.
    assert.equal(status.ok, true)
  })

  it('lar finansdekningen bli null når tellingen feiler, uten å felle helsesjekken', async () => {
    const count = (value: number) => ({ count: async () => value })
    const missing = { count: async () => { throw new Error('P2021 table does not exist') } }
    const status = await getDataStatus({
      subsidy: count(179310),
      aquacultureSite: count(287),
      aquacultureApplication: count(110),
      fishHealthObservation: count(0),
      deliveryVolume: count(60310),
      businessRelationship: count(105),
      company: count(361),
      companyFinancial: missing,
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(23),
      application: count(3),
      insight: count(132),
      meeting: count(9),
      communication: count(0),
      document: count(1615),
      sourceCitation: count(5265),
      fieldCitation: count(247477),
      libraryAnalysisRecord: count(1770),
      actor: count(1636),
      personProfile: count(1740),
    })

    assert.equal(status.financialCoverage.financialRows, null)
    assert.equal(status.tableErrors.companyFinancials, 'P2021 table does not exist')
    // En manglende telling slår ut på dbOk (som alle tabellfeil gjør), men
    // dekningsandelene skal være null framfor 0 — «vet ikke», ikke «ingen».
    assert.equal(status.dbOk, false)
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
      companyFinancial: count(180),
    })

    assert.equal(status.ok, false)
    assert.equal(status.dbOk, false)
    assert.equal(status.knowledgeBaseGatesOk, false)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.actual, null)
    assert.equal(status.knowledgeBase.libraryAnalysisRecords.error, 'P2021 table does not exist')
  })
})
