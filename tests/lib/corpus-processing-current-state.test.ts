import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  buildInitialCorpusLifecycle,
  deriveCorpusLifecyclePermissions,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  CORPUS_STATE_EVENT_SCHEMA_VERSION,
  hashCorpusCurrentState,
  hashCorpusExecutionMembership,
  initializeCorpusCurrentState,
  projectCorpusCurrentState,
  requireTrustedCorpusHumanReviewerAuthentication,
  sealCorpusReadyPackage,
  sealCorpusProcessingStateEvent,
  validateCorpusCurrentState,
  validateCorpusProcessingStateEvent,
  type CorpusArtifactReference,
  type CorpusProcessingStateEvent,
} from "../../src/lib/knowledge/corpus-processing-current-state";

const CONTENT =
  "1bc1fae8f24d37f08704fc4cbfdc57e5c4f258125d1bfbfa3d13867d933da7fc";
const IDENTITY_KEY = "document:cmppajyyw0021njvmam1pbay7";
const RECEIPT_PATH = `knowledge/corpus/pdf-page-extraction/receipts/${CONTENT}.receipt.v1.json`;
const MANIFEST_PATH = `knowledge/corpus/source-analysis-input-manifests/manifests/${CONTENT}.source-analysis-input-manifest.v1.json`;
const BASELINE_MANIFEST_SHA = `sha256:${"a".repeat(64)}`;
const BASELINE_REGISTER_SHA = `sha256:${"b".repeat(64)}`;

const lifecycleJsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/corpus-processing-lifecycle.schema.v1.json",
    "utf8",
  ),
) as object;
const eventJsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/corpus-processing-state-event.schema.v1.json",
    "utf8",
  ),
) as object;
const currentStateJsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/corpus-processing-current-state.schema.v1.json",
    "utf8",
  ),
) as object;
const readyPackageJsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/corpus-ready-for-owner-package.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(lifecycleJsonSchema);
const validateEventJsonSchema = ajv.compile(eventJsonSchema);
const validateCurrentStateJsonSchema = ajv.compile(currentStateJsonSchema);
const validateReadyPackageJsonSchema = ajv.compile(readyPackageJsonSchema);

function fileSha256(path: string): string {
  return `sha256:${createHash("sha256").update(readFileSync(path)).digest("hex")}`;
}

function json(path: string): Record<string, unknown> {
  return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
}

function baselineRow(identityKey = IDENTITY_KEY) {
  const observedAt = "2026-08-02T20:58:11Z";
  const suffix = createHash("sha256")
    .update(identityKey)
    .digest("hex")
    .slice(0, 24);
  const lifecycle = buildInitialCorpusLifecycle({
    recordId: `corpus-record.${suffix}`,
    sourceId: `source.${suffix}`,
    title: "Technical extraction projection fixture",
    sourceRole: "primary_evidence",
    identityKind: "database_record",
    canonicalIdentity: identityKey,
    identityStatus: "provisional",
    metadataSha256: `sha256:${"c".repeat(64)}`,
    contentSha256: `sha256:${CONTENT}`,
    contentHashEvidenceState: "private_capture_attestation_recorded",
    contentHashVerifiedAt: observedAt,
    observedAt,
    fileAvailable: false,
    mediaType: "application/pdf",
  });
  return {
    schemaVersion: "1.0.0" as const,
    recordId: lifecycle.recordId,
    identityKey,
    lifecycle,
    permissions: deriveCorpusLifecyclePermissions(lifecycle),
  };
}

function ref(
  path: string,
  artifactType: CorpusArtifactReference["artifactType"],
  artifactId: string,
  artifactVersion: string,
  artifactSha256: string,
): CorpusArtifactReference {
  return {
    artifactType,
    artifactId,
    artifactVersion,
    path,
    fileSha256: fileSha256(path),
    artifactSha256: artifactSha256.startsWith("sha256:")
      ? artifactSha256
      : `sha256:${artifactSha256}`,
  };
}

