# URL Inventory — Food Systems 2026

> Auto-generert av `scripts/inventory-urls.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T11:43:13.371Z
> Totalt: **184** URL-forekomster, **173** unike URL-er

## Distribusjon per source_type

| source_type | antall |
|---|---:|
| report_canonical | 97 |
| report_supporting | 9 |
| thesis | 78 |
| sourcedoc | 0 |
| document | 0 |

## Distribusjon per protocol

| protocol | antall |
|---|---:|
| https | 181 |
| http | 3 |
| other | 0 |

## Topp 30 domener

| # | domain | antall |
|---:|---|---:|
| 1 | regjeringen.no | 15 |
| 2 | nhh.no | 11 |
| 3 | doi.org | 9 |
| 4 | konkurransetilsynet.no | 7 |
| 5 | dagligvaretilsynet.no | 6 |
| 6 | pub.norden.org | 4 |
| 7 | projekter.aau.dk | 4 |
| 8 | diva-portal.org | 4 |
| 9 | openaccess.nhh.no | 4 |
| 10 | stud.epsilon.slu.se | 4 |
| 11 | research.cbs.dk | 4 |
| 12 | kfst.dk | 3 |
| 13 | konkurrensverket.se | 3 |
| 14 | aaltodoc.aalto.fi | 3 |
| 15 | pub.epsilon.slu.se | 3 |
| 16 | bora.uib.no | 3 |
| 17 | skemman.is | 3 |
| 18 | uu.diva-portal.org | 3 |
| 19 | samkeppni.is | 2 |
| 20 | coop.no | 2 |
| 21 | norgesgruppen.no | 2 |
| 22 | asko.no | 2 |
| 23 | virke.no | 2 |
| 24 | icelandreview.com | 2 |
| 25 | uib.no | 2 |
| 26 | ruokavirasto.fi | 2 |
| 27 | eur-lex.europa.eu | 2 |
| 28 | beccle.no | 2 |
| 29 | hdl.handle.net | 2 |
| 30 | orbit.dtu.dk | 2 |

## KI-prioritet

| Klasse | antall |
|---|---:|
| URL-forekomster med priority >= 4.0 | 180 |
| URL-forekomster med priority < 4.0 eller ukjent | 4 |

## Eksempler — topp-prioritet (>= 4.5)

| priority | source_type | source_id | domain | url |
|---|---|---|---|---|
| 5.0 | report_canonical | nou-2011-4 | regjeringen.no | https://www.regjeringen.no/no/dokumenter/nou-2011-4/id640128/ |
| 5.0 | report_canonical | nou-2022-14 | regjeringen.no | https://www.regjeringen.no/no/dokumenter/nou-2022-14/id2930144/ |
| 5.0 | report_canonical | matsystemutvalget-2026 | nettsteder.regjeringen.no | https://nettsteder.regjeringen.no/matsystemutvalget/ |
| 5.0 | report_canonical | meld-st-11-selvforsyning | regjeringen.no | https://www.regjeringen.no/no/dokumenter/meld.-st.-11-20232024/id3028626/ |
| 5.0 | report_canonical | meld-st-4-dagligvare | regjeringen.no | https://www.regjeringen.no/no/dokumenter/meld.-st.-4-20242025/id3056808/ |
| 5.0 | report_canonical | riksrevisjonen-matsikkerhet-2023 | riksrevisjonen.no | https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/ |
| 5.0 | report_canonical | sou-2024-8-svensk-beredskap | regeringen.se | https://www.regeringen.se/rattsliga-dokument/statens-offentliga-utredningar/2024/02/sou-20248/ |
| 5.0 | report_canonical | kt-dagligvarerapport-2024 | konkurransetilsynet.no | https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf |
| 5.0 | report_canonical | kt-marginstudie-2024-del1 | konkurransetilsynet.no | https://konkurransetilsynet.no/wp-content/uploads/2024/05/Rapport-marginstudie.pdf |
| 5.0 | report_canonical | kt-marginstudie-2025-del2 | konkurransetilsynet.no | https://konkurransetilsynet.no/wp-content/uploads/2025/01/Del-2.-Kartlegging-av-marginer-ved-bruk-av-informasjon-pa-produktniva.pdf |

## Notater

- `Report.sourceUrl` (kanonisk) og `Report.supportingSources[].url` er hentet fra `src/lib/data/reports.ts`.
- `Thesis.url` er hentet fra `src/lib/data/theses.ts`.
- `SourceDoc.url` og `Document.url` er definert i `prisma/schema.prisma`, men inventaret her er bygd kun fra typed seed-data — DB-rader krever `npm run db:audit` eller egen DB-spørring og er ikke inkludert i denne kjøringen.
- Kolonnen `source_priority` er slått opp i `research/KI-PRIORITY.csv`. Tom hvis ingen treff.
- Ingen HTTP-spørringer kjøres her; rens av status håndteres av `scripts/check-urls.ts`.
