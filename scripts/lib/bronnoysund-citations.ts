import { createHash } from 'node:crypto'
import type { RequiredCitation } from './import-helpers'

export const BRONNOYSUND_REGISTRY_SOURCE = 'data.brreg.no/enhetsregisteret'
export const BRONNOYSUND_API_BASE_URL = 'https://data.brreg.no/enhetsregisteret/api'

export type BronnoysundAddress = {
  adresse?: string[]
  postnummer?: string
  poststed?: string
}

export type BronnoysundEntitySnapshot = {
  organisasjonsnummer: string
  navn: string
  organisasjonsform?: {
    kode?: string
    beskrivelse?: string
  }
  naeringskode1?: {
    kode?: string
    beskrivelse?: string
  }
  antallAnsatte?: number
  harRegistrertAntallAnsatte?: boolean
  forretningsadresse?: BronnoysundAddress
  postadresse?: BronnoysundAddress
  stiftelsesdato?: string
  registreringsdatoEnhetsregisteret?: string
}

export type BronnoysundRolePersonName = {
  fornavn?: string
  mellomnavn?: string
  etternavn?: string
}

export type BronnoysundRolePerson = {
  navn?: BronnoysundRolePersonName
  erDoed?: boolean
}

export type BronnoysundRole = {
  type?: {
    kode?: string
    beskrivelse?: string
  }
  person?: BronnoysundRolePerson | null
  fratraadt?: boolean
  avregistrert?: boolean
}

export type BronnoysundRoleGroup = {
  type?: {
    kode?: string
    beskrivelse?: string
  }
  sistEndret?: string
  roller?: BronnoysundRole[]
}

export type BronnoysundRolesSnapshot = {
  rollegrupper?: BronnoysundRoleGroup[]
}

export type MatchedBronnoysundRole = {
  matchedName: string
  roleLabel: string
  roleCode: string
  roleGroupCode: string
  groupChangedAt?: string
}

export type CompanyUpdateFromBronnoysund = {
  data: {
    legalForm?: string
    naceCode?: string
    naceDescription?: string
    employees?: number
    founded?: number
    hqAddress?: string
    hqCity?: string
    isResearchConstruct: false
    orgNrFormat: 'bronnoysund'
    registrySource: typeof BRONNOYSUND_REGISTRY_SOURCE
    registryVerifiedAt: Date
  }
  fieldPaths: string[]
}

export function buildBronnoysundSnapshotPath(orgNr: string, accessedAt: string): string {
  return `research/evidence-pack/bronnoysund-snapshots/${orgNr}-${accessedAt}.json`
}

export function buildBronnoysundEntityUrl(orgNr: string): string {
  return `${BRONNOYSUND_API_BASE_URL}/enheter/${orgNr}`
}

export function buildBronnoysundRolesSnapshotPath(orgNr: string, accessedAt: string): string {
  return `research/evidence-pack/bronnoysund-role-snapshots/${orgNr}-roles-${accessedAt}.json`
}

export function buildBronnoysundRolesUrl(orgNr: string): string {
  return `${buildBronnoysundEntityUrl(orgNr)}/roller`
}

