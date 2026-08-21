# Library Analysis Acquisition and Content Unit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a private, reproducible intake pipeline that resolves the sealed library-analysis population into hash-bound, non-overlapping content units without mutating production data.

**Architecture:** A deterministic plan binds the immutable population snapshot to database, HTTPS, repository-file, and derived-record routes. Format-specific extractors write immutable private artifacts, a deterministic chunker creates stable content-unit descriptors, and a sealed resolution manifest gives every population row exactly one intake disposition. Candidate database intake remains a separately authorized final adapter.

**Tech Stack:** TypeScript 5.9, Node.js 25, Zod 4, Prisma 7 read-only transactions, built-in HTTPS/fetch primitives, Poppler `pdftotext`, ZIP/XML parsing for PPTX, Node test runner, ESLint.

**Spec:** `docs/superpowers/specs/2026-08-21-library-analysis-acquisition-content-unit-design.md`

## Global Constraints

- The planning population is immutable and bound to `library-analysis-population:00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`; later runs must accept any separately validated population hash.
- `contentHash = sha256(Document.content)` and `sourceVersionHash = sha256([Document.summary, Document.content].filter(Boolean).join("\n\n"))`; never require equality between the two.
- Private run roots use mode `0700`; files are created as `0600` and sealed as `0400`.
- External acquisition is HTTPS-only, uses manual redirects, omits credentials, allows at most five redirects, times out after 60 seconds, and caps a response at 100 MiB.
- Canonical content units do not overlap and contain at most 12,000 Unicode code points.
- Candidate-layer hashes are lowercase 64-character hex without `sha256:`; receipt fields retain the existing `sha256:<hex>` contract and adapters validate before removing the prefix.
- Raw bytes and extracted text stay outside Git under `~/.local/share/foodsystems/library-analysis-runs/<run-id>/`.
- No task may mutate `Document`, `LibraryAnalysisRecord`, canonical claims, review, coverage, or publication data.
- No candidate DB write, migration, role activation, network execution, push, PR, deploy, or production action is implied by this plan.
- Automated outputs retain `automatedOnly=true` and `externalReady=false`.
- Implementation uses witnessed RED → GREEN, focused verification, exact-path staging, and one coherent commit per task.

---

## File Structure

- `src/lib/knowledge/library-analysis-acquisition-contract.ts`: schemas, canonical hashes, plan and resolution completeness rules.
- `src/lib/knowledge/library-analysis-content-chunker.ts`: Unicode-safe deterministic chunking and exact reconstruction.
- `src/lib/knowledge/private-library-analysis-artifact-store.ts`: safe private-root resolution, exclusive writes, sealing, readback, and manifest atomics.
- `src/lib/knowledge/library-analysis-source-extraction.ts`: HTML, text, PDF, CSV, PPTX, and derived-record extraction adapters.
- `scripts/knowledge/plan-library-analysis-acquisition.ts`: read-only DB/repository locator resolver and sealed plan writer.
- `scripts/knowledge/execute-library-analysis-acquisition.ts`: explicitly gated fetch/extract/checkpoint coordinator.
- `scripts/knowledge/emit-library-analysis-content-units.ts`: private content-unit and cost-envelope emitter with no DB writes.
- `scripts/knowledge/ingest-library-analysis-content-units.ts`: corrected Document hash verification and resolution-aware candidate intake.
- `tests/lib/library-analysis-acquisition-contract.test.ts`: plan/resolution schema and completeness tests.
- `tests/lib/library-analysis-content-chunker.test.ts`: Unicode, boundary, reconstruction, and identity tests.
- `tests/lib/private-library-analysis-artifact-store.test.ts`: modes, traversal, symlink, overwrite, and atomicity tests.
- `tests/lib/library-analysis-source-extraction.test.ts`: format adapter fixtures and typed failures.
- `tests/lib/library-analysis-acquisition-cli.test.ts`: argument, side-effect gate, redaction, and coordinator tests.
- `tests/lib/library-analysis-content-intake.test.ts`: separate hash bindings, private emit, replay, and candidate intake tests.
- `package.json`: explicit plan/check/execute/emit scripts.
- `research/_status/library-analysis-acquisition-pilot-2026-08-21.md`: sanitized pilot receipt created only after a real private pilot.

