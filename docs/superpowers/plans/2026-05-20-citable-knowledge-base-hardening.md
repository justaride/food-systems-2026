# Citable Knowledge Base Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gjore Food Systems 2026-kunnskapsgrunnlaget egnet for hoy grad av siterbar bruk ved a skille tydelig mellom eksternt siterbare funn, siterbare funn med forbehold, intern kontekst, og underlag som skal blokkeres fra publisering.

**Architecture:** Innfor en fail-closed siteringsmodell pa tvers av database, research-filer, rapporter og UI. Kildenormalisering skjer i Prisma med `SourceCitation` og `FieldCitation`, eksisterende lokatorer backfilles uten a finne pa nye kilder, audit-script gir harde gates, og offentlige rapporter/visualiseringer bruker kun data som er citable-ready eller tydelig merket.

**Tech Stack:** Next.js 16, TypeScript, Prisma 7, Node test runner, ESLint, SQLite/Postgres-compatible Prisma schema, eksisterende research-skript under `scripts/`, og lokale research-artefakter under `research/` og `docs/project/`.

---

## Operating Rule

Malet er ikke bokstavelig at alle rader, notater og hypoteser skal kunne brukes som eksterne sitater. Malet er at alt som brukes i ekstern rapportering, presentasjon, analyseeksport eller beslutningsgrunnlag skal ha en sporbar kildepakke, og at alt annet automatisk holdes tilbake eller merkes som intern kontekst.

## Current Baseline

- `npm test` passer med 100 tester.
- `npm run db:audit` passer.
- `npm run db:audit:strict-sources` feiler pa tre konkrete kildebrudd:
  - `CompanyFinancial.source`: 36 av 151 er label-only.
  - `BusinessRelationship.source`: 32 av 50 er label-only.
  - `CountryMetric.source`: 142 av 415 er label-only.
- `npm run graph:audit` passer teknisk, men viser lav praktisk relasjonsdekning: 40 885 noder, 1 076 kanter, 39 976 isolerte noder, og 0,6 prosent edge confidence.
- `research/URL-HEALTH.md` viser 600 kontrollerte URL-er med 487 ok, 51 dead, 38 blocked, 3 timeout, 6 server_error og 13 other.
- `research/PDF-QUALITY.md` viser 399 katalogiserte PDF-er, 398 analysert, 349 ok, 5 scanned og 44 low-text.
- `research/FILE-COVERAGE.md` viser 348 funn, inkludert 304 orphan_file, 42 missing_file_sourcedoc, 1 broken_supportingsource og 1 duplicate_file_separate_records.
- `research/REMEDIATION-BACKLOG.md` viser 514 funn: 34 HIGH, 49 MEDIUM og 431 LOW.

## Citation Readiness Levels

- `citable_external`: Brukes eksternt uten ekstra forbehold. Krever verifisert primar- eller sekundarkilde, URL eller lokal fil, dato for tilgang/verifisering, og feltkobling til konkret claim/datafelt.
- `citable_with_note`: Kan brukes eksternt med kilde- eller metodeforbehold. Typisk sekundarkilde, aggregert analyse, eller kilde der lokal kopi finnes men punktreferanse ikke er fullstendig.
- `internal_context`: Kan brukes i intern analyse, kartlegging og ideutvikling, men ikke som dokumenterende sitatgrunnlag.
- `blocked_unsourced`: Skal ikke brukes i eksterne svar, rapporter, grafer, eksport eller presentasjoner. Brukes for label-only kilder, manglende lokatorer, uverifiserte hypoteser og funn uten sporbar dokumentasjon.

## File Structure

- Modify: `prisma/schema.prisma`
- Add: `prisma/migrations/20260520_source_citations/migration.sql`
- Add: `src/lib/citations/citation-status.ts`
- Add: `src/lib/citations/source-citation-contract.ts`
- Add: `src/lib/citations/citation-readiness.ts`
- Add: `src/lib/citations/citable-record-filter.ts`
- Add: `src/lib/citations/citation-audit.ts`
- Add: `src/lib/citations/report-claim-audit.ts`
- Add: `src/components/citations/Citation.tsx`
- Add: `src/components/citations/CitationBibliography.tsx`
- Modify: `src/components/visualization/SourceFootnote.tsx`
- Modify: `src/components/visualization/EvidenceStatusBadge.tsx`
- Modify: `src/lib/source-quality-audit.ts`
- Modify: `src/lib/row-source-locators.ts`
- Modify: `src/lib/source-url-inventory.ts`
- Modify: `scripts/verify-data-integrity.ts`
- Modify: `scripts/export-strict-source-gap-queue.ts`
- Add: `scripts/backfill-source-citations-from-existing-locators.ts`
- Add: `scripts/export-citation-readiness-queue.ts`
- Add: `scripts/audit-citable-reports.ts`
- Add: `scripts/build-citable-acceptance-pack.ts`
- Modify: `package.json`
- Add: `tests/lib/citation-status.test.ts`
- Add: `tests/lib/source-citation-contract.test.ts`
- Add: `tests/lib/citation-readiness.test.ts`
- Add: `tests/lib/citation-audit.test.ts`
- Add: `tests/lib/citable-record-filter.test.ts`
- Add: `tests/lib/report-claim-audit.test.ts`
- Modify: `tests/lib/source-quality-audit.test.ts`
- Modify: `tests/lib/row-source-locators.test.ts`
- Modify: `tests/lib/provenance-schema.test.ts`
- Add: `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`
- Add: `research/CITABLE-ACCEPTANCE-TESTS.md`
- Generate: `research/citation-readiness-queue-2026-05-20.csv`
- Modify: `research/AKADEMISK-KILDEHANDTERING-PLAN.md`
- Modify: `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md`
- Modify: `docs/project/mandates/evidence-matrix-food-tg.md`
- Modify: `docs/project/mandates/claim-register-food-tg.md`
- Modify: `research/norden/sirkularitet-sprint-2026-05/README.md`
- Modify: `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md`
- Modify: `public/reports/nordisk-sirkularitetsrapport-2026-05.html`

