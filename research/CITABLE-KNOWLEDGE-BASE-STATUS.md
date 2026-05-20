# Citable Knowledge Base Status

Date: 2026-05-20
Branch: `citable-knowledge-base-hardening-2026-05-20`
Base commit: `72c5154 chore: harden data source quality`

## Purpose

This file is the current operational status for making the Food Systems 2026
knowledge base usable as a citable external knowledge base. It replaces older
snapshot interpretation for this workstream. Historical audit counts should be
treated as stale unless repeated here.

## Standard Operator Sequence

Run this sequence before claiming the knowledge base is externally citable:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
```

Current note: `npm run db:audit:strict-sources` now passes after citation
coverage remediation. The readiness queue still tracks 11 P2 residual report
rows: one intentionally blocked report source and 10 internal/composite reports
without a single URL. These are not strict external-citation blockers.

## Baseline Commands

| Command | Result | Notes |
|---|---:|---|
| `npm install` | passed | 746 packages installed in the fresh worktree, 0 vulnerabilities reported. |
| `npm test` | passed | 100 tests passed. |
| `npm run db:generate` | passed | Required in the fresh worktree because `src/generated/prisma` is ignored. |
| `npm run db:audit` | passed with warnings | All enforced integrity checks passed. |
| `npm run db:audit:strict-sources` | failed as expected | 3 enforced source violations, matching the known strict-source groups after local ignored evidence files were synced into the worktree. |
| `npm run graph:audit` | passed | Technical graph integrity passed. Practical graph coverage remains weak. |

Fresh-worktree setup note: the first `db:audit` failed because the generated
Prisma client was absent. After `npm run db:generate`, the next audit failed
because ignored local `.env`, `.env.local`, and local research evidence files
were not present in the worktree. Those local setup files were copied/synced
from the original checkout without changing tracked source files.

## Milestone Verification After Tasks 1-4

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 122 tests passed across 27 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:audit` | passed with warnings | Integrity gates passed; quality warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Same 3 strict-source groups remain; no new blocker group was introduced. |
| `npm run graph:audit` | passed | 40,885 nodes, 1,076 edges, 39,976 isolated nodes, 0.6 percent edge confidence. |
| `npm run build` | passed | Build completed; Next.js warned about multiple lockfiles/root inference in the worktree. |
| `git diff --check` | passed | No whitespace errors reported. |

## Milestone Verification After Tasks 5-7

| Command | Result | Notes |
|---|---:|---|
| `npm run db:backfill:source-citations` | passed | Dry-run wrote `research/citation-backfill-preview-2026-05-20.csv` and left counts unchanged at `SourceCitation=71`, `FieldCitation=1286`. |
| `npm run db:backfill:source-citations:apply` | passed | Created 2,544 `SourceCitation` rows and 243,018 `FieldCitation` rows from existing locators only. |
| second `npm run db:backfill:source-citations:apply` | passed | Idempotence check: 0 source citations and 0 field citations to create. Counts stayed at `SourceCitation=2615`, `FieldCitation=244304`. |
| `npm test -- tests/lib/citation-audit.test.ts tests/lib/source-quality-audit.test.ts` | passed | Full test runner reported 131 tests passing. |
| `npm run db:audit` | passed with warnings | New `Citation Coverage` section is present; standard mode remains non-failing. |
| `npm run db:audit:strict-sources` | failed as expected | Now fails on 5 enforced groups: the 3 source-label groups plus citation coverage blockers. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 2,184 rows: 2,174 P0 and 10 P2. |

