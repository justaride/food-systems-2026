import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const catalogSurfaces = [
  'src/app/bibliotek/BibliotekContent.tsx',
  'src/app/sok/SokContent.tsx',
]

describe('library-analysis presentation', () => {
  for (const file of catalogSurfaces) {
    it(`${file} presents legacy policy fields without implying source approval`, () => {
      const source = readFileSync(file, 'utf8')

      assert.match(source, /Historisk intern policy/)
      assert.match(source, /historisk KI-kontekstregel/)
      assert.doesNotMatch(source, /AI godkjent internt|trygg AI-kontekst/)
    })
  }

  it('shows the missing-text count and explains overlap in the AI knowledge cockpit', () => {
    const source = readFileSync('src/app/ai-kunnskap/AiKunnskapContent.tsx', 'utf8')

    assert.match(source, /status\.missingText/)
    assert.match(source, /Lavt\/manglende tekstgrunnlag/)
    assert.match(source, /historiske policyklassifiseringer/)
    assert.match(source, /Tallene overlapper/)
    assert.match(source, /ikke kildegodkjenning/)
    assert.doesNotMatch(source, /Godkjent internt|Trygg AI-kontekst|Legacy safe_for_ai_context/)
  })
})
