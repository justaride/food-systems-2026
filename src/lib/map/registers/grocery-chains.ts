import type { StoreType } from '../types'
import { distanceM } from './nearest'

export type GroceryChain = { chainId: string; name: string; storeType: StoreType; aliases: string[] }

/** Traditional grocery concept chains in Norway (Dagligvarefasiten). */
export const NO_GROCERY_CHAINS: GroceryChain[] = [
  { chainId: 'kiwi', name: 'Kiwi', storeType: 'discount', aliases: ['kiwi'] },
  { chainId: 'rema', name: 'Rema 1000', storeType: 'discount', aliases: ['rema 1000', 'rema'] },
  { chainId: 'extra', name: 'Extra', storeType: 'discount', aliases: ['coop extra', 'extra'] },
  { chainId: 'coop-prix', name: 'Coop Prix', storeType: 'discount', aliases: ['coop prix', 'prix'] },
  { chainId: 'bunnpris', name: 'Bunnpris', storeType: 'discount', aliases: ['bunnpris'] },
  { chainId: 'joker', name: 'Joker', storeType: 'convenience', aliases: ['joker'] },
  { chainId: 'spar', name: 'Spar', storeType: 'convenience', aliases: ['spar'] },
  { chainId: 'eurospar', name: 'Eurospar', storeType: 'supermarket', aliases: ['eurospar'] },
  { chainId: 'meny', name: 'Meny', storeType: 'supermarket', aliases: ['meny'] },
  { chainId: 'coop-mega', name: 'Coop Mega', storeType: 'supermarket', aliases: ['coop mega'] },
  { chainId: 'coop-marked', name: 'Coop Marked', storeType: 'convenience', aliases: ['coop marked'] },
  { chainId: 'naerbutikken', name: 'Nærbutikken', storeType: 'convenience', aliases: ['nærbutikken', 'naerbutikken'] },
  { chainId: 'matkroken', name: 'Matkroken', storeType: 'convenience', aliases: ['matkroken'] },
  { chainId: 'obs', name: 'Obs', storeType: 'hypermarket', aliases: ['coop obs', 'obs'] },
]

/** Kiosks and fuel-station shops: service retail, not traditional grocery. */
const SERVICE_RETAIL = ['7-eleven', 'narvesen', 'mix', 'snarkjøp', 'circle k', 'deli de luca', 'esso', 'shell', 'uno-x', 'yx']

export type GroceryClassification =
  | { include: true; chainId: string; chain: string; storeType: StoreType; matchedBy: 'brand' | 'name' }
  | { include: false; reason: 'service-retail' | 'other' }

const normalize = (value: string) => value.normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim()

const ALIASES = NO_GROCERY_CHAINS.flatMap(chain => chain.aliases.map(alias => ({ alias, chain }))).sort(
  (a, b) => b.alias.length - a.alias.length
)

function byPrefix(value: string): GroceryChain | null {
  for (const { alias, chain } of ALIASES) {
    if (value === alias || value.startsWith(`${alias} `)) return chain
  }
  return null
}

/**
 * Map an OSM shop to a grocery chain: the `brand` tag decides when present,
 * otherwise a chain name at the start of `name`. Service-retail brands are
 * excluded even when their name resembles a chain.
 */
export function classifyGroceryElement(tags: Record<string, string>): GroceryClassification {
  const brand = normalize(tags.brand ?? '')
  const name = normalize(tags.name ?? '')

  if (brand) {
    if (SERVICE_RETAIL.includes(brand)) return { include: false, reason: 'service-retail' }
    const chain = NO_GROCERY_CHAINS.find(c => c.aliases.includes(brand))
    return chain
      ? { include: true, chainId: chain.chainId, chain: chain.name, storeType: chain.storeType, matchedBy: 'brand' }
      : { include: false, reason: 'other' }
  }

  if (SERVICE_RETAIL.some(s => name === s || name.startsWith(`${s} `))) return { include: false, reason: 'service-retail' }
  const chain = byPrefix(name)
  return chain
    ? { include: true, chainId: chain.chainId, chain: chain.name, storeType: chain.storeType, matchedBy: 'name' }
    : { include: false, reason: 'other' }
}

/**
 * Two names can describe the same shop when either is blank or just the chain,
 * they match, or one extends the other ("Kiwi Sentrum" / "Kiwi Sentrum Nord").
 * "Joker Plaza" and "Joker Bussterminal" are neighbours, not duplicates.
 */
function compatibleNames(a: { name: string; chain: string }, b: { name: string; chain: string }): boolean {
  const clean = (s: { name: string; chain: string }) => {
    const name = normalize(s.name)
    return name === normalize(s.chain) ? '' : name
  }
  const x = clean(a)
  const y = clean(b)
  return !x || !y || x.startsWith(y) || y.startsWith(x)
}

