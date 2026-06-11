import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildKonsernTreeSizeExpectations,
  extractOrgNrsFromImportSource,
  reconcileImportCorpus,
} from '../../scripts/lib/import-corpus-reconciliation'

describe('import corpus reconciliation helpers', () => {
  it('extracts static org numbers from literals and resolved constants', () => {
    const source = `
      const NORGESGRUPPEN = '819731322'
      const supplierOrg = 'NO-SUPPLIER'
      const rows = [
        { orgNr: NORGESGRUPPEN, name: 'NorgesGruppen' },
        { childOrgNr: '930622974', parentOrgNr: NORGESGRUPPEN, ownershipType: 'subsidiary' },
        { supplierOrgNr: supplierOrg },
        { orgNr: company.orgNr },
      ]
    `

    const result = extractOrgNrsFromImportSource('scripts/import-example.ts', source)

    assert.deepEqual(result.orgNrs, ['819731322', '930622974', 'NO-SUPPLIER'])
    assert.equal(result.occurrences.length, 4)
    assert.deepEqual(result.ownershipLinks, [
      {
        script: 'scripts/import-example.ts',
        parentOrgNr: '819731322',
        childOrgNr: '930622974',
        line: 6,
      },
    ])
    assert.ok(result.occurrences.some(row => row.propertyName === 'parentOrgNr' && row.orgNr === '819731322'))
  })

  it('builds konsern tree-size expectations from static ownership links', () => {
    const report = buildKonsernTreeSizeExpectations(
      [
        extractOrgNrsFromImportSource('scripts/import-root.ts', `
          const ROOT = '111111111'
          const MID = '222222222'
          const rows = [
            { orgNr: ROOT },
            { orgNr: MID },
            { orgNr: '333333333' },
          ]
          const ownershipLinks = [
            { parentOrgNr: ROOT, childOrgNr: MID, ownershipType: 'subsidiary' },
            { parentOrgNr: MID, childOrgNr: '333333333', ownershipType: 'subsidiary' },
          ]
          const staleOwnershipRecords = [
            { parentOrgNr: ROOT, childOrgNr: '999999999' },
          ]
        `),
      ],
      [{ slug: 'example-root', rootOrgNr: '111111111' }],
    )

    assert.deepEqual(report.roots, [
      {
        slug: 'example-root',
        rootOrgNr: '111111111',
        expectedTreeSize: 3,
        expectedOrgNrs: ['111111111', '222222222', '333333333'],
        sourceScripts: ['scripts/import-root.ts'],
      },
    ])
  })

  it('derives ownership links from companyOwnership upsert loops over static company arrays', () => {
    const result = extractOrgNrsFromImportSource('scripts/import-loop.ts', `
      const PARENT_ORG = '929228723'
      const companies = [
        { name: 'Child A', orgNr: '111111111' },
        { name: 'Child B', orgNr: '222222222' },
      ]

      async function importOwnership() {
        const parentId = await resolveCompanyId(PARENT_ORG)
        for (const c of companies) {
          const childId = await resolveCompanyId(c.orgNr)
          await prisma.companyOwnership.upsert({
            where: {
              parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId },
            },
            update: { ownershipType: 'subsidiary' },
            create: { ownershipType: 'subsidiary' },
          })
        }
      }
    `)

    assert.deepEqual(result.ownershipLinks.map(link => ({
      parentOrgNr: link.parentOrgNr,
      childOrgNr: link.childOrgNr,
    })), [
      { parentOrgNr: '929228723', childOrgNr: '111111111' },
      { parentOrgNr: '929228723', childOrgNr: '222222222' },
    ])
  })

  it('reconciles per script and separates explained exceptions from unexplained missing rows', () => {
    const report = reconcileImportCorpus(
      [
        {
          script: 'scripts/import-a.ts',
          orgNrs: ['111111111', '222222222'],
          occurrences: [],
          ownershipLinks: [],
        },
        {
          script: 'scripts/import-b.ts',
          orgNrs: ['222222222', 'NO-SPECIAL'],
          occurrences: [],
          ownershipLinks: [],
        },
      ],
      ['111111111'],
      [{ orgNr: 'NO-SPECIAL', reason: 'Research construct; not loaded into Company' }],
      '2026-06-11T00:00:00.000Z',
    )

    assert.deepEqual(report.totals, {
      scripts: 2,
      uniqueDefined: 3,
      uniqueFound: 1,
      uniqueMissing: 2,
      uniqueExcepted: 1,
      uniqueUnexplainedMissing: 1,
      dbCompanies: 1,
    })
    assert.deepEqual(report.scripts.map(row => ({
      script: row.script,
      defined: row.defined,
      found: row.found,
      missing: row.missing,
      excepted: row.excepted.map(item => item.orgNr),
      unexplainedMissing: row.unexplainedMissing,
    })), [
      {
        script: 'scripts/import-a.ts',
        defined: 2,
        found: 1,
        missing: ['222222222'],
        excepted: [],
        unexplainedMissing: ['222222222'],
      },
      {
        script: 'scripts/import-b.ts',
        defined: 2,
        found: 0,
        missing: ['222222222', 'NO-SPECIAL'],
        excepted: ['NO-SPECIAL'],
        unexplainedMissing: ['222222222'],
      },
    ])
  })
})
