# Food TG R12 Batch 07 report

**Dato:** 2026-06-25  
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 07 (resiliens-dybde + alternative fôrproteiner).  
**Batch:** `R12-RES-003`, `R12-RES-004`, `R12-RES-005`, `R12-FEED-003`  
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-RES-003`, `R12-RES-004`, `R12-RES-005`, `R12-FEED-003` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-RES-003 | Importavhengighet for de seks nodene er godt dokumentert kvalitativt, men konkrete tonn-tall mangler primæruttak. | SSB statbank 08801 (registerunivers) + Denofa/Animalia/SSB-kaffeartikkel | Ingen SSB PxWeb HS-uttak kjørt; fosfat- og fôrprotein-volum er tomme celler. | B/C (ingen A) | missing-primary-extract + actor-access | PCQ | Importer som underlag med tonn-tall flagget B/C; oppgrader per node via 08801-uttak. |
| R12-RES-004 | Lokal/kort kjede øker forsyningssikkerhet kun der en faktisk mekanisme er dokumentert, ikke fra identitet alene. | FFI-rapport 26/010 (regionale beredskapslagre = robusthet) | Lokalmat-volumtall er aktør-/søkesammendrag-oppgitte og uverifiserte. | B for mekanisme-evidens; C for volumtall | manglende realisert volum/markedsandel | source-shortlist | Importer som source-shortlist; hold mekanisme-skille eksplisitt, volumtall som C. |
| R12-RES-005 | Matspesifikke transport-/kaldkjede-sårbarheter er godt dokumentert kvalitativt for Norge, men tallfestet kapasitet er tomme/C-celler. | Oslo Economics OE-rapport 60-2023 (for NFD), kap. 15 | Node-tall (havneandeler, dagsdekning, kjølekjede-tonnasje) er kvalitative eller ikke-publiserte. | A for kvalitative strukturfunn; C/tom for kvantitative | empty-cell / classified-or-not-public | source-shortlist | Importer som matrelevant sårbarhetsmatrise med realisert/kapasitet/plan/potensial/hypotese. |
| R12-FEED-003 | Feltet er dominert av annonsert kapasitet og plan; realisert fôr-grade årsvolum per aktør er i stor grad ikke offentlig. | Selskapenes egne anleggssider (Enorm, Solar Foods, Invertapro) | Ingen primær dokumentasjon på realisert solgt fôr-grade volum for noen nordisk aktør. | A for anleggsstatus, B for kapasitet via presse, C for realisert volum | missing-realized-volume; capacity-only disclosure | source-shortlist | Importer som aktørledger med realisert/kapasitet/plan i separate kolonner. |

## Per-target outcome

### R12-RES-003 - ENRICH

Output: `research/external/r12/R12-RES-003-kritiske-importnoder-norge.md`

Verified source anchors:

- SSB statbank 08801 (registerunivers, bekreftet, ikke HS-uttatt): `https://www.ssb.no/statbank/table/08801/`
- SSB Utenrikshandel med varer: `https://www.ssb.no/utenriksokonomi/utenrikshandel/statistikk/utenrikshandel-med-varer`
- SSB "Uten kaffe stopper Norge": `https://www.ssb.no/utenriksokonomi/artikler-og-publikasjoner/uten-kaffe-stopper-norge`
- Denofa (aktør-primær soya) og Animalia (kraftfôr-råvarer) som B-kilder

Outcome: PCQ-kandidat for importnode-tabell. Alle tonn-tall er B/C inntil per-HS-uttak fra 08801 kjøres; fosfat og fôrprotein-total er tomme celler.

### R12-RES-004 - ENRICH

Output: `research/external/r12/R12-RES-004-lokal-verdikjede-og-faktisk-robusthet.md`

Verified source anchors:

- FFI nasjonal forsyningssikkerhet: `https://www.ffi.no/publikasjoner/arkiv/nasjonal-forsyningssikkerhet-i-krise-og-krig-sarbarheter-konsekvenser-og-tiltak-for-mat-og-drivstofforsyningen`
- FNI frøberedskap: `https://www.fni.no/prosjekter/froberedskap`
- Nationen/TB lokalmat-/REKO-dekning som sekundære kilder

Outcome: Source-shortlist. Mekanisme-evidens (desentraliserte lagre, redusert innsatsvareavhengighet, diversifisering) skilles fra lokalmat-narrativ; REKO-bidraget er hypotese inntil volum måles.

### R12-RES-005 - ENRICH

Output: `research/external/r12/R12-RES-005-transport-lager-og-kaldkjede.md`

Verified source anchors:

- Oslo Economics OE-rapport 60-2023 (for NFD): `https://www.regjeringen.no/contentassets/2617bce77a8240c784c5b4a1d55c12fd/oe-rapport-60-2023-med-vedlegg.pdf`
- DSB krisescenarioer: `https://www.dsb.no/ros-og-beredskap/samfunnssikkerhet-og-samordning/analyser-av-krisescenarioer/`
- Livsmedelsverket (SE), Huoltovarmuuskeskus (FI), Trafikverket (SE) for sektorstruktur

Outcome: Source-shortlist. Matrelevante noder (Rotterdam-hovedhavn, Fredrikstad-soya, el/drivstoff-avhengighet, frysekapasitet) er kvalitative; tallfestet kapasitet/dagsdekning er C/tomme celler.

### R12-FEED-003 - ENRICH

Output: `research/external/r12/R12-FEED-003-alternative-nordiske-forproteiner.md`

Verified source anchors:

- Enorm Biofactory (DK, insekt): `https://enormbiofactory.com/`
- Solar Foods (FI, encelleprotein/gass): `https://solarfoods.com/`
- Invertapro (NO, insekt, pilot): `https://www.invertapro.com/`

Outcome: Source-shortlist aktørledger. Kapasitet og plan holdes i separate kolonner fra realisert volum; ingen rad lukkes til realisert produksjon, og mat-orienterte aktører (Solar Foods Solein, Lantmännen) regnes ikke som fôrprotein.

## Viktigste mismatches

- `R12-RES-003`: Sekundær speilkilde (Comtrade-mirror / søkesammendrag av SSB) er ikke primær; andel (%) er ikke importvolum (tonn).
- `R12-RES-004`: "Lokal = resilient" gjelder ikke uten navngitt mekanisme; REKO-bidrag til nasjonal forsyningssikkerhet er hypotese.
- `R12-RES-005`: Generell transportberedskap er ikke matspesifikk sårbarhet uten eksplisitt matkobling i kilden.
- `R12-FEED-003`: Anleggskapasitet (annonsert) er ikke realisert produsert fôrprotein; mat-orienterte aktører er ikke fôr.

## Stop-regler som ble brukt

- Ingen sekundær speilkilde ble gjort til primær; tonn-tall uten HS-uttak ble holdt B/C.
- Realisert volum, kapasitet, plan, potensial og hypotese ble holdt separat i alle fire output.
- Tomme/klassifiserte celler ble registrert som egne funn, ikke fylt med estimat.
- Lokal kort kjede og alternative fôrproteiner ble holdt som source-shortlist, ikke ferdig robusthets- eller produksjonsclaim.

## Merknad om primæruttak

`R12-RES-003` er bevisst levert som PCQ-underlag uten kjørt SSB 08801 HS-uttak. Hver node (fosfat 2510/3103/3105, fiskeolje 1504, soya 1201/2304, kaffe 0901, kakao 1801/1806) må oppgraderes til A via konkret PxWeb-uttak før ekstern bruk.
