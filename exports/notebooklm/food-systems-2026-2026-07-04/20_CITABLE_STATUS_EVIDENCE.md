# Citable Status Evidence

Export date: 2026-07-04
Packet type: evidence
Status label: citable/status snapshot
Allowed use: Use only according to the status label. Keep caveats and missing cells visible.

## What This Source Is For

Curated evidence packet for citable status evidence.

## Core Claims Or Working Propositions

- Use the included excerpts as source-grounded context, not as permission to upgrade claims.
- Preserve source labels, method distinctions and explicit gaps.
- If the source says wait, parked, actor-gated or do-not-visualize-yet, keep that boundary.

## Evidence Table

| Signal | Use | Boundary |
| --- | --- | --- |
| Included source excerpts | Give NotebookLM retrieval surface. | Excerpted for quality; source file remains canonical. |
| Status label | Controls allowed use. | Do not upgrade without separate verification. |
| Known gaps | Useful for decisions and actor questions. | Missing values must stay visible. |

## Known Caveats

- This packet may combine sources with different evidence levels.
- Do not create external deck claims without checking the strictest status among the supporting sources.

## Deck Angles

- Use as evidence spine for a slide or appendix section.
- Phrase as "what the evidence supports" plus "what remains blocked".

## Bad Generic Framing To Avoid

- Do not remove the source label.
- Do not turn a candidate or shortlist into a completed finding.

## Source Paths Included

- research/CITABLE-KNOWLEDGE-BASE-STATUS.md

## Source Excerpts

### research/CITABLE-KNOWLEDGE-BASE-STATUS.md

````markdown
# Citable Knowledge Base Status

Date: 2026-06-10
Branch: `codex/food-tg-mandat-2026-06-09`
Base before current quality-pass commit: `f302ab3 docs: prepare next citable quality tranche`

## Purpose

This file is the current operational status for making the Food Systems 2026
knowledge base usable as a citable external knowledge base. It replaces older
snapshot interpretation for this workstream. Historical audit counts should be
treated as stale unless repeated here.

## 2026-06-10 Strict-Gate Re-Greening (supersedes all verification sections below)

Running the operator sequence on `codex/food-tg-mandat-2026-06-09` found the
strict source gate had **regressed to red** since the 2026-05-20 snapshot: three
enforced violations in `db:audit:strict-sources` / `audit:citations` §13. The
non-strict `db:audit`, `audit:citable-reports`, tests, lint, and build all
stayed green; the regression was data/code drift after the 2026-05-26 gate
change (`9e68918`) and the 2026-06-03 KS/Re:Source import, not from any docs
commit on this branch.

The three blocker groups and their fixes:

- **A — 1 `CompanyOwnership` label-only row.** NorgesGruppen → BAMA Gruppen (46%)
  carried a bare `Brønnøysund` source that missed the resolver's
  `bronnoysund + arsrapport` annual-report case. Set the source to
  `Brønnøysund årsrapport 2024` so the existing resolver returns the BAMA 2024
  annual-report URL. Applied to the DB **and** to the seed-of-truth
  `scripts/import-company-ownership.ts` so it survives re-import and reaches
  prod on the next `db:import`.
- **B — 4 `BusinessRelationship` `Bransjeanalyse` rows** (Skretting→Lerøy/SalMar/
  Mowi feed, Yara→Felleskjøpet fertilizer). `Bransjeanalyse` was the only vague
  industry-label not in `BLOCKED_BUSINESS_RELATIONSHIP_SOURCE_LABELS`; added it
  so those rows carry the same honest blocked-unverified locator as their
  siblings (`Bransjedata`, `BioMar`, …). This also cleared the 4 P0 rows that
  had appeared in the readiness queue.
