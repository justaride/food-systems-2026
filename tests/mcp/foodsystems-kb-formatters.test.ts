import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  MAX_QUERY_LENGTH,
  assessCitationUse,
  buildDocumentPayload,
  formatCitation,
  formatSearchResultForMcp,
  normalizeLimit,
  parseNonEmptyQuery,
  resolveObsidianVaultPath,
  type CitationLike,
} from '../../mcp/foodsystems-kb/formatters'

const externalCitation: CitationLike = {
  id: 'cit-1',
  sourceClass: 'primary',
  citationReadiness: 'citable_external',
  verificationStatus: 'human_verified',
  citationText: 'Annual report 2024',
  title: 'Annual report',
  publisher: 'Example Foods',
  author: 'Ada Researcher',
  year: 2024,
  url: 'https://www.regjeringen.no/report.pdf',
  archivedUrl: 'https://web.archive.org/report.pdf',
  localPath: 'research/reports/report.pdf',
  fileHash: 'file-sha256',
  contentHash: 'content-sha256',
  hashAlgorithm: 'sha256',
  pageRef: 'p. 12',
  quote: 'Documented fact.',
  accessedAt: new Date('2026-07-01T00:00:00.000Z'),
  captureMethod: 'local_extract',
  verifiedAt: new Date('2026-07-02T10:00:00.000Z'),
  verifiedBy: 'private-reviewer@example.test',
  confidence: 90,
  notes: 'Reviewed from /Users/reviewer/private-notes.md',
  documentId: 'doc-1',
  sourceDocId: 'src-1',
}

const externalAppraisalGate = {
  externalGateSatisfied: true,
  blockingReasons: [] as string[],
}

