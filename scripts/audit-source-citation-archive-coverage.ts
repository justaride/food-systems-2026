import 'dotenv/config'

import { existsSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import {
  normalizeCitationReadiness,
  type CitationReadinessLevel,
} from '../src/lib/citations/citation-status'

export type ArchiveAuditInput = {
  id: string
  citationReadiness: string
  url?: string | null
  archivedUrl?: string | null
  localPath?: string | null
  fileHash?: string | null
  contentHash?: string | null
  hashAlgorithm?: string | null
  documentId?: string | null
  sourceDocId?: string | null
  document?: {
    filePath?: string | null
    archivedUrl?: string | null
  } | null
  sourceDoc?: {
    archivedUrl?: string | null
    document?: {
      filePath?: string | null
      archivedUrl?: string | null
    } | null
  } | null
}

export type ArchiveAuditIssue = {
  code: string
  severity: 'error' | 'warning' | 'info'
  message: string
}

export type OriginalUrlStatus = 'missing' | 'valid' | 'invalid'
export type ArchivedUrlStatus = 'missing' | 'wayback' | 'other_archive' | 'invalid'
export type LocalSnapshotStatus =
  | 'none'
  | 'hashed_present'
  | 'unhashed_present'
  | 'path_missing'
  | 'invalid_hash'
  | 'hash_without_path'
export type HashStatus = 'missing' | 'sha256' | 'invalid'
export type ArchiveCoverage = 'none' | 'archived_url' | 'local_hashed_snapshot' | 'both'

export type ArchiveAuditRow = {
  id: string
  readiness: CitationReadinessLevel
  externalReadiness: boolean
  originalUrl: string | null
  normalizedOriginalUrl: string | null
  originalUrlStatus: OriginalUrlStatus
  archivedUrl: string | null
  archivedUrlOrigin: 'citation' | 'document' | 'source_doc' | 'source_doc_document' | 'none'
  normalizedArchivedUrl: string | null
  archivedUrlStatus: ArchivedUrlStatus
  localPath: string | null
  localPathOrigin: 'citation' | 'document' | 'source_doc_document' | 'none'
  localSnapshotStatus: LocalSnapshotStatus
  fileHashStatus: HashStatus
  contentHashStatus: HashStatus
  archiveCoverage: ArchiveCoverage
  needsArchive: boolean
  duplicateOriginalUrlIds: string[]
  duplicateArchivedUrlIds: string[]
  duplicateFileHashIds: string[]
  issues: ArchiveAuditIssue[]
}

export type ArchiveDuplicateGroup = {
  key: string
  citationIds: string[]
}

export type ArchiveReadinessSummary = {
  total: number
  durableArchive: number
  needsArchive: number
}

export type SourceCitationArchiveAudit = {
  readOnly: true
  networkCalls: false
  artifactWrites: false
  databaseWrites: false
  gate: {
    status: 'pass' | 'fail'
    blockingCitationIds: string[]
  }
  totals: {
    rows: number
    externalReadinessRows: number
    originalUrlRows: number
    archivedUrlRows: number
    localPathRows: number
    localHashedSnapshotRows: number
    durableArchiveRows: number
    needsArchiveRows: number
  }
  byReadiness: Record<CitationReadinessLevel, ArchiveReadinessSummary>
  duplicateGroups: {
    originalUrls: ArchiveDuplicateGroup[]
    archivedUrls: ArchiveDuplicateGroup[]
    fileHashes: ArchiveDuplicateGroup[]
  }
  rows: ArchiveAuditRow[]
}

export type ArchiveAuditCliMode = 'summary' | 'full'

export type SourceCitationArchiveAuditSummary = {
  gate: {
    status: SourceCitationArchiveAudit['gate']['status']
    blockingCount: number
  }
  totals: SourceCitationArchiveAudit['totals']
  byReadiness: SourceCitationArchiveAudit['byReadiness']
  duplicateGroupCounts: {
    originalUrls: number
    archivedUrls: number
    fileHashes: number
  }
  issueCodeCounts: Record<string, number>
}

type ArchiveAuditOptions = {
  localFileExists?: (path: string) => boolean
}

type EffectiveLocator = {
  value: string | null
  origin: ArchiveAuditRow['archivedUrlOrigin'] | ArchiveAuditRow['localPathOrigin']
}

const EXTERNAL_READINESS = new Set<CitationReadinessLevel>([
  'citable_external',
  'citable_with_note',
])

const SHA256_PATTERN = /^[a-f0-9]{64}$/i

function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizeArchiveAuditUrl(value: string | null | undefined): string | null {
  const trimmed = text(value)
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (!['http:', 'https:'].includes(parsed.protocol)) return null
    parsed.protocol = 'https:'
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    parsed.hash = ''
    parsed.searchParams.sort()
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, '')
    return parsed.toString()
  } catch {
    return null
  }
}

