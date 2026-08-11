export type AcademicClaimAnchorSourceSnapshot = {
  id: string
  title: string
  url: string
  provenanceType: 'corporate_self_report' | 'commissioned_report'
  accessedAt: string
}

export type AcademicClaimAnchorCitation = {
  id: string
  sourceDocId: string
  sourceClass: 'primary' | 'secondary'
  citationReadiness: 'citable_with_note'
  verificationStatus: 'machine_verified'
  citationText: string
  title: string
  publisher: string
  author: string
  year: number
  url: string
  archivedUrl: null
  localPath: string | null
  fileHash: string
  contentHash: null
  hashAlgorithm: 'sha256'
  pageRef: string
  quote: string
  accessedAt: string
  captureMethod: 'pdf-download-sha256+pdf-render+codex-visual-audit'
  verifiedAt: string
  verifiedBy: 'codex-visual-pdf-audit-2026-07-19'
  confidence: number
  notes: string
  documentId: null
}

export type AcademicClaimAnchorFieldCitation = {
  id: string
  citationId: string
  entityType: 'SourceDoc'
  entityId: string
  fieldPath: string
  claimText: string
  confidence: number
}

export type AcademicClaimAnchor = {
  auditArtifactPath: string
  source: AcademicClaimAnchorSourceSnapshot
  citation: AcademicClaimAnchorCitation
  fieldCitation: AcademicClaimAnchorFieldCitation
}

export type AcademicClaimAnchorExistingCitation = {
  id: string
  sourceDocId: string | null
  sourceClass: string
  citationReadiness: string
  verificationStatus: string
  citationText: string
  title: string | null
  publisher: string | null
  author: string | null
  year: number | null
  url: string | null
  archivedUrl: string | null
  localPath: string | null
  fileHash: string | null
  contentHash: string | null
  hashAlgorithm: string
  pageRef: string | null
  quote: string | null
  accessedAt: Date | string | null
  captureMethod: string
  verifiedAt: Date | string | null
  verifiedBy: string | null
  confidence: number | null
  notes: string | null
  documentId: string | null
}

export type AcademicClaimAnchorExistingFieldCitation = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath: string | null
  claimText: string | null
  confidence: number | null
}

export type AcademicClaimAnchorState = 'pending' | 'applied' | 'conflict'

const AUDIT_DATE = '2026-07-19T00:00:00.000Z'
const CAPTURE_METHOD = 'pdf-download-sha256+pdf-render+codex-visual-audit' as const
const VERIFIED_BY = 'codex-visual-pdf-audit-2026-07-19' as const
const MACHINE_AUDIT_NOTE =
  'PDF page rendered to PNG and visually inspected by Codex; machine/visual audit only, with no human review asserted.'

