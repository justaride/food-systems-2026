export const mediaYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const

export type MediaThemeId =
  | 'beredskap'
  | 'prispress'
  | 'markedsmakt'
  | 'sirkularitet'
  | 'innovasjon'
  | 'regulering'

export type MediaFocusLevel = 'lav' | 'middels' | 'hoy' | 'kritisk'

export type MediaSource = {
  sourceId?: string
  label: string
  url?: string
  note?: string
}

export type MediaTheme = {
  id: MediaThemeId
  name: string
  description: string
  sources?: MediaSource[]
}

export type MediaTimelineEntry = {
  year: number
  intensity: number
  label: string
  note: string
  sources?: MediaSource[]
}

export type MediaTriggerMoment = {
  year: number
  label: string
  sources?: MediaSource[]
}

export type MediaCountryProfile = {
  id: string
  name: string
  iso: string
  dominantNarrative: string
  summary: string
  strongestPeriod: string
  keyQuestion: string
  yearlySignal: number[]
  focusLevels: Record<MediaThemeId, MediaFocusLevel>
  triggerMoments: MediaTriggerMoment[]
  sources?: MediaSource[]
}

export const mediaThemes: MediaTheme[] = [
  {
    id: 'beredskap',
    name: 'Beredskap og selvforsyning',
    description: 'Mattrygghet, kriseresiliens, importavhengighet og nasjonal forsyningsevne.',
    sources: [
      { sourceId: 'src-16', label: 'Riksrevisjonen matsikkerhet', url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/', note: 'Kritisk analyse av systemets saarbarhet' },
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/', note: '50 %-maal innen 2030' },
      { sourceId: 'src-31', label: 'NIBIO sjolvforsyningsgrad', url: 'nibio.no', note: 'Metodisk grunnlag for beredskapsdebatt' },
    ],
  },
  {
    id: 'prispress',
    name: 'Prispress og husholdning',
    description: 'Matpriser, inflasjon, kjopekraft og hvem som baerer kostnadssjokkene.',
    sources: [
      { sourceId: 'src-20', label: 'Foros m.fl. — medieoppmerksomhet og priser', url: 'https://www.nhh.no/en/research-centres/food/', note: 'Medias rolle som prisregulator' },
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf', note: 'Oppdaterte marginer og markedstall' },
      { sourceId: 'src-33', label: 'Eurostat prisnivaa 2024', url: 'ec.europa.eu/eurostat', note: 'Norges prisposisjon mot EU' },
    ],
  },
  {
    id: 'markedsmakt',
    name: 'Markedsmakt og kjedestruktur',
    description: 'Konsentrasjon, forhandlingsmakt, marginer og dominans i dagligvareleddet.',
    sources: [
      { sourceId: 'src-12', label: 'NOU 2011:4 Mat, makt og avmakt', url: 'https://www.regjeringen.no/no/dokumenter/nou-2011-4/id640128/', note: 'Grunnlagsdokument for markedskonsentrasjon' },
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
      { sourceId: 'src-44', label: 'Marginstudie del 1', url: 'konkurransetilsynet.no', note: 'Historisk bevis paa lonnsomhetsutvikling' },
    ],
  },
  {
    id: 'sirkularitet',
    name: 'Sirkularitet og matsvinn',
    description: 'Sidestrommer, ressursutnyttelse, emballasje og klimakoblet omstilling.',
    sources: [
      { sourceId: 'src-32', label: 'Matsvinn i Norge 2024', url: 'matvett.no', note: 'Ressurstap i hele verdikjeden' },
    ],
  },
  {
    id: 'innovasjon',
    name: 'Innovasjon og nye modeller',
    description: 'Nye verdikjeder, urbane piloter, teknologi og regionale initiativer.',
    sources: [
      { sourceId: 'src-37', label: 'Menon EMV og innovasjon', url: 'menon.no', note: 'EMVs effekt paa innovasjonstakt' },
    ],
  },
  {
    id: 'regulering',
    name: 'Regulering og policy',
    description: 'Matstrategier, handelspraksis, konkurranseregler og offentlige grep.',
    sources: [
      { sourceId: 'src-36', label: 'Ny hjemmel for markedsetterforskning', url: 'konkurransetilsynet.no', note: 'Nye regulatoriske verktoey' },
      { label: 'Lov om god handelsskikk', url: 'https://lovdata.no/dokument/NL/lov/2020-03-27-13', note: 'I kraft fra 2021' },
    ],
  },
]

export const mediaTimeline: MediaTimelineEntry[] = [
  {
    year: 2016,
    intensity: 2,
    label: 'Matstrategier blir offentlig sak',
    note: 'Sverige setter produksjon og selvforsyning tydeligere pa agendaen; nordisk systemtenkning far mer fotfeste.',
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/', note: 'Norsk matstrategi' },
      { label: 'Livsmedelsstrategin (SE)', url: 'https://www.government.se/information-material/2017/04/a-national-food-strategy-for-sweden/', note: 'Svensk matstrategi 2017-2030' },
    ],
  },
  {
    year: 2017,
    intensity: 2,
    label: 'Urban mat og omstilling',
    note: 'Bynare matsystemer, lokal produksjon og innovasjon begynner a dukke opp som eget spor.',
  },
  {
    year: 2018,
    intensity: 2,
    label: 'Klima og matsvinn vokser',
    note: 'Klimadiskusjonen trekker matsvinn, ressursbruk og biookonomi tettere inn i mediebildet.',
  },
  {
    year: 2019,
    intensity: 3,
    label: 'Systemdebatt blir bredere',
    note: 'Mat omtales mer som system enn som enkeltsektorer, med sterkere kobling mellom helse, klima og verdikjede.',
    sources: [
      { sourceId: 'src-23', label: 'Stockholm Resilience Centre', url: 'https://www.stockholmresilience.org/', note: 'Nordisk matsystem — helse og baerekraft' },
    ],
  },
  {
    year: 2020,
    intensity: 5,
    label: 'Pandemi utloser beredskapsfokus',
    note: 'Forsyningssikkerhet, importavhengighet og robusthet blir synlige temaer pa tvers av Norden.',
    sources: [
      { sourceId: 'src-16', label: 'Riksrevisjonen matsikkerhet', url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/', note: 'Kritikk av beredskapsplanlegging' },
    ],
  },
  {
    year: 2021,
    intensity: 4,
    label: 'Handelspraksis og styring',
    note: 'Nye eller skjerpede regler for handelspraksis gir mer oppmerksomhet til maktforhold i kjeden.',
    sources: [
      { label: 'Lov om god handelsskikk', url: 'https://lovdata.no/dokument/NL/lov/2020-03-27-13', note: 'I kraft 1. jan 2021' },
    ],
  },
  {
    year: 2022,
    intensity: 5,
    label: 'Inflasjon og geopolitikk',
    note: 'Krigen i Ukraina, energi og prisokninger presser matpolitikk og husholdningsokonomi opp i nyhetsbildet.',
    sources: [
      { sourceId: 'src-25', label: 'Konkurrensverket livsmedel', url: 'https://www.konkurrensverket.se/publikationer/', note: 'Svensk inflasjon og markedsmakt' },
      { sourceId: 'src-33', label: 'Eurostat prisnivaa', url: 'ec.europa.eu/eurostat', note: 'Prissammenligninger' },
    ],
  },
  {
    year: 2023,
    intensity: 5,
    label: 'Marginer, prisnivaa og legitimitet',
    note: 'Diskusjonen beveger seg fra sjokk til ansvar: hvem tjener, hvem taper, og hvor sitter makten?',
    sources: [
      { sourceId: 'src-44', label: 'Marginstudie del 1', url: 'konkurransetilsynet.no', note: 'Lonnsomhet 2017-2022' },
      { sourceId: 'src-28', label: 'SOA EMV-kartlegging', url: 'regjeringen.no', note: 'Vertikal integrasjon og EMV' },
    ],
  },
  {
    year: 2024,
    intensity: 5,
    label: 'Konkurranseinngrep og kontroll',
    note: 'Tilsyn, sektorundersokelser, botssaker og markedsgrep gir hoy politisk og redaksjonelt trykk.',
    sources: [
      { sourceId: 'src-42', label: 'Prisjeger-vedtaket', url: 'konkurransetilsynet.no', note: 'NOK 4.9 mrd i bøter' },
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
      { sourceId: 'src-36', label: 'Ny markedsetterforskning', url: 'konkurransetilsynet.no', note: 'Nye inngrepsmuligheter fra juli 2025' },
    ],
  },
  {
    year: 2025,
    intensity: 4,
    label: 'Selvforsyning som strategisk narrativ',
    note: 'Totalberedskap, nasjonale matstrategier og produksjonsevne blir mer sentrale enn ren prisdebatt.',
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/', note: '50 %-maal' },
      { sourceId: 'src-16', label: 'Riksrevisjonen beredskap', url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-jordbruksomradet/' },
      { sourceId: 'src-40', label: 'NBS systemkritikk', url: 'smabrukarlaget.no', note: 'Produsentperspektiv paa matberedskap' },
    ],
  },
]

export const mediaCountryProfiles: MediaCountryProfile[] = [
  {
    id: 'no',
    name: 'Norge',
    iso: 'NO',
    dominantNarrative: 'Prispress, triopol og beredskap',
    summary:
      'Mediebildet i Norge drives av et sterkt triopol, hoye prisdiskusjoner, marginstudier og sporsmaal om lav selvforsyning i krise.',
    strongestPeriod: '2022-2025',
    keyQuestion: 'Hvor saarbart er et konsentrert matsystem nar import og logistikk svikter samtidig?',
    yearlySignal: [1, 1, 2, 2, 4, 4, 5, 5, 5, 4],
    focusLevels: {
      beredskap: 'kritisk',
      prispress: 'hoy',
      markedsmakt: 'kritisk',
      sirkularitet: 'middels',
      innovasjon: 'middels',
      regulering: 'hoy',
    },
    triggerMoments: [
      { year: 2021, label: 'Lov om god handelsskikk trer tydeligere inn i debatten', sources: [
        { label: 'Lov om god handelsskikk', url: 'https://lovdata.no/dokument/NL/lov/2020-03-27-13' },
      ] },
      { year: 2024, label: 'Prisjeger-saken og marginstudier flytter fokus til kjedemakt', sources: [
        { sourceId: 'src-42', label: 'Prisjeger-vedtaket', url: 'konkurransetilsynet.no' },
        { sourceId: 'src-44', label: 'Marginstudie del 1', url: 'konkurransetilsynet.no' },
      ] },
      { year: 2025, label: 'Totalberedskap og 50 %-maal for selvforsyning styrker narrativet', sources: [
        { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/' },
        { label: 'Totalberedskap', url: 'https://www.regjeringen.no/en/whats-new/white-paper-on-total-preparedness-prepared-for-crisis-or-war/id3082581/' },
      ] },
    ],
    sources: [
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
      { sourceId: 'src-12', label: 'NOU 2011:4 Mat, makt og avmakt', url: 'https://www.regjeringen.no/no/dokumenter/nou-2011-4/id640128/' },
      { label: 'Konkurransetilsynet — prisjaeger-saken', url: 'https://konkurransetilsynet.no/anticompetitive-practices-may-have-led-to-higher-grocery-prices/?lang=en' },
    ],
  },
  {
    id: 'se',
    name: 'Sverige',
    iso: 'SE',
    dominantNarrative: 'Selvforsyning, butikkstruktur og prisdynamikk',
    summary:
      'Svensk omtale knytter prisokninger til retailstruktur, planbarrierer og behovet for en sterkere nasjonal matstrategi.',
    strongestPeriod: '2023-2025',
    keyQuestion: 'Kan Sverige oke produksjonen og konkurransen samtidig, eller peker systemet mot duopol?',
    yearlySignal: [2, 2, 2, 2, 3, 3, 4, 4, 5, 5],
    focusLevels: {
      beredskap: 'hoy',
      prispress: 'hoy',
      markedsmakt: 'hoy',
      sirkularitet: 'middels',
      innovasjon: 'middels',
      regulering: 'middels',
    },
    triggerMoments: [
      { year: 2016, label: 'Matstrategien gir nytt grep om produksjon og konkurransekraft', sources: [
        { label: 'Livsmedelsstrategin', url: 'https://www.government.se/information-material/2017/04/a-national-food-strategy-for-sweden/' },
      ] },
      { year: 2024, label: 'Konkurrensverkets rapport kobler priser til utilstrekkelig konkurranse', sources: [
        { sourceId: 'src-25', label: 'Konkurrensverket 2024:5', url: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-5_summary.pdf' },
      ] },
      { year: 2025, label: 'Livsmedelsstrategin 2.0 flytter fokus mot robust innenlandsk produksjon' },
    ],
    sources: [
      { sourceId: 'src-25', label: 'Konkurrensverket livsmedel', url: 'https://www.konkurrensverket.se/publikationer/' },
      { label: 'Axfood/City Gross-godkjenning', url: 'https://www.konkurrensverket.se/en/news/axfood-allowed-to-acquire-city-gross/' },
    ],
  },
  {
    id: 'dk',
    name: 'Danmark',
    iso: 'DK',
    dominantNarrative: 'Eksportstyrke, klimaomstilling og konkurranse',
    summary:
      'Dansk diskusjon handler oftere om klimaetikettering, eksportrolle og hvordan konkurransen kan holdes levende i et konsentrert marked.',
    strongestPeriod: '2022-2025',
    keyQuestion: 'Hvordan kan et eksportdrevet matsystem omstilles uten a miste tempo eller konkurransekraft?',
    yearlySignal: [1, 1, 1, 2, 2, 2, 3, 3, 4, 4],
    focusLevels: {
      beredskap: 'lav',
      prispress: 'middels',
      markedsmakt: 'middels',
      sirkularitet: 'hoy',
      innovasjon: 'hoy',
      regulering: 'middels',
    },
    triggerMoments: [
      { year: 2022, label: 'Prispress blir diskutert opp mot sterkere dansk konkurranse' },
      { year: 2024, label: 'Klimaetikett for mat forsterker mediefokus pa produksjonsfotavtrykk' },
      { year: 2025, label: 'Salling/Coop-saken holder konkurranse og konsolidering i nyhetsbildet', sources: [
        { label: 'KFST Salling/Coop-vedtak', url: 'https://en.kfst.dk/nyheder/kfst/english/decisions/2025/20250326-salling-group-acquires-33-stores-from-coop-danmark' },
      ] },
    ],
    sources: [
      { label: 'KFST — dansk UTP', url: 'https://en.kfst.dk/utp' },
      { label: 'Kromann Reumert — dansk UTP-lov', url: 'https://kromannreumert.com/en/news/new-act-on-unfair-trading-practices-in-the-food-supply-chain' },
    ],
  },
  {
    id: 'fi',
    name: 'Finland',
    iso: 'FI',
    dominantNarrative: 'Beredskap og regulert duopol',
    summary:
      'I Finland leses matsystemet gjennom nasjonal robusthet, hoy innenlandsk produksjon og et dagligvaremarked som krever tettere regulering.',
    strongestPeriod: '2020-2025',
    keyQuestion: 'Er sterk beredskap kompatibel med et dagligvaremarked der to grupper kontrollerer mesteparten av volumet?',
    yearlySignal: [2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
    focusLevels: {
      beredskap: 'kritisk',
      prispress: 'middels',
      markedsmakt: 'hoy',
      sirkularitet: 'lav',
      innovasjon: 'middels',
      regulering: 'hoy',
    },
    triggerMoments: [
      { year: 2020, label: 'Pandemien forsterker finsk fokus pa innenlandsk kapasitet' },
      { year: 2021, label: 'Food Market Act og UTP-spor gir nytt spraak for kjedemakt', sources: [
        { label: 'Food Market Act (FI)', url: 'https://www.roschier.com/newsroom/reform-of-trading-practices-in-the-grocery-sector-proposed-amendments-to-the-finnish-food-market-act' },
      ] },
      { year: 2025, label: 'Food2030 og videre beredskapsprat kobler mat tett til nasjonal sikkerhet', sources: [
        { sourceId: 'src-39', label: 'NESA/HVK beredskapsmodell', url: 'nesafinland.fi' },
      ] },
    ],
    sources: [
      { sourceId: 'src-24', label: 'Kilpailulaki § 4a', url: 'https://www.kkv.fi/en/', note: '30 %-dominansterskel' },
      { label: 'FCCA — markedsdominans dagligvare', url: 'https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/' },
    ],
  },
]

export const mediaScanGuidance = [
  'Bygg faktiske mediesok per land mot 2016-2025 som neste lag oppa denne kvalitative profilen.',
  'Kod hver omtale pa tema, trigger, tone og geografisk fokus for a skille politikk, marked og innovasjon.',
  'Hold 2026 utenfor historikkgrafene til hele aret eller et definert delaar er lukket og sammenlignbart.',
  'Bruk denne siden som narrativt kart, ikke som endelig mediestatistikk; den maa kalibreres mot faktiske artikkeltreff.',
]

export const mediaInternalSources = [
  'research/norden/nordisk-komparativ-analyse.md',
  'research/norden/regulatory-policy-landscape-nordic.md',
  'research/source-scouting-2026-03-10.md',
  'Speaker 1.md',
]