function isWaybackUrl(value: string): boolean {
  try {
    const parsed = new URL(value)
    return (
      ['web.archive.org', 'archive.org'].includes(parsed.hostname.toLowerCase()) &&
      (parsed.hostname.toLowerCase() === 'web.archive.org' || parsed.pathname.startsWith('/web/'))
    )
  } catch {
    return false
  }
}

function hashStatus(value: string | null | undefined, algorithm = 'sha256'): HashStatus {
  const normalized = text(value)
  if (!normalized) return 'missing'
  return algorithm.toLowerCase() === 'sha256' && SHA256_PATTERN.test(normalized)
    ? 'sha256'
    : 'invalid'
}

function effectiveArchivedUrl(row: ArchiveAuditInput): EffectiveLocator {
  const candidates: Array<[string | null | undefined, ArchiveAuditRow['archivedUrlOrigin']]> = [
    [row.archivedUrl, 'citation'],
    [row.document?.archivedUrl, 'document'],
    [row.sourceDoc?.archivedUrl, 'source_doc'],
    [row.sourceDoc?.document?.archivedUrl, 'source_doc_document'],
  ]
  const match = candidates.find(([value]) => text(value))
  return match ? { value: text(match[0]), origin: match[1] } : { value: null, origin: 'none' }
}

function effectiveLocalPath(row: ArchiveAuditInput): EffectiveLocator {
  const candidates: Array<[string | null | undefined, ArchiveAuditRow['localPathOrigin']]> = [
    [row.localPath, 'citation'],
    [row.document?.filePath, 'document'],
    [row.sourceDoc?.document?.filePath, 'source_doc_document'],
  ]
  const match = candidates.find(([value]) => text(value))
  return match ? { value: text(match[0]), origin: match[1] } : { value: null, origin: 'none' }
}

function addIssue(
  issues: ArchiveAuditIssue[],
  code: string,
  severity: ArchiveAuditIssue['severity'],
  message: string,
): void {
  if (!issues.some((issue) => issue.code === code)) issues.push({ code, severity, message })
}

function hasDirectLocator(row: ArchiveAuditInput, archivedUrl: string | null, localPath: string | null): boolean {
  return Boolean(
    text(row.url) ||
      archivedUrl ||
      localPath ||
      text(row.documentId) ||
      text(row.sourceDocId),
  )
}

