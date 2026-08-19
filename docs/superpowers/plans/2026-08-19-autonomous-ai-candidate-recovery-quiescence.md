# Autonomous AI Candidate Recovery Quiescence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a provable candidate-role recovery epoch, close configuration-parameter privilege bypasses, and keep autonomous machine analysis candidate-only.

**Architecture:** Bootstrap remains a disabled-state operation, but now requires an explicit target-database client drain before grants are restored. PostgreSQL parameter ACLs become part of the catalog-locked role contract, candidate logins are pinned to `session_replication_role=origin`, and all custom candidate integrity triggers fire in every replication mode.

**Tech Stack:** PostgreSQL 16, POSIX shell, TypeScript, Prisma 7, Node.js 24, `node:test`.

**Spec:** `docs/superpowers/specs/2026-08-19-autonomous-ai-candidate-recovery-quiescence-design.md`

## Global Constraints

- Use the existing linked worktree and branch. Do not create a second worktree inside it.
- Use Node.js 24 for acceptance evidence even if the interactive shell exposes a different Node version.
- Run every behavior change through a witnessed RED, minimal GREEN and focused regression before commit.
- The candidate foundation is unreleased. Amend `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` in place; do not add a compensating production migration.
- Worker INSERT remains limited to `CandidateAnalysisRun`, `CandidateAnalysisRunInput`, `CandidateAnalysisRunEvent`, `CandidateAnalysisArtifact`, `CandidateAssertion`, `CandidateEvidenceLink` and `CandidateDependency`.
- Reconciler INSERT remains limited to `CandidateReconciliationSnapshot`.
- No candidate role may write `CandidateHumanReviewDecision`, `CandidatePromotionDecision`, canonical, coverage, publication or unrelated records.
- Existing candidate data is immutable. Tests must compare exact rows and counts for all 11 candidate tables across success and failure paths.
- Do not create, rotate, transport, print or embed credentials.
- Do not automatically revoke cluster-wide `PUBLIC` parameter privileges. Detect them and fail before LOGIN with a separate-hardening instruction.
- Do not edit protected corpus-health hashes, runtime-attestation manifests or release evidence to hide the known full-suite baseline.
- No production database, real credential, live autonomous worker, push, merge, deploy, human decision or promotion is authorized.
- Record task RED/GREEN commands and review findings in `.superpowers/sdd/2026-08-19-autonomous-ai-candidate-recovery-quiescence/`; these reports are evidence, not runtime authority.

---

## File Map

- `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` — creates all candidate tables, integrity functions and the 27 custom candidate triggers.
- `tests/lib/candidate-analysis-schema.test.ts` — static migration assertions and disposable-PostgreSQL trigger behavior.
- `scripts/bootstrap-candidate-analysis-roles.sh` — explicit disabled-state preflight, target-database drain, exact grant repair and role defaults.
- `scripts/enable-candidate-analysis-logins.sh` — catalog-locked final contract check and atomic dual LOGIN.
- `scripts/verify-candidate-analysis-roles.sh` — dedicated-session effective privilege and runtime-setting verification.
- `scripts/disable-candidate-analysis-writes.sh` — emergency NOLOGIN/INSERT revoke and truthful handoff to drained bootstrap recovery.
- `tests/helpers/candidate-analysis-postgres.ts` — disposable PostgreSQL harness; gains an opt-in prepared-transaction server setting.
- `tests/lib/candidate-analysis-role-contract.test.ts` — static, mutation-oriented and live role-lifecycle evidence.
- `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` — durable operator and authority contract.
- `tests/lib/autonomous-analysis-contract.test.ts` — load-bearing assertions and mutation pressure for the durable contract.
- `package.json` — keeps confirmation outside the package script so the operator must supply it explicitly.

---

### Task 1: Make every custom candidate integrity trigger replication-mode invariant

**Files:**
- Modify: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Modify: `tests/lib/candidate-analysis-schema.test.ts`

**Interfaces:**
- Produces exactly 27 named custom triggers with `pg_trigger.tgenabled = 'A'`.
- Keeps PostgreSQL-generated foreign-key triggers unchanged; Tasks 2 and 4 continue to treat parameter authority as the FK protection boundary.
- Does not change Prisma models, table shape, grants or stored rows.

