import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import test from "node:test";

import {
  LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_CANONICAL_JSON,
  LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_FORMAT,
  LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_VERSION,
  LogicalRestoreReceiptPairJournalError,
  finalizeLogicalRestoreReceiptPairJournal,
  prepareLogicalRestoreReceiptPairJournal,
  recoverLogicalRestoreReceiptPairJournal,
} from "../../scripts/knowledge/logical-restore-receipt-pair-journal.mjs";

type Storage = {
  finalPath: string;
  parent: string;
  parentIdentity: { dev: bigint; ino: bigint };
  stagingPath: string;
};

type Fixture = {
  companionBytes: Buffer;
  companionSha256: string;
  companionStorage: Storage;
  directory: string;
  rehearsalBytes: Buffer;
  rehearsalSha256: string;
  rehearsalStorage: Storage;
};

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function canonicalBytes(value: unknown): Buffer {
  const sort = (input: unknown): unknown => {
    if (input === null || typeof input !== "object") return input;
    if (Array.isArray(input)) return input.map(sort);
    return Object.fromEntries(
      Object.entries(input as Record<string, unknown>)
        .sort(([left], [right]) =>
          Buffer.from(left).compare(Buffer.from(right)),
        )
        .map(([key, item]) => [key, sort(item)]),
    );
  };
  return Buffer.from(`${JSON.stringify(sort(value))}\n`, "utf8");
}

function makeStorage(
  directory: string,
  finalBasename: string,
  stagingBasename: string,
): Storage {
  const parentStats = lstatSync(directory, { bigint: true });
  return {
    finalPath: join(directory, finalBasename),
    parent: directory,
    parentIdentity: { dev: parentStats.dev, ino: parentStats.ino },
    stagingPath: join(directory, stagingBasename),
  };
}

function fixture(): Fixture {
  const directory = mkdtempSync(
    join(realpathSync(tmpdir()), "receipt-pair-journal-test-"),
  );
  chmodSync(directory, 0o700);
  const companionStorage = makeStorage(
    directory,
    "companion.json",
    ".companion.launcher-stage",
  );
  const rehearsalStorage = makeStorage(
    directory,
    "rehearsal.json",
    ".rehearsal.launcher-stage",
  );
  const rehearsalBytes = canonicalBytes({
    evidenceClass: "logical-clone-rehearsal",
    status: "pass",
  });
  const rehearsalSha256 = sha256(rehearsalBytes);
  const companionBytes = canonicalBytes({
    evidenceClass: "logical-comparison-surrogate",
    logicalCloneRehearsal: { receiptFileSha256: rehearsalSha256 },
    status: "pass",
  });
  writeFileSync(companionStorage.stagingPath, companionBytes, {
    flag: "wx",
    mode: 0o400,
  });
  writeFileSync(rehearsalStorage.stagingPath, rehearsalBytes, {
    flag: "wx",
    mode: 0o400,
  });
  chmodSync(companionStorage.stagingPath, 0o400);
  chmodSync(rehearsalStorage.stagingPath, 0o400);
  return {
    companionBytes,
    companionSha256: sha256(companionBytes),
    companionStorage,
    directory,
    rehearsalBytes,
    rehearsalSha256,
    rehearsalStorage,
  };
}

function prepare(value: Fixture) {
  return prepareLogicalRestoreReceiptPairJournal({
    companionStorage: value.companionStorage,
    expectedCompanionReceiptSha256: value.companionSha256,
    expectedRehearsalReceiptSha256: value.rehearsalSha256,
    rehearsalStorage: value.rehearsalStorage,
  });
}

function recover(value: Fixture) {
  return recoverLogicalRestoreReceiptPairJournal({
    companionFinalPath: value.companionStorage.finalPath,
    expectedCompanionReceiptSha256: value.companionSha256,
    expectedRehearsalReceiptSha256: value.rehearsalSha256,
    rehearsalFinalPath: value.rehearsalStorage.finalPath,
  });
}