function baseAuditRow(
  row: ArchiveAuditInput,
  localFileExists: (path: string) => boolean,
): ArchiveAuditRow {
  const readiness = normalizeCitationReadiness(row.citationReadiness)
  const externalReadiness = EXTERNAL_READINESS.has(readiness)
  const originalUrl = text(row.url)
  const normalizedOriginalUrl = normalizeArchiveAuditUrl(originalUrl)
  const originalUrlStatus: OriginalUrlStatus = !originalUrl
    ? 'missing'
    : normalizedOriginalUrl
      ? 'valid'
      : 'invalid'

  const archived = effectiveArchivedUrl(row)
  const normalizedArchivedUrl = normalizeArchiveAuditUrl(archived.value)
  const archivedUrlStatus: ArchivedUrlStatus = !archived.value
    ? 'missing'
    : !normalizedArchivedUrl
      ? 'invalid'
      : isWaybackUrl(normalizedArchivedUrl)
        ? 'wayback'
        : 'other_archive'

  const local = effectiveLocalPath(row)
  const fileHashStatus = hashStatus(row.fileHash, row.hashAlgorithm ?? 'sha256')
  const contentHashStatus = hashStatus(row.contentHash)
  const localPresent = local.value ? localFileExists(local.value) : false
  let localSnapshotStatus: LocalSnapshotStatus = 'none'
  if (!local.value && fileHashStatus !== 'missing') localSnapshotStatus = 'hash_without_path'
  else if (local.value && !localPresent) localSnapshotStatus = 'path_missing'
  else if (local.value && fileHashStatus === 'missing') localSnapshotStatus = 'unhashed_present'
  else if (local.value && fileHashStatus === 'invalid') localSnapshotStatus = 'invalid_hash'
  else if (local.value && fileHashStatus === 'sha256') localSnapshotStatus = 'hashed_present'

  const hasArchivedUrl = archivedUrlStatus === 'wayback' || archivedUrlStatus === 'other_archive'
  const hasLocalHashedSnapshot = localSnapshotStatus === 'hashed_present'
  const archiveCoverage: ArchiveCoverage = hasArchivedUrl
    ? hasLocalHashedSnapshot
      ? 'both'
      : 'archived_url'
    : hasLocalHashedSnapshot
      ? 'local_hashed_snapshot'
      : 'none'
  const needsArchive = externalReadiness && archiveCoverage === 'none'
  const issues: ArchiveAuditIssue[] = []

  if (originalUrlStatus === 'invalid') {
    addIssue(
      issues,
      'invalid_original_url',
      externalReadiness ? 'error' : 'warning',
      'Original URL is not an absolute HTTP(S) locator.',
    )
  }
  if (archivedUrlStatus === 'invalid') {
    addIssue(
      issues,
      'invalid_archived_url',
      externalReadiness ? 'error' : 'warning',
      'Archived URL is not an absolute HTTP(S) locator.',
    )
  }
  if (localSnapshotStatus === 'path_missing') {
    addIssue(
      issues,
      'local_file_missing',
      externalReadiness ? 'error' : 'warning',
      'Recorded local evidence path does not resolve to a file.',
    )
  }
  if (localSnapshotStatus === 'invalid_hash') {
    addIssue(
      issues,
      'invalid_file_hash',
      externalReadiness ? 'error' : 'warning',
      'Local file hash is not a SHA-256 value under the recorded algorithm.',
    )
  }
  if (localSnapshotStatus === 'hash_without_path') {
    addIssue(
      issues,
      'file_hash_without_local_path',
      externalReadiness ? 'error' : 'warning',
      'A file hash without a local evidence path is not a local snapshot locator.',
    )
  }
  if (contentHashStatus === 'invalid') {
    addIssue(
      issues,
      'invalid_content_hash',
      externalReadiness ? 'error' : 'warning',
      'contentHash is present but is not a SHA-256 value.',
    )
  }
  if (externalReadiness && !hasDirectLocator(row, archived.value, local.value)) {
    addIssue(
      issues,
      'readiness_without_direct_locator',
      'error',
      'External readiness has no URL, archive, local path, document, or SourceDoc locator.',
    )
  }
  if (needsArchive) {
    addIssue(
      issues,
      'needs_archive',
      'error',
      localSnapshotStatus === 'unhashed_present'
        ? 'External-ready citation has an unhashed local file and no archived URL.'
        : 'External-ready citation has neither a valid archived URL nor a present, SHA-256-hashed local snapshot.',
    )
  }

  return {
    id: row.id,
    readiness,
    externalReadiness,
    originalUrl,
    normalizedOriginalUrl,
    originalUrlStatus,
    archivedUrl: archived.value,
    archivedUrlOrigin: archived.origin as ArchiveAuditRow['archivedUrlOrigin'],
    normalizedArchivedUrl,
    archivedUrlStatus,
    localPath: local.value,
    localPathOrigin: local.origin as ArchiveAuditRow['localPathOrigin'],
    localSnapshotStatus,
    fileHashStatus,
    contentHashStatus,
    archiveCoverage,
    needsArchive,
    duplicateOriginalUrlIds: [],
    duplicateArchivedUrlIds: [],
    duplicateFileHashIds: [],
    issues,
  }
}

