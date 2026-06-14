// Ren parsing av Brønnøysund «roller i virksomheten» → BoardMember-rader.
//
// Hvorfor egen modul: scripts/enrich-offentligdata.ts har en innebygd,
// velprøvd rolle-mapping (DAGL→CEO, LEDE→styreleder, NEST→nestleder, øvrig
// STYR→styremedlem). Den filen kjører main() ved import og kan derfor ikke
// gjenbrukes via import. Denne modulen løfter den rene logikken ut slik at
// scripts/extend-board-coverage-brreg.ts kan dele NØYAKTIG samme semantikk og
// enhetstestes uten DB/nett. Radene blir formlike med enrich-offentligdata, så
// AP-1 ser samme datashape uansett hvilken vei som ble brukt.
//
// Bevisst avvik fra enrich-offentligdata: parseRoleGroupsToBoardRows ekskluderer
// som standard `fratraadt`/`avregistrert` (kun sittende styre), fordi en
// dekningsutvidelse skal speile DAGENS styrekart mot eierkartet. Sett
// includeResigned=true for å matche enricherens «ta alt»-oppførsel.

import { canonicalPersonKey } from './person-key'

export type BrregRolePersonName = {
  fornavn?: string
  mellomnavn?: string
  etternavn?: string
}

export type BrregRolePerson = {
  fodselsdato?: string
  erDoed?: boolean
  navn?: BrregRolePersonName
}

export type BrregRole = {
  type?: { kode?: string; beskrivelse?: string }
  fratraadt?: boolean
  avregistrert?: boolean
  rekkefolge?: number
  person?: BrregRolePerson | null
  enhet?: unknown
}

export type BrregRoleGroup = {
  type?: { kode?: string; beskrivelse?: string }
  sistEndret?: string
  roller?: BrregRole[]
}

export type BrregRolesResponse = {
  rollegrupper?: BrregRoleGroup[]
}

export type ParsedBoardRow = {
  personName: string
  role: string
  personKey: string
  brregRoleCode: string | null
  brregGroupCode: string | null
  birthYear: string | null
}

export type ParseRoleGroupsOptions = {
  /** Ta med fratraadte/avregistrerte verv (matcher enrich-offentligdata). Default false. */
  includeResigned?: boolean
}

/** Bygger fullt personnavn fra Brønnøysund-rollens navnedeler. */
export function buildPersonName(person?: BrregRolePerson | null): string | null {
  if (!person?.navn) return null
  const parts = [person.navn.fornavn, person.navn.mellomnavn, person.navn.etternavn].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : null
}

/**
 * Mapper Brønnøysund rollegruppe/rollekode til BoardMember.role.
 * IDENTISK semantikk som scripts/enrich-offentligdata.ts, slik at radene blir
 * formlike. Returnerer null for roller som ikke er styre/daglig leder (de
 * filtreres bort).
 */
export function mapBoardRole(
  groupCode: string | undefined,
  roleCode: string | undefined,
  description: string | undefined,
): string | null {
  if (roleCode === 'DAGL' || groupCode === 'DAGL') return 'CEO'
  if (roleCode === 'LEDE') return 'styreleder'
  if (roleCode === 'NEST') return 'nestleder'
  if (groupCode === 'STYR' || description?.toLowerCase().includes('styre')) return 'styremedlem'
  return null
}

/**
 * Ren kjerne: rollegrupper → BoardMember-rader. Ingen DB, ingen nettverk.
 * - Hopper over roller uten personnavn (f.eks. selskaps-roller / enhet).
 * - Hopper over roller som ikke mapper til styre/daglig leder.
 * - Ekskluderer fratraadt/avregistrert med mindre includeResigned=true.
 * - personKey via canonicalPersonKey (samme som nye import-skript).
 */
export function parseRoleGroupsToBoardRows(
  groups: BrregRoleGroup[],
  options: ParseRoleGroupsOptions = {},
): ParsedBoardRow[] {
  const includeResigned = options.includeResigned ?? false
  const rows: ParsedBoardRow[] = []

  for (const group of groups) {
    const groupCode = group.type?.kode
    for (const role of group.roller ?? []) {
      const personName = buildPersonName(role.person)
      if (!personName) continue

      const mappedRole = mapBoardRole(groupCode, role.type?.kode, role.type?.beskrivelse)
      if (!mappedRole) continue

      if (!includeResigned && (role.fratraadt === true || role.avregistrert === true)) continue

      rows.push({
        personName,
        role: mappedRole,
        personKey: canonicalPersonKey(personName),
        brregRoleCode: role.type?.kode ?? null,
        brregGroupCode: groupCode ?? null,
        birthYear: role.person?.fodselsdato?.slice(0, 4) ?? null,
      })
    }
  }

  return rows
}
