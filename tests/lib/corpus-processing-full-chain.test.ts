import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  deriveCorpusLifecyclePermissions,
  validateCorpusLifecycle,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  CORPUS_STATE_EVENT_SCHEMA_VERSION,
  initializeCorpusCurrentState,
  projectCorpusCurrentState,
  sealCorpusProcessingStateEvent,
  sourceAnalysisVerifiedInputManifestPath,
  validateCorpusCurrentState,
  type CorpusArtifactReference,
  type CorpusProcessingCurrentState,
  type CorpusProcessingStateEvent,
  type ResolveCorpusArtifact,
  type ResolveCorpusNormalizedText,
  type ResolveCorpusSourceContent,
} from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
  SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  SOURCE_ANALYSIS_WORKFLOW_ID,
  SOURCE_ANALYSIS_WORKFLOW_VERSION,
} from "../../src/lib/knowledge/source-analysis-artifact";
import {
  sealSourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  SOURCE_IDENTITY_PROMPT_TEMPLATE_ID,
  SOURCE_IDENTITY_PROMPT_TEMPLATE_VERSION,
  SOURCE_IDENTITY_WORKFLOW_ID,
  SOURCE_IDENTITY_WORKFLOW_VERSION,
  sourceIdentityVerificationArtifactPath,
} from "../../src/lib/knowledge/source-identity-verification";
import { corpusProcessingFullChainFixture } from "../fixtures/corpus-processing-full-chain-fixture";

const BASELINE_ID = "whole-corpus-processing-baseline.v1";
const BASELINE_MANIFEST_SHA256 = `sha256:${"a".repeat(64)}`;
const BASELINE_REGISTER_SHA256 = `sha256:${"b".repeat(64)}`;

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
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
ajv.addSchema(lifecycleJsonSchema);
const validateEventJsonSchema = ajv.compile(eventJsonSchema);
const validateCurrentStateJsonSchema = ajv.compile(currentStateJsonSchema);

type ArtifactEntry = { bytes: Buffer; value: unknown };
type ArtifactRegistry = Map<string, ArtifactEntry>;

function fileSha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function artifactReference<
  T extends CorpusArtifactReference["artifactType"],
>(input: {
  registry: ArtifactRegistry;
  artifactType: T;
  artifactId: string;
  artifactVersion: string;
  path: string;
  artifactSha256: string;
}): CorpusArtifactReference & { artifactType: T } {
  const entry = input.registry.get(input.path);
  if (!entry) throw new Error(`Missing fixture artifact ${input.path}`);
  return {
    artifactType: input.artifactType,
    artifactId: input.artifactId,
    artifactVersion: input.artifactVersion,
    path: input.path,
    fileSha256: fileSha256(entry.bytes),
    artifactSha256: input.artifactSha256.startsWith("sha256:")
      ? input.artifactSha256
      : `sha256:${input.artifactSha256}`,
  };
}

function eventTarget(state: CorpusProcessingCurrentState) {
  return {
    recordId: state.recordId,
    identityKey: state.identityKey,
    baselineRowSha256: state.baselineBinding.baselineRowSha256,
    preStateVersion: state.stateVersion,
    preStateSha256: state.stateSha256,
    preStateLifecycleSha256: state.lifecycleSha256,
  };
}

function baselineRow(
  chain: ReturnType<typeof corpusProcessingFullChainFixture>,
) {
  const lifecycle = structuredClone(chain.identityFixture.lifecycleL1);
  lifecycle.textAvailability = {
    state: "unavailable",
    textSha256: null,
    characterCount: null,
    extractionMethod: null,
    observedAt: lifecycle.createdAt,
  };
  lifecycle.updatedAt = lifecycle.createdAt;
  const validated = validateCorpusLifecycle(lifecycle);
  return {
    schemaVersion: "1.0.0" as const,
    recordId: validated.recordId,
    identityKey: chain.identityFixture.canonicalIdentity,
    lifecycle: validated,
    permissions: deriveCorpusLifecyclePermissions(validated),
  };
}

