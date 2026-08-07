#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  fstatSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_PATH,
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
  POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
  verifyPsqlRuntimeClosure,
} from "./verify-psql-runtime-closure.mjs";
import {
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH,
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
  POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
  verifyPostgresqlExtensionRuntimeClosure,
} from "./verify-postgresql-extension-runtime-closure.mjs";

export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT =
  "foodsystems-logical-restore-extension-initializer-request";
export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_FORMAT =
  "foodsystems-logical-restore-extension-initializer-attestation";
export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE =
  "logical_restore_companion_extension_initialization";
export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_DOMAIN =
  "food-systems-2026:logical-restore-extension-initializer-request:v1\0";
export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN =
  "food-systems-2026:logical-restore-extension-initializer-attestation:v1\0";
export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_PLAN_DOMAIN =
  "food-systems-2026:logical-restore-extension-initializer-plan:v1\0";

const MODULE_PATH = realpathSync(fileURLToPath(import.meta.url));
const PROJECT_ROOT = realpathSync(resolve(dirname(MODULE_PATH), "../.."));
const EXPECTED_SYSTEM_IDENTIFIER = "7620055716543368057";
const EXPECTED_SERVER_VERSION_NUM = "160013";
const EXPECTED_SUPERUSER = "gabrielfreeman";
const EXPECTED_DATABASE_OWNER = "foodsystems";
const EXPECTED_SOCKET_DIRECTORY = "/tmp";
const EXPECTED_PORT = "5432";
const PSQL_PATH = "/opt/homebrew/Cellar/postgresql@16/16.13/bin/psql";
const SAFE_CLONE_NAME = /^foodsystems_restore_logical_[a-z0-9_]+$/;
const OWNERSHIP_COMMENT =
  /^foodsystems-logical-restore-companion-owner-v1:[a-f0-9]{64}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const NONCE_PATTERN = /^[a-f0-9]{64}$/;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const MAX_REQUEST_BYTES = 16 * 1024;
const MAX_OUTPUT_BYTES = 1024 * 1024;
const MAX_REQUEST_AGE_MS = 120_000;
const MAX_FUTURE_SKEW_MS = 5_000;
const COMMAND_TIMEOUT_MS = 60_000;

const EXTENSIONS = Object.freeze([
  Object.freeze({
    comment:
      "text similarity measurement and index searching based on trigrams",
    name: "pg_trgm",
    relocatable: true,
    schema: "public",
    version: "1.6",
  }),
  Object.freeze({
    comment: "vector data type and ivfflat and hnsw access methods",
    name: "vector",
    relocatable: true,
    schema: "public",
    version: "0.8.2",
  }),
]);

export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN = Object.freeze([
  "CREATE EXTENSION pg_trgm WITH SCHEMA public VERSION '1.3'",
  "ALTER EXTENSION pg_trgm UPDATE TO '1.4'",
  "ALTER EXTENSION pg_trgm UPDATE TO '1.5'",
  "ALTER EXTENSION pg_trgm UPDATE TO '1.6'",
  "COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams'",
  "CREATE EXTENSION vector WITH SCHEMA public VERSION '0.8.2'",
  "COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods'",
]);

class ExtensionInitializerError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ExtensionInitializerError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new ExtensionInitializerError(code, message);
}

function safeFailure(error, code, message) {
  return error instanceof ExtensionInitializerError
    ? error
    : new ExtensionInitializerError(code, message);
}

export function canonicalExtensionInitializerJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(canonicalExtensionInitializerJson).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalExtensionInitializerJson(value[key])}`,
    )
    .join(",")}}`;
}

export function extensionInitializerSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export const LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN_SHA256 =
  extensionInitializerSha256(
    `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_PLAN_DOMAIN}${canonicalExtensionInitializerJson(
      LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN,
    )}`,
  );

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactObject(value, keys, code, label) {
  if (
    !isPlainObject(value) ||
    canonicalExtensionInitializerJson(Object.keys(value).sort()) !==
      canonicalExtensionInitializerJson([...keys].sort())
  ) {
    fail(code, `${label} shape differs`);
  }
  return value;
}

function sameStableIdentity(left, right) {
  return (
    left.ctimeNs === right.ctimeNs &&
    left.dev === right.dev &&
    left.gid === right.gid &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.mtimeNs === right.mtimeNs &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.uid === right.uid
  );
}

