/**
 * validate-against-brreg.ts — Brønnøysund-validering av selskaps- og styredata
 *
 * Går gjennom alle norske `Company` (numerisk orgNr, orgNrFormat=bronnoysund) og
 * sammenligner mot Enhetsregisterets ÅPNE API (ingen nøkkel):
 *   - /enheter/{orgNr}          → navn, næringskode, form, status, sted, stiftelse
 *   - /enheter/{orgNr}/roller   → styre (LEDE/NEST/MEDL/VARA) + daglig leder (DAGL)
 *
 * Skriver en avviksrapport i samme ånd som COMPANY-EXTRACTION-AUDIT.md:
 *   research/BRREG-VALIDATION-AUDIT.md   (lesbar rapport)
 *   research/brreg-validation-audit.json (maskinlesbar)
 *   research/brreg-validation-candidates.csv (rad per avvik)
 *
 * Dekning vs. grenser (jf. PILOT-BRREG-NORGESGRUPPEN-2026-06-14.md):
 *   ✓ validerer navn/NACE/adresse/status + styre/daglig leder
 *   ✗ gir IKKE regnskapstall (→ Regnskapsregisteret/årsrapport)
 *   ✗ gir IKKE eierandeler/konsern-% (→ verify-ownership-aksjonaerregister.ts)
 *   Samvirkeforetak (SA) og research-konstrukter hoppes over / flagges.
 *
 * Bruk:
 *   npx tsx scripts/validate-against-brreg.ts                 # full rapport, ingen DB-skriving
 *   npx tsx scripts/validate-against-brreg.ts --orgnr=819731322   # én enhet
 *   npx tsx scripts/validate-against-brreg.ts --limit=25      # de første N selskapene
 *   npx tsx scripts/validate-against-brreg.ts --write         # stempler registryVerifiedAt/lastBrregRefreshAt + BoardMember.verificationStatus
 *
 * Claim-disiplin: bekrefter identitet + styre mot primærkilde. «Avvik» betyr
 * «DB ≠ register», ikke nødvendigvis at DB er feil (registeret kan henge etter
 * eller motsatt). Bruk rapporten som triage, ikke som autosannhet. Går gjennom
 * claim-lock før ekstern bruk.
 *
 * Ren kjerne (sammenligning) er eksportert og DB-/nett-fri for enhetstesting.
 */

import 'dotenv/config'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// ─────────────────────────────────────────────────────────────────────────────
// Ren kjerne (ingen DB / nett) — enhetstestbar
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalisering for personKey-matching.
 *
 * Bygger p\u00e5 import-skriptenes normalizePersonKey (lowercase \u2192 NFD \u2192 strip
 * combining marks \u2192 behold [a-z ] \u2192 bindestrek), MEN legger til translitterering
 * av nordiske bokstaver F\u00d8R strippingen. Grunn: '\u00d8/\u00c6/\u00c5' dekomponeres ikke av NFD
 * (de er egne bokstaver, ikke aksenttegn), s\u00e5 uten translitterering ville brregs
 * \u00ab\u00d8yvind\u00bb bli \u00abyvind\u00bb mens importens ASCII-\u00abOyvind\u00bb blir \u00aboyvind\u00bb \u2192 falskt avvik.
 * Translittereringen (\u00f8\u2192o, \u00e6\u2192ae, \u00e5\u2192a, \u00e4\u2192a, \u00f6\u2192o, \u00fc\u2192u) gj\u00f8r n\u00f8klene robuste mot
 * begge stavem\u00e5ter, slik at vi ikke f\u00e5r falske \u00abmangler/utdatert\u00bb-par.
 */