## Task 1: Establish Baseline And Non-Negotiable Gates

- [x] **Step 1: Confirm branch and dirty state**

Run:

```bash
git status --short --branch
```

Expected: know whether the current branch is clean before schema, audit and report edits start. Do not discard unrelated user edits.

- [x] **Step 2: Re-run current baseline gates**

Run:

```bash
npm test
npm run db:audit
npm run db:audit:strict-sources
npm run graph:audit
```

Expected: `npm test` and `npm run db:audit` pass. `npm run db:audit:strict-sources` is expected to fail only on the known label-only source groups until Task 8 closes them.

- [x] **Step 3: Capture baseline in status doc**

Create `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` with:

- date and branch
- command results
- known hard blockers
- soft quality risks
- distinction between citable, internal, and blocked material

Expected: the status doc becomes the single current operational status, replacing stale interpretation from older generated summaries.

## Task 2: Define Citation Policy In Code And Docs

- [x] **Step 1: Add citation status module**

Create `src/lib/citations/citation-status.ts` with these exported constants and types:

```ts
export const CITATION_READINESS_LEVELS = [
  'citable_external',
  'citable_with_note',
  'internal_context',
  'blocked_unsourced',
] as const;
```

Add helpers:

- `isExternallyCitable(level)`
- `isBlockedForExternalUse(level)`
- `compareCitationReadiness(a, b)`
- `normalizeCitationReadiness(input)`

Expected: one canonical source of truth for readiness labels.

- [x] **Step 2: Test citation status behavior**

Add `tests/lib/citation-status.test.ts`.

Minimum assertions:

- `citable_external` and `citable_with_note` are externally usable.
- `internal_context` and `blocked_unsourced` are not externally usable.
- unknown, empty and null-like inputs normalize to `blocked_unsourced`.

Run:

```bash
npm test -- tests/lib/citation-status.test.ts
```

- [x] **Step 3: Update project policy docs**

Modify `research/AKADEMISK-KILDEHANDTERING-PLAN.md`, `docs/project/mandates/evidence-matrix-food-tg.md`, and `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md` so they all use the same four readiness levels.

Expected: docs no longer mix older labels like `db-linked`, `repo/static`, `needs-primary-check`, and `not-citable-input` without mapping them to the new canonical readiness levels.

## Task 3: Add SourceCitation And FieldCitation Schema

- [x] **Step 1: Extend Prisma schema**

Modify `prisma/schema.prisma`.

Add enums:

```prisma
enum SourceClass {
  primary
  secondary
  dataset
  internal_synthesis
  media
  unknown
}

enum VerificationStatus {
  verified
  partially_verified
  needs_review
  failed
}

enum CitationReadiness {
  citable_external
  citable_with_note
  internal_context
  blocked_unsourced
}
```

Add model:

```prisma
model SourceCitation {
  id                 String              @id @default(cuid())
  sourceClass        SourceClass         @default(unknown)
  citationReadiness  CitationReadiness   @default(blocked_unsourced)
  verificationStatus VerificationStatus  @default(needs_review)
  citationText       String
  title              String?
  publisher          String?
  author             String?
  year               Int?
  url                String?
  archivedUrl        String?
  localPath          String?
  fileHash           String?
  hashAlgorithm      String?
  pageRef            String?
  quote              String?
  accessedAt         DateTime?
  verifiedAt         DateTime?
  verifiedBy         String?
  notes              String?
  documentId         String?
  sourceDocId        String?
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
  document           Document?           @relation(fields: [documentId], references: [id], onDelete: SetNull)
  sourceDoc          SourceDoc?          @relation(fields: [sourceDocId], references: [id], onDelete: SetNull)
  fieldCitations     FieldCitation[]

  @@index([citationReadiness])
  @@index([verificationStatus])
  @@index([documentId])
  @@index([sourceDocId])
  @@index([url])
  @@index([localPath])
}
```

Add model:

```prisma
model FieldCitation {
  id              String          @id @default(cuid())
  citationId      String
  entityType      String
  entityId        String
  fieldPath       String
  claimText       String?
  confidence      Float?
  createdAt       DateTime        @default(now())
  citation        SourceCitation  @relation(fields: [citationId], references: [id], onDelete: Cascade)

  @@unique([citationId, entityType, entityId, fieldPath])
  @@index([entityType, entityId])
  @@index([fieldPath])
}
```

Add relation arrays to `Document` and `SourceDoc`:

```prisma
sourceCitations SourceCitation[]
```

Expected: citations can attach to both file-level source records and concrete row/field claims.

- [x] **Step 2: Add migration**

Create `prisma/migrations/20260520_source_citations/migration.sql` through Prisma migration tooling.

Run:

```bash
npm run db:migrate -- --name source_citations
```

Expected: migration is generated, Prisma client generation succeeds, and no existing table is dropped.

- [x] **Step 3: Add schema tests**

Modify `tests/lib/provenance-schema.test.ts` or add `tests/lib/source-citation-contract.test.ts` to assert:

