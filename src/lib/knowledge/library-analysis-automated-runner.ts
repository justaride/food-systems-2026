import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import { writeCandidateControlSnapshotAtomic } from "../../../scripts/knowledge/export-candidate-control-snapshot";
import {
  CANDIDATE_ANALYSIS_SCHEMA_VERSION,
  CANDIDATE_OUTPUT_MANIFEST_VERSION,
  CANDIDATE_ASSERTION_TYPES,
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAssertionInputSchema,
  CandidateDependencyInputSchema,
  CandidateEvidenceLinkInputSchema,
  candidateAnalysisArtifactPayloadHash,
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisAssertionScopeHash,
  candidateAnalysisConfigHash,
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisInputEnvelopeHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisRunEventHash,
  candidateAnalysisRunIdempotencyKey,
  candidateAnalysisRunScopeHash,
  candidateAnalysisSha256,
  candidateWorkflowProfile,
  type CandidateAnalysisArtifactInput,
  type CandidateAnalysisRunEventInput,
  type CandidateAnalysisRunInput,
  type CandidateAssertionInput,
  type CandidateEvidenceLinkInput,
  type CandidateDependencyInput,
  type CandidateOutputManifest,
} from "./candidate-analysis-contract";
import type { CandidateAnalysisWriter } from "./candidate-analysis-writer";
import {
  AUTOMATED_LIBRARY_RISK_FLAGS,
  AUTOMATED_VALIDATOR_SEPARATION_LEVELS,
  AutomatedValidationFindingSchema,
  deriveAutomatedDisposition,
  type AutomatedLibraryAnalysisResult,
} from "./library-analysis-automated-validation";
import { runDeterministicLibraryGates } from "./library-analysis-evidence-gates";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "./library-analysis-population";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const nonEmptyTextSchema = z.string().min(1);

const WorkflowReferenceSchema = z.object({
  id: identifierSchema,
  version: nonEmptyTextSchema,
  hash: hashSchema,
}).strict();

export const LibraryAnalysisRequestSchema = z.object({
  schema: z.literal("library-analysis-request/v1"),
  populationSnapshotId: nonEmptyTextSchema,
  populationHash: hashSchema,
  sourceKind: identifierSchema,
  sourceKey: identifierSchema,
  sourceVersionHash: hashSchema,
  contentUnits: z.array(z.object({
    id: identifierSchema,
    locator: nonEmptyTextSchema,
    contentHash: hashSchema,
    text: nonEmptyTextSchema,
  }).strict()).min(1),
  workflow: WorkflowReferenceSchema,
  prompt: WorkflowReferenceSchema,
}).strict();

export type LibraryAnalysisRequest = z.infer<
  typeof LibraryAnalysisRequestSchema
>;

export const LibraryAnalysisRequestBatchSchema = z.object({
  schema: z.literal("library-analysis-request-batch/v1"),
  populationSnapshotId: nonEmptyTextSchema,
  populationHash: hashSchema,
  requests: z.array(LibraryAnalysisRequestSchema),
}).strict();

export type LibraryAnalysisRequestBatch = z.infer<
  typeof LibraryAnalysisRequestBatchSchema
>;

export const LibraryAnalysisResponseSchema = z.object({
  schema: z.literal("library-analysis-response/v1"),
  requestHash: hashSchema,
  model: z.object({
    provider: nonEmptyTextSchema,
    name: nonEmptyTextSchema,
    version: nonEmptyTextSchema,
  }).strict(),
  claims: z.array(z.object({
    claimId: identifierSchema,
    assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
    contentUnitId: identifierSchema,
    text: nonEmptyTextSchema,
    evidence: nonEmptyTextSchema,
    locator: nonEmptyTextSchema,
    confidence: z.number().min(0).max(1).nullable(),
  }).strict()).min(1),
}).strict().superRefine((response, context) => {
  const claimIds = response.claims.map(({ claimId }) => claimId);
  if (new Set(claimIds).size !== claimIds.length) {
    context.addIssue({ code: "custom", message: "duplicate_analysis_claim_id" });
  }
});

export type LibraryAnalysisResponse = z.infer<
  typeof LibraryAnalysisResponseSchema
>;

export const LibraryValidationRequestSchema = z.object({
  schema: z.literal("library-validation-request/v1"),
  populationSnapshotId: nonEmptyTextSchema,
  populationHash: hashSchema,
  sourceKind: identifierSchema,
  sourceKey: identifierSchema,
  sourceVersionHash: hashSchema,
  analysisRunId: identifierSchema,
  analysisOutputManifestHash: hashSchema,
  assertions: z.array(z.object({
    assertionId: identifierSchema,
    payloadHash: hashSchema,
  }).strict()).min(1),
  contentUnits: LibraryAnalysisRequestSchema.shape.contentUnits,
  workflow: WorkflowReferenceSchema,
  prompt: WorkflowReferenceSchema,
}).strict();

