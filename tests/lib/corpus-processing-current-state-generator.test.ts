import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  existsSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
} from "../../src/lib/knowledge/corpus-processing-event-history";
import {
  CORPUS_STATE_EVENT_SCHEMA_VERSION,
  sealCorpusProcessingStateEvent,
  validateCorpusProcessingStateEvent,
} from "../../src/lib/knowledge/corpus-processing-current-state";

import {
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusPendingEventCheckpointArtifacts,
  buildCorpusCurrentStateArtifacts,
  createRecordingCorpusEvidenceResolvers,
  initializeEmptyCorpusStateEventLog,
  parseCorpusCurrentStateCliArgs,
  resolveControlledNormalizedText,
  resolveTrackedArtifact,
  writeOrCheckCorpusCurrentStateArtifacts,
} from "../../scripts/knowledge/generate-corpus-processing-current-state";

const repositoryRoot = fileURLToPath(new URL("../../", import.meta.url));

function write(root: string, path: string, content: string): void {
  const target = join(root, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

test("builds and checks the deterministic empty-event projection for all baseline identities", () => {
  const first = buildCorpusCurrentStateArtifacts(repositoryRoot);
  const second = buildCorpusCurrentStateArtifacts(repositoryRoot);
  assert.deepEqual(first.bundle, second.bundle);
  assert.equal(first.states.length, 1555);
  assert.equal(first.events.length, 0);
  assert.equal(first.conflictQueue.length, 0);
  assert.ok(first.states.every((state) => state.stateVersion === 0));
  assert.ok(first.states.every((state) => state.appliedEvents.length === 0));
  assert.equal(
    first.bundle.at(-1)?.path,
    CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  writeOrCheckCorpusCurrentStateArtifacts(repositoryRoot, first, true);
});

test("builds the exact derived bundle from a proposed trusted anchor append without changing the anchor file", () => {
  const anchorPath = join(
    repositoryRoot,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  const before = readFileSync(anchorPath);
  const candidate = JSON.parse(
    before.toString("utf8").trimEnd(),
  ) as CorpusEventHistoryAnchorCandidate;
  const verification = sealCorpusEventHistoryAnchorRecord({
    schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
    recordType: "history_anchor_trusted_verification" as const,
    verificationId: "verification.generator.override.fixture",
    sequence: candidate.sequence + 1,
    predecessorRecordSha256: candidate.recordSha256,
    candidateRecordSha256: candidate.recordSha256,
    verifierId: "verifier.generator.override.fixture",
    method: "controlled_project_identity" as const,
    evidenceSha256: `sha256:${"e".repeat(64)}`,
    verifiedAt: candidate.createdAt,
  });
  const proposed = Buffer.from(
    `${before.toString("utf8")}${JSON.stringify(verification)}\n`,
    "utf8",
  );

  const artifacts = buildCorpusCurrentStateArtifacts(repositoryRoot, {
    eventHistoryAnchorBytes: proposed,
    verifyTrustedEventHistoryAnchor: () => true,
  });

  assert.equal(artifacts.eventHistory.currentCheckpointTrusted, true);
  assert.deepEqual(readFileSync(anchorPath), before);
  const generationManifest = JSON.parse(artifacts.bundle.at(-1)!.content) as {
    inputs: Array<{ path: string; sha256: string; sizeBytes: number }>;
  };
  const binding = generationManifest.inputs.find(
    (input) => input.path === CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  assert.deepEqual(binding, {
    path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    sha256: createHash("sha256").update(proposed).digest("hex"),
    sizeBytes: proposed.length,
  });
});

test("builds one canonical pending event checkpoint after a trusted head", () => {
  const currentAnchorBytes = readFileSync(
    join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors),
  );
  const genesis = JSON.parse(
    currentAnchorBytes.toString("utf8").trimEnd(),
  ) as CorpusEventHistoryAnchorCandidate;
  const verification = sealCorpusEventHistoryAnchorRecord({
    schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
    recordType: "history_anchor_trusted_verification" as const,
    verificationId: "verification.pending.builder.fixture",
    sequence: 2,
    predecessorRecordSha256: genesis.recordSha256,
    candidateRecordSha256: genesis.recordSha256,
    verifierId: "verifier.pending.builder.fixture",
    method: "controlled_project_identity" as const,
    evidenceSha256: `sha256:${"d".repeat(64)}`,
    verifiedAt: "2026-08-02T21:00:00Z",
  });
  const trustedAnchorBytes = Buffer.concat([
    currentAnchorBytes,
    Buffer.from(`${JSON.stringify(verification)}\n`, "utf8"),
  ]);
  const currentState = JSON.parse(
    readFileSync(
      join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.currentState),
      "utf8",
    ).split("\n")[0]!,
  ) as {
    recordId: string;
    identityKey: string;
    baselineBinding: { baselineRowSha256: string };
    stateVersion: number;
    previousIdentityEventSha256: string | null;
    stateSha256: string;
    lifecycleSha256: string;
  };
  const occurredAt = "2026-08-03T00:00:00Z";
  const event = sealCorpusProcessingStateEvent({
    schemaVersion: CORPUS_STATE_EVENT_SCHEMA_VERSION,
    eventType: "technical_text_extracted" as const,
    eventId: "event.pending.builder.fixture",
    globalSequence: 1,
    previousGlobalEventSha256: null,
    identitySequence: 1,
    previousIdentityEventSha256: currentState.previousIdentityEventSha256,
    target: {
      recordId: currentState.recordId,
      identityKey: currentState.identityKey,
      baselineRowSha256: currentState.baselineBinding.baselineRowSha256,
      preStateVersion: currentState.stateVersion,
      preStateSha256: currentState.stateSha256,
      preStateLifecycleSha256: currentState.lifecycleSha256,
    },
    occurredAt,
    payload: {
      qualificationReceiptRef: {
        artifactType: "pdf_technical_qualification" as const,
        artifactId: "artifact.pdf_extraction.fixture",
        artifactVersion: "1.0.0",
        path: "knowledge/corpus/fixtures/qualification.json",
        fileSha256: `sha256:${"1".repeat(64)}`,
        artifactSha256: `sha256:${"2".repeat(64)}`,
      },
      inputManifestRef: {
        artifactType: "source_analysis_input_manifest" as const,
        artifactId: "artifact.source_analysis_input.fixture",
        artifactVersion: "1.0.0",
        path: "knowledge/corpus/fixtures/input-manifest.json",
        fileSha256: `sha256:${"3".repeat(64)}`,
        artifactSha256: `sha256:${"4".repeat(64)}`,
      },
      textAvailability: {
        state: "full_text" as const,
        textSha256: `sha256:${"5".repeat(64)}`,
        characterCount: 123,
        extractionMethod: "born_digital" as const,
        observedAt: occurredAt,
      },
    },
  });
  const sealedEventBytes = Buffer.from(
    `${JSON.stringify(validateCorpusProcessingStateEvent(event))}\n`,
    "utf8",
  );
  const checkpoint = buildCorpusPendingEventCheckpointArtifacts({
    currentEventLogBytes: readFileSync(
      join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.events),
    ),
    currentEventManifestBytes: readFileSync(
      join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.eventManifest),
    ),
    currentEventHistoryAnchorBytes: trustedAnchorBytes,
    sealedEventBytes,
    expectedInitializedAt: "2026-08-02T20:58:11Z",
    candidateCreatedAt: "2026-08-03T00:00:01Z",
  });

  assert.deepEqual(checkpoint.eventLogBytes, sealedEventBytes);
  assert.equal(checkpoint.eventManifest.eventCount, 1);
  assert.equal(checkpoint.eventManifest.lastEventSha256, event.eventSha256);
  assert.equal(checkpoint.anchorCandidate.sequence, 3);
  assert.equal(
    checkpoint.anchorCandidate.predecessorRecordSha256,
    verification.recordSha256,
  );
  assert.equal(checkpoint.anchorCandidate.eventCount, 1);
  assert.deepEqual(
    checkpoint.eventHistoryAnchorBytes.subarray(0, trustedAnchorBytes.length),
    trustedAnchorBytes,
  );
});

test("pending checkpoint byte builder rejects a still-pending repository head", () => {
  const currentEventLogBytes = readFileSync(
    join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.events),
  );
  const currentEventManifestBytes = readFileSync(
    join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.eventManifest),
  );
  const currentEventHistoryAnchorBytes = readFileSync(
    join(repositoryRoot, CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors),
  );
  const input = {
    currentEventLogBytes,
    currentEventManifestBytes,
    currentEventHistoryAnchorBytes,
    sealedEventBytes: Buffer.from("{}\n", "utf8"),
    expectedInitializedAt: "2026-08-02T20:58:11Z",
    candidateCreatedAt: "2026-08-03T00:00:01Z",
  };
  assert.throws(
    () => buildCorpusPendingEventCheckpointArtifacts(input),
    /latest trusted-verification record/,
  );
});

