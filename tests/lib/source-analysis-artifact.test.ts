import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { hashCorpusLifecycleState } from "../../src/lib/knowledge/corpus-processing-lifecycle";
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
  sourceAnalysisArtifactStructuralSchema,
  sourceAnalysisSha256,
  sourceAnalysisStagePayload,
  validateSourceAnalysisArtifact,
  validateSourceAnalysisArtifactAfterReplayVerifiedIdentity,
  validateSourceAnalysisArtifactWithEvidenceBundle,
  validateSourceAnalysisBinding,
  validateSourceAnalysisNormalizedPageBytes,
  validateSourceAnalysisPromptTemplateFile,
  validateSourceAnalysisWorkflowFile,
  type SourceAnalysisBinding,
  type SourceAnalysisCheckpoint,
  type SourceAnalysisArtifact,
  type SourceAnalysisExecutionEvidenceInputs,
} from "../../src/lib/knowledge/source-analysis-artifact";
import {
  sealSourceAnalysisInputManifest,
  sourceAnalysisInputWorkflowEligibility,
  type SourceAnalysisInputManifest,
} from "../../src/lib/knowledge/source-analysis-input-manifest";
import { sourceIdentityVerificationArtifactPath } from "../../src/lib/knowledge/source-identity-verification";
import { sourceAnalysisCombinedInputFixture } from "../fixtures/source-analysis-combined-fixture";
import { corpusProcessingFullChainFixture } from "../fixtures/corpus-processing-full-chain-fixture";

const HASH = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz0123456789"
    .split("")
    .map((character) => [
      character,
      sourceAnalysisSha256(`fixture-${character}`),
    ]),
) as Record<string, string>;

const SOURCE_ANALYSIS_WORKFLOW_BYTES = readFileSync(
  SOURCE_ANALYSIS_WORKFLOW_PATH,
);
const SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES = readFileSync(
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
);

