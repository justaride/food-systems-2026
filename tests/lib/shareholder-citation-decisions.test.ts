import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  AXFOOD_2024_SHAREHOLDER_DECISION,
  BAMA_2024_SHAREHOLDER_DECISION,
  COOP_DANMARK_2024_SHAREHOLDER_DECISION,
  COOP_NORGE_2024_SHAREHOLDER_DECISION,
  HAGAR_2026_SHAREHOLDER_DECISION,
  ICA_GRUPPEN_2024_SHAREHOLDER_DECISION,
  KESKO_2024_SHAREHOLDER_DECISION,
  NORGESGRUPPEN_2024_SHAREHOLDER_DECISION,
  REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION,
  REMA_1000_NORGE_2024_SHAREHOLDER_DECISION,
  REITAN_RETAIL_2024_SHAREHOLDER_DECISION,
  SALLING_GROUP_2024_SHAREHOLDER_DECISION,
  buildShareholderNormalizationPlan,
  buildShareholderSourceCitation,
  buildShareholderUpdateData,
} from '../../scripts/lib/shareholder-citation-decisions'

const currentBamaRows = [
  { id: 'sh-ng', name: 'NorgesGruppen', ownershipPct: '46', shareholderType: 'institutional', isControlling: true },
  { id: 'sh-banan', name: 'Bama-familien', ownershipPct: '34', shareholderType: 'family', isControlling: false },
  { id: 'sh-rema', name: 'REMA 1000', ownershipPct: '20', shareholderType: 'institutional', isControlling: false },
]

