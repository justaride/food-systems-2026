import { createHash } from 'node:crypto'
import type { Report } from '../types'

export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_VERSION =
  '2026-07-20-v1' as const

export const REVIEWED_ETMV_2023_REPORT_ID =
  'finland-food-market-ombudsman-2023' as const
export const REVIEWED_ETMV_2023_DOCUMENT_ID =
  'cmp8xyo7r00juvvvmgbocg9e3' as const
export const REVIEWED_ETMV_2023_URL_CITATION_ID =
  'cmpdaflzc0144sxvmgp95w3in' as const
export const REVIEWED_ETMV_2023_LOCAL_CITATION_ID =
  'cmpdaflzc0145sxvmg5wj485q' as const
export const REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID =
  'cmpdafmb3033asxvms4g3l8ty' as const
export const REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID =
  'cmpdafmb3033bsxvms8dcau3l' as const
export const REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID =
  'cmpdafm3z01jvsxvmclhsfk73' as const
export const REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID =
  'cmpdafmcv03j6sxvmhmlr10xo' as const
export const REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID =
  'cmqjoewix00ilzpvmwexh2sng' as const

export const REVIEWED_ETMV_2023_TITLE_BEFORE =
  'etmv toimintakertomus 2024' as const
export const REVIEWED_ETMV_2023_TITLE_AFTER =
  'Elintarvikemarkkinavaltuutetun toimintakertomus 2023' as const
export const REVIEWED_ETMV_2023_YEAR_BEFORE = 2024 as const
export const REVIEWED_ETMV_2023_YEAR_AFTER = 2023 as const
export const REVIEWED_ETMV_2023_URL_BEFORE =
  'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf' as const
export const REVIEWED_ETMV_2023_URL_AFTER =
  'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2023-liitteineen.pdf' as const
export const REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH =
  'evidence-pack/nordisk/finland-food-market-ombudsman-2023.pdf' as const
export const REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH =
  `research/${REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH}` as const
export const REVIEWED_ETMV_2023_PDF_SHA256 =
  'f40fd2d16600114d2dc31a6fc6599914cf226dff76ca07bccc637241fe33063b' as const

export const REVIEWED_ETMV_2023_URL_CITATION_TEXT_BEFORE =
  `Document: ${REVIEWED_ETMV_2023_TITLE_BEFORE}` as const
export const REVIEWED_ETMV_2023_URL_CITATION_TEXT_AFTER =
  `Document: ${REVIEWED_ETMV_2023_TITLE_AFTER}` as const
export const REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_BEFORE =
  `Document local file: ${REVIEWED_ETMV_2023_TITLE_BEFORE}` as const
export const REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_AFTER =
  `Document local file: ${REVIEWED_ETMV_2023_TITLE_AFTER}` as const

export const REVIEWED_ETMV_2023_CONTENT_REPLACEMENTS = Object.freeze([
  Object.freeze({
    label: 'heading',
    before: `# ${REVIEWED_ETMV_2023_TITLE_BEFORE}`,
    after: `# ${REVIEWED_ETMV_2023_TITLE_AFTER}`,
  }),
  Object.freeze({
    label: 'metadata year line',
    before: `- Aar: ${REVIEWED_ETMV_2023_YEAR_BEFORE}`,
    after: `- Aar: ${REVIEWED_ETMV_2023_YEAR_AFTER}`,
  }),
  Object.freeze({
    label: 'metadata source URL line',
    before: `- Kilde-URL: ${REVIEWED_ETMV_2023_URL_BEFORE}`,
    after: `- Kilde-URL: ${REVIEWED_ETMV_2023_URL_AFTER}`,
  }),
])

export const REVIEWED_ETMV_2023_CONTENT_HASHES = Object.freeze({
  documentContentBefore:
    'e33b8119a9f765a0915d4397cba64089e7961e5165050705db0a995960ecd200',
  documentContentAfter:
    '9c82f507b29b0b5d220cbba6e67b8f95b60a2331755ebed61c69e757bf1be08a',
  libraryAnalysisContentBefore:
    '375d5395c2f694b82055d19c99f3ad22d8c1bb7c703957716eccd6d918ce7e32',
  libraryAnalysisContentAfter:
    '9b10a94b17c39f25dd4e34e77b73d47b47cdc5c6020d68294ea36b5894aab9f1',
})

