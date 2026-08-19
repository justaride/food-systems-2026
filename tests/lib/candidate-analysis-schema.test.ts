import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  candidateAnalysisOutputManifestHash,
  candidateAnalysisRunScopeHash,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import { withCandidateAnalysisPostgres } from "../helpers/candidate-analysis-postgres";

function modelBlock(schema: string, model: string): string {
  const match = schema.match(new RegExp(`model ${model} \\{[\\s\\S]*?\\n\\}`));
  assert.ok(match, `missing Prisma model ${model}`);
  return match[0];
}

test("models independent machine, review and target-specific promotion history", () => {
  const schema = readFileSync("prisma/schema.prisma", "utf8");
  for (const model of [
    "CandidateContentUnit",
    "CandidateAnalysisRun",
    "CandidateAnalysisRunInput",
    "CandidateAnalysisRunEvent",
    "CandidateAnalysisArtifact",
    "CandidateAssertion",
    "CandidateEvidenceLink",
    "CandidateDependency",
    "CandidateReconciliationSnapshot",
    "CandidateHumanReviewDecision",
    "CandidatePromotionDecision",
  ]) {
    assert.match(schema, new RegExp(`model ${model} \\{`));
  }

  const promotion = modelBlock(schema, "CandidatePromotionDecision");
  assert.match(promotion, /targetProfile\s+String/);
  assert.match(promotion, /state\s+CandidatePromotionState/);
  assert.match(
    promotion,
    /fields: \[reviewDecisionId, reviewDecisionHash, assertionId\], references: \[id, decisionHash, assertionId\]/,
  );
  assert.match(
    promotion,
    /fields: \[supersededDecisionId, supersededDecisionHash, assertionId, targetProfile, targetProfileHash, supersededPolicyHash\], references: \[id, decisionHash, assertionId, targetProfile, targetProfileHash, policyHash\]/,
  );
  const humanReview = modelBlock(schema, "CandidateHumanReviewDecision");
  assert.match(
    humanReview,
    /fields: \[assertionId, assertionPayloadHash\], references: \[id, payloadHash\]/,
  );
  assert.match(
    humanReview,
    /fields: \[supersededDecisionId, supersededDecisionHash, assertionId, reviewProfile, reviewProfileHash\], references: \[id, decisionHash, assertionId, reviewProfile, reviewProfileHash\]/,
  );
  const run = modelBlock(schema, "CandidateAnalysisRun");
  assert.match(run, /scopeHash\s+String/);
  assert.match(run, /@@unique\(\[id, scopeHash\]\)/);
  const runEvent = modelBlock(schema, "CandidateAnalysisRunEvent");
  assert.match(runEvent, /scopeHash\s+String/);
  assert.match(runEvent, /supersededEventScopeHash\s+String\?/);
  assert.match(
    runEvent,
    /fields: \[runId, scopeHash\], references: \[id, scopeHash\].*map: "CandidateRunEvent_run_scope_fkey"/,
  );
  assert.match(
    runEvent,
    /fields: \[supersededEventId, supersededEventHash, runId, supersededEventScopeHash\], references: \[id, eventHash, runId, scopeHash\]/,
  );
  assert.match(runEvent, /@@unique\(\[id, eventHash, runId, scopeHash\]\)/);
  assert.match(
    modelBlock(schema, "CandidateAssertion"),
    /fields: \[supersededAssertionId, supersededAssertionPayloadHash, scopeHash\], references: \[id, payloadHash, scopeHash\]/,
  );
  assert.doesNotMatch(
    modelBlock(schema, "CandidateAssertion"),
    /reviewed|published|externalReady/i,
  );
});

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

