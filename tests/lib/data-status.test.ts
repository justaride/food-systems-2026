import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { mkdtemp } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { buildCountStatus, fallbackSurfaces, getArtifactStatuses, getDataStatus } from '../../src/lib/data-status'

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
      companyFinancial: { ...count(12), findFirst: async () => ({ year: 2024 }) },
      companyProperty: count(3),
      producer: count(10),
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
      companyFinancial: { ...count(51), findFirst: async () => ({ year: 2024 }) },
      companyProperty: count(25),
      producer: count(1200),
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(18),
      application: count(3),
      insight: count(122),
      meeting: count(8),
      communication: count(0),
      document: count(1063),
      actor: count(201),
      personProfile: count(371),
    })

    assert.equal(status.pages.havbruk.ok, true)
    assert.equal(status.pages.havbruk.minRequired, 50)
    assert.equal(status.ok, true)
  })

  it('reports field coverage and explicit fallback consequences for data-status page', async () => {
    const count = (value: number) => ({ count: async () => value })
    const company = {
      count: async (args?: unknown) => {
        const text = JSON.stringify(args ?? {})
        if (text.includes('Landbruksregisteret')) return 4
        if (text.includes('financials')) return 80
        if (text.includes('groupEmployees')) return 74
        if (text.includes('isControlling')) return 65
        return 100
      },
    }
    const aquacultureSite = {
      count: async (args?: unknown) => JSON.stringify(args ?? {}).includes('capacityTonnes') ? 45 : 50,
    }
    const companyProperty = {
      count: async (args?: unknown) => {
        const text = JSON.stringify(args ?? {})
        if (text.includes('sqMeters')) return 12
        if (text.includes('acquiredYear')) return 8
        return 20
      },
    }
    const producer = {
      count: async (args?: unknown) => JSON.stringify(args ?? {}).includes('municipality') ? 700 : 1000,
    }

    const status = await getDataStatus({
      subsidy: count(179310),
      aquacultureSite,
      aquacultureApplication: count(8),
      fishHealthObservation: count(0),
      deliveryVolume: count(60310),
      businessRelationship: count(50),
      company,
      companyFinancial: { ...count(123), findFirst: async () => ({ year: 2024 }) },
      companyProperty,
      producer,
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(18),
      application: count(3),
      insight: count(122),
      meeting: count(8),
      communication: count(0),
      document: count(1063),
      actor: count(201),
      personProfile: count(371),
    }, { artifactRoot: await mkdtemp(join(tmpdir(), 'data-status-empty-artifacts-')) })

    const latestFinancial = status.fieldCoverage.find(row => row.id === 'companies.latest-financial')
    assert.equal(latestFinancial?.covered, 80)
    assert.equal(latestFinancial?.total, 100)
    assert.equal(latestFinancial?.percent, 80)
    assert.equal(latestFinancial?.measuredYear, 2024)

    assert.equal(status.fieldCoverage.find(row => row.id === 'aquaculture.capacity')?.missing, 5)
    assert.equal(status.fieldCoverage.find(row => row.id === 'properties.sqm')?.percent, 60)
    assert.equal(status.fieldCoverage.find(row => row.id === 'producers.total')?.total, 1000)
    assert.equal(status.fieldCoverage.find(row => row.id === 'producers.total')?.percent, 100)

    assert.ok(status.operationalGaps.some(gap => gap.id === 'communications-empty' && gap.route === '/kommunikasjon'))
    assert.ok(status.operationalGaps.some(gap => gap.id === 'fish-health-empty' && gap.route === '/havbruk'))
    assert.ok(status.operationalGaps.some(gap => gap.id === 'landbruksregister-narrow' && gap.route === '/produsenter'))
  })

  it('splits company financial coverage into BRREG AS/ASA targets and explicit missing reasons', async () => {
    const count = (value: number) => ({ count: async () => value })
    const companyRows = [
      {
        orgNr: '815664582',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: null,
        _count: { financials: 1 },
      },
      {
        orgNr: '897392232',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: null,
        _count: { financials: 0 },
      },
      {
        orgNr: '964118191',
        country: 'NO',
        legalForm: 'ASA',
        isResearchConstruct: false,
        metadata: null,
        _count: { financials: 0 },
      },
      {
        orgNr: 'DK-35954716',
        country: 'DK',
        legalForm: 'A/S',
        isResearchConstruct: false,
        metadata: { financials: { missingReason: 'foreign_registry' } },
        _count: { financials: 0 },
      },
      {
        orgNr: 'NO-LIDL',
        country: 'NO',
        legalForm: 'AS',
        isResearchConstruct: false,
        metadata: { financials: { missingReason: 'synthetic_orgnr' } },
        _count: { financials: 0 },
      },
      {
        orgNr: '947942638',
        country: 'NO',
        legalForm: 'SA',
        isResearchConstruct: false,
        metadata: { financials: { missingReason: 'not_as_asa_scope' } },
        _count: { financials: 0 },
      },
      {
        orgNr: 'SE-556004-7903',
        country: 'SE',
        legalForm: 'AB',
        isResearchConstruct: false,
        metadata: null,
        _count: { financials: 0 },
      },
    ]
    const company = {
      count: async (args?: unknown) => {
        const text = JSON.stringify(args ?? {})
        if (text.includes('Landbruksregisteret')) return 0
        if (text.includes('financials')) return companyRows.filter(row => row._count.financials > 0).length
        return companyRows.length
      },
      findMany: async () => companyRows,
    }

    const status = await getDataStatus({
      subsidy: count(179310),
      aquacultureSite: count(50),
      aquacultureApplication: count(8),
      fishHealthObservation: count(0),
      deliveryVolume: count(60310),
      businessRelationship: count(50),
      company,
      companyFinancial: { ...count(1), findFirst: async () => ({ year: 2024 }) },
      companyProperty: count(20),
      producer: count(1000),
      phase: count(4),
      teamMember: count(9),
      kPI: count(5),
      tenStep: count(10),
      evidenceDoc: count(18),
      application: count(3),
      insight: count(122),
      meeting: count(8),
      communication: count(1),
      document: count(1063),
      actor: count(201),
      personProfile: count(371),
    }, { artifactRoot: await mkdtemp(join(tmpdir(), 'data-status-financial-split-')) })

    const norwegianAsa = status.fieldCoverage.find(row => row.id === 'companies.latest-financial-norwegian-as-asa')
    assert.equal(norwegianAsa?.covered, 1)
    assert.equal(norwegianAsa?.total, 3)
    assert.equal(norwegianAsa?.percent, 33.3)
    assert.equal(norwegianAsa?.status, 'critical')

    const explicitReasons = status.fieldCoverage.find(row => row.id === 'companies.financial-missing-reason')
    assert.equal(explicitReasons?.covered, 3)
    assert.equal(explicitReasons?.total, 6)
    assert.equal(explicitReasons?.percent, 50)
    assert.equal(explicitReasons?.status, 'warn')
  })

  it('extracts artifact freshness from generatedAt, generated and curated year fields', async () => {
    const root = await mkdtemp(join(tmpdir(), 'data-status-artifacts-'))
    mkdirSync(join(root, 'data'), { recursive: true })
    mkdirSync(join(root, 'public/data/food-systems/no'), { recursive: true })
    writeFileSync(join(root, 'data/konsern-coverage.json'), JSON.stringify({ generatedAt: '2026-06-11T00:00:00.000Z' }))
    writeFileSync(join(root, 'public/data/food-systems/no/chart-metrics.json'), JSON.stringify({ generated: '2026-06-10T12:00:00.000Z' }))
    writeFileSync(join(root, 'public/data/food-systems/no/value-chain.json'), JSON.stringify({ year: 2024, steps: [] }))

    const artifacts = await getArtifactStatuses(root)

    assert.equal(artifacts.find(row => row.id === 'konsern-coverage')?.generatedAt, '2026-06-11T00:00:00.000Z')
    assert.equal(artifacts.find(row => row.id === 'chart-metrics')?.generatedAt, '2026-06-10T12:00:00.000Z')
    assert.equal(artifacts.find(row => row.id === 'value-chain')?.generatedAt, null)
    assert.equal(artifacts.find(row => row.id === 'value-chain')?.displayDate, '2024')
  })
})
