import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT = path.join(RESEARCH, 'ARKIV-INDEX.md')

type FileInfo = {
  rel: string
  abs: string
  ext: string
  size: number
  mtime: Date
}

const DOC_EXTS = new Set(['.pdf', '.md', '.html', '.htm', '.docx'])
const IGNORE_DIRS = new Set(['node_modules', '.git', '.next'])

async function walk(dir: string, acc: FileInfo[] = []): Promise<FileInfo[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    if (IGNORE_DIRS.has(e.name)) continue
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) {
      await walk(abs, acc)
    } else if (e.isFile()) {
      const stat = await fs.stat(abs)
      acc.push({
        rel: path.relative(RESEARCH, abs),
        abs,
        ext: path.extname(e.name).toLowerCase(),
        size: stat.size,
        mtime: stat.mtime,
      })
    }
  }
  return acc
}

async function extractMdTitle(abs: string): Promise<string> {
  try {
    const buf = await fs.readFile(abs, 'utf8')
    const lines = buf.split('\n').slice(0, 50)
    for (const l of lines) {
      const m = l.match(/^#\s+(.+?)\s*$/)
      if (m) return m[1].trim()
    }
    const firstNonEmpty = lines.find((l) => l.trim().length > 0)
    return firstNonEmpty ? firstNonEmpty.slice(0, 120).trim() : ''
  } catch {
    return ''
  }
}

function extractPdfInfo(buf: Buffer): { title: string; author: string } {
  const s = buf.toString('latin1')
  const pick = (key: string): string => {
    const re = new RegExp(`/${key}\\s*\\(((?:\\\\.|[^\\\\)])*)\\)`)
    const m = s.match(re)
    if (!m) return ''
    return m[1]
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/[\x00-\x1f]/g, ' ')
      .trim()
      .slice(0, 200)
  }
  return { title: pick('Title'), author: pick('Author') }
}