function technicalEvent(
  state: ReturnType<typeof initializeCorpusCurrentState>,
  overrides: Partial<Omit<CorpusProcessingStateEvent, "eventSha256">> = {},
): CorpusProcessingStateEvent {
  const receipt = json(RECEIPT_PATH) as {
    pipelineVersion: string;
    receiptSha256: string;
  };
  const manifest = json(MANIFEST_PATH) as {
    pipelineVersion: string;
    manifestSha256: string;
    normalizedInput: { sha256: string };
    totals: { normalizedCharacterCount: number };
  };
  const event = {
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "technical_text_extracted" as const,
    eventId: "event.technical.fixture.1",
    globalSequence: 1,
    previousGlobalEventSha256: null,
    identitySequence: 1,
    previousIdentityEventSha256: null,
    target: {
      recordId: state.recordId,
      identityKey: state.identityKey,
      baselineRowSha256: state.baselineBinding.baselineRowSha256,
      preStateVersion: state.stateVersion,
      preStateSha256: state.stateSha256,
      preStateLifecycleSha256: state.lifecycleSha256,
    },
    occurredAt: "2026-08-03T08:00:00Z",
    payload: {
      qualificationReceiptRef: ref(
        RECEIPT_PATH,
        "pdf_technical_qualification",
        `artifact.pdf_extraction.${CONTENT}`,
        receipt.pipelineVersion,
        receipt.receiptSha256,
      ),
      inputManifestRef: ref(
        MANIFEST_PATH,
        "source_analysis_input_manifest",
        `artifact.source_analysis_input.${manifest.manifestSha256}`,
        manifest.pipelineVersion,
        manifest.manifestSha256,
      ),
      textAvailability: {
        state: "full_text" as const,
        textSha256: `sha256:${manifest.normalizedInput.sha256}`,
        characterCount: manifest.totals.normalizedCharacterCount,
        extractionMethod: "born_digital" as const,
        observedAt: "2026-08-03T08:00:00Z",
      },
    },
    ...overrides,
  };
  return validateCorpusProcessingStateEvent(
    sealCorpusProcessingStateEvent(event),
  );
}

const resolver = (reference: CorpusArtifactReference) => ({
  value: json(reference.path),
  fileSha256: fileSha256(reference.path),
  bytes: readFileSync(reference.path),
});

test("initializes a sealed current state with schema parity and no inferred progress", () => {
  const row = baselineRow();
  const state = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: row,
  });
  assert.equal(
    validateCurrentStateJsonSchema(state),
    true,
    JSON.stringify(validateCurrentStateJsonSchema.errors),
  );
  assert.equal(state.stateVersion, 0);
  assert.equal(state.lifecycle.aiProcessingStatus.currentStage, "inventory");
  assert.deepEqual(state.appliedEvents, []);
  assert.ok(
    Object.values(state.latestArtifacts).every((value) => value === null),
  );
});

test("rejects a resealed current state whose event prefix and artifact bindings disagree", () => {
  const row = baselineRow();
  const initial = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: row,
  });
  const event = technicalEvent(initial);
  const projected = projectCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRows: [row],
    events: [event],
    resolveArtifact: resolver,
  })[0]!;

  const wrongPrefix = structuredClone(projected);
  wrongPrefix.appliedEvents[0]!.eventType = "identity_verified";
  wrongPrefix.stateSha256 = hashCorpusCurrentState(wrongPrefix);
  assert.throws(
    () => validateCorpusCurrentState(wrongPrefix),
    /exact non-repeating v1 lifecycle prefix/,
  );

  const missingArtifact = structuredClone(projected);
  missingArtifact.latestArtifacts.inputManifest = null;
  missingArtifact.stateSha256 = hashCorpusCurrentState(missingArtifact);
  assert.throws(
    () => validateCorpusCurrentState(missingArtifact),
    /artifact bindings do not match/,
  );

  const wrongArtifactType = structuredClone(projected);
  wrongArtifactType.latestArtifacts.technicalQualification!.artifactType =
    "source_analysis" as never;
  wrongArtifactType.stateSha256 = hashCorpusCurrentState(wrongArtifactType);
  assert.equal(validateCurrentStateJsonSchema(wrongArtifactType), false);
  assert.throws(
    () => validateCorpusCurrentState(wrongArtifactType),
    /current-state schema invalid/,
  );
});