export const ACADEMIC_CLAIM_ANCHOR_PILOT: readonly AcademicClaimAnchor[] = [
  {
    auditArtifactPath: 'research/evidence-pack/arsrapporter/asko-barekraft-2024.pdf',
    source: {
      id: 'src-30',
      title: 'Bærekraft i ASKO 2024',
      url: 'https://asko.no/nyhetsarkiv/barekraft-i-asko-2024/',
      provenanceType: 'corporate_self_report',
      accessedAt: AUDIT_DATE,
    },
    citation: {
      id: 'academic_anchor_src30_energy_p25_v1',
      sourceDocId: 'src-30',
      sourceClass: 'primary',
      citationReadiness: 'citable_with_note',
      verificationStatus: 'machine_verified',
      citationText: 'ASKO Norge AS (2024), Bærekraft i ASKO 2024, PDF p. 25.',
      title: 'Bærekraft i ASKO 2024',
      publisher: 'ASKO Norge AS',
      author: 'ASKO Norge AS',
      year: 2024,
      url: 'https://asko.no/globalassets/om-asko/miljo/barekraft-i-asko-2024.pdf',
      archivedUrl: null,
      localPath: 'research/evidence-pack/arsrapporter/asko-barekraft-2024.pdf',
      fileHash: '94b68068c89e9713e968f3c5ef17ed0f4e74fa57206ea5dd383aac6b44529108',
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: 'PDF p. 25',
      quote: 'I 2024 produserte vi 95 GWh fornybar energi. Dette tilsvarer 96 prosent av vårt totale strømforbruk.',
      accessedAt: AUDIT_DATE,
      captureMethod: CAPTURE_METHOD,
      verifiedAt: AUDIT_DATE,
      verifiedBy: VERIFIED_BY,
      confidence: 95,
      notes: `${MACHINE_AUDIT_NOTE} Corporate self-report; the claim must remain attributed to ASKO and is not an independent impact assessment.`,
      documentId: null,
    },
    fieldCitation: {
      id: 'academic_field_src30_energy_p25_v1',
      citationId: 'academic_anchor_src30_energy_p25_v1',
      entityType: 'SourceDoc',
      entityId: 'src-30',
      fieldPath: 'evidenceClaims.renewableEnergy2024',
      claimText: 'ASKO reports that it produced 95 GWh of renewable energy in 2024, equal to 96 percent of its total electricity consumption.',
      confidence: 0.95,
    },
  },
  {
    auditArtifactPath: 'tmp/pdfs/norsus-matsvinn-2024.pdf',
    source: {
      id: 'src-32',
      title: 'Faktaark om matsvinn i Norge 2024',
      url: 'https://norsus.no/publikasjon/faktaark-om-matsvinn-i-norge-2024/',
      provenanceType: 'commissioned_report',
      accessedAt: AUDIT_DATE,
    },
    citation: {
      id: 'academic_anchor_src32_reduction_p2_v1',
      sourceDocId: 'src-32',
      sourceClass: 'secondary',
      citationReadiness: 'citable_with_note',
      verificationStatus: 'machine_verified',
      citationText: 'NORSUS (2025), Faktaark om matsvinn i Norge 2024, OR.27.25, PDF p. 2.',
      title: 'Faktaark om matsvinn i Norge 2024',
      publisher: 'NORSUS',
      author: 'NORSUS',
      year: 2025,
      url: 'https://norsus.no/wp-content/uploads/7.-OR.27.25-Faktark-om-matsvinn-i-Norge-2024-1.pdf',
      archivedUrl: null,
      localPath: null,
      fileHash: '39523279d3afff6f0f41b5baea04590f2ce6499f2a2518a04fa82b29395c7fcf',
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: 'PDF p. 2',
      quote: 'Fra 2015 til 2024 er det estimert at matsvinnet i Norge er redusert med 24 %, målt i kg/innbygger.',
      accessedAt: AUDIT_DATE,
      captureMethod: CAPTURE_METHOD,
      verifiedAt: AUDIT_DATE,
      verifiedBy: VERIFIED_BY,
      confidence: 90,
      notes: `${MACHINE_AUDIT_NOTE} Commissioned report prepared for Matvett; the adjacent page text excludes agriculture from this change estimate, so that scope caveat must travel with the claim.`,
      documentId: null,
    },
    fieldCitation: {
      id: 'academic_field_src32_reduction_p2_v1',
      citationId: 'academic_anchor_src32_reduction_p2_v1',
      entityType: 'SourceDoc',
      entityId: 'src-32',
      fieldPath: 'evidenceClaims.foodWasteReduction2015To2024',
      claimText: 'NORSUS estimates that Norwegian food waste fell by 24 percent per capita from 2015 to 2024; agriculture is excluded from this change estimate.',
      confidence: 0.9,
    },
  },
  {
    auditArtifactPath: 'research/evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf',
    source: {
      id: 'src-45',
      title: 'Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!',
      url: 'https://osloeconomics.no/publication/konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte/',
      provenanceType: 'commissioned_report',
      accessedAt: AUDIT_DATE,
    },
    citation: {
      id: 'academic_anchor_src45_commissioner_p2_v1',
      sourceDocId: 'src-45',
      sourceClass: 'secondary',
      citationReadiness: 'citable_with_note',
      verificationStatus: 'machine_verified',
      citationText: 'Oslo Economics (2024), Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!, report 2024-53, PDF p. 2.',
      title: 'Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!',
      publisher: 'Oslo Economics',
      author: 'Oslo Economics',
      year: 2024,
      url: 'https://osloeconomics.no/wp-content/uploads/2024/06/Oslo-Economics-Konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte.pdf',
      archivedUrl: null,
      localPath: 'research/evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf',
      fileHash: '6155c0f06fea09224f3ec235453af91641aa99302493d97faad0f0c772ccc8de',
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: 'PDF p. 2',
      quote: 'Utarbeidet av: Oslo Economics Oppdragsgiver: NorgesGruppen Publisert: Juni 2024 Rapportnummer: 2024-53',
      accessedAt: AUDIT_DATE,
      captureMethod: CAPTURE_METHOD,
      verifiedAt: AUDIT_DATE,
      verifiedBy: VERIFIED_BY,
      confidence: 95,
      notes: `${MACHINE_AUDIT_NOTE} This anchor records the report's disclosed commissioner and publication metadata; it does not make the report independent evidence.`,
      documentId: null,
    },
    fieldCitation: {
      id: 'academic_field_src45_commissioner_p2_v1',
      citationId: 'academic_anchor_src45_commissioner_p2_v1',
      entityType: 'SourceDoc',
      entityId: 'src-45',
      fieldPath: 'evidenceClaims.commissioningDisclosure',
      claimText: 'The report identifies Oslo Economics as author, NorgesGruppen as commissioner, June 2024 as publication date, and 2024-53 as report number.',
      confidence: 0.95,
    },
  },
  {
    auditArtifactPath: 'research/evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf',
    source: {
      id: 'src-45',
      title: 'Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!',
      url: 'https://osloeconomics.no/publication/konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte/',
      provenanceType: 'commissioned_report',
      accessedAt: AUDIT_DATE,
    },
    citation: {
      id: 'academic_anchor_src45_argument_p4_v1',
      sourceDocId: 'src-45',
      sourceClass: 'secondary',
      citationReadiness: 'citable_with_note',
      verificationStatus: 'machine_verified',
      citationText: 'Oslo Economics (2024), Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!, report 2024-53, PDF p. 4.',
      title: 'Konkurransen i dagligvaremarkedet – betydelig bedre enn sitt rykte!',
      publisher: 'Oslo Economics',
      author: 'Oslo Economics',
      year: 2024,
      url: 'https://osloeconomics.no/wp-content/uploads/2024/06/Oslo-Economics-Konkurransen-i-dagligvaremarkedet-betydelig-bedre-enn-sitt-rykte.pdf',
      archivedUrl: null,
      localPath: 'research/evidence-pack/konsulentrapport/oslo-economics-forsvar-2024.pdf',
      fileHash: '6155c0f06fea09224f3ec235453af91641aa99302493d97faad0f0c772ccc8de',
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: 'PDF p. 4',
      quote: 'Rapporten dokumenterer at de høye dagligvareprisene ikke skyldes svak konkurranse mellom dagligvarekjeder.',
      accessedAt: AUDIT_DATE,
      captureMethod: CAPTURE_METHOD,
      verifiedAt: AUDIT_DATE,
      verifiedBy: VERIFIED_BY,
      confidence: 85,
      notes: `${MACHINE_AUDIT_NOTE} Commissioned by NorgesGruppen; this is anchored only as Oslo Economics' report argument, not as an independently established fact.`,
      documentId: null,
    },
    fieldCitation: {
      id: 'academic_field_src45_argument_p4_v1',
      citationId: 'academic_anchor_src45_argument_p4_v1',
      entityType: 'SourceDoc',
      entityId: 'src-45',
      fieldPath: 'evidenceClaims.reportArgumentHighPrices',
      claimText: 'Oslo Economics argues in the NorgesGruppen-commissioned report that high grocery prices are not caused by weak competition between grocery chains.',
      confidence: 0.85,
    },
  },
]