- [ ] **Step 1: Add the exact failing trigger-state assertions**

In `tests/lib/candidate-analysis-schema.test.ts`, define the full expected list next to the existing migration immutability test:

```ts
const candidateAlwaysTriggers = [
  ["CandidateContentUnit", "CandidateContentUnit_reject_update_delete"],
  ["CandidateContentUnit", "CandidateContentUnit_reject_truncate"],
  ["CandidateAnalysisRun", "CandidateAnalysisRun_reject_invalid_scope"],
  ["CandidateAnalysisRun", "CandidateAnalysisRun_reject_update_delete"],
  ["CandidateAnalysisRun", "CandidateAnalysisRun_reject_truncate"],
  ["CandidateAnalysisRunInput", "CandidateAnalysisRunInput_reject_update_delete"],
  ["CandidateAnalysisRunInput", "CandidateAnalysisRunInput_reject_truncate"],
  ["CandidateAnalysisRunEvent", "CandidateAnalysisRunEvent_reject_invalid_machine_payload"],
  ["CandidateAnalysisRunEvent", "CandidateAnalysisRunEvent_reject_update_delete"],
  ["CandidateAnalysisRunEvent", "CandidateAnalysisRunEvent_reject_truncate"],
  ["CandidateAnalysisArtifact", "CandidateAnalysisArtifact_reject_invalid_machine_payload"],
  ["CandidateAnalysisArtifact", "CandidateAnalysisArtifact_reject_update_delete"],
  ["CandidateAnalysisArtifact", "CandidateAnalysisArtifact_reject_truncate"],
  ["CandidateAssertion", "CandidateAssertion_reject_invalid_machine_payload"],
  ["CandidateAssertion", "CandidateAssertion_reject_update_delete"],
  ["CandidateAssertion", "CandidateAssertion_reject_truncate"],
  ["CandidateEvidenceLink", "CandidateEvidenceLink_reject_update_delete"],
  ["CandidateEvidenceLink", "CandidateEvidenceLink_reject_truncate"],
  ["CandidateDependency", "CandidateDependency_reject_update_delete"],
  ["CandidateDependency", "CandidateDependency_reject_truncate"],
  ["CandidateReconciliationSnapshot", "CandidateReconciliationSnapshot_reject_invalid_machine_payload"],
  ["CandidateReconciliationSnapshot", "CandidateReconciliationSnapshot_reject_update_delete"],
  ["CandidateReconciliationSnapshot", "CandidateReconciliationSnapshot_reject_truncate"],
  ["CandidateHumanReviewDecision", "CandidateHumanReviewDecision_reject_update_delete"],
  ["CandidateHumanReviewDecision", "CandidateHumanReviewDecision_reject_truncate"],
  ["CandidatePromotionDecision", "CandidatePromotionDecision_reject_update_delete"],
  ["CandidatePromotionDecision", "CandidatePromotionDecision_reject_truncate"],
] as const;
```

Extend the static test to require one `ALTER TABLE ... ENABLE ALWAYS TRIGGER ...` statement for every pair. Add a live disposable-PostgreSQL test that joins `pg_trigger` and `pg_class`, serializes `relname|tgname|tgenabled`, and expects every listed row to end in `|A`.

Add a controlled admin probe:

```sql
SET session_replication_role = replica;
INSERT INTO public."CandidateAnalysisRun" (
  "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
  "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
  "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
  "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
) VALUES (
  'run:replica-invalid-scope', repeat('f', 64),
  'workflow.candidate_analysis.v1', '1.0.0', 'workflow.md', repeat('0', 64),
  'prompt.candidate_analysis.v1', '1.0.0', 'prompt.md', 'test', 'test-model',
  'v1', repeat('1', 64), '{}', repeat('2', 64), repeat('3', 64),
  'replica trigger probe', 'candidate_only', 'worker:probe', repeat('4', 64), 1
);
```

Expected product behavior after the fix: the statement fails with the invalid run-scope error even in replica mode, and the row count for that ID remains zero. Execute the probe in its own disposable database; do not weaken the session setting on the shared test connection.

