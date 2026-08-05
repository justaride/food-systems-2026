#!/usr/bin/env node

import { createHash, randomUUID } from 'node:crypto'
import {
  closeSync,
  existsSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, join } from 'node:path'

const METADATA_FORMAT = 'foodsystems-database-backup-metadata'
const METADATA_VERSION = 2
const RECEIPT_FORMAT = 'foodsystems-database-restore-receipt'
const RECEIPT_VERSION = 1
const CANONICAL_JSON_FORMAT = 'sorted-keys-v1'
const SHA256_PATTERN = /^[0-9a-f]{64}$/u
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u

export const CORE_COUNT_KEYS = Object.freeze([
  'ControlledMutationAudit',
  'DatabaseIdentity',
  'Document',
  'EvidenceAppraisal',
  'FieldCitation',
  'LibraryAnalysisRecord',
  'Report',
  'SourceCitation',
  'SourceDoc',
  'Thesis',
])

const SNAPSHOT_KEYS = Object.freeze([
  'coreCounts',
  'databaseIdentityUuid',
  'migrationLedger',
  'serverVersion',
  'sourceDatabase',
])

const MIGRATION_ENTRY_KEYS = Object.freeze([
  'appliedStepsCount',
  'checksum',
  'finishedAt',
  'id',
  'logs',
  'migrationName',
  'rolledBackAt',
  'startedAt',
])

const METADATA_KEYS = Object.freeze([
  'completedPrismaMigrationLedger',
  'coreCounts',
  'createdAtUtc',
  'databaseIdentity',
  'dump',
  'format',
  'source',
  'targetDatabaseFingerprint',
  'version',
])

function fail(message) {
  throw new Error(message)
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) fail(`${label} must be a JSON object`)
}

