/**
 * AP-1 dekningsutvidelse — lukk styre-dekningshullet (task #22)
 *
 * Bakgrunn: AP-1 (scripts/analyze-board-interlocks.ts) fant at styredata bare
 * dekker ~36 % av selskapsuniverset, og hullet ligger særlig i inputs/fôr og
 * sjømat. Eierkartet (AP-2/AP-5) dekker mer enn styrekartet i de sektorene.
 * Dette skriptet henter sittende styre fra Brønnøysund «roller i virksomheten»
 * for nettopp de selskapene som mangler BoardMember-rader, så styre- og
 * eierkart står likt.
 *
 * Forholdet til scripts/enrich-offentligdata.ts: den enricheren kan også skrive
 * styreverv fra /roller, men den (1) går bredt over ALLE NO-selskaper, (2)
 * skriver samtidig om selskaps-metadata, underenheter og personprofiler, og (3)
 * måler ikke dekning. Dette skriptet er kirurgisk: kun BoardMember, kun
 * målsektorenes dekningshull, med dekning før/etter. Rolle-mapping og provenans
 * er IDENTISK (src/lib/brreg-roles.ts + BRREG_ROLES_SOURCE_LABEL), så radene blir
 * formlike med enricheren.
 *
 * Claim-disiplin: «makt» = strukturell posisjon, ikke intensjon. Kun offentlige
 * rolledata. Resultatet er intern baseline; aktørspesifikke formuleringer går
 * gjennom claim-lock/PCQ før ekstern bruk. Etter import: kjør
 * scripts/dedupe-person-keys.ts --commit (konsoliderer personKey på tvers av
 * historiske og nye rader) FØR re-kjøring av analyze-board-interlocks.ts.
 *
 * Bruk:
 *   npx tsx scripts/extend-board-coverage-brreg.ts --dry-run
 *   npx tsx scripts/extend-board-coverage-brreg.ts
 *   npx tsx scripts/extend-board-coverage-brreg.ts --sectors=inputs,seafood,production
 *   npx tsx scripts/extend-board-coverage-brreg.ts --snapshot-in=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json
 *   npx tsx scripts/extend-board-coverage-brreg.ts --dry-run --snapshot-out=research/analyse/ap1-board-coverage-extension-brreg-2026-06-14.json
 */

import 'dotenv/config'
import { readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  parseRoleGroupsToBoardRows,
  type BrregRoleGroup,
  type ParsedBoardRow,
} from '../src/lib/brreg-roles.ts'
import {
  BRREG_ROLES_SOURCE_LABEL,
  boardMemberPersonRoleKey,
  boardMemberNamesAreCompatible,
  groupBoardMembersByPersonRole,
} from '../src/lib/brreg-board-member-provenance.ts'

const BRREG_BASE_URL = 'https://data.brreg.no/enhetsregisteret/api'
const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'food-systems-2026-board-coverage/0.1.0',
}
const DEFAULT_SECTORS = ['inputs', 'seafood', 'production']
const NORWEGIAN_ORGNR_RE = /^\d{9}$/
const DELAY_MS = 120

export type CliOptions = {
  sectors: string[]
  dryRun: boolean
  limit: number | null
  includeCovered: boolean
  includeResigned: boolean
  snapshotIn: string | null
  snapshotOut: string | null
}

export function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = {
    sectors: DEFAULT_SECTORS,
    dryRun: false,
    limit: null,
    includeCovered: false,
    includeResigned: false,
    snapshotIn: null,
    snapshotOut: null,
  }
  for (const arg of argv) {
    if (arg === '--dry-run') opts.dryRun = true
    else if (arg === '--include-covered') opts.includeCovered = true
    else if (arg === '--include-resigned') opts.includeResigned = true
    else if (arg.startsWith('--sectors=')) {
      const values = arg.slice('--sectors='.length).split(',').map(v => v.trim()).filter(Boolean)
      if (values.length === 0) throw new Error('Forventet minst én sektor etter --sectors=')
      opts.sectors = values
    } else if (arg.startsWith('--limit=')) {
      const value = Number(arg.slice('--limit='.length))
      if (!Number.isFinite(value) || value <= 0) throw new Error(`Ugyldig --limit: ${arg}`)
      opts.limit = Math.floor(value)
    } else if (arg.startsWith('--snapshot-in=')) {
      opts.snapshotIn = arg.slice('--snapshot-in='.length)
    } else if (arg.startsWith('--snapshot-out=')) {
      opts.snapshotOut = arg.slice('--snapshot-out='.length)
    } else {
      throw new Error(`Ukjent argument: ${arg}`)
    }
  }
  return opts
}

