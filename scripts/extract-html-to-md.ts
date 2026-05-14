/**
 * scripts/extract-html-to-md.ts
 *
 * Fase C Group N — Extract clean Markdown from the HTML snapshots flagged by
 * `scripts/triage-html.ts` so they can be cited by KI / used for analysis.
 *
 * Reads:  research/HTML-TRIAGE.csv   (input list, severity HIGH/MEDIUM)
 * Writes: <basename>.md next to each .html source
 *         research/HTML-EXTRACTION-LOG.md
 *
 * Strategy
 * --------
 * 1. Prefer pandoc (better quality). If unavailable, fall back to a regex-
 *    based heuristic conversion in pure Node.
 * 2. Either way, pre-clean the HTML in JS first: strip script/style/nav/
 *    header/footer/aside and isolate the article body when discoverable.
 *    This keeps boilerplate (cookie banners, menu, related posts) out of
 *    the markdown.
 * 3. Each generated `.md` carries a YAML frontmatter block with provenance
 *    so downstream tools know where it came from and how it was made.
 */

import { execFileSync, spawnSync } from 'child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from 'fs'
import { tmpdir } from 'os'
import { dirname, join, relative } from 'path'
import { parseCsvRecords } from '../src/lib/csv'

const ROOT = process.cwd()
const RESEARCH_DIR = join(ROOT, 'research')
const TRIAGE_CSV = join(RESEARCH_DIR, 'HTML-TRIAGE.csv')
const LOG_PATH = join(RESEARCH_DIR, 'HTML-EXTRACTION-LOG.md')
const MIN_WORD_COUNT = 100

type ExtractorTool = 'pandoc' | 'regex-fallback'

type FileResult = {
  source: string // research-relative path to source .html
  target: string // research-relative path to generated .md
  wordCount: number
  status: 'ok' | 'short' | 'error'
  extractor: ExtractorTool
  notes: string
}

// ===== CSV parsing ============================================================

type TriageRow = {
  path: string
  classification: string
  wordCount: number
  hasMdCompanion: string
  referencedInSeed: string
  severity: string
  action: string
}

function parseCsv(text: string): TriageRow[] {
  return parseCsvRecords(text).flatMap(record => {
    if (!record.path) return []
    return [{
      path: record.path,
      classification: record.classification,
      wordCount: parseInt(record.wordCount, 10) || 0,
      hasMdCompanion: record.hasMdCompanion,
      referencedInSeed: record.referencedInSeed,
      severity: record.severity,
      action: record.action,
    }]
  })
}

// ===== Pandoc detection =======================================================

function detectPandoc(): string | null {
  try {
    const out = execFileSync('pandoc', ['--version'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    })
    const m = out.match(/^pandoc\s+([0-9.]+)/i)
    return m ? m[1] : 'unknown'
  } catch {
    return null
  }
}

// ===== HTML pre-cleaning (article body extraction) ===========================

const HTML_ENTITIES: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&#39;': "'",
  '&#34;': '"',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&laquo;': '«',
  '&raquo;': '»',
  '&aelig;': 'æ',
  '&oslash;': 'ø',
  '&aring;': 'å',
  '&AElig;': 'Æ',
  '&Oslash;': 'Ø',
  '&Aring;': 'Å',
}

