import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildSourceCoverageGapRows,
  formatSourceCoverageGapRowsCsv,
  recommendSourcePath,
} from '../../src/lib/source-coverage-gaps'

const norwegianCompany = {
  id: 'company-no',
  name: 'Norsk Mat AS',
  country: 'NO',
  orgNr: '999111222',
  registrySource: 'bronnoysund',
  orgNrFormat: 'NO_ORGNR',
}

const swedishCompany = {
  id: 'company-se',
  name: 'Svensk Mat, AB',
  country: 'SE',
  orgNr: '556677-8899',
  registrySource: 'bolagsverket',
  orgNrFormat: 'SE_ORGNR',
}

describe('source coverage gap helpers', () => {
  it('recommends registry-specific source paths from company metadata', () => {
    assert.equal(recommendSourcePath(norwegianCompany), 'bronnoysund_role_or_entity_snapshot')
    assert.equal(recommendSourcePath(swedishCompany), 'bolagsverket_manual_or_api')
    assert.equal(recommendSourcePath({ ...norwegianCompany, country: 'DK', registrySource: 'cvr', orgNrFormat: 'DK_ORGNR' }), 'cvr_credentials_or_browser')
    assert.equal(recommendSourcePath({ ...norwegianCompany, country: 'FI', registrySource: 'virre', orgNrFormat: 'FI_ORGNR' }), 'prh_virre_interactive_or_paid')
    assert.equal(recommendSourcePath({ ...norwegianCompany, country: 'IS', registrySource: 'skatturinn', orgNrFormat: 'IS_ORGNR' }), 'skatturinn_interactive_download')
    assert.equal(recommendSourcePath({ ...norwegianCompany, country: null, registrySource: null, orgNrFormat: null }), 'manual_source_review')
  })

  it('builds rows only for BoardMember, Shareholder, and role paths without citations', () => {
    const rows = buildSourceCoverageGapRows({
      boardMembers: [
        {
          id: 'board-missing',
          personName: 'Ari Leder',
          personKey: 'ari-leder',
          role: 'Styreleder',
          company: norwegianCompany,
        },
        {
          id: 'board-covered',
          personName: 'Bente Dekket',
          personKey: 'bente-dekket',
          role: 'Styremedlem',
          company: norwegianCompany,
        },
      ],
      shareholders: [
        {
          id: 'shareholder-missing',
          name: 'Eier Holding AS',
          ownershipPct: '42.5',
          company: swedishCompany,
        },
        {
          id: 'shareholder-covered',
          name: 'Dekket Eier AS',
          ownershipPct: null,
          company: swedishCompany,
        },
      ],
      personProfileRoles: [
        {
          profileId: 'profile-missing',
          profileName: 'Cecilie Rolle',
          personKey: 'cecilie-rolle',
          role: 'CEO',
          fieldPath: 'roles[companyId=company-se;roleKey=CEO;fromYear=2021;toYear=null]',
          company: swedishCompany,
        },
        {
          profileId: 'profile-covered',
          profileName: 'Dag Dekket',
          personKey: 'dag-dekket',
          role: 'CEO',
          fieldPath: 'roles[companyId=company-no;roleKey=CEO;fromYear=2020;toYear=null]',
          company: norwegianCompany,
        },
      ],
      fieldCitations: [
        { entityType: 'BoardMember', entityId: 'board-covered', fieldPath: null },
        { entityType: 'Shareholder', entityId: 'shareholder-covered', fieldPath: null },
        {
          entityType: 'PersonProfile',
          entityId: 'profile-covered',
          fieldPath: 'roles[companyId=company-no;roleKey=CEO;fromYear=2020;toYear=null]',
        },
      ],
    })

    assert.deepEqual(rows.map(row => ({
      entityType: row.entityType,
      entityId: row.entityId,
      fieldPath: row.fieldPath,
      companyName: row.companyName,
      personName: row.personName,
      shareholderName: row.shareholderName,
      role: row.role,
      recommendedSourcePath: row.recommendedSourcePath,
      reason: row.reason,
    })), [
      {
        entityType: 'BoardMember',
        entityId: 'board-missing',
        fieldPath: '',
        companyName: 'Norsk Mat AS',
        personName: 'Ari Leder',
        shareholderName: '',
        role: 'Styreleder',
        recommendedSourcePath: 'bronnoysund_role_or_entity_snapshot',
        reason: 'missing_board_member_field_citation',
      },
      {
        entityType: 'Shareholder',
        entityId: 'shareholder-missing',
        fieldPath: '',
        companyName: 'Svensk Mat, AB',
        personName: '',
        shareholderName: 'Eier Holding AS',
        role: '',
        recommendedSourcePath: 'bolagsverket_manual_or_api',
        reason: 'missing_shareholder_field_citation',
      },
      {
        entityType: 'PersonProfileRole',
        entityId: 'profile-missing',
        fieldPath: 'roles[companyId=company-se;roleKey=CEO;fromYear=2021;toYear=null]',
        companyName: 'Svensk Mat, AB',
        personName: 'Cecilie Rolle',
        shareholderName: '',
        role: 'CEO',
        recommendedSourcePath: 'bolagsverket_manual_or_api',
        reason: 'missing_person_profile_role_field_citation',
      },
    ])
  })

  it('formats stable CSV with escaped text and headers', () => {
    const csv = formatSourceCoverageGapRowsCsv([
      {
        entityType: 'Shareholder',
        entityId: 'shareholder-1',
        fieldPath: '',
        companyId: 'company-se',
        companyName: 'Svensk Mat, AB',
        personName: '',
        personKey: '',
        role: '',
        shareholderName: 'Eier "Nordic" AS',
        ownershipPct: '42.5',
        country: 'SE',
        orgNr: '556677-8899',
        registrySource: 'bolagsverket',
        recommendedSourcePath: 'bolagsverket_manual_or_api',
        reason: 'missing_shareholder_field_citation',
      },
    ])

    assert.equal(csv.split('\n')[0], [
      'entityType',
      'entityId',
      'fieldPath',
      'companyId',
      'companyName',
      'personName',
      'personKey',
      'role',
      'shareholderName',
      'ownershipPct',
      'country',
      'orgNr',
      'registrySource',
      'recommendedSourcePath',
      'reason',
    ].join(','))
    assert.match(csv, /"Svensk Mat, AB"/)
    assert.match(csv, /"Eier ""Nordic"" AS"/)
  })
})
