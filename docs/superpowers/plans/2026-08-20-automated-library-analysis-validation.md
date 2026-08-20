# Automated Library Analysis Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Process every row in a sealed library-analysis population through separate AI analysis and validation runs, publish honest automated-only trust metadata, and make low-risk results reusable for internal AI context without creating human or external authority.

**Architecture:** Use the attested candidate subsystem as the only machine-write surface. A trusted intake creates hashbound content units, an analysis workflow creates candidate assertions, a separate validator workflow records F1–F5 findings, deterministic policy derives the terminal disposition, and read-only status projections expose automated completion independently from human review and external readiness.

**Tech Stack:** TypeScript, Zod, Node.js 24, Prisma 7, PostgreSQL 16, Next.js, Node test runner

**Spec:** `docs/superpowers/specs/2026-08-20-automated-library-analysis-validation-design.md`

## Global Constraints

- Complete `docs/superpowers/plans/2026-08-20-candidate-semantic-attestation-integration.md` first.
- `automatedOnly` is exactly `true` for this workflow.
- `externalReady` remains `false` without separately valid human and promotion receipts.
- AI never writes `HumanReviewDecision`, `PromotionDecision`, canonical claims, publication or coverage.
- Every population row receives exactly one terminal disposition.
- A URL/path without available, readable, hashbound bytes is `blocked_input`.
- F1/F2 and claim-bearing F3 findings always prevent `reusable_for_ai_context`.
- Automated finding rates are not reported as actual model error rate or accuracy.
- No raw private fulltext is committed to Git or copied into the web runner.
- All database mutations require dry-run evidence, backup/recovery evidence where applicable, and explicit execution authorization.

---

### Task 1: Register distinct analysis and validator workflow bundles

**Files:**
- Create: `knowledge/corpus/workflows/library-analysis-automated-v1.md`
- Create: `knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md`
- Create: `knowledge/corpus/workflows/library-validation-automated-v1.md`
- Create: `knowledge/corpus/workflows/library-validation-automated-prompt-v1.md`
- Modify: `src/lib/knowledge/candidate-analysis-contract.ts`
- Modify: `src/lib/knowledge/candidate-analysis-writer.ts`
- Modify: `tests/lib/candidate-analysis-contract.test.ts`
- Modify: `tests/lib/candidate-analysis-writer.test.ts`

**Interfaces:**
- Produces: `CANDIDATE_WORKFLOW_PROFILES`, `candidateWorkflowProfile(outputProfile)`, profile-aware `verifyCandidateWorkflowPromptBundle(...)`
- Output profiles: `candidate_only`, `library_analysis_v1`, `library_validation_v1`

- [ ] **Step 1: Write failing profile-binding tests**

```ts
test('binds analysis and validation to different workflow and prompt bytes', () => {
  const analysis = candidateWorkflowProfile('library_analysis_v1')
  const validation = candidateWorkflowProfile('library_validation_v1')
  assert.notEqual(analysis.workflow.path, validation.workflow.path)
  assert.notEqual(analysis.prompt.path, validation.prompt.path)
})

test('rejects an analysis prompt on a validation output profile', () => {
  const run = libraryValidationRunFixture({
    promptPath: candidateWorkflowProfile('library_analysis_v1').prompt.path,
  })
  assert.throws(() => CandidateAnalysisRunInputSchema.parse(run), /binding_mismatch/)
})
```

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
```

Expected: FAIL because the contract currently hardcodes one workflow/prompt pair.

- [ ] **Step 3: Implement the strict profile registry**

```ts
export const CANDIDATE_WORKFLOW_PROFILES = {
  candidate_only: {
    workflow: CANDIDATE_WORKFLOW_BINDING,
    prompt: CANDIDATE_PROMPT_BINDING,
  },
  library_analysis_v1: {
    workflow: {
      id: 'workflow.library_analysis.automated.v1',
      version: '1.0.0',
      path: 'knowledge/corpus/workflows/library-analysis-automated-v1.md',
    },
    prompt: {
      id: 'prompt.library_analysis.automated.v1',
      version: '1.0.0',
      path: 'knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md',
    },
  },
  library_validation_v1: {
    workflow: {
      id: 'workflow.library_validation.automated.v1',
      version: '1.0.0',
      path: 'knowledge/corpus/workflows/library-validation-automated-v1.md',
    },
    prompt: {
      id: 'prompt.library_validation.automated.v1',
      version: '1.0.0',
      path: 'knowledge/corpus/workflows/library-validation-automated-prompt-v1.md',
    },
  },
} as const
```

Validate the selected exact pair from `outputProfile`; read each selected file exactly once and use the same bytes for metadata validation and hashing.

- [ ] **Step 4: Write the mutually bound workflow files**

Each workflow and prompt must declare exactly one ID, version, repository path and exact counterpart ID/version/path. Analysis requires atomic claims and complete evidence. Validation requires claim decomposition, support/contradiction, numeric checks and omission/risk passes. Neither bundle may include authority fields.

- [ ] **Step 5: Run GREEN**

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
```

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- knowledge/corpus/workflows/library-analysis-automated-v1.md knowledge/corpus/workflows/library-analysis-automated-prompt-v1.md knowledge/corpus/workflows/library-validation-automated-v1.md knowledge/corpus/workflows/library-validation-automated-prompt-v1.md src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
git commit -m "feat: bind automated library analysis workflows"
```

---

### Task 2: Build a deterministic population snapshot

**Files:**
- Create: `src/lib/knowledge/library-analysis-population.ts`
- Create: `scripts/knowledge/export-library-analysis-population.ts`
- Create: `tests/lib/library-analysis-population.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: current `LibraryAnalysisRecord` inventory plus authoritative readable `Document` content metadata
- Produces: `buildLibraryAnalysisPopulation(rows)`, `libraryAnalysisPopulationHash(snapshot)`, schema `library-analysis-population/v1`

