import type { ValueChainSlot } from '../data/r-ladder'
import type { LoopFlows } from './types'

export type VerdikjedeStage = 'raastoff' | 'bearbeidet' | 'ukjent'
export type VerdikjedePosition = 'oppstroem' | 'avfallsside' | 'ukjent'
export type VerdikjedeAxis = { stage: VerdikjedeStage; position: VerdikjedePosition }

const RAW_SLOTS: readonly ValueChainSlot[] = ['primary', 'seafood']

/**
 * Avledet (heuristisk) verdikjede-posisjon per strøm — ikke målt grunnsannhet.
 * stage: råstoff (primary/seafood) vs. bearbeidet (øvrige) vs. ukjent.
 * position: avfallsside (rører `waste`) vs. oppstrøm vs. ukjent (begge mangler slot).
 */
export function deriveVerdikjedeAxis(
  fromSlot?: ValueChainSlot,
  toSlot?: ValueChainSlot,
): VerdikjedeAxis {
  const stage: VerdikjedeStage =
    fromSlot === undefined ? 'ukjent' : RAW_SLOTS.includes(fromSlot) ? 'raastoff' : 'bearbeidet'

  const position: VerdikjedePosition =
    fromSlot === 'waste' || toSlot === 'waste'
      ? 'avfallsside'
      : fromSlot === undefined && toSlot === undefined
        ? 'ukjent'
        : 'oppstroem'

  return { stage, position }
}

export type VerdikjedeSummary = {
  total: number
  raastoff: number
  bearbeidet: number
  oppstroem: number
  avfallsside: number
}

export function summarizeVerdikjede(loops: LoopFlows[]): VerdikjedeSummary {
  const summary: VerdikjedeSummary = {
    total: 0,
    raastoff: 0,
    bearbeidet: 0,
    oppstroem: 0,
    avfallsside: 0,
  }

  for (const loop of loops) {
    const slotById = new Map(loop.nodes.map((n) => [n.id, n.valueChainStep]))
    for (const edge of loop.edges) {
      const { stage, position } = deriveVerdikjedeAxis(slotById.get(edge.fromId), slotById.get(edge.toId))
      summary.total += 1
      if (stage === 'raastoff') summary.raastoff += 1
      if (stage === 'bearbeidet') summary.bearbeidet += 1
      if (position === 'oppstroem') summary.oppstroem += 1
      if (position === 'avfallsside') summary.avfallsside += 1
    }
  }

  return summary
}
