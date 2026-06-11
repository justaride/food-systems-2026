import type { Metadata } from 'next'
import { MandatContent } from './MandatContent'
import { getFoodTgBoard } from '@/lib/queries/food-tg-board'

export const metadata: Metadata = {
  title: 'Mandat og validering - Food Systems 2026',
  description: 'Food TG scope, opportunity radar, claim-status og valideringssprint.',
}

export default async function MandatPage() {
  const board = await getFoodTgBoard()

  return (
    <MandatContent
      claimBoard={board.claimBoard}
      opportunityRadar={board.opportunityRadar}
      boardSource={board.source}
      boardSourcePath={board.sourcePath}
    />
  )
}