function finalize(value: Fixture) {
  return finalizeLogicalRestoreReceiptPairJournal({
    companionFinalPath: value.companionStorage.finalPath,
    expectedCompanionReceiptSha256: value.companionSha256,
    expectedRehearsalReceiptSha256: value.rehearsalSha256,
    rehearsalFinalPath: value.rehearsalStorage.finalPath,
  });
}

function journalPath(value: Fixture): string {
  const matches = readdirSync(value.directory).filter((name) =>
    name.endsWith(".journal-v1.json"),
  );
  assert.equal(matches.length, 1);
  return join(value.directory, matches[0]);
}

function fsyncDirectory(directory: string): void {
  const descriptor = openSync(
    directory,
    constants.O_RDONLY | (constants.O_DIRECTORY ?? 0),
  );
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function crashPromotion(storage: Storage, { retainStage = false } = {}): void {
  linkSync(storage.stagingPath, storage.finalPath);
  fsyncDirectory(storage.parent);
  if (!retainStage) {
    unlinkSync(storage.stagingPath);
    fsyncDirectory(storage.parent);
  }
}

function assertSafeError(
  operation: () => unknown,
  code: string,
  directory: string,
): void {
  assert.throws(operation, (error: unknown) => {
    assert.ok(error instanceof LogicalRestoreReceiptPairJournalError);
    assert.equal(error.code, code);
    assert.equal(error.message.includes(directory), false);
    return true;
  });
}

function cleanup(value: Fixture): void {
  rmSync(value.directory, { force: true, recursive: true });
}

test("prepares one exclusive canonical journal without serializing private paths", () => {
  const value = fixture();
  try {
    const result = prepare(value);
    const path = journalPath(value);
    const bytes = readFileSync(path);
    const parsed = JSON.parse(bytes.toString("utf8"));

    assert.equal(result.status, "prepared");
    assert.equal(result.journalSha256, sha256(bytes));
    assert.equal(JSON.stringify(result).includes(value.directory), false);
    assert.equal(bytes.toString("utf8").includes(value.directory), false);
    assert.equal(parsed.format, LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_FORMAT);
    assert.equal(parsed.version, LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_VERSION);
    assert.equal(
      parsed.canonicalJsonFormat,
      LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_CANONICAL_JSON,
    );
    assert.deepEqual(Object.keys(parsed), [
      "canonicalJsonFormat",
      "companion",
      "format",
      "rehearsal",
      "version",
    ]);
    assert.equal(parsed.companion.finalBasename, "companion.json");
    assert.equal(parsed.companion.stagingBasename, ".companion.launcher-stage");
    assert.deepEqual(
      parsed.companion.finalIdentity,
      parsed.companion.stagingIdentity,
    );
    assert.match(
      parsed.companion.stagingIdentity.device,
      /^(?:0|[1-9][0-9]*)$/,
    );
    assert.match(parsed.companion.stagingIdentity.inode, /^(?:0|[1-9][0-9]*)$/);
    assert.equal(Number(lstatSync(path).mode) & 0o777, 0o400);
    assert.equal(
      readdirSync(value.directory).some((name) =>
        name.includes(".journal-v1.json.prepare."),
      ),
      false,
    );

    assertSafeError(() => prepare(value), "JOURNAL_EXISTS", value.directory);
    assert.deepEqual(readFileSync(path), bytes);
  } finally {
    cleanup(value);
  }
});

test("reports an absent journal without creating or deleting evidence", () => {
  const value = fixture();
  try {
    const before = readdirSync(value.directory).sort();
    const result = recover(value);
    assert.deepEqual(result, { status: "absent" });
    assert.deepEqual(readdirSync(value.directory).sort(), before);
    assert.equal(JSON.stringify(result).includes(value.directory), false);
  } finally {
    cleanup(value);
  }
});

test("rejects a receipt pair outside one mode-0700 parent", () => {
  const value = fixture();
  try {
    chmodSync(value.directory, 0o750);
    assertSafeError(() => prepare(value), "JOURNAL_PARENT", value.directory);
    assert.deepEqual(
      readFileSync(value.companionStorage.stagingPath),
      value.companionBytes,
    );
    assert.deepEqual(
      readFileSync(value.rehearsalStorage.stagingPath),
      value.rehearsalBytes,
    );
  } finally {
    chmodSync(value.directory, 0o700);
    cleanup(value);
  }
});

for (const [description, orphanBytes] of [
  ["empty", Buffer.alloc(0)],
  ["truncated", Buffer.from('{"format":', "utf8")],
] as const) {
  const article = description === "empty" ? "an" : "a";
  test(`${article} ${description} unique preparation orphan neither blocks recovery nor replay`, () => {
    const value = fixture();
    try {
      prepare(value);
      const path = journalPath(value);
      unlinkSync(path);
      fsyncDirectory(value.directory);
      const orphanPath = `${path}.prepare.99999999.${description}-orphan`;
      writeFileSync(orphanPath, orphanBytes, { flag: "wx", mode: 0o400 });
      chmodSync(orphanPath, 0o400);
      fsyncDirectory(value.directory);

      const recovered = recover(value);

      assert.deepEqual(recovered, { status: "absent" });
      assert.deepEqual(readFileSync(orphanPath), orphanBytes);
      assert.deepEqual(
        readFileSync(value.companionStorage.stagingPath),
        value.companionBytes,
      );
      assert.deepEqual(
        readFileSync(value.rehearsalStorage.stagingPath),
        value.rehearsalBytes,
      );

      const replayed = prepare(value);

      assert.equal(replayed.status, "prepared");
      assert.equal(existsSync(path), true);
      assert.equal(lstatSync(path).nlink, 1);
      assert.deepEqual(readFileSync(orphanPath), orphanBytes);
      assert.deepEqual(
        readdirSync(value.directory).filter((name) =>
          name.startsWith(`${basename(path)}.prepare.`),
        ),
        [basename(orphanPath)],
      );
    } finally {
      cleanup(value);
    }
  });
}

test("a crash after the canonical journal link recovers the exact preparation link", () => {
  const value = fixture();
  try {
    prepare(value);
    const path = journalPath(value);
    const preparationPath = `${path}.prepare.99999999.crash-after-link`;
    linkSync(path, preparationPath);
    fsyncDirectory(value.directory);
    assert.equal(lstatSync(path).nlink, 2);
    assert.equal(lstatSync(preparationPath).nlink, 2);

    const result = recover(value);

    assert.equal(result.status, "replay_required");
    assert.deepEqual(readdirSync(value.directory), []);
  } finally {
    cleanup(value);
  }
});

test("a crash before either promotion removes only exact staged evidence for replay", () => {
  const value = fixture();
  try {
    prepare(value);
    const result = recover(value);

    assert.deepEqual(result, {
      companionReceiptSha256: value.companionSha256,
      journalSha256: result.journalSha256,
      rehearsalReceiptSha256: value.rehearsalSha256,
      status: "replay_required",
    });
    assert.match(result.journalSha256, /^[a-f0-9]{64}$/);
    assert.deepEqual(readdirSync(value.directory), []);
    assert.equal(JSON.stringify(result).includes(value.directory), false);
  } finally {
    cleanup(value);
  }
});

test("a rehearsal-only crash cleans its exact orphan and hard-link replay state", () => {
  const value = fixture();
  try {
    prepare(value);
    crashPromotion(value.rehearsalStorage, { retainStage: true });
    assert.equal(lstatSync(value.rehearsalStorage.finalPath).nlink, 2);

    const result = recover(value);

    assert.equal(result.status, "replay_required");
    assert.deepEqual(readdirSync(value.directory), []);
    assert.equal(existsSync(value.rehearsalStorage.finalPath), false);
    assert.equal(existsSync(value.rehearsalStorage.stagingPath), false);
    assert.equal(existsSync(value.companionStorage.stagingPath), false);
  } finally {
    cleanup(value);
  }
});

test("finalize refuses an uncommitted pair without consuming replay evidence", () => {
  const value = fixture();
  try {
    prepare(value);
    const path = journalPath(value);
    const journalBytes = readFileSync(path);

    assertSafeError(
      () => finalize(value),
      "JOURNAL_NOT_COMMITTED",
      value.directory,
    );

    assert.deepEqual(readFileSync(path), journalBytes);
    assert.deepEqual(
      readFileSync(value.companionStorage.stagingPath),
      value.companionBytes,
    );
    assert.deepEqual(
      readFileSync(value.rehearsalStorage.stagingPath),
      value.rehearsalBytes,
    );
  } finally {
    cleanup(value);
  }
});

test("normal finalize retains a manifest for repeat committed recovery", () => {
  const value = fixture();
  try {
    prepare(value);
    crashPromotion(value.rehearsalStorage);
    crashPromotion(value.companionStorage);

    const result = finalize(value);
    const repeated = recover(value);

    assert.equal(result.status, "committed");
    assert.equal(result.companionReceiptSha256, value.companionSha256);
    assert.equal(result.rehearsalReceiptSha256, value.rehearsalSha256);
    assert.deepEqual(repeated, result);
    assert.deepEqual(
      readFileSync(value.companionStorage.finalPath),
      value.companionBytes,
    );
    assert.deepEqual(
      readFileSync(value.rehearsalStorage.finalPath),
      value.rehearsalBytes,
    );
    assert.deepEqual(
      readdirSync(value.directory)
        .filter((name) => !name.endsWith(".journal-v1.json"))
        .sort(),
      ["companion.json", "rehearsal.json"],
    );
    assert.equal(
      readdirSync(value.directory).filter((name) =>
        name.endsWith(".journal-v1.json"),
      ).length,
      1,
    );
    assert.equal(JSON.stringify(result).includes(value.directory), false);
  } finally {
    cleanup(value);
  }
});

test("a replacement at a journal-bound final is never deleted", () => {
  const value = fixture();
  const replacement = Buffer.from("replacement evidence\n", "utf8");
  try {
    prepare(value);
    const path = journalPath(value);
    const journalBytes = readFileSync(path);
    crashPromotion(value.rehearsalStorage);
    unlinkSync(value.rehearsalStorage.finalPath);
    writeFileSync(value.rehearsalStorage.finalPath, replacement, {
      flag: "wx",
      mode: 0o400,
    });
    chmodSync(value.rehearsalStorage.finalPath, 0o400);

    assertSafeError(
      () => recover(value),
      "JOURNAL_PATH_MISMATCH",
      value.directory,
    );

    assert.deepEqual(
      readFileSync(value.rehearsalStorage.finalPath),
      replacement,
    );
    assert.deepEqual(
      readFileSync(value.companionStorage.stagingPath),
      value.companionBytes,
    );
    assert.deepEqual(readFileSync(path), journalBytes);
  } finally {
    cleanup(value);
  }
});

test("a partial or corrupt canonical journal fails closed without cleanup", () => {
  const value = fixture();
  const partial = Buffer.from('{"format":', "utf8");
  try {
    prepare(value);
    const path = journalPath(value);
    unlinkSync(path);
    writeFileSync(path, partial, { flag: "wx", mode: 0o400 });
    chmodSync(path, 0o400);

    assertSafeError(() => recover(value), "JOURNAL_INVALID", value.directory);

    assert.deepEqual(readFileSync(path), partial);
    assert.deepEqual(
      readFileSync(value.companionStorage.stagingPath),
      value.companionBytes,
    );
    assert.deepEqual(
      readFileSync(value.rehearsalStorage.stagingPath),
      value.rehearsalBytes,
    );
    assert.equal(existsSync(value.companionStorage.finalPath), false);
    assert.equal(existsSync(value.rehearsalStorage.finalPath), false);
  } finally {
    cleanup(value);
  }
});