test("migration makes every candidate history table immutable and private from PUBLIC with ENABLE ALWAYS custom triggers", () => {
  const sql = readFileSync(
    "prisma/migrations/20260818_candidate_analysis_foundation/migration.sql",
    "utf8",
  );
  assert.match(sql, /CREATE FUNCTION public\.reject_candidate_history_change\(\)/);
  assert.equal(
    (sql.match(/CREATE TRIGGER "[^"]+_reject_update_delete" BEFORE/g) ?? []).length,
    11,
  );
  assert.equal(
    (sql.match(/CREATE TRIGGER "[^"]+_reject_truncate" BEFORE/g) ?? []).length,
    11,
  );
  assert.equal((sql.match(/REVOKE ALL PRIVILEGES ON TABLE/g) ?? []).length, 11);
  assert.match(
    sql,
    /CREATE FUNCTION public\.reject_invalid_candidate_machine_payload\(\)/,
  );
  assert.equal(
    (sql.match(/reject_invalid_machine_payload" BEFORE INSERT/g) ?? []).length,
    4,
  );
  assert.match(
    sql,
    /CandidateAnalysisRun_reject_invalid_scope" BEFORE INSERT/,
  );
  assert.equal((sql.match(/ENABLE ALWAYS TRIGGER/g) ?? []).length, candidateAlwaysTriggers.length);
  for (const [table, trigger] of candidateAlwaysTriggers) {
    const statement = new RegExp(
      `ALTER TABLE "${table}"\\s+ENABLE ALWAYS TRIGGER "${trigger}";`,
      "g",
    );
    assert.equal(
      (sql.match(statement) ?? []).length,
      1,
      `migration must mark ${table}.${trigger} ENABLE ALWAYS exactly once`,
    );
  }
  for (const signature of [
    "candidate_json_number_to_javascript(JSONB)",
    "candidate_canonical_json(JSONB)",
    "reject_invalid_candidate_run_scope()",
    "reject_invalid_candidate_machine_payload()",
  ]) {
    assert.match(sql, new RegExp(`REVOKE ALL ON FUNCTION public\\.${signature.replace(/[()]/g, "\\$&")} FROM PUBLIC`));
  }
});

test(
  "candidate custom triggers remain enforced in replica mode",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const expectedRows = candidateAlwaysTriggers.map(
        ([table, trigger]) => `${table}|${trigger}|A`,
      );
      const expectedValues = candidateAlwaysTriggers.map(
        ([table, trigger], index) => `(${index + 1}, '${table}', '${trigger}')`,
      ).join(",\n");
      const triggerStates = psql(`
        SELECT class.relname || '|' || trigger.tgname || '|' || trigger.tgenabled::text
        FROM (VALUES
          ${expectedValues}
        ) AS expected(ordinal, relname, tgname)
        JOIN pg_class AS class ON class.relname = expected.relname
        JOIN pg_namespace AS namespace ON namespace.oid = class.relnamespace
          AND namespace.nspname = 'public'
        JOIN pg_trigger AS trigger ON trigger.tgrelid = class.oid
          AND trigger.tgname = expected.tgname
        ORDER BY expected.ordinal
      `);
      assert.equal(triggerStates.status, 0, triggerStates.stderr);
      assert.deepEqual(
        triggerStates.stdout.trim().split("\n").filter(Boolean),
        expectedRows,
      );

      const replicaInsert = psql(`
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
        )
      `);
      assert.notEqual(replicaInsert.status, 0, "replica-mode invalid scope unexpectedly inserted");
      assert.match(replicaInsert.stderr, /invalid candidate run scope/);

      const replicaRowCount = psql(`
        SELECT count(*)
        FROM public."CandidateAnalysisRun"
        WHERE "id" = 'run:replica-invalid-scope'
      `);
      assert.equal(replicaRowCount.status, 0, replicaRowCount.stderr);
      assert.equal(replicaRowCount.stdout.trim(), "0");
    });
  },
);

test(
  "database rejects direct SQL machine payload bypasses on all four surfaces",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const hasRunScope =
        psql(`
          SELECT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'CandidateAnalysisRun'
              AND column_name = 'scopeHash'
          )
        `).stdout.trim() === "t";
      const runScope = candidateAnalysisRunScopeHash("run-payload-guard");
      const runScopeColumn = hasRunScope ? ', "scopeHash"' : "";
      const runScopeValue = hasRunScope ? `, '${runScope}'` : "";
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
          ${runScopeColumn}
        ) VALUES (
          'run-payload-guard', 'workflow.candidate_analysis.v1', '1.0.0', 'workflow.md', '${hash("0")}',
          'prompt.candidate_analysis.v1', '1.0.0', 'prompt.md', 'provider', 'model',
          'version', '${hash("1")}', '{}', '${hash("2")}', '${hash("3")}',
          'payload guard', 'candidate_only', 'worker:payload', '${hash("4")}', 1
          ${runScopeValue}
        )
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const invalidPayloads = [
        {
          name: "artifact lifecycle",
          sql: `
            INSERT INTO "CandidateAnalysisArtifact" (
              "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash"
            ) VALUES (
              'artifact-payload-guard', 'run-payload-guard', 'summary',
              'candidate-analysis-v1',
              '{"namespace":"candidate","kind":"artifact","data":{"lifecycle":"published"}}',
              '${hash("7")}'
            )
          `,
        },
        {
          name: "assertion verdict",
          sql: `
            INSERT INTO "CandidateAssertion" (
              "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
              "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
              "scopeKey", "scopeHash"
            ) VALUES (
              'assertion-payload-guard', 'run-payload-guard', 'claim',
              'candidate-analysis-v1',
              '{"namespace":"candidate","kind":"assertion","data":{"verdict":"approved"}}',
              '${hash("8")}', NULL, 'candidate_only', 'provisional', 'no_locator',
              ARRAY[]::text[], 'scope:payload', '${hash("9")}'
            )
          `,
        },
        {
          name: "run-event disposition",
          sql: `
            INSERT INTO "CandidateAnalysisRunEvent" (
              "id", "runId", "sequence", "eventType", "payload", "eventHash"
              ${hasRunScope ? ', "scopeHash"' : ""}
            ) VALUES (
              'event-payload-guard', 'run-payload-guard', 1, 'queued',
              '{"namespace":"candidate","kind":"run_event","data":{"disposition":"canonical"}}',
              '${hash("a")}' ${hasRunScope ? `, '${runScope}'` : ""}
            )
          `,
        },
        {
          name: "completed event with ordinary envelope",
          sql: `
            INSERT INTO "CandidateAnalysisRunEvent" (
              "id", "runId", "sequence", "eventType", "payload", "eventHash"
              ${hasRunScope ? ', "scopeHash"' : ""}
            ) VALUES (
              'event-terminal-payload-guard', 'run-payload-guard', 2,
              'candidate_completed',
              '{"namespace":"candidate","kind":"run_event","data":{"entries":[{"role":"summary","valueType":"text","value":"not a manifest"}]}}',
              '${hash("d")}' ${hasRunScope ? `, '${runScope}'` : ""}
            )
          `,
        },
        {
          name: "superseded event with ordinary envelope",
          sql: `
            INSERT INTO "CandidateAnalysisRunEvent" (
              "id", "runId", "sequence", "eventType", "payload", "eventHash"
              ${hasRunScope ? ', "scopeHash"' : ""}
            ) VALUES (
              'event-supersession-payload-guard', 'run-payload-guard', 3,
              'superseded',
              '{"namespace":"candidate","kind":"run_event","data":{"entries":[{"role":"reason","valueType":"text","value":"not a supersession"}]}}',
              '${hash("e")}' ${hasRunScope ? `, '${runScope}'` : ""}
            )
          `,
        },
        {
          name: "reconciliation release",
          sql: `
            INSERT INTO "CandidateReconciliationSnapshot" (
              "id", "runId", "scope", "scopeHash", "payload", "payloadHash", "conflictCount"
            ) VALUES (
              'snapshot-payload-guard', 'run-payload-guard', '{}', '${hash("b")}',
              '{"namespace":"candidate","kind":"reconciliation","data":{"release":"external_ready"}}',
              '${hash("c")}', 0
            )
          `,
        },
      ];
      for (const invalid of invalidPayloads) {
        const result = psql(invalid.sql);
        assert.notEqual(result.status, 0, `${invalid.name} unexpectedly succeeded`);
        assert.match(result.stderr, /invalid candidate machine payload/);
      }
    });
  },
);

test(
  "database rejects a false terminal manifest hash",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runId = "run-terminal-false-hash";
      const scopeHash = candidateAnalysisRunScopeHash(runId);
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${runId}', '${scopeHash}', 'workflow.candidate_analysis.v1', '1.0.0',
          'workflow.md', '${hash("0")}', 'prompt.candidate_analysis.v1', '1.0.0',
          'prompt.md', 'provider', 'model', 'version', '${hash("1")}', '{}',
          '${hash("2")}', '${hash("3")}', 'terminal hash', 'candidate_only',
          'worker:terminal-hash', '${hash("4")}', 1
        )
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const rejected = psql(`
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash"
        ) VALUES (
          'event-terminal-false-hash', '${runId}', '${scopeHash}', 1, 'candidate_completed',
          '{"namespace":"candidate","kind":"run_terminal","data":{"manifest":{"schemaVersion":"candidate-output-manifest-v1","inputs":[],"artifacts":[],"assertions":[],"evidenceLinks":[],"dependencies":[],"reconciliationSnapshots":[]},"manifestHash":"${hash("f")}"}}',
          '${hash("5")}'
        )
      `);
      assert.notEqual(rejected.status, 0, "false manifest hash unexpectedly inserted");
      assert.match(rejected.stderr, /invalid candidate machine payload/);
    });
  },
);

