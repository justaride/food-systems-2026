export const LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH =
  'research/_status/library-analysis-decision-queue.md'
export const LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH =
  'research/_status/library-analysis-decision-queue.json'

export type LibraryAnalysisDecisionKind =
  | 'manual_source_fetch'
  | 'mechanical_url_repair_candidate'
  | 'seeded_report_decision'
  | 'short_summary_curation'
  | 'transcript_refetch_or_drop'

export type LibraryAnalysisDecisionLane =
  | 'curation_decision'
  | 'manual_source_hunt'
  | 'mechanical_repair'
  | 'transcript_repair'

export type LibraryAnalysisDecisionPriority = 'P1' | 'P2' | 'P3'

export type LibraryAnalysisDecisionQueueInput = {
  sourceKey: string
  title: string
  repairKind: string
  repairBatch: string
  wordCount: number
  canonicalPath: string | null
  url: string | null
  urlExtractionStatus: string | null
  localRepairAction: string | null
}

export type LibraryAnalysisDecisionQueueRow = LibraryAnalysisDecisionQueueInput & {
  decisionKind: LibraryAnalysisDecisionKind
  decisionLane: LibraryAnalysisDecisionLane
  priority: LibraryAnalysisDecisionPriority
  mechanicalUpdateCandidate: boolean
  recommendedAction: string
  aiContextNote: string
  claimUseNote: string
  externalUseNote: string
}

export type LibraryAnalysisDecisionQueue = {
  generatedAt: string
  total: number
  rows: LibraryAnalysisDecisionQueueRow[]
  summary: {
    byDecisionKind: Record<string, number>
    byDecisionLane: Record<string, number>
    byPriority: Record<string, number>
    byRepairBatch: Record<string, number>
    byUrlExtractionStatus: Record<string, number>
    byLocalRepairAction: Record<string, number>
    mechanicalUpdateCandidates: number
  }
}

export type BuildLibraryAnalysisDecisionQueueOptions = {
  generatedAt?: string
}

export type FormatLibraryAnalysisDecisionQueueMarkdownOptions = {
  jsonPath?: string
  sampleLimit?: number
}

export function buildLibraryAnalysisDecisionQueue(
  rows: LibraryAnalysisDecisionQueueInput[],
  options: BuildLibraryAnalysisDecisionQueueOptions = {},
): LibraryAnalysisDecisionQueue {
  const queueRows = rows
    .map(toDecisionRow)
    .sort(compareDecisionRows)

  return {
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    total: queueRows.length,
    rows: queueRows,
    summary: {
      byDecisionKind: countBy(queueRows, row => row.decisionKind),
      byDecisionLane: countBy(queueRows, row => row.decisionLane),
      byPriority: countBy(queueRows, row => row.priority),
      byRepairBatch: countBy(queueRows, row => row.repairBatch),
      byUrlExtractionStatus: countBy(queueRows, row => row.urlExtractionStatus ?? 'none'),
      byLocalRepairAction: countBy(queueRows, row => row.localRepairAction ?? 'none'),
      mechanicalUpdateCandidates: queueRows.filter(row => row.mechanicalUpdateCandidate).length,
    },
  }
}

export function formatLibraryAnalysisDecisionQueueMarkdown(
  queue: LibraryAnalysisDecisionQueue,
  options: FormatLibraryAnalysisDecisionQueueMarkdownOptions = {},
): string {
  const jsonPath = options.jsonPath ?? LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH
  const sampleLimit = options.sampleLimit ?? 100
  const sampleRows = queue.rows.slice(0, sampleLimit)

  return [
    '# Library Analysis Decision Queue',
    '',
    `Generated: ${queue.generatedAt}`,
    '',
    'Dette er en read-only beslutningsko for library-analysis-rader der mekanisk tekst-/koblingsreparasjon er tomt eller utilstrekkelig. Dette er ikke en claim-ko, oppgraderer ikke AI-kontekst, og endrer ikke citation-readiness.',
    '',
    '## Bruksgrenser',
    '',
    '- Manuell kildehenting: finn fulltekst, bedre URL, PDF eller kontrollerbar lokal kilde foer ny repair/prosess-kjoring.',
    '- Kurateringsbeslutning: avklar om kort rad skal beholdes som intern stub, utvides med kilder, eller parkeres.',
    '- AI-kontekst: rader her er ikke safe_for_ai_context foer ny library-analysis-prosess har fjernet risikoflagg.',
    '- Claim-bruk: ingen claim-kandidat uten PCQ/claim-lock, gate:overclaim og audit:citable.',
    '',
    `Full radliste: \`${jsonPath}\``,
    '',
    '## Sammendrag',
    '',
    '| Metric | Count |',
    '|---|---:|',
    `| Total decision rows | ${queue.total} |`,
    `| Mechanical update candidates | ${queue.summary.mechanicalUpdateCandidates} |`,
    '',
    '### Decision Kind',
    '',
    formatCountTable(queue.summary.byDecisionKind),
    '',
    '### Decision Lane',
    '',
    formatCountTable(queue.summary.byDecisionLane),
    '',
    '### Priority',
    '',
    formatCountTable(queue.summary.byPriority),
    '',
    '### Repair Batch',
    '',
    formatCountTable(queue.summary.byRepairBatch),
    '',
    '### URL Extraction Status',
    '',
    formatCountTable(queue.summary.byUrlExtractionStatus),
    '',
    '### Local Repair Action',
    '',
    formatCountTable(queue.summary.byLocalRepairAction),
    '',
    '## Prioritert utvalg',
    '',
    `Rows shown below: ${sampleRows.length} of ${queue.total}`,
    '',
    '| Priority | Decision | Lane | Repair batch | Words | URL status | Local action | Title | Path/source | Action |',
    '|---|---|---|---|---:|---|---|---|---|---|',
    ...sampleRows.map(row => `| ${[
      row.priority,
      row.decisionKind,
      row.decisionLane,
      row.repairBatch,
      String(row.wordCount),
      row.urlExtractionStatus ?? '',
      row.localRepairAction ?? '',
      escapeMarkdownCell(row.title),
      escapeMarkdownCell(row.canonicalPath ?? row.url ?? ''),
      escapeMarkdownCell(row.recommendedAction),
    ].join(' | ')} |`),
    '',
  ].join('\n')
}

