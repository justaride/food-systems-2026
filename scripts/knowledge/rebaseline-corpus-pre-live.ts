import "dotenv/config";

import assert from "node:assert/strict";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";

import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import {
  CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
  CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
  CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
  CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH,
  CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH,
  CORPUS_PRE_LIVE_REBASELINE_VERSION,
  assertCorpusPreLiveRebaselineBindingsCurrent,
  assertCorpusPreLiveRebaselinePathsAbsent,
  canonicalCorpusPreLiveRebaselineJson,
  commitCorpusPreLiveRebaseline,
  corpusPreLiveRebaselineApplyAcknowledgement,
  corpusPreLiveRebaselineBindingSetSha256,
  corpusPreLiveRebaselineFileBinding,
  corpusPreLiveRebaselineHistoryContent,
  corpusPreLiveRebaselineManifestContent,
  recoverCorpusPreLiveRebaselineTransaction,
  corpusPreLiveRebaselineSha256,
  readCorpusPreLiveRebaselineFileBinding,
  sealCorpusPreLiveRebaselineCommitManifest,
  sealCorpusPreLiveRebaselineDatabaseObservation,
  sealCorpusPreLiveRebaselineHistoryRecord,
  sealCorpusPreLiveRebaselinePlan,
  validateCorpusPreLiveRebaselinePlan,
  type CorpusPreLiveRebaselineCommitManifest,
  type CorpusPreLiveRebaselineDatabaseObservation,
  type CorpusPreLiveRebaselineFileBinding,
  type CorpusPreLiveRebaselineNamedBootstrapBindings,
  type CorpusPreLiveRebaselineOutput,
  type CorpusPreLiveRebaselinePlan,
  type CorpusPreLiveRebaselineSourceRegistrationBinding,
} from "../../src/lib/knowledge/corpus-pre-live-rebaseline";
import {
  SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_PLAN_PATH,
  sourceRegistrationApplyContractSha256,
  sourceRegistrationApplyDependencyStateSha256,
  sourceRegistrationApplyOperationKey,
  sourceRegistrationApplyTargetSetSha256,
  type SourceRegistrationControlledMutationAudit,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT,
  PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
  PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT,
  PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH,
  PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
  PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT,
  VerifiedPrivateCopyPairSchema,
  canonicalPrivateRecoveryJson,
  privateRecoveryFileBinding,
  privateRecoverySha256,
  serializePrivateRecoveryJson,
  validatePrivateRecoveryAcquisitionPlan,
  validatePrivateRecoveryDatabaseAuditBinding,
  type PrivateRecoveryAcquisitionPlan,
  type PrivateRecoveryImplementationBinding,
  type VerifiedPrivateCopyPair,
} from "../../src/lib/knowledge/private-recovery-acquisition";
import {
  validateSourceRegistrationPlan,
  type SourceRegistrationPlan,
} from "../../src/lib/knowledge/source-registration-plan";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
} from "./generate-corpus-processing-current-state";
import {
  CORPUS_PROCESSING_PATHS,
  LIVE_INVENTORY_SNAPSHOT_PATH,
  buildLiveInventorySnapshot,
  canonicalJson,
  parseLibraryAnalysisLedgerJsonl,
  sha256,
  type LiveInventorySnapshot,
} from "./generate-corpus-processing-register";
import {
  CORPUS_PROCESSING_BASELINE_PATH,
  CORPUS_PROCESSING_LEDGER_PATH,
  buildCorpusCurrentStateRebaselineArtifacts,
  buildCorpusProcessingRebaselineArtifacts,
  buildEmptyCorpusStateRebaselineBootstrap,
  type CorpusPreLiveRebaselineBaseline as CorpusProcessingBaseline,
} from "./build-corpus-pre-live-rebaseline-overlays";
import {
  assertReceiptedSourceRegistrationNoop,
  inspectSourceRegistrationApplyDatabaseState,
  loadLockedSourceRegistrationPlan,
  reconstructLockedDocumentContents,
  sourceRegistrationApplyCodeBindings,
  verifyLockedPlanInputs,
  type SourceRegistrationApplyDatabaseState,
} from "./apply-source-registration-plan";
import {
  classifyPrivateRecoveryFilesystemState,
  readSafeProjectFile,
  verifyPrivateRecoveryCopies,
  type FilesystemBundleState,
} from "./manage-private-recovery-acquisition";
import { SOURCE_REGISTRATION_PATHS } from "./generate-source-registration-plan";
import {
  LIBRARY_ANALYSIS_LEDGER_PATH,
  loadLibraryAnalysisInventoryFromClient,
} from "../library-analysis-common";
import { auditLibraryAnalysisLedgerLiveParity } from "../../src/lib/library-analysis-processing";

export const CORPUS_PRE_LIVE_REBASELINE_RUNNER_PATH =
  "scripts/knowledge/rebaseline-corpus-pre-live.ts" as const;
export const CORPUS_PRE_LIVE_REBASELINE_RUNTIME_PATH =
  "src/lib/knowledge/corpus-pre-live-rebaseline.ts" as const;
export const CORPUS_PRE_LIVE_REBASELINE_SCHEMA_PATH =
  "knowledge/schema/corpus-pre-live-rebaseline.schema.v1.json" as const;
export const CORPUS_PRE_LIVE_REBASELINE_CONTRACT_PATH =
  "knowledge/corpus/CORPUS-PRE-LIVE-REBASELINE.md" as const;

const REQUIRED_PRIVATE_RECOVERY_IMPLEMENTATION_BINDINGS: Array<{
  role: PrivateRecoveryImplementationBinding["role"];
  path: string;
}> = [
  {
    role: "private_recovery_apply_schema",
    path: "knowledge/schema/private-recovery-acquisition-apply-receipt.schema.v1.json",
  },
  {
    role: "private_recovery_contract",
    path: "knowledge/corpus/PRIVATE-RECOVERY-ACQUISITION-CONTRACT.md",
  },
  {
    role: "private_recovery_plan_schema",
    path: "knowledge/schema/private-recovery-acquisition-plan.schema.v1.json",
  },
  {
    role: "private_recovery_runner",
    path: "scripts/knowledge/manage-private-recovery-acquisition.ts",
  },
  {
    role: "private_recovery_runtime",
    path: "src/lib/knowledge/private-recovery-acquisition.ts",
  },
  {
    role: "source_acquisition_runtime",
    path: "src/lib/knowledge/source-acquisition-receipt.ts",
  },
  {
    role: "source_acquisition_schema",
    path: "knowledge/schema/source-acquisition-receipt.schema.v1.json",
  },
  {
    role: "source_registration_apply_runner",
    path: "scripts/knowledge/apply-source-registration-plan.ts",
  },
  {
    role: "source_registration_apply_runtime",
    path: "src/lib/knowledge/source-registration-apply.ts",
  },
  {
    role: "source_registration_plan_runtime",
    path: "src/lib/knowledge/source-registration-plan.ts",
  },
];

const EMPTY_SHA256 =
  "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
const EXPECTED_DOCUMENT_COUNT = 1549;
const EXPECTED_LIBRARY_ANALYSIS_RECORD_COUNT = 1582;
const EXPECTED_CONTROLLED_MUTATION_AUDIT_COUNT = 1;

const SAFETY_BOUNDARY = Object.freeze({
  databaseMutationPerformed: false as const,
  privateSourceReadPerformed: true,
  privateSourceReadLimitedToExactAfterStateVerification: true as const,
  privateSourceMutationPerformed: false as const,
  lifecycleEventCreated: false as const,
  trustedVerificationCreated: false as const,
  externalAnchorBindingCreated: false as const,
  identityVerified: false as const,
  sourceAnalysisAllowed: false as const,
  ownerReviewComplete: false as const,
  rightsCleared: false as const,
  externalUseAllowed: false as const,
  coveragePromotionAllowed: false as const,
});

type Mode = "plan" | "apply" | "recover";