export function normalizePersonKey(name: string): string {
  const translitterert = name
    .toLowerCase()
    .replace(/\u00e6/g, 'ae')
    .replace(/\u00f8/g, 'o')
    .replace(/\u00e5/g, 'a')
    .replace(/\u00e4/g, 'a')
    .replace(/\u00f6/g, 'o')
    .replace(/\u00fc/g, 'u')
  return translitterert
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Løs sammen fornavn/mellomnavn/etternavn fra brreg-personobjekt. */
export function brregPersonName(person: {
  navn?: { fornavn?: string; mellomnavn?: string; etternavn?: string }
}): string {
  const n = person.navn ?? {}
  return [n.fornavn, n.mellomnavn, n.etternavn].filter(Boolean).join(' ').trim()
}

/** brreg rolletype-kode → DB-rollebegrep. */
export function mapRolle(kode: string): string {
  switch (kode) {
    case 'LEDE':
      return 'styreleder'
    case 'NEST':
      return 'nestleder'
    case 'MEDL':
      return 'styremedlem'
    case 'VARA':
      return 'varamedlem'
    case 'OBS':
      return 'observatør'
    case 'DAGL':
      return 'daglig leder'
    default:
      return kode.toLowerCase()
  }
}

export type BrregPerson = { personKey: string; name: string; role: string; fratraadt: boolean }

/** Trekk ut aktive styre- + daglig-leder-personer fra et /roller-svar. */
export function extractBrregPeople(rollerResponse: any): BrregPerson[] {
  const out: BrregPerson[] = []
  const grupper = rollerResponse?.rollegrupper ?? []
  for (const gruppe of grupper) {
    const gkode = gruppe?.type?.kode
    if (gkode !== 'STYR' && gkode !== 'DAGL') continue
    for (const rolle of gruppe?.roller ?? []) {
      if (!rolle?.person) continue // hopp over selskap-roller (revisor/regnskap)
      if (rolle?.fratraadt) continue
      const name = brregPersonName(rolle.person)
      if (!name) continue
      out.push({
        personKey: normalizePersonKey(name),
        name,
        role: mapRolle(rolle?.type?.kode ?? ''),
        fratraadt: false,
      })
    }
  }
  return out
}

export type DbCompany = {
  orgNr: string
  name: string
  naceCode: string | null
  hqCity: string | null
  founded: number | null
  ownershipType: string | null
  boardMembers: { personName: string; personKey: string; role: string }[]
}

export type FieldDiff = { field: string; db: string | number | null; brreg: string | number | null }
export type BoardDiff = {
  missingInDb: BrregPerson[] // i register, ikke i DB → bør legges til
  staleInDb: { personName: string; personKey: string; role: string }[] // i DB, ikke i register → muligens utdatert
  roleMismatch: { personKey: string; name: string; dbRole: string; brregRole: string }[]
}

export type CompanyValidation = {
  orgNr: string
  name: string
  status: 'ok' | 'avvik' | 'ikke-funnet' | 'slettet' | 'hoppet-over'
  registryName?: string
  fieldDiffs: FieldDiff[]
  boardDiff: BoardDiff
  registryStatus?: { konkurs?: boolean; underAvvikling?: boolean; slettet?: boolean }
  note?: string
}

function norm(s: string | null | undefined): string {
  return (s ?? '').trim().toLowerCase()
}

/** Kjernesammenligning: DB-selskap vs. brreg /enheter + /roller. Ingen I/O. */
export function compareCompany(
  db: DbCompany,
  enhet: any | null,
  roller: any | null,
): CompanyValidation {
  const boardDiff: BoardDiff = { missingInDb: [], staleInDb: [], roleMismatch: [] }

  if (!enhet) {
    return {
      orgNr: db.orgNr,
      name: db.name,
      status: 'ikke-funnet',
      fieldDiffs: [],
      boardDiff,
      note: 'orgNr ikke funnet i Enhetsregisteret (sjekk slettedeenheter / feil orgNr)',
    }
  }

  const slettet = Boolean(enhet?.slettedato)
  const fieldDiffs: FieldDiff[] = []

  // Navn (case-insensitiv)
  const regName: string = enhet?.navn ?? ''
  if (norm(regName) !== norm(db.name)) {
    fieldDiffs.push({ field: 'navn', db: db.name, brreg: regName })
  }

  // Næringskode
  const regNace: string | null = enhet?.naeringskode1?.kode ?? null
  if (db.naceCode && regNace && db.naceCode !== regNace) {
    fieldDiffs.push({ field: 'naceCode', db: db.naceCode, brreg: regNace })
  }

  // Poststed / by
  const regCity: string | null = enhet?.forretningsadresse?.poststed ?? null
  if (db.hqCity && regCity && norm(db.hqCity) !== norm(regCity)) {
    fieldDiffs.push({ field: 'hqCity', db: db.hqCity, brreg: regCity })
  }

  // Stiftelsesår
  const regFoundedYear = enhet?.stiftelsesdato
    ? Number(String(enhet.stiftelsesdato).slice(0, 4))
    : null
  if (db.founded && regFoundedYear && db.founded !== regFoundedYear) {
    fieldDiffs.push({ field: 'founded', db: db.founded, brreg: regFoundedYear })
  }

  // Styre / daglig leder
  const brregPeople = roller ? extractBrregPeople(roller) : []
  const brregByKey = new Map(brregPeople.map((p) => [p.personKey, p]))
  const dbByKey = new Map(db.boardMembers.map((m) => [m.personKey, m]))

  for (const p of brregPeople) {
    const match = dbByKey.get(p.personKey)
    if (!match) {
      boardDiff.missingInDb.push(p)
    } else if (norm(match.role) !== norm(p.role)) {
      boardDiff.roleMismatch.push({
        personKey: p.personKey,
        name: p.name,
        dbRole: match.role,
        brregRole: p.role,
      })
    }
  }
  for (const m of db.boardMembers) {
    if (!brregByKey.has(m.personKey)) {
      boardDiff.staleInDb.push({ personName: m.personName, personKey: m.personKey, role: m.role })
    }
  }

  const registryStatus = {
    konkurs: Boolean(enhet?.konkurs),
    underAvvikling: Boolean(enhet?.underAvvikling),
    slettet,
  }

  const hasBoardDiff =
    boardDiff.missingInDb.length > 0 ||
    boardDiff.staleInDb.length > 0 ||
    boardDiff.roleMismatch.length > 0
  const status: CompanyValidation['status'] = slettet
    ? 'slettet'
    : fieldDiffs.length > 0 || hasBoardDiff
      ? 'avvik'
      : 'ok'

  return {
    orgNr: db.orgNr,
    name: db.name,
    status,
    registryName: regName,
    fieldDiffs,
    boardDiff,
    registryStatus,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Nett — Enhetsregisterets åpne API
// ─────────────────────────────────────────────────────────────────────────────

const BASE = 'https://data.brreg.no/enhetsregisteret/api'
const UA = 'food-systems-2026/brreg-validation (research; contact gabriel@naturalstate.no)'

async function fetchJson(url: string, retries = 2): Promise<any | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': UA },
      })
      if (res.status === 404) return null
      if (res.status === 429 || res.status >= 500) {
        await sleep(800 * (attempt + 1))
        continue
      }
      if (!res.ok) return null
      return await res.json()
    } catch {
      await sleep(500 * (attempt + 1))
    }
  }
  return null
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