test(
  "database accepts semantically integral terminal numbers regardless of JSON scale",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runId = "run-terminal-zero-scale";
      const scopeHash = candidateAnalysisRunScopeHash(runId);
      const manifest = {
        schemaVersion: "candidate-output-manifest-v1" as const,
        inputs: [{
          contentUnitId: "content:terminal-zero:1",
          position: 0,
          contentHash: hash("a"),
          identityConfidence: "exact" as const,
        }],
        artifacts: [],
        assertions: [{
          id: "assertion:terminal-zero:1",
          assertionType: "claim" as const,
          schemaVersion: "candidate-analysis-v1" as const,
          payloadHash: hash("b"),
          confidence: 0.123456789012345,
          machineUse: "candidate_only" as const,
          identityConfidence: "exact" as const,
          evidenceLevel: "no_locator" as const,
          limitations: [
            "quote \" slash \\ tab\t backspace\b formfeed\f carriage\r newline\n ø 😀  ",
          ],
          scopeKey: "scope:terminal-zero:1",
          scopeHash: hash("c"),
          supersededAssertionId: null,
          supersededAssertionPayloadHash: null,
        }, {
          id: "assertion:terminal-zero:2",
          assertionType: "claim" as const,
          schemaVersion: "candidate-analysis-v1" as const,
          payloadHash: hash("f"),
          confidence: 1e-7,
          machineUse: "candidate_only" as const,
          identityConfidence: "exact" as const,
          evidenceLevel: "no_locator" as const,
          limitations: [],
          scopeKey: "scope:terminal-zero:2",
          scopeHash: hash("9"),
          supersededAssertionId: null,
          supersededAssertionPayloadHash: null,
        }],
        evidenceLinks: [],
        dependencies: [],
        reconciliationSnapshots: [{
          id: "reconciliation:terminal-zero:1",
          scopeHash: hash("d"),
          payloadHash: hash("e"),
          conflictCount: 1e20,
        }, {
          id: "reconciliation:terminal-zero:2",
          scopeHash: hash("7"),
          payloadHash: hash("8"),
          conflictCount: 1e21,
        }],
      };
      const payload = JSON.stringify({
        namespace: "candidate",
        kind: "run_terminal",
        data: {
          manifest,
          manifestHash: candidateAnalysisOutputManifestHash(manifest),
        },
      }).replace('"position":0', '"position":0.0');
      const result = psql(`
        SET extra_float_digits = -15;
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${runId}', '${scopeHash}', 'workflow.candidate_analysis.v1', '1.0.0',
          'workflow.md', '${hash("0")}', 'prompt.candidate_analysis.v1', '1.0.0',
          'prompt.md', 'provider', 'model', 'version', '${hash("1")}', '{}',
          '${hash("2")}', '${hash("3")}', 'terminal zero scale', 'candidate_only',
          'worker:terminal-zero', '${hash("4")}', 1
        );
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash"
        ) VALUES (
          'event-terminal-zero-scale', '${runId}', '${scopeHash}', 1,
          'candidate_completed', '${payload}', '${hash("5")}'
        )
      `);
      assert.equal(result.status, 0, result.stderr);
    });
  },
);

test(
  "database rejects payload numbers that cannot round trip through a finite JavaScript double",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runId = "run-number-round-trip";
      const scopeHash = candidateAnalysisRunScopeHash(runId);
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          '${runId}', '${scopeHash}', 'workflow.candidate_analysis.v1', '1.0.0',
          'workflow.md', '${hash("0")}', 'prompt.candidate_analysis.v1', '1.0.0',
          'prompt.md', 'provider', 'model', 'version', '${hash("1")}', '{}',
          '${hash("2")}', '${hash("3")}', 'numeric round trip', 'candidate_only',
          'worker:numeric', '${hash("4")}', 1
        )
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const numericLiterals = ["1e-400", "0.10000000000000001", "1e400"];
      const results = numericLiterals.map((numeric, index) => psql(`
        INSERT INTO "CandidateAnalysisArtifact" (
          "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash"
        ) VALUES (
          'artifact-number-${index}', '${runId}', 'numeric', 'candidate-analysis-v1',
          '{"namespace":"candidate","kind":"artifact","data":{"entries":[{"role":"quantitative_observation","valueType":"number","value":${numeric},"unit":null}]}}',
          '${String(index + 5).repeat(64)}'
        )
      `));
      assert.deepEqual(
        results.map((result) => ({
          rejected: result.status !== 0,
          stable: /invalid candidate machine payload/.test(result.stderr),
        })),
        numericLiterals.map(() => ({ rejected: true, stable: true })),
      );
    });
  },
);

