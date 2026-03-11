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
- **Limitations**: Includes both active and inactive sites. Capacity values are permitted, not actual production.

## processing_plants.geojson

- **Records**: 30 food processing facilities
- **Source**: Nortura, Tine, BAMA, Orkla, Lerøy, Mowi — curated from public annual reports and company websites
- **Reproduce**: Manual curation from corporate sites. Coordinates geocoded from addresses.
- **Updated**: 2024-Q1
- **Limitations**: Not exhaustive. Focuses on major players. Capacity figures are approximate.

## ports.geojson

- **Records**: 25 fishing and import ports
- **Source**: Fiskeridirektoratet, Kystverket — curated from public registers
- **Reproduce**: Fiskeridirektoratet landing statistics, Kystverket port registry
- **Updated**: 2024
- **Limitations**: Annual tonnage is approximate. Only includes ports with significant food-related traffic.

## logistics_hubs.geojson

- **Records**: 19 distribution centers
- **Source**: ASKO (NorgesGruppen), Coop Logistikk, Rema Distribusjon — curated from annual reports and industry sources
- **Reproduce**: Corporate annual reports and press releases. Coordinates geocoded from addresses.
- **Updated**: 2024
- **Limitations**: Capacity and stores-served figures are approximate. Smaller regional hubs may be missing.

## farms.geojson

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
