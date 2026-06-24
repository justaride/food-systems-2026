---
tittel: R12-FEED-001 - Fiskeoljeimport Mauritania
status: Batch 01 research-output - ikke claim
id: R12-FEED-001
priority: P0
theme: feed-inputs
geo: NO
gate: PCQ
accessedAt: 2026-06-24
sourceClass: A med C-hull
---

# R12-FEED-001 - Fiskeoljeimport Mauritania

## Kort dom

SSB 08801 gir en primærserie for norsk import fra Mauritania under HS 1504 for 2020-2025. Serien viser målbare importverdier og kg for underkodene `15042011_1995` og, i 2021 og 2025, `15042031_1995`.

Dette kan brukes som PCQ-kandidat for "norsk import av fiskeolje/fett fra Mauritania", men ikke som bevis for råstoffart, fiskeri, Senegal/Gambia-sardinella, sluttbruk i fôr, eller bærekraft uten andre primærkilder.

## Sterkeste kilde

- SSB, "Import og eksport - alle land og varenummer", datasett tilsvarende Statistikkbank-tabell 08801.
- Locator: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- Datasetter brukt: `Tab_08801_2018-2022.zip`, `Tab_08801_2023.zip`, `Tab_08801_2024.zip`, `Tab_08801_2025.zip`.
- SSB forklarer at filene inneholder `aargang`, `impeks`, `varenr`, `obland`, mengde og verdi. `impeks=1` er import, `obland` er opprinnelsesland, `m1_sum` er mengde1 og `v_sum` er verdi i kroner.

## Svakeste punkt

SSB-serien dokumenterer varekode og opprinnelsesland, ikke biologisk råstoffart, fiskerifelt, leverandør, etisk risiko, eller sluttbruk. Senegal/Gambia/sardinella-sporet forblir Type C eller aktørgate til en primær kilde binder de konkrete råvarene til disse fiskeriene.

## Funn-tabell

| År | Landkode | Varekode | Import kg (`M1_SUM`) | Verdi NOK (`V_SUM`) | Kildeklasse | Caveat |
|---:|---|---|---:|---:|---|---|
| 2020 | MR | `15042011_1995` | 21 578 833 | 434 126 041 | A | SSB varekode/opprinnelse; ikke råstoffart/sluttbruk. |
| 2021 | MR | `15042011_1995` | 16 157 489 | 290 475 068 | A | SSB varekode/opprinnelse; ikke råstoffart/sluttbruk. |
| 2021 | MR | `15042031_1995` | 3 869 125 | 41 002 476 | A | Samme kapittel, egen underkode; bør PCQ-es mot tolltarifftekst. |
| 2022 | MR | `15042011_1995` | 15 283 902 | 447 777 028 | A | SSB varekode/opprinnelse; ikke råstoffart/sluttbruk. |
| 2023 | MR | `15042011_1995` | 15 314 481 | 879 019 850 | A | SSB varekode/opprinnelse; ikke råstoffart/sluttbruk. |
| 2024 | MR | `15042011_1995` | 3 846 059 | 291 192 911 | A | Endelige 2024-tall fra SSB nedlastingsfil. |
| 2025 | MR | `15042011_1995` | 11 207 912 | 387 377 583 | A | Foreløpige 2025-tall. |
| 2025 | MR | `15042031_1995` | 2 908 420 | 84 482 422 | A | Foreløpige 2025-tall; bør PCQ-es mot tolltarifftekst. |

## Årssummer

| År | Import kg, HS 1504 fra Mauritania | Verdi NOK | Status |
|---:|---:|---:|---|
| 2020 | 21 578 833 | 434 126 041 | A |
| 2021 | 20 026 614 | 331 477 544 | A |
| 2022 | 15 283 902 | 447 777 028 | A |
| 2023 | 15 314 481 | 879 019 850 | A |
| 2024 | 3 846 059 | 291 192 911 | A |
| 2025 | 14 116 332 | 471 860 005 | A, foreløpig |

## Tomme celler

- Produkttekst for underkodene `15042011_1995` og `15042031_1995` er ikke dokumentert i 08801-filen og må PCQ-es mot tolltariff/varefortegnelse.
- Råstoffart er ikke synlig i SSB 08801.
- Sluttbruk i norsk fôr, konsum eller industri er ikke synlig i SSB 08801.
- Kobling til Senegal, Gambia eller sardinella er ikke dokumentert i denne primærserien.
- Bærekraft, lisensiering og fangstområde krever annen primærkilde.

## Ikke-si

- Ikke si at SSB beviser sardinella, Senegal/Gambia eller et bestemt fiskeri.
- Ikke si at all importen går til fôr.
- Ikke bland kg og kroner uten å vise enhet.
- Ikke bruk 2025 som endelig år før SSB markerer endelige tall.
- Ikke presenter underkode `15042031_1995` som samme produkttekst som `15042011_1995` før tolltarifftekst er sjekket.

## Anbefalt gate

PCQ. Importer som claim-lock-kandidat bare for en smal formulering om SSB-dokumentert import fra Mauritania under HS 1504. Parker alle arts-, sluttbruks- og Vest-Afrika-råstoffpåstander til separat kilde eller actor-gate.
