import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const RESEARCH = path.join(ROOT, 'research')
const OUT = path.join(RESEARCH, 'ORPHAN-REVIEW.md')
const MAP = path.join(RESEARCH, 'seed-pdf-map.json')
const KATALOG = path.join(RESEARCH, 'pdf-katalog.json')

type MapFile = { orphanPdfs: string[] }
type PdfEntry = {
  rel: string
  size: number
  mtime: string
  pages: number
  title: string
  author: string
  creationDate: string
  producer: string
  textHead: string
}

type Proposal = {
  pdf: string
  suggestedId: string
  suggestedTitle: string
  suggestedYear: string
  category: string
  targetFile: 'reports.ts' | 'theses.ts' | 'sources.ts' | 'pubmed-wave2'
  note: string
}

function slugFromFilename(filename: string): string {
  return path
    .basename(filename, '.pdf')
    .toLowerCase()
    .replace(/[æø]/g, 'o')
    .replace(/[å]/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractYear(s: string): string {
  const m = s.match(/\b(19|20)\d{2}\b/)
  return m ? m[0] : ''
}

function titleCase(s: string): string {
  return s
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim()
}

function classify(rel: string): { category: string; target: Proposal['targetFile'] } {
  if (rel.startsWith('evidence-pack/akademia/pubmed/')) return { category: 'pubmed', target: 'pubmed-wave2' }
  if (rel.startsWith('evidence-pack/akademia/')) return { category: 'thesis/academic', target: 'theses.ts' }
  if (rel.startsWith('evidence-pack/arsrapporter/')) return { category: 'arsrapport', target: 'reports.ts' }
  if (rel.startsWith('evidence-pack/tilsyn/')) return { category: 'tilsyn', target: 'reports.ts' }
  if (rel.startsWith('evidence-pack/offentlig/')) return { category: 'offentlig', target: 'reports.ts' }
  if (rel.startsWith('evidence-pack/nordisk/')) return { category: 'nordisk', target: 'reports.ts' }
  return { category: 'other', target: 'reports.ts' }
}

async function main() {
  const map: MapFile = JSON.parse(await fs.readFile(MAP, 'utf8'))
  const katalog: PdfEntry[] = JSON.parse(await fs.readFile(KATALOG, 'utf8'))
  const byRel = new Map(katalog.map((k) => [k.rel, k]))

  const looksLikeGarbage = (s: string): boolean => {
    if (!s) return true
    const printable = s.replace(/[^\x20-\x7eÀ-ÿ]/g, '').length
    return printable / s.length < 0.85
  }

  const proposals: Proposal[] = []
  for (const orphan of map.orphanPdfs) {
    const meta = byRel.get(orphan)
    const slug = slugFromFilename(orphan)
    const metaTitle = meta?.title || meta?.textHead || ''
    const suggestedTitle = looksLikeGarbage(metaTitle)
      ? titleCase(path.basename(orphan, '.pdf'))
      : metaTitle
    const suggestedYear = extractYear(orphan) || (meta?.creationDate || '').slice(0, 4)
    const { category, target } = classify(orphan)
    proposals.push({
      pdf: orphan,
      suggestedId: slug.replace(/-pdf$/, ''),
      suggestedTitle: suggestedTitle.slice(0, 150),
      suggestedYear,
      category,
      targetFile: target,
      note: meta ? `${meta.pages || '?'}s · ${(meta.size / 1024).toFixed(0)}KB` : '',
    })
  }

  // Group by target file
  const byTarget = new Map<string, Proposal[]>()
  for (const p of proposals) {
    if (!byTarget.has(p.targetFile)) byTarget.set(p.targetFile, [])
    byTarget.get(p.targetFile)!.push(p)
  }

  const lines: string[] = []
  lines.push('# Foreldreløse PDF-er — forslag til innlegging i seed')
  lines.push('')
  lines.push('> AUTO-GENERERT av `scripts/build-orphan-review.ts` — ikke rediger manuelt.')
  lines.push(`> Generert: ${new Date().toISOString()}`)
  lines.push('')
  lines.push(`**Totalt ${proposals.length} foreldreløse PDF-er** som ikke er koblet til noen entry i seed-filene.`)
  lines.push('')
  lines.push('Hver seksjon under foreslår hvor PDF-en bør registreres. Gå gjennom, bekreft eller avvis, og legg til i aktuelle `src/lib/data/*.ts`.')
  lines.push('')

  for (const target of ['reports.ts', 'theses.ts', 'sources.ts', 'pubmed-wave2'] as const) {
    const ps = byTarget.get(target) || []
    if (ps.length === 0) continue
    lines.push(`## → \`${target}\` (${ps.length})`)
    lines.push('')
    lines.push('| Foreslått ID | Kategori | Tittel (fra metadata/filnavn) | År | PDF | Note |')
    lines.push('|---|---|---|---|---|---|')
    for (const p of ps.sort((a, b) => a.category.localeCompare(b.category) || a.suggestedId.localeCompare(b.suggestedId))) {
      lines.push(
        `| \`${p.suggestedId}\` | ${p.category} | ${p.suggestedTitle.replace(/\|/g, '\\|').slice(0, 100)} | ${p.suggestedYear} | \`${p.pdf}\` | ${p.note} |`
      )
    }
    lines.push('')
  }

  lines.push('## Neste steg')
  lines.push('')
  lines.push('1. Gjennomgå hver seksjon, bekreft at klassifiseringen er riktig.')
  lines.push('2. Legg inn valgte entries i `prisma/seed-data/reports.ts` eller `theses.ts` (manuell redigering — metadata må hentes eller skrives).')
  lines.push('3. Legg til manuell mapping i `research/seed-pdf-map.overrides.json` så audit plukker dem opp.')
  lines.push('4. Re-kjør `node --experimental-strip-types scripts/build-seed-pdf-map.ts` og `scripts/audit-platform-linkage.ts`.')
  lines.push('5. For `pubmed-wave2`: lag et eget wave-2 manifest (`pubmed-wave2-manifest-YYYY-MM-DD.jsonl`) hvis ikke allerede eksisterende.')
  lines.push('')

  await fs.writeFile(OUT, lines.join('\n'), 'utf8')
  console.log(`[orphan-review] wrote ${OUT}`)
  console.log(`[orphan-review] ${proposals.length} proposals across ${byTarget.size} targets`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
