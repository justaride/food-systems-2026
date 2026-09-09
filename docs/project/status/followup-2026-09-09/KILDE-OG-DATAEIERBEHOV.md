# Kilde- og dataeierbehov etter de 20 researchreturene

9. september 2026. Internt og usendt. Ingen mottaker er valgt, ingen kontakt er sendt, og ingen eier er tildelt ansvar.

Dette er en sporbar uttrekking fra returene i siste rettelsesinntak 002, inkludert rettede avhengigheter og B19s frakobling fra FS-03. Masterkontrollens faglige vurderinger må leses i tillegg. Fem pakker meldte ferdig innenfor oppdraget, elleve ventet på dataeier og fire på konkrete kilder. Dette er ikke en faglig ferdigprosent.

## Første avklaringer

1. Furuset: dagens produksjon, faktisk Q1-behov og mottak/silo etter ombygging. Uten dette kan melcaset ikke tallfestes.
2. Cerealia Norge/Sverige: datert bulkspesifikasjon for nøyaktig 160105/160585, med metoder, fuktbasis og akseptgrenser.
3. Deretter: batch/lager/allokering, foredling og energi/vann/transport/lossetid innen samme 72-timersscenario.
4. Statistikksaker B07–B09 og mattilgang B13 gjenåpnes bare med den presise manglende filen/versjonen.

## Felles returkrav

Be om dokument-ID, revisjon, gyldighetsdato, dataeierrolle, enhet og målemetode. Skill faktisk observert drift fra plan og katalog. Oppgi intern bruksrett og eventuelle begrensninger. Ukjent verdi beholdes som ukjent. Ny informasjon får ny kildehash, kandidatversjon og kontroll; den endrer ingen historisk godkjenning automatisk.

## B01 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B01/B01-20260909T101901Z-dcaf4365/handoff.json)

### R6-G02

Gjeldende bulkspesifikasjon 160105

**Mulig dataeierrolle:** Cerealia Norge produkt-/laboratorieansvarlig

**Neste dokument/handling:** Datert revisjon, gyldighetsperiode og SKU-spesifikke bakeparametre med min/maks, metoder og fuktbasis; pluss allergen/krysskontakt/mattrygghet og bulkholdbarhet/lagring.

**Felter som mangler:** R6-G02-01 spec_revision; R6-G02-02 valid_from_to; R6-G02-03 protein_limits (g/100g + moisture/dry basis; not nutrition label); R6-G02-04 moisture_limits; R6-G02-05 falling_number_limits; R6-G02-06 gluten_test_limits (method/unit/min/max); R6-G02-07 ash_limits; R6-G02-08 particle_size_limits; R6-G02-09 test_methods_and_nitrogen_factor; R6-G02-10 allergen_and_food_safety_spec document ID; R6-G02-11 bulk_storage_and_shelf_life

**Presist stopp:** B01 stop rule: round-006 already read live page and catalog; inspected R6-S01/R6-S09 channels and their frozen link inventory show no new named current specification; nutrition protein not used as limit; catalog search not repeated

## B02 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B02/B02-20260909T101901Z-4aaad87a/handoff.json)

### R6-G03

Gjeldende bulkspesifikasjon 160585

**Mulig dataeierrolle:** Cerealia Sverige produkt-/laboratorieansvarlig

**Neste dokument/handling:** Authorized owner intake of dated bulk specification/COA for SKU 160585 only; do not send from this package

**Felter som mangler:** R6-G03-01 spec_revision; R6-G03-02 valid_from_to; R6-G03-03 protein_limits (g/100g + basis); R6-G03-04 moisture_limits (masse%); R6-G03-05 falling_number_limits (s); R6-G03-06 gluten_test_limits (method/unit/min/max); R6-G03-07 ash_limits (% + basis); R6-G03-08 particle_size_limits (µm / masse%); R6-G03-09 test_methods_and_nitrogen_factor; R6-G03-10 allergen_and_food_safety_spec; R6-G03-11 bulk_storage_and_shelf_life (°C / RH% / days) including whether catalog 12 months applies to bulk

**Presist stopp:** B02 stop rule: missing bulk specification is a data-owner stop after R6-S02/R6-S10 and documented product-link channels were examined without a dated full bulk specification

### B02-20260909T101901Z-4aaad87a-G01

Datert revisjon og gyldighetsperiode for operativ bulkspesifikasjon 160585

**Mulig dataeierrolle:** Cerealia Sverige produkt-/laboratorieansvarlig

**Neste dokument/handling:** Obtain dated revision identity for bulk 160585

**Felter som mangler:** spec_revision; valid_from_to; documentId; sourceFileSha256

**Presist stopp:** Public channels undated; intake unsent

### B02-20260909T101901Z-4aaad87a-G02

Målemetoder og fuktbasis for 160585 sammenlignbare med Q1 og Regal 160105

**Mulig dataeierrolle:** Cerealia Sverige produkt-/laboratorieansvarlig (methods); Furuset fag-/kvalitetsansvarlig for Q1 limits (B03)

**Neste dokument/handling:** Coordinate with B03 on Q1 method profile after SE owner methods exist; no equivalence from nutrition

**Felter som mangler:** test_methods_and_nitrogen_factor; moisture_limits; protein_limits with basis; matched Q1 acceptance methods

**Presist stopp:** Methods/moisture basis absent in SE public sources

### B02-20260909T101901Z-4aaad87a-G03

Om katalogens 12 måneders holdbarhet gjelder bulk 160585 og under hvilke lagringsvilkår

**Mulig dataeierrolle:** Cerealia Sverige produkt-/laboratorieansvarlig

**Neste dokument/handling:** Owner confirmation whether 12 months applies to bulk and required storage conditions

**Felter som mangler:** bulk_storage_and_shelf_life °C/RH%/days; explicit bulk-vs-bag applicability

**Presist stopp:** Catalog row shared with bag SKU; no bulk storage clause

## B03 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B03/B03-20260909T101901Z-1e1d2425/handoff.json)

### A1-G006

Bakeri-/matprodusentvolum, melbeholdning, lagerdager, kundetildeling, distribusjonsruter, transportledetid og alternative leverandører

**Mulig dataeierrolle:** Furuset produksjon/planlegging/lager; eventuelle grossist-/mølleledd utenfor B03 scope

**Neste dokument/handling:** Use unsent R6 intake G01/G07 fields in an authorized owner request; do not invent volumes

**Felter som mangler:** producer_volume; flour_stock_days; customer_allocation; distribution_routes; transport_lead_time; alternative_suppliers

**Presist stopp:** No operational volume/stock/route documents in authorized B03 channels

### R5-G01

Q1-nettobehov per batch og del-frist

**Mulig dataeierrolle:** Bakeriets produksjon/innkjøp (Furuset)

**Neste dokument/handling:** Owner completes intake fields R6-G07-01..03 and R6-G01-*; freeze order book at t0 per MAALEPROTOKOLL

**Felter som mangler:** q1_kg_per_batch; batch_count_and_start; partial_deadlines_0_24_24_48_48_72

**Presist stopp:** Public sources and unsent intake provide no batch need quantities

### R5-G02

Fysisk og disponibelt Q1-lager

**Mulig dataeierrolle:** Bakeriets lagerdrift (Furuset)

**Neste dokument/handling:** Owner silo weigh/count + quarantine/reservation split after as-built silo IDs known

**Felter som mangler:** physical_stock_t; moisture_pct; quarantine_t; reservations_t; timestamp

**Presist stopp:** Historical/proposed silo narrative is not a stock observation; missing data is unknown not zero

### R5-G05

Samme Q1-spesifikasjon; batchanalyser og prøvebakst

**Mulig dataeierrolle:** Furuset fag-/kvalitetsansvarlig; møllelaboratorier (B01/B02 coordination)

**Neste dokument/handling:** Owner signs exact Q1 revision; coordinate mill specs with B01/B02 without closing those packages here

**Felter som mangler:** recipient_accepted_spec_revision; acceptance_limits; matched_bake_protocol; batch_COA

**Presist stopp:** No recipient acceptance limits or bake results in B03 channels; KI must not invent thresholds

### R5-G09

Akseptert Q1-mengde, tidspunkt, faktisk anvendt mel og matutfall

**Mulig dataeierrolle:** Furuset mottak og produksjon

**Neste dokument/handling:** Requires unique weigh/accept tickets linked to batches — none exist in this run

**Felter som mangler:** accepted_net_t; acceptance_timestamp; flour_used_in_approved_bake_t; waste_kg

**Presist stopp:** No reception-and-use observations; bulk design is analytic, reception capacity unverified

### R6-G01

Gjeldende produksjonsfunksjon etter ombygging

**Mulig dataeierrolle:** Furuset produksjons-/prosjektansvarlig

**Neste dokument/handling:** Dated line/product overview distinguishing on-site baking vs assembly of purchased baked goods; keep case at Furuset

**Felter som mangler:** production_line_id; products_made_on_site; flour_needed_on_site; relocated_work_effective_date; current_site_document_revision

**Presist stopp:** Application + marketing page insufficient; Økern relocation must not redefine B03 case

### R6-G04

Mottakerens Q1 og funksjonell kvalifisering

**Mulig dataeierrolle:** Furuset fag-/kvalitetsansvarlig

**Neste dokument/handling:** Mottakerakseptert resept/spesifikasjon via intake G04; no KI-proposed numeric limits

**Felter som mangler:** recipe_and_q1_revision; recipient_acceptance_limits; matched_baking_protocol; qualification_document

**Presist stopp:** No recipient Q1 qualification document located

### R6-G05

Faktisk silo- og mottaksanlegg etter flytting

**Mulig dataeierrolle:** Furuset teknisk ansvarlig

**Neste dokument/handling:** Require as-built flow sheet after documented silo move; do not use former east facade as current state

**Felter som mangler:** as_built_drawing_revision; silo_id_location_and_product; usable_silo_volume_m3; receiving_point_id; max_and_available_space_t

**Presist stopp:** PBE public channel exhausted without concrete new reception attachment; owner as-built still missing

### R6-G07

Behov og anvendbart mottakerlager

**Mulig dataeierrolle:** Furuset planlegging/lager