- `SourceCitation` exists.
- `FieldCitation` exists.
- `SourceCitation` has indexes for readiness, verification, `documentId`, `sourceDocId`, `url`, and `localPath`.
- `FieldCitation` has unique tuple `[citationId, entityType, entityId, fieldPath]`.
- `Document` and `SourceDoc` expose `sourceCitations`.

Run:

```bash
npm test -- tests/lib/provenance-schema.test.ts tests/lib/source-citation-contract.test.ts
```

## Task 4: Implement Citation Contract And Readiness Logic

- [x] **Step 1: Create source citation contract**

Create `src/lib/citations/source-citation-contract.ts`.

Export:

- `SourceCitationInput`
- `FieldCitationInput`
- `CitationLocator`
- `CitationValidationIssue`
- `validateSourceCitationInput(input)`
- `hasDirectLocator(input)`
- `hasLocalEvidence(input)`
- `hasVerificationMetadata(input)`

Rules:

- A citable source must have at least one direct locator: `url`, `archivedUrl`, `localPath`, `documentId`, or `sourceDocId`.
- `citable_external` requires direct locator plus `verifiedAt` or `accessedAt`.
- `citable_with_note` requires direct locator but can lack page-level precision.
- `internal_context` can lack direct locator, but must not pass external filters.
- `blocked_unsourced` is default when locator or verification is missing.

- [x] **Step 2: Add readiness computation**

Create `src/lib/citations/citation-readiness.ts`.

Export:

- `deriveCitationReadiness(input)`
- `deriveVerificationStatus(input)`
- `explainCitationReadiness(input)`
- `mergeReadinessForCompositeClaim(citations)`

Expected behavior:

- primary source with direct locator and verification becomes `citable_external`
- secondary source with direct locator but no page ref becomes `citable_with_note`
- internal synthesis without linked sources becomes `internal_context`
- label-only source becomes `blocked_unsourced`
- composite claim inherits the weakest required source readiness

- [x] **Step 3: Add tests**

Add `tests/lib/source-citation-contract.test.ts` and `tests/lib/citation-readiness.test.ts`.

Run:

```bash
npm test -- tests/lib/source-citation-contract.test.ts tests/lib/citation-readiness.test.ts
```

## Task 5: Backfill Citations From Existing Locators Without Inventing Evidence

- [x] **Step 1: Build dry-run backfill script**

Create `scripts/backfill-source-citations-from-existing-locators.ts`.

Default mode must be dry-run. Apply mode requires `--apply`.

Supported sources:

- `Document.url`
- `Document.filePath`
- `SourceDoc.url`
- `SourceDoc.documentId`
- `Report.sourceUrl`
- `Report.supportingSources`
- `Thesis.url`
- `Thesis.doi`
- `BoardMember.sourceUrl`
- `BoardMember.source`
- `Shareholder.sourceUrl`
- `Shareholder.source`
- `CompanyOwnership.sourceUrl`
- `CompanyProperty.sourceUrl`
- existing row-source locators from `src/lib/row-source-locators.ts`

Expected output:

- count of citations to create
- count of field citations to create
- count skipped as duplicate
- count blocked because source is label-only
- CSV preview path under `research/citation-backfill-preview-2026-05-20.csv`

- [x] **Step 2: Make backfill idempotent**

Implement duplicate detection by:

- `documentId + localPath + url + citationText`
- `sourceDocId + url + citationText`
- `entityType + entityId + fieldPath + citationId`

Expected: running `--apply` twice does not create duplicate citations.

- [x] **Step 3: Add package scripts**

Modify `package.json`:

```json
{
  "db:backfill:source-citations": "tsx scripts/backfill-source-citations-from-existing-locators.ts",
  "db:backfill:source-citations:apply": "tsx scripts/backfill-source-citations-from-existing-locators.ts --apply"
}
```

- [x] **Step 4: Verify dry-run before apply**

Run:

```bash
npm run db:backfill:source-citations
```

Expected: dry-run writes preview only and makes no database changes.

- [x] **Step 5: Apply backfill**

Run:

```bash
npm run db:backfill:source-citations:apply
npm run db:audit
```

Expected: `SourceCitation` and `FieldCitation` rows are created from existing evidence, and standard DB audit still passes.

## Task 6: Add Citation Audit Gate

- [x] **Step 1: Add citation audit helpers**

Create `src/lib/citations/citation-audit.ts`.

Export:

- `auditSourceCitation(citation)`
- `auditFieldCitation(fieldCitation)`
- `auditCitationCoverage(records)`
- `formatCitationAuditSummary(summary)`

Audit categories:

- missing direct locator
- missing local file for cited local path
- missing URL/accessed date for external citation
- stale local path
- citation linked to deleted or missing entity
- field citation without claim text for narrative/report claims
- external-ready citation with `verificationStatus != verified`

- [x] **Step 2: Wire citation audit into data integrity script**

Modify `scripts/verify-data-integrity.ts`.

Add standard summary:

```text
Citation Coverage
  SourceCitation total:
  citable_external:
  citable_with_note:
  internal_context:
  blocked_unsourced:
  FieldCitation total:
  External blocking issues:
```

Add strict behavior:

- `--strict-sources` exits non-zero when any externally used record is `blocked_unsourced`.
- `--strict-sources` exits non-zero when a `citable_external` citation lacks locator or verification metadata.
- `--strict-sources` keeps current label-only checks for `CompanyFinancial`, `BusinessRelationship`, and `CountryMetric`.

