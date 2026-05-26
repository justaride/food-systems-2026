// HTTP-verify SourceCitation rows that are stuck in verificationStatus =
// needs_review by checking whether their `url` still resolves.
//
// Mapping:
//   - HTTP 2xx / 3xx    → machine_verified (with verifiedAt = now)
//   - HTTP 404 / 410    → failed
//   - HTTP 403 / 451    → left as needs_review (paywall / legal block)
//   - timeout / 5xx     → left as needs_review (transient)
//   - other             → left as needs_review
//
// Dry-run by default. Pass --apply to write.
// Pass --limit N for incremental runs.
//
// Uses the existing classifier in src/lib/url-health-classifier.ts.

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { classifyUrlStatus, type UrlHealthClassification } from '../src/lib/url-health-classifier'

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
    } else {
      throw new Error(`Unknown argument: ${a}`)
    }
  }
  return { apply, limit }
}

async function fetchStatus(url: string, timeoutMs = 10_000): Promise<number | string> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    // HEAD first; some servers refuse HEAD, fall back to GET (range 0-0 to avoid full body)
    let res = await fetch(url, {
      method: 'HEAD',
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'FoodSystems2026/1.0 (mailto:gabriel@naturalstate.no)' },
    })
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        signal: ctrl.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'FoodSystems2026/1.0 (mailto:gabriel@naturalstate.no)',
          Range: 'bytes=0-0',
        },
      })
    }
    return res.status
  } catch (e) {
    const msg = (e as Error).message ?? ''
    if (msg.includes('aborted')) return 'timeout'
    return msg.slice(0, 60)
  } finally {
    clearTimeout(timer)
  }
}

function deriveNewStatus(c: UrlHealthClassification): 'machine_verified' | 'failed' | null {
  if (c === 'ok' || c === 'redirect') return 'machine_verified'
  if (c === 'dead') return 'failed'
  return null // leave as needs_review for paywall / timeout / server_error / other
}

function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const { apply, limit } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const all = await prisma.sourceCitation.findMany({
    where: { verificationStatus: 'needs_review', url: { not: null } },
    select: { id: true, url: true },
    orderBy: { id: 'asc' },
  })
  const work = limit != null ? all.slice(0, limit) : all

  console.log(`Candidates (needs_review with url): ${all.length}`)
  if (limit != null) console.log(`Limited to first ${work.length}.`)
  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}`)
  console.log(`Pacing: 200ms between requests.\n`)

  const counts: Record<string, number> = {}
  const updates: Record<string, number> = { machine_verified: 0, failed: 0, unchanged: 0 }
  let processed = 0
  const start = Date.now()

  for (const row of work) {
    processed++
    const status = await fetchStatus(row.url!)
    const classification = classifyUrlStatus(status)
    counts[classification] = (counts[classification] ?? 0) + 1
    const newStatus = deriveNewStatus(classification)
    if (newStatus) {
      updates[newStatus]++
      if (apply) {
        await prisma.sourceCitation.update({
          where: { id: row.id },
          data: {
            verificationStatus: newStatus,
            verifiedAt: new Date(),
          },
        })
      }
    } else {
      updates.unchanged++
    }

    if (processed % 50 === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(0)
      const summary = Object.entries(counts)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')
      console.log(`  ${processed} / ${work.length}  ${summary}  (${elapsed}s)`)
    }
    await sleep(200)
  }

  console.log('\n── Summary by HTTP classification ──')
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k.padEnd(14)} ${v}`)
  }
  console.log('')
  console.log('── DB updates ────────────────────')
  console.log(`  → machine_verified:  ${updates.machine_verified}${apply ? ' (written)' : ' (would write)'}`)
  console.log(`  → failed:            ${updates.failed}${apply ? ' (written)' : ' (would write)'}`)
  console.log(`  → unchanged:         ${updates.unchanged}`)
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