**Neste dokument/handling:** Complete intake G07 after G01/G05 known; align partial deadlines with MAALEPROTOKOLL

**Felter som mangler:** q1_per_batch_kg; opening_qualified_stock; quarantine_reservations; closing_buffer_reason

**Presist stopp:** Need and usable stock cannot be computed without owner documents

### B03-B03-20260909T101901Z-1e1d2425-G01

Public PBE attachment that is explicitly as-built silo/innblåsingspunkt/usable bulk reception after Mat i Farta relocation

**Mulig dataeierrolle:** Furuset teknisk ansvarlig; eventuelt ansvarlig søker for som-bygget tegninger

**Neste dokument/handling:** Obtain owner as-built flow sheet / silo map via authorized intake; do not treat application or applicant completion as as-built

**Felter som mangler:** as_built_drawing_revision; silo_id_location_product; receiving_point_id; usable_volume_m3; max_and_available_tonnes

**Presist stopp:** Authorized PBE public titles re-checked; no new attachment title hits today's bulk reception; login drawings unread

### B03-B03-20260909T101901Z-1e1d2425-G02

Municipal ferdigattest decision (distinct from applicant søknad/følgebrev) for Søren Bulls vei 27 Mat i Farta works

**Mulig dataeierrolle:** Plan- og bygningsetaten (public decision when issued); Kraft Arkitektur AS / Bakehuset AS for filing status

**Neste dokument/handling:** If/when a municipal ferdigattest appears in public innsyn, bind raw+text hashes; still separately require as-built silo evidence

**Felter som mangler:** municipal_ferdigattest_document_id_date

**Presist stopp:** Index shows søknad om ferdigattest; case still under treatment; applicant letter is not the municipal certificate

## B04 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B04/B04-20260909-correction-001/handoff.json)

### A1-G001

Fysisk mathvetebeholdning per 08.09.2026 fordelt på lokasjon, kvalitet, operatør, statlig eierstatus og rullering

**Mulig dataeierrolle:** Landbruksdirektoratet som forvalter / kontraktsoperatører

**Neste dokument/handling:** Authorize owner intake for dated physical register; do not send from this package; do not convert contracts to stock

**Felter som mangler:** tonn_net_at_t0; location; quality_class; operator; state_ownership_flag; rotation_age; moisture_basis

**Presist stopp:** Public/frozen channels lack Sept-2026 stock file; only end-2025 aggregate verified

### A1-G002

Møllevis råvareinntak per time, produktkapasitet per time, faktisk årsproduksjon, normal/ledig kapasitet og vare-/kvalitetsklasse

**Mulig dataeierrolle:** Matmelmøllenes driftsansvarlige (Bjølsen/Norgesmøllene m.fl.)

**Neste dokument/handling:** Node sheet via authorized intake; stop rule: normal production ≠ crisis capacity

**Felter som mangler:** grain_t_per_h; approved_flour_t_per_h; actual_annual_t; normal_vs_idle; product_quality_class; scenario_run_hours

**Presist stopp:** Only advertorial/partial operator figures; no comparable mill-hour primary table

### A1-G003

Aktuell kapasitet og status for lagring, mottak, tørking og kai/transport, inklusive funksjonell ledig kapasitet

**Mulig dataeierrolle:** Landbruksdirektoratet/ekspertgruppen og kornoperatørene

**Neste dokument/handling:** Await expert-group report (due 15 Mar 2027) or interim standardized register; no hand-edit of 2023 estimate

**Felter som mangler:** storage_t_functional_free; intake_t_h; drying_t_h; quay_transport_status; measurement_date; definition_match_2023

**Presist stopp:** Expert group started; final report not delivered; 2023 estimate historical

### A1-G004

Faktisk ledetid fra uttaksbeslutning til mottaksmølle, oppstartstid, første mel-leveranse, emballasjekapasitet og transportkapasitet

**Mulig dataeierrolle:** Landbruksdirektoratet og kontraktsoperatørene

**Neste dokument/handling:** Timed exercise logs or contract response SLAs via authorized intake

**Felter som mangler:** decision_to_mill_hours; startup_hours; first_flour_delivery_time; packaging_capacity; transport_capacity_t

**Presist stopp:** 2023 design only; no demonstrated offtake timeline found

### A1-G005

Reservekraft, drivstoff, nett/telekom, vann/fukt, bemanning og pakkeriberedskap per mølle

**Mulig dataeierrolle:** Mølle-/pakkerioperatørene

**Neste dokument/handling:** Node dependency/reserve sheet under scenario; R6-G09 fields

**Felter som mangler:** critical_kW; backup_kW_tested; fuel_liters; water_m3_h; staffing_plan; packaging_contingency

**Presist stopp:** No dimensioned reserve evidence in public channels

### A1-G007

Operativ kobling mellom statens lagrede mathvete og navngitte mottaksmøller/bakerier ved uttak

**Mulig dataeierrolle:** Landbruksdirektoratet/LMD og kontraktsoperatører

**Neste dokument/handling:** Publicizable allocation logic + scenario example; coordinate with B03 recipient need without mutual wait

**Felter som mangler:** release_instrument; named_receiving_mill; named_downstream_bakery; allocation_id; non_overlap_book

**Presist stopp:** Design exists; no binding allocation to Furuset or other named bakery

### A1-G009

Oppdatert 2026 node- og kapasitetsestimat med samme definisjon som 2023-rapporten

**Mulig dataeierrolle:** Landbruksdirektoratets ekspertgruppe/forvaltning

**Neste dokument/handling:** Use final report when delivered (mandate: 15 Mar 2027) or authorized interim register

**Felter som mangler:** 2026_estimate_same_definition; measurement_date; node_table; definition_bridge_to_2023

**Presist stopp:** No 2026 estimate delivered; expert group in progress

### A1-G010

Melutbytte per mathvetekvalitet og produkt, med massebalanse for kli/tap

**Mulig dataeierrolle:** Matmelmøllene / kvalitetsforvaltning

**Neste dokument/handling:** Quality-specific yield matrix for reserved grain and Q1 product; no catalog 78% as crisis yield

**Felter som mangler:** extraction_fraction_by_quality; bran_kg; loss_kg; moisture_basis; product_SKU

**Presist stopp:** No mass-balance yield for beredskapskorn→Q1 measured in this run

### R5-G03

Godkjent parti, eierskap, uttaksrett og allokering

**Mulig dataeierrolle:** Begge møllers lageransvarlige og relevant lagerforvalter

**Neste dokument/handling:** Fill R6-G08 via authorized intake; unknown right ≠ available

**Felter som mangler:** batch_id; COA; ownership_release_right; competing_allocations; release_time; location_t_moisture

**Presist stopp:** Unsent intake; advertorial stock not qualified release evidence

### R5-G06

Disponibel maling, faktisk utbytte og omstilling i scenario

**Mulig dataeierrolle:** Møllenes driftsansvarlige

**Neste dokument/handling:** Line logs under scenario state for correct lot/line/moisture; stop rule excludes normal production as available capacity

**Felter som mangler:** grain_t_h_scenario; approved_flour_t_h; run_hours; changeover; yield_mass_balance

**Presist stopp:** No scenario milling measurement; production measurements outside B04 mandate

### B04-B04-20260909T102531Z-f14ff7f2-G01

Interface: Furuset Q1 need/stock/reception (B03) required before any mill allocation can be bound to one recipient and partial deadline

**Mulig dataeierrolle:** Furuset owner (B03 intake) + mill allocation owner (B04/R6-G08)

**Neste dokument/handling:** Coordinate after B03 owner docs exist; do not wait mutually in this run; do not invent need

**Felter som mangler:** recipient_net_need_t; recipient_usable_stock_t; reception_capacity; shared_order_book_id

**Presist stopp:** B03 terminal waiting_owner; B04 cannot close recipient binding without those fields

### B04-B04-20260909T102531Z-f14ff7f2-G02

Interface: Q1 product acceptance limits/methods (B01 Regal / B03 Furuset) needed before milling output can be classified as case-usable Q1

**Mulig dataeierrolle:** B01/B03 quality owners; mill lab for COA

**Neste dokument/handling:** Record interface only; no equivalence inference from catalog protein

**Felter som mangler:** Q1_acceptance_limits; matched_methods; moisture_basis

**Presist stopp:** B01 delivery incomplete at B04 start; B03 waiting_owner — explicit interface gap

### B04-B04-20260909T102531Z-f14ff7f2-G03

No public Sept-2026 physical stock register after re-check of Ldir/expert-group channels; private operator ledgers not opened

**Mulig dataeierrolle:** Landbruksdirektoratet / operators

**Neste dokument/handling:** Owner release of dated register under authorized intake

**Felter som mangler:** dated_register_file; sha256; access_authorization

**Presist stopp:** Channel exhaustion under stop rule

## B05 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B05/B05-20260909T102531Z-5341273b/handoff.json)

### R5-G04

Andre kundeordrer, egne lands prioriteringer og beholdningsbindinger

**Mulig dataeierrolle:** Møllenes planlegging og nasjonal markeds-/beredskapsforvaltning (Malmö/Cerealia Sverige planlegging; relevant svensk forvalter)

**Neste dokument/handling:** Authorized owner intake of reconciled Malmö order/allocation book at case t0; do not send from this package

**Felter som mangler:** binding customer orders (t per deadline; non-overlapping allocation IDs); Swedish domestic priority / security-stock bindings affecting Malmö; export or other-country commitments at same t0; reconciled allocation book for Malmö mill

**Presist stopp:** B05 stop rule: no inference from corporate affiliation or national harvest/beredskapslager to Furuset allocation; public channels lack competing-need tonnages

### R6-G08

Frigitte partier og rett til uttak

**Mulig dataeierrolle:** Møllenes lager-, allokerings- og kvalitetsansvarlige (Cerealia Sverige Malmö)

**Neste dokument/handling:** Authorized intake of dated Malmö warehouse/COA/allocation documents for Q1-candidate batches only; no contact from B05

**Felter som mangler:** R6-G08-01 grain_and_flour_batch_id; R6-G08-02 certificate_of_analysis; R6-G08-03 qualified_stock_by_location; R6-G08-04 ownership_release_right; R6-G08-05 competing_allocations; R6-G08-06 release_and_allocation_time; R6-G08-07 grain_flour_mass_balance

