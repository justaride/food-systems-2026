'use client'

import { useEffect, useState } from 'react'
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { ChartSource } from '@/components/ui/ChartSource'
import { EmptyState } from '@/components/ui/EmptyState'

type SankeyData = {
  nodes: { name: string }[]
  links: { source: number; target: number; value: number }[]
}

type ValueChainStep = {
  id: string
  name: string
  volume_tonnes?: number | null
  breakdown?: Record<string, unknown>
  import_tonnes?: number | null
  export_tonnes?: number | null
  waste_tonnes?: number | null
  circularity?: Record<string, unknown>
  market_value_bn?: number | null
  market_value_bn_sek?: number | null
}

type ValueChainData = {
  country: string
  year: number
  steps: ValueChainStep[]
}

const COUNTRY_LABELS: Record<string, string> = {
  no: 'Norge',
  se: 'Sverige',
  dk: 'Danmark',
  fi: 'Finland',
  is: 'Island',
}

function buildSankeyData(vc: ValueChainData): SankeyData | null {
  const country = vc.country
  const nodes: { name: string }[] = []
  const links: { source: number; target: number; value: number }[] = []

  const addNode = (name: string): number => {
    const idx = nodes.findIndex((n) => n.name === name)
    if (idx >= 0) return idx
    nodes.push({ name })
    return nodes.length - 1
  }

  const primary = vc.steps.find((s) => s.id === 'primary')
  const seafood = vc.steps.find((s) => s.id === 'seafood')
  const processing = vc.steps.find((s) => s.id === 'processing')
  const retail = vc.steps.find((s) => s.id === 'retail')
  const household = vc.steps.find((s) => s.id === 'household')
  const waste = vc.steps.find((s) => s.id === 'waste')

  const domesticIdx = addNode('Innenlands forbruk')

  if (country === 'no') {
    const b = primary?.breakdown as Record<string, number> | undefined
    if (b) {
      if (b.grain_tonnes) {
        const idx = addNode('Kornproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.grain_tonnes / 1000) })
      }
      if (b.meat_tonnes) {
        const idx = addNode('Kjøttproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.meat_tonnes / 1000) })
      }
      if (b.milk_tonnes) {
        const idx = addNode('Meieriproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.milk_tonnes / 1000) })
      }
      if (b.fruit_veg_tonnes) {
        const idx = addNode('Frukt & grønt')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.fruit_veg_tonnes / 1000) })
      }
    }
    if (seafood) {
      const sb = seafood.breakdown as Record<string, number> | undefined
      if (sb?.aquaculture_tonnes) {
        const exportIdx = addNode('Sjømateksport')
        const aqIdx = addNode('Havbruk')
        const exportShare = Math.round((sb.aquaculture_tonnes * 0.95) / 1000)
        const domesticShare = Math.round((sb.aquaculture_tonnes * 0.05) / 1000)
        links.push({ source: aqIdx, target: exportIdx, value: exportShare })
        links.push({ source: aqIdx, target: domesticIdx, value: domesticShare })
      }
      if (sb?.fisheries_tonnes) {
        const exportIdx = addNode('Sjømateksport')
        const fishIdx = addNode('Fiskeri')
        const exportShare = Math.round((sb.fisheries_tonnes * 0.95) / 1000)
        const domesticShare = Math.round((sb.fisheries_tonnes * 0.05) / 1000)
        links.push({ source: fishIdx, target: exportIdx, value: exportShare })
        links.push({ source: fishIdx, target: domesticIdx, value: domesticShare })
      }
    }
    if (primary?.import_tonnes) {
      const importIdx = addNode('Import')
      links.push({ source: importIdx, target: domesticIdx, value: Math.round(primary.import_tonnes / 1000) })
    }
  } else if (country === 'dk') {
    const b = primary?.breakdown as Record<string, number> | undefined
    if (b) {
      const exportIdx = addNode('Fødevareeksport')
      if (b.grain_tonnes) {
        const idx = addNode('Kornproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.grain_tonnes * 0.4 / 1000) })
        links.push({ source: idx, target: exportIdx, value: Math.round(b.grain_tonnes * 0.6 / 1000) })
      }
      if (b.pork_tonnes) {
        const idx = addNode('Svineproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.pork_tonnes * 0.1 / 1000) })
        links.push({ source: idx, target: exportIdx, value: Math.round(b.pork_tonnes * 0.9 / 1000) })
      }
      if (b.dairy_tonnes) {
        const idx = addNode('Meieriproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.dairy_tonnes * 0.3 / 1000) })
        links.push({ source: idx, target: exportIdx, value: Math.round(b.dairy_tonnes * 0.7 / 1000) })
      }
    }
  } else if (country === 'se') {
    const b = primary?.breakdown as Record<string, number> | undefined
    if (b?.grain_tonnes) {
      const idx = addNode('Kornproduksjon')
      links.push({ source: idx, target: domesticIdx, value: Math.round(b.grain_tonnes / 1000) })
    }
  } else if (country === 'fi') {
    const b = primary?.breakdown as Record<string, number> | undefined
    if (b) {
      if (b.oats_tonnes) {
        const idx = addNode('Havre')
        const exportIdx = addNode('Korneksport')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.oats_tonnes * 0.6 / 1000) })
        links.push({ source: idx, target: exportIdx, value: Math.round(b.oats_tonnes * 0.4 / 1000) })
      }
      if (b.barley_tonnes) {
        const idx = addNode('Bygg')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.barley_tonnes / 1000) })
      }
      if (b.wheat_tonnes) {
        const idx = addNode('Hvete')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.wheat_tonnes / 1000) })
      }
      if (b.meat_tonnes) {
        const idx = addNode('Kjøttproduksjon')
        links.push({ source: idx, target: domesticIdx, value: Math.round(b.meat_tonnes / 1000) })
      }
    }
  }

  if (household?.waste_tonnes) {
    const wasteIdx = addNode('Matsvinn')
    links.push({ source: domesticIdx, target: wasteIdx, value: Math.round(household.waste_tonnes / 1000) })
  }

  const wasteCirc = waste?.circularity as Record<string, number> | undefined
  if (wasteCirc?.biogas_gwh && household?.waste_tonnes) {
    const biogasIdx = addNode('Biogass')
    const wasteIdx = nodes.findIndex((n) => n.name === 'Matsvinn')
    if (wasteIdx >= 0) {
      const biogasShare = Math.max(10, Math.round(household.waste_tonnes * 0.15 / 1000))
      links.push({ source: wasteIdx, target: biogasIdx, value: biogasShare })
    }
  }

  if (links.length < 2) return null
  return { nodes, links }
}

