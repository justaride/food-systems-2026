'use client'

import { Sankey, Tooltip, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'

const DATA = {
  nodes: [
    { name: 'Kornproduksjon' },
    { name: 'Kj\u00F8ttproduksjon' },
    { name: 'Meieriproduksjon' },
    { name: 'Frukt & gr\u00F8nt' },
    { name: 'Havbruk' },
    { name: 'Fiskeri' },
    { name: 'Import' },
    { name: 'Innenlands forbruk' },
    { name: 'Sj\u00F8mateksport' },
  ],
  links: [
    { source: 0, target: 7, value: 1184 },
    { source: 1, target: 7, value: 357 },
    { source: 2, target: 7, value: 1524 },
    { source: 3, target: 7, value: 232 },
    { source: 4, target: 8, value: 1100 },
    { source: 4, target: 7, value: 200 },
    { source: 5, target: 8, value: 1300 },
    { source: 5, target: 7, value: 200 },
    { source: 6, target: 7, value: 517 },
  ],
}

const COLORS = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#0891B2', '#2563EB', '#8B5CF6', '#57534e', '#0D9488']

export function FoodFlowSankey() {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-stone-700 mb-0.5">Matflyt Norge (2024-estimat)</h3>
      <p className="text-xs text-stone-400 mb-3">Produksjon, import og eksport i 1000 tonn</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={DATA}
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
                      <p>{DATA.nodes[d.source]?.name} &rarr; {DATA.nodes[d.target]?.name}</p>
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
    </Card>
  )
}
