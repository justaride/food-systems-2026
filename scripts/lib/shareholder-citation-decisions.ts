import type { RequiredCitation } from './import-helpers'

export type CurrentShareholderRow = {
  id: string
  name: string
  ownershipPct: string | number | null
  shareholderType?: string | null
  isControlling?: boolean
}

export type ShareholderNormalizationTarget = {
  expectedCurrentName: string
  expectedCurrentPct?: string
  sourceName: string
  ownershipPct: string
  shareholderType?: string
  isControlling?: boolean
  sourceRank?: number
  shareCount?: string
}

export type ShareholderCreateTarget = {
  sourceName: string
  ownershipPct: string
  shareholderType?: string
  isControlling?: boolean
  sourceRank?: number
  shareCount?: string
}

export type ShareholderNormalizationDecision = {
  actionId: string
  companyName: string
  accessedAt: string
  sourceUrl: string
  localPath: string
  citationText: string
  citationNotes: string
  captureMethod?: string
  confidence: number
  sourceBasis?: string
  sourceObservedAt?: string
  sourceUpdatedAt?: string
  targets: ShareholderNormalizationTarget[]
  createTargets?: ShareholderCreateTarget[]
  allowUnmatchedRows?: boolean
}

export type ShareholderNormalizationUpdate = {
  id: string
  fromName: string
  toName: string
  ownershipPct: string
  shareholderType?: string
  isControlling?: boolean
  sourceRank?: number
  shareCount?: string
  sourceObservedAt?: string
  sourceUpdatedAt?: string
  sourceBasis?: string
  fieldPaths: string[]
}

export type ShareholderNormalizationCreate = {
  name: string
  ownershipPct: string
  shareholderType?: string
  isControlling?: boolean
  sourceRank?: number
  shareCount?: string
  sourceObservedAt?: string
  sourceUpdatedAt?: string
  sourceBasis?: string
  fieldPaths: string[]
}

export type ShareholderNormalizationPlan = {
  actionId: string
  companyName: string
  updates: ShareholderNormalizationUpdate[]
  creates: ShareholderNormalizationCreate[]
  issues: string[]
}

export type ShareholderUpdateData = {
  name: string
  ownershipPct: string
  shareholderType?: string
  isControlling?: boolean
  sourceRank?: number
  shareCount?: bigint
  sourceObservedAt?: Date
  sourceUpdatedAt?: Date
  sourceBasis?: string
  verifiedAt: Date
  verificationStatus: 'human_verified'
  confidence: number
}

export const BAMA_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-BAMA-2024',
  companyName: 'BAMA Gruppen AS',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
  localPath: 'research/evidence-pack/arsrapporter/text/bama-2024.txt',
  citationText: 'BAMA Gruppen AS. (2024). Års- og bærekraftsrapport 2024.',
  citationNotes: 'Verifies ownership: NorgesGruppen ASA 46%, AS Banan 34%, REMA Industrier AS 20%. Local text references: lines 615-618 and 7242-7258.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'NorgesGruppen',
      sourceName: 'NorgesGruppen ASA',
      ownershipPct: '46',
      shareholderType: 'institutional',
      isControlling: true,
    },
    {
      expectedCurrentName: 'Bama-familien',
      sourceName: 'AS Banan',
      ownershipPct: '34',
      shareholderType: 'family',
      isControlling: false,
    },
    {
      expectedCurrentName: 'REMA 1000',
      sourceName: 'REMA Industrier AS',
      ownershipPct: '20',
      shareholderType: 'institutional',
      isControlling: false,
    },
  ],
}

export const NORGESGRUPPEN_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-NG-2024',
  companyName: 'NorgesGruppen ASA',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.norgesgruppen.no/finans/finans-hjem/rapporter/',
  localPath: 'research/evidence-pack/arsrapporter/text/norgesgruppen-2024.txt',
  citationText: 'NorgesGruppen ASA. (2024). Års- og bærekraftsrapport 2024, aksjonærtabell.',
  citationNotes: 'Verifies shareholder table: Joh. Johannson Handel AS 74.40% and Brødrene Lorentzen AS 9.00%. Local text reference: lines 10168-10178.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'Joh. Johannson-familien',
      expectedCurrentPct: '74.4',
      sourceName: 'Joh. Johannson Handel AS',
      ownershipPct: '74.40',
      shareholderType: 'family',
      isControlling: true,
    },
  ],
  createTargets: [
    {
      sourceName: 'Brødrene Lorentzen AS',
      ownershipPct: '9.00',
      shareholderType: 'family',
      isControlling: false,
    },
  ],
}