const jsonSchema = JSON.parse(
  readFileSync(
    "knowledge/schema/source-analysis-artifact.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

function syntheticNormalizedPages(): Array<{
  pageNumber: number;
  bytes: Buffer;
}> {
  return [
    {
      pageNumber: 1,
      bytes: Buffer.from(
        "Synthetic cover and declared report identity.\n",
        "utf8",
      ),
    },
    {
      pageNumber: 2,
      bytes: Buffer.from(
        "Synthetic method, result, limitation and reconciliation evidence.\n",
        "utf8",
      ),
    },
  ];
}

type CombinedReplayInputs = ReturnType<
  typeof sourceAnalysisCombinedInputFixture
> &
  SourceAnalysisExecutionEvidenceInputs;

function combinedReplayInputs(): CombinedReplayInputs {
  const fixture = sourceAnalysisCombinedInputFixture();
  const analysisPrestate = structuredClone(fixture.analysisPrestate);
  analysisPrestate.sourceIdentity.contentHashEvidenceState =
    fixture.identityVerificationPrestate.sourceIdentity.contentHashEvidenceState;
  analysisPrestate.sourceIdentity.contentHashVerifiedAt =
    fixture.identityVerificationPrestate.sourceIdentity.contentHashVerifiedAt;
  const analysisPrestateSha256 = hashCorpusLifecycleState(analysisPrestate);
  const currentManifest = JSON.parse(
    Buffer.from(fixture.inputManifestFile.bytes).toString("utf8"),
  ) as SourceAnalysisInputManifest;
  if (
    currentManifest.workflowEligibility.state !== "source_analysis_eligible"
  ) {
    throw new Error("Combined fixture must contain an eligible input manifest");
  }
  const eligibleWorkflow = currentManifest.workflowEligibility;
  const { manifestSha256: _manifestSeal, ...manifestBody } = currentManifest;
  const inputManifest = sealSourceAnalysisInputManifest({
    ...manifestBody,
    workflowEligibility: {
      ...eligibleWorkflow,
      sourceAnalysis: {
        ...eligibleWorkflow.sourceAnalysis,
        lifecycleTransition: {
          ...eligibleWorkflow.sourceAnalysis.lifecycleTransition,
          analysisPrestate: {
            ...eligibleWorkflow.sourceAnalysis.lifecycleTransition
              .analysisPrestate,
            lifecycleSnapshotSha256: analysisPrestateSha256,
          },
        },
      },
    },
  });
  const inputManifestBytes = Buffer.from(
    `${JSON.stringify(inputManifest, null, 2)}\n`,
    "utf8",
  );
  return {
    ...fixture,
    inputManifestFile: {
      ...fixture.inputManifestFile,
      bytes: inputManifestBytes,
    },
    analysisPrestate,
    binding: {
      ...fixture.binding,
      sourceAnalysisInputManifestFileSha256:
        sourceAnalysisSha256(inputManifestBytes),
      sourceAnalysisInputManifestSha256: `sha256:${inputManifest.manifestSha256}`,
      lifecycleSnapshotSha256: analysisPrestateSha256,
    },
    workflowFile: {
      path: SOURCE_ANALYSIS_WORKFLOW_PATH,
      bytes: SOURCE_ANALYSIS_WORKFLOW_BYTES,
    },
    promptTemplateFile: {
      path: SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
      bytes: SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES,
    },
    normalizedPages: syntheticNormalizedPages(),
  };
}

function fixtureArtifact(): SourceAnalysisArtifact {
  const locators: SourceAnalysisArtifact["locators"] = [
    {
      locatorId: "locator.page.1",
      locatorType: "page",
      label: "PDF page 1",
      pageStart: 1,
      pageEnd: 1,
      sectionPath: [],
      normalizedTextSha256: HASH.a!,
    },
    {
      locatorId: "locator.page.2",
      locatorType: "page",
      label: "PDF page 2",
      pageStart: 2,
      pageEnd: 2,
      sectionPath: [],
      normalizedTextSha256: HASH.b!,
    },
  ];
  const analysis: SourceAnalysisArtifact["analysis"] = {
    overview: {
      purpose:
        "The source evaluates reported trading-practice conditions in a bounded supply chain.",
      summary:
        "The report combines administrative records with a supplier survey and presents candidate evidence about bargaining practices.",
      sourceRoleCandidate: "primary_evidence",
      sourceRoleStatus: "machine_provisional",
      systemBoundary:
        "The declared boundary covers suppliers and buyers in the national food supply chain.",
      periodStatement:
        "The source reports activity and survey responses for calendar year 2024.",
      notAssessed: [
        "The analysis does not assess legal compliance beyond the evidence and methods declared by the source.",
      ],
    },
    claims: [
      {
        claimId: "claim.payment.practice",
        claimType: "reported_practice",
        proposition:
          "Some surveyed suppliers reported that agreed payment periods were not consistently met.",
        representation: "paraphrase",
        support: "direct",
        locatorIds: ["locator.page.2"],
        supportingTextUnitSha256s: [HASH.b!],
        limitations: [
          "The survey response group is smaller than the invited supplier population.",
        ],
        machineConfidence: 0.91,
        promotionState: "candidate_only",
      },
    ],
    quantitativeObservations: [
      {
        observationId: "observation.payment.share",
        statement:
          "Half of the responding suppliers reported a payment-related issue in the survey.",
        representation: "paraphrase",
        measure: { kind: "point", value: 50 },
        unit: {
          code: "percent",
          label: "percent of respondents",
          currencyCode: null,
        },
        universe: {
          description:
            "Supplier organizations that completed the source survey for the stated sector.",
          populationSize: 400,
          sampleSize: 45,
          geographyIds: ["geo.dk"],
          inclusionCriteria:
            "Organizations invited by the authority and returning a completed survey response.",
          exclusions: [
            "Invited organizations that did not return a completed response.",
          ],
        },
        period: {
          statement: "Survey responses collected for the 2024 reporting round.",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
        },
        method: {
          measurementBasis: "source_reported",
          statement:
            "The value is the percentage reported in the source survey results.",
          calculationStatement: null,
        },
        uncertaintyStatement:
          "The source does not report a sampling-error interval and notes a low response count.",
        locatorIds: ["locator.page.2"],
        supportingTextUnitSha256s: [HASH.b!],
        promotionState: "candidate_only",
      },
    ],
    actors: [
      {
        candidateId: "actor.supplier",
        name: "Surveyed food suppliers",
        actorType: "supplier_group",
        roleStatement:
          "Suppliers are the surveyed party reporting their experience of trading practices.",
        identityState: "unresolved",
        existingEntityId: null,
        locatorIds: ["locator.page.2"],
        promotionState: "candidate_only",
      },
      {
        candidateId: "actor.buyer",
        name: "Food-chain buyers",
        actorType: "buyer_group",
        roleStatement:
          "Buyers are the counterparties associated with the reported contractual practices.",
        identityState: "unresolved",
        existingEntityId: null,
        locatorIds: ["locator.page.2"],
        promotionState: "candidate_only",
      },
    ],
    policies: [
      {
        candidateId: "policy.utp",
        name: "Unfair trading practices framework",
        policyType: "regulatory_framework",
        jurisdictionGeographyIds: ["geo.dk"],
        statusStatement:
          "The report describes the framework as operative during the reporting period.",
        identityState: "provisional_match",
        existingEntityId: null,
        locatorIds: ["locator.page.1"],
        promotionState: "candidate_only",
      },
    ],
    relationships: [
      {
        relationshipId: "relationship.supplier.buyer",
        subjectEntityRef: "actor.supplier",
        predicate: "sells_to",
        objectEntityRef: "actor.buyer",
        direction: "directed",
        statement:
          "The source treats suppliers and buyers as contractual trading counterparties.",
        locatorIds: ["locator.page.2"],
        machineConfidence: 0.95,
        promotionState: "candidate_only",
      },
    ],
    flows: [
      {
        flowId: "flow.material.food",
        flowType: "material",
        fromEntityRef: "actor.supplier",
        toEntityRef: "actor.buyer",
        direction: "source_to_target",
        statement:
          "Food products move from the supplier side to the buyer side of the relationship.",
        materialProfileIds: ["material.food_products"],
        quantitativeObservationIds: [],
        locatorIds: ["locator.page.2"],
        promotionState: "candidate_only",
      },
      {
        flowId: "flow.financial.payment",
        flowType: "financial",
        fromEntityRef: "actor.buyer",
        toEntityRef: "actor.supplier",
        direction: "source_to_target",
        statement:
          "Payment obligations flow from buyers to suppliers under the reported contracts.",
        materialProfileIds: [],
        quantitativeObservationIds: ["observation.payment.share"],
        locatorIds: ["locator.page.2"],
        promotionState: "candidate_only",
      },
      {
        flowId: "flow.information.contract",
        flowType: "information",
        fromEntityRef: "actor.buyer",
        toEntityRef: "actor.supplier",
        direction: "bidirectional",
        statement:
          "Contract terms and changes form an information flow between the counterparties.",
        materialProfileIds: [],
        quantitativeObservationIds: [],
        locatorIds: ["locator.page.2"],
        promotionState: "candidate_only",
      },
    ],
    sourceAppraisal: {
      methods: [
        {
          methodId: "method.supplier.survey",
          methodType: "survey",
          statement:
            "The source reports an invitation-based supplier survey alongside administrative information.",
          locatorIds: ["locator.page.2"],
        },
      ],
      limitations: [
        {
          limitationId: "limitation.nonresponse",
          origin: "source_reported",
          category: "sampling",
          statement:
            "Only a minority of invited organizations completed the supplier survey.",
          effectOnInterpretation:
            "The response pattern may not represent all suppliers in the invited population.",
          locatorIds: ["locator.page.2"],
        },
      ],
      conflictOfInterest: {
        state: "not_reported",
        statement:
          "No explicit conflict-of-interest declaration was identified in the read pages.",
        locatorIds: ["locator.page.1"],
      },
      cannotSupport: [
        {
          boundaryId: "boundary.causality",
          statement:
            "The source cannot by itself establish that the policy caused observed market changes.",
          reason:
            "The report does not provide a controlled causal identification design.",
          locatorIds: ["locator.page.2"],
        },
      ],
    },
    reconciliation: {
      internalInconsistencies: [
        {
          findingId: "finding.internal.sample.order",
          topic: "annual survey sample ordering",
          statement:
            "The narrative and table present the same annual sample counts in different year orderings.",
          locatorIds: ["locator.page.1", "locator.page.2"],
          supportingTextUnitSha256s: [HASH.a!, HASH.b!],
          status: "open_candidate",
        },
      ],
      corroborations: [
        {
          findingId: "finding.corroboration.complaints",
          topic: "formal complaints and supplier experience",
          statement:
            "Another authority report also distinguishes formal enforcement records from supplier-reported experience.",
          thisSourceLocatorIds: ["locator.page.2"],
          otherSourceEvidence: [
            {
              sourceId: "source.other.report",
              sourceContentSha256: HASH.c!,
              analysisArtifactId: "artifact.analysis.other.v1",
              analysisArtifactVersion: "1.0.0",
              analysisArtifactSha256: HASH.d!,
              locatorIds: ["locator.other.page.9"],
            },
          ],
          status: "open_candidate",
        },
      ],
      contradictions: [
        {
          findingId: "finding.contradiction.prevalence",
          topic: "reported prevalence of trading problems",
          statement:
            "The low formal complaint count may conflict with the prevalence implied by anonymous supplier responses.",
          thisSourceLocatorIds: ["locator.page.2"],
          otherSourceEvidence: [
            {
              sourceId: "source.other.report",
              sourceContentSha256: HASH.c!,
              analysisArtifactId: "artifact.analysis.other.v1",
              analysisArtifactVersion: "1.0.0",
              analysisArtifactSha256: HASH.d!,
              locatorIds: ["locator.other.page.10"],
            },
          ],
          status: "open_candidate",
        },
      ],
      openQuestions: [
        {
          questionId: "question.nonresponse.bias",
          question:
            "How different are respondents from invited suppliers that did not complete the survey?",
          rationale:
            "The answer is needed before treating the observed share as representative of the invitation universe.",
          locatorIds: ["locator.page.2"],
          followUpSourceClasses: ["survey_microdata", "method_appendix"],
          blocking: false,
        },
      ],
    },
    ontologyCandidates: [
      {
        candidateId: "ontology.payment.practice",
        objectType: "term",
        preferredLabel: "late or missed contractual payment",
        proposedOntologyIds: ["concept.trading_practice.payment"],
        basis:
          "The source uses payment performance as a distinct category of supplier experience.",
        locatorIds: ["locator.page.2"],
        status: "candidate_only",
        automaticPromotion: false,
      },
    ],
    coverageCandidates: [
      {
        candidateId: "coverage.dk.trade.payment",
        coverageCellId: "coverage.dk.trade.payment.2024",
        rationale:
          "The source provides a located quantitative candidate for the declared geography and period.",
        evidenceClaimIds: ["claim.payment.practice"],
        evidenceObservationIds: ["observation.payment.share"],
        locatorIds: ["locator.page.2"],
        state: "candidate_only",
        automaticPromotion: false,
      },
    ],
  };

  const analysisPayloadSha256 = hashSourceAnalysisPayload({
    locators,
    analysis,
  });
  const binding: SourceAnalysisBinding = {
    sourceAnalysisInputManifestPath:
      "knowledge/corpus/source-analysis-input-manifests/example.manifest.v1.json",
    sourceAnalysisInputManifestFileSha256: HASH.n!,
    sourceAnalysisInputManifestSchemaVersion: "1.0.0",
    sourceAnalysisInputManifestPipelineVersion: "1.0.0",
    sourceAnalysisInputManifestSha256: HASH.o!,
    lifecycleRecordId: "corpus.record.example",
    lifecycleSnapshotSha256: HASH.e!,
    lifecycleSnapshotUpdatedAt: "2026-08-02T12:00:00Z",
    sourceId: "source.example",
    sourceTitle: "Example source report",
    sourceCanonicalIdentity: "research/library/example.pdf",
    sourceIdentityStatus: "verified",
    sourceIdentityVerificationArtifactId: "artifact.source.identity.example.v1",
    sourceIdentityVerificationArtifactVersion: "1.0.0",
    sourceIdentityVerificationArtifactPath:
      "knowledge/corpus/source-identity-verification/example.identity.v1.json",
    sourceIdentityVerificationArtifactFileSha256: HASH.p!,
    sourceIdentityVerificationArtifactSha256: HASH.m!,
    sourceIdentityVerificationDecision: "verified",
    sourceMetadataSha256: HASH.f!,
    sourceContentSha256: HASH.g!,
    rawPdfSha256: HASH.g!,
    textSha256: HASH.h!,
    textAvailabilityState: "full_text",
    extractionArtifactId: "artifact.extraction.example",
    extractionArtifactVersion: "1.0.0",
    extractionArtifactSha256: HASH.i!,
    extractionArtifactPath:
      "knowledge/corpus/pdf-page-extraction/receipts/example.receipt.v1.json",
    extractionArtifactFileSha256: HASH.q!,
    extractionTextManifestSha256: HASH.j!,
    pageMapPath:
      "knowledge/corpus/pdf-page-extraction/page-maps/example.page-map.v1.json",
    pageMapFileSha256: HASH.r!,
    pageMapSha256: HASH.s!,
  };
  const actualFullTextReading: SourceAnalysisArtifact["actualFullTextReading"] =
    {
      state: "complete",
      scope: "entire_normalized_text",
      runIds: ["ai.run.source.analysis.example"],
      inputTextSha256: HASH.h!,
      expectedUnitCount: 2,
      readUnitCount: 2,
      readLocatorIds: ["locator.page.1", "locator.page.2"],
      sequenceComplete: true,
      completedAt: "2026-08-02T12:15:00Z",
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
  const stageArtifact = {
    binding,
    actualFullTextReading,
    locators,
    analysis,
    analysisPayloadSha256,
  };
  let predecessorCheckpointSha256: string | null = null;
  const checkpointTimes = [
    "2026-08-02T12:15:00Z",
    "2026-08-02T12:16:00Z",
    "2026-08-02T12:18:00Z",
    "2026-08-02T12:20:00Z",
  ];
  const checkpoints: SourceAnalysisCheckpoint[] =
    SOURCE_ANALYSIS_REQUIRED_STAGES.map((stage, index) => {
      const inputSha256 = predecessorCheckpointSha256 ?? inputEnvelopeSha256;
      const stagePayload = sourceAnalysisStagePayload(
        stage,
        stageArtifact,
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
      const checkpoint = {
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
  const finalOutputSha256 = hashSourceAnalysisFinalOutput({
    analysisPayloadSha256,
    lastCheckpointOutputSha256,
  });
  return sealSourceAnalysisArtifact({
    schemaVersion: SOURCE_ANALYSIS_SCHEMA_VERSION,
    artifactType: "source_analysis",
    artifactId: "artifact.source.analysis.example.v1",
    artifactVersion: SOURCE_ANALYSIS_ARTIFACT_VERSION,
    lineageId: "lineage.source.analysis.example",
    continuity: {
      kind: "initial",
      predecessorArtifactId: null,
      predecessorArtifactVersion: null,
      predecessorArtifactSha256: null,
      changeSummary: null,
    },
    binding,
    scope: {
      geographyIds: ["geo.dk"],
      materialProfileIds: ["material.food_products"],
      intendedUseProfileIds: ["use.internal_research"],
      sourceLanguageCodes: ["da"],
    },
    sourceTextPolicy: {
      longSourceTextIncluded: false,
      directQuotesIncluded: false,
      policy: "paraphrases_and_locators_only",
    },
    fullTextEligibility: {
      state: "eligible",
      basis: "full_text",
      identityHashBound: true,
      contentHashBound: true,
      textHashBound: true,
      expectedUnitCount: 2,
      extractionWarnings: [
        {
          warningId: "warning.cover.low.text",
          code: "low_extracted_text",
          disposition: "accepted_limitation",
          statement:
            "The cover page contains little text, but its normalized content was retained and read.",
          affectedLocatorIds: ["locator.page.1"],
        },
      ],
      unresolvedBlockingWarningCount: 0,
      evaluatedAt: "2026-08-02T12:05:00Z",
    },
    locators,
    actualFullTextReading,
    analysisExecution: {
      executionMode: "ai_assisted",
      runs: [
        {
          runId: "ai.run.source.analysis.example",
          stages: [...SOURCE_ANALYSIS_REQUIRED_STAGES],
          checkpoints,
          provider: "OpenAI",
          model: "gpt-5",
          modelVersionState: "runtime_not_exposed",
          modelVersion: SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED,
          ...workflow,
          workflowSha256,
          inputTextSha256: HASH.h!,
          inputEnvelope,
          inputEnvelopeSha256,
          predecessorOutputSha256: null,
          outputSha256: lastCheckpointOutputSha256,
          timeEvidence: "coordinator_observed_window",
          timeEvidenceExplanation:
            "The coordinator observed the request window; provider timestamps were not exposed.",
          startedAt: "2026-08-02T12:10:00Z",
          completedAt: "2026-08-02T12:20:00Z",
        },
      ],
      finalOutputSha256,
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
      publication: { complete: false, state: "internal_only", receiptId: null },
      coverage: {
        complete: false,
        state: "candidate",
        receiptId: null,
        automaticPromotionAllowed: false,
      },
    },
    analysisPayloadSha256,
    createdAt: "2026-08-02T12:21:00Z",
  });
}

function resealExecution(
  source: SourceAnalysisArtifact,
  checkpointTimes = [
    "2026-08-03T08:12:00Z",
    "2026-08-03T08:14:00Z",
    "2026-08-03T08:16:00Z",
    "2026-08-03T08:18:00Z",
  ],
): SourceAnalysisArtifact {
  const artifact = structuredClone(source);
  artifact.analysisPayloadSha256 = hashSourceAnalysisPayload({
    locators: artifact.locators,
    analysis: artifact.analysis,
  });
  const run = artifact.analysisExecution.runs[0]!;
  const workflow = {
    workflowRef: run.workflowRef,
    workflowVersion: run.workflowVersion,
    workflowPath: run.workflowPath,
    workflowFileSha256: run.workflowFileSha256,
    promptTemplateRef: run.promptTemplateRef,
    promptTemplateVersion: run.promptTemplateVersion,
    promptTemplatePath: run.promptTemplatePath,
    promptTemplateFileSha256: run.promptTemplateFileSha256,
  };
  run.workflowSha256 = hashSourceAnalysisWorkflow(workflow);
  run.inputTextSha256 = artifact.binding.textSha256;
  run.inputEnvelope = sourceAnalysisInputEnvelope(
    artifact.binding,
    run.workflowSha256,
  );
  run.inputEnvelopeSha256 = hashSourceAnalysisInputEnvelope(run.inputEnvelope);
  run.stages = [...SOURCE_ANALYSIS_REQUIRED_STAGES];
  let predecessorCheckpointSha256: string | null = null;
  run.checkpoints = SOURCE_ANALYSIS_REQUIRED_STAGES.map((stage, index) => {
    const inputSha256 = predecessorCheckpointSha256 ?? run.inputEnvelopeSha256;
    const stagePayload = sourceAnalysisStagePayload(
      stage,
      artifact,
      run.inputEnvelopeSha256,
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
    const checkpoint = {
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
  run.predecessorOutputSha256 = null;
  run.outputSha256 = run.checkpoints.at(-1)!.outputSha256;
  artifact.analysisExecution.finalOutputSha256 = hashSourceAnalysisFinalOutput({
    analysisPayloadSha256: artifact.analysisPayloadSha256,
    lastCheckpointOutputSha256: run.outputSha256,
  });
  const { artifactSha256: _oldSeal, ...body } = artifact;
  return sealSourceAnalysisArtifact(body);
}

function combinedArtifact(inputs = combinedReplayInputs()): {
  artifact: SourceAnalysisArtifact;
  inputs: CombinedReplayInputs;
} {
  const artifact = structuredClone(fixtureArtifact());
  const manifest = JSON.parse(
    Buffer.from(inputs.inputManifestFile.bytes).toString("utf8"),
  ) as SourceAnalysisInputManifest;
  artifact.binding = inputs.binding;
  artifact.scope = {
    ...inputs.analysisPrestate.scope,
    sourceLanguageCodes: ["en"],
  };
  artifact.locators = manifest.pages.map((page) => ({
    locatorId: `locator.page.${page.pageNumber}`,
    locatorType: "page",
    label: `PDF page ${page.pageNumber}`,
    pageStart: page.pageNumber,
    pageEnd: page.pageNumber,
    sectionPath: [],
    normalizedTextSha256: `sha256:${page.normalizedText.sha256}`,
  }));
  const orderedHashes = artifact.locators.map(
    (locator) => locator.normalizedTextSha256,
  );
  artifact.analysis.claims[0]!.supportingTextUnitSha256s = [orderedHashes[1]!];
  artifact.analysis.quantitativeObservations[0]!.supportingTextUnitSha256s = [
    orderedHashes[1]!,
  ];
  artifact.analysis.reconciliation.internalInconsistencies[0]!.supportingTextUnitSha256s =
    orderedHashes;
  artifact.fullTextEligibility.expectedUnitCount = manifest.totals.pageCount;
  artifact.fullTextEligibility.evaluatedAt = "2026-08-03T08:11:00Z";
  artifact.actualFullTextReading = {
    state: "complete",
    scope: "entire_normalized_text",
    runIds: ["ai.run.source.analysis.example"],
    inputTextSha256: inputs.binding.textSha256,
    expectedUnitCount: manifest.totals.pageCount,
    readUnitCount: manifest.totals.pageCount,
    readLocatorIds: artifact.locators.map((locator) => locator.locatorId),
    sequenceComplete: true,
    completedAt: "2026-08-03T08:12:00Z",
  };
  const run = artifact.analysisExecution.runs[0]!;
  run.startedAt = "2026-08-03T08:11:00Z";
  run.completedAt = "2026-08-03T08:18:00Z";
  artifact.createdAt = "2026-08-03T08:19:00Z";
  return { artifact: resealExecution(artifact), inputs };
}

function withBlockedManifest(
  fixture: CombinedReplayInputs,
): CombinedReplayInputs {
  const manifest = JSON.parse(
    Buffer.from(fixture.inputManifestFile.bytes).toString("utf8"),
  ) as SourceAnalysisInputManifest;
  const { manifestSha256: _seal, ...body } = manifest;
  const blocked = sealSourceAnalysisInputManifest({
    ...body,
    identityAssociation: {
      state: "provisional_metadata_match",
      intendedLabel: manifest.identityAssociation.intendedLabel,
      observedDocumentTitle: manifest.identityAssociation.observedDocumentTitle,
      blockerCode: null,
    },
    sourceBinding: {
      ...manifest.sourceBinding,
      corpusIdentityVerified: false,
    },
    workflowEligibility: sourceAnalysisInputWorkflowEligibility({
      state: "provisional_metadata_match",
      intendedLabel: manifest.identityAssociation.intendedLabel,
      observedDocumentTitle: manifest.identityAssociation.observedDocumentTitle,
      blockerCode: null,
    }),
  });
  const bytes = Buffer.from(`${JSON.stringify(blocked, null, 2)}\n`, "utf8");
  return {
    ...fixture,
    inputManifestFile: { ...fixture.inputManifestFile, bytes },
    binding: {
      ...fixture.binding,
      sourceAnalysisInputManifestFileSha256: sourceAnalysisSha256(bytes),
      sourceAnalysisInputManifestSha256: `sha256:${blocked.manifestSha256}`,
    },
  };
}

function assertStructuralParity(value: unknown, expected: boolean): void {
  const zodAccepted =
    sourceAnalysisArtifactStructuralSchema.safeParse(value).success;
  const jsonAccepted = validateJsonSchema(value);
  assert.equal(zodAccepted, expected);
  assert.equal(
    jsonAccepted,
    expected,
    JSON.stringify(validateJsonSchema.errors),
  );
}

function exactCombinedNormalizedInput(): {
  manifest: SourceAnalysisInputManifest;
  normalizedPages: Array<{ pageNumber: number; bytes: Buffer }>;
} {
  const fixture = sourceAnalysisCombinedInputFixture();
  const manifest = JSON.parse(
    Buffer.from(fixture.inputManifestFile.bytes).toString("utf8"),
  ) as SourceAnalysisInputManifest;
  return {
    manifest,
    normalizedPages: syntheticNormalizedPages(),
  };
}

test("accepts one exact, sealed full-text AI analysis in Zod and JSON Schema", () => {
  const artifact = fixtureArtifact();
  assertStructuralParity(artifact, true);
  assert.deepEqual(validateSourceAnalysisArtifact(artifact), artifact);
  assert.equal(artifact.analysis.claims[0]?.representation, "paraphrase");
  assert.equal(artifact.gates.coverage.automaticPromotionAllowed, false);
});

test("binds every run to the exact canonical workflow and prompt-template files", () => {
  const artifact = fixtureArtifact();
  assert.equal(
    validateSourceAnalysisWorkflowFile(artifact, {
      path: SOURCE_ANALYSIS_WORKFLOW_PATH,
      bytes: SOURCE_ANALYSIS_WORKFLOW_BYTES,
    }),
    SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  );
  assert.equal(
    validateSourceAnalysisPromptTemplateFile(artifact, {
      path: SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
      bytes: SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES,
    }),
    SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  );

  assert.throws(
    () =>
      validateSourceAnalysisWorkflowFile(artifact, {
        path: SOURCE_ANALYSIS_WORKFLOW_PATH,
        bytes: Buffer.concat([
          SOURCE_ANALYSIS_WORKFLOW_BYTES,
          Buffer.from("changed\n", "utf8"),
        ]),
      }),
    /workflow file bytes do not match the pinned hash/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisWorkflowFile(artifact, {
        path: "knowledge/corpus/workflows/not-the-workflow.md",
        bytes: SOURCE_ANALYSIS_WORKFLOW_BYTES,
      }),
    /workflow path must be/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisWorkflowFile(artifact, {
        path: SOURCE_ANALYSIS_WORKFLOW_PATH,
        bytes: Buffer.alloc(0),
      }),
    /workflow file bytes do not match the pinned hash/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisPromptTemplateFile(artifact, {
        path: SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
        bytes: Buffer.concat([
          SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES,
          Buffer.from("changed\n", "utf8"),
        ]),
      }),
    /prompt template file bytes do not match the pinned hash/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisPromptTemplateFile(artifact, {
        path: "knowledge/corpus/workflows/not-the-prompt.md",
        bytes: SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES,
      }),
    /prompt template path must be/,
  );

  const missingWorkflowFileHash = structuredClone(
    artifact,
  ) as unknown as Record<string, unknown>;
  const execution = missingWorkflowFileHash.analysisExecution as Record<
    string,
    unknown
  >;
  const runs = execution.runs as Array<Record<string, unknown>>;
  delete runs[0]!.workflowFileSha256;
  assertStructuralParity(missingWorkflowFileHash, false);

  const wrongWorkflowFileHash = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const wrongWorkflowExecution =
    wrongWorkflowFileHash.analysisExecution as Record<string, unknown>;
  const wrongWorkflowRuns = wrongWorkflowExecution.runs as Array<
    Record<string, unknown>
  >;
  wrongWorkflowRuns[0]!.workflowFileSha256 = HASH.z!;
  assertStructuralParity(wrongWorkflowFileHash, false);

  const wrongPromptFileHash = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const wrongPromptExecution = wrongPromptFileHash.analysisExecution as Record<
    string,
    unknown
  >;
  const wrongPromptRuns = wrongPromptExecution.runs as Array<
    Record<string, unknown>
  >;
  wrongPromptRuns[0]!.promptTemplateFileSha256 = HASH.z!;
  assertStructuralParity(wrongPromptFileHash, false);
});

test("recomputes exact normalized page bytes, counts, order and serialized input", () => {
  const exact = exactCombinedNormalizedInput();
  assert.deepEqual(
    validateSourceAnalysisNormalizedPageBytes(
      exact.manifest,
      exact.normalizedPages,
    ),
    {
      normalizedInputSha256: `sha256:${exact.manifest.normalizedInput.sha256}`,
      serializedSizeBytes: exact.manifest.normalizedInput.serializedSizeBytes,
    },
  );

  const changed = structuredClone(exact.normalizedPages);
  changed[0]!.bytes = Buffer.from("Changed page bytes.\n", "utf8");
  assert.throws(
    () => validateSourceAnalysisNormalizedPageBytes(exact.manifest, changed),
    /bytes, hash, character count or word count do not match/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(
        exact.manifest,
        exact.normalizedPages.slice(0, 1),
      ),
    /must contain every manifest page exactly once/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(
        exact.manifest,
        [...exact.normalizedPages].reverse(),
      ),
    /missing or out of order at page 1/,
  );
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(exact.manifest, [
        ...exact.normalizedPages,
        { pageNumber: 3, bytes: Buffer.from("Extra page.\n", "utf8") },
      ]),
    /must contain every manifest page exactly once/,
  );
  const invalidUtf8 = structuredClone(exact.normalizedPages);
  invalidUtf8[0]!.bytes = Buffer.from([0xc3, 0x28]);
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(exact.manifest, invalidUtf8),
    /normalized page 1 bytes is not valid UTF-8/,
  );

  const { manifestSha256: _countSeal, ...countBody } = structuredClone(
    exact.manifest,
  );
  countBody.pages[0]!.normalizedText.characterCount += 1;
  countBody.pages[0]!.normalizedText.wordCount += 1;
  countBody.totals.normalizedCharacterCount += 1;
  countBody.totals.wordCount += 1;
  const countDrift = sealSourceAnalysisInputManifest(countBody);
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(
        countDrift,
        exact.normalizedPages,
      ),
    /character count or word count do not match/,
  );

  const { manifestSha256: _inputSeal, ...inputBody } = structuredClone(
    exact.manifest,
  );
  inputBody.normalizedInput.sha256 = sourceAnalysisSha256(
    "wrong-serialized-input",
  ).slice("sha256:".length);
  const serializedInputDrift = sealSourceAnalysisInputManifest(inputBody);
  assert.throws(
    () =>
      validateSourceAnalysisNormalizedPageBytes(
        serializedInputDrift,
        exact.normalizedPages,
      ),
    /serialized normalized input bytes do not match/,
  );
});

test("does not confuse technical full-text eligibility with actual AI reading", () => {
  const eligibleOnly = structuredClone(fixtureArtifact()) as unknown as Record<
    string,
    unknown
  >;
  eligibleOnly.actualFullTextReading = {
    state: "not_started",
    scope: "entire_normalized_text",
    runIds: [],
  };
  assertStructuralParity(eligibleOnly, false);
});

test("rejects direct-source-text fields and every unknown nested property in both schemas", () => {
  const artifact = structuredClone(
    fixtureArtifact(),
  ) as SourceAnalysisArtifact & {
    analysis: SourceAnalysisArtifact["analysis"] & {
      claims: Array<
        SourceAnalysisArtifact["analysis"]["claims"][number] & {
          sourceExcerpt?: string;
        }
      >;
    };
  };
  artifact.analysis.claims[0]!.sourceExcerpt =
    "Copied source text is not an artifact field.";
  assertStructuralParity(artifact, false);
});

test("keeps ontology, coverage, owner, expert, rights and publication gates closed", () => {
  const promoted = structuredClone(fixtureArtifact()) as unknown as Record<
    string,
    unknown
  >;
  const analysis = promoted.analysis as Record<string, unknown>;
  const candidates = analysis.coverageCandidates as Array<
    Record<string, unknown>
  >;
  candidates[0]!.automaticPromotion = true;
  assertStructuralParity(promoted, false);

  const externallyApproved = structuredClone(
    fixtureArtifact(),
  ) as unknown as Record<string, unknown>;
  const gates = externallyApproved.gates as Record<string, unknown>;
  gates.publication = {
    complete: true,
    state: "publishable",
    receiptId: "receipt.fake",
  };
  assertStructuralParity(externallyApproved, false);
});

test("requires exact quantitative value, unit, universe, period and method fields", () => {
  const missingUniverse = structuredClone(
    fixtureArtifact(),
  ) as unknown as Record<string, unknown>;
  const analysis = missingUniverse.analysis as Record<string, unknown>;
  const observations = analysis.quantitativeObservations as Array<
    Record<string, unknown>
  >;
  delete observations[0]!.universe;
  assertStructuralParity(missingUniverse, false);
});

test("fails closed when any page or section is skipped despite a complete-looking flag", () => {
  const skipped = structuredClone(fixtureArtifact());
  skipped.actualFullTextReading.readLocatorIds = ["locator.page.1"];
  assertStructuralParity(skipped, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(skipped),
    /actual full-text reading locator IDs must exactly match/,
  );
});

test("binds every claim and observation to exact locator text hashes", () => {
  const drifted = structuredClone(fixtureArtifact());
  drifted.analysis.claims[0]!.supportingTextUnitSha256s = [HASH.c!];
  assertStructuralParity(drifted, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(drifted),
    /supporting text hashes must exactly match/,
  );
});

test("records internal source inconsistencies at two or more exact text positions", () => {
  const artifact = fixtureArtifact();
  assert.equal(
    artifact.analysis.reconciliation.internalInconsistencies.length,
    1,
  );
  assert.deepEqual(
    artifact.analysis.reconciliation.internalInconsistencies[0]!.locatorIds,
    ["locator.page.1", "locator.page.2"],
  );

  const onePosition = structuredClone(artifact);
  onePosition.analysis.reconciliation.internalInconsistencies[0]!.locatorIds = [
    "locator.page.1",
  ];
  onePosition.analysis.reconciliation.internalInconsistencies[0]!.supportingTextUnitSha256s =
    [HASH.a!];
  assertStructuralParity(onePosition, false);

  const wrongTextHash = structuredClone(artifact);
  wrongTextHash.analysis.reconciliation.internalInconsistencies[0]!.supportingTextUnitSha256s =
    [HASH.a!, HASH.c!];
  assertStructuralParity(wrongTextHash, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(wrongTextHash),
    /internal inconsistency .* supporting text hashes must exactly match/,
  );
});

test("binds AI provider, model, workflow and input to the exact text snapshot", () => {
  const wrongText = structuredClone(fixtureArtifact());
  wrongText.analysisExecution.runs[0]!.inputTextSha256 = HASH.z!;
  assertStructuralParity(wrongText, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(wrongText),
    /not bound to the exact source text hash/,
  );

  const missingStage = structuredClone(fixtureArtifact());
  missingStage.analysisExecution.runs[0]!.stages = [
    "full_text_read",
    "structured_analysis",
  ];
  assertStructuralParity(missingStage, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(missingStage),
    /AI execution stages must exactly match/,
  );
});

test("records unavailable model builds and coordinator timing without fabrication", () => {
  const artifact = fixtureArtifact();
  const run = artifact.analysisExecution.runs[0]!;
  assert.equal(run.modelVersionState, "runtime_not_exposed");
  assert.equal(run.modelVersion, SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED);
  assert.equal(run.timeEvidence, "coordinator_observed_window");

  const fabricated = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const execution = fabricated.analysisExecution as Record<string, unknown>;
  const runs = execution.runs as Array<Record<string, unknown>>;
  runs[0]!.modelVersion = "invented-build";
  assertStructuralParity(fabricated, false);

  const falseExact = structuredClone(artifact) as unknown as Record<
    string,
    unknown
  >;
  const exactExecution = falseExact.analysisExecution as Record<
    string,
    unknown
  >;
  const exactRuns = exactExecution.runs as Array<Record<string, unknown>>;
  exactRuns[0]!.modelVersionState = "exact";
  assertStructuralParity(falseExact, false);
});

test("rejects broken entity, flow, coverage and quantitative cross-references", () => {
  const unknownEntity = structuredClone(fixtureArtifact());
  unknownEntity.analysis.relationships[0]!.objectEntityRef =
    "actor.not.declared";
  assert.throws(
    () => validateSourceAnalysisArtifact(unknownEntity),
    /references an undeclared entity candidate/,
  );

  const unknownObservation = structuredClone(fixtureArtifact());
  unknownObservation.analysis.flows[1]!.quantitativeObservationIds = [
    "observation.not.declared",
  ];
  assert.throws(
    () => validateSourceAnalysisArtifact(unknownObservation),
    /references unknown observation/,
  );

  const unknownClaim = structuredClone(fixtureArtifact());
  unknownClaim.analysis.coverageCandidates[0]!.evidenceClaimIds = [
    "claim.not.declared",
  ];
  assert.throws(
    () => validateSourceAnalysisArtifact(unknownClaim),
    /references unknown claim/,
  );
});

test("rejects duplicate IDs that would make candidate references ambiguous", () => {
  const duplicateClaim = structuredClone(fixtureArtifact());
  duplicateClaim.analysis.claims.push(
    structuredClone(duplicateClaim.analysis.claims[0]!),
  );
  assertStructuralParity(duplicateClaim, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(duplicateClaim),
    /claim IDs must be unique/,
  );

  const duplicateEntity = structuredClone(fixtureArtifact());
  duplicateEntity.analysis.policies[0]!.candidateId = "actor.supplier";
  assert.throws(
    () => validateSourceAnalysisArtifact(duplicateEntity),
    /actor and policy candidate IDs must be unique/,
  );
});

test("requires exact lifecycle, source, content and text binding supplied by the caller", () => {
  const artifact = fixtureArtifact();
  assert.doesNotThrow(() =>
    validateSourceAnalysisBinding(artifact, artifact.binding),
  );
  const expected = { ...artifact.binding, sourceContentSha256: HASH.z! };
  assert.throws(
    () => validateSourceAnalysisBinding(artifact, expected),
    /does not match the exact expected lifecycle\/source\/content\/text snapshot/,
  );
});

test("requires explicit predecessor continuity for every revision", () => {
  const revision = structuredClone(fixtureArtifact());
  revision.continuity.kind = "revision";
  assertStructuralParity(revision, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(revision),
    /revision continuity requires the exact predecessor/,
  );
});

test("checks quantitative semantics beyond the structural schema", () => {
  const invertedRange = structuredClone(fixtureArtifact());
  invertedRange.analysis.quantitativeObservations[0]!.measure = {
    kind: "range",
    lower: 60,
    upper: 40,
  };
  assertStructuralParity(invertedRange, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(invertedRange),
    /inverted range/,
  );

  const undisclosedCalculation = structuredClone(fixtureArtifact());
  undisclosedCalculation.analysis.quantitativeObservations[0]!.method.measurementBasis =
    "analyst_calculated";
  assertStructuralParity(undisclosedCalculation, true);
  assert.throws(
    () => validateSourceAnalysisArtifact(undisclosedCalculation),
    /calculation disclosure is inconsistent/,
  );
});

test("detects payload changes and an invalid named artifact seal", () => {
  const payloadDrift = structuredClone(fixtureArtifact());
  payloadDrift.analysis.overview.summary += " Changed after the AI run.";
  assert.throws(
    () => validateSourceAnalysisArtifact(payloadDrift),
    /analysis payload hash does not match/,
  );

  const sealDrift = structuredClone(fixtureArtifact());
  sealDrift.artifactSha256 = HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(sealDrift),
    /artifact hash does not match/,
  );
});

test("accepts one synthetic positive manifest only through the combined exact-input validator", () => {
  const { artifact, inputs } = combinedArtifact();
  const validated = validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
    artifact,
    inputs,
  );
  assert.equal(
    validated.inputManifest.workflowEligibility.sourceAnalysis.allowed,
    true,
  );
  assert.equal(validated.identityArtifact.decision.state, "verified");
  assert.equal(
    validated.identityVerificationPrestate.sourceIdentity.identityStatus,
    "provisional",
  );
  assert.equal(
    validated.analysisPrestate.sourceIdentity.identityStatus,
    "verified",
  );
  assert.equal(
    validated.analysisPrestate.recordId,
    artifact.binding.lifecycleRecordId,
  );
  assert.notEqual(
    validated.identityArtifact.binding.lifecycleSnapshotSha256,
    artifact.binding.lifecycleSnapshotSha256,
  );
});

test("standalone evidence authorization requires the identity content-addressed repository path", () => {
  const chain = corpusProcessingFullChainFixture();
  const canonicalInputs = {
    predecessorInputManifestFile: {
      path: chain.identityFixture.candidateInputManifestPath,
      bytes: chain.identityFixture.candidateInputManifestBytes,
    },
    inputManifestFile: {
      path: chain.verifiedInputManifestPath,
      bytes: chain.verifiedInputManifestBytes,
    },
    identityArtifactFile: {
      path: chain.identityFixture.identityArtifactPath,
      bytes: chain.identityFixture.identityArtifactBytes,
    },
    identityVerificationPrestate: chain.identityFixture.lifecycleL1,
    analysisPrestate: chain.lifecycleL2,
    identityEvidenceBundle: chain.identityFixture.bundle,
    ...chain.analysisExecutionEvidence,
  };
  const canonical = validateSourceAnalysisArtifactWithEvidenceBundle(
    chain.analysisArtifact,
    canonicalInputs,
  );
  assert.equal(
    canonicalInputs.identityArtifactFile.path,
    sourceIdentityVerificationArtifactPath(
      canonical.identityArtifact.artifactSha256,
    ),
  );

  const arbitraryIdentityPath =
    "knowledge/corpus/source-identity-verification/artifacts/arbitrary-valid-bytes.source-identity-verification.v1.json";
  const { manifestSha256: _manifestSeal, ...manifestBody } =
    chain.verifiedInputManifest;
  if (manifestBody.workflowEligibility.state !== "source_analysis_eligible") {
    assert.fail("Full-chain fixture must contain an eligible input manifest");
  }
  const arbitraryManifest = sealSourceAnalysisInputManifest({
    ...manifestBody,
    workflowEligibility: {
      ...manifestBody.workflowEligibility,
      sourceAnalysis: {
        ...manifestBody.workflowEligibility.sourceAnalysis,
        identityArtifactReference: {
          ...manifestBody.workflowEligibility.sourceAnalysis
            .identityArtifactReference,
          path: arbitraryIdentityPath,
        },
      },
    },
  });
  const arbitraryManifestBytes = Buffer.from(
    `${JSON.stringify(arbitraryManifest, null, 2)}\n`,
    "utf8",
  );
  const arbitraryArtifactDraft = structuredClone(chain.analysisArtifact);
  arbitraryArtifactDraft.binding.sourceAnalysisInputManifestFileSha256 =
    sourceAnalysisSha256(arbitraryManifestBytes);
  arbitraryArtifactDraft.binding.sourceAnalysisInputManifestSha256 = `sha256:${arbitraryManifest.manifestSha256}`;
  arbitraryArtifactDraft.binding.sourceIdentityVerificationArtifactPath =
    arbitraryIdentityPath;
  const arbitraryArtifact = resealExecution(
    arbitraryArtifactDraft,
    chain.analysisArtifact.analysisExecution.runs[0]!.checkpoints.map(
      (checkpoint) => checkpoint.completedAt,
    ),
  );
  const arbitraryReplayInputs = {
    ...canonicalInputs,
    inputManifestFile: {
      path: chain.verifiedInputManifestPath,
      bytes: arbitraryManifestBytes,
    },
    identityArtifactFile: {
      path: arbitraryIdentityPath,
      bytes: chain.identityFixture.identityArtifactBytes,
    },
  };

  assert.doesNotThrow(() =>
    validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
      arbitraryArtifact,
      arbitraryReplayInputs,
    ),
  );
  assert.throws(
    () =>
      validateSourceAnalysisArtifactWithEvidenceBundle(
        arbitraryArtifact,
        arbitraryReplayInputs,
      ),
    /content-addressed repository path derived from its validated artifact seal/,
  );
});

test("decision-only replay still requires exact workflow, prompt and normalized-page bytes", () => {
  const workflowDrift = combinedArtifact();
  workflowDrift.inputs.workflowFile = {
    ...workflowDrift.inputs.workflowFile,
    bytes: Buffer.concat([
      SOURCE_ANALYSIS_WORKFLOW_BYTES,
      Buffer.from("changed\n", "utf8"),
    ]),
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        workflowDrift.artifact,
        workflowDrift.inputs,
      ),
    /workflow file bytes do not match the pinned hash/,
  );

  const promptDrift = combinedArtifact();
  promptDrift.inputs.promptTemplateFile = {
    ...promptDrift.inputs.promptTemplateFile,
    bytes: Buffer.concat([
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_BYTES,
      Buffer.from("changed\n", "utf8"),
    ]),
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        promptDrift.artifact,
        promptDrift.inputs,
      ),
    /prompt template file bytes do not match the pinned hash/,
  );

  const pageDrift = combinedArtifact();
  pageDrift.inputs.normalizedPages = pageDrift.inputs.normalizedPages.map(
    (page, index) =>
      index === 0
        ? { ...page, bytes: Buffer.from("Changed page.\n", "utf8") }
        : page,
  );
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        pageDrift.artifact,
        pageDrift.inputs,
      ),
    /normalized page 1 bytes, hash, character count or word count/,
  );
});

test("rejects a fully sealed but source-analysis-ineligible manifest", () => {
  const blockedInputs = withBlockedManifest(combinedReplayInputs());
  const { artifact } = combinedArtifact(blockedInputs);
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        artifact,
        blockedInputs,
      ),
    /workflowEligibility\.sourceAnalysis\.allowed must be true/,
  );
});