function registryFor(
  chain: ReturnType<typeof corpusProcessingFullChainFixture>,
): ArtifactRegistry {
  const identity = chain.identityFixture;
  return new Map<string, ArtifactEntry>([
    [
      identity.acquisitionReceiptPath,
      {
        bytes: Buffer.from(identity.acquisitionReceiptBytes),
        value: structuredClone(identity.acquisitionReceipt),
      },
    ],
    [
      identity.extractionReceiptPath,
      {
        bytes: Buffer.from(identity.extractionReceiptBytes),
        value: structuredClone(identity.extractionReceipt),
      },
    ],
    [
      identity.pageMapPath,
      {
        bytes: Buffer.from(identity.pageMapBytes),
        value: structuredClone(identity.pageMap),
      },
    ],
    [
      identity.candidateInputManifestPath,
      {
        bytes: Buffer.from(identity.candidateInputManifestBytes),
        value: structuredClone(identity.candidateInputManifest),
      },
    ],
    [
      identity.identityArtifactPath,
      {
        bytes: Buffer.from(identity.identityArtifactBytes),
        value: structuredClone(identity.identity),
      },
    ],
    [
      identity.workflowFile.path,
      {
        bytes: Buffer.from(identity.workflowFile.bytes),
        value: Buffer.from(identity.workflowFile.bytes).toString("utf8"),
      },
    ],
    [
      identity.promptTemplateFile.path,
      {
        bytes: Buffer.from(identity.promptTemplateFile.bytes),
        value: Buffer.from(identity.promptTemplateFile.bytes).toString("utf8"),
      },
    ],
    [
      chain.verifiedInputManifestPath,
      {
        bytes: Buffer.from(chain.verifiedInputManifestBytes),
        value: structuredClone(chain.verifiedInputManifest),
      },
    ],
    [
      chain.analysisArtifactPath,
      {
        bytes: Buffer.from(chain.analysisArtifactBytes),
        value: structuredClone(chain.analysisArtifact),
      },
    ],
    [
      chain.analysisExecutionEvidence.workflowFile.path,
      {
        bytes: Buffer.from(chain.analysisExecutionEvidence.workflowFile.bytes),
        value: Buffer.from(
          chain.analysisExecutionEvidence.workflowFile.bytes,
        ).toString("utf8"),
      },
    ],
    [
      chain.analysisExecutionEvidence.promptTemplateFile.path,
      {
        bytes: Buffer.from(
          chain.analysisExecutionEvidence.promptTemplateFile.bytes,
        ),
        value: Buffer.from(
          chain.analysisExecutionEvidence.promptTemplateFile.bytes,
        ).toString("utf8"),
      },
    ],
  ]);
}

function appendExactByteTamper(registry: ArtifactRegistry, path: string): void {
  const entry = registry.get(path);
  if (!entry) throw new Error(`Missing tamper target ${path}`);
  entry.bytes = Buffer.concat([entry.bytes, Buffer.from("\n", "utf8")]);
  if (typeof entry.value === "string") {
    entry.value = `${entry.value}\n`;
  }
}

