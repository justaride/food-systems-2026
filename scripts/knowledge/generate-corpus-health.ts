import 'dotenv/config'

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  readlinkSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { PrismaPg } from '@prisma/adapter-pg'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import { reports } from '@seeds/reports'
import { sources } from '@seeds/sources'
import { theses } from '@seeds/theses'
import { PrismaClient } from '../../src/generated/prisma/client'
import { loadManagedTranscriptSourceDocIds } from '../../src/lib/citations/academic-corpus-identity'
import {
  inspectLibraryAnalysisRetainedHistory,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT,
} from '../../src/lib/library-analysis-retained-history-contract'
import { candidateLocalFilePaths } from '../../src/lib/local-file-locator'
import { validateVault } from '../../src/lib/obsidian-vault'
import {
  auditSourceCitationArchiveCoverage,
  summarizeSourceCitationArchiveAudit,
  type ArchiveAuditInput,
} from '../audit-source-citation-archive-coverage'

const GENERATOR_VERSION = '1.1.0'
const SCHEMA_VERSION = 'corpus-evidence-health-v1'
const THRESHOLDS_VERSION = 'corpus-health-thresholds-v1'
const SNAPSHOT_DATE = process.env.CORPUS_HEALTH_SNAPSHOT_DATE ?? '2026-07-28'
const OBSERVED_AT = process.env.CORPUS_HEALTH_OBSERVED_AT ?? '2026-07-28T06:38:28.000Z'
const ROOT = process.cwd()

const GENERATOR_PATH = 'scripts/knowledge/generate-corpus-health.ts'
const SCHEMA_PATH = 'knowledge/schema/corpus-evidence-health.schema.v1.json'
const THRESHOLDS_PATH = 'knowledge/health/corpus-health-thresholds.v1.json'
const SOURCE_SNAPSHOTS_PATH = 'knowledge/health/corpus-health-source-snapshots.v1.json'
const SOURCE_SNAPSHOT_HISTORY_PATH = 'knowledge/health/corpus-health-source-snapshot-history.v1.jsonl'
const ASSESSMENTS_PATH = 'knowledge/health/corpus-health-assessments.v1.jsonl'
const CURRENT_PATH = 'knowledge/health/corpus-health-current.v1.json'
const SUMMARY_PATH = 'knowledge/health/corpus-health-summary.v1.json'
const REPORT_PATH = 'knowledge/health/corpus-health-report.v1.md'
const GENERATION_MANIFEST_PATH = 'knowledge/health/corpus-health-generation-manifest.v1.json'

const PROFILE_IDS = [
  'health_profile.internal_discovery',
  'health_profile.internal_analysis',
  'health_profile.external_evidence_support',
  'health_profile.observatory_operations',
] as const

const DIMENSION_IDS = [
  'inventory',
  'provenanceLocator',
  'citationReadiness',
  'appraisal',
  'archive',
  'identity',
  'queueWorkflow',
  'freshnessVintage',
  'structuralIntegrity',
  'humanReview',
  'operationalProof',
  'conflictControl',
  'receiptIntegrity',
  'sourceSnapshotIntegrity',
] as const

const SEMANTIC_BOUNDARY = {
  kind: 'corpus_evidence_health',
  subjectCoverageClaim: false,
  mayPromoteCoverageCells: false,
  mayAggregateWithCoverageLedger: false,
  globalScorePermitted: false,
} as const

type JsonObject = Record<string, unknown>
type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue }

type SourceDefinition = {
  snapshotId: string
  surfaceId: string
  path: string
  authorityLayer:
    | 'raw_evidence'
    | 'structured_evidence'
    | 'source_discovery'
    | 'operational_status'
    | 'presentation'
    | 'repository_contract'
  observationMode: 'direct_repository_observation' | 'reported_status_snapshot'
  updatedThrough: string | null
  caveats: string[]
}

type DatabaseRuntime = {
  snapshot: JsonObject
  counts: Record<string, number>
  evidenceIds: Array<{ kind: string; id: string }>
  migrations: Array<{ migration_name: string; checksum: string; finished_at: string | null }>
  citationCounts: Record<string, number>
  fieldSummary: Record<string, number>
  sourceDocSummary: Record<string, number>
  documentRows: Array<{ id: string; filePath: string | null }>
  libraryRows: Array<Record<string, unknown>>
  archiveSummary: ReturnType<typeof summarizeSourceCitationArchiveAudit>
  vintages: Record<string, string | null>
}

type GeneratedBundle = {
  sourceSnapshots: JsonObject
  sourceSnapshotHistory: JsonObject[]
  assessments: JsonObject[]
  current: JsonObject
  summary: JsonObject
  report: string
  generationManifest: JsonObject
  serialized: Record<string, string>
}

const SOURCE_DEFINITIONS: SourceDefinition[] = [
  {
    snapshotId: 'health.snapshot.completion_register',
    surfaceId: 'completion_register',
    path: 'docs/project/status/food-systems-completion-register-2026-07-15.md',
    authorityLayer: 'operational_status',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-15',
    caveats: ['Operational completion is not subject-matter evidence or external readiness.'],
  },
  {
    snapshotId: 'health.snapshot.academic_status',
    surfaceId: 'academic_source_quality_status',
    path: 'research/_status/academic-source-quality-status.json',
    authorityLayer: 'operational_status',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-28T05:32:26.743Z',
    caveats: ['Reproduced on the integrated lineage; regression pass does not imply database identity parity or external readiness.'],
  },
  {
    snapshotId: 'health.snapshot.master_status',
    surfaceId: 'masterhjerne_status',
    path: 'public/data/masterhjerne/status.json',
    authorityLayer: 'presentation',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-21T22:41:28.764Z',
    caveats: ['Historical aggregate presentation snapshot; use the current health assessment for operational status.'],
  },
  {
    snapshotId: 'health.snapshot.library_ledger',
    surfaceId: 'library_analysis_ledger',
    path: 'research/_status/library-analysis-ledger.jsonl',
    authorityLayer: 'source_discovery',
    observationMode: 'direct_repository_observation',
    updatedThrough: '2026-07-21',
    caveats: ['AI drafts and approved-internal rows are not independent evidence appraisal.'],
  },
  {
    snapshotId: 'health.snapshot.library_retained_history_contract',
    surfaceId: 'library_retained_history_contract',
    path: 'src/lib/library-analysis-retained-history-contract.ts',
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: [
      'The contract classifies exact persisted rows as non-evidentiary retained history; it does not approve deletion, relinking or external use.',
      'Projection-freshness updates are explicitly outside the retained-history identity contract.',
    ],
  },
  {
    snapshotId: 'health.snapshot.citable_status',
    surfaceId: 'citable_knowledge_base_status',
    path: 'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
    authorityLayer: 'operational_status',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-21',
    caveats: ['Contains explicitly dated historical sections and supersession notes.'],
  },
  {
    snapshotId: 'health.snapshot.remediation_csv',
    surfaceId: 'remediation_backlog_rows',
    path: 'research/REMEDIATION-BACKLOG.csv',
    authorityLayer: 'operational_status',
    observationMode: 'direct_repository_observation',
    updatedThrough: '2026-07-04T18:43:35.583Z',
    caveats: ['Remediation findings are workflow items, not research coverage units.'],
  },
  {
    snapshotId: 'health.snapshot.remediation_report',
    surfaceId: 'remediation_backlog_report',
    path: 'research/REMEDIATION-BACKLOG.md',
    authorityLayer: 'operational_status',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-04T18:43:35.583Z',
    caveats: ['Generated report currently conflicts with an older citable-status count.'],
  },
  {
    snapshotId: 'health.snapshot.citation_queue',
    surfaceId: 'citation_readiness_queue',
    path: 'research/citation-readiness-queue-2026-05-20.csv',
    authorityLayer: 'operational_status',
    observationMode: 'direct_repository_observation',
    updatedThrough: '2026-07-02',
    caveats: ['Queue routing does not imply external readiness or closure.'],
  },
  {
    snapshotId: 'health.snapshot.gap_program',
    surfaceId: 'gap_closure_program',
    path: 'research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md',
    authorityLayer: 'operational_status',
    observationMode: 'reported_status_snapshot',
    updatedThrough: '2026-07-21',
    caveats: ['The programme routes 22 gaps and explicitly closes none.'],
  },
  {
    snapshotId: 'health.snapshot.report_seeds',
    surfaceId: 'report_seed_inventory',
    path: 'prisma/seed-data/reports.ts',
    authorityLayer: 'structured_evidence',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Seed identity inventory; presence is not appraisal.'],
  },
  {
    snapshotId: 'health.snapshot.thesis_seeds',
    surfaceId: 'thesis_seed_inventory',
    path: 'prisma/seed-data/theses.ts',
    authorityLayer: 'structured_evidence',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Seed identity inventory; presence is not appraisal.'],
  },
  {
    snapshotId: 'health.snapshot.source_doc_seeds',
    surfaceId: 'source_doc_seed_inventory',
    path: 'prisma/seed-data/sources.ts',
    authorityLayer: 'structured_evidence',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Seed identity inventory includes mixed source classes.'],
  },
  {
    snapshotId: 'health.snapshot.managed_transcript_identity',
    surfaceId: 'managed_transcript_identity_contract',
    path: 'research/landbrukarena_transcripts',
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: [
      'The manifest, local-ASR fallback manifest and referenced transcript-file presence define the expected runtime-managed SourceDoc identity set.',
      'Runtime identity classification explains expected materialization differences; it is not evidence appraisal or external-use approval.',
    ],
  },
  {
    snapshotId: 'health.snapshot.prisma_schema',
    surfaceId: 'head_prisma_schema',
    path: 'prisma/schema.prisma',
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Current HEAD models EvidenceAppraisal; table presence does not imply completed appraisal.'],
  },
  {
    snapshotId: 'health.snapshot.prisma_migrations',
    surfaceId: 'head_migration_ledger',
    path: 'prisma/migrations',
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Directory set is compared exactly with completed database migrations.'],
  },
  {
    snapshotId: 'health.snapshot.obsidian_vault',
    surfaceId: 'obsidian_vault',
    path: 'Food Systems Obsidian',
    authorityLayer: 'presentation',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Vault notes and canvases are navigation artifacts, not researched coverage units.'],
  },
]

const DB_QUERIES = {
  tables: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  migrations: `SELECT migration_name, checksum, finished_at FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL ORDER BY migration_name`,
  counts: `SELECT
    (SELECT COUNT(*)::int FROM "Report") AS reports,
    (SELECT COUNT(*)::int FROM "Thesis") AS theses,
    (SELECT COUNT(*)::int FROM "SourceDoc") AS source_docs,
    (SELECT COUNT(*)::int FROM "Document") AS documents,
    (SELECT COUNT(*)::int FROM "LibraryAnalysisRecord") AS library_analyses,
    (SELECT COUNT(*)::int FROM "SourceCitation") AS source_citations,
    (SELECT COUNT(*)::int FROM "FieldCitation") AS field_citations`,
  evidenceIds: `SELECT 'Report' AS kind, id FROM "Report"
    UNION ALL SELECT 'Thesis' AS kind, id FROM "Thesis"
    UNION ALL SELECT 'SourceDoc' AS kind, id FROM "SourceDoc"
    ORDER BY kind, id`,
  citationCounts: `SELECT "citationReadiness"::text AS readiness, COUNT(*)::int AS count FROM "SourceCitation" GROUP BY 1 ORDER BY 1`,
  fieldSummary: `SELECT
    COUNT(*) FILTER (WHERE NULLIF(BTRIM(COALESCE(fc."claimText", '')), '') IS NOT NULL)::int AS claim_text_rows,
    COUNT(*) FILTER (
      WHERE NULLIF(BTRIM(COALESCE(fc."claimText", '')), '') IS NOT NULL
        AND (NULLIF(BTRIM(COALESCE(sc."pageRef", '')), '') IS NOT NULL OR NULLIF(BTRIM(COALESCE(sc.quote, '')), '') IS NOT NULL)
    )::int AS exact_anchor_rows
    FROM "FieldCitation" fc JOIN "SourceCitation" sc ON sc.id = fc."citationId"`,
  sourceDocSummary: `SELECT
    COUNT(*) FILTER (WHERE NOT "isDuplicate")::int AS active_rows,
    COUNT(*) FILTER (WHERE NOT "isDuplicate" AND NULLIF(BTRIM(COALESCE(url, '')), '') IS NOT NULL)::int AS active_url_rows,
    COUNT(*) FILTER (WHERE NOT "isDuplicate" AND NULLIF(BTRIM(COALESCE(doi, '')), '') IS NOT NULL)::int AS active_doi_rows,
    COUNT(*) FILTER (WHERE NOT "isDuplicate" AND "documentId" IS NOT NULL)::int AS active_document_rows,
    COUNT(*) FILTER (WHERE NOT "isDuplicate" AND NULLIF(BTRIM(COALESCE(url, '')), '') IS NULL AND "documentId" IS NULL)::int AS active_without_url_or_document
    FROM "SourceDoc"`,
  documents: `SELECT id, "filePath" FROM "Document" ORDER BY id`,
  library: `SELECT id, "sourceKind", "sourceKey", "documentId", "sourceDocId", title, status, "usageRule", "reviewStatus", "contentHash", "reviewedAt", reviewer, "claimCandidates" FROM "LibraryAnalysisRecord" ORDER BY "sourceKind", "sourceKey"`,
  archive: `SELECT
      sc.id,
      sc."citationReadiness"::text AS "citationReadiness",
      sc.url,
      sc."archivedUrl",
      sc."localPath",
      sc."fileHash",
      sc."contentHash",
      sc."hashAlgorithm",
      sc."documentId",
      sc."sourceDocId",
      d."filePath" AS "documentFilePath",
      d."archivedUrl" AS "documentArchivedUrl",
      sd."archivedUrl" AS "sourceDocArchivedUrl",
      sdd."filePath" AS "sourceDocDocumentFilePath",
      sdd."archivedUrl" AS "sourceDocDocumentArchivedUrl"
    FROM "SourceCitation" sc
    LEFT JOIN "Document" d ON d.id = sc."documentId"
    LEFT JOIN "SourceDoc" sd ON sd.id = sc."sourceDocId"
    LEFT JOIN "Document" sdd ON sdd.id = sd."documentId"
    ORDER BY sc.id`,
  vintages: `SELECT
    (SELECT MAX("updatedAt") FROM "Document") AS document_updated_at,
    (SELECT MAX("updatedAt") FROM "SourceCitation") AS citation_updated_at,
    (SELECT MAX("updatedAt") FROM "LibraryAnalysisRecord") AS library_updated_at`,
} as const

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function canonicalize(value: unknown): JsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Cannot canonicalize a non-finite number')
    return value
  }
  if (typeof value === 'bigint') return Number(value)
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isObject(value)) throw new Error(`Cannot canonicalize ${typeof value}`)
  const result: Record<string, JsonValue> = {}
  for (const key of Object.keys(value).sort()) {
    const item = value[key]
    if (item !== undefined) result[key] = canonicalize(item)
  }
  return result
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalSha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

