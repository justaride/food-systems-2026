---
tittel: R13-AKTOR-002 — Andelslandbruk aktiv status per gård
dato: 2026-06-25
status: Intern R13-output — actor-gate
gate: actor-gate
---

# R13-AKTOR-002 — Andelslandbruk aktiv status per gård

| Felt | Svar |
|---|---|
| Kort dom | Økoguiden har en egen `Andelslandbruk`-kategori og API-søk gir mange gårdslokatorer, men dette er ikke i seg selv verifisert aktiv 2025/2026-status. SNL gir et sekundært totalanker på rundt 90 aktive andelslandbruk/over 10 000 deltakere, mens per-gård-status må sjekkes mot gårdens egen sesongside, organisasjonsside eller direkte aktør. |
| Sterkeste kilde | Økoguiden/Økologisk Norge API og kategori `Andelslandbruk`, pluss andelslandbruk.no/Økologisk Norge som feltlocator. |
| Svakeste punkt | Kart-/listeoppføring sier ikke nødvendigvis at gården tar andeler i 2025/2026; flere treff mangler kategori, kommune eller oppdatert sesongtekst. |
| Anbefalt gate | actor-gate |

## Funn-tabell

| Gård | Region | Antatt status | Kilde/lokator | År | Kildeklasse | Caveat |
|---|---|---|---|---:|---|---|
| Økoguiden `Andelslandbruk` kategori | Norge | Verifisert locator-kategori; ikke aktiv-status. | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/GetCategories og Search/8074 `categoryId=8467` | 2026 | A/B | API-søk returnerte 71 treff, men treffliste er ikke komplett aktivstatus. |
| Økoguiden fritekstsøk `andelslandbruk` | Norge | Kandidat-/locatorliste. | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074 | 2026 | A/B | Fritekstsøk returnerte 78 treff, med overlapp og treff uten kategori. |
| Brånås Søndre gård | Lillestrøm, Viken | Usikker/locator verifisert. | https://okologisknorge.no/oekoguiden/braanaas-soendre-gaard/ | 2026 | B | Økoguiden intro sier gården har andelslandbruk, men egen 2026-andelstatus må sjekkes. |
| Moland Andelslandbruk | Arendal, Agder | Usikker/locator verifisert. | https://okologisknorge.no/oekoguiden/moland-andelslandbruk/ | 2026 | B | Må sjekkes mot egen organisasjonsside/season sign-up. |
| Anda andelsgard | Rogaland | Usikker/locator verifisert. | https://okologisknorge.no/oekoguiden/anda-andelsgard/ | 2026 | B | Økoguiden er tilstrekkelig for locator, ikke for aktiv 2026. |
| Kirkeby andelslandbruk | Oslo | Usikker/locator verifisert. | https://okologisknorge.no/oekoguiden/kirkeby-andelslandbruk/ | 2026 | B | Aktiv sesong må valideres mot gård/kommune/arrangør. |
| Svanhovd andelslandbruk | Troms og Finnmark | Usikker/locator verifisert. | https://okologisknorge.no/oekoguiden/svanhovd-andelslandbruk/ | 2026 | B | Nordlig driftsstatus og 2026-andeler krever primærside. |
| Solsiden andelslandbruk | Vestland | Aktiv indikasjon 2026. | https://www.solsidenandel.net/ | 2026 | actor-primary | Egen side beskriver 2026-opplegg/pris, men bør dedupes mot Økoguiden/Økologisk Norge. |
| SNL andelslandbruk | Norge | Sekundært totalanker. | https://snl.no/andelslandbruk | 2026 | B | Bruk bare som totalindikator, ikke per-gård-register. |

## Tomme celler

- Kanonisk komplett gårdsliste fra andelslandbruk.no/Økologisk Norge med aktiv/nedlagt status.
- Per-gård 2025/2026 andelstilbud, antall andeler og kontaktpunkt.
- Dedupe mellom Økoguiden, andelslandbruk.no, Facebook-grupper og egen gårdsside.
- Nedlagte/inaktive gårder som fortsatt finnes i kart eller søk.
- Historikk for totalantall aktive gårder per år med primær årsmelding.

## Ikke si

- Ikke si at Økoguiden-karttreff er verifisert aktiv 2026-status.
- Ikke si at 71/78 API-treff er antall aktive andelslandbruk.
- Ikke bruke SNL-total som primær registerkilde for gårdsliste.
- Ikke telle gårder dobbelt når de har både kategori og friteksttreff.
- Ikke gjøre andelslandbruk til produksjonsvolum eller matsikkerhetseffekt uten egne data.

## Kilder hentet

| Kilde | URL | Tilgangsdato | Klasse | Bruk |
|---|---|---:|---|---|
| Økoguiden kart/liste | https://okologisknorge.no/oekoguiden/ | 2026-06-25 | actor-primary/API | Felt-/kartlocator og API-endepunkt. |
| Økoguiden kategori-API | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/GetCategories | 2026-06-25 | actor-primary/API | Kategori-ID `8467` for Andelslandbruk. |
| Økoguiden søke-API | https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074 | 2026-06-25 | actor-primary/API | Per-gård lokatorer og treffantall. |
| Solsiden andelslandbruk | https://www.solsidenandel.net/ | 2026-06-25 | actor-primary | Eksempel på egen 2026-statusside. |
| Store norske leksikon, andelslandbruk | https://snl.no/andelslandbruk | 2026-06-25 | secondary/reference | Sekundært totalanker og historikk. |
