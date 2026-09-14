# Data Sources — Food Systems 2026

Central reference for all data files in `public/data/food-systems/`.

## ssb_landbruk_2024.json

- **Records**: Market overview, production, logistics, economics, food waste
- **Source**: Statistisk sentralbyrå (SSB), Landbruksdirektoratet, Matvett/NORSUS
- **Reproduce**: SSB Tabell 10235 (markedsandeler), Tabell 10508 (kjøttproduksjon), Tabell 06462 (selvforsyning). Food waste from Matvett annual report 2024.
- **Updated**: 2024
- **Limitations**: Self-sufficiency is calendar year 2023. Food waste breakdown is estimated.

## financial_insights_2024.json

- **Records**: Corporate results for NorgesGruppen, Coop, Rema 1000
- **Source**: Annual reports 2024 (NorgesGruppen Årsrapport, Coop Norge Årsmelding, Rema via Reitangruppen). Leverandør margin from Konkurransetilsynet verdikjedestudie.
- **Reproduce**: Download annual reports from corporate websites. Konkurransetilsynet report available at konkurransetilsynet.no.
- **Updated**: 2024
- **Limitations**: Rema/Reitan margin is estimated from group-level reporting. Leverandør margin is industry average.

## trade_volumes_2024.json

- **Records**: Domestic production, imports, exports
- **Source**: SSB utenrikshandel, Landbruksdirektoratet, Sjømatrådet
- **Reproduce**: SSB Tabell 08799 (import/eksport), Sjømatrådet eksportstatistikk
- **Updated**: 2024
- **Limitations**: Some categories aggregated across HS codes.

## {country}/value-chain.json

- **Records**: Country value-chain baseline by stage, including primary production volumes and organic agriculture fields (`organic_area_ha`, `organic_share_pct`, `organic_year`, `organic_quality_flag`)
- **Source**: Country-specific value-chain notes plus `research/data/nordic/core-series/organic_agriculture_annual.csv`
- **Reproduce**: Eurostat `ORG_CROPAR` with `unit=HA` and `unit=PC_UAA`, `crops=UAAXK0000`, `agprdmet=TOTAL`, `geo=DK/FI/SE/NO`; Iceland is a local estimate until primary-checked. EEA historical Iceland share 2012-2020 is staged separately and does not replace the current estimate. Hagstofa/PxWeb agriculture catalog was checked on 2026-04-29 and did not expose an organic area/market series.
- **Updated**: Organic fields refreshed 2026-04-29 from Eurostat source update 2026-03-31
- **Limitations**: 2024 Eurostat coverage is partial (FI/SE only in checked extract). Iceland organic area/market fields are still flagged `needs_primary_check`; TRACES now covers current Iceland operator certificates, not area.

## Nordic organic evidence-pack core series

- **Records**: Staged organic market, control/operator, public kitchen, policy, selected production and selected trade indicators for Nordic comparison
- **Source**: `research/evidence-pack/okologisk-norden-2026-04-29/`, with split series in `research/data/nordic/core-series/`
- **Files**: `organic_market_retail_annual.csv`, `organic_control_operators_annual.csv`, `organic_public_procurement_annual.csv`, `organic_policy_targets.csv`, `organic_selected_production_annual.csv`, `organic_selected_trade_annual.csv`
- **Staging**: `research/data/nordic/core-series/_staging/organic_integration_candidates_2026-04-29.csv`
- **Reproduce**: Start from `research/evidence-pack/okologisk-norden-2026-04-29/exports/organic_key_indicators_extracted.csv`; preserve `quality_flag`, `import_status`, `comparability`, source URL and source reference on every row
- **Updated**: 2026-04-29
- **Limitations**: These series supplement, but do not replace, the Eurostat `organic_agriculture_annual.csv` backbone. Norway 2025 rows now use the downloaded Landbruksdirektoratet report PDF where extracted. Iceland now has Tún/TRACES current operator-certificate rows, Hagstofa/PxWeb gap documentation, a Lífrænt Ísland actor-map extract and a 2040 policy target, but area/market remains `needs_primary_check`. Sweden now includes KRAV private-label rows and Ekomatcentrum/KRAV public-procurement rows; downstream views must keep official statistics, private-label metrics, municipal shares, public-sector value shares and meal/volume context separate. Sector, survey and public kitchen rows are not directly comparable unless metric, unit and scope match.