**Presist stopp:** Public operator/catalog/certificate channels exhausted without released-batch documentation; G08 intake unsent

### B05-20260909T102531Z-5341273b-G01

Kvalitetsbundne Malmö korn-/melpartier med eierskap, lagersted og frigivelsesvilkår for Furuset-caset

**Mulig dataeierrolle:** Cerealia Sverige Malmö lager-/kvalitetsansvarlig

**Neste dokument/handling:** Obtain dated batch COA + ownership/release instrument for any candidate allocation

**Felter som mangler:** batch_id; COA; net_t; moisture_basis; ownership_doc; release_conditions; storage_location

**Presist stopp:** Only SKU/location marketing evidence; no batch documents

### B05-20260909T102531Z-5341273b-G02

Hva som binder Malmö-kapasitet til svenske kunder eller andre land ved samme sjokk (t0)

**Mulig dataeierrolle:** Cerealia Sverige planlegging; relevant svensk beredskaps-/markedsforvalter

**Neste dokument/handling:** Reconciled order book frozen at scenario t0

**Felter som mangler:** competing_order_t; priority_class; export_commitment_t; non_overlapping_allocation_id

**Presist stopp:** National beredskapslager/market pages are not recipient-bound Malmö bindings

### B05-20260909T102531Z-5341273b-G03

Faktisk foredling/lasting og earliest dokumentert parti-tidslinje Malmö→Furuset

**Mulig dataeierrolle:** Cerealia Sverige Malmö drift/lager (timeline); coordinate transport interface with B06 when authorized

**Neste dokument/handling:** Owner-documented batch timeline under scenario constraints; coordinate with B06/B17 via coordinator

**Felter som mangler:** release_time; milling_start_end; loading_time; earliest_departable_batch_timeline

**Presist stopp:** No public milling/loading timestamps; cannot invent from facility capacity text

## B06 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B06/B06-20260909T102531Z-22c1a4ab/handoff.json)

### A5-G004

Matspesifikk mottaks-, lager-, terminal-, mølle- og transportkapasitet samt ledetid

**Mulig dataeierrolle:** nordiske transport-/matberedskapsaktører; for C1: transportør + mølle + Furuset teknisk

**Neste dokument/handling:** Do not treat ordinary Svinesund hours as lead time; authorize owner matrix to named nodes

**Felter som mangler:** food_specific_reserved_transport_t; terminal_throughput_t_h; node_lead_time_h_under_R5-SC01; priority_rule_id

**Presist stopp:** Open-web/A5 and official border page lack food-specific reserved capacity and crisis lead time

### CLIM-G02

Anleggsspesifikt vann/kraft/drivstoff/tørking og faktisk mattransportkapasitet under samme sjokk

**Mulig dataeierrolle:** Drift ved begge møller og Furuset; transportør

**Neste dokument/handling:** Collect node/route IDs with shared dependencyId and delivery diary — not climate proxies

**Felter som mangler:** facility_critical_kW; facility_water_m3_h; facility_fuel_L; drying_energy_under_shock; food_transport_capacity_under_same_shock

**Presist stopp:** Climate sources stop at hydrological/yield exposure

### R5-G07

Kritiske laster, drivstoff og egnet vann under bortfall

**Mulig dataeierrolle:** Drift ved begge møller og mottaker (Furuset)

**Neste dokument/handling:** Authorize R6-G09-01..03 with dated load-test; do not infer from ventilasjonsaggregat names

**Felter som mangler:** critical_load_kW; energy_kWh; reserve_start_current; fuel_L; fuel_L_per_h; water_m3_h; water_reserve_m3; water_quality; telecom_dependency; staffing_on_backup

**Presist stopp:** No load-test in authorized channels

### R5-G08

Matvareegnet tankbil, sjåfør, rute, drivstoff og grensebehandling

**Mulig dataeierrolle:** Transportør, mølle og mottak; grenseaktør ved behov

**Neste dokument/handling:** Require transport order + hygiene release + measured event times under R5-SC01

**Felter som mangler:** tank_vehicle_id; payload_t; food_grade_wash_release; driver_availability; heavy_vehicle_route_id; fuel_for_trip_L; border_processing_event_times; shared_resource_conflicts

**Presist stopp:** Ordinary customs hours and brochure narrative do not demonstrate scenario transport

### R6-G06

Kobling og pneumatisk lossing

**Mulig dataeierrolle:** Furuset teknisk ansvarlig sammen med transportør

**Neste dokument/handling:** Complete unsent intake R6-G06 against as-built receiving point once B03/R6-G05 identifies it

**Felter som mangler:** coupling_type_and_diameter_mm; max_unloading_pressure_bar_g; air_flow_Nm3_h_and_quality; hose_length_m_and_drawing_id; filter_venting_interlocks; unloading_rate_t_h; vehicle_access_and_payload; cleaning_previous_loads_release; receiving_hours_and_duration

**Presist stopp:** No public coupling sheet; receiving point unknown per B03

### R6-G09

Drift under energi-/vann-/transportbortfall

**Mulig dataeierrolle:** Drift ved begge møller og Furuset

**Neste dokument/handling:** Collect R6-G09 under frozen shared resource list; building permits are not load tests

**Felter som mangler:** critical_load_and_backup; water_need_and_reserve; fuel_start_stock_and_consumption; loading_transport_unloading_times; net_accepted_flour_by_deadline; flour_used_in_accepted_baking; shared_resource_conflicts

**Presist stopp:** Scenario designed; no observed outage-operation outcomes

### B06-B06-20260909T102531Z-22c1a4ab-G01

Dated per-node critical-load test and suitable water/fuel start stock covering milling, control, loading/unloading and hygiene under R5-SC01 (not ventilation unit names)

**Mulig dataeierrolle:** Drift Bjølsen; Drift Malmö; Drift Furuset

**Neste dokument/handling:** Authorized owner measurement per MAALEPROTOKOLL R5-G07 / intake R6-G09-01..03

**Felter som mangler:** node_id; test_date; critical_kW; start_current; fuel_L_start; fuel_L_per_h; water_m3_h; water_quality_spec; telecom_dependency; staffing

**Presist stopp:** Public/PBE/climate channels exhausted for measured reserve function

### B06-B06-20260909T102531Z-22c1a4ab-G02

Food-grade tank + Furuset as-built coupling/pneumatic unload interface sheet (type/mm, bar(g), air, hose, filters, hygiene release) for the post-move receiving point

**Mulig dataeierrolle:** Furuset teknisk + transportør

**Neste dokument/handling:** Wait for B03/R6-G05 receiving-point identity; then fill R6-G06 — no email in this run

**Felter som mangler:** receiving_point_id; coupling_type_mm; max_pressure_bar_g; air_Nm3_h; hose_m; hygiene_release_id

**Presist stopp:** Interface blocked while receiving point unknown; no public coupling sheet

### B06-B06-20260909T102531Z-22c1a4ab-G03

Measured loading / driving / border-processing / unloading event times and shared-resource bookings under R5-SC01 (distinct from ordinary Svinesund opening hours)

**Mulig dataeierrolle:** Transportør, mølle, mottak; grenseaktør ved behov

**Neste dokument/handling:** Collect event log in authorized trial; do not substitute toll opening hours

**Felter som mangler:** load_start_end; departure; border_arrival_release; unload_start_end; shared_resource_id_intervals

**Presist stopp:** Stop rule forbids treating general customs hours as crisis lead time

## B07 — waiting_source

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B07/B07-20260909T102902Z-2f712e23/handoff.json)

### R4-G001

Explain FI2018 Eurostat-Luke production residuals6.90/17.09kt with exact version,classification and moisture mapping

**Mulig dataeierrolle:** Luke crop statistics transmission/method owner and/or FI Eurostat crop statistics correspondent

**Neste dokument/handling:** Dated 2018 Luke↔Eurostat cereal transfer/revision annex with version IDs, per-crop standard moisture, and tonne-level classification bridge for wheat/barley residuals

**Felter som mangler:** B07-TP-01 dated_2018_Luke_to_Eurostat_transfer_or_revision_log; B07-TP-02 national_standard_moisture_pct_wheat_2018; B07-TP-03 national_standard_moisture_pct_barley_2018; B07-TP-04 eurostat_humidity_basis_for_FI_2018_cells; B07-TP-05 quantitative_bridge_dry_fresh_to_C1100_C1300_G9100

**Presist stopp:** B07 stop rule: without concrete new bridge/version deliver waiting_source; one common moisture factor already insufficient in executed control; channels R5-S08/R5-S09/DKFI-S006/DKFI-S008 reused without new named transfer file

### DKFI-G001

Exact Finnish national standard moisture percentage for2018 wheat/barley

**Mulig dataeierrolle:** Luke crop statistics method owner

**Neste dokument/handling:** Official Finnish standard moisture % for 2018 wheat and barley (national publication and Eurostat delivery bases)

**Felter som mangler:** B07-TP-02 national_standard_moisture_pct_wheat_2018; B07-TP-03 national_standard_moisture_pct_barley_2018

**Presist stopp:** Prior official quality report + Eurostat metadata already examined (DKFI-G001); common-factor control rejects one shared moisture-only explanation; no new named moisture annex in B07 channels

### DKFI-G003

Finsk2018 produksjonsavvik mot Eurostat:+6.90kt hvete,+17.09kt bygg

**Mulig dataeierrolle:** Luke / FI Eurostat correspondent

**Neste dokument/handling:** 2018 quantity/revision bridge allocating residuals to moisture and/or C1100/C1300/G9100 classification without forced series overwrite

**Felter som mangler:** B07-TP-01 dated transfer/revision log; B07-TP-05 quantitative dry/fresh to C1100/C1300/G9100 bridge with tonne allocation

**Presist stopp:** Primary sources show national classification deviation for green/immature cereals but no 2018 quantity/revision bridge; dual series preserved

### B07-B07-20260909T102902Z-2f712e23-G01

Named public or owner-held Luke↔Eurostat 2018 transfer/revision file identity (filename, date, version) for wheat/barley

**Mulig dataeierrolle:** Luke / FI Eurostat correspondent

**Neste dokument/handling:** Named dated transfer/revision annex

