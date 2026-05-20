# Citable Knowledge Base Handoff 2026-05-20

## Purpose

This handoff prepares the next Codex session to continue the remaining quality
work after the citable knowledge base hardening work was merged to `main`.

The implementation plan is:

- `docs/superpowers/plans/2026-05-20-citable-knowledge-base-hardening.md`

## Current Repo State

- Working directory: `/Users/gabrielfreeman/Documents/Food Systems 2026`
- Branch: `main`
- Base before current quality-pass commit:
  `f302ab3 docs: prepare next citable quality tranche`
- Remote tracking branch: `origin/main`
- Merged PRs:
  - PR #60: integrated data-quality hardening and citable knowledge-base gates
    into `main`.
  - PR #61: fixed post-merge handling of
    `source:blocked-unsourced/...` internal markers so they remain internal
    context, not external primary evidence.
- Clean-up completed: the old citable worktree was removed, and the remote/local
  branches `citable-knowledge-base-hardening-2026-05-20`,
  `data-quality-hardening-2026-05-19`, and
  `fix/internal-blocked-citation-refresh-2026-05-20` were deleted.
- Current operating status: strict source/citation gates are green. The
  readiness queue now tracks 1 P2 residual report row: the intentionally
  `blocked_source` `agrianalyse-bondens-andel-2025` report. The 10
  internal/composite/register reports without a single source URL are reviewed
  sourceUrl exceptions because they have explicit `supportingSources`
  bibliographies.

## Historical Baseline From Initial Live Audit

This is retained for context only. The final current state is in the sections
below and in `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`.

- `npm test` passed with 100 tests.
- `npm run db:audit` passed.
- `npm run db:audit:strict-sources` failed on three known strict-source groups:
  - `CompanyFinancial.source`: 36 of 151 label-only.
  - `BusinessRelationship.source`: 32 of 50 label-only.
  - `CountryMetric.source`: 142 of 415 label-only.
- `npm run graph:audit` passed technically, but showed weak practical graph coverage:
  - 40,885 nodes
  - 1,076 edges
  - 39,976 isolated nodes
  - 0.6 percent edge confidence
- Current evidence-quality artifacts that should be treated as operational inputs:
  - `research/URL-HEALTH.md`
  - `research/PDF-QUALITY.md`
  - `research/FILE-COVERAGE.md`
  - `research/REMEDIATION-BACKLOG.md`
  - `research/AKADEMISK-KILDEHANDTERING-PLAN.md`

## Continuation Update After Tasks 1-4

Tasks 1-4 were implemented in the active worktree:

- Task 1: baseline gates captured in `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`.
- Task 2: canonical citation readiness labels implemented in
  `src/lib/citations/citation-status.ts` and aligned in the policy docs.
- Task 3: Prisma schema now includes `SourceCitation`, `FieldCitation`,
  citation readiness enums, and relations to `Document` and `SourceDoc`.
- Task 4: source citation validation and readiness derivation live under
  `src/lib/citations/`.

Important database discovery: the live local database already had legacy
`SourceCitation` and `FieldCitation` tables. The schema and migrations therefore
preserve existing data, keep `FieldCitation.fieldPath` nullable for existing
record-level citations, and default all existing source citations fail-closed to
`blocked_unsourced`.

Local migrations applied and resolved:

- `20260520_source_citation_enum_values`
- `20260520_source_citations`

Latest verification:

- `npm test` passed with 122 tests.
- `npm run lint` passed.
- `npm run db:audit` passed with warnings.
- `npm run db:audit:strict-sources` still fails only on the three known
  strict-source groups.
- `npm run graph:audit` passed.
- `npm run build` passed, with a Next.js multiple-lockfile/root warning from
  the worktree layout.
- `git diff --check` passed.

## Continuation Update After Tasks 5-7

Tasks 5-7 were implemented in the active worktree:

- Task 5: `scripts/backfill-source-citations-from-existing-locators.ts`
  backfilled citations from existing locators only.
- Task 6: `src/lib/citations/citation-audit.ts` is wired into
  `scripts/verify-data-integrity.ts` as a new `Citation Coverage` section.
