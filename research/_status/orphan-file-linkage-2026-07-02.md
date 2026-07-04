# Orphan-File Linkage — 2026-07-02

Status: controlled WS5 orphan-file slice

## Scope

This slice addresses the MEDIUM orphan-file rows exposed by `research/FILE-COVERAGE.csv` after the pilot-brief and funding-matrix work.

It does not remove or hide archive/generated-output maintenance rows. It links the WS4 evidence-pack outputs that should be treated as intentional internal source artifacts.

## Change

Added seed report `food-systems-2026-pilot-funding-dossiers` in `prisma/seed-data/reports.ts`.

The report is `provenanceType: internal_synthesis` and links these local artifacts through `supportingSources[].documentPath`:

- `research/evidence-pack/funding-matrix.md`
- `research/evidence-pack/pilot-briefs/01-finnish-4a-structural-threshold.md`
- `research/evidence-pack/pilot-briefs/02-open-logistics-access.md`
- `research/evidence-pack/pilot-briefs/03-zoning-establishment-barriers.md`
- `research/evidence-pack/pilot-briefs/04-asko-vestby-dependency-model.md`
- `research/evidence-pack/pilot-briefs/05-municipal-procurement-standard.md`

## Result

After regenerating file coverage and the remediation backlog:

| Metric | Before | After |
| --- | ---: | ---: |
| File-coverage findings | 125 | 119 |
| Orphan-file findings | 27 | 21 |
| MEDIUM orphan-file findings | 6 | 0 |
| Total remediation backlog | 275 | 267 after subsequent broken-supporting-source cleanup |
| HIGH remediation backlog findings | 0 | 0 |

Remaining `orphan_file` rows are all LOW and are limited to intentional data README, prompt-library templates, a contract PDF, and generated figure PDFs.

## Evidence Commands

```bash
DATABASE_URL='postgresql://foodsystems:foodsystems@localhost:5432/foodsystems?schema=public' npm run compute-file-coverage
npm run build-remediation-backlog
```

Observed result:

- `FILE-COVERAGE.csv`: 119 findings; 21 `orphan_file`; 95 MEDIUM, 24 LOW, 0 HIGH.
- `REMEDIATION-BACKLOG.csv`: 269 findings for this slice; later broken-supporting-source cleanup reduced the current backlog to 267 findings; 94 MEDIUM, 173 LOW, 0 HIGH.