export function sha256Text(value: string | Buffer): string {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function withContentHash<T extends JsonObject>(value: T): T & { contentHash: string } {
  return { ...value, contentHash: canonicalSha256(value) }
}

function contentHashIsValid(value: JsonObject): boolean {
  const { contentHash, ...payload } = value
  return typeof contentHash === 'string' && contentHash === canonicalSha256(payload)
}

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()
}

function tryGit(args: string[]): string | null {
  try {
    return git(args)
  } catch {
    return null
  }
}

function walkSnapshotEntries(absolutePath: string): Array<{ path: string; kind: string; sizeBytes: number; sha256: string }> {
  const rootStat = lstatSync(absolutePath)
  if (rootStat.isSymbolicLink()) {
    const target = readlinkSync(absolutePath)
    return [{ path: '.', kind: 'symlink', sizeBytes: Buffer.byteLength(target), sha256: sha256Text(target) }]
  }
  if (rootStat.isFile()) {
    const bytes = readFileSync(absolutePath)
    return [{ path: '.', kind: 'file', sizeBytes: bytes.length, sha256: sha256Text(bytes) }]
  }

  const entries: Array<{ path: string; kind: string; sizeBytes: number; sha256: string }> = []
  const visit = (directory: string) => {
    for (const name of readdirSync(directory).sort()) {
      const fullPath = join(directory, name)
      const stat = lstatSync(fullPath)
      if (stat.isDirectory()) {
        visit(fullPath)
      } else if (stat.isSymbolicLink()) {
        const target = readlinkSync(fullPath)
        entries.push({
          path: relative(absolutePath, fullPath),
          kind: 'symlink',
          sizeBytes: Buffer.byteLength(target),
          sha256: sha256Text(target),
        })
      } else if (stat.isFile()) {
        const bytes = readFileSync(fullPath)
        entries.push({
          path: relative(absolutePath, fullPath),
          kind: 'file',
          sizeBytes: bytes.length,
          sha256: sha256Text(bytes),
        })
      }
    }
  }
  visit(absolutePath)
  return entries
}

function snapshotSource(definition: SourceDefinition, baseCommit: string): JsonObject {
  const absolutePath = resolve(ROOT, definition.path)
  if (!existsSync(absolutePath)) throw new Error(`Missing health source: ${definition.path}`)
  const stat = lstatSync(absolutePath)
  const entries = walkSnapshotEntries(absolutePath)
  const gitObjectId = tryGit(['rev-parse', `${baseCommit}:${definition.path}`])
  const gitObjectType = gitObjectId ? tryGit(['cat-file', '-t', gitObjectId]) : null
  const trackedDifference = git(['diff', '--name-only', baseCommit, '--', definition.path])
  const untrackedDifference = git(['ls-files', '--others', '--exclude-standard', '--', definition.path])
  const commitDate = tryGit(['log', '-1', '--format=%cI', baseCommit, '--', definition.path])
  return {
    snapshotId: definition.snapshotId,
    surfaceId: definition.surfaceId,
    path: definition.path,
    kind: stat.isDirectory() ? 'directory' : stat.isSymbolicLink() ? 'symlink' : 'file',
    authorityLayer: definition.authorityLayer,
    observationMode: definition.observationMode,
    baseCommit,
    gitObjectId,
    gitObjectType,
    sha256: entries.length === 1 && entries[0]?.path === '.' ? entries[0].sha256 : canonicalSha256(entries),
    sizeBytes: entries.reduce((sum, entry) => sum + entry.sizeBytes, 0),
    fileCount: entries.length,
    workingTreeState: trackedDifference || untrackedDifference ? 'differs_from_base_commit' : 'matches_base_commit',
    commitDate,
    updatedThrough: definition.updatedThrough ?? commitDate,
    caveats: definition.caveats,
  }
}

function numberValue(value: unknown): number {
  if (typeof value === 'number') return value
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'string' && value.trim() !== '') return Number(value)
  return 0
}

function stringDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString()
  return typeof value === 'string' && value ? value : null
}

function redactDatabaseIdentity(connectionString: string): { locator: string; identityHash: string } {
  let identityMaterial = connectionString
  try {
    const parsed = new URL(connectionString)
    identityMaterial = `${parsed.protocol}//${parsed.hostname}:${parsed.port || 'default'}${parsed.pathname}`
  } catch {
    // Hash the opaque value without ever persisting or printing it.
  }
  return {
    locator: 'postgresql://<redacted>',
    identityHash: sha256Text(identityMaterial),
  }
}

async function queryDatabase(baseCommit: string): Promise<DatabaseRuntime> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required for corpus-health generation')

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY')
        const tables = (await tx.$queryRawUnsafe(DB_QUERIES.tables)) as Array<{ table_name: string }>
        const tableSet = new Set(tables.map((row) => row.table_name))
        const migrations = (await tx.$queryRawUnsafe(DB_QUERIES.migrations)) as Array<Record<string, unknown>>
        const countRows = (await tx.$queryRawUnsafe(DB_QUERIES.counts)) as Array<Record<string, unknown>>
        const evidenceIds = (await tx.$queryRawUnsafe(DB_QUERIES.evidenceIds)) as Array<Record<string, unknown>>
        const citationCountRows = (await tx.$queryRawUnsafe(DB_QUERIES.citationCounts)) as Array<Record<string, unknown>>
        const fieldRows = (await tx.$queryRawUnsafe(DB_QUERIES.fieldSummary)) as Array<Record<string, unknown>>
        const sourceDocRows = (await tx.$queryRawUnsafe(DB_QUERIES.sourceDocSummary)) as Array<Record<string, unknown>>
        const documentRows = (await tx.$queryRawUnsafe(DB_QUERIES.documents)) as Array<Record<string, unknown>>
        const libraryRows = (await tx.$queryRawUnsafe(DB_QUERIES.library)) as Array<Record<string, unknown>>
        const archiveRows = (await tx.$queryRawUnsafe(DB_QUERIES.archive)) as Array<Record<string, unknown>>
        const vintageRows = (await tx.$queryRawUnsafe(DB_QUERIES.vintages)) as Array<Record<string, unknown>>
        const evidenceAppraisalRows = tableSet.has('EvidenceAppraisal')
          ? ((await tx.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "EvidenceAppraisal"')) as Array<Record<string, unknown>>)
          : []
        const controlledMutationRows = tableSet.has('ControlledMutationAudit')
          ? ((await tx.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "ControlledMutationAudit"')) as Array<Record<string, unknown>>)
          : []

        return {
          tables,
          migrations,
          countRows,
          evidenceIds,
          citationCountRows,
          fieldRows,
          sourceDocRows,
          documentRows,
          libraryRows,
          archiveRows,
          vintageRows,
          evidenceAppraisalRows,
          controlledMutationRows,
        }
      },
      { isolationLevel: 'RepeatableRead', maxWait: 20_000, timeout: 120_000 },
    )

    const countsRow = result.countRows[0] ?? {}
    const counts = {
      reports: numberValue(countsRow.reports),
      theses: numberValue(countsRow.theses),
      sourceDocs: numberValue(countsRow.source_docs),
      documents: numberValue(countsRow.documents),
      libraryAnalyses: numberValue(countsRow.library_analyses),
      sourceCitations: numberValue(countsRow.source_citations),
      fieldCitations: numberValue(countsRow.field_citations),
      evidenceAppraisals: numberValue(result.evidenceAppraisalRows[0]?.count),
      controlledMutationAudits: numberValue(result.controlledMutationRows[0]?.count),
    }
    counts['totalEvidence' as keyof typeof counts] = counts.reports + counts.theses + counts.sourceDocs

    const citationCounts = Object.fromEntries(
      result.citationCountRows.map((row) => [String(row.readiness), numberValue(row.count)]),
    )
    const fieldRow = result.fieldRows[0] ?? {}
    const fieldSummary = {
      claimTextRows: numberValue(fieldRow.claim_text_rows),
      exactAnchorRows: numberValue(fieldRow.exact_anchor_rows),
    }
    const sourceDocRow = result.sourceDocRows[0] ?? {}
    const sourceDocSummary = {
      activeRows: numberValue(sourceDocRow.active_rows),
      activeUrlRows: numberValue(sourceDocRow.active_url_rows),
      activeDoiRows: numberValue(sourceDocRow.active_doi_rows),
      activeDocumentRows: numberValue(sourceDocRow.active_document_rows),
      activeWithoutUrlOrDocument: numberValue(sourceDocRow.active_without_url_or_document),
    }

    const archiveInput: ArchiveAuditInput[] = result.archiveRows.map((row) => ({
      id: String(row.id),
      citationReadiness: String(row.citationReadiness),
      url: typeof row.url === 'string' ? row.url : null,
      archivedUrl: typeof row.archivedUrl === 'string' ? row.archivedUrl : null,
      localPath: typeof row.localPath === 'string' ? row.localPath : null,
      fileHash: typeof row.fileHash === 'string' ? row.fileHash : null,
      contentHash: typeof row.contentHash === 'string' ? row.contentHash : null,
      hashAlgorithm: typeof row.hashAlgorithm === 'string' ? row.hashAlgorithm : null,
      documentId: typeof row.documentId === 'string' ? row.documentId : null,
      sourceDocId: typeof row.sourceDocId === 'string' ? row.sourceDocId : null,
      document: row.documentId
        ? {
            filePath: typeof row.documentFilePath === 'string' ? row.documentFilePath : null,
            archivedUrl: typeof row.documentArchivedUrl === 'string' ? row.documentArchivedUrl : null,
          }
        : null,
      sourceDoc: row.sourceDocId
        ? {
            archivedUrl: typeof row.sourceDocArchivedUrl === 'string' ? row.sourceDocArchivedUrl : null,
            document: row.sourceDocDocumentFilePath || row.sourceDocDocumentArchivedUrl
              ? {
                  filePath: typeof row.sourceDocDocumentFilePath === 'string' ? row.sourceDocDocumentFilePath : null,
                  archivedUrl: typeof row.sourceDocDocumentArchivedUrl === 'string' ? row.sourceDocDocumentArchivedUrl : null,
                }
              : null,
          }
        : null,
    }))
    const archiveReport = auditSourceCitationArchiveCoverage(archiveInput, {
      localFileExists: (path) => existsSync(isAbsolute(path) ? path : resolve(ROOT, path)),
    })
    const archiveSummary = summarizeSourceCitationArchiveAudit(archiveReport)

    const evidenceIds = result.evidenceIds.map((row) => ({ kind: String(row.kind), id: String(row.id) }))
    const migrations = result.migrations.map((row) => ({
      migration_name: String(row.migration_name),
      checksum: String(row.checksum),
      finished_at: stringDate(row.finished_at),
    }))
    const documentRows = result.documentRows.map((row) => ({
      id: String(row.id),
      filePath: typeof row.filePath === 'string' ? row.filePath : null,
    }))
    const vintagesRow = result.vintageRows[0] ?? {}
    const vintages = {
      documents: stringDate(vintagesRow.document_updated_at),
      citations: stringDate(vintagesRow.citation_updated_at),
      library: stringDate(vintagesRow.library_updated_at),
    }

    const queryResultForHash = canonicalize({
      tables: result.tables,
      migrations,
      counts,
      evidenceIds,
      citationCounts,
      fieldSummary,
      sourceDocSummary,
      documentRows,
      libraryRows: result.libraryRows,
      archiveRows: result.archiveRows,
      vintages,
    })
    const databaseIdentity = redactDatabaseIdentity(connectionString)
    const snapshot = {
      snapshotId: 'health.snapshot.database.local',
      surfaceId: 'local_runtime_database',
      kind: 'database_query',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      environment: 'local',
      locator: databaseIdentity.locator,
      databaseIdentityHash: databaseIdentity.identityHash,
      baseCommit,
      observedAt: OBSERVED_AT,
      transaction: {
        isolationLevel: 'repeatable_read',
        transactionReadOnly: true,
        databaseRoleReadOnlyProven: false,
      },
      queryVersion: 'corpus-health-db-query-v1',
      queryHash: canonicalSha256(DB_QUERIES),
      resultHash: canonicalSha256(queryResultForHash),
      migrationLedgerHash: canonicalSha256(migrations),
      migrationCount: migrations.length,
      latestMigration: migrations.at(-1)?.migration_name ?? null,
      tablesObserved: result.tables.map((row) => row.table_name),
      counts,
      caveats: [
        'Local runtime snapshot only; production parity is not proven.',
        'The transaction was read-only, but the configured database role was not proven read-only.',
        'Migration names and checksums are compared with the pinned repository lineage in the assessment; seed identity parity is assessed separately.',
      ],
    }

    return {
      snapshot,
      counts,
      evidenceIds,
      migrations,
      citationCounts,
      fieldSummary,
      sourceDocSummary,
      documentRows,
      libraryRows: result.libraryRows,
      archiveSummary,
      vintages,
    }
  } finally {
    await prisma.$disconnect()
  }
}

function parseJsonLines(path: string): JsonObject[] {
  return readFileSync(resolve(ROOT, path), 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      const value = JSON.parse(line) as unknown
      if (!isObject(value)) throw new Error(`${path}:${index + 1} is not a JSON object`)
      return value
    })
}

function countBy(rows: JsonObject[], key: string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const row of rows) {
    const value = String(row[key] ?? 'null')
    result[value] = (result[value] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(result).sort(([left], [right]) => left.localeCompare(right)))
}

function fileLineCount(path: string): number {
  const source = readFileSync(resolve(ROOT, path), 'utf8')
  return source.trim() ? source.trimEnd().split(/\r?\n/).length : 0
}

function sourceSnapshotId(surface: string): string {
  return `health.snapshot.${surface}`
}

function pct(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : Number(((numerator / denominator) * 100).toFixed(1))
}

function metric(
  metricId: string,
  label: string,
  value: number | string | boolean | null,
  options: {
    numerator?: number | null
    denominator?: number | null
    unit?: string | null
    subjectVintage?: string | null
    authorityLayer?: string
    observationMode?: string
    sourceSnapshotIds: string[]
    command?: string | null
    caveats?: string[]
    conflictRefs?: string[]
  },
): JsonObject {
  const numerator = options.numerator ?? null
  const denominator = options.denominator ?? null
  return {
    metricId,
    label,
    value,
    numerator,
    denominator,
    percentage: numerator !== null && denominator !== null ? pct(numerator, denominator) : null,
    unit: options.unit ?? null,
    observedAt: OBSERVED_AT,
    subjectVintage: options.subjectVintage ?? null,
    authorityLayer: options.authorityLayer ?? 'operational_status',
    observationMode: options.observationMode ?? 'direct_repository_observation',
    sourceSnapshotIds: options.sourceSnapshotIds,
    command: options.command ?? null,
    caveats: options.caveats ?? [],
    conflictRefs: options.conflictRefs ?? [],
  }
}

