# Candidate Semantic Attestation Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the autonomous candidate foundation with current `origin/main` and close the Candidate Canonical JSON v1 and Candidate Security Graph v1 gaps before any production candidate role can be enabled.

**Architecture:** Preserve the append-only candidate tables and audited writer entry points. Make TypeScript and PostgreSQL share one representable JSON domain and UTF-8 canonical ordering, then bind every security-critical database routine and trigger to a repository manifest that bootstrap, enable and verify attest before LOGIN.

**Tech Stack:** TypeScript, Zod, Node.js 24, Prisma 7, PostgreSQL 16, POSIX shell, Node test runner

**Spec:** `docs/superpowers/specs/2026-08-19-autonomous-ai-candidate-semantic-attestation-design.md`

## Global Constraints

- Candidate history is append-only; no update, delete, truncate or backfill.
- Candidate roles write only through exact audited PostgreSQL functions.
- No KI identity receives human-review, promotion, canonical, publication or coverage authority.
- Candidate roles remain `NOLOGIN` until bootstrap, enable and dedicated verification pass.
- JSON/hash parity must hold between Node.js 24 and PostgreSQL 16.
- Production data is not used while implementing or testing this plan.
- Local tests, CI, merge, migration, deploy, role activation and runtime proof are separate gates.

---

### Task 1: Integrate current main without losing either schema line

**Files:**
- Modify: `.github/workflows/schema-migration-guard.yml`
- Modify: `package.json`
- Modify: `prisma/schema.prisma`
- Modify: `tests/lib/schema-migration-guard-workflow.test.ts`

**Interfaces:**
- Consumes: `codex/autonomous-ai-candidate-design` at or after `cce18c2`; current `origin/main`
- Produces: one branch containing both the candidate subsystem and current `LibraryAnalysisRun`/calibration work

- [ ] **Step 1: Refresh and record integration evidence**

```bash
git fetch origin
git status --short --branch
git rev-list --left-right --count origin/main...HEAD
git merge-base origin/main HEAD
```

Expected: clean tracked worktree. The 2026-08-20 snapshot was 56 commits ahead and 20 behind after the design commit.

- [ ] **Step 2: Merge current main**

```bash
git merge --no-ff origin/main
```

Expected conflicts from the preflight are limited to the four files listed above. If the set has drifted, stop and re-audit before resolving.

- [ ] **Step 3: Resolve with additive rules**

```text
schema-migration-guard.yml:
  keep main's current migration/idempotency jobs;
  keep candidate shell syntax and role-contract checks.

package.json:
  keep every current-main script;
  keep knowledge:candidate-contracts:check and candidate:roles:*;
  do not change dependency versions merely to resolve ordering.

prisma/schema.prisma:
  keep current-main LibraryAnalysisRecord and LibraryAnalysisRun;
  keep all Candidate* enums, models, relations, indexes and constraints.

schema-migration-guard-workflow.test.ts:
  retain assertions for both current-main gates and all candidate scripts.
```

- [ ] **Step 4: Verify the integrated schema and scripts**

```bash
npx prisma format
npx prisma validate
node --import=tsx --test tests/lib/schema-migration-guard-workflow.test.ts tests/lib/package-scripts.test.ts
git diff --check
```

Expected: all exit 0.

- [ ] **Step 5: Commit after explicit authorization**

```bash
git add -- .github/workflows/schema-migration-guard.yml package.json prisma/schema.prisma tests/lib/schema-migration-guard-workflow.test.ts
git commit -m "merge: integrate candidate foundation with current main"
```

---

### Task 2: Define the representable Candidate JSON domain in TypeScript

**Files:**
- Modify: `src/lib/knowledge/candidate-analysis-contract.ts`
- Modify: `tests/lib/candidate-analysis-contract.test.ts`

**Interfaces:**
- Consumes: `CandidateJsonValue`
- Produces: `assertCandidateJsonValue(value)`, `compareCandidateJsonKeysUtf8(left, right)`, corrected `canonicalCandidateJson(value)`