export type CorpusPreLiveRebaselineCliOptions = {
  mode: Mode;
  planFile?: string;
  acknowledgement?: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  registrationManifestPath?: string;
};

export function parseCorpusPreLiveRebaselineArgs(
  argv: string[],
  env: NodeJS.ProcessEnv = process.env,
): CorpusPreLiveRebaselineCliOptions {
  let mode: Mode = "plan";
  let explicitMode = false;
  const values: Record<string, string | undefined> = {
    primaryCorpusRoot: env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT,
    replicaCorpusRoot: env.FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT,
  };
  const explicitValueKeys = new Set<string>();
  const valueFlags = {
    "--plan-file=": "planFile",
    "--ack=": "acknowledgement",
    "--primary-corpus-root=": "primaryCorpusRoot",
    "--replica-corpus-root=": "replicaCorpusRoot",
    "--registration-manifest=": "registrationManifestPath",
  } as const;
  for (const argument of argv) {
    if (
      argument === "--plan" ||
      argument === "--apply" ||
      argument === "--recover"
    ) {
      if (explicitMode) throw new Error("Choose exactly one rebaseline mode");
      mode = argument.slice(2) as Mode;
      explicitMode = true;
      continue;
    }
    const entry = Object.entries(valueFlags).find(([prefix]) =>
      argument.startsWith(prefix),
    );
    if (!entry)
      throw new Error(`Unknown corpus rebaseline argument: ${argument}`);
    const [prefix, key] = entry;
    if (values[key])
      throw new Error(`Duplicate corpus rebaseline flag: ${prefix}`);
    const value = argument.slice(prefix.length);
    if (!value)
      throw new Error(`Corpus rebaseline flag cannot be empty: ${prefix}`);
    values[key] = value;
    explicitValueKeys.add(key);
  }
  if (
    mode !== "recover" &&
    (!values.primaryCorpusRoot || !values.replicaCorpusRoot)
  ) {
    throw new Error(
      "Corpus rebaseline requires explicit primary and replica corpus roots or both private-root environment variables",
    );
  }
  if (
    mode !== "recover" &&
    (!isAbsolute(values.primaryCorpusRoot!) ||
      !isAbsolute(values.replicaCorpusRoot!))
  ) {
    throw new Error(
      "Corpus rebaseline private corpus roots must be supplied as raw absolute paths",
    );
  }
  if (mode === "apply" && (!values.planFile || !values.acknowledgement)) {
    throw new Error("Corpus rebaseline apply requires --plan-file and --ack");
  }
  if (mode === "recover" && !values.acknowledgement) {
    throw new Error("Corpus rebaseline recovery requires --ack");
  }
  if (
    mode === "recover" &&
    [...explicitValueKeys].some((key) => key !== "acknowledgement")
  ) {
    throw new Error(
      "Corpus rebaseline recovery accepts only --recover and --ack",
    );
  }
  return {
    mode,
    planFile: values.planFile,
    acknowledgement: values.acknowledgement,
    primaryCorpusRoot: values.primaryCorpusRoot
      ? resolve(values.primaryCorpusRoot)
      : "",
    replicaCorpusRoot: values.replicaCorpusRoot
      ? resolve(values.replicaCorpusRoot)
      : "",
    registrationManifestPath: values.registrationManifestPath,
  };
}

type ManifestDescriptor = {
  path: string;
  sha256: string;
  sizeBytes: number;
};

type CorpusGenerationManifest = {
  schemaVersion: "1.0.0";
  observedAt: string;
  inputs: ManifestDescriptor[];
  outputs: ManifestDescriptor[];
};

function readRegular(root: string, path: string): Buffer {
  const target = resolve(root, path);
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Corpus rebaseline input is not a regular file: ${path}`);
  }
  return readFileSync(target);
}

function readText(root: string, path: string): string {
  return readRegular(root, path).toString("utf8");
}

function readJson<T>(root: string, path: string): T {
  try {
    return JSON.parse(readText(root, path)) as T;
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}: ${(error as Error).message}`);
  }
}

function descriptorFromManifest(
  values: ManifestDescriptor[],
  path: string,
  label: string,
): CorpusPreLiveRebaselineFileBinding {
  const matches = values.filter((value) => value.path === path);
  if (
    matches.length !== 1 ||
    !/^[a-f0-9]{64}$/.test(matches[0]!.sha256) ||
    !Number.isSafeInteger(matches[0]!.sizeBytes) ||
    matches[0]!.sizeBytes < 0
  ) {
    throw new Error(`${label} does not bind exactly one valid ${path}`);
  }
  return {
    path: matches[0]!.path,
    sha256: matches[0]!.sha256,
    sizeBytes: matches[0]!.sizeBytes,
  };
}

function assertActualBinding(
  root: string,
  descriptor: CorpusPreLiveRebaselineFileBinding,
  label: string,
): void {
  const observed = readCorpusPreLiveRebaselineFileBinding(
    root,
    descriptor.path,
  );
  assert.deepEqual(observed, descriptor, `${label} file binding drifted`);
}

function parseJsonLines(content: string, label: string): unknown[] {
  if (content.length === 0) return [];
  if (!content.endsWith("\n"))
    throw new Error(`${label} must end with newline`);
  return content
    .trimEnd()
    .split("\n")
    .map((line, index) => {
      try {
        return JSON.parse(line) as unknown;
      } catch (error) {
        throw new Error(`${label}:${index + 1}: ${(error as Error).message}`);
      }
    });
}