## Milestone Verification After Task 8

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/row-source-locators.test.ts tests/lib/source-quality-audit.test.ts` | passed | Full test runner reported 138 tests passing. |
| `npm run research:source-gap-queue` | passed | Wrote `research/_status/strict-source-gap-queue.json` with 0 groups and 0 rows. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 1,974 rows: 1,964 P0 and 10 P2. |
| `npm run db:audit` | passed with warnings | Source Quality Coverage is now 100 percent direct URL/DOI/internal/resolved locator for `CompanyFinancial`, `BusinessRelationship`, and `CountryMetric`; citation coverage warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Source-label strict groups are closed. The strict gate now fails only on 2 citation coverage violations: 1,963 externally relevant blocked `FieldCitation` rows and 10 external blocking audit issues. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, chart metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `git diff --check` | passed | No whitespace errors reported. |

## Milestone Verification After Task 9

| Command | Result | Notes |
|---|---:|---|
| `npm run check-pdf-quality` | passed | 399 cataloged PDFs, 398 analyzed, 1 skipped too large, 0 missing; 5 scanned, 44 low-text, 349 ok. |
| `npm run ocr-scanned-pdfs` | passed | Processed 5 scanned PDFs; archived OCR text for 4, skipped 1 tiny likely corrupt RASTECH PDF, updated 0 `Document` rows, extracted 69,334 OCR words. |
| `npm run triage-html` | passed | 29 HTML files; 0 HIGH, 18 MEDIUM `needs-md-extraction`, 11 LOW navigation/error/snapshot issues. |
| `npm run inventory-urls` | passed | Final inventory has 870 URL occurrences and 600 unique URLs. |
| `npm run db:check-urls -- --csv-only` | passed | Final run checked 600 unique URLs: 493 ok, 2 redirect, 41 dead, 52 blocked, 5 timeout, 5 server_error, 2 other. |
| `npm run compute-file-coverage` | passed | 1,262 candidate files scanned; 351 findings: 0 HIGH, 42 MEDIUM, 309 LOW. |
| `npm run build-remediation-backlog` | passed | Final backlog has 535 findings: 10 HIGH, 65 MEDIUM, 460 LOW. |
| `npm test -- tests/lib/url-health-classifier.test.ts` | passed | Full test runner reported 141 tests passing after URL-classifier/checker changes. |
| `npm test` | passed | Full test runner reported 141 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Still fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `git diff --check` | passed | No whitespace errors reported after cleaning one generated HTML-triage trailing-space line. |

Task 9 fixed the dead/high URL class where a verified replacement was available.
Source URLs were updated only after live checks, including direct or persistent
URLs for Dagligvaretilsynet reports, NVA/handle thesis pages, NOU 2013:6, NIBIO,
Dagligvaretilsynet/Samfunnsøkonomisk Analyse PDFs, Nordic Council PDFs, ICA
Gruppen, Konkurrensverket PDFs, KKV Finland, PMC/PubMed, Trace Tennessee, JYX,
and SLU fulltext.

Remaining Task 9 HIGH items are URL-health access blockers only. They are not
local-file coverage blockers:

- blocked: Civita, Salford Worktribe, Skemman, and Konkurrensverket URLs.
- timeout/server-error: transient LUT/URN checks seen in the final run.

The Skemman/Salford/Civita replacements were not patched because no stable,
verified alternative source URL was found in this pass. Konkurrensverket direct
PDF URLs are live by `curl`, but the Node-based checker still receives 403 from
that site and therefore keeps them in the live-access backlog.

## Milestone Verification After Task 10

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citable-record-filter.test.ts` | passed | Full test runner reported 145 tests passing; the new filter tests cover missing citation arrays, blocked/internal exclusion, required notes, filtering, and summaries. |
| `npm test` | passed | Full test runner reported 145 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run graph:audit` | passed | Graph integrity still passes: 40,885 nodes, 1,076 edges, 0 missing endpoint edges, 0 duplicate node ids, and 0.6 percent confidence coverage. |
| `npm run db:audit:strict-sources` | failed as expected | Still fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `git diff --check` | passed | No whitespace errors reported before status-doc updates. |

Task 10 implemented fail-closed public use and visible citation state:

- `src/lib/citations/citable-record-filter.ts` is the shared external-use gate
  for records with citation arrays.
- `/rapporter` derives readiness from existing source citations, source URLs,
  local file paths, report provenance, and supporting-source metadata. Reports
  that are not externally citable keep metadata visible but hide findings,
  recommendations, and relevance text behind an explicit external-use caveat.
- `/bibliotek/[...slug]`, `/selskap/[id]`, `/sirkularitet`, and
  `/forsyningskjede` now show `Citation`/`CitationBibliography` labels next to
  document, corporate, benchmark, chart, and data-quality claims.
- Visualization components propagate readiness via `SourceFootnote`,
  `EvidenceStatusBadge`, `ChartFrame`, and `DataQualityStrip`.
- The public graph adapter filters explicit blocked source markers from
  ownership, business-relationship, and property graph edges before they feed
  public graph output.

## Milestone Verification After Task 11

| Command | Result | Notes |
|---|---:|---|
| `npm run audit:citable-reports` | passed | The Nordic circularity report audit exited 0 with no issues found. |
| `npm test -- tests/lib/report-claim-audit.test.ts` | passed | Full test runner reported 148 tests passing; the new audit tests cover T3 contradiction detection, unsupported highlighted numeric claims, and resolved numeric claims with source citations. |
| `npm test` | passed | Full test runner reported 148 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run graph:audit` | passed | Graph integrity still passes: 40,885 nodes, 1,076 edges, 0 missing endpoint edges, 0 duplicate node ids, and 0.6 percent confidence coverage. |
| `npm run db:audit:strict-sources` | failed as expected | Still fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `git diff --check` | passed | No whitespace errors reported before this status-doc update. |

