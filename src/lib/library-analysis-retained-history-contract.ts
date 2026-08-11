import {
  sha256ReviewedProvenanceJson,
} from './citations/reviewed-provenance-batch'

export const LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION =
  '2026-07-28-v1' as const

export const LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT = Object.freeze({
  observedAt: '2026-07-28T05:32:26.743Z',
  currentInventoryRows: 1555,
  persistedRows: 1572,
  retainedHistoryRows: 17,
  inventoryOnlyRows: 0,
  managedRuntimeSourceDocIntersectionRows: 0,
  projectionFreshnessMaterialUpdates: 15,
  projectionFreshnessIncludedInThisContract: false,
})

export type LibraryAnalysisRetainedHistorySourceKind =
  | 'document'
  | 'library_file'

export type LibraryAnalysisRetainedHistoryCounterpartKind =
  | 'document'
  | 'source_doc'
  | 'report'
  | 'thesis'

export type LibraryAnalysisRetainedHistoryReasonCode =
  | 'duplicate_document_consolidation'
  | 'entity_projection_replaced'
  | 'document_projection_deleted_source_doc_survives'
  | 'library_file_promoted_to_document'

export type LibraryAnalysisRetainedHistoryEntry = Readonly<{
  retainedRecordId: string
  retainedIdentityKey: string
  sourceKind: LibraryAnalysisRetainedHistorySourceKind
  sourceKey: string
  expectedContentHashSha256: string
  expectedTitle: string
  expectedDocumentId: null
  expectedSourceDocId: string | null
  expectedStatus: 'ai_draft'
  expectedUsageRule: 'internal_background'
  expectedReviewStatus: 'not_required'
  expectedReviewedAt: null
  expectedReviewer: null
  expectedClaimCandidateCount: 0
  externalUse: false
  liveCounterpart: Readonly<{
    sourceKind: LibraryAnalysisRetainedHistoryCounterpartKind
    sourceKey: string
    identityKey: string
  }>
  retentionReasonCode: LibraryAnalysisRetainedHistoryReasonCode
  retentionReason: string
  protectedByContract: string | null
}>

export type LibraryAnalysisRetainedHistoryDatabaseRow = Readonly<{
  id: string
  sourceKind: string
  sourceKey: string
  documentId: string | null
  sourceDocId: string | null
  title: string
  status: string
  usageRule: string
  reviewStatus: string
  contentHash: string | null
  reviewedAt: Date | string | null
  reviewer: string | null
  claimCandidates: unknown
}>

export type LibraryAnalysisCurrentIdentity = Readonly<{
  sourceKind: string
  sourceKey: string
}>

export type LibraryAnalysisRetainedHistoryInspection = Readonly<{
  issues: readonly string[]
  retainedRows: readonly LibraryAnalysisRetainedHistoryDatabaseRow[]
  summary: Readonly<{
    contractRows: number
    currentInventoryRows: number
    persistedRows: number
    livePersistedRows: number
    retainedHistoryRows: number
    inventoryOnlyRows: number
    missingCounterpartRows: number
  }>
}>

type RetainedEntryInput = Omit<
  LibraryAnalysisRetainedHistoryEntry,
  | 'retainedIdentityKey'
  | 'expectedDocumentId'
  | 'expectedStatus'
  | 'expectedUsageRule'
  | 'expectedReviewStatus'
  | 'expectedReviewedAt'
  | 'expectedReviewer'
  | 'expectedClaimCandidateCount'
  | 'externalUse'
  | 'liveCounterpart'
> & {
  liveCounterpart: Readonly<{
    sourceKind: LibraryAnalysisRetainedHistoryCounterpartKind
    sourceKey: string
  }>
}

