'use client'

import { use } from 'react'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapProvider } from '@/lib/map/MapContext'
import { isValidCountryCode } from '@/lib/config/countries'
import LayerPanel from '@/components/map/LayerPanel'
import FoodDesertPanel from '@/components/map/FoodDesertPanel'
import VulnerabilityPanel from '@/components/map/VulnerabilityPanel'
import DataSourcesPanel from '@/components/map/DataSourcesPanel'
import CountrySelector from '@/components/map/CountrySelector'

const FoodMap = dynamic(() => import('@/components/map/FoodMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-stone-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-stone-500">Laster kart...</p>
      </div>
    </div>
  ),
})

export default function KartCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = use(params)

  if (!isValidCountryCode(country)) {
    redirect('/kart/no')
  }

  return (
    <MapProvider country={country}>
      <div className="w-full h-full relative" style={{ height: 'calc(100vh - 57px)' }}>
        <FoodMap />
        <CountrySelector currentCountry={country} />
        <LayerPanel />
        <FoodDesertPanel />
        <VulnerabilityPanel />
        <DataSourcesPanel />
      </div>
    </MapProvider>
  )
}