export const KESKO_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-KESKO-2024',
  companyName: 'Kesko Oyj',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.kesko.fi/en/media/news-and-releases/stock-exchange-releases/2025/keskos-2024-annual-report-has-been-published/',
  localPath: 'research/evidence-pack/arsrapporter/text/kesko-annual-report-2024.txt',
  citationText: 'Kesko Oyj. (2024). Annual Report 2024, K-Retailers ownership.',
  citationNotes: "Shareholder.ownershipPct is treated as share-only for this row. The source says K-Retailers' Association with related parties controls 7.54% of shares and 19.56% of votes. Local text reference: lines 1077-1086.",
  confidence: 95,
  allowUnmatchedRows: true,
  targets: [
    {
      expectedCurrentName: "K-kauppiasliitto ry (K-Retailers' Association)",
      expectedCurrentPct: '7.50',
      sourceName: "K-Retailers' Association and related parties",
      ownershipPct: '7.54',
      shareholderType: 'institutional',
      isControlling: true,
    },
  ],
}

export const REITAN_RETAIL_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-REITAN-2024',
  companyName: 'Reitan Retail AS',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.reitanretail.no/en/about/reports',
  localPath: 'research/evidence-pack/arsrapporter/text/reitan-retail-2024.txt',
  citationText: 'Reitan Retail AS. (2024). Annual and sustainability report 2024, ownership and group organisation.',
  citationNotes: 'Verifies the direct owner as REITAN AS 100%. The family-control layer is retained in notes: Odd Reitan, Ole Robert Reitan and Magnus Reitan with family each own 33.3% of REITAN AS through holding companies. Local text reference: lines 1428-1438.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'Reitan-familien (Odd Reitan)',
      expectedCurrentPct: '100',
      sourceName: 'REITAN AS',
      ownershipPct: '100',
      shareholderType: 'institutional',
      isControlling: true,
    },
  ],
}

export const AXFOOD_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-AXFOOD-2024',
  companyName: 'Axfood AB',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-2024/',
  localPath: 'research/evidence-pack/arsrapporter/text/axfood-annual-report-2024.txt',
  citationText: 'Axfood AB. (2024). Annual and Sustainability Report 2024, ten largest shareholders.',
  citationNotes: 'Verifies shareholder table: Ax:son Johnson (family and companies) 50.1%, Swedbank Robur Funds 4.0%, and Handelsbanken Funds 2.4%. Local text reference: lines 8369-8374.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'Axel Johnson AB',
      expectedCurrentPct: '50.10',
      sourceName: 'Ax:son Johnson (family and companies)',
      ownershipPct: '50.10',
      shareholderType: 'family',
      isControlling: true,
    },
    {
      expectedCurrentName: 'Swedbank Robur Fonder',
      expectedCurrentPct: '5.20',
      sourceName: 'Swedbank Robur Funds',
      ownershipPct: '4.00',
      shareholderType: 'institutional',
      isControlling: false,
    },
    {
      expectedCurrentName: 'Handelsbanken Fonder',
      expectedCurrentPct: '3.10',
      sourceName: 'Handelsbanken Funds',
      ownershipPct: '2.40',
      shareholderType: 'institutional',
      isControlling: false,
    },
  ],
}

