import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  BRREG_ROLES_SOURCE_LABEL,
  boardMemberPersonRoleKey,
  boardMemberNamesAreCompatible,
  groupBoardMembersByPersonRole,
  selectUnverifiedSeedBoardMemberIdsForPruning,
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

  it('selects only unsourced seed rows for pruning when BRREG replacements exist', () => {
    const ids = selectUnverifiedSeedBoardMemberIdsForPruning([
      {
        id: 'old-seed',
        personKey: 'anders-grilstad',
        role: 'styreleder',
        source: null,
        sourceUrl: null,
        verifiedAt: null,
      },
      {
        id: 'brreg-current',
        personKey: 'asbjorn-reinkind',
        role: 'styreleder',
        source: BRREG_ROLES_SOURCE_LABEL,
        sourceUrl: 'https://data.brreg.no/enhetsregisteret/api/enheter/937070632/roller',
        verifiedAt: new Date('2026-05-19T12:00:00Z'),
      },
      {
        id: 'manual-source',
        personKey: 'historical-row',
        role: 'styremedlem',
        source: 'https://example.com/annual-report.pdf',
        sourceUrl: null,
        verifiedAt: new Date('2026-05-19T12:00:00Z'),
      },
    ])

    assert.deepEqual(ids, ['old-seed'])
  })

  it('keeps unsourced seed rows when no BRREG replacement exists', () => {
    const ids = selectUnverifiedSeedBoardMemberIdsForPruning([
      {
        id: 'non-norwegian-seed',
        personKey: 'anders-jensen',
        role: 'bestyrelsesmedlem',
        source: null,
        sourceUrl: null,
        verifiedAt: null,
      },
    ])

    assert.deepEqual(ids, [])
  })
})