test(
  "candidate history remains append-only and rejects invalid provenance data in PostgreSQL",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const uppercaseHash = `'${hash("A")}'`;
      const columnsByTable = {
        CandidateContentUnit: [
          "id", "sourceKind", "sourceKey", "sourceVersionHash", "unitType",
          "ordinal", "locator", "locatorHash", "contentHash", "hashAlgorithm",
          "identityConfidence", "createdAt",
        ],
        CandidateAnalysisRun: [
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt",
          "predecessorRunId", "createdAt",
        ],
        CandidateAnalysisRunInput: [
          "id", "runId", "contentUnitId", "position", "inputHash", "createdAt",
        ],
        CandidateAnalysisRunEvent: [
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash",
          "supersededEventId", "supersededEventHash", "supersededEventScopeHash", "recordedAt",
        ],
        CandidateAnalysisArtifact: [
          "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash", "createdAt",
        ],
        CandidateAssertion: [
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel",
          "limitations", "scopeKey", "scopeHash", "supersededAssertionId",
          "supersededAssertionPayloadHash", "createdAt",
        ],
        CandidateEvidenceLink: [
          "id", "assertionId", "contentUnitId", "relation", "locator", "locatorHash",
          "excerptHash", "createdAt",
        ],
        CandidateReconciliationSnapshot: [
          "id", "runId", "scope", "scopeHash", "payload", "payloadHash", "conflictCount", "createdAt",
        ],
        CandidateHumanReviewDecision: [
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "decisionHash", "limitations", "editedPayload", "editedPayloadHash",
          "supersededDecisionId", "supersededDecisionHash", "createdAt",
        ],
        CandidatePromotionDecision: [
          "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
          "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
          "policyVersion", "policyHash", "preconditionsHash", "targetRefs",
          "targetSetHash", "result", "resultHash", "decisionHash", "operator",
          "authority", "supersededDecisionId", "supersededDecisionHash",
          "supersededPolicyHash", "createdAt",
        ],
      } as const;
      const copyInsert = (
        table: keyof typeof columnsByTable,
        sourceId: string,
        overrides: Record<string, string>,
      ) => {
        const columns = columnsByTable[table];
        const effectiveOverrides = { ...overrides };
        if (
          table === "CandidateAnalysisRun"
          && effectiveOverrides.id !== undefined
          && effectiveOverrides.scopeHash === undefined
        ) {
          const id = effectiveOverrides.id.match(/^'([^']+)'$/)?.[1];
          assert.ok(id, "run copy override must use a literal identifier");
          effectiveOverrides.scopeHash = `'${candidateAnalysisRunScopeHash(id)}'`;
        }
        return `
          INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(", ")})
          SELECT ${columns.map((column) => effectiveOverrides[column] ?? `"${column}"`).join(", ")}
          FROM "${table}" WHERE "id" = '${sourceId}'
        `;
      };
      const runScope = candidateAnalysisRunScopeHash("run-1");
      const insertChain = psql(`
        INSERT INTO "CandidateContentUnit" (
          "id", "sourceKind", "sourceKey", "sourceVersionHash", "unitType",
          "ordinal", "locator", "locatorHash", "contentHash", "identityConfidence"
        ) VALUES (
          'unit-1', 'document', 'source-1', '${hash("a")}', 'pdf_page',
          0, 'page:1', '${hash("b")}', '${hash("c")}', 'exact'
        );
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'run-1', '${runScope}', 'workflow.candidate_analysis.v1', '1.0.0',
          'knowledge/corpus/workflows/candidate-analysis-v1.md', '${hash("d")}',
          'prompt.candidate_analysis.v1', '1.0.0',
          'knowledge/corpus/workflows/candidate-analysis-prompt-v1.md',
          'provider', 'model', 'model-v1', '${hash("e")}', '{}', '${hash("f")}',
          '${hash("0")}', 'candidate analysis',
          'candidate-v1', 'worker-1', '${hash("a")}', 1
        );
        INSERT INTO "CandidateAnalysisRunInput" (
          "id", "runId", "contentUnitId", "position", "inputHash"
        ) VALUES ('input-1', 'run-1', 'unit-1', 0, '${hash("1")}');
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash"
        ) VALUES (
          'event-1', 'run-1', '${runScope}', 1, 'queued',
          '{"namespace":"candidate","kind":"run_event","data":{"entries":[{"role":"reason","valueType":"text","value":"queued"}]}}',
          '${hash("2")}'
        );
        INSERT INTO "CandidateAnalysisArtifact" (
          "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash"
        ) VALUES (
          'artifact-1', 'run-1', 'analysis', 'candidate-analysis-v1',
          '{"namespace":"candidate","kind":"artifact","data":{"entries":[{"role":"summary","valueType":"text","value":"analysis"}]}}',
          '${hash("3")}'
        );
        INSERT INTO "CandidateAssertion" (
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
          "scopeKey", "scopeHash"
        ) VALUES
          ('assertion-1', 'run-1', 'claim', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"proposition","valueType":"text","value":"one"}]}}', '${hash("4")}',
           0.75, 'candidate_only', 'exact', 'exact_locator', ARRAY[]::text[], 'claim:one', '${hash("e")}'),
          ('assertion-2', 'run-1', 'gap', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"gap","valueType":"text","value":"two"}]}}', '${hash("5")}',
           NULL, 'quarantined', 'provisional', 'partial_locator', ARRAY['needs review'], 'gap:two', '${hash("f")}');
        INSERT INTO "CandidateEvidenceLink" (
          "id", "assertionId", "contentUnitId", "relation", "locator", "locatorHash", "excerptHash"
        ) VALUES ('evidence-1', 'assertion-1', 'unit-1', 'supports', 'page:1', '${hash("6")}', '${hash("7")}');
        INSERT INTO "CandidateDependency" (
          "id", "assertionId", "upstreamAssertionId", "relation", "inheritedLimitations"
        ) VALUES ('dependency-1', 'assertion-2', 'assertion-1', 'derived_from', ARRAY['needs review']);
        INSERT INTO "CandidateReconciliationSnapshot" (
          "id", "runId", "scope", "scopeHash", "payload", "payloadHash", "conflictCount"
        ) VALUES (
          'snapshot-1', 'run-1', '{}', '${hash("8")}',
          '{"namespace":"candidate","kind":"reconciliation","data":{"entries":[{"role":"contradiction","valueType":"flag","value":false}]}}',
          '${hash("9")}', 0
        );
        INSERT INTO "CandidateHumanReviewDecision" (
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "decisionHash", "limitations"
        ) VALUES (
          'review-1', 'assertion-1', 'accepted', 'internal-review-v1', '${hash("a")}',
          'reviewer-1', 'human-review-board', '${hash("4")}', '${hash("b")}',
          '${hash("c")}', '${hash("d")}', ARRAY[]::text[]
        );
        INSERT INTO "CandidatePromotionDecision" (
          "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
          "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
          "policyVersion", "policyHash", "preconditionsHash", "targetRefs",
          "targetSetHash", "result", "resultHash", "decisionHash", "operator", "authority"
        ) VALUES (
          'promotion-1', 'assertion-1', '${hash("4")}', 'review-1', '${hash("d")}',
          'internal-knowledge-v1', '${hash("e")}', 'internal_curated', 'policy-v1',
          '${hash("f")}', '${hash("0")}', '{}', '${hash("1")}',
          '{"status":"recorded"}', '${hash("2")}', '${hash("3")}',
          'operator-1', 'promotion-board'
        );
      `);
      assert.equal(insertChain.status, 0, insertChain.stderr);

      const secondReview = psql(
        copyInsert("CandidateHumanReviewDecision", "review-1", {
          id: "'review-2'",
          assertionId: "'assertion-2'",
          assertionPayloadHash: `'${hash("5")}'`,
          decisionHash: `'${hash("6")}'`,
        }),
      );
      assert.equal(secondReview.status, 0, secondReview.stderr);

      const authorityMismatches = [
        {
          name: "review assertion payload hash",
          constraint: "CandidateHumanReviewDecision_assertionId_assertionPayloadH_fkey",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'review-wrong-hash'",
            assertionPayloadHash: `'${hash("5")}'`,
          }),
        },
        {
          name: "promotion review assertion",
          constraint: "CandidatePromotion_review_receipt_fkey",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'promotion-wrong-review'",
            assertionId: "'assertion-2'",
            assertionPayloadHash: `'${hash("5")}'`,
          }),
        },
        {
          name: "review supersession assertion scope",
          constraint: "CandidateReview_supersession_receipt_scope_fkey",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'review-wrong-assertion-scope'",
            assertionId: "'assertion-2'",
            assertionPayloadHash: `'${hash("5")}'`,
            decisionHash: `'${hash("7")}'`,
            supersededDecisionId: "'review-1'",
            supersededDecisionHash: `'${hash("d")}'`,
          }),
        },
        {
          name: "review supersession profile scope",
          constraint: "CandidateReview_supersession_receipt_scope_fkey",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'review-wrong-profile-scope'",
            reviewProfile: "'external-review-v1'",
            reviewProfileHash: `'${hash("7")}'`,
            decisionHash: `'${hash("8")}'`,
            supersededDecisionId: "'review-1'",
            supersededDecisionHash: `'${hash("d")}'`,
          }),
        },
        {
          name: "promotion supersession assertion scope",
          constraint: "CandidatePromotion_supersession_receipt_scope_fkey",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'promotion-wrong-assertion-scope'",
            assertionId: "'assertion-2'",
            assertionPayloadHash: `'${hash("5")}'`,
            reviewDecisionId: "'review-2'",
            reviewDecisionHash: `'${hash("6")}'`,
            decisionHash: `'${hash("7")}'`,
            supersededDecisionId: "'promotion-1'",
            supersededDecisionHash: `'${hash("3")}'`,
            supersededPolicyHash: `'${hash("f")}'`,
          }),
        },
        {
          name: "promotion supersession target scope",
          constraint: "CandidatePromotion_supersession_receipt_scope_fkey",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'promotion-wrong-target-scope'",
            targetProfile: "'external-publication-v1'",
            targetProfileHash: `'${hash("8")}'`,
            decisionHash: `'${hash("9")}'`,
            supersededDecisionId: "'promotion-1'",
            supersededDecisionHash: `'${hash("3")}'`,
            supersededPolicyHash: `'${hash("f")}'`,
          }),
        },
      ];
      for (const mismatch of authorityMismatches) {
        const rejected = psql(mismatch.sql);
        assert.notEqual(
          rejected.status,
          0,
          `${mismatch.name} unexpectedly succeeded`,
        );
        assert.match(rejected.stderr, new RegExp(mismatch.constraint));
      }

      const candidateTables = [
        "CandidateContentUnit",
        "CandidateAnalysisRun",
        "CandidateAnalysisRunInput",
        "CandidateAnalysisRunEvent",
        "CandidateAnalysisArtifact",
        "CandidateAssertion",
        "CandidateEvidenceLink",
        "CandidateDependency",
        "CandidateReconciliationSnapshot",
        "CandidateHumanReviewDecision",
        "CandidatePromotionDecision",
      ];
      for (const table of candidateTables) {
        for (const statement of [
          `UPDATE "${table}" SET "id" = "id"`,
          `DELETE FROM "${table}"`,
          `TRUNCATE TABLE "${table}" CASCADE`,
        ]) {
          const rejected = psql(statement);
          assert.notEqual(rejected.status, 0, `${statement} unexpectedly succeeded`);
          assert.match(rejected.stderr, /immutable/i);
        }
      }

      const constraintCases = [
        {
          name: "content-unit source version hash",
          constraint: "CandidateContentUnit_sourceVersionHash_check",
          sql: copyInsert("CandidateContentUnit", "unit-1", {
            id: "'invalid-cu-source-version'", sourceKey: "'constraint-cu-1'",
            sourceVersionHash: uppercaseHash,
          }),
        },
        {
          name: "content-unit locator hash",
          constraint: "CandidateContentUnit_locatorHash_check",
          sql: copyInsert("CandidateContentUnit", "unit-1", {
            id: "'invalid-cu-locator'", sourceKey: "'constraint-cu-2'", locatorHash: uppercaseHash,
          }),
        },
        {
          name: "content-unit content hash",
          constraint: "CandidateContentUnit_contentHash_check",
          sql: copyInsert("CandidateContentUnit", "unit-1", {
            id: "'invalid-cu-content'", sourceKey: "'constraint-cu-3'", contentHash: uppercaseHash,
          }),
        },
        {
          name: "content-unit hash algorithm",
          constraint: "CandidateContentUnit_hashAlgorithm_check",
          sql: copyInsert("CandidateContentUnit", "unit-1", {
            id: "'invalid-cu-algorithm'", sourceKey: "'constraint-cu-4'", hashAlgorithm: "'sha512'",
          }),
        },
        {
          name: "content-unit ordinal",
          constraint: "CandidateContentUnit_ordinal_check",
          sql: copyInsert("CandidateContentUnit", "unit-1", {
            id: "'invalid-cu-ordinal'", sourceKey: "'constraint-cu-5'", ordinal: "-1",
          }),
        },
        {
          name: "run scope derivation",
          constraint: "invalid candidate run scope",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-scope'", idempotencyKey: `'${hash("7")}'`, scopeHash: uppercaseHash,
          }),
        },
        {
          name: "run prompt hash",
          constraint: "CandidateAnalysisRun_promptHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-prompt'", idempotencyKey: `'${hash("b")}'`, promptHash: uppercaseHash,
          }),
        },
        {
          name: "run config hash",
          constraint: "CandidateAnalysisRun_configHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-config'", idempotencyKey: `'${hash("c")}'`, configHash: uppercaseHash,
          }),
        },
        {
          name: "run input-envelope hash",
          constraint: "CandidateAnalysisRun_inputEnvelopeHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-input-envelope'", idempotencyKey: `'${hash("d")}'`,
            inputEnvelopeHash: uppercaseHash,
          }),
        },
        {
          name: "run idempotency hash",
          constraint: "CandidateAnalysisRun_idempotencyKey_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-idempotency'", idempotencyKey: uppercaseHash,
          }),
        },
        {
          name: "run attempt",
          constraint: "CandidateAnalysisRun_attempt_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-attempt'", idempotencyKey: `'${hash("e")}'`, attempt: "0",
          }),
        },
        {
          name: "run worker",
          constraint: "CandidateAnalysisRun_workerId_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-worker'", idempotencyKey: `'${hash("f")}'`, workerId: "'   '",
          }),
        },
        {
          name: "run-input position",
          constraint: "CandidateAnalysisRunInput_position_check",
          sql: copyInsert("CandidateAnalysisRunInput", "input-1", {
            id: "'invalid-input-position'", position: "-1",
          }),
        },
        {
          name: "run-input hash",
          constraint: "CandidateAnalysisRunInput_inputHash_check",
          sql: copyInsert("CandidateAnalysisRunInput", "input-1", {
            id: "'invalid-input-hash'", position: "20", inputHash: uppercaseHash,
          }),
        },
        {
          name: "run-event scope hash",
          constraint: "CandidateAnalysisRunEvent_scopeHash_check",
          sql: copyInsert("CandidateAnalysisRunEvent", "event-1", {
            id: "'invalid-event-scope-hash'", sequence: "18", eventHash: `'${hash("6")}'`,
            scopeHash: uppercaseHash,
          }),
        },
        {
          name: "run-event superseded scope hash",
          constraint: "CandidateAnalysisRunEvent_supersededEventScopeHash_check",
          sql: copyInsert("CandidateAnalysisRunEvent", "event-1", {
            id: "'invalid-prior-event-scope-hash'", sequence: "19", eventType: "'superseded'",
            payload: `'${JSON.stringify({ namespace: "candidate", kind: "run_supersession", data: { reason: "replacement" } })}'::jsonb`,
            eventHash: `'${hash("7")}'`, supersededEventId: "'event-1'",
            supersededEventHash: `'${hash("2")}'`, supersededEventScopeHash: uppercaseHash,
          }),
        },
        {
          name: "run-event sequence",
          constraint: "CandidateAnalysisRunEvent_sequence_check",
          sql: copyInsert("CandidateAnalysisRunEvent", "event-1", {
            id: "'invalid-event-sequence'", sequence: "0",
          }),
        },
        {
          name: "run-event hash",
          constraint: "CandidateAnalysisRunEvent_eventHash_check",
          sql: copyInsert("CandidateAnalysisRunEvent", "event-1", {
            id: "'invalid-event-hash'", sequence: "20", eventHash: uppercaseHash,
          }),
        },
        {
          name: "artifact payload hash",
          constraint: "CandidateAnalysisArtifact_payloadHash_check",
          sql: copyInsert("CandidateAnalysisArtifact", "artifact-1", {
            id: "'invalid-artifact-hash'", payloadHash: uppercaseHash,
          }),
        },
        {
          name: "assertion payload hash",
          constraint: "CandidateAssertion_payloadHash_check",
          sql: copyInsert("CandidateAssertion", "assertion-1", {
            id: "'invalid-assertion-hash'", payloadHash: uppercaseHash,
          }),
        },
        {
          name: "assertion confidence lower bound",
          constraint: "CandidateAssertion_confidence_check",
          sql: copyInsert("CandidateAssertion", "assertion-1", {
            id: "'invalid-confidence-low'", payloadHash: `'${hash("0")}'`, confidence: "-0.01",
          }),
        },
        {
          name: "assertion confidence upper bound",
          constraint: "CandidateAssertion_confidence_check",
          sql: copyInsert("CandidateAssertion", "assertion-1", {
            id: "'invalid-confidence-high'", payloadHash: `'${hash("a")}'`, confidence: "1.01",
          }),
        },
        {
          name: "evidence locator hash",
          constraint: "CandidateEvidenceLink_locatorHash_check",
          sql: copyInsert("CandidateEvidenceLink", "evidence-1", {
            id: "'invalid-evidence-locator'", locatorHash: uppercaseHash,
          }),
        },
        {
          name: "evidence excerpt hash",
          constraint: "CandidateEvidenceLink_excerptHash_check",
          sql: copyInsert("CandidateEvidenceLink", "evidence-1", {
            id: "'invalid-evidence-excerpt'", locatorHash: `'${hash("8")}'`, excerptHash: uppercaseHash,
          }),
        },
        {
          name: "reconciliation scope hash",
          constraint: "CandidateReconciliationSnapshot_scopeHash_check",
          sql: copyInsert("CandidateReconciliationSnapshot", "snapshot-1", {
            id: "'invalid-snapshot-scope'", scopeHash: uppercaseHash, payloadHash: `'${hash("a")}'`,
          }),
        },
        {
          name: "reconciliation payload hash",
          constraint: "CandidateReconciliationSnapshot_payloadHash_check",
          sql: copyInsert("CandidateReconciliationSnapshot", "snapshot-1", {
            id: "'invalid-snapshot-payload'", payloadHash: uppercaseHash,
          }),
        },
        {
          name: "reconciliation conflict count",
          constraint: "CandidateReconciliationSnapshot_conflictCount_check",
          sql: copyInsert("CandidateReconciliationSnapshot", "snapshot-1", {
            id: "'invalid-snapshot-conflicts'", payloadHash: `'${hash("b")}'`, conflictCount: "-1",
          }),
        },
        ...[
          ["review profile hash", "reviewProfileHash", "CandidateHumanReviewDecision_reviewProfileHash_check"],
          ["review assertion payload hash", "assertionPayloadHash", "CandidateHumanReviewDecision_assertionPayloadHash_check"],
          ["review source-content-set hash", "sourceContentSetHash", "CandidateHumanReviewDecision_sourceContentSetHash_check"],
          ["review evidence-set hash", "evidenceSetHash", "CandidateHumanReviewDecision_evidenceSetHash_check"],
        ].map(([name, field, constraint], index) => ({
          name,
          constraint,
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: `'invalid-review-hash-${index}'`, [field]: uppercaseHash,
          }),
        })),
        {
          name: "review edited-payload hash",
          constraint: "CandidateHumanReviewDecision_editedPayloadHash_check",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'invalid-review-edited-hash'", editedPayload: "'{}'::jsonb",
            editedPayloadHash: uppercaseHash,
          }),
        },
        {
          name: "review payload without hash",
          constraint: "CandidateHumanReviewDecision_editedPayload_pair_check",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'invalid-review-payload-pair'", editedPayload: "'{}'::jsonb",
          }),
        },
        {
          name: "review hash without payload",
          constraint: "CandidateHumanReviewDecision_editedPayload_pair_check",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'invalid-review-hash-pair'", editedPayloadHash: `'${hash("e")}'`,
          }),
        },
        {
          name: "blank reviewer",
          constraint: "CandidateHumanReviewDecision_reviewer_check",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'invalid-review-reviewer'", reviewer: "'   '",
          }),
        },
        {
          name: "blank review authority",
          constraint: "CandidateHumanReviewDecision_authority_check",
          sql: copyInsert("CandidateHumanReviewDecision", "review-1", {
            id: "'invalid-review-authority'", authority: "'   '",
          }),
        },
        {
          name: "promotion preconditions hash",
          constraint: "CandidatePromotionDecision_preconditionsHash_check",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'invalid-promotion-hash'", preconditionsHash: uppercaseHash,
          }),
        },
        {
          name: "blank promotion operator",
          constraint: "CandidatePromotionDecision_operator_check",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'invalid-promotion-operator'", operator: "'   '",
          }),
        },
        {
          name: "blank promotion authority",
          constraint: "CandidatePromotionDecision_authority_check",
          sql: copyInsert("CandidatePromotionDecision", "promotion-1", {
            id: "'invalid-promotion-authority'", authority: "'   '",
          }),
        },
        {
          name: "dependency direct self-edge",
          constraint: "CandidateDependency_no_self_edge_check",
          sql: `
            INSERT INTO "CandidateDependency" (
              "id", "assertionId", "upstreamAssertionId", "relation", "inheritedLimitations"
            ) VALUES ('self-edge', 'assertion-1', 'assertion-1', 'derived_from', ARRAY[]::text[])
          `,
        },
      ];
      for (const constraintCase of constraintCases) {
        const rejected = psql(constraintCase.sql);
        assert.notEqual(
          rejected.status,
          0,
          `${constraintCase.name} unexpectedly succeeded`,
        );
        assert.match(
          rejected.stderr,
          new RegExp(constraintCase.constraint),
          `${constraintCase.name} failed at the wrong boundary`,
        );
      }

      const wrongOrdinaryEventScope = psql(
        copyInsert("CandidateAnalysisRunEvent", "event-1", {
          id: "'invalid-event-relational-scope'",
          sequence: "21",
          eventHash: `'${hash("8")}'`,
          scopeHash: `'${hash("f")}'`,
        }),
      );
      assert.notEqual(wrongOrdinaryEventScope.status, 0);
      assert.match(
        wrongOrdinaryEventScope.stderr,
        /CandidateRunEvent_run_scope_fkey/,
      );

      const deliberatePublicLeak = psql(
        `GRANT SELECT ON TABLE "CandidateContentUnit" TO PUBLIC`,
      );
      assert.equal(deliberatePublicLeak.status, 0, deliberatePublicLeak.stderr);

      const detectedTableLeak = psql(`
        SELECT table_name, privilege_type
        FROM information_schema.table_privileges
        WHERE grantee = 'PUBLIC'
          AND table_schema = 'public'
          AND table_name LIKE 'Candidate%'
      `);
      assert.equal(detectedTableLeak.status, 0, detectedTableLeak.stderr);
      assert.equal(
        detectedTableLeak.stdout.trim(),
        "CandidateContentUnit|SELECT",
      );
      const removeTableLeak = psql(
        `REVOKE SELECT ON TABLE "CandidateContentUnit" FROM PUBLIC`,
      );
      assert.equal(removeTableLeak.status, 0, removeTableLeak.stderr);

      const deliberateRoutineLeak = psql(
        `GRANT EXECUTE ON FUNCTION public.reject_candidate_history_change() TO PUBLIC`,
      );
      assert.equal(deliberateRoutineLeak.status, 0, deliberateRoutineLeak.stderr);
      const detectedRoutineLeak = psql(`
        SELECT routine_name, privilege_type
        FROM information_schema.routine_privileges
        WHERE grantee = 'PUBLIC'
          AND routine_schema = 'public'
          AND routine_name = 'reject_candidate_history_change'
      `);
      assert.equal(detectedRoutineLeak.status, 0, detectedRoutineLeak.stderr);
      assert.equal(
        detectedRoutineLeak.stdout.trim(),
        "reject_candidate_history_change|EXECUTE",
      );
      const removeRoutineLeak = psql(
        `REVOKE EXECUTE ON FUNCTION public.reject_candidate_history_change() FROM PUBLIC`,
      );
      assert.equal(removeRoutineLeak.status, 0, removeRoutineLeak.stderr);

      const publicGrants = psql(`
        SELECT table_name, privilege_type
        FROM information_schema.table_privileges
        WHERE grantee = 'PUBLIC'
          AND table_schema = 'public'
          AND table_name IN (
            'CandidateContentUnit', 'CandidateAnalysisRun', 'CandidateAnalysisRunInput',
            'CandidateAnalysisRunEvent', 'CandidateAnalysisArtifact', 'CandidateAssertion',
            'CandidateEvidenceLink', 'CandidateDependency', 'CandidateReconciliationSnapshot',
            'CandidateHumanReviewDecision', 'CandidatePromotionDecision'
          )
      `);
      assert.equal(publicGrants.status, 0, publicGrants.stderr);
      assert.equal(publicGrants.stdout.trim(), "");

      const publicRoutineGrants = psql(`
        SELECT routine_name, privilege_type
        FROM information_schema.routine_privileges
        WHERE grantee = 'PUBLIC'
          AND routine_schema = 'public'
          AND routine_name IN (
            'reject_candidate_history_change',
            'candidate_json_number_to_javascript',
            'candidate_canonical_json',
            'reject_invalid_candidate_run_scope',
            'reject_invalid_candidate_machine_payload'
          )
      `);
      assert.equal(publicRoutineGrants.status, 0, publicRoutineGrants.stderr);
      assert.equal(publicRoutineGrants.stdout.trim(), "");
    });
  },
);

