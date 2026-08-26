/**
 * Regnskapsregisteret-import — henter innleverte årsregnskap fra Brønnøysund og
 * fyller `CompanyFinancial` for alle sporede norske selskaper.
 *
 * Bakgrunn: `refresh-brreg-tracked.ts` henter struktur/ansatte fra
 * Enhetsregisteret, men IKKE regnskapstall. Denne henter de manglende tallene fra
 * det åpne Regnskapsregisteret-API-et:
 *   https://data.brreg.no/regnskapsregisteret/regnskap/{orgnr}
 *
 * Bruk:
 *   npx tsx scripts/import-brreg-financials.ts --dry-run           # forhåndsvis, ingen skriving
 *   npx tsx scripts/import-brreg-financials.ts                     # fyll manglende + oppdater egne rader
 *   npx tsx scripts/import-brreg-financials.ts --overwrite         # la registeret også erstatte kuraterte enkeltselskapsrader
 *   npx tsx scripts/import-brreg-financials.ts --orgnr=982254604   # bare ett selskap
 *   npx tsx scripts/import-brreg-financials.ts --limit=20          # de første 20 (testkjøring)
 *   npx tsx scripts/import-brreg-financials.ts --snapshot          # arkiver rå JSON + SHA-256 til evidence-pack
 *
 * VIKTIGE FORBEHOLD
 *  1. API-ets standardrecord er `regnskapstype=SELSKAP` (enkeltenhet). For
 *     holding-/børsmødre er dette holdingtall, ikke konsern. Disse står i
 *     HOLDING_CONSOLIDATED_ORGNRS og hoppes over MED MINDRE API faktisk leverer
 *     et `KONSERN`-regnskap — slik at kuraterte konserntall fra årsrapport ikke
 *     blir overskrevet av et lite holdingtall.
 *  2. Standard skrivepolitikk klobber ALDRI en kuratert rad (kilde som ikke er
 *     en Regnskapsregisteret-lokator fra denne importeren, jf.
 *     `isRegistrySourced`). Den fyller bare manglende år og oppdaterer rader
 *     denne importeren selv har skrevet. Bruk --overwrite for å la registeret
 *     også erstatte kuraterte enkeltselskapsrader.
 *  3. Ansatte (`groupEmployees`) settes fra `Company.employees` (som
 *     `refresh:brreg` fyller fra Enhetsregisteret) — regnskaps-API-et har ikke
 *     ansatte. Kjør gjerne `refresh:brreg` først for ferske ansattetall.
 *
 * Kildedisiplin: hver rad får `source` satt til register-endepunktet for
 * selskapet (`REGNSKAP_BASE` + `/` + orgnr), `reportingCurrency='NOK'` og
 * `verificationStatus='machine_verified'`; aksessdatoen ligger i `verifiedAt`.
 * Med --snapshot arkiveres rå JSON som registry_snapshot med SHA-256.
 *
 * Formen på `source` er BINDENDE utover denne fila: `RAW_NOK_SOURCE_PATTERNS` i
 * scripts/normalize-financial-units.ts bruker URL-formen til å avgjøre at raden
 * står i rå NOK. Endres strengen uten at det mønsteret følger med, blir nye
 * rader klassifisert som MNOK og ganget opp med 10^6.
 *
 * Ren kjerne (parsing) er eksportert og enhetstestet. main() kjører kun ved
 * direkte kjøring, ikke ved import.
 */

import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

const REGNSKAP_BASE = 'https://data.brreg.no/regnskapsregisteret/regnskap'
const NORWEGIAN_ORGNR_RE = /^\d{9}$/
const DELAY_MS = 100
const SOURCE_PREFIX = 'Regnskapsregisteret (Brønnøysund)'
const SNAPSHOT_DIR = 'research/evidence-pack/registry-sources/regnskapsregisteret'

/**
 * Børsnoterte/holding-mødre der SELSKAP-recorden er holdingtall, ikke konsern.
 * Beskyttes mot å få korrekte konserntall (årsrapport) overskrevet med holdingtall.
 */
export const HOLDING_CONSOLIDATED_ORGNRS = new Set<string>([
  '819731322', // NorgesGruppen ASA
  '910747711', // Orkla ASA
  '960514718', // SalMar ASA
  '975350940', // Lerøy Seafood Group ASA
  '929975200', // Austevoll Seafood ASA
  '964118191', // Mowi ASA
])

// ─── Brreg regnskap-typer (delsettet vi bruker) ──────────────────────────────

export type BrregRegnskap = {
  regnskapstype?: string // 'SELSKAP' | 'KONSERN'
  regnskapsperiode?: { fraDato?: string; tilDato?: string }
  valuta?: string
  virksomhet?: {
    organisasjonsnummer?: string
    organisasjonsform?: string
    morselskap?: boolean
  }
  resultatregnskapResultat?: {
    aarsresultat?: number
    driftsresultat?: {
      driftsresultat?: number
      driftsinntekter?: { sumDriftsinntekter?: number }
    }
  }
}