- [ ] **Step 1: Write failing determinism and completeness tests**

```ts
test('population hash is independent of query order', () => {
  const first = buildLibraryAnalysisPopulation([rowB, rowA])
  const second = buildLibraryAnalysisPopulation([rowA, rowB])
  assert.equal(first.populationHash, second.populationHash)
  assert.deepEqual(first.rows.map(row => row.sourceKey), ['document:a', 'document:b'])
})

test('a locator without readable bytes is blocked input', () => {
  const snapshot = buildLibraryAnalysisPopulation([{ ...rowA, readableInput: null }])
  assert.equal(snapshot.rows[0]?.eligibility, 'blocked_input')
})
```

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/library-analysis-population.test.ts
```

- [ ] **Step 3: Implement the schema and hash**

```ts
export type LibraryAnalysisPopulationRow = {
  sourceKind: string
  sourceKey: string
  sourceVersionHash: string | null
  inputKind: 'database_record' | 'artifact' | 'repository_file' | 'none'
  locator: string | null
  contentHash: string | null
  identityConfidence: 'exact' | 'provisional' | 'unresolved'
  eligibility: 'eligible' | 'blocked_input' | 'superseded'
  blockers: string[]
}
```

Sort by `sourceKind`, then `sourceKey`; reject duplicates; hash canonical JSON over every row. Do not serialize source text into the snapshot.

- [ ] **Step 4: Add the read-only CLI**

```text
population_snapshot="$(mktemp -t library-analysis-population.XXXXXX.json)"
npm run knowledge:library-analysis:population -- --output "$population_snapshot"
```

The CLI requires `DATABASE_URL`, uses a repeatable-read transaction, writes atomically at mode 0600, rejects tracked or symlink output targets and logs counts/hashes only.

- [ ] **Step 5: Run GREEN**

```bash
node --import=tsx --test tests/lib/library-analysis-population.test.ts tests/lib/package-scripts.test.ts
```

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/library-analysis-population.ts scripts/knowledge/export-library-analysis-population.ts tests/lib/library-analysis-population.test.ts package.json
git commit -m "feat: seal library analysis population snapshots"
```

---

### Task 3: Add least-privilege content-unit intake

**Files:**
- Modify: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Modify: `src/lib/knowledge/candidate-analysis-writer.ts`
- Create: `scripts/knowledge/ingest-library-analysis-content-units.ts`
- Modify: `scripts/bootstrap-candidate-analysis-roles.sh`
- Modify: `scripts/enable-candidate-analysis-logins.sh`
- Modify: `scripts/verify-candidate-analysis-roles.sh`
- Modify: `scripts/candidate-security-graph.v1.json`
- Modify: `tests/lib/candidate-analysis-writer.test.ts`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Produces: `candidate_content_unit_append(jsonb)`, `createCandidateContentUnitIntakeWriter(prisma)`
- Credential: `CANDIDATE_INTAKE_DATABASE_URL`; exact role `foodsystems_candidate_intake`

