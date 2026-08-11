#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  type Stats,
} from "node:fs";
import {
  isAbsolute,
  join,
  normalize,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";

import {
  CORPUS_EXTERNAL_ANCHOR_HEAD_FILE,
  CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE,
  corpusExternalAnchorRepositoryBaselineInputsSchema,
  createCorpusExternalAnchorVerifier,
  hashCorpusExternalAnchorLedgerHead,
  loadRootOwnedCorpusExternalAnchorLedger,
  requireRequestIsLatestExternalAppend,
  type CorpusExternalAnchorLedgerSnapshot,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  CorpusRepositoryBundleFileBindingSchema,
  commitCorpusRepositoryBundleTransaction,
  corpusRepositoryBundleBindingSetSha256,
  corpusRepositoryBundleFileBinding,
  readCorpusRepositoryBundleFileBinding,
  readCorpusRepositoryBundleTransactionJournal,
  recoverCorpusRepositoryBundleTransaction,
  validateCorpusRepositoryBundleTransactionJournal,
  type CorpusRepositoryBundleFileBinding,
  type CorpusRepositoryBundleOutput,
  type CorpusRepositoryBundleTransactionFaultPoint,
  type CorpusRepositoryBundleTransactionJournal,
} from "../../src/lib/knowledge/corpus-repository-bundle-transaction";
import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import type { CorpusProcessingCurrentState } from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  serializeCorpusPendingEventAppendPlan,
  validateCorpusPendingEventAppendPlan,
  type CorpusPendingEventAppendPlan,
} from "./append-corpus-pending-event";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  buildCorpusPendingEventTransitionArtifacts,
  writeOrCheckCorpusCurrentStateArtifacts,
  type CorpusCurrentStateArtifacts,
} from "./generate-corpus-processing-current-state";
import {
  CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
  readAndValidateRepositoryAnchorContext,
  readCorpusExternalAnchorPreparedRequestFile,
  requireRequestMatchesRepository,
  type CorpusExternalAnchorPreparedRequestFile,
} from "./manage-corpus-external-anchor-ledger";

export const CORPUS_EVENT_CHECKPOINT_FINALIZER_SCHEMA_VERSION =
  "corpus-event-checkpoint-finalizer-plan-v1" as const;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_VERSION = "1.0.0" as const;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_PLAN_HASH_DOMAIN =
  "food-systems/corpus-event-checkpoint-finalizer-plan/v1\n" as const;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_TRANSACTION_KIND =
  "corpus.event.checkpoint.finalize.v1" as const;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_REQUIRED_IDENTITY_COUNT =
  1565 as const;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER =
  CORPUS_CURRENT_STATE_PATHS.generationManifest;
export const CORPUS_EVENT_CHECKPOINT_FINALIZER_MAX_PLAN_BYTES =
  64 * 1024 * 1024;

export const CORPUS_EVENT_CHECKPOINT_FINALIZER_IMPLEMENTATION_PATHS =
  Object.freeze([
    "package.json",
    "package-lock.json",
    "scripts/knowledge/finalize-corpus-event-checkpoint.ts",
    "scripts/knowledge/append-corpus-pending-event.ts",
    "scripts/knowledge/generate-corpus-processing-current-state.ts",
    "scripts/knowledge/manage-corpus-external-anchor-ledger.ts",
    "src/lib/knowledge/corpus-event-history-external-ledger.ts",
    "src/lib/knowledge/corpus-processing-current-state.ts",
    "src/lib/knowledge/corpus-processing-event-history.ts",
    "src/lib/knowledge/corpus-processing-lifecycle.ts",
    "src/lib/knowledge/corpus-repository-bundle-transaction.ts",
    "knowledge/corpus/CORPUS-EVENT-CHECKPOINT-FINALIZER.md",
    "knowledge/corpus/CORPUS-PENDING-EVENT-WRITER.md",
    "knowledge/corpus/CORPUS-PROCESSING-CURRENT-STATE.md",
    "knowledge/schema/corpus-processing-state-event.schema.v1.json",
    "knowledge/schema/corpus-processing-event-history-anchor.schema.v1.json",
    "knowledge/schema/corpus-processing-current-state.schema.v1.json",
    "tests/lib/corpus-event-checkpoint-finalizer.test.ts",
    "tests/lib/corpus-pending-event-writer.test.ts",
    "tests/lib/corpus-processing-current-state-generator.test.ts",
  ] as const);

const BASELINE_GENERATION_MANIFEST_PATH =
  "knowledge/corpus/corpus-processing-generation-manifest.v1.json";
const prefixedSha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const utcTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
const portablePathSchema = z
  .string()
  .min(1)
  .refine((value) => {
    if (
      value.startsWith("/") ||
      value.startsWith("~") ||
      value.includes("\\") ||
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) ||
      /[\u0000-\u001f\u007f]/.test(value)
    ) {
      return false;
    }
    return value
      .split("/")
      .every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      );
  });
const outputBindingSchema = CorpusRepositoryBundleFileBindingSchema.extend({
  mode: z.number().int().min(0).max(0o777),
})
  .strict()
  .refine((value) => (value.mode & 0o400) !== 0, {
    message: "output mode must remain owner-readable",
  });
const outsideArtifactBindingSchema = z
  .object({
    fileSha256: prefixedSha256Schema,
    sizeBytes: z.number().int().positive(),
    artifactSha256: prefixedSha256Schema,
    artifactId: identifierSchema,
  })
  .strict();
const externalAuthoritySchema = z
  .object({
    authorityRoot: z.literal(CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT),
    ledger: CorpusRepositoryBundleFileBindingSchema.extend({
      path: z.literal(CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE),
    }).strict(),
    head: CorpusRepositoryBundleFileBindingSchema.extend({
      path: z.literal(CORPUS_EXTERNAL_ANCHOR_HEAD_FILE),
    }).strict(),
    recordCount: z.number().int().positive(),
    latestRecordSha256: prefixedSha256Schema,
    headSha256: prefixedSha256Schema,
  })
  .strict();
const anchorRecordBindingSchema = z
  .object({
    id: identifierSchema,
    sequence: z.number().int().positive(),
    recordSha256: prefixedSha256Schema,
    eventCount: z.number().int().nonnegative(),
  })
  .strict();
const verificationBindingSchema = z
  .object({
    id: identifierSchema,
    sequence: z.number().int().positive(),
    recordSha256: prefixedSha256Schema,
  })
  .strict();