/** Keep the first of several same-chain points within `maxDistanceM` with compatible names (a shop mapped as both node and building). */
export function dedupeNearby<T extends { chainId: string; name: string; chain: string; location: { lat: number; lng: number } }>(
  items: T[],
  maxDistanceM = 75
): { kept: T[]; removed: T[] } {
  const kept: T[] = []
  const removed: T[] = []
  const cellDeg = 0.01
  const cells = new Map<string, T[]>()
  const key = (lat: number, lng: number) => `${Math.floor(lat / cellDeg)}:${Math.floor(lng / cellDeg)}`

  for (const item of items) {
    const { lat, lng } = item.location
    const row = Math.floor(lat / cellDeg)
    const col = Math.floor(lng / cellDeg)
    let duplicate = false
    for (let dr = -1; dr <= 1 && !duplicate; dr++) {
      for (let dc = -1; dc <= 1 && !duplicate; dc++) {
        for (const other of cells.get(`${row + dr}:${col + dc}`) ?? []) {
          if (
            other.chainId === item.chainId &&
            compatibleNames(other, item) &&
            distanceM(lng, lat, other.location.lng, other.location.lat) <= maxDistanceM
          ) {
            duplicate = true
            break
          }
        }
      }
    }
    if (duplicate) {
      removed.push(item)
      continue
    }
    kept.push(item)
    const cell = cells.get(key(lat, lng))
    if (cell) cell.push(item)
    else cells.set(key(lat, lng), [item])
  }
  return { kept, removed }
}

/**
 * Stores per concept chain per 31 December 2024 (Dagligvarefasiten 2025, NielsenIQ).
 * The PDF text lists Spar and Coop Prix as 255 and 257 without an unambiguous
 * label order, so the pair is reconciled together.
 */
export const DAGLIGVAREFASITEN_2024 = {
  source: 'Dagligvarefasiten 2025 (Dagligvarehandelen/NielsenIQ), antall butikker per konseptkjede per 31.12.2024',
  url: 'https://www.dagligvarehandelen.no/files/2025/08/19/Dagligvarefasiten_2025.pdf',
  total: 3816,
  groups: [
    { label: 'Kiwi', chainIds: ['kiwi'], stores: 711 },
    { label: 'Rema 1000', chainIds: ['rema'], stores: 681 },
    { label: 'Extra', chainIds: ['extra'], stores: 578 },
    { label: 'Joker', chainIds: ['joker'], stores: 445 },
    { label: 'Spar + Coop Prix', chainIds: ['spar', 'coop-prix'], stores: 512 },
    { label: 'Bunnpris', chainIds: ['bunnpris'], stores: 239 },
    { label: 'Meny', chainIds: ['meny'], stores: 186 },
    { label: 'NG øvrige (bl.a. Nærbutikken)', chainIds: ['naerbutikken'], stores: 164, subsetOnly: true },
    { label: 'Coop Marked', chainIds: ['coop-marked'], stores: 94 },
    { label: 'Matkroken', chainIds: ['matkroken'], stores: 77 },
    { label: 'Coop Mega', chainIds: ['coop-mega'], stores: 64 },
    { label: 'Obs', chainIds: ['obs'], stores: 32 },
    { label: 'Eurospar', chainIds: ['eurospar'], stores: 28 },
  ],
}

export const RECONCILIATION_TOLERANCE = { total: 0.1, chain: 0.15, minReferenceStores: 50 }

export type ReconciliationRow = { label: string; reference: number; osm: number; deviation: number; checked: boolean }

export function reconcileChains(
  counts: Record<string, number>,
  reference = DAGLIGVAREFASITEN_2024,
  tolerance = RECONCILIATION_TOLERANCE
): { rows: ReconciliationRow[]; total: ReconciliationRow; failures: string[] } {
  const failures: string[] = []
  const deviation = (osm: number, ref: number) => Math.round(((osm - ref) / ref) * 1000) / 1000

  const rows = reference.groups.map(group => {
    const osm = group.chainIds.reduce((sum, id) => sum + (counts[id] ?? 0), 0)
    const checked = !('subsetOnly' in group && group.subsetOnly) && group.stores >= tolerance.minReferenceStores
    const row = { label: group.label, reference: group.stores, osm, deviation: deviation(osm, group.stores), checked }
    if (checked && Math.abs(row.deviation) > tolerance.chain) {
      failures.push(`${group.label}: ${osm} i OSM mot ${group.stores} (${Math.round(row.deviation * 100)} %)`)
    }
    return row
  })

  const osmTotal = Object.values(counts).reduce((sum, n) => sum + n, 0)
  const total = { label: 'Totalt', reference: reference.total, osm: osmTotal, deviation: deviation(osmTotal, reference.total), checked: true }
  if (Math.abs(total.deviation) > tolerance.total) {
    failures.push(`Totalt: ${osmTotal} i OSM mot ${reference.total} (${Math.round(total.deviation * 100)} %)`)
  }
  return { rows, total, failures }
}
