# Forsyningskjede Display Contract

Dato: 2026-04-29  
Status: arbeidskontrakt før UI-endringer

## Decision

`/forsyningskjede` skal vise nordisk like-dekning som statuslag, ikke som om alle land har samme datakvalitet. Siden kan bruke eksisterende runtime-data, men alle nye nordiske sammenligninger må eksponere kilde-/metodestatus fra ledger og review-filer før de presenteres som beslutningsklare.

Ingen UI-endringer skal gjøres før hvert synlig komponentfelt under er bundet til en konkret datafil eller eksplisitt merket som manuelt reviewlag.

## Visible Status Lanes

Disse statusene skal brukes på tvers av landkort, tabeller og figurer:

- `validated`: primær/offentlig kilde eller intern DB-kilde er kontrollert og sammenlignbarhetsgrensen er dokumentert.
- `primary_snapshot`: primærkilde er identifisert og snapshot er registrert, men metoden er ennå ikke full canonical/runtime.
- `proxy_model`: serien eller objektet er en modell/proxy og må visualiseres separat fra direkte observasjoner.
- `local_research_needs_primary_check`: funnet kommer fra lokale notater, country pack eller lokal JSON og må sjekkes mot primærkilde før import/ekstern bruk.
- `missing`: datalag finnes ikke, eller det finnes ikke en sammenlignbar metode for landet.

Mapping fra eksisterende reviewfelter:

| Review/status input | Display lane |
| --- | --- |
| `ready_to_use`, `validated`, `closed_for_annual_panel` | `validated` |
| `primary_snapshot_confirmed`, `partial_primary_snapshot`, `method_decision_recorded` | `primary_snapshot` |
| `proxy`, `proxy_model`, `estimated`, `method_decision_recorded` when not canonical | `proxy_model` |
| `needs_primary_check`, `local_research_needs_primary_check`, `needs_harmonization`, `in_progress` | `local_research_needs_primary_check` |
| `missing`, `not_started` | `missing` |

If a record matches both `primary_snapshot` and `proxy_model`, the UI must show both: source status as `primary_snapshot` and method status as `proxy_model`.

## Country Card Contract

Each country card must show the same six rows:

1. Value-chain coverage
2. Import panel status
3. Production method status
4. Relationship count/status
5. Circularity/nutrient status
6. Top unresolved PCQ rows

### 1. Value-chain Coverage

Primary source:

- `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`
- `public/data/food-systems/{no,se,dk,fi,is}/value-chain.json`
- `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`

Visible fields:

- target step count, normally `8/8`
- display lane based on `review_status`
- missing volume/waste warning from ledger notes
- unresolved PCQ rows for value-chain domains

Rule:

- `8/8` structural coverage is not the same as `validated`.
- IS processing/distribution/HORECA/household and SE/DK/FI seafood stay in `local_research_needs_primary_check` until PCQ rows close.

### 2. Import Panel Status

Primary source:

- `research/data/nordic/trade-groups/normalized/trade-group-imports-annual.csv`
- `research/review/forsyningskjede-import-vulnerability-cards-2026-04-29.csv`
- `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`

Visible fields:

- latest year
- row count or six-group completeness
- top import group
- comparability caveat

Rule:

- Annual import panel may show `validated` for all five countries.
- Monthly panel gaps must not downgrade annual import cards, but must be shown if a monthly view is added.

### 3. Production Method Status

Primary source:

- `research/review/forsyningskjede-production-method-decision-2026-04-29.md`
- `research/review/forsyningskjede-production-series-parity-2026-04-29.csv`
- `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv`
- `research/data/nordic/core-series/production_annual_first_panel.csv`

Visible fields:

- `series_type`
- latest period
- latest value/unit
- method caveat
- import/canonical status

Allowed `series_type` values:

- `direct_commodity_series`
- `caveated_proxy_series`
- `country_specific_basket`
- `context_only`

Country rules:

- NO, SE and FI: direct oats lane only.
- DK: HST77 H170 may be shown only as `caveated_proxy_series` labelled `Oats, mixed grains and other grains`.
- IS: wild catch plus aquaculture is `country_specific_basket`; agriculture supplement is separate; oats is `context_only`.
- DK/IS proxy rows must not be displayed as if they are canonical rows from `production_annual_first_panel.csv`.

### 4. Relationship Count/Status

Primary source:

- `research/review/supply-chain-relationships-nordic-review-2026-04-29.csv`
- existing runtime query in `src/lib/queries/supply-chain.ts`
- later, after approval only: `BusinessRelationship`

Visible fields:

- reviewed candidate count per country
- `ready_for_import` count
- `needs_primary_check` count
- `needs_actor_validation` count
- `hold`/`reject_archive` count

Allowed review statuses:

- `ready_for_import`
- `needs_primary_check`
- `needs_actor_validation`
- `hold`
- `reject_archive`

Rule:

- Existing runtime graph can stay visible, but the Nordic parity card must be driven by the review file until country counts reach target.
- A relationship cannot be counted as import-ready without source URL or local source path, source owner, relationship type, direction, confidence and caveat where inferred.

### 5. Circularity/Nutrient Status

Primary source:

- `public/data/food-systems/circularity-loops.json`
- `public/data/food-systems/nutrient-flows.json`
- `docs/project/forsyningskjede-country-packs/{no,se,dk,fi,is}.md`
- `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv`

Visible fields:

- country-specific loop count
- shared Nordic loop count, separate from country-specific count
- nutrient model present/missing
- method confidence/caveat

Rule:

- Shared Nordic records cannot be counted as country-specific case parity.
- IS remains `missing` for circularity and nutrient until three cases or an explicit non-comparable gap note is recorded.

### 6. Top Unresolved PCQ Rows

Primary source:

- `research/review/forsyningskjede-primary-source-check-queue-2026-04-29.csv`

Visible fields:

- highest priority open PCQ row IDs
- domain
- target item
- review status
- import impact

Rule:

- Show P0 before P1/P2.
- Exclude closed annual-panel rows unless the card is specifically about import methodology.

## Component Data Binding

| UI component | Data source now | Required before parity claim |
| --- | --- | --- |
| Norway primary producer deliveries | `DeliveryVolume` through `getPrimaryProducerDeliveries()` | Keep Norway-only method note visible |
| Supply-chain graph | `BusinessRelationship` through `getSupplyChainGraph()` | Review-file parity counts for SE/DK/FI/IS before Nordic graph claim |
| Data quality strip | `getSupplyChainDataQuality()` plus ledger | Add visible country/method lane rollup |
| Import vulnerability | `trade-group-imports-annual.csv` through `getImportVulnerabilityData()` | Use annual panel only unless monthly scope is explicit |
| Circular return flows | `circularity-loops.json` and `nutrient-flows.json` through `getCircularReturnFlowData()` | Separate country-specific, shared Nordic, and proxy model rows |
| Infrastructure | geojson/local JSON through `getInfrastructureData()` | Country, source_ref, confidence and last_verified per node |
| Production parity | review CSVs, not current UI canonical series | Add `series_type` before rendering cross-country production |

## Hold On UI Edits

Do not modify `src/app/forsyningskjede/ForsyningskjedeContent.tsx`, `src/app/forsyningskjede/page.tsx` or `src/lib/queries/supply-chain.ts` for this contract until the project accepts:

- the five display lanes
- the `series_type` values for production
- the six-row country card structure
- the review-file-driven relationship parity rule

## Immediate Implementation Queue After Acceptance

1. Add a small parser for `docs/project/analysis/forsyningskjede-nordic-coverage-ledger-2026-04-29.csv` and PCQ rows.
2. Add a country status DTO that computes the six country-card rows without changing canonical data.
3. Render status lanes in `/forsyningskjede` before any new visual comparison.
4. Add production parity display only after `series_type` is present in the view model.
