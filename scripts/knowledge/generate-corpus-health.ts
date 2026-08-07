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
import { z } from 'zod'

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
import {
  deriveCorpusLifecyclePermissions,
  validateCorpusLifecycle,
  type CorpusLifecyclePermissions,
  type CorpusLifecycleRecord,
} from '../../src/lib/knowledge/corpus-processing-lifecycle'
import { validateVault } from '../../src/lib/obsidian-vault'
import {
  auditSourceCitationArchiveCoverage,
  summarizeSourceCitationArchiveAudit,
  type ArchiveAuditInput,
} from '../audit-source-citation-archive-coverage'
import { checkTrackedQualificationBundle } from './qualify-pdf-page-extraction'

const GENERATOR_VERSION = '1.4.0'
const SCHEMA_VERSION = 'corpus-evidence-health-v1'
const THRESHOLDS_VERSION = 'corpus-health-thresholds-v1'
const SNAPSHOT_DATE = process.env.CORPUS_HEALTH_SNAPSHOT_DATE ?? '2026-08-03'
const OBSERVED_AT = process.env.CORPUS_HEALTH_OBSERVED_AT ?? '2026-08-03T12:19:47.000Z'
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
const CORPUS_PROCESSING_SUMMARY_PATH = 'knowledge/corpus/corpus-processing-summary.v1.json'
const CORPUS_PROCESSING_MANIFEST_PATH = 'knowledge/corpus/corpus-processing-generation-manifest.v1.json'
const CORPUS_PROCESSING_REGISTER_PATH = 'knowledge/corpus/corpus-processing-register.v1.jsonl'
const REVIEW_LAYER_CONTRACT_PATH = 'knowledge/review/review-layer-contract.v1.json'
const REVIEW_LAYER_SCHEMA_PATH = 'knowledge/schema/review-layer-contract.schema.v1.json'
const CORPUS_LIFECYCLE_CONTRACT_PATH = 'src/lib/knowledge/corpus-processing-lifecycle.ts'
const CORPUS_LIFECYCLE_SCHEMA_PATH = 'knowledge/schema/corpus-processing-lifecycle.schema.v1.json'
const PDF_EXTRACTION_SUMMARY_PATH = 'knowledge/corpus/pdf-page-extraction/pdf-page-extraction-summary.v1.json'
const PDF_EXTRACTION_MANIFEST_PATH = 'knowledge/corpus/pdf-page-extraction/pdf-page-extraction-generation-manifest.v1.json'

const GATE1_KNOWLEDGE_INPUT_PATHS = [
  CORPUS_PROCESSING_SUMMARY_PATH,
  CORPUS_PROCESSING_MANIFEST_PATH,
  CORPUS_PROCESSING_REGISTER_PATH,
  REVIEW_LAYER_CONTRACT_PATH,
  REVIEW_LAYER_SCHEMA_PATH,
  CORPUS_LIFECYCLE_CONTRACT_PATH,
  CORPUS_LIFECYCLE_SCHEMA_PATH,
  PDF_EXTRACTION_SUMMARY_PATH,
  PDF_EXTRACTION_MANIFEST_PATH,
] as const

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

const nonnegativeIntegerSchema = z.number().int().nonnegative()
const bareSha256Schema = z.string().regex(/^[a-f0-9]{64}$/)
const prefixedSha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/)
const manifestEntrySchema = z.object({
  path: z.string().min(1),
  sha256: bareSha256Schema,
  sizeBytes: nonnegativeIntegerSchema,
}).strict()

const corpusProcessingSummarySchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  summaryId: z.literal('corpus-processing-summary.v1'),
  generatorVersion: z.string().min(1),
  observedAt: z.string().datetime(),
  ledgerObservedAt: z.string().datetime(),
  activeCorpus: z.object({
    total: nonnegativeIntegerSchema,
    expected: nonnegativeIntegerSchema,
    identityUnique: z.boolean(),
    bySourceKind: z.object({
      document: nonnegativeIntegerSchema,
      library_file: nonnegativeIntegerSchema,
      report: nonnegativeIntegerSchema,
      source_doc: nonnegativeIntegerSchema,
      thesis: nonnegativeIntegerSchema,
    }).strict(),
    authoritativeInventorySnapshot: z.object({
      path: z.string().min(1),
      snapshotId: z.string().min(1),
      observedAt: z.string().datetime(),
      identityContentSetSha256: bareSha256Schema,
      sourceKindCountsSha256: bareSha256Schema,
      ledgerSha256: bareSha256Schema,
      portableSnapshotBindingVerified: z.boolean(),
      liveDatabaseVerifiedThisRun: z.boolean(),
    }).strict(),
  }).strict(),
  retainedHistoryBoundary: z.object({
    total: nonnegativeIntegerSchema,
    nonAdditive: z.boolean(),
    externalUseAllowed: z.boolean(),
    contractSha256: bareSha256Schema,
  }).strict(),
  repositoryFiles: z.object({
    byState: z.object({
      missing: nonnegativeIntegerSchema,
      no_locator: nonnegativeIntegerSchema,
      present: nonnegativeIntegerSchema,
    }).strict(),
    byMediaType: z.object({
      'application/pdf': nonnegativeIntegerSchema,
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': nonnegativeIntegerSchema,
      'text/csv': nonnegativeIntegerSchema,
      'text/markdown': nonnegativeIntegerSchema,
      'text/plain': nonnegativeIntegerSchema,
      'text/typescript': nonnegativeIntegerSchema,
      unknown: nonnegativeIntegerSchema,
    }).strict(),
    present: nonnegativeIntegerSchema,
    unavailable: nonnegativeIntegerSchema,
    lifecycleContentHashBound: nonnegativeIntegerSchema,
    repositoryContentHashesVerified: nonnegativeIntegerSchema,
    privateCaptureContentHashesRecorded: nonnegativeIntegerSchema,
    contentHashUnavailable: nonnegativeIntegerSchema,
    filesystemSnapshotSha256: bareSha256Schema,
  }).strict(),
  privateRecovery: z.object({
    recorded: z.object({
      candidateCount: nonnegativeIntegerSchema,
      captureRecordedOn: z.string().date(),
      primaryHashAndSizeAttestations: nonnegativeIntegerSchema,
      replicaHashAndSizeAttestations: nonnegativeIntegerSchema,
      attestedCopyFileMode: z.string().min(1),
      semantics: z.string().min(1),
    }).strict(),
    liveVerifiedThisRun: z.object({
      performed: z.boolean(),
      primaryCopiesVerified: nonnegativeIntegerSchema,
      replicaCopiesVerified: nonnegativeIntegerSchema,
      verifiedCandidateCount: nonnegativeIntegerSchema,
    }).strict(),
    rightsPendingNotCleared: nonnegativeIntegerSchema,
    rightsCleared: nonnegativeIntegerSchema,
    repositoryPresencePromotions: nonnegativeIntegerSchema,
    fullTextReviewPromotions: nonnegativeIntegerSchema,
  }).strict(),
  roles: z.object({
    byRole: z.object({
      generated_projection: nonnegativeIntegerSchema,
      internal_synthesis: nonnegativeIntegerSchema,
      operational_control: nonnegativeIntegerSchema,
      primary_evidence: nonnegativeIntegerSchema,
      unknown: nonnegativeIntegerSchema,
    }).strict(),
    provisionalMachineClassifications: nonnegativeIntegerSchema,
    knownIdentityAliasMismatches: nonnegativeIntegerSchema,
    ownerConfirmed: nonnegativeIntegerSchema,
  }).strict(),
  queues: z.object({
    missingFiles: nonnegativeIntegerSchema,
    roleClassification: nonnegativeIntegerSchema,
    fullTextProcessingUnits: nonnegativeIntegerSchema,
    fullTextIdentitiesPending: nonnegativeIntegerSchema,
    ownerReview: nonnegativeIntegerSchema,
    normalizedPathDuplicateGroups: nonnegativeIntegerSchema,
    contentHashDuplicateGroups: nonnegativeIntegerSchema,
  }).strict(),
  duplicateReview: z.object({
    normalizedPathGroups: nonnegativeIntegerSchema,
    normalizedPathIdentities: nonnegativeIntegerSchema,
    contentHashGroups: nonnegativeIntegerSchema,
    contentHashIdentities: nonnegativeIntegerSchema,
    automaticActions: nonnegativeIntegerSchema,
  }).strict(),
  readiness: z.object({
    fullTextComplete: nonnegativeIntegerSchema,
    ownerReviewed: nonnegativeIntegerSchema,
    internalKnowledgeReady: nonnegativeIntegerSchema,
    externalUseReady: nonnegativeIntegerSchema,
    coveragePromotionAllowed: nonnegativeIntegerSchema,
  }).strict(),
  semantics: z.object({
    noFullTextInference: z.string().min(1),
    ownerReview: z.string().min(1),
    retainedHistory: z.string().min(1),
    duplicates: z.string().min(1),
    privateCapture: z.string().min(1),
    liveVerification: z.string().min(1),
    authoritativeInventory: z.string().min(1),
  }).strict(),
}).strict()