function retainedEntry(input: RetainedEntryInput): LibraryAnalysisRetainedHistoryEntry {
  const liveCounterpart = Object.freeze({
    ...input.liveCounterpart,
    identityKey: libraryAnalysisIdentityKey(input.liveCounterpart),
  })
  return Object.freeze({
    ...input,
    retainedIdentityKey: libraryAnalysisIdentityKey(input),
    expectedDocumentId: null,
    expectedStatus: 'ai_draft',
    expectedUsageRule: 'internal_background',
    expectedReviewStatus: 'not_required',
    expectedReviewedAt: null,
    expectedReviewer: null,
    expectedClaimCandidateCount: 0,
    externalUse: false,
    liveCounterpart,
  })
}

const RAW_LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES = [
  retainedEntry({
    retainedRecordId: 'cmqjoewj600iuzpvm7icy9hwk',
    sourceKind: 'document',
    sourceKey: 'document:cmp8xyoej00k6vvvm63gli4a8',
    expectedContentHashSha256:
      'dbeb7a854c17cce27a6c0fe314069354efe2e48de59c8ad2d033c51290fd6a89',
    expectedTitle: 'Salling Coop Danmark 2025',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'document',
      sourceKey: 'document:cmppajyyi001xnjvm9v3f2zzf',
    },
    retentionReasonCode: 'duplicate_document_consolidation',
    retentionReason:
      'The sparse duplicate Salling Document was deleted and its citation was retargeted to the structured Salling report Document; retain this historical analysis projection without external use.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoeww200suzpvm8f2skxan',
    sourceKind: 'document',
    sourceKey: 'document:cmppajyof0000njvmdjrv2blv',
    expectedContentHashSha256:
      '0300f9e0625994df44c6f098185af08acdfd0ff628ae76cbd6d5ab358f8c7557',
    expectedTitle:
      'Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'thesis',
      sourceKey: 'thesis:tesdal-2013',
    },
    retentionReasonCode: 'entity_projection_replaced',
    retentionReason:
      'The deleted generated Document projection is replaced in the live inventory by the stable Tesdal Thesis identity; retain the old analysis as internal history.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoewx300tvzpvmmg3bp99j',
    sourceKind: 'document',
    sourceKey: 'document:cmppajyv80011njvmgpvgesxt',
    expectedContentHashSha256:
      'ecd027e5087bc802e93f50342fd2e15fb8c499232258c2ac77648e0b07168895',
    expectedTitle: 'Solutions Menu',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'report',
      sourceKey: 'report:solutions-menu-2018',
    },
    retentionReasonCode: 'entity_projection_replaced',
    retentionReason:
      'The deleted generated Document projection is replaced in the live inventory by the stable Solutions Menu Report identity; retain the old analysis as internal history.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoewzo00vfzpvmwtub4n8n',
    sourceKind: 'document',
    sourceKey: 'document:cmppgez6p0000f5vm780lxspg',
    expectedContentHashSha256:
      '4a281c4696af3459594d6ba9f19743c9f1a3cb89f537ab34d13c7a15e2421d8b',
    expectedTitle: 'Lönsamhet i livsmedelskedjan',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'report',
      sourceKey: 'report:konkurrensverket-lonsamhet-2025',
    },
    retentionReasonCode: 'entity_projection_replaced',
    retentionReason:
      'The deleted generated Document projection is replaced in the live inventory by the stable Konkurrensverket profitability Report identity; retain the old analysis as internal history.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoewzp00vgzpvm1uxe8w0f',
    sourceKind: 'document',
    sourceKey: 'document:cmppgez710001f5vmu3vx72b4',
    expectedContentHashSha256:
      'be0520bb7f35283b681c52ed6e5f9b07ff4a47af5fbe5736ebcfe831a7b0a00b',
    expectedTitle: 'Etablering av dagligvarubutiker',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'report',
      sourceKey: 'report:konkurrensverket-etablering-2026',
    },
    retentionReasonCode: 'entity_projection_replaced',
    retentionReason:
      'The deleted generated Document projection is replaced in the live inventory by the stable Konkurrensverket establishment Report identity; retain the old analysis as internal history.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex2o00wozpvmvtmnlt75',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnh7000fekvmb9a3gc61',
    expectedContentHashSha256:
      'c5a28e56838b59ae352403583b2e4a40e53bcb2f02c8e9a5ca410ffda3c56c23',
    expectedTitle: 'Reitan Eiendom aarsrapport 2024',
    expectedSourceDocId: 'src-138',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-138',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-138 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex2s00wtzpvmkdn39dom',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhi000kekvm8th1u208',
    expectedContentHashSha256:
      '38cce151ffb447b9caab35ea771779188c1cbbc2f56e3c0fc635bd7888c7297a',
    expectedTitle:
      'Beyond FLW Reduction Targets: Measuring and Valuing Food Loss and Waste',
    expectedSourceDocId: 'src-93',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-93',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-93 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex2u00wuzpvmw093ts8u',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhj000lekvm5l5vhigm',
    expectedContentHashSha256:
      '8e6708da40739f99df69129b56b7756d1cae2c8ed28073b6fa9ae06e735a51a0',
    expectedTitle:
      'Feeding a Monster: Vest-afrikansk fiskemel i norsk laksefor',
    expectedSourceDocId: 'src-94',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-94',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-94 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex2v00wvzpvmi24d0g5n',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhl000mekvmou6qjq2j',
    expectedContentHashSha256:
      '3919af2f6c8efd4032d438e93d328a9ec33ad63cc9bb9851d5c745dfe24e92d0',
    expectedTitle:
      'Elintarvikemarkkinavaltuutettu toimintakertomus 2024',
    expectedSourceDocId: 'src-143',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-143',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-143 survives as the current inventory identity; retain the old title and analysis unchanged under the reviewed SourceDoc mirror contract.',
    protectedByContract:
      'reviewed-source-doc-identity-mirrors:2026-07-20-v1:stale-retained-immutable',
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3200wzzpvmvs578kw1',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhr000qekvmzurbh35d',
    expectedContentHashSha256:
      '21da0e5cc2d6ac3f936525122269e13eaf1889580ccce98440389878a0835874',
    expectedTitle: 'Naermaste konkurrent-analys: 290 kommuner',
    expectedSourceDocId: 'src-78',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-78',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-78 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3300x1zpvmgjqlruci',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhu000sekvmh125najl',
    expectedContentHashSha256:
      '172b7595ad53fc784f380350b1969835f72a04583a6aefbadc9831d3de94155e',
    expectedTitle:
      'Konkurrensverket rapport 2025:5 - livsmedelsutredningen',
    expectedSourceDocId: 'src-141',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-141',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-141 survives as the direct current inventory identity; independent Report and Document mirrors remain separate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3400x2zpvm40nckc6x',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnhv000tekvm8plly1pt',
    expectedContentHashSha256:
      '3a5156dda98e8389d358da7d313e0da1e90de83dde8ead9b68f64a52a34ce753',
    expectedTitle: 'KFST Evaluering af foedevarehandelsloven 2024',
    expectedSourceDocId: 'src-142',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-142',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-142 survives as the direct current inventory identity; independent Report and Document mirrors remain separate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3a00x7zpvmprj0e43w',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsni1000yekvmtkitik13',
    expectedContentHashSha256:
      '3078c10cc04f93acb14d671b4b28a11e72749908fa490c243d5c2b41cf57d582',
    expectedTitle: 'Handlingsplan for en sirkulaer okonomi 2024-2025',
    expectedSourceDocId: 'src-164',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-164',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-164 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3d00xazpvmh7kkkyl3',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsni70011ekvmnamdezrv',
    expectedContentHashSha256:
      '141546079ac0d7135744ab88a1a02f7a704297cd9522a6a6fb440f9c0346b750',
    expectedTitle:
      'Managing a Circular Food System in Sustainable Urban Farming. Experimental Research at the Turku University Campus (Finland)',
    expectedSourceDocId: 'src-154',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-154',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-154 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoex3k00xezpvmrilbkwrc',
    sourceKind: 'document',
    sourceKey: 'document:cmq8rsnie0015ekvmp52qy9il',
    expectedContentHashSha256:
      '816d757ee4050247db45d468f5533c9bb8a66598b9a7509b5b552f1cd676da60',
    expectedTitle:
      'Nested circularity in food systems: A Nordic case study on connecting biomass, nutrient and energy flows from field scale to continent',
    expectedSourceDocId: 'src-155',
    liveCounterpart: {
      sourceKind: 'source_doc',
      sourceKey: 'source_doc:src-155',
    },
    retentionReasonCode: 'document_projection_deleted_source_doc_survives',
    retentionReason:
      'The historical Document projection was deleted while SourceDoc src-155 survives as the current inventory identity; retain the old analysis without treating it as a live duplicate.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoexsm01cdzpvmqlyw100s',
    sourceKind: 'library_file',
    sourceKey:
      'library_file:research/bibliotek/sirkularitet/ks-veileder-sirkulaerokonomi-kommune-2022.md',
    expectedContentHashSha256:
      'f4d86c5078fd8f5e5feca63694a97b4a07274fbc1d24a522c2862aaa13238f9c',
    expectedTitle: 'ks veileder sirkulaerokonomi kommune 2022',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'document',
      sourceKey: 'document:cmql055pm00fl76vmaqrayd28',
    },
    retentionReasonCode: 'library_file_promoted_to_document',
    retentionReason:
      'The tracked Markdown file is now represented by an imported Document identity, so its earlier loose-library-file analysis is retained only as history.',
    protectedByContract: null,
  }),
  retainedEntry({
    retainedRecordId: 'cmqjoexth01cmzpvm0hi0ukhh',
    sourceKind: 'library_file',
    sourceKey:
      'library_file:research/bibliotek/sirkularitet/resource-regional-ressurskartlegging-metode-2026.md',
    expectedContentHashSha256:
      '8c3f134e2a5db9da033030922c659e4bbe2bf90be2cfb3cf48ec23605c9bf7d6',
    expectedTitle: 'resource regional ressurskartlegging metode 2026',
    expectedSourceDocId: null,
    liveCounterpart: {
      sourceKind: 'document',
      sourceKey: 'document:cmql055r100fu76vmnayvo70y',
    },
    retentionReasonCode: 'library_file_promoted_to_document',
    retentionReason:
      'The tracked Markdown file is now represented by an imported Document identity, so its earlier loose-library-file analysis is retained only as history.',
    protectedByContract: null,
  }),
] as const satisfies readonly LibraryAnalysisRetainedHistoryEntry[]