export type LibraryValidationRequest = z.infer<
  typeof LibraryValidationRequestSchema
>;

export const LibraryValidationResponseSchema = z.object({
  schema: z.literal("library-validation-response/v1"),
  requestHash: hashSchema,
  model: z.object({
    provider: nonEmptyTextSchema,
    name: nonEmptyTextSchema,
    version: nonEmptyTextSchema,
  }).strict(),
  analysisState: z.enum(["complete", "partial", "failed"]),
  contentHashStatus: z.enum(["current", "stale", "missing"]),
  locatorStatus: z.enum(["exact", "partial", "missing"]),
  validatorSeparation: z.enum(AUTOMATED_VALIDATOR_SEPARATION_LEVELS),
  riskFlags: z.array(z.enum(AUTOMATED_LIBRARY_RISK_FLAGS)),
  assessedAssertionIds: z.array(identifierSchema).min(1),
  findings: z.array(AutomatedValidationFindingSchema),
}).strict().superRefine((response, context) => {
  if (
    new Set(response.assessedAssertionIds).size !==
      response.assessedAssertionIds.length
  ) {
    context.addIssue({ code: "custom", message: "duplicate_assessed_assertion_id" });
  }
});

export type LibraryValidationResponse = z.infer<
  typeof LibraryValidationResponseSchema
>;

export type LibraryAnalysisEmissionContentUnit = {
  sourceKey: string;
  id: string;
  locator: string;
  contentHash: string;
  text: string;
};

function repositoryBinding(
  repositoryRoot: string,
  profile: "library_analysis_v1" | "library_validation_v1",
): {
  workflow: z.infer<typeof WorkflowReferenceSchema>;
  prompt: z.infer<typeof WorkflowReferenceSchema>;
} {
  const binding = candidateWorkflowProfile(profile);
  const hash = (path: string) => createHash("sha256")
    .update(readFileSync(resolve(repositoryRoot, path)))
    .digest("hex");
  return {
    workflow: {
      id: binding.workflow.id,
      version: binding.workflow.version,
      hash: hash(binding.workflow.path),
    },
    prompt: {
      id: binding.prompt.id,
      version: binding.prompt.version,
      hash: hash(binding.prompt.path),
    },
  };
}

export function libraryAnalysisRequestHash(
  request: LibraryAnalysisRequest,
): string {
  return candidateAnalysisSha256("library-analysis-request", request);
}

export function libraryValidationRequestHash(
  request: LibraryValidationRequest,
): string {
  return candidateAnalysisSha256("library-validation-request", request);
}

export function buildLibraryAnalysisRequestBatch(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  contentUnits: readonly LibraryAnalysisEmissionContentUnit[];
  repositoryRoot: string;
}): LibraryAnalysisRequestBatch {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const eligible = snapshot.rows.filter((row) => row.eligibility === "eligible");
  const eligibleKeys = new Set(eligible.map(({ sourceKey }) => sourceKey));
  const unitsBySource = new Map<string, LibraryAnalysisEmissionContentUnit[]>();
  const unitIds = new Set<string>();
  for (const unit of input.contentUnits) {
    if (!eligibleKeys.has(unit.sourceKey)) {
      throw new Error("library_analysis_unexpected_source_content");
    }
    if (unitIds.has(unit.id)) throw new Error("duplicate_library_analysis_content_unit");
    unitIds.add(unit.id);
    const actualHash = createHash("sha256").update(Buffer.from(unit.text, "utf8")).digest("hex");
    if (actualHash !== unit.contentHash) {
      throw new Error("library_analysis_request_content_hash_mismatch");
    }
    const units = unitsBySource.get(unit.sourceKey) ?? [];
    units.push(unit);
    unitsBySource.set(unit.sourceKey, units);
  }
  if (
    eligible.some((row) => (unitsBySource.get(row.sourceKey)?.length ?? 0) === 0) ||
    unitsBySource.size !== eligible.length
  ) {
    throw new Error("library_analysis_eligible_source_coverage_mismatch");
  }
  const binding = repositoryBinding(input.repositoryRoot, "library_analysis_v1");
  const requests = eligible.map((row) => {
    if (
      row.sourceVersionHash === null ||
      row.contentHash === null ||
      row.locator === null ||
      row.identityConfidence !== "exact"
    ) {
      throw new Error("library_analysis_eligible_source_binding_invalid");
    }
    const units = [...(unitsBySource.get(row.sourceKey) ?? [])]
      .sort((left, right) => left.id.localeCompare(right.id))
      .map(({ sourceKey: _sourceKey, ...unit }) => unit);
    if (
      units.some((unit) =>
        unit.locator !== row.locator || unit.contentHash !== row.contentHash
      )
    ) {
      throw new Error("library_analysis_request_population_binding_mismatch");
    }
    return LibraryAnalysisRequestSchema.parse({
      schema: "library-analysis-request/v1",
      populationSnapshotId: snapshot.snapshotId,
      populationHash: snapshot.populationHash,
      sourceKind: row.sourceKind,
      sourceKey: row.sourceKey,
      sourceVersionHash: row.sourceVersionHash,
      contentUnits: units,
      ...binding,
    });
  });
  return LibraryAnalysisRequestBatchSchema.parse({
    schema: "library-analysis-request-batch/v1",
    populationSnapshotId: snapshot.snapshotId,
    populationHash: snapshot.populationHash,
    requests,
  });
}

