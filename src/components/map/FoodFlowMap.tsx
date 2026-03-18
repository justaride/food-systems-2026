'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useMapContext } from '@/lib/map/MapContext'

type FlowRecord = {
  source: string
  target: string
  value: number
  label?: string
  note?: string
}

type FlowDataset = {
  country: string
  title: string
  description: string
  unit: string
  flows: FlowRecord[]
}

type FlowNode = {
  id: string
  name: string
  kind: 'port' | 'hub'
  coordinates: [number, number]
  label: string
}

type Point = { x: number; y: number }
type MapBounds = {
  minLng: number
  maxLng: number
  minLat: number
  maxLat: number
}
type LabelPlacement = {
  nodeId: string
  side: 'left' | 'right'
  x: number
  y: number
  width: number
  height: number
  detailY: number
  textAnchor: 'start' | 'end'
}

const SVG_WIDTH = 1000
const SVG_HEIGHT = 1400
const PADDING = 84
const DEFAULT_BOUNDS: MapBounds = {
  minLng: 4.5,
  maxLng: 32.5,
  minLat: 57.5,
  maxLat: 71.7,
}
const LABEL_HEIGHT = 44
const LABEL_GAP = 14
const LABEL_MARGIN_TOP = 42
const LABEL_MARGIN_BOTTOM = 136

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function createBounds(nodes: FlowNode[]): MapBounds {
  if (nodes.length === 0) return DEFAULT_BOUNDS

  let minLng = Infinity
  let maxLng = -Infinity
  let minLat = Infinity
  let maxLat = -Infinity

  for (const node of nodes) {
    const [lng, lat] = node.coordinates
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
  }

  const lngSpan = Math.max(maxLng - minLng, 4.5)
  const latSpan = Math.max(maxLat - minLat, 5.5)
  const lngPadding = lngSpan * 0.18
  const latPadding = latSpan * 0.22

  return {
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
  }
}

function project([lng, lat]: [number, number], bounds: MapBounds): Point {
  const x = PADDING + ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * (SVG_WIDTH - PADDING * 2)
  const y = PADDING + (1 - (lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * (SVG_HEIGHT - PADDING * 2)
  return {
    x: clamp(x, PADDING, SVG_WIDTH - PADDING),
    y: clamp(y, PADDING, SVG_HEIGHT - PADDING),
  }
}

function pathBetween(from: Point, to: Point) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const bend = clamp(Math.abs(dx) * 0.18 + Math.abs(dy) * 0.08, 36, 120)
  const c1x = from.x + dx * 0.25
  const c1y = from.y - bend
  const c2x = from.x + dx * 0.75
  const c2y = to.y - bend * 0.3
  return `M ${from.x.toFixed(1)} ${from.y.toFixed(1)} C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${to.x.toFixed(1)} ${to.y.toFixed(1)}`
}

function formatValue(value: number) {
  return new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 }).format(value)
}

function kindLabel(kind: FlowNode['kind']) {
  return kind === 'port' ? 'Havn' : 'Hub'
}

function kindStyles(kind: FlowNode['kind']) {
  return kind === 'port'
    ? { ring: 'stroke-sky-500', core: 'fill-sky-500', halo: '#0EA5E9' }
    : { ring: 'stroke-emerald-500', core: 'fill-emerald-500', halo: '#10B981' }
}

function estimateLabelWidth(node: Pick<FlowNode, 'name' | 'label' | 'kind'>) {
  const primary = node.name.length * 9.2
  const secondary = `${node.label} · ${kindLabel(node.kind)}`.length * 6.6
  return clamp(Math.max(primary, secondary) + 22, 132, 220)
}

