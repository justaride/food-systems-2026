import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { countForetakByKommune, parseForetakCsv } from '../../../src/lib/map/farm-foretak'

const CSV = [
  'ORGNR;KOMNR;GARDSNR;BRUKSNR;FESTENR;ID;KOORDSYS;NORD;OST;ORGNR_1',
  '"996547515";"3440";30;1;0;82415;25832;6792688;577221;"973266330"',
  '"984858655";"3440";98;5;0;82448;25832;6798115;570801;"973704184"',
  '"984858655";"3411";12;1;0;90001;25832;6750000;600000;"973704185"',
  '"911111111";"3411";4;2;0;90002;25832;6751000;601000;"973704186"',
  '',
].join('\n')

describe('parseForetakCsv', () => {
  it('reads orgnr and kommunenummer from the semicolon-separated register file', () => {
    const rows = parseForetakCsv(CSV)
    assert.equal(rows.length, 4)
    assert.deepEqual(rows[0], { orgnr: '996547515', komnr: '3440' })
  })

  it('rejects a file without the expected columns', () => {
    assert.throws(() => parseForetakCsv('A;B\n1;2'), /ORGNR/)
  })
})

describe('countForetakByKommune', () => {
  it('counts a foretak once, in the kommune where it first appears', () => {
    const counts = countForetakByKommune(parseForetakCsv(CSV))
    assert.equal(counts.get('3440'), 2)
    assert.equal(counts.get('3411'), 1)
  })
})
