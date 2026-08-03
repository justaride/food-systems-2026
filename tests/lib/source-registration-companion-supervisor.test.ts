import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  closeSync,
  existsSync,
  mkdtempSync,
  openSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import {
  CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES,
  installLogicalRestoreCompanionSignalGuard,
  parseControlledLogicalRestoreDiagnostic,
  superviseControlledCompanionChild,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const projectRoot = process.cwd();
const childFixture = resolve(
  projectRoot,
  "tests/fixtures/source-registration-companion-child.mjs",
);
const harnessFixture = resolve(
  projectRoot,
  "tests/fixtures/source-registration-companion-supervisor-harness.mjs",
);
const expectedCallback = `${JSON.stringify({
  evidenceClass: "logical-comparison-surrogate",
  receiptSha256: "a".repeat(64),
  status: "pass",
})}\n`;

async function runSupervisedFixture({
  arguments_ = [],
  mode,
  postAttestation = async () => {},
}: {
  arguments_?: string[];
  mode: string;
  postAttestation?: () => Promise<void>;
}) {
  const descriptor = openSync(childFixture, "r");
  const signalGuard = installLogicalRestoreCompanionSignalGuard();
  try {
    return await superviseControlledCompanionChild({
      arguments_: [childFixture, mode, ...arguments_],
      cwd: projectRoot,
      descriptor,
      environment: {},
      executable: process.execPath,
      postAttestation,
      signalGuard,
    });
  } finally {
    signalGuard.dispose();
    closeSync(descriptor);
  }
}

async function waitForFile(path: string, timeoutMilliseconds = 5_000) {
  const deadline = Date.now() + timeoutMilliseconds;
  while (!existsSync(path)) {
    if (Date.now() >= deadline) {
      throw new Error("fixture readiness timeout");
    }
    await delay(10);
  }
}

test("success callback is withheld until post-attestation and then exact", async () => {
  let releasePostAttestation!: () => void;
  let reportPostAttestationStarted!: () => void;
  const postAttestationStarted = new Promise<void>((resolveStarted) => {
    reportPostAttestationStarted = resolveStarted;
  });
  const postAttestationRelease = new Promise<void>((resolveRelease) => {
    releasePostAttestation = resolveRelease;
  });
  const supervised = runSupervisedFixture({
    mode: "valid",
    postAttestation: async () => {
      reportPostAttestationStarted();
      await postAttestationRelease;
    },
  });
  await postAttestationStarted;
  let settled = false;
  void supervised.then(() => {
    settled = true;
  });
  await delay(20);
  assert.equal(settled, false);

  releasePostAttestation();
  const outcome = await supervised;
  assert.deepEqual(outcome, {
    callback: {
      evidenceClass: "logical-comparison-surrogate",
      receiptSha256: "a".repeat(64),
      status: "pass",
    },
    callbackText: expectedCallback,
    exitCode: 0,
  });
});

test("raw child stdout and stderr are suppressed on failure", async () => {
  const secret = "fixture-secret-token";
  const path = "/not-a-real-sensitive-path/receipt.json";
  const outcome = await runSupervisedFixture({
    arguments_: [secret, path],
    mode: "raw-failure",
  });
  assert.deepEqual(outcome, {
    diagnostic: "COMPANION_FAILED",
    exitCode: 1,
  });
  const rendered = JSON.stringify(outcome);
  assert.equal(rendered.includes(secret), false);
  assert.equal(rendered.includes(path), false);
});

test("every exact controlled child diagnostic is relayed with a namespace", async () => {
  for (const code of CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES) {
    const line = Buffer.from(
      `[logical-restore-companion] ERROR ${code}\n`,
      "utf8",
    );
    assert.equal(
      parseControlledLogicalRestoreDiagnostic(line),
      `COMPANION_CHILD_${code}`,
      code,
    );
  }
  const outcome = await runSupervisedFixture({
    arguments_: ["COMMAND_FAILED"],
    mode: "controlled-diagnostic",
  });
  assert.deepEqual(outcome, {
    diagnostic: "COMPANION_CHILD_COMMAND_FAILED",
    exitCode: 1,
  });
});

test("controlled diagnostic parser rejects every non-exact byte form", () => {
  const prefix = "[logical-restore-companion] ERROR COMMAND_FAILED";
  for (const bytes of [
    Buffer.from(`${prefix}\r\n`, "utf8"),
    Buffer.from(prefix, "utf8"),
    Buffer.from(`${prefix} \n`, "utf8"),
    Buffer.from(`${prefix}\n${prefix}\n`, "utf8"),
    Buffer.from(`${prefix}\nsecret=/private/receipt.json\n`, "utf8"),
    Buffer.from("[logical-restore-companion] ERROR UNKNOWN\n", "utf8"),
    Buffer.concat([
      Buffer.from(prefix, "utf8"),
      Buffer.from([0]),
      Buffer.from("\n"),
    ]),
    Buffer.from([0xff, 0xfe, 0xfd]),
  ]) {
    assert.equal(parseControlledLogicalRestoreDiagnostic(bytes), null);
  }
});

test("mixed, malformed, and wrong-status diagnostics remain generic and secret-free", async () => {
  const secret = "postgresql://user:secret@private.example/foodsystems";
  for (const [mode, arguments_] of [
    ["controlled-diagnostic", ["UNKNOWN"]],
    ["controlled-diagnostic-extra", ["COMMAND_FAILED", secret]],
    ["controlled-diagnostic-with-stdout", ["COMMAND_FAILED", secret]],
    ["controlled-diagnostic-wrong-exit", ["COMMAND_FAILED"]],
  ] as const) {
    const outcome = await runSupervisedFixture({
      arguments_: [...arguments_],
      mode,
    });
    assert.deepEqual(
      outcome,
      { diagnostic: "COMPANION_FAILED", exitCode: 1 },
      mode,
    );
    assert.equal(JSON.stringify(outcome).includes(secret), false);
  }
});

test("controlled diagnostic whitelist covers every runner fail literal", () => {
  const source = readFileSync(
    resolve(
      projectRoot,
      "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
    ),
    "utf8",
  );
  const codes = new Set<string>();
  for (const match of source.matchAll(/\bfail\(\s*"([A-Z0-9_]+)"/g)) {
    codes.add(match[1]);
  }
  for (const match of source.matchAll(
    /\bsafeFailure\(\s*[^,]+,\s*"([A-Z0-9_]+)"/g,
  )) {
    codes.add(match[1]);
  }
  assert.equal(
    new Set(CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES).size,
    CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES.length,
  );
  assert.deepEqual(
    [...codes]
      .filter(
        (code) => !CONTROLLED_LOGICAL_RESTORE_DIAGNOSTIC_CODES.includes(code),
      )
      .sort(),
    [],
  );
});

test("malformed and extra output fail the controlled callback protocol", async () => {
  for (const mode of ["malformed", "extra-output", "extra-field"]) {
    const outcome = await runSupervisedFixture({ mode });
    assert.deepEqual(
      outcome,
      { diagnostic: "COMPANION_PROTOCOL_FAILED", exitCode: 1 },
      mode,
    );
  }
});

test("stdout and stderr overflow request SIGTERM and wait for child cleanup", async () => {
  const directory = mkdtempSync(join(tmpdir(), "companion-overflow-test-"));
  try {
    for (const stream of ["stdout", "stderr"]) {
      const marker = join(directory, `${stream}.cleanup`);
      const outcome = await runSupervisedFixture({
        arguments_: [marker, stream],
        mode: "overflow",
      });
      assert.deepEqual(outcome, {
        diagnostic: "COMPANION_FAILED",
        exitCode: 1,
      });
      assert.equal(readFileSync(marker, "utf8"), "SIGTERM\n");
    }
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});

test("post-attestation failure suppresses an otherwise valid callback", async () => {
  const outcome = await runSupervisedFixture({
    mode: "valid",
    postAttestation: async () => {
      throw new Error("fixture post-attestation failure");
    },
  });
  assert.deepEqual(outcome, {
    diagnostic: "COMPANION_POST_ATTESTATION_FAILED",
    exitCode: 1,
  });
  assert.equal(Object.hasOwn(outcome, "callback"), false);
  assert.equal(Object.hasOwn(outcome, "callbackText"), false);
});

for (const [signal, expectedExitCode] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
] as const) {
  test(`${signal} sent to the harness PID is forwarded before exit`, async () => {
    const directory = mkdtempSync(join(tmpdir(), "companion-signal-test-"));
    const cleanupMarker = join(directory, "child.cleanup");
    const readyMarker = join(directory, "child.ready");
    const stdout: Buffer[] = [];
    const stderr: Buffer[] = [];
    try {
      const harness = spawn(
        process.execPath,
        [harnessFixture, childFixture, cleanupMarker, readyMarker],
        {
          cwd: projectRoot,
          env: {} as unknown as NodeJS.ProcessEnv,
          stdio: ["ignore", "pipe", "pipe"] as const,
        },
      );
      harness.stdout.on("data", (chunk: Buffer) => stdout.push(chunk));
      harness.stderr.on("data", (chunk: Buffer) => stderr.push(chunk));
      const closed = new Promise<{
        code: number | null;
        receivedSignal: NodeJS.Signals | null;
      }>((resolveClose) => {
        harness.once("close", (code, receivedSignal) =>
          resolveClose({ code, receivedSignal }),
        );
      });

      await waitForFile(readyMarker);
      assert.equal(typeof harness.pid, "number");
      process.kill(harness.pid!, signal);

      const { code, receivedSignal } = await closed;
      assert.equal(code, expectedExitCode);
      assert.equal(receivedSignal, null);
      assert.equal(readFileSync(cleanupMarker, "utf8"), `${signal}\n`);
      assert.equal(Buffer.concat(stderr).toString("utf8"), "");
      const output = Buffer.concat(stdout).toString("utf8");
      assert.equal(
        output,
        `${JSON.stringify({
          diagnostic: "COMPANION_INTERRUPTED",
          exitCode: expectedExitCode,
        })}\n`,
      );
      assert.equal(output.includes("logical-comparison-surrogate"), false);
      assert.equal(output.includes("a".repeat(64)), false);
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
}