export function inspectPreLiveBootstrap(root: string): {
  bindings: CorpusPreLiveRebaselineNamedBootstrapBindings;
  baseline: CorpusProcessingBaseline;
  historicalLedger: CorpusPreLiveRebaselineFileBinding;
} {
  if (
    existsSync(resolve(root, CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH)) ||
    existsSync(resolve(root, CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH)) ||
    existsSync(
      resolve(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH),
    ) ||
    existsSync(resolve(root, CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH))
  ) {
    throw new Error(
      "Corpus rebaseline history or interrupted transaction already exists",
    );
  }
  const baseline = readJson<CorpusProcessingBaseline>(
    root,
    CORPUS_PROCESSING_BASELINE_PATH,
  );
  const snapshot = readJson<LiveInventorySnapshot>(
    root,
    LIVE_INVENTORY_SNAPSHOT_PATH,
  );
  const corpusManifest = readJson<CorpusGenerationManifest>(
    root,
    CORPUS_PROCESSING_PATHS.generationManifest,
  );
  const historicalLedger = descriptorFromManifest(
    corpusManifest.inputs,
    CORPUS_PROCESSING_LEDGER_PATH,
    "Old corpus generation manifest",
  );
  for (const descriptor of corpusManifest.inputs) {
    if (descriptor.path === CORPUS_PROCESSING_LEDGER_PATH) continue;
    assertActualBinding(root, descriptor, "Old corpus manifest input");
  }
  for (const descriptor of corpusManifest.outputs) {
    assertActualBinding(root, descriptor, "Old corpus manifest output");
  }
  for (const [path, group, label] of [
    [CORPUS_PROCESSING_BASELINE_PATH, corpusManifest.inputs, "Old baseline"],
    [LIVE_INVENTORY_SNAPSHOT_PATH, corpusManifest.inputs, "Old live snapshot"],
    [CORPUS_PROCESSING_PATHS.register, corpusManifest.outputs, "Old register"],
  ] as const) {
    assertActualBinding(
      root,
      descriptorFromManifest(group, path, "Old corpus generation manifest"),
      label,
    );
  }
  assert.equal(snapshot.ledger.path, historicalLedger.path);
  assert.equal(snapshot.ledger.sha256, historicalLedger.sha256);
  assert.equal(snapshot.ledger.sizeBytes, historicalLedger.sizeBytes);
  assert.equal(
    baseline.authoritativeInventorySnapshot.ledgerSha256,
    historicalLedger.sha256,
  );
  assert.equal(
    baseline.authoritativeInventorySnapshot.identityContentSetSha256,
    snapshot.identityContentSetSha256,
  );
  assert.equal(
    baseline.authoritativeInventorySnapshot.sourceKindCountsSha256,
    snapshot.sourceKindCountsSha256,
  );
  const currentStateManifest = readJson<CorpusGenerationManifest>(
    root,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  for (const descriptor of [
    ...currentStateManifest.inputs,
    ...currentStateManifest.outputs,
  ]) {
    assertActualBinding(root, descriptor, "Old current-state manifest");
  }

  const eventContent = readText(root, CORPUS_CURRENT_STATE_PATHS.events);
  if (eventContent !== "" || Buffer.byteLength(eventContent) !== 0) {
    throw new Error("Pre-live rebaseline refuses any lifecycle event history");
  }
  const eventManifest = readJson<Record<string, unknown>>(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
  );
  if (
    eventManifest.eventCount !== 0 ||
    eventManifest.initializedAt !== baseline.observedAt ||
    (eventManifest.eventLog as Record<string, unknown> | undefined)?.sha256 !==
      EMPTY_SHA256 ||
    (eventManifest.eventLog as Record<string, unknown> | undefined)
      ?.sizeBytes !== 0 ||
    eventManifest.firstEventSha256 !== null ||
    eventManifest.lastEventSha256 !== null ||
    eventManifest.highWatermarkOccurredAt !== null
  ) {
    throw new Error("Pre-live event manifest is not the exact empty bootstrap");
  }
  const anchors = parseJsonLines(
    readText(root, CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors),
    "Corpus event-history anchors",
  );
  const anchor = anchors[0] as Record<string, unknown> | undefined;
  if (
    anchors.length !== 1 ||
    anchor?.recordType !== "history_anchor_candidate" ||
    anchor.sequence !== 1 ||
    anchor.predecessorRecordSha256 !== null ||
    anchor.eventCount !== 0
  ) {
    throw new Error(
      "Pre-live rebaseline requires exactly one unverified genesis candidate and no trusted/external binding record",
    );
  }

  const projected = buildCorpusCurrentStateArtifacts(root);
  if (
    projected.events.length !== 0 ||
    projected.eventHistory.currentCheckpointTrusted
  ) {
    throw new Error(
      "Pre-live current-state projection has event or trust history",
    );
  }
  for (const item of projected.bundle) {
    if (item.content !== readText(root, item.path)) {
      throw new Error(
        `Tracked pre-live current-state bundle is stale: ${item.path}`,
      );
    }
  }

  const bindings: CorpusPreLiveRebaselineNamedBootstrapBindings = {
    baseline: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_PROCESSING_BASELINE_PATH,
    ),
    liveInventorySnapshot: readCorpusPreLiveRebaselineFileBinding(
      root,
      LIVE_INVENTORY_SNAPSHOT_PATH,
    ),
    libraryLedger: historicalLedger,
    corpusRegister: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_PROCESSING_PATHS.register,
    ),
    corpusGenerationManifest: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_PROCESSING_PATHS.generationManifest,
    ),
    currentState: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_CURRENT_STATE_PATHS.currentState,
    ),
    currentStateGenerationManifest: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ),
    eventLog: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_CURRENT_STATE_PATHS.events,
    ),
    eventManifest: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
    ),
    anchorLog: readCorpusPreLiveRebaselineFileBinding(
      root,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ),
  };
  return { bindings, baseline, historicalLedger };
}

function normalizeAudit(
  audit: SourceRegistrationControlledMutationAudit,
): Record<string, unknown> {
  return {
    ...audit,
    recordedAt:
      typeof audit.recordedAt === "string"
        ? audit.recordedAt
        : new Date(audit.recordedAt!).toISOString(),
  };
}

function sourceRegistrationBinding(input: {
  audit: SourceRegistrationControlledMutationAudit;
  summary: SourceRegistrationControlledMutationAudit["mutationSummary"];
}): CorpusPreLiveRebaselineSourceRegistrationBinding {
  const audit = normalizeAudit(input.audit);
  const summary = input.summary;
  assert.equal(
    input.audit.contractScope,
    SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
  );
  assert.equal(
    input.audit.contractSha256,
    sourceRegistrationApplyContractSha256(),
  );
  assert.equal(
    input.audit.planSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  );
  assert.equal(
    input.audit.beforeSnapshotSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  );
  assert.equal(
    input.audit.databaseIdentityUuid.toLowerCase(),
    SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
  );
  return {
    plan: {
      path: SOURCE_REGISTRATION_APPLY_PLAN_PATH,
      fileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      beforeSnapshotSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    },
    audit: {
      auditId: input.audit.id,
      operationKey: input.audit.operationKey,
      recordSha256: corpusPreLiveRebaselineSha256(
        canonicalCorpusPreLiveRebaselineJson(audit),
      ),
      recordedAt: String(audit.recordedAt),
      contractScope: input.audit.contractScope,
      contractSha256: input.audit.contractSha256,
      planSha256: input.audit.planSha256,
      beforeSnapshotSha256: input.audit.beforeSnapshotSha256,
      afterSnapshotSha256: input.audit.afterSnapshotSha256,
      mutationSummarySha256: summary.summarySha256,
      databaseIdentityUuid: input.audit.databaseIdentityUuid.toLowerCase(),
      receiptState: summary.receiptState,
      rows: {
        documentCreates: summary.rows.documentCreates,
        libraryAnalysisRecordCreates: summary.rows.libraryAnalysisRecordCreates,
        controlledMutationAuditCreates:
          summary.rows.controlledMutationAuditCreates,
      },
    },
  };
}

type DatabaseInspection = ReturnType<
  typeof assertReceiptedSourceRegistrationNoop
> & {
  state: "receipted_noop";
  operationKey: string;
  transaction: SourceRegistrationApplyDatabaseState["transaction"];
};

const EXPECTED_POST_RECOVERY_LOCKED_REGISTER_ERROR =
  "Locked source-registration apply refused: private recovery register differs from locked plan";

export function assertExpectedPostRecoveryLockedRegisterError(
  error: unknown,
): void {
  if (
    !(error instanceof Error) ||
    error.message !== EXPECTED_POST_RECOVERY_LOCKED_REGISTER_ERROR
  ) {
    throw error;
  }
}

function verifyLockedRegistrationInputsAfterPrivateRecovery(input: {
  root: string;
  options: CorpusPreLiveRebaselineCliOptions;
  sourceRegistrationPlan: SourceRegistrationPlan;
  privateRecoveryPlan: PrivateRecoveryAcquisitionPlan;
}): void {
  const lockedRegister =
    input.sourceRegistrationPlan.beforeSnapshot.privateRecoveryRegister;
  const recoveryBefore = input.privateRecoveryPlan.recoveryRegister.before;
  if (
    input.privateRecoveryPlan.inputBindings.sourceRegistrationPlan
      .planSha256 !== input.sourceRegistrationPlan.planSha256 ||
    lockedRegister.path !== recoveryBefore.file.path ||
    lockedRegister.fileSha256 !== recoveryBefore.file.fileSha256 ||
    lockedRegister.candidateCount !== recoveryBefore.candidateCount
  ) {
    throw new Error(
      "Committed private recovery does not start at the locked source-registration register",
    );
  }
  try {
    verifyLockedPlanInputs({
      projectRoot: input.root,
      manifestPath:
        input.options.registrationManifestPath ??
        SOURCE_REGISTRATION_PATHS.batch,
      primaryCorpusRoot: input.options.primaryCorpusRoot,
      replicaCorpusRoot: input.options.replicaCorpusRoot,
      plan: input.sourceRegistrationPlan,
    });
  } catch (error) {
    assertExpectedPostRecoveryLockedRegisterError(error);
    return;
  }
  throw new Error(
    "Corpus rebaseline expected the exact committed 11 -> 21 private-recovery register transition",
  );
}

