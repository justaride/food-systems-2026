# Codex-Native Library Analysis Orchestration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a read-only, private, resumable agent queue that lets three Luna Codex workers analyze every sealed library content unit and lets the main Codex agent independently validate and audit every result.

**Architecture:** Derive an immutable queue from the acquisition resolution and content-unit manifest, publish only sealed private job envelopes, treat every agent response as untrusted, merge accepted segments deterministically per source, and derive validation dispositions from full claim payloads plus deterministic evidence gates. Repository code never calls a model API; Codex dispatches logical workers and feeds their JSON responses back through the fail-closed contracts.

**Tech Stack:** TypeScript, Node.js, Zod, `node:test`, existing candidate canonical JSON/hash helpers, and the existing private library-analysis artifact store.

**Spec:** `docs/superpowers/specs/2026-08-21-codex-native-library-analysis-orchestration-design.md`

## Global Constraints

- Bind the queue to population `00a9ab5b9105442d0c6ce9a84102a5ca681a0949d331bd635277febacd789dcb`, plan `db450c5c8b392ead8b99908360904e7a6cec89af674085c239a3f81f50f78b76`, resolution `1bc3d95b4629547c6b4372698adb816c8791a861f8efe379c1121125929ada91`, manifest `694a3bfeb66d666891998d05afc6fd7bf393f57e4e8be6d7dcf0d1a0b6576397`, cost envelope `6869492cb0f99789ac986c324ebae1e91ea846e4085a70b496f1ad1ab1560638`, and merged inventory `b2a79f57cd9e225121e77028a5f78bf00c3a46941da4eeac2c3ee05d63b54079`.
- Select only resolution rows with `disposition=content_units_ready`; exact expected coverage is `1,569` sources and `8,393` content units.
- Set `automatedOnly=true`, `externalReady=false`, `externalApiUsed=false`, `candidateDatabaseWritten=false`, `productionDataMutated=false`, and `humanSourceReviewRequired=false` in every terminal receipt.
- Use at most three concurrent Luna analyzers, three attempts per job, `48,000` code points per job, and four units per job.
- Never mix sources in a job; segment large sources into deterministic contiguous unit ranges.
- Never write source text, source keys, private paths, claims, or evidence excerpts to tracked repository artifacts.
- Never call Ollama, an external model service, a repository model API, the candidate writer, Prisma, or production data from this workflow.
- Keep private directories at mode `0700`, active files at `0600`, and sealed files at `0400`; reject overwrite, traversal, and symlinks.
- Preserve the known scope-independent corpus-health Prisma schema-hash baseline failure and report it separately.

---

## File Map

- `src/lib/knowledge/library-analysis-agent-queue.ts`: immutable queue schemas, hashing, source coverage, segmentation, and verified private-unit loading.
- `src/lib/knowledge/library-analysis-agent-response.ts`: segment response schema, untrusted-response validation, deterministic claim IDs, and source merge.
- `src/lib/knowledge/library-analysis-agent-validation.ts`: full-payload validation request, deterministic checks, model separation, F1-F5 derivation, and source validation result.
- `src/lib/knowledge/library-analysis-agent-checkpoint.ts`: immutable attempt receipts, state derivation, resume selection, terminal queue receipt, and tracked redaction.
- `scripts/knowledge/manage-library-analysis-agent-queue.ts`: CLI for `build`, `prepare-attempt`, `accept-attempt`, `merge-source`, `validate-source`, `status`, and `finalize`.
- `scripts/knowledge/select-library-analysis-agent-pilot.ts`: deterministic stratified pilot selection and pilot queue derivation.
- `tests/lib/library-analysis-agent-queue.test.ts`: queue construction, binding, segmentation, and private readback tests.
- `tests/lib/library-analysis-agent-response.test.ts`: response schema, coverage, locator, evidence, hashing, and merge tests.
- `tests/lib/library-analysis-agent-validation.test.ts`: validator payload, deterministic gates, separation, and F1-F5 tests.
- `tests/lib/library-analysis-agent-checkpoint.test.ts`: attempt/resume/final audit/redaction tests.
- `tests/lib/library-analysis-agent-cli.test.ts`: private CLI end-to-end tests without model or database calls.
- `tests/lib/library-analysis-agent-pilot.test.ts`: deterministic pilot strata and cap tests.
- `package.json`: private queue and pilot commands only.
- `research/_status/library-analysis-codex-native-orchestration-2026-08-21.md`: sanitized implementation receipt with hashes, totals, gate status, and explicit limitations.

---

### Task 1: Immutable Acquisition-Aware Queue Contract

**Files:**
- Create: `src/lib/knowledge/library-analysis-agent-queue.ts`
- Create: `tests/lib/library-analysis-agent-queue.test.ts`

**Interfaces:**
- Consumes: `LibraryAnalysisAcquisitionResolution`, `LibraryAnalysisContentUnitManifest`, `readAndVerifyPrivateArtifact()`, `candidateAnalysisSha256()`, and `canonicalCandidateJson()`.
- Produces: `LibraryAnalysisAgentQueueSchema`, `LibraryAnalysisAgentQueue`, `buildLibraryAnalysisAgentQueue(input)`, `verifyLibraryAnalysisAgentQueue(queue)`, `loadVerifiedLibraryAnalysisJob(root, queue, jobId)`, and `libraryAnalysisAgentQueueHash(core)`.

