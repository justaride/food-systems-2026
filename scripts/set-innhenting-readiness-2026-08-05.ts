import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Scoped readiness for innhenting-citations — KUN cit-innh-2026-08-05-rader.
// Gap-fri: citable_external krever faktisk verified status (ikke bare metadata-tilstedeværelse),
// så den disputerte/uverifiserte havner korrekt på internal_context. Kjører IKKE global refresh
// (som ville over-promotert pre-eksisterende backfill-rader — se spawn_task om regelgapet).

const VERIFIED = new Set(['verified', 'machine_verified', 'human_verified'])
const PRIMARY_LIKE = new Set(['primary', 'dataset', 'registry_snapshot'])
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) })

async function main() {
  const rows = await prisma.sourceCitation.findMany({
    where: { id: { startsWith: 'cit-innh-2026-08-05' } },
    select: { id: true, verificationStatus: true, sourceClass: true, url: true, localPath: true, sourceDocId: true, documentId: true },
  })
  const counts: Record<string, number> = {}
  for (const r of rows) {
    const hasLocator = Boolean(r.url || r.localPath || r.sourceDocId || r.documentId)
    let readiness: string
    if (!hasLocator) readiness = 'blocked_unsourced'
    else if (VERIFIED.has(String(r.verificationStatus))) readiness = PRIMARY_LIKE.has(String(r.sourceClass)) ? 'citable_external' : 'citable_with_note'
    else readiness = 'internal_context'
    counts[readiness] = (counts[readiness] || 0) + 1
    await prisma.sourceCitation.update({ where: { id: r.id }, data: { citationReadiness: readiness as any } })
  }
  console.log(`Scoped readiness satt for ${rows.length} innhenting-citations: ${JSON.stringify(counts)}`)
}

main().catch(e => { console.error('Set readiness failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
