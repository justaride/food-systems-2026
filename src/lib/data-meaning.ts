export type KnownSum = {
  value: number | null
  known: number
  total: number
}

export function sumKnown(values: Array<number | null | undefined>): KnownSum {
  const knownValues = values.filter((value): value is number => value !== null && value !== undefined)
  return {
    value: knownValues.length > 0 ? knownValues.reduce((sum, value) => sum + value, 0) : null,
    known: knownValues.length,
    total: values.length,
  }
}

export type ActorScores = { powerScore: number | null; interestScore: number | null }

export function hasActorScores<T extends ActorScores>(actor: T): actor is T & { powerScore: number; interestScore: number } {
  return actor.powerScore !== null && actor.interestScore !== null
}

export function actorQuadrants(actors: ActorScores[]) {
  const scored = actors.filter(hasActorScores)
  return {
    keyPlayers: scored.filter(actor => actor.powerScore >= 4 && actor.interestScore >= 4).length,
    keepSatisfied: scored.filter(actor => actor.powerScore >= 4 && actor.interestScore < 4).length,
    keepInformed: scored.filter(actor => actor.powerScore < 4 && actor.interestScore >= 4).length,
    monitor: scored.filter(actor => actor.powerScore < 4 && actor.interestScore < 4).length,
    unscored: actors.length - scored.length,
  }
}