// ─────────────────────────────────────────────────────────────────────────────
// Rapport-rendering
// ─────────────────────────────────────────────────────────────────────────────

function renderMarkdown(results: CompanyValidation[], meta: { generatedAt: string; skipped: number }): string {
  const ok = results.filter((r) => r.status === 'ok')
  const avvik = results.filter((r) => r.status === 'avvik')
  const ikkeFunnet = results.filter((r) => r.status === 'ikke-funnet')
  const slettet = results.filter((r) => r.status === 'slettet')

  const lines: string[] = []
  lines.push('# Brønnøysund-validering — selskaps- og styredata')
  lines.push('')
  lines.push(`> AUTO-GENERERT av \`scripts/validate-against-brreg.ts\` — ikke rediger manuelt.`)
  lines.push(`> Generert: ${meta.generatedAt}`)
  lines.push(`> Kilde: Enhetsregisterets åpne API (\`data.brreg.no\`), ingen API-nøkkel.`)
  lines.push('')
  lines.push('## Sammendrag')
  lines.push('')
  lines.push('| Status | Antall |')
  lines.push('|---|---:|')
  lines.push(`| ✅ OK (matcher register) | ${ok.length} |`)
  lines.push(`| ⚠️ Avvik | ${avvik.length} |`)
  lines.push(`| ❓ Ikke funnet i register | ${ikkeFunnet.length} |`)
  lines.push(`| 🪦 Slettet i register | ${slettet.length} |`)
  lines.push(`| ⏭️ Hoppet over (SA/research/ikke-norsk) | ${meta.skipped} |`)
  lines.push(`| **Validert totalt** | **${results.length}** |`)
  lines.push('')
  lines.push('Avvik betyr «DB ≠ register» — triage, ikke autosannhet. Registeret kan henge etter, og motsatt.')
  lines.push('')

  if (avvik.length) {
    lines.push('## Avvik')
    lines.push('')
    for (const r of avvik) {
      lines.push(`### ${r.name} (${r.orgNr})`)
      lines.push('')
      if (r.fieldDiffs.length) {
        lines.push('| Felt | DB | brreg |')
        lines.push('|---|---|---|')
        for (const d of r.fieldDiffs) {
          lines.push(`| ${d.field} | ${d.db ?? '—'} | ${d.brreg ?? '—'} |`)
        }
        lines.push('')
      }
      const bd = r.boardDiff
      if (bd.missingInDb.length) {
        lines.push(`**Mangler i DB (finnes i register → legg til):** ${bd.missingInDb.map((p) => `${p.name} (${p.role})`).join('; ')}`)
        lines.push('')
      }
      if (bd.staleInDb.length) {
        lines.push(`**Kun i DB (ikke i register → muligens utdatert):** ${bd.staleInDb.map((p) => `${p.personName} (${p.role})`).join('; ')}`)
        lines.push('')
      }
      if (bd.roleMismatch.length) {
        lines.push(`**Rolleavvik:** ${bd.roleMismatch.map((m) => `${m.name}: DB «${m.dbRole}» vs brreg «${m.brregRole}»`).join('; ')}`)
        lines.push('')
      }
    }
  }

  if (ikkeFunnet.length) {
    lines.push('## Ikke funnet i Enhetsregisteret')
    lines.push('')
    for (const r of ikkeFunnet) lines.push(`- ${r.name} (${r.orgNr}) — ${r.note ?? ''}`)
    lines.push('')
  }
  if (slettet.length) {
    lines.push('## Slettet i registeret')
    lines.push('')
    for (const r of slettet) lines.push(`- ${r.name} (${r.orgNr})`)
    lines.push('')
  }
  return lines.join('\n')
}

