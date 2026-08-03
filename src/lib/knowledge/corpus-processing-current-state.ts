import { createHash } from "node:crypto";

import { z } from "zod";

import {
  canonicalCorpusJson,
  corpusAiRunSchema,
  corpusSourceRoleConfirmationReceiptSchema,
  corpusStageEvidenceSchema,
  deriveCorpusLifecyclePermissions,
  hashCorpusBaselineRow,
  hashCorpusLifecycleState,
  type CorpusCanonicalJsonValue,
  type CorpusLifecyclePermissions,
  type CorpusLifecycleRecord,
  type CorpusNamedReviewer,
  validateCorpusLifecycle,
} from "./corpus-processing-lifecycle";
import {
  PdfQualificationReceiptSchema,
  verifySealedQualificationReceipt,
} from "./pdf-page-extraction-qualification";
import {
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH,
  SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION,
  SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256,
  SOURCE_ANALYSIS_WORKFLOW_ID,
  SOURCE_ANALYSIS_WORKFLOW_PATH,
  SOURCE_ANALYSIS_WORKFLOW_VERSION,
  validateSourceAnalysisArtifactAfterReplayVerifiedIdentity,
} from "./source-analysis-artifact";
import {
  sourceAnalysisNormalizedPagePrivateLocator,
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "./source-analysis-input-manifest";
import {
  SOURCE_IDENTITY_PROMPT_TEMPLATE_ID,
  SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH,
  SOURCE_IDENTITY_PROMPT_TEMPLATE_VERSION,
  SOURCE_IDENTITY_WORKFLOW_ID,
  SOURCE_IDENTITY_WORKFLOW_PATH,
  SOURCE_IDENTITY_WORKFLOW_VERSION,
  requireVerifiedSourceIdentityWithEvidenceBundle,
  sourceIdentityPageMapId,
  sourceIdentityVerificationArtifactPath,
  type SourceIdentityVerificationArtifact,
} from "./source-identity-verification";

export const CORPUS_CURRENT_STATE_SCHEMA_VERSION =
  "corpus-processing-current-state-v1" as const;
export const CORPUS_STATE_EVENT_SCHEMA_VERSION =
  "corpus-processing-state-event-v1" as const;
export const CORPUS_READY_PACKAGE_SCHEMA_VERSION =
  "corpus-ready-for-owner-package-v1" as const;

export const CORPUS_CURRENT_STATE_HASH_DOMAIN =
  "food-systems/corpus-current-state-row/v1\n" as const;
export const CORPUS_STATE_EVENT_HASH_DOMAIN =
  "food-systems/corpus-processing-state-event/v1\n" as const;
export const CORPUS_EXECUTION_HASH_DOMAIN =
  "food-systems/corpus-processing-shared-execution/v1\n" as const;
export const CORPUS_EXECUTION_MEMBERSHIP_HASH_DOMAIN =
  "food-systems/corpus-processing-execution-membership/v1\n" as const;
export const CORPUS_READY_PACKAGE_HASH_DOMAIN =
  "food-systems/corpus-ready-for-owner-package/v1\n" as const;

const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const versionSchema = z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/);
const dateTimeSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) && Number.isFinite(Date.parse(value)),
    "Expected an ISO 8601 date-time with an explicit UTC offset",
  );
const repositoryPathSchema = z
  .string()
  .min(1)
  .refine((value) => {
    if (
      value.startsWith("/") ||
      value.startsWith("~") ||
      value.includes("\\") ||
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) ||
      /[\u0000-\u001f\u007f]/.test(value)
    )
      return false;
    return value
      .split("/")
      .every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      );
  }, "Expected a portable repository-relative path");
const controlledPrivateLocatorSchema = z
  .string()
  .regex(
    /^private:\/\/(?:corpus|bigbrain-corpus)\/[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)*$/,
    "Expected a canonical controlled private locator",
  );