- [ ] **Step 1: Write failing tests for exact acquisition-aware coverage**

```ts
test("queue selects ready resolution rows including formerly blocked routes", () => {
  const { resolution, manifest, root } = queueFixture(t, [
    readySource("document", "document:a", [unit("a", 0, "alpha")]),
    readySource("source_doc", "source_doc:web", [unit("web", 0, "https text")]),
  ]);
  const queue = buildLibraryAnalysisAgentQueue({
    resolution,
    manifest,
    runRoot: root,
    costEnvelopeHash: HASHES.cost,
    mergedInventoryHash: HASHES.inventory,
    runtimeCommit: "5f3eb1c",
    workflow: binding("library_analysis_v1"),
    analysisPrompt: binding("library_analysis_agent_v1"),
    validationWorkflow: binding("library_validation_v1"),
    validationPrompt: binding("library_validation_agent_v1"),
  });
  assert.equal(queue.sources.length, 2);
  assert.equal(queue.jobs.flatMap((job) => job.unitIds).length, 2);
  assert.ok(queue.sources.some((source) => source.sourceKey === "source_doc:web"));
});

test("queue rejects missing duplicate and drifted units", () => {
  const fixture = queueFixture(t, [readySource("document", "document:a", [
    unit("a", 0, "alpha"), unit("a", 1, "beta"),
  ])]);
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, manifest: dropLastUnit(fixture.manifest) }),
    /agent_queue_resolution_manifest_coverage_mismatch/,
  );
  assert.throws(
    () => buildLibraryAnalysisAgentQueue({ ...fixture.input, manifest: driftUnitHash(fixture.manifest) }),
    /private_artifact_hash_mismatch|agent_queue_unit_binding_mismatch/,
  );
});
```

- [ ] **Step 2: Run the queue tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-queue.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `library-analysis-agent-queue`.

- [ ] **Step 3: Implement strict schemas, hashes, and verified unit loading**

```ts
export const LIBRARY_ANALYSIS_AGENT_QUEUE_SCHEMA =
  "library-analysis-agent-queue/v1" as const;

export type BuildLibraryAnalysisAgentQueueInput = {
  resolution: LibraryAnalysisAcquisitionResolution;
  manifest: LibraryAnalysisContentUnitManifest;
  runRoot: string;
  costEnvelopeHash: string;
  mergedInventoryHash: string;
  runtimeCommit: string;
  workflow: AgentFileBinding;
  analysisPrompt: AgentFileBinding;
  validationWorkflow: AgentFileBinding;
  validationPrompt: AgentFileBinding;
  policy?: {
    maximumAttempts: 3;
    maximumConcurrentAnalyzers: 3;
    maximumCodePointsPerJob: 48000;
    maximumUnitsPerJob: 4;
  };
};

export function loadVerifiedLibraryAnalysisJob(
  runRoot: string,
  queue: LibraryAnalysisAgentQueue,
  jobId: string,
): LibraryAnalysisVerifiedJob {
  const job = uniqueJob(queue, jobId);
  return {
    job,
    units: job.unitIds.map((id) => {
      const descriptor = uniqueUnit(queue, id);
      const bytes = readAndVerifyPrivateArtifact(runRoot, descriptor.portablePath, {
        sha256: descriptor.contentHash,
        sizeBytes: descriptor.sizeBytes,
        mode: 0o400,
      });
      const text = bytes.toString("utf8");
      if (Buffer.byteLength(text, "utf8") !== descriptor.sizeBytes ||
          [...text].length !== descriptor.codePoints) {
        throw new Error("agent_queue_unit_size_mismatch");
      }
      return { descriptor, text };
    }),
  };
}
```

Construct queue sources from ready resolution rows and manifest descriptors, UTF-8 sort identities and unit ordinals, reject any one-to-many mismatch, then create contiguous jobs without crossing either limit or a source boundary. Bind `selectionHash` to sources/units and `queueHash` to the complete immutable core.

- [ ] **Step 4: Run focused tests and static checks**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-queue.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-queue.ts tests/lib/library-analysis-agent-queue.test.ts && git diff --check`

Expected: PASS; no diagnostics.

- [ ] **Step 5: Commit the queue contract**

```bash
git add src/lib/knowledge/library-analysis-agent-queue.ts tests/lib/library-analysis-agent-queue.test.ts
git commit -m "feat: add acquisition-aware analysis agent queue"
```

---

### Task 2: Private Queue Publication and Job Envelopes

**Files:**
- Create: `scripts/knowledge/manage-library-analysis-agent-queue.ts`
- Create: `tests/lib/library-analysis-agent-cli.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: Task 1 queue APIs plus `openPrivateLibraryAnalysisRunRoot()`, `writePrivateManifestAtomic()`, `writePrivateArtifactExclusive()`, `sealPrivateArtifact()`, and `auditPrivateLibraryAnalysisRunRoot()`.
- Produces: `parseLibraryAnalysisAgentQueueArgs(argv)`, `runLibraryAnalysisAgentQueueCli(options)`, package command `research:library:agent-queue`, sealed `queue/queue-<hash>.json`, and sealed `jobs/<jobId>/attempt-001/input.json`.

