# Food Research Process Intake

Generated: 2026-04-20T14:14:15.676Z

- Source folder: `Food Research Process 20.04.26`
- Review CSV: `research/intake/food-research-process-2026-04-20/review.csv`
- Manifest JSON: `research/intake/food-research-process-2026-04-20/manifest.json`
- Review rows: 250
- Exact duplicates excluded from review: 14

## Review workflow

1. Open `review.csv`.
2. Keep `action=review` until the row is assessed.
3. Set `action=import` only for rows that should become staging `Document` records in the database.
4. Optionally fill `final_*` columns to override proposed metadata before import.
5. Run `npm run db:import:food-process-intake` after review.

## Counts by folder

- 00_Working_Files: 19
- 01_Data_And_Archives: 6
- 03_Policy_Governance_And_Market: 34
- 04_Food_Waste_And_Circularity: 23
- 05_Foodtech_Alt_Protein_And_Innovation: 31
- 06_Company_And_Annual_Reports: 15
- 07_Academic_Research_And_Theses: 102
- 08_Food_Security_Agriculture_And_Seafood: 20

## Counts by action

- hold: 25
- review: 225

## Project-fit status

- Core project-fit pack completed in batch docs: `PROJECT-FIT-CURATION.md`, `PROJECT-FIT-EVIDENCE-PACK.md`, and `PROJECT-FIT-CLAIM-MATRIX.md`
- First-wave P2 extension imported / relinked: `8` `SourceDoc`, `3` `Report`, `3` `Thesis`, and `0` conflicts after thesis relinking
- Strongest new transition coverage: side-stream valorization, redistribution, and waste-hierarchy logic
- Still caveated: Norwegian deployment data, fermentation commercialization, and system-scale scale-up outcomes
- Use `PROJECT-FIT-P2-SYNTHESIS-LAYER.md` as the second-layer input for whitepaper drafting, with `CF-10A` and `CF-10B` now separated in the claim matrix