function scenario(
  tamper?: "workflow" | "prompt" | "pageMap" | "candidate",
  observedTitle?: string,
) {
  const chain = corpusProcessingFullChainFixture({ observedTitle });
  const identity = chain.identityFixture;
  const row = baselineRow(chain);
  const registry = registryFor(chain);
  const tamperPath =
    tamper === "workflow"
      ? identity.workflowFile.path
      : tamper === "prompt"
        ? identity.promptTemplateFile.path
        : tamper === "pageMap"
          ? identity.pageMapPath
          : tamper === "candidate"
            ? identity.candidateInputManifestPath
            : null;
  if (tamperPath) appendExactByteTamper(registry, tamperPath);

  const resolveArtifact: ResolveCorpusArtifact = (reference) => {
    const entry = registry.get(reference.path);
    if (!entry)
      throw new Error(`Unresolved fixture artifact ${reference.path}`);
    return {
      value: entry.value,
      fileSha256: fileSha256(entry.bytes),
      bytes: entry.bytes,
    };
  };
  const resolveSourceContent: ResolveCorpusSourceContent = () =>
    Buffer.from(identity.rawPdfBytes);
  const resolveNormalizedText: ResolveCorpusNormalizedText = (locator) => {
    const expectedPrefix =
      `private://corpus/pdf-page-extraction/v1/sha256/` +
      `${identity.rawPdfSha256Unprefixed}/pages/page-`;
    const suffix = ".normalized.txt";
    if (!locator.startsWith(expectedPrefix) || !locator.endsWith(suffix)) {
      throw new Error(`Unexpected normalized-text locator ${locator}`);
    }
    const pageToken = locator.slice(expectedPrefix.length, -suffix.length);
    if (!/^\d{4}$/.test(pageToken)) {
      throw new Error(`Unexpected normalized-text locator ${locator}`);
    }
    const pageNumber = Number(pageToken);
    const page = chain.analysisExecutionEvidence.normalizedPages.find(
      (item) => item.pageNumber === pageNumber,
    );
    if (!page) throw new Error(`Missing normalized page ${pageNumber}`);
    return Buffer.from(page.bytes);
  };
  const project = (events: CorpusProcessingStateEvent[]) =>
    projectCorpusCurrentState({
      baselineId: BASELINE_ID,
      baselineManifestSha256: BASELINE_MANIFEST_SHA256,
      baselineRegisterSha256: BASELINE_REGISTER_SHA256,
      baselineRows: [row],
      events,
      resolveArtifact,
      resolveSourceContent,
      resolveNormalizedText,
    })[0]!;

  const initial = initializeCorpusCurrentState({
    baselineId: BASELINE_ID,
    baselineManifestSha256: BASELINE_MANIFEST_SHA256,
    baselineRegisterSha256: BASELINE_REGISTER_SHA256,
    baselineRow: row,
  });
  const qualificationReceiptRef = artifactReference({
    registry,
    artifactType: "pdf_technical_qualification",
    artifactId: identity.identity.extractionBinding.extractionReceiptId,
    artifactVersion: identity.extractionReceipt.pipelineVersion,
    path: identity.extractionReceiptPath,
    artifactSha256: identity.extractionReceipt.receiptSha256,
  });
  const candidateInputManifestRef = artifactReference({
    registry,
    artifactType: "source_analysis_input_manifest",
    artifactId: `artifact.source_analysis_input.${identity.candidateInputManifest.manifestSha256}`,
    artifactVersion: identity.candidateInputManifest.pipelineVersion,
    path: identity.candidateInputManifestPath,
    artifactSha256: identity.candidateInputManifest.manifestSha256,
  });
  const technicalEvent = sealCorpusProcessingStateEvent({
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "technical_text_extracted" as const,
    eventId: "event.full.chain.technical",
    globalSequence: 1,
    previousGlobalEventSha256: null,
    identitySequence: 1,
    previousIdentityEventSha256: null,
    target: eventTarget(initial),
    occurredAt: identity.lifecycleL1.updatedAt,
    payload: {
      qualificationReceiptRef,
      inputManifestRef: candidateInputManifestRef,
      textAvailability: structuredClone(identity.lifecycleL1.textAvailability),
    },
  });
  const technicalState = project([
    technicalEvent as CorpusProcessingStateEvent,
  ]);
  assert.equal(technicalState.lifecycleSha256, identity.lifecycleL1Sha256);

  const acquisitionReceiptRef = artifactReference({
    registry,
    artifactType: "source_acquisition_receipt",
    artifactId: identity.acquisitionReceipt.receiptId,
    artifactVersion: identity.acquisitionReceipt.receiptVersion,
    path: identity.acquisitionReceiptPath,
    artifactSha256: identity.acquisitionReceipt.receiptSha256,
  });
  const identityArtifactRef = artifactReference({
    registry,
    artifactType: "source_identity_verification",
    artifactId: identity.identity.artifactId,
    artifactVersion: identity.identity.artifactVersion,
    path: identity.identityArtifactPath,
    artifactSha256: identity.identity.artifactSha256,
  });
  const pageMapRef = artifactReference({
    registry,
    artifactType: "pdf_page_map",
    artifactId: identity.identity.extractionBinding.pageMapId,
    artifactVersion: identity.pageMap.pipelineVersion,
    path: identity.pageMapPath,
    artifactSha256: identity.pageMap.pageMapSha256,
  });
  const workflowRef = artifactReference({
    registry,
    artifactType: "source_identity_workflow",
    artifactId: SOURCE_IDENTITY_WORKFLOW_ID,
    artifactVersion: SOURCE_IDENTITY_WORKFLOW_VERSION,
    path: identity.workflowFile.path,
    artifactSha256: fileSha256(registry.get(identity.workflowFile.path)!.bytes),
  });
  const promptTemplateRef = artifactReference({
    registry,
    artifactType: "source_identity_prompt_template",
    artifactId: SOURCE_IDENTITY_PROMPT_TEMPLATE_ID,
    artifactVersion: SOURCE_IDENTITY_PROMPT_TEMPLATE_VERSION,
    path: identity.promptTemplateFile.path,
    artifactSha256: fileSha256(
      registry.get(identity.promptTemplateFile.path)!.bytes,
    ),
  });
  const verifiedInputManifestRef = artifactReference({
    registry,
    artifactType: "source_analysis_input_manifest",
    artifactId: `artifact.source_analysis_input.${chain.verifiedInputManifest.manifestSha256}`,
    artifactVersion: chain.verifiedInputManifest.pipelineVersion,
    path: chain.verifiedInputManifestPath,
    artifactSha256: chain.verifiedInputManifest.manifestSha256,
  });
  const identityEvent = sealCorpusProcessingStateEvent({
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "identity_verified" as const,
    eventId: "event.full.chain.identity",
    globalSequence: 2,
    previousGlobalEventSha256: technicalEvent.eventSha256,
    identitySequence: 2,
    previousIdentityEventSha256: technicalEvent.eventSha256,
    target: eventTarget(technicalState),
    occurredAt: chain.identityEventTimestamp,
    payload: {
      acquisitionReceiptRef,
      sourceContentRef: {
        artifactType: "source_content" as const,
        artifactId: `artifact.source_content.${identity.rawPdfSha256Unprefixed}`,
        artifactVersion: "1.0.0",
        locator: `private://corpus/sha256/${identity.rawPdfSha256Unprefixed}.pdf`,
        contentSha256: identity.rawPdfSha256,
        sizeBytes: identity.rawPdfBytes.length,
      },
      identityArtifactRef,
      pageMapRef,
      workflowRef,
      promptTemplateRef,
      verifiedInputManifestRef,
    },
  });
  return {
    chain,
    registry,
    row,
    project,
    technicalEvent: technicalEvent as CorpusProcessingStateEvent,
    identityEvent: identityEvent as CorpusProcessingStateEvent,
    technicalState,
    candidateInputManifestRef,
    identityArtifactRef,
    verifiedInputManifestRef,
  };
}

