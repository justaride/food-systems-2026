# Library Analysis Decision Queue

Generated: 2026-07-20T03:39:34.306Z

Dette er en read-only beslutningsko for library-analysis-rader der mekanisk tekst-/koblingsreparasjon er tomt eller utilstrekkelig. Dette er ikke en claim-ko, oppgraderer ikke AI-kontekst, og endrer ikke citation-readiness.

## Bruksgrenser

- Manuell kildehenting: finn fulltekst, bedre URL, PDF eller kontrollerbar lokal kilde foer ny repair/prosess-kjoring.
- Kurateringsbeslutning: avklar om kort rad skal beholdes som intern stub, utvides med kilder, eller parkeres.
- AI-kontekst: rader her er ikke safe_for_ai_context foer ny library-analysis-prosess har fjernet risikoflagg.
- Claim-bruk: ingen claim-kandidat uten PCQ/claim-lock, gate:overclaim og audit:citable.

Full radliste: `research/_status/library-analysis-decision-queue.json`

## Sammendrag

| Metric | Count |
|---|---:|
| Total decision rows | 89 |
| Mechanical update candidates | 24 |

### Decision Kind

| Value | Count |
|---|---:|
| manual_source_fetch | 8 |
| mechanical_url_repair_candidate | 24 |
| short_summary_curation | 57 |

### Decision Lane

| Value | Count |
|---|---:|
| curation_decision | 57 |
| manual_source_hunt | 8 |
| mechanical_repair | 24 |

### Priority

| Value | Count |
|---|---:|
| P1 | 32 |
| P2 | 57 |

### Repair Batch

| Value | Count |
|---|---:|
| existing_short_summary_review | 69 |
| existing_source_locator_stub_review | 2 |
| missing_document_locator_search | 7 |
| url_backed_text_extraction | 11 |

### URL Extraction Status

| Value | Count |
|---|---:|
| extractable_150_499 | 1 |
| extractable_500_plus | 23 |
| fetch_failed | 1 |
| http_error | 4 |
| no_extracted_text | 3 |
| no_gain | 9 |
| none | 44 |
| small_text | 3 |
| too_large | 1 |

### Local Repair Action

| Value | Count |
|---|---:|
| none | 18 |
| skip_below_quality_floor | 17 |
| skip_no_gain | 54 |

## Prioritert utvalg

Rows shown below: 89 of 89

