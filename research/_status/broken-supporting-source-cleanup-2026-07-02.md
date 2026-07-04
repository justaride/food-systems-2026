# Broken Supporting-Source Cleanup — 2026-07-02

Status: controlled WS5 supporting-source slice

## Scope

This slice closes stale `Report.supportingSources[].documentPath` pointers that referenced local PDFs no longer present in the repo.

## Change

- Removed the missing `research/evidence-pack/nordisk/future-nordic-diets-tn2017-566.pdf` supporting-source pointer from `future-nordic-diets-tn2017-566`. The report already has DOI, landing page, local bibliography note, and local source-register support.
- Replaced stale local-PDF wording in `research/bibliotek/nordisk/future-nordic-diets-tn2017-566.md` and `research/bibliotek/KILDEREGISTER.md` with the current landing-page locator.
- Removed the missing `research/evidence-pack/akademia/agrianalyse-bondens-andel-2025.pdf` supporting-source pointer from the intentionally blocked `agrianalyse-bondens-andel-2025` report. The AgriAnalyse 2025 archive URL remains as the explicit blocked-source locator, and the report stays excluded until a real source is found.

## Result

After regenerating file coverage and the remediation backlog:

| Metric | Before | After |
| --- | ---: | ---: |
| Broken `Report.supportingSources` rows | 2 | 0 |
| File-coverage findings | 119 | 117 |
| Total remediation backlog | 269 | 267 |
| HIGH remediation backlog findings | 0 | 0 |

## Evidence Commands

```bash
DATABASE_URL='postgresql://foodsystems:foodsystems@localhost:5432/foodsystems?schema=public' npm run compute-file-coverage
npm run build-remediation-backlog
```

Observed result:

- `FILE-COVERAGE.csv`: 117 findings; `broken_supportingsource: 0`; 94 MEDIUM, 23 LOW, 0 HIGH.
- `REMEDIATION-BACKLOG.csv`: 267 findings; 94 MEDIUM, 173 LOW, 0 HIGH.
