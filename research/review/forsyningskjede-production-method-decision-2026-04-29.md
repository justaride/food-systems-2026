# Forsyningskjede Production Method Decision

Dato: 2026-04-29

## Decision

- Direct oats lane: NO, SE and FI only.
- Caveated proxy lane: DK HST77 H170, labelled as `Oats, mixed grains and other grains`, not pure oats.
- Seafood-first lane: IS wild catch plus aquaculture, with agriculture supplement shown separately.
- Do not merge DK/IS proxy lanes into the same visual series as NO/SE/FI direct oats.
- Do not import DK/IS proxy rows into `production_annual_first_panel.csv` until a canonical schema for proxy lanes exists.

## Display Rule

Every visual must expose `series_type`:

- `direct_commodity_series`
- `caveated_proxy_series`
- `country_specific_basket`
- `context_only`

## Current Use

- Use `research/review/forsyningskjede-production-series-parity-2026-04-29.csv` as the working parity summary.
- Use `research/review/forsyningskjede-production-proxy-candidates-2026-04-29.csv` as source-level evidence.

## Implications

- NO, SE and FI can be shown together only as a narrow direct oats subgroup, not as full production parity.
- DK HST77 H170 can be displayed beside the direct oats subgroup only when visually separated and caveated as a proxy for mixed grains and other grains.
- IS should be displayed as a country-specific seafood-first production basket, with agriculture supplement and oats context separated from the direct oats lane.
- `production_annual_first_panel.csv` remains the direct/core production panel until a proxy-lane schema is explicitly added.
