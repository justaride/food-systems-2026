/**
 * AP-2 — Eier- og inntektskonsentrasjon per verdikjede-node (HHI)
 *
 * Dybdeanalyse-arbeidspakke 2 fra
 * docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
 *
 * Hypotese (ikke-opplagt): Konsentrasjonen er ujevn langs verdikjeden — enkelte
 * noder er tettere kontrollert enn dagligvarens topplinje antyder — og den
 * samler seg i de samme leddene (retail/logistikk/foredling) som styreoverlappet
 * i AP-1. Tester inntekts-HHI, eiertype-miks og kontroll-prevalens per node.
 *
 * Datakilde: intern DB (Company.valueChainStage = node; CompanyFinancial.revenueNok;
 * Shareholder.ownershipPct/shareholderType/isControlling). Krever DATABASE_URL.
 *
 * Claim-disiplin: HHI her er beregnet blant KARTLAGTE selskaper med data — ikke
 * et fullstendig markeds-HHI (selskapsuniverset er ikke hele markedet). Brukes som
 * intern, relativ sammenligning mellom noder, ikke som markedsandelsbevis.
 * Dekningsgrad rapporteres per node; manglende markedsgrunnlag står `needs-data`.
 *
 * Bruk:
 *   npx tsx scripts/analyze-node-concentration.ts
 *   npx tsx scripts/analyze-node-concentration.ts --out=research/analyse/ap2-nodekonsentrasjon.json
 *   npx tsx scripts/analyze-node-concentration.ts --dry-run
 */

import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export type ShareholderLite = {
  pct: number | null
  type: string | null
  controlling: boolean
}

export type CompanyLite = {
  id: string
  name: string
  node: string | null // valueChainStage
  ownershipType: string | null
  revenueNok: number | null
  shareholders: ShareholderLite[]
}

/** HHI i standard skala 0–10000 (sum av kvadrerte prosentandeler). >2500 = høyt konsentrert. */
export function hhi(sharesPct: number[]): number {
  return +sharesPct.reduce((s, p) => s + p * p, 0).toFixed(1)
}

/** Andel (0–1) av total holdt av de k største. */
export function topNShare(values: number[], k: number): number {
  const total = values.reduce((s, v) => s + v, 0)
  if (total <= 0) return 0
  const top = [...values].sort((a, b) => b - a).slice(0, k).reduce((s, v) => s + v, 0)
  return +(top / total).toFixed(4)
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const s = [...values].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

/** Ren kjerne — testbar uten DB. */
export function computeNodeConcentration(companies: CompanyLite[]) {
  const byNode = new Map<string, CompanyLite[]>()
  for (const c of companies) {
    if (!c.node) continue
    if (!byNode.has(c.node)) byNode.set(c.node, [])
    byNode.get(c.node)!.push(c)
  }

  const nodes = [...byNode.entries()].map(([node, cs]) => {
    const withRevenue = cs.filter(c => (c.revenueNok ?? 0) > 0)
    const revenues = withRevenue.map(c => c.revenueNok as number)
    const totalRev = revenues.reduce((s, v) => s + v, 0)
    const sharesPct = totalRev > 0 ? revenues.map(r => (r / totalRev) * 100) : []

    const withShareholders = cs.filter(c => c.shareholders.some(s => (s.pct ?? 0) > 0))
    const ownerHHIs = withShareholders.map(c =>
      hhi(c.shareholders.filter(s => (s.pct ?? 0) > 0).map(s => s.pct as number))
    )
    const controllingCount = cs.filter(c => c.shareholders.some(s => s.controlling)).length

    const typeMix: Record<string, number> = {}
    for (const c of cs) {
      const t = c.ownershipType ?? 'ukjent'
      typeMix[t] = (typeMix[t] ?? 0) + 1
    }

    const topRev = [...withRevenue].sort((a, b) => (b.revenueNok as number) - (a.revenueNok as number))

    return {
      node,
      companies: cs.length,
      withRevenue: withRevenue.length,
      revenueCoverage: cs.length ? +(withRevenue.length / cs.length).toFixed(2) : 0,
      revenueHHI: hhi(sharesPct),
      top1RevShare: topNShare(revenues, 1),
      top3RevShare: topNShare(revenues, 3),
      topCompaniesByRevenue: topRev.slice(0, 3).map(c => c.name),
      withShareholders: withShareholders.length,
      medianOwnerHHI: +median(ownerHHIs).toFixed(1),
      controllingPrevalence: cs.length ? +(controllingCount / cs.length).toFixed(2) : 0,
      ownershipTypeMix: typeMix,
    }
  })

  nodes.sort((a, b) => b.revenueHHI - a.revenueHHI)

  return {
    totals: {
      companies: companies.length,
      nodes: nodes.length,
      withRevenue: companies.filter(c => (c.revenueNok ?? 0) > 0).length,
      withShareholders: companies.filter(c => c.shareholders.some(s => (s.pct ?? 0) > 0)).length,
    },
    nodes,
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const outArg = process.argv.find(a => a.startsWith('--out='))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const rows = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        valueChainStage: true,
        ownershipType: true,
        financials: { select: { year: true, revenueNok: true }, orderBy: { year: 'desc' }, take: 1 },
        shareholders: { select: { ownershipPct: true, shareholderType: true, isControlling: true } },
      },
    })

    const companies: CompanyLite[] = rows.map(r => ({
      id: r.id,
      name: r.name,
      node: r.valueChainStage,
      ownershipType: r.ownershipType,
      revenueNok: r.financials[0]?.revenueNok != null ? Number(r.financials[0].revenueNok) : null,
      shareholders: r.shareholders.map(s => ({
        pct: s.ownershipPct != null ? Number(s.ownershipPct) : null,
        type: s.shareholderType,
        controlling: s.isControlling,
      })),
    }))

    console.log(`[ap2] ${companies.length} selskaper`)
    if (dryRun) {
      await prisma.$disconnect()
      return
    }

    const result = computeNodeConcentration(companies)
    const t = result.totals
    console.log(
      `[ap2] noder=${t.nodes} m/inntekt=${t.withRevenue}/${t.companies} m/eierdata=${t.withShareholders}/${t.companies}`
    )
    console.log('\n--- Konsentrasjon per node (inntekts-HHI blant kartlagte selskaper) ---')
    for (const n of result.nodes) {
      console.log(
        `  ${n.node.padEnd(11)} HHI=${String(n.revenueHHI).padStart(6)} | topp3=${(n.top3RevShare * 100).toFixed(0)}% ` +
          `| kontroll=${(n.controllingPrevalence * 100).toFixed(0)}% | n=${n.companies} (inntekt ${n.withRevenue}) ` +
          `| ${n.topCompaniesByRevenue.join(', ')}`
      )
    }

    if (outArg) {
      const out = outArg.split('=')[1]
      writeFileSync(out, JSON.stringify({ generatedAt: new Date().toISOString(), source: 'intern DB (Company × Financial × Shareholder)', ...result }, null, 2))
      console.log(`\n[ap2] skrev ${out}`)
    }

    console.log(
      '\nForbehold: HHI er blant KARTLAGTE selskaper med data, ikke fullstendig markeds-HHI ' +
        '(selskapsuniverset ≠ hele markedet). Relativ sammenligning mellom noder; true markeds-HHI står needs-data. ' +
        'Går gjennom claim-lock/PCQ før ekstern bruk.'
    )
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch(err => {
    console.error('[ap2] feilet:', err)
    process.exit(1)
  })
}
