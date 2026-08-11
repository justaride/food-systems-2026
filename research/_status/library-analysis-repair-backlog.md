# Library Analysis Repair Backlog

Generated: 2026-07-20T03:39:05.563Z

Denne backloggen er en mekanisk arbeidsflate for missing-text/review-koen i LibraryAnalysisRecord. Den endrer ikke AI-kort, lager ikke claim-kandidater, og gjor ingen ekstern publisering.

## Bruksgrenser

- Mekanisk tekst-/koblingsreparasjon: finn, remapp, importer eller trekk ut tekst slik at kilden kan vurderes paa nytt.
- Intern AI-kontekst: kan forst vurderes etter at tekst/lokator er reparert og ordinare library-analysis-gater er kjort paa nytt.
- Claim-kandidater: skal fortsatt gjennom PCQ/claim-lock, gate:overclaim og audit:citable; denne backloggen aapner ingen claims.
- Ekstern publiserbar bruk: fortsatt blokkert til citable/overclaim-gatene har godkjent konkret bruk.

Full radliste: `research/_status/library-analysis-repair-backlog.json`

## LibraryAnalysisRecord Snapshot

| Metric | Count |
|---|---:|
| Total records | 1572 |

### Status

| Value | Count |
|---|---:|
| ai_draft | 1444 |
| approved_internal | 35 |
| blocked | 4 |
| review_required | 89 |

### Usage Rule

| Value | Count |
|---|---:|
| do_not_use_for_claims | 4 |
| internal_background | 1533 |
| safe_for_ai_context | 35 |

### Source Kind

| Value | Count |
|---|---:|
| document | 1549 |
| library_file | 5 |
| report | 6 |
| source_doc | 11 |
| thesis | 1 |

### Link Matrix

| Value | Count |
|---|---:|
| doc:false\|sourceDoc:false\|path:false | 7 |
| doc:false\|sourceDoc:false\|path:true | 10 |
| doc:false\|sourceDoc:true\|path:false | 11 |
| doc:false\|sourceDoc:true\|path:true | 10 |
| doc:true\|sourceDoc:false\|path:true | 1346 |
| doc:true\|sourceDoc:true\|path:true | 188 |

### Risk Flags

| Value | Count |
|---|---:|
| blocked_source | 4 |
| curated_short_summary | 1 |
| loose_library_file | 5 |
| low_text_quality | 89 |
| missing_file_path | 18 |
| unverified_report_claims | 7 |
| url_backed_internal_context | 11 |

## Sammendrag

| Metric | Count |
|---|---:|
| Total repair rows | 89 |
| existing_low_text | 71 |
| missing_document_locator | 7 |
| url_backed_low_text | 11 |

## Fordeling

### Repair Batch

| Value | Count |
|---|---:|
| existing_short_summary_review | 69 |
| existing_source_locator_stub_review | 2 |
| missing_document_locator_search | 7 |
| url_backed_text_extraction | 11 |

### Source Kind

| Value | Count |
|---|---:|
| document | 71 |
| report | 6 |
| source_doc | 11 |
| thesis | 1 |

### Path State

| Value | Count |
|---|---:|
| no_path | 18 |
| path_exists | 71 |

### Path Resolution

| Value | Count |
|---|---:|
| none | 18 |
| research_prefix | 71 |

### Extension

| Value | Count |
|---|---:|
| .md | 71 |
| none | 18 |

### Risk Flags

| Value | Count |
|---|---:|
| low_text_quality | 89 |
| missing_file_path | 18 |
| unverified_report_claims | 2 |

## Prioritert utvalg

Rows shown below: 80 of 89

