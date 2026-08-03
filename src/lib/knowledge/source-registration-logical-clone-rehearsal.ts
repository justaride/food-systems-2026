import { z } from "zod";

import {
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
  sourceRegistrationApplyBareSha256,
} from "./source-registration-apply";
import {
  canonicalSourceRegistrationJson,
  type SourceRegistrationJsonValue,
} from "./source-registration-plan";

export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_SCHEMA_VERSION =
  "source-registration-logical-clone-rehearsal-v1" as const;
export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_HASH_DOMAIN =
  "food-systems-2026:source-registration-logical-clone-rehearsal:v1\0" as const;
export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_OPERATION_HASH_DOMAIN =
  "food-systems-2026:source-registration-logical-clone-rehearsal-operation:v1\0" as const;
export const SOURCE_REGISTRATION_LOGICAL_COMPARISON_PROOF_HASH_DOMAIN =
  "food-systems-2026:source-registration-logical-comparison-proof:v1\0" as const;
export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_MAX_DURATION_MS =
  15 * 60 * 1_000;
export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_MAX_AGE_MS =
  24 * 60 * 60 * 1_000;
export const SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_CLOCK_SKEW_MS =
  5 * 60 * 1_000;

const sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);
const dateTimeSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => {
    const timestamp = Date.parse(value);
    return (
      Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
    );
  });
const logicalStateSchema = z
  .object({
    contentStateSha256: sha256Schema,
    logicalStateSha256: sha256Schema,
    relationCount: z.number().int().positive(),
    totalRowCount: z.number().int().nonnegative(),
    sequenceRowCount: z.number().int().nonnegative(),
  })
  .strict();
const logicalComparisonProofBodySchema = z
  .object({
    schemaVersion: z.literal("source-registration-logical-comparison-proof-v1"),
    backupSha256: sha256Schema,
    backupMetadataSha256: sha256Schema,
    structuralRestoreReceiptSha256: sha256Schema,
    source: logicalStateSchema,
    restored: logicalStateSchema,
    contentStateAndCountsMatch: z.literal(true),
    targetBoundLogicalStatesDiffer: z.literal(true),
  })
  .strict();
export const SourceRegistrationLogicalComparisonProofSchema =
  logicalComparisonProofBodySchema
    .extend({ logicalComparisonProofSha256: sha256Schema })
    .strict();
export type SourceRegistrationLogicalComparisonProof = z.infer<
  typeof SourceRegistrationLogicalComparisonProofSchema
>;
export type SourceRegistrationLogicalComparisonProofBody = z.infer<
  typeof logicalComparisonProofBodySchema
>;
const countsSchema = z
  .object({
    documents: z.number().int().nonnegative(),
    libraryAnalysisRecords: z.number().int().nonnegative(),
    controlledMutationAudits: z.number().int().nonnegative(),
  })
  .strict();
const executedRuntimeSchema = z
  .object({
    runtimeAttestationSha256: sha256Schema,
    launcherFileSha256: sha256Schema,
    nodeBinaryFileSha256: sha256Schema,
    nodeRuntimeClosureSha256: sha256Schema,
    nodeVersion: z.string().regex(/^v\d+\.\d+\.\d+$/),
    nodePlatform: z.string().min(1),
    nodeArch: z.string().min(1),
    nodeModulesTreeSha256: sha256Schema,
    prismaGeneratedClientTreeSha256: sha256Schema,
    localRuntimeClosureSha256: sha256Schema,
  })
  .strict();

