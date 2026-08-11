import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  searchWithDiagnostics,
  type SearchResult,
  type SearchRuntime,
} from '../../src/lib/queries/search'

const reportResult: SearchResult = {
  type: 'report',
  id: 'report-1',
  title: 'Margin report',
  excerpt: 'Keyword-backed report result',
  url: '/rapporter',
}

describe('search mode routing', () => {
  it('falls back to keyword with a diagnostic for semantic non-document filters', async () => {
    let semanticCalls = 0
    let keywordTypes: readonly string[] | undefined
    const runtime: SearchRuntime = {
      semantic: async () => {
        semanticCalls += 1
        return [{
          id: 'document-1',
          slug: 'document-1',
          title: 'Document result',
          excerpt: 'Semantic document result',
          tags: [],
          distance: 0.1,
        }]
      },
      keyword: async (_query, _limit, types) => {
        keywordTypes = types
        return [reportResult]
      },
      enrich: async results => results,
    }

    const execution = await searchWithDiagnostics(
      'marginer',
      5,
      'semantic',
      ['report'],
      runtime,
    )

    assert.equal(semanticCalls, 0)
    assert.deepEqual(keywordTypes, ['report'])
    assert.equal(execution.requestedMode, 'semantic')
    assert.equal(execution.executedMode, 'keyword')
    assert.equal(execution.fallback, true)
    assert.deepEqual(execution.warnings, [{
      code: 'semantic-type-filter-unsupported',
      message: 'Semantisk søk dekker dokumenter. Viser nøkkelordtreff for de valgte kildetypene.',
    }])
    assert.deepEqual(execution.results, [reportResult])
  })

  it('keeps document-only semantic searches on the semantic path', async () => {
    let keywordCalls = 0
    const runtime: SearchRuntime = {
      semantic: async () => [{
        id: 'document-1',
        slug: 'document-1',
        title: 'Document result',
        excerpt: 'Semantic document result',
        tags: [],
        distance: 0.1,
      }],
      keyword: async () => {
        keywordCalls += 1
        return [reportResult]
      },
      enrich: async results => results,
    }

    const execution = await searchWithDiagnostics(
      'marginer',
      5,
      'semantic',
      ['document'],
      runtime,
    )

    assert.equal(keywordCalls, 0)
    assert.equal(execution.executedMode, 'semantic')
    assert.equal(execution.fallback, false)
    assert.deepEqual(execution.warnings, [])
    assert.deepEqual(execution.results.map(result => result.type), ['document'])
  })
})
