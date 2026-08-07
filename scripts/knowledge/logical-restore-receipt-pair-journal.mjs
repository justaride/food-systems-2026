import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join } from "node:path";

export const LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_FORMAT =
  "foodsystems-logical-restore-receipt-pair-journal";
export const LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_VERSION = 1;
export const LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_CANONICAL_JSON =
  "sorted-keys-v1";

const JOURNAL_NAME_DOMAIN =
  "food-systems-2026:logical-restore-receipt-pair-journal-name:v1\0";
const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const DECIMAL_PATTERN = /^(?:0|[1-9][0-9]*)$/;
const MAX_JOURNAL_BYTES = 64 * 1024;
const MAX_RECEIPT_BYTES = 16 * 1024 * 1024;

export class LogicalRestoreReceiptPairJournalError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "LogicalRestoreReceiptPairJournalError";
    this.code = code;
  }
}

function fail(code, message) {
  throw new LogicalRestoreReceiptPairJournalError(code, message);
}

function safeBoundary(operation) {
  try {
    return operation();
  } catch (error) {
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    fail("JOURNAL_IO", "receipt-pair journal operation failed");
  }
}

function byteSort(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

export function canonicalLogicalRestoreReceiptPairJournalJson(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value
      .map((item) => canonicalLogicalRestoreReceiptPairJournalJson(item))
      .join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort(byteSort)
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalLogicalRestoreReceiptPairJournalJson(
          value[key],
        )}`,
    )
    .join(",")}}`;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function sameIdentity(left, right) {
  return left.dev === right.dev && left.ino === right.ino;
}

function serializedIdentity(stats) {
  return { device: String(stats.dev), inode: String(stats.ino) };
}

function matchesSerializedIdentity(binding, stats) {
  return (
    binding.device === String(stats.dev) && binding.inode === String(stats.ino)
  );
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactKeys(value, keys) {
  if (
    !isPlainObject(value) ||
    canonicalLogicalRestoreReceiptPairJournalJson(Object.keys(value).sort()) !==
      canonicalLogicalRestoreReceiptPairJournalJson([...keys].sort())
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  return value;
}

function safeBasename(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value !== "." &&
    value !== ".." &&
    value === basename(value) &&
    !/[\\/\0\r\n]/.test(value)
  );
}

function assertSha256(value, code = "JOURNAL_INPUT") {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(code, "receipt-pair hash is invalid");
  }
  return value;
}

function assertIdentity(value) {
  exactKeys(value, ["device", "inode"]);
  if (
    typeof value.device !== "string" ||
    typeof value.inode !== "string" ||
    !DECIMAL_PATTERN.test(value.device) ||
    !DECIMAL_PATTERN.test(value.inode)
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  return value;
}

function assertReceiptBinding(value) {
  exactKeys(value, [
    "finalBasename",
    "finalIdentity",
    "receiptSha256",
    "stagingBasename",
    "stagingIdentity",
  ]);
  if (
    !safeBasename(value.finalBasename) ||
    !safeBasename(value.stagingBasename)
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  assertSha256(value.receiptSha256, "JOURNAL_INVALID");
  assertIdentity(value.finalIdentity);
  assertIdentity(value.stagingIdentity);
  if (
    value.finalIdentity.device !== value.stagingIdentity.device ||
    value.finalIdentity.inode !== value.stagingIdentity.inode
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  return value;
}

function parseJournal(bytes, companionFinalBasename, rehearsalFinalBasename) {
  const text = bytes.toString("utf8");
  if (!Buffer.from(text, "utf8").equals(bytes) || !text.endsWith("\n")) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  exactKeys(parsed, [
    "canonicalJsonFormat",
    "companion",
    "format",
    "rehearsal",
    "version",
  ]);
  if (
    parsed.canonicalJsonFormat !==
      LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_CANONICAL_JSON ||
    parsed.format !== LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_FORMAT ||
    parsed.version !== LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_VERSION
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  const companion = assertReceiptBinding(parsed.companion);
  const rehearsal = assertReceiptBinding(parsed.rehearsal);
  if (
    companion.finalBasename !== companionFinalBasename ||
    rehearsal.finalBasename !== rehearsalFinalBasename ||
    companion.finalBasename === rehearsal.finalBasename ||
    companion.stagingBasename === rehearsal.stagingBasename ||
    companion.stagingBasename === companion.finalBasename ||
    companion.stagingBasename === rehearsal.finalBasename ||
    rehearsal.stagingBasename === companion.finalBasename ||
    rehearsal.stagingBasename === rehearsal.finalBasename ||
    `${canonicalLogicalRestoreReceiptPairJournalJson(parsed)}\n` !== text
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  }
  return parsed;
}

function lstatOrNull(path) {
  try {
    return lstatSync(path, { bigint: true });
  } catch (error) {
    if (error && error.code === "ENOENT") return null;
    fail("JOURNAL_IO", "receipt-pair journal operation failed");
  }
}

function validateFinalPath(value) {
  if (
    typeof value !== "string" ||
    !isAbsolute(value) ||
    /[\0\r\n]/.test(value) ||
    !safeBasename(basename(value))
  ) {
    fail("JOURNAL_INPUT", "receipt-pair output is invalid");
  }
  return value;
}

function openPrivatePairParent(companionFinalPath, rehearsalFinalPath) {
  validateFinalPath(companionFinalPath);
  validateFinalPath(rehearsalFinalPath);
  const companionFinalBasename = basename(companionFinalPath);
  const rehearsalFinalBasename = basename(rehearsalFinalPath);
  const lexicalParent = dirname(companionFinalPath);
  if (
    companionFinalPath === rehearsalFinalPath ||
    dirname(rehearsalFinalPath) !== lexicalParent
  ) {
    fail(
      "JOURNAL_PARENT",
      "receipt-pair outputs must share one private parent",
    );
  }
  let parent;
  let pathStats;
  let descriptor;
  try {
    parent = realpathSync(lexicalParent);
    pathStats = lstatSync(parent, { bigint: true });
    descriptor = openSync(
      parent,
      constants.O_RDONLY |
        (constants.O_DIRECTORY ?? 0) |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
    );
    const descriptorStats = fstatSync(descriptor, { bigint: true });
    if (
      parent !== lexicalParent ||
      !pathStats.isDirectory() ||
      pathStats.isSymbolicLink() ||
      !descriptorStats.isDirectory() ||
      descriptorStats.isSymbolicLink() ||
      !sameIdentity(pathStats, descriptorStats) ||
      (Number(pathStats.mode) & 0o777) !== 0o700 ||
      (Number(descriptorStats.mode) & 0o777) !== 0o700
    ) {
      fail("JOURNAL_PARENT", "receipt-pair parent is not private");
    }
    return {
      companionFinalBasename,
      companionFinalPath,
      descriptor,
      parent,
      parentIdentity: serializedIdentity(pathStats),
      rehearsalFinalBasename,
      rehearsalFinalPath,
    };
  } catch (error) {
    if (descriptor !== undefined) closeSync(descriptor);
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    fail("JOURNAL_PARENT", "receipt-pair parent is not private");
  }
}

function closeParent(context) {
  if (context?.descriptor !== undefined) closeSync(context.descriptor);
}

function assertParentStable(context) {
  const pathStats = lstatSync(context.parent, { bigint: true });
  const descriptorStats = fstatSync(context.descriptor, { bigint: true });
  if (
    realpathSync(context.parent) !== context.parent ||
    !pathStats.isDirectory() ||
    pathStats.isSymbolicLink() ||
    !descriptorStats.isDirectory() ||
    descriptorStats.isSymbolicLink() ||
    !matchesSerializedIdentity(context.parentIdentity, pathStats) ||
    !matchesSerializedIdentity(context.parentIdentity, descriptorStats) ||
    (Number(pathStats.mode) & 0o777) !== 0o700 ||
    (Number(descriptorStats.mode) & 0o777) !== 0o700
  ) {
    fail("JOURNAL_PARENT", "receipt-pair parent changed");
  }
}

function journalPaths(context) {
  const key = createHash("sha256")
    .update(JOURNAL_NAME_DOMAIN)
    .update(context.companionFinalBasename)
    .update("\0")
    .update(context.rehearsalFinalBasename)
    .digest("hex");
  const journalBasename = `.foodsystems-receipt-pair-${key}.journal-v1.json`;
  return {
    journalPath: join(context.parent, journalBasename),
    preparationPrefix: `${journalBasename}.prepare.`,
  };
}

function inspectReceipt(
  path,
  {
    binding,
    expectedSha256,
    identityField = "stagingIdentity",
    requireSingleLink = false,
  },
) {
  const pathStats = lstatOrNull(path);
  if (!pathStats) return null;
  let descriptor;
  try {
    descriptor = openSync(
      path,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      !sameIdentity(pathStats, before) ||
      (Number(before.mode) & 0o777) !== 0o400 ||
      before.size <= 0n ||
      before.size > BigInt(MAX_RECEIPT_BYTES) ||
      before.nlink < 1n ||
      before.nlink > 2n ||
      (requireSingleLink && before.nlink !== 1n) ||
      (binding && !matchesSerializedIdentity(binding[identityField], before))
    ) {
      fail("JOURNAL_PATH_MISMATCH", "journal-bound receipt path differs");
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    const receiptSha256 = sha256(bytes);
    if (
      !sameIdentity(before, after) ||
      before.size !== BigInt(bytes.length) ||
      after.size !== BigInt(bytes.length) ||
      receiptSha256 !== (binding?.receiptSha256 ?? expectedSha256)
    ) {
      fail("JOURNAL_PATH_MISMATCH", "journal-bound receipt path differs");
    }
    return { identity: before, nlink: before.nlink, receiptSha256 };
  } catch (error) {
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    fail("JOURNAL_PATH_MISMATCH", "journal-bound receipt path differs");
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function inspectJournalFile(
  path,
  companionFinalBasename,
  rehearsalFinalBasename,
) {
  const pathStats = lstatOrNull(path);
  if (!pathStats) return null;
  let descriptor;
  try {
    descriptor = openSync(
      path,
      constants.O_RDONLY |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
    );
    const before = fstatSync(descriptor, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      !sameIdentity(pathStats, before) ||
      (Number(before.mode) & 0o777) !== 0o400 ||
      before.size <= 0n ||
      before.size > BigInt(MAX_JOURNAL_BYTES) ||
      before.nlink < 1n ||
      before.nlink > 2n
    ) {
      fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor, { bigint: true });
    if (
      !sameIdentity(before, after) ||
      before.size !== BigInt(bytes.length) ||
      after.size !== BigInt(bytes.length)
    ) {
      fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
    }
    return {
      bytes,
      identity: before,
      journal: parseJournal(
        bytes,
        companionFinalBasename,
        rehearsalFinalBasename,
      ),
      journalSha256: sha256(bytes),
      nlink: before.nlink,
    };
  } catch (error) {
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    fail("JOURNAL_INVALID", "receipt-pair journal is invalid");
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function assertStorage(context, storage, role) {
  if (
    !isPlainObject(storage) ||
    storage.finalPath !== context[`${role}FinalPath`] ||
    storage.parent !== context.parent ||
    !isPlainObject(storage.parentIdentity) ||
    String(storage.parentIdentity.dev) !== context.parentIdentity.device ||
    String(storage.parentIdentity.ino) !== context.parentIdentity.inode ||
    typeof storage.stagingPath !== "string" ||
    !isAbsolute(storage.stagingPath) ||
    dirname(storage.stagingPath) !== context.parent ||
    !safeBasename(basename(storage.stagingPath))
  ) {
    fail("JOURNAL_INPUT", "receipt-pair staging storage is invalid");
  }
}

function assertDistinctPairPaths(
  context,
  companionStorage,
  rehearsalStorage,
  paths,
  preparationPath,
) {
  const values = [
    context.companionFinalPath,
    context.rehearsalFinalPath,
    companionStorage.stagingPath,
    rehearsalStorage.stagingPath,
    paths.journalPath,
    preparationPath,
  ];
  if (new Set(values).size !== values.length) {
    fail("JOURNAL_INPUT", "receipt-pair paths are not distinct");
  }
}

function writeExclusiveJournalPreparation(path, bytes) {
  let descriptor;
  try {
    descriptor = openSync(
      path,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        (constants.O_NOFOLLOW ?? 0) |
        (constants.O_CLOEXEC ?? 0),
      0o400,
    );
    fchmodSync(descriptor, 0o400);
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
    const identity = fstatSync(descriptor, { bigint: true });
    if (
      !identity.isFile() ||
      identity.isSymbolicLink() ||
      identity.nlink !== 1n ||
      (Number(identity.mode) & 0o777) !== 0o400 ||
      identity.size !== BigInt(bytes.length)
    ) {
      fail("JOURNAL_IO", "receipt-pair journal could not be prepared");
    }
    return identity;
  } catch (error) {
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    if (error && error.code === "EEXIST") {
      fail("JOURNAL_EXISTS", "receipt-pair journal already exists");
    }
    fail("JOURNAL_IO", "receipt-pair journal could not be prepared");
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function unlinkIdentity(path, expectedIdentity, context) {
  const current = lstatOrNull(path);
  if (!current) return false;
  if (!sameIdentity(expectedIdentity, current)) {
    fail("JOURNAL_PATH_MISMATCH", "journal-owned path differs");
  }
  try {
    unlinkSync(path);
    assertParentStable(context);
    fsyncSync(context.descriptor);
    return true;
  } catch (error) {
    if (error instanceof LogicalRestoreReceiptPairJournalError) throw error;
    fail("JOURNAL_IO", "journal-owned path could not be removed");
  }
}

function unlinkBoundReceipt(
  path,
  binding,
  context,
  { identityField = "stagingIdentity" } = {},
) {
  const inspected = inspectReceipt(path, { binding, identityField });
  if (!inspected) return false;
  return unlinkIdentity(path, inspected.identity, context);
}

function assertReceiptTopology(stage, final) {
  const visibleLinks = Number(Boolean(stage)) + Number(Boolean(final));
  for (const inspected of [stage, final]) {
    if (inspected && inspected.nlink !== BigInt(visibleLinks)) {
      fail("JOURNAL_PATH_MISMATCH", "journal-bound receipt topology differs");
    }
  }
}

function prepareInternal({
  companionStorage,
  expectedCompanionReceiptSha256,
  expectedRehearsalReceiptSha256,
  rehearsalStorage,
}) {
  assertSha256(expectedCompanionReceiptSha256);
  assertSha256(expectedRehearsalReceiptSha256);
  const context = openPrivatePairParent(
    companionStorage?.finalPath,
    rehearsalStorage?.finalPath,
  );
  const paths = journalPaths(context);
  const preparationPath = join(
    context.parent,
    `${paths.preparationPrefix}${process.pid}.${randomUUID()}`,
  );
  let preparationIdentity;
  let journalIdentity;
  try {
    assertStorage(context, companionStorage, "companion");
    assertStorage(context, rehearsalStorage, "rehearsal");
    assertDistinctPairPaths(
      context,
      companionStorage,
      rehearsalStorage,
      paths,
      preparationPath,
    );
    assertParentStable(context);
    if (
      lstatOrNull(context.companionFinalPath) ||
      lstatOrNull(context.rehearsalFinalPath)
    ) {
      fail("JOURNAL_FINAL_EXISTS", "receipt-pair final output already exists");
    }
    if (lstatOrNull(paths.journalPath)) {
      fail("JOURNAL_EXISTS", "receipt-pair journal already exists");
    }
    const companion = inspectReceipt(companionStorage.stagingPath, {
      expectedSha256: expectedCompanionReceiptSha256,
      requireSingleLink: true,
    });
    const rehearsal = inspectReceipt(rehearsalStorage.stagingPath, {
      expectedSha256: expectedRehearsalReceiptSha256,
      requireSingleLink: true,
    });
    if (!companion || !rehearsal) {
      fail("JOURNAL_STAGING_MISSING", "receipt-pair staging is incomplete");
    }
    const journal = {
      canonicalJsonFormat: LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_CANONICAL_JSON,
      companion: {
        finalBasename: context.companionFinalBasename,
        finalIdentity: serializedIdentity(companion.identity),
        receiptSha256: expectedCompanionReceiptSha256,
        stagingBasename: basename(companionStorage.stagingPath),
        stagingIdentity: serializedIdentity(companion.identity),
      },
      format: LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_FORMAT,
      rehearsal: {
        finalBasename: context.rehearsalFinalBasename,
        finalIdentity: serializedIdentity(rehearsal.identity),
        receiptSha256: expectedRehearsalReceiptSha256,
        stagingBasename: basename(rehearsalStorage.stagingPath),
        stagingIdentity: serializedIdentity(rehearsal.identity),
      },
      version: LOGICAL_RESTORE_RECEIPT_PAIR_JOURNAL_VERSION,
    };
    const bytes = Buffer.from(
      `${canonicalLogicalRestoreReceiptPairJournalJson(journal)}\n`,
      "utf8",
    );
    preparationIdentity = writeExclusiveJournalPreparation(
      preparationPath,
      bytes,
    );
    try {
      linkSync(preparationPath, paths.journalPath);
    } catch (error) {
      if (error && error.code === "EEXIST") {
        fail("JOURNAL_EXISTS", "receipt-pair journal already exists");
      }
      fail("JOURNAL_IO", "receipt-pair journal could not be committed");
    }
    journalIdentity = preparationIdentity;
    const linkedJournal = lstatSync(paths.journalPath, { bigint: true });
    const linkedPreparation = lstatSync(preparationPath, {
      bigint: true,
    });
    if (
      !sameIdentity(preparationIdentity, linkedJournal) ||
      !sameIdentity(preparationIdentity, linkedPreparation) ||
      linkedJournal.nlink !== 2n ||
      linkedPreparation.nlink !== 2n
    ) {
      fail("JOURNAL_IO", "receipt-pair journal identity differs");
    }
    assertParentStable(context);
    fsyncSync(context.descriptor);
    unlinkIdentity(preparationPath, preparationIdentity, context);
    preparationIdentity = undefined;
    const committed = inspectJournalFile(
      paths.journalPath,
      context.companionFinalBasename,
      context.rehearsalFinalBasename,
    );
    if (
      !committed ||
      !sameIdentity(linkedJournal, committed.identity) ||
      committed.nlink !== 1n ||
      !committed.bytes.equals(bytes)
    ) {
      fail("JOURNAL_IO", "receipt-pair journal commit differs");
    }
    const companionAfter = inspectReceipt(companionStorage.stagingPath, {
      binding: journal.companion,
    });
    const rehearsalAfter = inspectReceipt(rehearsalStorage.stagingPath, {
      binding: journal.rehearsal,
    });
    if (
      !companionAfter ||
      !rehearsalAfter ||
      companionAfter.nlink !== 1n ||
      rehearsalAfter.nlink !== 1n
    ) {
      fail("JOURNAL_PATH_MISMATCH", "journal-bound staging changed");
    }
    return Object.freeze({
      journalSha256: committed.journalSha256,
      status: "prepared",
    });
  } catch (error) {
    if (journalIdentity) {
      try {
        unlinkIdentity(paths.journalPath, journalIdentity, context);
      } catch {
        // Preserve the original fail-closed preparation error.
      }
    }
    if (preparationIdentity) {
      try {
        unlinkIdentity(preparationPath, preparationIdentity, context);
      } catch {
        // Preserve the original fail-closed preparation error.
      }
    }
    throw error;
  } finally {
    closeParent(context);
  }
}

export function prepareLogicalRestoreReceiptPairJournal(input) {
  return safeBoundary(() => prepareInternal(input));
}

function loadRecoveryJournal(context, paths) {
  const canonical = inspectJournalFile(
    paths.journalPath,
    context.companionFinalBasename,
    context.rehearsalFinalBasename,
  );
  if (!canonical) return null;
  if (canonical.nlink === 1n) {
    return { ...canonical, preparation: null };
  }
  if (canonical.nlink !== 2n) {
    fail("JOURNAL_INVALID", "receipt-pair journal link count differs");
  }

  const matchingPreparationPaths = readdirSync(context.parent)
    .filter(
      (name) => name.startsWith(paths.preparationPrefix) && safeBasename(name),
    )
    .map((name) => join(context.parent, name))
    .filter((path) => {
      const identity = lstatOrNull(path);
      return identity && sameIdentity(canonical.identity, identity);
    });
  if (matchingPreparationPaths.length !== 1) {
    fail("JOURNAL_INVALID", "receipt-pair journal link differs");
  }
  const preparationPath = matchingPreparationPaths[0];
  const preparation = inspectJournalFile(
    preparationPath,
    context.companionFinalBasename,
    context.rehearsalFinalBasename,
  );
  if (
    !preparation ||
    preparation.nlink !== 2n ||
    !sameIdentity(canonical.identity, preparation.identity) ||
    !canonical.bytes.equals(preparation.bytes)
  ) {
    fail("JOURNAL_INVALID", "receipt-pair journal links differ");
  }
  return {
    ...canonical,
    preparation: { ...preparation, path: preparationPath },
  };
}

function assertOptionalExpectedHash(expected, actual) {
  if (expected === undefined) return;
  assertSha256(expected);
  if (expected !== actual) {
    fail("JOURNAL_EXPECTATION_MISMATCH", "receipt-pair journal hash differs");
  }
}

function recoverInternal(
  {
    companionFinalPath,
    expectedCompanionReceiptSha256,
    expectedRehearsalReceiptSha256,
    rehearsalFinalPath,
  },
  { requireCommitted = false } = {},
) {
  const context = openPrivatePairParent(companionFinalPath, rehearsalFinalPath);
  const paths = journalPaths(context);
  try {
    assertParentStable(context);
    const loaded = loadRecoveryJournal(context, paths);
    if (!loaded) {
      if (
        lstatOrNull(context.companionFinalPath) ||
        lstatOrNull(context.rehearsalFinalPath)
      ) {
        fail("JOURNAL_REQUIRED", "untracked receipt-pair final exists");
      }
      return Object.freeze({ status: "absent" });
    }
    assertOptionalExpectedHash(
      expectedCompanionReceiptSha256,
      loaded.journal.companion.receiptSha256,
    );
    assertOptionalExpectedHash(
      expectedRehearsalReceiptSha256,
      loaded.journal.rehearsal.receiptSha256,
    );
    const companionStagingPath = join(
      context.parent,
      loaded.journal.companion.stagingBasename,
    );
    const rehearsalStagingPath = join(
      context.parent,
      loaded.journal.rehearsal.stagingBasename,
    );
    const companionStage = inspectReceipt(companionStagingPath, {
      binding: loaded.journal.companion,
    });
    const companionFinal = inspectReceipt(context.companionFinalPath, {
      binding: loaded.journal.companion,
      identityField: "finalIdentity",
    });
    const rehearsalStage = inspectReceipt(rehearsalStagingPath, {
      binding: loaded.journal.rehearsal,
    });
    const rehearsalFinal = inspectReceipt(context.rehearsalFinalPath, {
      binding: loaded.journal.rehearsal,
      identityField: "finalIdentity",
    });
    assertReceiptTopology(companionStage, companionFinal);
    assertReceiptTopology(rehearsalStage, rehearsalFinal);
    const committed = Boolean(companionFinal);
    if (committed && !rehearsalFinal) {
      fail("JOURNAL_STATE_INVALID", "companion commit marker is incomplete");
    }
    if (requireCommitted && !committed) {
      fail("JOURNAL_NOT_COMMITTED", "receipt-pair is not committed");
    }

    if (committed) {
      unlinkBoundReceipt(
        companionStagingPath,
        loaded.journal.companion,
        context,
      );
      unlinkBoundReceipt(
        rehearsalStagingPath,
        loaded.journal.rehearsal,
        context,
      );
    } else {
      unlinkBoundReceipt(
        companionStagingPath,
        loaded.journal.companion,
        context,
      );
      unlinkBoundReceipt(
        rehearsalStagingPath,
        loaded.journal.rehearsal,
        context,
      );
      unlinkBoundReceipt(
        context.rehearsalFinalPath,
        loaded.journal.rehearsal,
        context,
        { identityField: "finalIdentity" },
      );
    }
    if (loaded.preparation) {
      unlinkIdentity(
        loaded.preparation.path,
        loaded.preparation.identity,
        context,
      );
    }
    if (!committed) {
      unlinkIdentity(paths.journalPath, loaded.identity, context);
    }
    assertParentStable(context);
    fsyncSync(context.descriptor);
    return Object.freeze({
      companionReceiptSha256: loaded.journal.companion.receiptSha256,
      journalSha256: loaded.journalSha256,
      rehearsalReceiptSha256: loaded.journal.rehearsal.receiptSha256,
      status: committed ? "committed" : "replay_required",
    });
  } finally {
    closeParent(context);
  }
}

export function recoverLogicalRestoreReceiptPairJournal(input) {
  return safeBoundary(() => recoverInternal(input));
}

export function finalizeLogicalRestoreReceiptPairJournal(input) {
  return safeBoundary(() => recoverInternal(input, { requireCommitted: true }));
}
