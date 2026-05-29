import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const legendPath = 'src/components/visualization/StatusLegend.tsx'
const surfacesUsingLegend = [
  'src/app/graf/page.tsx',
  'src/app/mandat/MandatContent.tsx',
  'src/app/sok/SokContent.tsx',
  'src/app/bibliotek/BibliotekContent.tsx',
]

describe('shared status legend', () => {
  it('defines the required shared status vocabulary with caveated descriptions', () => {
    assert.ok(existsSync(legendPath), 'StatusLegend component should exist')
    const source = readFileSync(legendPath, 'utf8')

    for (const label of [
      'Utført internt',
      'Siterbar med forbehold',
      'Blokkert',
      'Validert eksternt',
      'Proxy',
      'Illustrativ',
    ]) {
      assert.ok(source.includes(label), `Missing status label: ${label}`)
    }

    assert.match(source, /ikke ekstern validering|ingen Food TG-claims/i)
    assert.doesNotMatch(source, /pilotklar|eksternt bekreftet/)
  })

  for (const file of surfacesUsingLegend) {
    it(`${file} uses the shared status legend`, () => {
      const source = readFileSync(file, 'utf8')

      assert.match(source, /StatusLegend/)
      assert.match(source, /ikke ekstern validering|ekstern bekreftelse|kildekontroll|claim-styrke/i)
    })
  }
})
