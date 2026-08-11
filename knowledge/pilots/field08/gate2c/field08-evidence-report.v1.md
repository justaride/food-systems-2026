# Field 08 Gate 2C evidence-intake report

Generated from source commit `7715aa32441c5bb229be3298e4413230fd23e63b`. Status: **machine checked; human review pending**.

## Bounded result

- 17 locator-level acquisition receipts across 5 source records
- 34 claim candidates and 29 typed measurement candidates
- 4 open claim-scoped contradiction sets
- 20 explicit child-dimension requirements
- 4 pending human review gates
- 117/117 historical coverage events retained; all nine Field 08 cells remain scope registrations and unassessed
- zero coverage promotions, readiness results, external-ready claims, Sápmi subject-evidence records or historical coverage writes

## Claims

### Åland animal and mixed food waste, 2024

- ID: `fs:claim:field08.ax.animal-mixed-food-waste-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `material.waste`
- Statement: ÅSUB Table 1 reports 18,178 tonnes in category 09.1, animal waste and mixed food waste, in Åland for 2024.
- Limitations: The category combines animal and mixed food waste. Some weights are calculated from volume.

### Åland exported-waste narrative total, 2024

- ID: `fs:claim:field08.ax.export-narrative-2024`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.collection_sorting`, `domain.circularity_resource_efficiency_waste`, `material.waste`
- Statement: ÅSUB's narrative and Appendix 2 report 19,132 tonnes of waste transported out of Åland during 2024.
- Limitations: The figure conflicts with the 19,131-tonne visible destination-row sum and the 19,105-tonne Table 5 series value.

### Åland exported-waste destination-row sum, 2024

- ID: `fs:claim:field08.ax.export-row-sum-2024`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.collection_sorting`, `domain.circularity_resource_efficiency_waste`, `material.waste`
- Statement: The visible 2024 destination rows in ÅSUB Appendix 2 sum to 19,131 tonnes: Finland 6,351, Sweden 12,722, Estonia 31 and Poland 27.
- Limitations: This is a transparent arithmetic derivation, not a separately printed total. It conflicts with the printed 19,132-tonne total and Table 5's 19,105 tonnes.

### Åland exported-waste Table 5 total, 2024

- ID: `fs:claim:field08.ax.export-table5-2024`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.collection_sorting`, `domain.circularity_resource_efficiency_waste`, `material.waste`
- Statement: ÅSUB Table 5 reports 19,105 tonnes of waste transported out of Åland in 2024.
- Limitations: The figure conflicts with 19,132 tonnes in the narrative and Appendix total and 19,131 tonnes implied by visible destination rows.

### Åland nitrogen balance, 2024

- ID: `fs:claim:field08.ax.luke-n-balance-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: `geo.fi`
- Exact facets: `geo.ax`, `stage.primary.agriculture_crop`, `domain.circularity_resource_efficiency_waste`, `flow.physical.nutrient_n`
- Statement: Luke reports a 28.6 kg/ha regional nitrogen balance for Åland in 2024.
- Limitations: The regional method differs from the national method. The Åland rate is non-additive with the national rate that already includes Åland.

### Åland phosphorus balance, 2024

- ID: `fs:claim:field08.ax.luke-p-balance-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: `geo.fi`
- Exact facets: `geo.ax`, `stage.primary.agriculture_crop`, `domain.circularity_resource_efficiency_waste`, `flow.physical.nutrient_p`
- Statement: Luke reports a rounded regional phosphorus balance of 0.0 kg/ha for Åland in 2024.
- Limitations: The value is reported to one decimal place and must not be interpreted as absence. The Åland rate is non-additive with the national rate that already includes Åland.

### Åland animal and mixed food waste under R3+

- ID: `fs:claim:field08.ax.r3-animal-mixed-treatment-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.biological_recovery`, `domain.circularity_resource_efficiency_waste`, `material.waste`
- Statement: ÅSUB Table 4 reports 12,381 tonnes of animal waste and mixed food waste under the local R3+ treatment class in 2024.
- Limitations: R3+ identifies measures that can lead to recovery; it does not prove the recovery outcome.

### ÅSUB R3+ does not prove closed-loop recovery

