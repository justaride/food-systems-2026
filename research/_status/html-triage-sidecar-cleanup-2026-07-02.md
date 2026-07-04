# HTML triage sidecar cleanup — 2026-07-02

Status: controlled WS5 HTML-triage cleanup slice.

## What changed

- Added regression coverage for `scripts/triage-html.ts` and `scripts/build-remediation-backlog.ts`.
- Updated `scripts/triage-html.ts` to use existing extracted text sidecars when a `downloads/*.html` file has a matching `text/*.txt` companion.
- Added `has_text_companion` to `research/HTML-TRIAGE.csv`.
- Updated `scripts/build-remediation-backlog.ts` so `ok-snapshot` HTML rows with either Markdown or extracted-text companions are not treated as open remediation findings.
- Regenerated `research/HTML-TRIAGE.{csv,md}` and `research/REMEDIATION-BACKLOG.{csv,md}`.

## Evidence

- Before this slice: `O: other HTML issues`: 29 LOW rows, including 23 false-positive `ok-snapshot` rows and 6 rows where the HTML prefix under-counted content already present in extracted text sidecars.
- `npm run triage-html` now reports:
  - 29 HTML files scanned
  - `ok-snapshot`: 29
  - `needs-md-extraction`: 0
  - `navigation-only`: 0
  - `error-page`: 0
- `npm run build-remediation-backlog` reported 76 findings at this checkpoint:
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 76
  - remaining groups at this checkpoint: 41 dead URLs, 33 blocked URLs, 2 other URL issues

A later Bundeskartellamt URL-health cleanup closed the 2 `other` URL rows; the current regenerated backlog reports 74 LOW URL-health rows. See `research/_status/url-health-bundeskartellamt-other-cleanup-2026-07-02.md`.

## Boundary

This is a local evidence-surface correction, not new external source verification. The HTML files remain local snapshots; the closure means each HTML snapshot has a usable Markdown or extracted-text companion and no longer needs HTML-to-text remediation.
