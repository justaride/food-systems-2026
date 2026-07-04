import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildLibraryAnalysisPdfExtractionProfile,
  formatLibraryAnalysisPdfExtractionProfileMarkdown,
  type LibraryAnalysisPdfExtractionProfileInput,
} from '../../src/lib/library-analysis-pdf-extraction-profile'

const rows: LibraryAnalysisPdfExtractionProfileInput[] = [
  {
    sourceKey: 'document:large',
    title: 'Large PDF',
    wordCount: 42,
    repairBatch: 'pdf_text_extraction',
    resolvedPath: 'research/large.pdf',
    canonicalPath: 'legacy/large.pdf',
  },
  {
    sourceKey: 'document:medium',
    title: 'Medium PDF',
    wordCount: 80,
    repairBatch: 'pdf_text_extraction',
    resolvedPath: 'research/medium.pdf',
    canonicalPath: null,
  },
  {
    sourceKey: 'document:small',
    title: 'Small PDF',
    wordCount: 38,
    repairBatch: 'pdf_text_extraction',
    resolvedPath: null,
    canonicalPath: 'research/small.pdf',
  },
  {
    sourceKey: 'document:failed',
    title: 'Unreadable PDF',
    wordCount: 56,
    repairBatch: 'pdf_text_extraction',
    resolvedPath: 'research/failed.pdf',
    canonicalPath: null,
  },
  {
    sourceKey: 'document:markdown',
    title: 'Not a PDF batch',
    wordCount: 10,
    repairBatch: 'markdown_low_text_review',
    resolvedPath: 'research/note.md',
    canonicalPath: null,
  },
]

describe('library analysis PDF extraction profile', () => {
  it('classifies PDF repair rows by extracted text volume', () => {
    const profile = buildLibraryAnalysisPdfExtractionProfile(rows, row => {
      if (row.sourceKey === 'document:large') {
        return { exitCode: 0, stderr: '', text: 'ord '.repeat(600) }
      }
      if (row.sourceKey === 'document:medium') {
        return { exitCode: 0, stderr: '', text: 'ord '.repeat(180) }
      }
      if (row.sourceKey === 'document:small') {
        return { exitCode: 0, stderr: '', text: 'ord '.repeat(72) }
      }
      return { exitCode: 1, stderr: 'syntax error', text: '' }
    })

    assert.equal(profile.total, 4)
    assert.deepEqual(profile.summary.byStatus, {
      extract_failed: 1,
      extractable_150_499: 1,
      extractable_500_plus: 1,
      small_gain: 1,
    })
    assert.equal(profile.summary.extractableRows, 2)
    assert.equal(profile.summary.mechanicalRepairCandidates, 3)
    assert.equal(profile.rows.find(row => row.sourceKey === 'document:large')?.path, 'research/large.pdf')
    assert.equal(profile.rows.find(row => row.sourceKey === 'document:small')?.status, 'small_gain')
    assert.match(profile.rows.find(row => row.sourceKey === 'document:failed')?.error ?? '', /syntax/)
  })

  it('formats a guarded markdown handoff', () => {
    const profile = buildLibraryAnalysisPdfExtractionProfile(rows, row => ({
      exitCode: 0,
      stderr: '',
      text: row.sourceKey === 'document:large' ? 'ord '.repeat(600) : 'ord '.repeat(180),
    }))
    const markdown = formatLibraryAnalysisPdfExtractionProfileMarkdown(profile, {
      generatedAt: '2026-06-18T12:00:00.000Z',
      jsonPath: 'research/_status/library-analysis-pdf-extraction-profile.json',
      sampleLimit: 2,
    })

    assert.match(markdown, /^# Library Analysis PDF Extraction Profile/m)
    assert.match(markdown, /read-only profil/)
    assert.match(markdown, /Total PDF repair rows \| 4/)
    assert.match(markdown, /Mechanical repair candidates \| 4/)
    assert.match(markdown, /Rows shown below: 2 of 4/)
    assert.match(markdown, /research\/_status\/library-analysis-pdf-extraction-profile.json/)
  })
})