const resolvedEvidenceSchema = z
  .object({
    trackedArtifacts: z.array(
      z
        .object({
          artifactType: z.string().min(1),
          artifactId: identifierSchema,
          artifactVersion: z.string().min(1),
          path: portablePathSchema,
          fileSha256: prefixedSha256Schema,
          sizeBytes: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    sourceContents: z.array(
      z
        .object({
          artifactId: identifierSchema,
          artifactVersion: z.string().min(1),
          locator: z.string().min(1),
          contentSha256: prefixedSha256Schema,
          sizeBytes: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    normalizedTextUnits: z.array(
      z
        .object({
          locator: z.string().min(1),
          contentSha256: prefixedSha256Schema,
          sizeBytes: z.number().int().nonnegative(),
        })
        .strict(),
    ),
    absolutePrivatePathsPersisted: z.literal(false),
    sourceTextPersisted: z.literal(false),
  })
  .strict();

const repositoryStateSchema = z
  .object({
    eventLog: CorpusRepositoryBundleFileBindingSchema,
    eventManifest: CorpusRepositoryBundleFileBindingSchema,
    anchorLog: CorpusRepositoryBundleFileBindingSchema,
    currentState: CorpusRepositoryBundleFileBindingSchema,
    summary: CorpusRepositoryBundleFileBindingSchema,
    conflictQueue: CorpusRepositoryBundleFileBindingSchema,
    generationManifest: CorpusRepositoryBundleFileBindingSchema,
    anchorRecordCount: z.number().int().min(3),
    trustedPairCount: z.number().int().positive(),
    eventCount: z.number().int().positive(),
  })
  .strict();

const planBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_EVENT_CHECKPOINT_FINALIZER_SCHEMA_VERSION),
    artifactType: z.literal("corpus_event_checkpoint_finalizer_plan"),
    planVersion: z.literal(CORPUS_EVENT_CHECKPOINT_FINALIZER_VERSION),
    planId: identifierSchema,
    createdAt: utcTimestampSchema,
    transactionId: identifierSchema,
    transactionKind: z.literal(
      CORPUS_EVENT_CHECKPOINT_FINALIZER_TRANSACTION_KIND,
    ),
    requestFile: outsideArtifactBindingSchema,
    pendingPlanFile: outsideArtifactBindingSchema,
    externalAuthority: externalAuthoritySchema,
    repositoryBaselineInputs:
      corpusExternalAnchorRepositoryBaselineInputsSchema,
    repositoryBefore: repositoryStateSchema,
    previousTrusted: z
      .object({
        eventLog: CorpusRepositoryBundleFileBindingSchema,
        eventManifest: CorpusRepositoryBundleFileBindingSchema,
        anchorLog: CorpusRepositoryBundleFileBindingSchema,
        eventCount: z.number().int().nonnegative(),
        projectionOutputs: z
          .array(CorpusRepositoryBundleFileBindingSchema)
          .length(4),
      })
      .strict(),
    pendingCandidate: anchorRecordBindingSchema,
    verification: verificationBindingSchema,
    resolvedEventEvidence: resolvedEvidenceSchema,
    compareAndSwapInputs: z
      .array(CorpusRepositoryBundleFileBindingSchema)
      .min(1),
    compareAndSwapInputSetSha256: prefixedSha256Schema,
    orderedOutputs: z.array(outputBindingSchema).length(5),
    finalCommitMarkerPath: z.literal(
      CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER,
    ),
    eligibility: z
      .object({
        policy: z.enum(["production_fixed_1565", "test_only_fixture"]),
        requiredIdentityCount: z.number().int().positive(),
        observedIdentityCount: z.number().int().positive(),
        previousTrustedEventCount: z.number().int().nonnegative(),
        pendingEventCount: z.number().int().positive(),
        previousTrustedPairCount: z.number().int().positive(),
        externalRecordCount: z.number().int().min(2),
        oneEventOnly: z.literal(true),
        ownerConfirmationEventAllowed: z.literal(false),
      })
      .strict(),
    operationSemantics: z
      .object({
        trustedVerificationAppended: z.literal(true),
        canonicalProjectionPublished: z.literal(true),
        eventLogReplaced: z.literal(false),
        eventManifestReplaced: z.literal(false),
        repositoryFilesReplaced: z.literal(5),
        generationManifestInstalledLast: z.literal(true),
        externalAuthorityReadOnly: z.literal(true),
      })
      .strict(),
    safetyBoundary: z
      .object({
        externalLedgerMutationPerformed: z.literal(false),
        lifecycleEventCreated: z.literal(false),
        humanDecisionCreated: z.literal(false),
        rightsCleared: z.literal(false),
        externalUseAllowed: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
        researchCompletenessClaimed: z.literal(false),
      })
      .strict(),
  })
  .strict();
const planSchema = planBodySchema
  .extend({ planSha256: prefixedSha256Schema })
  .strict();

export type CorpusEventCheckpointFinalizerPlan = z.infer<typeof planSchema>;
type EligibilityPolicy = Pick<
  CorpusEventCheckpointFinalizerPlan["eligibility"],
  "policy" | "requiredIdentityCount"
>;
type StableFile = {
  bytes: Buffer;
  binding: CorpusRepositoryBundleFileBinding;
  mode: number;
};
type StableOutsideFile = {
  bytes: Buffer;
  fileSha256: string;
  sizeBytes: number;
};
type PendingPlanFile = StableOutsideFile & {
  plan: CorpusPendingEventAppendPlan;
};
type Proposal = {
  body: z.infer<typeof planBodySchema>;
  outputs: CorpusRepositoryBundleOutput[];
};

const SAFETY_BOUNDARY = Object.freeze({
  externalLedgerMutationPerformed: false as const,
  lifecycleEventCreated: false as const,
  humanDecisionCreated: false as const,
  rightsCleared: false as const,
  externalUseAllowed: false as const,
  coveragePromotionAllowed: false as const,
  researchCompletenessClaimed: false as const,
});

function fail(message: string): never {
  throw new Error(`Corpus event-checkpoint finalizer failed: ${message}`);
}

function sameJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function planHash(body: z.infer<typeof planBodySchema>): string {
  return `sha256:${createHash("sha256")
    .update(CORPUS_EVENT_CHECKPOINT_FINALIZER_PLAN_HASH_DOMAIN)
    .update(canonicalCorpusJson(body as unknown as CorpusCanonicalJsonValue))
    .digest("hex")}`;
}

function canonicalRoot(root: string): string {
  if (!isAbsolute(root) || normalize(root) !== root) {
    fail("repository root must be absolute and normalized");
  }
  const canonical = realpathSync(root);
  const stat = lstatSync(canonical);
  if (canonical !== root || !stat.isDirectory() || stat.isSymbolicLink()) {
    fail("repository root must be a canonical real directory");
  }
  return canonical;
}

function projectFile(root: string, path: string): string {
  portablePathSchema.parse(path);
  const target = resolve(root, path);
  const relation = relative(root, target);
  if (relation === ".." || relation.startsWith(`..${sep}`)) {
    fail(`repository path escapes the root: ${path}`);
  }
  return target;
}

function stableMetadataEqual(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

function readStableRepositoryFile(root: string, path: string): StableFile {
  const absolute = projectFile(root, path);
  const canonical = realpathSync(absolute);
  if (canonical !== absolute)
    fail(`repository file crosses a symlink: ${path}`);
  const before = lstatSync(absolute);
  if (before.isSymbolicLink() || !before.isFile() || before.nlink !== 1) {
    fail(`repository file must be a one-link regular file: ${path}`);
  }
  const descriptor = openSync(
    absolute,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const openedBefore = fstatSync(descriptor);
    if (!stableMetadataEqual(before, openedBefore)) {
      fail(`repository file changed while opening: ${path}`);
    }
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfter = lstatSync(absolute);
    if (
      bytes.length !== openedAfter.size ||
      !stableMetadataEqual(openedBefore, openedAfter) ||
      !stableMetadataEqual(openedAfter, pathAfter)
    ) {
      fail(`repository file changed while reading: ${path}`);
    }
    return {
      bytes,
      binding: corpusRepositoryBundleFileBinding(path, bytes),
      mode: openedAfter.mode & 0o777,
    };
  } finally {
    closeSync(descriptor);
  }
}

function assertAbsoluteOutsideRepository(
  repositoryRoot: string,
  path: string,
  label: string,
): void {
  if (
    !isAbsolute(path) ||
    normalize(path) !== path ||
    path.includes("\u0000") ||
    (path !== parse(path).root && path.endsWith(sep))
  ) {
    fail(`${label} path must be absolute and normalized`);
  }
  const relation = relative(repositoryRoot, path);
  if (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== "..")
  ) {
    fail(`${label} must be outside the repository`);
  }
}

function readStableOutsideFile(
  repositoryRoot: string,
  path: string,
  label: string,
): StableOutsideFile {
  assertAbsoluteOutsideRepository(repositoryRoot, path, label);
  const filesystemRoot = parse(path).root;
  let current = filesystemRoot;
  for (const component of path.slice(filesystemRoot.length).split(sep)) {
    if (!component) continue;
    current = join(current, component);
    if (lstatSync(current).isSymbolicLink()) {
      fail(`${label} path must not cross a symlink`);
    }
  }
  const before = lstatSync(path);
  const mode = before.mode & 0o777;
  if (
    before.isSymbolicLink() ||
    !before.isFile() ||
    before.nlink !== 1 ||
    (mode !== 0o400 && mode !== 0o600) ||
    before.size < 1 ||
    before.size > CORPUS_EVENT_CHECKPOINT_FINALIZER_MAX_PLAN_BYTES
  ) {
    fail(
      `${label} must be a 0400/0600 one-link regular file within the size limit`,
    );
  }
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const openedBefore = fstatSync(descriptor);
    if (!stableMetadataEqual(before, openedBefore)) {
      fail(`${label} changed while opening`);
    }
    const bytes = readFileSync(descriptor);
    const openedAfter = fstatSync(descriptor);
    const pathAfter = lstatSync(path);
    if (
      bytes.length !== openedAfter.size ||
      !stableMetadataEqual(openedBefore, openedAfter) ||
      !stableMetadataEqual(openedAfter, pathAfter)
    ) {
      fail(`${label} changed while reading`);
    }
    return {
      bytes,
      fileSha256: corpusRepositoryBundleFileBinding("outside-input", bytes)
        .sha256,
      sizeBytes: bytes.length,
    };
  } finally {
    closeSync(descriptor);
  }
}

function parseJson(label: string, bytes: Buffer): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    fail(`${label} is invalid JSON or UTF-8: ${(error as Error).message}`);
  }
}

function generatedArtifact(
  artifacts: CorpusCurrentStateArtifacts,
  path: string,
): { path: string; content: string } {
  const matches = artifacts.bundle.filter((artifact) => artifact.path === path);
  if (matches.length !== 1) {
    fail(`projection produced ${matches.length} copies of ${path}`);
  }
  return matches[0]!;
}

function projectionBindings(
  artifacts: CorpusCurrentStateArtifacts,
): CorpusRepositoryBundleFileBinding[] {
  return [
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ].map((path) => {
    const artifact = generatedArtifact(artifacts, path);
    return corpusRepositoryBundleFileBinding(path, artifact.content);
  });
}

function requestFileOutsideRepository(
  repositoryRoot: string,
  requestPath: string,
): CorpusExternalAnchorPreparedRequestFile {
  assertAbsoluteOutsideRepository(
    repositoryRoot,
    requestPath,
    "prepared request",
  );
  return readCorpusExternalAnchorPreparedRequestFile(requestPath);
}

