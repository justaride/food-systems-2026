import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  chmodSync,
  copyFileSync,
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  appendRequestToCorpusExternalAnchorSnapshot,
  createCorpusExternalAnchorVerifier,
  prepareCorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorLedgerSnapshot,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH,
  CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  CorpusRepositoryBundleSimulatedCrash,
  corpusRepositoryBundleRecoveryAcknowledgement,
  readCorpusRepositoryBundleTransactionJournal,
} from "../../src/lib/knowledge/corpus-repository-bundle-transaction";
import {
  CORPUS_STATE_EVENT_SCHEMA_VERSION,
  sealCorpusProcessingStateEvent,
  validateCorpusProcessingStateEvent,
} from "../../src/lib/knowledge/corpus-processing-current-state";
import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  writeOrCheckCorpusCurrentStateArtifacts,
} from "../../scripts/knowledge/generate-corpus-processing-current-state";
import {
  readAndValidateRepositoryAnchorContext,
  readCorpusExternalAnchorPreparedRequestFile,
} from "../../scripts/knowledge/manage-corpus-external-anchor-ledger";
import {
  CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS,
  applyCorpusTrustedVerificationAppendPlan,
  buildCorpusTrustedVerificationAppendPlan,
  corpusTrustedVerificationApplyAcknowledgement,
} from "../../scripts/knowledge/append-corpus-trusted-verification";
import {
  CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS,
  applyCorpusPendingEventAppendPlan,
  buildCorpusPendingEventAppendPlan,
  corpusPendingEventApplyAcknowledgement,
  serializeCorpusPendingEventAppendPlan,
} from "../../scripts/knowledge/append-corpus-pending-event";
import {
  CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER,
  CORPUS_EVENT_CHECKPOINT_FINALIZER_IMPLEMENTATION_PATHS,
  applyCorpusEventCheckpointFinalizerPlan,
  assertCorpusEventCheckpointFinalizerJournalMatchesPlan,
  buildCorpusEventCheckpointFinalizerPlan,
  corpusEventCheckpointFinalizerApplyAcknowledgement,
  recoverCorpusEventCheckpointFinalizer,
} from "../../scripts/knowledge/finalize-corpus-event-checkpoint";

const sourceRoot = fileURLToPath(new URL("../../", import.meta.url));
const oldNodeEnv = process.env.NODE_ENV;
Object.assign(process.env, { NODE_ENV: "test" });

const INPUT_MANIFEST_PATH =
  "knowledge/corpus/source-analysis-input-manifests/manifests/136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761.source-analysis-input-manifest.v1.json";
const EXTRACTION_RECEIPT_PATH =
  "knowledge/corpus/pdf-page-extraction/receipts/136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761.receipt.v1.json";
const TARGET_IDENTITY = "document:cmppajyue000rnjvmxrad483t";

const FINAL_OUTPUT_PATHS = [
  CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  CORPUS_CURRENT_STATE_PATHS.currentState,
  CORPUS_CURRENT_STATE_PATHS.summary,
  CORPUS_CURRENT_STATE_PATHS.conflictQueue,
  CORPUS_CURRENT_STATE_PATHS.generationManifest,
] as const;

type TemplateFixture = {
  base: string;
  repositoryRoot: string;
  pendingPlanPath: string;
  requestPath: string;
  genesisSnapshot: CorpusExternalAnchorLedgerSnapshot;
  snapshot: CorpusExternalAnchorLedgerSnapshot;
  request: CorpusExternalAnchorAppendRequest;
  identityCount: number;
  finalizerCreatedAt: string;
};

type Fixture = Omit<TemplateFixture, "base" | "repositoryRoot"> & {
  base: string;
  repositoryRoot: string;
};

let template: TemplateFixture;

function after(value: string, milliseconds: number): string {
  return new Date(Date.parse(value) + milliseconds).toISOString();
}

