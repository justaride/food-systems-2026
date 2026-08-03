import {
  closeSync,
  fstatSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmdirSync,
  unlinkSync,
} from "node:fs";
import { basename, dirname, isAbsolute } from "node:path";
import { fileURLToPath } from "node:url";

const PUBLIC_NAMES = [
  "LOGICAL_RESTORE_EXPECTED_COMPANION_RECEIPT_SCHEMA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_COMPANION_TEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNNER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_APPLY_RUNTIME_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LAUNCHER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_LOCAL_RUNTIME_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_BINARY_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_MODULES_TREE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_MANIFEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_NODE_RUNTIME_VERIFIER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_CLOSURE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_MANIFEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_POSTGRESQL_TOOLSET_VERIFIER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PRISMA_CLIENT_TREE_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_COMMAND_RUNNER_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_RUNTIME_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_SCHEMA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_REHEARSAL_TEST_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_RUNTIME_ATTESTATION_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_PACKAGE_JSON_SHA256",
  "LOGICAL_RESTORE_EXPECTED_SOURCE_REGISTRATION_TSX_CONFIG_SHA256",
];

const SECRET_NAMES = [
  "DATABASE_RESTORE_ADMIN_URL",
  "DATABASE_URL",
  "LOGICAL_RESTORE_ACK",
  "LOGICAL_RESTORE_COMPANION_RECEIPT_PATH",
  "LOGICAL_RESTORE_DUMP_PATH",
  "LOGICAL_RESTORE_EXPECTED_DUMP_BYTES",
  "LOGICAL_RESTORE_EXPECTED_DUMP_SHA256",
  "LOGICAL_RESTORE_EXPECTED_METADATA_SHA256",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_COMPLETED_AT_UTC",
  "LOGICAL_RESTORE_EXPECTED_STRUCTURAL_RECEIPT_SHA256",
  "LOGICAL_RESTORE_METADATA_BINDING_PATH",
  "LOGICAL_RESTORE_METADATA_PATH",
  "LOGICAL_RESTORE_PRIMARY_CORPUS_ROOT",
  "LOGICAL_RESTORE_REHEARSAL_RECEIPT_PATH",
  "LOGICAL_RESTORE_REPLICA_CORPUS_ROOT",
  "LOGICAL_RESTORE_STRUCTURAL_RECEIPT_PATH",
];

function byteSort(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

function canonicalJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort(byteSort)
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

function exactKeys(value, names) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    canonicalJson(Object.keys(value).sort(byteSort)) ===
      canonicalJson([...names].sort(byteSort))
  );
}

function readCapability(descriptor, format, names) {
  const stats = fstatSync(descriptor, { bigint: true });
  if (
    !stats.isFile() ||
    stats.nlink !== 0n ||
    (Number(stats.mode) & 0o777) !== 0o400 ||
    stats.size <= 0n ||
    stats.size > 262_144n
  ) {
    throw new Error("capability");
  }
  const text = readFileSync(descriptor, "utf8");
  const value = JSON.parse(text);
  if (
    `${canonicalJson(value)}\n` !== text ||
    !exactKeys(value, ["environment", "format", "purpose", "version"]) ||
    value.format !== format ||
    value.purpose !== "logical_restore_companion" ||
    value.version !== 1 ||
    !exactKeys(value.environment, names)
  ) {
    throw new Error("capability");
  }
  for (const name of names) {
    if (
      typeof value.environment[name] !== "string" ||
      value.environment[name].length === 0 ||
      /[\0\r\n]/.test(value.environment[name])
    ) {
      throw new Error("capability");
    }
  }
  return value.environment;
}

