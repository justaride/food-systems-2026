import { createHash } from 'node:crypto'
import type { Report } from '../types'

export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_VERSION =
  '2026-07-20-v1' as const
export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_REVIEWED_AT =
  '2026-07-20' as const

export const REVIEWED_ETMV_REPORT_ID =
  'etmv-toimintakertomus-2024' as const
export const REVIEWED_ETMV_REPORT_DOCUMENT_ID =
  'cmppajyue000rnjvmxrad483t' as const
export const REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID =
  'cmpdafm3401ghsxvm1nt2gh17' as const
export const REVIEWED_ETMV_REPORT_FIELD_CITATION_ID =
  'cmpdafmb303fqsxvmjx4szlu5' as const
export const REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID =
  'cmqjoewwt00tlzpvmmp4b90ui' as const

export const REVIEWED_ETMV_REPORT_TITLE_BEFORE =
  'Elintarvikemarkkinavaltuutettu toimintakertomus 2024' as const
export const REVIEWED_ETMV_REPORT_TITLE_AFTER =
  'Elintarvikemarkkinavaltuutetun toimintakertomus 2024' as const
export const REVIEWED_ETMV_REPORT_CITATION_TEXT_BEFORE =
  `Report: ${REVIEWED_ETMV_REPORT_TITLE_BEFORE}` as const
export const REVIEWED_ETMV_REPORT_CITATION_TEXT_AFTER =
  `Report: ${REVIEWED_ETMV_REPORT_TITLE_AFTER}` as const
export const REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO =
  '2026-07-20T00:00:00.000Z' as const

export const REVIEWED_ETMV_REPORT_MUTABLE_FIELDS = Object.freeze({
  Report: Object.freeze(['title'] as const),
  Document: Object.freeze(['title', 'content'] as const),
  SourceCitation: Object.freeze([
    'citationText',
    'title',
    'accessedAt',
  ] as const),
  LibraryAnalysisRecord: Object.freeze([
    'title',
    'aiSummary',
    'aiCard.shortSummary',
    'contentHash',
  ] as const),
})

export const REVIEWED_ETMV_REPORT_CONTENT_HASHES = Object.freeze({
  documentContentBefore:
    'e1bdf89676884485375af155ae0286fd78239346df40062b6fd0f5e56add4622',
  documentContentAfter:
    '9d29e8b384519c0fe81a83367c8b4abd08bcbffddffd9378619ca03a9fc3673f',
  libraryAnalysisContentBefore:
    '9f5940db58e5a4f19736fa885ff56b8396a9957a09cd6408a1ec9620edd1c0ed',
  libraryAnalysisContentAfter:
    '61520b6e940f5cef8c9eceb141c450ccc3ad6a12092dbbcb27c2431183064c06',
})

export const REVIEWED_ETMV_REPORT_FULL_ROW_HASHES = Object.freeze({
  Report: Object.freeze({
    before:
      'a4c03cff7606021c9f899b375063046f4aaefae3c868c9fbd55f75ef5993ebbe',
    after:
      '72b3160b105b9fc0f1ff8ca67183af1dc7fc3a8d7bddff1ea2ab2a324ca1ac03',
    nonTarget:
      'a6c426e3a41094371d396b840b82a268c42399753f6df77453f065a496bc253c',
  }),
  Document: Object.freeze({
    before:
      '1b885df03e7b2f544fd76bbfb070ab2f3787bf168cf21f54defbf07e6f082c30',
    after:
      'f7ca50ed14b868334cc2cd4c38584978a6b878bb84d9563a0c34f2a4da646d4d',
    nonTarget:
      'ac50427c0cc53de133f1adc4bb0ec0797990589ccec00d979b108b57ac981795',
  }),
  SourceCitation: Object.freeze({
    before:
      '3995a3bdd9819773e26ccf451b7054e4b08309e1566f0418e3947ae2da37f0cd',
    after:
      'b9a3229d101a12d5153e5f2f65732c91a9f9aae38aebc32bfed1eafe79d3f645',
    nonTarget:
      '43943d9db858ded33252368fb63d02397abad617ef433dcd666b7b8b9ff58866',
  }),
  FieldCitation: Object.freeze({
    before:
      '41a8660bb788e34bbc6abba3d384704d74d10a7361a8251e324d9639a63243b5',
    after:
      '41a8660bb788e34bbc6abba3d384704d74d10a7361a8251e324d9639a63243b5',
    nonTarget:
      '41a8660bb788e34bbc6abba3d384704d74d10a7361a8251e324d9639a63243b5',
  }),
  LibraryAnalysisRecord: Object.freeze({
    before:
      'be8e27f2b4fcc32f1a8961903040da1d416e3b3864b40643c5c04fd7666fb8d7',
    after:
      'fd21e051c6626ac8757fc3bfb02dad5c4a0dca291e6415e1a5c045acc385bef0',
    nonTarget:
      'f5c1f2050df80deda343c66e0528f9c2eb0b0d3265a90801d45697eb9d1e4c0b',
  }),
})

