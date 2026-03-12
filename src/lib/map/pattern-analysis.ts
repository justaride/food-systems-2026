import type { Store, Municipality } from './types'
import type { ChainConfig } from '@/lib/config/countries'

export type ZipfAnalysis = {
  data: Array<{ rank: number; storeCount: number; logRank: number; logCount: number; municipalityName: string }>
  slope: number
  intercept: number
  rSquared: number
  isZipf: boolean
}

export function analyzeZipfDistribution(
  municipalities: Record<string, Municipality>
): ZipfAnalysis {
  const muniArray = Object.values(municipalities)
    .filter(m => m.metrics && m.metrics.storeCount > 0)
    .sort((a, b) => (b.metrics?.storeCount || 0) - (a.metrics?.storeCount || 0))

  const data = muniArray.map((m, index) => ({
    rank: index + 1,
    storeCount: m.metrics?.storeCount || 0,
    logRank: Math.log10(index + 1),
    logCount: Math.log10(m.metrics?.storeCount || 1),
    municipalityName: m.name,
  }))

  const { slope, intercept, rSquared } = linearRegression(
    data.map(d => d.logRank),
    data.map(d => d.logCount)
  )

  return {
    data,
    slope,
    intercept,
    rSquared,
    isZipf: rSquared > 0.7 && slope < -0.5 && slope > -1.5,
  }
}

export type ConcentrationAnalysis = {
  national: {
    byChain: Array<{ chain: string; count: number; share: number }>
    byParent: Array<{ parent: string; count: number; share: number }>
    chainHHI: number
    parentHHI: number
    top3Share: number
  }
  giniCoefficient: number
  lorenzCurve: Array<{ cumulativePopShare: number; cumulativeStoreShare: number }>
}

export function calculateGiniCoefficient(stores: Store[]): number {
  if (stores.length === 0) return 0

  const chainCounts = new Map<string, number>()
  for (const store of stores) {
    chainCounts.set(store.chain, (chainCounts.get(store.chain) || 0) + 1)
  }

  const counts = Array.from(chainCounts.values()).sort((a, b) => a - b)
  const n = counts.length
  const total = counts.reduce((sum, c) => sum + c, 0)

  let sumOfDifferences = 0
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfDifferences += Math.abs(counts[i] - counts[j])
    }
  }

  return sumOfDifferences / (2 * n * total)
}

export function calculateLorenzCurve(
  municipalities: Record<string, Municipality>
): Array<{ cumulativePopShare: number; cumulativeStoreShare: number }> {
  const muniArray = Object.values(municipalities)
    .filter(m => m.population > 0)
    .sort((a, b) => {
      const densityA = (a.metrics?.storeCount || 0) / a.population
      const densityB = (b.metrics?.storeCount || 0) / b.population
      return densityA - densityB
    })

  const totalPop = muniArray.reduce((sum, m) => sum + m.population, 0)
  const totalStores = muniArray.reduce((sum, m) => sum + (m.metrics?.storeCount || 0), 0)

  let cumulativePop = 0
  let cumulativeStores = 0

  const curve = [{ cumulativePopShare: 0, cumulativeStoreShare: 0 }]

  for (const m of muniArray) {
    cumulativePop += m.population
    cumulativeStores += m.metrics?.storeCount || 0
    curve.push({
      cumulativePopShare: cumulativePop / totalPop,
      cumulativeStoreShare: cumulativeStores / totalStores,
    })
  }

  return curve
}

export function analyzeConcentration(
  stores: Store[],
  municipalities: Record<string, Municipality>,
  chainConfigs: Record<string, ChainConfig> = {}
): ConcentrationAnalysis {
  const chainCounts = new Map<string, number>()
  for (const store of stores) {
    chainCounts.set(store.chain, (chainCounts.get(store.chain) || 0) + 1)
  }

  const byChain = Array.from(chainCounts.entries())
    .map(([chain, count]) => ({
      chain,
      count,
      share: (count / stores.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  const parentCounts = new Map<string, number>()
  for (const store of stores) {
    const config = chainConfigs[store.chainId]
    const parent = config?.parent || 'Unknown'
    parentCounts.set(parent, (parentCounts.get(parent) || 0) + 1)
  }

  const byParent = Array.from(parentCounts.entries())
    .map(([parent, count]) => ({
      parent,
      count,
      share: (count / stores.length) * 100,
    }))
    .sort((a, b) => b.count - a.count)

  const chainHHI = byChain.reduce((sum, c) => sum + c.share * c.share, 0)
  const parentHHI = byParent.reduce((sum, p) => sum + p.share * p.share, 0)
  const top3Share = byParent.slice(0, 3).reduce((sum, p) => sum + p.share, 0)

  return {
    national: {
      byChain,
      byParent,
      chainHHI: Math.round(chainHHI),
      parentHHI: Math.round(parentHHI),
      top3Share: Math.round(top3Share * 10) / 10,
    },
    giniCoefficient: calculateGiniCoefficient(stores),
    lorenzCurve: calculateLorenzCurve(municipalities),
  }
}

export type CorrelationResult = {
  variable: string
  correlation: number
  pValue: number
  significant: boolean
  n: number
}

export function pearsonCorrelation(x: number[], y: number[]): { r: number; n: number } {
  const n = Math.min(x.length, y.length)
  if (n < 3) return { r: 0, n }

  const meanX = x.reduce((a, b) => a + b, 0) / n
  const meanY = y.reduce((a, b) => a + b, 0) / n

  let numerator = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    numerator += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denominator = Math.sqrt(denomX * denomY)
  if (denominator === 0) return { r: 0, n }

  return { r: numerator / denominator, n }
}

function normalCDF(z: number): number {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911
  const sign = z < 0 ? -1 : 1
  const absZ = Math.abs(z) / Math.sqrt(2)
  const t = 1.0 / (1.0 + p * absZ)
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ)
  return 0.5 * (1.0 + sign * y)
}

function correlationPValue(r: number, n: number): number {
  if (n < 3) return 1
  const t = r * Math.sqrt((n - 2) / (1 - r * r))
  return 2 * (1 - normalCDF(Math.abs(t)))
}

export function linearRegression(x: number[], y: number[]): { slope: number; intercept: number; rSquared: number } {
  const n = x.length
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0 }

  const sumX = x.reduce((a, b) => a + b, 0)
  const sumY = y.reduce((a, b) => a + b, 0)
  const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0)
  const sumXX = x.reduce((total, xi) => total + xi * xi, 0)
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  const meanY = sumY / n
  const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0)
  const ssRes = y.reduce((sum, yi, i) => sum + Math.pow(yi - (slope * x[i] + intercept), 2), 0)
  const rSquared = ssTot > 0 ? 1 - ssRes / ssTot : 0

  return { slope, intercept, rSquared }
}
