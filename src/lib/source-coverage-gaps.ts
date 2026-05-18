export type SourceCoverageCompany = {
  id: string
  name: string
  country?: string | null
  orgNr?: string | null
  registrySource?: string | null
  orgNrFormat?: string | null
}

export type SourceCoverageBoardMember = {
  id: string
  personName: string
  personKey?: string | null
  role?: string | null
  company: SourceCoverageCompany
}

export type SourceCoverageShareholder = {
  id: string
  name: string
  ownershipPct?: string | number | null
  company: SourceCoverageCompany
}

export type SourceCoveragePersonProfileRole = {
  profileId: string
  profileName: string
  personKey?: string | null
  role?: string | null
  fieldPath: string | null
  company?: SourceCoverageCompany | null
  companyId?: string | null
  companyName?: string | null
}

export type SourceCoverageFieldCitation = {
  entityType: string
  entityId: string
  fieldPath?: string | null
}

export type SourceCoverageGapInput = {
  boardMembers: SourceCoverageBoardMember[]
  shareholders: SourceCoverageShareholder[]
  personProfileRoles: SourceCoveragePersonProfileRole[]
  fieldCitations: SourceCoverageFieldCitation[]
}

export type SourceCoverageGapRow = {
  entityType: 'BoardMember' | 'Shareholder' | 'PersonProfileRole'
  entityId: string
  fieldPath: string
  companyId: string
  companyName: string
  personName: string
  personKey: string
  role: string
  shareholderName: string
  ownershipPct: string
  country: string
  orgNr: string
  registrySource: string
  recommendedSourcePath: string
  reason:
    | 'missing_board_member_field_citation'
    | 'missing_shareholder_field_citation'
    | 'missing_person_profile_role_field_citation'
    | 'uncitable_person_profile_role'
}

export const SOURCE_COVERAGE_GAP_CSV_HEADERS = [
  'entityType',
  'entityId',
  'fieldPath',
  'companyId',
  'companyName',
  'personName',
  'personKey',
  'role',
  'shareholderName',
  'ownershipPct',
  'country',
  'orgNr',
  'registrySource',
  'recommendedSourcePath',
  'reason',
] as const

type SourceCoverageGapCsvHeader = typeof SOURCE_COVERAGE_GAP_CSV_HEADERS[number]

export function recommendSourcePath(company: SourceCoverageCompany | null | undefined): string {
  const country = normalizeUpper(company?.country)
  const registrySource = normalizeLower(company?.registrySource)
  const orgNrFormat = normalizeUpper(company?.orgNrFormat)

  if (country === 'NO' || registrySource.includes('bronnoy') || registrySource.includes('brønnøy') || orgNrFormat.includes('NO_')) {
    return 'bronnoysund_role_or_entity_snapshot'
  }
  if (country === 'SE' || registrySource.includes('bolagsverket') || orgNrFormat.includes('SE_')) {
    return 'bolagsverket_manual_or_api'
  }
  if (country === 'DK' || registrySource === 'cvr' || registrySource.includes('cvr') || orgNrFormat.includes('DK_')) {
    return 'cvr_credentials_or_browser'
  }
  if (country === 'FI' || registrySource.includes('virre') || registrySource.includes('prh') || orgNrFormat.includes('FI_')) {
    return 'prh_virre_interactive_or_paid'
  }
  if (country === 'IS' || registrySource.includes('skatturinn') || orgNrFormat.includes('IS_')) {
    return 'skatturinn_interactive_download'
  }

  return 'manual_source_review'
}