function renderCsv(results: CompanyValidation[]): string {
  const rows = [['orgNr', 'name', 'status', 'diffType', 'detail']]
  for (const r of results) {
    if (r.status === 'ok') continue
    if (r.status === 'ikke-funnet' || r.status === 'slettet') {
      rows.push([r.orgNr, r.name, r.status, 'status', r.note ?? ''])
    }
    for (const d of r.fieldDiffs) {
      rows.push([r.orgNr, r.name, r.status, `field:${d.field}`, `db=${d.db ?? ''} | brreg=${d.brreg ?? ''}`])
    }
    for (const p of r.boardDiff.missingInDb) {
      rows.push([r.orgNr, r.name, r.status, 'board:missingInDb', `${p.name} (${p.role})`])
    }
    for (const p of r.boardDiff.staleInDb) {
      rows.push([r.orgNr, r.name, r.status, 'board:staleInDb', `${p.personName} (${p.role})`])
    }
    for (const m of r.boardDiff.roleMismatch) {
      rows.push([r.orgNr, r.name, r.status, 'board:roleMismatch', `${m.name}: db=${m.dbRole} brreg=${m.brregRole}`])
    }
  }
  return rows
    .map((cells) => cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const write = args.includes('--write')
  const orgnrArg = args.find((a) => a.startsWith('--orgnr='))?.split('=')[1]
  const limitArg = args.find((a) => a.startsWith('--limit='))?.split('=')[1]
  const limit = limitArg ? Number(limitArg) : undefined

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const where: any = { country: 'NO', isResearchConstruct: false, orgNrFormat: 'bronnoysund' }
    if (orgnrArg) where.orgNr = orgnrArg

    const companies = await prisma.company.findMany({
      where,
      orderBy: { name: 'asc' },
      ...(limit ? { take: limit } : {}),
      include: { boardMembers: true },
    })

    const results: CompanyValidation[] = []
    let skipped = 0

    for (const c of companies) {
      // Hopp over ikke-numeriske orgnr (landprefiks) som har sluppet gjennom
      if (!/^\d{9}$/.test(c.orgNr)) {
        skipped++
        continue
      }
      const [enhet, roller] = await Promise.all([
        fetchJson(`${BASE}/enheter/${c.orgNr}`),
        fetchJson(`${BASE}/enheter/${c.orgNr}/roller`),
      ])

      const dbCompany: DbCompany = {
        orgNr: c.orgNr,
        name: c.name,
        naceCode: c.naceCode,
        hqCity: c.hqCity,
        founded: c.founded,
        ownershipType: c.ownershipType,
        boardMembers: c.boardMembers.map((m) => ({
          personName: m.personName,
          personKey: m.personKey,
          role: m.role,
        })),
      }

      const validation = compareCompany(dbCompany, enhet, roller)
      results.push(validation)

      if (write && enhet && validation.status !== 'ikke-funnet') {
        const now = new Date()
        await prisma.company.update({
          where: { orgNr: c.orgNr },
          data: { registrySource: 'bronnoysund', registryVerifiedAt: now, lastBrregRefreshAt: now },
        })
        // Stempl styremedlemmer som fortsatt finnes i registeret
        const brregKeys = new Set(extractBrregPeople(roller).map((p) => p.personKey))
        for (const m of c.boardMembers) {
          await prisma.boardMember.update({
            where: { id: m.id },
            data: {
              verifiedAt: now,
              verificationStatus: brregKeys.has(m.personKey) ? 'brreg-confirmed' : 'brreg-absent',
              sourceUrl: `${BASE}/enheter/${c.orgNr}/roller`,
            },
          })
        }
      }

      process.stdout.write(
        `${validation.status === 'ok' ? '✓' : validation.status === 'avvik' ? '⚠' : '?'} ${c.name} (${c.orgNr})\n`,
      )
      await sleep(120) // høflig mot åpent API
    }

    const generatedAt = new Date().toISOString()
    const ROOT = process.cwd()
    const md = renderMarkdown(results, { generatedAt, skipped })
    const csv = renderCsv(results)
    await fs.mkdir(path.join(ROOT, 'research'), { recursive: true })
    await fs.writeFile(path.join(ROOT, 'research', 'BRREG-VALIDATION-AUDIT.md'), md, 'utf8')
    await fs.writeFile(
      path.join(ROOT, 'research', 'brreg-validation-audit.json'),
      JSON.stringify({ generatedAt, skipped, results }, null, 2),
      'utf8',
    )
    await fs.writeFile(path.join(ROOT, 'research', 'brreg-validation-candidates.csv'), csv, 'utf8')

    const avvik = results.filter((r) => r.status === 'avvik').length
    console.log(
      `\nFerdig. ${results.length} validert, ${avvik} avvik, ${skipped} hoppet over.` +
        `${write ? ' DB stemplet (registryVerifiedAt + BoardMember.verificationStatus).' : ' (Ingen DB-skriving — kjør med --write for å stemple.)'}`,
    )
    console.log('Rapport: research/BRREG-VALIDATION-AUDIT.md')
  } finally {
    await prisma.$disconnect()
  }
}

// Kjør kun som CLI (ikke ved import i tester)
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error('brreg-validering feilet:', e)
    process.exit(1)
  })
}