- [ ] **Step 1: Write failing CLI tests for private publication and no model/database access**

```ts
test("build publishes a sealed queue without embedding source text", async (t) => {
  const fixture = cliFixture(t);
  const result = await runLibraryAnalysisAgentQueueCli({
    command: "build",
    runRoot: fixture.runRoot,
    resolution: fixture.resolutionPath,
    manifest: fixture.manifestPath,
    costEnvelopeHash: fixture.costHash,
    mergedInventoryHash: fixture.inventoryHash,
    runtimeCommit: "5f3eb1c",
    repositoryRoot: fixture.repositoryRoot,
  });
  assert.equal(result.sources, 2);
  assert.equal(statSync(result.queuePath).mode & 0o777, 0o400);
  assert.doesNotMatch(readFileSync(result.queuePath, "utf8"), /private source bytes/);
});

test("prepare-attempt emits exactly one job and refuses overwrite", async (t) => {
  const fixture = await builtCliFixture(t);
  const first = await runLibraryAnalysisAgentQueueCli({
    command: "prepare-attempt", runRoot: fixture.runRoot,
    queue: fixture.queuePath, jobId: fixture.jobId, attempt: 1,
  });
  assert.equal(statSync(first.inputPath).mode & 0o777, 0o400);
  await assert.rejects(
    runLibraryAnalysisAgentQueueCli({
      command: "prepare-attempt", runRoot: fixture.runRoot,
      queue: fixture.queuePath, jobId: fixture.jobId, attempt: 1,
    }),
    /private_artifact_exists/,
  );
});
```

- [ ] **Step 2: Run the CLI tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-cli.test.ts`

Expected: FAIL because the management CLI does not exist.

- [ ] **Step 3: Implement `build` and `prepare-attempt` commands**

Use one strict Zod option schema per command. Resolve workflow/prompt files under `repositoryRoot`, hash their bytes, build the queue, serialize with `canonicalCandidateJson(queue) + "\n"`, and publish it through `writePrivateManifestAtomic`. `prepare-attempt` must call `loadVerifiedLibraryAnalysisJob`, include only its own verified texts, add the queue/job hashes and policy, publish once, read it back, then audit the run root.

```ts
export type LibraryAnalysisAgentQueueCommand =
  | BuildQueueOptions
  | PrepareAttemptOptions;

export async function runLibraryAnalysisAgentQueueCli(
  options: LibraryAnalysisAgentQueueCommand,
): Promise<LibraryAnalysisAgentQueueCliResult> {
  if (options.command === "build") return runBuildQueue(options);
  return runPrepareAttempt(options);
}
```

Add only this package script:

```json
"research:library:agent-queue": "tsx scripts/knowledge/manage-library-analysis-agent-queue.ts"
```

- [ ] **Step 4: Run focused tests and static checks**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-queue.test.ts tests/lib/library-analysis-agent-cli.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-queue.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-{queue,cli}.test.ts && git diff --check`

Expected: PASS; no diagnostics.

- [ ] **Step 5: Commit private queue publication**

```bash
git add package.json scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-cli.test.ts
git commit -m "feat: publish private analysis agent jobs"
```

---

### Task 3: Untrusted Luna Segment Response Validation

**Files:**
- Create: `src/lib/knowledge/library-analysis-agent-response.ts`
- Create: `tests/lib/library-analysis-agent-response.test.ts`
- Modify: `scripts/knowledge/manage-library-analysis-agent-queue.ts`
- Modify: `tests/lib/library-analysis-agent-cli.test.ts`

**Interfaces:**
- Consumes: `LibraryAnalysisVerifiedJob` from Task 1.
- Produces: `LibraryAnalysisAgentSegmentResponseSchema`, `LibraryAnalysisAcceptedSegmentSchema`, `validateLibraryAnalysisAgentSegmentResponse(input)`, deterministic claim IDs, and CLI command `accept-attempt`.

- [ ] **Step 1: Write failing tests for complete coverage and evidence ownership**

```ts
test("accepts complete coverage and derives claim IDs", () => {
  const job = verifiedJob(["Alpha grew by 12 percent.", "No material claim here."]);
  const accepted = validateLibraryAnalysisAgentSegmentResponse({
    queueHash: HASH, job,
    response: segmentResponse(job, {
      unitCoverage: [
        coverage(job.units[0]!, "claims_extracted"),
        coverage(job.units[1]!, "no_material_claim"),
      ],
      claims: [claim(job.units[0]!, "Alpha grew by 12 percent.")],
    }),
  });
  assert.match(accepted.claims[0]!.claimId, /^claim:library-agent:[a-f0-9]{64}$/);
});

test("rejects omitted units foreign locators fabricated evidence and hash drift", () => {
  const job = verifiedJob(["verified evidence"]);
  assert.throws(() => validateResponse(job, responseWithCoverage([])), /unit_coverage_mismatch/);
  assert.throws(() => validateResponse(job, responseWithLocator("foreign:locator")), /locator_ownership_mismatch/);
  assert.throws(() => validateResponse(job, responseWithEvidence("invented")), /evidence_not_contained/);
  assert.throws(() => validateResponse(job, responseWithHash("0".repeat(64))), /response_hash_mismatch/);
});
```

- [ ] **Step 2: Run response tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-response.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement strict response validation**

