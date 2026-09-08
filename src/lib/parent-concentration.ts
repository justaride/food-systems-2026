// Unknown is a coverage gap, never an economic owner. Counts, not rounded
// display percentages, are the basis for both HHI and CR3.
export function parentConcentration(groups: readonly { parent: string; count: number }[]) {
  const total = groups.reduce((sum, g) => sum + g.count, 0)
  const unknown = groups.filter(g => !g.parent.trim() || ['unknown', 'ukjent'].includes(g.parent.toLowerCase()))
    .reduce((sum, g) => sum + g.count, 0)
  const knownSharePct = total > 0 ? (total - unknown) / total * 100 : 0
  if (total === 0 || unknown > 0) return { hhi: null, cr3: null, knownSharePct }
  const shares = groups.map(g => g.count / total * 100).sort((a, b) => b - a)
  return {
    hhi: Math.round(shares.reduce((sum, share) => sum + share ** 2, 0)),
    cr3: Math.round(shares.slice(0, 3).reduce((sum, share) => sum + share, 0) * 10) / 10,
    knownSharePct,
  }
}
