import 'dotenv/config'
import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, existsSync, lstatSync, readFileSync, statSync } from 'node:fs'
import { basename, isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { spawnSync } from 'node:child_process'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'
import {
  MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE,
  MATSVINNLOVEN_QUARANTINE_FILE,
  OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
  SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
  SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID,
  SYNTHETIC_MATSVINNLOVEN_THESIS_ID,
  buildMatsvinnlovenIdentityMigrationPlan,
  buildMatsvinnlovenControlledMutationAudit,
  buildOfficialMatsvinnlovenSourceTarget,
  classifyMatsvinnlovenAlreadyAppliedAudit,
  matsvinnlovenControlledMutationOperationKey,
  matsvinnlovenIdentityContractSha256,
  matsvinnlovenIdentityMigrationPlanContract,
  matsvinnlovenIdentityPlanSha256 as planSha256FromContract,
  matsvinnlovenTargetFingerprintSha256,
  sha256MatsvinnlovenJson,
  validateMatsvinnlovenOperatorAuthority,
  validateMatsvinnlovenReleaseEvidence,
  type MatsvinnlovenControlledMutationAuditInput,
  type MatsvinnlovenDocumentTarget,
  type MatsvinnlovenIdentityMigrationPlan,
  type MatsvinnlovenIdentitySnapshot,
  type MatsvinnlovenLibraryTarget,
  type MatsvinnlovenReleaseEvidence,
  type MatsvinnlovenSourceDocRow,
} from '../src/lib/citations/matsvinnloven-identity-migration'

const DESTRUCTIVE_APPLY_ACK = 'DELETE_SYNTHETIC_THESIS_MATSVINNLOVEN_2025'
const ADVISORY_LOCK_KEY = 'foodsystems:matsvinnloven-synthetic-thesis-identity:v1'
const APPLY_RELEASE_BLOCKER =
  'the release-control chain is implemented for review but operator apply enablement remains intentionally disabled'

const thesisSelect = {
  id: true, authors: true, institution: true, year: true, title: true, titleNo: true,
  url: true, synthesis: true, keyFindings: true, tags: true, takeaways: true,
  method: true, awardWinning: true, degree: true, doi: true, isbn: true,
  publisher: true, accessDate: true, documentId: true,
} satisfies Prisma.ThesisSelect

const documentSelect = {
  id: true, slug: true, filePath: true, title: true, author: true, year: true,
  documentType: true, category: true, subcategory: true, country: true,
  content: true, summary: true, url: true, accessedAt: true, archivedUrl: true,
  wordCount: true, tags: true, metadata: true, createdAt: true, updatedAt: true,
} satisfies Prisma.DocumentSelect

const librarySelect = {
  id: true, sourceKind: true, sourceKey: true, documentId: true, sourceDocId: true,
  canonicalPath: true, title: true, status: true, usageRule: true, reviewStatus: true,
  citationReadiness: true, analysisTier: true, aiCard: true, aiSummary: true,
  keyFindings: true, claimCandidates: true, projectImplications: true, gaps: true,
  controlLinks: true, riskFlags: true, contentHash: true, wordCount: true,
  processedAt: true, reviewedAt: true, reviewer: true, createdAt: true, updatedAt: true,
} satisfies Prisma.LibraryAnalysisRecordSelect

const sourceDocSelect = {
  id: true, filename: true, title: true, author: true, year: true, sourceType: true,
  description: true, relevance: true, url: true, isDuplicate: true, doi: true,
  publisher: true, provenanceType: true, accessedAt: true, archivedUrl: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect

type IdentityClient = Pick<PrismaClient,
  | 'thesis' | 'document' | 'libraryAnalysisRecord' | 'sourceDoc'
  | 'documentRef' | 'report' | 'insightDocumentRef' | 'companyDocumentRef'
  | 'actorDocumentRef' | 'sourceCitation' | 'fieldCitation' | 'evidenceAppraisal'
  | 'sourceRef' | 'insight' | 'mediaEntry'
>

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run'])
  for (const argument of argv) {
    if (
      !allowedFlags.has(argument) &&
      !argument.startsWith('--ack=') &&
      !argument.startsWith('--contract-sha256=') &&
      !argument.startsWith('--plan-sha256=') &&
      !argument.startsWith('--backup-file=') &&
      !argument.startsWith('--restore-receipt=') &&
      !argument.startsWith('--operator-id=') &&
      !argument.startsWith('--authorization-ref=') &&
      !argument.startsWith('--database-role=')
    ) throw new Error(`Unknown argument: ${argument}`)
  }
  const apply = argv.includes('--apply')
  if (apply && argv.includes('--dry-run')) throw new Error('--apply and --dry-run are mutually exclusive')
  const singleValue = (prefix: string) => {
    const matches = argv.filter(value => value.startsWith(prefix))
    if (matches.length > 1) throw new Error(`Argument may be supplied only once: ${prefix.slice(0, -1)}`)
    return matches[0]?.slice(prefix.length)
  }
  return {
    apply,
    ack: singleValue('--ack='),
    contractSha256: singleValue('--contract-sha256='),
    planSha256: singleValue('--plan-sha256='),
    backupFile: singleValue('--backup-file='),
    restoreReceipt: singleValue('--restore-receipt='),
    operatorId: singleValue('--operator-id='),
    authorizationRef: singleValue('--authorization-ref='),
    databaseRole: singleValue('--database-role='),
  }
}

function quarantineContent(projectRoot = process.cwd()) {
  return readFileSync(resolve(projectRoot, MATSVINNLOVEN_QUARANTINE_FILE), 'utf8')
}

export async function inspectMatsvinnlovenIdentity(
  client: IdentityClient,
): Promise<MatsvinnlovenIdentitySnapshot> {
  const [
    theses,
    documents,
    sourceDocCandidates,
    thesisCount,
    sourceDocCount,
    reportCount,
  ] = await Promise.all([
    client.thesis.findMany({
      where: { id: SYNTHETIC_MATSVINNLOVEN_THESIS_ID },
      select: thesisSelect,
      orderBy: { id: 'asc' },
    }),
    client.document.findMany({
      where: { id: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID },
      select: documentSelect,
      orderBy: { id: 'asc' },
    }),
    client.sourceDoc.findMany({
      where: {
        OR: [
          { id: OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID },
          { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID },
          // Catch NL/LTI aliases, trailing slashes, query strings and fragments.
          // The plan accepts only one row equal to the exact pinned target.
          { url: { contains: '2025-06-20-103' } },
        ],
      },
      select: sourceDocSelect,
      orderBy: { id: 'asc' },
    }),
    client.thesis.count(),
    client.sourceDoc.count(),
    client.report.count(),
  ])
  const sourceDocIds = sourceDocCandidates.map(row => row.id)
  const [
    libraryAnalysisRecords,
    officialLibraryAnalysisRecords,
    documentRefsFrom,
    documentRefsTo,
    reportBindings,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
    quarantineSourceCitations,
    officialSourceCitations,
    quarantineEvidenceAppraisals,
    officialEvidenceAppraisals,
    sourceRefs,
    insightSourceLinks,
    mediaEntries,
  ] = await Promise.all([
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { id: SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID },
          { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID },
        ],
      },
      select: librarySelect,
      orderBy: { id: 'asc' },
    }),
    client.libraryAnalysisRecord.findMany({
      where: sourceDocIds.length > 0
        ? { sourceDocId: { in: sourceDocIds } }
        : { id: { in: [] } },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.documentRef.findMany({ where: { fromId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.documentRef.findMany({ where: { toId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.report.findMany({ where: { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.insightDocumentRef.findMany({ where: { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.companyDocumentRef.findMany({ where: { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.actorDocumentRef.findMany({ where: { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID }, select: { id: true }, orderBy: { id: 'asc' } }),
    client.sourceCitation.findMany({
      where: { documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.sourceCitation.findMany({
      where: sourceDocIds.length > 0
        ? { sourceDocId: { in: sourceDocIds } }
        : { id: { in: [] } },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: { thesisId: SYNTHETIC_MATSVINNLOVEN_THESIS_ID },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.evidenceAppraisal.findMany({
      where: sourceDocIds.length > 0
        ? { sourceDocId: { in: sourceDocIds } }
        : { id: { in: [] } },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.sourceRef.findMany({
      where: sourceDocIds.length > 0 ? { sourceDocId: { in: sourceDocIds } } : { id: { in: [] } },
      select: { id: true }, orderBy: { id: 'asc' },
    }),
    client.insight.findMany({
      where: sourceDocIds.length > 0 ? { sourceDocLinks: { some: { id: { in: sourceDocIds } } } } : { id: { in: [] } },
      select: { id: true }, orderBy: { id: 'asc' },
    }),
    client.mediaEntry.findMany({
      where: sourceDocIds.length > 0 ? { sourceDocId: { in: sourceDocIds } } : { id: { in: [] } },
      select: { id: true }, orderBy: { id: 'asc' },
    }),
  ])
  const quarantineSourceCitationIds = quarantineSourceCitations.map(row => row.id)
  const officialSourceCitationIds = officialSourceCitations.map(row => row.id)
  const officialSemanticSourceDocIds = [
    ...new Set([OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID, ...sourceDocIds]),
  ]
  const [quarantineFieldCitations, officialFieldCitations] = await Promise.all([
    client.fieldCitation.findMany({
      where: {
        OR: [
          ...(quarantineSourceCitationIds.length > 0
            ? [{ citationId: { in: quarantineSourceCitationIds } }]
            : []),
          { entityType: 'Thesis', entityId: SYNTHETIC_MATSVINNLOVEN_THESIS_ID },
          { entityType: 'Document', entityId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID },
        ],
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
    client.fieldCitation.findMany({
      where: {
        OR: [
          ...(officialSourceCitationIds.length > 0
            ? [{ citationId: { in: officialSourceCitationIds } }]
            : []),
          { entityType: 'SourceDoc', entityId: { in: officialSemanticSourceDocIds } },
        ],
      },
      select: { id: true },
      orderBy: { id: 'asc' },
    }),
  ])
  return {
    theses,
    documents,
    libraryAnalysisRecords,
    sourceDocCandidates,
    corpusCounts: {
      theses: thesisCount,
      sourceDocs: sourceDocCount,
      reports: reportCount,
      totalEvidence: thesisCount + sourceDocCount + reportCount,
    },
    dependencies: {
      documentRefsFrom,
      documentRefsTo,
      reportBindings,
      insightDocumentRefs,
      companyDocumentRefs,
      actorDocumentRefs,
      quarantineSourceCitations,
      quarantineFieldCitations,
      quarantineEvidenceAppraisals,
      officialSourceCitations,
      officialFieldCitations,
      officialEvidenceAppraisals,
      officialLibraryAnalysisRecords,
      sourceRefs,
      insightSourceLinks,
      mediaEntries,
    },
  }
}

export function matsvinnlovenIdentityPlanSha256(plan: MatsvinnlovenIdentityMigrationPlan) {
  return planSha256FromContract(plan)
}

function printPlan(plan: MatsvinnlovenIdentityMigrationPlan, contractDigest: string, digest: string) {
  console.log('Reviewed Matsvinnloven identity migration plan')
  console.log(`Contract scope: ${plan.contractScope}`)
  console.log(`Contract SHA-256: ${contractDigest}`)
  console.log(`State: ${plan.state}`)
  if (plan.pendingState) console.log(`Pending variant: ${plan.pendingState}`)
  console.log(`Plan SHA-256: ${digest}`)
  console.log(`Observed snapshot SHA-256: ${plan.beforeSnapshotSha256}`)
  console.log(`Pinned before snapshot SHA-256: ${plan.pinnedBeforeSnapshotSha256}`)
  console.log(`Official SourceDoc target SHA-256: ${plan.sourceTargetSha256}`)
  console.log(`Official downstream dependency state SHA-256: ${plan.officialDependencyStateSha256}`)
  console.log(`Quarantine file SHA-256: ${plan.quarantineFileSha256}`)
  console.log(
    `Operations: Thesis delete ${plan.summary.thesisDeletes}; SourceDoc create ${plan.summary.sourceDocCreates}; ` +
    `Document quarantine ${plan.summary.documentQuarantines}; Library block ${plan.summary.libraryBlocks}`,
  )
  console.log('External readiness: 0 citations created; 0 appraisals created; 0 SourceDoc-to-Document links created')
  console.log(`Apply release gate: BLOCKED — ${APPLY_RELEASE_BLOCKER}`)
  for (const conflict of plan.conflicts) console.log(`CONFLICT ${conflict.code}: ${conflict.detail}`)
  if (plan.state === 'pending') {
    console.log('DESTRUCTIVE BOUNDARY: applying deletes one Thesis row. Recovery requires the verified backup/restore path.')
  }
}

async function sha256File(path: string) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(path)) hash.update(chunk)
  return hash.digest('hex')
}

type BackupVerificationOptions = {
  now?: Date
  verifierPath?: string
}

const BACKUP_CORE_COUNT_KEYS = [
  'ControlledMutationAudit', 'DatabaseIdentity', 'Document', 'EvidenceAppraisal',
  'FieldCitation', 'LibraryAnalysisRecord', 'Report', 'SourceCitation', 'SourceDoc', 'Thesis',
] as const

const SHA256_PATTERN = /^[0-9a-f]{64}$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/

function exactObject(value: unknown, keys: readonly string[], label: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`${label} must be a JSON object`)
  const record = value as Record<string, unknown>
  if (JSON.stringify(Object.keys(record).sort()) !== JSON.stringify([...keys].sort())) {
    throw new Error(`${label} has an unexpected schema`)
  }
  return record
}

function exactSha256(value: unknown, label: string) {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) throw new Error(`${label} must be a lowercase SHA-256`)
  return value
}

function exactUuid(value: unknown, label: string) {
  if (typeof value !== 'string' || !UUID_PATTERN.test(value)) throw new Error(`${label} must be a UUID`)
  return value.toLowerCase()
}

function positiveInteger(value: unknown, label: string) {
  if (!Number.isSafeInteger(value) || Number(value) <= 0) throw new Error(`${label} must be a positive safe integer`)
  return Number(value)
}

function utcTimestamp(value: unknown, label: string) {
  if (typeof value !== 'string' || !ISO_UTC_PATTERN.test(value)) throw new Error(`${label} must be a UTC ISO timestamp`)
  const date = new Date(value)
  if (Number.isNaN(date.valueOf())) throw new Error(`${label} must be a UTC ISO timestamp`)
  return date
}

function recentTimestamp(value: unknown, label: string, now: Date) {
  const date = utcTimestamp(value, label)
  const ageMs = now.valueOf() - date.valueOf()
  if (ageMs < -5 * 60 * 1000 || ageMs > 24 * 60 * 60 * 1000) {
    throw new Error(`${label} must not be future-dated or older than 24 hours`)
  }
  return date
}

function parseJsonFile(path: string, label: string) {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown
  } catch {
    throw new Error(`${label} is not valid JSON`)
  }
}

function exactCoreCounts(value: unknown, label: string) {
  const counts = exactObject(value, BACKUP_CORE_COUNT_KEYS, label)
  for (const key of BACKUP_CORE_COUNT_KEYS) {
    if (!Number.isSafeInteger(counts[key]) || Number(counts[key]) < 0) {
      throw new Error(`${label}.${key} must be a non-negative safe integer`)
    }
  }
  if (counts.DatabaseIdentity !== 1) throw new Error(`${label}.DatabaseIdentity must be exactly 1`)
  return Object.fromEntries(BACKUP_CORE_COUNT_KEYS.map(key => [key, Number(counts[key])]))
}

function assertPrivateRegularFile(path: string, label: string) {
  const stats = lstatSync(path)
  if (!stats.isFile() || stats.isSymbolicLink()) throw new Error(`${label} must be a regular file, not a symlink`)
  if ((stats.mode & 0o077) !== 0) throw new Error(`${label} must not be group- or world-accessible`)
}

export async function verifyMatsvinnlovenReleaseEvidence(
  path: string | undefined,
  restoreReceiptPath: string | undefined,
  options: BackupVerificationOptions = {},
): Promise<MatsvinnlovenReleaseEvidence> {
  if (!path || !isAbsolute(path) || !existsSync(path)) {
    throw new Error('--apply requires --backup-file=<existing absolute backup path>')
  }
  if (!restoreReceiptPath || !isAbsolute(restoreReceiptPath) || !existsSync(restoreReceiptPath)) {
    throw new Error('--apply requires --restore-receipt=<existing absolute restore receipt path>')
  }
  const checksumPath = `${path}.sha256`
  const metadataPath = `${path}.metadata`
  const metadataChecksumPath = `${metadataPath}.sha256`
  if (!existsSync(checksumPath) || !existsSync(metadataPath) || !existsSync(metadataChecksumPath)) {
    throw new Error('Backup requires adjacent .sha256, metadata v2, and .metadata.sha256 sidecars')
  }
  for (const [file, label] of [
    [path, 'backup dump'], [checksumPath, 'backup checksum'], [metadataPath, 'backup metadata'],
    [metadataChecksumPath, 'backup metadata binding'], [restoreReceiptPath, 'restore receipt'],
  ] as const) assertPrivateRegularFile(file, label)
  const checksumRaw = readFileSync(checksumPath, 'utf8')
  const checksumMatch = /^([a-f0-9]{64})  ([^/\r\n]+)\n?$/.exec(checksumRaw)
  if (!checksumMatch || checksumMatch[2] !== basename(path)) throw new Error('Backup checksum sidecar is invalid')
  const expectedSha256 = checksumMatch[1]
  const actual = await sha256File(path)
  if (actual !== expectedSha256) throw new Error('Backup checksum mismatch; refusing destructive migration')
  const bytes = statSync(path).size
  const now = options.now ?? new Date()
  const metadataRaw = readFileSync(metadataPath, 'utf8')
  const metadataSha256 = createHash('sha256').update(metadataRaw).digest('hex')
  const metadataChecksumRaw = readFileSync(metadataChecksumPath, 'utf8')
  const expectedMetadataSha256 = metadataChecksumRaw.endsWith('\n')
    ? metadataChecksumRaw.slice(0, -1)
    : metadataChecksumRaw
  if (
    !SHA256_PATTERN.test(expectedMetadataSha256) ||
    !/^([a-f0-9]{64})\n?$/.test(metadataChecksumRaw) ||
    metadataSha256 !== expectedMetadataSha256
  ) {
    throw new Error('Backup metadata SHA-256 binding mismatch')
  }
  const metadata = exactObject(parseJsonFile(metadataPath, 'backup metadata'), [
    'completedPrismaMigrationLedger', 'coreCounts', 'createdAtUtc', 'databaseIdentity',
    'dump', 'format', 'source', 'targetDatabaseFingerprint', 'version',
  ], 'backup metadata')
  if (metadata.format !== 'foodsystems-database-backup-metadata' || metadata.version !== 2) {
    throw new Error('Controlled mutation requires backup metadata v2')
  }
  const createdAt = recentTimestamp(metadata.createdAtUtc, 'backup metadata createdAtUtc', now)
  const source = exactObject(metadata.source, ['databaseName', 'serverVersion'], 'backup metadata source')
  if (typeof source.databaseName !== 'string' || !source.databaseName || typeof source.serverVersion !== 'string' || !source.serverVersion) {
    throw new Error('Backup metadata source is incomplete')
  }
  const dump = exactObject(metadata.dump, ['archiveFormat', 'bytes', 'fileName', 'sha256'], 'backup metadata dump')
  if (
    dump.archiveFormat !== 'postgresql-custom' || dump.fileName !== basename(path) ||
    dump.sha256 !== actual || dump.bytes !== bytes
  ) throw new Error('Backup metadata dump binding does not match the exact archive')
  const identity = exactObject(metadata.databaseIdentity, ['key', 'uuid'], 'backup metadata databaseIdentity')
  if (identity.key !== 'primary') throw new Error('Backup metadata requires the primary DatabaseIdentity')
  const databaseIdentityUuid = exactUuid(identity.uuid, 'backup metadata DatabaseIdentity UUID')
  const ledger = exactObject(
    metadata.completedPrismaMigrationLedger,
    ['completedCount', 'sha256'],
    'backup metadata completed migration ledger',
  )
  const completedMigrationCount = positiveInteger(ledger.completedCount, 'completed migration count')
  const completedMigrationLedgerSha256 = exactSha256(ledger.sha256, 'completed migration ledger SHA-256')
  const coreCounts = exactCoreCounts(metadata.coreCounts, 'backup metadata coreCounts')
  const fingerprint = exactObject(
    metadata.targetDatabaseFingerprint,
    ['canonicalJsonFormat', 'sha256'],
    'backup metadata target fingerprint',
  )
  if (fingerprint.canonicalJsonFormat !== 'sorted-keys-v1') throw new Error('Unsupported target fingerprint canonical JSON format')
  const targetFingerprintSha256 = exactSha256(fingerprint.sha256, 'target fingerprint SHA-256')
  const recomputedFingerprint = matsvinnlovenTargetFingerprintSha256({
    completedPrismaMigrationLedger: { completedCount: completedMigrationCount, sha256: completedMigrationLedgerSha256 },
    coreCounts,
    databaseIdentity: { key: 'primary', uuid: databaseIdentityUuid },
  })
  if (recomputedFingerprint !== targetFingerprintSha256) throw new Error('Backup target fingerprint does not match its payload')

  const verifierPath = options.verifierPath ?? resolve(process.cwd(), 'scripts/verify-database-backup.sh')
  const verified = spawnSync(verifierPath, [path], {
    encoding: 'utf8',
    env: {
      ...process.env,
      BACKUP_REQUIRE_METADATA_V2: '1',
      BACKUP_REQUIRED_TABLES: [
        'Document', 'DocumentRef', 'Report', 'Thesis', 'SourceDoc',
        'SourceCitation', 'FieldCitation', 'EvidenceAppraisal',
        'LibraryAnalysisRecord', 'InsightDocumentRef', 'CompanyDocumentRef',
        'ActorDocumentRef', 'SourceRef', 'MediaEntry', '_InsightSourceDoc',
        '_prisma_migrations',
      ].join(' '),
    },
  })
  if (verified.error || verified.status !== 0) {
    throw new Error('Backup structural verification failed; refusing destructive migration')
  }

  const receiptRaw = readFileSync(restoreReceiptPath, 'utf8')
  const restoreReceiptSha256 = createHash('sha256').update(receiptRaw).digest('hex')
  const receipt = exactObject(parseJsonFile(restoreReceiptPath, 'restore receipt'), [
    'backup', 'checks', 'cleanup', 'completedAtUtc', 'completedPrismaMigrationLedger',
    'coreCounts', 'databaseIdentity', 'format', 'targetDatabaseFingerprint', 'version',
  ], 'restore receipt')
  if (receipt.format !== 'foodsystems-database-restore-receipt' || receipt.version !== 1) {
    throw new Error('Controlled mutation requires restore receipt v1')
  }
  const restoredAt = recentTimestamp(receipt.completedAtUtc, 'restore receipt completedAtUtc', now)
  if (restoredAt.valueOf() < createdAt.valueOf()) throw new Error('Restore receipt predates its backup metadata')
  const receiptBackup = exactObject(receipt.backup, ['dumpBytes', 'dumpSha256', 'metadataSha256'], 'restore receipt backup')
  if (receiptBackup.dumpBytes !== bytes || receiptBackup.dumpSha256 !== actual || receiptBackup.metadataSha256 !== metadataSha256) {
    throw new Error('Restore receipt does not bind the exact dump and metadata bytes')
  }
  if (sha256MatsvinnlovenJson(receipt.databaseIdentity) !== sha256MatsvinnlovenJson(metadata.databaseIdentity)) {
    throw new Error('Restore receipt DatabaseIdentity differs from metadata v2')
  }
  if (sha256MatsvinnlovenJson(receipt.completedPrismaMigrationLedger) !== sha256MatsvinnlovenJson(metadata.completedPrismaMigrationLedger)) {
    throw new Error('Restore receipt migration ledger differs from metadata v2')
  }
  if (sha256MatsvinnlovenJson(receipt.coreCounts) !== sha256MatsvinnlovenJson(metadata.coreCounts)) {
    throw new Error('Restore receipt core counts differ from metadata v2')
  }
  if (sha256MatsvinnlovenJson(receipt.targetDatabaseFingerprint) !== sha256MatsvinnlovenJson(metadata.targetDatabaseFingerprint)) {
    throw new Error('Restore receipt target fingerprint differs from metadata v2')
  }
  const checks = exactObject(receipt.checks, [
    'archiveChecksumAndCatalog', 'restoreCompleted', 'requiredRelationsAndNonEmptyData',
    'constraintsValidated', 'indexesReady', 'metadataV2Binding', 'exactCoreCounts',
    'databaseIdentity', 'completedMigrationLedger', 'targetDatabaseFingerprint',
    'optionalOperatorExpectedCounts',
  ], 'restore receipt checks')
  for (const [key, value] of Object.entries(checks)) {
    if (key === 'optionalOperatorExpectedCounts') continue
    if (value !== 'pass') throw new Error(`Restore receipt check ${key} did not pass`)
  }
  const optionalCounts = exactObject(
    checks.optionalOperatorExpectedCounts,
    ['status', 'supplied'],
    'restore receipt optional expected counts',
  )
  if (optionalCounts.status !== 'pass' || !optionalCounts.supplied || typeof optionalCounts.supplied !== 'object' || Array.isArray(optionalCounts.supplied)) {
    throw new Error('Restore receipt optional expected counts check did not pass')
  }
  const allowedOptionalCounts = new Set([
    'Document', 'SourceCitation', 'FieldCitation', 'Report', 'Thesis',
    'SourceDoc', 'LibraryAnalysisRecord', 'EvidenceAppraisal',
  ])
  for (const [key, value] of Object.entries(optionalCounts.supplied as Record<string, unknown>)) {
    if (!allowedOptionalCounts.has(key) || !Number.isSafeInteger(value) || Number(value) < 0) {
      throw new Error(`Restore receipt optional expected count ${key} is invalid`)
    }
  }
  const cleanup = exactObject(receipt.cleanup, ['databaseAbsenceConfirmed', 'databaseName', 'drop'], 'restore receipt cleanup')
  if (
    typeof cleanup.databaseName !== 'string' || !/^foodsystems_restore_[a-z0-9_]+$/.test(cleanup.databaseName) ||
    cleanup.drop !== 'pass' || cleanup.databaseAbsenceConfirmed !== true
  ) throw new Error('Restore receipt does not prove disposable database cleanup and absence')

  if (
    await sha256File(path) !== actual || statSync(path).size !== bytes ||
    createHash('sha256').update(readFileSync(metadataPath, 'utf8')).digest('hex') !== metadataSha256 ||
    createHash('sha256').update(readFileSync(restoreReceiptPath, 'utf8')).digest('hex') !== restoreReceiptSha256 ||
    readFileSync(checksumPath, 'utf8') !== checksumRaw ||
    readFileSync(metadataChecksumPath, 'utf8') !== metadataChecksumRaw
  ) throw new Error('Release evidence changed during verification')

  return validateMatsvinnlovenReleaseEvidence({
    backupSha256: actual,
    backupBytes: bytes,
    backupMetadataSha256: metadataSha256,
    restoreReceiptSha256,
    databaseIdentityUuid,
    completedMigrationCount,
    completedMigrationLedgerSha256,
    targetFingerprintSha256,
    backupCreatedAtUtc: createdAt.toISOString(),
    restoreCompletedAtUtc: restoredAt.toISOString(),
  })
}

/** @deprecated Use verifyMatsvinnlovenReleaseEvidence with an explicit receipt path. */
export async function verifyMatsvinnlovenBackupReceipt(
  path: string | undefined,
  options: BackupVerificationOptions & { restoreReceiptPath?: string } = {},
) {
  return verifyMatsvinnlovenReleaseEvidence(path, options.restoreReceiptPath, options)
}

type MatsvinnlovenTargetReleaseControlState = {
  databaseIdentityUuid: string
  completedMigrationCount: number
  completedMigrationLedgerSha256: string
  targetFingerprintSha256: string
  databaseRole: string
  canInsertAudit: boolean
  transactionIsolation: string
}

export async function inspectMatsvinnlovenTargetReleaseControl(
  transaction: Pick<Prisma.TransactionClient, '$queryRaw'>,
): Promise<MatsvinnlovenTargetReleaseControlState> {
  const identities = await transaction.$queryRaw<Array<{ key: string; identityUuid: string }>>(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid"
    FROM "DatabaseIdentity"
    ORDER BY "key"
    FOR KEY SHARE
  `)
  if (
    identities.length !== 1 || identities[0].key !== 'primary' ||
    !UUID_PATTERN.test(identities[0].identityUuid)
  ) throw new Error('Target must contain exactly one primary DatabaseIdentity UUID')
  const databaseIdentityUuid = identities[0].identityUuid.toLowerCase()

  const snapshotRows = await transaction.$queryRaw<Array<{ payload: unknown }>>(Prisma.sql`
    WITH completed_migrations AS (
      SELECT
        id,
        checksum,
        to_char(finished_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "finishedAt",
        migration_name AS "migrationName",
        logs,
        NULL::text AS "rolledBackAt",
        to_char(started_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "startedAt",
        applied_steps_count::integer AS "appliedStepsCount"
      FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
      ORDER BY migration_name, id
    )
    SELECT jsonb_build_object(
      'migrationLedger', (
        SELECT jsonb_agg(to_jsonb(completed_migrations) ORDER BY "migrationName", id)
        FROM completed_migrations
      ),
      'coreCounts', jsonb_build_object(
        'ControlledMutationAudit', (SELECT count(*) FROM "ControlledMutationAudit"),
        'DatabaseIdentity', (SELECT count(*) FROM "DatabaseIdentity"),
        'Document', (SELECT count(*) FROM "Document"),
        'EvidenceAppraisal', (SELECT count(*) FROM "EvidenceAppraisal"),
        'FieldCitation', (SELECT count(*) FROM "FieldCitation"),
        'LibraryAnalysisRecord', (SELECT count(*) FROM "LibraryAnalysisRecord"),
        'Report', (SELECT count(*) FROM "Report"),
        'SourceCitation', (SELECT count(*) FROM "SourceCitation"),
        'SourceDoc', (SELECT count(*) FROM "SourceDoc"),
        'Thesis', (SELECT count(*) FROM "Thesis")
      )
    ) AS payload
  `)
  if (snapshotRows.length !== 1) throw new Error('Target fingerprint query returned an unexpected row count')
  const payload = exactObject(snapshotRows[0].payload, ['coreCounts', 'migrationLedger'], 'target fingerprint payload')
  if (!Array.isArray(payload.migrationLedger) || payload.migrationLedger.length === 0) {
    throw new Error('Target has no completed Prisma migration ledger')
  }
  const completedMigrationCount = payload.migrationLedger.length
  const completedMigrationLedgerSha256 = sha256MatsvinnlovenJson(payload.migrationLedger)
  const coreCounts = exactCoreCounts(payload.coreCounts, 'target coreCounts')
  const targetFingerprintSha256 = matsvinnlovenTargetFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: completedMigrationCount,
      sha256: completedMigrationLedgerSha256,
    },
    coreCounts,
    databaseIdentity: { key: 'primary', uuid: databaseIdentityUuid },
  })

  const roleRows = await transaction.$queryRaw<Array<{
    databaseRole: string
    canInsertAudit: boolean
    transactionIsolation: string
  }>>(Prisma.sql`
    SELECT
      current_user::text AS "databaseRole",
      has_table_privilege(current_user, 'public."ControlledMutationAudit"', 'INSERT') AS "canInsertAudit",
      current_setting('transaction_isolation') AS "transactionIsolation"
  `)
  if (roleRows.length !== 1) throw new Error('Could not inspect the connected database role')
  return {
    databaseIdentityUuid,
    completedMigrationCount,
    completedMigrationLedgerSha256,
    targetFingerprintSha256,
    databaseRole: roleRows[0].databaseRole,
    canInsertAudit: roleRows[0].canInsertAudit,
    transactionIsolation: roleRows[0].transactionIsolation,
  }
}

function assertMatsvinnlovenTargetReleaseControl(
  target: MatsvinnlovenTargetReleaseControlState,
  evidence: MatsvinnlovenReleaseEvidence,
  expectedDatabaseRole: string,
  operatorId: string,
  authorizationRef: string,
) {
  const authority = assertMatsvinnlovenWriterAuthority(
    target,
    expectedDatabaseRole,
    operatorId,
    authorizationRef,
  )
  if (target.databaseIdentityUuid !== evidence.databaseIdentityUuid) {
    throw new Error('Target primary DatabaseIdentity UUID differs from the verified backup/receipt')
  }
  if (
    target.completedMigrationCount !== evidence.completedMigrationCount ||
    target.completedMigrationLedgerSha256 !== evidence.completedMigrationLedgerSha256
  ) throw new Error('Target completed Prisma migration ledger differs from the verified backup/receipt')
  if (target.targetFingerprintSha256 !== evidence.targetFingerprintSha256) {
    throw new Error('Target database fingerprint differs from the verified backup/receipt')
  }
  return authority
}

function assertMatsvinnlovenWriterAuthority(
  target: MatsvinnlovenTargetReleaseControlState,
  expectedDatabaseRole: string,
  operatorId: string,
  authorizationRef: string,
) {
  const authority = validateMatsvinnlovenOperatorAuthority({
    operatorId,
    authorizationRef,
    databaseRole: target.databaseRole,
  })
  if (expectedDatabaseRole !== target.databaseRole) {
    throw new Error('Connected database role differs from exact --database-role')
  }
  if (!target.canInsertAudit) throw new Error('Connected database role cannot append ControlledMutationAudit')
  if (target.transactionIsolation.toLowerCase() !== 'serializable') {
    throw new Error('Controlled mutation must run at Serializable isolation')
  }
  return authority
}

async function inspectMatsvinnlovenAuditCandidates(
  transaction: Pick<Prisma.TransactionClient, '$queryRaw'>,
  input: {
    contractSha256: string
    planSha256: string
    databaseIdentityUuid: string
  },
): Promise<MatsvinnlovenControlledMutationAuditInput[]> {
  const rows = await transaction.$queryRaw<Array<MatsvinnlovenControlledMutationAuditInput>>(Prisma.sql`
    SELECT
      "operationKey", "contractScope", "contractSha256", "planSha256",
      "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256",
      "databaseIdentityUuid"::text AS "databaseIdentityUuid",
      "targetFingerprintSha256", "backupSha256", "backupMetadataSha256",
      "restoreReceiptSha256", "operatorId", "authorizationRef", "databaseRole",
      "mutationSummary"
    FROM "ControlledMutationAudit"
    WHERE "contractScope" = ${MATSVINNLOVEN_IDENTITY_CONTRACT_SCOPE}
      AND "contractSha256" = ${input.contractSha256}
      AND "planSha256" = ${input.planSha256}
      AND "databaseIdentityUuid" = ${input.databaseIdentityUuid}::uuid
    ORDER BY "recordedAt", "id"
    FOR KEY SHARE
  `)
  return rows
}

async function assertNoMatsvinnlovenAuditConflict(
  transaction: Pick<Prisma.TransactionClient, '$queryRaw'>,
  operationKey: string,
) {
  const rows = await transaction.$queryRaw<Array<{ operationKey: string }>>(Prisma.sql`
    SELECT "operationKey"
    FROM "ControlledMutationAudit"
    WHERE "operationKey" = ${operationKey}
    FOR KEY SHARE
  `)
  if (rows.length !== 0) throw new Error('Controlled mutation operationKey already exists; zero rows mutated')
}

async function appendMatsvinnlovenAudit(
  transaction: Pick<Prisma.TransactionClient, '$executeRaw'>,
  audit: MatsvinnlovenControlledMutationAuditInput,
) {
  const inserted = await transaction.$executeRaw(Prisma.sql`
    INSERT INTO "ControlledMutationAudit" (
      "id", "operationKey", "contractScope", "contractSha256", "planSha256",
      "beforeSnapshotSha256", "afterSnapshotSha256", "dependencyStateSha256",
      "databaseIdentityUuid", "targetFingerprintSha256", "backupSha256",
      "backupMetadataSha256", "restoreReceiptSha256", "operatorId",
      "authorizationRef", "databaseRole", "mutationSummary"
    ) VALUES (
      ${randomUUID()}, ${audit.operationKey}, ${audit.contractScope}, ${audit.contractSha256},
      ${audit.planSha256}, ${audit.beforeSnapshotSha256}, ${audit.afterSnapshotSha256},
      ${audit.dependencyStateSha256}, ${audit.databaseIdentityUuid}::uuid,
      ${audit.targetFingerprintSha256}, ${audit.backupSha256}, ${audit.backupMetadataSha256},
      ${audit.restoreReceiptSha256}, ${audit.operatorId}, ${audit.authorizationRef},
      ${audit.databaseRole}, ${JSON.stringify(audit.mutationSummary)}::jsonb
    )
  `)
  if (inserted !== 1) throw new Error('ControlledMutationAudit append failed; transaction rolled back')
}

async function lockIdentityRows(transaction: Prisma.TransactionClient) {
  // SHARE ROW EXCLUSIVE blocks concurrent INSERT/UPDATE/DELETE writers while
  // allowing this transaction's own quarantine update, delete and SourceDoc
  // create. This closes the FieldCitation semantic-reference race (no FK) and
  // the ordinary FK/predicate races across every dependency table inspected.
  await transaction.$executeRaw`
    LOCK TABLE
      "Thesis", "Document", "SourceDoc", "DocumentRef", "Report", "InsightDocumentRef",
      "CompanyDocumentRef", "ActorDocumentRef", "SourceCitation",
      "FieldCitation", "EvidenceAppraisal", "LibraryAnalysisRecord",
      "SourceRef", "MediaEntry", "_InsightSourceDoc", "DatabaseIdentity",
      "ControlledMutationAudit", "_prisma_migrations"
    IN SHARE ROW EXCLUSIVE MODE
  `
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "Thesis" WHERE "id" = ${SYNTHETIC_MATSVINNLOVEN_THESIS_ID} FOR UPDATE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "Document" WHERE "id" = ${SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID} FOR UPDATE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "LibraryAnalysisRecord"
    WHERE "id" = ${SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID}
       OR "documentId" = ${SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID}
       OR "sourceDocId" = ${OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID}
    ORDER BY "id" FOR UPDATE
  `)
  await transaction.$queryRaw(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" = ${OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID}
       OR "documentId" = ${SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID}
       OR "url" LIKE ${'%2025-06-20-103%'}
    ORDER BY "id" FOR UPDATE
  `)
}

function documentUpdateData(target: MatsvinnlovenDocumentTarget): Prisma.DocumentUpdateManyMutationInput {
  return {
    slug: target.slug,
    filePath: target.filePath,
    title: target.title,
    author: target.author,
    year: target.year,
    documentType: target.documentType,
    category: target.category,
    subcategory: target.subcategory,
    country: target.country,
    content: target.content,
    summary: target.summary,
    url: target.url,
    accessedAt: null,
    archivedUrl: target.archivedUrl,
    wordCount: target.wordCount,
    tags: target.tags,
    metadata: target.metadata as Prisma.InputJsonValue,
  }
}

function libraryUpdateData(target: MatsvinnlovenLibraryTarget): Prisma.LibraryAnalysisRecordUpdateManyMutationInput {
  return {
    sourceKind: target.sourceKind,
    sourceKey: target.sourceKey,
    canonicalPath: target.canonicalPath,
    title: target.title,
    status: target.status,
    usageRule: target.usageRule,
    reviewStatus: target.reviewStatus,
    citationReadiness: target.citationReadiness,
    analysisTier: target.analysisTier,
    aiCard: target.aiCard as Prisma.InputJsonValue,
    aiSummary: target.aiSummary,
    keyFindings: target.keyFindings,
    claimCandidates: target.claimCandidates as Prisma.InputJsonValue,
    projectImplications: target.projectImplications,
    gaps: target.gaps as Prisma.InputJsonValue,
    controlLinks: target.controlLinks as Prisma.InputJsonValue,
    riskFlags: target.riskFlags,
    contentHash: target.contentHash,
    wordCount: target.wordCount,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
  }
}

function sourceDocCreateData(target: MatsvinnlovenSourceDocRow): Prisma.SourceDocCreateInput {
  const { documentId: _documentId, ...unlinkedTarget } = target
  return {
    ...unlinkedTarget,
    accessedAt: target.accessedAt ? new Date(target.accessedAt) : null,
  }
}

function enforceMatsvinnlovenApplyDisabled(apply: boolean) {
  if (apply) throw new Error(`--apply is intentionally disabled: ${APPLY_RELEASE_BLOCKER}`)
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  // This stop line is deliberately before DATABASE_URL, backup, receipt, and
  // database access. Removing it requires a separate reviewed release change.
  enforceMatsvinnlovenApplyDisabled(args.apply)

  // Future apply contract. These gates stay executable/testable as library and
  // disposable-db logic, but cannot be reached while the stop line above exists.
  if (args.apply && args.ack !== DESTRUCTIVE_APPLY_ACK) {
    throw new Error(`--apply requires --ack=${DESTRUCTIVE_APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.contractSha256 ?? '')) {
    throw new Error('--apply requires exact --contract-sha256=<64 lowercase hex> from the reviewed contract')
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.planSha256 ?? '')) {
    throw new Error('--apply requires exact --plan-sha256=<64 lowercase hex> from a reviewed dry run')
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const content = quarantineContent()
  const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  try {
    const snapshot = await inspectMatsvinnlovenIdentity(prisma)
    const plan = buildMatsvinnlovenIdentityMigrationPlan(snapshot, sourceTarget, content)
    const contractDigest = matsvinnlovenIdentityContractSha256()
    const digest = matsvinnlovenIdentityPlanSha256(plan)
    printPlan(plan, contractDigest, digest)
    if (plan.state === 'conflict') throw new Error('Matsvinnloven identity conflicts detected; refusing mutation')
    if (!args.apply) {
      if (plan.state === 'pending') {
        console.log(
          `Dry run only. --apply remains intentionally disabled pending a separate operator release. ` +
          `The future gate requires explicit authority, --ack=${DESTRUCTIVE_APPLY_ACK}, ` +
          `--contract-sha256=${contractDigest}, --plan-sha256=${digest}, exact --database-role, ` +
          `and a recent metadata-v2 backup plus verified disposable-restore receipt.`,
        )
      }
      return
    }
    if (contractDigest !== args.contractSha256) throw new Error('Current contract differs from reviewed --contract-sha256')
    const requestedAuthority = validateMatsvinnlovenOperatorAuthority({
      operatorId: args.operatorId ?? '',
      authorizationRef: args.authorizationRef ?? '',
      databaseRole: args.databaseRole ?? '',
    })
    if (plan.state === 'already_applied') {
      const classification = await prisma.$transaction(async transaction => {
        await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))`
        await lockIdentityRows(transaction)
        const lockedSnapshot = await inspectMatsvinnlovenIdentity(transaction)
        const lockedAfterPlan = buildMatsvinnlovenIdentityMigrationPlan(lockedSnapshot, sourceTarget, content)
        if (
          lockedAfterPlan.state !== 'already_applied' ||
          matsvinnlovenIdentityPlanSha256(lockedAfterPlan) !== digest
        ) throw new Error('Already-applied identity state changed during receipt inspection')
        const targetReleaseControl = await inspectMatsvinnlovenTargetReleaseControl(transaction)
        assertMatsvinnlovenWriterAuthority(
          targetReleaseControl,
          requestedAuthority.databaseRole,
          requestedAuthority.operatorId,
          requestedAuthority.authorizationRef,
        )
        const candidates = await inspectMatsvinnlovenAuditCandidates(transaction, {
          contractSha256: contractDigest,
          planSha256: args.planSha256!,
          databaseIdentityUuid: targetReleaseControl.databaseIdentityUuid,
        })
        return classifyMatsvinnlovenAlreadyAppliedAudit({
          afterPlan: lockedAfterPlan,
          expectedContractSha256: contractDigest,
          expectedPlanSha256: args.planSha256!,
          databaseIdentityUuid: targetReleaseControl.databaseIdentityUuid,
          candidates,
        })
      }, { isolationLevel: 'Serializable' })
      if (classification.state !== 'receipted_noop') {
        throw new Error(
          `unreceipted_after_state: ${classification.conflicts.join('; ')}; ` +
          `no no-op audit was appended`,
        )
      }
      console.log(`Receipted no-op: exact ControlledMutationAudit ${classification.operationKey} already binds this after state.`)
      return
    }
    if (digest !== args.planSha256) throw new Error('Current plan differs from reviewed --plan-sha256')
    if (!plan.documentTarget || !plan.libraryTarget) throw new Error('Pending plan lacks quarantine targets')
    const releaseEvidence = await verifyMatsvinnlovenReleaseEvidence(
      args.backupFile,
      args.restoreReceipt,
    )

    await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))`
      await lockIdentityRows(transaction)
      const lockedSnapshot = await inspectMatsvinnlovenIdentity(transaction)
      const lockedPlan = buildMatsvinnlovenIdentityMigrationPlan(lockedSnapshot, sourceTarget, content)
      if (
        lockedPlan.state !== 'pending' ||
        matsvinnlovenIdentityPlanSha256(lockedPlan) !== args.planSha256
      ) throw new Error('Identity state changed after planning; zero rows mutated')
      const targetReleaseControl = await inspectMatsvinnlovenTargetReleaseControl(transaction)
      const authority = assertMatsvinnlovenTargetReleaseControl(
        targetReleaseControl,
        releaseEvidence,
        requestedAuthority.databaseRole,
        requestedAuthority.operatorId,
        requestedAuthority.authorizationRef,
      )
      const operationKey = matsvinnlovenControlledMutationOperationKey({
        contractSha256: contractDigest,
        planSha256: args.planSha256,
        databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
        beforeSnapshotSha256: lockedPlan.beforeSnapshotSha256,
      })
      await assertNoMatsvinnlovenAuditConflict(transaction, operationKey)

      const documentBefore = lockedSnapshot.documents[0]
      const libraryBefore = lockedSnapshot.libraryAnalysisRecords[0]
      const documentResult = await transaction.document.updateMany({
        where: {
          id: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
          updatedAt: new Date(documentBefore.updatedAt),
          content: documentBefore.content,
          url: documentBefore.url,
        },
        data: documentUpdateData(lockedPlan.documentTarget!),
      })
      if (documentResult.count !== 1) throw new Error('Document full-snapshot CAS failed; transaction rolled back')

      const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
        where: {
          id: SYNTHETIC_MATSVINNLOVEN_LIBRARY_RECORD_ID,
          updatedAt: new Date(libraryBefore.updatedAt),
          status: libraryBefore.status,
          usageRule: libraryBefore.usageRule,
          contentHash: libraryBefore.contentHash,
        },
        data: libraryUpdateData(lockedPlan.libraryTarget!),
      })
      if (libraryResult.count !== 1) throw new Error('LibraryAnalysisRecord CAS failed; transaction rolled back')

      const thesisBefore = lockedSnapshot.theses[0]
      const deleted = await transaction.thesis.deleteMany({
        where: {
          id: SYNTHETIC_MATSVINNLOVEN_THESIS_ID,
          documentId: SYNTHETIC_MATSVINNLOVEN_DOCUMENT_ID,
          authors: thesisBefore.authors,
          title: thesisBefore.title,
          url: thesisBefore.url,
        },
      })
      if (deleted.count !== 1) throw new Error('Thesis full-snapshot CAS failed; transaction rolled back')

      if (lockedPlan.summary.sourceDocCreates === 1) {
        await transaction.sourceDoc.create({ data: sourceDocCreateData(sourceTarget) })
      }

      const after = await inspectMatsvinnlovenIdentity(transaction)
      const afterPlan = buildMatsvinnlovenIdentityMigrationPlan(after, sourceTarget, content)
      if (afterPlan.state !== 'already_applied' || afterPlan.conflicts.length > 0) {
        throw new Error('Post-apply identity verification failed; transaction rolled back')
      }
      const audit = buildMatsvinnlovenControlledMutationAudit({
        pendingPlan: lockedPlan,
        afterPlan,
        contractSha256: contractDigest,
        planSha256: args.planSha256,
        releaseEvidence,
        authority,
      })
      if (audit.operationKey !== operationKey) throw new Error('Controlled mutation operationKey drifted; transaction rolled back')
      await appendMatsvinnlovenAudit(transaction, audit)
    }, { isolationLevel: 'Serializable' })
    console.log(
      `Applied atomically: synthetic Thesis deleted, historical Document quarantined, LAR blocked, ` +
      `official unlinked SourceDoc ${plan.summary.sourceDocCreates === 1 ? 'created' : 'reused'}.`,
    )
    console.log('No citation or appraisal was created. Thesis recovery requires the verified backup/restore path.')
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false
if (isEntrypoint) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Matsvinnloven identity migration failed')
    process.exitCode = 1
  })
}