Define exact schemas for `unitCoverage`, `claims`, `model`, and `responseHash`. Require provider `openai-codex`, non-empty model/version receipts, one unique coverage row for every job unit, a typed reason for `blocked`, and at least one claim for `claims_extracted`. Reject claims attached to `no_material_claim` or `blocked` units.

```ts
export function validateLibraryAnalysisAgentSegmentResponse(input: {
  queueHash: string;
  job: LibraryAnalysisVerifiedJob;
  response: unknown;
}): LibraryAnalysisAcceptedSegment {
  const response = LibraryAnalysisAgentSegmentResponseSchema.parse(input.response);
  assertResponseHash(response);
  assertJobBinding(input.queueHash, input.job.job, response);
  assertExactCoverage(input.job.units, response.unitCoverage);
  const claims = response.claims.map((claim) => {
    const unit = ownedUnit(input.job, claim.contentUnitId);
    if (claim.locator !== unit.descriptor.locator) {
      throw new Error("agent_response_locator_ownership_mismatch");
    }
    if (!unit.text.includes(claim.evidence)) {
      throw new Error("agent_response_evidence_not_contained");
    }
    return { ...claim, claimId: deterministicClaimId(input.job.job, claim) };
  });
  return LibraryAnalysisAcceptedSegmentSchema.parse({ ...response, claims });
}
```

Run deterministic numeric-token comparison for claims containing numbers; reject a number, sign, percent marker, or currency marker absent from the evidence.

- [ ] **Step 4: Add `accept-attempt` private CLI publication**

Read the sealed attempt input, read the worker response from an explicit private input path, validate it, then seal both the raw untrusted response and accepted result under the attempt directory. Never overwrite an existing attempt and never print source keys, claims, evidence, or private paths to stdout.

- [ ] **Step 5: Run focused tests and commit**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-response.test.ts tests/lib/library-analysis-agent-cli.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-response.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-{response,cli}.test.ts && git diff --check`

Expected: PASS; no diagnostics.

```bash
git add src/lib/knowledge/library-analysis-agent-response.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-response.test.ts tests/lib/library-analysis-agent-cli.test.ts
git commit -m "feat: validate Luna analysis segment responses"
```

---

### Task 4: Deterministic Source Merge

**Files:**
- Modify: `src/lib/knowledge/library-analysis-agent-response.ts`
- Modify: `tests/lib/library-analysis-agent-response.test.ts`
- Modify: `scripts/knowledge/manage-library-analysis-agent-queue.ts`
- Modify: `tests/lib/library-analysis-agent-cli.test.ts`

**Interfaces:**
- Consumes: all accepted segments for one queue source.
- Produces: `LibraryAnalysisSourceResultSchema`, `mergeLibraryAnalysisSourceSegments(input)`, and CLI command `merge-source`.

- [ ] **Step 1: Write failing merge tests**

```ts
test("merge covers each source unit once and deterministically deduplicates claims", () => {
  const source = queueSourceWithTwoSegments();
  const result = mergeLibraryAnalysisSourceSegments({
    queueHash: HASH, source,
    segments: [acceptedSegment(source, 1), acceptedSegment(source, 0)],
  });
  assert.deepEqual(result.unitCoverage.map((row) => row.contentUnitId), source.unitIds);
  assert.equal(new Set(result.claims.map((claim) => claim.claimId)).size, result.claims.length);
  assert.equal(result.analysisState, "complete");
  assert.deepEqual(
    mergeLibraryAnalysisSourceSegments({ queueHash: HASH, source, segments: [...segments].reverse() }),
    result,
  );
});

test("merge permits zero claims only with explicit no-material-claim coverage", () => {
  assert.equal(mergeNoClaimSource().claims.length, 0);
  assert.throws(() => mergeSourceWithMissingSegment(), /source_merge_coverage_mismatch/);
});
```

- [ ] **Step 2: Run the merge tests and witness RED**

Run: `node --import=tsx --test --test-name-pattern='merge' tests/lib/library-analysis-agent-response.test.ts`

Expected: FAIL because `mergeLibraryAnalysisSourceSegments` is not exported.

- [ ] **Step 3: Implement fail-closed source merge**

Sort segments by ordinal, require their job IDs to equal the source job set, require exact unit coverage, carry all attempt/model receipts, and deduplicate only byte-identical normalized claim tuples. Never synthesize claims during merge. Set `complete` only when every segment is accepted; use `partial`, `failed`, or `quarantined` when terminal receipts prove those states.

```ts
export function mergeLibraryAnalysisSourceSegments(input: {
  queueHash: string;
  source: LibraryAnalysisAgentQueueSource;
  segments: readonly LibraryAnalysisTerminalSegment[];
}): LibraryAnalysisSourceResult {
  assertExactSourceJobs(input.source, input.segments);
  const coverage = exactSourceCoverage(input.source, input.segments);
  const claims = deduplicateAcceptedClaims(input.segments.flatMap((segment) => segment.claims));
  const core = { schema: SOURCE_RESULT_SCHEMA, queueHash: input.queueHash,
    sourceEnvelopeHash: input.source.sourceEnvelopeHash, unitCoverage: coverage,
    claims, segments: segmentReceipts(input.segments),
    analysisState: deriveAnalysisState(input.segments) };
  return LibraryAnalysisSourceResultSchema.parse({
    ...core, sourceResultHash: candidateAnalysisSha256("library-analysis-source-result", core),
  });
}
```

- [ ] **Step 4: Add `merge-source`, test, and commit**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-response.test.ts tests/lib/library-analysis-agent-cli.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-response.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-{response,cli}.test.ts && git diff --check`

