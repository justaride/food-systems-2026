#!/usr/bin/env node

import { writeFileSync } from "node:fs";

const context = process.env.CANDIDATE_URL_CONTEXT ?? "candidate-database";
const die = (message) => {
  process.stderr.write(`[${context}] ERROR: ${message}\n`);
  process.exit(1);
};

const allowedSearchParameters = new Set([
  "application_name",
  "sslmode",
  "sslrootcert",
]);
const allowedSslModes = new Set([
  "disable",
  "require",
  "verify-ca",
  "verify-full",
]);

let url;
try {
  url = new URL(process.env.RAW_DATABASE_URL ?? "");
} catch {
  die("invalid PostgreSQL URL");
}

try {
  if (!/^postgres(ql)?:$/.test(url.protocol)) {
    die("database URL must use PostgreSQL");
  }
  if (url.hash !== "") die("database URL fragments are not permitted");
  for (const key of url.searchParams.keys()) {
    if (!allowedSearchParameters.has(key)) {
      die(`unsupported database URL parameter: ${key}`);
    }
  }
  const decode = (value) => decodeURIComponent(value);
  const username = decode(url.username);
  const password = decode(url.password);
  const database = decode(url.pathname.replace(/^\//, ""));
  const hostname = url.hostname;
  if (username === "" || hostname === "" || database === "") {
    die("database URL must explicitly name user, host, and database");
  }
  if (database.includes("/")) die("database name must be one path segment");
  if (
    process.env.EXPECTED_URL_ROLE !== undefined &&
    username !== process.env.EXPECTED_URL_ROLE
  ) {
    die("dedicated database URL username does not match expected role");
  }
  const applicationName = url.searchParams.get("application_name");
  if (
    process.env.EXPECTED_URL_APP !== undefined &&
    applicationName !== process.env.EXPECTED_URL_APP
  ) {
    die("dedicated database URL application_name does not match expected value");
  }
  if (
    applicationName !== null &&
    !/^[a-zA-Z0-9_-]+$/.test(applicationName)
  ) {
    die("database URL application_name contains unsupported characters");
  }
  const sslmode = url.searchParams.get("sslmode");
  if (sslmode !== null && !allowedSslModes.has(sslmode)) {
    die("database URL sslmode is not permitted");
  }
  const sslrootcert = url.searchParams.get("sslrootcert");
  if (
    sslrootcert !== null &&
    (sslmode !== "verify-ca" && sslmode !== "verify-full")
  ) {
    die("sslrootcert requires verify-ca or verify-full");
  }

  const escapePgpass = (value) =>
    value.replace(/\\/g, "\\\\").replace(/:/g, "\\:");
  writeFileSync(
    process.env.PGPASSFILE_PATH,
    `${[
      hostname,
      url.port || "5432",
      database,
      username,
      password,
    ]
      .map(escapePgpass)
      .join(":")}\n`,
    { mode: 0o600 },
  );

  // The subprocess target is rebuilt from explicit authority fields. Passwords
  // exist only in the mode-0600 passfile and never in argv or emitted SQL.
  url.password = "";
  const hostForUrl = hostname.includes(":") && !hostname.startsWith("[")
    ? `[${hostname}]`
    : hostname;
  const canonical = new URL(
    `postgresql://${encodeURIComponent(username)}@${hostForUrl}:${url.port || "5432"}/${encodeURIComponent(database)}`,
  );
  for (const key of [...allowedSearchParameters].sort()) {
    const value = url.searchParams.get(key);
    if (value !== null) canonical.searchParams.set(key, value);
  }
  process.stdout.write(canonical.toString());
} catch (error) {
  if (error instanceof Error && error.message.startsWith("[")) throw error;
  die("invalid PostgreSQL URL");
}