- [ ] **Step 2: Run the focused schema test and witness RED**

Run under Node 24:

```bash
node --import=tsx --test --test-name-pattern='ENABLE ALWAYS|replica mode' tests/lib/candidate-analysis-schema.test.ts
```

Expected: FAIL because all 27 triggers currently have `tgenabled = 'O'`, and the invalid-scope INSERT succeeds when the admin session is in replica mode.

- [ ] **Step 3: Mark every named custom trigger `ENABLE ALWAYS`**

In the existing migration, immediately after each table's `CREATE TRIGGER` group, add one explicit statement per entry in `candidateAlwaysTriggers`, for example:

```sql
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_invalid_scope";
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_update_delete";
ALTER TABLE "CandidateAnalysisRun"
  ENABLE ALWAYS TRIGGER "CandidateAnalysisRun_reject_truncate";
```

Use the full 27-entry list from Step 1. Do not apply `ENABLE ALWAYS` to system-generated foreign-key triggers and do not use `ENABLE ALWAYS TRIGGER ALL`.

- [ ] **Step 4: Prove GREEN and preserve SQL parity**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts
npx prisma validate
git diff --check
```

Expected: schema suite PASS, Prisma validation PASS, no whitespace errors.

- [ ] **Step 5: Self-review and commit Task 1**

Check that the migration contains exactly the 27 expected `ENABLE ALWAYS TRIGGER` statements and no foreign-key trigger mutation. Then:

```bash
git add prisma/migrations/20260818_candidate_analysis_foundation/migration.sql tests/lib/candidate-analysis-schema.test.ts
git commit -m "fix: preserve candidate triggers in replica mode"
```

---

### Task 2: Add parameter ACLs and replication origin to the exact role contract

**Files:**
- Modify: `scripts/bootstrap-candidate-analysis-roles.sh`
- Modify: `scripts/enable-candidate-analysis-logins.sh`
- Modify: `scripts/verify-candidate-analysis-roles.sh`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Produces an exact candidate-role setting `session_replication_role=origin` for worker and reconciler.
- Produces zero direct candidate grantees in `pg_parameter_acl` and zero effective explicit `SET`/`ALTER SYSTEM` path through `PUBLIC`.
- Adds `pg_catalog.pg_parameter_acl` to the bootstrap and enable lock contracts.
- Task 3 consumes these stronger disabled-state and lock checks before introducing the drain.

- [ ] **Step 1: Extend authority snapshots and add parameter-ACL RED cases**

In `candidateAuthoritySnapshot`, add cluster parameter ACL rows so failure-path comparisons are load-bearing:

```sql
UNION ALL
SELECT 'parameter-acl', parameter.parname,
  COALESCE(parameter.paracl::text, '<null>')
FROM pg_parameter_acl parameter
```

Add one disposable-PostgreSQL test with these phases:

1. prepare the normal disabled recovery fixture;
2. `GRANT SET, ALTER SYSTEM ON PARAMETER session_replication_role TO foodsystems_candidate_worker`;
3. run bootstrap and require the direct worker grant to be removed;
4. provision/enable existing credentials;
5. connect as worker and require `SHOW session_replication_role` to return `origin`;
6. require `SET session_replication_role=replica` to fail;
7. re-grant `SET` directly and require worker verify to fail;
8. run disable, then require enable-from-disabled-state to fail on the retained parameter grant;
9. revoke the direct grant and restore the clean control.

Add a separate `PUBLIC` case:

```sql
GRANT SET ON PARAMETER session_replication_role TO PUBLIC;
```

Snapshot authority plus all 11 candidate tables, run bootstrap, and require failure text matching `PUBLIC.*parameter|parameter.*PUBLIC`. Prove the `PUBLIC` grant still exists and every snapshot is byte-identical. Clean up only in the test with:

```sql
REVOKE SET ON PARAMETER session_replication_role FROM PUBLIC;
```

Keep an unrelated target-database sleeper active during this failed bootstrap and prove it remains connected. This makes the requirement "PUBLIC incompatibility fails before drain" independently load-bearing after Task 3 adds the drain.

- [ ] **Step 2: Add a deterministic concurrent parameter-GRANT RED case**

In the same test file, use the disposable cluster to hold a later catalog lock and expose whether enable has already locked `pg_parameter_acl`:

```sql
BEGIN;
LOCK TABLE pg_catalog.pg_shdepend IN ACCESS EXCLUSIVE MODE;
SELECT pg_sleep(60);
```

Start that blocker with a unique `application_name`, start enable asynchronously, and wait until enable is blocked trying to lock `pg_shdepend`. In a third admin connection run:

```sql
SET lock_timeout = '250ms';
GRANT SET ON PARAMETER session_replication_role TO foodsystems_candidate_worker;
```

Before the fix this GRANT is accepted because enable does not lock `pg_parameter_acl`. After the fix it must fail on lock timeout. Terminate the blocker backend, await enable, and prove clean enable succeeds with no retained parameter grant.

- [ ] **Step 3: Run the focused role cases and witness RED**

Run under Node 24:

```bash
node --import=tsx --test --test-name-pattern='parameter ACL|replication role|concurrent parameter' tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: direct grant survives bootstrap, worker can select replica mode, `PUBLIC` is not rejected, and the concurrent GRANT crosses enable.