function replaceVerifiedManifest(
  base: ReturnType<typeof scenario>,
  mutate: (body: Record<string, any>) => void,
): CorpusProcessingStateEvent {
  const { manifestSha256: _seal, ...body } = structuredClone(
    base.chain.verifiedInputManifest,
  ) as unknown as Record<string, any>;
  mutate(body);
  const manifest = sealSourceAnalysisInputManifest(
    body as unknown as Omit<SourceAnalysisInputManifest, "manifestSha256">,
  );
  const bytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  const path = sourceAnalysisVerifiedInputManifestPath({
    rawPdfSha256: manifest.processingUnit.rawPdfSha256,
    manifestSha256: manifest.manifestSha256,
  });
  base.registry.set(path, { bytes, value: manifest });
  const replacementRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis_input_manifest",
    artifactId: `artifact.source_analysis_input.${manifest.manifestSha256}`,
    artifactVersion: manifest.pipelineVersion,
    path,
    artifactSha256: manifest.manifestSha256,
  });
  const changed = structuredClone(base.identityEvent);
  if (changed.eventType !== "identity_verified") {
    throw new Error("Expected identity event fixture");
  }
  changed.payload.verifiedInputManifestRef = replacementRef;
  return sealCorpusProcessingStateEvent(changed) as CorpusProcessingStateEvent;
}