export type ParsedFinancial = {
  year: number
  regnskapstype: string // 'SELSKAP' | 'KONSERN' | annet
  revenueNok: number | null
  operatingResult: number | null
  operatingMargin: number | null
  fiscalYearLabel: string | null
  fiscalPeriodStart: string | null
  fiscalPeriodEnd: string | null
  reportingCurrency: string | null
}

// ─── Ren kjerne (eksportert, testbar) ────────────────────────────────────────

/** Driftsmargin i prosent, avrundet til 2 desimaler. */
export function computeMargin(
  revenueNok: number | null,
  operatingResult: number | null,
): number | null {
  if (revenueNok == null || operatingResult == null || revenueNok === 0) return null
  return Math.round((operatingResult / revenueNok) * 10000) / 100
}

function yearFromDate(iso: string | undefined): number | null {
  if (!iso || iso.length < 4) return null
  const y = Number.parseInt(iso.slice(0, 4), 10)
  return Number.isFinite(y) ? y : null
}

/** Trekker ut regnskapsfeltene vi lagrer fra én Brreg-record. */
export function parseRegnskapRecord(record: BrregRegnskap): ParsedFinancial | null {
  const fra = record.regnskapsperiode?.fraDato
  const til = record.regnskapsperiode?.tilDato
  // Regnskapsåret knyttes til avslutningsdatoen (håndterer avvikende regnskapsår).
  const year = yearFromDate(til) ?? yearFromDate(fra)
  if (year == null) return null

  const fraYear = yearFromDate(fra)
  const tilYear = yearFromDate(til)
  const crossYear = fraYear != null && tilYear != null && fraYear !== tilYear

  const drift = record.resultatregnskapResultat?.driftsresultat
  const revenueNok = drift?.driftsinntekter?.sumDriftsinntekter ?? null
  const operatingResult = drift?.driftsresultat ?? null

  return {
    year,
    regnskapstype: record.regnskapstype ?? 'SELSKAP',
    revenueNok,
    operatingResult,
    operatingMargin: computeMargin(revenueNok, operatingResult),
    fiscalYearLabel: crossYear ? `${fraYear}/${tilYear}` : null,
    fiscalPeriodStart: fra ?? null,
    fiscalPeriodEnd: til ?? null,
    reportingCurrency: record.valuta ?? null,
  }
}

/**
 * Velger beste record per år: KONSERN foretrekkes over SELSKAP når begge finnes
 * (konserntall gir riktig gruppe-omsetning for mødre).
 */
export function pickBestPerYear(records: BrregRegnskap[]): Map<number, ParsedFinancial> {
  const byYear = new Map<number, ParsedFinancial>()
  for (const raw of records) {
    const parsed = parseRegnskapRecord(raw)
    if (!parsed) continue
    const existing = byYear.get(parsed.year)
    if (!existing) {
      byYear.set(parsed.year, parsed)
    } else if (existing.regnskapstype !== 'KONSERN' && parsed.regnskapstype === 'KONSERN') {
      byYear.set(parsed.year, parsed)
    }
  }
  return byYear
}

/**
 * Sann hvis raden i DB er skrevet av denne importeren (trygt å oppdatere).
 *
 * To former må godtas fordi `buildSourceString` har endret seg:
 *   - `https://data.brreg.no/regnskapsregisteret/regnskap/{orgnr}` — dagens form
 *   - `Regnskapsregisteret (Brønnøysund) API regnskap/...` — formen før 590235d
 *
 * Predikatet godtok tidligere bare prefiks-formen. Siden URL-formen er den
 * eneste `buildSourceString` skriver, var predikatet dermed usant for HVER rad
 * importeren selv hadde laget (95 rader i det lokale korpuset, 0 med
 * prefiks-formen). Egne rader ble talt som kuraterte og aldri oppdatert uten
 * --overwrite, og `[OVERWRITE-CURATED]`-taggen ble skrevet for rader som i
 * virkeligheten var registerhentede.
 *
 * Merk at `Regnskapsregisteret 2024`/`2025` bevisst IKKE er med: de radene
 * kommer fra et separat registeruttrekk, ikke fra denne importeren, og skal
 * fortsatt være beskyttet.
 */
export function isRegistrySourced(source: string | null | undefined): boolean {
  if (!source) return false
  return source.startsWith(`${REGNSKAP_BASE}/`) || source.startsWith(SOURCE_PREFIX)
}

