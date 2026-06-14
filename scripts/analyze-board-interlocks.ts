/**
 * AP-1 — Styreoverlapp og maktnettverk (board interlocks)
 *
 * Dybdeanalyse-arbeidspakke 1 fra
 * docs/project/plans/food-tg-dybdeanalyse-arbeidsplan-2026-06-14.md
 *
 * Hypotese (ikke-opplagt): Reell innflytelse i norsk matsystem går via personer
 * som sitter på flere styrer på tvers av verdikjedeledd (inputs/fôr, foredling,
 * sjømat, detalj, logistikk) — ikke bare via selskapseierskap. Få personer er
 * «broer» mellom ellers atskilte sektorer.
 *
 * Datakilde: intern DB (BoardMember.personKey er normalisert for nettopp
 * interlock-deteksjon; Company.valueChainStage gir sektoraksen). Krever
 * DATABASE_URL (kjøres lokalt mot din DB, som scripts/import-*.ts).
 *
 * Claim-disiplin: «makt» = strukturell posisjon (antall/spenn av styreverv),
 * IKKE intensjon, samordning eller ulovlighet. Resultatet er et internt
 * analysefunn og går gjennom claim-lock/PCQ før ekstern bruk. Styreverv
 * verifiseres mot kilde/dato; dekningsgrad rapporteres.
 *
 * Bruk:
 *   npx tsx scripts/analyze-board-interlocks.ts
 *   npx tsx scripts/analyze-board-interlocks.ts --active-only --out=research/analyse/ap1-styreoverlapp.json
 *   npx tsx scripts/analyze-board-interlocks.ts --dry-run
 */

import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export type Seat = {
  personKey: string
  personName: string
  role: string | null
  companyId: string
  companyName: string
  sector: string | null // Company.valueChainStage
}

export type PersonAgg = {
  personKey: string
  name: string
  seats: number
  companies: string[] // distinct companyId
  companyNames: string[]
  sectors: string[] // distinct non-null valueChainStage
  roles: string[]
}

export type ComputeInterlocksOptions = {
  minCompanies?: number
  companyUniverse?: number
}

function mostFrequent(values: string[]): string {
  const counts = new Map<string, number>()
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? values[0] ?? ''
}

/**
 * Ren kjerne — testbar uten DB. Bygger personaggregat, interlock-graf på
 * selskapsnivå, tverrsektorielle broer og sektorpar-matrise.
 */
