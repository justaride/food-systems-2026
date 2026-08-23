# Autonomous AI Candidate Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build delivery 1 of the autonomous AI architecture: a production-safe, append-only candidate ledger with explicit machine/review/promotion boundaries, scoped database roles, conservative legacy projection, and a machine-readable control snapshot contract.

**Architecture:** Add a new candidate subsystem beside the existing canonical and `LibraryAnalysisRecord` models. Candidate workers can append runs, events, artifacts, assertions, evidence, and dependencies through validated repository functions, but database ACLs prevent them from writing human decisions or canonical domain tables. Existing strict source analysis remains a high-assurance workflow; the new workflow permits candidate analysis from stable bytes with exact, provisional, or unresolved identity and never grants promotion authority.

**Tech Stack:** TypeScript, Node.js 24, Zod 4, Prisma 7, PostgreSQL, `node:test`, AJV 2020, POSIX shell, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`

## Global Constraints

- This plan implements **delivery 1 only**. Do not add autonomous source adapters, review UI, `/masterhjerne` UI changes, promotion execution, or the milk/meat pilot.
- Candidate results may live in the production database, but this delivery must not start an autonomous production run or deploy new worker credentials.
- Candidate history, human decisions, and promotion receipts are append-only. Corrections create new rows that supersede earlier rows.
- Candidate worker credentials must have no effective write path to human-review, promotion, canonical claim/entity/coverage/publication, or unrelated tables.
- Identity confidence, evidence level, machine state, human review state, and target-specific promotion state remain independent.
- Machine confidence and model consensus never grant human or publication authority.
- Database hash columns use bare lowercase SHA-256 (`^[a-f0-9]{64}$`) to match existing database conventions. Protocol artifacts may use `sha256:` prefixes; conversion strips the prefix at the database boundary.
- Preserve Gate 2C v1 artifacts and existing migration files byte-for-byte. Add only forward migrations.
- Preserve the current strict `workflow.full_source_analysis.v1` semantics. Label it as a high-assurance profile and add a separate candidate workflow.
- Add no runtime dependency. Use the repository's existing Zod, AJV, Prisma, `pg`, and Node libraries.
- Generated Prisma client files stay ignored and are produced with `npm run db:generate`; never commit them.
- Operational shell scripts must use `#!/bin/sh`, `set -eu`, private `PGPASSFILE`, and explicit `--apply` acknowledgement for mutations. Secrets must not appear in argv or logs.
- Work only in the isolated worktree and branch created for this feature; preserve unrelated checkout changes.

---

## File Structure

### New contract and documentation files

- `AGENTS.md` — concise repository-wide authority, generated-artifact, and verification rules.
- `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` — canonical candidate/review/promotion authority contract.
- `knowledge/corpus/workflows/candidate-analysis-v1.md` — autonomous candidate-only workflow; separate from strict verified-source analysis.
- `tests/lib/autonomous-analysis-contract.test.ts` — locks terminology and the no-promotion boundary.

### New domain and storage files

- `src/lib/knowledge/candidate-analysis-contract.ts` — strict input schemas, hashes, event transitions, and shared candidate types; no database access.
- `src/lib/knowledge/candidate-analysis-writer.ts` — the only application-level append API for workers and reconcilers.
- `src/lib/knowledge/library-analysis-candidate-compat.ts` — conservative read-time projection from legacy `LibraryAnalysisRecord` rows.
- `src/lib/knowledge/candidate-control-snapshot.ts` — pure control-snapshot builder and validator.
- `tests/fixtures/candidate-analysis-fixture.ts` — one reusable exact fixture shared by candidate tests.
- `tests/helpers/candidate-analysis-postgres.ts` — disposable PostgreSQL helper for migration, writer, and ACL integration tests.

### New database and operations files

- `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql` — candidate tables, constraints, immutable triggers, and fail-closed PUBLIC ACLs.
- `scripts/bootstrap-candidate-analysis-roles.sh` — creates/rotates scoped worker and reconciler logins after explicit acknowledgement.
- `scripts/disable-candidate-analysis-writes.sh` — fail-safe rollback that blocks both candidate logins and terminates their active sessions without deleting history.
- `scripts/verify-candidate-analysis-roles.sh` — proves exact effective privileges using the dedicated logins.
- `scripts/knowledge/export-candidate-control-snapshot.ts` — DB-backed CLI; stdout by default, explicit output path when requested.
- `knowledge/schema/candidate-control-snapshot.schema.v1.json` — portable snapshot contract.

### New tests

- `tests/lib/candidate-analysis-contract.test.ts`
- `tests/lib/candidate-analysis-schema.test.ts`
- `tests/lib/candidate-analysis-writer.test.ts`
- `tests/lib/candidate-analysis-role-contract.test.ts`
- `tests/lib/library-analysis-candidate-compat.test.ts`
- `tests/lib/candidate-control-snapshot.test.ts`

### Existing files modified

- `prisma/schema.prisma` — new enums and candidate models after `LibraryAnalysisRecord`.
- `knowledge/review/REVIEW-LAYER-CONTRACT.md` — candidate database presence is not owner review.
- `knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md` — dual workflow profiles and stable-byte candidate eligibility.
- `knowledge/corpus/workflows/source-analysis-v1.md` — identify the workflow as high-assurance, not the only candidate route.
- `.claude/database.md` — generated schema dictionary pointer and candidate authority summary.
- `.claude/research-workflows.md` — autonomous candidate workflow and later human-review boundary.
- `.claude/data-imports.md` — prohibit generic upsert/update patterns for candidate history.
- `package.json` — candidate contract, role verification, and control snapshot commands.
- `.github/workflows/schema-migration-guard.yml` — validate the new shell and database contracts.
- `tests/lib/schema-migration-guard-workflow.test.ts` — lock CI inclusion.
- `tests/lib/package-scripts.test.ts` — lock package commands.

---

### Task 1: Lock the authority contract and dual workflow model

**Files:**

- Create: `AGENTS.md`
- Create: `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md`
- Create: `knowledge/corpus/workflows/candidate-analysis-v1.md`
- Create: `tests/lib/autonomous-analysis-contract.test.ts`
- Modify: `knowledge/review/REVIEW-LAYER-CONTRACT.md`
- Modify: `knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md`
- Modify: `knowledge/corpus/workflows/source-analysis-v1.md`
- Modify: `.claude/database.md`
- Modify: `.claude/research-workflows.md`
- Modify: `.claude/data-imports.md`

**Interfaces:**

- Produces workflow ID `workflow.candidate_analysis.v1`, version `1.0.0`.
- Produces three authority terms used by all later tasks: `candidate`, `human_review`, `promotion`.
- Produces the rule: stable, readable, hash-bound bytes permit candidate analysis; identity confidence constrains later promotion.
- Preserves `workflow.full_source_analysis.v1` as the exact-identity high-assurance profile.

- [ ] **Step 1: Write the failing documentation-contract test**

```ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const read = (path: string) => readFileSync(path, 'utf8')

test('autonomous analysis is permissive at candidate creation and strict at authority promotion', () => {
  const root = read('AGENTS.md')
  const contract = read('knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md')
  const protocol = read('knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md')
  const candidateWorkflow = read('knowledge/corpus/workflows/candidate-analysis-v1.md')
  const strictWorkflow = read('knowledge/corpus/workflows/source-analysis-v1.md')

  assert.match(root, /KI may append candidate-only analysis/i)
  assert.match(contract, /confidence is not authority/i)
  assert.match(contract, /exact \| provisional \| unresolved/)
  assert.match(protocol, /stable, readable and hash-bound input/i)
  assert.match(candidateWorkflow, /Workflow ID: `workflow\.candidate_analysis\.v1`/)
  assert.match(candidateWorkflow, /must not create or modify human review, canonical data, publication or coverage/i)
  assert.match(strictWorkflow, /high-assurance profile/i)
  assert.match(strictWorkflow, /not the only permitted candidate-analysis route/i)
})

test('legacy guides reject generic mutable writes for candidate history', () => {
  const database = read('.claude/database.md')
  const research = read('.claude/research-workflows.md')
  const imports = read('.claude/data-imports.md')

  assert.match(database, /CandidateAnalysisRun/)
  assert.match(research, /workflow\.candidate_analysis\.v1/)
  assert.match(imports, /never use generic upsert or update for candidate history/i)
})
```

