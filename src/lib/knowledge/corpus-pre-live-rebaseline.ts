import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  existsSync,
  fchmodSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

import { z } from "zod";

export const CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION =
  "corpus-pre-live-rebaseline-v1" as const;
export const CORPUS_PRE_LIVE_REBASELINE_VERSION = "1.0.0" as const;
export const CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH =
  "knowledge/corpus/corpus-pre-live-rebaseline-history.v1.jsonl" as const;
export const CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH =
  "knowledge/corpus/corpus-pre-live-rebaseline-generation-manifest.v1.json" as const;
export const CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH =
  "knowledge/corpus/.corpus-pre-live-rebaseline-transaction.v1.json" as const;
export const CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH =
  "knowledge/corpus/.corpus-pre-live-rebaseline-transaction.v1.data" as const;
export const CORPUS_PRE_LIVE_REBASELINE_ACK_PREFIX =
  "APPLY_CORPUS_PRE_LIVE_REBASELINE_PLAN" as const;

const PLAN_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-plan:v1\0";
const DATABASE_OBSERVATION_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-database-observation:v1\0";
const DATABASE_STATE_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-database-state:v1\0";
const HISTORY_RECORD_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-history:v1\0";
const MANIFEST_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-manifest:v1\0";
const BINDING_SET_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-binding-set:v1\0";
const TRANSACTION_JOURNAL_HASH_DOMAIN =
  "food-systems-2026:corpus-pre-live-rebaseline-transaction-journal:v1\0";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const PREFIXED_SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const PORTABLE_PATH_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/;

export type RebaselineJson =
  | null
  | boolean
  | number
  | string
  | RebaselineJson[]
  | { [key: string]: RebaselineJson };

function normalize(value: unknown): RebaselineJson {
  if (value === null) return null;
  if (typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new Error("Canonical JSON rejects non-finite numbers");
    return value;
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right, "en"))
        .map(([key, child]) => [key, normalize(child)]),
    );
  }
  throw new Error(`Canonical JSON rejects ${typeof value}`);
}

export function canonicalCorpusPreLiveRebaselineJson(value: unknown): string {
  return JSON.stringify(normalize(value));
}

export function corpusPreLiveRebaselineSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function domainHash(domain: string, value: unknown): string {
  return corpusPreLiveRebaselineSha256(
    `${domain}${canonicalCorpusPreLiveRebaselineJson(value)}`,
  );
}

const portablePathSchema = z
  .string()
  .regex(PORTABLE_PATH_PATTERN)
  .superRefine((value, context) => {
    if (
      isAbsolute(value) ||
      value.includes("\\") ||
      value.split("/").some((part) => !part || part === "." || part === "..")
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected a normalized repository-relative path",
      });
    }
  });

const utcTimestampSchema = z
  .string()
  .datetime({ offset: true })
  .refine((value) => value.endsWith("Z"), "Expected a UTC timestamp");

