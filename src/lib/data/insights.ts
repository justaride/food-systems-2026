import type { Insight } from '../types'

// Emergency-only fallback for getRecentInsights() when Prisma is unavailable.
// Production reads from prisma.insight — this is just a few representative rows
// so the UI does not crash if the DB is down.
// Full insight content lives in the database.
export const insights: Insight[] = [
  {
    id: 'fallback-01',
    title: 'Norsk selvforsyningsgrad under 50 % for matvarer',
    type: 'funn',
    source: 'NIBIO',
    phase: 'fase-1',
    date: '2026-03-09',
    description:
      'NIBIO 2024 viser 41,3 % selvforsyningsgrad totalt inkl. fisk og 34,9 % korrigert for importert kraftfôr.',
    tags: ['selvforsyning', 'Norge'],
    sources: [
      { sourceId: 'src-31', label: 'NIBIO selvforsyningsgrad', url: 'https://www.nibio.no/tema/landbruksokonomi/selvforsyningsgrad-og-engrosforbruk' },
    ],
  },
  {
    id: 'fallback-02',
    title: 'Konsentrasjon i dagligvarehandel: tre aktører ~96 % markedsandel',
    type: 'analyse',
    source: 'Dagligvaretilsynet',
    phase: 'fase-2',
    date: '2026-02-15',
    description:
      'NorgesGruppen, Coop og Rema 1000 kontrollerer mer enn 96 % av norsk dagligvaremarked — blant Europas mest konsentrerte.',
    tags: ['konkurranse', 'dagligvare'],
    sources: [],
  },
  {
    id: 'fallback-03',
    title: 'Kartlegging: konsernstrukturer i norsk matsystem',
    type: 'kartlegging',
    source: 'Food Systems 2026',
    phase: 'fase-2',
    date: '2026-04-10',
    description:
      'Pågående arbeid med /eierskap-modulen kartlegger eierstrukturer, styreoverlapp og kryssrelasjoner mellom konsern.',
    tags: ['eierskap', 'konsern'],
    sources: [],
  },
  {
    id: 'fallback-04',
    title: 'Notat: datakvalitet i Brreg-trukket eierskapsdata',
    type: 'notat',
    source: 'Food Systems 2026',
    phase: 'fase-2',
    date: '2026-05-01',
    description:
      'BRREG-data har kjente gap rundt utenlandsk eierskap og indirekte kontroll via holdingstrukturer.',
    tags: ['datakvalitet', 'metode'],
    sources: [],
  },
  {
    id: 'fallback-05',
    title: 'Lenke: Meld. St. 11 (2023–2024) selvforsyningsmål 50 %',
    type: 'lenke',
    source: 'Regjeringen',
    phase: 'fase-1',
    date: '2024-03-15',
    description: 'Hovedreferanse for politisk mål om 50 % selvforsyning innen 2030.',
    tags: ['politikk', 'selvforsyning'],
    sources: [
      { sourceId: 'src-26', label: 'Meld. St. 11 selvforsyning', url: 'https://www.regjeringen.no/no/dokumenter/meld-st-11-20232024/id3033241/' },
    ],
  },
]