test(
  "database rejects event assertion review and promotion self-supersession",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runScope = candidateAnalysisRunScopeHash("run-self");
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'run-self', '${runScope}', 'workflow.candidate_analysis.v1', '1.0.0', 'workflow.md', '${hash("0")}',
          'prompt.candidate_analysis.v1', '1.0.0', 'prompt.md', 'provider', 'model',
          'version', '${hash("1")}', '{}', '${hash("2")}', '${hash("3")}',
          'self test', 'candidate_only', 'worker:self', '${hash("b")}', 1
        );
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash"
        ) VALUES ('event-parent', 'run-self', '${runScope}', 1, 'queued', NULL, '${hash("9")}');
        INSERT INTO "CandidateAssertion" (
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
          "scopeKey", "scopeHash"
        ) VALUES (
          'assertion-parent', 'run-self', 'claim', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"proposition","valueType":"text","value":"parent"}]}}', '${hash("4")}',
          NULL, 'candidate_only', 'provisional', 'no_locator', ARRAY[]::text[],
          'scope:self', '${hash("a")}'
        );
        INSERT INTO "CandidateHumanReviewDecision" (
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "decisionHash", "limitations"
        ) VALUES (
          'review-parent', 'assertion-parent', 'accepted', 'review-v1', '${hash("5")}',
          'reviewer', 'authority', '${hash("4")}', '${hash("6")}', '${hash("7")}', '${hash("b")}',
          ARRAY[]::text[]
        );
        INSERT INTO "CandidatePromotionDecision" (
          "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
          "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
          "policyVersion", "policyHash", "preconditionsHash", "targetRefs",
          "targetSetHash", "result", "resultHash", "decisionHash", "operator", "authority"
        ) VALUES (
          'promotion-parent', 'assertion-parent', '${hash("4")}', 'review-parent', '${hash("b")}',
          'target-v1', '${hash("c")}', 'internal_curated', 'policy-v1', '${hash("d")}',
          '${hash("8")}', '{}', '${hash("e")}', '{}', '${hash("f")}', '${hash("1")}',
          'operator', 'authority'
        );
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const results = [
        psql(`
          INSERT INTO "CandidateAnalysisRunEvent" (
            "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash",
            "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
          ) VALUES (
            'event-self', 'run-self', '${runScope}', 2, 'superseded',
            '{"namespace":"candidate","kind":"run_supersession","data":{"reason":"self"}}', '${hash("2")}',
            'event-self', '${hash("2")}', '${runScope}'
          )
        `),
        psql(`
          INSERT INTO "CandidateAssertion" (
            "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
            "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
            "scopeKey", "scopeHash", "supersededAssertionId", "supersededAssertionPayloadHash"
          ) VALUES (
            'assertion-self', 'run-self', 'claim', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"proposition","valueType":"text","value":"self"}]}}', '${hash("a")}',
            NULL, 'candidate_only', 'provisional', 'no_locator', ARRAY[]::text[],
            'scope:self', '${hash("a")}', 'assertion-self', '${hash("a")}'
          )
        `),
        psql(`
          INSERT INTO "CandidateHumanReviewDecision" (
            "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
            "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
            "evidenceSetHash", "decisionHash", "limitations", "supersededDecisionId",
            "supersededDecisionHash"
          ) VALUES (
            'review-self', 'assertion-parent', 'accepted', 'review-v1', '${hash("5")}',
            'reviewer', 'authority', '${hash("4")}', '${hash("6")}', '${hash("7")}',
            '${hash("c")}', ARRAY[]::text[], 'review-self', '${hash("c")}'
          )
        `),
        psql(`
          INSERT INTO "CandidatePromotionDecision" (
            "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
            "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
            "policyVersion", "policyHash", "preconditionsHash", "targetRefs", "targetSetHash",
            "result", "resultHash", "decisionHash", "operator", "authority",
            "supersededDecisionId", "supersededDecisionHash", "supersededPolicyHash"
          ) VALUES (
            'promotion-self', 'assertion-parent', '${hash("4")}', 'review-parent', '${hash("b")}',
            'target-v1', '${hash("c")}', 'internal_curated', 'policy-v1', '${hash("d")}',
            '${hash("8")}', '{}', '${hash("e")}', '{}', '${hash("f")}', '${hash("2")}',
            'operator', 'authority', 'promotion-self', '${hash("2")}', '${hash("d")}'
          )
        `),
      ];

      assert.deepEqual(
        results.map(({ status }) => status === 0),
        [false, false, false, false],
        results.map(({ stderr }) => stderr).join("\n"),
      );
      for (const result of results) assert.match(result.stderr, /self_supersession/i);
    });
  },
);

