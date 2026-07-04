import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisLocatorProfile,
  formatLibraryAnalysisLocatorProfileMarkdown,
  type LibraryAnalysisLocatorProfileInput,
} from '../../src/lib/library-analysis-locator-profile'

const inputs: LibraryAnalysisLocatorProfileInput[] = [
  {
    sourceKey: 'document:url-backed',
    title: 'URL backed report',
    repairBatch: 'missing_document_locator_search',
    documentId: 'doc-url',
    sourceDocId: null,
    sourceDocFilename: null,
    documentUrl: 'https://example.org/report.pdf',
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    citationUrlCount: 0,
    citationLocalPathCount: 0,
    localFilenameMatches: [],
  },
  {
    sourceKey: 'document:source-doc-url',
    title: 'SourceDoc URL backed report',
    repairBatch: 'missing_sourcedoc_locator',
    documentId: 'doc-src-url',
    sourceDocId: 'src-1',
    sourceDocFilename: 'source-doc.md',
    documentUrl: null,
    documentArchivedUrl: null,
    sourceDocUrl: 'https://example.org/source',
    sourceDocDoi: '10.1234/example',
    sourceDocArchivedUrl: null,
    citationUrlCount: 0,
    citationLocalPathCount: 0,
    localFilenameMatches: [],
  },
  {
    sourceKey: 'document:local-match',
    title: 'Local match report',
    repairBatch: 'missing_sourcedoc_locator',
    documentId: 'doc-local',
    sourceDocId: 'src-2',
    sourceDocFilename: 'local-match.pdf',
    documentUrl: null,
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    citationUrlCount: 0,
    citationLocalPathCount: 0,
    localFilenameMatches: ['research/downloads/local-match.pdf'],
  },
  {
    sourceKey: 'document:gap',
    title: 'True locator gap',
    repairBatch: 'missing_document_locator_search',
    documentId: 'doc-gap',
    sourceDocId: null,
    sourceDocFilename: null,
    documentUrl: null,
    documentArchivedUrl: null,
    sourceDocUrl: null,
    sourceDocDoi: null,
    sourceDocArchivedUrl: null,
    citationUrlCount: 0,
    citationLocalPathCount: 0,
    localFilenameMatches: [],
  },
]

describe('library analysis locator profile', () => {
  it('classifies missing-locator rows by the strongest available locator signal', () => {
    const profile = buildLibraryAnalysisLocatorProfile(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })

    assert.equal(profile.total, 4)
    assert.deepEqual(profile.summary.byLocatorStatus, {
      locator_missing: 1,
      local_match_candidate: 1,
      url_backed_no_local_file: 2,
    })
    assert.equal(profile.summary.rowsWithExternalLocator, 2)
    assert.equal(profile.summary.localMatchCandidates, 1)
    assert.equal(profile.summary.trueLocatorGaps, 1)

    const sourceDocUrl = profile.rows.find(row => row.sourceKey === 'document:source-doc-url')
    assert.equal(sourceDocUrl?.locatorStatus, 'url_backed_no_local_file')
    assert.match(sourceDocUrl?.recommendedAction ?? '', /download/)
    assert.deepEqual(sourceDocUrl?.locatorSignals, ['source_doc_url', 'source_doc_doi'])

    const localMatch = profile.rows.find(row => row.sourceKey === 'document:local-match')
    assert.equal(localMatch?.locatorStatus, 'local_match_candidate')
    assert.match(localMatch?.recommendedAction ?? '', /remap/)

    const gap = profile.rows.find(row => row.sourceKey === 'document:gap')
    assert.equal(gap?.locatorStatus, 'locator_missing')
    assert.match(gap?.recommendedAction ?? '', /Manual source search/)
  })

  it('formats a guarded markdown locator profile', () => {
    const profile = buildLibraryAnalysisLocatorProfile(inputs, {
      generatedAt: '2026-06-18T12:00:00.000Z',
    })
    const markdown = formatLibraryAnalysisLocatorProfileMarkdown(profile, {
      jsonPath: 'research/_status/library-analysis-locator-profile.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis Locator Profile/m)
    assert.match(markdown, /read-only/)
    assert.match(markdown, /no-path/)
    assert.match(markdown, /lager ikke claim-kandidater/)
    assert.match(markdown, /Total rows \| 4/)
    assert.match(markdown, /Rows with external locator \| 2/)
    assert.match(markdown, /True locator gaps \| 1/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
  })
})