function pendingPlanFileOutsideRepository(
  repositoryRoot: string,
  pendingPlanPath: string,
): PendingPlanFile {
  const file = readStableOutsideFile(
    repositoryRoot,
    pendingPlanPath,
    "pending-event plan file",
  );
  const plan = validateCorpusPendingEventAppendPlan(
    parseJson("pending-event plan file", file.bytes),
  );
  if (
    file.bytes.toString("utf8") !== serializeCorpusPendingEventAppendPlan(plan)
  ) {
    fail("pending-event plan file is not canonical pretty JSON");
  }
  return { ...file, plan };
}

function requestFileBinding(
  requestFile: CorpusExternalAnchorPreparedRequestFile,
) {
  return outsideArtifactBindingSchema.parse({
    fileSha256: requestFile.fileSha256,
    sizeBytes: requestFile.sizeBytes,
    artifactSha256: requestFile.request.requestSha256,
    artifactId: requestFile.request.requestId,
  });
}

function pendingPlanFileBinding(pendingPlanFile: PendingPlanFile) {
  return outsideArtifactBindingSchema.parse({
    fileSha256: pendingPlanFile.fileSha256,
    sizeBytes: pendingPlanFile.sizeBytes,
    artifactSha256: pendingPlanFile.plan.planSha256,
    artifactId: pendingPlanFile.plan.planId,
  });
}

function externalAuthorityBinding(
  snapshot: CorpusExternalAnchorLedgerSnapshot,
) {
  return externalAuthoritySchema.parse({
    authorityRoot: CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
    ledger: corpusRepositoryBundleFileBinding(
      CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE,
      snapshot.ledgerBytes,
    ),
    head: corpusRepositoryBundleFileBinding(
      CORPUS_EXTERNAL_ANCHOR_HEAD_FILE,
      snapshot.headBytes,
    ),
    recordCount: snapshot.head.recordCount,
    latestRecordSha256: snapshot.head.latestRecordSha256,
    headSha256: snapshot.head.headSha256,
  });
}

function predecessorExternalAuthorityBinding(
  snapshot: CorpusExternalAnchorLedgerSnapshot,
) {
  const records = snapshot.records.slice(0, -1);
  if (records.length === 0) {
    fail("event finalization has no predecessor external authority");
  }
  const ledgerBytes = Buffer.from(
    `${records.map((record) => JSON.stringify(record)).join("\n")}\n`,
    "utf8",
  );
  const first = records[0]!;
  const latest = records.at(-1)!;
  const headBody = {
    schemaVersion: snapshot.head.schemaVersion,
    recordType: snapshot.head.recordType,
    projectId: snapshot.head.projectId,
    ledgerId: snapshot.head.ledgerId,
    recordCount: records.length,
    ledgerFileSha256: `sha256:${createHash("sha256")
      .update(ledgerBytes)
      .digest("hex")}`,
    ledgerSizeBytes: ledgerBytes.length,
    firstRecordSha256: first.recordSha256,
    latestRecordSha256: latest.recordSha256,
    latestCandidateRecordSha256: latest.candidateRecordSha256,
    latestVerificationRecordSha256: latest.verificationRecordSha256,
    updatedAt: latest.appendedAt,
  };
  const head = {
    ...headBody,
    headSha256: hashCorpusExternalAnchorLedgerHead(headBody),
  };
  const headBytes = Buffer.from(`${JSON.stringify(head, null, 2)}\n`, "utf8");
  return externalAuthoritySchema.parse({
    authorityRoot: CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
    ledger: corpusRepositoryBundleFileBinding(
      CORPUS_EXTERNAL_ANCHOR_LEDGER_FILE,
      ledgerBytes,
    ),
    head: corpusRepositoryBundleFileBinding(
      CORPUS_EXTERNAL_ANCHOR_HEAD_FILE,
      headBytes,
    ),
    recordCount: records.length,
    latestRecordSha256: latest.recordSha256,
    headSha256: head.headSha256,
  });
}

function testAwareEligibilityPolicy(
  testOnlyExpectedIdentityCount?: number,
): EligibilityPolicy {
  if (testOnlyExpectedIdentityCount === undefined) {
    return {
      policy: "production_fixed_1565",
      requiredIdentityCount:
        CORPUS_EVENT_CHECKPOINT_FINALIZER_REQUIRED_IDENTITY_COUNT,
    };
  }
  if (
    process.env.NODE_ENV !== "test" ||
    !Number.isInteger(testOnlyExpectedIdentityCount) ||
    testOnlyExpectedIdentityCount < 1
  ) {
    fail("non-production identity-count policy is test-only");
  }
  return {
    policy: "test_only_fixture",
    requiredIdentityCount: testOnlyExpectedIdentityCount,
  };
}

function loadProductionExternalSnapshot(
  repositoryRoot: string,
): CorpusExternalAnchorLedgerSnapshot {
  const repository = realpathSync(repositoryRoot);
  const external = realpathSync(CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT);
  const relation = relative(repository, external);
  if (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) && relation !== "..")
  ) {
    fail("fixed external authority overlaps the repository");
  }
  const snapshot = loadRootOwnedCorpusExternalAnchorLedger(
    CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
  );
  if (!snapshot) fail("fixed external authority has no ledger snapshot");
  return snapshot;
}

function loadPolicyBoundExternalSnapshot(input: {
  repositoryRoot: string;
  policy: EligibilityPolicy;
  testOnlyInjectedLoader?: () => CorpusExternalAnchorLedgerSnapshot;
}): CorpusExternalAnchorLedgerSnapshot {
  if (input.policy.policy === "test_only_fixture") {
    if (process.env.NODE_ENV !== "test" || !input.testOnlyInjectedLoader) {
      fail("test-only external snapshot injection requires NODE_ENV=test");
    }
    return input.testOnlyInjectedLoader();
  }
  if (input.testOnlyInjectedLoader) {
    fail("external snapshot injection is test-only");
  }
  return loadProductionExternalSnapshot(input.repositoryRoot);
}

function eligibilityPolicyFromPlan(
  plan: CorpusEventCheckpointFinalizerPlan,
  testOnlyExpectedIdentityCount?: number,
): EligibilityPolicy {
  const policy = testAwareEligibilityPolicy(testOnlyExpectedIdentityCount);
  if (
    policy.policy !== plan.eligibility.policy ||
    policy.requiredIdentityCount !== plan.eligibility.requiredIdentityCount
  ) {
    fail("runtime identity-count policy differs from the sealed plan");
  }
  return policy;
}

function addExactBinding(
  bindings: Map<string, CorpusRepositoryBundleFileBinding>,
  binding: CorpusRepositoryBundleFileBinding,
): void {
  const parsed = CorpusRepositoryBundleFileBindingSchema.parse(binding);
  const existing = bindings.get(parsed.path);
  if (existing && !sameJson(existing, parsed)) {
    fail(`conflicting compare-and-swap binding: ${parsed.path}`);
  }
  bindings.set(parsed.path, parsed);
}

function manifestDescriptorToBinding(value: unknown) {
  const descriptor = z
    .object({
      path: portablePathSchema,
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      sizeBytes: z.number().int().nonnegative(),
    })
    .strict()
    .parse(value);
  return CorpusRepositoryBundleFileBindingSchema.parse({
    path: descriptor.path,
    sha256: `sha256:${descriptor.sha256}`,
    sizeBytes: descriptor.sizeBytes,
  });
}

function parseGenerationManifest(bytes: Buffer) {
  return z
    .object({
      inputs: z.array(z.unknown()),
      outputs: z.array(z.unknown()),
      resolvedEventEvidence: resolvedEvidenceSchema,
    })
    .passthrough()
    .parse(parseJson("current-state generation manifest", bytes));
}

function addManifestBindings(input: {
  root: string;
  manifest: ReturnType<typeof parseGenerationManifest>;
  cas: Map<string, CorpusRepositoryBundleFileBinding>;
  proposedPaths?: ReadonlySet<string>;
}): void {
  for (const descriptor of [
    ...input.manifest.inputs,
    ...input.manifest.outputs,
  ]) {
    const expected = manifestDescriptorToBinding(descriptor);
    if (input.proposedPaths?.has(expected.path)) continue;
    const current = readCorpusRepositoryBundleFileBinding(
      input.root,
      expected.path,
    );
    if (!sameJson(current, expected)) {
      fail(`generation-manifest dependency drifted: ${expected.path}`);
    }
    addExactBinding(input.cas, current);
  }
  for (const artifact of input.manifest.resolvedEventEvidence
    .trackedArtifacts) {
    const expected = CorpusRepositoryBundleFileBindingSchema.parse({
      path: artifact.path,
      sha256: artifact.fileSha256,
      sizeBytes: artifact.sizeBytes,
    });
    const current = readCorpusRepositoryBundleFileBinding(
      input.root,
      artifact.path,
    );
    if (!sameJson(current, expected)) {
      fail(`resolved tracked event artifact drifted: ${artifact.path}`);
    }
    addExactBinding(input.cas, current);
  }
  for (const content of input.manifest.resolvedEventEvidence.sourceContents) {
    if (content.locator.startsWith("private://")) continue;
    const path = portablePathSchema.parse(content.locator);
    const expected = CorpusRepositoryBundleFileBindingSchema.parse({
      path,
      sha256: content.contentSha256,
      sizeBytes: content.sizeBytes,
    });
    const current = readCorpusRepositoryBundleFileBinding(input.root, path);
    if (!sameJson(current, expected)) {
      fail(`resolved repository source content drifted: ${path}`);
    }
    addExactBinding(input.cas, current);
  }
}

