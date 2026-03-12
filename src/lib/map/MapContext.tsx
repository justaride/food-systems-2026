'use client'

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type {
  Store, Municipality, MapLayer,
  AquacultureSite, ProcessingPlant, Port, LogisticsHub, MunicipalityMetrics,
} from './types'
import { calculateMunicipalityMetrics } from './metrics'
import { calculateVulnerabilityScores, type VulnerabilityScore } from './vulnerability'
import { assignStoresToMunicipalities } from './pip'
import type { CountryConfig, CountryCode } from '@/lib/config/countries'
import { getCountryConfig } from '@/lib/config/countries'

type MapContextType = {
  isLoading: boolean
  error: string | null
  country: CountryCode
  countryConfig: CountryConfig | null
  stores: Store[]
  municipalities: Record<string, Municipality>
  geojson: GeoJSON.FeatureCollection | null
  activeLayers: MapLayer[]
  toggleLayer: (layer: MapLayer) => void
  activeChains: string[]
  toggleChain: (chain: string) => void
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

function dataPath(country: CountryCode, file: string): string {
  return `/data/food-systems/${country}/${file}`
}

export function MapProvider({ children, country }: { children: ReactNode; country: CountryCode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [countryConfig, setCountryConfig] = useState<CountryConfig | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality>>({})
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [activeLayers, setActiveLayers] = useState<MapLayer[]>(['stores'])
  const [activeChains, setActiveChains] = useState<string[]>([])
  const [aquacultureSites, setAquacultureSites] = useState<AquacultureSite[]>([])
  const [processingPlants, setProcessingPlants] = useState<ProcessingPlant[]>([])
  const [ports, setPorts] = useState<Port[]>([])
  const [logisticsHubs, setLogisticsHubs] = useState<LogisticsHub[]>([])
  const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    setStores([])
    setMunicipalities({})
    setGeojson(null)
    setAquacultureSites([])
    setProcessingPlants([])
    setPorts([])
    setLogisticsHubs([])
    setSelectedMunicipality(null)

    const fetchJson = (url: string) =>
      fetch(url).then(r => {
        if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`)
        return r.json()
      })

    const optionalFetch = (url: string) =>
      fetch(url).then(r => {
        if (!r.ok) return null
        return r.json()
      }).catch(() => null)

    getCountryConfig(country).then(config => {
      setCountryConfig(config)
      setActiveChains(Object.keys(config.chains))

      const { dataFiles } = config

      const required = [
        fetchJson(dataPath(country, dataFiles.stores)),
        fetchJson(dataPath(country, dataFiles.municipalities)),
        fetchJson(dataPath(country, dataFiles.boundaries)),
      ]

      const optional = [
        dataFiles.aquaculture ? optionalFetch(dataPath(country, dataFiles.aquaculture)) : Promise.resolve(null),
        dataFiles.processing ? optionalFetch(dataPath(country, dataFiles.processing)) : Promise.resolve(null),
        dataFiles.ports ? optionalFetch(dataPath(country, dataFiles.ports)) : Promise.resolve(null),
        dataFiles.logistics ? optionalFetch(dataPath(country, dataFiles.logistics)) : Promise.resolve(null),
      ]

      Promise.all([...required, ...optional])
        .then(([storesData, municipalitiesData, geojsonData, aquaData, plantData, portData, hubData]) => {
          setStores(storesData)
          setMunicipalities(municipalitiesData)
          setGeojson(geojsonData)
          if (aquaData) setAquacultureSites(parseAquacultureSites(aquaData))
          if (plantData) setProcessingPlants(parseProcessingPlants(plantData))
          if (portData) setPorts(parsePorts(portData))
          if (hubData) setLogisticsHubs(parseLogisticsHubs(hubData))
          setIsLoading(false)
        })
        .catch(err => {
          console.error('Failed to load map data:', err)
          setError(err.message)
          setIsLoading(false)
        })
    }).catch(err => {
      console.error('Failed to load country config:', err)
      setError(err.message)
      setIsLoading(false)
    })
  }, [country])

  const municipalityMetrics = useMemo(() => {
    if (!stores.length || !geojson || !Object.keys(municipalities).length || !countryConfig) return {}

    const storesByMuni = assignStoresToMunicipalities(stores, geojson, countryConfig.municipalityIdProp)
    const result: Record<string, MunicipalityMetrics> = {}

    for (const [code, muni] of Object.entries(municipalities)) {
      if (code.startsWith('_')) continue
      const muniStores = storesByMuni[code] || []
      result[code] = calculateMunicipalityMetrics(muni, muniStores)
    }

    return result
  }, [stores, municipalities, geojson, countryConfig])

  const vulnerabilityScores = useMemo(() => {
    if (!Object.keys(municipalityMetrics).length || !logisticsHubs.length || !geojson || !countryConfig) return {}
    return calculateVulnerabilityScores(
      municipalities,
      municipalityMetrics,
      logisticsHubs,
      geojson,
      countryConfig.selfSufficiency,
      countryConfig.municipalityIdProp
    )
  }, [municipalities, municipalityMetrics, logisticsHubs, geojson, countryConfig])

  const toggleLayer = useCallback((layer: MapLayer) => {
    setActiveLayers(prev =>
      prev.includes(layer)
        ? prev.filter(l => l !== layer)
        : [...prev, layer]
    )
  }, [])

  const toggleChain = useCallback((chain: string) => {
    setActiveChains(prev =>
      prev.includes(chain)
        ? prev.filter(c => c !== chain)
        : [...prev, chain]
    )
  }, [])

  const value = useMemo(() => ({
    isLoading,
    error,
    country,
    countryConfig,
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
    isLoading, error, country, countryConfig, stores, municipalities, geojson,
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
