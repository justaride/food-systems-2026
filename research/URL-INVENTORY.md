# URL Inventory — Food Systems 2026

> Auto-generert av `scripts/inventory-urls.ts` — ikke rediger manuelt.
> Generert: 2026-06-01T02:11:01.683Z
> Totalt: **209** URL-forekomster, **201** unike URL-er

## Distribusjon per source_type

| source_type | antall |
|---|---:|
| report_canonical | 118 |
| report_supporting | 13 |
| thesis | 78 |
| sourcedoc | 0 |
| document | 0 |

## Distribusjon per protocol

| protocol | antall |
|---|---:|
| https | 206 |
| http | 3 |
| other | 0 |

## Topp 30 domener

| # | domain | antall |
|---:|---|---:|
| 1 | regjeringen.no | 19 |
| 2 | hdl.handle.net | 13 |
| 3 | nhh.no | 11 |
| 4 | doi.org | 10 |
| 5 | konkurransetilsynet.no | 7 |
| 6 | pub.norden.org | 5 |
| 7 | projekter.aau.dk | 4 |
| 8 | diva-portal.org | 4 |
| 9 | pub.epsilon.slu.se | 4 |
| 10 | stud.epsilon.slu.se | 4 |
| 11 | research.cbs.dk | 4 |
| 12 | kfst.dk | 3 |
| 13 | konkurrensverket.se | 3 |
| 14 | norden.org | 3 |
| 15 | pmc.ncbi.nlm.nih.gov | 3 |
| 16 | valio.com | 3 |
| 17 | aaltodoc.aalto.fi | 3 |
| 18 | bora.uib.no | 3 |
| 19 | skemman.is | 3 |
| 20 | uu.diva-portal.org | 3 |
| 21 | samkeppni.is | 2 |
| 22 | dagligvaretilsynet.no | 2 |
| 23 | coop.no | 2 |
| 24 | norgesgruppen.no | 2 |
| 25 | asko.no | 2 |
| 26 | virke.no | 2 |
| 27 | icelandreview.com | 2 |
| 28 | uib.no | 2 |
| 29 | ruokavirasto.fi | 2 |
| 30 | eur-lex.europa.eu | 2 |

## KI-prioritet

| Klasse | antall |
|---|---:|
| URL-forekomster med priority >= 4.0 | 205 |
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

- `Report.sourceUrl` (kanonisk) og `Report.supportingSources[].url` er hentet fra `prisma/seed-data/reports.ts`.
- `Thesis.url` er hentet fra `prisma/seed-data/theses.ts`.
- `SourceDoc.url` og `Document.url` er hentet fra databasen når `DATABASE_URL` er satt. Bruk `npm run inventory-urls -- --no-db` for typed seed-data-only inventar.
- Kolonnen `source_priority` er slått opp i `research/KI-PRIORITY.csv`. Tom hvis ingen treff.
- Ingen HTTP-spørringer kjøres her; rens av status håndteres av `scripts/check-urls.ts`.
