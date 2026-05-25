import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT = path.join(RESEARCH, 'PLATTFORM-KOBLING.md')
const MAP_FILE = path.join(RESEARCH, 'seed-pdf-map.json')

type MapEntry = {
  pdf: string
  score: number
  confidence: 'high' | 'medium' | 'low'
  why: string
}

type SeedMap = {
  generatedAt: string
  theses: Record<string, MapEntry>
  reports: Record<string, MapEntry>
  sources: Record<string, MapEntry>
  orphanPdfs: string[]
  seedWithoutPdf: {
    theses: string[]
    reports: string[]
    sources: string[]
  }
}

type Entry = {
  id: string
  title: string
  url: string
  extra: string
}

// ─── Seed parsing ───
function parseEntries(src: string, arrayName: string): string[] {
  const re = new RegExp(`export const ${arrayName}[^=]*=\\s*\\[`, 'm')
  const m = src.match(re)
  if (!m) return []
  let i = (m.index ?? 0) + m[0].length
  const entries: string[] = []
  let depth = 1
  let start = -1
  let inStr: string | null = null
  let escape = false
  while (i < src.length && depth > 0) {
    const c = src[i]
    if (inStr) {
      if (escape) escape = false
      else if (c === '\\') escape = true
      else if (c === inStr) inStr = null
    } else {
      if (c === '"' || c === "'" || c === '`') inStr = c
      else if (c === '{') {
        if (depth === 1) start = i
        depth++
      } else if (c === '}') {
        depth--
        if (depth === 1 && start >= 0) {
          entries.push(src.slice(start, i + 1))
          start = -1
        }
      } else if (c === '[') depth++
      else if (c === ']') {
        depth--
        if (depth === 0) break
      }
    }
    i++
  }
  return entries
}

function field(block: string, key: string): string {
  const re = new RegExp(`\\b${key}\\s*:\\s*(['\"\`])((?:\\\\.|(?!\\1).)*?)\\1`, 's')
  const m = block.match(re)
  if (m) return m[2]
  const num = block.match(new RegExp(`\\b${key}\\s*:\\s*(\\d+)`))
  return num ? num[1] : ''
}