function conflictObservation(
  label: string,
  value: number | string | boolean | null,
  observationMode: string,
  snapshotIds: string[],
): JsonObject {
  return { label, value, observationMode, sourceSnapshotIds: snapshotIds }
}

function buildAssessment(
  baseCommit: string,
  sourceSnapshotSetId: string,
  sourceSnapshotIds: string[],
  db: DatabaseRuntime,
  thresholds: JsonObject,
  supersedesId: string | null,
): JsonObject {
  const headMigrations = readdirSync(resolve(ROOT, 'prisma/migrations'))
    .filter((name) => statSync(resolve(ROOT, 'prisma/migrations', name)).isDirectory())
    .sort()
  const dbMigrationNames = db.migrations.map((row) => row.migration_name)
  const dbOnlyMigrations = dbMigrationNames.filter((name) => !headMigrations.includes(name))
  const headOnlyMigrations = headMigrations.filter((name) => !dbMigrationNames.includes(name))
  const headMigrationChecksums = new Map(
    headMigrations.map((name) => {
      const sql = readFileSync(resolve(ROOT, 'prisma/migrations', name, 'migration.sql'))
      return [name, sha256Text(sql).slice('sha256:'.length)]
    }),
  )
  const migrationChecksumMismatches = db.migrations
    .filter((row) => headMigrationChecksums.get(row.migration_name) !== row.checksum)
    .map((row) => row.migration_name)
  const migrationLineageParity = dbOnlyMigrations.length === 0
    && headOnlyMigrations.length === 0
    && migrationChecksumMismatches.length === 0

  const seedIds = new Map<string, Set<string>>([
    ['Report', new Set(reports.map((row) => row.id))],
    ['Thesis', new Set(theses.map((row) => row.id))],
    ['SourceDoc', new Set(sources.map((row) => row.id))],
  ])
  const databaseIds = new Map<string, Set<string>>([
    ['Report', new Set(db.evidenceIds.filter((row) => row.kind === 'Report').map((row) => row.id))],
    ['Thesis', new Set(db.evidenceIds.filter((row) => row.kind === 'Thesis').map((row) => row.id))],
    ['SourceDoc', new Set(db.evidenceIds.filter((row) => row.kind === 'SourceDoc').map((row) => row.id))],
  ])
  const dbOnlyEvidenceIds = [...databaseIds.entries()].flatMap(([kind, ids]) =>
    [...ids].filter((id) => !seedIds.get(kind)?.has(id)).map((id) => `${kind}:${id}`),
  )
  const seedOnlyEvidenceIds = [...seedIds.entries()].flatMap(([kind, ids]) =>
    [...ids].filter((id) => !databaseIds.get(kind)?.has(id)).map((id) => `${kind}:${id}`),
  )
  const declaredManagedRuntimeSourceDocIds = loadManagedTranscriptSourceDocIds(ROOT)
  const managedRuntimeSourceDocIdSet = new Set(declaredManagedRuntimeSourceDocIds)
  const managedRuntimeEvidenceIds = dbOnlyEvidenceIds.filter((identity) => {
    const [kind, id] = identity.split(':', 2)
    return kind === 'SourceDoc' && Boolean(id) && managedRuntimeSourceDocIdSet.has(id)
  })
  const unclassifiedDbOnlyEvidenceIds = dbOnlyEvidenceIds.filter(
    (identity) => !managedRuntimeEvidenceIds.includes(identity),
  )
  const databaseSourceDocIds = databaseIds.get('SourceDoc') ?? new Set<string>()
  const missingManagedRuntimeEvidenceIds = declaredManagedRuntimeSourceDocIds
    .filter((id) => !databaseSourceDocIds.has(id))
    .map((id) => `SourceDoc:${id}`)
  const seedIdentityParity = unclassifiedDbOnlyEvidenceIds.length === 0
    && seedOnlyEvidenceIds.length === 0
    && missingManagedRuntimeEvidenceIds.length === 0

  const libraryLedger = parseJsonLines('research/_status/library-analysis-ledger.jsonl')
  const libraryLedgerKeys = new Set(libraryLedger.map((row) => `${row.sourceKind}:${row.sourceKey}`))
  const databaseLibraryKeys = new Set(db.libraryRows.map((row) => `${row.sourceKind}:${row.sourceKey}`))
  const staleLibraryKeys = [...databaseLibraryKeys].filter((key) => !libraryLedgerKeys.has(key)).sort()
  const inventoryOnlyLibraryKeys = [...libraryLedgerKeys].filter((key) => !databaseLibraryKeys.has(key)).sort()
  const libraryRetainedHistoryInspection = inspectLibraryAnalysisRetainedHistory({
    currentInventory: libraryLedger.map((row) => ({
      sourceKind: String(row.sourceKind),
      sourceKey: String(row.sourceKey),
    })),
    databaseRows: db.libraryRows.map((row) => ({
      id: String(row.id),
      sourceKind: String(row.sourceKind),
      sourceKey: String(row.sourceKey),
      documentId: typeof row.documentId === 'string' ? row.documentId : null,
      sourceDocId: typeof row.sourceDocId === 'string' ? row.sourceDocId : null,
      title: String(row.title),
      status: String(row.status),
      usageRule: String(row.usageRule),
      reviewStatus: String(row.reviewStatus),
      contentHash: typeof row.contentHash === 'string' ? row.contentHash : null,
      reviewedAt: row.reviewedAt instanceof Date || typeof row.reviewedAt === 'string'
        ? row.reviewedAt
        : null,
      reviewer: typeof row.reviewer === 'string' ? row.reviewer : null,
      claimCandidates: row.claimCandidates,
    })),
  })
  const rawLibraryIdentityParity = staleLibraryKeys.length === 0 && inventoryOnlyLibraryKeys.length === 0
  const libraryRetainedHistoryControlled = libraryRetainedHistoryInspection.issues.length === 0
    && libraryRetainedHistoryInspection.summary.currentInventoryRows === libraryLedger.length
    && libraryRetainedHistoryInspection.summary.persistedRows === db.counts.libraryAnalyses
    && libraryRetainedHistoryInspection.summary.livePersistedRows === libraryLedger.length
    && libraryRetainedHistoryInspection.summary.retainedHistoryRows === staleLibraryKeys.length
    && libraryRetainedHistoryInspection.summary.inventoryOnlyRows === 0
    && libraryRetainedHistoryInspection.summary.missingCounterpartRows === 0
  const libraryIdentityParity = rawLibraryIdentityParity || libraryRetainedHistoryControlled
  const libraryConflictStatus = rawLibraryIdentityParity
    ? 'resolved'
    : libraryRetainedHistoryControlled
      ? 'accepted_tension'
      : 'open'
  const libraryStatuses = countBy(libraryLedger, 'status')
  const libraryReviewStatuses = countBy(libraryLedger, 'reviewStatus')
  const namedLibraryReviews = libraryLedger.filter((row) => row.reviewedAt && row.reviewer).length

  const documentResolvedRows = db.documentRows.filter((row) =>
    row.filePath ? candidateLocalFilePaths(row.filePath, ROOT).some((candidate) => existsSync(candidate)) : false,
  ).length

  const academicStatus = JSON.parse(
    readFileSync(resolve(ROOT, 'research/_status/academic-source-quality-status.json'), 'utf8'),
  ) as JsonObject
  const academicScope = isObject(academicStatus.scope) ? academicStatus.scope : {}
  const trackedAcademicSeedTotal = numberValue(academicScope.totalRows)
  const trackedDatabase = isObject(academicScope.database) ? academicScope.database : {}
  const trackedParity = isObject(trackedDatabase.parity) ? trackedDatabase.parity : {}
  const trackedDifferences = Array.isArray(trackedParity.differences) ? trackedParity.differences : []
  const trackedDatabaseOnly = trackedDifferences.reduce((sum, raw) => {
    if (!isObject(raw) || !Array.isArray(raw.databaseOnlyIds)) return sum
    return sum + raw.databaseOnlyIds.length
  }, 0)
  const trackedIdentityCount = (field: string) => trackedDifferences.reduce((sum, raw) => {
    if (!isObject(raw) || !Array.isArray(raw[field])) return sum
    return sum + raw[field].length
  }, 0)
  const trackedSeedOnly = trackedIdentityCount('seedOnlyIds')
  const trackedManagedRuntime = trackedIdentityCount('managedRuntimeIds')
  const trackedUnclassifiedDatabaseOnly = trackedIdentityCount('unclassifiedDatabaseOnlyIds')
  const trackedMissingManagedRuntime = trackedIdentityCount('missingManagedRuntimeIds')
  const trackedIdentityStatus = String(trackedParity.identityStatus ?? 'unknown')

  const identitySets = ['Report', 'Thesis', 'SourceDoc'] as const
  const normalizeIdentityList = (value: unknown): string[] => (
    Array.isArray(value) ? value.map(String).toSorted() : []
  )
  const trackedIdentitySignature = JSON.stringify(
    trackedDifferences
      .filter(isObject)
      .map((difference) => ({
        set: String(difference.set),
        databaseOnlyIds: normalizeIdentityList(difference.databaseOnlyIds),
        seedOnlyIds: normalizeIdentityList(difference.seedOnlyIds),
        managedRuntimeIds: normalizeIdentityList(difference.managedRuntimeIds),
        unclassifiedDatabaseOnlyIds: normalizeIdentityList(difference.unclassifiedDatabaseOnlyIds),
        missingManagedRuntimeIds: normalizeIdentityList(difference.missingManagedRuntimeIds),
      }))
      .toSorted((a, b) => a.set.localeCompare(b.set)),
  )
  const currentIdentitySignature = JSON.stringify(
    identitySets
      .map((set) => {
        const currentSeedIds = seedIds.get(set) ?? new Set<string>()
        const currentDatabaseIds = databaseIds.get(set) ?? new Set<string>()
        const databaseOnlyIds = [...currentDatabaseIds]
          .filter((id) => !currentSeedIds.has(id))
          .toSorted()
        const seedOnlyIds = [...currentSeedIds]
          .filter((id) => !currentDatabaseIds.has(id))
          .toSorted()
        const managedRuntimeIds = set === 'SourceDoc'
          ? databaseOnlyIds.filter((id) => managedRuntimeSourceDocIdSet.has(id))
          : []
        return {
          set,
          databaseOnlyIds,
          seedOnlyIds,
          managedRuntimeIds,
          unclassifiedDatabaseOnlyIds: databaseOnlyIds
            .filter((id) => !managedRuntimeIds.includes(id)),
          missingManagedRuntimeIds: set === 'SourceDoc'
            ? declaredManagedRuntimeSourceDocIds
                .filter((id) => !currentDatabaseIds.has(id))
                .toSorted()
            : [],
        }
      })
      .toSorted((a, b) => a.set.localeCompare(b.set)),
  )
  const trackedIdentitySetsMatchCurrent = trackedIdentitySignature === currentIdentitySignature

  const seedTotal = reports.length + theses.length + sources.length
  const sourceDocUrlCount = sources.filter((row) => typeof row.url === 'string' && row.url.trim()).length
  const regressionGate = isObject(academicStatus.regressionGate)
    ? String(academicStatus.regressionGate.status ?? 'unknown')
    : String(academicStatus.regressionGate ?? 'unknown')
  const currentAcademicSeedAuditPass = regressionGate === 'pass'
  const trackedStatusMatchesCurrent = trackedAcademicSeedTotal === seedTotal
    && trackedDatabaseOnly === dbOnlyEvidenceIds.length
    && trackedSeedOnly === seedOnlyEvidenceIds.length
    && trackedManagedRuntime === managedRuntimeEvidenceIds.length
    && trackedUnclassifiedDatabaseOnly === unclassifiedDbOnlyEvidenceIds.length
    && trackedMissingManagedRuntime === missingManagedRuntimeEvidenceIds.length
    && trackedIdentityStatus === (seedIdentityParity ? 'match' : 'mismatch')
    && trackedIdentitySetsMatchCurrent
  const academicRegressionMatches = trackedStatusMatchesCurrent && regressionGate === 'pass'

  const remediationRows = Math.max(0, fileLineCount('research/REMEDIATION-BACKLOG.csv') - 1)
  const citableStatus = readFileSync(resolve(ROOT, 'research/CITABLE-KNOWLEDGE-BASE-STATUS.md'), 'utf8')
  const olderRemediationMatch = citableStatus.match(/Remediation backlog:\s*([0-9]+) findings total/i)
  const olderRemediationCount = olderRemediationMatch ? Number(olderRemediationMatch[1]) : 0

  const completionRegister = readFileSync(
    resolve(ROOT, 'docs/project/status/food-systems-completion-register-2026-07-15.md'),
    'utf8',
  )
  const reportedVaultGreen = /`vault:check`[^\n]*grønne/i.test(completionRegister)
  const vaultPath = resolve(ROOT, 'Food Systems Obsidian')
  const vaultOptions = {
    requirePresentationAssets: true,
    requireGapMissions: true,
    requireVaultExport: existsSync(resolve(ROOT, 'data/vault-export/manifest.json')),
    requireNoOrphans: true,
    allowedOrphanPaths: ['Welcome.md', '0 Kart/HUB – Kunnskapsdatabasen.md', '0 Kart/Oppsett.md'],
    requirePersonUsageRule: true,
    requireMetadataOnlySources: true,
    requireInsightCandidateGate: true,
  }
  const vaultIssues = validateVault(vaultPath, vaultOptions).issues
  const currentVaultGreen = vaultIssues.length === 0
  const vaultStatusMatches = reportedVaultGreen === currentVaultGreen
  const vaultFiles = walkSnapshotEntries(vaultPath)
  const vaultMarkdown = vaultFiles.filter((entry) => entry.path.endsWith('.md')).length
  const vaultCanvas = vaultFiles.filter((entry) => entry.path.endsWith('.canvas')).length

  const gapProgram = readFileSync(
    resolve(ROOT, 'research/_plans/gap-program-2026-07-21/GAP-LUKKINGSPROGRAM-2026-07-21.md'),
    'utf8',
  )
  const gapIds = new Set([...gapProgram.matchAll(/\| \*\*((?:T|Q)[0-9]+)\*\* \|/g)].map((match) => match[1]))

  const conflictIds = {
    lineage: 'health.conflict.code_db_lineage',
    seedParity: 'health.conflict.seed_database_identity',
    historicalLineage: 'health.conflict.historical_status_foreign_lineage',
    library: 'health.conflict.library_inventory_materialization',
    remediation: 'health.conflict.remediation_vintage',
    vault: 'health.conflict.vault_reported_vs_observed',
    regression: 'health.conflict.academic_regression_reported_vs_head',
  }
  const lineageReceiptId = `health.receipt.lineage_integration.${SNAPSHOT_DATE}.${baseCommit.slice(0, 8)}`
  const academicAuditReceiptId = `health.receipt.academic_audit.${SNAPSHOT_DATE}.${baseCommit.slice(0, 8)}`
  const repositoryValidationReceiptId = `health.receipt.repository_validation.${SNAPSHOT_DATE}.${baseCommit.slice(0, 8)}`
  const hardeningCommit = '407d984d61fb97392dfc25992c54e6e320e54b2d'
  const hardeningCommitIsAncestor = tryGit(['merge-base', '--is-ancestor', hardeningCommit, baseCommit]) !== null
  const receipts: JsonObject[] = [
    {
      receiptId: lineageReceiptId,
      receiptKind: 'machine_execution',
      actorType: 'machine',
      actorId: 'codex',
      recordedAt: OBSERVED_AT,
      decision: 'observed',
      artifactPath: 'prisma/migrations',
      notes: [
        `Pinned base commit ${baseCommit} contains hardening commit ${hardeningCommit}: ${hardeningCommitIsAncestor}.`,
        `Repository/database migration parity: ${migrationLineageParity}; HEAD-only ${headOnlyMigrations.length}; database-only ${dbOnlyMigrations.length}; checksum mismatches ${migrationChecksumMismatches.length}.`,
        'This machine receipt resolves migration-lineage parity only; it does not approve thresholds or close evidence identity, appraisal, archive, human-review or production gates.',
      ],
    },
    {
      receiptId: academicAuditReceiptId,
      receiptKind: 'machine_execution',
      actorType: 'machine',
      actorId: 'codex',
      recordedAt: OBSERVED_AT,
      decision: 'observed',
      artifactPath: 'research/_status/academic-source-quality-status.json',
      notes: [
        `Tracked seed total ${trackedAcademicSeedTotal}; current seed total ${seedTotal}; tracked raw database-only identities ${trackedDatabaseOnly}; current raw database-only identities ${dbOnlyEvidenceIds.length}.`,
        `Classified identity state: ${seedIdentityParity ? 'match' : 'mismatch'}; managed runtime ${managedRuntimeEvidenceIds.length}; unclassified database-only ${unclassifiedDbOnlyEvidenceIds.length}; seed-only ${seedOnlyEvidenceIds.length}; missing managed runtime ${missingManagedRuntimeEvidenceIds.length}.`,
        `Exact normalized classified identity lists match the tracked academic status: ${trackedIdentitySetsMatchCurrent}.`,
        `Academic regression gate: ${regressionGate}; external readiness remains fail-closed independently.`,
      ],
    },
    {
      receiptId: repositoryValidationReceiptId,
      receiptKind: 'machine_execution',
      actorType: 'machine',
      actorId: 'codex',
      recordedAt: OBSERVED_AT,
      decision: 'observed',
      artifactPath: 'knowledge/health/corpus-health-generation-manifest.v1.json',
      notes: [
        `Library identity controlled: ${libraryIdentityParity}; raw parity ${rawLibraryIdentityParity}; live materialized ${libraryRetainedHistoryInspection.summary.livePersistedRows}; retained history ${libraryRetainedHistoryInspection.summary.retainedHistoryRows}; inventory-only ${inventoryOnlyLibraryKeys.length}.`,
        `Retained-history contract ${LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256}; inspection issues ${libraryRetainedHistoryInspection.issues.length}; reported projection-freshness updates ${LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates}.`,
        `Vault status agreement: ${vaultStatusMatches}; current issues ${vaultIssues.length}.`,
      ],
    },
  ]

  const conflicts: JsonObject[] = [
    {
      conflictId: conflictIds.lineage,
      title: migrationLineageParity
        ? 'Repository and local database migration lineages are reconciled'
        : 'Current code and local database have divergent migration lineages',
      severity: 'blocker',
      status: migrationLineageParity ? 'resolved' : 'open',
      description: migrationLineageParity
        ? `HEAD and the local database contain the same ${headMigrations.length} completed migration names and SQL checksums; the integrated lineage includes EvidenceAppraisal and release controls.`
        : `HEAD has ${headMigrations.length} migration directories and the local database has ${db.migrations.length}; HEAD-only ${headOnlyMigrations.length}, database-only ${dbOnlyMigrations.length}, checksum mismatches ${migrationChecksumMismatches.length}.`,
      observations: [
        conflictObservation('HEAD migration directories', headMigrations.length, 'direct_repository_observation', [sourceSnapshotId('prisma_migrations')]),
        conflictObservation('Local database completed migrations', db.migrations.length, 'direct_database_observation', ['health.snapshot.database.local']),
      ],
      resolutionRequired: [
        migrationLineageParity
          ? 'Re-run exact migration-name and SQL-checksum comparison whenever code or database migrations change.'
          : 'Integrate schema and migrations atomically, then regenerate this assessment from a pinned database identity and snapshot.',
      ],
      resolutionReceiptIds: migrationLineageParity ? [lineageReceiptId] : [],
    },
    {
      conflictId: conflictIds.seedParity,
      title: 'Current seed identities and local database evidence identities differ',
      severity: 'blocker',
      status: seedIdentityParity ? 'resolved' : 'open',
      description: seedIdentityParity
        ? `Current seed identities plus ${managedRuntimeEvidenceIds.length} declared runtime-managed SourceDocs reconcile with the database; raw seed and database row totals remain intentionally non-equal.`
        : `Current seeds contain ${seedTotal} evidence records while the database contains ${db.counts.totalEvidence}. The raw difference contains ${managedRuntimeEvidenceIds.length} declared runtime-managed SourceDocs, ${unclassifiedDbOnlyEvidenceIds.length} unclassified database-only identities, ${seedOnlyEvidenceIds.length} seed-only identities and ${missingManagedRuntimeEvidenceIds.length} missing declared runtime identities.`,
      observations: [
        conflictObservation('Current HEAD seed rows', seedTotal, 'direct_repository_observation', [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds')]),
        conflictObservation('Local database evidence rows', db.counts.totalEvidence, 'direct_database_observation', ['health.snapshot.database.local']),
        conflictObservation('Raw database-only identities', dbOnlyEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), 'health.snapshot.database.local']),
        conflictObservation('Declared runtime-managed identities', managedRuntimeEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('managed_transcript_identity'), 'health.snapshot.database.local']),
        conflictObservation('Unclassified database-only identities', unclassifiedDbOnlyEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('managed_transcript_identity'), sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), 'health.snapshot.database.local']),
        conflictObservation('Seed-only identities', seedOnlyEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), 'health.snapshot.database.local']),
        conflictObservation('Missing declared runtime-managed identities', missingManagedRuntimeEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('managed_transcript_identity'), 'health.snapshot.database.local']),
      ],
      resolutionRequired: [
        'Reconcile every unclassified database-only and seed-only identity on the chosen canonical lineage.',
        'Keep the manifest-derived runtime identity set complete and classify it separately from unexplained database drift.',
        'Require classified identity parity before reproducible internal analysis; raw row-count equality is neither necessary nor sufficient when managed runtime identities are declared.',
      ],
      resolutionReceiptIds: seedIdentityParity ? [academicAuditReceiptId] : [],
    },
    {
      conflictId: conflictIds.historicalLineage,
      title: trackedStatusMatchesCurrent
        ? 'Tracked academic status is reproduced on the integrated lineage'
        : 'Tracked academic status describes a different seed lineage',
      severity: 'high',
      status: trackedStatusMatchesCurrent ? 'resolved' : 'open',
      description: trackedStatusMatchesCurrent
        ? `The regenerated academic snapshot and current HEAD both describe ${seedTotal} seed rows, ${dbOnlyEvidenceIds.length} raw database-only identities and the same classified managed-runtime boundary.`
        : `The tracked academic snapshot describes ${trackedAcademicSeedTotal} seed rows and ${trackedDatabaseOnly} raw database-only identities; current HEAD describes ${seedTotal} and ${dbOnlyEvidenceIds.length}, with classified identity components compared separately.`,
      observations: [
        conflictObservation('Tracked status database-only identities', trackedDatabaseOnly, 'reported_status_snapshot', [sourceSnapshotId('academic_status')]),
        conflictObservation('Current HEAD database-only identities', dbOnlyEvidenceIds.length, 'derived_comparison', [sourceSnapshotId('academic_status'), sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), 'health.snapshot.database.local']),
      ],
      resolutionRequired: [
        trackedStatusMatchesCurrent
          ? 'Regenerate the academic status whenever seeds, auditor logic or database identity changes.'
          : 'Regenerate every Gate 1 status artifact from the pinned canonical lineage.',
      ],
      resolutionReceiptIds: trackedStatusMatchesCurrent ? [academicAuditReceiptId] : [],
    },
    {
      conflictId: conflictIds.library,
      title: libraryConflictStatus === 'accepted_tension'
        ? 'Live library identity is exact; persisted retained history is contract-bound'
        : libraryConflictStatus === 'resolved'
          ? 'Derived library inventory and persisted materialization are identical'
          : 'Derived library inventory and persisted materialization differ without a complete contract',
      severity: 'high',
      status: libraryConflictStatus,
      description: libraryConflictStatus === 'accepted_tension'
        ? `All ${libraryLedger.length} current inventory identities are materialized. The additional ${libraryRetainedHistoryInspection.summary.retainedHistoryRows} persisted rows exactly match a hash-bound retained-history contract, have no external-use permission and remain outside the live ledger; the equal count of managed transcript SourceDocs is unrelated.`
        : libraryConflictStatus === 'resolved'
          ? `The tracked inventory and database contain the same ${libraryLedger.length} library identities with no retained extras.`
          : `The tracked inventory has ${libraryLedger.length} rows while the database has ${db.counts.libraryAnalyses}; ${staleLibraryKeys.length} persisted identities are outside the live inventory, ${inventoryOnlyLibraryKeys.length} inventory identities are not materialized, and the retained-history inspection reports ${libraryRetainedHistoryInspection.issues.length} issues.`,
      observations: [
        conflictObservation('Current derived library inventory', libraryLedger.length, 'direct_repository_observation', [sourceSnapshotId('library_ledger')]),
        conflictObservation('Persisted LibraryAnalysisRecord rows', db.counts.libraryAnalyses, 'direct_database_observation', ['health.snapshot.database.local']),
        conflictObservation('Live persisted library identities', libraryRetainedHistoryInspection.summary.livePersistedRows, 'derived_comparison', [sourceSnapshotId('library_ledger'), sourceSnapshotId('library_retained_history_contract'), 'health.snapshot.database.local']),
        conflictObservation('Contract-bound retained-history rows', libraryRetainedHistoryInspection.summary.retainedHistoryRows, 'derived_comparison', [sourceSnapshotId('library_retained_history_contract'), 'health.snapshot.database.local']),
        conflictObservation('Retained-history inspection issues', libraryRetainedHistoryInspection.issues.length, 'derived_comparison', [sourceSnapshotId('library_ledger'), sourceSnapshotId('library_retained_history_contract'), 'health.snapshot.database.local']),
      ],
      resolutionRequired: [
        'Re-run the exact retained-row ID, identity, content-hash, counterpart and external-use contract whenever the inventory, database or retention policy changes.',
        'Keep retained history outside the live ledger and do not delete or relink it without a separately reviewed controlled mutation.',
        `Resolve the separately reported ${LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates} metadata-only projection updates without treating them as retained-history identity drift or evidence approval.`,
      ],
      resolutionReceiptIds: libraryIdentityParity ? [repositoryValidationReceiptId] : [],
    },
    {
      conflictId: conflictIds.remediation,
      title: 'Remediation backlog counts have conflicting vintages',
      severity: 'warning',
      status: 'open',
      description: `The generated remediation backlog reports ${remediationRows} rows, while an older citable-status section reports ${olderRemediationCount}.`,
      observations: [
        conflictObservation('Generated remediation backlog rows', remediationRows, 'direct_repository_observation', [sourceSnapshotId('remediation_csv'), sourceSnapshotId('remediation_report')]),
        conflictObservation('Older citable-status backlog count', olderRemediationCount, 'reported_status_snapshot', [sourceSnapshotId('citable_status')]),
      ],
      resolutionRequired: ['Regenerate or supersede the citable-status summary with an explicit source snapshot and subject vintage.'],
      resolutionReceiptIds: [],
    },
    {
      conflictId: conflictIds.vault,
      title: 'Completion register and current vault validation disagree',
      severity: 'high',
      status: vaultStatusMatches ? 'resolved' : 'open',
      description: vaultStatusMatches
        ? `The completion register and current validator agree on vault gate state ${currentVaultGreen ? 'green' : 'red'}.`
        : `The completion register reports vault:check green=${reportedVaultGreen}, while the current validator reports green=${currentVaultGreen} with ${vaultIssues.length} issues.`,
      observations: [
        conflictObservation('Completion register reports vault gate green', reportedVaultGreen, 'reported_status_snapshot', [sourceSnapshotId('completion_register')]),
        conflictObservation('Current vault validation issues', vaultIssues.length, 'direct_repository_observation', [sourceSnapshotId('obsidian_vault')]),
      ],
      resolutionRequired: [vaultStatusMatches
        ? 'Rerun the same validator configuration whenever vault navigation changes.'
        : `Resolve or explicitly allow the ${vaultIssues.length} reported vault issues, then rerun the same validator configuration.`],
      resolutionReceiptIds: vaultStatusMatches ? [repositoryValidationReceiptId] : [],
    },
    {
      conflictId: conflictIds.regression,
      title: academicRegressionMatches
        ? 'Tracked academic regression gate reproduces on current HEAD'
        : 'Tracked academic regression gate does not reproduce on current HEAD',
      severity: 'high',
      status: academicRegressionMatches ? 'resolved' : 'open',
      description: academicRegressionMatches
        ? `The regenerated academic audit reports ${regressionGate} for the current ${seedTotal}-row seed corpus; SourceDoc URL coverage is ${sourceDocUrlCount}/${sources.length}.`
        : `The tracked academic snapshot reports ${regressionGate}, but it does not match the current seed inventory.`,
      observations: [
        conflictObservation('Tracked academic regression gate', regressionGate, 'reported_status_snapshot', [sourceSnapshotId('academic_status')]),
        conflictObservation('Current HEAD seed audit passes', currentAcademicSeedAuditPass, 'derived_comparison', [sourceSnapshotId('academic_status'), sourceSnapshotId('source_doc_seeds')]),
      ],
      resolutionRequired: ['Rerun npm run audit:academic-source-quality whenever seed data or audit thresholds change.'],
      resolutionReceiptIds: academicRegressionMatches ? [academicAuditReceiptId] : [],
    },
  ]
  const openConflictIds = conflicts
    .filter((item) => item.status !== 'resolved' && item.status !== 'accepted_tension')
    .map((item) => String(item.conflictId))

  const dbSnapshot = ['health.snapshot.database.local']
  const metrics: JsonObject[] = [
    metric('health_metric.head_migrations', 'HEAD migration directories', headMigrations.length, {
      sourceSnapshotIds: [sourceSnapshotId('prisma_migrations')],
      command: 'find prisma/migrations -mindepth 1 -maxdepth 1 -type d',
      conflictRefs: [conflictIds.lineage],
    }),
    metric('health_metric.database_migrations', 'Database completed migrations', db.migrations.length, {
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only query of _prisma_migrations',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      conflictRefs: [conflictIds.lineage],
    }),
    metric('health_metric.migration_lineage_mismatches', 'Migration name or checksum mismatches', headOnlyMigrations.length + dbOnlyMigrations.length + migrationChecksumMismatches.length, {
      numerator: headOnlyMigrations.length + dbOnlyMigrations.length + migrationChecksumMismatches.length,
      denominator: headMigrations.length,
      sourceSnapshotIds: [sourceSnapshotId('prisma_migrations'), ...dbSnapshot],
      command: 'exact migration-name and migration.sql SHA-256 comparison',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.lineage],
      caveats: [
        `HEAD-only migrations: ${headOnlyMigrations.length}.`,
        `Database-only migrations: ${dbOnlyMigrations.length}.`,
        `Checksum mismatches: ${migrationChecksumMismatches.length}.`,
      ],
    }),
    metric('health_metric.head_seed_evidence', 'Current HEAD seed evidence rows', seedTotal, {
      sourceSnapshotIds: [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds')],
      command: 'import seed arrays and count identities',
      authorityLayer: 'structured_evidence',
      conflictRefs: [conflictIds.seedParity, conflictIds.historicalLineage],
    }),
    metric('health_metric.database_evidence', 'Local database evidence rows', db.counts.totalEvidence, {
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only count of Report + Thesis + SourceDoc',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      caveats: ['Mixed evidence records; this is not a count of academic publications.'],
      conflictRefs: [conflictIds.seedParity],
    }),
    metric('health_metric.database_only_evidence_identities', 'Raw database identities absent from current seeds', dbOnlyEvidenceIds.length, {
      sourceSnapshotIds: [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), ...dbSnapshot],
      command: 'set comparison by record kind and stable ID',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.seedParity, conflictIds.historicalLineage],
      caveats: [
        `Declared runtime-managed identities within this raw count: ${managedRuntimeEvidenceIds.length}.`,
        `Unclassified database-only identities: ${unclassifiedDbOnlyEvidenceIds.length}.`,
        `Seed-only identities observed: ${seedOnlyEvidenceIds.length}.`,
      ],
    }),
    metric('health_metric.managed_runtime_evidence_identities', 'Declared runtime-managed database identities', managedRuntimeEvidenceIds.length, {
      sourceSnapshotIds: [sourceSnapshotId('managed_transcript_identity'), ...dbSnapshot],
      command: 'manifest-derived managed runtime SourceDoc identity set comparison',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.seedParity],
      caveats: ['Managed runtime classification explains an expected row-count difference; it does not establish evidence quality or external readiness.'],
    }),
    metric('health_metric.unclassified_database_only_evidence_identities', 'Unclassified database identities absent from seeds', unclassifiedDbOnlyEvidenceIds.length, {
      sourceSnapshotIds: [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), ...dbSnapshot],
      command: 'raw database-only identities minus the manifest-derived managed runtime identity set',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.seedParity],
    }),
    metric('health_metric.missing_managed_runtime_evidence_identities', 'Declared runtime-managed identities absent from the database', missingManagedRuntimeEvidenceIds.length, {
      sourceSnapshotIds: [sourceSnapshotId('managed_transcript_identity'), ...dbSnapshot],
      command: 'manifest-derived managed runtime SourceDoc identity set comparison',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.seedParity],
    }),
    metric('health_metric.seed_only_evidence_identities', 'Seed identities absent from the database', seedOnlyEvidenceIds.length, {
      sourceSnapshotIds: [sourceSnapshotId('report_seeds'), sourceSnapshotId('thesis_seeds'), sourceSnapshotId('source_doc_seeds'), ...dbSnapshot],
      command: 'set comparison by record kind and stable ID',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.seedParity],
      caveats: [`Database-only identities observed: ${dbOnlyEvidenceIds.length}.`],
    }),
    metric('health_metric.library_inventory', 'Current derived library inventory', libraryLedger.length, {
      sourceSnapshotIds: [sourceSnapshotId('library_ledger')],
      command: 'JSONL row count',
      authorityLayer: 'source_discovery',
      conflictRefs: [conflictIds.library],
    }),
    metric('health_metric.library_materialization', 'Persisted library analysis rows', db.counts.libraryAnalyses, {
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only LibraryAnalysisRecord count',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      conflictRefs: [conflictIds.library],
    }),
    metric('health_metric.library_live_materialization', 'Persisted identities matching the current library inventory', libraryRetainedHistoryInspection.summary.livePersistedRows, {
      numerator: libraryRetainedHistoryInspection.summary.livePersistedRows,
      denominator: libraryLedger.length,
      sourceSnapshotIds: [sourceSnapshotId('library_ledger'), sourceSnapshotId('library_retained_history_contract'), ...dbSnapshot],
      command: 'exact sourceKind/sourceKey live-inventory comparison',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.library],
    }),
    metric('health_metric.library_stale_rows', 'Raw persisted library rows absent from the live inventory', staleLibraryKeys.length, {
      sourceSnapshotIds: [sourceSnapshotId('library_ledger'), ...dbSnapshot],
      command: 'sourceKind/sourceKey set comparison',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.library],
      caveats: [
        `Contract-bound retained-history rows: ${libraryRetainedHistoryInspection.summary.retainedHistoryRows}.`,
        `Inventory-only rows observed: ${inventoryOnlyLibraryKeys.length}.`,
        'Raw absence from the live inventory is not unexplained drift when the exact retained-history contract passes.',
      ],
    }),
    metric('health_metric.library_retained_history_rows', 'Contract-bound retained library history rows', libraryRetainedHistoryInspection.summary.retainedHistoryRows, {
      sourceSnapshotIds: [sourceSnapshotId('library_retained_history_contract'), ...dbSnapshot],
      command: 'exact row ID, identity, content hash, counterpart and usage-boundary inspection',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.library],
      caveats: ['Retained history is excluded from the live ledger and cannot be used as evidence or external approval.'],
    }),
    metric('health_metric.library_inventory_only_rows', 'Current library inventory identities absent from persisted rows', inventoryOnlyLibraryKeys.length, {
      sourceSnapshotIds: [sourceSnapshotId('library_ledger'), ...dbSnapshot],
      command: 'sourceKind/sourceKey set comparison',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.library],
    }),
    metric('health_metric.library_retained_history_contract_issues', 'Retained-library-history contract inspection issues', libraryRetainedHistoryInspection.issues.length, {
      sourceSnapshotIds: [sourceSnapshotId('library_ledger'), sourceSnapshotId('library_retained_history_contract'), ...dbSnapshot],
      command: 'fail-closed retained-history contract inspection',
      authorityLayer: 'repository_contract',
      observationMode: 'derived_comparison',
      conflictRefs: [conflictIds.library],
      caveats: libraryRetainedHistoryInspection.issues.length > 0
        ? [...libraryRetainedHistoryInspection.issues]
        : [`Contract hash: ${LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256}.`],
    }),
    metric('health_metric.library_projection_updates_reported', 'Reported metadata-only library projection updates', LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates, {
      sourceSnapshotIds: [sourceSnapshotId('library_retained_history_contract')],
      command: 'read retained-history review context',
      authorityLayer: 'operational_status',
      observationMode: 'reported_status_snapshot',
      conflictRefs: [],
      caveats: [
        'This is a separately reported dry-run freshness count, not a retained-history identity mismatch.',
        'The updates carry no content-hash change or evidence-approval action in the reviewed dry run; rerun the processor before acting.',
      ],
    }),
    metric('health_metric.library_named_reviews', 'Library rows with named completed review', namedLibraryReviews, {
      numerator: namedLibraryReviews,
      denominator: libraryLedger.length,
      sourceSnapshotIds: [sourceSnapshotId('library_ledger')],
      command: 'count rows with reviewer and reviewedAt',
      authorityLayer: 'source_discovery',
      caveats: [`Ledger review statuses: ${JSON.stringify(libraryReviewStatuses)}.`],
    }),
    metric('health_metric.evidence_appraisal', 'Complete current evidence appraisals', db.counts.evidenceAppraisals, {
      numerator: db.counts.evidenceAppraisals,
      denominator: db.counts.totalEvidence,
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only EvidenceAppraisal count',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      caveats: ['Zero appraisal blocks external evidence support regardless of technical citation integrity.'],
    }),
    metric('health_metric.source_citations', 'SourceCitation rows', db.counts.sourceCitations, {
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only SourceCitation count',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.field_citations', 'FieldCitation rows', db.counts.fieldCitations, {
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only FieldCitation count',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.blocked_citations', 'Blocked unsourced citations', db.citationCounts.blocked_unsourced ?? 0, {
      numerator: db.citationCounts.blocked_unsourced ?? 0,
      denominator: db.counts.sourceCitations,
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only citationReadiness aggregation',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.claim_text_rows', 'Field citations with claim text', db.fieldSummary.claimTextRows, {
      numerator: db.fieldSummary.claimTextRows,
      denominator: db.counts.fieldCitations,
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only FieldCitation claimText aggregation',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.exact_claim_anchors', 'Claim-text rows with page or quote locator', db.fieldSummary.exactAnchorRows, {
      numerator: db.fieldSummary.exactAnchorRows,
      denominator: db.fieldSummary.claimTextRows,
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only FieldCitation/SourceCitation locator aggregation',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      caveats: ['Syntactic anchors are not externally qualified while appraisal remains zero.'],
    }),
    metric('health_metric.archive_durable_rows', 'Source citations with durable archive', db.archiveSummary.totals.durableArchiveRows, {
      numerator: db.archiveSummary.totals.durableArchiveRows,
      denominator: db.archiveSummary.totals.rows,
      sourceSnapshotIds: dbSnapshot,
      command: 'pure archive audit over repeatable-read citation rows',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.external_rows_needing_archive', 'External-readiness citations needing archive', db.archiveSummary.byReadiness.citable_external.needsArchive + db.archiveSummary.byReadiness.citable_with_note.needsArchive, {
      numerator: db.archiveSummary.byReadiness.citable_external.needsArchive + db.archiveSummary.byReadiness.citable_with_note.needsArchive,
      denominator: db.archiveSummary.totals.externalReadinessRows,
      sourceSnapshotIds: dbSnapshot,
      command: 'pure archive audit over repeatable-read citation rows',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
      caveats: [`Archive gate: ${db.archiveSummary.gate.status}; blockers: ${db.archiveSummary.gate.blockingCount}.`],
    }),
    metric('health_metric.documents_resolved', 'Document file paths resolving locally', documentResolvedRows, {
      numerator: documentResolvedRows,
      denominator: db.counts.documents,
      sourceSnapshotIds: dbSnapshot,
      command: 'candidateLocalFilePaths resolution against checkout',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.active_source_docs_with_url', 'Active nonduplicate SourceDocs with URL', db.sourceDocSummary.activeUrlRows, {
      numerator: db.sourceDocSummary.activeUrlRows,
      denominator: db.sourceDocSummary.activeRows,
      sourceSnapshotIds: dbSnapshot,
      command: 'read-only SourceDoc aggregation',
      authorityLayer: 'structured_evidence',
      observationMode: 'direct_database_observation',
    }),
    metric('health_metric.current_seed_source_doc_url', 'Current seed SourceDocs with URL', sourceDocUrlCount, {
      numerator: sourceDocUrlCount,
      denominator: sources.length,
      sourceSnapshotIds: [sourceSnapshotId('source_doc_seeds')],
      command: 'npm run audit:academic-source-quality',
      authorityLayer: 'structured_evidence',
      conflictRefs: [conflictIds.regression],
    }),
    metric('health_metric.vault_markdown', 'Obsidian Markdown files', vaultMarkdown, {
      sourceSnapshotIds: [sourceSnapshotId('obsidian_vault')],
      command: 'recursive file inventory',
      authorityLayer: 'presentation',
      caveats: ['Note count is not knowledge-unit or coverage count.'],
    }),
    metric('health_metric.vault_canvas', 'Obsidian canvas files', vaultCanvas, {
      sourceSnapshotIds: [sourceSnapshotId('obsidian_vault')],
      command: 'recursive file inventory',
      authorityLayer: 'presentation',
    }),
    metric('health_metric.vault_issues', 'Current vault validation issues', vaultIssues.length, {
      sourceSnapshotIds: [sourceSnapshotId('obsidian_vault'), sourceSnapshotId('completion_register')],
      command: 'npm run vault:check equivalent read-only validator',
      authorityLayer: 'presentation',
      conflictRefs: [conflictIds.vault],
      caveats: vaultIssues.map((issue) => `${issue.file}: ${issue.message}`),
    }),
    metric('health_metric.gap_program_rows', 'Routed research and quality gaps', gapIds.size, {
      sourceSnapshotIds: [sourceSnapshotId('gap_program')],
      command: 'parse controlled T/Q rows',
      caveats: ['The programme explicitly reports zero newly closed gaps.'],
    }),
    metric('health_metric.gaps_newly_closed', 'Gaps newly closed by programme', 0, {
      numerator: 0,
      denominator: gapIds.size,
      sourceSnapshotIds: [sourceSnapshotId('gap_program')],
      observationMode: 'reported_status_snapshot',
    }),
    metric('health_metric.remediation_rows', 'Current remediation backlog rows', remediationRows, {
      sourceSnapshotIds: [sourceSnapshotId('remediation_csv'), sourceSnapshotId('remediation_report')],
      command: 'CSV row count',
      conflictRefs: [conflictIds.remediation],
    }),
  ]

  const dimensions: JsonObject[] = [
    { dimensionId: 'inventory', state: 'run_floor', verdict: 'pass_with_warnings', metricIds: ['health_metric.library_inventory', 'health_metric.database_evidence', 'health_metric.vault_markdown'], blockerConflictIds: [], limitations: ['Several bounded inventories are enumerated, but no exhaustive whole-corpus universe is declared.'] },
    { dimensionId: 'provenanceLocator', state: 'mixed', verdict: 'degraded', metricIds: ['health_metric.documents_resolved', 'health_metric.exact_claim_anchors'], blockerConflictIds: [], limitations: ['Most claim text lacks page or quote anchors; URL presence alone is insufficient.'] },
    { dimensionId: 'citationReadiness', state: 'mixed', verdict: 'degraded', metricIds: ['health_metric.source_citations', 'health_metric.field_citations', 'health_metric.blocked_citations'], blockerConflictIds: [], limitations: ['Technical citation integrity coexists with blocked rows and zero appraisal.'] },
    { dimensionId: 'appraisal', state: 'none_completed', verdict: 'blocked', metricIds: ['health_metric.evidence_appraisal'], blockerConflictIds: [], limitations: ['No evidence record has complete current appraisal.'] },
    { dimensionId: 'archive', state: 'partial_durable', verdict: 'blocked', metricIds: ['health_metric.archive_durable_rows', 'health_metric.external_rows_needing_archive'], blockerConflictIds: [], limitations: ['The archive gate fails and most external-readiness rows still need durable evidence.'] },
    { dimensionId: 'identity', state: seedIdentityParity && libraryIdentityParity ? 'parity_verified' : 'conflicts_open', verdict: seedIdentityParity && libraryIdentityParity ? 'pass' : 'blocked', metricIds: ['health_metric.database_only_evidence_identities', 'health_metric.managed_runtime_evidence_identities', 'health_metric.unclassified_database_only_evidence_identities', 'health_metric.missing_managed_runtime_evidence_identities', 'health_metric.seed_only_evidence_identities', 'health_metric.library_live_materialization', 'health_metric.library_retained_history_rows', 'health_metric.library_inventory_only_rows', 'health_metric.library_retained_history_contract_issues'], blockerConflictIds: [conflictIds.seedParity, conflictIds.library].filter((id) => openConflictIds.includes(id)), limitations: [migrationLineageParity ? 'Migration identity is reconciled; classified seed/runtime parity and live library identity are assessed independently. Raw row-count equality is not required for declared runtime-managed evidence or contract-bound retained library history.' : 'Migration identity remains unreconciled.'] },
    { dimensionId: 'queueWorkflow', state: 'partially_controlled', verdict: 'pass_with_warnings', metricIds: ['health_metric.gap_program_rows', 'health_metric.gaps_newly_closed', 'health_metric.remediation_rows'], blockerConflictIds: [], limitations: ['Routes exist, but many actions remain source-, method-, owner- or human-gated.'] },
    { dimensionId: 'freshnessVintage', state: 'conflicting_vintages', verdict: 'blocked', metricIds: ['health_metric.remediation_rows', 'health_metric.library_projection_updates_reported'], blockerConflictIds: [conflictIds.remediation, conflictIds.vault].filter((id) => openConflictIds.includes(id)), limitations: ['The academic status is current, but remediation, vault and operational receipts retain different subject vintages; 15 metadata-only library projection updates are reported separately from identity.'] },
    { dimensionId: 'structuralIntegrity', state: 'passed_with_warnings', verdict: 'degraded', metricIds: ['health_metric.vault_issues', 'health_metric.head_migrations', 'health_metric.database_migrations', 'health_metric.migration_lineage_mismatches'], blockerConflictIds: [conflictIds.lineage, conflictIds.vault, conflictIds.regression].filter((id) => openConflictIds.includes(id)), limitations: [migrationLineageParity ? 'Migration structure reproduces exactly; the vault validator still reports separate navigation issues.' : 'Migration structure does not reproduce on the pinned lineage.'] },
    { dimensionId: 'humanReview', state: 'pending', verdict: 'blocked', metricIds: ['health_metric.library_named_reviews', 'health_metric.evidence_appraisal'], blockerConflictIds: [], limitations: ['No named completed library reviews or evidence appraisals were observed.'] },
    { dimensionId: 'operationalProof', state: 'partially_verified', verdict: 'blocked', metricIds: ['health_metric.database_migrations', 'health_metric.migration_lineage_mismatches'], blockerConflictIds: openConflictIds, limitations: ['The local migration lineage is reproducible, but current production parity, fresh restore, complete role-enforced interface proof and required human gates remain outside this receipt.'] },
    { dimensionId: 'conflictControl', state: openConflictIds.length > 0 ? 'open' : 'resolved', verdict: openConflictIds.length > 0 ? 'blocked' : 'pass', metricIds: [], blockerConflictIds: openConflictIds, limitations: [`${conflicts.length - openConflictIds.length} conflict records are receipt-resolved; ${openConflictIds.length} remain open.`] },
    { dimensionId: 'receiptIntegrity', state: 'partial', verdict: 'degraded', metricIds: [], blockerConflictIds: [], limitations: ['Machine receipts cover lineage and current audit observations; they do not satisfy external appraisal, production, human, partner or rights-holder gates.'] },
    { dimensionId: 'sourceSnapshotIntegrity', state: 'hash_bound', verdict: 'pass', metricIds: [], blockerConflictIds: [], limitations: ['This assessment binds file snapshots and the read-only database result to hashes; it does not prove production parity.'] },
  ]

  const profileVerdicts: JsonObject[] = [
    {
      profileId: 'health_profile.internal_discovery',
      verdict: 'ready_with_warnings',
      readyForProfile: true,
      reasonCodes: ['bounded_inventory_available', 'hash_bound_snapshot', 'migration_lineage_reconciled'],
      blockingConflictIds: [],
      checks: [
        { checkId: 'health_check.discovery.inventory', status: 'pass', reason: 'The principal file, seed, ledger, vault and database inventories are discoverable.' },
        { checkId: 'health_check.discovery.locators', status: 'warning', reason: 'Discovery locators exist, but exact claim anchors and durable copies remain incomplete.' },
        { checkId: 'health_check.discovery.snapshot', status: 'pass', reason: 'Every observation is bound to a content or query-result hash.' },
        { checkId: 'health_check.discovery.boundary', status: 'pass', reason: 'Internal discovery is explicitly barred from promoting coverage or external readiness.' },
      ],
    },
    {
      profileId: 'health_profile.internal_analysis',
      verdict: 'degraded',
      readyForProfile: false,
      reasonCodes: [
        migrationLineageParity ? 'migration_lineage_reconciled' : 'migration_lineage_mismatch',
        ...(!seedIdentityParity ? ['seed_identity_mismatch'] : []),
        ...(!libraryIdentityParity ? ['library_identity_mismatch'] : []),
        ...(LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates > 0 ? ['library_projection_freshness_pending'] : []),
        'status_vintage_conflicts',
      ],
      blockingConflictIds: [conflictIds.seedParity, conflictIds.library, conflictIds.remediation, conflictIds.vault].filter((id) => openConflictIds.includes(id)),
      checks: [
        { checkId: 'health_check.analysis.lineage', status: migrationLineageParity ? 'pass' : 'fail', reason: migrationLineageParity ? `All ${headMigrations.length} migration names and SQL checksums match the local database.` : 'Repository and database migrations do not match.' },
        { checkId: 'health_check.analysis.identity', status: seedIdentityParity && libraryIdentityParity ? 'pass' : 'fail', reason: `Evidence identity has ${dbOnlyEvidenceIds.length} raw database-only rows: ${managedRuntimeEvidenceIds.length} declared runtime-managed, ${unclassifiedDbOnlyEvidenceIds.length} unclassified, ${seedOnlyEvidenceIds.length} seed-only and ${missingManagedRuntimeEvidenceIds.length} missing declared-managed. Library identity has ${libraryRetainedHistoryInspection.summary.livePersistedRows}/${libraryLedger.length} live materializations, ${libraryRetainedHistoryInspection.summary.retainedHistoryRows} contract-bound history rows, ${inventoryOnlyLibraryKeys.length} inventory-only rows and ${libraryRetainedHistoryInspection.issues.length} contract issues.` },
        { checkId: 'health_check.analysis.library_projection', status: LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates > 0 ? 'warning' : 'pass', reason: `${LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates} metadata-only projection updates were reported by the reviewed dry run; this is separate from live identity and retained history.` },
        { checkId: 'health_check.analysis.vintage', status: 'warning', reason: 'The academic status now reproduces, while remediation, vault and operational receipts still have mixed vintages.' },
      ],
    },
    {
      profileId: 'health_profile.external_evidence_support',
      verdict: 'blocked',
      readyForProfile: false,
      reasonCodes: ['evidence_appraisal_zero', 'archive_gate_failed', ...(!(seedIdentityParity && libraryIdentityParity) ? ['identity_unreconciled'] : []), 'human_review_pending'],
      blockingConflictIds: [conflictIds.seedParity, conflictIds.library].filter((id) => openConflictIds.includes(id)),
      checks: [
        { checkId: 'health_check.external.appraisal', status: 'fail', reason: `Complete current appraisal is ${db.counts.evidenceAppraisals}/${db.counts.totalEvidence}.` },
        { checkId: 'health_check.external.archive', status: 'fail', reason: `${db.archiveSummary.byReadiness.citable_external.needsArchive + db.archiveSummary.byReadiness.citable_with_note.needsArchive}/${db.archiveSummary.totals.externalReadinessRows} external-readiness citations need durable archive.` },
        { checkId: 'health_check.external.identity', status: migrationLineageParity && seedIdentityParity && libraryIdentityParity ? 'pass' : 'fail', reason: migrationLineageParity && seedIdentityParity && libraryIdentityParity ? 'Migration, classified evidence and library identities are reconciled; this does not satisfy appraisal, archive or human-review gates.' : `Migration parity is ${migrationLineageParity}; classified evidence parity is ${seedIdentityParity}; library parity is ${libraryIdentityParity}.` },
        { checkId: 'health_check.external.human', status: 'fail', reason: 'Required named human appraisal and review receipts are absent.' },
      ],
    },
    {
      profileId: 'health_profile.observatory_operations',
      verdict: 'blocked',
      readyForProfile: false,
      reasonCodes: [migrationLineageParity ? 'migration_lineage_reconciled' : 'migration_lineage_mismatch', ...(!(seedIdentityParity && libraryIdentityParity) ? ['identity_unreconciled'] : []), ...(LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates > 0 ? ['library_projection_freshness_pending'] : []), 'operational_layers_partially_proven', 'receipts_partial', 'conflicts_open'],
      blockingConflictIds: openConflictIds,
      checks: [
        { checkId: 'health_check.operations.reproducibility', status: migrationLineageParity && academicRegressionMatches && seedIdentityParity && libraryIdentityParity ? 'pass' : 'fail', reason: `Migration parity is ${migrationLineageParity}; exact academic identity/status reproduction is ${academicRegressionMatches}; classified seed/runtime parity is ${seedIdentityParity}; controlled live-plus-retained library identity is ${libraryIdentityParity}.` },
        { checkId: 'health_check.operations.backup', status: 'unknown', reason: 'Historical local backup/restore evidence exists, but no fresh production or off-node receipt is bound to this assessment.' },
        { checkId: 'health_check.operations.mcp', status: 'unknown', reason: 'Interface instantiation does not prove live queries or a role-enforced read-only boundary.' },
        { checkId: 'health_check.operations.receipts', status: 'fail', reason: 'Machine lineage receipts are present; required fresh operational and human receipts remain incomplete.' },
      ],
    },
  ]

  const assessmentId = `health.assessment.${SNAPSHOT_DATE}.local.${baseCommit.slice(0, 8)}`
  const payload: JsonObject = {
    schemaVersion: SCHEMA_VERSION,
    recordKind: 'corpus_evidence_health_assessment',
    assessmentId,
    profileDefinitionVersion: THRESHOLDS_VERSION,
    baselineAdoptionStatus: thresholds.adoptionStatus,
    observedAt: OBSERVED_AT,
    recordedAt: OBSERVED_AT,
    baseCommit,
    environment: 'local',
    semanticBoundary: SEMANTIC_BOUNDARY,
    sourceSnapshotSetId,
    sourceSnapshotIds,
    metrics,
    dimensions,
    conflicts,
    receipts,
    profileVerdicts,
    supersedesId,
  }
  return withContentHash(payload)
}

function findMetric(assessment: JsonObject, id: string): JsonObject {
  const metrics = Array.isArray(assessment.metrics) ? assessment.metrics : []
  const match = metrics.find((item) => isObject(item) && item.metricId === id)
  if (!isObject(match)) throw new Error(`Missing metric ${id}`)
  return match
}

function metricNumber(assessment: JsonObject, id: string): number {
  return numberValue(findMetric(assessment, id).value)
}

function buildReport(assessment: JsonObject, db: DatabaseRuntime): string {
  const verdicts = (assessment.profileVerdicts as JsonObject[]) ?? []
  const conflicts = (assessment.conflicts as JsonObject[]) ?? []
  const verdictRows = verdicts
    .map((item) => `| \`${item.profileId}\` | **${String(item.verdict).toUpperCase()}** | ${item.readyForProfile ? 'yes' : 'no'} | ${(item.reasonCodes as string[]).join(', ')} |`)
    .join('\n')
  const conflictRows = conflicts
    .map((item) => `| \`${item.conflictId}\` | ${item.severity} | ${item.status} | ${item.title} |`)
    .join('\n')
  const classifiedEvidenceParity = metricNumber(assessment, 'health_metric.unclassified_database_only_evidence_identities') === 0
    && metricNumber(assessment, 'health_metric.seed_only_evidence_identities') === 0
    && metricNumber(assessment, 'health_metric.missing_managed_runtime_evidence_identities') === 0
  const identityDecision = classifiedEvidenceParity
    ? `Classified evidence identity is reconciled. The raw difference contains ${metricNumber(assessment, 'health_metric.database_only_evidence_identities')} database-only rows, all ${metricNumber(assessment, 'health_metric.managed_runtime_evidence_identities')} of which are declared runtime-managed identities; raw row-count equality is not required.`
    : `Classified evidence identity is not reconciled. The raw ${metricNumber(assessment, 'health_metric.database_only_evidence_identities')} database-only rows comprise ${metricNumber(assessment, 'health_metric.managed_runtime_evidence_identities')} declared runtime-managed and ${metricNumber(assessment, 'health_metric.unclassified_database_only_evidence_identities')} unclassified identities; ${metricNumber(assessment, 'health_metric.seed_only_evidence_identities')} seed-only and ${metricNumber(assessment, 'health_metric.missing_managed_runtime_evidence_identities')} missing declared-managed identities remain.`

  return `# Gate 1 — corpus and evidence health\n\n` +
    `**Assessment:** \`${assessment.assessmentId}\`\n\n` +
    `**Snapshot:** ${SNAPSHOT_DATE}\n\n` +
    `**HEAD:** \`${assessment.baseCommit}\`\n` +
    `**Threshold status:** \`${assessment.baselineAdoptionStatus}\`\n\n` +
    `## Decision\n\n` +
    `**NO-GO for reproducible internal analysis, external evidence support and observatory operation.** Internal discovery is usable only with explicit caveats. Repository and local-database migration names and SQL checksums are reconciled (${metricNumber(assessment, 'health_metric.migration_lineage_mismatches')} mismatches across ${metricNumber(assessment, 'health_metric.head_migrations')} migrations). Current HEAD has ${metricNumber(assessment, 'health_metric.head_seed_evidence')} seed rows and the local database has ${metricNumber(assessment, 'health_metric.database_evidence')} evidence rows. ${identityDecision}\n\n` +
    `This is a corpus/evidence-health assessment, not a food-system coverage assessment. It creates no coverage cells, carries no global score and cannot support a claim that the Nordic food system is fully mapped.\n\n` +
    `## Intended-use verdicts\n\n` +
    `| Profile | Verdict | Ready | Main reason codes |\n|---|---|---:|---|\n${verdictRows}\n\n` +
    `## Critical evidence boundary\n\n` +
    `- Evidence appraisal: **${metricNumber(assessment, 'health_metric.evidence_appraisal')}/${db.counts.totalEvidence}** complete current appraisals.\n` +
    `- Archive durability: **${db.archiveSummary.totals.durableArchiveRows}/${db.archiveSummary.totals.rows}** citations have a durable archive; **${db.archiveSummary.byReadiness.citable_external.needsArchive + db.archiveSummary.byReadiness.citable_with_note.needsArchive}/${db.archiveSummary.totals.externalReadinessRows}** external-readiness citations still need one.\n` +
    `- Exact claim locators: **${db.fieldSummary.exactAnchorRows}/${db.fieldSummary.claimTextRows}** claim-text rows also carry a page or quote locator.\n` +
    `- Library state: **${metricNumber(assessment, 'health_metric.library_live_materialization')}/${metricNumber(assessment, 'health_metric.library_inventory')}** live identities are materialized; the remaining **${metricNumber(assessment, 'health_metric.library_retained_history_rows')}** of **${metricNumber(assessment, 'health_metric.library_materialization')}** persisted rows are exact contract-bound history, with **${metricNumber(assessment, 'health_metric.library_inventory_only_rows')}** inventory-only rows and **${metricNumber(assessment, 'health_metric.library_retained_history_contract_issues')}** contract issues. The separately reported projection-freshness queue contains **${metricNumber(assessment, 'health_metric.library_projection_updates_reported')}** metadata-only updates.\n` +
    `- Vault state: **${metricNumber(assessment, 'health_metric.vault_markdown')}** Markdown notes and **${metricNumber(assessment, 'health_metric.vault_canvas')}** canvases; the current validator reports **${metricNumber(assessment, 'health_metric.vault_issues')}** issues. Counts are navigation signals, not evidence completeness.\n\n` +
    `## Conflict register\n\n` +
    `| Conflict | Severity | Status | Boundary |\n|---|---|---|---|\n${conflictRows}\n\n` +
    `## Resolution sequence\n\n` +
    `1. Keep the receipt-bound 31/31 migration lineage check green as schema and migrations evolve.\n` +
    `2. Reconcile every unclassified database-only, seed-only and missing declared-managed identity while preserving the manifest-derived runtime identity boundary.\n` +
    `3. Keep the ${metricNumber(assessment, 'health_metric.library_live_materialization')}/${metricNumber(assessment, 'health_metric.library_inventory')} live library identity check exact, revalidate all ${metricNumber(assessment, 'health_metric.library_retained_history_rows')} retained-history rows, and close the separate metadata-only projection-freshness queue.\n` +
    `4. Regenerate or supersede the master, remediation and vault status surfaces from explicit pinned vintages.\n` +
    `5. Complete reviewed appraisal and durable archive work for the required external scope.\n` +
    `6. Prove current backup/restore, MCP role enforcement, runtime parity and required human gates with immutable receipts.\n\n` +
    `Gate 2 may now register the thirteen legacy fields as neutral artifact and navigation records because the canonical migration lineage is integrated. Those registrations must remain non-evidentiary and cannot promote coverage until reviewed against exact coverage cells.\n`
}

function walkForbiddenKeys(value: unknown, path = '$', issues: string[] = []): string[] {
  const forbidden = new Set([
    'coverageCellId',
    'coverageCellIds',
    'overallHealthScore',
    'globalHealthScore',
    'weightedScore',
    'aggregateScore',
  ])
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForbiddenKeys(item, `${path}[${index}]`, issues))
  } else if (isObject(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (forbidden.has(key)) issues.push(`${path}.${key} is forbidden in corpus health`)
      walkForbiddenKeys(item, `${path}.${key}`, issues)
    }
  }
  return issues
}

