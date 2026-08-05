import 'dotenv/config'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Anvender verifiserings-dommene på SourceCitation.verificationStatus.
// machine_verified -> machine_verified, disputed -> disputed, rejected -> rejected.
// Readiness-refresh (eget steg) promoterer deretter de machine_verified til citable.
// --apply for å skrive; uten flagg = dry-run.

const DIR = 'research/innhenting-2026-08-05/verifisering'
const APPLY = process.argv.includes('--apply')
const MAP: Record<string, string> = {
  machine_verified: 'machine_verified',
  disputed: 'disputed',
  rejected: 'rejected',
}
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  if (!existsSync(DIR)) throw new Error(`Mangler ${DIR}`)
  const verdicts: Record<string, string>[] = []
  for (const f of readdirSync(DIR).filter(x => x.startsWith('verdict-') && x.endsWith('.jsonl'))) {
    for (const line of readFileSync(join(DIR, f), 'utf8').split('\n')) {
      if (line.trim()) { try { verdicts.push(JSON.parse(line)) } catch { /* skip */ } }
    }
  }
  const counts: Record<string, number> = {}
  let applied = 0, unknown = 0
  for (const v of verdicts) {
    const status = MAP[v.verdict]
    counts[v.verdict] = (counts[v.verdict] || 0) + 1
    if (!status || !v.citId) { unknown++; continue }
    if (APPLY) {
      await prisma.sourceCitation.update({
        where: { id: v.citId },
        data: {
          verificationStatus: status as any,
          verifiedAt: new Date('2026-08-05'),
          verifiedBy: 'innhenting-verif-pass',
          confidence: typeof v.confidence === 'number' ? Math.round(v.confidence) : null,
          notes: { set: `${(v.reason ?? '').slice(0, 400)} | verdict=${v.verdict}` },
        },
      }).then(() => applied++).catch(() => unknown++)
    }
  }
  console.log(`Dommer: ${verdicts.length} | fordeling: ${JSON.stringify(counts)}`)
  console.log(APPLY ? `Anvendt: ${applied} | hoppet over: ${unknown}` : 'DRY-RUN (bruk --apply for å skrive)')
}

main().catch(e => { console.error('Apply failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