- [x] **Step 3: Add tests**

Add `tests/lib/citation-audit.test.ts`.

Modify `tests/lib/source-quality-audit.test.ts` to include citation readiness expectations.

Run:

```bash
npm test -- tests/lib/citation-audit.test.ts tests/lib/source-quality-audit.test.ts
```

## Task 7: Export A Prioritized Citation Readiness Queue

- [x] **Step 1: Add queue exporter**

Create `scripts/export-citation-readiness-queue.ts`.

Output:

```text
research/citation-readiness-queue-2026-05-20.csv
```

Columns:

- `priority`
- `entityType`
- `entityId`
- `fieldPath`
- `currentReadiness`
- `blockingReason`
- `currentSource`
- `currentUrl`
- `localPath`
- `suggestedAction`
- `publicSurface`
- `usedInReport`
- `notes`

Priority rules:

- P0: public report or public UI field with blocked or label-only source
- P1: externally relevant analytical claim with missing verification metadata
- P2: internal report/source doc missing locator
- P3: orphan file or low-text PDF that is not currently public-facing

- [x] **Step 2: Add package script**

Modify `package.json`:

```json
{
  "research:citation-readiness-queue": "tsx scripts/export-citation-readiness-queue.ts"
}
```

- [x] **Step 3: Generate queue**

Run:

```bash
npm run research:citation-readiness-queue
```

Expected: CSV exists and P0/P1 items can be worked top-down without reading every source file manually.

## Task 8: Close Current Strict Source Failures

- [x] **Step 1: Fix `CompanyFinancial` label-only sources**

Inspect:

```bash
npm run research:source-gap-queue
rg -n "CompanyFinancial|companyFinancial" src scripts tests research
```

Implementation targets:

- update `src/lib/row-source-locators.ts`
- add or update importer-specific source fields where the underlying dataset has a URL or local file
- add tests in `tests/lib/row-source-locators.test.ts`

Expected: `CompanyFinancial.source` no longer has 36 label-only strict-source violations.

- [x] **Step 2: Fix `BusinessRelationship` label-only sources**

Inspect:

```bash
rg -n "BusinessRelationship|businessRelationship" src scripts tests research
```

Implementation targets:

- map each relationship import to a `SourceCitation` or a resolvable `SourceDoc`
- block unverified relationships from external graph/report outputs
- add tests for relationship source locators

Expected: `BusinessRelationship.source` no longer has 32 label-only strict-source violations.

- [x] **Step 3: Fix `CountryMetric` label-only sources**

Inspect:

```bash
rg -n "CountryMetric|countryMetric|market metric|country metric" src scripts tests research
```

Implementation targets:

- preserve source URL/local file in importers
- backfill known FAO, Eurostat, OECD, Nordic statistics, or report locators only where already present in the repository or source metadata
- mark unresolved metrics as `blocked_unsourced`

Expected: `CountryMetric.source` no longer has 142 label-only strict-source violations.

- [x] **Step 4: Run strict source audit**

Run:

```bash
npm run db:audit:strict-sources
```

Expected: exit 0. If any remaining rows fail, they must be listed in `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` with owner action and publication block status.

Task 8 verification note, 2026-05-20: `npm run research:source-gap-queue`
now reports 0 groups and 0 rows for `CompanyFinancial.source`,
`BusinessRelationship.source`, and `CountryMetric.source`. The remaining
`npm run db:audit:strict-sources` failures are no longer label-only
strict-source groups; they are citation coverage blockers tracked in
`research/CITABLE-KNOWLEDGE-BASE-STATUS.md`.

## Task 9: Remediate File, URL And PDF Evidence Risks

- [x] **Step 1: Refresh URL health**

Run:

```bash
npm run db:check-urls
```

Expected: `research/URL-HEALTH.md` is regenerated. New dead/blocked/server-error URLs are triaged into the citation queue.

- [x] **Step 2: Refresh PDF quality**

Run:

```bash
npm run check-pdf-quality
```

Expected: scanned and low-text PDFs are current.

- [x] **Step 3: OCR scanned PDFs**

Run:

```bash
npm run ocr-scanned-pdfs
```

Expected: the 5 scanned PDFs are converted or explicitly marked `internal_context` if OCR is not good enough for citation.

- [x] **Step 4: Resolve missing SourceDoc file locators**

Run:

```bash
npm run compute-file-coverage
npm run build-remediation-backlog
```

Work through P0 and HIGH items first:

- 42 `missing_file_sourcedoc`
- 1 `broken_supportingsource`
- 1 duplicate file with separate records
- public-facing orphan files used by reports

Expected: all public-facing source docs have either URL, local file, or explicit blocked status.

Task 9 status on 2026-05-20:

- URL health was refreshed after source-URL remediation. Final run checked 600 unique URLs: 493 ok, 2 redirect, 41 dead, 52 blocked, 5 timeout, 5 server_error, and 2 other.
- Verified URL replacements were applied for Dagligvaretilsynet/Samfunnsøkonomisk Analyse reports, Norwegian/Nordic/Swedish public reports, NVA/handle thesis records, KKV Finland, ICA Gruppen, PubMed/PMC, and SLU fulltext. No source URL was invented without a live check.
- `check-urls.ts` now treats all HTTP 2xx statuses as `ok` and uses a browser-like request profile to avoid false 500/429 results from public archives that reject custom bot user agents.
- OCR processed all 5 scanned PDFs from the quality report: 4 were archived in `research/ocr-output/` and 1 1 KB RASTECH file was skipped as likely corrupt. No `Document.content` row was overwritten because no matching document needed an OCR replacement.
- File coverage was refreshed with 0 HIGH findings: 42 `missing_file_sourcedoc` remain MEDIUM, 307 orphan files remain LOW, 1 broken supporting source remains LOW, and 1 duplicate file/separate records finding remains LOW.
- Follow-on quality pass update: `check-urls.ts` now uses curl fallback for
  tool-sensitive blocked/timeout/server-error results. The refreshed URL run
  checked 600 unique URLs: 506 ok, 2 redirect, 41 dead, 49 blocked, 0 timeout,
  0 server_error, and 2 other.
