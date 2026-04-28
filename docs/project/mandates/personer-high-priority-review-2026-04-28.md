# Personer: HIGH-kandidater for manuell review

Dato: 2026-04-28

Dette er en triagefil for de 33 høyest prioriterte personkandidatene fra råkorpus-passet. Den er ikke en importliste. Hver kandidat må valideres mot kilde og scope før `PersonProfile` eller `ActorContact` oppdateres.

## Arbeidsregler

- Bruk `PersonProfile` bare når personen faktisk skal være del av person-/interlocking-katalogen eller økosystemprofilene.
- Bruk `ActorContact` når personen primært er kontakt, prosjektpartner, møteperson eller intern ressurs.
- Ekskluder kildefootere, redaktørnavn, rapportmetadata og andre treff som ikke beskriver en relevant personrolle.
- Ikke importer kandidater automatisk fra denne filen.
- Generatoren bevarer eksisterende `decision` og `notes` i CSV-en når den kjøres på nytt.

Gyldige beslutningsverdier: `add_person_profile`, `add_actor_contact`, `add_both`, `keep_actor_contact`, `exclude`, `needs_source_check`, `defer`.

## Oppsummering

| Metrikk | Verdi |
| --- | --- |
| Generert fra | research/_status/person-korpus-kandidater-2026-04-28.json |
| Korpus generert | 2026-04-28T12:53:24.491Z |
| HIGH-kandidater | 33 |
| ActorContact-only blant HIGH | 15 |
| Missing candidate blant HIGH | 18 |

## Anbefalte Bøtter

| Anbefalt bøtte | Antall |
| --- | --- |
| REVIEW_ECOSYSTEM_PERSON_PROFILE | 18 |
| REVIEW_ACADEMIC_PROFILE | 8 |
| REVIEW_POLICY_PROFILE | 2 |
| REVIEW_PROJECT_PARTNER_PROFILE | 2 |
| KEEP_ACTOR_CONTACT | 2 |
| EXCLUDE_SOURCE_FOOTER_NOISE | 1 |

## Mulige Importmål

| Mulig importmål | Antall |
| --- | --- |
| ActorContact_or_PersonProfile | 15 |
| PersonProfile | 15 |
| ActorContact | 2 |
| Exclude | 1 |

## Reviewtabell

| Beslutning | Navn | Status | Anbefaling | Mål | Treff | Kilder | Evidens |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [ ] | Bent Hoeie | actor_contact_only | REVIEW_POLICY_PROFILE | ActorContact_or_PersonProfile | 8 | 5 | utvalgsleder |
| [ ] | Michel Bajuk | missing_candidate | REVIEW_PROJECT_PARTNER_PROFILE | ActorContact_or_PersonProfile | 9 | 7 | into analysis - Contradictions flagged and investigated --- ### Mission 2: Nordic Partner Data Validation **Objective:** Send our Nordic comparison data to Michel Bajuk... |
| [ ] | Betina Simonsen | missing_candidate | REVIEW_PROJECT_PARTNER_PROFILE | ActorContact_or_PersonProfile | 8 | 7 | ged and investigated --- ### Mission 2: Nordic Partner Data Validation **Objective:** Send our Nordic comparison data to Michel Bajuk (Sweden/Cradlenet) and Betina Simon... |
| [ ] | Frode Steen | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 8 | 7 | # Sammendrag: Frode Steen — Publikasjonsprofil **Full tittel:** Frode Steen — NorgesGruppen-professor i konkurranseøkonomi, NHH **Dato:** 25. mars 2026 (Analysert) **Kil... |
| [ ] | Paola Federica Albizzati | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 7 | 7 | --- title: "Sustainability Assessment of Food Waste Management" author: Paola Federica Albizzati institution: DTU year: 2021 degree: PhD tags: [matsvinn, håndtering, LCA... |
| [ ] | Minna Kaljonen | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 5 | 3 | institusjoner enn enkeltstående aktivister, med stor tillit til statlige forskningsorganer og sikkerhetsmyndigheter (HVK).* ### Forskere og Akademikere * **Minna Kaljone... |
| [ ] | Hanne Fjerdingby Olsen | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 4 | 2 | Professor, baerekraftige matsystemer |
| [ ] | Antonia Ax:son Johnson | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 4 | 4 | m.m., som viser metodikken for sirkulær innovasjon som også brukes i matsystemarbeidet.[^11][^1][^2] *** ## 3. Nøkkelpersoner og styring - **Grunnlegger:** Antonia Ax:so... |
| [ ] | Carsten Lind Pedersen | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 4 | 4 | ght to full operation within a foreseeable timeframe. However, the market’s reluctance has made it difficult to secure adequate sales and financing,” said CEO, Carsten L... |
| [ ] | Nils Kristen Sandtroen | actor_contact_only | REVIEW_POLICY_PROFILE | ActorContact_or_PersonProfile | 4 | 2 | --- ## Nokkelpersoner ### Politiske beslutningstakere / Person / Tilknytning / Land / Relevans FS2026 / /--------/-------------/------/-----------------/ / Nils Kristen... |
| [ ] | Alexandra Leeper | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | CEO - Iceland Ocean Cluster |
| [ ] | Anja Loekken Stokke | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Leder digitalisering - NCE Heidner Biocluster |
| [ ] | Gurill Narum Mediaa | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Leder - NCE Heidner Biocluster |
| [ ] | Karin Beukel | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Co-Founder - Agrain |
| [ ] | Kristian S. Ottesen | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Director Process Optimization & Resource Utilization - Royal Greenland |
| [ ] | Linn Indrestrand | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Head of Fishery & Maritime Services - Danish Ocean Cluster |
| [ ] | Mattias Lindahl | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Professor - Linkoeping University |
| [ ] | Michaela Lindstrom | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | CEO & Co-founder - Hailia Nordic |
| [ ] | Monika Poulsen | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Cluster Manager - Arctic Cluster Team |
| [ ] | Selina Juul | actor_contact_only | REVIEW_ECOSYSTEM_PERSON_PROFILE | ActorContact_or_PersonProfile | 3 | 1 | Grunnlegger og leder - Stop Spild Af Mad |
| [ ] | Ramkumar Nair | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 4 | 3 | , ikke insekt, men caset er relevant som parallell i «alternative proteins».[^16][^17] ### Gründere og profil - Mycorena ble grunnlagt i Sverige, med bl.a. **Ramkumar Na... |
| [ ] | Mona Mortensen Krane | missing_candidate | EXCLUDE_SOURCE_FOOTER_NOISE | Exclude | 4 | 2 | 026) Innst. 9 S (2025-2026) Innst. 10 S (2025-2026) Se alle Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Ansvarlig redakt&oslash;r:&nbsp;Mona Mort... |
| [ ] | Tom Johansson | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 4 | 2 | , developed multiple product lines, and secured listings with major retailers in Sweden and Germany, but ultimately failed to achieve financial sustainability. Tom Johan... |
| [ ] | Peppi Segersven | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 4 | 4 | ingskjede, Beredskap og Logistikk (Finland & Sverige) / Forfatter(e) / År / Institusjon / Tittel / Relevans & Lenke / / :--- / :--- / :--- / :--- / :--- / / **Peppi Sege... |
| [ ] | Jarna Hyvönen | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 3 | 3 | n – medgründer og CTO (Chief Technology Officer); ansvarlig for teknologi og prosess, omtaler selv løsningen som «upcycling i sin reneste form».[^10][^7] - Jarna Hyvönen... |
| [ ] | Kari Juntunen | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 3 | 3 | rsonfokusert informasjon, men noen navn går igjen i forbindelse med Roals enzymvirksomhet: - En bransjeartikkel om Roals FoU i mat- og fôr-enzymer viser til **Dr. Kari J... |
| [ ] | Simen Aardal Ulsaker | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 3 | 3 | kademikere * **Annechen Bahr Bugge (SIFO/OsloMet):** Ledende forsker på nordmenns spisevaner og hvordan prisstigning ("dyrtid") endrer forbrukeratferd. * **Simen Aardal... |
| [ ] | Martin Saetra | actor_contact_only | KEEP_ACTOR_CONTACT | ActorContact | 3 | 1 | Intern (NMBU Biooekonomi) |
| [ ] | Thea Simone Ingvaldsen | actor_contact_only | KEEP_ACTOR_CONTACT | ActorContact | 3 | 1 | Intern (NMBU Biooekonomi) |
| [ ] | Annikka Hurme | missing_candidate | REVIEW_ECOSYSTEM_PERSON_PROFILE | PersonProfile | 3 | 2 | rofessor) / FI / Finlands matforskningsstrategi 2021-2035 / / Minna Kaljonen / SYKE (research professor) / FI / Just Food, FoodTriggers, Food Strategy 2040 / / Annikka H... |
| [ ] | Helena Hansson | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 3 | 2 | , Earth system science / Teoretisk rammeverk for barekraftig mat / / Mistra Food Futures / SE / Forskningsprogram / Barekraft og beredskap i svensk matsystem / Helena Ha... |
| [ ] | Nesli Sozer | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 3 | 2 | rser / Jordbruk, matressurser, Food Vision 2040 / Finsk landbruks- og matressursforskning / / VTT / FI / Teknologiforskning / Matforskningsstrategi 2021-2035 / Nesli Soz... |
| [ ] | Erling Hjelmeng | missing_candidate | REVIEW_ACADEMIC_PROFILE | PersonProfile | 3 | 2 | den — Utredning fra Dagligvarelovutvalget - **Forfatter/utgiver:** Dagligvarelovutvalget, oppnevnt ved kongelig resolusjon 26. oktober 2012. Ledet av professor Erling Hj... |

