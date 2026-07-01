import type { Insight } from '../types'

// Two roles for this file:
//  1. Emergency-only fallback for getRecentInsights() when Prisma is unavailable,
//     so the UI does not crash if the DB is down.
//  2. Version-controlled source of truth for a small set of curated, primary-sourced
//     research findings (e.g. R13) — db:import:ts upserts these rows into prisma.insight.
// Production reads from prisma.insight; most insight content lives directly in the database.
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
  // ── Curated, primary-sourced R13 findings (verifisert 2026-06-27; se research/external/r13/) ──
  {
    id: 'r13-gap005-andelslandbruk-2023',
    title: '93 andelslandbruk i drift i Norge (2023)',
    type: 'funn',
    source: 'Landbruksdirektoratet / Økologisk Norge',
    date: '2026-06-27',
    description:
      'Siste systematiske telling: 93 andelslandbruk (CSA) registrert i drift i 2023 (Landbruksdirektoratets prosjektoppfølging via Økologisk Norge). Caveat: ingen systematisk telling etter 2023 — Økologisk Norge anslår 80–90 aktive, og >120 er etablert totalt (ikke alle i drift). Skal ikke presenteres som 2025/2026-tall.',
    tags: ['lokale-verdikjeder', 'andelslandbruk', 'R13-GAP-005'],
    sources: [
      { label: 'Andelslandbruk i Norge 2022', url: 'https://www.landbruksdirektoratet.no/nb/prosjektmidler/prosjekter-og-resultater/utviklingstiltak-innen-okologisk-landbruk/andelslandbruk-i-norge-2022', note: '93 i drift registrert 2023' },
    ],
  },
  {
    id: 'r13-gap005-reko-2022',
    title: 'REKO-ringer i Norge: >140 ringer og >600 produsenter (feb. 2022)',
    type: 'funn',
    source: 'REKO Norge (rekonorge.no)',
    date: '2026-06-27',
    description:
      'Per feb. 2022 oppga REKO Norge >140 ringer, >600 produsenter og ~500 000 «kunder». Caveat: «500 000» er Facebook-gruppemedlemskap, ikke unike/betalende kunder; tallene er et 2022-øyeblikksbilde — REKO Norge (stiftelse) ble først dannet jan. 2025 og hadde ingen vedtatt årsmelding med ferske tall ved uthenting. Ikke bruk som «dagens»/2025-tall.',
    tags: ['lokale-verdikjeder', 'reko', 'R13-GAP-005'],
    sources: [
      { label: 'Hva er REKO', url: 'https://www.rekonorge.no/hva-er-reko', note: 'Tall per feb. 2022' },
    ],
  },
  {
    id: 'r13-gap005-rest-konkurs-2024',
    title: 'Restaurant Rest (matsvinn-til-gourmet) slått konkurs (2024)',
    type: 'funn',
    source: 'Brønnøysund konkursregister',
    date: '2026-06-27',
    description:
      'Restaurant Rest AS (org. 919 972 696), Oslo-restaurant med konsept basert på overskuddsråvarer, fikk konkurs åpnet 2024-09-05 (Brønnøysund konkursregister; bekreftet av Aftenposten/Vink, DN, Horecanytt). Caveat: kun konkurs-faktumet og konseptet er belagt — ingen kvantifisert miljø-/matsvinneffekt skal knyttes til caset.',
    tags: ['matsvinn', 'horeca', 'R13-GAP-005'],
    sources: [
      { label: 'Restaurant Rest AS — konkursoppføring', url: 'https://forvalt.no/Konkurs/Firmadetaljer/919972696/638863', note: 'org. 919 972 696; konkurs åpnet 2024-09-05' },
    ],
  },
  {
    id: 'r13-gap001-importnoder-2024',
    title: 'Kritiske importnoder for norsk matsystem — SSB 08801 (2024)',
    type: 'kartlegging',
    source: 'SSB tabell 08801 (utenrikshandel, HS)',
    date: '2026-06-27',
    description:
      'Realisert import 2024 (SSB tab. 08801): soyabønner (HS 1201) ~347 000 t, fiskeolje (HS 1504) ~185 000 t, kaffe (HS 0901) ~36 000 t, kakaobønner (HS 1801) ~27 t. Råfosfat (HS 2510) ~22 t — marginalt; fosfor kommer i praksis inn via sammensatt NPK-gjødsel (HS 3105 ~35 000 t) og fôr-mineraltilsetninger. Caveat: «fôrprotein-total» kan ikke avleses som ett HS-nummer (komponentene 2301/2304/2306/2309 overlapper — Type C); 08801 måler import, ikke forbruk/sluttbruk; verdivekst ≠ volumvekst.',
    tags: ['forsyningssikkerhet', 'import', 'R13-GAP-001'],
    sources: [
      { label: 'SSB tabell 08801 — utenrikshandel etter varenummer (HS)', url: 'https://www.ssb.no/en/statbank/table/08801', note: 'PxWeb-uttak 2026-06-27, importstrøm 2024' },
    ],
  },
  {
    id: 'r13-waste001-restrastoff-rstige',
    title: 'Marint restråstoff: 89 % «utnyttet», men kun ~15 % til humant konsum (2024)',
    type: 'funn',
    source: 'SINTEF Ocean / Kontali (FHF)',
    date: '2026-06-27',
    description:
      'SINTEF/FHFs «Analyse marint restråstoff 2024» (rapport 2025:00517): ~1 094 000 t tilgjengelig restråstoff, hvorav ~976 000 t (89 %) utnyttet — men kun ~15 % av produktvolumet går til humant konsum, mens fôr (66 %) og biogass/energi (19 %) dominerer. Caveat: høy utnyttelsesgrad er IKKE høyverdianvendelse — «lite av det norske restråstoffet utnyttes inn i høyere betalende markeder» (SINTEF). Biogass-tonnasjen er avledet, ikke primærtall.',
    tags: ['matsvinn-sirkulaer', 'marint-restrastoff', 'R13-WASTE-001'],
    sources: [
      { label: 'Analyse marint restråstoff 2024 (2025:00517)', url: 'https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/', note: 'SINTEF Ocean / Kontali, FHF; publisert 2025-06-02' },
    ],
  },
]