Expected: PASS; no diagnostics.

```bash
git add src/lib/knowledge/library-analysis-agent-response.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-response.test.ts tests/lib/library-analysis-agent-cli.test.ts
git commit -m "feat: merge agent segments by source"
```

---

### Task 5: Full-Payload Independent Validation and F1-F5 Gates

**Files:**
- Create: `src/lib/knowledge/library-analysis-agent-validation.ts`
- Create: `tests/lib/library-analysis-agent-validation.test.ts`
- Modify: `scripts/knowledge/manage-library-analysis-agent-queue.ts`
- Modify: `tests/lib/library-analysis-agent-cli.test.ts`

**Interfaces:**
- Consumes: `LibraryAnalysisSourceResult` and verified source units.
- Produces: `LibraryAnalysisAgentValidationRequestSchema`, `buildLibraryAnalysisAgentValidationRequest(input)`, `validateLibraryAnalysisAgentValidationResponse(input)`, `deriveLibraryAnalysisAgentValidationResult(input)`, `deriveValidatorSeparation(analysisModels, validatorModel, deterministicRuleIds)`, and CLI command `validate-source`.

- [ ] **Step 1: Write failing full-payload and separation tests**

```ts
test("validation request carries claim text evidence locator and unit binding", () => {
  const request = buildLibraryAnalysisAgentValidationRequest(sourceValidationFixture());
  assert.deepEqual(Object.keys(request.claims[0]!).sort(), [
    "assertionType", "claimId", "contentUnitId", "evidence", "locator", "payloadHash", "text",
  ]);
});

test("separation is derived from receipts and never trusted from model text", () => {
  assert.equal(deriveValidatorSeparation(
    [{ provider: "openai-codex", name: "gpt-5.6-luna", version: "receipt-a" }],
    { provider: "openai-codex", name: "gpt-5.6-sol", version: "receipt-b" },
    ["evidence-substring-v1"],
  ), "separate_model_plus_deterministic");
  assert.equal(deriveValidatorSeparation(
    [{ provider: "openai-codex", name: "gpt-5.6-luna", version: "unknown" }],
    { provider: "openai-codex", name: "gpt-5.6-luna", version: "unknown" },
    ["evidence-substring-v1"],
  ), "same_model");
});
```

- [ ] **Step 2: Write the F1-F5 table tests**

```ts
for (const [finding, disposition] of [
  [finding("F1", "critical", true), "quarantined"],
  [finding("F2", "critical", true), "quarantined"],
  [finding("F3", "material", true), "quarantined"],
  [finding("F4", "material", false), "quarantined"],
  [finding("F5", "material", true), "quarantined"],
  [finding("F5", "material", false), "partial"],
] as const) {
  test(`${finding.errorClass} derives ${disposition}`, () => {
    assert.equal(deriveLibraryAnalysisAgentValidationResult(
      validationInput({ findings: [finding] }),
    ).disposition, disposition);
  });
}
```

- [ ] **Step 3: Run validation tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-validation.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 4: Implement validation request and deterministic gates**

Carry full claim fields and domain-separated `payloadHash`. Re-read every referenced unit; recompute content hash, locator ownership, evidence substring, and numeric/currency/percent tokens. Produce deterministic F1-F3 findings before accepting any model findings. Model output may add semantic contradiction, classification, risk, and material-omission findings, but cannot suppress deterministic findings.

```ts
export function deriveValidatorSeparation(
  analysisModels: readonly AgentModelReceipt[],
  validatorModel: AgentModelReceipt,
  deterministicRuleIds: readonly string[],
): AutomatedValidatorSeparationLevel {
  const identityProven = [...analysisModels, validatorModel]
    .every((model) => model.version !== "unknown");
  if (!identityProven || analysisModels.some((model) => sameModel(model, validatorModel))) {
    return "same_model";
  }
  return deterministicRuleIds.length > 0
    ? "separate_model_plus_deterministic"
    : "separate_model";
}
```

The terminal result must always include the six governance flags from Global Constraints. Reuse the existing `deriveAutomatedDisposition()` only after mapping the source result and combined findings into its strict input; never accept disposition or separation from the model response.

- [ ] **Step 5: Add `validate-source`, test, and commit**

`validate-source` reads a sealed source result, emits a sealed full validation request for the main agent, accepts an explicit private validation response on a later invocation, re-runs deterministic gates, derives separation and disposition, and seals the source validation result.

Run: `node --import=tsx --test tests/lib/library-analysis-agent-validation.test.ts tests/lib/library-analysis-agent-cli.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-validation.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-{validation,cli}.test.ts && git diff --check`

Expected: PASS; no diagnostics.

```bash
git add src/lib/knowledge/library-analysis-agent-validation.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-validation.test.ts tests/lib/library-analysis-agent-cli.test.ts
git commit -m "feat: validate full library claim payloads"
```

---