- **C — 11 internal-exception report `Document` rows** (`internal_synthesis` /
  `composite_source` / `internal_register` / `blocked_source`, each with
  `supportingSources`). The report-URL check (#11) already honoured these
  provenance exceptions, but the Document locator check (§13) did not — a
  coherence gap. Extracted #11's exact predicate into a shared
  `reportQualifiesAsProvenanceException()` used by **both** checks so they
  cannot drift; §13 now exempts Documents whose linked report is a reviewed
  provenance exception. No fabricated locators.

Verification after the fixes (all green):

| Command | Result | Notes |
|---|---:|---|
| `npm test` | passed | 446 tests across 111 suites, 0 fail (incl. new `Bransjeanalyse` resolver test). |
| `npm run lint` | passed | ESLint clean. |
| `npm run db:audit` | passed | Enforced integrity checks pass. |
| `npm run db:audit:strict-sources` / `audit:citations` | passed | Strict gate exits 0; the three §13 violations are gone. |
| `npm run audit:citable` | passed | Full chain (`db:audit` + strict + citable-reports + readiness) exits 0. |
| `npm run research:citation-readiness-queue` | passed | Down to 1 row: P0 0, P1 0, **P2 1**, P3 0 (the intentionally-blocked `agrianalyse-bondens-andel-2025`). |
| `npm run research:citable-acceptance-pack` | passed | 7 of 12 cite-ready, 5 fail-closed blocked. |
| `npm run build` | passed | Prisma + metrics + Next.js build; timestamp/property-count metric diffs reverted (pre-existing drift, not this fix). |
| `git diff --check` | passed | No whitespace errors. |

Current strict citation coverage (supersedes the PR #60/#61 counts below):

- `SourceCitation=2699`
- `citable_external=154`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

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

Current note: PR #60 and PR #61 are merged to `main`. `npm run
db:audit:strict-sources` now passes after citation coverage remediation and the
post-merge internal-marker fix. The readiness queue now tracks 1 P2 residual
report row: the intentionally blocked `agrianalyse-bondens-andel-2025` source.
The 10 internal/composite/register reports without a single URL are reviewed
sourceUrl exceptions because they have explicit `provenanceType` and
`supportingSources` bibliographies. These are not strict external-citation
blockers.

## Current Main Verification After PR #60 And PR #61

This section supersedes the historical milestone counts below.

| Command | Result | Notes |
|---|---:|---|
| `git status --short --branch` | expected clean after commit | Branch is `main`; rerun after checkout to verify no local drift. |
| `npm test` | passed | 176 tests passed across 40 suites. |
| `npm run lint` | passed | ESLint completed without reported issues. |
| `npm run db:refresh:source-citation-readiness` | passed | 2,698 `SourceCitation` rows scanned, 0 rows to update. |
| `npm run db:audit` | passed | Enforced integrity checks passed; warnings remain documented below. |
| `npm run db:audit:strict-sources` | passed | Strict source/citation gate exits 0. |
| `npm run audit:citable` | passed | `db:audit`, strict `audit:citations`, citable report audit, and queue export all completed with exit 0. |
| `npm run research:citable-acceptance-pack` | passed | Regenerated acceptance artifacts; 7 of 12 answers are cite-ready and 5 are fail-closed blocked. |
| `npm run graph:audit` | passed | 41,072 nodes, 1,641 edges, 0 orphan board-member graph rows, 187 board-member profile gaps, 34.8 percent edge confidence. |
| `npm run build` | passed | Prisma generation, chart metric computation, TypeScript, and Next.js production build passed; timestamp-only chart-metric diffs were cleaned afterwards. |
| `git diff --check` | passed | No whitespace errors reported. |

Current strict citation coverage:

- `SourceCitation=2698`
- `citable_external=153`
- `citable_with_note=2433`
- `internal_context=112`
- `blocked_unsourced=0`
- `FieldCitation=244517`
- external blocking citation issues `0`

Post-merge DB note: syncing `main` and applying the source-citation backfill
added 83 `SourceCitation` rows and 213 `FieldCitation` rows from existing
locators only. A follow-up strict audit found 36 internal
`source:blocked-unsourced/...` marker citations that had been backfilled as
primary/blocked rows. PR #61 fixed the backfill rule and refresh repair path;
the local repair moved those 36 rows to `internal_context`.

Current residual work queue:

- Citation readiness queue: P0 0, P1 0, P2 1, P3 0.
- Remediation backlog: 472 findings total: 0 HIGH, 1 MEDIUM finding, and
  471 LOW findings. SourceDoc locator findings are 0. The former five HIGH
  URL-health blockers are closed in `research/URL-HEALTH-REVIEW.csv` as
  browser-verified tool blocks, citable mirror/local evidence cases, or both;
  the original source URLs were not replaced. The former 18 MEDIUM
  HTML-to-Markdown rows are closed by Markdown companions. Four of the former
  five scanned-PDF MEDIUM rows are closed by `research/PDF-OCR-REVIEW.csv`;
  the remaining MEDIUM row is the 1 KB RASTECH PDF that OCR skipped as likely
  corrupt.
- Graph quality: technical graph audit passes. Board-member graph orphans are
  0 after fallback person nodes; 187 board-member rows still lack full
  `PersonProfile` pages. Edge-confidence coverage is 34.8 percent.

Continuation verification after residual URL/HTML/OCR review:

- `npm test` passed with 181 tests across 42 suites.
- `npm run lint` passed.
- `npm run db:audit:strict-sources` passed.
- `npm run audit:citable` passed and kept the readiness queue at P0 0, P1 0,
  P2 1, P3 0.
- `npm run research:citable-acceptance-pack` passed with 7 of 12 cite-ready and
  5 blocked.
- `npm run graph:audit` passed with 41,072 nodes, 1,641 edges, 0 orphan
  board-member rows, 187 board-member profile gaps, and 34.8 percent edge
  confidence coverage.
- `npm run build` passed with the known worktree multiple-lockfile warning;
  timestamp-only chart-metric diffs were cleaned afterwards.
- `git diff --check` passed.

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
| second `npm run db:backfill:source-citations:apply` | passed | Historical checkpoint idempotence check: 0 source citations and 0 field citations to create. Counts stayed at `SourceCitation=2615`, `FieldCitation=244304` before the later post-merge backfill added more rows. |
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

[Excerpt clipped for NotebookLM retrieval quality. See source path for full file.]
````