- [ ] **Step 4: Harden bootstrap parameter handling**

In bootstrap's read-only PUBLIC/default-ACL preflight, add:

```sql
OR EXISTS (
  SELECT 1
  FROM pg_parameter_acl parameter,
  LATERAL aclexplode(parameter.paracl) privilege
  WHERE privilege.grantee = 0
    AND privilege.privilege_type IN ('SET', 'ALTER SYSTEM')
)
```

Require `rolsuper`, not `rolcreaterole`, for the bootstrap administrator. Add `pg_catalog.pg_parameter_acl` to the authoritative `SHARE ROW EXCLUSIVE` lock list.

After both exact roles exist, revoke every direct parameter grant without touching `PUBLIC`:

```sql
WITH candidate_role(role_name) AS (
  VALUES (:'worker_role'), (:'reconciler_role')
)
SELECT format(
  'REVOKE ALL PRIVILEGES ON PARAMETER %I FROM %I',
  parameter.parname,
  candidate_role.role_name
)
FROM pg_parameter_acl parameter
CROSS JOIN candidate_role
\gexec
```

After `ALTER ROLE ... RESET ALL`, add the exact role default:

```sql
SELECT format(
  'ALTER ROLE %I SET session_replication_role TO %L',
  role_name,
  'origin'
)
FROM (VALUES (:'worker_role'), (:'reconciler_role')) roles(role_name)
\gexec
```

- [ ] **Step 5: Harden enable and dedicated verify**

In enable:

- lock `pg_catalog.pg_parameter_acl` before the deliberately later `pg_shdepend` lock used by the race test;
- add `('session_replication_role', 'origin')` to `expected_settings`;
- for each target role, add a contract issue when any explicit parameter row is effective:

```sql
SELECT format('configuration parameter privilege is effective: %s', parameter.parname)
FROM pg_parameter_acl parameter
WHERE has_parameter_privilege(target_role, parameter.parname, 'SET')
   OR has_parameter_privilege(target_role, parameter.parname, 'ALTER SYSTEM')
```

In verify, add the equivalent current-user scan and the runtime-value check:

```sql
UNION ALL
SELECT format('configuration parameter privilege is effective: %s', parameter.parname)
FROM pg_parameter_acl parameter
WHERE has_parameter_privilege(current_user, parameter.parname, 'SET')
   OR has_parameter_privilege(current_user, parameter.parname, 'ALTER SYSTEM')
UNION ALL
SELECT 'session_replication_role must be origin'
WHERE current_setting('session_replication_role') <> 'origin'
```

Also add an active denial probe through the existing `expect_denied` helper:

```sh
expect_denied \
  'session_replication_role replica mode' \
  "SET session_replication_role TO replica"
```

- [ ] **Step 6: Prove focused GREEN and full role regression**

Run:

```bash
node --import=tsx --test --test-name-pattern='parameter ACL|replication role|concurrent parameter' tests/lib/candidate-analysis-role-contract.test.ts
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
sh -n scripts/bootstrap-candidate-analysis-roles.sh
sh -n scripts/enable-candidate-analysis-logins.sh
sh -n scripts/verify-candidate-analysis-roles.sh
npx eslint tests/lib/candidate-analysis-role-contract.test.ts
npx tsc --noEmit
git diff --check
```

Expected: focused cases PASS, full role file PASS with disposable PostgreSQL actually running, syntax/lint/TypeScript/diff checks PASS.

- [ ] **Step 7: Self-review and commit Task 2**

Confirm that no script contains `REVOKE ... FROM PUBLIC`, worker/reconciler allowlists are unchanged, and `pg_parameter_acl` is locked before LOGIN. Then:

```bash
git add scripts/bootstrap-candidate-analysis-roles.sh scripts/enable-candidate-analysis-logins.sh scripts/verify-candidate-analysis-roles.sh tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "fix: bind candidate parameter privileges"
```

---

### Task 3: Establish the explicit database-drained bootstrap epoch

**Files:**
- Modify: `scripts/bootstrap-candidate-analysis-roles.sh`
- Modify: `tests/helpers/candidate-analysis-postgres.ts`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Changes bootstrap's public CLI to exactly `--apply --confirm-database-session-drain`.
- Produces one catalog-locked transaction that rechecks disabled state, terminates all other target-database client backends, verifies the selected PID set is gone, rejects prepared transactions and only then restores grants.
- Keeps both roles `NOLOGIN` at commit; Task 4 documents this exact interface.

- [ ] **Step 1: Make the disposable harness opt-in for prepared transactions**

In `tests/helpers/candidate-analysis-postgres.ts`, add:

```ts
export type CandidateAnalysisPostgresOptions = {
  maxPreparedTransactions?: number;
};

export async function withCandidateAnalysisPostgres(
  t: TestContext,
  callback: (context: CandidateAnalysisPostgresContext) => Promise<void>,
  options: CandidateAnalysisPostgresOptions = {},
): Promise<void> {
```

Build the `pg_ctl -o` value with the opt-in only:

```ts
const serverOptions = [
  "-F",
  `-p ${port}`,
  `-k ${socketDir}`,
  ...(options.maxPreparedTransactions === undefined
    ? []
    : [`-c max_prepared_transactions=${options.maxPreparedTransactions}`]),
].join(" ");
```

Keep the current default behavior for every existing caller. The prepared-transaction test passes `{ maxPreparedTransactions: 10 }` as the third argument.

- [ ] **Step 2: Add an exact bootstrap-argument contract and update positive call sites**

At the top of `candidate-analysis-role-contract.test.ts`, add:

```ts
const bootstrapApplyArgs = [
  "--apply",
  "--confirm-database-session-drain",
] as const;
```

Update every positive `spawnSync(bootstrapPath, ["--apply"], ...)` call to use `[...bootstrapApplyArgs]`. Preserve intentional negative calls.

Add argument-pressure cases for:

```ts
[
  [],
  ["--apply"],
  ["--confirm-database-session-drain", "--apply"],
  ["--apply", "--confirm-database-session-drain", "unexpected"],
]
```

Use a fake `psql` in `PATH` with an invocation marker and a valid-shaped admin URL. Every invalid call must fail with `exactly --apply --confirm-database-session-drain is required`, and the marker must remain absent.

- [ ] **Step 3: Add the stale gateway and database-scope RED test**

Use a disposable cluster and the existing `prepareRecoveryFixture`, `candidateRowsSnapshot`, `activityCount` and `childExit` helpers.

1. Create `candidate_gateway LOGIN` and grant it worker membership.
2. Open a gateway `psql` child with a unique application name.
3. In that child run `SET ROLE foodsystems_candidate_worker; BEGIN; INSERT ... CandidateAnalysisRun; SELECT pg_sleep(60); COMMIT;` using `candidateAnalysisRunScopeHash(runId)` and 64-character lowercase hashes.
4. Open a second unrelated target-database sleeper.
5. Create another database in the same cluster and open a third sleeper there.
6. Run disable and prove membership plus worker INSERT are revoked while the gateway backend remains alive.
7. Snapshot all 11 candidate tables.
8. Run bootstrap with `bootstrapApplyArgs`.

