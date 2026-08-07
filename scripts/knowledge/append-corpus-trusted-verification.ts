#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  type Stats,
} from "node:fs";
import {
  dirname,
  isAbsolute,
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
  CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH,
  corpusExternalAnchorRepositoryBaselineInputsSchema,
  createCorpusExternalAnchorVerifier,
  loadRootOwnedCorpusExternalAnchorLedger,
  requireRequestIsLatestExternalAppend,
  type CorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorLedgerSnapshot,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  CorpusRepositoryBundleFileBindingSchema,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  commitCorpusRepositoryBundleTransaction,
  corpusRepositoryBundleBindingSetSha256,
  corpusRepositoryBundleFileBinding,
  corpusRepositoryBundleRecoveryAcknowledgement,
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
  CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT,
  readAndValidateRepositoryAnchorContext,
  readCorpusExternalAnchorPreparedRequestFile,
  requireRequestMatchesRepository,
  type CorpusExternalAnchorPreparedRequestFile,
  type RepositoryAnchorContext,
} from "./manage-corpus-external-anchor-ledger";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  type CorpusCurrentStateArtifacts,
  type GeneratedArtifact,
} from "./generate-corpus-processing-current-state";

export const CORPUS_TRUSTED_VERIFICATION_APPENDER_SCHEMA_VERSION =
  "corpus-trusted-verification-appender-plan-v1" as const;
export const CORPUS_TRUSTED_VERIFICATION_APPENDER_VERSION = "1.0.0" as const;
export const CORPUS_TRUSTED_VERIFICATION_TRANSACTION_KIND =
  "corpus_trusted_verification_append_v1" as const;
export const CORPUS_TRUSTED_VERIFICATION_PLAN_HASH_DOMAIN =
  "food-systems/corpus-trusted-verification-appender-plan/v1\n" as const;
export const CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT = 1565;
export const CORPUS_TRUSTED_VERIFICATION_FINAL_COMMIT_MARKER =
  CORPUS_CURRENT_STATE_PATHS.generationManifest;

export const CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS = [
  "package.json",
  "package-lock.json",
  "scripts/knowledge/append-corpus-trusted-verification.ts",
  "scripts/knowledge/manage-corpus-external-anchor-ledger.ts",
  "scripts/knowledge/generate-corpus-processing-current-state.ts",
  "src/lib/knowledge/corpus-event-history-external-ledger.ts",
  "src/lib/knowledge/corpus-repository-bundle-transaction.ts",
  "knowledge/corpus/CORPUS-TRUSTED-VERIFICATION-APPENDER.md",
] as const;

const prefixedSha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const utcTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const outputBindingSchema = CorpusRepositoryBundleFileBindingSchema.extend({
  mode: z.number().int().min(0).max(0o777),
})
  .strict()
  .refine(
    (value) => (value.mode & 0o400) !== 0,
    "output mode must remain owner-readable",
  );
