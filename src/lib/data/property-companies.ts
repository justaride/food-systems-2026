export type PropertyCompanyKjede = 'norgesgruppen' | 'reitan' | 'coop'

export type PropertyCompanyType =
  | 'forvaltning'
  | 'holding'
  | 'kapital'
  | 'utvikling'
  | 'regional'
  | 'hovedselskap'
  | 'detalj'
  | 'drift'

export type PropertyCompany = {
  orgNr: string
  name: string
  kjede: PropertyCompanyKjede
  type: PropertyCompanyType
  totalAssetsNok: number
  equityNok: number
  revenueNok: number
  operatingResultNok: number
  year: number
}

export const PROPERTY_COMPANY_KJEDE_LABELS: Record<PropertyCompanyKjede, string> = {
  norgesgruppen: 'NorgesGruppen',
  reitan: 'Reitan',
  coop: 'Coop',
}

export const PROPERTY_COMPANY_TYPE_LABELS: Record<PropertyCompanyType, string> = {
  forvaltning: 'Forvaltning',
  holding: 'Holding',
  kapital: 'Kapital',
  utvikling: 'Utvikling',
  regional: 'Regional',
  hovedselskap: 'Hovedselskap',
  detalj: 'Detalj',
  drift: 'Drift',
}

export const PROPERTY_COMPANIES: PropertyCompany[] = [
  // NorgesGruppen
  { orgNr: '976542223', name: 'NorgesGruppen Eiendom AS', kjede: 'norgesgruppen', type: 'forvaltning', totalAssetsNok: 37_280_000, equityNok: 15_085_000, revenueNok: 30_339_000, operatingResultNok: -18_162_000, year: 2024 },
  { orgNr: '997747054', name: 'NorgesGruppen Eiendom Holding AS', kjede: 'norgesgruppen', type: 'holding', totalAssetsNok: 4_069_233_000, equityNok: 4_061_158_000, revenueNok: 0, operatingResultNok: -56_000, year: 2024 },
  { orgNr: '989009001', name: 'NorgesGruppen Eiendomskapital AS', kjede: 'norgesgruppen', type: 'kapital', totalAssetsNok: 1_159_749_000, equityNok: 1_069_911_000, revenueNok: 0, operatingResultNok: -135_000, year: 2024 },
  { orgNr: '995666553', name: 'NorgesGruppen Eiendomsutvikling AS', kjede: 'norgesgruppen', type: 'utvikling', totalAssetsNok: 29_297_000, equityNok: 28_391_000, revenueNok: 7_181_000, operatingResultNok: 375_000, year: 2024 },
  { orgNr: '881452642', name: 'NorgesGruppen Eiendom Buskerud AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 229_954_000, equityNok: 125_063_000, revenueNok: 0, operatingResultNok: -75_000, year: 2024 },
  { orgNr: '997732863', name: 'NorgesGruppen Eiendom Region AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 2_371_785_000, equityNok: 2_371_431_000, revenueNok: 0, operatingResultNok: -44_000, year: 2024 },
  { orgNr: '935480507', name: 'NorgesGruppen Eiendom Midt-Norge AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 393_021_000, equityNok: 268_242_000, revenueNok: 0, operatingResultNok: -350_000, year: 2024 },
  { orgNr: '882578402', name: 'NorgesGruppen Detalj AS', kjede: 'norgesgruppen', type: 'detalj', totalAssetsNok: 3_331_299_000, equityNok: 1_124_819_000, revenueNok: 43_668_000, operatingResultNok: -5_464_000, year: 2024 },
  { orgNr: '926994387', name: 'NorgesGruppen Agder AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 260_571_000, equityNok: 231_390_000, revenueNok: 214_017_000, operatingResultNok: -424_000, year: 2024 },
  { orgNr: '977389666', name: 'NorgesGruppen Vest AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 287_371_000, equityNok: 258_868_000, revenueNok: 385_922_000, operatingResultNok: -1_120_000, year: 2024 },
  { orgNr: '987570067', name: 'NorgesGruppen Møre AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 111_832_000, equityNok: 109_566_000, revenueNok: 57_644_000, operatingResultNok: 75_000, year: 2025 },
  { orgNr: '990236186', name: 'NorgesGruppen Nord AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 75_590_000, equityNok: 71_872_000, revenueNok: 114_845_000, operatingResultNok: -464_000, year: 2024 },
  { orgNr: '975960714', name: 'NorgesGruppen Vestfold Telemark AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 213_649_000, equityNok: 192_430_000, revenueNok: 272_233_000, operatingResultNok: -897_000, year: 2024 },
  { orgNr: '811793442', name: 'NorgesGruppen Midt-Norge AS', kjede: 'norgesgruppen', type: 'regional', totalAssetsNok: 120_094_000, equityNok: 100_296_000, revenueNok: 187_090_000, operatingResultNok: 201_000, year: 2024 },

  // Reitan
  { orgNr: '915994415', name: 'Reitan Eiendom AS', kjede: 'reitan', type: 'hovedselskap', totalAssetsNok: 15_980_000_000, equityNok: 14_329_000_000, revenueNok: 24_000_000, operatingResultNok: -57_000_000, year: 2024 },
  { orgNr: '979491514', name: 'Reitan Eiendom Drift AS', kjede: 'reitan', type: 'drift', totalAssetsNok: 7_715_000, equityNok: 3_876_000, revenueNok: 31_135_000, operatingResultNok: 1_516_000, year: 2024 },

  // Coop (utvalg)
  { orgNr: '988445177', name: 'Coop Norge Eiendom AS', kjede: 'coop', type: 'hovedselskap', totalAssetsNok: 4_635_403_000, equityNok: 1_661_265_000, revenueNok: 36_124_000, operatingResultNok: -47_894_000, year: 2024 },
  { orgNr: '985052441', name: 'Coop Eiendom Vest AS', kjede: 'coop', type: 'regional', totalAssetsNok: 407_344_000, equityNok: 82_671_000, revenueNok: 1_829_000, operatingResultNok: -625_000, year: 2024 },
  { orgNr: '990590052', name: 'Coop Vestfold og Telemark Eiendom AS', kjede: 'coop', type: 'regional', totalAssetsNok: 347_132_000, equityNok: 145_566_000, revenueNok: 0, operatingResultNok: -1_243_000, year: 2024 },
  { orgNr: '812977032', name: 'Coop Innlandet Eiendom AS', kjede: 'coop', type: 'regional', totalAssetsNok: 472_085_000, equityNok: 198_348_000, revenueNok: 39_000, operatingResultNok: -208_000, year: 2024 },
  { orgNr: '917853908', name: 'Coop Hordaland Eiendom AS', kjede: 'coop', type: 'regional', totalAssetsNok: 449_233_000, equityNok: 444_533_000, revenueNok: 0, operatingResultNok: -458_000, year: 2024 },
  { orgNr: '916047967', name: 'Coop Eiendom Rogaland AS', kjede: 'coop', type: 'regional', totalAssetsNok: 120_433_000, equityNok: 48_124_000, revenueNok: 0, operatingResultNok: -137_000, year: 2024 },
  { orgNr: '825091912', name: 'Coop Økonom Eiendom AS', kjede: 'coop', type: 'regional', totalAssetsNok: 73_684_000, equityNok: 24_311_000, revenueNok: 0, operatingResultNok: -48_000, year: 2024 },
]

export function equityRatioPct(p: PropertyCompany): number {
  return p.totalAssetsNok > 0 ? (p.equityNok / p.totalAssetsNok) * 100 : 0
}

export function sumByKjede(rows: PropertyCompany[]) {
  const byKjede = new Map<PropertyCompanyKjede, { count: number; totalAssetsNok: number; equityNok: number }>()
  for (const p of rows) {
    const cur = byKjede.get(p.kjede) ?? { count: 0, totalAssetsNok: 0, equityNok: 0 }
    cur.count += 1
    cur.totalAssetsNok += p.totalAssetsNok
    cur.equityNok += p.equityNok
    byKjede.set(p.kjede, cur)
  }
  return byKjede
}