const bodySchema = z
  .object({
    schemaVersion: z.literal(
      SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_SCHEMA_VERSION,
    ),
    artifactType: z.literal(
      "source_registration_logical_clone_surrogate_rehearsal_receipt",
    ),
    targetClass: z.literal("logical_clone_surrogate"),
    exactProductionTargetExercised: z.literal(false),
    firstExactMutationRemainsLive: z.literal(true),
    productionAuthorizationUsed: z.literal(false),
    planSha256: z.literal(SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256),
    planFileSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    ),
    targetSetSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
    ),
    applyRunnerSha256: sha256Schema,
    rehearsalRuntimeSha256: sha256Schema,
    rehearsalSchemaSha256: sha256Schema,
    rehearsalTestSha256: sha256Schema,
    rehearsalCommandRunnerSha256: sha256Schema,
    executedRuntime: executedRuntimeSchema,
    logicalComparisonProof: SourceRegistrationLogicalComparisonProofSchema,
    operationKey: z
      .string()
      .regex(/^source-registration-logical-clone-rehearsal-v1:[a-f0-9]{64}$/),
    rehearsalStartedAtUtc: dateTimeSchema,
    rehearsalCompletedAtUtc: dateTimeSchema,
    beforeCounts: countsSchema,
    insideTransaction: z
      .object({
        isolationLevel: z.literal("Serializable"),
        documentCreates: z.literal(10),
        libraryAnalysisRecordCreates: z.literal(10),
        controlledMutationAuditCreates: z.literal(1),
        exactDocumentRows: z.literal(10),
        exactLibraryAnalysisRows: z.literal(10),
        dependencyRowCount: z.literal(0),
        physicalDocumentRowsSha256: sha256Schema,
        libraryAnalysisRowsSha256: sha256Schema,
        rehearsalAuditSummarySha256: sha256Schema,
      })
      .strict(),
    rollback: z
      .object({
        forcedBySentinel: z.literal(true),
        transactionRolledBack: z.literal(true),
        rollbackAbsenceConfirmed: z.literal(true),
        afterCountsEqualBeforeCounts: z.literal(true),
        targetRowsAbsentAfterRollback: z.literal(true),
        rehearsalAuditAbsentAfterRollback: z.literal(true),
      })
      .strict(),
    afterRollbackCounts: countsSchema,
    cloneDatabaseNameStored: z.literal(false),
    privateAbsolutePathStored: z.literal(false),
    databaseCredentialStored: z.literal(false),
  })
  .strict();

export const SourceRegistrationLogicalCloneRehearsalReceiptSchema = bodySchema
  .extend({ receiptSha256: sha256Schema })
  .strict();
export type SourceRegistrationLogicalCloneRehearsalReceipt = z.infer<
  typeof SourceRegistrationLogicalCloneRehearsalReceiptSchema
>;
export type SourceRegistrationLogicalCloneRehearsalReceiptBody = z.infer<
  typeof bodySchema
>;

function receiptHash(body: SourceRegistrationLogicalCloneRehearsalReceiptBody) {
  return sourceRegistrationApplyBareSha256(
    `${SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_HASH_DOMAIN}${canonicalSourceRegistrationJson(
      body as unknown as SourceRegistrationJsonValue,
    )}`,
  );
}

function logicalComparisonProofHash(
  body: SourceRegistrationLogicalComparisonProofBody,
): string {
  return sourceRegistrationApplyBareSha256(
    `${SOURCE_REGISTRATION_LOGICAL_COMPARISON_PROOF_HASH_DOMAIN}${canonicalSourceRegistrationJson(
      body as unknown as SourceRegistrationJsonValue,
    )}`,
  );
}

export function sourceRegistrationLogicalCloneRehearsalOperationKey(input: {
  planSha256: string;
  targetSetSha256: string;
  applyRunnerSha256: string;
  rehearsalRuntimeSha256: string;
  rehearsalSchemaSha256: string;
  rehearsalTestSha256: string;
  rehearsalCommandRunnerSha256: string;
  runtimeAttestationSha256: string;
  logicalComparisonProofSha256: string;
}): string {
  const body = z
    .object({
      planSha256: z.literal(SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256),
      targetSetSha256: z.literal(
        SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
      ),
      applyRunnerSha256: sha256Schema,
      rehearsalRuntimeSha256: sha256Schema,
      rehearsalSchemaSha256: sha256Schema,
      rehearsalTestSha256: sha256Schema,
      rehearsalCommandRunnerSha256: sha256Schema,
      runtimeAttestationSha256: sha256Schema,
      logicalComparisonProofSha256: sha256Schema,
    })
    .strict()
    .parse(input);
  return `${SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_SCHEMA_VERSION}:${sourceRegistrationApplyBareSha256(
    `${SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_OPERATION_HASH_DOMAIN}${canonicalSourceRegistrationJson(
      body as unknown as SourceRegistrationJsonValue,
    )}`,
  )}`;
}

function assertReceiptOperationKey(
  receipt: SourceRegistrationLogicalCloneRehearsalReceiptBody,
): void {
  const expected = sourceRegistrationLogicalCloneRehearsalOperationKey({
    planSha256: receipt.planSha256,
    targetSetSha256: receipt.targetSetSha256,
    applyRunnerSha256: receipt.applyRunnerSha256,
    rehearsalRuntimeSha256: receipt.rehearsalRuntimeSha256,
    rehearsalSchemaSha256: receipt.rehearsalSchemaSha256,
    rehearsalTestSha256: receipt.rehearsalTestSha256,
    rehearsalCommandRunnerSha256: receipt.rehearsalCommandRunnerSha256,
    runtimeAttestationSha256: receipt.executedRuntime.runtimeAttestationSha256,
    logicalComparisonProofSha256:
      receipt.logicalComparisonProof.logicalComparisonProofSha256,
  });
  if (receipt.operationKey !== expected) {
    throw new Error("Logical-clone rehearsal operation key mismatch");
  }
}

