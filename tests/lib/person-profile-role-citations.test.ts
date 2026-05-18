import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildPersonProfileRoleCitationPlans,
  buildPersonProfileRoleFieldPath,
  normalizePersonProfileRoleKey,
} from '../../scripts/lib/person-profile-role-citations'

const profile = {
  id: 'profile-1',
  personKey: 'runar-hollevik',
  roles: [
    {
      companyId: 'company-ng',
      companyName: 'NorgesGruppen ASA',
      role: 'Daglig leder (CEO)',
      fromYear: 2016,
    },
  ],
}

const boardRows = [
  {
    id: 'board-1',
    personKey: 'runar-hollevik',
    companyId: 'company-ng',
    companyName: 'NorgesGruppen ASA',
    role: 'CEO',
    citationId: 'cit-role-ng',
  },
]

describe('person profile role citation helpers', () => {
  it('normalizes only supported board/executive roles', () => {
    assert.equal(normalizePersonProfileRoleKey('Daglig leder (CEO)'), 'CEO')
    assert.equal(normalizePersonProfileRoleKey('Administrerende direktor'), 'CEO')
    assert.equal(normalizePersonProfileRoleKey('Styrets leder'), 'styreleder')
    assert.equal(normalizePersonProfileRoleKey('nestleder styret'), 'nestleder')
    assert.equal(normalizePersonProfileRoleKey('Styremedlem / grunnlegger'), 'styremedlem')
    assert.equal(normalizePersonProfileRoleKey('CEO og styremedlem'), null)
  })

  it('builds stable key-based field paths for JSON roles', () => {
    assert.equal(
      buildPersonProfileRoleFieldPath(profile.roles[0]),
      'roles[companyId=company-ng;roleKey=CEO;fromYear=2016;toYear=null]',
    )

    assert.equal(
      buildPersonProfileRoleFieldPath({
        companyName: 'NorgesGruppen ASA',
        role: 'CEO',
      }),
      'roles[companyNameKey=norgesgruppen-asa;roleKey=CEO;fromYear=null;toYear=null]',
    )
  })

  it('creates a strict person/company/role plan from existing board citations', () => {
    const result = buildPersonProfileRoleCitationPlans([profile], boardRows)

    assert.deepEqual(result.plans, [
      {
        profileId: 'profile-1',
        citationId: 'cit-role-ng',
        fieldPath: 'roles[companyId=company-ng;roleKey=CEO;fromYear=2016;toYear=null]',
      },
    ])
    assert.equal(result.skipped.length, 0)
  })

  it('falls back to unique company-name matching when companyId is missing', () => {
    const result = buildPersonProfileRoleCitationPlans([
      {
        id: 'profile-2',
        personKey: 'runar-hollevik',
        roles: [{ companyName: 'NorgesGruppen ASA', role: 'CEO' }],
      },
    ], boardRows)

    assert.equal(result.plans.length, 1)
    assert.equal(result.plans[0].fieldPath, 'roles[companyNameKey=norgesgruppen-asa;roleKey=CEO;fromYear=null;toYear=null]')
  })

  it('skips ambiguous matches instead of attaching a citation', () => {
    const result = buildPersonProfileRoleCitationPlans([profile], [
      ...boardRows,
      { ...boardRows[0], id: 'board-duplicate', citationId: 'cit-other' },
    ])

    assert.deepEqual(result.plans, [])
    assert.equal(result.skipped[0].reason, 'ambiguous_match')
  })
})
