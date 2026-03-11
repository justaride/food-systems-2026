'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type {
  Store, Municipality, MapLayer, ChainId,
  AquacultureSite, ProcessingPlant, Port, LogisticsHub, MunicipalityMetrics,
} from './types'
import { ALL_CHAINS } from './types'
import { bbox as turfBbox, booleanPointInPolygon, point } from '@turf/turf'
import { calculateMunicipalityMetrics } from './metrics'
import { calculateVulnerabilityScores, type VulnerabilityScore } from './vulnerability'

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
  aquacultureSites: AquacultureSite[]
  processingPlants: ProcessingPlant[]
  ports: Port[]
  logisticsHubs: LogisticsHub[]
  municipalityMetrics: Record<string, MunicipalityMetrics>
  vulnerabilityScores: Record<string, VulnerabilityScore>
  selectedMunicipality: string | null
  setSelectedMunicipality: (code: string | null) => void
}

const MapContext = createContext<MapContextType | null>(null)

function parseAquacultureSites(geojson: GeoJSON.FeatureCollection): AquacultureSite[] {
  return geojson.features
    .filter(f => f.geometry.type === 'Point')
    .map(f => {
      const p = f.properties || {}
      const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
      const prodForm = (p.til_produksjonsform || '').toLowerCase()
      let productionType: AquacultureSite['productionType'] = 'other'
      if (prodForm.includes('matfisk')) productionType = 'matfisk'
      else if (prodForm.includes('settefisk') || prodForm.includes('smolt')) productionType = 'settefisk'
      else if (prodForm.includes('stamfisk')) productionType = 'stamfisk'
      else if (prodForm.includes('skjell') || prodForm.includes('skalldyr')) productionType = 'shellfish'
      else if (prodForm.includes('tang') || prodForm.includes('tare')) productionType = 'seaweed'

      return {
        id: p.loknr || 0,
        name: p.navn || '',
        status: p.status_lokalitet || '',
        capacity: p.kapasitet_lok || 0,
        capacityUnit: p.kapasitet_unittype || '',
        placement: (p.plassering || '').includes('LAND') ? 'land' as const : 'sea' as const,
        waterType: p.vannmiljo || '',
        county: p.fylke || '',
        municipality: p.kommune || '',
        species: (p.til_arter || '').split(',').map((s: string) => s.trim()).filter(Boolean),
        productionType,
        coordinates: coords,
      }
    })
}

function parseProcessingPlants(geojson: GeoJSON.FeatureCollection): ProcessingPlant[] {
  return geojson.features
    .filter(f => f.geometry.type === 'Point')
    .map(f => {
      const p = f.properties || {}
      const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
      return {
        id: p.id || '',
        name: p.name || '',
        company: p.company || 'Other',
        type: p.type || 'meat',
        coordinates: coords,
        capacity: p.capacity,
        products: p.products,
        employees: p.employees,
      }
    })
}

function parsePorts(geojson: GeoJSON.FeatureCollection): Port[] {
  return geojson.features
    .filter(f => f.geometry.type === 'Point')
    .map(f => {
      const p = f.properties || {}
      const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
      return {
        id: p.id || '',
        name: p.name || '',
        type: p.type || 'fishing',
        coordinates: coords,
        annualTonnage: p.annualTonnage,
        primaryCatch: p.primaryCatch,
        facilities: p.facilities,
        region: p.region || '',
      }
    })
}

function parseLogisticsHubs(geojson: GeoJSON.FeatureCollection): LogisticsHub[] {
  return geojson.features
    .filter(f => f.geometry.type === 'Point')
    .map(f => {
      const p = f.properties || {}
      const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number]
      return {
        id: p.id || '',
        name: p.name || '',
        owner: p.owner || '',
        type: p.type || '',
        capacity: p.capacity,
        role: p.role || '',
        storesServed: p.storesServed,
        city: p.city || '',
        coordinates: coords,
      }
    })
}

function assignStoresToMunicipalities(
  stores: Store[],
  geojson: GeoJSON.FeatureCollection
): Record<string, Store[]> {
  const result: Record<string, Store[]> = {}

  const features = geojson.features
    .map(f => {
      const code = f.properties?.kommunenummer as string
      if (!code) return null
      const b = turfBbox(f)
      return { code, feature: f, bbox: b }
    })
    .filter((f): f is NonNullable<typeof f> => f !== null)

  for (const store of stores) {
    const lng = store.location.lng
    const lat = store.location.lat
    const pt = point([lng, lat])

    for (const { code, feature, bbox: b } of features) {
      if (lng >= b[0] && lng <= b[2] && lat >= b[1] && lat <= b[3]) {
        try {
          if (booleanPointInPolygon(pt, feature as GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>)) {
            if (!result[code]) result[code] = []
            result[code].push(store)
            break
          }
        } catch {
          continue
        }
      }
    }
  }

  return result
}

export function MapProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality>>({})
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['stores'])
  const [activeChains, setActiveChains] = useState<ChainId[]>(ALL_CHAINS)
  const [aquacultureSites, setAquacultureSites] = useState<AquacultureSite[]>([])
  const [processingPlants, setProcessingPlants] = useState<ProcessingPlant[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [logisticsHubs, setLogisticsHubs] = useState<LogisticsHub[]>([])
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)

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
      fetchJson('/data/food-systems/aquaculture_sites.geojson'),
      fetchJson('/data/food-systems/processing_plants.geojson'),
      fetchJson('/data/food-systems/ports.geojson'),
      fetchJson('/data/food-systems/logistics_hubs.geojson'),
    ])
      .then(([storesData, municipalitiesData, geojsonData, aquaData, plantData, portData, hubData]) => {
        setStores(storesData)
        setMunicipalities(municipalitiesData)
        setGeojson(geojsonData)
        setAquacultureSites(parseAquacultureSites(aquaData))
        setProcessingPlants(parseProcessingPlants(plantData))
        setPorts(parsePorts(portData))
        setLogisticsHubs(parseLogisticsHubs(hubData))
        setIsLoading(false)
      })
      .catch(err => {
        console.error('Failed to load map data:', err)
        setError(err.message)
        setIsLoading(false)
      })
  }, [])

  const municipalityMetrics = useMemo(() => {
    if (!stores.length || !geojson || !Object.keys(municipalities).length) return {}

    const storesByMuni = assignStoresToMunicipalities(stores, geojson)
    const result: Record<string, MunicipalityMetrics> = {}

    for (const [code, muni] of Object.entries(municipalities)) {
      const muniStores = storesByMuni[code] || []
      result[code] = calculateMunicipalityMetrics(muni, muniStores)
    }

    return result
  }, [stores, municipalities, geojson])

  const vulnerabilityScores = useMemo(() => {
    if (!Object.keys(municipalityMetrics).length || !logisticsHubs.length || !geojson) return {}
    return calculateVulnerabilityScores(municipalities, municipalityMetrics, logisticsHubs, geojson)
  }, [municipalities, municipalityMetrics, logisticsHubs, geojson])

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
    aquacultureSites,
    processingPlants,
    ports,
    logisticsHubs,
    municipalityMetrics,
    vulnerabilityScores,
    selectedMunicipality,
    setSelectedMunicipality,
  }), [
    isLoading, error, stores, municipalities, geojson,
    activeLayers, toggleLayer, activeChains, toggleChain,
    aquacultureSites, processingPlants, ports, logisticsHubs,
    municipalityMetrics, vulnerabilityScores, selectedMunicipality,
  ])

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
