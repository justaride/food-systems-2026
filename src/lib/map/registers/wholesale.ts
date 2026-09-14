import type { GeocodePrecision, GeocodeResult } from './geocode'

export const MIN_EMPLOYEES = 20

/** Food wholesale (46.3) and warehousing (52.1). */
export type WholesaleGroup = 'wholesale' | 'warehousing'

/** Sub-unit fields the selection rule reads. */
export type WholesaleUnit = {
  naceCode: string
  name: string
  employees: number | null
  closed: boolean
}

/** Parent (main entity) fields the selection rule reads. */
export type WholesaleParent = {
  name: string
  naceCode: string
}

export type Selection =
  | { include: true; group: WholesaleGroup; reason: 'food-wholesale' | 'food-parent' | 'food-name' }
  | { include: false; reason: 'closed' | 'too-small' | 'other-nace' | 'tobacco' | 'non-food-warehousing' }

const TOBACCO = '46.35'
const FOOD_PARENT_NACE = ['03.', '10.', '11.', '46.3', '47.1', '47.2', '56.']
// Whole words or word prefixes that name cold, frozen or food storage.
const FOOD_NAME =
  /(?<![\p{L}\p{N}])(frys\p{L}*|kjøl\p{L}*|frigo\p{L}*|cold|sjømat|seafood|fisk\p{L}*|food|mat|kjøtt\p{L}*|meieri\p{L}*|frukt|grønt)(?![\p{L}\p{N}])/iu

export const SELECTION_RULE = {
  minEmployees: MIN_EMPLOYEES,
  naceIncluded: ['46.3', '52.1'],
  naceExcluded: [TOBACCO],
  warehousingFoodParentNace: FOOD_PARENT_NACE,
  warehousingFoodName: FOOD_NAME.source,
}

/**
 * Decide whether a Brreg sub-unit is a food wholesale or warehousing site.
 * Warehousing (52.1) is mostly general third-party logistics, so it counts only
 * when the parent trades or makes food, or a name says cold, frozen or food storage.
 */
export function selectWholesaleUnit(unit: WholesaleUnit, parent: WholesaleParent | null): Selection {
  const isWholesale = unit.naceCode.startsWith('46.3')
  const isWarehousing = unit.naceCode.startsWith('52.1')
  if (!isWholesale && !isWarehousing) return { include: false, reason: 'other-nace' }
  if (unit.closed) return { include: false, reason: 'closed' }
  if ((unit.employees ?? 0) < MIN_EMPLOYEES) return { include: false, reason: 'too-small' }

  if (isWholesale) {
    if (unit.naceCode.startsWith(TOBACCO)) return { include: false, reason: 'tobacco' }
    return { include: true, group: 'wholesale', reason: 'food-wholesale' }
  }

  if (parent && FOOD_PARENT_NACE.some(prefix => parent.naceCode.startsWith(prefix))) {
    return { include: true, group: 'warehousing', reason: 'food-parent' }
  }
  if (FOOD_NAME.test(unit.name) || (parent && FOOD_NAME.test(parent.name))) {
    return { include: true, group: 'warehousing', reason: 'food-name' }
  }
  return { include: false, reason: 'non-food-warehousing' }
}

const PRECISION_RANK: Record<GeocodePrecision, number> = { address: 0, 'place-name': 1, postnummer: 2 }

/**
 * Brreg stores multi-part addresses ("building name\nstreet 12" or "building, street 12")
 * in one field. Geocode each part and keep the most precise hit.
 */
export function geocodeAddressLines(
  address: string,
  postnummer: string,
  geocodeLine: (line: string, postnummer: string) => GeocodeResult | null
): GeocodeResult | null {
  const lines = address.split(/\r?\n|,/).map(line => line.trim()).filter(Boolean)
  let best: GeocodeResult | null = null
  for (const line of lines.length ? lines : ['']) {
    const hit = geocodeLine(line, postnummer)
    if (hit && (!best || PRECISION_RANK[hit.precision] < PRECISION_RANK[best.precision])) best = hit
    if (best?.precision === 'address') break
  }
  return best
}
