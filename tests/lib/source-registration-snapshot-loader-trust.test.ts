import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { realpathSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const projectRoot = realpathSync(process.cwd());
const fixture = resolve(
  projectRoot,
  "tests/fixtures/source-registration-snapshot-loader-trust.mjs",
);
const supportedRuntime =
  process.platform === "darwin" && process.arch === "arm64";

function cleanEnvironment(): NodeJS.ProcessEnv {
  return {
    LANG: "C",
    LC_ALL: "C",
    PATH: process.env.PATH ?? "/usr/bin:/bin:/usr/sbin:/sbin",
    TMPDIR: "/tmp",
    TZ: "UTC",
  } as unknown as NodeJS.ProcessEnv;
}

test(
  "execution snapshot preserves attestation and the pinned minimal TSX config blocks a repo-root canary",
  { skip: !supportedRuntime, timeout: 120_000 },
  () => {
    const result = spawnSync(process.execPath, [fixture], {
      cwd: projectRoot,
      encoding: "utf8",
      env: cleanEnvironment(),
      maxBuffer: 100_000,
      timeout: 110_000,
    });

    assert.equal(result.error, undefined);
    assert.equal(result.signal, null);
    assert.equal(result.status, 0);
    assert.equal(result.stderr, "");
    assert.deepEqual(JSON.parse(result.stdout), {
      attestationEqual: true,
      canaryControlExecuted: true,
      lockedConfigBlockedCanary: true,
      minimalConfigAttested: true,
      minimalConfigCopiedExactly: true,
    });
  },
);