function hashStableFile(path, label) {
  let descriptor;
  try {
    const canonicalPath = realpathSync(path);
    const pathBefore = lstatSync(canonicalPath, { bigint: true });
    if (
      canonicalPath !== path ||
      !pathBefore.isFile() ||
      pathBefore.isSymbolicLink() ||
      pathBefore.nlink !== 1n
    ) {
      fail("EXTENSION_INITIALIZER_RUNTIME", `${label} identity differs`);
    }
    descriptor = openSync(
      canonicalPath,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (!sameStableIdentity(pathBefore, before)) {
      fail("EXTENSION_INITIALIZER_RUNTIME", `${label} changed before read`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    const pathAfter = lstatSync(canonicalPath, { bigint: true });
    if (
      !sameStableIdentity(before, after) ||
      !sameStableIdentity(after, pathAfter)
    ) {
      fail("EXTENSION_INITIALIZER_RUNTIME", `${label} changed during read`);
    }
    return extensionInitializerSha256(bytes);
  } catch (error) {
    throw safeFailure(
      error,
      "EXTENSION_INITIALIZER_RUNTIME",
      `${label} could not be verified`,
    );
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function requestBody(request) {
  const { requestSha256, ...body } = request;
  return body;
}

export function sealExtensionInitializerRequest(body) {
  exactObject(
    body,
    [
      "clone",
      "cluster",
      "format",
      "issuedAtUtc",
      "nonce",
      "parentPid",
      "purpose",
      "version",
    ],
    "EXTENSION_INITIALIZER_REQUEST",
    "request body",
  );
  return Object.freeze({
    ...body,
    requestSha256: extensionInitializerSha256(
      `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_DOMAIN}${canonicalExtensionInitializerJson(
        body,
      )}`,
    ),
  });
}

export function validateExtensionInitializerRequest(
  request,
  { expectedParentPid = process.ppid, now = new Date() } = {},
) {
  const value = exactObject(
    request,
    [
      "clone",
      "cluster",
      "format",
      "issuedAtUtc",
      "nonce",
      "parentPid",
      "purpose",
      "requestSha256",
      "version",
    ],
    "EXTENSION_INITIALIZER_REQUEST",
    "request",
  );
  const clone = exactObject(
    value.clone,
    ["databaseName", "databaseOid", "databaseOwner", "ownershipComment"],
    "EXTENSION_INITIALIZER_REQUEST",
    "request clone",
  );
  const cluster = exactObject(
    value.cluster,
    ["serverVersionNum", "systemIdentifier"],
    "EXTENSION_INITIALIZER_REQUEST",
    "request cluster",
  );
  const issuedAt = Date.parse(value.issuedAtUtc);
  const nowMs = now.valueOf();
  if (
    value.format !== LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_FORMAT ||
    value.version !== 1 ||
    value.purpose !== LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE ||
    value.parentPid !== expectedParentPid ||
    !Number.isSafeInteger(value.parentPid) ||
    value.parentPid <= 0 ||
    typeof value.issuedAtUtc !== "string" ||
    !ISO_UTC_PATTERN.test(value.issuedAtUtc) ||
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(nowMs) ||
    issuedAt > nowMs + MAX_FUTURE_SKEW_MS ||
    nowMs - issuedAt > MAX_REQUEST_AGE_MS ||
    typeof value.nonce !== "string" ||
    !NONCE_PATTERN.test(value.nonce) ||
    typeof value.requestSha256 !== "string" ||
    !SHA256_PATTERN.test(value.requestSha256) ||
    value.requestSha256 !==
      extensionInitializerSha256(
        `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_REQUEST_DOMAIN}${canonicalExtensionInitializerJson(
          requestBody(value),
        )}`,
      ) ||
    cluster.systemIdentifier !== EXPECTED_SYSTEM_IDENTIFIER ||
    cluster.serverVersionNum !== EXPECTED_SERVER_VERSION_NUM ||
    typeof clone.databaseName !== "string" ||
    !SAFE_CLONE_NAME.test(clone.databaseName) ||
    !Number.isSafeInteger(clone.databaseOid) ||
    clone.databaseOid <= 0 ||
    clone.databaseOid > 4_294_967_295 ||
    clone.databaseOwner !== EXPECTED_DATABASE_OWNER ||
    typeof clone.ownershipComment !== "string" ||
    !OWNERSHIP_COMMENT.test(clone.ownershipComment)
  ) {
    fail("EXTENSION_INITIALIZER_REQUEST", "request facts differ");
  }
  return value;
}

export function extensionInitializerCfUserTextEncoding() {
  const uid = process.getuid?.();
  if (!Number.isSafeInteger(uid) || uid < 0) {
    fail("EXTENSION_INITIALIZER_RUNTIME", "initializer user identity differs");
  }
  return `0x${uid.toString(16).toUpperCase()}:0x0:0x0`;
}

export function extensionInitializerCleanEnvironment() {
  return Object.freeze({
    LANG: "C",
    LC_ALL: "C",
    LOGICAL_RESTORE_EXTENSION_PARENT_PID: String(process.pid),
    LOGICAL_RESTORE_EXTENSION_REQUEST_FD: "3",
    TMPDIR: "/tmp",
    TZ: "UTC",
    __CF_USER_TEXT_ENCODING: extensionInitializerCfUserTextEncoding(),
  });
}

function validateOuterEnvironment(env = process.env) {
  const expectedKeys = [
    "LANG",
    "LC_ALL",
    "LOGICAL_RESTORE_EXTENSION_PARENT_PID",
    "LOGICAL_RESTORE_EXTENSION_REQUEST_FD",
    "TMPDIR",
    "TZ",
    "__CF_USER_TEXT_ENCODING",
  ];
  if (
    canonicalExtensionInitializerJson(Object.keys(env).sort()) !==
      canonicalExtensionInitializerJson(expectedKeys.sort()) ||
    env.LANG !== "C" ||
    env.LC_ALL !== "C" ||
    env.TMPDIR !== "/tmp" ||
    env.TZ !== "UTC" ||
    env.LOGICAL_RESTORE_EXTENSION_REQUEST_FD !== "3" ||
    env.LOGICAL_RESTORE_EXTENSION_PARENT_PID !== String(process.ppid) ||
    env.__CF_USER_TEXT_ENCODING !== extensionInitializerCfUserTextEncoding()
  ) {
    fail("EXTENSION_INITIALIZER_REQUEST", "initializer environment differs");
  }
}

export function extensionInitializerPsqlEnvironment(databaseName) {
  if (databaseName !== "postgres" && !SAFE_CLONE_NAME.test(databaseName)) {
    fail("EXTENSION_INITIALIZER_REQUEST", "initializer database name differs");
  }
  return Object.freeze({
    LANG: "C",
    LC_ALL: "C",
    PGAPPNAME: "foodsystems-logical-restore-extension-initializer",
    PGCLIENTENCODING: "UTF8",
    PGCONNECT_TIMEOUT: "5",
    PGDATABASE: databaseName,
    PGHOST: EXPECTED_SOCKET_DIRECTORY,
    PGOPTIONS:
      "-c timezone=UTC -c DateStyle=ISO,YMD -c search_path=pg_catalog -c statement_timeout=30000 -c lock_timeout=5000 -c idle_in_transaction_session_timeout=30000 -c client_min_messages=warning",
    PGPORT: EXPECTED_PORT,
    PGSERVICEFILE: "/dev/null",
    PGSSLMODE: "disable",
    PGTARGETSESSIONATTRS: "read-write",
    PGUSER: EXPECTED_SUPERUSER,
    TZ: "UTC",
  });
}

function sqlLiteral(value) {
  if (typeof value !== "string" || /[';\0\r\n]/.test(value)) {
    fail("EXTENSION_INITIALIZER_REQUEST", "fixed SQL literal differs");
  }
  return `'${value}'`;
}

function extensionStateSql() {
  return `
WITH extension_rows AS (
  SELECT e.extname AS name,
         e.extversion AS version,
         n.nspname AS schema,
         r.rolname AS owner,
         e.extrelocatable AS relocatable,
         obj_description(e.oid, 'pg_extension') AS comment
  FROM pg_extension e
  JOIN pg_namespace n ON n.oid = e.extnamespace
  JOIN pg_roles r ON r.oid = e.extowner
  WHERE e.extname IN ('pg_trgm', 'vector')
), member_rows AS (
  SELECT e.extname AS extension,
         identity.type,
         identity.object_names,
         identity.object_args
  FROM pg_depend d
  JOIN pg_extension e ON e.oid = d.refobjid
  CROSS JOIN LATERAL pg_identify_object_as_address(
    d.classid,
    d.objid,
    d.objsubid
  ) AS identity
  WHERE d.deptype = 'e'
    AND e.extname IN ('pg_trgm', 'vector')
), extension_members AS (
  SELECT extension,
         count(*)::int AS member_count,
         json_agg(
           json_build_object(
             'type', type,
             'objectNames', object_names,
             'objectArgs', object_args
           )
           ORDER BY type, object_names::text, object_args::text
         ) AS members
  FROM member_rows
  GROUP BY extension
)
SELECT json_build_object(
  'systemIdentifier', (SELECT system_identifier::text FROM pg_control_system()),
  'serverVersionNum', current_setting('server_version_num'),
  'databaseName', current_database(),
  'databaseOid', (SELECT oid::text FROM pg_database WHERE datname = current_database()),
  'connectionLimit', (SELECT datconnlimit FROM pg_database WHERE datname = current_database()),
  'activeSessions', (SELECT count(*)::int FROM pg_stat_activity WHERE datid = (SELECT oid FROM pg_database WHERE datname = current_database())),
  'extensions', COALESCE((
    SELECT json_agg(
      json_build_object(
        'name', er.name,
        'version', er.version,
        'schema', er.schema,
        'owner', er.owner,
        'relocatable', er.relocatable,
        'comment', er.comment,
        'memberCount', em.member_count,
        'members', em.members
      ) ORDER BY er.name
    )
    FROM extension_rows er
    JOIN extension_members em ON em.extension = er.name
  ), '[]'::json),
  'vectorSmoke', (SELECT ('[1,2,3]'::public.vector OPERATOR(public.<->) '[1,2,4]'::public.vector)::text)
)::text;
`.trim();
}

export function extensionInitializerVerificationSql() {
  return extensionStateSql();
}

export function buildExtensionInitializerSqlPlan(request) {
  const value = validateExtensionInitializerRequest(request, {
    expectedParentPid: request.parentPid,
    now: new Date(request.issuedAtUtc),
  });
  const cloneName = value.clone.databaseName;
  const cloneOid = String(value.clone.databaseOid);
  const ownershipComment = value.clone.ownershipComment;
  const cloneNameLiteral = sqlLiteral(cloneName);
  const ownershipLiteral = sqlLiteral(ownershipComment);
  const maintenancePreflight = `
SELECT json_build_object(
  'systemIdentifier', (SELECT system_identifier::text FROM pg_control_system()),
  'serverVersionNum', current_setting('server_version_num'),
  'inRecovery', pg_is_in_recovery(),
  'currentUser', current_user,
  'sessionUser', session_user,
  'currentUserSuper', (SELECT rolsuper FROM pg_roles WHERE rolname = current_user),
  'databaseExists', EXISTS(SELECT 1 FROM pg_database WHERE datname = ${cloneNameLiteral}),
  'databaseOid', COALESCE((SELECT oid::text FROM pg_database WHERE datname = ${cloneNameLiteral}), ''),
  'databaseOwner', COALESCE((SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = ${cloneNameLiteral}), ''),
  'databaseOwnerSuper', COALESCE((SELECT r.rolsuper FROM pg_database d JOIN pg_roles r ON r.oid = d.datdba WHERE d.datname = ${cloneNameLiteral}), true),
  'databaseOwnerCreateDb', COALESCE((SELECT r.rolcreatedb FROM pg_database d JOIN pg_roles r ON r.oid = d.datdba WHERE d.datname = ${cloneNameLiteral}), false),
  'databaseComment', COALESCE((SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = ${cloneNameLiteral}), ''),
  'connectionLimit', COALESCE((SELECT datconnlimit FROM pg_database WHERE datname = ${cloneNameLiteral}), -999),
  'isTemplate', COALESCE((SELECT datistemplate FROM pg_database WHERE datname = ${cloneNameLiteral}), true),
  'allowConnections', COALESCE((SELECT datallowconn FROM pg_database WHERE datname = ${cloneNameLiteral}), false),
  'encoding', COALESCE((SELECT pg_encoding_to_char(encoding) FROM pg_database WHERE datname = ${cloneNameLiteral}), ''),
  'activeSessions', (SELECT count(*)::int FROM pg_stat_activity WHERE datid = ${cloneOid}::oid)
)::text;
`.trim();
  const targetMutation = `
BEGIN;
SET LOCAL search_path = pg_catalog;
DO $fixed$
BEGIN
  IF current_database() <> ${cloneNameLiteral}
     OR current_user <> ${sqlLiteral(EXPECTED_SUPERUSER)}
     OR current_setting('server_version_num') <> ${sqlLiteral(EXPECTED_SERVER_VERSION_NUM)}
     OR (SELECT system_identifier::text FROM pg_control_system()) <> ${sqlLiteral(EXPECTED_SYSTEM_IDENTIFIER)}
     OR NOT EXISTS (
       SELECT 1 FROM pg_database
       WHERE datname = ${cloneNameLiteral}
         AND oid = ${cloneOid}::oid
         AND pg_get_userbyid(datdba) = ${sqlLiteral(EXPECTED_DATABASE_OWNER)}
         AND datconnlimit = 0
         AND NOT datistemplate
         AND datallowconn
         AND pg_encoding_to_char(encoding) = 'UTF8'
         AND shobj_description(oid, 'pg_database') = ${ownershipLiteral}
     )
     OR (SELECT count(*) FROM pg_stat_activity WHERE datid = ${cloneOid}::oid) <> 1
     OR (SELECT count(*) FROM pg_event_trigger) <> 0
     OR (SELECT array_agg(extname ORDER BY extname) FROM pg_extension) <> ARRAY['plpgsql']::name[]
     OR NOT EXISTS (
       SELECT 1 FROM pg_namespace
       WHERE nspname = 'public' AND nspowner = 'pg_database_owner'::regrole
     )
     OR EXISTS (
       SELECT 1 FROM pg_namespace
       WHERE nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast', 'public')
         AND nspname !~ '^pg_temp_'
         AND nspname !~ '^pg_toast_temp_'
     )
     OR EXISTS (SELECT 1 FROM pg_class WHERE relnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_proc WHERE pronamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_operator WHERE oprnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_opclass WHERE opcnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_opfamily WHERE opfnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_collation WHERE collnamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_conversion WHERE connamespace = 'public'::regnamespace)
     OR EXISTS (SELECT 1 FROM pg_am WHERE amname IN ('hnsw', 'ivfflat'))
  THEN
    RAISE EXCEPTION 'controlled extension initializer preflight refused';
  END IF;
END
$fixed$ LANGUAGE plpgsql;
${LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN.map(
  (statement) => `${statement};`,
).join("\n")}
${extensionStateSql()}
COMMIT;
`.trim();
  const unlock = `
ALTER DATABASE ${cloneName} CONNECTION LIMIT 1;
SELECT json_build_object(
  'databaseOid', (SELECT oid::text FROM pg_database WHERE datname = ${cloneNameLiteral}),
  'databaseOwner', (SELECT pg_get_userbyid(datdba) FROM pg_database WHERE datname = ${cloneNameLiteral}),
  'databaseComment', (SELECT shobj_description(oid, 'pg_database') FROM pg_database WHERE datname = ${cloneNameLiteral}),
  'connectionLimit', (SELECT datconnlimit FROM pg_database WHERE datname = ${cloneNameLiteral}),
  'activeSessions', (SELECT count(*)::int FROM pg_stat_activity WHERE datid = ${cloneOid}::oid)
)::text;
`.trim();
  return Object.freeze({
    maintenancePreflight,
    targetMutation,
    unlock,
    verify: extensionStateSql(),
  });
}

function parseSingleJsonLine(stdout, code, label) {
  if (
    typeof stdout !== "string" ||
    !stdout.endsWith("\n") ||
    stdout.slice(0, -1).includes("\n")
  ) {
    fail(code, `${label} output differs`);
  }
  try {
    return JSON.parse(stdout.slice(0, -1));
  } catch {
    fail(code, `${label} JSON differs`);
  }
}

function validateMaintenancePreflight(value, request) {
  const facts = exactObject(
    value,
    [
      "activeSessions",
      "allowConnections",
      "connectionLimit",
      "currentUser",
      "currentUserSuper",
      "databaseComment",
      "databaseExists",
      "databaseOid",
      "databaseOwner",
      "databaseOwnerCreateDb",
      "databaseOwnerSuper",
      "encoding",
      "inRecovery",
      "isTemplate",
      "serverVersionNum",
      "sessionUser",
      "systemIdentifier",
    ],
    "EXTENSION_INITIALIZER_PREFLIGHT",
    "maintenance preflight",
  );
  if (
    facts.systemIdentifier !== EXPECTED_SYSTEM_IDENTIFIER ||
    facts.serverVersionNum !== EXPECTED_SERVER_VERSION_NUM ||
    facts.inRecovery !== false ||
    facts.currentUser !== EXPECTED_SUPERUSER ||
    facts.sessionUser !== EXPECTED_SUPERUSER ||
    facts.currentUserSuper !== true ||
    facts.databaseExists !== true ||
    facts.databaseOid !== String(request.clone.databaseOid) ||
    facts.databaseOwner !== EXPECTED_DATABASE_OWNER ||
    facts.databaseOwnerSuper !== false ||
    facts.databaseOwnerCreateDb !== true ||
    facts.databaseComment !== request.clone.ownershipComment ||
    facts.connectionLimit !== 0 ||
    facts.isTemplate !== false ||
    facts.allowConnections !== true ||
    facts.encoding !== "UTF8" ||
    facts.activeSessions !== 0
  ) {
    fail("EXTENSION_INITIALIZER_PREFLIGHT", "maintenance facts differ");
  }
  return facts;
}

function normalizeExtensionRows(extensions, code) {
  if (!Array.isArray(extensions) || extensions.length !== EXTENSIONS.length) {
    fail(code, "extension state facts differ");
  }
  const normalized = extensions.map((extension, index) => {
    const row = exactObject(
      extension,
      [
        "comment",
        "memberCount",
        "members",
        "name",
        "owner",
        "relocatable",
        "schema",
        "version",
      ],
      code,
      "extension row",
    );
    const expected = EXTENSIONS[index];
    if (
      row.name !== expected.name ||
      row.version !== expected.version ||
      row.schema !== expected.schema ||
      row.owner !== EXPECTED_SUPERUSER ||
      row.relocatable !== expected.relocatable ||
      row.comment !== expected.comment ||
      !Number.isSafeInteger(row.memberCount) ||
      row.memberCount <= 0 ||
      !Array.isArray(row.members) ||
      row.members.length !== row.memberCount
    ) {
      fail(code, "extension row facts differ");
    }
    return Object.freeze({
      comment: row.comment,
      memberCount: row.memberCount,
      memberInventorySha256: extensionInitializerSha256(
        canonicalExtensionInitializerJson(row.members),
      ),
      name: row.name,
      owner: row.owner,
      relocatable: row.relocatable,
      schema: row.schema,
      version: row.version,
    });
  });
  return Object.freeze({
    extensions: normalized,
    extensionStateSha256: extensionInitializerSha256(
      canonicalExtensionInitializerJson(normalized),
    ),
  });
}

function normalizeExtensionState(
  value,
  request,
  expectedLimit,
  code = "EXTENSION_INITIALIZER_VERIFY",
) {
  const facts = exactObject(
    value,
    [
      "activeSessions",
      "connectionLimit",
      "databaseName",
      "databaseOid",
      "extensions",
      "serverVersionNum",
      "systemIdentifier",
      "vectorSmoke",
    ],
    code,
    "extension state",
  );
  if (
    facts.systemIdentifier !== EXPECTED_SYSTEM_IDENTIFIER ||
    facts.serverVersionNum !== EXPECTED_SERVER_VERSION_NUM ||
    facts.databaseName !== request.clone.databaseName ||
    facts.databaseOid !== String(request.clone.databaseOid) ||
    facts.connectionLimit !== expectedLimit ||
    facts.activeSessions !== 1 ||
    facts.vectorSmoke !== "1"
  ) {
    fail(code, "extension state facts differ");
  }
  return normalizeExtensionRows(facts.extensions, code);
}

export function validateExtensionInitializerObservedState(
  value,
  { expectedConnectionLimit = 1, request },
) {
  const validatedRequest = validateExtensionInitializerRequest(request, {
    expectedParentPid: request.parentPid,
    now: new Date(request.issuedAtUtc),
  });
  return normalizeExtensionState(
    value,
    validatedRequest,
    expectedConnectionLimit,
    "EXTENSION_INITIALIZER_VERIFY",
  );
}

export function validateExtensionInitializerSourceState(
  value,
  { databaseName = "foodsystems" } = {},
) {
  const code = "EXTENSION_INITIALIZER_SOURCE_STATE";
  const facts = exactObject(
    value,
    [
      "activeSessions",
      "connectionLimit",
      "databaseName",
      "databaseOid",
      "extensions",
      "serverVersionNum",
      "systemIdentifier",
      "vectorSmoke",
    ],
    code,
    "source extension state",
  );
  if (
    databaseName !== "foodsystems" ||
    facts.systemIdentifier !== EXPECTED_SYSTEM_IDENTIFIER ||
    facts.serverVersionNum !== EXPECTED_SERVER_VERSION_NUM ||
    facts.databaseName !== databaseName ||
    typeof facts.databaseOid !== "string" ||
    !/^[1-9]\d*$/.test(facts.databaseOid) ||
    !Number.isSafeInteger(facts.connectionLimit) ||
    !Number.isSafeInteger(facts.activeSessions) ||
    facts.activeSessions <= 0 ||
    facts.vectorSmoke !== "1"
  ) {
    fail(code, "source extension state facts differ");
  }
  return normalizeExtensionRows(facts.extensions, code);
}

function validateUnlock(value, request) {
  const facts = exactObject(
    value,
    [
      "activeSessions",
      "connectionLimit",
      "databaseComment",
      "databaseOid",
      "databaseOwner",
    ],
    "EXTENSION_INITIALIZER_VERIFY",
    "unlock facts",
  );
  if (
    facts.databaseOid !== String(request.clone.databaseOid) ||
    facts.databaseOwner !== EXPECTED_DATABASE_OWNER ||
    facts.databaseComment !== request.clone.ownershipComment ||
    facts.connectionLimit !== 1 ||
    facts.activeSessions !== 0
  ) {
    fail("EXTENSION_INITIALIZER_VERIFY", "unlock facts differ");
  }
  return facts;
}

function validateRuntimeFacts(value) {
  const facts = exactObject(
    value,
    [
      "brokerSha256",
      "extensionClosureSha256",
      "extensionManifestSha256",
      "psqlClosureSha256",
      "psqlManifestSha256",
      "psqlSha256",
    ],
    "EXTENSION_INITIALIZER_RUNTIME",
    "runtime facts",
  );
  for (const value of Object.values(facts)) {
    if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
      fail("EXTENSION_INITIALIZER_RUNTIME", "runtime hash differs");
    }
  }
  return facts;
}

export function validateExtensionInitializerAttestation(
  attestation,
  { expectedRequest, expectedRuntimeFacts, now = new Date() },
) {
  const request = validateExtensionInitializerRequest(expectedRequest, {
    expectedParentPid: expectedRequest.parentPid,
    now,
  });
  const value = exactObject(
    attestation,
    [
      "attestationSha256",
      "completedAtUtc",
      "extensionStateSha256",
      "extensions",
      "fixedMutationPlanSha256",
      "format",
      "purpose",
      "requestSha256",
      "runtime",
      "target",
      "transactionCommitted",
      "version",
    ],
    "EXTENSION_INITIALIZER_ATTESTATION",
    "attestation",
  );
  const runtime = validateRuntimeFacts(value.runtime);
  const expectedRuntime = validateRuntimeFacts(expectedRuntimeFacts);
  const target = exactObject(
    value.target,
    [
      "activeSessionsBefore",
      "connectionLimitAfter",
      "connectionLimitBefore",
      "databaseOid",
      "databaseOwner",
      "nameSha256",
      "ownershipCommentSha256",
      "serverVersionNum",
      "systemIdentifier",
    ],
    "EXTENSION_INITIALIZER_ATTESTATION",
    "attestation target",
  );
  if (!Array.isArray(value.extensions) || value.extensions.length !== 2) {
    fail("EXTENSION_INITIALIZER_ATTESTATION", "attested extensions differ");
  }
  const extensions = value.extensions.map((extension, index) => {
    const row = exactObject(
      extension,
      [
        "comment",
        "memberCount",
        "memberInventorySha256",
        "name",
        "owner",
        "relocatable",
        "schema",
        "version",
      ],
      "EXTENSION_INITIALIZER_ATTESTATION",
      "attested extension",
    );
    const expected = EXTENSIONS[index];
    if (
      row.name !== expected.name ||
      row.version !== expected.version ||
      row.schema !== expected.schema ||
      row.owner !== EXPECTED_SUPERUSER ||
      row.relocatable !== expected.relocatable ||
      row.comment !== expected.comment ||
      !Number.isSafeInteger(row.memberCount) ||
      row.memberCount <= 0 ||
      typeof row.memberInventorySha256 !== "string" ||
      !SHA256_PATTERN.test(row.memberInventorySha256)
    ) {
      fail("EXTENSION_INITIALIZER_ATTESTATION", "attested extension differs");
    }
    return row;
  });
  const completedAt = Date.parse(value.completedAtUtc);
  const issuedAt = Date.parse(request.issuedAtUtc);
  const nowMs = now.valueOf();
  const { attestationSha256, ...body } = value;
  if (
    value.format !== LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_FORMAT ||
    value.version !== 1 ||
    value.purpose !== LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE ||
    value.requestSha256 !== request.requestSha256 ||
    value.fixedMutationPlanSha256 !==
      LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN_SHA256 ||
    value.transactionCommitted !== true ||
    typeof value.completedAtUtc !== "string" ||
    !ISO_UTC_PATTERN.test(value.completedAtUtc) ||
    !Number.isFinite(completedAt) ||
    completedAt < issuedAt ||
    completedAt > nowMs + MAX_FUTURE_SKEW_MS ||
    nowMs - completedAt > MAX_REQUEST_AGE_MS ||
    typeof value.extensionStateSha256 !== "string" ||
    value.extensionStateSha256 !==
      extensionInitializerSha256(
        canonicalExtensionInitializerJson(extensions),
      ) ||
    canonicalExtensionInitializerJson(runtime) !==
      canonicalExtensionInitializerJson(expectedRuntime) ||
    target.activeSessionsBefore !== 0 ||
    target.connectionLimitBefore !== 0 ||
    target.connectionLimitAfter !== 1 ||
    target.databaseOid !== request.clone.databaseOid ||
    target.databaseOwner !== EXPECTED_DATABASE_OWNER ||
    target.nameSha256 !==
      extensionInitializerSha256(request.clone.databaseName) ||
    target.ownershipCommentSha256 !==
      extensionInitializerSha256(request.clone.ownershipComment) ||
    target.serverVersionNum !== EXPECTED_SERVER_VERSION_NUM ||
    target.systemIdentifier !== EXPECTED_SYSTEM_IDENTIFIER ||
    typeof attestationSha256 !== "string" ||
    !SHA256_PATTERN.test(attestationSha256) ||
    attestationSha256 !==
      extensionInitializerSha256(
        `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN}${canonicalExtensionInitializerJson(
          body,
        )}`,
      )
  ) {
    fail("EXTENSION_INITIALIZER_ATTESTATION", "attestation facts differ");
  }
  return value;
}

export async function runExtensionInitializerProtocol({
  clock = () => new Date(),
  request,
  runPsql,
  runtimeFacts,
}) {
  const validatedRequest = validateExtensionInitializerRequest(request, {
    expectedParentPid: request.parentPid,
    now: clock(),
  });
  const runtime = validateRuntimeFacts(runtimeFacts);
  const sql = buildExtensionInitializerSqlPlan(validatedRequest);
  const preflight = validateMaintenancePreflight(
    parseSingleJsonLine(
      await runPsql({
        databaseName: "postgres",
        sql: sql.maintenancePreflight,
      }),
      "EXTENSION_INITIALIZER_PREFLIGHT",
      "maintenance preflight",
    ),
    validatedRequest,
  );
  const initialized = normalizeExtensionState(
    parseSingleJsonLine(
      await runPsql({
        databaseName: validatedRequest.clone.databaseName,
        sql: sql.targetMutation,
      }),
      "EXTENSION_INITIALIZER_MUTATION",
      "extension mutation",
    ),
    validatedRequest,
    0,
    "EXTENSION_INITIALIZER_MUTATION",
  );
  validateUnlock(
    parseSingleJsonLine(
      await runPsql({ databaseName: "postgres", sql: sql.unlock }),
      "EXTENSION_INITIALIZER_VERIFY",
      "unlock",
    ),
    validatedRequest,
  );
  const verified = normalizeExtensionState(
    parseSingleJsonLine(
      await runPsql({
        databaseName: validatedRequest.clone.databaseName,
        sql: sql.verify,
      }),
      "EXTENSION_INITIALIZER_VERIFY",
      "post-initialization verification",
    ),
    validatedRequest,
    1,
  );
  if (
    initialized.extensionStateSha256 !== verified.extensionStateSha256 ||
    canonicalExtensionInitializerJson(initialized.extensions) !==
      canonicalExtensionInitializerJson(verified.extensions)
  ) {
    fail(
      "EXTENSION_INITIALIZER_VERIFY",
      "extension state changed after unlock",
    );
  }
  const completedAtUtc = clock().toISOString();
  if (!ISO_UTC_PATTERN.test(completedAtUtc)) {
    fail("EXTENSION_INITIALIZER_VERIFY", "completion time differs");
  }
  const body = {
    completedAtUtc,
    extensionStateSha256: verified.extensionStateSha256,
    extensions: verified.extensions,
    fixedMutationPlanSha256:
      LOGICAL_RESTORE_EXTENSION_INITIALIZER_FIXED_PLAN_SHA256,
    format: LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_FORMAT,
    purpose: LOGICAL_RESTORE_EXTENSION_INITIALIZER_PURPOSE,
    requestSha256: validatedRequest.requestSha256,
    runtime,
    target: {
      activeSessionsBefore: preflight.activeSessions,
      connectionLimitAfter: 1,
      connectionLimitBefore: preflight.connectionLimit,
      databaseOid: validatedRequest.clone.databaseOid,
      databaseOwner: validatedRequest.clone.databaseOwner,
      nameSha256: extensionInitializerSha256(
        validatedRequest.clone.databaseName,
      ),
      ownershipCommentSha256: extensionInitializerSha256(
        validatedRequest.clone.ownershipComment,
      ),
      serverVersionNum: EXPECTED_SERVER_VERSION_NUM,
      systemIdentifier: EXPECTED_SYSTEM_IDENTIFIER,
    },
    transactionCommitted: true,
    version: 1,
  };
  const attestation = Object.freeze({
    ...body,
    attestationSha256: extensionInitializerSha256(
      `${LOGICAL_RESTORE_EXTENSION_INITIALIZER_ATTESTATION_DOMAIN}${canonicalExtensionInitializerJson(
        body,
      )}`,
    ),
  });
  return validateExtensionInitializerAttestation(attestation, {
    expectedRequest: validatedRequest,
    expectedRuntimeFacts: runtime,
    now: new Date(completedAtUtc),
  });
}

async function runPsqlCommand({ databaseName, sql }, signalState) {
  return new Promise((resolveCommand, rejectCommand) => {
    let child;
    try {
      child = spawn(
        PSQL_PATH,
        ["-X", "-A", "-t", "-q", "--no-password", "-v", "ON_ERROR_STOP=1"],
        {
          env: extensionInitializerPsqlEnvironment(databaseName),
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
    } catch (error) {
      rejectCommand(
        safeFailure(
          error,
          "EXTENSION_INITIALIZER_RUNTIME",
          "psql could not start",
        ),
      );
      return;
    }
    signalState.child = child;
    const stdout = [];
    const stderr = [];
    let stdoutBytes = 0;
    let stderrBytes = 0;
    let overflow = false;
    const timer = setTimeout(() => {
      overflow = true;
      child.kill("SIGTERM");
    }, COMMAND_TIMEOUT_MS);
    child.stdout.on("data", (chunk) => {
      stdoutBytes += chunk.length;
      if (stdoutBytes > MAX_OUTPUT_BYTES) {
        overflow = true;
        child.kill("SIGTERM");
      } else {
        stdout.push(chunk);
      }
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes += chunk.length;
      if (stderrBytes > MAX_OUTPUT_BYTES) {
        overflow = true;
        child.kill("SIGTERM");
      } else {
        stderr.push(chunk);
      }
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      signalState.child = null;
      rejectCommand(
        safeFailure(error, "EXTENSION_INITIALIZER_RUNTIME", "psql failed"),
      );
    });
    child.once("close", (code, childSignal) => {
      clearTimeout(timer);
      signalState.child = null;
      if (
        signalState.signal ||
        overflow ||
        code !== 0 ||
        childSignal ||
        stderrBytes !== 0
      ) {
        rejectCommand(
          new ExtensionInitializerError(
            signalState.signal
              ? "EXTENSION_INITIALIZER_SIGNAL"
              : "EXTENSION_INITIALIZER_MUTATION",
            "psql failed closed",
          ),
        );
        return;
      }
      resolveCommand(Buffer.concat(stdout).toString("utf8"));
    });
    child.stdin.once("error", (error) => {
      child.kill("SIGTERM");
      rejectCommand(
        safeFailure(
          error,
          "EXTENSION_INITIALIZER_MUTATION",
          "psql input failed",
        ),
      );
    });
    child.stdin.end(`${sql}\n`, "utf8");
  });
}

export async function loadExtensionInitializerRuntimeFacts() {
  const [psqlClosure, extensionClosure] = await Promise.all([
    verifyPsqlRuntimeClosure({
      expectedClosureSha256: POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
      expectedManifestSha256:
        POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_SHA256,
      manifestPath: realpathSync(
        resolve(PROJECT_ROOT, POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_MANIFEST_PATH),
      ),
    }),
    Promise.resolve().then(() =>
      verifyPostgresqlExtensionRuntimeClosure({
        expectedClosureSha256: POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_SHA256,
        expectedManifestSha256:
          POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_SHA256,
        manifestPath: realpathSync(
          resolve(
            PROJECT_ROOT,
            POSTGRESQL_EXTENSION_RUNTIME_CLOSURE_MANIFEST_PATH,
          ),
        ),
      }),
    ),
  ]);
  const psqlSha256 = hashStableFile(PSQL_PATH, "psql binary");
  if (psqlClosure.toolFileSha256.psql !== psqlSha256) {
    fail("EXTENSION_INITIALIZER_RUNTIME", "psql runtime binding differs");
  }
  return Object.freeze({
    brokerSha256: hashStableFile(MODULE_PATH, "initializer module"),
    extensionClosureSha256: extensionClosure.closureSha256,
    extensionManifestSha256: extensionClosure.manifestSha256,
    psqlClosureSha256: psqlClosure.closureSha256,
    psqlManifestSha256: psqlClosure.manifestSha256,
    psqlSha256,
  });
}

function readRequestFromFd(env = process.env) {
  validateOuterEnvironment(env);
  let stats;
  try {
    stats = fstatSync(3, { bigint: true });
  } catch {
    fail("EXTENSION_INITIALIZER_REQUEST", "request descriptor is missing");
  }
  const currentUid = process.getuid?.();
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 0n ||
    (Number(stats.mode) & 0o777) !== 0o400 ||
    stats.size <= 0n ||
    stats.size > BigInt(MAX_REQUEST_BYTES) ||
    (currentUid !== undefined && stats.uid !== BigInt(currentUid))
  ) {
    fail("EXTENSION_INITIALIZER_REQUEST", "request descriptor differs");
  }
  const bytes = readFileSync(3);
  const after = fstatSync(3, { bigint: true });
  if (
    !sameStableIdentity(stats, after) ||
    bytes.length !== Number(stats.size)
  ) {
    fail("EXTENSION_INITIALIZER_REQUEST", "request descriptor changed");
  }
  let request;
  try {
    request = JSON.parse(bytes.toString("utf8"));
  } catch {
    fail("EXTENSION_INITIALIZER_REQUEST", "request JSON differs");
  }
  if (
    !bytes.equals(
      Buffer.from(`${canonicalExtensionInitializerJson(request)}\n`, "utf8"),
    )
  ) {
    fail("EXTENSION_INITIALIZER_REQUEST", "request is not canonical");
  }
  return validateExtensionInitializerRequest(request);
}

async function main() {
  if (process.argv.length !== 2) {
    fail("EXTENSION_INITIALIZER_REQUEST", "arguments are forbidden");
  }
  const signalState = { child: null, signal: null };
  const handleSignal = (signal) => {
    if (!signalState.signal) signalState.signal = signal;
    signalState.child?.kill("SIGTERM");
  };
  const onSigint = () => handleSignal("SIGINT");
  const onSigterm = () => handleSignal("SIGTERM");
  process.on("SIGINT", onSigint);
  process.on("SIGTERM", onSigterm);
  try {
    const request = readRequestFromFd();
    const runtimeFacts = await loadExtensionInitializerRuntimeFacts();
    const attestation = await runExtensionInitializerProtocol({
      request,
      runPsql: (input) => runPsqlCommand(input, signalState),
      runtimeFacts,
    });
    if (signalState.signal) {
      fail("EXTENSION_INITIALIZER_SIGNAL", "initializer was interrupted");
    }
    process.stdout.write(`${canonicalExtensionInitializerJson(attestation)}\n`);
  } finally {
    process.removeListener("SIGINT", onSigint);
    process.removeListener("SIGTERM", onSigterm);
  }
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    const safe = safeFailure(
      error,
      "EXTENSION_INITIALIZER_FAILURE",
      "extension initializer failed",
    );
    process.stderr.write(
      `[logical-restore-extension-initializer] ERROR ${safe.code}\n`,
    );
    process.exitCode = safe.code === "EXTENSION_INITIALIZER_SIGNAL" ? 143 : 1;
  });
}