- [ ] **Step 1: Write failing privilege and idempotency tests**

Prove intake can append a valid content-unit identity, replay of identical identity returns the same row, hash/locator drift conflicts, and intake cannot create runs, assertions, review, promotion or canonical rows. Worker and reconciler must not execute the intake function.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts
```

- [ ] **Step 3: Implement the narrow SQL and TypeScript boundary**

Accept exactly the fields in `CandidateContentUnitInputSchema`; recompute locator hash; require lowercase SHA-256; insert append-only with conflict only when every immutable value is byte-identical. Expose no generic raw SQL or table `INSERT` grant.

- [ ] **Step 4: Extend semantic attestation**

Add the intake function, owner, ACL and role isolation to Candidate Security Graph v1. Regenerate the reviewed graph hash only after mutation tests prove body/owner/ACL drift is caught. Bootstrap leaves intake `NOLOGIN`; enable requires existing credentials and verifies it before workers start.

- [ ] **Step 5: Implement the intake CLI**

Read a sealed population snapshot plus source bytes through read-only source access, recompute content hash, append content-unit identities and emit only IDs/hashes/counts. Never log or persist raw source text.

- [ ] **Step 6: Run GREEN**

```bash
npm run knowledge:candidate-contracts:check
node --import=tsx --test tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts
```

- [ ] **Step 7: Commit after explicit authorization**

```bash
git add -- prisma/migrations/20260818_candidate_analysis_foundation/migration.sql src/lib/knowledge/candidate-analysis-writer.ts scripts/knowledge/ingest-library-analysis-content-units.ts scripts/bootstrap-candidate-analysis-roles.sh scripts/enable-candidate-analysis-logins.sh scripts/verify-candidate-analysis-roles.sh scripts/candidate-security-graph.v1.json tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "feat: add attested candidate content intake"
```

---

### Task 4: Define F1–F5 validation and disposition contracts

**Files:**
- Create: `src/lib/knowledge/library-analysis-automated-validation.ts`
- Create: `tests/lib/library-analysis-automated-validation.test.ts`

**Interfaces:**
- Produces: `AutomatedValidationFindingSchema`, `AutomatedLibraryAnalysisResultSchema`, `deriveAutomatedDisposition(input)`
- Dispositions: `candidate_complete | partial | blocked_input | quarantined | failed | superseded`

- [ ] **Step 1: Write failing contract tests**

```ts
test('F1 and F2 always quarantine the candidate', () => {
  for (const errorClass of ['F1', 'F2'] as const) {
    assert.equal(deriveAutomatedDisposition(validated({ errorClass })).disposition, 'quarantined')
  }
})

test('a claim-bearing F3 cannot be reusable AI context', () => {
  const result = deriveAutomatedDisposition(validated({ errorClass: 'F3', affectsClaim: true }))
  assert.equal(result.disposition, 'quarantined')
  assert.equal(result.machineUse, 'quarantined')
})

test('complete automated validation does not create human or external authority', () => {
  const result = deriveAutomatedDisposition(validated())
  assert.equal(result.machineUse, 'reusable_for_ai_context')
  assert.equal(Object.hasOwn(result, 'reviewStatus'), false)
  assert.equal(Object.hasOwn(result, 'externalReady'), false)
})
```

Also test material F5, high-risk actor/rights/person/health/causal flags, insufficient locator, stale hash, blocked input, superseded input and validator separation level.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/library-analysis-automated-validation.test.ts
```

- [ ] **Step 3: Implement strict schemas**

```ts
export type AutomatedValidationFinding = {
  findingId: string
  assertionId: string
  errorClass: 'F1' | 'F2' | 'F3' | 'F4' | 'F5'
  severity: 'critical' | 'material' | 'advisory'
  affectsClaim: boolean
  contentUnitIds: string[]
  explanation: string
  deterministicRuleIds: string[]
}
```

Reject unknown fields. Require at least one content-unit reference for F1/F2/F3/F5 and at least one rule ID for any deterministic finding.

- [ ] **Step 4: Implement the policy table**