export function validateCorpusHealthAssessment(
  assessment: JsonObject,
  thresholds: JsonObject,
  schema: JsonObject,
): string[] {
  const issues: string[] = []
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  if (!validate(thresholds)) {
    issues.push(`threshold schema: ${ajv.errorsText(validate.errors, { separator: '; ' })}`)
  }
  if (!validate(assessment)) {
    issues.push(`assessment schema: ${ajv.errorsText(validate.errors, { separator: '; ' })}`)
  }

  const thresholdDimensions = Array.isArray(thresholds.dimensionDefinitions) ? thresholds.dimensionDefinitions : []
  const allowedStates = new Map<string, Set<string>>()
  for (const item of thresholdDimensions) {
    if (!isObject(item) || typeof item.dimensionId !== 'string' || !Array.isArray(item.allowedStates)) continue
    allowedStates.set(item.dimensionId, new Set(item.allowedStates.filter((value): value is string => typeof value === 'string')))
  }
  if (canonicalJson([...allowedStates.keys()].sort()) !== canonicalJson([...DIMENSION_IDS].sort())) {
    issues.push('thresholds must define each of the 14 dimensions exactly once')
  }

  const dimensions = Array.isArray(assessment.dimensions) ? assessment.dimensions : []
  const dimensionIds = dimensions.filter(isObject).map((item) => String(item.dimensionId))
  if (new Set(dimensionIds).size !== DIMENSION_IDS.length || canonicalJson([...dimensionIds].sort()) !== canonicalJson([...DIMENSION_IDS].sort())) {
    issues.push('assessment must contain each of the 14 dimensions exactly once')
  }
  for (const item of dimensions) {
    if (!isObject(item)) continue
    const id = String(item.dimensionId)
    if (!allowedStates.get(id)?.has(String(item.state))) issues.push(`${id} has an invalid state ${String(item.state)}`)
  }

  const profileDefinitions = Array.isArray(thresholds.profileDefinitions) ? thresholds.profileDefinitions : []
  const profileDefinitionIds = profileDefinitions.filter(isObject).map((item) => String(item.profileId))
  if (new Set(profileDefinitionIds).size !== PROFILE_IDS.length || canonicalJson([...profileDefinitionIds].sort()) !== canonicalJson([...PROFILE_IDS].sort())) {
    issues.push('thresholds must define each of the four intended-use profiles exactly once')
  }
  const profileVerdicts = Array.isArray(assessment.profileVerdicts) ? assessment.profileVerdicts : []
  const profileVerdictIds = profileVerdicts.filter(isObject).map((item) => String(item.profileId))
  if (new Set(profileVerdictIds).size !== PROFILE_IDS.length || canonicalJson([...profileVerdictIds].sort()) !== canonicalJson([...PROFILE_IDS].sort())) {
    issues.push('assessment must contain each of the four profile verdicts exactly once')
  }

  if (!contentHashIsValid(assessment)) issues.push('assessment contentHash does not match canonical payload')
  issues.push(...walkForbiddenKeys(assessment))
  if (canonicalJson(assessment.semanticBoundary) !== canonicalJson(SEMANTIC_BOUNDARY)) {
    issues.push('assessment semantic boundary can neither claim nor promote subject coverage')
  }

  const metrics = Array.isArray(assessment.metrics) ? assessment.metrics.filter(isObject) : []
  const metricIds = metrics.map((item) => String(item.metricId))
  if (new Set(metricIds).size !== metricIds.length) issues.push('metric IDs must be unique')
  for (const item of metrics) {
    const numerator = item.numerator
    const denominator = item.denominator
    const percentage = item.percentage
    if (typeof numerator === 'number' && typeof denominator === 'number') {
      const expected = pct(numerator, denominator)
      if (percentage !== expected) issues.push(`${String(item.metricId)} percentage does not recompute`)
    }
  }

  const conflicts = Array.isArray(assessment.conflicts) ? assessment.conflicts.filter(isObject) : []
  const conflictIds = new Set(conflicts.map((item) => String(item.conflictId)))
  const receiptIds = new Set(
    (Array.isArray(assessment.receipts) ? assessment.receipts.filter(isObject) : []).map((item) => String(item.receiptId)),
  )
  for (const conflict of conflicts) {
    const resolutions = Array.isArray(conflict.resolutionReceiptIds) ? conflict.resolutionReceiptIds : []
    if (conflict.status === 'resolved' && resolutions.length === 0) {
      issues.push(`${String(conflict.conflictId)} cannot be resolved without a receipt`)
    }
    for (const receiptId of resolutions) {
      if (!receiptIds.has(String(receiptId))) issues.push(`${String(conflict.conflictId)} references missing receipt ${String(receiptId)}`)
    }
  }
  for (const verdict of profileVerdicts) {
    if (!isObject(verdict)) continue
    const blockers = Array.isArray(verdict.blockingConflictIds) ? verdict.blockingConflictIds : []
    for (const blocker of blockers) {
      if (!conflictIds.has(String(blocker))) issues.push(`${String(verdict.profileId)} references missing conflict ${String(blocker)}`)
    }
    const checks = Array.isArray(verdict.checks) ? verdict.checks.filter(isObject) : []
    const hasFailedCheck = checks.some((check) => ['fail', 'unknown'].includes(String(check.status)))
    if (verdict.readyForProfile === true && (blockers.length > 0 || hasFailedCheck)) {
      issues.push(`${String(verdict.profileId)} cannot be ready with blockers or failed/unknown checks`)
    }
  }

  const external = profileVerdicts.find((item) => isObject(item) && item.profileId === 'health_profile.external_evidence_support')
  if (isObject(external) && external.readyForProfile === true) {
    const appraisal = metrics.find((item) => item.metricId === 'health_metric.evidence_appraisal')
    const archiveNeed = metrics.find((item) => item.metricId === 'health_metric.external_rows_needing_archive')
    if (!appraisal || appraisal.numerator !== appraisal.denominator) issues.push('external readiness requires complete appraisal')
    if (!archiveNeed || archiveNeed.numerator !== 0) issues.push('external readiness requires zero required archive gaps')
    const humanReview = dimensions.find((item) => isObject(item) && item.dimensionId === 'humanReview')
    if (!isObject(humanReview) || humanReview.state !== 'approved') issues.push('external readiness requires approved human review')
  }
  return issues
}