const corpusProcessingManifestSchema = z.object({
  schemaVersion: z.literal('1.0.0'),
  generator: z.literal('scripts/knowledge/generate-corpus-processing-register.ts'),
  generatorVersion: z.string().min(1),
  observedAt: z.string().datetime(),
  ledgerObservedAt: z.string().datetime(),
  activeCorpusExpectedRows: nonnegativeIntegerSchema,
  retainedHistoryExpectedRows: nonnegativeIntegerSchema,
  retainedHistoryNonAdditive: z.boolean(),
  filesystemSnapshotSha256: bareSha256Schema,
  commitMarkerSemantics: z.string().min(1),
  inputs: z.array(manifestEntrySchema).min(1),
  outputs: z.array(manifestEntrySchema).min(1),
}).strict()

const corpusProcessingRegisterRowSchema = z.object({
  recordId: z.string().min(1),
  repositoryFile: z.object({
    candidateRepositoryPaths: z.array(z.string()),
    extension: z.string().nullable(),
    locator: z.string().nullable(),
    mediaType: z.string().nullable(),
    resolvedRepositoryPath: z.string().nullable(),
    sha256: bareSha256Schema.nullable(),
    sizeBytes: nonnegativeIntegerSchema.nullable(),
    state: z.enum(['present', 'missing', 'no_locator']),
  }).strict(),
  privateRecoveryCandidate: z.object({
    canonicalPath: z.string().min(1),
    fullTextReviewed: z.boolean(),
    identityKey: z.string().min(1),
    identityReview: z.object({
      currentTitle: z.string().min(1),
      legacyAlias: z.string().min(1),
      provisionalScopeDisposition: z.string().min(1),
      state: z.string().min(1),
      warning: z.string().min(1),
    }).strict().optional(),
    internalLocator: z.string().min(1),
    replicaClass: z.string().min(1),
    repositoryAvailable: z.boolean(),
    rightsState: z.string().min(1),
    sha256: bareSha256Schema,
    sizeBytes: nonnegativeIntegerSchema,
  }).strict().nullable(),
  lifecycle: z.unknown(),
  permissions: z.unknown(),
}).passthrough()

const corpusLifecyclePermissionsSchema = z.object({
  aiReadyForOwnerReview: z.boolean(),
  sourceRoleOwnerConfirmed: z.boolean(),
  ownerApprovedForInternalUse: z.boolean(),
  independentlyValidated: z.boolean(),
  independentValidationRequirementSatisfied: z.boolean(),
  partnerValidated: z.boolean(),
  partnerValidationRequirementSatisfied: z.boolean(),
  rightsHolderValidated: z.boolean(),
  rightsHolderValidationRequirementSatisfied: z.boolean(),
  rightsClearedForInternalUse: z.boolean(),
  rightsClearedForExternalPublication: z.boolean(),
  publicationIndependentGatesSatisfied: z.boolean(),
  externalUseAllowed: z.boolean(),
  coveragePromotionAllowed: z.boolean(),
  blockers: z.array(z.string()),
}).strict()

export type CorpusProcessingSummary = z.infer<typeof corpusProcessingSummarySchema>
type CorpusProcessingManifestEntry = z.infer<typeof manifestEntrySchema>

export type Gate1KnowledgeInputs = {
  corpus: {
    summary: CorpusProcessingSummary
    activeIdentities: number
    contentHashBoundIdentities: number
    repositoryHashBoundBytes: number
    privateRecoveryHashBoundBytes: number
    hashBoundBytes: number
    missingRepositoryFiles: number
    noLocatorIdentities: number
    deduplicatedProcessingUnits: number
    fullTextComplete: number
    sourceRoleOwnerConfirmed: number
    ownerReviewed: number
    independentlyValidated: number
    partnerValidated: number
    rightsHolderValidated: number
    rightsCleared: number
    publicationApproved: number
    externalUseReady: number
    coverageApproved: number
  }
  review: {
    canonicalLayerCount: number
    unclassifiedLegacyMappingCount: number
    legacyStatusOnlyCanonicalHumanApprovals: number
  }
  pdf: {
    technicalUnits: number
    technicallyQualifiedUnits: number
    technicalFailures: number
    extractedPages: number
    extractedWords: number
    warningPages: number
    openIdentityBlockers: number
    legacyAliasScopeBlockers: number
    unregisteredSourceCandidateBlockers: number
    aiAnalysisComplete: boolean
    ownerReviewComplete: boolean
    independentValidationComplete: boolean
    rightsCleared: boolean
    publicationReady: boolean
    coveragePromotionAllowed: boolean
    portableTrackedValidationSupported: boolean
    privateVerificationPerformed: boolean
  }
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
  {
    snapshotId: 'health.snapshot.corpus_processing_summary',
    surfaceId: 'corpus_processing_summary',
    path: CORPUS_PROCESSING_SUMMARY_PATH,
    authorityLayer: 'operational_status',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: [
      'The summary is accepted only when its generation manifest and full lifecycle register validate exactly.',
      'Inventory and processing counts do not establish subject coverage, full-text reading or human approval.',
    ],
  },
  {
    snapshotId: 'health.snapshot.corpus_processing_manifest',
    surfaceId: 'corpus_processing_manifest',
    path: CORPUS_PROCESSING_MANIFEST_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['The manifest binds generation inputs and outputs; generation itself creates no review or readiness decision.'],
  },
  {
    snapshotId: 'health.snapshot.corpus_processing_register',
    surfaceId: 'corpus_processing_register',
    path: CORPUS_PROCESSING_REGISTER_PATH,
    authorityLayer: 'structured_evidence',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Lifecycle records are validated independently; identity enumeration is not researched completeness.'],
  },
  {
    snapshotId: 'health.snapshot.review_layer_contract',
    surfaceId: 'review_layer_contract',
    path: REVIEW_LAYER_CONTRACT_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Legacy Gate 2C status labels remain unclassified until signer authority and gate role are evidenced.'],
  },
  {
    snapshotId: 'health.snapshot.review_layer_schema',
    surfaceId: 'review_layer_schema',
    path: REVIEW_LAYER_SCHEMA_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Schema validity constrains review records but does not create a review receipt.'],
  },
  {
    snapshotId: 'health.snapshot.corpus_processing_lifecycle_contract',
    surfaceId: 'corpus_processing_lifecycle_contract',
    path: CORPUS_LIFECYCLE_CONTRACT_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['The lifecycle contract separates AI processing, owner review, validation, rights, publication and coverage.'],
  },
  {
    snapshotId: 'health.snapshot.corpus_processing_lifecycle_schema',
    surfaceId: 'corpus_processing_lifecycle_schema',
    path: CORPUS_LIFECYCLE_SCHEMA_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Schema validity is necessary but not sufficient evidence that any processing or review stage occurred.'],
  },
  {
    snapshotId: 'health.snapshot.pdf_page_extraction_summary',
    surfaceId: 'pdf_page_extraction_summary',
    path: PDF_EXTRACTION_SUMMARY_PATH,
    authorityLayer: 'structured_evidence',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: [
      'Page and word totals are technical extraction volume only, not evidence that AI read, analyzed or understood the documents.',
      'Technical qualification creates no owner, expert, rights, publication or coverage approval.',
    ],
  },
  {
    snapshotId: 'health.snapshot.pdf_page_extraction_manifest',
    surfaceId: 'pdf_page_extraction_manifest',
    path: PDF_EXTRACTION_MANIFEST_PATH,
    authorityLayer: 'repository_contract',
    observationMode: 'direct_repository_observation',
    updatedThrough: null,
    caveats: ['Portable tracked validation is distinct from live verification of private archive roots.'],
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

function sha256Bare(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex')
}

function requireExact(actual: unknown, expected: unknown, label: string): void {
  if (canonicalJson(actual) !== canonicalJson(expected)) {
    throw new Error(`${label} mismatch: expected ${canonicalJson(expected)}, received ${canonicalJson(actual)}`)
  }
}

export function parseCorpusProcessingSummary(value: unknown): CorpusProcessingSummary {
  const result = corpusProcessingSummarySchema.safeParse(value)
  if (!result.success) {
    throw new Error(`Corpus processing summary is invalid: ${result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`)
  }
  return result.data
}

export function assertManifestEntryMatchesBytes(
  entry: CorpusProcessingManifestEntry,
  bytes: string | Buffer,
  label: string,
): void {
  const actualSize = Buffer.byteLength(bytes)
  const actualSha256 = sha256Bare(bytes)
  if (entry.sizeBytes !== actualSize || entry.sha256 !== actualSha256) {
    throw new Error(`${label} does not match manifest entry ${entry.path}`)
  }
}

function readJsonAt(repositoryRoot: string, path: string): unknown {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), 'utf8')) as unknown
}

