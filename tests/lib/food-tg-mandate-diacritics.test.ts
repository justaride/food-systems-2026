import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('food-tg-mandate diacritics', () => {
  const files = [
    'src/lib/data/food-tg-mandate.ts',
    'src/app/mandat/MandatContent.tsx',
  ]
  // Word-boundary patterns for known stripped forms. Each MUST be absent.
  const strippedPatterns = [
    /\bForelopig\b/, /\btverrgaende\b/, /\bKjor\b/, /\bMiljodirektoratet\b/,
    /\bsporsmal\b/, /\bforelopig\b/, /\blaase\b/, /\bsidestroem\b/,
    /\bforproteiner\b/, /\bForaktor/, /\bkjoper\b/, /\bvaere\b/, /\bgjor\b/,
  ]
  for (const file of files) {
    it(`${file} has no known stripped Norwegian tokens`, () => {
      const text = readFileSync(file, 'utf8')
      for (const pat of strippedPatterns) {
        assert.ok(!pat.test(text), `${file} still contains ${pat}`)
      }
    })
  }
})
