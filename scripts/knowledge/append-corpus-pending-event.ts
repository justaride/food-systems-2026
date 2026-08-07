import assert from "node:assert/strict";
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
  loadRootOwnedCorpusExternalAnchorLedger,
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
import type { CorpusProcessingStateEvent } from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  buildCorpusPendingEventCheckpointArtifacts,
  buildCorpusProposedPendingCurrentStateArtifacts,
  writeOrCheckCorpusCurrentStateArtifacts,
  type CorpusCurrentStateArtifacts,
  type CorpusResolvedEventEvidence,
} from "./generate-corpus-processing-current-state";
import {
  CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
  readAndValidateRepositoryAnchorContext,
} from "./manage-corpus-external-anchor-ledger";

export const CORPUS_PENDING_EVENT_WRITER_SCHEMA_VERSION =
  "corpus-pending-event-append-plan-v1" as const;
export const CORPUS_PENDING_EVENT_WRITER_VERSION = "1.0.0" as const;
export const CORPUS_PENDING_EVENT_PLAN_HASH_DOMAIN =
  "food-systems/corpus-pending-event-append-plan/v1\n" as const;
export const CORPUS_PENDING_EVENT_TRANSACTION_KIND =
  "corpus.pending.event.append.v1" as const;
export const CORPUS_PENDING_EVENT_REQUIRED_IDENTITY_COUNT = 1565 as const;
export const CORPUS_PENDING_EVENT_FINAL_COMMIT_MARKER =
  CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors;
export const CORPUS_PENDING_EVENT_MAX_EVENT_BYTES = 8 * 1024 * 1024;
export const CORPUS_PENDING_EVENT_MAX_PLAN_BYTES = 64 * 1024 * 1024;

export const CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS = Object.freeze([
  "package.json",
  "package-lock.json",
  "scripts/knowledge/append-corpus-pending-event.ts",
  "scripts/knowledge/generate-corpus-processing-current-state.ts",
  "scripts/knowledge/manage-corpus-external-anchor-ledger.ts",
  "src/lib/knowledge/corpus-event-history-external-ledger.ts",
  "src/lib/knowledge/corpus-processing-current-state.ts",
  "src/lib/knowledge/corpus-processing-event-history.ts",
  "src/lib/knowledge/corpus-processing-lifecycle.ts",
  "src/lib/knowledge/corpus-repository-bundle-transaction.ts",
  "knowledge/corpus/CORPUS-PENDING-EVENT-WRITER.md",
  "knowledge/corpus/CORPUS-PROCESSING-CURRENT-STATE.md",
  "knowledge/schema/corpus-processing-state-event.schema.v1.json",
  "knowledge/schema/corpus-processing-event-history-anchor.schema.v1.json",
  "tests/lib/corpus-processing-current-state-generator.test.ts",
  "tests/lib/corpus-pending-event-writer.test.ts",
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
}).strict();
const externalAuthoritySchema = z
  .object({
    authorityRoot: z.literal(CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT),
    ledger: CorpusRepositoryBundleFileBindingSchema,
    head: CorpusRepositoryBundleFileBindingSchema,
    recordCount: z.number().int().positive(),
    latestRecordSha256: prefixedSha256Schema,
    headSha256: prefixedSha256Schema,
  })
  .strict();
const eventFileBindingSchema = z
  .object({
    fileSha256: prefixedSha256Schema,
    sizeBytes: z.number().int().positive(),
    eventId: identifierSchema,
    eventSha256: prefixedSha256Schema,
    eventType: z.enum([
      "technical_text_extracted",
      "identity_verified",
      "source_analysis_applied",
    ]),
  })
  .strict();
