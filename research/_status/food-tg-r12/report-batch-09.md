# Food TG R12 Batch 09 report

**Dato:** 2026-06-24
**Goal:** Execute controlled Food TG Research OS Runde 12 batch 09.
**Batch:** `R12-DIST-004`, `R12-DIST-005`, `R12-FARM-003`, `R12-FARM-004`, `R12-FARM-005`
**Regel:** Ingen DB-skriving, ingen claims, ingen `safe_for_ai_context`, ingen whitepaper/deck-stemme.

## Oppsummering

| Beslutning | Antall | ID-er |
|---|---:|---|
| enrich | 5 | `R12-DIST-004`, `R12-DIST-005`, `R12-FARM-003`, `R12-FARM-004`, `R12-FARM-005` |
| park | 0 | - |

## Mottaksrad

| ID | Kort dom | Sterkeste kilde | Svakeste punkt | Kildeklasse | Hulltype | Gate | Importbeslutning |
|---|---|---|---|---|---|---|---|
| R12-DIST-004 | Frukt/gront- og CEA-gate kan kildeankres som struktur og kanalspor, men ikke som bevist nekt eller komplett kjedetilgang. | KT Dagligvarerapport 2025 + Landbruksdirektoratet/SINTEF 2025 + Grontloftet/Avisomo/BAMA | Ingen apen produsent-til-kjede ledger eller accept/reject gate-logg. | A/B med C-hull | Type A/B/C | source-shortlist | Importer gate evidence ledger; ikke claim om nekt eller komplett tilgang. |
| R12-DIST-005 | Eiendom er dokumentert etableringshinderfelt; leaseback er delvis belagt som mekanisme, ikke norsk effektclaim. | KT Dagligvarerapport 2025 + Menon/NFD 2025 | Ingen komplett norsk datasettrad for butikk/eier/leietaker/leievilkar/effekt. | A/B med C-hull | Type A/B/C | source-shortlist | Importer property mechanism memo; ingen leaseback-skadeclaim. |
| R12-FARM-003 | BFJ/NIBIO gir A-kilde for gjodselsjokk 2022-2023; produksjonstype og region krever uttrekk. | NIBIO/BFJ UT-1-2023 og UT-2-2023 | Arresultat/vederlag/faktisk bruksmargin ma harmoniseres. | A med uttrekkshull | Type A/C | PCQ | Importer som PCQ-kandidat; ingen region-/produksjonsclaim ennå. |
| R12-FARM-004 | Samvirke kan beskrives strukturelt, men ikke som privat oligopol eller automatisk marginlosning. | Norsk Landbrukssamvirke + Nortura 2025 + TINE/NIBIO | Apen kilde gir ikke netto per-kg-margin eller kausal effekt. | A/B med C-hull | Type A/B/C | source-shortlist | Importer strukturanker; marginclaims forblir PCQ/actor-gate. |
| R12-FARM-005 | SSB gir aldersprofil for personlige brukere; rekruttering/distriktsoutput krever flere indikatorer. | SSB 05974 + Ruralis | Alder er ikke nyetablering, motivasjon, kapitaltilgang eller distriktsokonomi. | A/B med C-hull | Type A/B/C | source-shortlist | Importer som alders-/rekrutteringsanker med synlige C-felt. |

## Per-target outcome

### R12-DIST-004 - ENRICH

Output: `research/external/r12/R12-DIST-004-grossistgate-frukt-gront-cea.md`

Verified source anchors:

- Konkurransetilsynet Dagligvarerapport 2025: `https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf`
- Landbruksdirektoratet/SINTEF Vertikal innendors dyrking 2025: `https://www.landbruksdirektoratet.no/nb/filarkiv/rapporter/Vertikal%20innend%C3%B8rs%20dyrking%20SINTEF.pdf`
- Avisomo: `https://avisomo.com/`
- Grontloftet forpliktelser and actor pages: `https://www.xn--grntlftet-m8ad.no/forpliktelser/`
- BAMA arsrapport 2024: `https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf`

Outcome: Source-shortlist candidate. The useful finding is gate structure, not proof of denial. ONNA/Avisomo/Coop are channel examples with actor/secondary caveats.

### R12-DIST-005 - ENRICH

Output: `research/external/r12/R12-DIST-005-leaseback-og-eiendomsbarrierer.md`

Verified source anchors:

- Konkurransetilsynet Dagligvarerapport 2025
- Menon/NFD functional/accounting separation report: `https://www.regjeringen.no/contentassets/06b381ba03a74b4e9c58822890f7cc2f/utredning-av-funksjonelt-og-regnskapsmessig-skille-i-verdikjeden-for-mat-og-dagligvarer.pdf`
- Reitan Retail Danish real estate agreement: `https://www.reitanretail.no/en/pressemeldinger/18040347`
- NorgesGruppen ars- og baerekraftsrapport 2024

Outcome: Property mechanism memo. Eiendom/servitutter/eksklusivklausuler are strong structure fields; leaseback remains a mechanism with geocaveat and missing Norwegian contract data.

### R12-FARM-003 - ENRICH

Output: `research/external/r12/R12-FARM-003-gjodselsjokk-2022-2023.md`

Verified source anchors:

- NIBIO/BFJ UT-1-2023 Totalkalkylen
- NIBIO/BFJ UT-2-2023 Referansebruksberegninger
- NIBIO/BFJ UT-1A-2024 Totalkalkylen for jordbrukssektoren
- Landbruksdirektoratet Markedsrapport 2023

Outcome: PCQ candidate. Handelsgjodsel/kalk cost line and volumnedgang language are strong, but per-production and regional effects remain extraction gaps.

### R12-FARM-004 - ENRICH

Output: `research/external/r12/R12-FARM-004-samvirkemakt-og-bondemargin.md`

Verified source anchors:

- Norsk Landbrukssamvirke Samvirkebonde: `https://landbruk.no/samvirkebonde/`
- Nortura Arsmelding 2025: `https://www.nortura.no/flipbook/Nortura_aarsmelding_2025.pdf`
- Nortura organization page: `https://www.nortura.no/b%C3%A6rekraft-i-nortura/partnerskap-og-samarbeid-3`
- TINE financial information: `https://www.tine.no/om-tine/finansiell-informasjon`
- NIBIO Totalkalkylen: `https://www.nibio.no/tema/landbruksokonomi/totalkalkylen`

Outcome: Source-shortlist candidate. Use for structure language; do not turn into margin or intent claim.

### R12-FARM-005 - ENRICH

Output: `research/external/r12/R12-FARM-005-unge-bonder-og-distriktsokonomi.md`

Verified source anchors:

- SSB 05974: `https://www.ssb.no/statbank/table/05974`
- SSB Gardsbruk, jordbruksareal og husdyr: `https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr`
- Ruralis avloserrekruttering 1/24
- Ruralis Trender i norsk landbruk 2024 publication index
- Ruralis IBU evaluation 3/26

Outcome: Source-shortlist candidate. SSB aldersprofil is A; recruitment and district-output explanation remains multi-indicator and partly B/C.

## Stop-regler som ble brukt

- Grossistgate ble ikke gjort til nekt-/diskrimineringsclaim.
- Leaseback ble ikke gjort til norsk skadeclaim uten kontrakt-/eiendoms-/effektdata.
- Gjodselsjokk ble ikke regionalisert eller per-produksjonstype-forklart uten uttrekk.
- Samvirke ble ikke likestilt med privat oligopol eller gjort til automatisk marginclaim.
- Unge bonder ble ikke redusert til andel under 40; alderstabell er ikke rekrutteringsfasit.