test("requires each execution stage exactly once and in the mandated order", () => {
  const missing = structuredClone(fixtureArtifact());
  missing.analysisExecution.runs[0]!.stages = [
    "full_text_read",
    "locator_grounding",
    "structured_analysis",
  ];
  assert.throws(
    () => validateSourceAnalysisArtifact(missing),
    /AI execution stages must exactly match/,
  );

  const repeated = structuredClone(fixtureArtifact());
  repeated.analysisExecution.runs[0]!.stages = [
    "full_text_read",
    "locator_grounding",
    "locator_grounding",
    "structured_analysis",
    "reconciliation",
  ];
  assert.throws(
    () => validateSourceAnalysisArtifact(repeated),
    /AI execution stages must exactly match/,
  );

  const reordered = structuredClone(fixtureArtifact());
  reordered.analysisExecution.runs[0]!.stages = [
    "locator_grounding",
    "full_text_read",
    "structured_analysis",
    "reconciliation",
  ];
  assert.throws(
    () => validateSourceAnalysisArtifact(reordered),
    /AI execution stages must exactly match/,
  );
});

test("recomputes workflow, canonical input-envelope, checkpoint-chain and final-output seals", () => {
  const wrongWorkflow = structuredClone(fixtureArtifact());
  wrongWorkflow.analysisExecution.runs[0]!.workflowSha256 = HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(wrongWorkflow),
    /workflow hash does not match/,
  );

  const wrongEnvelope = structuredClone(fixtureArtifact());
  wrongEnvelope.analysisExecution.runs[0]!.inputEnvelopeSha256 = HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(wrongEnvelope),
    /input-envelope hash does not match/,
  );

  const brokenPredecessor = structuredClone(fixtureArtifact());
  brokenPredecessor.analysisExecution.runs[0]!.checkpoints[1]!.predecessorCheckpointSha256 =
    HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(brokenPredecessor),
    /broken predecessor chain/,
  );

  const badStagePayload = structuredClone(fixtureArtifact());
  badStagePayload.analysisExecution.runs[0]!.checkpoints[1]!.stagePayloadSha256 =
    HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(badStagePayload),
    /stage-payload hash is invalid/,
  );

  const badFinalSeal = structuredClone(fixtureArtifact());
  badFinalSeal.analysisExecution.finalOutputSha256 = HASH.z!;
  assert.throws(
    () => validateSourceAnalysisArtifact(badFinalSeal),
    /final AI output seal/,
  );
});

