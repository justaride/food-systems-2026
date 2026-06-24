# R12-ACTOR-003 - Andelslandbruk etter 2023

**Dato:** 2026-06-24
**Status:** Intern R12-output, ikke claim eller importklart aktorregister.
**Gate:** actor-gate
**Bruksregel:** Kandidater fra kart/API er `unverified` til hvert andelslandbruk har egen primarlokator eller bekreftet aktiv status.

## Kort dom

Andelslandbruk har et sterkt organisasjonsanker hos Okologisk Norge: 93 andelslandbruk var i drift i 2023, og Okologisk Norge sier samtidig at statistikkinnsamlingen stoppet etter dette. Dagens Okoguiden-kart/API gir en desk-lesbar kandidatflate, men ikke en revidert nasjonal aktivliste: kontrollsporringen 2026-06-24 returnerte 71 treff for kategorien `Andelslandbruk`, mens artikkelsiden omtaler 72 treff.

Resultatet kan berike aktorkartet som kandidat- og dekningsunderlag, men ikke brukes som komplett "i drift etter 2023"-register uten per-gard primarlokator, aktiv-status og deduplisering.

## Sterkeste kilde

- Okologisk Norge, "Hva er andelslandbruk? Slik fungerer det i Norge", aksessert 2026-06-24: `https://www.okologisk.no/artikler/hva-er-andelslandbruk/`
- Okoguiden kategori `Andelslandbruk`, aksessert 2026-06-24: `https://okologisknorge.no/oekoguiden/?act=search&categoryId=8467`
- Okoguiden API kontrollsporring, aksessert 2026-06-24: POST `https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074` med `categoryId=8467&text=`

## Svakeste punkt

Karttreff er ikke det samme som bekreftet drift i 2024-2026. API-et gir navn, lokator, adresse/koordinat og enkelte introtekster, men ingen standard felt for oppdatert sesong, andelshavere, produksjonsvolum, organisasjonsnummer eller om garden fortsatt tar imot andelshavere.

## Funn-tabell

| Indikator / aktor | Ar/periode | Lokator | Kildeklasse | Status | Caveat |
|---|---:|---|---|---|---|
| Nasjonal telling: andelslandbruk i drift | 2023 | Okologisk Norge artikkel | A/B | 93 oppgitt som siste innsamlede statistikk | Organisasjonskilde, ikke radvis liste i denne outputen; statistikk stoppet etter 2023. |
| Dagens kart/API-treff for kategori `Andelslandbruk` | 2026-06-24 | Okoguiden API | A/B | 71 treff i kontrollsporring | Kartkandidater, ikke verifisert aktiv drift. Artikkelsiden omtaler 72 treff, sa telling ma reproduseres for import. |
| Per-gard aktiv status etter 2023 | 2024-2026 | Gardens egne nettsider/sosiale sider | C | Ikke lukket | Krever per-aktor primarlokator eller aktorbekreftelse. |
| Produksjon, volum, andelshavere per gard | 2024-2026 | Ikke funnet som apen nasjonal serie | C | Ikke offentlig samlet | Actor-gate. |
| Deduplisering mot markedshager / gardbutikker / gronnsakskategorier | 2026 | Okoguiden kategorier | Type A-hull | Mulig, men ikke gjort som import | Flere treff har flere kategorier; import ma skille driftsform fra produktkategori. |

## Kontrollert utdrag fra Okoguiden API

Dette er ikke en komplett importliste, men viser at API-et kan gi strukturerte kandidatrader for neste actor-gate-pass.

| Navn | Fylke/sted fra API | Lokator | Status i denne batchen |
|---|---|---|---|
| Eri andelsgard | Vestland / Laerdal | `https://okologisknorge.no/oekoguiden/eri-andelsgard/` | kandidat, nyoppstart omtalt i intro |
| Vestern Andelslandbruk SA | Honefoss | `https://okologisknorge.no/oekoguiden/vestern-andelslandbruk-sa/` | kandidat |
| Druehagen Gard | Vestfold og Telemark / Larvik | `https://okologisknorge.no/oekoguiden/druehagen-gaard/` | kandidat |
| Al Markedshage | Viken / Al | `https://okologisknorge.no/oekoguiden/aal-markedshage/` | kandidat, mulig markedshage/andelslandbruk-overlapp |
| Langekjenngard | Viken / Kongsberg | `https://okologisknorge.no/oekoguiden/langekjenngaard/` | kandidat |
| Osternes Andelslandbruk | Vestland / Fitjar | `https://okologisknorge.no/oekoguiden/osternes-andelslandbruk/` | kandidat |
| Strandabruket Andelsgard | More og Romsdal / Hornindal | `https://okologisknorge.no/oekoguiden/strandabruket-andelsgard/` | kandidat |
| Gjerdsbakkane | More og Romsdal / Ulsteinvik | `https://okologisknorge.no/oekoguiden/gjerdsbakkane/` | kandidat |
| Tutturen Gard | Ostfold / Eidsberg | `https://okologisknorge.no/oekoguiden/tutturen-gaard/` | kandidat |
| Gjerstad andelslandbruk | Vestfold / Larvik | `https://okologisknorge.no/oekoguiden/gjerstad-andelslandbruk/` | kandidat |
| Kirkeby andelslandbruk | Oslo | `https://okologisknorge.no/oekoguiden/kirkeby-andelslandbruk/` | kandidat |
| Tveten andelsgard | Oslo | `https://okologisknorge.no/oekoguiden/tveten-andelsgaard/` | kandidat |
| Svanhovd andelslandbruk | Troms og Finnmark / Svanvik | `https://okologisknorge.no/oekoguiden/svanhovd-andelslandbruk/` | kandidat |
| Anda andelsgard | Rogaland / Klepp stasjon | `https://okologisknorge.no/oekoguiden/anda-andelsgard/` | kandidat |
| Solbakken pa Berg andelsgard SA | Tromsdalen | `https://okologisknorge.no/oekoguiden/solbakken-paa-berg-andelsgaard-sa/` | kandidat |

## Tomme celler

- Ingen apen, oppdatert 2024/2025/2026 nasjonal telling med samme metode som 2023-tallet ble funnet.
- Ingen standardisert aktiv/inaktiv-status per gard i Okoguiden API-et.
- Ingen nasjonal apen serie for andelshavere, produksjonsareal, produksjonsvolum eller omsetning.
- Ingen automatisk garanti for at et karttreff er produsent, nettverk, markedshage eller annen lokalmatnode uten manuell klassifisering.

## Ikke si

- Ikke si at Norge har 71, 72 eller 93 aktive andelslandbruk i 2026 som verifisert fasit.
- Ikke si at alle Okoguiden-treff er i drift etter 2023.
- Ikke bruk karttreff som produsentregister uten gardens egen primarlokator.
- Ikke bland andelslandbruk, markedshage, gardbutikk og gronnsakskategori som samme aktortype.
- Ikke bruk 2023-tallet som fersk status etter at Okologisk Norge selv sier statistikken ikke lenger samles inn.

## Anbefalt gate

`actor-gate`. Importer bare som kandidat- og dekningsflate inntil et eget pass henter per-aktor primarlokator, dedupliserer mot eksisterende aktorer og setter `verificationStatus` rad for rad.
