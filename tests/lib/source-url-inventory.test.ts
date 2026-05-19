import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  collectDatabaseUrlRows,
  parseInventoryUrl,
} from '../../src/lib/source-url-inventory'

describe('source URL inventory helpers', () => {
  it('parses inventory URLs and normalizes www domains', () => {
    assert.deepEqual(parseInventoryUrl(' https://www.Regjeringen.no/no/dokumenter '), {
      domain: 'regjeringen.no',
      protocol: 'https',
    })

    assert.deepEqual(parseInventoryUrl('ftp://archive.example/file.pdf'), {
      domain: 'archive.example',
      protocol: 'other',
    })

    assert.equal(parseInventoryUrl('regjeringen.no/no/dokumenter'), null)
  })

  it('collects Document and SourceDoc URLs from DB-shaped rows', () => {
    const rows = collectDatabaseUrlRows({
      documents: [
        {
          id: 'doc-db-id',
          slug: 'nordic-food-policy',
          url: 'https://example.org/document',
        },
        {
          id: 'doc-without-url',
          slug: 'local-only-document',
          url: null,
        },
      ],
      sourceDocs: [
        {
          id: 'src-1',
          url: 'http://sources.example/report.pdf',
        },
        {
          id: 'src-invalid',
          url: 'not a url',
        },
      ],
      priorityMap: new Map([
        ['nordic-food-policy', 4.7],
        ['src-1', 3.5],
      ]),
    })

    assert.deepEqual(rows, [
      {
        url: 'https://example.org/document',
        source_type: 'document',
        source_id: 'nordic-food-policy',
        source_priority: 4.7,
        domain: 'example.org',
        protocol: 'https',
      },
      {
        url: 'http://sources.example/report.pdf',
        source_type: 'sourcedoc',
        source_id: 'src-1',
        source_priority: 3.5,
        domain: 'sources.example',
        protocol: 'http',
      },
    ])
  })
})
