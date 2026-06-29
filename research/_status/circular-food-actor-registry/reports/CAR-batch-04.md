# CAR Batch 04 Report - Matsvinn, Prevention and Redistribution

Date: 2026-06-24
Registry area: `Circular Food Actor Registry`
Batch prompt: CAR-004

## Output

- Wrote `CAR-004-registry-delta.csv` with 10 source-backed rows.
- Wrote `CAR-004-matsvinn-actor-memo.md`.
- Wrote `decisions/CAR-batch-04.jsonl`.
- Appended CAR-004 source rows to `CAR-source-search-log.csv`.

## Coverage

Rows by role:

- Norwegian company/platform/network rows: Too Good To Go Norge AS, Holdbart AS, Matsentralen Norge, Matvett AS, Oda Norway AS, TotalCtrl AS and Havaristen AS.
- Program/context rows: KuttMatsvinn Servering / KuttMatsvinn2030 and Bransjeavtalen om reduksjon av matsvinn.
- Research/context row: NORSUS matsvinn research.

Rows by category:

- `matsvinn/prevention`: 7
- `redistribusjon`: 1
- `FoU/nettverk`: 2

## Decisions

Too Good To Go Norge, Holdbart, Matsentralen Norge and Matvett are the strongest CAR-004 rows and should be candidates for verified import after final dedupe.

Oda, TotalCtrl and Havaristen remain candidate-enrichment rows because their mechanism is visible, but effect metrics, customer outcomes or supplier streams need source separation.

KuttMatsvinn and Bransjeavtalen stay context/program rows. They are useful for ecosystem coverage and claim discipline, not as direct producer or redistribution output.

NORSUS is a research/context row. It should support source coverage and method language, not actor-output claims.

## Remaining Gaps

- Norway-specific Too Good To Go app outcomes and partner counts.
- Holdbart outlet, supplier, tonnage and annual-report KPI evidence.
- Matsentralen regional member split and updated local rows.
- Municipal/institutional food-waste prevention implementations beyond TotalCtrl examples.
- HORECA participant rows under KuttMatsvinn2030.

## Stop Condition

This is a first source-backed CAR-004 delta, not a complete Norwegian food-waste prevention registry.
