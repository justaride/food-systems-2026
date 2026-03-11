'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapContext } from '@/lib/map/MapContext'
import {
  CHAIN_CONFIGS,
  NORWAY_CENTER,
  AQUACULTURE_COLORS,
  PROCESSING_COLORS,
  PORT_COLORS,
  type Store,
  type ChainId,
  type AquacultureProductionType,
  type ProcessingCompany,
  type PortType,
} from '@/lib/map/types'
import { getVulnerabilityColor } from '@/lib/map/vulnerability'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

type StoreCluster = {
  center: [number, number]
  stores: Store[]
}

function clusterStores(stores: Store[], zoom: number): StoreCluster[] {
  if (zoom >= 12) {
    return stores.map(s => ({
      center: [s.location.lat, s.location.lng],
      stores: [s],
    }))
  }

  const gridSize = zoom < 6 ? 2 : zoom < 8 ? 1 : zoom < 10 ? 0.5 : 0.2
  const grid: Record<string, Store[]> = {}

  for (const store of stores) {
    const key = `${Math.floor(store.location.lng / gridSize)},${Math.floor(store.location.lat / gridSize)}`
    if (!grid[key]) grid[key] = []
    grid[key].push(store)
  }

  return Object.values(grid).map(group => {
    const avgLat = group.reduce((s, st) => s + st.location.lat, 0) / group.length
    const avgLng = group.reduce((s, st) => s + st.location.lng, 0) / group.length
    return { center: [avgLat, avgLng], stores: group }
  })
}

