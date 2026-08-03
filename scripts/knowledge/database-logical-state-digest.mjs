#!/usr/bin/env node

import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  accessSync,
  constants,
  createReadStream,
  lstatSync,
  realpathSync,
} from "node:fs";
import { delimiter, isAbsolute, join } from "node:path";
import { pathToFileURL } from "node:url";

export const DATABASE_LOGICAL_STATE_DIGEST_VERSION =
  "database-logical-state-digest-v1";
export const DATABASE_LOGICAL_STATE_DIGEST_DOMAIN =
  "food-systems-2026:database-logical-state-digest:v1\0";

const SAFE_IDENTIFIER = /^[a-zA-Z0-9_.:@/-]+$/;

function fail(message) {
  throw new Error(`Database logical-state digest failed: ${message}`);
}

export function canonicalLogicalStateJson(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalLogicalStateJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalLogicalStateJson(value[key])}`,
    )
    .join(",")}}`;
}

export function logicalStateSha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function sha256File(path) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

export function resolveExecutable(name, pathValue = process.env.PATH ?? "") {
  if (!name || name.includes("/") || name.includes("\\")) {
    fail("executable name must be a bare file name");
  }
  for (const directory of pathValue.split(delimiter)) {
    if (!directory || !isAbsolute(directory)) continue;
    const candidate = join(directory, name);
    try {
      accessSync(candidate, constants.X_OK);
      const resolved = realpathSync(candidate);
      const stats = lstatSync(resolved);
      if (stats.isFile() && !stats.isSymbolicLink()) return resolved;
    } catch {
      // Continue to the next PATH entry.
    }
  }
  fail(`could not resolve executable ${name} from absolute PATH entries`);
}

function psqlConnectionEnvironment(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    fail("DATABASE_URL is not a valid URL");
  }
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    fail("DATABASE_URL must use postgresql:// or postgres://");
  }
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (
    !url.hostname ||
    !databaseName ||
    !url.username ||
    !SAFE_IDENTIFIER.test(databaseName)
  ) {
    fail("DATABASE_URL is missing a controlled host, user, or database name");
  }
  const environment = {
    LANG: "C",
    LC_ALL: "C",
    TZ: "UTC",
    PGHOST: url.hostname,
    PGPORT: url.port || "5432",
    PGDATABASE: databaseName,
    PGUSER: decodeURIComponent(url.username),
    PGPASSWORD: decodeURIComponent(url.password),
    PGAPPNAME: "foodsystems-logical-state-digest-v1",
    PGCLIENTENCODING: "UTF8",
    PGCONNECT_TIMEOUT: "5",
    PGOPTIONS:
      "-c timezone=UTC -c DateStyle=ISO,YMD -c bytea_output=hex -c extra_float_digits=3",
    PGSSLMODE: url.searchParams.get("sslmode") || "prefer",
  };
  return environment;
}

function runPsql({ psqlPath, environment, sql, stream = false }) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      psqlPath,
      ["-X", "-A", "-t", "-q", "-v", "ON_ERROR_STOP=1", "-c", sql],
      {
        env: environment,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    const stdout = [];
    let stderrBytes = 0;
    const hash = stream ? createHash("sha256") : null;
    let byteCount = 0;
    let rowCount = 0;
    child.stdout.on("data", (chunk) => {
      byteCount += chunk.length;
      if (hash) {
        hash.update(chunk);
        for (const byte of chunk) if (byte === 10) rowCount += 1;
      } else {
        stdout.push(chunk);
      }
    });
    child.stderr.on("data", (chunk) => {
      stderrBytes += chunk.length;
    });
    child.on("error", () => {
      reject(new Error("psql process could not be started"));
    });
    child.on("close", (code, signal) => {
      if (code !== 0 || signal) {
        reject(
          new Error(
            `psql failed (code=${String(code)}, signal=${String(signal)})`,
          ),
        );
        return;
      }
      if (stderrBytes > 0) {
        reject(new Error("psql emitted unexpected stderr output"));
        return;
      }
      resolve(
        stream
          ? { byteCount, rowCount, sha256: hash.digest("hex") }
          : Buffer.concat(stdout).toString("utf8").trim(),
      );
    });
  });
}

