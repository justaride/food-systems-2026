import 'dotenv/config'
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { join, relative, sep } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports as seedReports } from '../prisma/seed-data/reports'
import {
  candidateLocalFilePaths,
  normalizeLocalFileLocator,
} from '../src/lib/local-file-locator'
import { hasSourceDocLocator } from '../src/lib/source-doc-locator'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

type ProblemType =
  | 'orphan_file'
  | 'missing_file_document'
  | 'missing_file_sourcedoc'
  | 'broken_supportingsource'
  | 'report_no_analytical_link'
  | 'duplicate_file_separate_records'

type Finding = {
  ref: string
  entityType: string
  problem: ProblemType
  severity: Severity
  suggestedAction: string
  priority: number | null
}

const ROOT = process.cwd()
const RESEARCH_DIR = join(ROOT, 'research')

const PRIMARY_DIRS = ['evidence-pack', 'bibliotek']
const ARCHIVE_DIRS = ['arkiv-sortert', 'pdf-downloads-20-04-26', 'perpl 17.03', 'perpl-17-03', 'perplexity-20-04-26', 'pdf-katalog.json', 'seed-pdf-map.json']

// Skip docs and meta files when scanning for orphans (these are inventory/process files,
// not source content that should be linked from DB).
const SCAN_SKIP_FILES = new Set([
  'README.md',
  'ARKIV-INDEX.md',
  'DATA-READINESS-STATUS.md',
  'DESK-RESEARCH-PLAN.md',
  'DISCOVERY-MANIFEST.md',
  'DOWNLOAD-QUEUE.md',
  'DOWNLOAD-RESULTAT.md',
  'INCOMING-SOURCES.md',
  'KI-PRIORITY.md',
  'MANUELL-NEDLASTING-P1.md',
  'ORPHAN-REVIEW.md',
  'PDF-KATALOG.md',
  'PLATTFORM-KOBLING.md',
  'REPORT-SOURCEURL-GAP-13.md',
  'RESEARCH-AUDIT.md',
  'RESEARCH-EXECUTION-PLAN.md',
  'RESEARCH-MISSIONS.md',
  'VERDIKJEDE-KARTLEGGING-PLAN.md',
  'FILE-COVERAGE.md',
])

// Skip whole subtrees that are known to be working state (not canonical source layer).
const SCAN_SKIP_SUBTREES = ['_plans', '_status', 'intake']

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function walkResearch(): string[] {
  const out: string[] = []
  function walk(dir: string) {
    let entries: string[]
    try {
      entries = readdirSync(dir)
    } catch {
      return
    }
    for (const name of entries) {
      const full = join(dir, name)
      const rel = relative(RESEARCH_DIR, full)
      const topSegment = rel.split(sep)[0]
      if (SCAN_SKIP_SUBTREES.includes(topSegment)) continue
      const st = statSync(full)
      if (st.isDirectory()) {
        walk(full)
      } else if (st.isFile()) {
        if (!/\.(pdf|md)$/i.test(name)) continue
        if (SCAN_SKIP_FILES.has(name)) continue
        out.push(rel)
      }
    }
  }
  walk(RESEARCH_DIR)
  return out
}

function topDir(rel: string): string {
  return rel.split(sep)[0] ?? ''
}

function isPrimary(rel: string): boolean {
  return PRIMARY_DIRS.includes(topDir(rel))
}

function isArchive(rel: string): boolean {
  return ARCHIVE_DIRS.includes(topDir(rel))
}

function loadPriorityMap(): Map<string, number> {
  const map = new Map<string, number>()
  const path = join(RESEARCH_DIR, 'KI-PRIORITY.csv')
  if (!existsSync(path)) return map
  const text = readFileSync(path, 'utf-8')
  const lines = text.split('\n').slice(1)
  for (const line of lines) {
    if (!line.trim()) continue
    // simple CSV: type,id,score,...
    const cols = line.split(',')
    const id = cols[1]
    const score = parseFloat(cols[2])
    if (id && Number.isFinite(score)) map.set(id, score)
  }
  return map
}

function severityFromPriority(score: number | null, fallback: Severity): Severity {
  if (score !== null) {
    if (score >= 4.0) return 'HIGH'
    if (score >= 3.0) return 'MEDIUM'
    return 'LOW'
  }
  return fallback
}

type PdfCatalogEntry = { rel: string; sha256: string }
function loadPdfCatalog(): PdfCatalogEntry[] {
  const path = join(RESEARCH_DIR, 'pdf-katalog.json')
  if (!existsSync(path)) return []
  const data = JSON.parse(readFileSync(path, 'utf-8'))
  if (!Array.isArray(data)) return []
  return data
    .map((d: Record<string, unknown>) => ({
      rel: String(d.rel ?? ''),
      sha256: String(d.sha256 ?? ''),
    }))
    .filter((d) => d.rel && d.sha256)
}