export const CorpusPreLiveRebaselineFileBindingSchema = z
  .object({
    path: portablePathSchema,
    sha256: z.string().regex(SHA256_PATTERN),
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

export type CorpusPreLiveRebaselineFileBinding = z.infer<
  typeof CorpusPreLiveRebaselineFileBindingSchema
>;

export const CorpusPreLiveRebaselineSourceRegistrationBindingSchema = z
  .object({
    plan: z
      .object({
        path: portablePathSchema,
        fileSha256: z.string().regex(SHA256_PATTERN),
        planSha256: z.string().regex(SHA256_PATTERN),
        beforeSnapshotSha256: z.string().regex(SHA256_PATTERN),
      })
      .strict(),
    audit: z
      .object({
        auditId: z.string().min(1),
        operationKey: z.string().min(1),
        recordSha256: z.string().regex(SHA256_PATTERN),
        recordedAt: utcTimestampSchema,
        contractScope: z.string().min(1),
        contractSha256: z.string().regex(SHA256_PATTERN),
        planSha256: z.string().regex(SHA256_PATTERN),
        beforeSnapshotSha256: z.string().regex(SHA256_PATTERN),
        afterSnapshotSha256: z.string().regex(SHA256_PATTERN),
        mutationSummarySha256: z.string().regex(SHA256_PATTERN),
        databaseIdentityUuid: z.string().uuid(),
        receiptState: z.literal("exact_apply_committed"),
        rows: z
          .object({
            documentCreates: z.literal(10),
            libraryAnalysisRecordCreates: z.literal(10),
            controlledMutationAuditCreates: z.literal(1),
          })
          .strict(),
      })
      .strict(),
  })
  .strict();

export type CorpusPreLiveRebaselineSourceRegistrationBinding = z.infer<
  typeof CorpusPreLiveRebaselineSourceRegistrationBindingSchema
>;

const databaseObservationBodySchema = z
  .object({
    observedAt: utcTimestampSchema,
    transaction: z
      .object({
        isolationLevel: z.literal("RepeatableRead"),
        readOnly: z.literal(true),
        transactionReadOnlySetting: z.literal("on"),
        observationScope: z.literal(
          "source_registration_receipt_targets_core_counts_and_active_inventory",
        ),
      })
      .strict(),
    databaseIdentityUuid: z.string().uuid(),
    counts: z
      .object({
        documents: z.literal(1549),
        libraryAnalysisRecords: z.literal(1582),
        controlledMutationAudits: z.literal(1),
        activeLibraryLedgerRows: z.literal(1565),
      })
      .strict(),
    exactAfterState: z
      .object({
        targetCount: z.literal(10),
        exactDocumentTargets: z.literal(10),
        exactLibraryTargets: z.literal(10),
        dependencyRowCount: z.literal(0),
        exactReceiptedAuditCount: z.literal(1),
      })
      .strict(),
    sourceRegistration: CorpusPreLiveRebaselineSourceRegistrationBindingSchema,
    liveInventoryIdentityContentSetSha256: z.string().regex(SHA256_PATTERN),
    exportedLedgerSha256: z.string().regex(SHA256_PATTERN),
  })
  .strict();

export const CorpusPreLiveRebaselineDatabaseObservationSchema =
  databaseObservationBodySchema
    .extend({
      stateSha256: z.string().regex(SHA256_PATTERN),
      observationSha256: z.string().regex(SHA256_PATTERN),
    })
    .strict();

export type CorpusPreLiveRebaselineDatabaseObservation = z.infer<
  typeof CorpusPreLiveRebaselineDatabaseObservationSchema
>;

export function sealCorpusPreLiveRebaselineDatabaseObservation(
  body: z.input<typeof databaseObservationBodySchema>,
): CorpusPreLiveRebaselineDatabaseObservation {
  const parsed = databaseObservationBodySchema.parse(body);
  const { observedAt: _observedAt, ...state } = parsed;
  return CorpusPreLiveRebaselineDatabaseObservationSchema.parse({
    ...parsed,
    stateSha256: domainHash(DATABASE_STATE_HASH_DOMAIN, state),
    observationSha256: domainHash(DATABASE_OBSERVATION_HASH_DOMAIN, parsed),
  });
}

export function validateCorpusPreLiveRebaselineDatabaseObservation(
  value: unknown,
): CorpusPreLiveRebaselineDatabaseObservation {
  const parsed = CorpusPreLiveRebaselineDatabaseObservationSchema.parse(value);
  const { observationSha256, stateSha256, ...body } = parsed;
  if (
    observationSha256 !== domainHash(DATABASE_OBSERVATION_HASH_DOMAIN, body)
  ) {
    throw new Error(
      "Corpus pre-live rebaseline database observation self-hash mismatch",
    );
  }
  const { observedAt: _observedAt, ...state } = body;
  if (stateSha256 !== domainHash(DATABASE_STATE_HASH_DOMAIN, state)) {
    throw new Error(
      "Corpus pre-live rebaseline database state self-hash mismatch",
    );
  }
  if (
    parsed.sourceRegistration.plan.planSha256 !==
      parsed.sourceRegistration.audit.planSha256 ||
    parsed.sourceRegistration.plan.beforeSnapshotSha256 !==
      parsed.sourceRegistration.audit.beforeSnapshotSha256
  ) {
    throw new Error("Source-registration plan and audit bindings disagree");
  }
  return parsed;
}

const namedBootstrapBindingsSchema = z
  .object({
    baseline: CorpusPreLiveRebaselineFileBindingSchema,
    liveInventorySnapshot: CorpusPreLiveRebaselineFileBindingSchema,
    libraryLedger: CorpusPreLiveRebaselineFileBindingSchema,
    corpusRegister: CorpusPreLiveRebaselineFileBindingSchema,
    corpusGenerationManifest: CorpusPreLiveRebaselineFileBindingSchema,
    currentState: CorpusPreLiveRebaselineFileBindingSchema,
    currentStateGenerationManifest: CorpusPreLiveRebaselineFileBindingSchema,
    eventLog: CorpusPreLiveRebaselineFileBindingSchema,
    eventManifest: CorpusPreLiveRebaselineFileBindingSchema,
    anchorLog: CorpusPreLiveRebaselineFileBindingSchema,
  })
  .strict();

export type CorpusPreLiveRebaselineNamedBootstrapBindings = z.infer<
  typeof namedBootstrapBindingsSchema
>;

const safetyBoundarySchema = z
  .object({
    databaseMutationPerformed: z.literal(false),
    privateSourceReadPerformed: z.boolean(),
    privateSourceReadLimitedToExactAfterStateVerification: z.literal(true),
    privateSourceMutationPerformed: z.literal(false),
    lifecycleEventCreated: z.literal(false),
    trustedVerificationCreated: z.literal(false),
    externalAnchorBindingCreated: z.literal(false),
    identityVerified: z.literal(false),
    sourceAnalysisAllowed: z.literal(false),
    ownerReviewComplete: z.literal(false),
    rightsCleared: z.literal(false),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

const planBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION),
    artifactType: z.literal("corpus_pre_live_rebaseline_plan"),
    planVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_VERSION),
    planId: z.string().min(1),
    mode: z.literal("read_only_plan"),
    createdAt: utcTimestampSchema,
    newObservedAt: utcTimestampSchema,
    oldBootstrap: namedBootstrapBindingsSchema,
    currentExportedLedger: CorpusPreLiveRebaselineFileBindingSchema,
    sourceRegistration: CorpusPreLiveRebaselineSourceRegistrationBindingSchema,
    databaseObservation: CorpusPreLiveRebaselineDatabaseObservationSchema,
    compareAndSwapInputs: z
      .array(CorpusPreLiveRebaselineFileBindingSchema)
      .min(1),
    expectedAbsentPaths: z.array(portablePathSchema).length(2),
    proposedOutputs: z.array(CorpusPreLiveRebaselineFileBindingSchema).min(1),
    safetyBoundary: safetyBoundarySchema,
  })
  .strict();

export const CorpusPreLiveRebaselinePlanSchema = planBodySchema
  .extend({ planSha256: z.string().regex(SHA256_PATTERN) })
  .strict();

export type CorpusPreLiveRebaselinePlan = z.infer<
  typeof CorpusPreLiveRebaselinePlanSchema
>;

function sortedUniqueBindings(
  values: CorpusPreLiveRebaselineFileBinding[],
  label: string,
): CorpusPreLiveRebaselineFileBinding[] {
  const parsed = values.map((value) =>
    CorpusPreLiveRebaselineFileBindingSchema.parse(value),
  );
  const paths = parsed.map((value) => value.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error(`${label} contains duplicate paths`);
  }
  return parsed.sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );
}

export function sealCorpusPreLiveRebaselinePlan(
  body: z.input<typeof planBodySchema>,
): CorpusPreLiveRebaselinePlan {
  const parsed = planBodySchema.parse({
    ...body,
    compareAndSwapInputs: sortedUniqueBindings(
      body.compareAndSwapInputs,
      "Compare-and-swap inputs",
    ),
    proposedOutputs: sortedUniqueBindings(
      body.proposedOutputs,
      "Proposed outputs",
    ),
    expectedAbsentPaths: [...body.expectedAbsentPaths].sort((left, right) =>
      left.localeCompare(right, "en"),
    ),
  });
  return CorpusPreLiveRebaselinePlanSchema.parse({
    ...parsed,
    planSha256: domainHash(PLAN_HASH_DOMAIN, parsed),
  });
}

