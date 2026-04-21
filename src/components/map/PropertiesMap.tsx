'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type PropertyFeature = {
  type: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: {
    id: string
    companyId: string
    companyName: string
    propertyType: string
    address: string | null
    municipality: string | null
    sqMeters: number | null
    selfLeased: boolean
    tenantName: string | null
  }
}

type PropertiesGeoJSON = {
  type: 'FeatureCollection'
  features: PropertyFeature[]
}

const PROPERTY_COLORS: Record<string, string> = {
  warehouse: '#F97316',
  retail: '#22C55E',
  production: '#3B82F6',
  logistics: '#A855F7',
  office: '#6B7280',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  warehouse: 'Lager',
  retail: 'Butikk',
  office: 'Kontor',
  production: 'Produksjon',
  logistics: 'Logistikk',
}

type Props = {
  /** Optional filter function applied to features before rendering markers. */
  filter?: (p: PropertyFeature['properties']) => boolean
  className?: string
}

export function PropertiesMap({ filter, className = 'h-[480px] w-full' }: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.LayerGroup | null>(null)
  const [geojson, setGeojson] = useState<PropertiesGeoJSON | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return
    const map = L.map(mapContainerRef.current, {
      center: [64.5, 14.0],
      zoom: 4,
      zoomControl: true,
      scrollWheelZoom: false,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 18,
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Fetch GeoJSON once
  useEffect(() => {
    let cancelled = false
    fetch('/api/properties')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: PropertiesGeoJSON) => {
        if (!cancelled) {
          setGeojson(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError((err as Error).message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Render markers when geojson or filter changes
  useEffect(() => {
    if (!mapRef.current || !geojson) return

    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current)
      layerRef.current = null
    }

    const layer = L.layerGroup()
    const features = filter
      ? geojson.features.filter((f) => filter(f.properties))
      : geojson.features

    const bounds: L.LatLngTuple[] = []

    for (const feature of features) {
      const [lng, lat] = feature.geometry.coordinates
      const p = feature.properties
      const color = PROPERTY_COLORS[p.propertyType] ?? '#6B7280'
      bounds.push([lat, lng])

      const marker = L.circleMarker([lat, lng], {
        radius: 6,
        fillColor: color,
        color: p.selfLeased ? '#DC2626' : '#fff',
        weight: p.selfLeased ? 2 : 1,
        fillOpacity: 0.85,
      })

      const typeLabel = PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType
      marker.bindPopup(`
        <div style="min-width:200px;font-size:12px">
          <strong>${p.companyName}</strong><br/>
          <span style="color:${color}">&#9679;</span> ${typeLabel}
          ${p.address ? `<br/><span style="color:#78716c">${p.address}</span>` : ''}
          ${p.municipality ? `<br/><span style="color:#78716c">${p.municipality}</span>` : ''}
          ${p.sqMeters ? `<br/><span style="color:#78716c">${p.sqMeters.toLocaleString('no')} m&sup2;</span>` : ''}
          ${p.selfLeased ? '<br/><span style="color:#DC2626">&#9888; Selvleie</span>' : ''}
          ${p.tenantName ? `<br/><span style="color:#78716c">Leietaker: ${p.tenantName}</span>` : ''}
        </div>
      `)
      marker.addTo(layer)
    }

    layer.addTo(mapRef.current)
    layerRef.current = layer

    if (bounds.length > 0) {
      mapRef.current.fitBounds(L.latLngBounds(bounds).pad(0.15), { maxZoom: 10 })
    }

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      layerRef.current = null
    }
  }, [geojson, filter])

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700`}
      >
        Kunne ikke laste kart: {error}
      </div>
    )
  }

  const visibleCount = geojson
    ? (filter ? geojson.features.filter((f) => filter(f.properties)).length : geojson.features.length)
    : 0

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className={`${className} rounded-lg border border-stone-200 overflow-hidden bg-stone-50`}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
        <div className="flex flex-wrap gap-3">
          {Object.entries(PROPERTY_COLORS).map(([type, color]) => (
            <span key={type} className="inline-flex items-center gap-1.5">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: color }}
              />
              {PROPERTY_TYPE_LABELS[type] ?? type}
            </span>
          ))}
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full border-2"
              style={{ borderColor: '#DC2626', background: '#fff' }}
            />
            Selvleie
          </span>
        </div>
        <div className="text-stone-400">
          {loading ? 'Laster eiendommer…' : `${visibleCount.toLocaleString('no')} eiendommer med koordinater`}
        </div>
      </div>
    </div>
  )
}