## Detaljer

### 1. Bent Hoeie

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_POLICY_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har politikk-/utvalgskontekst som kan være relevant for personkatalogen.
- Score: 65; mentions: 8; sources: 5; contextScore: 12
- Varianter: Bent Hoie (4), Bent Høie (3), Bent Hoeie (1)

Kilder:
- actorContact: ActorContact
- file: research/bibliotek/nou/matsystemutvalget-status-2026.md
- file: research/bibliotek/tenketanker-ngo.md
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md

Kontekstutdrag:
- ActorContact: utvalgsleder
- research/bibliotek/nou/matsystemutvalget-status-2026.md: # Statusrapport: Matsystemutvalget (Mars 2026) **Full tittel:** Ekspertutvalget for fremtidens matsystemer **Leder:** Bent Høie **Frist:** 1. november 2026 (NOU) --- ## Status per 11. mars 2026 Utvalget er nå inne i den avsluttende fasen av sitt arbeid. De har samlet inn et massivt gr
- research/bibliotek/tenketanker-ngo.md: spill til/kommentar pa Matsystemutvalgets arbeid. Tidsmessig synkront: NOU-en kommer november 2026. - **Perspektiv/bias:** Regjeringsoppnevnt med bredt mandat. Bent Hoie (tidligere helseminister, Hoyre) som leder gir sentrum-hoyre profil. Risiko for at utvalget blir konsensusorientert og unngar kontroversielle anbefalinger. --
- research/interviews/nordisk-aktorkart-perplexity-2026.md: ----------/------/-----------------/ / Nils Kristen Sandtroen / LMD (statsraad) / NO / Politisk ansvarlig for Matsystemutvalget og selvforsyningsstrategien / / Bent Hoeie / Matsystemutvalget (leder) / NO / Leder NOU-prosessen; leveranse november 2026 / / Paeivi Nerg / MMM Finland (Secretary of State) / FI / Finsk representant Fo
### 2. Michel Bajuk

- Status: missing_candidate
- Foreslått bøtte: REVIEW_PROJECT_PARTNER_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Partner-/styringskontekst i prosjektunderlag; bør verifiseres som kontakt og vurderes for profil.
- Score: 54; mentions: 9; sources: 7; contextScore: 15
- Varianter: Michel Bajuk (9)

Kilder:
- file: research/RESEARCH-MISSIONS.md
- file: research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md
- file: research/external/nch-contract/contract-201-2503-P25013.md
- file: research/whitepaper/executive-brief.md
- file: research/whitepaper/food-systems-2026-draft-v1-reviewed.md
- file: research/whitepaper/food-systems-2026-draft-v1.md
- file: research/whitepaper/gap-list.md

Kontekstutdrag:
- research/RESEARCH-MISSIONS.md: into analysis - Contradictions flagged and investigated --- ### Mission 2: Nordic Partner Data Validation **Objective:** Send our Nordic comparison data to Michel Bajuk (Sweden/Cradlenet) and Betina Simonsen (Denmark/LDCluster) for confirmation, correction, and enrichment. **Why this matters:** Our Nordic market data (whitepa
- research/RESEARCH-MISSIONS.md: CH connection) / / 6 / NHH FOOD Research Centre / Academic / — / / 7 / Nordic Innovation / Funder / — / / 8 / Nordic Investment Bank (NIB) / Funder / — / / 9 / Michel Bajuk / Cradlenet / Partner (SE) / michel@cradlenet.se / / 10 / Betina Simonsen / LDCluster / Partner (DK) / (known) / / 11 / Riksrevisjonen / Oversight / — / / 12 /
- research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md: depth / / Iceland / Minimal (6 companies) / Minimal / Minimal (some Eurostat) / Minimal (1-2 sources) / Major gap / **Partner validation not yet completed:** Michel Bajuk (Sweden) and Betina Simonsen (Denmark) have not yet confirmed our market share estimates. --- ## Part IV: Document & Source Architecture Assessment ### 4.1
- research/external/nch-contract/contract-201-2503-P25013.md: pe Holthe) - **Project Partner (DK):** Lifestyle and Design Cluster — Betina Simonsen, Birk Centerpark 38, 7400 Herning - **Project Partner (SE):** Cradlenet — Michel Bajuk, Badstrandsvägen 28, 112 65 Stockholm - **Steering Committee:** Michel Bajuk (Cradlenet), Einar Holthe (Natural State), Betina Simonsen (LDC) ### WP-ledere (T
### 3. Betina Simonsen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_PROJECT_PARTNER_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Partner-/styringskontekst i prosjektunderlag; bør verifiseres som kontakt og vurderes for profil.
- Score: 53; mentions: 8; sources: 7; contextScore: 13
- Varianter: Betina Simonsen (8)

