import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildDocumentPayload,
  formatCitation,
  normalizeLimit,
  parseNonEmptyQuery,
  resolveObsidianVaultPath,
} from '../../mcp/foodsystems-kb/formatters'

describe('Food Systems KB MCP formatters', () => {
  it('rejects empty search queries and normalizes result limits', () => {
    assert.throws(() => parseNonEmptyQuery('   '), /query must not be empty/i)
    assert.equal(parseNonEmptyQuery('  matsvinn  '), 'matsvinn')
    assert.equal(normalizeLimit(undefined), 10)
    assert.equal(normalizeLimit(0), 1)
    assert.equal(normalizeLimit(200), 25)
  })

  it('always keeps citation readiness and direct locators visible', () => {
    const citation = formatCitation({
      id: 'cit-1',
      citationReadiness: 'citable_external',
      verificationStatus: 'verified',
      citationText: 'Annual report 2024',
      title: 'Annual report',
      url: 'https://example.test/report.pdf',
      archivedUrl: null,
      localPath: 'research/reports/report.pdf',
      pageRef: 'p. 12',
      quote: null,
      confidence: 90,
      notes: null,
    })

    assert.deepEqual(citation, {
      id: 'cit-1',
      readiness: 'citable_external',
      verificationStatus: 'verified',
      citationText: 'Annual report 2024',
      title: 'Annual report',
      locators: {
        url: 'https://example.test/report.pdf',
        archivedUrl: null,
        localPath: 'research/reports/report.pdf',
        pageRef: 'p. 12',
      },
      quote: null,
      confidence: 90,
      notes: null,
    })
  })

  it('caps document content unless explicitly requested', () => {
    const content = `${'A'.repeat(900)}\n${'B'.repeat(900)}`
    const payload = buildDocumentPayload({
      id: 'doc-1',
      slug: 'long-doc',
      title: 'Long document',
      summary: null,
      content,
      tags: ['mat'],
      url: null,
      filePath: 'docs/long.md',
      sourceCitations: [],
    })

    assert.equal(payload.content, undefined)
    assert.ok(payload.excerpt.length <= 520)
    assert.match(payload.warnings.join('\n'), /content omitted/i)

    const withContent = buildDocumentPayload({
      id: 'doc-1',
      slug: 'long-doc',
      title: 'Long document',
      summary: null,
      content,
      tags: [],
      url: null,
      filePath: null,
      sourceCitations: [],
    }, { includeContent: true, contentWindow: 700 })

    assert.equal(withContent.content?.length, 700)
    assert.match(withContent.warnings.join('\n'), /truncated/i)
  })

  it('rejects Obsidian resource path traversal outside the vault', () => {
    const root = '/repo/Food Systems Obsidian'

    assert.equal(
      resolveObsidianVaultPath(root, '1 Oversikt og navigasjon/Brukerveiledning.md'),
      '/repo/Food Systems Obsidian/1 Oversikt og navigasjon/Brukerveiledning.md',
    )

    assert.throws(() => resolveObsidianVaultPath(root, '../.env'), /outside the Obsidian vault/i)
    assert.throws(() => resolveObsidianVaultPath(root, '/tmp/evil.md'), /absolute paths/i)
  })
})
