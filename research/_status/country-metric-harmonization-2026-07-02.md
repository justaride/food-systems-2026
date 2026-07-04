# CountryMetric harmonization - WS3 control pass (2026-07-02)

## Scope

This pass controls the WS3 CountryMetric harmonization gap from `research/_plans/MASTER-RESEARCH-PLAN-2026-07-01.md`: fill self-sufficiency, market-share/retailer-share/HHI, and margin rows with explicit method labels, and add missing Nordic margin cells where the DB already has citable `CompanyFinancial` numerator/denominator or operating-margin evidence.

The pass uses the local Postgres database at the repo default connection (`postgresql://foodsystems:foodsystems@localhost:5432/foodsystems?schema=public`) and is rerunnable through:

```bash
npm run db:backfill:country-metric-harmonization
```

## Files added/changed

- Added `scripts/backfill-country-metric-harmonization.ts`
- Added package script `db:backfill:country-metric-harmonization`

## Live DB results

Backfill output:

```json
{
  "derivedMarginRowsImported": 9,
  "derivedMarginRowsSkipped": [],
  "countryMetricRowsLabelled": 160,
  "methodLabelVerifiedRows": 160
}
```

Readback after import:

| Country | selfSufficiency | marketShare | retailerShare | hhi | margin |
| :--- | ---: | ---: | ---: | ---: | ---: |
| DK | 7 | 4 | 12 | 2 | 3 |
| FI | 7 | 4 | 8 | 2 | 2 |
| IS | 11 | 3 | 10 | 2 | 1 |
| NO | 24 | 3 | 20 | 5 | 4 |
| SE | 7 | 4 | 10 | 2 | 3 |

Verification query returned `MISSING_METHOD_LABELS 0` for all 160 relevant rows (`selfSufficiency`, `marketShare`, `retailerShare`, `hhi`, `margin`).

## Margin rows added

| Country | Row | Year | Margin % | Source basis |
| :--- | :--- | ---: | ---: | :--- |
| DK | Coop Danmark A/S | 2025 | -0.66 | `CompanyFinancial` row from Coop Danmark Annual Report 2025 |
| DK | REMA 1000 A/S | 2025 | 3.36 | `CompanyFinancial` row from Reitan Retail Annual Report 2025 segment data |
| DK | Salling Group A/S | 2025 | 3.90 | `CompanyFinancial` row from Salling Group Key Figures 2025 |
| FI | Kesko Oyj | 2024 | 5.50 | `CompanyFinancial` row from Kesko Annual Report 2024 |
| FI | SOK (S Group) | 2024 | 3.50 | `CompanyFinancial.operatingMargin` from SOK 2024 financial-results row |
| IS | Hagar hf | 2024 | 5.79 | Calculated from `CompanyFinancial` revenue and operating result for Hagar 2024 |
| SE | Axfood AB | 2025 | 4.01 | `CompanyFinancial` row from Axfood Annual and Sustainability Report 2025 |
| SE | Coop Sverige AB | 2025 | -0.84 | `CompanyFinancial` row from Coop Sverige/KF Annual Report 2025 |
| SE | ICA Gruppen AB | 2025 | 3.80 | `CompanyFinancial` row from ICA Gruppen Annual Report 2025 |

## Caveats

- Samkaup hf remains intentionally absent from CountryMetric margin because the live `CompanyFinancial` rows have no operating-result or operating-margin field to use.
- Iceland therefore has one public margin row (Hagar) rather than a complete retailer panel.
- Some self-sufficiency and format-share source labels remain lower-confidence or blocked in source-locator audits; this pass controls method labeling, not full source uplift for every older label.
- Fish/seafood self-sufficiency rows are labeled `seafood_or_fish_self_sufficiency_percent_not_feed_adjusted`; do not mix them with feed-adjusted caloric self-sufficiency claims without the separate seafood-adjusted method note.

## Verification

- `DATABASE_URL=... node --import=tsx scripts/backfill-country-metric-harmonization.ts` passed.
- `DATABASE_URL=... npm run db:backfill:country-metric-harmonization` passed.
- DB readback confirmed margin rows by country and `MISSING_METHOD_LABELS 0`.
- `node --import=tsx --test tests/lib/row-source-locators.test.ts` passed: 28 tests.
- `npm run lint` passed.
- `DATABASE_URL=... npm run audit:citable` passed. Known readiness queue remains P2:1.
- `npm run audit:research-artifacts -- --base=origin/main` passed: 0 violations across 3342 tracked files.
- `git diff --check` passed.