- Task 7: `scripts/export-citation-readiness-queue.ts` writes
  `research/citation-readiness-queue-2026-05-20.csv`.

Backfill result:

- Before apply: `SourceCitation=71`, `FieldCitation=1286`.
- Apply created 2,544 `SourceCitation` rows and 243,018 `FieldCitation` rows.
- After apply at that checkpoint: `SourceCitation=2615`,
  `FieldCitation=244304`.
- Second apply was idempotent: 0 source citations and 0 field citations to
  create.

Current strict gate behavior:

- `npm run db:audit` passes with warnings.
- `npm run db:audit:strict-sources` fails as expected on 5 enforced groups:
  the 3 known label-only source groups plus citation coverage blockers.
- Citation coverage currently reports 1,963 externally relevant
  `FieldCitation` rows pointing to `blocked_unsourced` citations and 10
  additional external blocking audit issues with missing claim text.
- The generated queue has 2,184 rows: 2,174 P0 and 10 P2.

## Continuation Update After Task 8

Task 8 closed the current strict-source source-label failures without inventing
new external citations:

- `CompanyFinancial.source`: source-quality coverage is now 151 of 151. Estimate
  rows and one unverified annual-report label are fail-closed with internal
  `source:blocked-unsourced/...` markers.
- `BusinessRelationship.source`: source-quality coverage is now 50 of 50.
  Existing KKV 4a metadata resolves to the existing locator; unresolved
  relationship labels are fail-closed as unverified labels.
- `CountryMetric.source`: source-quality coverage is now 415 of 415. Known
  Luke, Eurostat, Miljostyrelsen, Samkeppniseftirlitid, and
  Konkurransetilsynet labels use existing repo/database locators; unresolved
  estimates and generic labels are blocked.

Latest Task 8 verification:

- `npm test -- tests/lib/row-source-locators.test.ts tests/lib/source-quality-audit.test.ts`
  passed; the full test runner reported 138 tests passing.
- `npm run research:source-gap-queue` passed and wrote
  `research/_status/strict-source-gap-queue.json` with 0 groups and 0 rows.
