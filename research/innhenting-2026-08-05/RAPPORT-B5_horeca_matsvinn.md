# RAPPORT — Skive B5_horeca_matsvinn

Innhentingssesjon 2026-08-05. Innhenter: B5 (horeca + matsvinn).

## Sammendrag
- Rader i manifest: 10
- Hentet (fetched_full): 10
- Paywall: 0
- Død lenke: 0
- Findings totalt: 19 (over 10 kilder)

## Per kilde

| # | Kilde | Type | Retrieval | Findings | Merknad |
|---|-------|------|-----------|----------|---------|
| 1 | Fødevarestyrelsen DK — Det Økologiske Spisemærke | primary_evidence (PDF) | fetched_full | 2 | 3-nivå merke (gull 90-100 / sølv 60-90 / bronze 30-60 %) |
| 2 | HORECA Nytt — Thon Hotels/Servicegrossistene | media | fetched_full | 3 | ~700 mNOK ramme, 14 grossister; faktisk dato 2023-09-11 |
| 3 | Hotellmagasinet — ny innkjøpskjede (HIP) | media | fetched_full | 2 | ~1,5 mrd NOK volum; faktisk dato 2015-09-01 |
| 4 | Nordic Beverage Solutions — HoReCa-modell | secondary | fetched_full | 1 | Kun kvalitativ; TINE/Schenker/ASKO/Servicegrossistene |
| 5 | Baltic Sea Food / BSR — B2B-modell | primary_evidence (PDF, 76 s.) | fetched_full | 2 | 10 land, 189 respondenter (2018-survey) |
| 6 | SSB Avfallsregnskapet | primary_evidence | fetched_full | 2 | Totalt 10 969 kt; våtorganisk 607 kt (2024) |
| 7 | SSB Avfallshåndtering ved avfallsanlegg | primary_evidence | fetched_full | 2 | Matavfall husholdning 194 kt / næring 72 kt (2024) |
| 8 | SSB Avfall fra industrien (avfind) | primary_evidence | fetched_full | 2 | Våtorganisk industri 77 kt (2022) |
| 9 | SSB Avfall frå hushalda (KOSTRA) | primary_evidence | fetched_full | 2 | Matavfall 241 kt / 379 kg pr innb. (2025) |
| 10 | Nofima — Sustainable eaters | secondary | fetched_full | 1 | 26 partnere; faktisk oppstart 2021 |

## Felt dekket (fillsGap)
- **materialstrommer**: SSB-kildene (6-9) — matavfall/våtorganisk volum husholdning, næring, industri, totalt.
- **makt_eierskap / aktordybde / lokale_verdikjeder**: HoReCa-distribusjon (Servicegrossistene, HIP, NBS, Baltic Sea Food).
- **offentlig_innkjop / okologi_jordhelse / nordisk_dybde**: DK Spisemærke, Baltic Sea Food.
- **kvalitativt_lag / kausalitet**: Nofima matsvinn-prosjekt.

## Matsvinn — basis og systemgrense (viktig)
Alle SSB-tall er **målt** (avfallsstatistikk), men systemgrensen er **avfall/matavfall inkl. uspiselige deler**, ikke isolert *spiselig matsvinn*. Dette er notert i hver post (`notMeasured: spiselig_matsvinn_isolert`, `systemBoundary`). HoReCa-relevant strøm nærmest matsvinn: SSB "matavfall næring/institusjon 72 tusen tonn (2024)".

## Proveniens-avvik funnet (ikke rettet i CSV her, logget)
- HORECA Nytt: manifest år=2024 → faktisk 2023-09-11.
- Hotellmagasinet: manifest år=2024 → faktisk 2015-09-01; "HIP"-navnet ikke ordrett bekreftet i kilden.
- Nofima: manifest år=2020 → faktisk prosjektoppstart 2021.

## Avvik / mangler
- Ingen paywall eller døde lenker.
- Media-poster (2, 3, 4) bærer kun `aktoropplysning`, aldri `maalt`, per START-HER §3.
- CSVer ikke redigert direkte; status logget til `ekstrakt/csv-status-B5_horeca_matsvinn.jsonl`.