function duplicateGroups(
  rows: ArchiveAuditRow[],
  value: (row: ArchiveAuditRow) => string | null,
): ArchiveDuplicateGroup[] {
  const byKey = new Map<string, string[]>()
  for (const row of rows) {
    const key = value(row)
    if (!key) continue
    byKey.set(key, [...(byKey.get(key) ?? []), row.id])
  }
  return [...byKey.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([key, citationIds]) => ({ key, citationIds: [...citationIds].sort() }))
    .sort((left, right) => left.key.localeCompare(right.key))
}

function attachDuplicates(
  rows: ArchiveAuditRow[],
  groups: ArchiveDuplicateGroup[],
  value: (row: ArchiveAuditRow) => string | null,
  field: 'duplicateOriginalUrlIds' | 'duplicateArchivedUrlIds' | 'duplicateFileHashIds',
  issueCode: string,
): void {
  const groupByKey = new Map(groups.map((group) => [group.key, group.citationIds]))
  for (const row of rows) {
    const key = value(row)
    const ids = key ? groupByKey.get(key) ?? [] : []
    row[field] = ids.filter((id) => id !== row.id)
    if (row[field].length > 0) {
      addIssue(
        row.issues,
        issueCode,
        'info',
        `Evidence locator is shared with ${row[field].length} other SourceCitation row(s).`,
      )
    }
  }
}

function emptyReadinessSummary(): Record<CitationReadinessLevel, ArchiveReadinessSummary> {
  return {
    citable_external: { total: 0, durableArchive: 0, needsArchive: 0 },
    citable_with_note: { total: 0, durableArchive: 0, needsArchive: 0 },
    internal_context: { total: 0, durableArchive: 0, needsArchive: 0 },
    blocked_unsourced: { total: 0, durableArchive: 0, needsArchive: 0 },
  }
}

export function auditSourceCitationArchiveCoverage(
  inputs: ArchiveAuditInput[],
  options: ArchiveAuditOptions = {},
): SourceCitationArchiveAudit {
  const localFileExists = options.localFileExists ?? (() => false)
  const rows = inputs
    .map((row) => baseAuditRow(row, localFileExists))
    .sort((left, right) => left.id.localeCompare(right.id))

  const originalUrls = duplicateGroups(rows, (row) => row.normalizedOriginalUrl)
  const archivedUrls = duplicateGroups(rows, (row) => row.normalizedArchivedUrl)
  const fileHashes = duplicateGroups(rows, (row) => {
    const input = inputs.find((candidate) => candidate.id === row.id)
    return row.fileHashStatus === 'sha256' ? text(input?.fileHash)?.toLowerCase() ?? null : null
  })
  attachDuplicates(
    rows,
    originalUrls,
    (row) => row.normalizedOriginalUrl,
    'duplicateOriginalUrlIds',
    'duplicate_original_url',
  )
  attachDuplicates(
    rows,
    archivedUrls,
    (row) => row.normalizedArchivedUrl,
    'duplicateArchivedUrlIds',
    'duplicate_archived_url',
  )
  attachDuplicates(
    rows,
    fileHashes,
    (row) => {
      const input = inputs.find((candidate) => candidate.id === row.id)
      return row.fileHashStatus === 'sha256' ? text(input?.fileHash)?.toLowerCase() ?? null : null
    },
    'duplicateFileHashIds',
    'duplicate_file_hash',
  )

  const duplicateIds = duplicateGroups(rows, (row) => row.id)
  for (const group of duplicateIds) {
    for (const row of rows.filter((candidate) => candidate.id === group.key)) {
      addIssue(row.issues, 'duplicate_citation_id', 'error', 'Input contains duplicate SourceCitation IDs.')
    }
  }

  const byReadiness = emptyReadinessSummary()
  for (const row of rows) {
    const summary = byReadiness[row.readiness]
    summary.total += 1
    if (row.archiveCoverage !== 'none') summary.durableArchive += 1
    if (row.needsArchive) summary.needsArchive += 1
  }

  const blockingCitationIds = rows
    .filter((row) => row.issues.some((issue) => issue.severity === 'error'))
    .map((row) => row.id)

  return {
    readOnly: true,
    networkCalls: false,
    artifactWrites: false,
    databaseWrites: false,
    gate: {
      status: blockingCitationIds.length > 0 ? 'fail' : 'pass',
      blockingCitationIds,
    },
    totals: {
      rows: rows.length,
      externalReadinessRows: rows.filter((row) => row.externalReadiness).length,
      originalUrlRows: rows.filter((row) => row.originalUrlStatus === 'valid').length,
      archivedUrlRows: rows.filter((row) => ['wayback', 'other_archive'].includes(row.archivedUrlStatus)).length,
      localPathRows: rows.filter((row) => row.localPath !== null).length,
      localHashedSnapshotRows: rows.filter((row) => row.localSnapshotStatus === 'hashed_present').length,
      durableArchiveRows: rows.filter((row) => row.archiveCoverage !== 'none').length,
      needsArchiveRows: rows.filter((row) => row.needsArchive).length,
    },
    byReadiness,
    duplicateGroups: { originalUrls, archivedUrls, fileHashes },
    rows,
  }
}

