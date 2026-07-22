import { readFileSync, readdirSync, statSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { parseCsvRecords } from '../src/lib/csv'

// DB-fri generator for masterhjerne-statusen (/masterhjerne).
// Leser kun komitterte artefakter og research-filer; manglende kilder gir null-seksjoner
// med advarsel (fail-closed), aldri oppdiktede tall.

const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'data', 'masterhjerne')
const OUT_FILE = join(OUT_DIR, 'status.json')

type SourceRef = {
  id: string
  path: string
  modifiedAt: string | null
  ok: boolean
  note?: string
}

type MasterhjerneStatus = {
  generatedAt: string
  sources: SourceRef[]
  warnings: string[]
  bibliotek: {
    total: number
    byStatus: Record<string, number>
    byUsageRule: Record<string, number>
    missingText: number
    claimCandidates: number
  } | null
  akademisk: {
    auditGeneratedAt: string | null
    reports: number
    theses: number
    sourceDocs: number
    totalRows: number
    regressionGate: string | null
    externalReadiness: string | null
    coverage: { set: string; key: string; label: string; present: number; total: number; pct: number }[]
  } | null
  siterbarhet: {
    fieldCitations: number | null
    sourceCitations: number | null
    citableExternal: number | null
    citableWithNote: number | null
    internalContext: number | null
    blockedUnsourced: number | null
    acceptanceReady: number | null
    acceptanceTotal: number | null
  } | null
  dekning: {
    reportFile: string
    totalMapped: number
    totalUniverse: number
    cells: number
    confidence: Record<string, number>
    domains: { domain: string; mapped: number; universe: number }[]
    openGaps: { domain: string; subdomain: string; mapped: number; universe: number; gap: number }[]
  } | null
  kiKorpus: {
    n: number
    meanScore: number
    byYear: Record<string, number>
    byGroup: Record<string, number>
    share2023PlusPct: number
  } | null
  urlHelse: {
    checked: number
    ok: number
    blocked: number
    dead: number
    other: number
    highPriorityChecked: number
    highPriorityDead: number
    highPriorityBlocked: number
  } | null
  pdfKatalog: { count: number; pages: number } | null
  vaultExport: {
    generatedAt: string | null
    companies: number
    ownershipEdges: number
    boardMembers: number
    businessRelationships: number
    properties: number
  } | null
  subsidier: { total: number; computedAt: string | null } | null
  missions: { file: string; total: number; byStatus: Record<string, number> } | null
}

const warnings: string[] = []
const sources: SourceRef[] = []

function track(id: string, relPath: string, note?: string): string | null {
  const abs = join(ROOT, relPath)
  if (!existsSync(abs)) {
    sources.push({ id, path: relPath, modifiedAt: null, ok: false, note })
    warnings.push(`Mangler kilde: ${relPath} (${id})`)
    return null
  }
  const mtime = statSync(abs).mtime.toISOString()
  sources.push({ id, path: relPath, modifiedAt: mtime, ok: true, note })
  return abs
}

function newestMatching(dir: string, pattern: RegExp): string | null {
  const abs = join(ROOT, dir)
  if (!existsSync(abs)) return null
  const hits = readdirSync(abs).filter((name) => pattern.test(name)).sort()
  if (hits.length === 0) return null
  return join(dir, hits[hits.length - 1])
}

function count<T>(rows: T[], key: (row: T) => string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const row of rows) {
    const k = key(row)
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}

function readBibliotek(): MasterhjerneStatus['bibliotek'] {
  const abs = track('bibliotek-ledger', 'research/_status/library-analysis-ledger.jsonl')
  if (!abs) return null
  const rows = readFileSync(abs, 'utf-8')
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as { status?: string; usageRule?: string; riskFlags?: string[]; claimCandidateCount?: number })
  let missingText = 0
  let claimCandidates = 0
  for (const row of rows) {
    if ((row.riskFlags ?? []).includes('low_text_quality')) missingText += 1
    claimCandidates += row.claimCandidateCount ?? 0
  }
  return {
    total: rows.length,
    byStatus: count(rows, (row) => row.status ?? 'ukjent'),
    byUsageRule: count(rows, (row) => row.usageRule ?? 'ukjent'),
    missingText,
    claimCandidates,
  }
}