function normalizeDate(value: Date | string | null | undefined) {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString()
}

function sourceCitationProjection(value: AcademicClaimAnchorCitation | AcademicClaimAnchorExistingCitation) {
  return {
    id: value.id,
    sourceDocId: value.sourceDocId,
    sourceClass: value.sourceClass,
    citationReadiness: value.citationReadiness,
    verificationStatus: value.verificationStatus,
    citationText: value.citationText,
    title: value.title,
    publisher: value.publisher,
    author: value.author,
    year: value.year,
    url: value.url,
    archivedUrl: value.archivedUrl,
    localPath: value.localPath,
    fileHash: value.fileHash,
    contentHash: value.contentHash,
    hashAlgorithm: value.hashAlgorithm,
    pageRef: value.pageRef,
    quote: value.quote,
    accessedAt: normalizeDate(value.accessedAt),
    captureMethod: value.captureMethod,
    verifiedAt: normalizeDate(value.verifiedAt),
    verifiedBy: value.verifiedBy,
    confidence: value.confidence,
    notes: value.notes,
    documentId: value.documentId,
  }
}

function fieldCitationProjection(value: AcademicClaimAnchorFieldCitation | AcademicClaimAnchorExistingFieldCitation) {
  return {
    id: value.id,
    citationId: value.citationId,
    entityType: value.entityType,
    entityId: value.entityId,
    fieldPath: value.fieldPath,
    claimText: value.claimText,
    confidence: value.confidence,
  }
}

export function sourceCitationMatchesAcademicClaimAnchor(
  anchor: AcademicClaimAnchor,
  current: AcademicClaimAnchorExistingCitation,
) {
  return JSON.stringify(sourceCitationProjection(anchor.citation)) === JSON.stringify(sourceCitationProjection(current))
}