test("accepts only a sealed four-type event contract in both runtime and JSON schema", () => {
  const state = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: baselineRow(),
  });
  const event = technicalEvent(state);
  if (event.eventType !== "technical_text_extracted") {
    throw new Error("Technical event fixture returned the wrong event type");
  }
  assert.equal(
    validateEventJsonSchema(event),
    true,
    JSON.stringify(validateEventJsonSchema.errors),
  );
  const tampered = structuredClone(event);
  tampered.occurredAt = "2026-08-03T08:01:00Z";
  assert.throws(
    () => validateCorpusProcessingStateEvent(tampered),
    /self-hash mismatch/,
  );
  assert.equal(
    validateEventJsonSchema({ ...event, eventType: "owner_approved" }),
    false,
  );

  const identityWithoutAcquisition = sealCorpusProcessingStateEvent({
    ...event,
    eventType: "identity_verified",
    eventId: "event.identity.missing-acquisition",
    payload: {
      identityArtifactRef: {
        ...event.payload.inputManifestRef,
        artifactType: "source_identity_verification",
      },
    },
  });
  assert.equal(validateEventJsonSchema(identityWithoutAcquisition), false);
  assert.throws(
    () => validateCorpusProcessingStateEvent(identityWithoutAcquisition),
    /acquisitionReceiptRef|sourceContentRef/,
  );
});

test("seals a ready package without conflating it with owner approval", () => {
  const readyPackage = sealCorpusReadyPackage({
    schemaVersion: "corpus-ready-for-owner-package-v1",
    artifactType: "ready_for_owner_package",
    artifactId: "artifact.ready.fixture",
    artifactVersion: "1.0.0",
    lifecyclePreStateSha256: `sha256:${"1".repeat(64)}`,
    sourceAnalysisArtifactSha256: `sha256:${"2".repeat(64)}`,
    sourceRoleReceiptSha256: `sha256:${"3".repeat(64)}`,
    createdAt: "2026-08-03T08:00:00Z",
  });
  assert.equal(
    validateReadyPackageJsonSchema(readyPackage),
    true,
    JSON.stringify(validateReadyPackageJsonSchema.errors),
  );
  assert.equal("ownerApprovalReceipt" in readyPackage, false);
});

test("keeps named-human receipts candidate-only until a trusted verifier authenticates them", () => {
  const input = {
    reviewer: {
      reviewerType: "named_human" as const,
      reviewerId: "human.project-owner.fixture",
      name: "Project Owner",
      role: "project_owner" as const,
      organization: "Food Systems 2026",
      authentication: {
        state: "verified" as const,
        method: "controlled_project_identity" as const,
        evidenceSha256: `sha256:${"e".repeat(64)}`,
        authenticatedAt: "2026-08-03T08:00:00Z",
      },
    },
    receiptSha256: `sha256:${"f".repeat(64)}`,
    eventId: "event.human-auth.fixture",
    eventSha256: `sha256:${"1".repeat(64)}`,
  };
  assert.throws(
    () => requireTrustedCorpusHumanReviewerAuthentication(input, undefined),
    /trusted human reviewer authentication verifier is not configured/,
  );
  assert.throws(
    () => requireTrustedCorpusHumanReviewerAuthentication(input, () => false),
    /trusted human reviewer authentication verification failed/,
  );
  assert.doesNotThrow(() =>
    requireTrustedCorpusHumanReviewerAuthentication(input, () => true),
  );
});