function analysisEventFor(base: ReturnType<typeof scenario>): {
  identityState: CorpusProcessingCurrentState;
  event: CorpusProcessingStateEvent;
} {
  const identityState = base.project([base.technicalEvent, base.identityEvent]);
  const analysisArtifactRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis",
    artifactId: base.chain.analysisArtifact.artifactId,
    artifactVersion: base.chain.analysisArtifact.artifactVersion,
    path: base.chain.analysisArtifactPath,
    artifactSha256: base.chain.analysisArtifact.artifactSha256,
  });
  const analysisWorkflowRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis_workflow",
    artifactId: SOURCE_ANALYSIS_WORKFLOW_ID,
    artifactVersion: SOURCE_ANALYSIS_WORKFLOW_VERSION,
    path: base.chain.analysisExecutionEvidence.workflowFile.path,
    artifactSha256: SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  });
  const analysisPromptTemplateRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis_prompt_template",
    artifactId: SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
    artifactVersion: SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
    path: base.chain.analysisExecutionEvidence.promptTemplateFile.path,
    artifactSha256: SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  });
  return {
    identityState,
    event: sealCorpusProcessingStateEvent({
      schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
      eventType: "source_analysis_applied" as const,
      eventId: "event.full.chain.analysis",
      globalSequence: 3,
      previousGlobalEventSha256: base.identityEvent.eventSha256,
      identitySequence: 3,
      previousIdentityEventSha256: base.identityEvent.eventSha256,
      target: eventTarget(identityState),
      occurredAt: base.chain.analysisEventTimestamp,
      payload: {
        analysisArtifactRef,
        identityArtifactRef: base.identityArtifactRef,
        inputManifestRef: base.verifiedInputManifestRef,
        analysisWorkflowRef,
        analysisPromptTemplateRef,
        executionBinding: base.chain.executionBinding,
        lifecycleRun: base.chain.lifecycleRun,
        stageEvidence: base.chain.stageEvidence,
      },
    }) as CorpusProcessingStateEvent,
  };
}