Task 11 implemented report-specific citable-use checks and fixed the existing
Nordic circularity report drift:

- `src/lib/citations/report-claim-audit.ts` and
  `scripts/audit-citable-reports.ts` now audit the HTML report, appendix,
  sprint README, claim audit, primary-check notes, self-critique, and T3 diff
  note together.
- The audit blocks inconsistent T3 status text, Copenhagen percentage drift,
  README line-count/KB quality claims, HHI/CR3 mislabelling, unresolved weak
  claim markers, and highlighted numerical claims without source or caveat.
- T3 is now consistently described as completed in v1.2 Phase 8, but as an
  internal method check rather than external validation.
- Copenhagen public-kitchen organic share is standardized to 85 percent in
  2024, with peak context where relevant.
- Norwegian concentration is labelled as `HHI 3445 (CR3 96,6%)`, not `HHI
  96,6%`.
- The weak IFRO soy bibliography placeholder was replaced with the concrete
  IFRO Documentation 2025-01 citation, and the sprint README no longer treats
  generated report line count or file size as a quality claim.

## Milestone Verification After Task 12

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citable-acceptance.test.ts` | passed | Full test runner reported 151 tests passing; the new acceptance tests enforce category coverage, required evidence fields, and fail-closed result status. |
| `npm run research:citable-acceptance-pack` | passed | Wrote `research/CITABLE-ACCEPTANCE-TESTS.md`, `research/citable-acceptance-pack-2026-05-20.json`, and `research/citable-acceptance-pack-2026-05-20.md`; output is 7 of 12 cite-ready and 5 blocked. |
| `npm test` | passed | Full test runner reported 151 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run graph:audit` | passed | Graph integrity still passes: 40,885 nodes, 1,076 edges, 0 missing endpoint edges, 0 duplicate node ids, and 0.6 percent confidence coverage. |
| `npm run audit:citable-reports` | passed | Nordic circularity report audit still exits 0 with no issues found. |
| `npm run db:audit:strict-sources` | failed as expected | Still fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `git diff --check` | passed | No whitespace errors reported before this status-doc update. |

Task 12 added an acceptance pack for "can be cited" use:

- `src/lib/citations/citable-acceptance.ts` is the canonical acceptance-test
  data model and formatter for this tranche.
- The pack has 12 questions: 3 Nordic circularity/cascade, 2 market
  concentration, 2 food waste, 2 ownership/company structure, 1 public subsidy,
  1 library source, and 1 graph relationship.
- Each question declares expected source type, required readiness level, must-use
  evidence, must-not-use evidence, and known caveat.
