/**
 * Lerøy Seafood Group ASA ligger i prod som TO `Company`-rader:
 *
 *   975320637  cmmw35g5v001bwn0dp05hivvq  — ugyldig, gir 404 i Enhetsregisteret
 *   975350940  cmo8jukjt0066amogisgizfg4  — gyldig; årsrapporten oppgir selv
 *                                            «identification number 975 350 940»
 *
 * Det er derfor IKKE en orgnr-retting: `Company.orgNr` er `@unique`, så en
 * `UPDATE ... SET orgNr` ville feilet på constrainten. Det er en duplikat-sak.
 *
 * Skriptet gjør to ting, i denne rekkefølgen:
 *
 *   1. Retter 2024-regnskapet på den kanoniske raden mot årsrapporten.
 *      BEGGE radene var merket «Årsrapport 2024» og BEGGE motsa den —
 *      30 000/3 500 er runde estimattall, 34 009/1 561 ser ut som 2025-tall
 *      feilmerket som 2024. Ingen av dem forekommer i rapporten.
 *   2. Sletter duplikatraden.
 *
 * Rettingen går først med vilje: hvis sletting går først og steg 2 feiler,
 * står korpuset igjen med én rad som fortsatt bærer feil tall og ingen
 * duplikat å oppdage feilen fra.
 *
 * Tørrkjøring er default. `--apply` skriver.
 */
