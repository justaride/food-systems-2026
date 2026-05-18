import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildBronnoysundCitation,
  buildBronnoysundRolesCitation,
  buildBronnoysundSnapshotPath,
  buildBronnoysundRolesSnapshotPath,
  findMatchingBronnoysundRole,
  mapBronnoysundEntityToCompanyUpdate,
  makeBronnoysundPersonNameVariants,
  sha256Hex,
  stableJson,
  type BronnoysundEntitySnapshot,
  type BronnoysundRolesSnapshot,
} from '../../scripts/lib/bronnoysund-citations'

const snapshot: BronnoysundEntitySnapshot = {
  organisasjonsnummer: '987565922',
  navn: 'NORGESGRUPPEN ASA',
  organisasjonsform: {
    kode: 'ASA',
    beskrivelse: 'Allmennaksjeselskap',
  },
  naeringskode1: {
    kode: '46.390',
    beskrivelse: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
  },
  antallAnsatte: 7,
  harRegistrertAntallAnsatte: true,
  forretningsadresse: {
    adresse: ['Karenslyst allé 12-14'],
    postnummer: '0278',
    poststed: 'OSLO',
  },
  stiftelsesdato: '2000-11-01',
}

const rolesSnapshot: BronnoysundRolesSnapshot = {
  rollegrupper: [
    {
      type: { kode: 'DAGL', beskrivelse: 'Daglig leder' },
      sistEndret: '2016-06-23',
      roller: [
        {
          type: { kode: 'DAGL', beskrivelse: 'Daglig leder' },
          person: {
            navn: { fornavn: 'Runar', etternavn: 'Hollevik' },
            erDoed: false,
          },
          fratraadt: false,
          avregistrert: false,
        },
      ],
    },
    {
      type: { kode: 'STYR', beskrivelse: 'Styre' },
      sistEndret: '2026-02-17',
      roller: [
        {
          type: { kode: 'LEDE', beskrivelse: 'Styrets leder' },
          person: {
            navn: { fornavn: 'Johan', etternavn: 'Johannson' },
            erDoed: false,
          },
          fratraadt: false,
          avregistrert: false,
        },
        {
          type: { kode: 'MEDL', beskrivelse: 'Styremedlem' },
          person: {
            navn: { fornavn: 'Martine', mellomnavn: 'Myrstad', etternavn: 'Steinsholt' },
            erDoed: false,
          },
          fratraadt: false,
          avregistrert: false,
        },
      ],
    },
  ],
}

describe('bronnoysund citation helpers', () => {
  it('builds a stable snapshot path using org number and access date', () => {
    assert.equal(
      buildBronnoysundSnapshotPath('987565922', '2026-05-18'),
      'research/evidence-pack/bronnoysund-snapshots/987565922-2026-05-18.json',
    )
  })

  it('serializes JSON deterministically before hashing', () => {
    const left = stableJson({ b: 2, a: { d: 4, c: 3 } })
    const right = stableJson({ a: { c: 3, d: 4 }, b: 2 })

    assert.equal(left, right)
    assert.equal(sha256Hex(left), sha256Hex(right))
  })

  it('maps only Bronnoysund entity fields into company updates', () => {
    assert.deepEqual(mapBronnoysundEntityToCompanyUpdate(snapshot, new Date('2026-05-18T00:00:00.000Z')), {
      data: {
        legalForm: 'ASA',
        naceCode: '46.390',
        naceDescription: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
        employees: 7,
        founded: 2000,
        hqAddress: 'Karenslyst allé 12-14',
        hqCity: 'OSLO',
        isResearchConstruct: false,
        orgNrFormat: 'bronnoysund',
        registrySource: 'data.brreg.no/enhetsregisteret',
        registryVerifiedAt: new Date('2026-05-18T00:00:00.000Z'),
      },
      fieldPaths: [
        'legalForm',
        'naceCode',
        'naceDescription',
        'employees',
        'founded',
        'hqAddress',
        'hqCity',
        'isResearchConstruct',
        'orgNrFormat',
        'registrySource',
        'registryVerifiedAt',
      ],
    })
  })

  it('builds a registry snapshot citation with local path and content hash', () => {
    const citation = buildBronnoysundCitation({
      orgNr: '987565922',
      name: 'NorgesGruppen ASA',
      accessedAt: '2026-05-18',
      localPath: 'research/evidence-pack/bronnoysund-snapshots/987565922-2026-05-18.json',
      contentHash: 'abc123',
    })

    assert.deepEqual(citation, {
      sourceClass: 'registry_snapshot',
      citationText: 'Brønnøysundregistrene. (2026-05-18). Enhetsregisteret API snapshot for NorgesGruppen ASA (987565922).',
      accessedAt: '2026-05-18',
      url: 'https://data.brreg.no/enhetsregisteret/api/enheter/987565922',
      localPath: 'research/evidence-pack/bronnoysund-snapshots/987565922-2026-05-18.json',
      contentHash: 'abc123',
      captureMethod: 'api_snapshot',
      verificationStatus: 'machine_verified',
      confidence: 95,
    })
  })

  it('builds role snapshot paths and citations separately from entity snapshots', () => {
    assert.equal(
      buildBronnoysundRolesSnapshotPath('819731322', '2026-05-18'),
      'research/evidence-pack/bronnoysund-role-snapshots/819731322-roles-2026-05-18.json',
    )

    assert.deepEqual(buildBronnoysundRolesCitation({
      orgNr: '819731322',
      name: 'NorgesGruppen ASA',
      accessedAt: '2026-05-18',
      localPath: 'research/evidence-pack/bronnoysund-role-snapshots/819731322-roles-2026-05-18.json',
      contentHash: 'def456',
    }), {
      sourceClass: 'registry_snapshot',
      citationText: 'Brønnøysundregistrene. (2026-05-18). Roller API snapshot for NorgesGruppen ASA (819731322).',
      accessedAt: '2026-05-18',
      url: 'https://data.brreg.no/enhetsregisteret/api/enheter/819731322/roller',
      localPath: 'research/evidence-pack/bronnoysund-role-snapshots/819731322-roles-2026-05-18.json',
      contentHash: 'def456',
      captureMethod: 'api_snapshot',
      verificationStatus: 'machine_verified',
      confidence: 95,
    })
  })

  it('matches active Bronnoysund roles against local BoardMember rows', () => {
    assert.deepEqual(makeBronnoysundPersonNameVariants({
      fornavn: 'Martine',
      mellomnavn: 'Myrstad',
      etternavn: 'Steinsholt',
    }), ['Martine Myrstad Steinsholt', 'Martine Steinsholt'])

    assert.deepEqual(findMatchingBronnoysundRole(rolesSnapshot, {
      personName: 'Martine Steinsholt',
      role: 'styremedlem',
    }), {
      matchedName: 'Martine Steinsholt',
      roleLabel: 'styremedlem',
      roleCode: 'MEDL',
      roleGroupCode: 'STYR',
      groupChangedAt: '2026-02-17',
    })

    assert.equal(findMatchingBronnoysundRole(rolesSnapshot, {
      personName: 'Runar Hollevik',
      role: 'styremedlem',
    }), null)
  })
})