function domainHash(domain: string, value: CorpusCanonicalJsonValue): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value))
    .digest("hex")}`;
}

function prefixedSha256(value: string): string {
  return value.startsWith("sha256:") ? value : `sha256:${value}`;
}

function unprefixedSha256(value: string): string {
  return value.replace(/^sha256:/, "");
}

function exactJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function fail(message: string): never {
  throw new Error(`Corpus current-state projection failed: ${message}`);
}

export function sourceAnalysisVerifiedInputManifestPath(input: {
  rawPdfSha256: string;
  manifestSha256: string;
}): string {
  if (
    !/^[a-f0-9]{64}$/.test(input.rawPdfSha256) ||
    !/^[a-f0-9]{64}$/.test(input.manifestSha256)
  ) {
    fail("verified input-manifest path requires unprefixed SHA-256 values");
  }
  return (
    `knowledge/corpus/source-analysis-input-manifest-revisions/` +
    `${input.rawPdfSha256}/` +
    `${input.manifestSha256}.source-analysis-input-manifest.v1.json`
  );
}

export const corpusArtifactReferenceSchema = z
  .object({
    artifactType: z.enum([
      "pdf_technical_qualification",
      "pdf_page_map",
      "source_analysis_input_manifest",
      "source_acquisition_receipt",
      "source_identity_verification",
      "source_identity_workflow",
      "source_identity_prompt_template",
      "source_analysis_workflow",
      "source_analysis_prompt_template",
      "source_analysis",
      "ready_for_owner_package",
    ]),
    artifactId: identifierSchema,
    artifactVersion: versionSchema,
    path: repositoryPathSchema,
    fileSha256: sha256Schema,
    artifactSha256: sha256Schema,
  })
  .strict();

export type CorpusArtifactReference = z.infer<
  typeof corpusArtifactReferenceSchema
>;

export const corpusSourceContentReferenceSchema = z
  .object({
    artifactType: z.literal("source_content"),
    artifactId: identifierSchema,
    artifactVersion: versionSchema,
    locator: z
      .string()
      .min(1)
      .refine(
        (value) =>
          repositoryPathSchema.safeParse(value).success ||
          controlledPrivateLocatorSchema.safeParse(value).success,
        "Expected a repository path or controlled private locator",
      ),
    contentSha256: sha256Schema,
    sizeBytes: z.number().int().positive(),
  })
  .strict();

export type CorpusSourceContentReference = z.infer<
  typeof corpusSourceContentReferenceSchema
>;

const eventTargetSchema = z
  .object({
    recordId: identifierSchema,
    identityKey: z.string().min(1),
    baselineRowSha256: sha256Schema,
    preStateVersion: z.number().int().nonnegative(),
    preStateSha256: sha256Schema,
    preStateLifecycleSha256: sha256Schema,
  })
  .strict();

const eventCore = {
  schemaVersion: z.literal(CORPUS_STATE_EVENT_SCHEMA_VERSION),
  eventId: identifierSchema,
  globalSequence: z.number().int().positive(),
  previousGlobalEventSha256: sha256Schema.nullable(),
  identitySequence: z.number().int().positive(),
  previousIdentityEventSha256: sha256Schema.nullable(),
  target: eventTargetSchema,
  occurredAt: dateTimeSchema,
  eventSha256: sha256Schema,
};

const technicalTextExtractedEventSchema = z
  .object({
    ...eventCore,
    eventType: z.literal("technical_text_extracted"),
    payload: z
      .object({
        qualificationReceiptRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("pdf_technical_qualification"),
        }),
        inputManifestRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis_input_manifest"),
        }),
        textAvailability: z
          .object({
            state: z.enum(["full_text", "structured_content"]),
            textSha256: sha256Schema,
            characterCount: z.number().int().positive(),
            extractionMethod: z.enum(["born_digital", "ocr"]),
            observedAt: dateTimeSchema,
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

const identityVerifiedEventSchema = z
  .object({
    ...eventCore,
    eventType: z.literal("identity_verified"),
    payload: z
      .object({
        acquisitionReceiptRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_acquisition_receipt"),
        }),
        sourceContentRef: corpusSourceContentReferenceSchema,
        identityArtifactRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_identity_verification"),
        }),
        pageMapRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("pdf_page_map"),
        }),
        workflowRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_identity_workflow"),
        }),
        promptTemplateRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_identity_prompt_template"),
        }),
        verifiedInputManifestRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis_input_manifest"),
        }),
      })
      .strict(),
  })
  .strict();

const sourceAnalysisAppliedEventSchema = z
  .object({
    ...eventCore,
    eventType: z.literal("source_analysis_applied"),
    payload: z
      .object({
        analysisArtifactRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis"),
        }),
        identityArtifactRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_identity_verification"),
        }),
        inputManifestRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis_input_manifest"),
        }),
        analysisWorkflowRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis_workflow"),
        }),
        analysisPromptTemplateRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis_prompt_template"),
        }),
        executionBinding: z
          .object({
            processingUnitSha256: sha256Schema,
            executionSha256: sha256Schema,
            membershipIdentityKeys: z.array(z.string().min(1)).min(1),
            membershipSha256: sha256Schema,
            applicationMode: z.literal("single_identity_event"),
            automaticFanOutAllowed: z.literal(false),
          })
          .strict(),
        lifecycleRun: corpusAiRunSchema,
        stageEvidence: z.array(corpusStageEvidenceSchema).length(5),
      })
      .strict(),
  })
  .strict();

export const corpusReadyPackageSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_READY_PACKAGE_SCHEMA_VERSION),
    artifactType: z.literal("ready_for_owner_package"),
    artifactId: identifierSchema,
    artifactVersion: versionSchema,
    lifecyclePreStateSha256: sha256Schema,
    sourceAnalysisArtifactSha256: sha256Schema,
    sourceRoleReceiptSha256: sha256Schema,
    createdAt: dateTimeSchema,
    artifactSha256: sha256Schema,
  })
  .strict();

export type CorpusReadyPackage = z.infer<typeof corpusReadyPackageSchema>;

const sourceRoleOwnerConfirmedReadyPackageEventSchema = z
  .object({
    ...eventCore,
    eventType: z.literal("source_role_owner_confirmed_ready_package"),
    payload: z
      .object({
        sourceAnalysisArtifactRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("source_analysis"),
        }),
        sourceRoleReceipt: corpusSourceRoleConfirmationReceiptSchema,
        readyPackageRef: corpusArtifactReferenceSchema.extend({
          artifactType: z.literal("ready_for_owner_package"),
        }),
        lifecycleRun: corpusAiRunSchema,
        stageEvidence: corpusStageEvidenceSchema,
      })
      .strict(),
  })
  .strict();

export const corpusProcessingStateEventSchema = z.discriminatedUnion(
  "eventType",
  [
    technicalTextExtractedEventSchema,
    identityVerifiedEventSchema,
    sourceAnalysisAppliedEventSchema,
    sourceRoleOwnerConfirmedReadyPackageEventSchema,
  ],
);

export type CorpusProcessingStateEvent = z.infer<
  typeof corpusProcessingStateEventSchema
>;

const appliedEventReferenceSchema = z
  .object({
    eventId: identifierSchema,
    eventType: z.enum([
      "technical_text_extracted",
      "identity_verified",
      "source_analysis_applied",
      "source_role_owner_confirmed_ready_package",
    ]),
    globalSequence: z.number().int().positive(),
    identitySequence: z.number().int().positive(),
    eventSha256: sha256Schema,
    occurredAt: dateTimeSchema,
  })
  .strict();

const baselineBindingSchema = z
  .object({
    baselineId: identifierSchema,
    baselineManifestSha256: sha256Schema,
    baselineRegisterSha256: sha256Schema,
    baselineRowSha256: sha256Schema,
  })
  .strict();

export const corpusProcessingCurrentStateSchema = z
  .object({
    schemaVersion: z.literal(CORPUS_CURRENT_STATE_SCHEMA_VERSION),
    recordId: identifierSchema,
    identityKey: z.string().min(1),
    baselineBinding: baselineBindingSchema,
    stateVersion: z.number().int().nonnegative(),
    previousIdentityEventSha256: sha256Schema.nullable(),
    lifecycle: z.unknown(),
    lifecycleSha256: sha256Schema,
    permissions: z.unknown(),
    appliedEvents: z.array(appliedEventReferenceSchema),
    latestArtifacts: z
      .object({
        technicalQualification: corpusArtifactReferenceSchema
          .extend({
            artifactType: z.literal("pdf_technical_qualification"),
          })
          .nullable(),
        inputManifest: corpusArtifactReferenceSchema
          .extend({
            artifactType: z.literal("source_analysis_input_manifest"),
          })
          .nullable(),
        verifiedInputManifest: corpusArtifactReferenceSchema
          .extend({
            artifactType: z.literal("source_analysis_input_manifest"),
          })
          .nullable(),
        sourceAcquisition: corpusArtifactReferenceSchema
          .extend({ artifactType: z.literal("source_acquisition_receipt") })
          .nullable(),
        identityVerification: corpusArtifactReferenceSchema
          .extend({ artifactType: z.literal("source_identity_verification") })
          .nullable(),
        sourceAnalysis: corpusArtifactReferenceSchema
          .extend({ artifactType: z.literal("source_analysis") })
          .nullable(),
        sourceAnalysisWorkflow: corpusArtifactReferenceSchema
          .extend({ artifactType: z.literal("source_analysis_workflow") })
          .nullable(),
        sourceAnalysisPromptTemplate: corpusArtifactReferenceSchema
          .extend({
            artifactType: z.literal("source_analysis_prompt_template"),
          })
          .nullable(),
        readyPackage: corpusArtifactReferenceSchema
          .extend({ artifactType: z.literal("ready_for_owner_package") })
          .nullable(),
      })
      .strict(),
    latestSourceContent: corpusSourceContentReferenceSchema.nullable(),
    stateSha256: sha256Schema,
  })
  .strict();

export type CorpusProcessingCurrentState = Omit<
  z.infer<typeof corpusProcessingCurrentStateSchema>,
  "lifecycle" | "permissions"
> & {
  lifecycle: CorpusLifecycleRecord;
  permissions: CorpusLifecyclePermissions;
};

export type CorpusProcessingBaselineRow = {
  schemaVersion: "1.0.0";
  recordId: string;
  identityKey: string;
  lifecycle: CorpusLifecycleRecord;
  permissions: CorpusLifecyclePermissions;
  [key: string]: unknown;
};

export type ResolvedCorpusArtifact = {
  value: unknown;
  fileSha256: string;
  bytes: Buffer | string;
};

export type ResolveCorpusArtifact = (
  reference: CorpusArtifactReference,
) => ResolvedCorpusArtifact;

export type ResolveCorpusSourceContent = (
  reference: CorpusSourceContentReference,
) => Buffer;

export type ResolveCorpusNormalizedText = (locator: string) => Buffer;

export type VerifyCorpusHumanReviewerAuthentication = (input: {
  reviewer: CorpusNamedReviewer;
  receiptSha256: string;
  eventId: string;
  eventSha256: string;
}) => boolean;

export type ProjectCorpusCurrentStateInput = {
  baselineId: string;
  baselineManifestSha256: string;
  baselineRegisterSha256: string;
  baselineRows: unknown[];
  events: unknown[];
  resolveArtifact?: ResolveCorpusArtifact;
  resolveSourceContent?: ResolveCorpusSourceContent;
  resolveNormalizedText?: ResolveCorpusNormalizedText;
  verifyHumanReviewerAuthentication?: VerifyCorpusHumanReviewerAuthentication;
};

export function requireTrustedCorpusHumanReviewerAuthentication(
  input: Parameters<VerifyCorpusHumanReviewerAuthentication>[0],
  verifier: VerifyCorpusHumanReviewerAuthentication | undefined,
): void {
  if (input.reviewer.authentication.state !== "verified") {
    fail("human reviewer authentication is only self-asserted");
  }
  if (!verifier) {
    fail("trusted human reviewer authentication verifier is not configured");
  }
  if (!verifier(input)) {
    fail("trusted human reviewer authentication verification failed");
  }
}

export function hashCorpusProcessingStateEvent(
  event:
    Omit<CorpusProcessingStateEvent, "eventSha256"> | Record<string, unknown>,
): string {
  const { eventSha256: _eventSha256, ...body } = event as Record<
    string,
    unknown
  >;
  return domainHash(
    CORPUS_STATE_EVENT_HASH_DOMAIN,
    body as CorpusCanonicalJsonValue,
  );
}

export function sealCorpusProcessingStateEvent<
  T extends Record<string, unknown>,
>(event: T): T & { eventSha256: string } {
  const { eventSha256: _eventSha256, ...body } = event;
  return {
    ...body,
    eventSha256: domainHash(
      CORPUS_STATE_EVENT_HASH_DOMAIN,
      body as CorpusCanonicalJsonValue,
    ),
  } as T & { eventSha256: string };
}

export function hashCorpusExecution(value: CorpusCanonicalJsonValue): string {
  return domainHash(CORPUS_EXECUTION_HASH_DOMAIN, value);
}

export function hashCorpusExecutionMembership(identityKeys: string[]): string {
  return domainHash(
    CORPUS_EXECUTION_MEMBERSHIP_HASH_DOMAIN,
    identityKeys as CorpusCanonicalJsonValue,
  );
}

export function hashCorpusReadyPackage(value: Record<string, unknown>): string {
  const { artifactSha256: _artifactSha256, ...body } = value;
  return domainHash(
    CORPUS_READY_PACKAGE_HASH_DOMAIN,
    body as CorpusCanonicalJsonValue,
  );
}

export function sealCorpusReadyPackage<T extends Record<string, unknown>>(
  value: T,
): T & { artifactSha256: string } {
  const { artifactSha256: _artifactSha256, ...body } = value;
  return {
    ...body,
    artifactSha256: domainHash(
      CORPUS_READY_PACKAGE_HASH_DOMAIN,
      body as CorpusCanonicalJsonValue,
    ),
  } as T & { artifactSha256: string };
}

export function hashCorpusCurrentState(
  value:
    Omit<CorpusProcessingCurrentState, "stateSha256"> | Record<string, unknown>,
): string {
  const { stateSha256: _stateSha256, ...body } = value as Record<
    string,
    unknown
  >;
  return domainHash(
    CORPUS_CURRENT_STATE_HASH_DOMAIN,
    body as CorpusCanonicalJsonValue,
  );
}

function baselineRow(value: unknown): CorpusProcessingBaselineRow {
  const parsed = z
    .object({
      schemaVersion: z.literal("1.0.0"),
      recordId: identifierSchema,
      identityKey: z.string().min(1),
      lifecycle: z.unknown(),
      permissions: z.unknown(),
    })
    .passthrough()
    .safeParse(value);
  if (!parsed.success)
    fail(`baseline row schema invalid: ${parsed.error.message}`);
  const lifecycle = validateCorpusLifecycle(parsed.data.lifecycle);
  const permissions = deriveCorpusLifecyclePermissions(lifecycle);
  if (!exactJson(parsed.data.permissions, permissions)) {
    fail(
      `baseline row ${parsed.data.identityKey} permissions do not derive from lifecycle`,
    );
  }
  if (parsed.data.recordId !== lifecycle.recordId) {
    fail(
      `baseline row ${parsed.data.identityKey} recordId differs from lifecycle`,
    );
  }
  return {
    ...parsed.data,
    lifecycle,
    permissions,
  } as CorpusProcessingBaselineRow;
}

function currentStateBody(
  value: Omit<CorpusProcessingCurrentState, "stateSha256">,
): CorpusProcessingCurrentState {
  return {
    ...value,
    stateSha256: hashCorpusCurrentState(value),
  };
}

export function initializeCorpusCurrentState(input: {
  baselineId: string;
  baselineManifestSha256: string;
  baselineRegisterSha256: string;
  baselineRow: unknown;
}): CorpusProcessingCurrentState {
  const row = baselineRow(input.baselineRow);
  const baselineRowSha256 = hashCorpusBaselineRow(
    input.baselineRow as CorpusCanonicalJsonValue,
  );
  return validateCorpusCurrentState(
    currentStateBody({
      schemaVersion: CORPUS_CURRENT_STATE_SCHEMA_VERSION,
      recordId: row.recordId,
      identityKey: row.identityKey,
      baselineBinding: {
        baselineId: input.baselineId,
        baselineManifestSha256: input.baselineManifestSha256,
        baselineRegisterSha256: input.baselineRegisterSha256,
        baselineRowSha256,
      },
      stateVersion: 0,
      previousIdentityEventSha256: null,
      lifecycle: row.lifecycle,
      lifecycleSha256: hashCorpusLifecycleState(row.lifecycle),
      permissions: row.permissions,
      appliedEvents: [],
      latestArtifacts: {
        technicalQualification: null,
        inputManifest: null,
        verifiedInputManifest: null,
        sourceAcquisition: null,
        identityVerification: null,
        sourceAnalysis: null,
        sourceAnalysisWorkflow: null,
        sourceAnalysisPromptTemplate: null,
        readyPackage: null,
      },
      latestSourceContent: null,
    }),
  );
}

export function validateCorpusCurrentState(
  value: unknown,
): CorpusProcessingCurrentState {
  const parsed = corpusProcessingCurrentStateSchema.safeParse(value);
  if (!parsed.success)
    fail(`current-state schema invalid: ${parsed.error.message}`);
  const state = parsed.data as CorpusProcessingCurrentState;
  const lifecycle = validateCorpusLifecycle(state.lifecycle);
  if (state.recordId !== lifecycle.recordId)
    fail("current-state recordId differs from lifecycle");
  if (state.lifecycleSha256 !== hashCorpusLifecycleState(lifecycle)) {
    fail("lifecycleSha256 does not seal the exact lifecycle state");
  }
  const permissions = deriveCorpusLifecyclePermissions(lifecycle);
  if (!exactJson(state.permissions, permissions)) {
    fail("current-state permissions do not derive from its lifecycle");
  }
  if (state.stateVersion !== state.appliedEvents.length) {
    fail("stateVersion must equal the number of applied identity events");
  }
  if (
    state.previousIdentityEventSha256 !==
    (state.appliedEvents.at(-1)?.eventSha256 ?? null)
  ) {
    fail("previousIdentityEventSha256 must match the last applied event");
  }
  const expectedEventTypes = [
    "technical_text_extracted",
    "identity_verified",
    "source_analysis_applied",
    "source_role_owner_confirmed_ready_package",
  ] as const;
  if (
    !exactJson(
      state.appliedEvents.map((event) => event.eventType),
      expectedEventTypes.slice(0, state.stateVersion),
    )
  ) {
    fail("applied events must be the exact non-repeating v1 lifecycle prefix");
  }
  const eventIds = state.appliedEvents.map((event) => event.eventId);
  const eventHashes = state.appliedEvents.map((event) => event.eventSha256);
  if (
    new Set(eventIds).size !== eventIds.length ||
    new Set(eventHashes).size !== eventHashes.length ||
    state.appliedEvents.some(
      (event, index) =>
        event.identitySequence !== index + 1 ||
        (index > 0 &&
          (event.globalSequence <=
            state.appliedEvents[index - 1]!.globalSequence ||
            Date.parse(event.occurredAt) <
              Date.parse(state.appliedEvents[index - 1]!.occurredAt))),
    )
  ) {
    fail("applied event references are duplicated or out of sequence");
  }
  const hasTechnical = state.stateVersion >= 1;
  const hasIdentity = state.stateVersion >= 2;
  const hasAnalysis = state.stateVersion >= 3;
  const hasReadyPackage = state.stateVersion >= 4;
  if (
    (state.latestArtifacts.technicalQualification !== null) !== hasTechnical ||
    (state.latestArtifacts.inputManifest !== null) !== hasTechnical ||
    (state.latestArtifacts.verifiedInputManifest !== null) !== hasIdentity ||
    (state.latestArtifacts.sourceAcquisition !== null) !== hasIdentity ||
    (state.latestArtifacts.identityVerification !== null) !== hasIdentity ||
    (state.latestSourceContent !== null) !== hasIdentity ||
    (state.latestArtifacts.sourceAnalysis !== null) !== hasAnalysis ||
    (state.latestArtifacts.sourceAnalysisWorkflow !== null) !== hasAnalysis ||
    (state.latestArtifacts.sourceAnalysisPromptTemplate !== null) !==
      hasAnalysis ||
    (state.latestArtifacts.readyPackage !== null) !== hasReadyPackage
  ) {
    fail(
      "latest artifact bindings do not match the exact applied event prefix",
    );
  }
  if (hasIdentity && lifecycle.sourceIdentity.identityStatus !== "verified") {
    fail(
      "identity_verified event prefix requires verified lifecycle identity state",
    );
  }
  if (hasIdentity) {
    const candidate = state.latestArtifacts.inputManifest!;
    const verified = state.latestArtifacts.verifiedInputManifest!;
    const identity = state.latestArtifacts.identityVerification!;
    if (
      identity.path !==
      sourceIdentityVerificationArtifactPath(identity.artifactSha256)
    ) {
      fail(
        "verified identity reference does not use its content-addressed repository path",
      );
    }
    if (
      candidate.path === verified.path ||
      candidate.fileSha256 === verified.fileSha256 ||
      candidate.artifactSha256 === verified.artifactSha256
    ) {
      fail(
        "identity prefix requires immutable-distinct candidate and verified input manifests",
      );
    }
  }
  if (
    hasAnalysis &&
    (lifecycle.aiProcessingStatus.currentStage !== "cross_check" ||
      lifecycle.aiProcessingStatus.state !== "complete") &&
    !hasReadyPackage
  ) {
    fail("source_analysis_applied prefix must stop at complete cross_check");
  }
  if (
    hasReadyPackage &&
    (lifecycle.aiProcessingStatus.currentStage !== "ready_for_owner" ||
      lifecycle.aiProcessingStatus.state !== "complete")
  ) {
    fail("ready-package prefix requires complete ready_for_owner state");
  }
  if (state.stateSha256 !== hashCorpusCurrentState(state)) {
    fail("stateSha256 does not seal the exact current-state row");
  }
  return { ...state, lifecycle, permissions };
}

function resolvedArtifactBytes(
  reference: CorpusArtifactReference,
  resolveArtifact: ResolveCorpusArtifact | undefined,
): ResolvedCorpusArtifact {
  if (!resolveArtifact) fail(`artifact resolver missing for ${reference.path}`);
  const resolved = resolveArtifact(reference);
  if (prefixedSha256(resolved.fileSha256) !== reference.fileSha256) {
    fail(`artifact file hash mismatch for ${reference.path}`);
  }
  const observedBytes =
    typeof resolved.bytes === "string"
      ? Buffer.from(resolved.bytes, "utf8")
      : resolved.bytes;
  if (
    prefixedSha256(createHash("sha256").update(observedBytes).digest("hex")) !==
    reference.fileSha256
  ) {
    fail(
      `resolved artifact bytes do not match fileSha256 for ${reference.path}`,
    );
  }
  return { ...resolved, bytes: observedBytes };
}

function resolvedArtifactFile(
  reference: CorpusArtifactReference,
  resolveArtifact: ResolveCorpusArtifact | undefined,
): ResolvedCorpusArtifact {
  const resolved = resolvedArtifactBytes(reference, resolveArtifact);
  const observedBytes = resolved.bytes as Buffer;
  let parsedFromBytes: unknown;
  try {
    parsedFromBytes = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(observedBytes),
    );
  } catch {
    fail(
      `resolved artifact bytes are not valid UTF-8 JSON for ${reference.path}`,
    );
  }
  if (!exactJson(parsedFromBytes, resolved.value)) {
    fail(
      `resolved artifact value differs from its verified bytes for ${reference.path}`,
    );
  }
  return { ...resolved, value: parsedFromBytes };
}

function resolvedArtifact(
  reference: CorpusArtifactReference,
  resolveArtifact: ResolveCorpusArtifact | undefined,
): unknown {
  return resolvedArtifactFile(reference, resolveArtifact).value;
}

function assertArtifactReference(
  reference: CorpusArtifactReference,
  expected: {
    artifactId: string;
    artifactVersion: string;
    artifactSha256: string;
  },
  label: string,
): void {
  if (
    reference.artifactId !== expected.artifactId ||
    reference.artifactVersion !== expected.artifactVersion ||
    reference.artifactSha256 !== prefixedSha256(expected.artifactSha256)
  ) {
    fail(
      `${label} reference does not bind its exact ID, version and self-hash`,
    );
  }
}

function assertAtOrBefore(
  value: string,
  boundary: string,
  label: string,
): void {
  if (Date.parse(value) > Date.parse(boundary))
    fail(`${label} postdates its event`);
}

function applyTechnicalTextExtracted(
  state: CorpusProcessingCurrentState,
  event: z.infer<typeof technicalTextExtractedEventSchema>,
  resolver: ResolveCorpusArtifact | undefined,
): CorpusLifecycleRecord {
  if (
    state.latestArtifacts.technicalQualification ||
    state.latestArtifacts.inputManifest
  ) {
    fail(
      "technical extraction event cannot overwrite an existing technical application",
    );
  }
  const receiptValue = resolvedArtifact(
    event.payload.qualificationReceiptRef,
    resolver,
  );
  const parsedReceipt = PdfQualificationReceiptSchema.safeParse(receiptValue);
  if (
    !parsedReceipt.success ||
    !verifySealedQualificationReceipt(parsedReceipt.data)
  ) {
    fail(
      "technical extraction receipt is structurally invalid or has an invalid seal",
    );
  }
  const receipt = parsedReceipt.data;
  const manifest = verifySourceAnalysisInputManifest(
    resolvedArtifact(event.payload.inputManifestRef, resolver),
  );
  const expectedReceiptId = `artifact.pdf_extraction.${receipt.processingUnit.rawPdfSha256}`;
  assertArtifactReference(
    event.payload.qualificationReceiptRef,
    {
      artifactId: expectedReceiptId,
      artifactVersion: receipt.pipelineVersion,
      artifactSha256: receipt.receiptSha256,
    },
    "technical qualification",
  );
  const expectedManifestId = `artifact.source_analysis_input.${manifest.manifestSha256}`;
  assertArtifactReference(
    event.payload.inputManifestRef,
    {
      artifactId: expectedManifestId,
      artifactVersion: manifest.pipelineVersion,
      artifactSha256: manifest.manifestSha256,
    },
    "source-analysis input manifest",
  );
  if (
    receipt.qualificationState ===
    "technical_extraction_passed_identity_blocked"
  ) {
    fail(
      "identity-blocked extraction cannot establish full text for a lifecycle identity",
    );
  }
  if (
    !receipt.identityKeys.includes(state.identityKey) ||
    !manifest.identityKeys.includes(state.identityKey)
  ) {
    fail(
      "technical artifacts do not include the target identity in their memberships",
    );
  }
  if (!exactJson(receipt.identityKeys, manifest.identityKeys)) {
    fail("technical receipt and input manifest identity memberships differ");
  }
  if (
    receipt.processingUnit.rawPdfSha256 !==
      manifest.processingUnit.rawPdfSha256 ||
    prefixedSha256(receipt.processingUnit.rawPdfSha256) !==
      state.lifecycle.sourceIdentity.contentSha256
  ) {
    fail("technical artifacts do not bind the target source content hash");
  }
  if (
    event.payload.qualificationReceiptRef.path !==
      manifest.bindings.extractionReceipt.path ||
    event.payload.qualificationReceiptRef.fileSha256 !==
      prefixedSha256(manifest.bindings.extractionReceipt.fileSha256) ||
    event.payload.qualificationReceiptRef.artifactSha256 !==
      prefixedSha256(manifest.bindings.extractionReceipt.receiptSha256)
  ) {
    fail(
      "input manifest does not bind the exact technical receipt file and seal",
    );
  }
  const text = event.payload.textAvailability;
  if (
    text.textSha256 !== prefixedSha256(manifest.normalizedInput.sha256) ||
    text.characterCount !== manifest.totals.normalizedCharacterCount ||
    text.observedAt !== event.occurredAt
  ) {
    fail("technical event text state does not bind the exact normalized input");
  }
  const lifecycle = structuredClone(state.lifecycle);
  lifecycle.textAvailability = text;
  lifecycle.updatedAt = event.occurredAt;
  state.latestArtifacts.technicalQualification =
    event.payload.qualificationReceiptRef;
  state.latestArtifacts.inputManifest = event.payload.inputManifestRef;
  return lifecycle;
}

function assertVerifiedInputManifestPromotion(input: {
  candidate: SourceAnalysisInputManifest;
  candidateRef: CorpusArtifactReference;
  promoted: SourceAnalysisInputManifest;
  promotedRef: CorpusArtifactReference;
  identity: SourceIdentityVerificationArtifact;
  identityRef: CorpusArtifactReference;
  verifiedLifecycle: CorpusLifecycleRecord;
}): void {
  const {
    candidate,
    candidateRef,
    promoted,
    promotedRef,
    identity,
    identityRef,
    verifiedLifecycle,
  } = input;
  if (identity.decision.state !== "verified") {
    fail("a non-verified identity cannot promote an input manifest");
  }
  if (
    candidate.workflowEligibility.state !== "identity_verification_candidate" ||
    candidate.identityAssociation.state !== "provisional_metadata_match" ||
    candidate.sourceBinding.corpusIdentityVerified !== false
  ) {
    fail("manifest promotion requires the exact provisional candidate input");
  }
  if (
    promoted.workflowEligibility.state !== "source_analysis_eligible" ||
    promoted.identityAssociation.state !== "verified_identity_match" ||
    promoted.sourceBinding.corpusIdentityVerified !== true
  ) {
    fail("promoted manifest is not source-analysis eligible");
  }
  if (
    promotedRef.path === candidateRef.path ||
    promotedRef.fileSha256 === candidateRef.fileSha256 ||
    promoted.manifestSha256 === candidate.manifestSha256
  ) {
    fail("promoted manifest must be an immutable distinct revision");
  }
  const expectedPromotedPath = sourceAnalysisVerifiedInputManifestPath({
    rawPdfSha256: promoted.processingUnit.rawPdfSha256,
    manifestSha256: promoted.manifestSha256,
  });
  if (promotedRef.path !== expectedPromotedPath) {
    fail("promoted manifest does not use its content-addressed revision path");
  }
  assertArtifactReference(
    promotedRef,
    {
      artifactId: `artifact.source_analysis_input.${promoted.manifestSha256}`,
      artifactVersion: promoted.pipelineVersion,
      artifactSha256: promoted.manifestSha256,
    },
    "verified source-analysis input manifest",
  );

  const candidateStableMaterial = {
    schemaVersion: candidate.schemaVersion,
    artifactType: candidate.artifactType,
    pipelineVersion: candidate.pipelineVersion,
    processingUnit: candidate.processingUnit,
    identityKeys: candidate.identityKeys,
    bindings: candidate.bindings,
    serialization: candidate.serialization,
    normalizedInput: candidate.normalizedInput,
    pages: candidate.pages,
    totals: candidate.totals,
    privateStorage: candidate.privateStorage,
    textIncludedInTrackedArtifact: candidate.textIncludedInTrackedArtifact,
    readiness: candidate.readiness,
  };
  const promotedStableMaterial = {
    schemaVersion: promoted.schemaVersion,
    artifactType: promoted.artifactType,
    pipelineVersion: promoted.pipelineVersion,
    processingUnit: promoted.processingUnit,
    identityKeys: promoted.identityKeys,
    bindings: promoted.bindings,
    serialization: promoted.serialization,
    normalizedInput: promoted.normalizedInput,
    pages: promoted.pages,
    totals: promoted.totals,
    privateStorage: promoted.privateStorage,
    textIncludedInTrackedArtifact: promoted.textIncludedInTrackedArtifact,
    readiness: promoted.readiness,
  };
  if (!exactJson(candidateStableMaterial, promotedStableMaterial)) {
    fail("promoted manifest changed immutable source, text or readiness data");
  }
  const {
    corpusIdentityVerified: _candidateIdentityState,
    ...candidateSourceBinding
  } = candidate.sourceBinding;
  const {
    corpusIdentityVerified: _promotedIdentityState,
    ...promotedSourceBinding
  } = promoted.sourceBinding;
  if (!exactJson(candidateSourceBinding, promotedSourceBinding)) {
    fail("promoted manifest changed the immutable source binding");
  }
  const verifiedIdentity = identity.decision.verifiedIdentity;
  const expectedIdentityAssociation = {
    state: "verified_identity_match",
    intendedLabel: candidate.identityAssociation.intendedLabel,
    observedDocumentTitle: candidate.identityAssociation.observedDocumentTitle,
    sourceId: verifiedIdentity.sourceId,
    canonicalIdentity: verifiedIdentity.canonicalIdentity,
    blockerCode: null,
  };
  if (!exactJson(promoted.identityAssociation, expectedIdentityAssociation)) {
    fail(
      "promoted manifest identity association drifts from the verified identity",
    );
  }
  const eligibility = promoted.workflowEligibility.sourceAnalysis;
  const expectedIdentityArtifactReference = {
    artifactId: identityRef.artifactId,
    artifactVersion: identityRef.artifactVersion,
    path: identityRef.path,
    fileSha256: unprefixedSha256(identityRef.fileSha256),
    artifactSha256: identityRef.artifactSha256,
    decision: "verified",
  };
  if (
    !exactJson(
      eligibility.identityArtifactReference,
      expectedIdentityArtifactReference,
    )
  ) {
    fail("promoted manifest identity-artifact reference is invalid");
  }
  const expectedPredecessor = {
    schemaVersion: candidate.schemaVersion,
    pipelineVersion: candidate.pipelineVersion,
    path: candidateRef.path,
    fileSha256: unprefixedSha256(candidateRef.fileSha256),
    manifestSha256: candidate.manifestSha256,
  };
  if (
    !exactJson(
      eligibility.predecessorInputManifestReference,
      expectedPredecessor,
    )
  ) {
    fail("promoted manifest predecessor reference is invalid");
  }
  const expectedIdentityPrestate = {
    lifecycleRecordId: identity.binding.lifecycleRecordId,
    lifecycleSnapshotSha256: identity.binding.lifecycleSnapshotSha256,
    lifecycleSnapshotUpdatedAt: identity.binding.lifecycleSnapshotUpdatedAt,
    sourceIdentityStatus: "provisional",
  };
  const expectedAnalysisPrestate = {
    lifecycleRecordId: verifiedLifecycle.recordId,
    lifecycleSnapshotSha256: hashCorpusLifecycleState(verifiedLifecycle),
    lifecycleSnapshotUpdatedAt: verifiedLifecycle.updatedAt,
    sourceIdentityStatus: "verified",
  };
  if (
    !exactJson(
      eligibility.lifecycleTransition.identityVerificationPrestate,
      expectedIdentityPrestate,
    ) ||
    !exactJson(
      eligibility.lifecycleTransition.analysisPrestate,
      expectedAnalysisPrestate,
    ) ||
    expectedIdentityPrestate.lifecycleSnapshotSha256 ===
      expectedAnalysisPrestate.lifecycleSnapshotSha256
  ) {
    fail("promoted manifest lifecycle transition is invalid");
  }
}

function applyIdentityVerified(
  state: CorpusProcessingCurrentState,
  event: z.infer<typeof identityVerifiedEventSchema>,
  resolver: ResolveCorpusArtifact | undefined,
  contentResolver: ResolveCorpusSourceContent | undefined,
): CorpusLifecycleRecord {
  if (state.latestArtifacts.identityVerification) {
    fail("identity event cannot overwrite an existing verified identity");
  }
  if (
    !state.latestArtifacts.technicalQualification ||
    !state.latestArtifacts.inputManifest
  ) {
    fail(
      "identity verification requires an applied technical extraction and input manifest",
    );
  }
  if (!contentResolver)
    fail("source-content resolver missing for identity verification");
  const identityFile = resolvedArtifactFile(
    event.payload.identityArtifactRef,
    resolver,
  );
  const acquisitionFile = resolvedArtifactFile(
    event.payload.acquisitionReceiptRef,
    resolver,
  );
  const extractionFile = resolvedArtifactFile(
    state.latestArtifacts.technicalQualification,
    resolver,
  );
  const candidateManifestFile = resolvedArtifactFile(
    state.latestArtifacts.inputManifest,
    resolver,
  );
  const pageMapFile = resolvedArtifactFile(event.payload.pageMapRef, resolver);
  const workflowFile = resolvedArtifactBytes(
    event.payload.workflowRef,
    resolver,
  );
  const promptTemplateFile = resolvedArtifactBytes(
    event.payload.promptTemplateRef,
    resolver,
  );
  const rawContentBytes = contentResolver(event.payload.sourceContentRef);
  if (
    !Buffer.isBuffer(rawContentBytes) ||
    rawContentBytes.length !== event.payload.sourceContentRef.sizeBytes ||
    `sha256:${createHash("sha256").update(rawContentBytes).digest("hex")}` !==
      event.payload.sourceContentRef.contentSha256
  ) {
    fail("resolved source bytes do not match the event content reference");
  }
  if (
    event.payload.sourceContentRef.artifactId !==
      `artifact.source_content.${event.payload.sourceContentRef.contentSha256.slice("sha256:".length)}` ||
    event.payload.sourceContentRef.artifactVersion !== "1.0.0"
  ) {
    fail(
      "source-content reference must use the deterministic content-addressed ID and v1 version",
    );
  }
  const provenance = requireVerifiedSourceIdentityWithEvidenceBundle(
    identityFile.value,
    {
      acquisitionReceiptFile: {
        path: event.payload.acquisitionReceiptRef.path,
        bytes: acquisitionFile.bytes,
      },
      rawContentBytes,
      extractionReceiptFile: {
        path: state.latestArtifacts.technicalQualification.path,
        bytes: extractionFile.bytes,
      },
      pageMapFile: {
        path: event.payload.pageMapRef.path,
        bytes: pageMapFile.bytes,
      },
      sourceAnalysisInputManifestFile: {
        path: state.latestArtifacts.inputManifest.path,
        bytes: candidateManifestFile.bytes,
      },
      workflowFile: {
        path: event.payload.workflowRef.path,
        bytes: workflowFile.bytes,
      },
      promptTemplateFile: {
        path: event.payload.promptTemplateRef.path,
        bytes: promptTemplateFile.bytes,
      },
    },
  );
  const identity = provenance.identity;
  if (
    event.payload.identityArtifactRef.path !==
    sourceIdentityVerificationArtifactPath(identity.artifactSha256)
  ) {
    fail(
      "identity artifact does not use its content-addressed repository path",
    );
  }
  assertArtifactReference(
    event.payload.identityArtifactRef,
    identity,
    "identity verification",
  );
  assertArtifactReference(
    event.payload.acquisitionReceiptRef,
    {
      artifactId: provenance.acquisitionReceipt.receiptId,
      artifactVersion: provenance.acquisitionReceipt.receiptVersion,
      artifactSha256: provenance.acquisitionReceipt.receiptSha256,
    },
    "source acquisition receipt",
  );
  assertArtifactReference(
    event.payload.pageMapRef,
    {
      artifactId: sourceIdentityPageMapId(
        event.payload.sourceContentRef.contentSha256,
      ),
      artifactVersion: provenance.pageMap.pipelineVersion,
      artifactSha256: provenance.pageMap.pageMapSha256,
    },
    "PDF page map",
  );
  if (
    event.payload.workflowRef.artifactId !== SOURCE_IDENTITY_WORKFLOW_ID ||
    event.payload.workflowRef.artifactVersion !==
      SOURCE_IDENTITY_WORKFLOW_VERSION ||
    event.payload.workflowRef.path !== SOURCE_IDENTITY_WORKFLOW_PATH ||
    event.payload.workflowRef.artifactSha256 !==
      event.payload.workflowRef.fileSha256
  ) {
    fail("identity workflow reference is not the exact immutable workflow");
  }
  if (
    event.payload.promptTemplateRef.artifactId !==
      SOURCE_IDENTITY_PROMPT_TEMPLATE_ID ||
    event.payload.promptTemplateRef.artifactVersion !==
      SOURCE_IDENTITY_PROMPT_TEMPLATE_VERSION ||
    event.payload.promptTemplateRef.path !==
      SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH ||
    event.payload.promptTemplateRef.artifactSha256 !==
      event.payload.promptTemplateRef.fileSha256
  ) {
    fail(
      "identity prompt-template reference is not the exact immutable template",
    );
  }
  if (
    event.payload.sourceContentRef.contentSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    event.payload.sourceContentRef.contentSha256 !==
      identity.extractionBinding.rawContentSha256 ||
    event.payload.sourceContentRef.sizeBytes !==
      identity.extractionBinding.rawContentSizeBytes
  ) {
    fail(
      "event source-content reference drifts from lifecycle, identity or acquisition receipt",
    );
  }
  const binding = identity.binding;
  if (
    binding.lifecycleRecordId !== state.recordId ||
    binding.lifecycleSnapshotSha256 !== state.lifecycleSha256 ||
    binding.lifecycleSnapshotUpdatedAt !== state.lifecycle.updatedAt ||
    binding.sourceId !== state.lifecycle.sourceIdentity.sourceId ||
    binding.sourceMetadataSha256 !==
      state.lifecycle.sourceIdentity.metadataSha256 ||
    binding.sourceContentSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    binding.lifecycleSourceIdentityStatus !==
      state.lifecycle.sourceIdentity.identityStatus
  ) {
    fail(
      "identity artifact does not bind the exact pre-event lifecycle snapshot",
    );
  }
  const manifest = provenance.sourceAnalysisInputManifest;
  const technical = state.latestArtifacts.technicalQualification;
  if (
    identity.extractionBinding.extractionReceiptId !== technical.artifactId ||
    identity.extractionBinding.extractionReceiptVersion !==
      technical.artifactVersion ||
    identity.extractionBinding.extractionReceiptSha256 !==
      technical.artifactSha256 ||
    identity.extractionBinding.rawContentSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    identity.extractionBinding.extractedTextManifestSha256 !==
      prefixedSha256(manifest.normalizedInput.sha256) ||
    identity.extractionBinding.pageMapSha256 !==
      prefixedSha256(manifest.bindings.pageMap.pageMapSha256) ||
    identity.extractionBinding.expectedPageCount !==
      manifest.totals.pageCount ||
    identity.extractionBinding.mappedPageCount !== manifest.totals.pageCount
  ) {
    fail("identity artifact has extraction or normalized-input binding drift");
  }
  const verified = identity.decision.verifiedIdentity;
  if (
    verified.sourceId !== state.lifecycle.sourceIdentity.sourceId ||
    verified.canonicalIdentity !==
      state.lifecycle.sourceIdentity.canonicalIdentity ||
    identity.candidateIdentity.canonicalIdentity !==
      state.lifecycle.sourceIdentity.canonicalIdentity ||
    identity.candidateIdentity.candidateTitle !==
      state.lifecycle.sourceIdentity.title ||
    manifest.sourceBinding.title !== state.lifecycle.sourceIdentity.title ||
    manifest.identityAssociation.observedDocumentTitle !==
      identity.observedMetadata.title
  ) {
    fail(
      "verified identity decision, title or candidate identity targets a different lifecycle source",
    );
  }
  assertAtOrBefore(identity.createdAt, event.occurredAt, "identity artifact");
  const lifecycle = structuredClone(state.lifecycle);
  lifecycle.sourceIdentity.identityStatus = "verified";
  lifecycle.sourceIdentity.identityKind =
    identity.candidateIdentity.identityKind;
  lifecycle.sourceIdentity.canonicalIdentity = verified.canonicalIdentity;
  lifecycle.updatedAt = event.occurredAt;
  const promotedManifestFile = resolvedArtifactFile(
    event.payload.verifiedInputManifestRef,
    resolver,
  );
  let promotedManifest: SourceAnalysisInputManifest;
  try {
    promotedManifest = verifySourceAnalysisInputManifest(
      promotedManifestFile.value,
    );
  } catch {
    fail("verified input-manifest revision is structurally invalid");
  }
  assertVerifiedInputManifestPromotion({
    candidate: manifest,
    candidateRef: state.latestArtifacts.inputManifest,
    promoted: promotedManifest,
    promotedRef: event.payload.verifiedInputManifestRef,
    identity,
    identityRef: event.payload.identityArtifactRef,
    verifiedLifecycle: lifecycle,
  });
  state.latestArtifacts.sourceAcquisition = event.payload.acquisitionReceiptRef;
  state.latestArtifacts.identityVerification =
    event.payload.identityArtifactRef;
  state.latestArtifacts.verifiedInputManifest =
    event.payload.verifiedInputManifestRef;
  state.latestSourceContent = event.payload.sourceContentRef;
  return lifecycle;
}

const SOURCE_ANALYSIS_LIFECYCLE_STAGES = [
  "triage",
  "full_text",
  "locator",
  "claims",
  "cross_check",
] as const;

function applySourceAnalysis(
  state: CorpusProcessingCurrentState,
  event: z.infer<typeof sourceAnalysisAppliedEventSchema>,
  resolver: ResolveCorpusArtifact | undefined,
  resolveNormalizedText: ResolveCorpusNormalizedText | undefined,
  identityVerificationPrestate: CorpusLifecycleRecord | undefined,
): CorpusLifecycleRecord {
  if (state.latestArtifacts.sourceAnalysis) {
    fail(
      "v1 source-analysis event cannot overwrite an existing analysis application",
    );
  }
  if (
    !state.latestArtifacts.identityVerification ||
    !state.latestArtifacts.verifiedInputManifest ||
    !identityVerificationPrestate ||
    state.lifecycle.sourceIdentity.identityStatus !== "verified"
  ) {
    fail("source analysis requires a previously applied verified identity");
  }
  if (
    !exactJson(
      event.payload.identityArtifactRef,
      state.latestArtifacts.identityVerification,
    ) ||
    !exactJson(
      event.payload.inputManifestRef,
      state.latestArtifacts.verifiedInputManifest,
    )
  ) {
    fail(
      "source-analysis event does not reuse the exact applied identity and input artifacts",
    );
  }
  const analysisFile = resolvedArtifactFile(
    event.payload.analysisArtifactRef,
    resolver,
  );
  const identityFile = resolvedArtifactFile(
    event.payload.identityArtifactRef,
    resolver,
  );
  const manifestFile = resolvedArtifactFile(
    event.payload.inputManifestRef,
    resolver,
  );
  const workflowFile = resolvedArtifactBytes(
    event.payload.analysisWorkflowRef,
    resolver,
  );
  const promptTemplateFile = resolvedArtifactBytes(
    event.payload.analysisPromptTemplateRef,
    resolver,
  );
  if (
    event.payload.analysisWorkflowRef.artifactId !==
      SOURCE_ANALYSIS_WORKFLOW_ID ||
    event.payload.analysisWorkflowRef.artifactVersion !==
      SOURCE_ANALYSIS_WORKFLOW_VERSION ||
    event.payload.analysisWorkflowRef.path !== SOURCE_ANALYSIS_WORKFLOW_PATH ||
    event.payload.analysisWorkflowRef.fileSha256 !==
      SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256 ||
    event.payload.analysisWorkflowRef.artifactSha256 !==
      SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256
  ) {
    fail("source-analysis event does not bind the canonical workflow file");
  }
  if (
    event.payload.analysisPromptTemplateRef.artifactId !==
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID ||
    event.payload.analysisPromptTemplateRef.artifactVersion !==
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION ||
    event.payload.analysisPromptTemplateRef.path !==
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH ||
    event.payload.analysisPromptTemplateRef.fileSha256 !==
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256 ||
    event.payload.analysisPromptTemplateRef.artifactSha256 !==
      SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256
  ) {
    fail(
      "source-analysis event does not bind the canonical prompt template file",
    );
  }
  if (!resolveNormalizedText) {
    fail("normalized-text resolver missing for source analysis");
  }
  let manifestForExecution: SourceAnalysisInputManifest;
  try {
    manifestForExecution = verifySourceAnalysisInputManifest(
      manifestFile.value,
    );
  } catch {
    fail("source-analysis input manifest is structurally invalid");
  }
  const normalizedPages = manifestForExecution.pages.map((page) => ({
    pageNumber: page.pageNumber,
    bytes: resolveNormalizedText(
      sourceAnalysisNormalizedPagePrivateLocator({
        rawPdfSha256: manifestForExecution.processingUnit.rawPdfSha256,
        pageNumber: page.pageNumber,
        copyId: "primary",
      }),
    ),
  }));
  if (!state.latestArtifacts.inputManifest) {
    fail("source analysis has no immutable predecessor input manifest");
  }
  const predecessorManifestFile = resolvedArtifactFile(
    state.latestArtifacts.inputManifest,
    resolver,
  );
  const validatedInputs =
    validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
      analysisFile.value,
      {
        predecessorInputManifestFile: {
          path: state.latestArtifacts.inputManifest.path,
          bytes: predecessorManifestFile.bytes,
        },
        inputManifestFile: {
          path: event.payload.inputManifestRef.path,
          bytes: manifestFile.bytes,
        },
        identityArtifactFile: {
          path: event.payload.identityArtifactRef.path,
          bytes: identityFile.bytes,
        },
        identityVerificationPrestate,
        analysisPrestate: state.lifecycle,
        workflowFile: {
          path: event.payload.analysisWorkflowRef.path,
          bytes: workflowFile.bytes,
        },
        promptTemplateFile: {
          path: event.payload.analysisPromptTemplateRef.path,
          bytes: promptTemplateFile.bytes,
        },
        normalizedPages,
      },
    );
  const analysis = validatedInputs.artifact;
  assertArtifactReference(
    event.payload.analysisArtifactRef,
    analysis,
    "source analysis",
  );
  const manifest = validatedInputs.inputManifest;
  const binding = analysis.binding;
  if (
    binding.lifecycleRecordId !== state.recordId ||
    binding.lifecycleSnapshotSha256 !== state.lifecycleSha256 ||
    binding.lifecycleSnapshotUpdatedAt !== state.lifecycle.updatedAt ||
    binding.sourceId !== state.lifecycle.sourceIdentity.sourceId ||
    binding.sourceTitle !== state.lifecycle.sourceIdentity.title ||
    binding.sourceCanonicalIdentity !==
      state.lifecycle.sourceIdentity.canonicalIdentity ||
    binding.sourceMetadataSha256 !==
      state.lifecycle.sourceIdentity.metadataSha256 ||
    binding.sourceContentSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    binding.textSha256 !== state.lifecycle.textAvailability.textSha256 ||
    binding.textAvailabilityState !== state.lifecycle.textAvailability.state ||
    !exactJson(
      analysis.scope.geographyIds,
      state.lifecycle.scope.geographyIds,
    ) ||
    !exactJson(
      analysis.scope.materialProfileIds,
      state.lifecycle.scope.materialProfileIds,
    ) ||
    !exactJson(
      analysis.scope.intendedUseProfileIds,
      state.lifecycle.scope.intendedUseProfileIds,
    )
  ) {
    fail(
      "source analysis does not bind the exact pre-event lifecycle/source/text/scope state",
    );
  }
  if (
    binding.extractionArtifactId !==
      state.latestArtifacts.technicalQualification?.artifactId ||
    binding.extractionArtifactVersion !==
      state.latestArtifacts.technicalQualification?.artifactVersion ||
    binding.extractionArtifactSha256 !==
      state.latestArtifacts.technicalQualification?.artifactSha256 ||
    binding.extractionTextManifestSha256 !==
      prefixedSha256(manifest.normalizedInput.sha256)
  ) {
    fail("source analysis has technical-extraction binding drift");
  }
  const execution = event.payload.executionBinding;
  if (
    execution.processingUnitSha256 !==
      prefixedSha256(manifest.processingUnit.rawPdfSha256) ||
    !exactJson(execution.membershipIdentityKeys, manifest.identityKeys) ||
    execution.membershipSha256 !==
      hashCorpusExecutionMembership(execution.membershipIdentityKeys) ||
    !execution.membershipIdentityKeys.includes(state.identityKey)
  ) {
    fail(
      "source-analysis execution membership or processing-unit binding is invalid",
    );
  }
  const executionMaterial = {
    analysisExecution: analysis.analysisExecution,
    actualFullTextReading: analysis.actualFullTextReading,
    analysisPayloadSha256: analysis.analysisPayloadSha256,
  };
  if (
    execution.executionSha256 !==
    hashCorpusExecution(executionMaterial as CorpusCanonicalJsonValue)
  ) {
    fail(
      "source-analysis executionSha256 does not bind the exact shared execution",
    );
  }
  if (
    !exactJson(
      event.payload.lifecycleRun.stages,
      SOURCE_ANALYSIS_LIFECYCLE_STAGES,
    ) ||
    !exactJson(
      event.payload.lifecycleRun.checkpoints.map(
        (checkpoint) => checkpoint.stage,
      ),
      SOURCE_ANALYSIS_LIFECYCLE_STAGES,
    ) ||
    !exactJson(
      event.payload.stageEvidence.map((evidence) => evidence.stage),
      SOURCE_ANALYSIS_LIFECYCLE_STAGES,
    )
  ) {
    fail(
      "source-analysis lifecycle application must advance exactly through cross_check",
    );
  }
  const run = event.payload.lifecycleRun;
  if (
    run.inputSha256 !== state.lifecycle.sourceIdentity.contentSha256 ||
    run.checkpoints[0]?.inputSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    run.checkpoints[1]?.outputSha256 !==
      state.lifecycle.textAvailability.textSha256 ||
    run.outputSha256 !== event.payload.analysisArtifactRef.artifactSha256 ||
    run.checkpoints.at(-1)?.outputSha256 !==
      event.payload.analysisArtifactRef.artifactSha256
  ) {
    fail(
      "source-analysis lifecycle run does not bind source bytes, full text and final artifact",
    );
  }
  const finalEvidence = event.payload.stageEvidence.at(-1)!;
  if (
    finalEvidence.artifactId !== event.payload.analysisArtifactRef.artifactId ||
    finalEvidence.artifactVersion !==
      event.payload.analysisArtifactRef.artifactVersion ||
    finalEvidence.outputSha256 !==
      event.payload.analysisArtifactRef.artifactSha256
  ) {
    fail(
      "cross_check evidence does not bind the exact source-analysis artifact",
    );
  }
  assertAtOrBefore(
    analysis.createdAt,
    event.occurredAt,
    "source-analysis artifact",
  );
  assertAtOrBefore(
    run.completedAt,
    event.occurredAt,
    "source-analysis lifecycle run",
  );
  if (
    !exactJson(state.lifecycle.aiProcessingStatus.completedStages, [
      "inventory",
    ])
  ) {
    fail("v1 source analysis requires an inventory-only pre-state");
  }
  const lifecycle = structuredClone(state.lifecycle);
  lifecycle.sourceIdentity.sourceRole =
    analysis.analysis.overview.sourceRoleCandidate;
  lifecycle.aiAssistanceProvenance = {
    used: true,
    runs: [...lifecycle.aiAssistanceProvenance.runs, run],
  };
  lifecycle.aiProcessingStatus = {
    currentStage: "cross_check",
    state: "complete",
    completedStages: ["inventory", ...SOURCE_ANALYSIS_LIFECYCLE_STAGES],
    stageEvidence: [
      ...lifecycle.aiProcessingStatus.stageEvidence,
      ...event.payload.stageEvidence,
    ],
    updatedAt: event.occurredAt,
  };
  lifecycle.updatedAt = event.occurredAt;
  state.latestArtifacts.sourceAnalysis = event.payload.analysisArtifactRef;
  state.latestArtifacts.sourceAnalysisWorkflow =
    event.payload.analysisWorkflowRef;
  state.latestArtifacts.sourceAnalysisPromptTemplate =
    event.payload.analysisPromptTemplateRef;
  return lifecycle;
}

function applyReadyPackage(
  state: CorpusProcessingCurrentState,
  event: z.infer<typeof sourceRoleOwnerConfirmedReadyPackageEventSchema>,
  resolver: ResolveCorpusArtifact | undefined,
  authenticationVerifier: VerifyCorpusHumanReviewerAuthentication | undefined,
): CorpusLifecycleRecord {
  if (
    !state.latestArtifacts.sourceAnalysis ||
    !exactJson(
      event.payload.sourceAnalysisArtifactRef,
      state.latestArtifacts.sourceAnalysis,
    )
  ) {
    fail("ready package does not bind the exact applied source analysis");
  }
  if (state.latestArtifacts.readyPackage)
    fail("ready package cannot overwrite an existing package");
  if (
    state.lifecycle.aiProcessingStatus.currentStage !== "cross_check" ||
    state.lifecycle.aiProcessingStatus.state !== "complete"
  ) {
    fail("ready package requires complete cross_check state");
  }
  const receipt = event.payload.sourceRoleReceipt;
  if (
    receipt.binding.lifecycleRecordId !== state.recordId ||
    receipt.binding.sourceId !== state.lifecycle.sourceIdentity.sourceId ||
    receipt.binding.sourceMetadataSha256 !==
      state.lifecycle.sourceIdentity.metadataSha256 ||
    receipt.binding.sourceContentSha256 !==
      state.lifecycle.sourceIdentity.contentSha256 ||
    !exactJson(
      receipt.binding.geographyIds,
      state.lifecycle.scope.geographyIds,
    ) ||
    !exactJson(
      receipt.binding.materialProfileIds,
      state.lifecycle.scope.materialProfileIds,
    ) ||
    !exactJson(
      receipt.binding.intendedUseProfileIds,
      state.lifecycle.scope.intendedUseProfileIds,
    ) ||
    receipt.binding.artifactId !==
      state.latestArtifacts.sourceAnalysis.artifactId ||
    receipt.binding.artifactVersion !==
      state.latestArtifacts.sourceAnalysis.artifactVersion ||
    receipt.binding.artifactSha256 !==
      state.latestArtifacts.sourceAnalysis.artifactSha256
  ) {
    fail(
      "source-role receipt does not bind the exact lifecycle and applied analysis",
    );
  }
  requireTrustedCorpusHumanReviewerAuthentication(
    {
      reviewer: receipt.reviewer,
      receiptSha256: receipt.receiptSha256,
      eventId: event.eventId,
      eventSha256: event.eventSha256,
    },
    authenticationVerifier,
  );
  const readyPackageValue = resolvedArtifact(
    event.payload.readyPackageRef,
    resolver,
  );
  const parsedReadyPackage =
    corpusReadyPackageSchema.safeParse(readyPackageValue);
  if (!parsedReadyPackage.success) fail("ready package schema is invalid");
  const readyPackage = parsedReadyPackage.data;
  assertArtifactReference(
    event.payload.readyPackageRef,
    readyPackage,
    "ready package",
  );
  if (
    readyPackage.lifecyclePreStateSha256 !== state.lifecycleSha256 ||
    readyPackage.sourceAnalysisArtifactSha256 !==
      state.latestArtifacts.sourceAnalysis.artifactSha256 ||
    readyPackage.sourceRoleReceiptSha256 !== receipt.receiptSha256 ||
    readyPackage.artifactSha256 !== hashCorpusReadyPackage(readyPackage)
  ) {
    fail(
      "ready package self-hash or lifecycle/analysis/receipt binding is invalid",
    );
  }
  const run = event.payload.lifecycleRun;
  const previousOutput =
    state.lifecycle.aiProcessingStatus.stageEvidence.at(-1)?.outputSha256;
  if (
    !exactJson(run.stages, ["ready_for_owner"]) ||
    !exactJson(
      run.checkpoints.map((checkpoint) => checkpoint.stage),
      ["ready_for_owner"],
    ) ||
    run.inputSha256 !== previousOutput ||
    run.checkpoints[0]?.inputSha256 !== previousOutput ||
    run.outputSha256 !== readyPackage.artifactSha256 ||
    run.checkpoints[0]?.outputSha256 !== readyPackage.artifactSha256
  ) {
    fail(
      "ready-for-owner lifecycle run does not bind cross_check and the ready package",
    );
  }
  const evidence = event.payload.stageEvidence;
  if (
    evidence.stage !== "ready_for_owner" ||
    evidence.artifactId !== readyPackage.artifactId ||
    evidence.artifactVersion !== readyPackage.artifactVersion ||
    evidence.outputSha256 !== readyPackage.artifactSha256
  ) {
    fail("ready-for-owner evidence does not bind the exact ready package");
  }
  assertAtOrBefore(receipt.reviewedAt, event.occurredAt, "source-role receipt");
  assertAtOrBefore(readyPackage.createdAt, event.occurredAt, "ready package");
  assertAtOrBefore(run.completedAt, event.occurredAt, "ready lifecycle run");
  const lifecycle = structuredClone(state.lifecycle);
  lifecycle.sourceIdentity.sourceRole = receipt.confirmedRole;
  lifecycle.sourceRoleConfirmationStatus = {
    state: "owner_confirmed",
    receipt,
    updatedAt: event.occurredAt,
  };
  lifecycle.aiAssistanceProvenance = {
    used: true,
    runs: [...lifecycle.aiAssistanceProvenance.runs, run],
  };
  lifecycle.aiProcessingStatus = {
    currentStage: "ready_for_owner",
    state: "complete",
    completedStages: [
      ...lifecycle.aiProcessingStatus.completedStages,
      "ready_for_owner",
    ],
    stageEvidence: [...lifecycle.aiProcessingStatus.stageEvidence, evidence],
    updatedAt: event.occurredAt,
  };
  lifecycle.updatedAt = event.occurredAt;
  state.latestArtifacts.readyPackage = event.payload.readyPackageRef;
  return lifecycle;
}

function applyEvent(
  stateInput: CorpusProcessingCurrentState,
  event: CorpusProcessingStateEvent,
  resolver: ResolveCorpusArtifact | undefined,
  contentResolver: ResolveCorpusSourceContent | undefined,
  normalizedTextResolver: ResolveCorpusNormalizedText | undefined,
  authenticationVerifier: VerifyCorpusHumanReviewerAuthentication | undefined,
  identityVerificationPrestate: CorpusLifecycleRecord | undefined,
): CorpusProcessingCurrentState {
  const state = structuredClone(stateInput);
  let lifecycle: CorpusLifecycleRecord;
  switch (event.eventType) {
    case "technical_text_extracted":
      lifecycle = applyTechnicalTextExtracted(state, event, resolver);
      break;
    case "identity_verified":
      lifecycle = applyIdentityVerified(
        state,
        event,
        resolver,
        contentResolver,
      );
      break;
    case "source_analysis_applied":
      lifecycle = applySourceAnalysis(
        state,
        event,
        resolver,
        normalizedTextResolver,
        identityVerificationPrestate,
      );
      break;
    case "source_role_owner_confirmed_ready_package":
      lifecycle = applyReadyPackage(
        state,
        event,
        resolver,
        authenticationVerifier,
      );
      break;
  }
  state.lifecycle = validateCorpusLifecycle(lifecycle);
  state.lifecycleSha256 = hashCorpusLifecycleState(state.lifecycle);
  state.permissions = deriveCorpusLifecyclePermissions(state.lifecycle);
  state.stateVersion += 1;
  state.previousIdentityEventSha256 = event.eventSha256;
  state.appliedEvents.push({
    eventId: event.eventId,
    eventType: event.eventType,
    globalSequence: event.globalSequence,
    identitySequence: event.identitySequence,
    eventSha256: event.eventSha256,
    occurredAt: event.occurredAt,
  });
  state.stateSha256 = hashCorpusCurrentState(state);
  return validateCorpusCurrentState(state);
}

export function validateCorpusProcessingStateEvent(
  value: unknown,
): CorpusProcessingStateEvent {
  const parsed = corpusProcessingStateEventSchema.safeParse(value);
  if (!parsed.success) fail(`event schema invalid: ${parsed.error.message}`);
  const event = parsed.data;
  if (event.eventSha256 !== hashCorpusProcessingStateEvent(event)) {
    fail(`event ${event.eventId} self-hash mismatch`);
  }
  if (
    (event.globalSequence === 1) !==
    (event.previousGlobalEventSha256 === null)
  ) {
    fail(`event ${event.eventId} global genesis binding is invalid`);
  }
  if (
    (event.identitySequence === 1) !==
    (event.previousIdentityEventSha256 === null)
  ) {
    fail(`event ${event.eventId} identity genesis binding is invalid`);
  }
  if (event.eventType === "technical_text_extracted") {
    if (event.payload.textAvailability.observedAt !== event.occurredAt) {
      fail(
        `event ${event.eventId} text observation must equal its occurrence time`,
      );
    }
  } else if (event.eventType === "source_analysis_applied") {
    const stages = [...SOURCE_ANALYSIS_LIFECYCLE_STAGES];
    if (
      !exactJson(event.payload.lifecycleRun.stages, stages) ||
      !exactJson(
        event.payload.lifecycleRun.checkpoints.map(
          (checkpoint) => checkpoint.stage,
        ),
        stages,
      ) ||
      !exactJson(
        event.payload.stageEvidence.map((evidence) => evidence.stage),
        stages,
      )
    ) {
      fail(
        `event ${event.eventId} must stop at the exact cross_check lifecycle boundary`,
      );
    }
    if (
      new Set(event.payload.executionBinding.membershipIdentityKeys).size !==
        event.payload.executionBinding.membershipIdentityKeys.length ||
      !event.payload.executionBinding.membershipIdentityKeys.includes(
        event.target.identityKey,
      ) ||
      event.payload.executionBinding.membershipSha256 !==
        hashCorpusExecutionMembership(
          event.payload.executionBinding.membershipIdentityKeys,
        )
    ) {
      fail(`event ${event.eventId} execution membership is invalid`);
    }
    event.payload.stageEvidence.forEach((evidence, index) => {
      if (
        evidence.method !== "ai_assisted" ||
        evidence.runId !== event.payload.lifecycleRun.runId ||
        evidence.checkpointIndex !== index
      ) {
        fail(
          `event ${event.eventId} stage evidence does not bind its exact run checkpoints`,
        );
      }
    });
    assertAtOrBefore(
      event.payload.lifecycleRun.completedAt,
      event.occurredAt,
      `event ${event.eventId} lifecycle run`,
    );
  } else if (event.eventType === "source_role_owner_confirmed_ready_package") {
    if (
      !exactJson(event.payload.lifecycleRun.stages, ["ready_for_owner"]) ||
      !exactJson(
        event.payload.lifecycleRun.checkpoints.map(
          (checkpoint) => checkpoint.stage,
        ),
        ["ready_for_owner"],
      ) ||
      event.payload.stageEvidence.stage !== "ready_for_owner" ||
      event.payload.stageEvidence.method !== "ai_assisted" ||
      event.payload.stageEvidence.runId !== event.payload.lifecycleRun.runId ||
      event.payload.stageEvidence.checkpointIndex !== 0
    ) {
      fail(
        `event ${event.eventId} must contain exactly one ready_for_owner checkpoint`,
      );
    }
    assertAtOrBefore(
      event.payload.lifecycleRun.completedAt,
      event.occurredAt,
      `event ${event.eventId} lifecycle run`,
    );
  }
  return event;
}

export function projectCorpusCurrentState(
  input: ProjectCorpusCurrentStateInput,
): CorpusProcessingCurrentState[] {
  if (
    !identifierSchema.safeParse(input.baselineId).success ||
    !sha256Schema.safeParse(input.baselineManifestSha256).success ||
    !sha256Schema.safeParse(input.baselineRegisterSha256).success
  ) {
    fail("projection baseline binding is invalid");
  }
  const states = new Map<string, CorpusProcessingCurrentState>();
  const recordIds = new Set<string>();
  for (const value of input.baselineRows) {
    const state = initializeCorpusCurrentState({
      baselineId: input.baselineId,
      baselineManifestSha256: input.baselineManifestSha256,
      baselineRegisterSha256: input.baselineRegisterSha256,
      baselineRow: value,
    });
    if (states.has(state.identityKey))
      fail(`duplicate baseline identity ${state.identityKey}`);
    if (recordIds.has(state.recordId))
      fail(`duplicate baseline record ${state.recordId}`);
    states.set(state.identityKey, state);
    recordIds.add(state.recordId);
  }
  const eventIds = new Set<string>();
  const eventHashes = new Set<string>();
  const forkPoints = new Set<string>();
  const identityVerificationPrestates = new Map<
    string,
    CorpusLifecycleRecord
  >();
  let previousGlobalEventSha256: string | null = null;
  let previousOccurredAt: string | null = null;
  for (const [index, value] of input.events.entries()) {
    const event = validateCorpusProcessingStateEvent(value);
    if (eventIds.has(event.eventId))
      fail(`duplicate event ID ${event.eventId}`);
    if (eventHashes.has(event.eventSha256))
      fail(`duplicate event hash ${event.eventSha256}`);
    if (
      event.globalSequence !== index + 1 ||
      event.previousGlobalEventSha256 !== previousGlobalEventSha256
    ) {
      fail(`event ${event.eventId} breaks the global hash chain`);
    }
    if (
      previousOccurredAt !== null &&
      Date.parse(event.occurredAt) < Date.parse(previousOccurredAt)
    ) {
      fail(`event ${event.eventId} creates a global timestamp regression`);
    }
    const state = states.get(event.target.identityKey);
    if (!state || state.recordId !== event.target.recordId) {
      fail(`event ${event.eventId} targets an orphan identity or record`);
    }
    const forkPoint = `${state.identityKey}\u0000${event.previousIdentityEventSha256 ?? "GENESIS"}`;
    if (forkPoints.has(forkPoint))
      fail(`event ${event.eventId} creates an identity-chain fork`);
    forkPoints.add(forkPoint);
    if (
      event.identitySequence !== state.stateVersion + 1 ||
      event.previousIdentityEventSha256 !== state.previousIdentityEventSha256
    ) {
      fail(`event ${event.eventId} is stale or breaks the identity hash chain`);
    }
    if (
      event.target.baselineRowSha256 !==
        state.baselineBinding.baselineRowSha256 ||
      event.target.preStateVersion !== state.stateVersion ||
      event.target.preStateSha256 !== state.stateSha256 ||
      event.target.preStateLifecycleSha256 !== state.lifecycleSha256
    ) {
      fail(
        `event ${event.eventId} does not bind the exact baseline and pre-state`,
      );
    }
    if (Date.parse(event.occurredAt) < Date.parse(state.lifecycle.updatedAt)) {
      fail(`event ${event.eventId} predates its pre-state`);
    }
    const identityVerificationPrestate =
      event.eventType === "source_analysis_applied"
        ? identityVerificationPrestates.get(state.identityKey)
        : undefined;
    const nextState = applyEvent(
      state,
      event,
      input.resolveArtifact,
      input.resolveSourceContent,
      input.resolveNormalizedText,
      input.verifyHumanReviewerAuthentication,
      identityVerificationPrestate,
    );
    if (event.eventType === "identity_verified") {
      identityVerificationPrestates.set(
        state.identityKey,
        structuredClone(state.lifecycle),
      );
    } else if (event.eventType === "source_analysis_applied") {
      identityVerificationPrestates.delete(state.identityKey);
    }
    states.set(state.identityKey, nextState);
    eventIds.add(event.eventId);
    eventHashes.add(event.eventSha256);
    previousGlobalEventSha256 = event.eventSha256;
    previousOccurredAt = event.occurredAt;
  }
  return [...states.values()].sort((left, right) =>
    left.identityKey < right.identityKey
      ? -1
      : left.identityKey > right.identityKey
        ? 1
        : 0,
  );
}
