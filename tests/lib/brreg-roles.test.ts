import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildPersonName,
  mapBoardRole,
  parseRoleGroupsToBoardRows,
  type BrregRoleGroup,
} from '../../src/lib/brreg-roles'

// Realistisk fixture i samme form som Brønnøysund /roller (jf. Mowi-respons):
// DAGL-gruppe + STYR-gruppe med leder/medlem/nestleder/vara, fratraadte og
// avregistrerte verv, en rolle uten person (enhet), og en ikke-styre-gruppe.
const groups: BrregRoleGroup[] = [
  {
    type: { kode: 'DAGL', beskrivelse: 'Daglig leder' },
    roller: [
      {
        type: { kode: 'DAGL', beskrivelse: 'Daglig leder' },
        fratraadt: false,
        avregistrert: false,
        person: { navn: { fornavn: 'Ivan', etternavn: 'Vindheim' }, fodselsdato: '1971-03-18' },
      },
    ],
  },
  {
    type: { kode: 'STYR', beskrivelse: 'Styre' },
    roller: [
      // Avgått OG avregistrert styreleder → ekskluderes som standard.
      {
        type: { kode: 'LEDE', beskrivelse: 'Styrets leder' },
        fratraadt: true,
        avregistrert: true,
        person: { navn: { fornavn: 'Ørjan', etternavn: 'Svanevik' } },
      },
      {
        type: { kode: 'MEDL', beskrivelse: 'Styremedlem' },
        fratraadt: false,
        avregistrert: false,
        person: { navn: { fornavn: 'Leif', etternavn: 'Teksum' }, fodselsdato: '1952-07-12' },
      },
      {
        type: { kode: 'NEST', beskrivelse: 'Nestleder' },
        fratraadt: false,
        person: { navn: { fornavn: 'Per', mellomnavn: 'Aage', etternavn: 'Hansen' } },
      },
      // VARA er ikke DAGL/LEDE/NEST, men ligger i STYR-gruppa → styremedlem.
      {
        type: { kode: 'VARA', beskrivelse: 'Varamedlem' },
        fratraadt: false,
        person: { navn: { fornavn: 'Kari', etternavn: 'Nordmann' } },
      },
      // Avgått (men ikke avregistrert) styremedlem → ekskluderes som standard.
      {
        type: { kode: 'MEDL', beskrivelse: 'Styremedlem' },
        fratraadt: true,
        person: { navn: { fornavn: 'Gustav', etternavn: 'Witzøe' } },
      },
      // Rolle uten personnavn → hoppes over.
      { type: { kode: 'MEDL', beskrivelse: 'Styremedlem' }, person: {} },
      // Rolle holdt av en enhet (selskap), ikke person → hoppes over.
      { type: { kode: 'MEDL', beskrivelse: 'Styremedlem' }, enhet: { navn: ['Et Holding AS'] } },
    ],
  },
  // Ikke-styre-gruppe → ingen rader.
  {
    type: { kode: 'REGN', beskrivelse: 'Regnskapsfører' },
    roller: [
      { type: { kode: 'REGN', beskrivelse: 'Regnskapsfører' }, person: { navn: { fornavn: 'Nei', etternavn: 'Skip' } } },
    ],
  },
]

describe('mapBoardRole', () => {
  it('mapper Brønnøysund rollekoder til BoardMember.role', () => {
    assert.equal(mapBoardRole('DAGL', 'DAGL', 'Daglig leder'), 'CEO')
    assert.equal(mapBoardRole('STYR', 'LEDE', 'Styrets leder'), 'styreleder')
    assert.equal(mapBoardRole('STYR', 'NEST', 'Nestleder'), 'nestleder')
    assert.equal(mapBoardRole('STYR', 'MEDL', 'Styremedlem'), 'styremedlem')
    assert.equal(mapBoardRole('STYR', 'VARA', 'Varamedlem'), 'styremedlem')
    // Daglig leder kan komme som egen rolle utenfor STYR-gruppe.
    assert.equal(mapBoardRole('DAGL', undefined, 'Daglig leder'), 'CEO')
    // Beskrivelse som inneholder «styre» fanges selv uten STYR-gruppekode.
    assert.equal(mapBoardRole(undefined, undefined, 'Medlem av styret'), 'styremedlem')
    // Ikke-styre-roller mapper til null (filtreres bort).
    assert.equal(mapBoardRole('REGN', 'REGN', 'Regnskapsfører'), null)
    assert.equal(mapBoardRole('REVI', 'REVI', 'Revisor'), null)
  })
})

describe('buildPersonName', () => {
  it('setter sammen for-/mellom-/etternavn og håndterer manglende navn', () => {
    assert.equal(buildPersonName({ navn: { fornavn: 'Per', mellomnavn: 'Aage', etternavn: 'Hansen' } }), 'Per Aage Hansen')
    assert.equal(buildPersonName({ navn: { fornavn: 'Ivan', etternavn: 'Vindheim' } }), 'Ivan Vindheim')
    assert.equal(buildPersonName({ navn: {} }), null)
    assert.equal(buildPersonName({}), null)
    assert.equal(buildPersonName(null), null)
  })
})

describe('parseRoleGroupsToBoardRows', () => {
  it('returnerer kun sittende styre/daglig leder med kanoniske personKeys (default)', () => {
    const rows = parseRoleGroupsToBoardRows(groups)
    assert.deepEqual(
      rows.map(r => ({ personName: r.personName, role: r.role, personKey: r.personKey, birthYear: r.birthYear })),
      [
        { personName: 'Ivan Vindheim', role: 'CEO', personKey: 'ivan-vindheim', birthYear: '1971' },
        { personName: 'Leif Teksum', role: 'styremedlem', personKey: 'leif-teksum', birthYear: '1952' },
        { personName: 'Per Aage Hansen', role: 'nestleder', personKey: 'per-age-hansen', birthYear: null },
        { personName: 'Kari Nordmann', role: 'styremedlem', personKey: 'kari-nordmann', birthYear: null },
      ],
    )
  })

  it('ekskluderer fratraadte og avregistrerte verv som standard', () => {
    const keys = parseRoleGroupsToBoardRows(groups).map(r => r.personKey)
    assert.ok(!keys.includes('orjan-svanevik'), 'avregistrert styreleder skal være ute')
    assert.ok(!keys.includes('gustav-witzo'), 'fratraadt styremedlem skal være ute')
  })

  it('tar med fratraadte/avregistrerte når includeResigned=true (matcher enricher)', () => {
    const rows = parseRoleGroupsToBoardRows(groups, { includeResigned: true })
    const byKey = new Map(rows.map(r => [r.personKey, r.role]))
    assert.equal(rows.length, 6)
    // Avgått leder kommer nå med som styreleder, og folder ø→o.
    assert.equal(byKey.get('orjan-svanevik'), 'styreleder')
    // Witzøe folder ø→o og deretter oe→o → gustav-witzo.
    assert.equal(byKey.get('gustav-witzo'), 'styremedlem')
  })

  it('hopper over roller uten personnavn, enhets-roller og ikke-styre-grupper', () => {
    const rows = parseRoleGroupsToBoardRows(groups, { includeResigned: true })
    // Ingen rad fra REGN-gruppe, tom person eller enhet.
    assert.ok(!rows.some(r => r.personName === 'Nei Skip'))
    assert.equal(rows.filter(r => r.role === 'styremedlem').length, 3) // Leif, Kari, Gustav (Witzøe)
  })

  it('er ren — tomt inn gir tomt ut', () => {
    assert.deepEqual(parseRoleGroupsToBoardRows([]), [])
  })
})
