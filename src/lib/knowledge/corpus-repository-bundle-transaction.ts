import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

import { z } from "zod";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "./corpus-processing-lifecycle";

export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_SCHEMA_VERSION =
  "corpus-repository-bundle-transaction-v1" as const;
export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_VERSION = "1.0.0" as const;
export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH =
  ".corpus-repository-bundle-transaction.v1.json" as const;
export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH =
  ".corpus-repository-bundle-transaction-data.v1" as const;
export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_HASH_DOMAIN =
  "food-systems/corpus-repository-bundle-transaction-journal/v1\n" as const;
export const CORPUS_REPOSITORY_BUNDLE_TRANSACTION_BINDING_SET_HASH_DOMAIN =
  "food-systems/corpus-repository-bundle-transaction-binding-set/v1\n" as const;
export const CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL_ACKNOWLEDGEMENT =
  "RECOVER_CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL" as const;

const prefixedSha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const utcTimestampSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
const portablePathSchema = z
  .string()
  .min(1)
  .refine((value) => {
    if (
      value.startsWith("/") ||
      value.startsWith("~") ||
      value.includes("\\") ||
      /^[A-Za-z][A-Za-z0-9+.-]*:/.test(value) ||
      /[\u0000-\u001f\u007f]/.test(value)
    ) {
      return false;
    }
    return value
      .split("/")
      .every(
        (segment) => segment.length > 0 && segment !== "." && segment !== "..",
      );
  }, "Expected a portable repository-relative path");
const fileModeSchema = z.number().int().min(0).max(0o777);
const readableFileModeSchema = fileModeSchema.refine(
  (mode) => (mode & 0o400) !== 0,
  "Expected a file mode readable by its owner",
);

