/**
 * `CompanyFinancial` lagrer pengebeløp i TO enheter samtidig.
 *
 * Målt på hele korpuset (406 rader, 372 med `revenueNok`):
 *
 *   214 rader i RÅ NOK   — skrevet av registerimportene og tre-importene
 *   158 rader i MNOK     — skrevet av seed-/kuratorimportene
 *
 * Konsekvensen er at enhver sammenligning, sortering eller aggregering på
 * tvers av selskaper er feil med faktor 10^6 for en delmengde. AP-2s
 * inntekts-HHI (`research/analyse/ap2-nodekonsentrasjon.json`) er det
 * tydeligste utslaget: ALLE sju noder med data blander de to enhetene, så
 * MNOK-selskapene får en markedsandel 10^6 for lav og HHI-en drives i
 * praksis av rå-NOK-delmengden alene.
 *
 * ── Hvorfor ikke størrelsesorden ──────────────────────────────────────────
 *
 * Det ligger nær å skille radene på en terskel. Det er feil. Rå-NOK-radene
 * går helt ned i null:
 *
 *   NorgesGruppen Merkevare AS  2024        20,00  (Regnskapsregisteret 2024)
 *   SELVÆR SEAWEED AS           2024      8 081,00  (data.brreg.no/...)
 *   ALGAVIDA AS                 2024    408 944,00  (data.brreg.no/...)
 *   1814 NORD AS                2024          0,00  (data.brreg.no/...)
 *
 * En terskel på 10^6 ville ganget disse med en million. 12 rå-NOK-rader
 * ligger under 10^6 på `revenueNok`, og ytterligere 26 rader uten
 * `revenueNok` har `operatingResult` under 10^6. Enheten må derfor avgjøres
 * av PROVENIENS — hvilken importsti som skrev raden — ikke av tallet.
 *
 * ── Valgt enhet: RÅ NOK ───────────────────────────────────────────────────
 *
 *   1. Feltet heter `revenueNok`.
 *   2. Lesesiden har allerede rå NOK som kanonisk enhet: `financialAmountToNok`
 *      i `src/lib/queries/financial-units.ts` konverterer MNOK → NOK ved lesing.
 *   3. MNOK ville ØDELAGT data. Kolonnen er `Decimal(15,2)`, så 20 NOK blir
 *      0,00 MNOK og 8 081 NOK blir 0,01 MNOK. Rå NOK taper ingenting:
 *      MNOK-verdiene er eksakte heltall etter multiplikasjon.
 *   4. Rekkevidden holder: største beløp i korpuset er 231 000 MNOK →
 *      2,31e11 NOK, godt innenfor Decimal(15,2) (~1e13).
 *
 * ── Båndet som gjør skriptet idempotent ───────────────────────────────────
 *
 * Innenfor en rad som er klassifisert som MNOK gjelder et målt bånd:
 * største MNOK-beløp i korpuset er 231 000 (2,3e5), minste beløp ETTER
 * konvertering er 2,8e8. Gapet er tre størrelsesordener. Et felt i en
 * MNOK-rad som allerede ligger på eller over 10^6 er derfor allerede
 * konvertert — eller skrevet i rå NOK — og røres ikke.
 *
 * Det gir tre ting på én gang:
 *   - kjøring nummer to er en no-op (ingen dobbeltkonvertering)
 *   - blandede rader repareres per felt (se Austevoll under)
 *   - grensen er identisk med den `financialAmountToNok` bruker, så
 *     lesesiden blir en no-op når dataene er normalisert. Appen viser
 *     nøyaktig samme tall før og etter — bortsett fra de 18 radene
 *     lesesiden i dag bommer på (`Ársreikningur`, `Proff.no`,
 *     `Annual and Sustainability Report`, `key-figures`), som blir riktige.
 *
 * Tørrkjøring er default. `--apply` skriver.
 */
import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { MILLION_NOK_IN_NOK } from '../src/lib/queries/financial-units'