- ID: `fs:claim:field08.ax.r3-does-not-prove-closed-loop-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `aland_only`; non-additive with: none declared
- Exact facets: `geo.ax`, `stage.return_flows.biological_recovery`, `domain.circularity_resource_efficiency_waste`, `material.waste`
- Statement: ÅSUB's R3+ operation class identifies treatment that can lead to recovery; the 12,381-tonne input does not by itself establish recovered output, nutrient return or closed-loop circularity.
- Limitations: Destination and output evidence has not been captured.

### Denmark Eurostat restaurant and food-service food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-foodservice-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.market.foodservice_horeca`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 78,071 tonnes for Denmark's restaurant and food-service food waste in 2023 under NACE I55_I56_N-S_FOOD, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable.

### Denmark Eurostat household food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-household-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.consumption.household`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 515,074 tonnes for Denmark's household food waste in 2023 under NACE HH, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable.

### Denmark Eurostat food-manufacturing food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-manufacturing-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.processing.food_manufacturing`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 737,599 tonnes for Denmark's food-manufacturing food waste in 2023 under NACE C10_C11, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable.

### Denmark Eurostat primary-production food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-primary-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 115,343 tonnes for Denmark's primary-production food waste in 2023 under NACE A01_A03_FOOD, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable.

### Denmark Eurostat food-retail and distribution food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-retail-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.market.retail`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 107,676 tonnes for Denmark's food-retail and distribution food waste in 2023 under NACE G46_G47_FOOD, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable.

### Denmark Eurostat total food waste, 2023

- ID: `fs:claim:field08.dk.eurostat-food-waste-total-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.dk`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Eurostat reports 1,553,763 tonnes for Denmark's total food waste in 2023 under NACE aggregate TOT, waste W091_092_101_FD and operation COL.
- Limitations: Eurostat permits national measurement methods that can differ; this value is not by itself cross-country comparable. The total exactly equals the five captured stage rows within this query.

### Eurostat Finland–Åland reporting boundary unresolved

- ID: `fs:claim:field08.eu.eurostat-fi-boundary-unresolved-2023`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `unknown_finland_aland`; non-additive with: none declared
- Exact facets: `geo.fi`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The captured Eurostat response reports a 2023 FI series but does not establish whether Åland is included for the project's separate Finland and Åland geography cells; no Finland measurement is admitted.
- Limitations: Eurostat's captured payload does not resolve the project-specific Finland–Åland split.

### Whole-country Finland nitrogen balance, 2024

- ID: `fs:claim:field08.fi.luke-n-balance-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `finland_including_aland`; non-additive with: `geo.ax`
- Exact facets: `geo.fi`, `stage.primary.agriculture_crop`, `domain.circularity_resource_efficiency_waste`, `flow.physical.nutrient_n`
- Statement: Luke reports a 54.9 kg/ha nitrogen balance for whole-country Finland in 2024; the national balance includes Åland.
- Limitations: The national method includes inputs and outputs not used in regional balances. A per-hectare rate cannot be disaggregated by subtracting Åland's rate.

### Luke national and Åland nutrient-balance rates are non-additive

- ID: `fs:claim:field08.fi.luke-national-regional-nonadditive-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `finland_including_aland`; non-additive with: `geo.ax`
- Exact facets: `geo.fi`, `stage.primary.agriculture_crop`, `domain.circularity_resource_efficiency_waste`, `flow.physical.nutrient_n`, `flow.physical.nutrient_p`
- Statement: Luke states that Åland is included in national balances and separately reported regionally, while national and regional calculations use different input terms; the per-hectare rates cannot be added or subtracted.
- Limitations: No underlying area-weighted numerators and denominators are captured for reconciliation.

### Whole-country Finland phosphorus balance, 2024

