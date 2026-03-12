'use client'

import { useState, useEffect } from 'react'
import type { CountryCode } from '@/lib/config/countries'

export type ParentCompanyData = {
  id: string
  label: string
  value: number
  count: number
  color: string
}

export type ChartMetrics = {
  generated: string
  country?: string
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

const cache = new Map<string, ChartMetrics>()

export function useChartMetrics(country: CountryCode = 'no'): { data: ChartMetrics | null; isLoading: boolean } {
  const [data, setData] = useState<ChartMetrics | null>(cache.get(country) ?? null)
  const [isLoading, setIsLoading] = useState(!cache.has(country))

  useEffect(() => {
    if (cache.has(country)) {
      setData(cache.get(country)!)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    fetch(`/data/food-systems/${country}/chart-metrics.json`)
      .then(r => r.json())
      .then((d: ChartMetrics) => {
        cache.set(country, d)
        setData(d)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load chart metrics:', err)
        setIsLoading(false)
      })
  }, [country])

  return { data, isLoading }
}
