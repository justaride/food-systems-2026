import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const searchSource = readFileSync('src/lib/queries/search.ts', 'utf8')
const sokContentSource = readFileSync('src/app/sok/SokContent.tsx', 'utf8')

describe('search fallback warning copy', () => {
  it('uses product copy for semantic and hybrid fallback warnings', () => {
    assert.match(
      searchSource,
      /Semantisk søk er ikke aktivert i denne versjonen\. Viser nøkkelordtreff\./,
    )
    assert.match(
      searchSource,
      /Hybrid søk bruker nøkkelord i denne versjonen\. Semantisk rangering er ikke aktivert\./,
    )
  })

  it('does not expose implementation diagnostics in fallback warning copy', () => {
    const combinedSource = `${searchSource}\n${sokContentSource}`

    assert.doesNotMatch(combinedSource, /OPENAI_API_KEY/)
    assert.doesNotMatch(combinedSource, /dokument-embeddings/)
    assert.doesNotMatch(combinedSource, /embeddings/)
    assert.doesNotMatch(combinedSource, /statussjekken/)
    assert.doesNotMatch(combinedSource, /fallback fra/)
  })
})