export function fieldCitationMatchesAcademicClaimAnchor(
  anchor: AcademicClaimAnchor,
  current: AcademicClaimAnchorExistingFieldCitation,
) {
  return JSON.stringify(fieldCitationProjection(anchor.fieldCitation)) === JSON.stringify(fieldCitationProjection(current))
}

export function classifyAcademicClaimAnchorState(
  anchor: AcademicClaimAnchor,
  currentCitation?: AcademicClaimAnchorExistingCitation,
  currentFieldCitation?: AcademicClaimAnchorExistingFieldCitation,
): AcademicClaimAnchorState {
  if (currentCitation && !sourceCitationMatchesAcademicClaimAnchor(anchor, currentCitation)) return 'conflict'
  if (currentFieldCitation && !fieldCitationMatchesAcademicClaimAnchor(anchor, currentFieldCitation)) return 'conflict'
  if (!currentCitation && currentFieldCitation) return 'conflict'
  if (currentCitation && currentFieldCitation) return 'applied'
  return 'pending'
}

export function sourceSnapshotMatchesAcademicClaimAnchor(
  expected: AcademicClaimAnchorSourceSnapshot,
  current: {
    id: string
    title: string | null
    url: string | null
    provenanceType: string
    accessedAt: Date | string | null
  },
) {
  return (
    current.id === expected.id &&
    current.title === expected.title &&
    current.url === expected.url &&
    current.provenanceType === expected.provenanceType &&
    normalizeDate(current.accessedAt) === expected.accessedAt
  )
}

export function validateAcademicClaimAnchorPilot(
  anchors: readonly AcademicClaimAnchor[] = ACADEMIC_CLAIM_ANCHOR_PILOT,
) {
  const citationIds = anchors.map(anchor => anchor.citation.id)
  const fieldCitationIds = anchors.map(anchor => anchor.fieldCitation.id)
  const sourceIds = new Set(anchors.map(anchor => anchor.source.id))

  if (anchors.length !== 4 || sourceIds.size !== 3 || !['src-30', 'src-32', 'src-45'].every(id => sourceIds.has(id))) {
    throw new Error('Academic claim-anchor pilot must contain four anchors for exactly src-30, src-32, and src-45')
  }
  if (new Set(citationIds).size !== citationIds.length || new Set(fieldCitationIds).size !== fieldCitationIds.length) {
    throw new Error('Academic claim-anchor pilot requires unique deterministic citation and field-citation ids')
  }

  for (const anchor of anchors) {
    if (anchor.source.id !== anchor.citation.sourceDocId || anchor.source.id !== anchor.fieldCitation.entityId) {
      throw new Error(`Academic claim-anchor entity binding drifted: ${anchor.citation.id}`)
    }
    if (anchor.citation.id !== anchor.fieldCitation.citationId) {
      throw new Error(`Academic claim-anchor citation binding drifted: ${anchor.citation.id}`)
    }
    if (anchor.citation.citationReadiness !== 'citable_with_note') {
      throw new Error(`Academic claim-anchor must remain citable_with_note: ${anchor.citation.id}`)
    }
    if (anchor.citation.verificationStatus !== 'machine_verified' || anchor.citation.verifiedBy !== VERIFIED_BY) {
      throw new Error(`Academic claim-anchor must remain machine/Codex verified only: ${anchor.citation.id}`)
    }
    if (!anchor.citation.notes.includes('no human review asserted')) {
      throw new Error(`Academic claim-anchor must preserve the no-human-review boundary: ${anchor.citation.id}`)
    }
    if (!/^[a-f0-9]{64}$/.test(anchor.citation.fileHash) || anchor.citation.hashAlgorithm !== 'sha256') {
      throw new Error(`Academic claim-anchor requires a pinned SHA-256 PDF hash: ${anchor.citation.id}`)
    }
    if (!anchor.citation.pageRef || !anchor.citation.quote || !anchor.fieldCitation.claimText) {
      throw new Error(`Academic claim-anchor requires page, quote, and claim text: ${anchor.citation.id}`)
    }
    if (!anchor.auditArtifactPath.endsWith('.pdf') || anchor.auditArtifactPath.startsWith('/')) {
      throw new Error(`Academic claim-anchor requires a repository-relative PDF audit artifact: ${anchor.citation.id}`)
    }
    if (anchor.source.provenanceType === 'commissioned_report' && anchor.citation.sourceClass !== 'secondary') {
      throw new Error(`Commissioned report must remain secondary: ${anchor.citation.id}`)
    }
    if (anchor.source.provenanceType === 'corporate_self_report' && anchor.citation.sourceClass !== 'primary') {
      throw new Error(`Corporate self-report must remain primary-but-attributed: ${anchor.citation.id}`)
    }
  }

  return anchors
}
