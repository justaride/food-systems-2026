import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { deflateRawSync } from 'node:zlib'

type Mod = typeof import('../../scripts/analyze-price-asymmetry.ts')

async function load(): Promise<Mod> {
  return (await import(`../../scripts/analyze-price-asymmetry?test=${Date.now()}`)) as Mod
}

describe('price asymmetry: import og lineær algebra', () => {
  it('kan importeres uten å hente data eller logge', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await load()
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])
      assert.equal(typeof mod.ols, 'function')
    } finally {
      console.log = originalLog
    }
  })

  it('inverterer en kjent matrise', async () => {
    const { matInv } = await load()
    const inv = matInv([
      [4, 7],
      [2, 6],
    ])
    assert.deepEqual(
      inv.map(r => r.map(v => +v.toFixed(6))),
      [
        [0.6, -0.7],
        [-0.2, 0.4],
      ]
    )
  })

  it('avviser en singulær matrise framfor å returnere søppel', async () => {
    const { matInv } = await load()
    assert.throws(
      () =>
        matInv([
          [1, 2],
          [2, 4],
        ]),
      /singulær/
    )
  })

  it('gjenfinner koeffisientene eksakt på en støyfri modell', async () => {
    const { ols } = await load()
    const x = [1, 2, 3, 4, 5, 6, 7, 8]
    const y = x.map(v => 2 + 3 * v)
    const fit = ols(
      y,
      x.map(v => [1, v])
    )
    assert.equal(+fit.beta[0].toFixed(9), 2)
    assert.equal(+fit.beta[1].toFixed(9), 3)
    assert.equal(+fit.r2.toFixed(9), 1)
    assert.equal(fit.n, 8)
    assert.equal(fit.k, 2)
  })

  it('regner standardfeilen til en kontrast fra kovariansmatrisen', async () => {
    const { contrastSe } = await load()
    // Var(β₁ − β₂) = 4 + 9 − 2·1 = 11
    const vcov = [
      [4, 1],
      [1, 9],
    ]
    assert.equal(+contrastSe([1, -1], vcov).toFixed(6), +Math.sqrt(11).toFixed(6))
  })
})

describe('price asymmetry: serietransformasjoner', () => {
  it('splitter endringer i positiv og negativ del', async () => {
    const { splitChanges } = await load()
    assert.deepEqual(splitChanges([1, -2, 3, 0]), {
      up: [1, 0, 3, 0],
      down: [0, -2, 0, 0],
    })
  })

  it('bygger kumulative partialsummer', async () => {
    const { partialSums } = await load()
    assert.deepEqual(partialSums([1, -2, 3]), {
      up: [1, 1, 4],
      down: [0, -2, -2],
    })
  })

  it('regner log-differanser', async () => {
    const { logDiff } = await load()
    const d = logDiff([1, Math.E, Math.E ** 2])
    assert.deepEqual(
      d.map(v => +v.toFixed(9)),
      [1, 1]
    )
  })
})