export const COOP_DANMARK_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-COOP-DK-2024',
  companyName: 'Coop Danmark A/S',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://coop.dk/kontakt/pressekontakt/aarsrapporter/',
  localPath: 'research/evidence-pack/arsrapporter/text/coop-danmark-2024.txt',
  citationText: 'Coop Danmark A/S. (2024). Årsrapport 2024, ejerforhold.',
  citationNotes: 'Verifies ownership at end-2024: OK a.m.b.a. 50.82% and Coop amba 49.18%. Local text reference: lines 157-163.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'Coop amba (2 mill. medlemmer)',
      expectedCurrentPct: '100',
      sourceName: 'OK a.m.b.a.',
      ownershipPct: '50.82',
      shareholderType: 'cooperative',
      isControlling: true,
    },
  ],
  createTargets: [
    {
      sourceName: 'Coop amba',
      ownershipPct: '49.18',
      shareholderType: 'cooperative',
      isControlling: false,
    },
  ],
}

export const COOP_NORGE_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-COOP-NO-2024',
  companyName: 'Coop Norge SA',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.coop.no/om-coop/aarsrapporter',
  localPath: 'research/evidence-pack/arsrapporter/text/coop-norge-2024.txt',
  citationText: 'Coop Norge SA. (2024). Års- og bærekraftsrapport 2024, samvirkeeierskap.',
  citationNotes: 'Verifies that Coop Norge SA is the joint organization owned by the cooperative societies that are also members. Local text references: lines 128-151, 176-180 and 242.',
  confidence: 95,
  sourceBasis: 'annual_report_2024',
  targets: [
    {
      expectedCurrentName: 'Samvirkelagene (1,9 mill. medlemmer)',
      expectedCurrentPct: '100',
      sourceName: 'Samvirkelagene',
      ownershipPct: '100',
      shareholderType: 'cooperative',
      isControlling: true,
    },
  ],
}

export const SALLING_GROUP_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-SALLING-2024',
  companyName: 'Salling Group A/S',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://sallinggroup.com/en/publications',
  localPath: 'research/evidence-pack/arsrapporter/text/salling-group-2024.txt',
  citationText: 'Salling Group A/S. (2024). Annual Report 2024, ownership.',
  citationNotes: 'Verifies that Salling Group is 100% owned by the Salling Foundations. Local text references: lines 534-544 and 555-562. The DB row is normalized from the single-foundation shorthand to the source wording.',
  confidence: 95,
  sourceBasis: 'annual_report_2024',
  targets: [
    {
      expectedCurrentName: 'Købmand Herman Sallings Fond',
      expectedCurrentPct: '100',
      sourceName: 'Salling Foundations',
      ownershipPct: '100',
      shareholderType: 'foundation',
      isControlling: true,
    },
  ],
}

export const REMA_1000_NORGE_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-REMA-NO-2024',
  companyName: 'REMA 1000 Norge AS',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.reitanretail.no/en/about/reports',
  localPath: 'research/evidence-pack/arsrapporter/text/reitan-retail-2024.txt',
  citationText: 'Reitan Retail AS. (2024). Annual and sustainability report 2024, investments in subsidiaries.',
  citationNotes: 'Verifies REMA 1000 Norge AS as a 100% owned subsidiary in the Reitan Retail parent-company investment note. Local text reference: lines 8984-8992.',
  confidence: 95,
  sourceBasis: 'annual_report_2024',
  targets: [
    {
      expectedCurrentName: 'Reitan Retail AS',
      expectedCurrentPct: '100',
      sourceName: 'Reitan Retail AS',
      ownershipPct: '100',
      shareholderType: 'institutional',
      isControlling: true,
    },
  ],
}

export const REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-REMA-DK-2024',
  companyName: 'REMA 1000 A/S',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.reitanretail.no/en/about/reports',
  localPath: 'research/evidence-pack/arsrapporter/text/reitan-retail-2024.txt',
  citationText: 'Reitan Retail AS. (2024). Annual and sustainability report 2024, investments in subsidiaries.',
  citationNotes: 'Verifies REMA 1000 Danmark A/S as a 100% owned subsidiary in the Reitan Retail parent-company investment note. Local text reference: lines 8984-8992.',
  confidence: 95,
  sourceBasis: 'annual_report_2024',
  targets: [
    {
      expectedCurrentName: 'Reitan Retail AS (Norge)',
      expectedCurrentPct: '100',
      sourceName: 'Reitan Retail AS',
      ownershipPct: '100',
      shareholderType: 'institutional',
      isControlling: true,
    },
  ],
}

