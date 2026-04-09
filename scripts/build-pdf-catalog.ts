import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT_MD = path.join(RESEARCH, 'PDF-KATALOG.md')
const OUT_JSON = path.join(RESEARCH, 'pdf-katalog.json')

type PdfEntry = {
  rel: string
  size: number
  mtime: string
  sha256: string
  pages: number
  title: string
  author: string
  creationDate: string
  producer: string
  textHead: string
}

async function walk(dir: string, acc: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const abs = path.join(dir, e.name)
    if (e.isDirectory()) await walk(abs, acc)
    else if (e.isFile() && abs.toLowerCase().endsWith('.pdf')) acc.push(abs)
  }
  return acc
}

function decodePdfString(raw: string): string {
  // Handle literal (...) strings with escape sequences
  let s = raw
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, ' ')
    .replace(/\\r/g, ' ')
    .replace(/\\t/g, ' ')
  // PDF UTF-16BE BOM
  if (s.startsWith('\u00fe\u00ff')) {
    const bytes = Buffer.from(s.slice(2), 'binary')
    try {
      s = bytes.toString('utf16le')
      // PDF is BE; swap bytes
      const swapped = Buffer.alloc(bytes.length)
      for (let i = 0; i < bytes.length - 1; i += 2) {
        swapped[i] = bytes[i + 1]
        swapped[i + 1] = bytes[i]
      }
      s = swapped.toString('utf16le')
    } catch {
      /* ignore */
    }
  }
  return s.replace(/[\x00-\x08\x0b-\x1f]/g, '').trim()
}

function decodeHexString(hex: string): string {
  const clean = hex.replace(/\s+/g, '')
  if (clean.length === 0) return ''
  const bytes = Buffer.from(clean, 'hex')
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = Buffer.alloc(bytes.length - 2)
    for (let i = 2; i < bytes.length - 1; i += 2) {
      swapped[i - 2] = bytes[i + 1]
      swapped[i - 1] = bytes[i]
    }
    return swapped.toString('utf16le').replace(/\x00/g, '').trim()
  }
  return bytes.toString('latin1').replace(/[\x00-\x08\x0b-\x1f]/g, '').trim()
}

function extractField(content: string, key: string): string {
  // Literal string: /Key (value)
  const lit = new RegExp(`/${key}\\s*\\(((?:\\\\.|[^\\\\)])*)\\)`, 's')
  const m1 = content.match(lit)
  if (m1) return decodePdfString(m1[1]).slice(0, 300)
  // Hex string: /Key <hex>
  const hex = new RegExp(`/${key}\\s*<([0-9A-Fa-f\\s]*)>`)
  const m2 = content.match(hex)
  if (m2) return decodeHexString(m2[1]).slice(0, 300)
  return ''
}

function countPages(content: string): number {
  const m = content.match(/\/Type\s*\/Page[^s]/g)
  return m ? m.length : 0
}

function extractTextHead(content: string): string {
  // crude: find (...) strings inside BT...ET blocks
  const bt = content.match(/BT([\s\S]*?)ET/g)
  if (!bt) return ''
  const chunks: string[] = []
  for (const block of bt.slice(0, 5)) {
    const strs = block.match(/\(((?:\\.|[^\\)])*)\)/g)
    if (strs) for (const s of strs) chunks.push(decodePdfString(s.slice(1, -1)))
    if (chunks.join(' ').length > 300) break
  }
  return chunks.join(' ').replace(/\s+/g, ' ').trim().slice(0, 250)
}

async function processPdf(abs: string): Promise<PdfEntry> {
  const buf = await fs.readFile(abs)
  const stat = await fs.stat(abs)
  const content = buf.toString('latin1')
  const sha256 = crypto.createHash('sha256').update(buf).digest('hex')
  return {
    rel: path.relative(RESEARCH, abs),
    size: stat.size,
    mtime: stat.mtime.toISOString().slice(0, 10),
    sha256,
    pages: countPages(content),
    title: extractField(content, 'Title'),
    author: extractField(content, 'Author'),
    creationDate: extractField(content, 'CreationDate').replace(/^D:/, '').slice(0, 14),
    producer: extractField(content, 'Producer'),
    textHead: extractTextHead(content),
  }
}

function fmtSize(n: number): string {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

function esc(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').slice(0, 120)
}

async function main() {
  const pdfs = await walk(RESEARCH)
  console.log(`[pdf-catalog] ${pdfs.length} PDFs`)
  const entries: PdfEntry[] = []
  for (const p of pdfs) {
    try {
      entries.push(await processPdf(p))
    } catch (e) {
      console.error(`[pdf-catalog] failed ${p}:`, (e as Error).message)
    }
  }

  entries.sort((a, b) => a.rel.localeCompare(b.rel))

  // Dedupe by sha256
  const byHash = new Map<string, PdfEntry[]>()
  for (const e of entries) {
    if (!byHash.has(e.sha256)) byHash.set(e.sha256, [])
    byHash.get(e.sha256)!.push(e)
  }
  const dupes = Array.from(byHash.entries()).filter(([, v]) => v.length > 1)

  // Group by top dir
  const byTop = new Map<string, PdfEntry[]>()
  for (const e of entries) {
    const top = e.rel.split(path.sep)[0] || '(root)'
    if (!byTop.has(top)) byTop.set(top, [])
    byTop.get(top)!.push(e)
  }

  const lines: string[] = []
  lines.push('# PDF-katalog — research/')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/build-pdf-catalog.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`**Totalt:** ${entries.length} PDF-er, ${dupes.length} dupe-grupper`)
  lines.push('')

  if (dupes.length > 0) {
    lines.push('## Duplikater (samme SHA256)')
    lines.push('')
    for (const [hash, group] of dupes) {
      lines.push(`- \`${hash.slice(0, 12)}\`:`)
      for (const g of group) lines.push(`  - \`${g.rel}\``)
    }
    lines.push('')
  }

  for (const [top, arr] of Array.from(byTop.entries()).sort()) {
    lines.push(`## \`${top}/\` — ${arr.length} PDF`)
    lines.push('')
    lines.push('| Fil | Størrelse | Sider | Tittel (metadata) | Forfatter | Creation |')
    lines.push('|---|---:|---:|---|---|---|')
    for (const e of arr) {
      const title = e.title || e.textHead || ''
      lines.push(
        `| \`${esc(e.rel)}\` | ${fmtSize(e.size)} | ${e.pages || '?'} | ${esc(title)} | ${esc(e.author)} | ${esc(e.creationDate)} |`
      )
    }
    lines.push('')
  }

  await fs.writeFile(OUT_MD, lines.join('\n'), 'utf8')
  await fs.writeFile(OUT_JSON, JSON.stringify(entries, null, 2), 'utf8')
  console.log(`[pdf-catalog] wrote ${OUT_MD}`)
  console.log(`[pdf-catalog] wrote ${OUT_JSON}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
