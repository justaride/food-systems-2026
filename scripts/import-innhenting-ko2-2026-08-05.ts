import 'dotenv/config'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, basename } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// KO2-delbatch: de 4 gated OPPDAGET-KØ-kildene som ble hentet manuelt 2026-08-05.
// Egen id-namespace (index 101+) så de eksisterende 51 ikke stokkes om, men samme
// cit-innh-2026-08-05-prefiks så apply-verdicts + set-readiness dekker dem.
// Leser KUN ekstrakt/innhenting-KO2-*.jsonl. Idempotent upsert. Ingen provenanceType (ikke på main-skjema).

const DIR = 'research/innhenting-2026-08-05'
const OFFSET = 100
const ACCESSED = new Date('2026-08-05')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const full = (sp: string) => join(DIR, sp)
const hasVal = (v: unknown) => v !== null && v !== undefined && v !== '' && v !== 'null'
const committedHashes: Record<string, string> = existsSync(join(DIR, 'filehashes.json'))
  ? JSON.parse(readFileSync(join(DIR, 'filehashes.json'), 'utf8'))
  : {}
const fileHashFor = (sp: string): string | null => {
  const fp = full(sp)
  if (existsSync(fp)) return createHash('sha256').update(readFileSync(fp)).digest('hex')
  return committedHashes[sp] ?? null
}
const pad = (n: number) => String(n).padStart(3, '0')
const classOf = (k: string) => (k === 'dataset' ? 'dataset' : k === 'media' ? 'media' : k === 'secondary' ? 'secondary' : 'primary')

type Finding = Record<string, any>
type Post = Record<string, any>

function loadPosts(): Post[] {
  const posts: Post[] = []
  for (const f of readdirSync(join(DIR, 'ekstrakt')).filter(x => x.startsWith('innhenting-KO2-') && x.endsWith('.jsonl'))) {
    for (const line of readFileSync(join(DIR, 'ekstrakt', f), 'utf8').split('\n')) {
      if (line.trim()) { try { posts.push(JSON.parse(line)) } catch { /* skip */ } }
    }
  }
  return posts
}

async function main() {
  const prim = loadPosts()
    .filter(p => ['primary_evidence', 'dataset', 'media', 'secondary'].includes(p.sourceKind) && p.stagedPath)
    .sort((a, b) => String(a.stagedPath).localeCompare(String(b.stagedPath)))

  let nDoc = 0, nCit = 0
  for (let i = 0; i < prim.length; i++) {
    const p = prim[i]
    const idx = OFFSET + i + 1
    const srcId = `src-innh-2026-08-05-${pad(idx)}`
    const fileHash = fileHashFor(p.stagedPath)
    const repoPath = full(p.stagedPath) // repo-rot-relativ sti så systemets verifiserer resolver
    const fields = Array.from(new Set((p.findings ?? []).flatMap((f: Finding) => f.fillsGap ?? [])))

    await prisma.sourceDoc.upsert({
      where: { id: srcId },
      update: {},
      create: {
        id: srcId,
        filename: basename(p.stagedPath),
        title: p.title ?? null,
        author: p.source ?? null,
        year: p.year != null ? String(p.year) : null,
        sourceType: p.sourceKind,
        description: (p.title ?? p.limitations ?? 'Innhentet kilde (KO2)').slice(0, 500),
        relevance: fields.length ? `Tetter felt: ${fields.join(', ')}` : 'innhenting-2026-08-05-ko2',
        url: p.url ?? null,
        doi: p.doi ?? null,
        publisher: p.publisher ?? null,
        accessedAt: ACCESSED,
      },
    })
    nDoc++

    const hard = (p.findings ?? []).filter((f: Finding) => ['maalt', 'modellert'].includes(f.basis) && hasVal(f.value))
    for (let j = 0; j < hard.length; j++) {
      const f = hard[j]
      const citId = `cit-innh-2026-08-05-${pad(idx)}-${pad(j + 1)}`
      const yr = Number.parseInt(String(f.year ?? p.year ?? ''), 10)
      const valUnit = [f.value, f.unit].filter(hasVal).join(' ')
      const notes = [
        `basis=${f.basis}`,
        f.systemBoundary ? `systemgrense=${f.systemBoundary}` : null,
        (f.fillsGap ?? []).length ? `fillsGap=${(f.fillsGap ?? []).join('|')}` : null,
        valUnit ? `verdi=${valUnit}` : null,
      ].filter(Boolean).join('; ')

      await prisma.sourceCitation.upsert({
        where: { id: citId },
        update: { localPath: repoPath, fileHash, pageRef: f.locator ?? null, notes },
        create: {
          id: citId,
          sourceClass: classOf(p.sourceKind) as any,
          citationReadiness: 'blocked_unsourced' as any,
          verificationStatus: 'needs_review' as any,
          citationText: `${f.claim}${valUnit ? ` [${valUnit}]` : ''}. Kilde: ${p.source ?? p.title} (${p.year ?? '?'}), ${f.locator ?? 'uten lokator'}. Basis: ${f.basis}.`.slice(0, 2000),
          title: p.title ?? null,
          publisher: p.publisher ?? null,
          author: p.source ?? null,
          year: Number.isNaN(yr) ? null : yr,
          url: p.url ?? null,
          localPath: repoPath,
          fileHash,
          hashAlgorithm: 'sha256',
          pageRef: f.locator ?? null,
          quote: String(f.claim ?? '').slice(0, 2000),
          accessedAt: ACCESSED,
          captureMethod: 'innhenting-2026-08-05-ko2',
          notes,
          sourceDocId: srcId,
        },
      })
      nCit++
    }
  }
  console.log(`KO2 FERDIG: ${nDoc} SourceDoc + ${nCit} SourceCitation upsertet.`)
}

main().catch(e => { console.error('KO2 import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
