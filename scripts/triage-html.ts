import { closeSync, existsSync, openSync, readdirSync, readSync, statSync, writeFileSync } from 'fs'
import { join, relative, sep } from 'path'
import { reports as seedReports } from '../prisma/seed-data/reports'

type Classification =
  | 'error-page'
  | 'navigation-only'
  | 'ok-snapshot'
  | 'needs-md-extraction'

type Severity = 'HIGH' | 'MEDIUM' | 'LOW'

type TriageRow = {
  rel: string
  classification: Classification
  wordCount: number
  hasMdCompanion: boolean
  referencedInSeed: boolean
  severity: Severity
  action: string
  title: string
  size: number
  skippedReason?: string
}

const ROOT = process.cwd()
const RESEARCH_DIR = join(ROOT, 'research')

const SCAN_SKIP_SUBTREES = ['_plans', '_status', 'intake']
const READ_LIMIT_BYTES = 100 * 1024 // 100 KB read limit per the spec
const MAX_FILE_BYTES = 5 * 1024 * 1024 // skip files > 5 MB

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function walkResearchHtml(): string[] {
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
      let st
      try {
        st = statSync(full)
      } catch {
        continue
      }
      if (st.isDirectory()) {
        walk(full)
      } else if (st.isFile()) {
        if (!/\.(html|htm)$/i.test(name)) continue
        out.push(rel)
      }
    }
  }
  walk(RESEARCH_DIR)
  return out
}

function normalizeReferencedPath(p: string): string {
  let s = p.replace(/^\.\//, '')
  if (s.startsWith('research/')) s = s.slice('research/'.length)
  return s
}

function buildSeedHtmlReferences(): Set<string> {
  const refs = new Set<string>()
  for (const r of seedReports) {
    for (const sup of r.supportingSources ?? []) {
      if (!sup.documentPath) continue
      if (!/\.(html|htm)$/i.test(sup.documentPath)) continue
      refs.add(normalizeReferencedPath(sup.documentPath))
    }
  }
  return refs
}

function readPartial(absPath: string, limitBytes: number): string {
  const buf = Buffer.alloc(limitBytes)
  const fd = openSync(absPath, 'r')
  try {
    const bytesRead = readSync(fd, buf, 0, limitBytes, 0)
    return buf.subarray(0, bytesRead).toString('utf-8')
  } finally {
    closeSync(fd)
  }
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch) return decodeEntities(titleMatch[1].trim()).slice(0, 200)
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1Match) {
    const stripped = h1Match[1].replace(/<[^>]+>/g, '').trim()
    return decodeEntities(stripped).slice(0, 200)
  }
  return ''
}

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, ' ')
}

