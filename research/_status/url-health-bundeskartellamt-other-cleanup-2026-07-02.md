# URL-Health Bundeskartellamt Other Cleanup — 2026-07-02

Status: controlled WS5 URL-health cleanup slice.

## What changed

- Added explicit `other`-row handling to `src/lib/url-health-review.ts`: reviewed `blocked` and `other` URL-health rows can be closed when `research/URL-HEALTH-REVIEW.csv` records browser verification, citable mirror evidence, or local source-package evidence.
- Kept `dead` URL rows open unless a replacement live URL, archive, or local-source decision is added.
- Added 2 review rows to `research/URL-HEALTH-REVIEW.csv` for Bundeskartellamt URLs where the CLI URL-health check returns HTTP 400 but official search/PDF evidence verifies the source:
  - `document:bibliotek/akademia/internasjonalt/tysk-dagligvaremarked-struktur`
  - `document:bibliotek/akademia/internasjonalt/tysk-nachfragemacht-kjopermakt`
- Regenerated `research/REMEDIATION-BACKLOG.{csv,md}`.

## Evidence

- Before this slice: `T: other URL issues`: 2 LOW rows.
- Official web-search evidence confirmed the Bundeskartellamt press release URL and the official PDF URL for the sector inquiry summary.
- `npm run build-remediation-backlog` now reports 74 findings:
  - HIGH: 0
  - MEDIUM: 0
  - LOW: 74
  - remaining groups: 41 dead URLs, 33 blocked URLs
  - `T: other URL issues`: 0
- `node --import=tsx --test tests/lib/url-health-review.test.ts` passed after the rule change.

## Boundary

This closes two reviewed CLI `other` false positives. It does not claim the CLI HTTP 400 behavior is fixed, and it does not close dead URLs. The remaining URL-health backlog is still low-priority link hygiene: dead URL rows that need replacement/archive/local-source decisions and blocked rows that need browser/mirror/local review before they can be removed from the backlog.