test(
  "database supersession foreign keys bind prior ids hashes and authority scope",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runScope = candidateAnalysisRunScopeHash("run-bind");
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'run-bind', '${runScope}', 'workflow.candidate_analysis.v1', '1.0.0', 'workflow.md', '${hash("0")}',
          'prompt.candidate_analysis.v1', '1.0.0', 'prompt.md', 'provider', 'model',
          'version', '${hash("1")}', '{}', '${hash("2")}', '${hash("3")}',
          'binding test', 'candidate_only', 'worker:bind', '${hash("c")}', 1
        );
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash"
        ) VALUES ('event-bind-parent', 'run-bind', '${runScope}', 1, 'queued', NULL, '${hash("4")}');
        INSERT INTO "CandidateAssertion" (
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
          "scopeKey", "scopeHash"
        ) VALUES (
          'assertion-bind-parent', 'run-bind', 'claim', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"proposition","valueType":"text","value":"parent"}]}}', '${hash("5")}',
          NULL, 'candidate_only', 'provisional', 'no_locator', ARRAY[]::text[],
          'scope:bind', '${hash("6")}'
        );
        INSERT INTO "CandidateHumanReviewDecision" (
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "decisionHash", "limitations"
        ) VALUES (
          'review-bind-parent', 'assertion-bind-parent', 'accepted', 'review-v1', '${hash("7")}',
          'reviewer', 'authority', '${hash("5")}', '${hash("8")}', '${hash("9")}',
          '${hash("a")}', ARRAY[]::text[]
        );
        INSERT INTO "CandidatePromotionDecision" (
          "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
          "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
          "policyVersion", "policyHash", "preconditionsHash", "targetRefs", "targetSetHash",
          "result", "resultHash", "decisionHash", "operator", "authority"
        ) VALUES (
          'promotion-bind-parent', 'assertion-bind-parent', '${hash("5")}',
          'review-bind-parent', '${hash("a")}', 'target-v1', '${hash("b")}',
          'internal_curated', 'policy-v1', '${hash("c")}', '${hash("d")}', '{}',
          '${hash("e")}', '{}', '${hash("f")}', '${hash("0")}', 'operator', 'authority'
        );
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const mismatches = [
        {
          constraint: "CandidateRunEvent_supersession_hash_scope_fkey",
          sql: `
            INSERT INTO "CandidateAnalysisRunEvent" (
              "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash",
              "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
            ) VALUES (
              'event-bind-child', 'run-bind', '${runScope}', 2, 'superseded',
              '{"namespace":"candidate","kind":"run_supersession","data":{"reason":"replacement"}}', '${hash("1")}',
              'event-bind-parent', '${hash("2")}', '${runScope}'
            )
          `,
        },
        {
          constraint: "CandidateAssertion_supersession_hash_scope_fkey",
          sql: `
            INSERT INTO "CandidateAssertion" (
              "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
              "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations",
              "scopeKey", "scopeHash", "supersededAssertionId", "supersededAssertionPayloadHash"
            ) VALUES (
              'assertion-bind-child', 'run-bind', 'claim', 'candidate-analysis-v1', '{"namespace":"candidate","kind":"assertion","data":{"entries":[{"role":"proposition","valueType":"text","value":"child"}]}}', '${hash("7")}',
              NULL, 'candidate_only', 'provisional', 'no_locator', ARRAY[]::text[],
              'scope:bind', '${hash("6")}', 'assertion-bind-parent', '${hash("8")}'
            )
          `,
        },
        {
          constraint: "CandidateReview_supersession_receipt_scope_fkey",
          sql: `
            INSERT INTO "CandidateHumanReviewDecision" (
              "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
              "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
              "evidenceSetHash", "decisionHash", "limitations", "supersededDecisionId",
              "supersededDecisionHash"
            ) VALUES (
              'review-bind-child', 'assertion-bind-parent', 'accepted', 'review-v1', '${hash("7")}',
              'reviewer', 'authority', '${hash("5")}', '${hash("8")}', '${hash("9")}',
              '${hash("b")}', ARRAY[]::text[], 'review-bind-parent', '${hash("2")}'
            )
          `,
        },
        {
          constraint: "CandidatePromotion_supersession_receipt_scope_fkey",
          sql: `
            INSERT INTO "CandidatePromotionDecision" (
              "id", "assertionId", "assertionPayloadHash", "reviewDecisionId",
              "reviewDecisionHash", "targetProfile", "targetProfileHash", "state",
              "policyVersion", "policyHash", "preconditionsHash", "targetRefs", "targetSetHash",
              "result", "resultHash", "decisionHash", "operator", "authority",
              "supersededDecisionId", "supersededDecisionHash", "supersededPolicyHash"
            ) VALUES (
              'promotion-bind-child', 'assertion-bind-parent', '${hash("5")}',
              'review-bind-parent', '${hash("a")}', 'target-v1', '${hash("b")}',
              'internal_curated', 'policy-v1', '${hash("c")}', '${hash("d")}', '{}',
              '${hash("e")}', '{}', '${hash("f")}', '${hash("1")}', 'operator', 'authority',
              'promotion-bind-parent', '${hash("2")}', '${hash("c")}'
            )
          `,
        },
      ];
      for (const mismatch of mismatches) {
        const result = psql(mismatch.sql);
        assert.notEqual(result.status, 0);
        assert.match(result.stderr, new RegExp(mismatch.constraint));
      }
    });
  },
);

