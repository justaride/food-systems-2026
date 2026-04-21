# Final Intake Report

Generated: 2026-04-20

- Batch: `food-research-process-2026-04-20`
- Source folder: `Food Research Process 20.04.26`
- Review CSV: `research/intake/food-research-process-2026-04-20/review.csv`
- Thesis sidecar: `research/intake/food-research-process-2026-04-20/thesis-review.csv`
- Promotion script: `scripts/promote-food-process-typed-records.ts`

## Final status

| Area | Status |
| --- | --- |
| Intake import | Completed |
| Typed promotion cleanup | Completed |
| Duplicate handling | Completed |
| Thesis metadata backfill | Completed |
| Blocked promotion queue | Cleared |

## Batch snapshot

| Metric | Count | Notes |
| --- | ---: | --- |
| Selected for intake import | 225 | From `import-summary.json` |
| Imported to database | 225 | `dryRun=false`, `skipped=0` |
| SourceDoc typed rows | 126 | Final preview shows all already linked |
| Report typed rows | 71 | 46 linked, 25 intentionally skipped by review action |
| Thesis typed rows | 20 | 8 linked, 12 intentionally skipped by review action |
| Blocked promotion rows remaining | 0 | `blocked-promotion-worklist-summary.json` |

## What was completed

1. Imported the full reviewed batch into the database with no skipped rows.
2. Worked through the remaining typed-promotion backlog for `Report` and `Thesis`.
3. Cleaned duplicate and non-target rows in `review.csv` by using explicit `skip` decisions instead of assuming filename matches were duplicates.
4. Created and populated `thesis-review.csv` as a thesis-specific metadata sidecar with 20 reviewed thesis rows plus header.
5. Rebuilt the blocked promotion worklist until the batch reached `totalBlocked=0`.

## Data handling notes

- The final state is intentional: the remaining non-promoted `Report` and `Thesis` rows are not unresolved blockers, they are review decisions.
- The current typed previews now show an end-state where promotable rows are already linked in the typed layers, and remaining rows are marked out through review action.
- Earlier control artifacts in this folder documented intermediate blockers; this report reflects the final resolved state for the batch.

## Script changes used to finish the batch

The promotion script was extended to support the manual cleanup needed for this batch:

- Added low-confidence override support for reviewed report rows via the `allow-low-confidence` notes token.
- Added `thesis-review.csv` loading and merge logic so thesis metadata can be promoted from a reviewed sidecar file.
- Wired thesis-review metadata into thesis title, year, URL, author, institution, and synthesis payload generation.

Relevant anchors in `scripts/promote-food-process-typed-records.ts`:

- `LOW_CONFIDENCE_OVERRIDE_TOKEN` at line 22
- `reviewAllowsLowConfidence()` at line 707
- report confidence override at line 1531
- `thesisReviewCsv` path at line 524
- `loadThesisReviewRows()` at line 805
- thesis payload merge at lines 1053-1065
- thesis review lookup and payload application at lines 1564 and 1629

## Artifacts to use going forward

- `review.csv` is the authoritative record of row-level intake and skip decisions.
- `thesis-review.csv` is the authoritative metadata supplement for thesis rows in this batch.
- `promotion-preview-all-summary.json` is the best compact snapshot of the final typed-layer state.
- `blocked-promotion-worklist-summary.json` confirms there are no remaining promotion blockers for this batch.

## Recommended next step

The batch no longer needs intake remediation. The next step should be project-level curation: shortlist the imported records that fit the active Food Systems research scope, then surface only that subset into downstream analysis, synthesis, or knowledge products.
