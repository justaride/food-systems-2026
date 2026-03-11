'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Store, Municipality, MapLayer, ChainId } from './types'
import { ALL_CHAINS } from './types'

type MapContextType = {
  isLoading: boolean
  error: string | null
  stores: Store[]
  municipalities: Record<string, Municipality>
  geojson: GeoJSON.FeatureCollection | null
  activeLayers: MapLayer[]
  toggleLayer: (layer: MapLayer) => void
  activeChains: ChainId[]
  toggleChain: (chain: ChainId) => void
}

const MapContext = createContext<MapContextType | null>(null)

export function MapProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality>>({})
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['stores'])
  const [activeChains, setActiveChains] = useState<ChainId[]>(ALL_CHAINS)

  useEffect(() => {
    const fetchJson = (url: string) =>
      fetch(url).then(r => {
        if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`)
        return r.json()
      })

    Promise.all([
      fetchJson('/data/food-systems/stores.json'),
      fetchJson('/data/food-systems/municipalities.json'),
      fetchJson('/data/food-systems/norway-municipalities.geojson'),
    ])
      .then(([storesData, municipalitiesData, geojsonData]) => {
        setStores(storesData)
        setMunicipalities(municipalitiesData)
        setGeojson(geojsonData)
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load map data:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const toggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers(prev =>
      prev.includes(layer)
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    )
  }, [])

  const toggleChain = useCallback((chain: ChainId) => {
    setActiveChains(prev =>
      prev.includes(chain)
        ? prev.filter(c => c !== chain)
        : [...prev, chain]
    )
  }, [])

  const value = useMemo(() => ({
    isLoading,
    error,
    stores,
    municipalities,
    geojson,
    activeLayers,
    toggleLayer,
    activeChains,
    toggleChain,
  }), [isLoading, error, stores, municipalities, geojson, activeLayers, toggleLayer, activeChains, toggleChain])

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  )
}

export function useMapContext(): MapContextType {
  const ctx = useContext(MapContext)
  if (!ctx) throw new Error('useMapContext must be used within MapProvider')
  return ctx
}