---

### Task 1: Correct the Database Document Hash Contract

**Files:**
- Modify: `scripts/knowledge/ingest-library-analysis-content-units.ts`
- Modify: `tests/lib/library-analysis-content-intake.test.ts`

**Interfaces:**
- Consumes: `LibraryAnalysisPopulationSnapshot` with distinct `contentHash` and `sourceVersionHash`.
- Produces: `LibraryAnalysisSourceRow = { documentId: string; summary: string | null; content: string }` and `buildLibraryAnalysisContentUnits(...)` that verifies both hashes independently.

- [ ] **Step 1: Write a failing regression test for a document with a summary**

```ts
const content = "Body text";
const summary = "Summary text";
const row = eligiblePopulationRow({
  contentHash: sha256(content),
  sourceVersionHash: sha256(`${summary}\n\n${content}`),
});
const units = buildLibraryAnalysisContentUnits(snapshotWith(row), [
  { documentId: "doc-1", summary, content },
]);
assert.equal(units.length, 1);
assert.equal(units[0]!.sourceVersionHash, row.sourceVersionHash);
```

- [ ] **Step 2: Run the focused test and witness RED**

Run: `node --import tsx --test --test-name-pattern="distinct content and source version hashes" tests/lib/library-analysis-content-intake.test.ts`

Expected: FAIL because `LibraryAnalysisSourceRow` lacks `summary` and the builder requires `actualHash === sourceVersionHash`.

- [ ] **Step 3: Implement independent hash verification**

```ts
export type LibraryAnalysisSourceRow = {
  documentId: string;
  summary: string | null;
  content: string;
};

const actualContentHash = sha256Text(source.content);
const actualSourceVersionHash = sha256Text(
  [source.summary, source.content].filter(Boolean).join("\n\n"),
);
if (actualContentHash !== row.contentHash) {
  throw new Error("library_analysis_content_hash_mismatch");
}
if (actualSourceVersionHash !== row.sourceVersionHash) {
  throw new Error("library_analysis_source_version_hash_mismatch");
}
```

Update `readLibraryAnalysisSourceRows` to select and return `summary`.

- [ ] **Step 4: Add negative tests and run GREEN**

Add one test for content drift and one for summary-only drift. Run:

`node --import tsx --test tests/lib/library-analysis-content-intake.test.ts`

Expected: all tests PASS, with the two drift paths producing different stable error codes.

- [ ] **Step 5: Run static checks and commit**

Run: `npx tsc --noEmit && npx eslint scripts/knowledge/ingest-library-analysis-content-units.ts tests/lib/library-analysis-content-intake.test.ts && git diff --check`

Commit:

```bash
git add scripts/knowledge/ingest-library-analysis-content-units.ts tests/lib/library-analysis-content-intake.test.ts
git commit -m "fix: verify library source version separately"
```

---

### Task 2: Define Acquisition Plan and Resolution Contracts

**Files:**
- Create: `src/lib/knowledge/library-analysis-acquisition-contract.ts`
- Create: `tests/lib/library-analysis-acquisition-contract.test.ts`

**Interfaces:**
- Consumes: `LibraryAnalysisPopulationSnapshot` and sorted `LibraryAnalysisAcquisitionLocator[]`.
- Produces: `buildLibraryAnalysisAcquisitionPlan`, `sealLibraryAnalysisResolution`, `LibraryAnalysisAcquisitionPlanSchema`, and `LibraryAnalysisAcquisitionResolutionSchema`.

- [ ] **Step 1: Write failing plan determinism and completeness tests**

```ts
const plan = buildLibraryAnalysisAcquisitionPlan(snapshot, [
  { sourceKind: "source_doc", sourceKey: "source_doc:src-1", route: "controlled_https", locator: "https://example.test/a.pdf" },
]);
assert.equal(plan.populationHash, snapshot.populationHash);
assert.deepEqual(plan.rows.map(row => row.sourceKey), [...plan.rows.map(row => row.sourceKey)].sort());
assert.equal(plan.planHash, libraryAnalysisAcquisitionPlanHash(plan));
assert.throws(() => sealLibraryAnalysisResolution(plan, []), /resolution_population_incomplete/);
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test tests/lib/library-analysis-acquisition-contract.test.ts`

