# SSB-08801 fiskeolje HS 1504 re-pull — Mauritania primæruttrekk

**ID:** DRO-R4-16b · **Dato:** 2026-06-18 · **Felt:** SSB-08801 fiskeolje HS 1504 re-pull · **Oppgraderer:** D4-16 (WITS/UN Comtrade sekundær → SSB primær)

---

## Kort dom

**SSB primæruttrekket: LYKTES.**

Norsk import av HS 1504-fiskeolje med Mauritania (MR) som opprinnelsesland er hentet direkte fra SSB tabell 08801 via PxWebApi v2-beta for perioden 2020–2025. Dataen er komplett, maskinlesbar, og identifiserer to varekoder med aktivitet. **Mauritania kan oppgraderes fra kildekvalitet B (WITS/UN Comtrade sekundær) til A (SSB primær).**

---

## Metode / PxWeb-spørring

**Metadata-endepunkt (GET):**
```
https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/metadata
```
Brukt til å verifisere gyldige varekoder, landskoder og tilgjengelige år. Responsstørrelse: ~1,97 MB JSON-stat2. Tabell dekker 1988–2025 (38 år), 13 429 varekoder, 262 land.

**Data-endepunkt (POST):**
```
https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data
Content-Type: application/json
```

**Request body (selection-format, JSON):**
```json
{
  "selection": [
    {"variableCode": "Varekoder", "valueCodes": [
      "15042011_1995",
      "15042021_1995",
      "15042031_1995",
      "15042040_1995",
      "15042099_1995",
      "15041011_1995",
      "15041020_1995",
      "15041091_1988",
      "15041093_1988",
      "15041099_2001"
    ]},
    {"variableCode": "ImpEks", "valueCodes": ["1"]},
    {"variableCode": "Land",   "valueCodes": ["MR", "SN", "GM"]},
    {"variableCode": "ContentsCode", "valueCodes": ["Verdi", "Mengde1"]},
    {"variableCode": "Tid",    "valueCodes": ["2020","2021","2022","2023","2024","2025"]}
  ]
}
```

**Merknad om API-format:** PxWebApi v2-beta svarer med HTTP 400 på standard `query`/`response`-kropp. Gyldige forespørsler bruker `selection`-array med `variableCode`/`valueCodes`-felter (uten ytre `query`-wrapper). Varekoder krever år-suffiks (f.eks. `_1995`, `_1988`, `_2001`) — suffiks angir første gyldighetsår for koden i tariffen.

**Responsformat:** JSON-stat2 · HTTP 200 · 5 552 bytes · dimensjonsrekkefølge: `[Varekoder, ImpEks, Land, ContentsCode, Tid]` · størrelse: `[10, 1, 3, 2, 6]` = 360 celler.

---

## Datatabell

### Mauritania (MR) — aggregert alle HS 1504 underkoder

| Metrikk | Verdi | Enhet | År | Geografi | Metode | Kildeeier | URL | Locator | Datakvalitet |
|---|---|---|---|---|---|---|---|---|---|
| Import fiskeolje HS 1504 | 434 126 041 | NOK | 2020 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2020 | A |
| Import fiskeolje HS 1504 | 21 578 833 | kg | 2020 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2020 | A |
| Import fiskeolje HS 1504 | 331 477 544 | NOK | 2021 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2021 | A |
| Import fiskeolje HS 1504 | 20 026 614 | kg | 2021 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2021 | A |
| Import fiskeolje HS 1504 | 447 777 028 | NOK | 2022 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2022 | A |
| Import fiskeolje HS 1504 | 15 283 902 | kg | 2022 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2022 | A |
| Import fiskeolje HS 1504 | 879 019 850 | NOK | 2023 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2023 | A |
| Import fiskeolje HS 1504 | 15 314 481 | kg | 2023 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2023 | A |
| Import fiskeolje HS 1504 | 291 192 911 | NOK | 2024 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2024 | A |
| Import fiskeolje HS 1504 | 3 846 059 | kg | 2024 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2024 | A |
| Import fiskeolje HS 1504 | 471 860 005 | NOK | 2025 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2025 | A |
| Import fiskeolje HS 1504 | 14 116 332 | kg | 2025 | Mauritania (MR) | SSB PxWebApi POST | Statistisk sentralbyrå | https://data.ssb.no/api/pxwebapi/v2-beta/tables/08801/data | Tabell 08801, Varekoder 1504*, ImpEks=1, Land=MR, Tid=2025 | A |

### Mauritania — fordeling per varekode (ikke-null poster)

