#!/usr/bin/env node
import { closeSync, constants, fstatSync, openSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  process.stderr.write(`[candidate-security-manifest] ERROR: ${message}\n`);
  process.exit(1);
}

if (process.argv.length !== 3) fail("exactly one manifest path is required");

const manifestPath = resolve(process.argv[2]);
let descriptor;
try {
  descriptor = openSync(
    manifestPath,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  const stat = fstatSync(descriptor);
  if (!stat.isFile()) fail("manifest must be a regular file");
  const text = readFileSync(descriptor, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail("manifest must be valid JSON");
  }
  if (parsed === null || Array.isArray(parsed) || typeof parsed !== "object") {
    fail("manifest must be one JSON object");
  }
  const expectedKeys = [
    "checkerSha256",
    "graphSha256",
    "manifestVersion",
    "ownerPolicy",
    "postgresMajor",
  ];
  if (JSON.stringify(Object.keys(parsed).sort()) !== JSON.stringify(expectedKeys)) {
    fail("manifest fields do not match the exact v1 schema");
  }
  if (parsed.manifestVersion !== "candidate-security-graph-v1") {
    fail("manifestVersion must be candidate-security-graph-v1");
  }
  if (parsed.postgresMajor !== 16) fail("postgresMajor must be 16");
  if (parsed.ownerPolicy !== "database_owner") {
    fail("ownerPolicy must be database_owner");
  }
  for (const field of ["checkerSha256", "graphSha256"]) {
    if (typeof parsed[field] !== "string" || !/^[a-f0-9]{64}$/.test(parsed[field])) {
      fail(`${field} must be 64 lowercase hexadecimal characters`);
    }
  }
  const canonical = `${JSON.stringify(
    {
      manifestVersion: parsed.manifestVersion,
      postgresMajor: parsed.postgresMajor,
      ownerPolicy: parsed.ownerPolicy,
      checkerSha256: parsed.checkerSha256,
      graphSha256: parsed.graphSha256,
    },
    null,
    2,
  )}\n`;
  if (text !== canonical) fail("manifest bytes are not in canonical v1 form");
  process.stdout.write(
    [
      parsed.manifestVersion,
      String(parsed.postgresMajor),
      parsed.ownerPolicy,
      parsed.checkerSha256,
      parsed.graphSha256,
    ].join(" "),
  );
} catch (error) {
  if (error && typeof error === "object" && "code" in error) {
    fail(`cannot safely read manifest (${String(error.code)})`);
  }
  throw error;
} finally {
  if (descriptor !== undefined) closeSync(descriptor);
}