test("initializes a sealed empty event log once and refuses to overwrite it", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-current-state-events-"));
  write(
    root,
    "knowledge/corpus/corpus-processing-baseline.v1.json",
    `${JSON.stringify({
      schemaVersion: "1.0.0",
      baselineId: "whole-corpus-processing-baseline.v1",
      observedAt: "2026-08-02T20:58:11Z",
      expectedActiveRows: 2,
    })}\n`,
  );
  initializeEmptyCorpusStateEventLog(root);
  const eventPath = join(root, CORPUS_CURRENT_STATE_PATHS.events);
  const manifestPath = join(root, CORPUS_CURRENT_STATE_PATHS.eventManifest);
  const anchorPath = join(root, CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors);
  assert.equal(readFileSync(eventPath, "utf8"), "");
  assert.equal(existsSync(manifestPath), true);
  assert.equal(existsSync(anchorPath), true);
  const anchors = readFileSync(anchorPath, "utf8")
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line) as { recordType: string });
  assert.deepEqual(
    anchors.map((record) => record.recordType),
    ["history_anchor_candidate"],
  );
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
    eventCount: number;
    eventLog: { sha256: string; sizeBytes: number };
    manifestSha256: string;
  };
  assert.equal(manifest.eventCount, 0);
  assert.equal(manifest.eventLog.sizeBytes, 0);
  assert.equal(
    manifest.eventLog.sha256,
    "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  );
  assert.match(manifest.manifestSha256, /^sha256:[a-f0-9]{64}$/);
  assert.throws(
    () => initializeEmptyCorpusStateEventLog(root),
    /Refusing to initialize over an existing event log, manifest or history-anchor log/,
  );
});

