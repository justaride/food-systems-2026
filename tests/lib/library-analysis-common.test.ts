import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  extractPptxSlideText,
  shouldIncludeResearchLibraryFile,
} from '../../scripts/library-analysis-common'

describe('library analysis common file loading', () => {
  it('excludes generated media scrape report logs from the source inventory', () => {
    assert.equal(
      shouldIncludeResearchLibraryFile(
        'research/bibliotek/media/media-scrape-report-2026-04-29T02-14-04-816Z-id-is-samkeppnisvisar-grocery-hhi-2021-status-candidate_fetch.json',
      ),
      false,
    )

    assert.equal(
      shouldIncludeResearchLibraryFile('research/bibliotek/media/snapshots/no-kt-dagligvarerapport-2024-25.md'),
      true,
    )
  })

  it('excludes research progress logs from the source inventory', () => {
    assert.equal(
      shouldIncludeResearchLibraryFile('research/bibliotek/forskningsrunde-2026-04-20/eat-foundation/progress.md'),
      false,
    )

    assert.equal(
      shouldIncludeResearchLibraryFile('research/bibliotek/forskningsrunde-2026-04-20/eat-foundation/final-report.md'),
      true,
    )
  })

  it('extracts slide text from PPTX slide XML without presentation markup', () => {
    const text = extractPptxSlideText([
      '<p:sld><a:t>Regional</a:t><a:t> resurskartl&#228;ggning</a:t></p:sld>',
      '<p:sld><a:t>RE:Source &amp; industriell symbios</a:t></p:sld>',
    ].join('\n'))

    assert.equal(text, 'Regional resurskartläggning RE:Source & industriell symbios')
  })
})
