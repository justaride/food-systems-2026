# Fase 5A — HI-kilderekkefølge / metrics-forslag

Kilder som ligger direkte til grunn:
- `research/evidence-pack/forskningsinstitutt/hi-nettrapporter/risikorapport-fiskeoppdrett-2024.md`
- `research/evidence-pack/forskningsinstitutt/hi-nettrapporter/risikorapport-fiskeoppdrett-2025.md`
- `research/evidence-pack/forskningsinstitutt/hi-nettrapporter/ressursoversikt-2026.md`
- `research/analyse/pdf-gjennomgang-forskningsinstitutt.md`

## 1) Konkrete updates i `public/data/food-systems/no/chart-metrics.json`

Legg til ett nytt top-level objekt for maritim sektor (f.eks. `aquacultureAndMarine`), med **snapshot 2024–2025**. Foreslåtte felt:

- `aquacultureAndMarine.year`: `2025` (snapshot)
- `aquacultureAndMarine.output.laks_export_tonnes`: `1251000`
- `aquacultureAndMarine.output.laks_export_value_nok_bil`: `122.58`
- `aquacultureAndMarine.output.regnbueoerret_export_tonnes`: `75155`
- `aquacultureAndMarine.output.regnbueoerret_export_value_nok_bil`: `6.76`
- `aquacultureAndMarine.output.total_production_tonnes`: `1.65` (">1,65 mill. tonn")
- `aquacultureAndMarine.output.standing_biomass_million_fish`: `458`

- `aquacultureAndMarine.welfareAndLoss.annual_mortality_million`: `60`
- `aquacultureAndMarine.welfareAndLoss.annual_mortality_rate_pct`: `16`
- `aquacultureAndMarine.welfareAndLoss.mortality_target_pct`: `<5`
- `aquacultureAndMarine.welfareAndLoss.mortality_region_pct`: `{ west_areas: "17-18", north_areas: "13-14" }`
- `aquacultureAndMarine.welfareAndLoss.salmon_cohorts.annual_mortality_by_age`: `{"2023":65, "2024":60}`

- `aquacultureAndMarine.environmental.kobber_tonners`: `{"2019":1698, "2023":306}`
- `aquacultureAndMarine.environmental.kobber_reduction_pct_2019_to_2023`: `82`
- `aquacultureAndMarine.environmental.tralopyril_tonners_2019_vs_2023`: `{ "2019": 53, "2023": 116 }`
- `aquacultureAndMarine.environmental.pd_cases_2024`: `46`
- `aquacultureAndMarine.environmental.ila_cases_2024`: `13`

- `aquacultureAndMarine.genetics.studied_wild_stocks`: `250`
- `aquacultureAndMarine.genetics.stocks_showing_change_share`: `0.67`
- `aquacultureAndMarine.genetics.very_bad_status_share_gt10pct`: `0.33`
- `aquacultureAndMarine.genetics.escape_events_2024_25_fish`: `42000`

- `aquacultureAndMarine.marineResources.biomass_trend_tonnes`: `{ "2013": 35000000, "2025": "lowest_record_level" }`
- `aquacultureAndMarine.marineResources.stocks_green_3criteria`: `5`
- `aquacultureAndMarine.marineResources.stocks_total_assessed`: `46`
- `aquacultureAndMarine.marineResources.sea_surface_temp_anomaly_c`: `0.5-2.5`
- `aquacultureAndMarine.marineResources.critical_stocks`: `["mackerel", "nordostarktisk_torsk"]`
- `aquacultureAndMarine.marineResources.shellfish_growth.trawl`: `80000` (årsnivå `2023-2025`)
- `aquacultureAndMarine.marineResources.shellfish_growth.snow_crab`: `13000` (`2025`)

## 2) Sekundære oppdateringer (om de brukes i andre metric-komponenter)

Hvis akvakultur vises i value-chain i stedet for chart-metrics:

- `public/data/food-systems/no/value-chain.json` → `steps` med `id: "seafood"`
  - legg inn/oppdater `breakdown`-felter:
    - `aquaculture_export_tonnes_2024`: `1251000`
    - `rainbow_trout_export_tonnes_2024`: `75155`
    - `standing_biomass_million_fish_2024`: `458`
    - `production_tonnes_2024`: `1650000`
  - legg inn ny blokk `acquired_risk_snapshot` med:
    - `annual_mortality_million_2024: 60`
    - `avg_mortality_pct_2024: 16`
    - `pd_cases_2024: 46`

## 3) Kvalitetsnotat

- 2024-tallene i 2025-rapporten er nyere og bør prioriteres for alle *nå-situasjon* felter.
- `2019` og `2023` kobbertall bør merkes som trend-basert serie (ikke sammenblandes med dødelighetstall fra 2024) i dashboardetiketter.
