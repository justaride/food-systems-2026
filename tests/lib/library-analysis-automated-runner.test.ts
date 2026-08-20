import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";

import {
  LibraryAnalysisResponseSchema,
  LibraryValidationResponseSchema,
  buildLibraryAnalysisCandidatePlan,
  buildLibraryValidationCandidatePlan,
  buildLibraryAnalysisRequestBatch,
  buildLibraryValidationRequest,
  persistLibraryAnalysisCandidatePlan,
  ingestAnalysisResponsesAtomically,
  libraryAnalysisRequestHash,
  libraryValidationRequestHash,
  parseLibraryAnalysisAutomatedArgs,
  writeLibraryAnalysisPrivateArtifact,
} from "../../src/lib/knowledge/library-analysis-automated-runner";
import { AutomatedLibraryStatusRunConfigSchema } from "../../src/lib/knowledge/library-analysis-automated-status";
import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAssertionInputSchema,
  CandidateEvidenceLinkInputSchema,
  candidateAnalysisEvidenceLocatorHash,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import { createCandidateAnalysisWriter } from "../../src/lib/knowledge/candidate-analysis-writer";
import { buildLibraryAnalysisPopulation } from "../../src/lib/knowledge/library-analysis-population";
import { withCandidateAnalysisPostgres } from "../helpers/candidate-analysis-postgres";

const text = "The source reports 10 tonnes in Norway in 2024.";
const contentHash = createHash("sha256").update(text).digest("hex");
const snapshot = buildLibraryAnalysisPopulation([
  {
    sourceKind: "document",
    sourceKey: "document:runner-1",
    sourceVersionHash: contentHash,
    inputKind: "database_record",
    locator: "database:Document:runner-1:content",
    contentHash,
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  },
  {
    sourceKind: "document",
    sourceKey: "document:blocked",
    sourceVersionHash: null,
    inputKind: "none",
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved",
    readableInput: false,
    superseded: false,
  },
]);

function requestBatch() {
  return buildLibraryAnalysisRequestBatch({
    snapshot,
    contentUnits: [{
      sourceKey: "document:runner-1",
      id: `content:library-analysis:${"a".repeat(64)}`,
      locator: "database:Document:runner-1:content",
      contentHash,
      text,
    }],
    repositoryRoot: process.cwd(),
  });
}

function responseFor(request: ReturnType<typeof requestBatch>["requests"][number]) {
  return LibraryAnalysisResponseSchema.parse({
    schema: "library-analysis-response/v1",
    requestHash: libraryAnalysisRequestHash(request),
    model: {
      provider: "test-provider",
      name: "test-model",
      version: "2026-08-20",
    },
    claims: [{
      claimId: "claim:runner:1",
      assertionType: "quantitative_observation",
      contentUnitId: request.contentUnits[0]!.id,
      text: "The source reports 10 tonnes in Norway in 2024.",
      evidence: "10 tonnes in Norway in 2024",
      locator: request.contentUnits[0]!.locator,
      confidence: 0.9,
    }],
  });
}

test("analysis emission binds the sealed population and covers every eligible source once", () => {
  const batch = requestBatch();
  assert.equal(batch.requests.length, 1);
  assert.equal(batch.populationHash, snapshot.populationHash);
  assert.equal(batch.requests[0]?.populationSnapshotId, snapshot.snapshotId);
  assert.equal(batch.requests[0]?.sourceKey, "document:runner-1");
  assert.equal(batch.requests[0]?.contentUnits[0]?.text, text);
  assert.match(batch.requests[0]?.workflow.hash ?? "", /^[a-f0-9]{64}$/);
  assert.match(batch.requests[0]?.prompt.hash ?? "", /^[a-f0-9]{64}$/);

  assert.throws(() => buildLibraryAnalysisRequestBatch({
    snapshot,
    contentUnits: [],
    repositoryRoot: process.cwd(),
  }), /eligible_source_coverage/);
  assert.throws(() => buildLibraryAnalysisRequestBatch({
    snapshot,
    contentUnits: [{
      ...batch.requests[0]!.contentUnits[0]!,
      text: `${text} drift`,
      sourceKey: "document:runner-1",
    }],
    repositoryRoot: process.cwd(),
  }), /content_hash_mismatch/);
});

test("analysis response is strict and cannot carry authority fields", () => {
  const request = requestBatch().requests[0]!;
  const response = responseFor(request);
  assert.deepEqual(LibraryAnalysisResponseSchema.parse(response), response);
  assert.throws(() => LibraryAnalysisResponseSchema.parse({
    ...response,
    externalReady: true,
  }));
  assert.throws(() => LibraryAnalysisResponseSchema.parse({
    ...response,
    reviewStatus: "approved",
  }));
});