function uniqueManifestPaths(entries: CorpusProcessingManifestEntry[], label: string): void {
  const paths = entries.map((entry) => entry.path)
  if (new Set(paths).size !== paths.length) throw new Error(`${label} paths must be unique`)
}

function countPermission(
  records: Array<{ lifecycle: CorpusLifecycleRecord; permissions: CorpusLifecyclePermissions }>,
  key: keyof CorpusLifecyclePermissions,
): number {
  return records.filter(({ permissions }) => permissions[key] === true).length
}

export function loadGate1KnowledgeInputs(repositoryRoot = ROOT): Gate1KnowledgeInputs {
  const rawSummary = readJsonAt(repositoryRoot, CORPUS_PROCESSING_SUMMARY_PATH)
  const summary = parseCorpusProcessingSummary(rawSummary)
  const manifestResult = corpusProcessingManifestSchema.safeParse(
    readJsonAt(repositoryRoot, CORPUS_PROCESSING_MANIFEST_PATH),
  )
  if (!manifestResult.success) {
    throw new Error(`Corpus processing generation manifest is invalid: ${manifestResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`)
  }
  const manifest = manifestResult.data
  uniqueManifestPaths(manifest.inputs, 'Corpus processing manifest input')
  uniqueManifestPaths(manifest.outputs, 'Corpus processing manifest output')
  for (const [kind, entries] of [
    ['input', manifest.inputs],
    ['output', manifest.outputs],
  ] as const) {
    for (const entry of entries) {
      const bytes = readFileSync(resolve(repositoryRoot, entry.path))
      assertManifestEntryMatchesBytes(entry, bytes, `Corpus processing ${kind}`)
    }
  }
  for (const requiredPath of [
    CORPUS_LIFECYCLE_CONTRACT_PATH,
    CORPUS_PROCESSING_REGISTER_PATH,
    CORPUS_PROCESSING_SUMMARY_PATH,
  ]) {
    const entrySet = requiredPath === CORPUS_LIFECYCLE_CONTRACT_PATH ? manifest.inputs : manifest.outputs
    if (!entrySet.some((entry) => entry.path === requiredPath)) {
      throw new Error(`Corpus processing manifest does not bind ${requiredPath}`)
    }
  }
  requireExact(manifest.generatorVersion, summary.generatorVersion, 'Corpus generator version')
  requireExact(manifest.observedAt, summary.observedAt, 'Corpus observation time')
  requireExact(manifest.ledgerObservedAt, summary.ledgerObservedAt, 'Corpus ledger observation time')
  requireExact(manifest.activeCorpusExpectedRows, summary.activeCorpus.expected, 'Expected active corpus rows')
  requireExact(manifest.retainedHistoryExpectedRows, summary.retainedHistoryBoundary.total, 'Expected retained-history rows')
  requireExact(manifest.retainedHistoryNonAdditive, summary.retainedHistoryBoundary.nonAdditive, 'Retained-history additive boundary')
  requireExact(manifest.filesystemSnapshotSha256, summary.repositoryFiles.filesystemSnapshotSha256, 'Corpus filesystem snapshot')

  const registerSource = readFileSync(resolve(repositoryRoot, CORPUS_PROCESSING_REGISTER_PATH), 'utf8')
  const registerRows = registerSource
    .split(/\r?\n/)
    .filter((line) => line.trim() !== '')
    .map((line, index) => {
      let raw: unknown
      try {
        raw = JSON.parse(line) as unknown
      } catch (error) {
        throw new Error(`${CORPUS_PROCESSING_REGISTER_PATH}:${index + 1} is not valid JSON: ${String(error)}`)
      }
      const rowResult = corpusProcessingRegisterRowSchema.safeParse(raw)
      if (!rowResult.success) {
        throw new Error(`${CORPUS_PROCESSING_REGISTER_PATH}:${index + 1} is invalid: ${rowResult.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`)
      }
      const lifecycle = validateCorpusLifecycle(rowResult.data.lifecycle)
      const permissions = deriveCorpusLifecyclePermissions(lifecycle)
      const recordedPermissions = corpusLifecyclePermissionsSchema.parse(rowResult.data.permissions)
      requireExact(recordedPermissions, permissions, `${rowResult.data.recordId} derived lifecycle permissions`)
      requireExact(lifecycle.recordId, rowResult.data.recordId, `${rowResult.data.recordId} lifecycle identity`)
      return {
        ...rowResult.data,
        lifecycle,
        permissions,
      }
    })

  const recordIds = registerRows.map((row) => row.recordId)
  requireExact(new Set(recordIds).size, recordIds.length, 'Unique lifecycle record IDs')
  requireExact(summary.activeCorpus.identityUnique, true, 'Active corpus identity uniqueness declaration')
  requireExact(registerRows.length, summary.activeCorpus.total, 'Active corpus register row count')
  requireExact(registerRows.length, summary.activeCorpus.expected, 'Active corpus expected row count')

  const repositoryStates = { missing: 0, no_locator: 0, present: 0 }
  const roleCounts = {
    generated_projection: 0,
    internal_synthesis: 0,
    operational_control: 0,
    primary_evidence: 0,
    unknown: 0,
  }
  let contentHashBoundIdentities = 0
  let repositoryHashBoundBytes = 0
  let privateRecoveryHashBoundBytes = 0
  let fullTextComplete = 0
  let sourceRoleMachineProvisional = 0
  let publicationApproved = 0
  let coverageApproved = 0
  for (const row of registerRows) {
    repositoryStates[row.repositoryFile.state] += 1
    roleCounts[row.lifecycle.sourceIdentity.sourceRole] += 1
    if (row.lifecycle.sourceRoleConfirmationStatus.state === 'machine_provisional') {
      sourceRoleMachineProvisional += 1
    }
    if (row.lifecycle.aiProcessingStatus.completedStages.includes('full_text')) fullTextComplete += 1
    if (row.lifecycle.publicationStatus.approvalReceipt !== null) publicationApproved += 1
    if (row.lifecycle.coverageStatus.approvalReceipt !== null) coverageApproved += 1

    const contentSha256 = row.lifecycle.sourceIdentity.contentSha256
    if (contentSha256 === null) continue
    prefixedSha256Schema.parse(contentSha256)
    contentHashBoundIdentities += 1
    const bareHash = contentSha256.slice('sha256:'.length)
    if (
      row.repositoryFile.state === 'present'
      && row.repositoryFile.sha256 === bareHash
      && row.repositoryFile.sizeBytes !== null
    ) {
      repositoryHashBoundBytes += row.repositoryFile.sizeBytes
    } else if (
      row.privateRecoveryCandidate !== null
      && row.privateRecoveryCandidate.sha256 === bareHash
    ) {
      privateRecoveryHashBoundBytes += row.privateRecoveryCandidate.sizeBytes
    } else {
      throw new Error(`${row.recordId} has a lifecycle content hash without matching repository or private-recovery bytes`)
    }
  }

  const sourceRoleOwnerConfirmed = countPermission(registerRows, 'sourceRoleOwnerConfirmed')
  const ownerReviewed = countPermission(registerRows, 'ownerApprovedForInternalUse')
  const independentlyValidated = countPermission(registerRows, 'independentlyValidated')
  const partnerValidated = countPermission(registerRows, 'partnerValidated')
  const rightsHolderValidated = countPermission(registerRows, 'rightsHolderValidated')
  const rightsCleared = countPermission(registerRows, 'rightsClearedForInternalUse')
  const externalUseReady = countPermission(registerRows, 'externalUseAllowed')
  const coverageAllowed = countPermission(registerRows, 'coveragePromotionAllowed')

  requireExact(repositoryStates, summary.repositoryFiles.byState, 'Repository state counts')
  requireExact(repositoryStates.present, summary.repositoryFiles.present, 'Present repository files')
  requireExact(repositoryStates.missing + repositoryStates.no_locator, summary.repositoryFiles.unavailable, 'Unavailable repository files')
  requireExact(contentHashBoundIdentities, summary.repositoryFiles.lifecycleContentHashBound, 'Lifecycle content-hash bindings')
  requireExact(roleCounts, summary.roles.byRole, 'Corpus source-role counts')
  requireExact(sourceRoleMachineProvisional, summary.roles.provisionalMachineClassifications, 'Provisional source-role classifications')
  requireExact(sourceRoleOwnerConfirmed, summary.roles.ownerConfirmed, 'Owner-confirmed source roles')
  requireExact(fullTextComplete, summary.readiness.fullTextComplete, 'Full-text lifecycle completions')
  requireExact(ownerReviewed, summary.readiness.ownerReviewed, 'Owner-reviewed lifecycle records')
  requireExact(externalUseReady, summary.readiness.externalUseReady, 'External-use-ready lifecycle records')
  requireExact(coverageAllowed, summary.readiness.coveragePromotionAllowed, 'Coverage-promotion lifecycle records')
  requireExact(registerRows.length - fullTextComplete, summary.queues.fullTextIdentitiesPending, 'Full-text pending identities')
  requireExact(registerRows.length - ownerReviewed, summary.queues.ownerReview, 'Owner-review queue identities')
  requireExact(registerRows.length - sourceRoleOwnerConfirmed, summary.queues.roleClassification, 'Source-role confirmation queue identities')

  const reviewContract = readJsonAt(repositoryRoot, REVIEW_LAYER_CONTRACT_PATH)
  const reviewSchema = readJsonAt(repositoryRoot, REVIEW_LAYER_SCHEMA_PATH)
  if (!isObject(reviewContract) || !isObject(reviewSchema)) {
    throw new Error('Review-layer contract and schema must be JSON objects')
  }
  const reviewAjv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(reviewAjv)
  const validateReview = reviewAjv.compile(reviewSchema)
  if (!validateReview(reviewContract)) {
    throw new Error(`Review-layer contract is invalid: ${reviewAjv.errorsText(validateReview.errors, { separator: '; ' })}`)
  }
  const expectedLayerIds = [
    'ai_processing',
    'owner_review',
    'independent_expert_validation',
    'partner_validation',
    'rights_holder_validation',
    'rights_clearance',
    'publication',
    'coverage_promotion',
  ]
  const reviewLayers = Array.isArray(reviewContract.layers) ? reviewContract.layers.filter(isObject) : []
  requireExact(reviewLayers.map((layer) => String(layer.layerId)).toSorted(), expectedLayerIds.toSorted(), 'Canonical review layers')
  const legacyMappings = Array.isArray(reviewContract.legacyMappings)
    ? reviewContract.legacyMappings.filter(isObject)
    : []
  requireExact(legacyMappings.length, 5, 'Legacy Gate 2C mapping count')
  for (const mapping of legacyMappings) {
    requireExact(
      mapping.canonicalReviewLayerResolution,
      'unresolved_until_receipt_actor_and_gate_role_classified',
      `${String(mapping.sourceStatus)} review-layer resolution`,
    )
    const assignments = Array.isArray(mapping.canonicalAssignments)
      ? mapping.canonicalAssignments.filter(isObject)
      : []
    const expectedAssignments = mapping.sourceStatus === 'machine_checked_human_review_pending'
      ? [{ layerId: 'ai_processing', status: 'ai_processed' }]
      : []
    requireExact(assignments, expectedAssignments, `${String(mapping.sourceStatus)} canonical assignments`)
  }
  const legacyReceiptPolicy = isObject(reviewContract.legacyReceiptPolicy)
    ? reviewContract.legacyReceiptPolicy
    : {}
  requireExact(legacyReceiptPolicy.canonicalLayerId, null, 'Legacy receipt default canonical layer')
  requireExact(legacyReceiptPolicy.statusAloneCreatesCanonicalApproval, false, 'Legacy status-only approval policy')
  requireExact(legacyReceiptPolicy.unclassifiedLegacyReceiptCreatesCanonicalApproval, false, 'Unclassified legacy receipt approval policy')
  requireExact(legacyReceiptPolicy.externalUseAllowed, false, 'Legacy receipt external-use policy')
  requireExact(legacyReceiptPolicy.coveragePromotionAllowed, false, 'Legacy receipt coverage policy')
  requireExact(
    Array.isArray(legacyReceiptPolicy.allowedCanonicalLayerIds)
      ? legacyReceiptPolicy.allowedCanonicalLayerIds.map(String).toSorted()
      : [],
    ['owner_review', 'independent_expert_validation', 'partner_validation', 'rights_holder_validation'].toSorted(),
    'Legacy receipt allowed classified review layers',
  )
  requireExact(
    Array.isArray(legacyReceiptPolicy.requiredClassificationEvidence)
      ? legacyReceiptPolicy.requiredClassificationEvidence.map(String).toSorted()
      : [],
    [
      'named_signer_identity',
      'gate_required_reviewer_role',
      'qualifications_or_role_authority',
      'affiliation',
      'conflict_declaration',
      'exact_scope_binding',
    ].toSorted(),
    'Legacy receipt classification evidence',
  )

  const trackedPdf = checkTrackedQualificationBundle({ repositoryRoot })
  const pdfGenerationManifest = readJsonAt(repositoryRoot, PDF_EXTRACTION_MANIFEST_PATH)
  if (!isObject(pdfGenerationManifest) || !isObject(pdfGenerationManifest.semantics)) {
    throw new Error('PDF extraction generation manifest semantics are missing')
  }
  const pdfSummary = trackedPdf.summary
  requireExact(
    pdfSummary.openBlockerCount,
    pdfSummary.legacyAliasScopeMismatchCount + pdfSummary.unregisteredSourceCandidateCount,
    'Open PDF identity blockers',
  )
  requireExact(pdfSummary.technicalFailureCount, 0, 'Tracked PDF technical failures')
  requireExact(pdfSummary.semantics.technicalExtractionOnly, true, 'PDF technical-extraction boundary')
  requireExact(pdfSummary.semantics.privateTextStorageOnly, true, 'PDF private-text boundary')
  requireExact(pdfGenerationManifest.semantics.portableTrackedValidationSupported, true, 'Portable PDF validation support')
  requireExact(pdfGenerationManifest.semantics.privateStorageValidationRequiresArchiveRoots, true, 'Private PDF archive validation boundary')
  requireExact(trackedPdf.privateVerificationPerformed, false, 'Portable PDF private verification state')

  return {
    corpus: {
      summary,
      activeIdentities: registerRows.length,
      contentHashBoundIdentities,
      repositoryHashBoundBytes,
      privateRecoveryHashBoundBytes,
      hashBoundBytes: repositoryHashBoundBytes + privateRecoveryHashBoundBytes,
      missingRepositoryFiles: repositoryStates.missing,
      noLocatorIdentities: repositoryStates.no_locator,
      deduplicatedProcessingUnits: summary.queues.fullTextProcessingUnits,
      fullTextComplete,
      sourceRoleOwnerConfirmed,
      ownerReviewed,
      independentlyValidated,
      partnerValidated,
      rightsHolderValidated,
      rightsCleared,
      publicationApproved,
      externalUseReady,
      coverageApproved,
    },
    review: {
      canonicalLayerCount: reviewLayers.length,
      unclassifiedLegacyMappingCount: legacyMappings.length,
      legacyStatusOnlyCanonicalHumanApprovals: 0,
    },
    pdf: {
      technicalUnits: pdfSummary.targetCount,
      technicallyQualifiedUnits: pdfSummary.technicallyQualifiedCount,
      technicalFailures: pdfSummary.technicalFailureCount,
      extractedPages: pdfSummary.totals.pageCount,
      extractedWords: pdfSummary.totals.wordCount,
      warningPages: pdfSummary.totals.warningPageCount,
      openIdentityBlockers: pdfSummary.openBlockerCount,
      legacyAliasScopeBlockers: pdfSummary.legacyAliasScopeMismatchCount,
      unregisteredSourceCandidateBlockers: pdfSummary.unregisteredSourceCandidateCount,
      aiAnalysisComplete: pdfSummary.semantics.aiAnalysisComplete,
      ownerReviewComplete: pdfSummary.semantics.ownerReviewComplete,
      independentValidationComplete: pdfSummary.semantics.independentValidationComplete,
      rightsCleared: pdfSummary.semantics.rightsCleared,
      publicationReady: pdfSummary.semantics.publicationReady,
      coveragePromotionAllowed: pdfSummary.semantics.coveragePromotionAllowed,
      portableTrackedValidationSupported: Boolean(
        pdfGenerationManifest.semantics.portableTrackedValidationSupported,
      ),
      privateVerificationPerformed: trackedPdf.privateVerificationPerformed,
    },
  }
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
  knowledgeInputs: Gate1KnowledgeInputs,
  supersedesId: string | null,
): JsonObject {
  const corpus = knowledgeInputs.corpus
  const review = knowledgeInputs.review
  const pdf = knowledgeInputs.pdf
  const corpusProcessingSnapshotIds = [
    sourceSnapshotId('corpus_processing_summary'),
    sourceSnapshotId('corpus_processing_manifest'),
    sourceSnapshotId('corpus_processing_register'),
    sourceSnapshotId('corpus_processing_lifecycle_contract'),
    sourceSnapshotId('corpus_processing_lifecycle_schema'),
  ]
  const reviewContractSnapshotIds = [
    sourceSnapshotId('review_layer_contract'),
    sourceSnapshotId('review_layer_schema'),
  ]
  const pdfExtractionSnapshotIds = [
    sourceSnapshotId('pdf_page_extraction_summary'),
    sourceSnapshotId('pdf_page_extraction_manifest'),
  ]
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
    metric('health_metric.corpus_active_identities', 'Active whole-corpus identities', corpus.activeIdentities, {
      numerator: corpus.activeIdentities,
      denominator: corpus.summary.activeCorpus.expected,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'strict manifest validation plus lifecycle-register row and identity count',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['This enumerates the declared active corpus baseline; it does not prove Nordic food-system subject completeness.'],
    }),
    metric('health_metric.corpus_content_hash_bound_identities', 'Active identities bound to source-content hashes', corpus.contentHashBoundIdentities, {
      numerator: corpus.contentHashBoundIdentities,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'validate every lifecycle record and count non-null source content hashes',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_hash_bound_bytes', 'Hash-bound source bytes represented by lifecycle identities', corpus.hashBoundBytes, {
      unit: 'bytes',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'sum exact repository or private-recovery byte sizes matching lifecycle content hashes',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: [
        `Repository-bound bytes: ${corpus.repositoryHashBoundBytes}.`,
        `Private-recovery metadata-bound bytes: ${corpus.privateRecoveryHashBoundBytes}; portable generation does not verify the private files live.`,
        'Byte volume does not imply full-text processing, understanding, appraisal or coverage.',
      ],
    }),
    metric('health_metric.corpus_missing_repository_files', 'Active identities with a known but missing repository file', corpus.missingRepositoryFiles, {
      numerator: corpus.missingRepositoryFiles,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'validated lifecycle-register repository state count',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_no_locator_identities', 'Active identities without a file locator', corpus.noLocatorIdentities, {
      numerator: corpus.noLocatorIdentities,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'validated lifecycle-register repository state count',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_known_identity_alias_mismatches', 'Known corpus identity or legacy-alias mismatches', corpus.summary.roles.knownIdentityAliasMismatches, {
      numerator: corpus.summary.roles.knownIdentityAliasMismatches,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'read manifest-bound identity-review queue count',
      authorityLayer: 'operational_status',
      caveats: ['A legacy filename or alias must not determine source role or subject scope.'],
    }),
    metric('health_metric.corpus_deduplicated_processing_units', 'Content-deduplicated full-text processing units', corpus.deduplicatedProcessingUnits, {
      unit: 'processing_units',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'manifest-bound corpus processing queue count',
      authorityLayer: 'operational_status',
      caveats: ['A processing unit is a queued unit of work, not a completed reading or researched knowledge unit.'],
    }),
    metric('health_metric.corpus_full_text_complete', 'Lifecycle identities with completed full-text processing', corpus.fullTextComplete, {
      numerator: corpus.fullTextComplete,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'validate every lifecycle and count completed full_text stages',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['Stored word counts, summaries, triage cards and technical extraction do not satisfy this lifecycle stage.'],
    }),
    metric('health_metric.corpus_source_role_owner_confirmed', 'Lifecycle identities with owner-confirmed source role', corpus.sourceRoleOwnerConfirmed, {
      numerator: corpus.sourceRoleOwnerConfirmed,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive permissions from every validated lifecycle record',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: [`Machine-provisional source-role classifications: ${corpus.summary.roles.provisionalMachineClassifications}.`],
    }),
    metric('health_metric.corpus_owner_reviewed', 'Lifecycle identities approved for internal use by Gabriel', corpus.ownerReviewed, {
      numerator: corpus.ownerReviewed,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive owner-approval permission from exact lifecycle receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['Project-owner approval is separate from independent expert, partner and rights-holder validation.'],
    }),
    metric('health_metric.corpus_independently_validated', 'Lifecycle identities independently expert-validated', corpus.independentlyValidated, {
      numerator: corpus.independentlyValidated,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive independent-validation permission from exact qualified reviewer receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_partner_validated', 'Lifecycle identities partner-validated', corpus.partnerValidated, {
      numerator: corpus.partnerValidated,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive partner-validation permission from exact lifecycle receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_rights_holder_validated', 'Lifecycle identities rights-holder-validated', corpus.rightsHolderValidated, {
      numerator: corpus.rightsHolderValidated,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive rights-holder validation from exact authority-bound lifecycle receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['Rights-holder validation is a separate decision from rights clearance.'],
    }),
    metric('health_metric.corpus_rights_cleared', 'Lifecycle identities with rights cleared for a declared internal use', corpus.rightsCleared, {
      numerator: corpus.rightsCleared,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive rights clearance from exact lifecycle authority receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_publication_approved', 'Lifecycle identities with an exact publication approval receipt', corpus.publicationApproved, {
      numerator: corpus.publicationApproved,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'count exact publication approval receipts in validated lifecycle records',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_external_use_ready', 'Lifecycle identities currently allowed for external use', corpus.externalUseReady, {
      numerator: corpus.externalUseReady,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'derive fail-closed external-use permission from all lifecycle gates',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.corpus_coverage_approved', 'Lifecycle identities with a separate coverage-promotion approval', corpus.coverageApproved, {
      numerator: corpus.coverageApproved,
      denominator: corpus.activeIdentities,
      unit: 'identities',
      sourceSnapshotIds: corpusProcessingSnapshotIds,
      command: 'count exact coverage-assessment receipts in validated lifecycle records',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['This health metric reports approval receipts only and cannot itself create or promote a subject-coverage cell.'],
    }),
    metric('health_metric.legacy_gate2c_unclassified_mappings', 'Legacy Gate 2C status mappings awaiting signer-role classification', review.unclassifiedLegacyMappingCount, {
      unit: 'mappings',
      sourceSnapshotIds: reviewContractSnapshotIds,
      command: 'validate canonical review contract and inspect all legacy mappings',
      authorityLayer: 'repository_contract',
      observationMode: 'derived_comparison',
      caveats: ['The machine-checked component maps only to AI processing; every legacy human status remains unclassified.'],
    }),
    metric('health_metric.legacy_gate2c_status_only_canonical_human_approvals', 'Canonical human approvals created by legacy Gate 2C status alone', review.legacyStatusOnlyCanonicalHumanApprovals, {
      numerator: review.legacyStatusOnlyCanonicalHumanApprovals,
      denominator: review.unclassifiedLegacyMappingCount,
      unit: 'approvals',
      sourceSnapshotIds: reviewContractSnapshotIds,
      command: 'apply fail-closed legacy receipt classification policy',
      authorityLayer: 'repository_contract',
      observationMode: 'derived_comparison',
      caveats: ['A human-review label is not an owner, independent expert, partner or rights-holder approval without signer authority, gate role and exact scope evidence.'],
    }),
    metric('health_metric.pdf_technical_units', 'PDF units in the tracked technical-extraction batch', pdf.technicalUnits, {
      numerator: pdf.technicallyQualifiedUnits,
      denominator: pdf.technicalUnits,
      unit: 'raw_pdf_sha256_units',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'strict portable validation of tracked PDF qualification bundle',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['Technical qualification is not AI reading, evidence appraisal, human validation, rights clearance or coverage.'],
    }),
    metric('health_metric.pdf_technical_failures', 'Technical failures in the tracked PDF extraction batch', pdf.technicalFailures, {
      numerator: pdf.technicalFailures,
      denominator: pdf.technicalUnits,
      unit: 'raw_pdf_sha256_units',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'strict portable validation of tracked PDF qualification bundle',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: [`The ${pdf.openIdentityBlockers} open identity blockers are not technical extraction failures.`],
    }),
    metric('health_metric.pdf_extracted_pages', 'Pages technically extracted from the tracked PDF batch', pdf.extractedPages, {
      numerator: pdf.extractedPages,
      denominator: pdf.extractedPages,
      unit: 'pages',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'cross-check expected page counts, page maps and qualification receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: [`The page count proves extraction coverage of this ${pdf.technicalUnits}-document batch only, not semantic reading or Nordic food-system coverage.`],
    }),
    metric('health_metric.pdf_extracted_words', 'Words emitted by technical PDF text extraction', pdf.extractedWords, {
      unit: 'words',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'sum manifest-bound per-document extraction receipts',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['Word volume is extraction output only and must never be reported as AI reading, understanding, review or coverage.'],
    }),
    metric('health_metric.pdf_warning_pages', 'Technically extracted PDF pages carrying warnings', pdf.warningPages, {
      numerator: pdf.warningPages,
      denominator: pdf.extractedPages,
      unit: 'pages',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'sum warning pages in manifest-bound extraction summary',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_open_identity_blockers', 'Open PDF identity-registration blockers', pdf.openIdentityBlockers, {
      numerator: pdf.openIdentityBlockers,
      denominator: pdf.technicalUnits,
      unit: 'blockers',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'validate blocker queue count against the sum of every recognized identity-blocker class',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
      caveats: ['Open identity blockers are kept separate from technical extraction failures and from completed source registration.'],
    }),
    metric('health_metric.pdf_open_alias_blockers', 'Open PDF legacy-alias scope blockers', pdf.legacyAliasScopeBlockers, {
      numerator: pdf.legacyAliasScopeBlockers,
      denominator: pdf.technicalUnits,
      unit: 'blockers',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'validate the legacy-alias scope-mismatch subset of the blocker queue',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
      caveats: ['Legacy aliases require an explicit owner scope disposition before identity binding.'],
    }),
    metric('health_metric.pdf_open_unregistered_source_candidate_blockers', 'Open PDF unregistered-source candidate blockers', pdf.unregisteredSourceCandidateBlockers, {
      numerator: pdf.unregisteredSourceCandidateBlockers,
      denominator: pdf.technicalUnits,
      unit: 'blockers',
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'validate the unregistered-source candidate subset of the blocker queue',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
      caveats: ['Technical extraction does not register a candidate as a canonical corpus identity.'],
    }),
    metric('health_metric.pdf_ai_analysis_complete', 'Tracked PDF batch has completed AI analysis', pdf.aiAnalysisComplete, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_owner_review_complete', 'Tracked PDF batch has completed owner review', pdf.ownerReviewComplete, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_independent_validation_complete', 'Tracked PDF batch has completed independent validation', pdf.independentValidationComplete, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_rights_cleared', 'Tracked PDF batch has completed rights clearance', pdf.rightsCleared, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_publication_ready', 'Tracked PDF batch is publication-ready', pdf.publicationReady, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_coverage_promotion_allowed', 'Tracked PDF batch permits coverage promotion', pdf.coveragePromotionAllowed, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'read strict extraction semantics after portable bundle validation',
      authorityLayer: 'structured_evidence',
      observationMode: 'derived_comparison',
      caveats: ['This boolean is false; corpus health cannot change that state.'],
    }),
    metric('health_metric.pdf_portable_tracked_validation_supported', 'Tracked PDF bundle validates portably from repository artifacts', pdf.portableTrackedValidationSupported, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'strictly validate generation self-hash, inputs, outputs, page maps, receipts and blocker queue',
      authorityLayer: 'repository_contract',
      observationMode: 'derived_comparison',
    }),
    metric('health_metric.pdf_private_verification_performed', 'Private PDF archive roots verified during this portable health run', pdf.privateVerificationPerformed, {
      sourceSnapshotIds: pdfExtractionSnapshotIds,
      command: 'portable tracked qualification check without private archive-root arguments',
      authorityLayer: 'operational_status',
      observationMode: 'derived_comparison',
      caveats: ['Private storage verification requires explicit archive roots and remains false in a portable tracked run.'],
    }),
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
    { dimensionId: 'inventory', state: 'enumerated', verdict: 'pass_with_warnings', metricIds: ['health_metric.corpus_active_identities', 'health_metric.corpus_content_hash_bound_identities', 'health_metric.corpus_hash_bound_bytes', 'health_metric.pdf_technical_units', 'health_metric.library_inventory', 'health_metric.database_evidence', 'health_metric.vault_markdown'], blockerConflictIds: [], limitations: ['The declared 1,555-identity active corpus baseline is exhaustively enumerated and manifest-bound, but this is not an exhaustive universe of Nordic food-system subjects or sources.'] },
    { dimensionId: 'provenanceLocator', state: 'mixed', verdict: 'degraded', metricIds: ['health_metric.corpus_missing_repository_files', 'health_metric.corpus_no_locator_identities', 'health_metric.corpus_known_identity_alias_mismatches', 'health_metric.pdf_open_identity_blockers', 'health_metric.pdf_open_alias_blockers', 'health_metric.pdf_open_unregistered_source_candidate_blockers', 'health_metric.documents_resolved', 'health_metric.exact_claim_anchors'], blockerConflictIds: [], limitations: [`Some lifecycle identities lack reachable repository files or locators; ${pdf.legacyAliasScopeBlockers} PDF aliases remain scope-blocked; ${pdf.unregisteredSourceCandidateBlockers} extracted PDF candidates remain unregistered; and most claim text lacks page or quote anchors.`] },
    { dimensionId: 'citationReadiness', state: 'mixed', verdict: 'degraded', metricIds: ['health_metric.source_citations', 'health_metric.field_citations', 'health_metric.blocked_citations'], blockerConflictIds: [], limitations: ['Technical citation integrity coexists with blocked rows and zero appraisal.'] },
    { dimensionId: 'appraisal', state: 'none_completed', verdict: 'blocked', metricIds: ['health_metric.evidence_appraisal'], blockerConflictIds: [], limitations: ['No evidence record has complete current appraisal.'] },
    { dimensionId: 'archive', state: 'partial_durable', verdict: 'blocked', metricIds: ['health_metric.archive_durable_rows', 'health_metric.external_rows_needing_archive'], blockerConflictIds: [], limitations: ['The archive gate fails and most external-readiness rows still need durable evidence.'] },
    { dimensionId: 'identity', state: seedIdentityParity && libraryIdentityParity ? 'parity_verified' : 'conflicts_open', verdict: seedIdentityParity && libraryIdentityParity ? 'pass' : 'blocked', metricIds: ['health_metric.database_only_evidence_identities', 'health_metric.managed_runtime_evidence_identities', 'health_metric.unclassified_database_only_evidence_identities', 'health_metric.missing_managed_runtime_evidence_identities', 'health_metric.seed_only_evidence_identities', 'health_metric.library_live_materialization', 'health_metric.library_retained_history_rows', 'health_metric.library_inventory_only_rows', 'health_metric.library_retained_history_contract_issues'], blockerConflictIds: [conflictIds.seedParity, conflictIds.library].filter((id) => openConflictIds.includes(id)), limitations: [migrationLineageParity ? 'Migration identity is reconciled; classified seed/runtime parity and live library identity are assessed independently. Raw row-count equality is not required for declared runtime-managed evidence or contract-bound retained library history.' : 'Migration identity remains unreconciled.'] },
    { dimensionId: 'queueWorkflow', state: 'partially_controlled', verdict: 'pass_with_warnings', metricIds: ['health_metric.corpus_deduplicated_processing_units', 'health_metric.corpus_full_text_complete', 'health_metric.corpus_source_role_owner_confirmed', 'health_metric.gap_program_rows', 'health_metric.gaps_newly_closed', 'health_metric.remediation_rows'], blockerConflictIds: [], limitations: ['The corpus is routed into deduplicated processing and review queues, but zero full-text stages and zero owner source-role confirmations are complete.'] },
    { dimensionId: 'freshnessVintage', state: 'conflicting_vintages', verdict: 'blocked', metricIds: ['health_metric.remediation_rows', 'health_metric.library_projection_updates_reported'], blockerConflictIds: [conflictIds.remediation, conflictIds.vault].filter((id) => openConflictIds.includes(id)), limitations: ['The academic status is current, but remediation, vault and operational receipts retain different subject vintages; 15 metadata-only library projection updates are reported separately from identity.'] },
    { dimensionId: 'structuralIntegrity', state: 'passed_with_warnings', verdict: 'degraded', metricIds: ['health_metric.vault_issues', 'health_metric.head_migrations', 'health_metric.database_migrations', 'health_metric.migration_lineage_mismatches'], blockerConflictIds: [conflictIds.lineage, conflictIds.vault, conflictIds.regression].filter((id) => openConflictIds.includes(id)), limitations: [migrationLineageParity ? 'Migration structure reproduces exactly; the vault validator still reports separate navigation issues.' : 'Migration structure does not reproduce on the pinned lineage.'] },
    { dimensionId: 'humanReview', state: 'pending', verdict: 'blocked', metricIds: ['health_metric.corpus_owner_reviewed', 'health_metric.corpus_independently_validated', 'health_metric.corpus_partner_validated', 'health_metric.corpus_rights_holder_validated', 'health_metric.legacy_gate2c_status_only_canonical_human_approvals', 'health_metric.pdf_owner_review_complete', 'health_metric.library_named_reviews', 'health_metric.evidence_appraisal'], blockerConflictIds: [], limitations: ["Gabriel's project-owner review is zero and remains distinct from independent expert, partner and rights-holder validation, which are also zero. Legacy Gate 2C human-status labels remain unclassified and create no canonical approval."] },
    { dimensionId: 'operationalProof', state: 'partially_verified', verdict: 'blocked', metricIds: ['health_metric.database_migrations', 'health_metric.migration_lineage_mismatches'], blockerConflictIds: openConflictIds, limitations: ['The local migration lineage is reproducible, but current production parity, fresh restore, complete role-enforced interface proof and required human gates remain outside this receipt.'] },
    { dimensionId: 'conflictControl', state: openConflictIds.length > 0 ? 'open' : 'resolved', verdict: openConflictIds.length > 0 ? 'blocked' : 'pass', metricIds: [], blockerConflictIds: openConflictIds, limitations: [`${conflicts.length - openConflictIds.length} conflict records are receipt-resolved; ${openConflictIds.length} remain open.`] },
    { dimensionId: 'receiptIntegrity', state: 'partial', verdict: 'degraded', metricIds: ['health_metric.corpus_rights_cleared', 'health_metric.corpus_publication_approved', 'health_metric.corpus_external_use_ready', 'health_metric.corpus_coverage_approved', 'health_metric.pdf_portable_tracked_validation_supported', 'health_metric.pdf_private_verification_performed'], blockerConflictIds: [], limitations: ['Machine receipts cover lineage, lifecycle validation and the portable PDF bundle. They do not satisfy owner, expert, partner, rights-holder, rights-clearance, publication or coverage gates; private archive roots were not verified in this portable run.'] },
    { dimensionId: 'sourceSnapshotIntegrity', state: 'hash_bound', verdict: 'pass', metricIds: [], blockerConflictIds: [], limitations: ['This assessment binds file snapshots and the read-only database result to hashes; it does not prove production parity.'] },
  ]

  const profileVerdicts: JsonObject[] = [
    {
      profileId: 'health_profile.internal_discovery',
      verdict: 'ready_with_warnings',
      readyForProfile: true,
      reasonCodes: ['active_corpus_enumerated', 'bounded_inventory_available', 'hash_bound_snapshot', 'migration_lineage_reconciled'],
      blockingConflictIds: [],
      checks: [
        { checkId: 'health_check.discovery.inventory', status: 'pass', reason: `The declared active corpus baseline contains ${corpus.activeIdentities} unique lifecycle identities, of which ${corpus.contentHashBoundIdentities} are bound to source-content hashes; subject completeness is explicitly not implied.` },
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
        ...(corpus.fullTextComplete === 0 ? ['whole_corpus_full_text_zero'] : []),
        'status_vintage_conflicts',
      ],
      blockingConflictIds: [conflictIds.seedParity, conflictIds.library, conflictIds.remediation, conflictIds.vault].filter((id) => openConflictIds.includes(id)),
      checks: [
        { checkId: 'health_check.analysis.lineage', status: migrationLineageParity ? 'pass' : 'fail', reason: migrationLineageParity ? `All ${headMigrations.length} migration names and SQL checksums match the local database.` : 'Repository and database migrations do not match.' },
        { checkId: 'health_check.analysis.identity', status: seedIdentityParity && libraryIdentityParity ? 'pass' : 'fail', reason: `Evidence identity has ${dbOnlyEvidenceIds.length} raw database-only rows: ${managedRuntimeEvidenceIds.length} declared runtime-managed, ${unclassifiedDbOnlyEvidenceIds.length} unclassified, ${seedOnlyEvidenceIds.length} seed-only and ${missingManagedRuntimeEvidenceIds.length} missing declared-managed. Library identity has ${libraryRetainedHistoryInspection.summary.livePersistedRows}/${libraryLedger.length} live materializations, ${libraryRetainedHistoryInspection.summary.retainedHistoryRows} contract-bound history rows, ${inventoryOnlyLibraryKeys.length} inventory-only rows and ${libraryRetainedHistoryInspection.issues.length} contract issues.` },
        { checkId: 'health_check.analysis.library_projection', status: LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates > 0 ? 'warning' : 'pass', reason: `${LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.projectionFreshnessMaterialUpdates} metadata-only projection updates were reported by the reviewed dry run; this is separate from live identity and retained history.` },
        { checkId: 'health_check.analysis.corpus_processing', status: corpus.fullTextComplete === corpus.activeIdentities ? 'pass' : 'fail', reason: `Full-text lifecycle completion is ${corpus.fullTextComplete}/${corpus.activeIdentities}; the ${pdf.extractedPages} extracted PDF pages and ${pdf.extractedWords} extracted words are technical output only and do not change this count.` },
        { checkId: 'health_check.analysis.vintage', status: 'warning', reason: 'The academic status now reproduces, while remediation, vault and operational receipts still have mixed vintages.' },
      ],
    },
    {
      profileId: 'health_profile.external_evidence_support',
      verdict: 'blocked',
      readyForProfile: false,
      reasonCodes: ['evidence_appraisal_zero', 'archive_gate_failed', 'owner_review_zero', 'independent_validation_zero', 'rights_clearance_zero', ...(!(seedIdentityParity && libraryIdentityParity) ? ['identity_unreconciled'] : []), 'human_review_pending'],
      blockingConflictIds: [conflictIds.seedParity, conflictIds.library].filter((id) => openConflictIds.includes(id)),
      checks: [
        { checkId: 'health_check.external.appraisal', status: 'fail', reason: `Complete current appraisal is ${db.counts.evidenceAppraisals}/${db.counts.totalEvidence}.` },
        { checkId: 'health_check.external.archive', status: 'fail', reason: `${db.archiveSummary.byReadiness.citable_external.needsArchive + db.archiveSummary.byReadiness.citable_with_note.needsArchive}/${db.archiveSummary.totals.externalReadinessRows} external-readiness citations need durable archive.` },
        { checkId: 'health_check.external.identity', status: migrationLineageParity && seedIdentityParity && libraryIdentityParity ? 'pass' : 'fail', reason: migrationLineageParity && seedIdentityParity && libraryIdentityParity ? 'Migration, classified evidence and library identities are reconciled; this does not satisfy appraisal, archive or human-review gates.' : `Migration parity is ${migrationLineageParity}; classified evidence parity is ${seedIdentityParity}; library parity is ${libraryIdentityParity}.` },
        { checkId: 'health_check.external.human', status: 'fail', reason: `Gabriel owner approvals are ${corpus.ownerReviewed}/${corpus.activeIdentities}; independent expert validations ${corpus.independentlyValidated}; partner validations ${corpus.partnerValidated}; rights-holder validations ${corpus.rightsHolderValidated}. Legacy Gate 2C labels create ${review.legacyStatusOnlyCanonicalHumanApprovals} canonical human approvals.` },
        { checkId: 'health_check.external.authorization', status: 'fail', reason: `Rights-cleared lifecycle identities: ${corpus.rightsCleared}; publication approvals: ${corpus.publicationApproved}; external-use-ready identities: ${corpus.externalUseReady}; separate coverage approvals: ${corpus.coverageApproved}.` },
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
        { checkId: 'health_check.operations.receipts', status: 'fail', reason: `Machine lineage and portable tracked-PDF receipts are present; private archive verification is ${pdf.privateVerificationPerformed}, while required fresh operational and human receipts remain incomplete.` },
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
    `## Whole-corpus processing boundary\n\n` +
    `- Active baseline: **${metricNumber(assessment, 'health_metric.corpus_active_identities')}** unique identities; **${metricNumber(assessment, 'health_metric.corpus_content_hash_bound_identities')}** bind exact source-content hashes representing **${metricNumber(assessment, 'health_metric.corpus_hash_bound_bytes')} bytes**. **${metricNumber(assessment, 'health_metric.corpus_missing_repository_files')}** known files are missing and **${metricNumber(assessment, 'health_metric.corpus_no_locator_identities')}** identities have no locator.\n` +
    `- Processing queue: **${metricNumber(assessment, 'health_metric.corpus_deduplicated_processing_units')}** content-deduplicated units; full-text processing is **${metricNumber(assessment, 'health_metric.corpus_full_text_complete')}/${metricNumber(assessment, 'health_metric.corpus_active_identities')}** and owner-confirmed source roles are **${metricNumber(assessment, 'health_metric.corpus_source_role_owner_confirmed')}/${metricNumber(assessment, 'health_metric.corpus_active_identities')}**.\n` +
    `- Human and authorization gates: Gabriel owner review **${metricNumber(assessment, 'health_metric.corpus_owner_reviewed')}**; independent expert validation **${metricNumber(assessment, 'health_metric.corpus_independently_validated')}**; partner validation **${metricNumber(assessment, 'health_metric.corpus_partner_validated')}**; rights-holder validation **${metricNumber(assessment, 'health_metric.corpus_rights_holder_validated')}**; rights clearance **${metricNumber(assessment, 'health_metric.corpus_rights_cleared')}**; publication approval **${metricNumber(assessment, 'health_metric.corpus_publication_approved')}**; separate coverage approval **${metricNumber(assessment, 'health_metric.corpus_coverage_approved')}**.\n` +
    `- Tracked PDF extraction: **${metricNumber(assessment, 'health_metric.pdf_technical_units')}** technical units with **${metricNumber(assessment, 'health_metric.pdf_technical_failures')} technical failures**, **${metricNumber(assessment, 'health_metric.pdf_extracted_pages')}/${metricNumber(assessment, 'health_metric.pdf_extracted_pages')} pages**, **${metricNumber(assessment, 'health_metric.pdf_extracted_words')} extracted words**, **${metricNumber(assessment, 'health_metric.pdf_warning_pages')} warning pages** and **${metricNumber(assessment, 'health_metric.pdf_open_identity_blockers')} open identity blockers**: **${metricNumber(assessment, 'health_metric.pdf_open_alias_blockers')}** legacy alias/scope blockers and **${metricNumber(assessment, 'health_metric.pdf_open_unregistered_source_candidate_blockers')}** unregistered-source candidate blockers. These are extraction-volume facts, not AI reading or semantic analysis.\n` +
    `- PDF receipt boundary: portable tracked validation is **${String(findMetric(assessment, 'health_metric.pdf_portable_tracked_validation_supported').value)}**; live private-archive verification in this run is **${String(findMetric(assessment, 'health_metric.pdf_private_verification_performed').value)}**. AI analysis, owner review, independent validation, rights clearance, publication readiness and coverage permission all remain false for this batch.\n` +
    `- Legacy Gate 2C: **${metricNumber(assessment, 'health_metric.legacy_gate2c_status_only_canonical_human_approvals')}** canonical human approvals are created by status alone. All **${metricNumber(assessment, 'health_metric.legacy_gate2c_unclassified_mappings')}** legacy mappings retain an unclassified human-review component until signer authority, gate role and exact scope are evidenced.\n\n` +
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
    `1. Process the ${metricNumber(assessment, 'health_metric.corpus_deduplicated_processing_units')} deduplicated corpus units through exact full-text, claim and cross-check receipts; do not treat PDF extraction volume as reading completion.\n` +
    `2. Record Gabriel's owner review separately from independent expert, partner and rights-holder validation, then complete rights, publication and coverage decisions only where required.\n` +
    `3. Resolve the ${metricNumber(assessment, 'health_metric.corpus_missing_repository_files')} missing files, ${metricNumber(assessment, 'health_metric.corpus_no_locator_identities')} no-locator identities and ${metricNumber(assessment, 'health_metric.pdf_open_identity_blockers')} PDF identity blockers (${metricNumber(assessment, 'health_metric.pdf_open_alias_blockers')} legacy alias/scope and ${metricNumber(assessment, 'health_metric.pdf_open_unregistered_source_candidate_blockers')} unregistered candidates).\n` +
    `4. Keep the receipt-bound 31/31 migration lineage check green as schema and migrations evolve.\n` +
    `5. Reconcile every unclassified database-only, seed-only and missing declared-managed identity while preserving the manifest-derived runtime identity boundary.\n` +
    `6. Keep the ${metricNumber(assessment, 'health_metric.library_live_materialization')}/${metricNumber(assessment, 'health_metric.library_inventory')} live library identity check exact, revalidate all ${metricNumber(assessment, 'health_metric.library_retained_history_rows')} retained-history rows, and close the separate metadata-only projection-freshness queue.\n` +
    `7. Complete reviewed appraisal, durable archive work, fresh backup/restore proof, MCP role enforcement and runtime parity for each required use.\n\n` +
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
  const knowledgeInputs = loadGate1KnowledgeInputs(ROOT)
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
    knowledgeInputs,
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
      corpusActiveIdentities: metricNumber(assessment, 'health_metric.corpus_active_identities'),
      corpusContentHashBoundIdentities: metricNumber(assessment, 'health_metric.corpus_content_hash_bound_identities'),
      corpusHashBoundBytes: metricNumber(assessment, 'health_metric.corpus_hash_bound_bytes'),
      corpusMissingRepositoryFiles: metricNumber(assessment, 'health_metric.corpus_missing_repository_files'),
      corpusNoLocatorIdentities: metricNumber(assessment, 'health_metric.corpus_no_locator_identities'),
      corpusKnownIdentityAliasMismatches: metricNumber(assessment, 'health_metric.corpus_known_identity_alias_mismatches'),
      corpusDeduplicatedProcessingUnits: metricNumber(assessment, 'health_metric.corpus_deduplicated_processing_units'),
      corpusFullTextComplete: metricNumber(assessment, 'health_metric.corpus_full_text_complete'),
      corpusSourceRoleOwnerConfirmed: metricNumber(assessment, 'health_metric.corpus_source_role_owner_confirmed'),
      corpusOwnerReviewed: metricNumber(assessment, 'health_metric.corpus_owner_reviewed'),
      corpusIndependentlyValidated: metricNumber(assessment, 'health_metric.corpus_independently_validated'),
      corpusPartnerValidated: metricNumber(assessment, 'health_metric.corpus_partner_validated'),
      corpusRightsHolderValidated: metricNumber(assessment, 'health_metric.corpus_rights_holder_validated'),
      corpusRightsCleared: metricNumber(assessment, 'health_metric.corpus_rights_cleared'),
      corpusPublicationApproved: metricNumber(assessment, 'health_metric.corpus_publication_approved'),
      corpusExternalUseReady: metricNumber(assessment, 'health_metric.corpus_external_use_ready'),
      corpusCoverageApproved: metricNumber(assessment, 'health_metric.corpus_coverage_approved'),
      legacyGate2cUnclassifiedMappings: metricNumber(assessment, 'health_metric.legacy_gate2c_unclassified_mappings'),
      legacyGate2cStatusOnlyCanonicalHumanApprovals: metricNumber(assessment, 'health_metric.legacy_gate2c_status_only_canonical_human_approvals'),
      pdfTechnicalUnits: metricNumber(assessment, 'health_metric.pdf_technical_units'),
      pdfTechnicalFailures: metricNumber(assessment, 'health_metric.pdf_technical_failures'),
      pdfExtractedPages: metricNumber(assessment, 'health_metric.pdf_extracted_pages'),
      pdfExtractedWords: metricNumber(assessment, 'health_metric.pdf_extracted_words'),
      pdfWarningPages: metricNumber(assessment, 'health_metric.pdf_warning_pages'),
      pdfOpenIdentityBlockers: metricNumber(assessment, 'health_metric.pdf_open_identity_blockers'),
      pdfOpenAliasBlockers: metricNumber(assessment, 'health_metric.pdf_open_alias_blockers'),
      pdfOpenUnregisteredSourceCandidateBlockers: metricNumber(
        assessment,
        'health_metric.pdf_open_unregistered_source_candidate_blockers',
      ),
      pdfAiAnalysisComplete: findMetric(assessment, 'health_metric.pdf_ai_analysis_complete').value,
      pdfOwnerReviewComplete: findMetric(assessment, 'health_metric.pdf_owner_review_complete').value,
      pdfIndependentValidationComplete: findMetric(assessment, 'health_metric.pdf_independent_validation_complete').value,
      pdfRightsCleared: findMetric(assessment, 'health_metric.pdf_rights_cleared').value,
      pdfPublicationReady: findMetric(assessment, 'health_metric.pdf_publication_ready').value,
      pdfCoveragePromotionAllowed: findMetric(assessment, 'health_metric.pdf_coverage_promotion_allowed').value,
      pdfPortableTrackedValidationSupported: findMetric(assessment, 'health_metric.pdf_portable_tracked_validation_supported').value,
      pdfPrivateVerificationPerformed: findMetric(assessment, 'health_metric.pdf_private_verification_performed').value,
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
    inputs: [...new Set([GENERATOR_PATH, SCHEMA_PATH, THRESHOLDS_PATH, ...GATE1_KNOWLEDGE_INPUT_PATHS])].map((path) => {
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
