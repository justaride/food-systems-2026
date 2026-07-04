# Nordic Financials Backfill 2026-07-02

## Scope

Master-plan row 11 controls the SE/DK major-company backfill in `CompanyFinancial` and source-locator coverage. The live DB already contained 2020-2024 rows for ICA Gruppen, Axfood, Coop Sverige/KF, Salling Group, Coop Danmark, REMA 1000 Denmark, Kesko, S Group, Hagar and Samkaup before this pass. This pass adds official 2025 rows for the SE/DK majors only.

## FX Method

Non-NOK source figures are converted to MNOK using Norges Bank 2025 daily EXR observations, arithmetic average over 251 observations:

| Currency | API series | NOK per 1 | Evidence file |
|---|---:|---:|---|
| SEK | `EXR/B.SEK.NOK.SP` | 1.05883984 | `research/data/nordic/fx/norges-bank-2025-average-rates-2026-07-02.json` |
| DKK | `EXR/B.DKK.NOK.SP` | 1.57002151 | `research/data/nordic/fx/norges-bank-2025-average-rates-2026-07-02.json` |

REMA 1000 Denmark is reported directly in NOK in Reitan Retail Annual Report 2025 and is not FX-converted.

## Imported Rows

| Company | Org.nr | Source-currency figure | MNOK revenue | MNOK operating result | Margin | Source locator |
|---|---|---:|---:|---:|---:|---|
| ICA Gruppen AB | `SE-556048-2837` | SEK 142,403m net sales; SEK 5,408m operating profit excl. items | 150,781.97 | 5,726.21 | 3.80% | `https://www.icagruppen.se/en/annual-report-2025/` |
| Axfood AB | `SE-556542-5353` | SEK 89,152m net sales; SEK 3,572m adjusted operating profit | 94,397.69 | 3,782.18 | 4.01% | `https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-20252/` |
| Coop Sverige AB / KF | `SE-702001-3469` | SEK 36,377m net sales; SEK -305m operating result | 38,517.42 | -322.95 | -0.84% | `https://kf.se/wp-content/uploads/2026/03/kf-arsredovisning-2025.pdf` |
| Salling Group A/S | `DK-35954716` | DKK 83,168m revenue; DKK 3,245m EBIT | 130,575.55 | 5,094.72 | 3.90% | `https://sallinggroup.com/en/stores/key-figures` |
| Coop Danmark A/S | `DK-26259495` | DKK 32,565m net sales; DKK -215m operating result | 51,127.75 | -337.55 | -0.66% | `https://coop.dk/media/hv1lo4bk/coop-danmark-aarsrapport-2025.pdf` |
| REMA 1000 A/S | `DK-14705627` | NOK 45,239m revenue; NOK 1,518m operating profit | 45,239.00 | 1,518.00 | 3.36% | `https://www.reitanretail.no/en/about/reports` |

## Caveats

- Coop Sverige/KF 2025 is an official KF group row, not a reconstructed all-coop systemwide row. It is therefore citable but should be labelled as KF group/accounting scope when used in narrative comparisons.
- Salling 2025 uses the official key-figures page because it exposes the current revenue and EBIT table directly.
- Reitan Retail reports REMA 1000 Denmark segment figures in NOK; the segment table is used instead of the older market-share estimate rows.
- FI/IS 2025 rows were not added in this SE/DK session. The program-level WS3 minimum of at least four years is already met for Kesko, S Group, Hagar and Samkaup by the existing 2020-2024 series.

## Verification

Passed 2026-07-02:

- `DATABASE_URL=... node --import=tsx scripts/import-nordic-financials-2025.ts` imported six 2025 SE/DK rows.
- Live DB readback confirmed six 2025 rows with `verificationStatus = human_verified`, reporting currency, FX rate and source text.
- `node --import=tsx --test tests/lib/row-source-locators.test.ts` passed: 28 tests.
- `DATABASE_URL=... npm run audit:citable` passed; `CompanyFinancial.source` coverage is 311/311 with resolved locators, and the readiness queue remains the known P2:1.

Remaining final gates for this broader branch are run from the master plan closeout, not this note alone.
