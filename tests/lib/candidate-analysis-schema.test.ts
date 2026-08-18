import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

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
  assert.doesNotMatch(
    modelBlock(schema, "CandidateAssertion"),
    /reviewed|published|externalReady/i,
  );
});

test("migration makes every candidate history table immutable and private from PUBLIC", () => {
  const sql = readFileSync(
    "prisma/migrations/20260818_candidate_analysis_foundation/migration.sql",
    "utf8",
  );
  assert.match(sql, /CREATE FUNCTION public\.reject_candidate_history_change\(\)/);
  assert.equal((sql.match(/reject_update_delete/g) ?? []).length, 11);
  assert.equal((sql.match(/reject_truncate/g) ?? []).length, 11);
  assert.equal((sql.match(/REVOKE ALL PRIVILEGES ON TABLE/g) ?? []).length, 11);
});

test(
  "candidate history remains append-only and rejects invalid provenance data in PostgreSQL",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ psql }) => {
      const hash = (character: string) => character.repeat(64);
      const insertChain = psql(`
        INSERT INTO "CandidateContentUnit" (
          "id", "sourceKind", "sourceKey", "sourceVersionHash", "unitType",
          "ordinal", "locator", "locatorHash", "contentHash", "identityConfidence"
        ) VALUES (
          'unit-1', 'document', 'source-1', '${hash("a")}', 'pdf_page',
          0, 'page:1', '${hash("b")}', '${hash("c")}', 'exact'
        );
        INSERT INTO "CandidateAnalysisRun" (
          "id", "workflowId", "workflowVersion", "modelProvider", "modelName",
          "modelVersion", "promptHash", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt"
        ) VALUES (
          'run-1', 'workflow-1', 'v1', 'provider', 'model', 'model-v1',
          '${hash("d")}', '${hash("e")}', '${hash("f")}', 'candidate analysis',
          'candidate-v1', 'worker-1', 'run-key-1', 1
        );
        INSERT INTO "CandidateAnalysisRunInput" (
          "id", "runId", "contentUnitId", "position", "inputHash"
        ) VALUES ('input-1', 'run-1', 'unit-1', 0, '${hash("1")}');
        INSERT INTO "CandidateAnalysisRunEvent" (
          "id", "runId", "sequence", "eventType", "payload", "eventHash"
        ) VALUES ('event-1', 'run-1', 1, 'queued', '{}', '${hash("2")}');
        INSERT INTO "CandidateAnalysisArtifact" (
          "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash"
        ) VALUES ('artifact-1', 'run-1', 'analysis', 'candidate-analysis-v1', '{}', '${hash("3")}');
        INSERT INTO "CandidateAssertion" (
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations"
        ) VALUES
          ('assertion-1', 'run-1', 'claim', 'candidate-analysis-v1', '{"claim":"one"}', '${hash("4")}',
           0.75, 'candidate_only', 'exact', 'exact_locator', ARRAY[]::text[]),
          ('assertion-2', 'run-1', 'gap', 'candidate-analysis-v1', '{"gap":"two"}', '${hash("5")}',
           NULL, 'quarantined', 'provisional', 'partial_locator', ARRAY['needs review']);
        INSERT INTO "CandidateEvidenceLink" (
          "id", "assertionId", "contentUnitId", "relation", "locator", "locatorHash", "excerptHash"
        ) VALUES ('evidence-1', 'assertion-1', 'unit-1', 'supports', 'page:1', '${hash("6")}', '${hash("7")}');
        INSERT INTO "CandidateDependency" (
          "id", "assertionId", "upstreamAssertionId", "relation", "inheritedLimitations"
        ) VALUES ('dependency-1', 'assertion-2', 'assertion-1', 'derived_from', ARRAY['needs review']);
        INSERT INTO "CandidateReconciliationSnapshot" (
          "id", "runId", "scopeHash", "payload", "payloadHash", "conflictCount"
        ) VALUES ('snapshot-1', 'run-1', '${hash("8")}', '{}', '${hash("9")}', 0);
        INSERT INTO "CandidateHumanReviewDecision" (
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "limitations"
        ) VALUES (
          'review-1', 'assertion-1', 'accepted', 'internal-review-v1', '${hash("a")}',
          'reviewer-1', 'human-review-board', '${hash("4")}', '${hash("b")}',
          '${hash("c")}', ARRAY[]::text[]
        );
        INSERT INTO "CandidatePromotionDecision" (
          "id", "assertionId", "reviewDecisionId", "targetProfile", "state",
          "policyVersion", "preconditionsHash", "targetRefs", "result", "operator", "authority"
        ) VALUES (
          'promotion-1', 'assertion-1', 'review-1', 'internal-knowledge-v1', 'internal_curated',
          'policy-v1', '${hash("d")}', '{}', '{"status":"recorded"}', 'operator-1', 'promotion-board'
        );
      `);
      assert.equal(insertChain.status, 0, insertChain.stderr);

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

      const invalidHash = psql(`
        INSERT INTO "CandidateContentUnit" (
          "id", "sourceKind", "sourceKey", "sourceVersionHash", "unitType",
          "ordinal", "locator", "locatorHash", "contentHash", "identityConfidence"
        ) VALUES (
          'invalid-hash', 'document', 'source-2', 'not-a-hash', 'pdf_page',
          0, 'page:2', '${hash("a")}', '${hash("b")}', 'exact'
        )
      `);
      assert.notEqual(invalidHash.status, 0);
      assert.match(invalidHash.stderr, /sourceVersionHash_check/);

      const invalidConfidence = psql(`
        INSERT INTO "CandidateAssertion" (
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel", "limitations"
        ) VALUES (
          'invalid-confidence', 'run-1', 'claim', 'candidate-analysis-v1', '{}', '${hash("6")}',
          1.01, 'candidate_only', 'exact', 'exact_locator', ARRAY[]::text[]
        )
      `);
      assert.notEqual(invalidConfidence.status, 0);
      assert.match(invalidConfidence.stderr, /confidence_check/);

      const selfEdge = psql(`
        INSERT INTO "CandidateDependency" (
          "id", "assertionId", "upstreamAssertionId", "relation", "inheritedLimitations"
        ) VALUES ('self-edge', 'assertion-1', 'assertion-1', 'derived_from', ARRAY[]::text[])
      `);
      assert.notEqual(selfEdge.status, 0);
      assert.match(selfEdge.stderr, /no_self_edge_check/);

      const publicGrants = psql(`
        SELECT table_name
        FROM information_schema.role_table_grants
        WHERE grantee = 'PUBLIC'
          AND table_schema = 'public'
          AND table_name LIKE 'Candidate%'
      `);
      assert.equal(publicGrants.status, 0, publicGrants.stderr);
      assert.equal(publicGrants.stdout.trim(), "");
    });
  },
);