Kilder:
- file: research/RESEARCH-MISSIONS.md
- file: research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md
- file: research/external/nch-contract/contract-201-2503-P25013.md
- file: research/whitepaper/executive-brief.md
- file: research/whitepaper/food-systems-2026-draft-v1-reviewed.md
- file: research/whitepaper/food-systems-2026-draft-v1.md
- file: research/whitepaper/gap-list.md

Kontekstutdrag:
- research/RESEARCH-MISSIONS.md: ged and investigated --- ### Mission 2: Nordic Partner Data Validation **Objective:** Send our Nordic comparison data to Michel Bajuk (Sweden/Cradlenet) and Betina Simonsen (Denmark/LDCluster) for confirmation, correction, and enrichment. **Why this matters:** Our Nordic market data (whitepaper §4.1) uses estimates with ±2–3% unc
- research/RESEARCH-MISSIONS.md: Nordic Innovation / Funder / — / / 8 / Nordic Investment Bank (NIB) / Funder / — / / 9 / Michel Bajuk / Cradlenet / Partner (SE) / michel@cradlenet.se / / 10 / Betina Simonsen / LDCluster / Partner (DK) / (known) / / 11 / Riksrevisjonen / Oversight / — / / 12 / Supplier representative (NNN) / Industry / — / / 13 / EAT Forum / Knowled
- research/analyse/CRITICAL-PROJECT-REVIEW-2026-03-25.md: al (6 companies) / Minimal / Minimal (some Eurostat) / Minimal (1-2 sources) / Major gap / **Partner validation not yet completed:** Michel Bajuk (Sweden) and Betina Simonsen (Denmark) have not yet confirmed our market share estimates. --- ## Part IV: Document & Source Architecture Assessment ### 4.1 Storage Architecture (Three-L
- research/external/nch-contract/contract-201-2503-P25013.md: idig holdt av Natural State AS) - **Project Manager (2025):** Natural State AS (Einar Kleppe Holthe) - **Project Partner (DK):** Lifestyle and Design Cluster — Betina Simonsen, Birk Centerpark 38, 7400 Herning - **Project Partner (SE):** Cradlenet — Michel Bajuk, Badstrandsvägen 28, 112 65 Stockholm - **Steering Committee:** Michel B
### 4. Frode Steen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 53; mentions: 8; sources: 7; contextScore: 16
- Varianter: Frode Steen (8)

Kilder:
- file: research/bibliotek/akademia/nhh-food/frode-steen-profil.md
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/ocr-output/arkiv-sortert__Food Research Process 20.04.26__07_Academic_Research_And_Theses__drager-og-vagene.md
- file: research/ocr-output/evidence-pack__akademia__drager-vagene-2017.md
- file: research/perpl-17-03/Food Access, Food Deserts og Lokal HHI  Metoder, Kilder og Datasett for Nordisk og Komparativ Analyse.md
- file: research/perpl-17-03/Nordisk Dagligvaremarked  Markedsstruktur og Validering 2024–2026.md
- file: research/perpl-17-03/Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026).md

Kontekstutdrag:
- research/bibliotek/akademia/nhh-food/frode-steen-profil.md: # Sammendrag: Frode Steen — Publikasjonsprofil **Full tittel:** Frode Steen — NorgesGruppen-professor i konkurranseøkonomi, NHH **Dato:** 25. mars 2026 (Analysert) **Kilde:** https://www.nhh.no/en/employees/faculty/frode-steen/ --- #
- research/bibliotek/akademia/nhh-food/frode-steen-profil.md: sor i konkurranseøkonomi, NHH **Dato:** 25. mars 2026 (Analysert) **Kilde:** https://www.nhh.no/en/employees/faculty/frode-steen/ --- ## Biografisk oversikt Frode Steen er professor ved Institutt for samfunnsøkonomi, NHH, og innehar NorgesGruppens professorat i konkurranseøkonomi for dagligvaremarkeder. Han er tilknyttet CEPR
- research/interviews/nordisk-aktorkart-perplexity-2026.md: Organic Charter 2025 / ### Forskere og fageksperter / Person / Tilknytning / Land / Spesiell relevans / /--------/-------------/------/-------------------/ / Frode Steen / NHH FOOD (professor) / NO / Leder NHH FOOD; konkurranse og dagligvaremarkeder / / Simen Ulsaker / NHH FOOD (foersteamanuensis) / NO / Verdikjedeanalyse, mats
- research/ocr-output/arkiv-sortert__Food Research Process 20.04.26__07_Academic_Research_And_Theses__drager-og-vagene.md: butikker fikk dårlig og utilgjengelig beliggenhet, og at kjeden hadde merkevarer de norske forbrukerne ikke hadde kjennskap til (Hagen, 2008). Ifølge professor Frode Steen, kan faktorer som markedsføring av Lidls merkevarer og nordmenns vaner og redsel for å prøve noe nytt, være med på å forklare forbrukernes skepsis til ukjente
### 5. Paola Federica Albizzati

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 42; mentions: 7; sources: 7; contextScore: 7
- Varianter: Paola Federica Albizzati (7)

Kilder:
- file: research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md
- file: research/intake/food-research-process-2026-04-20/promotion-candidates.csv
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.first-wave-p2.csv
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.first-wave-p2.json
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.json
- file: research/intake/food-research-process-2026-04-20/thesis-review.csv