async function observeDatabaseAndLedger(input: {
  root: string;
  options: CorpusPreLiveRebaselineCliOptions;
  ledgerContent: string;
  observedAt: string;
  privateRecoveryPlan: PrivateRecoveryAcquisitionPlan;
}): Promise<{
  observation: CorpusPreLiveRebaselineDatabaseObservation;
  liveRows: Awaited<ReturnType<typeof loadLibraryAnalysisInventoryFromClient>>;
  snapshot: LiveInventorySnapshot;
  inspection: DatabaseInspection;
}> {
  const registrationPlan = loadLockedSourceRegistrationPlan(input.root);
  const codeBindings = sourceRegistrationApplyCodeBindings(input.root);
  const dependencyStateSha256 = sourceRegistrationApplyDependencyStateSha256({
    plan: registrationPlan,
    codeBindings,
  });
  const operationKey = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256,
  });
  verifyLockedRegistrationInputsAfterPrivateRecovery({
    root: input.root,
    options: input.options,
    sourceRegistrationPlan: registrationPlan,
    privateRecoveryPlan: input.privateRecoveryPlan,
  });
  const contents = reconstructLockedDocumentContents({
    projectRoot: input.root,
    primaryCorpusRoot: input.options.primaryCorpusRoot,
    replicaCorpusRoot: input.options.replicaCorpusRoot,
    plan: registrationPlan,
  });
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for corpus rebaseline planning");
  }
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  const inspected = await prisma
    .$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
        const state = await inspectSourceRegistrationApplyDatabaseState({
          tx,
          plan: registrationPlan,
          contents,
          operationKey,
        });
        if (!state.transaction.readOnly) {
          throw new Error(
            "Corpus rebaseline database inspection did not prove a read-only transaction",
          );
        }
        const receipted = assertReceiptedSourceRegistrationNoop({
          state,
          plan: registrationPlan,
          codeBindings,
          operationKey,
        });
        const liveRows = await loadLibraryAnalysisInventoryFromClient(tx);
        return { state, receipted, liveRows };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 20_000,
        timeout: 180_000,
      },
    )
    .finally(async () => prisma.$disconnect());
  const inspection: DatabaseInspection = {
    state: "receipted_noop",
    operationKey,
    ...inspected.receipted,
    transaction: inspected.state.transaction,
  };
  if (
    inspection.state !== "receipted_noop" ||
    inspection.targetCounts.exactDocuments !== 10 ||
    inspection.targetCounts.exactLibraryAnalysisRecords !== 10 ||
    inspection.dependencyRowCount !== 0 ||
    inspection.coreCounts.Document !== EXPECTED_DOCUMENT_COUNT ||
    inspection.coreCounts.LibraryAnalysisRecord !==
      EXPECTED_LIBRARY_ANALYSIS_RECORD_COUNT ||
    inspection.coreCounts.ControlledMutationAudit !==
      EXPECTED_CONTROLLED_MUTATION_AUDIT_COUNT ||
    !inspection.transaction.readOnly ||
    inspection.transaction.isolationLevel.toLowerCase() !== "repeatable read"
  ) {
    throw new Error("Database is not the exact receipted 10+10+1 after-state");
  }
  const liveRows = inspected.liveRows;
  const parity = auditLibraryAnalysisLedgerLiveParity(
    input.ledgerContent,
    liveRows,
  );
  if (parity.failures.length > 0) {
    throw new Error(
      `Library ledger is not the exact exported live inventory:\n${parity.failures.join("\n")}`,
    );
  }
  if (liveRows.length !== 1565) {
    throw new Error(
      `Post-registration live inventory must contain exactly 1,565 active rows; observed ${liveRows.length}`,
    );
  }
  const snapshot = buildLiveInventorySnapshot({
    liveRows,
    ledgerContent: input.ledgerContent,
    observedAt: input.observedAt,
  });
  const sourceRegistration = sourceRegistrationBinding({
    audit: inspection.audit,
    summary: inspection.summary,
  });
  const observation = sealCorpusPreLiveRebaselineDatabaseObservation({
    observedAt: new Date().toISOString(),
    transaction: {
      isolationLevel: "RepeatableRead",
      readOnly: true,
      transactionReadOnlySetting: "on",
      observationScope:
        "source_registration_receipt_targets_core_counts_and_active_inventory",
    },
    databaseIdentityUuid:
      inspection.summary.afterSnapshot.databaseIdentityUuid.toLowerCase(),
    counts: {
      documents: inspection.coreCounts.Document,
      libraryAnalysisRecords: inspection.coreCounts.LibraryAnalysisRecord,
      controlledMutationAudits: inspection.coreCounts.ControlledMutationAudit,
      activeLibraryLedgerRows: 1565,
    },
    exactAfterState: {
      targetCount: 10,
      exactDocumentTargets: inspection.targetCounts.exactDocuments,
      exactLibraryTargets: inspection.targetCounts.exactLibraryAnalysisRecords,
      dependencyRowCount: inspection.dependencyRowCount,
      exactReceiptedAuditCount: 1,
    },
    sourceRegistration,
    liveInventoryIdentityContentSetSha256: snapshot.identityContentSetSha256,
    exportedLedgerSha256: sha256(input.ledgerContent),
  });
  return { observation, liveRows, snapshot, inspection };
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function outputMap(
  outputs: CorpusPreLiveRebaselineOutput[],
): Map<string, string> {
  const result = new Map<string, string>();
  for (const output of outputs) {
    if (result.has(output.path))
      throw new Error(`Duplicate rebaseline output: ${output.path}`);
    result.set(output.path, output.content);
  }
  return result;
}

function bindingFromOutput(
  values: Map<string, string>,
  path: string,
): CorpusPreLiveRebaselineFileBinding {
  const content = values.get(path);
  if (content === undefined)
    throw new Error(`Missing proposed rebaseline output: ${path}`);
  return corpusPreLiveRebaselineFileBinding(path, content);
}