## stores.json

- **Records**: 3,849 grocery store locations
- **Source**: Overpass API (OpenStreetMap) — queried for `shop=supermarket` and `shop=convenience` within Norway
- **Reproduce**: `[out:json];area["ISO3166-1"="NO"]->.a;(node["shop"="supermarket"](area.a);node["shop"="convenience"](area.a););out body;`
- **Updated**: 2024-Q4
- **Limitations**: OSM coverage varies by region. Some stores may be missing or closed. Chain attribution based on `brand` tag.

## municipalities.json

- **Records**: 357 municipalities with demographics
- **Source**: SSB Tabell 07459 (befolkning), Geonorge administrative enheter, SSB Tabell 06944 (inntekt), SSB Tabell 09747 (husholdninger)
- **Reproduce**: SSB API with municipality-level queries. Geonorge WFS for administrative boundaries.
- **Updated**: 2024
- **Limitations**: Median income is 2022 data. Age distribution rounded to 1 decimal.

## norway-municipalities.geojson

- **Records**: 357 municipality boundary polygons
- **Source**: Geonorge — Kartverket administrative enheter
- **Reproduce**: Download from geonorge.no, simplify with mapshaper (`-simplify 10%`)
- **Updated**: 2024
- **Limitations**: Simplified geometry for web performance. Not suitable for precise area calculations.

## aquaculture_sites.geojson

- **Records**: 1,782 aquaculture sites
- **Source**: Fiskeridirektoratet Akvakulturregisteret
- **Reproduce**: Download from fiskeridir.no/Akvakultur/Registre-og-skjema/Akvakulturregisteret
- **Updated**: 2024
- **Limitations**: All sites are active (cleared). Capacity values are permitted, not actual production, and use mixed units. On `/kart/no` the database adds owner fields (company, orgnr) to matching sites; it no longer replaces this file.

## no/processing-establishments.geojson

- **Records**: 1,343 approved food establishments on land as points, plus 414 counted per municipality (`kommuneCounts`); 2,059 approvals read, 282 vessel-only and 20 without a location excluded
- **Source**: Mattilsynet approved-establishment lists (food sections 0–12 and fishery products), geocoded against Kartverket Matrikkelen addresses (CC BY 4.0) and resolved to Brønnøysundregistrene Enhetsregisteret (NLOD). Source URLs, download times and SHA-256 hashes are in `_meta.sources`.
- **Reproduce**: `npm run fetch:processing-establishments` (raw downloads go to the gitignored `tmp/kart-cache/`)
- **Updated**: 2026-09-14
- **Limitations**: Only Mattilsynet-approved establishments (animal products and general activity), not every food producer. 311 points use the postnummer centroid and 9 a place name. Sole proprietorships (238) and establishments without a unique Enhetsregisteret match (176) appear only as municipality counts because the repository is public. Mattilsynet states no licence for the lists; reproduced with attribution (owner decision 2026-09-14).

## no/ports-register.geojson

- **Records**: 766 fishing harbours (`kind: fishing-harbour`) and 634 ISPS port facilities (`kind: port-facility`)
- **Source**: Kystverket WFS `https://services.kystverket.no/wfs.ashx` — `layer_1077` Fiskerihavner and `layer_420` ISPS havneanlegg (both NLOD 2.0 per Geonorge metadata), converted from UTM 33N (EPSG:32633) to WGS84. Place name and municipality from the nearest Kartverket Matrikkelen address (CC BY 4.0). Source URLs, download times and SHA-256 hashes are in `_meta.sources`.
- **Reproduce**: `npm run fetch:ports-register`
- **Updated**: 2026-09-14
- **Limitations**: Fishing harbours carry no name in the register; they are labelled with the nearest poststed (median 162 m to the nearest address; 8 have no address within 5 km). ISPS facilities serve international shipping, including oil and gas terminals. Owner names are published only for public owners or owners with a legal form (534 of 634). No tonnage — landing volumes are a later slice.