Kontekstutdrag:
- research/bibliotek/akademia/masteroppgaver/albizzati-phd-2021.md: --- title: "Sustainability Assessment of Food Waste Management" author: Paola Federica Albizzati institution: DTU year: 2021 degree: PhD tags: [matsvinn, håndtering, LCA, redistribusjon, dyrefôr, avfallshierarki] --- ## Nøkkelfunn - 21 ulike matsvinns-hå
- research/intake/food-research-process-2026-04-20/promotion-candidates.csv: =thesis-or-report,,2,1,14,pretriaged,import,Pretriaged 2026-04-20: thematic PDF in curated folder. Verify metadata and final project fit before production use.,Paola Federica Albizzati,Technical University of Denmark (DTU),2021,https://orbit.dtu.dk/en/publications/sustainability-assessment-of-food-waste-management Food Research Process 20.04
- research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv: ,import,clear,Thesis:albizzati-phd-2021,document-already-linked-to-thesis,document-already-linked-to-thesis,"{""id"":""thesis-food-56c96072511e"",""authors"":""Paola Federica Albizzati"",""institution"":""Technical University of Denmark (DTU)"",""year"":2021,""title"":""Sustainability Assessment of Food Waste Management"",""titleNo"":null,""u
- research/intake/food-research-process-2026-04-20/promotion-preview-thesis.first-wave-p2.csv: ,import,clear,Thesis:albizzati-phd-2021,document-already-linked-to-thesis,document-already-linked-to-thesis,"{""id"":""thesis-food-56c96072511e"",""authors"":""Paola Federica Albizzati"",""institution"":""Technical University of Denmark (DTU)"",""year"":2021,""title"":""Sustainability Assessment of Food Waste Management"",""titleNo"":null,""u
### 6. Minna Kaljonen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 34; mentions: 5; sources: 3; contextScore: 10
- Varianter: Minna Kaljonen (5)

Kilder:
- file: research/bibliotek/nordisk-mat-tenkere.md
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md

Kontekstutdrag:
- research/bibliotek/nordisk-mat-tenkere.md: institusjoner enn enkeltstående aktivister, med stor tillit til statlige forskningsorganer og sikkerhetsmyndigheter (HVK).* ### Forskere og Akademikere * **Minna Kaljonen (SYKE - Finlands miljøsentral):** Ledende ekspert på matpolitikk og rettferdig omstilling ("Just Transition") i matsystemet. Leder for det store JUST-FOOD-pros
- research/interviews/nordisk-aktorkart-perplexity-2026.md: / FI / Teknologiforskning / Matforskningsstrategi 2021-2035 / Nesli Sozer leder; nye proteinkilder / / SYKE / FI / Miljoeforskning / Just Food, FoodTriggers / Minna Kaljonen; transformativ governance / / EAT Foundation / NO / Stiftelse/tenketank / Global matpolitikk, EAT-Lancet / Gunhild Stordalen; norskbasert global stemme / / IPE
- research/interviews/nordisk-aktorkart-perplexity-2026.md: iversitet (professor) / DK / Komparativ nordisk landbruksokonomi / / Nesli Sozer / VTT (research professor) / FI / Finlands matforskningsstrategi 2021-2035 / / Minna Kaljonen / SYKE (research professor) / FI / Just Food, FoodTriggers, Food Strategy 2040 / / Annikka Hurme / Valio (CEO) / FI / Food 2.0-styringsgruppe; industriell fron
- research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md: elsstrategi 2.0[^10] / A / / **Nesli Sözer** / FI / Research Professor VTT / Leder arbeidet med Finlands felles matsforskningsstrategi 2021-2035[^60] / B / / **Minna Kaljonen** / FI / Research Professor SYKE / PI Just food, PI FoodTriggers, rådgiver MMM matstrategi 2040. FoodTriggers EU-prosjekt fra 2026[^58][^53][^59] / B, A / / **
### 7. Hanne Fjerdingby Olsen

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 34; mentions: 4; sources: 2; contextScore: 3
- Varianter: Hanne Fjerdingby Olsen (4)

Kilder:
- actorContact: ActorContact
- file: research/cathrine-ten-step-oppsummering.md

Kontekstutdrag:
- ActorContact: Professor, baerekraftige matsystemer
- research/cathrine-ten-step-oppsummering.md: option + Finance) - Årlig NCH roll-up: porteføljeoversikt på tvers av Cities/Food/Textile/Corporate ## Andre endringer integrert fra Cathrines materiale #### Hanne Fjerdingby Olsen (NMBU) Lagt til som kontaktperson på NMBU-aktøren - FeedLoop (2025–2027) — sirkulaert matsystemdesign - NewTools (FHI) — indikatorer - Kobling SLU, Wageninge
### 8. Antonia Ax:son Johnson

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 32; mentions: 4; sources: 4; contextScore: 8
- Varianter: Antonia Ax:son Johnson (4)

Kilder:
- file: research/bibliotek/forskningsrunde-2026-04-20/ax-foundation-kartlegging-2026-04-20.md
- file: research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md
- file: research/intake/perplexity-2026-04-20/new-actors.json
- file: research/perplexity-20-04-26/ax-foundation-matsystem-program.md

Kontekstutdrag:
- research/bibliotek/forskningsrunde-2026-04-20/ax-foundation-kartlegging-2026-04-20.md: m.m., som viser metodikken for sirkulær innovasjon som også brukes i matsystemarbeidet.[^11][^1][^2] *** ## 3. Nøkkelpersoner og styring - **Grunnlegger:** Antonia Ax:son Johnson, som fortsatt er styremedlem og frontfigur i kommunikasjon om stiftelsens rolle som «motståndsrörelse mot likgiltighet, handlingsförlamning och byråkratisk sta
- research/bibliotek/forskningsrunde-2026-04-20-r2/p15-axel-johnson-systemet-2026-04-20.md: oundation.[^1][^2][^3] ## 1. Konsernstruktur og matsystem-rolle Axel Johnson AB er et svensk familieeid investerings- og handelskonsern, i dag kontrollert av Antonia Ax:son Johnson-familien (styreleder Caroline Berg). På matsiden kontrollerer de særlig:[^3][^1] - Axfood (ca. 50,1% eierskap, børsnotert) – en av Sveriges ledende dagligvar
- research/intake/perplexity-2026-04-20/new-actors.json: "currentStance": "unknown", "themeTags": ["circular", "feed", "sidestream", "innovation-hub", "do-tank", "sweden"], "notes": "Funded by Axel Johnson/Antonia Ax:son Johnson family. Key programmes: Framtidens foder for fagel fisk och flask (2023-2026 with SLU), Smart Svensk Sjomat, Sillenbergare, Svensk baljvaxtfars. CEO: Maria Smi
- research/perplexity-20-04-26/ax-foundation-matsystem-program.md: m.m., som viser metodikken for sirkulær innovasjon som også brukes i matsystemarbeidet.[^11][^1][^2] *** ## 3. Nøkkelpersoner og styring - **Grunnlegger:** Antonia Ax:son Johnson, som fortsatt er styremedlem og frontfigur i kommunikasjon om stiftelsens rolle som «motståndsrörelse mot likgiltighet, handlingsförlamning och byråkratisk sta
### 9. Carsten Lind Pedersen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 32; mentions: 4; sources: 4; contextScore: 8
- Varianter: Carsten Lind Pedersen (4)

Kilder:
- file: research/evidence-pack/sirkular-konkurser/enorm-biofactory/media-thefishsite-2025.md
- file: research/exa-circular-actors-2026-04-21.md
- file: research/perplexity-20-04-26/konkursanatomi-enorm-mycorena-infarm-v2.md
- file: research/perplexity-20-04-26/konkursanatomi-enorm-mycorena-infarm.md

