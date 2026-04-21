'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// react-force-graph-2d bruker window — må lastes kun på klient
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px] text-sm text-stone-500">
      Laster nettverksgraf…
    </div>
  ),
})

type RelationshipRow = {
  id: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: number | null
  source: string | null
  fromCompany: {
    id: string
    name: string
  }
  toCompany: {
    id: string
    name: string
  }
  selfDealing: boolean
}

type Props = {
  relationships: RelationshipRow[]
}

const TYPE_LABELS: Record<string, string> = {
  supplier: 'Leverandør',
  buyer: 'Kjøper',
  distributor: 'Distributør',
  franchisor: 'Franchise',
  'self-dealing': 'Selvhandel',
  'joint-venture': 'Joint venture',
}

// Matcher TYPE_STYLES i RelasjonerContent (samme paletter)
const LINK_COLORS: Record<string, string> = {
  supplier: '#10b981', // emerald-500
  buyer: '#3b82f6', // blue-500
  distributor: '#a855f7', // purple-500
  franchisor: '#f59e0b', // amber-500
  'self-dealing': '#f43f5e', // rose-500
  'joint-venture': '#f97316', // orange-500
}

const SECTOR_COLORS: string[] = [
  '#0ea5e9', // sky-500
  '#22c55e', // green-500
  '#eab308', // yellow-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#84cc16', // lime-500
]

const NODE_DEFAULT_COLOR = '#78716c' // stone-500

type GraphNode = {
  id: string
  name: string
  sector: string | null
  degree: number
}

type GraphLink = {
  source: string
  target: string
  relationshipType: string
  sector: string | null
  description: string | null
  id: string
}

function formatNOK(value: number | null) {
  if (value == null || value === 0) return '—'
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)} mrd NOK`
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} MNOK`
  return `${Math.round(value).toLocaleString('no')} NOK`
}

export function RelationshipNetworkGraph({ relationships }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    if (!containerRef.current) return
    const el = containerRef.current
    const update = () => {
      setDimensions({
        width: el.clientWidth,
        height: 600,
      })
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const { graphData, sectorColorMap } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>()
    const links: GraphLink[] = []
    const sectorSet = new Set<string>()

    for (const r of relationships) {
      const fromId = r.fromCompany.id
      const toId = r.toCompany.id

      if (!nodeMap.has(fromId)) {
        nodeMap.set(fromId, {
          id: fromId,
          name: r.fromCompany.name,
          sector: r.sector,
          degree: 0,
        })
      }
      if (!nodeMap.has(toId)) {
        nodeMap.set(toId, {
          id: toId,
          name: r.toCompany.name,
          sector: r.sector,
          degree: 0,
        })
      }

      const fromNode = nodeMap.get(fromId)!
      const toNode = nodeMap.get(toId)!
      fromNode.degree += 1
      toNode.degree += 1
      if (r.sector) sectorSet.add(r.sector)

      links.push({
        id: r.id,
        source: fromId,
        target: toId,
        relationshipType: r.relationshipType,
        sector: r.sector,
        description: r.description,
      })
    }

    const sectors = Array.from(sectorSet).sort()
    const colorMap: Record<string, string> = {}
    sectors.forEach((s, i) => {
      colorMap[s] = SECTOR_COLORS[i % SECTOR_COLORS.length]
    })

    return {
      graphData: {
        nodes: Array.from(nodeMap.values()),
        links,
      },
      sectorColorMap: colorMap,
    }
  }, [relationships])

  const nodeLabel = useCallback(
    // @ts-expect-error react-force-graph-2d har løse typer for accessors
    (node) => {
      const n = node as GraphNode
      return `<div style="background:#1c1917;color:#fafaf9;padding:4px 8px;border-radius:6px;font-size:12px;">
        <strong>${n.name}</strong><br/>
        ${n.sector ? `Sektor: ${n.sector}<br/>` : ''}
        Relasjoner: ${n.degree}
      </div>`
    },
    []
  )

  const linkLabel = useCallback(
    // @ts-expect-error react-force-graph-2d har løse typer for accessors
    (link) => {
      const l = link as GraphLink & { estimatedValue?: number | null }
      const rel = relationships.find(r => r.id === l.id)
      const typeLabel = TYPE_LABELS[l.relationshipType] ?? l.relationshipType
      const value = rel ? formatNOK(rel.estimatedValue) : '—'
      return `<div style="background:#1c1917;color:#fafaf9;padding:4px 8px;border-radius:6px;font-size:12px;">
        <strong>${typeLabel}</strong><br/>
        ${l.description ?? ''}${l.description ? '<br/>' : ''}
        Verdi: ${value}
      </div>`
    },
    [relationships]
  )

  // @ts-expect-error accessor mottar NodeObject-variant; vi peker bare på node.sector
  const nodeColor = useCallback((node) => {
    const sector = (node as GraphNode).sector
    if (sector && sectorColorMap[sector]) return sectorColorMap[sector]
    return NODE_DEFAULT_COLOR
  }, [sectorColorMap])

  // @ts-expect-error accessor mottar LinkObject-variant; vi leser relationshipType
  const linkColor = useCallback((link) => {
    return LINK_COLORS[(link as GraphLink).relationshipType] ?? '#d6d3d1'
  }, [])

  // @ts-expect-error accessor mottar NodeObject-variant; degree er custom felt
  const nodeVal = useCallback((node) => {
    return Math.max(2, Math.min(10, (node as GraphNode).degree))
  }, [])

  const sectorLegend = Object.entries(sectorColorMap)
  const typeLegend = Object.entries(LINK_COLORS).filter(([type]) =>
    relationships.some(r => r.relationshipType === type)
  )

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="rounded-xl border border-stone-200 bg-stone-50/60 overflow-hidden"
        style={{ height: 600 }}
      >
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel={nodeLabel}
          linkLabel={linkLabel}
          nodeColor={nodeColor}
          linkColor={linkColor}
          nodeVal={nodeVal}
          nodeRelSize={4}
          linkWidth={1.2}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.08}
          backgroundColor="#fafaf9"
          cooldownTicks={120}
          warmupTicks={40}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node: any, ctx, globalScale) => {
            const label: string =
              node.name?.length > 22 ? node.name.slice(0, 22) + '…' : node.name ?? ''
            const fontSize = Math.max(3, 10 / globalScale)
            ctx.font = `${fontSize}px sans-serif`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillStyle = '#44403c'
            const r = Math.max(2, Math.min(10, node.degree ?? 2))
            ctx.fillText(label, node.x, node.y + r + 1)
          }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-stone-500">
        {typeLegend.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="uppercase tracking-wider text-stone-400">Relasjonstype</span>
            {typeLegend.map(([type, color]) => (
              <span key={type} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-[2px]"
                  style={{ backgroundColor: color }}
                />
                <span>{TYPE_LABELS[type] ?? type}</span>
              </span>
            ))}
          </div>
        )}
        {sectorLegend.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="uppercase tracking-wider text-stone-400">Sektor</span>
            {sectorLegend.map(([sector, color]) => (
              <span key={sector} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span>{sector}</span>
              </span>
            ))}
          </div>
        )}
        <div className="text-stone-400">
          {graphData.nodes.length} noder, {graphData.links.length} relasjoner
        </div>
      </div>
    </div>
  )
}