export { MILLION_NOK_IN_NOK }

/**
 * Grensen mellom «står i MNOK» og «står allerede i rå NOK», målt på
 * korpuset: største MNOK-beløp er 231 000, minste konverterte er 2,8e8.
 * Samme grense som `financialAmountToNok` bruker ved lesing.
 */
export const UNIT_BAND_NOK = 1_000_000

/**
 * Overløp trenger ingen kjøretidssjekk: båndet gjør det strukturelt umulig.
 * Et felt konverteres bare når |verdi| < 10^6, så resultatet er alltid
 * < 10^12, og `Decimal(15,2)` rommer ~10^13.
 */

/**
 * Kilder som skriver RÅ NOK. Hvert mønster er sporet til importskriptet
 * som produserer strengen:
 *
 *   data.brreg.no/...   `buildSourceString()` i import-brreg-financials.ts.
 *                       Samme fil logger `revenueNok / 1e6` som «MNOK», så
 *                       lagret verdi er utvetydig rå NOK.
 *   offentligdata MCP   de ti tre-importene (asko, coop, tine, orkla, …),
 *                       alle på formen `c.revenue2024! * 1_000_000`.
 *   Regnskapsregisteret 2024/2025
 *                       registeruttrekk; maks 3,8e10 på store selskaper.
 *   web research 2026-03
 *                       leroy-/mowi-/salmar-/bama-/kavli-trærne, samme
 *                       `* 1_000_000`-form.
 *
 * Alt annet er kuraterte seed-rader i MNOK.
 */
export const RAW_NOK_SOURCE_PATTERNS: readonly RegExp[] = [
  /^https:\/\/data\.brreg\.no\/regnskapsregisteret\/regnskap\//,
  /offentligdata MCP/,
  /^Regnskapsregisteret 20\d{2}$/,
  /web research 2026-03/,
] as const

/** Pengefelt i `Decimal(15,2)`. `operatingMargin`/`equityRatio` er prosent og røres ikke. */
export const MONEY_FIELDS = ['revenueNok', 'operatingResult', 'ebitda'] as const
export type MoneyField = (typeof MONEY_FIELDS)[number]

export type FinancialUnit = 'raw_nok' | 'million_nok' | 'unknown'

/**
 * Klassifiserer en rad på `source` alene — aldri på beløpet.
 *
 * En rad uten kilde er `unknown`, ikke MNOK. Enheten her ER provenienskjeden;
 * uten den finnes det ikke noe å avgjøre den fra, og et gjett ganger tallet
 * med en million. Korpuset har null slike rader i dag, og guarden står for
 * at det skal fortsette å være tilfellet.
 */
export function classifyFinancialUnit(source: string | null | undefined): FinancialUnit {
  if (!source || source.trim() === '') return 'unknown'
  const trimmed = source.trim()
  return RAW_NOK_SOURCE_PATTERNS.some(pattern => pattern.test(trimmed)) ? 'raw_nok' : 'million_nok'
}

export type MoneyRow = {
  id: string
  year: number
  companyName?: string
  revenueNok: unknown
  operatingResult: unknown
  ebitda: unknown
  operatingMargin: unknown
  groupEmployees?: number | null
  source: string | null
}

/**
 * Omsetning per ansatt i rå NOK, som uavhengig rimelighetssjekk etter
 * konvertering. Målt på korpuset ligger de kuraterte radene mellom 200 000
 * og 25 000 000; båndet under er bevisst mye videre, så det bare slår ut på
 * grov feilklassifisering — en rå-NOK-rad som ved et uhell ble ganget med
 * en million lander flere størrelsesordener utenfor.
 *
 * Dette er nettet under kildemønstrene: prod er større enn korpuset
 * mønstrene ble målt på, og en ukjent kildestreng ville ellers passert
 * stille.
 */
export const REVENUE_PER_EMPLOYEE_MIN_NOK = 100_000
export const REVENUE_PER_EMPLOYEE_MAX_NOK = 500_000_000