// Feltene fra evidenskvalitetsauditen som vises på siden.
const ACADEMIC_COVERAGE_KEYS = new Set([
  'year',
  'institution',
  'attribution',
  'author',
  'source_url',
  'url',
  'access_date',
  'accessed_at',
  'doi',
  'persistent_identifier',
  'archived_url',
  'appraisal_status',
  'structured_appraisal',
])

function readAkademisk(): MasterhjerneStatus['akademisk'] {
  const abs = track('akademisk-audit', 'research/_status/academic-source-quality-status.json')
  if (!abs) return null
  type AuditCoverageRow = { set: string; key: string; label: string; present: number; total: number; pct: number }
  type AuditJson = {
    generatedAt?: string
    scope?: { reportRows?: number; thesisRows?: number; sourceDocRows?: number; database?: { counts?: { reportRows?: number; thesisRows?: number; sourceDocRows?: number; totalRows?: number }; coverage?: AuditCoverageRow[] } }
    regressionGate?: { status?: string }
    externalReadiness?: { status?: string }
  }
  const audit = JSON.parse(readFileSync(abs, 'utf-8')) as AuditJson
  const dbCounts = audit.scope?.database?.counts ?? {}
  const coverage = (audit.scope?.database?.coverage ?? [])
    .filter((row) => ACADEMIC_COVERAGE_KEYS.has(row.key))
    .map(({ set, key, label, present, total, pct }) => ({ set, key, label, present, total, pct: Math.round(pct * 10) / 10 }))
  return {
    auditGeneratedAt: audit.generatedAt ?? null,
    reports: dbCounts.reportRows ?? audit.scope?.reportRows ?? 0,
    theses: dbCounts.thesisRows ?? audit.scope?.thesisRows ?? 0,
    sourceDocs: dbCounts.sourceDocRows ?? audit.scope?.sourceDocRows ?? 0,
    totalRows: dbCounts.totalRows ?? 0,
    regressionGate: audit.regressionGate?.status ?? null,
    externalReadiness: audit.externalReadiness?.status ?? null,
    coverage,
  }
}

function readSiterbarhet(): MasterhjerneStatus['siterbarhet'] {
  const abs = track(
    'citable-status',
    'research/CITABLE-KNOWLEDGE-BASE-STATUS.md',
    'Tall leses fra dokumentets øverste, eksplisitt supersederende live-readback'
  )
  if (!abs) return null
  const text = readFileSync(abs, 'utf-8')
  const grab = (name: string): number | null => {
    const matches = [...text.matchAll(new RegExp('`' + name + '=(\\d+)`', 'g'))]
    if (matches.length === 0) {
      warnings.push(`Fant ikke ${name}= i CITABLE-KNOWLEDGE-BASE-STATUS.md`)
      return null
    }
    return Number(matches[0][1])
  }
  const acceptance = text.match(/(\d+) of (\d+) cite-ready/)
  if (!acceptance) warnings.push('Fant ikke acceptance-pack-status i CITABLE-KNOWLEDGE-BASE-STATUS.md')
  return {
    fieldCitations: grab('FieldCitation'),
    sourceCitations: grab('SourceCitation'),
    citableExternal: grab('citable_external'),
    citableWithNote: grab('citable_with_note'),
    internalContext: grab('internal_context'),
    blockedUnsourced: grab('blocked_unsourced'),
    acceptanceReady: acceptance ? Number(acceptance[1]) : null,
    acceptanceTotal: acceptance ? Number(acceptance[2]) : null,
  }
}

