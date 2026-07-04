import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('export-missing-document-file-snapshots', () => {
  it('plans snapshot exports without running the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/export-missing-document-file-snapshots?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 150))
      assert.deepEqual(logs, [])

      assert.equal(mod.parseApplyMode([]), false)
      assert.equal(mod.parseApplyMode(['--dry-run']), false)
      assert.equal(mod.parseApplyMode(['--apply']), true)
      assert.throws(() => mod.parseApplyMode(['--apply', '--dry-run']), /either --apply or --dry-run/)

      assert.deepEqual(
        mod.missingDocumentIdsFromRows([
          { ref: 'doc-1 missing local file', problem: 'missing_file_document' },
          { ref: 'doc-1 duplicate row', problem: 'missing_file_document' },
          { ref: 'src-1 missing source file', problem: 'missing_file_sourcedoc' },
          { ref: '   ', problem: 'missing_file_document' },
        ]),
        ['doc-1'],
      )

      assert.equal(mod.safeSlugPath('/bibliotek/media/snapshots/good'), 'bibliotek/media/snapshots/good')
      assert.equal(mod.safeSlugPath('bibliotek\\media\\snapshots\\good'), 'bibliotek/media/snapshots/good')
      assert.throws(() => mod.safeSlugPath('../escape'), /Unsafe document slug/)
      assert.throws(() => mod.safeSlugPath('nested//empty'), /Unsafe document slug/)
      assert.equal(mod.sanitizeContent('Hello\r\nworld\u0000\n\n'), 'Hello\nworld')

      const existingPaths = new Set(['research/bibliotek/media/snapshots/existing.md'])
      const plans = mod.buildExportPlans({
        root: '/repo',
        pathExists: (path: string) => existingPaths.has(path),
        documents: [
          {
            id: 'doc-good',
            slug: 'bibliotek/media/snapshots/good',
            title: 'Good snapshot',
            author: 'Researcher',
            year: 2025,
            documentType: 'media_snapshot',
            category: 'media',
            subcategory: 'prices',
            country: 'DK',
            url: 'https://example.test/good',
            archivedUrl: null,
            filePath: null,
            content: 'Snapshot text\r\nwith NUL\u0000',
            report: null,
          },
          {
            id: 'doc-blocked',
            slug: 'bibliotek/media/snapshots/blocked',
            title: 'Blocked source snapshot',
            author: null,
            year: null,
            documentType: null,
            category: null,
            subcategory: null,
            country: null,
            url: null,
            archivedUrl: null,
            filePath: null,
            content: 'Blocked source text',
            report: { provenanceType: 'blocked_source' },
          },
          {
            id: 'doc-existing-filepath',
            slug: 'bibliotek/media/snapshots/has-filepath',
            title: 'Has filePath',
            author: null,
            year: null,
            documentType: null,
            category: null,
            subcategory: null,
            country: null,
            url: 'https://example.test/has-filepath',
            archivedUrl: null,
            filePath: 'research/already.md',
            content: 'Already linked',
            report: null,
          },
          {
            id: 'doc-no-locator',
            slug: 'bibliotek/media/snapshots/no-locator',
            title: 'No locator',
            author: null,
            year: null,
            documentType: null,
            category: null,
            subcategory: null,
            country: null,
            url: null,
            archivedUrl: null,
            filePath: null,
            content: 'No locator text',
            report: null,
          },
          {
            id: 'doc-empty',
            slug: 'bibliotek/media/snapshots/empty',
            title: 'Empty',
            author: null,
            year: null,
            documentType: null,
            category: null,
            subcategory: null,
            country: null,
            url: 'https://example.test/empty',
            archivedUrl: null,
            filePath: null,
            content: '   ',
            report: null,
          },
          {
            id: 'doc-existing-target',
            slug: 'bibliotek/media/snapshots/existing',
            title: 'Existing target',
            author: null,
            year: null,
            documentType: null,
            category: null,
            subcategory: null,
            country: null,
            url: 'https://example.test/existing',
            archivedUrl: null,
            filePath: null,
            content: 'Target exists',
            report: null,
          },
        ],
      })

      assert.deepEqual(
        plans.plans.map((plan: { documentId: string; filePath: string }) => [plan.documentId, plan.filePath]),
        [
          ['doc-good', 'research/bibliotek/media/snapshots/good.md'],
          ['doc-blocked', 'research/bibliotek/media/snapshots/blocked.md'],
        ],
      )
      assert.match(plans.plans[0]?.contentHash ?? '', /^[a-f0-9]{64}$/)
      assert.deepEqual(
        plans.skipped.map((skip: { id: string; reason: string }) => [skip.id, skip.reason]),
        [
          ['doc-existing-filepath', 'document already has filePath'],
          ['doc-no-locator', 'no canonical or archived URL'],
          ['doc-empty', 'empty Document.content'],
          ['doc-existing-target', 'target file already exists: research/bibliotek/media/snapshots/existing.md'],
        ],
      )

      const markdown = mod.markdownFor(plans.plans[0], {
        id: 'doc-good',
        slug: 'bibliotek/media/snapshots/good',
        title: 'Good snapshot',
        author: 'Researcher',
        year: 2025,
        documentType: 'media_snapshot',
        category: 'media',
        subcategory: 'prices',
        country: 'DK',
        url: 'https://example.test/good',
        archivedUrl: null,
        filePath: null,
        content: 'Snapshot text\r\nwith NUL\u0000',
        report: null,
      })

      assert.match(markdown, /not fresh source verification/)
      assert.match(markdown, /- Document ID: doc-good/)
      assert.match(markdown, /- Content SHA256: [a-f0-9]{64}/)
      assert.match(markdown, /Snapshot text\nwith NUL/)
      assert.equal(markdown.includes('\u0000'), false)
    } finally {
      console.log = originalLog
    }
  })
})