function normalizeReferencedPath(p: string | null | undefined): string {
  const locator = normalizeLocalFileLocator(p)
  if (!locator) return ''
  let s = locator
  if (s.startsWith('research/')) s = s.slice('research/'.length)
  return s
}

function localFileExists(p: string | null | undefined): boolean {
  return candidateLocalFilePaths(p, ROOT).some((path) => existsSync(path))
}

async function main(): Promise<void> {
  console.log('Food Systems 2026 — File coverage check')
  console.log(`Run at: ${new Date().toISOString()}`)

  const priorityById = loadPriorityMap()
  const findings: Finding[] = []

  // 1. Walk research/
  const allFiles = walkResearch()
  console.log(`  Scanned ${allFiles.length} candidate files in research/`)

  // 2. Pull DB references
  const documents = await prisma.document.findMany({
    select: { id: true, slug: true, filePath: true, title: true },
  })
  const sourceDocs = await prisma.sourceDoc.findMany({
    select: {
      id: true,
      filename: true,
      title: true,
      isDuplicate: true,
      documentId: true,
      url: true,
      doi: true,
    },
  })
  const reportRows = await prisma.report.findMany({
    select: { id: true, title: true, sourceUrl: true, documentId: true },
  })
  const thesisRows = await prisma.thesis.findMany({
    select: { id: true, documentId: true },
  })
  const reportRowById = new Map(reportRows.map((r) => [r.id, r]))
  // documentId -> seed-style id (report or thesis) for KI-PRIORITY lookup.
  const seedIdByDocumentId = new Map<string, string>()
  for (const r of reportRows) {
    if (r.documentId) seedIdByDocumentId.set(r.documentId, r.id)
  }
  for (const t of thesisRows) {
    if (t.documentId) seedIdByDocumentId.set(t.documentId, t.id)
  }
  console.log(
    `  DB: ${documents.length} Document, ${sourceDocs.length} SourceDoc, ${reportRows.length} Report, ${thesisRows.length} Thesis`,
  )

  // Build basename index for files that actually exist on disk, so we can fall
  // back to "matches by filename only" when SourceDoc.filename is bare.
  const basenameIndex = new Map<string, string[]>()
  for (const rel of allFiles) {
    const base = rel.split(sep).pop() ?? rel
    const arr = basenameIndex.get(base) ?? []
    arr.push(rel)
    basenameIndex.set(base, arr)
  }

  // Build a set of all referenced paths (normalized to research-relative).
  const referenced = new Set<string>()
  const docFilePathById = new Map<string, string>()
  for (const d of documents) {
    const norm = normalizeReferencedPath(d.filePath)
    if (!norm) continue
    referenced.add(norm)
    docFilePathById.set(d.id, norm)
  }
  for (const s of sourceDocs) {
    const norm = normalizeReferencedPath(s.filename)
    referenced.add(norm)
    // Also mark the basename (under any subdir) as referenced so we don't
    // double-count its on-disk copies as orphans.
    const base = norm.split(sep).pop() ?? norm
    const matches = basenameIndex.get(base) ?? []
    for (const m of matches) referenced.add(m)
  }
  for (const r of seedReports) {
    for (const sup of r.supportingSources ?? []) {
      if (sup.documentPath) referenced.add(normalizeReferencedPath(sup.documentPath))
    }
  }

  // 3. Orphans = files NOT referenced anywhere.
  for (const rel of allFiles) {
    if (referenced.has(rel)) continue
    const severity: Severity = isPrimary(rel)
      ? 'MEDIUM'
      : isArchive(rel)
        ? 'LOW'
        : 'LOW'
    findings.push({
      ref: rel,
      entityType: 'file',
      problem: 'orphan_file',
      severity,
      suggestedAction: isPrimary(rel)
        ? 'Link to a Document/SourceDoc or Report.supportingSources, or move to archive'
        : 'Confirm intentional archive copy; otherwise consider removal',
      priority: null,
    })
  }

  // 4. Document.filePath -> on-disk check.
  for (const d of documents) {
    if (localFileExists(d.filePath)) continue
    // Map Document -> linked Report/Thesis -> KI-PRIORITY.
    const seedId = seedIdByDocumentId.get(d.id) ?? null
    const score = seedId ? (priorityById.get(seedId) ?? null) : null
    findings.push({
      ref: seedId ? `${d.id} (${seedId})` : d.id,
      entityType: 'Document',
      problem: 'missing_file_document',
      severity: severityFromPriority(score, 'MEDIUM'),
      suggestedAction: `Restore file at "${d.filePath}" or update Document.filePath to actual location`,
      priority: score,
    })
  }

  // 5. SourceDoc locator check. Public URL/DOI, linked Document, or a resolvable
  // local file all count as coverage; local filename fallback exists because many
  // SourceDocs store only the bare filename.
  for (const s of sourceDocs) {
    if (s.isDuplicate) continue
    const linkedDocumentPath = s.documentId ? docFilePathById.get(s.documentId) : null
    const norm = normalizeReferencedPath(s.filename)
    const base = norm.split(sep).pop() ?? norm
    const baseMatches = basenameIndex.get(base) ?? []
    const hasLocalFile =
      localFileExists(s.filename) ||
      localFileExists(linkedDocumentPath) ||
      baseMatches.length > 0
    if (
      hasSourceDocLocator({
        url: s.url,
        doi: s.doi,
        documentId: s.documentId,
        hasLocalFile,
      })
    ) {
      continue
    }
    findings.push({
      ref: s.id,
      entityType: 'SourceDoc',
      problem: 'missing_file_sourcedoc',
      severity: 'MEDIUM',
      suggestedAction: `Add SourceDoc.url/doi, link a Document, or restore file at "${s.filename}"`,
      priority: null,
    })
  }

  // 6. Report.supportingSources where documentPath set but missing on disk.
  for (const r of seedReports) {
    for (const sup of r.supportingSources ?? []) {
      if (!sup.documentPath) continue
      if (localFileExists(sup.documentPath)) continue
      const score = priorityById.get(r.id) ?? null
      findings.push({
        ref: `${r.id}::${sup.label}`,
        entityType: 'Report.supportingSources',
        problem: 'broken_supportingsource',
        severity: severityFromPriority(score, 'MEDIUM'),
        suggestedAction: `Restore "${sup.documentPath}" or replace with valid url/documentPath in seed`,
        priority: score,
      })
    }
  }

  // 7. Reports without analytical link: no documentId AND no supportingSource with valid documentPath OR url.
  for (const r of seedReports) {
    const dbRow = reportRowById.get(r.id)
    const hasDocLink = Boolean(dbRow?.documentId)
    const hasResolvableSupport = (r.supportingSources ?? []).some((sup) => {
      if (sup.url) return true
      if (sup.documentPath) {
        return localFileExists(sup.documentPath)
      }
      return false
    })
    if (hasDocLink || hasResolvableSupport) continue
    // sourceUrl on the Report itself counts as a fallback link (analytical citation).
    if (r.sourceUrl) continue
    const score = priorityById.get(r.id) ?? null
    findings.push({
      ref: r.id,
      entityType: 'Report',
      problem: 'report_no_analytical_link',
      severity: severityFromPriority(score, 'MEDIUM'),
      suggestedAction:
        'Add Document link, valid supportingSources documentPath/url, or sourceUrl',
      priority: score,
    })
  }

  // 8. Cross-document duplicates (multiple Documents pointing into the same SHA256 group).
  const catalog = loadPdfCatalog()
  const bySha = new Map<string, string[]>()
  for (const c of catalog) {
    const arr = bySha.get(c.sha256) ?? []
    arr.push(c.rel)
    bySha.set(c.sha256, arr)
  }
  // Build reverse map: rel -> docId
  const docIdByPath = new Map<string, string>()
  for (const [id, p] of docFilePathById) docIdByPath.set(p, id)
  for (const [sha, paths] of bySha) {
    if (paths.length < 2) continue
    const docIds = paths
      .map((p) => docIdByPath.get(p))
      .filter((id): id is string => Boolean(id))
    if (docIds.length < 2) continue
    findings.push({
      ref: `sha:${sha.slice(0, 12)}`,
      entityType: 'Document[]',
      problem: 'duplicate_file_separate_records',
      severity: 'LOW',
      suggestedAction: `Consolidate Documents [${docIds.join(', ')}] -> one canonical record (paths: ${paths.length})`,
      priority: null,
    })
  }

  // === Output CSV ===
  const csvLines = [
    'ref,entity_type,problem,severity,suggested_action,priority',
    ...findings.map((f) =>
      [
        csvEscape(f.ref),
        f.entityType,
        f.problem,
        f.severity,
        csvEscape(f.suggestedAction),
        f.priority !== null ? f.priority.toFixed(1) : '',
      ].join(','),
    ),
  ]
  writeFileSync(join(RESEARCH_DIR, 'FILE-COVERAGE.csv'), csvLines.join('\n') + '\n')

  // === Output Markdown ===
  const byProblem = new Map<ProblemType, number>()
  const bySeverity = new Map<Severity, number>()
  const matrix = new Map<string, number>()
  for (const f of findings) {
    byProblem.set(f.problem, (byProblem.get(f.problem) ?? 0) + 1)
    bySeverity.set(f.severity, (bySeverity.get(f.severity) ?? 0) + 1)
    const key = `${f.severity}::${f.problem}`
    matrix.set(key, (matrix.get(key) ?? 0) + 1)
  }

  const orphanDirCounts = new Map<string, number>()
  for (const f of findings) {
    if (f.problem !== 'orphan_file') continue
    const top = topDir(f.ref)
    orphanDirCounts.set(top, (orphanDirCounts.get(top) ?? 0) + 1)
  }

  const sevRank: Record<Severity, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
  const sortedTop = [...findings]
    .sort((a, b) => {
      if (sevRank[a.severity] !== sevRank[b.severity]) {
        return sevRank[a.severity] - sevRank[b.severity]
      }
      return (b.priority ?? 0) - (a.priority ?? 0)
    })
    .slice(0, 30)

  const problems: ProblemType[] = [
    'orphan_file',
    'missing_file_document',
    'missing_file_sourcedoc',
    'broken_supportingsource',
    'report_no_analytical_link',
    'duplicate_file_separate_records',
  ]
  const severities: Severity[] = ['HIGH', 'MEDIUM', 'LOW']

  const md = [
    '# File coverage — research/ vs DB/seed',
    '',
    '> Auto-generert av `scripts/compute-file-coverage.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt funn: **${findings.length}**`,
    '',
    '## Totals per problem',
    '',
    '| Problem | Count |',
    '|---|---:|',
    ...problems.map((p) => `| ${p} | ${byProblem.get(p) ?? 0} |`),
    '',
    '## Distribution: severity x problem',
    '',
    '| Severity | ' + problems.join(' | ') + ' |',
    '|---|' + problems.map(() => '---:').join('|') + '|',
    ...severities.map(
      (s) =>
        `| ${s} | ${problems.map((p) => matrix.get(`${s}::${p}`) ?? 0).join(' | ')} |`,
    ),
    '',
    '## Top 30 highest-severity findings',
    '',
    '| # | Severity | Problem | Entity | Ref | Priority | Action |',
    '|---:|---|---|---|---|---:|---|',
    ...sortedTop.map((f, i) => {
      const action = f.suggestedAction.replace(/\|/g, '\\|').slice(0, 80)
      const ref = f.ref.replace(/\|/g, '\\|').slice(0, 60)
      return `| ${i + 1} | ${f.severity} | ${f.problem} | ${f.entityType} | ${ref} | ${f.priority?.toFixed(1) ?? ''} | ${action} |`
    }),
    '',
    '## Orphan-file directories',
    '',
    '| Top-level dir | Orphan count |',
    '|---|---:|',
    ...[...orphanDirCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([dir, count]) => `| ${dir} | ${count} |`),
    '',
    '## Severity rules',
    '',
    '- **HIGH**: missing file or broken reference where the entity has KI-PRIORITY ≥ 4.0',
    '- **MEDIUM**: same but priority 3.0–3.5, or orphans in primary directories (`evidence-pack/`, `bibliotek/`)',
    '- **LOW**: orphans in archive/raw directories (`arkiv-sortert/`, `pdf-downloads-20-04-26/`, perpl-snapshots) or duplicate-files-as-separate-records',
    '',
    '## Scope notes',
    '',
    `- Scanned **${allFiles.length}** files (.pdf, .md) under \`research/\`, excluding \`_plans/\`, \`_status/\`, \`intake/\`, and the meta/index docs at the root.`,
    `- Cross-referenced ${documents.length} \`Document\`, ${sourceDocs.length} \`SourceDoc\`, and ${seedReports.length} seed Reports (plus their supportingSources).`,
    '- `SourceDoc` locator coverage accepts URL, DOI, linked `Document`, or a resolvable local file. `SourceDoc.filename` is often a bare filename (no path); the script uses a basename index over `research/` as the local-file fallback.',
    '- A `Document` missing-file finding is HIGH severity if the linked seed Report/Thesis has KI-PRIORITY ≥ 4.0; otherwise MEDIUM. Documents without any seed link (e.g. raw imports) default to MEDIUM.',
    '- Duplicate detection groups by SHA256 from `pdf-katalog.json` and only flags groups with ≥2 distinct `Document` records.',
  ].join('\n')

  writeFileSync(join(RESEARCH_DIR, 'FILE-COVERAGE.md'), md + '\n')

  console.log('')
  console.log(`Findings written: ${findings.length}`)
  console.log('  By problem:')
  for (const p of problems) {
    console.log(`    ${p}: ${byProblem.get(p) ?? 0}`)
  }
  console.log('  By severity:')
  for (const s of severities) {
    console.log(`    ${s}: ${bySeverity.get(s) ?? 0}`)
  }
  console.log('')
  console.log('Output: research/FILE-COVERAGE.csv + research/FILE-COVERAGE.md')
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('File coverage failed:', e)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
