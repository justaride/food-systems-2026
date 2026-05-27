import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const heavyPages = [
  'src/app/innsikt/InnsiktContent.tsx',
  'src/app/forsyningskjede/ForsyningskjedeContent.tsx',
  'src/app/sammenligning/SammenligningContent.tsx',
  'src/app/graf/page.tsx',
  'src/app/mandat/MandatContent.tsx',
  'src/app/bibliotek/BibliotekContent.tsx',
]

describe('heavy page framing', () => {
  for (const file of heavyPages) {
    it(`${file} includes compact question framing and claim-safety caveat`, () => {
      const source = readFileSync(file, 'utf8')

      assert.ok(source.includes('Hva svarer denne siden på?'), `${file} is missing page framing heading`)
      assert.match(source, /takeaways\s*=\s*\{?\[/, `${file} is missing explicit three-takeaway framing`)
      assert.match(source, /caveat\s*=/, `${file} is missing an explicit caveat`)
      assert.match(
        source,
        /intern|med forbehold|proxy|illustrativ|kildegrunnlag|ikke ekstern validering/i,
        `${file} caveat must preserve claim safety`,
      )
    })
  }
})