test("projects the exact technical → identity → analysis chain while every human gate stays closed", () => {
  const base = scenario();
  const identityState = base.project([base.technicalEvent, base.identityEvent]);
  assert.equal(identityState.stateVersion, 2);
  assert.equal(identityState.lifecycleSha256, base.chain.lifecycleL2Sha256);
  assert.equal(
    identityState.lifecycle.sourceIdentity.identityStatus,
    "verified",
  );
  assert.equal(
    identityState.lifecycle.sourceIdentity.contentHashEvidenceState,
    "private_capture_attestation_recorded",
  );
  assert.equal(
    identityState.lifecycle.sourceIdentity.contentHashVerifiedAt,
    base.row.lifecycle.sourceIdentity.contentHashVerifiedAt,
  );
  assert.equal(
    base.identityArtifactRef.path,
    sourceIdentityVerificationArtifactPath(
      base.chain.identityFixture.identity.artifactSha256,
    ),
  );
  const arbitraryIdentityState = structuredClone(identityState);
  arbitraryIdentityState.latestArtifacts.identityVerification!.path =
    "knowledge/corpus/source-identity-verification/artifacts/arbitrary.source-identity-verification.v1.json";
  assert.throws(
    () => validateCorpusCurrentState(arbitraryIdentityState),
    /content-addressed repository path/,
  );
  assert.deepEqual(
    identityState.latestArtifacts.inputManifest,
    base.candidateInputManifestRef,
  );
  assert.deepEqual(
    identityState.latestArtifacts.verifiedInputManifest,
    base.verifiedInputManifestRef,
  );
  assert.notEqual(
    identityState.latestArtifacts.inputManifest!.path,
    identityState.latestArtifacts.verifiedInputManifest!.path,
  );

  const analysisArtifactRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis",
    artifactId: base.chain.analysisArtifact.artifactId,
    artifactVersion: base.chain.analysisArtifact.artifactVersion,
    path: base.chain.analysisArtifactPath,
    artifactSha256: base.chain.analysisArtifact.artifactSha256,
  });
  const analysisWorkflowRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis_workflow",
    artifactId: SOURCE_ANALYSIS_WORKFLOW_ID,
    artifactVersion: SOURCE_ANALYSIS_WORKFLOW_VERSION,
    path: base.chain.analysisExecutionEvidence.workflowFile.path,
    artifactSha256: SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  });
  const analysisPromptTemplateRef = artifactReference({
    registry: base.registry,
    artifactType: "source_analysis_prompt_template",
    artifactId: SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
    artifactVersion: SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
    path: base.chain.analysisExecutionEvidence.promptTemplateFile.path,
    artifactSha256: SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  });
  const analysisEvent = sealCorpusProcessingStateEvent({
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "source_analysis_applied" as const,
    eventId: "event.full.chain.analysis",
    globalSequence: 3,
    previousGlobalEventSha256: base.identityEvent.eventSha256,
    identitySequence: 3,
    previousIdentityEventSha256: base.identityEvent.eventSha256,
    target: eventTarget(identityState),
    occurredAt: base.chain.analysisEventTimestamp,
    payload: {
      analysisArtifactRef,
      identityArtifactRef: base.identityArtifactRef,
      inputManifestRef: base.verifiedInputManifestRef,
      analysisWorkflowRef,
      analysisPromptTemplateRef,
      executionBinding: base.chain.executionBinding,
      lifecycleRun: base.chain.lifecycleRun,
      stageEvidence: base.chain.stageEvidence,
    },
  }) as CorpusProcessingStateEvent;
  for (const event of [
    base.technicalEvent,
    base.identityEvent,
    analysisEvent,
  ]) {
    assert.equal(
      validateEventJsonSchema(event),
      true,
      JSON.stringify(validateEventJsonSchema.errors),
    );
  }
  assert.equal(
    validateCurrentStateJsonSchema(identityState),
    true,
    JSON.stringify(validateCurrentStateJsonSchema.errors),
  );
  const finalState = base.project([
    base.technicalEvent,
    base.identityEvent,
    analysisEvent,
  ]);
  assert.equal(
    validateCurrentStateJsonSchema(finalState),
    true,
    JSON.stringify(validateCurrentStateJsonSchema.errors),
  );
  assert.equal(finalState.stateVersion, 3);
  assert.equal(
    finalState.lifecycle.aiProcessingStatus.currentStage,
    "cross_check",
  );
  assert.equal(finalState.lifecycle.aiProcessingStatus.state, "complete");
  assert.equal(finalState.permissions.aiReadyForOwnerReview, false);
  assert.equal(finalState.permissions.ownerApprovedForInternalUse, false);
  assert.equal(finalState.permissions.independentlyValidated, false);
  assert.equal(finalState.permissions.rightsClearedForInternalUse, false);
  assert.equal(finalState.permissions.externalUseAllowed, false);
  assert.equal(finalState.permissions.coveragePromotionAllowed, false);

  const candidateAnalysisEvent = structuredClone(analysisEvent);
  if (candidateAnalysisEvent.eventType !== "source_analysis_applied") {
    throw new Error("Expected source-analysis event fixture");
  }
  candidateAnalysisEvent.payload.inputManifestRef =
    base.candidateInputManifestRef;
  const resealedCandidateEvent = sealCorpusProcessingStateEvent(
    candidateAnalysisEvent,
  ) as CorpusProcessingStateEvent;
  assert.throws(
    () =>
      base.project([
        base.technicalEvent,
        base.identityEvent,
        resealedCandidateEvent,
      ]),
    /does not reuse the exact applied identity and input artifacts/,
  );
});

test("projects a deterministically normalized observed title without changing the stable corpus title", () => {
  const base = scenario(undefined, "Example Authority Report: 2024");
  const { event } = analysisEventFor(base);
  const state = base.project([base.technicalEvent, base.identityEvent, event]);
  assert.equal(
    state.lifecycle.sourceIdentity.title,
    "Example authority report 2024",
  );
  assert.equal(
    base.chain.identityFixture.identity.observedMetadata.title,
    "Example Authority Report: 2024",
  );
  assert.equal(state.lifecycle.aiProcessingStatus.currentStage, "cross_check");
});

