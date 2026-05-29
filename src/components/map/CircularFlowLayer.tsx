import L from 'leaflet'
import type { EvidenceStatus } from '@/lib/visualization/types'
import type { MaterialFlowsFile } from '@/lib/flows/types'
import type { AquacultureSite } from '@/lib/map/types'
import {
  buildCuratedLookup,
  resolveFlowCoordinates,
  normalizeKey,
  type CoordinatePrecision,
  type FlowCoordLookups,
  type LngLat,
  type ResolvedFlowNode,
} from '@/lib/flows/spatial'

// Matches MaterialFlowTab EVIDENCE_COLORS (Spec 2 palette).
const EVIDENCE_LINE_COLORS: Record<EvidenceStatus, string> = {
  observed: '#059669',
  estimated: '#d97706',
  proxy: '#0284c7',
  illustrative: '#a8a29e',
}

const PRECISION_STYLE: Record<Exclude<CoordinatePrecision, 'unknown'>, { color: string; dashArray?: string; label: string }> = {
  exact_point: { color: '#059669', label: 'Eksakt punkt' },
  kommune_centroid: { color: '#d97706', dashArray: '3 3', label: 'Kommune-sentroid' },
  estimated: { color: '#0284c7', dashArray: '1 4', label: 'Estimert' },
}

const KIND_LABELS: Record<string, string> = {
  biogas_plant: 'Biogassanlegg',
  food_bank: 'Matsentral',
  redistribution: 'Omfordeling',
  waste_source: 'Avfallskilde',
  industrial_symbiosis: 'Industriell symbiose',
  processing: 'Foredling',
  agriculture: 'Jordbruk',
  energy_user: 'Energimottaker',
  water_source: 'Vannkilde',
}

const EVIDENCE_LABELS: Record<EvidenceStatus, string> = {
  observed: 'Observert',
  estimated: 'Estimert',
  proxy: 'Proxy',
  illustrative: 'Illustrativ',
}

export type BuildCircularFlowLayerOptions = {
  circularNodes: GeoJSON.FeatureCollection
  materialFlows: MaterialFlowsFile
  aquacultureSites: AquacultureSite[]
  country: string
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** Loops shown on this country's map: country-prefixed loops + cross-border nordic loops. */
function loopShown(loopId: string, country: string): boolean {
  return loopId.startsWith(`${country}-`) || loopId.startsWith('nordic-')
}

export function buildCircularFlowLayer(opts: BuildCircularFlowLayerOptions): L.LayerGroup {
  const { circularNodes, materialFlows, aquacultureSites, country } = opts

  const aquacultureByRef = new Map<string, LngLat>()
  for (const site of aquacultureSites) {
    aquacultureByRef.set(normalizeKey(site.name), site.coordinates)
  }

  const lookups: FlowCoordLookups = {
    curated: buildCuratedLookup(circularNodes),
    aquacultureByRef,
  }

  // kind lookup keyed by the loop-scoped curated key (`loopId::nodeId`).
  const kindByKey = new Map<string, string>()
  for (const f of circularNodes.features) {
    const props = f.properties as { key?: string; kind?: string } | null
    if (props?.key && props.kind) kindByKey.set(props.key, props.kind)
  }

  const loops = materialFlows.loops.filter((l) => loopShown(l.loopId, country))
  const resolved = resolveFlowCoordinates(loops, lookups)

  // Index for edge endpoint lookup: `${loopId}::${nodeId}` → resolved node.
  const byKey = new Map<string, ResolvedFlowNode>()
  for (const r of resolved) byKey.set(`${r.loopId}::${r.nodeId}`, r)

  const group = L.layerGroup()

  // Polylines first (under markers): edges with both endpoints placed.
  for (const loop of loops) {
    for (const edge of loop.edges) {
      const from = byKey.get(`${loop.loopId}::${edge.fromId}`)
      const to = byKey.get(`${loop.loopId}::${edge.toId}`)
      if (!from?.coord || !to?.coord) continue
      const color = EVIDENCE_LINE_COLORS[edge.evidenceStatus] ?? EVIDENCE_LINE_COLORS.illustrative
      const line = L.polyline(
        [
          [from.coord[1], from.coord[0]],
          [to.coord[1], to.coord[0]],
        ],
        {
          color,
          weight: 2,
          opacity: 0.8,
          ...(edge.evidenceStatus === 'illustrative' ? { dashArray: '5 5' } : {}),
        },
      )
      const sources = edge.sourceRefs.map((s) => esc(s.label ?? '')).filter(Boolean).join(', ')
      line.bindPopup(`
        <div style="min-width:200px">
          <strong>${esc(edge.material)}</strong>
          ${edge.process ? `<br/><small>Prosess: ${esc(edge.process)}</small>` : ''}
          ${edge.rLevel ? `<br/><small>R-nivå: ${esc(edge.rLevel)}</small>` : ''}
          <br/><small style="color:${color}">● ${EVIDENCE_LABELS[edge.evidenceStatus] ?? edge.evidenceStatus}</small>
          ${sources ? `<br/><small>Kilder: ${sources}</small>` : ''}
        </div>
      `)
      line.addTo(group)
    }
  }

  // Markers: placed nodes (skip unknown).
  for (const r of resolved) {
    if (!r.coord || r.precision === 'unknown') continue
    const style = PRECISION_STYLE[r.precision]
    const marker = L.circleMarker([r.coord[1], r.coord[0]], {
      radius: 7,
      fillColor: style.color,
      color: '#fff',
      weight: 2,
      fillOpacity: 0.9,
      ...(style.dashArray ? { dashArray: style.dashArray } : {}),
    })
    const kind = kindByKey.get(`${r.loopId}::${r.nodeId}`)
    const kindLabel = kind ? KIND_LABELS[kind] ?? '' : ''
    marker.bindPopup(`
      <div style="min-width:200px">
        <strong>${esc(r.label)}</strong>
        ${kindLabel ? `<br/><small>${kindLabel}</small>` : ''}
        <br/><small style="color:${style.color}">● ${style.label}</small>
        ${r.source ? `<br/><small>Kilde: ${esc(r.source)}</small>` : ''}
      </div>
    `)
    marker.addTo(group)
  }

  return group
}
