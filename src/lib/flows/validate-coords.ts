import type { CoordinatePrecision } from './spatial'

export const ALLOWED_KINDS = [
  'biogas_plant',
  'food_bank',
  'redistribution',
  'waste_source',
  'industrial_symbiosis',
  'processing',
  'agriculture',
  'energy_user',
  'water_source',
] as const
export type CircularNodeKind = (typeof ALLOWED_KINDS)[number]

const PRECISIONS: CoordinatePrecision[] = ['exact_point', 'kommune_centroid', 'estimated', 'unknown']

// Nordic envelope: lng -25..35, lat 54..72. A swapped [lat,lng] like [59,10] lands
// lng=59 > 35 and is flagged.
const LNG_MIN = -25, LNG_MAX = 35, LAT_MIN = 54, LAT_MAX = 72

export type CoordIssueCode =
  | 'missing_key'
  | 'duplicate_key'
  | 'missing_source'
  | 'invalid_precision'
  | 'invalid_kind'
  | 'coord_out_of_envelope'
  | 'not_point_geometry'

export type CoordIssue = { code: CoordIssueCode; key?: string; message: string }

type Feature = {
  geometry?: { type?: string; coordinates?: unknown }
  properties?: Record<string, unknown>
}

export function validateCircularNodes(geojson: unknown): CoordIssue[] {
  const issues: CoordIssue[] = []
  const features = (geojson as { features?: Feature[] })?.features ?? []
  const seen = new Set<string>()

  for (const f of features) {
    const p = f.properties ?? {}
    const key = typeof p.key === 'string' ? p.key : ''

    if (!key) {
      issues.push({ code: 'missing_key', message: 'Feature mangler ikke-tom "key".' })
    } else if (seen.has(key)) {
      issues.push({ code: 'duplicate_key', key, message: `Duplikat key "${key}".` })
    } else {
      seen.add(key)
    }

    if (typeof p.source !== 'string' || p.source.trim() === '') {
      issues.push({ code: 'missing_source', key, message: `Feature "${key}" mangler "source".` })
    }
    if (!PRECISIONS.includes(p.precision as CoordinatePrecision)) {
      issues.push({ code: 'invalid_precision', key, message: `Feature "${key}" har ugyldig precision "${String(p.precision)}".` })
    }
    if (!(ALLOWED_KINDS as readonly string[]).includes(p.kind as string)) {
      issues.push({ code: 'invalid_kind', key, message: `Feature "${key}" har ugyldig kind "${String(p.kind)}".` })
    }

    if (f.geometry?.type !== 'Point') {
      issues.push({ code: 'not_point_geometry', key, message: `Feature "${key}" er ikke Point-geometri.` })
      continue
    }
    const c = f.geometry.coordinates
    if (!Array.isArray(c) || c.length < 2 || typeof c[0] !== 'number' || typeof c[1] !== 'number') {
      issues.push({ code: 'coord_out_of_envelope', key, message: `Feature "${key}" har ugyldige koordinater.` })
      continue
    }
    const [lng, lat] = c as [number, number]
    if (lng < LNG_MIN || lng > LNG_MAX || lat < LAT_MIN || lat > LAT_MAX) {
      issues.push({ code: 'coord_out_of_envelope', key, message: `Feature "${key}" [${lng}, ${lat}] er utenfor nordisk konvolutt (mulig byttet lat/lng).` })
    }
  }
  return issues
}