test("rejects a source-analysis event that tries to skip cross_check into owner readiness", () => {
  const row = baselineRow();
  const state = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: row,
  });
  const stages = [
    "triage",
    "full_text",
    "locator",
    "claims",
    "ready_for_owner",
  ] as const;
  const outputs = stages.map(
    (_, index) => `sha256:${String(index + 1).repeat(64)}`,
  );
  const runId = "ai.run.invalid.ready.skip";
  const lifecycleRun = {
    runId,
    provider: "OpenAI",
    model: "research-model",
    modelVersionState: "runtime_not_exposed" as const,
    modelVersion: "runtime_not_exposed",
    workflowRef: "workflow.source-analysis-bridge.v1",
    stages: [...stages],
    checkpoints: stages.map((stage, index) => ({
      stage,
      inputSha256:
        index === 0
          ? state.lifecycle.sourceIdentity.contentSha256!
          : outputs[index - 1]!,
      outputSha256: outputs[index]!,
      completedAt: `2026-08-03T08:0${index + 1}:00Z`,
    })),
    inputSha256: state.lifecycle.sourceIdentity.contentSha256!,
    outputSha256: outputs.at(-1)!,
    timeEvidence: "coordinator_observed_window" as const,
    timeEvidenceExplanation:
      "Coordinator recorded a bounded observation window without inventing provider timestamps.",
    startedAt: "2026-08-03T08:00:00Z",
    completedAt: "2026-08-03T08:05:00Z",
  };
  const artifactRef = (
    artifactType:
      | "source_analysis"
      | "source_identity_verification"
      | "source_analysis_input_manifest",
  ) => ({
    artifactType,
    artifactId: `artifact.${artifactType}.fixture`,
    artifactVersion: "1.0.0",
    path: `knowledge/corpus/fixtures/${artifactType}.json`,
    fileSha256: `sha256:${"8".repeat(64)}`,
    artifactSha256: `sha256:${"9".repeat(64)}`,
  });
  const invalidEvent = sealCorpusProcessingStateEvent({
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "source_analysis_applied",
    eventId: "event.analysis.invalid-ready-skip",
    globalSequence: 1,
    previousGlobalEventSha256: null,
    identitySequence: 1,
    previousIdentityEventSha256: null,
    target: {
      recordId: state.recordId,
      identityKey: state.identityKey,
      baselineRowSha256: state.baselineBinding.baselineRowSha256,
      preStateVersion: state.stateVersion,
      preStateSha256: state.stateSha256,
      preStateLifecycleSha256: state.lifecycleSha256,
    },
    occurredAt: "2026-08-03T08:06:00Z",
    payload: {
      analysisArtifactRef: artifactRef("source_analysis"),
      identityArtifactRef: artifactRef("source_identity_verification"),
      inputManifestRef: artifactRef("source_analysis_input_manifest"),
      executionBinding: {
        processingUnitSha256: state.lifecycle.sourceIdentity.contentSha256!,
        executionSha256: `sha256:${"7".repeat(64)}`,
        membershipIdentityKeys: [state.identityKey],
        membershipSha256: hashCorpusExecutionMembership([state.identityKey]),
        applicationMode: "single_identity_event",
        automaticFanOutAllowed: false,
      },
      lifecycleRun,
      stageEvidence: stages.map((stage, index) => ({
        stage,
        method: "ai_assisted" as const,
        runId,
        checkpointIndex: index,
        artifactId: `artifact.stage.${stage}`,
        artifactVersion: "1.0.0",
        outputSha256: outputs[index]!,
        completedAt: `2026-08-03T08:0${index + 1}:00Z`,
      })),
    },
  });
  assert.equal(validateEventJsonSchema(invalidEvent), false);
  assert.throws(
    () => validateCorpusProcessingStateEvent(invalidEvent),
    /exact cross_check lifecycle boundary/,
  );
});

test("projects one technical event without automatically changing another identity with the same bytes", () => {
  const first = baselineRow();
  const second = baselineRow("document:same-bytes-not-a-member");
  const initial = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: first,
  });
  const event = technicalEvent(initial);
  const states = projectCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRows: [first, second],
    events: [event],
    resolveArtifact: resolver,
  });
  const applied = states.find((state) => state.identityKey === IDENTITY_KEY)!;
  const untouched = states.find(
    (state) => state.identityKey === second.identityKey,
  )!;
  assert.equal(applied.stateVersion, 1);
  assert.equal(applied.lifecycle.textAvailability.state, "full_text");
  assert.equal(untouched.stateVersion, 0);
  assert.equal(untouched.lifecycle.textAvailability.state, "unavailable");
  assert.equal(
    validateCurrentStateJsonSchema(applied),
    true,
    JSON.stringify(validateCurrentStateJsonSchema.errors),
  );
});

