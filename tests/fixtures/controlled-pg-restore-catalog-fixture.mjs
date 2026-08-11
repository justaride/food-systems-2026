#!/usr/bin/env node

import {
  appendFileSync,
  fchmodSync,
  readFileSync,
  readSync,
  writeSync,
} from "node:fs";

const mode = process.env.CONTROLLED_CATALOG_FIXTURE_MODE;
const catalogOperation =
  process.argv.length === 3 && process.argv[2] === "--list";
const restoreOperation =
  process.argv.length === 9 &&
  process.argv.slice(2, 8).join("\0") ===
    [
      "--exit-on-error",
      "--no-owner",
      "--no-acl",
      "--no-comments",
      "--single-transaction",
      "--use-list=/dev/fd/3",
    ].join("\0") &&
  /^--dbname=foodsystems_restore_[a-z0-9_]+$/.test(process.argv[8]);

if (!catalogOperation && !restoreOperation) process.exit(2);

if (restoreOperation) {
  const restoreList = readFileSync(3, "utf8");
  if (mode === "restore-early-close") {
    const firstByte = Buffer.alloc(1);
    readSync(0, firstByte, 0, firstByte.length, null);
    process.exit(0);
  }
  const archive = readFileSync(0);
  if (mode === "restore-drift-list") fchmodSync(3, 0o600);
  if (!["restore-valid", "restore-drift-list"].includes(mode ?? "")) {
    process.exit(2);
  }
  writeSync(
    1,
    `${JSON.stringify({
      archiveBytes: archive.length,
      restoreListSha256Input: restoreList,
    })}\n`,
  );
  process.exit(0);
}

const catalog = [
  "1; 0 0 TABLE public ControlledMutationAudit owner",
  "2; 0 0 TABLE public DatabaseIdentity owner",
  "3; 0 0 TABLE public Document owner",
  "4; 0 0 TABLE public EvidenceAppraisal owner",
  "5; 0 0 TABLE public SourceCitation owner",
  "6; 0 0 TABLE public _prisma_migrations owner",
  "",
].join("\n");
const firstByte = Buffer.alloc(1);
readSync(0, firstByte, 0, firstByte.length, null);

switch (mode) {
  case "valid":
    writeSync(1, catalog);
    process.exit(0);
    break;
  case "invalid-catalog":
    writeSync(1, "1; 0 0 TABLE public Document owner\n");
    process.exit(0);
    break;
  case "stderr":
    writeSync(1, catalog);
    writeSync(2, " \n");
    process.exit(0);
    break;
  case "nonzero":
    writeSync(1, catalog);
    process.exit(7);
    break;
  case "signal":
    process.kill(process.pid, "SIGTERM");
    break;
  case "overflow":
    writeSync(1, Buffer.alloc(17 * 1024 * 1024, 0x78));
    process.exit(0);
    break;
  case "drift":
    appendFileSync(process.env.CONTROLLED_CATALOG_FIXTURE_INPUT_PATH, "x");
    writeSync(1, catalog);
    process.exit(0);
    break;
  default:
    writeSync(2, "fixture mode missing\n");
    process.exit(2);
}
