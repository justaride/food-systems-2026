import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('subsidy concentration math', () => {
  it('can be imported without fetching CSV data and computes known values', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-subsidy-concentration?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))

      assert.deepEqual(logs, [])
      assert.equal(mod.gini([10, 10, 10, 10]), 0)
      assert.equal(+mod.gini([1, 2, 3, 4]).toFixed(4), 0.25)
      assert.equal(+mod.gini([1, 1, 1, 100]).toFixed(4), 0.7209)
      assert.equal(mod.topShare([100, 50, 25, 25], 25), 0.5)
      assert.deepEqual(mod.lorenzDeciles(Array(10).fill(1)), [
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1,
      ])
    } finally {
      console.log = originalLog
    }
  })
})

describe('subsidy scheme-column resolution (2024 prosa-alias)', () => {
  it('mapper slug-headere (≤2023) til seg selv og 2024-prosa til kanonisk slug', async () => {
    const mod = await import(`../../scripts/analyze-subsidy-concentration?test=${Date.now()}`)

    // Slug-headere (2023-stil): hver ordning mapper til sin egen slug → uendret.
    const slug = mod.resolveSchemeHeaders(['orgnr', 'arealtilskudd', 'avloesertilskudd', 'husdyrtilskudd'])
    assert.equal(slug.get('arealtilskudd'), 'arealtilskudd')
    assert.equal(slug.get('avloesertilskudd'), 'avloesertilskudd')
    assert.equal(slug.get('husdyrtilskudd'), 'husdyrtilskudd')

    // Prosa-headere (2024-stil): fanges via alias.
    const prosa = mod.resolveSchemeHeaders([
      'orgnr',
      'arealtilskudd', // prosa = slug for denne
      'driftstilskudd til melkeproduksjon',
      'tilskudd for dyr på utmarksbeite',
      'tilskudd til avløsning ved ferie og fritid',
    ])
    assert.equal(prosa.get('arealtilskudd'), 'arealtilskudd')
    assert.equal(prosa.get('melkeproduksjon'), 'driftstilskudd til melkeproduksjon')
    assert.equal(prosa.get('utmarksbeitetilskudd'), 'tilskudd for dyr på utmarksbeite')
    assert.equal(prosa.get('avloesertilskudd'), 'tilskudd til avløsning ved ferie og fritid')
    // Ordning som ikke er til stede mappes ikke.
    assert.equal(prosa.has('beitetilskudd'), false)
  })

  it('summer ALLE ordninger under 2024-prosa-headere, ikke bare de 3 slug-matchende', async () => {
    const mod = await import(`../../scripts/analyze-subsidy-concentration?test=${Date.now()}`)
    // Rader slik parseCsv produserer dem: REKTANGULÆRE (hver rad har hver header-
    // nøkkel, '' der beløp mangler). Blanding av slug-direkte (areal/husdyr) og
    // prosa-alias-ordninger (2024-stil).
    const rows = [
      {
        orgnr: '111111111',
        kommunenr: '0301',
        arealtilskudd: '100',
        husdyrtilskudd: '200',
        'driftstilskudd til melkeproduksjon': '300',
        'tilskudd for dyr på utmarksbeite': '50',
        'tilskudd til avløsning ved ferie og fritid': '',
      },
      {
        orgnr: '222222222',
        kommunenr: '0301',
        arealtilskudd: '400',
        husdyrtilskudd: '',
        'driftstilskudd til melkeproduksjon': '',
        'tilskudd for dyr på utmarksbeite': '',
        'tilskudd til avløsning ved ferie og fritid': '100',
      },
    ]
    const s = mod.summarize(2024, rows)
    // Med fiksen: A=650, B=500 → 1150. Gammel kode (kun slug) ville gitt 300+400=700.
    assert.equal(s.recipients, 2)
    assert.equal(s.totalNok, 1150)
    const byScheme = Object.fromEntries(s.schemeBreakdown.map((b: { scheme: string; amount: number }) => [b.scheme, b.amount]))
    assert.equal(byScheme['melkeproduksjon'], 300)
    assert.equal(byScheme['utmarksbeitetilskudd'], 50)
    assert.equal(byScheme['avloesertilskudd'], 100)
    assert.equal(byScheme['arealtilskudd'], 500)
    assert.equal(byScheme['husdyrtilskudd'], 200)
  })
})
