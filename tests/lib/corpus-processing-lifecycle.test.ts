import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import {
  CORPUS_AI_MODEL_VERSION_NOT_EXPOSED,
  CORPUS_AI_PROCESSING_STAGES,
  buildInitialCorpusLifecycle,
  deriveCorpusLifecyclePermissions,
  hashCorpusBaselineRow,
  hashCorpusLifecycleReceipt,
  hashCorpusLifecycleState,
  sealCorpusLifecycleReceipt,
  validateCorpusLifecycle,
  type CorpusLifecycleRecord,
  type CorpusNamedReviewer,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";

const HASHES = {
  metadata: `sha256:${"a".repeat(64)}`,
  content: `sha256:${"b".repeat(64)}`,
  text: `sha256:${"c".repeat(64)}`,
  triage: `sha256:${"d".repeat(64)}`,
  fullText: `sha256:${"e".repeat(64)}`,
  locator: `sha256:${"f".repeat(64)}`,
  claims: `sha256:${"1".repeat(64)}`,
  crossCheck: `sha256:${"2".repeat(64)}`,
  ready: `sha256:${"3".repeat(64)}`,
  ownerReceipt: `sha256:${"4".repeat(64)}`,
  independentReceipt: `sha256:${"5".repeat(64)}`,
  requirementReceipt: `sha256:${"6".repeat(64)}`,
  partnerRequirementReceipt: `sha256:${"a".repeat(64)}`,
  rightsHolderRequirementReceipt: `sha256:${"b".repeat(64)}`,
  partnerReceipt: `sha256:${"c".repeat(64)}`,
  rightsHolderReceipt: `sha256:${"d".repeat(64)}`,
  rightsReceipt: `sha256:${"7".repeat(64)}`,
  publicationReceipt: `sha256:${"8".repeat(64)}`,
  coverageReceipt: `sha256:${"9".repeat(64)}`,
  rightsEvidence: `sha256:${"0".repeat(64)}`,
} as const;

const REVIEWED_ARTIFACT_ID = "artifact.ready_for_owner.example";
const REVIEWED_ARTIFACT_VERSION = "1.0.0";

const schema = JSON.parse(
  readFileSync(
    "knowledge/schema/corpus-processing-lifecycle.schema.v1.json",
    "utf8",
  ),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

function reviewer(
  role: CorpusNamedReviewer["role"],
  reviewerId = role.replaceAll("_", "."),
): CorpusNamedReviewer {
  return {
    reviewerType: "named_human",
    reviewerId,
    name: `Named ${role.replaceAll("_", " ")}`,
    role,
    organization: "Food Systems review programme",
    authentication: {
      state: "verified",
      method: "controlled_project_identity",
      evidenceSha256: HASHES.rightsEvidence,
      authenticatedAt: "2026-08-02T11:59:00Z",
    },
  };
}

function sealReceipts(record: CorpusLifecycleRecord): CorpusLifecycleRecord {
  const receipts = [
    record.sourceRoleConfirmationStatus.receipt,
    record.ownerReviewStatus.receipt,
    record.independentValidationStatus.requirementReceipt,
    record.independentValidationStatus.receipt,
    record.partnerValidationStatus.requirementReceipt,
    record.partnerValidationStatus.receipt,
    record.rightsHolderValidationStatus.requirementReceipt,
    record.rightsHolderValidationStatus.receipt,
    record.rightsStatus.receipt,
    record.publicationStatus.independentGates.privacy.receipt,
    record.publicationStatus.independentGates.safety.receipt,
    record.publicationStatus.independentGates.legal.receipt,
    record.publicationStatus.approvalReceipt,
    record.coverageStatus.approvalReceipt,
  ];
  for (const receipt of receipts) {
    if (!receipt) continue;
    receipt.receiptSha256 = hashCorpusLifecycleReceipt(receipt);
  }
  return record;
}

function initialRecord(
  sourceRole: CorpusLifecycleRecord["sourceIdentity"]["sourceRole"] = "primary_evidence",
  geographyIds: string[] = [],
): CorpusLifecycleRecord {
  return buildInitialCorpusLifecycle({
    recordId: "corpus.record.example",
    sourceId: "source.example",
    title: "Example source",
    sourceRole,
    identityKind: "repository_path",
    canonicalIdentity: "research/library/example.pdf",
    metadataSha256: HASHES.metadata,
    observedAt: "2026-08-02T12:00:00Z",
    geographyIds,
    fileAvailable: true,
    fileLocator: "research/library/example.pdf",
    mediaType: "application/pdf",
    fileSizeBytes: 12_345,
  });
}

function readyForOwnerRecord(
  sourceRole: Exclude<
    CorpusLifecycleRecord["sourceIdentity"]["sourceRole"],
    "unknown"
  > = "primary_evidence",
  geographyIds: string[] = [],
): CorpusLifecycleRecord {
  const record = structuredClone(initialRecord(sourceRole, geographyIds));
  record.sourceIdentity.identityStatus = "verified";
  record.sourceIdentity.contentSha256 = HASHES.content;
  record.sourceIdentity.contentHashEvidenceState = "repository_file_verified";
  record.sourceIdentity.contentHashVerifiedAt = "2026-08-02T12:01:00Z";
  record.textAvailability = {
    state: "full_text",
    textSha256: HASHES.text,
    characterCount: 48_000,
    extractionMethod: "born_digital",
    observedAt: "2026-08-02T12:01:00Z",
  };

  const runInputs = [
    ["triage", HASHES.triage],
    ["full_text", HASHES.text],
    ["locator", HASHES.locator],
    ["claims", HASHES.claims],
    ["cross_check", HASHES.crossCheck],
    ["ready_for_owner", HASHES.ready],
  ] as const;
  record.aiAssistanceProvenance = {
    used: true,
    runs: runInputs.map(([stage, outputSha256], index) => ({
      runId: `ai.run.${stage}`,
      provider: "OpenAI",
      model: "research-model",
      modelVersionState: "exact",
      modelVersion: "2026-08-02",
      workflowRef: `workflow.corpus.${stage}.v1`,
      stages: [stage],
      inputSha256: index === 0 ? HASHES.content : runInputs[index - 1][1],
      outputSha256,
      checkpoints: [
        {
          stage,
          inputSha256: index === 0 ? HASHES.content : runInputs[index - 1][1],
          outputSha256,
          completedAt: `2026-08-02T12:0${index + 2}:00Z`,
        },
      ],
      timeEvidence: "provider_exact",
      timeEvidenceExplanation:
        "Provider response exposed exact start and completion timestamps for this run.",
      startedAt: `2026-08-02T12:0${index + 1}:00Z`,
      completedAt: `2026-08-02T12:0${index + 2}:00Z`,
    })),
  };
  record.aiProcessingStatus = {
    currentStage: "ready_for_owner",
    state: "complete",
    completedStages: [...CORPUS_AI_PROCESSING_STAGES],
    stageEvidence: [
      {
        stage: "inventory",
        method: "deterministic_inventory",
        runId: null,
        checkpointIndex: null,
        artifactId: "artifact.inventory.corpus.record.example",
        artifactVersion: "1.0.0",
        outputSha256: HASHES.metadata,
        completedAt: "2026-08-02T12:00:00Z",
      },
      ...record.aiAssistanceProvenance.runs.map((run) => ({
        stage: run.stages[0],
        method: "ai_assisted" as const,
        runId: run.runId,
        checkpointIndex: 0,
        artifactId: `artifact.${run.stages[0]}.example`,
        artifactVersion: REVIEWED_ARTIFACT_VERSION,
        outputSha256: run.outputSha256,
        completedAt: run.completedAt,
      })),
    ],
    updatedAt: "2026-08-02T12:07:00Z",
  };
  record.sourceRoleConfirmationStatus = {
    state: "owner_confirmed",
    receipt: {
      ...receiptScope(
        record,
        "artifact.source.role.classification.example",
        HASHES.triage,
      ),
      receiptId: "receipt.source.role.example.v1",
      receiptSha256: HASHES.requirementReceipt,
      reviewer: {
        reviewerType: "named_human",
        reviewerId: "person.gabriel_freeman",
        name: "Gabriel Freeman",
        role: "project_owner",
        organization: "Food Systems 2026",
        authentication: {
          state: "verified",
          method: "controlled_project_identity",
          evidenceSha256: HASHES.rightsEvidence,
          authenticatedAt: "2026-08-02T12:07:30Z",
        },
      },
      reviewedAt: "2026-08-02T12:08:00Z",
      decision: "confirmed_source_role",
      confirmedRole: sourceRole,
      classificationBasis:
        "Gabriel confirmed this role for the exact source and intended-use scope.",
    },
    updatedAt: "2026-08-02T12:08:00Z",
  };
  record.updatedAt = "2026-08-02T18:00:00Z";
  return validateCorpusLifecycle(sealReceipts(record));
}

function readyForOwnerSingleRunRecord(): CorpusLifecycleRecord {
  const record = structuredClone(readyForOwnerRecord());
  const priorRuns = record.aiAssistanceProvenance.runs;
  const observedAt = "2026-08-02T12:07:00Z";
  const stages = priorRuns.map((run) => run.stages[0]);
  const checkpoints = priorRuns.map((run) => ({
    stage: run.stages[0],
    inputSha256: run.inputSha256,
    outputSha256: run.outputSha256,
    completedAt: observedAt,
  }));
  record.aiAssistanceProvenance = {
    used: true,
    runs: [
      {
        runId: "ai.run.corpus.connected.processing",
        provider: "OpenAI",
        model: "research-model",
        modelVersionState: "runtime_not_exposed",
        modelVersion: CORPUS_AI_MODEL_VERSION_NOT_EXPOSED,
        workflowRef: "workflow.corpus.connected.processing.v1",
        stages,
        checkpoints,
        inputSha256: checkpoints[0].inputSha256,
        outputSha256: checkpoints.at(-1)!.outputSha256,
        timeEvidence: "coordinator_observed_window",
        timeEvidenceExplanation:
          "The coordinator observed one request window; provider stage timestamps were not exposed.",
        startedAt: "2026-08-02T12:01:00Z",
        completedAt: observedAt,
      },
    ],
  };
  for (const evidence of record.aiProcessingStatus.stageEvidence) {
    if (evidence.stage === "inventory") continue;
    const checkpointIndex = stages.indexOf(evidence.stage);
    evidence.runId = "ai.run.corpus.connected.processing";
    evidence.checkpointIndex = checkpointIndex;
    evidence.completedAt = checkpoints[checkpointIndex].completedAt;
  }
  record.aiProcessingStatus.updatedAt = observedAt;
  return validateCorpusLifecycle(sealReceipts(record));
}

function receiptScope(
  record: CorpusLifecycleRecord,
  artifactId: string,
  artifactSha256: string,
  limitations: string[] = [],
) {
  return {
    binding: {
      lifecycleRecordId: record.recordId,
      sourceId: record.sourceIdentity.sourceId,
      sourceMetadataSha256: record.sourceIdentity.metadataSha256,
      sourceContentSha256: record.sourceIdentity.contentSha256,
      artifactId,
      artifactVersion: "1.0.0",
      artifactSha256,
      geographyIds: [...record.scope.geographyIds],
      materialProfileIds: [...record.scope.materialProfileIds],
      intendedUseProfileIds: [...record.scope.intendedUseProfileIds],
    },
    limitations,
  };
}

function withOwnerApproval(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  next.ownerReviewStatus = {
    state: "approved_internal",
    receipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.owner.example.v1",
      receiptSha256: HASHES.ownerReceipt,
      reviewer: {
        reviewerType: "named_human",
        reviewerId: "person.gabriel_freeman",
        name: "Gabriel Freeman",
        role: "project_owner",
        organization: "Food Systems 2026",
        authentication: {
          state: "verified",
          method: "controlled_project_identity",
          evidenceSha256: HASHES.rightsEvidence,
          authenticatedAt: "2026-08-02T12:59:00Z",
        },
      },
      reviewedAt: "2026-08-02T13:00:00Z",
      decision: "approved_internal",
      aiAssistanceDisclosure: {
        used: true,
        runIds: next.aiAssistanceProvenance.runs.map((run) => run.runId),
        statement:
          "AI processed the source; Gabriel independently recorded the owner decision.",
      },
    },
    updatedAt: "2026-08-02T13:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withRequiredIndependentValidation(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  next.independentValidationStatus = {
    requirement: "required",
    requirementProfileId: "validation.profile.high.risk",
    requirementRationale:
      "This material profile requires independent subject-matter validation.",
    requirementReceipt: null,
    state: "validated",
    receipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.independent.example.v1",
      receiptSha256: HASHES.independentReceipt,
      reviewer: reviewer("independent_subject_matter_expert", "expert.one"),
      reviewedAt: "2026-08-02T14:00:00Z",
      decision: "validated",
      independenceStatement:
        "The reviewer is independent from production of this corpus record.",
      qualifications: [
        {
          qualificationId: "qualification.food.systems.expert.one",
          title: "Food systems subject-matter qualification",
          issuingBody: "Independent professional body",
          scopeStatement:
            "Qualification evidence covers the material and interpretation under review.",
          evidenceSha256: HASHES.rightsEvidence,
        },
      ],
      conflictOfInterest: "none_declared",
      conflictNote: null,
    },
    updatedAt: "2026-08-02T14:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withValidationNotRequired(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  const rationale =
    "The adopted low-risk profile does not require a separate expert validation event.";
  next.independentValidationStatus = {
    requirement: "not_required",
    requirementProfileId: "validation.profile.low.risk",
    requirementRationale: rationale,
    requirementReceipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.validation.scope.example.v1",
      receiptSha256: HASHES.requirementReceipt,
      reviewer: reviewer(
        "validation_scope_authority",
        "validation.scope.owner",
      ),
      reviewedAt: "2026-08-02T14:00:00Z",
      decision: "independent_validation_not_required",
      requirementProfileId: "validation.profile.low.risk",
      rationale,
    },
    state: "not_applicable",
    receipt: null,
    updatedAt: "2026-08-02T14:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withPartnerValidationNotRequired(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  const rationale =
    "The adopted material profile does not require validation by a delivery partner.";
  next.partnerValidationStatus = {
    requirement: "not_required",
    requirementProfileId: "validation.profile.partner.not.applicable",
    requirementRationale: rationale,
    requirementReceipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.partner.scope.example.v1",
      receiptSha256: HASHES.partnerRequirementReceipt,
      reviewer: reviewer(
        "validation_scope_authority",
        "validation.scope.owner",
      ),
      reviewedAt: "2026-08-02T14:10:00Z",
      decision: "partner_validation_not_required",
      requirementProfileId: "validation.profile.partner.not.applicable",
      rationale,
    },
    state: "not_applicable",
    receipt: null,
    updatedAt: "2026-08-02T14:10:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withRightsHolderValidationNotRequired(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  const rationale =
    "The scoped material has no affected rights-holder validation requirement.";
  next.rightsHolderValidationStatus = {
    requirement: "not_required",
    requirementProfileId: "validation.profile.rights.holder.not.applicable",
    requirementRationale: rationale,
    requirementReceipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.rights.holder.scope.example.v1",
      receiptSha256: HASHES.rightsHolderRequirementReceipt,
      reviewer: reviewer(
        "validation_scope_authority",
        "validation.scope.owner",
      ),
      reviewedAt: "2026-08-02T14:20:00Z",
      decision: "rights_holder_validation_not_required",
      requirementProfileId: "validation.profile.rights.holder.not.applicable",
      rationale,
    },
    state: "not_applicable",
    receipt: null,
    updatedAt: "2026-08-02T14:20:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withConditionalValidationsNotRequired(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  return withRightsHolderValidationNotRequired(
    withPartnerValidationNotRequired(withValidationNotRequired(record)),
  );
}

