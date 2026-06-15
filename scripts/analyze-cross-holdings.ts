/**
 * AP-5 — Krysseie og tverrsektoriell kontroll (konsernstruktur)
 *
 * Dybdeanalyse-arbeidspakke 5 fra
 * docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
 *
 * Hypotese (ikke-opplagt): Samme eiermiljøer kontrollerer på tvers av fôr +
 * dagligvare + produksjon — vertikal/horisontal integrasjon skjult bak
 * konsernstruktur. Sporer kontrollerende eierskap transitivt og finner eiere
 * hvis «imperium» spenner flere verdikjede-ledd. Komplementerer AP-1 (styrer):
 * her er det eierkontroll, ikke styreverv.
 *
 * Datakilde: intern DB (CompanyOwnership parent→child med ownershipPct/type;
 * Company.valueChainStage = sektor). Krever DATABASE_URL.
 *
 * Claim-disiplin: Kontroll = subsidiary ELLER ownershipPct ≥ 50. Minoritetspost
 * og JV uten majoritet teller som «tilstedeværelse», IKKE kontroll. Eierskap
 * skilles fra kontroll. Ultimate ownership spores til kilde før ekstern bruk.
 * Dekningsgrad rapporteres; intern baseline til primærsjekk.
 *
 * Bruk:
 *   npx tsx scripts/analyze-cross-holdings.ts
 *   npx tsx scripts/analyze-cross-holdings.ts --out=research/analyse/ap5-krysseie.json
 *   npx tsx scripts/analyze-cross-holdings.ts --dry-run
 */

import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export type OwnershipEdge = {
  parentId: string
  childId: string
  pct: number | null
  type: string // subsidiary, joint-venture, minority-stake
}

export type CompanyNode = {
  id: string
  name: string
  sector: string | null
}

const CONTROL_THRESHOLD = 50

export function isControlEdge(e: OwnershipEdge): boolean {
  return e.type === 'subsidiary' || (e.pct != null && e.pct >= CONTROL_THRESHOLD)
}

