import type { SourceRef } from '../types'

export type MediaOutletSeed = {
  id: string
  name: string
  country: string
  outletType: string
  language?: string
  url?: string
  notes?: string
}

export type MediaEntrySeed = {
  id: string
  outletId: string
  country: string
  publishedYear: number
  publishedMonth?: number
  publishedDay?: number
  datePrecision: 'year' | 'month' | 'day'
  title: string
  summary: string
  url?: string
  recordType: string
  verificationLevel: 'primary' | 'secondary'
  triggerLabel?: string
  sourceDocId?: string
  sourceRefs?: SourceRef[]
}

export type MediaEntryCodingSeed = {
  entryId: string
  country: string
  primaryTheme: string
  secondaryThemes: string[]
  tone: string
  frame: string
  geography: string
  actorTargets: string[]
  confidence: number
  triggerLabel?: string
  evidenceNote?: string
  codedBy: string
}

export const mediaOutlets: MediaOutletSeed[] = [
  {
    id: 'no-konkurransetilsynet',
    name: 'Konkurransetilsynet',
    country: 'NO',
    outletType: 'competition-authority',
    language: 'no',
    url: 'https://konkurransetilsynet.no',
    notes: 'Primar kanal for vedtak, marginstudier og markedsetterforskning i Norge.',
  },
  {
    id: 'no-regjeringen',
    name: 'Regjeringen',
    country: 'NO',
    outletType: 'government',
    language: 'no',
    url: 'https://www.regjeringen.no',
  },
  {
    id: 'se-konkurrensverket',
    name: 'Konkurrensverket',
    country: 'SE',
    outletType: 'competition-authority',
    language: 'sv',
    url: 'https://www.konkurrensverket.se',
  },
  {
    id: 'dk-kfst',
    name: 'Konkurrence- og Forbrugerstyrelsen',
    country: 'DK',
    outletType: 'competition-authority',
    language: 'da',
    url: 'https://en.kfst.dk',
  },
  {
    id: 'fi-kkv',
    name: 'Finnish Competition and Consumer Authority',
    country: 'FI',
    outletType: 'competition-authority',
    language: 'en',
    url: 'https://www.kkv.fi/en/',
  },
  {
    id: 'fi-roschier',
    name: 'Roschier',
    country: 'FI',
    outletType: 'legal-analysis',
    language: 'en',
    url: 'https://www.roschier.com',
    notes: 'Sekundaerkilde, men nyttig for a spore regulatoriske endringer i Finland.',
  },
  {
    id: 'is-samkeppni',
    name: 'Samkeppniseftirlitid',
    country: 'IS',
    outletType: 'competition-authority',
    language: 'is',
    url: 'https://www.samkeppni.is/en',
  },
  {
    id: 'global-usda-fas',
    name: 'USDA Foreign Agricultural Service',
    country: 'IS',
    outletType: 'market-report',
    language: 'en',
    url: 'https://www.fas.usda.gov',
    notes: 'Sekundaer, men ofte den mest kompakte offentlige markedsoppsummeringen for Island.',
  },
]