export function validateCorpusHealthBundle(bundle: {
  sourceSnapshots: JsonObject
  sourceSnapshotHistory: JsonObject[]
  assessments: JsonObject[]
  current: JsonObject
  summary: JsonObject
  generationManifest?: JsonObject
}): string[] {
  const issues: string[] = []
  if (!contentHashIsValid(bundle.sourceSnapshots)) issues.push('source snapshot-set contentHash mismatch')
  for (const snapshotSet of bundle.sourceSnapshotHistory) {
    if (!contentHashIsValid(snapshotSet)) {
      issues.push(`${String(snapshotSet.sourceSnapshotSetId)} source snapshot-set contentHash mismatch`)
    }
  }
  if (!contentHashIsValid(bundle.current)) issues.push('current pointer contentHash mismatch')
  if (!contentHashIsValid(bundle.summary)) issues.push('summary contentHash mismatch')
  if (bundle.generationManifest && !contentHashIsValid(bundle.generationManifest)) issues.push('generation manifest contentHash mismatch')

  const sourceSnapshotSetIds = bundle.sourceSnapshotHistory.map((item) => String(item.sourceSnapshotSetId))
  if (new Set(sourceSnapshotSetIds).size !== sourceSnapshotSetIds.length) {
    issues.push('source snapshot-set IDs must be unique')
  }
  const sourceSnapshotSets = new Map(
    bundle.sourceSnapshotHistory.map((item) => [String(item.sourceSnapshotSetId), item]),
  )
  const currentSnapshotSet = sourceSnapshotSets.get(String(bundle.sourceSnapshots.sourceSnapshotSetId))
  if (!currentSnapshotSet) {
    issues.push('current source snapshot set is missing from immutable history')
  } else if (canonicalJson(currentSnapshotSet) !== canonicalJson(bundle.sourceSnapshots)) {
    issues.push('current source snapshot set differs from immutable history')
  }

  const assessmentIds = new Set(bundle.assessments.map((item) => String(item.assessmentId)))
  if (assessmentIds.size !== bundle.assessments.length) issues.push('assessment IDs must be unique')
  const currentAssessment = bundle.assessments.find((item) => item.assessmentId === bundle.current.assessmentId)
  if (!currentAssessment) issues.push('current pointer assessmentId does not resolve')
  if (currentAssessment && bundle.current.assessmentContentHash !== currentAssessment.contentHash) {
    issues.push('current pointer assessmentContentHash mismatch')
  }
  if (bundle.current.sourceSnapshotSetId !== bundle.sourceSnapshots.sourceSnapshotSetId) {
    issues.push('current pointer sourceSnapshotSetId mismatch')
  }
  if (bundle.current.sourceSnapshotSetHash !== bundle.sourceSnapshots.contentHash) {
    issues.push('current pointer sourceSnapshotSetHash mismatch')
  }
  if (bundle.summary.assessmentId !== bundle.current.assessmentId) issues.push('summary and current pointer disagree')

  for (const assessment of bundle.assessments) {
    const snapshotSet = sourceSnapshotSets.get(String(assessment.sourceSnapshotSetId))
    if (!snapshotSet) {
      issues.push(`${String(assessment.assessmentId)} references missing source snapshot set ${String(assessment.sourceSnapshotSetId)}`)
      continue
    }
    const snapshots = Array.isArray(snapshotSet.snapshots) ? snapshotSet.snapshots.filter(isObject) : []
    const databaseSnapshot = isObject(snapshotSet.databaseSnapshot) ? snapshotSet.databaseSnapshot : null
    const snapshotIds = new Set(snapshots.map((item) => String(item.snapshotId)))
    if (databaseSnapshot) snapshotIds.add(String(databaseSnapshot.snapshotId))
    for (const snapshotId of Array.isArray(assessment.sourceSnapshotIds) ? assessment.sourceSnapshotIds : []) {
      if (!snapshotIds.has(String(snapshotId))) issues.push(`${String(assessment.assessmentId)} references missing snapshot ${String(snapshotId)}`)
    }
    if (assessment.supersedesId && !assessmentIds.has(String(assessment.supersedesId))) {
      issues.push(`${String(assessment.assessmentId)} supersedes unknown assessment ${String(assessment.supersedesId)}`)
    }
  }
  return issues
}

