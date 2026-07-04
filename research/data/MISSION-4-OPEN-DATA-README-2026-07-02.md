# Mission 4 Open Data README 2026-07-02

Status: controlled inventory of existing open-data artifacts, not a fresh full refetch.

## Scope

This README closes the WS4.3 routing gap in `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md`: the Mission 4 desk-executable open-data package is already mostly present under `research/data/`, but lacked one reader-facing map from requirement to files.

## File Map

| Requirement | Current artifact | Source status | Use rule |
|---|---|---|---|
| SSB 08801 import series | `research/data/nordic/trade-groups/raw-json/no-food-group-imports-annual.json`; `research/data/nordic/trade-groups/raw-json/no-food-group-imports-by-partner-annual.json`; `research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv`; `research/data/nordic/trade-groups/normalized/intra-nordic-food-import-share-annual.csv` | Present. Run summary says Norway uses SSB 08801, annual, detailed commodity-number aggregation, coverage 2015-2025. | Use within-country shares and trends; do not compare currency levels across countries. |
| DST trade tables | `research/data/nordic/trade-groups/raw-json/dk-food-group-imports-monthly.json`; `research/data/nordic/trade-groups/raw-json/dk-food-group-imports-by-partner-monthly.json` | Present via StatBank SITC2R4, coverage 2022-2026 in v1 package. | Denmark starts later than NO/SE/FI/IS; show coverage caveat. |
| SCB trade tables | `research/data/nordic/trade-groups/raw-json/se-food-group-imports-monthly.json`; `research/data/nordic/trade-groups/raw-json/se-food-group-imports-by-partner-annual.json` | Present via SCB import tables, coverage 2015-2025. | Use as Swedish import-trend/partner-share source with classification caveat. |
| Luke trade tables | `research/data/nordic/trade-groups/raw-json/fi-food-group-imports-monthly.json`; `research/data/nordic/trade-groups/raw-json/fi-food-group-imports-by-partner-monthly.json` | Present via Luke agri-food foreign trade table, coverage 2015-2024 in v1 package. | Finland latest year trails some other countries; mark year boundary. |
| Statistics Iceland trade tables | `research/data/nordic/trade-groups/raw-json/is-food-group-imports-monthly.json`; `research/data/nordic/trade-groups/normalized/is-intra-nordic-food-import-share-annual.csv` | Present via UTA06201, coverage 2015-2026 in v1 package. | Import-only package; Iceland panel exists for grouped food imports and intra-Nordic shares. |
| NIBIO self-sufficiency method note | `research/_plans/self-sufficiency-seafood-adjusted-method-note-2026-05-15.md`; `research/data/nordic/self-sufficiency/` | Present as method/scenario package, plus `R13-PROT-007` 2026-07-02 control note for current NIBIO 2025 figures. | Keep raw, feed-adjusted, seafood-adjusted, and protein-specific concepts separate. |
| Nordic source registry metadata | `research/data/nordic/registry-metadata/manifest.csv`; `research/data/nordic/registry-metadata/run-summary.json` | Present. March 2026 run selected 54 high-priority API sources; 45 fetched/ready, 6 query-required, 3 auth-required. | Use as source-discovery map, not as evidence that every table was fetched. |
| Analysis panel | `research/data/nordic/analysis-panel/nordic_harmonized_panel.csv`; `research/data/nordic/analysis-panel/panel_manifest.json` | Present. March 2026 panel has HICP food prices, first trade and production series. | Use `level_comparable`, `index_only`, and `fallback_only` flags as comparison gates. |
| Municipal-HHI / food-desert inputs | `research/data/nordic/municipal-hhi/municipal-hhi-store-count-proxy-2026-04-29.csv`; `research/data/food-access-nordisk-metoder.json` | Present as proxy/method inputs. | Store-count HHI is proxy, not turnover-HHI; food-access methods are method inventory, not completed desert map. |

## Current Gaps

- No fresh 2026-07-02 refetch was run for the full Nordic trade panel in this pass; this README inventories and controls existing artifacts.
- Denmark starts in 2022 in the v1 trade package, while Norway/Sweden/Finland/Iceland have longer windows.
- Finland trade-group package currently ends at 2024 in the v1 run summary.
- Registry metadata still has 6 `query_required` and 3 `auth_required` API sources from the March 2026 discovery run.
- Food-desert analysis is not complete; available files are proxy/method inputs for later modelling.

## Verification 2026-07-02

- `research/data/nordic/trade-groups/README.md` and `run-summary.json` inspected.
- `research/data/nordic/registry-metadata/run-summary.json` inspected.
- `research/data/nordic/analysis-panel/panel_manifest.json` inspected.
- Current WS4.3 status: open-data package is discoverable and method-gated; future work is fresh refetch plus analysis, not locating the initial files.