export function stableJson(value: unknown): string {
  return `${JSON.stringify(sortJson(value), null, 2)}\n`
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

export function mapBronnoysundEntityToCompanyUpdate(
  snapshot: BronnoysundEntitySnapshot,
  registryVerifiedAt: Date,
): CompanyUpdateFromBronnoysund {
  const address = snapshot.forretningsadresse ?? snapshot.postadresse
  const data: CompanyUpdateFromBronnoysund['data'] = {
    isResearchConstruct: false,
    orgNrFormat: 'bronnoysund',
    registrySource: BRONNOYSUND_REGISTRY_SOURCE,
    registryVerifiedAt,
  }
  const fieldPaths = ['isResearchConstruct', 'orgNrFormat', 'registrySource', 'registryVerifiedAt']

  addOptional(data, fieldPaths, 'legalForm', normalizeText(snapshot.organisasjonsform?.kode))
  addOptional(data, fieldPaths, 'naceCode', normalizeText(snapshot.naeringskode1?.kode))
  addOptional(data, fieldPaths, 'naceDescription', normalizeText(snapshot.naeringskode1?.beskrivelse))

  if (typeof snapshot.antallAnsatte === 'number' && Number.isFinite(snapshot.antallAnsatte)) {
    data.employees = snapshot.antallAnsatte
    fieldPaths.push('employees')
  }

  const founded = extractYear(snapshot.stiftelsesdato ?? snapshot.registreringsdatoEnhetsregisteret)
  if (founded !== null) {
    data.founded = founded
    fieldPaths.push('founded')
  }

  addOptional(data, fieldPaths, 'hqAddress', normalizeText(address?.adresse?.join(', ')))
  addOptional(data, fieldPaths, 'hqCity', normalizeText(address?.poststed))

  return { data: sortCompanyUpdateData(data), fieldPaths: sortFieldPaths(fieldPaths) }
}

export function buildBronnoysundCitation(input: {
  orgNr: string
  name: string
  accessedAt: string
  localPath: string
  contentHash: string
}): RequiredCitation {
  return {
    sourceClass: 'registry_snapshot',
    citationText: `Brønnøysundregistrene. (${input.accessedAt}). Enhetsregisteret API snapshot for ${input.name} (${input.orgNr}).`,
    accessedAt: input.accessedAt,
    url: buildBronnoysundEntityUrl(input.orgNr),
    localPath: input.localPath,
    contentHash: input.contentHash,
    captureMethod: 'api_snapshot',
    verificationStatus: 'machine_verified',
    confidence: 95,
  }
}

export function buildBronnoysundRolesCitation(input: {
  orgNr: string
  name: string
  accessedAt: string
  localPath: string
  contentHash: string
}): RequiredCitation {
  return {
    sourceClass: 'registry_snapshot',
    citationText: `Brønnøysundregistrene. (${input.accessedAt}). Roller API snapshot for ${input.name} (${input.orgNr}).`,
    accessedAt: input.accessedAt,
    url: buildBronnoysundRolesUrl(input.orgNr),
    localPath: input.localPath,
    contentHash: input.contentHash,
    captureMethod: 'api_snapshot',
    verificationStatus: 'machine_verified',
    confidence: 95,
  }
}

export function makeBronnoysundPersonNameVariants(name: BronnoysundRolePersonName | undefined): string[] {
  if (!name) return []

  const first = normalizeText(name.fornavn)
  const middle = normalizeText(name.mellomnavn)
  const last = normalizeText(name.etternavn)
  const variants = [
    [first, middle, last].filter(Boolean).join(' '),
    [first, last].filter(Boolean).join(' '),
  ].filter(Boolean)

  return [...new Set(variants)]
}

export function findMatchingBronnoysundRole(
  snapshot: BronnoysundRolesSnapshot,
  boardMember: { personName: string; role: string },
): MatchedBronnoysundRole | null {
  const localPersonKeys = new Set([
    canonicalPersonKeyLocal(boardMember.personName),
  ])
  const localRoleLabel = normalizeBronnoysundRoleLabel(undefined, boardMember.role)

  for (const group of snapshot.rollegrupper ?? []) {
    const groupCode = normalizeText(group.type?.kode)
    for (const role of group.roller ?? []) {
      if (!isActivePersonRole(role)) continue

      const roleLabel = normalizeBronnoysundRoleLabel(role.type?.kode, role.type?.beskrivelse)
      if (roleLabel !== localRoleLabel) continue

      for (const variant of makeBronnoysundPersonNameVariants(role.person?.navn)) {
        if (!localPersonKeys.has(canonicalPersonKeyLocal(variant))) continue
        return {
          matchedName: variant,
          roleLabel,
          roleCode: normalizeText(role.type?.kode) ?? '',
          roleGroupCode: groupCode ?? '',
          ...(group.sistEndret ? { groupChangedAt: group.sistEndret } : {}),
        }
      }
    }
  }

  return null
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson)
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortJson(item)]),
    )
  }

  return value
}

function addOptional(
  data: CompanyUpdateFromBronnoysund['data'],
  fieldPaths: string[],
  fieldPath: string,
  value: string | number | undefined,
): void {
  if (value === undefined) return
  ;(data as Record<string, unknown>)[fieldPath] = value
  fieldPaths.push(fieldPath)
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ')
  return normalized ? normalized : undefined
}

function isActivePersonRole(role: BronnoysundRole): boolean {
  return Boolean(role.person?.navn)
    && role.fratraadt !== true
    && role.avregistrert !== true
    && role.person?.erDoed !== true
}

function normalizeBronnoysundRoleLabel(roleCode: string | undefined, roleText: string | undefined): string {
  const code = normalizeText(roleCode)?.toUpperCase()
  if (code === 'DAGL') return 'CEO'
  if (code === 'LEDE') return 'styreleder'
  if (code === 'NEST') return 'nestleder'
  if (code === 'MEDL') return 'styremedlem'

  const text = normalizeText(roleText)?.toLowerCase() ?? ''
  if (text.includes('daglig leder') || text.includes('ceo')) return 'CEO'
  if (text.includes('styrets leder') || text.includes('styreleder')) return 'styreleder'
  if (text.includes('nestleder')) return 'nestleder'
  if (text.includes('styremedlem')) return 'styremedlem'
  return normalizeText(roleText) ?? ''
}

function canonicalPersonKeyLocal(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function extractYear(value: string | null | undefined): number | null {
  const year = normalizeText(value)?.match(/^(\d{4})/)?.[1]
  return year ? Number(year) : null
}

function sortCompanyUpdateData(
  data: CompanyUpdateFromBronnoysund['data'],
): CompanyUpdateFromBronnoysund['data'] {
  const ordered: Partial<CompanyUpdateFromBronnoysund['data']> = {}
  for (const key of sortFieldPaths(Object.keys(data))) {
    ;(ordered as Record<string, unknown>)[key] = (data as Record<string, unknown>)[key]
  }
  return ordered as CompanyUpdateFromBronnoysund['data']
}

function sortFieldPaths(fieldPaths: string[]): string[] {
  const order = [
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
  ]

  return [...new Set(fieldPaths)].sort((left, right) => {
    const leftIndex = order.indexOf(left)
    const rightIndex = order.indexOf(right)
    if (leftIndex === -1 && rightIndex === -1) return left.localeCompare(right)
    if (leftIndex === -1) return 1
    if (rightIndex === -1) return -1
    return leftIndex - rightIndex
  })
}
