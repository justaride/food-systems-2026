import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildActorImportData,
  actorCountryNameKey,
  chooseActorTarget,
  mergeDomainRegistrationMetadata,
  type DomainActorCsvRow,
} from '../../scripts/lib/domain-actor-import'

const baseRow: DomainActorCsvRow = {
  node_id: 'ny-slug-for-kjent-selskap',
  name: 'Kjent Matselskap AS',
  node_type: 'organisasjon',
  domain: 'foredling-industri',
  subdomain: 'frukt-groent-foredling',
  country: 'NO',
  description: 'Lokal foredler med kjent org.nr.',
  key_people: '',
  scale_metric_year: '',
  org_nr: ' 999 888 777 ',
  locator_url: 'https://example.test/kjent-matselskap',
  sourceClass: 'primary',
  verificationStatus: 'machine_verified',
  confidence: 'hoy',
  accessedAt: '2026-06-26',
  notes: 'Testdata',
}

describe('domain actor company linking', () => {
  it('uses existing Actor with same companyId before creating a new slug', () => {
    const company = { id: 'company-kjent', orgNr: '999888777', name: 'Kjent Matselskap AS' }
    const existingActor = {
      id: 'aktor-kjent',
      slug: 'gammel-kjent-slug',
      themeTags: ['domene:legacy'],
      companyId: company.id,
    }

    const target = chooseActorTarget(baseRow, {
      existingBySlug: new Map(),
      existingByCountryName: new Map(),
      companyByOrgNr: new Map([[company.orgNr, company]]),
      existingByCompanyId: new Map([[company.id, existingActor]]),
    })

    assert.equal(target?.id, existingActor.id)
    assert.equal(target?.companyId, company.id)
  })

  it('uses an existing Actor with the same unique country and name', () => {
    const existingActor = {
      id: 'aktor-kjent-navn',
      slug: 'gammel-kjent-slug',
      name: baseRow.name,
      country: baseRow.country,
      themeTags: ['domene:legacy'],
      companyId: null,
    }

    const target = chooseActorTarget(baseRow, {
      existingBySlug: new Map(),
      existingByCountryName: new Map([
        [actorCountryNameKey(baseRow.country, baseRow.name), existingActor],
      ]),
      companyByOrgNr: new Map(),
      existingByCompanyId: new Map(),
    })

    assert.equal(target?.id, existingActor.id)
  })

  it('adds companyId to actor payload when org_nr resolves to a Company', () => {
    const data = buildActorImportData(baseRow, {
      datasetTag: 'mvk-frukt-groent-foredling-2026-06-26',
      company: { id: 'company-kjent', orgNr: '999888777', name: 'Kjent Matselskap AS' },
    })

    assert.equal(data.companyId, 'company-kjent')
    assert.equal(data.metadata.orgNr, '999888777')
    assert.deepEqual(data.themeTags, [
      'domene:foredling-industri',
      'subdomene:frukt-groent-foredling',
      'mvk-frukt-groent-foredling-2026-06-26',
    ])
  })

  it('merges exact domain registration metadata for existing global actors', () => {
    const metadata = mergeDomainRegistrationMetadata(
      { curated: true },
      baseRow,
      'mvk-frukt-groent-foredling-2026-06-26',
    )

    assert.equal(metadata.curated, true)
    assert.deepEqual(metadata.domainRegistrations, [
      {
        dataset: 'mvk-frukt-groent-foredling-2026-06-26',
        domain: 'foredling-industri',
        subdomain: 'frukt-groent-foredling',
        geo: 'NO',
      },
    ])
  })

  it('preserves a legacy top-level domain registration when adding another domain', () => {
    const metadata = mergeDomainRegistrationMetadata(
      {
        dataset: 'mvk-politisk-program-2026-07-01',
        domain: 'virkemiddel-policy',
        subdomain: 'politisk-program',
        geo: 'NO',
      },
      baseRow,
      'mvk-frukt-groent-foredling-2026-06-26',
    )

    assert.deepEqual(metadata.domainRegistrations, [
      {
        dataset: 'mvk-politisk-program-2026-07-01',
        domain: 'virkemiddel-policy',
        subdomain: 'politisk-program',
        geo: 'NO',
      },
      {
        dataset: 'mvk-frukt-groent-foredling-2026-06-26',
        domain: 'foredling-industri',
        subdomain: 'frukt-groent-foredling',
        geo: 'NO',
      },
    ])
  })

  it('defaults a legacy top-level registration to NO when geo is missing', () => {
    const metadata = mergeDomainRegistrationMetadata(
      {
        dataset: 'lokale-verdikjeder-2026-06-25',
        domain: 'lokale-verdikjeder',
        subdomain: 'andelslandbruk',
      },
      baseRow,
      'mvk-frukt-groent-foredling-2026-06-26',
    )

    assert.deepEqual(metadata.domainRegistrations, [
      {
        dataset: 'lokale-verdikjeder-2026-06-25',
        domain: 'lokale-verdikjeder',
        subdomain: 'andelslandbruk',
        geo: 'NO',
      },
      {
        dataset: 'mvk-frukt-groent-foredling-2026-06-26',
        domain: 'foredling-industri',
        subdomain: 'frukt-groent-foredling',
        geo: 'NO',
      },
    ])
  })

  it('recovers a legacy subdomain from existing tags when metadata subdomain is missing', () => {
    const metadata = mergeDomainRegistrationMetadata(
      {
        dataset: 'lokale-verdikjeder-2026-06-25',
        domain: 'lokale-verdikjeder',
      },
      baseRow,
      'mvk-frukt-groent-foredling-2026-06-26',
      ['domene:lokale-verdikjeder', 'subdomene:andelslandbruk'],
    )

    assert.deepEqual(metadata.domainRegistrations, [
      {
        dataset: 'lokale-verdikjeder-2026-06-25',
        domain: 'lokale-verdikjeder',
        subdomain: 'andelslandbruk',
        geo: 'NO',
      },
      {
        dataset: 'mvk-frukt-groent-foredling-2026-06-26',
        domain: 'foredling-industri',
        subdomain: 'frukt-groent-foredling',
        geo: 'NO',
      },
    ])
  })

  it('backfills a legacy top-level registration even when an array already exists', () => {
    const metadata = mergeDomainRegistrationMetadata(
      {
        dataset: 'mvk-politisk-program-2026-07-01',
        domain: 'virkemiddel-policy',
        subdomain: 'politisk-program',
        geo: 'NO',
        domainRegistrations: [
          {
            dataset: 'mvk-institusjon-virkemiddel-ordning-2026-07-01',
            domain: 'institusjon-finansiering',
            subdomain: 'virkemiddel-ordning',
            geo: 'NO',
          },
        ],
      },
      baseRow,
      'mvk-frukt-groent-foredling-2026-06-26',
    )

    assert.deepEqual(metadata.domainRegistrations, [
      {
        dataset: 'mvk-institusjon-virkemiddel-ordning-2026-07-01',
        domain: 'institusjon-finansiering',
        subdomain: 'virkemiddel-ordning',
        geo: 'NO',
      },
      {
        dataset: 'mvk-politisk-program-2026-07-01',
        domain: 'virkemiddel-policy',
        subdomain: 'politisk-program',
        geo: 'NO',
      },
      {
        dataset: 'mvk-frukt-groent-foredling-2026-06-26',
        domain: 'foredling-industri',
        subdomain: 'frukt-groent-foredling',
        geo: 'NO',
      },
    ])
  })
})