function decodeEntities(s: string): string {
  let out = s
  for (const [k, v] of Object.entries(HTML_ENTITIES)) {
    out = out.replaceAll(k, v)
  }
  out = out.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
  out = out.replace(/&#x([0-9a-f]+);/gi, (_, n) =>
    String.fromCodePoint(parseInt(n, 16)),
  )
  return out
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (m) return decodeEntities(m[1].replace(/\s+/g, ' ').trim())
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  if (h1) {
    return decodeEntities(h1[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
  }
  return ''
}

/**
 * Strip script/style/nav/header/footer/aside/noscript blocks plus HTML
 * comments. Keeps the rest of the markup intact for pandoc to parse.
 */
function stripBoilerplate(html: string): string {
  let s = html
  s = s.replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
  s = s.replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
  s = s.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
  s = s.replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
  s = s.replace(/<header\b[\s\S]*?<\/header>/gi, ' ')
  s = s.replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ')
  s = s.replace(/<aside\b[\s\S]*?<\/aside>/gi, ' ')
  s = s.replace(/<form\b[\s\S]*?<\/form>/gi, ' ')
  s = s.replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
  s = s.replace(/<iframe\b[\s\S]*?<\/iframe>/gi, ' ')
  s = s.replace(/<!--[\s\S]*?-->/g, ' ')
  return s
}

/**
 * Find the closing tag offset for a balanced HTML tag starting at `start`.
 * `start` should point to the '<' of an opening tag for `tagName`.
 * Returns the offset just past the matching closing tag, or -1 if not found.
 */
function findBalancedTagEnd(
  html: string,
  start: number,
  tagName: string,
): number {
  const lower = html.toLowerCase()
  const openRe = new RegExp(`<${tagName}\\b`, 'g')
  const closeRe = new RegExp(`</${tagName}\\s*>`, 'g')
  // Find end of opening tag first.
  const openEnd = html.indexOf('>', start)
  if (openEnd === -1) return -1
  openRe.lastIndex = openEnd + 1
  closeRe.lastIndex = openEnd + 1
  let depth = 1
  while (depth > 0) {
    openRe.lastIndex = Math.max(openRe.lastIndex, closeRe.lastIndex)
    closeRe.lastIndex = Math.max(openRe.lastIndex, closeRe.lastIndex)
    const nextOpen = openRe.exec(lower)
    const nextClose = closeRe.exec(lower)
    if (!nextClose) return -1
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++
      openRe.lastIndex = nextOpen.index + tagName.length + 1
      closeRe.lastIndex = nextOpen.index + tagName.length + 1
    } else {
      depth--
      const endPos = nextClose.index + nextClose[0].length
      if (depth === 0) return endPos
      openRe.lastIndex = endPos
      closeRe.lastIndex = endPos
    }
  }
  return -1
}

/**
 * Heuristic: pull the most likely article-body container out of the HTML.
 * Tries known WordPress / generic patterns before falling back to <main>,
 * <article>, then the full <body>. Word count is a tiebreaker when several
 * candidates match — the longest content wins.
 */
function isolateArticleBody(html: string): string {
  const candidates: Array<{ regex: RegExp; label: string }> = [
    // WordPress / Elementor
    {
      regex: /<div[^>]*class="[^"]*\belementor-widget-theme-post-content\b[^"]*"[^>]*>/i,
      label: 'elementor-widget-theme-post-content',
    },
    {
      regex: /<div[^>]*class="[^"]*\bentry-content\b[^"]*"[^>]*>/i,
      label: 'entry-content',
    },
    {
      regex: /<div[^>]*class="[^"]*\bpost-content\b[^"]*"[^>]*>/i,
      label: 'post-content',
    },
    {
      regex: /<div[^>]*class="[^"]*\barticle-body\b[^"]*"[^>]*>/i,
      label: 'article-body',
    },
    {
      regex: /<div[^>]*class="[^"]*\bmarkdown-body\b[^"]*"[^>]*>/i,
      label: 'markdown-body',
    },
    { regex: /<article\b[^>]*>/i, label: 'article' },
    { regex: /<main\b[^>]*>/i, label: 'main' },
  ]

  let best: { content: string; label: string; size: number } | null = null

  for (const cand of candidates) {
    const m = cand.regex.exec(html)
    if (!m) continue
    const start = m.index
    const tagName = cand.label.startsWith('article')
      ? 'article'
      : cand.label === 'main'
        ? 'main'
        : 'div'
    const end = findBalancedTagEnd(html, start, tagName)
    if (end === -1) continue
    const content = html.slice(start, end)
    if (!best || content.length > best.size) {
      best = { content, label: cand.label, size: content.length }
    }
    // Take the first matching specific content-class container if it's
    // sizeable — these are very precise selectors and we trust them.
    if (
      cand.label !== 'article' &&
      cand.label !== 'main' &&
      content.length > 1000
    ) {
      return content
    }
  }

  if (best) return best.content

  // Fallback: <body>
  const bodyMatch = /<body\b[^>]*>([\s\S]*)<\/body>/i.exec(html)
  if (bodyMatch) return bodyMatch[1]
  return html
}

// ===== Pandoc invocation ======================================================

function runPandoc(htmlText: string): { ok: true; md: string } | { ok: false; err: string } {
  // Write cleaned HTML to a temp file then call pandoc — avoids stdin quirks.
  const tmp = join(tmpdir(), `extract-html-${process.pid}-${Date.now()}.html`)
  try {
    writeFileSync(tmp, htmlText, 'utf-8')
    const result = spawnSync(
      'pandoc',
      [
        '-f',
        'html-native_divs-native_spans',
        '-t',
        'gfm-raw_html',
        '--wrap=none',
        '--strip-comments',
        tmp,
      ],
      { encoding: 'utf-8' },
    )
    if (result.status !== 0) {
      return {
        ok: false,
        err:
          (result.stderr ?? '').trim() ||
          `pandoc exited with status ${result.status}`,
      }
    }
    return { ok: true, md: result.stdout }
  } catch (e) {
    return { ok: false, err: (e as Error).message }
  } finally {
    try {
      unlinkSync(tmp)
    } catch {
      // ignore
    }
  }
}

// ===== Pure-Node regex fallback ==============================================

/**
 * Convert pre-cleaned HTML to a passable Markdown string without external
 * tools. This is intentionally simple — we lose nuance (tables, nested lists)
 * but capture headings, paragraphs, links, emphasis, and bullets.
 */
function regexHtmlToMd(html: string): string {
  let s = html

  // Normalise <br> to newlines before structural conversion.
  s = s.replace(/<br\s*\/?>(\s*)/gi, '\n')

  // Headings
  for (let lvl = 6; lvl >= 1; lvl--) {
    const re = new RegExp(`<h${lvl}\\b[^>]*>([\\s\\S]*?)</h${lvl}>`, 'gi')
    const prefix = '#'.repeat(lvl)
    s = s.replace(re, (_, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      return `\n\n${prefix} ${text}\n\n`
    })
  }

  // Bold + italic
  s = s.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner: string) => `**${inner.trim()}**`)
  s = s.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, (_, _t, inner: string) => `*${inner.trim()}*`)

  // Links
  s = s.replace(
    /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href: string, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      if (!text) return ''
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return text
      return `[${text}](${href})`
    },
  )

  // List items: emit '- ' bullets.
  s = s.replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    return `\n- ${text}`
  })

  // Drop list wrappers (we already have - bullets).
  s = s.replace(/<\/?(ul|ol)\b[^>]*>/gi, '\n')

  // Paragraph breaks
  s = s.replace(/<p\b[^>]*>/gi, '\n\n')
  s = s.replace(/<\/p>/gi, '\n\n')

  // Block separators
  s = s.replace(/<\/(div|section|blockquote)\b[^>]*>/gi, '\n')
  s = s.replace(/<(div|section|blockquote)\b[^>]*>/gi, '\n')

  // Strip everything else
  s = s.replace(/<[^>]+>/g, ' ')

  // Decode entities
  s = decodeEntities(s)

  // Collapse whitespace: keep blank lines but compress runs of spaces.
  s = s.replace(/[ \t]+/g, ' ')
  s = s.replace(/ *\n */g, '\n')
  s = s.replace(/\n{3,}/g, '\n\n')
  s = s.trim()
  return s
}