function exactBinding(
  binding: CorpusRepositoryBundleFileBinding,
  path: string,
  content: string | Buffer,
): boolean {
  return sameJson(binding, corpusRepositoryBundleFileBinding(path, content));
}

function assertProtectedDecisionAxes(input: {
  before: CorpusCurrentStateArtifacts;
  after: CorpusCurrentStateArtifacts;
  pending: CorpusCurrentStateArtifacts;
  targetIdentity: string;
}): void {
  if (!sameJson(input.after.states, input.pending.states)) {
    fail("trusted finalization changed the Phase 1 hypothetical state rows");
  }
  const beforeByIdentity = new Map(
    input.before.states.map((state) => [state.identityKey, state]),
  );
  const afterByIdentity = new Map(
    input.after.states.map((state) => [state.identityKey, state]),
  );
  if (
    beforeByIdentity.size !== afterByIdentity.size ||
    !beforeByIdentity.has(input.targetIdentity) ||
    !afterByIdentity.has(input.targetIdentity)
  ) {
    fail("finalization projection identity set or event target changed");
  }
  let changedRows = 0;
  for (const [identityKey, before] of beforeByIdentity) {
    const after = afterByIdentity.get(identityKey);
    if (!after) fail(`finalization lost projection identity ${identityKey}`);
    if (!sameJson(before, after)) changedRows += 1;
    if (identityKey !== input.targetIdentity && !sameJson(before, after)) {
      fail(`event changed a non-target projection row: ${identityKey}`);
    }
    for (const field of [
      "ownerReviewStatus",
      "sourceRoleConfirmationStatus",
      "independentValidationStatus",
      "partnerValidationStatus",
      "rightsHolderValidationStatus",
      "rightsStatus",
      "publicationStatus",
      "coverageStatus",
    ] as const) {
      if (!sameJson(before.lifecycle[field], after.lifecycle[field])) {
        fail(`event changed protected decision axis ${field}`);
      }
    }
    const permissions = after.permissions;
    if (
      permissions.sourceRoleOwnerConfirmed ||
      permissions.ownerApprovedForInternalUse ||
      permissions.independentlyValidated ||
      permissions.partnerValidated ||
      permissions.rightsHolderValidated ||
      permissions.rightsClearedForInternalUse ||
      permissions.rightsClearedForExternalPublication ||
      permissions.externalUseAllowed ||
      permissions.coveragePromotionAllowed
    ) {
      fail(
        "event projection promotes a protected human, rights or coverage permission",
      );
    }
  }
  if (changedRows !== 1) {
    fail(
      `event must change exactly one projection row; observed ${changedRows}`,
    );
  }
  if (input.after.conflictQueue.length !== 0) {
    fail("final projection conflict queue is not empty");
  }
}

function assertPendingPlanAndTransition(input: {
  pendingPlan: CorpusPendingEventAppendPlan;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  policy: EligibilityPolicy;
  current: {
    eventLog: StableFile;
    eventManifest: StableFile;
    anchorLog: StableFile;
    currentState: StableFile;
    summary: StableFile;
    conflictQueue: StableFile;
    generationManifest: StableFile;
  };
  transition: ReturnType<typeof buildCorpusPendingEventTransitionArtifacts>;
  anchorRecordCount: number;
  trustedPairCount: number;
}): void {
  const plan = validateCorpusPendingEventAppendPlan(input.pendingPlan);
  const request = input.requestFile.request;
  const precondition = request.externalHeadPrecondition;
  if (!precondition) {
    fail(
      "event finalization requires a previously trusted external checkpoint",
    );
  }
  if (
    plan.eligibility.policy !== input.policy.policy ||
    plan.eligibility.requiredIdentityCount !==
      input.policy.requiredIdentityCount
  ) {
    fail("Phase 1 identity-count policy differs from finalizer policy");
  }
  if (
    !sameJson(
      plan.repositoryBaselineInputs,
      request.repositoryBaselineInputs,
    ) ||
    !sameJson(
      plan.externalAuthority,
      predecessorExternalAuthorityBinding(input.externalSnapshot),
    ) ||
    plan.externalAuthority.recordCount !== precondition.recordCount ||
    plan.externalAuthority.latestRecordSha256 !==
      precondition.latestRecordSha256 ||
    plan.externalAuthority.headSha256 !== precondition.headSha256 ||
    input.externalSnapshot.head.recordCount !== precondition.recordCount + 1
  ) {
    fail("Phase 1 external authority is not the request predecessor");
  }
  const outputFiles = [
    input.current.eventLog,
    input.current.eventManifest,
    input.current.anchorLog,
  ];
  if (
    plan.orderedOutputs.length !== outputFiles.length ||
    plan.orderedOutputs.some((output, index) => {
      const file = outputFiles[index]!;
      return (
        !sameJson(file.binding, {
          path: output.path,
          sha256: output.sha256,
          sizeBytes: output.sizeBytes,
        }) || file.mode !== output.mode
      );
    })
  ) {
    fail("current pending checkpoint differs from the Phase 1 outputs");
  }
  const previous = input.transition.previousTrusted;
  const previousProjection = projectionBindings(previous);
  const previousBindings = [
    corpusRepositoryBundleFileBinding(
      CORPUS_CURRENT_STATE_PATHS.events,
      input.transition.previousEventLogBytes,
    ),
    corpusRepositoryBundleFileBinding(
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      input.transition.previousEventManifestBytes,
    ),
    corpusRepositoryBundleFileBinding(
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      input.transition.previousEventHistoryAnchorBytes,
    ),
  ];
  const plannedPreviousBindings = [
    plan.repositoryBefore.eventLog,
    plan.repositoryBefore.eventManifest,
    plan.repositoryBefore.anchorLog,
  ];
  if (
    previousBindings.some(
      (binding, index) => !sameJson(binding, plannedPreviousBindings[index]),
    ) ||
    !sameJson(previousProjection, [
      plan.repositoryBefore.currentState,
      plan.repositoryBefore.summary,
      plan.repositoryBefore.conflictQueue,
      plan.repositoryBefore.generationManifest,
    ]) ||
    plan.repositoryBefore.eventCount !== previous.events.length ||
    plan.repositoryBefore.anchorRecordCount + 1 !== input.anchorRecordCount ||
    plan.repositoryBefore.trustedPairCount !== input.trustedPairCount
  ) {
    fail("Phase 1 plan does not bind the reconstructed previous trusted state");
  }
  const pending = input.transition.pending;
  const event = input.transition.pendingEvent;
  const eventBytes = Buffer.from(`${JSON.stringify(event)}\n`, "utf8");
  const eventFileBinding = corpusRepositoryBundleFileBinding(
    "outside-input",
    eventBytes,
  );
  if (
    event.eventType === "source_role_owner_confirmed_ready_package" ||
    event.eventId !== plan.eventFile.eventId ||
    event.eventSha256 !== plan.eventFile.eventSha256 ||
    event.eventType !== plan.eventFile.eventType ||
    eventFileBinding.sha256 !== plan.eventFile.fileSha256 ||
    eventFileBinding.sizeBytes !== plan.eventFile.sizeBytes ||
    plan.proposedCandidate.id !== request.candidate.anchorId ||
    plan.proposedCandidate.sequence !== request.candidate.sequence ||
    plan.proposedCandidate.recordSha256 !== request.candidate.recordSha256 ||
    plan.proposedCandidate.eventCount !== request.candidate.eventCount ||
    !sameJson(plan.projectedEvidence, generationEvidence(pending)) ||
    !sameJson(plan.hypotheticalProjectionOutputs, projectionBindings(pending))
  ) {
    fail("Phase 1 forward replay differs from its exact plan or request");
  }
  for (const [file, expected] of [
    [input.current.currentState, plan.repositoryBefore.currentState],
    [input.current.summary, plan.repositoryBefore.summary],
    [input.current.conflictQueue, plan.repositoryBefore.conflictQueue],
    [
      input.current.generationManifest,
      plan.repositoryBefore.generationManifest,
    ],
  ] as const) {
    if (!sameJson(file.binding, expected)) {
      fail(
        `old canonical projection drifted before finalization: ${expected.path}`,
      );
    }
  }
}

function generationManifest(
  artifacts: CorpusCurrentStateArtifacts,
): ReturnType<typeof parseGenerationManifest> {
  return parseGenerationManifest(
    Buffer.from(
      generatedArtifact(
        artifacts,
        CORPUS_CURRENT_STATE_PATHS.generationManifest,
      ).content,
      "utf8",
    ),
  );
}