export function validateCorpusPreLiveRebaselinePlan(
  value: unknown,
): CorpusPreLiveRebaselinePlan {
  const parsed = CorpusPreLiveRebaselinePlanSchema.parse(value);
  const { planSha256, ...body } = parsed;
  const resealed = sealCorpusPreLiveRebaselinePlan(body);
  if (
    planSha256 !== resealed.planSha256 ||
    canonicalCorpusPreLiveRebaselineJson(parsed) !==
      canonicalCorpusPreLiveRebaselineJson(resealed)
  ) {
    throw new Error("Corpus pre-live rebaseline plan self-hash mismatch");
  }
  validateCorpusPreLiveRebaselineDatabaseObservation(
    parsed.databaseObservation,
  );
  if (
    canonicalCorpusPreLiveRebaselineJson(
      parsed.databaseObservation.sourceRegistration,
    ) !== canonicalCorpusPreLiveRebaselineJson(parsed.sourceRegistration) ||
    parsed.databaseObservation.exportedLedgerSha256 !==
      parsed.currentExportedLedger.sha256
  ) {
    throw new Error("Rebaseline plan database/ledger bindings disagree");
  }
  const historyOutputs = parsed.proposedOutputs.filter(
    (binding) => binding.path === CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
  );
  if (
    historyOutputs.length !== 1 ||
    parsed.proposedOutputs.some(
      (binding) => binding.path === CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
    )
  ) {
    throw new Error(
      "Rebaseline plan must write one sealed history output and reserve the final manifest for commit",
    );
  }
  if (
    parsed.expectedAbsentPaths[0] !==
      CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH ||
    parsed.expectedAbsentPaths[1] !== CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH
  ) {
    throw new Error(
      "Rebaseline plan must require absent history and manifest paths",
    );
  }
  const createdAt = Date.parse(parsed.createdAt);
  const newObservedAt = Date.parse(parsed.newObservedAt);
  const databaseObservedAt = Date.parse(parsed.databaseObservation.observedAt);
  if (
    newObservedAt > databaseObservedAt ||
    databaseObservedAt > createdAt ||
    createdAt - newObservedAt > 15 * 60 * 1000
  ) {
    throw new Error(
      "Rebaseline plan observation timestamps are not one fresh planning run",
    );
  }
  return parsed;
}

const historyRecordBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION),
    recordType: z.literal("corpus_pre_live_rebaseline_history"),
    rebaselineVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_VERSION),
    recordId: z.string().min(1),
    sequence: z.literal(1),
    predecessorRecordSha256: z.null(),
    observedAt: utcTimestampSchema,
    previousBootstrap: namedBootstrapBindingsSchema,
    nextBootstrap: namedBootstrapBindingsSchema,
    sourceRegistration: CorpusPreLiveRebaselineSourceRegistrationBindingSchema,
    currentExportedLedger: CorpusPreLiveRebaselineFileBindingSchema,
    safetyBoundary: safetyBoundarySchema,
    lineageMeaning: z.literal(
      "sealed_bootstrap_replacement_not_lifecycle_event_or_trusted_anchor",
    ),
  })
  .strict();

export const CorpusPreLiveRebaselineHistoryRecordSchema =
  historyRecordBodySchema
    .extend({ recordSha256: z.string().regex(PREFIXED_SHA256_PATTERN) })
    .strict();

export type CorpusPreLiveRebaselineHistoryRecord = z.infer<
  typeof CorpusPreLiveRebaselineHistoryRecordSchema
>;

export function sealCorpusPreLiveRebaselineHistoryRecord(
  body: z.input<typeof historyRecordBodySchema>,
): CorpusPreLiveRebaselineHistoryRecord {
  const parsed = historyRecordBodySchema.parse(body);
  return CorpusPreLiveRebaselineHistoryRecordSchema.parse({
    ...parsed,
    recordSha256: `sha256:${domainHash(HISTORY_RECORD_HASH_DOMAIN, parsed)}`,
  });
}

export function validateCorpusPreLiveRebaselineHistoryRecord(
  value: unknown,
): CorpusPreLiveRebaselineHistoryRecord {
  const parsed = CorpusPreLiveRebaselineHistoryRecordSchema.parse(value);
  const { recordSha256, ...body } = parsed;
  if (
    recordSha256 !== `sha256:${domainHash(HISTORY_RECORD_HASH_DOMAIN, body)}`
  ) {
    throw new Error("Corpus pre-live rebaseline history self-hash mismatch");
  }
  if (
    canonicalCorpusPreLiveRebaselineJson(parsed.currentExportedLedger) !==
    canonicalCorpusPreLiveRebaselineJson(parsed.nextBootstrap.libraryLedger)
  ) {
    throw new Error(
      "Corpus pre-live rebaseline history ledger lineage mismatch",
    );
  }
  return parsed;
}

const commitManifestBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION),
    artifactType: z.literal("corpus_pre_live_rebaseline_commit_manifest"),
    manifestVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_VERSION),
    manifestId: z.literal("corpus-pre-live-rebaseline-generation-manifest.v1"),
    committedAt: utcTimestampSchema,
    newObservedAt: utcTimestampSchema,
    planSha256: z.string().regex(SHA256_PATTERN),
    databaseObservationSha256: z.string().regex(SHA256_PATTERN),
    databaseStateSha256: z.string().regex(SHA256_PATTERN),
    historyRecordSha256: z.string().regex(PREFIXED_SHA256_PATTERN),
    compareAndSwapInputSetSha256: z.string().regex(SHA256_PATTERN),
    inputs: z.array(CorpusPreLiveRebaselineFileBindingSchema).min(1),
    outputs: z.array(CorpusPreLiveRebaselineFileBindingSchema).min(1),
    safetyBoundary: safetyBoundarySchema,
    commitMarkerSemantics: z.literal(
      "recoverable_journaled_bundle_with_durable_backups_per_file_atomic_rename_and_manifest_last",
    ),
    externalAnchorNextStep: z.literal(
      "prepare_new_external_request_against_new_baseline_register_generation_manifest_and_genesis_candidate",
    ),
  })
  .strict();

