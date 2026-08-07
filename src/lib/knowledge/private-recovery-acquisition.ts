import { createHash } from "node:crypto";

import { z } from "zod";

import {
  SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
  SOURCE_ACQUISITION_RECEIPT_VERSION,
  sealSourceAcquisitionReceipt,
  validateSourceAcquisitionReceipt,
  type ControlledPrivateAccessReceipt,
} from "./source-acquisition-receipt";
import {
  SourceRegistrationControlledMutationAuditSchema,
  sourceRegistrationApplyTargetSetSha256,
  sourceRegistrationControlledMutationAudit,
  validateSourceRegistrationApplyMutationSummary,
  type SourceRegistrationControlledMutationAudit,
} from "./source-registration-apply";
import {
  canonicalSourceRegistrationJson,
  validateSourceRegistrationPlan,
  type SourceRegistrationJsonValue,
  type SourceRegistrationPlan,
} from "./source-registration-plan";

export const PRIVATE_RECOVERY_ACQUISITION_PLAN_SCHEMA_VERSION =
  "private-recovery-acquisition-plan-v1" as const;
export const PRIVATE_RECOVERY_ACQUISITION_APPLY_SCHEMA_VERSION =
  "private-recovery-acquisition-apply-receipt-v1" as const;
export const PRIVATE_RECOVERY_ACQUISITION_VERSION = "1.0.0" as const;
export const PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE =
  "private-recovery-acquisition.new-official-2026-08-03.v1" as const;
export const PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH =
  "knowledge/corpus/corpus-private-recovery-candidates.v1.json" as const;
export const PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH =
  "knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json" as const;
export const PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH =
  "knowledge/corpus/private-recovery-acquisition/private-recovery-acquisition-plan-2026-08-03.v1.json" as const;
export const PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH =
  "knowledge/corpus/private-recovery-acquisition/private-recovery-acquisition-apply-receipt-2026-08-03.v1.json" as const;
export const PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT = 10 as const;
export const PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT = 11 as const;
export const PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT = 21 as const;
export const PRIVATE_RECOVERY_ACQUISITION_RECEIPT_DATE = "20260803" as const;

const CONTRACT_HASH_DOMAIN =
  "food-systems-2026:private-recovery-acquisition-contract:v1\0";
const PLAN_HASH_DOMAIN =
  "food-systems-2026:private-recovery-acquisition-plan:v1\0";
const OPERATION_HASH_DOMAIN =
  "food-systems-2026:private-recovery-acquisition-operation:v1\0";
const APPLY_RECEIPT_HASH_DOMAIN =
  "food-systems-2026:private-recovery-acquisition-apply-receipt:v1\0";
const MANIFEST_RECEIPT_HASH_DOMAIN =
  "food-systems-2026:private-recovery-manifest-receipt:v1\0";
const RECOVERY_ROW_HASH_DOMAIN = "food-systems-2026:private-recovery-row:v1\0";
const DATABASE_AUDIT_HASH_DOMAIN =
  "food-systems-2026:source-registration-database-audit:v1\0";

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const BARE_HASH_PATTERN = /^[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const PORTABLE_PATH_PATTERN = /^[a-z0-9][a-zA-Z0-9._/-]*$/;

const hashSchema = z.string().regex(HASH_PATTERN);
const bareHashSchema = z.string().regex(BARE_HASH_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const dateSchema = z.string().regex(DATE_PATTERN);
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Invalid UTC timestamp",
  );
const portablePathSchema = z
  .string()
  .regex(PORTABLE_PATH_PATTERN)
  .superRefine((value, context) => {
    if (
      value.startsWith("/") ||
      value.includes("\\") ||
      value.split("/").some((segment) => ["", ".", ".."].includes(segment))
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected a normalized portable relative path",
      });
    }
  });

const fileBindingSchema = z
  .object({
    path: portablePathSchema,
    fileSha256: hashSchema,
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

export const PrivateRecoveryRowSchema = z
  .object({
    identityKey: z.string().startsWith("document:"),
    canonicalPath: portablePathSchema,
    sha256: bareHashSchema,
    sizeBytes: z.number().int().positive(),
    internalLocator: z
      .string()
      .regex(/^private:\/\/corpus\/sha256\/[a-f0-9]{64}$/),
    replicaClass: z.literal("bigbrain_private_archive"),
    repositoryAvailable: z.literal(false),
    fullTextReviewed: z.literal(false),
    rightsState: z.literal("pending_not_cleared"),
  })
  .strict();

const existingRecoveryCandidateSchema = PrivateRecoveryRowSchema.passthrough();

export const PrivateRecoveryRegisterSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    registerId: z.literal("corpus-private-recovery-candidates.v1"),
    captureRecordedOn: dateSchema,
    purpose: z.string().min(1).max(2_000),
    storageVerificationContract: z
      .object({
        requiredCopies: z.tuple([
          z.literal("private_primary"),
          z.literal("bigbrain_private_replica"),
        ]),
        bothCopiesSha256MatchCandidate: z.literal(true),
        bothCopiesSizeBytesMatchCandidate: z.literal(true),
        bothCopiesFileMode: z.literal("0400"),
        verificationRecordedOn: dateSchema,
      })
      .strict(),
    candidates: z.array(existingRecoveryCandidateSchema),
  })
  .strict();

export type PrivateRecoveryRow = z.infer<typeof PrivateRecoveryRowSchema>;
export type PrivateRecoveryRegister = z.infer<
  typeof PrivateRecoveryRegisterSchema
>;

const implementationRoleSchema = z.enum([
  "private_recovery_runtime",
  "private_recovery_runner",
  "private_recovery_plan_schema",
  "private_recovery_apply_schema",
  "private_recovery_contract",
  "source_acquisition_runtime",
  "source_acquisition_schema",
  "source_registration_plan_runtime",
  "source_registration_apply_runtime",
  "source_registration_apply_runner",
]);

const implementationBindingSchema = fileBindingSchema
  .extend({ role: implementationRoleSchema })
  .strict();

const copyAttestationSchema = z
  .object({
    copyId: z.enum(["primary", "replica"]),
    storageRootId: identifierSchema,
    storageClass: identifierSchema,
    locator: z.string().regex(/^private:\/\/[a-z0-9][a-z0-9._:/-]*$/),
    portablePath: portablePathSchema,
    contentSha256: hashSchema,
    sizeBytes: z.number().int().positive(),
    fileMode: z.literal("0400"),
    verifiedAt: dateTimeSchema,
  })
  .strict();

