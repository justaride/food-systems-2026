import assert from "node:assert/strict";
import {
  chmodSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  canonicalRuntimeJson,
  discardLogicalRestoreCompanionStaging,
  logicalRestoreCompanionStagingStorage,
  promoteLogicalRestoreCompanionReceiptPair,
  runtimeSha256,
} from "../../scripts/knowledge/launch-locked-source-registration-apply.mjs";
import {
  finalizeLogicalRestoreReceiptPairJournal,
  prepareLogicalRestoreReceiptPairJournal,
  recoverLogicalRestoreReceiptPairJournal,
} from "../../scripts/knowledge/logical-restore-receipt-pair-journal.mjs";

const journalRuntime = {
  finalizeLogicalRestoreReceiptPairJournal,
  prepareLogicalRestoreReceiptPairJournal,
  recoverLogicalRestoreReceiptPairJournal,
};

type StagingStorage = ReturnType<typeof logicalRestoreCompanionStagingStorage>;

type PublicationFixture = {
  companionBytes: Buffer;
  companionStorage: StagingStorage;
  directory: string;
  rehearsalBytes: Buffer;
  rehearsalStorage: StagingStorage;
};

function canonicalBytes(value: unknown): Buffer {
  return Buffer.from(`${canonicalRuntimeJson(value)}\n`, "utf8");
}

function writePrivateStaging(storage: StagingStorage, bytes: Buffer): void {
  writeFileSync(storage.stagingPath, bytes, { flag: "wx", mode: 0o400 });
  chmodSync(storage.stagingPath, 0o400);
}

function publicationFixture({
  boundRehearsalSha256,
}: {
  boundRehearsalSha256?: string;
} = {}): PublicationFixture {
  const directory = mkdtempSync(
    join(realpathSync(tmpdir()), "source-registration-receipt-publication-"),
  );
  chmodSync(directory, 0o700);
  const companionStorage = logicalRestoreCompanionStagingStorage(
    join(directory, "companion.json"),
  );
  const rehearsalStorage = logicalRestoreCompanionStagingStorage(
    join(directory, "rehearsal.json"),
  );
  const rehearsalBytes = canonicalBytes({
    evidenceClass: "logical-clone-rehearsal",
    status: "pass",
  });
  const rehearsalSha256 = runtimeSha256(rehearsalBytes);
  const companionBytes = canonicalBytes({
    evidenceClass: "logical-comparison-surrogate",
    logicalCloneRehearsal: {
      receiptFileSha256: boundRehearsalSha256 ?? rehearsalSha256,
    },
    status: "pass",
  });
  writePrivateStaging(rehearsalStorage, rehearsalBytes);
  writePrivateStaging(companionStorage, companionBytes);
  return {
    companionBytes,
    companionStorage,
    directory,
    rehearsalBytes,
    rehearsalStorage,
  };
}

function cleanupFixture(fixture: PublicationFixture): void {
  for (const storage of [fixture.companionStorage, fixture.rehearsalStorage]) {
    if (existsSync(storage.stagingPath)) {
      assert.equal(discardLogicalRestoreCompanionStaging(storage), true);
    }
  }
  rmSync(fixture.directory, { force: true, recursive: true });
}

function assertNoFinalReceipts(fixture: PublicationFixture): void {
  assert.equal(existsSync(fixture.companionStorage.finalPath), false);
  assert.equal(existsSync(fixture.rehearsalStorage.finalPath), false);
}