function fileSha256(bytes: Buffer): string {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function copyPath(root: string, path: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  copyFileSync(join(sourceRoot, path), target);
}

function manifestPaths(path: string): string[] {
  const manifest = JSON.parse(readFileSync(join(sourceRoot, path), "utf8")) as {
    inputs: Array<{ path: string }>;
    outputs: Array<{ path: string }>;
  };
  return [...manifest.inputs, ...manifest.outputs].map((item) => item.path);
}

function fixturePaths(): string[] {
  const corpusManifest =
    "knowledge/corpus/corpus-processing-generation-manifest.v1.json";
  const currentManifest =
    "knowledge/corpus/corpus-processing-current-state-generation-manifest.v1.json";
  return [
    corpusManifest,
    currentManifest,
    ...manifestPaths(corpusManifest),
    ...manifestPaths(currentManifest),
    ...Object.values(CORPUS_CURRENT_STATE_PATHS),
    ...CORPUS_TRUSTED_VERIFICATION_IMPLEMENTATION_PATHS,
    ...CORPUS_PENDING_EVENT_IMPLEMENTATION_PATHS,
    ...CORPUS_EVENT_CHECKPOINT_FINALIZER_IMPLEMENTATION_PATHS,
    INPUT_MANIFEST_PATH,
    EXTRACTION_RECEIPT_PATH,
  ];
}

function writeControlledJson(path: string, value: unknown): void {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  chmodSync(path, 0o600);
}

function transactionClean(root: string): void {
  assert.equal(
    existsSync(join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH)),
    false,
  );
  assert.equal(
    existsSync(join(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH)),
    false,
  );
}

function snapshotRepository(root: string): Record<string, Buffer> {
  const snapshot: Record<string, Buffer> = {};
  const visit = (relativePath: string): void => {
    const directory = relativePath ? join(root, relativePath) : root;
    for (const name of readdirSync(directory)) {
      if (!relativePath && name === ".git") continue;
      const childRelative = relativePath ? `${relativePath}/${name}` : name;
      const child = join(root, childRelative);
      const stat = lstatSync(child);
      if (stat.isDirectory()) visit(childRelative);
      else if (stat.isFile()) snapshot[childRelative] = readFileSync(child);
    }
  };
  visit("");
  return snapshot;
}

function snapshotPaths(root: string, paths: readonly string[]) {
  return Object.fromEntries(
    paths.map((path) => [path, readFileSync(join(root, path))]),
  ) as Record<string, Buffer>;
}

function assertSnapshotsEqual(
  actual: Record<string, Buffer>,
  expected: Record<string, Buffer>,
): void {
  assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort());
  for (const [path, bytes] of Object.entries(expected)) {
    assert.deepEqual(actual[path], bytes, `bytes differ for ${path}`);
  }
}

function assertOnlyFinalizerOutputsChanged(
  before: Record<string, Buffer>,
  afterSnapshot: Record<string, Buffer>,
): void {
  assert.deepEqual(
    Object.keys(afterSnapshot).sort(),
    Object.keys(before).sort(),
    "finalization must not create or remove repository files",
  );
  const allowed = new Set<string>(FINAL_OUTPUT_PATHS);
  const changed: string[] = [];
  for (const [path, bytes] of Object.entries(before)) {
    if (!afterSnapshot[path]!.equals(bytes)) changed.push(path);
  }
  assert.ok(changed.length > 0);
  assert.ok(
    changed.every((path) => allowed.has(path)),
    `unexpected changed repository files: ${changed
      .filter((path) => !allowed.has(path))
      .join(", ")}`,
  );
  for (const path of [
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    CORPUS_CURRENT_STATE_PATHS.currentState,
    CORPUS_CURRENT_STATE_PATHS.summary,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  ]) {
    assert.ok(changed.includes(path), `expected ${path} to change`);
  }
}

async function trustGenesis(input: {
  repositoryRoot: string;
  base: string;
  identityCount: number;
}): Promise<CorpusExternalAnchorLedgerSnapshot> {
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: input.repositoryRoot,
    externalSnapshot: null,
    allowPendingCandidate: true,
  });
  const verifiedAt = after(context.latestCandidate.createdAt, 1_000);
  const request = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    repositoryAnchorLogBytes: context.anchorLogBytes,
    repositoryBaselineInputs: context.repositoryBaselineInputs,
    candidate: context.latestCandidate,
    externalSnapshot: null,
    verifiedAt,
  });
  const snapshot = appendRequestToCorpusExternalAnchorSnapshot({
    request,
    previousSnapshot: null,
    appendedAt: after(verifiedAt, 1_000),
  });
  const requestPath = join(input.base, "genesis-request.json");
  writeControlledJson(requestPath, request);
  const plan = buildCorpusTrustedVerificationAppendPlan({
    repositoryRoot: input.repositoryRoot,
    requestFile: readCorpusExternalAnchorPreparedRequestFile(requestPath),
    externalSnapshot: snapshot,
    createdAt: after(verifiedAt, 2_000),
    testOnlyExpectedIdentityCount: input.identityCount,
  });
  await applyCorpusTrustedVerificationAppendPlan({
    repositoryRoot: input.repositoryRoot,
    plan,
    requestPath,
    acknowledgement: corpusTrustedVerificationApplyAcknowledgement(
      plan.planSha256,
    ),
    loadExternalSnapshot: () => snapshot,
    testOnlyExpectedIdentityCount: input.identityCount,
  });
  return snapshot;
}