function createClusterIcon(count: number, chainIds: string[]): L.DivIcon {
  const size = Math.min(30 + Math.log2(count) * 6, 50)
  const counts: Record<string, number> = {}
  for (const id of chainIds) counts[id] = (counts[id] || 0) + 1
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const color = CHAIN_CONFIGS[dominant as ChainId]?.color ?? '#6B7280'

  return L.divIcon({
    className: 'store-cluster',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};border:2px solid white;border-radius:50%;
      box-shadow:0 2px 4px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-weight:bold;color:white;font-size:${size * 0.35}px;
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

export default function FoodMap() {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<L.LayerGroup | null>(null)
  const boundariesRef = useRef<L.GeoJSON | null>(null)
  const aquacultureRef = useRef<L.LayerGroup | null>(null)
  const processingRef = useRef<L.LayerGroup | null>(null)
  const portsRef = useRef<L.LayerGroup | null>(null)
  const desertRef = useRef<L.LayerGroup | null>(null)
  const vulnerabilityRef = useRef<L.GeoJSON | null>(null)

  const {
    stores, geojson, activeLayers, activeChains, municipalities,
    aquacultureSites, processingPlants, ports, vulnerabilityScores,
    setSelectedMunicipality,
  } = useMapContext()
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: NORWAY_CENTER,
      zoom: 5,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
    }).addTo(map)

    markersRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    setMapReady(true)

    return () => {
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

  // Municipality boundaries (hidden when vulnerability active)
  useEffect(() => {
    if (!mapRef.current || !geojson) return

    if (boundariesRef.current) {
      mapRef.current.removeLayer(boundariesRef.current)
      boundariesRef.current = null
    }

    if (!activeLayers.includes('boundaries') || activeLayers.includes('vulnerability')) return

    const layer = L.geoJSON(geojson, {
      style: () => ({
        color: '#78716c',
        weight: 1,
        fillColor: '#f5f5f4',
        fillOpacity: 0.05,
      }),
      onEachFeature: (feature, featureLayer) => {
        const code = feature.properties?.kommunenummer
        const name = feature.properties?.kommunenavn
        const muni = municipalities[code]
        let tip = `<strong>${name}</strong>`
        if (muni) tip += `<br/>Innbyggere: ${muni.population?.toLocaleString() ?? 'N/A'}`
        featureLayer.bindTooltip(tip, { sticky: true })
      },
    })

    layer.addTo(mapRef.current)
    boundariesRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      boundariesRef.current = null
    }
  }, [geojson, activeLayers, municipalities])

  // Aquaculture sites
  useEffect(() => {
    if (!mapRef.current) return
    if (aquacultureRef.current) {
      mapRef.current.removeLayer(aquacultureRef.current)
      aquacultureRef.current = null
    }
    if (!activeLayers.includes('aquaculture') || !aquacultureSites.length) return

    const layer = L.layerGroup()
    for (const site of aquacultureSites) {
      const color = AQUACULTURE_COLORS[site.productionType as AquacultureProductionType] || AQUACULTURE_COLORS.other
      const marker = L.circleMarker(
        [site.coordinates[1], site.coordinates[0]],
        { radius: 4, fillColor: color, color: '#fff', weight: 1, fillOpacity: 0.8 }
      )
      marker.bindPopup(`
        <div style="min-width:200px">
          <strong>${site.name}</strong><br/>
          <span style="color:${color}">\u25CF</span> ${site.productionType}
          <br/><small>Art: ${site.species.join(', ')}</small>
          <br/><small>Kapasitet: ${site.capacity.toLocaleString()} ${site.capacityUnit}</small>
          <br/><small>Kommune: ${site.municipality}</small>
          <br/><small>Status: ${site.status}</small>
        </div>
      `)
      marker.addTo(layer)
    }
    layer.addTo(mapRef.current)
    aquacultureRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      aquacultureRef.current = null
    }
  }, [aquacultureSites, activeLayers])

  // Processing plants
  useEffect(() => {
    if (!mapRef.current) return
    if (processingRef.current) {
      mapRef.current.removeLayer(processingRef.current)
      processingRef.current = null
    }
    if (!activeLayers.includes('processing') || !processingPlants.length) return

    const layer = L.layerGroup()
    for (const plant of processingPlants) {
      const color = PROCESSING_COLORS[plant.company as ProcessingCompany] || PROCESSING_COLORS.Other
      const marker = L.circleMarker(
        [plant.coordinates[1], plant.coordinates[0]],
        { radius: 7, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 }
      )
      marker.bindPopup(`
        <div style="min-width:200px">
          <strong>${plant.name}</strong><br/>
          <span style="color:${color}">\u25CF</span> ${plant.company}
          <br/><small>Type: ${plant.type}</small>
          ${plant.capacity ? `<br/><small>Kapasitet: ${plant.capacity}</small>` : ''}
          ${plant.employees ? `<br/><small>Ansatte: ${plant.employees}</small>` : ''}
          ${plant.products?.length ? `<br/><small>Produkter: ${plant.products.join(', ')}</small>` : ''}
        </div>
      `)
      marker.addTo(layer)
    }
    layer.addTo(mapRef.current)
    processingRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      processingRef.current = null
    }
  }, [processingPlants, activeLayers])

  // Ports
  useEffect(() => {
    if (!mapRef.current) return
    if (portsRef.current) {
      mapRef.current.removeLayer(portsRef.current)
      portsRef.current = null
    }
    if (!activeLayers.includes('ports') || !ports.length) return

    const layer = L.layerGroup()
    for (const port of ports) {
      const color = PORT_COLORS[port.type as PortType] || PORT_COLORS.fishing
      const size = port.annualTonnage ? Math.min(5 + Math.log10(port.annualTonnage) * 2, 12) : 6
      const marker = L.circleMarker(
        [port.coordinates[1], port.coordinates[0]],
        { radius: size, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9 }
      )
      marker.bindPopup(`
        <div style="min-width:180px">
          <strong>${port.name}</strong><br/>
          <span style="color:${color}">\u25CF</span> ${port.type}
          ${port.annualTonnage ? `<br/><small>Tonnasje: ${port.annualTonnage.toLocaleString()} t/\u00E5r</small>` : ''}
          ${port.primaryCatch?.length ? `<br/><small>Fangst: ${port.primaryCatch.join(', ')}</small>` : ''}
          ${port.facilities?.length ? `<br/><small>Fasiliteter: ${port.facilities.join(', ')}</small>` : ''}
        </div>
      `)
      marker.addTo(layer)
    }
    layer.addTo(mapRef.current)
    portsRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      portsRef.current = null
    }
  }, [ports, activeLayers])

  // Food desert layer (5km radius circles)
  useEffect(() => {
    if (!mapRef.current) return
    if (desertRef.current) {
      mapRef.current.removeLayer(desertRef.current)
      desertRef.current = null
    }
    if (!activeLayers.includes('desert') || !stores.length) return

    const renderer = L.canvas()
    const layer = L.layerGroup()
    const filtered = stores.filter(s => activeChains.includes(s.chainId as ChainId))
    for (const store of filtered) {
      L.circle([store.location.lat, store.location.lng], {
        radius: 5000,
        renderer,
        fillColor: '#10b981',
        fillOpacity: 0.08,
        color: '#10b981',
        weight: 0.5,
        opacity: 0.3,
      }).addTo(layer)
    }
    layer.addTo(mapRef.current)
    desertRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      desertRef.current = null
    }
  }, [stores, activeLayers, activeChains])

  // Vulnerability choropleth
  useEffect(() => {
    if (!mapRef.current || !geojson) return
    if (vulnerabilityRef.current) {
      mapRef.current.removeLayer(vulnerabilityRef.current)
      vulnerabilityRef.current = null
    }
    if (!activeLayers.includes('vulnerability') || !Object.keys(vulnerabilityScores).length) return

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const code = feature?.properties?.kommunenummer
        const vs = vulnerabilityScores[code]
        const color = vs ? getVulnerabilityColor(vs.score) : '#d6d3d1'
        return {
          color: '#78716c',
          weight: 1,
          fillColor: color,
          fillOpacity: 0.5,
        }
      },
      onEachFeature: (feature, featureLayer) => {
        const code = feature.properties?.kommunenummer
        const name = feature.properties?.kommunenavn
        const vs = vulnerabilityScores[code]
        const muni = municipalities[code]
        let tip = `<strong>${name}</strong>`
        if (vs) tip += `<br/>S\u00E5rbarhet: ${(vs.score * 100).toFixed(0)}% (${vs.riskLevel})`
        if (muni) tip += `<br/>Innbyggere: ${muni.population?.toLocaleString() ?? 'N/A'}`
        featureLayer.bindTooltip(tip, { sticky: true })
        featureLayer.on('click', () => setSelectedMunicipality(code))
      },
    })

    layer.addTo(mapRef.current)
    vulnerabilityRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      vulnerabilityRef.current = null
    }
  }, [geojson, activeLayers, vulnerabilityScores, municipalities, setSelectedMunicipality])

  // Store markers with clustering
  const updateMarkers = useCallback(() => {
    const map = mapRef.current
    const layer = markersRef.current
    if (!map || !layer) return

    layer.clearLayers()
    if (!activeLayers.includes('stores')) return

    const filtered = stores.filter(s => activeChains.includes(s.chainId as ChainId))
    if (!filtered.length) return

    const zoom = map.getZoom()
    const clusters = clusterStores(filtered, zoom)

    for (const cluster of clusters) {
      if (cluster.stores.length === 1) {
        const store = cluster.stores[0]
        const cfg = CHAIN_CONFIGS[store.chainId as ChainId]
        if (!cfg) continue

        const marker = L.circleMarker(cluster.center, {
          radius: 5,
          fillColor: cfg.color,
          color: '#fff',
          weight: 1,
          fillOpacity: 0.8,
        })

        marker.bindPopup(`
          <div style="min-width:180px">
            <strong>${store.name}</strong><br/>
            <span style="color:${cfg.color}">\u25CF</span> ${store.chain} <small style="color:#999">(${store.storeType})</small>
            ${store.address || store.city ? `<br/><small>${[store.address, store.city].filter(Boolean).join(', ')}</small>` : ''}
            ${store.openingHours ? `<br/><small>${store.openingHours}</small>` : ''}
          </div>
        `)
        marker.addTo(layer)
      } else {
        const marker = L.marker(cluster.center, {
          icon: createClusterIcon(cluster.stores.length, cluster.stores.map(s => s.chainId)),
        })

        const counts: Record<string, number> = {}
        for (const s of cluster.stores) {
          const name = CHAIN_CONFIGS[s.chainId as ChainId]?.name || s.chain
          counts[name] = (counts[name] || 0) + 1
        }
        const breakdown = Object.entries(counts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([n, c]) => `<div>${n}: ${c}</div>`)
          .join('')

        marker.bindPopup(`
          <div style="min-width:140px">
            <strong>${cluster.stores.length} butikker</strong>
            <div style="font-size:12px;color:#666;margin-top:6px">
              ${breakdown}
              ${Object.keys(counts).length > 5 ? '<div>...</div>' : ''}
            </div>
          </div>
        `)
        marker.addTo(layer)
      }
    }
  }, [stores, activeLayers, activeChains])

  useEffect(() => {
    if (!mapReady) return
    updateMarkers()

    const map = mapRef.current!
    let timer: ReturnType<typeof setTimeout>
    const debounced = () => {
      clearTimeout(timer)
      timer = setTimeout(updateMarkers, 150)
    }
    map.on('zoomend', debounced)
    return () => {
      clearTimeout(timer)
      map.off('zoomend', debounced)
    }
  }, [mapReady, updateMarkers])

  return (
    <div ref={containerRef} className="w-full h-full" style={{ background: '#fafaf9' }} />
  )
}