const anchorRecordBindingSchema = z
  .object({
    id: identifierSchema,
    sequence: z.number().int().positive(),
    recordSha256: prefixedSha256Schema,
    eventCount: z.number().int().positive(),
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
const eligibilitySchema = z
  .object({
    policy: z.enum(["production_fixed_1565", "test_only_fixture"]),
    requiredIdentityCount: z.number().int().positive(),
    observedIdentityCount: z.number().int().positive(),
    previousEventCount: z.number().int().nonnegative(),
    proposedEventCount: z.number().int().positive(),
    previousTrustedPairCount: z.number().int().positive(),
    oneEventOnly: z.literal(true),
    ownerConfirmationEventAllowed: z.literal(false),
  })
  .strict();
const safetyBoundarySchema = z
  .object({
    externalLedgerMutationPerformed: z.literal(false),
    trustedVerificationCreated: z.literal(false),
    canonicalProjectionPublished: z.literal(false),
    humanDecisionCreated: z.literal(false),
    rightsCleared: z.literal(false),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
    researchCompletenessClaimed: z.literal(false),
  })
  .strict();

const planBodySchema = z
  .object({
    schemaVersion: z.literal(CORPUS_PENDING_EVENT_WRITER_SCHEMA_VERSION),
    artifactType: z.literal("corpus_pending_event_append_plan"),
    planVersion: z.literal(CORPUS_PENDING_EVENT_WRITER_VERSION),
    planId: identifierSchema,
    createdAt: utcTimestampSchema,
    transactionId: identifierSchema,
    transactionKind: z.literal(CORPUS_PENDING_EVENT_TRANSACTION_KIND),
    eventFile: eventFileBindingSchema,
    externalAuthority: externalAuthoritySchema,
    repositoryBaselineInputs:
      corpusExternalAnchorRepositoryBaselineInputsSchema,
    repositoryBefore: z
      .object({
        eventLog: CorpusRepositoryBundleFileBindingSchema,
        eventManifest: CorpusRepositoryBundleFileBindingSchema,
        anchorLog: CorpusRepositoryBundleFileBindingSchema,
        currentState: CorpusRepositoryBundleFileBindingSchema,
        summary: CorpusRepositoryBundleFileBindingSchema,
        conflictQueue: CorpusRepositoryBundleFileBindingSchema,
        generationManifest: CorpusRepositoryBundleFileBindingSchema,
        anchorRecordCount: z.number().int().min(2),
        trustedPairCount: z.number().int().positive(),
        eventCount: z.number().int().nonnegative(),
      })
      .strict(),
    proposedCandidate: anchorRecordBindingSchema,
    projectedEvidence: resolvedEvidenceSchema,
    hypotheticalProjectionOutputs: z
      .array(CorpusRepositoryBundleFileBindingSchema)
      .length(4),
    eligibility: eligibilitySchema,
    compareAndSwapInputs: z
      .array(CorpusRepositoryBundleFileBindingSchema)
      .min(1),
    compareAndSwapInputSetSha256: prefixedSha256Schema,
    orderedOutputs: z.array(outputBindingSchema).length(3),
    finalCommitMarkerPath: z.literal(CORPUS_PENDING_EVENT_FINAL_COMMIT_MARKER),
    operationSemantics: z
      .object({
        eventLogExtended: z.literal(true),
        eventManifestReplaced: z.literal(true),
        pendingAnchorAppended: z.literal(true),
        repositoryFilesReplaced: z.literal(3),
        anchorInstalledLast: z.literal(true),
        externalAuthorityReadOnly: z.literal(true),
      })
      .strict(),
    safetyBoundary: safetyBoundarySchema,
  })
  .strict();
const planSchema = planBodySchema
  .extend({ planSha256: prefixedSha256Schema })
  .strict();

export type CorpusPendingEventAppendPlan = z.infer<typeof planSchema>;
type EligibilityPolicy = Pick<
  CorpusPendingEventAppendPlan["eligibility"],
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
type Proposal = {
  body: z.infer<typeof planBodySchema>;
  outputs: CorpusRepositoryBundleOutput[];
};

const SAFETY_BOUNDARY = Object.freeze({
  externalLedgerMutationPerformed: false as const,
  trustedVerificationCreated: false as const,
  canonicalProjectionPublished: false as const,
  humanDecisionCreated: false as const,
  rightsCleared: false as const,
  externalUseAllowed: false as const,
  coveragePromotionAllowed: false as const,
  researchCompletenessClaimed: false as const,
});

function fail(message: string): never {
  throw new Error(`Corpus pending-event writer failed: ${message}`);
}

function sameJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function planHash(body: z.infer<typeof planBodySchema>): string {
  return `sha256:${createHash("sha256")
    .update(CORPUS_PENDING_EVENT_PLAN_HASH_DOMAIN)
    .update(canonicalCorpusJson(body as unknown as CorpusCanonicalJsonValue))
    .digest("hex")}`;
}

function canonicalRoot(root: string): string {
  if (!isAbsolute(root) || normalize(root) !== root) {
    fail("repository root must be absolute and normalized");
  }
  const canonical = realpathSync(root);
  if (canonical !== root) fail("repository root must already be canonical");
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
  maximumBytes = CORPUS_PENDING_EVENT_MAX_EVENT_BYTES,
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
    before.size > maximumBytes
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
  if (matches.length !== 1)
    fail(`projection produced ${matches.length} copies of ${path}`);
  return matches[0]!;
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

function testAwareEligibilityPolicy(
  testOnlyExpectedIdentityCount?: number,
): EligibilityPolicy {
  if (testOnlyExpectedIdentityCount === undefined) {
    return {
      policy: "production_fixed_1565",
      requiredIdentityCount: CORPUS_PENDING_EVENT_REQUIRED_IDENTITY_COUNT,
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
  if (input.testOnlyInjectedLoader)
    fail("external snapshot injection is test-only");
  return loadProductionExternalSnapshot(input.repositoryRoot);
}

function eligibilityPolicyFromPlan(
  plan: CorpusPendingEventAppendPlan,
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

function assertBundleMatchesRepository(
  root: string,
  artifacts: CorpusCurrentStateArtifacts,
): void {
  writeOrCheckCorpusCurrentStateArtifacts(root, artifacts, true);
}

function assertProtectedDecisionAxesUnchanged(input: {
  before: CorpusCurrentStateArtifacts;
  after: CorpusCurrentStateArtifacts;
  event: CorpusProcessingStateEvent;
}): void {
  const before = input.before.states.find(
    (state) => state.identityKey === input.event.target.identityKey,
  );
  const after = input.after.states.find(
    (state) => state.identityKey === input.event.target.identityKey,
  );
  if (!before || !after)
    fail("event target is absent from the projected states");
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
      fail(`pending event changed protected decision axis ${field}`);
    }
  }
  if (
    after.permissions.sourceRoleOwnerConfirmed ||
    after.permissions.ownerApprovedForInternalUse ||
    after.permissions.independentlyValidated ||
    after.permissions.partnerValidated ||
    after.permissions.rightsHolderValidated ||
    after.permissions.rightsClearedForInternalUse ||
    after.permissions.rightsClearedForExternalPublication ||
    after.permissions.externalUseAllowed ||
    after.permissions.coveragePromotionAllowed
  ) {
    fail(
      "pending event would promote a protected human, rights or coverage permission",
    );
  }
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

function eventFileBinding(
  file: StableOutsideFile,
  event: CorpusProcessingStateEvent,
) {
  if (event.eventType === "source_role_owner_confirmed_ready_package") {
    fail("v1 rejects source_role_owner_confirmed_ready_package events");
  }
  return eventFileBindingSchema.parse({
    fileSha256: file.fileSha256,
    sizeBytes: file.sizeBytes,
    eventId: event.eventId,
    eventSha256: event.eventSha256,
    eventType: event.eventType,
  });
}

function outputBindings(
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

function buildProposal(input: {
  repositoryRoot: string;
  eventPath: string;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  createdAt: string;
  policy: EligibilityPolicy;
}): Proposal {
  const root = canonicalRoot(input.repositoryRoot);
  const eventFile = readStableOutsideFile(
    root,
    input.eventPath,
    "sealed event input",
  );
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: root,
    externalSnapshot: input.externalSnapshot,
    allowPendingCandidate: false,
  });
  if (!context.latestVerification) {
    fail("current repository head has no trusted verification");
  }
  const verifyTrustedEventHistoryAnchor = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: context.latestCandidate,
    latestVerification: context.latestVerification,
    latestRepositoryBaselineInputs: context.repositoryBaselineInputs,
  });
  const currentArtifacts = buildCorpusCurrentStateArtifacts(root, {
    verifyTrustedEventHistoryAnchor,
  });
  assertBundleMatchesRepository(root, currentArtifacts);
  if (
    currentArtifacts.events.some(
      (event) =>
        (event as { eventType?: string }).eventType ===
        "source_role_owner_confirmed_ready_package",
    )
  ) {
    fail("v1 cannot replay a history containing owner-confirmation events");
  }
  if (currentArtifacts.states.length !== input.policy.requiredIdentityCount) {
    fail(
      `repository identity count ${currentArtifacts.states.length} is not the required ${input.policy.requiredIdentityCount}`,
    );
  }

  const beforeEventLog = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.events,
  );
  const beforeEventManifest = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
  );
  const beforeAnchor = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  if (!beforeAnchor.bytes.equals(context.anchorLogBytes)) {
    fail("repository anchor bytes changed during proposal construction");
  }
  const baseline = z
    .object({ observedAt: z.string().min(1) })
    .passthrough()
    .parse(
      parseJson(
        "corpus processing baseline",
        readStableRepositoryFile(
          root,
          "knowledge/corpus/corpus-processing-baseline.v1.json",
        ).bytes,
      ),
    );
  const checkpoint = buildCorpusPendingEventCheckpointArtifacts({
    currentEventLogBytes: beforeEventLog.bytes,
    currentEventManifestBytes: beforeEventManifest.bytes,
    currentEventHistoryAnchorBytes: beforeAnchor.bytes,
    sealedEventBytes: eventFile.bytes,
    expectedInitializedAt: baseline.observedAt,
    candidateCreatedAt: input.createdAt,
  });
  const proposedArtifacts = buildCorpusProposedPendingCurrentStateArtifacts(
    root,
    {
      eventLogBytes: checkpoint.eventLogBytes,
      eventManifestBytes: checkpoint.eventManifestBytes,
      eventHistoryAnchorBytes: checkpoint.eventHistoryAnchorBytes,
      verifyTrustedEventHistoryAnchor,
    },
  );
  assert.equal(
    proposedArtifacts.events.length,
    currentArtifacts.events.length + 1,
  );
  assertProtectedDecisionAxesUnchanged({
    before: currentArtifacts,
    after: proposedArtifacts,
    event: checkpoint.event,
  });

  const currentState = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.currentState,
  );
  const summary = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.summary,
  );
  const conflictQueue = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
  );
  const generationManifest = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  const currentManifest = parseGenerationManifest(generationManifest.bytes);
  const proposedGenerationArtifact = generatedArtifact(
    proposedArtifacts,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  const proposedManifest = parseGenerationManifest(
    Buffer.from(proposedGenerationArtifact.content, "utf8"),
  );

  const cas = new Map<string, CorpusRepositoryBundleFileBinding>();
  for (const file of [
    beforeEventLog,
    beforeEventManifest,
    beforeAnchor,
    currentState,
    summary,
    conflictQueue,
    generationManifest,
  ]) {
    addExactBinding(cas, file.binding);
  }
  addManifestBindings({ root, manifest: currentManifest, cas });
  addManifestBindings({
    root,
    manifest: proposedManifest,
    cas,
    proposedPaths: new Set([
      CORPUS_CURRENT_STATE_PATHS.events,
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      CORPUS_CURRENT_STATE_PATHS.currentState,
      CORPUS_CURRENT_STATE_PATHS.summary,
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
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
    const current = readCorpusRepositoryBundleFileBinding(root, expected.path);
    if (!sameJson(current, expected)) {
      fail(`baseline generation dependency drifted: ${expected.path}`);
    }
    addExactBinding(cas, current);
  }
  for (const path of CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS) {
    addExactBinding(cas, readCorpusRepositoryBundleFileBinding(root, path));
  }
  const compareAndSwapInputs = [...cas.values()].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );

  const outputs: CorpusRepositoryBundleOutput[] = [
    {
      path: CORPUS_CURRENT_STATE_PATHS.events,
      content: checkpoint.eventLogBytes,
      mode: beforeEventLog.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      content: checkpoint.eventManifestBytes,
      mode: beforeEventManifest.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      content: checkpoint.eventHistoryAnchorBytes,
      mode: beforeAnchor.mode,
    },
  ];
  const orderedOutputs = outputs.map((output) => ({
    ...corpusRepositoryBundleFileBinding(output.path, output.content),
    mode: output.mode!,
  }));
  const eventBinding = eventFileBinding(eventFile, checkpoint.event);
  const shortHash = checkpoint.event.eventSha256.slice("sha256:".length);
  const body: Proposal["body"] = {
    schemaVersion: CORPUS_PENDING_EVENT_WRITER_SCHEMA_VERSION,
    artifactType: "corpus_pending_event_append_plan",
    planVersion: CORPUS_PENDING_EVENT_WRITER_VERSION,
    planId: `plan.corpus.pending.event.${shortHash}`,
    createdAt: input.createdAt,
    transactionId: `transaction.corpus.pending.event.${shortHash}`,
    transactionKind: CORPUS_PENDING_EVENT_TRANSACTION_KIND,
    eventFile: eventBinding,
    externalAuthority: externalAuthorityBinding(input.externalSnapshot),
    repositoryBaselineInputs: context.repositoryBaselineInputs,
    repositoryBefore: {
      eventLog: beforeEventLog.binding,
      eventManifest: beforeEventManifest.binding,
      anchorLog: beforeAnchor.binding,
      currentState: currentState.binding,
      summary: summary.binding,
      conflictQueue: conflictQueue.binding,
      generationManifest: generationManifest.binding,
      anchorRecordCount: context.records.length,
      trustedPairCount: context.pairs.length,
      eventCount: currentArtifacts.events.length,
    },
    proposedCandidate: {
      id: checkpoint.anchorCandidate.anchorId,
      sequence: checkpoint.anchorCandidate.sequence,
      recordSha256: checkpoint.anchorCandidate.recordSha256,
      eventCount: checkpoint.anchorCandidate.eventCount,
    },
    projectedEvidence: proposedManifest.resolvedEventEvidence,
    hypotheticalProjectionOutputs: outputBindings(proposedArtifacts),
    eligibility: {
      ...input.policy,
      observedIdentityCount: currentArtifacts.states.length,
      previousEventCount: currentArtifacts.events.length,
      proposedEventCount: proposedArtifacts.events.length,
      previousTrustedPairCount: context.pairs.length,
      oneEventOnly: true,
      ownerConfirmationEventAllowed: false,
    },
    compareAndSwapInputs,
    compareAndSwapInputSetSha256:
      corpusRepositoryBundleBindingSetSha256(compareAndSwapInputs),
    orderedOutputs,
    finalCommitMarkerPath: CORPUS_PENDING_EVENT_FINAL_COMMIT_MARKER,
    operationSemantics: {
      eventLogExtended: true,
      eventManifestReplaced: true,
      pendingAnchorAppended: true,
      repositoryFilesReplaced: 3,
      anchorInstalledLast: true,
      externalAuthorityReadOnly: true,
    },
    safetyBoundary: SAFETY_BOUNDARY,
  };
  return { body: planBodySchema.parse(body), outputs };
}

export function validateCorpusPendingEventAppendPlan(
  value: unknown,
): CorpusPendingEventAppendPlan {
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
    CORPUS_CURRENT_STATE_PATHS.events,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  ];
  if (
    !sameJson(
      plan.orderedOutputs.map((output) => output.path),
      expectedOutputPaths,
    )
  ) {
    fail("ordered outputs are not the exact three-file pending checkpoint");
  }
  const expectedProjectionPaths = [
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ];
  if (
    !sameJson(
      plan.hypotheticalProjectionOutputs.map((output) => output.path),
      expectedProjectionPaths,
    )
  ) {
    fail("hypothetical projection bindings are incomplete or out of order");
  }
  if (
    plan.eligibility.proposedEventCount !==
      plan.eligibility.previousEventCount + 1 ||
    plan.proposedCandidate.eventCount !== plan.eligibility.proposedEventCount ||
    plan.proposedCandidate.sequence !==
      plan.repositoryBefore.anchorRecordCount + 1
  ) {
    fail("plan does not represent exactly one successor event candidate");
  }
  return plan;
}

function sealPlan(proposal: Proposal): CorpusPendingEventAppendPlan {
  const body = planBodySchema.parse(proposal.body);
  return validateCorpusPendingEventAppendPlan({
    ...body,
    planSha256: planHash(body),
  });
}

export function serializeCorpusPendingEventAppendPlan(
  plan: CorpusPendingEventAppendPlan,
): string {
  return `${JSON.stringify(validateCorpusPendingEventAppendPlan(plan), null, 2)}\n`;
}

export function corpusPendingEventApplyAcknowledgement(
  planSha256: string,
): string {
  prefixedSha256Schema.parse(planSha256);
  return `APPLY_CORPUS_PENDING_EVENT_${planSha256.slice("sha256:".length).toUpperCase()}`;
}

export function buildCorpusPendingEventAppendPlan(input: {
  repositoryRoot: string;
  eventPath: string;
  createdAt?: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
}): CorpusPendingEventAppendPlan {
  const root = canonicalRoot(input.repositoryRoot);
  const createdAt = input.createdAt ?? new Date().toISOString();
  utcTimestampSchema.parse(createdAt);
  const policy = testAwareEligibilityPolicy(
    input.testOnlyExpectedIdentityCount,
  );
  const snapshot = loadPolicyBoundExternalSnapshot({
    repositoryRoot: root,
    policy,
    testOnlyInjectedLoader: input.loadExternalSnapshot,
  });
  return sealPlan(
    buildProposal({
      repositoryRoot: root,
      eventPath: input.eventPath,
      externalSnapshot: snapshot,
      createdAt,
      policy,
    }),
  );
}

function assertPlanMatchesProposal(input: {
  plan: CorpusPendingEventAppendPlan;
  proposal: Proposal;
}): void {
  if (!sameJson(sealPlan(input.proposal), input.plan)) {
    fail("sealed plan cannot be reproduced from current inputs");
  }
}

function assertExternalAuthorityMatchesPlan(input: {
  plan: CorpusPendingEventAppendPlan;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
}): void {
  if (
    !sameJson(
      externalAuthorityBinding(input.snapshot),
      input.plan.externalAuthority,
    )
  ) {
    fail("external authority differs from the sealed plan");
  }
}

function beforeBindingMap(plan: CorpusPendingEventAppendPlan) {
  return new Map<string, CorpusRepositoryBundleFileBinding>([
    [CORPUS_CURRENT_STATE_PATHS.events, plan.repositoryBefore.eventLog],
    [
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      plan.repositoryBefore.eventManifest,
    ],
    [
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      plan.repositoryBefore.anchorLog,
    ],
  ]);
}

export function assertCorpusPendingEventJournalMatchesPlan(input: {
  journal: CorpusRepositoryBundleTransactionJournal;
  plan: CorpusPendingEventAppendPlan;
}): void {
  const journal = validateCorpusRepositoryBundleTransactionJournal(
    input.journal,
  );
  const plan = validateCorpusPendingEventAppendPlan(input.plan);
  const expectedBefore = beforeBindingMap(plan);
  const expectedAfter = new Map(
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
    fail(
      "transaction journal is not authorized by the sealed pending-event plan",
    );
  }
  for (const entry of journal.entries) {
    const after = expectedAfter.get(entry.path);
    const before = expectedBefore.get(entry.path);
    if (
      !after ||
      !before ||
      !sameJson(entry.before, before) ||
      !sameJson(entry.after, {
        path: after.path,
        sha256: after.sha256,
        sizeBytes: after.sizeBytes,
      }) ||
      entry.beforeMode !== after.mode ||
      entry.afterMode !== after.mode
    ) {
      fail(`journal binding or mode differs from plan: ${entry.path}`);
    }
  }
}

function assertEventFileMatchesPlan(input: {
  root: string;
  eventPath: string;
  plan: CorpusPendingEventAppendPlan;
}): StableOutsideFile {
  const file = readStableOutsideFile(
    input.root,
    input.eventPath,
    "sealed event input",
  );
  if (
    file.fileSha256 !== input.plan.eventFile.fileSha256 ||
    file.sizeBytes !== input.plan.eventFile.sizeBytes
  ) {
    fail("sealed event input differs from the plan");
  }
  return file;
}

function assertCommittedPendingState(input: {
  repositoryRoot: string;
  eventPath: string;
  plan: CorpusPendingEventAppendPlan;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  policy: EligibilityPolicy;
}): void {
  const root = canonicalRoot(input.repositoryRoot);
  assertEventFileMatchesPlan({
    root,
    eventPath: input.eventPath,
    plan: input.plan,
  });
  assertExternalAuthorityMatchesPlan({
    plan: input.plan,
    snapshot: input.externalSnapshot,
  });
  if (
    input.policy.policy !== input.plan.eligibility.policy ||
    input.policy.requiredIdentityCount !==
      input.plan.eligibility.requiredIdentityCount
  ) {
    fail("committed-state policy differs from the plan");
  }
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: root,
    externalSnapshot: input.externalSnapshot,
    allowPendingCandidate: true,
  });
  if (
    context.latestVerification !== null ||
    context.records.length !==
      input.plan.repositoryBefore.anchorRecordCount + 1 ||
    context.pairs.length !== input.plan.repositoryBefore.trustedPairCount ||
    context.latestCandidate.anchorId !== input.plan.proposedCandidate.id ||
    context.latestCandidate.sequence !==
      input.plan.proposedCandidate.sequence ||
    context.latestCandidate.recordSha256 !==
      input.plan.proposedCandidate.recordSha256 ||
    context.latestCandidate.eventCount !==
      input.plan.proposedCandidate.eventCount
  ) {
    fail("repository does not expose the exact planned pending candidate");
  }
  if (
    !sameJson(
      context.repositoryBaselineInputs,
      input.plan.repositoryBaselineInputs,
    )
  ) {
    fail("repository baseline inputs differ from the pending-event plan");
  }
  const committedOutputs = new Map<string, StableFile>();
  for (const output of input.plan.orderedOutputs) {
    const current = readStableRepositoryFile(root, output.path);
    if (
      !sameJson(current.binding, {
        path: output.path,
        sha256: output.sha256,
        sizeBytes: output.sizeBytes,
      }) ||
      current.mode !== output.mode
    ) {
      fail(`committed pending output differs from plan: ${output.path}`);
    }
    committedOutputs.set(output.path, current);
  }
  for (const binding of [
    input.plan.repositoryBefore.currentState,
    input.plan.repositoryBefore.summary,
    input.plan.repositoryBefore.conflictQueue,
    input.plan.repositoryBefore.generationManifest,
  ]) {
    const current = readCorpusRepositoryBundleFileBinding(root, binding.path);
    if (!sameJson(current, binding)) {
      fail(
        `canonical projection changed before external verification: ${binding.path}`,
      );
    }
  }
  const verifier = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: context.pairs.at(-1)!.candidate,
    latestVerification: context.pairs.at(-1)!.verification,
    latestRepositoryBaselineInputs: context.repositoryBaselineInputs,
  });
  const proposed = buildCorpusProposedPendingCurrentStateArtifacts(root, {
    eventLogBytes: committedOutputs.get(CORPUS_CURRENT_STATE_PATHS.events)!
      .bytes,
    eventManifestBytes: committedOutputs.get(
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
    )!.bytes,
    eventHistoryAnchorBytes: committedOutputs.get(
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    )!.bytes,
    verifyTrustedEventHistoryAnchor: verifier,
  });
  const proposedManifest = parseGenerationManifest(
    Buffer.from(
      generatedArtifact(proposed, CORPUS_CURRENT_STATE_PATHS.generationManifest)
        .content,
      "utf8",
    ),
  );
  if (
    !sameJson(
      proposedManifest.resolvedEventEvidence,
      input.plan.projectedEvidence,
    ) ||
    !sameJson(
      outputBindings(proposed),
      input.plan.hypotheticalProjectionOutputs,
    )
  ) {
    fail(
      "committed pending checkpoint no longer reproduces its projection evidence",
    );
  }
}