- `scripts/build-citable-acceptance-pack.ts` writes both the acceptance test
  document and the generated JSON/Markdown answer pack.
- Current answer-pack outcome is 7 cite-ready answers and 5 explicitly blocked
  answers. The blocked cases are intentional fail-closed checks where current
  evidence is internal context or `citable_with_note` but the question requires
  `citable_external`.

## Milestone Verification After Task 13

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citable-register-docs.test.ts` | passed | Full test runner reported 153 tests passing; the new documentation audit confirms all 42 formal claims have external-use decisions and that evidence/core-source mappings are present. |
| `npm test` | passed | Full test runner reported 153 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run graph:audit` | passed | Graph integrity still passes: 40,885 nodes, 1,076 edges, 0 missing endpoint edges, 0 duplicate node ids, and 0.6 percent confidence coverage. |
| `npm run audit:citable-reports` | passed | Nordic circularity report audit still exits 0 with no issues found. |
| `npm run research:citable-acceptance-pack` | passed | Acceptance pack still writes 12 questions with 7 cite-ready and 5 blocked. |
| `npm run db:audit:strict-sources` | failed as expected | Still fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `git diff --check` | passed | No whitespace errors reported before this status-doc update. |

Task 13 normalized the document-level citation decisions:

- `docs/project/mandates/claim-register-food-tg.md` now has an
  `External-use decision ledger` covering all 42 formal `CL-A/B/C-*` claims.
  Each row includes `citationReadiness`, `sourceCitationIds`,
  `fieldCitationIds`, `externalUse`, and `blockedReason`.
- `docs/project/mandates/evidence-matrix-food-tg.md` now separates source
  evidence from internal synthesis and documents how old `Høy`/`Medium`/`Lav`
  usage maps into canonical readiness.
- `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md` now has
  explicit external-use normalization for `db-linked`, `repo/static`,
  `internal-synthesis`, `needs-primary-check`, and `not-citable-input`;
  `NORDIC-CORE-017` remains `blocked_unsourced` for evidentiary use.