| Priority | Repair kind | Repair batch | Source kind | Title | Words | Path state | Path resolution | Path/source | Action |
|---|---|---|---|---|---:|---|---|---|---|
| P1 | missing_document_locator | missing_document_locator_search | thesis | Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning | 43 | no_path | none | thesis:tesdal-2013 | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Food Systems 2026 pilot- og finansieringsdossierer | 48 | no_path | none | report:food-systems-2026-pilot-funding-dossiers | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Solutions Menu | 52 | no_path | none | report:solutions-menu-2018 | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Food Systems 2026 interne metode- og figurartefakter | 54 | no_path | none | report:food-systems-2026-internal-artifact-register | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Lönsamheten i livsmedelsindustrin, dagligvaruhandeln och dess grossister – en ekonomisk analys | 65 | no_path | none | report:konkurrensverket-lonsamhet-2025 | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Åtgärder för att förbättra förutsättningarna för etablering av dagligvarubutiker | 66 | no_path | none | report:konkurrensverket-etablering-2026 | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P1 | missing_document_locator | missing_document_locator_search | report | Future Nordic Diets | 145 | no_path | none | report:future-nordic-diets-tn2017-566 | Finn importkilde eller lokal filsti for Document-raden; behold som intern bakgrunn til lokator finnes. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Beyond FLW Reduction Targets: Measuring and Valuing Food Loss and Waste | 9 | no_path | none | oecd-flw-2025.md | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | KFST Evaluering af foedevarehandelsloven 2024 | 11 | no_path | none | kfst-evaluering-foedevarehandelsloven-2024.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Konkurrensverket rapport 2025:5 — Utvärdering av lagen om förbud mot otillbörliga handelsmetoder | 11 | no_path | none | konkurrensverket-2025-5-livsmedel.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Naermaste konkurrent-analys: 290 kommuner | 11 | no_path | none | konkurrensverket-2024-4.md | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Elintarvikemarkkinavaltuutetun toimintakertomus 2024 | 13 | no_path | none | etmv-toimintakertomus-2024.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Handlingsplan for en sirkulaer okonomi 2024-2025 | 13 | no_path | none | regjeringen-handlingsplan-sirkulaer-okonomi-2024-2025.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Feeding a Monster: Vest-afrikansk fiskemel i norsk laksefor | 14 | no_path | none | greenpeace-feeding-monster-2021.md | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Reitan Eiendom aarsrapport 2024 | 14 | no_path | none | reitan-eiendom-2024.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Managing a Circular Food System in Sustainable Urban Farming. Experimental Research at the Turku University Campus (Finland) | 20 | no_path | none | mdpi-2071-1050-13-11-6231-turku-circular-food.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Nested circularity in food systems: A Nordic case study on connecting biomass, nutrient and energy flows from field scale to continent | 26 | no_path | none | nested-circularity-finland-2023.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P2 | url_backed_low_text | url_backed_text_extraction | source_doc | Future Nordic Diets: Exploring ways for sustainably feeding the Nordics | 59 | no_path | none | research/evidence-pack/nordisk/future-nordic-diets-tn2017-566.pdf | Bruk eksisterende URL/DOI som locator; last ned/ekstraher kontrollert tekst eller behold som URL-only intern bakgrunn. |
| P3 | existing_low_text | existing_source_locator_stub_review | document | Capital raise and business model 2024 | 9 | path_exists | research_prefix | research/evidence-pack/internasjonal/agrain-2024.md | Bruk lenke-stubben til kontrollert kildeinnhenting/tekstimport, eller behold den som locator-only bakgrunn. |
| P3 | existing_low_text | existing_source_locator_stub_review | document | Rest Oslo - Green Star profile | 9 | path_exists | research_prefix | research/evidence-pack/sirkular-konkurser/rest-oslo/michelin-profile.md | Bruk lenke-stubben til kontrollert kildeinnhenting/tekstimport, eller behold den som locator-only bakgrunn. |
| P3 | existing_low_text | existing_short_summary_review | document | 5. Lovdata: Forskrift om ikraftsetting og avvikling | 54 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2026 04 17 601 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Rapport fra havforskningen 2026-7 | 65 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2026 7 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Hagar management report 2024-25 | 73 | path_exists | research_prefix | research/bibliotek/media/snapshots/is-hagar-management-2024-25.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Retail Foods Annual Denmark DA2025-0002 | 75 | path_exists | research_prefix | research/bibliotek/media/snapshots/dk-usda-gain-retail-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 77 | path_exists | research_prefix | research/evidence-pack/okologisk-norden-2026-04-29/downloads/is-hagstofa-sdg-2-4-1-2026.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | The structure of the retail sector in Iceland | 78 | path_exists | research_prefix | research/bibliotek/media/snapshots/is-bifrost-retail-sector.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Salling Group AS erhvervelse af dele af Coop Danmark AS | 79 | path_exists | research_prefix | research/bibliotek/media/snapshots/dk-kfst-salling-coop-pdf-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | CAR Batch 12 Report - Final QC, Coverage Map and Export | 80 | path_exists | research_prefix | research/_status/circular-food-actor-registry/reports/CAR-batch-12.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | 4. Lovdata: Lov om god handelsskikk i dagligvarekjeden | 83 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Lovdata - 2020 04 17 29 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Alternative Protein Sources in Aquafeed: Current Scenario and Future Perspectives | 88 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PubMed - 39280774 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Assessing Amino Acid Solubility of Black Soldier Fly Larvae Meal in Atlantic Salmon | 88 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/PMC - 9727232 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Rapport fra havforskningen 2025-14 | 94 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2025 14 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Soedertaelje Diet for a Green Planet evaluation | 97 | path_exists | research_prefix | research/evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Livsmedelsberedskap för en ny tid (SOU 2024:8) | 102 | path_exists | research_prefix | research/bibliotek/nordisk/sou-2024-8-svensk-beredskap.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | CAR Batch 10 Report - Founders, Key People and Ownership Layer | 107 | path_exists | research_prefix | research/_status/circular-food-actor-registry/reports/CAR-batch-10.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Rapport fra havforskningen 2024-4 | 107 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Havforskningsinstituttet - rapport fra havforskningen 2024 4 (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 112 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 112 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/sundqvist-phd-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Johannsson (University of Iceland, 2011) - Food security in Iceland | 118 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/johannsson-2011.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | CAR Batch 09 Report - Innovation Ecosystem and Support Actors | 120 | path_exists | research_prefix | research/_status/circular-food-actor-registry/reports/CAR-batch-09.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | CAR Batch 11 Report - Failure, Dormant, Bankruptcy and Survival Cases | 121 | path_exists | research_prefix | research/_status/circular-food-actor-registry/reports/CAR-batch-11.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 122 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/esposito-2022.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Gangstøe (UiB, 2019) — Hemmelige kontrakter i dagligvaremarkedet | 123 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/gangstoe-2019.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 124 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/lehtokunnas-phd-2023.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 124 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/sorensen-phd-2016.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 125 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/hebrok-phd-2020.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 125 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/burgherr-2019.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Matsikkerhet og beredskap på landbruksområdet (Riksrevisjonen 2023) | 126 | path_exists | research_prefix | research/bibliotek/offentlig/riksrevisjonen-matsikkerhet-2023.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | CAR Batch 08 Report - Regenerative, Local and Small-Scale Practice Actors | 127 | path_exists | research_prefix | research/_status/circular-food-actor-registry/reports/CAR-batch-08.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Tesdal (Universitetet i Oslo, 2012) - Nokkelhull og private aktorer | 127 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/tesdal-2012.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 128 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/sigurdardottir-2017.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Calundan (Aalborg Universitet, 2019) - Strategisk analyse av Salling Group | 129 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/calundan-2019.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 129 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/kayhan-ronnback-2019.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Dräger & Vågene (NHH, 2017) — Markedskonsentrasjon i Skandinavia | 130 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/drager-vagene-2017.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | 3. Stortinget: Innst. 130 S (2025–2026) | 131 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Stortinget - inns 202526 130s (2024).md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Markedskonsentrasjon og vertikal integrasjon på Island (2024) | 131 | path_exists | research_prefix | research/bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Meile (NHH, 2020) — Uniform Pricing i norsk dagligvare | 131 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/meile-2020.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Nilsen & Paulsen (NHH, 2025) — Pristransmisjon for kakao og kaffe | 131 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/nilsen-paulsen-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 131 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/sundin-phd-2024.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 132 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/brancoli-phd-2021.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Huynh & Mortensen (Aalborg Universitet, 2025) — Salling Group vs. Coop Danmark | 133 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/huynh-mortensen-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 133 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/eriksson-phd-2015.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Vertikale restriksjoner og konkurranse i dagligvaremarkedet (Simen A. Ulsaker PhD) | 133 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/ulsaker-phd-sammendrag.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Barbakken & Hausken (NHH, 2006) — Relasjoner mellom detaljist og produsent | 134 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/barbakken-hausken-2006.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 134 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/deljanin-2015.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Untitled | 134 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/stein-2022.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Kunnskapsgrunnlag om kundeprogrammene i dagligvaremarkedet (SIFO 1-2026) | 136 | path_exists | research_prefix | research/bibliotek/akademia/sifo/sifo-kundeprogram-2026.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Khandaker (SLU, 2021) - Lantmannen-kornkjeden under pandemi | 137 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/khandaker-2021.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Martens & Norum (NHH, 2020) — Importvernets påvirkning på leverandørkonsentrasjon | 137 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/martens-norum-2020.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Adlers (SLU, 2022) - Svensk selvforsyning av kjott og korn | 138 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/adlers-2022.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Selvforsyningsgrad – sammenligning av beregninger (NIBIO 12(46), 2026) | 138 | path_exists | research_prefix | research/bibliotek/beredskap/nibio-selvforsyning-2026.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Prop. 33 L (2019-2020) - Lov om god handelsskikk i dagligvarekjeden | 139 | path_exists | research_prefix | research/bibliotek/stortingsdok/prop-33-l-god-handelsskikk.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Sandanger (NHH, 2012) — EMV og horisontal konkurranse | 139 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/sandanger-2012.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Jevne & Schiotz (NMBU, 2021) - Digitalisering av REKO-ringen | 140 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/jevne-schiotz-2021.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Steien (UiT, 2016) - Matsikkerhet og forsyningsberedskap | 141 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/steien-2016.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Prop. 33 L (2019–2020) – Chapter 2: Bakgrunnen for lovforslaget | 142 | path_exists | research_prefix | research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Regjeringen - Prop 33 L (2019-2020) Ch 2 Bakgrunn for lovforslag om god handelsskikk.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Skjervheim Bernes & Flo (NHH, 2016) — Paraplykjedenes overtakelse av distribusjonen | 142 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/skjervheim-bernes-flo-2016.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Sammendrag: Tallaksen (Universitetet i Agder, 2022) - Studenter og kjottreduksjon | 142 | path_exists | research_prefix | research/bibliotek/akademia/masteroppgaver/tallaksen-2022.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Melmølle-krisen og matsikkerhet på Island (2025) | 143 | path_exists | research_prefix | research/bibliotek/beredskap/is-melmolle-krise-2025.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
| P3 | existing_low_text | existing_short_summary_review | document | Mottakslogg: lokale-verdikjeder / andelslandbruk / NO | 143 | path_exists | research_prefix | research/_status/domene-mottakslogg-andelslandbruk-2026-06-25.md | Behold som kort internt sammendrag eller utvid med kontrollert kildeuttrekk foer eventuell AI-kontekst. |