export async function applyCorpusPendingEventAppendPlan(input: {
  repositoryRoot: string;
  plan: CorpusPendingEventAppendPlan;
  eventPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
  testFaultInjector?: (
    point: CorpusRepositoryBundleTransactionFaultPoint,
  ) => void;
}): Promise<"committed" | "committed_after_recovery"> {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusPendingEventAppendPlan(input.plan);
  if (
    input.acknowledgement !==
    corpusPendingEventApplyAcknowledgement(plan.planSha256)
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
    eventPath: input.eventPath,
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
        eventPath: input.eventPath,
        externalSnapshot: loadSnapshot(),
        createdAt: plan.createdAt,
        policy,
      });
      assertPlanMatchesProposal({ plan, proposal: refreshed });
    },
    confirmCommittedState: (journal) => {
      assertCorpusPendingEventJournalMatchesPlan({ journal, plan });
      assertCommittedPendingState({
        repositoryRoot: root,
        eventPath: input.eventPath,
        plan,
        externalSnapshot: loadSnapshot(),
        policy,
      });
    },
  });
}

export function recoverCorpusPendingEventAppend(input: {
  repositoryRoot: string;
  plan: CorpusPendingEventAppendPlan;
  eventPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
}): "none" | "rolled_back" | "completed" {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusPendingEventAppendPlan(input.plan);
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
  assertEventFileMatchesPlan({ root, eventPath: input.eventPath, plan });
  assertExternalAuthorityMatchesPlan({ plan, snapshot: loadSnapshot() });
  const journalPath = resolve(
    root,
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  );
  try {
    lstatSync(journalPath);
    assertCorpusPendingEventJournalMatchesPlan({
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
      assertCorpusPendingEventJournalMatchesPlan({ journal, plan });
      assertCommittedPendingState({
        repositoryRoot: root,
        eventPath: input.eventPath,
        plan,
        externalSnapshot: loadSnapshot(),
        policy,
      });
    },
  });
}

