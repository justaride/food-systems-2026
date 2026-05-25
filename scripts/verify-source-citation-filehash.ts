// Verify integrity of SourceCitation rows that have both localPath and fileHash.
//
// Computes sha256 of each file currently on disk and compares against the
// stored hash. Reports drift. Read-only — does not modify the database.
//
// Usage: tsx scripts/verify-source-citation-filehash.ts
//
// Exits non-zero if any row's file has drifted from its stored hash. Designed
// to run periodically (e.g. weekly via cron) so that silent content drift in
// cited sources is caught.

import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const rows = await prisma.sourceCitation.findMany({
    where: { localPath: { not: null }, fileHash: { not: null } },
    select: { id: true, localPath: true, fileHash: true, hashAlgorithm: true },
  })

  const root = process.cwd()
  let matched = 0
  let drifted = 0
  let missing = 0
  let nonSha256 = 0

  const drifts: Array<{ id: string; localPath: string }> = []

  for (const row of rows) {
    if (row.hashAlgorithm && row.hashAlgorithm !== 'sha256') {
      nonSha256++
      continue
    }
    const abs = isAbsolute(row.localPath!) ? row.localPath! : resolve(root, row.localPath!)
    if (!existsSync(abs)) {
      missing++
      continue
    }
    const content = readFileSync(abs)
    const hash = createHash('sha256').update(content).digest('hex')
    if (hash === row.fileHash) {
      matched++
    } else {
      drifted++
      drifts.push({ id: row.id, localPath: row.localPath! })
    }
  }

  console.log(`Verified ${rows.length} SourceCitation rows with stored hashes.\n`)
  console.log(`  ✓ Matched:          ${matched}`)
  console.log(`  ✗ Drifted:          ${drifted}`)
  console.log(`  ? File missing:     ${missing}`)
  console.log(`  - Non-sha256 algo:  ${nonSha256}`)

  if (drifted > 0) {
    console.log('\nDrifted files (content changed since hash was recorded):')
    for (const d of drifts) {
      console.log(`  ${d.id}  ${d.localPath}`)
    }
    process.exit(1)
  }
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