Expected: FAIL because the contract module does not exist.

- [ ] **Step 3: Implement strict Zod contracts and canonical hashing**

Define these exact route and disposition unions:

```ts
export const ACQUISITION_ROUTES = [
  "database_document", "controlled_https", "repository_csv",
  "repository_pptx", "database_derived_record", "superseded", "unresolvable",
] as const;

export const ACQUISITION_DISPOSITIONS = [
  "content_units_ready", "superseded", "blocked_input",
  "failed_retryable", "quarantined",
] as const;
```

Use `candidateAnalysisSha256("library-analysis-acquisition-plan", core)` and
`candidateAnalysisSha256("library-analysis-acquisition-resolution", core)`.
Reject duplicate identities, missing population rows, unknown fields, a
population-hash mismatch, `content_units_ready` without units, and blocker
dispositions without a typed reason code.

- [ ] **Step 4: Add blocker, duplicate, and replay tests and run GREEN**

Cover all reason codes from spec section 5.7 and assert a reordered input
produces the same plan hash.

Run: `node --import tsx --test tests/lib/library-analysis-acquisition-contract.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Static checks and commit**

Run: `npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-acquisition-contract.ts tests/lib/library-analysis-acquisition-contract.test.ts && git diff --check`

Commit: `git commit -m "feat: define library acquisition manifests"` after staging the two exact files.

---

### Task 3: Implement Deterministic Content Chunking

**Files:**
- Create: `src/lib/knowledge/library-analysis-content-chunker.ts`
- Create: `tests/lib/library-analysis-content-chunker.test.ts`

**Interfaces:**
- Consumes: `LogicalContentUnit { unitType; baseLocator; ordinal; text }` and `ChunkPolicy { version: "1.0.0"; maxCodePoints: 12000 }`.
- Produces: `chunkLogicalContentUnit(input, policy): ChunkedContentUnit[]` with exclusive offsets and `reconstructLogicalContentUnit(chunks): string`.

- [ ] **Step 1: Write failing boundary and reconstruction tests**

```ts
const text = `${"a".repeat(7000)}\n\n${"b".repeat(7000)}`;
const chunks = chunkLogicalContentUnit({
  unitType: "document_section", baseLocator: "database:Document:d:content", ordinal: 0, text,
}, DEFAULT_LIBRARY_ANALYSIS_CHUNK_POLICY);
assert.equal(chunks.length, 2);
assert.equal(reconstructLogicalContentUnit(chunks), text);
assert.ok(chunks.every(chunk => [...chunk.text].length <= 12_000));
assert.equal(chunks[0]!.endCodePoint, chunks[1]!.startCodePoint);
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test tests/lib/library-analysis-content-chunker.test.ts`

Expected: FAIL because the chunker module does not exist.

- [ ] **Step 3: Implement paragraph, sentence, and hard-boundary splitting**

Convert the string to `Array.from(text)` for Unicode code-point indexing.
Choose the furthest valid boundary at or before 12,000 code points, preferring
`\n\n`, then a sentence terminator followed by whitespace, then the hard
limit. Preserve every code point exactly and do not trim chunks.

Compute:

```ts
contentHash: sha256(Buffer.from(chunkText, "utf8")),
locator: `${baseLocator}#chars=${startCodePoint}-${endCodePoint}`,
chunkPolicyHash: candidateAnalysisSha256("library-analysis-chunk-policy", policy),
```

- [ ] **Step 4: Add Unicode and negative tests and run GREEN**

Cover emoji/surrogate pairs, one 20,000-code-point sentence, empty input,
CRLF-preserved input, ordinal order, overlap rejection, and mutated-chunk
reconstruction failure.

Run: `node --import tsx --test tests/lib/library-analysis-content-chunker.test.ts`

Expected: all tests PASS.

- [ ] **Step 5: Static checks and commit**

Run: `npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-content-chunker.ts tests/lib/library-analysis-content-chunker.test.ts && git diff --check`

Commit: `git commit -m "feat: add deterministic library content chunking"`.

---

### Task 4: Build the Private Immutable Artifact Store

**Files:**
- Create: `src/lib/knowledge/private-library-analysis-artifact-store.ts`
- Create: `tests/lib/private-library-analysis-artifact-store.test.ts`

**Interfaces:**
- Produces: `openPrivateLibraryAnalysisRunRoot`, `writePrivateArtifactExclusive`, `sealPrivateArtifact`, `readAndVerifyPrivateArtifact`, and `writePrivateManifestAtomic`.
- Consumes: absolute run root, normalized portable relative path, bytes, expected SHA-256, and expected mode.

- [ ] **Step 1: Write failing permissions and traversal tests**

```ts
const root = openPrivateLibraryAnalysisRunRoot(tempRoot, "run-1");
const written = writePrivateArtifactExclusive(root, "raw/sha256-abcd.bin", bytes);
assert.equal(statSync(root).mode & 0o777, 0o700);
assert.equal(statSync(written.path).mode & 0o777, 0o600);
assert.throws(() => writePrivateArtifactExclusive(root, "../escape", bytes), /private_artifact_path_invalid/);
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test tests/lib/private-library-analysis-artifact-store.test.ts`

Expected: FAIL because the store module does not exist.

- [ ] **Step 3: Implement no-follow, exclusive, atomic storage**

Use `realpathSync`, `lstatSync`, `openSync(path, "wx", 0o600)`, `fsyncSync`,
`chmodSync(path, 0o400)`, and a same-directory temporary file plus `renameSync`
for manifests. Reject absolute paths, empty/dot/traversal segments, backslashes,
symlinks, pre-existing files, roots outside the requested base, and mismatched
hash/size on readback.

- [ ] **Step 4: Add overwrite, symlink, seal, and readback tests and run GREEN**

Run: `node --import tsx --test tests/lib/private-library-analysis-artifact-store.test.ts`

Expected: all tests PASS and temporary test roots contain no group/world-readable files.

- [ ] **Step 5: Static checks and commit**

Run: `npx tsc --noEmit && npx eslint src/lib/knowledge/private-library-analysis-artifact-store.ts tests/lib/private-library-analysis-artifact-store.test.ts && git diff --check`

Commit: `git commit -m "feat: add private library artifact store"`.

---

### Task 5: Implement Core Text, HTML, and PDF Extraction

**Files:**
- Create: `src/lib/knowledge/library-analysis-source-extraction.ts`
- Create: `tests/lib/library-analysis-source-extraction.test.ts`
- Modify: `scripts/build-library-analysis-url-text-extraction-profile.ts`
- Modify: `scripts/build-library-analysis-pdf-extraction-profile.ts`

**Interfaces:**
- Produces: `extractLibraryAnalysisSource(input, adapters): ExtractionResult` where success contains raw hash, normalized text hash, extractor binding, warnings, and `LogicalContentUnit[]`.
- Consumes: `{ sourceKey; mediaType; finalLocator; bytes }` and an injected `runPdfText` adapter for tests.

- [ ] **Step 1: Write failing HTML, text, PDF-page, and corrupt-PDF tests**

```ts
const result = extractLibraryAnalysisSource({
  sourceKey: "source_doc:src-1",
  mediaType: "text/html",
  finalLocator: "https://example.test/a",
  bytes: Buffer.from("<html><head>x</head><body><h1>A</h1><script>bad()</script><p>B</p></body></html>"),
}, fixtureAdapters);
assert.equal(result.status, "ready");
assert.equal(result.units[0]!.text, "A\n\nB");
```

For PDF, inject output containing form-feed page separators and assert unit
types are `pdf_page` with `#page=1` and `#page=2` locators.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test --test-name-pattern="HTML|plain text|PDF" tests/lib/library-analysis-source-extraction.test.ts`