export const ICA_GRUPPEN_2024_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-ICA-2024',
  companyName: 'ICA Gruppen AB',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.icagruppen.se/globalassets/xx.-arsredovisning-2024/250221_icagruppen_annual_report_2024.pdf',
  localPath: 'research/evidence-pack/arsrapporter/text/ica-gruppen-annual-report-2024.txt',
  citationText: 'ICA Gruppen AB. (2024). Annual Report 2024, shareholder share and vote split.',
  citationNotes: 'Shareholder.ownershipPct is treated as share-only for these rows. The source says IHF 85.43% shares/87.07% votes, AMF 12.45% shares/12.72% votes, and ICA retailers 2.11% shares/0.22% votes. Local text reference: lines 9994-10014.',
  confidence: 95,
  targets: [
    {
      expectedCurrentName: 'ICA-handlarnas Förbund',
      expectedCurrentPct: '87',
      sourceName: 'ICA-handlarnas Förbund (IHF)',
      ownershipPct: '85.43',
      shareholderType: 'institutional',
      isControlling: true,
    },
    {
      expectedCurrentName: 'AMF Pensionsförsäkring AB',
      expectedCurrentPct: '13',
      sourceName: 'AMF Tjänstepension (AMF)',
      ownershipPct: '12.45',
      shareholderType: 'institutional',
      isControlling: false,
    },
  ],
  createTargets: [
    {
      sourceName: 'ICA retailers',
      ownershipPct: '2.11',
      shareholderType: 'institutional',
      isControlling: false,
    },
  ],
}

export const HAGAR_2026_SHAREHOLDER_DECISION: ShareholderNormalizationDecision = {
  actionId: 'SH-HAGAR-2026',
  companyName: 'Hagar hf',
  accessedAt: '2026-05-18',
  sourceUrl: 'https://www.hagar.is/en/investors/shareholders-information/shareholders-list/',
  localPath: 'research/evidence-pack/shareholders/hagar-shareholders-list-2026-05-18.csv',
  citationText: 'Hagar hf. (2026). Shareholders list, top 20 shareholders.',
  citationNotes: 'Official current top-20 shareholder list observed 2026-05-18 and last updated 2026-05-14. The list is updated weekly and is imported as a current weekly top-20 snapshot, not as fiscal-year ownership. Local CSV/HTML snapshots are archived under research/evidence-pack/shareholders/.',
  captureMethod: 'browser_csv_snapshot',
  confidence: 90,
  sourceBasis: 'current_weekly_top20',
  sourceObservedAt: '2026-05-18',
  sourceUpdatedAt: '2026-05-14',
  allowUnmatchedRows: true,
  targets: [
    {
      expectedCurrentName: 'Fjarfesting hf',
      expectedCurrentPct: '29.90',
      sourceName: 'Gildi - lífeyrissjóður',
      ownershipPct: '16.26',
      shareholderType: 'institutional',
      isControlling: false,
      sourceRank: 1,
      shareCount: '179893219',
    },
    {
      expectedCurrentName: 'Lífeyrissjóður verzlunarmanna',
      expectedCurrentPct: '12.00',
      sourceName: 'Lífeyrissjóður verzlunarmanna',
      ownershipPct: '12.37',
      shareholderType: 'institutional',
      isControlling: false,
      sourceRank: 2,
      shareCount: '136912404',
    },
  ],
  createTargets: [
    { sourceRank: 3, sourceName: 'Lífeyrissj.starfsm.rík. A-deild', shareCount: '125387598', ownershipPct: '11.33', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 4, sourceName: 'Brú Lífeyrissjóður starfs sveit', shareCount: '92625404', ownershipPct: '8.37', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 5, sourceName: 'Kaldbakur ehf.', shareCount: '90000000', ownershipPct: '8.13', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 6, sourceName: 'Birta lífeyrissjóður', shareCount: '71842636', ownershipPct: '6.49', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 7, sourceName: 'Festa - lífeyrissjóður', shareCount: '46149169', ownershipPct: '4.17', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 8, sourceName: 'Stapi lífeyrissjóður', shareCount: '32760917', ownershipPct: '2.96', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 9, sourceName: 'Söfnunarsjóður lífeyrisréttinda', shareCount: '26304824', ownershipPct: '2.38', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 10, sourceName: 'Almenni-Lífsverk lífeyrissjóður', shareCount: '26267240', ownershipPct: '2.37', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 11, sourceName: 'Lífeyrissj.starfsm.rík. B-deild', shareCount: '19779633', ownershipPct: '1.79', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 12, sourceName: 'Hagar hf.', shareCount: '17767034', ownershipPct: '1.61', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 13, sourceName: 'Brú R deild', shareCount: '15973187', ownershipPct: '1.44', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 14, sourceName: 'Vanguard Total International S', shareCount: '14021015', ownershipPct: '1.27', shareholderType: 'foreign', isControlling: false },
    { sourceRank: 15, sourceName: 'Vanguard Emerging Markets Stock', shareCount: '13244702', ownershipPct: '1.20', shareholderType: 'foreign', isControlling: false },
    { sourceRank: 16, sourceName: 'Folketrygdfondet', shareCount: '11348278', ownershipPct: '1.03', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 17, sourceName: 'Stefnir - Innlend hlutabréf hs.', shareCount: '10446970', ownershipPct: '0.94', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 18, sourceName: 'Sp/F NM Holding', shareCount: '9177019', ownershipPct: '0.83', shareholderType: 'foreign', isControlling: false },
    { sourceRank: 19, sourceName: 'Frjálsi lífeyrissjóðurinn', shareCount: '8624995', ownershipPct: '0.78', shareholderType: 'institutional', isControlling: false },
    { sourceRank: 20, sourceName: 'Vanguard Fiduciary Trust Compa', shareCount: '7149122', ownershipPct: '0.65', shareholderType: 'foreign', isControlling: false },
  ],
}