export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT = Object.freeze({
  version: REVIEWED_ETMV_REPORT_TITLE_REPAIR_VERSION,
  reviewedAt: REVIEWED_ETMV_REPORT_TITLE_REPAIR_REVIEWED_AT,
  ids: Object.freeze({
    report: REVIEWED_ETMV_REPORT_ID,
    document: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
    sourceCitation: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
    fieldCitation: REVIEWED_ETMV_REPORT_FIELD_CITATION_ID,
    libraryAnalysisRecord: REVIEWED_ETMV_REPORT_LIBRARY_ANALYSIS_ID,
  }),
  before: Object.freeze({
    title: REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    citationText: REVIEWED_ETMV_REPORT_CITATION_TEXT_BEFORE,
    citationAccessedAt: null,
  }),
  after: Object.freeze({
    title: REVIEWED_ETMV_REPORT_TITLE_AFTER,
    citationText: REVIEWED_ETMV_REPORT_CITATION_TEXT_AFTER,
    citationAccessedAt: REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO,
  }),
  mutableFields: REVIEWED_ETMV_REPORT_MUTABLE_FIELDS,
  contentHashes: REVIEWED_ETMV_REPORT_CONTENT_HASHES,
  fullRowHashes: REVIEWED_ETMV_REPORT_FULL_ROW_HASHES,
  bindings: Object.freeze({
    reportDocumentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
    fieldCitationCitationId: REVIEWED_ETMV_REPORT_SOURCE_CITATION_ID,
    fieldCitationEntityType: 'Report',
    fieldCitationEntityId: REVIEWED_ETMV_REPORT_ID,
    fieldCitationFieldPath: 'sourceUrl',
    libraryAnalysisSourceKind: 'document',
    libraryAnalysisSourceKey:
      `document:${REVIEWED_ETMV_REPORT_DOCUMENT_ID}`,
    libraryAnalysisDocumentId: REVIEWED_ETMV_REPORT_DOCUMENT_ID,
  }),
  preservedCitationEvidence: Object.freeze({
    sourceClass: 'secondary',
    citationReadiness: 'citable_with_note',
    verificationStatus: 'machine_verified',
    url: 'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
    archivedUrl:
      'https://web.archive.org/web/20251107011843/https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
    verifiedAt: '2026-05-26T06:36:57.045Z',
    verifiedBy: null,
    captureMethod: 'backfill-existing-locators',
  }),
  evidence: Object.freeze({
    sourceDocIdentityManifestSha256:
      '1396f3ad134459afa40076556d24c466c8b90e9c40017c1ba3a74ae998e6ae7c',
    reviewBasis:
      'The official 2024 PDF first page uses the Finnish genitive title Elintarvikemarkkinavaltuutetun toimintakertomus 2024. This repair reconciles the independent Report semantic mirror after the reviewed src-143 identity repair.',
  }),
  boundary: Object.freeze({
    mutatesSourceDocRows: false,
    mutatesOtherReportRows: false,
    mutatesFilePath: false,
    copiesFilesystemArtifacts: false,
  }),
})

export type ReviewedEtmvCanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | ReviewedEtmvCanonicalJsonValue[]
  | { [key: string]: ReviewedEtmvCanonicalJsonValue }

export function canonicalizeReviewedEtmvJson(
  value: unknown,
): ReviewedEtmvCanonicalJsonValue {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string'
  ) {
    return value
  }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalizeReviewedEtmvJson)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, entry]) => [key, canonicalizeReviewedEtmvJson(entry)]),
    )
  }
  throw new Error(
    `Reviewed ETMV title repair contains a non-JSON value: ${String(value)}`,
  )
}

export function sha256ReviewedEtmvJson(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalizeReviewedEtmvJson(value)))
    .digest('hex')
}

