import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  normalizePersonKey,
  brregPersonName,
  mapRolle,
  extractBrregPeople,
  compareCompany,
  type DbCompany,
} from '../../scripts/validate-against-brreg'

describe('validate-against-brreg pure core', () => {
  it('does not run the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      await import(`../../scripts/validate-against-brreg?test=${Date.now()}`)
      await new Promise((resolve) => setTimeout(resolve, 200))
      assert.deepEqual(logs, [])
    } finally {
      console.log = originalLog
    }
  })

  it('transliterates Nordic letters so Øyvind matches ASCII Oyvind', () => {
    // The core bug the fix addresses: Ø/Æ/Å do not NFD-decompose.
    assert.equal(normalizePersonKey('Øyvind Andersen'), normalizePersonKey('Oyvind Andersen'))
    assert.equal(normalizePersonKey('Øyvind Andersen'), 'oyvind-andersen')
    assert.equal(normalizePersonKey('Bjørn Kjærnes'), 'bjorn-kjaernes')
    assert.equal(normalizePersonKey('Kåre Ås'), 'kare-as')
    // Swedish/German vowels in the Nordic dataset
    assert.equal(normalizePersonKey('Göran Müller'), 'goran-muller')
    // Genuine accent (decomposes via NFD) still stripped to base letter
    assert.equal(normalizePersonKey('José René'), 'jose-rene')
  })

  it('maps brreg role codes to DB role terms', () => {
    assert.equal(mapRolle('LEDE'), 'styreleder')
    assert.equal(mapRolle('NEST'), 'nestleder')
    assert.equal(mapRolle('MEDL'), 'styremedlem')
    assert.equal(mapRolle('VARA'), 'varamedlem')
    assert.equal(mapRolle('DAGL'), 'daglig leder')
  })

  it('joins person name parts including middle name', () => {
    assert.equal(
      brregPersonName({ navn: { fornavn: 'Martine', mellomnavn: 'Myrstad', etternavn: 'Steinsholt' } }),
      'Martine Myrstad Steinsholt',
    )
  })

  it('extracts only active STYR + DAGL persons, excluding auditors and resigned roles', () => {
    const roller = {
      rollegrupper: [
        { type: { kode: 'DAGL' }, roller: [{ type: { kode: 'DAGL' }, person: { navn: { fornavn: 'Vegard', etternavn: 'Kjuus' } }, fratraadt: false }] },
        {
          type: { kode: 'STYR' },
          roller: [
            { type: { kode: 'LEDE' }, person: { navn: { fornavn: 'Runar', etternavn: 'Hollevik' } }, fratraadt: false },
            { type: { kode: 'MEDL' }, person: { navn: { fornavn: 'Gammel', etternavn: 'Styremann' } }, fratraadt: true }, // resigned → excluded
          ],
        },
        // Auditor is a company role (no `person`) → excluded
        { type: { kode: 'REVI' }, roller: [{ type: { kode: 'REVI' }, enhet: { navn: ['ERNST & YOUNG AS'] }, fratraadt: false }] },
      ],
    }
    const people = extractBrregPeople(roller)
    assert.deepEqual(
      people.map((p) => p.name).sort(),
      ['Runar Hollevik', 'Vegard Kjuus'],
    )
    assert.equal(people.find((p) => p.name === 'Vegard Kjuus')?.role, 'daglig leder')
  })

  const kiwiEnhet = {
    navn: 'KIWI NORGE AS',
    naeringskode1: { kode: '82.990' },
    forretningsadresse: { poststed: 'LIERSTRANDA' },
    stiftelsesdato: '1995-11-20',
    konkurs: false,
    underAvvikling: false,
  }
  const kiwiRoller = {
    rollegrupper: [
      { type: { kode: 'DAGL' }, roller: [{ type: { kode: 'DAGL' }, person: { navn: { fornavn: 'Vegard', etternavn: 'Kjuus' } }, fratraadt: false }] },
      {
        type: { kode: 'STYR' },
        roller: [
          { type: { kode: 'LEDE' }, person: { navn: { fornavn: 'Runar', etternavn: 'Hollevik' } }, fratraadt: false },
          { type: { kode: 'MEDL' }, person: { navn: { fornavn: 'Øyvind', etternavn: 'Andersen' } }, fratraadt: false },
        ],
      },
    ],
  }

  it('flags avvik when DB is missing the daglig leder but board matches', () => {
    const db: DbCompany = {
      orgNr: '975959171',
      name: 'Kiwi Norge AS',
      naceCode: '82.990',
      hqCity: 'Lierstranda',
      founded: 1995,
      ownershipType: 'family',
      boardMembers: [
        { personName: 'Runar Hollevik', personKey: normalizePersonKey('Runar Hollevik'), role: 'styreleder' },
        { personName: 'Oyvind Andersen', personKey: normalizePersonKey('Oyvind Andersen'), role: 'styremedlem' },
      ],
    }
    const v = compareCompany(db, kiwiEnhet, kiwiRoller)
    assert.equal(v.status, 'avvik')
    assert.equal(v.fieldDiffs.length, 0) // name/NACE/city/founded all match
    assert.equal(v.boardDiff.staleInDb.length, 0) // Øyvind↔Oyvind no false positive
    assert.deepEqual(
      v.boardDiff.missingInDb.map((p) => p.name),
      ['Vegard Kjuus'],
    )
  })

  it('returns ok when board + daglig leder all present and fields match', () => {
    const db: DbCompany = {
      orgNr: '975959171',
      name: 'Kiwi Norge AS',
      naceCode: '82.990',
      hqCity: 'Lierstranda',
      founded: 1995,
      ownershipType: 'family',
      boardMembers: [
        { personName: 'Runar Hollevik', personKey: normalizePersonKey('Runar Hollevik'), role: 'styreleder' },
        { personName: 'Øyvind Andersen', personKey: normalizePersonKey('Øyvind Andersen'), role: 'styremedlem' },
        { personName: 'Vegard Kjuus', personKey: normalizePersonKey('Vegard Kjuus'), role: 'daglig leder' },
      ],
    }
    const v = compareCompany(db, kiwiEnhet, kiwiRoller)
    assert.equal(v.status, 'ok')
  })

  it('detects field diffs (NACE) and role mismatches', () => {
    const db: DbCompany = {
      orgNr: '975959171',
      name: 'Kiwi Norge AS',
      naceCode: '47.110', // wrong vs register 82.990
      hqCity: 'Lierstranda',
      founded: 1995,
      ownershipType: 'family',
      boardMembers: [
        { personName: 'Runar Hollevik', personKey: normalizePersonKey('Runar Hollevik'), role: 'styremedlem' }, // register says leder
        { personName: 'Øyvind Andersen', personKey: normalizePersonKey('Øyvind Andersen'), role: 'styremedlem' },
        { personName: 'Vegard Kjuus', personKey: normalizePersonKey('Vegard Kjuus'), role: 'daglig leder' },
      ],
    }
    const v = compareCompany(db, kiwiEnhet, kiwiRoller)
    assert.equal(v.status, 'avvik')
    assert.equal(v.fieldDiffs.find((d) => d.field === 'naceCode')?.brreg, '82.990')
    assert.deepEqual(
      v.boardDiff.roleMismatch.map((m) => `${m.name}:${m.dbRole}->${m.brregRole}`),
      ['Runar Hollevik:styremedlem->styreleder'],
    )
  })

  it('marks orgNr not found in the register', () => {
    const db: DbCompany = {
      orgNr: '999999999',
      name: 'Nonexistent AS',
      naceCode: null,
      hqCity: null,
      founded: null,
      ownershipType: null,
      boardMembers: [],
    }
    const v = compareCompany(db, null, null)
    assert.equal(v.status, 'ikke-funnet')
  })
})