export type FieldChange = { field: MoneyField; from: number; to: number }

export type RowPlan = {
  id: string
  year: number
  companyName: string | null
  source: string | null
  unit: FinancialUnit
  action: 'convert' | 'unchanged' | 'blocked'
  changes: FieldChange[]
  /** Felt som allerede lå over båndet og derfor står urørt. */
  alreadyRaw: MoneyField[]
  blockers: string[]
  warnings: string[]
}

export function asNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Ren planlegging — ingen DB, ingen mutasjon.
 *
 * Konverteringen er PER FELT, ikke per rad. Det er ikke pedanteri: Austevoll
 * Seafood ASA 2024 har `revenueNok = 30 600` (MNOK) og
 * `operatingResult = 4 200 000 000` (rå NOK) i samme rad. Konvertering per
 * rad ville enten latt hele raden stå (fortsatt blandet) eller ganget
 * driftsresultatet opp til 4,2e18 og sprengt `Decimal(15,2)`. Per felt
 * lander raden på én enhet.
 */
export function planRowConversion(row: MoneyRow): RowPlan {
  const unit = classifyFinancialUnit(row.source)
  const plan: RowPlan = {
    id: row.id,
    year: row.year,
    companyName: row.companyName ?? null,
    source: row.source,
    unit,
    action: 'unchanged',
    changes: [],
    alreadyRaw: [],
    blockers: [],
    warnings: [],
  }

  if (unit === 'raw_nok') return plan

  for (const field of MONEY_FIELDS) {
    const value = asNumber(row[field])
    if (value === null || value === 0) continue

    // Over båndet ⇒ allerede rå NOK. Gjør kjøring nummer to til en no-op.
    if (Math.abs(value) >= UNIT_BAND_NOK) {
      plan.alreadyRaw.push(field)
      continue
    }

    if (unit === 'unknown') {
      plan.blockers.push(`${field}=${value} under båndet, men kilden mangler — enheten kan ikke avgjøres`)
      continue
    }

    plan.changes.push({ field, from: value, to: value * MILLION_NOK_IN_NOK })
  }

  if (plan.blockers.length > 0) {
    plan.action = 'blocked'
    plan.changes = []
    return plan
  }

  // Marginidentiteten er enhetsuavhengig og fanger rader der feltene ikke
  // fulgte hverandre. Den blokkerer ikke — raden får riktig enhet uansett —
  // men avviket skal være synlig i rapporten som en egen datasak.
  const margin = asNumber(row.operatingMargin)
  const revenue = resolveField(row, 'revenueNok', plan)
  const operating = resolveField(row, 'operatingResult', plan)
  if (margin !== null && revenue !== null && operating !== null && revenue !== 0) {
    const implied = (operating / revenue) * 100
    if (Math.abs(implied - margin) > 0.6) {
      plan.warnings.push(
        `operatingMargin=${margin} mot implisitt ${implied.toFixed(2)} etter konvertering`,
      )
    }
  }

  const employees = row.groupEmployees ?? null
  if (revenue !== null && revenue > 0 && employees !== null && employees > 0) {
    const perEmployee = revenue / employees
    if (
      perEmployee < REVENUE_PER_EMPLOYEE_MIN_NOK ||
      perEmployee > REVENUE_PER_EMPLOYEE_MAX_NOK
    ) {
      plan.warnings.push(
        `omsetning per ansatt ${Math.round(perEmployee)} NOK etter konvertering — utenfor rimelig bånd`,
      )
    }
  }

  if (plan.changes.length > 0) plan.action = 'convert'
  return plan
}

/** Verdien feltet HAR etter at planen er anvendt. */
function resolveField(row: MoneyRow, field: MoneyField, plan: RowPlan): number | null {
  const change = plan.changes.find(c => c.field === field)
  if (change) return change.to
  return asNumber(row[field])
}

export type CliOptions = { apply: boolean; jsonOut: string | null }

