import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildSourceGapQueue } from '../../src/lib/source-gap-queue'

describe('source gap queue', () => {
  it('groups unresolved label-only and missing source rows by table and source label', () => {
    const queue = buildSourceGapQueue([
      {
        label: 'BusinessRelationship.source',
        rows: [
          { id: 'rel-1', source: 'Bransjedata' },
          { id: 'rel-2', source: 'Bransjedata' },
          { id: 'rel-3', source: 'https://example.com/source' },
          { id: 'rel-4', source: 'Årsrapport 2024', resolvedLocator: 'document:foo' },
        ],
      },
      {
        label: 'BoardMember.source',
        rows: [
          { id: 'board-1:Test Person', source: null },
          { id: 'board-2:Other Person', source: '' },
        ],
      },
    ])

    assert.deepEqual(queue, [
      {
        label: 'BoardMember.source',
        issue: 'missing_source',
        source: null,
        count: 2,
        examples: ['board-1:Test Person', 'board-2:Other Person'],
      },
      {
        label: 'BusinessRelationship.source',
        issue: 'label_only',
        source: 'Bransjedata',
        count: 2,
        examples: ['rel-1', 'rel-2'],
      },
    ])
  })
})