function stripHtmlToText(html: string): string {
  // Remove script + style + noscript blocks first.
  let s = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
  // Remove obvious navigational containers — best-effort regex.
  s = s
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ')
  // HTML comments
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  // Strip remaining tags
  s = s.replace(/<[^>]+>/g, ' ')
  // Decode entities
  s = decodeEntities(s)
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

function countWords(text: string): number {
  if (!text) return 0
  return text.split(/\s+/).filter((w) => w.length > 0).length
}

const ERROR_PATTERNS = [
  /\b404\b/,
  /\b403\b/,
  /access denied/i,
  /not found/i,
  /side ikke funnet/i,
  /siden finnes ikke/i,
  /page not found/i,
  /forbidden/i,
]

function classifyHtml(args: {
  title: string
  text: string
  wordCount: number
}): { classification: Classification; reason: string } {
  const { title, text, wordCount } = args
  const titleLower = title.toLowerCase()

  // 1. Error page heuristics — check title and first ~500 chars of text
  const head = text.slice(0, 500)
  for (const pat of ERROR_PATTERNS) {
    if (pat.test(titleLower) || pat.test(head)) {
      return { classification: 'error-page', reason: `pattern ${pat}` }
    }
  }
  if (wordCount < 30) {
    return { classification: 'error-page', reason: 'body essentially empty' }
  }

  // 2. Navigation-only: less than 200 words after stripping nav/header/footer.
  if (wordCount < 200) {
    return { classification: 'navigation-only', reason: `only ${wordCount} words` }
  }

  // 3. Otherwise ok-snapshot. Decision about needs-md-extraction is layered on
  //    later, in the caller (depends on companion + reference state).
  return { classification: 'ok-snapshot', reason: '200+ words of body text' }
}

function hasMdCompanionFor(rel: string): boolean {
  // Same basename, .md companion in same directory.
  const mdRel = rel.replace(/\.(html|htm)$/i, '.md')
  if (mdRel === rel) return false
  return existsSync(join(RESEARCH_DIR, mdRel))
}

function severityFor(row: {
  classification: Classification
  hasMdCompanion: boolean
  referencedInSeed: boolean
}): Severity {
  if (
    row.classification === 'needs-md-extraction' &&
    row.referencedInSeed &&
    !row.hasMdCompanion
  ) {
    return 'HIGH'
  }
  if (row.classification === 'needs-md-extraction' && !row.referencedInSeed) {
    return 'MEDIUM'
  }
  if (
    row.classification === 'navigation-only' ||
    row.classification === 'error-page'
  ) {
    return 'LOW'
  }
  // ok-snapshot with companion or otherwise — low priority for action
  return 'LOW'
}

function actionFor(row: {
  classification: Classification
  hasMdCompanion: boolean
  referencedInSeed: boolean
}): string {
  switch (row.classification) {
    case 'error-page':
      return 'Investigate fetch failure; remove HTML or replace with valid snapshot'
    case 'navigation-only':
      return 'Likely menu/landing page — confirm intent or remove'
    case 'needs-md-extraction':
      return row.referencedInSeed
        ? 'Extract clean Markdown for KI use (referenced in seed)'
        : 'Extract clean Markdown for KI use (not yet referenced)'
    case 'ok-snapshot':
      return row.hasMdCompanion
        ? 'OK — Markdown companion present'
        : 'Snapshot OK; consider extraction if needed for KI'
  }
}

function main(): void {
  console.log('Food Systems 2026 — HTML triage')
  console.log(`Run at: ${new Date().toISOString()}`)

  const seedRefs = buildSeedHtmlReferences()
  const allHtml = walkResearchHtml()
  console.log(`  Found ${allHtml.length} HTML files in research/ (excl. _plans/_status/intake)`)

  const skipped: string[] = []
  const rows: TriageRow[] = []

  for (const rel of allHtml) {
    const abs = join(RESEARCH_DIR, rel)
    let st
    try {
      st = statSync(abs)
    } catch {
      continue
    }
    if (st.size > MAX_FILE_BYTES) {
      skipped.push(`${rel} (${(st.size / 1024 / 1024).toFixed(1)} MB)`)
      rows.push({
        rel,
        classification: 'ok-snapshot',
        wordCount: 0,
        hasMdCompanion: hasMdCompanionFor(rel),
        referencedInSeed: seedRefs.has(rel),
        severity: 'LOW',
        action: 'Skipped (file >5 MB) — manual review needed',
        title: '',
        size: st.size,
        skippedReason: 'file >5 MB',
      })
      continue
    }

    let html: string
    try {
      html = readPartial(abs, READ_LIMIT_BYTES)
    } catch (e) {
      rows.push({
        rel,
        classification: 'error-page',
        wordCount: 0,
        hasMdCompanion: hasMdCompanionFor(rel),
        referencedInSeed: seedRefs.has(rel),
        severity: 'LOW',
        action: 'Read failed — investigate',
        title: '',
        size: st.size,
        skippedReason: `read error: ${(e as Error).message}`,
      })
      continue
    }

    const title = extractTitle(html)
    const text = stripHtmlToText(html)
    const wordCount = countWords(text)

    const { classification: baseClass } = classifyHtml({
      title,
      text,
      wordCount,
    })

    const referencedInSeed = seedRefs.has(rel)
    const hasMd = hasMdCompanionFor(rel)
    let classification: Classification = baseClass
    if (baseClass === 'ok-snapshot' && !hasMd) {
      classification = 'needs-md-extraction'
    }

    const severity = severityFor({
      classification,
      hasMdCompanion: hasMd,
      referencedInSeed,
    })
    const action = actionFor({
      classification,
      hasMdCompanion: hasMd,
      referencedInSeed,
    })

    rows.push({
      rel,
      classification,
      wordCount,
      hasMdCompanion: hasMd,
      referencedInSeed,
      severity,
      action,
      title,
      size: st.size,
    })
  }

  // === CSV ===
  const csvLines = [
    'path,classification,word_count,has_md_companion,referenced_in_seed,severity,action',
    ...rows.map((r) =>
      [
        csvEscape(r.rel),
        r.classification,
        r.wordCount.toString(),
        r.hasMdCompanion ? 'yes' : 'no',
        r.referencedInSeed ? 'yes' : 'no',
        r.severity,
        csvEscape(r.action),
      ].join(','),
    ),
  ]
  writeFileSync(join(RESEARCH_DIR, 'HTML-TRIAGE.csv'), csvLines.join('\n') + '\n')

  // === Summary stats ===
  const byClass = new Map<Classification, number>()
  const bySeverity = new Map<Severity, number>()
  for (const r of rows) {
    byClass.set(r.classification, (byClass.get(r.classification) ?? 0) + 1)
    bySeverity.set(r.severity, (bySeverity.get(r.severity) ?? 0) + 1)
  }

  const errorPages = rows.filter((r) => r.classification === 'error-page')
  const navOnly = rows.filter((r) => r.classification === 'navigation-only')
  const needsMd = rows
    .filter((r) => r.classification === 'needs-md-extraction')
    .sort((a, b) => {
      // referenced first, then word_count desc
      if (a.referencedInSeed !== b.referencedInSeed) {
        return a.referencedInSeed ? -1 : 1
      }
      return b.wordCount - a.wordCount
    })
    .slice(0, 30)

  const classifications: Classification[] = [
    'ok-snapshot',
    'needs-md-extraction',
    'navigation-only',
    'error-page',
  ]
  const severities: Severity[] = ['HIGH', 'MEDIUM', 'LOW']

  const md: string[] = [
    '# HTML triage — research/ snapshots',
    '',
    '> Auto-generert av `scripts/triage-html.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt: **${rows.length}** HTML-filer skannet (utelater \`_plans/\`, \`_status/\`, \`intake/\`)`,
    '',
    '## Klassifisering',
    '',
    '| Klasse | Antall |',
    '|---|---:|',
    ...classifications.map(
      (c) => `| ${c} | ${byClass.get(c) ?? 0} |`,
    ),
    '',
    '## Severity',
    '',
    '| Severity | Antall |',
    '|---|---:|',
    ...severities.map((s) => `| ${s} | ${bySeverity.get(s) ?? 0} |`),
    '',
    '## Error-pages',
    '',
    errorPages.length === 0
      ? '_Ingen error-pages funnet._'
      : '| Path | Tittel | Word count |\n|---|---|---:|',
    ...errorPages.map(
      (r) =>
        `| ${r.rel} | ${r.title.slice(0, 80) || '(ingen)'} | ${r.wordCount} |`,
    ),
    '',
    '## Navigation-only',
    '',
    navOnly.length === 0
      ? '_Ingen navigation-only-filer funnet._'
      : '| Path | Tittel | Word count |\n|---|---|---:|',
    ...navOnly.map(
      (r) =>
        `| ${r.rel} | ${r.title.slice(0, 80) || '(ingen)'} | ${r.wordCount} |`,
    ),
    '',
    '## Topp 30 needs-md-extraction (prioritet)',
    '',
    '> Sortert: referenced_in_seed først, deretter word_count desc.',
    '',
    needsMd.length === 0
      ? '_Ingen needs-md-extraction-filer funnet._'
      : '| # | Severity | Referenced | Words | Path | Tittel |\n|---:|---|---|---:|---|---|',
    ...needsMd.map((r, i) => {
      const ref = r.referencedInSeed ? 'yes' : 'no'
      return `| ${i + 1} | ${r.severity} | ${ref} | ${r.wordCount} | ${r.rel} | ${r.title.slice(0, 60) || '(ingen)'} |`
    }),
    '',
    '## Severity-regler',
    '',
    '- **HIGH**: `needs-md-extraction` AND `referenced_in_seed` AND no `.md`-companion — kritisk for KI-bruk',
    '- **MEDIUM**: `needs-md-extraction` uten `referenced_in_seed` — bør ekstraheres for fremtidig bruk',
    '- **LOW**: `navigation-only`, `error-page`, eller `ok-snapshot` med eksisterende companion',
    '',
    '## Klassifiserings-heuristikk',
    '',
    '- **error-page**: title eller body matcher 404/403/Access Denied/Not Found, ELLER body har <30 ord etter stripping',
    '- **navigation-only**: <200 ord etter at `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>` og kommentarer er fjernet',
    '- **ok-snapshot**: 200+ ord — antas å være artikkelinnhold',
    '- **needs-md-extraction**: ok-snapshot UTEN `.md`-companion (samme basename, samme katalog)',
    '',
    '## Skanne-noter',
    '',
    `- Lest første ${READ_LIMIT_BYTES / 1024} KB per fil (rask heuristikk).`,
    `- Filer >5 MB utelatt fra parsing: ${skipped.length === 0 ? 'ingen' : skipped.join(', ')}`,
    `- Krysset mot ${seedRefs.size} HTML-referanser fra \`Report.supportingSources[].documentPath\` i \`prisma/seed-data/reports.ts\`.`,
  ]

  writeFileSync(join(RESEARCH_DIR, 'HTML-TRIAGE.md'), md.join('\n') + '\n')

  console.log('')
  console.log(`Findings written: ${rows.length}`)
  console.log('  By classification:')
  for (const c of classifications) {
    console.log(`    ${c}: ${byClass.get(c) ?? 0}`)
  }
  console.log('  By severity:')
  for (const s of severities) {
    console.log(`    ${s}: ${bySeverity.get(s) ?? 0}`)
  }
  if (skipped.length > 0) {
    console.log(`  Skipped (>5 MB): ${skipped.length}`)
    for (const s of skipped) console.log(`    ${s}`)
  }
  console.log('')
  console.log('Output: research/HTML-TRIAGE.csv + research/HTML-TRIAGE.md')
}

main()