```text
F1 or F2                         -> quarantined / quarantined
F3 affecting claim              -> quarantined / quarantined
F3 not affecting claim          -> partial / candidate_only
F4 more-permissive classification -> quarantined or partial / never reusable
material F5                     -> partial; quarantine when claim/high-risk
blocked bytes                   -> blocked_input / candidate_only
no findings + complete + low-risk + locator gate -> candidate_complete / reusable_for_ai_context
```

- [ ] **Step 5: Run GREEN**

```bash
node --import=tsx --test tests/lib/library-analysis-automated-validation.test.ts
```

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/library-analysis-automated-validation.ts tests/lib/library-analysis-automated-validation.test.ts
git commit -m "feat: define automated library validation policy"
```

---

### Task 5: Implement deterministic evidence and numeric gates

**Files:**
- Create: `src/lib/knowledge/library-analysis-evidence-gates.ts`
- Create: `tests/lib/library-analysis-evidence-gates.test.ts`
- Create: `tests/fixtures/library-analysis-evidence-gates.ts`

**Interfaces:**
- Produces: `decomposeClaimFacts(claim)`, `checkEvidenceBinding(input)`, `checkQuantitativeFacts(input)`, `runDeterministicLibraryGates(input)`

- [ ] **Step 1: Write the known pilot regression first**

```ts
test('a partial quote cannot ground an additional percentage fact', () => {
  const result = runDeterministicLibraryGates({
    claim: '3.1 million litres were used and represented 28 percent of subsidised milk.',
    evidence: '3.1 million litres',
    sourceText: '3.1 million litres ... represented 28 percent of subsidised milk.',
    locator: 'document:pilot:section:school-milk',
  })
  assert.ok(result.findings.some(finding => finding.errorClass === 'F3'))
})
```

Add tests for wrong source path, excerpt absent from source, stale excerpt hash, percentage-point versus percent, currency/unit mismatch, sign, year, period and geography.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/library-analysis-evidence-gates.test.ts
```

- [ ] **Step 3: Implement exact binding gates**

Normalize whitespace only for search; preserve and hash original excerpt bytes. Require evidence content unit to be in the run input envelope. A `sourcePath` is descriptive metadata, never sufficient binding by itself.

- [ ] **Step 4: Implement quantitative fact extraction**

Use deterministic tokenization for numbers, percentages, currencies, ISO-like years and explicit units. Compare every quantitative fact in the atomic claim with the evidence excerpt. If any fact is absent or differs, emit F3. Do not infer conversions or synonyms that change numeric meaning.

- [ ] **Step 5: Run GREEN**

```bash
node --import=tsx --test tests/lib/library-analysis-evidence-gates.test.ts
```

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/library-analysis-evidence-gates.ts tests/lib/library-analysis-evidence-gates.test.ts tests/fixtures/library-analysis-evidence-gates.ts
git commit -m "feat: enforce library evidence and numeric gates"
```

---

### Task 6: Build sealed analysis and validation batch adapters

**Files:**
- Create: `src/lib/knowledge/library-analysis-automated-runner.ts`
- Create: `scripts/knowledge/run-library-analysis-automated.ts`
- Create: `tests/lib/library-analysis-automated-runner.test.ts`
- Modify: `package.json`

**Interfaces:**
- Commands: `--emit-analysis`, `--ingest-analysis`, `--emit-validation`, `--ingest-validation`, `--status`
- Produces: candidate runs, artifacts, assertions, evidence links, dependencies and terminal events through `CandidateAnalysisWriter`

- [ ] **Step 1: Write failing CLI and sealed-file tests**

Test exactly one mode, required input/output paths, untracked mode-0600 output, symlink rejection, source text omitted from logs, population-hash binding, complete source coverage and all-or-nothing ingest per response file.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/library-analysis-automated-runner.test.ts
```

- [ ] **Step 3: Implement analysis request emission**

Emit one request per eligible row with:

```ts
type LibraryAnalysisRequestV1 = {
  schema: 'library-analysis-request/v1'
  populationSnapshotId: string
  populationHash: string
  sourceKind: string
  sourceKey: string
  sourceVersionHash: string
  contentUnits: Array<{ id: string; locator: string; contentHash: string; text: string }>
  workflow: { id: string; version: string; hash: string }
  prompt: { id: string; version: string; hash: string }
}
```

Output files are private, untracked working artifacts because they contain source text.

- [ ] **Step 4: Implement analysis ingest**