| Priority | Decision | Lane | Repair batch | Words | URL status | Local action | Title | Path/source | Action |
|---|---|---|---|---:|---|---|---|---|---|
| P1 | manual_source_fetch | manual_source_hunt | existing_source_locator_stub_review | 9 | no_extracted_text | skip_below_quality_floor | Capital raise and business model 2024 | evidence-pack/internasjonal/agrain-2024.md | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | existing_source_locator_stub_review | 9 | small_text | skip_below_quality_floor | Rest Oslo - Green Star profile | evidence-pack/sirkular-konkurser/rest-oslo/michelin-profile.md | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 9 | http_error |  | Beyond FLW Reduction Targets: Measuring and Valuing Food Loss and Waste | https://www.oecd.org/en/publications/beyond-food-loss-and-waste-reduction-targets_59cf6c95-en.html | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 14 | small_text |  | Reitan Eiendom aarsrapport 2024 | https://2024.reitaneiendom.no/ | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 14 | too_large |  | Feeding a Monster: Vest-afrikansk fiskemel i norsk laksefor | https://www.greenpeace.org/static/planet4-africa-stateless/2021/05/47227297-feeding-a-monster-en-final-small.pdf | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 20 | no_extracted_text |  | Managing a Circular Food System in Sustainable Urban Farming. Experimental Research at the Turku University Campus (Finland) | https://www.mdpi.com/2071-1050/13/11/6231 | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 26 | small_text |  | Nested circularity in food systems: A Nordic case study on connecting biomass, nutrient and energy flows from field scale to continent | https://ui.adsabs.harvard.edu/abs/2021RCR...16405218K/abstract | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | manual_source_fetch | manual_source_hunt | url_backed_text_extraction | 59 | http_error |  | Future Nordic Diets: Exploring ways for sustainably feeding the Nordics | https://www.norden.org/en/publication/future-nordic-diets | Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | url_backed_text_extraction | 11 | extractable_500_plus |  | Konkurrensverket rapport 2025:5 — Utvärdering av lagen om förbud mot otillbörliga handelsmetoder | https://www.konkurrensverket.se/informationsmaterial/rapportlista/utvardering-av-lagen-om-forbud-mot-otillborliga-handelsmetoder/ | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | url_backed_text_extraction | 11 | extractable_500_plus |  | KFST Evaluering af foedevarehandelsloven 2024 | https://kfst.dk/media/3wxbfqqe/20241120-evaluering-af-foedevarehandelsloven-2024.pdf | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | url_backed_text_extraction | 11 | extractable_500_plus |  | Naermaste konkurrent-analys: 290 kommuner | https://www.konkurrensverket.se/informationsmaterial/rapportlista/dagligvaruhandelns-etablering-i-kommunerna/ | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | url_backed_text_extraction | 13 | extractable_500_plus |  | Elintarvikemarkkinavaltuutetun toimintakertomus 2024 | https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | url_backed_text_extraction | 13 | extractable_500_plus |  | Handlingsplan for en sirkulaer okonomi 2024-2025 | https://www.regjeringen.no/no/dokumenter/handlingsplan-for-en-sirkular-okonomi/id3029477/ | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 73 | extractable_500_plus | skip_below_quality_floor | Hagar management report 2024-25 | bibliotek/media/snapshots/is-hagar-management-2024-25.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 75 | extractable_500_plus | skip_below_quality_floor | Retail Foods Annual Denmark DA2025-0002 | bibliotek/media/snapshots/dk-usda-gain-retail-2025.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 78 | extractable_500_plus | skip_below_quality_floor | The structure of the retail sector in Iceland | bibliotek/media/snapshots/is-bifrost-retail-sector.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 79 | extractable_500_plus | skip_below_quality_floor | Salling Group AS erhvervelse af dele af Coop Danmark AS | bibliotek/media/snapshots/dk-kfst-salling-coop-pdf-2025.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 129 | extractable_500_plus | skip_no_gain | Sammendrag: Calundan (Aalborg Universitet, 2019) - Strategisk analyse av Salling Group | bibliotek/akademia/masteroppgaver/calundan-2019.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 131 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Meile (NHH, 2020) — Uniform Pricing i norsk dagligvare | bibliotek/akademia/masteroppgaver/meile-2020.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 131 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Nilsen & Paulsen (NHH, 2025) — Pristransmisjon for kakao og kaffe | bibliotek/akademia/masteroppgaver/nilsen-paulsen-2025.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 131 | extractable_500_plus | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/sundin-phd-2024.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 133 | extractable_500_plus | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 133 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Huynh & Mortensen (Aalborg Universitet, 2025) — Salling Group vs. Coop Danmark | bibliotek/akademia/masteroppgaver/huynh-mortensen-2025.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 136 | extractable_150_499 | skip_no_gain | Kunnskapsgrunnlag om kundeprogrammene i dagligvaremarkedet (SIFO 1-2026) | bibliotek/akademia/sifo/sifo-kundeprogram-2026.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 137 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Khandaker (SLU, 2021) - Lantmannen-kornkjeden under pandemi | bibliotek/akademia/masteroppgaver/khandaker-2021.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 137 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Martens & Norum (NHH, 2020) — Importvernets påvirkning på leverandørkonsentrasjon | bibliotek/akademia/masteroppgaver/martens-norum-2020.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 138 | extractable_500_plus | skip_below_quality_floor | Sammendrag: Adlers (SLU, 2022) - Svensk selvforsyning av kjott og korn | bibliotek/akademia/masteroppgaver/adlers-2022.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 142 | extractable_500_plus | skip_below_quality_floor | Prop. 33 L (2019–2020) – Chapter 2: Bakgrunnen for lovforslaget | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Prop 33 L (2019-2020) Ch 2 Bakgrunn for lovforslag om god handelsskikk.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 142 | extractable_500_plus | skip_no_gain | Sammendrag: Skjervheim Bernes & Flo (NHH, 2016) — Paraplykjedenes overtakelse av distribusjonen | bibliotek/akademia/masteroppgaver/skjervheim-bernes-flo-2016.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 143 | extractable_500_plus | skip_no_gain | Sammendrag: Fretheim & Rodnova (NHH, 2020) — Etableringshindringer i dagligvaremarkedet | bibliotek/akademia/masteroppgaver/fretheim-rodnova-2020.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 143 | extractable_500_plus | skip_no_gain | Sammendrag: Skulstad & Svensson (NHH, 2024) — ICAs fall i Norge | bibliotek/akademia/masteroppgaver/skulstad-svensson-2024.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P1 | mechanical_url_repair_candidate | mechanical_repair | existing_short_summary_review | 146 | extractable_500_plus | skip_no_gain | Sammendrag: Nielsen & Andersen (CBS, 2016) - Pris- og kvalitetsoppfatning | bibliotek/akademia/masteroppgaver/nielsen-andersen-2016.md | Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 43 |  |  | Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 48 |  |  | Food Systems 2026 pilot- og finansieringsdossierer |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 52 |  |  | Solutions Menu |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 54 |  | skip_below_quality_floor | 5. Lovdata: Forskrift om ikraftsetting og avvikling | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2026 04 17 601 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 54 |  |  | Food Systems 2026 interne metode- og figurartefakter |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 65 |  | skip_no_gain | Rapport fra havforskningen 2026-7 | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2026 7 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 65 |  |  | Lönsamheten i livsmedelsindustrin, dagligvaruhandeln och dess grossister – en ekonomisk analys |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 66 |  |  | Åtgärder för att förbättra förutsättningarna för etablering av dagligvarubutiker |  | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 77 |  | skip_below_quality_floor | Untitled | evidence-pack/okologisk-norden-2026-04-29/downloads/is-hagstofa-sdg-2-4-1-2026.md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 80 |  | skip_no_gain | CAR Batch 12 Report - Final QC, Coverage Map and Export | _status/circular-food-actor-registry/reports/CAR-batch-12.md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 83 |  | skip_no_gain | 4. Lovdata: Lov om god handelsskikk i dagligvarekjeden | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2020 04 17 29 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 88 |  | skip_no_gain | Assessing Amino Acid Solubility of Black Soldier Fly Larvae Meal in Atlantic Salmon | arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PMC - 9727232 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 88 |  | skip_no_gain | Alternative Protein Sources in Aquafeed: Current Scenario and Future Perspectives | arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PubMed - 39280774 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 94 |  | skip_no_gain | Rapport fra havforskningen 2025-14 | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2025 14 (2024).md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 97 | no_gain | skip_no_gain | Soedertaelje Diet for a Green Planet evaluation | evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md | Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 102 |  | skip_no_gain | Livsmedelsberedskap för en ny tid (SOU 2024:8) | bibliotek/nordisk/sou-2024-8-svensk-beredskap.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 107 |  | skip_no_gain | Rapport fra havforskningen 2024-4 | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2024 4 (2024).md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 107 |  | skip_no_gain | CAR Batch 10 Report - Founders, Key People and Ownership Layer | _status/circular-food-actor-registry/reports/CAR-batch-10.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 112 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 112 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 118 | http_error | skip_no_gain | Sammendrag: Johannsson (University of Iceland, 2011) - Food security in Iceland | bibliotek/akademia/masteroppgaver/johannsson-2011.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 120 |  | skip_no_gain | CAR Batch 09 Report - Innovation Ecosystem and Support Actors | _status/circular-food-actor-registry/reports/CAR-batch-09.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 121 |  | skip_no_gain | CAR Batch 11 Report - Failure, Dormant, Bankruptcy and Survival Cases | _status/circular-food-actor-registry/reports/CAR-batch-11.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 122 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/esposito-2022.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 123 | http_error | skip_below_quality_floor | Sammendrag: Gangstøe (UiB, 2019) — Hemmelige kontrakter i dagligvaremarkedet | bibliotek/akademia/masteroppgaver/gangstoe-2019.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 124 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 124 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 125 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/burgherr-2019.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 125 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 126 |  | skip_no_gain | Matsikkerhet og beredskap på landbruksområdet (Riksrevisjonen 2023) | bibliotek/offentlig/riksrevisjonen-matsikkerhet-2023.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 127 | no_gain | skip_no_gain | Sammendrag: Tesdal (Universitetet i Oslo, 2012) - Nokkelhull og private aktorer | bibliotek/akademia/masteroppgaver/tesdal-2012.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 127 |  | skip_no_gain | CAR Batch 08 Report - Regenerative, Local and Small-Scale Practice Actors | _status/circular-food-actor-registry/reports/CAR-batch-08.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 128 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/sigurdardottir-2017.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 129 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/kayhan-ronnback-2019.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 130 | no_extracted_text | skip_no_gain | Sammendrag: Dräger & Vågene (NHH, 2017) — Markedskonsentrasjon i Skandinavia | bibliotek/akademia/masteroppgaver/drager-vagene-2017.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 131 |  | skip_no_gain | 3. Stortinget: Innst. 130 S (2025–2026) | arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Stortinget - inns 202526 130s (2024).md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 131 |  | skip_no_gain | Markedskonsentrasjon og vertikal integrasjon på Island (2024) | bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 132 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 133 | no_gain | skip_below_quality_floor | Vertikale restriksjoner og konkurranse i dagligvaremarkedet (Simen A. Ulsaker PhD) | bibliotek/akademia/masteroppgaver/ulsaker-phd-sammendrag.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 134 | fetch_failed | skip_no_gain | Sammendrag: Barbakken & Hausken (NHH, 2006) — Relasjoner mellom detaljist og produsent | bibliotek/akademia/masteroppgaver/barbakken-hausken-2006.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 134 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/deljanin-2015.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 134 |  | skip_no_gain | Untitled | bibliotek/akademia/masteroppgaver/stein-2022.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 138 |  | skip_no_gain | Selvforsyningsgrad – sammenligning av beregninger (NIBIO 12(46), 2026) | bibliotek/beredskap/nibio-selvforsyning-2026.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 139 | no_gain | skip_no_gain | Sammendrag: Sandanger (NHH, 2012) — EMV og horisontal konkurranse | bibliotek/akademia/masteroppgaver/sandanger-2012.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 139 |  | skip_no_gain | Sammendrag: Prop. 33 L (2019-2020) - Lov om god handelsskikk i dagligvarekjeden | bibliotek/stortingsdok/prop-33-l-god-handelsskikk.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 140 | no_gain | skip_no_gain | Sammendrag: Jevne & Schiotz (NMBU, 2021) - Digitalisering av REKO-ringen | bibliotek/akademia/masteroppgaver/jevne-schiotz-2021.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 141 | no_gain | skip_no_gain | Sammendrag: Steien (UiT, 2016) - Matsikkerhet og forsyningsberedskap | bibliotek/akademia/masteroppgaver/steien-2016.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 142 | no_gain | skip_no_gain | Sammendrag: Tallaksen (Universitetet i Agder, 2022) - Studenter og kjottreduksjon | bibliotek/akademia/masteroppgaver/tallaksen-2022.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 143 | no_gain | skip_no_gain | Sammendrag: Vangelsten (Nord University, 2017) - Norsk matsystem, selvforsyning og kjottkonsum | bibliotek/akademia/masteroppgaver/vangelsten-2017.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 143 |  | skip_no_gain | Melmølle-krisen og matsikkerhet på Island (2025) | bibliotek/beredskap/is-melmolle-krise-2025.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 143 |  | skip_no_gain | Mottakslogg: lokale-verdikjeder / andelslandbruk / NO | _status/domene-mottakslogg-andelslandbruk-2026-06-25.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 144 |  | skip_no_gain | CAR Batch 07 Report - Biorest, Biogas, Digestat, Compost and Soil | _status/circular-food-actor-registry/reports/CAR-batch-07.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 144 |  | skip_no_gain | Domene-usikkerhetslogg 2026-06-25 | _status/domene-usikkerhetslogg-2026-06-25.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 145 | no_gain | skip_no_gain | Sammendrag: Granlund & Lindskog (NTNU, 2024) - OT-sikkerhet i norsk matforsyning | bibliotek/akademia/masteroppgaver/granlund-lindskog-2024.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | missing_document_locator_search | 145 |  |  | Future Nordic Diets |  | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 148 |  | skip_no_gain | Mottakslogg: regenerativ-praksis / market-gardening / NO | _status/domene-mottakslogg-market-gardening-2026-06-25.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
| P2 | short_summary_curation | curation_decision | existing_short_summary_review | 149 |  | skip_no_gain | Sammendrag: Meld. St. 9 (2011-2012) - Landbruks- og matpolitikken | bibliotek/stortingsdok/meld-st-9-velkommen-til-bords.md | Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder. |
