import type { Resolution } from './brreg-match'

export type PublishDecision =
  | { publish: 'point' }
  | { publish: 'kommune-count'; reason: 'sole-proprietorship' | 'unresolved' }

/**
 * The repo is public, so a register row becomes a named map point only when it
 * belongs to an organisation that is not a sole proprietorship (ENK). Everything
 * else is published only as a count per kommune.
 */
export function publishDecision(resolution: Resolution): PublishDecision {
  if (resolution.status !== 'resolved') return { publish: 'kommune-count', reason: 'unresolved' }
  if (resolution.orgForm === 'ENK') return { publish: 'kommune-count', reason: 'sole-proprietorship' }
  return { publish: 'point' }
}

export function countByKommune(kommunenumre: Iterable<string>): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const kommunenummer of kommunenumre) {
    counts[kommunenummer] = (counts[kommunenummer] ?? 0) + 1
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)))
}
