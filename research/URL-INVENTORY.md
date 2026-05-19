# URL Inventory — Food Systems 2026

> Auto-generert av `scripts/inventory-urls.ts` — ikke rediger manuelt.
> Generert: 2026-05-19T08:09:34.936Z
> Totalt: **870** URL-forekomster, **600** unike URL-er

## Distribusjon per source_type

| source_type | antall |
|---|---:|
| report_canonical | 118 |
| report_supporting | 13 |
| thesis | 78 |
| sourcedoc | 95 |
| document | 566 |

## Distribusjon per protocol

| protocol | antall |
|---|---:|
| https | 859 |
| http | 11 |
| other | 0 |

## Topp 30 domener

| # | domain | antall |
|---:|---|---:|
| 1 | r2cdn.perplexity.ai | 78 |
| 2 | regjeringen.no | 53 |
| 3 | doi.org | 47 |
| 4 | nhh.no | 39 |
| 5 | youtube.com | 36 |
| 6 | konkurransetilsynet.no | 29 |
| 7 | norden.org | 20 |
| 8 | hdl.handle.net | 18 |
| 9 | dagligvaretilsynet.no | 17 |
| 10 | pub.norden.org | 15 |
| 11 | projekter.aau.dk | 12 |
| 12 | openaccess.nhh.no | 12 |
| 13 | konkurrensverket.se | 9 |
| 14 | research.cbs.dk | 9 |
| 15 | kfst.dk | 8 |
| 16 | stud.epsilon.slu.se | 8 |
| 17 | norgesgruppen.no | 7 |
| 18 | eur-lex.europa.eu | 6 |
| 19 | diva-portal.org | 6 |
| 20 | beccle.no | 6 |
| 21 | aaltodoc.aalto.fi | 6 |
| 22 | pub.epsilon.slu.se | 6 |
| 23 | uu.diva-portal.org | 6 |
| 24 | urn.kb.se | 6 |
| 25 | nmbu.no | 6 |
| 26 | hi.no | 6 |
| 27 | kkv.fi | 5 |
| 28 | samkeppni.is | 5 |
| 29 | kesko.fi | 5 |
| 30 | orbit.dtu.dk | 5 |

## KI-prioritet

| Klasse | antall |
|---|---:|
| URL-forekomster med priority >= 4.0 | 180 |
| URL-forekomster med priority < 4.0 eller ukjent | 690 |

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
- `SourceDoc.url` og `Document.url` er hentet fra databasen når `DATABASE_URL` er satt. Bruk `npm run inventory-urls -- --no-db` for typed seed-data-only inventar.
- Kolonnen `source_priority` er slått opp i `research/KI-PRIORITY.csv`. Tom hvis ingen treff.
- Ingen HTTP-spørringer kjøres her; rens av status håndteres av `scripts/check-urls.ts`.