export function parseSourceCitationArchiveAuditArgs(args: string[]): ArchiveAuditCliMode {
  if (args.length === 0 || (args.length === 1 && args[0] === '--summary')) return 'summary'
  if (args.length === 1 && args[0] === '--full') return 'full'

  throw new Error(
    'Usage: audit-source-citation-archive-coverage [--summary|--full] (default: --summary)',
  )
}

export function summarizeSourceCitationArchiveAudit(
  report: SourceCitationArchiveAudit,
): SourceCitationArchiveAuditSummary {
  const issueCodeCounts = new Map<string, number>()
  for (const row of report.rows) {
    for (const issue of row.issues) {
      issueCodeCounts.set(issue.code, (issueCodeCounts.get(issue.code) ?? 0) + 1)
    }
  }

  return {
    gate: {
      status: report.gate.status,
      blockingCount: report.gate.blockingCitationIds.length,
    },
    totals: { ...report.totals },
    byReadiness: {
      citable_external: { ...report.byReadiness.citable_external },
      citable_with_note: { ...report.byReadiness.citable_with_note },
      internal_context: { ...report.byReadiness.internal_context },
      blocked_unsourced: { ...report.byReadiness.blocked_unsourced },
    },
    duplicateGroupCounts: {
      originalUrls: report.duplicateGroups.originalUrls.length,
      archivedUrls: report.duplicateGroups.archivedUrls.length,
      fileHashes: report.duplicateGroups.fileHashes.length,
    },
    issueCodeCounts: Object.fromEntries(
      [...issueCodeCounts.entries()].sort(([left], [right]) => left.localeCompare(right)),
    ),
  }
}

function localFileExistsFromRoot(root: string): (path: string) => boolean {
  return (path) => existsSync(isAbsolute(path) ? path : resolve(root, path))
}

export async function loadLiveSourceCitationArchiveRows(): Promise<ArchiveAuditInput[]> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is required for the live read-only audit')

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })
  try {
    return await prisma.sourceCitation.findMany({
      select: {
        id: true,
        citationReadiness: true,
        url: true,
        archivedUrl: true,
        localPath: true,
        fileHash: true,
        contentHash: true,
        hashAlgorithm: true,
        documentId: true,
        sourceDocId: true,
        document: { select: { filePath: true, archivedUrl: true } },
        sourceDoc: {
          select: {
            archivedUrl: true,
            document: { select: { filePath: true, archivedUrl: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    })
  } finally {
    await prisma.$disconnect()
  }
}

export async function runSourceCitationArchiveAudit(): Promise<SourceCitationArchiveAudit> {
  const rows = await loadLiveSourceCitationArchiveRows()
  return auditSourceCitationArchiveCoverage(rows, {
    localFileExists: localFileExistsFromRoot(process.cwd()),
  })
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  let mode: ArchiveAuditCliMode | null = null
  try {
    mode = parseSourceCitationArchiveAuditArgs(process.argv.slice(2))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[audit-source-citation-archive-coverage] invalid arguments: ${message}`)
    process.exitCode = 1
  }

  if (mode) {
    runSourceCitationArchiveAudit()
      .then((report) => {
        const output = mode === 'summary' ? summarizeSourceCitationArchiveAudit(report) : report
        console.log(JSON.stringify(output, null, 2))
        if (report.gate.status === 'fail') process.exitCode = 1
      })
      .catch((error) => {
        console.error('[audit-source-citation-archive-coverage] failed:', error)
        process.exitCode = 1
      })
  }
}