test("a response batch is fully validated before its one transaction starts", async () => {
  const request = requestBatch().requests[0]!;
  const response = responseFor(request);
  let transactions = 0;
  await ingestAnalysisResponsesAtomically({
    requests: [request],
    responses: [response],
    transaction: async (accepted) => {
      transactions += 1;
      assert.equal(accepted.length, 1);
    },
  });
  assert.equal(transactions, 1);

  await assert.rejects(() => ingestAnalysisResponsesAtomically({
    requests: [request],
    responses: [{ ...response, requestHash: "0".repeat(64) }],
    transaction: async () => {
      transactions += 1;
    },
  }));
  assert.equal(transactions, 1);
});

test("accepted analysis becomes a fully sealed candidate writer plan", () => {
  const request = requestBatch().requests[0]!;
  const plan = buildLibraryAnalysisCandidatePlan({
    request,
    response: responseFor(request),
  });
  assert.doesNotThrow(() => CandidateAnalysisRunInputSchema.parse(plan.run));
  assert.doesNotThrow(() => CandidateAnalysisRunEventInputSchema.parse(plan.startedEvent));
  assert.doesNotThrow(() => CandidateAnalysisArtifactInputSchema.parse(plan.artifact));
  for (const assertion of plan.assertions) {
    assert.doesNotThrow(() => CandidateAssertionInputSchema.parse(assertion));
  }
  for (const evidence of plan.evidenceLinks) {
    assert.doesNotThrow(() => CandidateEvidenceLinkInputSchema.parse(evidence));
  }
  assert.doesNotThrow(() => CandidateAnalysisRunEventInputSchema.parse(plan.terminalEvent));
  assert.equal(plan.run.outputProfile, "library_analysis_v1");
  assert.equal(plan.assertions.every(({ machineUse }) => machineUse === "candidate_only"), true);
  assert.equal(plan.terminalEvent.eventType, "candidate_completed");
});

test("validation emission binds analysis manifest and every assertion hash", () => {
  const request = requestBatch().requests[0]!;
  const validation = buildLibraryValidationRequest({
    analysisRequest: request,
    analysisRunId: "run:analysis:1",
    analysisOutputManifestHash: "b".repeat(64),
    assertions: [
      { assertionId: "assertion:2", payloadHash: "2".repeat(64) },
      { assertionId: "assertion:1", payloadHash: "1".repeat(64) },
    ],
    repositoryRoot: process.cwd(),
  });
  assert.deepEqual(
    validation.assertions.map(({ assertionId }) => assertionId),
    ["assertion:1", "assertion:2"],
  );
  assert.equal(validation.analysisOutputManifestHash, "b".repeat(64));
  assert.equal(validation.contentUnits[0]?.text, text);
});

test("validation response is authority-free and becomes a distinct sealed run", () => {
  const analysisRequest = requestBatch().requests[0]!;
  const request = buildLibraryValidationRequest({
    analysisRequest,
    analysisRunId: "run:analysis:1",
    analysisOutputManifestHash: "b".repeat(64),
    assertions: [{ assertionId: "assertion:1", payloadHash: "1".repeat(64) }],
    repositoryRoot: process.cwd(),
  });
  const response = LibraryValidationResponseSchema.parse({
    schema: "library-validation-response/v1",
    requestHash: libraryValidationRequestHash(request),
    model: { provider: "validator", name: "separate-model", version: "1" },
    analysisState: "complete",
    contentHashStatus: "current",
    locatorStatus: "exact",
    validatorSeparation: "separate_model_plus_deterministic",
    riskFlags: [],
    assessedAssertionIds: ["assertion:1"],
    findings: [],
  });
  const plan = buildLibraryValidationCandidatePlan({
    request,
    response,
  });
  assert.equal(plan.run.outputProfile, "library_validation_v1");
  assert.equal(plan.run.id === request.analysisRunId, false);
  assert.equal(plan.dependencies.length, 1);
  assert.equal(plan.dependencies[0]?.upstreamAssertionId, "assertion:1");
  assert.equal(plan.result.automatedOnly, true);
  assert.equal(Object.hasOwn(plan.result, "externalReady"), false);
  const runConfig = AutomatedLibraryStatusRunConfigSchema.parse(plan.run.config);
  assert.equal(runConfig.populationSnapshotId, request.populationSnapshotId);
  assert.equal(runConfig.populationHash, request.populationHash);
  assert.equal(runConfig.sourceKey, request.sourceKey);
  assert.equal(runConfig.automatedResult.automatedOnly, true);
  assert.equal(
    runConfig.validatorSeparationLevel,
    "different_model_same_provider",
  );
  assert.doesNotThrow(() => CandidateAnalysisRunEventInputSchema.parse(plan.terminalEvent));
  assert.throws(() => LibraryValidationResponseSchema.parse({
    ...response,
    reviewStatus: "approved",
  }));
});

