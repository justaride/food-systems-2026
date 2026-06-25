import 'dotenv/config'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const LEDGER = 'research/_status/domene-dekningsbok.csv'
const PROFILES = 'public/data/coverage/domene-profiles.json'

type Cell = {
  domain: string; subdomain: string; geo: string
  estimated_universe: number; universe_confidence: string
  mapped_count: number; gap: number
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let field = '', record: string[] = [], q = false
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (q) { if (c === '"') { if (s[i + 1] === '"') { field += '"'; i++ } else q = false } else field += c }
    else if (c === '"') q = true
    else if (c === ',') { record.push(field); field = '' }
    else if (c === '\n') { record.push(field); field = ''; if (record.some(x => x)) rows.push(record); record = [] }
    else field += c
  }
  if (field || record.length) { record.push(field); if (record.some(x => x)) rows.push(record) }
  const header = rows.shift()!
  return rows.map(cols => Object.fromEntries(header.map((h, i) => [h.trim(), (cols[i] ?? '').trim()])))
}

function dateArg(): string {
  const a = process.argv.find(x => x.startsWith('--date='))
  return a ? a.slice('--date='.length) : new Date().toISOString().slice(0, 10)
}

async function main() {
  const date = dateArg()
  const ledger = parseCsv(readFileSync(LEDGER, 'utf8'))

  // Hent alle domene-tagga aktører én gang; tell per (domain, subdomain, geo) fra metadata.
  const actors = await prisma.actor.findMany({
    where: { themeTags: { hasSome: ledger.map(r => `domene:${r.domain}`) } },
    select: { metadata: true, country: true, themeTags: true },
  })
  const counts = new Map<string, number>()
  for (const a of actors) {
    const m = (a.metadata ?? {}) as Record<string, unknown>
    const tags = a.themeTags ?? []
    const domainTag = tags.find(t => t.startsWith('domene:'))
    const subTag = tags.find(t => t.startsWith('subdomene:'))
    const domain = domainTag ? domainTag.slice('domene:'.length) : String(m.domain ?? '')
    const subdomain = subTag ? subTag.slice('subdomene:'.length) : '(uklassifisert)'
    const geo = String(m.geo ?? a.country ?? 'NO')
    counts.set(`${domain}|${subdomain}|${geo}`, (counts.get(`${domain}|${subdomain}|${geo}`) ?? 0) + 1)
  }

  const cells: Cell[] = ledger.map(r => {
    const mapped = counts.get(`${r.domain}|${r.subdomain}|${r.geo}`) ?? 0
    const universe = Number(r.estimated_universe) || 0
    return {
      domain: r.domain, subdomain: r.subdomain, geo: r.geo,
      estimated_universe: universe, universe_confidence: r.universe_confidence,
      mapped_count: mapped, gap: Math.max(0, universe - mapped),
    }
  })

  mkdirSync(dirname(PROFILES), { recursive: true })
  writeFileSync(PROFILES, JSON.stringify(cells, null, 2) + '\n')

  // Hull-rapport (sortert synkende på gap)
  const thin = [...cells].sort((a, b) => b.gap - a.gap)
  const md = [
    `# Domene-dekning — hull-rapport ${date}`, '',
    '| Domene | Underdomene | Geo | Univers | Kartlagt | Hull | Konfidens |',
    '|---|---|---|---|---|---|---|',
    ...thin.map(c => `| ${c.domain} | ${c.subdomain} | ${c.geo} | ${c.estimated_universe} | ${c.mapped_count} | ${c.gap} | ${c.universe_confidence} |`),
    '', `Totalt kartlagt (domene-tagga): ${cells.reduce((s, c) => s + c.mapped_count, 0)}`,
  ].join('\n')
  writeFileSync(`research/_status/domene-dekning-hull-${date}.md`, md + '\n')

  console.log(`Dekningsaudit ferdig: ${cells.length} celler, profiler -> ${PROFILES}`)
}

main().catch(e => { console.error('Coverage audit failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