export function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { apply: false, jsonOut: null }
  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true
    } else if (arg.startsWith('--json-out=')) {
      const value = arg.slice('--json-out='.length).trim()
      if (!value) throw new Error(`Ugyldig --json-out: ${arg}`)
      options.jsonOut = value
    } else {
      throw new Error(`Ukjent argument: ${arg}`)
    }
  }
  return options
}

/**
 * Strukturell klienttype framfor hele `PrismaClient`, slik at skrivestien
 * kan testes uten DB. Samme begrunnelse som i `resolve-leroy-duplicate.ts`:
 * funksjonen muterer prod.
 */
export type FinancialWriteClient = {
  companyFinancial: {
    update: (args: unknown) => Promise<unknown>
  }
}

/**
 * Skriver én rad. Guarden ligger inne i funksjonen med vilje: en kaller som
 * glemmer å sjekke `action` skal ikke kunne skrive en blokkert rad likevel.
 */
export async function applyRowConversion(
  client: FinancialWriteClient,
  plan: RowPlan,
  apply: boolean,
): Promise<boolean> {
  if (plan.action !== 'convert' || plan.changes.length === 0) return false
  if (!apply) return false

  const data: Record<string, number> = {}
  for (const change of plan.changes) data[change.field] = change.to
  await client.companyFinancial.update({ where: { id: plan.id }, data })
  return true
}

export type NormalizationSummary = {
  rows: number
  rawNok: number
  millionNok: number
  unknownUnit: number
  converted: number
  unchanged: number
  blocked: number
  fieldsConverted: number
  /** Største MNOK-beløp som ble konvertert — båndet forutsetter at dette holder seg under 10^6. */
  maxMillionValue: number
}

/**
 * Oppsummering per kildestreng. Dette er review-flaten før en ekte kjøring:
 * en kilde som er ukjent fra kartleggingen dukker opp her som en egen linje,
 * og en rå-NOK-kilde som mønstrene ikke fanger vil stå som `million_nok`.
 */
export function summarizeBySource(
  plans: RowPlan[],
): { source: string; unit: FinancialUnit; rows: number; converted: number }[] {
  const groups = new Map<string, { source: string; unit: FinancialUnit; rows: number; converted: number }>()
  for (const plan of plans) {
    const source = plan.source ?? '(uten kilde)'
    const key = `${plan.unit}\u0000${source}`
    const entry = groups.get(key) ?? { source, unit: plan.unit, rows: 0, converted: 0 }
    entry.rows++
    if (plan.action === 'convert') entry.converted++
    groups.set(key, entry)
  }
  return [...groups.values()].sort((a, b) => b.rows - a.rows || a.source.localeCompare(b.source))
}