export const LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES = Object.freeze(
  [...RAW_LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES],
) as readonly LibraryAnalysisRetainedHistoryEntry[]

export const LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT = Object.freeze({
  version: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION,
  reviewContext: LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT,
  entries: LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES,
  policy: Object.freeze({
    disposition: 'retained_history',
    staleRowsExcludedFromLiveLedger: true,
    staleRowsDeleted: false,
    staleRowsRelinked: false,
    externalUseForRetainedRows: false,
    liveIdentityParityRequired: true,
    inventoryOnlyRowsAllowed: 0,
  }),
  boundary: Object.freeze({
    mutatesDatabase: false,
    mutatesRetainedRows: false,
    grantsEvidenceAppraisal: false,
    grantsExternalUse: false,
    projectionFreshnessUpdatesSeparate: true,
    managedRuntimeSourceDocsSeparate: true,
  }),
  reviewBasis:
    'A read-only identity comparison found exact live parity for 1555 current inventory rows plus 17 database-only LibraryAnalysisRecord rows retained by repository policy. The retained set is reviewed here by row ID, identity, source content hash, live counterpart and fail-closed usage boundary.',
})

export const LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256 =
  sha256ReviewedProvenanceJson(
    LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT,
  )

export const PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256 =
  '8cc74813bb3bac1434d07f8a5333d20b0136d955cf69c2b36acb3de8b24f03c4' as const