const requestFileBindingSchema = z
  .object({
    fileSha256: prefixedSha256Schema,
    sizeBytes: z.number().int().positive(),
    requestSha256: prefixedSha256Schema,
    requestId: identifierSchema,
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
const recordBindingSchema = z
  .object({
    id: identifierSchema,
    sequence: z.number().int().positive(),
    recordSha256: prefixedSha256Schema,
  })
  .strict();
const repositoryBeforeSchema = z
  .object({
    anchorLog: CorpusRepositoryBundleFileBindingSchema,
    anchorRecordCount: z.literal(1),
    trustedPairCount: z.literal(0),
    eventCount: z.literal(0),
    identityCount: z.number().int().positive(),
  })
  .strict();
const proposedAnchorSchema = z
  .object({
    anchorLog: CorpusRepositoryBundleFileBindingSchema,
    anchorRecordCount: z.literal(2),
    lastRecordSha256: prefixedSha256Schema,
  })
  .strict();
const eligibilitySchema = z
  .object({
    policy: z.enum(["production_fixed_1565", "test_only_fixture"]),
    requiredIdentityCount: z.number().int().positive(),
    observedIdentityCount: z.number().int().positive(),
    eventCount: z.literal(0),
    pendingGenesisOnly: z.literal(true),
  })
  .strict();
const safetyBoundarySchema = z
  .object({
    externalLedgerMutationPerformed: z.literal(false),
    lifecycleEventCreated: z.literal(false),
    identityVerified: z.literal(false),
    sourceAnalysisAllowed: z.literal(false),
    ownerReviewComplete: z.literal(false),
    rightsCleared: z.literal(false),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
    researchCompletenessClaimed: z.literal(false),
  })
  .strict();

const planBodySchema = z
  .object({
    schemaVersion: z.literal(
      CORPUS_TRUSTED_VERIFICATION_APPENDER_SCHEMA_VERSION,
    ),
    artifactType: z.literal("corpus_trusted_verification_append_plan"),
    planVersion: z.literal(CORPUS_TRUSTED_VERIFICATION_APPENDER_VERSION),
    planId: identifierSchema,
    createdAt: utcTimestampSchema,
    transactionId: identifierSchema,
    transactionKind: z.literal(CORPUS_TRUSTED_VERIFICATION_TRANSACTION_KIND),
    requestFile: requestFileBindingSchema,
    externalAuthority: externalAuthoritySchema,
    candidate: recordBindingSchema,
    verification: recordBindingSchema,
    repositoryBaselineInputs:
      corpusExternalAnchorRepositoryBaselineInputsSchema,
    repositoryBefore: repositoryBeforeSchema,
    proposedAnchor: proposedAnchorSchema,
    eligibility: eligibilitySchema,
    compareAndSwapInputs: z
      .array(CorpusRepositoryBundleFileBindingSchema)
      .min(1),
    compareAndSwapInputSetSha256: prefixedSha256Schema,
    unchangedOutputs: z
      .object({
        currentState: CorpusRepositoryBundleFileBindingSchema,
        conflictQueue: CorpusRepositoryBundleFileBindingSchema,
      })
      .strict(),
    orderedOutputs: z.array(outputBindingSchema).length(3),
    finalCommitMarkerPath: z.literal(
      CORPUS_TRUSTED_VERIFICATION_FINAL_COMMIT_MARKER,
    ),
    operationSemantics: z
      .object({
        trustedVerificationAppended: z.literal(true),
        repositoryFilesReplaced: z.literal(3),
        generationManifestInstalledLast: z.literal(true),
        externalAuthorityReadOnly: z.literal(true),
      })
      .strict(),
    safetyBoundary: safetyBoundarySchema,
  })
  .strict();

const planSchema = planBodySchema
  .extend({ planSha256: prefixedSha256Schema })
  .strict();

export type CorpusTrustedVerificationAppendPlan = z.infer<typeof planSchema>;
type CorpusTrustedVerificationAppendPlanBody = z.infer<typeof planBodySchema>;

type EligibilityPolicy = {
  policy: "production_fixed_1565" | "test_only_fixture";
  requiredIdentityCount: number;
};

type Proposal = {
  context: RepositoryAnchorContext;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  proposedAnchorBytes: Buffer;
  artifacts: CorpusCurrentStateArtifacts;
  outputs: CorpusRepositoryBundleOutput[];
  body: Omit<
    CorpusTrustedVerificationAppendPlanBody,
    | "schemaVersion"
    | "artifactType"
    | "planVersion"
    | "planId"
    | "createdAt"
    | "transactionId"
    | "transactionKind"
  >;
};

export type CorpusTrustedVerificationAppenderCliOptions = {
  mode: "plan" | "apply" | "recover";
  requestPath: string;
  planFilePath: string | null;
  acknowledgement: string | null;
};

const SAFETY_BOUNDARY = Object.freeze({
  externalLedgerMutationPerformed: false as const,
  lifecycleEventCreated: false as const,
  identityVerified: false as const,
  sourceAnalysisAllowed: false as const,
  ownerReviewComplete: false as const,
  rightsCleared: false as const,
  externalUseAllowed: false as const,
  coveragePromotionAllowed: false as const,
  researchCompletenessClaimed: false as const,
});

function fail(message: string): never {
  throw new Error(`Corpus trusted-verification appender failed: ${message}`);
}

function domainHash(domain: string, value: unknown): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value as CorpusCanonicalJsonValue))
    .digest("hex")}`;
}

function prefixedSha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function sameJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function canonicalRoot(root: string): string {
  if (!isAbsolute(root)) fail("repository root must be absolute");
  const real = realpathSync(root);
  const stat = lstatSync(real);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    fail("repository root must be a real directory");
  }
  return real;
}

function assertAbsoluteFileOutsideRepository(
  repositoryRoot: string,
  path: string,
  label: string,
): void {
  if (!isAbsolute(path) || normalize(path) !== path) {
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

function stableMetadata(left: Stats, right: Stats): boolean {
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

function readStableAbsoluteFile(path: string, label: string): Buffer {
  if (
    !isAbsolute(path) ||
    normalize(path) !== path ||
    (path !== parse(path).root && path.endsWith(sep)) ||
    path.includes("\u0000")
  ) {
    fail(`${label} path must be absolute and normalized`);
  }
  const filesystemRoot = parse(path).root;
  let current = filesystemRoot;
  for (const component of path.slice(filesystemRoot.length).split(sep)) {
    current = resolve(current, component);
    const componentStat = lstatSync(current);
    if (componentStat.isSymbolicLink()) fail(`${label} crosses a symlink`);
  }
  const before = lstatSync(path);
  const mode = before.mode & 0o777;
  if (
    !before.isFile() ||
    before.isSymbolicLink() ||
    before.nlink !== 1 ||
    (mode !== 0o400 && mode !== 0o600)
  ) {
    fail(`${label} must be a one-link mode-0400 or mode-0600 regular file`);
  }
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const opened = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(path);
    if (
      !opened.isFile() ||
      opened.nlink !== 1 ||
      !stableMetadata(before, opened) ||
      !stableMetadata(opened, pathAfterOpen)
    ) {
      fail(`${label} changed while it was opened`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor);
    const pathAfterRead = lstatSync(path);
    if (
      bytes.length !== after.size ||
      !stableMetadata(opened, after) ||
      !stableMetadata(after, pathAfterRead)
    ) {
      fail(`${label} changed while it was read`);
    }
    return bytes;
  } finally {
    closeSync(descriptor);
  }
}

function repositoryFile(root: string, portablePath: string): string {
  const target = resolve(root, portablePath);
  const relation = relative(root, target);
  if (relation === "" || relation === ".." || relation.startsWith(`..${sep}`)) {
    fail(`repository path escapes the root: ${portablePath}`);
  }
  let current = target;
  while (current !== root) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      fail(`repository path crosses a symlink: ${portablePath}`);
    }
    current = dirname(current);
  }
  return target;
}

function readStableRepositoryFile(
  root: string,
  portablePath: string,
): {
  bytes: Buffer;
  mode: number;
  binding: CorpusRepositoryBundleFileBinding;
} {
  const path = repositoryFile(root, portablePath);
  const before = lstatSync(path);
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1) {
    fail(`repository file is not a one-link regular file: ${portablePath}`);
  }
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const opened = fstatSync(descriptor);
    const pathAfterOpen = lstatSync(path);
    if (
      !opened.isFile() ||
      opened.nlink !== 1 ||
      !stableMetadata(before, opened) ||
      !stableMetadata(opened, pathAfterOpen)
    ) {
      fail(`repository file changed while opened: ${portablePath}`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor);
    const pathAfterRead = lstatSync(path);
    if (
      bytes.length !== after.size ||
      !stableMetadata(opened, after) ||
      !stableMetadata(after, pathAfterRead)
    ) {
      fail(`repository file changed while read: ${portablePath}`);
    }
    return {
      bytes,
      mode: after.mode & 0o777,
      binding: corpusRepositoryBundleFileBinding(portablePath, bytes),
    };
  } finally {
    closeSync(descriptor);
  }
}

function parseJson(path: string, bytes: Buffer): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    fail(`${path} is invalid JSON or UTF-8: ${(error as Error).message}`);
  }
}

function generatedArtifact(
  artifacts: CorpusCurrentStateArtifacts,
  path: string,
): GeneratedArtifact {
  const matches = artifacts.bundle.filter((artifact) => artifact.path === path);
  if (matches.length !== 1) {
    fail(`current-state builder did not produce exactly one ${path}`);
  }
  return matches[0]!;
}

function externalAuthorityBinding(
  snapshot: CorpusExternalAnchorLedgerSnapshot,
): z.infer<typeof externalAuthoritySchema> {
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

function requestFileBinding(
  requestFile: CorpusExternalAnchorPreparedRequestFile,
): z.infer<typeof requestFileBindingSchema> {
  return requestFileBindingSchema.parse({
    fileSha256: requestFile.fileSha256,
    sizeBytes: requestFile.sizeBytes,
    requestSha256: requestFile.request.requestSha256,
    requestId: requestFile.request.requestId,
  });
}

function testAwareEligibilityPolicy(
  testOnlyExpectedIdentityCount?: number,
): EligibilityPolicy {
  if (testOnlyExpectedIdentityCount === undefined) {
    return {
      policy: "production_fixed_1565",
      requiredIdentityCount:
        CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT,
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

export function assertCorpusTrustedVerificationAppendEligibility(input: {
  identityCount: number;
  eventCount: number;
  anchorRecordCount: number;
  trustedPairCount: number;
  candidateSequence: number;
  candidatePredecessorRecordSha256: string | null;
  policy?: EligibilityPolicy;
}): void {
  const policy = input.policy ?? {
    policy: "production_fixed_1565",
    requiredIdentityCount: CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT,
  };
  if (
    policy.policy === "production_fixed_1565" &&
    policy.requiredIdentityCount !==
      CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT
  ) {
    fail("production identity-count policy is not fixed at 1565");
  }
  if (input.identityCount !== policy.requiredIdentityCount) {
    fail(
      `repository identity count ${input.identityCount} is not the required ${policy.requiredIdentityCount}`,
    );
  }
  if (
    input.eventCount !== 0 ||
    input.anchorRecordCount !== 1 ||
    input.trustedPairCount !== 0 ||
    input.candidateSequence !== 1 ||
    input.candidatePredecessorRecordSha256 !== null
  ) {
    fail(
      "v1 accepts only a zero-event repository with one pending genesis candidate",
    );
  }
}

function canonicalVerificationLine(request: CorpusExternalAnchorAppendRequest) {
  return Buffer.from(`${JSON.stringify(request.verification)}\n`, "utf8");
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

function prefixedManifestDescriptor(value: unknown) {
  const parsed = z
    .object({
      path: z.string().min(1),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      sizeBytes: z.number().int().nonnegative(),
    })
    .strict()
    .parse(value);
  return CorpusRepositoryBundleFileBindingSchema.parse({
    path: parsed.path,
    sha256: `sha256:${parsed.sha256}`,
    sizeBytes: parsed.sizeBytes,
  });
}

function assertBaselineInputsMatchContext(
  request: CorpusExternalAnchorAppendRequest,
  context: RepositoryAnchorContext,
): void {
  if (
    !sameJson(
      request.repositoryBaselineInputs,
      context.repositoryBaselineInputs,
    )
  ) {
    fail("repository baseline inputs differ from the prepared request");
  }
}

function requireRequestAndExternalAuthority(input: {
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
}): void {
  const verification = requireRequestIsLatestExternalAppend({
    request: input.requestFile.request,
    snapshot: input.externalSnapshot,
  });
  if (
    verification.recordSha256 !==
    input.requestFile.request.verification.recordSha256
  ) {
    fail("external append returned a different trusted verification");
  }
}

function buildProposal(input: {
  repositoryRoot: string;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  eligibilityPolicy: EligibilityPolicy;
}): Proposal {
  const root = canonicalRoot(input.repositoryRoot);
  requireRequestAndExternalAuthority(input);
  const request = input.requestFile.request;
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
  assertBaselineInputsMatchContext(request, context);
  if (
    context.latestCandidate.recordSha256 !== request.candidate.recordSha256 ||
    context.latestVerification !== null
  ) {
    fail("repository does not expose the one pending request candidate");
  }
  const proposedAnchorBytes = Buffer.concat([
    context.anchorLogBytes,
    canonicalVerificationLine(request),
  ]);
  const verifyTrustedEventHistoryAnchor = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: request.candidate,
    latestVerification: request.verification,
    latestRepositoryBaselineInputs: request.repositoryBaselineInputs,
  });
  const artifacts = buildCorpusCurrentStateArtifacts(root, {
    eventHistoryAnchorBytes: proposedAnchorBytes,
    verifyTrustedEventHistoryAnchor,
  });
  assertCorpusTrustedVerificationAppendEligibility({
    identityCount: artifacts.states.length,
    eventCount: artifacts.events.length,
    anchorRecordCount: context.records.length,
    trustedPairCount: context.pairs.length,
    candidateSequence: context.latestCandidate.sequence,
    candidatePredecessorRecordSha256:
      context.latestCandidate.predecessorRecordSha256,
    policy: input.eligibilityPolicy,
  });

  const proposedCurrentState = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.currentState,
  );
  const proposedSummary = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.summary,
  );
  const proposedConflictQueue = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
  );
  const proposedGenerationManifest = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  const currentState = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.currentState,
  );
  const conflictQueue = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
  );
  if (
    !currentState.bytes.equals(Buffer.from(proposedCurrentState.content)) ||
    !conflictQueue.bytes.equals(Buffer.from(proposedConflictQueue.content))
  ) {
    fail(
      "trusted verification must leave current-state rows and conflict queue byte-exact",
    );
  }

  const beforeAnchor = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  if (!beforeAnchor.bytes.equals(context.anchorLogBytes)) {
    fail("repository anchor bytes changed during proposal construction");
  }
  const beforeSummary = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.summary,
  );
  const beforeGenerationManifest = readStableRepositoryFile(
    root,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  const proposedManifestValue = parseJson(
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
    Buffer.from(proposedGenerationManifest.content),
  );
  const proposedManifest = z
    .object({ inputs: z.array(z.unknown()) })
    .passthrough()
    .parse(proposedManifestValue);

  const cas = new Map<string, CorpusRepositoryBundleFileBinding>();
  for (const inputDescriptor of proposedManifest.inputs) {
    const proposedBinding = prefixedManifestDescriptor(inputDescriptor);
    if (
      proposedBinding.path === CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors
    ) {
      if (
        !sameJson(
          proposedBinding,
          corpusRepositoryBundleFileBinding(
            CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
            proposedAnchorBytes,
          ),
        )
      ) {
        fail("proposed generation manifest has the wrong anchor-log input");
      }
      continue;
    }
    const current = readCorpusRepositoryBundleFileBinding(
      root,
      proposedBinding.path,
    );
    if (!sameJson(current, proposedBinding)) {
      fail(`proposed generation input drifted: ${proposedBinding.path}`);
    }
    addExactBinding(cas, current);
  }
  const baselineGenerationManifest = readStableRepositoryFile(
    root,
    CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH,
  );
  const baselineManifestValue = z
    .object({
      inputs: z.array(z.unknown()),
      outputs: z.array(z.unknown()),
    })
    .passthrough()
    .parse(
      parseJson(
        CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH,
        baselineGenerationManifest.bytes,
      ),
    );
  addExactBinding(cas, baselineGenerationManifest.binding);
  for (const descriptor of [
    ...baselineManifestValue.inputs,
    ...baselineManifestValue.outputs,
  ]) {
    const expected = prefixedManifestDescriptor(descriptor);
    const current = readCorpusRepositoryBundleFileBinding(root, expected.path);
    if (!sameJson(current, expected)) {
      fail(`baseline generation dependency drifted: ${expected.path}`);
    }
    addExactBinding(cas, current);
  }
  for (const binding of [
    beforeAnchor.binding,
    beforeSummary.binding,
    beforeGenerationManifest.binding,
    currentState.binding,
    conflictQueue.binding,
  ]) {
    addExactBinding(cas, binding);
  }
  for (const path of CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS) {
    addExactBinding(cas, readCorpusRepositoryBundleFileBinding(root, path));
  }
  const compareAndSwapInputs = [...cas.values()].sort((left, right) =>
    left.path.localeCompare(right.path, "en"),
  );

  const outputs: CorpusRepositoryBundleOutput[] = [
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      content: proposedAnchorBytes,
      mode: beforeAnchor.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.summary,
      content: proposedSummary.content,
      mode: beforeSummary.mode,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.generationManifest,
      content: proposedGenerationManifest.content,
      mode: beforeGenerationManifest.mode,
    },
  ];
  const orderedOutputs = outputs.map((output) => ({
    ...corpusRepositoryBundleFileBinding(output.path, output.content),
    mode: output.mode!,
  }));
  const body: Proposal["body"] = {
    requestFile: requestFileBinding(input.requestFile),
    externalAuthority: externalAuthorityBinding(input.externalSnapshot),
    candidate: {
      id: request.candidate.anchorId,
      sequence: request.candidate.sequence,
      recordSha256: request.candidate.recordSha256,
    },
    verification: {
      id: request.verification.verificationId,
      sequence: request.verification.sequence,
      recordSha256: request.verification.recordSha256,
    },
    repositoryBaselineInputs: request.repositoryBaselineInputs,
    repositoryBefore: {
      anchorLog: beforeAnchor.binding,
      anchorRecordCount: 1,
      trustedPairCount: 0,
      eventCount: 0,
      identityCount: artifacts.states.length,
    },
    proposedAnchor: {
      anchorLog: corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        proposedAnchorBytes,
      ),
      anchorRecordCount: 2,
      lastRecordSha256: request.verification.recordSha256,
    },
    eligibility: {
      ...input.eligibilityPolicy,
      observedIdentityCount: artifacts.states.length,
      eventCount: 0,
      pendingGenesisOnly: true,
    },
    compareAndSwapInputs,
    compareAndSwapInputSetSha256:
      corpusRepositoryBundleBindingSetSha256(compareAndSwapInputs),
    unchangedOutputs: {
      currentState: currentState.binding,
      conflictQueue: conflictQueue.binding,
    },
    orderedOutputs,
    finalCommitMarkerPath: CORPUS_TRUSTED_VERIFICATION_FINAL_COMMIT_MARKER,
    operationSemantics: {
      trustedVerificationAppended: true,
      repositoryFilesReplaced: 3,
      generationManifestInstalledLast: true,
      externalAuthorityReadOnly: true,
    },
    safetyBoundary: SAFETY_BOUNDARY,
  };
  return {
    context,
    requestFile: input.requestFile,
    externalSnapshot: input.externalSnapshot,
    proposedAnchorBytes,
    artifacts,
    outputs,
    body,
  };
}

function transactionId(requestSha256: string): string {
  return `corpus.trusted-verification.${requestSha256.slice("sha256:".length, "sha256:".length + 24)}`;
}

function planId(requestSha256: string): string {
  return `corpus-trusted-verification.${requestSha256.slice("sha256:".length, "sha256:".length + 24)}`;
}

function sealPlan(input: {
  proposal: Proposal;
  createdAt: string;
}): CorpusTrustedVerificationAppendPlan {
  const requestSha256 = input.proposal.requestFile.request.requestSha256;
  const body = planBodySchema.parse({
    schemaVersion: CORPUS_TRUSTED_VERIFICATION_APPENDER_SCHEMA_VERSION,
    artifactType: "corpus_trusted_verification_append_plan",
    planVersion: CORPUS_TRUSTED_VERIFICATION_APPENDER_VERSION,
    planId: planId(requestSha256),
    createdAt: input.createdAt,
    transactionId: transactionId(requestSha256),
    transactionKind: CORPUS_TRUSTED_VERIFICATION_TRANSACTION_KIND,
    ...input.proposal.body,
  });
  return validateCorpusTrustedVerificationAppendPlan({
    ...body,
    planSha256: domainHash(CORPUS_TRUSTED_VERIFICATION_PLAN_HASH_DOMAIN, body),
  });
}

export function validateCorpusTrustedVerificationAppendPlan(
  value: unknown,
): CorpusTrustedVerificationAppendPlan {
  const plan = planSchema.parse(value);
  const { planSha256, ...body } = plan;
  if (
    planSha256 !==
    domainHash(CORPUS_TRUSTED_VERIFICATION_PLAN_HASH_DOMAIN, body)
  ) {
    fail("plan self-hash mismatch");
  }
  const expectedPaths = [
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ];
  const expectedCasPaths = [...plan.compareAndSwapInputs]
    .sort((left, right) => left.path.localeCompare(right.path, "en"))
    .map((binding) => binding.path);
  if (
    !sameJson(
      plan.orderedOutputs.map((output) => output.path),
      expectedPaths,
    ) ||
    !sameJson(plan.orderedOutputs[0], {
      ...plan.proposedAnchor.anchorLog,
      mode: plan.orderedOutputs[0]!.mode,
    }) ||
    plan.compareAndSwapInputSetSha256 !==
      corpusRepositoryBundleBindingSetSha256(plan.compareAndSwapInputs) ||
    plan.transactionId !== transactionId(plan.requestFile.requestSha256) ||
    plan.planId !== planId(plan.requestFile.requestSha256) ||
    plan.candidate.sequence !== 1 ||
    plan.verification.sequence !== 2 ||
    plan.verification.sequence !== plan.candidate.sequence + 1 ||
    plan.proposedAnchor.lastRecordSha256 !== plan.verification.recordSha256 ||
    plan.repositoryBefore.anchorLog.path !==
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors ||
    plan.proposedAnchor.anchorLog.path !==
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors ||
    plan.unchangedOutputs.currentState.path !==
      CORPUS_CURRENT_STATE_PATHS.currentState ||
    plan.unchangedOutputs.conflictQueue.path !==
      CORPUS_CURRENT_STATE_PATHS.conflictQueue ||
    plan.repositoryBefore.identityCount !==
      plan.eligibility.observedIdentityCount ||
    plan.eligibility.observedIdentityCount !==
      plan.eligibility.requiredIdentityCount ||
    plan.externalAuthority.recordCount !== 1 ||
    !sameJson(
      plan.compareAndSwapInputs.map((binding) => binding.path),
      expectedCasPaths,
    ) ||
    (plan.eligibility.policy === "production_fixed_1565" &&
      plan.eligibility.requiredIdentityCount !==
        CORPUS_TRUSTED_VERIFICATION_REQUIRED_IDENTITY_COUNT)
  ) {
    fail("plan invariant mismatch");
  }
  const casPaths = plan.compareAndSwapInputs.map((binding) => binding.path);
  const casByPath = new Map(
    plan.compareAndSwapInputs.map((binding) => [binding.path, binding]),
  );
  const baselineCasBindings = Object.values(plan.repositoryBaselineInputs).map(
    (binding) => ({
      path: binding.path,
      sha256: binding.fileSha256,
      sizeBytes: binding.sizeBytes,
    }),
  );
  if (
    new Set(casPaths).size !== casPaths.length ||
    !expectedPaths.every((path) => casPaths.includes(path)) ||
    !CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS.every((path) =>
      casPaths.includes(path),
    ) ||
    !sameJson(
      casByPath.get(CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors),
      plan.repositoryBefore.anchorLog,
    ) ||
    !sameJson(
      casByPath.get(CORPUS_CURRENT_STATE_PATHS.currentState),
      plan.unchangedOutputs.currentState,
    ) ||
    !sameJson(
      casByPath.get(CORPUS_CURRENT_STATE_PATHS.conflictQueue),
      plan.unchangedOutputs.conflictQueue,
    ) ||
    baselineCasBindings.some(
      (binding) => !sameJson(casByPath.get(binding.path), binding),
    )
  ) {
    fail("plan compare-and-swap set is incomplete or duplicated");
  }
  return plan;
}

export function serializeCorpusTrustedVerificationAppendPlan(
  plan: CorpusTrustedVerificationAppendPlan,
): Buffer {
  return Buffer.from(
    `${JSON.stringify(validateCorpusTrustedVerificationAppendPlan(plan), null, 2)}\n`,
    "utf8",
  );
}

export function corpusTrustedVerificationApplyAcknowledgement(
  planSha256: string,
): string {
  prefixedSha256Schema.parse(planSha256);
  return `APPLY_CORPUS_TRUSTED_VERIFICATION_${planSha256
    .slice("sha256:".length)
    .toUpperCase()}`;
}

export function readCorpusTrustedVerificationAppendPlanFile(
  repositoryRoot: string,
  path: string,
): CorpusTrustedVerificationAppendPlan {
  const root = canonicalRoot(repositoryRoot);
  assertAbsoluteFileOutsideRepository(root, path, "plan file");
  const bytes = readStableAbsoluteFile(path, "plan file");
  const plan = validateCorpusTrustedVerificationAppendPlan(
    parseJson(path, bytes),
  );
  if (!bytes.equals(serializeCorpusTrustedVerificationAppendPlan(plan))) {
    fail("plan file does not use controlled canonical serialization");
  }
  return plan;
}

function readRequestFileOutsideRepository(
  repositoryRoot: string,
  requestPath: string,
): CorpusExternalAnchorPreparedRequestFile {
  const root = canonicalRoot(repositoryRoot);
  assertAbsoluteFileOutsideRepository(root, requestPath, "prepared request");
  return readCorpusExternalAnchorPreparedRequestFile(requestPath);
}

export function buildCorpusTrustedVerificationAppendPlan(input: {
  repositoryRoot: string;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot?: CorpusExternalAnchorLedgerSnapshot;
  createdAt?: string;
  testOnlyExpectedIdentityCount?: number;
}): CorpusTrustedVerificationAppendPlan {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const policy = testAwareEligibilityPolicy(
    input.testOnlyExpectedIdentityCount,
  );
  const externalSnapshot = loadPolicyBoundExternalSnapshot({
    repositoryRoot: input.repositoryRoot,
    policy,
    testOnlyInjectedLoader: input.externalSnapshot
      ? () => input.externalSnapshot!
      : undefined,
  });
  const proposal = buildProposal({
    repositoryRoot: input.repositoryRoot,
    requestFile: input.requestFile,
    externalSnapshot,
    eligibilityPolicy: policy,
  });
  if (
    Date.parse(createdAt) < Date.parse(input.requestFile.request.preparedAt)
  ) {
    fail("plan creation predates the prepared request");
  }
  return sealPlan({ proposal, createdAt });
}

function assertPlanMatchesProposal(input: {
  plan: CorpusTrustedVerificationAppendPlan;
  proposal: Proposal;
}): void {
  const reproduced = sealPlan({
    proposal: input.proposal,
    createdAt: input.plan.createdAt,
  });
  if (!sameJson(reproduced, input.plan)) {
    fail("sealed plan cannot be reproduced from current inputs");
  }
}

function eligibilityPolicyFromPlan(
  plan: CorpusTrustedVerificationAppendPlan,
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

function assertAuthorityMatchesPlan(input: {
  plan: CorpusTrustedVerificationAppendPlan;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
}): void {
  requireRequestAndExternalAuthority(input);
  if (
    !sameJson(requestFileBinding(input.requestFile), input.plan.requestFile) ||
    !sameJson(
      externalAuthorityBinding(input.externalSnapshot),
      input.plan.externalAuthority,
    ) ||
    input.requestFile.request.candidate.recordSha256 !==
      input.plan.candidate.recordSha256 ||
    input.requestFile.request.verification.recordSha256 !==
      input.plan.verification.recordSha256 ||
    !sameJson(
      input.requestFile.request.repositoryBaselineInputs,
      input.plan.repositoryBaselineInputs,
    )
  ) {
    fail("request or external authority differs from the sealed plan");
  }
}

function outputBindingMap(plan: CorpusTrustedVerificationAppendPlan) {
  return new Map(plan.orderedOutputs.map((output) => [output.path, output]));
}

function assertCommittedRepositoryState(input: {
  repositoryRoot: string;
  plan: CorpusTrustedVerificationAppendPlan;
  requestFile: CorpusExternalAnchorPreparedRequestFile;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot;
  policy: EligibilityPolicy;
}): void {
  const root = canonicalRoot(input.repositoryRoot);
  assertAuthorityMatchesPlan(input);
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: root,
    externalSnapshot: input.externalSnapshot,
    allowPendingCandidate: false,
  });
  if (
    context.records.length !== 2 ||
    context.pairs.length !== 1 ||
    context.latestCandidate.recordSha256 !==
      input.requestFile.request.candidate.recordSha256 ||
    context.latestVerification?.recordSha256 !==
      input.requestFile.request.verification.recordSha256
  ) {
    fail("committed repository does not contain the exact trusted pair");
  }
  assertBaselineInputsMatchContext(input.requestFile.request, context);
  const verifyTrustedEventHistoryAnchor = createCorpusExternalAnchorVerifier({
    snapshot: input.externalSnapshot,
    latestCandidate: input.requestFile.request.candidate,
    latestVerification: input.requestFile.request.verification,
    latestRepositoryBaselineInputs:
      input.requestFile.request.repositoryBaselineInputs,
  });
  const artifacts = buildCorpusCurrentStateArtifacts(root, {
    verifyTrustedEventHistoryAnchor,
  });
  if (
    artifacts.events.length !== 0 ||
    artifacts.states.length !== input.policy.requiredIdentityCount
  ) {
    fail("committed repository no longer satisfies the sealed v1 eligibility");
  }
  const expectedOutputs = outputBindingMap(input.plan);
  for (const path of [
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ]) {
    const actual = readCorpusRepositoryBundleFileBinding(root, path);
    const expected = expectedOutputs.get(path);
    if (
      !expected ||
      !sameJson(actual, {
        path: expected.path,
        sha256: expected.sha256,
        sizeBytes: expected.sizeBytes,
      })
    ) {
      fail(`committed output differs from the sealed plan: ${path}`);
    }
  }
  for (const [path, expected] of [
    [
      CORPUS_CURRENT_STATE_PATHS.currentState,
      input.plan.unchangedOutputs.currentState,
    ],
    [
      CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      input.plan.unchangedOutputs.conflictQueue,
    ],
  ] as const) {
    if (
      !sameJson(readCorpusRepositoryBundleFileBinding(root, path), expected)
    ) {
      fail(`unchanged output drifted after commit: ${path}`);
    }
  }
  for (const path of [
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.conflictQueue,
  ]) {
    const generated = generatedArtifact(artifacts, path);
    if (
      !sameJson(
        corpusRepositoryBundleFileBinding(path, generated.content),
        readCorpusRepositoryBundleFileBinding(root, path),
      )
    ) {
      fail(
        `normal current-state rebuild changed a sealed unchanged output: ${path}`,
      );
    }
  }
  const generatedSummary = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.summary,
  );
  const generatedManifest = generatedArtifact(
    artifacts,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  if (
    !sameJson(
      corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.summary,
        generatedSummary.content,
      ),
      readCorpusRepositoryBundleFileBinding(
        root,
        CORPUS_CURRENT_STATE_PATHS.summary,
      ),
    ) ||
    !sameJson(
      corpusRepositoryBundleFileBinding(
        CORPUS_CURRENT_STATE_PATHS.generationManifest,
        generatedManifest.content,
      ),
      readCorpusRepositoryBundleFileBinding(
        root,
        CORPUS_CURRENT_STATE_PATHS.generationManifest,
      ),
    )
  ) {
    fail("normal current-state rebuild differs from committed outputs");
  }
}

export function assertCorpusTrustedVerificationJournalMatchesPlan(input: {
  journal: CorpusRepositoryBundleTransactionJournal;
  plan: CorpusTrustedVerificationAppendPlan;
}): void {
  const journal = validateCorpusRepositoryBundleTransactionJournal(
    input.journal,
  );
  const plan = validateCorpusTrustedVerificationAppendPlan(input.plan);
  const expected = outputBindingMap(plan);
  const before = new Map(
    plan.compareAndSwapInputs.map((binding) => [binding.path, binding]),
  );
  if (
    journal.transactionId !== plan.transactionId ||
    journal.transactionKind !== plan.transactionKind ||
    journal.authorizationSha256 !== plan.planSha256 ||
    journal.finalCommitMarkerPath !== plan.finalCommitMarkerPath ||
    journal.entries.length !== plan.orderedOutputs.length ||
    !sameJson(
      journal.entries.map((entry) => entry.path),
      plan.orderedOutputs.map((output) => output.path),
    )
  ) {
    fail("transaction journal is not authorized by the sealed appender plan");
  }
  for (const entry of journal.entries) {
    const output = expected.get(entry.path);
    if (
      !output ||
      !sameJson(entry.before, before.get(entry.path)) ||
      !sameJson(entry.after, {
        path: output.path,
        sha256: output.sha256,
        sizeBytes: output.sizeBytes,
      }) ||
      entry.beforeMode !== output.mode ||
      entry.afterMode !== output.mode
    ) {
      fail(`journal after-binding differs from plan: ${entry.path}`);
    }
  }
}

export async function applyCorpusTrustedVerificationAppendPlan(input: {
  repositoryRoot: string;
  plan: CorpusTrustedVerificationAppendPlan;
  requestPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
  testFaultInjector?: (
    point: CorpusRepositoryBundleTransactionFaultPoint,
  ) => void;
}): Promise<"committed" | "committed_after_recovery"> {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusTrustedVerificationAppendPlan(input.plan);
  if (
    input.acknowledgement !==
    corpusTrustedVerificationApplyAcknowledgement(plan.planSha256)
  ) {
    fail("exact strong apply acknowledgement is missing");
  }
  const policy = eligibilityPolicyFromPlan(
    plan,
    input.testOnlyExpectedIdentityCount,
  );
  const loadExternalSnapshot = () =>
    loadPolicyBoundExternalSnapshot({
      repositoryRoot: root,
      policy,
      testOnlyInjectedLoader: input.loadExternalSnapshot,
    });
  const currentRequest = readRequestFileOutsideRepository(
    root,
    input.requestPath,
  );
  const currentExternal = loadExternalSnapshot();
  const proposal = buildProposal({
    repositoryRoot: root,
    requestFile: currentRequest,
    externalSnapshot: currentExternal,
    eligibilityPolicy: policy,
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
      const requestFile = readRequestFileOutsideRepository(
        root,
        input.requestPath,
      );
      const externalSnapshot = loadExternalSnapshot();
      const refreshed = buildProposal({
        repositoryRoot: root,
        requestFile,
        externalSnapshot,
        eligibilityPolicy: policy,
      });
      assertPlanMatchesProposal({ plan, proposal: refreshed });
    },
    confirmCommittedState: (journal) => {
      assertCorpusTrustedVerificationJournalMatchesPlan({ journal, plan });
      assertCommittedRepositoryState({
        repositoryRoot: root,
        plan,
        requestFile: readRequestFileOutsideRepository(root, input.requestPath),
        externalSnapshot: loadExternalSnapshot(),
        policy,
      });
    },
  });
}

export function recoverCorpusTrustedVerificationAppend(input: {
  repositoryRoot: string;
  plan: CorpusTrustedVerificationAppendPlan;
  requestPath: string;
  acknowledgement: string;
  loadExternalSnapshot?: () => CorpusExternalAnchorLedgerSnapshot;
  testOnlyExpectedIdentityCount?: number;
}): "none" | "rolled_back" | "completed" {
  const root = canonicalRoot(input.repositoryRoot);
  const plan = validateCorpusTrustedVerificationAppendPlan(input.plan);
  const policy = eligibilityPolicyFromPlan(
    plan,
    input.testOnlyExpectedIdentityCount,
  );
  const loadExternalSnapshot = () =>
    loadPolicyBoundExternalSnapshot({
      repositoryRoot: root,
      policy,
      testOnlyInjectedLoader: input.loadExternalSnapshot,
    });
  const requestFile = readRequestFileOutsideRepository(root, input.requestPath);
  const externalSnapshot = loadExternalSnapshot();
  assertAuthorityMatchesPlan({ plan, requestFile, externalSnapshot });
  const journalPath = resolve(
    root,
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  );
  if (existsSync(journalPath)) {
    assertCorpusTrustedVerificationJournalMatchesPlan({
      journal: readCorpusRepositoryBundleTransactionJournal(root),
      plan,
    });
  }
  return recoverCorpusRepositoryBundleTransaction({
    root,
    acknowledgement: input.acknowledgement,
    confirmCommittedState: (journal) => {
      assertCorpusTrustedVerificationJournalMatchesPlan({ journal, plan });
      assertCommittedRepositoryState({
        repositoryRoot: root,
        plan,
        requestFile: readRequestFileOutsideRepository(root, input.requestPath),
        externalSnapshot: loadExternalSnapshot(),
        policy,
      });
    },
  });
}

export function parseCorpusTrustedVerificationAppenderArgs(
  argv: string[],
): CorpusTrustedVerificationAppenderCliOptions {
  const modes = argv.filter((argument) =>
    ["--plan", "--apply", "--recover"].includes(argument),
  );
  if (modes.length !== 1) fail("choose exactly one operation mode");
  const mode = modes[0]!.slice(
    2,
  ) as CorpusTrustedVerificationAppenderCliOptions["mode"];
  const values = new Map<string, string>();
  for (const argument of argv) {
    if (["--plan", "--apply", "--recover"].includes(argument)) continue;
    const match = /^(--request|--plan-file|--ack)=(.+)$/.exec(argument);
    if (!match || values.has(match[1]!))
      fail(`unknown or duplicate argument: ${argument}`);
    values.set(match[1]!, match[2]!);
  }
  const requestPath = values.get("--request");
  const planFilePath = values.get("--plan-file") ?? null;
  const acknowledgement = values.get("--ack") ?? null;
  if (
    !requestPath ||
    !isAbsolute(requestPath) ||
    normalize(requestPath) !== requestPath
  ) {
    fail("exactly one absolute normalized --request path is required");
  }
  if (mode === "plan") {
    if (planFilePath || acknowledgement)
      fail("plan mode accepts only --request");
  } else if (
    !planFilePath ||
    !isAbsolute(planFilePath) ||
    normalize(planFilePath) !== planFilePath ||
    !acknowledgement
  ) {
    fail(`${mode} requires absolute --plan-file and --ack`);
  }
  return { mode, requestPath, planFilePath, acknowledgement };
}

function loadProductionExternalSnapshot(
  repositoryRoot: string,
): CorpusExternalAnchorLedgerSnapshot {
  const repository = canonicalRoot(repositoryRoot);
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

async function main(): Promise<void> {
  const root = canonicalRoot(process.cwd());
  const options = parseCorpusTrustedVerificationAppenderArgs(
    process.argv.slice(2),
  );
  if (options.mode === "plan") {
    const requestFile = readRequestFileOutsideRepository(
      root,
      options.requestPath,
    );
    const plan = buildCorpusTrustedVerificationAppendPlan({
      repositoryRoot: root,
      requestFile,
    });
    process.stdout.write(serializeCorpusTrustedVerificationAppendPlan(plan));
    process.stderr.write(
      `Apply acknowledgement: ${corpusTrustedVerificationApplyAcknowledgement(plan.planSha256)}\n`,
    );
    return;
  }
  const plan = readCorpusTrustedVerificationAppendPlanFile(
    root,
    options.planFilePath!,
  );
  if (options.mode === "apply") {
    const result = await applyCorpusTrustedVerificationAppendPlan({
      repositoryRoot: root,
      plan,
      requestPath: options.requestPath,
      acknowledgement: options.acknowledgement!,
    });
    process.stdout.write(
      `${JSON.stringify({ result, planSha256: plan.planSha256 })}\n`,
    );
    return;
  }
  const result = recoverCorpusTrustedVerificationAppend({
    repositoryRoot: root,
    plan,
    requestPath: options.requestPath,
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