- `npm run research:citation-readiness-queue` passed and wrote
  `research/citation-readiness-queue-2026-05-20.csv` with 1,974 rows: 1,964 P0
  and 10 P2.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run db:audit:strict-sources` still fails, but only on citation coverage:
  1,963 externally relevant blocked `FieldCitation` rows plus 10 external
  blocking audit issues with missing claim text.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `git diff --check` passed.

Operational meaning: the old source-label strict-source blockers are closed.
The knowledge base is still not externally publishable by default because
citation coverage remains fail-closed for the rows above.

## Continuation Update After Task 9

Task 9 remediated the current file, URL, HTML and PDF evidence-risk layer:

- `npm run check-pdf-quality` passed: 399 cataloged PDFs, 398 analyzed, 1
  skipped too large, 0 missing; 5 scanned, 44 low-text, 349 ok.
- `npm run ocr-scanned-pdfs` passed: 5 scanned PDFs processed, 4 OCR outputs
  archived in `research/ocr-output/`, 1 tiny RASTECH file skipped as likely
  corrupt, 0 `Document` rows updated, 69,334 OCR words extracted.
- `npm run triage-html` passed: 29 HTML files, 0 HIGH, 18 MEDIUM
  `needs-md-extraction`, 11 LOW snapshot/navigation/error-page findings.
- `npm run inventory-urls` passed: 870 URL occurrences, 600 unique URLs.
- Final `npm run db:check-urls -- --csv-only` passed: 600 unique URLs checked,
  493 ok, 2 redirect, 41 dead, 52 blocked, 5 timeout, 5 server_error, 2 other.
- `npm run compute-file-coverage` passed: 1,262 research candidates scanned,
  351 findings, 0 HIGH, 42 MEDIUM, 309 LOW.
- Final `npm run build-remediation-backlog` passed: 535 findings, 10 HIGH, 65
  MEDIUM, 460 LOW.
- Final verification passed for `npm test`, `npm run lint`, `npm run db:audit`,
  `npm run build`, and `git diff --check`.
- `npm run db:audit:strict-sources` still fails as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.

Code/data changes in Task 9:

- Added `src/lib/url-health-classifier.ts` and
  `tests/lib/url-health-classifier.test.ts`.
- Updated `scripts/check-urls.ts` to classify all HTTP 2xx responses as `ok`
  and use a browser-like request profile to reduce false 500/429 responses from
  public archives that reject custom bot user agents.
- Patched verified source URLs in `src/lib/data/reports.ts` and
  `src/lib/data/theses.ts`, including direct or persistent URLs for
  Dagligvaretilsynet/Samfunnsøkonomisk Analyse, NVA/handle records, NOU 2013:6,
  Nordic Council PDFs, ICA Gruppen, Konkurrensverket PDFs, KKV Finland,
  PMC/PubMed, Trace Tennessee, JYX, and SLU fulltext.

Residual Task 9 blockers:

- The remaining HIGH backlog items are URL-health access blockers only, not
  missing local files.
- Persistent blocked/high sources: Civita, Salford Worktribe, Skemman, and
  Konkurrensverket PDF checks.
- The final run also showed transient LUT/URN timeout/server-error findings.
  Earlier focused checks showed some LUT endpoints can return 200, so treat
  these as live-access instability rather than confirmed dead sources.
- Skemman/Salford/Civita were not patched because no stable, verified
  replacement URL was found in this pass.

## Continuation Update After Task 10

Task 10 implemented fail-closed external use and visible citation state across
the current public surfaces:

- Added `src/lib/citations/citable-record-filter.ts` and
  `tests/lib/citable-record-filter.test.ts`.
- Added reusable `src/components/citations/Citation.tsx` and
  `src/components/citations/CitationBibliography.tsx`.
- `/rapporter` now derives report-level citation readiness from existing
  `SourceCitation` rows, source URLs, local file paths, report provenance, and
  supporting-source metadata. Reports that are not externally citable still show
  metadata and links, but findings, recommendations, and relevance text are
  hidden behind an explicit external-use caveat.
- `/bibliotek/[...slug]`, `/selskap/[id]`, `/sirkularitet`, and
  `/forsyningskjede` now render citation readiness labels beside document,
  corporate, circularity benchmark, chart, and data-quality claims.
- `SourceFootnote`, `EvidenceStatusBadge`, `ChartFrame`, and
  `DataQualityStrip` propagate citation readiness through visualized claims.
- `src/lib/queries/graph.ts` filters explicit blocked source markers from
  ownership, business-relationship, and property graph edges before they feed
  public graph output.

Latest Task 10 verification:

- `npm test -- tests/lib/citable-record-filter.test.ts` passed; the full test
  runner reported 145 tests passing.
- `npm test` passed with 145 tests.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run graph:audit` passed.
- `npm run db:audit:strict-sources` still fails as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `git diff --check` passed before this handoff/status update.

## Continuation Update After Task 11

Task 11 added a report-specific audit gate for the Nordic circularity report and
closed the known citable-use drift in that report package:

- Added `src/lib/citations/report-claim-audit.ts`.
- Added `scripts/audit-citable-reports.ts` and the package script
  `npm run audit:citable-reports`.
- Added `tests/lib/report-claim-audit.test.ts`.
- Updated the HTML report, appendix, sprint README, and Phase 7 self-critique
  so T3 status, Copenhagen public-kitchen organic share, README quality
  wording, HHI/CR3 labels, and weak IFRO bibliography wording are consistent
  with the accepted evidence trail.

Latest Task 11 verification:

- `npm run audit:citable-reports` passed with no issues found.
- `npm test -- tests/lib/report-claim-audit.test.ts` passed; the full runner
  reported 148 tests.
