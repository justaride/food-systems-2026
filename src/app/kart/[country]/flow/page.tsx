'use client'

import { use } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MapProvider } from '@/lib/map/MapContext'
import { isValidCountryCode } from '@/lib/config/countries'
import CountrySelector from '@/components/map/CountrySelector'
import FoodFlowMap from '@/components/map/FoodFlowMap'

function FlowPageHeader({ country }: { country: string }) {
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <Link
        href={`/kart/${country}`}
        className="inline-flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
      >
        <span aria-hidden="true">←</span>
        Tilbake til kart
      </Link>
    </div>
  )
}

export default function KartCountryFlowPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = use(params)

  if (!isValidCountryCode(country)) {
    redirect('/kart/no')
  }

  return (
    <MapProvider country={country}>
      <div className="w-full h-full relative" style={{ height: 'calc(100vh - 57px)' }}>
        <FlowPageHeader country={country} />
        <CountrySelector currentCountry={country} />
        <FoodFlowMap />
      </div>
    </MapProvider>
  )
}