function readAssessmentHistory(): JsonObject[] {
  if (!existsSync(resolve(ROOT, ASSESSMENTS_PATH))) return []
  return parseJsonLines(ASSESSMENTS_PATH)
}

function readSourceSnapshotHistory(): JsonObject[] {
  if (existsSync(resolve(ROOT, SOURCE_SNAPSHOT_HISTORY_PATH))) {
    return parseJsonLines(SOURCE_SNAPSHOT_HISTORY_PATH)
  }
  if (existsSync(resolve(ROOT, SOURCE_SNAPSHOTS_PATH))) {
    return [JSON.parse(readFileSync(resolve(ROOT, SOURCE_SNAPSHOTS_PATH), 'utf8')) as JsonObject]
  }
  return []
}

function mergeAppendOnlySourceSnapshotHistory(existing: JsonObject[], snapshotSet: JsonObject): JsonObject[] {
  const matching = existing.find((item) => item.sourceSnapshotSetId === snapshotSet.sourceSnapshotSetId)
  if (matching) {
    if (canonicalJson(matching) !== canonicalJson(snapshotSet)) {
      throw new Error(
        `Immutable source snapshot set ${String(snapshotSet.sourceSnapshotSetId)} already exists with different content`,
      )
    }
    return existing
  }
  return [...existing, snapshotSet]
}

