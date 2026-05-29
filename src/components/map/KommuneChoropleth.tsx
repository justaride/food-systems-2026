'use client'

import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  /** Norwegian kommunenummer → numeric value (e.g. NOK total per kommune) */
  data: Record<string, number>
  /** Path to GeoJSON with kommunenummer property (defaults to Norway). */
  geojsonUrl?: string
  /** ARIA/legend label. */
  valueLabel: string
  /** Format a value to display (tooltip + legend). */
  formatValue?: (v: number) => string
  /** Tailwind class applied to wrapper sizing */
  className?: string
  /** Color stops low→high. Default green ramp. */
  colorStops?: string[]
}

const DEFAULT_STOPS = ['#f7fee7', '#d9f99d', '#a3e635', '#65a30d', '#365314']

function pickColor(normalized: number, stops: string[]): string {
  if (!Number.isFinite(normalized)) return '#e7e5e4'
  const clamped = Math.max(0, Math.min(1, normalized))
  const idx = Math.min(stops.length - 1, Math.floor(clamped * stops.length))
  return stops[idx]
}

function quantileThresholds(values: number[], n: number): number[] {
  if (values.length === 0) return []
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  for (let i = 1; i <= n; i++) {
    const idx = Math.min(sorted.length - 1, Math.floor((i / n) * sorted.length) - 1)
    out.push(sorted[Math.max(0, idx)])
  }
  return out
}

export function KommuneChoropleth({
  data,
  geojsonUrl = '/data/food-systems/no/norway-municipalities.geojson',
  valueLabel,
  formatValue = (v) => Math.round(v).toLocaleString('no'),
  className = 'h-[560px] w-full',
  colorStops = DEFAULT_STOPS,
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.GeoJSON | null>(null)
  const [geojson, setGeojson] = useState<GeoJSON.FeatureCollection | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  // Load GeoJSON once
  useEffect(() => {
    let cancelled = false
    fetch(geojsonUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`${geojsonUrl}: ${r.status}`)
        return r.json()
      })
      .then((data) => {
        if (!cancelled) setGeojson(data as GeoJSON.FeatureCollection)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message)
      })
    return () => {
      cancelled = true
    }
  }, [geojsonUrl])

  // Apply data layer
  useEffect(() => {
    if (!mapRef.current || !geojson) return
    if (layerRef.current) {
      mapRef.current.removeLayer(layerRef.current)
      layerRef.current = null
    }

    const values = Object.values(data).filter((v) => Number.isFinite(v) && v > 0)
    const thresholds = quantileThresholds(values, colorStops.length)

    const layer = L.geoJSON(geojson, {
      style: (feature) => {
        const code = feature?.properties?.kommunenummer as string | undefined
        const value = code ? data[code] : undefined
        if (value == null || value === 0) {
          return {
            color: '#a8a29e',
            weight: 0.5,
            fillColor: '#f5f5f4',
            fillOpacity: 0.4,
          }
        }
        const rank = thresholds.findIndex((t) => value <= t)
        const bucket = rank === -1 ? colorStops.length - 1 : rank
        return {
          color: '#78716c',
          weight: 0.8,
          fillColor: colorStops[bucket],
          fillOpacity: 0.78,
        }
      },
      onEachFeature: (feature, featureLayer) => {
        const code = feature.properties?.kommunenummer as string | undefined
        const name = feature.properties?.kommunenavn as string | undefined
        const value = code ? data[code] : undefined
        let tip = `<strong>${name ?? code ?? 'Ukjent'}</strong>`
        if (value != null && value > 0) {
          tip += `<br/>${valueLabel}: ${formatValue(value)}`
        } else {
          tip += `<br/><span style="color:#a8a29e">Ingen data</span>`
        }
        featureLayer.bindTooltip(tip, { sticky: true })
      },
    })
    layer.addTo(mapRef.current)
    layerRef.current = layer

    return () => {
      if (mapRef.current && layer) mapRef.current.removeLayer(layer)
      layerRef.current = null
    }
  }, [geojson, data, valueLabel, formatValue, colorStops])

  if (error) {
    return (
      <div
        className={`${className} flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-sm text-rose-700`}
      >
        Kunne ikke laste kommunekart: {error}
      </div>
    )
  }

  const values = Object.values(data).filter((v) => Number.isFinite(v) && v > 0)
  const max = values.length > 0 ? Math.max(...values) : 0
  const min = values.length > 0 ? Math.min(...values) : 0

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className={`${className} rounded-lg border border-stone-200 overflow-hidden bg-stone-50`}
      />
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <span>{formatValue(min)}</span>
        <div className="flex-1 flex h-2 rounded overflow-hidden">
          {colorStops.map((c, i) => (
            <div key={i} className="flex-1" style={{ background: c }} />
          ))}
        </div>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
