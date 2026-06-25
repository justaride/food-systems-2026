# Food TG R12 Batch 05 report

**Dato:** 2026-06-24
**Goal:** Execute controlled Food TG Research OS Runde 12 batch after batch 04.
**Batch:** `R12-ACTOR-003`, `R12-ACTOR-004`, `R12-GOV-002`, `R12-WASTE-004`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 4 | `R12-ACTOR-003`, `R12-ACTOR-004`, `R12-GOV-002`, `R12-WASTE-004` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-ACTOR-003 | Okologisk Norge gir 2023-anker for 93 andelslandbruk; Okoguiden API gir 71 dagens karttreff. | Okologisk Norge artikkel + Okoguiden kategori/API | Karttreff er ikke verifisert aktiv drift etter 2023. | A/B med C-hull | Type B actor; Type A API; Type C aktiv-statusserie | actor-gate | Importer kun som kandidat-/dekningsflate etter review. |
| R12-ACTOR-004 | KVANN/NIBIO/Solhatt/Root2Fork gir gode nettverksankre for frobevaring, flerArige vekster og skogshage. | KVANN + NIBIO Norsk genressurssenter + Root2Fork | Komplett praktiker-/gardliste er ikke apent lukket. | A/B med Type B-hull | Type B actor; Type A prosjektuttrekk; Type C medlemsliste | actor-gate | Importer nettverks-/prosjektankre etter dedup; krev primarlokator per gard. |
| R12-GOV-002 | Statlig sektoransvar og kommunal beredskapsplikt kan kildeankres; fylkeskommunal matberedskapsrolle er svakere/indirekte. | Lovdata, DSB, Meld. St. 9 og Prop. 1 S LMD | Ansvar/hjemmel er dokumentert, faktisk matsystemeffekt er ikke malt. | A med B/C-hull | Type A juridisk matrise; Type C effekt; Type B/C privat kapasitet | PCQ | Importer som PCQ-matrise, ikke claim-lock. |
| R12-WASTE-004 | SSB kaffeimport og SCG-faktorer gir estimatspenn; kaffegrut er ikke egen norsk offentlig avfallsfraksjon. | SSB 08801 + SSB Avfallsregnskapet + Miljodirektoratet + SCG-review | Import er ikke konsum, og disponering av grut er ikke malt separat. | A/B/C | Type A metode; Type C avfallsfraksjon; Type B HORECA/aktor | source-shortlist | Source-shortlist og datagap; ingen eksakt massestromclaim. |

## Per-target outcome

### R12-ACTOR-003 - ENRICH

Output: `research/_status/R12-ACTOR-003-andelslandbruk-etter-2023.md`

Verified source anchors:

- Okologisk Norge andelslandbruk article: `https://www.okologisk.no/artikler/hva-er-andelslandbruk/`
- Okoguiden category page: `https://okologisknorge.no/oekoguiden/?act=search&categoryId=8467`
- Okoguiden API: POST `https://okologisknorge.no/Umbraco/Api/EcoGuideApi/Search/8074` with `categoryId=8467&text=`

Outcome: Good actor-gate candidate surface. 2023 has a published 93-count anchor; current public map/API gave 71 controlled hits, but no verified active-status field.

### R12-ACTOR-004 - ENRICH

Output: `research/external/r12/R12-ACTOR-004-kvann-skogshage-og-fronettverk.md`

Verified source anchors:

- KVANN homepage and 2026 skoghage/skogslandbruk post: `https://kvann.no/`
- NIBIO Norsk genressurssenter: `https://www.nibio.no/om-nibio/vare-fagdivisjoner/divisjon-for-kart-og-statistikk/norsk-genressurssenter`
- NIBIO Plantegenetiske ressurser: `https://www.nibio.no/tema/mat/plantegenetiske-ressurser`
- Solhatt: `https://solhatt.no/`
- Agroecology Partnership Root2Fork partners: `https://www.agroecologypartnership.eu/en/projects/root2fork/partners`

Outcome: Network/source shortlist is usable. Full Norwegian skoghage/fro/gard ledger remains actor-gate.

### R12-GOV-002 - ENRICH

Output: `research/external/r12/R12-GOV-002-ansvarsmatrise-matberedskap.md`

Verified source anchors:

- Sivilbeskyttelsesloven kapittel V: `https://lovdata.no/dokument/NL/lov/2010-06-25-45/KAPITTEL_5`
- Forskrift om kommunal beredskapsplikt: `https://lovdata.no/dokument/SF/forskrift/2011-08-22-894`
- DSB tilsyn med kommunal beredskapsplikt: `https://www.dsb.no/ros-og-beredskap/statsforvalteren/tilsyn-med-kommunal-beredskapsplikt/`
- Meld. St. 9 (2024-2025): `https://www.regjeringen.no/no/dokumenter/meld.-st.-9-20242025/id3082364/`
- Prop. 1 S (2025-2026) LMD: `https://www.regjeringen.no/no/dokumenter/prop.-1-s-20252026/id3123353/?ch=3`

Outcome: PCQ-ready responsibility matrix. The useful finding is not "who owns all matberedskap", but where responsibility is explicit, indirect, advisory, operational or still a gap.

### R12-WASTE-004 - ENRICH

Output: `research/external/r12/R12-WASTE-004-kaffegrut-og-urbane-sidestrommer.md`

Verified source anchors:

- SSB 08801 download/API hub: `https://www.ssb.no/en/utenriksokonomi/utenrikshandel/artikler/import-og-eksport-alle-land-og-varenummer`
- NKI coffee import page: `https://kaffe.no/kaffeimporten-til-norge-2/`
- SSB Avfallsregnskapet: `https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallsregnskapet`
- Miljodirektoratet utsorteringskrav: `https://www.miljodirektoratet.no/ansvarsomrader/avfall/for-myndigheter/utsortering-og-materialgjenvinning-av-avfall/avfallstyper-og-krav-til-utsortering/`
- Matavfall/matsvinn statistikkutvikling: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Rapport%20Matavfall%20og%20matsvinn%20forslag%20til%20ny%20definisjon%20og%20videre%20statistikkutvikling.pdf`
- SCG review: `https://pmc.ncbi.nlm.nih.gov/articles/PMC8814275/`

Outcome: Source-shortlist plus datagap. SSB HS0901 imports summed to 35 668 tonn Q1 for 2024 in the controlled API check, but coffeegrut output and disposal remain derived/C-fields.

## Stop-regler som ble brukt

- Andelslandbruk ble ikke gjort til 2026-aktivregister fordi karttreff mangler aktiv-status per gard.
- KVANN/skogshage ble ikke gjort til komplett praktikerledger uten medlems-/gardliste og primarlokator per aktor.
- Matberedskap ble ikke gjort til effektclaim fordi hjemmel og veiledning ikke beviser faktisk forsyningsrobusthet.
- Kaffegrut ble ikke tallfestet som eksakt norsk massestrom fordi kaffegrut ikke er egen offentlig avfallsfraksjon.
