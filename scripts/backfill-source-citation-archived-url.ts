// Backfill SourceCitation.archivedUrl from Wayback Machine Availability API.
//
// Strategy: for each row with a url but no archivedUrl, query
// http://archive.org/wayback/available?url=<url> and store the closest
// existing snapshot URL. Does NOT trigger new snapshots (use
// https://web.archive.org/save/<url> for that — heavier rate limits).
//
// Dry-run by default (queries API but does not write to DB).
// Pass --apply to write changes. Pass --limit N to cap candidates per run.
//
// Critical analysis (PR #83): 0% archivedUrl coverage on 2698 rows.
// This script finds existing archives without triggering new ones, so it
// closes the gap for sources already snapshotted by other parties.

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type Args = { apply: boolean; limit: number | null }

function parseArgs(argv: string[]): Args {
  let apply = false
  let limit: number | null = null
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--apply') apply = true
    else if (a === '--limit') {
      limit = parseInt(argv[++i] ?? '', 10)
      if (isNaN(limit)) throw new Error('--limit requires a number')
    } else if (a.startsWith('--limit=')) {
      limit = parseInt(a.slice('--limit='.length), 10)
      if (isNaN(limit)) throw new Error('--limit requires a number')
    } else {
      throw new Error(`Unknown argument: ${a}`)
    }
  }
  return { apply, limit }
}

type WaybackResponse = {
  archived_snapshots?: {
    closest?: {
      available?: boolean
      status?: string
      url?: string
      timestamp?: string
    }
  }
}

async function fetchSnapshot(url: string, timeoutMs = 10_000): Promise<string | null> {
  const apiUrl = `https://archive.org/wayback/available?url=${encodeURIComponent(url)}`
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(apiUrl, { signal: ctrl.signal })
    if (!res.ok) return null
    const data = (await res.json()) as WaybackResponse
    const closest = data.archived_snapshots?.closest
    if (closest?.available && closest.url) {
      // Wayback returns http:// — upgrade to https:// for stored value.
      return closest.url.replace(/^http:\/\//, 'https://')
    }
    return null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const { apply, limit } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const allCandidates = await prisma.sourceCitation.findMany({
    where: { url: { not: null }, archivedUrl: null },
    select: { id: true, url: true },
    orderBy: { id: 'asc' },
  })
  const candidates = limit != null ? allCandidates.slice(0, limit) : allCandidates

  console.log(`Candidates (url set, archivedUrl null): ${allCandidates.length}`)
  if (limit != null) console.log(`Limited to first ${candidates.length}.`)
  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}`)
  console.log(`Pacing: 200ms between requests.\n`)

  let found = 0
  let notFound = 0
  let errors = 0
  let processed = 0
  const start = Date.now()

  for (const row of candidates) {
    processed++
    const snapshot = await fetchSnapshot(row.url!)
    if (snapshot) {
      found++
      if (apply) {
        await prisma.sourceCitation.update({
          where: { id: row.id },
          data: { archivedUrl: snapshot },
        })
      }
    } else if (snapshot === null) {
      notFound++
    } else {
      errors++
    }

    if (processed % 50 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      console.log(`  ${processed} / ${candidates.length}  found=${found}  not-found=${notFound}  (${elapsed}s)`)
    }
    await sleep(200)
  }

  console.log('\n── Summary ────────────────────')
  console.log(`  Processed:    ${processed}`)
  console.log(`  Snapshot found: ${found}${apply ? ' (written)' : ' (would write)'}`)
  console.log(`  Not in Wayback: ${notFound}`)
  console.log(`  API errors:     ${errors}`)
  if (!apply && found > 0) {
    console.log(`\n  Re-run with --apply to write ${found} snapshots to the database.`)
  }
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
