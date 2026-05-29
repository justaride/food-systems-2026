import type { FlowQuantity } from './types'

export function parseVolume(input: string | undefined): FlowQuantity | undefined {
  if (!input) return undefined

  const pct = input.match(/~?\s*(\d+(?:[.,]\d+)?)\s*%/)
  if (pct) return { value: Number(pct[1].replace(',', '.')), unit: '%' }

  const m = input.match(/~?\s*(\d[\d.,]*)\s*([A-Za-zøæåØÆÅ%][A-Za-zøæåØÆÅ%]*(?:\/[A-Za-zøæåØÆÅ]+)?)/)
  if (!m) return undefined

  const value = Number(m[1].replace(/,/g, ''))
  if (!Number.isFinite(value)) return undefined

  return { value, unit: m[2].trim() }
}
