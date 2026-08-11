import { closeSync, openSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  installLogicalRestoreCompanionSignalGuard,
  superviseControlledCompanionChild,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";

const [childFixture, cleanupMarkerPath, readyMarkerPath] =
  process.argv.slice(2);
const descriptor = openSync(fileURLToPath(import.meta.url), "r");
const signalGuard = installLogicalRestoreCompanionSignalGuard();

try {
  const outcome = await superviseControlledCompanionChild({
    arguments_: [
      childFixture,
      "signal-wait",
      cleanupMarkerPath,
      readyMarkerPath,
    ],
    cwd: process.cwd(),
    descriptor,
    environment: {},
    executable: process.execPath,
    postAttestation: async () => {},
    signalGuard,
  });
  process.stdout.write(`${JSON.stringify(outcome)}\n`);
  process.exitCode = outcome.exitCode;
} catch {
  process.stderr.write("supervisor harness failed\n");
  process.exitCode = 1;
} finally {
  signalGuard.dispose();
  closeSync(descriptor);
}