- [ ] **Step 2: Run the test and verify the missing files/phrases fail**

Run:

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
```

Expected: FAIL because `AGENTS.md`, the candidate contract, and the candidate workflow do not exist.

- [ ] **Step 3: Add the repository authority contract**

`AGENTS.md` must contain these exact operational rules, compactly:

```markdown
# Food Systems 2026 agent rules

## Authority boundary

- KI may append candidate-only analysis to the candidate subsystem.
- KI may not record human review, promote canonical data, publish, or change coverage readiness.
- Confidence is not authority. Model agreement does not satisfy a human gate.
- Human review and every promotion are bound to exact candidate, evidence, source-content, policy, and target-profile hashes.

## Write paths

- Candidate history is append-only. Use `src/lib/knowledge/candidate-analysis-writer.ts`.
- Never use generic upsert, update, delete, or generic or mutating raw SQL against candidate history. The writer's only raw SQL is narrow and parameterized: transaction-scoped advisory locking plus the read-only recursive dependency-integrity query.
- Generated snapshots are regenerated through their named scripts; never hand-edit them.

## Verification

- Distinguish local tests, CI, migration, deployment, runtime SHA, authenticated UI, and external human authority.
- Never report a later gate as complete from evidence for an earlier gate.
```

Create `knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md` with the headings `Purpose`, `Authority layers`, `Analysis eligibility`, `Independent status axes`, `Recursive machine use`, `Database roles`, `Human boundary`, `Promotion stopline`, and `Operational reporting`. State explicitly:

```markdown
Identity confidence is one of `exact | provisional | unresolved`. All three may enter candidate analysis when the exact bytes or records consumed are stable, readable and hash-bound. Identity confidence travels with every result. It changes which later target profiles may promote the result; it does not create a human precondition for machine reading.

Confidence is not authority. Repetition, reconciliation, model agreement and high confidence may affect prioritization but never change human-review or promotion state.
```

- [ ] **Step 4: Add the candidate workflow and update existing guides**

`knowledge/corpus/workflows/candidate-analysis-v1.md` must define:

```markdown
# Candidate analysis workflow v1

Workflow ID: `workflow.candidate_analysis.v1`

Workflow version: `1.0.0`

Status: autonomous internal workflow; candidate-only output

## Minimum input gate

The coordinator must bind stable input bytes or records, their SHA-256, the source identity key, identity confidence (`exact`, `provisional` or `unresolved`), this workflow version, prompt/configuration hashes and every content-unit locator consumed.

## Flexible execution

Runs may be parallel, partial, retried or model-specific. Each run has its own immutable event sequence. A workflow declares its required outputs; there is no global requirement that every run execute the same stage list exactly once.

## Output boundary

Every output remains `candidate`. The workflow must not create or modify human review, canonical data, publication or coverage. Missing owner review, rights or publication authority is expected downstream state and is not an analysis error.
```

Update `SOURCE-ANALYSIS-PROTOCOL.md` to show two profiles: candidate analysis from stable bytes and high-assurance verified analysis. Add one short note to `source-analysis-v1.md`; do not weaken its existing exact checks. Update the review contract and `.claude` guides with pointers to the new canonical contract and the append-only writer.

- [ ] **Step 5: Run the documentation contract test**

Run:

```bash
node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts
```

Expected: PASS, 2 tests, 0 failures.

- [ ] **Step 6: Commit the authority contract**

```bash
git add AGENTS.md knowledge/candidates/AUTONOMOUS-ANALYSIS-CONTRACT.md knowledge/corpus/workflows/candidate-analysis-v1.md knowledge/review/REVIEW-LAYER-CONTRACT.md knowledge/corpus/SOURCE-ANALYSIS-PROTOCOL.md knowledge/corpus/workflows/source-analysis-v1.md .claude/database.md .claude/research-workflows.md .claude/data-imports.md tests/lib/autonomous-analysis-contract.test.ts
git commit -m "docs: define autonomous candidate authority boundary"
```

---

### Task 2: Implement strict candidate contracts and event-state derivation

**Files:**

- Create: `src/lib/knowledge/candidate-analysis-contract.ts`
- Create: `tests/fixtures/candidate-analysis-fixture.ts`
- Create: `tests/lib/candidate-analysis-contract.test.ts`

**Interfaces:**

- Produces `CANDIDATE_ANALYSIS_SCHEMA_VERSION = 'candidate-analysis-v1'`.
- Produces `CandidateContentUnitInputSchema`, `CandidateAnalysisRunContentInputSchema`, `CandidateAnalysisRunInputSchema`, `CandidateAnalysisRunEventInputSchema`, `CandidateAnalysisArtifactInputSchema`, `CandidateAssertionInputSchema`, `CandidateEvidenceLinkInputSchema`, `CandidateDependencyInputSchema`, and `CandidateReconciliationSnapshotInputSchema`.
- Produces inferred TypeScript types with the same names minus `Schema`.
- Produces `candidateAnalysisSha256(domain: string, value: CandidateJsonValue): string` returning a bare 64-character hash.
- Produces `deriveCandidateAnalysisMachineState(events: CandidateAnalysisRunEventInput[]): CandidateAnalysisMachineState`.
- Produces `CandidateAnalysisContractError` with stable error codes.

- [ ] **Step 1: Write failing tests for strict schemas, hashes, and transitions**

```ts
test('accepts exact, provisional and unresolved identity without authority promotion', () => {
  for (const identityConfidence of ['exact', 'provisional', 'unresolved'] as const) {
    const fixture = candidateAnalysisFixture({ identityConfidence })
    assert.equal(CandidateAssertionInputSchema.parse(fixture.assertion).promotionState, 'candidate')
  }
})

test('rejects review and publication fields in machine payloads', () => {
  const fixture = candidateAnalysisFixture()
  assert.throws(
    () => CandidateAssertionInputSchema.parse({
      ...fixture.assertion,
      humanReviewed: true,
      externalReady: true,
    }),
    /unrecognized/i,
  )
})

test('allows repeated checkpoints but rejects gaps and post-terminal writes', () => {
  const fixture = candidateAnalysisFixture()
  assert.equal(deriveCandidateAnalysisMachineState([
    fixture.events.queued,
    fixture.events.started,
    fixture.events.checkpoint1,
    fixture.events.checkpoint2,
    fixture.events.completed,
  ]), 'candidate_complete')
  assert.throws(() => deriveCandidateAnalysisMachineState([
    fixture.events.queued,
    { ...fixture.events.completed, sequence: 3 },
  ]), /event_sequence_gap/)
  assert.throws(() => deriveCandidateAnalysisMachineState([
    fixture.events.queued,
    fixture.events.started,
    fixture.events.completed,
    { ...fixture.events.checkpoint1, sequence: 4 },
  ]), /event_after_terminal_state/)
})

test('canonical hashing ignores object key insertion order', () => {
  assert.equal(
    candidateAnalysisSha256('test', { a: 1, b: 2 }),
    candidateAnalysisSha256('test', { b: 2, a: 1 }),
  )
})
```

- [ ] **Step 2: Run the test and verify the module is missing**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts
```