function layoutLabels(nodes: Array<FlowNode & Point & { radius: number; degree: number }>): Map<string, LabelPlacement> {
  const placementsById = new Map<string, LabelPlacement>()
  const placedBySide: Record<'left' | 'right', LabelPlacement[]> = { left: [], right: [] }

  const sortedNodes = [...nodes].sort((a, b) => a.y - b.y)

  for (const [index, node] of sortedNodes.entries()) {
    const centered = node.x > SVG_WIDTH * 0.36 && node.x < SVG_WIDTH * 0.68
    const side: 'left' | 'right' =
      centered ? (index % 2 === 0 ? 'right' : 'left') : (node.x < SVG_WIDTH / 2 ? 'right' : 'left')

    const width = estimateLabelWidth(node)
    const anchorX = node.x + (side === 'right' ? 22 : -22)
    const x = side === 'right' ? anchorX : anchorX - width
    let y = clamp(
      node.y + (node.kind === 'port' ? -18 : 16) - LABEL_HEIGHT / 2,
      LABEL_MARGIN_TOP,
      SVG_HEIGHT - LABEL_MARGIN_BOTTOM - LABEL_HEIGHT
    )

    const previous = placedBySide[side]
    for (const prior of previous) {
      const overlapsVertically = y < prior.y + prior.height + LABEL_GAP && y + LABEL_HEIGHT > prior.y - LABEL_GAP
      const overlapsHorizontally = x < prior.x + prior.width + 16 && x + width > prior.x - 16
      if (overlapsVertically && overlapsHorizontally) {
        y = prior.y + prior.height + LABEL_GAP
      }
    }

    previous.push({
      nodeId: node.id,
      side,
      x,
      y,
      width,
      height: LABEL_HEIGHT,
      detailY: y + 28,
      textAnchor: side === 'right' ? 'start' : 'end',
    })
  }

  for (const side of ['left', 'right'] as const) {
    const sidePlacements = placedBySide[side]
    const overflow = sidePlacements.at(-1)
      ? sidePlacements[sidePlacements.length - 1].y + LABEL_HEIGHT - (SVG_HEIGHT - LABEL_MARGIN_BOTTOM)
      : 0

    if (overflow > 0) {
      let remainingOverflow = overflow
      for (let index = sidePlacements.length - 1; index >= 0; index -= 1) {
        const current = sidePlacements[index]
        const previousBottom = index === 0 ? LABEL_MARGIN_TOP : sidePlacements[index - 1].y + LABEL_HEIGHT + LABEL_GAP
        const availableShift = current.y - previousBottom
        const shift = Math.min(availableShift, remainingOverflow)
        current.y -= shift
        current.detailY -= shift
        remainingOverflow -= shift
      }
    }

    for (const placement of sidePlacements) {
      placementsById.set(placement.nodeId, placement)
    }
  }

  return placementsById
}

