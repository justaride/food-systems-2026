import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  AXFOOD_2024_SHAREHOLDER_DECISION,
  BAMA_2024_SHAREHOLDER_DECISION,
  COOP_DANMARK_2024_SHAREHOLDER_DECISION,
  COOP_NORGE_2024_SHAREHOLDER_DECISION,
  HAGAR_2026_SHAREHOLDER_DECISION,
  ICA_GRUPPEN_2024_SHAREHOLDER_DECISION,
  KESKO_2024_SHAREHOLDER_DECISION,
  NORGESGRUPPEN_2024_SHAREHOLDER_DECISION,
  REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION,
  REMA_1000_NORGE_2024_SHAREHOLDER_DECISION,
  REITAN_RETAIL_2024_SHAREHOLDER_DECISION,
  SALLING_GROUP_2024_SHAREHOLDER_DECISION,
  buildShareholderNormalizationPlan,
  buildShareholderSourceCitation,
  buildShareholderUpdateData,
  type ShareholderNormalizationDecision,
} from './lib/shareholder-citation-decisions'
import { buildSourceCitationId, upsertWithCitation } from './lib/import-helpers'

type CliOptions = {
  actionId: string
  apply: boolean
}

const SUPPORTED_DECISIONS: Record<string, ShareholderNormalizationDecision> = {
  [BAMA_2024_SHAREHOLDER_DECISION.actionId]: BAMA_2024_SHAREHOLDER_DECISION,
  [HAGAR_2026_SHAREHOLDER_DECISION.actionId]: HAGAR_2026_SHAREHOLDER_DECISION,
  [NORGESGRUPPEN_2024_SHAREHOLDER_DECISION.actionId]: NORGESGRUPPEN_2024_SHAREHOLDER_DECISION,
  [KESKO_2024_SHAREHOLDER_DECISION.actionId]: KESKO_2024_SHAREHOLDER_DECISION,
  [REITAN_RETAIL_2024_SHAREHOLDER_DECISION.actionId]: REITAN_RETAIL_2024_SHAREHOLDER_DECISION,
  [AXFOOD_2024_SHAREHOLDER_DECISION.actionId]: AXFOOD_2024_SHAREHOLDER_DECISION,
  [COOP_DANMARK_2024_SHAREHOLDER_DECISION.actionId]: COOP_DANMARK_2024_SHAREHOLDER_DECISION,
  [COOP_NORGE_2024_SHAREHOLDER_DECISION.actionId]: COOP_NORGE_2024_SHAREHOLDER_DECISION,
  [ICA_GRUPPEN_2024_SHAREHOLDER_DECISION.actionId]: ICA_GRUPPEN_2024_SHAREHOLDER_DECISION,
  [SALLING_GROUP_2024_SHAREHOLDER_DECISION.actionId]: SALLING_GROUP_2024_SHAREHOLDER_DECISION,
  [REMA_1000_NORGE_2024_SHAREHOLDER_DECISION.actionId]: REMA_1000_NORGE_2024_SHAREHOLDER_DECISION,
  [REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION.actionId]: REMA_1000_DANMARK_2024_SHAREHOLDER_DECISION,
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    actionId: BAMA_2024_SHAREHOLDER_DECISION.actionId,
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

  console.log(`Conditional shareholder citation import: ${options.apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Action: ${decision.actionId}`)

  try {
    const company = await prisma.company.findFirst({
      where: { name: decision.companyName },
      select: {
        id: true,
        name: true,
        shareholders: {
          select: {
            id: true,
            name: true,
            ownershipPct: true,
            shareholderType: true,
            isControlling: true,
            sourceRank: true,
            shareCount: true,
            sourceObservedAt: true,
            sourceUpdatedAt: true,
            sourceBasis: true,
          },
          orderBy: { ownershipPct: 'desc' },
        },
      },
    })

    if (!company) throw new Error(`Company not found: ${decision.companyName}`)

    const plan = buildShareholderNormalizationPlan(
      decision,
      company.shareholders.map(row => ({
        ...row,
        ownershipPct: row.ownershipPct?.toString() ?? null,
      })),
    )

    if (plan.issues.length > 0) {
      for (const issue of plan.issues) console.error(`  BLOCKED ${issue}`)
      process.exitCode = 1
      return
    }

    const contentHash = sha256File(decision.localPath)
    const citation = buildShareholderSourceCitation(decision, contentHash)
    const citationId = buildSourceCitationId(citation)

    console.log(`Citation: ${citationId}`)
    for (const update of plan.updates) {
      console.log(`  ${options.apply ? 'UPDATE' : 'WOULD UPDATE'} ${update.id}: ${update.fromName} -> ${update.toName} (${update.ownershipPct}%)`)

      if (!options.apply) continue

      await upsertWithCitation(
        prisma,
        'Shareholder',
        db => db.shareholder.update({
          where: { id: update.id },
          data: buildShareholderUpdateData(decision, update),
          select: { id: true },
        }),
        citation,
        update.fieldPaths,
      )
    }

    for (const create of plan.creates) {
      console.log(`  ${options.apply ? 'CREATE' : 'WOULD CREATE'} ${create.name} (${create.ownershipPct}%)`)

      if (!options.apply) continue

      await upsertWithCitation(
        prisma,
        'Shareholder',
        db => db.shareholder.create({
          data: {
            companyId: company.id,
            name: create.name,
            ownershipPct: create.ownershipPct,
            shareholderType: create.shareholderType,
            isControlling: create.isControlling ?? false,
            sourceRank: create.sourceRank,
            shareCount: create.shareCount ? BigInt(create.shareCount) : undefined,
            sourceObservedAt: create.sourceObservedAt ? new Date(`${create.sourceObservedAt}T00:00:00.000Z`) : undefined,
            sourceUpdatedAt: create.sourceUpdatedAt ? new Date(`${create.sourceUpdatedAt}T00:00:00.000Z`) : undefined,
            sourceBasis: create.sourceBasis,
            verifiedAt: new Date(`${decision.accessedAt}T00:00:00.000Z`),
            verificationStatus: 'human_verified',
            confidence: decision.confidence,
          },
          select: { id: true },
        }),
        citation,
        create.fieldPaths,
      )
    }

    console.log(`${options.apply ? 'Applied' : 'Dry run'} updates: ${plan.updates.length}, creates: ${plan.creates.length}`)
  } finally {
    await prisma.$disconnect()
  }
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

main().catch(error => {
  console.error('Conditional shareholder citation import failed:', error)
  process.exit(1)
})