Strictly parse model ID/version and atomic candidate claims. Run deterministic gates before writing. Create a `library_analysis_v1` run and append only valid candidate artifacts/assertions/evidence. Rejected submissions write no partial run output.

- [ ] **Step 5: Implement validation emission and ingest**

Validation input contains the same source content units plus exact analysis run ID, output-manifest hash and assertion payload hashes. Ingest requires a distinct `library_validation_v1` run, records dependencies to every assessed assertion, appends F1–F5 findings and derives the terminal disposition. The validator never receives or writes authority fields.

- [ ] **Step 6: Add package scripts**

```json
{
  "knowledge:library-analysis:automated": "tsx scripts/knowledge/run-library-analysis-automated.ts",
  "knowledge:library-analysis:population": "tsx scripts/knowledge/export-library-analysis-population.ts"
}
```

- [ ] **Step 7: Run GREEN**

```bash
node --import=tsx --test tests/lib/library-analysis-automated-runner.test.ts tests/lib/library-analysis-evidence-gates.test.ts tests/lib/library-analysis-automated-validation.test.ts tests/lib/package-scripts.test.ts
```

- [ ] **Step 8: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/library-analysis-automated-runner.ts scripts/knowledge/run-library-analysis-automated.ts tests/lib/library-analysis-automated-runner.test.ts package.json
git commit -m "feat: add sealed automated library analysis runner"
```

---

### Task 7: Add automated-only control snapshot, API and UI

**Files:**
- Modify: `src/lib/knowledge/candidate-control-snapshot.ts`
- Modify: `knowledge/schema/candidate-control-snapshot.schema.v1.json`
- Create: `src/lib/knowledge/library-analysis-automated-status.ts`
- Modify: `src/lib/queries/library-analysis.ts`
- Modify: `src/app/api/library-analysis/status/route.ts`
- Modify: `src/app/ai-kunnskap/page.tsx`
- Modify: `src/app/ai-kunnskap/AiKunnskapContent.tsx`
- Create: `knowledge/calibration/library-analysis-calibration.v2.json`
- Modify: `tests/lib/candidate-control-snapshot.test.ts`
- Modify: `tests/lib/library-analysis-status.test.ts`
- Create: `tests/lib/library-analysis-automated-status.test.ts`

**Interfaces:**
- Produces: `buildAutomatedLibraryAnalysisStatus(input)` and the API fields specified by the design

- [ ] **Step 1: Write failing status-separation tests**

```ts
test('automated completion stays separate from human and external readiness', () => {
  const status = buildAutomatedLibraryAnalysisStatus(completeAutomatedFixture())
  assert.equal(status.automatedOnly, true)
  assert.equal(status.automatedValidationState, 'complete')
  assert.equal(status.disposedTotal, status.populationTotal)
  assert.equal(status.humanReviewed, 0)
  assert.equal(status.reviewComplete, false)
  assert.equal(status.externalReady, false)
})

test('a query error degrades all machine reuse', () => {
  const status = buildAutomatedLibraryAnalysisStatus(queryErrorFixture())
  assert.equal(status.automatedValidationState, 'degraded')
  assert.equal(status.reusableForAiContext, 0)
})
```

Also prove disposition totals equal population total, detected F1–F5 rates use `automatedFindingRate`, and no field claims model accuracy.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-control-snapshot.test.ts tests/lib/library-analysis-status.test.ts tests/lib/library-analysis-automated-status.test.ts
```

- [ ] **Step 3: Implement status derivation**

Expose exactly:

```ts
type AutomatedLibraryAnalysisStatus = {
  automatedOnly: true
  automatedValidationState: 'not_started' | 'running' | 'complete' | 'degraded'
  populationSnapshotId: string | null
  populationHash: string | null
  populationTotal: number
  disposedTotal: number
  candidateComplete: number
  partial: number
  blockedInput: number
  quarantined: number
  failed: number
  reusableForAiContext: number
  automatedFindingsByClass: Record<'F1' | 'F2' | 'F3' | 'F4' | 'F5', number>
  automatedFindingRateByDataClass: Record<string, number>
  analysisValidatorDisagreementRate: number | null
  validatorSeparationLevel: 'same_model_distinct_prompt' | 'different_model_same_provider' | 'different_provider' | null
}
```

Merge it into the existing status payload without changing the meaning of `operational`, `reviewComplete`, `humanReviewed` or `externalReady`.