export function buildShareholderNormalizationPlan(
  decision: ShareholderNormalizationDecision,
  currentRows: CurrentShareholderRow[],
): ShareholderNormalizationPlan {
  const issues: string[] = []
  const updates: ShareholderNormalizationUpdate[] = []
  const creates: ShareholderNormalizationCreate[] = []

  for (const target of decision.targets) {
    const row = currentRows.find(candidate => candidate.name === target.expectedCurrentName)
      ?? currentRows.find(candidate => candidate.name === target.sourceName)
    if (!row) {
      issues.push(`${decision.actionId}: expected current shareholder ${target.expectedCurrentName} was not found`)
      continue
    }

    const currentPct = normalizePct(row.ownershipPct)
    const expectedCurrentPct = normalizePct(target.expectedCurrentPct ?? target.ownershipPct)
    const sourcePct = normalizePct(target.ownershipPct)
    const acceptedPcts = [...new Set([expectedCurrentPct, sourcePct])]
    if (!acceptedPcts.includes(currentPct)) {
      issues.push(`${decision.actionId}: expected ${target.expectedCurrentName} ownershipPct ${acceptedPcts.join(' or ')}, found ${currentPct || '<blank>'}`)
      continue
    }

    updates.push({
      id: row.id,
      fromName: row.name,
      toName: target.sourceName,
      ownershipPct: target.ownershipPct,
      shareholderType: target.shareholderType ?? row.shareholderType ?? undefined,
      isControlling: target.isControlling ?? row.isControlling,
      sourceRank: target.sourceRank,
      shareCount: target.shareCount,
      sourceObservedAt: decision.sourceObservedAt,
      sourceUpdatedAt: decision.sourceUpdatedAt,
      sourceBasis: decision.sourceBasis,
      fieldPaths: buildShareholderFieldPaths(target, decision),
    })
  }

  for (const target of decision.createTargets ?? []) {
    const existingRow = currentRows.find(candidate => candidate.name === target.sourceName)
    if (!existingRow) {
      creates.push({
        name: target.sourceName,
        ownershipPct: target.ownershipPct,
        shareholderType: target.shareholderType,
        isControlling: target.isControlling,
        sourceRank: target.sourceRank,
        shareCount: target.shareCount,
        sourceObservedAt: decision.sourceObservedAt,
        sourceUpdatedAt: decision.sourceUpdatedAt,
        sourceBasis: decision.sourceBasis,
        fieldPaths: buildShareholderFieldPaths(target, decision),
      })
      continue
    }

    const currentPct = normalizePct(existingRow.ownershipPct)
    const sourcePct = normalizePct(target.ownershipPct)
    if (currentPct !== sourcePct) {
      issues.push(`${decision.actionId}: existing source shareholder ${target.sourceName} ownershipPct ${sourcePct}, found ${currentPct || '<blank>'}`)
      continue
    }

    updates.push({
      id: existingRow.id,
      fromName: existingRow.name,
      toName: target.sourceName,
      ownershipPct: target.ownershipPct,
      shareholderType: target.shareholderType ?? existingRow.shareholderType ?? undefined,
      isControlling: target.isControlling ?? existingRow.isControlling,
      sourceRank: target.sourceRank,
      shareCount: target.shareCount,
      sourceObservedAt: decision.sourceObservedAt,
      sourceUpdatedAt: decision.sourceUpdatedAt,
      sourceBasis: decision.sourceBasis,
      fieldPaths: buildShareholderFieldPaths(target, decision),
    })
  }

  if (!decision.allowUnmatchedRows) {
    const extraRows = currentRows.filter(row =>
      !decision.targets.some(target =>
        target.expectedCurrentName === row.name || target.sourceName === row.name,
      ) && !(decision.createTargets ?? []).some(target =>
        target.sourceName === row.name,
      ),
    )
    for (const row of extraRows) {
      issues.push(`${decision.actionId}: unexpected current shareholder ${row.name}`)
    }
  }

  return {
    actionId: decision.actionId,
    companyName: decision.companyName,
    updates: issues.length === 0 ? updates : [],
    creates: issues.length === 0 ? creates : [],
    issues,
  }
}

