import { centroid } from '@turf/turf'
import type { LngLat } from '../flows/spatial'

/** Centroid of a polygon/multipolygon feature as [lng, lat]. Curation-time helper. */
export function kommuneCentroid(feature: GeoJSON.Feature): LngLat {
  const c = centroid(feature as GeoJSON.Feature<GeoJSON.Geometry>)
  const [lng, lat] = c.geometry.coordinates as [number, number]
  return [lng, lat]
}