/** Ren kjerne — testbar uten DB. Transitiv kontroll-rekkevidde og kryssektor-eiere. */
export function computeCrossHoldings(edges: OwnershipEdge[], companies: CompanyNode[]) {
  const node = new Map<string, CompanyNode>()
  for (const c of companies) node.set(c.id, c)
  const ensure = (id: string): CompanyNode => node.get(id) ?? { id, name: id, sector: null }

  // Kontroll-adjacency (parent -> barn) for kontrollerende kanter
  const controlAdj = new Map<string, Set<string>>()
  const controlChildren = new Set<string>()
  const controlParents = new Set<string>()
  for (const e of edges) {
    if (!isControlEdge(e)) continue
    if (e.parentId === e.childId) continue
    if (!controlAdj.has(e.parentId)) controlAdj.set(e.parentId, new Set())
    controlAdj.get(e.parentId)!.add(e.childId)
    controlChildren.add(e.childId)
    controlParents.add(e.parentId)
  }

  // Transitiv kontrollert etterkommer-mengde (syklus-vakt)
  function descendants(start: string): Set<string> {
    const out = new Set<string>()
    const stack = [...(controlAdj.get(start) ?? [])]
    while (stack.length) {
      const id = stack.pop() as string
      if (out.has(id)) continue
      out.add(id)
      for (const c of controlAdj.get(id) ?? []) if (!out.has(c)) stack.push(c)
    }
    return out
  }

  const controllers = [...controlParents].map(id => {
    const desc = descendants(id)
    const footprint = new Set<string>()
    const self = ensure(id).sector
    if (self) footprint.add(self)
    for (const d of desc) {
      const s = ensure(d).sector
      if (s) footprint.add(s)
    }
    return {
      id,
      name: ensure(id).name,
      ownSector: self,
      controlledCount: desc.size,
      sectors: [...footprint].sort(),
      isUltimate: !controlChildren.has(id),
      controlledNames: [...desc].map(d => ensure(d).name),
    }
  })

  const crossSectorControllers = controllers
    .filter(c => c.sectors.length >= 2)
    .sort((a, b) => b.sectors.length - a.sectors.length || b.controlledCount - a.controlledCount)

  // Sektorpar-samkontroll: hvor mange eiere kontrollerer på tvers av hvert par
  const sectorPairs = new Map<string, number>()
  for (const c of crossSectorControllers) {
    for (let i = 0; i < c.sectors.length; i++)
      for (let j = i + 1; j < c.sectors.length; j++) {
        const key = `${c.sectors[i]} ↔ ${c.sectors[j]}`
        sectorPairs.set(key, (sectorPairs.get(key) ?? 0) + 1)
      }
  }

  const inGraph = new Set<string>()
  for (const e of edges) {
    inGraph.add(e.parentId)
    inGraph.add(e.childId)
  }

  return {
    totals: {
      companies: companies.length,
      ownershipEdges: edges.length,
      controllingEdges: edges.filter(isControlEdge).length,
      companiesInGraph: inGraph.size,
      controllers: controllers.length,
      ultimateControllers: controllers.filter(c => c.isUltimate).length,
      crossSectorControllers: crossSectorControllers.length,
    },
    crossSectorControllers: crossSectorControllers.slice(0, 25).map(c => ({
      name: c.name,
      ownSector: c.ownSector,
      sectors: c.sectors,
      controlledCount: c.controlledCount,
      isUltimate: c.isUltimate,
    })),
    sectorPairControl: [...sectorPairs.entries()]
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count),
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const outArg = process.argv.find(a => a.startsWith('--out='))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const [rawEdges, companiesAll] = await Promise.all([
      prisma.companyOwnership.findMany({
        select: {
          ownershipPct: true,
          ownershipType: true,
          parentCompany: { select: { id: true, name: true, valueChainStage: true } },
          childCompany: { select: { id: true, name: true, valueChainStage: true } },
        },
      }),
      prisma.company.findMany({ select: { id: true, name: true, valueChainStage: true } }),
    ])

    const companies: CompanyNode[] = companiesAll.map(c => ({ id: c.id, name: c.name, sector: c.valueChainStage }))
    const edges: OwnershipEdge[] = rawEdges.map(e => ({
      parentId: e.parentCompany.id,
      childId: e.childCompany.id,
      pct: e.ownershipPct != null ? Number(e.ownershipPct) : null,
      type: e.ownershipType,
    }))

    console.log(`[ap5] ${companies.length} selskaper · ${edges.length} eierkanter`)
    if (dryRun) {
      await prisma.$disconnect()
      return
    }

    const result = computeCrossHoldings(edges, companies)
    const t = result.totals
    console.log(
      `[ap5] kontrollkanter=${t.controllingEdges}/${t.ownershipEdges} · i graf=${t.companiesInGraph}/${t.companies} ` +
        `· kontrollører=${t.controllers} (ultimate ${t.ultimateControllers}) · kryssektor=${t.crossSectorControllers}`
    )
    console.log('\n--- Tverrsektorielle kontrollører (transitiv konsernkontroll) ---')
    for (const c of result.crossSectorControllers.slice(0, 12)) {
      console.log(
        `  ${c.name}${c.isUltimate ? ' *' : ''} [${c.ownSector ?? '—'}]: ${c.sectors.join(' + ')} (${c.controlledCount} selskaper)`
      )
    }
    console.log('\n--- Sektorpar-samkontroll ---')
    for (const sp of result.sectorPairControl) console.log(`  ${sp.pair}: ${sp.count}`)

    if (outArg) {
      const out = outArg.split('=')[1]
      writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'intern DB (CompanyOwnership × Company)', ...result }, null, 2))
      console.log(`\n[ap5] skrev ${out}`)
    }

    console.log(
      '\nForbehold: kontroll = subsidiary eller eierandel ≥ 50 %; minoritet/JV teller som tilstedeværelse, ikke kontroll. ' +
        `Eierdekning: ${t.companiesInGraph}/${t.companies} selskaper har eierkant. * = ultimate (ingen kontrollerende eier i DB). ` +
        'Eierskap ≠ operativ kontroll; ultimate ownership stikkprøves mot Brønnøysund. Intern baseline.'
    )
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch(err => {
    console.error('[ap5] feilet:', err)
    process.exit(1)
  })
}
