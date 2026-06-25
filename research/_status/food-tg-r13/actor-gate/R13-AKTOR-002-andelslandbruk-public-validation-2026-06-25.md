# R13-AKTOR-002 - actor-gate validation packet

**Dato:** 2026-06-25
**Status:** actor-gate, ikke lukket
**Bruksregel:** Intern kontroll. Ikke publiser totalantall, kart eller nettverksgraf.

## Kort dom

Økoguiden og andelslandbruk.no kan gi gårdslokatorer, men ikke komplett aktiv 2025/2026-status. Lavfriksjonsvalidering kan finne kandidater og noen aktive eksempler, mens aktivtelling, antall andeler og deltakere krever gårds- eller organisasjonsbekreftelse.

## Dataeier- og valideringsrad

| Felt | Mulig dataeier | Offentlig lavfriksjon-lokator | Krever kontakt? | Godkjent evidensform | Stoppsignal |
|---|---|---|---|---|---|
| aktiv-status | gård, Økologisk Norge, andelslandbruk.no | gårdens sesongside, Økoguiden | ja/nei | datert 2025/2026 tilbudsside eller bekreftelse | Økoguiden-treff er ikke aktivtelling |
| andelstilbud | gård/andelslag | egen side/Facebook med dato | ja/nei | pris, sesong, andeler og kontaktpunkt | historisk oppføring |
| deltaker-/andelsvolum | gård/organisasjon | sjelden åpent | ja | tall fra årsmelding, gård eller organisasjon | SNL-total er sekundær |
| dedupe | Økologisk Norge, gårder, lokale grupper | API og egne sider | ja/nei | unik gårdsrad med kilde og dato | kategori + fritekst dobbelteller |

## Kandidat-/dekningstabell

| Kandidat/node | Locator | Kildeklasse | Aktiv-status | Dekningscaveat | Tom celle |
|---|---|---|---|---|---|
| Økoguiden Andelslandbruk | kategori/API `8467` | A/B | ukjent | 71 kategori-/78 friteksttreff er ikke aktivregister | aktivliste |
| Solsiden andelslandbruk | egen side | actor-primary | aktiv indikasjon 2026 | eksempel, ikke total | andeler/deltakere |
| Brånås, Moland, Anda, Kirkeby, Svanhovd | Økoguiden-lokatorer | B | ukjent | kandidatlisten må sjekkes per gård | sesongstatus |
| SNL andelslandbruk | `snl.no/andelslandbruk` | B | sekundær totalindikator | ikke primær gårdsliste | primær total |

## Før eventuell DASK/AASK

- Be Økologisk Norge/andelslandbruk.no om aktiv 2025/2026-liste med gård, sted, kontakt og status.
- Kontroller gård for gård før noen kart, total eller trend brukes.
- Ikke bruk API-treff som antall aktive gårder.

## Ikke si

- Ikke si at actor-gate er lukket.
- Ikke publiser totalantall eller kart fra kandidatflate.
- Ikke gjør medlemskap, karttreff eller selvbeskrivelse til produksjons-/effektbevis.