// ===== Markdown post-processing ==============================================

/**
 * Tidy up pandoc / fallback output: drop residual raw HTML wrappers, empty
 * "##" headings, repeated blank lines, and base64 image data URIs that bloat
 * the file without adding citation value.
 */
function tidyMarkdown(md: string): string {
  let s = md
  // Drop base64 image data URIs that pandoc inlines for embedded SVG/PNG.
  s = s.replace(/!\[[^\]]*\]\(data:image\/[^)]+\)/g, '')
  s = s.replace(/<img[^>]+src="data:image\/[^"]+"[^>]*\/?>/gi, '')
  // Drop bare HTML tags that pandoc preserved despite -raw_html.
  s = s.replace(/<\/?(div|span|section|article|main|aside|figure|figcaption|picture|source)\b[^>]*>/gi, '')
  // Drop standalone HTML attribute remnants like {.foo} that pandoc emits.
  s = s.replace(/\{\.[^}]+\}/g, '')
  // Empty list items
  s = s.replace(/^- *$/gm, '')
  // Empty headings
  s = s.replace(/^#+\s*$/gm, '')
  // Collapse whitespace
  s = s.replace(/[ \t]+$/gm, '')
  s = s.replace(/\n{3,}/g, '\n\n')
  return s.trim() + '\n'
}