export const REVIEWED_ETMV_2023_MUTABLE_FIELDS = Object.freeze({
  Document: Object.freeze([
    'title',
    'year',
    'content',
    'url',
    'metadata.backlog.title',
    'metadata.backlog.year',
    'metadata.backlog.url',
  ] as const),
  UrlSourceCitation: Object.freeze([
    'citationText',
    'title',
    'year',
    'url',
    'verificationStatus',
    'archivedUrl',
    'verifiedAt',
    'verifiedBy',
  ] as const),
  LocalSourceCitation: Object.freeze([
    'citationText',
    'title',
    'year',
    'fileHash',
  ] as const),
  LibraryAnalysisRecord: Object.freeze([
    'title',
    'aiSummary',
    'aiCard.shortSummary',
    'contentHash',
  ] as const),
})

export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT = Object.freeze({
  version: REVIEWED_ETMV_2023_IDENTITY_REPAIR_VERSION,
  ids: Object.freeze({
    report: REVIEWED_ETMV_2023_REPORT_ID,
    document: REVIEWED_ETMV_2023_DOCUMENT_ID,
    urlCitation: REVIEWED_ETMV_2023_URL_CITATION_ID,
    localCitation: REVIEWED_ETMV_2023_LOCAL_CITATION_ID,
    urlFieldCitation: REVIEWED_ETMV_2023_URL_FIELD_CITATION_ID,
    localFieldCitation: REVIEWED_ETMV_2023_LOCAL_FIELD_CITATION_ID,
    protectedReportCitation:
      REVIEWED_ETMV_2023_PROTECTED_REPORT_CITATION_ID,
    protectedReportFieldCitation:
      REVIEWED_ETMV_2023_PROTECTED_REPORT_FIELD_CITATION_ID,
    libraryAnalysisRecord: REVIEWED_ETMV_2023_LIBRARY_ANALYSIS_ID,
  }),
  before: Object.freeze({
    title: REVIEWED_ETMV_2023_TITLE_BEFORE,
    year: REVIEWED_ETMV_2023_YEAR_BEFORE,
    url: REVIEWED_ETMV_2023_URL_BEFORE,
    urlCitationText: REVIEWED_ETMV_2023_URL_CITATION_TEXT_BEFORE,
    localCitationText: REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_BEFORE,
    urlCitationVerificationStatus: 'machine_verified',
    urlCitationArchivedUrl:
      'https://web.archive.org/web/20251107011843/https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
    urlCitationVerifiedAt: '2026-05-26T06:35:13.195Z',
    localCitationFileHash: null,
  }),
  after: Object.freeze({
    title: REVIEWED_ETMV_2023_TITLE_AFTER,
    year: REVIEWED_ETMV_2023_YEAR_AFTER,
    url: REVIEWED_ETMV_2023_URL_AFTER,
    urlCitationText: REVIEWED_ETMV_2023_URL_CITATION_TEXT_AFTER,
    localCitationText: REVIEWED_ETMV_2023_LOCAL_CITATION_TEXT_AFTER,
    urlCitationVerificationStatus: 'needs_review',
    urlCitationArchivedUrl: null,
    urlCitationVerifiedAt: null,
    localCitationFileHash: REVIEWED_ETMV_2023_PDF_SHA256,
  }),
  artifact: Object.freeze({
    repositoryPath: REVIEWED_ETMV_2023_REPOSITORY_PDF_PATH,
    databaseLocalPath: REVIEWED_ETMV_2023_DATABASE_LOCAL_PATH,
    sha256: REVIEWED_ETMV_2023_PDF_SHA256,
    pageOneTitle: REVIEWED_ETMV_2023_TITLE_AFTER,
  }),
  contentReplacements: REVIEWED_ETMV_2023_CONTENT_REPLACEMENTS,
  contentHashes: REVIEWED_ETMV_2023_CONTENT_HASHES,
  mutableFields: REVIEWED_ETMV_2023_MUTABLE_FIELDS,
  reportProjection: Object.freeze({
    title: REVIEWED_ETMV_2023_TITLE_AFTER,
    year: REVIEWED_ETMV_2023_YEAR_AFTER,
    sourceUrl: REVIEWED_ETMV_2023_URL_AFTER,
    documentId: REVIEWED_ETMV_2023_DOCUMENT_ID,
  }),
  protectedReportCitationProjection: Object.freeze({
    citationText: `Report: ${REVIEWED_ETMV_2023_TITLE_AFTER}`,
    title: REVIEWED_ETMV_2023_TITLE_AFTER,
    year: REVIEWED_ETMV_2023_YEAR_AFTER,
    url: REVIEWED_ETMV_2023_URL_AFTER,
    sourceClass: 'secondary',
    citationReadiness: 'citable_with_note',
    verificationStatus: 'machine_verified',
    archivedUrl:
      'https://web.archive.org/web/20251107014354/https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2023-liitteineen.pdf',
    verifiedAt: '2026-05-26T06:38:03.145Z',
    verifiedBy: null,
    captureMethod: 'backfill-existing-locators',
    hashAlgorithm: 'sha256',
  }),
  policy: Object.freeze({
    resetChangedUrlVerificationEvidence: true,
    preserveCitationReadiness: true,
    preserveLocalCitationNeedsReview: true,
    preserveFieldCitations: true,
    preserveReportAndReportCitation: true,
  }),
  boundary: Object.freeze({
    mutatesReport: false,
    mutatesProtectedReportCitation: false,
    mutatesFieldCitations: false,
    mutatesFilesystem: false,
    mutatesOtherDocuments: false,
  }),
  reviewBasis:
    'The locally reviewed 27-page PDF is SHA-256 pinned and its first page identifies the 2023 annual report. The Report row and its independent source citation already carry the correct 2023 identity; only the stale generated Document projection, its two exact citations, and its direct LibraryAnalysisRecord are reconciled.',
})