export const CorpusRepositoryBundleFileBindingSchema = z
  .object({
    path: portablePathSchema,
    sha256: prefixedSha256Schema,
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

export type CorpusRepositoryBundleFileBinding = z.infer<
  typeof CorpusRepositoryBundleFileBindingSchema
>;

const transactionEntrySchema = z
  .object({
    path: portablePathSchema,
    before: CorpusRepositoryBundleFileBindingSchema.nullable(),
    beforeMode: fileModeSchema.nullable(),
    after: CorpusRepositoryBundleFileBindingSchema,
    afterMode: readableFileModeSchema,
    stagedPath: portablePathSchema,
    backupPath: portablePathSchema.nullable(),
  })
  .strict();

const transactionJournalBodySchema = z
  .object({
    schemaVersion: z.literal(
      CORPUS_REPOSITORY_BUNDLE_TRANSACTION_SCHEMA_VERSION,
    ),
    artifactType: z.literal("corpus_repository_bundle_transaction_journal"),
    transactionVersion: z.literal(CORPUS_REPOSITORY_BUNDLE_TRANSACTION_VERSION),
    phase: z.enum(["staging", "prepared"]),
    createdAt: utcTimestampSchema,
    transactionId: identifierSchema,
    transactionKind: identifierSchema,
    authorizationSha256: prefixedSha256Schema,
    finalCommitMarkerPath: portablePathSchema,
    entries: z.array(transactionEntrySchema).min(2),
  })
  .strict();

export const CorpusRepositoryBundleTransactionJournalSchema =
  transactionJournalBodySchema
    .extend({ journalSha256: prefixedSha256Schema })
    .strict();

export type CorpusRepositoryBundleTransactionJournal = z.infer<
  typeof CorpusRepositoryBundleTransactionJournalSchema
>;

export type CorpusRepositoryBundleOutput = {
  path: string;
  content: string | Buffer;
  mode?: number;
};

export type CorpusRepositoryBundleTransactionFaultPoint =
  | "journal_staging_durable"
  | "staging_complete"
  | "journal_prepared_durable"
  | `target_renamed:${string}`;

export class CorpusRepositoryBundleSimulatedCrash extends Error {}

type OptionalFileState = {
  binding: CorpusRepositoryBundleFileBinding;
  mode: number;
} | null;

function domainHash(domain: string, value: unknown): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value as CorpusCanonicalJsonValue))
    .digest("hex")}`;
}

function sameJson(left: unknown, right: unknown): boolean {
  return (
    canonicalCorpusJson(left as CorpusCanonicalJsonValue) ===
    canonicalCorpusJson(right as CorpusCanonicalJsonValue)
  );
}

function sortedUniqueBindings(
  bindings: CorpusRepositoryBundleFileBinding[],
  label: string,
): CorpusRepositoryBundleFileBinding[] {
  const parsed = bindings.map((binding) =>
    CorpusRepositoryBundleFileBindingSchema.parse(binding),
  );
  const paths = parsed.map((binding) => binding.path);
  assertUniquePortablePaths(paths, label);
  return [...parsed].sort((left, right) =>
    left.path < right.path ? -1 : left.path > right.path ? 1 : 0,
  );
}

function portablePathAliasKey(path: string): string {
  return portablePathSchema.parse(path).normalize("NFC").toLowerCase();
}

function assertUniquePortablePaths(paths: string[], label: string): void {
  const parsed = paths.map((path) => portablePathSchema.parse(path));
  if (new Set(parsed).size !== parsed.length) {
    throw new Error(`${label} contains duplicate paths`);
  }
  const aliases = parsed.map(portablePathAliasKey);
  if (new Set(aliases).size !== aliases.length) {
    throw new Error(`${label} contains case or Unicode path aliases`);
  }
}

function directoryEntryExists(path: string): boolean {
  try {
    lstatSync(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function corpusRepositoryBundleFileBinding(
  path: string,
  content: string | Buffer,
): CorpusRepositoryBundleFileBinding {
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, "utf8");
  return CorpusRepositoryBundleFileBindingSchema.parse({
    path,
    sha256: `sha256:${createHash("sha256").update(bytes).digest("hex")}`,
    sizeBytes: bytes.length,
  });
}

export function corpusRepositoryBundleBindingSetSha256(
  bindings: CorpusRepositoryBundleFileBinding[],
): string {
  return domainHash(
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_BINDING_SET_HASH_DOMAIN,
    sortedUniqueBindings(bindings, "Repository bundle binding set"),
  );
}

function sealTransactionJournal(
  body: z.input<typeof transactionJournalBodySchema>,
): CorpusRepositoryBundleTransactionJournal {
  const parsed = transactionJournalBodySchema.parse(body);
  const paths = parsed.entries.map((entry) => entry.path);
  if (new Set(paths).size !== paths.length) {
    throw new Error("Repository bundle transaction has duplicate targets");
  }
  if (
    parsed.entries.at(-1)?.path !== parsed.finalCommitMarkerPath ||
    paths.filter((path) => path === parsed.finalCommitMarkerPath).length !== 1
  ) {
    throw new Error(
      "Repository bundle final commit marker must be the unique last target",
    );
  }
  for (const [index, entry] of parsed.entries.entries()) {
    const stem = index.toString().padStart(4, "0");
    const expectedStagedPath = `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH}/${stem}.next`;
    const expectedBackupPath = entry.before
      ? `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH}/${stem}.before`
      : null;
    if (
      entry.after.path !== entry.path ||
      (entry.before !== null && entry.before.path !== entry.path) ||
      (entry.before === null) !== (entry.beforeMode === null) ||
      entry.stagedPath !== expectedStagedPath ||
      entry.backupPath !== expectedBackupPath
    ) {
      throw new Error("Repository bundle transaction entry is inconsistent");
    }
  }
  const finalEntry = parsed.entries.at(-1)!;
  if (
    sameBinding(finalEntry.before, finalEntry.after) &&
    finalEntry.beforeMode === finalEntry.afterMode
  ) {
    throw new Error("Repository bundle final commit marker must change state");
  }
  return CorpusRepositoryBundleTransactionJournalSchema.parse({
    ...parsed,
    journalSha256: domainHash(
      CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_HASH_DOMAIN,
      parsed,
    ),
  });
}

export function validateCorpusRepositoryBundleTransactionJournal(
  value: unknown,
): CorpusRepositoryBundleTransactionJournal {
  const parsed = CorpusRepositoryBundleTransactionJournalSchema.parse(value);
  const { journalSha256, ...body } = parsed;
  const resealed = sealTransactionJournal(body);
  if (journalSha256 !== resealed.journalSha256 || !sameJson(parsed, resealed)) {
    throw new Error("Repository bundle transaction journal self-hash mismatch");
  }
  return parsed;
}

function rootOrThrow(root: string): string {
  if (!root || !isAbsolute(root)) {
    throw new Error("Repository bundle root must be absolute");
  }
  const normalized = resolve(root);
  const stat = lstatSync(normalized);
  if (!stat.isDirectory() || stat.isSymbolicLink()) {
    throw new Error("Repository bundle root is not a regular directory");
  }
  return realpathSync(normalized);
}

function projectFile(root: string, path: string): string {
  portablePathSchema.parse(path);
  const pathAlias = portablePathAliasKey(path);
  const journalAlias = portablePathAliasKey(
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH,
  );
  const journalTemporaryAlias = portablePathAliasKey(
    `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH}.tmp`,
  );
  const dataAlias = portablePathAliasKey(
    CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH,
  );
  if (
    pathAlias === journalAlias ||
    pathAlias === journalTemporaryAlias ||
    pathAlias === dataAlias ||
    pathAlias.startsWith(`${dataAlias}/`)
  ) {
    throw new Error(
      `Repository bundle target overlaps transaction data: ${path}`,
    );
  }
  const target = resolve(root, path);
  const relation = relative(root, target);
  if (relation === "" || relation === ".." || relation.startsWith(`..${sep}`)) {
    throw new Error(`Repository bundle path escaped root: ${path}`);
  }
  let current = root;
  const parentRelation = relative(root, dirname(target));
  for (const component of parentRelation ? parentRelation.split(sep) : []) {
    current = resolve(current, component);
    if (!directoryEntryExists(current)) {
      throw new Error(
        `Repository bundle target parent does not exist: ${path}`,
      );
    }
    const stat = lstatSync(current);
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(
        `Repository bundle path has a symlinked or non-directory ancestor: ${path}`,
      );
    }
  }
  return target;
}

function transactionJournalPath(root: string): string {
  return resolve(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_JOURNAL_PATH);
}

function transactionJournalTemporaryPath(root: string): string {
  return `${transactionJournalPath(root)}.tmp`;
}

function transactionDataPath(root: string): string {
  return resolve(root, CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH);
}

function readStableRegular(
  path: string,
  label: string,
): {
  bytes: Buffer;
  mode: number;
} {
  const beforePath = lstatSync(path);
  if (
    !beforePath.isFile() ||
    beforePath.isSymbolicLink() ||
    beforePath.nlink !== 1
  ) {
    throw new Error(`${label} is not a one-link regular file`);
  }
  const descriptor = openSync(
    path,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const before = fstatSync(descriptor);
    if (
      !before.isFile() ||
      before.nlink !== 1 ||
      before.dev !== beforePath.dev ||
      before.ino !== beforePath.ino
    ) {
      throw new Error(`${label} changed before read`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor);
    const afterPath = lstatSync(path);
    if (
      after.dev !== before.dev ||
      after.ino !== before.ino ||
      after.size !== before.size ||
      after.mtimeMs !== before.mtimeMs ||
      after.ctimeMs !== before.ctimeMs ||
      after.nlink !== 1 ||
      afterPath.dev !== before.dev ||
      afterPath.ino !== before.ino ||
      afterPath.size !== before.size ||
      afterPath.mtimeMs !== before.mtimeMs ||
      afterPath.ctimeMs !== before.ctimeMs ||
      bytes.length !== before.size
    ) {
      throw new Error(`${label} changed while being read`);
    }
    return { bytes, mode: before.mode & 0o777 };
  } finally {
    closeSync(descriptor);
  }
}

function readOptionalFileState(root: string, path: string): OptionalFileState {
  const target = projectFile(root, path);
  if (!directoryEntryExists(target)) return null;
  const observed = readStableRegular(target, `Repository bundle file ${path}`);
  return {
    binding: corpusRepositoryBundleFileBinding(path, observed.bytes),
    mode: observed.mode,
  };
}

export function readCorpusRepositoryBundleFileBinding(
  root: string,
  path: string,
): CorpusRepositoryBundleFileBinding {
  const normalizedRoot = rootOrThrow(root);
  const observed = readOptionalFileState(normalizedRoot, path);
  if (!observed) throw new Error(`Repository bundle input is missing: ${path}`);
  return observed.binding;
}

function sameBinding(
  left: CorpusRepositoryBundleFileBinding | null,
  right: CorpusRepositoryBundleFileBinding | null,
): boolean {
  return sameJson(left, right);
}

function sameFileState(
  observed: OptionalFileState,
  binding: CorpusRepositoryBundleFileBinding | null,
  mode: number | null,
): boolean {
  if (observed === null || binding === null || mode === null) {
    return observed === null && binding === null && mode === null;
  }
  return sameBinding(observed.binding, binding) && observed.mode === mode;
}

function assertBindingsCurrent(
  root: string,
  bindings: CorpusRepositoryBundleFileBinding[],
): void {
  for (const binding of sortedUniqueBindings(
    bindings,
    "Repository CAS inputs",
  )) {
    const observed = readOptionalFileState(root, binding.path);
    if (!observed || !sameBinding(observed.binding, binding)) {
      throw new Error(`Repository bundle CAS input drifted: ${binding.path}`);
    }
  }
}

function assertPathsAbsent(root: string, paths: string[]): void {
  const unique = new Set(paths);
  if (unique.size !== paths.length) {
    throw new Error("Repository bundle expected-absent paths are duplicated");
  }
  for (const path of unique) {
    if (directoryEntryExists(projectFile(root, path))) {
      throw new Error(`Repository bundle expected-absent path exists: ${path}`);
    }
  }
}

function writeDurableExclusive(
  path: string,
  content: string | Buffer,
  mode = 0o600,
): void {
  const descriptor = openSync(
    path,
    constants.O_WRONLY |
      constants.O_CREAT |
      constants.O_EXCL |
      (constants.O_NOFOLLOW ?? 0),
    mode,
  );
  try {
    writeFileSync(descriptor, content);
    fchmodSync(descriptor, mode);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function fsyncDirectory(path: string): void {
  const descriptor = openSync(path, constants.O_RDONLY);
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function journalContent(
  journal: CorpusRepositoryBundleTransactionJournal,
): string {
  return prettyJson(validateCorpusRepositoryBundleTransactionJournal(journal));
}

function replaceJournalDurably(
  root: string,
  journal: CorpusRepositoryBundleTransactionJournal,
): void {
  const target = transactionJournalPath(root);
  const temporary = transactionJournalTemporaryPath(root);
  if (directoryEntryExists(temporary)) {
    throw new Error("Refusing stale repository bundle journal temporary file");
  }
  const expected = Buffer.from(journalContent(journal), "utf8");
  writeDurableExclusive(temporary, expected);
  const observed = readStableRegular(
    temporary,
    "Repository bundle journal temporary file",
  );
  if (observed.mode !== 0o600 || !observed.bytes.equals(expected)) {
    throw new Error("Repository bundle journal temporary file drifted");
  }
  fsyncDirectory(dirname(target));
  renameSync(temporary, target);
  fsyncDirectory(dirname(target));
}

function readTransactionJournal(
  root: string,
): CorpusRepositoryBundleTransactionJournal {
  const path = transactionJournalPath(root);
  const observed = readStableRegular(path, "Repository bundle journal");
  if (observed.mode !== 0o600) {
    throw new Error("Repository bundle journal is not mode 0600");
  }
  return validateCorpusRepositoryBundleTransactionJournal(
    JSON.parse(observed.bytes.toString("utf8")),
  );
}

export function readCorpusRepositoryBundleTransactionJournal(
  rootValue: string,
): CorpusRepositoryBundleTransactionJournal {
  const root = rootOrThrow(rootValue);
  if (!directoryEntryExists(transactionJournalPath(root))) {
    throw new Error("Repository bundle transaction journal is missing");
  }
  return readTransactionJournal(root);
}

function removeRegularIfPresent(path: string, label: string): void {
  if (!directoryEntryExists(path)) return;
  readStableRegular(path, label);
  unlinkSync(path);
  fsyncDirectory(dirname(path));
}

function assertTransactionFilesKnown(
  root: string,
  journal: CorpusRepositoryBundleTransactionJournal,
): void {
  for (const [path, label] of [
    [transactionJournalPath(root), "Repository bundle journal"],
    [
      transactionJournalTemporaryPath(root),
      "Repository bundle journal temporary file",
    ],
  ] as const) {
    if (!directoryEntryExists(path)) continue;
    readStableRegular(path, label);
  }
  const dataPath = transactionDataPath(root);
  if (!directoryEntryExists(dataPath)) return;
  const stat = lstatSync(dataPath);
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    (stat.mode & 0o777) !== 0o700
  ) {
    throw new Error(
      "Repository bundle transaction data is not a mode-0700 directory",
    );
  }
  const expectedNames = new Set(
    journal.entries.flatMap((entry) => [
      basename(entry.stagedPath),
      ...(entry.backupPath ? [basename(entry.backupPath)] : []),
    ]),
  );
  const actualNames = readdirSync(dataPath);
  const unexpected = actualNames.filter((name) => !expectedNames.has(name));
  if (unexpected.length > 0) {
    throw new Error(
      `Repository bundle transaction data contains unexpected files: ${unexpected.join(", ")}`,
    );
  }
  for (const name of actualNames) {
    readStableRegular(resolve(dataPath, name), `Transaction data ${name}`);
  }
}

function cleanTransactionFiles(
  root: string,
  journal: CorpusRepositoryBundleTransactionJournal,
): void {
  assertTransactionFilesKnown(root, journal);
  const dataPath = transactionDataPath(root);
  if (directoryEntryExists(dataPath)) {
    for (const entry of journal.entries) {
      removeRegularIfPresent(resolve(root, entry.stagedPath), "Staged file");
      if (entry.backupPath) {
        removeRegularIfPresent(resolve(root, entry.backupPath), "Backup file");
      }
    }
    if (readdirSync(dataPath).length !== 0) {
      throw new Error("Repository bundle transaction cleanup is incomplete");
    }
    rmdirSync(dataPath);
    fsyncDirectory(dirname(dataPath));
  }
  removeRegularIfPresent(
    transactionJournalTemporaryPath(root),
    "Repository bundle journal temporary file",
  );
  removeRegularIfPresent(
    transactionJournalPath(root),
    "Repository bundle journal",
  );
}

function assertBackupMatches(
  root: string,
  entry: CorpusRepositoryBundleTransactionJournal["entries"][number],
): Buffer {
  if (!entry.before || !entry.backupPath) {
    throw new Error(`Repository bundle entry has no backup: ${entry.path}`);
  }
  const observed = readStableRegular(
    resolve(root, entry.backupPath),
    `Repository bundle backup ${entry.path}`,
  );
  if (observed.mode !== 0o600 && observed.mode !== entry.beforeMode) {
    throw new Error(`Repository bundle backup mode drifted: ${entry.path}`);
  }
  const binding = corpusRepositoryBundleFileBinding(entry.path, observed.bytes);
  if (!sameBinding(binding, entry.before)) {
    throw new Error(`Repository bundle backup drifted: ${entry.path}`);
  }
  return observed.bytes;
}

function prepareBackupForRestore(
  root: string,
  entry: CorpusRepositoryBundleTransactionJournal["entries"][number],
): string {
  if (!entry.before || entry.beforeMode === null || !entry.backupPath) {
    throw new Error(
      `Repository bundle entry has no restorable backup: ${entry.path}`,
    );
  }
  assertBackupMatches(root, entry);
  const backup = resolve(root, entry.backupPath);
  const descriptor = openSync(
    backup,
    constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
  );
  try {
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.nlink !== 1) {
      throw new Error(`Repository bundle backup changed: ${entry.path}`);
    }
    const bytes = readFileSync(descriptor);
    if (
      !sameBinding(
        corpusRepositoryBundleFileBinding(entry.path, bytes),
        entry.before,
      )
    ) {
      throw new Error(`Repository bundle backup drifted: ${entry.path}`);
    }
    fchmodSync(descriptor, entry.beforeMode);
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  const prepared = readStableRegular(
    backup,
    `Prepared repository bundle backup ${entry.path}`,
  );
  if (
    prepared.mode !== entry.beforeMode ||
    !sameBinding(
      corpusRepositoryBundleFileBinding(entry.path, prepared.bytes),
      entry.before,
    )
  ) {
    throw new Error(
      `Repository bundle backup preparation failed: ${entry.path}`,
    );
  }
  return backup;
}

function assertStagedMatches(
  root: string,
  entry: CorpusRepositoryBundleTransactionJournal["entries"][number],
): void {
  const observed = readStableRegular(
    resolve(root, entry.stagedPath),
    `Repository bundle staged file ${entry.path}`,
  );
  if (
    !sameBinding(
      corpusRepositoryBundleFileBinding(entry.path, observed.bytes),
      entry.after,
    ) ||
    observed.mode !== entry.afterMode
  ) {
    throw new Error(`Repository bundle staged file drifted: ${entry.path}`);
  }
}

function rollbackTransaction(
  root: string,
  journal: CorpusRepositoryBundleTransactionJournal,
): void {
  for (const entry of journal.entries) {
    const observed = readOptionalFileState(root, entry.path);
    if (
      !sameFileState(observed, entry.before, entry.beforeMode) &&
      !sameFileState(observed, entry.after, entry.afterMode)
    ) {
      throw new Error(
        `Repository bundle recovery found an unexpected target state: ${entry.path}`,
      );
    }
    if (
      entry.before &&
      !sameFileState(observed, entry.before, entry.beforeMode)
    ) {
      assertBackupMatches(root, entry);
    }
  }
  for (const entry of [...journal.entries].reverse()) {
    const observed = readOptionalFileState(root, entry.path);
    if (sameFileState(observed, entry.before, entry.beforeMode)) continue;
    const target = projectFile(root, entry.path);
    if (!entry.before) {
      unlinkSync(target);
      fsyncDirectory(dirname(target));
      continue;
    }
    const backup = prepareBackupForRestore(root, entry);
    renameSync(backup, target);
    fsyncDirectory(dirname(backup));
    if (dirname(backup) !== dirname(target)) fsyncDirectory(dirname(target));
  }
  for (const entry of journal.entries) {
    if (
      !sameFileState(
        readOptionalFileState(root, entry.path),
        entry.before,
        entry.beforeMode,
      )
    ) {
      throw new Error(`Repository bundle rollback failed: ${entry.path}`);
    }
  }
}

export function corpusRepositoryBundleRecoveryAcknowledgement(
  journalSha256: string,
): string {
  prefixedSha256Schema.parse(journalSha256);
  return `RECOVER_CORPUS_REPOSITORY_BUNDLE_${journalSha256
    .slice("sha256:".length)
    .toUpperCase()}`;
}

function recoverWithoutAcknowledgement(
  root: string,
  confirmCommittedState: (
    journal: CorpusRepositoryBundleTransactionJournal,
  ) => void,
): "rolled_back" | "completed" {
  const journal = readTransactionJournal(root);
  assertTransactionFilesKnown(root, journal);
  const observed = journal.entries.map((entry) =>
    readOptionalFileState(root, entry.path),
  );
  const allBefore = journal.entries.every((entry, index) =>
    sameFileState(observed[index]!, entry.before, entry.beforeMode),
  );
  const allAfter = journal.entries.every((entry, index) =>
    sameFileState(observed[index]!, entry.after, entry.afterMode),
  );
  const markerIndex = journal.entries.length - 1;
  const markerInstalled = sameFileState(
    observed[markerIndex]!,
    journal.entries[markerIndex]!.after,
    journal.entries[markerIndex]!.afterMode,
  );
  if (journal.phase === "staging") {
    if (!allBefore) {
      throw new Error(
        "Staging journal has a changed target; recovery is unsafe",
      );
    }
    cleanTransactionFiles(root, journal);
    return "rolled_back";
  }
  if (markerInstalled) {
    if (!allAfter) {
      throw new Error(
        "Commit marker is installed but repository bundle is incomplete",
      );
    }
    confirmCommittedState(journal);
    cleanTransactionFiles(root, journal);
    return "completed";
  }
  for (const [index, entry] of journal.entries.entries()) {
    const state = observed[index]!;
    if (
      !sameFileState(state, entry.before, entry.beforeMode) &&
      !sameFileState(state, entry.after, entry.afterMode)
    ) {
      throw new Error(
        `Repository bundle recovery found an unexpected target state: ${entry.path}`,
      );
    }
    if (entry.before && !sameFileState(state, entry.before, entry.beforeMode)) {
      assertBackupMatches(root, entry);
    }
  }
  rollbackTransaction(root, journal);
  cleanTransactionFiles(root, journal);
  return "rolled_back";
}

export function recoverCorpusRepositoryBundleTransaction(input: {
  root: string;
  acknowledgement: string;
  confirmCommittedState: (
    journal: CorpusRepositoryBundleTransactionJournal,
  ) => void;
}): "none" | "rolled_back" | "completed" {
  const root = rootOrThrow(input.root);
  if (!directoryEntryExists(transactionJournalPath(root))) {
    if (directoryEntryExists(transactionDataPath(root))) {
      throw new Error(
        "Orphan repository bundle transaction data requires manual inspection",
      );
    }
    if (directoryEntryExists(transactionJournalTemporaryPath(root))) {
      if (
        input.acknowledgement !==
        CORPUS_REPOSITORY_BUNDLE_ORPHAN_INITIAL_JOURNAL_ACKNOWLEDGEMENT
      ) {
        throw new Error(
          "Exact orphan initial-journal recovery acknowledgement is missing",
        );
      }
      removeRegularIfPresent(
        transactionJournalTemporaryPath(root),
        "Orphan repository bundle initial journal",
      );
      return "rolled_back";
    }
    return "none";
  }
  const journal = readTransactionJournal(root);
  if (
    input.acknowledgement !==
    corpusRepositoryBundleRecoveryAcknowledgement(journal.journalSha256)
  ) {
    throw new Error(
      "Exact repository bundle recovery acknowledgement is missing",
    );
  }
  return recoverWithoutAcknowledgement(root, input.confirmCommittedState);
}

export async function commitCorpusRepositoryBundleTransaction(input: {
  root: string;
  transactionId: string;
  transactionKind: string;
  authorizationSha256: string;
  expectedInputs: CorpusRepositoryBundleFileBinding[];
  expectedAbsentPaths?: string[];
  outputs: CorpusRepositoryBundleOutput[];
  finalCommitMarkerPath: string;
  revalidate: () => void | Promise<void>;
  testFaultInjector?: (
    point: CorpusRepositoryBundleTransactionFaultPoint,
  ) => void;
  confirmCommittedState: (
    journal: CorpusRepositoryBundleTransactionJournal,
  ) => void;
}): Promise<"committed" | "committed_after_recovery"> {
  const root = rootOrThrow(input.root);
  identifierSchema.parse(input.transactionId);
  identifierSchema.parse(input.transactionKind);
  prefixedSha256Schema.parse(input.authorizationSha256);
  portablePathSchema.parse(input.finalCommitMarkerPath);
  if (directoryEntryExists(transactionJournalPath(root))) {
    const journal = readTransactionJournal(root);
    throw new Error(
      `Repository bundle recovery is required: ${corpusRepositoryBundleRecoveryAcknowledgement(
        journal.journalSha256,
      )}`,
    );
  }
  if (
    directoryEntryExists(transactionDataPath(root)) ||
    directoryEntryExists(transactionJournalTemporaryPath(root))
  ) {
    throw new Error(
      "Orphan repository bundle transaction data requires manual inspection",
    );
  }
  if (input.outputs.length < 2) {
    throw new Error(
      "Repository bundle transaction requires at least two outputs",
    );
  }
  const outputPaths = input.outputs.map((output) => output.path);
  assertUniquePortablePaths(outputPaths, "Repository bundle outputs");
  if (
    outputPaths.at(-1) !== input.finalCommitMarkerPath ||
    outputPaths.filter((path) => path === input.finalCommitMarkerPath)
      .length !== 1
  ) {
    throw new Error(
      "Repository bundle outputs must be unique with the commit marker last",
    );
  }
  const expectedInputs = sortedUniqueBindings(
    input.expectedInputs,
    "Repository bundle expected inputs",
  );
  const expectedByPath = new Map(
    expectedInputs.map((binding) => [binding.path, binding]),
  );
  const expectedAbsentPaths = [...(input.expectedAbsentPaths ?? [])];
  assertUniquePortablePaths(
    expectedAbsentPaths,
    "Repository bundle expected-absent paths",
  );
  assertUniquePortablePaths(
    [...expectedInputs.map((binding) => binding.path), ...expectedAbsentPaths],
    "Repository bundle preconditions",
  );
  const expectedAbsent = new Set(expectedAbsentPaths);
  if (
    expectedAbsent.size !== expectedAbsentPaths.length ||
    [...expectedAbsent].some((path) => expectedByPath.has(path))
  ) {
    throw new Error("Repository bundle absent/input preconditions overlap");
  }
  assertBindingsCurrent(root, expectedInputs);
  assertPathsAbsent(root, expectedAbsentPaths);

  const normalizedOutputs = input.outputs.map((output) => ({
    ...output,
    bytes: Buffer.isBuffer(output.content)
      ? Buffer.from(output.content)
      : Buffer.from(output.content, "utf8"),
  }));
  const entries = normalizedOutputs.map((output, index) => {
    const beforeState = readOptionalFileState(root, output.path);
    if (
      beforeState &&
      !sameBinding(beforeState.binding, expectedByPath.get(output.path) ?? null)
    ) {
      throw new Error(
        `Repository bundle output lacks an exact CAS binding: ${output.path}`,
      );
    }
    if (!beforeState && !expectedAbsent.has(output.path)) {
      throw new Error(
        `Repository bundle output is absent but not sealed absent: ${output.path}`,
      );
    }
    const mode = output.mode ?? beforeState?.mode ?? 0o644;
    if (
      !Number.isInteger(mode) ||
      mode < 0 ||
      mode > 0o777 ||
      (mode & 0o400) === 0
    ) {
      throw new Error(
        `Repository bundle output mode is invalid: ${output.path}`,
      );
    }
    const stem = index.toString().padStart(4, "0");
    return {
      path: output.path,
      before: beforeState?.binding ?? null,
      beforeMode: beforeState?.mode ?? null,
      after: corpusRepositoryBundleFileBinding(output.path, output.bytes),
      afterMode: mode,
      stagedPath: `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH}/${stem}.next`,
      backupPath: beforeState
        ? `${CORPUS_REPOSITORY_BUNDLE_TRANSACTION_DATA_PATH}/${stem}.before`
        : null,
    };
  });
  const stagingJournal = sealTransactionJournal({
    schemaVersion: CORPUS_REPOSITORY_BUNDLE_TRANSACTION_SCHEMA_VERSION,
    artifactType: "corpus_repository_bundle_transaction_journal",
    transactionVersion: CORPUS_REPOSITORY_BUNDLE_TRANSACTION_VERSION,
    phase: "staging",
    createdAt: new Date().toISOString(),
    transactionId: input.transactionId,
    transactionKind: input.transactionKind,
    authorizationSha256: input.authorizationSha256,
    finalCommitMarkerPath: input.finalCommitMarkerPath,
    entries,
  });
  replaceJournalDurably(root, stagingJournal);
  input.testFaultInjector?.("journal_staging_durable");
  try {
    mkdirSync(transactionDataPath(root), { mode: 0o700 });
    chmodSync(transactionDataPath(root), 0o700);
    fsyncDirectory(root);
    for (const [index, output] of normalizedOutputs.entries()) {
      const entry = entries[index]!;
      const staged = resolve(root, entry.stagedPath);
      writeDurableExclusive(staged, output.bytes, entry.afterMode);
      fsyncDirectory(dirname(staged));
      const stagedState = readStableRegular(
        staged,
        `Staged repository bundle file ${entry.path}`,
      );
      if (
        !sameBinding(
          corpusRepositoryBundleFileBinding(entry.path, stagedState.bytes),
          entry.after,
        ) ||
        stagedState.mode !== entry.afterMode
      ) {
        throw new Error(`Repository bundle staging failed: ${entry.path}`);
      }
      if (entry.before && entry.backupPath) {
        const current = readOptionalFileState(root, entry.path);
        if (!current || !sameBinding(current.binding, entry.before)) {
          throw new Error(
            `Repository bundle target drifted during backup: ${entry.path}`,
          );
        }
        const backup = resolve(root, entry.backupPath);
        writeDurableExclusive(
          backup,
          readStableRegular(projectFile(root, entry.path), "Bundle target")
            .bytes,
        );
        fsyncDirectory(dirname(backup));
        assertBackupMatches(root, entry);
      }
    }
    input.testFaultInjector?.("staging_complete");
    const { journalSha256: _journalSha256, ...stagingBody } = stagingJournal;
    const preparedJournal = sealTransactionJournal({
      ...stagingBody,
      phase: "prepared",
    });
    replaceJournalDurably(root, preparedJournal);
    input.testFaultInjector?.("journal_prepared_durable");

    await input.revalidate();
    assertBindingsCurrent(root, expectedInputs);
    assertPathsAbsent(root, expectedAbsentPaths);
    for (const entry of preparedJournal.entries) {
      assertStagedMatches(root, entry);
      if (entry.before) assertBackupMatches(root, entry);
      if (
        !sameFileState(
          readOptionalFileState(root, entry.path),
          entry.before,
          entry.beforeMode,
        )
      ) {
        throw new Error(
          `Repository bundle target drifted before rename: ${entry.path}`,
        );
      }
      const staged = resolve(root, entry.stagedPath);
      const target = projectFile(root, entry.path);
      renameSync(staged, target);
      fsyncDirectory(dirname(staged));
      if (dirname(staged) !== dirname(target)) fsyncDirectory(dirname(target));
      input.testFaultInjector?.(`target_renamed:${entry.path}`);
    }
    for (const entry of preparedJournal.entries) {
      if (
        !sameFileState(
          readOptionalFileState(root, entry.path),
          entry.after,
          entry.afterMode,
        )
      ) {
        throw new Error(`Repository bundle commit failed: ${entry.path}`);
      }
    }
    input.confirmCommittedState(preparedJournal);
    cleanTransactionFiles(root, preparedJournal);
    return "committed";
  } catch (error) {
    if (error instanceof CorpusRepositoryBundleSimulatedCrash) throw error;
    if (directoryEntryExists(transactionJournalPath(root))) {
      const recovery = recoverWithoutAcknowledgement(
        root,
        input.confirmCommittedState,
      );
      if (recovery === "completed") return "committed_after_recovery";
    }
    throw error;
  }
}
