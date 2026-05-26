// Backfill Producer.primaryCitationId by linking every producer to a
// SourceCitation that represents the Landbruksdirektoratet produsentregister
// open-data snapshot used during import.
//
// Resolves kritisk-analyse anbefaling #5: Producer rows had no kildesporing
// at all. After this run, every producer points to the registry snapshot it
// came from, with `accessedAt` capturing when the snapshot was loaded.
//
// Idempotent: re-running finds the existing citation and skips already-linked
// producers.
//
// Dry-run by default; pass --apply to write.
//
// npm script: db:backfill:producer-citation[:apply]

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function parseArgs(argv: string[]): { apply: boolean } {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }
  return { apply: argv.includes('--apply') }
}

const REGISTRY_URL =
  'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/foretak/dataset_extended.csv'

const CITATION_TEXT =
  'Landbruksdirektoratet. (2026). Foretak — produsentregister åpen datasett.'

async function findOrCreateRegistryCitation(prisma: PrismaClient, apply: boolean) {
  const existing = await prisma.sourceCitation.findFirst({
    where: { citationText: CITATION_TEXT },
    select: { id: true },
  })
  if (existing) return { id: existing.id, created: false }
  if (!apply) return { id: '(would-create)', created: true }

  const created = await prisma.sourceCitation.create({
    data: {
      citationText: CITATION_TEXT,
      title: 'Landbruksdirektoratet produsentregister (foretak)',
      publisher: 'Landbruksdirektoratet',
      year: 2026,
      url: REGISTRY_URL,
      sourceClass: 'registry_snapshot',
      citationReadiness: 'citable_external',
      verificationStatus: 'verified',
      accessedAt: new Date(),
      captureMethod: 'manual',
    },
    select: { id: true },
  })
  return { id: created.id, created: true }
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}\n`)

  const { id: citationId, created } = await findOrCreateRegistryCitation(prisma, apply)
  console.log(
    `Registry SourceCitation: ${created ? 'created' : 'exists'}  id=${citationId}\n`,
  )

  const total = await prisma.producer.count()
  const alreadyLinked = await prisma.producer.count({
    where: { primaryCitationId: { not: null } },
  })
  const unlinked = await prisma.producer.count({
    where: { primaryCitationId: null },
  })
  console.log(`Producers: total=${total}, already-linked=${alreadyLinked}, unlinked=${unlinked}`)

  if (unlinked === 0) {
    console.log('Nothing to backfill.')
    return
  }

  if (!apply) {
    console.log(`Would set primaryCitationId on ${unlinked} producers.`)
    console.log('Re-run with --apply to write.')
    return
  }

  const result = await prisma.producer.updateMany({
    where: { primaryCitationId: null },
    data: { primaryCitationId: citationId },
  })
  console.log(`Updated ${result.count} producers.`)
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