test("parses only the explicit check and initialization modes", () => {
  assert.deepEqual(parseCorpusCurrentStateCliArgs([]), {
    check: false,
    initializeEvents: false,
    initializeHistoryAnchor: false,
  });
  assert.deepEqual(parseCorpusCurrentStateCliArgs(["--check"]), {
    check: true,
    initializeEvents: false,
    initializeHistoryAnchor: false,
  });
  assert.deepEqual(parseCorpusCurrentStateCliArgs(["--initialize-events"]), {
    check: false,
    initializeEvents: true,
    initializeHistoryAnchor: false,
  });
  assert.deepEqual(
    parseCorpusCurrentStateCliArgs(["--initialize-history-anchor"]),
    {
      check: false,
      initializeEvents: false,
      initializeHistoryAnchor: true,
    },
  );
  assert.throws(
    () =>
      parseCorpusCurrentStateCliArgs([
        "--check",
        "--initialize-history-anchor",
      ]),
    /Choose only one current-state execution mode/,
  );
  assert.throws(
    () => parseCorpusCurrentStateCliArgs(["--check", "--initialize-events"]),
    /Choose only one current-state execution mode/,
  );
  assert.throws(
    () => parseCorpusCurrentStateCliArgs(["--write"]),
    /Unknown arguments/,
  );
});

test("rejects an artifact reached through a symlinked parent outside the repository", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-current-state-root-"));
  const outside = mkdtempSync(join(tmpdir(), "corpus-current-state-outside-"));
  write(outside, "artifact.json", '{"sealed":true}\n');
  symlinkSync(outside, join(root, "linked-outside"), "dir");
  const resolver = resolveTrackedArtifact(root);
  assert.throws(
    () =>
      resolver({
        artifactType: "source_analysis",
        artifactId: "artifact.fixture",
        artifactVersion: "1.0.0",
        path: "linked-outside/artifact.json",
        fileSha256: `sha256:${"a".repeat(64)}`,
        artifactSha256: `sha256:${"b".repeat(64)}`,
      }),
    /symlink or escapes repository root/,
  );
});

test("resolves identity workflow and prompt artifacts as immutable bytes without JSON parsing", () => {
  const root = mkdtempSync(
    join(tmpdir(), "corpus-current-state-byte-artifact-"),
  );
  const content = "Workflow ID: `workflow.source_identity_verification.v1`\n";
  const path = "knowledge/corpus/workflows/source-identity-fixture.md";
  write(root, path, content);
  execFileSync("git", ["-C", root, "init", "--quiet"]);
  execFileSync("git", ["-C", root, "add", "--", path]);
  const resolver = resolveTrackedArtifact(root);
  for (const artifactType of [
    "source_identity_workflow",
    "source_identity_prompt_template",
    "source_analysis_workflow",
    "source_analysis_prompt_template",
  ] as const) {
    const resolved = resolver({
      artifactType,
      artifactId: `artifact.${artifactType}.fixture`,
      artifactVersion: "1.0.0",
      path,
      fileSha256: `sha256:${"a".repeat(64)}`,
      artifactSha256: `sha256:${"b".repeat(64)}`,
    });
    assert.equal(resolved.value, content);
    assert.deepEqual(resolved.bytes, Buffer.from(content, "utf8"));
  }
});