export function buildShareholderSourceCitation(
  decision: ShareholderNormalizationDecision,
  contentHash: string,
): RequiredCitation {
  return {
    sourceClass: 'primary',
    citationText: decision.citationText,
    accessedAt: decision.accessedAt,
    url: decision.sourceUrl,
    localPath: decision.localPath,
    contentHash,
    captureMethod: decision.captureMethod ?? 'local_text_extract',
    verificationStatus: 'human_verified',
    verifiedAt: `${decision.accessedAt}T00:00:00.000Z`,
    verifiedBy: 'Codex',
    confidence: decision.confidence,
    notes: decision.citationNotes,
  }
}

export function buildShareholderUpdateData(
  decision: ShareholderNormalizationDecision,
  update: ShareholderNormalizationUpdate,
): ShareholderUpdateData {
  return {
    name: update.toName,
    ownershipPct: update.ownershipPct,
    shareholderType: update.shareholderType,
    isControlling: update.isControlling,
    sourceRank: update.sourceRank,
    shareCount: update.shareCount ? BigInt(update.shareCount) : undefined,
    sourceObservedAt: update.sourceObservedAt ? new Date(`${update.sourceObservedAt}T00:00:00.000Z`) : undefined,
    sourceUpdatedAt: update.sourceUpdatedAt ? new Date(`${update.sourceUpdatedAt}T00:00:00.000Z`) : undefined,
    sourceBasis: update.sourceBasis,
    verifiedAt: new Date(`${decision.accessedAt}T00:00:00.000Z`),
    verificationStatus: 'human_verified',
    confidence: decision.confidence,
  }
}

function buildShareholderFieldPaths(
  target: ShareholderNormalizationTarget | ShareholderCreateTarget,
  decision: ShareholderNormalizationDecision,
): string[] {
  const paths = ['name', 'ownershipPct']
  if (target.sourceRank !== undefined) paths.push('sourceRank')
  if (target.shareCount !== undefined) paths.push('shareCount')
  if (decision.sourceObservedAt) paths.push('sourceObservedAt')
  if (decision.sourceUpdatedAt) paths.push('sourceUpdatedAt')
  if (decision.sourceBasis) paths.push('sourceBasis')
  return paths
}

function normalizePct(value: string | number | null): string {
  if (value === null) return ''
  const text = String(value).trim()
  if (!text) return ''
  if (!text.includes('.')) return text
  return text.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '')
}
