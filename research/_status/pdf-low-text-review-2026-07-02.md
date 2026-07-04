# PDF low-text review — 2026-07-02

Status: controlled WS5 PDF-quality cleanup slice.

## What changed

- Added explicit `confirmed_text_sufficient` handling for `low-text` rows in `src/lib/pdf-ocr-review.ts`.
- Added test coverage in `tests/lib/pdf-ocr-review.test.ts` so generic OCR archive actions do not silently close `low-text` rows.
- Updated `scripts/build-remediation-backlog.ts` wording so PDF review closures cover scanned OCR, local replacements, existing DB text, and explicitly confirmed `pdftotext` sufficiency.
- Rebuilt `research/pdf-katalog.json` and `research/PDF-KATALOG.md` from the live worktree. The previous catalog had 399 entries, but only 109 of those paths existed in this checkout; the live rebuild has 120 PDFs.
- Regenerated `research/PDF-QUALITY.{csv,md}` from the live catalog. The stale `low-text` rows were not active live-file findings.

## Evidence

- Before this slice: `J: low-text PDFs`: 44 open LOW rows.
- Intermediate review attempt: 36 low-text rows had at least 500 existing `pdftotext` words, but the remaining 8 weak rows pointed at paths absent from the live worktree.
- Live catalog rebuild: 120 PDFs, 0 missing-file rows, 0 low-text rows, 0 skipped-too-large rows.
- `research/PDF-QUALITY.{csv,md}` now has 120 rows:
  - `ok`: 119
  - `scanned`: 1 (`evidence-pack/akademia/drager-vagene-2017.pdf`)
- The one active scanned row is already closed by existing OCR review: `research/ocr-output/evidence-pack__akademia__drager-vagene-2017.md`, 30,522 OCR words; the linked `Document` already has 30,647 words.
- `research/REMEDIATION-BACKLOG.{csv,md}` now has 126 total findings:
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 126
- Active PDF-quality backlog: 0.

## Boundary

This is a backlog/readiness and catalog-state cleanup, not fresh source verification. The stale 399-row catalog appears to describe a larger historical PDF archive than the current worktree contains. The current evidence surface is now derived from live files only.