export function summarize(plans: RowPlan[]): NormalizationSummary {
  const summary: NormalizationSummary = {
    rows: plans.length,
    rawNok: 0,
    millionNok: 0,
    unknownUnit: 0,
    converted: 0,
    unchanged: 0,
    blocked: 0,
    fieldsConverted: 0,
    maxMillionValue: 0,
  }
  for (const plan of plans) {
    if (plan.unit === 'raw_nok') summary.rawNok++
    else if (plan.unit === 'unknown') summary.unknownUnit++
    else summary.millionNok++
    if (plan.action === 'convert') summary.converted++
    else if (plan.action === 'blocked') summary.blocked++
    else summary.unchanged++
    summary.fieldsConverted += plan.changes.length
    for (const change of plan.changes) {
      summary.maxMillionValue = Math.max(summary.maxMillionValue, Math.abs(change.from))
    }
  }
  return summary
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  console.log('=== CompanyFinancial: normalisering av pengeenheter til rå NOK ===')
  console.log(JSON.stringify(options))

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const rows = await prisma.companyFinancial.findMany({
      select: {
        id: true,
        year: true,
        revenueNok: true,
        operatingResult: true,
        ebitda: true,
        operatingMargin: true,
        groupEmployees: true,
        source: true,
        company: { select: { name: true } },
      },
      orderBy: [{ year: 'desc' }, { id: 'asc' }],
    })

    const plans = rows.map(row =>
      planRowConversion({
        id: row.id,
        year: row.year,
        companyName: row.company?.name,
        revenueNok: row.revenueNok,
        operatingResult: row.operatingResult,
        ebitda: row.ebitda,
        operatingMargin: row.operatingMargin,
        groupEmployees: row.groupEmployees,
        source: row.source,
      }),
    )

    const summary = summarize(plans)
    console.log(`\nrader: ${summary.rows}`)
    console.log(`  rå NOK (uendret):        ${summary.rawNok}`)
    console.log(`  MNOK (klassifisert):     ${summary.millionNok}`)
    console.log(`  uten kilde (blokkeres):  ${summary.unknownUnit}`)
    console.log(`  → konverteres:           ${summary.converted} rader / ${summary.fieldsConverted} felt`)
    console.log(`  → allerede normalisert:  ${summary.millionNok - summary.converted}`)
    console.log(`  → BLOKKERT:              ${summary.blocked}`)
    console.log(`  største MNOK-beløp:      ${summary.maxMillionValue} (båndet krever < ${UNIT_BAND_NOK})`)

    const blocked = plans.filter(p => p.action === 'blocked')
    if (blocked.length > 0) {
      console.log('\nBLOKKERTE RADER — krever manuell avklaring:')
      for (const plan of blocked) {
        console.log(`  ${plan.companyName ?? '?'} ${plan.year}: ${plan.blockers.join('; ')}`)
      }
    }

    const warned = plans.filter(p => p.warnings.length > 0)
    if (warned.length > 0) {
      console.log('\nADVARSLER (konverteres, men tallene henger ikke sammen):')
      for (const plan of warned) {
        console.log(`  ${plan.companyName ?? '?'} ${plan.year}: ${plan.warnings.join('; ')}`)
      }
    }

    const mixed = plans.filter(p => p.action === 'convert' && p.alreadyRaw.length > 0)
    if (mixed.length > 0) {
      console.log('\nBLANDEDE RADER (noen felt sto allerede i rå NOK):')
      for (const plan of mixed) {
        console.log(`  ${plan.companyName ?? '?'} ${plan.year}: urørt ${plan.alreadyRaw.join(', ')}`)
      }
    }

    let written = 0
    for (const plan of plans) {
      if (await applyRowConversion(prisma, plan, options.apply)) written++
    }

    const bySource = summarizeBySource(plans)
    console.log('\nKILDER SOM KONVERTERES (gå gjennom disse før en ekte kjøring):')
    for (const entry of bySource.filter(e => e.converted > 0)) {
      console.log(`  ${String(entry.converted).padStart(4)} rader  ${entry.source.slice(0, 90)}`)
    }

    const report = {
      generatedAt: new Date().toISOString(),
      applied: options.apply,
      summary,
      bySource,
      written,
      blocked: blocked.map(p => ({ id: p.id, company: p.companyName, year: p.year, blockers: p.blockers })),
      warnings: warned.map(p => ({ id: p.id, company: p.companyName, year: p.year, warnings: p.warnings })),
      conversions: plans
        .filter(p => p.action === 'convert')
        .map(p => ({
          id: p.id,
          company: p.companyName,
          year: p.year,
          source: p.source,
          alreadyRaw: p.alreadyRaw,
          changes: p.changes,
        })),
    }
    if (options.jsonOut) {
      writeFileSync(options.jsonOut, `${JSON.stringify(report, null, 2)}\n`)
      console.log(`\nrapport skrevet: ${options.jsonOut}`)
    }

    console.log(
      options.apply
        ? `\nSKREVET til DB: ${written} rader.`
        : '\nTØRRKJØRING — ingenting er skrevet. Kjør med --apply for å utføre.',
    )
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('[normalize-financial-units] feilet:', err)
    process.exit(1)
  })
}