- `npm test` passed with 148 tests.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run graph:audit` passed.
- `npm run db:audit:strict-sources` still fails as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `git diff --check` passed before this handoff/status update.

## Continuation Update After Task 12

Task 12 added the citable-use acceptance pack:

- Added `src/lib/citations/citable-acceptance.ts`.
- Added `tests/lib/citable-acceptance.test.ts`.
- Added `scripts/build-citable-acceptance-pack.ts` and the package script
  `npm run research:citable-acceptance-pack`.
- Generated `research/CITABLE-ACCEPTANCE-TESTS.md`.
- Generated `research/citable-acceptance-pack-2026-05-20.json`.
- Generated `research/citable-acceptance-pack-2026-05-20.md`.

The generated pack has 12 questions across the required areas and currently
marks 7 answers cite-ready and 5 answers blocked. The blocked answers are
intentional fail-closed cases, not script failures.

Latest Task 12 verification:

- `npm test -- tests/lib/citable-acceptance.test.ts` passed; the full runner
  reported 151 tests.
- `npm run research:citable-acceptance-pack` passed and wrote the three
  acceptance artifacts.
- `npm test` passed with 151 tests.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run graph:audit` passed.
- `npm run audit:citable-reports` passed.
- `npm run db:audit:strict-sources` still fails as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `git diff --check` passed before this handoff/status update.

## Continuation Update After Task 13

Task 13 normalized the document-level external-use decisions:

- Added `tests/lib/citable-register-docs.test.ts`.
- Updated `docs/project/mandates/claim-register-food-tg.md` with an
  `External-use decision ledger` for all 42 formal claims.
- Updated `docs/project/mandates/evidence-matrix-food-tg.md` with
  `External-use normalization`, including the rule that internal synthesis is
  separated from source evidence.
- Updated `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md`
  with `External-use normalization`; `NORDIC-CORE-017` remains
  `blocked_unsourced` for evidentiary use.

Latest Task 13 verification:

- `npm test -- tests/lib/citable-register-docs.test.ts` passed; the full runner
  reported 153 tests.
- `npm test` passed with 153 tests.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run graph:audit` passed.
- `npm run audit:citable-reports` passed.
- `npm run research:citable-acceptance-pack` passed.
- `npm run db:audit:strict-sources` still fails as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `git diff --check` passed before this handoff/status update.

## Continuation Update After Task 14

Task 14 made the citable operator workflow explicit:

- Added package script `audit:citations`:
  `tsx scripts/verify-data-integrity.ts --strict-sources`.
- Added aggregate package script `audit:citable`:
  `npm run db:audit && npm run audit:citations && npm run audit:citable-reports && npm run research:citation-readiness-queue`.
- Added `tests/lib/citable-workflow-docs.test.ts` to enforce the scripts,
  standard operator sequence, and fail-closed documentation rule.
- Updated `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` with the standard
  operator sequence.
- Updated `research/AKADEMISK-KILDEHANDTERING-PLAN.md` with the fail-closed
  rule that claims without external-ready citations must be excluded from
  external output or displayed as internal context.

Latest Task 14 verification:

- `npm test -- tests/lib/citable-workflow-docs.test.ts` passed; the full runner
  reported 155 tests.
- `npm test` passed with 155 tests.
- `npm run lint` passed.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run graph:audit` passed.
- `npm run audit:citable-reports` passed.
- `npm run research:citation-readiness-queue` passed and wrote 1,974 rows:
  1,964 P0 and 10 P2.
- `npm run research:citable-acceptance-pack` passed and still reports 7 of 12
  cite-ready answers, with 5 intentionally blocked fail-closed answers.
- `npm run audit:citable` failed as expected at `npm run audit:citations`.
  `db:audit` passed first; the strict part still fails only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `git diff --check` passed before this handoff/status update.

## Final Handoff After Task 15

Task 15 ran the final verification pass and updated the final status.

Latest final verification:

- Focused citation test command passed; because the repo test script includes
  `tests/**/*.test.ts`, it executed the full suite and reported 155 tests.
- `npm test` passed with 155 tests.
- `npm run lint` passed.
- `npm run db:audit` passed with citation coverage warnings.
- `npm run db:audit:strict-sources` failed as expected only on citation
  coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10
  missing-claim-text audit issues.
- `npm run audit:citable-reports` passed.
- `npm run research:citation-readiness-queue` passed and wrote 1,974 rows:
  P0 1,964, P1 0, P2 10, P3 0.
- `npm run research:citable-acceptance-pack` passed and still reports 7 of 12
  cite-ready answers, with 5 blocked fail-closed answers.
- `npm run graph:audit` passed technically; edge confidence coverage remains
  0.6 percent.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `git diff --check` passed after build.