test(
  "analysis and independent validation plans persist through only candidate writer APIs",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      const prisma = new PrismaClient({
        adapter: new PrismaPg({ connectionString: adminUrl }),
      });
      try {
        const request = requestBatch().requests[0]!;
        const unit = request.contentUnits[0]!;
        await prisma.candidateContentUnit.create({
          data: {
            id: unit.id,
            sourceKind: request.sourceKind,
            sourceKey: request.sourceKey,
            sourceVersionHash: request.sourceVersionHash,
            unitType: "database_record",
            ordinal: 0,
            locator: unit.locator,
            locatorHash: candidateAnalysisEvidenceLocatorHash(unit.locator),
            contentHash: unit.contentHash,
            hashAlgorithm: "sha256",
            identityConfidence: "exact",
          },
        });
        const writer = createCandidateAnalysisWriter(prisma);
        const analysisPlan = buildLibraryAnalysisCandidatePlan({
          request,
          response: responseFor(request),
        });
        await persistLibraryAnalysisCandidatePlan(writer, analysisPlan);
        const validationRequest = buildLibraryValidationRequest({
          analysisRequest: request,
          analysisRunId: analysisPlan.run.id,
          analysisOutputManifestHash: analysisPlan.outputManifestHash,
          assertions: analysisPlan.assertions.map((assertion) => ({
            assertionId: assertion.id,
            payloadHash: assertion.payloadHash,
          })),
          repositoryRoot: process.cwd(),
        });
        const validationResponse = LibraryValidationResponseSchema.parse({
          schema: "library-validation-response/v1",
          requestHash: libraryValidationRequestHash(validationRequest),
          model: { provider: "validator", name: "separate-model", version: "1" },
          analysisState: "complete",
          contentHashStatus: "current",
          locatorStatus: "exact",
          validatorSeparation: "separate_model_plus_deterministic",
          riskFlags: [],
          assessedAssertionIds: analysisPlan.assertions.map(({ id }) => id),
          findings: [],
        });
        const validationPlan = buildLibraryValidationCandidatePlan({
          request: validationRequest,
          response: validationResponse,
        });
        await writer.createRun(validationPlan.run);
        await writer.appendRunEvent(validationPlan.startedEvent);
        await writer.appendArtifact(validationPlan.artifact);
        await writer.appendAssertion(validationPlan.assertion);
        for (const evidence of validationPlan.evidenceLinks) {
          await writer.appendEvidenceLink(evidence);
        }
        for (const dependency of validationPlan.dependencies) {
          await writer.appendDependency(dependency);
        }
        const [stored] = await prisma.$queryRawUnsafe<Array<{ manifest: unknown }>>(
          "SELECT public.candidate_stored_output_manifest($1) AS manifest",
          validationPlan.run.id,
        );
        assert.deepEqual(
          stored?.manifest,
          validationPlan.terminalEvent.payload?.kind === "run_terminal"
            ? validationPlan.terminalEvent.payload.data.manifest
            : null,
        );
        await writer.appendRunEvent(validationPlan.terminalEvent);
        const states = await prisma.candidateAnalysisRun.findMany({
          where: { id: { in: [analysisPlan.run.id, validationPlan.run.id] } },
          select: { id: true, eventsByScope: { orderBy: { sequence: "asc" }, select: { eventType: true } } },
          orderBy: { id: "asc" },
        });
        assert.equal(states.length, 2);
        assert.equal(states.every(({ eventsByScope }) =>
          eventsByScope.at(-1)?.eventType === "candidate_completed"
        ), true);
      } finally {
        await prisma.$disconnect();
      }
    });
  },
);

test("CLI accepts exactly one mode and required private input output paths", () => {
  assert.deepEqual(parseLibraryAnalysisAutomatedArgs([
    "--emit-analysis",
    "--population=/tmp/population.json",
    "--input=/tmp/content.json",
    "--output=/tmp/requests.json",
  ]), {
    mode: "emit-analysis",
    population: "/tmp/population.json",
    input: "/tmp/content.json",
    output: "/tmp/requests.json",
  });
  assert.throws(() => parseLibraryAnalysisAutomatedArgs([
    "--emit-analysis",
    "--status",
    "--input=/tmp/input.json",
    "--output=/tmp/output.json",
  ]));
  assert.throws(() => parseLibraryAnalysisAutomatedArgs(["--status"]));
});

test("private runner artifacts are mode 0600 and reject symlink outputs", () => {
  const root = mkdtempSync(join(tmpdir(), "library-runner-"));
  try {
    const output = join(root, "requests.json");
    writeLibraryAnalysisPrivateArtifact(output, requestBatch());
    assert.equal(lstatSync(output).mode & 0o777, 0o600);
    assert.match(readFileSync(output, "utf8"), /library-analysis-request\/v1/);

    const link = join(root, "link.json");
    symlinkSync(output, link);
    assert.throws(() => writeLibraryAnalysisPrivateArtifact(link, requestBatch()));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