function assertExactKeys(value, expectedKeys, label) {
  assertPlainObject(value, label)
  const actual = Object.keys(value).sort()
  const expected = [...expectedKeys].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} keys must be exactly: ${expected.join(', ')}`)
  }
}

function assertSafeText(value, label, { allowEmpty = false } = {}) {
  if (typeof value !== 'string' || (!allowEmpty && value.length === 0)) {
    fail(`${label} must be ${allowEmpty ? 'a' : 'a non-empty'} string`)
  }
  if (/[\0\r\n]/u.test(value)) fail(`${label} contains unsafe control characters`)
}

function assertSafeNonNegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(`${label} must be a non-negative safe integer`)
  }
}

export function canonicalJson(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') {
    return JSON.stringify(value)
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('canonical JSON cannot contain a non-finite number')
    return JSON.stringify(value)
  }
  if (Array.isArray(value)) {
    return `[${value.map(item => canonicalJson(item)).join(',')}]`
  }
  if (isPlainObject(value)) {
    return `{${Object.keys(value).sort().map(key => (
      `${JSON.stringify(key)}:${canonicalJson(value[key])}`
    )).join(',')}}`
  }
  fail('canonical JSON contains an unsupported value')
}

export function sha256Text(value) {
  return createHash('sha256').update(value).digest('hex')
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function parseJsonFile(path, label) {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    fail(`${label} is not valid JSON: ${path}`)
  }
  return parsed
}

function validateCoreCounts(value, label) {
  assertExactKeys(value, CORE_COUNT_KEYS, label)
  for (const key of CORE_COUNT_KEYS) {
    assertSafeNonNegativeInteger(value[key], `${label}.${key}`)
  }
  if (value.DatabaseIdentity !== 1) {
    fail(`${label}.DatabaseIdentity must be exactly 1`)
  }
  return Object.fromEntries(CORE_COUNT_KEYS.map(key => [key, value[key]]))
}

function validateMigrationLedger(value) {
  if (!Array.isArray(value) || value.length === 0) {
    fail('snapshot.migrationLedger must contain every completed Prisma migration')
  }
  const identities = new Set()
  const names = new Set()
  for (const [index, entry] of value.entries()) {
    const label = `snapshot.migrationLedger[${index}]`
    assertExactKeys(entry, MIGRATION_ENTRY_KEYS, label)
    assertSafeText(entry.id, `${label}.id`)
    assertSafeText(entry.checksum, `${label}.checksum`)
    if (!SHA256_PATTERN.test(entry.checksum)) fail(`${label}.checksum must be a lowercase SHA-256`)
    assertSafeText(entry.migrationName, `${label}.migrationName`)
    assertSafeText(entry.finishedAt, `${label}.finishedAt`)
    assertSafeText(entry.startedAt, `${label}.startedAt`)
    if (!ISO_UTC_PATTERN.test(entry.finishedAt) || !ISO_UTC_PATTERN.test(entry.startedAt)) {
      fail(`${label} timestamps must be UTC ISO-8601 values`)
    }
    if (entry.rolledBackAt !== null) fail(`${label}.rolledBackAt must be null for a completed ledger row`)
    if (entry.logs !== null) {
      if (typeof entry.logs !== 'string' || /\0/u.test(entry.logs)) {
        fail(`${label}.logs must be null or text without NUL bytes`)
      }
    }
    assertSafeNonNegativeInteger(entry.appliedStepsCount, `${label}.appliedStepsCount`)
    if (identities.has(entry.id)) fail(`snapshot migration id is duplicated: ${entry.id}`)
    if (names.has(entry.migrationName)) fail(`snapshot migration name is duplicated: ${entry.migrationName}`)
    identities.add(entry.id)
    names.add(entry.migrationName)
  }
  return value
}

export function validateSnapshot(value) {
  assertExactKeys(value, SNAPSHOT_KEYS, 'snapshot')
  assertSafeText(value.sourceDatabase, 'snapshot.sourceDatabase')
  assertSafeText(value.serverVersion, 'snapshot.serverVersion')
  assertSafeText(value.databaseIdentityUuid, 'snapshot.databaseIdentityUuid')
  if (!UUID_PATTERN.test(value.databaseIdentityUuid)) {
    fail('snapshot.databaseIdentityUuid must be a UUID')
  }
  const migrationLedger = validateMigrationLedger(value.migrationLedger)
  const coreCounts = validateCoreCounts(value.coreCounts, 'snapshot.coreCounts')
  return {
    sourceDatabase: value.sourceDatabase,
    serverVersion: value.serverVersion,
    databaseIdentityUuid: value.databaseIdentityUuid.toLowerCase(),
    migrationLedger,
    coreCounts,
  }
}

export function snapshotBinding(snapshotValue) {
  const snapshot = validateSnapshot(snapshotValue)
  const completedPrismaMigrationLedger = {
    completedCount: snapshot.migrationLedger.length,
    sha256: sha256Text(canonicalJson(snapshot.migrationLedger)),
  }
  const fingerprintPayload = {
    completedPrismaMigrationLedger,
    coreCounts: snapshot.coreCounts,
    databaseIdentity: {
      key: 'primary',
      uuid: snapshot.databaseIdentityUuid,
    },
  }
  return {
    snapshot,
    completedPrismaMigrationLedger,
    fingerprintPayload,
    targetDatabaseFingerprintSha256: sha256Text(canonicalJson(fingerprintPayload)),
  }
}

function validateMetadataObject(value) {
  assertExactKeys(value, METADATA_KEYS, 'metadata')
  if (value.format !== METADATA_FORMAT || value.version !== METADATA_VERSION) {
    fail(`metadata must declare ${METADATA_FORMAT} version ${METADATA_VERSION}`)
  }
  assertSafeText(value.createdAtUtc, 'metadata.createdAtUtc')
  if (!ISO_UTC_PATTERN.test(value.createdAtUtc)) fail('metadata.createdAtUtc must be UTC ISO-8601')

  assertExactKeys(value.source, ['databaseName', 'serverVersion'], 'metadata.source')
  assertSafeText(value.source.databaseName, 'metadata.source.databaseName')
  assertSafeText(value.source.serverVersion, 'metadata.source.serverVersion')

  assertExactKeys(value.dump, ['archiveFormat', 'bytes', 'fileName', 'sha256'], 'metadata.dump')
  if (value.dump.archiveFormat !== 'postgresql-custom') {
    fail('metadata.dump.archiveFormat must be postgresql-custom')
  }
  assertSafeText(value.dump.fileName, 'metadata.dump.fileName')
  if (basename(value.dump.fileName) !== value.dump.fileName) {
    fail('metadata.dump.fileName must not contain a directory')
  }
  assertSafeNonNegativeInteger(value.dump.bytes, 'metadata.dump.bytes')
  if (value.dump.bytes === 0) fail('metadata.dump.bytes must be greater than zero')
  if (!SHA256_PATTERN.test(value.dump.sha256)) fail('metadata.dump.sha256 must be a lowercase SHA-256')

  assertExactKeys(value.databaseIdentity, ['key', 'uuid'], 'metadata.databaseIdentity')
  if (value.databaseIdentity.key !== 'primary' || !UUID_PATTERN.test(value.databaseIdentity.uuid)) {
    fail('metadata.databaseIdentity must contain the primary UUID')
  }

  assertExactKeys(
    value.completedPrismaMigrationLedger,
    ['completedCount', 'sha256'],
    'metadata.completedPrismaMigrationLedger',
  )
  assertSafeNonNegativeInteger(
    value.completedPrismaMigrationLedger.completedCount,
    'metadata.completedPrismaMigrationLedger.completedCount',
  )
  if (value.completedPrismaMigrationLedger.completedCount === 0) {
    fail('metadata.completedPrismaMigrationLedger.completedCount must be greater than zero')
  }
  if (!SHA256_PATTERN.test(value.completedPrismaMigrationLedger.sha256)) {
    fail('metadata.completedPrismaMigrationLedger.sha256 must be a lowercase SHA-256')
  }

  const coreCounts = validateCoreCounts(value.coreCounts, 'metadata.coreCounts')
  assertExactKeys(
    value.targetDatabaseFingerprint,
    ['canonicalJsonFormat', 'sha256'],
    'metadata.targetDatabaseFingerprint',
  )
  if (value.targetDatabaseFingerprint.canonicalJsonFormat !== CANONICAL_JSON_FORMAT) {
    fail(`metadata.targetDatabaseFingerprint.canonicalJsonFormat must be ${CANONICAL_JSON_FORMAT}`)
  }
  if (!SHA256_PATTERN.test(value.targetDatabaseFingerprint.sha256)) {
    fail('metadata.targetDatabaseFingerprint.sha256 must be a lowercase SHA-256')
  }
  const fingerprintPayload = {
    completedPrismaMigrationLedger: value.completedPrismaMigrationLedger,
    coreCounts,
    databaseIdentity: value.databaseIdentity,
  }
  const recomputed = sha256Text(canonicalJson(fingerprintPayload))
  if (recomputed !== value.targetDatabaseFingerprint.sha256) {
    fail('metadata target database fingerprint does not match its canonical identity/ledger/count payload')
  }
  return value
}

function writePrivateFile(path, contents) {
  const descriptor = openSync(path, 'wx', 0o600)
  try {
    writeFileSync(descriptor, contents, { encoding: 'utf8' })
    fsyncSync(descriptor)
  } finally {
    closeSync(descriptor)
  }
}

function buildMetadata(options) {
  const before = validateSnapshot(parseJsonFile(options.snapshotBefore, 'pre-dump database snapshot'))
  const after = validateSnapshot(parseJsonFile(options.snapshotAfter, 'post-dump database snapshot'))
  if (canonicalJson(before) !== canonicalJson(after)) {
    fail('database identity, completed migration ledger, or core counts changed while the dump was captured')
  }
  const binding = snapshotBinding(after)
  if (!SHA256_PATTERN.test(options.dumpSha256)) fail('--dump-sha256 must be a lowercase SHA-256')
  const dumpBytes = Number(options.dumpBytes)
  assertSafeNonNegativeInteger(dumpBytes, '--dump-bytes')
  if (dumpBytes === 0) fail('--dump-bytes must be greater than zero')
  if (sha256File(options.dump) !== options.dumpSha256) {
    fail('dump bytes do not match --dump-sha256 while building metadata')
  }
  if (statSync(options.dump).size !== dumpBytes) {
    fail('dump byte length does not match --dump-bytes while building metadata')
  }
  assertSafeText(options.dumpFileName, '--dump-file-name')
  if (basename(options.dumpFileName) !== options.dumpFileName) fail('--dump-file-name must be a basename')
  if (!ISO_UTC_PATTERN.test(options.createdAtUtc)) fail('--created-at-utc must be UTC ISO-8601')

  const metadata = {
    format: METADATA_FORMAT,
    version: METADATA_VERSION,
    createdAtUtc: options.createdAtUtc,
    source: {
      databaseName: after.sourceDatabase,
      serverVersion: after.serverVersion,
    },
    dump: {
      archiveFormat: 'postgresql-custom',
      fileName: options.dumpFileName,
      sha256: options.dumpSha256,
      bytes: dumpBytes,
    },
    databaseIdentity: {
      key: 'primary',
      uuid: after.databaseIdentityUuid,
    },
    completedPrismaMigrationLedger: binding.completedPrismaMigrationLedger,
    coreCounts: after.coreCounts,
    targetDatabaseFingerprint: {
      canonicalJsonFormat: CANONICAL_JSON_FORMAT,
      sha256: binding.targetDatabaseFingerprintSha256,
    },
  }
  validateMetadataObject(metadata)
  const metadataBytes = `${canonicalJson(metadata)}\n`
  writePrivateFile(options.output, metadataBytes)
  try {
    writePrivateFile(options.bindingOutput, `${sha256Text(metadataBytes)}\n`)
  } catch (error) {
    try { unlinkSync(options.output) } catch {}
    throw error
  }
}

function looksLikeClaimedJsonContract(raw) {
  const trimmed = raw.trimStart()
  return trimmed.startsWith('{') ||
    trimmed.startsWith('[') ||
    /(?:^|\n)format=foodsystems-database-backup-metadata(?:\n|$)/u.test(raw) ||
    /(?:^|\n)version=2(?:\n|$)/u.test(raw)
}

function verifyMetadata(options) {
  const requireV2 = options.requireV2 === '1'
  if (!['0', '1'].includes(options.requireV2)) fail('--require-v2 must be 0 or 1')
  const metadataPath = `${options.dump}.metadata`
  const bindingPath = `${metadataPath}.sha256`
  if (!existsSync(metadataPath)) {
    if (existsSync(bindingPath)) fail(`metadata binding exists without metadata: ${bindingPath}`)
    if (requireV2) fail('metadata v2 is required but the backup metadata sidecar is missing')
    return 'legacy'
  }

  const raw = readFileSync(metadataPath, 'utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    if (requireV2 || looksLikeClaimedJsonContract(raw)) {
      fail('metadata v2 is required or claimed, but the metadata sidecar is not valid JSON')
    }
    return 'legacy'
  }
  if (!isPlainObject(parsed) || parsed.format !== METADATA_FORMAT || parsed.version !== METADATA_VERSION) {
    if (requireV2 || parsed?.format === METADATA_FORMAT || parsed?.version === METADATA_VERSION) {
      fail(`metadata must declare ${METADATA_FORMAT} version ${METADATA_VERSION}`)
    }
    return 'legacy'
  }

  const metadata = validateMetadataObject(parsed)
  if (!existsSync(bindingPath)) fail(`metadata SHA-256 binding is missing: ${bindingPath}`)
  const expectedMetadataSha256 = readFileSync(bindingPath, 'utf8').trim()
  if (!SHA256_PATTERN.test(expectedMetadataSha256)) {
    fail('metadata SHA-256 binding must contain exactly one lowercase digest')
  }
  if (sha256Text(raw) !== expectedMetadataSha256) fail('metadata SHA-256 binding mismatch')
  if (sha256File(options.dump) !== metadata.dump.sha256) fail('metadata dump SHA-256 does not match backup bytes')
  if (statSync(options.dump).size !== metadata.dump.bytes) fail('metadata dump byte count does not match backup bytes')
  return 'v2'
}

function verifyRestoredSnapshot(options) {
  const metadata = validateMetadataObject(parseJsonFile(options.metadata, 'backup metadata'))
  const binding = snapshotBinding(parseJsonFile(options.snapshot, 'restored database snapshot'))
  if (binding.snapshot.databaseIdentityUuid !== metadata.databaseIdentity.uuid) {
    fail('restored primary DatabaseIdentity UUID does not match metadata v2')
  }
  if (canonicalJson(binding.completedPrismaMigrationLedger) !== canonicalJson(metadata.completedPrismaMigrationLedger)) {
    fail('restored completed Prisma migration ledger does not match metadata v2')
  }
  if (canonicalJson(binding.snapshot.coreCounts) !== canonicalJson(metadata.coreCounts)) {
    fail('restored exact core counts do not match metadata v2')
  }
  if (binding.targetDatabaseFingerprintSha256 !== metadata.targetDatabaseFingerprint.sha256) {
    fail('restored target database fingerprint does not match metadata v2')
  }
  return binding.targetDatabaseFingerprintSha256
}

function validateReceiptPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) fail('RESTORE_RECEIPT_PATH must be absolute')
  if (basename(path) !== basename(path.trim()) || basename(path).length === 0) {
    fail('RESTORE_RECEIPT_PATH must name a file')
  }
  if (existsSync(path)) fail(`RESTORE_RECEIPT_PATH already exists; refusing to overwrite: ${path}`)
  const parent = dirname(path)
  let parentStats
  try {
    parentStats = statSync(parent)
  } catch {
    fail(`RESTORE_RECEIPT_PATH parent directory does not exist: ${parent}`)
  }
  if (!parentStats.isDirectory()) fail('RESTORE_RECEIPT_PATH parent must be a directory')
  if ((parentStats.mode & 0o022) !== 0) {
    fail('RESTORE_RECEIPT_PATH parent must not be group- or world-writable')
  }
}

function optionalExpectedCountsFromEnvironment() {
  const mappings = {
    RESTORE_EXPECTED_DOCUMENT_COUNT: 'Document',
    RESTORE_EXPECTED_SOURCE_CITATION_COUNT: 'SourceCitation',
    RESTORE_EXPECTED_FIELD_CITATION_COUNT: 'FieldCitation',
    RESTORE_EXPECTED_REPORT_COUNT: 'Report',
    RESTORE_EXPECTED_THESIS_COUNT: 'Thesis',
    RESTORE_EXPECTED_SOURCE_DOC_COUNT: 'SourceDoc',
    RESTORE_EXPECTED_LIBRARY_ANALYSIS_COUNT: 'LibraryAnalysisRecord',
    RESTORE_EXPECTED_EVIDENCE_APPRAISAL_COUNT: 'EvidenceAppraisal',
  }
  return Object.fromEntries(Object.entries(mappings).flatMap(([environmentName, relation]) => {
    const raw = process.env[environmentName]
    if (raw === undefined || raw === '') return []
    const value = Number(raw)
    assertSafeNonNegativeInteger(value, environmentName)
    return [[relation, value]]
  }))
}

function publishAtomicPrivateJson(path, value) {
  validateReceiptPath(path)
  const parent = dirname(path)
  const temporaryPath = join(parent, `.${basename(path)}.${process.pid}.${randomUUID()}.tmp`)
  const bytes = `${canonicalJson(value)}\n`
  writePrivateFile(temporaryPath, bytes)
  try {
    linkSync(temporaryPath, path)
  } finally {
    try { unlinkSync(temporaryPath) } catch {}
  }
  const stats = lstatSync(path)
  if (!stats.isFile() || stats.isSymbolicLink() || (stats.mode & 0o077) !== 0) {
    try { unlinkSync(path) } catch {}
    fail('atomic restore receipt publication did not produce a private regular file')
  }
}

function writeReceipt(options) {
  validateReceiptPath(options.path)
  assertSafeText(options.targetDatabase, '--target-database')
  if (!/^foodsystems_restore_[a-z0-9_]+$/u.test(options.targetDatabase)) {
    fail('--target-database is not a validated disposable database name')
  }
  const metadataPath = `${options.dump}.metadata`
  const metadata = validateMetadataObject(parseJsonFile(metadataPath, 'backup metadata'))
  const fingerprint = verifyRestoredSnapshot({ metadata: metadataPath, snapshot: options.snapshot })
  const metadataSha256 = sha256File(metadataPath)
  const bindingSha256 = readFileSync(`${metadataPath}.sha256`, 'utf8').trim()
  if (metadataSha256 !== bindingSha256) fail('metadata SHA-256 changed before receipt publication')
  if (sha256File(options.dump) !== metadata.dump.sha256) fail('dump SHA-256 changed before receipt publication')

  const receipt = {
    format: RECEIPT_FORMAT,
    version: RECEIPT_VERSION,
    completedAtUtc: new Date().toISOString(),
    backup: {
      dumpBytes: metadata.dump.bytes,
      dumpSha256: metadata.dump.sha256,
      metadataSha256,
    },
    databaseIdentity: metadata.databaseIdentity,
    completedPrismaMigrationLedger: metadata.completedPrismaMigrationLedger,
    coreCounts: metadata.coreCounts,
    targetDatabaseFingerprint: {
      canonicalJsonFormat: CANONICAL_JSON_FORMAT,
      sha256: fingerprint,
    },
    checks: {
      archiveChecksumAndCatalog: 'pass',
      restoreCompleted: 'pass',
      requiredRelationsAndNonEmptyData: 'pass',
      constraintsValidated: 'pass',
      indexesReady: 'pass',
      metadataV2Binding: 'pass',
      exactCoreCounts: 'pass',
      databaseIdentity: 'pass',
      completedMigrationLedger: 'pass',
      targetDatabaseFingerprint: 'pass',
      optionalOperatorExpectedCounts: {
        status: 'pass',
        supplied: optionalExpectedCountsFromEnvironment(),
      },
    },
    cleanup: {
      databaseName: options.targetDatabase,
      drop: 'pass',
      databaseAbsenceConfirmed: true,
    },
  }
  publishAtomicPrivateJson(options.path, receipt)
}

function parseOptions(argumentsList) {
  if (argumentsList.length % 2 !== 0) fail('command options must be provided as --name value pairs')
  const options = {}
  for (let index = 0; index < argumentsList.length; index += 2) {
    const key = argumentsList[index]
    const value = argumentsList[index + 1]
    if (!key.startsWith('--') || value === undefined || value.startsWith('--')) {
      fail('command options must be provided as --name value pairs')
    }
    const normalized = key.slice(2).replace(/-([a-z])/gu, (_, letter) => letter.toUpperCase())
    if (Object.hasOwn(options, normalized)) fail(`duplicate option: ${key}`)
    options[normalized] = value
  }
  return options
}

function requireOptions(options, names) {
  const actual = Object.keys(options).sort()
  const expected = [...names].sort()
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`options must be exactly: ${expected.map(name => `--${name.replace(/[A-Z]/gu, letter => `-${letter.toLowerCase()}`)}`).join(', ')}`)
  }
}

function main() {
  const [command, ...argumentsList] = process.argv.slice(2)
  const options = parseOptions(argumentsList)
  if (command === 'build-metadata') {
    requireOptions(options, [
      'bindingOutput',
      'createdAtUtc',
      'dump',
      'dumpBytes',
      'dumpFileName',
      'dumpSha256',
      'output',
      'snapshotAfter',
      'snapshotBefore',
    ])
    buildMetadata(options)
    return
  }
  if (command === 'verify-metadata') {
    requireOptions(options, ['dump', 'requireV2'])
    process.stdout.write(`${verifyMetadata(options)}\n`)
    return
  }
  if (command === 'verify-restored-snapshot') {
    requireOptions(options, ['metadata', 'snapshot'])
    process.stdout.write(`${verifyRestoredSnapshot(options)}\n`)
    return
  }
  if (command === 'validate-receipt-path') {
    requireOptions(options, ['path'])
    validateReceiptPath(options.path)
    return
  }
  if (command === 'write-receipt') {
    requireOptions(options, ['dump', 'path', 'snapshot', 'targetDatabase'])
    writeReceipt(options)
    return
  }
  fail('unknown command; expected build-metadata, verify-metadata, verify-restored-snapshot, validate-receipt-path, or write-receipt')
}

try {
  main()
} catch (error) {
  console.error(`[database-backup-contract] ERROR: ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
}