function mergeAppendOnlyHistory(existing: JsonObject[], assessment: JsonObject): JsonObject[] {
  const matching = existing.find((item) => item.assessmentId === assessment.assessmentId)
  if (matching) {
    if (canonicalJson(matching) !== canonicalJson(assessment)) {
      throw new Error(
        `Immutable assessment ${String(assessment.assessmentId)} already exists with different content; create a new assessment ID and set CORPUS_HEALTH_SUPERSEDES_ID`,
      )
    }
    return existing
  }
  if (existing.length > 0 && !assessment.supersedesId) {
    throw new Error('A new assessment must set CORPUS_HEALTH_SUPERSEDES_ID to the prior assessment')
  }
  return [...existing, assessment]
}

function resolveSupersedesId(
  baseCommit: string,
  checkMode: boolean,
  existingAssessments: JsonObject[],
): string | null {
  if (process.env.CORPUS_HEALTH_SUPERSEDES_ID) return process.env.CORPUS_HEALTH_SUPERSEDES_ID
  if (!checkMode) return null

  const assessmentId = `health.assessment.${SNAPSHOT_DATE}.local.${baseCommit.slice(0, 8)}`
  const existing = existingAssessments.find((item) => item.assessmentId === assessmentId)
  if (!existing) {
    throw new Error(`Pinned assessment ${assessmentId} is missing from immutable history`)
  }
  return typeof existing.supersedesId === 'string' ? existing.supersedesId : null
}