function withPartnerValidation(
  record: CorpusLifecycleRecord,
  reviewerId = "partner.representative",
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  next.partnerValidationStatus = {
    requirement: "required",
    requirementProfileId: "validation.profile.partner.required",
    requirementRationale:
      "This use profile requires validation by the named delivery partner.",
    requirementReceipt: null,
    state: "validated",
    receipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.partner.validation.example.v1",
      receiptSha256: HASHES.partnerReceipt,
      reviewer: reviewer("partner_representative", reviewerId),
      reviewedAt: "2026-08-02T14:10:00Z",
      decision: "validated",
      partnerId: "partner.example",
      scopeStatement:
        "Validation covers the declared material and intended use profiles.",
      authorityStatement:
        "The reviewer is authorized to represent the named project partner.",
    },
    updatedAt: "2026-08-02T14:10:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withRightsHolderValidation(
  record: CorpusLifecycleRecord,
  reviewerId = "rights.holder.representative",
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  next.rightsHolderValidationStatus = {
    requirement: "required",
    requirementProfileId: "validation.profile.rights.holder.required",
    requirementRationale:
      "The geography and use profile require rights-holder-led validation.",
    requirementReceipt: null,
    state: "validated",
    receipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.rights.holder.validation.example.v1",
      receiptSha256: HASHES.rightsHolderReceipt,
      reviewer: reviewer("rights_holder_representative", reviewerId),
      reviewedAt: "2026-08-02T14:20:00Z",
      decision: "validated",
      rightsHolderId: "rights.holder.example",
      scopeStatement:
        "Validation covers the declared Sápmi geography and interpretation scope.",
      authority: {
        basis: "rights_holder_self_authority",
        statement:
          "The reviewer acts through recognized rights-holder self-authority.",
        mandateEvidenceSha256: null,
      },
      consentBasis:
        "Consent was recorded for this bounded internal and external use profile.",
      dataGovernanceBasis:
        "The rights holder approved the recorded data-governance boundaries.",
    },
    updatedAt: "2026-08-02T14:20:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withExternalRights(
  record: CorpusLifecycleRecord,
  decision:
    | "cleared_external_publication"
    | "public_domain" = "cleared_external_publication",
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  next.rightsStatus = {
    state: decision,
    receipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: `receipt.rights.${decision}.v1`,
      receiptSha256: HASHES.rightsReceipt,
      reviewer: reviewer("rights_reviewer", "rights.reviewer"),
      reviewedAt: "2026-08-02T15:00:00Z",
      decision,
      authority: {
        basis:
          decision === "public_domain"
            ? "public_domain_determination"
            : "license",
        name:
          decision === "public_domain"
            ? "Public-domain determination"
            : "CC BY 4.0",
        locator: "https://example.org/rights-evidence",
        jurisdiction: "NO",
        evidenceSha256: HASHES.rightsEvidence,
      },
    },
    updatedAt: "2026-08-02T15:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withPublicationIndependentGatesNotRequired(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  const configurations = [
    [
      "privacy",
      "privacy.profile.not.required",
      "receipt.publication.gate.privacy.v1",
      "2026-08-02T15:10:00Z",
    ],
    [
      "safety",
      "safety.profile.not.required",
      "receipt.publication.gate.safety.v1",
      "2026-08-02T15:20:00Z",
    ],
    [
      "legal",
      "legal.profile.not.required",
      "receipt.publication.gate.legal.v1",
      "2026-08-02T15:30:00Z",
    ],
  ] as const;
  for (const [gateId, profileId, receiptId, reviewedAt] of configurations) {
    const rationale = `The adopted ${gateId} profile records that no separate ${gateId} approval is required.`;
    next.publicationStatus.independentGates[gateId] = {
      requirement: "not_required",
      requirementProfileId: profileId,
      requirementRationale: rationale,
      state: "not_applicable",
      receipt: {
        ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
        receiptId,
        receiptSha256: HASHES.requirementReceipt,
        reviewer: reviewer(
          "validation_scope_authority",
          `${gateId}.scope.authority`,
        ),
        reviewedAt,
        gateId,
        decision: "not_required",
        requirementProfileId: profileId,
        rationale,
      },
      updatedAt: reviewedAt,
    };
  }
  next.publicationStatus.updatedAt = "2026-08-02T15:30:00Z";
  return validateCorpusLifecycle(sealReceipts(next));
}