- Follow-on quality pass update: SourceDoc locator coverage now accepts URL,
  DOI, linked `Document`, or resolvable local file. `npm run
  compute-file-coverage` now reports 310 findings: 0 HIGH, 0 MEDIUM, 310 LOW;
  `missing_file_sourcedoc` is 0.
- The current remediation backlog has 481 findings: 5 HIGH, 23 MEDIUM, and 453
  LOW. The remaining HIGH items are URL-health access blockers only: Civita,
  Salford Worktribe, and three Skemman thesis URLs. These are documented as
  residual live-access blockers, not unresolved local-file blockers.

## Task 10: Fail-Closed External Export And UI Use

- [x] **Step 1: Add citable record filter**

Create `src/lib/citations/citable-record-filter.ts`.

Export:

- `canUseExternally(record)`
- `filterExternalRecords(records)`
- `assertExternalCitationReadiness(records, context)`
- `summarizeExternalExclusions(records)`

Expected: external reporting code has one shared gate instead of ad hoc checks.

- [x] **Step 2: Add tests**

Add `tests/lib/citable-record-filter.test.ts`.

Assertions:

- `blocked_unsourced` is excluded.
- `internal_context` is excluded from external outputs.
- `citable_with_note` passes only when a note is available.
- missing citation array fails closed.

Run:

```bash
npm test -- tests/lib/citable-record-filter.test.ts
```

- [x] **Step 3: Wire filter into public surfaces**

Modify public-facing pages/components that expose analytical claims:

- `src/app/rapporter/RapporterContent.tsx`
- `src/app/bibliotek/[...slug]/page.tsx`
- `src/app/forsyningskjede/ForsyningskjedeContent.tsx`
- `src/app/selskap/[id]/page.tsx`
- `src/app/sirkularitet/SirkularitetContent.tsx`
- graph/dashboard data adapters that feed public pages

Expected: records that are not externally citable are hidden, downgraded to internal labels, or rendered with explicit caveat.

- [x] **Step 4: Make citation state visible**

Add:

- `src/components/citations/Citation.tsx`
- `src/components/citations/CitationBibliography.tsx`

Modify:

- `src/components/visualization/SourceFootnote.tsx`
- `src/components/visualization/EvidenceStatusBadge.tsx`

Expected: users see source, date/access status, and readiness label where claims are shown.

Task 10 status on 2026-05-20:

- Added shared external-use gate in `src/lib/citations/citable-record-filter.ts` with tests for blocked/internal exclusion, `citable_with_note` note requirements, missing citation arrays, filtering, and exclusion summaries.
- `/rapporter` now derives report-level citation readiness from existing `SourceCitation` rows, source URLs, local file paths, provenance type, and supporting-source metadata. It hides findings/recommendations/relevance for records that fail external-use readiness and shows an explicit caveat instead.
- `/bibliotek/[...slug]`, `/selskap/[id]`, `/sirkularitet`, and `/forsyningskjede` now surface `Citation`/`CitationBibliography` readiness labels next to document, corporate, circularity benchmark, chart, and data-quality claims.
- `SourceFootnote`, `EvidenceStatusBadge`, `ChartFrame`, and `DataQualityStrip` now carry citation readiness through visualized claims. Public graph data filters explicit blocked source markers from ownership, relationship, and property graph edges.
- Verification passed: `npm test` (145 tests), `npm run lint`, `npm run build`, `npm run db:audit` (warnings only), `npm run graph:audit`, and `git diff --check`. `npm run db:audit:strict-sources` still fails as expected only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.

## Task 11: Audit Existing Nordic Circularity Report For Citable Use

- [x] **Step 1: Add report claim audit script**

Create `scripts/audit-citable-reports.ts`.

Inputs:

- `public/reports/nordisk-sirkularitetsrapport-2026-05.html`
- `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md`
- `research/v1-2/claim-audit.md`
- `research/v1-2/phase2-primaersjekker.md`
- `research/v1-2/phase7-selvkritikk.md`
- `research/v1-2/phase8-T3-ekstern-vs-intern-diff.md`

Checks:

- claims flagged weak/missing in `research/v1-2/claim-audit.md` are either resolved, footnoted, or removed
- HTML and appendix agree on Copenhagen percentage
- HTML and self-critique agree on whether T3 diff is done
- README line counts are not used as quality claims
- HHI/CR3 values are labelled correctly
- every highlighted numerical claim has an associated source citation or explicit caveat

- [x] **Step 2: Add report audit tests**

Add `tests/lib/report-claim-audit.test.ts`.

Use small string fixtures to test:

- contradictory status text is flagged
- numeric claim without citation is flagged
- resolved claim with citation passes

- [x] **Step 3: Fix report drift**

Modify:

- `public/reports/nordisk-sirkularitetsrapport-2026-05.html`
- `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md`
- `research/norden/sirkularitet-sprint-2026-05/README.md`
- `research/v1-2/phase7-selvkritikk.md`