Task 15 operating status, now superseded by the continuation update below:

- The branch has the schema, audit gates, readiness queue, report audit,
  acceptance pack, fail-closed public handling, workflow scripts, and handoff
  documentation in place.
- At that checkpoint it was not ready to claim blanket external citation
  readiness because strict citation coverage still failed.
- The continuation below remediates those strict citation coverage failures.

## Continuation Update After Citation Coverage Remediation

This continuation closed the strict citation coverage blockers without
inventing new source URLs:

- `scripts/refresh-source-citation-readiness.ts` re-derived stale
  `SourceCitation.citationReadiness` values from existing locator and
  verification metadata only.
- First apply refreshed 2,519 rows: 58 `blocked_unsourced -> citable_external`,
  2,448 `blocked_unsourced -> citable_with_note`, and 13
  `blocked_unsourced -> internal_context`.
- Second apply moved 27 missing-local-only stale external rows from
  `citable_with_note -> internal_context`.
- The refresh was idempotent at that checkpoint: 2,615 rows scanned, 0
  updates. Current `main` now scans 2,698 rows and reports 0 updates after PR
  #61 and the final local backfill.
- `scripts/backfill-field-citation-claim-text.ts` filled the 10 missing
  `Company.naceDescription` `FieldCitation.claimText` values from existing
  `Company` NACE values, and is now idempotent.
- `scripts/export-citation-readiness-queue.ts` now uses normalized verification
  semantics, so legacy `machine_verified` and `human_verified` rows are no
  longer false P1 queue items.

Latest continuation verification:

- `npm test -- tests/lib/citation-readiness-queue.test.ts tests/lib/field-citation-claim-text.test.ts`
  passed; because the repo test script includes `tests/**/*.test.ts`, it
  reported 167 tests passing after the excluded-blocker queue test was added.
- `npm test` passed with 167 tests.
- `npm run lint` passed.
- `npm run db:backfill:field-citation-claim-text` passed after apply with 0
  rows to update.
- `npm run db:refresh:source-citation-readiness` passed with 0 rows to update.
- `npm run db:audit:strict-sources` passed. At that checkpoint, Citation
  Coverage reported `SourceCitation=2615`, `citable_external=153`,
  `citable_with_note=2421`, `internal_context=41`, `blocked_unsourced=0`,
  `FieldCitation=244304`, and external blocking issues `0`. Current `main`
  coverage is recorded in the final update below.
- `npm run research:citation-readiness-queue` passed and wrote 1 row: P0 0,
  P1 0, P2 1, P3 0.
- `npm run audit:citable` passed end to end.
- `npm run research:citable-acceptance-pack` passed and still reports 7 of 12
  cite-ready answers, with 5 blocked fail-closed answers.
- `npm run graph:audit` passed technically; edge confidence coverage remains
  0.6 percent.
- `npm run build` passed, with the known Next.js multiple-lockfile/worktree-root
  warning.
- `git diff --check` passed.

Current operating status:

- The strict source/citation gate is green.
- The previous 1,963 blocked externally relevant field citations are remediated.
- The previous 10 missing claim-text audit issues are remediated.
- The `agrianalyse-bondens-andel-2025` queue item is explicitly marked
  `blocked_source`; it is now P2 because it is excluded from external evidence
  use unless a real source locator is added later.
- The other 10 former P2 queue items are internal/composite/register reports
  without one single URL. They are not strict audit failures and no longer stay
  in the open readiness queue because their `provenanceType` decisions and
  `supportingSources` bibliographies are explicit.

## Final Main Update After PR #60 And PR #61

The merged `main` branch now includes both the original citable hardening work
and the post-merge regression fix for internal blocked source markers.

Local database update after syncing `main`:

- `npm run db:backfill:source-citations:apply` added 83 new
  `SourceCitation` rows and 213 new `FieldCitation` rows from existing locators
  only. It did not change tracked files.
- The first strict audit after that exposed 36 newly created
  `blocked_unsourced` source citations backing 67 field citations. Root cause:
  internal `source:blocked-unsourced/...` markers could inherit a candidate
  `sourceClass: primary`.
