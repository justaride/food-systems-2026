import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  claimBoardSeedRows,
  opportunitySeedRows,
  type ClaimBoardSeedRow,
  type OpportunitySeedRow,
} from '../src/lib/food-tg-board-seed'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function claimSnapshot(row: ClaimBoardSeedRow) {
  const { contentHash: _contentHash, ...snapshot } = row
  return {
    ...snapshot,
    sourceUpdatedAt: row.sourceUpdatedAt.toISOString(),
  }
}

function opportunitySnapshot(row: OpportunitySeedRow) {
  const { contentHash: _contentHash, ...snapshot } = row
  return {
    ...snapshot,
    sourceUpdatedAt: row.sourceUpdatedAt.toISOString(),
  }
}

async function importClaim(row: ClaimBoardSeedRow) {
  await prisma.claimBoardEntry.upsert({
    where: { id: row.id },
    update: {
      claimId: row.claimId,
      track: row.track,
      title: row.title,
      strength: row.strength,
      status: row.status,
      nextAction: row.nextAction,
      useNow: row.useNow,
      needs: row.needs,
      sourcePath: row.sourcePath,
      sourceUpdatedAt: row.sourceUpdatedAt,
    },
    create: {
      id: row.id,
      claimId: row.claimId,
      track: row.track,
      title: row.title,
      strength: row.strength,
      status: row.status,
      nextAction: row.nextAction,
      useNow: row.useNow,
      needs: row.needs,
      sourcePath: row.sourcePath,
      sourceUpdatedAt: row.sourceUpdatedAt,
    },
  })

  await prisma.foodTgBoardLedger.upsert({
    where: {
      entryType_entryId_contentHash: {
        entryType: 'claim',
        entryId: row.id,
        contentHash: row.contentHash,
      },
    },
    update: {
      sourcePath: row.sourcePath,
      snapshot: claimSnapshot(row),
    },
    create: {
      entryType: 'claim',
      entryId: row.id,
      contentHash: row.contentHash,
      snapshot: claimSnapshot(row),
      sourcePath: row.sourcePath,
    },
  })
}

async function importOpportunity(row: OpportunitySeedRow) {
  await prisma.opportunityEntry.upsert({
    where: { id: row.id },
    update: {
      rank: row.rank,
      title: row.title,
      track: row.track,
      role: row.role,
      statuses: row.statuses,
      whyNow: row.whyNow,
      canSay: row.canSay,
      cannotSay: row.cannotSay,
      validationNeed: row.validationNeed,
      stopSignal: row.stopSignal,
      nextAction: row.nextAction,
      claimIds: row.claimIds,
      evidenceIds: row.evidenceIds,
      sourceIds: row.sourceIds,
      sourcePath: row.sourcePath,
      sourceUpdatedAt: row.sourceUpdatedAt,
    },
    create: {
      id: row.id,
      rank: row.rank,
      title: row.title,
      track: row.track,
      role: row.role,
      statuses: row.statuses,
      whyNow: row.whyNow,
      canSay: row.canSay,
      cannotSay: row.cannotSay,
      validationNeed: row.validationNeed,
      stopSignal: row.stopSignal,
      nextAction: row.nextAction,
      claimIds: row.claimIds,
      evidenceIds: row.evidenceIds,
      sourceIds: row.sourceIds,
      sourcePath: row.sourcePath,
      sourceUpdatedAt: row.sourceUpdatedAt,
    },
  })

  await prisma.foodTgBoardLedger.upsert({
    where: {
      entryType_entryId_contentHash: {
        entryType: 'opportunity',
        entryId: row.id,
        contentHash: row.contentHash,
      },
    },
    update: {
      sourcePath: row.sourcePath,
      snapshot: opportunitySnapshot(row),
    },
    create: {
      entryType: 'opportunity',
      entryId: row.id,
      contentHash: row.contentHash,
      snapshot: opportunitySnapshot(row),
      sourcePath: row.sourcePath,
    },
  })
}

async function main() {
  const claims = claimBoardSeedRows()
  const opportunities = opportunitySeedRows()

  for (const claim of claims) {
    await importClaim(claim)
  }

  for (const opportunity of opportunities) {
    await importOpportunity(opportunity)
  }

  console.log(`Imported ${claims.length} claim-board rows and ${opportunities.length} opportunity rows`)
}

main()
  .catch((error) => {
    console.error('Food TG board import failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