Kontekstutdrag:
- research/evidence-pack/sirkular-konkurser/enorm-biofactory/media-thefishsite-2025.md: ght to full operation within a foreseeable timeframe. However, the market’s reluctance has made it difficult to secure adequate sales and financing,” said CEO, Carsten Lind Pedersen, in a press release. The board of directors and shareholders have therefore – in collaboration with the company’s stakeholders – decided to initiate a reconstr
- research/exa-circular-actors-2026-04-21.md: s) + [Hermetia.blog analysis (2025-12-18)](https://hermetia.blog/blog/enorm-the-rise-and-bankruptcy-of-a-bsf-biofactory/) **Timeline**: - **2017**: Founded by CEO Carsten Lind Pedersen and COO Jane Lind Sam (father-daughter team) - **2022**: Raised **€50 million** from backers including Danish ag co-op **DLG** - **Late 2023**: Factory in **Hv
- research/perplexity-20-04-26/konkursanatomi-enorm-mycorena-infarm-v2.md: oy/fishmeal).[^8][^13][^11][^12] - Når rekonstruksjon ikke klarer å tiltrekke ny kapital i 2025, går selskapet til konkurs.[^12][^8] ### 6. Sitat om årsak - CEO Carsten Lind Pedersen beskrev 50 M€‑runden som nødvendig for å “go from pilot to industrial production”, med DLG og The Danish Green Investment Fund som nøkkelpartnere.[^14][^2][^9]
- research/perplexity-20-04-26/konkursanatomi-enorm-mycorena-infarm.md: oy/fishmeal).[^8][^13][^11][^12] - Når rekonstruksjon ikke klarer å tiltrekke ny kapital i 2025, går selskapet til konkurs.[^12][^8] ### 6. Sitat om årsak - CEO Carsten Lind Pedersen beskrev 50 M€‑runden som nødvendig for å “go from pilot to industrial production”, med DLG og The Danish Green Investment Fund som nøkkelpartnere.[^14][^2][^9]
### 10. Nils Kristen Sandtroen

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_POLICY_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har politikk-/utvalgskontekst som kan være relevant for personkatalogen.
- Score: 32; mentions: 4; sources: 2; contextScore: 2
- Varianter: Nils Kristen Sandtroen (4)

Kilder:
- actorContact: ActorContact
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md

Kontekstutdrag:
- ActorContact: statsraad
- research/interviews/nordisk-aktorkart-perplexity-2026.md: --- ## Nokkelpersoner ### Politiske beslutningstakere / Person / Tilknytning / Land / Relevans FS2026 / /--------/-------------/------/-----------------/ / Nils Kristen Sandtroen / LMD (statsraad) / NO / Politisk ansvarlig for Matsystemutvalget og selvforsyningsstrategien / / Bent Hoeie / Matsystemutvalget (leder) / NO / Leder NOU-prose
### 11. Alexandra Leeper

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Alexandra Leeper (3)

Kilder:
- actorContact: Iceland Ocean Cluster

Kontekstutdrag:
- Iceland Ocean Cluster: CEO - Iceland Ocean Cluster
### 12. Anja Loekken Stokke

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Anja Loekken Stokke (3)

Kilder:
- actorContact: NCE Heidner Biocluster

Kontekstutdrag:
- NCE Heidner Biocluster: Leder digitalisering - NCE Heidner Biocluster
### 13. Gurill Narum Mediaa

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Gurill Narum Mediaa (3)

Kilder:
- actorContact: NCE Heidner Biocluster

Kontekstutdrag:
- NCE Heidner Biocluster: Leder - NCE Heidner Biocluster
### 14. Karin Beukel

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Karin Beukel (3)

Kilder:
- actorContact: Agrain

Kontekstutdrag:
- Agrain: Co-Founder - Agrain
### 15. Kristian S. Ottesen

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Kristian S. Ottesen (3)

Kilder:
- actorContact: Royal Greenland

Kontekstutdrag:
- Royal Greenland: Director Process Optimization & Resource Utilization - Royal Greenland
### 16. Linn Indrestrand

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Linn Indrestrand (3)

Kilder:
- actorContact: Danish Ocean Cluster

Kontekstutdrag:
- Danish Ocean Cluster: Head of Fishery & Maritime Services - Danish Ocean Cluster
### 17. Mattias Lindahl

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Mattias Lindahl (3)

Kilder:
- actorContact: Linkoeping University

Kontekstutdrag:
- Linkoeping University: Professor - Linkoeping University
### 18. Michaela Lindstrom

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Michaela Lindstrom (3)

Kilder:
- actorContact: Hailia Nordic

Kontekstutdrag:
- Hailia Nordic: CEO & Co-founder - Hailia Nordic
### 19. Monika Poulsen

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Monika Poulsen (3)

Kilder:
- actorContact: Arctic Cluster Team

Kontekstutdrag:
- Arctic Cluster Team: Cluster Manager - Arctic Cluster Team
### 20. Selina Juul

- Status: actor_contact_only
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: ActorContact_or_PersonProfile
- Begrunnelse: Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.
- Score: 28; mentions: 3; sources: 1; contextScore: 2
- Varianter: Selina Juul (3)

Kilder:
- actorContact: Stop Spild Af Mad

Kontekstutdrag:
- Stop Spild Af Mad: Grunnlegger og leder - Stop Spild Af Mad
### 21. Ramkumar Nair

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 27; mentions: 4; sources: 3; contextScore: 7
- Varianter: Ramkumar Nair (4)

Kilder:
- file: research/bibliotek/forskningsrunde-2026-04-20-r2/p18-insektindustri-norden-2026-04-20.md
- file: research/evidence-pack/sirkular-konkurser/mycorena/analysis-mycostories.md
- file: research/evidence-pack/sirkular-konkurser/mycorena/media-vegconomist-2024.md

Kontekstutdrag:
- research/bibliotek/forskningsrunde-2026-04-20-r2/p18-insektindustri-norden-2026-04-20.md: , ikke insekt, men caset er relevant som parallell i «alternative proteins».[^16][^17] ### Gründere og profil - Mycorena ble grunnlagt i Sverige, med bl.a. **Ramkumar Nair** som sentral grunnlegger og CEO, og posisjonerte seg som produsent av mykoprotein og fett for matindustrien.[^16] - Selskapet bygde opp en demofabrikk i Göteb
- research/evidence-pack/sirkular-konkurser/mycorena/analysis-mycostories.md: veälv, as the company appointed Advokatfirman Lindahl KB to oversee the bankruptcy process. Despite these challenges, there’s a glimmer of hope. Co-founder and CEO Ramkumar Nair revealed to Green Queen that some of Mycorena’s former shareholders are forming a new consortium aimed at buying back the bankruptcy estate and restarting oper
- research/evidence-pack/sirkular-konkurser/mycorena/media-vegconomist-2024.md: there&#8217;s optimism that the company can overcome its current challenges and continue its trajectory as a leader in the mycoprotein market. CEO and founder Ramkumar Nair states: &#8220;This was not an easy decision, but we believe it is a necessary step to restructure our business and protect the value that Mycorena has created
- research/evidence-pack/sirkular-konkurser/mycorena/media-vegconomist-2024.md: leadership in the mycoprotein segment. We are grateful to our stakeholders, team, and partners for their support as we look ahead to a stronger future.&#8221; Ramkumar Nair @ Mycorena The potential of Mycorena’s technology Magnus Löfving of Advokatfirman Lindahl KB has been appointed as trustee to handle bankruptcy procedures and
### 22. Mona Mortensen Krane