Before implementation the gateway and unrelated target client survive. Required GREEN:

- gateway and unrelated target-database client exit;
- other-database client remains alive;
- the gateway's open INSERT rolls back and all 11 snapshots remain exact;
- worker and reconciler remain `NOLOGIN`;
- exact worker/reconciler grants are restored;
- no direct or inherited membership exists.

Terminate the other-database control explicitly in test cleanup.

- [ ] **Step 4: Add prepared-transaction and survivor-guard RED tests**

Prepared case:

```ts
await withCandidateAnalysisPostgres(t, async (context) => {
  prepareRecoveryFixture(context);
  assert.equal(
    context.psql("BEGIN; SELECT 1; PREPARE TRANSACTION 'candidate-recovery-pending'").status,
    0,
  );
  // Snapshot authority and rows; bootstrap must fail before drain/mutation.
  // Cleanup: ROLLBACK PREPARED 'candidate-recovery-pending'.
}, { maxPreparedTransactions: 10 });
```

Keep an unrelated target-database sleeper active while the prepared transaction exists. The failed bootstrap must leave that sleeper connected as well as preserving exact authority and row snapshots, proving rejection happens before drain.

For a load-bearing survivor guard, create a temporary copy of bootstrap plus `normalize-candidate-postgres-url.mjs` and `reject-ambient-candidate-libpq-env.mjs`. Replace exactly the production call `pg_terminate_backend(activity.pid, 5000)` with `false` in the temporary bootstrap only. Run it while a target-database sleeper exists. Required GREEN behavior is failure matching `survived.*drain|drain.*survived`, disabled roles, no grant restoration and exact candidate rows. The approved production script must remain unchanged by the mutation test.

- [ ] **Step 5: Run the drain-focused tests and witness RED**

Run under Node 24:

```bash
node --import=tsx --test --test-name-pattern='database-session-drain|stale gateway|prepared transaction|survivor guard' tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: argument contract, gateway termination, target scope, prepared transaction and mutation-pressure assertions fail against the current bootstrap.

- [ ] **Step 6: Implement the exact CLI and read-only disabled-state preflight**

Change bootstrap usage and argument validation to:

```sh
[ "$#" -eq 2 ] || {
  usage >&2
  fail 'exactly --apply --confirm-database-session-drain is required'
}
[ "$1" = '--apply' ] && [ "$2" = '--confirm-database-session-drain' ] || {
  usage >&2
  fail 'exactly --apply --confirm-database-session-drain is required'
}
```

Before `BEGIN`, require all existing candidate roles to be `NOLOGIN` with safe attributes, require no membership in either direction, require no effective candidate `INSERT` on any user relation, and require no row in `pg_prepared_xacts` for `current_database()`. Missing roles are allowed for first bootstrap. A failed disabled-state check must say to run `disable-candidate-analysis-writes.sh --apply` first.

- [ ] **Step 7: Acquire the full lock set and repeat preflight before drain**

Inside one transaction, lock the exact catalogs in deterministic order:

```sql
LOCK TABLE pg_catalog.pg_authid IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_auth_members IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_database IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_namespace IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_class IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_attribute IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_proc IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_type IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_default_acl IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_db_role_setting IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_parameter_acl IN SHARE ROW EXCLUSIVE MODE;
LOCK TABLE pg_catalog.pg_shdepend IN SHARE ROW EXCLUSIVE MODE;
```

Repeat the complete disabled-state, `PUBLIC` parameter and prepared-transaction checks under those locks. Any drift aborts the attempt; do not revoke a newly appeared membership and continue without a new drain.

- [ ] **Step 8: Drain selected target-database client PIDs and repair only after proof**

Use one PL/pgSQL block with a captured PID array:

```sql
DO $drain$
DECLARE
  target_pids integer[];
