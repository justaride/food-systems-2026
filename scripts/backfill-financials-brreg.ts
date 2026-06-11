import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildFinancialMissingMetadata,
  buildFinancialUpsertData,
  classifyFinancialBackfillTarget,
  selectLatestCompanyStatement,
  type FinancialMissingReason,
  type RegnskapsregisteretStatement,
} from '../src/lib/financial-backfill'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const REGNSKAPSREGISTERET_BASE = 'https://data.brreg.no/regnskapsregisteret/regnskap'
const USER_AGENT = 'food-systems-2026-financial-backfill/0.1.0'

type Options = {
  apply: boolean
  includeExisting: boolean
  limit: number | null
  delayMs: number
  onlyOrgNr: string | null
}

type BackfillCompany = {
  id: string
  name: string
  orgNr: string
  country: string
  legalForm: string | null
  isResearchConstruct: boolean
  metadata: unknown
  _count: {
    financials: number
  }
}

function parseNumberArg(name: string): number | null {
  const prefix = `--${name}=`
  const raw = process.argv.find(arg => arg.startsWith(prefix))?.slice(prefix.length)
  if (!raw) return null
  const parsed = Number(raw)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Invalid --${name}: ${raw}`)
  return parsed
}

function parseOptions(): Options {
  return {
    apply: process.argv.includes('--apply'),
    includeExisting: process.argv.includes('--include-existing'),
    limit: parseNumberArg('limit'),
    delayMs: parseNumberArg('delay-ms') ?? 100,
    onlyOrgNr: process.argv.find(arg => arg.startsWith('--only='))?.slice('--only='.length) ?? null,
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function regnskapsregisteretUrl(orgNr: string): string {
  return `${REGNSKAPSREGISTERET_BASE}/${encodeURIComponent(orgNr)}?regnskapstype=SELSKAP`
}

function normalizeStatements(payload: unknown): RegnskapsregisteretStatement[] {
  if (Array.isArray(payload)) return payload as RegnskapsregisteretStatement[]
  if (payload && typeof payload === 'object') return [payload as RegnskapsregisteretStatement]
  return []
}

async function fetchStatements(orgNr: string): Promise<{
  status: 'ok' | 'not-found' | 'empty' | 'error'
  statements: RegnskapsregisteretStatement[]
  httpStatus: number
  message?: string
}> {
  const response = await fetch(regnskapsregisteretUrl(orgNr), {
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  })

  if (response.status === 404 || response.status === 410) {
    return { status: 'not-found', statements: [], httpStatus: response.status }
  }
  if (!response.ok) {
    let message: string | undefined
    try {
      const payload = await response.json() as { message?: string; error?: string }
      message = payload.message ?? payload.error
    } catch {
      message = await response.text().catch(() => undefined)
    }
    return { status: 'error', statements: [], httpStatus: response.status, message }
  }

  const statements = normalizeStatements(await response.json())
  return {
    status: statements.length > 0 ? 'ok' : 'empty',
    statements,
    httpStatus: response.status,
  }
}

function metadataIsSame(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null)
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function hasSameMissingReasonMarker(
  metadata: unknown,
  reason: FinancialMissingReason,
  source: string,
  note: string,
): boolean {
  const financials = asObject(asObject(metadata).financials)
  return (
    financials.missingReason === reason &&
    financials.missingReasonSource === source &&
    financials.missingReasonNote === note
  )
}

async function markMissingReason(
  company: BackfillCompany,
  reason: FinancialMissingReason,
  source: string,
  checkedAt: string,
  note: string,
  apply: boolean,
): Promise<boolean> {
  if (hasSameMissingReasonMarker(company.metadata, reason, source, note)) return false
  const nextMetadata = buildFinancialMissingMetadata(company.metadata, {
    reason,
    source,
    checkedAt,
    note,
  })
  if (metadataIsSame(company.metadata, nextMetadata)) return false
  if (apply) {
    await prisma.company.update({
      where: { id: company.id },
      data: { metadata: nextMetadata },
    })
  }
  return true
}

async function main() {
  const options = parseOptions()
  const checkedAt = new Date().toISOString()
  const companies = await prisma.company.findMany({
    where: options.onlyOrgNr ? { orgNr: options.onlyOrgNr } : undefined,
    select: {
      id: true,
      name: true,
      orgNr: true,
      country: true,
      legalForm: true,
      isResearchConstruct: true,
      metadata: true,
      _count: { select: { financials: true } },
    },
    orderBy: { name: 'asc' },
  })

  let marked = 0
  let fetched = 0
  let upserted = 0
  let noAccounts = 0
  let skippedExisting = 0
  let errors = 0
  let processedTargets = 0

  console.log(
    `\nBRREG financial backfill${options.apply ? '' : ' (DRY RUN)'}: ${companies.length} companies` +
      `${options.limit == null ? '' : `, limit ${options.limit}`}\n`,
  )

  for (const company of companies) {
    const classification = classifyFinancialBackfillTarget(company)
    const hasFinancials = company._count.financials > 0

    if (classification.action === 'mark') {
      if (!hasFinancials) {
        const changed = await markMissingReason(
          company,
          classification.reason,
          'financial-backfill-brreg classification',
          checkedAt,
          `Classified outside BRREG AS/ASA accounting backfill: ${classification.reason}`,
          options.apply,
        )
        if (changed) marked += 1
        console.log(`  [MARK:${changed ? 'changed' : 'same'}] ${company.orgNr} - ${company.name}: ${classification.reason}`)
      }
      continue
    }

    if (hasFinancials && !options.includeExisting) {
      skippedExisting += 1
      continue
    }
    if (options.limit != null && processedTargets >= options.limit) continue
    processedTargets += 1

    try {
      const result = await fetchStatements(company.orgNr)
      fetched += 1

      if (result.status === 'error') {
        if (result.message?.includes('oppstillingsplan') && result.message.includes('BANK')) {
          const changed = await markMissingReason(
            company,
            'regnskapsregisteret_unsupported_accounts',
            regnskapsregisteretUrl(company.orgNr),
            checkedAt,
            result.message,
            options.apply,
          )
          if (changed) marked += 1
          console.log(`  [UNSUPPORTED:${changed ? 'marked' : 'same'}] ${company.orgNr} - ${company.name}`)
        } else {
          errors += 1
          console.log(`  [ERROR/${result.httpStatus}] ${company.orgNr} - ${company.name}: ${result.message ?? 'unknown error'}`)
        }
        await sleep(options.delayMs)
        continue
      }

      const statement = result.status === 'ok'
        ? selectLatestCompanyStatement(result.statements, company.orgNr)
        : null

      if (!statement) {
        noAccounts += 1
        const changed = await markMissingReason(
          company,
          'regnskapsregisteret_no_accounts',
          regnskapsregisteretUrl(company.orgNr),
          checkedAt,
          result.status === 'not-found'
            ? `Regnskapsregisteret returned ${result.httpStatus}`
            : 'Regnskapsregisteret returned no SELSKAP annual-account row',
          options.apply,
        )
        if (changed) marked += 1
        console.log(`  [NO-ACCOUNTS:${changed ? 'marked' : 'same'}] ${company.orgNr} - ${company.name}`)
        await sleep(options.delayMs)
        continue
      }

      const data = buildFinancialUpsertData(company.id, statement, checkedAt)
      if (options.apply) {
        await prisma.companyFinancial.upsert({
          where: { companyId_year: { companyId: company.id, year: data.year } },
          update: data,
          create: data,
        })
      }
      upserted += 1
      console.log(`  [${options.apply ? 'UPSERT' : 'DRY-RUN'}] ${company.orgNr} - ${company.name}: ${data.year}`)
    } catch (error) {
      errors += 1
      const message = error instanceof Error ? error.message : String(error)
      console.log(`  [ERROR] ${company.orgNr} - ${company.name}: ${message}`)
    }

    await sleep(options.delayMs)
  }

  console.log('\n--- Summary ---')
  console.log(`  Marked missing reasons: ${marked}`)
  console.log(`  Registry fetches:        ${fetched}`)
  console.log(`  Financial rows upserted: ${upserted}`)
  console.log(`  No accounts:            ${noAccounts}`)
  console.log(`  Skipped existing rows:   ${skippedExisting}`)
  console.log(`  Errors:                  ${errors}`)
  if (!options.apply) console.log('  (dry-run - rerun with --apply to write)')

  if (errors > 0) process.exitCode = 1
}

main()
  .catch(error => {
    console.error('Financial backfill failed:', error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