export type ReviewedEtmv2023CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | ReviewedEtmv2023CanonicalJsonValue[]
  | { [key: string]: ReviewedEtmv2023CanonicalJsonValue }

export function canonicalizeReviewedEtmv2023Json(
  value: unknown,
): ReviewedEtmv2023CanonicalJsonValue {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value
  }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalizeReviewedEtmv2023Json)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [
          key,
          canonicalizeReviewedEtmv2023Json(entry),
        ]),
    )
  }
  throw new Error(
    `Reviewed ETMV 2023 identity contract contains a non-JSON value: ${String(value)}`,
  )
}

export function sha256ReviewedEtmv2023Json(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalizeReviewedEtmv2023Json(value)))
    .digest('hex')
}

export function sha256ReviewedEtmv2023Text(value: string | Buffer) {
  return createHash('sha256').update(value).digest('hex')
}

export function replaceReviewedEtmv2023ExactlyOnce(
  value: string,
  before: string,
  after: string,
  label: string,
) {
  const occurrences = value.split(before).length - 1
  if (occurrences !== 1) {
    throw new Error(
      `Reviewed ETMV 2023 ${label} must contain the before value exactly once; actual=${occurrences}`,
    )
  }
  return value.replace(before, after)
}

export function reconcileReviewedEtmv2023DocumentContent(value: string) {
  const beforeHash = sha256ReviewedEtmv2023Text(value)
  if (
    beforeHash === REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentAfter
  ) {
    return value
  }
  if (
    beforeHash !== REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentBefore
  ) {
    throw new Error(
      `Reviewed ETMV 2023 Document.content hash drifted: ${beforeHash}`,
    )
  }
  const after = REVIEWED_ETMV_2023_CONTENT_REPLACEMENTS.reduce(
    (content, replacement) =>
      replaceReviewedEtmv2023ExactlyOnce(
        content,
        replacement.before,
        replacement.after,
        `Document.content ${replacement.label}`,
      ),
    value,
  )
  const afterHash = sha256ReviewedEtmv2023Text(after)
  if (afterHash !== REVIEWED_ETMV_2023_CONTENT_HASHES.documentContentAfter) {
    throw new Error(
      `Reviewed ETMV 2023 repaired Document.content hash drifted: ${afterHash}`,
    )
  }
  return after
}