- Status: missing_candidate
- Foreslått bøtte: EXCLUDE_SOURCE_FOOTER_NOISE
- Mulig importmål: Exclude
- Begrunnelse: Treffet ser ut som redaksjonell footer/kildeeier, ikke en matsystem- eller selskapsrolle.
- Score: 26; mentions: 4; sources: 2; contextScore: 8
- Varianter: Mona Mortensen Krane (4)

Kilder:
- file: research/evidence-pack/stortinget/innst-130s-2025-2026.md
- file: research/evidence-pack/stortinget/innst-173s-2023-2024.md

Kontekstutdrag:
- research/evidence-pack/stortinget/innst-130s-2025-2026.md: 026) Innst. 9 S (2025-2026) Innst. 10 S (2025-2026) Se alle Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Ansvarlig redakt&oslash;r:&nbsp;Mona Mortensen Krane Nettredakt&oslash;r: Lars Henie Barstad Om stortinget Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Kontakt oss Ansvarlig redakt&oslash;r:&nbsp;Mona
- research/evidence-pack/stortinget/innst-130s-2025-2026.md: dakt&oslash;r: Lars Henie Barstad Om stortinget Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Kontakt oss Ansvarlig redakt&oslash;r:&nbsp;Mona Mortensen Krane Nettredakt&oslash;r: Lars Henie Barstad Stortinget undervisning Stortingets mediearkiv Ordbok Om nettstedet Personvernerklæring Tilgjengelighetserklæring Jobb på Storting
- research/evidence-pack/stortinget/innst-173s-2023-2024.md: 024) Innst. 9 S (2023-2024) Innst. 10 S (2023-2024) Se alle Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Ansvarlig redakt&oslash;r:&nbsp;Mona Mortensen Krane Nettredakt&oslash;r: Lars Henie Barstad Om stortinget Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Kontakt oss Ansvarlig redakt&oslash;r:&nbsp;Mona
- research/evidence-pack/stortinget/innst-173s-2023-2024.md: dakt&oslash;r: Lars Henie Barstad Om stortinget Stortinget Postboks 1700 Sentrum 0026 Oslo Sentralbord: 23 31 30 50 Kontakt oss Ansvarlig redakt&oslash;r:&nbsp;Mona Mortensen Krane Nettredakt&oslash;r: Lars Henie Barstad Stortinget undervisning Stortingets mediearkiv Ordbok Om nettstedet Personvernerklæring Tilgjengelighetserklæring Jobb på Storting
### 23. Tom Johansson

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 26; mentions: 4; sources: 2; contextScore: 8
- Varianter: Tom Johansson (4)

Kilder:
- file: research/evidence-pack/sirkular-konkurser/hooked-foods/media-ppti.md
- file: research/evidence-pack/sirkular-konkurser/hooked-foods/media-vegconomist.md

Kontekstutdrag:
- research/evidence-pack/sirkular-konkurser/hooked-foods/media-ppti.md: , developed multiple product lines, and secured listings with major retailers in Sweden and Germany, but ultimately failed to achieve financial sustainability. Tom Johansson, Founder &amp; CEO, confirmed the outcome in public statements and a LinkedIn post published the same day, describing the decision as difficult but inevitable
- research/evidence-pack/sirkular-konkurser/hooked-foods/media-ppti.md: native proteins. • The company raised more than US$6 million and secured retail listings in Sweden and Germany but reported low revenue and continued losses. • Founder Tom Johansson cited weak market response, tight margins, and limited control over the value chain as key challenges. “After seven years of devoting myself to Hooked Foods, w
- research/evidence-pack/sirkular-konkurser/hooked-foods/media-ppti.md: ts including Vegobitar Original, Vegobitar Kebab, Vegobitar Seafood Flavors, and Vegofilé Original, each designed to deliver more than 20g of protein per 100g. Tom Johansson, Founder &amp; CEO, Hooked Foods “With this funding round, we are taking a decisive step forward in our growth journey,” Johansson said in March 2025. “Investm
- research/evidence-pack/sirkular-konkurser/hooked-foods/media-vegconomist.md: ntually declared bankrupt earlier this week. © Hooked Foods &#8220;We pushed further than many think is possible&#8221; In a LinkedIn post , Hooked founder and CEO Tom Johansson highlighted the company&#8217;s accomplishments over the past seven years, which have included raising over $6 million in funding and gaining listings at some
### 24. Peppi Segersven

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 24; mentions: 4; sources: 4; contextScore: 4
- Varianter: Peppi Segersven (4)

Kilder:
- file: research/bibliotek/MASTER-PHD-BACKLOG-2026.md
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv
- file: research/intake/food-research-process-2026-04-20/promotion-preview-thesis.json
- file: research/intake/food-research-process-2026-04-20/thesis-review.csv

Kontekstutdrag:
- research/bibliotek/MASTER-PHD-BACKLOG-2026.md: ingskjede, Beredskap og Logistikk (Finland & Sverige) / Forfatter(e) / År / Institusjon / Tittel / Relevans & Lenke / / :--- / :--- / :--- / :--- / :--- / / **Peppi Segersven** / 2024 / LUT (FI) / *Development of risk management and resilience of supply chains in Finnish food industry post-COVID-19* / Kartlegger skiftet til langsikt
- research/intake/food-research-process-2026-04-20/promotion-preview-thesis.csv: sven,import,clear,Thesis:segersven-2024,document-already-linked-to-thesis,document-already-linked-to-thesis,"{""id"":""thesis-food-930f5a92fd59"",""authors"":""Peppi Segersven"",""institution"":""Lappeenranta-Lahti University of Technology LUT"",""year"":2024,""title"":""Development of risk management and resilience of supply chains
- research/intake/food-research-process-2026-04-20/promotion-preview-thesis.json: s" ], "reasonSummary": "document-already-linked-to-thesis", "payloadPreview": { "id": "thesis-food-930f5a92fd59", "authors": "Peppi Segersven", "institution": "Lappeenranta-Lahti University of Technology LUT", "year": 2024, "title": "Development of risk management and resilien
- research/intake/food-research-process-2026-04-20/thesis-review.csv: ,Development of risk management and resilience of supply chains in Finnish food industry companies post-COVID-19,2024,https://urn.fi/URN:NBN:fi-fe2024043024001,Peppi Segersven,Lappeenranta-Lahti University of Technology LUT,"Intervjuer med fem finske matindustribedrifter viser at pandemien loftet supply chain risk management til et m
### 25. Jarna Hyvönen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 24; mentions: 3; sources: 3; contextScore: 6
- Varianter: Jarna Hyvönen (3)