import 'dotenv/config'
import { writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export const CANONICAL_ORGNR = '975350940'
export const DUPLICATE_ORGNR = '975320637'

/**
 * Konserntall, Lerøy Seafood Group ASA årsrapport 2024, konsolidert
 * resultatregnskap: driftsinntekter 31 124 691 og driftsresultat (EBIT)
 * 2 964 266 — begge i NOK 1 000.
 *
 * Lagres i MNOK fordi det er enheten de to Lerøy-radene allerede bruker
 * (30 000 / 34 009). `revenueNok` har inkonsistente enheter på tvers av
 * korpuset — noen rader står i rå NOK — men det er en egen sak, og å
 * skifte enhet her ville gjort denne raden uforenlig med sin egen historikk.
 * De eksakte tNOK-tallene ligger i `source` så presisjonen ikke går tapt.
 */
export const FY2024 = {
  year: 2024,
  revenueNok: 31125,
  operatingResult: 2964,
  operatingMargin: 9.52,
  source:
    'Lerøy Seafood Group ASA, Annual Report 2024, konsolidert resultatregnskap: ' +
    'driftsinntekter 31 124 691 tNOK, driftsresultat (EBIT) 2 964 266 tNOK',
} as const

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
 * Alt som kan henge på en `Company`. Tellingen er bevisst uttømmende:
 * poenget er å oppdage at prod har endret seg siden duplikatet ble
 * kartlagt, ikke å bekrefte det vi allerede tror.
 */
export type DependencyCounts = {
  financials: number
  shareholders: number
  boardMembers: number
  subsidies: number
  documentRefs: number
  actor: number
  ownershipAsParent: number
  ownershipAsChild: number
  ownedProperties: number
  tenantProperties: number
  relationshipsFrom: number
  relationshipsTo: number
  aquacultureSites: number
  aquacultureApps: number
  deliveriesAsSupplier: number
  deliveriesAsBuyer: number
  deliveriesBySupplierOrgNr: number
}

/**
 * Bare disse to kan forsvinne med duplikatet:
 *   - `financials` er verifisert feil mot årsrapporten
 *   - `shareholders` er identisk duplisert på den kanoniske raden
 *     (Austevoll Seafood / Møgster-familien, 52,7 %)
 *
 * Alt annet er data som bare finnes på duplikatet, og som en sletting
 * ville tatt med seg uten spor.
 */
export const DISCARDABLE_DEPENDENCIES = ['financials', 'shareholders'] as const

/**
 * Returnerer avhengigheter som gjør sletting utrygg. Tom liste = trygt.
 *
 * `deliveriesBySupplierOrgNr` fortjener en egen merknad: `DeliveryVolume`
 * peker på leverandøren både via fremmednøkkel OG via `supplierOrgNr`, som
 * er en ren streng. Databasen beskytter ikke strengen, så en sletting kan
 * etterlate leveranserader som viser til et orgnr uten selskap.
 */
export function blockingDependencies(counts: DependencyCounts): string[] {
  const discardable = new Set<string>(DISCARDABLE_DEPENDENCIES)
  return Object.entries(counts)
    .filter(([key, count]) => count > 0 && !discardable.has(key))
    .map(([key, count]) => `${key}=${count}`)
    .sort()
}

export type FinancialRow = {
  id: string
  year: number
  revenueNok: unknown
  operatingResult: unknown
  operatingMargin: unknown
  source: string | null
}

export type FinancialPlan = {
  action: 'create' | 'update' | 'unchanged'
  changes: { field: string; from: string; to: string }[]
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/**
 * Ren planlegging: hva ville rettingen endret? Skiller `create` fra `update`
 * slik at en manglende 2024-rad ikke ser ut som en stille no-op.
 */
export function planFinancialCorrection(existing: FinancialRow | null): FinancialPlan {
  if (!existing) {
    return {
      action: 'create',
      changes: [
        { field: 'revenueNok', from: '—', to: String(FY2024.revenueNok) },
        { field: 'operatingResult', from: '—', to: String(FY2024.operatingResult) },
        { field: 'operatingMargin', from: '—', to: String(FY2024.operatingMargin) },
        { field: 'source', from: '—', to: FY2024.source },
      ],
    }
  }

  const changes: { field: string; from: string; to: string }[] = []
  const compare = (field: string, from: number | null, to: number) => {
    if (from === null || Math.abs(from - to) > 0.001) {
      changes.push({ field, from: from === null ? '—' : String(from), to: String(to) })
    }
  }
  compare('revenueNok', asNumber(existing.revenueNok), FY2024.revenueNok)
  compare('operatingResult', asNumber(existing.operatingResult), FY2024.operatingResult)
  compare('operatingMargin', asNumber(existing.operatingMargin), FY2024.operatingMargin)
  if (existing.source !== FY2024.source) {
    changes.push({ field: 'source', from: existing.source ?? '—', to: FY2024.source })
  }

  return { action: changes.length === 0 ? 'unchanged' : 'update', changes }
}

/**
 * Strukturell klienttype framfor hele `PrismaClient`, slik at skrivestien
 * kan testes uten DB. Samme begrunnelse som i
 * `extend-board-coverage-brreg.ts`: funksjonen muterer prod, og en
 * sletting har ingen angreknapp.
 */
export type CompanyWriteClient = {
  company: {
    findUnique: (args: unknown) => Promise<{ id: string; name: string; orgNr: string } | null>
    delete: (args: unknown) => Promise<unknown>
  }
  companyFinancial: {
    findFirst: (args: unknown) => Promise<FinancialRow | null>
    create: (args: unknown) => Promise<unknown>
    update: (args: unknown) => Promise<unknown>
    deleteMany: (args: unknown) => Promise<unknown>
  }
  shareholder: { deleteMany: (args: unknown) => Promise<unknown> }
}

export async function applyFinancialCorrection(
  client: CompanyWriteClient,
  companyId: string,
  plan: FinancialPlan,
  apply: boolean,
): Promise<void> {
  if (plan.action === 'unchanged' || !apply) return

  if (plan.action === 'create') {
    await client.companyFinancial.create({
      data: {
        companyId,
        year: FY2024.year,
        revenueNok: FY2024.revenueNok,
        operatingResult: FY2024.operatingResult,
        operatingMargin: FY2024.operatingMargin,
        source: FY2024.source,
      },
    })
    return
  }

  await client.companyFinancial.update({
    where: { companyId_year: { companyId, year: FY2024.year } },
    data: {
      revenueNok: FY2024.revenueNok,
      operatingResult: FY2024.operatingResult,
      operatingMargin: FY2024.operatingMargin,
      source: FY2024.source,
    },
  })
}

/**
 * Sletter duplikatet — men bare når `blockingDependencies` er tom.
 * Guarden ligger inne i funksjonen med vilje: en kaller som glemmer å
 * sjekke skal ikke kunne slette likevel.
 */
export async function deleteDuplicate(
  client: CompanyWriteClient,
  companyId: string,
  counts: DependencyCounts,
  apply: boolean,
): Promise<void> {
  const blocking = blockingDependencies(counts)
  if (blocking.length > 0) {
    throw new Error(
      `Nekter å slette ${companyId}: duplikatet har avhengigheter som ville gått tapt (${blocking.join(', ')}). ` +
        'Kartlegg dem og flytt dem til den kanoniske raden før sletting.',
    )
  }
  if (!apply) return

  await client.companyFinancial.deleteMany({ where: { companyId } })
  await client.shareholder.deleteMany({ where: { companyId } })
  await client.company.delete({ where: { id: companyId } })
}

async function countDependencies(prisma: PrismaClient, companyId: string, orgNr: string): Promise<DependencyCounts> {
  return {
    financials: await prisma.companyFinancial.count({ where: { companyId } }),
    shareholders: await prisma.shareholder.count({ where: { companyId } }),
    boardMembers: await prisma.boardMember.count({ where: { companyId } }),
    subsidies: await prisma.subsidy.count({ where: { companyId } }),
    documentRefs: await prisma.companyDocumentRef.count({ where: { companyId } }),
    actor: await prisma.actor.count({ where: { companyId } }),
    ownershipAsParent: await prisma.companyOwnership.count({ where: { parentCompanyId: companyId } }),
    ownershipAsChild: await prisma.companyOwnership.count({ where: { childCompanyId: companyId } }),
    ownedProperties: await prisma.companyProperty.count({ where: { companyId } }),
    tenantProperties: await prisma.companyProperty.count({ where: { tenantCompanyId: companyId } }),
    relationshipsFrom: await prisma.businessRelationship.count({ where: { fromCompanyId: companyId } }),
    relationshipsTo: await prisma.businessRelationship.count({ where: { toCompanyId: companyId } }),
    aquacultureSites: await prisma.aquacultureSite.count({ where: { companyId } }),
    aquacultureApps: await prisma.aquacultureApplication.count({ where: { companyId } }),
    deliveriesAsSupplier: await prisma.deliveryVolume.count({ where: { supplierId: companyId } }),
    deliveriesAsBuyer: await prisma.deliveryVolume.count({ where: { buyerId: companyId } }),
    deliveriesBySupplierOrgNr: await prisma.deliveryVolume.count({ where: { supplierOrgNr: orgNr } }),
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  console.log('=== Lerøy-duplikat: retting av 2024-regnskap + sletting av ugyldig rad ===')
  console.log(JSON.stringify(options))

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const canonical = await prisma.company.findUnique({
      where: { orgNr: CANONICAL_ORGNR },
      select: { id: true, name: true, orgNr: true },
    })
    const duplicate = await prisma.company.findUnique({
      where: { orgNr: DUPLICATE_ORGNR },
      select: { id: true, name: true, orgNr: true },
    })

    if (!canonical) {
      throw new Error(`Fant ikke den kanoniske raden (${CANONICAL_ORGNR}). Avbryter uten å røre noe.`)
    }
    console.log(`kanonisk:  ${canonical.orgNr}  ${canonical.id}  ${canonical.name}`)
    console.log(duplicate ? `duplikat:  ${duplicate.orgNr}  ${duplicate.id}  ${duplicate.name}` : 'duplikat:  finnes ikke (allerede ryddet)')

    // Steg 1 — regnskapsrettingen, på den kanoniske raden.
    const existing = await prisma.companyFinancial.findFirst({
      where: { companyId: canonical.id, year: FY2024.year },
      select: { id: true, year: true, revenueNok: true, operatingResult: true, operatingMargin: true, source: true },
    })
    const plan = planFinancialCorrection(existing)
    console.log(`\n[1/2] regnskap ${FY2024.year}: ${plan.action}`)
    for (const change of plan.changes) {
      console.log(`      ${change.field}: ${change.from} → ${change.to}`)
    }
    await applyFinancialCorrection(prisma, canonical.id, plan, options.apply)

    // Steg 2 — slettingen.
    let counts: DependencyCounts | null = null
    let blocking: string[] = []
    if (duplicate) {
      counts = await countDependencies(prisma, duplicate.id, duplicate.orgNr)
      blocking = blockingDependencies(counts)
      console.log(`\n[2/2] duplikatets avhengigheter: ${JSON.stringify(counts)}`)
      console.log(blocking.length > 0 ? `      BLOKKERER: ${blocking.join(', ')}` : '      ingen blokkerende avhengigheter')
      await deleteDuplicate(prisma, duplicate.id, counts, options.apply)
    }

    const report = {
      generatedAt: new Date().toISOString(),
      applied: options.apply,
      canonical,
      duplicate,
      financialPlan: plan,
      duplicateDependencies: counts,
      blocking,
    }
    if (options.jsonOut) {
      writeFileSync(options.jsonOut, `${JSON.stringify(report, null, 2)}\n`)
      console.log(`\nrapport skrevet: ${options.jsonOut}`)
    }
    console.log(options.apply ? '\nSKREVET til DB.' : '\nTØRRKJØRING — ingenting er skrevet. Kjør med --apply for å utføre.')
  } finally {
    await prisma.$disconnect()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => {
    console.error('[leroy-duplikat] feilet:', err)
    process.exit(1)
  })
}