### Task 6: Immutable Attempts, Resume, and Terminal Audit

**Files:**
- Create: `src/lib/knowledge/library-analysis-agent-checkpoint.ts`
- Create: `tests/lib/library-analysis-agent-checkpoint.test.ts`
- Modify: `scripts/knowledge/manage-library-analysis-agent-queue.ts`
- Modify: `tests/lib/library-analysis-agent-cli.test.ts`

**Interfaces:**
- Consumes: queue, accepted/quarantined attempts, source results, validation results, and private-root audit.
- Produces: `LibraryAnalysisAgentAttemptReceiptSchema`, `deriveLibraryAnalysisAgentQueueState(input)`, `selectNextLibraryAnalysisAgentJobs(input)`, `buildLibraryAnalysisAgentTerminalReceipt(input)`, `sanitizeLibraryAnalysisAgentReceipt(input)`, CLI commands `status` and `finalize`.

- [ ] **Step 1: Write failing resume and exact-terminal-coverage tests**

```ts
test("resume reuses verified terminal attempts and advances incomplete jobs", () => {
  const state = deriveLibraryAnalysisAgentQueueState(resumeFixture());
  assert.deepEqual(state.reusableJobIds, ["job:accepted"]);
  assert.deepEqual(state.nextAttempts, [
    { jobId: "job:invalid", attempt: 2 },
    { jobId: "job:missing", attempt: 1 },
  ]);
});

test("terminal receipt requires exact 1569 source and 8393 unit coverage", () => {
  assert.throws(
    () => buildLibraryAnalysisAgentTerminalReceipt(incompleteTerminalFixture()),
    /queue_terminal_coverage_mismatch/,
  );
});

test("sanitized receipt excludes source identifiers text paths claims and evidence", () => {
  const json = JSON.stringify(sanitizeLibraryAnalysisAgentReceipt(terminalFixture()));
  assert.doesNotMatch(json, /sourceKey|portablePath|evidence|claims|private source/);
});
```

- [ ] **Step 2: Run checkpoint tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-checkpoint.test.ts`

Expected: FAIL with `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Implement immutable state derivation and retry policy**

Derive state only from sealed files whose hashes, sizes, modes, queue/job/source bindings, and response hashes re-verify. A missing or invalid attempt is not reusable. An accepted or terminally quarantined job is never re-issued. Attempts 1 and 2 may advance; attempt 3 failure produces terminal quarantine.

```ts
export function selectNextLibraryAnalysisAgentJobs(input: {
  queue: LibraryAnalysisAgentQueue;
  attempts: readonly LibraryAnalysisAgentAttemptReceipt[];
  limit: number;
}): Array<{ jobId: string; attempt: 1 | 2 | 3 }> {
  if (!Number.isSafeInteger(input.limit) || input.limit < 1 || input.limit > 3) {
    throw new Error("agent_queue_dispatch_limit_invalid");
  }
  return derivePendingAttempts(input.queue, input.attempts)
    .sort(compareJobAttemptsUtf8)
    .slice(0, input.limit);
}
```

The terminal receipt must prove pairwise-disjoint exact coverage, terminal analysis and validation for every source, readback of every accepted artifact, final merge hash, private inventory hash, and all six governance flags.

- [ ] **Step 4: Add `status` and `finalize`, test, and commit**

`status` prints only counts, hashes, and typed states. `finalize` refuses a non-terminal queue, seals the full private receipt, creates a sanitized receipt object, and does not write it into Git automatically.

Run: `node --import=tsx --test tests/lib/library-analysis-agent-checkpoint.test.ts tests/lib/library-analysis-agent-cli.test.ts && npx tsc --noEmit && npx eslint src/lib/knowledge/library-analysis-agent-checkpoint.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-{checkpoint,cli}.test.ts && git diff --check`

Expected: PASS; no diagnostics.

```bash
git add src/lib/knowledge/library-analysis-agent-checkpoint.ts scripts/knowledge/manage-library-analysis-agent-queue.ts tests/lib/library-analysis-agent-checkpoint.test.ts tests/lib/library-analysis-agent-cli.test.ts
git commit -m "feat: add resumable agent queue checkpoints"
```

---

### Task 7: Deterministic Semantic Pilot Selection

**Files:**
- Create: `scripts/knowledge/select-library-analysis-agent-pilot.ts`
- Create: `tests/lib/library-analysis-agent-pilot.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: verified full queue metadata only; source text is read only after selection when preparing jobs.
- Produces: `selectLibraryAnalysisAgentPilot(queue)`, a sealed pilot selection/queue, and package command `research:library:agent-pilot`.

- [ ] **Step 1: Write failing stratification and cap tests**

```ts
test("pilot is deterministic stratified and stays inside all caps", () => {
  const first = selectLibraryAnalysisAgentPilot(fullShapeFixture());
  const second = selectLibraryAnalysisAgentPilot(fullShapeFixture());
  assert.deepEqual(second, first);
  assert.ok(first.sourceIds.length >= 10 && first.sourceIds.length <= 12);
  assert.ok(first.unitCount <= 100);
  assert.ok(first.codePoints >= 200_000 && first.codePoints <= 300_000);
  assert.deepEqual(new Set(first.strata), new Set([
    "database_small", "database_medium", "database_segmented",
    "controlled_https_pdf", "repository_csv", "repository_pptx", "derived_record",
  ]));
});
```

- [ ] **Step 2: Run pilot tests and witness RED**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-pilot.test.ts`