export function libraryAnalysisIdentityKey(
  identity: LibraryAnalysisCurrentIdentity,
): string {
  return `${identity.sourceKind}:${identity.sourceKey}`
}

export function validateLibraryAnalysisRetainedHistoryContract(
  entries: readonly LibraryAnalysisRetainedHistoryEntry[] =
    LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES,
): string[] {
  const issues: string[] = []
  if (entries.length !== 17) {
    issues.push(`retained-history contract must contain exactly 17 rows; found ${entries.length}`)
  }

  const ids = new Set<string>()
  const keys = new Set<string>()
  for (const entry of entries) {
    if (ids.has(entry.retainedRecordId)) {
      issues.push(`duplicate retained row id: ${entry.retainedRecordId}`)
    }
    ids.add(entry.retainedRecordId)
    if (keys.has(entry.retainedIdentityKey)) {
      issues.push(`duplicate retained identity: ${entry.retainedIdentityKey}`)
    }
    keys.add(entry.retainedIdentityKey)

    if (entry.retainedIdentityKey !== libraryAnalysisIdentityKey(entry)) {
      issues.push(`retained identity key mismatch: ${entry.retainedRecordId}`)
    }
    if (entry.liveCounterpart.identityKey !== libraryAnalysisIdentityKey(entry.liveCounterpart)) {
      issues.push(`live counterpart identity key mismatch: ${entry.retainedRecordId}`)
    }
    if (!/^[a-f0-9]{64}$/.test(entry.expectedContentHashSha256)) {
      issues.push(`invalid retained content hash: ${entry.retainedRecordId}`)
    }
    if (!entry.retentionReason.trim()) {
      issues.push(`missing retention reason: ${entry.retainedRecordId}`)
    }
    if (entry.externalUse !== false) {
      issues.push(`retained row permits external use: ${entry.retainedRecordId}`)
    }
    if (entry.expectedSourceDocId?.startsWith('src-yt-')) {
      issues.push(`managed-runtime SourceDoc leaked into retained-history contract: ${entry.retainedRecordId}`)
    }
  }

  if (
    entries === LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES &&
    LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256 !==
      PINNED_LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256
  ) {
    issues.push('retained-history contract hash does not match its pinned reviewed hash')
  }

  return issues
}