function readDekning(): MasterhjerneStatus['dekning'] {
  const rel = newestMatching('research/_status', /^domene-dekning-hull-\d{4}-\d{2}-\d{2}\.md$/)
  if (!rel) {
    warnings.push('Fant ingen domene-dekning-hull-*.md i research/_status')
    sources.push({ id: 'domene-dekning', path: 'research/_status/domene-dekning-hull-*.md', modifiedAt: null, ok: false })
    return null
  }
  const abs = track('domene-dekning', rel, 'Nyeste hull-rapport (etter filnavn-dato)')
  if (!abs) return null
  const domains = new Map<string, { mapped: number; universe: number }>()
  const confidence: Record<string, number> = {}
  const openGaps: { domain: string; subdomain: string; mapped: number; universe: number; gap: number }[] = []
  let cells = 0
  for (const line of readFileSync(abs, 'utf-8').split('\n')) {
    if (!line.startsWith('| ')) continue
    const parts = line.split('|').map((part) => part.trim())
    // | domene | underdomene | geo | univers | kartlagt | hull | konfidens |
    if (parts.length < 8 || parts[1] === 'Domene' || parts[1].startsWith('---')) continue
    const universe = Number(parts[4])
    const mapped = Number(parts[5])
    if (!Number.isFinite(universe) || !Number.isFinite(mapped)) continue
    cells += 1
    const domain = parts[1]
    const entry = domains.get(domain) ?? { mapped: 0, universe: 0 }
    entry.mapped += mapped
    entry.universe += universe
    domains.set(domain, entry)
    const conf = parts[7] || 'ukjent'
    confidence[conf] = (confidence[conf] ?? 0) + 1
    const gap = Number(parts[6])
    if (Number.isFinite(gap) && gap > 0) {
      openGaps.push({ domain, subdomain: parts[2], mapped, universe, gap })
    }
  }
  openGaps.sort((a, b) => b.gap - a.gap)
  const domainRows = [...domains.entries()]
    .map(([domain, value]) => ({ domain, ...value }))
    .sort((a, b) => b.mapped - a.mapped)
  return {
    reportFile: rel,
    totalMapped: domainRows.reduce((sum, row) => sum + row.mapped, 0),
    totalUniverse: domainRows.reduce((sum, row) => sum + row.universe, 0),
    cells,
    confidence,
    domains: domainRows,
    openGaps,
  }
}

const KI_GROUPS: Record<string, string> = {
  master: 'akademisk',
  phd: 'akademisk',
  akademia: 'akademisk',
  offentlig: 'offentlig-tilsyn',
  konkurransetilsyn: 'offentlig-tilsyn',
  nou: 'offentlig-tilsyn',
  juridisk: 'offentlig-tilsyn',
  beredskap: 'offentlig-tilsyn',
  bransje: 'bransje',
}

function readKiKorpus(): MasterhjerneStatus['kiKorpus'] {
  const abs = track('ki-priority', 'research/KI-PRIORITY.csv')
  if (!abs) return null
  const rows = parseCsvRecords(readFileSync(abs, 'utf-8'))
  const byYear: Record<string, number> = {}
  const byGroup: Record<string, number> = {}
  let scoreSum = 0
  let scored = 0
  let recent = 0
  for (const row of rows) {
    const year = Number(row.year)
    if (Number.isFinite(year) && year > 1900) {
      byYear[String(year)] = (byYear[String(year)] ?? 0) + 1
      if (year >= 2023) recent += 1
    }
    const score = Number(row.score)
    if (Number.isFinite(score)) {
      scoreSum += score
      scored += 1
    }
    const group = KI_GROUPS[row.category ?? ''] ?? 'ovrig'
    byGroup[group] = (byGroup[group] ?? 0) + 1
  }
  return {
    n: rows.length,
    meanScore: scored > 0 ? Math.round((scoreSum / scored) * 100) / 100 : 0,
    byYear,
    byGroup,
    share2023PlusPct: rows.length > 0 ? Math.round((recent / rows.length) * 1000) / 10 : 0,
  }
}

function readUrlHelse(): MasterhjerneStatus['urlHelse'] {
  const abs = track('url-health', 'research/URL-HEALTH.csv')
  if (!abs) return null
  const rows = parseCsvRecords(readFileSync(abs, 'utf-8'))
  const byClass = count(rows, (row) => row.classification ?? 'ukjent')
  const high = rows.filter((row) => Number(row.source_priority) >= 4)
  const known = (byClass.ok ?? 0) + (byClass.blocked ?? 0) + (byClass.dead ?? 0)
  return {
    checked: rows.length,
    ok: byClass.ok ?? 0,
    blocked: byClass.blocked ?? 0,
    dead: byClass.dead ?? 0,
    other: rows.length - known,
    highPriorityChecked: high.length,
    highPriorityDead: high.filter((row) => row.classification === 'dead').length,
    highPriorityBlocked: high.filter((row) => row.classification === 'blocked').length,
  }
}

