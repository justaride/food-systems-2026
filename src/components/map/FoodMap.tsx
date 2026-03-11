'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useMapContext } from '@/lib/map/MapContext'
import { CHAIN_CONFIGS, NORWAY_CENTER, type Store, type ChainId } from '@/lib/map/types'

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

  const { stores, geojson, activeLayers, activeChains, municipalities } = useMapContext()
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

  // Municipality boundaries
  useEffect(() => {
    if (!mapRef.current || !geojson) return

    if (boundariesRef.current) {
      mapRef.current.removeLayer(boundariesRef.current)
      boundariesRef.current = null
    }

    if (!activeLayers.includes('boundaries')) return

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
            <span style="color:${cfg.color}">&#9679;</span> ${store.chain} <small style="color:#999">(${store.storeType})</small>
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