- ID: `fs:claim:field08.fi.luke-p-balance-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `finland_including_aland`; non-additive with: `geo.ax`
- Exact facets: `geo.fi`, `stage.primary.agriculture_crop`, `domain.circularity_resource_efficiency_waste`, `flow.physical.nutrient_p`
- Statement: Luke reports a 4.0 kg/ha phosphorus balance for whole-country Finland in 2024; the national balance includes Åland.
- Limitations: The national method includes inputs and outputs not used in regional balances. A per-hectare rate cannot be disaggregated by subtracting Åland's rate.

### Iceland abstract food-service figure, 2022

- ID: `fs:claim:field08.is.abstract-foodservice-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.market.foodservice_horeca`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Iceland report abstract states 3.86 tonnes for restaurants and food services, dropping the thousand scale used by the detailed 3,856-tonne result.
- Limitations: This value is disputed because it is inconsistent by roughly three orders of magnitude with the detailed result and stated total.

### Iceland abstract household share, 2022

- ID: `fs:claim:field08.is.abstract-household-share-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.consumption.household`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Iceland report abstract states that households account for 39 percent of total food waste in 2022.
- Limitations: The 39 percent statement conflicts with section 3.5's 36 percent. Arithmetic from 23,781 and 60,300 is about 39.44 percent, but does not resolve which printed percentage is authoritative.

### Iceland abstract manufacturing figure, 2022

- ID: `fs:claim:field08.is.abstract-manufacturing-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.processing.food_manufacturing`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Iceland report abstract states 1.6 tonnes for processing and manufacturing, dropping the thousand scale used by the detailed 1,596.2-tonne result.
- Limitations: This value is disputed because it is inconsistent by roughly three orders of magnitude with the detailed result and stated total.

### Iceland abstract retail figure, 2022

- ID: `fs:claim:field08.is.abstract-retail-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.market.retail`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Iceland report abstract states 1.93 tonnes for retail and distribution, dropping the thousand scale used by the detailed 1,927-tonne result.
- Limitations: This value is disputed because it is inconsistent by roughly three orders of magnitude with the detailed result and stated total.

### Iceland aquaculture food waste is unknown, not zero

- ID: `fs:claim:field08.is.aquaculture-false-zero-2022`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.primary.aquaculture`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.aquatic_food.aquaculture_finfish`, `material.waste`
- Statement: The Iceland report marks aquaculture food waste as 0* because data were unavailable; it is a false zero and must remain unknown rather than evidence of no aquaculture food waste.
- Limitations: No substitute aquaculture measurement is captured in Gate 2C.

### Iceland restaurant and food-service waste, 2022

- ID: `fs:claim:field08.is.food-waste-foodservice-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.market.foodservice_horeca`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The detailed Iceland results report 3,856 tonnes of food waste from restaurants and food services in 2022.
- Limitations: The source uses survey and estimation inputs without a reported error interval. The abstract drops the thousand scale and creates an open contradiction.

### Iceland household food waste, 2022

- ID: `fs:claim:field08.is.food-waste-household-2022`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.consumption.household`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The detailed Iceland results report 23,781 tonnes of household food waste in 2022.
- Limitations: The household estimate is extrapolated from the Reykjavík area. No error interval is reported.

### Iceland processing and manufacturing food waste, 2022

- ID: `fs:claim:field08.is.food-waste-manufacturing-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.processing.food_manufacturing`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The detailed Iceland results report 1,596.2 tonnes of food waste from processing and manufacturing in 2022.
- Limitations: Questionnaire nonresponse and substitutions affect the estimate. The abstract drops the thousand scale and creates an open contradiction.

### Iceland primary-production food waste, 2022

- ID: `fs:claim:field08.is.food-waste-primary-2022`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The detailed Iceland results report 29,130 tonnes of food waste from primary production in 2022.
- Limitations: The value is dominated by fish and excludes illegal discards. Aquaculture is a false zero and does not support an absence claim.

### Iceland retail and distribution food waste, 2022

- ID: `fs:claim:field08.is.food-waste-retail-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.market.retail`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The detailed Iceland results report 1,927 tonnes of food waste from retail and distribution in 2022.
- Limitations: The source uses survey and estimation inputs without a reported error interval. The abstract drops the thousand scale and creates an open contradiction.

### Iceland food-waste total, 2022

- ID: `fs:claim:field08.is.food-waste-total-2022`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Iceland report states a 2022 total of 60.3 thousand tonnes, represented as 60,300 tonnes and consistent with rounding the five detailed stage values.
- Limitations: The total is rounded to the nearest 100 tonnes. The component methods vary and no error interval is reported.

### Iceland section 3.5 household share, 2022