test("combined validation rejects fabricated locators and manifest page-order drift", () => {
  const first = combinedArtifact();
  const fabricated = structuredClone(first.artifact);
  fabricated.locators[0]!.label = "Invented appendix locator";
  const resealedFabricated = resealExecution(fabricated);
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        resealedFabricated,
        first.inputs,
      ),
    /locators do not exactly match every ordered manifest page/,
  );

  const second = combinedArtifact();
  const reordered = structuredClone(second.artifact);
  reordered.locators.reverse();
  reordered.actualFullTextReading.readLocatorIds.reverse();
  const resealedReordered = resealExecution(reordered);
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        resealedReordered,
        second.inputs,
      ),
    /locators do not exactly match every ordered manifest page/,
  );
});

test("combined validation rejects predecessor, identity-file and both lifecycle-prestate drifts", () => {
  const scopeDrift = combinedArtifact();
  const driftedScopeArtifact = structuredClone(scopeDrift.artifact);
  driftedScopeArtifact.scope.geographyIds = ["geo.se"];
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        resealExecution(driftedScopeArtifact),
        scopeDrift.inputs,
      ),
    /scope does not exactly match the verified analysis lifecycle prestate/,
  );

  const predecessorDrift = combinedArtifact();
  predecessorDrift.inputs.predecessorInputManifestFile = {
    ...predecessorDrift.inputs.predecessorInputManifestFile,
    bytes: Buffer.concat([
      Buffer.from(predecessorDrift.inputs.predecessorInputManifestFile.bytes),
      Buffer.from("\n"),
    ]),
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        predecessorDrift.artifact,
        predecessorDrift.inputs,
      ),
    /exact predecessor manifest path, file hash, version and seal/,
  );

  const identityDrift = combinedArtifact();
  identityDrift.inputs.identityArtifactFile = {
    ...identityDrift.inputs.identityArtifactFile,
    bytes: Buffer.concat([
      Buffer.from(identityDrift.inputs.identityArtifactFile.bytes),
      Buffer.from("\n"),
    ]),
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        identityDrift.artifact,
        identityDrift.inputs,
      ),
    /exact validated identity artifact file and seal/,
  );

  const identityLifecycleDrift = combinedArtifact();
  identityLifecycleDrift.inputs.identityVerificationPrestate = {
    ...identityLifecycleDrift.inputs.identityVerificationPrestate,
    updatedAt: "2026-08-03T08:03:30Z",
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        identityLifecycleDrift.artifact,
        identityLifecycleDrift.inputs,
      ),
    /exact identity-verification lifecycle prestate/,
  );

  const analysisLifecycleDrift = combinedArtifact();
  analysisLifecycleDrift.inputs.analysisPrestate = {
    ...analysisLifecycleDrift.inputs.analysisPrestate,
    updatedAt: "2026-08-03T08:10:45Z",
  };
  assert.throws(
    () =>
      validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
        analysisLifecycleDrift.artifact,
        analysisLifecycleDrift.inputs,
      ),
    /exact verified analysis lifecycle prestate/,
  );
});
