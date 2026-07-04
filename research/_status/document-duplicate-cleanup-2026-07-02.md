# Duplicate Document cleanup — 2026-07-02

Status: controlled WS5 file-coverage cleanup slice.

## What changed

- Consolidated the only `duplicate_file_separate_records` finding for SHA256 `9f8d0396d2dd`.
- Deleted sparse duplicate DB `Document` row `cmp8xyoej00k6vvvm63gli4a8` (`evidence-pack/nordisk/salling-coop-danmark-2025.pdf`) after confirming it had no citations, no insight refs, and only one redundant company ref.
- Preserved the richer canonical PDF document row `cmp8xyn3d00grvvvmi1g0q8sq` (`evidence-pack/akademia/huynh-mortensen-2025.pdf`).
- Moved structured report document `cmppajyyi001xnjvm9v3f2zzf` from the duplicate PDF alias to a unique local snapshot: `research/report-salling-coop-danmark-2025.md`.
- Removed tracked duplicate PDF alias `research/evidence-pack/nordisk/salling-coop-danmark-2025.pdf` after verifying it was byte-identical to the canonical PDF.
- Removed the stale `salling-coop-danmark-2025` PDF override from `research/seed-pdf-map.overrides.json`.
- Added an importer skip for the deleted duplicate alias path in `scripts/import-research-docs.ts` so a generic Document row is not recreated.
- Retargeted SourceCitation `cmpdaflwu00uisxvm1gtm3hvs` from the deleted duplicate alias to `research/report-salling-coop-danmark-2025.md` and linked it to document `cmppajyyi001xnjvm9v3f2zzf`.

## Evidence

- SHA256 before deletion:
  - `research/evidence-pack/akademia/huynh-mortensen-2025.pdf`: `9f8d0396d2dda16a512d8a54582df9287e4f044cc44bc01e421ecf75ef327b44`
  - `research/evidence-pack/nordisk/salling-coop-danmark-2025.pdf`: `9f8d0396d2dda16a512d8a54582df9287e4f044cc44bc01e421ecf75ef327b44`
- Regenerated `research/FILE-COVERAGE.{csv,md}`:
  - `duplicate_file_separate_records`: 0
  - `missing_file_document`: 0
  - `missing_file_sourcedoc`: 0
  - `broken_supportingsource`: 0
  - total file-coverage findings: 21, all LOW
- Regenerated `research/REMEDIATION-BACKLOG.{csv,md}` at this checkpoint:
  - total findings: 171
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 171
- `npm run audit:citable` passes after citation retarget; external blocking issues: 0.

## Remaining backlog boundary

The file-coverage surface had only LOW orphan-file maintenance rows at this checkpoint. Later slices closed the active PDF-quality backlog and then the remaining orphan-file backlog; see `research/_status/pdf-low-text-review-2026-07-02.md` and `research/_status/internal-artifact-register-2026-07-02.md`. Current remaining remediation work is outside this duplicate cleanup slice: URL hygiene and HTML triage.