function readPdfKatalog(): MasterhjerneStatus['pdfKatalog'] {
  const abs = track('pdf-katalog', 'research/pdf-katalog.json')
  if (!abs) return null
  const items = JSON.parse(readFileSync(abs, 'utf-8')) as { pages?: number }[]
  return {
    count: items.length,
    pages: items.reduce((sum, item) => sum + (item.pages ?? 0), 0),
  }
}

function readVaultExport(): MasterhjerneStatus['vaultExport'] {
  const abs = track('vault-export', 'data/vault-export/manifest.json')
  if (!abs) return null
  const manifest = JSON.parse(readFileSync(abs, 'utf-8')) as {
    generatedAt?: string
    counts?: { companies?: number; ownershipEdges?: number; boardMembers?: number; businessRelationships?: number; properties?: number }
  }
  return {
    generatedAt: manifest.generatedAt ?? null,
    companies: manifest.counts?.companies ?? 0,
    ownershipEdges: manifest.counts?.ownershipEdges ?? 0,
    boardMembers: manifest.counts?.boardMembers ?? 0,
    businessRelationships: manifest.counts?.businessRelationships ?? 0,
    properties: manifest.counts?.properties ?? 0,
  }
}

function readSubsidier(): MasterhjerneStatus['subsidier'] {
  const abs = track('coverage-profiles', 'public/data/coverage/profiles.json')
  if (!abs) return null
  const payload = JSON.parse(readFileSync(abs, 'utf-8')) as {
    computedAt?: string
    profiles?: { datasetId?: string; verification?: { total?: number } }[]
  }
  const subsidyProfile = (payload.profiles ?? []).find((profile) => profile.datasetId === 'produksjonstilskudd')
  if (!subsidyProfile) {
    warnings.push('Fant ikke produksjonstilskudd-profilen i coverage/profiles.json')
    return null
  }
  return {
    total: subsidyProfile.verification?.total ?? 0,
    computedAt: payload.computedAt ?? null,
  }
}

function readMissions(): MasterhjerneStatus['missions'] {
  const rel = newestMatching('research/_status', /^food-tg-research-backlog-\d{4}-\d{2}-\d{2}\.csv$/)
  if (!rel) {
    warnings.push('Fant ingen food-tg-research-backlog-*.csv i research/_status')
    sources.push({ id: 'mission-backlog', path: 'research/_status/food-tg-research-backlog-*.csv', modifiedAt: null, ok: false })
    return null
  }
  const abs = track('mission-backlog', rel, 'Nyeste backlog (etter filnavn-dato)')
  if (!abs) return null
  const rows = parseCsvRecords(readFileSync(abs, 'utf-8'))
  return {
    file: rel,
    total: rows.length,
    byStatus: count(rows, (row) => row.status ?? 'ukjent'),
  }
}

function main() {
  const status: MasterhjerneStatus = {
    generatedAt: new Date().toISOString(),
    sources,
    warnings,
    bibliotek: readBibliotek(),
    akademisk: readAkademisk(),
    siterbarhet: readSiterbarhet(),
    dekning: readDekning(),
    kiKorpus: readKiKorpus(),
    urlHelse: readUrlHelse(),
    pdfKatalog: readPdfKatalog(),
    vaultExport: readVaultExport(),
    subsidier: readSubsidier(),
    missions: readMissions(),
  }

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(OUT_FILE, JSON.stringify(status, null, 2) + '\n')

  const sectionCount = Object.entries(status).filter(([key, value]) => !['generatedAt', 'sources', 'warnings'].includes(key) && value !== null).length
  console.log(`masterhjerne-status: ${sectionCount}/10 seksjoner beregnet -> public/data/masterhjerne/status.json`)
  if (status.dekning) console.log(`  dekning: ${status.dekning.totalMapped}/${status.dekning.totalUniverse} aktorer (${status.dekning.cells} celler, ${status.dekning.reportFile})`)
  if (status.bibliotek) console.log(`  bibliotek: ${status.bibliotek.total} kilder (${status.bibliotek.byStatus.approved_internal ?? 0} godkjent for KI-kontekst)`)
  for (const warning of warnings) console.warn(`  ADVARSEL: ${warning}`)
}

main()
