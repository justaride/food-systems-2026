---
tittel: Nordic C1 retail-concentration — local readback
dato: 2026-09-04
gate: internal
cellId: retail-concentration
pass: nordic-c1-retail-concentration-2026-09-04
source: CountryMetric (hhi, retailerShare, margin)
---

# Nordic C1 retail-concentration — local readback

Internal fill from existing `CountryMetric` rows via
`scripts/backfill-nordic-c1-retail-concentration.ts`. No new external claims.
No Norway actor imports.

## Method

| indicatorId | Derivation |
|---|---|
| `hhi` | Latest `CountryMetric` `metricType=hhi` (prefer category `dagligvare`) |
| `cr3` | Sum of top-3 `retailerShare` for latest year, excluding residual labels (`Andre` / `Övriga` / `Muut` / …) — quality `modelled` |
| `margin_top1..3` | Rank retailer `margin` rows for latest FY; skip non-banner rows (e.g. NO `Leverandører`) |
| `margin_banner_*` | Same margin rows, one indicator per banner slug |

## Core table (local DB after `--apply`)

| Country | HHI (2024) | CR3 % (2024) | margin_top1 | margin_top2 | margin_top3 |
|---|---:|---:|---|---|---|
| NO | 3327 | 96.6 | Rema 3.85 (2024) | NG 3.30 | Coop 1.00 |
| SE | 3339 | 88.1 | Axfood 4.01 (2025) | ICA 3.80 | Coop -0.84 |
| DK | 2642 | 87.0 | Salling 3.90 (2025) | REMA 3.36 | Coop -0.66 |
| FI | 3671 | 91.9 | Kesko 5.50 (2024) | SOK 3.50 | **hole** |
| IS | 2378 | 76.5 | Hagar 5.78 (2024) | **hole** | **hole** |

## Holes (dated, not proxied)

1. FI `margin_top3` 2024 — fewer than 3 retailer margin CountryMetric rows.
2. IS `margin_top2` / `margin_top3` 2024 — panel incomplete (Samkaup operating margin missing).

## Counts

- Source CountryMetric rows considered: 86
- NordicIndicatorRow planned/written: 37
- With values: 34
- Holes: 3

## Commands

```bash
npx tsx scripts/backfill-nordic-c1-retail-concentration.ts
npx tsx scripts/backfill-nordic-c1-retail-concentration.ts --apply
```

## Next

- Partner table-level readback only after IG-005 if leaving the team.
- Do not treat CR3 as independently audited where sources are owner/market reports — quality stays `modelled`.
- C2/C3 flow fills remain separate workstreams.