export type CoverageRow = { sector: string; companies: number; withBoard: number; pct: number }
export type Coverage = { universe: number; companiesWithBoard: number; pct: number; bySector: CoverageRow[] }

/** Ren dekningsmatematikk: andel selskaper med ≥1 styrerad, totalt og per sektor. */
export function summarizeCoverage(
  universe: number,
  companiesWithBoard: number,
  sectorCounts: { sector: string; companies: number; withBoard: number }[],
): Coverage {
  const pct = (a: number, b: number) => (b > 0 ? +(a / b).toFixed(4) : 0)
  return {
    universe,
    companiesWithBoard,
    pct: pct(companiesWithBoard, universe),
    bySector: sectorCounts.map(s => ({ ...s, pct: pct(s.withBoard, s.companies) })),
  }
}

type SnapshotCompany = { orgNr: string; boardMembers: ParsedBoardRow[] }

/** Indekser et committed snapshot på orgNr for offline apply (--snapshot-in). */
export function indexSnapshot(raw: unknown): Map<string, ParsedBoardRow[]> {
  const index = new Map<string, ParsedBoardRow[]>()
  const companies = (raw as { companies?: SnapshotCompany[] })?.companies ?? []
  for (const c of companies) {
    if (c?.orgNr && Array.isArray(c.boardMembers)) index.set(c.orgNr, c.boardMembers)
  }
  return index
}

async function sleep(ms: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms))
}

function brregRolesUrl(orgNr: string): string {
  return `${BRREG_BASE_URL}/enheter/${encodeURIComponent(orgNr)}/roller`
}

async function fetchRoleGroups(orgNr: string): Promise<{ groups: BrregRoleGroup[]; status: 'ok' | 'not-found' | 'error' }> {
  try {
    const resp = await fetch(brregRolesUrl(orgNr), { headers: DEFAULT_HEADERS })
    if (resp.status === 404 || resp.status === 410) return { groups: [], status: 'not-found' }
    if (!resp.ok) return { groups: [], status: 'error' }
    const data = (await resp.json()) as { rollegrupper?: BrregRoleGroup[] }
    return { groups: data.rollegrupper ?? [], status: 'ok' }
  } catch {
    return { groups: [], status: 'error' }
  }
}

/**
 * Idempotent upsert av styreverv — speiler enrich-offentligdata.ts: matcher
 * eksisterende på personKey+role eller navnekompatibilitet, oppdaterer da
 * provenans; ellers oppretter ny rad. Returnerer antall nye rader.
 *
 * Tar en strukturell klienttype framfor hele `PrismaClient`, slik at
 * skrivestien kan testes uten DB. Det er ikke kosmetikk: denne funksjonen
 * muterer prod og hadde ingen test før den skulle kjøres første gang.
 */
export type BoardWriteClient = {
  boardMember: {
    findMany: (args: unknown) => Promise<{ id: string; personKey: string; personName: string; role: string }[]>
    updateMany: (args: unknown) => Promise<unknown>
    create: (args: unknown) => Promise<unknown>
  }
}