export type CorpusPendingEventWriterCliOptions = {
  mode: "plan" | "apply" | "recover";
  eventPath: string;
  planFilePath: string | null;
  acknowledgement: string | null;
};

export function parseCorpusPendingEventWriterArgs(
  args: string[],
): CorpusPendingEventWriterCliOptions {
  const selected = ["--plan", "--apply", "--recover"].filter((flag) =>
    args.includes(flag),
  );
  if (selected.length !== 1) fail("choose exactly one operation mode");
  if (
    selected.some((flag) => args.filter((arg) => arg === flag).length !== 1)
  ) {
    fail("duplicate operation modes are not allowed");
  }
  const values = (prefix: string) =>
    args
      .filter((argument) => argument.startsWith(prefix))
      .map((argument) => argument.slice(prefix.length));
  const events = values("--event=");
  const plans = values("--plan-file=");
  const acknowledgements = values("--ack=");
  const known = args.filter(
    (argument) =>
      ["--plan", "--apply", "--recover"].includes(argument) ||
      argument.startsWith("--event=") ||
      argument.startsWith("--plan-file=") ||
      argument.startsWith("--ack="),
  );
  if (known.length !== args.length) fail("unknown or malformed argument");
  if (events.length !== 1 || !events[0])
    fail("exactly one --event is required");
  const mode = selected[0]!.slice(
    2,
  ) as CorpusPendingEventWriterCliOptions["mode"];
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
    eventPath: events[0]!,
    planFilePath: plans[0] ?? null,
    acknowledgement: acknowledgements[0] ?? null,
  };
}