| Varekode | Beskrivelse (forkortet) | År | Verdi (NOK) | Mengde (kg) |
|---|---|---|---|---|
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2020 | 434 126 041 | 21 578 833 |
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2021 | 290 475 068 | 16 157 489 |
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2022 | 447 777 028 | 15 283 902 |
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2023 | 879 019 850 | 15 314 481 |
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2024 | 291 192 911 | 3 846 059 |
| 15042011_1995 | Fett og oljer av fisk, til dyrefor | 2025 | 387 377 583 | 11 207 912 |
| 15042031_1995 | Sildeolje og andre fiskeoljer, ikke til dyrefor | 2021 | 41 002 476 | 3 869 125 |
| 15042031_1995 | Sildeolje og andre fiskeoljer, ikke til dyrefor | 2025 | 84 482 422 | 2 908 420 |

**Merk:** 2021-totalen (NOK 331 477 544) inkluderer 15042031_1995 (NOK 41 002 476) i tillegg til 15042011_1995 (NOK 290 475 068).

### Senegal (SN) og Gambia (GM)

Alle verdier null/tom for 2020–2025 på disse varekodene. Ingen fiskeolje-import registrert fra disse to landene i perioden.

---

## SSB vs WITS-avstemming

D4-16 brukte WITS/UN Comtrade (sekundær, kilde B) og identifiserte Mauritania som dominerende opprinnelsesland for norsk HS 1504-import. SSB-tallene fra denne primærpullen bekrefter mønsteret fullt ut:

| År | SSB Verdi (NOK) | SSB Mengde (kg) | Kommentar |
|---|---|---|---|
| 2020 | 434 126 041 | 21 578 833 | Høyt volum, lav kg-pris (~20 NOK/kg) |
| 2021 | 331 477 544 | 20 026 614 | Inkl. sildeolje-underkode |
| 2022 | 447 777 028 | 15 283 902 | Volumfall, prisstigning |
| 2023 | 879 019 850 | 15 314 481 | Pristopp (~57 NOK/kg) |
| 2024 | 291 192 911 | 3 846 059 | Kraftig volumfall |
| 2025 | 471 860 005 | 14 116 332 | Delvis gjenopphenting |

**Kilo-prisutvikling (implisitt enhetspris NOK/kg):**
- 2020: ~20 NOK/kg
- 2021: ~17 NOK/kg (blandet varekode)
- 2022: ~29 NOK/kg
- 2023: ~57 NOK/kg
- 2024: ~76 NOK/kg
- 2025: ~33 NOK/kg

D4-16-rapporten (WITS) antydet at Mauritania stod for et substansielt volum av norsk fiskeolje-import i HS 1504-kategorien, med topp i 2022–2023. SSB-data bekrefter dette: 2023-toppen på NOK 879 mill. tilsvarer den relative toppverdien WITS viste. Retningen og størrelsesorden er konsistent; SSB-tallene er nå de autoritative.

**Konklusjon:** Overensstemmelsen mellom WITS-mønster og SSB-serie er god. Avvik skyldes sannsynligvis at WITS aggregerer på 6-sifret HS-nivå (150420) mens SSB har 8-sifret norsk tariffnivå — liten reel diskrepans.

---

## Tomme celler

| Dimensjon | Tom | Forklaring |
|---|---|---|
| Senegal (SN), alle år | Alle null | Ingen registrert import av HS 1504-fiskeolje fra Senegal 2020–2025 |
| Gambia (GM), alle år | Alle null | Ingen registrert import av HS 1504-fiskeolje fra Gambia 2020–2025 |
| Mauritania 15042021/15042040/15042099/15041xxx, alle år | Alle null | Ingen aktivitet på øvrige underkoder — all aktivitet konsentrert i 15042011 (til dyrefor) og 15042031 (sildeolje, 2021 og 2025) |
| 2024 Mauritania kg | 3 846 059 | Kraftig nedgang ift. 2020–2023-nivå; verdi-tall (NOK 291 mill.) antyder høy enhetspris. Mulig midlertidig forsyningsavbrudd, ikke datakvalitetsproblem. |

---

## Teknisk note — API-format

SSB PxWebApi v2-beta aksepterer ikke standard `{"query": [...], "response": {"format": "json-stat2"}}` mot `/tables/{id}/data` (returnerer HTTP 400 med "The Selection field is required"). Korrekt format er `{"selection": [{"variableCode": "...", "valueCodes": [...]}]}` uten ytre `query`-wrapper og uten eksplisitt `response`-blokk (returnerer json-stat2 som default). Dette er en kjent v2-beta-avvik fra eldre PxWeb 1.x-dokumentasjon.