function applicableCoverageReviewReceiptIds(
  record: CorpusLifecycleRecord,
): string[] {
  return [
    record.sourceRoleConfirmationStatus.receipt?.receiptId,
    record.ownerReviewStatus.receipt?.receiptId,
    record.independentValidationStatus.requirementReceipt?.receiptId,
    record.independentValidationStatus.receipt?.receiptId,
    record.partnerValidationStatus.requirementReceipt?.receiptId,
    record.partnerValidationStatus.receipt?.receiptId,
    record.rightsHolderValidationStatus.requirementReceipt?.receiptId,
    record.rightsHolderValidationStatus.receipt?.receiptId,
    record.rightsStatus.receipt?.receiptId,
  ].filter((receiptId): receiptId is string => receiptId !== undefined);
}

function withPublicationApproval(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(
    withPublicationIndependentGatesNotRequired(record),
  );
  next.publicationStatus = {
    state: "publishable",
    externalUseAllowed: true,
    independentGates: next.publicationStatus.independentGates,
    approvalReceipt: {
      ...receiptScope(next, REVIEWED_ARTIFACT_ID, HASHES.ready),
      receiptId: "receipt.publication.example.v1",
      receiptSha256: HASHES.publicationReceipt,
      reviewer: reviewer("publication_authority", "publication.authority"),
      reviewedAt: "2026-08-02T16:00:00Z",
      decision: "approved_for_external_publication",
      audience: "public_research_audience",
      channel: "food_systems_knowledge_platform",
    },
    publicLocator: null,
    publishedAt: null,
    updatedAt: "2026-08-02T16:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

function withCoverageApproval(
  record: CorpusLifecycleRecord,
): CorpusLifecycleRecord {
  const next = structuredClone(record);
  const coverageCellIds = ["coverage.cell.no.food.waste"];
  next.coverageStatus = {
    state: "approved_for_promotion",
    coveragePromotionAllowed: true,
    approvalReceipt: {
      ...receiptScope(
        next,
        "coverage.assessment.example.v1",
        HASHES.coverageReceipt,
      ),
      receiptId: "receipt.coverage.example.v1",
      receiptSha256: HASHES.coverageReceipt,
      assessor: {
        assessorType: "named_human",
        assessorId: "coverage.steward",
        name: "Named coverage steward",
        role: "coverage_steward",
        organization: "Food Systems review programme",
        authentication: {
          state: "verified",
          method: "controlled_project_identity",
          evidenceSha256: HASHES.rightsEvidence,
          authenticatedAt: "2026-08-02T16:59:00Z",
        },
      },
      assessorAuthorization: {
        readinessProfileId: "coverage.profile.canonical.required",
        assessorType: "named_human",
        assessorId: "coverage.steward",
        authorizationSha256: HASHES.rightsEvidence,
      },
      reviewedAt: "2026-08-02T17:00:00Z",
      decision: "approved_for_coverage_promotion",
      coverageCellIds,
      readinessProfileId: "coverage.profile.canonical.required",
      evidenceSnapshotSha256: HASHES.ready,
      assessmentId: "coverage.assessment.example.v1",
      assessmentVersion: REVIEWED_ARTIFACT_VERSION,
      assessmentSha256: HASHES.coverageReceipt,
      applicableReviewReceiptIds: applicableCoverageReviewReceiptIds(next),
    },
    coverageCellIds,
    promotedAt: null,
    updatedAt: "2026-08-02T17:00:00Z",
  };
  return validateCorpusLifecycle(sealReceipts(next));
}

test("builds an inventory-only initial record without inferred review or promotion", () => {
  const record = initialRecord();
  assert.equal(
    validateSchema(record),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.deepEqual(record.aiProcessingStatus.completedStages, ["inventory"]);
  assert.equal(record.textAvailability.state, "unavailable");
  assert.equal(
    record.sourceRoleConfirmationStatus.state,
    "machine_provisional",
  );
  assert.equal(record.sourceRoleConfirmationStatus.receipt, null);
  assert.equal(record.ownerReviewStatus.state, "not_requested");
  assert.equal(record.independentValidationStatus.requirement, "undetermined");
  assert.equal(record.independentValidationStatus.state, "not_requested");
  assert.equal(record.partnerValidationStatus.requirement, "undetermined");
  assert.equal(record.rightsHolderValidationStatus.requirement, "undetermined");
  assert.equal(record.rightsStatus.state, "unknown");
  assert.equal(record.publicationStatus.externalUseAllowed, false);
  assert.equal(record.coverageStatus.coveragePromotionAllowed, false);
  const permissions = deriveCorpusLifecyclePermissions(record);
  assert.equal(permissions.aiReadyForOwnerReview, false);
  assert.equal(permissions.sourceRoleOwnerConfirmed, false);
  assert.equal(permissions.externalUseAllowed, false);
  assert.equal(permissions.coveragePromotionAllowed, false);
});

test("rejects unexpected properties and unsupported availability claims in schema and runtime", () => {
  const unexpected = { ...initialRecord(), inventedReview: true };
  assert.equal(validateSchema(unexpected), false);
  assert.throws(
    () => validateCorpusLifecycle(unexpected),
    /Unrecognized key: "inventedReview"/,
  );
  assert.throws(
    () =>
      buildInitialCorpusLifecycle({
        recordId: "corpus.record.missing.locator",
        sourceId: "source.missing.locator",
        title: "Missing locator",
        sourceRole: "primary_evidence",
        identityKind: "repository_path",
        canonicalIdentity: "missing.pdf",
        metadataSha256: HASHES.metadata,
        observedAt: "2026-08-02T12:00:00Z",
        fileAvailable: true,
      }),
    /requires fileLocator/,
  );
});

test("requires a complete ordered AI evidence chain before ready-for-owner", () => {
  const record = readyForOwnerRecord();
  assert.equal(
    validateSchema(record),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(record).aiReadyForOwnerReview,
    true,
  );
  assert.equal(record.aiAssistanceProvenance.runs.length, 6);
  assert.ok(
    record.aiAssistanceProvenance.runs.every(
      (run) => run.checkpoints.length === 1,
    ),
  );

  const skipped = structuredClone(record);
  skipped.aiProcessingStatus.completedStages.splice(5, 1);
  skipped.aiProcessingStatus.stageEvidence.splice(5, 1);
  assert.throws(
    () => validateCorpusLifecycle(skipped),
    /exact contiguous prefix/,
  );

  const missingRun = structuredClone(record);
  missingRun.aiAssistanceProvenance.runs.pop();
  assert.throws(() => validateCorpusLifecycle(missingRun), /exactly partition/);

  const unrelatedInput = structuredClone(record);
  unrelatedInput.aiAssistanceProvenance.runs[2]!.inputSha256 =
    HASHES.ownerReceipt;
  unrelatedInput.aiAssistanceProvenance.runs[2]!.checkpoints[0]!.inputSha256 =
    HASHES.ownerReceipt;
  assert.throws(
    () => validateCorpusLifecycle(unrelatedInput),
    /checkpoint input must bind the source or previous stage output hash/,
  );

  const unrelatedFullText = structuredClone(record);
  unrelatedFullText.textAvailability.textSha256 = HASHES.fullText;
  assert.throws(
    () => validateCorpusLifecycle(unrelatedFullText),
    /full-text stage output must bind the exact extracted-text hash/,
  );

  const metadataOnly = structuredClone(record);
  metadataOnly.textAvailability = {
    state: "metadata_only",
    textSha256: null,
    characterCount: null,
    extractionMethod: null,
    observedAt: "2026-08-02T12:01:00Z",
  };
  assert.throws(
    () => validateCorpusLifecycle(metadataOnly),
    /full-text stage (?:cannot complete|output must bind)/,
  );
});

test("records one real AI run across multiple connected stages with exact checkpoints", () => {
  const record = readyForOwnerSingleRunRecord();
  assert.equal(
    validateSchema(record),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(record.aiAssistanceProvenance.runs.length, 1);
  const run = record.aiAssistanceProvenance.runs[0];
  assert.deepEqual(run.stages, [
    "triage",
    "full_text",
    "locator",
    "claims",
    "cross_check",
    "ready_for_owner",
  ]);
  assert.deepEqual(
    run.checkpoints.map((checkpoint) => checkpoint.stage),
    run.stages,
  );
  assert.equal(run.checkpoints[0].inputSha256, HASHES.content);
  assert.equal(run.checkpoints.at(-1)!.outputSha256, HASHES.ready);
  assert.equal(run.modelVersionState, "runtime_not_exposed");
  assert.equal(run.modelVersion, CORPUS_AI_MODEL_VERSION_NOT_EXPOSED);
  assert.equal(run.timeEvidence, "coordinator_observed_window");
  assert.ok(
    run.timeEvidenceExplanation.includes(
      "provider stage timestamps were not exposed",
    ),
  );
  assert.ok(
    run.checkpoints.every(
      (checkpoint) => checkpoint.completedAt === run.completedAt,
    ),
  );
  assert.deepEqual(
    record.aiProcessingStatus.stageEvidence
      .filter((evidence) => evidence.runId !== null)
      .map((evidence) => evidence.checkpointIndex),
    [0, 1, 2, 3, 4, 5],
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(record).aiReadyForOwnerReview,
    true,
  );

  const ownerApproved = withOwnerApproval(record);
  assert.deepEqual(
    ownerApproved.ownerReviewStatus.receipt!.aiAssistanceDisclosure.runIds,
    ["ai.run.corpus.connected.processing"],
  );
});

test("rejects checkpoint ordering, internal chain, endpoint, and stage-evidence drift", () => {
  const wrongCheckpointOrder = structuredClone(readyForOwnerSingleRunRecord());
  const orderedRun = wrongCheckpointOrder.aiAssistanceProvenance.runs[0];
  const secondCheckpoint = orderedRun.checkpoints[1];
  orderedRun.checkpoints[1] = orderedRun.checkpoints[2];
  orderedRun.checkpoints[2] = secondCheckpoint;
  assert.equal(
    validateSchema(wrongCheckpointOrder),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.throws(
    () => validateCorpusLifecycle(wrongCheckpointOrder),
    /stages must exactly match its ordered checkpoints/,
  );

  const internalChainBreak = structuredClone(readyForOwnerSingleRunRecord());
  internalChainBreak.aiAssistanceProvenance.runs[0].checkpoints[2].inputSha256 =
    HASHES.ownerReceipt;
  assert.throws(
    () => validateCorpusLifecycle(internalChainBreak),
    /breaks the internal hash chain/,
  );

  const endpointDrift = structuredClone(readyForOwnerSingleRunRecord());
  endpointDrift.aiAssistanceProvenance.runs[0].outputSha256 =
    HASHES.ownerReceipt;
  assert.throws(
    () => validateCorpusLifecycle(endpointDrift),
    /input and output hashes must bind its first and last checkpoints/,
  );

  const wrongCheckpointReference = structuredClone(
    readyForOwnerSingleRunRecord(),
  );
  wrongCheckpointReference.aiProcessingStatus.stageEvidence[2].checkpointIndex = 2;
  assert.throws(
    () => validateCorpusLifecycle(wrongCheckpointReference),
    /does not bind its exact AI run checkpoint/,
  );

  const nonContiguousRun = structuredClone(readyForOwnerSingleRunRecord());
  nonContiguousRun.aiAssistanceProvenance.runs[0].stages.splice(1, 1);
  nonContiguousRun.aiAssistanceProvenance.runs[0].checkpoints.splice(1, 1);
  assert.throws(
    () => validateCorpusLifecycle(nonContiguousRun),
    /contiguous non-inventory stage range/,
  );
});

test("records model-version and time evidence without inventing unavailable runtime facts", () => {
  const runtimeNotExposed = readyForOwnerSingleRunRecord();
  assert.equal(
    validateSchema(runtimeNotExposed),
    true,
    JSON.stringify(validateSchema.errors),
  );

  const falseExactVersion = structuredClone(runtimeNotExposed);
  falseExactVersion.aiAssistanceProvenance.runs[0].modelVersionState = "exact";
  assert.equal(validateSchema(falseExactVersion), false);
  assert.throws(
    () => validateCorpusLifecycle(falseExactVersion),
    /exact model version state cannot use runtime_not_exposed sentinel/,
  );

  const falseRuntimeSentinel = structuredClone(runtimeNotExposed);
  falseRuntimeSentinel.aiAssistanceProvenance.runs[0].modelVersion =
    "2026-08-02";
  assert.equal(validateSchema(falseRuntimeSentinel), false);
  assert.throws(
    () => validateCorpusLifecycle(falseRuntimeSentinel),
    /runtime_not_exposed model version state requires runtime_not_exposed sentinel/,
  );

  const unexplainedTime = structuredClone(runtimeNotExposed);
  unexplainedTime.aiAssistanceProvenance.runs[0].timeEvidenceExplanation =
    "not exposed";
  assert.equal(validateSchema(unexplainedTime), false);
  assert.throws(() => validateCorpusLifecycle(unexplainedTime), /Too small/);

  const outsideObservedWindow = structuredClone(runtimeNotExposed);
  outsideObservedWindow.aiAssistanceProvenance.runs[0].checkpoints[0].completedAt =
    "2026-08-02T12:00:59Z";
  assert.throws(
    () => validateCorpusLifecycle(outsideObservedWindow),
    /checkpoint times must be ordered inside the declared run window/,
  );
});

test("blocks owner readiness until Gabriel confirms the machine-provisional source role", () => {
  const provisional = structuredClone(readyForOwnerRecord());
  provisional.sourceRoleConfirmationStatus = {
    state: "machine_provisional",
    receipt: null,
    updatedAt: "2026-08-02T12:08:00Z",
  };
  assert.equal(validateSchema(provisional), false);
  assert.equal(
    deriveCorpusLifecyclePermissions(provisional).sourceRoleOwnerConfirmed,
    false,
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(provisional).aiReadyForOwnerReview,
    false,
  );
  assert.throws(
    () => validateCorpusLifecycle(provisional),
    /ready-for-owner status requires verified source identity, owner-confirmed role/,
  );

  const wrongRole = structuredClone(readyForOwnerRecord());
  wrongRole.sourceRoleConfirmationStatus.receipt!.confirmedRole =
    "internal_synthesis";
  assert.throws(
    () => validateCorpusLifecycle(wrongRole),
    /source-role confirmation must bind Gabriel and the exact non-unknown role/,
  );
});

test("never treats AI readiness or owner approval as external or coverage approval", () => {
  const aiOnly = readyForOwnerRecord();
  assert.equal(
    deriveCorpusLifecyclePermissions(aiOnly).externalUseAllowed,
    false,
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(aiOnly).coveragePromotionAllowed,
    false,
  );

  const ownerApproved = withOwnerApproval(aiOnly);
  assert.equal(
    deriveCorpusLifecyclePermissions(ownerApproved).ownerApprovedForInternalUse,
    true,
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(ownerApproved).externalUseAllowed,
    false,
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(ownerApproved).coveragePromotionAllowed,
    false,
  );

  const missingReceipt = structuredClone(aiOnly);
  missingReceipt.ownerReviewStatus.state = "approved_internal";
  assert.equal(validateSchema(missingReceipt), false);
  assert.throws(() => validateCorpusLifecycle(missingReceipt), /named receipt/);

  const automationReceipt = structuredClone(ownerApproved);
  automationReceipt.ownerReviewStatus.receipt!.reviewer.role =
    "publication_authority";
  assert.throws(
    () => validateCorpusLifecycle(automationReceipt),
    /project_owner/,
  );
});

test("models independent validation as an explicit profile decision, including receipted not-required scope", () => {
  const ownerApproved = withOwnerApproval(readyForOwnerRecord());
  const required = withRequiredIndependentValidation(ownerApproved);
  const requiredPermissions = deriveCorpusLifecyclePermissions(required);
  assert.equal(requiredPermissions.independentlyValidated, true);
  assert.equal(
    requiredPermissions.independentValidationRequirementSatisfied,
    true,
  );

  const notRequired = withValidationNotRequired(ownerApproved);
  const notRequiredPermissions = deriveCorpusLifecyclePermissions(notRequired);
  assert.equal(notRequiredPermissions.independentlyValidated, false);
  assert.equal(
    notRequiredPermissions.independentValidationRequirementSatisfied,
    true,
  );
  assert.equal(
    notRequiredPermissions.blockers.includes("independent_validation_missing"),
    false,
  );
  assert.equal(
    notRequiredPermissions.blockers.includes(
      "independent_validation_requirement_unresolved",
    ),
    false,
  );
  assert.equal(
    validateSchema(notRequired),
    true,
    JSON.stringify(validateSchema.errors),
  );

  const unreceiptedWaiver = structuredClone(notRequired);
  unreceiptedWaiver.independentValidationStatus.requirementReceipt = null;
  assert.equal(validateSchema(unreceiptedWaiver), false);
  assert.throws(
    () => validateCorpusLifecycle(unreceiptedWaiver),
    /named scope receipt/,
  );
});

test("models partner and rights-holder validation as separate conditional axes", () => {
  const ownerApproved = withOwnerApproval(readyForOwnerRecord());
  const allNotRequired = withConditionalValidationsNotRequired(ownerApproved);
  const permissions = deriveCorpusLifecyclePermissions(allNotRequired);
  assert.equal(permissions.partnerValidated, false);
  assert.equal(permissions.partnerValidationRequirementSatisfied, true);
  assert.equal(permissions.rightsHolderValidated, false);
  assert.equal(permissions.rightsHolderValidationRequirementSatisfied, true);
  assert.equal(
    validateSchema(allNotRequired),
    true,
    JSON.stringify(validateSchema.errors),
  );

  const sameRepresentative = withRightsHolderValidation(
    withPartnerValidation(
      withValidationNotRequired(ownerApproved),
      "dual.representative",
    ),
    "dual.representative",
  );
  assert.equal(
    validateSchema(sameRepresentative),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(sameRepresentative).partnerValidated,
    true,
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(sameRepresentative).rightsHolderValidated,
    true,
  );

  const reusedReceipt = structuredClone(sameRepresentative);
  reusedReceipt.rightsHolderValidationStatus.receipt!.receiptId =
    reusedReceipt.partnerValidationStatus.receipt!.receiptId;
  assert.throws(
    () => validateCorpusLifecycle(reusedReceipt),
    /cross-layer receipt IDs must be unique/,
  );
});

test("requires explicit limitations for conditional validation and restricted-rights decisions", () => {
  const ownerApproved = withOwnerApproval(readyForOwnerRecord());

  const independent = withRequiredIndependentValidation(ownerApproved);
  independent.independentValidationStatus.state = "validated_with_conditions";
  independent.independentValidationStatus.receipt!.decision =
    "validated_with_conditions";
  assert.equal(validateSchema(independent), false);
  assert.throws(
    () => validateCorpusLifecycle(independent),
    /independent validated-with-conditions receipt must record its limitations/,
  );
  independent.independentValidationStatus.receipt!.limitations = [
    "Use only with the uncertainty note attached to the reviewed artifact.",
  ];
  assert.equal(
    validateSchema(independent),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.doesNotThrow(() => validateCorpusLifecycle(sealReceipts(independent)));

  const partner = withPartnerValidation(
    withValidationNotRequired(ownerApproved),
  );
  partner.partnerValidationStatus.state = "validated_with_conditions";
  partner.partnerValidationStatus.receipt!.decision =
    "validated_with_conditions";
  assert.equal(validateSchema(partner), false);
  assert.throws(
    () => validateCorpusLifecycle(partner),
    /partner validation validated-with-conditions receipt must record its limitations/,
  );
  partner.partnerValidationStatus.receipt!.limitations = [
    "Partner validation applies only to the declared delivery context.",
  ];
  assert.equal(
    validateSchema(partner),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.doesNotThrow(() => validateCorpusLifecycle(sealReceipts(partner)));

  const rightsHolder = withRightsHolderValidation(
    withPartnerValidationNotRequired(withValidationNotRequired(ownerApproved)),
  );
  rightsHolder.rightsHolderValidationStatus.state = "validated_with_conditions";
  rightsHolder.rightsHolderValidationStatus.receipt!.decision =
    "validated_with_conditions";
  assert.equal(validateSchema(rightsHolder), false);
  assert.throws(
    () => validateCorpusLifecycle(rightsHolder),
    /rights-holder validation validated-with-conditions receipt must record its limitations/,
  );
  rightsHolder.rightsHolderValidationStatus.receipt!.limitations = [
    "Consent is limited to the named audience and intended-use profile.",
  ];
  assert.equal(
    validateSchema(rightsHolder),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.doesNotThrow(() =>
    validateCorpusLifecycle(sealReceipts(rightsHolder)),
  );

  const restricted = withExternalRights(
    withConditionalValidationsNotRequired(ownerApproved),
  );
  restricted.rightsStatus.state = "restricted";
  restricted.rightsStatus.receipt!.decision = "restricted";
  restricted.rightsStatus.receipt!.authority.basis = "restriction_notice";
  assert.equal(validateSchema(restricted), false);
  assert.throws(
    () => validateCorpusLifecycle(restricted),
    /restricted rights receipt must record its limitations/,
  );
  restricted.rightsStatus.receipt!.limitations = [
    "No external publication or coverage promotion is permitted.",
  ];
  assert.equal(
    validateSchema(restricted),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.doesNotThrow(() => validateCorpusLifecycle(sealReceipts(restricted)));
});

test("binds every receipt to exact source, scope, artifact, and AI-assistance provenance", () => {
  const ownerApproved = withOwnerApproval(readyForOwnerRecord());

  const wrongSourceHash = structuredClone(ownerApproved);
  wrongSourceHash.ownerReviewStatus.receipt!.binding.sourceContentSha256 =
    HASHES.text;
  assert.throws(
    () => validateCorpusLifecycle(wrongSourceHash),
    /does not bind the exact lifecycle record and source hashes/,
  );

  const wrongScope = structuredClone(ownerApproved);
  wrongScope.ownerReviewStatus.receipt!.binding.geographyIds = ["geo.no"];
  assert.throws(
    () => validateCorpusLifecycle(wrongScope),
    /does not bind the exact geographyIds/,
  );

  const wrongAiDisclosure = structuredClone(ownerApproved);
  wrongAiDisclosure.ownerReviewStatus.receipt!.aiAssistanceDisclosure.runIds.pop();
  assert.throws(
    () => validateCorpusLifecycle(wrongAiDisclosure),
    /AI-assistance disclosure must bind the exact recorded AI runs/,
  );

  const wrongOwnerArtifactVersion = structuredClone(ownerApproved);
  wrongOwnerArtifactVersion.ownerReviewStatus.receipt!.binding.artifactVersion =
    "2.0.0";
  assert.throws(
    () => validateCorpusLifecycle(wrongOwnerArtifactVersion),
    /must bind the exact ready-for-owner artifact ID, version and hash/,
  );

  const independentlyValidated =
    withRequiredIndependentValidation(ownerApproved);
  const missingQualification = structuredClone(independentlyValidated);
  missingQualification.independentValidationStatus.receipt!.qualifications = [];
  assert.equal(validateSchema(missingQualification), false);
  assert.throws(
    () => validateCorpusLifecycle(missingQualification),
    /Too small/,
  );
});

test("requires publication and coverage receipts to name their exact decision context", () => {
  const reviewed = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
  );
  const publication = withPublicationApproval(reviewed);
  publication.publicationStatus.approvalReceipt!.audience = "";
  assert.equal(validateSchema(publication), false);
  assert.throws(() => validateCorpusLifecycle(publication), /Too small/);

  const coverage = withCoverageApproval(reviewed);
  coverage.coverageStatus.approvalReceipt!.readinessProfileId = "";
  assert.equal(validateSchema(coverage), false);
  assert.throws(() => validateCorpusLifecycle(coverage), /Invalid string/);

  const publicationArtifactDrift = withPublicationApproval(reviewed);
  publicationArtifactDrift.publicationStatus.approvalReceipt!.binding.artifactId =
    "artifact.different.release";
  assert.throws(
    () => validateCorpusLifecycle(publicationArtifactDrift),
    /publication receipt must bind the exact ready-for-owner artifact/,
  );

  const coverageSnapshotDrift = withCoverageApproval(reviewed);
  coverageSnapshotDrift.coverageStatus.approvalReceipt!.evidenceSnapshotSha256 =
    HASHES.content;
  assert.throws(
    () => validateCorpusLifecycle(coverageSnapshotDrift),
    /coverage evidence snapshot must bind the exact owner-reviewed artifact hash/,
  );

  const coverageReviewDrift = withCoverageApproval(reviewed);
  coverageReviewDrift.coverageStatus.approvalReceipt!.applicableReviewReceiptIds.pop();
  assert.throws(
    () => validateCorpusLifecycle(coverageReviewDrift),
    /coverage receipt must bind the exact applicable review receipt IDs/,
  );
});

test("requires privacy, safety and legal gates before external publication", () => {
  const reviewed = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
  );
  const publishable = withPublicationApproval(reviewed);
  assert.equal(
    deriveCorpusLifecyclePermissions(publishable)
      .publicationIndependentGatesSatisfied,
    true,
  );

  const unresolvedPrivacy = structuredClone(publishable);
  unresolvedPrivacy.publicationStatus.independentGates.privacy = {
    requirement: "undetermined",
    requirementProfileId: null,
    requirementRationale: null,
    state: "not_requested",
    receipt: null,
    updatedAt: "2026-08-02T15:10:00Z",
  };
  assert.equal(validateSchema(unresolvedPrivacy), false);
  assert.equal(
    deriveCorpusLifecyclePermissions(unresolvedPrivacy)
      .publicationIndependentGatesSatisfied,
    false,
  );
  assert.throws(
    () => validateCorpusLifecycle(unresolvedPrivacy),
    /external-use flag must exactly match/,
  );

  const wrongGateAuthority = structuredClone(publishable);
  wrongGateAuthority.publicationStatus.independentGates.privacy.receipt!.reviewer.role =
    "privacy_reviewer";
  assert.throws(
    () => validateCorpusLifecycle(wrongGateAuthority),
    /privacy publication-gate receipt must bind a named reviewer with role validation_scope_authority/,
  );
});

test("allows a readiness-profile-authorized machine coverage assessor without auto-promotion", () => {
  const reviewed = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
  );
  const machineAssessed = withCoverageApproval(reviewed);
  const receipt = machineAssessed.coverageStatus.approvalReceipt!;
  receipt.assessor = {
    assessorType: "machine_assessor",
    assessorId: "assessor.coverage.deterministic.v1",
    executionMode: "deterministic",
    workflowRef: "workflow.coverage.readiness.assessment",
    workflowVersion: "1.0.0",
    outputSha256: receipt.assessmentSha256,
  };
  receipt.assessorAuthorization = {
    readinessProfileId: receipt.readinessProfileId,
    assessorType: "machine_assessor",
    assessorId: "assessor.coverage.deterministic.v1",
    authorizationSha256: HASHES.rightsEvidence,
  };
  assert.equal(
    validateSchema(machineAssessed),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.doesNotThrow(() =>
    validateCorpusLifecycle(sealReceipts(machineAssessed)),
  );

  const wrongProfileAuthorization = structuredClone(machineAssessed);
  wrongProfileAuthorization.coverageStatus.approvalReceipt!.assessorAuthorization.readinessProfileId =
    "coverage.profile.other";
  assert.throws(
    () => validateCorpusLifecycle(wrongProfileAuthorization),
    /authorization must bind the exact readiness profile and assessor/,
  );

  const wrongMachineOutput = structuredClone(machineAssessed);
  const machineAssessor =
    wrongMachineOutput.coverageStatus.approvalReceipt!.assessor;
  assert.equal(machineAssessor.assessorType, "machine_assessor");
  if (machineAssessor.assessorType === "machine_assessor") {
    machineAssessor.outputSha256 = HASHES.content;
  }
  assert.throws(
    () => validateCorpusLifecycle(wrongMachineOutput),
    /output hash must bind the exact coverage assessment/,
  );

  const missingWorkflowVersion = structuredClone(machineAssessed);
  const incompleteAssessor =
    missingWorkflowVersion.coverageStatus.approvalReceipt!.assessor;
  assert.equal(incompleteAssessor.assessorType, "machine_assessor");
  if (incompleteAssessor.assessorType === "machine_assessor")
    incompleteAssessor.workflowVersion = "";
  assert.equal(validateSchema(missingWorkflowVersion), false);
  assert.throws(
    () => validateCorpusLifecycle(missingWorkflowVersion),
    /Too small/,
  );
});

test("preserves the Sápmi rights-holder stopline without conflating it with rights clearance", () => {
  const sapmiSource = readyForOwnerRecord("primary_evidence", ["geo.sapmi"]);
  const scoped = withPartnerValidationNotRequired(
    withValidationNotRequired(withOwnerApproval(sapmiSource)),
  );

  assert.throws(
    () => withRightsHolderValidationNotRequired(scoped),
    /Sápmi scope cannot waive rights-holder validation/,
  );

  const rightsHolderValidated = withRightsHolderValidation(scoped);
  const permissions = deriveCorpusLifecyclePermissions(rightsHolderValidated);
  assert.equal(permissions.rightsHolderValidationRequirementSatisfied, true);
  assert.equal(permissions.rightsClearedForInternalUse, false);
  assert.equal(permissions.externalUseAllowed, false);
  assert.equal(rightsHolderValidated.rightsStatus.state, "unknown");

  const invalidWaiver = structuredClone(rightsHolderValidated);
  invalidWaiver.rightsHolderValidationStatus = structuredClone(
    withRightsHolderValidationNotRequired(
      withConditionalValidationsNotRequired(
        withOwnerApproval(readyForOwnerRecord()),
      ),
    ).rightsHolderValidationStatus,
  );
  assert.equal(validateSchema(invalidWaiver), false);
});

test("keeps publication and coverage as separately receipted events", () => {
  const reviewed = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
  );
  const publishable = withPublicationApproval(reviewed);
  assert.equal(
    validateSchema(publishable),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(publishable.publicationStatus.externalUseAllowed, true);
  assert.equal(publishable.coverageStatus.coveragePromotionAllowed, false);

  const coverageApproved = withCoverageApproval(reviewed);
  assert.equal(
    validateSchema(coverageApproved),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.equal(coverageApproved.coverageStatus.coveragePromotionAllowed, true);
  assert.equal(coverageApproved.publicationStatus.externalUseAllowed, false);

  const attemptedOwnerOnlyPublication = structuredClone(
    withOwnerApproval(readyForOwnerRecord()),
  );
  attemptedOwnerOnlyPublication.publicationStatus = structuredClone(
    publishable.publicationStatus,
  );
  assert.equal(validateSchema(attemptedOwnerOnlyPublication), false);
  assert.throws(
    () => validateCorpusLifecycle(attemptedOwnerOnlyPublication),
    /external-use flag must exactly match/,
  );
});

test("allows coverage promotion only for primary evidence and never from synthesis roles", () => {
  const primary = withCoverageApproval(
    withExternalRights(
      withRightsHolderValidationNotRequired(
        withPartnerValidationNotRequired(
          withRequiredIndependentValidation(
            withOwnerApproval(readyForOwnerRecord()),
          ),
        ),
      ),
    ),
  );
  assert.equal(
    deriveCorpusLifecyclePermissions(primary).coveragePromotionAllowed,
    true,
  );

  const synthesis = withExternalRights(
    withRightsHolderValidationNotRequired(
      withPartnerValidationNotRequired(
        withRequiredIndependentValidation(
          withOwnerApproval(readyForOwnerRecord("internal_synthesis")),
        ),
      ),
    ),
  );
  const attempted = structuredClone(synthesis);
  attempted.coverageStatus = structuredClone(primary.coverageStatus);
  assert.equal(validateSchema(attempted), false);
  assert.throws(
    () => validateCorpusLifecycle(attempted),
    /coverage-promotion flag must exactly match/,
  );
});

test("binds rights outcomes to decision-specific authority evidence", () => {
  const publicDomain = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
    "public_domain",
  );
  assert.equal(
    validateSchema(publicDomain),
    true,
    JSON.stringify(validateSchema.errors),
  );

  const falsePublicDomain = structuredClone(publicDomain);
  falsePublicDomain.rightsStatus.receipt!.authority.basis = "license";
  assert.equal(validateSchema(falsePublicDomain), false);
  assert.throws(
    () => validateCorpusLifecycle(falsePublicDomain),
    /rights authority basis is invalid for public_domain/,
  );

  const futureReceipt = structuredClone(publicDomain);
  futureReceipt.rightsStatus.receipt!.reviewedAt = "2026-08-03T15:00:00Z";
  assert.throws(
    () => validateCorpusLifecycle(futureReceipt),
    /newer than its status/,
  );
});

test("enforces stage, owner, publication and promotion chronology", () => {
  const stageTimeTravel = structuredClone(readyForOwnerRecord());
  const fullTextRun = stageTimeTravel.aiAssistanceProvenance.runs.find(
    (run) => run.runId === "ai.run.full_text",
  )!;
  const fullTextEvidence =
    stageTimeTravel.aiProcessingStatus.stageEvidence.find(
      (evidence) => evidence.stage === "full_text",
    )!;
  fullTextRun.startedAt = "2026-08-02T12:01:30Z";
  fullTextRun.completedAt = "2026-08-02T12:01:45Z";
  fullTextRun.checkpoints[0].completedAt = fullTextRun.completedAt;
  fullTextEvidence.completedAt = fullTextRun.completedAt;
  assert.throws(
    () => validateCorpusLifecycle(stageTimeTravel),
    /AI (?:stage evidence must be chronological|run cannot start before the previous stage completed|runs must be chronological and non-overlapping)/,
  );

  const prematureOwner = withOwnerApproval(readyForOwnerRecord());
  prematureOwner.ownerReviewStatus.receipt!.reviewedAt = "2026-08-02T12:06:00Z";
  assert.throws(
    () => validateCorpusLifecycle(prematureOwner),
    /owner review receipt cannot predate the ready-for-owner artifact/,
  );

  const reviewed = withExternalRights(
    withConditionalValidationsNotRequired(
      withOwnerApproval(readyForOwnerRecord()),
    ),
  );
  const published = withPublicationApproval(reviewed);
  published.publicationStatus.state = "published";
  published.publicationStatus.publicLocator =
    "https://example.org/published-artifact";
  published.publicationStatus.publishedAt = "2026-08-02T15:59:00Z";
  assert.equal(
    validateSchema(published),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.throws(
    () => validateCorpusLifecycle(published),
    /publishedAt cannot predate/,
  );

  const promoted = withCoverageApproval(reviewed);
  promoted.coverageStatus.state = "promoted";
  promoted.coverageStatus.promotedAt = "2026-08-02T16:59:00Z";
  assert.equal(
    validateSchema(promoted),
    true,
    JSON.stringify(validateSchema.errors),
  );
  assert.throws(
    () => validateCorpusLifecycle(promoted),
    /promotedAt cannot predate/,
  );
});

test("blocking issues fail closed even after every approval receipt exists", () => {
  const record = withPublicationApproval(
    withExternalRights(
      withRightsHolderValidationNotRequired(
        withPartnerValidationNotRequired(
          withRequiredIndependentValidation(
            withOwnerApproval(readyForOwnerRecord()),
          ),
        ),
      ),
    ),
  );
  const blocked = structuredClone(record);
  blocked.openIssues.push({
    issueId: "issue.boundary.unresolved",
    category: "boundary",
    severity: "blocking",
    summary: "The geographic boundary is unresolved.",
    openedAt: "2026-08-02T15:30:00Z",
    assignedTo: null,
    evidenceRefs: ["claim.example"],
  });
  assert.equal(validateSchema(blocked), false);
  assert.throws(
    () => validateCorpusLifecycle(blocked),
    /external-use flag must exactly match/,
  );
});

test("uses deterministic domain-separated hashes for baselines, lifecycle states and receipts", () => {
  const record = initialRecord();
  const firstLifecycleHash = hashCorpusLifecycleState(record);
  assert.equal(
    firstLifecycleHash,
    hashCorpusLifecycleState(structuredClone(record)),
  );
  assert.notEqual(
    firstLifecycleHash,
    hashCorpusBaselineRow(
      record as unknown as Parameters<typeof hashCorpusBaselineRow>[0],
    ),
  );

  const receiptBody = {
    receiptId: "receipt.example",
    reviewedAt: "2026-08-02T12:00:00Z",
    decision: "example",
  };
  const sealed = sealCorpusLifecycleReceipt(receiptBody);
  assert.equal(sealed.receiptSha256, hashCorpusLifecycleReceipt(sealed));
  assert.notEqual(sealed.receiptSha256, hashCorpusLifecycleState(record));
});

test("rejects receipt tampering and self-asserted human authority even with a fresh seal", () => {
  const tampered = structuredClone(readyForOwnerRecord());
  tampered.sourceRoleConfirmationStatus.receipt!.classificationBasis =
    "A changed classification statement that was not part of the signed canonical receipt.";
  assert.throws(
    () => validateCorpusLifecycle(tampered),
    /receiptSha256 does not seal its exact canonical receipt body/,
  );

  const unauthenticated = structuredClone(readyForOwnerRecord());
  unauthenticated.sourceRoleConfirmationStatus.receipt!.reviewer.authentication =
    {
      state: "self_asserted_unverified",
      method: "self_asserted",
      evidenceSha256: null,
      authenticatedAt: null,
    };
  sealReceipts(unauthenticated);
  assert.throws(
    () => validateCorpusLifecycle(unauthenticated),
    /reviewer identity is self-asserted and not authenticated/,
  );
});

test("keeps captured private hashes distinct from live private verification", () => {
  const captured = buildInitialCorpusLifecycle({
    recordId: "corpus.record.private",
    sourceId: "source.private",
    title: "Private recovery candidate",
    sourceRole: "unknown",
    identityKind: "database_record",
    canonicalIdentity: "document:private-candidate",
    metadataSha256: HASHES.metadata,
    contentSha256: HASHES.content,
    contentHashVerifiedAt: "2026-08-02T12:00:00Z",
    observedAt: "2026-08-02T12:00:00Z",
    fileAvailable: false,
  });
  assert.equal(
    captured.sourceIdentity.contentHashEvidenceState,
    "private_capture_attestation_recorded",
  );
  assert.notEqual(
    captured.sourceIdentity.contentHashEvidenceState,
    "private_live_verified",
  );
});