function writeTechnicalEvent(root: string, eventPath: string): void {
  const state = readFileSync(
    join(root, CORPUS_CURRENT_STATE_PATHS.currentState),
    "utf8",
  )
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as Record<string, unknown>)
    .find((row) => row.identityKey === TARGET_IDENTITY) as {
    recordId: string;
    identityKey: string;
    baselineBinding: { baselineRowSha256: string };
    stateVersion: number;
    previousIdentityEventSha256: string | null;
    stateSha256: string;
    lifecycleSha256: string;
  };
  assert.ok(state);
  const manifestBytes = readFileSync(join(root, INPUT_MANIFEST_PATH));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as {
    pipelineVersion: string;
    manifestSha256: string;
    normalizedInput: { sha256: string };
    totals: { normalizedCharacterCount: number };
  };
  const receiptBytes = readFileSync(join(root, EXTRACTION_RECEIPT_PATH));
  const receipt = JSON.parse(receiptBytes.toString("utf8")) as {
    pipelineVersion: string;
    receiptSha256: string;
    processingUnit: { rawPdfSha256: string };
  };
  const occurredAt = "2026-08-03T00:00:00.000Z";
  const event = validateCorpusProcessingStateEvent(
    sealCorpusProcessingStateEvent({
      schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
      eventType: "technical_text_extracted" as const,
      eventId: "event.finalizer.technical.fixture",
      globalSequence: 1,
      previousGlobalEventSha256: null,
      identitySequence: state.stateVersion + 1,
      previousIdentityEventSha256: state.previousIdentityEventSha256,
      target: {
        recordId: state.recordId,
        identityKey: state.identityKey,
        baselineRowSha256: state.baselineBinding.baselineRowSha256,
        preStateVersion: state.stateVersion,
        preStateSha256: state.stateSha256,
        preStateLifecycleSha256: state.lifecycleSha256,
      },
      occurredAt,
      payload: {
        qualificationReceiptRef: {
          artifactType: "pdf_technical_qualification" as const,
          artifactId: `artifact.pdf_extraction.${receipt.processingUnit.rawPdfSha256}`,
          artifactVersion: receipt.pipelineVersion,
          path: EXTRACTION_RECEIPT_PATH,
          fileSha256: fileSha256(receiptBytes),
          artifactSha256: `sha256:${receipt.receiptSha256}`,
        },
        inputManifestRef: {
          artifactType: "source_analysis_input_manifest" as const,
          artifactId: `artifact.source_analysis_input.${manifest.manifestSha256}`,
          artifactVersion: manifest.pipelineVersion,
          path: INPUT_MANIFEST_PATH,
          fileSha256: fileSha256(manifestBytes),
          artifactSha256: `sha256:${manifest.manifestSha256}`,
        },
        textAvailability: {
          state: "full_text" as const,
          textSha256: `sha256:${manifest.normalizedInput.sha256}`,
          characterCount: manifest.totals.normalizedCharacterCount,
          extractionMethod: "born_digital" as const,
          observedAt: occurredAt,
        },
      },
    }),
  );
  writeFileSync(eventPath, `${JSON.stringify(event)}\n`, "utf8");
  chmodSync(eventPath, 0o600);
}

