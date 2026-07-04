# Remediation URL Health Review 2026-07-02

## Scope

Master-plan row 12 is controlled as a URL-health remediation slice. This pass does not claim to close the full WS5 backlog or the large `mvk-review-koe` human-role queue. It closes machine-defensible URL-health rows where the repo already had local/restored evidence for the same blocked Norden/NMR URL.

## Review Actions

Added 11 rows to `research/URL-HEALTH-REVIEW.csv` with `decision = citable_mirror_or_local_evidence`:

| Source | Blocked URL | Local or alternate evidence |
|---|---|---|
| `report_canonical:nnr2023-nordic-nutrition-recommendations` | `https://pub.norden.org/nord2023-003/` | `research/bibliotek/nordisk/nnr2023-nordic-nutrition-recommendations.md` plus direct PDF URL |
| `report_canonical:normo-2025-nordic-monitoring` | `https://www.norden.org/en/publication/normo-2025-nordic-monitoring-2014-2024` | `research/bibliotek/nordisk/normo-2025-kosthold-overvekt.md` plus archived Appendix 6 workbook |
| `report_canonical:karlstad-declaration-matberedskap-2024` | `https://www.norden.org/no/declaration/karlstaddeklarasjonen` | `research/bibliotek/nordisk/karlstad-deklarasjonen-matberedskap-2024.md` |
| `document:external/vision-2030-declaration` | `https://www.norden.org/en/declaration/our-vision-2030` | `research/external/vision-2030-declaration.md` |
| `document:external/vision-2030-action-plan` | `https://www.norden.org/en/information/action-plan-vision-2030` | `research/external/vision-2030-action-plan.md` |
| `document:external/nmr-vision-2030` | `https://www.norden.org/en/publication/nordic-bioeconomy-programme` | `research/external/nmr-vision-2030.md` |
| `document:external/vision-2030-status-report-2023` | `https://www.norden.org/en/publication/nordic-region-sustainable-and-integrated-region-our-vision-2030-status-report-2023` | `research/external/vision-2030-status-report-2023.md` |
| `document:external/vision-2030-indicators` | `https://www.norden.org/en/publication/nordic-indicators-our-vision-2030` | `research/external/vision-2030-indicators.md` plus online publication URL |
| `document:bibliotek/sirkularitet/waste-prevention-nordics-2025` | `https://pub.norden.org/temanord2025-502/3-waste-prevention-and-reuse-policies-in-eu-and-nordic-countries.html` | `research/bibliotek/sirkularitet/waste-prevention-nordics-2025.md` |
| `document:bibliotek/sirkularitet/regenerativt-landbruk-norden` | `https://www.norden.org/en/publication/nordic-food-transition` | `research/bibliotek/sirkularitet/regenerativt-landbruk-norden.md` |
| `document:bibliotek/sirkularitet/matsvinn-barrierer-nordiske-losninger-2024` | `https://www.norden.org/en/publication/breaking-barriers-food-waste` | `research/bibliotek/sirkularitet/matsvinn-barrierer-nordiske-losninger-2024.md` |

## Results

`npm run build-remediation-backlog` after this pass:

- Total findings: 673 -> 662.
- URL-health blocked group: 44 -> 33.
- URL-health dead group: unchanged at 41.
- URL-health other group: unchanged at 2.
- Review-closed URL issues: 16 total rows in `research/URL-HEALTH-REVIEW.csv`.

## Boundaries

- Dead URLs are not closed by the URL review helper; they still require a new live URL, archive, or local source-package decision.
- `mvk-review-koe` rows remain mostly human/role-gated and were not mass-closed.
- The regenerated backlog now also exposes DB-only/missing-file `Document` rows as file-coverage findings; that is a separate WS5 document-file remediation slice, not part of this URL-health row.

## Verification

Passed 2026-07-02:

- `node --import=tsx --test tests/lib/url-health-review.test.ts`
- `npm run build-remediation-backlog`
