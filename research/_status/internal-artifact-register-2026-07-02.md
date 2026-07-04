# Internal artifact register — 2026-07-02

Status: controlled WS5 orphan-file cleanup slice.

## What changed

- Added seed report `food-systems-2026-internal-artifact-register` in `prisma/seed-data/reports.ts`.
- Registered 21 intentional internal artifacts through `supportingSources[].documentPath`:
  - 1 Mission 4 open-data README
  - 1 Nordic Circular Hotspot contract PDF original
  - 5 deep-research prompt-library files
  - 14 PDF figure exports under `research/visualisering/figurer/`
- Regenerated `research/FILE-COVERAGE.{csv,md}` and `research/REMEDIATION-BACKLOG.{csv,md}`.

## Evidence

- Before this slice: `F: orphan files`: 21 open LOW rows.
- `npm run compute-file-coverage` now reports:
  - total findings: 0
  - `orphan_file`: 0
  - `missing_file_document`: 0
  - `missing_file_sourcedoc`: 0
  - `broken_supportingsource`: 0
  - `duplicate_file_separate_records`: 0
- `npm run build-remediation-backlog` reported 105 findings at this checkpoint:
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 105

## Boundary

This is an artifact-governance and coverage cleanup, not new external source verification. The registered files remain internal method, contract-original, prompt, and publishing-export artifacts. Later URL/HTML cleanup slices closed the HTML backlog and the two `other` URL rows; current remaining remediation backlog is URL-health hygiene only (dead and blocked URL rows). See `research/_status/html-triage-sidecar-cleanup-2026-07-02.md` and `research/_status/url-health-bundeskartellamt-other-cleanup-2026-07-02.md`.