// ─── MD sidecar matching ───
async function walkMd(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) await walkMd(abs, acc)
    else if (e.isFile() && abs.endsWith('.md')) acc.push(abs)
  }
  return acc
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[æø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function findMdFor(entry: Entry, mdFiles: string[], pdfPath: string | undefined): string {
  // 1. If we have a PDF match, look for an MD with the same basename
  if (pdfPath) {
    const pdfStem = path.basename(pdfPath, '.pdf')
    for (const abs of mdFiles) {
      const stem = path.basename(abs, '.md')
      if (stem === pdfStem) return path.relative(RESEARCH, abs).toLowerCase()
    }
  }
  // 2. id-based match
  const idSlug = slugify(entry.id)
  if (idSlug.length >= 4) {
    for (const abs of mdFiles) {
      const base = slugify(path.basename(abs, '.md'))
      if (base === idSlug || base.includes(idSlug)) return path.relative(RESEARCH, abs).toLowerCase()
    }
  }
  return ''
}

function esc(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').slice(0, 140)
}

async function main() {
  const map: SeedMap = JSON.parse(await fs.readFile(MAP_FILE, 'utf8'))

  const thesesSrc = await fs.readFile(path.join(ROOT, 'prisma/seed-data/theses.ts'), 'utf8')
  const reportsSrc = await fs.readFile(path.join(ROOT, 'prisma/seed-data/reports.ts'), 'utf8')
  const sourcesSrc = await fs.readFile(path.join(ROOT, 'prisma/seed-data/sources.ts'), 'utf8')

  const theses: Entry[] = parseEntries(thesesSrc, 'theses').map((b) => ({
    id: field(b, 'id'),
    title: field(b, 'title'),
    url: field(b, 'url'),
    extra: field(b, 'authors'),
  }))
  const reports: Entry[] = parseEntries(reportsSrc, 'reports').map((b) => ({
    id: field(b, 'id'),
    title: field(b, 'title'),
    url: field(b, 'sourceUrl'),
    extra: field(b, 'institution'),
  }))
  const sources: Entry[] = parseEntries(sourcesSrc, 'sources').map((b) => ({
    id: field(b, 'id'),
    title: field(b, 'description'),
    url: field(b, 'url'),
    extra: field(b, 'filename'),
  }))

  const mdFiles = await walkMd(RESEARCH)

  const lines: string[] = []
  lines.push('# Plattform-kobling — seed ↔ arkiv')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/audit-platform-linkage.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push(`> Basert på: \`seed-pdf-map.json\` (generert ${map.generatedAt})`)
  lines.push('')
  lines.push('Denne rapporten kobler seed-entries i `src/lib/data/{theses,reports,sources}.ts` mot faktiske filer i `research/`. PDF-kobling leses fra den kanoniske mappen `seed-pdf-map.json` (generert av `build-seed-pdf-map.ts`). MD-kobling utledes via filnavn/id-heuristikk.')
  lines.push('')

  const summarize = (
    entries: Entry[],
    mapPart: Record<string, MapEntry>,
  ): { total: number; pdf: number; md: number; none: number; rows: { e: Entry; pdf: string; md: string; conf: string }[] } => {
    const rows: { e: Entry; pdf: string; md: string; conf: string }[] = []
    for (const e of entries) {
      const m = mapPart[e.id]
      const pdf = m ? m.pdf : ''
      const md = findMdFor(e, mdFiles, pdf)
      rows.push({ e, pdf, md, conf: m ? m.confidence : 'none' })
    }
    return {
      total: rows.length,
      pdf: rows.filter((r) => r.pdf).length,
      md: rows.filter((r) => r.md).length,
      none: rows.filter((r) => !r.pdf && !r.md).length,
      rows,
    }
  }

  const st = summarize(theses, map.theses)
  const sr = summarize(reports, map.reports)
  const ss = summarize(sources, map.sources)

  lines.push('## Sammendrag')
  lines.push('')
  lines.push('| Type | Total | Lokal PDF | Lokal MD | Ingen match |')
  lines.push('|---|---:|---:|---:|---:|')
  lines.push(`| Theses | ${st.total} | ${st.pdf} | ${st.md} | ${st.none} |`)
  lines.push(`| Reports | ${sr.total} | ${sr.pdf} | ${sr.md} | ${sr.none} |`)
  lines.push(`| SourceDocs | ${ss.total} | ${ss.pdf} | ${ss.md} | ${ss.none} |`)
  lines.push('')
  lines.push(`**Foreldreløse PDF-er:** ${map.orphanPdfs.length} (se seksjon 4)`)
  lines.push('')

  const renderTable = (
    title: string,
    data: ReturnType<typeof summarize>,
    extraLabel: string
  ) => {
    lines.push(`## ${title}`)
    lines.push('')
    lines.push(`| ID | Tittel | ${extraLabel} | URL | Lokal PDF | Lokal MD | Conf |`)
    lines.push('|---|---|---|---|---|---|---|')
    for (const r of data.rows) {
      lines.push(
        `| \`${esc(r.e.id)}\` | ${esc(r.e.title)} | ${esc(r.e.extra)} | ${r.e.url ? '✓' : '—'} | ${
          r.pdf ? `\`${esc(r.pdf)}\`` : '—'
        } | ${r.md ? `\`${esc(r.md)}\`` : '—'} | ${r.conf} |`
      )
    }
    lines.push('')
  }

  renderTable(`1. Theses → lokal fil (${st.total})`, st, 'Forfattere')
  renderTable(`2. Reports → lokal fil (${sr.total})`, sr, 'Institusjon')
  renderTable(`3. SourceDocs → lokal fil (${ss.total})`, ss, 'Filnavn')

  lines.push(`## 4. Foreldreløse PDF-er (${map.orphanPdfs.length})`)
  lines.push('')
  lines.push('PDF-filer i `research/` som ikke er koblet til noen seed-entry. Kandidater for innlegging i `src/lib/data/{reports,theses}.ts` eller eksklusjon via `seed-pdf-map.overrides.json`.')
  lines.push('')
  for (const p of map.orphanPdfs) lines.push(`- \`${p}\``)
  lines.push('')

  await fs.writeFile(OUT, lines.join('\n'), 'utf8')
  console.log(`[audit] wrote ${OUT}`)
  console.log(`[audit] theses: ${st.pdf}/${st.total} pdf · reports: ${sr.pdf}/${sr.total} pdf · sources: ${ss.pdf}/${ss.total} pdf`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