- [ ] **Step 4: Upgrade governed calibration data**

`library-analysis-calibration.v2.json` must use `mode: "automated_only"`, separate `automatedRounds` and `humanReferenceRounds`, and name rates `automatedFindingRate`, `automatedRejectionRate` and `analysisValidatorDisagreementRate`. Replace the v1 import only after tests assert the v2 schema.

- [ ] **Step 5: Update internal UI copy**

Use «automatisk validert kandidat», «gjenbrukbar intern KI-kontekst», «karantenesatt» and «mangler lesbart input». Do not use «godkjent», «reviewet», «uavhengig verifisert» or «modellnøyaktighet» for automated-only results.

- [ ] **Step 6: Run GREEN**

```bash
node --import=tsx --test tests/lib/candidate-control-snapshot.test.ts tests/lib/library-analysis-status.test.ts tests/lib/library-analysis-automated-status.test.ts
```

- [ ] **Step 7: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/candidate-control-snapshot.ts knowledge/schema/candidate-control-snapshot.schema.v1.json src/lib/knowledge/library-analysis-automated-status.ts src/lib/queries/library-analysis.ts src/app/api/library-analysis/status/route.ts src/app/ai-kunnskap/page.tsx src/app/ai-kunnskap/AiKunnskapContent.tsx knowledge/calibration/library-analysis-calibration.v2.json tests/lib/candidate-control-snapshot.test.ts tests/lib/library-analysis-status.test.ts tests/lib/library-analysis-automated-status.test.ts
git commit -m "feat: expose automated library validation status"
```

---

### Task 8: Run and lock the three-source pilot

**Files:**
- Create: `tests/fixtures/library-analysis-pilot-ig006-input.v1.json`
- Create: `research/_status/library-analysis-pilot-automated-2026-08-20.json`
- Create: `research/_status/library-analysis-pilot-automated-2026-08-20.md`
- Create: `tests/lib/library-analysis-pilot-regression.test.ts`

**Interfaces:**
- Consumes: the three source keys and fulltext used by the original IG-006 pilot
- Produces: sealed analysis/validation run IDs, findings and terminal dispositions; no database authority beyond candidates

- [ ] **Step 1: Add failing regression fixtures**

Preserve the two known insufficient evidence cases as negative fixtures:

```text
claim includes both 3.1 million litres and 28 percent
evidence contains only 3.1 million litres

