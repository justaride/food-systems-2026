import { writeFileSync } from "node:fs";

import { readSourceRegistrationLauncherAttestation } from "../../scripts/knowledge/apply-source-registration-plan.ts";

const attestation = readSourceRegistrationLauncherAttestation();
const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
const databaseName = decodeURIComponent(
  databaseUrl.pathname.replace(/^\//, ""),
);
if (
  !databaseName.startsWith("foodsystems_restore_logical_") ||
  Object.hasOwn(process.env, "DATABASE_RESTORE_ADMIN_URL") ||
  Object.hasOwn(process.env, "LOGICAL_RESTORE_SOURCE_DATABASE_URL")
) {
  throw new Error("nested rehearsal probe environment is not clone-only");
}
const markerPath =
  process.env.SOURCE_REGISTRATION_NESTED_REHEARSAL_PROBE_MARKER;
if (markerPath)
  writeFileSync(markerPath, "reached-after-attestation\n", "utf8");
process.stdout.write(
  `${JSON.stringify({
    runtimeAttestationSha256: attestation.runtimeAttestationSha256,
    status: "nested-rehearsal-attestation-pass",
  })}\n`,
);