async function makeTemplate(): Promise<TemplateFixture> {
  const base = mkdtempSync(
    join(realpathSync(tmpdir()), "corpus-finalizer-template-"),
  );
  const repositoryRoot = join(base, "repository");
  mkdirSync(repositoryRoot);
  for (const path of new Set(fixturePaths())) copyPath(repositoryRoot, path);
  execFileSync("git", ["-C", repositoryRoot, "init", "--quiet"]);
  execFileSync("git", ["-C", repositoryRoot, "add", "--all"]);

  const baseline = JSON.parse(
    readFileSync(
      join(
        repositoryRoot,
        "knowledge/corpus/corpus-processing-baseline.v1.json",
      ),
      "utf8",
    ),
  ) as { expectedActiveRows: number };
  const identityCount = baseline.expectedActiveRows;
  const genesisSnapshot = await trustGenesis({
    repositoryRoot,
    base,
    identityCount,
  });

  const eventPath = join(base, "pending-event.jsonl");
  writeTechnicalEvent(repositoryRoot, eventPath);
  const pendingPlan = buildCorpusPendingEventAppendPlan({
    repositoryRoot,
    eventPath,
    createdAt: "2026-08-03T00:00:01.000Z",
    loadExternalSnapshot: () => genesisSnapshot,
    testOnlyExpectedIdentityCount: identityCount,
  });
  const pendingPlanPath = join(base, "pending-event-plan.json");
  writeFileSync(
    pendingPlanPath,
    serializeCorpusPendingEventAppendPlan(pendingPlan),
    "utf8",
  );
  chmodSync(pendingPlanPath, 0o600);
  await applyCorpusPendingEventAppendPlan({
    repositoryRoot,
    plan: pendingPlan,
    eventPath,
    acknowledgement: corpusPendingEventApplyAcknowledgement(
      pendingPlan.planSha256,
    ),
    loadExternalSnapshot: () => genesisSnapshot,
    testOnlyExpectedIdentityCount: identityCount,
  });

  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot,
    externalSnapshot: genesisSnapshot,
    allowPendingCandidate: true,
  });
  const verifiedAt = after(context.latestCandidate.createdAt, 1_000);
  const request = prepareCorpusExternalAnchorAppendRequest({
    repositoryAnchorLogPath: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    repositoryAnchorLogBytes: context.anchorLogBytes,
    repositoryBaselineInputs: context.repositoryBaselineInputs,
    candidate: context.latestCandidate,
    externalSnapshot: genesisSnapshot,
    verifiedAt,
  });
  const snapshot = appendRequestToCorpusExternalAnchorSnapshot({
    request,
    previousSnapshot: genesisSnapshot,
    appendedAt: after(verifiedAt, 1_000),
  });
  const requestPath = join(base, "event-request.json");
  writeControlledJson(requestPath, request);

  return {
    base,
    repositoryRoot,
    pendingPlanPath,
    requestPath,
    genesisSnapshot,
    snapshot,
    request,
    identityCount,
    finalizerCreatedAt: after(verifiedAt, 2_000),
  };
}

function cloneFixture(): Fixture {
  const base = mkdtempSync(
    join(realpathSync(tmpdir()), "corpus-finalizer-case-"),
  );
  const repositoryRoot = join(base, "repository");
  cpSync(template.repositoryRoot, repositoryRoot, {
    recursive: true,
    preserveTimestamps: true,
  });
  const pendingPlanPath = join(base, "pending-event-plan.json");
  copyFileSync(template.pendingPlanPath, pendingPlanPath);
  chmodSync(pendingPlanPath, 0o600);
  const requestPath = join(base, "event-request.json");
  copyFileSync(template.requestPath, requestPath);
  chmodSync(requestPath, 0o600);
  return {
    base,
    repositoryRoot,
    pendingPlanPath,
    requestPath,
    genesisSnapshot: template.genesisSnapshot,
    snapshot: template.snapshot,
    request: template.request,
    identityCount: template.identityCount,
    finalizerCreatedAt: template.finalizerCreatedAt,
  };
}

function buildPlan(fixture: Fixture) {
  return buildCorpusEventCheckpointFinalizerPlan({
    repositoryRoot: fixture.repositoryRoot,
    requestPath: fixture.requestPath,
    pendingPlanPath: fixture.pendingPlanPath,
    createdAt: fixture.finalizerCreatedAt,
    loadExternalSnapshot: () => fixture.snapshot,
    testOnlyExpectedIdentityCount: fixture.identityCount,
  });
}

