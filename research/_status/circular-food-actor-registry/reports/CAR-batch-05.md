# CAR Batch 05 Report - Side Streams, Upcycling and Ingredients

Date: 2026-06-24
Registry area: `Circular Food Actor Registry`
Batch prompt: CAR-005

## Output

- Wrote `CAR-005-registry-delta.csv` with 12 source-backed rows.
- Wrote `CAR-005-side-streams-actor-memo.md`.
- Wrote `decisions/CAR-batch-05.jsonl`.
- Appended CAR-005 source rows to `CAR-source-search-log.csv`.

## Coverage

Rows by role:

- Norwegian company/cooperative rows: HOFF SA, Biomega Group AS, Biomega Norway AS, Hofseth BioCare ASA, Pelagia AS, Alginor ASA, Gruten AS and Arctic Natural Nutrition AS.
- Project/source rows: PROTEUS kelp side-stream valorisation and SINTEF/FHF Analyse marint restråstoff 2024.
- Nordic context rows: Kaffe Bueno and Hailia Nordic.

Rows by category:

- `sidestrøm/upcycling`: 9
- `tang/tare`: 1
- `konkurs/failure case`: 1
- source/context row in `sidestrøm/upcycling`: 1

## Decisions

HOFF, Biomega Group, Hofseth BioCare and Pelagia are the strongest CAR-005 company rows and should be candidates for verified import after final dedupe.

Biomega Norway AS is useful for legal/site mapping but should not be counted separately from Biomega Group without an explicit entity model.

Alginor belongs in the registry, but its main category is better kept as `tang/tare`; PROTEUS is the specific side-stream/total-utilisation context.

Gruten should not be treated as an active food producer. It is a useful coffee-ground upcycling case with a documented wind-down status.

Arctic Natural Nutrition should remain parked. Brreg identity exists, but circular side-stream mechanism was not found.

## Remaining Gaps

- Direct Hordafor entity/status mapping inside or alongside Pelagia.
- Norwegian brewery spent grain and bakery side-stream actors.
- Upcycled fruit/vegetable ingredient actors beyond HOFF/potato flows.
- Product-level human food versus feed, pet, biofuel and soil split for large seafood processors.
- Exact source handling for volume figures before they enter any public claim surface.

## Stop Condition

This is a first source-backed delta, not a complete side-stream actor registry.