export const VerifiedPrivateCopyPairSchema = z
  .object({
    targetId: identifierSchema,
    lifecycleSourceId: identifierSchema,
    primary: copyAttestationSchema.extend({ copyId: z.literal("primary") }),
    replica: copyAttestationSchema.extend({ copyId: z.literal("replica") }),
    distinctStorageRoots: z.literal(true),
    distinctFiles: z.literal(true),
    contentHashesMatch: z.literal(true),
    sizesMatch: z.literal(true),
    rootModes: z.literal("0700"),
    absoluteRootsStored: z.literal(false),
  })
  .strict();

export type VerifiedPrivateCopyPair = z.infer<
  typeof VerifiedPrivateCopyPairSchema
>;

const databaseAuditBindingSchema = z
  .object({
    auditId: z.string().min(1).max(2_000),
    auditSha256: hashSchema,
    operationKey: z.string().min(1).max(2_000),
    contractScope: z.string().min(1).max(2_000),
    contractSha256: hashSchema,
    planSha256: hashSchema,
    beforeSnapshotSha256: hashSchema,
    afterSnapshotSha256: hashSchema,
    dependencyStateSha256: hashSchema,
    databaseIdentityUuid: z.string().uuid(),
    targetFingerprintSha256: hashSchema,
    summarySha256: hashSchema,
    recordedAt: dateTimeSchema.nullable(),
    receiptState: z.literal("exact_apply_committed"),
    exactDocumentRows: z.literal(10),
    exactLibraryAnalysisRows: z.literal(10),
    controlledMutationAuditRows: z.literal(1),
  })
  .strict();

export type PrivateRecoveryDatabaseAuditBinding = z.infer<
  typeof databaseAuditBindingSchema
>;

const registerSnapshotSchema = z
  .object({
    file: fileBindingSchema,
    candidateCount: z.number().int().nonnegative(),
    manifestReceiptSha256: hashSchema,
    document: PrivateRecoveryRegisterSchema,
  })
  .strict();

const plannedAcquisitionReceiptSchema = z
  .object({
    file: fileBindingSchema,
    internalReceiptSha256: hashSchema,
    receipt: z.custom<ControlledPrivateAccessReceipt>(),
  })
  .strict();

const plannedTargetSchema = z
  .object({
    targetId: identifierSchema,
    canonicalIdentityKey: z.string().startsWith("document:"),
    lifecycleSourceId: identifierSchema,
    recoveryRow: PrivateRecoveryRowSchema,
    recoveryRowSha256: hashSchema,
    privateCopies: VerifiedPrivateCopyPairSchema,
    acquisitionReceipt: plannedAcquisitionReceiptSchema,
  })
  .strict();

const applyReceiptBodySchema = z
  .object({
    schemaVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_APPLY_SCHEMA_VERSION),
    artifactType: z.literal("private_recovery_acquisition_apply_receipt"),
    receiptVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_VERSION),
    receiptState: z.literal("exact_file_bundle_committed"),
    contractScope: z.literal(PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE),
    contractVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_VERSION),
    contractSha256: hashSchema,
    operationKey: z.string().startsWith("private-recovery-acquisition-v1:"),
    sourceRegistrationPlan: z
      .object({
        planSha256: hashSchema,
        fileSha256: hashSchema,
        targetCount: z.literal(10),
      })
      .strict(),
    sourceRegistrationApplyAudit: z
      .object({
        auditId: z.string().min(1).max(2_000),
        auditSha256: hashSchema,
        summarySha256: hashSchema,
        databaseIdentityUuid: z.string().uuid(),
      })
      .strict(),
    recoveryRegister: z
      .object({
        path: z.literal(PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH),
        beforeFileSha256: hashSchema,
        afterFileSha256: hashSchema,
        afterManifestReceiptSha256: hashSchema,
        preservedCandidateCount: z.literal(11),
        appendedCandidateCount: z.literal(10),
        afterCandidateCount: z.literal(21),
      })
      .strict(),
    controlledPrivateReceipts: z
      .array(
        z
          .object({
            targetId: identifierSchema,
            lifecycleSourceId: identifierSchema,
            path: portablePathSchema,
            fileSha256: hashSchema,
            internalReceiptSha256: hashSchema,
          })
          .strict(),
      )
      .length(10),
    mutations: z
      .object({
        privateRecoveryRowsAppended: z.literal(10),
        controlledPrivateReceiptFilesCreated: z.literal(10),
        applyReceiptFilesCreated: z.literal(1),
        databaseWrites: z.literal(0),
        corpusRegisterWrites: z.literal(0),
        lifecycleEventWrites: z.literal(0),
        rebaselineRuns: z.literal(0),
        sourceTextWrites: z.literal(0),
        fullTextReviewedChanges: z.literal(0),
      })
      .strict(),
    boundaries: z
      .object({
        existingCandidatesPreservedExactly: z.literal(true),
        repositoryAvailableRemainsFalse: z.literal(true),
        fullTextReviewedRemainsFalse: z.literal(true),
        rightsStateRemainsPending: z.literal(true),
        privateAbsolutePathsStored: z.literal(false),
        sourceTextStored: z.literal(false),
        humanValidationStillRequired: z.literal(true),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
  })
  .strict();

export const PrivateRecoveryAcquisitionApplyReceiptSchema =
  applyReceiptBodySchema.extend({ receiptSha256: hashSchema }).strict();

export type PrivateRecoveryAcquisitionApplyReceipt = z.infer<
  typeof PrivateRecoveryAcquisitionApplyReceiptSchema
>;