Expected fixes:

- T3 is consistently marked as completed if `research/v1-2/phase8-T3-ekstern-vs-intern-diff.md` remains the accepted source.
- Copenhagen value uses one verified value across report and appendix.
- historical line count comments are either removed or recalculated.
- weak/missing claims from the claim audit are no longer presented as settled facts.

- [x] **Step 4: Run report audit**

Run:

```bash
npm test -- tests/lib/report-claim-audit.test.ts
npm run audit:citable-reports
```

Expected: report audit exits 0 or leaves only explicitly documented internal-only items.

Task 11 status on 2026-05-20:

- Added `src/lib/citations/report-claim-audit.ts` and `scripts/audit-citable-reports.ts` to audit the Nordic circularity report, appendix, README, claim audit, primary-check notes, self-critique, and T3 diff note together before public citation use.
- Added `tests/lib/report-claim-audit.test.ts` covering contradictory T3 status text, highlighted numeric claims without support, and resolved numeric claims with source citations.
- Fixed report drift across `public/reports/nordisk-sirkularitetsrapport-2026-05.html`, `docs/project/mandates/nordisk-sirkularitetsrapport-appendiks-2026-05.md`, `research/norden/sirkularitet-sprint-2026-05/README.md`, and `research/v1-2/phase7-selvkritikk.md`.
- Closed the concrete audit findings: T3 is consistently marked completed as an internal method check, Copenhagen public-kitchen organic share is standardized to 85 percent in 2024 with peak context where relevant, README line-count/KB text is no longer used as a quality claim, Norwegian concentration is labelled as `HHI 3445 (CR3 96,6%)`, and the weak IFRO soy bibliography note is replaced with the concrete IFRO Documentation 2025-01 citation.
- Verification passed: `npm run audit:citable-reports`, `npm test -- tests/lib/report-claim-audit.test.ts` (full runner reported 148 tests), `npm test` (148 tests), `npm run lint`, `npm run build`, `npm run db:audit` (warnings only), `npm run graph:audit`, and `git diff --check`. `npm run db:audit:strict-sources` still fails as expected only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.

## Task 12: Build Acceptance Tests For "Can Be Cited" Use

- [x] **Step 1: Create acceptance test document**

Create `research/CITABLE-ACCEPTANCE-TESTS.md`.

Include at least 12 test questions:

- 3 about Nordic circularity and biomass cascade logic
- 2 about Nordic retail/market concentration
- 2 about food waste or loss figures
- 2 about ownership/company structures
- 1 about public subsidies
- 1 about theses/reports in the research library
- 1 about graph relationships

For each question, specify:

- expected source type
- required citation readiness level
- fields or reports that must be used
- fields or reports that must not be used
- known caveat if only `citable_with_note`

- [x] **Step 2: Add acceptance pack builder**

Create `scripts/build-citable-acceptance-pack.ts`.

Output:

```text
research/citable-acceptance-pack-2026-05-20.json
research/citable-acceptance-pack-2026-05-20.md
```

Expected: each acceptance answer includes citations, readiness labels, and exclusion notes for blocked material.

- [x] **Step 3: Add package script**

Modify `package.json`:

```json
{
  "research:citable-acceptance-pack": "tsx scripts/build-citable-acceptance-pack.ts"
}
```

- [x] **Step 4: Run acceptance pack**

Run:

```bash
npm run research:citable-acceptance-pack
```

Expected: every acceptance answer is either cite-ready or explicitly blocked with reason.

Task 12 status on 2026-05-20:

- Added `src/lib/citations/citable-acceptance.ts` with 12 acceptance questions covering Nordic circularity, market concentration, food waste, ownership/company structures, public subsidies, library sources, and graph relationships.
- Added `tests/lib/citable-acceptance.test.ts` to enforce category coverage, source/readiness/must-use/must-not-use/caveat fields, and fail-closed answer status.
- Added `scripts/build-citable-acceptance-pack.ts` and package script `npm run research:citable-acceptance-pack`.
- Generated `research/CITABLE-ACCEPTANCE-TESTS.md`, `research/citable-acceptance-pack-2026-05-20.json`, and `research/citable-acceptance-pack-2026-05-20.md`.
- Acceptance-pack result: 12 questions total, 7 cite-ready with caveats where required, 5 explicitly blocked with reasons.
- Verification passed: `npm test -- tests/lib/citable-acceptance.test.ts` (full runner reported 151 tests), `npm run research:citable-acceptance-pack`, `npm test` (151 tests), `npm run lint`, `npm run build`, `npm run db:audit` (warnings only), `npm run graph:audit`, `npm run audit:citable-reports`, and `git diff --check`. `npm run db:audit:strict-sources` still fails as expected only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.

## Task 13: Update Claim Register And Evidence Matrix

- [x] **Step 1: Normalize claim register statuses**

Modify `docs/project/mandates/claim-register-food-tg.md`.

For each claim, add or update:

- `citationReadiness`
- `sourceCitationIds`
- `fieldCitationIds`
- `externalUse`
- `blockedReason`

Expected: no claim remains only `Utfort internt` without an external-use decision.

- [x] **Step 2: Normalize evidence matrix**

Modify `docs/project/mandates/evidence-matrix-food-tg.md`.

Expected:

- old High/Medium/Low citable scale maps to the four readiness levels
- internal synthesis is separated from source evidence
- each external claim points to `SourceCitation` or an accepted source document