- [ ] **Step 1: Write failing Unicode and null-domain tests**

```ts
test('canonical candidate JSON sorts object keys by UTF-8 bytes', () => {
  assert.equal(
    canonicalCandidateJson({ '\uE000': 1, '😀': 2 }),
    '{"\uE000":1,"😀":2}',
  )
})

test('candidate JSON rejects values PostgreSQL JSONB cannot represent', () => {
  assert.throws(() => assertCandidateJsonValue('a\u0000b'), /candidate_json_nul/)
  assert.throws(() => assertCandidateJsonValue('\uD800'), /candidate_json_surrogate/)
  assert.throws(() => assertCandidateJsonValue({ '\uDC00': true }), /candidate_json_surrogate/)
})

test('candidate JSON preserves nested JSON null', () => {
  assert.equal(
    canonicalCandidateJson({ config: null, nested: [null] }),
    '{"config":null,"nested":[null]}',
  )
})
```

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts
```

Expected: FAIL because default JavaScript sorting places `😀` before `\uE000` and invalid strings are accepted.

- [ ] **Step 3: Implement the value-domain guard and UTF-8 comparator**

```ts
function assertUnicodeScalarString(value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)
    if (code === 0) throw new CandidateAnalysisContractError('candidate_json_nul')
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (next < 0xdc00 || next > 0xdfff) {
        throw new CandidateAnalysisContractError('candidate_json_surrogate')
      }
      index += 1
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      throw new CandidateAnalysisContractError('candidate_json_surrogate')
    }
  }
}