export function inspectLibraryAnalysisRetainedHistory(input: {
  currentInventory: readonly LibraryAnalysisCurrentIdentity[]
  databaseRows: readonly LibraryAnalysisRetainedHistoryDatabaseRow[]
  contractEntries?: readonly LibraryAnalysisRetainedHistoryEntry[]
}): LibraryAnalysisRetainedHistoryInspection {
  const entries = input.contractEntries ?? LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES
  const issues = validateLibraryAnalysisRetainedHistoryContract(entries)
  const currentByKey = uniqueIdentityMap(input.currentInventory, 'current inventory', issues)
  const databaseByKey = uniqueIdentityMap(input.databaseRows, 'database', issues)
  const databaseById = new Map<string, LibraryAnalysisRetainedHistoryDatabaseRow>()
  for (const row of input.databaseRows) {
    if (databaseById.has(row.id)) issues.push(`database contains duplicate row id: ${row.id}`)
    databaseById.set(row.id, row)
  }

  const retainedRows = input.databaseRows.filter(
    (row) => !currentByKey.has(libraryAnalysisIdentityKey(row)),
  )
  const inventoryOnlyRows = input.currentInventory.filter(
    (row) => !databaseByKey.has(libraryAnalysisIdentityKey(row)),
  )
  const contractById = new Map(entries.map((entry) => [entry.retainedRecordId, entry]))

  for (const row of retainedRows) {
    if (!contractById.has(row.id)) {
      issues.push(`unreviewed retained database row: ${row.id}:${libraryAnalysisIdentityKey(row)}`)
    }
  }
  for (const entry of entries) {
    const row = databaseById.get(entry.retainedRecordId)
    if (!row) {
      issues.push(`missing retained database row: ${entry.retainedRecordId}`)
      continue
    }
    validateDatabaseRow(entry, row, issues)
    if (currentByKey.has(entry.retainedIdentityKey)) {
      issues.push(`retained identity unexpectedly returned to live inventory: ${entry.retainedIdentityKey}`)
    }
    if (!currentByKey.has(entry.liveCounterpart.identityKey)) {
      issues.push(`live counterpart missing from current inventory: ${entry.liveCounterpart.identityKey}`)
    }
    if (!databaseByKey.has(entry.liveCounterpart.identityKey)) {
      issues.push(`live counterpart missing from persisted rows: ${entry.liveCounterpart.identityKey}`)
    }
  }
  for (const row of inventoryOnlyRows) {
    issues.push(`current inventory identity is not materialized: ${libraryAnalysisIdentityKey(row)}`)
  }

  const missingCounterpartRows = entries.filter(
    (entry) =>
      !currentByKey.has(entry.liveCounterpart.identityKey) ||
      !databaseByKey.has(entry.liveCounterpart.identityKey),
  ).length

  return Object.freeze({
    issues: Object.freeze([...issues]),
    retainedRows: Object.freeze([...retainedRows]),
    summary: Object.freeze({
      contractRows: entries.length,
      currentInventoryRows: input.currentInventory.length,
      persistedRows: input.databaseRows.length,
      livePersistedRows: input.databaseRows.length - retainedRows.length,
      retainedHistoryRows: retainedRows.length,
      inventoryOnlyRows: inventoryOnlyRows.length,
      missingCounterpartRows,
    }),
  })
}

