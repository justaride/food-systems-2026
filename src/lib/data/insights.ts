import type { Insight } from '../types'

export const insights: Insight[] = [
  {
    id: 'ins-01',
    title: 'Norsk selvforsyningsgrad under 50% for matvarer',
    type: 'funn',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Norges selvforsyningsgrad for matvarer ligger rundt 45%, noe som gjor landet sarbart for forstyrrelser i globale forsyningskjeder.',
    tags: ['selvforsyning', 'Norge'],
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/', note: '50 %-maal innen 2030' },
      { sourceId: 'src-31', label: 'NIBIO sjolvforsyningsgrad', url: 'nibio.no', note: 'Metodisk grunnlag for beredskapsdebatt' },
    ],
  },
  {
    id: 'ins-02',
    title: 'Tre dagligvarekjeder kontrollerer 96% av markedet',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'NorgesGruppen, Coop og REMA 1000 har tilsammen 96% av det norske dagligvaremarkedet, en av de hoyeste konsentrasjonene i verden.',
    tags: ['maktkonsentrasjon', 'dagligvare'],
    sources: [
      { sourceId: 'src-14', label: 'Dagligvarerapport 2024-25', url: 'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf' },
      { sourceId: 'src-12', label: 'NOU 2011:4 Mat, makt og avmakt', url: 'https://www.regjeringen.no/no/dokumenter/nou-2011-4/id640128/', note: 'Grunnlagsdokument for markedskonsentrasjon' },
    ],
  },
  {
    id: 'ins-03',
    title: 'Nordisk matsikkerhetsstrategi mangler koordinering',
    type: 'analyse',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'De nordiske landene har individuelle matsikkerhetsstrategier men mangler en koordinert tilnarming til felles utfordringer i matforsyningskjeden.',
    tags: ['nordisk', 'matsikkerhet'],
    sources: [
      { sourceId: 'src-23', label: 'Stockholm Resilience Centre', url: 'https://www.stockholmresilience.org/', note: 'Nordisk matsystem — helse og baerekraft' },
    ],
  },
  {
    id: 'ins-04',
    title: 'Matsvinn i Norge: 390 000 tonn arlig',
    type: 'funn',
    source: 'Forskningsbibliotek',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Norge kaster omtrent 390 000 tonn spiselig mat arlig, med storst svinn i husholdningene (58%) etterfulgt av industri og handel.',
    tags: ['matsvinn', 'Norge'],
    sources: [
      { sourceId: 'src-32', label: 'Matsvinn i Norge 2024', url: 'matvett.no', note: 'Ressurstap i hele verdikjeden' },
    ],
  },
  {
    id: 'ins-05',
    title: 'Ten Step Start v2.0 anvendt pa matsystemer',
    type: 'notat',
    source: '9. mars-motet',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'Gjennomgang av hvordan Ten Step Start v2.0-metodikken kan tilpasses spesifikt til matsystemtransformasjon i nordisk kontekst.',
    tags: ['metodikk', 'ten-step'],
    sources: [
      { sourceId: 'src-8', label: 'TG Working Doc', note: 'Revidert 10-step start rammeverk' },
    ],
  },
  {
    id: 'ins-06',
    title: 'EU Farm to Fork-strategien som rammeverk',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'EUs Farm to Fork-strategi gir et rammeverk for baerekraftig matproduksjon som kan brukes som referanse for nordisk matsystemarbeid.',
    tags: ['EU', 'Farm to Fork'],
    sources: [
      { label: 'EU Farm to Fork Strategy', url: 'https://food.ec.europa.eu/horizontal-topics/farm-fork-strategy_en', note: 'EUs rammeverkstrategi for baerekraftig mat' },
    ],
  },
  {
    id: 'ins-07',
    title: 'Gigamapping som metode for systemkartlegging',
    type: 'analyse',
    source: '9. mars-motet',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Gigamapping fra AHO/Systemorientert design kan brukes til a kartlegge kompleksiteten i nordiske matsystemer og identifisere intervensjonspunkter.',
    tags: ['metodikk', 'gigamapping', 'AHO'],
    sources: [
      { sourceId: 'src-5', label: 'Speaker 1 transkripsjon', note: 'Samtale om strategi og systemkartlegging' },
    ],
  },
  {
    id: 'ins-08',
    title: 'Biosirkel-modellen for sirkulaer matproduksjon',
    type: 'lenke',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Biosirkel-prosjektet demonstrerer en modell for sirkulaer matproduksjon som kobler avfall fra en sektor til ressurser i en annen.',
    tags: ['sirkulaer', 'Biosirkel'],
  },
  {
    id: 'ins-09',
    title: 'Regulatoriske forskjeller mellom nordiske land',
    type: 'kartlegging',
    source: 'Forskningsbibliotek',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Betydelige forskjeller i matpolitikk og regulering mellom Norge, Sverige, Danmark og Finland skaper bade utfordringer og muligheter for nordisk samarbeid.',
    tags: ['regulering', 'nordisk'],
    sources: [
      { sourceId: 'src-25', label: 'Konkurrensverket livsmedel', url: 'https://www.konkurrensverket.se/publikationer/', note: 'Svensk regulering og markedsmakt' },
      { sourceId: 'src-24', label: 'Kilpailulaki § 4a', url: 'https://www.kkv.fi/en/', note: 'Finsk dominansterskel 30 %' },
    ],
  },
  {
    id: 'ins-10',
    title: 'Kaffeprosjektet som referansecase',
    type: 'notat',
    source: '9. mars-motet',
    phase: 'fase-2',
    date: '2026-03-09',
    description:
      'Kaffeprosjektet nevnt som relevant referanse for hvordan man kan kartlegge en spesifikk verdikjede pa tvers av nordiske land.',
    tags: ['referanse', 'verdikjede'],
  },
]
