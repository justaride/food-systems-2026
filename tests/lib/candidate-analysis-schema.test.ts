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
  assert.match(
    promotion,
    /fields: \[reviewDecisionId, assertionId\], references: \[id, assertionId\]/,
  );
  assert.match(
    promotion,
    /fields: \[supersededDecisionId, assertionId, targetProfile\], references: \[id, assertionId, targetProfile\]/,
  );
  const humanReview = modelBlock(schema, "CandidateHumanReviewDecision");
  assert.match(
    humanReview,
    /fields: \[assertionId, assertionPayloadHash\], references: \[id, payloadHash\]/,
  );
  assert.match(
    humanReview,
    /fields: \[supersededDecisionId, assertionId, reviewProfile\], references: \[id, assertionId, reviewProfile\]/,
  );
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
      const uppercaseHash = `'${hash("A")}'`;
      const columnsByTable = {
        CandidateContentUnit: [
          "id", "sourceKind", "sourceKey", "sourceVersionHash", "unitType",
          "ordinal", "locator", "locatorHash", "contentHash", "hashAlgorithm",
          "identityConfidence", "createdAt",
        ],
        CandidateAnalysisRun: [
          "id", "workflowId", "workflowVersion", "modelProvider", "modelName",
          "modelVersion", "promptHash", "configHash", "inputEnvelopeHash",
          "purpose", "outputProfile", "workerId", "idempotencyKey", "attempt",
          "predecessorRunId", "createdAt",
        ],
        CandidateAnalysisRunInput: [
          "id", "runId", "contentUnitId", "position", "inputHash", "createdAt",
        ],
        CandidateAnalysisRunEvent: [
          "id", "runId", "sequence", "eventType", "payload", "eventHash", "recordedAt",
        ],
        CandidateAnalysisArtifact: [
          "id", "runId", "artifactType", "schemaVersion", "payload", "payloadHash", "createdAt",
        ],
        CandidateAssertion: [
          "id", "runId", "assertionType", "schemaVersion", "payload", "payloadHash",
          "confidence", "machineUse", "identityConfidence", "evidenceLevel",
          "limitations", "supersededAssertionId", "createdAt",
        ],
        CandidateEvidenceLink: [
          "id", "assertionId", "contentUnitId", "relation", "locator", "locatorHash",
          "excerptHash", "createdAt",
        ],
        CandidateReconciliationSnapshot: [
          "id", "runId", "scopeHash", "payload", "payloadHash", "conflictCount", "createdAt",
        ],
        CandidateHumanReviewDecision: [
          "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
          "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
          "evidenceSetHash", "limitations", "editedPayload", "editedPayloadHash",
          "supersededDecisionId", "createdAt",
        ],
        CandidatePromotionDecision: [
          "id", "assertionId", "reviewDecisionId", "targetProfile", "state",
          "policyVersion", "preconditionsHash", "targetRefs", "result", "operator",
          "authority", "supersededDecisionId", "createdAt",
        ],
      } as const;
      const copyInsert = (
        table: keyof typeof columnsByTable,
        sourceId: string,
        overrides: Record<string, string>,
      ) => {
        const columns = columnsByTable[table];
        return `
          INSERT INTO "${table}" (${columns.map((column) => `"${column}"`).join(", ")})
          SELECT ${columns.map((column) => overrides[column] ?? `"${column}"`).join(", ")}
          FROM "${table}" WHERE "id" = '${sourceId}'
        `;
      };
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

      const authorityMismatches = [
        {
          name: "review assertion payload hash",
          constraint: "CandidateHumanReviewDecision_assertionId_assertionPayloadH_fkey",
          sql: `
            INSERT INTO "CandidateHumanReviewDecision" (
              "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
              "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
              "evidenceSetHash", "limitations"
            ) VALUES (
              'review-wrong-hash', 'assertion-1', 'accepted', 'internal-review-v1', '${hash("a")}',
              'reviewer-1', 'human-review-board', '${hash("5")}', '${hash("b")}',
              '${hash("c")}', ARRAY[]::text[]
            )
          `,
        },
        {
          name: "promotion review assertion",
          constraint: "CandidatePromotionDecision_reviewDecisionId_assertionId_fkey",
          sql: `
            INSERT INTO "CandidatePromotionDecision" (
              "id", "assertionId", "reviewDecisionId", "targetProfile", "state",
              "policyVersion", "preconditionsHash", "targetRefs", "result", "operator", "authority"
            ) VALUES (
              'promotion-wrong-review', 'assertion-2', 'review-1', 'internal-knowledge-v1', 'internal_curated',
              'policy-v1', '${hash("d")}', '{}', '{}', 'operator-1', 'promotion-board'
            )
          `,
        },
        {
          name: "review supersession assertion scope",
          constraint: "CandidateHumanReviewDecision_supersededDecisionId_assertio_fkey",
          sql: `
            INSERT INTO "CandidateHumanReviewDecision" (
              "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
              "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
              "evidenceSetHash", "limitations", "supersededDecisionId"
            ) VALUES (
              'review-wrong-assertion-scope', 'assertion-2', 'accepted', 'internal-review-v1', '${hash("a")}',
              'reviewer-1', 'human-review-board', '${hash("5")}', '${hash("b")}',
              '${hash("c")}', ARRAY[]::text[], 'review-1'
            )
          `,
        },
        {
          name: "review supersession profile scope",
          constraint: "CandidateHumanReviewDecision_supersededDecisionId_assertio_fkey",
          sql: `
            INSERT INTO "CandidateHumanReviewDecision" (
              "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
              "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
              "evidenceSetHash", "limitations", "supersededDecisionId"
            ) VALUES (
              'review-wrong-profile-scope', 'assertion-1', 'accepted', 'external-review-v1', '${hash("a")}',
              'reviewer-1', 'human-review-board', '${hash("4")}', '${hash("b")}',
              '${hash("c")}', ARRAY[]::text[], 'review-1'
            )
          `,
        },
        {
          name: "promotion supersession assertion scope",
          constraint: "CandidatePromotionDecision_supersededDecisionId_assertionI_fkey",
          sql: `
            WITH inserted_review AS (
              INSERT INTO "CandidateHumanReviewDecision" (
                "id", "assertionId", "decision", "reviewProfile", "reviewProfileHash",
                "reviewer", "authority", "assertionPayloadHash", "sourceContentSetHash",
                "evidenceSetHash", "limitations"
              ) VALUES (
                'review-2', 'assertion-2', 'accepted', 'internal-review-v1', '${hash("a")}',
                'reviewer-1', 'human-review-board', '${hash("5")}', '${hash("b")}',
                '${hash("c")}', ARRAY[]::text[]
              ) RETURNING "id"
            )
            INSERT INTO "CandidatePromotionDecision" (
              "id", "assertionId", "reviewDecisionId", "targetProfile", "state",
              "policyVersion", "preconditionsHash", "targetRefs", "result", "operator",
              "authority", "supersededDecisionId"
            ) VALUES (
              'promotion-wrong-assertion-scope', 'assertion-2', (SELECT "id" FROM inserted_review),
              'internal-knowledge-v1', 'internal_curated', 'policy-v1', '${hash("d")}', '{}', '{}',
              'operator-1', 'promotion-board', 'promotion-1'
            )
          `,
        },
        {
          name: "promotion supersession target scope",
          constraint: "CandidatePromotionDecision_supersededDecisionId_assertionI_fkey",
          sql: `
            INSERT INTO "CandidatePromotionDecision" (
              "id", "assertionId", "reviewDecisionId", "targetProfile", "state",
              "policyVersion", "preconditionsHash", "targetRefs", "result", "operator",
              "authority", "supersededDecisionId"
            ) VALUES (
              'promotion-wrong-target-scope', 'assertion-1', 'review-1', 'external-publication-v1',
              'external_eligible', 'policy-v1', '${hash("d")}', '{}', '{}',
              'operator-1', 'promotion-board', 'promotion-1'
            )
          `,
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
          name: "run prompt hash",
          constraint: "CandidateAnalysisRun_promptHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-prompt'", idempotencyKey: "'constraint-run-1'", promptHash: uppercaseHash,
          }),
        },
        {
          name: "run config hash",
          constraint: "CandidateAnalysisRun_configHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-config'", idempotencyKey: "'constraint-run-2'", configHash: uppercaseHash,
          }),
        },
        {
          name: "run input-envelope hash",
          constraint: "CandidateAnalysisRun_inputEnvelopeHash_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-input-envelope'", idempotencyKey: "'constraint-run-3'",
            inputEnvelopeHash: uppercaseHash,
          }),
        },
        {
          name: "run attempt",
          constraint: "CandidateAnalysisRun_attempt_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-attempt'", idempotencyKey: "'constraint-run-4'", attempt: "0",
          }),
        },
        {
          name: "run worker",
          constraint: "CandidateAnalysisRun_workerId_check",
          sql: copyInsert("CandidateAnalysisRun", "run-1", {
            id: "'invalid-run-worker'", idempotencyKey: "'constraint-run-5'", workerId: "'   '",
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
          AND routine_name = 'reject_candidate_history_change'
      `);
      assert.equal(publicRoutineGrants.status, 0, publicRoutineGrants.stderr);
      assert.equal(publicRoutineGrants.stdout.trim(), "");
    });
  },
);