test("binds every resolved artifact value to the exact verified file bytes", () => {
  const row = baselineRow();
  const initial = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: row,
  });
  const event = technicalEvent(initial);
  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [row],
        events: [event],
        resolveArtifact: (reference) => {
          const resolved = resolver(reference);
          return {
            ...resolved,
            value: {
              ...(resolved.value as object),
              schemaVersion: "fabricated",
            },
          };
        },
      }),
    /artifact value differs from its verified bytes/,
  );
});

test("rejects a cross-identity global timestamp regression", () => {
  const firstRow = baselineRow();
  const secondRow = baselineRow("document:second-timestamp-target");
  const firstState = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: firstRow,
  });
  const secondState = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: secondRow,
  });
  const first = technicalEvent(firstState);
  const secondBase = technicalEvent(secondState);
  if (secondBase.eventType !== "technical_text_extracted") {
    throw new Error("Technical event fixture returned the wrong event type");
  }
  const second = validateCorpusProcessingStateEvent(
    sealCorpusProcessingStateEvent({
      ...secondBase,
      eventId: "event.technical.timestamp-regression",
      globalSequence: 2,
      previousGlobalEventSha256: first.eventSha256,
      occurredAt: "2026-08-03T07:59:00Z",
      payload: {
        ...secondBase.payload,
        textAvailability: {
          ...secondBase.payload.textAvailability,
          observedAt: "2026-08-03T07:59:00Z",
        },
      },
    }),
  );
  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [firstRow, secondRow],
        events: [first, second],
        resolveArtifact: resolver,
      }),
    /global timestamp regression/,
  );
});

test("rejects duplicate, forked, stale and orphan event chains before publishing partial state", () => {
  const row = baselineRow();
  const initial = initializeCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRow: row,
  });
  const first = technicalEvent(initial);
  const common = {
    globalSequence: 2,
    previousGlobalEventSha256: first.eventSha256,
    eventId: "event.technical.fixture.2",
  };
  const fork = technicalEvent(initial, common);
  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [row],
        events: [first, fork],
        resolveArtifact: resolver,
      }),
    /identity-chain fork/,
  );

  const afterFirst = projectCorpusCurrentState({
    baselineId: "whole-corpus-processing-baseline.v1",
    baselineManifestSha256: BASELINE_MANIFEST_SHA,
    baselineRegisterSha256: BASELINE_REGISTER_SHA,
    baselineRows: [row],
    events: [first],
    resolveArtifact: resolver,
  })[0]!;
  const stale = technicalEvent(initial, {
    ...common,
    identitySequence: 2,
    previousIdentityEventSha256: first.eventSha256,
    target: {
      recordId: initial.recordId,
      identityKey: initial.identityKey,
      baselineRowSha256: initial.baselineBinding.baselineRowSha256,
      preStateVersion: 0,
      preStateSha256: initial.stateSha256,
      preStateLifecycleSha256: initial.lifecycleSha256,
    },
  } as never);
  assert.equal(afterFirst.stateVersion, 1);
  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [row],
        events: [first, stale],
        resolveArtifact: resolver,
      }),
    /does not bind the exact baseline and pre-state/,
  );

  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [row],
        events: [first, first],
        resolveArtifact: resolver,
      }),
    /duplicate event ID/,
  );

  const orphan = technicalEvent(initial, {
    target: { ...first.target, identityKey: "document:orphan" },
  } as never);
  assert.throws(
    () =>
      projectCorpusCurrentState({
        baselineId: "whole-corpus-processing-baseline.v1",
        baselineManifestSha256: BASELINE_MANIFEST_SHA,
        baselineRegisterSha256: BASELINE_REGISTER_SHA,
        baselineRows: [row],
        events: [orphan],
        resolveArtifact: resolver,
      }),
    /orphan identity or record/,
  );
});