export function compareCandidateJsonKeysUtf8(left: string, right: string): number {
  return Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8'))
}
```

Call the scalar guard for every string and object key, reject non-finite numbers, and sort keys with `compareCandidateJsonKeysUtf8`.

- [ ] **Step 4: Run GREEN**

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/autonomous-analysis-contract.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit after explicit authorization**

```bash
git add -- src/lib/knowledge/candidate-analysis-contract.ts tests/lib/candidate-analysis-contract.test.ts
git commit -m "fix: align candidate JSON value domain"
```

---

### Task 3: Make PostgreSQL canonical JSON byte-identical

**Files:**
- Modify: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Modify: `tests/lib/candidate-analysis-schema.test.ts`
- Modify: `tests/lib/candidate-analysis-writer.test.ts`

**Interfaces:**
- Consumes: Candidate Canonical JSON v1 test vectors
- Produces: byte-identical SQL canonicalization and exact JSON-null preservation through both writer functions

- [ ] **Step 1: Add failing cross-layer parity tests**

```ts
const parityValues = [
  null,
  {},
  [],
  { config: null, nested: [null, { ok: true }] },
  { '\uE000': 1, '😀': 2 },
  { quoted: '"\\\n', exponent: 1e21, negativeZero: -0 },
] as const
```

For every value, compare SQL `candidate_canonical_json($1::jsonb)` and `candidate_writer_hash('run-config', $1::jsonb)` with `canonicalCandidateJson` and `candidateAnalysisConfigHash`. Add behavioral cases proving worker `config: null` and reconciler `scope: null` are stored as JSONB `null`, not SQL `NULL`.

- [ ] **Step 2: Run RED against disposable PostgreSQL 16**

```bash
node --import=tsx --test tests/lib/candidate-analysis-writer.test.ts
```

Expected: FAIL on UTF-8 ordering and JSON-null writer behavior.

- [ ] **Step 3: Correct SQL canonicalization and null handling**

Use UTF-8 byte ordering:

```sql
ORDER BY convert_to(item.key, 'UTF8')
```

Hash and insert run config from `write_payload -> 'config'`; hash and insert reconciliation scope from `write_payload -> 'scope'`. Do not use nullable typed-record fields for these values. Explicitly reject SQL `NULL` while preserving JSONB `null`.

- [ ] **Step 4: Run GREEN**

```bash
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts
```

Expected: PASS with identical canonical text and hashes.

- [ ] **Step 5: Commit after explicit authorization**

```bash
git add -- prisma/migrations/20260818_candidate_analysis_foundation/migration.sql tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts
git commit -m "fix: enforce candidate JSON parity in PostgreSQL"
```

---

### Task 4: Add the external Candidate Security Graph manifest

**Files:**
- Create: `scripts/candidate-security-graph.v1.json`
- Modify: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Modify: `tests/lib/candidate-analysis-schema.test.ts`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Produces: `candidate_security_checker_descriptor()`, `candidate_security_graph_descriptor()`, `candidate_security_graph_drift(expected_checker, expected_graph)`
- Manifest: `{ manifestVersion, postgresMajor, ownerPolicy, checkerSha256, graphSha256 }`

- [ ] **Step 1: Write failing manifest and mutation tests**

The strict manifest shape is:

```json
{
  "manifestVersion": "candidate-security-graph-v1",
  "postgresMajor": 16,
  "ownerPolicy": "database_owner",
  "checkerSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "graphSha256": "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
}
```

The repeated `a`/`b` hashes above are schema examples only. Replace them with the two reviewed hashes printed by the disposable PostgreSQL harness in Step 4; never accept these example values in a tracked manifest.

Tests must reject missing/extra fields, wrong PostgreSQL major, malformed hashes, changed writer body, wrong function owner, `SECURITY INVOKER`, changed `search_path`, `PUBLIC EXECUTE`, trigger retargeting, changed timing and an extra custom trigger.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: FAIL because no externally anchored semantic descriptor exists.

- [ ] **Step 3: Implement stable descriptors**

The routine descriptor binds:

```text
schema, name, identity arguments, return type, prokind, language,
prosrc/prosqlbody, owner_is_database_owner, prosecdef, proisstrict,
proleakproof, provolatile, proparallel, sorted proconfig,
PUBLIC execute and candidate-role execute ACLs
```

The trigger descriptor binds:

```text
schema, table, trigger name, tgisinternal, tgenabled, tgtype,
referenced routine identity, tgdeferrable, tginitdeferred,
tgargs, tgattr, tgqual and normalized pg_get_triggerdef
```

Build descriptors with explicit separators and `COLLATE "C"`; hash them with `pgcrypto.digest`, never with the candidate canonical-JSON function being attested.

- [ ] **Step 4: Record reviewed clean hashes**

Use the disposable PostgreSQL harness to print checker and graph descriptors plus SHA-256. Review the descriptor text, then write only the two reviewed hashes to `scripts/candidate-security-graph.v1.json`. Tests must never regenerate or approve the tracked hashes automatically.

- [ ] **Step 5: Run mutation GREEN**

```bash
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: the clean graph passes and every mutation produces its named drift error.

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- scripts/candidate-security-graph.v1.json prisma/migrations/20260818_candidate_analysis_foundation/migration.sql tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "feat: attest candidate database security graph"
```

---

### Task 5: Gate bootstrap, enable and verify on the manifest

**Files:**
- Modify: `scripts/bootstrap-candidate-analysis-roles.sh`
- Modify: `scripts/enable-candidate-analysis-logins.sh`
- Modify: `scripts/verify-candidate-analysis-roles.sh`
- Modify: `tests/lib/candidate-analysis-role-contract.test.ts`

**Interfaces:**
- Consumes: one strict read of `scripts/candidate-security-graph.v1.json`
- Produces: `candidate_security_checker_drift`, `candidate_security_owner_drift`, `candidate_writer_abi_drift`, `candidate_trigger_identity_drift`, `candidate_trigger_function_drift`, `candidate_security_graph_hash_mismatch`

- [ ] **Step 1: Add failing preflight and fail-safe tests**

For bootstrap and enable, prove manifest/checker/graph drift stops before LOGIN or grant repair. For verify, introduce drift after LOGIN and prove bounded fail-safe disable ends with both roles `NOLOGIN`, no writer EXECUTE and all candidate rows preserved.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: FAIL because scripts currently attest names/state, not complete semantics.

- [ ] **Step 3: Implement the strict manifest reader**

The only accepted parsed values are:

```text
manifestVersion=candidate-security-graph-v1
postgresMajor=16
ownerPolicy=database_owner
checkerSha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
graphSha256=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
```

The repeated `a`/`b` values are parser test fixtures only. The production reader must accept any exactly 64-character lowercase hexadecimal value and compare it with the reviewed tracked manifest.

Read once before database mutation, reject extra keys and pass only these non-secret values to `psql`. Preserve existing protected URL/PGPASS handling.

- [ ] **Step 4: Attest at each mutation boundary**

Bootstrap performs read-only preflight and repeats attestation inside the catalog-locked transaction before grant repair. Enable attests before either role receives LOGIN. Verify checks target identity, checker, graph, ACLs and negative probes; post-LOGIN failure invokes the existing target-bound fail-safe disable.

- [ ] **Step 5: Run GREEN and syntax checks**

```bash
sh -n scripts/bootstrap-candidate-analysis-roles.sh
sh -n scripts/enable-candidate-analysis-logins.sh
sh -n scripts/verify-candidate-analysis-roles.sh
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit after explicit authorization**