describe('Food Systems KB MCP formatters', () => {
  it('rejects empty search queries and normalizes result limits', () => {
    assert.throws(() => parseNonEmptyQuery('   '), /query must not be empty/i)
    assert.equal(parseNonEmptyQuery('  matsvinn  '), 'matsvinn')
    assert.equal(normalizeLimit(undefined), 10)
    assert.equal(normalizeLimit(0), 1)
    assert.equal(normalizeLimit(200), 25)
    assert.throws(() => parseNonEmptyQuery('x'.repeat(MAX_QUERY_LENGTH + 1)), /must not exceed/i)
  })

  it('returns complete citation provenance and an external-use decision', () => {
    const citation = formatCitation(externalCitation)

    assert.deepEqual(citation, {
      id: 'cit-1',
      sourceClass: 'primary',
      readiness: 'citable_external',
      verificationStatus: 'human_verified',
      citationText: 'Annual report 2024',
      title: 'Annual report',
      author: 'Ada Researcher',
      publisher: 'Example Foods',
      year: 2024,
      accessedAt: '2026-07-01T00:00:00.000Z',
      verifiedAt: '2026-07-02T10:00:00.000Z',
      captureMethod: 'local_extract',
      locators: {
        url: 'https://www.regjeringen.no/report.pdf',
        archivedUrl: 'https://web.archive.org/report.pdf',
        pageRef: 'p. 12',
      },
      hashes: {
        file: 'file-sha256',
        content: 'content-sha256',
        algorithm: 'sha256',
      },
      sourceIds: {
        documentId: 'doc-1',
        sourceDocId: 'src-1',
      },
      quote: 'Documented fact.',
      confidence: 90,
      usePolicy: {
        audience: 'external',
        allowedForAnswer: true,
        externalCitable: true,
        blockingReasons: [],
      },
    })

    const internalCitation = formatCitation(externalCitation, 'internal')
    assert.equal(internalCitation.locators.localPath, 'research/reports/report.pdf')
    assert.equal(internalCitation.verifier, 'private-reviewer@example.test')
    assert.equal(internalCitation.notes, 'Reviewed from /Users/reviewer/private-notes.md')
    assert.doesNotMatch(JSON.stringify(citation), /private-reviewer|private-notes|verifier|notes/)
  })

  it('redacts unsafe URLs and absolute paths from every external citation narrative field', () => {
    const sensitiveCitation: CitationLike = {
      ...externalCitation,
      citationText: 'Evidence http://127.0.0.1/citation and https://www.regjeringen.no/public.pdf from /Users/reviewer/citation.md; token https://www.regjeringen.no/report.pdf?access_token=supersecret',
      title: 'Title http://10.0.0.8/private and query path https://www.regjeringen.no/view?file=/Users/reviewer/.env',
      author: 'Author https://reader:secret@www.regjeringen.no/private',
      publisher: 'Publisher http://169.254.169.254/latest/meta-data',
      captureMethod: 'Capture http://[::1]/private from /Volumes/reviewer/capture.json',
      pageRef: 'Page http://localhost/private at C:\\Users\\reviewer\\page.txt',
      quote: 'Quote http://192.168.1.1/private, public https://www.oecd.org/public.pdf?lang=en#section-2, fragment path https://www.regjeringen.no/#file:///Users/reviewer/.env, file:///etc/passwd',
    }

    const external = formatCitation(sensitiveCitation, 'external')
    const internal = formatCitation(sensitiveCitation, 'internal')
    const externalJson = JSON.stringify(external)

    assert.doesNotMatch(
      externalJson,
      /reader:secret|supersecret|access_token|127\.0\.0\.1|10\.0\.0\.8|169\.254\.169\.254|::1|localhost|192\.168\.1\.1|Users\\|Users\/|Volumes\/|file:\/\//,
    )
    assert.match(externalJson, /https:\/\/www\.regjeringen\.no\/public\.pdf/)
    assert.match(externalJson, /https:\/\/www\.oecd\.org\/public\.pdf\?lang=en#section-2/)
    assert.match(externalJson, /\[redacted-unsafe-url\]/)
    assert.match(externalJson, /\[redacted-local-path\]/)

    assert.equal(internal.citationText, sensitiveCitation.citationText)
    assert.equal(internal.title, sensitiveCitation.title)
    assert.equal(internal.author, sensitiveCitation.author)
    assert.equal(internal.publisher, sensitiveCitation.publisher)
    assert.equal(internal.captureMethod, sensitiveCitation.captureMethod)
    assert.equal(internal.locators.pageRef, sensitiveCitation.pageRef)
    assert.equal(internal.quote, sensitiveCitation.quote)
  })

  it('redacts every narrative surface in an approved external document only', () => {
    const document = {
      id: 'doc-approved-redaction',
      slug: 'approved-redaction',
      title: 'Approved title http://127.0.0.1/title with https://www.regjeringen.no/title',
      summary: 'Summary http://10.0.0.8/summary from /Users/reviewer/summary.md and https://www.oecd.org/summary',
      content: 'Content http://169.254.169.254/latest/meta-data and https://reader:secret@www.regjeringen.no/private from /Volumes/reviewer/content.md; public https://www.fao.org/content',
      tags: [
        'tag http://192.168.1.1/private',
        'public https://www.oecd.org/tag',
        '/private/reviewer/tag.txt',
      ],
      url: 'https://www.regjeringen.no/approved-redaction',
      filePath: '/Users/reviewer/approved-redaction.md',
      sourceCitations: [externalCitation],
    }
    const libraryAnalysis = {
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewRequired: false,
      claimCandidateCount: 1,
      riskFlags: [] as string[],
      externalClaimEligible: true,
    }

    const external = buildDocumentPayload(document, {
      audience: 'external',
      includeContent: true,
      libraryAnalysis,
      evidenceAppraisal: externalAppraisalGate,
    })
    const internal = buildDocumentPayload(document, {
      audience: 'internal',
      includeContent: true,
      libraryAnalysis,
      evidenceAppraisal: externalAppraisalGate,
    })
    const externalJson = JSON.stringify(external)

    assert.equal(external.contentPolicy.allowed, true)
    assert.doesNotMatch(
      externalJson,
      /reader:secret|127\.0\.0\.1|10\.0\.0\.8|169\.254\.169\.254|192\.168\.1\.1|Users\/|Volumes\/|\/private\/reviewer/,
    )
    assert.match(externalJson, /https:\/\/www\.regjeringen\.no\/title/)
    assert.match(externalJson, /https:\/\/www\.oecd\.org\/summary/)
    assert.match(externalJson, /https:\/\/www\.fao\.org\/content/)
    assert.match(externalJson, /https:\/\/www\.oecd\.org\/tag/)
    for (const field of [external.title, external.summary, external.excerpt, external.content]) {
      assert.match(field ?? '', /\[redacted-(?:unsafe-url|local-path)\]/)
    }
    assert.ok(external.tags.some(tag => tag.includes('[redacted-unsafe-url]')))
    assert.ok(external.tags.some(tag => tag.includes('[redacted-local-path]')))

    assert.equal(internal.title, document.title)
    assert.equal(internal.summary, document.summary)
    assert.equal(internal.excerpt, document.summary)
    assert.equal(internal.content, document.content)
    assert.deepEqual(internal.tags, document.tags)
    assert.deepEqual(internal.libraryAnalysis, libraryAnalysis)
  })

  it('fails closed for weak or rejected evidence in external answers', () => {
    const withNote = {
      ...externalCitation,
      citationReadiness: 'citable_with_note',
      verificationStatus: 'failed',
    }

    assert.deepEqual(assessCitationUse(withNote, 'external'), {
      audience: 'external',
      allowedForAnswer: false,
      externalCitable: false,
      blockingReasons: ['readiness_citable_with_note', 'verification_failed'],
    })
    assert.deepEqual(
      assessCitationUse({ ...externalCitation, accessedAt: null }, 'external').blockingReasons,
      ['missing_accessed_at'],
    )
    for (const sourceClass of ['internal_synthesis', 'synthesis', 'internal_construct']) {
      assert.ok(
        assessCitationUse({ ...externalCitation, sourceClass }, 'external')
          .blockingReasons.includes(`source_class_${sourceClass}`),
      )
    }

    const document = buildDocumentPayload({
      id: 'doc-1',
      slug: 'source-policy',
      title: 'Source policy',
      summary: 'Policy summary',
      content: 'Policy content',
      tags: [],
      url: null,
      filePath: '/private/repo/source-policy.md',
      sourceCitations: [externalCitation, withNote],
    })

    assert.equal(document.citations.length, 1)
    assert.equal(document.citationSummary.withheld, 1)
    assert.match(document.warnings.join('\n'), /withheld/i)
    assert.equal('localPath' in document.links, false)
    assert.equal('localPath' in document.citations[0]!.locators, false)
    assert.doesNotMatch(JSON.stringify(document), /private\/repo|localPath/)
    assert.equal('summary' in document, false)
    assert.equal('excerpt' in document, false)
    assert.equal('content' in document, false)
    assert.equal(document.contentPolicy.allowed, false)

    const internalDocument = buildDocumentPayload({
      id: 'doc-1',
      slug: 'source-policy',
      title: 'Source policy',
      summary: 'Policy summary',
      content: 'Policy content',
      tags: [],
      url: null,
      filePath: '/private/repo/source-policy.md',
      sourceCitations: [externalCitation, withNote],
    }, { audience: 'internal' })

    assert.equal(internalDocument.citations.length, 2)
    assert.equal(internalDocument.citations[1]?.usePolicy.allowedForAnswer, false)
    assert.equal(internalDocument.links.localPath, '/private/repo/source-policy.md')
    assert.equal(
      internalDocument.citations[0]?.locators.localPath,
      'research/reports/report.pdf',
    )

    const localOnly = {
      ...externalCitation,
      url: null,
      archivedUrl: null,
      documentId: null,
      sourceDocId: null,
      localPath: '/private/research/source.pdf',
    }
    assert.ok(
      assessCitationUse(localOnly, 'external')
        .blockingReasons.includes('missing_public_locator'),
    )
    assert.doesNotMatch(JSON.stringify(formatCitation(localOnly, 'external')), /private|localPath/)

    const internallyLinkedOnly = {
      ...localOnly,
      documentId: 'doc-internal-evidence',
      sourceDocId: 'source-internal-evidence',
    }
    assert.ok(
      assessCitationUse(internallyLinkedOnly, 'external')
        .blockingReasons.includes('missing_public_locator'),
    )
    assert.equal(assessCitationUse(internallyLinkedOnly, 'internal').allowedForAnswer, true)

    const linkedOnlyDocument = buildDocumentPayload({
      id: 'doc-linked-only',
      slug: 'linked-only',
      title: 'Internally linked evidence',
      summary: 'This summary must remain internal.',
      content: 'This content must remain internal.',
      tags: [],
      url: null,
      filePath: '/private/research/source.pdf',
      sourceCitations: [internallyLinkedOnly],
    }, {
      audience: 'external',
      includeContent: true,
      libraryAnalysis: {
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewRequired: false,
        claimCandidateCount: 0,
        riskFlags: [],
        externalClaimEligible: true,
      },
      evidenceAppraisal: externalAppraisalGate,
    })
    assert.equal(linkedOnlyDocument.contentPolicy.allowed, false)
    assert.equal(linkedOnlyDocument.citations.length, 0)
    assert.equal('summary' in linkedOnlyDocument, false)
    assert.equal('content' in linkedOnlyDocument, false)

    const externallyReadable = buildDocumentPayload({
      id: 'doc-safe',
      slug: 'safe-document',
      title: 'Safe document',
      summary: 'Summary from /Users/example/private/source.md',
      content: 'Evidence loaded from /Volumes/private archive/source.md',
      tags: [],
      url: 'https://www.regjeringen.no/safe-document',
      filePath: '/Users/example/private/source.md',
      sourceCitations: [externalCitation],
    }, {
      audience: 'external',
      includeContent: true,
      libraryAnalysis: {
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewRequired: false,
        claimCandidateCount: 0,
        riskFlags: [],
        externalClaimEligible: true,
      },
      evidenceAppraisal: externalAppraisalGate,
    })

    assert.equal(externallyReadable.contentPolicy.allowed, true)
    assert.match(externallyReadable.summary ?? '', /redacted-local-path/)
    assert.match(externallyReadable.content ?? '', /redacted-local-path/)
    assert.doesNotMatch(JSON.stringify(externallyReadable), /Users\/example|Volumes\/private|localPath/)

    const internalApprovalOnly = buildDocumentPayload({
      id: 'doc-internal-only',
      slug: 'internal-only',
      title: 'Internal only',
      summary: 'This must remain internal.',
      content: 'Internal content.',
      tags: [],
      url: 'https://www.regjeringen.no/internal-only',
      filePath: null,
      sourceCitations: [externalCitation],
    }, {
      audience: 'external',
      includeContent: true,
      libraryAnalysis: {
        status: 'approved_internal',
        usageRule: 'safe_for_ai_context',
        reviewRequired: false,
        claimCandidateCount: 0,
        riskFlags: [],
        externalClaimEligible: true,
      },
    })

    assert.equal(internalApprovalOnly.contentPolicy.allowed, false)
    assert.equal('summary' in internalApprovalOnly, false)
    assert.equal('content' in internalApprovalOnly, false)
  })

  it('preserves library-analysis status, usage rules, risks, and warnings in search results', () => {
    const result = formatSearchResultForMcp({
      id: 'doc-blocked',
      type: 'document',
      title: 'Blocked source http://127.0.0.1/private from /Users/example/private/source.md; public https://www.oecd.org/source',
      excerpt: 'Internal source summary.',
      tags: ['internal', '/Volumes/private/strategy'],
      url: '/bibliotek/doc-blocked',
      libraryAnalysis: {
        status: 'blocked',
        usageRule: 'do_not_use_for_claims',
        reviewRequired: false,
        claimCandidateCount: 2,
        riskFlags: ['blocked_source http://10.0.0.8/private'],
      },
    })

    assert.deepEqual(result.libraryAnalysis, {
      status: 'blocked',
      usageRule: 'do_not_use_for_claims',
      reviewRequired: false,
      claimCandidateCount: 2,
      riskFlags: ['blocked_source [redacted-unsafe-url]'],
    })
    assert.equal(result.usePolicy.externalClaimAllowed, false)
    assert.equal(result.tags.length, 0)
    assert.equal('summary' in result, false)
    assert.doesNotMatch(JSON.stringify(result), /127\.0\.0\.1|10\.0\.0\.8|Users\/example|Volumes\/private/)
    assert.match(JSON.stringify(result), /https:\/\/www\.oecd\.org\/source/)
    assert.ok(result.usePolicy.blockingReasons.includes('library_status_blocked'))
    assert.ok(result.usePolicy.blockingReasons.includes('usage_rule_do_not_use_for_claims'))
    assert.match(result.warnings.map((warning) => warning.message).join('\n'), /restrictions/i)
    assert.equal('summary' in result, false)

    const internalResult = formatSearchResultForMcp({
      id: 'doc-internal',
      type: 'document',
      title: 'Internal source',
      excerpt: 'Rich internal summary.',
      libraryAnalysis: {
        status: 'ai_draft',
        usageRule: 'internal_background',
        reviewRequired: false,
        claimCandidateCount: 0,
        riskFlags: [],
      },
    }, 'internal')
    assert.equal(internalResult.summary, 'Rich internal summary.')

    const externallyApprovedResult = formatSearchResultForMcp({
      id: 'doc-external',
      type: 'document',
      title: 'Externally approved source',
      excerpt: 'Loaded from /Users/example/private/source.md',
      libraryAnalysis: {
        status: 'validated',
        usageRule: 'safe_for_external_claims',
        reviewRequired: false,
        claimCandidateCount: 0,
        riskFlags: [],
      },
    })
    assert.equal('summary' in externallyApprovedResult, false)
    assert.ok(externallyApprovedResult.warnings.some(warning => (
      warning.code === 'external-summary-withheld' && /citation trace/.test(warning.message)
    )))
  })

  it('exposes only safe app paths or public HTTP(S) links in external search results', () => {
    const formatLinks = (
      url: string | null,
      sourceUrl?: string,
      audience: 'external' | 'internal' = 'external',
    ) => (
      formatSearchResultForMcp({
        id: 'search-link',
        type: 'source',
        title: 'Search link',
        excerpt: 'Discovery result.',
        url,
        sourceUrl,
      }, audience).links
    )

    assert.deepEqual(
      formatLinks('/bibliotek/source-1', 'https://www.regjeringen.no/report.pdf'),
      {
        appPath: '/bibliotek/source-1',
        url: 'https://www.regjeringen.no/report.pdf',
      },
    )
    assert.deepEqual(formatLinks('/bibliotek/analyse/case-avsjekk/rapport-1'), {
      appPath: '/bibliotek/analyse/case-avsjekk/rapport-1',
      url: null,
    })
    assert.deepEqual(formatLinks('https://www.regjeringen.no/report.pdf'), {
      appPath: null,
      url: 'https://www.regjeringen.no/report.pdf',
    })
    assert.deepEqual(formatLinks('/rapporter'), {
      appPath: '/rapporter',
      url: null,
    })
    assert.deepEqual(formatLinks('/innsikt#insight-1'), {
      appPath: '/innsikt#insight-1',
      url: null,
    })
    assert.deepEqual(formatLinks('/forsyningskjede?relationship=rel-1'), {
      appPath: '/forsyningskjede?relationship=rel-1',
      url: null,
    })

    for (const blocked of [
      'https://reader:secret@www.regjeringen.no/report.pdf',
      'http://127.0.0.1/private',
      'https://source.invalid/report.pdf',
      '//attacker.example.net/redirect',
      'file:///Users/reviewer/private.md',
      '/Users/reviewer/private.md',
      '/run/secrets/db-password',
      '/nix/store/private',
      '/secrets/token',
      '/boot/loader.conf',
      '/media/usb/private',
      '/admin/private',
      '/bibliotek/%2e%2e/secrets',
      '/bibliotek/source%2f..%2fsecrets',
      '/bibliotek/%252e%252e/secrets',
      '/bibliotek/source%252f..%252fsecrets',
      '/bibliotek/Users/example/private.txt',
      '/bibliotek/item?path=/Users/example/private.txt',
      '/rapporter?source=file:///run/secrets/token',
      '/innsikt#file:///run/secrets/token',
      '/selskap/company-1/extra',
      '../private/source.md',
      'C:\\Users\\reviewer\\private.md',
    ]) {
      assert.deepEqual(formatLinks(blocked), { appPath: null, url: null }, blocked)
    }

    assert.deepEqual(formatLinks(null, 'file:///Users/reviewer/private.md', 'internal'), {
      appPath: null,
      url: 'file:///Users/reviewer/private.md',
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
    }, { audience: 'internal' })

    assert.equal(payload.content, undefined)
    assert.ok(payload.excerpt)
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
    }, { includeContent: true, contentWindow: 700, audience: 'internal' })

    assert.equal(withContent.content?.length, 700)
    assert.match(withContent.warnings.join('\n'), /truncated/i)
  })

  it('rejects Obsidian resource path traversal outside the vault', () => {
    const root = '/repo/Food Systems Obsidian'

    assert.equal(
      resolveObsidianVaultPath(root, '1 Oversikt og navigasjon/Brukerveiledning.md'),
      '/repo/Food Systems Obsidian/1 Oversikt og navigasjon/Brukerveiledning.md',
    )

    assert.throws(() => resolveObsidianVaultPath(root, '../.env'), /traversal|outside the Obsidian vault/i)
    assert.throws(() => resolveObsidianVaultPath(root, '/tmp/evil.md'), /absolute paths/i)
    assert.throws(() => resolveObsidianVaultPath(root, '.obsidian/plugins/tool.js'), /hidden/i)
    assert.throws(() => resolveObsidianVaultPath(root, 'notes/data.json'), /only Markdown/i)
    assert.throws(() => resolveObsidianVaultPath(root, 'notes\\secret.md'), /unsupported characters/i)
  })
})
