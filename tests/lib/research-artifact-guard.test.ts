import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildResearchArtifactGuardReport,
  formatResearchArtifactGuardReport,
} from '../../src/lib/research-artifact-guard'

describe('research artifact guard', () => {
  it('flags new PDFs and raw registry document payloads', () => {
    const report = buildResearchArtifactGuardReport({
      addedPaths: [
        'research/evidence-pack/arsrapporter/new-report.pdf',
        'research/evidence-pack/registry-sources/dk-cvr-2026-05-18/documents/company/report.xml',
        'research/evidence-pack/registry-sources/dk-cvr-2026-05-18/manifest.csv',
      ],
      trackedFiles: [],
      maxBytes: 50 * 1024 * 1024,
    })

    assert.deepEqual(report.violations.map(violation => ({
      kind: violation.kind,
      path: violation.path,
    })), [
      {
        kind: 'new_research_pdf',
        path: 'research/evidence-pack/arsrapporter/new-report.pdf',
      },
      {
        kind: 'raw_registry_document',
        path: 'research/evidence-pack/registry-sources/dk-cvr-2026-05-18/documents/company/report.xml',
      },
    ])
  })

  it('allows tracked metadata and legacy PDFs that are not newly added', () => {
    const report = buildResearchArtifactGuardReport({
      addedPaths: [
        'research/evidence-pack/registry-sources/dk-cvr-2026-05-18/headers/company.headers',
        'research/evidence-pack/registry-sources/dk-cvr-2026-05-18/metadata/company.json',
      ],
      trackedFiles: [
        {
          path: 'research/evidence-pack/arsrapporter/existing-report.pdf',
          sizeBytes: 44 * 1024 * 1024,
        },
      ],
      maxBytes: 50 * 1024 * 1024,
    })

    assert.deepEqual(report.violations, [])
  })

  it('flags any tracked file over the configured size limit', () => {
    const report = buildResearchArtifactGuardReport({
      addedPaths: [],
      trackedFiles: [
        {
          path: 'research/evidence-pack/registry-sources/dk-cvr/documents/large.xhtml',
          sizeBytes: 80 * 1024 * 1024,
        },
      ],
      maxBytes: 50 * 1024 * 1024,
    })

    assert.equal(report.violations.length, 1)
    assert.equal(report.violations[0].kind, 'tracked_file_too_large')
    assert.match(formatResearchArtifactGuardReport(report), /80\.0 MB/)
  })
})