function resolveBaseCommit(checkMode: boolean): string {
  const explicitBaseCommit = process.env.CORPUS_HEALTH_BASE_COMMIT
  if (explicitBaseCommit) return git(['rev-parse', `${explicitBaseCommit}^{commit}`])

  if (checkMode && existsSync(resolve(ROOT, GENERATION_MANIFEST_PATH))) {
    const manifest = JSON.parse(
      readFileSync(resolve(ROOT, GENERATION_MANIFEST_PATH), 'utf8'),
    ) as JsonObject
    if (typeof manifest.baseCommit !== 'string' || manifest.baseCommit.length === 0) {
      throw new Error('Generation manifest does not contain a pinned baseCommit')
    }
    return git(['rev-parse', `${manifest.baseCommit}^{commit}`])
  }

  return git(['rev-parse', 'HEAD'])
}

async function generateBundle(checkMode: boolean): Promise<GeneratedBundle> {
  const baseCommit = resolveBaseCommit(checkMode)
  const schema = JSON.parse(readFileSync(resolve(ROOT, SCHEMA_PATH), 'utf8')) as JsonObject
  const thresholds = JSON.parse(readFileSync(resolve(ROOT, THRESHOLDS_PATH), 'utf8')) as JsonObject
  const db = await queryDatabase(baseCommit)
  const sourceSnapshots = SOURCE_DEFINITIONS.map((definition) => snapshotSource(definition, baseCommit))
  const sourceSnapshotSetId = `health.snapshot_set.${SNAPSHOT_DATE}.${baseCommit.slice(0, 8)}`
  const sourceSnapshotSet = withContentHash({
    schemaVersion: SCHEMA_VERSION,
    documentKind: 'corpus_health_source_snapshot_set',
    sourceSnapshotSetId,
    snapshotDate: SNAPSHOT_DATE,
    observedAt: OBSERVED_AT,
    baseCommit,
    generatorVersion: GENERATOR_VERSION,
    snapshots: sourceSnapshots,
    databaseSnapshot: db.snapshot,
  })
  const sourceSnapshotHistory = mergeAppendOnlySourceSnapshotHistory(
    readSourceSnapshotHistory(),
    sourceSnapshotSet,
  )
  const allSnapshotIds = [
    ...sourceSnapshots.map((item) => String(item.snapshotId)),
    String(db.snapshot.snapshotId),
  ]
  const existingAssessments = readAssessmentHistory()
  const supersedesId = resolveSupersedesId(baseCommit, checkMode, existingAssessments)
  const assessment = buildAssessment(
    baseCommit,
    sourceSnapshotSetId,
    allSnapshotIds,
    db,
    thresholds,
    supersedesId,
  )
  const assessmentIssues = validateCorpusHealthAssessment(assessment, thresholds, schema)
  if (assessmentIssues.length > 0) throw new Error(`Corpus-health assessment is invalid:\n- ${assessmentIssues.join('\n- ')}`)

  const history = mergeAppendOnlyHistory(existingAssessments, assessment)
  const current = withContentHash({
    schemaVersion: SCHEMA_VERSION,
    documentKind: 'corpus_health_current_pointer',
    assessmentId: assessment.assessmentId,
    assessmentContentHash: assessment.contentHash,
    sourceSnapshotSetId,
    sourceSnapshotSetHash: sourceSnapshotSet.contentHash,
    baselineAdoptionStatus: thresholds.adoptionStatus,
    generatedAt: OBSERVED_AT,
    warning: 'Current pointer only. Read the immutable assessment and its source snapshots; this is not a subject-coverage claim.',
  })
  const profileVerdicts = assessment.profileVerdicts as JsonObject[]
  const summary = withContentHash({
    schemaVersion: SCHEMA_VERSION,
    documentKind: 'corpus_health_summary',
    assessmentId: assessment.assessmentId,
    observedAt: OBSERVED_AT,
    baseCommit,
    gate1Decision: 'no_go',
    principalBlocker: metricNumber(assessment, 'health_metric.migration_lineage_mismatches') > 0
      ? 'code_database_lineage_mismatch'
      : metricNumber(assessment, 'health_metric.unclassified_database_only_evidence_identities') > 0
          || metricNumber(assessment, 'health_metric.seed_only_evidence_identities') > 0
          || metricNumber(assessment, 'health_metric.missing_managed_runtime_evidence_identities') > 0
        ? 'seed_database_identity_mismatch'
        : metricNumber(assessment, 'health_metric.library_live_materialization') !== metricNumber(assessment, 'health_metric.library_inventory')
            || metricNumber(assessment, 'health_metric.library_inventory_only_rows') > 0
            || metricNumber(assessment, 'health_metric.library_retained_history_contract_issues') > 0
          ? 'library_inventory_materialization_mismatch'
          : metricNumber(assessment, 'health_metric.evidence_appraisal') === 0
            ? 'evidence_appraisal_zero'
            : metricNumber(assessment, 'health_metric.external_rows_needing_archive') > 0
              ? 'archive_durability_incomplete'
              : 'human_and_operational_receipts_incomplete',
    semanticBoundary: SEMANTIC_BOUNDARY,
    profileVerdicts: profileVerdicts.map((item) => ({
      profileId: item.profileId,
      verdict: item.verdict,
      readyForProfile: item.readyForProfile,
      reasonCodes: item.reasonCodes,
    })),
    keyMetrics: {
      headMigrations: metricNumber(assessment, 'health_metric.head_migrations'),
      databaseMigrations: metricNumber(assessment, 'health_metric.database_migrations'),
      migrationLineageMismatches: metricNumber(assessment, 'health_metric.migration_lineage_mismatches'),
      headSeedEvidence: metricNumber(assessment, 'health_metric.head_seed_evidence'),
      databaseEvidence: metricNumber(assessment, 'health_metric.database_evidence'),
      databaseOnlyEvidenceIdentities: metricNumber(assessment, 'health_metric.database_only_evidence_identities'),
      managedRuntimeEvidenceIdentities: metricNumber(assessment, 'health_metric.managed_runtime_evidence_identities'),
      unclassifiedDatabaseOnlyEvidenceIdentities: metricNumber(assessment, 'health_metric.unclassified_database_only_evidence_identities'),
      missingManagedRuntimeEvidenceIdentities: metricNumber(assessment, 'health_metric.missing_managed_runtime_evidence_identities'),
      seedOnlyEvidenceIdentities: metricNumber(assessment, 'health_metric.seed_only_evidence_identities'),
      completeEvidenceAppraisals: metricNumber(assessment, 'health_metric.evidence_appraisal'),
      externalRowsNeedingArchive: metricNumber(assessment, 'health_metric.external_rows_needing_archive'),
      currentLibraryInventory: metricNumber(assessment, 'health_metric.library_inventory'),
      persistedLibraryRows: metricNumber(assessment, 'health_metric.library_materialization'),
      livePersistedLibraryRows: metricNumber(assessment, 'health_metric.library_live_materialization'),
      retainedLibraryHistoryRows: metricNumber(assessment, 'health_metric.library_retained_history_rows'),
      libraryInventoryOnlyRows: metricNumber(assessment, 'health_metric.library_inventory_only_rows'),
      libraryRetainedHistoryContractIssues: metricNumber(assessment, 'health_metric.library_retained_history_contract_issues'),
      reportedLibraryProjectionUpdates: metricNumber(assessment, 'health_metric.library_projection_updates_reported'),
      vaultIssues: metricNumber(assessment, 'health_metric.vault_issues'),
    },
    openConflicts: (assessment.conflicts as JsonObject[])
      .filter((item) => item.status !== 'resolved' && item.status !== 'accepted_tension')
      .map((item) => ({
        conflictId: item.conflictId,
        severity: item.severity,
        title: item.title,
      })),
  })
  const report = buildReport(assessment, db)

  const serializedWithoutManifest: Record<string, string> = {
    [SOURCE_SNAPSHOTS_PATH]: `${JSON.stringify(sourceSnapshotSet, null, 2)}\n`,
    [SOURCE_SNAPSHOT_HISTORY_PATH]: `${sourceSnapshotHistory.map((item) => canonicalJson(item)).join('\n')}\n`,
    [ASSESSMENTS_PATH]: `${history.map((item) => canonicalJson(item)).join('\n')}\n`,
    [CURRENT_PATH]: `${JSON.stringify(current, null, 2)}\n`,
    [SUMMARY_PATH]: `${JSON.stringify(summary, null, 2)}\n`,
    [REPORT_PATH]: report,
  }
  const generationManifest = withContentHash({
    schemaVersion: SCHEMA_VERSION,
    documentKind: 'corpus_health_generation_manifest',
    generatorVersion: GENERATOR_VERSION,
    generatedAt: OBSERVED_AT,
    baseCommit,
    inputs: [GENERATOR_PATH, SCHEMA_PATH, THRESHOLDS_PATH].map((path) => {
      const source = readFileSync(resolve(ROOT, path))
      return { path, sha256: sha256Text(source), sizeBytes: source.length }
    }),
    sourceSnapshotSetHash: sourceSnapshotSet.contentHash,
    assessmentIds: history.map((item) => item.assessmentId),
    outputs: Object.entries(serializedWithoutManifest).map(([path, content]) => ({
      path,
      sha256: sha256Text(content),
      sizeBytes: Buffer.byteLength(content),
    })),
  })
  const serialized = {
    ...serializedWithoutManifest,
    [GENERATION_MANIFEST_PATH]: `${JSON.stringify(generationManifest, null, 2)}\n`,
  }
  const bundleIssues = validateCorpusHealthBundle({
    sourceSnapshots: sourceSnapshotSet,
    sourceSnapshotHistory,
    assessments: history,
    current,
    summary,
    generationManifest,
  })
  if (bundleIssues.length > 0) throw new Error(`Corpus-health bundle is invalid:\n- ${bundleIssues.join('\n- ')}`)

  return {
    sourceSnapshots: sourceSnapshotSet,
    sourceSnapshotHistory,
    assessments: history,
    current,
    summary,
    report,
    generationManifest,
    serialized,
  }
}

function checkGeneratedFiles(serialized: Record<string, string>): void {
  const differences: string[] = []
  for (const [path, expected] of Object.entries(serialized)) {
    const absolutePath = resolve(ROOT, path)
    if (!existsSync(absolutePath)) {
      differences.push(`${path} is missing`)
      continue
    }
    const actual = readFileSync(absolutePath, 'utf8')
    if (actual !== expected) differences.push(`${path} differs from deterministic generation`)
  }
  if (differences.length > 0) throw new Error(`Corpus-health check failed:\n- ${differences.join('\n- ')}`)
}

function writeGeneratedFiles(serialized: Record<string, string>): void {
  const manifestEntry = serialized[GENERATION_MANIFEST_PATH]
  if (!manifestEntry) throw new Error('Generation manifest was not produced')
  const regularEntries = Object.entries(serialized).filter(([path]) => path !== GENERATION_MANIFEST_PATH)
  const orderedEntries = [...regularEntries, [GENERATION_MANIFEST_PATH, manifestEntry] as const]
  for (const [path, content] of orderedEntries) {
    const absolutePath = resolve(ROOT, path)
    mkdirSync(dirname(absolutePath), { recursive: true })
    const temporaryPath = `${absolutePath}.tmp-${process.pid}`
    writeFileSync(temporaryPath, content)
    renameSync(temporaryPath, absolutePath)
  }
}

export async function runCorpusHealthGenerator(args: string[]): Promise<void> {
  const checkMode = args.length === 1 && args[0] === '--check'
  if (args.length > 0 && !checkMode) {
    throw new Error('Usage: generate-corpus-health [--check]')
  }
  const bundle = await generateBundle(checkMode)
  if (checkMode) {
    checkGeneratedFiles(bundle.serialized)
    console.log(`knowledge:health:check ok (${bundle.assessments.length} immutable assessment(s))`)
  } else {
    writeGeneratedFiles(bundle.serialized)
    console.log(`knowledge:health:generate ok (${bundle.assessments.length} immutable assessment(s))`)
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  runCorpusHealthGenerator(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