function assertLogicalComparisonProofFacts(
  proof: SourceRegistrationLogicalComparisonProof,
): void {
  if (
    proof.source.contentStateSha256 !== proof.restored.contentStateSha256 ||
    proof.source.relationCount !== proof.restored.relationCount ||
    proof.source.totalRowCount !== proof.restored.totalRowCount ||
    proof.source.sequenceRowCount !== proof.restored.sequenceRowCount
  ) {
    throw new Error(
      "Logical-comparison proof source/restored content state or counts differ",
    );
  }
  if (proof.source.logicalStateSha256 === proof.restored.logicalStateSha256) {
    throw new Error(
      "Logical-comparison proof target-bound logical state hashes must differ",
    );
  }
}

export function sealSourceRegistrationLogicalComparisonProof(
  value: SourceRegistrationLogicalComparisonProofBody,
): SourceRegistrationLogicalComparisonProof {
  const body = logicalComparisonProofBodySchema.parse(value);
  const proof = SourceRegistrationLogicalComparisonProofSchema.parse({
    ...body,
    logicalComparisonProofSha256: logicalComparisonProofHash(body),
  });
  assertLogicalComparisonProofFacts(proof);
  return proof;
}

export function validateSourceRegistrationLogicalComparisonProof(
  value: unknown,
): SourceRegistrationLogicalComparisonProof {
  const proof = SourceRegistrationLogicalComparisonProofSchema.parse(value);
  const { logicalComparisonProofSha256, ...body } = proof;
  if (logicalComparisonProofSha256 !== logicalComparisonProofHash(body)) {
    throw new Error("Logical-comparison proof self-hash mismatch");
  }
  assertLogicalComparisonProofFacts(proof);
  return proof;
}

function assertReceiptTiming(input: {
  startedAtUtc: string;
  completedAtUtc: string;
  now?: Date;
}): void {
  const startedAt = Date.parse(input.startedAtUtc);
  const completedAt = Date.parse(input.completedAtUtc);
  if (completedAt < startedAt) {
    throw new Error("Logical-clone rehearsal completion precedes its start");
  }
  if (
    completedAt - startedAt >
    SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_MAX_DURATION_MS
  ) {
    throw new Error("Logical-clone rehearsal exceeded its maximum duration");
  }
  if (input.now) {
    const now = input.now.getTime();
    if (!Number.isFinite(now)) {
      throw new Error("Logical-clone rehearsal validation time is invalid");
    }
    if (
      completedAt >
        now + SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_CLOCK_SKEW_MS ||
      now - completedAt > SOURCE_REGISTRATION_LOGICAL_CLONE_REHEARSAL_MAX_AGE_MS
    ) {
      throw new Error(
        "Logical-clone rehearsal receipt is stale or future-dated",
      );
    }
  }
}

export function sealSourceRegistrationLogicalCloneRehearsalReceipt(
  value: SourceRegistrationLogicalCloneRehearsalReceiptBody,
): SourceRegistrationLogicalCloneRehearsalReceipt {
  const body = bodySchema.parse(value);
  validateSourceRegistrationLogicalComparisonProof(body.logicalComparisonProof);
  assertReceiptOperationKey(body);
  assertReceiptTiming({
    startedAtUtc: body.rehearsalStartedAtUtc,
    completedAtUtc: body.rehearsalCompletedAtUtc,
  });
  return SourceRegistrationLogicalCloneRehearsalReceiptSchema.parse({
    ...body,
    receiptSha256: receiptHash(body),
  });
}

export function validateSourceRegistrationLogicalCloneRehearsalReceipt(
  value: unknown,
  options: { now?: Date } = {},
): SourceRegistrationLogicalCloneRehearsalReceipt {
  const receipt =
    SourceRegistrationLogicalCloneRehearsalReceiptSchema.parse(value);
  const { receiptSha256, ...body } = receipt;
  if (receiptSha256 !== receiptHash(body)) {
    throw new Error("Logical-clone rehearsal receipt self-hash mismatch");
  }
  validateSourceRegistrationLogicalComparisonProof(
    receipt.logicalComparisonProof,
  );
  assertReceiptOperationKey(body);
  if (
    canonicalSourceRegistrationJson(
      receipt.beforeCounts as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      receipt.afterRollbackCounts as unknown as SourceRegistrationJsonValue,
    )
  ) {
    throw new Error("Logical-clone rehearsal rollback counts differ");
  }
  assertReceiptTiming({
    startedAtUtc: receipt.rehearsalStartedAtUtc,
    completedAtUtc: receipt.rehearsalCompletedAtUtc,
    now: options.now ?? new Date(),
  });
  return receipt;
}
