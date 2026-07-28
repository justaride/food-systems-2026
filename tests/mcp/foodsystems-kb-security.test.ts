import assert from 'node:assert/strict'
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  MAX_OBSIDIAN_RESOURCE_BYTES,
  buildDocumentPayload,
  externalHttpUrl,
  type CitationLike,
} from '../../mcp/foodsystems-kb/formatters'
import {
  buildMcpLibraryAnalysis,
  buildGapWhere,
  formatGapCitationForAudience,
  formatSourceDocForAudience,
  isExplicitOptIn,
  parseTraceClaimQuery,
  readObsidianFile,
  redactEntityPayloadForAudience,
  traceClaimMatchProvenance,
} from '../../mcp/foodsystems-kb/service'
import { computeLibraryContentHash } from '../../src/lib/library-analysis-inventory'
import { assessLibraryAnalysisExternalCitationPolicy } from '../../src/lib/library-analysis-external-citations'

describe('Food Systems KB MCP security boundaries', () => {
  it('treats metadata-only trace matches as discovery, not claim support', () => {
    const citation = {
      quote: 'Direct evidence about market concentration.',
      citationText: 'Annual report 2024',
      title: 'Annual report',
      notes: 'Internal annual report index',
    }

    assert.deepEqual(traceClaimMatchProvenance('annual report', {
      claimText: 'The market is concentrated.',
      fieldPath: 'company.annualReport',
      citation,
    }), {
      matchedBy: ['citation_text', 'citation_title', 'citation_notes'],
      supportScope: 'discovery_only',
    })
    assert.deepEqual(traceClaimMatchProvenance('market concentration', {
      claimText: 'Market concentration is high.',
      fieldPath: null,
      citation,
    }), {
      matchedBy: ['claim_text_lexical', 'citation_quote_lexical'],
      supportScope: 'lexical_candidate',
    })
    assert.deepEqual(traceClaimMatchProvenance('Market concentration is high.', {
      claimText: '  MARKET   concentration is high. ',
      fieldPath: null,
      citation,
    }), {
      matchedBy: ['claim_text_exact'],
      supportScope: 'claim_support',
    })
  })

  it('rejects short or one-word claim traces before database access', () => {
    assert.throws(() => parseTraceClaimQuery('a'), /at least 12 characters/i)
    assert.throws(() => parseTraceClaimQuery('abcdefghijkl'), /at least two words/i)
    assert.equal(parseTraceClaimQuery('Market concentration is high.'), 'Market concentration is high.')
  })

  it('binds external document approval to the reviewed content hash', () => {
    const citation = {
      id: 'citation-1',
      sourceClass: 'primary',
      citationReadiness: 'citable_external',
      verificationStatus: 'verified',
      url: 'https://www.oecd.org/report.pdf',
      archivedUrl: null,
      accessedAt: '2026-07-19T10:00:00.000Z',
    }
    const document = {
      summary: 'Reviewed summary',
      content: 'Reviewed content',
      sourceCitations: [citation],
    }
    const contentHash = computeLibraryContentHash('Reviewed summary\n\nReviewed content')
    const citationPolicyHash = assessLibraryAnalysisExternalCitationPolicy([citation]).policyHash
    assert.ok(citationPolicyHash)
    const record = {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash,
      aiCard: {
        externalApprovalEvidence: {
          citationPolicyHash,
          eligibleCitationIds: ['citation-1'],
        },
      },
      claimCandidates: [],
      riskFlags: [],
    }

    assert.equal(buildMcpLibraryAnalysis(record, document, [citation]).externalClaimEligible, true)
    assert.equal(
      buildMcpLibraryAnalysis(
        record,
        { ...document, content: 'Changed after review' },
        [citation],
      ).externalClaimEligible,
      false,
    )
    const missingLocatorCitations = [{ ...citation, url: null }]
    assert.equal(
      buildMcpLibraryAnalysis(record, {
        ...document,
        sourceCitations: missingLocatorCitations,
      }, missingLocatorCitations).externalClaimEligible,
      false,
    )
    const replacementCitations = [{
      ...citation,
      id: 'citation-2',
      url: 'https://www.fao.org/replacement.pdf',
    }]
    assert.equal(
      buildMcpLibraryAnalysis(record, {
        ...document,
        sourceCitations: replacementCitations,
      }, replacementCitations).externalClaimEligible,
      false,
    )
  })

  it('uses the complete citation set for approval even when the response is capped at 20', () => {
    const citation = (id: string, eligible: boolean): CitationLike => ({
      id,
      sourceClass: 'primary',
      citationReadiness: eligible ? 'citable_external' : 'blocked_unsourced',
      verificationStatus: eligible ? 'verified' : 'needs_review',
      citationText: `Citation ${id}`,
      title: `Citation ${id}`,
      publisher: null,
      author: null,
      year: 2026,
      url: eligible ? `https://www.regjeringen.no/${id}.pdf` : null,
      archivedUrl: null,
      localPath: null,
      fileHash: null,
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: null,
      quote: null,
      accessedAt: eligible ? '2026-07-19T10:00:00.000Z' : null,
      captureMethod: 'manual',
      verifiedAt: null,
      verifiedBy: null,
      confidence: null,
      notes: null,
      documentId: 'doc-1',
      sourceDocId: null,
    })
    const responseCitations = [
      citation('citation-1', true),
      ...Array.from({ length: 19 }, (_, index) => citation(`citation-${index + 2}`, false)),
    ]
    const omittedAtReview = citation('citation-21', false)
    const reviewedPolicy = assessLibraryAnalysisExternalCitationPolicy([
      ...responseCitations,
      omittedAtReview,
    ])
    assert.ok(reviewedPolicy.policyHash)

    const document = {
      id: 'doc-1',
      slug: 'reviewed-document',
      title: 'Reviewed document',
      summary: 'Reviewed summary',
      content: 'Reviewed content',
      tags: [],
      url: null,
      filePath: null,
      sourceCitations: responseCitations,
    }
    const record = {
      sourceKind: 'document',
      sourceKey: 'document:doc-1',
      documentId: 'doc-1',
      status: 'validated',
      usageRule: 'safe_for_external_claims',
      reviewStatus: 'approved',
      reviewedAt: '2026-07-19T10:00:00.000Z',
      reviewer: 'Fagansvarlig',
      citationReadiness: 'citable_external',
      contentHash: computeLibraryContentHash('Reviewed summary\n\nReviewed content'),
      aiCard: {
        externalApprovalEvidence: {
          citationPolicyHash: reviewedPolicy.policyHash,
          eligibleCitationIds: reviewedPolicy.eligibleCitationIds,
        },
      },
      claimCandidates: [],
      riskFlags: [],
    }

    const currentCitationSet = [
      ...responseCitations,
      citation('citation-21', true),
    ]
    assert.equal(
      assessLibraryAnalysisExternalCitationPolicy(responseCitations).policyHash,
      reviewedPolicy.policyHash,
      'the capped response alone still matches the stale approval',
    )
    const currentAnalysis = buildMcpLibraryAnalysis(record, document, currentCitationSet)
    const payload = buildDocumentPayload(document, {
      audience: 'external',
      includeContent: true,
      libraryAnalysis: currentAnalysis,
    })

    assert.equal(currentAnalysis.externalClaimEligible, false)
    assert.equal(currentAnalysis.reviewRequired, true)
    assert.equal(payload.contentPolicy.allowed, false)
    assert.equal('summary' in payload, false)
    assert.equal('content' in payload, false)
  })

  it('validates database document slugs before emitting an external app path', () => {
    const baseDocument = {
      id: 'doc-hostile-slug',
      slug: 'safe-report',
      title: 'Document with a database-provided slug',
      summary: null,
      content: '',
      tags: [],
      url: null,
      filePath: null,
      sourceCitations: [],
    }

    assert.equal(buildDocumentPayload(baseDocument).links.appPath, '/bibliotek/safe-report')

    for (const slug of [
      '../secrets?path=/Users/example/private.txt',
      '%252e%252e%252fsecrets',
      'report#fragment',
      'report?redirect=/etc/passwd',
    ]) {
      const hostileDocument = { ...baseDocument, slug }
      assert.equal(buildDocumentPayload(hostileDocument).links.appPath, null, slug)
      assert.equal(
        buildDocumentPayload(hostileDocument, { audience: 'internal' }).links.appPath,
        `/bibliotek/${slug}`,
        slug,
      )
    }
  })

  it('requires an explicit true value for optional external-processing surfaces', () => {
    assert.equal(isExplicitOptIn(undefined), false)
    assert.equal(isExplicitOptIn('false'), false)
    assert.equal(isExplicitOptIn('1'), false)
    assert.equal(isExplicitOptIn(' TRUE '), true)
  })

  it('keeps weak gap evidence metadata-only unless internal audience is explicit', () => {
    const citation = {
      id: 'gap-1',
      sourceClass: 'internal_construct',
      citationReadiness: 'blocked_unsourced',
      verificationStatus: 'needs_review',
      citationText: 'Private claim from /Users/example/note.md',
      title: 'Private source',
      publisher: null,
      author: null,
      year: null,
      url: null,
      archivedUrl: null,
      localPath: '/Users/example/note.md',
      fileHash: null,
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: null,
      quote: 'Private quote',
      accessedAt: null,
      captureMethod: 'manual',
      verifiedAt: null,
      verifiedBy: null,
      confidence: null,
      notes: 'Private note',
      documentId: null,
      sourceDocId: null,
    }

    const external = formatGapCitationForAudience(citation, 'external')
    const internal = formatGapCitationForAudience(citation, 'internal')

    assert.deepEqual(Object.keys(external).sort(), [
      'id',
      'readiness',
      'sourceClass',
      'usePolicy',
      'verificationStatus',
    ])
    assert.doesNotMatch(JSON.stringify(external), /Private|Users\/example|localPath/)
    assert.match(JSON.stringify(internal), /Private claim|Users\/example|localPath/)
  })

  it('hides SourceDoc filename and local URL hints from external payloads', () => {
    const sourceDoc = {
      id: 'source-1',
      title: 'Imported from /Users/example/private/source.pdf, http://127.0.0.1/private, https://reader:secret@www.regjeringen.no/private, public https://www.regjeringen.no/public.pdf, /data/private.db, /.env, /secret, \\\\server\\share\\private.txt, file://localhost/etc/passwd, and file:C:/Users/example/local.txt',
      filename: '/Users/example/private/source.pdf',
      url: 'file:///Users/example/private/source.pdf',
    }

    const external = formatSourceDocForAudience(sourceDoc, 'external')
    const internal = formatSourceDocForAudience(sourceDoc, 'internal')

    assert.equal('filename' in external, false)
    assert.equal(external.url, null)
    assert.doesNotMatch(
      JSON.stringify(external),
      /Users\/example|127\.0\.0\.1|reader:secret|\/data\/private|\/\.env|\/secret|server\\\\share|localhost\/etc|file:(?:\/\/|C:)|filename/,
    )
    assert.match(external.title ?? '', /https:\/\/www\.regjeringen\.no\/public\.pdf/)
    assert.match(external.title ?? '', /\[redacted-unsafe-url\]/)
    assert.equal(internal.filename, '/Users/example/private/source.pdf')
    assert.equal(internal.url, 'file:///Users/example/private/source.pdf')
    assert.equal(internal.title, sourceDoc.title)
  })

  it('rejects credential-bearing and non-public HTTP locators from external payloads', () => {
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/public-report.pdf'),
      'https://www.regjeringen.no/public-report.pdf',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/public-report.pdf?lang=no&page=2#section-2'),
      'https://www.regjeringen.no/public-report.pdf?lang=no&page=2#section-2',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpublic.pdf'),
      'https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpublic.pdf',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=%2F%2Fwww.oecd.org%2Fpublic.pdf'),
      'https://www.regjeringen.no/view?next=%2F%2Fwww.oecd.org%2Fpublic.pdf',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=%2F%5Cwww.oecd.org%2Fpublic.pdf'),
      'https://www.regjeringen.no/view?next=%2F%5Cwww.oecd.org%2Fpublic.pdf',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=https%3Awww.oecd.org%2Fpublic.pdf'),
      'https://www.regjeringen.no/view?next=https%3Awww.oecd.org%2Fpublic.pdf',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpath%2F%2Fsegment'),
      'https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpath%2F%2Fsegment',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fa%2Chttps%3A%2F%2Fwww.fao.org%2Fb'),
      'https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fa%2Chttps%3A%2F%2Fwww.fao.org%2Fb',
    )
    assert.equal(
      externalHttpUrl('https://www.regjeringen.no/#%7B%22next%22%3A%22%2F%2Fwww.oecd.org%2Fpublic.pdf%22%7D'),
      'https://www.regjeringen.no/#%7B%22next%22%3A%22%2F%2Fwww.oecd.org%2Fpublic.pdf%22%7D',
    )
    assert.equal(
      externalHttpUrl('https://[2606:4700:4700::1111]/public-report.pdf'),
      'https://[2606:4700:4700::1111]/public-report.pdf',
    )
    assert.equal(
      externalHttpUrl('https://[2001:4860:4860::8888]/public-report.pdf'),
      'https://[2001:4860:4860::8888]/public-report.pdf',
    )
    assert.equal(
      externalHttpUrl('https://[2a00:1450:400f:80d::200e]/public-report.pdf'),
      'https://[2a00:1450:400f:80d::200e]/public-report.pdf',
    )

    for (const blockedUrl of [
      'https://reader:secret@example.test/report.pdf',
      'https://example.test/report.pdf',
      'https://evidence.example/report.pdf',
      'https://source.invalid/report.pdf',
      'https://example.com/report.pdf',
      'https://docs.example.net/report.pdf',
      'https://example.org/report.pdf',
      'http://localhost/report.pdf',
      'http://evidence.localhost/report.pdf',
      'http://database.internal/report.pdf',
      'http://home.arpa/report.pdf',
      'http://router.home.arpa/report.pdf',
      'http://resolver.arpa/report.pdf',
      'http://private-service.alt/report.pdf',
      'http://private-service.onion/report.pdf',
      'http://10.0.0.8/report.pdf',
      'http://100.64.0.1/report.pdf',
      'http://127.0.0.1/report.pdf',
      'http://2130706433/report.pdf',
      'http://0x7f000001/report.pdf',
      'http://169.254.169.254/latest/meta-data',
      'http://172.16.0.1/report.pdf',
      'http://192.168.1.1/report.pdf',
      'http://192.31.196.1/report.pdf',
      'http://192.52.193.1/report.pdf',
      'http://192.88.99.1/report.pdf',
      'http://192.175.48.1/report.pdf',
      'http://[::1]/report.pdf',
      'http://[fd00::1]/report.pdf',
      'http://[fe80::1]/report.pdf',
      'http://[2001:2::1]/report.pdf',
      'http://[2001:10::1]/report.pdf',
      'http://[2001:20::1]/report.pdf',
      'http://[2001:db8::1]/report.pdf',
      'http://[2002::1]/report.pdf',
      'http://[2620:4f:8000::1]/report.pdf',
      'http://[2d00::1]/report.pdf',
      'http://[3000::1]/report.pdf',
      'http://[3f00::1]/report.pdf',
      'http://[3fff::1]/report.pdf',
      'http://[::ffff:127.0.0.1]/report.pdf',
      'https://www.regjeringen.no/report.pdf?access_token=supersecret',
      'https://www.regjeringen.no/report.pdf?access%255ftoken=supersecret',
      'https://www.regjeringen.no/view?file=/Users/reviewer/.env',
      'https://www.regjeringen.no/view?file=%252FUsers%252Freviewer%252F.env',
      'https://www.regjeringen.no/#file:///Users/reviewer/.env',
      'https://www.regjeringen.no/#file%253A%252F%252F%252FUsers%252Freviewer%252F.env',
      'https://www.regjeringen.no/#access_token%253Dsupersecret',
      'https://www.regjeringen.no/#%7B%22access_token%22%3A%22supersecret%22%7D',
      'https://www.regjeringen.no/view?safe=ok%2526client_secret%253Dsupersecret',
      'https://www.regjeringen.no/view?%252FUsers%252Freviewer%252F.env=1',
      'https://www.regjeringen.no/view?next=http%253A%252F%252F127.0.0.1%252Fadmin',
      'https://www.regjeringen.no/view?next=https%253A%252F%252Freader%253Asecret%2540www.oecd.org%252Fprivate',
      'https://www.regjeringen.no/view?next=%2F%2F127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=%252F%252F169.254.169.254%252Flatest%252Fmeta-data',
      'https://www.regjeringen.no/view?next=%2F%2Freader%3Asecret%40www.oecd.org%2Fprivate',
      'https://www.regjeringen.no/view?next=%2F%5C127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=%5C%2F127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=%2F%5Creader%3Asecret%40www.oecd.org%2Fprivate',
      'https://www.regjeringen.no/view?next=%5C%2Freader%3Asecret%40www.oecd.org%2Fprivate',
      'https://www.regjeringen.no/view?next=%2F%09%2F127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=http%3A169.254.169.254%2Flatest%2Fmeta-data',
      'https://www.regjeringen.no/view?next=https%3A127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=https%3Areader%3Asecret%40www.oecd.org%2Fprivate',
      'https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpublic.pdf%2Chttp%3A%2F%2F127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?next=https%3A%2F%2Fwww.oecd.org%2Fpublic.pdf%3B%2F%2F169.254.169.254%2Flatest%2Fmeta-data',
      'https://www.regjeringen.no/view?next=https%3Awww.oecd.org%2Fpublic.pdf%7Chttp%3A10.0.0.8%2Fprivate',
      'https://www.regjeringen.no/#%7B%22next%22%3A%22%2F%2F127.0.0.1%2Fadmin%22%7D',
      'https://www.regjeringen.no/view?payload=%7B%22next%22%3A%22%2F%2Freader%3Asecret%40www.oecd.org%2Fprivate%22%7D',
      'https://www.regjeringen.no/view?payload=%7Bnext%3A%2F%2F169.254.169.254%2Flatest%2Fmeta-data%7D',
      'https://www.regjeringen.no/view?payload=note%29%2F%2F127.0.0.1%2Fadmin',
      'https://www.regjeringen.no/view?payload=prefixaccess_token%3Dsupersecret',
      'https://www.regjeringen.no/report.pdf?X-Amz-Signature=supersecret',
      'https://www.regjeringen.no/report.pdf?X-API-Key=supersecret',
      'https://www.regjeringen.no/report.pdf?safe=DATABASE_URL%3Dpostgresql%3A%2F%2Fuser%3Asecret%40db.internal%2Ffood',
    ]) {
      assert.equal(externalHttpUrl(blockedUrl), null, blockedUrl)
    }

    const sensitiveSourceDoc = {
      id: 'source-sensitive-url',
      title: 'Credential-bearing source',
      filename: 'source.pdf',
      url: 'https://reader:secret@example.test/report.pdf',
    }
    assert.equal(formatSourceDocForAudience(sensitiveSourceDoc, 'external').url, null)
    assert.equal(
      formatSourceDocForAudience(sensitiveSourceDoc, 'internal').url,
      sensitiveSourceDoc.url,
    )
  })

  it('builds mutually exclusive exact-match gap filters', () => {
    assert.deepEqual(buildGapWhere({}), {
      citationReadiness: 'blocked_unsourced',
    })
    assert.deepEqual(buildGapWhere({
      issue: 'readiness',
      readiness: 'citable_with_note',
    }), {
      citationReadiness: 'citable_with_note',
    })
    assert.deepEqual(buildGapWhere({ issue: 'needs_review' }), {
      verificationStatus: 'needs_review',
    })
    assert.deepEqual(buildGapWhere({ issue: 'missing_locator' }), {
      AND: [
        { url: null },
        { archivedUrl: null },
        { localPath: null },
        { documentId: null },
        { sourceDocId: null },
      ],
    })
  })

  it('reads only regular Markdown files within the size cap', () => {
    const vaultRoot = mkdtempSync(join(tmpdir(), 'foodsystems-mcp-vault-'))

    try {
      mkdirSync(join(vaultRoot, 'notes'))
      writeFileSync(join(vaultRoot, 'notes', 'allowed.md'), '# Allowed\n')
      writeFileSync(
        join(vaultRoot, 'notes', 'too-large.md'),
        'x'.repeat(MAX_OBSIDIAN_RESOURCE_BYTES + 1),
      )

      assert.equal(readObsidianFile(vaultRoot, 'notes/allowed.md'), '# Allowed\n')
      assert.throws(
        () => readObsidianFile(vaultRoot, 'notes/too-large.md'),
        /exceeds.*byte limit/i,
      )
      assert.throws(
        () => readObsidianFile(vaultRoot, 'notes/missing.md'),
        /not found/i,
      )
    } finally {
      rmSync(vaultRoot, { recursive: true, force: true })
    }
  })

  it('rejects symlinked Obsidian resources even when the target is inside the vault', () => {
    const vaultRoot = mkdtempSync(join(tmpdir(), 'foodsystems-mcp-vault-'))

    try {
      mkdirSync(join(vaultRoot, 'notes'))
      writeFileSync(join(vaultRoot, 'notes', 'target.md'), '# Target\n')
      symlinkSync(join(vaultRoot, 'notes', 'target.md'), join(vaultRoot, 'notes', 'link.md'))

      assert.throws(
        () => readObsidianFile(vaultRoot, 'notes/link.md'),
        /symbolic links are not allowed/i,
      )
    } finally {
      rmSync(vaultRoot, { recursive: true, force: true })
    }
  })

  it('redacts personal profile details from external entity payloads only', () => {
    const person = {
      found: true,
      entity: {
        id: 'person-1',
        type: 'person',
        title: 'Example Person',
        summary: 'Private biography text',
        fields: { affiliations: ['Example Foods'] },
        links: {
          appPath: '/personer/person-1',
          linkedInUrl: 'https://linkedin.example/private-person',
          photoUrl: 'https://images.example/private-person.jpg',
        },
        relationships: {
          roles: [{ company: 'Example Foods', role: 'Board member' }],
        },
      },
    }

    const external = redactEntityPayloadForAudience(person, 'external')
    const internal = redactEntityPayloadForAudience(person, 'internal')
    const externalJson = JSON.stringify(external.payload)

    assert.doesNotMatch(externalJson, /Private biography|linkedin|private-person|Board member/)
    assert.deepEqual(external.redactedFields, [
      'entity.summary',
      'entity.links.linkedInUrl',
      'entity.links.photoUrl',
      'entity.relationships.roles',
    ])
    assert.deepEqual(internal.payload, person)
    assert.deepEqual(internal.redactedFields, [])
  })

  it('redacts internal actor strategy fields from external entity payloads only', () => {
    const actor = {
      found: true,
      entity: {
        id: 'actor-1',
        type: 'actor',
        title: 'Example Actor',
        fields: {
          actorType: 'company',
          country: 'NO',
          currentStance: 'internal-current-position',
          desiredStance: 'internal-target-position',
          priorityTier: 1,
          verificationStatus: 'verified',
        },
      },
    }

    const external = redactEntityPayloadForAudience(actor, 'external')
    const internal = redactEntityPayloadForAudience(actor, 'internal')
    const externalJson = JSON.stringify(external.payload)

    assert.doesNotMatch(externalJson, /currentStance|desiredStance|priorityTier|internal-current|internal-target/)
    assert.match(externalJson, /actorType|country|verificationStatus/)
    assert.deepEqual(external.redactedFields, [
      'entity.fields.currentStance',
      'entity.fields.desiredStance',
      'entity.fields.priorityTier',
    ])
    assert.deepEqual(internal.payload, actor)
    assert.deepEqual(internal.redactedFields, [])
  })

  it('allows only public entity URLs and known application routes for external audiences', () => {
    const company = {
      found: true,
      entity: {
        id: 'company-1',
        type: 'company',
        title: 'Example Foods',
        fields: {
          registrySource: 'https://www.brreg.no/registry',
        },
        links: {
          appPath: '/selskap/company-1',
          actorPath: '/run/secrets/database-password',
        },
        relationships: {
          boardMembers: [
            { sourceUrl: 'file:///Users/example/private/board.pdf' },
            { sourceUrl: 'https://www.regjeringen.no/public-board.pdf' },
          ],
          shareholders: [{ sourceUrl: 'https://reader:secret@www.brreg.no/private' }],
          businessRelationships: [
            { source: 'http://127.0.0.1/private' },
            { source: 'Verified registry label' },
          ],
        },
      },
    }
    const actor = {
      found: true,
      entity: {
        id: 'actor-1',
        type: 'actor',
        title: 'Example Actor',
        links: {
          appPath: '/aktorer/example-actor',
          website: 'http://router.home.arpa/private',
          homepage: 'file:///run/secrets/actor-homepage',
          companyWebsite: 'http://127.0.0.1/private',
          downloadLink: 'https://reader:secret@www.regjeringen.no/private',
          sourceHref: 'file:///run/secrets/source-href',
        },
        relationships: [{ sourceUrl: 'https://reader:secret@www.regjeringen.no/private' }],
      },
    }

    const externalCompany = redactEntityPayloadForAudience(company, 'external')
    const externalActor = redactEntityPayloadForAudience(actor, 'external')
    const internalCompany = redactEntityPayloadForAudience(company, 'internal')
    const internalActor = redactEntityPayloadForAudience(actor, 'internal')

    assert.deepEqual(externalCompany.payload, {
      found: true,
      entity: {
        id: 'company-1',
        type: 'company',
        title: 'Example Foods',
        fields: { registrySource: 'https://www.brreg.no/registry' },
        links: { appPath: '/selskap/company-1', actorPath: null },
        relationships: {
          boardMembers: [
            { sourceUrl: null },
            { sourceUrl: 'https://www.regjeringen.no/public-board.pdf' },
          ],
          shareholders: [{ sourceUrl: null }],
          businessRelationships: [
            { source: null },
            { source: 'Verified registry label' },
          ],
        },
      },
    })
    assert.deepEqual(externalActor.payload, {
      found: true,
      entity: {
        id: 'actor-1',
        type: 'actor',
        title: 'Example Actor',
        links: {
          appPath: '/aktorer/example-actor',
          website: null,
          homepage: null,
          companyWebsite: null,
          downloadLink: null,
          sourceHref: null,
        },
        relationships: [{ sourceUrl: null }],
      },
    })
    assert.deepEqual(externalCompany.redactedFields, [
      'entity.links.actorPath',
      'entity.relationships.boardMembers.0.sourceUrl',
      'entity.relationships.shareholders.0.sourceUrl',
      'entity.relationships.businessRelationships.0.source',
    ])
    assert.deepEqual(externalActor.redactedFields, [
      'entity.links.website',
      'entity.links.homepage',
      'entity.links.companyWebsite',
      'entity.links.downloadLink',
      'entity.links.sourceHref',
      'entity.relationships.0.sourceUrl',
    ])
    assert.deepEqual(internalCompany.payload, company)
    assert.deepEqual(internalActor.payload, actor)
  })

  it('redacts unsafe HTTP URLs from narrative and unknown external entity fields', () => {
    const entity = {
      found: true,
      entity: {
        id: 'company-narrative-urls',
        type: 'company',
        title: 'Narrative URL example',
        documents: [
          {
            context: 'Public https://www.regjeringen.no/public.pdf private http://127.0.0.1/internal',
          },
          {
            context: 'Credential https://reader:secret@www.regjeringen.no/private',
          },
        ],
        fields: {
          narrative: 'Internal service http://10.0.0.8/report and public https://www.oecd.org/report.pdf',
          unknownNested: [
            {
              note: 'Metadata endpoint http://169.254.169.254/latest/meta-data',
              adjacent: 'https://www.oecd.org/public.pdf,http://192.168.1.1/private',
            },
          ],
        },
      },
    }

    const external = redactEntityPayloadForAudience(entity, 'external')
    const internal = redactEntityPayloadForAudience(entity, 'internal')
    const externalJson = JSON.stringify(external.payload)

    assert.doesNotMatch(
      externalJson,
      /reader:secret|127\.0\.0\.1|10\.0\.0\.8|169\.254\.169\.254|192\.168\.1\.1/,
    )
    assert.match(externalJson, /https:\/\/www\.regjeringen\.no\/public\.pdf/)
    assert.match(externalJson, /https:\/\/www\.oecd\.org\/report\.pdf/)
    assert.match(externalJson, /https:\/\/www\.oecd\.org\/public\.pdf/)
    assert.equal(externalJson.match(/\[redacted-unsafe-url\]/gu)?.length, 5)
    assert.deepEqual(external.redactedFields, [
      'entity.documents.0.context',
      'entity.documents.1.context',
      'entity.fields.narrative',
      'entity.fields.unknownNested.0.note',
      'entity.fields.unknownNested.0.adjacent',
    ])
    assert.deepEqual(internal.payload, entity)
    assert.deepEqual(internal.redactedFields, [])
  })
})
