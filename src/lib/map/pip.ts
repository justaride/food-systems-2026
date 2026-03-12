import type { Store } from './types'
import { bbox as turfBbox, booleanPointInPolygon, point } from '@turf/turf'

export function assignStoresToMunicipalities(
  stores: Store[],
  geojson: GeoJSON.FeatureCollection,
  municipalityIdProp = 'kommunenummer'
): Record<string, Store[]> {
  const result: Record<string, Store[]> = {}

  const features = geojson.features
    .map(f => {
      const code = f.properties?.[municipalityIdProp] as string
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
