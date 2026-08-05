import 'dotenv/config'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, basename } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Import av innhentingssesjon 2026-08-05: primærevidens-kilder + numeriske findings.
// Lag 1: SourceDoc per primærkilde. Lag 2: SourceCitation per målt/modellert-tall.
// Alt merket needs_review / draft — IKKE whitepaper-klart. Idempotent (upsert på deterministisk id).

const DIR = 'research/innhenting-2026-08-05'
const ACCESSED = new Date('2026-08-05')
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const full = (sp: string) => join(DIR, sp)
const hasVal = (v: unknown) => v !== null && v !== undefined && v !== '' && v !== 'null'
const sha256 = (p: string) => existsSync(p) ? createHash('sha256').update(readFileSync(p)).digest('hex') : null
const pad = (n: number) => String(n).padStart(3, '0')
const classOf = (k: string) => (k === 'dataset' ? 'dataset' : 'primary')

type Finding = Record<string, any>
type Post = Record<string, any>

function loadPosts(): Post[] {
  const posts: Post[] = []
  for (const f of readdirSync(join(DIR, 'ekstrakt')).filter(x => x.startsWith('innhenting-') && x.endsWith('.jsonl'))) {
    for (const line of readFileSync(join(DIR, 'ekstrakt', f), 'utf8').split('\n')) {
      if (line.trim()) { try { posts.push(JSON.parse(line)) } catch { /* skip */ } }
    }
  }
  return posts
}

async function main() {
  const posts = loadPosts()
  const prim = posts
    .filter(p => ['primary_evidence', 'dataset'].includes(p.sourceKind) && p.stagedPath)
    .sort((a, b) => String(a.stagedPath).localeCompare(String(b.stagedPath)))

  let nDoc = 0, nCit = 0
  for (let i = 0; i < prim.length; i++) {
    const p = prim[i]
    const srcId = `src-innh-2026-08-05-${pad(i + 1)}`
    const fp = full(p.stagedPath)
    const fileHash = sha256(fp)
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
        description: (p.title ?? p.limitations ?? 'Innhentet primærkilde').slice(0, 500),
        relevance: fields.length ? `Tetter felt: ${fields.join(', ')}` : 'innhenting-2026-08-05',
        url: p.url ?? null,
        doi: p.doi ?? null,
        publisher: p.publisher ?? null,
        provenanceType: 'primary_evidence',
        accessedAt: ACCESSED,
      },
    })
    nDoc++

    const hard = (p.findings ?? []).filter((f: Finding) => ['maalt', 'modellert'].includes(f.basis) && hasVal(f.value))
    for (let j = 0; j < hard.length; j++) {
      const f = hard[j]
      const citId = `cit-innh-2026-08-05-${pad(i + 1)}-${pad(j + 1)}`
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
        update: {},
        create: {
          id: citId,
          sourceClass: classOf(p.sourceKind) as any,
          citationReadiness: 'internal_context' as any,
          verificationStatus: 'needs_review' as any,
          citationText: `${f.claim}${valUnit ? ` [${valUnit}]` : ''}. Kilde: ${p.source ?? p.title} (${p.year ?? '?'}), ${f.locator ?? 'uten lokator'}. Basis: ${f.basis}.`.slice(0, 2000),
          title: p.title ?? null,
          publisher: p.publisher ?? null,
          author: p.source ?? null,
          year: Number.isNaN(yr) ? null : yr,
          url: p.url ?? null,
          localPath: p.stagedPath,
          fileHash,
          hashAlgorithm: 'sha256',
          pageRef: f.locator ?? null,
          quote: String(f.claim ?? '').slice(0, 2000),
          accessedAt: ACCESSED,
          captureMethod: 'innhenting-2026-08-05',
          notes,
          sourceDocId: srcId,
        },
      })
      nCit++
    }
  }
  console.log(`FERDIG: ${nDoc} SourceDoc + ${nCit} SourceCitation upsertet (needs_review/draft).`)
}

main()
  .catch(e => { console.error('Import failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