function requiredObject(
  value: unknown,
  label: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Rebaseline ${label} is missing or malformed`);
  }
  return value as Record<string, unknown>;
}

export function assertCorpusPreLiveRebaselineNoPromotion(
  registerContent: string,
  currentStateContent: string,
): void {
  const registerRows = parseJsonLines(
    registerContent,
    "Rebaseline register",
  ) as Array<Record<string, unknown>>;
  for (const row of registerRows) {
    const lifecycle = requiredObject(row.lifecycle, "register lifecycle");
    const identity = requiredObject(
      lifecycle.sourceIdentity,
      "register source identity",
    );
    const permissions = requiredObject(row.permissions, "register permissions");
    const promotion = requiredObject(
      row.promotionState,
      "register promotion state",
    );
    if (
      identity.identityStatus !== "provisional" ||
      permissions.externalUseAllowed !== false ||
      permissions.coveragePromotionAllowed !== false ||
      promotion.externalUseReady !== false ||
      promotion.coveragePromotionAllowed !== false
    ) {
      throw new Error(
        "Rebaseline register attempted readiness or coverage promotion",
      );
    }
  }

  const currentStateRows = parseJsonLines(
    currentStateContent,
    "Rebaseline current state",
  ) as Array<Record<string, unknown>>;
  for (const row of currentStateRows) {
    const lifecycle = requiredObject(row.lifecycle, "current-state lifecycle");
    const identity = requiredObject(
      lifecycle.sourceIdentity,
      "current-state source identity",
    );
    const permissions = requiredObject(
      row.permissions,
      "current-state permissions",
    );
    const publication = requiredObject(
      lifecycle.publicationStatus,
      "current-state publication status",
    );
    const coverage = requiredObject(
      lifecycle.coverageStatus,
      "current-state coverage status",
    );
    const ownerReview = requiredObject(
      lifecycle.ownerReviewStatus,
      "current-state owner-review status",
    );
    const sourceRole = requiredObject(
      lifecycle.sourceRoleConfirmationStatus,
      "current-state source-role status",
    );
    const rights = requiredObject(
      lifecycle.rightsStatus,
      "current-state rights status",
    );
    if (
      identity.identityStatus !== "provisional" ||
      permissions.externalUseAllowed !== false ||
      permissions.coveragePromotionAllowed !== false ||
      publication.state !== "internal_only" ||
      publication.externalUseAllowed !== false ||
      publication.approvalReceipt !== null ||
      publication.publicLocator !== null ||
      publication.publishedAt !== null ||
      coverage.state !== "not_assessed" ||
      coverage.coveragePromotionAllowed !== false ||
      coverage.approvalReceipt !== null ||
      coverage.promotedAt !== null ||
      ownerReview.state !== "not_requested" ||
      ownerReview.receipt !== null ||
      !["machine_provisional", "unknown"].includes(String(sourceRole.state)) ||
      sourceRole.receipt !== null ||
      rights.state !== "unknown" ||
      rights.receipt !== null ||
      row.stateVersion !== 0 ||
      !Array.isArray(row.appliedEvents) ||
      row.appliedEvents.length !== 0
    ) {
      throw new Error(
        "Rebaseline current state attempted lifecycle advancement, readiness, or coverage promotion",
      );
    }
  }
}

function newBaseline(
  old: CorpusProcessingBaseline,
  snapshot: LiveInventorySnapshot,
  observedAt: string,
): CorpusProcessingBaseline {
  return {
    ...old,
    observedAt,
    expectedActiveRows: snapshot.activeRows,
    authoritativeInventorySnapshot: {
      path: LIVE_INVENTORY_SNAPSHOT_PATH,
      snapshotId: snapshot.snapshotId,
      observedAt,
      activeRows: snapshot.activeRows,
      identityContentSetSha256: snapshot.identityContentSetSha256,
      sourceKindCountsSha256: snapshot.sourceKindCountsSha256,
      ledgerSha256: snapshot.ledger.sha256,
    },
    purpose:
      "Fresh post-registration pre-live corpus bootstrap. It records exact inventory parity only and does not verify identity, allow source analysis, complete review, clear rights, authorize external use, or promote coverage.",
  };
}

function privateRecoveryCanonical(value: unknown): string {
  return canonicalPrivateRecoveryJson(value as never);
}

function assertPrivateRecoveryCopyDistinction(
  copies: VerifiedPrivateCopyPair,
): void {
  if (
    copies.primary.storageRootId === copies.replica.storageRootId ||
    copies.primary.locator === copies.replica.locator ||
    copies.primary.copyId !== "primary" ||
    copies.replica.copyId !== "replica" ||
    !copies.distinctStorageRoots ||
    !copies.distinctFiles
  ) {
    throw new Error(
      `${copies.targetId}: private recovery primary and replica must remain distinct`,
    );
  }
}

function normalizedPrivateRecoveryCopies(
  copies: VerifiedPrivateCopyPair,
): VerifiedPrivateCopyPair {
  return {
    ...copies,
    primary: { ...copies.primary, verifiedAt: "2026-01-01T00:00:00.000Z" },
    replica: { ...copies.replica, verifiedAt: "2026-01-01T00:00:00.000Z" },
  };
}

/**
 * This assertion operates on an already schema-validated recovery plan. It is
 * exported so the rebaseline-specific stopline can be tested independently of
 * a live database and private archive.
 */
export function assertCommittedPrivateRecoveryEvidence(input: {
  plan: PrivateRecoveryAcquisitionPlan;
  filesystemState: FilesystemBundleState;
  liveCopies: VerifiedPrivateCopyPair[];
  liveVerifiedAt: string;
}): void {
  const { plan } = input;
  if (input.filesystemState !== "committed") {
    throw new Error(
      "Corpus rebaseline requires the complete committed private-recovery bundle",
    );
  }
  if (
    plan.summary.beforeCandidateCount !==
      PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT ||
    plan.summary.afterCandidateCount !==
      PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT ||
    plan.recoveryRegister.before.candidateCount !==
      PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT ||
    plan.recoveryRegister.after.candidateCount !==
      PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT ||
    plan.recoveryRegister.before.document.candidates.length !==
      PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT ||
    plan.recoveryRegister.after.document.candidates.length !==
      PRIVATE_RECOVERY_ACQUISITION_AFTER_COUNT
  ) {
    throw new Error(
      "Corpus rebaseline requires the exact private-recovery 11 -> 21 row transition",
    );
  }
  if (
    plan.summary.targetCount !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    plan.summary.controlledPrivateReceiptCount !==
      PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    plan.targets.length !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    plan.applyReceipt.receipt.receiptState !== "exact_file_bundle_committed" ||
    plan.applyReceipt.receipt.controlledPrivateReceipts.length !==
      PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT
  ) {
    throw new Error(
      "Corpus rebaseline requires exactly ten controlled-private receipts and the final apply receipt",
    );
  }
  const registrationRecordedAt =
    plan.inputBindings.sourceRegistrationApplyAudit.recordedAt;
  const registrationTime = Date.parse(registrationRecordedAt ?? "");
  const preparedTime = Date.parse(plan.preparedAt);
  if (!registrationRecordedAt || !Number.isFinite(registrationTime)) {
    throw new Error(
      "Private-recovery proof requires a timestamped source-registration audit",
    );
  }
  if (!Number.isFinite(preparedTime) || preparedTime < registrationTime) {
    throw new Error(
      "Private-recovery plan and receipts must be prepared after source registration",
    );
  }
  for (const target of plan.targets) {
    const evidenceTimes = [
      target.privateCopies.primary.verifiedAt,
      target.privateCopies.replica.verifiedAt,
      target.acquisitionReceipt.receipt.startedAt,
      target.acquisitionReceipt.receipt.completedAt,
    ];
    if (
      evidenceTimes.some(
        (value) =>
          !Number.isFinite(Date.parse(value)) ||
          Date.parse(value) !== preparedTime ||
          Date.parse(value) < registrationTime,
      )
    ) {
      throw new Error(
        `${target.targetId}: recovery receipt is not exactly bound to the post-registration verification run`,
      );
    }
  }

  if (
    input.liveCopies.length !== PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT ||
    !Number.isFinite(Date.parse(input.liveVerifiedAt))
  ) {
    throw new Error(
      "Corpus rebaseline requires ten fresh private-copy re-verifications",
    );
  }
  const plannedCopies = plan.targets.map((target) => target.privateCopies);
  input.liveCopies.forEach((rawLiveCopies, index) => {
    const liveCopies = VerifiedPrivateCopyPairSchema.parse(rawLiveCopies);
    const planned = VerifiedPrivateCopyPairSchema.parse(plannedCopies[index]);
    assertPrivateRecoveryCopyDistinction(liveCopies);
    assertPrivateRecoveryCopyDistinction(planned);
    if (
      Date.parse(liveCopies.primary.verifiedAt) !==
        Date.parse(input.liveVerifiedAt) ||
      Date.parse(liveCopies.replica.verifiedAt) !==
        Date.parse(input.liveVerifiedAt) ||
      privateRecoveryCanonical(normalizedPrivateRecoveryCopies(liveCopies)) !==
        privateRecoveryCanonical(normalizedPrivateRecoveryCopies(planned))
    ) {
      throw new Error(
        `${liveCopies.targetId}: current private copies differ from the frozen recovery proof`,
      );
    }
  });
}

function assertPrivateRecoveryFileBinding(input: {
  root: string;
  binding: { path: string; fileSha256: string; sizeBytes: number };
  label: string;
}): CorpusPreLiveRebaselineFileBinding {
  const bytes = readSafeProjectFile(input.root, input.binding.path);
  const actual = privateRecoveryFileBinding(input.binding.path, bytes);
  const expected = {
    path: input.binding.path,
    fileSha256: input.binding.fileSha256,
    sizeBytes: input.binding.sizeBytes,
  };
  if (privateRecoveryCanonical(actual) !== privateRecoveryCanonical(expected)) {
    throw new Error(
      `${input.label} file binding drifted: ${input.binding.path}`,
    );
  }
  return corpusPreLiveRebaselineFileBinding(input.binding.path, bytes);
}

function inspectCommittedPrivateRecoveryBundle(input: {
  root: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  verifiedAt?: string;
}): {
  plan: PrivateRecoveryAcquisitionPlan;
  sourceRegistrationPlan: SourceRegistrationPlan;
  compareAndSwapInputs: CorpusPreLiveRebaselineFileBinding[];
} {
  let planBytes: Buffer;
  try {
    planBytes = readSafeProjectFile(
      input.root,
      PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH,
    );
  } catch (error) {
    throw new Error(
      `Committed private-recovery plan is absent or unsafe: ${(error as Error).message}`,
    );
  }
  let rawPlan: unknown;
  try {
    rawPlan = JSON.parse(planBytes.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Invalid private-recovery acquisition plan JSON: ${(error as Error).message}`,
    );
  }
  const plan = validatePrivateRecoveryAcquisitionPlan(rawPlan);
  if (!planBytes.equals(serializePrivateRecoveryJson(plan))) {
    throw new Error(
      "Private-recovery acquisition plan does not use the controlled exact serialization",
    );
  }
  const implementationRolePaths = plan.inputBindings.implementation.map(
    ({ role, path }) => ({ role, path }),
  );
  if (
    privateRecoveryCanonical(implementationRolePaths) !==
    privateRecoveryCanonical(REQUIRED_PRIVATE_RECOVERY_IMPLEMENTATION_BINDINGS)
  ) {
    throw new Error(
      "Private-recovery acquisition plan does not bind the exact implementation dependency paths",
    );
  }
  const filesystemState = classifyPrivateRecoveryFilesystemState({
    projectRoot: input.root,
    plan,
    planFileSha256: privateRecoverySha256(planBytes),
  });

  const sourcePlanBytes = readSafeProjectFile(
    input.root,
    PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
  );
  const sourcePlan = validateSourceRegistrationPlan(
    JSON.parse(sourcePlanBytes.toString("utf8")),
  );
  const currentSourcePlanBinding = {
    ...privateRecoveryFileBinding(
      PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
      sourcePlanBytes,
    ),
    planSha256: sourcePlan.planSha256,
    targetSetSha256: `sha256:${sourceRegistrationApplyTargetSetSha256(sourcePlan)}`,
  };
  if (
    privateRecoveryCanonical(currentSourcePlanBinding) !==
    privateRecoveryCanonical(plan.inputBindings.sourceRegistrationPlan)
  ) {
    throw new Error(
      "Private-recovery source-registration plan binding drifted",
    );
  }
  plan.targets.forEach((target, index) => {
    const sourceTarget = sourcePlan.targets[index];
    if (
      !sourceTarget ||
      sourceTarget.targetId !== target.targetId ||
      sourceTarget.lifecycleSourceId !== target.lifecycleSourceId ||
      privateRecoveryCanonical(sourceTarget.intendedPrivateRecoveryRow) !==
        privateRecoveryCanonical(target.recoveryRow)
    ) {
      throw new Error(
        `${target.targetId}: private-recovery target differs from the locked source-registration target`,
      );
    }
  });
  const verifiedAt = input.verifiedAt ?? new Date().toISOString();
  const liveCopies = verifyPrivateRecoveryCopies({
    projectRoot: input.root,
    sourceRegistrationPlan: sourcePlan,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
    observedAt: verifiedAt,
  });
  assertCommittedPrivateRecoveryEvidence({
    plan,
    filesystemState,
    liveCopies,
    liveVerifiedAt: verifiedAt,
  });

  const bindings = new Map<string, CorpusPreLiveRebaselineFileBinding>();
  const add = (binding: CorpusPreLiveRebaselineFileBinding) => {
    const existing = bindings.get(binding.path);
    if (existing && canonicalJson(existing) !== canonicalJson(binding)) {
      throw new Error(
        `Conflicting private-recovery CAS binding: ${binding.path}`,
      );
    }
    bindings.set(binding.path, binding);
  };
  add(
    corpusPreLiveRebaselineFileBinding(
      PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH,
      planBytes,
    ),
  );
  for (const [binding, label] of [
    [plan.inputBindings.sourceRegistrationPlan, "Source-registration plan"],
    [plan.recoveryRegister.after.file, "Private-recovery register"],
    ...plan.targets.map(
      (target) =>
        [target.acquisitionReceipt.file, "Controlled-private receipt"] as const,
    ),
    [plan.applyReceipt.file, "Private-recovery apply receipt"],
    ...plan.inputBindings.implementation.map(
      (binding) => [binding, "Private-recovery implementation"] as const,
    ),
  ] as const) {
    add(
      assertPrivateRecoveryFileBinding({
        root: input.root,
        binding,
        label,
      }),
    );
  }
  if (
    !bindings.has(PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH) ||
    !bindings.has(PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH) ||
    bindings.size !==
      4 +
        PRIVATE_RECOVERY_ACQUISITION_TARGET_COUNT +
        REQUIRED_PRIVATE_RECOVERY_IMPLEMENTATION_BINDINGS.length
  ) {
    throw new Error(
      "Private-recovery CAS set is not the exact plan, source plan, register, ten receipts, apply receipt, and ten implementation files",
    );
  }
  return {
    plan,
    sourceRegistrationPlan: sourcePlan,
    compareAndSwapInputs: [...bindings.values()].sort((left, right) =>
      left.path.localeCompare(right.path, "en"),
    ),
  };
}