function generationEvidence(
  artifacts: CorpusCurrentStateArtifacts,
): z.infer<typeof resolvedEvidenceSchema> {
  return generationManifest(artifacts).resolvedEventEvidence;
}

function buildProposal(input: {
  repositoryRoot: string;
  requestPath: string;
  pendingPlanPath: string;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  createdAt: string;
  policy: EligibilityPolicy;
}): Proposal {
  const root = canonicalRoot(input.repositoryRoot);
  const requestFile = requestFileOutsideRepository(root, input.requestPath);
  const pendingPlanFile = pendingPlanFileOutsideRepository(
    root,
    input.pendingPlanPath,
  );
  const request = requestFile.request;
  if (Date.parse(input.createdAt) < Date.parse(request.preparedAt)) {
    fail("finalizer plan creation predates the prepared request");
  }
  requireRequestIsLatestExternalAppend({
    request,
    snapshot: input.externalSnapshot,
  });
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: root,
    externalSnapshot: input.externalSnapshot,
    allowPendingCandidate: true,
    externalRecordAhead: 1,
    externalLatestBinding: {
      candidate: request.candidate,
      verification: request.verification,
    },
  });
  requireRequestMatchesRepository({ request, context });
  if (
    !sameJson(
      request.repositoryBaselineInputs,
      context.repositoryBaselineInputs,
    )
  ) {
    fail("repository baseline inputs differ from the prepared request");
  }
  if (
    context.latestVerification !== null ||
    context.latestCandidate.recordSha256 !== request.candidate.recordSha256 ||
    context.pairs.length < 1 ||
    context.records.length !== context.pairs.length * 2 + 1 ||
    input.externalSnapshot.records.length !== context.pairs.length + 1
  ) {
    fail(
      "repository does not expose exactly one externally verified pending successor",
    );
  }
  const previousPair = context.pairs.at(-1)!;
  if (
    request.candidate.predecessorRecordSha256 !==
      previousPair.verification.recordSha256 ||
    request.candidate.sequence !== context.records.length ||
    request.verification.sequence !== request.candidate.sequence + 1 ||
    request.candidate.eventCount !== previousPair.candidate.eventCount + 1
  ) {
    fail(
      "pending candidate is not exactly one event beyond the previous trusted pair",
    );
  }

  const current = {
    eventLog: readStableRepositoryFile(root, CORPUS_CURRENT_STATE_PATHS.events),
    eventManifest: readStableRepositoryFile(
      root,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
    ),
    anchorLog: readStableRepositoryFile(
      root,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ),
    currentState: readStableRepositoryFile(
      root,
      CORPUS_CURRENT_STATE_PATHS.currentState,
    ),
    summary: readStableRepositoryFile(root, CORPUS_CURRENT_STATE_PATHS.summary),
    conflictQueue: readStableRepositoryFile(
      root,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    ),
    generationManifest: readStableRepositoryFile(
      root,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ),
  };
  if (!current.anchorLog.bytes.equals(context.anchorLogBytes)) {
    fail("repository anchor bytes changed during proposal construction");
  }

  const verifier = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: request.candidate,
    latestVerification: request.verification,
    latestRepositoryBaselineInputs: request.repositoryBaselineInputs,
  });
  const transition = buildCorpusPendingEventTransitionArtifacts(root, {
    eventLogBytes: current.eventLog.bytes,
    eventManifestBytes: current.eventManifest.bytes,
    eventHistoryAnchorBytes: current.anchorLog.bytes,
    verifyTrustedEventHistoryAnchor: verifier,
  });
  writeOrCheckCorpusCurrentStateArtifacts(
    root,
    transition.previousTrusted,
    true,
  );
  assertPendingPlanAndTransition({
    pendingPlan: pendingPlanFile.plan,
    requestFile,
    externalSnapshot: input.externalSnapshot,
    policy: input.policy,
    current,
    transition,
    anchorRecordCount: context.records.length,
    trustedPairCount: context.pairs.length,
  });

  const proposedAnchorBytes = Buffer.concat([
    current.anchorLog.bytes,
    Buffer.from(`${JSON.stringify(request.verification)}\n`, "utf8"),
  ]);
  const finalArtifacts = buildCorpusCurrentStateArtifacts(root, {
    eventHistoryAnchorBytes: proposedAnchorBytes,
    verifyTrustedEventHistoryAnchor: verifier,
  });
  if (
    finalArtifacts.states.length !== input.policy.requiredIdentityCount ||
    finalArtifacts.events.length !== request.candidate.eventCount ||
    !finalArtifacts.eventHistory.currentCheckpointTrusted ||
    finalArtifacts.eventHistory.records.length !== context.records.length + 1
  ) {
    fail("final projection does not satisfy production checkpoint eligibility");
  }
  assertProtectedDecisionAxes({
    before: transition.previousTrusted,
    after: finalArtifacts,
    pending: transition.pending,
    targetIdentity: transition.pendingEvent.target.identityKey,
  });
  const finalEvidence = generationEvidence(finalArtifacts);
  if (!sameJson(finalEvidence, pendingPlanFile.plan.projectedEvidence)) {
    fail("final resolved evidence differs from the Phase 1 replay");
  }

  const finalProjection = {
    currentState: generatedArtifact(
      finalArtifacts,
      CORPUS_CURRENT_STATE_PATHS.currentState,
    ),
    summary: generatedArtifact(
      finalArtifacts,
      CORPUS_CURRENT_STATE_PATHS.summary,
    ),
    conflictQueue: generatedArtifact(
      finalArtifacts,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    ),
    generationManifest: generatedArtifact(
      finalArtifacts,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ),
  };
  if (
    !exactBinding(
      pendingPlanFile.plan.hypotheticalProjectionOutputs[0]!,
      CORPUS_CURRENT_STATE_PATHS.currentState,
      finalProjection.currentState.content,
    ) ||
    !exactBinding(
      pendingPlanFile.plan.hypotheticalProjectionOutputs[2]!,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      finalProjection.conflictQueue.content,
    )
  ) {
    fail(
      "final state/conflict projection differs from Phase 1 hypothetical replay",
    );
  }
  if (
    exactBinding(
      pendingPlanFile.plan.hypotheticalProjectionOutputs[1]!,
      CORPUS_CURRENT_STATE_PATHS.summary,
      finalProjection.summary.content,
    ) ||
    exactBinding(
      pendingPlanFile.plan.hypotheticalProjectionOutputs[3]!,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
      finalProjection.generationManifest.content,
    )
  ) {
    fail(
      "trusted finalization did not change the trust-dependent summary and generation manifest",
    );
  }

  const cas = new Map<string, CorpusRepositoryBundleFileBinding>();
  for (const file of Object.values(current)) addExactBinding(cas, file.binding);
  const previousManifest = generationManifest(transition.previousTrusted);
  addManifestBindings({
    root,
    manifest: previousManifest,
    cas,
    proposedPaths: new Set([
      CORPUS_CURRENT_STATE_PATHS.events,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    ]),
  });
  const finalManifest = generationManifest(finalArtifacts);
  addManifestBindings({
    root,
    manifest: finalManifest,
    cas,
    proposedPaths: new Set([
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
    ]),
  });
  const baselineGeneration = readStableRepositoryFile(
    root,
    BASELINE_GENERATION_MANIFEST_PATH,
  );
  addExactBinding(cas, baselineGeneration.binding);
  const baselineManifest = z
    .object({ inputs: z.array(z.unknown()), outputs: z.array(z.unknown()) })
    .passthrough()
    .parse(
      parseJson(BASELINE_GENERATION_MANIFEST_PATH, baselineGeneration.bytes),
    );
  for (const descriptor of [
    ...baselineManifest.inputs,
    ...baselineManifest.outputs,
  ]) {
    const expected = manifestDescriptorToBinding(descriptor);
    const observed = readCorpusRepositoryBundleFileBinding(root, expected.path);
    if (!sameJson(observed, expected)) {
      fail(`baseline generation dependency drifted: ${expected.path}`);
    }
    addExactBinding(cas, observed);
  }
  for (const path of CORPUS_EVENT_CHECKPOINT_FINALIZER_IMPLEMENTATION_PATHS) {
    addExactBinding(cas, readCorpusRepositoryBundleFileBinding(root, path));
  }
  const compareAndSwapInputs = [...cas.values()].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );

  const outputs: CorpusRepositoryBundleOutput[] = [
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      content: proposedAnchorBytes,
      mode: current.anchorLog.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.currentState,
      content: finalProjection.currentState.content,
      mode: current.currentState.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.summary,
      content: finalProjection.summary.content,
      mode: current.summary.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      content: finalProjection.conflictQueue.content,
      mode: current.conflictQueue.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.generationManifest,
      content: finalProjection.generationManifest.content,
      mode: current.generationManifest.mode,
    },
  ];
  const orderedOutputs = outputs.map((output) => ({
    ...corpusRepositoryBundleFileBinding(output.path, output.content),
    mode: output.mode!,
  }));
  const shortHash = request.candidate.recordSha256.slice("sha256:".length);
  const body: Proposal["body"] = {
    schemaVersion: CORPUS_EVENT_CHECKPOINT_FINALIZER_SCHEMA_VERSION,
    artifactType: "corpus_event_checkpoint_finalizer_plan",
    planVersion: CORPUS_EVENT_CHECKPOINT_FINALIZER_VERSION,
    planId: `plan.corpus.event-checkpoint.finalize.${shortHash}`,
    createdAt: input.createdAt,
    transactionId: `transaction.corpus.event-checkpoint.finalize.${shortHash}`,
    transactionKind: CORPUS_EVENT_CHECKPOINT_FINALIZER_TRANSACTION_KIND,
    requestFile: requestFileBinding(requestFile),
    pendingPlanFile: pendingPlanFileBinding(pendingPlanFile),
    externalAuthority: externalAuthorityBinding(input.externalSnapshot),
    repositoryBaselineInputs: context.repositoryBaselineInputs,
    repositoryBefore: {
      eventLog: current.eventLog.binding,
      eventManifest: current.eventManifest.binding,
      anchorLog: current.anchorLog.binding,
      currentState: current.currentState.binding,
      summary: current.summary.binding,
      conflictQueue: current.conflictQueue.binding,
      generationManifest: current.generationManifest.binding,
      anchorRecordCount: context.records.length,
      trustedPairCount: context.pairs.length,
      eventCount: finalArtifacts.events.length,
    },
    previousTrusted: {
      eventLog: corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.events,
        transition.previousEventLogBytes,
      ),
      eventManifest: corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.eventManifest,
        transition.previousEventManifestBytes,
      ),
      anchorLog: corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        transition.previousEventHistoryAnchorBytes,
      ),
      eventCount: transition.previousTrusted.events.length,
      projectionOutputs: projectionBindings(transition.previousTrusted),
    },
    pendingCandidate: {
      id: request.candidate.anchorId,
      sequence: request.candidate.sequence,
      recordSha256: request.candidate.recordSha256,
      eventCount: request.candidate.eventCount,
    },
    verification: {
      id: request.verification.verificationId,
      sequence: request.verification.sequence,
      recordSha256: request.verification.recordSha256,
    },
    resolvedEventEvidence: finalEvidence,
    compareAndSwapInputs,
    compareAndSwapInputSetSha256:
      corpusRepositoryBundleBindingSetSha256(compareAndSwapInputs),
    orderedOutputs,
    finalCommitMarkerPath:
      CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER,
    eligibility: {
      ...input.policy,
      observedIdentityCount: finalArtifacts.states.length,
      previousTrustedEventCount: transition.previousTrusted.events.length,
      pendingEventCount: finalArtifacts.events.length,
      previousTrustedPairCount: context.pairs.length,
      externalRecordCount: input.externalSnapshot.records.length,
      oneEventOnly: true,
      ownerConfirmationEventAllowed: false,
    },
    operationSemantics: {
      trustedVerificationAppended: true,
      canonicalProjectionPublished: true,
      eventLogReplaced: false,
      eventManifestReplaced: false,
      repositoryFilesReplaced: 5,
      generationManifestInstalledLast: true,
      externalAuthorityReadOnly: true,
    },
    safetyBoundary: SAFETY_BOUNDARY,
  };
  return { body: planBodySchema.parse(body), outputs };
}