describe('shareholder citation decisions', () => {
  it('plans BAMA legal-name normalization without changing ownership percentages', () => {
    const plan = buildShareholderNormalizationPlan(BAMA_2024_SHAREHOLDER_DECISION, currentBamaRows)

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
      fieldPaths: update.fieldPaths,
    })), [
      {
        id: 'sh-ng',
        fromName: 'NorgesGruppen',
        toName: 'NorgesGruppen ASA',
        ownershipPct: '46',
        fieldPaths: ['name', 'ownershipPct'],
      },
      {
        id: 'sh-banan',
        fromName: 'Bama-familien',
        toName: 'AS Banan',
        ownershipPct: '34',
        fieldPaths: ['name', 'ownershipPct'],
      },
      {
        id: 'sh-rema',
        fromName: 'REMA 1000',
        toName: 'REMA Industrier AS',
        ownershipPct: '20',
        fieldPaths: ['name', 'ownershipPct'],
      },
    ])
  })

  it('refuses to plan when the current DB percentage no longer matches the reviewed source packet', () => {
    const changedRows = currentBamaRows.map(row =>
      row.id === 'sh-rema' ? { ...row, ownershipPct: '21' } : row,
    )

    const plan = buildShareholderNormalizationPlan(BAMA_2024_SHAREHOLDER_DECISION, changedRows)

    assert.deepEqual(plan.updates, [])
    assert.deepEqual(plan.issues, [
      'SH-BAMA-2024: expected REMA 1000 ownershipPct 20, found 21',
    ])
  })

  it('builds a primary-source citation with URL, local path and content hash', () => {
    const citation = buildShareholderSourceCitation(BAMA_2024_SHAREHOLDER_DECISION, 'sha256-text')

    assert.equal(citation.sourceClass, 'primary')
    assert.equal(citation.accessedAt, '2026-05-18')
    assert.equal(citation.url, 'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf')
    assert.equal(citation.localPath, 'research/evidence-pack/arsrapporter/text/bama-2024.txt')
    assert.equal(citation.contentHash, 'sha256-text')
    assert.equal(citation.verificationStatus, 'human_verified')
  })

  it('plans NorgesGruppen legal-name update plus missing source shareholder creation', () => {
    const plan = buildShareholderNormalizationPlan(NORGESGRUPPEN_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-joh', name: 'Joh. Johannson-familien', ownershipPct: '74.4', shareholderType: 'family', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      {
        id: 'sh-joh',
        fromName: 'Joh. Johannson-familien',
        toName: 'Joh. Johannson Handel AS',
        ownershipPct: '74.40',
      },
    ])
    assert.deepEqual(plan.creates.map(create => ({
      name: create.name,
      ownershipPct: create.ownershipPct,
      shareholderType: create.shareholderType,
      isControlling: create.isControlling,
      fieldPaths: create.fieldPaths,
    })), [
      {
        name: 'Brødrene Lorentzen AS',
        ownershipPct: '9.00',
        shareholderType: 'family',
        isControlling: false,
        fieldPaths: ['name', 'ownershipPct'],
      },
    ])
  })

  it('can re-plan NorgesGruppen after the missing source shareholder has already been created', () => {
    const plan = buildShareholderNormalizationPlan(NORGESGRUPPEN_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-joh', name: 'Joh. Johannson Handel AS', ownershipPct: '74.40', shareholderType: 'family', isControlling: true },
      { id: 'sh-lorentzen', name: 'Brødrene Lorentzen AS', ownershipPct: '9.00', shareholderType: 'family', isControlling: false },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.creates, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      {
        id: 'sh-joh',
        fromName: 'Joh. Johannson Handel AS',
        toName: 'Joh. Johannson Handel AS',
        ownershipPct: '74.40',
      },
      {
        id: 'sh-lorentzen',
        fromName: 'Brødrene Lorentzen AS',
        toName: 'Brødrene Lorentzen AS',
        ownershipPct: '9.00',
      },
    ])
  })

  it('plans Kesko share-only ownership normalization while tolerating unrelated minority rows', () => {
    const plan = buildShareholderNormalizationPlan(KESKO_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-k-retailers', name: "K-kauppiasliitto ry (K-Retailers' Association)", ownershipPct: '7.50', shareholderType: 'institutional', isControlling: true },
      { id: 'sh-ilmarinen', name: 'Ilmarinen Mutual Pension Insurance', ownershipPct: '3.80', shareholderType: 'institutional', isControlling: false },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
      shareholderType: update.shareholderType,
      isControlling: update.isControlling,
    })), [
      {
        id: 'sh-k-retailers',
        fromName: "K-kauppiasliitto ry (K-Retailers' Association)",
        toName: "K-Retailers' Association and related parties",
        ownershipPct: '7.54',
        shareholderType: 'institutional',
        isControlling: true,
      },
    ])
  })

  it('plans Reitan direct-owner normalization and keeps the family layer in citation notes', () => {
    const plan = buildShareholderNormalizationPlan(REITAN_RETAIL_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-reitan-family', name: 'Reitan-familien (Odd Reitan)', ownershipPct: '100.00', shareholderType: 'family', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
      shareholderType: update.shareholderType,
      isControlling: update.isControlling,
    })), [
      {
        id: 'sh-reitan-family',
        fromName: 'Reitan-familien (Odd Reitan)',
        toName: 'REITAN AS',
        ownershipPct: '100',
        shareholderType: 'institutional',
        isControlling: true,
      },
    ])

    assert.match(REITAN_RETAIL_2024_SHAREHOLDER_DECISION.citationNotes, /family-control layer/)
  })

  it('builds update data that writes the reviewed ownership percentage', () => {
    const plan = buildShareholderNormalizationPlan(KESKO_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-k-retailers', name: "K-kauppiasliitto ry (K-Retailers' Association)", ownershipPct: '7.50', shareholderType: 'institutional', isControlling: true },
    ])

    const data = buildShareholderUpdateData(KESKO_2024_SHAREHOLDER_DECISION, plan.updates[0])

    assert.equal(data.name, "K-Retailers' Association and related parties")
    assert.equal(data.ownershipPct, '7.54')
    assert.equal(data.verificationStatus, 'human_verified')
    assert.equal(data.confidence, 95)
  })

  it('can re-plan a partially applied Kesko row where the source name is already written', () => {
    const plan = buildShareholderNormalizationPlan(KESKO_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-k-retailers', name: "K-Retailers' Association and related parties", ownershipPct: '7.50', shareholderType: 'institutional', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.equal(plan.updates[0].fromName, "K-Retailers' Association and related parties")
    assert.equal(plan.updates[0].toName, "K-Retailers' Association and related parties")
    assert.equal(plan.updates[0].ownershipPct, '7.54')
  })

  it('plans Axfood shareholder table normalization from the annual report', () => {
    const plan = buildShareholderNormalizationPlan(AXFOOD_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-axel', name: 'Axel Johnson AB', ownershipPct: '50.10', shareholderType: 'family', isControlling: true },
      { id: 'sh-swedbank', name: 'Swedbank Robur Fonder', ownershipPct: '5.20', shareholderType: 'institutional', isControlling: false },
      { id: 'sh-handelsbanken', name: 'Handelsbanken Fonder', ownershipPct: '3.10', shareholderType: 'institutional', isControlling: false },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      { id: 'sh-axel', toName: 'Ax:son Johnson (family and companies)', ownershipPct: '50.10' },
      { id: 'sh-swedbank', toName: 'Swedbank Robur Funds', ownershipPct: '4.00' },
      { id: 'sh-handelsbanken', toName: 'Handelsbanken Funds', ownershipPct: '2.40' },
    ])
  })

  it('plans Coop Danmark split ownership update and missing Coop amba creation', () => {
    const plan = buildShareholderNormalizationPlan(COOP_DANMARK_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-coop-old', name: 'Coop amba (2 mill. medlemmer)', ownershipPct: '100.00', shareholderType: 'cooperative', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
      isControlling: update.isControlling,
    })), [
      { id: 'sh-coop-old', toName: 'OK a.m.b.a.', ownershipPct: '50.82', isControlling: true },
    ])
    assert.deepEqual(plan.creates.map(create => ({
      name: create.name,
      ownershipPct: create.ownershipPct,
      shareholderType: create.shareholderType,
      isControlling: create.isControlling,
    })), [
      { name: 'Coop amba', ownershipPct: '49.18', shareholderType: 'cooperative', isControlling: false },
    ])
  })

  it('plans Coop Norge cooperative ownership from the annual report', () => {
    const plan = buildShareholderNormalizationPlan(COOP_NORGE_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-coop-no', name: 'Samvirkelagene (1,9 mill. medlemmer)', ownershipPct: '100.00', shareholderType: 'cooperative', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
      shareholderType: update.shareholderType,
      isControlling: update.isControlling,
    })), [
      {
        id: 'sh-coop-no',
        fromName: 'Samvirkelagene (1,9 mill. medlemmer)',
        toName: 'Samvirkelagene',
        ownershipPct: '100',
        shareholderType: 'cooperative',
        isControlling: true,
      },
    ])
  })

  it('plans Salling Group foundation ownership from the annual report', () => {
    const plan = buildShareholderNormalizationPlan(SALLING_GROUP_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-salling', name: 'Købmand Herman Sallings Fond', ownershipPct: '100.00', shareholderType: 'foundation', isControlling: true },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      fromName: update.fromName,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      {
        id: 'sh-salling',
        fromName: 'Købmand Herman Sallings Fond',
        toName: 'Salling Foundations',
        ownershipPct: '100',
      },
    ])
  })

  it('plans REMA 1000 subsidiary ownership from the Reitan Retail annual report', () => {
    const norwegianPlan = buildShareholderNormalizationPlan(REMA_1000_NORGE_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-rema-no', name: 'Reitan Retail AS', ownershipPct: '100.00', shareholderType: 'institutional', isControlling: true },
    ])
    const danishPlan = buildShareholderNormalizationPlan(REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-rema-dk', name: 'Reitan Retail AS (Norge)', ownershipPct: '100.00', shareholderType: 'institutional', isControlling: true },
    ])

    assert.deepEqual(norwegianPlan.issues, [])
    assert.deepEqual(danishPlan.issues, [])
    assert.deepEqual(norwegianPlan.updates.map(update => ({
      id: update.id,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      { id: 'sh-rema-no', toName: 'Reitan Retail AS', ownershipPct: '100' },
    ])
    assert.deepEqual(danishPlan.updates.map(update => ({
      id: update.id,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      { id: 'sh-rema-dk', toName: 'Reitan Retail AS', ownershipPct: '100' },
    ])
  })

  it('plans ICA Gruppen share-only ownership normalization with vote shares in notes', () => {
    const plan = buildShareholderNormalizationPlan(ICA_GRUPPEN_2024_SHAREHOLDER_DECISION, [
      { id: 'sh-ihf', name: 'ICA-handlarnas Förbund', ownershipPct: '87.00', shareholderType: 'institutional', isControlling: true },
      { id: 'sh-amf', name: 'AMF Pensionsförsäkring AB', ownershipPct: '13.00', shareholderType: 'institutional', isControlling: false },
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.updates.map(update => ({
      id: update.id,
      toName: update.toName,
      ownershipPct: update.ownershipPct,
    })), [
      { id: 'sh-ihf', toName: 'ICA-handlarnas Förbund (IHF)', ownershipPct: '85.43' },
      { id: 'sh-amf', toName: 'AMF Tjänstepension (AMF)', ownershipPct: '12.45' },
    ])
    assert.deepEqual(plan.creates.map(create => ({
      name: create.name,
      ownershipPct: create.ownershipPct,
    })), [
      { name: 'ICA retailers', ownershipPct: '2.11' },
    ])
    assert.match(ICA_GRUPPEN_2024_SHAREHOLDER_DECISION.citationNotes, /vote/)
  })

  it('plans Hagar current weekly top-20 snapshot with rank and share-count metadata', () => {
    const plan = buildShareholderNormalizationPlan(HAGAR_2026_SHAREHOLDER_DECISION, [
      { id: 'sh-old-fjarfesting', name: 'Fjarfesting hf', ownershipPct: '29.90', shareholderType: 'institutional', isControlling: true },
      { id: 'sh-lifeyrir', name: 'Lífeyrissjóður verzlunarmanna', ownershipPct: '12.00', shareholderType: 'institutional', isControlling: false },
    ])

    assert.deepEqual(plan.issues, [])
    assert.equal(plan.updates.length, 2)
    assert.equal(plan.creates.length, 18)
    assert.deepEqual(plan.updates[0], {
      id: 'sh-old-fjarfesting',
      fromName: 'Fjarfesting hf',
      toName: 'Gildi - lífeyrissjóður',
      ownershipPct: '16.26',
      shareholderType: 'institutional',
      isControlling: false,
      fieldPaths: ['name', 'ownershipPct', 'sourceRank', 'shareCount', 'sourceObservedAt', 'sourceUpdatedAt', 'sourceBasis'],
      sourceRank: 1,
      shareCount: '179893219',
      sourceObservedAt: '2026-05-18',
      sourceUpdatedAt: '2026-05-14',
      sourceBasis: 'current_weekly_top20',
    })
    assert.deepEqual(plan.creates[0], {
      name: 'Lífeyrissj.starfsm.rík. A-deild',
      ownershipPct: '11.33',
      shareholderType: 'institutional',
      isControlling: false,
      fieldPaths: ['name', 'ownershipPct', 'sourceRank', 'shareCount', 'sourceObservedAt', 'sourceUpdatedAt', 'sourceBasis'],
      sourceRank: 3,
      shareCount: '125387598',
      sourceObservedAt: '2026-05-18',
      sourceUpdatedAt: '2026-05-14',
      sourceBasis: 'current_weekly_top20',
    })
  })

  it('can re-plan an already-applied Hagar top-20 snapshot without duplicate creates', () => {
    const plan = buildShareholderNormalizationPlan(HAGAR_2026_SHAREHOLDER_DECISION, [
      { id: 'sh-rank-1', name: 'Gildi - lífeyrissjóður', ownershipPct: '16.26', shareholderType: 'institutional', isControlling: false },
      { id: 'sh-rank-2', name: 'Lífeyrissjóður verzlunarmanna', ownershipPct: '12.37', shareholderType: 'institutional', isControlling: false },
      ...HAGAR_2026_SHAREHOLDER_DECISION.createTargets!.map(target => ({
        id: `sh-rank-${target.sourceRank}`,
        name: target.sourceName,
        ownershipPct: target.ownershipPct,
        shareholderType: target.shareholderType,
        isControlling: target.isControlling,
      })),
    ])

    assert.deepEqual(plan.issues, [])
    assert.deepEqual(plan.creates, [])
    assert.equal(plan.updates.length, 20)
    assert.deepEqual(plan.updates.at(-1), {
      id: 'sh-rank-20',
      fromName: 'Vanguard Fiduciary Trust Compa',
      toName: 'Vanguard Fiduciary Trust Compa',
      ownershipPct: '0.65',
      shareholderType: 'foreign',
      isControlling: false,
      fieldPaths: ['name', 'ownershipPct', 'sourceRank', 'shareCount', 'sourceObservedAt', 'sourceUpdatedAt', 'sourceBasis'],
      sourceRank: 20,
      shareCount: '7149122',
      sourceObservedAt: '2026-05-18',
      sourceUpdatedAt: '2026-05-14',
      sourceBasis: 'current_weekly_top20',
    })
  })
})