function countWords(text: string): number {
  // Strip markdown link/url syntax, headings, emphasis markers before count.
  const stripped = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_>~|-]+/g, ' ')
  return stripped.split(/\s+/).filter((w) => w.length > 0).length
}

// ===== Frontmatter ============================================================

function yamlEscape(s: string): string {
  // Simple quoting: single-line, escape backslashes and quotes.
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function buildFrontmatter(args: {
  sourceHtml: string
  extractor: ExtractorTool
  pandocVersion: string | null
  title: string
}): string {
  const extractedAt = new Date().toISOString()
  const extractorLabel =
    args.extractor === 'pandoc' && args.pandocVersion
      ? `pandoc-${args.pandocVersion}`
      : args.extractor === 'pandoc'
        ? 'pandoc'
        : 'regex-fallback'
  const lines = [
    '---',
    `source_html: "${yamlEscape(args.sourceHtml)}"`,
    `extracted_at: "${extractedAt}"`,
    `extractor: "${extractorLabel}"`,
    `title: "${yamlEscape(args.title)}"`,
    '---',
    '',
  ]
  return lines.join('\n')
}

// ===== Per-file extraction ====================================================

function extractOne(args: {
  sourceAbs: string
  pandocVersion: string | null
}): FileResult {
  const { sourceAbs, pandocVersion } = args
  const sourceRel = relative(ROOT, sourceAbs)
  const targetAbs = sourceAbs.replace(/\.html?$/i, '.md')
  const targetRel = relative(ROOT, targetAbs)

  if (!existsSync(sourceAbs)) {
    return {
      source: sourceRel,
      target: targetRel,
      wordCount: 0,
      status: 'error',
      extractor: pandocVersion ? 'pandoc' : 'regex-fallback',
      notes: 'source HTML missing',
    }
  }

  const raw = readFileSync(sourceAbs, 'utf-8')
  const title = extractTitle(raw)
  const stripped = stripBoilerplate(raw)
  const isolated = isolateArticleBody(stripped)
  // Extra safety: run boilerplate strip again on the isolated chunk in case
  // the article container nested any.
  const cleaned = stripBoilerplate(isolated)

  let extractor: ExtractorTool = pandocVersion ? 'pandoc' : 'regex-fallback'
  let body = ''
  let notes = ''

  if (pandocVersion) {
    const result = runPandoc(cleaned)
    if (result.ok) {
      body = tidyMarkdown(result.md)
    } else {
      notes = `pandoc failed (${result.err.slice(0, 120)}); fell back to regex`
      extractor = 'regex-fallback'
      body = tidyMarkdown(regexHtmlToMd(cleaned))
    }
  } else {
    body = tidyMarkdown(regexHtmlToMd(cleaned))
  }

  const frontmatter = buildFrontmatter({
    sourceHtml: relative(dirname(targetAbs), sourceAbs),
    extractor,
    pandocVersion,
    title,
  })
  const finalText = frontmatter + body

  // Make sure the output directory exists (it always should — same as source).
  mkdirSync(dirname(targetAbs), { recursive: true })
  writeFileSync(targetAbs, finalText, 'utf-8')

  const wc = countWords(body)
  const status: FileResult['status'] = wc < MIN_WORD_COUNT ? 'short' : 'ok'

  if (status === 'short') {
    notes = notes
      ? `${notes}; output below ${MIN_WORD_COUNT}-word floor (${wc})`
      : `output below ${MIN_WORD_COUNT}-word floor (${wc})`
  }

  return {
    source: sourceRel,
    target: targetRel,
    wordCount: wc,
    status,
    extractor,
    notes,
  }
}

// ===== Log writing ============================================================

function writeLog(args: {
  results: FileResult[]
  pandocVersion: string | null
}): void {
  const { results, pandocVersion } = args
  const tool = pandocVersion ? `pandoc ${pandocVersion}` : 'regex-fallback'
  const okCount = results.filter((r) => r.status === 'ok').length
  const shortCount = results.filter((r) => r.status === 'short').length
  const errorCount = results.filter((r) => r.status === 'error').length

  const lines: string[] = [
    '# HTML extraction log — Fase C Group N',
    '',
    '> Auto-generert av `scripts/extract-html-to-md.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Verktøy: **${tool}**`,
    `> Resultat: ${okCount} ok, ${shortCount} short, ${errorCount} error (av ${results.length})`,
    '',
    '## Per fil',
    '',
    '| # | Status | Words | Extractor | Source | Target | Notes |',
    '|---:|---|---:|---|---|---|---|',
    ...results.map((r, i) => {
      const notes = r.notes || ''
      return `| ${i + 1} | ${r.status} | ${r.wordCount} | ${r.extractor} | ${r.source} | ${r.target} | ${notes} |`
    }),
    '',
    '## Notater',
    '',
    `- **MIN_WORD_COUNT**: ${MIN_WORD_COUNT} ord — output under denne grensen flagges som \`short\` for manuell oppfølging.`,
    '- HTML-en pre-renses i Node før pandoc-kall: `<script>`, `<style>`, `<nav>`, `<header>`, `<footer>`, `<aside>`, `<form>`, `<svg>`, `<iframe>` og kommentarer fjernes; deretter isoleres artikkel-body via klasse-heuristikk (`elementor-widget-theme-post-content`, `entry-content`, `post-content`, `article-body`, `markdown-body`) eller `<article>`/`<main>`/`<body>` som fallback.',
    '- Pandoc-kall: `pandoc -f html-native_divs-native_spans -t gfm-raw_html --wrap=none --strip-comments`.',
    '- Frontmatter: `source_html` (relativ til .md-filens katalog), `extracted_at` (ISO), `extractor` (`pandoc-x.y` eller `regex-fallback`), `title` (fra `<title>` eller `<h1>`).',
    '',
  ]

  writeFileSync(LOG_PATH, lines.join('\n'))
}

// ===== Main ===================================================================

function main(): void {
  if (!existsSync(TRIAGE_CSV)) {
    console.error(`HTML triage CSV not found: ${TRIAGE_CSV}`)
    console.error('Run `tsx scripts/triage-html.ts` first.')
    process.exit(1)
  }

  const csvText = readFileSync(TRIAGE_CSV, 'utf-8')
  const rows = parseCsv(csvText)
  const targets = rows.filter(
    (r) =>
      r.classification === 'needs-md-extraction' &&
      (r.severity === 'HIGH' || r.severity === 'MEDIUM'),
  )

  if (targets.length === 0) {
    console.log('No HIGH/MEDIUM needs-md-extraction rows in HTML-TRIAGE.csv — nothing to do.')
    writeLog({ results: [], pandocVersion: detectPandoc() })
    return
  }

  const pandocVersion = detectPandoc()
  console.log('Food Systems 2026 — HTML → Markdown extraction')
  console.log(`Run at: ${new Date().toISOString()}`)
  console.log(`  Tool: ${pandocVersion ? `pandoc ${pandocVersion}` : 'regex-fallback (pandoc not found)'}`)
  console.log(`  Targets: ${targets.length} (HIGH/MEDIUM, needs-md-extraction)`)
  console.log('')

  const results: FileResult[] = []
  for (const r of targets) {
    const sourceAbs = join(RESEARCH_DIR, r.path)
    process.stdout.write(`  → ${r.path} ... `)
    const result = extractOne({ sourceAbs, pandocVersion })
    results.push(result)
    console.log(`${result.status} (${result.wordCount} words, ${result.extractor})`)
    if (result.notes) console.log(`    ${result.notes}`)
  }

  writeLog({ results, pandocVersion })

  console.log('')
  console.log('Output:')
  console.log(`  ${results.length} markdown files written next to source HTML`)
  console.log(`  ${relative(ROOT, LOG_PATH)}`)
}

main()