export function readCorpusPendingEventAppendPlanFile(
  repositoryRoot: string,
  planPath: string,
): CorpusPendingEventAppendPlan {
  const root = canonicalRoot(repositoryRoot);
  const file = readStableOutsideFile(
    root,
    planPath,
    "pending-event plan file",
    CORPUS_PENDING_EVENT_MAX_PLAN_BYTES,
  );
  const plan = validateCorpusPendingEventAppendPlan(
    parseJson("pending-event plan file", file.bytes),
  );
  if (
    file.bytes.toString("utf8") !== serializeCorpusPendingEventAppendPlan(plan)
  ) {
    fail("pending-event plan file is not canonical pretty JSON");
  }
  return plan;
}

async function main(): Promise<void> {
  const root = canonicalRoot(process.cwd());
  const options = parseCorpusPendingEventWriterArgs(process.argv.slice(2));
  if (options.mode === "plan") {
    const plan = buildCorpusPendingEventAppendPlan({
      repositoryRoot: root,
      eventPath: options.eventPath,
    });
    process.stdout.write(serializeCorpusPendingEventAppendPlan(plan));
    process.stderr.write(
      `Apply acknowledgement: ${corpusPendingEventApplyAcknowledgement(plan.planSha256)}\n`,
    );
    return;
  }
  const plan = readCorpusPendingEventAppendPlanFile(
    root,
    options.planFilePath!,
  );
  if (options.mode === "apply") {
    const result = await applyCorpusPendingEventAppendPlan({
      repositoryRoot: root,
      plan,
      eventPath: options.eventPath,
      acknowledgement: options.acknowledgement!,
    });
    process.stdout.write(
      `${JSON.stringify({ result, planSha256: plan.planSha256 })}\n`,
    );
    return;
  }
  const result = recoverCorpusPendingEventAppend({
    repositoryRoot: root,
    plan,
    eventPath: options.eventPath,
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