export const mediaEntries: MediaEntrySeed[] = [
  {
    id: 'entry-no-price-hunter-2024',
    outletId: 'no-konkurransetilsynet',
    country: 'NO',
    publishedYear: 2024,
    publishedMonth: 8,
    publishedDay: 21,
    datePrecision: 'day',
    title: 'Vedtak om overtredelsesgebyr i dagligvaremarkedet',
    summary:
      'Prisjeger-vedtaket gjorde informasjonsutveksling, koordinering og triopolmakt til et eksplisitt offentlig tema i Norge.',
    url: 'https://konkurransetilsynet.no/anticompetitive-practices-may-have-led-to-higher-grocery-prices/?lang=en',
    recordType: 'authority-decision',
    verificationLevel: 'primary',
    triggerLabel: 'Prisjeger-vedtaket',
    sourceDocId: 'src-42',
    sourceRefs: [
      { sourceId: 'src-42', label: 'Prisjeger-saken', url: 'https://konkurransetilsynet.no/anticompetitive-practices-may-have-led-to-higher-grocery-prices/?lang=en' },
    ],
  },
  {
    id: 'entry-no-margin-study-2025',
    outletId: 'no-konkurransetilsynet',
    country: 'NO',
    publishedYear: 2025,
    publishedMonth: 1,
    datePrecision: 'month',
    title: 'Margin study, part 1: Return on net operating assets in the grocery value chain',
    summary:
      'Marginstudien ga offentligheten et nytt, kvantitativt sprak for superprofitt, markedsmakt og asymmetrisk lonnsomhet i norsk dagligvare.',
    url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/01/Margin-study-with-appendix-_-part-1.pdf',
    recordType: 'authority-report',
    verificationLevel: 'primary',
    triggerLabel: 'Marginstudie del 1',
    sourceDocId: 'src-44',
    sourceRefs: [
      { sourceId: 'src-44', label: 'Marginstudie del 1', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/01/Margin-study-with-appendix-_-part-1.pdf' },
    ],
  },
  {
    id: 'entry-no-totalberedskap-2025',
    outletId: 'no-regjeringen',
    country: 'NO',
    publishedYear: 2025,
    publishedMonth: 1,
    datePrecision: 'month',
    title: 'White paper on total preparedness: Prepared for crisis and war',
    summary:
      'Regjeringens totalberedskapsmelding flyttet matsystem-debatten fra pris til forsyningssikkerhet, lager og nasjonal robusthet.',
    url: 'https://www.regjeringen.no/en/whats-new/white-paper-on-total-preparedness-prepared-for-crisis-or-war/id3082581/',
    recordType: 'government-white-paper',
    verificationLevel: 'primary',
    triggerLabel: 'Totalberedskap',
    sourceRefs: [
      { label: 'Totalberedskap', url: 'https://www.regjeringen.no/en/whats-new/white-paper-on-total-preparedness-prepared-for-crisis-or-war/id3082581/' },
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/' },
    ],
  },
  {
    id: 'entry-se-food-inquiry-2024',
    outletId: 'se-konkurrensverket',
    country: 'SE',
    publishedYear: 2024,
    datePrecision: 'year',
    title: 'Konkurrensverkets genomlysning av livsmedelsbranschen 2023-2024',
    summary:
      'Rapporten tydeliggjorde at prisnivaa og konkurranseproblemer i Sverige ogsaa handler om planbarrierer, oligopol og lokal etableringskontroll.',
    url: 'https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/',
    recordType: 'authority-report',
    verificationLevel: 'primary',
    triggerLabel: 'Konkurrensverket 2024:5',
    sourceDocId: 'src-25',
    sourceRefs: [
      { sourceId: 'src-25', label: 'Konkurrensverket livsmedel', url: 'https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/' },
    ],
  },
  {
    id: 'entry-se-axfood-city-gross-2024',
    outletId: 'se-konkurrensverket',
    country: 'SE',
    publishedYear: 2024,
    publishedMonth: 10,
    datePrecision: 'month',
    title: 'Axfood allowed to acquire City Gross',
    summary:
      'Godkjenningen av Axfoods oppkjop av City Gross forsterket fortellingen om svensk konsolidering fra triopol mot sterkere duopol.',
    url: 'https://www.konkurrensverket.se/en/news/axfood-allowed-to-acquire-city-gross/',
    recordType: 'merger-decision',
    verificationLevel: 'primary',
    triggerLabel: 'Axfood/City Gross',
    sourceRefs: [
      { label: 'Axfood/City Gross-godkjenning', url: 'https://www.konkurrensverket.se/en/news/axfood-allowed-to-acquire-city-gross/' },
    ],
  },
  {
    id: 'entry-dk-salling-coop-2025',
    outletId: 'dk-kfst',
    country: 'DK',
    publishedYear: 2025,
    publishedMonth: 3,
    publishedDay: 26,
    datePrecision: 'day',
    title: 'Salling Group acquires 33 stores from Coop Danmark',
    summary:
      'KFSTs vedtak ga et konkret, lokalt testtilfelle paa hvordan dansk konkurransemyndighet haandterer konsolidering i et allerede konsentrert marked.',
    url: 'https://en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark',
    recordType: 'merger-decision',
    verificationLevel: 'primary',
    triggerLabel: 'Salling/Coop-vedtak',
    sourceRefs: [
      { label: 'KFST Salling/Coop-vedtak', url: 'https://en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark' },
    ],
  },
  {
    id: 'entry-fi-30-percent-rule-2014',
    outletId: 'fi-kkv',
    country: 'FI',
    publishedYear: 2014,
    publishedMonth: 1,
    publishedDay: 1,
    datePrecision: 'day',
    title: 'Competition Act provision on grocery trade became effective on 1 January 2014',
    summary:
      'Finlands 30-prosentterskel gjorde markedsdominans til et eksplisitt regulatorisk kriterium og ga et annet offentlig sprak for dagligvaremakt enn i resten av Norden.',
    url: 'https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/',
    recordType: 'competition-rule',
    verificationLevel: 'primary',
    triggerLabel: '30 %-regelen',
    sourceDocId: 'src-24',
    sourceRefs: [
      { sourceId: 'src-24', label: 'Kilpailulaki 4a', url: 'https://www.kkv.fi/en/current/press-releases/competition-act-provision-on-grocery-trade-became-effective-on-1st-of-january/' },
    ],
  },
  {
    id: 'entry-fi-food-market-act-2021',
    outletId: 'fi-roschier',
    country: 'FI',
    publishedYear: 2021,
    datePrecision: 'year',
    title: 'Reform of trading practices in the grocery sector: proposed amendments to the Finnish Food Market Act',
    summary:
      'Roschiers oppsummering av lovendringene viser hvordan UTP og Food Market Act ble sentrale rammer for finsk matsystemdebatt etter 2021.',
    url: 'https://www.roschier.com/newsroom/reform-of-trading-practices-in-the-grocery-sector-proposed-amendments-to-the-finnish-food-market-act',
    recordType: 'legal-analysis',
    verificationLevel: 'secondary',
    triggerLabel: 'Food Market Act',
    sourceRefs: [
      { label: 'Food Market Act (FI)', url: 'https://www.roschier.com/newsroom/reform-of-trading-practices-in-the-grocery-sector-proposed-amendments-to-the-finnish-food-market-act' },
    ],
  },
  {
    id: 'entry-is-market-concentration-2024',
    outletId: 'is-samkeppni',
    country: 'IS',
    publishedYear: 2024,
    datePrecision: 'year',
    title: 'Island - Markedskonsentrasjon og vertikal integrasjon',
    summary:
      'Island har et av Europas mest konsentrerte dagligvaremarkeder, og Samkeppniseftirlitids rapport gir et eksplisitt grunnlag for aa koble hoye priser til vertikal integrasjon.',
    url: 'https://www.samkeppni.is/urlausnir/skyrslur/',
    recordType: 'authority-report',
    verificationLevel: 'primary',
    triggerLabel: 'Islandsk markedskonsentrasjon',
    sourceRefs: [
      { label: 'Samkeppniseftirlitid rapportoversikt', url: 'https://www.samkeppni.is/urlausnir/skyrslur/' },
    ],
  },
  {
    id: 'entry-is-usda-retail-foods-2024',
    outletId: 'global-usda-fas',
    country: 'IS',
    publishedYear: 2023,
    datePrecision: 'year',
    title: 'USDA GAIN Iceland Exporter Guide',
    summary:
      'USDA GAIN gir en sammenliknbar sekundaerkilde for islandsk dagligvarestruktur og Kronan/Festi-markedsdata.',
    recordType: 'market-report',
    verificationLevel: 'secondary',
    triggerLabel: 'USDA Iceland exporter guide',
    sourceDocId: 'src-85',
    sourceRefs: [
      {
        sourceId: 'src-85',
        label: 'USDA GAIN Iceland Exporter Guide',
        url: 'https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Iceland+Exporter+Guide_The+Hague_Iceland_IC2023-0001.pdf',
      },
    ],
  },
]

export const mediaEntryCodings: MediaEntryCodingSeed[] = [
  {
    entryId: 'entry-no-price-hunter-2024',
    country: 'NO',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['prispress', 'regulering'],
    tone: 'kritisk',
    frame: 'regulator',
    geography: 'nasjonal',
    actorTargets: ['NorgesGruppen', 'Coop', 'Rema 1000'],
    confidence: 5,
    triggerLabel: 'Prisjeger-vedtaket',
    evidenceNote: 'Vedtaket knytter prisnivaa direkte til koordinering og ulovlig informasjonsutveksling.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-no-margin-study-2025',
    country: 'NO',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['prispress'],
    tone: 'analytisk',
    frame: 'konkurranse',
    geography: 'nasjonal',
    actorTargets: ['dagligvarekjeder', 'verdikjede'],
    confidence: 5,
    triggerLabel: 'Marginstudie del 1',
    evidenceNote: 'Gir maalbare indikasjoner paa lonnsomhet over konkurransenivaa.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-no-totalberedskap-2025',
    country: 'NO',
    primaryTheme: 'beredskap',
    secondaryThemes: ['regulering'],
    tone: 'policy',
    frame: 'beredskap',
    geography: 'nasjonal',
    actorTargets: ['regjeringen', 'jordbruk', 'beredskapssystem'],
    confidence: 4,
    triggerLabel: 'Totalberedskap',
    evidenceNote: 'Flytter offentlig diskusjon mot lager, robusthet og forsyningsevne.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-se-food-inquiry-2024',
    country: 'SE',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['prispress', 'regulering'],
    tone: 'analytisk',
    frame: 'regulator',
    geography: 'nasjonal',
    actorTargets: ['ICA', 'Axfood', 'Coop'],
    confidence: 5,
    triggerLabel: 'Konkurrensverket 2024:5',
    evidenceNote: 'Kobler konkurransesvakhet til baade prisnivaa og etableringsbarrierer.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-se-axfood-city-gross-2024',
    country: 'SE',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['regulering'],
    tone: 'policy',
    frame: 'konkurranse',
    geography: 'nasjonal',
    actorTargets: ['Axfood', 'City Gross'],
    confidence: 4,
    triggerLabel: 'Axfood/City Gross',
    evidenceNote: 'Forsterker narrativet om at Sverige konsoliderer videre rundt ICA og Axfood.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-dk-salling-coop-2025',
    country: 'DK',
    primaryTheme: 'regulering',
    secondaryThemes: ['markedsmakt'],
    tone: 'policy',
    frame: 'regulator',
    geography: 'lokal',
    actorTargets: ['Salling Group', 'Coop Danmark'],
    confidence: 5,
    triggerLabel: 'Salling/Coop-vedtak',
    evidenceNote: 'Et lokalt fusjonsgrep blir brukt til aa teste hvor langt dansk konkurransetrykk fortsatt rekker.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-fi-30-percent-rule-2014',
    country: 'FI',
    primaryTheme: 'regulering',
    secondaryThemes: ['markedsmakt'],
    tone: 'policy',
    frame: 'regulator',
    geography: 'nasjonal',
    actorTargets: ['S Group', 'K Group'],
    confidence: 5,
    triggerLabel: '30 %-regelen',
    evidenceNote: 'Finland gjor dominans til en eksplisitt terskel og ikke bare et etterfolgende bevisproblem.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-fi-food-market-act-2021',
    country: 'FI',
    primaryTheme: 'regulering',
    secondaryThemes: ['markedsmakt', 'beredskap'],
    tone: 'analytisk',
    frame: 'regulator',
    geography: 'nasjonal',
    actorTargets: ['matkjede', 'leverandorer'],
    confidence: 3,
    triggerLabel: 'Food Market Act',
    evidenceNote: 'Sekundaer kilde, men nyttig for aa forstaa hvordan handelspraksis ble juridisk omrammet.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-is-market-concentration-2024',
    country: 'IS',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['prispress', 'regulering'],
    tone: 'kritisk',
    frame: 'konkurranse',
    geography: 'nasjonal',
    actorTargets: ['Hagar', 'Festi', 'Samkaup', 'Costco'],
    confidence: 4,
    triggerLabel: 'Islandsk markedskonsentrasjon',
    evidenceNote: 'Islandske myndigheter peker eksplisitt paa vertikal integrasjon som prisdriver.',
    codedBy: 'seed-manual',
  },
  {
    entryId: 'entry-is-usda-retail-foods-2024',
    country: 'IS',
    primaryTheme: 'markedsmakt',
    secondaryThemes: ['innovasjon'],
    tone: 'analytisk',
    frame: 'system',
    geography: 'nasjonal',
    actorTargets: ['Hagar', 'Festi', 'Drangar'],
    confidence: 3,
    triggerLabel: 'USDA Iceland exporter guide',
    evidenceNote: 'Sekundaer kryssjekk som gjor islandsk markedsstruktur lettere sammenliknbar med resten av Norden.',
    codedBy: 'seed-manual',
  },
]
