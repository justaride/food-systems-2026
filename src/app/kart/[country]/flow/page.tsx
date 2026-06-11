'use client'

import { use } from 'react'
import { redirect } from 'next/navigation'
import { MapProvider } from '@/lib/map/MapContext'
import { isValidCountryCode } from '@/lib/config/countries'
import CountrySelector from '@/components/map/CountrySelector'
import FoodFlowMap from '@/components/map/FoodFlowMap'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'

function FlowPageHeader({ country }: { country: string }) {
  return (
    <div className="absolute top-4 left-4 z-[1000]">
      <Breadcrumbs
        items={[
          { label: 'Kart', href: '/kart' },
          { label: country.toUpperCase(), href: `/kart/${country}` },
          { label: 'Flow' },
        ]}
        className="shadow-sm"
      />
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