Expected: FAIL with module-not-found for `candidate-analysis-contract`.

- [ ] **Step 3: Define the exact enums and strict Zod inputs**

Use these literal sets:

```ts
export const CANDIDATE_IDENTITY_CONFIDENCE = ['exact', 'provisional', 'unresolved'] as const
export const CANDIDATE_EVIDENCE_LEVELS = ['exact_locator', 'partial_locator', 'no_locator'] as const
export const CANDIDATE_MACHINE_USES = ['candidate_only', 'reusable_for_ai_context', 'quarantined'] as const
export const CANDIDATE_RUN_EVENT_TYPES = [
  'queued', 'started', 'checkpoint', 'candidate_completed', 'partial_completed',
  'failed', 'blocked_input', 'quarantined', 'superseded',
] as const
export const CANDIDATE_ASSERTION_TYPES = [
  'claim', 'classification', 'entity_link', 'relationship',
  'quantitative_observation', 'coverage_signal', 'gap', 'contradiction',
  'source_role_suggestion',
] as const
export const CANDIDATE_EVIDENCE_RELATIONS = ['supports', 'contradicts', 'contextualizes'] as const
export const CANDIDATE_PROMOTION_STATES = [
  'candidate', 'internal_curated', 'external_eligible', 'published', 'revoked',
] as const
export const CANDIDATE_REVIEW_DECISIONS = [
  'accepted', 'accepted_with_edits', 'rejected', 'deferred', 'rerun_requested',
] as const
```

Every input schema must be `.strict()`. Hash fields use `/^[a-f0-9]{64}$/`; identifiers use `/^[a-z0-9][a-z0-9._:-]*$/`; confidence is `z.number().min(0).max(1).nullable()`. `CandidateAnalysisRunContentInputSchema` contains exactly `contentUnitId`, zero-based `position`, and `inputHash`; `CandidateAnalysisRunInputSchema` contains a nonempty `inputs` array of that schema so a run and its immutable input envelope are created together. `CandidateAssertionInputSchema` contains `promotionState: z.literal('candidate')` and no review fields. `CandidateDependencyInputSchema` contains dependent/upstream assertion IDs, relation, and the complete sorted/deduplicated `inheritedLimitations` list. `CandidateReconciliationSnapshotInputSchema` contains a nonnegative `conflictCount` in addition to its hash-bound payload.

- [ ] **Step 4: Implement canonical hashing and the event reducer**

```ts
export type CandidateJsonValue = null | boolean | number | string | CandidateJsonValue[] | { [key: string]: CandidateJsonValue }

export function canonicalCandidateJson(value: CandidateJsonValue): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalCandidateJson).join(',')}]`
  return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonicalCandidateJson(value[key]!)}`).join(',')}}`
}

export function candidateAnalysisSha256(domain: string, value: CandidateJsonValue): string {
  return createHash('sha256').update(`food-systems/${domain}/v1\n`).update(canonicalCandidateJson(value)).digest('hex')
}
```

The reducer requires contiguous sequences beginning at 1 with `queued`, permits repeated `checkpoint` events while running, maps `candidate_completed` to `candidate_complete` and `partial_completed` to `partial`, and rejects any event after a terminal state except `superseded` after `candidate_complete` or `partial`.

- [ ] **Step 5: Build one reusable exact fixture and rerun tests**

The fixture must expose:

```ts
export function candidateAnalysisFixture(
  overrides: {
    identityConfidence?: CandidateIdentityConfidence
    contentUnitId?: string
    runId?: string
    assertionId?: string
    idempotencyKey?: string
    attempt?: number
    predecessorRunId?: string | null
  } = {},
): {
  contentUnit: CandidateContentUnitInput
  run: CandidateAnalysisRunInput
  events: Record<'queued' | 'started' | 'checkpoint1' | 'checkpoint2' | 'completed', CandidateAnalysisRunEventInput>
  artifact: CandidateAnalysisArtifactInput
  assertion: CandidateAssertionInput
  evidenceLink: CandidateEvidenceLinkInput
}
```

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts
```

Expected: PASS, including all three identity-confidence values and the transition failures.

- [ ] **Step 6: Commit the pure contract**

```bash
git add src/lib/knowledge/candidate-analysis-contract.ts tests/fixtures/candidate-analysis-fixture.ts tests/lib/candidate-analysis-contract.test.ts
git commit -m "feat: add autonomous candidate contracts"
```

---

### Task 3: Add the candidate schema, forward migration, and immutable database guards

**Files:**

- Create: `prisma/migrations/20260818_candidate_analysis_foundation/migration.sql`
- Create: `tests/helpers/candidate-analysis-postgres.ts`
- Create: `tests/lib/candidate-analysis-schema.test.ts`
- Modify: `prisma/schema.prisma:298`

**Interfaces:**

- Produces Prisma models `CandidateContentUnit`, `CandidateAnalysisRun`, `CandidateAnalysisRunInput`, `CandidateAnalysisRunEvent`, `CandidateAnalysisArtifact`, `CandidateAssertion`, `CandidateEvidenceLink`, `CandidateDependency`, `CandidateReconciliationSnapshot`, `CandidateHumanReviewDecision`, and `CandidatePromotionDecision`.
- Produces matching Prisma enums from Task 2 literal sets plus `CandidateContentUnitType`.
- Produces SQL function `public.reject_candidate_history_change()` and update/delete/truncate triggers on all eleven tables.
- `tests/helpers/candidate-analysis-postgres.ts` produces `withCandidateAnalysisPostgres(t, callback)` and applies only the new self-contained migration to a disposable database.

- [ ] **Step 1: Write the failing schema/migration tests**

