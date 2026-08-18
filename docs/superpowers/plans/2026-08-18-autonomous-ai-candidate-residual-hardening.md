# Autonomous AI Candidate Residual Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the six load-bearing residual findings in the unreleased candidate-analysis foundation without increasing machine authority or touching production state.

**Architecture:** Replace open machine-output JSON with one allowlisted, typed candidate-entry grammar enforced by both Zod and PostgreSQL. Bind workflow and prompt bytes as one mutually referenced bundle, make run-event supersession carry a relationally bound run scope, and harden the role lifecycle with complete preflight ownership, future-safe ambient-libpq rejection, and an explicit fail-safe login recovery command.

**Tech Stack:** TypeScript, Zod, Prisma, PostgreSQL 16, POSIX shell, Node.js 24, `node:test`.

**Spec:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`

**Residual review:** `.superpowers/sdd/2026-08-18-autonomous-ai-candidate-foundation/final-fix-rereview.md`

## Global Constraints

- Stable readable bytes may be analyzed autonomously; human review, rights, publication, coverage and target promotion remain later, separate authority processes.
- The candidate worker and reconciler may append only candidate-layer records. They must have no effective write path to human-review, promotion, canonical claim/entity/coverage/publication, or unrelated tables.
- Machine confidence, repetition, reconciliation, hashes and schema validity must never create human authority or external readiness.
- Candidate, human-review, promotion, publication and coverage states remain separate. `operational`, `reviewComplete` and `externalReady` remain independent fail-closed gates.
- No production credential creation or rotation, production database mutation, autonomous production run, live snapshot, push, merge, deploy, promotion or human decision is authorized by this plan.
- Do not edit `knowledge/health/*`, corpus-health expectations, runtime-attestation manifests, or protected release evidence to hide the known full-suite baseline failures.
- Use the existing linked worktree and Node 24. Run every behavior change through a witnessed RED, minimal GREEN and focused regression before commit.
- The candidate foundation is unreleased. Amend the existing `20260818_candidate_analysis_foundation` migration in place; do not add a compensating production migration.

---

## File Map

- `src/lib/knowledge/candidate-analysis-contract.ts` — typed machine-output grammar, run/workflow binding types and domain-separated hashes.
- `src/lib/knowledge/candidate-analysis-writer.ts` — single-read workflow/prompt bundle verification and runtime supersession enforcement.
- `knowledge/corpus/workflows/candidate-analysis-v1.md` — exact prompt ID/version/path cross-reference.
- `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md` — exact workflow ID/version/path cross-reference.
- `tests/fixtures/candidate-analysis-fixture.ts` — canonical positive fixture for the strict payload and run-scope contracts.
- `tests/lib/candidate-analysis-contract.test.ts` — Zod/hash/state RED/GREEN coverage.
- `tests/lib/candidate-analysis-writer.test.ts` — actual file-bundle, writer, concurrency and supersession RED/GREEN coverage.
- `prisma/schema.prisma` — run/event relational scope identity.
- `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` — SQL constraints, composite foreign keys and machine-payload insert guard.
- `tests/lib/candidate-analysis-schema.test.ts` — disposable PostgreSQL and Prisma/schema parity coverage.
- `scripts/reject-ambient-candidate-libpq-env.mjs` — one future-safe ambient `PG*` environment guard.
- `scripts/bootstrap-candidate-analysis-roles.sh` — complete preflight owner universe and exact grant bootstrap.
- `scripts/verify-candidate-analysis-roles.sh` — exact effective privilege verification.
- `scripts/disable-candidate-analysis-writes.sh` — fail-safe NOLOGIN/revoke/termination operation.
- `scripts/enable-candidate-analysis-logins.sh` — explicit credential-owner recovery using existing dedicated URLs only.
- `tests/lib/candidate-analysis-role-contract.test.ts` — static and disposable-PostgreSQL role lifecycle coverage.
- `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` — durable human contract for the hardened boundaries.
- `package.json` — explicit recovery command and focused acceptance command wiring.

---

### Task 1: Make candidate payload authority structurally unrepresentable and bind workflow/prompt atomically

**Files:**
- Modify: `src/lib/knowledge/candidate-analysis-contract.ts`
- Modify: `src/lib/knowledge/candidate-analysis-writer.ts`
- Modify: `knowledge/corpus/workflows/candidate-analysis-v1.md`
- Modify: `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md`
- Modify: `tests/fixtures/candidate-analysis-fixture.ts`
- Modify: `tests/lib/candidate-analysis-contract.test.ts`
- Modify: `tests/lib/candidate-analysis-writer.test.ts`

**Interfaces:**
- Produces `CANDIDATE_PAYLOAD_ENTRY_ROLES`, `CandidatePayloadEntrySchema`, `CandidatePayloadDataSchema` and the four existing surface schemas with no open object keys below `data`.
- Keeps `CandidateJsonValue` only for non-authority run configuration, canonical hashing and legacy receipt/hash inputs; it is no longer the machine-output payload schema.
- Produces `verifyCandidateWorkflowPromptBundle(repositoryRoot, declared, readFile?)`, which reads each file once as bytes, hashes those same bytes, validates both own markers and both cross-references, and returns no mutable text/file handle.
- Task 2 consumes the exact payload envelope `{ namespace, kind, data: { entries } }` and its role/value-type enums in the SQL insert guard.

- [ ] **Step 1: Add failing structural payload tests**

In `tests/lib/candidate-analysis-contract.test.ts`, add a table-driven test whose literal counterexamples cover every payload surface:

```ts
const forbiddenStructuredAuthority = [
  { lifecycle: "published" },
  { verdict: "approved" },
  { disposition: "canonical" },
  { release: "external_ready" },
] as const;

for (const { kind, schema } of [
  { kind: "assertion", schema: CandidateAssertionPayloadSchema },
  { kind: "artifact", schema: CandidateArtifactPayloadSchema },
  { kind: "run_event", schema: CandidateRunEventPayloadSchema },
  { kind: "reconciliation", schema: CandidateReconciliationPayloadSchema },
] as const) {
  for (const data of forbiddenStructuredAuthority) {
    assert.equal(schema.safeParse({ namespace: "candidate", kind, data }).success, false);
  }
}
```

Add positive cases using only:

```ts
{
  namespace: "candidate",
  kind: "assertion",
  data: {
    entries: [
      { role: "proposition", valueType: "text", value: "A reviewable candidate claim." },
      { role: "quantitative_observation", valueType: "number", value: 42, unit: "kg" },
      { role: "limitation", valueType: "flag", value: true },
      {
        role: "scope_reference",
        valueType: "reference",
        targetType: "content_unit",
        targetId: "content:fixture:1",
      },
    ],
  },
}
```

Also prove unknown `role`, unknown `valueType`, extra keys at entry/data/envelope level, nested object values, non-finite numbers and empty entries fail. The production mutation each case catches is replacement of a strict enum/object with `z.string()`, `z.unknown()` or `.passthrough()`.

- [ ] **Step 2: Run the payload tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='machine payload|structured authority' tests/lib/candidate-analysis-contract.test.ts
```

Expected: FAIL because the four structured authority counterexamples are accepted by the current recursive JSON/denylist schema.

- [ ] **Step 3: Implement the allowlisted candidate-entry grammar**

Replace the machine-output denylist path with these exact public constants and fields:

```ts
export const CANDIDATE_PAYLOAD_ENTRY_ROLES = [
  "summary",
  "proposition",
  "observation",
  "classification_label",
  "entity_candidate",
  "relationship_candidate",
  "quantitative_observation",
  "coverage_signal",
  "gap",
  "contradiction",
  "source_role_suggestion",
  "reason",
  "worker_reference",
  "checkpoint",
  "scope_reference",
  "limitation",
] as const;

export const CANDIDATE_PAYLOAD_REFERENCE_TYPES = [
  "content_unit",
  "run",
  "artifact",
  "assertion",
  "evidence_link",
  "dependency",
  "reconciliation",
] as const;
```

`CandidatePayloadEntrySchema` is a strict discriminated union:

- `valueType: "text"` has only `role`, `valueType`, and non-empty `value`.
- `valueType: "number"` has only `role`, `valueType`, finite `value`, and `unit: non-empty string | null`.
- `valueType: "flag"` has only `role`, `valueType`, and boolean `value`.
- `valueType: "reference"` has only `role`, `valueType`, enum `targetType`, and identifier `targetId`.

`CandidatePayloadDataSchema` is exactly `{ entries: CandidatePayloadEntrySchema.array().min(1) }` and is strict. The four existing `candidatePayloadSchema(kind)` exports use it. Do not retain any key/value denylist as an authority boundary. Free text remains candidate text only; it cannot create a structured state key.

Convert fixture/event/artifact/assertion/reconciliation payloads to typed entries and re-seal every affected payload/event/idempotency hash from the production hash helpers.

- [ ] **Step 4: Run the focused contract suite and witness GREEN**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts
```

Expected: all tests pass; the four counterexample classes fail parse on all four surfaces.

- [ ] **Step 5: Add failing workflow/prompt bundle tests**

In `tests/lib/candidate-analysis-writer.test.ts`, build a temporary repository containing both workflow files and add separate tests for:

1. workflow omits or changes the prompt ID, version or repository path;
2. prompt omits or changes the workflow ID, version or repository path;
3. declared hash is recomputed after the semantic cross-reference is removed;
4. a test read seam returns valid bytes on the first read and changed bytes on any second read.

The first three must still throw `CandidateAnalysisWriteConflict` with the appropriate `workflow_binding_mismatch` or `prompt_binding_mismatch`. The read-seam case must succeed and assert exactly one byte read per file; a second read is the production mutation that makes it fail.

- [ ] **Step 6: Run the bundle tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='workflow.*prompt|prompt.*workflow|single read' tests/lib/candidate-analysis-writer.test.ts
```

Expected: FAIL because recomputed self-hashes currently bless detached files and each file is read separately as text and hash input.

- [ ] **Step 7: Implement single-read mutual binding**

Add these exact markers to both tracked files:

```text
Workflow repository path: `knowledge/corpus/workflows/candidate-analysis-v1.md`
Prompt template repository path: `knowledge/corpus/workflows/candidate-analysis-prompt-v1.md`
```

Keep their exact IDs and versions from `CANDIDATE_WORKFLOW_BINDING` and `CANDIDATE_PROMPT_BINDING`. Implement one verifier that:

1. resolves both fixed repository-relative paths;
2. rejects a resolved path outside `repositoryRoot`;
3. reads each file exactly once as `Buffer`;
4. hashes that same `Buffer` with SHA-256;
5. decodes that same `Buffer` as UTF-8 and rejects replacement-character decoding;
6. validates each file's own ID/version/path markers;
7. validates the workflow's prompt ID/version/path and the prompt's workflow ID/version/path;
8. compares both hashes with the run input before any database transaction.

Extend `WriterOptions` with an optional `(path: string) => Buffer` read seam for the test only; production defaults to `readFileSync(path)` once. Replace both `verifyTextBinding` calls with the single bundle verifier.

- [ ] **Step 8: Run Task 1 regressions**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
npx eslint src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts tests/fixtures/candidate-analysis-fixture.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 9: Commit Task 1**

```bash
git add src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts knowledge/corpus/workflows/candidate-analysis-v1.md knowledge/corpus/workflows/candidate-analysis-prompt-v1.md tests/fixtures/candidate-analysis-fixture.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
git commit -m "fix: seal candidate payload and workflow bundle"
```

---

### Task 2: Bind run-event scope through Prisma, SQL and runtime inserts

**Files:**
- Modify: `src/lib/knowledge/candidate-analysis-contract.ts`
- Modify: `src/lib/knowledge/candidate-analysis-writer.ts`
- Modify: `prisma/schema.prisma`
- Modify: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Modify: `tests/fixtures/candidate-analysis-fixture.ts`
- Modify: `tests/lib/candidate-analysis-contract.test.ts`
- Modify: `tests/lib/candidate-analysis-schema.test.ts`
- Modify: `tests/lib/candidate-analysis-writer.test.ts`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`
- Modify: `tests/lib/candidate-control-snapshot.test.ts`

**Interfaces:**
- Consumes Task 1's strict payload envelope and entry enums.
- Produces `CandidateAnalysisRun.scopeHash`, `CandidateAnalysisRunEvent.scopeHash`, and nullable `CandidateAnalysisRunEvent.supersededEventScopeHash`.
- The run/event writer always derives `scopeHash = candidateAnalysisRunScopeHash(runId)`; callers do not choose an unvalidated scope.
- A superseding event carries the complete prior identity `(id, eventHash, runId, scopeHash)` through `(supersededEventId, supersededEventHash, runId, supersededEventScopeHash)`.

- [ ] **Step 1: Add failing contract and live-SQL scope tests**

Add tests that require:

```ts
run.scopeHash === candidateAnalysisRunScopeHash(run.id)
event.scopeHash === candidateAnalysisRunScopeHash(event.runId)
superseding.supersededEventScopeHash === prior.scopeHash
```

Mutation cases must cover a wrong run scope, wrong ordinary-event scope, incomplete supersession four-tuple, and wrong prior-event scope. In the disposable PostgreSQL test, insert a valid prior event, then attempt a direct SQL superseding insert with the correct prior ID/hash/run but a different `supersededEventScopeHash`; assert the named composite foreign key rejects it.

- [ ] **Step 2: Run the scope tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='scope.*supersession|supersession.*scope|complete prior event identity' tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts
```

Expected: FAIL because neither the run nor prior event currently carries a relational scope identity and the SQL FK accepts a false scope column.

- [ ] **Step 3: Implement the TypeScript/Prisma scope identity**

Make these exact model changes:

```prisma
model CandidateAnalysisRun {
  scopeHash String
  @@unique([id, scopeHash])
}

model CandidateAnalysisRunEvent {
  scopeHash                  String
  supersededEventScopeHash   String?
  runByScope                 CandidateAnalysisRun @relation(
    fields: [runId, scopeHash],
    references: [id, scopeHash],
    onDelete: Restrict,
    onUpdate: Restrict,
    map: "CandidateRunEvent_run_scope_fkey"
  )
  supersededEvent CandidateAnalysisRunEvent? @relation(
    "CandidateRunEventSupersession",
    fields: [supersededEventId, supersededEventHash, runId, supersededEventScopeHash],
    references: [id, eventHash, runId, scopeHash],
    onDelete: Restrict,
    onUpdate: Restrict,
    map: "CandidateRunEvent_supersession_hash_scope_fkey"
  )
  @@unique([id, eventHash, runId, scopeHash])
}
```

Use one run relation only: replace the old single-column `run` relation with the composite `runByScope` relation and update the inverse relation name as required by Prisma validation.

Add `scopeHash` to `CandidateAnalysisRunInputSchema` and all run events. Ordinary and terminal events require the derived scope and null prior fields. Superseding events require all four prior fields and equality between current `scopeHash`, derived run scope and `supersededEventScopeHash`. Include both scope fields in `candidateAnalysisRunEventHash`. The writer stores/selects/compares both fields and rejects a prior tuple mismatch as `supersession_conflict`.

- [ ] **Step 4: Implement SQL constraints and the strict machine-payload insert guard**

Amend the unreleased migration to match Prisma exactly:

- add run/event `scopeHash` and event `supersededEventScopeHash` hash checks;
- add `CandidateAnalysisRun(id, scopeHash)` and `CandidateAnalysisRunEvent(id, eventHash, runId, scopeHash)` unique indexes;
- replace the run-event run FK and supersession FK with the two composite FKs above;
- make the supersession CHECK require all three nullable prior columns together and require `scopeHash = supersededEventScopeHash` for `eventType = 'superseded'`;
- retain the self-supersession check.

Add a `BEFORE INSERT` trigger function `reject_invalid_candidate_machine_payload()` to `CandidateAnalysisArtifact`, `CandidateAssertion`, `CandidateReconciliationSnapshot` and `CandidateAnalysisRunEvent`. It must reject, with a stable `invalid candidate machine payload` exception, any ordinary machine payload that is not exactly:

```json
{
  "namespace": "candidate",
  "kind": "assertion | artifact | run_event | reconciliation",
  "data": {
    "entries": [
      {
        "role": "one of CANDIDATE_PAYLOAD_ENTRY_ROLES",
        "valueType": "text | number | flag | reference",
        "...": "only the fields defined by Task 1"
      }
    ]
  }
}
```

The trigger also allows only the already strict `run_terminal` envelope for completed events and `run_supersession` envelope for superseding events. It must reject the four residual counterexamples on direct SQL inserts even when their payload hash is syntactically valid. Revoke PUBLIC execute on the trigger function; trigger execution itself remains the enforcement path. Do not grant worker roles direct function execution.

- [ ] **Step 5: Regenerate Prisma and run the focused schema/writer suite**

Run:

```bash
npx prisma generate
npx prisma validate
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/candidate-control-snapshot.test.ts
```

Expected: all runnable tests pass; a filesystem/PostgreSQL capability skip is acceptable only when the test prints the existing explicit skip reason.

- [ ] **Step 6: Run Task 2 static regressions**

Run:

```bash
npx eslint src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts tests/fixtures/candidate-analysis-fixture.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/candidate-control-snapshot.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts prisma/schema.prisma prisma/migrations/20260818_candidate_analysis_foundation/migration.sql tests/fixtures/candidate-analysis-fixture.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/candidate-control-snapshot.test.ts
git commit -m "fix: bind candidate event scope in database"
```

---

### Task 3: Harden role preflight, libpq environment and emergency recovery

**Files:**
- Create: `scripts/reject-ambient-candidate-libpq-env.mjs`
- Create: `scripts/enable-candidate-analysis-logins.sh`
- Modify: `scripts/bootstrap-candidate-analysis-roles.sh`
- Modify: `scripts/verify-candidate-analysis-roles.sh`
- Modify: `scripts/disable-candidate-analysis-writes.sh`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Produces a single ambient guard that rejects the presence of every environment key matching `^PG[A-Z0-9_]*$` before any script creates its own `PGPASSFILE`.
- Produces `enable-candidate-analysis-logins.sh --apply --confirm-existing-credentials`, requiring admin, worker and reconciler URLs; it creates or changes no credential.
- The recovery chain is bootstrap -> explicit enable with existing dedicated credentials -> both exact-role verifications. Any enable/verification failure returns both roles to the disabled state.

- [ ] **Step 1: Add failing ambient and type-owner preflight tests**

Extend `tests/lib/candidate-analysis-role-contract.test.ts` so bootstrap, verify and disable each fail before `psql` for both:

```ts
PGSSLCERTMODE: "require"
PGGSSDELEGATION: "1"
```

Add one future-variable case such as `PGFUTURECLIENTMODE=1`; this catches regression back to a finite denylist.

In disposable PostgreSQL, create a type-only owner and its implicit/default PUBLIC routine execution path:

```sql
CREATE ROLE candidate_type_only_owner NOLOGIN;
CREATE TYPE sidecar.type_only_enum AS ENUM ('one');
ALTER TYPE sidecar.type_only_enum OWNER TO candidate_type_only_owner;
```

Snapshot roles, ACLs, default ACLs and protected row counts. Run bootstrap and assert non-zero status plus byte-for-byte/row-for-row equality of the snapshot. Revoke the incompatible default PUBLIC routine EXECUTE for that owner and prove bootstrap succeeds.

- [ ] **Step 2: Run the new role tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='PGSSLCERTMODE|PGGSSDELEGATION|future libpq|type-only owner' tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: FAIL because the finite ambient list omits the named variables and bootstrap's owner universe omits `pg_type.typowner`.

- [ ] **Step 3: Implement future-safe ambient rejection and complete preflight ownership**

`reject-ambient-candidate-libpq-env.mjs` must:

```js
const names = Object.keys(process.env)
  .filter((name) => /^PG[A-Z0-9_]*$/.test(name))
  .sort();
```

If `names` is non-empty, print only the variable names and context, never values, and exit 1. Otherwise exit 0. Call it in bootstrap, verify and disable before creating/exporting `PGPASSFILE`. Remove the three copied finite `for pg_name` lists. The scripts may then create only their own private `PGPASSFILE`; no ambient `PG*` value survives into that point.

In bootstrap preflight, add `user_type` from `pg_type` joined to the same non-system `user_schema`, and add `typowner` to `user_owner`. Match the verifier's user-type owner universe. Keep the preflight before `BEGIN`, role creation, grant mutation or ACL mutation.

- [ ] **Step 4: Add failing recovery tests**

After a successful bootstrap/login provision/verify/disable cycle, prove:

1. rerunning bootstrap restores INSERT allowlists but leaves both roles `NOLOGIN`;
2. the documented new enable command can restore both roles with the already provisioned dedicated URLs and both verifiers pass;
3. a wrong worker or reconciler dedicated URL causes non-zero exit, both roles end `NOLOGIN`, INSERT is revoked again, candidate sessions are terminated, and all candidate rows remain unchanged;
4. the enable script contains no password-generation, password-change or password-logging path.

- [ ] **Step 5: Run the recovery tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='explicit login recovery|failed login recovery|bootstrap.*NOLOGIN' tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: FAIL because there is no explicit recovery command and the current help text falsely says bootstrap plus verify re-enables service.

- [ ] **Step 6: Implement explicit fail-safe login recovery**

Create executable `scripts/enable-candidate-analysis-logins.sh` with these exact requirements:

- accepts only `--apply --confirm-existing-credentials` in that order;
- requires `DATABASE_ADMIN_URL`, `CANDIDATE_WORKER_DATABASE_URL` and `CANDIDATE_RECONCILER_DATABASE_URL`;
- uses the same role/schema/application-name validation, URL normalizer and ambient guard as the other role scripts;
- preflights that both exact roles exist, are `NOLOGIN`, have no elevated attributes or membership in either direction, and have no user-schema ownership;
- sets both exact roles `LOGIN` atomically and creates/changes/logs no password, certificate, key or credential;
- immediately runs `verify-candidate-analysis-roles.sh --role=worker` and `--role=reconciler` through the supplied exact URLs;
- arms a trap after LOGIN is enabled. On any signal or failed verification, the trap invokes the existing disable operation with the admin URL, so both roles end `NOLOGIN`, INSERT grants are revoked, exact candidate sessions are terminated and all rows are preserved;
- disarms the trap only after both verifications pass;
- unsets all three URL variables before printing success.

Update disable help and final output to state the true chain: bootstrap grants, then explicit existing-credential enable, then both verifications. Do not say bootstrap alone restores LOGIN.

- [ ] **Step 7: Run Task 3 regressions**

Run:

```bash
chmod 0755 scripts/reject-ambient-candidate-libpq-env.mjs scripts/enable-candidate-analysis-logins.sh
sh -n scripts/bootstrap-candidate-analysis-roles.sh
sh -n scripts/verify-candidate-analysis-roles.sh
sh -n scripts/disable-candidate-analysis-writes.sh
sh -n scripts/enable-candidate-analysis-logins.sh
node --check scripts/reject-ambient-candidate-libpq-env.mjs
node --check scripts/normalize-candidate-postgres-url.mjs
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
npx eslint tests/lib/candidate-analysis-role-contract.test.ts
git diff --check
```

Expected: all commands exit 0.

- [ ] **Step 8: Commit Task 3**

```bash
git add scripts/reject-ambient-candidate-libpq-env.mjs scripts/enable-candidate-analysis-logins.sh scripts/bootstrap-candidate-analysis-roles.sh scripts/verify-candidate-analysis-roles.sh scripts/disable-candidate-analysis-writes.sh tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "fix: harden candidate role recovery boundaries"
```

---

### Task 4: Align the durable contract and run the complete hardening acceptance matrix

**Files:**
- Modify: `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md`
- Modify: `package.json`
- Test: `tests/lib/autonomous-analysis-contract.test.ts`
- Test: all candidate/processing/package workflow suites listed below

**Interfaces:**
- Consumes Tasks 1-3 exactly; it adds no new authority or database behavior.
- Produces `candidate:roles:enable` as the raw guarded recovery command and keeps `knowledge:candidate-contracts:check` as the focused candidate acceptance surface.
- Documents strict payload entries, mutual workflow/prompt byte binding, complete event scope identity and the true disable/recovery sequence.

- [ ] **Step 1: Add failing durable-contract assertions**

In `tests/lib/autonomous-analysis-contract.test.ts`, assert behaviorally relevant contract statements and package wiring:

```ts
assert.equal(packageJson.scripts["candidate:roles:enable"], "scripts/enable-candidate-analysis-logins.sh");
assert.match(contract, /typed candidate entries/i);
assert.match(contract, /workflow.*prompt.*mutual|mutual.*workflow.*prompt/i);
assert.match(contract, /superseded.*event.*scope/i);
assert.match(contract, /bootstrap.*enable.*verify/i);
assert.doesNotMatch(contract, /bootstrap[^\n]*verify[^\n]*re-enable/i);
```

The package assertion catches removal of the operator entrypoint; the prose assertions catch a stale security/runbook contract, not incidental wording.

- [ ] **Step 2: Run the contract test and witness RED**

Run:

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
```

Expected: FAIL because the package entrypoint and hardened recovery/payload/scope descriptions do not yet exist.

- [ ] **Step 3: Update the durable contract and package entrypoint**

Add:

```json
"candidate:roles:enable": "scripts/enable-candidate-analysis-logins.sh"
```

Document that structured machine output is only the typed candidate-entry grammar; free text is candidate text and never a status/decision. Document that the exact workflow and prompt bytes are read once, hash-bound and mutually cross-referenced. Document the four-part prior event identity and the database FK. Replace every stale re-enable instruction with:

```text
bootstrap grants -> enable existing credentials -> verify worker -> verify reconciler
```

State explicitly that the enable step does not provision credentials and fails back to the disabled state.

- [ ] **Step 4: Run focused and cross-layer acceptance**

Run under Node 24:

```bash
npm run knowledge:candidate-contracts:check
npm run knowledge:processing-contracts:check
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/library-analysis-candidate-compat.test.ts tests/lib/candidate-control-snapshot.test.ts
npx prisma generate
npx prisma validate
npx eslint knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md package.json src/lib/knowledge/candidate-analysis-contract.ts src/lib/knowledge/candidate-analysis-writer.ts tests/fixtures/candidate-analysis-fixture.ts tests/lib/autonomous-analysis-contract.test.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts
npx tsc --noEmit
npm run build
git diff --check
```

If ESLint does not accept Markdown/JSON targets, record that exact parser result and rerun ESLint on the TypeScript targets only; do not suppress source errors.

Expected: all applicable commands exit 0. The one already capability-gated snapshot test may skip only with its explicit filesystem reason.

- [ ] **Step 5: Run the full repository test without laundering known failures**

Run:

```bash
npm test
```

Expected baseline: candidate tests are green. The known protected corpus-health schema-hash failure and runtime-attestation dependent failures may remain red. Record exact counts and names. Do not modify protected evidence to convert them to green and do not describe the repository as fully green while this command is red.

- [ ] **Step 6: Commit Task 4**

```bash
git add knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md package.json tests/lib/autonomous-analysis-contract.test.ts
git commit -m "docs: align candidate hardening contract"
```

---

## Final Review Gate

After all four task reviews pass:

1. Generate one whole-branch review package from `5956d1ccef1e14783bd2963968d1464176d63a42` to `HEAD` for this residual-hardening plan.
2. Require a fresh reviewer to verify each of the six residual findings against runtime, Prisma, raw SQL and role lifecycle evidence.
3. If the final review finds issues, run the single permitted final fix wave and one scoped re-review.
4. Keep any residual load-bearing finding explicit; do not merge, deploy or open autonomous production execution.
5. Finish with a clean worktree and an evidence summary separating focused GREEN, full-suite baseline failures and all external/owner-only gates.