export function validateCorpusEventCheckpointFinalizerPlan(
  value: unknown,
): CorpusEventCheckpointFinalizerPlan {
  const parsed = planSchema.safeParse(value);
  if (!parsed.success) fail(`plan schema is invalid: ${parsed.error.message}`);
  const plan = parsed.data;
  const { planSha256, ...body } = plan;
  if (planSha256 !== planHash(planBodySchema.parse(body))) {
    fail("plan self-hash mismatch");
  }
  const sortedCas = [...plan.compareAndSwapInputs].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );
  if (
    !sameJson(sortedCas, plan.compareAndSwapInputs) ||
    new Set(sortedCas.map((binding) => binding.path)).size !==
      sortedCas.length ||
    plan.compareAndSwapInputSetSha256 !==
      corpusRepositoryBundleBindingSetSha256(sortedCas)
  ) {
    fail("compare-and-swap set is not complete, sorted and uniquely sealed");
  }
  const expectedOutputPaths = [
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ];
  if (
    !sameJson(
      plan.orderedOutputs.map((output) => output.path),
      expectedOutputPaths,
    )
  ) {
    fail("ordered outputs are not the exact five-file final checkpoint");
  }
  const expectedProjectionPaths = [
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ];
  if (
    !sameJson(
      [
        plan.repositoryBefore.eventLog.path,
        plan.repositoryBefore.eventManifest.path,
        plan.repositoryBefore.anchorLog.path,
        plan.repositoryBefore.currentState.path,
        plan.repositoryBefore.summary.path,
        plan.repositoryBefore.conflictQueue.path,
        plan.repositoryBefore.generationManifest.path,
      ],
      [
        CORPUS_CURRENT_STATE_PATHS.events,
        CORPUS_CURRENT_STATE_PATHS.eventManifest,
        CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        CORPUS_CURRENT_STATE_PATHS.currentState,
        CORPUS_CURRENT_STATE_PATHS.summary,
        CORPUS_CURRENT_STATE_PATHS.conflictQueue,
        CORPUS_CURRENT_STATE_PATHS.generationManifest,
      ],
    ) ||
    !sameJson(
      [
        plan.previousTrusted.eventLog.path,
        plan.previousTrusted.eventManifest.path,
        plan.previousTrusted.anchorLog.path,
      ],
      [
        CORPUS_CURRENT_STATE_PATHS.events,
        CORPUS_CURRENT_STATE_PATHS.eventManifest,
        CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      ],
    ) ||
    !sameJson(
      plan.previousTrusted.projectionOutputs.map((output) => output.path),
      expectedProjectionPaths,
    ) ||
    plan.repositoryBefore.anchorRecordCount !==
      plan.repositoryBefore.trustedPairCount * 2 + 1 ||
    plan.pendingCandidate.sequence !==
      plan.repositoryBefore.anchorRecordCount ||
    plan.verification.sequence !== plan.pendingCandidate.sequence + 1 ||
    plan.pendingCandidate.eventCount !== plan.eligibility.pendingEventCount ||
    plan.previousTrusted.eventCount !==
      plan.eligibility.previousTrustedEventCount ||
    plan.eligibility.pendingEventCount !==
      plan.eligibility.previousTrustedEventCount + 1 ||
    plan.eligibility.externalRecordCount !==
      plan.eligibility.previousTrustedPairCount + 1 ||
    plan.repositoryBefore.trustedPairCount !==
      plan.eligibility.previousTrustedPairCount ||
    plan.repositoryBefore.eventCount !== plan.eligibility.pendingEventCount ||
    plan.eligibility.observedIdentityCount !==
      plan.eligibility.requiredIdentityCount
  ) {
    fail(
      "plan does not represent exactly one externally verified successor event",
    );
  }
  if (
    plan.eligibility.policy === "production_fixed_1565" &&
    plan.eligibility.requiredIdentityCount !==
      CORPUS_EVENT_CHECKPOINT_FINALIZER_REQUIRED_IDENTITY_COUNT
  ) {
    fail("production identity-count policy is not fixed at 1565");
  }
  return plan;
}

function sealPlan(proposal: Proposal): CorpusEventCheckpointFinalizerPlan {
  const body = planBodySchema.parse(proposal.body);
  return validateCorpusEventCheckpointFinalizerPlan({
    ...body,
    planSha256: planHash(body),
  });
}

export function serializeCorpusEventCheckpointFinalizerPlan(
  plan: CorpusEventCheckpointFinalizerPlan,
): string {
  return `${JSON.stringify(validateCorpusEventCheckpointFinalizerPlan(plan), null, 2)}\n`;
}

export function corpusEventCheckpointFinalizerApplyAcknowledgement(
  planSha256: string,
): string {
  prefixedSha256Schema.parse(planSha256);
  return `APPLY_CORPUS_EVENT_CHECKPOINT_FINALIZER_${planSha256
    .slice("sha256:".length)
    .toUpperCase()}`;
}

export function buildCorpusEventCheckpointFinalizerPlan(input: {
  repositoryRoot: string;
  requestPath: string;
  pendingPlanPath: string;
  createdAt?: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
}): CorpusEventCheckpointFinalizerPlan {
  const root = canonicalRoot(input.repositoryRoot);
  const createdAt = input.createdAt ?? new Date().toISOString();
  utcTimestampSchema.parse(createdAt);
  const policy = testAwareEligibilityPolicy(
    input.testOnlyExpectedIdentityCount,
  );
  const externalSnapshot = loadPolicyBoundExternalSnapshot({
    repositoryRoot: root,
    policy,
    testOnlyInjectedLoader: input.loadExternalSnapshot,
  });
  const plan = sealPlan(
    buildProposal({
      repositoryRoot: root,
      requestPath: input.requestPath,
      pendingPlanPath: input.pendingPlanPath,
      externalSnapshot,
      createdAt,
      policy,
    }),
  );
  return plan;
}

