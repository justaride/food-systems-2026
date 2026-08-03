import assert from "node:assert/strict";
import {
  existsSync,
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
  CORPUS_CURRENT_STATE_PATHS,
  buildCorpusCurrentStateArtifacts,
  initializeEmptyCorpusStateEventLog,
  parseCorpusCurrentStateCliArgs,
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