function toDecisionRow(row: LibraryAnalysisDecisionQueueInput): LibraryAnalysisDecisionQueueRow {
  const decision = classifyDecision(row)
  return {
    ...row,
    ...decision,
    recommendedAction: recommendedActionFor(row, decision.decisionKind),
    aiContextNote: aiContextNoteFor(decision.decisionKind),
    claimUseNote: 'Ingen claim-bruk foer separat PCQ/claim-lock, gate:overclaim og audit:citable for konkret utsagn.',
    externalUseNote: 'Ikke ekstern publiserbar bruk fra denne koen; den er en intern reparasjons- og kurateringsflate.',
  }
}

function classifyDecision(row: LibraryAnalysisDecisionQueueInput): {
  decisionKind: LibraryAnalysisDecisionKind
  decisionLane: LibraryAnalysisDecisionLane
  priority: LibraryAnalysisDecisionPriority
  mechanicalUpdateCandidate: boolean
} {
  if (row.localRepairAction === 'update' || isExtractableUrlStatus(row.urlExtractionStatus)) {
    return {
      decisionKind: 'mechanical_url_repair_candidate',
      decisionLane: 'mechanical_repair',
      priority: 'P1',
      mechanicalUpdateCandidate: true,
    }
  }

  if (row.repairKind === 'seeded_report_stub' || row.repairBatch.startsWith('seeded_')) {
    return {
      decisionKind: 'seeded_report_decision',
      decisionLane: 'curation_decision',
      priority: 'P2',
      mechanicalUpdateCandidate: false,
    }
  }

  if (row.repairBatch === 'existing_transcript_fragment_review') {
    return {
      decisionKind: 'transcript_refetch_or_drop',
      decisionLane: 'transcript_repair',
      priority: 'P2',
      mechanicalUpdateCandidate: false,
    }
  }

  if (
    row.repairBatch === 'existing_source_locator_stub_review' ||
    row.repairBatch === 'url_backed_text_extraction'
  ) {
    return {
      decisionKind: 'manual_source_fetch',
      decisionLane: 'manual_source_hunt',
      priority: 'P1',
      mechanicalUpdateCandidate: false,
    }
  }

  return {
    decisionKind: 'short_summary_curation',
    decisionLane: 'curation_decision',
    priority: 'P2',
    mechanicalUpdateCandidate: false,
  }
}

function recommendedActionFor(
  row: LibraryAnalysisDecisionQueueInput,
  decisionKind: LibraryAnalysisDecisionKind,
): string {
  if (decisionKind === 'mechanical_url_repair_candidate') {
    return 'Kjor kontrollert repair-plan med backup, regenerer library-analysis, og behold claim-lock uendret.'
  }
  if (decisionKind === 'manual_source_fetch') {
    return 'Finn fulltekst eller bedre kilde-lokator, legg den inn som kontrollert lokal/URL-kilde, og kjor repair/prosess paa nytt.'
  }
  if (decisionKind === 'seeded_report_decision') {
    return 'Avklar om seedet rad skal beholdes som intern syntese/register, kobles til kontrollerte kilder, eller parkeres som ikke-citable.'
  }
  if (decisionKind === 'transcript_refetch_or_drop') {
    return 'Hent komplett transkripsjon eller marker fragmentet som ikke nok tekst for AI-kontekst.'
  }
  if (row.wordCount >= 100) {
    return 'Kurater som kort sammendrag: behold intern bakgrunn, utvid manuelt ved prioritet, men ikke oppgrader uten kilder.'
  }
  return 'Vurder om kortnotatet skal utvides, knyttes til kilde, eller tas ut av analyseflaten.'
}

function aiContextNoteFor(decisionKind: LibraryAnalysisDecisionKind): string {
  if (decisionKind === 'mechanical_url_repair_candidate') {
    return 'Kan vurderes for safe_for_ai_context foerst etter vellykket repair og ny library-analysis-prosess.'
  }
  return 'Behold som internal_background; ikke safe_for_ai_context uten ny tekst/lokator og regenerert library-analysis.'
}

function isExtractableUrlStatus(status: string | null): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
}

function compareDecisionRows(
  a: LibraryAnalysisDecisionQueueRow,
  b: LibraryAnalysisDecisionQueueRow,
): number {
  const priorityOrder: Record<LibraryAnalysisDecisionPriority, number> = {
    P1: 0,
    P2: 1,
    P3: 2,
  }
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
  if (priorityDiff !== 0) return priorityDiff
  const kindDiff = a.decisionKind.localeCompare(b.decisionKind)
  if (kindDiff !== 0) return kindDiff
  const wordDiff = a.wordCount - b.wordCount
  if (wordDiff !== 0) return wordDiff
  return a.sourceKey.localeCompare(b.sourceKey)
}

function countBy<T>(rows: T[], key: (row: T) => string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = key(row)
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function formatCountTable(counts: Record<string, number>): string {
  const entries = Object.entries(counts)
  if (entries.length === 0) return '_Ingen rader._'
  return [
    '| Value | Count |',
    '|---|---:|',
    ...entries.map(([value, count]) => `| ${escapeMarkdownCell(value)} | ${count} |`),
  ].join('\n')
}

function escapeMarkdownCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ')
}