function assertPrivateRecoveryAuditMatchesObservation(input: {
  plan: PrivateRecoveryAcquisitionPlan;
  sourceRegistrationPlan: SourceRegistrationPlan;
  sourceRegistrationAudit: SourceRegistrationControlledMutationAudit;
}): void {
  validatePrivateRecoveryDatabaseAuditBinding({
    binding: input.plan.inputBindings.sourceRegistrationApplyAudit,
    audit: input.sourceRegistrationAudit,
    sourceRegistrationPlan: input.sourceRegistrationPlan,
  });
}

export function inspectCommittedPrivateRecoveryAcquisition(input: {
  root: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  sourceRegistrationAudit: SourceRegistrationControlledMutationAudit;
  verifiedAt?: string;
}): {
  plan: PrivateRecoveryAcquisitionPlan;
  compareAndSwapInputs: CorpusPreLiveRebaselineFileBinding[];
} {
  const bundle = inspectCommittedPrivateRecoveryBundle(input);
  assertPrivateRecoveryAuditMatchesObservation({
    ...bundle,
    sourceRegistrationAudit: input.sourceRegistrationAudit,
  });
  return {
    plan: bundle.plan,
    compareAndSwapInputs: bundle.compareAndSwapInputs,
  };
}

function collectCasInputs(input: {
  root: string;
  oldBootstrap: CorpusPreLiveRebaselineNamedBootstrapBindings;
  currentLedger: CorpusPreLiveRebaselineFileBinding;
  proposedOutputs: CorpusPreLiveRebaselineOutput[];
  sourceRegistrationCodeBindings: unknown;
  privateRecoveryInputs: CorpusPreLiveRebaselineFileBinding[];
}): CorpusPreLiveRebaselineFileBinding[] {
  const replacePaths = new Set(
    input.proposedOutputs.map((output) => output.path),
  );
  const bindings = new Map<string, CorpusPreLiveRebaselineFileBinding>();
  const add = (binding: CorpusPreLiveRebaselineFileBinding) => {
    const existing = bindings.get(binding.path);
    if (existing && canonicalJson(existing) !== canonicalJson(binding)) {
      throw new Error(`Conflicting CAS binding for ${binding.path}`);
    }
    bindings.set(binding.path, binding);
  };
  for (const [name, binding] of Object.entries(input.oldBootstrap)) {
    if (name !== "libraryLedger") add(binding);
  }
  add(input.currentLedger);
  for (const output of input.proposedOutputs) {
    if (output.path === CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH) continue;
    add(readCorpusPreLiveRebaselineFileBinding(input.root, output.path));
  }
  add(
    readCorpusPreLiveRebaselineFileBinding(
      input.root,
      SOURCE_REGISTRATION_APPLY_PLAN_PATH,
    ),
  );
  for (const path of [
    CORPUS_PRE_LIVE_REBASELINE_RUNNER_PATH,
    CORPUS_PRE_LIVE_REBASELINE_RUNTIME_PATH,
    CORPUS_PRE_LIVE_REBASELINE_SCHEMA_PATH,
    CORPUS_PRE_LIVE_REBASELINE_CONTRACT_PATH,
    "scripts/library-analysis-common.ts",
    "src/lib/library-analysis-processing.ts",
  ]) {
    add(readCorpusPreLiveRebaselineFileBinding(input.root, path));
  }
  if (
    !input.sourceRegistrationCodeBindings ||
    typeof input.sourceRegistrationCodeBindings !== "object" ||
    Array.isArray(input.sourceRegistrationCodeBindings)
  ) {
    throw new Error("Source-registration code bindings are malformed");
  }
  let sourceRegistrationFileBindingCount = 0;
  for (const value of Object.values(
    input.sourceRegistrationCodeBindings as Record<string, unknown>,
  )) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const binding = value as Record<string, unknown>;
    if (
      typeof binding.path !== "string" ||
      typeof binding.fileSha256 !== "string"
    ) {
      continue;
    }
    const actual = readCorpusPreLiveRebaselineFileBinding(
      input.root,
      binding.path,
    );
    if (actual.sha256 !== binding.fileSha256) {
      throw new Error(
        `Source-registration code binding drift: ${binding.path}`,
      );
    }
    add(actual);
    sourceRegistrationFileBindingCount += 1;
  }
  if (sourceRegistrationFileBindingCount === 0) {
    throw new Error("Source-registration receipt binds no code files");
  }
  for (const binding of input.privateRecoveryInputs) add(binding);
  const outputs = outputMap(input.proposedOutputs);
  for (const manifestPath of [
    CORPUS_PROCESSING_PATHS.generationManifest,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ]) {
    const manifest = JSON.parse(outputs.get(manifestPath)!) as {
      inputs: ManifestDescriptor[];
    };
    for (const descriptor of manifest.inputs) {
      if (replacePaths.has(descriptor.path)) continue;
      const actual = readCorpusPreLiveRebaselineFileBinding(
        input.root,
        descriptor.path,
      );
      assert.deepEqual(
        actual,
        descriptor,
        `Proposed manifest input drift: ${descriptor.path}`,
      );
      add(actual);
    }
  }
  return [...bindings.values()].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );
}