async function extractPdfTitle(abs: string): Promise<string> {
  try {
    const buf = await fs.readFile(abs)
    const { title } = extractPdfInfo(buf)
    return title
  } catch {
    return ''
  }
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function topDir(rel: string): string {
  const parts = rel.split(path.sep)
  return parts[0] || '(root)'
}

function escMd(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

async function main() {
  console.log('[archive-index] scanning', RESEARCH)
  const files = await walk(RESEARCH)
  console.log(`[archive-index] ${files.length} files`)

  const byExt = new Map<string, number>()
  for (const f of files) byExt.set(f.ext || '(none)', (byExt.get(f.ext || '(none)') ?? 0) + 1)

  const byTop = new Map<string, FileInfo[]>()
  for (const f of files) {
    const t = topDir(f.rel)
    if (!byTop.has(t)) byTop.set(t, [])
    byTop.get(t)!.push(f)
  }

  const lines: string[] = []
  lines.push('# Arkiv-indeks — research/')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/build-archive-index.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push('')

  // Section 1: summary
  lines.push('## 1. Sammendrag')
  lines.push('')
  lines.push(`**Totalt:** ${files.length} filer`)
  lines.push('')
  lines.push('| Filtype | Antall |')
  lines.push('|---|---:|')
  const extsSorted = Array.from(byExt.entries()).sort((a, b) => b[1] - a[1])
  for (const [ext, n] of extsSorted) lines.push(`| \`${ext || '(none)'}\` | ${n} |`)
  lines.push('')

  lines.push('| Toppmappe | Filer | Sist endret |')
  lines.push('|---|---:|---|')
  const topSorted = Array.from(byTop.entries()).sort((a, b) => b[1].length - a[1].length)
  for (const [top, fs_] of topSorted) {
    const latest = fs_.reduce((m, f) => (f.mtime > m ? f.mtime : m), new Date(0))
    lines.push(`| \`${top}/\` | ${fs_.length} | ${latest.toISOString().slice(0, 10)} |`)
  }
  lines.push('')

  // Section 2: tree (3 levels)
  lines.push('## 2. Katalogtre (3 nivåer)')
  lines.push('')
  const dirCount = new Map<string, number>()
  for (const f of files) {
    const parts = f.rel.split(path.sep)
    for (let depth = 1; depth <= Math.min(3, parts.length - 1); depth++) {
      const key = parts.slice(0, depth).join('/')
      dirCount.set(key, (dirCount.get(key) ?? 0) + 1)
    }
  }
  const dirKeys = Array.from(dirCount.keys()).sort()
  for (const k of dirKeys) {
    const depth = k.split('/').length
    const indent = '  '.repeat(depth - 1)
    const name = k.split('/').pop()
    lines.push(`${indent}- \`${name}/\` (${dirCount.get(k)})`)
  }
  lines.push('')

  // Section 3: document list per top dir
  lines.push('## 3. Dokumenter per toppmappe')
  lines.push('')
  lines.push('Kun filer med endelse: `.pdf`, `.md`, `.html`, `.docx`')
  lines.push('')

  for (const [top, fs_] of topSorted) {
    const docs = fs_.filter((f) => DOC_EXTS.has(f.ext))
    if (docs.length === 0) continue
    lines.push(`### \`${top}/\` — ${docs.length} dokumenter`)
    lines.push('')
    lines.push('| Fil | Type | Størrelse | Endret | Tittel |')
    lines.push('|---|---|---:|---|---|')
    docs.sort((a, b) => a.rel.localeCompare(b.rel))
    for (const d of docs) {
      let title = ''
      if (d.ext === '.md') title = await extractMdTitle(d.abs)
      else if (d.ext === '.pdf') title = await extractPdfTitle(d.abs)
      lines.push(
        `| \`${escMd(d.rel)}\` | ${d.ext.slice(1)} | ${fmtSize(d.size)} | ${d.mtime.toISOString().slice(0, 10)} | ${escMd(title)} |`
      )
    }
    lines.push('')
  }

  // Section 4: cross-references
  lines.push('## 4. Eksisterende manifest og audit-filer')
  lines.push('')
  const refs = [
    ['README.md', 'research/README.md'],
    ['DISCOVERY-MANIFEST.md', 'research/DISCOVERY-MANIFEST.md'],
    ['RESEARCH-AUDIT.md', 'research/RESEARCH-AUDIT.md'],
    ['DESK-RESEARCH-PLAN.md', 'research/DESK-RESEARCH-PLAN.md'],
    ['INCOMING-SOURCES.md', 'research/INCOMING-SOURCES.md'],
    ['RESEARCH-MISSIONS.md', 'research/RESEARCH-MISSIONS.md'],
    ['RESEARCH-EXECUTION-PLAN.md', 'research/RESEARCH-EXECUTION-PLAN.md'],
    ['VERDIKJEDE-KARTLEGGING-PLAN.md', 'research/VERDIKJEDE-KARTLEGGING-PLAN.md'],
    ['evidence-pack/download-backlog-2026-03-18.csv', 'research/evidence-pack/download-backlog-2026-03-18.csv'],
    ['evidence-pack/pubmed-wave1-manifest-2026-03-30.jsonl', 'research/evidence-pack/pubmed-wave1-manifest-2026-03-30.jsonl'],
    ['evidence-pack/statusrapport-mars-2026.md', 'research/evidence-pack/statusrapport-mars-2026.md'],
    ['rammeverk/underlagskartlegging-dokumentkorpus-og-tilgjengelighet-2026-03-18.md', 'research/rammeverk/underlagskartlegging-dokumentkorpus-og-tilgjengelighet-2026-03-18.md'],
    ['rammeverk/plan-for-a-finne-og-laste-ned-flere-rapporter-2026-03-18.md', 'research/rammeverk/plan-for-a-finne-og-laste-ned-flere-rapporter-2026-03-18.md'],
  ]
  for (const [label, p] of refs) {
    try {
      await fs.stat(path.join(ROOT, p))
      lines.push(`- [\`${label}\`](${path.relative(RESEARCH, path.join(ROOT, p))})`)
    } catch {
      /* missing */
    }
  }
  lines.push('')

  await fs.writeFile(OUT, lines.join('\n'), 'utf8')
  console.log(`[archive-index] wrote ${OUT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
