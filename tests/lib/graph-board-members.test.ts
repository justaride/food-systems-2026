import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildBoardMemberGraphArtifacts } from '../../src/lib/graph-board-members'

describe('board member graph artifacts', () => {
  it('creates fallback person nodes for board members without PersonProfile rows', () => {
    const artifacts = buildBoardMemberGraphArtifacts({
      boardMembers: [
        {
          companyId: 'company-1',
          personKey: 'jane-doe',
          personName: 'Jane Doe',
          role: 'styremedlem',
          source: 'official registry',
          sourceUrl: 'https://example.org/board',
          verifiedAt: new Date('2026-01-01T00:00:00Z'),
        },
      ],
      personProfiles: [],
      companyIds: new Set(['company-1']),
    })

    assert.deepEqual(artifacts.fallbackPersonNodes, [
      {
        id: 'board-person:jane-doe',
        label: 'Jane Doe',
        type: 'person',
        tags: ['board-member', 'profile-gap'],
        href: '/styremedlemmer?person=jane-doe',
      },
    ])
    assert.deepEqual(artifacts.boardMemberProfileGaps, [
      {
        companyId: 'company-1',
        companyName: 'company-1',
        personKey: 'jane-doe',
        personName: 'Jane Doe',
      },
    ])
    assert.equal(artifacts.edges[0].source, 'board-person:jane-doe')
    assert.equal(artifacts.edges[0].target, 'company-1')
    assert.equal(artifacts.edges[0].type, 'board-role')
    assert.equal(artifacts.edges[0].confidence, 0.95)
  })

  it('reuses existing PersonProfile nodes when a profile exists', () => {
    const artifacts = buildBoardMemberGraphArtifacts({
      boardMembers: [
        {
          companyId: 'company-1',
          personKey: 'jane-doe',
          personName: 'Jane Doe',
          role: 'styremedlem',
          source: null,
          sourceUrl: null,
          verifiedAt: null,
        },
      ],
      personProfiles: [{ id: 'person-1', personKey: 'jane-doe', name: 'Jane Doe' }],
      companyIds: new Set(['company-1']),
      companyNamesById: new Map([['company-1', 'Example Company']]),
    })

    assert.deepEqual(artifacts.fallbackPersonNodes, [])
    assert.deepEqual(artifacts.boardMemberProfileGaps, [])
    assert.equal(artifacts.edges[0].source, 'person-1')
    assert.equal(artifacts.edges[0].target, 'company-1')
  })
})