export const CorpusPreLiveRebaselineCommitManifestSchema =
  commitManifestBodySchema
    .extend({ manifestSha256: z.string().regex(PREFIXED_SHA256_PATTERN) })
    .strict();

export type CorpusPreLiveRebaselineCommitManifest = z.infer<
  typeof CorpusPreLiveRebaselineCommitManifestSchema
>;

export function sealCorpusPreLiveRebaselineCommitManifest(
  body: z.input<typeof commitManifestBodySchema>,
): CorpusPreLiveRebaselineCommitManifest {
  const parsed = commitManifestBodySchema.parse({
    ...body,
    inputs: sortedUniqueBindings(body.inputs, "Commit-manifest inputs"),
    outputs: sortedUniqueBindings(body.outputs, "Commit-manifest outputs"),
  });
  return CorpusPreLiveRebaselineCommitManifestSchema.parse({
    ...parsed,
    manifestSha256: `sha256:${domainHash(MANIFEST_HASH_DOMAIN, parsed)}`,
  });
}

export function validateCorpusPreLiveRebaselineCommitManifest(
  value: unknown,
): CorpusPreLiveRebaselineCommitManifest {
  const parsed = CorpusPreLiveRebaselineCommitManifestSchema.parse(value);
  const { manifestSha256, ...body } = parsed;
  const resealed = sealCorpusPreLiveRebaselineCommitManifest(body);
  if (
    manifestSha256 !== resealed.manifestSha256 ||
    canonicalCorpusPreLiveRebaselineJson(parsed) !==
      canonicalCorpusPreLiveRebaselineJson(resealed)
  ) {
    throw new Error(
      "Corpus pre-live rebaseline commit manifest self-hash mismatch",
    );
  }
  return parsed;
}

export type CorpusPreLiveRebaselineOutput = {
  path: string;
  content: string;
};

const transactionEntrySchema = z
  .object({
    path: portablePathSchema,
    before: CorpusPreLiveRebaselineFileBindingSchema.nullable(),
    beforeMode: z.number().int().min(0).max(0o777).nullable(),
    after: CorpusPreLiveRebaselineFileBindingSchema,
    afterMode: z.number().int().min(0).max(0o777),
    stagedPath: portablePathSchema,
    backupPath: portablePathSchema.nullable(),
  })
  .strict();

const transactionJournalBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION),
    artifactType: z.literal("corpus_pre_live_rebaseline_transaction_journal"),
    transactionVersion: z.literal(CORPUS_PRE_LIVE_REBASELINE_VERSION),
    phase: z.enum(["staging", "prepared"]),
    createdAt: utcTimestampSchema,
    planSha256: z.string().regex(SHA256_PATTERN),
    finalManifestSha256: z.string().regex(PREFIXED_SHA256_PATTERN),
    entries: z.array(transactionEntrySchema).min(2),
  })
  .strict();

export const CorpusPreLiveRebaselineTransactionJournalSchema =
  transactionJournalBodySchema
    .extend({ journalSha256: z.string().regex(PREFIXED_SHA256_PATTERN) })
    .strict();

export type CorpusPreLiveRebaselineTransactionJournal = z.infer<
  typeof CorpusPreLiveRebaselineTransactionJournalSchema
>;

function sealTransactionJournal(
  body: z.input<typeof transactionJournalBodySchema>,
): CorpusPreLiveRebaselineTransactionJournal {
  const parsed = transactionJournalBodySchema.parse(body);
  const paths = parsed.entries.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error(
      "Corpus rebaseline transaction journal has duplicate targets",
    );
  }
  for (const entry of parsed.entries) {
    if (
      entry.after.path !== entry.path ||
      (entry.before !== null && entry.before.path !== entry.path) ||
      (entry.before === null) !== (entry.backupPath === null) ||
      (entry.before === null) !== (entry.beforeMode === null)
    ) {
      throw new Error(
        "Corpus rebaseline transaction journal entry is inconsistent",
      );
    }
  }
  if (
    parsed.entries.at(-1)?.path !== CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH
  ) {
    throw new Error(
      "Corpus rebaseline transaction manifest entry must be last",
    );
  }
  return CorpusPreLiveRebaselineTransactionJournalSchema.parse({
    ...parsed,
    journalSha256: `sha256:${domainHash(TRANSACTION_JOURNAL_HASH_DOMAIN, parsed)}`,
  });
}

export function validateCorpusPreLiveRebaselineTransactionJournal(
  value: unknown,
): CorpusPreLiveRebaselineTransactionJournal {
  const parsed = CorpusPreLiveRebaselineTransactionJournalSchema.parse(value);
  const { journalSha256, ...body } = parsed;
  const resealed = sealTransactionJournal(body);
  if (resealed.journalSha256 !== journalSha256) {
    throw new Error("Corpus rebaseline transaction journal self-hash mismatch");
  }
  return parsed;
}

export function corpusPreLiveRebaselineFileBinding(
  path: string,
  content: string | Buffer,
): CorpusPreLiveRebaselineFileBinding {
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, "utf8");
  return CorpusPreLiveRebaselineFileBindingSchema.parse({
    path,
    sha256: corpusPreLiveRebaselineSha256(bytes),
    sizeBytes: bytes.length,
  });
}

export function corpusPreLiveRebaselineBindingSetSha256(
  bindings: CorpusPreLiveRebaselineFileBinding[],
): string {
  return domainHash(
    BINDING_SET_HASH_DOMAIN,
    sortedUniqueBindings(bindings, "Binding set"),
  );
}

function projectFile(root: string, path: string): string {
  portablePathSchema.parse(path);
  const target = resolve(root, path);
  const resolvedRoot = resolve(root);
  if (target !== resolvedRoot && !target.startsWith(`${resolvedRoot}/`)) {
    throw new Error(`Rebaseline path escaped repository root: ${path}`);
  }
  const rootStat = lstatSync(resolvedRoot);
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink()) {
    throw new Error("Corpus rebaseline root is not a regular directory");
  }
  let ancestor = resolvedRoot;
  const parentRelative = relative(resolvedRoot, dirname(target));
  for (const part of parentRelative ? parentRelative.split(sep) : []) {
    ancestor = resolve(ancestor, part);
    if (!existsSync(ancestor)) break;
    const stat = lstatSync(ancestor);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(
        `Corpus rebaseline path has a symlinked or non-directory ancestor: ${path}`,
      );
    }
  }
  return target;
}

