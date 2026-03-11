'use client'

import { useState, useEffect } from 'react'

export type ParentCompanyData = {
  id: string
  label: string
  value: number
  count: number
  color: string
}

export type ChartMetrics = {
  generated: string
  totalStores: number
  parentCompany: {
    data: ParentCompanyData[]
    parentHHI: number
  }
  lorenzCurve: {
    data: Array<{ popShare: number; storeShare: number }>
    gini: number
  }
  zipf: {
    data: Array<{ logRank: number; logCount: number; name: string; rank: number; storeCount: number }>
    slope: number
    intercept: number
    rSquared: number
    isZipf: boolean
  }
}

let cached: ChartMetrics | null = null

export function useChartMetrics(): { data: ChartMetrics | null; isLoading: boolean } {
  const [data, setData] = useState<ChartMetrics | null>(cached)
  const [isLoading, setIsLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return
    fetch('/data/food-systems/chart-metrics.json')
      .then(r => r.json())
      .then((d: ChartMetrics) => {
        cached = d
        setData(d)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load chart metrics:', err)
        setIsLoading(false)
      })
  }, [])

  return { data, isLoading }
}