## Milestone Verification After Task 14

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citable-workflow-docs.test.ts` | passed | Full test runner reported 155 tests passing; the new workflow-doc test enforces package scripts, operator commands, and the fail-closed documentation rule. |
| `npm test` | passed | Full test runner reported 155 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run build` | passed | Prisma generation, metric computation, TypeScript, and Next.js production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run graph:audit` | passed | Graph integrity still passes: 40,885 nodes, 1,076 edges, 0 missing endpoint edges, 0 duplicate node ids, and 0.6 percent confidence coverage. |
| `npm run audit:citable-reports` | passed | Nordic circularity report audit still exits 0 with no issues found. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 1,974 rows: 1,964 P0 and 10 P2. |
| `npm run research:citable-acceptance-pack` | passed | Acceptance pack still writes 12 questions with 7 cite-ready and 5 blocked. |
| `npm run audit:citable` | failed as expected | The aggregate workflow runs `db:audit` successfully, then fails at `audit:citations` only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `git diff --check` | passed | No whitespace errors reported before this status-doc update. |

Task 14 made the operator workflow explicit:

- `package.json` now has `audit:citations` as the strict source/citation gate
  and `audit:citable` as the aggregate citable-use gate.
- `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` now starts with the standard
  operator sequence for external-citation readiness checks.
- `research/AKADEMISK-KILDEHANDTERING-PLAN.md` now states the fail-closed rule:
  claims without external-ready citations must be excluded from external output
  or displayed as internal context, and internal synthesis must not silently
  become source evidence.

## Final Verification After Task 15

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citation-status.test.ts tests/lib/source-citation-contract.test.ts tests/lib/citation-readiness.test.ts tests/lib/citation-audit.test.ts tests/lib/citable-record-filter.test.ts tests/lib/report-claim-audit.test.ts` | passed | The repo test script includes `tests/**/*.test.ts`, so this focused command executed the full suite and reported 155 tests passing. |
| `npm test` | passed | Full test runner reported 155 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:audit` | passed with warnings | Enforced integrity checks passed; citation coverage warnings remain. |
| `npm run db:audit:strict-sources` | failed as expected | Strict source/citation audit fails only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues. |
| `npm run audit:citable-reports` | passed | Citable report audit found no issues. |
| `npm run research:citation-readiness-queue` | passed | Wrote `research/citation-readiness-queue-2026-05-20.csv` with 1,974 rows: P0 1,964, P1 0, P2 10, P3 0. |
| `npm run research:citable-acceptance-pack` | passed | Wrote the acceptance artifacts; 7 of 12 answers are cite-ready and 5 are blocked. |
| `npm run graph:audit` | passed | Technical graph integrity passed; edge confidence coverage remains 0.6 percent. |
| `npm run build` | passed | Production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `git diff --check` | passed | No whitespace errors reported after build regenerated chart metrics. |

Task 15 readiness result, now superseded by the continuation section below:
this branch had the citable workflow, audit gates, fail-closed UI/report
handling, acceptance pack, and handoff documentation in place, but strict
citation coverage still failed at that checkpoint.

Task 15 citation-readiness backlog:

- P0: 1,964 rows.
- P1: 0 rows.
- P2: 10 rows.
- P3: 0 rows.

What can be cited externally now:

- Only records, report claims, UI fields, or generated answers that resolve to
  `citable_external` or `citable_with_note` and display any required caveat.
- The current acceptance pack marks these as cite-ready: CA-001 Copenhagen
  public procurement benchmark, CA-003 cascade priority logic, CA-004 Norway
  HHI/CR3 wording, CA-006 FI-DK food-waste difference, CA-007 Salling Group
  food-waste reduction, CA-008 company/ownership structures from the guarded
  company surfaces, and CA-010 public subsidy rows.

What remains internal-only or blocked:

- T3 cannot be cited as external validation; it is an internal method check.
- The Finland 30 percent rule remains blocked as an external legal comparison
  until an official legal locator is attached.
- Graph-only evidence remains blocked for board/person relationships and
  exportable relationship claims.
- Library entries with only local PDF/title metadata remain blocked for
  external citation.
- Any claim backed only by `internal_context` or `blocked_unsourced` remains
  excluded from external output or must be displayed as internal context.

Task 15 recommended next tranche, now superseded by the continuation section
below:

1. Work through `research/citation-readiness-queue-2026-05-20.csv` P0 first.
2. For each row, either attach an existing direct locator/local evidence record,
   downgrade to internal context, or exclude it from public/external output.
3. Fix the 10 missing-claim-text audit issues.
4. Re-run `npm run audit:citable`; only consider commit/merge when strict
   citation coverage is green or remaining failures are explicitly non-public
   P2/P3 residuals.

## Continuation Verification After Citation Coverage Remediation

This continuation remediated the strict citation coverage blockers without
inventing new source URLs:

- `scripts/refresh-source-citation-readiness.ts` re-derived stale
  `SourceCitation.citationReadiness` values from existing locators and existing
  verification metadata only.
- First apply refreshed 2,519 rows: 58 `blocked_unsourced -> citable_external`,
  2,448 `blocked_unsourced -> citable_with_note`, and 13
  `blocked_unsourced -> internal_context`.
- Second apply downgraded 27 URL-backed-but-missing-local-path stale rows from
  `citable_with_note -> internal_context`, because their only usable evidence
  was not the missing local file path.
- The refresh is now idempotent: `npm run db:refresh:source-citation-readiness`
  scans 2,615 rows and reports 0 updates.
- `scripts/backfill-field-citation-claim-text.ts` filled the 10 missing
  `Company.naceDescription` claim texts from existing `Company` values; the
  second dry-run reports 0 rows to update.
- `scripts/export-citation-readiness-queue.ts` now uses the same normalized
  verification semantics as the audit gate, so legacy `machine_verified` and
  `human_verified` rows are not false P1 queue items.

Fresh continuation verification:

| Command | Result | Notes |
|---|---:|---|
| `npm test -- tests/lib/citation-readiness-queue.test.ts tests/lib/field-citation-claim-text.test.ts` | passed | The repo test script includes `tests/**/*.test.ts`; after the excluded-blocker queue test was added, the focused command reported 167 tests passing. |
| `npm test` | passed | Full test runner reported 167 tests passing. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:backfill:field-citation-claim-text` | passed | Idempotence check after apply: 0 rows scanned and 0 rows to update. |
| `npm run db:refresh:source-citation-readiness` | passed | Idempotence check: 2,615 rows scanned, 0 rows to update. |
| `npm run db:audit:strict-sources` | passed | Citation Coverage: `SourceCitation=2615`, `citable_external=153`, `citable_with_note=2421`, `internal_context=41`, `blocked_unsourced=0`, `FieldCitation=244304`, external blocking issues `0`. |
| `npm run research:citation-readiness-queue` | passed | Wrote 11 rows: P0 0, P1 0, P2 11, P3 0. The `agrianalyse-bondens-andel-2025` `blocked_source` report is explicitly excluded from external evidence use and stays in P2. |
| `npm run audit:citable` | passed | `db:audit`, strict `audit:citations`, citable report audit, and queue export all completed with exit 0. |
| `npm run research:citable-acceptance-pack` | passed | Regenerated acceptance artifacts; 7 of 12 answers are cite-ready and 5 are blocked. |
| `npm run graph:audit` | passed | Technical graph integrity passed; edge confidence coverage remains 0.6 percent. |
| `npm run build` | passed | Production build passed; Next.js repeated the known multiple-lockfile/worktree-root warning. |
| `git diff --check` | passed | No whitespace errors reported. |

