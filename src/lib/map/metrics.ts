import type { Store, Municipality, MunicipalityMetrics } from './types'

export function calculateHHI(stores: Store[]): number {
  if (stores.length === 0) return 0

  const chainCounts: Record<string, number> = {}
  for (const store of stores) {
    chainCounts[store.chain] = (chainCounts[store.chain] || 0) + 1
  }

  const total = stores.length
  let hhi = 0
  for (const count of Object.values(chainCounts)) {
    const share = (count / total) * 100
    hhi += share * share
  }

  return Math.round(hhi)
}

export function calculateStoresPerCapita(storeCount: number, population: number): number {
  if (population === 0) return 0
  return Math.round((storeCount / population) * 1000 * 100) / 100
}

export function getDominantChain(stores: Store[]): { chain: string | null; share: number } {
  if (stores.length === 0) return { chain: null, share: 0 }

  const chainCounts: Record<string, number> = {}
  for (const store of stores) {
    chainCounts[store.chain] = (chainCounts[store.chain] || 0) + 1
  }

  let maxChain = ''
  let maxCount = 0
  for (const [chain, count] of Object.entries(chainCounts)) {
    if (count > maxCount) {
      maxChain = chain
      maxCount = count
    }
  }

  return {
    chain: maxChain,
    share: Math.round((maxCount / stores.length) * 100),
  }
}

export function calculateMunicipalityMetrics(
  municipality: Municipality,
  stores: Store[]
): MunicipalityMetrics {
  const { chain, share } = getDominantChain(stores)

  return {
    storeCount: stores.length,
    storesPerCapita: calculateStoresPerCapita(stores.length, municipality.population),
    hhi: calculateHHI(stores),
    dominantChain: chain,
    dominantChainShare: share,
  }
}

export function getConcentrationLevel(hhi: number): 'competitive' | 'moderate' | 'concentrated' {
  if (hhi < 1500) return 'competitive'
  if (hhi < 2500) return 'moderate'
  return 'concentrated'
}

export function getDensityColor(storesPerCapita: number): string {
  if (storesPerCapita < 0.3) return '#EF4444'
  if (storesPerCapita < 0.5) return '#F97316'
  if (storesPerCapita < 0.7) return '#FBBF24'
  if (storesPerCapita < 1.0) return '#84CC16'
  return '#22C55E'
}

export function getConcentrationColor(hhi: number): string {
  if (hhi < 1500) return '#3B82F6'
  if (hhi < 2500) return '#8B5CF6'
  if (hhi < 4000) return '#EC4899'
  return '#DC2626'
}

export type NationalMetrics = {
  storesPerCapita: number
  avgHHI: number
  storesPerKm2: number
  totalStores: number
  totalPopulation: number
}

export function calculateNationalMetrics(
  stores: Store[],
  municipalities: Record<string, Municipality>
): NationalMetrics {
  const muniArray = Object.values(municipalities)
  const totalPopulation = muniArray.reduce((sum, m) => sum + (m.population || 0), 0)
  const totalArea = muniArray.reduce((sum, m) => sum + (m.area || 0), 0)

  return {
    storesPerCapita: calculateStoresPerCapita(stores.length, totalPopulation),
    avgHHI: calculateHHI(stores),
    storesPerKm2: totalArea > 0 ? Math.round((stores.length / totalArea) * 100) / 100 : 0,
    totalStores: stores.length,
    totalPopulation,
  }
}