function assertNormalGeneratorMatches(fixture: Fixture): void {
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot: fixture.repositoryRoot,
    externalSnapshot: fixture.snapshot,
    allowPendingCandidate: false,
  });
  assert.ok(context.latestVerification);
  const verifier = createCorpusExternalAnchorVerifier({
    snapshot: fixture.snapshot,
    latestCandidate: context.latestCandidate,
    latestVerification: context.latestVerification,
    latestRepositoryBaselineInputs: context.repositoryBaselineInputs,
  });
  const artifacts = buildCorpusCurrentStateArtifacts(fixture.repositoryRoot, {
    verifyTrustedEventHistoryAnchor: verifier,
  });
  assert.equal(artifacts.events.length, 1);
  assert.equal(artifacts.eventHistory.currentCheckpointTrusted, true);
  writeOrCheckCorpusCurrentStateArtifacts(
    fixture.repositoryRoot,
    artifacts,
    true,
  );
  const target = artifacts.states.find(
    (state) => state.identityKey === TARGET_IDENTITY,
  );
  assert.ok(target);
  assert.equal(target.stateVersion, 1);
  assert.equal(target.permissions.ownerApprovedForInternalUse, false);
  assert.equal(target.permissions.externalUseAllowed, false);
  assert.equal(target.permissions.coveragePromotionAllowed, false);
}

test.before(async () => {
  template = await makeTemplate();
});

test("rejects production injection and wrong acknowledgement, then finalizes the exact five-file successor once", async () => {
  const fixture = cloneFixture();
  try {
    assert.throws(
      () =>
        buildCorpusEventCheckpointFinalizerPlan({
          repositoryRoot: fixture.repositoryRoot,
          requestPath: fixture.requestPath,
          pendingPlanPath: fixture.pendingPlanPath,
          createdAt: fixture.finalizerCreatedAt,
          loadExternalSnapshot: () => fixture.snapshot,
        }),
      /external snapshot injection is test-only/,
    );

    const plan = buildPlan(fixture);
    assert.deepEqual(
      plan.orderedOutputs.map((output) => output.path),
      FINAL_OUTPUT_PATHS,
    );
    assert.equal(
      plan.orderedOutputs.at(-1)!.path,
      CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER,
    );
    const before = snapshotRepository(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: "wrong",
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      /strong apply acknowledgement/,
    );
    assertSnapshotsEqual(snapshotRepository(fixture.repositoryRoot), before);
    transactionClean(fixture.repositoryRoot);

    assert.equal(
      await applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      "committed",
    );
    assertOnlyFinalizerOutputsChanged(
      before,
      snapshotRepository(fixture.repositoryRoot),
    );
    assertNormalGeneratorMatches(fixture);
    transactionClean(fixture.repositoryRoot);

    const committed = snapshotRepository(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      /pending|candidate|checkpoint|sealed plan|trusted-verification count/i,
    );
    assertSnapshotsEqual(snapshotRepository(fixture.repositoryRoot), committed);
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("rejects a tampered previous trusted projection before journaling", () => {
  const fixture = cloneFixture();
  try {
    appendFileSync(
      join(fixture.repositoryRoot, CORPUS_CURRENT_STATE_PATHS.summary),
      "\n",
      "utf8",
    );
    const tampered = snapshotRepository(fixture.repositoryRoot);
    assert.throws(
      () => buildPlan(fixture),
      /projection|generated artifact|generated current-state file is stale/i,
    );
    assertSnapshotsEqual(snapshotRepository(fixture.repositoryRoot), tampered);
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("rolls back external-authority and evidence drift during revalidation", async () => {
  const authorityFixture = cloneFixture();
  try {
    const plan = buildPlan(authorityFixture);
    const before = snapshotRepository(authorityFixture.repositoryRoot);
    let snapshot = authorityFixture.snapshot;
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: authorityFixture.repositoryRoot,
        plan,
        requestPath: authorityFixture.requestPath,
        pendingPlanPath: authorityFixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => snapshot,
        testOnlyExpectedIdentityCount: authorityFixture.identityCount,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            snapshot = authorityFixture.genesisSnapshot;
          }
        },
      }),
      /external|latest append|sealed plan|record count/i,
    );
    assertSnapshotsEqual(
      snapshotRepository(authorityFixture.repositoryRoot),
      before,
    );
    transactionClean(authorityFixture.repositoryRoot);
  } finally {
    rmSync(authorityFixture.base, { recursive: true, force: true });
  }

  const evidenceFixture = cloneFixture();
  try {
    const plan = buildPlan(evidenceFixture);
    const beforeOutputs = snapshotPaths(
      evidenceFixture.repositoryRoot,
      FINAL_OUTPUT_PATHS,
    );
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: evidenceFixture.repositoryRoot,
        plan,
        requestPath: evidenceFixture.requestPath,
        pendingPlanPath: evidenceFixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => evidenceFixture.snapshot,
        testOnlyExpectedIdentityCount: evidenceFixture.identityCount,
        testFaultInjector: (point) => {
          if (point === "journal_prepared_durable") {
            appendFileSync(
              join(evidenceFixture.repositoryRoot, INPUT_MANIFEST_PATH),
              "\n",
              "utf8",
            );
          }
        },
      }),
      /artifact|drift|hash|bytes|reference|generated/i,
    );
    assertSnapshotsEqual(
      snapshotPaths(evidenceFixture.repositoryRoot, FINAL_OUTPUT_PATHS),
      beforeOutputs,
    );
    transactionClean(evidenceFixture.repositoryRoot);
  } finally {
    rmSync(evidenceFixture.base, { recursive: true, force: true });
  }
});