**Felter som mangler:** document_filename; document_date; version_ids; sha256_of_bytes_when_obtained

**Presist stopp:** Round-005 private FI inventory contains release+method pages only; no transfer filename

## B08 — waiting_source

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B08/B08-20260909-correction-001/handoff.json)

### R4-G002

Resolve eight reported yield versus P/A consistency warnings and missing DKwheat2015 yield

**Mulig dataeierrolle:** SSB cereal statistics + Eurostat crop production metadata; SCB/Jordbruksverket; DST/Eurostat

**Neste dokument/handling:** Obtain named transmission/revision annexes listed in new subgaps; do not overwrite reported YLD with P/A; FI rows coordinate with B07

**Felter som mangler:** NO_dated_Eurostat_transmission_version_and_reported_yield_rule; Eurostat_SE_C1100_2015_reported_YLD_aggregation_rule; DK_Eurostat_C1100_2015_missing_YLD_explanation; FI_yield_warnings_2016_2020_owned_boundary_with_B07

**Presist stopp:** Named public annexes searched; SE component areas found; NO ESQRS absent; DK missing YLD unexplained; stop rule blocks imputation and broad re-search

### R4-G003

Verify historical crop and area bridges including NO C1110/C1100, DK cultivation and FI2016 break

**Mulig dataeierrolle:** National statistical institutes + Eurostat

**Neste dokument/handling:** Keep historical labels; await year-specific bridges; no retroactive 2025 SAIO definitions

**Felter som mangler:** NO_C1110_vs_C1100_transmission_mapping; DK_2015_cultivated_vs_Eurostat_AR_bridge; FI2016_area_method_break_owned_with_B07

**Presist stopp:** Definitions juxtaposed; no full historical equivalence proven

### METH-G03

Common moisture/crop/area definitions and status flags for NO/DK/FI versus SCB and Eurostat

**Mulig dataeierrolle:** Eurostat crop production method + national ESQRS owners

**Neste dokument/handling:** Parent Eurostat humidity/area status documentation that binds NO/DK/FI/SE without guessed factors

**Felter som mangler:** common_EU_standard_humidity_flag; common_area_denominator_flag; common_crop_coverage_flag

**Presist stopp:** SCB 14% verified previously; NO/DK 15% notes read; no common flag set; no correction factor applied

### R4-NO-G001

Exact Eurostat alignment of crop year, delivered-for-sale versus gross production, and field/harvested area

**Mulig dataeierrolle:** SSB Seksjon for eiendoms-, areal- og primærnæringsstatistikk / Eurostat

**Neste dokument/handling:** Unsent document request for dated transmission version covering C1110/C1300 2015–2017 reported YLD calculation

**Felter som mangler:** dated_NO_Eurostat_transmission_mapping; area_denominator_equality_proof; own_use_adjustment_if_any

**Presist stopp:** Public NO ESQRS missing; SSB method confirms sale deliveries only; no equality to Eurostat gross production established

### R4-NO-G004

Meaning of refperiod31.07/Stock metadata for annual production and own-use volume

**Mulig dataeierrolle:** SSB table 04610 metadata steward

**Neste dokument/handling:** Keep annual year label; do not derive dated inventory or gross production from Stock/refperiod alone

**Felter som mangler:** authoritative_interpretation_of_refperiod_31_07_Stock; own_use_volume

**Presist stopp:** API metadata still shows refperiod 31.07 and measuringType Stock on yield cells; no clarifying annex in this run

### DKFI-G002

HST77 cultivated vs harvested area handling in2018 and crop-code bridge for spelt/durum

**Mulig dataeierrolle:** DST crop statistics / Eurostat DK ESQRS

**Neste dokument/handling:** Keep original HST77 labels; seek named crop-code and area-denominator annex; do not infer equivalence from similar totals

**Felter som mangler:** 2018_cultivated_vs_harvested_quantitative_bridge; spelt_durum_to_C1100_code_bridge

**Presist stopp:** DST definitions read; no spelt/durum bridge; 2018 quality PDF not reused as silent 2015 fix

### B08-B08-20260909T102902Z-7e1f9a59-G01

Dated Norwegian Eurostat crop-production transmission package / ESQRS equivalent covering reported YLD for C1110/C1300 2015–2017

**Mulig dataeierrolle:** SSB / Eurostat

**Neste dokument/handling:** Unsent request for named annex; do not repeat broad web search

**Felter som mangler:** transmission_version_id; transmission_date; yield_calculation_rule; crop_year_definition

**Presist stopp:** Public ESQRS for NO absent (404); required for Q1

### B08-B08-20260909T102902Z-7e1f9a59-G02

Eurostat rule that publishes SE C1100 2015 reported YLD 7.22 given component areas now known

**Mulig dataeierrolle:** Eurostat apro_cp / SCB

**Neste dokument/handling:** Keep 7.22 and P/A distinct until rule documented

**Felter som mangler:** reported_YLD_rounding_or_aggregation_rule

**Presist stopp:** Component areas found; reported-vs-P/A residual remains

### B08-B08-20260909T102902Z-7e1f9a59-G03

Eurostat/DST explanation for missing DK C1100 2015 reported yield cell and 0.3 thousand ha barley area residual

**Mulig dataeierrolle:** DST / Eurostat

**Neste dokument/handling:** Do not impute reported yield from national HST77; request revision note

**Felter som mangler:** missing_cell_flag_meaning; 2015_area_version_note

**Presist stopp:** National yields exist; Eurostat reported YLD missing; stop rule forbids fill

## B09 — waiting_source

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B09/B09-20260909-correction-001/handoff.json)

### A1-G008

Primær teller/nevner og rådata bak 34 prosent norskandel i 2025, 53 prosent gjennomsnitt 2010–2024 og eventuelle 90-prosentmål

**Mulig dataeierrolle:** Landbruksdirektoratet/markedsregulator og matmelmøllene

**Neste dokument/handling:** Acquire unsent year table with Norwegian and imported food wheat by quality, use, period, numerator and denominator

**Felter som mangler:** numerator; denominator; quality class split; period definition; 90-percent target basis

**Presist stopp:** Authorized channels only show reported percentages and import volumes; primary raw dataset absent; no owner contact sent

### NEW-CLIMATE-01

Definer én klimarelatert forstyrrelse for en valgt vare/funksjon og undersøk samtidige regionale produksjons- og transportavhengigheter.

**Mulig dataeierrolle:** statistics offices / market regulators / mills; transport owners for CLIM-G02 outside B09

**Neste dokument/handling:** Hold disruption definition from CLIM-CHAIN-01; do not claim Nordic independence; await CLIM-G01 series before correlation/additionality

**Felter som mangler:** contemporaneous district food-wheat volume; food quality; domestic need; exportable quantity; transport dependency under same shock

**Presist stopp:** Disruption defined historically (2018); simultaneous regional production+quality+need+exportable series and transport measurement still missing; stop rule forbids assuming independent country risks

### CLIM-G01

Samtidige distriktsserier for mathvetevolum, matkvalitet, innenlandsk behov og eksportabel mengde i samme høstår

**Mulig dataeierrolle:** national statistics / market regulators / mills

**Neste dokument/handling:** Obtain frozen region×year×crop table with yield/area/quality and explicit missingness before any correlation

**Felter som mangler:** district/region series; food quality; domestic need; exportable quantity; explicit missingness

**Presist stopp:** Three original climate/method studies do not supply harmonized Nordic commodity/quality series; B09 does not invent exportable from gross yield

### R4-G005

Exact study implementation and source snapshots if replication becomes necessary

**Mulig dataeierrolle:** study authors if replication later claimed

**Neste dokument/handling:** Do not start replication; if later claim asserts replication, require named panel/code/FigureS1 cells first

**Felter som mangler:** exact panel; code/environment; source snapshots

**Presist stopp:** B09 concludes exact replication is not required for descriptive/compatible-where-allowed scope; artifacts remain missing if claim arises

### METH-G01

Exact Beillouin analysis panel and implementation;2019/2020 outside original event window

**Mulig dataeierrolle:** Beillouin study authors / data accessibility route

**Neste dokument/handling:** No further broad search; retain separation from paper replication

**Felter som mangler:** analysis panel; implementation code; justification for 2019/2020 as same-event window

**Presist stopp:** One collection, one item, one DOCX inventoried; panel not in attachment; 2019/2020 outside original event window

### METH-G02

Exact Tootoonchi2023 source snapshot, full Matlab preprocessing and model-run environment

**Mulig dataeierrolle:** Tootoonchi authors (Matlab on request per prior findings)

**Neste dokument/handling:** Do not reproduce model from equation snippets alone; no author contact in this run

**Felter som mangler:** source snapshot identity; Matlab preprocessing; model-run environment

**Presist stopp:** Equations retained; full environment not acquired; current SCB API response not proven identical to paper panel

### METH-G04

Full FigureS1 group mapping and chart cells; EMF figure not displayed by bundled renderer

**Mulig dataeierrolle:** author/journal figure export or compatible EMF rendering

**Neste dokument/handling:** If mapping needed, obtain readable figure export; do not fabricate cells from blank/partial render

**Felter som mangler:** Northern/Eastern/Western/Southern Europe country×crop cell values; group mapping beyond caption

**Presist stopp:** Caption proves country inventory (NO absent); existing render page-2 shows caption text only; chart cells unread

### R4-NO-G002

Stable county boundaries and regional aggregation2015–2020

**Mulig dataeierrolle:** SSB geography / cereal statistics

**Neste dokument/handling:** Keep national Hele landet slice; no county continuity claim from stable code alone

**Felter som mangler:** boundary version per year; continuity proof; aggregation mapping

**Presist stopp:** Round-004 already selected national scope to avoid unverified county comparability; no new county continuity annex in this run

### R4-NO-G003

Food-grade/exportable quantity, domestic requirement and allocation

**Mulig dataeierrolle:** Landbruksdirektoratet / mills / market regulator

**Neste dokument/handling:** Acquire measuring tables; do not derive exportable food from SSB gross/delivery production

**Felter som mangler:** food-grade quantity; domestic requirement; exportable/available quantity; allocation

**Presist stopp:** Selected SSB tables do not measure these concepts; B09 stop rule forbids exportable-from-gross-yield