describe('price asymmetry: asymmetrispesifikasjoner', () => {
  // Δy = 0,5·Δx⁺ + 0,1·Δx⁻ — konstruert slik at fasiten er kjent.
  const dx = [
    0.02, -0.03, 0.05, -0.01, 0.04, -0.02, 0.03, -0.05, 0.06, -0.04, 0.01, -0.02, 0.05, -0.03,
    0.02, -0.01, 0.04, -0.06, 0.03, -0.02, 0.05, -0.04, 0.02, -0.03, 0.06, -0.01, 0.03, -0.05,
    0.04, -0.02,
  ]

  it('gjenfinner kjent asymmetri i distribuert-lag-spesifikasjonen', async () => {
    const { distributedLagAsymmetry, splitChanges } = await load()
    const s = splitChanges(dx)
    const dy = dx.map((_, i) => 0.5 * s.up[i] + 0.1 * s.down[i])
    const fit = distributedLagAsymmetry(dx, dy, 3)
    assert.equal(fit.cumulativeUp, 0.5)
    assert.equal(fit.cumulativeDown, 0.1)
    assert.equal(fit.asymmetry, 0.4)
    assert.equal(fit.r2, 1)
    assert.equal(fit.n, dx.length - 3)
  })

  it('gir null asymmetri når gjennomslaget er symmetrisk', async () => {
    const { distributedLagAsymmetry } = await load()
    const dy = dx.map(d => 0.4 * d)
    const fit = distributedLagAsymmetry(dx, dy, 3)
    assert.equal(fit.cumulativeUp, 0.4)
    assert.equal(fit.cumulativeDown, 0.4)
    assert.equal(fit.asymmetry, 0)
  })

  it('gjenfinner kjente koeffisienter i nivå-/partialsum-spesifikasjonen', async () => {
    const { cumulativeLevelAsymmetry, partialSums } = await load()
    const ps = partialSums(dx)
    // log y_{t+1} = 1 + 0,6·x⁺_t + 0,2·x⁻_t
    const yLevels = [Math.exp(1), ...ps.up.map((u, i) => Math.exp(1 + 0.6 * u + 0.2 * ps.down[i]))]
    const fit = cumulativeLevelAsymmetry(dx, yLevels)
    assert.equal(fit.cumulativeUp, 0.6)
    assert.equal(fit.cumulativeDown, 0.2)
    assert.equal(fit.asymmetry, 0.4)
    assert.equal(fit.r2, 1)
  })

  it('teller fortegnssamsvar riktig', async () => {
    const { signTest } = await load()
    //          opp    ned   opp   ned    null
    const x = [0.01, -0.01, 0.02, -0.02, 0]
    const y = [0.01, 0.01, -0.01, -0.01, 0.05]
    assert.deepEqual(signTest(x, y), {
      upMonths: 2,
      downMonths: 2,
      shareDownstreamUpWhenUpstreamUp: 0.5,
      shareDownstreamUpWhenUpstreamDown: 0.5,
    })
  })
})

describe('price asymmetry: perioder', () => {
  it('gir en sammenlignbar månedsindeks', async () => {
    const { monthIndex } = await load()
    assert.equal(monthIndex('2020M02') - monthIndex('2019M12'), 2)
    assert.throws(() => monthIndex('2020K1'), /ugyldig/)
  })

  it('tilordner ISO-uker til måned via ukens torsdag', async () => {
    const { isoWeekToMonth } = await load()
    // 2019-uke 1 har torsdag 3. januar 2019.
    assert.equal(isoWeekToMonth('2019U01'), '2019M01')
    // Uke 5 2019 spenner januar/februar; torsdagen (31.01) ligger i januar.
    assert.equal(isoWeekToMonth('2019U05'), '2019M01')
    // Uke 6 2019 har torsdag 7. februar.
    assert.equal(isoWeekToMonth('2019U06'), '2019M02')
    // 2020 har 53 ISO-uker; uke 53 har torsdag 31.12.2020.
    assert.equal(isoWeekToMonth('2020U53'), '2020M12')
    // Uke 1 2021 har torsdag 07.01.2021 — altså januar, ikke desember.
    assert.equal(isoWeekToMonth('2021U01'), '2021M01')
    assert.throws(() => isoWeekToMonth('2019M01'), /ugyldig/)
  })

  it('klipper serier til felles vindu og dropper hull', async () => {
    const { alignSeries } = await load()
    const a = new Map([
      ['2019M01', 1],
      ['2019M02', 2],
      ['2019M03', 3],
    ])
    const b = new Map([
      ['2019M01', 10],
      ['2019M03', 30],
    ])
    const { periods, columns } = alignSeries([a, b], '2019M01', null)
    assert.deepEqual(periods, ['2019M01', '2019M03'])
    assert.deepEqual(columns, [
      [1, 3],
      [10, 30],
    ])
  })

  it('respekterer fra- og til-grensene', async () => {
    const { alignSeries } = await load()
    const a = new Map([
      ['2019M01', 1],
      ['2019M02', 2],
      ['2019M03', 3],
    ])
    const { periods } = alignSeries([a], '2019M02', '2019M02')
    assert.deepEqual(periods, ['2019M02'])
  })
})

