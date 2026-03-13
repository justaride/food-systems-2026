import { Card } from '@/components/ui/Card'
import { KnowledgeGraph } from '@/components/charts/KnowledgeGraph'
import { getFullGraph } from '@/lib/queries/graph'

export default async function GrafPage() {
  const { nodes, edges } = await getFullGraph()

  const typeCounts = nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Kunnskapsgraf</h1>
        <p className="text-sm text-stone-400 mt-1">
          Kryssreferanser mellom dokumenter, innsikt, masteroppgaver og selskaper
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(typeCounts).map(([type, count]) => (
          <Card key={type}>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider">{type}</p>
            <p className="text-xl font-bold text-stone-900 mt-1">{count}</p>
          </Card>
        ))}
        <Card>
          <p className="text-[10px] text-stone-400 uppercase tracking-wider">Kanter</p>
          <p className="text-xl font-bold text-stone-900 mt-1">{edges.length}</p>
        </Card>
      </div>

      <Card title="Interaktiv graf">
        <KnowledgeGraph nodes={nodes} edges={edges} />
      </Card>
    </div>
  )
}
