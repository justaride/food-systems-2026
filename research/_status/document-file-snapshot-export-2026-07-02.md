# Document.filePath snapshot export — 2026-07-02

Status: controlled WS5 locator-remediation slice.

## What changed

- Exported 95 local markdown snapshots from existing DB `Document.content`.
- Updated 95 corresponding `Document.filePath` rows to `research/${Document.slug}.md`.
- Included the one explicit `blocked_source` quarantine row (`report-agrianalyse-bondens-andel-2025`) because its linked report provenance explains the missing canonical URL.
- Added reusable command `npm run db:export:missing-document-files` via `scripts/export-missing-document-file-snapshots.ts`.

These files are local locator/coverage artifacts. They are not fresh source verification, and the canonical or archived external URL remains authoritative where listed in each snapshot.

## Evidence

- Dry run before export: `requested: 95`, `exportable: 95`, `skipped: 0`.
- Apply run: `requested: 95`, `exportable: 95`, `skipped: 0`, `totalContentChars: 3876530`.
- Regenerated `research/FILE-COVERAGE.{csv,md}` after export:
  - `missing_file_document`: 0
  - `missing_file_sourcedoc`: 0
  - `broken_supportingsource`: 0
  - total file-coverage findings: 22, all LOW
- Regenerated `research/REMEDIATION-BACKLOG.{csv,md}` after export:
  - total findings: 172
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 172

## Remaining backlog boundary

This closes the open `Document.filePath` locator gap. Later slices close the duplicate finding in `research/_status/document-duplicate-cleanup-2026-07-02.md`, the active PDF-quality backlog in `research/_status/pdf-low-text-review-2026-07-02.md`, and the remaining orphan-file backlog in `research/_status/internal-artifact-register-2026-07-02.md`. Current remaining LOW hygiene queues are URL hygiene and HTML triage.
