# Food TG R13 Batch 01 report

**Dato:** 2026-06-25
**Goal:** Execute controlled Food TG Research OS Runde 13 batch 01.
**Batch:** `R13-GAP-001`, `R13-GAP-005`, `R13-WASTE-001`, `R13-GAP-002`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 3 | `R13-GAP-001`, `R13-WASTE-001`, `R13-GAP-002` |
| park | 1 | `R13-GAP-005` |
| actor-gate | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R13-GAP-001 | SSB 08801 lukker konkrete HS-serier for flere importnoder, men sluttbruk og samlet fôrprotein er fortsatt C/metodegap. | SSB 08801 bulkdata 2018-2025 | HS-koder beviser vareimport, ikke sluttbruk, art eller total fôrprotein. | A with C gaps | Type A uttak + Type C sluttbruk/metode | PCQ | importer |
| R13-GAP-005 | Ingen parkert R12-tallclaim kan løftes direkte; flere delankre er styrket, men claimsene forblir parkert. | Landbruksdirektoratet 2026, REKO Norge, Økologisk Norge, SSB 08801, IPBES/Nexus, KT-melding | Mangler claim-grade primærkilde for ASKO 70 %, REKO produsent/kunde, SOIL-score, fiskeolje art/sluttbruk, Plantagon/Rest. | A/B/C per claim | Type A delankre; Type B/C claims | parkert | parker |
| R13-WASTE-001 | SINTEF/FHF 2024 er A-anker for 1,094 mill. tonn tilgjengelig restråstoff, 976 000 tonn utnyttet og 118 000 tonn ikke utnyttet. | SINTEF Ocean rapport 2025:00517 / FHF 901844 | R-stige/Moerman-mapping er analytisk omkoding; enheter må ikke blandes. | A med metodecaveat | Type A uttak + Type C figurmetode | PCQ | importer |
| R13-GAP-002 | Mekanisme-evidens finnes for importreduksjon, lager/transportrobusthet og frø-/sortsdiversitet, men ikke for "lokalmat = resilient". | FFI rapport 26/010, FNI, REKO Norge, Økologisk Norge | Ingen A-kilde måler kort/lokal verdikjede som samlet kategori mot nasjonal forsyningssikkerhet. | A/B with C gaps | Type A mekanisme; Type B actor; Type C effekt/volum | source-shortlist | importer |

## Per-target outcome

### R13-GAP-001 - ENRICH

Output: `research/external/r13/R13-GAP-001-kritiske-importnoder.md`

Verified source anchors:

- SSB import/eksport alle land og varenummer: `https://www.ssb.no/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- Bulkdata brukt: `Tab_08801_2018-2022.zip`, `Tab_08801_2023.zip`, `Tab_08801_2024.zip`, `Tab_08801_2025.zip`

Outcome: PCQ. R12-hullet med manglende HS-uttak er lukket for konkrete koder/proxyer. `fôrprotein-total`, sluttbruk og fiskeart forblir C.

### R13-GAP-005 - PARK

Output: `research/external/r13/R13-GAP-005-parkerte-claims-verifisering.md`

Verified source anchors:

- Landbruksdirektoratet rapport 4/2026: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Produksjon%20av%20%C3%B8kologiske%20jordbruksvarer%202025%20Rapport%202026%204.pdf`
- REKO Norge organisasjon: `https://www.rekonorge.no/organisasjon-reko-norge`
- Økologisk Norge andelslandbruk i Norge: `https://okologisknorge.no/vaart-arbeid/andelslandbruk/hva-er-andelslandbruk/i-norge/`
- Konkurransetilsynet-publisert ASKO/Mandarinen-melding: `https://konkurransetilsynet.no/wp-content/uploads/2025/01/OFF-ASKO-Norge-AS-Mandarinen-Import-Engros-AS-og-Mandarinen-Oslo-AS.pdf`

Outcome: Parkert. Delkilder kan gjenbrukes i source-shortlist/PCQ, men ingen av tallclaimene åpnes.

### R13-WASTE-001 - ENRICH

Output: `research/external/r13/R13-WASTE-001-marint-restrastoff-rstige.md`

Verified source anchors:

- SINTEF publikasjon: `https://www.sintef.no/publikasjoner/publikasjon/019cb816e9d8-613672ba-42ff-40f5-8c4a-d11bcb98a574/`
- FHF prosjektbase 901844: `https://www.fhf.no/prosjekter/prosjektbasen/901844/`

Outcome: PCQ. Sterk A-kilde for 2024-status, men ikke ekstern R-stigefigur før metode/enheter er synlige.

### R13-GAP-002 - ENRICH

Output: `research/external/r13/R13-GAP-002-lokale-verdikjeder-resiliens.md`

Verified source anchors:

- FFI rapport 26/010: `https://www.ffi.no/publikasjoner/arkiv/nasjonal-forsyningssikkerhet-i-krise-og-krig-sarbarheter-konsekvenser-og-tiltak-for-mat-og-drivstofforsyningen`
- Regjeringen PDF: `https://www.regjeringen.no/contentassets/ae61fb43e430495f8d9b9e40d22ffa95/ffi-rapport-oppdatert.pdf`
- FNI Frøberedskap: `https://www.fni.no/prosjekter/froberedskap`
- REKO Norge og Økologisk Norge som actor-/organisasjonsankre

Outcome: Source-shortlist. Mekanisme først; direktesalgsnettverk og CSA-data blir actor-gate/C.

## Stop-regler som ble brukt

- Ingen HS-kode ble gjort til sluttbruksclaim.
- Ingen parkert tallclaim ble løftet uten uavhengig primærlocator.
- `Utnyttet restråstoff` ble ikke oversatt til høyverdi/humant konsum.
- Lokal/kort verdikjede ble ikke gjort til robusthetsclaim uten mekanisme.

## Må ikke visualiseres ennå

- `R13-GAP-001`: kan visualiseres først når HS/proxy, sluttbruksgap og foreløpig/endelig status vises.
- `R13-GAP-005`: skal ikke visualiseres som "verifiserte claims"; dette er en park-/nedgraderingsledger.
- `R13-WASTE-001`: R-stigefigur må vise metode og enhet per kategori.
