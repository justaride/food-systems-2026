import { prisma } from '@/lib/db'
import {
  type FoodTgClaimCard,
  type FoodTgClaimStrength,
  type FoodTgOpportunity,
  type FoodTgTrack,
  type FoodTgValidationStatus,
} from '@/lib/data/food-tg-mandate'
import { isMissingPrismaTable, isPrismaDataUnavailable } from '@/lib/queries/prisma-errors'
import { FOOD_TG_BOARD_SOURCE_PATH, claimBoardSeedRows, opportunitySeedRows } from '@/lib/food-tg-board-seed'

export type FoodTgBoardSource = 'db' | 'static-fallback'

export type FoodTgClaimBoardView = FoodTgClaimCard & {
  updatedAt: string
  sourcePath: string
  dataSource: FoodTgBoardSource
}

export type FoodTgOpportunityView = FoodTgOpportunity & {
  id: string
  updatedAt: string
  sourcePath: string
  dataSource: FoodTgBoardSource
}

export type FoodTgBoardView = {
  source: FoodTgBoardSource
  sourcePath: string
  claimBoard: FoodTgClaimBoardView[]
  opportunityRadar: FoodTgOpportunityView[]
}

function staticFallbackBoard(): FoodTgBoardView {
  return {
    source: 'static-fallback',
    sourcePath: FOOD_TG_BOARD_SOURCE_PATH,
    claimBoard: claimBoardSeedRows().map((row) => ({
      id: row.id,
      claimId: row.claimId,
      track: row.track,
      title: row.title,
      strength: row.strength,
      status: row.status,
      nextAction: row.nextAction,
      useNow: row.useNow,
      needs: row.needs,
      updatedAt: row.sourceUpdatedAt.toISOString(),
      sourcePath: row.sourcePath,
      dataSource: 'static-fallback',
    })),
    opportunityRadar: opportunitySeedRows().map((row) => ({
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
      updatedAt: row.sourceUpdatedAt.toISOString(),
      sourcePath: row.sourcePath,
      dataSource: 'static-fallback',
    })),
  }
}

export async function getFoodTgBoard(): Promise<FoodTgBoardView> {
  try {
    const [claimRows, opportunityRows] = await Promise.all([
      prisma.claimBoardEntry.findMany({
        orderBy: [{ track: 'asc' }, { claimId: 'asc' }],
      }),
      prisma.opportunityEntry.findMany({
        orderBy: { rank: 'asc' },
      }),
    ])

    if (claimRows.length === 0 || opportunityRows.length === 0) {
      return staticFallbackBoard()
    }

    return {
      source: 'db',
      sourcePath: claimRows[0]?.sourcePath ?? opportunityRows[0]?.sourcePath ?? FOOD_TG_BOARD_SOURCE_PATH,
      claimBoard: claimRows.map((row) => ({
        id: row.id,
        claimId: row.claimId,
        track: row.track as FoodTgTrack,
        title: row.title,
        strength: row.strength as FoodTgClaimStrength,
        status: row.status as FoodTgValidationStatus,
        nextAction: row.nextAction,
        useNow: row.useNow,
        needs: row.needs,
        updatedAt: row.updatedAt.toISOString(),
        sourcePath: row.sourcePath,
        dataSource: 'db',
      })),
      opportunityRadar: opportunityRows.map((row) => ({
        id: row.id,
        rank: row.rank,
        title: row.title,
        track: row.track as FoodTgTrack,
        role: row.role,
        statuses: row.statuses as FoodTgValidationStatus[],
        whyNow: row.whyNow,
        canSay: row.canSay,
        cannotSay: row.cannotSay,
        validationNeed: row.validationNeed,
        stopSignal: row.stopSignal,
        nextAction: row.nextAction,
        claimIds: row.claimIds,
        evidenceIds: row.evidenceIds,
        sourceIds: row.sourceIds,
        updatedAt: row.updatedAt.toISOString(),
        sourcePath: row.sourcePath,
        dataSource: 'db',
      })),
    }
  } catch (error) {
    if (
      isMissingPrismaTable(error, 'ClaimBoardEntry') ||
      isMissingPrismaTable(error, 'OpportunityEntry') ||
      isPrismaDataUnavailable(error)
    ) {
      return staticFallbackBoard()
    }
    throw error
  }
}
