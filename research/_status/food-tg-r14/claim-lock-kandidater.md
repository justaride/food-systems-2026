---
tittel: R14 claim-lock-kandidater
dato: 2026-07-03
status: R14 internt arbeidsunderlag
bruksregel: Ingen ekstern claim, ingen safe_for_ai_context, ingen whitepaper-/deck-stemme. Svakeste punkt styrer gate.
---

# R14 claim-lock-kandidater

## A2 - smale GAP-005-kandidater

| Kandidat | Foreslått presis formulering | Kilde | Caveat | Beslutning |
|---|---|---|---|---|
| REKO-tall 2022 | REKO Norge oppga i 2022 over 140 ringer, om lag 500 000 kunder og over 600 produsenter. | R13-GAP-005 / rekonorge.no snapshot | Ikke nåtidstall; ikke 2025/2026-status. | claim-lock-kandidat |
| Andelslandbruk 93 / 2023 | Landbruksdirektoratet/Økologisk Norge brukte 93 andelslandbruk i drift som 2023-anker. | R13-GAP-005 + R13-AKTOR-002 | Aktiv status per gård er actor-gate. | claim-lock-kandidat |
| Rest AS konkurs 2024-09-05 | Restaurant Rest AS er bekreftet konkurs åpnet 2024-09-05. | R13-GAP-005 / Forvalt-lokator fra R13; Brreg Enhetsregisteret API bekrefter org.nr./navn og slettet status ved oppslag 2026-07-04, men ikke konkursdato. | Ikke bruk som miljøeffektclaim eller årsaksclaim. | ført til `CL-R14-GAP-005-REST` i claim-lock-tabellen 2026-07-04 |

## VK4-GAP-007

Påstanden om et samlet norsk næringsstoff-resirkuleringsgap på 25-30 % holdes **ikke** som åpnet claim i R14. P2.2-beslutningen 2026-07-04 nedgraderer raden til arbeidsmatrise: den kan bare videreføres hvis underliggende N/P/K-massebalanse får primærkilde per strøm og cellene merkes som `realisert`, `modellert`, `potensial/plan` eller `mangler`.

| Strøm | N | P | K | Beslutning |
|---|---|---|---|---|
| Mineralgjødsel-referanse | referansegrunnlag | referansegrunnlag | referansegrunnlag | Kan brukes som denominator-kontekst, ikke som importerstattbar prosent alene. |
| Svensk digestat/SPCR 120 | realisert benchmark | realisert benchmark | realisert benchmark | Måleregime, ikke norsk nivå. |
| Norsk biorest/digestat | mangler samlet N-retur | P delvis bransjetall | mangler samlet K-retur | P delvis; N/K Type C. |
| Norsk oppdrettsslam/fiskeslam | modellert tap, mangler realisert aggregat | modellert tap/potensial, mangler realisert aggregat | mangler | Ikke nasjonalt aggregat; aktør-/anleggsrader bare internt. |
| Svartvann/avløp/Recolab | små avledede case-tall | små avledede case-tall | ingen K-produkt | Benchmark/case, ikke skaleringsclaim. |
| Husdyrgjødsel | stor masse, plantetilgjengelighet/tap/regionalitet mangler | regional fordeling/tilgjengelighet styrer | separat fraksjon/geografi | PCQ/research-mission før claim. |
| Matavfall/forbrenning | modellert | modellert | mangler | Holdes som modellnode. |

## Ikke si

- Ikke si at ASKO/HORECA 70 % er bekreftet.
- Ikke si at SOIL-score er IPBES-forankret.
- Ikke si at 25-30 % næringsstoffgap er dokumentert norsk realisert gjenvinningspotensial.
- Ikke summer N, P og K til én prosent eller én KPI.
- Ikke bruk biogassvolum som bevis på næringsretur uten dokumentert digestat-/produktretur.