function expectedEnvironment() {
  const value = {
    LANG: "C",
    LC_ALL: "C",
    PATH: "/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin",
    SOURCE_REGISTRATION_TRUSTED_BOOTSTRAP_PID: String(process.ppid),
    SOURCE_REGISTRATION_TRUSTED_LAUNCHER_FD: "3",
    SOURCE_REGISTRATION_TRUSTED_PUBLIC_PINS_FD: "4",
    SOURCE_REGISTRATION_TRUSTED_SECRET_INPUT_FD: "5",
    TMPDIR: "/tmp",
    TZ: "UTC",
  };
  if (process.platform === "darwin") {
    const uid = process.getuid?.();
    if (uid === undefined) throw new Error("environment");
    value.__CF_USER_TEXT_ENCODING = `0x${uid.toString(16).toUpperCase()}:0x0:0x0`;
  }
  return value;
}

let refusalStage = "ENVELOPE";
try {
  if (
    process.argv.length !== 3 ||
    process.argv[2] !== "--probe" ||
    canonicalJson(process.env) !== canonicalJson(expectedEnvironment())
  ) {
    throw new Error("envelope");
  }
  refusalStage = "LAUNCHER";
  const launcherStats = fstatSync(3, { bigint: true });
  const executingPath = realpathSync(fileURLToPath(import.meta.url));
  const entryStats = lstatSync(executingPath, { bigint: true });
  if (
    !launcherStats.isFile() ||
    launcherStats.nlink !== 1n ||
    (Number(launcherStats.mode) & 0o777) !== 0o400 ||
    launcherStats.dev !== entryStats.dev ||
    launcherStats.ino !== entryStats.ino
  ) {
    throw new Error("launcher");
  }
  if (executingPath !== process.argv[1]) {
    throw new Error("launcher");
  }
  const parent = dirname(executingPath);
  const parentStats = lstatSync(parent, { bigint: true });
  if (
    dirname(parent) !== realpathSync("/tmp") ||
    !basename(parent).startsWith(
      "foodsystems-source-registration-trusted-launcher-",
    ) ||
    executingPath.includes("://") ||
    executingPath.includes("@") ||
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    (Number(parentStats.mode) & 0o777) !== 0o700 ||
    canonicalJson(readdirSync(parent)) !==
      canonicalJson([executingPath.slice(parent.length + 1)])
  ) {
    throw new Error("launcher");
  }
  unlinkSync(executingPath);
  if (fstatSync(3, { bigint: true }).nlink !== 0n) {
    throw new Error("launcher");
  }
  rmdirSync(parent);
  refusalStage = "PUBLIC_CAPABILITY";
  const publicPins = readCapability(
    4,
    "foodsystems-source-registration-trusted-public-pins",
    PUBLIC_NAMES,
  );
  refusalStage = "SECRET_CAPABILITY";
  const secretInput = readCapability(
    5,
    "foodsystems-source-registration-trusted-secret-input",
    SECRET_NAMES,
  );
  closeSync(4);
  closeSync(5);
  refusalStage = "SECRET_BOUNDARY";
  if (
    Object.values(publicPins).some((value) => !/^[a-f0-9]{64}$/.test(value)) ||
    !secretInput.DATABASE_URL.includes("://") ||
    !secretInput.DATABASE_URL.includes("@") ||
    !secretInput.DATABASE_RESTORE_ADMIN_URL.includes("://") ||
    !secretInput.DATABASE_RESTORE_ADMIN_URL.includes("@") ||
    !SECRET_NAMES.filter(
      (name) => name.endsWith("_PATH") || name.endsWith("_ROOT"),
    ).every((name) => isAbsolute(secretInput[name])) ||
    Object.keys(process.env).some(
      (name) => name === "DATABASE_URL" || name.startsWith("LOGICAL_RESTORE_"),
    )
  ) {
    throw new Error("secret");
  }
  process.stdout.write(
    '{"evidenceClass":"trusted-logical-restore-bootstrap-probe","status":"pass"}\n',
  );
} catch {
  process.stderr.write(`TRUSTED_BOOTSTRAP_PROBE_REFUSED_${refusalStage}\n`);
  process.exitCode = 1;
}
