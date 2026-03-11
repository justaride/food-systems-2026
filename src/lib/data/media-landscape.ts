export const mediaYears = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const

export type MediaThemeId =
  | 'beredskap'
  | 'prispress'
  | 'markedsmakt'
  | 'sirkularitet'
  | 'innovasjon'
  | 'regulering'

export type MediaFocusLevel = 'lav' | 'middels' | 'hoy' | 'kritisk'

export type MediaTheme = {
  id: MediaThemeId
  name: string
  description: string
}

export type MediaTimelineEntry = {
  year: number
  intensity: number
  label: string
  note: string
}

export type MediaTriggerMoment = {
  year: number
  label: string
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
}

export const mediaThemes: MediaTheme[] = [
  {
    id: 'beredskap',
    name: 'Beredskap og selvforsyning',
    description: 'Mattrygghet, kriseresiliens, importavhengighet og nasjonal forsyningsevne.',
  },
  {
    id: 'prispress',
    name: 'Prispress og husholdning',
    description: 'Matpriser, inflasjon, kjopekraft og hvem som baerer kostnadssjokkene.',
  },
  {
    id: 'markedsmakt',
    name: 'Markedsmakt og kjedestruktur',
    description: 'Konsentrasjon, forhandlingsmakt, marginer og dominans i dagligvareleddet.',
  },
  {
    id: 'sirkularitet',
    name: 'Sirkularitet og matsvinn',
    description: 'Sidestrommer, ressursutnyttelse, emballasje og klimakoblet omstilling.',
  },
  {
    id: 'innovasjon',
    name: 'Innovasjon og nye modeller',
    description: 'Nye verdikjeder, urbane piloter, teknologi og regionale initiativer.',
  },
  {
    id: 'regulering',
    name: 'Regulering og policy',
    description: 'Matstrategier, handelspraksis, konkurranseregler og offentlige grep.',
  },
]

export const mediaTimeline: MediaTimelineEntry[] = [
  {
    year: 2016,
    intensity: 2,
    label: 'Matstrategier blir offentlig sak',
    note: 'Sverige setter produksjon og selvforsyning tydeligere pa agendaen; nordisk systemtenkning far mer fotfeste.',
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
  },
  {
    year: 2020,
    intensity: 5,
    label: 'Pandemi utloser beredskapsfokus',
    note: 'Forsyningssikkerhet, importavhengighet og robusthet blir synlige temaer pa tvers av Norden.',
  },
  {
    year: 2021,
    intensity: 4,
    label: 'Handelspraksis og styring',
    note: 'Nye eller skjerpede regler for handelspraksis gir mer oppmerksomhet til maktforhold i kjeden.',
  },
  {
    year: 2022,
    intensity: 5,
    label: 'Inflasjon og geopolitikk',
    note: 'Krigen i Ukraina, energi og prisokninger presser matpolitikk og husholdningsokonomi opp i nyhetsbildet.',
  },
  {
    year: 2023,
    intensity: 5,
    label: 'Marginer, prisnivaa og legitimitet',
    note: 'Diskusjonen beveger seg fra sjokk til ansvar: hvem tjener, hvem taper, og hvor sitter makten?',
  },
  {
    year: 2024,
    intensity: 5,
    label: 'Konkurranseinngrep og kontroll',
    note: 'Tilsyn, sektorundersokelser, botssaker og markedsgrep gir hoy politisk og redaksjonelt trykk.',
  },
  {
    year: 2025,
    intensity: 4,
    label: 'Selvforsyning som strategisk narrativ',
    note: 'Totalberedskap, nasjonale matstrategier og produksjonsevne blir mer sentrale enn ren prisdebatt.',
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
      { year: 2021, label: 'Lov om god handelsskikk trer tydeligere inn i debatten' },
      { year: 2024, label: 'Prisjeger-saken og marginstudier flytter fokus til kjedemakt' },
      { year: 2025, label: 'Totalberedskap og 50 %-maal for selvforsyning styrker narrativet' },
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
      { year: 2016, label: 'Matstrategien gir nytt grep om produksjon og konkurransekraft' },
      { year: 2024, label: 'Konkurrensverkets rapport kobler priser til utilstrekkelig konkurranse' },
      { year: 2025, label: 'Livsmedelsstrategin 2.0 flytter fokus mot robust innenlandsk produksjon' },
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
      { year: 2025, label: 'Salling/Coop-saken holder konkurranse og konsolidering i nyhetsbildet' },
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
      { year: 2021, label: 'Food Market Act og UTP-spor gir nytt spraak for kjedemakt' },
      { year: 2025, label: 'Food2030 og videre beredskapsprat kobler mat tett til nasjonal sikkerhet' },
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