### B09-B09-20260909T103719Z-8a62fde2-G01

Named primary year-table file identity for norskandel numerator/denominator (including any 90% target basis)

**Mulig dataeierrolle:** Landbruksdirektoratet/markedsregulator og matmelmøllene

**Neste dokument/handling:** Register exact document requirement (unsent); no email

**Felter som mangler:** document/file identity; version date; field dictionary

**Presist stopp:** No named primary table located in authorized reused channels

### B09-B09-20260909T103719Z-8a62fde2-G02

Frozen compatible region×year×commodity table with food quality, domestic need, exportable quantity and explicit missingness

**Mulig dataeierrolle:** multi-country statistics/market owners

**Neste dokument/handling:** Build only where definitions allow after sources arrive; open residual cells may block comparison

**Felter som mangler:** region definition; food quality; domestic need; exportable; missingness mask

**Presist stopp:** Underlag does not yet allow a compatible multi-region food-grade panel

### B09-B09-20260909T103719Z-8a62fde2-G03

Cross-country moisture/crop/area/yield-rule harmonization bridge blocked by B07/B08 waiting_source annexes

**Mulig dataeierrolle:** B07/B08 document owners (Luke/Eurostat/SSB/SCB/DST)

**Neste dokument/handling:** Do not compute harmonized absolute-level Nordic panel until hash-bound B07/B08 sources close; record waiting_method/source

**Felter som mangler:** FI 2018 transfer/moisture bridge; NO dated Eurostat transmission/YLD rule; SE reported YLD rule; DK missing YLD cell explanation

**Presist stopp:** Contract: dependency stop does not authorize harmonized calculations needing missing annexes

## B10 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B10/B10-20260909T103158Z-3ca837d6/handoff.json)

### A2-G001

Målemetode, målepunkt, usikkerhet, månedlig/daglig volum, mottakerantall, mottakertype og leveringsmønster

**Mulig dataeierrolle:** Aass produksjons-/kvalitetsansvarlig og lokal bondelagsadministrator; kun aggregert/anonymisert

**Neste dokument/handling:** Keep unsent intake fields for volume logs 2022–2026 YTD, instrument/point, and aggregated pickup frequency; new runId when documents return

**Felter som mangler:** measurement_method; measurement_point; uncertainty; monthly_or_daily_volume; recipient_count; recipient_type_mix; delivery_pattern

**Presist stopp:** Year-specific liters exist in open reports but protocol/recipient logs do not; no further public reformulation authorized

### A2-G002

Aass-spesifikk våtmasse, tetthet, tørrstoff, råprotein, NDF/ADF/fiber, fett, aske, energi, mineraler og hygienisk kvalitet

**Mulig dataeierrolle:** Aass kvalitets-/produksjonsansvarlig og uavhengig akkreditert fôrlaboratorium

**Neste dokument/handling:** Unsent batch-sampling request only; B10 stop rule forbids performing sampling/feeding trials in this package

**Felter som mangler:** wet_mass_kg; density_kg_per_L; dry_matter_pct; crude_protein; NDF_ADF_fiber; fat; ash; energy; minerals; hygiene; seasonal_batch_variation

**Presist stopp:** Open Aass channels have qualitative language only; general brewery studies not used as Aass values

### A2-G003

Faktisk mottakerrasjon, dose, ingrediens som erstattes, alternativ ved bortfall, lagringstid, temperatur og tap

**Mulig dataeierrolle:** Lokalt bondelag/mottakeradministrasjon og anonymiserte mottakende gårder eller fôrrådgivere

**Neste dokument/handling:** Unsent anonymized ration/storage intake; do not convert liters to soy tonnes

**Felter som mangler:** ration_dose_kg_wet_and_DM; ingredient_replaced; fallback_on_loss; storage_time; storage_temperature; losses

**Presist stopp:** Open sources say dyrefôr/storfôr only; stop rule blocks general-trial effect transfer

### A2-G004

Aass-matchede originalforsøk med norsk rase, dose, miljø, lagring og mottakerutfall

**Mulig dataeierrolle:** Aass, norsk fôrlaboratorium og fagmiljø for storfeernæring; or authorized library-supplied full text for design inputs only

**Neste dokument/handling:** Do not repeat DOI/OA redirect loop; lawful full text or new local pilot design only in a new authorized run

**Felter som mangler:** Aass_matched_trial; Norwegian_breed; local_dose; local_environment; storage_outcomes

**Presist stopp:** Round-003 fulltext attempts ended at 0; B10 stop rule applied

### A2-G005

Maskesilo-/pumpekapasitet, kjøretøy, backup for strøm/naturgass/vann, stoppfrekvens, avtaleforpliktelser og alternativ fôrkjede

**Mulig dataeierrolle:** Aass drift/beredskap og lokal mottaker-/transportadministrasjon

**Neste dokument/handling:** Unsent continuity/capacity intake; process flow alone is not resilience evidence

**Felter som mangler:** silo_capacity; pump_capacity; vehicles; backup_power_gas_water; stop_frequency; contractual_obligations; alternative_feed_chain

**Presist stopp:** Open pages document flow, not capacity or backup

### A2-G006

Definisjon og dekningsår for nettsidens formulering «over 8 millioner liter»

**Mulig dataeierrolle:** Aass rapport-/bærekraftansvarlig

**Neste dokument/handling:** Clarify whether website figure is rounded, historical or differently bounded; keep both observations separate until clarified

**Felter som mangler:** website_coverage_year; rounding_or_boundary_definition; relationship_to_2025_7_7M

**Presist stopp:** Re-fetched 2026-09-09: website still «over 8M»; 2025 report still 7.7M; no erratum found

### B10-20260909T103158Z-3ca837d6-G01

Explicit non-merge rule for undated website liters vs year-specific report liters pending owner definition

**Mulig dataeierrolle:** Aass rapport-/bærekraftansvarlig

**Neste dokument/handling:** Owner statement binding website wording to year(s) and method; until then analysts must cite series separately

**Felter som mangler:** authoritative_definition_binding_both_statements

**Presist stopp:** Public re-read confirms unresolved conflict; no invented reconciliation

## B11 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B11/B11-20260909T103158Z-e6b97281/handoff.json)

### NEW-NPK-01

Én strøm, næringsstoff, produkt, vekst/område og sesong; faktisk bruk og erstattet mineralvare.

**Mulig dataeierrolle:** Hias + named recipient + NORSØK/NIBIO authors as applicable

**Neste dokument/handling:** Keep B11 unsent intake F01–F22 internal; authorize owner path outside worker; new runId for returned docs

**Felter som mangler:** named_stream_binding; applied_plant_available_P; displaced_mineral; mass_balance; erratum

**Presist stopp:** Stop rule: no national NPK total; no effect without same soil/crop/season; parties/journal missing

### R3-NPK-G001

2026 disponibel produktbeholdning per parti, lagersted og dato

**Mulig dataeierrolle:** Hias IKS struvitt-/lager-/kvalitetsansvarlig

**Neste dokument/handling:** Obtain dated batch certificates and stock ledger; 2025 annual production is not stock

**Felter som mangler:** B11-F01; B11-F02; B11-F03; B11-F04; B11-F05; B11-F06; B11-F07

**Presist stopp:** 2025 report gives annual kg only; parti/batch absent

### R3-NPK-G002

Faktisk anvendt og plantetilgjengelig P for én byggåker/sesong og erstattet mineralvare

**Mulig dataeierrolle:** Named recipient farm + Hias delivery documentation

**Neste dokument/handling:** Bind one barley field/season journal to a batch; keep N/K separate; do not use pot/ley results as substitution

**Felter som mangler:** B11-F08; B11-F09; B11-F10; B11-F11; B11-F12; B11-F13; B11-F14; B11-F15

**Presist stopp:** No recipient journal in channels; product-P ≠ plant uptake

### R3-NPK-G003

Ekstra sirkulær funksjon over eksisterende slamanvendelse

**Mulig dataeierrolle:** Hias process accounting + mass-balance method owner

**Neste dokument/handling:** Require before/after wastewater-P balance including sludge disposition, struvite, losses, chemicals, energy

**Felter som mangler:** B11-F16; B11-F17

**Presist stopp:** Separate slam and struvite reporting without linking balance

### R3-NPK-G004

Leverbar P under energi-/kjemikalie-/transportforstyrrelse

**Mulig dataeierrolle:** Hias struvite process/beredskap operator

**Neste dokument/handling:** Collect struvite-leg power, backup, Mg stock, staffing, downtime, restart, transport under named disruption

**Felter som mangler:** B11-F18; B11-F19; B11-F20

**Presist stopp:** Plant energy charts ≠ deliverable P under disruption

### R3-NPK-G005

Ekstra nordisk bidrag utover norsk alternativ

**Mulig dataeierrolle:** Paired method owner + nordic counterpart capacity rights

**Neste dokument/handling:** Only after national T001-style baseline; same soil/crop/season/shock/quality

**Felter som mangler:** B11-F21

**Presist stopp:** Norwegian production/trials are not Nordic addition

### R3-NPK-G006

Korrigerte feltprosent- og doseenheter

**Mulig dataeierrolle:** NORSØK/NIBIO report authors (and Hias coauthors as applicable)

**Neste dokument/handling:** Request erratum or reconstructable raw yield/dose tables; no worker contact sent

**Felter som mangler:** B11-F22

**Presist stopp:** Conflict reproduced; orgprints has no erratum; alternate PDF bytes still carry same text

## B12 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B12/B12-20260909T103158Z-efdd0743/handoff.json)

### NEW-MEAL-01

Finn studie med kontinuitet under konkret avbrudd og sammenlignbar ernæring; ordinær økologi/svinnandel er utilstrekkelig.

**Mulig dataeierrolle:** pilot metodeansvarlig + navngitt kjøkken

**Neste dokument/handling:** Do not invent effect sizes; after owner protocol (MEAL-G001) and MEAL-T001 execution in a future authorized run, reassess. Ordinary ecology/waste shares remain insufficient.

**Felter som mangler:** comparable_national_vs_circular_vs_nordic_outcomes_under_identical_disruption; nutrition_suitable_meals_eaten; multi_meal_continuity_metrics

