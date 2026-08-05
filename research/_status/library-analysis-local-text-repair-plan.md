# Library Analysis Local Text Repair Plan

Generated: 2026-07-21T22:14:16.086Z

Dette er en kontrollert plan for aa reparere lavtekst-rader der en lokal tekstfil har mer komplett innhold enn Document.content. Den oppdaterer bare Document.content og Document.wordCount naar raafilteksten krysser 150-ordsgrensen. Den lager ikke claim-kandidater, endrer ikke citation-readiness, og publiserer ingenting eksternt.
Hver oppdatering er bundet til Document.updatedAt, wordCount og content fra denne planen. Apply avbryter hele batchen dersom en target-rad har endret seg etter planlegging.

Full radliste: `research/_status/library-analysis-local-text-repair-plan.json`

## Sammendrag

| Metric | Count |
|---|---:|
| Total rows | 71 |
| Update rows | 0 |
| Total word gain | 0 |
| Clears low-text rows | 0 |

### Action

| Value | Count |
|---|---:|
| skip_below_quality_floor | 17 |
| skip_no_gain | 54 |

### Repair Batch

| Value | Count |
|---|---:|
| existing_short_summary_review | 69 |
| existing_source_locator_stub_review | 2 |

## Prioritert utvalg

Rows shown below: 71 of 71

