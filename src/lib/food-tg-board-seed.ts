import { createHash } from 'node:crypto'
import {
  foodTgClaimBoard,
  foodTgMandateSummary,
  foodTgOpportunityRadar,
  type FoodTgClaimCard,
  type FoodTgOpportunity,
} from '@/lib/data/food-tg-mandate'

export const FOOD_TG_BOARD_SOURCE_PATH = 'src/lib/data/food-tg-mandate.ts'

export type ClaimBoardSeedRow = FoodTgClaimCard & {
  sourcePath: string
  sourceUpdatedAt: Date
  contentHash: string
}

export type OpportunitySeedRow = FoodTgOpportunity & {
  id: string
  sourcePath: string
  sourceUpdatedAt: Date
  contentHash: string
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`).join(',')}}`
  }
  return JSON.stringify(value)
}

function contentHash(value: unknown) {
  return createHash('sha256').update(stableSerialize(value)).digest('hex')
}

function sourceUpdatedAt() {
  return new Date(`${foodTgMandateSummary.date}T00:00:00.000Z`)
}

export function claimBoardSeedRows(): ClaimBoardSeedRow[] {
  return foodTgClaimBoard.map((entry) => ({
    ...entry,
    sourcePath: FOOD_TG_BOARD_SOURCE_PATH,
    sourceUpdatedAt: sourceUpdatedAt(),
    contentHash: contentHash({ entryType: 'claim', ...entry }),
  }))
}

export function opportunitySeedRows(): OpportunitySeedRow[] {
  return foodTgOpportunityRadar.map((entry) => ({
    ...entry,
    id: `opportunity-${String(entry.rank).padStart(2, '0')}`,
    sourcePath: FOOD_TG_BOARD_SOURCE_PATH,
    sourceUpdatedAt: sourceUpdatedAt(),
    contentHash: contentHash({ entryType: 'opportunity', ...entry }),
  }))
}