Current readiness result: strict source and citation gates are green for
external-ready rows. The branch is no longer blocked by the previous 1,963
blocked field citations or the 10 missing claim-text issues.

Current citation-readiness queue:

- P0: 0 rows.
- P1: 0 rows.
- P2: 11 rows: one intentionally blocked report source
  (`agrianalyse-bondens-andel-2025`) plus 10 internal/composite reports with no
  single source URL.
- P3: 0 rows.

Recommended next tranche:

1. Review whether `agrianalyse-bondens-andel-2025` should remain an explicitly
   excluded P2 report-source queue item or receive a real source locator later.
2. Decide whether the 10 internal/composite reports without a single URL should
   stay as P2 queue items or receive explicit supporting-source bibliographies.
3. Re-run the full operator sequence after any content or public-surface edits.

## Schema Migration Discovery

The live local database already had legacy `SourceCitation` and
`FieldCitation` tables before this worktree added the schema definitions:

- `SourceCitation`: 71 existing rows.
- `FieldCitation`: 1,286 existing rows.
- `FieldCitation.fieldPath`: 201 existing rows are record-level citations with
  null `fieldPath`.

For that reason, the schema and migration were implemented as a non-destructive
compatibility layer instead of a clean-table replacement. Legacy enum values
remain accepted, `fieldPath` remains nullable, and the new
`citationReadiness` column defaults fail-closed to `blocked_unsourced`.

The two local migrations applied and were marked resolved:

- `20260520_source_citation_enum_values`
- `20260520_source_citations`

## Current Strict-Source Blockers

These records are blocked for external citation until each row has a direct
locator, a supported internal provenance classification, or is excluded from
external use.

| Group | Current status |
|---|---|
| `CompanyFinancial.source` | Closed in Task 8: 151 of 151 have direct, resolved, or internal blocked source locators. Estimate and unverified annual-report labels are explicitly mapped to `source:blocked-unsourced/...` markers, not treated as external evidence. |
| `BusinessRelationship.source` | Closed in Task 8: 50 of 50 have direct, resolved, or internal blocked source locators. Unverified relationship labels are explicitly mapped to `source:blocked-unsourced/business-relationship-unverified-label`; the existing KKV 4a source label maps to the existing repo/database locator. |
| `CountryMetric.source` | Closed in Task 8: 415 of 415 have direct, resolved, or internal blocked source locators. Known Luke, Eurostat, Miljostyrelsen, Samkeppniseftirlitid, and Konkurransetilsynet labels use existing repo/database locators; unresolved estimates and generic labels are blocked. |
| `Strict source-gap queue` | `research/_status/strict-source-gap-queue.json` now reports 0 groups and 0 rows. |
| `Citation Coverage` | Closed in the continuation pass: strict audit now reports 2,615 `SourceCitation` rows, 0 `blocked_unsourced` source citations, 244,304 `FieldCitation` rows, and 0 external blocking citation issues. |