- PR #61 fixed that behavior and extended
  `npm run db:refresh:source-citation-readiness:apply` to repair existing rows.
- The repair moved 36 source citations from `blocked_unsourced` to
  `internal_context`; the follow-up dry-run reported 0 updates.

Current verified local DB citation coverage:

- `SourceCitation=2698`
- `citable_external=153`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

Final verification on current `main`:

- `npm test`: passed, 176 tests across 40 suites.
- `npm run lint`: passed.
- `npm run db:refresh:source-citation-readiness`: passed, 2,698 rows scanned,
  0 rows to update.
- `npm run db:audit`: passed with documented warnings only.
- `npm run db:audit:strict-sources`: passed.
- `npm run audit:citable`: passed end to end.
- `npm run research:citable-acceptance-pack`: passed, 7 of 12 answers
  cite-ready and 5 fail-closed blocked.
- `npm run compute-file-coverage`: passed, 1,264 candidate files scanned, 310
  findings: 0 HIGH, 0 MEDIUM, 310 LOW. SourceDoc locator findings are now 0.
- `npm run db:check-urls -- --csv-only`: passed, 600 unique URLs checked in
  821.0s: 506 ok, 2 redirect, 41 dead, 49 blocked, 0 timeout, 0 server_error,
  2 other.
- `npm run build-remediation-backlog`: passed, 481 findings: 5 HIGH, 23
  MEDIUM, 453 LOW.
- `npm run graph:audit`: passed, 41,072 nodes, 1,641 edges, 0 missing endpoint
  edges, 0 duplicate node ids, 0 orphan board-member graph rows, 187
  board-member profile gaps, and 34.8 percent confidence coverage.
- `npm run build`: passed; build-generated timestamp-only chart-metric diffs were
  cleaned afterwards.
- `git diff --check`: passed.
- `git status --short --branch`: expected clean after this quality-pass commit;
  rerun in the next session to verify no local drift.

## Current Tranche Update

The follow-on quality pass from this handoff is complete for the originally
listed work queue:

- Citation-readiness P2 queue remains at 1 row:
  `agrianalyse-bondens-andel-2025`, intentionally blocked/excluded.
- The 10 HIGH URL-health rows were rechecked with curl fallback. Five were
  resolved as tool-sensitive false positives or transient endpoint failures;
  five remain as real `blocked` access rows: Civita, Salford Worktribe, and
  three Skemman thesis URLs.
- The 42 MEDIUM SourceDoc locator rows are closed. SourceDoc coverage now
  accepts URL, DOI, linked `Document`, or resolvable local file consistently.
- Graph board-member orphan rows are closed by fallback person nodes.
  Remaining graph debt is enrichment-only: 187 board-member rows lack full
  `PersonProfile` pages, and 230 company-name duplicate groups still need
  review.

## Exact Restart Prompt

Use this in the next session:

```text
Vi er i /Users/gabrielfreeman/Documents/Food Systems 2026 på `main`, etter PR #60/#61 og etter committen som fullførte kvalitetspasset fra handoffen. Citable knowledge-base gates er merget, strict source/citation audit er grønn, og lokal DB er oppdatert. Kvalitetspasset reduserte citation-readiness-køen til 1 P2 (`agrianalyse-bondens-andel-2025`), SourceDoc-lokatorfunn til 0, HIGH URL-health til 5 blokkerte tilgangsfunn, og graph orphan board-member rows til 0. Start med `git status --short --branch`, `npm test`, `npm run db:audit:strict-sources`, `npm run audit:citable`, `npm run build-remediation-backlog`, og `npm run graph:audit`. Deretter jobb med 5 HIGH URL-health blockers (Civita, Salford Worktribe, Skemman x3), 18 MEDIUM HTML-to-Markdown-ekstraksjoner, 5 MEDIUM scanned-PDF/OCR-funn, og graph enrichment-gjeld (187 board-member profile gaps + 230 company-name duplicate groups). Ikke finn opp eller inferer nye kilde-URL-er; bruk bare eksisterende repo-/database-metadata, live-verifiserte kilder eller dokumentert evidens.
```

## First Commands In New Session

Run:

```bash
cd "/Users/gabrielfreeman/Documents/Food Systems 2026"
git status --short --branch
git log --oneline --decorate -5
npm test
npm run db:audit
npm run db:audit:strict-sources
npm run db:refresh:source-citation-readiness
npm run audit:citable
npm run research:citable-acceptance-pack
npm run graph:audit
head -20 research/citation-readiness-queue-2026-05-20.csv
sed -n '1,140p' research/REMEDIATION-BACKLOG.md
```

Expected:

- `npm test` should pass.
- `npm run db:audit` should pass.
- `npm run db:audit:strict-sources` should pass unless new source/citation
  regressions were introduced.
- `npm run audit:citable` should pass and write the current readiness queue.
- `npm run audit:citable-reports` should pass.
- `npm run research:citable-acceptance-pack` should pass and report 7/12
  cite-ready, 5 blocked unless acceptance criteria are intentionally changed.
- `npm run graph:audit` should pass. Current expected graph audit has 0 orphan
  board-member graph rows and 187 board-member profile gaps.
- `research/citation-readiness-queue-2026-05-20.csv` should still have 1 P2
  row and no P0/P1 rows unless new evidence or policy decisions were added.

## Next Session Work Queue

Work through the remaining items in this order:

1. Keep the remaining P2 citation-readiness row
   `agrianalyse-bondens-andel-2025` excluded unless a real direct source
   locator is found.
2. Work the 5 remaining HIGH URL-health findings from
   `research/REMEDIATION-BACKLOG.md`: Civita, Salford Worktribe, and Skemman
   (`johannsson-2011`, `sigurdardottir-2017`, `burgherr-2019`). Live-verify
   before changing any URL; blocked alone is not proof that the source is dead.
3. Work the 23 MEDIUM remediation rows: 18 HTML-to-Markdown extractions and 5
   scanned-PDF/OCR findings.
4. Decide the next graph-quality tranche: 187 board-member profile gaps and 230
   company-name duplicate review groups remain, while graph endpoint integrity
   is clean.
5. Re-run the operator sequence and update this handoff/status file before
   committing any next tranche.

## Stop Rules For Next Session

Stop and report instead of pushing forward if:

- Prisma migration generation would drop or rewrite existing data unexpectedly.
- strict-source failures expand beyond the known groups before any edits.
- backfill scripts would need to invent or infer source URLs not already present in repo/database metadata.
- public report changes require deciding a disputed fact rather than resolving a documented contradiction.

## Recommended First Milestone

The first milestone is complete:

1. Establish baseline and gates.
2. Define citation policy in code and docs.
3. Add `SourceCitation` and `FieldCitation` schema.
4. Implement citation contract and readiness logic.

The second milestone is also complete:

5. Backfill citations from existing locators.
6. Add citation audit gate.
7. Export prioritized citation readiness queue.

The third milestone is complete:

8. Close current strict-source label failures without inventing source URLs.
9. Remediate current file, URL and PDF evidence risks and document residual live-access blockers.
10. Add fail-closed external public use and visible citation state.
11. Audit the Nordic circularity report package for citable-use drift and fix the known contradictions.
12. Build the citable-use acceptance test document and generated acceptance pack.
13. Normalize claim-register, evidence-matrix, and Nordic core-source external-use decisions.
14. Add citable workflow scripts, standard operator sequence, and fail-closed documentation rule.
15. Run final verification and document the remaining citation coverage blockers.
16. Refresh stale citation readiness from existing locators, backfill missing
    field claim text, and verify that strict source/citation gates pass.

Continue with the five residual blocked URL-health rows and MEDIUM extraction
work, not strict citation remediation. The strict-source source-label groups,
strict citation coverage blockers, SourceDoc locator queue, and board-member
graph orphan rows are closed. The residual readiness queue is one P2
policy/content-review item: the `agrianalyse-bondens-andel-2025`
`blocked_source` report.

## What Counts As Ready For External Use

External use requires one of:

- `citable_external`
- `citable_with_note`

Everything else must be excluded or rendered as internal context:

- `internal_context`
- `blocked_unsourced`

This is the key rule for making the knowledge base useful without overstating the evidence.
