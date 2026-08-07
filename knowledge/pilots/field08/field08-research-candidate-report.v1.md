# Field 08 research candidate report

Generated from source commit `7aa4d95d45e1633ef2194d1dd17ebff9d4166f61` on 2026-07-28.

> Status: draft candidate intake only. A source lead, locator or facet match is not an evidence-backed assessment. This report creates zero readiness results, zero coverage promotions and zero external-ready claims.

## Boundary

This is a bounded research-intake floor, not a completed map of Nordic circular food systems. Every cell remains unassessed until source bytes, claim records, methods, boundaries, appraisals, child dimensions and the required human or rights-holder reviews are resolved.

The pilot contains 27 source candidates, 33 source-to-cell bindings, 33 observation candidates and 306 explicit geography–facet rows. The 272 political rows and 34 Sápmi rows are reported separately and are never aggregated.

## Geography summary

| Geography | Sources | Observations | Substantive | Method | Context | Boundary review | Rights-holder route | No candidate | Cell state |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Åland | 3 | 3 | 14 | 0 | 0 | 0 | 0 | 20 | unassessed |
| Denmark | 4 | 4 | 10 | 0 | 0 | 0 | 0 | 24 | unassessed |
| Finland | 5 | 5 | 0 | 0 | 5 | 12 | 0 | 17 | unassessed |
| Faroe Islands | 3 | 3 | 10 | 0 | 0 | 0 | 0 | 24 | unassessed |
| Greenland | 3 | 3 | 0 | 0 | 17 | 0 | 0 | 17 | unassessed |
| Iceland | 4 | 4 | 10 | 0 | 7 | 0 | 0 | 17 | unassessed |
| Norway | 3 | 3 | 19 | 0 | 0 | 0 | 0 | 15 | unassessed |
| Sápmi | 4 | 4 | 0 | 0 | 0 | 0 | 34 | 0 | unassessed |
| Sweden | 4 | 4 | 18 | 0 | 0 | 0 | 0 | 16 | unassessed |

## Geography ledgers

### Åland

Cell: `cov.v1.profile=legacy_field_political.geography=ax.legacy_fields=f08`

Boundary: Åland autonomous reporting scope; ÅSUB and Ahvenanmaa rows are kept separate from Finnish whole-country totals, which may already include Åland.

**Candidate sources**