export function reviewedEtmv2023LibraryAnalysisContentHash(input: {
  summary: string | null
  content: string
}) {
  return sha256ReviewedEtmv2023Text(
    [input.summary, input.content].filter(Boolean).join('\n\n'),
  )
}

export function reconcileReviewedEtmv2023LibraryText(
  value: string,
  label: string,
) {
  if (
    value.includes(REVIEWED_ETMV_2023_TITLE_AFTER) &&
    !value.includes(REVIEWED_ETMV_2023_TITLE_BEFORE)
  ) {
    return value
  }
  return replaceReviewedEtmv2023ExactlyOnce(
    value,
    REVIEWED_ETMV_2023_TITLE_BEFORE,
    REVIEWED_ETMV_2023_TITLE_AFTER,
    label,
  )
}

export function assertReviewedEtmv2023ReportSeed(rows: readonly Report[]) {
  const matches = rows.filter((row) => row.id === REVIEWED_ETMV_2023_REPORT_ID)
  if (matches.length !== 1) {
    throw new Error(
      `Reviewed ETMV 2023 Report seed must contain exactly one target; actual=${matches.length}`,
    )
  }
  const row = matches[0]!
  if (
    row.title !== REVIEWED_ETMV_2023_TITLE_AFTER ||
    row.year !== REVIEWED_ETMV_2023_YEAR_AFTER ||
    row.sourceUrl !== REVIEWED_ETMV_2023_URL_AFTER
  ) {
    throw new Error('Reviewed ETMV 2023 Report seed identity drifted')
  }
  return row
}

export function validateReviewedEtmv2023IdentityRepairContract() {
  const contract = REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT
  if (
    String(contract.before.title) === String(contract.after.title) ||
    Number(contract.before.year) === Number(contract.after.year) ||
    String(contract.before.url) === String(contract.after.url) ||
    contract.artifact.sha256 !== REVIEWED_ETMV_2023_PDF_SHA256
  ) {
    throw new Error('Reviewed ETMV 2023 identity transition contract drifted')
  }
  if (
    !Object.values(contract.contentHashes).every((value) =>
      /^[a-f0-9]{64}$/.test(value),
    ) ||
    !/^[a-f0-9]{64}$/.test(contract.artifact.sha256)
  ) {
    throw new Error('Reviewed ETMV 2023 identity contract has an invalid hash')
  }
  if (
    contract.before.urlCitationVerificationStatus !== 'machine_verified' ||
    contract.after.urlCitationVerificationStatus !== 'needs_review' ||
    contract.after.urlCitationArchivedUrl !== null ||
    contract.after.urlCitationVerifiedAt !== null
  ) {
    throw new Error('Reviewed ETMV 2023 changed-locator evidence policy drifted')
  }
  if (
    contract.boundary.mutatesReport ||
    contract.boundary.mutatesProtectedReportCitation ||
    contract.boundary.mutatesFieldCitations ||
    contract.boundary.mutatesFilesystem ||
    contract.boundary.mutatesOtherDocuments
  ) {
    throw new Error('Reviewed ETMV 2023 repair boundary must remain fail-closed')
  }
  return contract
}

export const REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256 =
  sha256ReviewedEtmv2023Json(REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT)
export const PINNED_REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256 =
  '77dea694349703ba98674697ef5e051d4ee7a10fa41eb18d987dea81e4278a1b' as const

validateReviewedEtmv2023IdentityRepairContract()
if (
  REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256 !==
  PINNED_REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256
) {
  throw new Error(
    `Reviewed ETMV 2023 identity contract SHA-256 drifted: ${REVIEWED_ETMV_2023_IDENTITY_REPAIR_CONTRACT_SHA256}`,
  )
}