Kilder:
- file: research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md
- file: research/evidence-pack/sirkular-konkurser/enorm-biofactory/analysis-sifted-ynsect.md
- file: research/exa-circular-actors-2026-04-21.md

Kontekstutdrag:
- research/bibliotek/forskningsrunde-2026-04-20-r2/p17-volare-selskapsdossier-2026-04-20.md: n – medgründer og CTO (Chief Technology Officer); ansvarlig for teknologi og prosess, omtaler selv løsningen som «upcycling i sin reneste form».[^10][^7] - Jarna Hyvönen – medgründer og nåværende CEO (tidligere COO); presenteres som Chief Executive Officer og «co‑founder» som leder global skalering, fundraising og partnerskap.[
- research/evidence-pack/sirkular-konkurser/enorm-biofactory/analysis-sifted-ynsect.md: some say there may be an advantage to being a second mover. “Many of the first-generation players have done a really good job of building this industry,” says Jarna Hyvönen, the CEO of Finnish insect protein startup Volare. “We can avoid the mistakes of challenges that other companies have faced before.” Hyvönen says many learning
- research/exa-circular-actors-2026-04-21.md: r loans, public funding - Investors: **Maki.VC, Firstminute Capital, Springvest, Finnish Climate Fund, Finnvera, Norion Bank, South Ostrobothnia ELY** - CEO: **Jarna Hyvönen** (as of June 2025, previously CCO/co-founder) - CSO: **Tuure Parviainen** (co-founder, previously CEO) - Technology: Black soldier fly (Hermetia illucens) — p
### 26. Kari Juntunen

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 24; mentions: 3; sources: 3; contextScore: 6
- Varianter: Kari Juntunen (3)

Kilder:
- file: research/bibliotek/forskningsrunde-2026-04-20/roal-oy-enzymer-finland-2026-04-20.md
- file: research/intake/perplexity-2026-04-20/new-actors.json
- file: research/perplexity-20-04-26/rolaere-finland-sirkulaer-for.md

Kontekstutdrag:
- research/bibliotek/forskningsrunde-2026-04-20/roal-oy-enzymer-finland-2026-04-20.md: rsonfokusert informasjon, men noen navn går igjen i forbindelse med Roals enzymvirksomhet: - En bransjeartikkel om Roals FoU i mat- og fôr-enzymer viser til **Dr. Kari Juntunen**, Senior Research Scientist, som beskriver at hovedmarkedene er fôr (xylanase, fytase) og mat (amylase, protease, pektinase).[^1] - Historikken viser at Roal
- research/intake/perplexity-2026-04-20/new-actors.json: n", "themeTags": ["feed", "enzymes", "circular", "biotech", "finland"], "notes": "Founded as Alko/Rohm JV. Over 90% of production exported. Key person: Dr. Kari Juntunen (Senior Research Scientist). Historical VTT collaboration. Feed enzyme market described as strongly growing." }, { "id": "actor-raisio-oyj", "slug"
- research/perplexity-20-04-26/rolaere-finland-sirkulaer-for.md: rsonfokusert informasjon, men noen navn går igjen i forbindelse med Roals enzymvirksomhet: - En bransjeartikkel om Roals FoU i mat- og fôr-enzymer viser til **Dr. Kari Juntunen**, Senior Research Scientist, som beskriver at hovedmarkedene er fôr (xylanase, fytase) og mat (amylase, protease, pektinase).[^1] - Historikken viser at Roal
### 27. Simen Aardal Ulsaker

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 24; mentions: 3; sources: 3; contextScore: 6
- Varianter: Simen Ulsaker (2), Simen Aardal Ulsaker (1)

Kilder:
- file: research/bibliotek/nordisk-mat-tenkere.md
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026).md

Kontekstutdrag:
- research/bibliotek/nordisk-mat-tenkere.md: kademikere * **Annechen Bahr Bugge (SIFO/OsloMet):** Ledende forsker på nordmenns spisevaner og hvordan prisstigning ("dyrtid") endrer forbrukeratferd. * **Simen Aardal Ulsaker (NHH):** Konkurranseøkonom som spesialiserer seg på vertikale relasjoner og kjøpermakt i dagligvaremarkedet. * **Birger Svihus (NMBU):** Professor i ernæring
- research/interviews/nordisk-aktorkart-perplexity-2026.md: elevans / /--------/-------------/------/-------------------/ / Frode Steen / NHH FOOD (professor) / NO / Leder NHH FOOD; konkurranse og dagligvaremarkeder / / Simen Ulsaker / NHH FOOD (foersteamanuensis) / NO / Verdikjedeanalyse, matsystemer / / Audun Korsaeth / NIBIO (divisjonsdirektorer), Matsystemutvalget / NO / Erfaring fra Kl
- research/perpl-17-03/Nordiske avhandlinger og masteroppgaver om matsystemer, dagligvare og matpolitikk (2010–2026).md: rekonsentrasjon, konkurranse, grossistledd) NHHs FOOD-senter (Financial Research Center for the Norwegian Grocery Industry), ledet av professor Frode Steen og Simen Ulsaker, har finansiert og veiledet en rekke masteroppgaver om det norske dagligvaremarkedet siden 2017. FOOD er et femårig prosjekt finansiert av NorgesGruppen med må
### 28. Martin Saetra

- Status: actor_contact_only
- Foreslått bøtte: KEEP_ACTOR_CONTACT
- Mulig importmål: ActorContact
- Begrunnelse: Finnes allerede som kontakt/intern rolle; promoter bare hvis personen skal være ekstern profil.
- Score: 24; mentions: 3; sources: 1; contextScore: 0
- Varianter: Martin Saetra (3)

Kilder:
- actorContact: ActorContact

Kontekstutdrag:
- ActorContact: Intern (NMBU Biooekonomi)
### 29. Thea Simone Ingvaldsen

- Status: actor_contact_only
- Foreslått bøtte: KEEP_ACTOR_CONTACT
- Mulig importmål: ActorContact
- Begrunnelse: Finnes allerede som kontakt/intern rolle; promoter bare hvis personen skal være ekstern profil.
- Score: 24; mentions: 3; sources: 1; contextScore: 0
- Varianter: Thea Simone Ingvaldsen (3)

Kilder:
- actorContact: ActorContact