/**
 * Bare NOK-rapporterte tall kan lagres direkte i `revenueNok`. Enkelte filer i
 * EUR/USD (f.eks. Mowi ASA i EUR) — disse krever dokumentert valutakonvertering
 * (Norges Bank årsgjennomsnitt, jf. kildepolicyen) og håndteres manuelt, ikke
 * av denne automatiske importeren.
 */
export function isNokReported(reportingCurrency: string | null | undefined): boolean {
  return reportingCurrency == null || reportingCurrency === 'NOK'
}

/** True when a number fits Prisma/Postgres Decimal(15,2). */
export function fitsDecimal15_2(value: number | null | undefined): boolean {
  if (value == null) return true
  return Math.abs(value) < 10_000_000_000_000
}

/** True when a number fits Prisma/Postgres Decimal(5,2). */
export function fitsDecimal5_2(value: number | null | undefined): boolean {
  if (value == null) return true
  return Math.abs(value) < 1_000
}

/** Bygger `source`-strengen for en rad. */
export function buildSourceString(orgNr: string, year: number, accessedAt: string): string {
  return `${REGNSKAP_BASE}/${orgNr}`
}

// ─── HTTP ────────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchRegnskap(
  orgNr: string,
): Promise<{ data: BrregRegnskap[] | null; status: 'ok' | 'not-found' | 'error'; httpStatus: number }> {
  const url = `${REGNSKAP_BASE}/${orgNr}`
  let resp: Response
  try {
    resp = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'food-systems-2026-brreg-financials/0.1.0',
      },
    })
  } catch {
    return { data: null, status: 'error', httpStatus: 0 }
  }
  if (resp.status === 404 || resp.status === 410) {
    return { data: null, status: 'not-found', httpStatus: resp.status }
  }
  if (!resp.ok) {
    return { data: null, status: 'error', httpStatus: resp.status }
  }
  try {
    const json = (await resp.json()) as BrregRegnskap[] | BrregRegnskap
    const data = Array.isArray(json) ? json : [json]
    return { data, status: 'ok', httpStatus: resp.status }
  } catch {
    return { data: null, status: 'error', httpStatus: resp.status }
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

function parseArg(name: string): string | null {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : null
}

async function main() {
  const { PrismaClient } = await import('../src/generated/prisma/client')
  const { PrismaPg } = await import('@prisma/adapter-pg')
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const dryRun = process.argv.includes('--dry-run')
  const overwrite = process.argv.includes('--overwrite')
  const snapshot = process.argv.includes('--snapshot')
  const onlyOrgNr = parseArg('orgnr')
  const limit = parseArg('limit') ? Number.parseInt(parseArg('limit')!, 10) : null
  const accessedAt = new Date().toISOString().slice(0, 10)
  const snapshotRecords: Array<{ orgNr: string; sha256: string; raw: unknown }> = []

  try {
    const all = await prisma.company.findMany({
      where: { isResearchConstruct: false },
      select: { id: true, orgNr: true, name: true, employees: true },
    })

    let companies = all.filter((c) => NORWEGIAN_ORGNR_RE.test(c.orgNr))
    if (onlyOrgNr) companies = companies.filter((c) => c.orgNr === onlyOrgNr)
    if (limit != null) companies = companies.slice(0, limit)

    console.log(
      `\nRegnskapsregisteret-import${dryRun ? ' (DRY RUN)' : ''}${overwrite ? ' [OVERWRITE]' : ''}: ` +
        `${companies.length} selskaper\n`,
    )

    let rowsWritten = 0
    let rowsCreated = 0
    let rowsUpdated = 0
    let keptCurated = 0
    let companiesWithData = 0
    let notFound = 0
    let errors = 0
    let skippedHolding = 0
    let foreignCurrency = 0
    let rangeSkipped = 0

    for (const company of companies) {
      const { data, status, httpStatus } = await fetchRegnskap(company.orgNr)
      await sleep(DELAY_MS)

      if (status === 'not-found') {
        console.log(`  [404] ${company.orgNr} – ${company.name} (ingen innlevert regnskap)`)
        notFound++
        continue
      }
      if (status === 'error' || !data) {
        console.error(`  [ERROR/${httpStatus}] ${company.orgNr} – ${company.name}`)
        errors++
        continue
      }

      if (snapshot) {
        const rawStr = JSON.stringify(data)
        snapshotRecords.push({
          orgNr: company.orgNr,
          sha256: createHash('sha256').update(rawStr).digest('hex'),
          raw: data,
        })
      }

      const hasKonsern = data.some((r) => r.regnskapstype === 'KONSERN')
      // Holding-/børsmor uten konsern-record: ikke rør de kuraterte konserntallene.
      if (HOLDING_CONSOLIDATED_ORGNRS.has(company.orgNr) && !hasKonsern) {
        console.log(`  [SKIP-HOLDING] ${company.orgNr} – ${company.name} (kun selskapstall; beholder kuratert konsern)`)
        skippedHolding++
        continue
      }

      const perYear = pickBestPerYear(data)
      if (perYear.size === 0) {
        console.log(`  [TOM] ${company.orgNr} – ${company.name} (record uten regnskapsperiode)`)
        continue
      }
      companiesWithData++

      for (const [year, fin] of perYear) {
        // Ikke-NOK-rapportering (f.eks. Mowi i EUR): krever dokumentert FX → manuelt.
        if (!isNokReported(fin.reportingCurrency)) {
          console.log(`  [VALUTA-SKIP] ${company.orgNr} ${company.name} ${year}: rapportert i ${fin.reportingCurrency} (krever manuell FX)`)
          foreignCurrency++
          continue
        }
        if (
          !fitsDecimal15_2(fin.revenueNok) ||
          !fitsDecimal15_2(fin.operatingResult) ||
          !fitsDecimal5_2(fin.operatingMargin)
        ) {
          console.log(`  [RANGE-SKIP] ${company.orgNr} ${company.name} ${year}: tall utenfor Decimal(15,2), krever manuell kontroll`)
          rangeSkipped++
          continue
        }

        const existing = await prisma.companyFinancial.findUnique({
          where: { companyId_year: { companyId: company.id, year } },
          select: { id: true, source: true, revenueNok: true },
        })

        // Skrivepolitikk: behold kuraterte rader med mindre --overwrite.
        if (existing && !isRegistrySourced(existing.source) && !overwrite) {
          keptCurated++
          continue
        }

        const dataRow = {
          revenueNok: fin.revenueNok ?? undefined,
          operatingResult: fin.operatingResult ?? undefined,
          operatingMargin: fin.operatingMargin ?? undefined,
          groupEmployees: company.employees ?? undefined,
          source: buildSourceString(company.orgNr, year, accessedAt),
          fiscalYearLabel: fin.fiscalYearLabel ?? undefined,
          fiscalPeriodStart: fin.fiscalPeriodStart ? new Date(fin.fiscalPeriodStart) : undefined,
          fiscalPeriodEnd: fin.fiscalPeriodEnd ? new Date(fin.fiscalPeriodEnd) : undefined,
          reportingCurrency: fin.reportingCurrency ?? undefined,
          verificationStatus: 'machine_verified',
          verifiedAt: new Date(),
        }

        const action = existing ? 'UPDATE' : 'CREATE'
        const revM = fin.revenueNok != null ? (fin.revenueNok / 1e6).toFixed(1) : '—'
        const tag = fin.regnskapstype === 'KONSERN' ? ' [KONSERN]' : ''
        const clobber = existing && !isRegistrySourced(existing.source) ? ' [OVERWRITE-CURATED]' : ''

        if (dryRun) {
          console.log(`  [DRY ${action}]${tag}${clobber} ${company.orgNr} ${company.name} ${year}: ${revM} MNOK driftsinntekter`)
        } else {
          await prisma.companyFinancial.upsert({
            where: { companyId_year: { companyId: company.id, year } },
            update: dataRow,
            create: { companyId: company.id, year, ...dataRow },
          })
          console.log(`  [${action}]${tag}${clobber} ${company.orgNr} ${company.name} ${year}: ${revM} MNOK`)
        }
        rowsWritten++
        if (action === 'CREATE') rowsCreated++
        else rowsUpdated++
      }
    }

    if (snapshot && snapshotRecords.length > 0 && !dryRun) {
      mkdirSync(SNAPSHOT_DIR, { recursive: true })
      const file = join(SNAPSHOT_DIR, `regnskap-run-${accessedAt}.jsonl`)
      writeFileSync(file, snapshotRecords.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf-8')
      console.log(`\n  Snapshot: ${snapshotRecords.length} responser → ${file}`)
    }

    console.log(`\n--- Oppsummering ---`)
    console.log(`  Selskaper forsøkt:          ${companies.length}`)
    console.log(`  Med regnskap:               ${companiesWithData}`)
    console.log(`  Rader skrevet:              ${rowsWritten} (nye ${rowsCreated}, oppdatert ${rowsUpdated})`)
    console.log(`  Kuraterte rader beholdt:    ${keptCurated}${overwrite ? '' : ' (kjør --overwrite for å erstatte)'}`)
    console.log(`  Holding-mødre hoppet over:  ${skippedHolding}`)
    console.log(`  Utenlandsk valuta (FX):     ${foreignCurrency}`)
    console.log(`  Utenfor DB-tallfelt:        ${rangeSkipped}`)
    console.log(`  Ingen innlevert regnskap:   ${notFound}`)
    console.log(`  Feil:                       ${errors}`)
    if (dryRun) console.log(`  (dry-run — ingen DB-skriving)`)
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  main().catch((err) => {
    console.error('[brreg-financials] feilet:', err)
    process.exit(1)
  })
}
