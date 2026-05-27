'use client'

import { use } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import dynamic from 'next/dynamic'
import { MapProvider, useMapContext } from '@/lib/map/MapContext'
import { isValidCountryCode, type CountryCode } from '@/lib/config/countries'
import LayerPanel from '@/components/map/LayerPanel'
import FoodDesertPanel from '@/components/map/FoodDesertPanel'
import VulnerabilityPanel from '@/components/map/VulnerabilityPanel'
import DataSourcesPanel from '@/components/map/DataSourcesPanel'
import CountrySelector from '@/components/map/CountrySelector'

const COUNTRY_NAMES: Record<CountryCode, string> = {
  no: 'Norge',
  se: 'Sverige',
  dk: 'Danmark',
  fi: 'Finland',
  is: 'Island',
}

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

function MapErrorOverlay() {
  const { error, country } = useMapContext()
  if (!error) return null

  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-stone-50/90">
      <div className="max-w-sm mx-auto text-center p-8">
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-stone-800 mb-2">Kartdata ikke tilgjengelig</h3>
        <p className="text-sm text-stone-500">
          Data for {COUNTRY_NAMES[country] ?? country} er ikke tilgjengelig enn&aring;. Vi jobber med &aring; legge til st&oslash;tte for flere land.
        </p>
      </div>
    </div>
  )
}

function FlowPrototypeLink() {
  const { country } = useMapContext()

  return (
    <Link
      href={`/kart/${country}/flow`}
      className="absolute top-4 right-4 z-[1000] inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs font-medium text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
      title="Åpne den separate flow-prototypen"
    >
      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
      Flow prototype
    </Link>
  )
}

export default function KartCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = use(params)

  if (!isValidCountryCode(country)) {
    redirect('/kart/no')
  }

  return (
    <MapProvider country={country}>
      <div className="w-full h-full relative" style={{ height: 'calc(100vh - 57px)' }}>
        <h1 className="sr-only">Matkart for {COUNTRY_NAMES[country] ?? country}</h1>
        <FoodMap />
        <MapErrorOverlay />
        <FlowPrototypeLink />
        <CountrySelector currentCountry={country} />
        <LayerPanel />
        <FoodDesertPanel />
        <VulnerabilityPanel />
        <DataSourcesPanel />
      </div>
    </MapProvider>
  )
}
