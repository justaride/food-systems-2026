export const AQUACULTURE_TONNAGE_UNITS = ['TN', 'MTB', 'TONN', 'T'] as const

export function normalizeAquacultureCapacityUnit(unit: string | null | undefined) {
  return (unit ?? 'TN').trim().toUpperCase()
}

export function isAquacultureTonnageUnit(unit: string | null | undefined) {
  return AQUACULTURE_TONNAGE_UNITS.includes(
    normalizeAquacultureCapacityUnit(unit) as (typeof AQUACULTURE_TONNAGE_UNITS)[number],
  )
}

function formatNoInteger(value: number) {
  return Math.round(value).toLocaleString('no').replace(/\u00a0/g, ' ')
}

export function formatAquacultureCapacity(value: number | null, unit: string | null | undefined) {
  if (value == null || value === 0) return '—'

  const normalizedUnit = normalizeAquacultureCapacityUnit(unit)
  if (isAquacultureTonnageUnit(normalizedUnit)) {
    return `${formatNoInteger(value)} tonn`
  }
  if (normalizedUnit === 'STK') {
    return `${formatNoInteger(value)} stk`
  }
  return `${formatNoInteger(value)} ${normalizedUnit.toLowerCase()}`
}
