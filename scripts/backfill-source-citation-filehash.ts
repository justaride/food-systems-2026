// Backfill SourceCitation.fileHash for rows that have a localPath but no hash.
//
// Computes sha256 of the file on disk and writes it to the database. Skips
// rows where the file does not exist, where the path resolves outside the
// repo root, or where a hash is already present.
//
// Dry-run by default. Pass --apply to write changes.
//
// Usage:
//   tsx scripts/backfill-source-citation-filehash.ts            # preview
//   tsx scripts/backfill-source-citation-filehash.ts --apply    # commit
//
// Critical analysis finding (PR #83): 0% of SourceCitation rows have fileHash.
// This script lays the foundation for integrity checks against drift over time.

import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, isAbsolute } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function parseArgs(argv: string[]): { apply: boolean } {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }
  return { apply: argv.includes('--apply') }
}

function isWithinRoot(absPath: string, root: string): boolean {
  return absPath === root || absPath.startsWith(root + '/')
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const root = process.cwd()
  const candidates = await prisma.sourceCitation.findMany({
    where: { localPath: { not: null }, fileHash: null },
    select: { id: true, localPath: true, hashAlgorithm: true },
  })

  console.log(`Candidates with localPath and no fileHash: ${candidates.length}`)
  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}\n`)

  let hashed = 0
  let skippedMissing = 0
  let skippedUnsafePath = 0
  let skippedNonSha256 = 0
  let errors = 0

  for (const row of candidates) {
    const rel = row.localPath!
    if (row.hashAlgorithm && row.hashAlgorithm !== 'sha256') {
      skippedNonSha256++
      continue
    }
    const abs = isAbsolute(rel) ? rel : resolve(root, rel)
    if (!isWithinRoot(abs, root)) {
      skippedUnsafePath++
      continue
    }
    if (!existsSync(abs)) {
      skippedMissing++
      continue
    }

    try {
      const content = readFileSync(abs)
      const hash = createHash('sha256').update(content).digest('hex')
      if (apply) {
        await prisma.sourceCitation.update({
          where: { id: row.id },
          data: { fileHash: hash, hashAlgorithm: 'sha256' },
        })
      }
      hashed++
    } catch (e) {
      errors++
      console.error(`  ERROR ${row.id} (${rel}):`, (e as Error).message.slice(0, 80))
    }
  }

  console.log('── Summary ────────────────────')
  console.log(`  Hashed${apply ? ' and wrote' : ' (preview)'}:    ${hashed}`)
  console.log(`  Skipped — file missing:    ${skippedMissing}`)
  console.log(`  Skipped — unsafe path:     ${skippedUnsafePath}`)
  console.log(`  Skipped — non-sha256 algo: ${skippedNonSha256}`)
  console.log(`  Errors:                    ${errors}`)
  if (!apply) {
    console.log(`\n  Re-run with --apply to write ${hashed} hashes to the database.`)
  }
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
