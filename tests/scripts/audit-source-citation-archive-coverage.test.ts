import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  auditSourceCitationArchiveCoverage,
  normalizeArchiveAuditUrl,
  parseSourceCitationArchiveAuditArgs,
  summarizeSourceCitationArchiveAudit,
  type ArchiveAuditInput,
} from '../../scripts/audit-source-citation-archive-coverage'

const SHA_A = 'a'.repeat(64)
const SHA_B = 'b'.repeat(64)

function row(overrides: Partial<ArchiveAuditInput> = {}): ArchiveAuditInput {
  return {
    id: 'citation-1',
    citationReadiness: 'citable_external',
    url: 'https://example.org/report',
    archivedUrl: null,
    localPath: null,
    fileHash: null,
    contentHash: null,
    hashAlgorithm: 'sha256',
    documentId: null,
    sourceDocId: null,
    document: null,
    sourceDoc: null,
    ...overrides,
  }
}

function issueCodes(value: { issues: Array<{ code: string }> }): string[] {
  return value.issues.map((issue) => issue.code)
}

describe('SourceCitation archive coverage audit', () => {
  it('fails closed for external-ready original-URL-only citations', () => {
    const report = auditSourceCitationArchiveCoverage([row()])
    const audited = report.rows[0]

    assert.equal(audited.originalUrlStatus, 'valid')
    assert.equal(audited.archivedUrlStatus, 'missing')
    assert.equal(audited.localSnapshotStatus, 'none')
    assert.equal(audited.archiveCoverage, 'none')
    assert.equal(audited.needsArchive, true)
    assert.ok(issueCodes(audited).includes('needs_archive'))
    assert.equal(report.gate.status, 'fail')
  })

  it('accepts Wayback, other archives, and present SHA-256 local snapshots as durable coverage', () => {
    const report = auditSourceCitationArchiveCoverage(
      [
        row({
          id: 'wayback',
          archivedUrl: 'http://web.archive.org/web/20260701000000/https://example.org/report',
        }),
        row({
          id: 'other-archive',
          url: 'https://example.org/other',
          archivedUrl: 'https://arquivo.pt/wayback/20260701000000/https://example.org/other',
        }),
        row({
          id: 'local',
          url: null,
          localPath: 'research/evidence/report.pdf',
          fileHash: SHA_A,
        }),
      ],
      { localFileExists: (path) => path === 'research/evidence/report.pdf' },
    )
    const byId = new Map(report.rows.map((candidate) => [candidate.id, candidate]))

    assert.equal(byId.get('wayback')!.archivedUrlStatus, 'wayback')
    assert.equal(byId.get('wayback')!.archiveCoverage, 'archived_url')
    assert.equal(byId.get('other-archive')!.archivedUrlStatus, 'other_archive')
    assert.equal(byId.get('local')!.localSnapshotStatus, 'hashed_present')
    assert.equal(byId.get('local')!.archiveCoverage, 'local_hashed_snapshot')
    assert.equal(report.gate.status, 'pass')
    assert.equal(report.totals.durableArchiveRows, 3)
  })

  it('uses linked Document and SourceDoc locators without calling the network', () => {
    const report = auditSourceCitationArchiveCoverage(
      [
        row({
          id: 'document-local',
          url: null,
          fileHash: SHA_A,
          documentId: 'doc-1',
          document: { filePath: 'docs/report.pdf', archivedUrl: null },
        }),
        row({
          id: 'source-doc-archive',
          archivedUrl: null,
          sourceDocId: 'src-1',
          sourceDoc: {
            archivedUrl: 'https://web.archive.org/web/20260101/https://example.org/report',
            document: null,
          },
        }),
      ],
      { localFileExists: () => true },
    )
    const byId = new Map(report.rows.map((candidate) => [candidate.id, candidate]))

    assert.equal(byId.get('document-local')!.localPathOrigin, 'document')
    assert.equal(byId.get('document-local')!.archiveCoverage, 'local_hashed_snapshot')
    assert.equal(byId.get('source-doc-archive')!.archivedUrlOrigin, 'source_doc')
    assert.equal(byId.get('source-doc-archive')!.archiveCoverage, 'archived_url')
    assert.equal(report.networkCalls, false)
  })

  it('keeps local path, file hash, and content hash states separate', () => {
    const report = auditSourceCitationArchiveCoverage(
      [
        row({ id: 'unhashed', localPath: 'local/unhashed.pdf' }),
        row({ id: 'missing-file', localPath: 'local/missing.pdf', fileHash: SHA_A }),
        row({ id: 'bad-file-hash', localPath: 'local/bad.pdf', fileHash: 'not-sha256' }),
        row({ id: 'orphan-hash', url: null, fileHash: SHA_B }),
        row({ id: 'content-only', contentHash: SHA_A }),
      ],
      {
        localFileExists: (path) => ['local/unhashed.pdf', 'local/bad.pdf'].includes(path),
      },
    )
    const byId = new Map(report.rows.map((candidate) => [candidate.id, candidate]))

    assert.equal(byId.get('unhashed')!.localSnapshotStatus, 'unhashed_present')
    assert.equal(byId.get('missing-file')!.localSnapshotStatus, 'path_missing')
    assert.equal(byId.get('bad-file-hash')!.localSnapshotStatus, 'invalid_hash')
    assert.equal(byId.get('orphan-hash')!.localSnapshotStatus, 'hash_without_path')
    assert.equal(byId.get('content-only')!.contentHashStatus, 'sha256')
    assert.equal(byId.get('content-only')!.fileHashStatus, 'missing')
    assert.equal(byId.get('content-only')!.archiveCoverage, 'none')
    assert.equal(report.gate.status, 'fail')
  })

  it('reports normalized duplicate original URLs, archives, and file hashes without treating them as archive coverage', () => {
    const sharedArchive = 'https://web.archive.org/web/20260701/https://example.org/report'
    const report = auditSourceCitationArchiveCoverage(
      [
        row({
          id: 'a',
          url: 'http://www.example.org/report/',
          archivedUrl: sharedArchive,
          localPath: 'a.pdf',
          fileHash: SHA_A,
        }),
        row({
          id: 'b',
          url: 'https://example.org/report',
          archivedUrl: sharedArchive,
          localPath: 'b.pdf',
          fileHash: SHA_A,
        }),
      ],
      { localFileExists: () => true },
    )

    assert.equal(report.duplicateGroups.originalUrls.length, 1)
    assert.equal(report.duplicateGroups.archivedUrls.length, 1)
    assert.equal(report.duplicateGroups.fileHashes.length, 1)
    assert.deepEqual(report.rows[0].duplicateOriginalUrlIds, ['b'])
    assert.ok(issueCodes(report.rows[0]).includes('duplicate_original_url'))
    assert.equal(report.gate.status, 'pass')
  })

  it('summarizes readiness separately and does not demand archives from internal rows', () => {
    const report = auditSourceCitationArchiveCoverage([
      row({ id: 'external', citationReadiness: 'citable_external' }),
      row({ id: 'with-note', citationReadiness: 'citable_with_note' }),
      row({ id: 'internal', citationReadiness: 'internal_context' }),
      row({ id: 'blocked', citationReadiness: 'blocked_unsourced', url: null }),
    ])

    assert.deepEqual(report.byReadiness.citable_external, {
      total: 1,
      durableArchive: 0,
      needsArchive: 1,
    })
    assert.deepEqual(report.byReadiness.citable_with_note, {
      total: 1,
      durableArchive: 0,
      needsArchive: 1,
    })
    assert.equal(report.byReadiness.internal_context.needsArchive, 0)
    assert.equal(report.byReadiness.blocked_unsourced.needsArchive, 0)
    assert.equal(report.totals.externalReadinessRows, 2)
  })

  it('normalizes only absolute HTTP(S) URLs for duplicate detection', () => {
    assert.equal(
      normalizeArchiveAuditUrl('http://www.Example.org/report/?b=2&a=1#section'),
      'https://example.org/report?a=1&b=2',
    )
    assert.equal(normalizeArchiveAuditUrl('ftp://example.org/report'), null)
    assert.equal(normalizeArchiveAuditUrl('example.org/report'), null)
  })

  it('parses only the supported fail-closed CLI output modes', () => {
    assert.equal(parseSourceCitationArchiveAuditArgs([]), 'summary')
    assert.equal(parseSourceCitationArchiveAuditArgs(['--summary']), 'summary')
    assert.equal(parseSourceCitationArchiveAuditArgs(['--full']), 'full')

    assert.throws(() => parseSourceCitationArchiveAuditArgs(['--unknown']), /Usage:/)
    assert.throws(
      () => parseSourceCitationArchiveAuditArgs(['--summary', '--full']),
      /Usage:/,
    )
    assert.throws(
      () => parseSourceCitationArchiveAuditArgs(['--summary', '--summary']),
      /Usage:/,
    )
  })

  it('projects a compact summary without rows or citation IDs', () => {
    const sharedArchive = 'https://web.archive.org/web/20260701/https://example.org/report'
    const report = auditSourceCitationArchiveCoverage([
      row({ id: 'needs-archive', archivedUrl: null }),
      row({ id: 'duplicate-a', url: 'https://example.org/a', archivedUrl: sharedArchive }),
      row({ id: 'duplicate-b', url: 'https://example.org/a', archivedUrl: sharedArchive }),
    ])
    const summary = summarizeSourceCitationArchiveAudit(report)

    assert.deepEqual(Object.keys(summary).sort(), [
      'byReadiness',
      'duplicateGroupCounts',
      'gate',
      'issueCodeCounts',
      'totals',
    ])
    assert.deepEqual(summary.gate, { status: 'fail', blockingCount: 1 })
    assert.deepEqual(summary.duplicateGroupCounts, {
      originalUrls: 1,
      archivedUrls: 1,
      fileHashes: 0,
    })
    assert.deepEqual(summary.issueCodeCounts, {
      duplicate_archived_url: 2,
      duplicate_original_url: 2,
      needs_archive: 1,
    })
    assert.equal('rows' in summary, false)
    assert.equal('blockingCitationIds' in summary.gate, false)
    assert.doesNotMatch(JSON.stringify(summary), /needs-archive|duplicate-a|duplicate-b/)
  })

  it('contains no network, artifact-write, or database-write primitives', () => {
    const source = readFileSync('scripts/audit-source-citation-archive-coverage.ts', 'utf8')
    assert.doesNotMatch(source, /\bfetch\s*\(|https?\.request\s*\(|WaybackResponse/)
    assert.doesNotMatch(
      source,
      /\b(?:writeFile|writeFileSync|appendFile|appendFileSync|mkdir|mkdirSync|rm|rmSync|unlink|unlinkSync|rename|renameSync)\b/,
    )
    assert.doesNotMatch(source, /\.(?:create|createMany|update|updateMany|upsert|delete|deleteMany)\s*\(/)
  })
})