**Presist stopp:** Channels (round-003 meals packet + Hylte news/tertial + MeetingPlus targeted protocol search) lack a study with continuity under named disruption and comparable nutrition; stop per NEW-MEAL-01/B12 stop rules — no physical test, no broad news reformulation.

### MEAL-G001

Hyltes eksakte øvelsesdato, tidslogg, matkontroll og næringsberegning

**Mulig dataeierrolle:** kommunens øvelsesledelse, måltidsfunksjon og matkontroll (Hylte)

**Neste dokument/handling:** Keep B12-MEAL-G001-unsent.json unsent; authorized outreach outside this package must return primary protocol bytes for a new runId

**Felter som mangler:** exact_calendar_date_and_weekday; time_log; food_control_sheets; nutrition_calculation_raw; primary_protocol_document_id

**Presist stopp:** Municipal news + tertial 'under våren' cannot fill raw operations data; weekday/date contradiction retained; MeetingPlus titles read do not include named Patricia protocol

### MEAL-G002

Spist ernæringsmessig egnet måltid, spiselig svinn, vann, brensel, arbeid og kostnad under identisk avbrudd

**Mulig dataeierrolle:** navngitt kjøkken og måleansvarlig

**Neste dokument/handling:** Execute MEAL-T001 only when authorized; public guidance supplies fields but not pilot data

**Felter som mangler:** eaten_suitable_meals; special_diets; edible_waste_kg; water_l; fuel; labor_h; cost; identical_disruption_before_after

**Presist stopp:** No circular effect size before compatible before/after data and input balance; one session ≠ proof; ordinary 270 g not disruption metric

### MEAL-G003

Gjenværende lager, fornyet nødvann/brensel, kritiske leveranser og spesialkost over flere måltider

**Mulig dataeierrolle:** kjøkken, vannverk, logistikk og kontraktseier

**Neste dokument/handling:** Request existing local continuity logs; any multi-day exercise must be separately authorized — B12 does not scale one session

**Felter som mangler:** remaining_stock_by_sku; water_fuel_renewals; critical_deliveries; special_diet_continuity_across_meals

**Presist stopp:** Stop rule: one preparation session is not daily capacity

### MEAL-G004

Nordisk metodetillegg utover norsk baseline for samme kjøkken/scenario

**Mulig dataeierrolle:** pilotens metodeansvarlige

**Neste dokument/handling:** Specify concrete Nordic add-on content before claiming increment; Swedish exercise/pilot funding alone is not Nordic addition over Norwegian baseline

**Felter som mangler:** specified_nordic_method_increment_content; paired_comparison_after_local_norwegian_optimization

**Presist stopp:** Multiple national exercise narratives do not prove Nordic increment; stop without inventing method content

### B12-20260909T103158Z-efdd0743-G01

MeetingPlus Patricia search page 2 titles not retrieved despite page/pageSize parameter attempts

**Mulig dataeierrolle:** koordinator / later run with browser JS pagination if needed

**Neste dokument/handling:** If owner still silent, optional follow-up run may capture page-2 titles; do not treat as proof of absence

**Felter som mangler:** patricia_search_page2_title_list

**Presist stopp:** UI reported 1 of 2 pages; visible page-1 titles already insufficient as protocols

## B13 — waiting_source

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B13/B13-20260909-correction-001/handoff.json)

### A3-G001

SIFO-batteriets komplette bølgeforløp og svarfordeling per item

**Mulig dataeierrolle:** SIFO/OsloMet, steward of report underlying survey/method files

**Neste dokument/handling:** Machine-readable item table plus per-wave item response distributions for waves used in Figur 4-3/4-4

**Felter som mangler:** B13-TP-01 machine-readable authoritative item table; B13-TP-02 item response distribution by wave

**Presist stopp:** Item wording/scoring found in published Vedlegg 6; complete wave-by-wave item distributions still absent from inspected channels

### A3-G002

Delutvalgs-N, vekter, frafall, standardfeil/konfidensintervall for SIFO Figur 4-3 og 4-4

**Mulig dataeierrolle:** SIFO/OsloMet

**Neste dokument/handling:** Technical table with subgroup N, weights/nonresponse, and SE or CI for Figur 4-3 and 4-4 cells

**Felter som mangler:** B13-TP-03; B13-TP-04; B13-TP-05

**Presist stopp:** Report gives total-N and p<0.05 only; subgroup N/weights/nonresponse/SE/CI not in SIFO-rapport 7-2025 body/Vedlegg 6

### A3-G006

SIFO-undergruppeestimater med robust usikkerhetsrapportering for inntekt og familietype

**Mulig dataeierrolle:** SIFO/OsloMet

**Neste dokument/handling:** Income/family-type prevalence tables with N and intervals for relevant waves

**Felter som mangler:** B13-TP-06

**Presist stopp:** OLS association figure is not a prevalence table with robust uncertainty

### A3-G007

Nasjonal mottakerpopulasjon og svarandel per matutdelingssted i Fafo

**Mulig dataeierrolle:** Fafo / participating food-distribution sites

**Neste dokument/handling:** National recipient population frame and per-site respondent denominators/response shares for the September 2025 mapping

**Felter som mangler:** B13-TP-07; B13-TP-08

**Presist stopp:** Fafo explicitly states no full recipient population information and no registration of answer share per site; stop rule forbids national prevalence from this sample

### B13-B13-20260909T103514Z-3261c6cc-G01

Named public technical annex (separate from SIFO-rapport 7-2025 / Fafo 2026:01 body) supplying B13-TP-02..TP-08

**Mulig dataeierrolle:** SIFO/OsloMet and/or Fafo method owners

**Neste dokument/handling:** See private unsent-method-request-B13.json

**Felter som mangler:** B13-TP-02; B13-TP-03; B13-TP-04; B13-TP-05; B13-TP-06; B13-TP-07; B13-TP-08

**Presist stopp:** Targeted search of published channels found the same reports already frozen; no separate technical annex with the missing fields

## B14 — complete_within_scope

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B14/B14-20260909-correction-001/handoff.json)

### A3-G003

Validert crosswalk mellom SIFO-indeksen og FAO/FIES

**Mulig dataeierrolle:** Metodeansvarlig for eventuell harmoniseringsstudie; ikke avklart

**Neste dokument/handling:** Keep separate indicator profiles; only reopen if a named validation study with shared sample is supplied in a new runId

**Felter som mangler:** validated_crosswalk_coefficients; shared_respondent_validation_study; equating_protocol

**Presist stopp:** No SIFO–FIES Nordic validation study identified in A3 reuse or B14 concrete searches; stop rule forbids inventing conversion

### A3-G004

FAO/FIES-punktestimat, faktisk N, full nevner, svarprosent og country-specific sampling details for nordiske bølger

**Mulig dataeierrolle:** FAO Statistics Division / autorisert mikrodatasetilgang

**Neste dokument/handling:** Register unsent research-access need for FAO microdata or official published tables with point estimates; do not redistribute microdata

**Felter som mangler:** published_point_estimate; analytical_N_after_validation; population_denominator; response_rate; country_specific_sampling_annex_bytes

**Presist stopp:** Open catalogs now show Cases for several waves and DE/MoE for NOR2023, but still lack point estimate, response rate, full denominator, and downloaded country sampling annex

### A3-G005

Om FAOSTAT treårsgjennomsnitt kan brytes til sammenlignbare enkeltår for nordiske land

**Mulig dataeierrolle:** FAOSTAT/FAO Statistics Division

**Neste dokument/handling:** Use 210091 3-year series only as labeled averages with CI; obtain annual figures only from an official table that actually publishes item 210090 (or equivalent) for Nordic countries

**Felter som mangler:** nordic_rows_for_item_210090_annual_value

**Presist stopp:** Frozen bulk file has Nordic 210091 but zero Nordic 210090 Value rows; deriving single years is forbidden by stop rule

### A3-G008

Objektive kjøps-/forbruksdata og kobling til mat-usikkerhet i Sverige

**Mulig dataeierrolle:** SCB / Livsmedelsverket / surveyforvalter — linkage owner not cleared

**Neste dokument/handling:** Treat SCB sales and Livsmedelsverket self-report as separate indicator families; do not claim FI linkage

**Felter som mangler:** household_purchase_microdata_linked_to_FI_or_FIES; scanner_panel_with_food_insecurity_instrument

**Presist stopp:** Named Swedish objective sales product found; no FI-linked objective purchase source in channels

### A3-G009

Gjentatt finsk nasjonal flerleddet måling av husholdningenes økonomiske mattilgang

**Mulig dataeierrolle:** Statistics Finland, THL eller nasjonal survey-/forskningsforvalter; ikke avklart

**Neste dokument/handling:** Keep StatFin 132a and THL 4264 as non-equivalent proxies; seek explicit FIES/HFSSM-style national series before claiming Finnish multi-item food-access trend

**Felter som mangler:** repeated_finnish_FIES_or_SIFO_like_food_only_multiitem_series

**Presist stopp:** THL 4264 mixes food with medicines/doctor visits; StatFin 132a is ends-meet; ISSP remains one-item 2019

### A3-G010

Replikasjonsdata og nyere bølge for den finske ISSP-analysen

**Mulig dataeierrolle:** ISSP Finland / Finnish Social Science Data Archive (Aila) — authorized user download

**Neste dokument/handling:** Coordinator may authorize Aila registration/download in a new runId; do not treat 2029 planned module as available data

**Felter som mangler:** local_hash_bound_FSD3431_microdata; post_2019_ISSP_Social_Inequality_wave_with_meal_skip_item

**Presist stopp:** FSD3431 catalog+variable confirmed; download requires login (not performed); Social Inequality VI only planned 2029

### A3-G011

Harmonisert sammenligningsmatrise med samme år, enhet, nevner og usikkerhetsmål for SIFO/FIES/ISSP

**Mulig dataeierrolle:** Metodeansvarlig i videre analyse

**Neste dokument/handling:** Publish/maintain explicit instrument matrix only; forbid percent conversion and Nordic ranking across instruments

**Felter som mangler:** common_year_unit_denominator_uncertainty_across_SIFO_FIES_ISSP