Expected: FAIL because the extractor module does not exist.

- [ ] **Step 3: Implement typed extraction results**

Use this result shape:

```ts
type ExtractionResult =
  | { status: "ready"; rawSha256: string; normalizedTextSha256: string; extractor: ToolBinding; units: LogicalContentUnit[]; documentLinkCandidates: string[]; warnings: string[] }
  | { status: "blocked"; reasonCode: "empty_extraction" | "ocr_required" | "corrupt_payload" | "unsupported_media_type"; detail: string };
```

Normalize line endings only. HTML removes `head`, `script`, `style`, and `svg`,
preserves block boundaries, decodes named/numeric entities deterministically,
collects normalized HTTPS links whose path or media hint identifies a PDF, and
rejects a result below the configured meaningful-text floor. PDF validates
the `%PDF-` signature, invokes `pdftotext -layout`, preserves form-feed page
boundaries, and returns `ocr_required` when all pages are empty.

- [ ] **Step 4: Refactor legacy profilers to call shared pure extractors**

Keep existing status labels and tracked output paths unchanged. Add regression
tests to `tests/lib/library-analysis-scripts.test.ts` proving the legacy scripts
import the shared module and retain their dry/read-only behavior.

- [ ] **Step 5: Run focused GREEN and commit**

Run:

```bash
node --import tsx --test tests/lib/library-analysis-source-extraction.test.ts tests/lib/library-analysis-scripts.test.ts
npx tsc --noEmit
npx eslint src/lib/knowledge/library-analysis-source-extraction.ts scripts/build-library-analysis-url-text-extraction-profile.ts scripts/build-library-analysis-pdf-extraction-profile.ts tests/lib/library-analysis-source-extraction.test.ts
git diff --check
```

Commit: `git commit -m "feat: share controlled library text extraction"`.

---

### Task 6: Add CSV, PPTX, and Derived-Record Adapters

**Files:**
- Modify: `src/lib/knowledge/library-analysis-source-extraction.ts`
- Modify: `tests/lib/library-analysis-source-extraction.test.ts`

**Interfaces:**
- Extends `extractLibraryAnalysisSource` with `text/csv` and PPTX MIME/signature handling.
- Produces: `extractLibraryAnalysisDerivedReport(record): ExtractionResult` for an explicit `Report` field allowlist.

- [ ] **Step 1: Write failing CSV, PPTX, and derived-record tests**

Create test fixtures in memory. CSV covers quoted commas, quoted newlines,
empty cells, BOM, and one inconsistent row. PPTX fixture is a minimal ZIP with
`ppt/presentation.xml`, relationship order, two slide XML parts, notes, and one
external relationship. Derived report input includes unsorted
`supportingSources` and an unexpected property.

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test --test-name-pattern="CSV|PPTX|derived report" tests/lib/library-analysis-source-extraction.test.ts`

Expected: FAIL with unsupported media/undefined adapter behavior.

- [ ] **Step 3: Implement exact adapters**

CSV parsing follows RFC 4180 state transitions, preserves empty cells, emits
header-bound `sheet_range` units, and blocks inconsistent column counts.

PPTX verifies ZIP magic, rejects path traversal and external relationships,
reads slide order from `presentation.xml` relationships, extracts `a:t` text
nodes, and emits one `slide` unit plus optional notes unit per slide. The
production adapter invokes `unzip -Z1` and `unzip -p` through `spawnSync` with
an argument array; tests inject `listZipEntries` and `readZipEntry` functions.

Derived report canonicalizes only:

```ts
const DERIVED_REPORT_FIELDS = [
  "id", "title", "fullTitle", "author", "institution", "date", "year",
  "reportCategory", "country", "keyFindings", "recommendations", "relevance",
  "tags", "provenanceType", "supportingSources",
] as const;
```

Sort supporting-source references by canonical JSON. Reject unexpected input
fields before producing a `database_record` unit.

- [ ] **Step 4: Run GREEN and static checks**

Run: `node --import tsx --test tests/lib/library-analysis-source-extraction.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-source-extraction.ts tests/lib/library-analysis-source-extraction.test.ts && git diff --check`

Expected: all tests PASS.

- [ ] **Step 5: Commit**

Commit: `git commit -m "feat: extract structured library source formats"`.

---

### Task 7: Build Read-Only Planning and Explicitly Gated Execution CLIs

**Files:**
- Create: `scripts/knowledge/plan-library-analysis-acquisition.ts`
- Create: `scripts/knowledge/execute-library-analysis-acquisition.ts`
- Create: `tests/lib/library-analysis-acquisition-cli.test.ts`
- Modify: `package.json`

**Interfaces:**
- Planning CLI: `--snapshot <private-path> --output <private-path>`; requires `DATABASE_URL` and performs only a repeatable-read transaction plus repository stat/hash reads.
- Execution CLI: `--plan <private-path> --run-root <private-path> --check-only | --execute-network`; network mode is explicit and mutually exclusive with check-only.

- [ ] **Step 1: Write failing argument and side-effect-gate tests**

```ts
assert.deepEqual(parsePlanArgs(["--snapshot", "/a", "--output", "/b"]), { snapshot: "/a", output: "/b" });
assert.throws(() => parseExecuteArgs(["--plan", "/a", "--run-root", "/b"]), /explicit_execution_mode_required/);
assert.throws(() => parseExecuteArgs(["--plan", "/a", "--run-root", "/b", "--check-only", "--execute-network"]), /execution_modes_mutually_exclusive/);
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test tests/lib/library-analysis-acquisition-cli.test.ts`

Expected: FAIL because the CLI modules do not exist.

- [ ] **Step 3: Implement the read-only locator resolver**

Within `REPEATABLE READ` plus `SET TRANSACTION READ ONLY`, resolve:

- document route from bound `Document`;
- SourceDoc URL, DOI, archived URL, and provenance fields;
- Report URL/DOI or allowlisted derived-record fields;
- Thesis URL/DOI;
- repository paths through `canonicalPath`, then exact stat/hash readback.

Reject locator facts that do not map to exactly one population identity. Write
the plan through `writeCandidateControlSnapshotAtomic`; never write tracked
status files.

- [ ] **Step 4: Implement controlled execution with injected adapters**

Reuse `generateControlledHttpsFetchReceipt`. Default to `--check-only` only
when explicitly supplied. Network mode stores raw bytes, receipt, extraction
manifest, and checkpoints in the private store. Retry 429/5xx/transport errors
up to three attempts with 1-second then 4-second delays; an integer
`Retry-After` may replace the delay but is capped at 30 seconds. Do not retry
401/403/404/410. If an HTML landing page yields exactly one same-origin HTTPS
PDF candidate, acquire that candidate with a new linked receipt. Zero or more
than one eligible candidate remains blocked as `identity_ambiguous`. Sanitize
output to:

```ts
{ sourceKey, state, reasonCode, rawSha256, normalizedTextSha256, unitCount }
```

Do not print locators, paths, response bodies, extracted text, or exceptions
containing secrets.

- [ ] **Step 5: Add package scripts, run GREEN, and commit**

Add:

```json
"knowledge:library-analysis:acquisition:plan": "tsx scripts/knowledge/plan-library-analysis-acquisition.ts",
"knowledge:library-analysis:acquisition:check": "tsx scripts/knowledge/execute-library-analysis-acquisition.ts --check-only",
"knowledge:library-analysis:acquisition:execute": "tsx scripts/knowledge/execute-library-analysis-acquisition.ts --execute-network"
```

Run: `node --import tsx --test tests/lib/library-analysis-acquisition-cli.test.ts tests/lib/package-scripts.test.ts && npx tsc --noEmit && npx eslint scripts/knowledge/plan-library-analysis-acquisition.ts scripts/knowledge/execute-library-analysis-acquisition.ts tests/lib/library-analysis-acquisition-cli.test.ts && git diff --check`

Commit: `git commit -m "feat: orchestrate private library acquisition"`.

---

### Task 8: Emit Resolution, Content Units, and Cost Envelope Privately

**Files:**
- Create: `scripts/knowledge/emit-library-analysis-content-units.ts`
- Modify: `scripts/knowledge/ingest-library-analysis-content-units.ts`
- Modify: `tests/lib/library-analysis-content-intake.test.ts`
- Modify: `tests/lib/library-analysis-acquisition-cli.test.ts`
- Modify: `package.json`

**Interfaces:**
- CLI: `--snapshot`, `--plan`, `--run-root`, and `--output`; never accepts a database URL.
- Produces: sealed resolution manifest, content-unit manifest, and `library-analysis-cost-envelope/v1` with code-point/token ranges.
- Candidate intake consumes the same resolution and verifies each private unit by hash before the attested writer call.

- [ ] **Step 1: Write failing private-emit tests**

Use a fixture population with one database document, one acquired source, one
superseded row, and one blocker. Assert:

```ts
assert.equal(output.resolution.rows.length, output.populationTotal);
assert.equal(output.resolution.populationHash, snapshot.populationHash);
assert.ok(output.contentUnits.every(unit => unit.text === undefined));
assert.equal(output.costEnvelope.automatedOnly, true);
assert.equal(output.costEnvelope.externalReady, false);
```

- [ ] **Step 2: Run RED**

Run: `node --import tsx --test tests/lib/library-analysis-content-intake.test.ts tests/lib/library-analysis-acquisition-cli.test.ts`

Expected: FAIL because private emit and resolution-aware intake do not exist.

- [ ] **Step 3: Implement content-unit descriptors and token interval**

Chunk every logical unit with the versioned chunker. Unit IDs use
`candidateAnalysisSha256("library-analysis-content-unit", { sourceKind,
sourceKey, sourceVersionHash, unitType, ordinal, locator, contentHash,
chunkPolicyHash })`.

Set `sourceVersionHash` by route before building units:

```ts
database_document       = sha256([summary, content].filter(Boolean).join("\n\n"))
controlled_https        = rawResponseBodySha256
repository_csv          = repositoryFileSha256
repository_pptx         = repositoryFileSha256
database_derived_record = sha256(canonicalAllowlistedRecordJson)
```

Receipt hashes are validated as `sha256:<hex>` and normalized to `<hex>` only
at the candidate contract boundary. The normalized extracted-text hash never
replaces the route's source-version hash.

Estimate one-pass input tokens as:

```ts
minimumInputTokens = Math.ceil(totalCodePoints / 4.2);
maximumInputTokens = Math.ceil(totalCodePoints / 3.0);
analysisAndValidationTokens = {
  minimum: minimumInputTokens * 2,
  maximum: maximumInputTokens * 2,
};
```

Record estimator version and do not label the interval as billing truth.

- [ ] **Step 4: Make candidate intake resolution-aware without enabling it**

Require matching population, plan, resolution, chunk-policy, and private-file
hashes before calling `appendContentUnit`. Preserve the existing CLI requirement
for `CANDIDATE_INTAKE_DATABASE_URL`; private emit must import no Prisma client
and make no DB call.

- [ ] **Step 5: Run GREEN, static checks, and commit**

Add package script:

```json
"knowledge:library-analysis:acquisition:emit": "tsx scripts/knowledge/emit-library-analysis-content-units.ts"
```

Run:

```bash
node --import tsx --test tests/lib/library-analysis-content-intake.test.ts tests/lib/library-analysis-acquisition-cli.test.ts tests/lib/package-scripts.test.ts
npx tsc --noEmit
npx eslint scripts/knowledge/emit-library-analysis-content-units.ts scripts/knowledge/ingest-library-analysis-content-units.ts tests/lib/library-analysis-content-intake.test.ts
git diff --check
```

Commit: `git commit -m "feat: emit private library content units"`.

---

### Task 9: Run the Private Pilot and Seal a Sanitized Receipt

**Files:**
- Create after successful pilot: `research/_status/library-analysis-acquisition-pilot-2026-08-21.md`
- Test: existing focused and audit suites only; no new production code unless a witnessed failure requires a separate TDD fix.

**Interfaces:**
- Consumes: private v3 snapshot, private acquisition plan, run root, and the eight-format pilot selector.
- Produces: private raw/extraction/resolution/unit/cost artifacts plus one tracked sanitized receipt.

- [ ] **Step 1: Verify preconditions without network or database writes**

Run `git status --short`, confirm the worktree is clean, verify the private
snapshot file SHA-256 is
`63b345286d0bc1be5ed54d2b6f976fc634a7efa8852670086c4b05123c1098d6`,
and run acquisition `--check-only` against the planned private root.

- [ ] **Step 2: Generate a fresh read-only acquisition plan**

Use the already authorized read-only database connection. Write the plan to a
new private run directory; record only plan ID, plan hash, population hash,
route counts, and blocker counts in the operator notes.

- [ ] **Step 3: Execute the bounded pilot acquisition**

Select one database document with summary, the largest database document, one
HTML source, one PDF, both CSV/PPTX classes, one derived report, and one known
blocker. Invoke network mode only for the selected external pilot sources.
Stop on path escape, hash drift, unredacted output, corrupt manifest, or a
source outside the selector.

- [ ] **Step 4: Emit and verify private content units and cost envelope**

Read back every private file by expected size/hash/mode, verify exact logical-
unit reconstruction, verify resolution completeness for the pilot scope, and
confirm no candidate DB variables or writes were used.

- [ ] **Step 5: Write the sanitized receipt**

The tracked receipt contains commit SHA, snapshot/plan/resolution/unit/cost
hashes, route/disposition/unit counts, test commands, stop conditions, and
explicit statements:

```text
automatedOnly=true
externalReady=false
candidateDatabaseWritten=false
productionDataMutated=false
networkScope=bounded_pilot
```

It contains no URL, private absolute path, raw/extracted text, secrets, or
unhashed document identifiers.

- [ ] **Step 6: Full verification and commit**

Run:

```bash
node --import tsx --test tests/lib/library-analysis-*.test.ts tests/lib/private-library-analysis-artifact-store.test.ts
npx tsc --noEmit
npx eslint src/lib/knowledge/library-analysis-*.ts src/lib/knowledge/private-library-analysis-artifact-store.ts scripts/knowledge/*library-analysis*.ts tests/lib/library-analysis-*.test.ts tests/lib/private-library-analysis-artifact-store.test.ts
npm run audit:research-artifacts -- --base=origin/main
git diff --check
git status --short
```

Stage only the sanitized receipt and any separately verified TDD fixes. Commit
the receipt as `docs: record private library acquisition pilot`.

---

### Task 10: Final Review and Implementation Handover

**Files:**
- Modify: `research/_status/library-analysis-population-reconciliation-2026-08-21.md`
- Create: `research/_status/HANDOVER-library-analysis-acquisition-2026-08-21.md`

**Interfaces:**
- Consumes: exact commits and private pilot receipt.
- Produces: an evidence-led handover separating local completion from network, candidate DB, migration, deployment, runtime, and external-authority gates.

- [ ] **Step 1: Update reconciliation status with the implemented intake path**

Add exact plan/spec/receipt paths, commit SHAs, current disposition counts, and
the remaining blocker classes. Do not change a blocker count without a fresh
resolution readback.

- [ ] **Step 2: Write the handover**

Include exact private commands with placeholders only for operator-owned
secrets, verified output hashes, retry/resume rules, destructive-action stop
lines, and the next separately authorized decision: full acquisition run or
candidate migration/role activation.

- [ ] **Step 3: Run final repository verification**

Run:

```bash
node --import tsx --test tests/lib/library-analysis-*.test.ts tests/lib/private-library-analysis-artifact-store.test.ts
npx tsc --noEmit
npx eslint src/lib/knowledge/library-analysis-*.ts src/lib/knowledge/private-library-analysis-artifact-store.ts scripts/knowledge/*library-analysis*.ts tests/lib/library-analysis-*.test.ts tests/lib/private-library-analysis-artifact-store.test.ts
npm run audit:research-artifacts -- --base=origin/main
git diff --check
git status --short
git log --oneline --decorate -12
```

Record actual results, not expected ones.

- [ ] **Step 4: Commit documentation only**

Stage the two exact status/handover paths and commit:

```bash
git commit -m "docs: hand over library acquisition pipeline"
```

- [ ] **Step 5: Stop before external state changes**

Do not push, open a PR, merge, migrate, activate roles, deploy, run the full
external acquisition, or start paid model execution without a new explicit
authorization and fresh release/recovery proof.