- [Avfallsstatistik 2024](https://www.asub.ax/sites/default/files/media/document/avfall24.pdf) — ÅSUB; 2025-10-23; locator: Report pp. 7–15, Tables 1–5; archive: locator only; review: pending.
  - Source limitations: Animal and mixed food waste is not an edible-food-waste measure and may include animal by-products and industrial streams. Recovery-code classification does not prove closed-loop reuse, and report tables contain small unresolved differences in exported tonnage.
- [Nitrogen and phosphorus balance](https://www.luke.fi/en/statistics/indicators/cap-indicators/nitrogen-and-phosphorus-balance) — Natural Resources Institute Finland (Luke); 2026-02-18; locator: PxWeb table Maatalousmaan ravinnetase; whole country and Ahvenanmaa; nutrients N and P; year 2024; archive: locator only; review: pending.
  - Source limitations: The whole-country value explicitly includes Åland, while Åland is also reported separately and the two cannot be added. The balance is neither short-term pollution nor realized circularity and contains no potassium balance.
- [Indicator for nutrient recycling](https://www.luke.fi/en/statistics/indicators/indicator-for-nutrient-recycling) — Natural Resources Institute Finland (Luke); 2026-06-26; locator: PxWeb Ravinteet_uusi; indicator vintage 2026; whole country and Ahvenanmaa; total and component biomass, N and P; archive: locator only; review: pending.
  - Source limitations: The 2026 indicator combines source years from 2023 to 2025, literature coefficients and rough treatment or end-use estimates. Potential is not realized recovery, application, substitution or circularity; potassium and several losses are absent.

**Observation candidates**

- Luke reports an Åland agricultural nitrogen balance of 28.6 kilograms per hectare for 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Ahvenanmaa; nutrient=N; year=2024 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The regional row cannot be added to the whole-country value, which already includes Åland.
- Luke's 2026 indicator estimates 515 tonnes of nitrogen per year in potentially recyclable Åland biomass streams.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Ahvenanmaa; total biomass streams; nutrient=N; indicator vintage 2026 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Potential is not realized nutrient return or substitution.
- ÅSUB reports 18,178 tonnes of animal and mixed food waste generated in Åland in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Report pp. 7–15, Tables 1–5; animal and mixed food waste row (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The category is not edible food waste and may include animal by-products and industrial streams.

**Facet lead states**

- **substantive_candidate_identified:** `circular_strategy.r8`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.manure`, `material.side_stream`, `material.sludge`, `material.soil_amendment`, `material.waste`, `stage.return_flows.collection_sorting`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.nutrient_return`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `circular_strategy.r9`, `flow.physical.energy`, `flow.physical.food_loss`, `flow.physical.nutrient_k`, `material.compost`, `material.digestate`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`, `stage.return_flows.material_recovery`

**Explicit unknowns**

- Comparable edible and inedible food-waste quantities across the five stages for Åland.
- Reconciled local treatment, stocks, exports to Finland or Sweden and final side-stream destinations.
- Actual nutrient recovery and substitution versus Luke's modelled potential, including K and process losses.
- Nutrient content, plant availability and final application of digestate, sludge, compost and other recycled products.
- Aquaculture and fish-processing side streams, redistribution, prevention and treatment outcomes.
- Current consolidated legislation, implementation, facility capacity, contamination, safety, cost, ownership and value distribution.

**Next actions**

- Archive the ÅSUB report and record its internal export-tonnage differences as an explicit contradiction.
- Freeze the Ahvenanmaa PxWeb rows and prevent addition to whole-country Finland totals.
- Trace Åland waste exports and modelled nutrient stocks to verified treatment, product and application destinations.
- Build stage and commodity child cells and obtain human appraisal before proposing an assessment.

### Denmark

Cell: `cov.v1.profile=legacy_field_political.geography=dk.legacy_fields=f08`

Boundary: Danish political reporting scope; the Eurostat stage total, detailed 2022 mapping and mineral-fertilizer supply are complementary but non-additive measures.

**Candidate sources**

- [Kortlægning af madaffald i primærproduktionen samt forarbejdnings- og fremstillingssektoren for 2022](https://mst.dk/publikationer/2024/marts/kortlaegning-af-madaffald-i-primaerproduktionen-samt-forarbejdnings-og-fremstillingssektoren-for-2022) — Danish Environmental Protection Agency; publication date unknown; locator: Report pp. 6–11, Tables 2–4; archive: locator only; review: pending.
  - Source limitations: Subsector estimates combine interviews, questionnaires, production statistics and coefficients with uneven evidence strength. Changes from 2018 partly reflect classification, data and production changes, including former mink-feed material becoming waste when routed to biogas.
- [KVAEL2: Content of nutrients in fertilizers by type of nutrient, unit and time](https://www.statbank.dk/KVAEL2) — Statistics Denmark; 2026-05-19; locator: KVAEL2; STOFTYPE=all; MÅLEENHED=MIOKG; Tid=2022:2023; archive: locator only; review: pending.
  - Source limitations: Supply is not necessarily application, nutrient balance, recycled content or final nutrient fate. The latest table period remains 2022/23 despite a 2026 metadata update.
- [Commission Delegated Decision (EU) 2019/1597 establishing a common methodology and minimum quality requirements for the uniform measurement of levels of food waste](https://eur-lex.europa.eu/legal-content/en/ALL/?uri=CELEX%3A32019D1597) — European Commission / EUR-Lex; 2019-05-03; locator: Articles 1–4 and Annexes III–IV; archive: locator only; review: pending.
  - Source limitations: A harmonized method does not make national estimates directly comparable when countries select different permitted methods or operational boundaries. The decision excludes several pre-harvest, animal-by-product, feed-destination and wastewater flows from food-waste reporting.
- [Food waste and food waste prevention, env_wasfw, 2023 Denmark and Finland query](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw?lang=en&time=2023&geo=DK&geo=FI) — Eurostat; 2025-10-16; locator: env_wasfw; time=2023; geo=DK,FI; TOTAL and five NACE/household stage categories; T and KG_HAB units; archive: locator only; review: pending.
  - Source limitations: The API result is live and has not been frozen as source bytes or a reproducible query receipt in the evidence store. The inspected metadata does not resolve whether the FI reporting boundary includes Åland.

**Observation candidates**

- The EU method defines annual measurement across primary production, processing and manufacturing, retail and distribution, restaurants and food services, and households.
  - Candidate use: `method_candidate`; boundary fit: `method_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Articles 1–4 and Annexes III–IV (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Method availability does not establish Danish data quality or substantive coverage.
- Eurostat reports 1,553,763 tonnes of food waste for Denmark across the five reporting stages in 2023.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: env_wasfw; geo=DK; time=2023; waste=TOTAL; unit=T (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: This is not a full circularity, side-stream-destination or nutrient balance.
- The Danish mapping estimates 116,629 tonnes of primary-production food waste in 2022.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Report pp. 6–11, Tables 2–4 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Method and classification changes complicate trends and comparisons.
- Statistics Denmark reports 40.7 million kilograms of potassium in mineral-fertilizer supply for 2022/23.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: KVAEL2; nutrient K; MÅLEENHED=MIOKG; Tid=2022:2023 (`exact_candidate_locator`); metadata gaps: `period`.
  - Observation limitations: Exact start and end dates for the table's 2022/23 reporting period remain to be verified.

**Facet lead states**

- **substantive_candidate_identified:** `domain.circularity_resource_efficiency_waste`, `flow.physical.food_loss`, `flow.physical.food_waste`, `flow.physical.nutrient_k`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.side_stream`, `material.waste`, `stage.return_flows.loss_waste_generation`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `circular_strategy.r8`, `circular_strategy.r9`, `flow.physical.energy`, `material.compost`, `material.digestate`, `material.manure`, `material.sludge`, `material.soil_amendment`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.collection_sorting`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`, `stage.return_flows.material_recovery`, `stage.return_flows.nutrient_return`

**Explicit unknowns**

- A reconciled material balance connecting five-stage food waste to donation, feed, ingredients, biogas, digestate, compost, energy and disposal.
- Current detailed household and food-service mappings and the expected next primary and manufacturing cycle with method-break documentation.
- Realized nutrient recovery and substitution, including N-P-K contents, treatment losses and final field application.
- Potassium beyond mineral supply and complete side-stream N-P-K inputs, outputs, stocks and environmental losses.
- Aquaculture, fish-processing and other commodity-specific side streams and cross-border destinations.
- Costs, energy, emissions, contamination, food safety, ownership, contracts and distribution of recovered value.

**Next actions**

- Freeze the Eurostat API result and Danish EPA report bytes with query and table locators.
- Reconcile 2022 detailed sectors with 2023 Eurostat categories without treating classification changes as trends.
- Add nutrient-balance, digestate-destination and redistribution sources as separate observations.
- Enumerate required child dimensions and obtain source-method appraisal before any assessment proposal.

### Finland

Cell: `cov.v1.profile=legacy_field_political.geography=fi.legacy_fields=f08`

Boundary: Finnish political reporting scope as published by national sources; several totals explicitly or potentially include Åland and cannot be added to the separate Åland cell.

**Candidate sources**

- [Commission Delegated Decision (EU) 2019/1597 establishing a common methodology and minimum quality requirements for the uniform measurement of levels of food waste](https://eur-lex.europa.eu/legal-content/en/ALL/?uri=CELEX%3A32019D1597) — European Commission / EUR-Lex; 2019-05-03; locator: Articles 1–4 and Annexes III–IV; archive: locator only; review: pending.
  - Source limitations: A harmonized method does not make national estimates directly comparable when countries select different permitted methods or operational boundaries. The decision excludes several pre-harvest, animal-by-product, feed-destination and wastewater flows from food-waste reporting.
- [Food waste and food waste prevention, env_wasfw, 2023 Denmark and Finland query](https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw?lang=en&time=2023&geo=DK&geo=FI) — Eurostat; 2025-10-16; locator: env_wasfw; time=2023; geo=DK,FI; TOTAL and five NACE/household stage categories; T and KG_HAB units; archive: locator only; review: pending.
  - Source limitations: The API result is live and has not been frozen as source bytes or a reproducible query receipt in the evidence store. The inspected metadata does not resolve whether the FI reporting boundary includes Åland.
- [From Recycling to Circular Economy: National Waste Plan to 2027](https://julkaisut.valtioneuvosto.fi/items/d9351aff-c11c-4bad-813d-07b2a3f4c9b1) — Finnish Ministry of the Environment; 2022-04-06; locator: Report pp. 3, 5 and 8–11; goals on p. 9; archive: locator only; review: pending.
  - Source limitations: The plan explicitly excludes Åland and cannot support the Åland Field 08 cell. Targets and policy intent are not measured implementation or outcomes.
- [Nitrogen and phosphorus balance](https://www.luke.fi/en/statistics/indicators/cap-indicators/nitrogen-and-phosphorus-balance) — Natural Resources Institute Finland (Luke); 2026-02-18; locator: PxWeb table Maatalousmaan ravinnetase; whole country and Ahvenanmaa; nutrients N and P; year 2024; archive: locator only; review: pending.
  - Source limitations: The whole-country value explicitly includes Åland, while Åland is also reported separately and the two cannot be added. The balance is neither short-term pollution nor realized circularity and contains no potassium balance.
- [Indicator for nutrient recycling](https://www.luke.fi/en/statistics/indicators/indicator-for-nutrient-recycling) — Natural Resources Institute Finland (Luke); 2026-06-26; locator: PxWeb Ravinteet_uusi; indicator vintage 2026; whole country and Ahvenanmaa; total and component biomass, N and P; archive: locator only; review: pending.
  - Source limitations: The 2026 indicator combines source years from 2023 to 2025, literature coefficients and rough treatment or end-use estimates. Potential is not realized recovery, application, substitution or circularity; potassium and several losses are absent.

**Observation candidates**

- The EU method supplies a common five-stage reporting frame for Finnish food-waste statistics but does not define the Finland–Åland split used in this project.
  - Candidate use: `method_candidate`; boundary fit: `method_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Articles 1–4 and Annexes III–IV (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The territorial boundary remains unresolved.
- Eurostat reports 641,006 tonnes of food waste for geo code FI across the five reporting stages in 2023.
  - Candidate use: `boundary_reconciliation_candidate`; boundary fit: `requires_reconciliation`; status: `candidate_unverified`; external use: blocked.
  - Locator: env_wasfw; geo=FI; time=2023; waste=TOTAL; unit=T (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The observation cannot support a mainland-only Finland value or the separate Åland cell.
- Luke reports a whole-country agricultural nitrogen balance of 54.9 kilograms per hectare for 2024, explicitly including Åland.
  - Candidate use: `boundary_reconciliation_candidate`; boundary fit: `requires_reconciliation`; status: `candidate_unverified`; external use: blocked.
  - Locator: Whole country; nutrient=N; year=2024 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Cannot be added to the separate Åland balance or converted to mainland mass without underlying hectares and masses.
- Luke's 2026 indicator estimates 80,539 tonnes of nitrogen per year in potentially recyclable Finnish biomass streams, including Åland.
  - Candidate use: `boundary_reconciliation_candidate`; boundary fit: `requires_reconciliation`; status: `candidate_unverified`; external use: blocked.
  - Locator: Whole country; total biomass streams; nutrient=N; indicator vintage 2026 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Potential is not recovered, applied, plant available or substituting virgin fertilizer.
- Finland's national waste plan sets food-waste, municipal-biowaste recycling and recycled-fertilizer product targets while explicitly excluding Åland.
  - Candidate use: `policy_context_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Report pp. 3, 5 and 8–11; goals on p. 9 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Targets are not implementation or outcome evidence and cannot be assigned to Åland.

**Facet lead states**

- **context_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `outcome.resource_circularity`, `stage.return_flows.collection_sorting`
- **boundary_reconciliation_required:** `circular_strategy.r8`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `material.manure`, `material.side_stream`, `material.sludge`, `material.soil_amendment`, `material.waste`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.nutrient_return`
- **no_candidate_identified:** `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `circular_strategy.r9`, `flow.physical.energy`, `flow.physical.food_loss`, `flow.physical.nutrient_k`, `flow.physical.side_stream`, `material.compost`, `material.digestate`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`, `stage.return_flows.material_recovery`

**Explicit unknowns**

- Whether Eurostat and Luke food-waste totals for geo code FI include Åland and a defensible mainland-Finland residual.
- Non-additive reconciliation of whole-country nutrient balances and potential stocks with separate Åland rows.
- Actual end destinations and utilization of manure, sludge, municipal biowaste and industrial nutrient by-products.
- Realized nutrient recovery, plant availability, mineral substitution, potassium return and process or field losses.
- A complete stage-by-stage edible and inedible food-waste, redistribution, feed and treatment mass balance.
- Interregional and cross-border flows, aquaculture streams, contamination, safety, economics, ownership and outcomes.

**Next actions**

- Obtain an authoritative Finland–Åland boundary statement for food-waste reporting before using the FI total as substantive evidence.
- Freeze Luke PxWeb queries with exact dimensions and retain whole-country and Åland rows as non-additive observations.
- Separate potential biomass stocks from realized treatment, product, application and substitution measurements.
- Create child-cell inventories and a reviewed boundary reconciliation before proposing an assessment.

### Faroe Islands

Cell: `cov.v1.profile=legacy_field_political.geography=fo.legacy_fields=f08`

Boundary: Faroe Islands political reporting scope; the located measurements cover an IRF operator area and cannot be generalized across Tórshavn and all other operators or islands.

**Candidate sources**

- [IRF Ársfrásøgn 2025](https://irf.fo/wp-content/uploads/2026/04/arsfrasogn_irf_2025_web_einkultarsidur-pdf-1.pdf) — IRF; publication date unknown; locator: p. 8; p. 52, Table 13; p. 53, Tables 15 and 17; archive: locator only; review: pending.
  - Source limitations: IRF served 57.2 percent of the Faroese population and its broad waste totals cannot be generalized nationally. Only used cooking oil is directly attributable to a food side stream; mixed-waste energy recovery is not a food-system flow measure.
- [IRF Ársfrásøgn 2023 – Kanning av gráa posa](https://irf.fo/wp-content/uploads/2024/06/3_arsfrasogn_2023_skiggja.pdf) — IRF; publication date unknown; locator: Printed p. 20, Kanning av gráa posa; archive: locator only; review: pending.
  - Source limitations: The 134-bag sample has insufficiently described selection and no national representativeness or uncertainty interval. Food and other organic material are combined, with no edible split or national total tonnage.
- [Regulation No. 240 of 30 December 2025 on additional fishing days for landing liver, roe and other viscera](https://logir.fo/Kunngerd/240-fra-30-12-2025-um-at-lata-eyka-fiskidagar-til-fiskifor-id-avreida-livur-rogn) — Lógasavn / Ministry of Foreign Affairs and Fisheries; 2025-12-31; locator: Sections 1–6; archive: locator only; review: pending.
  - Source limitations: Allocated fishing days and landing thresholds do not establish uptake, actual tonnes, product destinations or avoided disposal. Product yield, economic effect and environmental outcome remain unknown.

**Observation candidates**

- IRF recorded 28 tonnes of used cooking oil in its service area in 2025.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: p. 53, Table 17 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: One operator and one side stream do not establish national circularity or product yield.
- IRF's first grey-bag sample classified 50 percent of sampled residual-bin mass as food or organic material in 2023.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Printed p. 20, Kanning av gráa posa (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Food and other organics are combined and no uncertainty or national tonnage is available.
- The 2026 Faroese regulation creates a documented incentive route for landing liver, roe and other viscera, but no realized flow is yet established.
  - Candidate use: `policy_context_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Sections 1–6 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Allocation and documentation duties are not uptake, tonnage, yield or impact evidence.

**Facet lead states**

- **substantive_candidate_identified:** `circular_strategy.r7`, `circular_strategy.r8`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `flow.physical.side_stream`, `material.side_stream`, `material.waste`, `stage.return_flows.collection_sorting`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.material_recovery`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r9`, `flow.physical.energy`, `flow.physical.food_loss`, `flow.physical.nutrient_k`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `material.compost`, `material.digestate`, `material.manure`, `material.sludge`, `material.soil_amendment`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`, `stage.return_flows.nutrient_return`

**Explicit unknowns**

- A reconciled national food-waste total by stage, edibility and operator boundary.
- Representative repeated residual-waste studies and national organics collection or treatment quantities.
- Fishing, aquaculture, slaughter and processing side-stream masses, destinations, product yields and substitution.
- Actual utilization results from the 2026 viscera incentive and complete feed, ingredient, biomaterial and disposal routes.
- Composting, anaerobic digestion, biogas, digestate, manure, sludge and crop-residue flows.
- Complete N-P-K accounts, island and actor detail, impacts, contamination, safety, cost and ownership.

**Next actions**

- Establish the national operator universe and reconcile IRF, Tórshavn and other service boundaries before extrapolation.
- Freeze the annual-report tables and document the 134-bag sample design and limits.
- Monitor the 2026 fish-viscera incentive for verified landed tonnes and destination records.
- Commission or locate a national food-waste and N-P-K measurement route before proposing a cell assessment.

### Greenland

Cell: `cov.v1.profile=legacy_field_political.geography=gl.legacy_fields=f08`

Boundary: Greenland political reporting scope; official sources currently provide a national data-gap statement, legal definitions and policy intentions rather than a measured Field 08 baseline.

**Candidate sources**

- [Greenland Self-Sufficiency Strategy 2025–2030](https://naalakkersuisut.gl/-/media/nyheder/2024/12/web-grnlands-selvforsyningsstrategi_web.pdf) — Government of Greenland, Department of Agriculture, Self-Sufficiency, Energy and Environment; publication date unknown; locator: p. 24 and Delmål 7, pp. 52–53; archive: locator only; review: pending.
  - Source limitations: Potential routes for fish waste, feed, fertilizer and products are policy intent rather than measured outcomes. The source provides no baseline tonnage, nutrient content, safety, adoption denominator or environmental effect.
- [Virksomhedsprogram 2025–2028](https://stat.gl/publ/da/GS/202504/pdf/2025%20Virksomhedsprogram.pdf) — Statistics Greenland; publication date unknown; locator: Section 3.18, Affald og emissioner, printed pp. 21–22; archive: locator only; review: pending.
  - Source limitations: The source documents incomplete national statistics; it is not a material-flow measurement. It does not prove that no local, municipal or operator data exist.
- [Self-Government Regulation No. 3 of 7 January 2021 on waste](https://nalunaarutit.gl/groenlandsk-lovgivning/2021/bkg-03-2021?sc_lang=da) — Government of Greenland; 2021-01-07; locator: Section 6 definitions; archive: locator only; review: pending.
  - Source limitations: Legal definitions establish a system boundary only and provide no quantities or collection coverage. Compliance, treatment destination and circularity outcomes remain unknown.

**Observation candidates**

- Statistics Greenland documents sparse municipal waste-site quantities, incomplete ESANI coverage and dependence on old sorting studies in the national official-statistics system.
  - Candidate use: `data_gap_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Section 3.18, Affald og emissioner, printed pp. 21–22 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: A documented national gap does not prove absence of local or operator data and never renders as zero.
- Greenland's self-sufficiency strategy identifies potential whole-fish, feed, fertilizer and product routes without a measured national side-stream baseline.
  - Candidate use: `policy_context_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: p. 24 and Delmål 7, pp. 52–53 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Opportunity language cannot be promoted to measured generation, adoption, nutrient return or effect.
- Greenland's waste regulation defines biowaste to include food, kitchen, fish and animal waste and establishes a legal classification boundary only.
  - Candidate use: `policy_context_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Section 6 definitions (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Legal definition provides no collection, treatment, compliance or circularity measure.

**Facet lead states**

- **context_candidate_identified:** `circular_strategy.r7`, `circular_strategy.r8`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `flow.physical.nutrient_k`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.side_stream`, `material.soil_amendment`, `material.waste`, `outcome.resource_circularity`, `stage.return_flows.collection_sorting`, `stage.return_flows.disposal`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.material_recovery`, `stage.return_flows.nutrient_return`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r9`, `flow.physical.energy`, `flow.physical.food_loss`, `material.compost`, `material.digestate`, `material.manure`, `material.sludge`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.energy_recovery`

**Explicit unknowns**

- Any nationally complete food-waste measurement by stage, edibility, town, settlement, municipality and operator.
- Reconciled ESANI and municipal collection, treatment, open-burning, landfill and facility-throughput quantities.
- Fish, shrimp, bycatch, offal, skins, bones, hunting, slaughter and agricultural side-stream mass balances.
- Community-authorized boundaries for hunting, subsistence, sensitive knowledge and affected resource locations.
- Feed, fertilizer, product-output, compost, biogas, digestate, manure, sludge and complete N-P-K flows.
- Seasonal logistics, contamination, safety, economics, ownership and implementation results for the 2025–2030 strategy.

**Next actions**

- Treat the official data-gap statement as a research route and never as evidence of zero waste or zero circularity.
- Map municipal and operator data owners and establish a frozen national reporting universe with local and community review.
- Separate policy opportunity routes from measured generation, product yield, nutrient return and outcome observations.
- Do not propose an assessment until measured sources, boundaries, evidence records and human review exist.

### Iceland

Cell: `cov.v1.profile=legacy_field_political.geography=is.legacy_fields=f08`

Boundary: Icelandic political reporting scope; the 2022 food-waste baseline, agricultural nitrogen activity account and GAJA context have different boundaries and purposes.

**Candidate sources**

- [Commission Delegated Decision (EU) 2019/1597 establishing a common methodology and minimum quality requirements for the uniform measurement of levels of food waste](https://eur-lex.europa.eu/legal-content/en/ALL/?uri=CELEX%3A32019D1597) — European Commission / EUR-Lex; 2019-05-03; locator: Articles 1–4 and Annexes III–IV; archive: locator only; review: pending.
  - Source limitations: A harmonized method does not make national estimates directly comparable when countries select different permitted methods or operational boundaries. The decision excludes several pre-harvest, animal-by-product, feed-destination and wastewater flows from food-waste reporting.
- [Food Waste in Iceland 2022 – Final methodological report](https://www.umhverfisstofnun.is/library/Skrar/utgefid-efni/Annad/Food_waste_in_Iceland_2022_UPD.pdf) — Icelandic Environment and Energy Agency; publication date unknown; locator: Methodology and boundaries pp. 4 and 8–13; Figure 1 and Tables 1–4 pp. 14–16; limitations pp. 17–18; archive: locator only; review: pending.
  - Source limitations: Liquids, sewer disposal, substantial dairy/café/bar activity, several animal by-products, feed destinations and illegal fish discards are excluded or missing. Aquaculture is a documented false zero, response rates were low, and the abstract and body contain unit and household-share discrepancies.
- [Report on Policies, Measures and Projections, Iceland 2025](https://ust.is/library/sida/Loft/Report%20on%20Policies%2C%20Measures%2C%20and%20Projections_Iceland_2025.pdf) — Icelandic Environment and Energy Agency; publication date unknown; locator: Section 3.8, GAJA, p. 92; sections 3.8.4–3.8.5, pp. 100–101; archive: locator only; review: pending.
  - Source limitations: The stated 30–40 kt is design capacity or expectation, not measured throughput. No actual compost, methane, nutrient, contamination, leakage, application-destination or displacement data are reported.
- [National Inventory Document, Iceland 2025](https://www.ust.is/library/sida/Loft/National%20Inventory%20Document_Iceland_2025.pdf) — Icelandic Environment and Energy Agency; publication date unknown; locator: Chapter 5, section 5.7.2, Table 5.42, printed p. 197; archive: locator only; review: pending.
  - Source limitations: This is an agricultural-soil emissions activity account, not a nutrient balance or circularity assessment. Phosphorus, potassium, crop uptake, food-side-stream attribution, output balance and route-specific losses are absent.

**Observation candidates**

- The EU method is the declared frame for Iceland's first extensive national food-waste estimate.
  - Candidate use: `method_candidate`; boundary fit: `method_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Articles 1–4 and Annexes III–IV (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The method does not remove the Iceland report's missing-data and boundary limitations.
- Iceland's first extensive national estimate reports 60,300 tonnes of food waste across the five stages in 2022.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Figure 1 and Tables 1–4, pp. 14–16 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Aquaculture is a false zero and multiple sectors, response rates and report inconsistencies prevent completeness.
- Iceland's 2025 inventory document reports 9,034 tonnes of nitrogen from inorganic fertilizer applied to agricultural soils in 2023.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Chapter 5, section 5.7.2, Table 5.42, printed p. 197 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: This non-circular reference input supplies no P, K, output balance or food-side-stream attribution.
- The official 2025 policy report identifies GAJA as an operational compost-and-methane route but does not report a complete measured material or nutrient output balance.
  - Candidate use: `policy_context_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Section 3.8, p. 92; sections 3.8.4–3.8.5, pp. 100–101 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Design capacity and landfill-change context must not be represented as national measured circularity.

**Facet lead states**

- **substantive_candidate_identified:** `domain.circularity_resource_efficiency_waste`, `flow.physical.food_loss`, `flow.physical.food_waste`, `flow.physical.nutrient_n`, `material.manure`, `material.sludge`, `material.soil_amendment`, `material.waste`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.nutrient_return`
- **context_candidate_identified:** `circular_strategy.r8`, `circular_strategy.r9`, `flow.physical.energy`, `material.compost`, `stage.return_flows.biological_recovery`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `flow.physical.nutrient_k`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.digestate`, `material.side_stream`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.collection_sorting`, `stage.return_flows.material_recovery`

**Explicit unknowns**

- A repeated national food-waste series with uncertainty intervals, edible splits and complete dairy, hospitality, liquid and sewer-disposal coverage.
- Reconciled fisheries, illegal-discard, on-vessel processing and aquaculture boundaries, including correction of the documented false zero.
- Redistribution, donation, former-food-to-feed, animal-by-product and side-stream destinations.
- Actual GAJA inputs, compost, methane, nutrient outputs, destinations, contamination, leakage and displacement.
- Complete N-P-K inputs, crop uptake, outputs, recovery, trade, stocks and environmental losses.
- Commodity, stage, geography, actor, safety, cost, ownership and intervention-effect detail.

**Next actions**

- Archive and appraise the full 2022 food-waste report with contradiction records for the abstract, household share and aquaculture false zero.
- Add facility-level GAJA throughput and output records only when measured quantities and boundaries are available.
- Build separate N, P and K input, return and loss observations rather than extending the nitrogen inventory by inference.
- Enumerate child cells and obtain human completeness review before changing the cell state.

### Norway

Cell: `cov.v1.profile=legacy_field_political.geography=no.legacy_fields=f08`

Boundary: Norwegian political reporting scope; national and sector sources remain separate, and none supplies a complete food-system boundary or Sápmi representation.

**Candidate sources**

- [Matsvinn i jordbrukssektoren – Kartlegging for 2024, Rapport 45/2025](https://www.landbruksdirektoratet.no/nb/nyhetsrom/rapporter/matsvinn-i-jordbrukssektoren-kartlegging-for-2024) — Landbruksdirektoratet; 2025-12-15; locator: PDF p. 8, Table 1; official landing-page summary; archive: locator only; review: pending.
  - Source limitations: The mapping is not a whole-food-system total and uses sector-specific methods that are weather sensitive. Table 1 and the official page report 43,132 tonnes while one prose passage appears to report 43,152 tonnes.
- [Avfallshandtering ved avfallsanlegg](https://www.ssb.no/natur-og-miljo/avfall/statistikk/avfallshandtering-ved-avfallsanlegg/) — Statistics Norway; 2026-03-23; locator: Selected figures, Table 2; StatBank source table 12359; year 2024; archive: locator only; review: pending.
  - Source limitations: Treatment inputs do not establish prevention, product yield, nutrient recovery, fertilizer substitution or high-value circularity. Published inputs other than sludge use wet mass, while sludge is reported on a dry-matter basis and some splits are suppressed.
- [Gjødsel i jordbruket](https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/artikler/gjodsel-i-jordbruket-20251117) — Statistics Norway; 2025-11-24; locator: Nutrient availability, manure to biogas, sewage sludge and correction notice; StatBank table 14646; archive: locator only; review: pending.
  - Source limitations: Nutrient tonnes, manure wet mass and sewage-sludge dry mass are different measures and cannot be added. Statistics Norway identifies missing or unreliable nutrient estimates for several other organic-fertilizer streams.

**Observation candidates**

- The mapped Norwegian agricultural sectors generated 43,132 tonnes of food waste in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: PDF p. 8, Table 1; official landing-page summary (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Retain the 43,132-versus-43,152 internal report discrepancy and do not combine unlike sector units.
- Reporting Norwegian waste-treatment plants received 746,000 tonnes for biological treatment in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Selected figures, Table 2; StatBank 12359; Behandla i alt; 2024 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: A tonne treated is not a tonne of recovered nutrient or displaced virgin input.
- Statistics Norway reports about 140,000 tonnes of nitrogen available to agriculture from mineral fertilizer and manure in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Nutrient availability and correction notice; StatBank table 14646 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The total does not identify recovered nitrogen, application, uptake, losses or substitution.

**Facet lead states**

- **substantive_candidate_identified:** `circular_strategy.r8`, `circular_strategy.r9`, `domain.circularity_resource_efficiency_waste`, `flow.physical.energy`, `flow.physical.food_loss`, `flow.physical.food_waste`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.manure`, `material.side_stream`, `material.sludge`, `material.soil_amendment`, `material.waste`, `stage.return_flows.biological_recovery`, `stage.return_flows.collection_sorting`, `stage.return_flows.energy_recovery`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.nutrient_return`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `flow.physical.nutrient_k`, `material.compost`, `material.digestate`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.disposal`, `stage.return_flows.material_recovery`

**Explicit unknowns**

- A harmonized annual mass balance from prevention and redistribution through feed, ingredients, biological treatment, energy recovery and disposal.
- Edible and inedible fractions and dry-matter or nutrient-normalized quantities for every major side stream.
- Actual high-value use, plant-available nutrient return and mineral-fertilizer substitution from digestate, sludge, compost and marine streams.
- A complete N-P-K account including trade, aquaculture, wastewater, atmospheric loss, soil-stock change and potassium return.
- Costs, energy, emissions, contamination, source–sink logistics, ownership, contracts and value or risk distribution.
- National redistribution and donation quantities and the effect of enacted but not yet proven policy duties.

**Next actions**

- Capture immutable source bytes and reproducible table extracts for the three candidate sources, then create source, citation and observation records.
- Reconcile food-waste definitions and units before any Norway trend or Nordic comparison.
- Enumerate stage, commodity, actor, flow, outcome, period and metric child cells for the largest material and nutrient streams.
- Appraise methods and contradictions with a named human reviewer before changing the cell from unassessed.

### Sápmi

Cell: `cov.v1.profile=legacy_field_sapmi_overlap.geography=sapmi.legacy_fields=f08`

Boundary: Sápmi is a separate cross-border Indigenous geography; political-country data receives zero Sápmi coverage credit without an approved rights-holder authority, consent, interpretation and review route.

**Candidate sources**

- [Research Ethics Council of the Sámi Parliament](https://samediggi.fi/en/decision-making/expert-committees/research-ethics-council-of-the-sami-parliament/) — Sámi Parliament of Finland; 2026-04-14; locator: Council mandate and collective prior-consent responsibilities; archive: locator only; review: pending.
  - Source limitations: The institutional route is Finland-specific and does not replace consent from affected communities, Skolt institutions or individual knowledge holders. It provides no Field 08 subject evidence.
- [Consultations between the Sámi Parliament and the state](https://sametinget.no/areal-klima-og-miljo/areal/konsultasjoner-mellom-sametinget-og-staten/) — Sámi Parliament in Norway; 2026-02-17; locator: Consultation duty, timing and identification of other Sámi representatives; archive: locator only; review: pending.
  - Source limitations: The Sámi Parliament and public consultation process do not substitute for consent from affected siida, communities, organizations or knowledge holders. It provides no Field 08 subject evidence.
- [Sámi Ownership and Data Access principles](https://www.saamicouncil.net/news-archive/soda-prinsipper-2gsec-22l7f) — Saami Council; 2024-08-19; locator: SODA principle set and CARE-based roadmap summary; archive: locator only; review: pending.
  - Source limitations: The principles do not confer project consent or identify the authorized representative for each community, subject or dataset. A safe Kola/Russian authority route remains unresolved and no Field 08 subject evidence is supplied.
- [Konsultation med Sametinget](https://sametinget.se/konsultationsordning) — Sámi Parliament in Sweden; 2026-06-15; locator: När ska en konsultation ske? and Vilka ska konsulteras?; archive: locator only; review: pending.
  - Source limitations: Statutory consultation is not automatically research consent, dataset licensing or community authorization. Affected samebyar and Sámi organizations retain distinct positions and no Field 08 evidence is supplied.

**Observation candidates**

- The Sámi Parliament of Finland's Research Ethics Council is a candidate institutional route for collective prior consent and research-ethics coordination.
  - Candidate use: `rights_holder_authority_route`; boundary fit: `rights_holder_route_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Council mandate and collective prior-consent responsibilities (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Institutional contact is not consent from affected communities or subject evidence.
- The Sámi Parliament in Sweden's consultation guidance identifies the Parliament, affected samebyar and relevant Sámi organizations as distinct consultation parties.
  - Candidate use: `rights_holder_authority_route`; boundary fit: `rights_holder_route_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: När ska en konsultation ske? and Vilka ska konsulteras? (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Statutory consultation is not automatically research consent or data authorization.
- The Sámi Parliament in Norway's guidance requires early good-faith consultation and points to additional affected Sámi representatives who may hold separate authority.
  - Candidate use: `rights_holder_authority_route`; boundary fit: `rights_holder_route_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Consultation duty, timing and identification of other Sámi representatives (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Neither the Parliament nor a public consultation process substitutes for consent from affected communities or knowledge holders.
- The Saami Council's SODA principles are a candidate pan-Sámi data-governance framework emphasizing collective benefit, authority, lifecycle rights, dignity and autonomy.
  - Candidate use: `rights_holder_authority_route`; boundary fit: `rights_holder_route_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: SODA principle set and CARE-based roadmap summary (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Principles do not confer project consent or identify authority for a specific community, topic or dataset.

**Facet lead states**

- **rights_holder_route_required:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `circular_strategy.r8`, `circular_strategy.r9`, `domain.circularity_resource_efficiency_waste`, `flow.physical.energy`, `flow.physical.food_loss`, `flow.physical.food_waste`, `flow.physical.nutrient_k`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.compost`, `material.digestate`, `material.manure`, `material.side_stream`, `material.sludge`, `material.soil_amendment`, `material.waste`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.biological_recovery`, `stage.return_flows.collection_sorting`, `stage.return_flows.disposal`, `stage.return_flows.energy_recovery`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.material_recovery`, `stage.return_flows.nutrient_return`

**Explicit unknowns**

- Which Field 08 questions rights-holders want examined and whether the project's categories are acceptable.
- Affected geographies, communities, siida, samebyar, reindeer districts, fisheries, organizations and knowledge custodians.
- Authority to consent for community, traditional, archival and public data in each affected context.
- Ownership, custody, access tiers, languages, permitted reuse, benefit sharing, review, withdrawal and deletion rights.
- Risks from disclosure of sensitive knowledge or resource locations and a safe legitimate Kola or Russian route.
- Any approved measurements, units, periods, commodities, stages, flows, outcomes or publication permissions.

**Next actions**

- Pause subject-matter research until a rights-holder-led scoping process confirms questions, concepts, boundaries and intended benefits.
- Map project-specific authority and consent routes with the relevant Sámi Parliaments, affected communities and pan-Sámi institutions.
- Agree data governance, language, access, review, benefit-sharing, publication, withdrawal and safety conditions before collection.
- Create immutable authority, consent and review receipts before any Sápmi assessment or substantive coverage credit.

### Sweden

Cell: `cov.v1.profile=legacy_field_political.geography=se.legacy_fields=f08`

Boundary: Swedish political reporting scope; food-waste, fertilizer and biogas reporting populations and material bases are distinct and cannot be summed.

**Candidate sources**

- [Commission Delegated Decision (EU) 2019/1597 establishing a common methodology and minimum quality requirements for the uniform measurement of levels of food waste](https://eur-lex.europa.eu/legal-content/en/ALL/?uri=CELEX%3A32019D1597) — European Commission / EUR-Lex; 2019-05-03; locator: Articles 1–4 and Annexes III–IV; archive: locator only; review: pending.
  - Source limitations: A harmonized method does not make national estimates directly comparable when countries select different permitted methods or operational boundaries. The decision excludes several pre-harvest, animal-by-product, feed-destination and wastewater flows from food-waste reporting.
- [Produktion och användning av biogas och rötrester år 2024](https://www.energimyndigheten.se/nyhetsarkiv/2025/biogasproduktionen-okade-i-sverige-under-2024/) — Swedish Energy Agency; 2025-10-01; locator: Linked national survey report p. 24, Table 10, and p. 28, Table 14; archive: locator only; review: pending.
  - Source limitations: Wet-tonne substrate totals are dominated by sewage and industrial sludge or wastewater and are not nutrient-equivalent. Reported digestate fertilizer use does not establish N-P-K recovery, mineral substitution, contamination or environmental effect.
- [Livsmedelsavfall i Sverige](https://www.naturvardsverket.se/data-och-statistik/avfall/avfall-mat/) — Naturvårdsverket; 2025-12-18; locator: Main summary; Livsmedelsavfall per person 2020–2024; Statistik motsvarar inte matsvinnet; Nästa uppdatering; archive: locator only; review: pending.
  - Source limitations: The total includes inedible fractions and excludes drain disposal, material redirected to feed and primary/industrial values not yet published for 2024. Food waste is not equivalent to avoidable food waste or a complete national food-loss account.
- [Användning av kväve (N) och fosfor (P) från mineral- och stallgödsel](https://www.scb.se/hitta-statistik/statistik-efter-amne/miljo/vaxtnaring-och-odlingsatgarder/godselmedel-och-odlingsatgarder-i-jordbruket/pong/tabell-och-diagram/godselmedel/anvandning-av-kvave-n-och-fosfor-p-fran-mineral--och-stallgodsel/) — Statistics Sweden; 2026-06-18; locator: Whole-Sweden row in the 2025 table; archive: locator only; review: pending.
  - Source limitations: The survey omits or incompletely covers several circular fertilizer products and provides no potassium total. Fertilizer use is not a food-system N-P-K mass balance or a measure of nutrient recovery.

**Observation candidates**

- The EU method supplies the five-stage food-waste reporting frame used for Swedish reporting while permitting several measurement methods.
  - Candidate use: `method_candidate`; boundary fit: `method_only`; status: `candidate_unverified`; external use: blocked.
  - Locator: Articles 1–4 and Annexes III–IV (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Common categories do not guarantee identical national measurement methods.
- Swedish retail and consumer stages generated approximately 880,000 tonnes of solid food waste in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Main summary and Livsmedelsavfall per person 2020–2024 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Food waste includes inedible fractions and is not avoidable waste.
- The 2025 Swedish agricultural survey reports 211,950 tonnes of plant-available nitrogen from mineral and manure fertilizer.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: Whole-Sweden row in the 2025 table; total plant-available N (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: The observation does not isolate recycled nitrogen or constitute a nutrient balance.
- Swedish reporting biogas plants recorded 3.410 million tonnes of digestate used as fertilizer in 2024.
  - Candidate use: `substantive_measurement_candidate`; boundary fit: `direct_candidate`; status: `candidate_unverified`; external use: blocked.
  - Locator: National survey report p. 28, Table 14 (`exact_candidate_locator`); metadata gaps: none declared at intake.
  - Observation limitations: Reported fertilizer destination does not quantify N-P-K return, plant availability, contamination or substitution.

**Facet lead states**

- **substantive_candidate_identified:** `circular_strategy.r8`, `circular_strategy.r9`, `domain.circularity_resource_efficiency_waste`, `flow.physical.energy`, `flow.physical.food_waste`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`, `flow.physical.side_stream`, `material.digestate`, `material.manure`, `material.side_stream`, `material.sludge`, `material.soil_amendment`, `material.waste`, `stage.return_flows.biological_recovery`, `stage.return_flows.energy_recovery`, `stage.return_flows.loss_waste_generation`, `stage.return_flows.nutrient_return`
- **no_candidate_identified:** `circular_strategy.r0`, `circular_strategy.r1`, `circular_strategy.r2`, `circular_strategy.r3`, `circular_strategy.r4`, `circular_strategy.r5`, `circular_strategy.r6`, `circular_strategy.r7`, `flow.physical.food_loss`, `flow.physical.nutrient_k`, `material.compost`, `outcome.resource_circularity`, `stage.market.redistribution`, `stage.return_flows.collection_sorting`, `stage.return_flows.disposal`, `stage.return_flows.material_recovery`

**Explicit unknowns**

- Complete current primary-production and manufacturing food-waste values aligned with the 2024 retail and consumer estimate.
- A single mass balance distinguishing edible surplus, inedible material, feed diversion, ingredients, treatment, energy and disposal.
- N-P-K recovery, plant availability, mineral substitution and losses from digestate, sludge, compost and other recycled products.
- Potassium return, food-system trade and aquaculture flows, wastewater, soil stocks and atmospheric losses.
- National redistribution quantities, compliance with sorting duties and measured prevention or recovery outcomes.
- Facility capacity, source–sink geography, contamination, safety, cost, ownership and value distribution.

**Next actions**

- Archive the official 2024 food-waste release, the 2025 fertilizer table and the full 2024 biogas survey with exact query or table receipts.
- Keep wet-mass, nutrient-mass, fertilizer-use and destination observations as separate typed measurements.
- Add the missing upstream and industrial reporting cycle when published and document any method break.
- Create child-cell inventories and obtain human appraisal before proposing an assessment event.

## Safety and interpretation

- The existing 117 historical scope-registration events are unchanged; all nine Field 08 ledger cells remain scope registrations with no subject-matter assessment.
- `substantive_candidate_identified` means a direct measurement lead was located. It does not mean the locator, method, boundary, archive, appraisal or completeness has passed review.
- Method, context and boundary-reconciliation leads never count as subject-matter coverage.
- Sápmi receives zero substantive desk-research credit. Its records identify authority, consent and rights-holder review routes only.
- Unknown facets remain explicit and never render as zero or not applicable.