claim explains the estimate basis
evidence contains only retail groups.
```

Assert neither can become `reusable_for_ai_context`.

- [ ] **Step 2: Run RED, then GREEN with the completed gates**

```bash
node --import=tsx --test tests/lib/library-analysis-pilot-regression.test.ts
```

Expected RED before Tasks 4–6; expected GREEN after those tasks.

- [ ] **Step 3: Export a three-row population snapshot in dry-run environment**

```bash
pilot_population="$(mktemp -t library-analysis-pilot-population.XXXXXX.json)"
npm run knowledge:library-analysis:population -- --source-key document:cmp11sfln0009zq0d3lmqruhq --source-key document:cmp11sflk0008zq0dfczax8mp --source-key document:cmp11sfn7000mzq0dx4h670du --output "$pilot_population"
```

Expected: three rows, one population hash, no raw text in logs.

- [ ] **Step 4: Execute analysis and validation as separate AI passes**

Emit analysis requests, have the analysis model return atomic cards, ingest them dry-run, emit validator requests, have the validator use a distinct prompt/run, then ingest validation dry-run. Record actual model/provider/version and separation level.

- [ ] **Step 5: Apply candidate-only pilot after explicit database authorization**

Before apply, prove target DB identity, backup/recovery evidence, candidate role attestation and zero review/promotion writes. Apply content units, analysis runs and validator runs only through their narrow functions.

- [ ] **Step 6: Generate the pilot receipt**

The JSON/Markdown receipt includes population hash, source/run/assertion IDs, workflow/prompt/model hashes, F1–F5 findings, deterministic blockers, terminal disposition and explicit `automatedOnly=true`, `externalReady=false`.

- [ ] **Step 7: Verify and commit receipts after explicit authorization**

```bash
node --import=tsx --test tests/lib/library-analysis-pilot-regression.test.ts
git diff --check -- research/_status/library-analysis-pilot-automated-2026-08-20.json research/_status/library-analysis-pilot-automated-2026-08-20.md
```

Commit only metadata/receipts; do not commit private fulltext request files.

---

### Task 9: Run representative and full-corpus batches

**Files:**
- Create per run: untracked private request/response artifacts
- Update: `knowledge/calibration/library-analysis-calibration.v2.json`
- Create: `research/_status/library-analysis-automated-full-corpus-2026-08-20.json`
- Create: `research/_status/library-analysis-automated-full-corpus-2026-08-20.md`

**Interfaces:**
- Produces: complete terminal disposition ledger and governed automated trust metadata for one exact population hash

- [ ] **Step 1: Seal a representative batch**

Select deterministic strata by source kind, input kind, identity confidence, legacy status/usage and high-risk flags. Store seed and selection hash. Every selected row must reach a terminal disposition.

- [ ] **Step 2: Stop on unsafe pilot behavior**

Abort expansion if any F1/F2/F3 passes as reusable, any row lacks terminal disposition, the status snapshot degrades, or candidate roles can touch review/promotion/canonical tables.

- [ ] **Step 3: Seal the full population**

Use the current database count, not 1 770 as a constant. Record `populationTotal`, snapshot ID/hash, readable/blocked counts and source-version hashes.

- [ ] **Step 4: Run bounded batches**

Use deterministic batch IDs and idempotency keys. Retry transient failures with a new run ID/predecessor; quarantine repeated deterministic failures. Do not move to the next batch until its disposition count equals its row count.

- [ ] **Step 5: Reconcile every row**

Assert:

```ts
disposedTotal === populationTotal
candidateComplete + partial + blockedInput + quarantined + failed + superseded === populationTotal
```

Any mismatch keeps `automatedValidationState` non-complete.

- [ ] **Step 6: Publish honest automated metadata**

Write finding, rejection and analysis–validator disagreement rates per data class. Do not label them accuracy or actual model error rate. Preserve every blocked-input row and external stopline.

- [ ] **Step 7: Commit only governed metadata after explicit authorization**

Run `npm run audit:research-artifacts -- --base=origin/main` before staging. Never stage fulltext or private batch artifacts.

---

### Task 10: Verify, release and prove runtime status

**Files:**
- Modify only if evidence requires: `docs/project/status/food-systems-completion-register-2026-07-15.md`
- Modify only after actual run: `research/_status/information-gap-register-2026-08-11.jsonl`

**Interfaces:**
- Produces: separate proof for local, CI, merge, migration, deployment, candidate roles, batch runtime, API/UI and external authority

- [ ] **Step 1: Run focused and full local gates**

```bash
npm run knowledge:candidate-contracts:check
npm run knowledge:processing-contracts:check
node --import=tsx --test tests/lib/library-analysis-population.test.ts tests/lib/library-analysis-automated-validation.test.ts tests/lib/library-analysis-evidence-gates.test.ts tests/lib/library-analysis-automated-runner.test.ts tests/lib/library-analysis-automated-status.test.ts tests/lib/library-analysis-pilot-regression.test.ts
npx prisma generate
npx prisma validate
npm run lint
npx tsc --noEmit
npm run build
npm run audit:research-artifacts -- --base=origin/main
git diff --check
npm test
```

Expected: 0 failures before any completion claim.

- [ ] **Step 2: Review branch scope**

```bash
git status --short --branch
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --check
```

Expected: no private fulltext, credentials or unrelated generated churn.

- [ ] **Step 3: Publish only with separate authorization**

Push, PR creation, merge, production backup/migration, candidate-role activation and deploy each require their own authorization and evidence. Do not collapse them into one «released» statement.

- [ ] **Step 4: Prove production identity and candidate permissions**

Verify merge SHA equals runtime `/api/version`; migration ledger includes the candidate migration; intake/worker/reconciler roles pass exact target-bound verification; app/migration credentials are not used by the analysis worker.

- [ ] **Step 5: Prove API and authenticated UI readback**

Confirm the same population snapshot ID/hash and counts in the generated control snapshot, `/api/library-analysis/status` and authenticated `/ai-kunnskap` UI.

- [ ] **Step 6: Update canonical status only from actual evidence**

Close IG-006 only for the named automated-only internal profile when full-corpus disposition and runtime readback are proven. Preserve `humanReviewed` from actual receipts only, `reviewComplete=false` for the human scope and `externalReady=false` without a separately authorized promotion chain.