- [x] **Step 3: Synchronize Nordic core source mandate**

Modify `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md`.

Expected:

- `db-linked`, `repo/static`, `internal-synthesis`, `needs-primary-check`, and `not-citable-input` are mapped to canonical readiness levels
- source NORDIC-CORE-017 remains blocked from evidentiary use unless later primary verification is added

Task 13 status on 2026-05-20:

- Added `tests/lib/citable-register-docs.test.ts` to enforce that every formal claim in `claim-register-food-tg.md` has an explicit external-use decision and that the evidence matrix and Nordic core source mandate expose canonical readiness mappings.
- Added a full `External-use decision ledger` to `docs/project/mandates/claim-register-food-tg.md` for all 42 formal claims. Each row now has `citationReadiness`, `sourceCitationIds`, `fieldCitationIds`, `externalUse`, and `blockedReason`.
- Added `External-use normalization` to `docs/project/mandates/evidence-matrix-food-tg.md`, separating source evidence from internal synthesis and mapping old `Høy`/`Medium`/`Lav` usage into canonical readiness handling.
- Added `External-use normalization` to `docs/project/mandates/nordic-core-sources-food-tg-2026-04-29.md`; `NORDIC-CORE-017` remains explicitly `blocked_unsourced` for evidentiary use.
- Verification passed: `npm test -- tests/lib/citable-register-docs.test.ts` (full runner reported 153 tests), `npm test` (153 tests), `npm run lint`, `npm run build`, `npm run db:audit` (warnings only), `npm run graph:audit`, `npm run audit:citable-reports`, `npm run research:citable-acceptance-pack`, and `git diff --check`. `npm run db:audit:strict-sources` still fails as expected only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.

## Task 14: CI And Developer Workflow

- [x] **Step 1: Add package scripts**

Modify `package.json`:

```json
{
  "audit:citations": "tsx scripts/verify-data-integrity.ts --strict-sources",
  "audit:citable-reports": "tsx scripts/audit-citable-reports.ts",
  "audit:citable": "npm run db:audit && npm run audit:citations && npm run audit:citable-reports && npm run research:citation-readiness-queue"
}
```

- [x] **Step 2: Document workflow**

Update `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` with the standard operator sequence:

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

- [x] **Step 3: Add fail-closed rule to docs**

Update `research/AKADEMISK-KILDEHANDTERING-PLAN.md`:

```text
If a claim has no external-ready citation, the system must either exclude it from external output or display it as internal context. It must not silently promote internal synthesis to source evidence.
```

Task 14 status on 2026-05-20:

- Added `audit:citations` and `audit:citable` package scripts. `audit:citable` runs standard DB audit, strict citation/source audit, report audit, and citation-readiness queue export in sequence.
- Added `tests/lib/citable-workflow-docs.test.ts` to lock the workflow scripts, operator sequence, and fail-closed documentation rule.
- Added the standard operator sequence to `research/CITABLE-KNOWLEDGE-BASE-STATUS.md`.
- Added the explicit fail-closed external-use rule to `research/AKADEMISK-KILDEHANDTERING-PLAN.md`.
- Verification passed: `npm test -- tests/lib/citable-workflow-docs.test.ts` (full runner reported 155 tests), `npm test` (155 tests), `npm run lint`, `npm run build`, `npm run db:audit` (warnings only), `npm run graph:audit`, `npm run audit:citable-reports`, `npm run research:citation-readiness-queue`, `npm run research:citable-acceptance-pack`, and `git diff --check`.
- `npm run audit:citable` now works as an aggregate gate and currently fails at `npm run audit:citations`, as expected, because strict citation coverage still has 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.

## Task 15: Final Verification And Handoff

- [x] **Step 1: Run focused tests while implementing**

Run the relevant test after each task:

```bash
npm test -- tests/lib/citation-status.test.ts
npm test -- tests/lib/source-citation-contract.test.ts
npm test -- tests/lib/citation-readiness.test.ts
npm test -- tests/lib/citation-audit.test.ts
npm test -- tests/lib/citable-record-filter.test.ts
npm test -- tests/lib/report-claim-audit.test.ts
```

- [x] **Step 2: Run full gates**

Run:

```bash
npm test
npm run lint
npm run db:audit
npm run db:audit:strict-sources
npm run audit:citable-reports
npm run research:citation-readiness-queue
npm run research:citable-acceptance-pack
npm run build
git diff --check
```

Expected:

- tests pass
- lint passes
- standard DB audit passes
- strict source audit passes
- citable report audit passes
- citation readiness queue has no P0 public blockers
- acceptance pack contains citations or explicit blocks for all test questions
- production build passes
- patch has no whitespace errors

- [x] **Step 3: Update final status**

Update `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` with:

- final command results
- remaining P1/P2/P3 backlog counts
- known limitations
- what can be cited externally
- what remains internal-only
- recommended next tranche

- [ ] **Step 4: Commit criteria**

Commit only if:

- all full gates in Step 2 pass, or remaining failures are explicitly limited to non-public P2/P3 backlog
- `research/CITABLE-KNOWLEDGE-BASE-STATUS.md` states the residual risk
- generated queues and acceptance packs are included only when useful for handoff

Suggested commit message:

```bash
git add prisma package.json scripts src tests research docs public/reports docs/superpowers/plans/2026-05-20-citable-knowledge-base-hardening.md
git commit -m "feat(sources): add citable knowledge base gates"
```

Task 15 final status on 2026-05-20:

- Focused citation tests were run with the Task 15 command; because the repo test script includes `tests/**/*.test.ts`, the command executed the full suite and passed with 155 tests.
- Full gates passed for `npm test`, `npm run lint`, `npm run db:audit`, `npm run audit:citable-reports`, `npm run research:citation-readiness-queue`, `npm run research:citable-acceptance-pack`, `npm run graph:audit`, `npm run build`, and `git diff --check`.
- `npm run db:audit:strict-sources` still fails, but only on citation coverage: 1,963 externally relevant blocked `FieldCitation` rows and 10 missing-claim-text audit issues.
- `research/citation-readiness-queue-2026-05-20.csv` still has 1,974 rows: P0 1,964, P1 0, P2 10, P3 0. This means the original acceptance criteria for strict external citation readiness are not met yet.
- The acceptance pack still has 12 questions with 7 cite-ready and 5 blocked. The blocked cases are intentional fail-closed outcomes.
- Commit criteria are not met in this pass because strict citation coverage remains a P0 blocker. Do not commit as externally ready until the P0 queue is remediated, downgraded to internal context, or excluded from public/external output.

## Task 16: Remediate Strict Citation Coverage

- [x] **Step 1: Refresh stale SourceCitation readiness**

Add and run a repeatable refresh that re-derives stale `blocked_unsourced`
`SourceCitation` rows only from existing URL/local/document locators and
existing verification metadata. Do not add new source URLs.

Task 16 result:

- First apply refreshed 2,519 rows: 58 `blocked_unsourced -> citable_external`,
  2,448 `blocked_unsourced -> citable_with_note`, and 13
  `blocked_unsourced -> internal_context`.
- Second apply moved 27 stale missing-local-only external rows to
  `internal_context`.
- `npm run db:refresh:source-citation-readiness` is now idempotent with 0 rows
  to update.

- [x] **Step 2: Backfill missing FieldCitation claim text**

Add and run a repeatable backfill for the 10 missing
`Company.naceDescription` claim texts, using only existing `Company` NACE
values.

Task 16 result:

- `npm run db:backfill:field-citation-claim-text:apply` filled 10 claim texts.
- `npm run db:backfill:field-citation-claim-text` now reports 0 rows to update.

- [x] **Step 3: Normalize queue verification and excluded blockers**

Update the readiness queue so it shares the audit gate's normalized
verification semantics and does not treat explicitly excluded `blocked_source`
reports as P0 public blockers.

Task 16 result:

- Legacy `machine_verified` and `human_verified` citations no longer become
  false P1 queue items.
- `agrianalyse-bondens-andel-2025` remains in the queue as P2 because it is
  explicitly excluded from external evidence use.

- [x] **Step 4: Verify strict and aggregate gates**

Run:

```bash
npm test -- tests/lib/citation-readiness-queue.test.ts tests/lib/field-citation-claim-text.test.ts
npm run db:refresh:source-citation-readiness
npm run db:backfill:field-citation-claim-text
npm run db:audit:strict-sources
npm run research:citation-readiness-queue
npm run audit:citable
```

Task 16 status on 2026-05-20:

- Focused Task 16 tests passed; because the repo test script includes
  `tests/**/*.test.ts`, the latest focused command executed the full suite and
  reported 167 tests passing.
- Final full `npm test` after the follow-on URL, SourceDoc and graph quality pass
  reported 176 tests passing across 40 suites.
- `npm run db:audit:strict-sources` passed with 0 external blocking citation
  issues.
- `npm run research:citation-readiness-queue` wrote 1 row: P0 0, P1 0, P2
  1, P3 0, after reviewed internal/composite/register report sourceUrl
  exceptions with explicit `supportingSources` were removed from the open
  queue.
- `npm run audit:citable` passed end to end.
- Strict source/citation coverage is no longer a commit blocker. The residual
  queue is a P2 policy/content-review queue, not a strict audit failure.
- Follow-on graph quality pass: board-member graph orphan rows are now 0 after
  fallback person nodes were added for board members without full
  `PersonProfile` rows. `npm run graph:audit` reports 41,072 nodes, 1,641
  edges, 187 board-member profile gaps, and 34.8 percent edge confidence.

## Acceptance Criteria

- `npm run db:audit:strict-sources` exits 0.
- Public-facing claims have `citable_external` or `citable_with_note` source coverage, or are excluded.
- No public report or UI surface silently uses `blocked_unsourced` or `internal_context` as evidence.
- The Nordic circularity report and appendix have no known unresolved internal contradictions around T3 status, Copenhagen percentage, HHI/CR3 labelling, or previously weak numerical claims.
- `research/citation-readiness-queue-2026-05-20.csv` has zero P0 public blockers.
- `research/CITABLE-ACCEPTANCE-TESTS.md` and the generated acceptance pack show which parts of the knowledge base can be cited and which parts cannot.
- `SourceCitation` and `FieldCitation` allow traceability from claim/data field to source locator, local file, verification status, and readiness level.

## Implementation Order Recommendation

1. Tasks 1-4 create the policy, schema and logic.
2. Tasks 5-8 convert existing evidence and close current strict-source failures.
3. Tasks 9-11 clean file/PDF/report evidence risks.
4. Tasks 12-14 make the system usable for external citation workflows.
5. Task 15 verifies and documents the end state.
6. Task 16 closes strict citation coverage and leaves only P2 residual
   policy/content-review queue items.

The highest-value first milestone is Tasks 1-8. That milestone turns the current known source debt into an enforceable gate and should be completed before polishing UI citation display.