function assertPlanMatchesProposal(input: {
  plan: CorpusEventCheckpointFinalizerPlan;
  proposal: Proposal;
}): void {
  if (!sameJson(sealPlan(input.proposal), input.plan)) {
    fail("sealed plan cannot be reproduced from current inputs");
  }
}

function expectedBeforeBindings(plan: CorpusEventCheckpointFinalizerPlan) {
  return new Map<string, CorpusRepositoryBundleFileBinding>([
    [
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      plan.repositoryBefore.anchorLog,
    ],
    [
      CORPUS_CURRENT_STATE_PATHS.currentState,
      plan.repositoryBefore.currentState,
    ],
    [CORPUS_CURRENT_STATE_PATHS.summary, plan.repositoryBefore.summary],
    [
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      plan.repositoryBefore.conflictQueue,
    ],
    [
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
      plan.repositoryBefore.generationManifest,
    ],
  ]);
}

export function assertCorpusEventCheckpointFinalizerJournalMatchesPlan(input: {
  journal: CorpusRepositoryBundleTransactionJournal;
  plan: CorpusEventCheckpointFinalizerPlan;
}): void {
  const journal = validateCorpusRepositoryBundleTransactionJournal(
    input.journal,
  );
  const plan = validateCorpusEventCheckpointFinalizerPlan(input.plan);
  const before = expectedBeforeBindings(plan);
  const after = new Map(
    plan.orderedOutputs.map((output) => [output.path, output]),
  );
  if (
    journal.authorizationSha256 !== plan.planSha256 ||
    journal.transactionId !== plan.transactionId ||
    journal.transactionKind !== plan.transactionKind ||
    journal.finalCommitMarkerPath !== plan.finalCommitMarkerPath ||
    journal.entries.length !== plan.orderedOutputs.length ||
    !sameJson(
      journal.entries.map((entry) => entry.path),
      plan.orderedOutputs.map((output) => output.path),
    )
  ) {
    fail("transaction journal is not authorized by the sealed finalizer plan");
  }
  for (const entry of journal.entries) {
    const expectedBefore = before.get(entry.path);
    const expectedAfter = after.get(entry.path);
    if (
      !expectedBefore ||
      !expectedAfter ||
      !sameJson(entry.before, expectedBefore) ||
      !sameJson(entry.after, {
        path: expectedAfter.path,
        sha256: expectedAfter.sha256,
        sizeBytes: expectedAfter.sizeBytes,
      }) ||
      entry.beforeMode !== expectedAfter.mode ||
      entry.afterMode !== expectedAfter.mode
    ) {
      fail(`journal binding or mode differs from plan: ${entry.path}`);
    }
  }
}

function assertOutsideAuthorityMatchesPlan(input: {
  root: string;
  requestPath: string;
  pendingPlanPath: string;
  plan: CorpusEventCheckpointFinalizerPlan;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
}): {
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  pendingPlanFile: PendingPlanFile;
} {
  const requestFile = requestFileOutsideRepository(
    input.root,
    input.requestPath,
  );
  const pendingPlanFile = pendingPlanFileOutsideRepository(
    input.root,
    input.pendingPlanPath,
  );
  requireRequestIsLatestExternalAppend({
    request: requestFile.request,
    snapshot: input.snapshot,
  });
  if (
    !sameJson(requestFileBinding(requestFile), input.plan.requestFile) ||
    !sameJson(
      pendingPlanFileBinding(pendingPlanFile),
      input.plan.pendingPlanFile,
    ) ||
    !sameJson(
      externalAuthorityBinding(input.snapshot),
      input.plan.externalAuthority,
    )
  ) {
    fail(
      "request, Phase 1 plan or external authority differs from the sealed plan",
    );
  }
  return { requestFile, pendingPlanFile };
}

function stableGeneratedFile(
  artifacts: CorpusCurrentStateArtifacts,
  path: string,
  mode: number,
): StableFile {
  const generated = generatedArtifact(artifacts, path);
  const bytes = Buffer.from(generated.content, "utf8");
  return {
    bytes,
    binding: corpusRepositoryBundleFileBinding(path, bytes),
    mode,
  };
}

function assertCommittedRepositoryState(input: {
  repositoryRoot: string;
  requestPath: string;
  pendingPlanPath: string;
  plan: CorpusEventCheckpointFinalizerPlan;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  policy: EligibilityPolicy;
}): void {
  const root = canonicalRoot(input.repositoryRoot);
  const { requestFile, pendingPlanFile } = assertOutsideAuthorityMatchesPlan({
    root,
    requestPath: input.requestPath,
    pendingPlanPath: input.pendingPlanPath,
    plan: input.plan,
    snapshot: input.externalSnapshot,
  });
  const request = requestFile.request;
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: root,
    externalSnapshot: input.externalSnapshot,
    allowPendingCandidate: false,
  });
  if (
    context.records.length !==
      input.plan.repositoryBefore.anchorRecordCount + 1 ||
    context.pairs.length !== input.plan.repositoryBefore.trustedPairCount + 1 ||
    context.latestCandidate.recordSha256 !== request.candidate.recordSha256 ||
    context.latestVerification?.recordSha256 !==
      request.verification.recordSha256 ||
    !sameJson(
      context.repositoryBaselineInputs,
      input.plan.repositoryBaselineInputs,
    )
  ) {
    fail(
      "committed repository does not expose the exact finalized trusted pair",
    );
  }
  for (const binding of [
    input.plan.repositoryBefore.eventLog,
    input.plan.repositoryBefore.eventManifest,
  ]) {
    if (
      !sameJson(
        readCorpusRepositoryBundleFileBinding(root, binding.path),
        binding,
      )
    ) {
      fail(`finalization changed a Phase 1 input: ${binding.path}`);
    }
  }
  const finalAnchor = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  const pendingAnchorBytes = finalAnchor.bytes.subarray(
    0,
    input.plan.repositoryBefore.anchorLog.sizeBytes,
  );
  if (
    !exactBinding(
      input.plan.repositoryBefore.anchorLog,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      pendingAnchorBytes,
    )
  ) {
    fail("final anchor does not preserve the exact pending anchor prefix");
  }
  const verifier = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: request.candidate,
    latestVerification: request.verification,
    latestRepositoryBaselineInputs: request.repositoryBaselineInputs,
  });
  const eventLog = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.events,
  );
  const eventManifest = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
  );
  const transition = buildCorpusPendingEventTransitionArtifacts(root, {
    eventLogBytes: eventLog.bytes,
    eventManifestBytes: eventManifest.bytes,
    eventHistoryAnchorBytes: pendingAnchorBytes,
    verifyTrustedEventHistoryAnchor: verifier,
  });
  const pseudoCurrent = {
    eventLog,
    eventManifest,
    anchorLog: {
      bytes: pendingAnchorBytes,
      binding: corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        pendingAnchorBytes,
      ),
      mode: finalAnchor.mode,
    },
    currentState: stableGeneratedFile(
      transition.previousTrusted,
      CORPUS_CURRENT_STATE_PATHS.currentState,
      input.plan.orderedOutputs[1]!.mode,
    ),
    summary: stableGeneratedFile(
      transition.previousTrusted,
      CORPUS_CURRENT_STATE_PATHS.summary,
      input.plan.orderedOutputs[2]!.mode,
    ),
    conflictQueue: stableGeneratedFile(
      transition.previousTrusted,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      input.plan.orderedOutputs[3]!.mode,
    ),
    generationManifest: stableGeneratedFile(
      transition.previousTrusted,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
      input.plan.orderedOutputs[4]!.mode,
    ),
  };
  assertPendingPlanAndTransition({
    pendingPlan: pendingPlanFile.plan,
    requestFile,
    externalSnapshot: input.externalSnapshot,
    policy: input.policy,
    current: pseudoCurrent,
    transition,
    anchorRecordCount: input.plan.repositoryBefore.anchorRecordCount,
    trustedPairCount: input.plan.repositoryBefore.trustedPairCount,
  });
  const finalArtifacts = buildCorpusCurrentStateArtifacts(root, {
    verifyTrustedEventHistoryAnchor: verifier,
  });
  if (
    finalArtifacts.states.length !== input.policy.requiredIdentityCount ||
    !sameJson(
      generationEvidence(finalArtifacts),
      input.plan.resolvedEventEvidence,
    )
  ) {
    fail(
      "committed projection eligibility or dynamic evidence differs from plan",
    );
  }
  assertProtectedDecisionAxes({
    before: transition.previousTrusted,
    after: finalArtifacts,
    pending: transition.pending,
    targetIdentity: transition.pendingEvent.target.identityKey,
  });
  writeOrCheckCorpusCurrentStateArtifacts(root, finalArtifacts, true);
  for (const output of input.plan.orderedOutputs) {
    const observed = readStableRepositoryFile(root, output.path);
    if (
      !sameJson(observed.binding, {
        path: output.path,
        sha256: output.sha256,
        sizeBytes: output.sizeBytes,
      }) ||
      observed.mode !== output.mode
    ) {
      fail(`committed output differs from sealed plan: ${output.path}`);
    }
  }
}

