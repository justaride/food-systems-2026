import { readFileSync } from "node:fs";

import { prepareVerifiedSourceIdentityArtifact } from "../../scripts/knowledge/seal-source-identity-verification-artifact";
import {
  CORPUS_AI_MODEL_VERSION_NOT_EXPOSED,
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
  type CorpusCanonicalJsonValue,
  type CorpusLifecycleRecord,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  hashCorpusExecution,
  hashCorpusExecutionMembership,
  sourceAnalysisVerifiedInputManifestPath,
  type CorpusProcessingStateEvent,
} from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  SOURCE_ANALYSIS_ARTIFACT_VERSION,
  SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
  SOURCE_ANALYSIS_REQUIRED_STAGES,
  SOURCE_ANALYSIS_SCHEMA_VERSION,
  SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  SOURCE_ANALYSIS_WORKFLOW_ID,
  SOURCE_ANALYSIS_WORKFLOW_PATH,
  SOURCE_ANALYSIS_WORKFLOW_VERSION,
  hashSourceAnalysisCheckpoint,
  hashSourceAnalysisFinalOutput,
  hashSourceAnalysisInputEnvelope,
  hashSourceAnalysisPayload,
  hashSourceAnalysisStagePayload,
  hashSourceAnalysisWorkflow,
  sealSourceAnalysisArtifact,
  sourceAnalysisInputEnvelope,
  sourceAnalysisSha256,
  sourceAnalysisStagePayload,
  validateSourceAnalysisArtifactWithEvidenceBundle,
  type SourceAnalysisArtifact,
  type SourceAnalysisBinding,
  type SourceAnalysisCheckpoint,
  type SourceAnalysisExecutionEvidenceInputs,
} from "../../src/lib/knowledge/source-analysis-artifact";
import {
  sealSourceAnalysisInputManifest,
  sourceAnalysisEligibleWorkflowEligibility,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import {
  sourceIdentityFullEvidenceFixture,
  type SourceIdentityFullEvidenceFixture,
  type SourceIdentityFullEvidenceFixtureOptions,
} from "./source-identity-full-evidence-fixture";

type SourceAnalysisAppliedPayload = Extract<
  CorpusProcessingStateEvent,
  { eventType: "source_analysis_applied" }
>["payload"];

export type CorpusProcessingFullChainFixture = {
  identityFixture: SourceIdentityFullEvidenceFixture;
  identityEventTimestamp: string;
  analysisEventTimestamp: string;
  lifecycleL2: CorpusLifecycleRecord;
  lifecycleL2Sha256: string;
  verifiedInputManifest: SourceAnalysisInputManifest;
  verifiedInputManifestBytes: Buffer;
  verifiedInputManifestPath: string;
  analysisArtifact: SourceAnalysisArtifact;
  analysisArtifactBytes: Buffer;
  analysisArtifactPath: string;
  analysisExecutionEvidence: SourceAnalysisExecutionEvidenceInputs;
  lifecycleRun: SourceAnalysisAppliedPayload["lifecycleRun"];
  stageEvidence: SourceAnalysisAppliedPayload["stageEvidence"];
  executionBinding: SourceAnalysisAppliedPayload["executionBinding"];
};

const ANALYSIS_ARTIFACT_PATH =
  "knowledge/corpus/source-analysis/example-report.source-analysis.v1.json";
const SOURCE_ANALYSIS_RUN_ID = "ai.run.source.analysis.full.chain";
const LIFECYCLE_RUN_ID = "ai.run.lifecycle.source.analysis.full.chain";

function prettyBytes(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function rawSha256(bytes: Buffer): string {
  return sourceAnalysisSha256(bytes).replace(/^sha256:/, "");
}

function analysisPayload(
  normalizedTextSha256: string,
): SourceAnalysisArtifact["analysis"] {
  return {
    overview: {
      purpose:
        "The source records the title, publisher, publication date and language of one authority report.",
      summary:
        "The single normalized fixture page identifies an example authority report and its publication metadata.",
      sourceRoleCandidate: "primary_evidence",
      sourceRoleStatus: "machine_provisional",
      systemBoundary:
        "The analysis is limited to the single normalized page supplied by the full-evidence fixture.",
      periodStatement:
        "The normalized page declares that the report was published on 15 March 2025.",
      notAssessed: [
        "The short fixture page does not support substantive conclusions about food-system performance.",
      ],
    },
    claims: [
      {
        claimId: "claim.fixture.publication.metadata",
        claimType: "document_metadata",
        proposition:
          "The page identifies Example Food Authority as publisher of Example authority report 2024.",
        representation: "paraphrase",
        support: "direct",
        locatorIds: ["locator.page.1"],
        supportingTextUnitSha256s: [normalizedTextSha256],
        limitations: ["The fixture contains only one short normalized page."],
        machineConfidence: 0.99,
        promotionState: "candidate_only",
      },
    ],
    quantitativeObservations: [],
    actors: [],
    policies: [],
    relationships: [],
    flows: [],
    sourceAppraisal: {
      methods: [
        {
          methodId: "method.fixture.full.text.read",
          methodType: "full_text_read",
          statement:
            "The complete one-page normalized input was read and bound to its exact page hash.",
          locatorIds: ["locator.page.1"],
        },
      ],
      limitations: [
        {
          limitationId: "limitation.fixture.short.page",
          origin: "analyst_identified",
          category: "source_scope",
          statement:
            "The synthetic source contains publication metadata but no substantive report body.",
          effectOnInterpretation:
            "Only the observed publication metadata can be represented as a direct candidate claim.",
          locatorIds: ["locator.page.1"],
        },
      ],
      conflictOfInterest: {
        state: "not_reported",
        statement:
          "The normalized fixture page does not contain a conflict-of-interest declaration.",
        locatorIds: ["locator.page.1"],
      },
      cannotSupport: [
        {
          boundaryId: "boundary.fixture.substantive.findings",
          statement:
            "The fixture cannot support substantive findings about actors, policies, flows or outcomes.",
          reason:
            "Its only normalized page contains title and publication metadata rather than report findings.",
          locatorIds: ["locator.page.1"],
        },
      ],
    },
    reconciliation: {
      internalInconsistencies: [],
      corroborations: [],
      contradictions: [],
      openQuestions: [],
    },
    ontologyCandidates: [],
    coverageCandidates: [],
  };
}

export function corpusProcessingFullChainFixture(
  options: SourceIdentityFullEvidenceFixtureOptions = {},
): CorpusProcessingFullChainFixture {
  const sourceIdentityFixture = sourceIdentityFullEvidenceFixture(options);
  const { artifactSha256: _identitySeal, ...identityBody } =
    sourceIdentityFixture.identity;
  const preparedIdentity = prepareVerifiedSourceIdentityArtifact({
    artifactBody: identityBody,
    evidenceBundle: sourceIdentityFixture.bundle,
  });
  const identityFixture: SourceIdentityFullEvidenceFixture = {
    ...sourceIdentityFixture,
    identity: preparedIdentity.artifact,
    identityArtifactPath: preparedIdentity.repositoryPath,
    identityArtifactBytes: preparedIdentity.bytes,
  };
  const identity = identityFixture.identity;
  if (identity.decision.state !== "verified") {
    throw new Error("Full-chain fixture requires a verified identity artifact");
  }
  const analysisExecutionEvidence: SourceAnalysisExecutionEvidenceInputs = {
    workflowFile: {
      path: SOURCE_ANALYSIS_WORKFLOW_PATH,
      bytes: readFileSync(SOURCE_ANALYSIS_WORKFLOW_PATH),
    },
    promptTemplateFile: {
      path: SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
      bytes: readFileSync(SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH),
    },
    normalizedPages: identityFixture.normalizedPageBytes.map(
      (bytes, index) => ({ pageNumber: index + 1, bytes: Buffer.from(bytes) }),
    ),
  };

  const identityEventTimestamp = identity.createdAt;
  const lifecycleL2Draft = structuredClone(identityFixture.lifecycleL1);
  lifecycleL2Draft.sourceIdentity.identityStatus = "verified";
  lifecycleL2Draft.sourceIdentity.identityKind =
    identity.candidateIdentity.identityKind;
  lifecycleL2Draft.sourceIdentity.canonicalIdentity =
    identity.decision.verifiedIdentity.canonicalIdentity;
  lifecycleL2Draft.updatedAt = identityEventTimestamp;
  const lifecycleL2 = validateCorpusLifecycle(lifecycleL2Draft);
  const lifecycleL2Sha256 = hashCorpusLifecycleState(lifecycleL2);

  const candidateManifest = identityFixture.candidateInputManifest;
  const candidateManifestFileSha256 = rawSha256(
    identityFixture.candidateInputManifestBytes,
  );
  const identityArtifactFileSha256 = rawSha256(
    identityFixture.identityArtifactBytes,
  );
  const { manifestSha256: _candidateSeal, ...candidateBody } =
    candidateManifest;
  const verifiedInputManifest = sealSourceAnalysisInputManifest({
    ...candidateBody,
    identityAssociation: {
      state: "verified_identity_match",
      intendedLabel: candidateManifest.identityAssociation.intendedLabel,
      observedDocumentTitle:
        candidateManifest.identityAssociation.observedDocumentTitle,
      sourceId: identity.decision.verifiedIdentity.sourceId,
      canonicalIdentity: identity.decision.verifiedIdentity.canonicalIdentity,
      blockerCode: null,
    },
    sourceBinding: {
      ...candidateManifest.sourceBinding,
      corpusIdentityVerified: true,
    },
    workflowEligibility: sourceAnalysisEligibleWorkflowEligibility({
      identityArtifactReference: {
        artifactId: identity.artifactId,
        artifactVersion: identity.artifactVersion,
        path: identityFixture.identityArtifactPath,
        fileSha256: identityArtifactFileSha256,
        artifactSha256: identity.artifactSha256,
        decision: "verified",
      },
      predecessorInputManifestReference: {
        schemaVersion: candidateManifest.schemaVersion,
        pipelineVersion: candidateManifest.pipelineVersion,
        path: identityFixture.candidateInputManifestPath,
        fileSha256: candidateManifestFileSha256,
        manifestSha256: candidateManifest.manifestSha256,
      },
      lifecycleTransition: {
        identityVerificationPrestate: {
          lifecycleRecordId: identityFixture.lifecycleL1.recordId,
          lifecycleSnapshotSha256: identityFixture.lifecycleL1Sha256,
          lifecycleSnapshotUpdatedAt: identityFixture.lifecycleL1.updatedAt,
          sourceIdentityStatus: "provisional",
        },
        analysisPrestate: {
          lifecycleRecordId: lifecycleL2.recordId,
          lifecycleSnapshotSha256: lifecycleL2Sha256,
          lifecycleSnapshotUpdatedAt: lifecycleL2.updatedAt,
          sourceIdentityStatus: "verified",
        },
      },
    }),
  });
  const verifiedInputManifestBytes = prettyBytes(verifiedInputManifest);
  const verifiedInputManifestPath = sourceAnalysisVerifiedInputManifestPath({
    rawPdfSha256: verifiedInputManifest.processingUnit.rawPdfSha256,
    manifestSha256: verifiedInputManifest.manifestSha256,
  });

  const source = lifecycleL2.sourceIdentity;
  const text = lifecycleL2.textAvailability;
  if (
    source.contentSha256 === null ||
    source.canonicalIdentity === null ||
    text.textSha256 === null ||
    (text.state !== "full_text" && text.state !== "structured_content")
  ) {
    throw new Error(
      "Verified full-chain lifecycle must bind source content, canonical identity and complete text",
    );
  }

  const binding: SourceAnalysisBinding = {
    sourceAnalysisInputManifestPath: verifiedInputManifestPath,
    sourceAnalysisInputManifestFileSha256: sourceAnalysisSha256(
      verifiedInputManifestBytes,
    ),
    sourceAnalysisInputManifestSchemaVersion:
      verifiedInputManifest.schemaVersion,
    sourceAnalysisInputManifestPipelineVersion:
      verifiedInputManifest.pipelineVersion,
    sourceAnalysisInputManifestSha256: `sha256:${verifiedInputManifest.manifestSha256}`,
    lifecycleRecordId: lifecycleL2.recordId,
    lifecycleSnapshotSha256: lifecycleL2Sha256,
    lifecycleSnapshotUpdatedAt: lifecycleL2.updatedAt,
    sourceId: source.sourceId,
    sourceTitle: source.title,
    sourceCanonicalIdentity: source.canonicalIdentity,
    sourceIdentityStatus: "verified",
    sourceIdentityVerificationArtifactId: identity.artifactId,
    sourceIdentityVerificationArtifactVersion: identity.artifactVersion,
    sourceIdentityVerificationArtifactPath:
      identityFixture.identityArtifactPath,
    sourceIdentityVerificationArtifactFileSha256: sourceAnalysisSha256(
      identityFixture.identityArtifactBytes,
    ),
    sourceIdentityVerificationArtifactSha256: identity.artifactSha256,
    sourceIdentityVerificationDecision: "verified",
    sourceMetadataSha256: source.metadataSha256,
    sourceContentSha256: source.contentSha256,
    rawPdfSha256: identityFixture.rawPdfSha256,
    textSha256: text.textSha256,
    textAvailabilityState: text.state,
    extractionArtifactId: identity.extractionBinding.extractionReceiptId,
    extractionArtifactVersion:
      identityFixture.extractionReceipt.pipelineVersion,
    extractionArtifactSha256: `sha256:${identityFixture.extractionReceipt.receiptSha256}`,
    extractionArtifactPath: identityFixture.extractionReceiptPath,
    extractionArtifactFileSha256: sourceAnalysisSha256(
      identityFixture.extractionReceiptBytes,
    ),
    extractionTextManifestSha256: `sha256:${verifiedInputManifest.normalizedInput.sha256}`,
    pageMapPath: identityFixture.pageMapPath,
    pageMapFileSha256: sourceAnalysisSha256(identityFixture.pageMapBytes),
    pageMapSha256: `sha256:${identityFixture.pageMap.pageMapSha256}`,
  };
  const locators: SourceAnalysisArtifact["locators"] =
    verifiedInputManifest.pages.map((page) => ({
      locatorId: `locator.page.${page.pageNumber}`,
      locatorType: "page",
      label: `PDF page ${page.pageNumber}`,
      pageStart: page.pageNumber,
      pageEnd: page.pageNumber,
      sectionPath: [],
      normalizedTextSha256: `sha256:${page.normalizedText.sha256}`,
    }));
  const analysis = analysisPayload(locators[0]!.normalizedTextSha256);
  const analysisPayloadSha256 = hashSourceAnalysisPayload({
    locators,
    analysis,
  });
  const actualFullTextReading: SourceAnalysisArtifact["actualFullTextReading"] =
    {
      state: "complete",
      scope: "entire_normalized_text",
      runIds: [SOURCE_ANALYSIS_RUN_ID],
      inputTextSha256: text.textSha256,
      expectedUnitCount: verifiedInputManifest.totals.pageCount,
      readUnitCount: verifiedInputManifest.totals.pageCount,
      readLocatorIds: locators.map((locator) => locator.locatorId),
      sequenceComplete: true,
      completedAt: "2026-08-03T08:14:00Z",
    };
  const workflow = {
    workflowRef: SOURCE_ANALYSIS_WORKFLOW_ID,
    workflowVersion: SOURCE_ANALYSIS_WORKFLOW_VERSION,
    workflowPath: SOURCE_ANALYSIS_WORKFLOW_PATH,
    workflowFileSha256: SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
    promptTemplateRef: SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
    promptTemplateVersion: SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
    promptTemplatePath: SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
    promptTemplateFileSha256: SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  };
  const workflowSha256 = hashSourceAnalysisWorkflow(workflow);
  const inputEnvelope = sourceAnalysisInputEnvelope(binding, workflowSha256);
  const inputEnvelopeSha256 = hashSourceAnalysisInputEnvelope(inputEnvelope);
  const stageMaterial = {
    binding,
    actualFullTextReading,
    locators,
    analysis,
    analysisPayloadSha256,
  };
  const checkpointTimes = [
    "2026-08-03T08:14:00Z",
    "2026-08-03T08:16:00Z",
    "2026-08-03T08:18:00Z",
    "2026-08-03T08:20:00Z",
  ];
  let predecessorCheckpointSha256: string | null = null;
  const checkpoints: SourceAnalysisCheckpoint[] =
    SOURCE_ANALYSIS_REQUIRED_STAGES.map((stage, index) => {
      const inputSha256 = predecessorCheckpointSha256 ?? inputEnvelopeSha256;
      const stagePayload = sourceAnalysisStagePayload(
        stage,
        stageMaterial,
        inputEnvelopeSha256,
      );
      const stagePayloadSha256 = hashSourceAnalysisStagePayload(stagePayload);
      const completedAt = checkpointTimes[index]!;
      const outputSha256 = hashSourceAnalysisCheckpoint({
        stage,
        inputSha256,
        predecessorCheckpointSha256,
        stagePayloadSha256,
        completedAt,
      });
      const checkpoint: SourceAnalysisCheckpoint = {
        stage,
        inputSha256,
        predecessorCheckpointSha256,
        stagePayload,
        stagePayloadSha256,
        outputSha256,
        completedAt,
      };
      predecessorCheckpointSha256 = outputSha256;
      return checkpoint;
    });
  const lastCheckpointOutputSha256 = checkpoints.at(-1)!.outputSha256;
  const analysisArtifact = sealSourceAnalysisArtifact({
    schemaVersion: SOURCE_ANALYSIS_SCHEMA_VERSION,
    artifactType: "source_analysis",
    artifactId: "artifact.source.analysis.example.full.chain.v1",
    artifactVersion: SOURCE_ANALYSIS_ARTIFACT_VERSION,
    lineageId: "lineage.source.analysis.example.full.chain",
    continuity: {
      kind: "initial",
      predecessorArtifactId: null,
      predecessorArtifactVersion: null,
      predecessorArtifactSha256: null,
      changeSummary: null,
    },
    binding,
    scope: {
      ...lifecycleL2.scope,
      sourceLanguageCodes: [...identity.observedMetadata.languageCodes],
    },
    sourceTextPolicy: {
      longSourceTextIncluded: false,
      directQuotesIncluded: false,
      policy: "paraphrases_and_locators_only",
    },
    fullTextEligibility: {
      state: "eligible",
      basis: text.state,
      identityHashBound: true,
      contentHashBound: true,
      textHashBound: true,
      expectedUnitCount: verifiedInputManifest.totals.pageCount,
      extractionWarnings: [
        {
          warningId: "warning.page.1.low.text",
          code: "low_extracted_text",
          disposition: "accepted_limitation",
          statement:
            "The short normalized fixture page is retained as complete input with its limited evidentiary scope recorded.",
          affectedLocatorIds: ["locator.page.1"],
        },
      ],
      unresolvedBlockingWarningCount: 0,
      evaluatedAt: "2026-08-03T08:11:00Z",
    },
    locators,
    actualFullTextReading,
    analysisExecution: {
      executionMode: "ai_assisted",
      runs: [
        {
          runId: SOURCE_ANALYSIS_RUN_ID,
          stages: [...SOURCE_ANALYSIS_REQUIRED_STAGES],
          checkpoints,
          provider: "OpenAI",
          model: "gpt-5",
          modelVersionState: "runtime_not_exposed",
          modelVersion: SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED,
          ...workflow,
          workflowSha256,
          inputTextSha256: text.textSha256,
          inputEnvelope,
          inputEnvelopeSha256,
          predecessorOutputSha256: null,
          outputSha256: lastCheckpointOutputSha256,
          timeEvidence: "coordinator_observed_window",
          timeEvidenceExplanation:
            "The coordinator observed the bounded fixture run; provider timestamps were not exposed.",
          startedAt: "2026-08-03T08:12:00Z",
          completedAt: "2026-08-03T08:20:00Z",
        },
      ],
      finalOutputSha256: hashSourceAnalysisFinalOutput({
        analysisPayloadSha256,
        lastCheckpointOutputSha256,
      }),
    },
    analysis,
    gates: {
      ownerReview: { complete: false, state: "pending", receiptId: null },
      independentExpertValidation: {
        complete: false,
        state: "not_requested",
        receiptId: null,
      },
      partnerValidation: {
        complete: false,
        state: "not_requested",
        receiptId: null,
      },
      rightsHolderValidation: {
        complete: false,
        state: "not_requested",
        receiptId: null,
      },
      rightsReview: {
        complete: false,
        state: "pending_review",
        receiptId: null,
      },
      publication: {
        complete: false,
        state: "internal_only",
        receiptId: null,
      },
      coverage: {
        complete: false,
        state: "candidate",
        receiptId: null,
        automaticPromotionAllowed: false,
      },
    },
    analysisPayloadSha256,
    createdAt: "2026-08-03T08:21:00Z",
  });
  const analysisArtifactBytes = prettyBytes(analysisArtifact);

  const lifecycleStages = [
    "triage",
    "full_text",
    "locator",
    "claims",
    "cross_check",
  ] as const;
  const lifecycleCheckpointTimes = [
    "2026-08-03T08:23:00Z",
    "2026-08-03T08:24:00Z",
    "2026-08-03T08:25:00Z",
    "2026-08-03T08:26:00Z",
    "2026-08-03T08:27:00Z",
  ];
  const lifecycleOutputs = [
    sourceAnalysisSha256("full-chain-lifecycle-triage"),
    text.textSha256,
    sourceAnalysisSha256("full-chain-lifecycle-locator"),
    sourceAnalysisSha256("full-chain-lifecycle-claims"),
    analysisArtifact.artifactSha256,
  ];
  const lifecycleRun: SourceAnalysisAppliedPayload["lifecycleRun"] = {
    runId: LIFECYCLE_RUN_ID,
    provider: "OpenAI",
    model: "gpt-5",
    modelVersionState: "runtime_not_exposed",
    modelVersion: CORPUS_AI_MODEL_VERSION_NOT_EXPOSED,
    workflowRef: "workflow.corpus.source.analysis.application.v1",
    stages: [...lifecycleStages],
    checkpoints: lifecycleStages.map((stage, index) => ({
      stage,
      inputSha256:
        index === 0 ? source.contentSha256! : lifecycleOutputs[index - 1]!,
      outputSha256: lifecycleOutputs[index]!,
      completedAt: lifecycleCheckpointTimes[index]!,
    })),
    inputSha256: source.contentSha256,
    outputSha256: analysisArtifact.artifactSha256,
    timeEvidence: "coordinator_observed_window",
    timeEvidenceExplanation:
      "The coordinator observed the bounded lifecycle application window without inventing provider timestamps.",
    startedAt: "2026-08-03T08:22:00Z",
    completedAt: "2026-08-03T08:27:00Z",
  };
  const stageEvidence: SourceAnalysisAppliedPayload["stageEvidence"] =
    lifecycleStages.map((stage, index) => ({
      stage,
      method: "ai_assisted",
      runId: LIFECYCLE_RUN_ID,
      checkpointIndex: index,
      artifactId:
        stage === "cross_check"
          ? analysisArtifact.artifactId
          : `artifact.lifecycle.${stage}.full.chain`,
      artifactVersion:
        stage === "cross_check" ? analysisArtifact.artifactVersion : "1.0.0",
      outputSha256: lifecycleOutputs[index]!,
      completedAt: lifecycleCheckpointTimes[index]!,
    }));
  const executionMaterial = {
    analysisExecution: analysisArtifact.analysisExecution,
    actualFullTextReading: analysisArtifact.actualFullTextReading,
    analysisPayloadSha256: analysisArtifact.analysisPayloadSha256,
  };
  const executionBinding: SourceAnalysisAppliedPayload["executionBinding"] = {
    processingUnitSha256: identityFixture.rawPdfSha256,
    executionSha256: hashCorpusExecution(
      executionMaterial as CorpusCanonicalJsonValue,
    ),
    membershipIdentityKeys: [...verifiedInputManifest.identityKeys],
    membershipSha256: hashCorpusExecutionMembership(
      verifiedInputManifest.identityKeys,
    ),
    applicationMode: "single_identity_event",
    automaticFanOutAllowed: false,
  };
  const analysisEventTimestamp = "2026-08-03T08:28:00Z";

  validateSourceAnalysisArtifactWithEvidenceBundle(analysisArtifact, {
    predecessorInputManifestFile: {
      path: identityFixture.candidateInputManifestPath,
      bytes: identityFixture.candidateInputManifestBytes,
    },
    inputManifestFile: {
      path: verifiedInputManifestPath,
      bytes: verifiedInputManifestBytes,
    },
    identityArtifactFile: {
      path: identityFixture.identityArtifactPath,
      bytes: identityFixture.identityArtifactBytes,
    },
    identityVerificationPrestate: identityFixture.lifecycleL1,
    analysisPrestate: lifecycleL2,
    identityEvidenceBundle: identityFixture.bundle,
    ...analysisExecutionEvidence,
  });

  const lifecycleAfterAnalysis = structuredClone(lifecycleL2);
  lifecycleAfterAnalysis.sourceIdentity.sourceRole =
    analysisArtifact.analysis.overview.sourceRoleCandidate;
  lifecycleAfterAnalysis.aiAssistanceProvenance = {
    used: true,
    runs: [...lifecycleAfterAnalysis.aiAssistanceProvenance.runs, lifecycleRun],
  };
  lifecycleAfterAnalysis.aiProcessingStatus = {
    currentStage: "cross_check",
    state: "complete",
    completedStages: ["inventory", ...lifecycleStages],
    stageEvidence: [
      ...lifecycleAfterAnalysis.aiProcessingStatus.stageEvidence,
      ...stageEvidence,
    ],
    updatedAt: analysisEventTimestamp,
  };
  lifecycleAfterAnalysis.updatedAt = analysisEventTimestamp;
  validateCorpusLifecycle(lifecycleAfterAnalysis);

  return {
    identityFixture,
    identityEventTimestamp,
    analysisEventTimestamp,
    lifecycleL2,
    lifecycleL2Sha256,
    verifiedInputManifest,
    verifiedInputManifestBytes,
    verifiedInputManifestPath,
    analysisArtifact,
    analysisArtifactBytes,
    analysisArtifactPath: ANALYSIS_ARTIFACT_PATH,
    analysisExecutionEvidence,
    lifecycleRun,
    stageEvidence,
    executionBinding,
  };
}
