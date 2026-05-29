'use client'

import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { EmptyState } from '@/components/ui/EmptyState'
import type { SankeyData } from '@/lib/flows/adapter'

export function FlowSankey({ data }: { data: SankeyData }) {
  if (data.links.length < 2) {
    return <EmptyState message="For få kvantifiserte kanter til et Sankey-diagram" />
  }
  return (
    <div className="h-[320px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} initialDimension={{ width: 720, height: 360 }}>
        <Sankey
          data={data}
          nodeWidth={10}
          nodePadding={14}
          margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
          link={{ stroke: '#d6d3d1', strokeOpacity: 0.4 }}
          node={{ fill: '#57534e', opacity: 0.9 }}
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
                    <p className="font-medium">{d.value?.toLocaleString()}</p>
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
  )
}