**Presist stopp:** Profiles can be juxtaposed; harmonized prevalence matrix blocked by missing bridge and mismatched units/periods

### B14-B14-20260909T103514Z-4679b359-G01

Authorized local retrieval of FSD3431 microdata bytes (hash-bound) for ISSP 2019 Finland meal-skip item

**Mulig dataeierrolle:** Authorized Aila user / FSD customer

**Neste dokument/handling:** If coordinator authorizes, register/login and download under class B terms in a new runId; no email from this package

**Felter som mangler:** FSD3431_raw_sha256; FSD3431_extracted_codebook_sha256

**Presist stopp:** Download button inactive for guest; contract forbids access bypass

### B14-B14-20260909T103514Z-4679b359-G02

FAO/FIES published Nordic point estimates with analytical N, denominator and response rate (or authorized microdata compute under agreement)

**Mulig dataeierrolle:** FAO Statistics Division

**Neste dokument/handling:** Unsent access/table request fields only; new runId after materials arrive

**Felter som mangler:** point_estimate; analytical_N; denominator; response_rate

**Presist stopp:** Open catalog exhausted for point estimates; microdata not downloaded

## B15 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B15/B15-20260909T103514Z-9d38b3c0/handoff.json)

### A4-G001

Vare-for-vare lagerbeholdning med dato, eier, lokasjon, holdbarhet og rullering

**Mulig dataeierrolle:** Ansvarlig departement/nasjonal beredskapsfunksjon og eventuelle lagerforvaltere

**Neste dokument/handling:** Authorized owner intake of dated commodity register; keep proposed/scenario rows separate from holdings (unsent B15-OWN-03)

**Felter som mangler:** commodity; quantity_unit; as_of_date; owner; location; shelf_life; rotation_rule; acquisition_vs_commercial_flag

**Presist stopp:** B15 stop rule: scenario/recommendation ≠ physical stock; public channels lack register

### A4-G002

Endelig vedtaks- og gjennomføringsstatus etter rapportene og Alþingi-sak 57

**Mulig dataeierrolle:** Alþingi-sekretariatet og Atvinnuvegaráðuneytið

**Neste dokument/handling:** Obtain final ferill/vote documents and any agreement/budget implementing instruments (unsent B15-OWN-01/02); do not treat proposal or report answers as final adoption

**Felter som mangler:** final_vote_or_adoption_status; committee_opinion_fulltext; implementing_decision_or_agreement_clause; procured_vs_operational_status

**Presist stopp:** Readable proposal + process answers only; ferill blocked; no implementation instrument found in scoped channels

### B15-20260909T103514Z-9d38b3c0-G01

Fulltekst av komitéuttalelse og eventuell sluttvotering/ferill for 57. mál (156. þing)

**Mulig dataeierrolle:** Alþingi-sekretariatet

**Neste dokument/handling:** Retry authorized browser session or request document IDs from secretariat; do not elevate A4 search snippets

**Felter som mangler:** ferill_html_or_pdf; nefndarálit_fulltext; atkvæðagreiðsla_record_if_any

**Presist stopp:** Cloudflare/403 on ferill and committee list in this run

### B15-20260909T103514Z-9d38b3c0-G02

Gjeldende uttaks-/finansieringsgrunnlag for en operativ reserveordning (skilt fra rapportkostnader og forslagstekst)

**Mulig dataeierrolle:** Atvinnuvegaráðuneytið / ansvarlig beredskapsfunksjon

**Neste dokument/handling:** Owner intake separating report financing from reserve financing and documenting withdrawal authority (unsent B15-OWN-02)

**Felter som mangler:** withdrawal_legal_basis; activation_authority; procedure_id; budget_line_or_storage_fee_contract; coverage_period_definition

**Presist stopp:** Proposal geymslugjald language and report payments are not an operational withdrawal/financing basis

### B15-20260909T103514Z-9d38b3c0-G03

Offentlig eller eierholdt registerrad per vare med evidenskjede til fysisk beholdning

**Mulig dataeierrolle:** Lagerforvaltere / departement

**Neste dokument/handling:** Same as A4-G001 owner intake

**Felter som mangler:** register_extract_or_attested_absence

**Presist stopp:** Only scenario/qualitative/process sources in channel set

### B15-20260909T103514Z-9d38b3c0-G04

Primær Stjórnarráðið-tekst for búvörusamningar-framlengingen 2026-06-04 og eventuell avtale-/vedleggstekst om neyðarbirgðir

**Mulig dataeierrolle:** Atvinnuvegaráðuneytið kommunikasjons-/avtaleforvalter

**Neste dokument/handling:** Obtain printable/PDF primary page or agreement PDF; do not treat BBL quote as complete primary

**Felter som mangler:** extractable_primary_html_or_pdf; signed_extension_agreement_text; stock_scheme_clause_present_or_absent

**Presist stopp:** Blazor shell returned no extractable article body via curl/WebFetch/headless dump in this run

## B16 — complete_within_scope

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B16/B16-20260909T103514Z-5f548c04/handoff.json)

### A4-G003

Kompatibel teller, nevner og observasjonsperiode bak 2021-rapportens ca. 1 %

**Mulig dataeierrolle:** LBHI-/departementsforvalter av 2021-grunnlaget eller Statistics Iceland

**Neste dokument/handling:** Obtain underlying 2021 dataset with identical definitions; do not use 344/25000 as validated fraction

**Felter som mangler:** B16-TP-07

**Presist stopp:** Claim located; compatibility still missing

### A4-G004

Samlet, aktuell kapasitet og driftsstatus for møller, valsing, tørking, pakking og lager

**Mulig dataeierrolle:** Navngitte kornforedlere, produsenter og anleggseiere

**Neste dokument/handling:** Collect dated per-plant capacity definitions separately for mill/dry/roll/pack/store

**Felter som mangler:** B16-TP-04; B16-TP-05; B16-TP-06

**Presist stopp:** List≠capacity; secondary ~500 t dryer aim not national capacity

### A4-G005

MAST-/kommunale tillatelser og aktuell virksomhetsliste for kornforedling

**Mulig dataeierrolle:** MAST and relevante kommunale tilsyn

**Neste dokument/handling:** Obtain activity-code legend and municipal cereal-plant extracts; keep Feed Frum-3 separate from food permits

**Felter som mangler:** complete municipal cereal milling/rolling subset with activity legend; A981 license PDF bytes (404)

**Presist stopp:** A4-L014 timeout cleared; Food MAST list has no cereal section; named food-mill completeness still missing

### A4-G006

Gjeldende 2025/2026-status for Þorvaldseyri/Eyrarbúið og eventuelt Korngrís som matkornforedlere

**Mulig dataeierrolle:** Operatørene Þorvaldseyri/Eyrarbúið og Korngrís

**Neste dokument/handling:** Request dated production/permit docs; unsent checklist in required-document-B16.json

**Felter som mangler:** B16-TP-01; B16-TP-02; B16-TP-03 food permit if any

**Presist stopp:** Public pages insufficient; MAST hit is Feed drying; Korngrís future-tense/empty products

### A4-G007

Kjede fra reserve/råvare til leverbar mat ved importavbrudd

**Mulig dataeierrolle:** Tverrdepartementalt beredskapsansvar, MAST og kornforedlere

**Neste dokument/handling:** Build hash-bound chain table only after stock+process+activation documents exist; coordinate with B15 without mutual wait

**Felter som mangler:** B16-TP-08

**Presist stopp:** No linked deliverable-food chain; stop rule forbids synthesizing from lists/one farm

### B16-B16-20260909T103514Z-5f548c04-G01

Public license PDF bytes / activity-code legend for MAST Feed Frum-3 and HD Framleiðsla-Pökkun codes

**Mulig dataeierrolle:** MAST skyrslur custodians

**Neste dokument/handling:** Obtain codebook or working license PDF URLs; do not infer beyond captured A981 HTML detail

**Felter som mangler:** A981.pdf bytes; authoritative activity-code codebook

**Presist stopp:** License PDF paths returned 404

## B17 — waiting_owner

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B17/B17-20260909T103719Z-fa4831c4/handoff.json)

### A5-G001

Offentlig identifikasjon og innhold i eventuell matspesifikk Norge–Finland-protokoll

**Mulig dataeierrolle:** norsk/finsk traktat- og beredskapsforvaltning

**Neste dokument/handling:** Usendt eierforespørsel om dokument-ID/versjon/tekst

**Felter som mangler:** dokument-ID/versjon matprotokoll; vare/mengde/mottakerrett/aktivering/ledetid; offentlig vs gradert status

**Presist stopp:** Named public channels exhausted; no food protocol

### A5-G002

Gjeldende avtale-/protokollstatus etter tiårsperioden i 2026 og siste blandede komitéspor

**Mulig dataeierrolle:** norsk/finsk utenriks- eller næringsberedskapsforvaltning

**Neste dokument/handling:** Kontroller traktatregister + komitéreferat; avklar MoU-dato

**Felter som mangler:** oppsigelse/forlengelsesbekreftelse; Overvåkingskomité-referat (Art.5); MoU 2020-dato vs Lovdata 2005; HE145 fulltekst

**Presist stopp:** No public termination/minute; auto-renewal ≠ owner confirmation

### A5-G003

Mandat, budsjett, eier og faktisk fremdrift for 2027-studien og eventuell ny nordisk avtale

**Mulig dataeierrolle:** NSSN / nordiske forsyningsberedskapsmyndigheter

**Neste dokument/handling:** Usendt forespørsel om mandat/finansiering/eier/tidsplan

**Felter som mangler:** mandat/TOR-ID; budsjett; studieeier utover NSSN; matspesifikk scope; fremdrift etter 2026-09-02

**Presist stopp:** Declaration plans 2027 study without funded mandate

### A5-G005

Forhåndsfastsatte kriterier for fordeling mellom militær, sivil og alliert transport ved samtidig nordisk sjokk

**Mulig dataeierrolle:** nasjonale transportberedskaps- og totalberedskapsmyndigheter

**Neste dokument/handling:** Usendt forespørsel om prioriteringsregel/øvelse

**Felter som mangler:** prioriteringshierarki + myndighet; matspesifikke unntak; øvelsesresultater

**Presist stopp:** Strategy/FFI recommend mechanisms only