test("completes a post-final-marker crash only through authenticated recovery", async () => {
  const fixture = cloneFixture();
  try {
    const plan = buildPlan(fixture);
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (
            point ===
            `target_renamed:${CORPUS_EVENT_CHECKPOINT_FINALIZER_FINAL_COMMIT_MARKER}`
          ) {
            throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusRepositoryBundleSimulatedCrash,
    );
    const journal = readCorpusRepositoryBundleTransactionJournal(
      fixture.repositoryRoot,
    );
    assert.doesNotThrow(() =>
      assertCorpusEventCheckpointFinalizerJournalMatchesPlan({ journal, plan }),
    );
    assert.throws(
      () =>
        recoverCorpusEventCheckpointFinalizer({
          repositoryRoot: fixture.repositoryRoot,
          plan,
          requestPath: fixture.requestPath,
          pendingPlanPath: fixture.pendingPlanPath,
          acknowledgement: "wrong",
          loadExternalSnapshot: () => fixture.snapshot,
          testOnlyExpectedIdentityCount: fixture.identityCount,
        }),
      /recovery acknowledgement/,
    );
    assert.equal(
      recoverCorpusEventCheckpointFinalizer({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusRepositoryBundleRecoveryAcknowledgement(
          journal.journalSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      "completed",
    );
    assertNormalGeneratorMatches(fixture);
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test("rolls back a pre-marker crash without consulting a failed authority loader", async () => {
  const fixture = cloneFixture();
  try {
    const plan = buildPlan(fixture);
    const before = snapshotRepository(fixture.repositoryRoot);
    await assert.rejects(
      applyCorpusEventCheckpointFinalizerPlan({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusEventCheckpointFinalizerApplyAcknowledgement(
          plan.planSha256,
        ),
        loadExternalSnapshot: () => fixture.snapshot,
        testOnlyExpectedIdentityCount: fixture.identityCount,
        testFaultInjector: (point) => {
          if (
            point ===
            `target_renamed:${CORPUS_CURRENT_STATE_PATHS.currentState}`
          ) {
            throw new CorpusRepositoryBundleSimulatedCrash("fixture crash");
          }
        },
      }),
      CorpusRepositoryBundleSimulatedCrash,
    );
    const journal = readCorpusRepositoryBundleTransactionJournal(
      fixture.repositoryRoot,
    );
    let authorityLoaderCalled = false;
    assert.equal(
      recoverCorpusEventCheckpointFinalizer({
        repositoryRoot: fixture.repositoryRoot,
        plan,
        requestPath: fixture.requestPath,
        pendingPlanPath: fixture.pendingPlanPath,
        acknowledgement: corpusRepositoryBundleRecoveryAcknowledgement(
          journal.journalSha256,
        ),
        loadExternalSnapshot: () => {
          authorityLoaderCalled = true;
          throw new Error("external authority unavailable");
        },
        testOnlyExpectedIdentityCount: fixture.identityCount,
      }),
      "rolled_back",
    );
    assert.equal(authorityLoaderCalled, false);
    assertSnapshotsEqual(snapshotRepository(fixture.repositoryRoot), before);
    transactionClean(fixture.repositoryRoot);
  } finally {
    rmSync(fixture.base, { recursive: true, force: true });
  }
});

test.after(() => {
  if (template?.base) rmSync(template.base, { recursive: true, force: true });
  if (oldNodeEnv === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
  else Object.assign(process.env, { NODE_ENV: oldNodeEnv });
});