function exactObject(value, keys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be an object`);
  }
  if (
    canonicalLogicalStateJson(Object.keys(value).sort()) !==
    canonicalLogicalStateJson([...keys].sort())
  ) {
    fail(`${label} has an unexpected shape`);
  }
  return value;
}

function parseJson(value, label) {
  try {
    return JSON.parse(value);
  } catch {
    fail(`${label} was not valid JSON`);
  }
}

/**
 * @param {{ databaseUrl?: string, psqlPath?: string }} [options]
 */
export async function computeDatabaseLogicalStateDigest({
  databaseUrl,
  psqlPath = resolveExecutable("psql"),
} = {}) {
  if (typeof databaseUrl !== "string" || !databaseUrl) {
    fail("an explicit databaseUrl is required");
  }
  const resolvedPsql = realpathSync(psqlPath);
  const psqlStats = lstatSync(resolvedPsql);
  if (!psqlStats.isFile() || psqlStats.isSymbolicLink()) {
    fail("psql must resolve to a regular executable file");
  }
  const environment = psqlConnectionEnvironment(databaseUrl);
  const targetRaw = await runPsql({
    psqlPath: resolvedPsql,
    environment,
    sql: `SELECT json_build_object(
      'databaseName', current_database(),
      'databaseRole', current_user,
      'serverAddress', inet_server_addr()::text,
      'serverPort', inet_server_port(),
      'serverVersionNum', current_setting('server_version_num'),
      'systemIdentifier', (SELECT system_identifier::text FROM pg_control_system()),
      'largeObjectCount', (SELECT count(*) FROM pg_largeobject_metadata)
    )::text`,
  });
  const target = exactObject(
    parseJson(targetRaw, "database target"),
    [
      "databaseName",
      "databaseRole",
      "largeObjectCount",
      "serverAddress",
      "serverPort",
      "serverVersionNum",
      "systemIdentifier",
    ],
    "database target",
  );
  if (
    typeof target.databaseName !== "string" ||
    typeof target.databaseRole !== "string" ||
    typeof target.serverAddress !== "string" ||
    !Number.isSafeInteger(target.serverPort) ||
    typeof target.serverVersionNum !== "string" ||
    !/^\d+$/.test(target.serverVersionNum) ||
    typeof target.systemIdentifier !== "string" ||
    !/^\d+$/.test(target.systemIdentifier) ||
    target.largeObjectCount !== 0
  ) {
    fail("database target facts are invalid or large objects are present");
  }

  const relationsRaw = await runPsql({
    psqlPath: resolvedPsql,
    environment,
    sql: `SELECT COALESCE(json_agg(relation ORDER BY "schemaName" COLLATE "C", "relationName" COLLATE "C"), '[]'::json)::text
      FROM (
        SELECT
          n.nspname AS "schemaName",
          c.relname AS "relationName",
          c.relkind::text AS "relationKind",
          format('%I.%I', n.nspname, c.relname) AS "qualifiedName"
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'm')
      ) AS relation`,
  });
  const relations = parseJson(relationsRaw, "relation inventory");
  if (!Array.isArray(relations) || relations.length === 0) {
    fail("public relation inventory is empty");
  }
  const entries = [];
  const seen = new Set();
  for (const [index, rawRelation] of relations.entries()) {
    const relation = exactObject(
      rawRelation,
      ["qualifiedName", "relationKind", "relationName", "schemaName"],
      `relation ${index + 1}`,
    );
    if (
      relation.schemaName !== "public" ||
      typeof relation.relationName !== "string" ||
      !["r", "p", "m"].includes(relation.relationKind) ||
      typeof relation.qualifiedName !== "string" ||
      !relation.qualifiedName.startsWith("public.") ||
      relation.qualifiedName.includes(";") ||
      relation.qualifiedName.includes("\n") ||
      seen.has(relation.qualifiedName)
    ) {
      fail(`relation ${index + 1} is unsafe or duplicated`);
    }
    seen.add(relation.qualifiedName);
    const only = relation.relationKind === "p" ? "ONLY " : "";
    const streamed = await runPsql({
      psqlPath: resolvedPsql,
      environment,
      stream: true,
      sql: `COPY (
        SELECT to_jsonb(t)::text
        FROM ${only}${relation.qualifiedName} AS t
        ORDER BY convert_to(to_jsonb(t)::text, 'UTF8')
      ) TO STDOUT`,
    });
    entries.push({
      schemaName: relation.schemaName,
      relationName: relation.relationName,
      relationKind: relation.relationKind,
      rowCount: streamed.rowCount,
      canonicalBytes: streamed.byteCount,
      rowsSha256: streamed.sha256,
    });
  }

  const sequences = await runPsql({
    psqlPath: resolvedPsql,
    environment,
    stream: true,
    sql: `COPY (
      SELECT jsonb_build_object(
        'schemaname', schemaname,
        'sequencename', sequencename,
        'start_value', start_value,
        'min_value', min_value,
        'max_value', max_value,
        'increment_by', increment_by,
        'cycle', cycle,
        'cache_size', cache_size,
        'last_value', last_value
      )::text
      FROM pg_sequences
      WHERE schemaname = 'public'
      ORDER BY sequencename COLLATE "C"
    ) TO STDOUT`,
  });

  const contentState = {
    serialization: {
      row: "to_jsonb_text",
      rowOrder: "utf8_byte_order",
      session:
        "timezone=UTC;DateStyle=ISO,YMD;bytea_output=hex;extra_float_digits=3",
      relationScope:
        "all_public_relkind_r_p_m_with_partitioned_parents_scanned_only",
      largeObjectsRequiredCount: 0,
    },
    relationCount: entries.length,
    relations: entries,
    sequences: {
      rowCount: sequences.rowCount,
      canonicalBytes: sequences.byteCount,
      rowsSha256: sequences.sha256,
    },
  };
  const contentStateSha256 = logicalStateSha256(
    `${DATABASE_LOGICAL_STATE_DIGEST_DOMAIN}content\0${canonicalLogicalStateJson(contentState)}`,
  );
  const body = {
    version: DATABASE_LOGICAL_STATE_DIGEST_VERSION,
    ...contentState,
    contentStateSha256,
    databaseTarget: target,
    tool: {
      psqlFileSha256: await sha256File(resolvedPsql),
    },
  };
  return {
    ...body,
    logicalStateSha256: logicalStateSha256(
      `${DATABASE_LOGICAL_STATE_DIGEST_DOMAIN}${canonicalLogicalStateJson(body)}`,
    ),
  };
}

async function main() {
  const unknown = process.argv.slice(2);
  if (unknown.length > 0) {
    fail("unknown or malformed argument was supplied");
  }
  const manifest = await computeDatabaseLogicalStateDigest({
    databaseUrl: process.env.DATABASE_URL,
  });
  process.stdout.write(`${JSON.stringify(manifest)}\n`);
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