| Action | Existing words | File words | New words | Gain | Batch | Title | Path | Reason |
|---|---:|---:|---:|---:|---|---|---|---|
| skip_below_quality_floor | 54 | 55 | 54 | 0 | existing_short_summary_review | 5. Lovdata: Forskrift om ikraftsetting og avvikling | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2026 04 17 601 (2024).md | Local file has more text but remains below the 150-word review floor (54 -> 55 file words). |
| skip_below_quality_floor | 142 | 147 | 142 | 0 | existing_short_summary_review | Prop. 33 L (2019–2020) – Chapter 2: Bakgrunnen for lovforslaget | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Prop 33 L (2019-2020) Ch 2 Bakgrunn for lovforslag om god handelsskikk.md | Local file has more text but remains below the 150-word review floor (142 -> 147 file words). |
| skip_below_quality_floor | 138 | 142 | 138 | 0 | existing_short_summary_review | Sammendrag: Adlers (SLU, 2022) - Svensk selvforsyning av kjott og korn | research/bibliotek/akademia/masteroppgaver/adlers-2022.md | Local file has more text but remains below the 150-word review floor (138 -> 142 file words). |
| skip_below_quality_floor | 123 | 126 | 123 | 0 | existing_short_summary_review | Sammendrag: Gangstøe (UiB, 2019) — Hemmelige kontrakter i dagligvaremarkedet | research/bibliotek/akademia/masteroppgaver/gangstoe-2019.md | Local file has more text but remains below the 150-word review floor (123 -> 126 file words). |
| skip_below_quality_floor | 133 | 146 | 133 | 0 | existing_short_summary_review | Sammendrag: Huynh & Mortensen (Aalborg Universitet, 2025) — Salling Group vs. Coop Danmark | research/bibliotek/akademia/masteroppgaver/huynh-mortensen-2025.md | Local file has more text but remains below the 150-word review floor (133 -> 146 file words). |
| skip_below_quality_floor | 137 | 141 | 137 | 0 | existing_short_summary_review | Sammendrag: Khandaker (SLU, 2021) - Lantmannen-kornkjeden under pandemi | research/bibliotek/akademia/masteroppgaver/khandaker-2021.md | Local file has more text but remains below the 150-word review floor (137 -> 141 file words). |
| skip_below_quality_floor | 137 | 139 | 137 | 0 | existing_short_summary_review | Sammendrag: Martens & Norum (NHH, 2020) — Importvernets påvirkning på leverandørkonsentrasjon | research/bibliotek/akademia/masteroppgaver/martens-norum-2020.md | Local file has more text but remains below the 150-word review floor (137 -> 139 file words). |
| skip_below_quality_floor | 131 | 139 | 131 | 0 | existing_short_summary_review | Sammendrag: Meile (NHH, 2020) — Uniform Pricing i norsk dagligvare | research/bibliotek/akademia/masteroppgaver/meile-2020.md | Local file has more text but remains below the 150-word review floor (131 -> 139 file words). |
| skip_below_quality_floor | 131 | 132 | 131 | 0 | existing_short_summary_review | Sammendrag: Nilsen & Paulsen (NHH, 2025) — Pristransmisjon for kakao og kaffe | research/bibliotek/akademia/masteroppgaver/nilsen-paulsen-2025.md | Local file has more text but remains below the 150-word review floor (131 -> 132 file words). |
| skip_below_quality_floor | 133 | 135 | 133 | 0 | existing_short_summary_review | Vertikale restriksjoner og konkurranse i dagligvaremarkedet (Simen A. Ulsaker PhD) | research/bibliotek/akademia/masteroppgaver/ulsaker-phd-sammendrag.md | Local file has more text but remains below the 150-word review floor (133 -> 135 file words). |
| skip_below_quality_floor | 79 | 81 | 79 | 0 | existing_short_summary_review | Salling Group AS erhvervelse af dele af Coop Danmark AS | research/bibliotek/media/snapshots/dk-kfst-salling-coop-pdf-2025.md | Local file has more text but remains below the 150-word review floor (79 -> 81 file words). |
| skip_below_quality_floor | 75 | 88 | 75 | 0 | existing_short_summary_review | Retail Foods Annual Denmark DA2025-0002 | research/bibliotek/media/snapshots/dk-usda-gain-retail-2025.md | Local file has more text but remains below the 150-word review floor (75 -> 88 file words). |
| skip_below_quality_floor | 78 | 82 | 78 | 0 | existing_short_summary_review | The structure of the retail sector in Iceland | research/bibliotek/media/snapshots/is-bifrost-retail-sector.md | Local file has more text but remains below the 150-word review floor (78 -> 82 file words). |
| skip_below_quality_floor | 73 | 78 | 73 | 0 | existing_short_summary_review | Hagar management report 2024-25 | research/bibliotek/media/snapshots/is-hagar-management-2024-25.md | Local file has more text but remains below the 150-word review floor (73 -> 78 file words). |
| skip_below_quality_floor | 9 | 10 | 9 | 0 | existing_source_locator_stub_review | Capital raise and business model 2024 | research/evidence-pack/internasjonal/agrain-2024.md | Local file has more text but remains below the 150-word review floor (9 -> 10 file words). |
| skip_below_quality_floor | 9 | 16 | 9 | 0 | existing_source_locator_stub_review | Rest Oslo - Green Star profile | research/evidence-pack/sirkular-konkurser/rest-oslo/michelin-profile.md | Local file has more text but remains below the 150-word review floor (9 -> 16 file words). |
| skip_below_quality_floor | 77 | 81 | 77 | 0 | existing_short_summary_review | Untitled | research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-hagstofa-sdg-2-4-1-2026.md | Local file has more text but remains below the 150-word review floor (77 -> 81 file words). |
| skip_no_gain | 107 | 103 | 107 | 0 | existing_short_summary_review | Rapport fra havforskningen 2024-4 | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2024 4 (2024).md | Local file text does not improve existing word count (107 -> 103 file words). |
| skip_no_gain | 94 | 90 | 94 | 0 | existing_short_summary_review | Rapport fra havforskningen 2025-14 | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2025 14 (2024).md | Local file text does not improve existing word count (94 -> 90 file words). |
| skip_no_gain | 65 | 65 | 65 | 0 | existing_short_summary_review | Rapport fra havforskningen 2026-7 | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2026 7 (2024).md | Local file text does not improve existing word count (65 -> 65 file words). |
| skip_no_gain | 83 | 78 | 83 | 0 | existing_short_summary_review | 4. Lovdata: Lov om god handelsskikk i dagligvarekjeden | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2020 04 17 29 (2024).md | Local file text does not improve existing word count (83 -> 78 file words). |
| skip_no_gain | 131 | 130 | 131 | 0 | existing_short_summary_review | 3. Stortinget: Innst. 130 S (2025–2026) | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Stortinget - inns 202526 130s (2024).md | Local file text does not improve existing word count (131 -> 130 file words). |
| skip_no_gain | 88 | 83 | 88 | 0 | existing_short_summary_review | Assessing Amino Acid Solubility of Black Soldier Fly Larvae Meal in Atlantic Salmon | research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PMC - 9727232 (2024).md | Local file text does not improve existing word count (88 -> 83 file words). |
| skip_no_gain | 88 | 83 | 88 | 0 | existing_short_summary_review | Alternative Protein Sources in Aquafeed: Current Scenario and Future Perspectives | research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PubMed - 39280774 (2024).md | Local file text does not improve existing word count (88 -> 83 file words). |
| skip_no_gain | 112 | 104 | 112 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md | Local file text does not improve existing word count (112 -> 104 file words). |
| skip_no_gain | 134 | 133 | 134 | 0 | existing_short_summary_review | Sammendrag: Barbakken & Hausken (NHH, 2006) — Relasjoner mellom detaljist og produsent | research/bibliotek/akademia/masteroppgaver/barbakken-hausken-2006.md | Local file text does not improve existing word count (134 -> 133 file words). |
| skip_no_gain | 132 | 124 | 132 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md | Local file text does not improve existing word count (132 -> 124 file words). |
| skip_no_gain | 125 | 115 | 125 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/burgherr-2019.md | Local file text does not improve existing word count (125 -> 115 file words). |
| skip_no_gain | 129 | 127 | 129 | 0 | existing_short_summary_review | Sammendrag: Calundan (Aalborg Universitet, 2019) - Strategisk analyse av Salling Group | research/bibliotek/akademia/masteroppgaver/calundan-2019.md | Local file text does not improve existing word count (129 -> 127 file words). |
| skip_no_gain | 134 | 127 | 134 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/deljanin-2015.md | Local file text does not improve existing word count (134 -> 127 file words). |
| skip_no_gain | 130 | 128 | 130 | 0 | existing_short_summary_review | Sammendrag: Dräger & Vågene (NHH, 2017) — Markedskonsentrasjon i Skandinavia | research/bibliotek/akademia/masteroppgaver/drager-vagene-2017.md | Local file text does not improve existing word count (130 -> 128 file words). |
| skip_no_gain | 133 | 125 | 133 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md | Local file text does not improve existing word count (133 -> 125 file words). |
| skip_no_gain | 122 | 114 | 122 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/esposito-2022.md | Local file text does not improve existing word count (122 -> 114 file words). |
| skip_no_gain | 143 | 143 | 143 | 0 | existing_short_summary_review | Sammendrag: Fretheim & Rodnova (NHH, 2020) — Etableringshindringer i dagligvaremarkedet | research/bibliotek/akademia/masteroppgaver/fretheim-rodnova-2020.md | Local file text does not improve existing word count (143 -> 143 file words). |
| skip_no_gain | 145 | 143 | 145 | 0 | existing_short_summary_review | Sammendrag: Granlund & Lindskog (NTNU, 2024) - OT-sikkerhet i norsk matforsyning | research/bibliotek/akademia/masteroppgaver/granlund-lindskog-2024.md | Local file text does not improve existing word count (145 -> 143 file words). |
| skip_no_gain | 125 | 116 | 125 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md | Local file text does not improve existing word count (125 -> 116 file words). |
| skip_no_gain | 140 | 138 | 140 | 0 | existing_short_summary_review | Sammendrag: Jevne & Schiotz (NMBU, 2021) - Digitalisering av REKO-ringen | research/bibliotek/akademia/masteroppgaver/jevne-schiotz-2021.md | Local file text does not improve existing word count (140 -> 138 file words). |
| skip_no_gain | 118 | 118 | 118 | 0 | existing_short_summary_review | Sammendrag: Johannsson (University of Iceland, 2011) - Food security in Iceland | research/bibliotek/akademia/masteroppgaver/johannsson-2011.md | Local file text does not improve existing word count (118 -> 118 file words). |
| skip_no_gain | 129 | 118 | 129 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/kayhan-ronnback-2019.md | Local file text does not improve existing word count (129 -> 118 file words). |
| skip_no_gain | 124 | 115 | 124 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md | Local file text does not improve existing word count (124 -> 115 file words). |
| skip_no_gain | 146 | 146 | 146 | 0 | existing_short_summary_review | Sammendrag: Nielsen & Andersen (CBS, 2016) - Pris- og kvalitetsoppfatning | research/bibliotek/akademia/masteroppgaver/nielsen-andersen-2016.md | Local file text does not improve existing word count (146 -> 146 file words). |
| skip_no_gain | 139 | 139 | 139 | 0 | existing_short_summary_review | Sammendrag: Sandanger (NHH, 2012) — EMV og horisontal konkurranse | research/bibliotek/akademia/masteroppgaver/sandanger-2012.md | Local file text does not improve existing word count (139 -> 139 file words). |
| skip_no_gain | 128 | 119 | 128 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/sigurdardottir-2017.md | Local file text does not improve existing word count (128 -> 119 file words). |
| skip_no_gain | 142 | 140 | 142 | 0 | existing_short_summary_review | Sammendrag: Skjervheim Bernes & Flo (NHH, 2016) — Paraplykjedenes overtakelse av distribusjonen | research/bibliotek/akademia/masteroppgaver/skjervheim-bernes-flo-2016.md | Local file text does not improve existing word count (142 -> 140 file words). |
| skip_no_gain | 143 | 142 | 143 | 0 | existing_short_summary_review | Sammendrag: Skulstad & Svensson (NHH, 2024) — ICAs fall i Norge | research/bibliotek/akademia/masteroppgaver/skulstad-svensson-2024.md | Local file text does not improve existing word count (143 -> 142 file words). |
| skip_no_gain | 124 | 115 | 124 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md | Local file text does not improve existing word count (124 -> 115 file words). |
| skip_no_gain | 141 | 141 | 141 | 0 | existing_short_summary_review | Sammendrag: Steien (UiT, 2016) - Matsikkerhet og forsyningsberedskap | research/bibliotek/akademia/masteroppgaver/steien-2016.md | Local file text does not improve existing word count (141 -> 141 file words). |
| skip_no_gain | 134 | 124 | 134 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/stein-2022.md | Local file text does not improve existing word count (134 -> 124 file words). |
| skip_no_gain | 131 | 121 | 131 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/sundin-phd-2024.md | Local file text does not improve existing word count (131 -> 121 file words). |
| skip_no_gain | 112 | 103 | 112 | 0 | existing_short_summary_review | Untitled | research/bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md | Local file text does not improve existing word count (112 -> 103 file words). |
| skip_no_gain | 142 | 142 | 142 | 0 | existing_short_summary_review | Sammendrag: Tallaksen (Universitetet i Agder, 2022) - Studenter og kjottreduksjon | research/bibliotek/akademia/masteroppgaver/tallaksen-2022.md | Local file text does not improve existing word count (142 -> 142 file words). |
| skip_no_gain | 127 | 126 | 127 | 0 | existing_short_summary_review | Sammendrag: Tesdal (Universitetet i Oslo, 2012) - Nokkelhull og private aktorer | research/bibliotek/akademia/masteroppgaver/tesdal-2012.md | Local file text does not improve existing word count (127 -> 126 file words). |
| skip_no_gain | 143 | 143 | 143 | 0 | existing_short_summary_review | Sammendrag: Vangelsten (Nord University, 2017) - Norsk matsystem, selvforsyning og kjottkonsum | research/bibliotek/akademia/masteroppgaver/vangelsten-2017.md | Local file text does not improve existing word count (143 -> 143 file words). |
| skip_no_gain | 136 | 134 | 136 | 0 | existing_short_summary_review | Kunnskapsgrunnlag om kundeprogrammene i dagligvaremarkedet (SIFO 1-2026) | research/bibliotek/akademia/sifo/sifo-kundeprogram-2026.md | Local file text does not improve existing word count (136 -> 134 file words). |
| skip_no_gain | 143 | 135 | 143 | 0 | existing_short_summary_review | Melmølle-krisen og matsikkerhet på Island (2025) | research/bibliotek/beredskap/is-melmolle-krise-2025.md | Local file text does not improve existing word count (143 -> 135 file words). |
| skip_no_gain | 138 | 134 | 138 | 0 | existing_short_summary_review | Selvforsyningsgrad – sammenligning av beregninger (NIBIO 12(46), 2026) | research/bibliotek/beredskap/nibio-selvforsyning-2026.md | Local file text does not improve existing word count (138 -> 134 file words). |
| skip_no_gain | 102 | 99 | 102 | 0 | existing_short_summary_review | Livsmedelsberedskap för en ny tid (SOU 2024:8) | research/bibliotek/nordisk/sou-2024-8-svensk-beredskap.md | Local file text does not improve existing word count (102 -> 99 file words). |
| skip_no_gain | 131 | 130 | 131 | 0 | existing_short_summary_review | Markedskonsentrasjon og vertikal integrasjon på Island (2024) | research/bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md | Local file text does not improve existing word count (131 -> 130 file words). |
| skip_no_gain | 126 | 124 | 126 | 0 | existing_short_summary_review | Matsikkerhet og beredskap på landbruksområdet (Riksrevisjonen 2023) | research/bibliotek/offentlig/riksrevisjonen-matsikkerhet-2023.md | Local file text does not improve existing word count (126 -> 124 file words). |
| skip_no_gain | 149 | 141 | 149 | 0 | existing_short_summary_review | Sammendrag: Meld. St. 9 (2011-2012) - Landbruks- og matpolitikken | research/bibliotek/stortingsdok/meld-st-9-velkommen-til-bords.md | Local file text does not improve existing word count (149 -> 141 file words). |
| skip_no_gain | 139 | 134 | 139 | 0 | existing_short_summary_review | Sammendrag: Prop. 33 L (2019-2020) - Lov om god handelsskikk i dagligvarekjeden | research/bibliotek/stortingsdok/prop-33-l-god-handelsskikk.md | Local file text does not improve existing word count (139 -> 134 file words). |
| skip_no_gain | 97 | 92 | 97 | 0 | existing_short_summary_review | Soedertaelje Diet for a Green Planet evaluation | research/evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md | Local file text does not improve existing word count (97 -> 92 file words). |
| skip_no_gain | 144 | 142 | 144 | 0 | existing_short_summary_review | CAR Batch 07 Report - Biorest, Biogas, Digestat, Compost and Soil | research/_status/circular-food-actor-registry/reports/CAR-batch-07.md | Local file text does not improve existing word count (144 -> 142 file words). |
| skip_no_gain | 127 | 126 | 127 | 0 | existing_short_summary_review | CAR Batch 08 Report - Regenerative, Local and Small-Scale Practice Actors | research/_status/circular-food-actor-registry/reports/CAR-batch-08.md | Local file text does not improve existing word count (127 -> 126 file words). |
| skip_no_gain | 120 | 119 | 120 | 0 | existing_short_summary_review | CAR Batch 09 Report - Innovation Ecosystem and Support Actors | research/_status/circular-food-actor-registry/reports/CAR-batch-09.md | Local file text does not improve existing word count (120 -> 119 file words). |
| skip_no_gain | 107 | 103 | 107 | 0 | existing_short_summary_review | CAR Batch 10 Report - Founders, Key People and Ownership Layer | research/_status/circular-food-actor-registry/reports/CAR-batch-10.md | Local file text does not improve existing word count (107 -> 103 file words). |
| skip_no_gain | 121 | 120 | 121 | 0 | existing_short_summary_review | CAR Batch 11 Report - Failure, Dormant, Bankruptcy and Survival Cases | research/_status/circular-food-actor-registry/reports/CAR-batch-11.md | Local file text does not improve existing word count (121 -> 120 file words). |
| skip_no_gain | 80 | 78 | 80 | 0 | existing_short_summary_review | CAR Batch 12 Report - Final QC, Coverage Map and Export | research/_status/circular-food-actor-registry/reports/CAR-batch-12.md | Local file text does not improve existing word count (80 -> 78 file words). |
| skip_no_gain | 143 | 134 | 143 | 0 | existing_short_summary_review | Mottakslogg: lokale-verdikjeder / andelslandbruk / NO | research/_status/domene-mottakslogg-andelslandbruk-2026-06-25.md | Local file text does not improve existing word count (143 -> 134 file words). |
| skip_no_gain | 148 | 139 | 148 | 0 | existing_short_summary_review | Mottakslogg: regenerativ-praksis / market-gardening / NO | research/_status/domene-mottakslogg-market-gardening-2026-06-25.md | Local file text does not improve existing word count (148 -> 139 file words). |
| skip_no_gain | 144 | 139 | 144 | 0 | existing_short_summary_review | Domene-usikkerhetslogg 2026-06-25 | research/_status/domene-usikkerhetslogg-2026-06-25.md | Local file text does not improve existing word count (144 -> 139 file words). |