test("records every dynamically resolved event input without persisting source text or absolute private paths", () => {
  const artifactBytes = Buffer.from('{"sealed":true}\n', "utf8");
  const sourceBytes = Buffer.from("private source bytes", "utf8");
  const normalizedBytes = Buffer.from("normalized private text\n", "utf8");
  const recording = createRecordingCorpusEvidenceResolvers({
    resolveArtifact: () => ({
      value: { sealed: true },
      fileSha256: "sha256:ignored-by-recording-wrapper",
      bytes: artifactBytes,
    }),
    resolveSourceContent: () => sourceBytes,
    resolveNormalizedText: () => normalizedBytes,
  });
  const artifactRef = {
    artifactType: "source_analysis" as const,
    artifactId: "artifact.analysis.recording.fixture",
    artifactVersion: "1.0.0",
    path: "knowledge/corpus/source-analysis/recording.fixture.json",
    fileSha256: `sha256:${"a".repeat(64)}`,
    artifactSha256: `sha256:${"b".repeat(64)}`,
  };
  const sourceRef = {
    artifactType: "source_content" as const,
    artifactId: "artifact.source_content.recording.fixture",
    artifactVersion: "1.0.0",
    locator: "private://corpus/sha256/recording.fixture.pdf",
    contentSha256: `sha256:${"c".repeat(64)}`,
    sizeBytes: sourceBytes.length,
  };
  recording.resolveArtifact(artifactRef);
  recording.resolveArtifact(artifactRef);
  recording.resolveSourceContent(sourceRef);
  recording.resolveNormalizedText(
    "private://corpus/pdf-page-extraction/v1/sha256/recording/pages/page-0001.normalized.txt",
  );
  const snapshot = recording.snapshot();
  assert.equal(snapshot.trackedArtifacts.length, 1);
  assert.equal(snapshot.sourceContents.length, 1);
  assert.equal(snapshot.normalizedTextUnits.length, 1);
  assert.equal(snapshot.absolutePrivatePathsPersisted, false);
  assert.equal(snapshot.sourceTextPersisted, false);
  assert.equal(
    JSON.stringify(snapshot).includes(normalizedBytes.toString("utf8")),
    false,
  );
  assert.equal(JSON.stringify(snapshot).includes("/Users/"), false);
});

test("reads normalized text only from a stable private 0400 single-link file", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-normalized-text-root-"));
  const relativePath =
    "pdf-page-extraction/v1/sha256/" +
    `${"a".repeat(64)}/pages/page-0001.normalized.txt`;
  const absolutePath = join(root, relativePath);
  write(root, relativePath, "Exact normalized text\n");
  chmodSync(absolutePath, 0o400);
  const previous = process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT;
  process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT = root;
  try {
    const resolveNormalizedText = resolveControlledNormalizedText();
    const locator = `private://corpus/${relativePath}`;
    assert.deepEqual(
      resolveNormalizedText(locator),
      Buffer.from("Exact normalized text\n", "utf8"),
    );
    chmodSync(absolutePath, 0o600);
    assert.throws(() => resolveNormalizedText(locator), /private 0400/);
    chmodSync(absolutePath, 0o400);
    const hardlinkPath = join(root, "page-hardlink.txt");
    linkSync(absolutePath, hardlinkPath);
    assert.throws(() => resolveNormalizedText(locator), /single-link/);
  } finally {
    if (previous === undefined) {
      delete process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT;
    } else {
      process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT = previous;
    }
  }
});

test("rejects a regular in-root artifact that is not Git-tracked", () => {
  const root = mkdtempSync(join(tmpdir(), "corpus-current-state-untracked-"));
  const path = "knowledge/corpus/untracked.json";
  write(root, path, '{"sealed":true}\n');
  execFileSync("git", ["-C", root, "init", "--quiet"]);
  const resolver = resolveTrackedArtifact(root);
  assert.throws(
    () =>
      resolver({
        artifactType: "source_analysis",
        artifactId: "artifact.untracked.fixture",
        artifactVersion: "1.0.0",
        path,
        fileSha256: `sha256:${"a".repeat(64)}`,
        artifactSha256: `sha256:${"b".repeat(64)}`,
      }),
    /not Git-tracked/,
  );
});