function validateDatabaseRow(
  entry: LibraryAnalysisRetainedHistoryEntry,
  row: LibraryAnalysisRetainedHistoryDatabaseRow,
  issues: string[],
) {
  const expected: Array<[string, unknown, unknown]> = [
    ['sourceKind', entry.sourceKind, row.sourceKind],
    ['sourceKey', entry.sourceKey, row.sourceKey],
    ['documentId', entry.expectedDocumentId, row.documentId],
    ['sourceDocId', entry.expectedSourceDocId, row.sourceDocId],
    ['title', entry.expectedTitle, row.title],
    ['status', entry.expectedStatus, row.status],
    ['usageRule', entry.expectedUsageRule, row.usageRule],
    ['reviewStatus', entry.expectedReviewStatus, row.reviewStatus],
    ['contentHash', entry.expectedContentHashSha256, row.contentHash],
    ['reviewedAt', entry.expectedReviewedAt, normalizeNullableDate(row.reviewedAt)],
    ['reviewer', entry.expectedReviewer, row.reviewer],
    ['claimCandidateCount', entry.expectedClaimCandidateCount, claimCandidateCount(row.claimCandidates)],
  ]
  for (const [field, expectedValue, actualValue] of expected) {
    if (expectedValue !== actualValue) {
      issues.push(
        `retained row ${entry.retainedRecordId} ${field} mismatch: expected ${JSON.stringify(expectedValue)}, found ${JSON.stringify(actualValue)}`,
      )
    }
  }
  if (entry.externalUse === false && row.usageRule === 'safe_for_external_claims') {
    issues.push(`retained row is externally enabled: ${entry.retainedRecordId}`)
  }
}

function uniqueIdentityMap<T extends LibraryAnalysisCurrentIdentity>(
  rows: readonly T[],
  label: string,
  issues: string[],
): Map<string, T> {
  const result = new Map<string, T>()
  for (const row of rows) {
    const key = libraryAnalysisIdentityKey(row)
    if (result.has(key)) issues.push(`${label} contains duplicate identity: ${key}`)
    result.set(key, row)
  }
  return result
}

function normalizeNullableDate(value: Date | string | null): string | null {
  if (value === null) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString()
}

function claimCandidateCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}
