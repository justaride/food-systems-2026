/** A Brreg sub-unit (underenhet): the physical site of a business. */
export type BrregUnit = {
  orgNr: string
  name: string
  postnummer: string
  parentOrgNr: string
  employees: number | null
  closed: boolean
}

/** A Brreg main entity (enhet), which carries the organisational form. */
export type BrregEntity = {
  orgNr: string
  name: string
  postnummer: string
  orgForm: string
  employees: number | null
}

export type BrregIndex = {
  unitsByOrg: Map<string, BrregUnit>
  unitsByName: Map<string, string[]>
  entitiesByOrg: Map<string, BrregEntity>
  entitiesByName: Map<string, string[]>
}

export type Resolution =
  | {
      status: 'resolved'
      method: 'orgnr' | 'name-unit' | 'name-entity'
      /** Main entity orgnr; the published identifier for the establishment. */
      orgNr: string
      orgForm: string
      employees: number | null
    }
  | { status: 'unresolved'; reason: 'not-found' | 'ambiguous' | 'unknown-orgnr' | 'unknown-parent' }

const LEGAL_SUFFIXES = /\b(asa|as|sa|da|ans|ba|nuf|ks|avd|avdeling)\b/g

/** Lower-case, drop punctuation and legal-form suffixes, so "Testfisk AS" and "TESTFISK" compare equal. */
export function normalizeCompanyName(name: string): string {
  return name
    .normalize('NFC')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/[^\p{L}\p{N} ]/gu, ' ')
    .replace(LEGAL_SUFFIXES, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const nameKey = (name: string, postnummer: string) =>
  `${normalizeCompanyName(name)}|${postnummer.trim().padStart(4, '0')}`

function addToList(map: Map<string, string[]>, key: string, value: string) {
  const list = map.get(key)
  if (list) list.push(value)
  else map.set(key, [value])
}

export function nameKeyFor(name: string, postnummer: string): string {
  return nameKey(name, postnummer)
}

export function buildBrregIndex(units: Iterable<BrregUnit>, entities: Iterable<BrregEntity>): BrregIndex {
  const index: BrregIndex = {
    unitsByOrg: new Map(),
    unitsByName: new Map(),
    entitiesByOrg: new Map(),
    entitiesByName: new Map(),
  }
  for (const unit of units) {
    index.unitsByOrg.set(unit.orgNr, unit)
    if (!unit.closed && unit.postnummer) addToList(index.unitsByName, nameKey(unit.name, unit.postnummer), unit.orgNr)
  }
  for (const entity of entities) {
    index.entitiesByOrg.set(entity.orgNr, entity)
    if (entity.postnummer) addToList(index.entitiesByName, nameKey(entity.name, entity.postnummer), entity.orgNr)
  }
  return index
}

function fromUnit(index: BrregIndex, unit: BrregUnit, method: 'orgnr' | 'name-unit'): Resolution {
  const parent = index.entitiesByOrg.get(unit.parentOrgNr)
  if (!parent) return { status: 'unresolved', reason: 'unknown-parent' }
  return { status: 'resolved', method, orgNr: parent.orgNr, orgForm: parent.orgForm, employees: unit.employees }
}

function fromEntity(entity: BrregEntity, method: 'orgnr' | 'name-entity'): Resolution {
  return { status: 'resolved', method, orgNr: entity.orgNr, orgForm: entity.orgForm, employees: entity.employees }
}

/**
 * Resolve an establishment to its Brreg main entity: by orgnr when the register
 * gives one, otherwise by a unique normalised name within the same postnummer —
 * sub-units first (the site), then main entities. Ambiguous names stay unresolved.
 */
export function resolveEstablishment(
  index: BrregIndex,
  establishment: { name: string; postnummer: string; orgNr?: string }
): Resolution {
  if (establishment.orgNr) {
    const unit = index.unitsByOrg.get(establishment.orgNr)
    if (unit) return fromUnit(index, unit, 'orgnr')
    const entity = index.entitiesByOrg.get(establishment.orgNr)
    if (entity) return fromEntity(entity, 'orgnr')
    return { status: 'unresolved', reason: 'unknown-orgnr' }
  }

  if (!establishment.postnummer.trim()) return { status: 'unresolved', reason: 'not-found' }
  const key = nameKey(establishment.name, establishment.postnummer)

  const units = index.unitsByName.get(key) ?? []
  if (units.length === 1) return fromUnit(index, index.unitsByOrg.get(units[0])!, 'name-unit')

  const entities = index.entitiesByName.get(key) ?? []
  if (units.length === 0 && entities.length === 1) {
    return fromEntity(index.entitiesByOrg.get(entities[0])!, 'name-entity')
  }

  return { status: 'unresolved', reason: units.length > 1 || entities.length > 1 ? 'ambiguous' : 'not-found' }
}
