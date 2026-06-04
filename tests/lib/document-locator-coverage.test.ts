import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { hasDocumentLocator } from '../../src/lib/document-locator-coverage'

describe('Document locator coverage', () => {
  it('accepts direct URLs and resolvable local files', () => {
    assert.equal(hasDocumentLocator({ url: 'https://example.org/report.pdf' }, () => false), true)
    assert.equal(hasDocumentLocator({ filePath: 'docs/local.md' }, () => true), true)
  })

  it('accepts report shell documents with resolved internal or composite provenance', () => {
    assert.equal(
      hasDocumentLocator(
        {
          report: {
            provenanceType: 'composite_source',
            supportingSources: [{ label: 'source-a' }],
          },
        },
        () => false,
      ),
      true,
    )
  })

  it('accepts blocked-source report shells as explicitly classified non-evidence documents', () => {
    assert.equal(
      hasDocumentLocator(
        {
          report: {
            provenanceType: 'blocked_source',
            supportingSources: [{ label: 'manual remediation note' }],
          },
        },
        () => false,
      ),
      true,
    )
  })

  it('requires at least one locator or resolved report-provenance signal', () => {
    assert.equal(
      hasDocumentLocator(
        {
          report: {
            provenanceType: 'composite_source',
            supportingSources: [],
          },
        },
        () => false,
      ),
      false,
    )
    assert.equal(hasDocumentLocator({}, () => false), false)
  })
})
