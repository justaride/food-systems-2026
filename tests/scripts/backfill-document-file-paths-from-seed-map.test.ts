import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('backfill-document-file-paths-from-seed-map', () => {
  it('plans filePath candidates without running the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/backfill-document-file-paths-from-seed-map?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 150))
      assert.deepEqual(logs, [])

      assert.equal(mod.parseApplyMode([]), false)
      assert.equal(mod.parseApplyMode(['--apply']), true)
      assert.throws(() => mod.parseApplyMode(['--apply', '--dry-run']), /either --apply or --dry-run/)

      const existingPaths = new Set([
        'research/evidence-pack/report.pdf',
        'research/evidence-pack/report.md',
        'research/queue/direct.pdf',
        mod.CURATED_REPORT_PATHS['dlf-leverandor-2025'],
      ])
      const pathExists = (path: string) => existingPaths.has(path)

      assert.equal(
        mod.localPathForSeedMapEntry({ pdf: 'evidence-pack/report.pdf', confidence: 'high' }, pathExists),
        'research/evidence-pack/report.pdf',
      )
      assert.equal(
        mod.localPathForSeedMapEntry({ md: 'evidence-pack/report.md', confidence: 'high' }, pathExists),
        'research/evidence-pack/report.md',
      )
      assert.equal(mod.localPathForSeedMapEntry({ pdf: 'missing.pdf' }, pathExists), null)

      const queue = mod.downloadQueuePathByIdFromRows(
        [
          { id: 'queued', url: 'https://example.test/file', url_type: 'direct_pdf', target_path: 'research/queue/direct.pdf' },
          { id: 'pdf-url', url: 'https://example.test/file.pdf', url_type: 'html', target_path: 'research/queue/direct.pdf' },
          { id: 'html', url: 'https://example.test/page', url_type: 'html', target_path: 'research/queue/direct.pdf' },
        ],
        pathExists,
      )
      assert.equal(queue.get('queued'), 'research/queue/direct.pdf')
      assert.equal(queue.get('pdf-url'), 'research/queue/direct.pdf')
      assert.equal(queue.has('html'), false)

      const planned = mod.collectCandidatesFromSeedRows({
        seedMap: {
          reports: {
            high: { pdf: 'evidence-pack/report.pdf', confidence: 'high', score: 26 },
            low: { pdf: 'evidence-pack/report.pdf', confidence: 'medium', score: 10 },
          },
          theses: {},
        },
        reports: [
          { id: 'high', documentId: 'doc-high' },
          { id: 'low', documentId: 'doc-low' },
          { id: 'dlf-leverandor-2025', documentId: 'doc-curated' },
          { id: 'queued', documentId: 'doc-queued' },
        ],
        theses: [],
        downloadQueuePaths: queue,
        pathExists,
      })

      assert.deepEqual(
        planned.applyable.map((candidate: { documentId: string; source: string }) => [
          candidate.documentId,
          candidate.source,
        ]),
        [
          ['doc-high', 'seed-pdf-map'],
          ['doc-curated', 'curated-local-map'],
          ['doc-queued', 'download-queue'],
        ],
      )
      assert.deepEqual(planned.skipped.map((candidate: { seedId: string }) => candidate.seedId), ['low'])

      const deduped = mod.dedupeCandidates([
        { kind: 'report', seedId: 'a', documentId: 'same', path: 'curated.md', confidence: 'curated', score: null, source: 'curated-local-map' },
        { kind: 'report', seedId: 'a', documentId: 'same', path: 'queue.pdf', confidence: 'queue-direct-pdf', score: null, source: 'download-queue' },
        { kind: 'report', seedId: 'b', documentId: 'seed', path: 'seed.pdf', confidence: 'high', score: 99, source: 'seed-pdf-map' },
        { kind: 'report', seedId: 'b', documentId: 'seed', path: 'queue.pdf', confidence: 'queue-direct-pdf', score: null, source: 'download-queue' },
      ])
      assert.deepEqual(deduped.map((candidate: { documentId: string; path: string }) => [candidate.documentId, candidate.path]), [
        ['same', 'queue.pdf'],
        ['seed', 'seed.pdf'],
      ])
    } finally {
      console.log = originalLog
    }
  })
})
