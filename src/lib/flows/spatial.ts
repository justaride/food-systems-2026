import type { FlowNodeType, LoopFlows } from './types'

export type CoordinatePrecision = 'exact_point' | 'kommune_centroid' | 'estimated' | 'unknown'
export type LngLat = [number, number]

export type CuratedCoord = { coord: LngLat; precision: CoordinatePrecision; source: string }

export type FlowCoordLookups = {
  /** Keyed by node id (also matched against node.ref and normalized label). */
  curated: Map<string, CuratedCoord>
  /** Keyed by node.ref → exact site coordinate. Vestigial on current data (no node refs an aquaculture site). */
  aquacultureByRef: Map<string, LngLat>
}

export type ResolvedFlowNode = {
  loopId: string
  nodeId: string
  label: string
  type: FlowNodeType
  coord?: LngLat
  precision: CoordinatePrecision
  source?: string
}

const AQUACULTURE_SOURCE = 'Akvakulturregisteret (Fiskeridirektoratet)'

export function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

type CuratedFeature = {
  geometry?: { type?: string; coordinates?: unknown }
  properties?: { key?: string; precision?: string; source?: string }
}

export function buildCuratedLookup(geojson: { features?: CuratedFeature[] }): Map<string, CuratedCoord> {
  const map = new Map<string, CuratedCoord>()
  for (const f of geojson.features ?? []) {
    const key = f.properties?.key
    const coords = f.geometry?.coordinates
    if (!key || !Array.isArray(coords) || coords.length < 2) continue
    map.set(key, {
      coord: [Number(coords[0]), Number(coords[1])],
      precision: (f.properties?.precision as CoordinatePrecision) ?? 'unknown',
      source: f.properties?.source ?? '',
    })
  }
  return map
}

export function resolveFlowCoordinates(loops: LoopFlows[], lookups: FlowCoordLookups): ResolvedFlowNode[] {
  const resolved: ResolvedFlowNode[] = []
  for (const loop of loops) {
    for (const node of loop.nodes) {
      const base = { loopId: loop.loopId, nodeId: node.id, label: node.label, type: node.type }

      // Tier 1: curated — try node.ref, node.id, normalized label (first hit wins).
      const candidates = [node.ref, node.id, normalizeKey(node.label)].filter(Boolean) as string[]
      let hit: CuratedCoord | undefined
      for (const c of candidates) {
        hit = lookups.curated.get(c)
        if (hit) break
      }
      if (hit) {
        resolved.push({ ...base, coord: hit.coord, precision: hit.precision, source: hit.source })
        continue
      }

      // Tier 2: node.ref → aquaculture site → exact_point.
      const aqua = node.ref ? lookups.aquacultureByRef.get(node.ref) : undefined
      if (aqua) {
        resolved.push({ ...base, coord: aqua, precision: 'exact_point', source: AQUACULTURE_SOURCE })
        continue
      }

      // Tier 3: unknown.
      resolved.push({ ...base, precision: 'unknown' })
    }
  }
  return resolved
}

export function summarizeCoverage(resolved: ResolvedFlowNode[]): Record<CoordinatePrecision, number> {
  const counts: Record<CoordinatePrecision, number> = {
    exact_point: 0, kommune_centroid: 0, estimated: 0, unknown: 0,
  }
  for (const r of resolved) counts[r.precision] += 1
  return counts
}
