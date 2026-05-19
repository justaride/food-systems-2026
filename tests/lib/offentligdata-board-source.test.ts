import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  boardMemberPersonRoleKey,
  boardMemberNamesAreCompatible,
  groupBoardMembersByPersonRole,
} from '../../src/lib/brreg-board-member-provenance'

describe('offentligdata board-member provenance import', () => {
  const script = readFileSync('scripts/enrich-offentligdata.ts', 'utf8')

  it('writes direct BRREG role source locators and verification timestamps to board-member rows', () => {
    assert.match(script, /function brregRolesUrl\(orgNr: string\)/)
    assert.match(script, /source:\s*BRREG_ROLES_SOURCE_LABEL/)
    assert.match(script, /sourceUrl:\s*brregRolesUrl\(activeOrgNr\)/)
    assert.match(script, /verifiedAt:\s*syncedAt/)
  })

  it('groups duplicate imported board-member rows so all matching BRREG roles are verified', () => {
    const grouped = groupBoardMembersByPersonRole([
      { id: 'legacy-import', personKey: 'kari-nordmann', role: 'styremedlem' },
      { id: 'brreg-import', personKey: 'kari-nordmann', role: 'styremedlem' },
      { id: 'other-role', personKey: 'kari-nordmann', role: 'CEO' },
    ])

    assert.deepEqual(
      grouped.get(boardMemberPersonRoleKey('kari-nordmann', 'styremedlem'))?.map((row) => row.id),
      ['legacy-import', 'brreg-import'],
    )
    assert.deepEqual(
      grouped.get(boardMemberPersonRoleKey('kari-nordmann', 'CEO'))?.map((row) => row.id),
      ['other-role'],
    )
  })

  it('matches abbreviated imported names to fuller BRREG role names without accepting weak one-token matches', () => {
    assert.equal(boardMemberNamesAreCompatible('Gyrid Ingerø', 'Gyrid Skalleberg Ingerø'), true)
    assert.equal(
      boardMemberNamesAreCompatible('Philipp Lasse Engedal', 'Philipp Lasse Hartlieb Engedal'),
      true,
    )
    assert.equal(
      boardMemberNamesAreCompatible('Ann Kristin Nygaard', 'Ann Kristin Sønmør Nygaard'),
      true,
    )
    assert.equal(boardMemberNamesAreCompatible('Anne', 'Anne Polden'), false)
    assert.equal(boardMemberNamesAreCompatible('Elisabeth Nilsen', 'Elisabeth Holand'), false)
  })
})