```ts
test('models independent machine, review and target-specific promotion history', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  for (const model of [
    'CandidateContentUnit', 'CandidateAnalysisRun', 'CandidateAnalysisRunInput',
    'CandidateAnalysisRunEvent', 'CandidateAnalysisArtifact', 'CandidateAssertion',
    'CandidateEvidenceLink', 'CandidateDependency', 'CandidateReconciliationSnapshot',
    'CandidateHumanReviewDecision', 'CandidatePromotionDecision',
  ]) assert.match(schema, new RegExp(`model ${model} \\{`))

  const promotion = modelBlock(schema, 'CandidatePromotionDecision')
  assert.match(promotion, /targetProfile\s+String/)
  assert.match(promotion, /state\s+CandidatePromotionState/)
  assert.doesNotMatch(modelBlock(schema, 'CandidateAssertion'), /reviewed|published|externalReady/i)
})

test('migration makes every candidate history table immutable and private from PUBLIC', () => {
  const sql = readFileSync('prisma/migrations/20260818_candidate_analysis_foundation/migration.sql', 'utf8')
  assert.match(sql, /CREATE FUNCTION public\.reject_candidate_history_change\(\)/)
  assert.equal((sql.match(/reject_update_delete/g) ?? []).length, 11)
  assert.equal((sql.match(/reject_truncate/g) ?? []).length, 11)
  assert.equal((sql.match(/REVOKE ALL PRIVILEGES ON TABLE/g) ?? []).length, 11)
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts
```

Expected: FAIL because the models and migration are absent.

- [ ] **Step 3: Add the exact Prisma enums and models**

Add these content-unit types:

```prisma
enum CandidateContentUnitType {
  pdf_page
  document_section
  web_section
  slide
  sheet_range
  transcript_segment
  database_record
  dataset_slice
  media_segment
}
```

Use these required fields and keys:

| Model | Required fields | Required uniqueness/indexes |
|---|---|---|
| `CandidateContentUnit` | `id`, `sourceKind`, `sourceKey`, `sourceVersionHash`, `unitType`, `ordinal`, `locator`, `locatorHash`, `contentHash`, `hashAlgorithm`, `identityConfidence`, `createdAt` | unique source kind/key/version/type/ordinal; indexes on source key and content hash |
| `CandidateAnalysisRun` | workflow/model/prompt/config/input hashes, `purpose`, `outputProfile`, `workerId`, unique `idempotencyKey`, `attempt`, optional predecessor, `createdAt` | unique idempotency key; workflow and created-at indexes |
| `CandidateAnalysisRunInput` | `id`, `runId`, `contentUnitId`, `position`, `inputHash`, `createdAt` | unique run/position and run/content-unit |
| `CandidateAnalysisRunEvent` | `id`, `runId`, `sequence`, enum `eventType`, optional `payload`, `eventHash`, `recordedAt` | unique run/sequence and run/event-hash |
| `CandidateAnalysisArtifact` | `id`, `runId`, `artifactType`, `schemaVersion`, `payload`, `payloadHash`, `createdAt` | unique run/payload-hash |
| `CandidateAssertion` | `id`, `runId`, enum `assertionType`, `schemaVersion`, `payload`, `payloadHash`, nullable confidence, `machineUse`, identity confidence, evidence level, limitations, optional superseded assertion, `createdAt` | unique run/payload-hash; indexes on all status dimensions |
| `CandidateEvidenceLink` | assertion/content-unit FKs, evidence relation, `locator`, `locatorHash`, optional excerpt hash, `createdAt` | unique assertion/content-unit/relation/locator-hash |
| `CandidateDependency` | assertion and upstream assertion FKs, `relation`, inherited limitations, `createdAt` | unique assertion/upstream/relation; SQL check prevents direct self-edge |
| `CandidateReconciliationSnapshot` | `id`, `runId`, `scopeHash`, `payload`, `payloadHash`, nonnegative `conflictCount`, `createdAt` | unique run/payload-hash |
| `CandidateHumanReviewDecision` | assertion, decision enum, `reviewProfile`, `reviewProfileHash`, reviewer/authority, `assertionPayloadHash`, `sourceContentSetHash`, `evidenceSetHash`, limitations, optional edited payload plus edited-payload hash, optional superseded decision, `createdAt` | indexes on assertion, decision, review profile |
| `CandidatePromotionDecision` | assertion, review decision, target profile, promotion state, policy version, preconditions hash, target refs, result, operator/authority, optional superseded decision, `createdAt` | indexes on assertion, target profile/state |

Every foreign key uses `onDelete: Restrict, onUpdate: Restrict`. Every ID is `String @id @default(cuid())`. Use self-relation names explicitly so Prisma validates.

- [ ] **Step 4: Create the forward migration with database constraints**

Generate or write the base enum/table/index SQL, then add:

```sql
CREATE FUNCTION public.reject_candidate_history_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $function$
BEGIN
  RAISE EXCEPTION '% is immutable: % is not permitted', TG_TABLE_NAME, TG_OP;
END
$function$;

REVOKE ALL ON FUNCTION public.reject_candidate_history_change() FROM PUBLIC;
```

For every new table, revoke `PUBLIC`, attach row-level update/delete and statement-level truncate triggers, and use `ON DELETE RESTRICT ON UPDATE RESTRICT`. Add SQL checks for all hash fields, confidence range, positive attempt, nonnegative input position, nonempty actor/authority fields, and `assertionId <> upstreamAssertionId`.

Do not create login roles in the migration. Role creation belongs to Task 5 because production migrations may run without `CREATEROLE`.

- [ ] **Step 5: Add the disposable PostgreSQL helper and live database assertions**

`withCandidateAnalysisPostgres` must:

```ts
export type CandidateAnalysisPostgresContext = {
  adminUrl: string
  database: string
  port: number
  psql(sql: string, user?: string): SpawnSyncReturns<string>
}

export async function withCandidateAnalysisPostgres(
  t: TestContext,
  callback: (context: CandidateAnalysisPostgresContext) => Promise<void>,
): Promise<void>
```

It detects `POSTGRES_BINDIR` or `pg_config --bindir`, skips with a precise message when server binaries are unavailable, initializes with trust auth, starts on a reserved port, applies the candidate migration with `psql -v ON_ERROR_STOP=1`, and always stops/removes the temporary cluster.

Extend the schema test to insert one complete synthetic chain as admin, then prove update, delete, and truncate each fail. Prove invalid hashes, confidence above 1, and a direct dependency self-edge fail. Query `information_schema.role_table_grants` to prove `PUBLIC` has no grants on new tables.

- [ ] **Step 6: Generate Prisma and run schema plus migration tests**

Run:

```bash
npm run db:generate
DATABASE_URL=postgresql://ci:ci@db.invalid:5432/foodsystems_ci?schema=public ./node_modules/.bin/prisma validate --schema prisma/schema.prisma
node --import=tsx --test tests/lib/candidate-analysis-schema.test.ts
```

Expected: Prisma validation passes; the test passes or reports only the explicit PostgreSQL-binary skip.

- [ ] **Step 7: Commit the schema foundation**

```bash
git add prisma/schema.prisma prisma/migrations/20260818_candidate_analysis_foundation/migration.sql tests/helpers/candidate-analysis-postgres.ts tests/lib/candidate-analysis-schema.test.ts
git commit -m "feat: add immutable candidate analysis schema"
```

---

### Task 4: Implement the validated append-only worker and reconciler writers

**Files:**

- Create: `src/lib/knowledge/candidate-analysis-writer.ts`
- Create: `tests/lib/candidate-analysis-writer.test.ts`

**Interfaces:**

- Produces `createCandidateAnalysisWriter(prisma: PrismaClient): CandidateAnalysisWriter`.
- `CandidateAnalysisWriter` methods: `createRun`, `appendRunEvent`, `appendArtifact`, `appendAssertion`, `appendEvidenceLink`, `appendDependency`.
- Produces `createCandidateReconciliationWriter(prisma: PrismaClient): CandidateReconciliationWriter` with only `appendSnapshot`.
- Produces `CandidateAnalysisWriteConflict` with codes `idempotency_conflict`, `event_sequence_conflict`, `terminal_output_missing`, `dependency_cycle`, `upstream_authority_upgrade`, and `immutable_history_conflict`.
- Consumes all schemas and hashes from Task 2 and Prisma models from Task 3.

- [ ] **Step 1: Write failing tests for the writer boundary**

Use the disposable PostgreSQL helper and real Prisma client. Implement these exact cases:

```ts
test('an unresolved source can complete a candidate run without review rows', async t => {
  await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
    const prisma = candidatePrisma(adminUrl)
    const fixture = candidateAnalysisFixture({ identityConfidence: 'unresolved' })
    await seedContentUnit(prisma, fixture.contentUnit)
    const writer = createCandidateAnalysisWriter(prisma)
    await writer.createRun(fixture.run)
    await writer.appendRunEvent(fixture.events.queued)
    await writer.appendRunEvent(fixture.events.started)
    await writer.appendArtifact(fixture.artifact)
    await writer.appendAssertion(fixture.assertion)
    await writer.appendEvidenceLink(fixture.evidenceLink)
    await writer.appendRunEvent(fixture.events.completed)

    assert.equal(await prisma.candidateHumanReviewDecision.count(), 0)
    assert.equal(await prisma.candidatePromotionDecision.count(), 0)
  })
})

test('completion fails without an artifact and assertion', async t => {
  await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
    const prisma = candidatePrisma(adminUrl)
    const fixture = candidateAnalysisFixture()
    await seedContentUnit(prisma, fixture.contentUnit)
    const writer = createCandidateAnalysisWriter(prisma)
    await writer.createRun(fixture.run)
    await writer.appendRunEvent(fixture.events.queued)
    await writer.appendRunEvent(fixture.events.started)
    await assert.rejects(
      writer.appendRunEvent(fixture.events.completed),
      (error: unknown) => hasCandidateWriteConflictCode(error, 'terminal_output_missing'),
    )
  })
})

test('retries use a new run while an identical idempotency key is rejected', async t => {
  await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
    const prisma = candidatePrisma(adminUrl)
    const original = candidateAnalysisFixture()
    await seedContentUnit(prisma, original.contentUnit)
    const writer = createCandidateAnalysisWriter(prisma)
    await writer.createRun(original.run)
    await assert.rejects(
      writer.createRun(original.run),
      (error: unknown) => hasCandidateWriteConflictCode(error, 'idempotency_conflict'),
    )
    const retry = candidateAnalysisFixture({
      runId: 'run:retry:2',
      idempotencyKey: 'candidate:retry:2',
      attempt: 2,
      predecessorRunId: original.run.id,
    })
    assert.deepEqual(await writer.createRun(retry.run), { runId: retry.run.id, created: true })
  })
})

test('dependency cycles are rejected without deleting either candidate', async t => {
  await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
    const prisma = candidatePrisma(adminUrl)
    const { writer, assertionA, assertionB } = await seedTwoAssertions(prisma)
    await writer.appendDependency(dependencyInput(assertionA, assertionB))
    await assert.rejects(
      writer.appendDependency(dependencyInput(assertionB, assertionA)),
      (error: unknown) => hasCandidateWriteConflictCode(error, 'dependency_cycle'),
    )
    assert.equal(await prisma.candidateAssertion.count(), 2)
    assert.equal(await prisma.candidateDependency.count(), 1)
  })
})

test('recursive candidates cannot silently strengthen upstream authority', async t => {
  await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
    const prisma = candidatePrisma(adminUrl)
    const { writer, strongerDependent, unresolvedUpstream } = await seedAuthorityMismatchAssertions(prisma)
    await assert.rejects(
      writer.appendDependency(dependencyInput(strongerDependent, unresolvedUpstream)),
      (error: unknown) => hasCandidateWriteConflictCode(error, 'upstream_authority_upgrade'),
    )
    assert.equal(await prisma.candidateDependency.count(), 0)
  })
})
```

- [ ] **Step 2: Run the tests and verify the writer module is missing**

Run:

```bash
npm run db:generate
node --import=tsx --test tests/lib/candidate-analysis-writer.test.ts
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement validated run creation and append methods**

The public shape must be:

```ts
export type CandidateAnalysisWriter = {
  createRun(input: CandidateAnalysisRunInput): Promise<{ runId: string; created: true }>
  appendRunEvent(input: CandidateAnalysisRunEventInput): Promise<{ runId: string; sequence: number; state: CandidateAnalysisMachineState }>
  appendArtifact(input: CandidateAnalysisArtifactInput): Promise<{ artifactId: string }>
  appendAssertion(input: CandidateAssertionInput): Promise<{ assertionId: string }>
  appendEvidenceLink(input: CandidateEvidenceLinkInput): Promise<{ evidenceLinkId: string }>
  appendDependency(input: CandidateDependencyInput): Promise<{ dependencyId: string }>
}

export type CandidateReconciliationWriter = {
  appendSnapshot(input: CandidateReconciliationSnapshotInput): Promise<{ snapshotId: string }>
}
```

Each method parses with its strict Zod schema before database access. Map `P2002` to a stable conflict code. Do not expose a generic `update`, `delete`, `upsert`, or raw-query method.

- [ ] **Step 4: Serialize run events and enforce terminal-output checks**

`appendRunEvent` uses a Serializable transaction and the same domain-separated transaction-scoped advisory run lock used by every output append method. Advisory locking is required because the exact worker and reconciler roles intentionally have no table `UPDATE` privilege, so row-level `SELECT ... FOR UPDATE` is not an authorized lock path:

```ts
await acquireCandidateWriterLock(transaction, 'run', input.runId)
const events = await transaction.candidateAnalysisRunEvent.findMany({
  where: { runId: input.runId },
  orderBy: { sequence: 'asc' },
})
const state = deriveCandidateAnalysisMachineState([...events.map(toContractEvent), input])
if (state === 'candidate_complete' || state === 'partial') {
  const storedManifest = await storedOutputManifest(transaction, input.runId)
  verifyExactTerminalManifestAndEvidence(input.payload, storedManifest)
}
await transaction.candidateAnalysisRunEvent.create({ data: toRunEventData(input) })
```

The run, its unique contiguous inputs and its queued event are created atomically. Artifact, assertion, evidence, dependency and reconciliation appends all take the run lock and reject any terminal state. Dependency insertion additionally takes sorted domain-separated advisory locks for both assertion IDs before the recursive integrity query. The lock SQL changes transaction lock state only, is not exposed, and cannot mutate candidate history.

`appendDependency` runs a recursive CTE before insert to reject any path from the proposed upstream assertion back to the proposed dependent assertion. Before insertion, compare the two assertions: the dependent assertion must include every upstream limitation, and it may not have stronger `identityConfidence`, `evidenceLevel`, or `machineUse` than the upstream assertion. A worker that has independent stronger evidence must append a distinct assertion whose lineage and direct evidence support that strength; it may not launder a weak dependency. The writer also relies on the SQL direct-self check.

- [ ] **Step 5: Implement the separate reconciliation writer**

The reconciler writer validates and inserts only `CandidateReconciliationSnapshot`. It must not return or capture a `CandidateAnalysisWriter`, and its test must assert that the object exposes exactly `['appendSnapshot']`.

- [ ] **Step 6: Run writer and contract tests**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-writer.test.ts
```

Expected: PASS, or only the explicit PostgreSQL-binary skip for database-backed tests.

- [ ] **Step 7: Commit the append API**

```bash
git add src/lib/knowledge/candidate-analysis-writer.ts tests/lib/candidate-analysis-writer.test.ts
git commit -m "feat: add append-only candidate writers"
```

---

### Task 5: Create and prove least-privilege PostgreSQL worker roles

**Files:**

- Create: `scripts/bootstrap-candidate-analysis-roles.sh`
- Create: `scripts/disable-candidate-analysis-writes.sh`
- Create: `scripts/verify-candidate-analysis-roles.sh`
- Create: `tests/lib/candidate-analysis-role-contract.test.ts`
- Modify: `.github/workflows/schema-migration-guard.yml:90`
- Modify: `tests/lib/schema-migration-guard-workflow.test.ts:30`

**Interfaces:**

- Creates/rotates `foodsystems_candidate_worker` and `foodsystems_candidate_reconciler`.
- Produces an acknowledged rollback command that sets both roles `NOLOGIN`, revokes their INSERT grants, terminates only sessions owned by those exact roles, and preserves every candidate row.
- Worker SELECT allowlist: `Document`, `SourceDoc`, `LibraryAnalysisRecord`, and all candidate tables except human/promotion write access.
- Worker INSERT allowlist: `CandidateAnalysisRun`, `CandidateAnalysisRunInput`, `CandidateAnalysisRunEvent`, `CandidateAnalysisArtifact`, `CandidateAssertion`, `CandidateEvidenceLink`, `CandidateDependency`.
- Reconciler SELECT allowlist: all candidate tables.
- Reconciler INSERT allowlist: `CandidateReconciliationSnapshot` only.
- Neither role receives UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER, sequence, schema CREATE, database CREATE/TEMP, role membership, or executable SECURITY DEFINER privileges.
- `review_operator` and `promotion_service` remain reserved role names only in delivery 1. Do not create or grant them before the authenticated review and promotion services exist in deliveries 3 and 4.

- [ ] **Step 1: Write failing static and disposable-database role tests**

```ts
test('candidate role scripts are explicit, credential-safe and exact-allowlist', () => {
  const bootstrap = readFileSync('scripts/bootstrap-candidate-analysis-roles.sh', 'utf8')
  const disable = readFileSync('scripts/disable-candidate-analysis-writes.sh', 'utf8')
  const verify = readFileSync('scripts/verify-candidate-analysis-roles.sh', 'utf8')
  assert.match(bootstrap, /refusing to change grants without --apply/)
  assert.match(bootstrap, /NOINHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS/)
  assert.match(bootstrap, /GRANT INSERT ON TABLE/)
  assert.doesNotMatch(bootstrap, /GRANT (?:ALL|UPDATE|DELETE|TRUNCATE)/)
  assert.match(verify, /CandidateHumanReviewDecision/)
  assert.match(verify, /CandidatePromotionDecision/)
  assert.match(verify, /canonical or unrelated write privilege is effective/i)
  assert.match(verify, /PGPASSFILE/)
  assert.match(disable, /refusing to disable candidate writes without --apply/)
  assert.match(disable, /ALTER ROLE .* NOLOGIN/)
  assert.match(disable, /pg_terminate_backend/)
  assert.doesNotMatch(disable, /DROP (?:TABLE|ROLE)|DELETE FROM|TRUNCATE/)
})
```

The live test starts disposable PostgreSQL, creates minimal `Document`, `SourceDoc`, and `LibraryAnalysisRecord` tables, applies the Task 3 migration, bootstraps both roles, then runs both verification modes. It also grants a temporary canonical INSERT or inherited role and proves verification fails until the leak is removed.

- [ ] **Step 2: Run and verify the role tests fail**

Run:

```bash
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts
```

Expected: FAIL because the three role-control scripts are absent.

- [ ] **Step 3: Implement credential-safe role bootstrap**

The script accepts only `--apply` and requires:

```text
DATABASE_ADMIN_URL
```

Optional names default to `foodsystems_candidate_worker`, `foodsystems_candidate_reconciler`, schema `public`, and fixed application names. Normalize the explicit URL authority fields with Node, write only the URL credential to a mode-0600 `PGPASSFILE`, blank the URL password before invoking `psql`, allow only the reviewed TLS/application-name query fields, reject target/auth overrides and ambient libpq target/auth variables, and unset secret environment variables before SQL execution.

The authority bootstrap does not create, change, transport or log login credentials. Before any mutation it preflights the complete user-database PUBLIC and default-ACL surface. Incompatible state aborts with zero role/ACL/data change; whole-database hardening is a separate operator-authorized operation. After a successful preflight it creates missing authority roles as `NOLOGIN`, preserves any existing login state, sets exact non-credential attributes/timeouts/search paths, revokes candidate-role memberships and direct effective object privileges, then grants only the allowlists above. An operator provisions dedicated login credentials separately and verifies each dedicated URL before use. New relations must not be granted through default privileges.

Implement `disable-candidate-analysis-writes.sh` with the same URL/password hygiene and exact role-name validation. It accepts only `--apply`, sets the two roles `NOLOGIN`, revokes their table INSERT grants, and calls `pg_terminate_backend` only for sessions whose `usename` exactly matches those roles. It must not drop roles, tables, schema, or candidate data. Re-enabling requires rerunning the explicit bootstrap and verification chain.

- [ ] **Step 4: Implement exact privilege verification**

`verify-candidate-analysis-roles.sh` accepts `--role=worker` or `--role=reconciler` and the corresponding dedicated URL. Its SQL must inspect:

```sql
has_table_privilege(current_user, relation_oid, 'SELECT')
has_table_privilege(current_user, relation_oid, 'INSERT')
has_table_privilege(current_user, relation_oid, 'UPDATE')
has_any_column_privilege(current_user, relation_oid, 'UPDATE')
has_database_privilege(current_user, current_database(), 'TEMP')
has_schema_privilege(current_user, schema_oid, 'CREATE')
has_function_privilege(current_user, routine_oid, 'EXECUTE')
```

It must verify exact current user/application name, no role memberships, no object ownership, no sequence access, no SECURITY DEFINER execution, no default ACL path, and no write outside the exact per-role insert allowlist. It must also issue transaction-wrapped negative probes against `Document`, `LibraryAnalysisRecord`, `CandidateHumanReviewDecision`, and `CandidatePromotionDecision`.

- [ ] **Step 5: Mark scripts executable and wire CI syntax checks**

```bash
chmod 0755 scripts/bootstrap-candidate-analysis-roles.sh scripts/disable-candidate-analysis-writes.sh scripts/verify-candidate-analysis-roles.sh
```

Add all three paths to the workflow shell array and `tests/lib/candidate-analysis-role-contract.test.ts` to the database contract command. Extend `schema-migration-guard-workflow.test.ts` to require those exact inclusions.

- [ ] **Step 6: Run role, schema, and workflow tests**

Run:

```bash
sh -n scripts/bootstrap-candidate-analysis-roles.sh
sh -n scripts/disable-candidate-analysis-writes.sh
sh -n scripts/verify-candidate-analysis-roles.sh
node --import=tsx --test tests/lib/candidate-analysis-role-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/schema-migration-guard-workflow.test.ts
```

Expected: PASS, including disposable-database privilege probes when PostgreSQL binaries are available.

- [ ] **Step 7: Commit the role boundary**

```bash
git add scripts/bootstrap-candidate-analysis-roles.sh scripts/disable-candidate-analysis-writes.sh scripts/verify-candidate-analysis-roles.sh tests/lib/candidate-analysis-role-contract.test.ts .github/workflows/schema-migration-guard.yml tests/lib/schema-migration-guard-workflow.test.ts
git commit -m "feat: enforce candidate database roles"
```

---

### Task 6: Add conservative `LibraryAnalysisRecord` compatibility projection

**Files:**

- Create: `src/lib/knowledge/library-analysis-candidate-compat.ts`
- Create: `tests/lib/library-analysis-candidate-compat.test.ts`

**Interfaces:**

- Consumes a structural `LegacyLibraryAnalysisRecordInput`; do not require a Prisma client.
- Produces `projectLegacyLibraryAnalysisRecord(record): LegacyLibraryCandidateProjection`.
- Produces `summarizeLegacyLibraryCandidateProjection(records): LegacyLibraryCandidateSummary`.
- Never writes or backfills the database in this delivery.

- [ ] **Step 1: Write failing mapping tests for the dangerous legacy statuses**

```ts
test('approved_internal means reusable machine context, not human acceptance', () => {
  const projected = projectLegacyLibraryAnalysisRecord({
    ...legacyFixture,
    status: 'approved_internal',
    usageRule: 'safe_for_ai_context',
    reviewStatus: 'not_required',
  })
  assert.equal(projected.hasCandidate, true)
  assert.equal(projected.machineState, 'candidate_complete')
  assert.equal(projected.machineUse, 'reusable_for_ai_context')
  assert.equal(projected.humanReviewState, 'not_requested')
  assert.deepEqual(projected.promotionByTarget, { internal: 'candidate', external: 'candidate' })
})

test('legacy review signals remain unclassified without exact authority binding', () => {
  const projected = projectLegacyLibraryAnalysisRecord({
    ...legacyFixture,
    reviewStatus: 'approved',
    reviewer: 'Named person',
    reviewedAt: new Date().toISOString(),
  })
  assert.equal(projected.humanReviewState, 'not_requested')
  assert.equal(projected.legacyAuthorityState, 'unclassified')
  assert.ok(projected.limitations.includes('legacy_review_requires_authority_classification'))
})

test('not-started inventory rows do not fabricate candidate runs', () => {
  const projected = projectLegacyLibraryAnalysisRecord({ ...legacyFixture, status: 'not_started', aiCard: null })
  assert.equal(projected.hasCandidate, false)
  assert.equal(projected.reason, 'legacy_analysis_absent')
})
```

- [ ] **Step 2: Run and verify the compatibility module is missing**

Run:

```bash
node --import=tsx --test tests/lib/library-analysis-candidate-compat.test.ts
```

Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement the explicit projection**

Use this output contract:

```ts
export type LegacyLibraryCandidateProjection = {
  sourceKind: string
  sourceKey: string
  hasCandidate: boolean
  reason: 'projected' | 'legacy_analysis_absent'
  machineState: CandidateAnalysisMachineState | null
  machineUse: CandidateMachineUse | null
  humanReviewState: 'not_requested'
  legacyAuthorityState: 'none' | 'unclassified'
  promotionByTarget: { internal: 'candidate'; external: 'candidate' }
  identityConfidence: CandidateIdentityConfidence
  evidenceLevel: CandidateEvidenceLevel
  limitations: string[]
}
```

Mapping rules:

- no `aiCard` plus `not_started`/`inventory_only` => no candidate;
- `approved_internal`/`validated` => `candidate_complete` only when content hash and AI card exist, otherwise `partial`;
- `ai_draft`/`review_required` => `partial`;
- `blocked` => `failed` with legacy blocker limitation;
- `superseded` => `hasCandidate: true`, `machineState: 'superseded'`, `machineUse: 'quarantined'`, and limitation `legacy_candidate_superseded`;
- `safe_for_ai_context` => `reusable_for_ai_context`; every other usage rule => `candidate_only` unless blocked/quarantined;
- exact identity requires valid content hash plus a consistent `document:${documentId}` or `source_doc:${sourceDocId}` binding; a valid hash without exact binding is provisional; otherwise unresolved;
- an exact page/record locator in every claim candidate gives `exact_locator`; some grounding gives `partial_locator`; otherwise `no_locator`;
- any legacy reviewer/reviewedAt/approved state becomes `legacyAuthorityState: 'unclassified'`, never `accepted`.

- [ ] **Step 4: Run compatibility and existing library tests**

Run:

```bash
node --import=tsx --test tests/lib/library-analysis-candidate-compat.test.ts tests/lib/library-analysis.test.ts tests/lib/library-analysis-processing.test.ts
```

Expected: PASS. Existing library behavior remains unchanged; only the new read-time projection changes terminology.

- [ ] **Step 5: Commit the compatibility projection**

```bash
git add src/lib/knowledge/library-analysis-candidate-compat.ts tests/lib/library-analysis-candidate-compat.test.ts
git commit -m "feat: project legacy analysis as candidates"
```

---

### Task 7: Build the machine-readable candidate control snapshot

**Files:**

- Create: `src/lib/knowledge/candidate-control-snapshot.ts`
- Create: `knowledge/schema/candidate-control-snapshot.schema.v1.json`
- Create: `scripts/knowledge/export-candidate-control-snapshot.ts`
- Create: `tests/lib/candidate-control-snapshot.test.ts`

**Interfaces:**

- Produces `CANDIDATE_CONTROL_SNAPSHOT_SCHEMA_VERSION = 'candidate-control-snapshot-v1'`.
- Produces `buildCandidateControlSnapshot(input): CandidateControlSnapshot` and `validateCandidateControlSnapshot(value)`.
- Consumes an exact `CandidateControlSnapshotInput` containing provenance, `externalTargetProfile`, `externalBlockers`, ordered run events, assertions, current/superseding review and promotion decisions, reconciliation snapshots, and legacy rows.
- CLI reads production only through the normal admin/read application credential; it performs no writes.
- CLI writes stdout by default. `--output=/absolute/or/repo/path.json` is explicit and atomic; no tracked status file is silently overwritten.
- Consumes the Task 2 event reducer and Task 6 legacy projector.

- [ ] **Step 1: Write failing snapshot and JSON Schema parity tests**

```ts
test('reports an operational machine pipeline independently from human and external readiness', () => {
  const snapshot = buildCandidateControlSnapshot(candidateControlFixture())
  assert.equal(snapshot.operational, true)
  assert.equal(snapshot.machine.currentByState.candidate_complete, 1)
  assert.equal(snapshot.review.currentByState.not_requested, 1)
  assert.equal(snapshot.review.backlogTotal, 1)
  assert.equal(snapshot.review.reviewComplete, false)
  assert.equal(snapshot.promotion.externalReady, false)
})

test('tracks legacy unclassified review signals without granting acceptance', () => {
  const snapshot = buildCandidateControlSnapshot(candidateControlFixture({ legacyReviewSignals: 2 }))
  assert.equal(snapshot.legacy.unclassifiedHumanSignals, 2)
  assert.equal(snapshot.review.currentByState.accepted, 0)
})

test('treats a review bound to old candidate or evidence hashes as stale', () => {
  const snapshot = buildCandidateControlSnapshot(candidateControlFixture({ staleReview: true }))
  assert.equal(snapshot.review.currentByState.accepted, 0)
  assert.equal(snapshot.review.currentByState.not_requested, 1)
  assert.equal(snapshot.review.reviewComplete, false)
  assert.ok(snapshot.warnings.some(value => value.startsWith('stale_review_decision:')))
  assert.equal(snapshot.promotion.externalReady, false)
})

test('runtime and JSON Schema reject unknown fields identically', () => {
  const snapshot = { ...buildCandidateControlSnapshot(candidateControlFixture()), externalReady: true }
  assert.equal(validateCandidateControlSnapshot(snapshot).ok, false)
  assert.equal(validateJsonSchema(snapshot), false)
})
```

- [ ] **Step 2: Run and verify missing snapshot artifacts fail**

Run:

```bash
node --import=tsx --test tests/lib/candidate-control-snapshot.test.ts
```

Expected: FAIL because the module and JSON schema do not exist.

- [ ] **Step 3: Implement the strict snapshot contract**

The top-level shape is exact:

```ts
export type CandidateControlSnapshot = {
  schemaVersion: 'candidate-control-snapshot-v1'
  generatedAt: string
  provenance: {
    sourceCommit: string
    runtimeCommit: string | null
    databaseIdentityUuid: string
    counterBasis: 'current_unsuperseded_records'
    queryErrors: string[]
  }
  operational: boolean
  machine: {
    runsTotal: number
    currentByState: Record<CandidateAnalysisMachineState, number>
    assertionsTotal: number
    byMachineUse: Record<CandidateMachineUse, number>
  }
  identity: { byConfidence: Record<CandidateIdentityConfidence, number> }
  evidence: { byLevel: Record<CandidateEvidenceLevel, number> }
  review: {
    currentByState: Record<'not_requested' | 'queued' | 'in_review' | 'accepted' | 'accepted_with_edits' | 'rejected' | 'deferred', number>
    backlogTotal: number
    oldestPendingAt: string | null
    oldestPendingAgeSeconds: number | null
    reviewComplete: boolean
    pendingIsExpectedWork: true
  }
  promotion: {
    externalTargetProfile: string
    externalBlockers: string[]
    byTargetProfile: Record<string, Record<CandidatePromotionState, number>>
    externalReady: boolean
  }
  reconciliation: {
    snapshotsTotal: number
    conflictsTotal: number
  }
  legacy: {
    recordsTotal: number
    projectedCandidates: number
    analysisAbsent: number
    unclassifiedHumanSignals: number
  }
  warnings: string[]
}
```

`operational` is false only for query/contract failures or invalid machine event history. Pending review does not make it false. A review decision is current only when it is not superseded and its bound assertion-payload, source-content-set, evidence-set, and review-profile hashes still match; stale decisions add a warning and confer no review state. `backlogTotal` counts current assertions without a current terminal review decision; `oldestPendingAt` is the earliest creation time among them; `oldestPendingAgeSeconds` is derived against `generatedAt`; `reviewComplete` is true only when that count is zero. `conflictsTotal` sums the latest reconciliation snapshot for each scope. Quarantine count remains explicit at `machine.currentByState.quarantined`. `externalReady` is true only when the named external target profile has a current `external_eligible`/`published` promotion decision linked to a current `accepted`/`accepted_with_edits` review decision and both `queryErrors` and `externalBlockers` are empty. Zero linked review decisions always yields false.

- [ ] **Step 4: Add the exact JSON Schema and parity test**

Use draft 2020-12, `additionalProperties: false` at every object level, exact enums from Task 2, SHA/commit/UUID patterns, nullable ISO timestamp for `oldestPendingAt`, nullable nonnegative integer for `oldestPendingAgeSeconds`, nonnegative integer counters, and `pendingIsExpectedWork: { "const": true }`.

- [ ] **Step 5: Implement the read-only export CLI**

The CLI accepts only:

```text
--output=<path>          optional; stdout when absent
--runtime-commit=<sha>  optional
```

It queries `DatabaseIdentity`, candidate runs with ordered events, assertions, human decisions, promotion decisions, latest reconciliation snapshots per scope, and current `LibraryAnalysisRecord` rows. It passes plain data into the pure builder. An output file is written to a same-directory temporary file with mode 0600, fsynced, and renamed atomically. Reject symlink targets and unknown arguments. Never print `DATABASE_URL`.

- [ ] **Step 6: Run snapshot, compatibility, and schema tests**

Run:

```bash
node --import=tsx --test tests/lib/candidate-control-snapshot.test.ts tests/lib/library-analysis-candidate-compat.test.ts tests/lib/candidate-analysis-contract.test.ts
```

Expected: PASS with runtime/JSON Schema parity and external readiness remaining closed.

- [ ] **Step 7: Commit the control snapshot**

```bash
git add src/lib/knowledge/candidate-control-snapshot.ts knowledge/schema/candidate-control-snapshot.schema.v1.json scripts/knowledge/export-candidate-control-snapshot.ts tests/lib/candidate-control-snapshot.test.ts
git commit -m "feat: add candidate control snapshot"
```

---

### Task 8: Wire commands, CI, and the complete delivery-1 verification gate

**Files:**

- Modify: `package.json`
- Modify: `tests/lib/package-scripts.test.ts`
- Modify: `.github/workflows/schema-migration-guard.yml`
- Modify: `tests/lib/schema-migration-guard-workflow.test.ts`
- Modify: `docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md`

**Interfaces:**

- Produces package scripts `knowledge:candidate-contracts:check`, `candidate:roles:bootstrap`, `candidate:roles:disable`, `candidate:roles:verify`, and `candidate:control:snapshot`.
- Extends `knowledge:check` with one call to `knowledge:candidate-contracts:check` immediately after the unchanged `knowledge:processing-contracts:check` call.
- Keeps deployment and production role bootstrap manual; CI never receives production credentials.

- [ ] **Step 1: Write failing package/workflow assertions**

Add exact expectations:

```ts
assert.equal(
  scripts['knowledge:candidate-contracts:check'],
  "node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/library-analysis-candidate-compat.test.ts tests/lib/candidate-control-snapshot.test.ts",
)
assert.equal(scripts['candidate:roles:bootstrap'], 'scripts/bootstrap-candidate-analysis-roles.sh --apply')
assert.equal(scripts['candidate:roles:disable'], 'scripts/disable-candidate-analysis-writes.sh --apply')
assert.equal(scripts['candidate:roles:verify'], 'scripts/verify-candidate-analysis-roles.sh')
assert.equal(scripts['candidate:control:snapshot'], 'tsx scripts/knowledge/export-candidate-control-snapshot.ts')
```

The workflow test must require all three role-control scripts in the shell syntax list and `npm run knowledge:candidate-contracts:check` after Prisma generation.

- [ ] **Step 2: Run the package and workflow tests and verify failure**

Run:

```bash
node --import=tsx --test tests/lib/package-scripts.test.ts tests/lib/schema-migration-guard-workflow.test.ts
```

Expected: FAIL because the package commands and final workflow step are absent.

- [ ] **Step 3: Add scripts and the unified candidate contract command**

Add the exact commands above. Leave `knowledge:processing-contracts:check` byte-for-byte unchanged. In `knowledge:check`, insert exactly one `npm run knowledge:candidate-contracts:check` immediately after `npm run knowledge:processing-contracts:check`; do not add the candidate test files individually to either existing command.

Add a CI step after Prisma generation:

```yaml
- name: Run autonomous candidate contracts
  run: npm run knowledge:candidate-contracts:check
```

- [ ] **Step 4: Run focused verification**

Run:

```bash
npm run db:generate
DATABASE_URL=postgresql://ci:ci@db.invalid:5432/foodsystems_ci?schema=public ./node_modules/.bin/prisma validate --schema prisma/schema.prisma
npm run knowledge:candidate-contracts:check
npm run knowledge:processing-contracts:check
```

Expected: all commands exit 0; any PostgreSQL skips must state only missing server binaries, not failed assertions.

- [ ] **Step 5: Run repository-wide regression checks**

Run:

```bash
npm run lint
npm test
npm run build
```

Expected: all exit 0. If the full suite exposes an environment-only attestation failure, capture the exact failing test and command; do not call the repository green until that same command passes in the intended Node 24 CI environment.

- [ ] **Step 6: Verify the delivery against the spec line by line**

Confirm with repository evidence:

```bash
git diff origin/main...HEAD --stat
git diff origin/main...HEAD --check
rg -n "approved_internal|humanReviewed|externalReady" src/lib/knowledge/candidate-* src/lib/knowledge/library-analysis-candidate-compat.ts
rg -n "UPDATE|DELETE|TRUNCATE|GRANT ALL" scripts/bootstrap-candidate-analysis-roles.sh src/lib/knowledge/candidate-analysis-writer.ts
```

Expected:

- `approved_internal` appears only in compatibility input/mapping, `humanReviewed` only in negative boundary tests, and `externalReady` only in the strict control-snapshot output or negative boundary tests;
- candidate writer exposes no mutable history method;
- role bootstrap contains revocations and exact inserts, never broad write grants;
- no adapter, UI, promotion executor, production credential, or generated live snapshot was added.

- [ ] **Step 7: Update spec implementation status and commit integration**

Change the spec status to `Delivery 1 implementation complete locally; release not yet performed` only after every verification above passes. Then commit:

```bash
git add package.json tests/lib/package-scripts.test.ts .github/workflows/schema-migration-guard.yml tests/lib/schema-migration-guard-workflow.test.ts docs/superpowers/specs/2026-08-18-autonomous-ai-candidate-layer-design.md
git commit -m "test: gate autonomous candidate foundation"
```

---

## Delivery-1 Stopline

After Task 8, stop before any production mutation. The branch may contain a tested migration and role bootstrap scripts, but the following require a separate release decision and evidence chain:

1. hosted CI result on the exact commit,
2. review and merge,
3. production backup and migration authorization,
4. migration deployment and schema-drift verification,
5. creation of production worker/reconciler credentials,
6. role verification using the dedicated logins,
7. deployment and exact runtime SHA,
8. first candidate write and control snapshot,
9. any autonomous worker scheduling.

Do not describe delivery 1 as live, deployed, autonomous, externally ready, human-reviewed, or promoted until the corresponding evidence exists.
