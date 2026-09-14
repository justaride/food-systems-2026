import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  categoryForSections,
  extractCsvLinks,
  groupEstablishments,
  isVesselOnly,
  parseCsv,
  sectionNumber,
} from '../../../../src/lib/map/registers/mattilsynet'

// Synthetic rows in the combined list's column layout; names are invented.
const CSV = [
  'GODKJENNINGSNUMMER,VIRKSOMHETSNAVN,ADRESSE,POSTNR,POSTSTED,PRODUKSJONSFORM,ANDRE_PRODFORMER,ART,MERKNAD,SEKSJON',
  'T100,Testfisk AS,Testgata 12,9990,Prøvested,PP,"CS, RW",,,Section 8 - Fishery products',
  'T100,Testfisk AS,Testgata 12,9990,Prøvested,CS,,,,Section 0 - General activity establishment',
  'T200,Prøveslakt SA,Kaivegen 1,9991,Prøvested,SH,,"B, O",,Section 1 - Meat of domestic ungulates',
  'T200,Prøveslakt SA,Kaivegen 1,9991,Prøvested,CP,,B,,Section 6 - Meat products',
  'T300,Testbåt AS,,9992,Prøvested,FV,ZV,,,Section 8 - Fishery products',
  '',
].join('\n')

describe('parseCsv', () => {
  it('keeps quoted commas inside one field', () => {
    const rows = parseCsv(CSV)
    assert.equal(rows.length, 5)
    assert.equal(rows[0].ANDRE_PRODFORMER, 'CS, RW')
  })

  it('reads a semicolon file and strips a byte-order mark', () => {
    assert.deepEqual(parseCsv('﻿A;B\n1;"x;y"\n', ';'), [{ A: '1', B: 'x;y' }])
  })
})

describe('sectionNumber and categoryForSections', () => {
  it('reads the section number from its label', () => {
    assert.equal(sectionNumber('Section 10 - Eggs and egg products'), 10)
    assert.equal(sectionNumber('Ukjent'), null)
  })

  it('prefers the most specific food category', () => {
    assert.equal(categoryForSections([0, 8]), 'seafood')
    assert.equal(categoryForSections([1, 6]), 'meat')
    assert.equal(categoryForSections([9]), 'dairy')
    assert.equal(categoryForSections([10]), 'egg')
    assert.equal(categoryForSections([0]), 'general')
  })
})

describe('groupEstablishments', () => {
  const establishments = groupEstablishments(parseCsv(CSV), new Map([['T100', '999999999']]))
  const byId = new Map(establishments.map(e => [e.approvalNumber, e]))

  it('merges section rows by approval number', () => {
    assert.equal(establishments.length, 3)
    assert.deepEqual(byId.get('T100')?.sections, [0, 8])
    assert.deepEqual(byId.get('T100')?.activities, ['PP', 'CS', 'RW'])
    assert.equal(byId.get('T100')?.category, 'seafood')
  })

  it('collects species without duplicates and attaches the fishery-list orgnr', () => {
    assert.deepEqual(byId.get('T200')?.species, ['B', 'O'])
    assert.equal(byId.get('T100')?.orgNr, '999999999')
    assert.equal(byId.get('T200')?.orgNr, undefined)
  })

  it('flags establishments that only operate vessels', () => {
    assert.equal(isVesselOnly(byId.get('T300')!), true)
    assert.equal(isVesselOnly(byId.get('T100')!), false)
  })
})

describe('extractCsvLinks', () => {
  it('finds unique attachment CSV links on a list page', () => {
    const html =
      '<a href="https://example.enonic.cloud/_/attachment/inline/abc:123/list.csv">CSV</a>' +
      '<a href="https://example.enonic.cloud/_/attachment/inline/abc:123/list.csv">CSV</a>' +
      '<a href="/_/attachment/inline/def:456/spec.pdf">PDF</a>'
    assert.deepEqual(extractCsvLinks(html), ['https://example.enonic.cloud/_/attachment/inline/abc:123/list.csv'])
  })
})
