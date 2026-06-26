import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildActorImportData,
  chooseActorTarget,
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
      companyByOrgNr: new Map([[company.orgNr, company]]),
      existingByCompanyId: new Map([[company.id, existingActor]]),
    })

    assert.equal(target?.id, existingActor.id)
    assert.equal(target?.companyId, company.id)
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
})
