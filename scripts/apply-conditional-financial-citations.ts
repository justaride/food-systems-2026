import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  ASKO_NORGE_2024_FINANCIAL_DECISION,
  AXFOOD_2024_FINANCIAL_DECISION,
  COOP_DANMARK_2024_FINANCIAL_DECISION,
  COOP_NORGE_2024_FINANCIAL_DECISION,
  HAGAR_HISTORICAL_FINANCIAL_DECISIONS,
  HAGAR_2024_FINANCIAL_DECISION,
  ICA_GRUPPEN_2024_FINANCIAL_DECISION,
  KESKO_2024_FINANCIAL_DECISION,
  NORGESGRUPPEN_2024_FINANCIAL_DECISION,
  REITAN_RETAIL_2024_FINANCIAL_DECISION,
  SALLING_GROUP_2024_FINANCIAL_DECISION,
  buildFinancialExactValuePlan,
  buildFinancialSourceCitation,
  type FinancialExactValueDecision,
} from './lib/financial-citation-decisions'
import { buildSourceCitationId, upsertWithCitation } from './lib/import-helpers'

type CliOptions = {
  actionId: string
  apply: boolean
}

const SUPPORTED_DECISIONS: Record<string, FinancialExactValueDecision> = {
  [ASKO_NORGE_2024_FINANCIAL_DECISION.actionId]: ASKO_NORGE_2024_FINANCIAL_DECISION,
  [HAGAR_2024_FINANCIAL_DECISION.actionId]: HAGAR_2024_FINANCIAL_DECISION,
  ...Object.fromEntries(HAGAR_HISTORICAL_FINANCIAL_DECISIONS.map(decision => [decision.actionId, decision])),
  [NORGESGRUPPEN_2024_FINANCIAL_DECISION.actionId]: NORGESGRUPPEN_2024_FINANCIAL_DECISION,
  [AXFOOD_2024_FINANCIAL_DECISION.actionId]: AXFOOD_2024_FINANCIAL_DECISION,
  [ICA_GRUPPEN_2024_FINANCIAL_DECISION.actionId]: ICA_GRUPPEN_2024_FINANCIAL_DECISION,
  [KESKO_2024_FINANCIAL_DECISION.actionId]: KESKO_2024_FINANCIAL_DECISION,
  [SALLING_GROUP_2024_FINANCIAL_DECISION.actionId]: SALLING_GROUP_2024_FINANCIAL_DECISION,
  [COOP_DANMARK_2024_FINANCIAL_DECISION.actionId]: COOP_DANMARK_2024_FINANCIAL_DECISION,
  [REITAN_RETAIL_2024_FINANCIAL_DECISION.actionId]: REITAN_RETAIL_2024_FINANCIAL_DECISION,
  [COOP_NORGE_2024_FINANCIAL_DECISION.actionId]: COOP_NORGE_2024_FINANCIAL_DECISION,
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    actionId: NORGESGRUPPEN_2024_FINANCIAL_DECISION.actionId,
    apply: false,
  }

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true
      continue
    }
    if (arg === '--dry-run') {
      options.apply = false
      continue
    }
    if (arg.startsWith('--action=')) {
      options.actionId = arg.slice('--action='.length)
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  if (!SUPPORTED_DECISIONS[options.actionId]) {
    throw new Error(`Unsupported action: ${options.actionId}`)
  }

  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const decision = SUPPORTED_DECISIONS[options.actionId]
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

  console.log(`Conditional financial citation import: ${options.apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Action: ${decision.actionId}`)

  try {
    const current = await prisma.companyFinancial.findFirst({
      where: {
        year: decision.year,
        company: { name: decision.companyName },
      },
      select: {
        id: true,
        year: true,
        revenueNok: true,
        operatingResult: true,
        ebitda: true,
        fiscalYearLabel: true,
        fiscalPeriodStart: true,
        fiscalPeriodEnd: true,
        reportingCurrency: true,
        fxRateNokPerUnit: true,
        fxRateSource: true,
      },
    })

    const plan = buildFinancialExactValuePlan(decision, current
      ? {
          id: current.id,
          year: current.year,
          revenueNok: current.revenueNok?.toString() ?? null,
          operatingResult: current.operatingResult?.toString() ?? null,
          ebitda: current.ebitda?.toString() ?? null,
          fiscalYearLabel: current.fiscalYearLabel,
          fiscalPeriodStart: current.fiscalPeriodStart,
          fiscalPeriodEnd: current.fiscalPeriodEnd,
          reportingCurrency: current.reportingCurrency,
          fxRateNokPerUnit: current.fxRateNokPerUnit?.toString() ?? null,
          fxRateSource: current.fxRateSource,
        }
      : null)

    if (plan.issues.length > 0 || !plan.update) {
      for (const issue of plan.issues) console.error(`  BLOCKED ${issue}`)
      process.exitCode = 1
      return
    }

    const contentHash = sha256File(decision.localPath)
    const citation = buildFinancialSourceCitation(decision, contentHash)
    const citationId = buildSourceCitationId(citation)

    console.log(`Citation: ${citationId}`)
    console.log(`  ${options.apply ? 'UPDATE' : 'WOULD UPDATE'} ${plan.update.id}: revenueNok ${decision.expectedCurrent.revenueNok} -> ${plan.update.revenueNok}; operatingResult ${decision.expectedCurrent.operatingResult} -> ${plan.update.operatingResult}`)

    if (options.apply) {
      await upsertWithCitation(
        prisma,
        'CompanyFinancial',
        db => db.companyFinancial.update({
          where: { id: plan.update!.id },
          data: {
            revenueNok: plan.update!.revenueNok,
            operatingResult: plan.update!.operatingResult,
            ebitda: plan.update!.ebitda,
            fiscalYearLabel: plan.update!.fiscalYearLabel,
            fiscalPeriodStart: plan.update!.fiscalPeriodStart ? new Date(`${plan.update!.fiscalPeriodStart}T00:00:00.000Z`) : undefined,
            fiscalPeriodEnd: plan.update!.fiscalPeriodEnd ? new Date(`${plan.update!.fiscalPeriodEnd}T00:00:00.000Z`) : undefined,
            reportingCurrency: plan.update!.reportingCurrency,
            fxRateNokPerUnit: plan.update!.fxRateNokPerUnit,
            fxRateSource: plan.update!.fxRateSource,
            source: decision.companyName === 'Hagar hf'
              ? decision.localPath
              : undefined,
            verifiedAt: new Date(`${decision.accessedAt}T00:00:00.000Z`),
            verificationStatus: 'human_verified',
          },
          select: { id: true },
        }),
        citation,
        plan.update.fieldPaths,
      )
    }

    console.log(`${options.apply ? 'Applied' : 'Dry run'} updates: 1`)
  } finally {
    await prisma.$disconnect()
  }
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

main().catch(error => {
  console.error('Conditional financial citation import failed:', error)
  process.exit(1)
})