export function computeInterlocks(seats: Seat[], options: number | ComputeInterlocksOptions = 2) {
  const minCompanies = typeof options === 'number' ? options : options.minCompanies ?? 2
  const companyUniverseFromOptions = typeof options === 'number' ? undefined : options.companyUniverse

  // Personaggregat
  const byPerson = new Map<string, Seat[]>()
  for (const s of seats) {
    if (!byPerson.has(s.personKey)) byPerson.set(s.personKey, [])
    byPerson.get(s.personKey)!.push(s)
  }

  const persons: PersonAgg[] = [...byPerson.entries()].map(([personKey, ss]) => {
    const companies = [...new Set(ss.map(s => s.companyId))]
    const companyNames = [...new Set(ss.map(s => s.companyName))]
    const sectors = [...new Set(ss.map(s => s.sector).filter((x): x is string => !!x))]
    const roles = [...new Set(ss.map(s => s.role).filter((x): x is string => !!x))]
    return {
      personKey,
      name: mostFrequent(ss.map(s => s.personName)),
      seats: ss.length,
      companies,
      companyNames,
      sectors,
      roles,
    }
  })

  const interlockers = persons.filter(p => p.companies.length >= minCompanies)
  const bridges = interlockers.filter(p => p.sectors.length >= 2)

  // Selskap-interlock-graf: kant mellom to selskaper som deler ≥1 personKey
  const companySector = new Map<string, string | null>()
  const companyName = new Map<string, string>()
  for (const s of seats) {
    companySector.set(s.companyId, s.sector)
    companyName.set(s.companyId, s.companyName)
  }
  const edges = new Map<string, number>() // "a|b" -> shared persons
  for (const p of interlockers) {
    const cs = [...p.companies].sort()
    for (let i = 0; i < cs.length; i++)
      for (let j = i + 1; j < cs.length; j++) {
        const key = `${cs[i]}|${cs[j]}`
        edges.set(key, (edges.get(key) ?? 0) + 1)
      }
  }
  // Selskaps-interlock-grad (antall andre selskaper det deler styremedlem med)
  const degree = new Map<string, Set<string>>()
  for (const key of edges.keys()) {
    const [a, b] = key.split('|')
    if (!degree.has(a)) degree.set(a, new Set())
    if (!degree.has(b)) degree.set(b, new Set())
    degree.get(a)!.add(b)
    degree.get(b)!.add(a)
  }
  const companyDegree = [...degree.entries()]
    .map(([id, set]) => ({
      company: companyName.get(id) ?? id,
      sector: companySector.get(id) ?? null,
      interlockDegree: set.size,
    }))
    .sort((a, b) => b.interlockDegree - a.interlockDegree)

  // Sektorpar-broer: hvor mange personer spenner hvert sektorpar
  const sectorPairs = new Map<string, number>()
  for (const p of bridges) {
    const ss = [...p.sectors].sort()
    for (let i = 0; i < ss.length; i++)
      for (let j = i + 1; j < ss.length; j++) {
        const key = `${ss[i]} ↔ ${ss[j]}`
        sectorPairs.set(key, (sectorPairs.get(key) ?? 0) + 1)
      }
  }

  const distinctCompanies = new Set(seats.map(s => s.companyId)).size
  const companyUniverse = companyUniverseFromOptions ?? distinctCompanies
  const companiesWithSector = new Set(
    seats.filter(s => s.sector).map(s => s.companyId)
  ).size

  return {
    totals: {
      seats: seats.length,
      distinctPersons: persons.length,
      distinctCompanies,
      companyUniverse,
      boardCompanyCoverage: companyUniverse > 0 ? +(distinctCompanies / companyUniverse).toFixed(4) : 0,
      companiesWithSector,
      boardCompaniesWithSectorCoverage:
        distinctCompanies > 0 ? +(companiesWithSector / distinctCompanies).toFixed(4) : 0,
      interlockers: interlockers.length,
      crossSectorBridges: bridges.length,
    },
    topInterlockers: [...interlockers]
      .sort((a, b) => b.companies.length - a.companies.length || b.seats - a.seats)
      .slice(0, 20)
      .map(p => ({
        name: p.name,
        seats: p.seats,
        companies: p.companies.length,
        sectors: p.sectors,
        companyNames: p.companyNames,
        roles: p.roles,
      })),
    topBridges: [...bridges]
      .sort((a, b) => b.sectors.length - a.sectors.length || b.companies.length - a.companies.length)
      .slice(0, 20)
      .map(p => ({ name: p.name, sectors: p.sectors, companies: p.companyNames })),
    topCompaniesByInterlockDegree: companyDegree.slice(0, 20),
    sectorPairBridges: [...sectorPairs.entries()]
      .map(([pair, count]) => ({ pair, count }))
      .sort((a, b) => b.count - a.count),
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const activeOnly = process.argv.includes('--active-only')
  const outArg = process.argv.find(a => a.startsWith('--out='))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const [rows, companyUniverse] = await Promise.all([
      prisma.boardMember.findMany({
        where: activeOnly ? { effectiveTo: null } : undefined,
        select: {
          personKey: true,
          personName: true,
          role: true,
          company: {
            select: { id: true, name: true, valueChainStage: true },
          },
        },
      }),
      prisma.company.count(),
    ])

    const seats: Seat[] = rows.map(r => ({
      personKey: r.personKey,
      personName: r.personName,
      role: r.role,
      companyId: r.company.id,
      companyName: r.company.name,
      sector: r.company.valueChainStage,
    }))

    console.log(`[ap1] ${seats.length} styreverv${activeOnly ? ' (aktive)' : ''}`)
    if (dryRun) return

    const result = computeInterlocks(seats, { companyUniverse })
    const t = result.totals
    console.log(
      `[ap1] personer=${t.distinctPersons} selskaper_med_styredata=${t.distinctCompanies}/${t.companyUniverse} ` +
        `(m/sektor=${t.companiesWithSector}/${t.distinctCompanies}) interlockere(≥2 selsk.)=${t.interlockers} ` +
        `tverrsektorielle broer=${t.crossSectorBridges}`
    )
    console.log('\n--- Topp tverrsektorielle broer ---')
    for (const b of result.topBridges.slice(0, 10))
      console.log(`  ${b.name}: ${b.sectors.join(' + ')}  (${b.companies.length} selskaper)`)
    console.log('\n--- Mest sammenkoblede selskaper (interlock-grad) ---')
    for (const c of result.topCompaniesByInterlockDegree.slice(0, 10))
      console.log(`  ${c.company} [${c.sector ?? '—'}]: delt styre med ${c.interlockDegree} selskaper`)
    console.log('\n--- Sektorpar-broer ---')
    for (const sp of result.sectorPairBridges) console.log(`  ${sp.pair}: ${sp.count} personer`)

    if (outArg) {
      const out = outArg.split('=')[1]
      writeFileSync(
        out,
        JSON.stringify(
          { generatedAt: new Date().toISOString(), source: 'intern DB (BoardMember × Company)', activeOnly, ...result },
          null,
          2
        )
      )
      console.log(`\n[ap1] skrev ${out}`)
    }

    console.log(
      '\nForbehold: «makt» = strukturell posisjon, ikke intensjon/samordning. ' +
        'Interlock via BoardMember.personKey (normaliseringskvalitet avgjør presisjon). ' +
        `Styredata dekker ${t.distinctCompanies}/${t.companyUniverse} selskaper; ` +
        `sektordekning i styregrafen er ${t.companiesWithSector}/${t.distinctCompanies}. ` +
        'Går gjennom claim-lock/PCQ før ekstern bruk.'
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('[ap1] feilet:', err)
    process.exit(1)
  })
}