### A5-G006

Dokumentkjede fra finansiering/kontrakt/fasilitet/øvelse til faktisk grensekryssende matleveranse

**Mulig dataeierrolle:** norske og finske mat-/transport-/beredskapsmyndigheter

**Neste dokument/handling:** Usendt; samordne kapasitet med B05/B06/B16 via koordinator

**Felter som mangler:** bevilgning/kontrakt-ID; mottaksnode; øvings-/leveringslogg dato+mengde; mottaksbekreftelse

**Presist stopp:** No finance→delivery chain found

### A5-G007

Tilgjengelig Åland-tekst og dokumentert signerings-/vedtaksgrunnlag

**Mulig dataeierrolle:** Ålands landskapsregering eller nordisk dokumentforvalter

**Neste dokument/handling:** Behold B17-S03; innhent full signaturkjede i ny runId ved behov

**Felter som mangler:** komplette multipart signaturdatoer; government.se original (403)

**Presist stopp:** Åland PDF retrieved; signature placeholders + gov.se 403 remain

### B17-B17-20260909T103719Z-fa4831c4-G01

Owner resolution of MoU-cited 5 November 2020 versus Lovdata Ident 14-04-2005 nr 10

**Mulig dataeierrolle:** norsk/finsk traktatforvaltning

**Neste dokument/handling:** Usendt avklaring av datokonflikt

**Felter som mangler:** forklaring av 2020-11-05-sitering; eventuelt 2020-instrument skilt fra 2005

**Presist stopp:** Stop rule forbids adopting MoU date

### B17-B17-20260909T103719Z-fa4831c4-G02

Financed TOR for NSSN 2027 feasibility study

**Mulig dataeierrolle:** NSSN / nordiske forsyningsberedskapsmyndigheter

**Neste dokument/handling:** Usendt forespørsel om TOR/budsjett/eier

**Felter som mangler:** TOR-ID; budsjett; named lead; food-scope flag

**Presist stopp:** Declaration mentions study year only

### B17-B17-20260909T103719Z-fa4831c4-G03

government.se declaration page HTTP 403; HE145 Finlex endpoint returned PNG

**Mulig dataeierrolle:** document hosts (Government Offices of Sweden; Finlex)

**Neste dokument/handling:** Retry in later runId; Åland annex covers declaration text

**Felter som mangler:** government.se full text bytes; HE145 authentic PDF bytes

**Presist stopp:** Access failures recorded

## B18 — complete_within_scope

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B18/B18-20260909T103719Z-707c9a03/handoff.json)

### B18-20260909T103719Z-707c9a03-G01

Which documented buyer relations (counterparty, year, unit, denominator, relation type) exist for a named chain relevant to chapters 4–5?

**Mulig dataeierrolle:** Platform data owner / commercial contract owner for named chain; not inferred from market-power shares

**Neste dokument/handling:** Unsent intake: for each named chain, supply documented buyer/off-taker rows with year, unit, denominator and source; do not allocate 60310 delivery volumes by assumed market power

**Felter som mangler:** named_chain; buyer_counterparty; relation_type; year; unit; denominator; row_level_source

**Presist stopp:** Authorized channels (ch.4–5 assessments, FS-02 historical need, synthesis ownership rules) show primary-delivery row counts and ownership-map method rules, but no verified buyer-share series with year/unit/denominator; stop rule forbids guessing shares or app mutation

### B18-20260909T103719Z-707c9a03-G02

Human editorial/accounting choice for Holdbart AS 2024: exact NOK candidate with 1 NOK discrepancy note versus MNOK precision?

**Mulig dataeierrolle:** Human reviewer / accounting decision owner (Holdbart precision); agent forbidden to choose per B18 stop rule

**Neste dokument/handling:** Keep decision packet open; if exact NOK required, prefer component-reconciled 22973972 with note that page 2/displayed subtotal give 22973971; or retain 23.00 MNOK without resolving 1 NOK

**Felter som mangler:** human_precision_choice; optional_issuer_explanation

**Presist stopp:** B18 stop rule: Holdbart-presisjonsvalg foretas ikke av agenten; mechanical origin identified; exact value not source-resolved

### B18-20260909T103719Z-707c9a03-G03

Which remaining identity, currency and consolidation-scope uncertainties must be retained before any cross-entity financial sum?

**Mulig dataeierrolle:** Financial data steward + human reviewer for consolidation rules

**Neste dokument/handling:** Before any sum: one entity once per scope/year; retain currency/FX basis; no market-size sum from mixed company/group rows

**Felter som mangler:** entity_identity_map; company_vs_group_flag; currency_and_fx_basis; year_alignment; subsidy_double_count_check

**Presist stopp:** Channels document the uncertainty classes; B18 performs no new multi-entity sum and does not clear FS-04/09

### B18-20260909T103719Z-707c9a03-G04

For each named ownership/vertical relation used externally: row-level source, date and relation type?

**Mulig dataeierrolle:** Editorial owner (H-04) / knowledge-base curator

**Neste dokument/handling:** Unsent: require source+date+type on each named relation before publication; do not infer control from minority ownership

**Felter som mangler:** row_level_source; relation_date; relation_type

**Presist stopp:** Manuscript rule present; B18 did not re-verify each ownership row; no publication

## B19 — complete_within_scope

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B19/B19-20260909-correction-001/handoff.json)

### B19-B19-20260909T103719Z-dd7b5e44-G01

How should historical synthetic source identities be rewritten or candidate-controlled without auto-rewriting protected history?

**Mulig dataeierrolle:** Knowledge/source-identity owner (FS-01) with human authority gate

**Neste dokument/handling:** Open separate authorized identity/candidate workflow for synthetic sources; do not auto-rewrite historical identities in research runs

**Felter som mangler:** synthetic_source_identity_rewrite_candidates; before_after_proof_pack_for_search_library_AI_context_blocks; owner_approved_rewrite_policy

**Presist stopp:** B19 stop rule forbids candidate-writer and mass identity rewrite; FS-01 still source-gated

### B19-B19-20260909T103719Z-dd7b5e44-G02

Which contradicted/insufficient round-002 observations still need separate candidate rows applying proposedCorrection traces?

**Mulig dataeierrolle:** Research coordinator / observation owners for A1–A5 domains

**Neste dokument/handling:** Spawn dedicated package runs per observation family to hash-bind proposedCorrection candidates; keep original rows as rejected/limited traces

**Felter som mangler:** per_observation_candidate_rows_for_A3-O012_A1-O021_A1-O027_A2-O014_A2-O019_A5-O003_A4-O022_A4-O028_A2-O018_A5-O008

**Presist stopp:** B19 inventories traces only; applying corrections would expand beyond read-only provenance scope

### B19-B19-20260909T103719Z-dd7b5e44-G03

What exact model version/attestation covers historical A1–A5 reviews and this B19 executor session?

**Mulig dataeierrolle:** Platform/model-governance owner

**Neste dokument/handling:** Obtain verifiable model-version attestation before any human qualification gate; keep null rather than invent

**Felter som mangler:** attestedModel; modelVersionEvidencePath; independentModelValidationReceipt

**Presist stopp:** No reliable model id/attestation metadata in executor session; queue receipt modelVersionAttested=false

### B19-B19-20260909T103719Z-dd7b5e44-G04

What is the current verified library population replacing historical 1770/399 figures?

**Mulig dataeierrolle:** Library/corpus owner

**Neste dokument/handling:** Run a separately authorized census with dated method; do not reuse 1770/399 as live totals

**Felter som mangler:** current_verified_library_population; current_bound_source_population; dated_census_method_receipt

**Presist stopp:** B19 stop rule: historical 1770/399 is not fresh library population; no mass download/DB import

## B20 — complete_within_scope

[Gjeldende kandidatretur](../../analysis/source-review-beredskap-2026-09-09/research-runs/20260909-beredskap-wave1/B20/B20-20260909-correction-002/handoff.json)

### B20-B20-20260909T104921Z-ed03e679-G01

Netto ekstra nordisk leveranse når begge land trenger samme volum, sammenlignet med nasjonal løsning

**Mulig dataeierrolle:** Senere autorisert forsøks-/måleansvarlig + data owners in B01–B06/B15–B17 chains

**Neste dokument/handling:** After owner/source returns close prerequisite chain gaps, authorize new run to compute C−A only with frozen identical conditions; do not invent net tonnes

**Felter som mangler:** paired_same_need_both_countries_t; national_arm_delivered_accepted_t; nordic_or_combined_arm_delivered_accepted_t; net_additional_nordic_t; quality_shock_deadline_identity_proof

**Presist stopp:** Wave1 predecessors mostly waiting_owner/waiting_source; no compatible measured national vs Nordic additional delivery

### B20-B20-20260909T104921Z-ed03e679-G02

Recipient-bound quality,own need,stock,processing,transport and delivery for paired C1 scenario

**Mulig dataeierrolle:** Furuset recipient ops + Cerealia/Ldir/mill operators + Malmö allocation owner (via B01–B06 owner intakes; unsent)

**Neste dokument/handling:** Coordinator routes unsent owner intakes from B01–B06; new measurement run only after prerequisite fields non-null

**Felter som mangler:** recipient_Q1_need_t_by_interval; accepted_Q1_spec_limits_methods; NO_stock_release_right_at_t0; SE_allocation_nonoverlap; milling_loading_border_unload_timeline; delivered_accepted_flour_t_by_arm

**Presist stopp:** B01–B06 waiting_owner; protocol designed not executed; target-profile measured fields null

### B20-B20-20260909T104921Z-ed03e679-G03

Paret A/B og eventuell kombinert C-arm med samme betingelser

**Mulig dataeierrolle:** Senere autorisert forsøksansvarlig (per R5-G10 / MAALEPROTOKOLL)

**Neste dokument/handling:** Internal assessment of measurement authorization only; no contact in this run; collectionPerformed remains false

**Felter som mangler:** arm_A_delivered_accepted_t_timeline; arm_B_delivered_accepted_t_timeline; arm_C_combined_resource_reconciled_t_timeline; B_minus_A; C_minus_A; shared_resource_IDs_independence_check

**Presist stopp:** MAALEPROTOKOLL status designed-not-executed; no A/B/C collection in wave1