test(
  "database supersession scope foreign key binds the complete prior event identity",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const runScope = candidateAnalysisRunScopeHash("run-event-scope");
      const emptyManifest = {
        schemaVersion: "candidate-output-manifest-v1" as const,
        inputs: [],
        artifacts: [],
        assertions: [],
        evidenceLinks: [],
        dependencies: [],
        reconciliationSnapshots: [],
      };
      const emptyManifestHash = candidateAnalysisOutputManifestHash(emptyManifest);
      const setup = psql(`
        INSERT INTO "CandidateAnalysisRun" (
          "id", "scopeHash", "workflowId", "workflowVersion", "workflowPath", "workflowHash",
          "promptId", "promptVersion", "promptPath", "modelProvider", "modelName",
          "modelVersion", "promptHash", "config", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'run-event-scope', '${runScope}', 'workflow.candidate_analysis.v1', '1.0.0',
          'workflow.md', '${hash("0")}', 'prompt.candidate_analysis.v1', '1.0.0',
          'prompt.md', 'provider', 'model', 'version', '${hash("1")}', '{}',
          '${hash("2")}', '${hash("3")}', 'event scope', 'candidate_only',
          'worker:event-scope', '${hash("4")}', 1
        );
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash",
          "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
        ) VALUES (
          'event-scope-prior', 'run-event-scope', '${runScope}', 1, 'candidate_completed',
          '{"namespace":"candidate","kind":"run_terminal","data":{"manifest":{"schemaVersion":"candidate-output-manifest-v1","inputs":[],"artifacts":[],"assertions":[],"evidenceLinks":[],"dependencies":[],"reconciliationSnapshots":[]},"manifestHash":"${emptyManifestHash}"}}',
          '${hash("7")}', NULL, NULL, NULL
        )
      `);
      assert.equal(setup.status, 0, setup.stderr);

      const removeOverlappingCheck = psql(`
        ALTER TABLE "CandidateAnalysisRunEvent"
        DROP CONSTRAINT "CandidateAnalysisRunEvent_supersession_binding_check"
      `);
      assert.equal(
        removeOverlappingCheck.status,
        0,
        removeOverlappingCheck.stderr,
      );

      const rejected = psql(`
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "scopeHash", "sequence", "eventType", "payload", "eventHash",
          "supersededEventId", "supersededEventHash", "supersededEventScopeHash"
        ) VALUES (
          'event-scope-child', 'run-event-scope', '${runScope}', 2, 'superseded',
          '{"namespace":"candidate","kind":"run_supersession","data":{"reason":"replacement"}}',
          '${hash("8")}', 'event-scope-prior', '${hash("7")}', '${hash("9")}'
        )
      `);
      assert.notEqual(rejected.status, 0, "false prior scope unexpectedly inserted");
      assert.match(
        rejected.stderr,
        /CandidateRunEvent_supersession_hash_scope_fkey/,
      );
    });
  },
);
