import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildOwnershipForest,
  buildVaultExportSnapshot,
  toNumberOrNull,
} from '../../src/lib/obsidian-vault-export'

describe('obsidian vault DB export helpers', () => {
  it('normalizes DB rows into stable vault export payloads and counts', () => {
    const snapshot = buildVaultExportSnapshot({
      generatedAt: '2026-07-02T00:00:00.000Z',
      companies: [
        {
          id: 'c2',
          name: 'Datter AS',
          orgNr: '222',
          legalForm: 'AS',
          country: 'NO',
          ownershipType: null,
          valueChainStage: 'retail',
          naceCode: null,
          naceDescription: null,
          isResearchConstruct: false,
        },
        {
          id: 'c1',
          name: 'Mor AS',
          orgNr: '111',
          legalForm: 'AS',
          country: 'NO',
          ownershipType: 'family',
          valueChainStage: 'distribution',
          naceCode: '46.39',
          naceDescription: 'Engroshandel',
          isResearchConstruct: false,
        },
      ],
      ownershipEdges: [
        {
          id: 'o1',
          parentCompanyId: 'c1',
          childCompanyId: 'c2',
          ownershipPct: 100,
          ownershipType: 'subsidiary',
          source: 'annual-report',
        },
      ],
      boardMembers: [
        {
          id: 'b1',
          companyId: 'c1',
          personName: 'Ola Nordmann',
          personKey: 'ola-nordmann',
          role: 'styreleder',
          source: 'Brreg',
          verificationStatus: 'machine_verified',
        },
      ],
      businessRelationships: [],
      properties: [],
    })

    assert.deepEqual(snapshot.manifest.counts, {
      companies: 2,
      ownershipEdges: 1,
      boardMembers: 1,
      businessRelationships: 0,
      properties: 0,
    })
    assert.deepEqual(snapshot.companies.map((company) => company.orgNr), ['111', '222'])
    assert.equal(snapshot.companies[0].classification, 'family')
    assert.equal(snapshot.ownershipEdges[0].parentName, 'Mor AS')
    assert.equal(snapshot.boardMembers[0].companyName, 'Mor AS')
  })

  it('builds nested ownership forests from exported company and edge rows', () => {
    const forest = buildOwnershipForest(
      [
        { id: 'root', name: 'Root', orgNr: '1' },
        { id: 'child', name: 'Child', orgNr: '2' },
        { id: 'grandchild', name: 'Grandchild', orgNr: '3' },
      ],
      [
        { parentCompanyId: 'root', childCompanyId: 'child', ownershipPct: 80 },
        { parentCompanyId: 'child', childCompanyId: 'grandchild', ownershipPct: 51 },
      ],
    )

    assert.equal(forest.length, 1)
    assert.equal(forest[0].name, 'Root')
    assert.equal(forest[0].children[0].ownershipPct, 80)
    assert.equal(forest[0].children[0].children[0].name, 'Grandchild')
  })

  it('converts Decimal-like and bigint values to JSON-safe numbers', () => {
    assert.equal(toNumberOrNull({ toString: () => '42.50' }), 42.5)
    assert.equal(toNumberOrNull(10n), 10)
    assert.equal(toNumberOrNull(null), null)
  })
})