export function buildLibraryValidationRequest(input: {
  analysisRequest: LibraryAnalysisRequest;
  analysisRunId: string;
  analysisOutputManifestHash: string;
  assertions: readonly { assertionId: string; payloadHash: string }[];
  repositoryRoot: string;
}): LibraryValidationRequest {
  const request = LibraryAnalysisRequestSchema.parse(input.analysisRequest);
  const assertions = [...input.assertions]
    .sort((left, right) => left.assertionId.localeCompare(right.assertionId));
  if (
    new Set(assertions.map(({ assertionId }) => assertionId)).size !==
    assertions.length
  ) {
    throw new Error("duplicate_library_validation_assertion");
  }
  return LibraryValidationRequestSchema.parse({
    schema: "library-validation-request/v1",
    populationSnapshotId: request.populationSnapshotId,
    populationHash: request.populationHash,
    sourceKind: request.sourceKind,
    sourceKey: request.sourceKey,
    sourceVersionHash: request.sourceVersionHash,
    analysisRunId: input.analysisRunId,
    analysisOutputManifestHash: input.analysisOutputManifestHash,
    assertions,
    contentUnits: request.contentUnits,
    ...repositoryBinding(input.repositoryRoot, "library_validation_v1"),
  });
}

export type LibraryAnalysisCandidatePlan = {
  run: CandidateAnalysisRunInput;
  startedEvent: CandidateAnalysisRunEventInput;
  artifact: CandidateAnalysisArtifactInput;
  assertions: CandidateAssertionInput[];
  evidenceLinks: CandidateEvidenceLinkInput[];
  terminalEvent: CandidateAnalysisRunEventInput;
  outputManifestHash: string;
};

function sealedRunEvent(
  event: Omit<CandidateAnalysisRunEventInput, "eventHash">,
): CandidateAnalysisRunEventInput {
  return CandidateAnalysisRunEventInputSchema.parse({
    ...event,
    eventHash: candidateAnalysisRunEventHash(event),
  });
}

