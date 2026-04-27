import 'dotenv/config'
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { join, basename } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ROOT = process.cwd()

const STALE_PREFIX = 'incoming/food-research-process-2026-04-20/'
const SHA_PREFIX_LENGTH = 10

type CatalogEntry = {
  rel: string
  size: number
  sha256: string
}

function pickCanonicalPath(paths: string[]): string {
  const score = (p: string): number => {
    if (p.includes('/evidence-pack/')) return 0
    if (p.includes('99_Exact_Duplicates')) return 2
    return 1
  }
  return [...paths].sort((a, b) => score(a) - score(b))[0]
}

type Status = 'auto' | 'auto_canonical' | 'multi_unresolved' | 'no_sha_match' | 'invalid_prefix'

type Update = {
  id: string
  oldPath: string
  newPath: string
  status: Status
  candidates: string[]
}

async function main(): Promise<void> {
  const apply = process.argv.includes('--apply')

  const catalogPath = join(ROOT, 'research', 'pdf-katalog.json')
  if (!existsSync(catalogPath)) {
    console.error(`pdf-katalog.json not found at ${catalogPath}`)
    process.exit(1)
  }
  const catalog: CatalogEntry[] = JSON.parse(readFileSync(catalogPath, 'utf-8'))

  const shaPrefixIndex = new Map<string, string[]>()
  for (const entry of catalog) {
    const prefix = entry.sha256.slice(0, SHA_PREFIX_LENGTH)
    const targetRel = `research/${entry.rel}`
    if (!shaPrefixIndex.has(prefix)) shaPrefixIndex.set(prefix, [])
    shaPrefixIndex.get(prefix)!.push(targetRel)
  }
  console.log(
    `Indexed ${shaPrefixIndex.size} unique SHA-${SHA_PREFIX_LENGTH * 4}-prefixes in pdf-katalog.json`,
  )

  const staleDocs = await prisma.document.findMany({
    where: { filePath: { startsWith: STALE_PREFIX } },
    select: { id: true, filePath: true, slug: true, title: true },
  })
  console.log(`Found ${staleDocs.length} Documents with stale filePath`)

  const updates: Update[] = []

  for (const doc of staleDocs) {
    if (!doc.filePath) continue
    const bn = basename(doc.filePath)
    const prefixMatch = bn.match(/^([0-9a-f]{10})-/)

    if (!prefixMatch) {
      updates.push({
        id: doc.id,
        oldPath: doc.filePath,
        newPath: '',
        status: 'invalid_prefix',
        candidates: [],
      })
      continue
    }

    const prefix = prefixMatch[1]
    const candidates = shaPrefixIndex.get(prefix) ?? []

    if (candidates.length === 0) {
      updates.push({
        id: doc.id,
        oldPath: doc.filePath,
        newPath: '',
        status: 'no_sha_match',
        candidates: [],
      })
      continue
    }

    if (candidates.length === 1) {
      const target = candidates[0]
      if (existsSync(join(ROOT, target))) {
        updates.push({
          id: doc.id,
          oldPath: doc.filePath,
          newPath: target,
          status: 'auto',
          candidates,
        })
      } else {
        updates.push({
          id: doc.id,
          oldPath: doc.filePath,
          newPath: target,
          status: 'no_sha_match',
          candidates: [`STALE: ${target} no longer on disk`],
        })
      }
      continue
    }

    const canonical = pickCanonicalPath(candidates)
    if (existsSync(join(ROOT, canonical))) {
      updates.push({
        id: doc.id,
        oldPath: doc.filePath,
        newPath: canonical,
        status: 'auto_canonical',
        candidates,
      })
    } else {
      updates.push({
        id: doc.id,
        oldPath: doc.filePath,
        newPath: canonical,
        status: 'multi_unresolved',
        candidates,
      })
    }
  }

  const auto = updates.filter((u) => u.status === 'auto').length
  const autoCanonical = updates.filter((u) => u.status === 'auto_canonical').length
  const unresolved = updates.filter((u) => u.status === 'multi_unresolved').length
  const noShaMatch = updates.filter((u) => u.status === 'no_sha_match').length
  const invalidPrefix = updates.filter((u) => u.status === 'invalid_prefix').length

  console.log(`  auto:             ${auto} (single SHA match, file exists)`)
  console.log(`  auto_canonical:   ${autoCanonical} (multi SHA match, picked canonical)`)
  console.log(`  multi_unresolved: ${unresolved} (multi SHA match but canonical missing)`)
  console.log(`  no_sha_match:     ${noShaMatch} (SHA prefix not in pdf-katalog)`)
  console.log(`  invalid_prefix:   ${invalidPrefix} (filename has no SHA-prefix)`)

  function csvEscape(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  const logLines = [
    'id,oldPath,newPath,status,candidate_count,candidates',
    ...updates.map((u) =>
      [
        u.id,
        csvEscape(u.oldPath),
        csvEscape(u.newPath),
        u.status,
        String(u.candidates.length),
        csvEscape(u.candidates.join(' | ')),
      ].join(','),
    ),
  ]
  writeFileSync(
    join(ROOT, 'research', 'document-path-remap-log.csv'),
    logLines.join('\n') + '\n',
  )
  console.log(`\nLog written: research/document-path-remap-log.csv`)

  if (!apply) {
    console.log('\n[DRY RUN] No DB changes. Re-run with --apply to update Document.filePath.')
    await prisma.$disconnect()
    return
  }

  const toApply = updates.filter(
    (u) => u.status === 'auto' || u.status === 'auto_canonical',
  )
  let applied = 0
  for (const u of toApply) {
    if (!u.newPath) continue
    await prisma.document.update({
      where: { id: u.id },
      data: { filePath: u.newPath },
    })
    applied++
  }
  const skipped = updates.length - applied
  console.log(
    `\nApplied ${applied} updates. ${skipped} entries unchanged (need manual review: see log).`,
  )

  await prisma.$disconnect()
}

main()