- ID: `fs:claim:field08.is.section-household-share-2022`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.is`, `stage.consumption.household`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Section 3.5 of the Iceland report states that households account for 36 percent of total food waste in 2022.
- Limitations: The 36 percent statement conflicts with the abstract and is inconsistent with arithmetic from the reported household and total masses.

### Norway agricultural total combines mixed units and periods

- ID: `fs:claim:field08.no.food-waste-mixed-method-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.no`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: The Norwegian aggregate combines sector-specific methods and reference periods: grain uses July 2024 to June 2025 and the underlying milk table reports 2,545,024 litres, so its components must not be retyped as homogeneous calendar-year tonne observations.
- Limitations: The source's aggregation method requires human appraisal before component reuse.

### Norway agricultural-sector food-waste share

- ID: `fs:claim:field08.no.food-waste-share-2024`
- Verification: `needs_review`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.no`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Landbruksdirektoratet Table 2 reports agricultural-sector food waste as 1.8 percent of the source-defined production basis.
- Limitations: The percentage inherits the report's mixed sector methods and periods. The aggregate numerator's prose/table discrepancy remains unresolved.

### Norway agricultural-sector food-waste prose total

- ID: `fs:claim:field08.no.food-waste-total-prose-2024`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.no`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Landbruksdirektoratet's results prose states a 2024 agricultural-sector food-waste total of 43,152 tonnes.
- Limitations: This figure conflicts with Table 1, Table 2, the component sum, summary and official landing page. The report combines sector-specific methods and periods.

### Norway agricultural-sector food-waste table total

- ID: `fs:claim:field08.no.food-waste-total-table-2024`
- Verification: `disputed`; aggregation allowed: `false`
- Boundary: `political_direct`; non-additive with: none declared
- Exact facets: `geo.no`, `stage.primary`, `stage.return_flows.loss_waste_generation`, `domain.circularity_resource_efficiency_waste`, `flow.physical.food_waste`, `commodity.mixed_food_basket`, `material.waste`
- Statement: Landbruksdirektoratet Table 1 reports a 2024 agricultural-sector food-waste total of 43,132 tonnes.
- Limitations: This figure conflicts with the 43,152-tonne prose statement. The aggregate combines sector-specific methods, source units and periods.

## Open contradictions

- `contradiction.field08.no-agricultural-total-2024`: The same report gives 43,132 tonnes in its table/summary evidence and 43,152 tonnes in one results-prose passage. Neither value is silently selected. Affected claims only: `fs:claim:field08.no.food-waste-total-table-2024`, `fs:claim:field08.no.food-waste-total-prose-2024`. Aggregation remains blocked.

- `contradiction.field08.ax-export-total-2024`: ÅSUB reports 19,132 tonnes in narrative/Appendix totals, the visible destination rows sum to 19,131 tonnes, and Table 5 reports 19,105 tonnes. The dispute is limited to the all-waste export total. Affected claims only: `fs:claim:field08.ax.export-narrative-2024`, `fs:claim:field08.ax.export-row-sum-2024`, `fs:claim:field08.ax.export-table5-2024`. Aggregation remains blocked.

- `contradiction.field08.is-abstract-stage-scale-2022`: The abstract prints 1.6, 1.93 and 3.86 tonnes while detailed results report 1,596.2, 1,927 and 3,856 tonnes. The likely dropped thousand scale remains an explicit unresolved contradiction. Affected claims only: `fs:claim:field08.is.food-waste-manufacturing-2022`, `fs:claim:field08.is.abstract-manufacturing-2022`, `fs:claim:field08.is.food-waste-retail-2022`, `fs:claim:field08.is.abstract-retail-2022`, `fs:claim:field08.is.food-waste-foodservice-2022`, `fs:claim:field08.is.abstract-foodservice-2022`. Aggregation remains blocked.

- `contradiction.field08.is-household-share-2022`: The abstract reports households at 39 percent while section 3.5 reports 36 percent. Arithmetic from 23,781 and 60,300 is about 39.44 percent but does not authorize an automatic textual correction. Affected claims only: `fs:claim:field08.is.abstract-household-share-2022`, `fs:claim:field08.is.section-household-share-2022`. Aggregation remains blocked.

## Deferred candidates

- `deferred.field08.dk.epa-food-waste-primary-manufacturing-2022` (`geo.dk`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Danish EPA source and reconcile its stage definitions with the acquired Eurostat account.
- `deferred.field08.dk.statbank-kvael2-2022-2023` (`geo.dk`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact StatBank query receipt and denominator metadata before nutrient observations are admitted.
- `deferred.field08.eu.decision-2019-1597` (`geo.dk`, `geo.fi`, `geo.is`, `geo.se`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture and appraise the EU method source before using it to interpret or compare country measurements.
- `deferred.field08.eu.eurostat-fi-boundary` (`geo.fi`; `boundary_unresolved`): The acquired Eurostat FI series is captured but no measurement is admitted because the response does not resolve whether Åland is included for the project's separate Finland and Åland cells. Next action: Obtain authoritative Eurostat or national metadata that explicitly resolves the FI reporting boundary; only then determine whether a mainland-Finland observation can be created.
- `deferred.field08.fi.environment-ministry-national-waste-plan-2027` (`geo.fi`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture and appraise the policy source as targets and plans rather than realized measurements.
- `deferred.field08.fi.luke-nutrient-recycling-potential-2026` (`geo.ax`, `geo.fi`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Luke potential study and distinguish modeled potential from realized nutrient recycling, retaining the Finland–Åland boundary.
- `deferred.field08.fo.irf-annual-report-2025` (`geo.fo`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Faroe Islands annual-report tables and exact waste-category boundaries in a later tranche.
- `deferred.field08.fo.irf-grey-bag-study-2023` (`geo.fo`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture and appraise the grey-bag study, including sample frame and extrapolation method.
- `deferred.field08.fo.viscera-incentive-regulation-2026` (`geo.fo`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the legal provisions and separate incentive design from measured side-stream outcomes.
- `deferred.field08.gl.self-sufficiency-strategy-2025-2030` (`geo.gl`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture and appraise the strategy as policy context, not realized circular-flow evidence.
- `deferred.field08.gl.statistics-programme-waste-gap-2025` (`geo.gl`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Greenland statistical-programme evidence and retain data absence as a documented gap rather than a zero.
- `deferred.field08.gl.waste-regulation-2021` (`geo.gl`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact legal provisions and map obligations separately from measured implementation.
- `deferred.field08.is.environment-agency-gaja-policy-2025` (`geo.is`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture and appraise the Iceland policy source without converting policy intentions into realized outcomes.
- `deferred.field08.is.environment-agency-nitrogen-inputs-2023` (`geo.is`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Iceland nitrogen-input dataset with exact units, denominator and system boundary.
- `deferred.field08.no.ssb-biological-treatment-2024` (`geo.no`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact Statistics Norway table, units, treatment classes and method metadata in a later controlled tranche.
- `deferred.field08.no.ssb-fertilizer-agriculture-2024` (`geo.no`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact Statistics Norway table and denominator metadata before creating nutrient-flow observations.
- `deferred.field08.sapmi.finland-research-ethics-council-2026` (`geo.sapmi`; `rights_holder_route_only`): This is an authority, consent or data-governance route only. It is not Sápmi subject evidence and grants zero substantive coverage credit. Next action: Route through the appropriate Finland Sápmi research-ethics, collective-consent and rights-holder process before any substantive source use.
- `deferred.field08.sapmi.norway-consultation-route-2026` (`geo.sapmi`; `rights_holder_route_only`): This is an authority, consent or data-governance route only. It is not Sápmi subject evidence and grants zero substantive coverage credit. Next action: Route through the appropriate Norway consultation and Sámi rights-holder process before any substantive source use.
- `deferred.field08.sapmi.saami-council-soda-2024` (`geo.sapmi`; `rights_holder_route_only`): This is an authority, consent or data-governance route only. It is not Sápmi subject evidence and grants zero substantive coverage credit. Next action: Obtain rights-holder review of the proposed data-governance route before capture, claim creation or external use.
- `deferred.field08.sapmi.sweden-consultation-route-2026` (`geo.sapmi`; `rights_holder_route_only`): This is an authority, consent or data-governance route only. It is not Sápmi subject evidence and grants zero substantive coverage credit. Next action: Route through the appropriate Sweden consultation and Sámi rights-holder process before any substantive source use.
- `deferred.field08.se.energimyndigheten-biogas-digestate-2024` (`geo.se`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact biogas and digestate tables and keep treatment input, output and realized use distinct.
- `deferred.field08.se.naturvardsverket-food-waste-2024` (`geo.se`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the Swedish food-waste publication and exact stage locators in the next political-Nordic tranche.
- `deferred.field08.se.scb-np-fertilizer-use-2025` (`geo.se`; `outside_gate2c_tranche`): This Gate 2B source candidate was not captured in the bounded five-source Gate 2C tranche and provides no evidence or coverage credit here. Next action: Capture the exact SCB table, units and agricultural denominator before measurement intake.

## Required child dimensions

- `child_requirement.field08.ax.export.destination` for `fs:claim:field08.ax.export-narrative-2024`: `destination` requires `trade_direction.export`, `stage.return_flows.material_recovery`, `stage.return_flows.biological_recovery`, `stage.return_flows.energy_recovery`, `stage.return_flows.disposal`. The all-waste export amount needs material- and facility-level destination evidence before treatment outcomes can be inferred.
- `child_requirement.field08.ax.export.method` for `fs:claim:field08.ax.export-row-sum-2024`: `method` requires `method_requirement.ax_export_internal_total_reconciliation`, `method_requirement.ax_export_food_waste_subset`, `method_requirement.ax_export_destination_treatment`. The 19,132, 19,131 and 19,105 tonne figures must be reconciled, and any food-waste subset and destination treatment must be separately established.
- `child_requirement.field08.ax.food-waste.commodities` for `fs:claim:field08.ax.animal-mixed-food-waste-2024`: `commodity_group` requires `commodity.animal_food`, `commodity.mixed_food_basket`. ÅSUB category 09.1 combines animal and mixed food waste; child quantities must separate those scopes and identify edible versus inedible material where the source permits.
- `child_requirement.field08.ax.r3.destination` for `fs:claim:field08.ax.r3-animal-mixed-treatment-2024`: `destination` requires `stage.return_flows.material_recovery`, `stage.return_flows.nutrient_return`, `stage.return_flows.energy_recovery`, `stage.return_flows.disposal`. The R3+ input amount does not state the mass reaching each downstream recovery, nutrient-return, energy or disposal destination.
- `child_requirement.field08.ax.r3.method` for `fs:claim:field08.ax.r3-animal-mixed-treatment-2024`: `method` requires `method_requirement.ax_r3_input_output_mass_balance`, `method_requirement.ax_recovered_product_destination`, `method_requirement.ax_nutrient_content_and_use`. A treatment input becomes circular evidence only after output mass, destination, nutrient content and realized use are established.
- `child_requirement.field08.ax.r3.outcome` for `fs:claim:field08.ax.r3-does-not-prove-closed-loop-2024`: `outcome` requires `outcome.resource_circularity`. A realized resource-circularity outcome needs recovered-output and use evidence; the operation-class label alone is insufficient.
- `child_requirement.field08.ax.r3.strategy` for `fs:claim:field08.ax.r3-does-not-prove-closed-loop-2024`: `circular_strategy` requires `circular_strategy.r8`, `circular_strategy.r9`. The waste-operation code R3+ must not be confused with the project's R3 Reuse strategy; evidence must resolve whether outputs qualify as recycling, energy recovery or neither.
- `child_requirement.field08.dk.food-waste.commodities` for `fs:claim:field08.dk.eurostat-food-waste-total-2023`: `commodity_group` requires `commodity.plant_food`, `commodity.animal_food`, `commodity.aquatic_food`, `commodity.processed_food`. The mixed-food-basket total must be disaggregated by commodity family before commodity-specific circularity conclusions are possible.
- `child_requirement.field08.dk.food-waste.downstream-stages` for `fs:claim:field08.dk.eurostat-food-waste-total-2023`: `value_chain_stage` requires `stage.return_flows.collection_sorting`, `stage.return_flows.material_recovery`, `stage.return_flows.biological_recovery`, `stage.return_flows.nutrient_return`, `stage.return_flows.energy_recovery`, `stage.return_flows.disposal`. The Eurostat generation account does not describe what happens after waste generation; each destination stage requires separate Danish evidence.
- `child_requirement.field08.dk.food-waste.method` for `fs:claim:field08.dk.eurostat-food-waste-total-2023`: `method` requires `method_requirement.dk_sampling_frame`, `method_requirement.dk_estimation_and_scaling`, `method_requirement.dk_uncertainty_interval`. The API payload supplies values but this intake does not yet carry Denmark's sampling frame, estimation details or quantified uncertainty.
- `child_requirement.field08.fi.ax.nutrient.method` for `fs:claim:field08.fi.luke-national-regional-nonadditive-2024`: `method` requires `method_requirement.fi_ax_area_weighted_numerators_denominators`, `method_requirement.fi_ax_national_regional_method_bridge`, `method_requirement.fi_mainland_boundary_resolution`. Whole-country and Åland per-hectare rates cannot be subtracted; area-weighted numerators, denominators and a method bridge are needed for any mainland-Finland derivation.
- `child_requirement.field08.fi.nutrient.destination` for `fs:indicator:field08.nitrogen-balance-kg-ha`: `destination` requires `stage.return_flows.nutrient_return`, `stage.return_flows.disposal`. An input-minus-harvest balance is not a destination account; actual nutrient return and loss destinations require separate measurements.
- `child_requirement.field08.fi.nutrient.outcome` for `fs:indicator:field08.phosphorus-balance-kg-ha`: `outcome` requires `outcome.resource_circularity`. Neither a balance nor a rounded zero demonstrates realized resource circularity; outcome evidence requires recovered nutrient quantities and use.
- `child_requirement.field08.is.aquaculture.method` for `fs:claim:field08.is.aquaculture-false-zero-2022`: `method` requires `method_requirement.is_aquaculture_nonresponse_followup`, `method_requirement.is_aquaculture_measured_or_estimated_value`. The marked false zero must remain unknown until direct or defensibly estimated aquaculture food-waste evidence is obtained.
- `child_requirement.field08.is.food-waste.commodities` for `fs:claim:field08.is.food-waste-total-2022`: `commodity_group` requires `commodity.plant_food`, `commodity.animal_food`, `commodity.aquatic_food`, `commodity.processed_food`. The national total needs complete commodity children, including currently missing or false-zero sectors, before commodity completeness can be assessed.
- `child_requirement.field08.is.food-waste.destination` for `fs:claim:field08.is.food-waste-total-2022`: `destination` requires `stage.return_flows.collection_sorting`, `stage.return_flows.material_recovery`, `stage.return_flows.biological_recovery`, `stage.return_flows.nutrient_return`, `stage.return_flows.energy_recovery`, `stage.return_flows.disposal`. The generation estimate does not establish treatment destinations, cascading use or final disposal.
- `child_requirement.field08.is.food-waste.method` for `fs:claim:field08.is.food-waste-total-2022`: `method` requires `method_requirement.is_stage_sampling_frames`, `method_requirement.is_nonresponse_and_substitution`, `method_requirement.is_household_national_extrapolation`, `method_requirement.is_uncertainty_interval`. Stage-specific survey frames, nonresponse, substitutions, Reykjavík-to-national extrapolation and uncertainty must be appraised before comparative use.
- `child_requirement.field08.is.food-waste.outcome` for `fs:claim:field08.is.food-waste-total-2022`: `outcome` requires `outcome.resource_circularity`. Food-waste generation is not itself a circularity outcome; realized avoided loss, recovery and resource return need separate evidence.
- `child_requirement.field08.no.food-waste.commodities` for `fs:claim:field08.no.food-waste-total-table-2024`: `commodity_group` requires `commodity.plant_food.cereals`, `commodity.animal_food.milk_dairy`, `commodity.animal_food.beef_veal`, `commodity.animal_food.pork`, `commodity.animal_food.sheep_goat`, `commodity.animal_food.poultry`, `commodity.animal_food.eggs`. Commodity children require source-faithful units and periods; they must not be inferred as homogeneous calendar-year tonne observations from the aggregate table.
- `child_requirement.field08.no.food-waste.method` for `fs:claim:field08.no.food-waste-mixed-method-2024`: `method` requires `method_requirement.no_unit_conversion_provenance`, `method_requirement.no_reference_period_harmonization`, `method_requirement.no_aggregate_reconciliation`. The mixed litres/tonnes inputs, grain-season timing and 20-tonne contradiction require explicit reconciliation before component reuse.

## Interpretation boundary

Git-tracked capture and project-authored inspection-note integrity is pinned in the generation manifest. Local-external capture hashes are verified during initial generation and during full replay; ordinary metadata-only checks may proceed when those bytes are absent. The notes contain bounded facts and locator metadata only and do not grant source-redistribution rights. Method appraisal, boundary acceptance, contradiction resolution and external citation use require later named human receipts. No generated artifact is a coverage assessment event.