```bash
git add -- scripts/bootstrap-candidate-analysis-roles.sh scripts/enable-candidate-analysis-logins.sh scripts/verify-candidate-analysis-roles.sh tests/lib/candidate-analysis-role-contract.test.ts
git commit -m "fix: gate candidate role activation on semantic attestation"
```

---

### Task 6: Update the durable authority contract and errata

**Files:**
- Modify: `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md`
- Modify: `tests/lib/autonomous-analysis-contract.test.ts`

**Interfaces:**
- Produces: load-bearing prose for JSON parity, security graph attestation, drift recovery and unchanged human/external stoplines

- [ ] **Step 1: Write failing contract tests**

Require explicit statements that Candidate Canonical JSON v1 is identical in TypeScript/PostgreSQL; recovery attests bodies, owners, ACLs and trigger semantics; bootstrap/enable never repair drifted code; roles stay disabled until a migration repair and full recovery pass; and technical candidate readiness creates no human review, promotion or external readiness. Require errata for target-rebinding proof and mixed-case schema coverage.

- [ ] **Step 2: Run RED**

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
```

- [ ] **Step 3: Update the contract append-only**

Append a versioned semantic-attestation section and errata. Preserve existing authority definitions and the disabled-state recovery chain; do not rewrite historical evidence silently.

- [ ] **Step 4: Run GREEN**

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
```

- [ ] **Step 5: Commit after explicit authorization**

```bash
git add -- knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md tests/lib/autonomous-analysis-contract.test.ts
git commit -m "docs: bind candidate semantic attestation contract"
```

---

### Task 7: Run the candidate foundation completion gate

**Files:**
- Verify only: complete candidate-foundation diff

**Interfaces:**
- Produces: local implementation and security evidence only

- [ ] **Step 1: Run focused candidate and processing suites**

```bash
npm run knowledge:candidate-contracts:check
npm run knowledge:processing-contracts:check
npx prisma generate
npx prisma validate
node --import=tsx --test tests/lib/schema-migration-guard-workflow.test.ts
```

Expected: 0 failures. Pre-plan candidate baseline: 194 pass, 0 fail, 1 filesystem-dependent skip.

- [ ] **Step 2: Run repository gates**

```bash
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short --branch
```

Expected: all validation commands exit 0. Inspect build-generated chart-metric timestamps and remove only out-of-scope generated churn.

- [ ] **Step 3: Run full tests once with a hashbound log**

```bash
log_path="$(mktemp -t candidate-semantic-attestation.XXXXXX.log)"
npm test >"$log_path" 2>&1
test_code=$?
shasum -a 256 "$log_path"
tail -n 80 "$log_path"
exit "$test_code"
```

Expected: 0 failures. Report any protected baseline failure honestly; never change protected hashes merely to obtain green.

- [ ] **Step 4: Review the complete diff**

```bash
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --check
git status --short --branch
```

Expected: no unrelated changes and candidate roles still unactivated. Push, PR, merge, migration, deploy and role activation require their own authorization and evidence.