export function readCorpusPreLiveRebaselineFileBinding(
  root: string,
  path: string,
): CorpusPreLiveRebaselineFileBinding {
  const target = projectFile(root, path);
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Rebaseline input is not a regular file: ${path}`);
  }
  return corpusPreLiveRebaselineFileBinding(path, readFileSync(target));
}

export function assertCorpusPreLiveRebaselineBindingsCurrent(
  root: string,
  bindings: CorpusPreLiveRebaselineFileBinding[],
): void {
  for (const binding of sortedUniqueBindings(bindings, "CAS inputs")) {
    const observed = readCorpusPreLiveRebaselineFileBinding(root, binding.path);
    if (
      observed.sha256 !== binding.sha256 ||
      observed.sizeBytes !== binding.sizeBytes
    ) {
      throw new Error(`Corpus rebaseline CAS input drifted: ${binding.path}`);
    }
  }
}

export function assertCorpusPreLiveRebaselinePathsAbsent(
  root: string,
  paths: string[],
): void {
  for (const path of paths) {
    if (existsSync(projectFile(root, path))) {
      throw new Error(
        `Corpus rebaseline history/trust already exists: ${path}`,
      );
    }
  }
}

export function corpusPreLiveRebaselineApplyAcknowledgement(
  planSha256: string,
): string {
  if (!SHA256_PATTERN.test(planSha256)) throw new Error("Invalid plan SHA-256");
  return `${CORPUS_PRE_LIVE_REBASELINE_ACK_PREFIX}_${planSha256.toUpperCase()}`;
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

export function corpusPreLiveRebaselineHistoryContent(
  record: CorpusPreLiveRebaselineHistoryRecord,
): string {
  return `${JSON.stringify(validateCorpusPreLiveRebaselineHistoryRecord(record))}\n`;
}

export function corpusPreLiveRebaselineManifestContent(
  manifest: CorpusPreLiveRebaselineCommitManifest,
): string {
  return prettyJson(validateCorpusPreLiveRebaselineCommitManifest(manifest));
}

function assertOutputMatchesPlan(
  plan: CorpusPreLiveRebaselinePlan,
  outputs: CorpusPreLiveRebaselineOutput[],
): void {
  const observed = sortedUniqueBindings(
    outputs.map((output) =>
      corpusPreLiveRebaselineFileBinding(output.path, output.content),
    ),
    "Staged outputs",
  );
  const planned = sortedUniqueBindings(plan.proposedOutputs, "Planned outputs");
  if (
    canonicalCorpusPreLiveRebaselineJson(observed) !==
    canonicalCorpusPreLiveRebaselineJson(planned)
  ) {
    throw new Error(
      "Staged corpus rebaseline outputs differ from the sealed plan",
    );
  }
}

function writeDurableExclusive(
  path: string,
  content: string | Buffer,
  mode = 0o600,
): void {
  const descriptor = openSync(path, "wx", mode);
  try {
    writeFileSync(descriptor, content);
    fchmodSync(descriptor, mode);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function fsyncDirectory(path: string): void {
  const descriptor = openSync(path, "r");
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function journalContent(
  journal: CorpusPreLiveRebaselineTransactionJournal,
): string {
  return prettyJson(validateCorpusPreLiveRebaselineTransactionJournal(journal));
}

function readOptionalBinding(
  root: string,
  path: string,
): CorpusPreLiveRebaselineFileBinding | null {
  const target = projectFile(root, path);
  if (!existsSync(target)) return null;
  return readCorpusPreLiveRebaselineFileBinding(root, path);
}

type OptionalFileState = {
  binding: CorpusPreLiveRebaselineFileBinding;
  mode: number;
} | null;

function readOptionalFileState(root: string, path: string): OptionalFileState {
  const target = projectFile(root, path);
  if (!existsSync(target)) return null;
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Rebaseline target is not a regular file: ${path}`);
  }
  return {
    binding: corpusPreLiveRebaselineFileBinding(path, readFileSync(target)),
    mode: stat.mode & 0o777,
  };
}

function sameBinding(
  left: CorpusPreLiveRebaselineFileBinding | null,
  right: CorpusPreLiveRebaselineFileBinding | null,
): boolean {
  return (
    canonicalCorpusPreLiveRebaselineJson(left) ===
    canonicalCorpusPreLiveRebaselineJson(right)
  );
}

function sameFileState(
  observed: OptionalFileState,
  binding: CorpusPreLiveRebaselineFileBinding | null,
  mode: number | null,
): boolean {
  if (observed === null || binding === null || mode === null) {
    return observed === null && binding === null && mode === null;
  }
  return sameBinding(observed.binding, binding) && observed.mode === mode;
}

function transactionJournalPath(root: string): string {
  return projectFile(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH);
}

function transactionJournalTemporaryPath(root: string): string {
  return `${transactionJournalPath(root)}.tmp`;
}

function transactionDataPath(root: string): string {
  return projectFile(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH);
}

function replaceJournalDurably(
  root: string,
  journal: CorpusPreLiveRebaselineTransactionJournal,
): void {
  const target = transactionJournalPath(root);
  const temporary = transactionJournalTemporaryPath(root);
  if (existsSync(temporary)) {
    throw new Error("Refusing stale corpus rebaseline journal temporary file");
  }
  writeDurableExclusive(temporary, journalContent(journal));
  fsyncDirectory(dirname(target));
  renameSync(temporary, target);
  fsyncDirectory(dirname(target));
}

function readTransactionJournal(
  root: string,
): CorpusPreLiveRebaselineTransactionJournal {
  const path = transactionJournalPath(root);
  const stat = lstatSync(path);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    (stat.mode & 0o777) !== 0o600
  ) {
    throw new Error(
      "Corpus rebaseline transaction journal is not a regular mode-0600 file",
    );
  }
  return validateCorpusPreLiveRebaselineTransactionJournal(
    JSON.parse(readFileSync(path, "utf8")),
  );
}