export async function applyCorpusEventCheckpointFinalizerPlan(input: {
  repositoryRoot: string;
  plan: CorpusEventCheckpointFinalizerPlan;
  requestPath: string;
  pendingPlanPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
  testFaultInjector?: (
    point: CorpusRepositoryBundleTransactionFaultPoint,
  ) => void;
}): Promise<"committed" | "committed_after_recovery"> {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusEventCheckpointFinalizerPlan(input.plan);
  if (
    input.acknowledgement !==
    corpusEventCheckpointFinalizerApplyAcknowledgement(plan.planSha256)
  ) {
    fail("exact strong apply acknowledgement is missing");
  }
  const policy = eligibilityPolicyFromPlan(
    plan,
    input.testOnlyExpectedIdentityCount,
  );
  const loadSnapshot = () =>
    loadPolicyBoundExternalSnapshot({
      repositoryRoot: root,
      policy,
      testOnlyInjectedLoader: input.loadExternalSnapshot,
    });
  const proposal = buildProposal({
    repositoryRoot: root,
    requestPath: input.requestPath,
    pendingPlanPath: input.pendingPlanPath,
    externalSnapshot: loadSnapshot(),
    createdAt: plan.createdAt,
    policy,
  });
  assertPlanMatchesProposal({ plan, proposal });
  return commitCorpusRepositoryBundleTransaction({
    root,
    transactionId: plan.transactionId,
    transactionKind: plan.transactionKind,
    authorizationSha256: plan.planSha256,
    expectedInputs: plan.compareAndSwapInputs,
    outputs: proposal.outputs,
    finalCommitMarkerPath: plan.finalCommitMarkerPath,
    testFaultInjector: input.testFaultInjector,
    revalidate: () => {
      const refreshed = buildProposal({
        repositoryRoot: root,
        requestPath: input.requestPath,
        pendingPlanPath: input.pendingPlanPath,
        externalSnapshot: loadSnapshot(),
        createdAt: plan.createdAt,
        policy,
      });
      assertPlanMatchesProposal({ plan, proposal: refreshed });
    },
    confirmCommittedState: (journal) => {
      assertCorpusEventCheckpointFinalizerJournalMatchesPlan({ journal, plan });
      assertCommittedRepositoryState({
        repositoryRoot: root,
        requestPath: input.requestPath,
        pendingPlanPath: input.pendingPlanPath,
        plan,
        externalSnapshot: loadSnapshot(),
        policy,
      });
    },
  });
}

/**
 * Recovery is deliberately marker-aware. Before the final generation manifest
 * is installed, the generic transaction may authenticate and roll back using
 * only the sealed finalizer plan, journal and local backups. Request, Phase 1
 * plan, external authority and dynamic evidence are opened only from the
 * committed-state callback, which generic recovery invokes solely when the
 * marker is already installed and every target has its planned after-state.
 */
export function recoverCorpusEventCheckpointFinalizer(input: {
  repositoryRoot: string;
  plan: CorpusEventCheckpointFinalizerPlan;
  requestPath: string;
  pendingPlanPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
}): "none" | "rolled_back" | "completed" {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusEventCheckpointFinalizerPlan(input.plan);
  const policy = eligibilityPolicyFromPlan(
    plan,
    input.testOnlyExpectedIdentityCount,
  );
  const journalPath = resolve(
    root,
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  );
  try {
    lstatSync(journalPath);
    assertCorpusEventCheckpointFinalizerJournalMatchesPlan({
      journal: readCorpusRepositoryBundleTransactionJournal(root),
      plan,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return recoverCorpusRepositoryBundleTransaction({
    root,
    acknowledgement: input.acknowledgement,
    confirmCommittedState: (journal) => {
      assertCorpusEventCheckpointFinalizerJournalMatchesPlan({ journal, plan });
      const snapshot = loadPolicyBoundExternalSnapshot({
        repositoryRoot: root,
        policy,
        testOnlyInjectedLoader: input.loadExternalSnapshot,
      });
      assertCommittedRepositoryState({
        repositoryRoot: root,
        requestPath: input.requestPath,
        pendingPlanPath: input.pendingPlanPath,
        plan,
        externalSnapshot: snapshot,
        policy,
      });
    },
  });
}

export type CorpusEventCheckpointFinalizerCliOptions = {
  mode: "plan" | "apply" | "recover";
  requestPath: string;
  pendingPlanPath: string;
  planFilePath: string | null;
  acknowledgement: string | null;
};

export function parseCorpusEventCheckpointFinalizerArgs(
  args: string[],
): CorpusEventCheckpointFinalizerCliOptions {
  const selected = ["--plan", "--apply", "--recover"].filter((flag) =>
    args.includes(flag),
  );
  if (selected.length !== 1) fail("choose exactly one operation mode");
  if (
    selected.some(
      (flag) => args.filter((argument) => argument === flag).length !== 1,
    )
  ) {
    fail("duplicate operation modes are not allowed");
  }
  const values = (prefix: string) =>
    args
      .filter((argument) => argument.startsWith(prefix))
      .map((argument) => argument.slice(prefix.length));
  const requests = values("--request=");
  const pendingPlans = values("--pending-plan-file=");
  const plans = values("--plan-file=");
  const acknowledgements = values("--ack=");
  const known = args.filter(
    (argument) =>
      ["--plan", "--apply", "--recover"].includes(argument) ||
      argument.startsWith("--request=") ||
      argument.startsWith("--pending-plan-file=") ||
      argument.startsWith("--plan-file=") ||
      argument.startsWith("--ack="),
  );
  if (known.length !== args.length) fail("unknown or malformed argument");
  if (requests.length !== 1 || !requests[0]) {
    fail("exactly one --request is required");
  }
  if (pendingPlans.length !== 1 || !pendingPlans[0]) {
    fail("exactly one --pending-plan-file is required");
  }
  const mode = selected[0]!.slice(
    2,
  ) as CorpusEventCheckpointFinalizerCliOptions["mode"];
  if (mode === "plan") {
    if (plans.length !== 0 || acknowledgements.length !== 0) {
      fail("plan mode does not accept --plan-file or --ack");
    }
  } else if (
    plans.length !== 1 ||
    !plans[0] ||
    acknowledgements.length !== 1 ||
    !acknowledgements[0]
  ) {
    fail("apply and recover require exactly one --plan-file and --ack");
  }
  return {
    mode,
    requestPath: requests[0]!,
    pendingPlanPath: pendingPlans[0]!,
    planFilePath: plans[0] ?? null,
    acknowledgement: acknowledgements[0] ?? null,
  };
}

export function readCorpusEventCheckpointFinalizerPlanFile(
  repositoryRoot: string,
  planPath: string,
): CorpusEventCheckpointFinalizerPlan {
  const root = canonicalRoot(repositoryRoot);
  const file = readStableOutsideFile(root, planPath, "finalizer plan file");
  const plan = validateCorpusEventCheckpointFinalizerPlan(
    parseJson("finalizer plan file", file.bytes),
  );
  if (
    file.bytes.toString("utf8") !==
    serializeCorpusEventCheckpointFinalizerPlan(plan)
  ) {
    fail("finalizer plan file is not canonical pretty JSON");
  }
  return plan;
}

async function main(): Promise<void> {
  const root = canonicalRoot(process.cwd());
  const options = parseCorpusEventCheckpointFinalizerArgs(
    process.argv.slice(2),
  );
  if (options.mode === "plan") {
    const plan = buildCorpusEventCheckpointFinalizerPlan({
      repositoryRoot: root,
      requestPath: options.requestPath,
      pendingPlanPath: options.pendingPlanPath,
    });
    process.stdout.write(serializeCorpusEventCheckpointFinalizerPlan(plan));
    process.stderr.write(
      `Apply acknowledgement: ${corpusEventCheckpointFinalizerApplyAcknowledgement(
        plan.planSha256,
      )}\n`,
    );
    return;
  }
  const plan = readCorpusEventCheckpointFinalizerPlanFile(
    root,
    options.planFilePath!,
  );
  if (options.mode === "apply") {
    const result = await applyCorpusEventCheckpointFinalizerPlan({
      repositoryRoot: root,
      plan,
      requestPath: options.requestPath,
      pendingPlanPath: options.pendingPlanPath,
      acknowledgement: options.acknowledgement!,
    });
    process.stdout.write(
      `${JSON.stringify({ result, planSha256: plan.planSha256 })}\n`,
    );
    return;
  }
  const result = recoverCorpusEventCheckpointFinalizer({
    repositoryRoot: root,
    plan,
    requestPath: options.requestPath,
    pendingPlanPath: options.pendingPlanPath,
    acknowledgement: options.acknowledgement!,
  });
  process.stdout.write(
    `${JSON.stringify({ result, planSha256: plan.planSha256 })}\n`,
  );
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  main().catch((error) => {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exitCode = 1;
  });
}