export function buildLibraryAnalysisCandidatePlan(input: {
  request: LibraryAnalysisRequest;
  response: LibraryAnalysisResponse;
}): LibraryAnalysisCandidatePlan {
  const { request, response } = validateAnalysisResponse(
    LibraryAnalysisRequestSchema.parse(input.request),
    LibraryAnalysisResponseSchema.parse(input.response),
  );
  const responseHash = candidateAnalysisSha256("library-analysis-response", response);
  const runId = `run:library-analysis:${responseHash}`;
  const scopeHash = candidateAnalysisRunScopeHash(runId);
  const inputs = request.contentUnits.map((unit, position) => ({
    contentUnitId: unit.id,
    position,
    inputHash: unit.contentHash,
  }));
  const config = {
    requestHash: response.requestHash,
    responseHash,
    populationHash: request.populationHash,
  };
  const configHash = candidateAnalysisConfigHash(config);
  const inputEnvelopeHash = candidateAnalysisInputEnvelopeHash(inputs);
  const profile = candidateWorkflowProfile("library_analysis_v1");
  const initialEvent = sealedRunEvent({
    id: `event:library-analysis:${responseHash}:queued`,
    runId,
    scopeHash,
    sequence: 1,
    eventType: "queued",
    payload: null,
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  const runWithoutKey = {
    id: runId,
    scopeHash,
    workflowId: request.workflow.id,
    workflowVersion: request.workflow.version,
    workflowPath: profile.workflow.path,
    workflowHash: request.workflow.hash,
    promptId: request.prompt.id,
    promptVersion: request.prompt.version,
    promptPath: profile.prompt.path,
    promptHash: request.prompt.hash,
    modelProvider: response.model.provider,
    modelName: response.model.name,
    modelVersion: response.model.version,
    config,
    configHash,
    inputEnvelopeHash,
    purpose: "Automated library analysis candidate generation",
    outputProfile: "library_analysis_v1" as const,
    workerId: "worker:library-analysis-runner",
    attempt: 1,
    predecessorRunId: null,
    inputs,
    initialEvent,
  };
  const run = CandidateAnalysisRunInputSchema.parse({
    ...runWithoutKey,
    idempotencyKey: candidateAnalysisRunIdempotencyKey(runWithoutKey),
  });
  const startedEvent = sealedRunEvent({
    id: `event:library-analysis:${responseHash}:started`,
    runId,
    scopeHash,
    sequence: 2,
    eventType: "started",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: {
        entries: [{
          role: "checkpoint",
          valueType: "text",
          value: "sealed_analysis_response_ingest_started",
        }],
      },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  const artifactPayload = {
    namespace: "candidate" as const,
    kind: "artifact" as const,
    data: {
      entries: response.claims.map((claim) => ({
        role: "proposition" as const,
        valueType: "text" as const,
        value: claim.text,
      })),
    },
  };
  const artifact = CandidateAnalysisArtifactInputSchema.parse({
    id: `artifact:library-analysis:${responseHash}`,
    runId,
    artifactType: "library_analysis",
    schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    payload: artifactPayload,
    payloadHash: candidateAnalysisArtifactPayloadHash(artifactPayload),
  });
  const assertions = response.claims.map((claim) => {
    const payload = {
      namespace: "candidate" as const,
      kind: "assertion" as const,
      data: {
        entries: [{
          role: "proposition" as const,
          valueType: "text" as const,
          value: claim.text,
        }],
      },
    };
    return CandidateAssertionInputSchema.parse({
      id: `assertion:library-analysis:${candidateAnalysisSha256("library-analysis-claim", {
        responseHash,
        claimId: claim.claimId,
      })}`,
      runId,
      assertionType: claim.assertionType,
      schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
      payload,
      payloadHash: candidateAnalysisAssertionPayloadHash(payload),
      confidence: claim.confidence,
      machineUse: "candidate_only",
      identityConfidence: "exact",
      evidenceLevel: "exact_locator",
      limitations: ["automated_only"],
      scopeKey: claim.claimId,
      scopeHash: candidateAnalysisAssertionScopeHash(claim.claimId),
      supersededAssertionId: null,
      supersededAssertionPayloadHash: null,
      promotionState: "candidate",
    });
  }).sort((left, right) => left.id.localeCompare(right.id));
  const assertionByClaim = new Map(
    response.claims.map((claim) => [
      claim.claimId,
      assertions.find(({ scopeKey }) => scopeKey === claim.claimId)!,
    ]),
  );
  const evidenceLinks = response.claims.map((claim) => {
    const assertion = assertionByClaim.get(claim.claimId)!;
    return CandidateEvidenceLinkInputSchema.parse({
      id: `evidence:library-analysis:${candidateAnalysisSha256("library-analysis-evidence", {
        assertionId: assertion.id,
        contentUnitId: claim.contentUnitId,
        locator: claim.locator,
      })}`,
      assertionId: assertion.id,
      contentUnitId: claim.contentUnitId,
      relation: "supports",
      locator: claim.locator,
      locatorHash: candidateAnalysisEvidenceLocatorHash(claim.locator),
      excerptHash: createHash("sha256")
        .update(Buffer.from(claim.evidence, "utf8"))
        .digest("hex"),
    });
  }).sort((left, right) => left.id.localeCompare(right.id));
  const manifest: CandidateOutputManifest = {
    schemaVersion: CANDIDATE_OUTPUT_MANIFEST_VERSION,
    inputs: request.contentUnits.map((unit, position) => ({
      contentUnitId: unit.id,
      position,
      contentHash: unit.contentHash,
      identityConfidence: "exact",
    })),
    artifacts: [{
      id: artifact.id,
      artifactType: artifact.artifactType,
      schemaVersion: artifact.schemaVersion,
      payloadHash: artifact.payloadHash,
    }],
    assertions: assertions.map((assertion) => ({
      id: assertion.id,
      assertionType: assertion.assertionType,
      schemaVersion: assertion.schemaVersion,
      payloadHash: assertion.payloadHash,
      confidence: assertion.confidence,
      machineUse: assertion.machineUse,
      identityConfidence: assertion.identityConfidence,
      evidenceLevel: assertion.evidenceLevel,
      limitations: assertion.limitations,
      scopeKey: assertion.scopeKey,
      scopeHash: assertion.scopeHash,
      supersededAssertionId: assertion.supersededAssertionId,
      supersededAssertionPayloadHash: assertion.supersededAssertionPayloadHash,
    })),
    evidenceLinks: evidenceLinks.map((evidence) => ({
      id: evidence.id,
      assertionId: evidence.assertionId,
      contentUnitId: evidence.contentUnitId,
      relation: evidence.relation,
      locatorHash: evidence.locatorHash,
      excerptHash: evidence.excerptHash,
    })),
    dependencies: [],
    reconciliationSnapshots: [],
  };
  const outputManifestHash = candidateAnalysisOutputManifestHash(manifest);
  const terminalEvent = sealedRunEvent({
    id: `event:library-analysis:${responseHash}:completed`,
    runId,
    scopeHash,
    sequence: 3,
    eventType: "candidate_completed",
    payload: {
      namespace: "candidate",
      kind: "run_terminal",
      data: { manifest, manifestHash: outputManifestHash },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  return {
    run,
    startedEvent,
    artifact,
    assertions,
    evidenceLinks,
    terminalEvent,
    outputManifestHash,
  };
}

export async function persistLibraryAnalysisCandidatePlan(
  writer: CandidateAnalysisWriter,
  plan: LibraryAnalysisCandidatePlan,
): Promise<void> {
  await writer.createRun(plan.run);
  await writer.appendRunEvent(plan.startedEvent);
  await writer.appendArtifact(plan.artifact);
  for (const assertion of plan.assertions) await writer.appendAssertion(assertion);
  for (const evidence of plan.evidenceLinks) await writer.appendEvidenceLink(evidence);
  await writer.appendRunEvent(plan.terminalEvent);
}

export type LibraryValidationCandidatePlan = {
  run: CandidateAnalysisRunInput;
  startedEvent: CandidateAnalysisRunEventInput;
  artifact: CandidateAnalysisArtifactInput;
  assertion: CandidateAssertionInput;
  evidenceLinks: CandidateEvidenceLinkInput[];
  dependencies: CandidateDependencyInput[];
  terminalEvent: CandidateAnalysisRunEventInput;
  outputManifestHash: string | null;
  result: AutomatedLibraryAnalysisResult;
};

export function buildLibraryValidationCandidatePlan(input: {
  request: LibraryValidationRequest;
  response: LibraryValidationResponse;
}): LibraryValidationCandidatePlan {
  const request = LibraryValidationRequestSchema.parse(input.request);
  const response = LibraryValidationResponseSchema.parse(input.response);
  if (response.requestHash !== libraryValidationRequestHash(request)) {
    throw new Error("library_validation_response_request_hash_mismatch");
  }
  const expectedAssertions = request.assertions.map(({ assertionId }) => assertionId);
  if (
    response.assessedAssertionIds.length !== expectedAssertions.length ||
    [...response.assessedAssertionIds].sort().some(
      (assertionId, index) => assertionId !== expectedAssertions[index],
    )
  ) {
    throw new Error("library_validation_assertion_coverage_mismatch");
  }
  const expectedAssertionSet = new Set(expectedAssertions);
  if (response.findings.some(({ assertionId }) => !expectedAssertionSet.has(assertionId))) {
    throw new Error("library_validation_finding_assertion_mismatch");
  }
  const responseHash = candidateAnalysisSha256("library-validation-response", response);
  const runId = `run:library-validation:${responseHash}`;
  const result = deriveAutomatedDisposition({
    candidateId: runId,
    populationEligibility: "eligible",
    analysisState: response.analysisState,
    contentHashStatus: response.contentHashStatus,
    locatorStatus: response.locatorStatus,
    validatorSeparation: response.validatorSeparation,
    riskFlags: response.riskFlags,
    findings: response.findings,
  });
  const scopeHash = candidateAnalysisRunScopeHash(runId);
  const inputs = request.contentUnits.map((unit, position) => ({
    contentUnitId: unit.id,
    position,
    inputHash: unit.contentHash,
  }));
  const config = {
    requestHash: response.requestHash,
    responseHash,
    analysisRunId: request.analysisRunId,
    analysisOutputManifestHash: request.analysisOutputManifestHash,
  };
  const configHash = candidateAnalysisConfigHash(config);
  const inputEnvelopeHash = candidateAnalysisInputEnvelopeHash(inputs);
  const profile = candidateWorkflowProfile("library_validation_v1");
  const initialEvent = sealedRunEvent({
    id: `event:library-validation:${responseHash}:queued`,
    runId,
    scopeHash,
    sequence: 1,
    eventType: "queued",
    payload: null,
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  const runWithoutKey = {
    id: runId,
    scopeHash,
    workflowId: request.workflow.id,
    workflowVersion: request.workflow.version,
    workflowPath: profile.workflow.path,
    workflowHash: request.workflow.hash,
    promptId: request.prompt.id,
    promptVersion: request.prompt.version,
    promptPath: profile.prompt.path,
    promptHash: request.prompt.hash,
    modelProvider: response.model.provider,
    modelName: response.model.name,
    modelVersion: response.model.version,
    config,
    configHash,
    inputEnvelopeHash,
    purpose: "Automated independent library validation",
    outputProfile: "library_validation_v1" as const,
    workerId: "worker:library-validation-runner",
    attempt: 1,
    predecessorRunId: null,
    inputs,
    initialEvent,
  };
  const run = CandidateAnalysisRunInputSchema.parse({
    ...runWithoutKey,
    idempotencyKey: candidateAnalysisRunIdempotencyKey(runWithoutKey),
  });
  const startedEvent = sealedRunEvent({
    id: `event:library-validation:${responseHash}:started`,
    runId,
    scopeHash,
    sequence: 2,
    eventType: "started",
    payload: {
      namespace: "candidate",
      kind: "run_event",
      data: { entries: [{
        role: "checkpoint",
        valueType: "text",
        value: "sealed_validation_response_ingest_started",
      }] },
    },
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  const validationEntries = response.findings.length === 0
    ? [{
        role: "observation" as const,
        valueType: "text" as const,
        value: "No automated validation findings.",
      }]
    : response.findings.map((finding) => ({
        role: "contradiction" as const,
        valueType: "text" as const,
        value: `${finding.errorClass}: ${finding.explanation}`,
      }));
  const artifactPayload = {
    namespace: "candidate" as const,
    kind: "artifact" as const,
    data: { entries: validationEntries },
  };
  const artifact = CandidateAnalysisArtifactInputSchema.parse({
    id: `artifact:library-validation:${responseHash}`,
    runId,
    artifactType: "library_validation",
    schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    payload: artifactPayload,
    payloadHash: candidateAnalysisArtifactPayloadHash(artifactPayload),
  });
  const assertionPayload = {
    namespace: "candidate" as const,
    kind: "assertion" as const,
    data: { entries: [{
      role: "observation" as const,
      valueType: "text" as const,
      value: `Automated validation disposition: ${result.disposition}`,
    }] },
  };
  const assertionId = `assertion:library-validation:${responseHash}`;
  const limitations = [...new Set(["automated_only", ...result.limitations])].sort();
  const assertion = CandidateAssertionInputSchema.parse({
    id: assertionId,
    runId,
    assertionType: response.findings.length === 0 ? "coverage_signal" : "contradiction",
    schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    payload: assertionPayload,
    payloadHash: candidateAnalysisAssertionPayloadHash(assertionPayload),
    confidence: null,
    machineUse: result.machineUse === "quarantined"
      ? "quarantined"
      : "candidate_only",
    identityConfidence: response.contentHashStatus === "current" ? "exact" : "unresolved",
    evidenceLevel: response.locatorStatus === "exact"
      ? "exact_locator"
      : response.locatorStatus === "partial"
        ? "partial_locator"
        : "no_locator",
    limitations,
    scopeKey: request.analysisRunId,
    scopeHash: candidateAnalysisAssertionScopeHash(request.analysisRunId),
    supersededAssertionId: null,
    supersededAssertionPayloadHash: null,
    promotionState: "candidate",
  });
  const evidenceLinks = request.contentUnits.map((unit) =>
    CandidateEvidenceLinkInputSchema.parse({
      id: `evidence:library-validation:${candidateAnalysisSha256("library-validation-evidence", {
        assertionId,
        contentUnitId: unit.id,
        locator: unit.locator,
      })}`,
      assertionId,
      contentUnitId: unit.id,
      relation: "supports",
      locator: unit.locator,
      locatorHash: candidateAnalysisEvidenceLocatorHash(unit.locator),
      excerptHash: unit.contentHash,
    })
  ).sort((left, right) => left.id.localeCompare(right.id));
  const dependencies = request.assertions.map(({ assertionId: upstreamAssertionId }) =>
    CandidateDependencyInputSchema.parse({
      id: `dependency:library-validation:${candidateAnalysisSha256("library-validation-dependency", {
        assertionId,
        upstreamAssertionId,
      })}`,
      assertionId,
      upstreamAssertionId,
      relation: "validates",
      inheritedLimitations: ["automated_only"],
    })
  ).sort((left, right) => left.id.localeCompare(right.id));
  const manifest: CandidateOutputManifest = {
    schemaVersion: CANDIDATE_OUTPUT_MANIFEST_VERSION,
    inputs: request.contentUnits.map((unit, position) => ({
      contentUnitId: unit.id,
      position,
      contentHash: unit.contentHash,
      identityConfidence: response.contentHashStatus === "current" ? "exact" : "unresolved",
    })),
    artifacts: [{
      id: artifact.id,
      artifactType: artifact.artifactType,
      schemaVersion: artifact.schemaVersion,
      payloadHash: artifact.payloadHash,
    }],
    assertions: [{
      id: assertion.id,
      assertionType: assertion.assertionType,
      schemaVersion: assertion.schemaVersion,
      payloadHash: assertion.payloadHash,
      confidence: assertion.confidence,
      machineUse: assertion.machineUse,
      identityConfidence: assertion.identityConfidence,
      evidenceLevel: assertion.evidenceLevel,
      limitations: assertion.limitations,
      scopeKey: assertion.scopeKey,
      scopeHash: assertion.scopeHash,
      supersededAssertionId: null,
      supersededAssertionPayloadHash: null,
    }],
    evidenceLinks: evidenceLinks.map((evidence) => ({
      id: evidence.id,
      assertionId: evidence.assertionId,
      contentUnitId: evidence.contentUnitId,
      relation: evidence.relation,
      locatorHash: evidence.locatorHash,
      excerptHash: evidence.excerptHash,
    })),
    dependencies: dependencies.map((dependency) => ({
      id: dependency.id,
      assertionId: dependency.assertionId,
      upstreamAssertionId: dependency.upstreamAssertionId,
      relation: dependency.relation,
      inheritedLimitations: dependency.inheritedLimitations,
    })),
    reconciliationSnapshots: [],
  };
  const completed = result.disposition === "candidate_complete" || result.disposition === "partial";
  const outputManifestHash = completed
    ? candidateAnalysisOutputManifestHash(manifest)
    : null;
  const eventType = result.disposition === "candidate_complete"
    ? "candidate_completed"
    : result.disposition === "partial"
      ? "partial_completed"
      : result.disposition === "failed"
        ? "failed"
        : "quarantined";
  const terminalEvent = sealedRunEvent({
    id: `event:library-validation:${responseHash}:terminal`,
    runId,
    scopeHash,
    sequence: 3,
    eventType,
    payload: completed
      ? {
          namespace: "candidate",
          kind: "run_terminal",
          data: { manifest, manifestHash: outputManifestHash! },
        }
      : {
          namespace: "candidate",
          kind: "run_event",
          data: { entries: [{
            role: "reason",
            valueType: "text",
            value: `Automated validation disposition: ${result.disposition}`,
          }] },
        },
    supersededEventId: null,
    supersededEventHash: null,
    supersededEventScopeHash: null,
  });
  return {
    run,
    startedEvent,
    artifact,
    assertion,
    evidenceLinks,
    dependencies,
    terminalEvent,
    outputManifestHash,
    result,
  };
}

export async function persistLibraryValidationCandidatePlan(
  writer: CandidateAnalysisWriter,
  plan: LibraryValidationCandidatePlan,
): Promise<void> {
  await writer.createRun(plan.run);
  await writer.appendRunEvent(plan.startedEvent);
  await writer.appendArtifact(plan.artifact);
  await writer.appendAssertion(plan.assertion);
  for (const evidence of plan.evidenceLinks) await writer.appendEvidenceLink(evidence);
  for (const dependency of plan.dependencies) await writer.appendDependency(dependency);
  await writer.appendRunEvent(plan.terminalEvent);
}

export type AcceptedLibraryAnalysisResponse = {
  request: LibraryAnalysisRequest;
  response: LibraryAnalysisResponse;
};

function validateAnalysisResponse(
  request: LibraryAnalysisRequest,
  rawResponse: LibraryAnalysisResponse,
): AcceptedLibraryAnalysisResponse {
  const response = LibraryAnalysisResponseSchema.parse(rawResponse);
  if (response.requestHash !== libraryAnalysisRequestHash(request)) {
    throw new Error("library_analysis_response_request_hash_mismatch");
  }
  const units = new Map(request.contentUnits.map((unit) => [unit.id, unit]));
  for (const claim of response.claims) {
    const unit = units.get(claim.contentUnitId);
    if (unit === undefined || claim.locator !== unit.locator) {
      throw new Error("library_analysis_claim_content_binding_mismatch");
    }
    const gate = runDeterministicLibraryGates({
      claim: claim.text,
      evidence: claim.evidence,
      sourceText: unit.text,
      locator: claim.locator,
      excerptHash: createHash("sha256").update(Buffer.from(claim.evidence, "utf8")).digest("hex"),
      contentUnitId: unit.id,
      runInputContentUnitIds: request.contentUnits.map(({ id }) => id),
      assertionId: claim.claimId,
    });
    if (gate.findings.length > 0) {
      throw new Error("library_analysis_response_deterministic_gate_failed");
    }
  }
  return { request, response };
}

export async function ingestAnalysisResponsesAtomically(input: {
  requests: readonly LibraryAnalysisRequest[];
  responses: readonly LibraryAnalysisResponse[];
  transaction: (
    accepted: readonly AcceptedLibraryAnalysisResponse[],
  ) => Promise<void>;
}): Promise<void> {
  const requests = input.requests.map((request) => LibraryAnalysisRequestSchema.parse(request));
  const requestByHash = new Map(
    requests.map((request) => [libraryAnalysisRequestHash(request), request]),
  );
  if (requestByHash.size !== requests.length || input.responses.length !== requests.length) {
    throw new Error("library_analysis_response_coverage_mismatch");
  }
  const accepted = input.responses.map((response) => {
    const parsed = LibraryAnalysisResponseSchema.parse(response);
    const request = requestByHash.get(parsed.requestHash);
    if (request === undefined) throw new Error("library_analysis_response_request_missing");
    return validateAnalysisResponse(request, parsed);
  });
  if (new Set(accepted.map(({ response }) => response.requestHash)).size !== requests.length) {
    throw new Error("library_analysis_response_coverage_mismatch");
  }
  await input.transaction(accepted);
}

export type AcceptedLibraryValidationResponse = {
  request: LibraryValidationRequest;
  response: LibraryValidationResponse;
};

export async function ingestValidationResponsesAtomically(input: {
  requests: readonly LibraryValidationRequest[];
  responses: readonly LibraryValidationResponse[];
  transaction: (
    accepted: readonly AcceptedLibraryValidationResponse[],
  ) => Promise<void>;
}): Promise<void> {
  const requests = input.requests.map((request) => LibraryValidationRequestSchema.parse(request));
  const requestByHash = new Map(
    requests.map((request) => [libraryValidationRequestHash(request), request]),
  );
  if (requestByHash.size !== requests.length || input.responses.length !== requests.length) {
    throw new Error("library_validation_response_coverage_mismatch");
  }
  const accepted = input.responses.map((rawResponse) => {
    const response = LibraryValidationResponseSchema.parse(rawResponse);
    const request = requestByHash.get(response.requestHash);
    if (request === undefined) throw new Error("library_validation_response_request_missing");
    buildLibraryValidationCandidatePlan({ request, response });
    return { request, response };
  });
  if (new Set(accepted.map(({ response }) => response.requestHash)).size !== requests.length) {
    throw new Error("library_validation_response_coverage_mismatch");
  }
  await input.transaction(accepted);
}

export type LibraryAnalysisAutomatedCliOptions = {
  mode: "emit-analysis" | "ingest-analysis" | "emit-validation" | "ingest-validation" | "status";
  input: string;
  output: string;
  population?: string;
};

export function parseLibraryAnalysisAutomatedArgs(
  arguments_: readonly string[],
): LibraryAnalysisAutomatedCliOptions {
  const modes = new Map([
    ["--emit-analysis", "emit-analysis"],
    ["--ingest-analysis", "ingest-analysis"],
    ["--emit-validation", "emit-validation"],
    ["--ingest-validation", "ingest-validation"],
    ["--status", "status"],
  ] as const);
  let mode: LibraryAnalysisAutomatedCliOptions["mode"] | null = null;
  const paths: { input?: string; output?: string; population?: string } = {};
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]!;
    const selectedMode = modes.get(argument as
      | "--emit-analysis"
      | "--ingest-analysis"
      | "--emit-validation"
      | "--ingest-validation"
      | "--status");
    if (selectedMode !== undefined) {
      if (mode !== null) throw new Error("multiple_library_analysis_runner_modes");
      mode = selectedMode;
      continue;
    }
    const match = /^--(input|output|population)(?:=(.*))?$/.exec(argument);
    if (match === null) throw new Error("unknown_library_analysis_runner_argument");
    const key = match[1] as "input" | "output" | "population";
    const inline = match[2];
    const value = inline ?? arguments_[index + 1];
    if (inline === undefined) index += 1;
    if (paths[key] !== undefined || !value || /[\u0000-\u001f\u007f]/.test(value)) {
      throw new Error("invalid_library_analysis_runner_path");
    }
    paths[key] = value;
  }
  if (mode === null || paths.input === undefined || paths.output === undefined) {
    throw new Error("library_analysis_runner_arguments_incomplete");
  }
  if ((mode === "emit-analysis") !== (paths.population !== undefined)) {
    throw new Error("library_analysis_runner_population_argument_invalid");
  }
  return {
    mode,
    input: paths.input,
    output: paths.output,
    ...(paths.population === undefined ? {} : { population: paths.population }),
  };
}

export function writeLibraryAnalysisPrivateArtifact(
  output: string,
  value: unknown,
): void {
  writeCandidateControlSnapshotAtomic(output, `${JSON.stringify(value, null, 2)}\n`);
}