function removeRegularIfPresent(path: string, label: string): void {
  if (!existsSync(path)) return;
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${label} is not a regular file`);
  }
  unlinkSync(path);
  fsyncDirectory(dirname(path));
}

function assertTransactionFilesKnown(
  root: string,
  journal: CorpusPreLiveRebaselineTransactionJournal,
): void {
  const dataPath = transactionDataPath(root);
  for (const [path, label] of [
    [
      transactionJournalTemporaryPath(root),
      "Transaction journal temporary file",
    ],
    [transactionJournalPath(root), "Transaction journal"],
  ] as const) {
    if (!existsSync(path)) continue;
    const stat = lstatSync(path);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`${label} is not a regular file`);
    }
  }
  if (!existsSync(dataPath)) return;
  const stat = lstatSync(dataPath);
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    (stat.mode & 0o777) !== 0o700
  ) {
    throw new Error(
      "Corpus rebaseline transaction data path is not a mode-0700 directory",
    );
  }
  const expectedNames = new Set(
    journal.entries.flatMap((entry) => [
      basename(projectFile(root, entry.stagedPath)),
      ...(entry.backupPath === null
        ? []
        : [basename(projectFile(root, entry.backupPath))]),
    ]),
  );
  const actualNames = readdirSync(dataPath);
  const unexpectedNames = actualNames.filter(
    (name) => !expectedNames.has(name),
  );
  if (unexpectedNames.length > 0) {
    throw new Error(
      `Corpus rebaseline transaction data contains unexpected files: ${unexpectedNames.join(", ")}`,
    );
  }
  for (const name of actualNames) {
    const path = resolve(dataPath, name);
    const entryStat = lstatSync(path);
    if (!entryStat.isFile() || entryStat.isSymbolicLink()) {
      throw new Error(
        `Corpus rebaseline transaction data entry is not a regular file: ${name}`,
      );
    }
  }
}

function cleanTransactionFiles(
  root: string,
  journal: CorpusPreLiveRebaselineTransactionJournal,
): void {
  assertTransactionFilesKnown(root, journal);
  const dataPath = transactionDataPath(root);
  if (existsSync(dataPath)) {
    for (const entry of journal.entries) {
      removeRegularIfPresent(
        projectFile(root, entry.stagedPath),
        "Staged transaction file",
      );
      if (entry.backupPath !== null) {
        removeRegularIfPresent(
          projectFile(root, entry.backupPath),
          "Transaction backup",
        );
      }
    }
    const leftovers = readdirSync(dataPath);
    if (leftovers.length > 0)
      throw new Error("Corpus rebaseline transaction cleanup is incomplete");
    rmdirSync(dataPath);
    fsyncDirectory(dirname(dataPath));
  }
  removeRegularIfPresent(
    transactionJournalTemporaryPath(root),
    "Transaction journal temporary file",
  );
  removeRegularIfPresent(transactionJournalPath(root), "Transaction journal");
}

function assertBackupMatches(
  root: string,
  entry: CorpusPreLiveRebaselineTransactionJournal["entries"][number],
): Buffer {
  if (entry.before === null || entry.backupPath === null) {
    throw new Error(`Transaction entry has no backup: ${entry.path}`);
  }
  const backupPath = projectFile(root, entry.backupPath);
  const stat = lstatSync(backupPath);
  if (
    !stat.isFile() ||
    stat.isSymbolicLink() ||
    (stat.mode & 0o777) !== 0o600
  ) {
    throw new Error(`Corpus rebaseline backup is not mode 0600: ${entry.path}`);
  }
  const backup = readFileSync(backupPath);
  const observed = corpusPreLiveRebaselineFileBinding(entry.path, backup);
  if (!sameBinding(observed, entry.before)) {
    throw new Error(`Corpus rebaseline backup drifted: ${entry.path}`);
  }
  return backup;
}

function rollbackTransaction(
  root: string,
  journal: CorpusPreLiveRebaselineTransactionJournal,
): void {
  for (const entry of journal.entries) {
    const observed = readOptionalFileState(root, entry.path);
    if (
      !sameFileState(observed, entry.before, entry.beforeMode) &&
      !sameFileState(observed, entry.after, entry.afterMode)
    ) {
      throw new Error(
        `Corpus rebaseline recovery found an unexpected target state: ${entry.path}`,
      );
    }
    if (entry.before !== null) assertBackupMatches(root, entry);
  }
  for (const entry of [...journal.entries].reverse()) {
    const observed = readOptionalFileState(root, entry.path);
    if (
      !sameFileState(observed, entry.before, entry.beforeMode) &&
      !sameFileState(observed, entry.after, entry.afterMode)
    ) {
      throw new Error(
        `Corpus rebaseline recovery found an unexpected target state: ${entry.path}`,
      );
    }
    if (sameFileState(observed, entry.before, entry.beforeMode)) continue;
    const target = projectFile(root, entry.path);
    if (entry.before === null) {
      unlinkSync(target);
      fsyncDirectory(dirname(target));
      continue;
    }
    const backup = assertBackupMatches(root, entry);
    const restore = resolve(
      dirname(target),
      `.${basename(target)}.${process.pid}.rebaseline-restore.tmp`,
    );
    if (existsSync(restore)) {
      throw new Error(
        `Refusing stale corpus rebaseline restore file: ${entry.path}`,
      );
    }
    writeDurableExclusive(restore, backup, entry.beforeMode!);
    fsyncDirectory(dirname(target));
    renameSync(restore, target);
    fsyncDirectory(dirname(target));
  }
  for (const entry of journal.entries) {
    if (
      !sameFileState(
        readOptionalFileState(root, entry.path),
        entry.before,
        entry.beforeMode,
      )
    ) {
      throw new Error(
        `Corpus rebaseline rollback verification failed: ${entry.path}`,
      );
    }
  }
}

export function corpusPreLiveRebaselineRecoveryAcknowledgement(
  journalSha256: string,
): string {
  if (!PREFIXED_SHA256_PATTERN.test(journalSha256)) {
    throw new Error("Invalid transaction journal SHA-256");
  }
  return `RECOVER_CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_${journalSha256
    .slice("sha256:".length)
    .toUpperCase()}`;
}

function recoverTransactionWithoutAcknowledgement(
  root: string,
): "rolled_back" | "completed" {
  const journal = readTransactionJournal(root);
  assertTransactionFilesKnown(root, journal);
  const observed = journal.entries.map((entry) =>
    readOptionalFileState(root, entry.path),
  );
  const allBefore = journal.entries.every((entry, index) =>
    sameFileState(observed[index]!, entry.before, entry.beforeMode),
  );
  const allAfter = journal.entries.every((entry, index) =>
    sameFileState(observed[index]!, entry.after, entry.afterMode),
  );
  const manifestIndex = journal.entries.length - 1;
  const manifestInstalled = sameFileState(
    observed[manifestIndex]!,
    journal.entries[manifestIndex]!.after,
    journal.entries[manifestIndex]!.afterMode,
  );

  if (journal.phase === "staging") {
    if (!allBefore) {
      throw new Error(
        "A staging-phase corpus rebaseline journal has a changed target; automatic recovery is unsafe",
      );
    }
    cleanTransactionFiles(root, journal);
    return "rolled_back";
  }
  if (manifestInstalled) {
    if (!allAfter) {
      throw new Error(
        "Corpus rebaseline manifest is installed but the bundle is incomplete; recovery refuses ambiguous state",
      );
    }
    cleanTransactionFiles(root, journal);
    return "completed";
  }
  for (const [index, entry] of journal.entries.entries()) {
    const state = observed[index]!;
    if (
      !sameFileState(state, entry.before, entry.beforeMode) &&
      !sameFileState(state, entry.after, entry.afterMode)
    ) {
      throw new Error(
        `Corpus rebaseline recovery found an unexpected target state: ${entry.path}`,
      );
    }
    if (entry.before !== null) assertBackupMatches(root, entry);
  }
  rollbackTransaction(root, journal);
  cleanTransactionFiles(root, journal);
  return "rolled_back";
}

export function recoverCorpusPreLiveRebaselineTransaction(input: {
  root: string;
  acknowledgement: string;
}): "none" | "rolled_back" | "completed" {
  const root = rootOrThrow(input.root);
  if (!existsSync(transactionJournalPath(root))) return "none";
  const journal = readTransactionJournal(root);
  if (
    input.acknowledgement !==
    corpusPreLiveRebaselineRecoveryAcknowledgement(journal.journalSha256)
  ) {
    throw new Error(
      "Exact corpus rebaseline recovery acknowledgement is missing",
    );
  }
  return recoverTransactionWithoutAcknowledgement(root);
}

export class CorpusPreLiveRebaselineSimulatedCrash extends Error {}

export type CorpusPreLiveRebaselineFaultPoint =
  | "journal_staging_durable"
  | "staging_complete"
  | "journal_prepared_durable"
  | `target_renamed:${string}`;

export async function commitCorpusPreLiveRebaseline(input: {
  root: string;
  plan: CorpusPreLiveRebaselinePlan;
  acknowledgement: string;
  outputs: CorpusPreLiveRebaselineOutput[];
  finalManifest: CorpusPreLiveRebaselineCommitManifest;
  revalidateDatabaseObservation: () => Promise<CorpusPreLiveRebaselineDatabaseObservation>;
  testFaultInjector?: (point: CorpusPreLiveRebaselineFaultPoint) => void;
}): Promise<void> {
  const root = rootOrThrow(input.root);
  if (existsSync(transactionJournalPath(root))) {
    const journal = readTransactionJournal(root);
    throw new Error(
      `Corpus rebaseline recovery is required before apply: ${corpusPreLiveRebaselineRecoveryAcknowledgement(
        journal.journalSha256,
      )}`,
    );
  }
  if (
    existsSync(transactionDataPath(root)) ||
    existsSync(transactionJournalTemporaryPath(root))
  ) {
    throw new Error(
      "Orphan corpus rebaseline transaction data requires manual inspection",
    );
  }
  const plan = validateCorpusPreLiveRebaselinePlan(input.plan);
  if (
    input.acknowledgement !==
    corpusPreLiveRebaselineApplyAcknowledgement(plan.planSha256)
  ) {
    throw new Error("Exact corpus rebaseline plan acknowledgement is missing");
  }
  assertOutputMatchesPlan(plan, input.outputs);
  const finalManifest = validateCorpusPreLiveRebaselineCommitManifest(
    input.finalManifest,
  );
  if (
    finalManifest.planSha256 !== plan.planSha256 ||
    finalManifest.databaseObservationSha256 !==
      plan.databaseObservation.observationSha256 ||
    finalManifest.databaseStateSha256 !==
      plan.databaseObservation.stateSha256 ||
    finalManifest.newObservedAt !== plan.newObservedAt
  ) {
    throw new Error(
      "Final corpus rebaseline manifest differs from the sealed plan",
    );
  }
  if (
    canonicalCorpusPreLiveRebaselineJson(finalManifest.inputs) !==
      canonicalCorpusPreLiveRebaselineJson(plan.compareAndSwapInputs) ||
    canonicalCorpusPreLiveRebaselineJson(finalManifest.outputs) !==
      canonicalCorpusPreLiveRebaselineJson(plan.proposedOutputs) ||
    finalManifest.compareAndSwapInputSetSha256 !==
      corpusPreLiveRebaselineBindingSetSha256(plan.compareAndSwapInputs) ||
    canonicalCorpusPreLiveRebaselineJson(finalManifest.safetyBoundary) !==
      canonicalCorpusPreLiveRebaselineJson(plan.safetyBoundary)
  ) {
    throw new Error(
      "Final corpus rebaseline manifest input/output bindings drifted",
    );
  }
  const historyOutput = input.outputs.find(
    (output) => output.path === CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
  );
  if (!historyOutput) {
    throw new Error("Corpus rebaseline history output is missing");
  }
  const historyRecords = historyOutput.content.trimEnd().split("\n");
  if (historyRecords.length !== 1 || !historyOutput.content.endsWith("\n")) {
    throw new Error(
      "Corpus rebaseline history must contain exactly one JSONL record",
    );
  }
  const historyRecord = validateCorpusPreLiveRebaselineHistoryRecord(
    JSON.parse(historyRecords[0]!),
  );
  if (historyRecord.recordSha256 !== finalManifest.historyRecordSha256) {
    throw new Error("Final corpus rebaseline manifest history binding drifted");
  }
  assertCorpusPreLiveRebaselinePathsAbsent(root, [...plan.expectedAbsentPaths]);
  assertCorpusPreLiveRebaselineBindingsCurrent(root, plan.compareAndSwapInputs);
  const allOutputs = [
    ...input.outputs,
    {
      path: CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
      content: corpusPreLiveRebaselineManifestContent(finalManifest),
    },
  ];
  const casByPath = new Map(
    plan.compareAndSwapInputs.map((binding) => [binding.path, binding]),
  );
  const expectedAbsent = new Set(plan.expectedAbsentPaths);
  const entries = allOutputs.map((output, index) => {
    const beforeState = readOptionalFileState(root, output.path);
    const before = beforeState?.binding ?? null;
    const beforeMode = beforeState?.mode ?? null;
    if (before === null) {
      if (!expectedAbsent.has(output.path)) {
        throw new Error(
          `Corpus rebaseline output is absent but not sealed absent: ${output.path}`,
        );
      }
    } else if (!sameBinding(before, casByPath.get(output.path) ?? null)) {
      throw new Error(
        `Corpus rebaseline output lacks an exact CAS binding: ${output.path}`,
      );
    }
    const stem = index.toString().padStart(4, "0");
    return {
      path: output.path,
      before,
      beforeMode,
      after: corpusPreLiveRebaselineFileBinding(output.path, output.content),
      afterMode: beforeMode ?? 0o644,
      stagedPath: `${CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH}/${stem}.next`,
      backupPath:
        before === null
          ? null
          : `${CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH}/${stem}.before`,
    };
  });
  const createdAt = new Date().toISOString();
  const stagingJournal = sealTransactionJournal({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    artifactType: "corpus_pre_live_rebaseline_transaction_journal",
    transactionVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    phase: "staging",
    createdAt,
    planSha256: plan.planSha256,
    finalManifestSha256: finalManifest.manifestSha256,
    entries,
  });
  writeDurableExclusive(
    transactionJournalPath(root),
    journalContent(stagingJournal),
  );
  fsyncDirectory(dirname(transactionJournalPath(root)));
  input.testFaultInjector?.("journal_staging_durable");
  try {
    mkdirSync(transactionDataPath(root), { mode: 0o700 });
    chmodSync(transactionDataPath(root), 0o700);
    fsyncDirectory(dirname(transactionDataPath(root)));
    for (const [index, output] of allOutputs.entries()) {
      const entry = entries[index]!;
      const stagedPath = projectFile(root, entry.stagedPath);
      writeDurableExclusive(stagedPath, output.content, entry.afterMode);
      fsyncDirectory(dirname(stagedPath));
      if (
        !sameFileState(
          readOptionalFileState(root, entry.stagedPath) === null
            ? null
            : {
                binding: corpusPreLiveRebaselineFileBinding(
                  output.path,
                  readFileSync(stagedPath),
                ),
                mode: lstatSync(stagedPath).mode & 0o777,
              },
          entry.after,
          entry.afterMode,
        )
      ) {
        throw new Error(
          `Corpus rebaseline staging verification failed: ${output.path}`,
        );
      }
      if (entry.before !== null && entry.backupPath !== null) {
        const backupPath = projectFile(root, entry.backupPath);
        const current = readFileSync(projectFile(root, entry.path));
        if (
          !sameBinding(
            corpusPreLiveRebaselineFileBinding(entry.path, current),
            entry.before,
          )
        ) {
          throw new Error(
            `Corpus rebaseline target drifted during backup: ${entry.path}`,
          );
        }
        writeDurableExclusive(backupPath, current);
        fsyncDirectory(dirname(backupPath));
        assertBackupMatches(root, entry);
      }
    }
    input.testFaultInjector?.("staging_complete");
    const { journalSha256: _stagingJournalSha256, ...stagingBody } =
      stagingJournal;
    const preparedJournal = sealTransactionJournal({
      ...stagingBody,
      phase: "prepared",
    });
    replaceJournalDurably(root, preparedJournal);
    input.testFaultInjector?.("journal_prepared_durable");

    const freshObservation = await input.revalidateDatabaseObservation();
    if (
      validateCorpusPreLiveRebaselineDatabaseObservation(freshObservation)
        .stateSha256 !== plan.databaseObservation.stateSha256
    ) {
      throw new Error(
        "Corpus rebaseline database observation drifted before commit",
      );
    }
    assertCorpusPreLiveRebaselineBindingsCurrent(
      root,
      plan.compareAndSwapInputs,
    );
    assertCorpusPreLiveRebaselinePathsAbsent(root, plan.expectedAbsentPaths);

    for (const entry of preparedJournal.entries) {
      const stagedPath = projectFile(root, entry.stagedPath);
      const target = projectFile(root, entry.path);
      renameSync(stagedPath, target);
      fsyncDirectory(dirname(stagedPath));
      if (dirname(stagedPath) !== dirname(target))
        fsyncDirectory(dirname(target));
      input.testFaultInjector?.(`target_renamed:${entry.path}`);
    }
    for (const entry of preparedJournal.entries) {
      if (
        !sameFileState(
          readOptionalFileState(root, entry.path),
          entry.after,
          entry.afterMode,
        )
      ) {
        throw new Error(
          `Corpus rebaseline committed output verification failed: ${entry.path}`,
        );
      }
    }
    cleanTransactionFiles(root, preparedJournal);
  } catch (error) {
    if (error instanceof CorpusPreLiveRebaselineSimulatedCrash) throw error;
    if (existsSync(transactionJournalPath(root))) {
      recoverTransactionWithoutAcknowledgement(root);
    }
    throw error;
  }
}

function rootOrThrow(root: string): string {
  if (!root || !isAbsolute(root)) {
    throw new Error("Corpus rebaseline root must be absolute");
  }
  return root;
}