export async function buildCorpusPreLiveRebaselinePackage(input: {
  root: string;
  options: CorpusPreLiveRebaselineCliOptions;
  observedAt: string;
}): Promise<{
  plan: CorpusPreLiveRebaselinePlan;
  outputs: CorpusPreLiveRebaselineOutput[];
  finalManifest: (
    committedAt: string,
    sealedPlan?: CorpusPreLiveRebaselinePlan,
  ) => CorpusPreLiveRebaselineCommitManifest;
  reobserveDatabase: () => Promise<CorpusPreLiveRebaselineDatabaseObservation>;
}> {
  if (
    !Number.isFinite(Date.parse(input.observedAt)) ||
    !input.observedAt.endsWith("Z")
  ) {
    throw new Error("New corpus rebaseline observedAt must be a UTC timestamp");
  }
  const old = inspectPreLiveBootstrap(input.root);
  const ledgerContent = readText(input.root, CORPUS_PROCESSING_LEDGER_PATH);
  assert.equal(
    CORPUS_PROCESSING_LEDGER_PATH,
    LIBRARY_ANALYSIS_LEDGER_PATH,
    "Library ledger path contract drifted",
  );
  const currentLedger = readCorpusPreLiveRebaselineFileBinding(
    input.root,
    CORPUS_PROCESSING_LEDGER_PATH,
  );
  if (currentLedger.sha256 === old.historicalLedger.sha256) {
    throw new Error(
      "Library ledger still equals the old bootstrap; export the exact post-registration ledger first",
    );
  }
  const privateRecovery = inspectCommittedPrivateRecoveryBundle({
    root: input.root,
    primaryCorpusRoot: input.options.primaryCorpusRoot,
    replicaCorpusRoot: input.options.replicaCorpusRoot,
  });
  const observed = await observeDatabaseAndLedger({
    root: input.root,
    options: input.options,
    ledgerContent,
    observedAt: input.observedAt,
    privateRecoveryPlan: privateRecovery.plan,
  });
  assertPrivateRecoveryAuditMatchesObservation({
    ...privateRecovery,
    sourceRegistrationAudit: observed.inspection.audit,
  });
  if (observed.liveRows.length !== old.baseline.expectedActiveRows + 10) {
    throw new Error(
      "Post-registration active inventory is not old baseline plus exactly 10",
    );
  }
  const baseline = newBaseline(
    old.baseline,
    observed.snapshot,
    input.observedAt,
  );
  const baselineContent = prettyJson(baseline);
  const snapshotContent = prettyJson(observed.snapshot);
  const corpus = buildCorpusProcessingRebaselineArtifacts({
    root: input.root,
    baselineContent,
    liveSnapshotContent: snapshotContent,
    ledgerContent,
  });
  const eventBootstrap = buildEmptyCorpusStateRebaselineBootstrap(
    input.observedAt,
  );
  const coreOutputs: CorpusPreLiveRebaselineOutput[] = [
    { path: CORPUS_PROCESSING_BASELINE_PATH, content: baselineContent },
    { path: LIVE_INVENTORY_SNAPSHOT_PATH, content: snapshotContent },
    ...corpus.bundle,
    ...eventBootstrap.bundle,
  ];
  const currentOverrides = new Map<string, string>([
    ...coreOutputs.map((output) => [output.path, output.content] as const),
  ]);
  const currentState = buildCorpusCurrentStateRebaselineArtifacts({
    root: input.root,
    overlays: currentOverrides,
  });
  coreOutputs.push(...currentState.bundle);
  const core = outputMap(coreOutputs);
  assertCorpusPreLiveRebaselineNoPromotion(
    core.get(CORPUS_PROCESSING_PATHS.register)!,
    core.get(CORPUS_CURRENT_STATE_PATHS.currentState)!,
  );
  const nextBootstrap: CorpusPreLiveRebaselineNamedBootstrapBindings = {
    baseline: bindingFromOutput(core, CORPUS_PROCESSING_BASELINE_PATH),
    liveInventorySnapshot: bindingFromOutput(
      core,
      LIVE_INVENTORY_SNAPSHOT_PATH,
    ),
    libraryLedger: currentLedger,
    corpusRegister: bindingFromOutput(core, CORPUS_PROCESSING_PATHS.register),
    corpusGenerationManifest: bindingFromOutput(
      core,
      CORPUS_PROCESSING_PATHS.generationManifest,
    ),
    currentState: bindingFromOutput(
      core,
      CORPUS_CURRENT_STATE_PATHS.currentState,
    ),
    currentStateGenerationManifest: bindingFromOutput(
      core,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ),
    eventLog: bindingFromOutput(core, CORPUS_CURRENT_STATE_PATHS.events),
    eventManifest: bindingFromOutput(
      core,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
    ),
    anchorLog: bindingFromOutput(
      core,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ),
  };
  const history = sealCorpusPreLiveRebaselineHistoryRecord({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    recordType: "corpus_pre_live_rebaseline_history",
    rebaselineVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    recordId: `rebaseline.bootstrap.${sha256(
      canonicalJson({
        previous: old.bindings.baseline.sha256,
        next: nextBootstrap.baseline.sha256,
        audit: observed.observation.sourceRegistration.audit.recordSha256,
      }),
    ).slice(0, 24)}`,
    sequence: 1,
    predecessorRecordSha256: null,
    observedAt: input.observedAt,
    previousBootstrap: old.bindings,
    nextBootstrap,
    sourceRegistration: observed.observation.sourceRegistration,
    currentExportedLedger: currentLedger,
    safetyBoundary: SAFETY_BOUNDARY,
    lineageMeaning:
      "sealed_bootstrap_replacement_not_lifecycle_event_or_trusted_anchor",
  });
  const outputs = [
    ...coreOutputs,
    {
      path: CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
      content: corpusPreLiveRebaselineHistoryContent(history),
    },
  ];
  outputMap(outputs);
  const casInputs = collectCasInputs({
    root: input.root,
    oldBootstrap: old.bindings,
    currentLedger,
    proposedOutputs: outputs,
    sourceRegistrationCodeBindings: observed.inspection.summary.codeBindings,
    privateRecoveryInputs: privateRecovery.compareAndSwapInputs,
  });
  const proposedOutputs = outputs.map((output) =>
    corpusPreLiveRebaselineFileBinding(output.path, output.content),
  );
  assertCorpusPreLiveRebaselineBindingsCurrent(input.root, casInputs);
  assertCorpusPreLiveRebaselinePathsAbsent(input.root, [
    CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
    CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
    CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_JOURNAL_PATH,
    CORPUS_PRE_LIVE_REBASELINE_TRANSACTION_DATA_PATH,
  ]);
  const plan = sealCorpusPreLiveRebaselinePlan({
    schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
    artifactType: "corpus_pre_live_rebaseline_plan",
    planVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
    planId: `corpus-pre-live-rebaseline.${input.observedAt.replaceAll(/[^0-9]/g, "")}`,
    mode: "read_only_plan",
    createdAt: new Date().toISOString(),
    newObservedAt: input.observedAt,
    oldBootstrap: old.bindings,
    currentExportedLedger: currentLedger,
    sourceRegistration: observed.observation.sourceRegistration,
    databaseObservation: observed.observation,
    compareAndSwapInputs: casInputs,
    expectedAbsentPaths: [
      CORPUS_PRE_LIVE_REBASELINE_HISTORY_PATH,
      CORPUS_PRE_LIVE_REBASELINE_MANIFEST_PATH,
    ],
    proposedOutputs,
    safetyBoundary: SAFETY_BOUNDARY,
  });
  const finalManifest = (
    committedAt: string,
    sealedPlan: CorpusPreLiveRebaselinePlan = plan,
  ): CorpusPreLiveRebaselineCommitManifest =>
    sealCorpusPreLiveRebaselineCommitManifest({
      schemaVersion: CORPUS_PRE_LIVE_REBASELINE_SCHEMA_VERSION,
      artifactType: "corpus_pre_live_rebaseline_commit_manifest",
      manifestVersion: CORPUS_PRE_LIVE_REBASELINE_VERSION,
      manifestId: "corpus-pre-live-rebaseline-generation-manifest.v1",
      committedAt,
      newObservedAt: sealedPlan.newObservedAt,
      planSha256: sealedPlan.planSha256,
      databaseObservationSha256:
        sealedPlan.databaseObservation.observationSha256,
      databaseStateSha256: sealedPlan.databaseObservation.stateSha256,
      historyRecordSha256: history.recordSha256,
      compareAndSwapInputSetSha256: corpusPreLiveRebaselineBindingSetSha256(
        sealedPlan.compareAndSwapInputs,
      ),
      inputs: sealedPlan.compareAndSwapInputs,
      outputs: sealedPlan.proposedOutputs,
      safetyBoundary: SAFETY_BOUNDARY,
      commitMarkerSemantics:
        "recoverable_journaled_bundle_with_durable_backups_per_file_atomic_rename_and_manifest_last",
      externalAnchorNextStep:
        "prepare_new_external_request_against_new_baseline_register_generation_manifest_and_genesis_candidate",
    });
  const reobserveDatabase = async () => {
    const refreshedPrivateRecovery = inspectCommittedPrivateRecoveryBundle({
      root: input.root,
      primaryCorpusRoot: input.options.primaryCorpusRoot,
      replicaCorpusRoot: input.options.replicaCorpusRoot,
    });
    const refreshed = await observeDatabaseAndLedger({
      root: input.root,
      options: input.options,
      ledgerContent: readText(input.root, CORPUS_PROCESSING_LEDGER_PATH),
      observedAt: input.observedAt,
      privateRecoveryPlan: refreshedPrivateRecovery.plan,
    });
    assertPrivateRecoveryAuditMatchesObservation({
      ...refreshedPrivateRecovery,
      sourceRegistrationAudit: refreshed.inspection.audit,
    });
    if (
      canonicalCorpusPreLiveRebaselineJson(
        refreshedPrivateRecovery.compareAndSwapInputs,
      ) !==
      canonicalCorpusPreLiveRebaselineJson(privateRecovery.compareAndSwapInputs)
    ) {
      throw new Error(
        "Private-recovery proof changed before corpus rebaseline commit",
      );
    }
    return refreshed.observation;
  };
  return { plan, outputs, finalManifest, reobserveDatabase };
}