Expected: FAIL because the selector does not exist.

- [ ] **Step 3: Implement deterministic selection and sealed pilot queue**

Use route/source-kind metadata and source code-point bands. Select the lexicographically lowest `sourceEnvelopeHash` satisfying each required stratum, then add deterministic fillers until the lower code-point bound is met without crossing source/unit caps. Fail with `agent_pilot_stratum_unavailable` or `agent_pilot_capacity_unsatisfied` instead of weakening the pilot.

Add:

```json
"research:library:agent-pilot": "tsx scripts/knowledge/select-library-analysis-agent-pilot.ts"
```

- [ ] **Step 4: Run tests and commit**

Run: `node --import=tsx --test tests/lib/library-analysis-agent-pilot.test.ts tests/lib/library-analysis-agent-queue.test.ts && npx tsc --noEmit && npx eslint scripts/knowledge/select-library-analysis-agent-pilot.ts tests/lib/library-analysis-agent-pilot.test.ts && git diff --check`

Expected: PASS; no diagnostics.

```bash
git add package.json scripts/knowledge/select-library-analysis-agent-pilot.ts tests/lib/library-analysis-agent-pilot.test.ts
git commit -m "feat: select deterministic analysis agent pilot"
```

---

### Task 8: End-to-End Private Rehearsal and Sanitized Implementation Receipt

**Files:**
- Modify: `tests/lib/library-analysis-agent-cli.test.ts`
- Create: `research/_status/library-analysis-codex-native-orchestration-2026-08-21.md`

**Interfaces:**
- Consumes: all Task 1-7 APIs and commands.
- Produces: a tested fixture rehearsal from queue build through terminal receipt and a tracked implementation receipt containing no private identifiers or content.

- [ ] **Step 1: Add a failing full-workflow fixture test**

```ts
test("private workflow builds dispatches validates resumes and finalizes without DB or network", async (t) => {
  const fixture = endToEndFixture(t);
  const queue = await invoke("build", fixture);
  for (const jobId of queue.jobIds) {
    const attempt = await invoke("prepare-attempt", { ...fixture, jobId, attempt: 1 });
    await fixture.writeValidLunaResponse(attempt);
    await invoke("accept-attempt", { ...fixture, jobId, attempt: 1 });
  }
  for (const sourceId of queue.sourceIds) {
    await invoke("merge-source", { ...fixture, sourceId });
    await fixture.writeValidMainValidationResponse(sourceId);
    await invoke("validate-source", { ...fixture, sourceId });
  }
  const terminal = await invoke("finalize", fixture);
  assert.equal(terminal.automatedOnly, true);
  assert.equal(terminal.externalReady, false);
  assert.equal(terminal.externalApiUsed, false);
  assert.equal(terminal.candidateDatabaseWritten, false);
  assert.equal(terminal.productionDataMutated, false);
  assert.equal(terminal.humanSourceReviewRequired, false);
});
```

- [ ] **Step 2: Run the end-to-end test and witness RED**

Run: `node --import=tsx --test --test-name-pattern='private workflow' tests/lib/library-analysis-agent-cli.test.ts`

Expected: FAIL at the first incomplete workflow boundary.

- [ ] **Step 3: Complete only the missing integration wiring**

Do not add alternate paths or compatibility layers. Make the existing commands exchange their sealed hashes and typed receipts until the fixture passes. Confirm the test does not set `DATABASE_URL`, `CANDIDATE_WORKER_DATABASE_URL`, an API key, or network fixtures.

- [ ] **Step 4: Run the complete targeted gate**

Run:

```bash
node --import=tsx --test \
  tests/lib/library-analysis-agent-queue.test.ts \
  tests/lib/library-analysis-agent-response.test.ts \
  tests/lib/library-analysis-agent-validation.test.ts \
  tests/lib/library-analysis-agent-checkpoint.test.ts \
  tests/lib/library-analysis-agent-cli.test.ts \
  tests/lib/library-analysis-agent-pilot.test.ts \
  tests/lib/library-analysis-automated-validation.test.ts \
  tests/lib/private-library-analysis-artifact-store.test.ts
npx tsc --noEmit
npx eslint \
  src/lib/knowledge/library-analysis-agent-*.ts \
  scripts/knowledge/manage-library-analysis-agent-queue.ts \
  scripts/knowledge/select-library-analysis-agent-pilot.ts \
  tests/lib/library-analysis-agent-*.test.ts
npm run audit:research-artifacts
git diff --check
```

Expected: all targeted tests and checks PASS.

- [ ] **Step 5: Write the sanitized implementation receipt**

Record only: design and implementation commit hashes, schema/policy versions, expected `1,569 / 8,393` coverage, tests run, private queue status, `automatedOnly=true`, `externalReady=false`, all mutation/external flags, known corpus-health baseline failure, and the fact that semantic pilot execution is the next gate. Do not include source keys, locators, private paths, claims, evidence, or model-generated content.

- [ ] **Step 6: Scan for leakage and commit**

Run:

```bash
rg -n "(/Users/|sourceKey|portablePath|evidence|privateArtifact|CANDIDATE_WORKER_DATABASE_URL)" \
  research/_status/library-analysis-codex-native-orchestration-2026-08-21.md
git diff --check
```

Expected: no matches from the leakage scan.

```bash
git add tests/lib/library-analysis-agent-cli.test.ts research/_status/library-analysis-codex-native-orchestration-2026-08-21.md
git commit -m "docs: record Codex-native analysis orchestration gate"
```

---

### Task 9: Semantic Pilot, Audit, and Full-Queue Go/No-Go

**Files:**
- Private artifacts only during execution.
- Modify after execution: `research/_status/library-analysis-codex-native-orchestration-2026-08-21.md` with sanitized pilot totals and gate state.

**Interfaces:**
- Consumes: the sealed full acquisition root, Task 7 pilot queue, three Luna Codex workers, and the main Codex validator.
- Produces: sealed private pilot attempts/results/validations/terminal receipt and a binary full-queue go/no-go decision.

- [ ] **Step 1: Build and independently verify the real full queue**

Run the management CLI against the sealed acquisition resolution/manifest and their expected hashes. Require output totals exactly `1,569` sources and `8,393` units. Audit the entire private root after queue publication.

- [ ] **Step 2: Build the real deterministic pilot queue**

Run `npm run research:library:agent-pilot -- ...` against the sealed full queue. Verify 10-12 sources, no more than 100 units, 200k-300k code points, all required strata, and a stable replay hash.

- [ ] **Step 3: Dispatch at most three disjoint Luna jobs at a time**

For every wave, prepare sealed attempt inputs, assign each input to one Luna worker, require `library-analysis-agent-segment-response/v1`, accept or quarantine each attempt through the CLI, and run private audit before dispatching the next wave. Never paste one worker's source material into another worker's context.

- [ ] **Step 4: Merge sources and run main-agent validation**

For every pilot source, merge only accepted terminal segments, prepare the full-payload validation request, have the main agent re-read the verified source units, submit the semantic validation response, then let deterministic code derive separation and F1-F5 disposition.

- [ ] **Step 5: Exercise resume before finalization**

Restart status derivation from sealed artifacts without in-memory state. Confirm accepted attempts are reused, incomplete attempts are preserved, no artifact is overwritten, and only the next legal attempt/job is selected.

- [ ] **Step 6: Finalize and apply the pilot stop rule**

The stop rule separates two things the original gate conflated: pipeline integrity, which repository code can repair, and model output quality, which it cannot. Revised 2026-08-23 after ten consecutive NO-GO rounds; see `research/_status/library-analysis-codex-native-orchestration-2026-08-21.md` for the evidence.

**Integrity gate (blocking).** The pilot is NO-GO if any of exact coverage, hash readback, disjoint assignments, deterministic replay, separate passes, resume, leakage scan, private audit, or identity/hash drift fails. These are contract properties, they are repairable in code, and a failure here stops the full queue exactly as before.

**Quality gate (measured, not zero-defect).** Derive the critical error rate `F1+F2` over adjudicated claims and apply the stop rules in `research/_plans/kalibreringsplan-utvalg-2026-08-20.md` §5:

- `> 5 %`: NO-GO. Freeze the class, find the root cause, re-run after repair.
- `2-5 %`: GO with reservation. Publish the rate, prioritise repair, do not freeze the queue.
- `<= 2 %`: GO. Mark the class calibrated with its measured rate.

`F3-F5` are quality errors, not hallucinations. They set per-source disposition — `partial` or `quarantined` — exactly as before, and a quarantined source never becomes citable. They do not block the queue, and they are reported as the quality rate beside the critical rate. Publish every rate, including a poor one: a measured weak rate is trust metadata, a hidden rate is not.

**Anti-loop rule.** A repair round is triggered only by an integrity failure or by an `F1`/`F2` root cause. Tightening the validator so it detects more `F3-F5` is a prompt-quality change, not a pilot repair: it raises detection sensitivity against a roughly constant model error rate, so it moves the pilot away from GO rather than toward it. Such changes belong to re-calibration under §7 of the calibration plan, not to this gate.

**Statistical honesty.** One pilot adjudicates far fewer claims than the per-stratum `n` the calibration plan requires, so its critical rate is indicative, not calibrated, and its confidence interval is wide. The pilot exists to prove the pipeline; the completed full run is what produces the population from which the stratified calibration sample is drawn.

- [ ] **Step 7: Run the full queue only after pilot GO**

Process small waves with maximum three Luna jobs, main-agent validation, and private audit between waves. Continue until the terminal receipt proves all `1,569 / 8,393`, or stop at the first systemic failure. Individual source quarantines are terminal recorded outcomes; infrastructure/contract drift stops the whole queue.

- [ ] **Step 8: Run final verification and commit only the sanitized receipt update**

Run the Task 8 targeted gate, `npm run audit:research-artifacts`, `git diff --check`, and the existing full `npm test`. Report the known corpus-health baseline independently if it remains the sole unrelated failure. Inspect `git status --short` and stage only the sanitized receipt.

```bash
git add research/_status/library-analysis-codex-native-orchestration-2026-08-21.md
git commit -m "docs: record automated library analysis execution"
```

Do not push, open a PR, merge, deploy, write the candidate database, or claim external readiness.