## no/flow-nodes.json

- **Records**: 23 illustrative node positions used by the `/kart/no/flow` prototype
- **Source**: Copied on 2026-09-14 from the retired hand-curated `ports.geojson` and `logistics_hubs.geojson`, so the prototype's edges in `no/flows.json` keep their ids
- **Limitations**: **Illustrative.** Positions and names are not register data.

## no/wholesale-logistics.geojson

- **Records**: 203 sites as points: 197 food wholesale (NACE 46.3) and 6 food-related warehousing (52.1). 204 sub-units selected from 863,142 read; 1 without a location excluded.
- **Source**: Brønnøysundregistrene Enhetsregisteret bulk `underenheter` and `enheter` CSV (NLOD). Street addresses are geocoded against Kartverket Matrikkelen addresses (CC BY 4.0). Source URLs, download times and SHA-256 hashes are in `_meta.sources`; the selection rule is in `_meta.selection`.
- **Reproduce**: `npm run fetch:wholesale-logistics` (raw downloads go to the gitignored `tmp/kart-cache/`)
- **Updated**: 2026-09-14
- **Selection**: Active sub-units (no `nedleggelsesdato`) with at least 20 employees and `naeringskode1` in 46.3 or 52.1. Tobacco wholesale (46.35) is excluded. Warehousing counts only when the parent's NACE code is food-related (03, 10, 11, 46.3, 47.1, 47.2, 56) or the sub-unit or parent name names cold, frozen or food storage; 25 general third-party warehouses are excluded.
- **Limitations**: The NACE code describes the business, not the site. The layer therefore includes sales offices and headquarters, such as beverage and coffee importers, next to distribution centres. Large grocery warehouses registered under other codes are missing, e.g. Coop's Langhus warehouse (46.49). 16 points use the postnummer centroid. Every parent is a company or cooperative (AS, SA, DA), so `kommuneCounts` is empty.

## no/farm-foretak-by-kommune.json

- **Records**: 53,933 registered agricultural foretak across 354 municipalities (counts only)
- **Source**: Landbruksdirektoratet open data — `datasets/foretak/dataset_extended.csv` (GitHub `LandbruksdirektoratetGIT/opendata`)
- **Reproduce**: `npm run fetch:farm-foretak` (downloads the CSV, counts unique orgnr per KOMNR, places each municipality at its boundary centroid)
- **Updated**: 2026-09-14
- **Limitations**: Registered foretak, not active farms (SSB reports 36,627 for 2025). A foretak spanning several municipalities counts once, where it first appears. Only per-municipality counts are published because the register identifies sole proprietors.

## farms.geojson

- **Not used by `/kart/no`** since the map switched to `no/farm-foretak-by-kommune.json`.
- **Records**: 50 farm locations
- **Source**: Synthetic example data for visualization — not actual farms
- **Reproduce**: Generated programmatically for demo purposes
- **Updated**: 2024
- **Limitations**: **Synthetic data.** Does not represent real farm locations, sizes, or production. For visualization only.

## chart-metrics.json

- **Records**: Computed metrics (parent company shares, Lorenz curve, Zipf distribution)
- **Source**: Derived from `stores.json` and `municipalities.json` via `scripts/compute-chart-metrics.ts`
- **Reproduce**: `npx tsx scripts/compute-chart-metrics.ts`
- **Updated**: Regenerated on demand
- **Limitations**: Depends on PIP (point-in-polygon) assignment accuracy. Gini coefficient sensitive to municipality boundary precision.
