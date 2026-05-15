'use client'

import dynamic from 'next/dynamic'

export const NoMarketShareTimeseriesDynamic = dynamic(
  () => import('@/components/charts/NoMarketShareTimeseries').then(mod => mod.NoMarketShareTimeseries),
  {
    ssr: false,
    loading: () => <div className="h-[260px]" aria-hidden="true" />,
  }
)