export function buildSourceCoverageGapRows(input: SourceCoverageGapInput): SourceCoverageGapRow[] {
  const entityCitationKeys = new Set(
    input.fieldCitations.map(citation => entityCitationKey(citation.entityType, citation.entityId)),
  )
  const personRoleCitationKeys = new Set(
    input.fieldCitations
      .filter(citation => citation.entityType === 'PersonProfile' && citation.fieldPath)
      .map(citation => personProfileRoleCitationKey(citation.entityId, citation.fieldPath ?? '')),
  )

  const rows: SourceCoverageGapRow[] = []

  for (const boardMember of input.boardMembers) {
    if (entityCitationKeys.has(entityCitationKey('BoardMember', boardMember.id))) continue

    rows.push({
      ...baseCompanyFields(boardMember.company),
      entityType: 'BoardMember',
      entityId: boardMember.id,
      fieldPath: '',
      personName: boardMember.personName,
      personKey: cleanCell(boardMember.personKey),
      role: cleanCell(boardMember.role),
      shareholderName: '',
      ownershipPct: '',
      recommendedSourcePath: recommendSourcePath(boardMember.company),
      reason: 'missing_board_member_field_citation',
    })
  }

  for (const shareholder of input.shareholders) {
    if (entityCitationKeys.has(entityCitationKey('Shareholder', shareholder.id))) continue

    rows.push({
      ...baseCompanyFields(shareholder.company),
      entityType: 'Shareholder',
      entityId: shareholder.id,
      fieldPath: '',
      personName: '',
      personKey: '',
      role: '',
      shareholderName: shareholder.name,
      ownershipPct: cleanCell(shareholder.ownershipPct),
      recommendedSourcePath: recommendSourcePath(shareholder.company),
      reason: 'missing_shareholder_field_citation',
    })
  }

  for (const profileRole of input.personProfileRoles) {
    const company = profileRole.company ?? companyFromRole(profileRole)
    const fieldPath = cleanCell(profileRole.fieldPath)
    if (fieldPath && personRoleCitationKeys.has(personProfileRoleCitationKey(profileRole.profileId, fieldPath))) continue

    rows.push({
      ...baseCompanyFields(company),
      entityType: 'PersonProfileRole',
      entityId: profileRole.profileId,
      fieldPath,
      personName: profileRole.profileName,
      personKey: cleanCell(profileRole.personKey),
      role: cleanCell(profileRole.role),
      shareholderName: '',
      ownershipPct: '',
      recommendedSourcePath: recommendSourcePath(company),
      reason: fieldPath ? 'missing_person_profile_role_field_citation' : 'uncitable_person_profile_role',
    })
  }

  return rows
}

export function formatSourceCoverageGapRowsCsv(rows: SourceCoverageGapRow[]): string {
  const headerLine = SOURCE_COVERAGE_GAP_CSV_HEADERS.join(',')
  const rowLines = rows.map(row => SOURCE_COVERAGE_GAP_CSV_HEADERS
    .map(header => escapeCsvCell(row[header as SourceCoverageGapCsvHeader]))
    .join(','))

  return `${[headerLine, ...rowLines].join('\n')}\n`
}

function baseCompanyFields(company: SourceCoverageCompany): Pick<
  SourceCoverageGapRow,
  'companyId' | 'companyName' | 'country' | 'orgNr' | 'registrySource'
> {
  return {
    companyId: company.id,
    companyName: company.name,
    country: cleanCell(company.country),
    orgNr: cleanCell(company.orgNr),
    registrySource: cleanCell(company.registrySource),
  }
}

function companyFromRole(role: SourceCoveragePersonProfileRole): SourceCoverageCompany {
  return {
    id: cleanCell(role.companyId),
    name: cleanCell(role.companyName),
  }
}

function entityCitationKey(entityType: string, entityId: string): string {
  return `${entityType}\u001f${entityId}`
}

function personProfileRoleCitationKey(profileId: string, fieldPath: string): string {
  return `${profileId}\u001f${fieldPath}`
}

function cleanCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function normalizeLower(value: string | null | undefined): string {
  return cleanCell(value).toLowerCase()
}

function normalizeUpper(value: string | null | undefined): string {
  return cleanCell(value).toUpperCase()
}

function escapeCsvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) return value
  return `"${value.replace(/"/g, '""')}"`
}