function readPlanFile(path: string): CorpusPreLiveRebaselinePlan {
  const resolved = resolve(path);
  if (!isAbsolute(resolved) || !existsSync(resolved)) {
    throw new Error("Corpus rebaseline plan file must exist");
  }
  const stat = lstatSync(resolved);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(
      "Corpus rebaseline plan must be a regular non-symlink file",
    );
  }
  return validateCorpusPreLiveRebaselinePlan(
    JSON.parse(readFileSync(resolved, "utf8")),
  );
}

async function main(): Promise<void> {
  const root = process.cwd();
  const options = parseCorpusPreLiveRebaselineArgs(process.argv.slice(2));
  if (options.mode === "recover") {
    const result = recoverCorpusPreLiveRebaselineTransaction({
      root,
      acknowledgement: options.acknowledgement!,
    });
    process.stdout.write(`${prettyJson({ recoveryState: result })}`);
    return;
  }
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required for the read-only corpus rebaseline inspection",
    );
  }
  if (options.mode === "plan") {
    const observedAt = new Date().toISOString();
    const prepared = await buildCorpusPreLiveRebaselinePackage({
      root,
      options,
      observedAt,
    });
    process.stdout.write(prettyJson(prepared.plan));
    process.stderr.write(
      `Read-only corpus rebaseline plan ${prepared.plan.planSha256}; apply acknowledgement: ${corpusPreLiveRebaselineApplyAcknowledgement(prepared.plan.planSha256)}\n`,
    );
    return;
  }
  const sealedPlan = readPlanFile(options.planFile!);
  const prepared = await buildCorpusPreLiveRebaselinePackage({
    root,
    options,
    observedAt: sealedPlan.newObservedAt,
  });
  const rebuiltBindings = prepared.outputs
    .map((output) =>
      corpusPreLiveRebaselineFileBinding(output.path, output.content),
    )
    .sort((left, right) => left.path.localeCompare(right.path, "en"));
  if (
    canonicalCorpusPreLiveRebaselineJson(rebuiltBindings) !==
      canonicalCorpusPreLiveRebaselineJson(sealedPlan.proposedOutputs) ||
    prepared.plan.databaseObservation.stateSha256 !==
      sealedPlan.databaseObservation.stateSha256 ||
    canonicalCorpusPreLiveRebaselineJson(prepared.plan.compareAndSwapInputs) !==
      canonicalCorpusPreLiveRebaselineJson(sealedPlan.compareAndSwapInputs)
  ) {
    throw new Error(
      "Sealed corpus rebaseline plan cannot be reproduced exactly",
    );
  }
  const finalManifest = prepared.finalManifest(
    new Date().toISOString(),
    sealedPlan,
  );
  await commitCorpusPreLiveRebaseline({
    root,
    plan: sealedPlan,
    acknowledgement: options.acknowledgement!,
    outputs: prepared.outputs,
    finalManifest,
    revalidateDatabaseObservation: prepared.reobserveDatabase,
  });
  process.stdout.write(
    `${corpusPreLiveRebaselineManifestContent(finalManifest)}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