const planBodySchema = z
  .object({
    schemaVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_PLAN_SCHEMA_VERSION),
    artifactType: z.literal("private_recovery_acquisition_exact_plan"),
    planVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_VERSION),
    contractScope: z.literal(PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE),
    contractVersion: z.literal(PRIVATE_RECOVERY_ACQUISITION_VERSION),
    contractSha256: hashSchema,
    mode: z.literal("read_only_plan_with_explicit_apply_gate"),
    preparedAt: dateTimeSchema,
    operationKey: z.string().startsWith("private-recovery-acquisition-v1:"),
    inputBindings: z
      .object({
        sourceRegistrationPlan: fileBindingSchema
          .extend({
            planSha256: hashSchema,
            targetSetSha256: hashSchema,
          })
          .strict(),
        sourceRegistrationApplyAudit: databaseAuditBindingSchema,
        implementation: z.array(implementationBindingSchema).length(10),
      })
      .strict(),
    recoveryRegister: z
      .object({
        path: z.literal(PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH),
        before: registerSnapshotSchema,
        after: registerSnapshotSchema,
        appendCount: z.literal(10),
        existingCandidateCountPreserved: z.literal(11),
      })
      .strict(),
    targets: z.array(plannedTargetSchema).length(10),
    applyReceipt: z
      .object({
        file: fileBindingSchema,
        internalReceiptSha256: hashSchema,
        receipt: PrivateRecoveryAcquisitionApplyReceiptSchema,
      })
      .strict(),
    summary: z
      .object({
        targetCount: z.literal(10),
        beforeCandidateCount: z.literal(11),
        appendedCandidateCount: z.literal(10),
        afterCandidateCount: z.literal(21),
        controlledPrivateReceiptCount: z.literal(10),
        databaseWrites: z.literal(0),
        rebaselineRuns: z.literal(0),
        sourceTextStored: z.literal(false),
        privateAbsolutePathsStored: z.literal(false),
        fullTextReviewedPromotions: z.literal(0),
      })
      .strict(),
  })
  .strict();

export const PrivateRecoveryAcquisitionPlanSchema = planBodySchema
  .extend({ planSha256: hashSchema })
  .strict();

export type PrivateRecoveryAcquisitionPlanBody = z.infer<typeof planBodySchema>;
export type PrivateRecoveryAcquisitionPlan = z.infer<
  typeof PrivateRecoveryAcquisitionPlanSchema
>;
export type PrivateRecoveryImplementationBinding = z.infer<
  typeof implementationBindingSchema
>;

export type PrivateRecoveryJsonValue =
  | null
  | boolean
  | number
  | string
  | PrivateRecoveryJsonValue[]
  | { [key: string]: PrivateRecoveryJsonValue };

function fail(message: string): never {
  throw new Error(`Private-recovery acquisition failed: ${message}`);
}

export function canonicalPrivateRecoveryJson(
  value: PrivateRecoveryJsonValue,
): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalPrivateRecoveryJson(entry)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalPrivateRecoveryJson(value[key] as PrivateRecoveryJsonValue)}`,
    )
    .join(",")}}`;
}

export function privateRecoverySha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function domainHash(domain: string, value: unknown): string {
  return privateRecoverySha256(
    `${domain}${canonicalPrivateRecoveryJson(value as PrivateRecoveryJsonValue)}`,
  );
}