test("identity promotion rejects exact bytes replayed under an arbitrary repository path", () => {
  const base = scenario();
  if (base.identityEvent.eventType !== "identity_verified") {
    throw new Error("Expected identity event fixture");
  }
  const arbitraryPath =
    "knowledge/corpus/source-identity-verification/artifacts/arbitrary.source-identity-verification.v1.json";
  base.registry.set(
    arbitraryPath,
    base.registry.get(base.identityArtifactRef.path)!,
  );
  const changed = structuredClone(base.identityEvent);
  changed.payload.identityArtifactRef.path = arbitraryPath;
  assert.throws(
    () =>
      base.project([
        base.technicalEvent,
        sealCorpusProcessingStateEvent(changed) as CorpusProcessingStateEvent,
      ]),
    /content-addressed repository path/,
  );
});

test("identity promotion rejects exact-byte tampering in every newly required bundle file", () => {
  for (const target of [
    "workflow",
    "prompt",
    "pageMap",
    "candidate",
  ] as const) {
    const base = scenario(target);
    assert.throws(
      () => base.project([base.technicalEvent, base.identityEvent]),
      /identity|workflow|prompt|page|manifest|artifact/i,
      target,
    );
  }
});

test("analysis replay rejects changed workflow, prompt, or normalized page bytes", () => {
  for (const target of ["workflow", "prompt", "page"] as const) {
    const base = scenario();
    const { event } = analysisEventFor(base);
    if (target === "workflow") {
      appendExactByteTamper(
        base.registry,
        base.chain.analysisExecutionEvidence.workflowFile.path,
      );
    } else if (target === "prompt") {
      appendExactByteTamper(
        base.registry,
        base.chain.analysisExecutionEvidence.promptTemplateFile.path,
      );
    } else {
      base.chain.analysisExecutionEvidence.normalizedPages[0]!.bytes =
        Buffer.from("changed normalized page bytes\n", "utf8");
    }
    assert.throws(
      () => base.project([base.technicalEvent, base.identityEvent, event]),
      /workflow|prompt|normalized page|file hash/i,
      target,
    );
  }
});

test("identity promotion rejects mutable or falsely linked verified-manifest revisions", () => {
  const candidateReuse = scenario();
  const reusedEvent = structuredClone(candidateReuse.identityEvent);
  if (reusedEvent.eventType !== "identity_verified") {
    throw new Error("Expected identity event fixture");
  }
  reusedEvent.payload.verifiedInputManifestRef =
    candidateReuse.candidateInputManifestRef;
  assert.throws(
    () =>
      candidateReuse.project([
        candidateReuse.technicalEvent,
        sealCorpusProcessingStateEvent(
          reusedEvent,
        ) as CorpusProcessingStateEvent,
      ]),
    /source-analysis eligible|immutable distinct revision|provisional candidate/i,
  );

  const mutations: Array<[string, (body: Record<string, any>) => void]> = [
    [
      "page binding",
      (body) => {
        body.bindings.pageMap.fileSha256 = "f".repeat(64);
      },
    ],
    [
      "predecessor",
      (body) => {
        body.workflowEligibility.sourceAnalysis.predecessorInputManifestReference.fileSha256 =
          "e".repeat(64);
      },
    ],
    [
      "identity artifact",
      (body) => {
        body.workflowEligibility.sourceAnalysis.identityArtifactReference.fileSha256 =
          "d".repeat(64);
      },
    ],
    [
      "L2 snapshot",
      (body) => {
        body.workflowEligibility.sourceAnalysis.lifecycleTransition.analysisPrestate.lifecycleSnapshotSha256 = `sha256:${"c".repeat(64)}`;
      },
    ],
    [
      "readiness",
      (body) => {
        body.readiness.ownerReviewComplete = true;
      },
    ],
  ];
  for (const [label, mutate] of mutations) {
    const base = scenario();
    const changed = replaceVerifiedManifest(base, mutate);
    assert.throws(
      () => base.project([base.technicalEvent, changed]),
      /manifest|predecessor|identity|lifecycle|readiness|source/i,
      label,
    );
  }
});