export function FoodFlowSankey({ country = 'no' }: { country?: string }) {
  const [data, setData] = useState<SankeyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sources, setSources] = useState('')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: re-show loading on country change before fetch
    setLoading(true)
    fetch(`/data/food-systems/${country}/value-chain.json`)
      .then((r) => r.json())
      .then((vc: ValueChainData) => {
        const sankey = buildSankeyData(vc)
        setData(sankey)
        const srcList = vc.steps
          .flatMap((s) => ('sources' in s && Array.isArray(s.sources) ? (s.sources as string[]) : []))
          .filter((v, i, a) => a.indexOf(v) === i)
          .slice(0, 5)
        setSources(`Kilde: ${srcList.join(', ')} ${vc.year}`)
        setLoading(false)
      })
      .catch(() => {
        setData(null)
        setLoading(false)
      })
  }, [country])

  const label = COUNTRY_LABELS[country] ?? country.toUpperCase()

  if (loading) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Matflyt {label}</h3>
        <div className="py-8 text-center text-sm text-stone-400">Laster...</div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Matflyt {label}</h3>
        <EmptyState message={`Utilstrekkelig data for matflytdiagram (${label})`} />
      </Card>
    )
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Matflyt {label} (2024-estimat)</h3>
      <p className="text-xs text-stone-400 mb-3">Produksjon, import og eksport i 1000 tonn</p>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodeWidth={10}
            nodePadding={14}
            margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            link={{ stroke: '#d6d3d1', strokeOpacity: 0.4 }}
            node={{
              fill: '#57534e',
              opacity: 0.9,
            }}
          >
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0]?.payload
                if (!d) return null
                if (d.source !== undefined && d.target !== undefined) {
                  return (
                    <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                      <p>{data.nodes[d.source]?.name} &rarr; {data.nodes[d.target]?.name}</p>
                      <p className="font-medium">{d.value?.toLocaleString()} kt</p>
                    </div>
                  )
                }
                return (
                  <div className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs shadow-sm">
                    <p className="font-medium">{d.name}</p>
                  </div>
                )
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <ChartSource source={sources} />
    </Card>
  )
}
