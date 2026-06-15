import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildPersonProfileRoleFieldPath } from '../../src/lib/person-profile-role-citations'

describe('person profile role citation field paths', () => {
  it('builds the stable field path used by source coverage gaps', () => {
    assert.equal(
      buildPersonProfileRoleFieldPath({
        companyId: 'company-se',
        companyName: 'Svensk Mat AB',
        role: 'CEO',
        fromYear: 2021,
        toYear: null,
      }),
      'roles[companyId=company-se;roleKey=CEO;fromYear=2021;toYear=null]',
    )
  })

  it('returns null for role rows that cannot be cited precisely', () => {
    assert.equal(
      buildPersonProfileRoleFieldPath({
        companyId: null,
        companyName: 'Unresolved Company',
        role: 'CEO',
        fromYear: 2021,
        toYear: null,
      }),
      null,
    )
    assert.equal(
      buildPersonProfileRoleFieldPath({
        companyId: 'company-se',
        companyName: 'Svensk Mat AB',
        role: null,
        fromYear: 2021,
        toYear: null,
      }),
      null,
    )
  })
})