export default function FoodFlowMap() {
  const { country, countryConfig, ports, logisticsHubs, isLoading, error } = useMapContext()
  const [dataset, setDataset] = useState<FlowDataset | null>(null)
  const [datasetError, setDatasetError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    if (country !== 'no') {
      setDataset(null)
      setDatasetError(null)
      return
    }

    setDataset(null)
    setDatasetError(null)

    fetch('/data/food-systems/no/flows.json')
      .then(async response => {
        if (!response.ok) {
          throw new Error(`Kunne ikke laste flowdata (${response.status})`)
        }
        return response.json()
      })
      .then((json: FlowDataset) => {
        if (mounted) setDataset(json)
      })
      .catch(err => {
        if (mounted) setDatasetError(err instanceof Error ? err.message : 'Kunne ikke laste flowdata')
      })

    return () => {
      mounted = false
    }
  }, [country])

  const activeNodes = useMemo(() => {
    const flowIds = new Set<string>()
    for (const flow of dataset?.flows ?? []) {
      flowIds.add(flow.source)
      flowIds.add(flow.target)
    }

    const nodeIndex = new Map<string, FlowNode>()
    for (const port of ports) {
      if (flowIds.size > 0 && !flowIds.has(port.id)) continue
      nodeIndex.set(port.id, {
        id: port.id,
        name: port.name,
        kind: 'port',
        coordinates: port.coordinates,
        label: port.region || port.type,
      })
    }
    for (const hub of logisticsHubs) {
      if (flowIds.size > 0 && !flowIds.has(hub.id)) continue
      nodeIndex.set(hub.id, {
        id: hub.id,
        name: hub.name,
        kind: 'hub',
        coordinates: hub.coordinates,
        label: hub.role || hub.city || hub.owner || hub.type,
      })
    }
    return [...nodeIndex.values()]
  }, [ports, logisticsHubs, dataset?.flows])

  const nodeLookup = useMemo(() => new Map(activeNodes.map(node => [node.id, node] as const)), [activeNodes])
  const mapBounds = useMemo(() => createBounds(activeNodes), [activeNodes])

  const degreeCounts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const flow of dataset?.flows ?? []) {
      counts.set(flow.source, (counts.get(flow.source) ?? 0) + 1)
      counts.set(flow.target, (counts.get(flow.target) ?? 0) + 1)
    }
    return counts
  }, [dataset?.flows])

  const edges = useMemo(() => {
    return (dataset?.flows ?? [])
      .map(flow => {
        const source = nodeLookup.get(flow.source)
        const target = nodeLookup.get(flow.target)
        if (!source || !target) return null

        const from = project(source.coordinates, mapBounds)
        const to = project(target.coordinates, mapBounds)
        return {
          ...flow,
          source,
          target,
          from,
          to,
          path: pathBetween(from, to),
          width: clamp(1.5 + flow.value / 35, 2, 6),
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
  }, [dataset?.flows, mapBounds, nodeLookup])

  const nodePositions = useMemo(() => {
    return activeNodes.map(node => {
      const projected = project(node.coordinates, mapBounds)
      const degree = degreeCounts.get(node.id) ?? 0
      const radius = node.kind === 'hub'
        ? clamp(7 + degree * 1.1, 7, 16)
        : clamp(6 + degree * 0.9, 6, 14)
      return { ...node, ...projected, radius, degree }
    })
  }, [activeNodes, degreeCounts, mapBounds])
  const labelPlacements = useMemo(() => layoutLabels(nodePositions), [nodePositions])

  const selectedCountryName = countryConfig?.name ?? 'Norge'

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-stone-600">Laster data for flowprototypen...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center">
          <h2 className="text-lg font-semibold text-amber-900">Kartdata ikke tilgjengelig</h2>
          <p className="mt-2 text-sm text-amber-800">{error}</p>
        </div>
      </div>
    )
  }

  if (country !== 'no') {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            Foreløpig bare Norge
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-stone-900">Flowdata finnes ikke for {selectedCountryName}</h1>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Denne prototypen bruker kuraterte origin-destination-kanter mellom norske havner og logistikkhub-er.
            Vi har ikke lagt inn tilsvarende data for andre land ennå.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={`/kart/${country}`}
              className="inline-flex items-center justify-center rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-stone-800"
            >
              Tilbake til kartet
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="rounded-2xl border border-stone-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-stone-600">Laster kuraterte flowkanter...</p>
          </div>
          {datasetError ? <p className="mt-3 text-sm text-rose-600">{datasetError}</p> : null}
        </div>
      </div>
    )
  }

  const portCount = activeNodes.filter(node => node.kind === 'port').length
  const hubCount = activeNodes.filter(node => node.kind === 'hub').length

  return (
    <div className="h-full w-full px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-col gap-3 rounded-3xl border border-stone-200 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
                Norway-first prototype
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
                {dataset.title}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-stone-600">
                {dataset.description} Edges and node positions are hand-curated from public Norwegian port and logistics hub IDs.
                Volumes are illustrative, not observed tonnage.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-600">
                {flowsSummary(dataset.flows.length)}
              </span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-600">
                {portCount} havner
              </span>
              <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 font-medium text-stone-600">
                {hubCount} hub-er
              </span>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_300px]">
          <div className="relative min-h-[620px] overflow-hidden rounded-[28px] border border-stone-200 bg-[radial-gradient(circle_at_top,rgba(236,253,245,0.9)_0%,rgba(250,250,249,1)_45%,rgba(244,244,245,1)_100%)] shadow-sm">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_28%)]" />
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
              aria-label="Schematic flow map of Norwegian seafood and grocery logistics"
              role="img"
            >
              <defs>
                <linearGradient id="flowStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.58" />
                </linearGradient>
                <marker id="arrowHead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#0F766E" fillOpacity="0.65" />
                </marker>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#d6d3d1" strokeOpacity="0.35" strokeWidth="1" />
                </pattern>
              </defs>

              <rect x="0" y="0" width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#grid)" opacity="0.55" />

              <g stroke="#a8a29e" strokeOpacity="0.28" strokeWidth="1">
                <line x1="80" y1="240" x2="920" y2="240" />
                <line x1="80" y1="500" x2="920" y2="500" />
                <line x1="80" y1="760" x2="920" y2="760" />
                <line x1="80" y1="1020" x2="920" y2="1020" />
              </g>

              {edges.map(edge => (
                <path
                  key={`${edge.source.id}-${edge.target.id}`}
                  d={edge.path}
                  fill="none"
                  stroke="url(#flowStroke)"
                  strokeWidth={edge.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd="url(#arrowHead)"
                  opacity="0.95"
                >
                  <title>
                    {edge.source.name} → {edge.target.name}
                    {edge.label ? ` · ${edge.label}` : ''}
                    {edge.note ? ` · ${edge.note}` : ''}
                  </title>
                </path>
              ))}

              {nodePositions.map(node => {
                const styles = kindStyles(node.kind)
                return (
                  <g key={node.id} transform={`translate(${node.x.toFixed(1)} ${node.y.toFixed(1)})`}>
                    <circle r={node.radius + 9} fill={styles.halo} opacity="0.14" />
                    <circle r={node.radius} fill="white" strokeWidth="2.5" className={styles.ring} />
                    <circle r={Math.max(node.radius - 2.5, 2)} className={styles.core} opacity="0.9" />
                    <title>
                      {node.name} ({kindLabel(node.kind)})
                      {node.label ? ` · ${node.label}` : ''}
                    </title>
                  </g>
                )
              })}

              {nodePositions.map(node => {
                const placement = labelPlacements.get(node.id)
                if (!placement) return null
                const textX = placement.side === 'right' ? placement.x + 12 : placement.x + placement.width - 12
                const connectorX = placement.side === 'right' ? placement.x : placement.x + placement.width
                const connectorY = placement.y + placement.height / 2
                return (
                  <g key={`${node.id}-label`}>
                    <path
                      d={`M ${node.x.toFixed(1)} ${node.y.toFixed(1)} L ${connectorX.toFixed(1)} ${connectorY.toFixed(1)}`}
                      fill="none"
                      stroke={node.kind === 'port' ? '#7DD3FC' : '#6EE7B7'}
                      strokeOpacity="0.8"
                      strokeWidth="1.5"
                    />
                    <rect
                      x={placement.x}
                      y={placement.y}
                      width={placement.width}
                      height={placement.height}
                      rx="14"
                      fill="rgba(255,255,255,0.92)"
                      stroke="rgba(231,229,228,0.95)"
                      strokeWidth="1"
                    />
                    <text
                      x={textX}
                      y={placement.y + 18}
                      textAnchor={placement.textAnchor}
                      className="fill-stone-800 text-[15px] font-semibold"
                      style={{ fontSize: 15 }}
                    >
                      {node.name}
                    </text>
                    <text
                      x={textX}
                      y={placement.detailY}
                      textAnchor={placement.textAnchor}
                      className="fill-stone-500 text-[11px]"
                      style={{ fontSize: 11 }}
                    >
                      {node.label} · {kindLabel(node.kind)}
                    </text>
                  </g>
                )
              })}
            </svg>

            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/70 bg-white/82 px-4 py-3 text-xs text-stone-600 shadow-sm backdrop-blur">
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                Havn
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Logistikkhub
              </span>
              <span className="ml-auto text-stone-500">
                Syntetiske kanter basert på norske node-ID-er
              </span>
            </div>
          </div>

          <aside className="flex min-h-0 flex-col rounded-[28px] border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="space-y-2 border-b border-stone-200 pb-4">
              <h2 className="text-lg font-semibold text-stone-900">Prototype-innsikt</h2>
              <p className="text-sm leading-6 text-stone-600">
                Edge-listen er liten med vilje. Den viser hvordan en senere `flowmap.gl`-integrasjon kan brukes for å sammenligne havn til hub-strømmer.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {edges
                .slice()
                .sort((a, b) => b.value - a.value)
                .slice(0, 7)
                .map(edge => (
                  <div key={`${edge.source.id}-${edge.target.id}`} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-900">
                          {edge.source.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {edge.source.label} → {edge.target.name}
                        </p>
                      </div>
                      <div className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-stone-700">
                        {formatValue(edge.value)} {dataset.unit}
                      </div>
                    </div>
                    {edge.label ? <p className="mt-2 text-xs text-stone-500">{edge.label}</p> : null}
                  </div>
                ))}
            </div>

            <div className="mt-auto border-t border-stone-200 pt-4 text-sm text-stone-600">
              <p className="font-medium text-stone-900">Datagrunnlag</p>
              <p className="mt-2 leading-6">
                {dataset.flows.length} kuraterte kanter fra offentlige norske node-ID-er. Dette er et prototypegrunnlag, ikke en målserie.
              </p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-stone-400">
                {dataset.country}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function flowsSummary(count: number) {
  return `${count} forbindelser`
}