export function serializePrivateRecoveryJson(value: unknown): Buffer {
  return Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export function privateRecoveryFileBinding(
  path: string,
  bytes: Buffer,
): z.infer<typeof fileBindingSchema> {
  return fileBindingSchema.parse({
    path,
    fileSha256: privateRecoverySha256(bytes),
    sizeBytes: bytes.length,
  });
}

export function privateRecoveryManifestReceiptSha256(
  register: PrivateRecoveryRegister,
): string {
  return domainHash(MANIFEST_RECEIPT_HASH_DOMAIN, register);
}

export function privateRecoveryRowSha256(row: PrivateRecoveryRow): string {
  return domainHash(RECOVERY_ROW_HASH_DOMAIN, row);
}

export function privateRecoveryAcquisitionContractManifest(): PrivateRecoveryJsonValue {
  return {
    version: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    contractScope: PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE,
    sourceRegistrationPrerequisite: {
      exactReceiptedAfterState: true,
      documentRows: 10,
      libraryAnalysisRows: 10,
      controlledMutationAudits: 1,
    },
    recoveryRegister: {
      path: PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      beforeCount: PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT,
      appendCount: PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT,
      afterCount: PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT,
      compareAndSwap: true,
      preserveExistingRowsExactly: true,
    },
    receipts: {
      acquisitionType: "controlled_private_access",
      canonicalLifecycleSourceIds: true,
      internalAndFileSeals: true,
      exactCount: PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT,
      applyCommitMarkerLast: true,
    },
    safety: {
      defaultReadOnly: true,
      explicitStrongApplyAcknowledgement: true,
      idempotentExactReplay: true,
      durableCrashResumeJournal: true,
      directoryFsync: true,
      noDatabaseWrites: true,
      noRebaseline: true,
      noSourceText: true,
      noPrivateAbsolutePaths: true,
      fullTextReviewedRemainsFalse: true,
    },
  };
}

export function privateRecoveryAcquisitionContractSha256(): string {
  return domainHash(
    CONTRACT_HASH_DOMAIN,
    privateRecoveryAcquisitionContractManifest(),
  );
}

function assertUnique(label: string, values: string[]): void {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function canonical(value: unknown): string {
  return canonicalPrivateRecoveryJson(value as PrivateRecoveryJsonValue);
}

function assertNoPrivatePayload(value: unknown): void {
  const visit = (entry: unknown, keyPath: string): void => {
    if (typeof entry === "string") {
      if (
        entry.startsWith("/") ||
        /^[A-Za-z]:[\\/]/.test(entry) ||
        entry.startsWith("~")
      ) {
        fail(`absolute path found in tracked plan at ${keyPath}`);
      }
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((child, index) => visit(child, `${keyPath}[${index}]`));
      return;
    }
    if (entry && typeof entry === "object") {
      for (const [key, child] of Object.entries(entry)) {
        if (/^(sourceText|contentValue|rawText|normalizedText)$/i.test(key)) {
          fail(`source-text field found in tracked plan at ${keyPath}.${key}`);
        }
        visit(child, `${keyPath}.${key}`);
      }
    }
  };
  visit(value, "$plan");
}

export function validatePrivateRecoveryRegister(
  value: unknown,
): PrivateRecoveryRegister {
  const register = PrivateRecoveryRegisterSchema.parse(value);
  assertUnique(
    "recovery identity keys",
    register.candidates.map((candidate) => candidate.identityKey),
  );
  assertUnique(
    "recovery canonical paths",
    register.candidates.map((candidate) => candidate.canonicalPath),
  );
  assertUnique(
    "recovery content hashes",
    register.candidates.map((candidate) => candidate.sha256),
  );
  assertUnique(
    "recovery locators",
    register.candidates.map((candidate) => candidate.internalLocator),
  );
  for (const candidate of register.candidates) {
    if (
      candidate.internalLocator !==
      `private://corpus/sha256/${candidate.sha256}`
    ) {
      fail(`${candidate.identityKey}: content hash and private locator differ`);
    }
  }
  return register;
}

export function validateSourceRegistrationDatabaseAudit(input: {
  audit: unknown;
  sourceRegistrationPlan: SourceRegistrationPlan;
}): SourceRegistrationControlledMutationAudit {
  const plan = validateSourceRegistrationPlan(input.sourceRegistrationPlan);
  const audit = SourceRegistrationControlledMutationAuditSchema.parse(
    input.audit,
  );
  const summary = validateSourceRegistrationApplyMutationSummary(
    audit.mutationSummary,
  );
  const expected = sourceRegistrationControlledMutationAudit({ summary });
  const { recordedAt: _actualRecordedAt, ...actualCore } = audit;
  if (
    canonicalSourceRegistrationJson(
      actualCore as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      expected as unknown as SourceRegistrationJsonValue,
    )
  ) {
    fail(
      "source-registration audit top level does not match its sealed summary",
    );
  }
  if (
    summary.plan.planSha256 !== plan.planSha256.slice("sha256:".length) ||
    summary.targetSetSha256 !== summary.afterSnapshot.targetSetSha256 ||
    summary.targetSetSha256 !== sourceRegistrationApplyTargetSetSha256(plan)
  ) {
    fail("source-registration audit does not bind the supplied exact plan");
  }
  if (
    summary.rows.documentCreates !== 10 ||
    summary.rows.libraryAnalysisRecordCreates !== 10 ||
    summary.rows.controlledMutationAuditCreates !== 1 ||
    summary.rows.privateRecoveryRegisterWrites !== 0 ||
    summary.rows.corpusRegisterWrites !== 0 ||
    summary.rows.lifecycleEventWrites !== 0
  ) {
    fail(
      "source-registration audit mutation boundary is not the exact 10+10+1 prerequisite",
    );
  }
  return audit;
}

export function privateRecoveryDatabaseAuditBinding(input: {
  audit: SourceRegistrationControlledMutationAudit;
  sourceRegistrationPlan: SourceRegistrationPlan;
}): PrivateRecoveryDatabaseAuditBinding {
  const audit = validateSourceRegistrationDatabaseAudit(input);
  const summary = audit.mutationSummary;
  return databaseAuditBindingSchema.parse({
    auditId: audit.id,
    auditSha256: domainHash(DATABASE_AUDIT_HASH_DOMAIN, audit),
    operationKey: audit.operationKey,
    contractScope: audit.contractScope,
    contractSha256: `sha256:${audit.contractSha256}`,
    planSha256: `sha256:${audit.planSha256}`,
    beforeSnapshotSha256: `sha256:${audit.beforeSnapshotSha256}`,
    afterSnapshotSha256: `sha256:${audit.afterSnapshotSha256}`,
    dependencyStateSha256: `sha256:${audit.dependencyStateSha256}`,
    databaseIdentityUuid: audit.databaseIdentityUuid,
    targetFingerprintSha256: `sha256:${audit.targetFingerprintSha256}`,
    summarySha256: `sha256:${summary.summarySha256}`,
    recordedAt: audit.recordedAt ?? null,
    receiptState: summary.receiptState,
    exactDocumentRows: summary.rows.documentCreates,
    exactLibraryAnalysisRows: summary.rows.libraryAnalysisRecordCreates,
    controlledMutationAuditRows: summary.rows.controlledMutationAuditCreates,
  });
}

export function validatePrivateRecoveryDatabaseAuditBinding(input: {
  binding: PrivateRecoveryDatabaseAuditBinding;
  audit: unknown;
  sourceRegistrationPlan: SourceRegistrationPlan;
}): SourceRegistrationControlledMutationAudit {
  const audit = validateSourceRegistrationDatabaseAudit({
    audit: input.audit,
    sourceRegistrationPlan: input.sourceRegistrationPlan,
  });
  const expected = privateRecoveryDatabaseAuditBinding({
    audit,
    sourceRegistrationPlan: input.sourceRegistrationPlan,
  });
  if (canonical(expected) !== canonical(input.binding)) {
    fail("live source-registration audit differs from the plan binding");
  }
  return audit;
}

function receiptPathForTarget(targetId: string): string {
  const basename = targetId.replace(/^registration\./, "");
  if (!IDENTIFIER_PATTERN.test(basename)) fail(`unsafe target ID ${targetId}`);
  return `knowledge/corpus/source-acquisition-receipts/receipts/${basename}.private.${PRIVATE_RECOVERY_ACQUISITION_RECEIPT_DATE}.v1.json`;
}

function receiptIdForSource(sourceId: string): string {
  return `receipt.source.acquisition.${sourceId}.private.${PRIVATE_RECOVERY_ACQUISITION_RECEIPT_DATE}`;
}

function buildControlledPrivateReceipt(input: {
  targetId: string;
  lifecycleSourceId: string;
  row: PrivateRecoveryRow;
  copies: VerifiedPrivateCopyPair;
  manifestFileSha256: string;
  manifestReceiptSha256: string;
  observedAt: string;
}): ControlledPrivateAccessReceipt {
  return sealSourceAcquisitionReceipt({
    schemaVersion: SOURCE_ACQUISITION_RECEIPT_SCHEMA_VERSION,
    artifactType: "source_acquisition_receipt",
    receiptId: receiptIdForSource(input.lifecycleSourceId),
    receiptVersion: SOURCE_ACQUISITION_RECEIPT_VERSION,
    sourceId: input.lifecycleSourceId,
    acquisitionType: "controlled_private_access",
    requestedLocator: input.row.internalLocator,
    finalLocator: input.row.internalLocator,
    recoveryManifest: {
      manifestId: "corpus-private-recovery-candidates.v1",
      manifestVersion: "1.0.0",
      manifestPath: PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      manifestFileSha256: input.manifestFileSha256,
      manifestReceiptSha256: input.manifestReceiptSha256,
      entryId: `recovery.entry.${input.lifecycleSourceId}`,
      entryPath: input.copies.primary.portablePath,
      entryLocator: input.row.internalLocator,
      entryContentSha256: `sha256:${input.row.sha256}`,
      entrySizeBytes: input.row.sizeBytes,
    },
    content: {
      sizeBytes: input.row.sizeBytes,
      sha256: `sha256:${input.row.sha256}`,
    },
    copyAttestations: [input.copies.primary, input.copies.replica],
    twoCopyAttestation: {
      requiredCopyCount: 2,
      distinctStorageRoots: true,
      distinctFiles: true,
      contentHashesMatch: true,
      sizesMatch: true,
    },
    tool: {
      name: "private-recovery-acquisition-manager",
      version: PRIVATE_RECOVERY_ACQUISITION_VERSION,
      workflowRef: "workflow.source.acquisition.private-recovery",
      workflowVersion: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    },
    startedAt: input.observedAt,
    completedAt: input.observedAt,
  }) as ControlledPrivateAccessReceipt;
}

function validateCopyPair(input: {
  copies: VerifiedPrivateCopyPair;
  targetId: string;
  lifecycleSourceId: string;
  row: PrivateRecoveryRow;
}): VerifiedPrivateCopyPair {
  const copies = VerifiedPrivateCopyPairSchema.parse(input.copies);
  if (
    copies.targetId !== input.targetId ||
    copies.lifecycleSourceId !== input.lifecycleSourceId
  ) {
    fail(`${input.targetId}: private-copy target binding mismatch`);
  }
  if (
    copies.primary.storageRootId === copies.replica.storageRootId ||
    copies.primary.locator === copies.replica.locator
  ) {
    fail(`${input.targetId}: private copies do not name distinct roots/files`);
  }
  for (const copy of [copies.primary, copies.replica]) {
    if (
      copy.contentSha256 !== `sha256:${input.row.sha256}` ||
      copy.sizeBytes !== input.row.sizeBytes ||
      copy.portablePath !== `sha256/${input.row.sha256}.pdf`
    ) {
      fail(`${input.targetId}: private-copy content binding mismatch`);
    }
  }
  return copies;
}

function implementationBindings(
  values: PrivateRecoveryImplementationBinding[],
): PrivateRecoveryImplementationBinding[] {
  const parsed = z.array(implementationBindingSchema).length(10).parse(values);
  assertUnique(
    "implementation roles",
    parsed.map((entry) => entry.role),
  );
  assertUnique(
    "implementation paths",
    parsed.map((entry) => entry.path),
  );
  const expectedRoles = implementationRoleSchema.options.slice().sort();
  const actualRoles = parsed.map((entry) => entry.role).sort();
  if (actualRoles.join("\0") !== expectedRoles.join("\0")) {
    fail("implementation bindings do not cover the exact dependency set");
  }
  return parsed
    .slice()
    .sort((left, right) => left.role.localeCompare(right.role));
}

function operationKeyFor(input: {
  contractSha256: string;
  inputBindings: PrivateRecoveryAcquisitionPlanBody["inputBindings"];
  before: z.infer<typeof registerSnapshotSchema>;
  after: z.infer<typeof registerSnapshotSchema>;
  targets: z.infer<typeof plannedTargetSchema>[];
}): string {
  const digest = domainHash(OPERATION_HASH_DOMAIN, {
    contractScope: PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE,
    contractSha256: input.contractSha256,
    inputBindings: input.inputBindings,
    recoveryRegister: {
      beforeFileSha256: input.before.file.fileSha256,
      beforeManifestReceiptSha256: input.before.manifestReceiptSha256,
      beforeCount: input.before.candidateCount,
      afterFileSha256: input.after.file.fileSha256,
      afterManifestReceiptSha256: input.after.manifestReceiptSha256,
      afterCount: input.after.candidateCount,
    },
    targets: input.targets.map((target) => ({
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      recoveryRowSha256: target.recoveryRowSha256,
      privateCopies: target.privateCopies,
      acquisitionReceiptFile: target.acquisitionReceipt.file,
      acquisitionReceiptInternalSeal:
        target.acquisitionReceipt.internalReceiptSha256,
    })),
  });
  return `private-recovery-acquisition-v1:${digest.slice("sha256:".length)}`;
}

function sealApplyReceipt(
  body: z.infer<typeof applyReceiptBodySchema>,
): PrivateRecoveryAcquisitionApplyReceipt {
  const parsed = applyReceiptBodySchema.parse(body);
  return PrivateRecoveryAcquisitionApplyReceiptSchema.parse({
    ...parsed,
    receiptSha256: domainHash(APPLY_RECEIPT_HASH_DOMAIN, parsed),
  });
}

export function validatePrivateRecoveryAcquisitionApplyReceipt(
  value: unknown,
): PrivateRecoveryAcquisitionApplyReceipt {
  const receipt = PrivateRecoveryAcquisitionApplyReceiptSchema.parse(value);
  const { receiptSha256, ...body } = receipt;
  if (receiptSha256 !== domainHash(APPLY_RECEIPT_HASH_DOMAIN, body)) {
    fail("apply receipt self-hash mismatch");
  }
  if (receipt.contractSha256 !== privateRecoveryAcquisitionContractSha256()) {
    fail("apply receipt contract hash mismatch");
  }
  return receipt;
}

export function buildPrivateRecoveryAcquisitionPlan(input: {
  preparedAt: string;
  sourceRegistrationPlan: SourceRegistrationPlan;
  sourceRegistrationPlanBytes: Buffer;
  sourceRegistrationAudit: SourceRegistrationControlledMutationAudit;
  beforeRegister: PrivateRecoveryRegister;
  beforeRegisterBytes: Buffer;
  privateCopies: VerifiedPrivateCopyPair[];
  implementationBindings: PrivateRecoveryImplementationBinding[];
}): PrivateRecoveryAcquisitionPlan {
  const preparedAt = dateTimeSchema.parse(input.preparedAt);
  const sourcePlan = validateSourceRegistrationPlan(
    input.sourceRegistrationPlan,
  );
  if (
    sourcePlan.targets.length !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    sourcePlan.summary.pendingCount !==
      PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    sourcePlan.summary.privateRecoveryAppendCount !==
      PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    sourcePlan.targets.some(
      (target) =>
        target.state !== "pending" ||
        target.privateRecoveryState !== "pending_append" ||
        target.conflicts.length !== 0,
    )
  ) {
    fail("source-registration plan is not the exact ten-target pending set");
  }
  const sourcePlanFile = privateRecoveryFileBinding(
    PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
    input.sourceRegistrationPlanBytes,
  );
  const parsedPlanBytes = JSON.parse(
    input.sourceRegistrationPlanBytes.toString("utf8"),
  );
  if (canonical(parsedPlanBytes) !== canonical(sourcePlan)) {
    fail("source-registration plan bytes do not contain the supplied plan");
  }

  const audit = validateSourceRegistrationDatabaseAudit({
    audit: input.sourceRegistrationAudit,
    sourceRegistrationPlan: sourcePlan,
  });
  const before = validatePrivateRecoveryRegister(input.beforeRegister);
  if (before.candidates.length !== PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT) {
    fail("recovery-register baseline is not exactly 11 candidates");
  }
  const parsedBeforeBytes = JSON.parse(
    input.beforeRegisterBytes.toString("utf8"),
  );
  if (canonical(parsedBeforeBytes) !== canonical(before)) {
    fail("recovery-register bytes do not contain the supplied baseline");
  }
  if (!serializePrivateRecoveryJson(before).equals(input.beforeRegisterBytes)) {
    fail("recovery-register baseline is not in the controlled serialization");
  }

  const copiesByTarget = new Map(
    input.privateCopies.map((copies) => [copies.targetId, copies]),
  );
  if (
    input.privateCopies.length !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    copiesByTarget.size !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT
  ) {
    fail("private-copy verification must contain exactly ten unique targets");
  }
  const existingIdentityKeys = new Set(
    before.candidates.map((candidate) => candidate.identityKey),
  );
  const existingPaths = new Set(
    before.candidates.map((candidate) => candidate.canonicalPath),
  );
  const existingHashes = new Set(
    before.candidates.map((candidate) => candidate.sha256),
  );
  const appendRows = sourcePlan.targets.map((target) =>
    PrivateRecoveryRowSchema.parse(target.intendedPrivateRecoveryRow),
  );
  for (const row of appendRows) {
    if (
      existingIdentityKeys.has(row.identityKey) ||
      existingPaths.has(row.canonicalPath) ||
      existingHashes.has(row.sha256)
    ) {
      fail(
        `${row.identityKey}: recovery append collides with the 11-row baseline`,
      );
    }
  }
  assertUnique(
    "append identity keys",
    appendRows.map((row) => row.identityKey),
  );
  assertUnique(
    "append canonical paths",
    appendRows.map((row) => row.canonicalPath),
  );
  assertUnique(
    "append hashes",
    appendRows.map((row) => row.sha256),
  );

  const after = validatePrivateRecoveryRegister({
    ...before,
    candidates: [...before.candidates, ...appendRows],
  });
  const beforeBytes = serializePrivateRecoveryJson(before);
  const afterBytes = serializePrivateRecoveryJson(after);
  const beforeSnapshot = registerSnapshotSchema.parse({
    file: privateRecoveryFileBinding(
      PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      beforeBytes,
    ),
    candidateCount: before.candidates.length,
    manifestReceiptSha256: privateRecoveryManifestReceiptSha256(before),
    document: before,
  });
  const afterSnapshot = registerSnapshotSchema.parse({
    file: privateRecoveryFileBinding(
      PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      afterBytes,
    ),
    candidateCount: after.candidates.length,
    manifestReceiptSha256: privateRecoveryManifestReceiptSha256(after),
    document: after,
  });

  const targets = sourcePlan.targets.map((target, index) => {
    const row = appendRows[index]!;
    const rawCopies = copiesByTarget.get(target.targetId);
    if (!rawCopies)
      fail(`${target.targetId}: missing private-copy verification`);
    const copies = validateCopyPair({
      copies: rawCopies,
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      row,
    });
    const receipt = buildControlledPrivateReceipt({
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      row,
      copies,
      manifestFileSha256: afterSnapshot.file.fileSha256,
      manifestReceiptSha256: afterSnapshot.manifestReceiptSha256,
      observedAt: preparedAt,
    });
    const receiptBytes = serializePrivateRecoveryJson(receipt);
    return plannedTargetSchema.parse({
      targetId: target.targetId,
      canonicalIdentityKey: target.canonicalIdentityKey,
      lifecycleSourceId: target.lifecycleSourceId,
      recoveryRow: row,
      recoveryRowSha256: privateRecoveryRowSha256(row),
      privateCopies: copies,
      acquisitionReceipt: {
        file: privateRecoveryFileBinding(
          receiptPathForTarget(target.targetId),
          receiptBytes,
        ),
        internalReceiptSha256: receipt.receiptSha256,
        receipt,
      },
    });
  });

  const inputBindings = planBodySchema.shape.inputBindings.parse({
    sourceRegistrationPlan: {
      ...sourcePlanFile,
      planSha256: sourcePlan.planSha256,
      targetSetSha256: `sha256:${audit.mutationSummary.targetSetSha256}`,
    },
    sourceRegistrationApplyAudit: privateRecoveryDatabaseAuditBinding({
      audit,
      sourceRegistrationPlan: sourcePlan,
    }),
    implementation: implementationBindings(input.implementationBindings),
  });
  const contractSha256 = privateRecoveryAcquisitionContractSha256();
  const operationKey = operationKeyFor({
    contractSha256,
    inputBindings,
    before: beforeSnapshot,
    after: afterSnapshot,
    targets,
  });
  const applyReceipt = sealApplyReceipt({
    schemaVersion: PRIVATE_RECOVERY_ACQUISITION_APPLY_SCHEMA_VERSION,
    artifactType: "private_recovery_acquisition_apply_receipt",
    receiptVersion: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    receiptState: "exact_file_bundle_committed",
    contractScope: PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE,
    contractVersion: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    contractSha256,
    operationKey,
    sourceRegistrationPlan: {
      planSha256: sourcePlan.planSha256,
      fileSha256: sourcePlanFile.fileSha256,
      targetCount: 10,
    },
    sourceRegistrationApplyAudit: {
      auditId: inputBindings.sourceRegistrationApplyAudit.auditId,
      auditSha256: inputBindings.sourceRegistrationApplyAudit.auditSha256,
      summarySha256: inputBindings.sourceRegistrationApplyAudit.summarySha256,
      databaseIdentityUuid:
        inputBindings.sourceRegistrationApplyAudit.databaseIdentityUuid,
    },
    recoveryRegister: {
      path: PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      beforeFileSha256: beforeSnapshot.file.fileSha256,
      afterFileSha256: afterSnapshot.file.fileSha256,
      afterManifestReceiptSha256: afterSnapshot.manifestReceiptSha256,
      preservedCandidateCount: 11,
      appendedCandidateCount: 10,
      afterCandidateCount: 21,
    },
    controlledPrivateReceipts: targets.map((target) => ({
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      path: target.acquisitionReceipt.file.path,
      fileSha256: target.acquisitionReceipt.file.fileSha256,
      internalReceiptSha256: target.acquisitionReceipt.internalReceiptSha256,
    })),
    mutations: {
      privateRecoveryRowsAppended: 10,
      controlledPrivateReceiptFilesCreated: 10,
      applyReceiptFilesCreated: 1,
      databaseWrites: 0,
      corpusRegisterWrites: 0,
      lifecycleEventWrites: 0,
      rebaselineRuns: 0,
      sourceTextWrites: 0,
      fullTextReviewedChanges: 0,
    },
    boundaries: {
      existingCandidatesPreservedExactly: true,
      repositoryAvailableRemainsFalse: true,
      fullTextReviewedRemainsFalse: true,
      rightsStateRemainsPending: true,
      privateAbsolutePathsStored: false,
      sourceTextStored: false,
      humanValidationStillRequired: true,
      coveragePromotionAllowed: false,
    },
  });
  const applyReceiptBytes = serializePrivateRecoveryJson(applyReceipt);
  const body = planBodySchema.parse({
    schemaVersion: PRIVATE_RECOVERY_ACQUISITION_PLAN_SCHEMA_VERSION,
    artifactType: "private_recovery_acquisition_exact_plan",
    planVersion: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    contractScope: PRIVATE_RECOVERY_ACQUISITION_CONTRACT_SCOPE,
    contractVersion: PRIVATE_RECOVERY_ACQUISITION_VERSION,
    contractSha256,
    mode: "read_only_plan_with_explicit_apply_gate",
    preparedAt,
    operationKey,
    inputBindings,
    recoveryRegister: {
      path: PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      before: beforeSnapshot,
      after: afterSnapshot,
      appendCount: 10,
      existingCandidateCountPreserved: 11,
    },
    targets,
    applyReceipt: {
      file: privateRecoveryFileBinding(
        PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
        applyReceiptBytes,
      ),
      internalReceiptSha256: applyReceipt.receiptSha256,
      receipt: applyReceipt,
    },
    summary: {
      targetCount: 10,
      beforeCandidateCount: 11,
      appendedCandidateCount: 10,
      afterCandidateCount: 21,
      controlledPrivateReceiptCount: 10,
      databaseWrites: 0,
      rebaselineRuns: 0,
      sourceTextStored: false,
      privateAbsolutePathsStored: false,
      fullTextReviewedPromotions: 0,
    },
  });
  const plan = PrivateRecoveryAcquisitionPlanSchema.parse({
    ...body,
    planSha256: domainHash(PLAN_HASH_DOMAIN, body),
  });
  return validatePrivateRecoveryAcquisitionPlan(plan);
}

export function validatePrivateRecoveryAcquisitionPlan(
  value: unknown,
): PrivateRecoveryAcquisitionPlan {
  const plan = PrivateRecoveryAcquisitionPlanSchema.parse(value);
  const { planSha256, ...body } = plan;
  if (planSha256 !== domainHash(PLAN_HASH_DOMAIN, body)) {
    fail("plan self-hash mismatch");
  }
  if (plan.contractSha256 !== privateRecoveryAcquisitionContractSha256()) {
    fail("plan contract hash mismatch");
  }
  const implementations = implementationBindings(
    plan.inputBindings.implementation,
  );
  if (
    canonical(implementations) !== canonical(plan.inputBindings.implementation)
  ) {
    fail("implementation bindings must be sorted by role");
  }
  const before = validatePrivateRecoveryRegister(
    plan.recoveryRegister.before.document,
  );
  const after = validatePrivateRecoveryRegister(
    plan.recoveryRegister.after.document,
  );
  if (
    before.candidates.length !== PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT ||
    after.candidates.length !== PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT
  ) {
    fail("plan does not encode the exact 11 -> 21 recovery transition");
  }
  const beforeBytes = serializePrivateRecoveryJson(before);
  const afterBytes = serializePrivateRecoveryJson(after);
  const expectedBeforeFile = privateRecoveryFileBinding(
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
    beforeBytes,
  );
  const expectedAfterFile = privateRecoveryFileBinding(
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
    afterBytes,
  );
  if (
    canonical(expectedBeforeFile) !==
      canonical(plan.recoveryRegister.before.file) ||
    canonical(expectedAfterFile) !==
      canonical(plan.recoveryRegister.after.file) ||
    plan.recoveryRegister.before.manifestReceiptSha256 !==
      privateRecoveryManifestReceiptSha256(before) ||
    plan.recoveryRegister.after.manifestReceiptSha256 !==
      privateRecoveryManifestReceiptSha256(after)
  ) {
    fail("recovery-register file or manifest seal mismatch");
  }
  if (
    canonical(before.candidates) !==
    canonical(
      after.candidates.slice(0, PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT),
    )
  ) {
    fail("the existing 11 recovery candidates are not preserved exactly");
  }
  const appended = after.candidates.slice(
    PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT,
  );
  const sortedTargetIds = plan.targets
    .map((target) => target.targetId)
    .slice()
    .sort((left, right) => left.localeCompare(right));
  if (
    sortedTargetIds.join("\0") !==
    plan.targets.map((target) => target.targetId).join("\0")
  ) {
    fail("plan targets must be sorted by target ID");
  }
  assertUnique(
    "target lifecycle source IDs",
    plan.targets.map((target) => target.lifecycleSourceId),
  );
  assertUnique(
    "controlled-private receipt paths",
    plan.targets.map((target) => target.acquisitionReceipt.file.path),
  );
  plan.targets.forEach((target, index) => {
    const row = PrivateRecoveryRowSchema.parse(target.recoveryRow);
    const expectedRow = PrivateRecoveryRowSchema.parse(appended[index]);
    if (
      canonical(row) !== canonical(expectedRow) ||
      target.canonicalIdentityKey !== row.identityKey ||
      target.recoveryRowSha256 !== privateRecoveryRowSha256(row)
    ) {
      fail(`${target.targetId}: recovery row binding mismatch`);
    }
    validateCopyPair({
      copies: target.privateCopies,
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      row,
    });
    const receipt = validateSourceAcquisitionReceipt(
      target.acquisitionReceipt.receipt,
    );
    if (
      receipt.acquisitionType !== "controlled_private_access" ||
      receipt.sourceId !== target.lifecycleSourceId ||
      receipt.receiptId !== receiptIdForSource(target.lifecycleSourceId) ||
      target.acquisitionReceipt.file.path !==
        receiptPathForTarget(target.targetId) ||
      receipt.recoveryManifest.manifestFileSha256 !==
        plan.recoveryRegister.after.file.fileSha256 ||
      receipt.recoveryManifest.manifestReceiptSha256 !==
        plan.recoveryRegister.after.manifestReceiptSha256 ||
      receipt.recoveryManifest.entryId !==
        `recovery.entry.${target.lifecycleSourceId}` ||
      receipt.recoveryManifest.entryPath !==
        target.privateCopies.primary.portablePath ||
      canonical(receipt.copyAttestations) !==
        canonical([
          target.privateCopies.primary,
          target.privateCopies.replica,
        ]) ||
      receipt.receiptSha256 !== target.acquisitionReceipt.internalReceiptSha256
    ) {
      fail(`${target.targetId}: controlled-private receipt binding mismatch`);
    }
    const receiptFile = privateRecoveryFileBinding(
      target.acquisitionReceipt.file.path,
      serializePrivateRecoveryJson(receipt),
    );
    if (canonical(receiptFile) !== canonical(target.acquisitionReceipt.file)) {
      fail(`${target.targetId}: controlled-private receipt file seal mismatch`);
    }
  });
  const expectedOperationKey = operationKeyFor({
    contractSha256: plan.contractSha256,
    inputBindings: plan.inputBindings,
    before: plan.recoveryRegister.before,
    after: plan.recoveryRegister.after,
    targets: plan.targets,
  });
  if (plan.operationKey !== expectedOperationKey) {
    fail("operation key mismatch");
  }
  const applyReceipt = validatePrivateRecoveryAcquisitionApplyReceipt(
    plan.applyReceipt.receipt,
  );
  if (
    applyReceipt.operationKey !== plan.operationKey ||
    applyReceipt.receiptSha256 !== plan.applyReceipt.internalReceiptSha256
  ) {
    fail("apply receipt does not bind the exact plan operation");
  }
  const expectedApplyBindings = {
    sourceRegistrationPlan: {
      planSha256: plan.inputBindings.sourceRegistrationPlan.planSha256,
      fileSha256: plan.inputBindings.sourceRegistrationPlan.fileSha256,
      targetCount: 10,
    },
    sourceRegistrationApplyAudit: {
      auditId: plan.inputBindings.sourceRegistrationApplyAudit.auditId,
      auditSha256: plan.inputBindings.sourceRegistrationApplyAudit.auditSha256,
      summarySha256:
        plan.inputBindings.sourceRegistrationApplyAudit.summarySha256,
      databaseIdentityUuid:
        plan.inputBindings.sourceRegistrationApplyAudit.databaseIdentityUuid,
    },
    recoveryRegister: {
      path: PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
      beforeFileSha256: plan.recoveryRegister.before.file.fileSha256,
      afterFileSha256: plan.recoveryRegister.after.file.fileSha256,
      afterManifestReceiptSha256:
        plan.recoveryRegister.after.manifestReceiptSha256,
      preservedCandidateCount: 11,
      appendedCandidateCount: 10,
      afterCandidateCount: 21,
    },
    controlledPrivateReceipts: plan.targets.map((target) => ({
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      path: target.acquisitionReceipt.file.path,
      fileSha256: target.acquisitionReceipt.file.fileSha256,
      internalReceiptSha256: target.acquisitionReceipt.internalReceiptSha256,
    })),
  };
  if (
    canonical(applyReceipt.sourceRegistrationPlan) !==
      canonical(expectedApplyBindings.sourceRegistrationPlan) ||
    canonical(applyReceipt.sourceRegistrationApplyAudit) !==
      canonical(expectedApplyBindings.sourceRegistrationApplyAudit) ||
    canonical(applyReceipt.recoveryRegister) !==
      canonical(expectedApplyBindings.recoveryRegister) ||
    canonical(applyReceipt.controlledPrivateReceipts) !==
      canonical(expectedApplyBindings.controlledPrivateReceipts)
  ) {
    fail("apply receipt output/input bindings differ from the exact plan");
  }
  const expectedApplyFile = privateRecoveryFileBinding(
    plan.applyReceipt.file.path,
    serializePrivateRecoveryJson(applyReceipt),
  );
  if (canonical(expectedApplyFile) !== canonical(plan.applyReceipt.file)) {
    fail("apply receipt file seal mismatch");
  }
  assertNoPrivatePayload(plan);
  return plan;
}

export function privateRecoveryAcquisitionStrongAck(
  plan: PrivateRecoveryAcquisitionPlan,
): string {
  const parsed = validatePrivateRecoveryAcquisitionPlan(plan);
  return `APPLY_PRIVATE_RECOVERY_10_PLAN_${parsed.planSha256
    .slice("sha256:".length, "sha256:".length + 12)
    .toUpperCase()}`;
}

export function privateRecoveryAcquisitionOutputFiles(
  plan: PrivateRecoveryAcquisitionPlan,
): Array<{
  path: string;
  bytes: Buffer;
  kind: "receipt" | "register" | "commit";
}> {
  const parsed = validatePrivateRecoveryAcquisitionPlan(plan);
  return [
    ...parsed.targets.map((target) => ({
      path: target.acquisitionReceipt.file.path,
      bytes: serializePrivateRecoveryJson(target.acquisitionReceipt.receipt),
      kind: "receipt" as const,
    })),
    {
      path: parsed.recoveryRegister.path,
      bytes: serializePrivateRecoveryJson(
        parsed.recoveryRegister.after.document,
      ),
      kind: "register" as const,
    },
    {
      path: parsed.applyReceipt.file.path,
      bytes: serializePrivateRecoveryJson(parsed.applyReceipt.receipt),
      kind: "commit" as const,
    },
  ];
}