export function sha256ReviewedEtmvText(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function replaceReviewedEtmvTitleExactlyOnce(
  value: string,
  label: string,
) {
  const occurrences = value.split(REVIEWED_ETMV_REPORT_TITLE_BEFORE).length - 1
  if (occurrences !== 1) {
    throw new Error(
      `Reviewed ETMV ${label} must contain the old title exactly once; actual=${occurrences}`,
    )
  }
  return value.replace(
    REVIEWED_ETMV_REPORT_TITLE_BEFORE,
    REVIEWED_ETMV_REPORT_TITLE_AFTER,
  )
}

export function reviewedEtmvLibraryAnalysisContentHash(input: {
  summary: string | null
  content: string
}) {
  return sha256ReviewedEtmvText(
    [input.summary, input.content].filter(Boolean).join('\n\n'),
  )
}

export const REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256 =
  sha256ReviewedEtmvJson(REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT)

// Pinned below after the complete contract is canonicalized. The literal is
// deliberately checked at module load so an unreviewed contract edit fails.
export const PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256 =
  'e2f3b47596bdb89068338512a579641a10f445c80df05ba57dd163af7bf75fca' as const

function isLowercaseSha256(value: string) {
  return /^[a-f0-9]{64}$/.test(value)
}

function equalContractValues(left: unknown, right: unknown) {
  return left === right
}

export function validateReviewedEtmvReportTitleRepairContract() {
  const contract = REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT
  if (
    equalContractValues(contract.before.title, contract.after.title) ||
    equalContractValues(
      contract.before.citationText,
      contract.after.citationText,
    ) ||
    !equalContractValues(
      contract.after.citationAccessedAt,
      REVIEWED_ETMV_REPORT_ACCESSED_AT_ISO,
    )
  ) {
    throw new Error('Reviewed ETMV title transition contract drifted')
  }

  const allHashes = [
    ...Object.values(contract.contentHashes),
    ...Object.values(contract.fullRowHashes).flatMap((hashes) =>
      Object.values(hashes),
    ),
  ]
  if (!allHashes.every(isLowercaseSha256)) {
    throw new Error('Reviewed ETMV title repair has an invalid SHA-256 pin')
  }
  if (
    equalContractValues(
      contract.fullRowHashes.Report.before,
      contract.fullRowHashes.Report.after,
    ) ||
    equalContractValues(
      contract.fullRowHashes.Document.before,
      contract.fullRowHashes.Document.after,
    ) ||
    equalContractValues(
      contract.fullRowHashes.SourceCitation.before,
      contract.fullRowHashes.SourceCitation.after,
    ) ||
    equalContractValues(
      contract.fullRowHashes.LibraryAnalysisRecord.before,
      contract.fullRowHashes.LibraryAnalysisRecord.after,
    ) ||
    !equalContractValues(
      contract.fullRowHashes.FieldCitation.before,
      contract.fullRowHashes.FieldCitation.after,
    )
  ) {
    throw new Error('Reviewed ETMV full-row transition hashes are invalid')
  }
  if (
    contract.boundary.mutatesSourceDocRows ||
    contract.boundary.mutatesOtherReportRows ||
    contract.boundary.mutatesFilePath ||
    contract.boundary.copiesFilesystemArtifacts
  ) {
    throw new Error('Reviewed ETMV repair boundary must remain fail-closed')
  }
  return contract
}

export function applyReviewedEtmvReportTitleRepairToSeed(
  rows: readonly Report[],
): Report[] {
  validateReviewedEtmvReportTitleRepairContract()
  const matches = rows.filter((row) => row.id === REVIEWED_ETMV_REPORT_ID)
  if (matches.length !== 1) {
    throw new Error(
      `Reviewed ETMV Report seed must contain exactly one target; actual=${matches.length}`,
    )
  }

  return rows.map((row) => {
    if (row.id !== REVIEWED_ETMV_REPORT_ID) return row
    if (row.title === REVIEWED_ETMV_REPORT_TITLE_AFTER) return row
    if (row.title !== REVIEWED_ETMV_REPORT_TITLE_BEFORE) {
      throw new Error(
        `Reviewed ETMV Report seed title drifted: ${row.title}`,
      )
    }
    return { ...row, title: REVIEWED_ETMV_REPORT_TITLE_AFTER }
  })
}

validateReviewedEtmvReportTitleRepairContract()
if (
  REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256 !==
  PINNED_REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256
) {
  throw new Error(
    `Reviewed ETMV title repair contract SHA-256 drifted: ${REVIEWED_ETMV_REPORT_TITLE_REPAIR_CONTRACT_SHA256}`,
  )
}