test("publishes both receipts only after validating their bound pair", async () => {
  const fixture = publicationFixture();
  try {
    assertNoFinalReceipts(fixture);

    const result = await promoteLogicalRestoreCompanionReceiptPair({
      companionStorage: fixture.companionStorage,
      expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
      journalRuntime,
      rehearsalStorage: fixture.rehearsalStorage,
      signalGuard: { signal: undefined },
    });

    assert.deepEqual(result, {
      companionReceiptSha256: runtimeSha256(fixture.companionBytes),
      rehearsalReceiptSha256: runtimeSha256(fixture.rehearsalBytes),
    });
    assert.deepEqual(
      readFileSync(fixture.companionStorage.finalPath),
      fixture.companionBytes,
    );
    assert.deepEqual(
      readFileSync(fixture.rehearsalStorage.finalPath),
      fixture.rehearsalBytes,
    );
    assert.equal(existsSync(fixture.companionStorage.stagingPath), false);
    assert.equal(existsSync(fixture.rehearsalStorage.stagingPath), false);
    const recovered = recoverLogicalRestoreReceiptPairJournal({
      companionFinalPath: fixture.companionStorage.finalPath,
      expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
      expectedRehearsalReceiptSha256: runtimeSha256(fixture.rehearsalBytes),
      rehearsalFinalPath: fixture.rehearsalStorage.finalPath,
    });
    assert.equal(recovered.status, "committed");
    assert.equal(
      recovered.companionReceiptSha256,
      runtimeSha256(fixture.companionBytes),
    );
    assert.equal(
      recovered.rehearsalReceiptSha256,
      runtimeSha256(fixture.rehearsalBytes),
    );
    assert.match(recovered.journalSha256, /^[a-f0-9]{64}$/);
  } finally {
    cleanupFixture(fixture);
  }
});

test("a wrong bound rehearsal hash publishes neither receipt", async () => {
  const fixture = publicationFixture({
    boundRehearsalSha256: "0".repeat(64),
  });
  try {
    await assert.rejects(
      async () =>
        promoteLogicalRestoreCompanionReceiptPair({
          companionStorage: fixture.companionStorage,
          expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
          journalRuntime,
          rehearsalStorage: fixture.rehearsalStorage,
          signalGuard: { signal: undefined },
        }),
      /journal-bound receipt path differs/,
    );
    assertNoFinalReceipts(fixture);
  } finally {
    cleanupFixture(fixture);
  }
});

test("a signal recorded before publication leaves both finals absent", async () => {
  const fixture = publicationFixture();
  try {
    await assert.rejects(
      async () =>
        promoteLogicalRestoreCompanionReceiptPair({
          companionStorage: fixture.companionStorage,
          expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
          journalRuntime,
          rehearsalStorage: fixture.rehearsalStorage,
          signalGuard: { signal: "SIGTERM" },
        }),
      /companion publication was interrupted/,
    );
    assertNoFinalReceipts(fixture);
  } finally {
    cleanupFixture(fixture);
  }
});

test("a signal observed between promotions rolls the rehearsal final back", async () => {
  const fixture = publicationFixture();
  let signalReads = 0;
  try {
    await assert.rejects(
      async () =>
        promoteLogicalRestoreCompanionReceiptPair({
          companionStorage: fixture.companionStorage,
          expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
          journalRuntime,
          rehearsalStorage: fixture.rehearsalStorage,
          signalGuard: {
            get signal() {
              signalReads += 1;
              return signalReads >= 2 ? "SIGTERM" : undefined;
            },
          },
        }),
      /companion publication was interrupted/,
    );
    assertNoFinalReceipts(fixture);
  } finally {
    cleanupFixture(fixture);
  }
});

test("a companion-final conflict rolls back the promoted rehearsal", async () => {
  const fixture = publicationFixture();
  const conflictingBytes = Buffer.from("pre-existing companion receipt\n");
  try {
    writeFileSync(fixture.companionStorage.finalPath, conflictingBytes, {
      flag: "wx",
      mode: 0o400,
    });

    await assert.rejects(
      async () =>
        promoteLogicalRestoreCompanionReceiptPair({
          companionStorage: fixture.companionStorage,
          expectedCompanionReceiptSha256: runtimeSha256(fixture.companionBytes),
          journalRuntime,
          rehearsalStorage: fixture.rehearsalStorage,
          signalGuard: { signal: undefined },
        }),
      /receipt-pair final output already exists/,
    );
    assert.equal(existsSync(fixture.rehearsalStorage.finalPath), false);
    assert.deepEqual(
      readFileSync(fixture.companionStorage.finalPath),
      conflictingBytes,
    );
  } finally {
    cleanupFixture(fixture);
  }
});