Kontekstutdrag:
- ActorContact: Intern (NMBU Biooekonomi)
### 30. Annikka Hurme

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ECOSYSTEM_PERSON_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.
- Score: 21; mentions: 3; sources: 2; contextScore: 6
- Varianter: Annikka Hurme (3)

Kilder:
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md

Kontekstutdrag:
- research/interviews/nordisk-aktorkart-perplexity-2026.md: rofessor) / FI / Finlands matforskningsstrategi 2021-2035 / / Minna Kaljonen / SYKE (research professor) / FI / Just Food, FoodTriggers, Food Strategy 2040 / / Annikka Hurme / Valio (CEO) / FI / Food 2.0-styringsgruppe; industriell frontfigur / ### Globale stemmer / Person / Tilknytning / Land / Relevans / /--------/-------------
- research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md: / **Valio** / FI / Meierikonsern (kooperativ) / Finlands største mateksportør, 1,7 mrd EUR omsetning / Leder Food 2.0-programmet (>170 aktører, 100 mill EUR). Annikka Hurme (CEO)[^67][^88] / valio.com / C, B / / **Axfood** / SE / Dagligvare og matvarekjede / Willys, Hemköp – betydelig markedsandel Sverige / Viktig distributørledd
- research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md: T Foundation / Norges mest internasjonalt innflytelsesrike stemme i global matdebatten. Alliance of Champions-arbeid[^46][^90][^47][^104][^105] / E, A, B / / **Annikka Hurme** / FI / CEO Valio, leder Food 2.0-styringsgruppe / Industriell frontfigur for finsk matsystemstransformasjon[^67] / C, B / / **Marte von Krogh** / NO / Matval
### 31. Helena Hansson

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 21; mentions: 3; sources: 2; contextScore: 6
- Varianter: Helena Hansson (3)

Kilder:
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md

Kontekstutdrag:
- research/interviews/nordisk-aktorkart-perplexity-2026.md: , Earth system science / Teoretisk rammeverk for barekraftig mat / / Mistra Food Futures / SE / Forskningsprogram / Barekraft og beredskap i svensk matsystem / Helena Hansson (SLU) leder / / AgriFood Economics Centre / SE / Okonomiforskning / Matpriser, jordbrukspolitikk (SLU + Lund) / Komparativ nordisk okonomi / / RISE / SE / Anve
- research/interviews/nordisk-aktorkart-perplexity-2026.md: / Runar Hovland / Konkurransetilsynet / NO / Prosjektleder dagligvareundersokelser / / Ivar Gaasland / NHH (professor) / NO / Landbruksokonomi; importvern / / Helena Hansson / SLU / Mistra Food Futures (professor/direktoer) / SE / Barekraft og beredskap i svensk matsystem / / Annica Sohlstroem / Livsmedelsverket (direktoer) / SE /
- research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md: / B, C / / **Rune Blomhoff** / NO / Professor UiO, leder NNR2022-arbeidsgruppe / Ledet arbeidet med nordiske ernæringsanbefalinger 2022/2023[^70] / B, A / / **Helena Hansson** / SE / Professor SLU, direktør Mistra Food Futures / "Sustainability and preparedness – Swedish perspectives" (2025)[^25][^44] / B / / **Annica Sohlström** /
### 32. Nesli Sozer

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 21; mentions: 3; sources: 2; contextScore: 6
- Varianter: Nesli Sozer (2), Nesli Sözer (1)

Kilder:
- file: research/interviews/nordisk-aktorkart-perplexity-2026.md
- file: research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md

Kontekstutdrag:
- research/interviews/nordisk-aktorkart-perplexity-2026.md: rser / Jordbruk, matressurser, Food Vision 2040 / Finsk landbruks- og matressursforskning / / VTT / FI / Teknologiforskning / Matforskningsstrategi 2021-2035 / Nesli Sozer leder; nye proteinkilder / / SYKE / FI / Miljoeforskning / Just Food, FoodTriggers / Minna Kaljonen; transformativ governance / / EAT Foundation / NO / Stiftel
- research/interviews/nordisk-aktorkart-perplexity-2026.md: ofessor) / DK / Matokonomi; Food Policy Forum 2025 / / Henning Otte Hansen / Koebenhavns Universitet (professor) / DK / Komparativ nordisk landbruksokonomi / / Nesli Sozer / VTT (research professor) / FI / Finlands matforskningsstrategi 2021-2035 / / Minna Kaljonen / SYKE (research professor) / FI / Just Food, FoodTriggers, Food
- research/perpl-17-03/Nordisk aktørkart for matsystemkartlegging 2026.md: " (2025)[^25][^44] / B / / **Annica Sohlström** / SE / Direktør Livsmedelsverket / Leder nasjonal matmyndighet, formidler Livsmedelsstrategi 2.0[^10] / A / / **Nesli Sözer** / FI / Research Professor VTT / Leder arbeidet med Finlands felles matsforskningsstrategi 2021-2035[^60] / B / / **Minna Kaljonen** / FI / Research Professor
### 33. Erling Hjelmeng

- Status: missing_candidate
- Foreslått bøtte: REVIEW_ACADEMIC_PROFILE
- Mulig importmål: PersonProfile
- Begrunnelse: Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.
- Score: 19; mentions: 3; sources: 2; contextScore: 5
- Varianter: Erling Hjelmeng (3)

Kilder:
- file: research/RESEARCH-AUDIT.md
- file: research/bibliotek/nou-stortingsdok-juridisk.md

Kontekstutdrag:
- research/RESEARCH-AUDIT.md: re for Competition Law and Economics) er et viktig miljoee ### Gap og neste steg - [ ] **Kritisk gap:** UiB har flere konkurranserettsforskere (Lars Soergard, Erling Hjelmeng) som ikke er dekket - [ ] UiT/Nofima paa arktisk mat, sjoematforedling og mattrygghet -- helt fraavaerende - [ ] NTNU paa logistikk, supply chain management og
- research/bibliotek/nou-stortingsdok-juridisk.md: den — Utredning fra Dagligvarelovutvalget - **Forfatter/utgiver:** Dagligvarelovutvalget, oppnevnt ved kongelig resolusjon 26. oktober 2012. Ledet av professor Erling Hjelmeng (UiO). Avgitt til Landbruks- og matdepartementet, Barne-, likestillings- og inkluderingsdepartementet, og Fornyings-, administrasjons- og kirkedepartementet 30
- research/bibliotek/nou-stortingsdok-juridisk.md: jon. Forbrukerperspektivet er eksplisitt vektlagt, mens kjedenes synspunkter ble innhentet gjennom dialogmøter og bilaterale samtaler. - **Utvalgsmedlemmer:** Erling Hjelmeng (leder, UiO), Tommy Staahl Gabrielsen (UiB), Olav Kolstad (Schjødt), Thea Susanne Skaug (Arntzen de Besche), Toril Melander Stene (Forbrukerrådet), Tina Søreid