describe('price asymmetry: xlsx-lesing', () => {
  it('oversetter kolonnebokstaver til indeks', async () => {
    const { colToIndex } = await load()
    assert.deepEqual(['A', 'B', 'U', 'Z', 'AA', 'AB'].map(colToIndex), [0, 1, 20, 25, 26, 27])
  })

  it('leser delte strenger, også med escapede tegn', async () => {
    const { parseSharedStrings } = await load()
    const xml =
      '<sst><si><t>Fish meal</t></si><si><t>Soybean &amp; oil</t></si>' +
      '<si><r><t>Crude </t></r><r><t>oil</t></r></si></sst>'
    assert.deepEqual(parseSharedStrings(xml), ['Fish meal', 'Soybean & oil', 'Crude oil'])
  })

  it('leser celler med delte strenger, tall, inline-strenger og hull', async () => {
    const { readSheet } = await load()
    const shared = ['Fish meal', '($/mt)']
    const xml =
      '<sheetData>' +
      '<row r="5"><c r="A5" t="s"><v>0</v></c><c r="C5" t="s"><v>1</v></c></row>' +
      '<row r="7"><c r="A7" t="inlineStr"><is><t>2019M01</t></is></c>' +
      '<c r="B7"/>' +
      '<c r="C7"><v>1450.5</v></c></row>' +
      '</sheetData>'
    const rows = readSheet(xml, shared)
    assert.deepEqual(rows.get(5)?.[0], 'Fish meal')
    assert.deepEqual(rows.get(5)?.[2], '($/mt)')
    assert.deepEqual(rows.get(7)?.[0], '2019M01')
    assert.equal(rows.get(7)?.[1], undefined)
    assert.deepEqual(rows.get(7)?.[2], '1450.5')
  })

  it('pakker ut en zip med både lagrede og deflaterte oppføringer', async () => {
    const { unzipEntries } = await load()
    const files: { name: string; data: Buffer; method: number }[] = [
      { name: 'stored.txt', data: Buffer.from('lagret uten komprimering'), method: 0 },
      { name: 'xl/sharedStrings.xml', data: Buffer.from('<sst><si><t>x</t></si></sst>'), method: 8 },
    ]
    const locals: Buffer[] = []
    const centrals: Buffer[] = []
    let offset = 0
    for (const f of files) {
      const payload = f.method === 8 ? deflateRawSync(f.data) : f.data
      const name = Buffer.from(f.name, 'utf8')

      const local = Buffer.alloc(30)
      local.writeUInt32LE(0x04034b50, 0)
      local.writeUInt16LE(f.method, 8)
      local.writeUInt32LE(payload.length, 18)
      local.writeUInt32LE(f.data.length, 22)
      local.writeUInt16LE(name.length, 26)
      locals.push(local, name, payload)

      const central = Buffer.alloc(46)
      central.writeUInt32LE(0x02014b50, 0)
      central.writeUInt16LE(f.method, 10)
      central.writeUInt32LE(payload.length, 20)
      central.writeUInt32LE(f.data.length, 24)
      central.writeUInt16LE(name.length, 28)
      central.writeUInt32LE(offset, 42)
      centrals.push(central, name)

      offset += 30 + name.length + payload.length
    }
    const localBuf = Buffer.concat(locals)
    const centralBuf = Buffer.concat(centrals)
    const eocd = Buffer.alloc(22)
    eocd.writeUInt32LE(0x06054b50, 0)
    eocd.writeUInt16LE(files.length, 8)
    eocd.writeUInt16LE(files.length, 10)
    eocd.writeUInt32LE(centralBuf.length, 12)
    eocd.writeUInt32LE(localBuf.length, 16)

    const entries = unzipEntries(Buffer.concat([localBuf, centralBuf, eocd]))
    assert.equal(entries.get('stored.txt')?.toString('utf8'), 'lagret uten komprimering')
    assert.equal(
      entries.get('xl/sharedStrings.xml')?.toString('utf8'),
      '<sst><si><t>x</t></si></sst>'
    )
  })

  it('avviser en buffer som ikke er en zip', async () => {
    const { unzipEntries } = await load()
    assert.throws(() => unzipEntries(Buffer.from('ikke en zip')), /EOCD/)
  })
})