The strict audit also confirmed:

- `Document` locator coverage: 1063 of 1063 have resolvable local `filePath`.
- `Shareholder.source`: 62 of 62 have direct/resolved locator and `verifiedAt`.
- `BoardMember.source`: 565 of 565 have direct/resolved locator and `verifiedAt`.

## Soft Quality Risks

- `graph:audit` passed technically, but graph coverage is weak: 40,885 nodes,
  1,076 edges, 39,976 isolated nodes, and 0.6 percent edge confidence coverage.
- 11 reports intentionally have no single source URL because they are internal
  synthesis, internal register, composite source, or blocked source records.
- DOI and persistent-ID coverage is uneven: theses 36 of 78, reports 20 of 129,
  and active sources 6 of 191.
- `graph:audit` reports 230 duplicate company-name groups and 187 board-member
  graph rows without matching person-profile graph nodes. This is a graph
  quality limitation, not a failed integrity gate.

## Citation Readiness Policy

External use is fail-closed. A claim, record, chart, public report item, or
exported analytical answer can be used externally only when it resolves to one
of these readiness levels:

- `citable_external`: usable externally without extra caveat.
- `citable_with_note`: usable externally when the caveat or method note is
  displayed with the claim.

Everything else must be excluded from external output or rendered explicitly as
internal context:

- `internal_context`: usable internally for analysis, mapping, and ideation,
  but not as documentary citation support.
- `blocked_unsourced`: not usable in external reports, charts, exports,
  presentations, or citation-backed answers.

## Current Implementation Status

- Task 1 baseline and gate capture is complete.
- Task 2 canonical citation readiness module and policy-document alignment is
  complete.
- Task 3 Prisma `SourceCitation` and `FieldCitation` schema coverage is
  complete with non-destructive migrations for the existing local tables.
- Task 4 citation contract and readiness derivation logic is complete.
- Task 5 citation backfill from existing locators is complete and idempotent.
- Task 6 citation audit gate is wired into `npm run db:audit` and
  `npm run db:audit:strict-sources`.
- Task 7 citation readiness queue export is complete.
- Task 8 current strict-source failures are closed without inventing new source
  URLs: known locators are mapped where already present, and unresolved labels
  are fail-closed as internal blocked source markers.
- Task 9 file, URL, HTML and PDF evidence-risk remediation is complete for this
  tranche. The remaining HIGH backlog items are URL live-access blockers or
  transient URL-health failures, not missing local document files.
- Task 10 fail-closed public external use and visible citation state is
  complete for the current public surfaces.
- Task 11 report-specific citable-use audit and Nordic circularity report drift
  fixes are complete.
- Task 12 citable acceptance-test document and generated answer pack are
  complete.
- Task 13 claim-register, evidence-matrix, and Nordic core source readiness
  normalization is complete.
- Task 14 citable workflow scripts, standard operator sequence, and fail-closed
  documentation rule are complete.
- Task 15 final verification and handoff is complete. The follow-on citation
  coverage remediation is also complete: strict source/citation audit now
  passes with 0 external blocking citation issues. The readiness queue has 0
  P0 rows, 0 P1 rows, 11 P2 rows, and 0 P3 rows; the residual P2 set is one
  explicitly `blocked_source` report plus 10 internal/composite reports without
  a single source URL.
- Any further backfill must use only existing locators and metadata. It must not
  invent or infer source URLs that are not already present in repo or database
  metadata.