export async function upsertBoardRows(
  prisma: BoardWriteClient,
  companyId: string,
  activeOrgNr: string,
  rows: ParsedBoardRow[],
  dryRun: boolean,
  syncedAt: Date,
): Promise<number> {
  const existing = await prisma.boardMember.findMany({
    where: { companyId },
    select: { id: true, personKey: true, personName: true, role: true },
  })
  const existingByKey = groupBoardMembersByPersonRole(existing)
  let inserted = 0

  for (const row of rows) {
    const dedupeKey = boardMemberPersonRoleKey(row.personKey, row.role)
    const matchedById = new Map((existingByKey.get(dedupeKey) ?? []).map(m => [m.id, m]))
    for (const member of existing) {
      if (member.role !== row.role) continue
      if (!boardMemberNamesAreCompatible(member.personName, row.personName)) continue
      matchedById.set(member.id, member)
    }
    const matched = [...matchedById.values()]

    if (matched.length > 0) {
      if (!dryRun) {
        await prisma.boardMember.updateMany({
          where: { id: { in: matched.map(m => m.id) } },
          data: { source: BRREG_ROLES_SOURCE_LABEL, sourceUrl: brregRolesUrl(activeOrgNr), verifiedAt: syncedAt },
        })
      }
      continue
    }

    inserted += 1
    if (!dryRun) {
      await prisma.boardMember.create({
        data: {
          companyId,
          personName: row.personName,
          role: row.role,
          personKey: row.personKey,
          source: BRREG_ROLES_SOURCE_LABEL,
          sourceUrl: brregRolesUrl(activeOrgNr),
          verifiedAt: syncedAt,
        },
      })
    }
  }
  return inserted
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  console.log('=== AP-1 dekningsutvidelse (Brønnøysund styreverv) ===')
  console.log(JSON.stringify(options))

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const snapshotIndex = options.snapshotIn
    ? indexSnapshot(JSON.parse(readFileSync(options.snapshotIn, 'utf8')))
    : null
  if (snapshotIndex) console.log(`[snapshot] ${snapshotIndex.size} selskaper lest fra ${options.snapshotIn} (offline apply)`)

  try {
    // ---- Universe + dekning FØR ----
    const universe = await prisma.company.count()
    const boardCompanyRows = await prisma.boardMember.findMany({ select: { companyId: true }, distinct: ['companyId'] })
    const companiesWithBoardBefore = new Set(boardCompanyRows.map(r => r.companyId))

    const sectorCompanies = await prisma.company.findMany({
      where: { country: 'NO', valueChainStage: { in: options.sectors } },
      select: { id: true, name: true, orgNr: true, valueChainStage: true },
      orderBy: { name: 'asc' },
    })

    const sectorCountsBefore = options.sectors.map(sector => {
      const inSector = sectorCompanies.filter(c => c.valueChainStage === sector)
      return { sector, companies: inSector.length, withBoard: inSector.filter(c => companiesWithBoardBefore.has(c.id)).length }
    })
    const before = summarizeCoverage(universe, companiesWithBoardBefore.size, sectorCountsBefore)

    // ---- Velg dekningshull ----
    const candidates = sectorCompanies.filter(c => {
      if (!NORWEGIAN_ORGNR_RE.test(c.orgNr)) return false
      if (!options.includeCovered && companiesWithBoardBefore.has(c.id)) return false
      return true
    })
    const targets = options.limit ? candidates.slice(0, options.limit) : candidates

    console.log(
      `\nDekning før: ${before.companiesWithBoard}/${before.universe} (${(before.pct * 100).toFixed(1)} %). ` +
        `Målsektorer ${options.sectors.join('/')}: ${sectorCompanies.length} selskaper, ` +
        `${candidates.length} uten styredata${options.includeCovered ? ' (inkl. dekkede)' : ''}. Behandler ${targets.length}.\n`,
    )

    let companiesGained = 0
    let seatsAdded = 0
    let notFound = 0
    let errors = 0
    const snapshotOut: Record<string, unknown>[] = []
    const newlyCovered = new Set<string>()

    for (const company of targets) {
      let groups: BrregRoleGroup[] = []
      let rows: ParsedBoardRow[]
      const syncedAt = new Date()

      if (snapshotIndex) {
        rows = snapshotIndex.get(company.orgNr) ?? []
        if (!snapshotIndex.has(company.orgNr)) {
          console.log(`  [snapshot-miss] ${company.orgNr} – ${company.name} (ikke i snapshot, hopper over)`)
          continue
        }
      } else {
        const fetched = await fetchRoleGroups(company.orgNr)
        if (fetched.status === 'not-found') {
          console.log(`  [404] ${company.orgNr} – ${company.name} (utgått orgnr? sjekk Brønnøysund)`)
          notFound++
          await sleep(DELAY_MS)
          continue
        }
        if (fetched.status === 'error') {
          console.log(`  [ERROR] ${company.orgNr} – ${company.name}`)
          errors++
          await sleep(DELAY_MS)
          continue
        }
        groups = fetched.groups
        rows = parseRoleGroupsToBoardRows(groups, { includeResigned: options.includeResigned })
      }

      if (rows.length === 0) {
        console.log(`  [tomt] ${company.orgNr} – ${company.name} (ingen sittende styreverv)`)
        if (!snapshotIndex) await sleep(DELAY_MS)
        continue
      }

      const inserted = await upsertBoardRows(prisma, company.id, company.orgNr, rows, options.dryRun, syncedAt)
      if (inserted > 0 || !companiesWithBoardBefore.has(company.id)) {
        companiesGained += 1
        newlyCovered.add(company.id)
      }
      seatsAdded += inserted
      console.log(`  [${options.dryRun ? 'dry' : 'ok'}] ${company.orgNr} – ${company.name}: +${inserted} styreverv (${rows.length} sittende)`)

      if (options.snapshotOut) {
        snapshotOut.push({
          sector: company.valueChainStage,
          orgNr: company.orgNr,
          corpusName: company.name,
          seats: rows.length,
          boardMembers: rows,
          rollegrupper: snapshotIndex ? undefined : groups,
        })
      }

      if (!snapshotIndex) await sleep(DELAY_MS)
    }

    // ---- Dekning ETTER (projisert: før-settet ∪ nylig dekkede) ----
    const afterCovered = new Set(companiesWithBoardBefore)
    for (const id of newlyCovered) afterCovered.add(id)
    const sectorCountsAfter = options.sectors.map(sector => {
      const inSector = sectorCompanies.filter(c => c.valueChainStage === sector)
      return { sector, companies: inSector.length, withBoard: inSector.filter(c => afterCovered.has(c.id)).length }
    })
    const after = summarizeCoverage(universe, afterCovered.size, sectorCountsAfter)

    console.log('\n--- Oppsummering ---')
    console.log(`  Selskaper som fikk styredata: ${companiesGained}`)
    console.log(`  Nye styreverv (rader):        ${seatsAdded}`)
    console.log(`  404 / utgått orgnr:           ${notFound}`)
    console.log(`  Feil:                         ${errors}`)
    console.log(
      `  Dekning: ${before.companiesWithBoard}/${before.universe} (${(before.pct * 100).toFixed(1)} %) ` +
        `→ ${after.companiesWithBoard}/${after.universe} (${(after.pct * 100).toFixed(1)} %)${options.dryRun ? '  [projisert, dry-run]' : ''}`,
    )
    for (let i = 0; i < before.bySector.length; i++) {
      const b = before.bySector[i]
      const a = after.bySector[i]
      console.log(`    ${b.sector}: ${b.withBoard}/${b.companies} → ${a.withBoard}/${a.companies}`)
    }

    if (options.snapshotOut) {
      writeFileSync(
        options.snapshotOut,
        JSON.stringify(
          { generatedAt: new Date().toISOString(), source: BRREG_ROLES_SOURCE_LABEL, sectors: options.sectors, companies: snapshotOut },
          null,
          2,
        ),
      )
      console.log(`\n[snapshot] skrev ${snapshotOut.length} selskaper til ${options.snapshotOut}`)
    }

    console.log(
      '\nForbehold: «makt» = strukturell posisjon, ikke intensjon. Kun sittende styre (fratraadt/avregistrert ekskludert). ' +
        'Dekning etter er projisert fra denne kjøringen. Kjør scripts/dedupe-person-keys.ts --commit før AP-1 re-kjøres, ' +
        'så nye kanoniske personKeys lenkes mot historiske rader. Intern baseline → claim-lock/PCQ før ekstern bruk.',
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('[dekningsutvidelse] feilet:', err)
    process.exit(1)
  })
}
