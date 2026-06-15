import { BRREG_ROLES_SOURCE_LABEL } from './brreg-board-member-provenance'

type DocumentRefSet = Pick<Set<string>, 'has'>

export type BoardMemberAnnualReportSourceRow = {
  company?: {
    orgNr?: string | null
  } | null
}

const BRREG_ENHETSREGISTERET_API = 'https://data.brreg.no/enhetsregisteret/api'

const BOARD_MEMBER_ANNUAL_REPORT_REFS: Record<string, string> = {
  'DK-26259495': 'evidence-pack/arsrapporter/coop-danmark-2024',
  'DK-35954716': 'evidence-pack/arsrapporter/salling-group-2024',
  'FI-0110456-8': 'evidence-pack/arsrapporter/kesko-annual-report-2024',
  'IS-670203-2120': 'evidence-pack/arsrapporter/hagar-2024-25',
  'SE-556048-2837': 'evidence-pack/arsrapporter/ica-gruppen-annual-report-2024',
  'SE-556542-5353': 'evidence-pack/arsrapporter/axfood-annual-report-2024',
}

const BOARD_MEMBER_ANNUAL_REPORT_URLS: Record<string, string> = {
  'DK-14705627':
    'https://regnskaber.cvrapi.dk/91514771/amNsb3VkczovLzAzLzgxLzBmL2U5LzJjL2RhYjUtNGVhOC1iY2EzLWExMjIwOGNiYmEwMw.pdf',
  'DK-38714295':
    'https://www.dagrofa.dk/wp-content/uploads/2025/03/DAGROFA_AaRSRAPPORT_2024.pdf',
  'FI-0116323-9':
    'https://assets.ctfassets.net/8122zj5k3sy9/QLeVjrOipS3Ciocgn1D3G/ef0a70e73a569d0641aa8d9b3944db2a/S_Group_and_Sustainability_2024_www.pdf',
  'FI-1615492-7': 'https://corporate.lidl.fi/lidl-yrityksena/johtoryhma',
  'IS-571298-3769': 'https://www.samkaup.is/deild/stjorn/',
  'IS-540206-2010':
    'https://cdn.prod.website-files.com/67925c8eeba76aedbef33d30/67c5c9e3dcfeda989b2c5edd_Festi%20hf%20-%20A%CC%81rsreikningur%202024.pdf',
  'SE-702001-3469': 'https://krafman.se/coop-sverige-ab/5567105480/sammanfattning',
  'SE-969697-6594': 'https://om.lidl.se/pdf/show/131697',
}

function isNorwegianOrgNumber(orgNr: string): boolean {
  return /^\d{9}$/.test(orgNr)
}

function brregRolesUrl(orgNr: string): string {
  return `${BRREG_ENHETSREGISTERET_API}/enheter/${encodeURIComponent(orgNr)}/roller`
}

export function resolveBoardMemberAnnualReportSourceLocator(
  row: BoardMemberAnnualReportSourceRow,
  documentRefs: DocumentRefSet,
): string | null {
  const orgNr = row.company?.orgNr?.trim()
  if (!orgNr) return null

  const documentRef = BOARD_MEMBER_ANNUAL_REPORT_REFS[orgNr]
  if (documentRef && documentRefs.has(documentRef)) return `document:${documentRef}`

  return BOARD_MEMBER_ANNUAL_REPORT_URLS[orgNr] ?? (isNorwegianOrgNumber(orgNr) ? brregRolesUrl(orgNr) : null)
}

export function resolveBoardMemberSourceLabel(locator: string): string {
  if (locator.startsWith(`${BRREG_ENHETSREGISTERET_API}/enheter/`) && locator.endsWith('/roller')) {
    return BRREG_ROLES_SOURCE_LABEL
  }

  if (locator === 'https://corporate.lidl.fi/lidl-yrityksena/johtoryhma') {
    return 'Board data: official leadership page'
  }
  if (locator === 'https://www.samkaup.is/deild/stjorn/') {
    return 'Board data: official board page'
  }
  if (locator === 'https://krafman.se/coop-sverige-ab/5567105480/sammanfattning') {
    return 'Board data: Swedish public company register via Krafman'
  }
  if (locator === 'https://om.lidl.se/pdf/show/131697') {
    return 'Board data: sustainability report 2023/24'
  }

  return 'Board data: annual report 2024'
}

export function boardMemberProvenanceData(locator: string | null, verifiedAt: Date) {
  if (!locator) return {}

  if (locator.startsWith('document:')) {
    return {
      source: locator,
      sourceUrl: null,
      verifiedAt,
    }
  }

  return {
    source: resolveBoardMemberSourceLabel(locator),
    sourceUrl: locator,
    verifiedAt,
  }
}
