# URL Health — Food Systems 2026

> Auto-generert av `scripts/check-urls.ts` — ikke rediger manuelt.
> Generert: 2026-04-27T12:53:26.881Z
> Totalt sjekket: **173** unike URL-er
> Skanntid: **245.3s** (rate-limit 1000ms/req)

## Distribusjon per klassifikasjon

| classification | antall | %  |
|---|---:|---:|
| ok | 145 | 83.8% |
| redirect | 0 | 0.0% |
| dead | 15 | 8.7% |
| blocked | 7 | 4.0% |
| paywalled | 0 | 0.0% |
| timeout | 2 | 1.2% |
| server_error | 1 | 0.6% |
| other | 3 | 1.7% |

## Klassifikasjons-regler

- **ok**: HTTP 200
- **redirect**: HTTP 3xx (Location-feltet fulgt manuelt opp til 5 hopp)
- **dead**: HTTP 404 / 410, eller nettverksfeil (ENOTFOUND, ECONNREFUSED, ECONNRESET, EHOSTUNREACH)
- **blocked**: HTTP 403 / 451 (etter retry med GET-fallback)
- **paywalled**: TODO — krever innholdsanalyse, ikke implementert (alltid 0 i denne kjøringen)
- **timeout**: ingen respons innen 10s
- **server_error**: HTTP 5xx
- **other**: alt annet (1xx, 2xx ikke 200, 4xx ikke 403/404/410/451)

## Dead URLs (404 / 410 / nettverksfeil)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:beredskap-nibio-selvforsyning-metode | error: ENOTFOUND | https://nibio.brage.unit.no/nibio-xmlui/bitstream/handle/11250/3105805/NIBIO_RAPPORT_2023_9_137.pdf |
| 5.0 | report_canonical:akademia-uib-kjopermakt | 404 | https://www.uib.no/en/persons/Tommy.Gabrielsen |
| 5.0 | report_canonical:nou-2013-6-god-handelsskikk | 404 | https://www.regjeringen.no/no/dokumenter/nou-2013-6/id723782/ |
| 5.0 | thesis:jacobsen-jansson-2022 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3051794 |
| 5.0 | thesis:nguyen-hartmann-2024 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/3158950 |
| 5.0 | thesis:tallaksen-2022 | error: ENOTFOUND | https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873 |
| 5.0 | thesis:vangelsten-2017 | 404 | https://nordopen.nord.no/nord-xmlui/handle/11250/2491452 |
| 5.0 | thesis:moe-2018 | error: ENOTFOUND | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2569075 |
| 5.0 | thesis:jevne-schiotz-2021 | error: ENOTFOUND | https://nmbu.brage.unit.no/nmbu-xmlui/handle/11250/2788657 |
| 5.0 | thesis:handlykken-2023 | error: ENOTFOUND | https://oda.oslomet.no/oda-xmlui/handle/11250/3101983 |
| 5.0 | thesis:hagan-2025 | 404 | https://trace.tennessee.edu/cgi/viewcontent.cgi?article=14738&context=utk_gradthes |
| 4.5 | thesis:barbakken-hausken-2006 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/167473 |
| 4.5 | thesis:sandanger-2012 | error: ENOTFOUND | https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778 |
| 4.5 | thesis:gangstoe-2019 | 404 | https://beccle.no/files/2020/01/Susanne_Helen_Gangstoe_Masteroppgave.pdf |
| 4.5 | thesis:paschen-eriksen-2014 | error: ENOTFOUND | https://uia.brage.unit.no/uia-xmlui/handle/11250/276369 |

## Blocked (403 / 451)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:se-konkurrensverket-2024-5 | 403 | https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/ |
| 5.0 | report_canonical:pubmed-szulecka-2024 | 403 | https://doi.org/10.1002/gch2.202300265 |
| 5.0 | report_canonical:konkurrensverket-2025-5-livsmedelsutredning | 403 | https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om-konkurrens/genomlysning-av-livsmedelsbranschen/ |
| 5.0 | thesis:stein-2022 | 403 | https://salford-repository.worktribe.com/output/1322952/sustainable-food-procurement-in-public-catering-comparison-of-the-uk-with-denmark-sweden |
| 4.5 | thesis:burgherr-2019 | 403 | https://skemman.is/handle/1946/32307 |
| 4.5 | thesis:sigurdardottir-2017 | 403 | https://skemman.is/handle/1946/26754 |
| 4.5 | thesis:johannsson-2011 | 403 | https://skemman.is/bitstream/1946/7794/3/OrriJohannsson%20FoodSecurity%20Final.pdf |

## Timeouts

| priority | source | url |
|---|---|---|
| 5.0 | thesis:adlers-2022 | https://stud.epsilon.slu.se/17609/ |
| 4.5 | report_supporting:verdibutikker-utfordrere | https://haku.vainu.com/company/normal-norge-as-omsetning-og-finansiell/NO917019738/bedriftsinformasjon |

## Server errors (5xx)

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:kkv-fi-4a-dominans | 500 | https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/ |

## Other / uklassifisert

| priority | source | status | url |
|---|---|---|---|
| 5.0 | report_canonical:eu-utp-report-2024 | 202 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52024DC0176 |
| 5.0 | report_canonical:eu-utp-staff-working-doc-2024 | 202 | https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A52024SC0106 |
| 5.0 | thesis:van-straten-2025 | 429 | https://www.diva-portal.org/smash/get/diva2:2041632/FULLTEXT01.pdf |

## Notater

- URL-listen leses fra `research/URL-INVENTORY.csv` (deduplisert per URL, høyeste source_priority beholdes).
- HEAD brukes først; GET-fallback ved 403/405. Redirect (3xx) følges manuelt opp til 5 hopp for å fange `final_url`.
- `paywalled` er ikke implementert i denne versjonen — krever innholdsanalyse av 200-respons. TODO.
- Rate-limit: 1 req/sek for å være høflig mot kildene. Tidsavbrudd: 10s per request.
- Bruk `tsx scripts/check-urls.ts --csv-only` for å undertrykke per-URL konsoll-logging.
- ENOTFOUND mot `brage.unit.no`-aliaser (`openaccess.nhh.no`, `nmbu.brage.unit.no`, `uia.brage.unit.no`, `oda.oslomet.no`, `nibio.brage.unit.no`) skyldes at canonical-domenet `brage.unit.no` ikke resolverer for øyeblikket — dette kan være transient DNS, men er flagget som `dead` her fordi URL-en ikke kan brukes i RAG-pipelinen før det fikses.