BEGIN
  SELECT COALESCE(array_agg(activity.pid ORDER BY activity.pid), ARRAY[]::integer[])
  INTO target_pids
  FROM pg_stat_activity activity
  WHERE activity.datid = (SELECT oid FROM pg_database WHERE datname = current_database())
    AND activity.backend_type = 'client backend'
    AND activity.pid <> pg_backend_pid();

  PERFORM pg_terminate_backend(activity.pid, 5000)
  FROM pg_stat_activity activity
  WHERE activity.pid = ANY(target_pids);

  PERFORM pg_stat_clear_snapshot();

  IF EXISTS (
    SELECT 1 FROM pg_stat_activity activity
    WHERE activity.pid = ANY(target_pids)
  ) THEN
    RAISE EXCEPTION 'target database client sessions survived recovery drain';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_prepared_xacts prepared
    WHERE prepared.database = current_database()
  ) THEN
    RAISE EXCEPTION 'prepared transaction appeared during recovery drain';
  END IF;
END
$drain$;
```

Only after this block succeeds may the existing grant normalization run. Keep Task 2's `pg_parameter_acl` revocation and `session_replication_role=origin` setting. Commit with both roles still `NOLOGIN`. Final output must state that the recovery epoch and grants are complete but explicit enable is still required.

- [ ] **Step 9: Prove focused and full role GREEN**

Run:

```bash
node --import=tsx --test --test-name-pattern='database-session-drain|stale gateway|prepared transaction|survivor guard' tests/lib/candidate-analysis-role-contract.test.ts
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
sh -n scripts/bootstrap-candidate-analysis-roles.sh
npx eslint tests/helpers/candidate-analysis-postgres.ts tests/lib/candidate-analysis-role-contract.test.ts
npx tsc --noEmit
git diff --check
```

Expected: all new drain tests PASS, full role suite PASS with no capability skip when PostgreSQL 16 binaries are available, static checks PASS.

- [ ] **Step 10: Self-review and commit Task 3**

Check that only target-database `client backend` rows are selected, the admin PID is excluded, locks precede drain, the selected PID set is rechecked, and grants follow successful drain. Then:

```bash
git add scripts/bootstrap-candidate-analysis-roles.sh tests/helpers/candidate-analysis-postgres.ts tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "fix: establish candidate recovery epoch"
```

---

### Task 4: Make the recovery contract durable and run the full acceptance chain

**Files:**
- Modify: `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md`
- Modify: `tests/lib/autonomous-analysis-contract.test.ts`
- Modify: `scripts/disable-candidate-analysis-writes.sh`
- Verify only: `package.json`
- Create: `.superpowers/sdd/2026-08-19-autonomous-ai-candidate-recovery-quiescence/final-report.md`

**Interfaces:**
- Produces the truthful recovery chain: disable, explicitly confirmed drained bootstrap, existing-credential enable, worker verify, reconciler verify.
- Keeps `package.json` from pre-approving `--confirm-database-session-drain`.
- Produces final local evidence without claiming CI, deploy, runtime, human review or promotion.

- [ ] **Step 1: Add failing durable-contract and package assertions**

Extend `assertRecoveryContract` to require all of these concepts inside `## Database roles`:

```ts
assert.match(
  roles,
  /`scripts\/bootstrap-candidate-analysis-roles\.sh --apply --confirm-database-session-drain`/,
);
assert.match(roles, /all other client.*target database.*terminated/i);
assert.match(roles, /prepared transactions.*reject/i);
assert.match(roles, /`pg_parameter_acl`/);
assert.match(roles, /`session_replication_role=origin`/);
assert.match(roles, /custom candidate.*`ENABLE ALWAYS`/i);
assert.match(roles, /human review.*promotion.*separate/i);
```

Add package assertions:

```ts
assert.equal(
  packageJson.scripts["candidate:roles:bootstrap"],
  "scripts/bootstrap-candidate-analysis-roles.sh --apply",
);
assert.doesNotMatch(
  packageJson.scripts["candidate:roles:bootstrap"],
  /confirm-database-session-drain/,
);
```

Add independent mutation cases that remove each recovery invariant from the `Database roles` section and require `assertDurableContract(mutated)` to throw. Do not combine all removals into one mutation.

- [ ] **Step 2: Run the contract tests and witness RED**

Run:

```bash
node --import=tsx --test --test-name-pattern='recovery|package exposes' tests/lib/autonomous-analysis-contract.test.ts
```

Expected: FAIL because the durable contract does not yet describe the drain, prepared-transaction stopline, parameter ACL, origin setting or always triggers.

- [ ] **Step 3: Update durable operator guidance without changing authority**

Replace the recovery paragraphs in `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` with text that states:

- disable is the first recovery action;
- bootstrap is exactly `scripts/bootstrap-candidate-analysis-roles.sh --apply --confirm-database-session-drain`;
- it requires a planned target-database maintenance window and terminates all other client backends there;
- any prepared transaction blocks bootstrap;
- bootstrap repairs grants and parameter ACLs but leaves both roles `NOLOGIN`;
- candidate defaults are pinned to `session_replication_role=origin`, and custom candidate integrity triggers are `ENABLE ALWAYS`;
- enable still uses existing credentials and performs worker/reconciler verification;
- none of this creates human review, promotion or external readiness.

Update disable's usage and inline gateway comment to say that a gateway with an already assumed role can survive disable without INSERT, and must be removed by the explicitly drained bootstrap before grants return. Do not expand disable into a database-wide drain.

- [ ] **Step 4: Prove durable-contract GREEN**

Run:

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
sh -n scripts/disable-candidate-analysis-writes.sh
npx eslint tests/lib/autonomous-analysis-contract.test.ts
git diff --check
```

Expected: contract and mutation-pressure tests PASS; shell syntax and diff PASS.

- [ ] **Step 5: Run the complete focused acceptance matrix**

Run from a clean Node 24 shell with PostgreSQL 16 binaries discoverable:

```bash
npm run knowledge:candidate-contracts:check
npm run knowledge:processing-contracts:check
npx prisma generate
npx prisma validate
sh -n scripts/bootstrap-candidate-analysis-roles.sh
sh -n scripts/disable-candidate-analysis-writes.sh
sh -n scripts/enable-candidate-analysis-logins.sh
sh -n scripts/verify-candidate-analysis-roles.sh
node --check scripts/normalize-candidate-postgres-url.mjs
node --check scripts/reject-ambient-candidate-libpq-env.mjs
npx eslint tests/lib/candidate-analysis-schema.test.ts tests/helpers/candidate-analysis-postgres.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/autonomous-analysis-contract.test.ts
npx tsc --noEmit
npm run build
git diff --check
```

Expected: zero candidate or processing failures; any filesystem capability skip must be named and unchanged; Prisma, syntax, lint, TypeScript, build and diff PASS.

- [ ] **Step 6: Run the full repository suite exactly once and classify honestly**

Run:

```bash
npm test
```

Compare exact totals and failure identities with the last established baseline: 2027 total, 2007 pass, 19 known protected/dependent failures and 1 skip. Do not change protected artifacts to force green. Any new failure is a Task 4 blocker.

- [ ] **Step 7: Write the final local evidence report**

Create `.superpowers/sdd/2026-08-19-autonomous-ai-candidate-recovery-quiescence/final-report.md` with:

- exact base and final SHAs;
- task commits;
- every witnessed RED and GREEN command/result;
- PostgreSQL and Node versions;
- exact role/candidate/processing/full-suite totals;
- the database-drain operational cost;
- confirmation that all 11 candidate table snapshots were preserved;
- confirmation that no production database, real credential, live run, push, merge or deploy occurred;
- explicit separation of local verification, CI, deployment, runtime, human review, promotion and external readiness.

- [ ] **Step 8: Self-review, commit Task 4 and verify the final tree**

Review the full implementation range against every section of the approved spec. Then:

```bash
git add knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md tests/lib/autonomous-analysis-contract.test.ts scripts/disable-candidate-analysis-writes.sh
git commit -m "docs: bind candidate recovery operations"
git show --check --stat --oneline HEAD
git status --short
```

Expected: commit contains only the three tracked Task 4 files; ignored SDD evidence remains unstaged; tracked worktree is clean.

Do not call this cycle deploy-complete or production-ready. Hand off the reviewed local branch for the separately authorized next gate.
